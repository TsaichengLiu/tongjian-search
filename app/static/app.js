/* 通檢 —— 前端 */
'use strict';

// ===================================================================== 基礎
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => Array.from(el.querySelectorAll(s));
const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c =>
  ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

const I = {
  folder: '<svg viewBox="0 0 24 24"><path d="M3.5 7.5a2 2 0 0 1 2-2h4l2 2h7a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-13a2 2 0 0 1-2-2z"/></svg>',
  plus: '<svg viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg>',
  star: '<svg viewBox="0 0 24 24"><path d="m12 3.8 2.5 5.1 5.6.8-4.05 3.95.96 5.6L12 16.6l-5.01 2.65.96-5.6L3.9 9.7l5.6-.8z"/></svg>',
  starFill: '<svg viewBox="0 0 24 24"><path style="fill:currentColor" d="m12 3.8 2.5 5.1 5.6.8-4.05 3.95.96 5.6L12 16.6l-5.01 2.65.96-5.6L3.9 9.7l5.6-.8z"/></svg>',
  tag: '<svg viewBox="0 0 24 24"><path d="M3.5 12.2V5A1.5 1.5 0 0 1 5 3.5h7.2l8.3 8.3a1.5 1.5 0 0 1 0 2.1l-7.1 7.1a1.5 1.5 0 0 1-2.1 0z"/><circle cx="8" cy="8" r="1.4"/></svg>',
  trash: '<svg viewBox="0 0 24 24"><path d="M4.5 6.5h15M9.5 6.5V4.8c0-.7.6-1.3 1.3-1.3h2.4c.7 0 1.3.6 1.3 1.3v1.7M6.5 6.5l.9 12.2c.1 1 .9 1.8 1.9 1.8h5.4c1 0 1.8-.8 1.9-1.8l.9-12.2"/></svg>',
  open: '<svg viewBox="0 0 24 24"><path d="M14 4.5h5.5V10M19.5 4.5 11 13M18 14v4a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4"/></svg>',
  reveal: '<svg viewBox="0 0 24 24"><path d="M3.5 7.5a2 2 0 0 1 2-2h4l2 2h7a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-13a2 2 0 0 1-2-2z"/><circle cx="11.5" cy="13" r="2.6"/><path d="m13.4 14.9 2.1 2.1"/></svg>',
  move: '<svg viewBox="0 0 24 24"><path d="M3.5 7.5a2 2 0 0 1 2-2h4l2 2h7a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-13a2 2 0 0 1-2-2z"/><path d="M8.5 13.5h7m-2.4-2.4 2.4 2.4-2.4 2.4"/></svg>',
  pencil: '<svg viewBox="0 0 24 24"><path d="m15.2 5.2 3.6 3.6M4.5 19.5l1-4.4L16.3 4.3a1.6 1.6 0 0 1 2.3 0l1.1 1.1a1.6 1.6 0 0 1 0 2.3L8.9 18.5z"/></svg>',
  gear: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="2.8"/><path d="M12 3.5v2.2M12 18.3v2.2M20.5 12h-2.2M5.7 12H3.5M18 6l-1.6 1.6M7.6 16.4 6 18M18 18l-1.6-1.6M7.6 7.6 6 6"/><circle cx="12" cy="12" r="6.3"/></svg>',
  refresh: '<svg viewBox="0 0 24 24"><path d="M19.5 12a7.5 7.5 0 1 1-2.2-5.3M19.5 4.5v4h-4"/></svg>',
  chev: '<svg viewBox="0 0 24 24"><path d="m9 6 6 6-6 6"/></svg>',
  up: '<svg viewBox="0 0 24 24"><path d="m6 15 6-6 6 6"/></svg>',
  down: '<svg viewBox="0 0 24 24"><path d="m6 9 6 6 6-6"/></svg>',
  x: '<svg viewBox="0 0 24 24"><path d="M7 7l10 10M17 7 7 17"/></svg>',
  tray: '<svg viewBox="0 0 24 24"><path d="M4 13.5 6.3 6a2 2 0 0 1 1.9-1.5h7.6A2 2 0 0 1 17.7 6l2.3 7.5V18a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2z"/><path d="M4 13.5h4.5l1 2h5l1-2H20"/></svg>',
  scan: '<svg viewBox="0 0 24 24"><path d="M4 8V5.5A1.5 1.5 0 0 1 5.5 4H8M16 4h2.5A1.5 1.5 0 0 1 20 5.5V8M20 16v2.5a1.5 1.5 0 0 1-1.5 1.5H16M8 20H5.5A1.5 1.5 0 0 1 4 18.5V16M8 9.5h8M8 12h8M8 14.5h5"/></svg>',
  file: '<svg viewBox="0 0 24 24"><path d="M6.5 3.5h7l4 4v11.5a1.5 1.5 0 0 1-1.5 1.5h-9.5a1.5 1.5 0 0 1-1.5-1.5v-14a1.5 1.5 0 0 1 1.5-1.5z"/><path d="M13.5 3.5v4h4"/></svg>',
  copy: '<svg viewBox="0 0 24 24"><rect x="8.5" y="8.5" width="11" height="11" rx="2"/><path d="M15.5 8.5V6A1.5 1.5 0 0 0 14 4.5H6A1.5 1.5 0 0 0 4.5 6v8A1.5 1.5 0 0 0 6 15.5h2.5"/></svg>',
  eye: '<svg viewBox="0 0 24 24"><path d="M2.8 12S6.2 5.5 12 5.5 21.2 12 21.2 12 17.8 18.5 12 18.5 2.8 12 2.8 12z"/><circle cx="12" cy="12" r="2.8"/></svg>',
  search: '<svg viewBox="0 0 24 24"><circle cx="10.5" cy="10.5" r="6.5"/><path d="M15.5 15.5 20 20"/></svg>',
  page: '<svg viewBox="0 0 24 24"><path d="M6.5 3.5h11a1.5 1.5 0 0 1 1.5 1.5v14a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 5 19V5a1.5 1.5 0 0 1 1.5-1.5z"/><path d="M8.5 8h7M8.5 11.5h7M8.5 15h4"/></svg>',
  ban: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="8"/><path d="m6.5 6.5 11 11"/></svg>',
  dots: '<svg viewBox="0 0 24 24"><circle class="fill" cx="6" cy="12" r="1.5"/><circle class="fill" cx="12" cy="12" r="1.5"/><circle class="fill" cx="18" cy="12" r="1.5"/></svg>',
};

const KIND_LABEL = { pdf: 'PDF', doc: '文檔', text: '文本', ebook: '電子書', sheet: '表格', slide: '演示',
  image: '圖片', audio: '音頻', video: '視頻', archive: '壓縮包', other: '其他' };
const KIND_ORDER = ['pdf', 'doc', 'text', 'ebook', 'sheet', 'slide', 'image', 'audio', 'video', 'archive', 'other'];
const KIND_COLOR = { pdf: '#cf4a3c', doc: '#2f6fcf', text: '#6f7c88', ebook: '#24917f', sheet: '#2f8a4f',
  slide: '#d4812a', image: '#8a5bc4', audio: '#c45b97', video: '#4b5fc4', archive: '#8a7a5e', other: '#9a958d' };
const MODE_LABEL = { exact: '精確', st: '簡繁', full: '異體' };
const TEXT_EXTS = new Set(['txt', 'text', 'md', 'markdown', 'csv', 'tsv', 'json', 'xml', 'srt', 'ass', 'tex', 'bib',
  'ris', 'enw', 'log', 'ini', 'yaml', 'yml', 'rst', 'org', 'adoc', 'py', 'js', 'css', 'sql', 'r', 'do']);

const S = {
  token: window.TJ.token, native: window.TJ.native,
  roots: [], tags: [], stats: {}, status: {}, settings: {}, meta: {}, tools: {},
  q: '', mode: 'full', scope: 'name', sort: 'relevance', limit: 200, projects: [],
  fuzzy: false, fzSim: '0.7', find: { open: false, q: '', res: null, busy: false },
  filter: { root: null, dir: null, kind: null, tag: null, starred: false, only: null },
  res: null, items: [], cur: null, sel: new Set(), anchor: null,
  pv: null, pvTab: 'text', pvTabPref: 'text', hit: 0, hitEls: [], pendingPos: null,
  dirs: {}, openRoots: new Set(), openDirs: new Set(),
  readerSize: 16, lastRescan: 0, fullPdf: new Set(), pg: null, pgLast: {},
};

async function api(path, body) {
  const opt = { headers: { 'X-TJ-Token': S.token } };
  if (body !== undefined) {
    opt.method = 'POST';
    opt.headers['Content-Type'] = 'application/json';
    opt.body = JSON.stringify(body);
  }
  const r = await fetch('/api/' + path, opt);
  let j;
  try { j = await r.json(); } catch (e) { j = { error: r.statusText || '服務無響應' }; }
  if (!r.ok || j.error) throw new Error(j.error || r.statusText);
  return j;
}
const rawUrl = (id, hash = '') => `/raw/${id}?t=${encodeURIComponent(S.token)}${hash}`;
const thumbUrl = id => `/thumb/${id}?t=${encodeURIComponent(S.token)}`;
const fzQS = () => (S.fuzzy ? `&fuzzy=1&sim=${S.fzSim}` : '');
// 很大的 PDF：WebKit 整本載入要好幾秒、佔幾百 MB 內存，改為逐頁渲染成圖片顯示
const isBigPdf = pv => pv.kind === 'pdf' && ((pv.size || 0) >= 60e6 || (pv.pages || 0) >= 2000);
// 幾乎沒有文字層（多為掃描件）：至少 20 頁、平均每頁不到 20 個字符。與後台的 NEAR_EMPTY_SQL 一致
const nearEmpty = it => it.kind === 'pdf' && (it.status === 2 ||
  (it.status === 1 && (it.pages || 0) >= 20 && (it.chars || 0) < it.pages * 20));
const topPv = pv => { while (pv && pv.back) pv = pv.back; return pv; };
async function openPath(path, reveal) { try { await api('open-path', { path, reveal: !!reveal }); } catch (e) { fail(e); } }

// ===================================================================== 格式化
function fmtSize(n) {
  if (n == null) return '';
  if (n < 1024) return n + ' B';
  const u = ['KB', 'MB', 'GB', 'TB'];
  let i = -1;
  do { n /= 1024; i++; } while (n >= 1024 && i < u.length - 1);
  return (n >= 100 ? n.toFixed(0) : n >= 10 ? n.toFixed(1) : n.toFixed(2)).replace(/\.?0+$/, '') + ' ' + u[i];
}
const pad = n => String(n).padStart(2, '0');
function fmtDate(ts, full) {
  if (!ts || ts < 0) return '';
  const d = new Date(ts * 1000), now = new Date();
  const hm = `${pad(d.getHours())}:${pad(d.getMinutes())}`;
  const ymd = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  if (full) return `${ymd} ${hm}`;
  const day = 86400000, t0 = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  if (d.getTime() >= t0) return '今天 ' + hm;
  if (d.getTime() >= t0 - day) return '昨天 ' + hm;
  return ymd;
}
const fmtNum = n => (n || 0).toLocaleString('en-US');
function fmtChars(n) {
  if (!n) return '0 字';
  if (n >= 1e8) return (n / 1e8).toFixed(1).replace(/\.0$/, '') + ' 億字';
  if (n >= 1e4) return (n / 1e4).toFixed(n >= 1e6 ? 0 : 1).replace(/\.0$/, '') + ' 萬字';
  return n + ' 字';
}
const segsHtml = segs => (segs || []).map(([t, k]) => k ? `<span class="h${k}">${esc(t)}</span>` : esc(t)).join('');
const badgeText = it => (it.ext && it.ext.length <= 4 ? it.ext : (KIND_LABEL[it.kind] || '')).toUpperCase();
const rootOf = id => S.roots.find(r => r.id === id);
function relDir(it) {
  const r = rootOf(it.root);
  if (!r) return it.dir;
  const rel = it.dir.slice(r.path.length).replace(/^\//, '');
  return [r.name].concat(rel ? rel.split('/') : []).join(' › ');
}
function exNorm(ch) {
  const c = ch.codePointAt(0);
  if (c >= 0x41 && c <= 0x5a) return String.fromCharCode(c + 32);
  if (c >= 0xff01 && c <= 0xff5e) return String.fromCharCode(c - 0xfee0).toLowerCase();
  if (c === 0x3000) return ' ';
  const l = ch.toLowerCase();
  return l.length === ch.length ? l : ch;
}
const isWordChar = ch => /[\p{L}\p{N}]/u.test(ch);
// 兼容區漢字、康熙部首只用於歸一，不在異體提示中顯示
const isCompatForm = ch => { const c = ch.codePointAt(0); return (c >= 0x2e80 && c <= 0x2fdf) || (c >= 0xf900 && c <= 0xfaff) || (c >= 0x2f800 && c <= 0x2fa1f); };

// ===================================================================== 浮層：提示、菜單、對話框
function toast(msg, opt = {}) {
  const el = document.createElement('div');
  el.className = 'toast' + (opt.err ? ' err' : '');
  el.innerHTML = `<span>${esc(msg)}</span>`;
  if (opt.action) {
    const b = document.createElement('button');
    b.textContent = opt.action.label;
    b.onclick = () => { opt.action.fn(); el.remove(); };
    el.appendChild(b);
  }
  $('#toasts').appendChild(el);
  setTimeout(() => el.remove(), opt.ms || (opt.err ? 5000 : 2600));
}
const fail = e => toast(e.message || String(e), { err: true });

let menuEl = null;
function closeMenu() { if (menuEl) { menuEl.remove(); menuEl = null; } }
function showMenu(x, y, items) {
  closeMenu();
  const m = document.createElement('div');
  m.className = 'menu';
  for (const it of items) {
    if (!it) continue;
    if (it.sep) { m.insertAdjacentHTML('beforeend', '<div class="msep"></div>'); continue; }
    if (it.header) { m.insertAdjacentHTML('beforeend', `<div class="mh">${esc(it.header)}</div>`); continue; }
    const d = document.createElement('div');
    d.className = 'mi' + (it.danger ? ' danger' : '') + (it.disabled ? ' dis' : '');
    d.innerHTML = (it.check !== undefined ? `<span class="check">${it.check ? '✓' : ''}</span>` : '') +
      (it.dot ? `<span class="tag-dot" style="background:${esc(it.dot)}"></span>` : '') +
      (it.icon ? I[it.icon] : '') + `<span>${esc(it.label)}</span>` + (it.key ? `<span class="k">${esc(it.key)}</span>` : '');
    d.onclick = e => { e.stopPropagation(); closeMenu(); it.act && it.act(); };
    m.appendChild(d);
  }
  $('#layer').appendChild(m);
  const r = m.getBoundingClientRect();
  m.style.left = Math.max(6, Math.min(x, innerWidth - r.width - 6)) + 'px';
  m.style.top = Math.max(6, Math.min(y, innerHeight - r.height - 6)) + 'px';
  menuEl = m;
}
document.addEventListener('mousedown', e => { if (menuEl && !menuEl.contains(e.target)) closeMenu(); }, true);
window.addEventListener('blur', closeMenu);

let dialogOpen = 0;
const dialogStack = [];
function dialog({ title, desc, body = '', buttons, wide, onOpen, enterValue }) {
  return new Promise(resolve => {
    const bd = document.createElement('div');
    bd.className = 'backdrop';
    bd.innerHTML = `<div class="dialog${wide ? ' wide' : ''}" role="dialog">
      ${title ? `<h3>${esc(title)}</h3>` : ''}${desc ? `<p class="desc">${desc}</p>` : ''}
      <div class="dbody">${body}</div>
      <div class="row">${buttons.map((b, i) => `<button class="btn ${b.primary ? 'primary' : ''} ${b.danger ? 'danger' : ''}"
        data-i="${i}" style="${b.left ? 'margin-right:auto' : ''}">${esc(b.label)}</button>`).join('')}</div></div>`;
    const dl = $('.dialog', bd);
    let done = false;
    const finish = async v => {
      if (done) return;
      if (v && v.validate) { const ok = await v.validate(dl); if (!ok) return; }
      done = true;
      bd.remove();
      dialogOpen--;
      dialogStack.splice(dialogStack.indexOf(bd), 1);
      document.removeEventListener('keydown', onKey, true);
      resolve({ value: v ? v.value : null, el: dl });
    };
    const onKey = e => {
      if (dialogStack[dialogStack.length - 1] !== bd) return;      // 疊放時只由最上層處理
      if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); finish(null); }
      else if (e.key === 'Enter' && !e.isComposing && e.target.tagName !== 'TEXTAREA') {
        const b = buttons.find(b => b.primary);
        if (b) { e.preventDefault(); e.stopPropagation(); finish(b); }
      }
    };
    $$('.row .btn', dl).forEach(btn => btn.onclick = () => {
      const b = buttons[+btn.dataset.i];
      if (b.onClick) return b.onClick(dl, finish);
      finish(b.value === undefined && !b.primary && !b.danger ? null : b);
    });
    bd.addEventListener('mousedown', e => { if (e.target === bd) finish(null); });
    document.addEventListener('keydown', onKey, true);
    $('#layer').appendChild(bd);
    dialogOpen++;
    dialogStack.push(bd);
    onOpen && onOpen(dl, finish);
    const f = $('input[type=text], textarea', dl);
    if (f) setTimeout(() => { f.focus(); f.select && f.select(); }, 30);
  });
}
async function confirmDialog(title, desc, okLabel, danger) {
  const r = await dialog({ title, desc, buttons: [{ label: '取消' }, { label: okLabel, primary: !danger, danger: !!danger, value: true }] });
  return !!r.value;
}
async function promptDialog(title, desc, value, okLabel = '確定') {
  const r = await dialog({
    title, desc, body: `<input type="text" value="${esc(value || '')}">`,
    buttons: [{ label: '取消' }, { label: okLabel, primary: true, value: 'ok' }],
  });
  return r.value ? $('input', r.el).value : null;
}

