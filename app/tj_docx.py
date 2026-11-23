# -*- coding: utf-8 -*-
"""Word（docx）：一次讀 XML，同時得出索引用的純文字和「原件」視圖用的版式模型。

兩者出自同一遍遍歷，模型裡每段文字都帶它在純文字中的起點，所以原件上的標註、跳轉與全文、索引一字不差。
收：正文（含表格、文本框）、腳註、尾註；不收：修訂中刪掉或移走的文字、域代碼、頁眉頁腳、批註。

模型（給瀏覽器，JSON）：
  page   {w, ml, mr, mt, mb}           版心寬度、頁邊距（像素）
  css    [樣式串, …]                    段落、文字樣式表，下面用序號引用
  blocks [塊, …]
    ["p", 段落樣式序號, [片段, …]]
    ["tbl", [[[colspan, rowspan, [塊, …]], …], …]]   表格：行 → 格
    ["pb"]                                            分頁、分節
  片段
    [起點, "文字", 文字樣式序號]                     起點是純文字裡的位置（碼位；交給瀏覽器前換成 UTF-16）
    ["ref", "註號"]                                   正文裡的腳註、尾註號（不佔純文字）
    ["img", "word/media/…", 寬, 高]
    ["box", [塊, …]]                                  文本框
  notes  [[註號, [塊, …]], …]
"""
import re
import zipfile
import xml.etree.ElementTree as ET

W = "{http://schemas.openxmlformats.org/wordprocessingml/2006/main}"
MC = "{http://schemas.openxmlformats.org/markup-compatibility/2006}"
R = "{http://schemas.openxmlformats.org/officeDocument/2006/relationships}"
A = "{http://schemas.openxmlformats.org/drawingml/2006/main}"
WP = "{http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing}"
V = "{urn:schemas-microsoft-com:vml}"
M = "{http://schemas.openxmlformats.org/officeDocument/2006/math}"
PR = "{http://schemas.openxmlformats.org/package/2006/relationships}"

SKIP = {W + "del", W + "moveFrom", W + "instrText", W + "delInstrText", W + "delText", W + "commentReference",
        W + "rPr", W + "pPr", W + "sectPr", W + "tblPr", W + "trPr", W + "tcPr", W + "tblGrid", W + "proofErr",
        W + "bookmarkStart", W + "bookmarkEnd", W + "lastRenderedPageBreak", W + "fldChar", W + "annotationRef",
        W + "object", W + "sym", MC + "Fallback"}
HILITE = {"yellow": "#ffff00", "green": "#00ff00", "cyan": "#00ffff", "magenta": "#ff00ff", "blue": "#0000ff",
          "red": "#ff0000", "darkBlue": "#000080", "darkCyan": "#008080", "darkGreen": "#008000",
          "darkMagenta": "#800080", "darkRed": "#800000", "darkYellow": "#808000", "darkGray": "#808080",
          "lightGray": "#c0c0c0", "black": "#000000"}


def _font_stack(name):
    n = name or ""
    if re.search("楷|Kai", n):
        return '"Kaiti TC","Kaiti SC","STKaiti",serif'
    if re.search("仿宋|FangSong|Fangsong", n):
        return '"STFangsong","FangSong","Songti TC",serif'
    if re.search("黑|Hei|YaHei|雅黑|Gothic|Arial|Helvetica|Calibri", n):
        return '"PingFang TC","Heiti TC","Helvetica Neue",sans-serif'
    return '"Times New Roman","Songti TC","Songti SC","STSong",serif'


def _tw(v):
    """twip → 像素（1 英寸 = 1440 twip = 96 px）"""
    try:
        return int(v) / 15.0
    except (TypeError, ValueError):
        return None


def _on(el):
    """開關型屬性：<w:b/> 為開，w:val=0/false/none 為關"""
    if el is None:
        return None
    v = el.get(W + "val")
    return v not in ("0", "false", "none", "off")


