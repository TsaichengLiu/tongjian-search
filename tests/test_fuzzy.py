# -*- coding: utf-8 -*-
"""模糊檢索單元測試：python3 tests/test_fuzzy.py"""
import os
import random
import sys

sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "app"))

from tj_fuzzy import Content, ContentMap, FuzzyTerm, find, max_errors, myers_ends  # noqa: E402
from tj_norm import Normalizer  # noqa: E402

NORM = Normalizer(os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "app", "data", "variants.json"))


def brute(T, q, maxd):
    """所有結束位置的最小編輯距離（半全局），用來核對 Myers + 鴿巢預篩沒有漏。"""
    m = len(q)
    prev = list(range(m + 1))
    ends = []
    for j, c in enumerate(T):
        cur = [0] + [0] * m
        for i in range(1, m + 1):
            cur[i] = min(prev[i - 1] + (q[i - 1] != c), prev[i] + 1, cur[i - 1] + 1)
        if cur[m] <= maxd:
            ends.append(j)
        prev = cur
    return ends


def test_basic():
    cmap = NORM.content_map("full")
    text = "崇禎十七年三月，李自成陷京師。\n上海圖書館藏抄本《國變錄》一卷，記甲申之變。"
    ft = FuzzyTerm("國变記", cmap, 0.6)          # 簡體＋一個訛字
    assert ft.maxd == 1, ft.maxd
    hits = ft.finditer(text)
    assert len(hits) == 1, hits
    a, b, d = hits[0]
    assert text[a:b] == "國變錄" and d == 1, (text[a:b], d)
    # 標點、換行不算差異：跨標點也能命中
    ft = FuzzyTerm("京師上海圖書", cmap, 0.8)
    hits = ft.finditer(text)
    assert hits and text[hits[0][0]:hits[0][1]] == "京師。\n上海圖書", hits
    # 脫字
    ft = FuzzyTerm("李自成攻陷京師", cmap, 0.8)
    hits = ft.finditer(text)
    assert hits and hits[0][2] == 1 and text[hits[0][0]:hits[0][1]] == "李自成陷京師", hits
    # 太短的詞不做模糊
    assert FuzzyTerm("京師", cmap, 0.5).maxd == 0
    assert max_errors(3, 0.7) == 0 and max_errors(4, 0.7) == 1 and max_errors(10, 0.7) == 3
    assert max_errors(10, 0.4) == 4          # 至少保留過半的字


def test_content_map_back():
    cmap = NORM.content_map("full")
    random.seed(1)
    chars = "天地玄黃，宇宙洪荒。日月盈昃\n辰宿列張 𠀀𠊋"
    text = "".join(random.choice(chars) for _ in range(9000))
    C = Content(text, cmap)
    for ci in random.sample(range(len(C.T)), 300):
        r = C.raw(ci)
        assert text[r].translate(cmap) == C.T[ci], ci


def test_no_misses():
    """鴿巢預篩 + Myers 的結果，與全文暴力動態規劃一致（每處都被找到）。"""
    random.seed(7)
    alpha = "甲乙丙丁戊己庚辛壬癸子丑"
    for trial in range(60):
        T = "".join(random.choice(alpha) for _ in range(3000))
        m = random.randint(4, 12)
        s = random.randint(0, len(T) - m)
        q = list(T[s:s + m])
        for _ in range(random.randint(0, 2)):             # 隨機改幾個字
            k = random.randrange(len(q))
            op = random.random()
            if op < 0.4:
                q[k] = random.choice(alpha)
            elif op < 0.7 and len(q) > 4:
                del q[k]
            else:
                q.insert(k, random.choice(alpha))
        q = "".join(q)
        maxd = max_errors(len(q), 0.6)
        ends = brute(T, q, maxd)
        got = find(T, q, maxd, max_hits=100000)
        # 暴力找到的每處近似出現，都與某個命中重疊（重疊的命中只保留距離小的一個）
        L = len(q) + maxd
        for j in ends:
            assert any(a <= j and b > j - L + 1 for a, b, _ in got), (trial, q, j, got[:5])
        # 命中自身的距離不超過上限
        for a, b, d in got:
            assert d <= maxd


def test_long_text_path():
    """長文本走「正則定位 + 小窗口」，結果應與整篇歸一後比對完全相同。"""
    import re
    cmap = NORM.content_map("full")

    def cls(ch):
        mem = NORM.members(ch, "full")
        return re.escape(ch) if len(mem) == 1 else "[" + "".join(re.escape(x) for x in sorted(mem)) + "]"
    random.seed(11)
    alpha = "甲乙丙丁戊己庚辛壬癸子丑國国變变"
    junk = "，。 \n「」《》"
    for trial in range(40):
        T = "".join(random.choice(alpha) if random.random() < 0.8 else random.choice(junk) for _ in range(20000))
        q = "".join(random.choice(alpha) for _ in range(random.randint(4, 10)))
        fast = FuzzyTerm(q, cmap, 0.6, cls)
        slow = FuzzyTerm(q, cmap, 0.6)
        a = fast.finditer(T, cap=100000)
        b = slow.finditer(T, cap=100000)
        assert a == b, (trial, q, len(a), len(b), [x for x in a if x not in b][:3], [x for x in b if x not in a][:3])


def test_myers_matches_dp():
    random.seed(3)
    for _ in range(200):
        q = "".join(random.choice("abc") for _ in range(random.randint(1, 9)))
        t = "".join(random.choice("abc") for _ in range(random.randint(0, 30)))
        maxd = random.randint(0, 3)
        ends = set(j for j, _ in myers_ends(q, t, maxd))
        allends = brute(t, q, maxd)
        if allends:
            assert ends, (q, t, maxd)
        for j in ends:
            assert j in allends


if __name__ == "__main__":
    for name, fn in sorted(globals().items()):
        if name.startswith("test_") and callable(fn):
            fn()
            print("PASS", name)