// ===================================================================== 原生外殼橋接
const nativeCbs = {};
let nativeSeq = 0;
window.TJNative = {
  resolve(id, v) { const f = nativeCbs[id]; delete nativeCbs[id]; f && f(v); },
  focus() { maybeRescan(); },
};
async function pickFolder(prompt) {
  if (S.native && window.webkit && window.webkit.messageHandlers && window.webkit.messageHandlers.tj) {
    return new Promise(res => {
      const id = ++nativeSeq;
      nativeCbs[id] = res;
      window.webkit.messageHandlers.tj.postMessage({ cmd: 'pickFolder', prompt, id });
    });
  }
  // 瀏覽器模式：可手動輸入路徑，或調用系統選擇框
  const r = await dialog({
    title: prompt, desc: '輸入文件夾的完整路徑，或點「瀏覽…」用系統對話框選擇。',
    body: '<input type="text" placeholder="/Users/…/文件夾">',
    buttons: [
      { label: '瀏覽…', left: true, onClick: async (dl) => {
        try { const p = await api('pick-folder', { prompt }); if (p.path) $('input', dl).value = p.path; } catch (e) { fail(e); }
      } },
      { label: '取消' }, { label: '確定', primary: true, value: 'ok' }],
  });
  const v = r.value ? $('input', r.el).value.trim() : '';
  return v || null;
}
function maybeRescan() {
  if (S.status && S.status.watching) return;      // 實時監聽中，無需重掃
  if (Date.now() - S.lastRescan > 60000 && S.roots.length) {
    S.lastRescan = Date.now();
    api('rescan', {}).then(() => setTimeout(poll, 300)).catch(() => {});
  }
}

// ===================================================================== 側欄
function buildTree(root, dirs) {
  const top = { path: root.path, name: root.name, kids: new Map(), count: 0 };
  for (const [d, c] of dirs) {
    top.count += c;
    if (d === root.path) continue;
    let node = top, p = root.path;
    for (const seg of d.slice(root.path.length + 1).split('/')) {
      p += '/' + seg;
      if (!node.kids.has(seg)) node.kids.set(seg, { path: p, name: seg, kids: new Map(), count: 0 });
      node = node.kids.get(seg);
      node.count += c;
    }
  }
  return top;
}
function treeHtml(node, depth, rootId) {
  let h = '';
  const kids = Array.from(node.kids.values());          // 服務端已按自然序（拼音／數字／中文編號）排好
  for (const k of kids) {
    const open = S.openDirs.has(k.path);
    const active = S.filter.dir === k.path;
    const inScope = S.filter.only && S.filter.only.dirs.includes(k.path);
    h += `<div class="side-item${active ? ' active' : ''}${inScope ? ' inscope' : ''}" data-act="dir" data-root="${rootId}" data-path="${esc(k.path)}"
      style="padding-left:${8 + depth * 14}px" title="${esc(k.path)}">
      <span class="caret${k.kids.size ? (open ? ' open' : '') : ' none'}" data-act="toggle-dir">${I.chev}</span>
      <span class="side-ic">${I.folder}</span><span class="label">${esc(k.name)}</span><span class="count">${fmtNum(k.count)}</span></div>`;
    if (open && k.kids.size) h += treeHtml(k, depth + 1, rootId);
  }
  return h;
}
function renderSidebar() {
  const f = S.filter, st = S.stats || {};
  const noFilter = !f.root && !f.dir && !f.kind && !f.tag && !f.starred && !f.only;
  let h = `<div class="brand"><div class="seal">檢</div><div><div class="brand-name">通檢</div>
    <div class="brand-sub">簡繁異體 · 文件檢索</div></div></div><div class="side-scroll">`;
  h += `<div class="side-sec"><div class="side-h"><span>資料庫</span>
    <button class="icon-btn" data-act="add-root" title="添加文件夾">${I.plus}</button></div>`;
  for (const r of S.roots) {
    const open = S.openRoots.has(r.id);
    h += `<div class="side-item${f.root === r.id && !f.dir ? ' active' : ''}${f.only && f.only.dirs.includes(r.path) ? ' inscope' : ''}${r.missing ? ' missing' : ''}" data-act="root" data-id="${r.id}" title="${esc(r.path)}${r.missing ? '（未找到，可能是外接磁盤未連接）' : ''}">
      <span class="caret${open ? ' open' : ''}" data-act="toggle-root">${I.chev}</span>
      <span class="side-ic">${I.folder}</span><span class="label">${esc(r.name)}</span><span class="count">${fmtNum(r.files)}</span></div>`;
    if (open && S.dirs[r.id]) h += treeHtml(buildTree(r, S.dirs[r.id]), 1, r.id);
  }
  if (!S.roots.length) h += `<div class="side-item" data-act="add-root"><span class="side-ic">${I.plus}</span><span class="label" style="color:var(--text-3)">添加文件夾…</span></div>`;
  h += `</div><div class="side-sec"><div class="side-h"><span>瀏覽</span></div>
    <div class="side-item${noFilter ? ' active' : ''}" data-act="all"><span class="side-ic">${I.tray}</span><span class="label">全部文件</span><span class="count">${fmtNum(st.files)}</span></div>
    <div class="side-item${f.starred ? ' active' : ''}" data-act="starred"><span class="side-ic">${I.star}</span><span class="label">已收藏</span><span class="count">${fmtNum(st.starred)}</span></div>
    <div class="side-item${f.kind === 'notext' ? ' active' : ''}" data-act="kind" data-kind="notext" title="沒有文字層的 PDF（多為掃描件），只能檢索文件名"><span class="side-ic">${I.scan}</span><span class="label">無文字層</span><span class="count">${fmtNum(st.notext)}</span></div></div>`;
  const kinds = st.kinds || {};
  const ks = KIND_ORDER.filter(k => kinds[k]);
  if (ks.length) {
    h += `<div class="side-sec"><div class="side-h"><span>類型</span></div>`;
    for (const k of ks) {
      h += `<div class="side-item${f.kind === k ? ' active' : ''}" data-act="kind" data-kind="${k}">
        <span class="side-ic"><span class="tag-dot" style="background:${KIND_COLOR[k]};border-radius:3px"></span></span>
        <span class="label">${KIND_LABEL[k]}</span><span class="count">${fmtNum(kinds[k])}</span></div>`;
    }
    h += '</div>';
  }
  h += `<div class="side-sec"><div class="side-h"><span>標籤</span>
    <button class="icon-btn" data-act="new-tag" title="新建標籤">${I.plus}</button></div>`;
  for (const t of S.tags) {
    h += `<div class="side-item${f.tag === t.id ? ' active' : ''}" data-act="tag" data-id="${t.id}">
      <span class="side-ic"><span class="tag-dot" style="background:${esc(t.color)}"></span></span>
      <span class="label">${esc(t.name)}</span><span class="count">${fmtNum(t.count)}</span></div>`;
  }
  if (!S.tags.length) h += `<div class="side-item" data-act="new-tag"><span class="side-ic">${I.tag}</span><span class="label" style="color:var(--text-3)">新建標籤…</span></div>`;
  h += `</div></div><div class="side-foot" id="side-foot"></div>`;
  $('#sidebar').innerHTML = h;
  renderFoot();
}
function renderFoot() {
  const el = $('#side-foot');
  if (!el) return;
  const s = S.status || {}, st = S.stats || {};
  let h;
  if (s.busy) {
    const pct = s.todo ? Math.round(100 * s.done / s.todo) : 0;
    const what = s.phase === '掃描' ? `已掃描 ${fmtNum(s.scanned)} 個文件` :
      s.todo ? `${fmtNum(s.done)} / ${fmtNum(s.todo)}` : '';
    h = `<div class="idx-row"><span class="spin"></span><span class="grow">${esc(s.phase || '索引中')} ${what}</span>
      <button class="icon-btn" data-act="settings" title="設置">${I.gear}</button></div>
      <div class="idx-bar"><i style="width:${s.phase === '掃描' ? 8 : pct}%"></i></div>
      <div class="idx-sub" title="${esc(s.detail)}">${esc(s.detail || '')}</div>`;
  } else {
    h = `<div class="idx-row"><span class="grow">${fmtNum(st.files)} 個文件 · 全文 ${fmtChars(st.chars)}</span>
      <button class="icon-btn" data-act="rescan" title="重新掃描全部">${I.refresh}</button>
      <button class="icon-btn" data-act="settings" title="設置">${I.gear}</button></div>
      <div class="idx-sub">${s.watching ? '<span class="live-dot" title="文件有變化時幾秒內自動更新索引"></span>實時監聽 · ' : ''}${s.last ? '更新於 ' + fmtDate(s.last) : '　'}${s.message ? ' · ' + esc(s.message) : ''}</div>`;
  }
  el.innerHTML = h;
}
async function loadDirs(rid) {
  try { S.dirs[rid] = (await api('dirs?root=' + rid)).dirs; } catch (e) { fail(e); }
}
function setFilter(patch, toggle) {
  const f = S.filter;
  if (('root' in patch || 'dir' in patch) && !('only' in patch)) f.only = null;   // 點選單個文件夾 = 換掉自選範圍
  if (toggle) {
    for (const k in patch) f[k] = f[k] === patch[k] ? (k === 'starred' ? false : null) : patch[k];
  } else Object.assign(f, patch);
  S.limit = 200;
  renderSidebar();
  runSearch();
}
$('#sidebar').addEventListener('click', async e => {
  const el = e.target.closest('[data-act]');
  if (!el) return;
  const act = el.dataset.act;
  const item = el.closest('.side-item');
  if (act === 'toggle-root') {
    e.stopPropagation();
    const rid = +item.dataset.id;
    if (S.openRoots.has(rid)) S.openRoots.delete(rid);
    else { S.openRoots.add(rid); if (!S.dirs[rid]) await loadDirs(rid); }
    return renderSidebar();
  }
  if (act === 'toggle-dir') {
    e.stopPropagation();
    const p = item.dataset.path;
    S.openDirs.has(p) ? S.openDirs.delete(p) : S.openDirs.add(p);
    return renderSidebar();
  }
  if (act === 'add-root') return addRoot();
  if (act === 'new-tag') return newTag();
  if (act === 'settings') return openSettings();
  if (act === 'rescan') { S.lastRescan = Date.now(); await api('rescan', {}); toast('正在重新掃描…'); return setTimeout(poll, 300); }
  if (act === 'all') return setFilter({ root: null, dir: null, kind: null, tag: null, starred: false, only: null });
  if (act === 'root') {
    if (e.metaKey || e.ctrlKey) { const r = rootOf(+el.dataset.id); return r && scopeToggleDir(r.path); }
    return setFilter({ root: +el.dataset.id, dir: null });
  }
  if (act === 'dir') {
    if (e.metaKey || e.ctrlKey) return scopeToggleDir(el.dataset.path);
    return setFilter({ root: +el.dataset.root, dir: el.dataset.path });
  }
  if (act === 'starred') return setFilter({ starred: true }, true);
  if (act === 'kind') return setFilter({ kind: el.dataset.kind }, true);
  if (act === 'tag') return setFilter({ tag: +el.dataset.id }, true);
});
$('#sidebar').addEventListener('contextmenu', e => {
  const el = e.target.closest('.side-item[data-act]');
  if (!el) return;
  const act = el.dataset.act;
  if (act === 'root') {
    e.preventDefault();
    const r = rootOf(+el.dataset.id);
    showMenu(e.clientX, e.clientY, [
      { label: '加入檢索範圍', icon: 'plus', key: '⌘點擊', act: () => scopeAdd({ dirs: [r.path] }) },
      { sep: true },
      { label: '重新掃描', icon: 'refresh', act: async () => { await api('rescan', { root: r.id }); setTimeout(poll, 300); } },
      { label: '在訪達中顯示', icon: 'reveal', act: () => api('reveal-path', { path: r.path }).catch(fail) },
      { sep: true },
      { label: '移出資料庫…', icon: 'x', danger: true, act: () => removeRoot(r) },
    ]);
  } else if (act === 'dir') {
    e.preventDefault();
    const p = el.dataset.path;
    const cnt = +(($('.count', el) || {}).textContent || '0').replace(/,/g, '');
    showMenu(e.clientX, e.clientY, [
      { label: '只看此文件夾', icon: 'search', act: () => setFilter({ root: +el.dataset.root, dir: p }) },
      { label: '加入檢索範圍', icon: 'plus', key: '⌘點擊', act: () => scopeAdd({ dirs: [p] }) },
      { sep: true },
      { label: '在訪達中顯示', icon: 'reveal', act: () => api('reveal-path', { path: p }).catch(fail) },
      { label: '拷貝路徑', icon: 'copy', act: () => copyText(p) },
      { sep: true },
      { label: '排除此文件夾…', icon: 'ban', danger: true, act: () => excludeFolder(p, cnt) },
    ]);
  } else if (act === 'tag') {
    e.preventDefault();
    const t = S.tags.find(t => t.id === +el.dataset.id);
    showMenu(e.clientX, e.clientY, [
      { label: '重命名…', icon: 'pencil', act: async () => {
        const n = await promptDialog('重命名標籤', '', t.name);
        if (n) { try { S.tags = (await api('tags/update', { id: t.id, name: n })).tags; renderSidebar(); renderResults(); } catch (e) { fail(e); } }
      } },
      { header: '顏色' },
      ...S.tagColors.map(c => ({ label: c === t.color ? '當前顏色' : '　', dot: c, act: async () => {
        S.tags = (await api('tags/update', { id: t.id, color: c })).tags; renderSidebar(); renderResults(); renderPreview();
      } })),
      { sep: true },
      { label: '刪除標籤…', icon: 'trash', danger: true, act: async () => {
        if (await confirmDialog(`刪除標籤「${t.name}」？`, '文件本身不受影響。', '刪除', true)) {
          S.tags = (await api('tags/delete', { id: t.id })).tags;
          if (S.filter.tag === t.id) S.filter.tag = null;
          renderSidebar(); runSearch();
        }
      } },
    ]);
  }
});
async function excludeFolder(path, count) {
  const name = path.split('/').pop();
  if (!await confirmDialog(`排除「${name}」？`,
    `這個文件夾${count ? `裡的 ${fmtNum(count)} 個文件` : ''}將移出索引，以後也不再收錄；<b>硬盤上的文件不受影響</b>。<br>可在「設置 → 排除」中刪掉這一行來恢復。`, '排除', true)) return;
  try {
    const r = await api('exclude', { path });
    S.settings.excludes = r.excludes;
    toast(`已排除，移出 ${fmtNum(r.removed)} 個文件`);
    if (S.filter.dir && (S.filter.dir === path || S.filter.dir.startsWith(path + '/'))) S.filter.dir = null;
    for (const rid of S.openRoots) await loadDirs(rid);
    await refreshState();
    runSearch({ keepScroll: true, reloadPreview: true });
  } catch (e) { fail(e); }
}
async function addRoot() {
  const path = await pickFolder('選擇要加入資料庫的文件夾');
  if (!path) return;
  try {
    const r = await api('roots/add', { path });
    S.roots = r.roots;
    toast('已加入資料庫，正在建立索引…');
    renderAll();
    setTimeout(poll, 300);
  } catch (e) { fail(e); }
}
async function removeRoot(r) {
  if (!await confirmDialog(`把「${r.name}」移出資料庫？`,
    `只刪除索引及其中文件的收藏、標籤、備註，<b>不會刪除硬盤上的文件</b>。<br>${esc(r.path)}`, '移出', true)) return;
  try {
    S.roots = (await api('roots/remove', { id: r.id })).roots;
    if (S.filter.root === r.id) { S.filter.root = null; S.filter.dir = null; }
    await refreshState();
    runSearch();
  } catch (e) { fail(e); }
}
async function newTag(ids) {
  const name = await promptDialog('新建標籤', ids && ids.length ? `並添加到所選的 ${ids.length} 個文件` : '', '', '新建');
  if (!name) return;
  try {
    const r = await api('tags/create', { name, ids: ids || [] });
    S.tags = r.tags;
    renderSidebar();
    if (ids) { patchItems(ids, it => { it.tags = (it.tags || []).concat([r.id]); }); }
  } catch (e) { fail(e); }
}

