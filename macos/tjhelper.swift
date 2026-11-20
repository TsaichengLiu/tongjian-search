// tjhelper —— 通檢的命令行輔助工具
//   tjhelper pdftext <file.pdf>   用 PDFKit 抽取文字，頁與頁之間輸出 \f
//   tjhelper trash <path>         移到廢紙簍（可在訪達中「放回原處」）
//   tjhelper thumb <path> <out.jpg> [size]   用 QuickLook 生成縮略圖
//   tjhelper render <file.pdf> <page> [width]   把 PDF 的一頁渲染成 JPEG，寫到標準輸出（原件逐頁預覽用）
//   tjhelper page <file.pdf> <page> [width]   以上兩者一次給出：「JPEG 字節數\n」＋JPEG＋JSON（原件逐頁預覽用）
//   tjhelper boxes <file.pdf> <page>   這一頁文字層的逐字位置 → JSON {"s": 本頁文字, "b": [[x,y,w,h] 或 0, …]}
//                                       （按 UTF-16 單位一一對應；坐標以渲染圖左上角為原點、萬分之一為單位，已計入頁面旋轉）
//   tjhelper watch <dir>...       用 FSEvents 監聽變化，每條輸出「flags\tpath\0」；stdin 關閉即退出
import Foundation
import ImageIO
import PDFKit
import QuickLookThumbnailing

func fail(_ msg: String, _ code: Int32 = 1) -> Never {
    FileHandle.standardError.write((msg + "\n").data(using: .utf8)!)
    exit(code)
}

/// 把一頁畫成 JPEG（計入 /Rotate；寬 width 像素）
func renderJPEG(_ page: CGPDFPage, _ width: Int) -> Data {
    let box = page.getBoxRect(.cropBox)
    let rot = ((Int(page.rotationAngle) % 360) + 360) % 360
    let dispW = rot % 180 == 0 ? box.width : box.height
    let dispH = rot % 180 == 0 ? box.height : box.width
    guard dispW > 0, dispH > 0 else { fail("頁面尺寸無效") }
    let w = width, h = max(1, Int((CGFloat(width) * dispH / dispW).rounded()))
    guard h <= 12000, let ctx = CGContext(data: nil, width: w, height: h, bitsPerComponent: 8, bytesPerRow: 0,
                                          space: CGColorSpaceCreateDeviceRGB(),
                                          bitmapInfo: CGImageAlphaInfo.noneSkipLast.rawValue) else { fail("頁面太長") }
    ctx.setFillColor(CGColor(red: 1, green: 1, blue: 1, alpha: 1))
    ctx.fill(CGRect(x: 0, y: 0, width: w, height: h))
    ctx.interpolationQuality = .high
    let s = CGFloat(w) / dispW
    ctx.scaleBy(x: s, y: s)                       // 以下單位為顯示方向上的點
    switch rot {                                  // 頁面的 /Rotate 是順時針角度
    case 90: ctx.translateBy(x: 0, y: dispH); ctx.rotate(by: -.pi / 2)
    case 180: ctx.translateBy(x: dispW, y: dispH); ctx.rotate(by: .pi)
    case 270: ctx.translateBy(x: dispW, y: 0); ctx.rotate(by: .pi / 2)
    default: break
    }
    ctx.translateBy(x: -box.minX, y: -box.minY)
    ctx.clip(to: box)
    ctx.drawPDFPage(page)
    guard let img = ctx.makeImage() else { fail("渲染失敗") }
    let data = NSMutableData()
    guard let dst = CGImageDestinationCreateWithData(data as CFMutableData, "public.jpeg" as CFString, 1, nil) else {
        fail("無法編碼")
    }
    CGImageDestinationAddImage(dst, img, [kCGImageDestinationLossyCompressionQuality: 0.82] as CFDictionary)
    if !CGImageDestinationFinalize(dst) { fail("無法編碼") }
    return data as Data
}