class _Styles(object):
    def __init__(self, xml):
        self.p, self.r, self.base, self.ptype = {}, {}, {}, {}
        self.default_p = None
        self.dp, self.dr = {}, {}
        if xml is None:
            return
        root = ET.fromstring(xml)
        dd = root.find(W + "docDefaults")
        if dd is not None:
            self.dp = self.ppr(dd.find(W + "pPrDefault/" + W + "pPr"))
            self.dr = self.rpr(dd.find(W + "rPrDefault/" + W + "rPr"))
        for st in root.findall(W + "style"):
            sid = st.get(W + "styleId")
            if not sid:
                continue
            self.ptype[sid] = st.get(W + "type")
            b = st.find(W + "basedOn")
            if b is not None:
                self.base[sid] = b.get(W + "val")
            self.p[sid] = self.ppr(st.find(W + "pPr"))
            self.r[sid] = self.rpr(st.find(W + "rPr"))
            if st.get(W + "type") == "paragraph" and st.get(W + "default") in ("1", "true"):
                self.default_p = sid

    @staticmethod
    def ppr(el):
        d = {}
        if el is None:
            return d
        jc = el.find(W + "jc")
        if jc is not None:
            d["jc"] = jc.get(W + "val")
        ind = el.find(W + "ind")
        if ind is not None:
            for k, names in (("left", ("left", "start")), ("right", ("right", "end")),
                             ("first", ("firstLine",)), ("hang", ("hanging",))):
                for nm in names:
                    if ind.get(W + nm) is not None:
                        d[k] = _tw(ind.get(W + nm))
                        break
            for k, nm in (("leftC", "leftChars"), ("firstC", "firstLineChars"), ("hangC", "hangingChars")):
                if ind.get(W + nm) is not None:
                    try:
                        d[k] = int(ind.get(W + nm)) / 100.0
                    except ValueError:
                        pass
        sp = el.find(W + "spacing")
        if sp is not None:
            for k, nm in (("before", "before"), ("after", "after")):
                if sp.get(W + nm) is not None:
                    d[k] = _tw(sp.get(W + nm))
            if sp.get(W + "line") is not None:
                try:
                    d["line"] = (int(sp.get(W + "line")), sp.get(W + "lineRule") or "auto")
                except ValueError:
                    pass
        ps = el.find(W + "pStyle")
        if ps is not None:
            d["style"] = ps.get(W + "val")
        return d

    @staticmethod
    def rpr(el):
        d = {}
        if el is None:
            return d
        for k, tag in (("b", "b"), ("i", "i"), ("strike", "strike"), ("dstrike", "dstrike"), ("caps", "smallCaps"),
                       ("vanish", "vanish")):
            v = _on(el.find(W + tag))
            if v is not None:
                d[k] = v
        u = el.find(W + "u")
        if u is not None:
            d["u"] = u.get(W + "val", "single") not in ("none", "0")
        sz = el.find(W + "sz")
        if sz is not None:
            try:
                d["sz"] = int(sz.get(W + "val")) / 2.0
            except (TypeError, ValueError):
                pass
        va = el.find(W + "vertAlign")
        if va is not None:
            d["va"] = va.get(W + "val")
        c = el.find(W + "color")
        if c is not None and c.get(W + "val") not in (None, "auto", "000000"):
            d["color"] = "#" + c.get(W + "val")
        hl = el.find(W + "highlight")
        if hl is not None and hl.get(W + "val") in HILITE:
            d["bg"] = HILITE[hl.get(W + "val")]
        shd = el.find(W + "shd")
        if shd is not None and shd.get(W + "fill") not in (None, "auto", "FFFFFF", "ffffff"):
            d.setdefault("bg", "#" + shd.get(W + "fill"))
        rf = el.find(W + "rFonts")
        if rf is not None:
            f = rf.get(W + "eastAsia") or rf.get(W + "ascii") or rf.get(W + "hAnsi")
            if f:
                d["font"] = f
        rs = el.find(W + "rStyle")
        if rs is not None:
            d["style"] = rs.get(W + "val")
        return d

    def chain(self, sid, table):
        out, seen = {}, set()
        lst = []
        while sid and sid not in seen:
            seen.add(sid)
            lst.append(table.get(sid, {}))
            sid = self.base.get(sid)
        for d in reversed(lst):
            out.update(d)
        return out