// ===================================================================== 檢索
let searchTimer = null, searchSeq = 0;
function scheduleSearch(ms = 230) { clearTimeout(searchTimer); searchTimer = setTimeout(runSearch, ms); }
async function runSearch(opt = {}) {
  clearTimeout(searchTimer);
  const seq = ++searchSeq;
  const p = new URLSearchParams({ q: S.q, mode: S.mode, scope: S.scope, sort: S.sort, limit: S.limit, gen: seq });
  if (S.fuzzy) { p.set('fuzzy', 1); p.set('sim', S.fzSim); }
  const f = S.filter;
  if (f.only) {
    if (f.only.files.length) p.set('ids', f.only.files.map(x => x.id).join(','));
    if (f.only.dirs.length) p.set('dirs', JSON.stringify(f.only.dirs));
  }
  if (f.root) p.set('root', f.root);
  if (f.dir) p.set('dir', f.dir);
  if (f.kind) p.set('kind', f.kind);
  if (f.tag) p.set('tag', f.tag);
  if (f.starred) p.set('starred', 1);
  S.loading = true;
  const slow = setTimeout(() => { if (seq === searchSeq) renderResHead(); }, 250);
  let r;
  try { r = await api('search?' + p); } catch (e) { clearTimeout(slow); S.loading = false; renderResHead(); return fail(e); }
  clearTimeout(slow);
  if (seq !== searchSeq) return;
  S.loading = false;
  const qChanged = !S.res || S.res.q !== r.q || S.res.mode !== r.mode || S.res.fuzzy !== r.fuzzy;
  S.res = r;
  S.items = r.items;
  if (!S.items.some(i => i.id === S.cur)) {
    S.cur = S.items.length ? S.items[0].id : null;
    S.sel = new Set(S.cur ? [S.cur] : []);
    S.anchor = S.cur;
  } else {
    for (const id of Array.from(S.sel)) if (!S.items.some(i => i.id === id)) S.sel.delete(id);
  }
  renderVariants();
  renderResults();
  if (!opt.keepScroll) $('#res-list').scrollTop = 0;
  const shown = topPv(S.pv);
  if (S.cur && (qChanged || !shown || shown.id !== S.cur || opt.reloadPreview)) loadPreview(S.cur);
  else if (!S.cur) { S.pv = null; renderPreview(); }
}
function renderVariants() {
  const bar = $('#variant-bar');
  const vs = (S.res && S.res.variants) || [];
  if (S.mode === 'exact' || !vs.length) { bar.hidden = true; return; }
  const key = S.mode === 'st' ? 'st' : 'full';
  const chips = vs.map(v => {
    const others = v[key].filter(c => c !== v.char && !isCompatForm(c));
    if (!others.length) return '';
    return `<span class="vchip" title="${esc(v.char)}：${esc(v[key].join(' '))}"><span class="vq">${esc(v.char)}</span>
      <span class="vs">${others.map(esc).join('')}</span></span>`;
  }).join('');
  if (!chips) { bar.hidden = true; return; }
  bar.innerHTML = `<span class="vb-label">${S.mode === 'st' ? '簡繁互通' : '異體互通'}</span>${chips}`;
  bar.hidden = false;
}
function renderResHead() {
  const r = S.res, f = S.filter;
  let h = '';
  if (S.loading) h += '<span class="spin"></span>';
  if (r) {
    if (r.q) {
      h += `<span><b>${fmtNum(r.items.length)}</b> 個文件`;
      if (r.hits) h += ` · 命中 <b>${fmtNum(r.hits)}</b> 處`;
      h += ` · ${r.took < 0.01 ? '<0.01' : r.took.toFixed(2)} 秒</span>`;
      if (r.fuzzy) {
        const ft = r.fuzzy_terms || [];
        const tip = ft.length ? '模糊匹配（空白、標點不計）：\n' + ft.map(t => `「${t.term}」${t.chars} 字，最多可差 ${t.errors} 字`).join('\n')
          : '檢索詞都不足 3 字（或相似度設得太高），按原方式匹配';
        h += `<span class="fz-note" title="${esc(tip)}">≈ ${ft.length ? '模糊 ≥ ' + Math.round(r.fuzzy * 100) + '%' : '詞太短，未模糊'}</span>`;
      }
    } else {
      h += `<span><b>${fmtNum(r.total)}</b> 個文件</span>`;
    }
  }
  const chips = [];
  if (f.root && !f.dir) { const ro = rootOf(f.root); chips.push(['root', ro ? ro.name : '資料庫']); }
  if (f.dir) chips.push(['dir', f.dir.split('/').pop()]);
  if (f.kind) chips.push(['kind', f.kind === 'notext' ? '無文字層' : KIND_LABEL[f.kind]]);
  if (f.tag) { const t = S.tags.find(t => t.id === f.tag); chips.push(['tag', '#' + (t ? t.name : '')]); }
  if (f.starred) chips.push(['starred', '已收藏']);
  if (f.only) chips.push(['only', '範圍：' + onlyLabel(f.only)]);
  h += chips.map(([k, l]) => `<span class="fchip"${k === 'only' ? ' data-only title="只在這些文件／文件夾中檢索（點擊查看）"' : ''}><span>${esc(l)}</span><button data-clear="${k}" title="取消篩選">${I.x}</button></span>`).join('');
  $('#res-head').innerHTML = h;
}
$('#res-head').addEventListener('click', e => {
  const b = e.target.closest('[data-clear]');
  const oc = e.target.closest('[data-only]');
  if (oc && !b) return onlyMenu(oc);
  if (!b) return;
  const k = b.dataset.clear;
  if (k === 'root') setFilter({ root: null, dir: null });
  else if (k === 'dir') setFilter({ dir: null });
  else setFilter({ [k]: k === 'starred' ? false : null });
});

const simBadge = it => (it.sim != null && it.sim < 1 ?
  `<span class="it-sim" title="最接近的一處與檢索詞的相似度（模糊匹配）">≈${Math.round(it.sim * 100)}%</span>` : '');
function itemHtml(it) {
  const sel = S.sel.has(it.id);
  if (it.folder) {
    return `<div class="item${it.id === S.cur ? ' sel' : ''}${sel && S.sel.size > 1 ? ' multi' : ''}" data-id="${it.id}">
      <div class="it-top"><span class="badge k-folder">${I.folder}</span>
      <div class="it-name" title="${esc(it.path)}">${it.name_segs ? segsHtml(it.name_segs) : esc(it.name)}</div>
      ${simBadge(it)}<span class="it-hits it-count" title="文件夾內的文件數">${fmtNum(it.count)} 個文件</span></div>
      <div class="it-meta"><span class="it-path" title="${esc(it.dir)}">${esc(relDir(it))}</span>
      ${it.subs ? `<span>${fmtNum(it.subs)} 個子文件夾</span><span class="sep">·</span>` : ''}
      <span>${fmtSize(it.size)}</span><span class="sep">·</span><span>${fmtDate(it.mtime)}</span></div></div>`;
  }
  const tags = (it.tags || []).map(id => S.tags.find(t => t.id === id)).filter(Boolean);
  let h = `<div class="item${it.id === S.cur ? ' sel' : ''}${sel && S.sel.size > 1 ? ' multi' : ''}" data-id="${it.id}">
    <div class="it-top"><span class="badge k-${it.kind}">${esc(badgeText(it))}</span>
    <div class="it-name" title="${esc(it.name)}">${it.name_segs ? segsHtml(it.name_segs) : esc(it.name)}</div>
    ${it.starred ? `<span class="it-star" title="已收藏">${I.starFill}</span>` : ''}
    ${simBadge(it)}${it.hits ? `<span class="it-hits" title="全文命中">${fmtNum(it.hits)}${it.capped ? '+' : ''}</span>` : ''}</div>
    <div class="it-meta"><span class="it-path" title="${esc(it.dir)}">${esc(relDir(it))}</span>
    ${tags.length ? `<span class="it-tags">${tags.map(t => `<span class="tag-dot" title="${esc(t.name)}" style="background:${esc(t.color)}"></span>`).join('')}</span>` : ''}
    <span>${fmtSize(it.size)}</span><span class="sep">·</span><span>${fmtDate(it.mtime)}</span></div>`;
  if (it.snippets && it.snippets.length) {
    h += '<div class="snips">' + it.snippets.map(s =>
      `<div class="snip" data-pos="${s.pos}">${s.page ? `<span class="pg">${s.page}</span>` : ''}${segsHtml(s.segs)}</div>`).join('') + '</div>';
  }
  return h + '</div>';
}
function renderResults() {
  renderResHead();
  const list = $('#res-list');
  const app = $('#app');
  if (!S.roots.length) {
    app.classList.add('no-roots');
    list.innerHTML = `<div class="welcome"><div class="seal">檢</div><h2>通檢</h2>
      <p>把存放資料的文件夾加入資料庫，通檢會為文件名和全文建立索引。</p>
      <p>檢索時簡體、繁體、異體字互通：</p>
      <div class="demo">查「<b>万历</b>」，可得「萬曆」「萬歷」「万暦」<br>查「<b>为政</b>」，可得「為政」「爲政」</div>
      <button class="btn primary lg" data-act="add-root">${I.plus}添加文件夾</button></div>`;
    renderPreview();
    return;
  }
  app.classList.remove('no-roots');
  if (!S.items.length) {
    const r = S.res;
    if (r && r.q) {
      list.innerHTML = `<div class="empty">${I.search.replace('<svg', '<svg class="big-ic"')}<h3>沒有找到「${esc(r.q)}」</h3>
        ${S.mode !== 'full' ? `<p>試試切換到「<a href="#" data-mode-to="full">異體</a>」模式</p>` : ''}
        ${!S.fuzzy ? `<p>或開啟「<a href="#" data-fuzzy-on>模糊</a>」，容許脫字、訛字</p>` : ''}
        ${S.scope !== 'all' ? '<p>或把範圍改為「名稱與全文」</p>' : ''}
        ${Object.values(S.filter).some(Boolean) ? '<p>或取消上方的篩選條件</p>' : ''}
        ${S.status.busy ? '<p>索引尚未完成，稍後結果會更多</p>' : ''}</div>`;
    } else {
      list.innerHTML = `<div class="empty">${I.tray.replace('<svg', '<svg class="big-ic"')}<h3>這裡沒有文件</h3>
        <p>${S.status.busy ? '正在建立索引……' : '換個篩選條件看看'}</p></div>`;
    }
    return;
  }
  let h = S.items.map(itemHtml).join('');
  if (S.res && S.res.truncated) h += `<button class="more-btn" data-act="more">顯示更多</button>`;
  list.innerHTML = h;
}
function patchItems(ids, fn) {
  const set = new Set(ids);
  for (const it of S.items) if (set.has(it.id)) fn(it);
  renderResults();
}
function selectItem(id, e) {
  const ids = S.items.map(i => i.id);
  if (e && (e.metaKey || e.ctrlKey)) {
    S.sel.has(id) ? S.sel.delete(id) : S.sel.add(id);
    if (!S.sel.size) S.sel.add(id);
    S.cur = id; S.anchor = id;
  } else if (e && e.shiftKey && S.anchor != null) {
    const a = ids.indexOf(S.anchor), b = ids.indexOf(id);
    S.sel = new Set(ids.slice(Math.min(a, b), Math.max(a, b) + 1));
    S.cur = id;
  } else {
    S.sel = new Set([id]); S.cur = id; S.anchor = id;
  }
  $$('#res-list .item').forEach(el => {
    const i = +el.dataset.id;
    el.classList.toggle('sel', i === S.cur);
    el.classList.toggle('multi', S.sel.has(i) && S.sel.size > 1);
  });
  if (S.sel.size > 1) { renderPreview(); return; }
  if (!S.pv || S.pv.id !== id) loadPreview(id);
  else renderPreview();
}
$('#res-list').addEventListener('click', e => {
  if (e.target.closest('[data-act="add-root"]')) return addRoot();
  if (e.target.closest('[data-act="more"]')) { S.limit += 300; return runSearch({ keepScroll: true }); }
  const mt = e.target.closest('[data-mode-to]');
  if (mt) { e.preventDefault(); return setMode(mt.dataset.modeTo); }
  if (e.target.closest('[data-fuzzy-on]')) { e.preventDefault(); return setFuzzy(true); }
  const el = e.target.closest('.item');
  if (!el) return;
  const id = +el.dataset.id;
  const snip = e.target.closest('.snip');
  if (snip && !(e.metaKey || e.shiftKey || e.ctrlKey)) {
    S.pendingPos = +snip.dataset.pos;
    if (S.pv && S.pv.id === id) {
      S.sel = new Set([id]); S.cur = id;
      if (S.pvTab !== 'text') { S.pvTab = 'text'; }
      renderPreview();
      selectItem(id);
      return;
    }
  }
  selectItem(id, e);
});
$('#res-list').addEventListener('dblclick', e => {
  const el = e.target.closest('.item');
  if (!el) return;
  const id = +el.dataset.id;
  if (id < 0) { const it = S.items.find(i => i.id === id); return it && openPath(it.path); }
  api('open', { id }).catch(fail);
});
$('#res-list').addEventListener('contextmenu', e => {
  const el = e.target.closest('.item');
  if (!el) return;
  e.preventDefault();
  const id = +el.dataset.id;
  if (!S.sel.has(id)) selectItem(id);
  itemMenu(e.clientX, e.clientY);
});
const selIds = () => {
  const ids = (S.sel.size ? Array.from(S.sel) : (S.cur ? [S.cur] : [])).filter(i => i > 0);
  if (!ids.length && S.pv && !S.pv.folder && S.sel.size <= 1) ids.push(S.pv.id);
  return ids;
};
const selItems = () => S.items.filter(i => S.sel.has(i.id));
function itemMenu(x, y) {
  const f = S.sel.size === 1 ? S.items.find(i => i.id === S.cur && i.folder) : null;
  if (f) {
    return showMenu(x, y, [
      { label: '在訪達中打開', icon: 'open', key: '↩', act: () => openPath(f.path) },
      { label: '在訪達中顯示', icon: 'reveal', key: '⌘R', act: () => openPath(f.path, true) },
      { label: '只看此文件夾', icon: 'search', act: () => setFilter({ root: f.root, dir: f.path }) },
      { label: '加入檢索範圍', icon: 'plus', act: () => scopeAdd({ dirs: [f.path] }) },
      { label: '拷貝路徑', icon: 'copy', act: () => copyText(f.path) },
      { sep: true },
      { label: '排除此文件夾…', icon: 'ban', danger: true, act: () => excludeFolder(f.path, f.count) },
    ]);
  }
  const ids = selIds(), n = ids.length;
  if (!n) return;
  const one = n === 1 ? S.items.find(i => i.id === ids[0]) : null;
  const allStar = selItems().every(i => i.starred);
  const sc = selScope(), ns = sc.files.length + sc.dirs.length;
  showMenu(x, y, [
    one && { label: '打開', icon: 'open', key: '↩', act: () => doOpen(one.id) },
    one && { label: '快速查看', icon: 'eye', key: '空格', act: () => api('quicklook', { id: one.id }).catch(fail) },
    one && { label: '在訪達中顯示', icon: 'reveal', key: '⌘R', act: () => doReveal(one.id) },
    one && { sep: true },
    { label: ns > 1 ? `只在選中的 ${ns} 項中檢索` : '只在此文件中檢索', icon: 'search', act: () => scopeTo(sc) },
    { label: '加入檢索範圍', icon: 'plus', act: () => scopeAdd(sc) },
    one && S.pv && S.pv.id === one.id && S.pv.status === 1 && { label: '在本文件內查找…', icon: 'search', key: '⌘F', act: () => openFind() },
    { sep: true },
    { label: allStar ? '取消收藏' : '收藏', icon: 'star', key: '⌘D', act: () => doStar(ids, !allStar) },
    { label: '標籤…', icon: 'tag', act: () => tagMenu(x + 10, y + 10, ids) },
    { sep: true },
    one && { label: '重命名…', icon: 'pencil', key: 'F2', act: () => doRename(one.id) },
    { label: n > 1 ? `移動 ${n} 個文件到…` : '移動到…', icon: 'move', act: () => doMove(ids) },
    one && { label: '拷貝路徑', icon: 'copy', act: () => copyText(one.dir + '/' + one.name) },
    { sep: true },
    { label: n > 1 ? `把 ${n} 個文件移到廢紙簍` : '移到廢紙簍', icon: 'trash', key: '⌘⌫', danger: true, act: () => doTrash(ids) },
  ]);
}
function tagMenu(x, y, ids) {
  const items = S.items.filter(i => ids.includes(i.id));
  const pvTags = S.pv && ids.length === 1 && S.pv.id === ids[0] ? S.pv.tags : null;
  const has = t => (pvTags ? pvTags.includes(t.id) : items.length && items.every(i => (i.tags || []).includes(t.id)));
  showMenu(x, y, [
    ...S.tags.map(t => ({ label: t.name, dot: t.color, check: has(t), act: () => doTag(ids, t.id, !has(t)) })),
    S.tags.length ? { sep: true } : null,
    { label: '新建標籤…', icon: 'plus', act: () => newTag(ids) },
  ]);
}

