# -*- coding: utf-8 -*-
"""從各類文件中抽取純文本。PDF 頁與頁之間以 \\f 分隔，以便定位頁碼。"""
import codecs
import html
import os
import re
import shutil
import subprocess
import zipfile

import tj_doc
import tj_docx

EXTRACTOR_VERSION = 6
# 抽取方式改過的格式：用舊版抽出的文件下次掃描時重抽
#   4：Word 不再收修訂中刪掉的文字和域代碼
#   5：Word 改用 tj_docx（與原件視圖同源）：不再收域的二進制數據、圖形坐標、舊式文本框的重複文字、注音
#   6：Word 97–2003（doc）改用 tj_doc：腳註、尾註單獨成段，不再收域代碼
REEXTRACT = {"docx": 5, "dotx": 5, "doc": 6, "dot": 6}

KINDS = {
    "pdf": ("pdf",),
    "doc": ("doc", "docx", "rtf", "rtfd", "odt", "wps", "pages", "wpd", "dot", "dotx"),
    "text": ("txt", "text", "md", "markdown", "csv", "tsv", "json", "xml", "html", "htm",
             "xhtml", "srt", "ass", "tex", "bib", "ris", "enw", "ini", "yaml", "yml",
             "rst", "org", "adoc", "py", "js", "css", "sql", "r", "do"),
    "ebook": ("epub", "mobi", "azw", "azw3", "djvu", "fb2", "caj", "kdh", "nh"),
    "sheet": ("xls", "xlsx", "ods", "numbers"),
    "slide": ("ppt", "pptx", "odp", "key"),
    "image": ("jpg", "jpeg", "png", "gif", "tif", "tiff", "bmp", "heic", "webp", "jp2", "svg"),
    "audio": ("mp3", "m4a", "wav", "aac", "flac"),
    "video": ("mp4", "mov", "m4v", "avi", "mkv"),
    "archive": ("zip", "rar", "7z", "tar", "gz", "bz2", "xz"),
}
EXT_KIND = {}
for _k, _exts in KINDS.items():
    for _e in _exts:
        EXT_KIND[_e] = _k
EXT_KIND["csv"] = "sheet"
EXT_KIND["tsv"] = "sheet"

TEXT_EXTS = set(KINDS["text"]) | {"csv", "tsv"}
TEXTUTIL_EXTS = {"doc", "rtf", "rtfd", "odt", "wpd", "dot", "webarchive", "wordml"}
ZIP_EXTS = {"docx", "dotx", "pptx", "xlsx", "epub", "ods", "odp"}
INDEXABLE = TEXT_EXTS | TEXTUTIL_EXTS | ZIP_EXTS | {"pdf"}
# 代碼、腳本與配置文件：默認只收文件名（設置裡可改為也收全文）
CODE_EXTS = {"json", "yaml", "yml", "ini", "py", "js", "css", "sql", "r", "do"}

MAX_TEXT_FILE = 300 * 1024 * 1024
# 數據類文本（導出的 json/csv、代碼等）超過此大小只收文件名，免得撐大索引
DATA_EXTS = {"json", "csv", "tsv", "xml", "sql", "js", "css", "yaml", "yml", "ini"}
MAX_DATA_FILE = 20 * 1024 * 1024
MAX_PDF_FILE = 1024 * 1024 * 1024
MAX_CHARS = 60 * 1000 * 1000


def kind_of(ext):
    return EXT_KIND.get(ext, "other")


# ---------------------------------------------------------------- 編碼判定
_COMMON = None


def _common_chars():
    """GB2312 一級字 ∪ Big5 常用字 ∪ 中文標點，用於判斷解碼是否正確。"""
    global _COMMON
    if _COMMON is None:
        s = set()
        for o in range(0x4E00, 0xA000):
            ch = chr(o)
            try:
                b = ch.encode("gb2312")
                if 0xB0 <= b[0] <= 0xD7:
                    s.add(ch)
                    continue
            except UnicodeEncodeError:
                pass
            try:
                b = ch.encode("big5")
                if 0xA4 <= b[0] <= 0xC6:
                    s.add(ch)
            except UnicodeEncodeError:
                pass
        s.update("，。、；：？！「」『』《》〈〉（）—…·　“”‘’【】")
        _COMMON = s
    return _COMMON


