// tjhelper —— 通檢的命令行輔助工具
//   tjhelper pdftext <file.pdf>   用 PDFKit 抽取文字，頁與頁之間輸出 \f
//   tjhelper trash <path>         移到廢紙簍（可在訪達中「放回原處」）
//   tjhelper thumb <path> <out.jpg> [size]   用 QuickLook 生成縮略圖
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
