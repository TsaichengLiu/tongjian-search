# -*- coding: utf-8 -*-
"""讀 Word 97–2003（.doc）的正文、腳註、尾註：OLE 複合文檔 → FIB → 片段表（piece table）。

macOS 的 textutil 能把 .doc 轉成 docx（版式用它），但會丟掉腳註、尾註；這裡直接從二進制裡取。
只讀不寫，全部在內存裡；讀不了的（加密、Word 6/95 等舊格式）返回 None，調用方照舊只用 textutil 的結果。
"""
import struct

ENDOFCHAIN = 0xFFFFFFFE
FREESECT = 0xFFFFFFFF


class _Ole(object):
    def __init__(self, data):
        if data[:8] != b"\xd0\xcf\x11\xe0\xa1\xb1\x1a\xe1":
            raise ValueError("not OLE")
        self.d = data
        self.ss = 1 << struct.unpack_from("<H", data, 0x1E)[0]
        self.mss = 1 << struct.unpack_from("<H", data, 0x20)[0]
        nfat, self.dir0 = struct.unpack_from("<II", data, 0x2C)[0], struct.unpack_from("<I", data, 0x30)[0]
        self.cutoff, mf0, nmf, df0, ndf = struct.unpack_from("<IIIII", data, 0x38)
        difat = list(struct.unpack_from("<109I", data, 0x4C))
        s, guard = df0, 0
        while s not in (ENDOFCHAIN, FREESECT) and guard < ndf + 1:
            per = self.ss // 4 - 1
            vals = struct.unpack_from("<%dI" % (per + 1), data, self._off(s))
            difat += vals[:per]
            s, guard = vals[per], guard + 1
        fat = []
        for sec in difat[:nfat]:
            if sec in (ENDOFCHAIN, FREESECT):
                continue
            fat += struct.unpack_from("<%dI" % (self.ss // 4), data, self._off(sec))
        self.fat = fat
        self.dirs = self._chain(self.dir0)
        self.minifat = []
        if nmf:
            mf = self._chain(mf0)
            self.minifat = list(struct.unpack_from("<%dI" % (len(mf) // 4), mf))
        root = self._entries()[0][:4]
        self.ministream = self._chain(root[2])[:root[3]] if root[2] not in (ENDOFCHAIN, FREESECT) else b""

    def _off(self, s):
        return (s + 1) * self.ss

    def _chain(self, s):
        out, seen = [], set()
        while s not in (ENDOFCHAIN, FREESECT) and s < len(self.fat) and s not in seen:
            seen.add(s)
            o = self._off(s)
            out.append(self.d[o:o + self.ss])
            s = self.fat[s]
        return b"".join(out)

    def _minichain(self, s, size):
        out, seen = [], set()
        while s not in (ENDOFCHAIN, FREESECT) and s < len(self.minifat) and s not in seen:
            seen.add(s)
            o = s * self.mss
            out.append(self.ministream[o:o + self.mss])
            s = self.minifat[s]
        return b"".join(out)[:size]

    def _entries(self):
        out = []
        for i in range(len(self.dirs) // 128):
            e = self.dirs[i * 128:(i + 1) * 128]
            nl = struct.unpack_from("<H", e, 0x40)[0]
            name = e[:max(0, nl - 2)].decode("utf-16-le", "replace")
            left, right, child = struct.unpack_from("<III", e, 0x44)
            out.append((name, e[0x42], struct.unpack_from("<I", e, 0x74)[0], struct.unpack_from("<I", e, 0x78)[0],
                        left, right, child))
        return out

    def stream(self, name):
        """根存儲下的流（嵌入對象的 ObjectPool 裡也可能有同名的 WordDocument，不能按目錄順序找）"""
        ents = self._entries()
        todo, seen = [ents[0][6]] if ents else [], set()
        while todo:
            i = todo.pop()
            if i >= len(ents) or i in seen:
                continue
            seen.add(i)
            nm, typ, start, size, left, right, child = ents[i]
            if typ == 2 and nm == name:
                if size < self.cutoff:
                    return self._minichain(start, size)
                return self._chain(start)[:size]
            todo += [left, right]                  # 同層的兄弟（紅黑樹），不進子存儲
        return None


def _clean(raw):
    """Word 的控制字符 → 純文字；域只留結果。返回 (文字, 每個原始字符對應的文字位置, 圖片／嵌入對象的位置)。"""
    out, pos, depth, state, pics = [], [], 0, [], []   # state：每層域是否已到「結果」部分
    n = 0
    for ch in raw:
        pos.append(n)
        o = ord(ch)
        if o == 0x13:                              # 域開始：其後是域代碼
            state.append(False)
            continue
        if o == 0x14:                              # 域分隔：其後是域結果
            if state:
                state[-1] = True
            continue
        if o == 0x15:                              # 域結束
            if state:
                state.pop()
            continue
        if state and not state[-1]:
            continue                               # 域代碼
        if o in (0x0D, 0x0B, 0x0C, 0x0E, 0x07):     # 段落、換行、分頁、分欄、表格的格（與 docx 一樣每格一段）
            s = "\n"
        elif o == 0x09:
            s = "\t"
        elif o == 0x1E:
            s = "-"
        elif o in (0x01, 0x08):                    # 圖片、嵌入對象、繪圖
            s = ""
            if not pics or pics[-1] != n:
                pics.append(n)
        elif o in (0x02, 0x03, 0x04, 0x05, 0x1F) or o < 0x09:
            s = ""
        else:
            s = ch
        out.append(s)
        n += len(s)
    pos.append(n)
    return "".join(out), pos, pics


def read(data):
    """返回 {"main": 正文, "main_raw_pos": 映射, "fn": [(引用位置, 註文)], "en": [...]}；讀不了時 None。"""
    try:
        ole = _Ole(data)
        wd = ole.stream("WordDocument")
        if not wd or struct.unpack_from("<H", wd, 0)[0] != 0xA5EC:
            return None
        nfib = struct.unpack_from("<H", wd, 2)[0]
        flags = struct.unpack_from("<H", wd, 0x0A)[0]
        if nfib < 101 or flags & 0x0100:            # Word 6/95 之前的格式、加密
            return None
        tbl = ole.stream("1Table" if flags & 0x0200 else "0Table")
        if not tbl:
            return None
        p = 32
        csw = struct.unpack_from("<H", wd, p)[0]
        p += 2 + csw * 2
        cslw = struct.unpack_from("<H", wd, p)[0]
        lw = struct.unpack_from("<%di" % cslw, wd, p + 2)
        p += 2 + cslw * 4
        cb = struct.unpack_from("<H", wd, p)[0]
        fl = struct.unpack_from("<%dI" % (cb * 2), wd, p + 2)
        fcl = lambda i: (fl[2 * i], fl[2 * i + 1]) if i < cb else (0, 0)
        ccp_text, ccp_ftn, ccp_hdd, ccp_atn, ccp_edn = lw[3], lw[4], lw[5], lw[7], lw[8]
        # 片段表
        fc, lcb = fcl(33)
        clx = tbl[fc:fc + lcb]
        i = 0
        pcdt = None
        while i < len(clx):
            if clx[i] == 1:
                i += 3 + struct.unpack_from("<H", clx, i + 1)[0]
            elif clx[i] == 2:
                n = struct.unpack_from("<I", clx, i + 1)[0]
                pcdt = clx[i + 5:i + 5 + n]
                break
            else:
                return None
        if pcdt is None:
            return None
        npc = (len(pcdt) - 4) // 12
        cps = struct.unpack_from("<%dI" % (npc + 1), pcdt, 0)
        parts = []
        for k in range(npc):
            fcc = struct.unpack_from("<I", pcdt, 4 * (npc + 1) + 8 * k + 2)[0]
            cnt = cps[k + 1] - cps[k]
            if fcc & 0x40000000:
                o = (fcc & 0x3FFFFFFF) // 2
                parts.append(wd[o:o + cnt].decode("cp1252", "replace"))
            else:
                o = fcc & 0x3FFFFFFF
                parts.append(wd[o:o + 2 * cnt].decode("utf-16-le", "replace"))
        alltext = "".join(parts)
        main_raw = alltext[:ccp_text]
        main, mpos, pics = _clean(main_raw)

        def notes(i_ref, i_txt, start, length):
            fr, lr = fcl(i_ref)
            ft, lt = fcl(i_txt)
            if not length or not lr or not lt:
                return []
            nref = (lr - 4) // 6                   # PlcfFndRef：(n+1) 個 CP ＋ n 個 2 字節 FRD
            refs = struct.unpack_from("<%dI" % nref, tbl, fr)
            ntx = lt // 4
            txt = struct.unpack_from("<%dI" % ntx, tbl, ft)
            story = alltext[start:start + length]
            out = []
            for k in range(min(nref, ntx - 1)):
                body = _clean(story[txt[k]:txt[k + 1]])[0]
                ref = mpos[refs[k]] if refs[k] < len(mpos) else len(main)
                out.append((ref, body.strip("\n")))
            return out
        fn = notes(2, 3, ccp_text, ccp_ftn)
        en = notes(46, 47, ccp_text + ccp_ftn + ccp_hdd + lw[6] + ccp_atn, ccp_edn)
        # 文本框的文字另存一處：接在正文後（與 docx 一樣收進來；頁眉頁腳不收）
        tb0 = ccp_text + ccp_ftn + ccp_hdd + lw[6] + ccp_atn + ccp_edn
        tb = _clean(alltext[tb0:tb0 + lw[9]])[0].strip("\n") if len(lw) > 9 and lw[9] > 0 else ""
        if tb.strip():
            main = main + ("" if main.endswith("\n") else "\n") + tb + "\n"
        return {"main": main, "fn": fn, "en": en, "pics": pics}
    except (struct.error, ValueError, IndexError, UnicodeError):
        return None


# ---------------------------------------------------------------- 索引文字與原件模型
# 文字：本模塊讀出的正文（域只留結果）＋腳註、尾註（各成一段，接在正文後）。
# 版式：交給 macOS 的 textutil 轉成 docx（只在看原件時轉，一個進程約 0.1 秒，用完即退、不寫文件），
#       用 tj_docx 讀出段落、字號、表格、圖片，再按文字對齊把格式套到上面的文字上——
#       textutil 會把腳註混進正文、把域代碼當正文，這些對不上的字一律丟掉；它漏掉的字用默認格式補回原處。
import difflib
import io
import os
import subprocess

import tj_docx

TASKPOLICY = "/usr/sbin/taskpolicy" if os.path.exists("/usr/sbin/taskpolicy") else None


def _compose(r):
    """正文 ＋ 註文 → (文字, [(標籤, [(起點, 一段文字)…])…], [(正文位置, 標籤)…])"""
    text = r["main"]
    notes, refs = [], []
    lst = [(str(k + 1), ref, body) for k, (ref, body) in enumerate(r["fn"])] + \
          [(tj_docx._roman(k + 1), ref, body) for k, (ref, body) in enumerate(r["en"])]
    if lst:
        text += "\n"
    for label, ref, body in lst:
        paras = []
        for line in body.split("\n"):
            paras.append((len(text), line))
            text += line + "\n"
        notes.append((label, paras))
        refs.append((ref, label))
    return text, notes, refs


def _read_file(path):
    with open(path, "rb") as f:
        return read(f.read())


def _textutil_docx(path):
    cmd = ["/usr/bin/textutil", "-convert", "docx", "-stdout", path]
    if TASKPOLICY:
        cmd = [TASKPOLICY, "-c", "utility"] + cmd
    p = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, timeout=120)
    if p.returncode != 0 or not p.stdout:
        raise RuntimeError((p.stderr or b"").decode("utf-8", "replace")[:200] or "textutil 轉換失敗")
    return p.stdout


def text_of(path):
    """建索引用的文字。讀得了二進制的不起任何進程；讀不了的（加密、舊格式）用 textutil 轉 docx 後的文字。"""
    r = _read_file(path)
    if r is not None:
        return _compose(r)[0]
    return tj_docx.parse(io.BytesIO(_textutil_docx(path)), model=False)[0]


def _align(a, b, cap=2.5e7):
    """a 的位置 → b 的位置（只對齊非換行字符）：先按行，再在對不上的行群裡逐字。"""
    al, bl = a.split("\n"), b.split("\n")
    ao, bo = [0], [0]
    for l in al:
        ao.append(ao[-1] + len(l) + 1)
    for l in bl:
        bo.append(bo[-1] + len(l) + 1)
    m = {}
    for op, i1, i2, j1, j2 in difflib.SequenceMatcher(None, al, bl, autojunk=False).get_opcodes():
        if op == "equal":
            for k in range(i2 - i1):
                a0, b0 = ao[i1 + k], bo[j1 + k]
                for t in range(len(al[i1 + k])):
                    m[a0 + t] = b0 + t
        elif op == "replace":
            sa, sb = a[ao[i1]:ao[i2]], b[bo[j1]:bo[j2]]
            if len(sa) * len(sb) > cap:
                continue
            for x, y, n in difflib.SequenceMatcher(None, sa, sb, autojunk=False).get_matching_blocks():
                for t in range(n):
                    if sa[x + t] != "\n":
                        m[ao[i1] + x + t] = bo[j1] + y + t
    return m


def parse(path):
    """返回 (文字, 模型, 轉換出的 docx)；文字與 text_of 逐字相同。docx 留給取圖片用。"""
    r = _read_file(path)
    dx = _textutil_docx(path)
    ctext, model = tj_docx.parse(io.BytesIO(dx))
    if r is None:
        return ctext, model, dx
    text, notes, refs = _compose(r)
    main = r["main"]
    m = _align(ctext, main)
    plain = model["css"].index("") if "" in model["css"] else len(model["css"])
    if plain == len(model["css"]):
        model["css"].append("")
    runs = []                                      # 換好位置的文字片段：[起點, 終點, 所在列表]

    def remap(lst):
        out = []
        for x in lst:
            if isinstance(x[0], int):
                o, s, ci = x
                seg = None
                for i in range(len(s)):
                    j = m.get(o + i)
                    if j is None:
                        continue
                    if seg and j == seg[1]:
                        seg[1] = j + 1
                    else:
                        if seg:
                            out.append([seg[0], main[seg[0]:seg[1]], ci])
                        seg = [j, j + 1]
                if seg:
                    out.append([seg[0], main[seg[0]:seg[1]], ci])
            elif x[0] == "box":
                x[1] = blocks(x[1])
                out.append(x)
            else:
                out.append(x)
        return out

    def blocks(bs):
        out = []
        for b in bs:
            if b[0] == "p":
                had = any(isinstance(x[0], int) for x in b[2])
                b[2] = remap(b[2])
                if had and not any(isinstance(x[0], int) or x[0] in ("img", "box") for x in b[2]):
                    continue                       # 整段都是對不上的字（混進正文的腳註、域代碼）
                out.append(b)
            elif b[0] == "tbl":
                for row in b[1]:
                    for cell in row:
                        cell[2] = blocks(cell[2])
                out.append(b)
            else:
                out.append(b)
        return out
    model["blocks"] = blocks(model["blocks"])

    def collect(bs):
        for b in bs:
            if b[0] == "p":
                for k, x in enumerate(b[2]):
                    if isinstance(x[0], int):
                        runs.append([x[0], x[0] + len(x[1]), b[2], x])
                    elif x[0] == "box":
                        collect(x[1])
            elif b[0] == "tbl":
                for row in b[1]:
                    for cell in row:
                        collect(cell[2])
    collect(model["blocks"])
    runs.sort(key=lambda t: t[0])
    starts = [t[0] for t in runs]
    import bisect

    def insert_at(pos, item):
        """在正文位置 pos 處插入（必要時把所在片段切開）；返回插入到的列表"""
        k = bisect.bisect_right(starts, pos) - 1
        if k >= 0:
            a, b, lst, x = runs[k]
            idx = next(i for i, y in enumerate(lst) if y is x)
            if pos == a:
                lst.insert(idx, item)
            elif pos < b:
                left, right = [a, x[1][:pos - a], x[2]], [pos, x[1][pos - a:], x[2]]
                lst[idx:idx + 1] = [left, item, right]
                runs[k:k + 1] = [[a, pos, lst, left], [pos, b, lst, right]]
                starts[k:k + 1] = [a, pos]
            else:
                lst.insert(idx + 1, item)
            return lst
        if runs:                                   # 在第一段字之前
            a, b, lst, x = runs[0]
            lst.insert(next(i for i, y in enumerate(lst) if y is x), item)
            return lst
        model["blocks"].append(["p", plain, [item]])
        return model["blocks"][-1][2]
    # textutil 漏掉的字（非空白）用默認格式補回
    covered = bytearray(len(main))
    for a, b, lst, x in runs:
        covered[a:b] = b"\x01" * (b - a)
    j = 0
    gaps = []
    while j < len(main):
        if covered[j]:
            j += 1
            continue
        g = j
        while j < len(main) and not covered[j] and main[j] != "\n":
            j += 1
        if j == g:
            j += 1
            continue
        if main[g:j].strip():
            gaps.append((g, j))
    for g, e in gaps:
        item = [g, main[g:e], plain]
        lst = insert_at(g, item)
        k = bisect.bisect_right(starts, g)
        runs.insert(k, [g, e, lst, item])
        starts.insert(k, g)
    # 腳註號；圖片處放一個佔位（textutil 轉換時丟掉了 .doc 裡的圖片）
    for pos, item in sorted([(p, ["ref", l]) for p, l in refs] + [(p, ["pic"]) for p in r.get("pics", [])],
                            key=lambda t: t[0], reverse=True):
        insert_at(pos, item)
    model["notes"] = [[label, [["p", plain, [[o, s, plain]] if s else []] for o, s in paras]]
                      for label, paras in notes]
    return text, model, dx
