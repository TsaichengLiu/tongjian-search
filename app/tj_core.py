# -*- coding: utf-8 -*-
"""資料庫、索引線程與檢索。"""
import bisect
import fnmatch
import hashlib
import os
import queue
import re
import shutil
import sqlite3
import stat as statmod
import subprocess
import threading
import time
import traceback
import zlib
from collections import OrderedDict, defaultdict
from concurrent.futures import ThreadPoolExecutor

from tj_extract import CODE_EXTS, EXTRACTOR_VERSION, INDEXABLE, Extractor, kind_of
from tj_norm import Normalizer, is_cjk
from tj_sort import Collator, system_collation

SCHEMA = """
CREATE TABLE IF NOT EXISTS roots(id INTEGER PRIMARY KEY, path TEXT UNIQUE NOT NULL,
  added REAL, last_scan REAL, missing INTEGER DEFAULT 0);
CREATE TABLE IF NOT EXISTS files(
  id INTEGER PRIMARY KEY, root_id INTEGER, path TEXT UNIQUE NOT NULL, dir TEXT, name TEXT,
  ext TEXT, kind TEXT, size INTEGER, mtime REAL, status INTEGER DEFAULT 0, err TEXT,
  chars INTEGER DEFAULT 0, pages INTEGER DEFAULT 0, xver INTEGER DEFAULT 0, indexed REAL,
  starred INTEGER DEFAULT 0, note TEXT DEFAULT '', added REAL);
CREATE INDEX IF NOT EXISTS files_root ON files(root_id);
CREATE INDEX IF NOT EXISTS files_dir ON files(dir);
CREATE INDEX IF NOT EXISTS files_kind ON files(kind);
CREATE INDEX IF NOT EXISTS files_mtime ON files(mtime);
CREATE TABLE IF NOT EXISTS content(id INTEGER PRIMARY KEY, z BLOB);
CREATE VIRTUAL TABLE IF NOT EXISTS fts USING fts5(body, content='', contentless_delete=1,
  tokenize='unicode61 remove_diacritics 0');
CREATE TABLE IF NOT EXISTS tags(id INTEGER PRIMARY KEY, name TEXT UNIQUE NOT NULL, color TEXT);
CREATE TABLE IF NOT EXISTS file_tags(file_id INTEGER, tag_id INTEGER, PRIMARY KEY(file_id, tag_id));
CREATE INDEX IF NOT EXISTS file_tags_tag ON file_tags(tag_id);
CREATE TABLE IF NOT EXISTS settings(key TEXT PRIMARY KEY, value TEXT);
"""

DEFAULT_EXCLUDES = ["node_modules", "__pycache__", "venv", "site-packages", "Pods", "DerivedData",
                    "*.app", "*.photoslibrary", "*.fcpbundle", "*.musiclibrary", "*.tvlibrary",
                    "*.imovielibrary", "$RECYCLE.BIN", "System Volume Information", "*.lrdata",
                    "*.lrcat-data"]
DEFAULT_SETTINGS = {
    "custom_variants": "",
    "excludes": "\n".join(DEFAULT_EXCLUDES),
    "cross_punct": "0",
    "rescan_minutes": "10",
    "watch": "1",
    "skip_projects": "1",
    "code_fulltext": "0",
    "mode": "full",
    "scope": "name",
}
# 含這些文件的文件夾視為代碼項目，整個跳過
PROJECT_MARKERS = {"package.json", "pyproject.toml", "setup.py", "requirements.txt", "Cargo.toml",
                   "go.mod", "pom.xml", "build.gradle", "Gemfile", "composer.json", "Package.swift",
                   "CMakeLists.txt"}
PROJECT_DIR_SUFFIXES = (".xcodeproj", ".xcworkspace")
# FSEvents 標誌位
FS_MUST_SCAN = 0x1 | 0x2 | 0x4
FS_ROOT_CHANGED = 0x20
FS_CREATED, FS_REMOVED, FS_RENAMED = 0x100, 0x200, 0x800
MAINT_INTERVAL = 24 * 3600                 # 空閒時每天整理一次數據庫與緩存
THUMB_CACHE_MAX = 300 * 1024 * 1024        # 縮略圖緩存上限
WS_DELETE = dict.fromkeys(map(ord, " \t\r\n\f\v\u3000"), None)
TAG_COLORS = ["#c2412d", "#d98a1c", "#3f8f4f", "#2f7fb3", "#7a55b5", "#b04a85", "#6b6b6b"]


class UserError(Exception):
    pass


# ======================================================================= 查詢解析
def parse_query(q):
    """空格=且，-詞=排除，"…"=短語，| 或 OR=或。返回 [{'neg':bool,'alts':[str]}]"""
    toks = re.findall(r'-?"[^"]*"?|\S+', q)
    groups, pend_or = [], False
    for tok in toks:
        if tok in ("|", "OR", "或"):
            pend_or = True
            continue
        neg = tok.startswith("-") and len(tok) > 1
        if neg:
            tok = tok[1:]
        if tok.startswith('"'):
            alts = [tok.strip('"')]
        else:
            alts = [a for a in tok.split("|")]
        alts = [a for a in alts if a.strip()]
        if not alts:
            continue
        if pend_or and groups and not neg and not groups[-1]["neg"]:
            groups[-1]["alts"] += alts
        else:
            groups.append({"neg": neg, "alts": alts})
        pend_or = False
    return groups


class LRU(object):
    def __init__(self, budget):
        self.d, self.size, self.budget, self.lock = OrderedDict(), 0, budget, threading.Lock()

    def get(self, k):
        with self.lock:
            v = self.d.get(k)
            if v is not None:
                self.d.move_to_end(k)
            return v

    def put(self, k, v, cost):
        with self.lock:
            if k in self.d:
                self.size -= self.d.pop(k)[1]
            self.d[k] = (v, cost)
            self.size += cost
            while self.size > self.budget and len(self.d) > 1:
                _, (_, c) = self.d.popitem(last=False)
                self.size -= c

    def drop(self, k):
        with self.lock:
            if k in self.d:
                self.size -= self.d.pop(k)[1]

    def clear(self):
        with self.lock:
            self.d.clear()
            self.size = 0


def _now():
    return time.time()


# macOS 的內存分配器會留著已釋放的大塊內存備用；空閒時請它歸還給系統
try:
    import ctypes
    _relief = ctypes.CDLL("/usr/lib/libSystem.B.dylib").malloc_zone_pressure_relief
    _relief.argtypes = [ctypes.c_void_p, ctypes.c_size_t]
    _relief.restype = ctypes.c_size_t
except Exception:  # noqa
    _relief = None


def release_memory():
    return _relief(None, 0) if _relief else 0


def _under(p, d):
    return p == d or p.startswith(d + "/")


class NameIndex(object):
    """常駐內存的文件名／文件夾名表：歸一化後拼成一個長字符串，用 str.find 定位候選，再用正則覆核。"""

    def __init__(self, lib):
        self.lib = lib
        self.lock = threading.Lock()
        self.version = 1
        self.built = 0
        self.f_blob, self.f_starts, self.f_ids = "\n", [], []
        self.d_blob, self.d_starts, self.d_paths = "\n", [], []
        self.keytab = {}

    def mark(self):
        self.version += 1

    @staticmethod
    def _join(parts):
        starts, pos = [], 0
        for s in parts:
            starts.append(pos)
            pos += len(s) + 1
        return "\n".join(parts) + "\n", starts

    def ensure(self):
        if self.built == self.version:
            return
        with self.lock:
            v = self.version
            if self.built == v:
                return
            tab = dict(self.lib.norm.tables["full"])
            tab.update(WS_DELETE)
            c = sqlite3.connect(self.lib.db_path, timeout=30)
            ids, parts, dirs = [], [], set()
            for fid, name, d in c.execute("SELECT id, name, dir FROM files"):
                ids.append(fid)
                parts.append(name.translate(tab))
                dirs.add(d)
            rootset = set(r[0] for r in c.execute("SELECT path FROM roots"))
            c.close()
            alld = set()
            for d in dirs:
                p = d
                while p and p not in alld and p not in rootset:
                    alld.add(p)
                    np = os.path.dirname(p)
                    if np == p:
                        break
                    p = np
            dpaths = sorted(alld)
            self.f_blob, self.f_starts = self._join(parts)
            self.f_ids = ids
            self.d_blob, self.d_starts = self._join([os.path.basename(p).translate(tab) for p in dpaths])
            self.d_paths = dpaths
            self.keytab = tab
            self.built = v

    @staticmethod
    def _find(blob, starts, key):
        out, n = [], len(starts)
        i = blob.find(key)
        while i != -1:
            k = bisect.bisect_right(starts, i) - 1
            out.append(k)
            nxt = starts[k + 1] if k + 1 < n else len(blob)
            i = blob.find(key, nxt)
        return out

    def candidates(self, groups):
        """返回 (文件 id 集合, 文件夾路徑集合)；檢索詞無法預篩時返回 None（退回逐條匹配）。"""
        self.ensure()
        fs = ds = None
        for g in groups:
            if g["neg"]:
                continue
            fids, dps = set(), set()
            for a in g["alts"]:
                if re.search(r"[0-9A-Za-z][\s\W_]+[0-9A-Za-z]", a.strip()):
                    return None          # 含空格／標點的西文短語，正則允許間隔，不能用子串預篩
                key = a.translate(self.keytab)
                if not key:
                    return None
                fids.update(self.f_ids[k] for k in self._find(self.f_blob, self.f_starts, key))
                dps.update(self.d_paths[k] for k in self._find(self.d_blob, self.d_starts, key))
            fs = fids if fs is None else fs & fids
            ds = dps if ds is None else ds & dps
        return fs, ds