/// 這一頁文字層的逐字位置 → JSON {"s": 本頁文字, "b": [[x,y,w,h] 或 0, …]}
func boxesJSON(_ page: PDFPage) -> Data {
    let str = page.string ?? ""
    let ns = str as NSString
    let box = page.bounds(for: .cropBox)
    let rot = ((page.rotation % 360) + 360) % 360
    let W = box.width, H = box.height
    var out: [Any] = []
    out.reserveCapacity(ns.length)
    for i in 0..<ns.length {
        // 用單字選區的範圍：characterBounds 對不少中文 PDF 給出錯位的框，掃描件的 OCR 文字層則常常是空的
        var r = page.selection(for: NSRange(location: i, length: 1))?.bounds(for: page) ?? .zero
        if r.isEmpty || r.width <= 0 { r = page.characterBounds(at: i) }
        if r.isEmpty || r.isNull || r.width <= 0 || r.height <= 0 || W <= 0 || H <= 0 { out.append(0); continue }
        let x0 = r.minX - box.minX, x1 = r.maxX - box.minX, y0 = r.minY - box.minY, y1 = r.maxY - box.minY
        var X0: CGFloat, X1: CGFloat, Y0: CGFloat, Y1: CGFloat     // 顯示方向、左上為原點、0…1
        switch rot {
        case 90: X0 = y0 / H; X1 = y1 / H; Y0 = x0 / W; Y1 = x1 / W
        case 180: X0 = 1 - x1 / W; X1 = 1 - x0 / W; Y0 = y0 / H; Y1 = y1 / H
        case 270: X0 = 1 - y1 / H; X1 = 1 - y0 / H; Y0 = 1 - x1 / W; Y1 = 1 - x0 / W
        default: X0 = x0 / W; X1 = x1 / W; Y0 = 1 - y1 / H; Y1 = 1 - y0 / H
        }
        out.append([Int((X0 * 10000).rounded()), Int((Y0 * 10000).rounded()),
                    Int(((X1 - X0) * 10000).rounded()), Int(((Y1 - Y0) * 10000).rounded())])
    }
    guard let data = try? JSONSerialization.data(withJSONObject: ["s": str, "b": out]) else { fail("無法輸出") }
    return data
}

let args = CommandLine.arguments
guard args.count >= 3 else { fail("usage: tjhelper pdftext|trash <path>", 2) }
let cmd = args[1]
let path = args[2]
let url = URL(fileURLWithPath: path)

