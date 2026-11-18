// 生成應用圖標：朱色印章底，白色宋體「檢」
import AppKit
let out = CommandLine.arguments[1]
let S: CGFloat = 1024
let img = NSImage(size: NSSize(width: S, height: S))
img.lockFocus()
let ctx = NSGraphicsContext.current!.cgContext
let inset: CGFloat = 100
let rect = CGRect(x: inset, y: inset, width: S - 2 * inset, height: S - 2 * inset)
let path = NSBezierPath(roundedRect: rect, xRadius: 185, yRadius: 185)
ctx.saveGState()
let sh = NSShadow(); sh.shadowColor = NSColor.black.withAlphaComponent(0.28); sh.shadowBlurRadius = 28; sh.shadowOffset = NSSize(width: 0, height: -12)
sh.set()
NSColor(srgbRed: 0.71, green: 0.25, blue: 0.17, alpha: 1).setFill(); path.fill()
ctx.restoreGState()
let grad = NSGradient(colors: [NSColor(srgbRed: 0.80, green: 0.32, blue: 0.22, alpha: 1), NSColor(srgbRed: 0.62, green: 0.20, blue: 0.13, alpha: 1)])!
grad.draw(in: path, angle: -90)
// 印框
let frame = NSBezierPath(roundedRect: rect.insetBy(dx: 70, dy: 70), xRadius: 90, yRadius: 90)
frame.lineWidth = 16
NSColor(white: 1, alpha: 0.85).setStroke(); frame.stroke()
// 字
let font = NSFont(name: "Songti TC Bold", size: 520) ?? NSFont(name: "Songti SC Bold", size: 520) ?? NSFont.boldSystemFont(ofSize: 520)
let para = NSMutableParagraphStyle(); para.alignment = .center
let attr: [NSAttributedString.Key: Any] = [.font: font, .foregroundColor: NSColor(white: 1, alpha: 0.96), .paragraphStyle: para]
let str = NSAttributedString(string: "檢", attributes: attr)
let b = str.boundingRect(with: NSSize(width: S, height: S), options: [.usesLineFragmentOrigin, .usesFontLeading])
str.draw(in: NSRect(x: 0, y: (S - b.height) / 2 - 10, width: S, height: b.height))
img.unlockFocus()
let rep = NSBitmapImageRep(data: img.tiffRepresentation!)!
try! rep.representation(using: .png, properties: [:])!.write(to: URL(fileURLWithPath: out))