// ===================================================================== 自選檢索範圍
// filter.only = { files: [{id, name}], dirs: [path] }：只在這些文件、文件夾（含子文件夾）中檢索
function onlyLabel(o) {
  if (o.files.length + o.dirs.length === 1) return o.files.length ? o.files[0].name : o.dirs[0].split('/').pop();
  return [o.dirs.length ? `${o.dirs.length} 個文件夾` : '', o.files.length ? `${o.files.length} 個文件` : '']
    .filter(Boolean).join('、');
}
function selScope() {
  const items = selItems();
  if (!items.length && S.pv && !S.pv.folder) return { files: [{ id: S.pv.id, name: S.pv.name }], dirs: [] };
  return { files: items.filter(i => !i.folder).map(i => ({ id: i.id, name: i.name })),
    dirs: items.filter(i => i.folder).map(i => i.path) };
}
function scopeBase() {            // 已有的單個文件夾篩選併入範圍
  const f = S.filter;
  if (f.only) return { files: f.only.files.slice(), dirs: f.only.dirs.slice() };
  const o = { files: [], dirs: [] };
  if (f.dir) o.dirs.push(f.dir);
  else if (f.root) { const r = rootOf(f.root); if (r) o.dirs.push(r.path); }
  return o;
}
function applyScope(o) {
  if (!o.files.length && !o.dirs.length) return setFilter({ only: null });
  if (o.files.length + o.dirs.length > 2000) return toast('範圍內的項目太多（最多 2000 個）', { err: true });
  setFilter({ root: null, dir: null, only: o });
}
function scopeTo(sc) { applyScope({ files: (sc.files || []).slice(), dirs: (sc.dirs || []).slice() }); }
function scopeAdd(sc) {
  const o = scopeBase();
  for (const x of sc.files || []) if (!o.files.some(y => y.id === x.id)) o.files.push(x);
  for (const d of sc.dirs || []) if (!o.dirs.includes(d)) o.dirs.push(d);
  applyScope(o);
}
function scopeToggleDir(path) {
  const o = scopeBase();
  const i = o.dirs.indexOf(path);
  if (i >= 0) o.dirs.splice(i, 1); else o.dirs.push(path);
  applyScope(o);
}
function onlyMenu(el) {
  const o = S.filter.only;
  if (!o) return;
  const r = el.getBoundingClientRect();
  const MAX = 40;
  const rows = o.dirs.map(d => ({ label: d.split('/').pop(), icon: 'folder', key: '移除',
    act: () => applyScope({ files: o.files, dirs: o.dirs.filter(x => x !== d) }) }))
    .concat(o.files.map(x => ({ label: x.name, icon: 'file', key: '移除',
      act: () => applyScope({ files: o.files.filter(y => y.id !== x.id), dirs: o.dirs }) })));
  showMenu(r.left, r.bottom + 4, [
    { header: '只在這些項目中檢索（點擊移除）' },
    ...rows.slice(0, MAX),
    rows.length > MAX ? { label: `……還有 ${rows.length - MAX} 項`, disabled: true } : null,
    { sep: true },
    { label: '清除範圍', icon: 'x', act: () => setFilter({ only: null }) },
  ]);
}

// ===================================================================== 文件操作
async function doOpen(id) { try { await api('open', { id }); } catch (e) { fail(e); } }
async function doReveal(id) { try { await api('open', { id, reveal: true }); } catch (e) { fail(e); } }
async function doStar(ids, v) {
  try {
    await api('star', { ids, value: v });
    patchItems(ids, it => { it.starred = v; });
    if (S.pv && ids.includes(S.pv.id)) { S.pv.starred = v; renderPreviewHead(); }
    S.stats.starred = (S.stats.starred || 0) + (v ? 1 : -1) * ids.length;
    refreshState();
    if (!v && S.filter.starred) runSearch({ keepScroll: true });
  } catch (e) { fail(e); }
}
async function doTag(ids, tid, on) {
  try {
    S.tags = (await api('tags/assign', { ids, tag: tid, on })).tags;
    patchItems(ids, it => {
      const s = new Set(it.tags || []);
      on ? s.add(tid) : s.delete(tid);
      it.tags = Array.from(s);
    });
    if (S.pv && ids.includes(S.pv.id)) {
      const s = new Set(S.pv.tags);
      on ? s.add(tid) : s.delete(tid);
      S.pv.tags = Array.from(s);
      if (S.pvTab === 'info') renderPreviewBody();
    }
    renderSidebar();
  } catch (e) { fail(e); }
}
async function doRename(id) {
  const it = S.items.find(i => i.id === id) || S.pv;
  if (!it) return;
  if (S.pv && S.pv.id === id && S.sel.size <= 1) return startInlineRename();
  const n = await promptDialog('重命名', '', it.name, '重命名');
  if (n && n !== it.name) await commitRename(id, n);
}
async function commitRename(id, name) {
  try {
    const r = await api('rename', { id, name });
    patchItems([id], it => { Object.assign(it, { name: r.item.name, ext: r.item.ext, kind: r.item.kind, name_segs: null }); });
    if (S.pv && S.pv.id === id) { S.pv.name = r.item.name; S.pv.path = S.pv.dir + '/' + r.item.name; renderPreviewHead(); }
    toast('已重命名');
  } catch (e) { fail(e); renderPreviewHead(); }
}
function startInlineRename() {
  const el = $('.pv-name');
  if (!el || !S.pv) return;
  el.contentEditable = 'true';
  el.focus();
  const name = S.pv.name, dot = name.lastIndexOf('.');
  const rng = document.createRange();
  const tn = el.firstChild;
  if (tn) {
    rng.setStart(tn, 0);
    rng.setEnd(tn, dot > 0 ? dot : name.length);
    const sel = getSelection(); sel.removeAllRanges(); sel.addRange(rng);
  }
  const finish = async ok => {
    el.removeEventListener('keydown', onKey);
    el.removeEventListener('blur', onBlur);
    el.contentEditable = 'false';
    const v = el.textContent.replace(/\n/g, '').trim();
    if (ok && v && v !== name) await commitRename(S.pv.id, v);
    else el.textContent = name;
  };
  const onKey = e => {
    if (e.isComposing) return;
    if (e.key === 'Enter') { e.preventDefault(); finish(true); }
    if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); finish(false); }
  };
  const onBlur = () => finish(true);
  el.addEventListener('keydown', onKey);
  el.addEventListener('blur', onBlur);
}
async function doTrash(ids) {
  const items = S.items.filter(i => ids.includes(i.id));
  const label = ids.length === 1 ? `「${(items[0] || S.pv || {}).name}」` : `這 ${ids.length} 個文件`;
  if (!await confirmDialog(`把${label}移到廢紙簍？`, '可以在訪達的廢紙簍中用「放回原處」恢復。收藏、標籤、備註會一併清除。', '移到廢紙簍', true)) return;
  try {
    const r = await api('trash', { ids });
    if (r.errors && r.errors.length) toast(r.errors.join('；'), { err: true });
    if (r.trashed) toast(`已移到廢紙簍 ${r.trashed} 個文件`);
    const idx = S.items.findIndex(i => ids.includes(i.id));
    S.items = S.items.filter(i => !ids.includes(i.id));
    const next = S.items[Math.min(idx, S.items.length - 1)];
    S.cur = next ? next.id : null;
    S.sel = new Set(S.cur ? [S.cur] : []);
    renderResults();
    if (S.cur) loadPreview(S.cur); else { S.pv = null; renderPreview(); }
    refreshState();
  } catch (e) { fail(e); }
}
async function doMove(ids) {
  for (const r of S.roots) if (!S.dirs[r.id]) await loadDirs(r.id);
  let dest = null;
  const rows = [];
  const walk = (node, depth) => {
    rows.push({ path: node.path, name: node.name, depth, count: node.count });
    Array.from(node.kids.values()).forEach(k => walk(k, depth + 1));
  };
  for (const r of S.roots) walk(buildTree(r, S.dirs[r.id] || []), 0);
  const listHtml = rows.map(r => `<div class="side-item" data-path="${esc(r.path)}" style="padding-left:${8 + r.depth * 16}px" title="${esc(r.path)}">
    <span class="side-ic">${I.folder}</span><span class="label">${esc(r.name)}</span><span class="count">${fmtNum(r.count)}</span></div>`).join('');
  const res = await dialog({
    title: ids.length > 1 ? `移動 ${ids.length} 個文件` : '移動文件', wide: false,
    desc: '選擇目標文件夾。移到資料庫以外的位置後，文件將不再被索引。',
    body: `<input type="text" class="dest-filter" placeholder="篩選文件夾" style="margin-bottom:8px"><div class="dest-list">${listHtml}</div>
      <div class="note-st dest-show" style="margin-top:8px"></div>`,
    buttons: [
      { label: '其他位置…', left: true, onClick: async (dl, finish) => {
        const p = await pickFolder('選擇目標文件夾');
        if (p) { dest = p; finish({ value: 'ok' }); }
      } },
      { label: '取消' },
      { label: '移動', primary: true, value: 'ok', validate: () => { if (!dest) { toast('請先選擇目標文件夾'); return false; } return true; } },
    ],
    onOpen: dl => {
      const show = $('.dest-show', dl);
      $('.dest-list', dl).addEventListener('click', e => {
        const it = e.target.closest('.side-item');
        if (!it) return;
        $$('.dest-list .side-item', dl).forEach(x => x.classList.toggle('active', x === it));
        dest = it.dataset.path;
        show.textContent = dest;
      });
      $('.dest-filter', dl).addEventListener('input', e => {
        const v = e.target.value.trim();
        $$('.dest-list .side-item', dl).forEach(x => { x.hidden = v && !x.dataset.path.includes(v); });
      });
    },
  });
  if (!res.value || !dest) return;
  try {
    const r = await api('move', { ids, dest });
    if (r.errors && r.errors.length) toast(r.errors.join('；'), { err: true });
    if (r.moved) toast(`已移動 ${r.moved} 個文件` + (r.dropped ? `（${r.dropped} 個移出了資料庫）` : ''));
    S.dirs = {};
    for (const rid of S.openRoots) await loadDirs(rid);
    await refreshState();
    runSearch({ keepScroll: true, reloadPreview: true });
  } catch (e) { fail(e); }
}
function copyText(t) {
  const done = () => toast('已拷貝');
  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(t).then(done, () => legacyCopy(t, done));
  } else legacyCopy(t, done);
}
function legacyCopy(t, done) {
  const ta = document.createElement('textarea');
  ta.value = t; ta.style.position = 'fixed'; ta.style.opacity = '0';
  document.body.appendChild(ta); ta.select();
  try { document.execCommand('copy'); done(); } catch (e) { fail(e); }
  ta.remove();
}

