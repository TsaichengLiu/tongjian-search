// tjhelper —— 通檢的命令行輔助工具
//   tjhelper pdftext <file.pdf>   用 PDFKit 抽取文字，頁與頁之間輸出 \f
//   tjhelper trash <path>         移到廢紙簍（可在訪達中「放回原處」）
//   tjhelper thumb <path> <out.jpg> [size]   用 QuickLook 生成縮略圖
//   tjhelper render <file.pdf> <page> [width]   把 PDF 的一頁渲染成 JPEG，寫到標準輸出（大 PDF 逐頁預覽用）
//   tjhelper watch <dir>...       用 FSEvents 監聽變化，每條輸出「flags\tpath\0」；stdin 關閉即退出
import Foundation
import ImageIO
import PDFKit
import QuickLookThumbnailing

func fail(_ msg: String, _ code: Int32 = 1) -> Never {
    FileHandle.standardError.write((msg + "\n").data(using: .utf8)!)
    exit(code)
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
    FileHandle.standardOutput.write(data as Data)
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
