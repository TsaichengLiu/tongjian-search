# -*- coding: utf-8 -*-
"""字形歸一：精確 / 簡繁 / 異體 三級。

所有映射都是「一字對一字」，歸一後字符串長度不變，命中位置可直接對回原文。
"""
import json
import os
import re

# 需要逐字切分的文字（漢字、部首、假名、諺文）：FTS 索引時每字前後加空格，成為獨立詞元
CJK_RANGES = (
    (0x2E80, 0x2FDF), (0x3005, 0x3007), (0x3021, 0x3029), (0x3040, 0x30FF),
    (0x31F0, 0x31FF), (0x3400, 0x4DBF), (0x4E00, 0x9FFF), (0xF900, 0xFAFF),
    (0xAC00, 0xD7AF), (0x20000, 0x3FFFF),
)
CJK_RE_CLASS = "".join(
    "%s-%s" % (re.escape(chr(a)), re.escape(chr(b))) for a, b in CJK_RANGES)
HAN_RE = re.compile("[%s]" % CJK_RE_CLASS)


def is_cjk(ch):
    o = ord(ch)
    for a, b in CJK_RANGES:
        if a <= o <= b:
            return True
    return False


def _base_map():
    """與字形無關的歸一：大小寫、全角 ASCII、全角空格。"""
    m = {}
    for o in range(0x41, 0x5B):
        m[chr(o)] = chr(o + 32)
    for o in range(0xFF01, 0xFF5F):
        m[chr(o)] = chr(o - 0xFEE0).lower()
    m["　"] = " "
    for o in list(range(0xC0, 0x250)) + list(range(0x370, 0x530)):
        ch = chr(o)
        lo = ch.lower()
        if lo != ch and len(lo) == 1:
            m[ch] = lo
    return m


class _DSU(object):
    def __init__(self):
        self.p = {}

    def find(self, x):
        p = self.p
        p.setdefault(x, x)
        r = x
        while p[r] != r:
            r = p[r]
        while p[x] != r:
            p[x], x = r, p[x]
        return r

    def union(self, a, b):
        ra, rb = self.find(a), self.find(b)
        if ra != rb:
            # 保持代表字穩定：基本區、碼位小者為代表
            if _rep_key(rb) < _rep_key(ra):
                ra, rb = rb, ra
            self.p[rb] = ra


def _rep_key(ch):
    o = ord(ch)
    return (0 if 0x4E00 <= o <= 0x9FFF else 1 if 0x3400 <= o <= 0x4DBF else 2, o)


def parse_custom(text):
    """自定義異體：每行一組，行內所有漢字視為同一字。# 開頭為註釋。"""
    groups = []
    for line in (text or "").splitlines():
        line = line.split("#", 1)[0]
        chars = [c for c in line if is_cjk(c)]
        if len(set(chars)) >= 2:
            groups.append(chars)
    return groups


class _IndexMap(dict):
    """str.translate 用：一次完成「異體歸一 + 漢字前後加空格」，按需填充。"""

    def __init__(self, full):
        dict.__init__(self)
        self.full = full

    def __missing__(self, o):
        ch = chr(o)
        r = self.full.get(ch, ch)
        v = " %s " % r if is_cjk(ch) else r
        self[o] = v
        return v


class Normalizer(object):
    LEVELS = ("exact", "st", "full")

    def __init__(self, variants_path, custom_text=""):
        with open(variants_path, encoding="utf-8") as f:
            data = json.load(f)
        self.meta = data.get("meta", {})
        st = data["st"]
        full = data["full"]
        self.custom_groups = parse_custom(custom_text)
        if self.custom_groups:
            d = _DSU()
            for ch, rep in full.items():
                d.union(rep, ch)
            for g in self.custom_groups:
                for c in g[1:]:
                    d.union(g[0], c)
            full = {}
            for ch in list(d.p):
                r = d.find(ch)
                if r != ch:
                    full[ch] = r
        base = _base_map()
        self.maps = {"exact": base, "st": dict(base), "full": dict(base)}
        self.maps["st"].update(st)
        self.maps["full"].update(full)
        self.tables = dict((k, str.maketrans(v)) for k, v in self.maps.items())
        self.inv = {}
        for lvl, m in self.maps.items():
            inv = {}
            for ch, rep in m.items():
                inv.setdefault(rep, set([rep])).add(ch)
            self.inv[lvl] = inv
        self.index_map = _IndexMap(self.maps["full"])
        self._content = {}

    def content_map(self, level):
        """模糊檢索用：歸一字形並刪去空白、標點（見 tj_fuzzy.ContentMap）。"""
        m = self._content.get(level)
        if m is None:
            from tj_fuzzy import ContentMap
            m = self._content[level] = ContentMap(self.maps[level])
        return m

    # ---- 歸一 ----
    def norm(self, s, level="full"):
        return s.translate(self.tables[level])

    def index_text(self, s):
        """寫入 FTS 的文本：異體歸一 + 逐字切分。"""
        return s.translate(self.index_map)

    def members(self, ch, level):
        m = self.maps[level]
        rep = m.get(ch, ch)
        s = set(self.inv[level].get(rep, ()))
        s.add(rep)
        s.add(ch)
        return s

    def same(self, a, b, level):
        m = self.maps[level]
        return m.get(a, a) == m.get(b, b)

    def group_info(self, ch):
        full = sorted(self.members(ch, "full"), key=_rep_key)
        st = sorted(self.members(ch, "st"), key=_rep_key)
        return {"char": ch, "st": [c for c in st if is_cjk(c)],
                "full": [c for c in full if is_cjk(c)]}
