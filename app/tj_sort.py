# -*- coding: utf-8 -*-
"""文件名排序：中文按拼音／筆畫／部首（macOS 自帶 ICU），數字按數值，編號裡的中文數字也按數值。

sort_key(name) 返回 bytes，直接用 memcmp 比較即可，故可存入 SQLite 並 ORDER BY。
"""
import ctypes
import re
import subprocess
import threading

SORT_VERSION = 1
COLLATIONS = ("pinyin", "stroke", "unihan", "unicode")

CN_DIGITS = {"〇": 0, "零": 0, "一": 1, "二": 2, "兩": 2, "两": 2, "三": 3, "四": 4, "五": 5, "六": 6,
             "七": 7, "八": 8, "九": 9, "壹": 1, "貳": 2, "贰": 2, "參": 3, "叁": 3, "参": 3, "肆": 4,
             "伍": 5, "陸": 6, "陆": 6, "柒": 7, "捌": 8, "玖": 9}
CN_UNITS = {"十": 10, "拾": 10, "百": 100, "佰": 100, "千": 1000, "仟": 1000,
            "萬": 10000, "万": 10000, "億": 10 ** 8, "亿": 10 ** 8}
NUM_RUN = re.compile("[%s%s]+" % ("".join(CN_DIGITS), "".join(CN_UNITS)))
# 編號標記：卷十二、第三冊、萬曆十五年、十二卷……
PREFIX = set("卷第冊册篇章回號号頁页期輯辑部集編编之其葉叶函")
SUFFIX = set("卷冊册章回篇年月日號号頁页期輯辑部集編编本種种次葉叶函")


def _is_han(ch):
    o = ord(ch)
    return 0x3400 <= o <= 0x9FFF or 0xF900 <= o <= 0xFAFF or 0x20000 <= o <= 0x3FFFF


def cn2int(s):
    if all(c in CN_DIGITS for c in s):            # 一九四九、二〇二四
        return int("".join(str(CN_DIGITS[c]) for c in s))
    total = section = number = 0
    for c in s:
        if c in CN_DIGITS:
            number = CN_DIGITS[c]
        else:
            u = CN_UNITS[c]
            if u < 10000:
                section += (number or 1) * u
            else:
                total += (section + number) * u
                section = 0
            number = 0
    return total + section + number


def natural(name):
    """把編號裡的中文數字換成阿拉伯數字（其餘不動），供排序用。"""
    out, last = [], 0
    for m in NUM_RUN.finditer(name):
        run = m.group()
        if not any(c in CN_DIGITS or c in "十拾" for c in run):
            continue                                   # 單獨的「萬」「千」（萬曆、千頃堂）不是數字
        a, b = m.span()
        prev = name[a - 1] if a > 0 else ""
        nxt = name[b] if b < len(name) else ""
        isolated = (not prev or not _is_han(prev)) and (not nxt or not _is_han(nxt))
        if not (prev in PREFIX or nxt in SUFFIX or isolated):
            continue                                   # 三國志、二十四史：書名，不按數字
        try:
            v = cn2int(run)
        except (KeyError, ValueError):
            continue
        out.append(name[last:a])
        out.append(str(v))
        last = b
    out.append(name[last:])
    return "".join(out)


def system_collation():
    """跟隨系統設置（系統設置 → 通用 → 語言與地區 → 排序順序）。"""
    try:
        v = subprocess.run(["/usr/bin/defaults", "read", "-g", "AppleCollationOrder"],
                           capture_output=True, text=True, timeout=3).stdout.strip()
    except Exception:  # noqa
        v = ""
    m = re.search(r"collation=(\w+)", v)
    if m and m.group(1) in COLLATIONS:
        return m.group(1)
    return "pinyin"


class Collator(object):
    def __init__(self, collation="pinyin"):
        self.name = collation if collation in COLLATIONS else "pinyin"
        self.lock = threading.Lock()
        self.coll = None
        if self.name == "unicode":
            return
        try:
            icu = ctypes.CDLL("/usr/lib/libicucore.dylib")
            icu.ucol_open.restype = ctypes.c_void_p
            icu.ucol_open.argtypes = [ctypes.c_char_p, ctypes.POINTER(ctypes.c_int)]
            icu.ucol_setAttribute.argtypes = [ctypes.c_void_p, ctypes.c_int, ctypes.c_int,
                                              ctypes.POINTER(ctypes.c_int)]
            icu.ucol_getSortKey.restype = ctypes.c_int32
            icu.ucol_getSortKey.argtypes = [ctypes.c_void_p, ctypes.c_char_p, ctypes.c_int32,
                                            ctypes.c_char_p, ctypes.c_int32]
            st = ctypes.c_int(0)
            coll = icu.ucol_open(("zh@collation=" + self.name).encode(), ctypes.byref(st))
            if st.value > 0 or not coll:
                return
            icu.ucol_setAttribute(coll, 7, 17, ctypes.byref(st))    # UCOL_NUMERIC_COLLATION = ON
            self.icu, self.coll = icu, coll
            self.buf = ctypes.create_string_buffer(512)
        except Exception:  # noqa
            self.coll = None

    def key(self, name):
        s = natural(name or "")
        if self.coll is None:
            s = re.sub(r"\d+", lambda m: "%020d" % min(int(m.group()), 10 ** 19), s.casefold())
            return s.encode("utf-16-be")
        u = s.encode("utf-16-le")
        with self.lock:
            n = self.icu.ucol_getSortKey(self.coll, u, len(u) // 2, self.buf, len(self.buf))
            if n > len(self.buf):
                self.buf = ctypes.create_string_buffer(n + 64)
                n = self.icu.ucol_getSortKey(self.coll, u, len(u) // 2, self.buf, len(self.buf))
            return self.buf.raw[:n]