// ===================================================================== 預覽
let pvSeq = 0;
async function loadFolder(path, back) {
  const seq = ++pvSeq;
  try {
    const r = await api(`folder?path=${encodeURIComponent(path)}&q=${encodeURIComponent(S.q)}&mode=${S.mode}${fzQS()}`);
    if (seq !== pvSeq) return;
    r.back = back || null;
    prepFolder(r);
    S.pv = r;
    renderPreview();
  } catch (e) {
    if (seq === pvSeq) { S.pv = null; renderPreview(); fail(e); }
  }
}
async function loadPreview(id, back) {
  if (id < 0) {
    const it = S.items.find(i => i.id === id);
    return it ? loadFolder(it.path) : null;
  }
  const seq = ++pvSeq;
  try {
    const r = await api(`preview?id=${id}&q=${encodeURIComponent(S.q)}&mode=${S.mode}${fzQS()}`);
    if (seq !== pvSeq) return;
    r.back = back || null;
    if (r.text && r.text.indexOf('\f') >= 0) {
      let n = 0;
      for (const pg of r.text.split('\f')) if (/\S/.test(pg)) n++;
      r.textPages = n;
    }
    r.sparse = nearEmpty(r) && r.status === 1;
    S.pv = r;
    S.hit = 0;
    S.pvTab = chooseTab(r, S.pvTabPref);
    renderPreview();
  } catch (e) {
    if (seq === pvSeq) { S.pv = null; renderPreview(); fail(e); }
  }
}
function tabsFor(pv) {
  const t = [];
  if (pv.status === 1) t.push('text');
  const ext = pv.ext;
  if (!(pv.kind === 'text' && TEXT_EXTS.has(ext)) && pv.kind !== 'sheet' || ext === 'html' || ext === 'htm') t.push('orig');
  t.push('info');
  return t;
}
function chooseTab(pv, pref) {
  const t = tabsFor(pv);
  if (pv.sparse && t.includes('orig') && pref !== 'info') return 'orig';   // 掃描件：全文幾乎是空的，先看原件
  if (pref === 'orig' && t.includes('orig') && (pv.kind === 'pdf' || pv.kind === 'image')) return 'orig';
  if (t.includes(pref) && pref !== 'orig') return pref;
  if (t.includes('text')) return 'text';
  if ((pv.kind === 'pdf' || pv.kind === 'image') && t.includes('orig')) return 'orig';
  return 'info';
}
function renderPreview() {
  const el = $('#preview');
  if (S.sel.size > 1) {
    const n = S.sel.size, items = selItems();
    const size = items.reduce((a, b) => a + (b.size || 0), 0);
    el.innerHTML = `<div class="pv-msg"><svg viewBox="0 0 24 24" style="width:48px;height:48px;stroke-width:1">
      <rect x="6.5" y="3.5" width="12" height="15" rx="1.5"/><path d="M4.5 7v12a1.5 1.5 0 0 0 1.5 1.5h10"/></svg>
      <h3 style="color:var(--text);margin:10px 0 2px">已選擇 ${n} 個文件</h3><p>共 ${fmtSize(size)}</p>
      <div style="display:flex;gap:8px;justify-content:center;flex-wrap:wrap;margin-top:12px">
      <button class="btn" data-bulk="star">${I.star}收藏</button><button class="btn" data-bulk="tag">${I.tag}標籤</button>
      <button class="btn" data-bulk="move">${I.move}移動</button><button class="btn danger" data-bulk="trash">${I.trash}廢紙簍</button></div></div>`;
    return;
  }
  if (!S.pv) {
    el.innerHTML = S.roots.length ? `<div class="pv-empty">${I.page}<p>選擇一個文件以預覽</p></div>` : '';
    return;
  }
  if (S.pv.folder) return renderFolder(el);
  el.innerHTML = `<div class="pv-head" id="pv-head"></div><div class="tabs" id="pv-tabs"></div><div class="pv-body" id="pv-body"></div>`;
  renderPreviewHead();
  renderPreviewBody();
}
function crumbsHtml(rootId, dir) {
  const r = rootOf(rootId);
  if (!r) return `<span>${esc(dir)}</span>`;
  const rel = dir.slice(r.path.length).replace(/^\//, '');
  const segs = rel ? rel.split('/') : [];
  let p = r.path;
  return `<span data-dir="" title="${esc(r.path)}">${esc(r.name)}</span>` + segs.map(s => {
    p += '/' + s;
    return `<i>›</i><span data-dir="${esc(p)}">${esc(s)}</span>`;
  }).join('');
}
const backHtml = pv => pv.back ? `<button class="back-link" data-back>‹ 返回「${esc(pv.back.name)}」</button>` : '';
// ---- 文件夾預覽：結構（可展開的樹）／縮略圖
const THUMB_KINDS = new Set(['image', 'pdf', 'doc', 'slide', 'sheet', 'ebook', 'video']);
const FOLDER_SORTS = { name: '名稱', count: '文件數', size: '大小', mtime: '修改日期' };
function prepFolder(f) {
  f.dirMap = new Map(f.dirs.map(d => [d.path, d]));
  f.kidDirs = new Map();
  for (const d of f.dirs) {
    if (!f.kidDirs.has(d.parent)) f.kidDirs.set(d.parent, []);
    f.kidDirs.get(d.parent).push(d);
  }
  f.kidFiles = new Map();
  for (const x of f.files) {
    if (!f.kidFiles.has(x.dir)) f.kidFiles.set(x.dir, []);
    f.kidFiles.get(x.dir).push(x);
  }
  // 含命中的文件夾（用於收起時標記、打開時自動展開）
  f.hitIn = new Map();
  const mark = p => { while (p && p !== f.path && p.startsWith(f.path + '/')) { f.hitIn.set(p, (f.hitIn.get(p) || 0) + 1); p = p.slice(0, p.lastIndexOf('/')); } };
  for (const x of f.files) if (x.segs) mark(x.dir);
  for (const d of f.dirs) if (d.segs) mark(d.parent);
  f.expanded = new Set();
  if (f.hitIn.size) for (const p of f.hitIn.keys()) f.expanded.add(p);
  else if (f.count <= 150) for (const d of f.dirs) f.expanded.add(d.path);
  const own = f.kidFiles.get(f.path) || [];
  const pics = own.filter(x => x.kind === 'image' || x.kind === 'pdf').length;
  f.view = S.folderView || (!f.subs && own.length && pics / own.length >= 0.6 ? 'grid' : 'tree');
  f.sortBy = 'name';
  f.sortDesc = false;
  f.scroll = 0;
}
function folderKids(f, path) {
  let dirs = f.kidDirs.get(path) || [], files = f.kidFiles.get(path) || [];
  if (f.sortBy !== 'name') {
    const k = f.sortBy, sgn = f.sortDesc ? -1 : 1;
    const cmp = (a, b) => sgn * ((a[k] || 0) - (b[k] || 0));
    dirs = dirs.slice().sort(cmp);
    files = files.slice().sort(k === 'count' ? () => 0 : cmp);
  } else if (f.sortDesc) { dirs = dirs.slice().reverse(); files = files.slice().reverse(); }
  return { dirs, files };
}
const igHtml = depth => '<span class="ig"></span>'.repeat(depth);
function fileIcon(x) {
  if (x.kind === 'image') return `<img class="ti-img" loading="lazy" src="${thumbUrl(x.id)}" alt="" data-kind="${x.kind}" data-badge="${esc(badgeText(x))}">`;
  return `<span class="tbadge k-${x.kind}">${esc(badgeText(x).slice(0, 4))}</span>`;
}
function treeRowsHtml(f) {
  const out = [];
  const walk = (path, depth) => {
    const { dirs, files } = folderKids(f, path);
    for (const d of dirs) {
      const open = f.expanded.has(d.path);
      const hits = !open && f.hitIn.get(d.path);
      // 展開的文件夾包成一組：滾動時它的標題行吸附在頂部，層層疊放，隨時看得到上級路徑
      if (open) out.push(`<div class="tg">`);
      out.push(`<div class="tr dir${open ? ' open' : ''}${d.segs ? ' hit' : ''}" data-tpath="${esc(d.path)}" title="${esc(d.path)}"${open ? ` style="top:${depth * 30}px;z-index:${40 - depth}"` : ''}>
        <span class="tp">${igHtml(depth)}<span class="tw${open ? ' open' : ''}${d.count ? '' : ' none'}">${I.chev}</span><span class="ti">${I.folder}</span></span>
        <span class="tn">${d.segs ? segsHtml(d.segs) : esc(d.name)}${hits ? `<span class="hit-dot" title="其中有 ${hits} 處名稱命中">${hits}</span>` : ''}</span>
        <span class="tc">${fmtNum(d.count)}</span><span class="ts">${fmtSize(d.size)}</span><span class="td">${fmtDate(d.mtime)}</span></div>`);
      if (open) {
        walk(d.path, depth + 1);
        if (!d.loaded && d.direct > (f.kidFiles.get(d.path) || []).length) {
          out.push(`<div class="tr more" data-more="${esc(d.path)}"><span class="tp">${igHtml(depth + 1)}<span class="tw none"></span></span>
            <span class="tn">${d.loading ? '載入中…' : `顯示其餘 ${fmtNum(d.direct - (f.kidFiles.get(d.path) || []).length)} 個文件`}</span></div>`);
        }
        out.push('</div>');
      }
    }
    for (const x of files) {
      out.push(`<div class="tr file${x.segs ? ' hit' : ''}" data-fid="${x.id}" title="${esc(x.name)}">
        <span class="tp">${igHtml(depth)}<span class="tw none"></span><span class="ti">${fileIcon(x)}</span></span>
        <span class="tn">${x.starred ? '<span class="star">★</span>' : ''}${x.segs ? segsHtml(x.segs) : esc(x.name)}</span>
        <span class="tc"></span><span class="ts">${fmtSize(x.size)}</span><span class="td">${fmtDate(x.mtime)}</span></div>`);
    }
  };
  walk(f.path, 0);
  if (!f.loaded && f.direct > (f.kidFiles.get(f.path) || []).length) {
    out.push(`<div class="tr more" data-more="${esc(f.path)}"><span class="tp"><span class="tw none"></span></span>
      <span class="tn">${f.loading ? '載入中…' : `顯示其餘 ${fmtNum(f.direct - (f.kidFiles.get(f.path) || []).length)} 個文件`}</span></div>`);
  }
  return out.join('') || '<div class="pv-msg">文件夾是空的</div>';
}
function gridHtml(f) {
  const { dirs, files } = folderKids(f, f.path);
  const subs = dirs.map(d => `<div class="tile dtile${d.segs ? ' hit' : ''}" data-sub="${esc(d.path)}" title="${esc(d.name)}">
    <div class="tile-img">${I.folder}<span class="dcount">${fmtNum(d.count)}</span></div>
    <div class="tile-name">${d.segs ? segsHtml(d.segs) : esc(d.name)}</div></div>`).join('');
  const tiles = files.map(x => {
    const inner = THUMB_KINDS.has(x.kind)
      ? `<img loading="lazy" src="${thumbUrl(x.id)}" alt="" data-kind="${x.kind}" data-badge="${esc(badgeText(x))}">`
      : `<span class="badge k-${x.kind}">${esc(badgeText(x))}</span>`;
    return `<div class="tile${x.segs ? ' hit' : ''}" data-fid="${x.id}" title="${esc(x.name)}"><div class="tile-img">${inner}</div>
      <div class="tile-name">${x.starred ? '★ ' : ''}${x.segs ? segsHtml(x.segs) : esc(x.name)}</div></div>`;
  }).join('');
  const more = !f.loaded ? `<button class="more-btn" data-more="${esc(f.path)}">${f.loading ? '載入中…' : '顯示其餘文件'}</button>` : '';
  return (subs || tiles) ? `<div class="fd-grid">${subs}${tiles}</div>${more}` : '<div class="pv-msg">文件夾是空的</div>';
}
function renderFolder(el) {
  const f = S.pv;
  const kinds = Object.entries(f.kinds || {}).sort((a, b) => b[1] - a[1]).slice(0, 5)
    .map(([k, n]) => `${KIND_LABEL[k] || k} ${fmtNum(n)}`).join(' · ');
  const nd = f.dirs.length;
  el.innerHTML = `<div class="pv-head">${backHtml(f)}
    <div class="pv-title"><span class="badge k-folder">${I.folder}</span><div class="pv-name">${esc(f.name)}</div></div>
    <div class="pv-path">${crumbsHtml(f.root, f.dir)}</div>
    <div class="pv-actions">
      <button class="btn primary" data-fact="open" title="在訪達中打開（↩）">${I.open}在訪達中打開</button>
      <button class="btn" data-fact="filter" title="只在此文件夾內檢索和瀏覽">${I.search}只看此文件夾</button>
      <button class="icon-btn" data-fact="reveal" title="在訪達中顯示（⌘R）">${I.reveal}</button>
      <button class="icon-btn" data-fact="copy" title="拷貝路徑">${I.copy}</button>
      <span class="sp"></span>
      <button class="icon-btn" data-fact="exclude" title="排除此文件夾（移出索引，文件不受影響）">${I.ban}</button></div></div>
    <div class="fd-sum">
      <div class="fd-stats">
        <div><b>${fmtNum(f.count)}</b> 個文件${nd ? ` · <b>${fmtNum(nd)}</b> 個子文件夾（本層 ${f.subs} 個）` : ''} · ${fmtSize(f.size)}</div>
        <div class="fd-line2">${kinds}${f.q && f.matches ? `<span class="fd-hits" data-fact="next-hit" title="點擊依次跳到各個命中處">名稱命中 ${f.matches} 處 ↓</span>` : ''}</div></div>
      <div class="fd-tools">
        ${f.view === 'tree' && nd ? `<button class="mini-btn" data-fact="expand-all">全部展開</button><button class="mini-btn" data-fact="collapse-all">全部收起</button>` : ''}
        <div class="seg mini"><button data-fview="tree" class="${f.view === 'tree' ? 'on' : ''}">結構</button><button data-fview="grid" class="${f.view === 'grid' ? 'on' : ''}">縮略圖</button></div>
      </div></div>
    ${f.view === 'tree' ? `<div class="tr thead">
      ${Object.entries({ name: '名稱', count: '文件數', size: '大小', mtime: '修改日期' }).map(([k, l]) =>
        `<span class="${k === 'name' ? 'tn' : k === 'count' ? 'tc' : k === 'size' ? 'ts' : 'td'}${f.sortBy === k ? ' on' : ''}" data-fsort="${k}">${l}${f.sortBy === k ? (f.sortDesc ? ' ↓' : ' ↑') : ''}</span>`).join('')}</div>` : ''}
    <div class="fd-body" id="fd-body">${f.view === 'tree' ? `<div class="tree">${treeRowsHtml(f)}</div>` : gridHtml(f)}</div>`;
  const body = $('#fd-body', el);
  body.scrollTop = f.scroll || 0;
  if (f.q && f.matches && !f.scroll && !f.toHit) {        // 首次打開：滾到第一個命中處
    f.toHit = true;
    const h = $('.tr.hit, .tile.hit', body);
    if (h && h.offsetTop > body.clientHeight * 0.6) body.scrollTop = h.offsetTop - body.clientHeight / 3;
  }
  $$('img[data-badge]', el).forEach(img => img.addEventListener('error', () => {
    const b = document.createElement('span');
    b.className = (img.classList.contains('ti-img') ? 'tbadge' : 'badge') + ' k-' + img.dataset.kind;
    b.textContent = img.dataset.badge.slice(0, img.classList.contains('ti-img') ? 4 : 8);
    img.replaceWith(b);
  }));
}
async function toggleDir(f, path) {
  if (f.expanded.has(path)) { f.expanded.delete(path); return rerenderFolder(); }
  f.expanded.add(path);
  const d = f.dirMap.get(path);
  if (d && !d.loaded && d.direct > (f.kidFiles.get(path) || []).length) await loadMoreFiles(f, path);
  else rerenderFolder();
}
async function loadMoreFiles(f, path) {
  const d = path === f.path ? f : f.dirMap.get(path);
  if (!d || d.loading) return;
  d.loading = true;
  rerenderFolder();
  try {
    const r = await api(`folder-files?path=${encodeURIComponent(path)}&q=${encodeURIComponent(f.q)}&mode=${S.mode}${fzQS()}`);
    f.kidFiles.set(path, r.files);
    d.loaded = true;
  } catch (e) { fail(e); }
  d.loading = false;
  if (S.pv === f) rerenderFolder();
}
function rerenderFolder() {
  const f = S.pv;
  if (!f || !f.folder) return;
  const body = $('#fd-body');
  if (body) f.scroll = body.scrollTop;
  renderFolder($('#preview'));
}
function renderPreviewHead() {
  const pv = S.pv, head = $('#pv-head');
  if (!pv || !head) return;
  const crumbs = crumbsHtml(pv.root, pv.dir);
  head.innerHTML = backHtml(pv) + `<div class="pv-title"><span class="badge k-${pv.kind}">${esc(badgeText(pv))}</span>
    <div class="pv-name" title="雙擊重命名">${esc(pv.name)}</div></div>
    <div class="pv-path">${crumbs}</div>
    <div class="pv-actions">
      <button class="btn primary" data-act="open" title="用默認程序打開（↩）">${I.open}打開</button>
      <button class="icon-btn" data-act="ql" title="快速查看（空格）">${I.eye}</button>
      <button class="icon-btn" data-act="reveal" title="在訪達中顯示（⌘R）">${I.reveal}</button>
      <button class="icon-btn${pv.starred ? ' on' : ''}" data-act="star" title="${pv.starred ? '取消收藏' : '收藏'}（⌘D）">${pv.starred ? I.starFill : I.star}</button>
      <button class="icon-btn" data-act="tag" title="標籤">${I.tag}</button>
      <button class="icon-btn" data-act="move" title="移動到…">${I.move}</button>
      <button class="icon-btn" data-act="rename" title="重命名（F2）">${I.pencil}</button>
      <span class="sp"></span>
      <button class="icon-btn" data-act="trash" title="移到廢紙簍（⌘⌫）">${I.trash}</button>
    </div>`;
  if (!pv.exists) head.insertAdjacentHTML('beforeend', `<p style="color:var(--accent);font-size:12px;margin:8px 0 0 46px">文件已不在原處，重新掃描後將從索引中移除。</p>`);
  const tabs = tabsFor(pv);
  const names = { text: '全文', orig: '原件', info: '信息' };
  $('#pv-tabs').innerHTML = tabs.map(t => `<button data-tab="${t}" class="${S.pvTab === t ? 'on' : ''}">${names[t]}${t === 'info' && pv.note ? ' ·' : ''}</button>`).join('');
}
function renderPreviewBody() {
  const pv = S.pv, body = $('#pv-body');
  if (!pv || !body) return;
  $$('#pv-tabs button').forEach(b => b.classList.toggle('on', b.dataset.tab === S.pvTab));
  if (S.pvTab === 'text') return renderReader(body);
  if (S.pvTab === 'orig') return renderOrig(body);
  return renderInfo(body);
}
function statusMsg(pv) {
  if (pv.status === 2) return pv.kind === 'pdf' ? '這個 PDF 沒有可檢索的文字層（多半是掃描影印本），只能檢索文件名。' : '文件中沒有可抽取的文字。';
  if (pv.status === 3) return '抽取文字時出錯：' + esc(pv.err || '');
  if (pv.status === 4) return '文件太大，未抽取全文。';
  if (['pdf', 'doc', 'text', 'ebook', 'sheet', 'slide'].includes(pv.kind) && !pv.indexed) return '正在建立索引……';
  return '這類文件只檢索文件名。';
}
function renderOrig(body) {
  const pv = S.pv;
  const page = S.origPage ? '#page=' + S.origPage : '';
  S.origPage = null;
  if (!pv.exists) { body.innerHTML = `<div class="pv-msg">文件已不在原處。</div>`; return; }
  if (pv.kind === 'pdf' && isBigPdf(pv) && !S.fullPdf.has(pv.id)) return renderPager(body, +page.slice(6) || 0);
  if (pv.kind === 'pdf') body.innerHTML = `<iframe class="frame" src="${rawUrl(pv.id, page)}"></iframe>`;
  else if (pv.kind === 'image') body.innerHTML = `<div class="img-view"><img src="${rawUrl(pv.id)}" alt=""></div>`;
  else if (pv.ext === 'html' || pv.ext === 'htm') body.innerHTML = `<iframe class="frame" sandbox="" src="${rawUrl(pv.id)}"></iframe>`;
  else body.innerHTML = `<div class="pv-msg">這類文件不能在通檢裡直接顯示。<br>
    <button class="btn" data-act="ql">${I.eye}快速查看</button> <button class="btn primary" data-act="open">${I.open}打開</button></div>`;
}
// ---- 大 PDF 逐頁預覽：後台用 PDFKit 渲染當前頁（不寫磁盤，只在內存裡留最近幾頁），WebKit 不必載入整本
let pgSeq = 0;
function renderPager(body, start) {
  const pv = S.pv, n = pv.pages || 0;
  const p = Math.max(1, Math.min(n || 1, start || S.pgLast[pv.id] || 1));
  const fit = S.pgFit || 'page';
  S.pg = { id: pv.id, page: p };
  body.innerHTML = `<div class="pgbar">
      <button class="icon-btn" data-act="pg-prev" title="上一頁（←）">${I.chev.replace('<svg', '<svg style="transform:rotate(180deg)"')}</button>
      <span class="pg-pos">第 <input id="pg-no" type="text" inputmode="numeric" autocomplete="off" value="${p}"> / ${fmtNum(n)} 頁</span>
      <button class="icon-btn" data-act="pg-next" title="下一頁（→）">${I.chev}</button>
      <span class="vsep"></span>
      <button class="btn mini${fit === 'page' ? ' on' : ''}" data-act="pg-fit" data-fit="page" title="整頁顯示">整頁</button>
      <button class="btn mini${fit === 'width' ? ' on' : ''}" data-act="pg-fit" data-fit="width" title="適合寬度">寬度</button>
      <span class="grow"></span>
      <span class="pg-hint" title="這個 PDF 很大（${fmtSize(pv.size)}，${fmtNum(n)} 頁），整本載入要好幾秒、佔用較多內存，所以逐頁顯示">逐頁顯示</span>
      <button class="btn mini" data-act="pg-full" title="在通檢裡載入整個 PDF（可連續滾動、選字，但要等幾秒）">載入整本</button>
    </div>
    <div class="pgview fit-${fit}" id="pgview"><img id="pg-img" alt=""><div class="pg-msg" id="pg-msg" hidden></div></div>`;
  const inp = $('#pg-no', body);
  inp.addEventListener('keydown', e => {
    if (e.key === 'Enter') { e.preventDefault(); const v = parseInt(inp.value, 10); if (v) showPage(v); inp.blur(); }
    else if (e.key === 'Escape') { inp.value = S.pg.page; inp.blur(); }
  });
  inp.addEventListener('focus', () => inp.select());
  showPage(p);
}
function pageUrl(id, p) {
  const v = $('#pgview');
  const w = Math.min(3200, Math.max(800, Math.ceil((v ? v.clientWidth : 900) * (window.devicePixelRatio || 1) / 200) * 200));
  return `/page/${id}/${p}?w=${w}&t=${encodeURIComponent(S.token)}`;
}
function showPage(p) {
  const pv = S.pv;
  if (!pv || !S.pg || S.pg.id !== pv.id || !$('#pg-img')) return;
  const n = pv.pages || 0;
  p = Math.max(1, n ? Math.min(n, p) : p);
  S.pg.page = p;
  S.pgLast[pv.id] = p;
  const inp = $('#pg-no'), msg = $('#pg-msg');
  if (inp && document.activeElement !== inp) inp.value = p;
  const url = pageUrl(pv.id, p), seq = ++pgSeq;
  const slow = setTimeout(() => { if (seq === pgSeq) { msg.textContent = '渲染中…'; msg.hidden = false; } }, 150);
  const im = new Image();
  im.onload = () => {
    clearTimeout(slow);
    if (seq !== pgSeq || !$('#pg-img')) return;
    $('#pg-img').src = url;
    msg.hidden = true;
    $('#pgview').scrollTop = 0;
    if (p < n) { const pre = new Image(); pre.src = pageUrl(pv.id, p + 1); }   // 預先渲染下一頁
  };
  im.onerror = () => { clearTimeout(slow); if (seq === pgSeq) { msg.textContent = '這一頁無法顯示'; msg.hidden = false; } };
  im.src = url;
}
function renderInfo(body) {
  const pv = S.pv;
  const rows = [
    ['位置', esc(pv.path)], ['類型', `${KIND_LABEL[pv.kind] || ''}${pv.ext ? '（.' + esc(pv.ext) + '）' : ''}`],
    ['大小', `${fmtSize(pv.size)}（${fmtNum(pv.size)} 字節）`], ['修改時間', fmtDate(pv.mtime, true)],
    ['收錄時間', fmtDate(pv.added, true)],
  ];
  if (pv.status === 1) rows.push(['全文', fmtNum(pv.chars) + ' 字' + (pv.pages ? ` · ${pv.pages} 頁` : '')]);
  else rows.push(['全文', statusMsg(pv)]);
  const tags = S.tags.map(t => `<button class="tchip${pv.tags.includes(t.id) ? ' on' : ''}" data-tag="${t.id}">
    <span class="tag-dot" style="background:${esc(t.color)}"></span>${esc(t.name)}</button>`).join('');
  body.innerHTML = `<div class="info"><table>${rows.map(([k, v]) => `<tr><td>${k}</td><td>${v}</td></tr>`).join('')}</table>
    <h4>標籤</h4><div class="tag-chips">${tags}<button class="tchip" data-act="new-tag-pv">${I.plus.replace('<svg', '<svg style="width:12px;height:12px"')}新標籤</button></div>
    <h4>備註</h4><textarea class="note" placeholder="寫下關於這個文件的筆記（自動保存）">${esc(pv.note_text)}</textarea>
    <div class="note-st"></div></div>`;
  const ta = $('.note', body), st = $('.note-st', body);
  let t = null;
  const save = async () => {
    const v = ta.value;
    try {
      await api('note', { id: pv.id, note: v });
      pv.note_text = v; pv.note = !!v.trim();
      st.textContent = '已保存';
      patchItems([pv.id], it => { it.note = pv.note; });
    } catch (e) { st.textContent = '保存失敗：' + e.message; }
  };
  ta.addEventListener('input', () => { st.textContent = '…'; clearTimeout(t); t = setTimeout(save, 700); });
  ta.addEventListener('blur', () => { if (ta.value !== pv.note_text) { clearTimeout(t); save(); } });
}

// ---- 全文閱讀器
function mergeSpans(spans) {
  const out = [];
  for (const [s, e] of (spans || []).slice().sort((a, b) => a[0] - b[0] || a[1] - b[1])) {
    if (out.length && s < out[out.length - 1][1]) { if (e > out[out.length - 1][1]) out[out.length - 1][1] = e; }
    else out.push([s, e]);
  }
  return out;
}
function fillMark(m, str, qset, base, diffs) {
  // 命中裡字形與檢索詞不同的字：v = 異體，x = 模糊匹配中與檢索詞不同的字（diffs 為 UTF-16 下標）
  let run = '', runK = null, i = base;
  const flush = () => {
    if (!run) return;
    if (runK) { const sp = document.createElement('span'); sp.className = runK; sp.textContent = run; m.appendChild(sp); }
    else m.appendChild(document.createTextNode(run));
    run = '';
  };
  for (const ch of str) {
    const k = diffs && diffs.has(i) ? 'x' : (isWordChar(ch) && !qset.has(exNorm(ch)) ? 'v' : '');
    if (runK !== null && k !== runK) flush();
    runK = k;
    run += ch;
    i += ch.length;
  }
  flush();
}
function findActive() { return S.find.open && !!S.find.q.trim(); }
const findKey = () => [S.find.q.trim(), S.mode, S.fuzzy ? S.fzSim : ''].join('\u0001');
function findReady() { const r = S.find.res; return !!(r && S.pv && r.id === S.pv.id && r.key === findKey()); }
function renderReader(body) {
  const pv = S.pv;
  if (pv.status !== 1 || pv.text == null) {
    body.innerHTML = `<div class="pv-msg">${statusMsg(pv)}${pv.kind === 'pdf' && pv.exists ? `<br><button class="btn" data-tab-to="orig">${I.page}查看原件</button>` : ''}</div>`;
    return;
  }
  body.innerHTML = `<div class="findbar" id="findbar"${S.find.open ? '' : ' hidden'}>${I.search}
    <input id="find-q" type="text" spellcheck="false" autocomplete="off" placeholder="在本文件內查找 —— 簡繁異體互通" value="${esc(S.find.q)}">
    <span class="find-mode" id="find-mode"></span>
    <button class="icon-btn" data-act="find-close" title="關閉查找（esc）">${I.x}</button></div>
    <div class="hitbar" id="hitbar"></div><div class="reader" id="reader" style="--reader-size:${S.readerSize}px"></div>`;
  bindFind();
  paintReader();
  if (findActive() && !findReady()) runFind();
}
function paintReader() {
  const pv = S.pv, reader = $('#reader');
  if (!pv || !reader || pv.text == null) return;
  // 查找框有內容時，高亮查找結果；否則高亮主檢索詞
  const src = findActive() ? (findReady() ? S.find.res : { spans: [], diffs: [], qchars: '' }) : pv;
  const spans = mergeSpans(src.spans);
  const diffs = src.diffs && src.diffs.length ? new Set(src.diffs) : null;
  S.spans = spans;
  S.hit = 0;
  reader.textContent = '';
  const paged = pv.text.indexOf('\f') >= 0;
  const text = pv.text, qset = new Set(Array.from(src.qchars || ''));
  const blocks = [];
  if (paged) {
    let a = 0, page = 1;
    for (;;) {
      const i = text.indexOf('\f', a);
      blocks.push([a, i < 0 ? text.length : i, page]);
      if (i < 0) break;
      a = i + 1; page++;
    }
  } else {
    const CH = 16000;
    let a = 0;
    while (a < text.length) {
      let b = Math.min(text.length, a + CH);
      if (b < text.length) { const nl = text.indexOf('\n', b); if (nl >= 0 && nl - b < 3000) b = nl + 1; }
      blocks.push([a, b, 0]);
      a = b;
    }
    if (!blocks.length) blocks.push([0, 0, 0]);
  }
  const frag = document.createDocumentFragment();
  if (pv.sparse) {
    const note = document.createElement('div');
    note.className = 'sparse-note';
    note.innerHTML = `這個 PDF 幾乎沒有文字層：${fmtNum(pv.pages)} 頁中只有 ${fmtNum(pv.textPages || 0)} 頁有文字（多為掃描件，只能按文件名找到）。
      <button class="btn mini" data-tab-to="orig">${I.page}看原件</button>`;
    frag.appendChild(note);
  }
  S.hitEls = new Array(spans.length);
  let si = 0, run = null;
  const flushRun = () => {         // 連續的空白頁合成一行，免得幾千個空頁拖慢顯示
    if (!run) return;
    const d = document.createElement('div');
    d.className = 'blk empty-run';
    d.textContent = run[0] === run[1] ? `第 ${run[0]} 頁沒有文字` : `第 ${run[0]}–${run[1]} 頁沒有文字`;
    frag.appendChild(d);
    run = null;
  };
  for (const [a, b, page] of blocks) {
    if (page && !(si < spans.length && spans[si][0] < b) && !/\S/.test(text.slice(a, b))) {
      if (run) run[1] = page; else run = [page, page];
      continue;
    }
    flushRun();
    const div = document.createElement('div');
    div.className = 'blk';
    if (page) {
      div.dataset.page = page;
      const hd = document.createElement('div');
      hd.className = 'pghd';
      hd.textContent = `第 ${page} 頁`;
      div.appendChild(hd);
    }
    let pos = a;
    while (si < spans.length && spans[si][0] < b) {
      const [s, e] = spans[si];
      const ss = Math.max(s, pos), ee = Math.min(e, b);
      if (ss > pos) div.appendChild(document.createTextNode(text.slice(pos, ss)));
      if (ee > ss) {
        const m = document.createElement('mark');
        m.dataset.i = si;
        fillMark(m, text.slice(ss, ee), qset, ss, diffs);
        div.appendChild(m);
        if (!S.hitEls[si]) S.hitEls[si] = m;
      }
      pos = Math.max(pos, ee);
      if (e <= b) si++; else break;
    }
    if (pos < b) div.appendChild(document.createTextNode(text.slice(pos, b)));
    frag.appendChild(div);
  }
  flushRun();
  reader.appendChild(frag);
  if (pv.truncated) reader.insertAdjacentHTML('beforeend', `<div class="trunc">文本過長，只顯示前 ${fmtNum(text.length)} 字。</div>`);
  let start = 0;
  if (S.pendingPos != null) {
    const k = spans.findIndex(sp => sp[1] > S.pendingPos);
    if (k >= 0) start = k;
    S.pendingPos = null;
  }
  renderHitbar();
  if (spans.length) requestAnimationFrame(() => gotoHit(start));
}
// ---- 本文件內查找（⌘F）：與主檢索框無關，用同樣的匹配方式和模糊設置
let findTimer = null, findSeq = 0;
function bindFind() {
  const inp = $('#find-q');
  if (!inp) return;
  $('#find-mode').textContent = MODE_LABEL[S.mode] + (S.fuzzy ? ` · 模糊 ≥ ${Math.round(S.fzSim * 100)}%` : '');
  let comp = false;
  inp.addEventListener('compositionstart', () => { comp = true; });
  inp.addEventListener('compositionend', () => { comp = false; onFindInput(); });
  inp.addEventListener('input', e => { if (!comp && !e.isComposing) onFindInput(); });
  inp.addEventListener('keydown', e => {
    if (e.isComposing || comp) return;
    if (e.key === 'Enter') { e.preventDefault(); gotoHit(S.hit + (e.shiftKey ? -1 : 1)); }
    else if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); closeFind(); }
  });
}
function onFindInput() {
  S.find.q = $('#find-q').value;
  clearTimeout(findTimer);
  findTimer = setTimeout(runFind, S.find.q.trim() ? 220 : 0);
}
async function runFind() {
  clearTimeout(findTimer);
  const pv = S.pv;
  if (!pv || pv.folder || pv.status !== 1) return;
  if (!S.find.q.trim()) { S.find.res = null; S.find.busy = false; findSeq++; return paintReader(); }
  const seq = ++findSeq, key = findKey();
  S.find.busy = true;
  renderHitbar();
  try {
    const r = await api(`find?id=${pv.id}&q=${encodeURIComponent(S.find.q)}&mode=${S.mode}${fzQS()}`);
    if (seq !== findSeq || !S.pv || S.pv.id !== pv.id) return;
    S.find.res = { id: pv.id, key, spans: r.spans, diffs: r.diffs, qchars: r.qchars };
    S.find.busy = false;
    paintReader();
  } catch (e) {
    if (seq === findSeq) { S.find.busy = false; renderHitbar(); }
    fail(e);
  }
}
function openFind() {
  const pv = S.pv;
  if (!pv || pv.folder || pv.status !== 1 || pv.text == null) return false;
  if (S.pvTab !== 'text') { S.pvTab = S.pvTabPref = 'text'; renderPreviewBody(); }
  S.find.open = true;
  const fb = $('#findbar');
  if (fb) fb.hidden = false;
  const inp = $('#find-q');
  if (inp) { inp.focus(); inp.select(); }
  renderHitbar();
  if (S.find.q.trim() && !findReady()) runFind();
  else if (S.find.q.trim()) paintReader();
  return true;
}
function closeFind() {
  S.find.open = false;
  S.find.res = null;
  S.find.busy = false;
  findSeq++;
  const fb = $('#findbar');
  if (fb) fb.hidden = true;
  paintReader();
}
function curPage() {
  const m = S.hitEls[S.hit];
  const blk = m && m.closest('.blk');
  return blk && blk.dataset.page ? +blk.dataset.page : null;
}
function renderHitbar() {
  const hb = $('#hitbar');
  if (!hb) return;
  const n = S.hitEls.length, pv = S.pv, fa = findActive();
  const page = n ? curPage() : null;
  const msg = fa ? (S.find.busy || !findReady() ? '查找中…' : '本文件內沒有找到')
    : `${fmtNum(pv.chars)} 字${pv.pages ? ' · ' + pv.pages + ' 頁' : ''}${S.q ? ' · 正文無命中' : ''}`;
  hb.innerHTML = `${n ? `<span>${fa ? '查找：' : ''}第 <b>${S.hit + 1}</b> / ${fmtNum(n)} 處</span>
    <button class="icon-btn" data-act="prev-hit" title="上一處（⇧⌘G）">${I.up}</button>
    <button class="icon-btn" data-act="next-hit" title="下一處（⌘G）">${I.down}</button>
    ${page ? `<span class="pg-now">第 ${page} 頁</span>` : ''}` :
    `<span style="color:var(--text-3)">${msg}</span>`}
    <span class="grow"></span>
    <button class="icon-btn${S.find.open ? ' on' : ''}" data-act="find" title="在本文件內查找（⌘F）">${I.search}</button>
    ${pv.kind === 'pdf' && pv.exists ? `<button class="icon-btn" data-act="orig-page" title="在原件中查看${page ? '此頁' : ''}">${I.page}</button>` : ''}
    <span class="vsep"></span>
    <button class="icon-btn" data-act="font-down" title="縮小字號" style="font-size:12px;font-weight:600">A</button>
    <button class="icon-btn" data-act="font-up" title="放大字號" style="font-size:16px;font-weight:600">A</button>`;
}
function gotoHit(i) {
  const n = S.hitEls.length;
  if (!n) return;
  i = ((i % n) + n) % n;
  const old = S.hitEls[S.hit];
  if (old) $$(`mark[data-i="${S.hit}"]`, $('#reader')).forEach(m => m.classList.remove('cur'));
  S.hit = i;
  $$(`mark[data-i="${i}"]`, $('#reader')).forEach(m => m.classList.add('cur'));
  S.hitEls[i].scrollIntoView({ block: 'center' });
  renderHitbar();
}

