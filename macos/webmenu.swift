// 通檢 —— 右鍵菜單：去掉 WebKit 默認菜單裡與通檢無關的項（重新載入、檢查元件、共享……），
// 保留查詢、翻譯、拷貝等文字操作，並在全文裡加上通檢自己的命令。
// 頁面在 contextmenu 事件裡先把上下文發過來（見 app.js 的 nativeMenu），菜單打開時據此決定加哪些項。
import Cocoa
import WebKit

final class TJWebView: WKWebView {
    private var ctx: [String: Any]?
    private var ctxTime = Date.distantPast

    func setMenuContext(_ c: [String: Any]) {
        ctx = c
        ctxTime = Date()
    }

    /// 頁面自己的區域（選中的文字、輸入框）裡只保留這些
    static let keep: Set<String> = [
        "WKMenuItemIdentifierLookUp", "WKMenuItemIdentifierTranslate", "WKMenuItemIdentifierSearchWeb",
        "WKMenuItemIdentifierCopy", "WKMenuItemIdentifierPaste", "WKMenuItemIdentifierSpellingMenu",
        "WKMenuItemIdentifierSpeechMenu", "forwardContextMenuAction:",
    ]
    /// 頁面之外（如系統 PDF 閱讀器裡）只去掉這些
    static let drop: Set<String> = [
        "WKMenuItemIdentifierReload", "WKMenuItemIdentifierInspectElement", "WKMenuItemIdentifierGoBack",
        "WKMenuItemIdentifierGoForward", "WKMenuItemIdentifierStop", "WKMenuItemIdentifierOpenFrameInNewWindow",
        "WKMenuItemIdentifierCopyLinkWithHighlight", "WKMenuItemIdentifierShareMenu",
    ]

    override func willOpenMenu(_ menu: NSMenu, with event: NSEvent) {
        super.willOpenMenu(menu, with: event)
        let c = Date().timeIntervalSince(ctxTime) < 2 ? ctx : nil
        ctx = nil
        guard let c = c else {
            for it in menu.items where TJWebView.drop.contains(it.identifier?.rawValue ?? "") { menu.removeItem(it) }
            TJWebView.tidy(menu)
            return
        }
        for it in menu.items where !it.isSeparatorItem && !TJWebView.keep.contains(it.identifier?.rawValue ?? "") {
            menu.removeItem(it)
        }
        let kind = c["kind"] as? String ?? ""
        let sel = (c["sel"] as? String ?? "").trimmingCharacters(in: .whitespacesAndNewlines)
        let short = sel.count > 14 ? String(sel.prefix(14)) + "…" : sel
        var ours: [NSMenuItem] = []
        func add(_ title: String, _ action: String) {
            let it = NSMenuItem(title: title, action: #selector(runMenuAction(_:)), keyEquivalent: "")
            it.target = self
            it.representedObject = action
            ours.append(it)
        }
        if kind == "reader" {
            if !sel.isEmpty {
                add("在通檢中檢索「\(short)」", "search")
                add("在本文件內查找「\(short)」", "find")
                add("拷貝（附出處）", "cite")
            }
            if c["pdf"] as? Bool == true { add("在原件中查看此處", "orig") }
        } else if kind == "text", !sel.isEmpty {
            add("在通檢中檢索「\(short)」", "search")
        }
        if !ours.isEmpty {
            if !menu.items.isEmpty { menu.insertItem(.separator(), at: 0) }
            for it in ours.reversed() { menu.insertItem(it, at: 0) }
        }
        TJWebView.tidy(menu)
    }

    @objc func runMenuAction(_ sender: NSMenuItem) {
        guard let a = sender.representedObject as? String, a.allSatisfy({ $0.isLetter }) else { return }
        evaluateJavaScript("window.TJNative && TJNative.menu('\(a)')", completionHandler: nil)
    }

    /// 去掉開頭、結尾和連續的分隔線
    static func tidy(_ menu: NSMenu) {
        var prevSep = true
        for it in menu.items {
            if it.isSeparatorItem {
                if prevSep { menu.removeItem(it) } else { prevSep = true }
            } else {
                prevSep = false
            }
        }
        while let last = menu.items.last, last.isSeparatorItem { menu.removeItem(last) }
    }
}