class Watcher(object):
    """tjhelper watch（FSEvents）子進程：實時接收資料庫目錄裡的變化。"""

    def __init__(self, helper, on_event, log):
        self.helper, self.on_event, self.log = helper, on_event, log
        self.proc, self.paths, self.lock = None, [], threading.Lock()

    @property
    def active(self):
        return self.proc is not None and self.proc.poll() is None

    def set_paths(self, paths):
        with self.lock:
            paths = sorted(p for p in paths if os.path.isdir(p))
            if paths == self.paths and self.active:
                return
            self._stop()
            self.paths = paths
            if not self.helper or not paths:
                return
            try:
                self.proc = subprocess.Popen([self.helper, "watch"] + paths, stdin=subprocess.PIPE,
                                             stdout=subprocess.PIPE, stderr=subprocess.DEVNULL)
            except OSError as e:
                self.log("watcher failed: %s" % e)
                self.proc = None
                return
            threading.Thread(target=self._read, args=(self.proc,), name="fsevents", daemon=True).start()

    def stop(self):
        with self.lock:
            self._stop()
            self.paths = []

    def _stop(self):
        p, self.proc = self.proc, None
        if p and p.poll() is None:
            try:
                p.stdin.close()
                p.terminate()
            except Exception:  # noqa
                pass

    def _read(self, proc):
        buf, fd = b"", proc.stdout.fileno()
        while True:
            try:
                chunk = os.read(fd, 65536)
            except OSError:
                break
            if not chunk:
                break
            buf += chunk
            *recs, buf = buf.split(b"\0")
            for rec in recs:
                fl, _, path = rec.partition(b"\t")
                try:
                    self.on_event(path.decode("utf-8"), int(fl))
                except Exception:  # noqa
                    pass


