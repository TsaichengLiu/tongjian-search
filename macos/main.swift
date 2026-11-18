// 通檢 —— macOS 外殼：啟動本地 Python 服務，用 WKWebView 顯示界面
import Cocoa
import WebKit

let logURL: URL = {
    let dir = FileManager.default.homeDirectoryForCurrentUser.appendingPathComponent("Library/Logs")
    try? FileManager.default.createDirectory(at: dir, withIntermediateDirectories: true)
    return dir.appendingPathComponent("TongJian.log")
}()

func hex(_ v: UInt32, _ a: CGFloat = 1) -> NSColor {
    NSColor(srgbRed: CGFloat((v >> 16) & 0xFF) / 255, green: CGFloat((v >> 8) & 0xFF) / 255,
            blue: CGFloat(v & 0xFF) / 255, alpha: a)
}
// 與 app.css 的 --chrome 一致
let chromeColor = NSColor(name: nil) { ap in
    ap.bestMatch(from: [.darkAqua, .aqua]) == .darkAqua ? hex(0x22211F) : hex(0xEDEAE3)
}

final class AppDelegate: NSObject, NSApplicationDelegate, NSWindowDelegate,
                         WKScriptMessageHandler, WKNavigationDelegate, WKUIDelegate {
    var window: NSWindow!
    var web: WKWebView!
    var server: Process?
    var serverIn: Pipe?
    var quitting = false
    var loaded = false
    var buffer = ""
    let token = UUID().uuidString.replacingOccurrences(of: "-", with: "").lowercased()

    func applicationDidFinishLaunching(_ n: Notification) {
        buildMenu()
        buildWindow()
        startServer()
    }

    func applicationShouldTerminateAfterLastWindowClosed(_ s: NSApplication) -> Bool { true }

    func applicationWillTerminate(_ n: Notification) {
        quitting = true
        try? serverIn?.fileHandleForWriting.close()
        if let p = server, p.isRunning { p.terminate() }
    }

    // MARK: 窗口
    func buildWindow() {
        window = NSWindow(contentRect: NSRect(x: 0, y: 0, width: 1320, height: 840),
                          styleMask: [.titled, .closable, .miniaturizable, .resizable],
                          backing: .buffered, defer: false)
        window.title = "通檢"
        window.titlebarAppearsTransparent = true
        window.backgroundColor = chromeColor
        window.minSize = NSSize(width: 980, height: 620)
        window.delegate = self
        window.setFrameAutosaveName("TongJianMain")
        if !window.setFrameUsingName("TongJianMain") { window.center() }

        let cfg = WKWebViewConfiguration()
        cfg.userContentController.add(self, name: "tj")
        cfg.preferences.setValue(true, forKey: "developerExtrasEnabled")
        web = WKWebView(frame: window.contentView!.bounds, configuration: cfg)
        web.autoresizingMask = [.width, .height]
        web.navigationDelegate = self
        web.uiDelegate = self
        web.setValue(false, forKey: "drawsBackground")
        if #available(macOS 13.3, *) { web.isInspectable = true }
        window.contentView!.addSubview(web)
        window.makeKeyAndOrderFront(nil)
        NotificationCenter.default.addObserver(forName: NSWindow.didBecomeKeyNotification, object: window,
                                               queue: .main) { [weak self] _ in
            self?.web.evaluateJavaScript("window.TJNative && TJNative.focus()", completionHandler: nil)
        }
    }

    // MARK: 後台服務
    func findPython() -> String? {
        for p in ["/usr/bin/python3", "/opt/homebrew/bin/python3", "/usr/local/bin/python3",
                  "/opt/anaconda3/bin/python3"] where FileManager.default.isExecutableFile(atPath: p) {
            return p
        }
        return nil
    }

    func startServer() {
        guard let py = findPython() else {
            return fatal("找不到 Python 3。\n請在「終端」中運行 xcode-select --install 安裝命令行工具後再打開通檢。")
        }
        let res = Bundle.main.resourceURL!
        let p = Process()
        p.executableURL = URL(fileURLWithPath: py)
        p.arguments = ["-B", res.appendingPathComponent("app/server.py").path,
                       "--port", "5917", "--native", "--token", token,
                       "--helper", res.appendingPathComponent("bin/tjhelper").path]
        var env = ProcessInfo.processInfo.environment
        env["PYTHONDONTWRITEBYTECODE"] = "1"
        env["PYTHONIOENCODING"] = "utf-8"
        env["PYTHONUNBUFFERED"] = "1"
        env["MallocSpaceEfficient"] = "1"   // 不讓分配器囤積已釋放的大塊內存（實測 360 MB → 40 MB）
        p.environment = env
        let out = Pipe(), inp = Pipe()
        p.standardOutput = out
        p.standardInput = inp
        // 日誌超過 2 MB 時輪換，只保留上一份
        if let sz = (try? FileManager.default.attributesOfItem(atPath: logURL.path))?[.size] as? NSNumber,
           sz.intValue > 2 * 1024 * 1024 {
            let old = logURL.deletingPathExtension().appendingPathExtension("1.log")
            try? FileManager.default.removeItem(at: old)
            try? FileManager.default.moveItem(at: logURL, to: old)
        }
        if !FileManager.default.fileExists(atPath: logURL.path) {
            FileManager.default.createFile(atPath: logURL.path, contents: nil)
        }
        if let lh = try? FileHandle(forWritingTo: logURL) {
            lh.seekToEndOfFile()
            lh.write("\n=== \(Date()) 啟動 ===\n".data(using: .utf8)!)
            p.standardError = lh
        }
        serverIn = inp
        out.fileHandleForReading.readabilityHandler = { [weak self] h in
            let d = h.availableData
            if d.isEmpty { h.readabilityHandler = nil; return }
            guard let self = self, let s = String(data: d, encoding: .utf8) else { return }
            DispatchQueue.main.async { self.onServerOutput(s) }
        }
        p.terminationHandler = { [weak self] proc in
            DispatchQueue.main.async {
                guard let self = self, !self.quitting else { return }
                self.fatal("後台服務意外退出（代碼 \(proc.terminationStatus)）。\n詳情見 ~/Library/Logs/TongJian.log")
            }
        }
        do { try p.run() } catch { return fatal("無法啟動後台服務：\(error.localizedDescription)") }
        server = p
    }

    func onServerOutput(_ s: String) {
        guard !loaded else { return }
        buffer += s
        guard let r = buffer.range(of: "TONGJIAN_READY ") else { return }
        let rest = buffer[r.upperBound...]
        guard let nl = rest.firstIndex(of: "\n") else { return }
        let urlStr = rest[..<nl].trimmingCharacters(in: .whitespaces)
        if let url = URL(string: urlStr) {
            loaded = true
            web.load(URLRequest(url: url))
        }
    }

    func fatal(_ msg: String) {
        let a = NSAlert()
        a.messageText = "通檢無法啟動"
        a.informativeText = msg
        a.alertStyle = .critical
        a.addButton(withTitle: "退出")
        a.addButton(withTitle: "打開日誌")
        if a.runModal() == .alertSecondButtonReturn { NSWorkspace.shared.open(logURL) }
        NSApp.terminate(nil)
    }

    // MARK: JS 橋接
    func userContentController(_ uc: WKUserContentController, didReceive msg: WKScriptMessage) {
        guard let body = msg.body as? [String: Any], let cmd = body["cmd"] as? String else { return }
        let id = body["id"] as? Int ?? 0
        if cmd == "pickFolder" {
            let panel = NSOpenPanel()
            panel.canChooseFiles = false
            panel.canChooseDirectories = true
            panel.allowsMultipleSelection = false
            panel.canCreateDirectories = true
            panel.prompt = "選擇"
            panel.message = body["prompt"] as? String ?? ""
            panel.beginSheetModal(for: window) { resp in
                self.resolve(id, resp == .OK ? panel.url?.path : nil)
            }
        }
    }

    func resolve(_ id: Int, _ v: String?) {
        var arg = "null"
        if let v = v, let d = try? JSONSerialization.data(withJSONObject: [v]),
           let s = String(data: d, encoding: .utf8) { arg = s + "[0]" }
        web.evaluateJavaScript("TJNative.resolve(\(id), \(arg))", completionHandler: nil)
    }

    // 外部鏈接用默認瀏覽器打開
    func webView(_ w: WKWebView, decidePolicyFor a: WKNavigationAction,
                 decisionHandler: @escaping (WKNavigationActionPolicy) -> Void) {
        if let u = a.request.url, let host = u.host, host != "127.0.0.1", host != "localhost",
           a.targetFrame?.isMainFrame ?? true, u.scheme == "http" || u.scheme == "https" {
            NSWorkspace.shared.open(u)
            return decisionHandler(.cancel)
        }
        decisionHandler(.allow)
    }

    func webView(_ w: WKWebView, createWebViewWith c: WKWebViewConfiguration, for a: WKNavigationAction,
                 windowFeatures f: WKWindowFeatures) -> WKWebView? {
        if let u = a.request.url { NSWorkspace.shared.open(u) }
        return nil
    }

    func webViewWebContentProcessDidTerminate(_ w: WKWebView) { w.reload() }

    // MARK: 菜單
    @objc func reloadPage(_ s: Any?) { web.reload() }
    @objc func zoomIn(_ s: Any?) { web.pageZoom = min(2.0, web.pageZoom + 0.1) }
    @objc func zoomOut(_ s: Any?) { web.pageZoom = max(0.6, web.pageZoom - 0.1) }
    @objc func zoomReset(_ s: Any?) { web.pageZoom = 1.0 }
    @objc func showLog(_ s: Any?) { NSWorkspace.shared.open(logURL) }

    func buildMenu() {
        let main = NSMenu()
        func item(_ m: NSMenu, _ t: String, _ a: Selector?, _ k: String, _ mods: NSEvent.ModifierFlags = .command,
                  target: AnyObject? = nil) {
            let i = NSMenuItem(title: t, action: a, keyEquivalent: k)
            i.keyEquivalentModifierMask = mods
            if let target = target { i.target = target }
            m.addItem(i)
        }
        let appM = NSMenu()
        item(appM, "關於通檢", #selector(NSApplication.orderFrontStandardAboutPanel(_:)), "")
        appM.addItem(.separator())
        item(appM, "隱藏通檢", #selector(NSApplication.hide(_:)), "h")
        item(appM, "隱藏其他", #selector(NSApplication.hideOtherApplications(_:)), "h", [.command, .option])
        item(appM, "全部顯示", #selector(NSApplication.unhideAllApplications(_:)), "")
        appM.addItem(.separator())
        item(appM, "退出通檢", #selector(NSApplication.terminate(_:)), "q")
        let editM = NSMenu(title: "編輯")
        item(editM, "撤銷", Selector(("undo:")), "z")
        item(editM, "重做", Selector(("redo:")), "z", [.command, .shift])
        editM.addItem(.separator())
        item(editM, "剪切", #selector(NSText.cut(_:)), "x")
        item(editM, "拷貝", #selector(NSText.copy(_:)), "c")
        item(editM, "粘貼", #selector(NSText.paste(_:)), "v")
        item(editM, "全選", #selector(NSText.selectAll(_:)), "a")
        let viewM = NSMenu(title: "顯示")
        item(viewM, "重新載入界面", #selector(reloadPage(_:)), "r", [.command, .option], target: self)
        viewM.addItem(.separator())
        item(viewM, "放大", #selector(zoomIn(_:)), "+", target: self)
        item(viewM, "縮小", #selector(zoomOut(_:)), "-", target: self)
        item(viewM, "實際大小", #selector(zoomReset(_:)), "0", target: self)
        viewM.addItem(.separator())
        item(viewM, "查看日誌", #selector(showLog(_:)), "", target: self)
        let winM = NSMenu(title: "窗口")
        item(winM, "最小化", #selector(NSWindow.performMiniaturize(_:)), "m")
        item(winM, "縮放", #selector(NSWindow.performZoom(_:)), "")
        item(winM, "關閉", #selector(NSWindow.performClose(_:)), "w")
        for (t, m) in [("通檢", appM), ("編輯", editM), ("顯示", viewM), ("窗口", winM)] {
            let top = NSMenuItem(title: t, action: nil, keyEquivalent: "")
            top.submenu = m
            main.addItem(top)
        }
        NSApp.mainMenu = main
        NSApp.windowsMenu = winM
    }
}

let app = NSApplication.shared
let delegate = AppDelegate()
app.delegate = delegate
app.setActivationPolicy(.regular)
app.activate(ignoringOtherApps: true)
app.run()