class _Doc(object):
    def __init__(self, z):
        self.z = z
        names = set(z.namelist())
        rd = lambda n: z.read(n) if n in names else None
        self.st = _Styles(rd("word/styles.xml"))
        self.rels = {}
        rel = rd("word/_rels/document.xml.rels")
        if rel:
            for r in ET.fromstring(rel).findall(PR + "Relationship"):
                t = r.get("Target") or ""
                if r.get("TargetMode") != "External" and not t.startswith("/"):
                    self.rels[r.get("Id")] = "word/" + t
        self.text = []
        self.pos = 0
        self.css, self.css_ix = [], {}
        self.runs = []                  # 文字片段（換 UTF-16 用）
        self.fn_num, self.en_num = {}, {}

    # ---- 文字與樣式
    def emit(self, s):
        o = self.pos
        self.text.append(s)
        self.pos += len(s)
        return o

    def cls(self, s):
        i = self.css_ix.get(s)
        if i is None:
            i = self.css_ix[s] = len(self.css)
            self.css.append(s)
        return i

    def pcss(self, d):
        out = []
        if d.get("jc") in ("center",):
            out.append("text-align:center")
        elif d.get("jc") in ("right", "end"):
            out.append("text-align:right")
        elif d.get("jc") in ("both", "distribute"):
            out.append("text-align:justify")
        left = d["leftC"] if "leftC" in d else None
        if left is not None:
            out.append("margin-left:%.2fem" % left)
        elif d.get("left"):
            out.append("margin-left:%.1fpx" % d["left"])
        if d.get("right"):
            out.append("margin-right:%.1fpx" % d["right"])
        if "firstC" in d:
            out.append("text-indent:%.2fem" % d["firstC"])
        elif "hangC" in d:
            out.append("text-indent:-%.2fem" % d["hangC"])
        elif d.get("first"):
            out.append("text-indent:%.1fpx" % d["first"])
        elif d.get("hang"):
            out.append("text-indent:-%.1fpx" % d["hang"])
        if d.get("before"):
            out.append("margin-top:%.1fpx" % d["before"])
        if d.get("after"):
            out.append("margin-bottom:%.1fpx" % d["after"])
        ln = d.get("line")
        if ln:
            v, rule = ln
            if rule == "auto":
                out.append("line-height:%.2f" % (v / 240.0 * 1.3))
            elif v > 0:
                out.append("line-height:%.1fpx" % (v / 15.0))
        return ";".join(out)

    def rcss(self, d):
        out = []
        sz = d.get("sz")
        if sz:
            out.append("font-size:%.1fpx" % (sz * 4.0 / 3.0 * (0.66 if d.get("va") in ("superscript", "subscript") else 1)))
        if d.get("va") == "superscript":
            out.append("vertical-align:super")
        elif d.get("va") == "subscript":
            out.append("vertical-align:sub")
        if d.get("b"):
            out.append("font-weight:700")
        if d.get("i"):
            out.append("font-style:italic")
        deco = []
        if d.get("u"):
            deco.append("underline")
        if d.get("strike") or d.get("dstrike"):
            deco.append("line-through")
        if deco:
            out.append("text-decoration:" + " ".join(deco))
        if d.get("caps"):
            out.append("font-variant:small-caps")
        if d.get("color"):
            out.append("color:" + d["color"])
        if d.get("bg"):
            out.append("background:" + d["bg"])
        if d.get("font"):
            out.append("font-family:" + _font_stack(d["font"]))
        return ";".join(out)

    # ---- 塊
    def blocks(self, parent, out):
        for el in parent:
            tag = el.tag
            if tag == W + "p":
                out.append(self.para(el))
            elif tag == W + "tbl":
                out.append(self.table(el))
            elif tag in (W + "sdt",):
                c = el.find(W + "sdtContent")
                if c is not None:
                    self.blocks(c, out)
            elif tag in (W + "customXml", W + "ins", W + "moveTo", W + "smartTag"):
                self.blocks(el, out)
            elif tag == W + "sectPr" or tag in SKIP:
                continue

    def para(self, p):
        ppr = p.find(W + "pPr")
        direct = _Styles.ppr(ppr)
        sid = direct.get("style") or self.st.default_p
        props = dict(self.st.dp)
        props.update(self.st.chain(sid, self.st.p))
        props.update(direct)
        rbase = dict(self.st.dr)
        rbase.update(self.st.chain(sid, self.st.r))
        runs = []
        self.inline(p, runs, rbase)
        self.emit("\n")
        blk = ["p", self.cls(self.pcss(props)), runs]
        if ppr is not None and ppr.find(W + "sectPr") is not None:
            blk = ["p", blk[1], runs, 1]           # 分節：其後畫分頁線
        return blk

    def inline(self, el, runs, rbase):
        for ch in el:
            tag = ch.tag
            if tag in SKIP:
                continue
            if tag == W + "r":
                self.run(ch, runs, rbase)
            elif tag == MC + "AlternateContent":
                c = ch.find(MC + "Choice")
                if c is not None:
                    self.inline(c, runs, rbase)
            elif tag == M + "oMath" or tag == M + "oMathPara":
                s = "".join(t.text or "" for t in ch.iter(M + "t"))
                if s:
                    runs.append([self.emit(s), s, self.cls(self.rcss(rbase))])
            else:                                  # 超鏈接、插入、域結果、內容控件……
                self.inline(ch, runs, rbase)

    def run(self, r, runs, rbase):
        d = dict(rbase)
        direct = _Styles.rpr(r.find(W + "rPr"))
        if direct.get("style"):
            d.update(self.st.chain(direct["style"], self.st.r))
        d.update(direct)
        c = self.cls(self.rcss(d))
        buf = []

        def flush():
            if buf:
                s = "".join(buf)
                runs.append([self.emit(s), s, c])
                del buf[:]
        for ch in r:
            tag = ch.tag
            if tag in SKIP:
                continue
            if tag == W + "t":
                buf.append(ch.text or "")
            elif tag == W + "tab":
                buf.append("\t")
            elif tag in (W + "br", W + "cr"):
                if ch.get(W + "type") == "page":
                    flush()
                    runs.append(["pb"])
                else:
                    buf.append("\n")
            elif tag in (W + "footnoteReference", W + "endnoteReference"):
                flush()
                book = self.fn_num if tag == W + "footnoteReference" else self.en_num
                nid = ch.get(W + "id")
                if nid not in book:
                    book[nid] = len(book) + 1
                n = book[nid]
                runs.append(["ref", str(n) if tag == W + "footnoteReference" else _roman(n)])
            elif tag in (W + "footnoteRef", W + "endnoteRef"):
                pass                               # 註文開頭的註號：由註的編號顯示
            elif tag == W + "ruby":                # 注音（假名、拼音）：只收正文，不收注音
                base = ch.find(W + "rubyBase")
                if base is not None:
                    flush()
                    self.inline(base, runs, rbase)
            elif tag == MC + "AlternateContent":
                c2 = ch.find(MC + "Choice")
                if c2 is not None:
                    flush()
                    self.drawing(c2, runs, rbase)
            elif tag in (W + "drawing", W + "pict"):
                flush()
                self.drawing(ch, runs, rbase)
        flush()

    def drawing(self, el, runs, rbase):
        boxes = list(el.iter(W + "txbxContent"))
        for tx in boxes:                           # 文本框：其中的段落照常收文字
            inner = []
            self.blocks(tx, inner)
            runs.append(["box", inner])
        if boxes:
            return
        blip = next(el.iter(A + "blip"), None)
        rid = blip.get(R + "embed") if blip is not None else None
        if rid is None:
            im = next(el.iter(V + "imagedata"), None)
            rid = im.get(R + "id") if im is not None else None
        path = self.rels.get(rid)
        if not path:
            return
        ext = next(el.iter(WP + "extent"), None)
        w = h = 0
        if ext is not None:
            try:
                w, h = int(ext.get("cx")) // 9525, int(ext.get("cy")) // 9525
            except (TypeError, ValueError):
                pass
        runs.append(["img", path, w, h])

    def table(self, tbl):
        rows, spans = [], {}                       # spans：列 → 正在縱向合併的格
        for tr in tbl.findall(W + "tr"):
            row, col = [], 0
            for tc in tr.findall(W + "tc"):
                pr = tc.find(W + "tcPr")
                cs, vm = 1, None
                if pr is not None:
                    g = pr.find(W + "gridSpan")
                    if g is not None:
                        try:
                            cs = max(1, int(g.get(W + "val")))
                        except (TypeError, ValueError):
                            pass
                    v = pr.find(W + "vMerge")
                    if v is not None:
                        vm = v.get(W + "val") or "continue"
                inner = []
                self.blocks(tc, inner)
                if vm == "continue" and col in spans:
                    spans[col][1] += 1             # 併入上一格
                    spans[col][2].extend(b for b in inner if not _empty(b))
                else:
                    cell = [cs, 1, inner]
                    row.append(cell)
                    if vm == "restart":
                        spans[col] = cell
                    else:
                        spans.pop(col, None)
                col += cs
            rows.append(row)
        return ["tbl", rows]

    def notes(self, xml, tag, book):
        out = []
        if xml is None:
            return out
        root = ET.fromstring(xml)
        for n in root.findall(W + tag):
            if n.get(W + "type") in ("separator", "continuationSeparator", "continuationNotice"):
                continue
            inner = []
            self.blocks(n, inner)
            nid = n.get(W + "id")
            num = book.get(nid)
            label = (str(num) if tag == "footnote" else _roman(num)) if num else "*"
            out.append([label, inner])
        return out