class Library(object):
    def __init__(self, db_path, variants_path, helper=None, log=print):
        self.db_path = db_path
        self.variants_path = variants_path
        self.helper = helper if helper and os.path.exists(helper) else None
        self.log = log
        self.local = threading.local()
        os.makedirs(os.path.dirname(db_path), exist_ok=True)
        c = self.conn()
        c.executescript(SCHEMA)
        c.commit()
        self.norm = Normalizer(variants_path, self.setting("custom_variants"))
        self.extractor = Extractor(self.helper)
        # 全文緩存：中文字符串每字 2–4 字節，故上限取 2000 萬字；超長文本不緩存
        self.text_cache = LRU(20 * 1000 * 1000)
        self.big_sem = threading.Semaphore(1)     # 大文件逐個抽取，避免多個 PDFKit 進程同時佔用大量內存
        self.thumb_sem = threading.Semaphore(3)
        # 按數據庫分開存放：清理時只會刪本數據庫已不存在的文件的縮略圖
        self.thumb_dir = os.path.join(os.path.expanduser("~/Library/Caches/TongJian"), "thumbs-" +
                                      hashlib.sha1(os.path.realpath(db_path).encode("utf-8")).hexdigest()[:10])
        self.regex_cache = {}
        self.ver = 1                       # 數據版本：統計結果按版本緩存
        self._cache = {}
        self.names = NameIndex(self)
        self.coll = Collator(self.setting("collation") or system_collation())
        self.projects = set()              # 自動跳過的代碼項目
        self.fs_lock = threading.Lock()
        self.fs_pending, self.fs_first, self.fs_last = {}, 0, 0
        self.watcher = Watcher(self.helper, self.on_fs_event, log)
        self._cfg()
        self.last_job = _now()
        self.last_relief = 0
        self.last_use = _now()
        try:
            self.last_maint = float(self.setting("last_maint") or 0)
        except ValueError:
            self.last_maint = 0
        self.status_lock = threading.Lock()
        self.status = {"busy": False, "phase": "", "detail": "", "done": 0, "todo": 0,
                       "scanned": 0, "errors": 0, "last": 0, "message": ""}
        self.jobs = queue.Queue()
        self.pending = set()
        self.pending_lock = threading.Lock()
        self.last_scan_all = 0
        self.worker = threading.Thread(target=self._worker, name="indexer", daemon=True)
        self.worker.start()
        if self.setting("fts_sig") != self.norm_sig():
            self.enqueue(("rebuild_fts",))
        self.update_watcher()                # 先開始監聽，再做啟動掃描，期間的變化不會漏
        self.enqueue(("scan", None))

    # ------------------------------------------------------------------ 連接與設置
    def conn(self):
        c = getattr(self.local, "c", None)
        if c is None:
            c = sqlite3.connect(self.db_path, timeout=30, check_same_thread=False)
            c.row_factory = sqlite3.Row
            c.execute("PRAGMA journal_mode=WAL")
            c.execute("PRAGMA synchronous=NORMAL")
            c.execute("PRAGMA busy_timeout=30000")
            c.execute("PRAGMA journal_size_limit=33554432")   # WAL 檢查點後截回 32 MB 以內
            c.execute("PRAGMA foreign_keys=OFF")
            self.local.c = c
        return c

    def setting(self, key):
        r = self.conn().execute("SELECT value FROM settings WHERE key=?", (key,)).fetchone()
        return r[0] if r else DEFAULT_SETTINGS.get(key, "")

    def set_setting(self, key, value):
        c = self.conn()
        c.execute("INSERT OR REPLACE INTO settings(key,value) VALUES(?,?)", (key, str(value)))
        c.commit()
        self._cfg()

    def _cfg(self):
        self._skip_projects = self.setting("skip_projects") != "0"
        self._code_ft = self.setting("code_fulltext") == "1"

    def indexable(self, ext):
        return ext in INDEXABLE and (self._code_ft or ext not in CODE_EXTS)

    def touch(self, names=False):
        self.ver += 1
        if names:
            self.names.mark()

    def cached(self, key, fn):
        hit = self._cache.get(key)
        if hit and hit[0] == self.ver:
            return hit[1]
        val = fn()
        self._cache[key] = (self.ver, val)
        return val

    def norm_sig(self):
        h = hashlib.sha1()
        with open(self.variants_path, "rb") as f:
            h.update(f.read())
        h.update(self.setting("custom_variants").encode("utf-8"))
        return h.hexdigest()

    def rules(self):
        """排除規則：(名稱通配列表, 路徑列表)。以 / 或 ~ 開頭的行是文件夾路徑。"""
        names, paths = [], []
        for x in self.setting("excludes").splitlines():
            x = x.strip()
            if not x or x.startswith("#"):
                continue
            if x.startswith("/") or x.startswith("~"):
                paths.append(os.path.realpath(os.path.expanduser(x)).rstrip("/"))
            else:
                names.append(x)
        return names, paths

    def update_watcher(self):
        if self.setting("watch") == "1" and self.helper:
            self.watcher.set_paths([r[0] for r in self.conn().execute("SELECT path FROM roots")])
        else:
            self.watcher.stop()

    def on_fs_event(self, path, flags):
        with self.fs_lock:
            self.fs_pending[path] = self.fs_pending.get(path, 0) | flags
            self.fs_last = _now()
            if not self.fs_first:
                self.fs_first = self.fs_last

    # ------------------------------------------------------------------ 狀態
    def set_status(self, **kw):
        with self.status_lock:
            self.status.update(kw)

    def get_status(self):
        with self.status_lock:
            s = dict(self.status)
        s["queued"] = self.jobs.qsize()
        s["watching"] = self.watcher.active
        return s

    # ------------------------------------------------------------------ 任務隊列
    def enqueue(self, job):
        key = job[:2] if len(job) > 1 else job
        with self.pending_lock:
            if key in self.pending:
                return
            self.pending.add(key)
        self.jobs.put(job)

    def _worker(self):
        while True:
            try:
                job = self.jobs.get(timeout=1.0)
            except queue.Empty:
                now = _now()
                if now - self.last_relief > 60:
                    self.last_relief = now
                    if now - self.last_use > 300:
                        self.text_cache.clear()     # 5 分鐘沒有檢索：清空全文緩存
                    release_memory()
                with self.fs_lock:
                    ready = bool(self.fs_pending) and (now - self.fs_last > 1.0 or now - self.fs_first > 5.0)
                if ready:
                    self.enqueue(("events",))
                elif self.last_scan_all and now - self.last_maint > MAINT_INTERVAL and now - self.last_job > 30:
                    self.enqueue(("maintain",))
                elif not self.watcher.active and now - self.last_scan_all > 60:
                    mins = float(self.setting("rescan_minutes") or 0)
                    if mins > 0 and now - self.last_scan_all > mins * 60:
                        self.enqueue(("scan", None))
                continue
            key = job[:2] if len(job) > 1 else job
            with self.pending_lock:
                self.pending.discard(key)
            try:
                if job[0] == "scan":
                    self._scan(job[1])
                elif job[0] == "rebuild_fts":
                    self._rebuild_fts()
                elif job[0] == "file":
                    self._index_paths([job[1]])
                elif job[0] == "events":
                    self._apply_events()
                elif job[0] == "maintain":
                    self._maintain()
            except Exception as e:  # noqa
                self.log("job failed: %r\n%s" % (job, traceback.format_exc()))
                self.set_status(message="出錯：%s" % e)
            finally:
                self.last_job = _now()
                if self.jobs.qsize() == 0:
                    self.set_status(busy=False, phase="", detail="", last=_now())

    # ------------------------------------------------------------------ 掃描
    def _skip(self, name, excl):
        if name.startswith(".") or name.startswith("~$") or name in ("Icon\r",):
            return True
        for pat in excl:
            if fnmatch.fnmatch(name, pat):
                return True
        return False

    def _excluded(self, p, rpath, names, paths):
        """路徑 p（位於根目錄 rpath 之下）是否被排除：名稱規則、路徑規則或代碼項目。"""
        if p != rpath:
            for comp in p[len(rpath) + 1:].split("/"):
                if self._skip(comp, names):
                    return True
        for x in paths:
            if _under(p, x):
                return True
        for x in list(self.projects):
            if _under(p, x):
                return True
        return False

    def projects_list(self):
        return sorted(self.projects)

    def _walk(self, top, rpath, names, paths, found, progress=False):
        """遍歷 top，把 (路徑 → stat) 填入 found；跳過排除項與代碼項目。"""
        last_t = _now()
        for dirpath, dirnames, filenames in os.walk(top):
            if any(_under(dirpath, x) for x in paths):
                dirnames[:] = []
                continue
            if self._skip_projects and dirpath != rpath and (
                    PROJECT_MARKERS.intersection(filenames) or
                    any(d.endswith(PROJECT_DIR_SUFFIXES) for d in dirnames)):
                self.projects.add(dirpath)
                dirnames[:] = []
                continue
            dirnames[:] = sorted(d for d in dirnames if not self._skip(d, names))
            for fn in filenames:
                if self._skip(fn, names):
                    continue
                p = os.path.join(dirpath, fn)
                try:
                    st = os.stat(p)
                except OSError:
                    continue
                if not statmod.S_ISREG(st.st_mode):
                    continue
                found[p] = st
                if progress and _now() - last_t > 0.3:
                    self.set_status(scanned=len(found))
                    last_t = _now()

    def _scan(self, root_id):
        c = self.conn()
        if root_id is None:
            roots = c.execute("SELECT id, path FROM roots ORDER BY id").fetchall()
            self.last_scan_all = _now()
        else:
            roots = c.execute("SELECT id, path FROM roots WHERE id=?", (root_id,)).fetchall()
        for r in roots:
            self._scan_root(r["id"], r["path"])
        self.update_watcher()

    def _scan_root(self, rid, rpath):
        c = self.conn()
        if not os.path.isdir(rpath):
            # 外接硬盤未掛載等：保留索引，不刪除
            c.execute("UPDATE roots SET missing=1 WHERE id=?", (rid,))
            c.commit()
            self.touch()
            return
        c.execute("UPDATE roots SET missing=0 WHERE id=?", (rid,))
        self._cfg()
        names, paths = self.rules()
        self.set_status(busy=True, phase="掃描", detail=rpath, scanned=0, done=0, todo=0, errors=0)
        existing = dict((row[1], tuple(row)) for row in c.execute(
            "SELECT id, path, size, mtime, status, xver, ext FROM files WHERE root_id=?", (rid,)))
        self.projects = set(x for x in self.projects if not _under(x, rpath))
        found = {}
        self._walk(rpath, rpath, names, paths, found, progress=True)
        self.set_status(scanned=len(found))
        self._reconcile(rid, existing, found)
        c.execute("UPDATE roots SET last_scan=? WHERE id=?", (_now(), rid))
        c.commit()

    def _reconcile(self, rid, existing, found):
        """比對範圍內的舊記錄 existing {路徑: 行} 與磁盤上的文件 found {路徑: stat}：
        新增、更新、刪除，並按（大小、修改時間、擴展名）識別改名／移動，保留收藏標籤備註。"""
        c = self.conn()
        new, changed, seen = [], [], set()
        for p, st in found.items():
            rec = existing.get(p)
            if rec is None:
                new.append((None, p, st))
                continue
            seen.add(p)
            ext = rec[6]
            same = rec[2] == st.st_size and abs((rec[3] or 0) - st.st_mtime) < 0.001
            ix = self.indexable(ext)
            stale = ix and (rec[4] == 0 or (rec[4] == 3 and rec[5] != EXTRACTOR_VERSION))
            dropped = not ix and rec[4] == 1          # 不再收全文的格式
            if same and not stale and not dropped:
                continue
            changed.append((rec[0], p, st))
        missing = [v for k, v in existing.items() if k not in seen]
        moved = 0
        if missing and new:
            sig = {}
            for m in missing:
                sig.setdefault((m[2], round(m[3] or 0, 3), m[6]), []).append(m)
            keep_new, moved_ids = [], set()
            for item in new:
                p, st = item[1], item[2]
                ext = os.path.splitext(p)[1][1:].lower()
                cand = sig.get((st.st_size, round(st.st_mtime, 3), ext))
                if cand and len(cand) == 1 and st.st_size > 0 and cand[0][0] not in moved_ids:
                    fid = cand[0][0]
                    moved_ids.add(fid)
                    c.execute("UPDATE files SET path=?, dir=?, name=?, root_id=? WHERE id=?",
                              (p, os.path.dirname(p), os.path.basename(p), rid, fid))
                else:
                    keep_new.append(item)
            new = keep_new
            moved = len(moved_ids)
            missing = [m for m in missing if m[0] not in moved_ids]
        if missing:
            self._delete_ids(c, [m[0] for m in missing])
        c.commit()
        if moved or missing or new or changed:
            self.touch(True)
        todo = changed + new
        if todo:
            self._index_items(rid, todo)

    def _apply_events(self):
        """處理一批 FSEvents：只重新檢查變化涉及的文件和文件夾。"""
        with self.fs_lock:
            ev, self.fs_pending, self.fs_first = self.fs_pending, {}, 0
        if not ev:
            return
        self._cfg()
        c = self.conn()
        roots = [(r[0], r[1]) for r in c.execute("SELECT id, path FROM roots")]
        rmap = dict(roots)
        names, paths = self.rules()
        scopes, full = {}, set()
        for p, fl in ev.items():
            rid = self.root_for(p, roots)
            if rid is None:
                continue
            rpath = rmap[rid]
            if not os.path.isdir(rpath):
                continue                      # 根目錄不在（外接盤拔出）：不動索引
            if fl & FS_ROOT_CHANGED or (p == rpath and fl & FS_MUST_SCAN):
                full.add(rid)
                continue
            files, gone, trees = scopes.setdefault(rid, (set(), set(), set()))
            if fl & FS_MUST_SCAN:
                d = p if os.path.isdir(p) else os.path.dirname(p)
                if not self._excluded(d, rpath, names, paths):
                    trees.add(d)
                continue
            if self._excluded(p, rpath, names, paths):
                continue
            base, d = os.path.basename(p), os.path.dirname(p)
            if self._skip_projects and base in PROJECT_MARKERS and d != rpath:
                if os.path.isfile(p):
                    self.projects.add(d)
                    gone.add(d)               # 變成代碼項目：整個移出索引
                else:
                    self.projects.discard(d)
                    trees.add(d)
                continue
            if os.path.isdir(p):
                if fl & (FS_CREATED | FS_REMOVED | FS_RENAMED):
                    trees.add(p)
            elif os.path.isfile(p):
                files.add(p)
            elif not os.path.lexists(p):
                gone.add(p)
        for rid in full:
            self._scan_root(rid, rmap[rid])
        q = "SELECT id, path, size, mtime, status, xver, ext FROM files WHERE "
        for rid, (files, gone, trees) in scopes.items():
            if rid in full:
                continue
            existing = {}
            for p in files | gone:
                for row in c.execute(q + "path=?", (p,)):
                    existing[row[1]] = tuple(row)
            for d in trees | gone:
                for row in c.execute(q + "path>=? AND path<?", (d + "/", d + "0")):
                    existing[row[1]] = tuple(row)
            found = {}
            for p in files:
                try:
                    st = os.stat(p)
                except OSError:
                    continue
                if statmod.S_ISREG(st.st_mode):
                    found[p] = st
            for d in trees:
                if os.path.isdir(d):
                    self._walk(d, rmap[rid], names, paths, found)
            self._reconcile(rid, existing, found)

    def _index_paths(self, paths):
        c = self.conn()
        roots = c.execute("SELECT id, path FROM roots").fetchall()
        items = {}
        for p in paths:
            rid = self.root_for(p, roots)
            if rid is None or not os.path.isfile(p):
                continue
            row = c.execute("SELECT id FROM files WHERE path=?", (p,)).fetchone()
            items.setdefault(rid, []).append((row[0] if row else None, p, os.stat(p)))
        for rid, its in items.items():
            self._index_items(rid, its)

    def _index_items(self, rid, items):
        c = self.conn()
        # 先寫入元數據（文件名可立即檢索），再抽取全文
        rows = []
        for fid, p, st in items:
            ext = os.path.splitext(p)[1][1:].lower()
            meta = (rid, p, os.path.dirname(p), os.path.basename(p), ext, kind_of(ext),
                    st.st_size, st.st_mtime)
            if fid is None:
                cur = c.execute("INSERT INTO files(root_id,path,dir,name,ext,kind,size,mtime,status,added)"
                                " VALUES(?,?,?,?,?,?,?,?,0,?)", meta + (_now(),))
                fid = cur.lastrowid
            else:
                c.execute("UPDATE files SET root_id=?,path=?,dir=?,name=?,ext=?,kind=?,size=?,mtime=?"
                          " WHERE id=?", meta + (fid,))
            if self.indexable(ext):
                rows.append((fid, p, ext, st.st_size))
            else:
                self._store(c, fid, 0, "", None)
        c.commit()
        if not rows:
            return
        # 小文件先做，盡快可檢索
        rows.sort(key=lambda r: r[3])
        self.set_status(busy=True, phase="抽取全文", todo=len(rows), done=0)
        done = errors = 0
        last_commit = _now()
        workers = max(2, min(5, (os.cpu_count() or 4) - 1))
        with ThreadPoolExecutor(max_workers=workers) as pool:
            it = iter(rows)
            futs = OrderedDict()

            def submit_more():
                while len(futs) < workers + 2:
                    try:
                        r = next(it)
                    except StopIteration:
                        return
                    futs[pool.submit(self._extract_one, r)] = r
            submit_more()
            while futs:
                fut, r = futs.popitem(last=False)
                fid, p = r[0], r[1]
                try:
                    status, text = fut.result()
                except Exception as e:  # noqa
                    status, text = 3, str(e)
                submit_more()
                # 逐字切分放在寫入線程做，不讓切分後的長字符串堆積在隊列裡
                idx = self.norm.index_text(text) if status == 1 else None
                self._store(c, fid, status, text, idx)
                text = idx = None
                done += 1
                if status == 3:
                    errors += 1
                self.set_status(done=done, errors=errors, detail=os.path.basename(p))
                if _now() - last_commit > 1.0:
                    c.commit()
                    last_commit = _now()
        c.commit()

    def _extract_one(self, r):
        fid, p, ext, size = r
        if size > (80 if ext == "pdf" else 30) * 1024 * 1024:
            with self.big_sem:
                return self.extractor.extract(p, ext, size)
        return self.extractor.extract(p, ext, size)

    def _store(self, c, fid, status, text, idx):
        self.text_cache.drop(fid)
        self.ver += 1
        c.execute("DELETE FROM fts WHERE rowid=?", (fid,))
        if status == 1:
            z = zlib.compress(text.encode("utf-8"), 6)
            c.execute("INSERT OR REPLACE INTO content(id, z) VALUES(?,?)", (fid, z))
            c.execute("INSERT INTO fts(rowid, body) VALUES(?,?)", (fid, idx))
            pages = text.count("\f") + 1 if "\f" in text else 0
            c.execute("UPDATE files SET status=1, err=NULL, chars=?, pages=?, xver=?, indexed=? WHERE id=?",
                      (len(text), pages, EXTRACTOR_VERSION, _now(), fid))
        else:
            c.execute("DELETE FROM content WHERE id=?", (fid,))
            c.execute("UPDATE files SET status=?, err=?, chars=0, pages=0, xver=?, indexed=? WHERE id=?",
                      (status, text if status == 3 else None, EXTRACTOR_VERSION, _now(), fid))

    def _delete_ids(self, c, ids):
        for i in range(0, len(ids), 500):
            chunk = ids[i:i + 500]
            qs = ",".join("?" * len(chunk))
            c.execute("DELETE FROM fts WHERE rowid IN (%s)" % qs, chunk)
            c.execute("DELETE FROM content WHERE id IN (%s)" % qs, chunk)
            c.execute("DELETE FROM file_tags WHERE file_id IN (%s)" % qs, chunk)
            c.execute("DELETE FROM files WHERE id IN (%s)" % qs, chunk)
        for i in ids:
            self.text_cache.drop(i)
        self.touch(True)

    def _delete_under(self, c, path):
        ids = [r[0] for r in c.execute("SELECT id FROM files WHERE path>=? AND path<?", (path + "/", path + "0"))]
        if ids:
            self._delete_ids(c, ids)
        return len(ids)

    def exclude_path(self, path):
        """把文件夾加入排除列表，並立即把其中的文件移出索引。"""
        path = os.path.realpath(os.path.expanduser(path)).rstrip("/")
        c = self.conn()
        roots = c.execute("SELECT id, path FROM roots").fetchall()
        if any(path == r[1] for r in roots):
            raise UserError("這是資料庫的根文件夾，請在側欄右鍵「移出資料庫」")
        if self.root_for(path, roots) is None:
            raise UserError("文件夾不在資料庫中")
        lines = self.setting("excludes").splitlines()
        if path not in [x.strip() for x in lines]:
            lines.append(path)
            self.set_setting("excludes", "\n".join(lines))
        n = self._delete_under(c, path)
        c.commit()
        return n

    def _rebuild_fts(self):
        c = self.conn()
        total = c.execute("SELECT COUNT(*) FROM content").fetchone()[0]
        self.set_status(busy=True, phase="重建索引", detail="字表已更新", todo=total, done=0)
        c.execute("INSERT INTO fts(fts) VALUES('delete-all')")
        done = 0
        rc = sqlite3.connect(self.db_path, timeout=30)
        last = _now()
        for fid, z in rc.execute("SELECT id, z FROM content"):
            text = zlib.decompress(z).decode("utf-8")
            c.execute("INSERT INTO fts(rowid, body) VALUES(?,?)", (fid, self.norm.index_text(text)))
            done += 1
            if _now() - last > 1.0:
                c.commit()
                self.set_status(done=done)
                last = _now()
        rc.close()
        c.execute("INSERT OR REPLACE INTO settings(key,value) VALUES('fts_sig',?)", (self.norm_sig(),))
        c.commit()
        self.set_status(done=done)

    def reload_normalizer(self):
        self.norm = Normalizer(self.variants_path, self.setting("custom_variants"))
        self.regex_cache.clear()
        self.touch(True)
        if self.setting("fts_sig") != self.norm_sig():
            self.enqueue(("rebuild_fts",))

    # ------------------------------------------------------------------ 資料庫（根目錄）
    @staticmethod
    def root_for(path, roots):
        best, blen = None, -1
        for r in roots:
            rp = r["path"] if not isinstance(r, tuple) else r[1]
            rid = r["id"] if not isinstance(r, tuple) else r[0]
            if (path == rp or path.startswith(rp.rstrip("/") + "/")) and len(rp) > blen:
                best, blen = rid, len(rp)
        return best

    def roots(self):
        return self.cached("roots", self._roots)

    def _roots(self):
        c = self.conn()
        out = []
        for r in c.execute("SELECT * FROM roots ORDER BY path"):
            st = c.execute("SELECT COUNT(*), SUM(status=1), SUM(size) FROM files WHERE root_id=?",
                           (r["id"],)).fetchone()
            out.append({"id": r["id"], "path": r["path"], "name": os.path.basename(r["path"]) or r["path"],
                        "files": st[0] or 0, "texts": st[1] or 0, "bytes": st[2] or 0,
                        "last_scan": r["last_scan"], "missing": bool(r["missing"])})
        return out

    def add_root(self, path):
        path = os.path.realpath(os.path.expanduser(path.strip()))
        if not os.path.isdir(path):
            raise UserError("找不到文件夾：%s" % path)
        if path == "/":
            raise UserError("不能把整個磁盤加入資料庫")
        c = self.conn()
        roots = c.execute("SELECT id, path FROM roots").fetchall()
        for r in roots:
            if path == r["path"] or path.startswith(r["path"].rstrip("/") + "/"):
                raise UserError("「%s」已包含在資料庫「%s」中" % (os.path.basename(path), r["path"]))
        cur = c.execute("INSERT INTO roots(path, added) VALUES(?,?)", (path, _now()))
        rid = cur.lastrowid
        # 新目錄包含舊目錄：併入
        for r in roots:
            if r["path"].startswith(path.rstrip("/") + "/"):
                c.execute("UPDATE files SET root_id=? WHERE root_id=?", (rid, r["id"]))
                c.execute("DELETE FROM roots WHERE id=?", (r["id"],))
        c.commit()
        self.touch(True)
        self.enqueue(("scan", rid))
        return rid

    def remove_root(self, rid):
        c = self.conn()
        ids = [r[0] for r in c.execute("SELECT id FROM files WHERE root_id=?", (rid,))]
        self._delete_ids(c, ids)
        c.execute("DELETE FROM roots WHERE id=?", (rid,))
        c.commit()
        self.touch(True)
        self.update_watcher()

    # ------------------------------------------------------------------ 文本
    def get_text(self, fid):
        t = self.text_cache.get(fid)
        if t is not None:
            return t[0]
        r = self.conn().execute("SELECT z FROM content WHERE id=?", (fid,)).fetchone()
        if not r:
            return None
        text = zlib.decompress(r[0]).decode("utf-8")
        if len(text) <= 5 * 1000 * 1000:
            self.text_cache.put(fid, text, len(text))
        return text

    # ------------------------------------------------------------------ 檢索
    def char_class(self, ch, level):
        mem = self.norm.members(ch, level)
        if len(mem) == 1:
            return re.escape(ch)
        return "[" + "".join(re.escape(m) for m in sorted(mem)) + "]"

    def term_regex(self, term, level, cross):
        key = (term, level, cross)
        rx = self.regex_cache.get(key)
        if rx is not None:
            return rx
        gap_cjk = r"[\W_]*" if cross else r"[\s　]*"
        out, prev, space = [], None, False
        for ch in term:
            if ch.isspace():
                space = prev is not None
                continue
            if prev is not None:
                if is_cjk(ch) or is_cjk(prev):
                    out.append(gap_cjk)
                elif space:
                    out.append(r"[\W_]+")
            out.append(self.char_class(ch, level))
            prev, space = ch, False
        rx = re.compile("".join(out)) if out else None
        if len(self.regex_cache) > 500:
            self.regex_cache.clear()
        self.regex_cache[key] = rx
        return rx

    def fts_phrase(self, term):
        if not re.search(r"\w", term):
            return None
        idx = self.norm.index_text(term).strip()
        ph = '"%s"' % idx.replace('"', '""')
        if re.search(r"[A-Za-z0-9]$", term.strip()):
            ph += " *"
        return ph

    def _filters(self, p):
        where, args = [], []
        if p.get("root"):
            where.append("f.root_id=?")
            args.append(int(p["root"]))
        if p.get("dir"):
            d = p["dir"].rstrip("/")
            where.append("(f.dir=? OR (f.dir>=? AND f.dir<?))")
            args += [d, d + "/", d + "0"]
        k = p.get("kind")
        if k == "notext":
            where.append("f.status=2 AND f.kind='pdf'")
        elif k:
            where.append("f.kind=?")
            args.append(k)
        if p.get("tag"):
            where.append("EXISTS(SELECT 1 FROM file_tags t WHERE t.file_id=f.id AND t.tag_id=?)")
            args.append(int(p["tag"]))
        if p.get("starred") in ("1", 1, True, "true"):
            where.append("f.starred=1")
        return where, args

    def segs(self, text, spans, qset):
        """把 [s,e) 命中區間切成 [[文字, 類型]]：0 普通，1 命中，2 異體命中。"""
        out = []
        pos = 0
        ex = self.norm.maps["exact"]
        for s, e in spans:
            if s < pos:
                s = pos
            if s >= e:
                continue
            if s > pos:
                out.append([text[pos:s], 0])
            cur, kind = [], None
            for ch in text[s:e]:
                k = 1 if (ex.get(ch, ch) in qset or not ch.strip() or not ch.isalnum()) else 2
                if k != kind and cur:
                    out.append(["".join(cur), kind])
                    cur = []
                kind = k
                cur.append(ch)
            if cur:
                out.append(["".join(cur), kind])
            pos = e
        if pos < len(text):
            out.append([text[pos:], 0])
        return out

    def _compile(self, groups, level, cross):
        pos, neg = [], []
        for g in groups:
            rxs = [self.term_regex(a, level, cross) for a in g["alts"]]
            rxs = [r for r in rxs if r is not None]
            if rxs:
                (neg if g["neg"] else pos).append(rxs)
        return pos, neg

    def _match_all(self, text, pos, neg, cap=3000):
        """全部正向組命中且無排除詞命中時，返回排序後的命中區間；否則 None。"""
        for rxs in neg:
            for rx in rxs:
                if rx.search(text):
                    return None
        spans = []
        for rxs in pos:
            got = False
            for rx in rxs:
                for m in rx.finditer(text):
                    if m.end() > m.start():
                        spans.append((m.start(), m.end()))
                        got = True
                        if len(spans) >= cap:
                            break
            if not got:
                return None
        spans.sort()
        merged = []
        for s, e in spans:
            if merged and s <= merged[-1][1]:
                if e > merged[-1][1]:
                    merged[-1] = (merged[-1][0], e)
            else:
                merged.append((s, e))
        return merged

    def _snippets(self, text, spans, qset, n=3, before=34, after=70):
        out = []
        page_starts = None
        if "\f" in text:
            page_starts = [0] + [m.end() for m in re.finditer("\f", text)]
        last_end = None
        for s, e in spans:
            if len(out) >= n:
                break
            if last_end is not None and s < last_end + 40:
                continue
            a = max(0, s - before)
            b = min(len(text), e + after)
            # 窗口內所有命中一起高亮
            inner = [(max(a, x), min(b, y)) for x, y in spans if y > a and x < b]
            segs = self.segs(text[a:b], [(x - a, y - a) for x, y in inner], qset)
            for sg in segs:
                sg[0] = re.sub(r"\s+", " ", sg[0])
            if a > 0:
                segs.insert(0, ["…", 0])
            if b < len(text):
                segs.append(["…", 0])
            page = bisect.bisect_right(page_starts, s) if page_starts else None
            out.append({"segs": segs, "page": page, "pos": s})
            last_end = b
        return out

    def _item(self, r):
        return {"id": r["id"], "name": r["name"], "dir": r["dir"], "ext": r["ext"],
                "kind": r["kind"], "size": r["size"], "mtime": r["mtime"], "starred": bool(r["starred"]),
                "status": r["status"], "pages": r["pages"], "chars": r["chars"], "root": r["root_id"],
                "note": bool(r["note"])}

    def search(self, p):
        t0 = self.last_use = _now()
        q = (p.get("q") or "").strip()
        level = p.get("mode") if p.get("mode") in Normalizer.LEVELS else "full"
        scope = p.get("scope") or "all"
        sort = p.get("sort") or "relevance"
        limit = max(1, min(int(p.get("limit") or 200), 5000))
        cross = self.setting("cross_punct") == "1"
        where, args = self._filters(p)
        c = self.conn()
        cols = "f.id, f.root_id, f.name, f.dir, f.ext, f.kind, f.size, f.mtime, f.starred, f.status," \
               " f.pages, f.chars, f.note"
        groups = parse_query(q) if q else []
        res = {"q": q, "mode": level, "variants": [], "items": [], "truncated": False}
        if not groups:
            order = {"name": "f.name COLLATE NOCASE ASC", "size": "f.size DESC",
                     "mtime_asc": "f.mtime ASC"}.get(sort, "f.mtime DESC")
            sql = "SELECT %s FROM files f %s ORDER BY %s LIMIT ?" % (
                cols, ("WHERE " + " AND ".join(where)) if where else "", order)
            rows = c.execute(sql, args + [limit + 1]).fetchall()
            res["truncated"] = len(rows) > limit
            res["items"] = [self._item(r) for r in rows[:limit]]
            res["total"] = c.execute("SELECT COUNT(*) FROM files f %s" % (
                ("WHERE " + " AND ".join(where)) if where else ""), args).fetchone()[0]
            self._attach_tags(res["items"])
            res["took"] = round(_now() - t0, 3)
            return res

        seen_chars = []
        for g in groups:
            if g["neg"]:
                continue
            for a in g["alts"]:
                for ch in a:
                    if is_cjk(ch) and ch not in seen_chars:
                        seen_chars.append(ch)
        res["variants"] = [self.norm.group_info(ch) for ch in seen_chars[:24]]
        ex = self.norm.maps["exact"]
        qset = set(ex.get(ch, ch) for g in groups if not g["neg"] for a in g["alts"] for ch in a)
        pos, neg = self._compile(groups, level, cross)
        if not pos:
            res["took"] = round(_now() - t0, 3)
            res["total"] = 0
            return res
        found = OrderedDict()
        # ---- 文件名（先在常駐內存的歸一化名稱表裡預篩，再用正則覆核）
        dcand = None
        if scope in ("all", "name"):
            cand = None if cross else self.names.candidates(groups)
            if cand is None:
                sql = "SELECT %s FROM files f %s" % (cols, ("WHERE " + " AND ".join(where)) if where else "")
                rows = c.execute(sql, args)
            else:
                fcand, dcand = cand
                rows = self._name_rows(c, cols, where, args, fcand, sort, limit, res)
            for r in rows:
                spans = self._match_all(r["name"], pos, neg, cap=50)
                if spans is not None:
                    it = self._item(r)
                    it["name_segs"] = self.segs(r["name"], spans, qset)
                    it["score"] = 1000 + (100 - min(len(r["name"]), 100))
                    it["hits"] = 0
                    found[r["id"]] = it
        # ---- 文件夾名
        if scope in ("all", "name") and not p.get("kind") and not p.get("tag") and \
                p.get("starred") not in ("1", 1, True, "true"):
            for it in self._match_folders(c, p, pos, neg, qset, dcand):
                found[it["id"]] = it
        # ---- 全文
        if scope in ("all", "content"):
            fts_pos = []
            for g in groups:
                if g["neg"]:
                    continue
                phs = [self.fts_phrase(a) for a in g["alts"]]
                if any(ph is None for ph in phs):
                    continue        # 純標點，FTS 無法表達，交由正則覆核
                fts_pos.append("(" + " OR ".join(phs) + ")")
            fts_q = " AND ".join(fts_pos)
            if fts_q and level == "full":
                for g in groups:
                    if g["neg"]:
                        phs = [self.fts_phrase(a) for a in g["alts"]]
                        phs = [x for x in phs if x]
                        if phs:
                            fts_q += " NOT (" + " OR ".join(phs) + ")"
            if fts_q:
                sql = ("SELECT %s, bm25(fts) AS rank FROM fts JOIN files f ON f.id=fts.rowid "
                       "WHERE fts MATCH ? %s ORDER BY rank LIMIT 20000") % (
                    cols, (" AND " + " AND ".join(where)) if where else "")
                try:
                    cand = c.execute(sql, [fts_q] + args).fetchall()
                except sqlite3.OperationalError as e:
                    self.log("fts error %s: %s" % (fts_q, e))
                    cand = []
                budget = float(p.get("budget") or 6.0)
                verified = 0
                n = len(cand)
                for i, r in enumerate(cand):
                    if verified >= limit or _now() - t0 > budget:
                        res["truncated"] = True
                        break
                    text = self.get_text(r["id"])
                    if text is None:
                        continue
                    spans = self._match_all(text, pos, neg)
                    if spans is None:
                        continue
                    verified += 1
                    it = found.get(r["id"])
                    if it is None:
                        it = self._item(r)
                        it["score"] = 0
                        found[r["id"]] = it
                    it["hits"] = len(spans)
                    it["capped"] = len(spans) >= 3000
                    it["snippets"] = self._snippets(text, spans, qset)
                    it["score"] += 500.0 * (n - i) / max(n, 1)
                res["candidates"] = n
        items = list(found.values())
        if sort == "relevance":
            items.sort(key=lambda x: -x["score"])
        elif sort == "hits":
            items.sort(key=lambda x: (-(x.get("hits") or 0), -x["score"]))
        elif sort == "mtime":
            items.sort(key=lambda x: -(x["mtime"] or 0))
        elif sort == "mtime_asc":
            items.sort(key=lambda x: (x["mtime"] or 0))
        elif sort == "name":
            items.sort(key=lambda x: (not x.get("folder"), self.coll.key(x["name"])))
        elif sort == "size":
            items.sort(key=lambda x: -(x["size"] or 0))
        if len(items) > limit:
            items = items[:limit]
            res["truncated"] = True
        res["items"] = items
        res["total"] = len(items)
        res["hits"] = sum(x.get("hits") or 0 for x in items)
        self._attach_tags(items)
        res["took"] = round(_now() - t0, 3)
        return res

    @staticmethod
    def folder_id(path):
        return -(zlib.crc32(path.encode("utf-8")) & 0x7FFFFFFF) - 1

    def _folder_stats(self, c, p):
        """由文件表彙總出各文件夾（含子孫）的文件數、大小、最近修改時間。"""
        where, args = [], []
        if p.get("root"):
            where.append("f.root_id=?")
            args.append(int(p["root"]))
        if p.get("dir"):
            d = p["dir"].rstrip("/")
            where.append("(f.dir=? OR (f.dir>=? AND f.dir<?))")
            args += [d, d + "/", d + "0"]
        roots = dict((r[0], r[1]) for r in c.execute("SELECT id, path FROM roots"))
        agg = {}
        sql = "SELECT f.root_id, f.dir, COUNT(*), SUM(f.size), MAX(f.mtime) FROM files f %s GROUP BY f.root_id, f.dir" % (
            ("WHERE " + " AND ".join(where)) if where else "")
        for rid, d, n, sz, mt in c.execute(sql, args):
            rp = roots.get(rid)
            if not rp or not d:
                continue
            path = d
            while True:
                a = agg.get(path)
                if a is None:
                    a = agg[path] = [rid, 0, 0, 0]
                a[1] += n
                a[2] += sz or 0
                a[3] = max(a[3], mt or 0)
                if len(path) <= len(rp):
                    break
                path = os.path.dirname(path)
        stop = set(roots.values())
        if p.get("dir"):
            stop.add(p["dir"].rstrip("/"))
        return agg, stop

    def _match_folders(self, c, p, pos, neg, qset, dcand=None):
        self.names.ensure()
        roots = [(r[0], r[1]) for r in c.execute("SELECT id, path FROM roots")]
        fdir = p["dir"].rstrip("/") if p.get("dir") else None
        froot = int(p["root"]) if p.get("root") else None
        out = []
        for path in (sorted(dcand) if dcand is not None else self.names.d_paths):
            if fdir and not path.startswith(fdir + "/"):
                continue
            rid = self.root_for(path, roots)
            if rid is None or (froot and rid != froot):
                continue
            name = os.path.basename(path)
            spans = self._match_all(name, pos, neg, cap=50)
            if spans is None:
                continue
            n, sz, mt = c.execute("SELECT COUNT(*), SUM(size), MAX(mtime) FROM files WHERE dir=? OR (dir>=? AND dir<?)",
                                  (path, path + "/", path + "0")).fetchone()
            if not n:
                continue
            dp = self.names.d_paths                    # 已排序：用二分找出直屬子文件夾數
            lo, hi = bisect.bisect_left(dp, path + "/"), bisect.bisect_left(dp, path + "0")
            subs = sum(1 for x in dp[lo:hi] if "/" not in x[len(path) + 1:])
            out.append({"id": self.folder_id(path), "folder": True, "kind": "folder", "ext": "",
                        "name": name, "dir": os.path.dirname(path), "path": path, "root": rid, "subs": subs,
                        "count": n, "size": sz or 0, "mtime": mt or 0, "starred": False, "status": 0,
                        "pages": 0, "chars": 0, "note": False, "hits": 0,
                        "name_segs": self.segs(name, spans, qset),
                        "score": 2000 + (100 - min(len(name), 100))})
            if len(out) >= 300:
                break
        return out

    TREE_BUDGET = 1200        # 文件夾預覽一次帶回的文件數上限；更深的文件夾展開時再載入

    # 「恢復默認設置」會重置的項；自定義異體字與排除列表另行勾選
    RESETTABLE = ("cross_punct", "rescan_minutes", "watch", "skip_projects", "code_fulltext", "mode", "scope",
                  "sort", "collation", "sidebar_w", "list_w", "folder_view")

    def reset_settings(self, variants=False, excludes=False):
        keys = list(self.RESETTABLE) + (["custom_variants"] if variants else []) + (["excludes"] if excludes else [])
        before = dict((k, self.setting(k)) for k in keys)
        c = self.conn()
        c.executemany("DELETE FROM settings WHERE key=?", [(k,) for k in keys])
        c.commit()
        self._cfg()
        changed = set(k for k in keys if self.setting(k) != before[k])
        if "custom_variants" in changed:
            self.reload_normalizer()
        if "watch" in changed:
            self.update_watcher()
        if "collation" in changed:
            self.set_collation(self.setting("collation"))
        if changed & {"excludes", "skip_projects", "code_fulltext"}:
            self.enqueue(("scan", None))
        return sorted(changed)

    def set_collation(self, name):
        self.coll = Collator(name or system_collation())

    def _name_matcher(self, q, level):
        """返回 match(name) -> segs 或 None；q 為空時返回 None。"""
        groups = parse_query((q or "").strip())
        if not groups:
            return None
        level = level if level in Normalizer.LEVELS else "full"
        pos, neg = self._compile(groups, level, self.setting("cross_punct") == "1")
        if not pos:
            return None
        ex = self.norm.maps["exact"]
        qset = set(ex.get(ch, ch) for g in groups if not g["neg"] for a in g["alts"] for ch in a)

        def match(name):
            spans = self._match_all(name, pos, neg, cap=50)
            return self.segs(name, spans, qset) if spans is not None else None
        match.groups = groups
        return match

    def _dir_files(self, c, dirs, limit=None):
        """取若干文件夾的直接文件，按文件夾、自然序排好。"""
        rows = []
        dirs = list(dirs)
        for i in range(0, len(dirs), 500):
            chunk = dirs[i:i + 500]
            rows += c.execute("SELECT * FROM files WHERE dir IN (%s)" % ",".join("?" * len(chunk)), chunk).fetchall()
        key = self.coll.key
        rows.sort(key=lambda r: (r["dir"], key(r["name"])))
        if limit is not None:
            rows = rows[:limit]
        return [self._item(r) for r in rows]

    def folder(self, path, q="", level="full"):
        """文件夾預覽：整棵子樹的文件夾結構（每層附遞歸統計），文件淺層優先帶回；名稱命中檢索詞的標出。"""
        path = os.path.realpath(path).rstrip("/")
        c = self.conn()
        roots = c.execute("SELECT id, path FROM roots").fetchall()
        rid = self.root_for(path, roots)
        if rid is None:
            raise UserError("文件夾不在資料庫中")
        agg, _ = self._folder_stats(c, {"dir": path})
        me = agg.get(path, [rid, 0, 0, 0])
        direct = dict(c.execute("SELECT dir, COUNT(*) FROM files WHERE dir=? OR (dir>=? AND dir<?) GROUP BY dir",
                                (path, path + "/", path + "0")).fetchall())
        key = self.coll.key
        children = defaultdict(list)
        for d in agg:
            if d != path and d.startswith(path + "/"):
                children[os.path.dirname(d)].append(d)
        for k in children:
            children[k].sort(key=lambda x: key(os.path.basename(x)))
        # 廣度優先：淺層的文件先帶回，總數不超過 TREE_BUDGET
        order, i = [path], 0
        while i < len(order):
            order.extend(children.get(order[i], []))
            i += 1
        loaded, budget = set(), self.TREE_BUDGET
        for d in order:
            n = direct.get(d, 0)
            if n > budget:
                break
            loaded.add(d)
            budget -= n
        files = self._dir_files(c, loaded)
        partial_root = path not in loaded
        if partial_root:                       # 本層文件就超過上限：只帶前一部分
            files = self._dir_files(c, [path], limit=self.TREE_BUDGET)
        match = self._name_matcher(q, level)
        nmatch = 0
        if match:
            have = set(f["id"] for f in files)
            # 未帶回的深層文件裡也找命中（用常駐內存的名稱表預篩）
            cand = self.names.candidates(match.groups)
            extra = []
            if cand is not None:
                ids = [i for i in cand[0] if i not in have]
                for j in range(0, len(ids), 900):
                    chunk = ids[j:j + 900]
                    extra += c.execute("SELECT * FROM files WHERE id IN (%s) AND (dir=? OR (dir>=? AND dir<?))"
                                       % ",".join("?" * len(chunk)), chunk + [path, path + "/", path + "0"]).fetchall()
            extra = [self._item(r) for r in extra[:500]]
            extra.sort(key=lambda f: (f["dir"], key(f["name"])))
            files += extra
            for f in files:
                sg = match(f["name"])
                if sg:
                    f["segs"] = sg
                    nmatch += 1
        self._attach_tags(files)
        dirs = []
        for d in order[1:]:
            rid2, n, sz, mt = agg[d]
            item = {"path": d, "name": os.path.basename(d), "parent": os.path.dirname(d), "count": n,
                    "size": sz, "mtime": mt, "direct": direct.get(d, 0), "subs": len(children.get(d, [])),
                    "loaded": d in loaded}
            if match:
                sg = match(item["name"])
                if sg:
                    item["segs"] = sg
                    nmatch += 1
            dirs.append(item)
        kinds = dict(c.execute("SELECT kind, COUNT(*) FROM files WHERE dir=? OR (dir>=? AND dir<?) GROUP BY kind",
                               (path, path + "/", path + "0")).fetchall())
        return {"id": self.folder_id(path), "folder": True, "kind": "folder", "ext": "", "path": path,
                "name": os.path.basename(path), "dir": os.path.dirname(path), "root": rid,
                "count": me[1], "size": me[2], "mtime": me[3], "direct": direct.get(path, 0),
                "subs": len(children.get(path, [])), "dirs": dirs, "files": files, "kinds": kinds,
                "loaded": not partial_root, "matches": nmatch, "q": q or "",
                "exists": os.path.isdir(path), "tags": []}

    def folder_files(self, path, q="", level="full"):
        """展開文件夾時補載它的直接文件。"""
        path = os.path.realpath(path).rstrip("/")
        c = self.conn()
        if self.root_for(path, c.execute("SELECT id, path FROM roots").fetchall()) is None:
            raise UserError("文件夾不在資料庫中")
        files = self._dir_files(c, [path], limit=5000)
        match = self._name_matcher(q, level)
        if match:
            for f in files:
                sg = match(f["name"])
                if sg:
                    f["segs"] = sg
        self._attach_tags(files)
        return {"path": path, "files": files}

    def thumbnail(self, fid, size=240):
        """QuickLook 縮略圖，緩存在 ~/Library/Caches/TongJian/thumbs/<桶>/<id>_<mtime>_<size>.jpg。"""
        r = self._row(fid)
        if not self.helper or not os.path.exists(r["path"]):
            return None
        bucket = os.path.join(self.thumb_dir, "%02x" % (fid % 256))
        name = "%d_%d_%d.jpg" % (fid, int(r["mtime"] or 0), size)
        out = os.path.join(bucket, name)
        if os.path.exists(out):
            try:
                os.utime(out, None)            # 記下最近使用時間，清理時按此淘汰
            except OSError:
                pass
            return out
        with self.thumb_sem:
            if os.path.exists(out):
                return out
            os.makedirs(bucket, exist_ok=True)
            tmp = out + ".tmp.jpg"
            try:
                pr = subprocess.run([self.helper, "thumb", r["path"], tmp, str(size)],
                                    stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, timeout=40)
            except subprocess.TimeoutExpired:
                return None
            if pr.returncode != 0 or not os.path.exists(tmp):
                return None
            os.replace(tmp, out)
            # 同一文件的舊版本（文件改動前生成的）
            prefix = "%d_" % fid
            for fn in os.listdir(bucket):
                if fn.startswith(prefix) and fn != name:
                    try:
                        os.remove(os.path.join(bucket, fn))
                    except OSError:
                        pass
        return out

    def _prune_thumbs(self):
        """刪掉已不在索引中的文件的縮略圖、文件改動前的舊縮略圖，總量超過上限時按最近使用時間淘汰。"""
        if not os.path.isdir(self.thumb_dir):
            return 0
        rc = sqlite3.connect(self.db_path, timeout=30)
        cur = dict((fid, int(mt or 0)) for fid, mt in rc.execute("SELECT id, mtime FROM files"))
        rc.close()
        keep, removed = [], 0
        for root, _dirs, files in os.walk(self.thumb_dir):
            for fn in files:
                p = os.path.join(root, fn)
                try:
                    fid, mt = fn.split("_")[:2]
                    stale = cur.get(int(fid)) != int(mt) or root == self.thumb_dir   # 根目錄下是舊版佈局
                except ValueError:
                    stale = True                 # 殘留的臨時文件等
                if stale:
                    try:
                        os.remove(p)
                        removed += 1
                    except OSError:
                        pass
                    continue
                try:
                    st = os.stat(p)
                    keep.append((st.st_mtime, st.st_size, p))
                except OSError:
                    pass
        total = sum(k[1] for k in keep)
        if total > THUMB_CACHE_MAX:
            for _mt, sz, p in sorted(keep):      # 最久沒用的先刪，刪到上限的 3/4
                if total <= THUMB_CACHE_MAX * 3 // 4:
                    break
                try:
                    os.remove(p)
                    total -= sz
                    removed += 1
                except OSError:
                    pass
        return removed

    def _maintain(self):
        """空閒時的例行整理：合併全文索引、必要時壓縮數據庫、截短 WAL、清理縮略圖。"""
        t0 = _now()
        self.set_status(busy=True, phase="整理數據庫", detail="", done=0, todo=0)
        c = self.conn()
        c.commit()
        c.execute("INSERT INTO fts(fts) VALUES('optimize')")
        c.commit()
        pages = c.execute("PRAGMA page_count").fetchone()[0]
        free = c.execute("PRAGMA freelist_count").fetchone()[0]
        psize = c.execute("PRAGMA page_size").fetchone()[0]
        vacuumed = False
        if pages and free / float(pages) > 0.2 and free * psize > 32 * 1024 * 1024:
            c.execute("VACUUM")
            vacuumed = True
        c.execute("PRAGMA optimize")
        c.execute("PRAGMA wal_checkpoint(TRUNCATE)")
        removed = self._prune_thumbs()
        self.last_maint = _now()
        self.set_setting("last_maint", self.last_maint)
        self.log("maintenance: %.1fs, vacuum=%s, free pages %d/%d, thumbs removed %d" % (
            _now() - t0, vacuumed, free, pages, removed))

    NAME_ORDER = {"relevance": "length(f.name), f.id", "hits": "length(f.name), f.id",
                  "mtime": "f.mtime DESC", "mtime_asc": "f.mtime ASC",
                  "name": "f.name COLLATE NOCASE", "size": "f.size DESC"}

    def _name_rows(self, c, cols, where, args, fcand, sort, limit, res):
        """候選不多時直接按 id 取；很多時（幾萬個）放進臨時表，按排序分頁取，夠一頁就停。"""
        ids = list(fcand)
        if len(ids) <= 3000:
            rows = []
            for i in range(0, len(ids), 900):
                chunk = ids[i:i + 900]
                sql = "SELECT %s FROM files f WHERE f.id IN (%s)%s" % (
                    cols, ",".join("?" * len(chunk)), (" AND " + " AND ".join(where)) if where else "")
                rows += c.execute(sql, chunk + args).fetchall()
            return rows
        c.execute("CREATE TEMP TABLE IF NOT EXISTS cand(id INTEGER PRIMARY KEY)")
        c.execute("DELETE FROM cand")
        c.executemany("INSERT INTO cand(id) VALUES(?)", ((i,) for i in ids))
        sql = "SELECT %s FROM cand JOIN files f ON f.id=cand.id %s ORDER BY %s LIMIT ? OFFSET ?" % (
            cols, ("WHERE " + " AND ".join(where)) if where else "", self.NAME_ORDER.get(sort, "length(f.name)"))
        # 正則覆核（精確／簡繁模式）可能淘汰一部分，故多取幾頁；調用方只需前 limit 個
        out, off, batch = [], 0, max(limit * 2, 400)
        while len(out) < limit * 3:
            page = c.execute(sql, args + [batch, off]).fetchall()
            out += page
            off += batch
            if len(page) < batch:
                break
        else:
            res["truncated"] = True
        return out

    def _attach_tags(self, items):
        if not items:
            return
        m = dict((it["id"], it) for it in items)
        for it in items:
            it["tags"] = []
        ids = [i for i in m if i > 0]
        c = self.conn()
        for i in range(0, len(ids), 500):
            chunk = ids[i:i + 500]
            for fid, tid in c.execute("SELECT file_id, tag_id FROM file_tags WHERE file_id IN (%s)"
                                      % ",".join("?" * len(chunk)), chunk):
                m[fid]["tags"].append(tid)

    def preview(self, fid, q, level, max_chars=4000000):
        self.last_use = _now()
        c = self.conn()
        r = c.execute("SELECT * FROM files WHERE id=?", (fid,)).fetchone()
        if not r:
            raise UserError("文件不存在")
        it = self._item(r)
        it["path"] = r["path"]
        it["note_text"] = r["note"] or ""
        it["err"] = r["err"]
        it["indexed"] = r["indexed"]
        it["added"] = r["added"]
        it["tags"] = [t[0] for t in c.execute("SELECT tag_id FROM file_tags WHERE file_id=?", (fid,))]
        it["exists"] = os.path.exists(r["path"])
        text = self.get_text(fid) if r["status"] == 1 else None
        it["truncated"] = False
        spans = []
        if text is not None:
            if q and q.strip():
                groups = parse_query(q.strip())
                pos, neg = self._compile(groups, level if level in Normalizer.LEVELS else "full",
                                         self.setting("cross_punct") == "1")
                for rxs in pos:
                    for rx in rxs:
                        for m in rx.finditer(text):
                            if m.end() > m.start():
                                spans.append((m.start(), m.end()))
                                if len(spans) > 20000:
                                    break
                spans.sort()
                ex = self.norm.maps["exact"]
                it["qchars"] = "".join(sorted(set(ex.get(ch, ch) for g in groups if not g["neg"]
                                                  for a in g["alts"] for ch in a)))
            if len(text) > max_chars:
                text = text[:max_chars]
                spans = [s for s in spans if s[1] <= max_chars]
                it["truncated"] = True
            it["text"] = text
            it["spans"] = spans
        return it

    # ------------------------------------------------------------------ 字表
    def variants(self, q):
        out, seen = [], set()
        for ch in q:
            if is_cjk(ch) and ch not in seen:
                seen.add(ch)
                out.append(self.norm.group_info(ch))
        return out

    # ------------------------------------------------------------------ 管理操作
    def _row(self, fid):
        r = self.conn().execute("SELECT * FROM files WHERE id=?", (fid,)).fetchone()
        if not r:
            raise UserError("文件不存在（可能已被移動或刪除）")
        return r

    def open_file(self, fid, reveal=False):
        r = self._row(fid)
        if not os.path.exists(r["path"]):
            raise UserError("文件已不在原處：%s" % r["path"])
        subprocess.Popen(["/usr/bin/open"] + (["-R"] if reveal else []) + [r["path"]])

    def rename(self, fid, new_name):
        r = self._row(fid)
        new_name = (new_name or "").strip()
        if not new_name or "/" in new_name or new_name in (".", "..") or new_name.startswith("."):
            raise UserError("文件名不合法")
        if new_name == r["name"]:
            return self._item(r)
        dst = os.path.join(r["dir"], new_name)
        if os.path.exists(dst) and dst.lower() != r["path"].lower():
            raise UserError("同一文件夾中已有「%s」" % new_name)
        os.rename(r["path"], dst)
        ext = os.path.splitext(new_name)[1][1:].lower()
        c = self.conn()
        c.execute("UPDATE files SET path=?, name=?, ext=?, kind=? WHERE id=?",
                  (dst, new_name, ext, kind_of(ext), fid))
        c.commit()
        self.touch(True)
        if ext != r["ext"]:
            self.enqueue(("file", dst))
        return self._item(self._row(fid))

    def move(self, ids, dest):
        dest = os.path.realpath(os.path.expanduser(dest))
        if not os.path.isdir(dest):
            raise UserError("目標文件夾不存在")
        c = self.conn()
        roots = c.execute("SELECT id, path FROM roots").fetchall()
        rid = self.root_for(dest, roots)
        moved, errors, dropped = 0, [], 0
        for fid in ids:
            r = self._row(fid)
            dst = os.path.join(dest, r["name"])
            if os.path.abspath(dst) == r["path"]:
                continue
            if os.path.exists(dst):
                errors.append("目標已有同名文件：%s" % r["name"])
                continue
            try:
                shutil.move(r["path"], dst)
            except Exception as e:  # noqa
                errors.append("%s：%s" % (r["name"], e))
                continue
            moved += 1
            if rid is None:
                self._delete_ids(c, [fid])
                dropped += 1
            else:
                c.execute("UPDATE files SET path=?, dir=?, root_id=? WHERE id=?", (dst, dest, rid, fid))
        c.commit()
        self.touch(True)
        return {"moved": moved, "errors": errors, "dropped": dropped}

    def trash(self, ids):
        c = self.conn()
        done, errors = 0, []
        for fid in ids:
            r = self._row(fid)
            p = r["path"]
            if os.path.exists(p):
                try:
                    self._trash_path(p)
                except Exception as e:  # noqa
                    errors.append("%s：%s" % (r["name"], e))
                    continue
            self._delete_ids(c, [fid])
            done += 1
        c.commit()
        return {"trashed": done, "errors": errors}

    def _trash_path(self, p):
        if self.helper:
            pr = subprocess.run([self.helper, "trash", p], stdout=subprocess.PIPE, stderr=subprocess.PIPE)
            if pr.returncode == 0:
                return
        script = 'tell application "Finder" to delete (POSIX file %s as alias)' % _as_quote(p)
        pr = subprocess.run(["/usr/bin/osascript", "-e", script], stdout=subprocess.PIPE,
                            stderr=subprocess.PIPE)
        if pr.returncode != 0:
            raise RuntimeError(pr.stderr.decode("utf-8", "replace").strip() or "無法移到廢紙簍")

    def set_star(self, ids, v):
        c = self.conn()
        c.executemany("UPDATE files SET starred=? WHERE id=?", [(1 if v else 0, i) for i in ids])
        c.commit()
        self.touch()

    def set_note(self, fid, note):
        c = self.conn()
        c.execute("UPDATE files SET note=? WHERE id=?", (note or "", fid))
        c.commit()

    # ---- 標籤
    def tags(self):
        c = self.conn()
        return [{"id": r[0], "name": r[1], "color": r[2], "count": r[3]} for r in c.execute(
            "SELECT t.id, t.name, t.color, COUNT(ft.file_id) FROM tags t LEFT JOIN file_tags ft "
            "ON ft.tag_id=t.id GROUP BY t.id ORDER BY t.name")]

    def create_tag(self, name, color=None):
        name = (name or "").strip()
        if not name:
            raise UserError("標籤名不能為空")
        c = self.conn()
        if c.execute("SELECT 1 FROM tags WHERE name=?", (name,)).fetchone():
            raise UserError("已有同名標籤")
        n = c.execute("SELECT COUNT(*) FROM tags").fetchone()[0]
        cur = c.execute("INSERT INTO tags(name, color) VALUES(?,?)",
                        (name, color or TAG_COLORS[n % len(TAG_COLORS)]))
        c.commit()
        return cur.lastrowid

    def update_tag(self, tid, name=None, color=None):
        c = self.conn()
        if name is not None:
            name = name.strip()
            if not name:
                raise UserError("標籤名不能為空")
            if c.execute("SELECT 1 FROM tags WHERE name=? AND id<>?", (name, tid)).fetchone():
                raise UserError("已有同名標籤")
            c.execute("UPDATE tags SET name=? WHERE id=?", (name, tid))
        if color:
            c.execute("UPDATE tags SET color=? WHERE id=?", (color, tid))
        c.commit()

    def delete_tag(self, tid):
        c = self.conn()
        c.execute("DELETE FROM file_tags WHERE tag_id=?", (tid,))
        c.execute("DELETE FROM tags WHERE id=?", (tid,))
        c.commit()

    def tag_files(self, ids, tid, on):
        c = self.conn()
        if on:
            c.executemany("INSERT OR IGNORE INTO file_tags(file_id, tag_id) VALUES(?,?)",
                          [(i, tid) for i in ids])
        else:
            c.executemany("DELETE FROM file_tags WHERE file_id=? AND tag_id=?", [(i, tid) for i in ids])
        c.commit()

    # ---- 統計與目錄樹
    def stats(self):
        return self.cached("stats", self._stats)

    def _stats(self):
        c = self.conn()
        kinds = dict((r[0], r[1]) for r in c.execute("SELECT kind, COUNT(*) FROM files GROUP BY kind"))
        tot = c.execute("SELECT COUNT(*), SUM(status=1), SUM(status=2 AND kind='pdf'), SUM(starred), SUM(chars) FROM files"
                        ).fetchone()
        return {"kinds": kinds, "files": tot[0] or 0, "texts": tot[1] or 0, "notext": tot[2] or 0,
                "starred": tot[3] or 0, "chars": tot[4] or 0}

    def dirs(self, rid):
        """側欄文件夾樹：按路徑各段的自然序排好，前端按出現順序建樹即可。"""
        c = self.conn()
        rows = [[r[0], r[1]] for r in c.execute("SELECT dir, COUNT(*) FROM files WHERE root_id=? GROUP BY dir", (rid,))]
        cache = {}

        def k(seg):
            v = cache.get(seg)
            if v is None:
                v = cache[seg] = self.coll.key(seg)
            return v
        rows.sort(key=lambda r: [k(x) for x in r[0].split("/")])
        return rows


def _as_quote(s):
    return '"' + s.replace("\\", "\\\\").replace('"', '\\"') + '"'