$('#preview').addEventListener('click', async e => {
  if (e.target.closest('[data-back]') && S.pv && S.pv.back) { pvSeq++; S.pv = S.pv.back; return renderPreview(); }
  const fact = e.target.closest('[data-fact]');
  if (fact && S.pv && S.pv.folder) {
    const f = S.pv;
    switch (fact.dataset.fact) {
      case 'open': return openPath(f.path);
      case 'reveal': return openPath(f.path, true);
      case 'copy': return copyText(f.path);
      case 'filter': return setFilter({ root: f.root, dir: f.path });
      case 'exclude': return excludeFolder(f.path, f.count);
      case 'expand-all': f.dirs.forEach(d => f.expanded.add(d.path)); return rerenderFolder();
      case 'next-hit': {
        const body = $('#fd-body'), hits = $$('.tr.hit, .tile.hit', body);
        if (!hits.length) return;
        f.hitIdx = ((f.hitIdx == null ? -1 : f.hitIdx) + 1) % hits.length;
        const h = hits[f.hitIdx];
        // 減去吸頂的上級標題高度，命中行不被擋住
        let stuck = 0;
        for (let g = h.parentNode; g && g !== body; g = g.parentNode) if (g.classList && g.classList.contains('tg')) stuck++;
        if (h.classList.contains('dir') && h.classList.contains('open')) stuck--;
        body.scrollTop = Math.max(0, h.offsetTop - stuck * 30 - 40);
        hits.forEach(x => x.classList.toggle('flash', x === h));
        return;
      }
      case 'collapse-all': f.expanded.clear(); return rerenderFolder();
    }
  }
  if (S.pv && S.pv.folder) {
    const f = S.pv;
    const fv = e.target.closest('[data-fview]');
    if (fv) { f.view = S.folderView = fv.dataset.fview; f.scroll = 0; return renderFolder($('#preview')); }
    const fs = e.target.closest('[data-fsort]');
    if (fs) {
      const k = fs.dataset.fsort;
      if (f.sortBy === k) f.sortDesc = !f.sortDesc; else { f.sortBy = k; f.sortDesc = k !== 'name'; }
      return rerenderFolder();
    }
    const more = e.target.closest('[data-more]');
    if (more) return loadMoreFiles(f, more.dataset.more);
    const dir = e.target.closest('.tr.dir[data-tpath]');
    if (dir) return toggleDir(f, dir.dataset.tpath);
    const row = e.target.closest('.tr.file[data-fid], .tile[data-fid]');
    if (row) { const b = $('#fd-body'); if (b) f.scroll = b.scrollTop; return loadPreview(+row.dataset.fid, f); }
    const sub = e.target.closest('[data-sub]');
    if (sub) { const b = $('#fd-body'); if (b) f.scroll = b.scrollTop; return loadFolder(sub.dataset.sub, f); }
  }
  const tab = e.target.closest('[data-tab]');
  if (tab) { S.pvTab = S.pvTabPref = tab.dataset.tab; return renderPreviewBody(); }
  const tt = e.target.closest('[data-tab-to]');
  if (tt) { S.pvTab = S.pvTabPref = tt.dataset.tabTo; return renderPreviewBody(); }
  const crumb = e.target.closest('.pv-path span[data-dir]');
  if (crumb && S.pv) return setFilter({ root: S.pv.root, dir: crumb.dataset.dir || null });
  const bulk = e.target.closest('[data-bulk]');
  if (bulk) {
    const ids = selIds(), k = bulk.dataset.bulk;
    if (k === 'star') return doStar(ids, !selItems().every(i => i.starred));
    if (k === 'tag') { const r = bulk.getBoundingClientRect(); return tagMenu(r.left, r.bottom + 4, ids); }
    if (k === 'move') return doMove(ids);
    if (k === 'trash') return doTrash(ids);
  }
  const chip = e.target.closest('.tchip[data-tag]');
  if (chip && S.pv) { const tid = +chip.dataset.tag; return doTag([S.pv.id], tid, !S.pv.tags.includes(tid)); }
  const b = e.target.closest('[data-act]');
  if (!b || !S.pv) return;
  const id = S.pv.id;
  switch (b.dataset.act) {
    case 'open': return doOpen(id);
    case 'ql': return api('quicklook', { id }).catch(fail);
    case 'reveal': return doReveal(id);
    case 'star': return doStar([id], !S.pv.starred);
    case 'tag': { const r = b.getBoundingClientRect(); return tagMenu(r.left, r.bottom + 4, [id]); }
    case 'move': return doMove([id]);
    case 'rename': return startInlineRename();
    case 'trash': return doTrash([id]);
    case 'new-tag-pv': return newTag([id]).then(() => { S.pv.tags = (S.items.find(i => i.id === id) || {}).tags || S.pv.tags; loadPreview(id); });
    case 'prev-hit': return gotoHit(S.hit - 1);
    case 'next-hit': return gotoHit(S.hit + 1);
    case 'find': return S.find.open ? closeFind() : openFind();
    case 'pg-prev': return S.pg && showPage(S.pg.page - 1);
    case 'pg-next': return S.pg && showPage(S.pg.page + 1);
    case 'pg-fit': {
      S.pgFit = b.dataset.fit;
      const v = $('#pgview');
      if (v) v.className = 'pgview fit-' + S.pgFit;
      $$('[data-act="pg-fit"]').forEach(x => x.classList.toggle('on', x.dataset.fit === S.pgFit));
      return;
    }
    case 'pg-full': S.fullPdf.add(id); S.origPage = S.pg ? S.pg.page : null; return renderPreviewBody();
    case 'find-close': return closeFind();
    case 'orig-page': S.origPage = curPage(); S.pvTab = S.pvTabPref = 'orig'; return renderPreviewBody();
    case 'font-up': case 'font-down': {
      S.readerSize = Math.max(12, Math.min(28, S.readerSize + (b.dataset.act === 'font-up' ? 1 : -1)));
      api('settings', { reader_size: S.readerSize }).catch(() => {});
      const r = $('#reader'); if (r) r.style.setProperty('--reader-size', S.readerSize + 'px');
      if (S.hitEls[S.hit]) S.hitEls[S.hit].scrollIntoView({ block: 'center' });
    }
  }
});
$('#preview').addEventListener('contextmenu', e => {
  if (!S.pv || !S.pv.folder) return;
  const f = S.pv;
  const dir = e.target.closest('.tr.dir[data-tpath], .tile[data-sub]');
  const file = e.target.closest('.tr.file[data-fid], .tile[data-fid]');
  if (!dir && !file) return;
  e.preventDefault();
  if (dir) {
    const p = dir.dataset.tpath || dir.dataset.sub, d = f.dirMap.get(p) || {};
    return showMenu(e.clientX, e.clientY, [
      { label: '進入此文件夾', icon: 'folder', act: () => loadFolder(p, f) },
      { label: '在訪達中打開', icon: 'open', act: () => openPath(p) },
      { label: '只看此文件夾', icon: 'search', act: () => setFilter({ root: f.root, dir: p }) },
      { label: '加入檢索範圍', icon: 'plus', act: () => scopeAdd({ dirs: [p] }) },
      { label: '拷貝路徑', icon: 'copy', act: () => copyText(p) },
      { sep: true },
      { label: '排除此文件夾…', icon: 'ban', danger: true, act: () => excludeFolder(p, d.count) },
    ]);
  }
  const id = +file.dataset.fid;
  const x = f.files.find(v => v.id === id) || Array.from(f.kidFiles.values()).flat().find(v => v.id === id) || {};
  showMenu(e.clientX, e.clientY, [
    { label: '預覽', icon: 'page', act: () => loadPreview(id, f) },
    { label: '打開', icon: 'open', act: () => doOpen(id) },
    { label: '加入檢索範圍', icon: 'plus', act: () => scopeAdd({ files: [{ id, name: x.name || '' }] }) },
    { label: '快速查看', icon: 'eye', act: () => api('quicklook', { id }).catch(fail) },
    { label: '在訪達中顯示', icon: 'reveal', act: () => doReveal(id) },
    { label: '拷貝路徑', icon: 'copy', act: () => copyText((x.dir || '') + '/' + (x.name || '')) },
  ]);
});
$('#preview').addEventListener('dblclick', e => {
  const tile = e.target.closest('.tile[data-fid], .tr.file[data-fid]');
  if (tile) return doOpen(+tile.dataset.fid);
  const dir = e.target.closest('.tr.dir[data-tpath]');
  if (dir && S.pv && S.pv.folder) {          // 雙擊文件夾：進入它（可返回）
    const b = $('#fd-body'); if (b) S.pv.scroll = b.scrollTop;
    return loadFolder(dir.dataset.tpath, S.pv);
  }
  if (e.target.closest('.pv-name') && S.pv && !S.pv.folder) startInlineRename();
});