def _score(text):
    common = _common_chars()
    n = hit = 0
    for ch in text[:200000]:
        if ord(ch) > 0x7F:
            n += 1
            if ch in common:
                hit += 1
    return hit / n if n else 1.0


def decode_bytes(b):
    if b.startswith(codecs.BOM_UTF8):
        return b[3:].decode("utf-8", "replace")
    if b[:2] in (codecs.BOM_UTF16_LE, codecs.BOM_UTF16_BE):
        return b.decode("utf-16", "replace")
    try:
        return b.decode("utf-8")
    except UnicodeDecodeError as e:
        # 文件末尾被截斷的 UTF-8
        if e.start > len(b) - 4 and e.start > 0:
            return b.decode("utf-8", "replace")
    sample = b[:400000]
    zeros = sample.count(b"\x00")
    if zeros > len(sample) // 4:
        even = sample[0::2].count(b"\x00")
        return b.decode("utf-16-be" if even > zeros // 2 else "utf-16-le", "replace")
    best, best_score = None, -1.0
    for enc in ("gb18030", "big5hkscs"):
        try:
            sample.decode(enc)
            strict_ok = True
        except UnicodeDecodeError as e:
            strict_ok = e.start > len(sample) - 4   # 樣本截斷處
        text = sample.decode(enc, "replace")
        sc = _score(text) - (0 if strict_ok else 0.3)
        if sc > best_score:
            best, best_score = enc, sc
    return b.decode(best, "replace")


# ---------------------------------------------------------------- 各格式
_TAG = re.compile(r"<[^>]+>")
_BLOCK = re.compile(r"(?i)<\s*(br|/p|/div|/li|/tr|/h[1-6]|/title|/blockquote|/section)\b[^>]*>")
_SCRIPT = re.compile(r"(?is)<(script|style|head)\b.*?</\1\s*>")


def html_to_text(s, keep_head=False):
    if not keep_head:
        s = _SCRIPT.sub(" ", s)
    s = _BLOCK.sub("\n", s)
    s = _TAG.sub("", s)
    s = html.unescape(s)
    return re.sub(r"\n[ \t]*\n[\s]*", "\n\n", s)


def _xml_text(s, para_tags):
    for t in para_tags:
        s = s.replace(t, "\n")
    s = re.sub(r"<w:tab/>|<w:tab [^>]*/>", "\t", s)
    s = re.sub(r"<w:br/>|<w:br [^>]*/>|<a:br/>|<a:br [^>]*/>", "\n", s)
    return html.unescape(_TAG.sub("", s))


def _natural_key(name):
    return [int(x) if x.isdigit() else x for x in re.split(r"(\d+)", name)]


def extract_zip(path, ext):
    with zipfile.ZipFile(path) as z:
        names = z.namelist()
        rd = lambda n: z.read(n).decode("utf-8", "replace")
        if ext in ("docx", "dotx"):
            return tj_docx.text_of(path)
        if ext == "pptx":
            slides = sorted([n for n in names if re.match(r"ppt/slides/slide\d+\.xml$", n)],
                            key=_natural_key)
            notes = sorted([n for n in names if re.match(r"ppt/notesSlides/notesSlide\d+\.xml$", n)],
                           key=_natural_key)
            return "\f".join(_xml_text(rd(n), ["</a:p>"]) for n in slides) + \
                ("\n\n" + "\n".join(_xml_text(rd(n), ["</a:p>"]) for n in notes) if notes else "")
        if ext == "xlsx":
            out = []
            if "xl/sharedStrings.xml" in names:
                out.append(_xml_text(rd("xl/sharedStrings.xml"), ["</si>"]))
            for n in sorted(names, key=_natural_key):
                if re.match(r"xl/worksheets/sheet\d+\.xml$", n):
                    s = rd(n)
                    out += [html.unescape(_TAG.sub("", m)) for m in re.findall(r"<is>.*?</is>", s)]
            return "\n".join(out)
        if ext in ("ods", "odp", "odt"):
            return _xml_text(rd("content.xml"), ["</text:p>", "</text:h>"])
        if ext == "epub":
            order = []
            try:
                cont = rd("META-INF/container.xml")
                opf = re.search(r'full-path="([^"]+)"', cont).group(1)
                base = os.path.dirname(opf)
                o = rd(opf)
                manifest = dict(re.findall(r'<item\b[^>]*?id="([^"]+)"[^>]*?href="([^"]+)"', o))
                manifest.update(dict((i, h) for h, i in
                                     re.findall(r'<item\b[^>]*?href="([^"]+)"[^>]*?id="([^"]+)"', o)))
                for idref in re.findall(r'<itemref\b[^>]*?idref="([^"]+)"', o):
                    h = manifest.get(idref)
                    if h:
                        from urllib.parse import unquote
                        p = os.path.normpath(os.path.join(base, unquote(h))).replace("\\", "/")
                        if p in names:
                            order.append(p)
            except Exception:
                order = []
            if not order:
                order = sorted([n for n in names if n.lower().endswith((".xhtml", ".html", ".htm"))],
                               key=_natural_key)
            return "\n\n".join(html_to_text(rd(n)) for n in order)
    return ""


TASKPOLICY = "/usr/sbin/taskpolicy" if os.path.exists("/usr/sbin/taskpolicy") else None


def _run(cmd, timeout):
    # 抽取進程以「實用工具」級優先級運行：建索引時不和前台應用搶 CPU 與磁盤
    if TASKPOLICY:
        cmd = [TASKPOLICY, "-c", "utility"] + cmd
    p = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, timeout=timeout)
    if p.returncode != 0:
        raise RuntimeError((p.stderr or b"").decode("utf-8", "replace")[:300] or "exit %d" % p.returncode)
    return p.stdout


