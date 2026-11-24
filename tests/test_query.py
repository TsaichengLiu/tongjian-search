# -*- coding: utf-8 -*-
"""檢索式解析、篩選詞、通配符、正則的單元測試：python3 tests/test_query.py"""
import os
import shutil
import sys
import tempfile
import time

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, "..", "app"))

import tj_core  # noqa: E402
from tj_core import parse_query, regex_required_runs, split_filters  # noqa: E402

_LIB = []


def lib():
    """空資料庫上的 Library：只用它的正則與匹配，不收錄任何文件。"""
    if not _LIB:
        d = tempfile.mkdtemp(prefix="tjtest-")
        L = tj_core.Library(os.path.join(d, "t.db"), os.path.join(HERE, "..", "app", "data", "variants.json"),
                            None, log=lambda *a: None)
        L.enqueue = lambda *a, **k: None
        _LIB.extend([L, d])
    return _LIB[0]


def test_parse_query():
    g = parse_query('萬曆 後金|建州 -天啟 !崇禎 "a*b" x*y')
    assert [x["alts"] for x in g] == [["萬曆"], ["後金", "建州"], ["天啟"], ["崇禎"], ["a*b"], ["x*y"]], g
    assert [x["neg"] for x in g] == [False, False, True, True, False, False]
    assert g[4].get("lit") == ["a*b"] and not g[5].get("lit")
    assert tj_core.is_wild(g[5], "x*y") and not tj_core.is_wild(g[4], "a*b")


def test_split_filters():
    rest, f, bad = split_filters("萬曆 ext:pdf;docx -ext:.json size:1mb..2mb path:明史 !path:草稿 dm: size:abc")
    assert rest == "萬曆", rest
    assert f["q_exts"] == ["pdf", "docx"] and f["q_noexts"] == ["json"]
    assert f["size_min"] == 1024 ** 2 and f["size_max"] == 2 * 1024 ** 2 + 1
    assert f["path_in"] == ["明史"] and f["path_out"] == ["草稿"]
    assert bad == ["size:abc"], bad
    assert "路徑不含「草稿」" in f["_desc"]
    # 不在詞首的不算篩選詞
    assert split_filters("abcext:pdf")[0] == "abcext:pdf"
    for v, lo, hi in [(">10mb", 10 * 1024 ** 2 + 1, None), ("<=1kb", 0, 1025), ("500", 500, None)]:
        f = split_filters("size:" + v)[1]
        assert f.get("size_min", 0) == lo and f.get("size_max") == hi, (v, f)


def test_dates():
    now = time.mktime((2026, 11, 23, 12, 0, 0, 0, 0, -1))
    a, b = tj_core._period("2024-03", now)
    assert time.localtime(a)[:3] == (2024, 3, 1) and time.localtime(b)[:3] == (2024, 4, 1)
    assert tj_core._period("本週", now) == tj_core._period("thisweek", now)
    a, b = tj_core._period("thisweek", now)
    assert time.localtime(a)[:3] == (2026, 11, 23) and b - a > 6 * 86400       # 2026-11-23 是星期一
    a, b = tj_core._period("30d", now)
    assert round((b - a) / 86400) == 30
    assert tj_core._period("2024-13", now) is None and tj_core._period("soon", now) is None
    f = split_filters("dm:2023..2024-06")[1]
    assert time.localtime(f["mt_min"])[:3] == (2023, 1, 1) and time.localtime(f["mt_max"])[:3] == (2024, 7, 1)


def test_required_runs():
    assert regex_required_runs("萬曆.{1,4}年") == ["萬曆", "年"]
    assert regex_required_runs("(張|李)居正") == ["居正"]
    assert regex_required_runs("卷[一二三]+") == ["卷"]
    assert not regex_required_runs("[甲乙][子丑]")
    assert not regex_required_runs("a?b*")


def test_nested_repeat():
    for bad in ["(a+)+", "(a*)*b", "(.*,){10}", "(.*,){3}", "(\\d+年)+", "(\\s*\\w+)*", "((ab)+c)+", "x(?=(a+)+)"]:
        assert tj_core.regex_nested_repeat(bad), bad
    for ok in ["萬曆.{1,4}年", "(第.{1,3}回)+", "(\\d{4}){2}", "卷[一二三]+", "(張|李)居正", "a+b+", "(\\d{1,4}年)+"]:
        assert not tj_core.regex_nested_repeat(ok), ok
    try:
        lib().regex_compile("(萬+)+曆", "full")
        raise AssertionError("應報錯")
    except tj_core.UserError as e:
        assert "重複套重複" in str(e)


def test_regex_variants():
    L = lib()
    rx = L.regex_compile("萬曆.{1,4}年", "full")
    assert rx.search("万历三十五年") and rx.search("萬曆十年") and not rx.search("萬曆元年至五年年"[:3])
    assert not L.regex_compile("萬曆", "exact").search("万历")
    assert not L.regex_compile("[萬]曆", "full").search("万曆")          # 方括號裡不展開
    try:
        L.regex_compile("萬曆[", "full")
        raise AssertionError("應報錯")
    except tj_core.UserError as e:
        assert "方括號" in str(e) and "第 3 個字" in str(e), e


def test_wildcards():
    L = lib()
    w = L.wild_regex("萬曆*年", "full", False)
    assert w.search("万历三十五年").group(0) == "万历三十五年"
    assert not w.search("萬曆朝最盛。崇禎元年")                       # * 不越過句末標點
    w = L.wild_regex("萬曆??年", "full", False)
    assert w.search("萬曆十一年") and not w.search("萬曆十年") and w.search("萬曆十\n一年")
    assert L.wild_regex("*.pdf", "full", False).search("明史.PDF")
    spans, _, qc = L.doc_hits("嘉靖、萬曆三十年、天啟", "萬曆*年", "full", u16=False)
    assert spans == [(3, 8)] and qc == "*", (spans, qc)
    spans, _, qc = L.doc_hits("萬曆三十年", "萬曆", "full", u16=False)
    assert qc != "*"


if __name__ == "__main__":
    try:
        for name, fn in sorted(globals().items()):
            if name.startswith("test_") and callable(fn):
                fn()
                print("PASS", name)
    finally:
        if _LIB:
            shutil.rmtree(_LIB[1], ignore_errors=True)