// ===================================================================== 工具欄
const qEl = $('#q');
let composing = false;
qEl.addEventListener('compositionstart', () => { composing = true; });
qEl.addEventListener('compositionend', () => { composing = false; onQuery(); });
qEl.addEventListener('input', e => { if (!composing && !e.isComposing) onQuery(); });
function onQuery() {
  S.q = qEl.value;
  $('#q-clear').hidden = !S.q;
  S.limit = 200;
  scheduleSearch(S.q.trim() ? (S.fuzzy && S.scope !== 'name' ? 450 : 260) : 60);
}
qEl.addEventListener('keydown', e => {
  if (e.isComposing || composing) return;
  if (e.key === 'Enter') { e.preventDefault(); S.q = qEl.value; runSearch(); }
  else if (e.key === 'Escape' && qEl.value) { e.preventDefault(); e.stopPropagation(); qEl.value = ''; onQuery(); }
  else if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { e.preventDefault(); moveCursor(e.key === 'ArrowDown' ? 1 : -1, e.shiftKey); }
});
$('#q-clear').onclick = () => { qEl.value = ''; onQuery(); qEl.focus(); };
function setMode(m) {
  S.mode = m;
  $$('#mode button').forEach(b => b.classList.toggle('on', b.dataset.mode === m));
  const fm = $('#find-mode');
  if (fm) fm.textContent = MODE_LABEL[S.mode] + (S.fuzzy ? ` · 模糊 ≥ ${Math.round(S.fzSim * 100)}%` : '');
  if (findActive()) runFind();
  api('settings', { mode: m }).catch(() => {});
  runSearch({ keepScroll: true });
}
$('#mode').addEventListener('click', e => { const b = e.target.closest('[data-mode]'); if (b) setMode(b.dataset.mode); });
$('#scope').onchange = e => { S.scope = e.target.value; api('settings', { scope: S.scope }).catch(() => {}); runSearch(); };
$('#sort').onchange = e => { S.sort = e.target.value; api('settings', { sort: S.sort }).catch(() => {}); runSearch(); };
$('#help-btn').onclick = showHelp;
function renderFuzzy() {
  $('#fz').classList.toggle('on', S.fuzzy);
  $('#fz-btn').setAttribute('aria-pressed', S.fuzzy ? 'true' : 'false');
  $('#fz-sim').value = S.fzSim;
  const fm = $('#find-mode');
  if (fm) fm.textContent = MODE_LABEL[S.mode] + (S.fuzzy ? ` · 模糊 ≥ ${Math.round(S.fzSim * 100)}%` : '');
}
function setFuzzy(on, sim) {
  S.fuzzy = !!on;
  if (sim) S.fzSim = sim;
  renderFuzzy();
  api('settings', { fuzzy: S.fuzzy ? '1' : '0', fuzzy_sim: S.fzSim }).catch(() => {});
  S.limit = 200;
  runSearch({ keepScroll: true });
  if (findActive()) runFind();
}
$('#fz-btn').onclick = () => setFuzzy(!S.fuzzy);
$('#fz-sim').onchange = e => setFuzzy(true, e.target.value);