def find_pdftotext():
    for c in ("/opt/homebrew/bin/pdftotext", "/usr/local/bin/pdftotext",
              "/opt/anaconda3/bin/pdftotext", shutil.which("pdftotext") or ""):
        if c and os.path.exists(c):
            return c
    return None


class Extractor(object):
    def __init__(self, helper=None):
        self.helper = helper if helper and os.path.exists(helper) else None
        self.pdftotext = find_pdftotext()

    def extract(self, path, ext, size):
        """返回 (status, text)。status: 1 成功, 2 無文字（如掃描 PDF）, 3 出錯, 4 過大, 0 不支持。"""
        if ext not in INDEXABLE:
            return 0, ""
        if size == 0:
            return 2, ""
        if ext in DATA_EXTS and size > MAX_DATA_FILE:
            return 4, ""
        if size > (MAX_PDF_FILE if ext == "pdf" else MAX_TEXT_FILE):
            return 4, ""
        try:
            if ext in TEXT_EXTS:
                with open(path, "rb") as f:
                    t = decode_bytes(f.read())
                if ext in ("html", "htm", "xhtml"):
                    t = html_to_text(t)
                elif ext == "xml":
                    t = html.unescape(_TAG.sub(" ", t))
            elif ext in ZIP_EXTS:
                t = extract_zip(path, ext)
            elif ext in ("doc", "dot"):
                t = tj_doc.text_of(path)
            elif ext in TEXTUTIL_EXTS:
                t = _run(["/usr/bin/textutil", "-convert", "txt", "-stdout",
                          "-encoding", "UTF-8", path], 180).decode("utf-8", "replace")
            elif ext == "pdf":
                t = self.extract_pdf(path)
            else:
                return 0, ""
        except Exception as e:  # noqa
            return 3, str(e)[:300]
        t = t.replace("\x00", "")
        if len(t) > MAX_CHARS:
            t = t[:MAX_CHARS]
        if not t.strip("\f \n\r\t　"):
            return 2, ""
        return 1, t

    def extract_pdf(self, path):
        if self.helper:
            try:
                return _run([self.helper, "pdftext", path], 600).decode("utf-8", "replace")
            except Exception:
                if not self.pdftotext:
                    raise
        if self.pdftotext:
            return _run([self.pdftotext, "-q", "-enc", "UTF-8", path, "-"], 600).decode("utf-8", "replace")
        raise RuntimeError("沒有可用的 PDF 文本抽取工具")
