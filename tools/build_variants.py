#!/usr/bin/env python3
"""從 Unihan 與 OpenCC 字表生成「通檢」所用的歸一字表 app/data/variants.json。

兩級歸一：
  st   —— 只用簡繁對應（Unihan kSimplified/kTraditionalVariant + OpenCC ST/TS）
  full —— 簡繁 + 異體（kSemantic/kZ/kJapaneseNew/Old/kCompatibilityVariant，
          OpenCC JP/TW/HK Variants，康熙部首與兼容區 NFKC）
各級以並查集求等價類，每類選一個代表字；輸出只列「代表字 ≠ 自身」的字。
full 的等價類是 st 的超集（st 的邊全部計入 full）。

用法： python3 tools/build_variants.py   （在項目根目錄執行）
"""
import json
import os
import re
import sys
import unicodedata
from collections import defaultdict

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, "tools", "sources")
OUT = os.path.join(ROOT, "app", "data", "variants.json")

CP = re.compile(r"U\+([0-9A-F]{4,6})")

ST_FIELDS = {"kSimplifiedVariant", "kTraditionalVariant"}
VAR_FIELDS = {"kZVariant", "kJapaneseNewVariant",
              "kJapaneseOldVariant"}
# kSpecializedSemanticVariant 只在特定語境下相通，納入會把無關字串連起來，故不收；
# kSpoofingVariant 是「易混字形」，不是異體，也不收。


def is_han(ch):
    o = ord(ch)
    return (0x3400 <= o <= 0x9FFF or 0xF900 <= o <= 0xFAFF or
            0x20000 <= o <= 0x3FFFF or 0x2E80 <= o <= 0x2FDF or o == 0x3007)


class DSU:
    def __init__(self):
        self.p = {}

    def find(self, x):
        p = self.p
        p.setdefault(x, x)
        root = x
        while p[root] != root:
            root = p[root]
        while p[x] != root:
            p[x], x = root, p[x]
        return root

    def union(self, a, b):
        ra, rb = self.find(a), self.find(b)
        if ra != rb:
            self.p[rb] = ra


def unihan_edges():
    st, var, sem = [], [], []
    with open(os.path.join(SRC, "Unihan_Variants.txt"), encoding="utf-8") as f:
        for line in f:
            if line.startswith("#") or not line.strip():
                continue
            cp, field, val = line.rstrip("\n").split("\t", 2)
            a = chr(int(cp[2:], 16))
            targets = [chr(int(h, 16)) for h in CP.findall(val)]
            if field in ST_FIELDS:
                st += [(a, b) for b in targets]
            elif field == "kSemanticVariant":
                sem += [(a, b) for b in targets]
            elif field in VAR_FIELDS:
                var += [(a, b) for b in targets]
    with open(os.path.join(SRC, "Unihan_CompatibilityVariants.txt"), encoding="utf-8") as f:
        for line in f:
            cp, _field, val = line.rstrip("\n").split("\t", 2)
            a = chr(int(cp[2:], 16))
            var += [(a, chr(int(h, 16))) for h in CP.findall(val)]
    return st, var, sem


def opencc_edges(name):
    edges = []
    with open(os.path.join(SRC, "opencc", name + ".txt"), encoding="utf-8") as f:
        for line in f:
            line = line.rstrip("\n")
            if not line or line.startswith("#"):
                continue
            key, vals = line.split("\t", 1)
            if len(key) != 1:
                continue
            edges += [(key, v) for v in vals.split() if len(v) == 1]
    return edges


def nfkc_edges():
    """康熙部首、部首補充、兼容表意文字 → 統一碼漢字（OCR 文本常見）。"""
    edges = []
    for o in list(range(0x2E80, 0x2FE0)) + list(range(0xF900, 0xFB00)) + \
            list(range(0x2F800, 0x2FA20)):
        ch = chr(o)
        n = unicodedata.normalize("NFKC", ch)
        if n != ch and len(n) == 1 and is_han(n):
            edges.append((ch, n))
    return edges