function showHelp() {
  dialog({
    title: '檢索語法', wide: true,
    body: `<table class="syntax">
      <tr><td>萬曆 張居正</td><td>空格分隔：同時包含兩個詞</td></tr>
      <tr><td>後金 | 建州</td><td><code>|</code>：包含任一個詞</td></tr>
      <tr><td>萬曆 -天啟</td><td>減號：排除包含該詞的文件</td></tr>
      <tr><td>"Grand Secretary"</td><td>引號：把含空格的西文短語當作一個詞</td></tr>
      <tr><td>万历</td><td>「異體」模式下可得 萬曆、萬歷、万暦、萬厤 等寫法；跨行斷開的詞也能找到</td></tr>
      <tr><td>≈ 模糊</td><td>工具欄的「模糊」：容許脫字、衍字、訛字，如「李自成攻陷京師」也可得「李自成陷京師」。
        按相似度（1 − 差異字數 ÷ 檢索詞字數）篩選，空白和標點不計；3 字以上的詞才模糊匹配，排除詞仍按原方式</td></tr>
    </table>
    <div class="field"><label>限定檢索範圍</label>
      <p class="hint" style="margin:0">點側欄的文件夾 —— 只在該文件夾內檢索；⌘ 點擊可同時選幾個文件夾<br>
      在結果上右鍵 →「只在選中項中檢索」／「加入檢索範圍」—— 自選若干文件和文件夾；點結果上方的「範圍」標籤可查看、移除<br>
      預覽全文時按 ⌘F —— 只在當前文件內查找（與上方檢索框互不干擾）</p></div>
    <div class="field"><label>三種匹配方式</label>
      <p class="hint" style="margin:0">精確 —— 只匹配輸入的字形（不分大小寫、全半角）<br>
      簡繁 —— 簡體與繁體互通，如 后/後、历/歷/曆<br>
      異體 —— 再加上異體字、舊字形、日本新字體、康熙部首、兼容漢字，如 峯/峰、爲/為、靑/青</p></div>
    <div class="legend"><span><span class="h1">原字命中</span></span><span><span class="h2">異體命中</span>（原文字形與檢索詞不同）</span>
      <span><span class="h3">模糊差異</span>（與檢索詞不同的字）</span></div>
    <div class="field"><label>快捷鍵</label><p class="hint" style="margin:0">
      ⌘K 檢索框 · ⌘F 在本文件內查找 · ↑↓ 選擇文件 · ↩ 打開 · 空格 快速查看 · ⌘R 在訪達中顯示 · ⌘G / ⇧⌘G 下一處／上一處命中 ·
      ⌘D 收藏 · F2 重命名 · ⌘⌫ 移到廢紙簍 · ⌘1/2/3 切換匹配方式 · ⌘4 模糊開關</p></div>`,
    buttons: [{ label: '知道了', primary: true, value: 'ok' }],
  });
}
async function resetSettings() {
  const st = S.settings, def = S.defaults || {};
  const groups = (st.custom_variants || '').split('\n').filter(l => l.trim() && !l.trim().startsWith('#')).length;
  const exPaths = (st.excludes || '').split('\n').filter(l => /^[\/~]/.test(l.trim())).length;
  const exChanged = def.excludes !== undefined && (st.excludes || '') !== def.excludes;
  const r = await dialog({
    title: '恢復默認設置？',
    desc: '匹配方式（異體）、模糊檢索（關）、檢索範圍（僅文件名）、排序、名稱排序規則（跟隨系統）、跨標點匹配（關）、實時監聽（開）、' +
      '跳過代碼項目（開）、代碼與配置文件只收文件名，以及欄寬和閱讀字號，都恢復為默認。<br>' +
      '<b>資料庫、收藏、標籤、備註和索引都不受影響。</b>',
    body: (groups ? `<div class="field"><label class="switch"><input type="checkbox" id="rs-var">同時清空自定義異體字（${groups} 組）</label></div>` : '') +
      (exChanged ? `<div class="field"><label class="switch"><input type="checkbox" id="rs-excl">同時把排除列表恢復為默認${exPaths ? `（會重新收錄你排除過的 ${exPaths} 個文件夾）` : ''}</label></div>` : ''),
    buttons: [{ label: '取消' }, { label: '恢復默認', primary: true, value: 'ok' }],
  });
  if (!r.value) return false;
  const v = $('#rs-var', r.el), x = $('#rs-excl', r.el);
  try {
    const res = await api('settings/reset', { variants: !!(v && v.checked), excludes: !!(x && x.checked) });
    const s2 = await api('state');
    S.settings = s2.settings; S.projects = s2.projects || []; S.customGroups = s2.custom_groups; S.defaults = s2.defaults;
    S.mode = s2.settings.mode || 'full';
    S.scope = s2.settings.scope || 'name';
    S.sort = s2.settings.sort || 'relevance';
    S.fuzzy = s2.settings.fuzzy === '1';
    S.fzSim = s2.settings.fuzzy_sim || '0.7';
    renderFuzzy();
    S.folderView = undefined;
    S.readerSize = 16;
    document.documentElement.style.removeProperty('--sidebar-w');
    document.documentElement.style.removeProperty('--list-w');
    $$('#mode button').forEach(b => b.classList.toggle('on', b.dataset.mode === S.mode));
    $('#scope').value = S.scope;
    $('#sort').value = S.sort;
    renderAll();
    runSearch({ reloadPreview: true });
    setTimeout(poll, 300);
    toast(res.changed.length ? '已恢復默認設置' : '設置本來就是默認的');
    return true;
  } catch (e) { fail(e); return false; }
}
async function openSettings() {
  const st = S.settings, meta = S.meta || {};
  const r = await dialog({
    title: '設置', wide: true,
    body: `<div class="field" style="margin-top:4px"><label>自定義異體字</label>
      <p class="hint">字表未收、但你的材料中常見的異寫，每行寫一組互通的字，如「峯峰」「箇個」。保存後會重建索引。</p>
      <textarea class="cjk" id="st-custom" placeholder="峯峰&#10;箇個">${esc(st.custom_variants || '')}</textarea></div>
      <div class="field"><label class="switch"><input type="checkbox" id="st-cross" ${st.cross_punct === '1' ? 'checked' : ''}>跨標點匹配</label>
      <p class="hint" style="margin:4px 0 0 44px">檢索詞中間可以隔著標點，如「萬曆三年」也匹配「萬曆，三年」。換行與空格總是可以跨越。</p></div>
      <div class="field"><label class="switch"><input type="checkbox" id="st-watch" ${st.watch !== '0' ? 'checked' : ''}>實時監聽文件變化</label>
      <p class="hint" style="margin:4px 0 0 44px">文件新增、修改、改名、刪除後幾秒內更新索引（macOS FSEvents），每次啟動時再快速核對一遍。
      關閉後改為定時重新掃描：<span class="select-wrap" style="display:inline-block;vertical-align:middle"><select id="st-rescan" style="height:28px">
      ${[['0', '不掃描'], ['10', '每 10 分鐘'], ['30', '每 30 分鐘'], ['60', '每小時']].map(([v, l]) =>
        `<option value="${v}" ${String(st.rescan_minutes) === v ? 'selected' : ''}>${l}</option>`).join('')}</select></span></p></div>
      <div class="field"><label class="switch"><input type="checkbox" id="st-proj" ${st.skip_projects !== '0' ? 'checked' : ''}>跳過代碼項目</label>
      <p class="hint" style="margin:4px 0 0 44px">含 package.json、pyproject.toml、requirements.txt 等文件的文件夾整個不收錄。${S.projects.length ? `目前跳過 ${S.projects.length} 個：` : ''}</p>
      ${S.projects.length ? `<div class="proj-list">${S.projects.map(p => `<div title="${esc(p)}">${esc(p.replace(/^\/Users\/[^/]+/, '~'))}</div>`).join('')}</div>` : ''}</div>
      <div class="field"><label class="switch"><input type="checkbox" id="st-code" ${st.code_fulltext === '1' ? 'checked' : ''}>代碼與配置文件也收全文</label>
      <p class="hint" style="margin:4px 0 0 44px">json、yaml、py、js、css、sql 等默認只收文件名，免得輸入法詞庫、腳本、導出數據淹沒檢索結果。</p></div>
      <div class="field"><label>排除</label><p class="hint">每行一條：文件或文件夾名（可用 * 通配），或以 / 開頭的文件夾路徑（在文件夾上右鍵「排除此文件夾」會自動添加）。以「.」開頭的隱藏文件總是跳過。</p>
      <textarea id="st-excl">${esc(st.excludes || '')}</textarea></div>
      <div class="field"><label>字表與工具</label><div class="kv">
        <div>字表來源</div><div>${esc(meta.sources || '')}</div>
        <div>簡繁</div><div>${fmtNum(meta.st_chars)} 字 · ${fmtNum(meta.st_classes)} 組</div>
        <div>簡繁＋異體</div><div>${fmtNum(meta.full_chars)} 字 · ${fmtNum(meta.full_classes)} 組${S.customGroups ? ` · 自定義 ${S.customGroups} 組` : ''}</div>
        <div>PDF 文字</div><div>${S.tools.helper ? 'PDFKit（系統自帶）' : ''}${S.tools.helper && S.tools.pdftotext ? '，' : ''}${S.tools.pdftotext ? 'pdftotext' : ''}${!S.tools.helper && !S.tools.pdftotext ? '不可用' : ''}</div>
        <div>索引數據庫</div><div>${esc(S.db || '')}</div></div></div>`,
    buttons: [
      { label: '恢復默認設置…', onClick: async (dl, finish) => { if (await resetSettings()) finish(null); } },
      { label: '重建全部索引…', left: true, onClick: async (dl, finish) => {
        if (await confirmDialog('重建全部索引？', '會重新抽取所有文件的全文，文件多時需要較長時間。收藏、標籤、備註不受影響。', '重建')) {
          await api('reindex', {}); toast('正在重建索引…'); setTimeout(poll, 300); finish(null);
        }
      } },
      { label: '取消' }, { label: '保存', primary: true, value: 'save' }],
  });
  if (r.value !== 'save') return;
  const el = r.el;
  const patch = {
    custom_variants: $('#st-custom', el).value, cross_punct: $('#st-cross', el).checked ? '1' : '0',
    rescan_minutes: $('#st-rescan', el).value, excludes: $('#st-excl', el).value,
    watch: $('#st-watch', el).checked ? '1' : '0', skip_projects: $('#st-proj', el).checked ? '1' : '0',
    code_fulltext: $('#st-code', el).checked ? '1' : '0',
  };
  try {
    const res = await api('settings', patch);
    const renorm = patch.custom_variants !== st.custom_variants;
    Object.assign(S.settings, patch);
    S.customGroups = res.custom_groups;
    S.projects = res.projects || S.projects;
    toast(renorm ? '字表已更新，正在重建索引…' : '已保存');
    setTimeout(poll, 300);
    runSearch({ keepScroll: true, reloadPreview: true });
  } catch (e) { fail(e); }
}

// ===================================================================== 鍵盤
function moveCursor(d, extend) {
  if (!S.items.length) return;
  const ids = S.items.map(i => i.id);
  let i = ids.indexOf(S.cur);
  i = i < 0 ? 0 : Math.max(0, Math.min(ids.length - 1, i + d));
  const id = ids[i];
  if (extend) selectItem(id, { shiftKey: true });
  else selectItem(id);
  const el = $(`#res-list .item[data-id="${id}"]`);
  el && el.scrollIntoView({ block: 'nearest' });
}
document.addEventListener('keydown', e => {
  if (dialogOpen) return;
  const t = e.target;
  const typing = t.isContentEditable || t.tagName === 'TEXTAREA' || (t.tagName === 'INPUT' && t !== qEl) || t.tagName === 'SELECT';
  const inQ = t === qEl;
  const mod = e.metaKey || e.ctrlKey;
  if (mod && e.key === 'f' && !e.shiftKey && !e.altKey && openFind()) { e.preventDefault(); return; }
  if (mod && (e.key === 'k' || e.key === 'f' || e.key === 'l')) { e.preventDefault(); qEl.focus(); qEl.select(); return; }
  if (e.key === 'Escape') { if (menuEl) return closeMenu(); return; }
  if (typing) return;
  if (mod && ['1', '2', '3'].includes(e.key)) { e.preventDefault(); return setMode(['exact', 'st', 'full'][+e.key - 1]); }
  if (mod && e.key === '4') { e.preventDefault(); return setFuzzy(!S.fuzzy); }
  if (mod && e.key.toLowerCase() === 'g') { e.preventDefault(); return gotoHit(S.hit + (e.shiftKey ? -1 : 1)); }
  if (inQ) return;
  if (e.key === '/' ) { e.preventDefault(); qEl.focus(); qEl.select(); return; }
  if ((e.key === 'ArrowLeft' || e.key === 'ArrowRight') && S.pg && S.pvTab === 'orig' && $('#pg-img')) {
    e.preventDefault();
    return showPage(S.pg.page + (e.key === 'ArrowRight' ? 1 : -1));
  }
  if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { e.preventDefault(); return moveCursor(e.key === 'ArrowDown' ? 1 : -1, e.shiftKey); }
  if (!S.cur && !S.pv) return;
  const pvFolder = S.pv && S.pv.folder ? S.pv : null;
  const fid = S.pv && !S.pv.folder ? S.pv.id : (S.cur > 0 ? S.cur : null);
  if (e.key === 'Enter' || (mod && e.key === 'o')) { e.preventDefault(); return pvFolder ? openPath(pvFolder.path) : fid && doOpen(fid); }
  if (e.key === ' ') { e.preventDefault(); return fid && !pvFolder && api('quicklook', { id: fid }).catch(fail); }
  if (mod && e.key.toLowerCase() === 'r') { e.preventDefault(); return pvFolder ? openPath(pvFolder.path, true) : fid && doReveal(fid); }
  if (mod && e.key.toLowerCase() === 'd') {
    e.preventDefault();
    const ids = selIds();
    if (!ids.length) return;
    const st = ids.every(i => { const it = S.items.find(x => x.id === i); return it ? it.starred : (S.pv && S.pv.starred); });
    return doStar(ids, !st);
  }
  if (e.key === 'F2') { e.preventDefault(); return fid && !pvFolder && doRename(fid); }
  if (mod && e.key === 'Backspace') { e.preventDefault(); const ids = selIds(); return ids.length && doTrash(ids); }
  if (mod && e.key === 'a') { e.preventDefault(); S.sel = new Set(S.items.map(i => i.id)); renderResults(); renderPreview(); }
});

// ===================================================================== 分隔條
$$('.resizer').forEach(rz => {
  rz.addEventListener('mousedown', e => {
    e.preventDefault();
    const which = rz.dataset.resize;
    const startX = e.clientX;
    const startW = which === 'sidebar' ? $('#sidebar').offsetWidth : $('#results').offsetWidth;
    rz.classList.add('drag');
    document.body.style.cursor = 'col-resize';
    const move = ev => {
      let w = startW + ev.clientX - startX;
      if (which === 'sidebar') { w = Math.max(180, Math.min(380, w)); document.documentElement.style.setProperty('--sidebar-w', w + 'px'); }
      else { w = Math.max(300, Math.min(innerWidth - 520, w)); document.documentElement.style.setProperty('--list-w', w + 'px'); }
    };
    const up = () => {
      rz.classList.remove('drag');
      document.body.style.cursor = '';
      removeEventListener('mousemove', move);
      removeEventListener('mouseup', up);
      api('settings', {
        sidebar_w: $('#sidebar').offsetWidth, list_w: $('#results').offsetWidth,
      }).catch(() => {});
    };
    addEventListener('mousemove', move);
    addEventListener('mouseup', up);
  });
});

// ===================================================================== 狀態輪詢
async function refreshState() {
  try {
    const r = await api('status');
    S.status = r.status; S.stats = r.stats; S.roots = r.roots;
    S.tags = (await api('state')).tags;
    renderSidebar();
  } catch (e) { /* 忽略 */ }
}
let pollTimer = null, lastBrowseRefresh = 0;
async function poll() {
  clearTimeout(pollTimer);
  try {
    const r = await api('status');
    const was = S.status && S.status.busy;
    const prevFiles = S.stats.files;
    S.status = r.status; S.stats = r.stats;
    const rootsChanged = JSON.stringify(r.roots.map(x => [x.id, x.files, x.missing])) !== JSON.stringify(S.roots.map(x => [x.id, x.files, x.missing]));
    S.roots = r.roots;
    if (rootsChanged || prevFiles !== r.stats.files || was !== r.status.busy) renderSidebar(); else renderFoot();
    if (was && !r.status.busy) {
      try { S.projects = (await api('state')).projects || S.projects; } catch (e) { /* 忽略 */ }
      for (const rid of S.openRoots) await loadDirs(rid);
      renderSidebar();
      runSearch({ keepScroll: true });
    } else if (r.status.busy && Date.now() - lastBrowseRefresh > 3000 && !S.q.trim()) {
      lastBrowseRefresh = Date.now();
      runSearch({ keepScroll: true });
    }
  } catch (e) { /* 服務暫時無響應 */ }
  pollTimer = setTimeout(poll, S.status && S.status.busy ? 700 : 5000);
}

function renderAll() { renderSidebar(); renderResults(); renderPreview(); }

async function init() {
  try {
    const st = await api('state');
    S.roots = st.roots; S.tags = st.tags; S.stats = st.stats; S.status = st.status;
    S.settings = st.settings; S.meta = st.variant_meta; S.tools = st.tools; S.db = st.db;
    S.tagColors = st.tag_colors; S.customGroups = st.custom_groups; S.defaults = st.defaults;
    S.mode = ['exact', 'st', 'full'].includes(st.settings.mode) ? st.settings.mode : 'full';
    S.scope = st.settings.scope || 'name';
    S.projects = st.projects || [];
    S.sort = st.settings.sort || 'relevance';
    S.fuzzy = st.settings.fuzzy === '1';
    S.fzSim = ['0.9', '0.8', '0.7', '0.6', '0.5'].includes(st.settings.fuzzy_sim) ? st.settings.fuzzy_sim : '0.7';
    S.readerSize = Math.max(12, Math.min(28, +st.settings.reader_size || 16));
    if (+st.settings.sidebar_w) document.documentElement.style.setProperty('--sidebar-w', st.settings.sidebar_w + 'px');
    if (+st.settings.list_w) document.documentElement.style.setProperty('--list-w', st.settings.list_w + 'px');
  } catch (e) { fail(e); }
  $$('#mode button').forEach(b => b.classList.toggle('on', b.dataset.mode === S.mode));
  $('#scope').value = S.scope;
  $('#sort').value = S.sort;
  renderFuzzy();
  if (S.native) document.body.classList.add('native');
  renderAll();
  runSearch();
  poll();
  qEl.focus();
}
init();