switch cmd {
case "pdftext":
    guard let doc = PDFDocument(url: url) else { fail("無法打開 PDF") }
    if doc.isLocked && !doc.unlock(withPassword: "") { fail("PDF 已加密") }
    let out = FileHandle.standardOutput
    for i in 0..<doc.pageCount {
        autoreleasepool {
            var s = doc.page(at: i)?.string ?? ""
            s = s.replacingOccurrences(of: "\u{0C}", with: "\n")
            if i > 0 { out.write("\u{0C}".data(using: .utf8)!) }
            out.write(s.data(using: .utf8)!)
        }
    }
case "trash":
    do {
        var result: NSURL?
        try FileManager.default.trashItem(at: url, resultingItemURL: &result)
        print(result?.path ?? "")
    } catch {
        fail(error.localizedDescription)
    }
case "render":
    guard args.count >= 4, let pno = Int(args[3]) else { fail("usage: tjhelper render <file.pdf> <page> [width]", 2) }
    let width = max(200, min(4000, Int(args.count > 4 ? args[4] : "1400") ?? 1400))
    guard let doc = CGPDFDocument(url as CFURL) else { fail("無法打開 PDF") }
    if doc.isEncrypted && !doc.unlockWithPassword("") { fail("PDF 已加密") }
    guard let page = doc.page(at: pno) else { fail("頁碼超出範圍", 3) }
    FileHandle.standardOutput.write(renderJPEG(page, width))
case "boxes":
    guard args.count >= 4, let pno = Int(args[3]) else { fail("usage: tjhelper boxes <file.pdf> <page>", 2) }
    guard let doc = PDFDocument(url: url) else { fail("無法打開 PDF") }
    if doc.isLocked && !doc.unlock(withPassword: "") { fail("PDF 已加密") }
    guard pno >= 1, pno <= doc.pageCount, let page = doc.page(at: pno - 1) else { fail("頁碼超出範圍", 3) }
    FileHandle.standardOutput.write(boxesJSON(page))
case "page":
    // 頁面圖和逐字位置一起給：只開一次文件、只起一個進程。輸出「JPEG 字節數\n」＋JPEG＋JSON
    guard args.count >= 4, let pno = Int(args[3]) else { fail("usage: tjhelper page <file.pdf> <page> [width]", 2) }
    let width = max(200, min(4000, Int(args.count > 4 ? args[4] : "1400") ?? 1400))
    guard let doc = PDFDocument(url: url) else { fail("無法打開 PDF") }
    if doc.isLocked && !doc.unlock(withPassword: "") { fail("PDF 已加密") }
    guard pno >= 1, pno <= doc.pageCount, let page = doc.page(at: pno - 1), let ref = page.pageRef else {
        fail("頁碼超出範圍", 3)
    }
    let jpg = renderJPEG(ref, width)
    let js = boxesJSON(page)
    FileHandle.standardOutput.write("\(jpg.count)\n".data(using: .ascii)!)
    FileHandle.standardOutput.write(jpg)
    FileHandle.standardOutput.write(js)
case "thumb":
    guard args.count >= 4 else { fail("usage: tjhelper thumb <path> <out.jpg> [size]", 2) }
    let out = URL(fileURLWithPath: args[3])
    let side = CGFloat(Double(args.count > 4 ? args[4] : "256") ?? 256)
    let req = QLThumbnailGenerator.Request(fileAt: url, size: CGSize(width: side, height: side),
                                           scale: 2, representationTypes: .thumbnail)
    let sem = DispatchSemaphore(value: 0)
    var ok = false
    QLThumbnailGenerator.shared.generateBestRepresentation(for: req) { rep, _ in
        if let cg = rep?.cgImage,
           let dst = CGImageDestinationCreateWithURL(out as CFURL, "public.jpeg" as CFString, 1, nil) {
            CGImageDestinationAddImage(dst, cg, [kCGImageDestinationLossyCompressionQuality: 0.8] as CFDictionary)
            ok = CGImageDestinationFinalize(dst)
        }
        sem.signal()
    }
    if sem.wait(timeout: .now() + 30) == .timedOut { fail("timeout") }
    if !ok { fail("無法生成縮略圖") }
case "watch":
    let paths = Array(args.dropFirst(2)) as CFArray
    let callback: FSEventStreamCallback = { _, _, count, eventPaths, eventFlags, _ in
        let arr = unsafeBitCast(eventPaths, to: NSArray.self)
        var out = Data()
        for i in 0..<count {
            guard let p = arr[i] as? String else { continue }
            out.append("\(eventFlags[i])\t\(p)".data(using: .utf8)!)
            out.append(0)
        }
        FileHandle.standardOutput.write(out)
    }
    let flags = FSEventStreamCreateFlags(kFSEventStreamCreateFlagFileEvents | kFSEventStreamCreateFlagUseCFTypes |
                                         kFSEventStreamCreateFlagNoDefer | kFSEventStreamCreateFlagWatchRoot)
    guard let stream = FSEventStreamCreate(nil, callback, nil, paths,
                                           FSEventStreamEventId(kFSEventStreamEventIdSinceNow), 0.5, flags) else {
        fail("無法監聽")
    }
    FSEventStreamSetDispatchQueue(stream, DispatchQueue(label: "fsevents"))
    FSEventStreamStart(stream)
    while readLine() != nil {}   // 父進程關閉 stdin 時退出
    exit(0)
default:
    fail("unknown command", 2)
}