def _empty(b):
    return b[0] == "p" and not b[2]


def _roman(n):
    vals = ((10, "x"), (9, "ix"), (5, "v"), (4, "iv"), (1, "i"))
    out = ""
    for v, s in vals:
        while n >= v:
            out += s
            n -= v
    return out or "i"


def parse(path, model=True):
    """返回 (純文字, 模型)；model=False 時只要文字（建索引用）。"""
    with zipfile.ZipFile(path) as z:
        names = set(z.namelist())
        doc = _Doc(z)
        body = ET.fromstring(z.read("word/document.xml")).find(W + "body")
        blocks = []
        if body is not None:
            doc.blocks(body, blocks)
        notes = []
        for part, tag, book in (("word/footnotes.xml", "footnote", doc.fn_num), ("word/endnotes.xml", "endnote", doc.en_num)):
            if part in names:
                doc.emit("\n")                      # 與正文之間空一行（與舊版抽取一致）
                notes += doc.notes(z.read(part), tag, book)
        text = "".join(doc.text)
        if not model:
            return text, None
        page = {"w": 794, "ml": 120, "mr": 120, "mt": 96, "mb": 96}      # A4、上下 2.54 釐米、左右 3.17 釐米
        sect = body.find(W + "sectPr") if body is not None else None
        if sect is not None:
            ps, pm = sect.find(W + "pgSz"), sect.find(W + "pgMar")
            if ps is not None and _tw(ps.get(W + "w")):
                page["w"] = round(_tw(ps.get(W + "w")))
            if pm is not None:
                for k, nm in (("ml", "left"), ("mr", "right"), ("mt", "top"), ("mb", "bottom")):
                    v = _tw(pm.get(W + nm))
                    if v is not None:
                        page[k] = round(abs(v))
        base = dict(doc.st.dr)
        base.update(doc.st.chain(doc.st.default_p, doc.st.r))
        return text, {"page": page, "base": doc.rcss(dict(base, sz=base.get("sz") or 10.5,
                                                            font=base.get("font") or "宋體")),
                      "css": doc.css, "blocks": blocks, "notes": notes}


