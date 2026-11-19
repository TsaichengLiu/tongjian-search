# -*- coding: utf-8 -*-
"""模糊檢索：容許脫字、衍字、訛字的近似匹配（編輯距離，Myers 位向量算法）。

文字先按當前匹配方式（精確／簡繁／異體）歸一，並去掉空白、標點，只比對「字」；
命中位置再對回原文。相似度 = 1 − 編輯距離 ÷ 檢索詞字數。

找候選用鴿巢原理，不會漏：
- 把檢索詞分成「容許錯字數 + 1」段，近似出現處必定原樣包含其中一段；
- 檢索詞較長時，兩字一段分成 n 段，近似出現處至少有 n − 錯字數 段原樣保留，而且這些段的
  「對角線」（出現位置 − 段在檢索詞裡的位置）相差不超過 2 × 錯字數 —— 只在滿足這個條件的地方跑 Myers。
短檢索詞遇到長文本時不整篇歸一（太慢）：各段編成「異體字類 + 可隔標點」的正則直接在原文裡找，
只把命中附近的小窗口歸一後比對。
"""
import bisect
import re

CHUNK = 2048            # 歸一串與原文的位置對照按塊惰性建立
MAX_TERM = 200          # 模糊檢索詞的字數上限（再長請分成幾個詞）
WHOLE_MAX = 8192        # 不超過這麼長的文本整篇歸一；更長的先用正則定位
REGEX_MAX = 6           # 短檢索詞：各段分別用正則在原文裡定位；段數更多時改用下面的合併正則
SPREAD = 8              # 原文裡聚集判斷的寬度按「每字之間至多隔七個符號」放寬（實際文本遠不到）
GAP = r"[\W_]*"         # 段內兩字之間可隔空白、標點


class ContentMap(dict):
    """str.translate 用：按級別歸一字形；空白、標點、符號刪去。按需填充。"""

    def __init__(self, base):
        dict.__init__(self)
        self.base = base

    def __missing__(self, o):
        ch = chr(o)
        r = self.base.get(ch, ch)
        v = r if r.isalnum() else None
        self[o] = v
        return v


class Content(object):
    """原文 → 只含文字的歸一串 T，並能把 T 的下標對回原文。"""
    __slots__ = ("text", "cmap", "T", "cum", "_pos")

    def __init__(self, text, cmap):
        self.text, self.cmap = text, cmap
        parts, cum, n = [], [0], 0
        for i in range(0, max(len(text), 1), CHUNK):
            s = text[i:i + CHUNK].translate(cmap)
            parts.append(s)
            n += len(s)
            cum.append(n)
        self.T = "".join(parts)
        self.cum = cum
        self._pos = {}

    def raw(self, ci):
        """T 的下標 → 原文下標。"""
        if ci >= len(self.T):
            return len(self.text)
        k = bisect.bisect_right(self.cum, ci) - 1
        pos = self._pos.get(k)
        if pos is None:
            base, cm = k * CHUNK, self.cmap
            pos = [base + j for j, ch in enumerate(self.text[base:base + CHUNK]) if cm[ord(ch)] is not None]
            self._pos[k] = pos
        return pos[ci - self.cum[k]]

    def raw_span(self, s, e):
        return self.raw(s), self.raw(e - 1) + 1