def supplement_edges():
    """tools/sources/supplement.txt：Unihan 未收、但古籍常見的舊字形／俗字對（手工補充）。"""
    edges = []
    path = os.path.join(SRC, "supplement.txt")
    if os.path.exists(path):
        with open(path, encoding="utf-8") as f:
            for line in f:
                parts = line.split()
                if len(parts) >= 2 and not line.startswith("#"):
                    edges += [(parts[0], b) for b in parts[1:] if len(b) == 1]
    return edges


def is_standard(ch):
    """GB2312 或 Big5 收錄的字視為「規範字」。"""
    for enc in ("gb2312", "big5"):
        try:
            ch.encode(enc)
            return True
        except UnicodeEncodeError:
            pass
    return False


def rep_key(ch):
    o = ord(ch)
    # 代表字：優先基本區，其次擴展 A，再其次其他；同區取碼位最小者
    tier = 0 if 0x4E00 <= o <= 0x9FFF else 1 if 0x3400 <= o <= 0x4DBF else 2
    return (tier, o)


def classes(dsu):
    groups = defaultdict(list)
    for ch in list(dsu.p):
        groups[dsu.find(ch)].append(ch)
    return [sorted(g, key=rep_key) for g in groups.values() if len(g) > 1]


def main():
    u_st, u_var, u_sem = unihan_edges()
    o_st = opencc_edges("STCharacters") + opencc_edges("TSCharacters")
    o_var = (opencc_edges("JPVariants") + opencc_edges("TWVariants") +
             opencc_edges("HKVariants"))
    st_edges = [(a, b) for a, b in u_st + o_st if a != b]
    strong = [(a, b) for a, b in u_var + o_var + nfkc_edges() + supplement_edges()
              if a != b]

    st = DSU()
    for a, b in st_edges:
        st.union(a, b)
    full = DSU()
    for a, b in st_edges + strong:
        full.union(a, b)

    # kSemanticVariant 多出自字典互見（含通假、古今字），由罕用字居中串連時會把
    # 不相干的規範字併成一類（如 敦—𠊋—龍、匝—𠂝—眾）。規則：若一條語義異體邊
    # 兩端所在的類都已含有規範字，則不合併。
    has_std = {}
    def class_has_std(r):
        return has_std.get(r, False)
    for ch in list(full.p):
        r = full.find(ch)
        if is_standard(ch):
            has_std[r] = True
    blocked = 0
    for a, b in u_sem:
        if a == b:
            continue
        ra, rb = full.find(a), full.find(b)
        if ra == rb:
            continue
        sa = class_has_std(ra) or is_standard(a)
        sb = class_has_std(rb) or is_standard(b)
        if sa and sb:
            blocked += 1
            continue
        full.union(a, b)
        has_std[full.find(a)] = sa or sb

    st_cls, full_cls = classes(st), classes(full)
    out = {"st": {}, "full": {}}
    for name, cls in (("st", st_cls), ("full", full_cls)):
        for g in cls:
            rep = g[0]
            for ch in g[1:]:
                out[name][ch] = rep

    meta = {
        "sources": "Unicode Unihan 18.0 (Unihan_Variants, kCompatibilityVariant); "
                   "OpenCC STCharacters/TSCharacters/JPVariants/TWVariants/HKVariants; "
                   "Unicode NFKC (Kangxi radicals, compatibility ideographs)",
        "st_classes": len(st_cls), "full_classes": len(full_cls),
        "st_chars": len(out["st"]) + len(st_cls),
        "full_chars": len(out["full"]) + len(full_cls),
        "semantic_edges_blocked": blocked,
    }
    out["meta"] = meta
    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    with open(OUT, "w", encoding="utf-8") as f:
        json.dump(out, f, ensure_ascii=False, separators=(",", ":"), sort_keys=True)

    print(json.dumps(meta, ensure_ascii=False, indent=1))
    sizes = sorted(full_cls, key=len, reverse=True)
    print("最大的 full 等價類：")
    for g in sizes[:15]:
        print(len(g), "".join(g))
    if "-v" in sys.argv:
        hist = defaultdict(int)
        for g in full_cls:
            hist[len(g)] += 1
        print(dict(sorted(hist.items())))


if __name__ == "__main__":
    main()