def _first(b):
    """塊裡第一段文字的起點（沒有文字時為 None）"""
    if b[0] == "p":
        for r in b[2]:
            if isinstance(r[0], int):
                return r[0]
            if r[0] == "box":
                for x in r[1]:
                    o = _first(x)
                    if o is not None:
                        return o
    elif b[0] == "tbl":
        for row in b[1]:
            for cell in row:
                for x in cell[2]:
                    o = _first(x)
                    if o is not None:
                        return o
    return None


def trim(model, limit):
    """只留起點在 limit 之前的塊和註（很長的文件，免得瀏覽器排上百萬字）。"""
    def keep(bs):
        out = []
        for b in bs:
            o = _first(b)
            if o is not None and o >= limit:
                return out, True
            out.append(b)
        return out, False
    model["blocks"], cut = keep(model["blocks"])
    notes = []
    for n in model["notes"]:
        o = next((x for x in map(_first, n[1]) if x is not None), None)
        if o is not None and o >= limit:
            cut = True
            break
        notes.append(n)
    model["notes"] = notes
    model["truncated"] = cut


def text_of(path):
    return parse(path, model=False)[0]


def remap(model, conv):
    """模型裡的起點由碼位換成 UTF-16 位置（文字裡有擴展區漢字時）。"""
    def blks(bs):
        for b in bs:
            if b[0] == "p":
                for r in b[2]:
                    if isinstance(r[0], int):
                        r[0] = conv(r[0])
                    elif r[0] == "box":
                        blks(r[1])
            elif b[0] == "tbl":
                for row in b[1]:
                    for cell in row:
                        blks(cell[2])
    blks(model["blocks"])
    for n in model["notes"]:
        blks(n[1])
