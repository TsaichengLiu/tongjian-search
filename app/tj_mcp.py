#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""通檢的本地 MCP 服務（stdio；JSON-RPC 2.0，每行一條消息）。

讓 LLM 用通檢的索引查本機資料：簡繁異體互通、可模糊、命中帶頁碼。
- 只讀打開索引數據庫（~/Library/Application Support/TongJian/library.db），通檢開不開都能用；
- 只在 LLM 客戶端的會話期間運行，標準輸入一關閉就退出；不常駐、不聯網、不需要 API key；
- 唯一的寫操作是給文件加／去標籤、在備註末尾追加文字；不改名、不移動、不刪除任何文件。

註冊到 Claude Code：
  claude mcp add --scope user tongjian -- /usr/bin/python3 -B /Applications/通檢.app/Contents/Resources/app/tj_mcp.py
"""
import bisect
import json
import os
import re
import select
import sqlite3
import sys
import time
import traceback

HERE = os.path.dirname(os.path.abspath(__file__))
if HERE not in sys.path:
    sys.path.insert(0, HERE)

from tj_core import TAG_COLORS, Library, UserError, release_memory  # noqa: E402

NAME, TITLE, VERSION = "tongjian", "通檢", "1.0"
PROTOCOLS = ("2025-06-18", "2025-03-26", "2024-11-05")
IDLE_RELEASE = 120            # 兩分鐘沒有調用：清空全文緩存、模糊檢索字表，請分配器歸還內存
KIND_LABEL = {"pdf": "PDF", "doc": "文檔", "text": "文本", "ebook": "電子書", "sheet": "表格", "slide": "演示",
              "image": "圖片", "audio": "音頻", "video": "視頻", "archive": "壓縮包", "other": "其他",
              "folder": "文件夾"}
KINDS = ["pdf", "doc", "text", "ebook", "sheet", "slide", "image", "audio", "video", "archive", "other", "notext"]
MODE_LABEL = {"exact": "精確字形", "st": "簡繁互通", "full": "簡繁異體互通"}
SCOPE_LABEL = {"all": "名稱與全文", "content": "全文", "name": "文件名與文件夾名"}

INSTRUCTIONS = (
    "通檢：本機文件（PDF、Word、文本、電子書等）的檢索工具，簡體、繁體、異體字互通。"
    "先用 search 找文件和命中片段；要看某個文件裡的各處上下文用 find_in_file；要讀原文用 read_file（PDF 按頁讀）。"
    "片段裡【】標出命中，〔〕標出模糊命中裡與檢索詞不同的字。"
    "p.N 是 PDF 的第 N 頁（文件裡的頁序），不一定是書上印的頁碼；引用時請說明。"
    "掃描版 PDF 沒有文字層，只能按文件名找到，其內容無法讀取。"
    "list_folder 不帶參數時給出資料庫概況。add_tag／append_note 會改動用戶的標籤和備註，只在用戶要求時使用。"
)

_FILE = {
    "id": {"type": "integer", "description": "文件 id（search、list_folder 的結果裡有）"},
    "path": {"type": "string", "description": "文件的絕對路徑（與 id 二選一）"},
}
_MODE = {"type": "string", "enum": ["full", "st", "exact"], "default": "full",
         "description": "full＝簡繁異體互通（默認）；st＝只簡繁互通；exact＝只匹配原字形"}
_FUZZY = {"type": "number", "minimum": 0.5, "maximum": 0.95,
          "description": "模糊檢索的相似度下限（如 0.8）：容許脫字、衍字、訛字，空白標點不計；3 字以上的詞才生效。不填則不模糊"}
_RO = {"readOnlyHint": True, "destructiveHint": False, "idempotentHint": True, "openWorldHint": False}

TOOLS = [
    {"name": "search", "title": "檢索文件名與全文",
     "description": ("在通檢的索引裡檢索本機文件（文件名、文件夾名、全文），簡繁異體互通（查「万历」可得「萬曆」「萬歷」）。"
                     "語法：空格＝且，|＝或，-詞＝排除，\"…\"＝含空格的西文短語。fuzzy 可容許異文，適合拿一句原文找它被引用、轉錄的地方。"
                     "返回每個文件的 id、路徑、頁數和帶頁碼的命中片段；query 為空時按篩選條件列出文件。"),
     "inputSchema": {"type": "object", "properties": {
         "query": {"type": "string", "description": "檢索詞"},
         "scope": {"type": "string", "enum": ["all", "content", "name"], "default": "all",
                   "description": "all＝名稱與全文（默認）；content＝只查全文；name＝只查文件名和文件夾名"},
         "mode": _MODE, "fuzzy": _FUZZY,
         "folders": {"type": "array", "items": {"type": "string"},
                     "description": "只在這些文件夾（含子文件夾）裡檢索，絕對路徑"},
         "file_ids": {"type": "array", "items": {"type": "integer"}, "description": "只在這些文件裡檢索"},
         "kind": {"type": "string", "enum": KINDS, "description": "只看某類文件；notext＝沒有文字層的 PDF"},
         "extensions": {"type": "array", "items": {"type": "string"}, "description": "只看這些擴展名，如 [\"pdf\", \"caj\"]"},
         "tag": {"type": "string", "description": "只看帶這個標籤的文件"},
         "starred": {"type": "boolean", "description": "只看收藏的文件"},
         "sort": {"type": "string", "enum": ["relevance", "hits", "mtime", "name", "size"], "default": "relevance"},
         "limit": {"type": "integer", "minimum": 1, "maximum": 100, "default": 20,
                   "description": "最多返回多少個文件（默認 20）"}},
         "required": ["query"]},
     "annotations": _RO},
    {"name": "find_in_file", "title": "在一個文件內查找",
     "description": "在一個文件的全文裡查找檢索詞，返回每處命中前後的原文、頁碼和字符位置（可再用 read_file 的 offset 讀更多）。",
     "inputSchema": {"type": "object", "properties": dict(_FILE, **{
         "query": {"type": "string", "description": "檢索詞（語法同 search）"},
         "mode": _MODE, "fuzzy": _FUZZY,
         "context": {"type": "integer", "minimum": 10, "maximum": 600, "default": 80,
                     "description": "命中前後各帶多少字"},
         "limit": {"type": "integer", "minimum": 1, "maximum": 200, "default": 30, "description": "最多列出多少處"}}),
         "required": ["query"]},
     "annotations": _RO},
    {"name": "read_file", "title": "讀原文",
     "description": ("讀一個文件抽取出的文本。分頁的文件（PDF 等）可按頁讀：pages 如 \"12\" 或 \"12-15\"；"
                     "也可按字符位置讀：offset、length。一次最多 20000 字。"),
     "inputSchema": {"type": "object", "properties": dict(_FILE, **{
         "pages": {"type": "string", "description": "頁碼或頁碼範圍，如 \"12\"、\"12-15\"（PDF 的第幾頁）"},
         "offset": {"type": "integer", "minimum": 0, "description": "從第幾個字開始（默認 0）"},
         "length": {"type": "integer", "minimum": 100, "maximum": 20000, "default": 6000,
                    "description": "最多讀多少字（默認 6000）"}})},
     "annotations": _RO},
    {"name": "list_folder", "title": "資料庫概況與文件夾結構",
     "description": ("不給 path：列出資料庫概況（收錄了哪些文件夾、多少文件和字數、標籤）。"
                     "給 path：列出它的子文件夾（附含子文件夾在內的文件數）和直屬文件（附 id）。"),
     "inputSchema": {"type": "object", "properties": {
         "path": {"type": "string", "description": "文件夾的絕對路徑"},
         "depth": {"type": "integer", "minimum": 1, "maximum": 4, "default": 1, "description": "子文件夾列幾層"},
         "files": {"type": "boolean", "default": True, "description": "是否列出直屬文件"},
         "limit": {"type": "integer", "minimum": 1, "maximum": 500, "default": 100, "description": "最多列多少個文件"}}},
     "annotations": _RO},
    {"name": "file_info", "title": "文件信息",
     "description": "一個或多個文件的路徑、類型、大小、修改時間、頁數、字數、有無文字層、收藏、標籤和備註全文。",
     "inputSchema": {"type": "object", "properties": {
         "ids": {"type": "array", "items": {"type": "integer"}, "description": "文件 id"},
         "paths": {"type": "array", "items": {"type": "string"}, "description": "文件的絕對路徑"}}},
     "annotations": _RO},
    {"name": "variants", "title": "查簡繁異體",
     "description": "查漢字在通檢字表裡的簡繁、異體對應（字表來自 Unihan、OpenCC，另加用戶自定義的異體字）。",
     "inputSchema": {"type": "object", "properties": {"chars": {"type": "string", "description": "要查的字，可多個"}},
                     "required": ["chars"]},
     "annotations": _RO},
    {"name": "list_tags", "title": "列出標籤",
     "description": "列出用戶在通檢裡建的所有標籤及各自的文件數。按標籤找文件用 search 的 tag 參數。",
     "inputSchema": {"type": "object", "properties": {}},
     "annotations": _RO},
    {"name": "add_tag", "title": "加／去標籤",
     "description": "給文件加上（或用 remove 去掉）一個標籤；標籤不存在時新建。會改動用戶的數據，只在用戶要求時使用。",
     "inputSchema": {"type": "object", "properties": {
         "ids": {"type": "array", "items": {"type": "integer"}, "description": "文件 id"},
         "tag": {"type": "string", "description": "標籤名"},
         "remove": {"type": "boolean", "default": False, "description": "true＝去掉這個標籤"}},
         "required": ["ids", "tag"]},
     "annotations": {"readOnlyHint": False, "destructiveHint": False, "idempotentHint": True, "openWorldHint": False}},
    {"name": "append_note", "title": "追加備註",
     "description": "在一個文件的備註末尾追加一段文字（不覆蓋原有備註）。會改動用戶的數據，只在用戶要求時使用。",
     "inputSchema": {"type": "object", "properties": dict(_FILE, **{
         "text": {"type": "string", "description": "要追加的文字"}}),
         "required": ["text"]},
     "annotations": {"readOnlyHint": False, "destructiveHint": False, "idempotentHint": False, "openWorldHint": False}},
]


# ======================================================================= 格式化
class ToolError(Exception):
    pass


def _clamp(v, lo, hi, default):
    try:
        v = int(v)
    except (TypeError, ValueError):
        return default
    return max(lo, min(hi, v))


def _fuzzy(a):
    v = a.get("fuzzy")
    if v in (None, "", False, 0):
        return None
    try:
        return max(0.5, min(0.95, float(v)))
    except (TypeError, ValueError):
        raise ToolError("fuzzy 應為 0.5–0.95 之間的數，如 0.8")


def _mode(a):
    m = a.get("mode") or "full"
    if m not in MODE_LABEL:
        raise ToolError("mode 只能是 full、st 或 exact")
    return m


def fmt_size(n):
    n = float(n or 0)
    for u in ("B", "KB", "MB", "GB"):
        if n < 1024 or u == "GB":
            return ("%d %s" % (n, u)) if u == "B" else ("%.1f %s" % (n, u))
        n /= 1024


def fmt_time(t):
    return time.strftime("%Y-%m-%d", time.localtime(t)) if t and t > 0 else ""


def mark_segs(segs):
    """[[文字, 類型]] → 文本：命中用【】，模糊命中裡與檢索詞不同的字用〔〕。"""
    out, inhit = [], False
    for sg in segs:
        t, k = sg[0], sg[1]
        if k and not inhit:
            out.append("【")
            inhit = True
        elif not k and inhit:
            out.append("】")
            inhit = False
        out.append("〔%s〕" % t if k == 3 else t)
    if inhit:
        out.append("】")
    return "".join(out)


def page_starts(text):
    if "\f" not in text:
        return None
    return [0] + [m.end() for m in re.finditer("\f", text)]


def near_empty(r):
    """幾乎沒有文字層的 PDF（與 tj_core.NEAR_EMPTY_SQL 一致）。"""
    return r["kind"] == "pdf" and (r["status"] == 2 or (r["status"] == 1 and (r["pages"] or 0) >= 20
                                                        and (r["chars"] or 0) < r["pages"] * 20))


def status_note(r):
    if r["status"] == 2:
        return "沒有文字層（多為掃描件），只能按文件名找到" if r["kind"] == "pdf" else "沒有可抽取的文字"
    if r["status"] == 3:
        return "抽取文字時出錯"
    if r["status"] == 4:
        return "文件太大，未抽取全文"
    if r["status"] == 0:
        return "全文尚未索引（或這類文件只收文件名）"
    return ""


# ======================================================================= 服務
class Service(object):
    def __init__(self, db):
        self.db = db
        self._lib = None
        self.last = time.time()
        self.released = True

    @property
    def lib(self):
        if self._lib is None:
            try:
                self._lib = Library(self.db, os.path.join(HERE, "data", "variants.json"),
                                    log=lambda *a: None, readonly=True)
            except UserError as e:
                raise ToolError(str(e))
        self.released = False
        return self._lib

    def idle(self):
        if self._lib is not None and not self.released and time.time() - self.last > IDLE_RELEASE:
            lib = self._lib
            lib.text_cache.clear()
            lib.norm.drop_content_maps()
            lib.names.drop_fuzzy()
            release_memory()
            self.released = True

    def call(self, name, a):
        fn = getattr(self, "t_" + name, None) if name in set(t["name"] for t in TOOLS) else None
        if fn is None:
            return {"content": [{"type": "text", "text": "沒有這個工具：%s" % name}], "isError": True}
        try:
            text = fn(a or {})
            return {"content": [{"type": "text", "text": text}]}
        except (ToolError, UserError) as e:
            return {"content": [{"type": "text", "text": str(e)}], "isError": True}
        except sqlite3.OperationalError as e:
            traceback.print_exc(file=sys.stderr)
            return {"content": [{"type": "text", "text": "讀取資料庫出錯（%s）；通檢可能正在重建索引，請稍後再試" % e}],
                    "isError": True}
        except Exception as e:  # noqa
            traceback.print_exc(file=sys.stderr)
            return {"content": [{"type": "text", "text": "出錯：%s: %s" % (type(e).__name__, e)}], "isError": True}
        finally:
            self.last = time.time()

    # ---------------------------------------------------------------- 工具
    def _file(self, a):
        c = self.lib.conn()
        if a.get("id") is not None:
            r = c.execute("SELECT * FROM files WHERE id=?", (_clamp(a["id"], 1, 1 << 62, 0),)).fetchone()
        elif a.get("path"):
            p = os.path.realpath(os.path.expanduser(a["path"]))
            r = c.execute("SELECT * FROM files WHERE path=?", (p,)).fetchone()
        else:
            raise ToolError("請給出文件的 id 或 path")
        if r is None:
            raise ToolError("通檢的資料庫裡沒有這個文件（id 或路徑不對，或它不在已收錄的文件夾裡）")
        return r

    def _text(self, r):
        if r["status"] != 1:
            raise ToolError("《%s》%s。" % (r["name"], status_note(r) or "沒有全文"))
        text = self.lib.get_text(r["id"])
        if text is None:
            raise ToolError("《%s》的全文不在索引裡" % r["name"])
        return text

    def _tag_names(self):
        return dict((t["id"], t["name"]) for t in self.lib.tags())

    def t_search(self, a):
        lib = self.lib
        q = (a.get("query") or "").strip()
        mode, fz = _mode(a), _fuzzy(a)
        scope = a.get("scope") or "all"
        if scope not in SCOPE_LABEL:
            raise ToolError("scope 只能是 all、content 或 name")
        limit = _clamp(a.get("limit"), 1, 100, 20)
        # 多覆核一些再排序截取：返回的是最好的 limit 個，而不只是最先覆核到的
        p = {"q": q, "mode": mode, "scope": scope, "sort": a.get("sort") or "relevance",
             "limit": min(200, max(60, limit * 3)), "budget": 10}
        if fz:
            p["fuzzy"], p["sim"] = "1", str(fz)
        filt = []
        if a.get("folders"):
            dirs = [os.path.realpath(os.path.expanduser(d)) for d in a["folders"] if d]
            p["dirs"] = json.dumps(dirs, ensure_ascii=False)
            filt.append("只在 " + "、".join(dirs))
        if a.get("file_ids"):
            p["ids"] = ",".join(str(_clamp(x, 1, 1 << 62, 0)) for x in a["file_ids"])
            filt.append("只在 %d 個指定文件中" % len(a["file_ids"]))
        if a.get("extensions"):
            exts = [str(x).strip().lstrip(".").lower() for x in a["extensions"] if str(x).strip()]
            p["exts"] = ",".join(exts)
            filt.append("擴展名 " + "、".join(exts))
        if a.get("kind"):
            if a["kind"] not in KINDS:
                raise ToolError("kind 只能是：" + "、".join(KINDS))
            p["kind"] = a["kind"]
            filt.append("無文字層的 PDF" if a["kind"] == "notext" else "只看" + KIND_LABEL[a["kind"]])
        tags = self._tag_names()
        if a.get("tag"):
            tid = [i for i, n in tags.items() if n == a["tag"].strip()]
            if not tid:
                raise ToolError("沒有叫「%s」的標籤。現有標籤：%s" % (a["tag"], "、".join(sorted(tags.values())) or "（無）"))
            p["tag"] = tid[0]
            filt.append("標籤「%s」" % a["tag"])
        if a.get("starred"):
            p["starred"] = "1"
            filt.append("已收藏")
        if not q and not filt:
            raise ToolError("請給出檢索詞（或至少一個篩選條件）")
        t0 = time.time()
        r = lib.search(p)
        dt = time.time() - t0
        items = r["items"][:limit]
        if q:
            n_all = len(r["items"])
            head = "檢索「%s」（%s%s · %s%s）：%s%d 項" % (
                q, MODE_LABEL[mode], " · 模糊 ≥ %d%%" % round(fz * 100) if fz else "", SCOPE_LABEL[scope],
                "；" + "，".join(filt) if filt else "", "至少 " if r.get("truncated") else "", n_all)
            if len(items) < n_all:
                head += "，列出前 %d 項" % len(items)
            hits = sum(x.get("hits") or 0 for x in r["items"])
            if hits:
                head += "，全文命中 %d 處" % hits
            head += "，%.1f 秒" % dt
            if r.get("truncated"):
                head += "（未查完：可縮小範圍、提高相似度，或用 find_in_file 逐個文件查）"
        else:
            n_all = r.get("total", len(r["items"]))
            head = "列出文件（%s，按%s）：共 %d 項" % ("，".join(filt), {
                "relevance": "修改時間", "mtime": "修改時間", "hits": "修改時間", "name": "文件名", "size": "大小"}.get(
                p["sort"], "修改時間"), n_all)
            if len(items) < n_all:
                head += "，列出前 %d 項" % len(items)
        if fz and not r.get("fuzzy_terms"):
            head += "\n註：檢索詞都不足 3 字（或相似度太高），按原方式匹配。"
        lines = [head]
        for k, it in enumerate(items, 1):
            name = mark_segs(it["name_segs"]) if it.get("name_segs") else it["name"]
            sim = it.get("sim")
            if it.get("folder"):
                lines.append("%d. [文件夾] %s" % (k, name))
                meta = [it["path"], "%d 個文件" % it.get("count", 0)]
                if sim is not None and sim < 1:
                    meta.append("相似 %d%%" % round(sim * 100))
                lines.append("   " + " · ".join(meta))
                continue
            lines.append("%d. [id %d] %s%s" % (k, it["id"], name, " ★" if it.get("starred") else ""))
            meta = [os.path.join(it["dir"], it["name"]),
                    KIND_LABEL.get(it["kind"], it["kind"]) + (" %d 頁" % it["pages"] if it.get("pages") else ""),
                    fmt_size(it["size"]), fmt_time(it["mtime"])]
            if it.get("hits"):
                meta.append("全文命中 %d%s 處" % (it["hits"], "+" if it.get("capped") else ""))
            if sim is not None and sim < 1:
                meta.append("最接近處相似 %d%%" % round(sim * 100))
            if near_empty(it):
                meta.append("無文字層" if it["status"] == 2 else "幾乎無文字層（掃描件）")
            if it.get("tags"):
                meta.append("標籤：" + "、".join(tags.get(t, "?") for t in it["tags"]))
            if it.get("dups"):
                meta.append("另有 %d 個內容相同的副本：%s" % (len(it["dups"]), "；".join(
                    "[id %d] %s" % (d["id"], os.path.join(d["dir"], d["name"])) for d in it["dups"][:5])))
            lines.append("   " + " · ".join(x for x in meta if x))
            for sn in it.get("snippets") or []:
                lines.append("   " + ("p.%d " % sn["page"] if sn.get("page") else "") + mark_segs(sn["segs"]))
        return "\n".join(lines)

    def t_find_in_file(self, a):
        lib = self.lib
        r = self._file(a)
        q = (a.get("query") or "").strip()
        if not q:
            raise ToolError("請給出檢索詞")
        text = self._text(r)
        mode, fz = _mode(a), _fuzzy(a)
        spans, diffs, _ = lib.doc_hits(text, q, mode, fz, cap=5000, u16=False)
        merged = []
        for s, e in sorted(spans):
            if merged and s <= merged[-1][1]:
                merged[-1][1] = max(merged[-1][1], e)
            else:
                merged.append([s, e])
        ctx = _clamp(a.get("context"), 10, 600, 80)
        limit = _clamp(a.get("limit"), 1, 200, 30)
        dset = set(diffs)
        ps = page_starts(text)
        head = "「%s」在《%s》中（%s%s）：%d 處" % (q, r["name"], MODE_LABEL[mode],
                                            " · 模糊 ≥ %d%%" % round(fz * 100) if fz else "", len(merged))
        if len(merged) > limit:
            head += "，列出前 %d 處" % limit
        lines = [head, "路徑：%s · 全文 %d 字%s" % (r["path"], len(text), " · %d 頁" % (len(ps)) if ps else "")]
        for k, (s, e) in enumerate(merged[:limit], 1):
            a0, b0 = max(0, s - ctx), min(len(text), e + ctx)
            hit = "".join("〔%s〕" % ch if i in dset else ch for i, ch in zip(range(s, e), text[s:e]))
            seg = (text[a0:s] + "【" + hit + "】" + text[e:b0]).replace("\f", " ｜ ")
            seg = re.sub(r"[ \t\r\n　]+", " ", seg).strip()
            pg = "p.%d " % bisect.bisect_right(ps, s) if ps else ""
            lines.append("%d. %s[位置 %d] %s%s%s" % (k, pg, s, "…" if a0 > 0 else "", seg, "…" if b0 < len(text) else ""))
        return "\n".join(lines)

    def t_read_file(self, a):
        r = self._file(a)
        text = self._text(r)
        ps = page_starts(text)
        maxlen = _clamp(a.get("length"), 100, 20000, 6000)
        head = "《%s》 %s · %s%s · 全文 %d 字" % (r["name"], r["path"], KIND_LABEL.get(r["kind"], r["kind"]),
                                         " · %d 頁" % len(ps) if ps else "", len(text))
        if a.get("pages"):
            if not ps:
                raise ToolError("《%s》不分頁（共 %d 字），請用 offset 和 length 讀" % (r["name"], len(text)))
            m = re.match(r"^\s*(\d+)\s*(?:[-–—~至到]\s*(\d+))?\s*$", str(a["pages"]))
            if not m:
                raise ToolError("pages 的寫法如 \"12\" 或 \"12-15\"")
            p1 = int(m.group(1))
            p2 = int(m.group(2) or p1)
            n = len(ps)
            if p1 < 1 or p1 > n:
                raise ToolError("頁碼超出範圍：《%s》共 %d 頁" % (r["name"], n))
            p2 = max(p1, min(p2, n))
            out, used, last = [], 0, p1 - 1
            for pg in range(p1, p2 + 1):
                a0 = ps[pg - 1]
                b0 = ps[pg] - 1 if pg < n else len(text)
                body = text[a0:b0].strip("\f")
                if used and used + len(body) > maxlen:
                    break
                if len(body) > maxlen - used:
                    body = body[:maxlen - used] + "……（本頁超出長度上限，可用 offset=%d 接著讀）" % (a0 + maxlen - used)
                out.append("〔第 %d 頁〕\n%s" % (pg, body))
                used += len(body)
                last = pg
            tail = ""
            if last < p2:
                tail = "\n（只讀到第 %d 頁：超出一次 %d 字的上限，請從第 %d 頁接著讀）" % (last, maxlen, last + 1)
            return head + "\n註：頁碼是 PDF 的頁序，不一定是書上印的頁碼。\n\n" + "\n\n".join(out) + tail
        off = _clamp(a.get("offset"), 0, len(text), 0)
        end = min(len(text), off + maxlen)
        chunk = text[off:end]
        if ps:
            pg = bisect.bisect_right(ps, off)
            parts, cur = [], pg
            pieces = chunk.split("\f")
            for i, piece in enumerate(pieces):
                if i:
                    cur += 1
                    parts.append("\n〔第 %d 頁〕\n" % cur)
                parts.append(piece)
            chunk = "〔第 %d 頁%s〕\n" % (pg, "（接上）" if off > ps[pg - 1] else "") + "".join(parts)
        tail = "\n\n（未完：還有 %d 字，可用 offset=%d 接著讀）" % (len(text) - end, end) if end < len(text) else ""
        return head + "\n本次：第 %d–%d 字\n\n" % (off, end) + chunk + tail

    def t_list_folder(self, a):
        lib = self.lib
        c = lib.conn()
        if not a.get("path"):
            st = lib.stats()
            chars = ("%.1f 億" % (st["chars"] / 1e8)) if st["chars"] >= 1e8 else ("%d 萬" % round(st["chars"] / 1e4))
            lines = ["通檢資料庫：%d 個文件，其中 %d 個有全文，共約 %s字；沒有文字層的 PDF %d 個；收藏 %d 個。" % (
                st["files"], st["texts"], chars, st["notext"], st["starred"])]
            kinds = sorted(st["kinds"].items(), key=lambda x: -x[1])
            lines.append("類型：" + "、".join("%s %d" % (KIND_LABEL.get(k, k), n) for k, n in kinds))
            lines.append("收錄的文件夾：")
            for ro in lib.roots():
                lines.append("- %s（%d 個文件%s）" % (ro["path"], ro["files"],
                                                 "；未找到，可能是外接磁盤未連接" if ro["missing"] else ""))
            tags = lib.tags()
            if tags:
                lines.append("標籤：" + "、".join("%s（%d）" % (t["name"], t["count"]) for t in tags))
            return "\n".join(lines)
        path = os.path.realpath(os.path.expanduser(a["path"])).rstrip("/")
        roots = c.execute("SELECT id, path FROM roots").fetchall()
        if lib.root_for(path, roots) is None:
            raise ToolError("這個文件夾不在通檢的資料庫裡。收錄的文件夾：" + "、".join(r[1] for r in roots))
        agg, _ = lib._folder_stats(c, {"dir": path})
        depth = _clamp(a.get("depth"), 1, 4, 1)
        me = agg.get(path)
        total = me[1] if me else 0
        direct = c.execute("SELECT COUNT(*) FROM files WHERE dir=?", (path,)).fetchone()[0]
        lines = ["%s：共 %d 個文件（含子文件夾），直屬 %d 個" % (path, total, direct)]
        key = lib.coll.key
        subs = [d for d in agg if d.startswith(path + "/") and d[len(path) + 1:].count("/") < depth]
        subs.sort(key=lambda d: [key(x) for x in d[len(path) + 1:].split("/")])
        if subs:
            lines.append("子文件夾：")
            for d in subs[:1000]:
                rel = d[len(path) + 1:]
                lv = rel.count("/")
                lines.append("%s%s/（%d 個文件）" % ("  " * (lv + 1), rel.split("/")[-1], agg[d][1]))
            if len(subs) > 1000:
                lines.append("  ……還有 %d 個子文件夾" % (len(subs) - 1000))
        if a.get("files", True) and direct:
            limit = _clamp(a.get("limit"), 1, 500, 100)
            files = lib._dir_files(c, [path], limit=limit)
            lines.append("直屬文件%s：" % ("（前 %d 個）" % limit if direct > limit else ""))
            for f in files:
                meta = [KIND_LABEL.get(f["kind"], f["kind"]) + (" %d 頁" % f["pages"] if f.get("pages") else ""),
                        fmt_size(f["size"]), fmt_time(f["mtime"])]
                if near_empty(f):
                    meta.append("無文字層" if f["status"] == 2 else "幾乎無文字層")
                lines.append("  [id %d] %s · %s" % (f["id"], f["name"], " · ".join(meta)))
        return "\n".join(lines)

    def t_file_info(self, a):
        refs = [{"id": i} for i in (a.get("ids") or [])] + [{"path": p} for p in (a.get("paths") or [])]
        if not refs:
            raise ToolError("請給出 ids 或 paths")
        tags = self._tag_names()
        c = self.lib.conn()
        out = []
        for ref in refs[:50]:
            try:
                r = self._file(ref)
            except ToolError as e:
                out.append("%s：%s" % (ref.get("id") or ref.get("path"), e))
                continue
            tids = [t[0] for t in c.execute("SELECT tag_id FROM file_tags WHERE file_id=?", (r["id"],))]
            lines = ["[id %d] %s" % (r["id"], r["name"]),
                     "  路徑：%s%s" % (r["path"], "" if os.path.exists(r["path"]) else "（文件已不在原處）"),
                     "  類型：%s（.%s） · %s · 修改於 %s" % (KIND_LABEL.get(r["kind"], r["kind"]), r["ext"],
                                                       fmt_size(r["size"]), fmt_time(r["mtime"]))]
            if r["status"] == 1:
                lines.append("  全文：%d 字%s%s" % (r["chars"], " · %d 頁" % r["pages"] if r["pages"] else "",
                                                 "（幾乎沒有文字層，多為掃描件）" if near_empty(r) else ""))
            else:
                lines.append("  全文：" + status_note(r))
            if r["starred"]:
                lines.append("  已收藏")
            if tids:
                lines.append("  標籤：" + "、".join(tags.get(t, "?") for t in tids))
            if (r["note"] or "").strip():
                lines.append("  備註：\n    " + r["note"].strip().replace("\n", "\n    "))
            out.append("\n".join(lines))
        return "\n\n".join(out)

    def t_variants(self, a):
        chars = (a.get("chars") or "").strip()
        if not chars:
            raise ToolError("請給出要查的字")
        def plain(x):                           # 不列兼容漢字、康熙部首等與正字同形的碼位
            o = ord(x)
            return not (0xF900 <= o <= 0xFAFF or 0x2F800 <= o <= 0x2FA1F or 0x2E80 <= o <= 0x2FDF)
        lines = []
        for g in self.lib.variants(chars):
            st = [x for x in g["st"] if x != g["char"] and plain(x)]
            full = [x for x in g["full"] if x != g["char"] and x not in st and plain(x)]
            lines.append("%s：簡繁 %s；其他異體 %s" % (g["char"], "".join(st) or "（無）", "".join(full) or "（無）"))
        return "\n".join(lines) or "沒有漢字"

    def t_list_tags(self, a):
        tags = self.lib.tags()
        if not tags:
            return "還沒有標籤。"
        return "\n".join("- %s（%d 個文件）" % (t["name"], t["count"]) for t in tags)

    # ---------------------------------------------------------------- 寫操作（另開讀寫連接，用完即關）
    def _writer(self):
        if not os.path.exists(self.db):
            raise ToolError("找不到通檢的資料庫")
        w = sqlite3.connect(self.db, timeout=30)
        w.execute("PRAGMA busy_timeout=30000")
        return w

    def t_add_tag(self, a):
        name = (a.get("tag") or "").strip()
        ids = sorted(set(_clamp(i, 1, 1 << 62, 0) for i in (a.get("ids") or [])) - {0})
        if not name or not ids:
            raise ToolError("請給出標籤名和文件 id")
        remove = bool(a.get("remove"))
        w = self._writer()
        try:
            found = [r[0] for r in w.execute("SELECT id FROM files WHERE id IN (%s)" % ",".join("?" * len(ids)), ids)]
            missing = sorted(set(ids) - set(found))
            row = w.execute("SELECT id FROM tags WHERE name=?", (name,)).fetchone()
            if remove:
                if not row:
                    return "沒有叫「%s」的標籤，無需去掉。" % name
                w.executemany("DELETE FROM file_tags WHERE file_id=? AND tag_id=?", [(i, row[0]) for i in found])
            else:
                if row:
                    tid = row[0]
                else:
                    n = w.execute("SELECT COUNT(*) FROM tags").fetchone()[0]
                    tid = w.execute("INSERT INTO tags(name, color) VALUES(?,?)",
                                    (name, TAG_COLORS[n % len(TAG_COLORS)])).lastrowid
                w.executemany("INSERT OR IGNORE INTO file_tags(file_id, tag_id) VALUES(?,?)", [(i, tid) for i in found])
            w.commit()
        finally:
            w.close()
        msg = "已給 %d 個文件%s標籤「%s」。" % (len(found), "去掉" if remove else "加上", name)
        if not remove and not row:
            msg += "（新建了這個標籤）"
        if missing:
            msg += " 這些 id 不在資料庫裡：%s" % "、".join(map(str, missing))
        return msg + " 通檢界面在下次刷新時顯示。"

    def t_append_note(self, a):
        r = self._file(a)
        text = (a.get("text") or "").strip()
        if not text:
            raise ToolError("請給出要追加的文字")
        w = self._writer()
        try:
            cur = w.execute("SELECT note FROM files WHERE id=?", (r["id"],)).fetchone()
            old = (cur[0] if cur else "") or ""
            new = (old.rstrip() + "\n\n" + text) if old.strip() else text
            w.execute("UPDATE files SET note=? WHERE id=?", (new, r["id"]))
            w.commit()
        finally:
            w.close()
        return "已在《%s》的備註末尾追加 %d 字（備註現共 %d 字）。" % (r["name"], len(text), len(new))


# ======================================================================= JSON-RPC
def send(msg):
    sys.stdout.buffer.write(json.dumps(msg, ensure_ascii=False).encode("utf-8") + b"\n")
    sys.stdout.buffer.flush()


def handle(svc, msg):
    if not isinstance(msg, dict):
        return send({"jsonrpc": "2.0", "id": None, "error": {"code": -32600, "message": "Invalid Request"}})
    mid, method = msg.get("id"), msg.get("method")
    if method is None:
        return                                   # 客戶端發來的響應，本服務不發請求，忽略
    params = msg.get("params") or {}
    try:
        if method == "initialize":
            pv = params.get("protocolVersion")
            res = {"protocolVersion": pv if pv in PROTOCOLS else PROTOCOLS[0],
                   "capabilities": {"tools": {"listChanged": False}},
                   "serverInfo": {"name": NAME, "title": TITLE, "version": VERSION},
                   "instructions": INSTRUCTIONS}
        elif method == "ping":
            res = {}
        elif method == "tools/list":
            res = {"tools": TOOLS}
        elif method == "tools/call":
            res = svc.call(params.get("name"), params.get("arguments") or {})
        elif method.startswith("notifications/"):
            return
        else:
            if mid is not None:
                send({"jsonrpc": "2.0", "id": mid, "error": {"code": -32601, "message": "Method not found: %s" % method}})
            return
    except Exception as e:  # noqa
        traceback.print_exc(file=sys.stderr)
        if mid is not None:
            send({"jsonrpc": "2.0", "id": mid, "error": {"code": -32603, "message": str(e)}})
        return
    if mid is not None:
        send({"jsonrpc": "2.0", "id": mid, "result": res})


def main():
    # 與後台服務相同：讓分配器及時歸還已釋放的大塊內存
    if sys.platform == "darwin" and os.environ.get("MallocSpaceEfficient") != "1":
        env = dict(os.environ, MallocSpaceEfficient="1")
        os.execve(sys.executable, [sys.executable, "-B", os.path.abspath(__file__)] + sys.argv[1:], env)
    db = os.environ.get("TONGJIAN_DB") or os.path.join(
        os.path.expanduser("~/Library/Application Support/TongJian"), "library.db")
    if "--db" in sys.argv[1:-1]:
        db = sys.argv[sys.argv.index("--db") + 1]
    svc = Service(db)
    fd = sys.stdin.fileno()
    buf = b""
    while True:
        ready, _, _ = select.select([fd], [], [], 30)
        if not ready:
            svc.idle()
            continue
        chunk = os.read(fd, 1 << 16)
        if not chunk:
            break                                # 客戶端關閉標準輸入：退出
        buf += chunk
        while b"\n" in buf:
            line, buf = buf.split(b"\n", 1)
            line = line.strip()
            if not line:
                continue
            try:
                msg = json.loads(line.decode("utf-8"))
            except ValueError:
                send({"jsonrpc": "2.0", "id": None, "error": {"code": -32700, "message": "Parse error"}})
                continue
            for m in (msg if isinstance(msg, list) else [msg]):
                handle(svc, m)


if __name__ == "__main__":
    main()