def max_errors(m, sim):
    """m 字的檢索詞在相似度 sim 下容許的錯字數；至少要保留過半的字。"""
    if m < 3:
        return 0
    return max(0, min(int(m * (1.0 - sim) + 1e-9), (m - 1) // 2))


def split(q, n):
    """把 q 平均分成 n 段 → [(起點, 段)]。"""
    m = len(q)
    return [(i * m // n, q[i * m // n:(i + 1) * m // n]) for i in range(n)]


def pieces(q, d):
    """d+1 段：近似出現處（≤d 處差異）必定原樣包含其中一段。"""
    return split(q, d + 1)


def filter_pieces(q, d):
    """q-gram 過濾：盡量兩字一段分成 n 段 → (分段, t)；每處差異至多破壞一段，近似出現處至少有 t = n − d 段原樣保留。"""
    n = max(d + 1, len(q) // 2)
    return split(q, n), n - d


# ---------------------------------------------------------------- Myers 位向量
def myers_ends(q, t, maxd, ties=False):
    """q 全部、t 中任意一段：返回編輯距離 ≤ maxd 的局部最優結束位置 [(j, d)]。
    ties=True 時 j 為同分結束位置的列表。"""
    m = len(q)
    full = (1 << m) - 1
    hb = 1 << (m - 1)
    peq = {}
    for i, c in enumerate(q):
        peq[c] = peq.get(c, 0) | (1 << i)
    Pv, Mv, score = full, 0, m
    found = []
    for j, c in enumerate(t):
        Eq = peq.get(c, 0)
        Xv = Eq | Mv
        Xh = ((((Eq & Pv) + Pv) & full) ^ Pv) | Eq
        Ph = Mv | (~(Xh | Pv) & full)
        Mh = Pv & Xh
        if Ph & hb:
            score += 1
        elif Mh & hb:
            score -= 1
        Ph = (Ph << 1) & full
        Mh = (Mh << 1) & full
        Pv = Mh | (~(Xv | Ph) & full)
        Mv = Ph & Xv
        if score <= maxd:
            found.append((j, score))
    # 相近的結束位置屬同一處：每處取距離最小者；同分的都留下，由調用方挑長度最接近的
    best = []
    gap = max(2, m // 2)
    for j, d in found:
        if best and j - best[-1][2] <= gap:
            if d < best[-1][1]:
                best[-1][0], best[-1][1] = [j], d
            elif d == best[-1][1]:
                best[-1][0].append(j)
            best[-1][2] = j
        else:
            best.append([[j], d, j])
    return [(js if ties else js[0], d) for js, d, _ in best]


def start_of(q, t, end, d):
    """已知 q 在 t 中以 end 結尾、距離 d：反向動態規劃找起點。"""
    m = len(q)
    s0 = max(0, end + 1 - m - d)
    seg = t[s0:end + 1]
    qr, sr = q[::-1], seg[::-1]
    prev = list(range(m + 1))
    best_j, best_v = 0, prev[m]
    for j in range(1, len(sr) + 1):
        cur = [j] + [0] * m
        cj = sr[j - 1]
        for i in range(1, m + 1):
            cur[i] = min(prev[i - 1] + (qr[i - 1] != cj), prev[i] + 1, cur[i - 1] + 1)
        if cur[m] < best_v:
            best_v, best_j = cur[m], j
        prev = cur
    return end + 1 - best_j


def _hits_in(T, q, maxd, spans, stop=None):
    """在 T 的若干區段裡跑 Myers，返回 [(s, e, d)]（可能重疊）。"""
    m = len(q)
    hits = []
    for s, e in spans:
        if stop is not None and stop():
            break
        for js, d in myers_ends(q, T[s:e], maxd, ties=True):
            # 同分時取長度最接近檢索詞者（「國变記」對「國變錄」讀作一個訛字，而非脫一字的「國變」）
            best = None
            for j in js:
                end = s + j
                st = start_of(q, T, end, d)
                key = (abs(end + 1 - st - m), st)
                if best is None or key < best[0]:
                    best = (key, st, end + 1)
            hits.append((best[1], best[2], d))
    return hits


def _resolve(hits, max_hits):
    """重疊的命中只留距離小者（同分取靠前的），按位置排序。"""
    hits.sort(key=lambda h: (h[2], h[0]))
    starts, ends, out = [], [], []
    for h in hits:
        i = bisect.bisect_right(starts, h[0])
        if (i and ends[i - 1] > h[0]) or (i < len(starts) and starts[i] < h[1]):
            continue
        starts.insert(i, h[0])
        ends.insert(i, h[1])
        out.append(h)
        if len(out) >= max_hits:
            break
    out.sort()
    return out


def _merge(wins):
    wins.sort()
    out = []
    for s, e in wins:
        if out and s <= out[-1][1]:
            if e > out[-1][1]:
                out[-1][1] = e
        else:
            out.append([s, e])
    return out


def _cooccur(T, pcs, t, m, d, stop=None):
    """q-gram 共現過濾：至少 t 段出現、且對角線相差不超過 2d 的地方 → 要跑 Myers 的區段。"""
    n = len(T)
    occ = []
    for i, (off, pc) in enumerate(pcs):
        j = T.find(pc)
        while j >= 0:
            occ.append((j - off, i))
            j = T.find(pc, j + 1)
        if stop is not None and stop():
            return []
    if len(occ) < t:
        return []
    occ.sort()
    cnt = [0] * len(pcs)
    distinct, lo, wins, w = 0, 0, [], 2 * d
    for dg, i in occ:
        if not cnt[i]:
            distinct += 1
        cnt[i] += 1
        while occ[lo][0] < dg - w:
            k = occ[lo][1]
            cnt[k] -= 1
            if not cnt[k]:
                distinct -= 1
            lo += 1
        if distinct >= t:
            # 起點在 [最小對角線 − d, …]，終點不超過 最大對角線 + m + 2d
            wins.append((max(0, occ[lo][0] - d), min(n, dg + m + 2 * d)))
    return _merge(wins)


def find(T, q, maxd, max_hits=200, stop=None):
    """在歸一串 T 中找 q 的近似出現處 → [(s, e, d)]（互不重疊，按位置排序）。"""
    m = len(q)
    if not m or not T:
        return []
    if maxd <= 0:
        out, j = [], T.find(q)
        while j >= 0 and len(out) < max_hits:
            out.append((j, j + m, 0))
            j = T.find(q, j + m)
        return out
    n = len(T)
    if n <= 4 * (m + maxd) + 64:                 # 短文本（如文件名）：整段跑
        spans = [[0, n]]
    else:
        pcs, t = filter_pieces(q, maxd)
        if t >= 2:
            spans = _cooccur(T, pcs, t, m, maxd, stop)
        else:
            wins = []
            for off, pc in pieces(q, maxd):
                j = T.find(pc)
                while j >= 0:
                    wins.append((max(0, j - off - maxd), min(n, j - off + m + maxd)))
                    j = T.find(pc, j + 1)
            spans = _merge(wins)
        if not spans:
            return []
    return _resolve(_hits_in(T, q, maxd, spans, stop), max_hits)


def _back(text, i, k):
    """從 i 往前跨過 k 個「字」（不計空白標點），返回新位置。"""
    lim = max(0, i - 64 * (k + 1))
    while i > lim and k > 0:
        i -= 1
        if text[i].isalnum():
            k -= 1
    return i


def _fwd(text, i, k):
    n = len(text)
    lim = min(n, i + 64 * (k + 1))
    while i < lim and k > 0:
        if text[i].isalnum():
            k -= 1
        i += 1
    return i


class FuzzyTerm(object):
    """一個模糊檢索詞。finditer(text) → 原文中的 [(起, 止, 錯字數)]。
    cls：字 → 正則字類（含同級異體），用於在長文本的原文裡直接定位各段。"""

    def __init__(self, term, cmap, sim, cls=None):
        self.term = term
        self.cmap = cmap
        self.cls = cls
        self.q = term.translate(cmap)[:MAX_TERM]
        self.m = len(self.q)
        self.maxd = max_errors(self.m, sim)
        self._prx = None
        self._loc = None

    def _pieces_rx(self):
        if self._prx is None:
            self._prx = [(off, len(pc), re.compile(GAP.join(self.cls(ch) for ch in pc)))
                         for off, pc in pieces(self.q, self.maxd)]
        return self._prx

    def _locator(self):
        """長檢索詞：兩字一段的各段合成一個正則（先用首字字類快速跳過），一遍找出所有段在原文裡的出現位置。
        相同的段只編一次，命中時記到它在檢索詞裡的每個位置；是別段前綴的段單獨掃（合併正則每處只報一段）。"""
        if self._loc is None:
            pcs, t = filter_pieces(self.q, self.maxd)
            by = {}
            for i, (_, pc) in enumerate(pcs):
                by.setdefault(pc, []).append(i)
            keys = sorted(by)
            solo = [k for k in keys if any(o != k and o.startswith(k) for o in keys)]
            comb = [k for k in keys if k not in solo]
            rx = None
            if comb:
                guard = "|".join(sorted(set(self.cls(k[0]) for k in comb)))
                alts = "|".join("(%s)" % GAP.join(self.cls(ch) for ch in k) for k in comb)
                rx = re.compile("(?=%s)(?=%s)" % (guard, alts))
            solo_rx = [(re.compile(GAP.join(self.cls(ch) for ch in k)), by[k]) for k in solo]
            self._loc = (pcs, t, rx, [by[k] for k in comb], solo_rx)
        return self._loc

    def _clustered(self, text, cap, stop):
        """長檢索詞遇長文本：一遍正則找出各段 → 原文裡至少 t 段聚在一起的地方 → 只歸一這些窗口，在窗口裡精確比對。
        返回 None 表示這條路不適用（過濾條件太弱）。"""
        pcs, t, rx, comb_idx, solo_rx = self._locator()
        if t < 2:
            return None
        occ = []
        if rx is not None:
            for mt in rx.finditer(text):
                for i in comb_idx[mt.lastindex - 1]:
                    occ.append((mt.start(), i))
        for srx, idx in solo_rx:
            for mt in srx.finditer(text):
                for i in idx:
                    occ.append((mt.start(), i))
        if stop is not None and stop():
            return []
        if len(occ) < t:
            return []
        occ.sort()
        m, d = self.m, self.maxd
        width = SPREAD * (m + d) + 64          # 一處近似出現在原文裡最多佔這麼寬
        cnt = [0] * len(pcs)
        distinct, lo, wins = 0, 0, []
        for pos, i in occ:
            if not cnt[i]:
                distinct += 1
            cnt[i] += 1
            while occ[lo][0] < pos - width:
                k = occ[lo][1]
                cnt[k] -= 1
                if not cnt[k]:
                    distinct -= 1
                lo += 1
            if distinct >= t:
                wins.append((_back(text, occ[lo][0], m + d + 1), _fwd(text, pos, m + d + 1)))
        hits = []
        for a, b in _merge(wins):
            if stop is not None and stop():
                break
            C = Content(text[a:b], self.cmap)
            for s, e, dd in find(C.T, self.q, d, cap, stop):
                ra, rb = C.raw_span(s, e)
                hits.append((a + ra, a + rb, dd))
            if len(hits) >= cap * 3:
                break
        return _resolve(hits, cap)

    def finditer(self, text, cap=200, ctx=None, stop=None):
        """stop()：返回 True 時盡快收工（超時或已有新的檢索），結果可能不全。"""
        if not self.m:
            return []
        if self.cls is not None and self.maxd + 1 > REGEX_MAX and len(text) > WHOLE_MAX:
            r = self._clustered(text, cap, stop)
            if r is not None:
                return r
        if self.cls is None or self.maxd <= 0 or len(text) <= WHOLE_MAX or self.maxd + 1 > REGEX_MAX:
            # 短文本，或過濾條件太弱的長檢索詞：整篇歸一
            C = ctx.get(id(self.cmap)) if ctx is not None else None
            if C is None or C.text is not text:
                C = Content(text, self.cmap)
                if ctx is not None:
                    ctx[id(self.cmap)] = C
            return [C.raw_span(s, e) + (d,) for s, e, d in find(C.T, self.q, self.maxd, cap, stop)]
        # 短檢索詞遇長文本：各段在原文裡定位 → 前後各擴到能容下整個近似出現處 → 只歸一這些小窗口
        wins = []
        for off, L, rx in self._pieces_rx():
            before = off + self.maxd + 1
            after = self.m - off - L + self.maxd + 1
            for mt in rx.finditer(text):
                wins.append((_back(text, mt.start(), before), _fwd(text, mt.end(), after)))
            if stop is not None and stop():
                return []
        if not wins:
            return []
        hits = []
        for a, b in _merge(wins):
            if stop is not None and stop():
                break
            C = Content(text[a:b], self.cmap)
            for s, e, d in _hits_in(C.T, self.q, self.maxd, [[0, len(C.T)]]):
                ra, rb = C.raw_span(s, e)
                hits.append((a + ra, a + rb, d))
            if len(hits) >= cap * 3:
                break
        return _resolve(hits, cap)
