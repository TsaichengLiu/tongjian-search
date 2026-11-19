#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""通檢 —— 簡繁異體通用的文件檢索與管理工具（本地服務）。

用法：python3 server.py [--port 5917] [--no-browser]
"""
import argparse
import json
import mimetypes
import os
import re
import secrets
import subprocess
import sys
import threading
import traceback
import urllib.parse
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)

from tj_core import DEFAULT_SETTINGS, Library, UserError, TAG_COLORS, fuzzy_param  # noqa: E402

STATIC = os.path.join(HERE, "static")
VERSION = "1.0"
mimetypes.add_type("image/heic", ".heic")
mimetypes.add_type("image/webp", ".webp")
mimetypes.add_type("text/plain", ".md")


def default_db():
    return os.path.join(os.path.expanduser("~/Library/Application Support/TongJian"), "library.db")


class App(object):
    lib = None
    token = ""
    verbose = False
    native = False
    ql = None


def _int_list(v):
    if isinstance(v, list):
        return [int(x) for x in v]
    return [int(v)]


class Handler(BaseHTTPRequestHandler):
    server_version = "TongJian/" + VERSION
    protocol_version = "HTTP/1.1"
    timeout = 30          # 空閒 30 秒的長連接自動斷開，處理線程與其數據庫連接隨之釋放

    def log_message(self, fmt, *a):
        if App.verbose:
            sys.stderr.write("%s %s\n" % (self.address_string(), fmt % a))

    # ---------------------------------------------------------------- 基礎
    def _host_ok(self):
        host = (self.headers.get("Host") or "").rsplit(":", 1)[0].strip("[]")
        return host in ("127.0.0.1", "localhost", "::1")

    def _send(self, code, body, ctype, headers=None):
        self.send_response(code)
        self.send_header("Content-Type", ctype)
        self.send_header("Content-Length", str(len(body)))
        if "Cache-Control" not in (headers or {}):
            self.send_header("Cache-Control", "no-store")
        self.send_header("X-Content-Type-Options", "nosniff")
        for k, v in (headers or {}).items():
            self.send_header(k, v)
        self.end_headers()
        if self.command != "HEAD":
            self.wfile.write(body)

    def _json(self, obj, code=200):
        self._send(code, json.dumps(obj, ensure_ascii=False, separators=(",", ":")).encode("utf-8"),
                   "application/json; charset=utf-8")

    def _err(self, code, msg):
        self._json({"error": msg}, code)

    def _authed(self, qs):
        t = self.headers.get("X-TJ-Token") or (qs.get("t") or [""])[0]
        return secrets.compare_digest(t, App.token)

    def _body(self):
        n = int(self.headers.get("Content-Length") or 0)
        if n <= 0:
            return {}
        raw = self.rfile.read(n)
        return json.loads(raw.decode("utf-8")) if raw else {}

    # ---------------------------------------------------------------- 路由
    def do_HEAD(self):
        self.do_GET()

    def do_GET(self):
        self._dispatch("GET")

    def do_POST(self):
        self._dispatch("POST")

    def _dispatch(self, method):
        if not self._host_ok():
            return self._err(403, "forbidden host")
        u = urllib.parse.urlsplit(self.path)
        path = u.path
        qs = urllib.parse.parse_qs(u.query)
        try:
            if method == "GET" and path in ("/", "/index.html"):
                return self._index()
            if method == "GET" and path.startswith("/static/"):
                return self._static(path[len("/static/"):])
            if method == "GET" and path == "/favicon.ico":
                return self._send(204, b"", "image/x-icon")
            if not self._authed(qs):
                return self._err(401, "unauthorized")
            if method == "GET" and path.startswith("/raw/"):
                return self._raw(int(path[5:].split("/")[0]))
            if method == "GET" and path.startswith("/thumb/"):
                return self._thumb(int(path[7:].split("/")[0]))
            if path.startswith("/api/"):
                p = dict((k, v[-1]) for k, v in qs.items())
                body = self._body() if method == "POST" else {}
                fn = getattr(self, "api_" + path[5:].replace("/", "_").replace("-", "_"), None)
                if fn is None:
                    return self._err(404, "no such api")
                return self._json(fn(p, body))
            return self._err(404, "not found")
        except UserError as e:
            return self._err(400, str(e))
        except (BrokenPipeError, ConnectionResetError):
            return
        except Exception as e:  # noqa
            traceback.print_exc()
            try:
                return self._err(500, "%s: %s" % (type(e).__name__, e))
            except Exception:
                return

    # ---------------------------------------------------------------- 靜態
    def _index(self):
        with open(os.path.join(STATIC, "index.html"), "rb") as f:
            html = f.read().decode("utf-8")
        html = html.replace("__TJ_TOKEN__", App.token).replace("__TJ_NATIVE__", "1" if App.native else "0")
        self._send(200, html.encode("utf-8"), "text/html; charset=utf-8")

    def _static(self, rel):
        rel = urllib.parse.unquote(rel)
        full = os.path.realpath(os.path.join(STATIC, rel))
        if not full.startswith(os.path.realpath(STATIC) + os.sep) or not os.path.isfile(full):
            return self._err(404, "not found")
        ctype = mimetypes.guess_type(full)[0] or "application/octet-stream"
        if ctype.startswith("text/") or ctype in ("application/javascript",):
            ctype += "; charset=utf-8"
        with open(full, "rb") as f:
            self._send(200, f.read(), ctype)

    def _raw(self, fid):
        r = App.lib.conn().execute("SELECT path, name FROM files WHERE id=?", (fid,)).fetchone()
        if not r or not os.path.isfile(r["path"]):
            return self._err(404, "file missing")
        p = r["path"]
        size = os.path.getsize(p)
        ctype = mimetypes.guess_type(p)[0] or "application/octet-stream"
        if ctype.startswith("text/"):
            ctype += "; charset=utf-8"
        start, end, code = 0, size - 1, 200
        rng = self.headers.get("Range")
        m = re.match(r"bytes=(\d*)-(\d*)$", rng or "")
        if m and size > 0:
            if m.group(1):
                start = int(m.group(1))
                if m.group(2):
                    end = min(int(m.group(2)), size - 1)
            elif m.group(2):
                start = max(0, size - int(m.group(2)))
            if start > end:
                self.send_response(416)
                self.send_header("Content-Range", "bytes */%d" % size)
                self.send_header("Content-Length", "0")
                self.end_headers()
                return
            code = 206
        length = end - start + 1 if size else 0
        self.send_response(code)
        self.send_header("Content-Type", ctype)
        self.send_header("Content-Length", str(length))
        self.send_header("Accept-Ranges", "bytes")
        self.send_header("Cache-Control", "no-store")
        self.send_header("Content-Disposition",
                         "inline; filename*=UTF-8''" + urllib.parse.quote(r["name"]))
        if code == 206:
            self.send_header("Content-Range", "bytes %d-%d/%d" % (start, end, size))
        self.end_headers()
        if self.command == "HEAD":
            return
        with open(p, "rb") as f:
            f.seek(start)
            left = length
            while left > 0:
                chunk = f.read(min(1 << 20, left))
                if not chunk:
                    break
                self.wfile.write(chunk)
                left -= len(chunk)

    def _thumb(self, fid):
        out = App.lib.thumbnail(fid)
        if not out:
            return self._err(404, "no thumbnail")
        with open(out, "rb") as f:
            data = f.read()
        self._send(200, data, "image/jpeg", {"Cache-Control": "private, max-age=86400"})

    # ---------------------------------------------------------------- API
    def api_state(self, p, b):
        lib = App.lib
        return {"roots": lib.roots(), "tags": lib.tags(), "stats": lib.stats(),
                "status": lib.get_status(), "native": App.native, "version": VERSION,
                "tag_colors": TAG_COLORS,
                "settings": {k: lib.setting(k) for k in SETTING_KEYS},
                "projects": lib.projects_list(),
                "defaults": DEFAULT_SETTINGS,
                "variant_meta": lib.norm.meta,
                "custom_groups": len(lib.norm.custom_groups),
                "tools": {"helper": bool(lib.helper), "pdftotext": bool(lib.extractor.pdftotext)},
                "db": lib.db_path}

    def api_status(self, p, b):
        return {"status": App.lib.get_status(), "stats": App.lib.stats(), "roots": App.lib.roots()}

    def api_search(self, p, b):
        return App.lib.search(p)

    def api_preview(self, p, b):
        return App.lib.preview(int(p["id"]), p.get("q", ""), p.get("mode", "full"), fz=fuzzy_param(p))

    def api_find(self, p, b):
        return App.lib.find_in(int(p["id"]), p.get("q", ""), p.get("mode", "full"), fuzzy_param(p))

    def api_variants(self, p, b):
        return {"chars": App.lib.variants(p.get("q", ""))}

    def api_dirs(self, p, b):
        return {"dirs": App.lib.dirs(int(p["root"]))}

    def api_roots_add(self, p, b):
        rid = App.lib.add_root(b.get("path", ""))
        return {"id": rid, "roots": App.lib.roots()}

    def api_roots_remove(self, p, b):
        App.lib.remove_root(int(b["id"]))
        return {"roots": App.lib.roots()}

    def api_rescan(self, p, b):
        App.lib.enqueue(("scan", int(b["root"]) if b.get("root") else None))
        return {"ok": True}

    def api_reindex(self, p, b):
        c = App.lib.conn()
        c.execute("UPDATE files SET xver=0, status=CASE WHEN status=1 THEN 0 ELSE status END")
        c.execute("UPDATE files SET mtime=-1")
        c.commit()
        App.lib.enqueue(("scan", None))
        return {"ok": True}

    def api_pick_folder(self, p, b):
        prompt = (b.get("prompt") or "選擇文件夾").replace('"', "'")
        script = ['tell me to activate', 'POSIX path of (choose folder with prompt "%s")' % prompt]
        args = ["/usr/bin/osascript"]
        for s in script:
            args += ["-e", s]
        pr = subprocess.run(args, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        if pr.returncode != 0:
            return {"path": None}
        return {"path": pr.stdout.decode("utf-8").strip().rstrip("/") or "/"}

    def api_open(self, p, b):
        App.lib.open_file(int(b["id"]), bool(b.get("reveal")))
        return {"ok": True}

    def api_quicklook(self, p, b):
        r = App.lib._row(int(b["id"]))
        if not os.path.exists(r["path"]):
            raise UserError("文件已不在原處")
        if App.ql and App.ql.poll() is None:
            App.ql.terminate()
        App.ql = subprocess.Popen(["/usr/bin/qlmanage", "-p", r["path"]],
                                  stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        return {"ok": True}

    def api_folder(self, p, b):
        return App.lib.folder(p.get("path", ""), p.get("q", ""), p.get("mode", "full"), fuzzy_param(p))

    def api_folder_files(self, p, b):
        return App.lib.folder_files(p.get("path", ""), p.get("q", ""), p.get("mode", "full"), fuzzy_param(p))

    def api_open_path(self, p, b):
        path = os.path.realpath(b.get("path", ""))
        roots = App.lib.conn().execute("SELECT id, path FROM roots").fetchall()
        if App.lib.root_for(path, roots) is None or not os.path.exists(path):
            raise UserError("路徑不在資料庫中")
        subprocess.Popen(["/usr/bin/open"] + (["-R"] if b.get("reveal") else []) + [path])
        return {"ok": True}

    def api_reveal_path(self, p, b):
        path = os.path.realpath(b.get("path", ""))
        roots = App.lib.conn().execute("SELECT id, path FROM roots").fetchall()
        if App.lib.root_for(path, roots) is None or not os.path.exists(path):
            raise UserError("路徑不在資料庫中")
        subprocess.Popen(["/usr/bin/open", "-R", path])
        return {"ok": True}

    def api_rename(self, p, b):
        return {"item": App.lib.rename(int(b["id"]), b.get("name", ""))}

    def api_move(self, p, b):
        return App.lib.move(_int_list(b["ids"]), b.get("dest", ""))

    def api_trash(self, p, b):
        return App.lib.trash(_int_list(b["ids"]))

    def api_star(self, p, b):
        App.lib.set_star(_int_list(b["ids"]), bool(b.get("value")))
        return {"ok": True}

    def api_note(self, p, b):
        App.lib.set_note(int(b["id"]), b.get("note", ""))
        return {"ok": True}

    def api_tags_create(self, p, b):
        tid = App.lib.create_tag(b.get("name"), b.get("color"))
        if b.get("ids"):
            App.lib.tag_files(_int_list(b["ids"]), tid, True)
        return {"id": tid, "tags": App.lib.tags()}

    def api_tags_update(self, p, b):
        App.lib.update_tag(int(b["id"]), b.get("name"), b.get("color"))
        return {"tags": App.lib.tags()}

    def api_tags_delete(self, p, b):
        App.lib.delete_tag(int(b["id"]))
        return {"tags": App.lib.tags()}

    def api_tags_assign(self, p, b):
        App.lib.tag_files(_int_list(b["ids"]), int(b["tag"]), bool(b.get("on", True)))
        return {"tags": App.lib.tags()}

    def api_settings(self, p, b):
        lib = App.lib
        changed = set()
        for k, v in b.items():
            if k in SETTING_KEYS and str(v) != lib.setting(k):
                lib.set_setting(k, v)
                changed.add(k)
        if "custom_variants" in changed:
            lib.reload_normalizer()
        if "watch" in changed:
            lib.update_watcher()
        if "collation" in changed:
            lib.set_collation(lib.setting("collation"))
        if changed & {"excludes", "skip_projects", "code_fulltext"}:
            lib.enqueue(("scan", None))
        return {"ok": True, "custom_groups": len(lib.norm.custom_groups), "projects": lib.projects_list()}

    def api_settings_reset(self, p, b):
        return {"changed": App.lib.reset_settings(bool(b.get("variants")), bool(b.get("excludes")))}

    def api_exclude(self, p, b):
        n = App.lib.exclude_path(b.get("path", ""))
        return {"removed": n, "excludes": App.lib.setting("excludes")}


SETTING_KEYS = ("custom_variants", "excludes", "cross_punct", "rescan_minutes", "watch", "skip_projects",
                "code_fulltext", "mode", "scope", "sidebar_w", "list_w", "sort", "collation", "folder_view",
                "fuzzy", "fuzzy_sim", "reader_size")


class Server(ThreadingHTTPServer):
    daemon_threads = True
    allow_reuse_address = False


def main():
    # macOS 默認分配器會把釋放的大塊內存留作緩存（預覽長文本後可達數百 MB）；
    # 以省空間模式重新啟動自己，常駐內存可降到 30–50 MB，速度不變
    if sys.platform == "darwin" and os.environ.get("MallocSpaceEfficient") != "1":
        env = dict(os.environ, MallocSpaceEfficient="1")
        flags = ["-B"] if sys.dont_write_bytecode else []
        os.execve(sys.executable, [sys.executable] + flags + [os.path.abspath(__file__)] + sys.argv[1:], env)
    ap = argparse.ArgumentParser()
    ap.add_argument("--port", type=int, default=5917)
    ap.add_argument("--db", default=default_db())
    ap.add_argument("--helper", default=os.path.join(os.path.dirname(HERE), "bin", "tjhelper"))
    ap.add_argument("--no-browser", action="store_true")
    ap.add_argument("--native", action="store_true", help="由 macOS 外殼啟動")
    ap.add_argument("--token", default="")
    ap.add_argument("--verbose", action="store_true")
    a = ap.parse_args()
    App.verbose = a.verbose
    App.native = a.native
    App.token = a.token or secrets.token_urlsafe(18)
    App.lib = Library(a.db, os.path.join(HERE, "data", "variants.json"), a.helper,
                      log=lambda s: sys.stderr.write(s + "\n"))
    try:
        httpd = Server(("127.0.0.1", a.port), Handler)
    except OSError:
        httpd = Server(("127.0.0.1", 0), Handler)
    port = httpd.server_address[1]
    url = "http://127.0.0.1:%d/" % port
    print("TONGJIAN_READY %s" % url, flush=True)
    if a.native:
        # 父進程（App 外殼）退出時 stdin 關閉，隨之退出
        def watch():
            try:
                while sys.stdin.read(1):
                    pass
            finally:
                os._exit(0)
        threading.Thread(target=watch, daemon=True).start()
    elif not a.no_browser:
        import webbrowser
        threading.Timer(0.4, lambda: webbrowser.open(url)).start()
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        pass


if __name__ == "__main__":
    main()
