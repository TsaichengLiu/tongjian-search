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
  fuzzy: false, fzSim: '0.7', regex: false, synTab: 'basic', find: { open: false, q: '', res: null, busy: false, fz: false, re: false, sim: '0.7' },
  filter: { root: null, dir: null, kind: null, tag: null, starred: false, only: null, kinds: [], exts: [] },
  openDups: new Set(), searches: { history: [], saved: [] }, dupView: false, dupData: null, dupKeep: {}, dupCount: null,
  openKinds: new Set(),
  res: null, items: [], cur: null, sel: new Set(), anchor: null,
  pv: null, pvTab: 'text', pvTabPref: 'text', hit: 0, hitEls: [], pendingPos: null,
  dirs: {}, openRoots: new Set(), openDirs: new Set(),
  readerSize: 16, lastRescan: 0, pgLast: {}, pdfZoom: null, pdfFocus: null, docFocus: null, kwicOpen: null, kwicData: null, kwicLimit: 500,
  pendingSel: null, ctx: null,
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
const fzQS = () => (S.regex ? '&re=1' : S.fuzzy ? `&fuzzy=1&sim=${S.fzSim}` : '');
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
// 片段裡的一處命中可能分成幾段（原字／異體／模糊差異），帶位置的包在一個 .sh 裡，懸停時整處套一個框
function segsHtml(segs) {
  let out = '', open = null;
  for (const [t, k, s, e] of segs || []) {
    const at = k && s != null ? s + ':' + e : null;
    if (open !== null && at !== open) { out += '</span>'; open = null; }
    if (at !== null && open === null) { out += `<span class="sh" data-s="${s}" data-e="${e}">`; open = at; }
    out += k ? `<span class="h${k}">${esc(t)}</span>` : esc(t);
  }
  return open !== null ? out + '</span>' : out;
}
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
  menu(action) { ctxAction(action); },        // 外殼的右鍵菜單裡、通檢自己的命令
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
  const noFilter = !hasFilter() && !S.dupView;
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
    <div class="side-item${f.kind === 'notext' ? ' active' : ''}" data-act="kind" data-kind="notext" title="沒有文字層的 PDF（多為掃描件），只能檢索文件名"><span class="side-ic">${I.scan}</span><span class="label">無文字層</span><span class="count">${fmtNum(st.notext)}</span></div>
    <div class="side-item${S.dupView ? ' active' : ''}" data-act="dups" title="內容相同的文件：選留一份，其餘移到廢紙簍（會按側欄的類型、文件夾篩選縮小範圍）"><span class="side-ic">${I.copy}</span><span class="label">重複文件</span><span class="count">${S.dupCount != null ? fmtNum(S.dupCount) : ''}</span></div></div>`;
  if (S.searches.saved.length) {
    h += `<div class="side-sec"><div class="side-h"><span>已保存的檢索</span></div>`;
    for (const e of S.searches.saved) {
      h += `<div class="side-item${!S.dupView && isCurrentSearch(e) ? ' active' : ''}" data-act="saved" data-id="${e.id}" title="${esc((e.q ? '「' + e.q + '」 ' : '') + searchSummary(e).join(' · '))}">
        <span class="side-ic saved-ic">${I.starFill}</span><span class="label">${esc(e.name)}</span></div>`;
    }
    h += '</div>';
  }
  h += typesHtml(f, st);
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
  if (act === 'all') { S.dupView = false; return setFilter({ root: null, dir: null, kind: null, tag: null, starred: false, only: null, kinds: [], exts: [] }); }
  if (act === 'dups') return S.dupView ? (S.dupView = false, renderSidebar(), runSearch()) : openDupView();
  if (act === 'saved') { const en = S.searches.saved.find(x => x.id === +el.dataset.id); return en && applySearch(en); }
  if (act === 'kindrow') {                         // 點行：整類選上／取消（可與別的類、單個擴展名並用）
    const k = el.dataset.kind, kinds = S.filter.kinds || [];
    return setFilter({ kinds: kinds.includes(k) ? kinds.filter(y => y !== k) : kinds.concat([k]),
                       exts: (S.filter.exts || []).filter(x => extKind(x) !== k) });
  }
  if (act === 'ext') return toggleExt(el.dataset.ext);
  if (act === 'kind-more') {
    const k = el.dataset.kind;
    S.openKinds.has(k) ? S.openKinds.delete(k) : S.openKinds.add(k);
    return renderSidebar();
  }
  if (act === 'ext-clear') return setFilter({ kinds: [], exts: [] });
  if (act === 'ext-add') {
    const v = await promptDialog('按擴展名篩選', '輸入一個或幾個擴展名，用空格或逗號隔開，如：caj nh pdf。可與側欄裡點選的一起用。', '');
    if (!v) return;
    const add = v.split(/[\s,，、;；]+/).map(x => x.trim().replace(/^\.+/, '').toLowerCase()).filter(Boolean);
    return setFilter({ exts: Array.from(new Set((S.filter.exts || []).concat(add))) });
  }
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
  } else if (act === 'saved') {
    e.preventDefault();
    const en = S.searches.saved.find(x => x.id === +el.dataset.id);
    if (en) savedMenu(e.clientX, e.clientY, en);
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
function filterParams(p) {
  const f = S.filter;
  if (f.only) {
    if (f.only.files.length) p.set('ids', f.only.files.map(x => x.id).join(','));
    if (f.only.dirs.length) p.set('dirs', JSON.stringify(f.only.dirs));
  }
  if (f.root) p.set('root', f.root);
  if (f.dir) p.set('dir', f.dir);
  if (f.kind) p.set('kind', f.kind);
  if (f.kinds && f.kinds.length) p.set('kinds', f.kinds.join(','));
  if (f.exts && f.exts.length) p.set('exts', f.exts.map(x => x || '-').join(','));
  if (f.tag) p.set('tag', f.tag);
  if (f.starred) p.set('starred', 1);
  return p;
}
// 結果列表：合併的副本展開時，副本作為普通條目跟在後面（可選中、預覽、右鍵）
function buildItems() {
  const out = [];
  for (const it of (S.res && S.res.items) || []) {
    out.push(it);
    if (it.dups && S.openDups.has(it.id)) for (const d of it.dups) { d.dupOf = it.id; out.push(d); }
  }
  S.items = out;
}
async function runSearch(opt = {}) {
  clearTimeout(searchTimer);
  if (S.dupView) return loadDups();
  const seq = ++searchSeq;
  const p = new URLSearchParams({ q: S.q, mode: S.mode, scope: S.scope, sort: S.sort, limit: S.limit, gen: seq });
  if (S.regex) p.set('re', 1);
  else if (S.fuzzy) { p.set('fuzzy', 1); p.set('sim', S.fzSim); }
  filterParams(p);
  S.loading = true;
  const slow = setTimeout(() => { if (seq === searchSeq) renderResHead(); }, 250);
  let r;
  try { r = await api('search?' + p); } catch (e) { clearTimeout(slow); S.loading = false; renderResHead(); return fail(e); }
  clearTimeout(slow);
  if (seq !== searchSeq) return;
  S.loading = false;
  const qChanged = !S.res || S.res.q !== r.q || S.res.mode !== r.mode || S.res.fuzzy !== r.fuzzy || !S.res.regex !== !r.regex;
  S.res = r;
  buildItems();
  if (r.q) noteSearch(); else clearTimeout(histTimer);
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
  if (S.kwicOpen && !S.items.some(i => i.id === S.kwicOpen)) S.kwicOpen = null;
  if (S.kwicOpen && qChanged) { S.kwicLimit = 500; loadKwic(S.kwicOpen); }
  if (S.cur && qChanged && !opt.reloadPreview && shown === S.pv && S.pv && S.pv.id === S.cur && !S.pv.folder && S.pv.text != null) refreshHits();
  else if (S.cur && (qChanged || !shown || shown.id !== S.cur || opt.reloadPreview)) loadPreview(S.cur);
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
  if (S.dupView) {
    const d = S.dupData;
    if (d) h += `<span><b>${fmtNum(d.count)}</b> 組內容相同的文件${d.wasted ? ` · 刪去多餘的可騰出 <b>${fmtSize(d.wasted)}</b>` : ''}</span>`;
  } else if (r) {
    if (r.q) {
      h += `<span><b>${fmtNum(r.items.length)}</b> 個文件`;
      if (r.merged) h += `<span class="dup-note" title="內容相同的文件已合併成一條，點「另有 N 個副本」展開">（另合併 ${fmtNum(r.merged)} 個副本）</span>`;
      if (r.hits) h += ` · 命中 <b>${fmtNum(r.hits)}</b> 處`;
      h += ` · ${r.took < 0.01 ? '<0.01' : r.took.toFixed(2)} 秒</span>`;
      if (r.fuzzy) {
        const ft = r.fuzzy_terms || [];
        const tip = ft.length ? '模糊匹配（空白、標點不計）：\n' + ft.map(t => `「${t.term}」${t.chars} 字，最多可差 ${t.errors} 字`).join('\n')
          : '檢索詞都不足 3 字（或相似度設得太高），按原方式匹配';
        h += `<span class="fz-note" title="${esc(tip)}">≈ ${ft.length ? '模糊 ≥ ' + Math.round(r.fuzzy * 100) + '%' : '詞太短，未模糊'}</span>`;
      }
      if (r.regex) h += `<span class="re-note" title="整個檢索式（篩選詞以外）按正則表達式匹配；漢字仍按匹配方式互通">.* 正則</span>`;
    } else {
      h += `<span><b>${fmtNum(r.total)}</b> 個文件${r.merged ? `<span class="dup-note">（本頁合併 ${fmtNum(r.merged)} 個副本）</span>` : ''}</span>`;
    }
  }
  const chips = [];
  if (f.root && !f.dir) { const ro = rootOf(f.root); chips.push(['root', ro ? ro.name : '資料庫']); }
  if (f.dir) chips.push(['dir', f.dir.split('/').pop()]);
  if (S.dupView) chips.push(['dups', '查重']);
  if (f.kind) chips.push(['kind', f.kind === 'notext' ? '無文字層' : KIND_LABEL[f.kind]]);
  if (hasTypes(f)) chips.push(['exts', typesLabel(f)]);
  if (f.tag) { const t = S.tags.find(t => t.id === f.tag); chips.push(['tag', '#' + (t ? t.name : '')]); }
  if (f.starred) chips.push(['starred', '已收藏']);
  if (f.only) chips.push(['only', '範圍：' + onlyLabel(f.only)]);
  if (!S.dupView && r) {
    for (const d of r.filters || []) h += `<span class="qfchip" title="檢索式裡的篩選詞">${esc(d)}</span>`;
    for (const b of r.bad_filters || []) h += `<button class="qfchip bad" data-syn="filter" title="這個篩選詞看不懂，已忽略——點擊看寫法">${esc(b)} ？</button>`;
  }
  h += chips.map(([k, l]) => `<span class="fchip"${k === 'only' ? ' data-only title="只在這些文件／文件夾中檢索（點擊查看）"' : ''}><span>${esc(l)}</span><button data-clear="${k}" title="${k === 'dups' ? '退出查重' : '取消篩選'}">${I.x}</button></span>`).join('');
  if (!S.dupView && (S.q.trim() || hasFilter())) {
    const sv = S.searches.saved.find(isCurrentSearch);
    h += `<button class="icon-btn save-q${sv ? ' on' : ''}" data-save title="${sv ? `已保存為「${esc(sv.name)}」` : '保存這個檢索（連同匹配方式、模糊、範圍和篩選）'}">${sv ? I.starFill : I.star}</button>`;
  }
  $('#res-head').innerHTML = h;
}
$('#res-head').addEventListener('click', e => {
  const sy = e.target.closest('[data-syn]');
  if (sy) return openSyn(sy.dataset.syn);
  const b = e.target.closest('[data-clear]');
  const oc = e.target.closest('[data-only]');
  if (oc && !b) return onlyMenu(oc);
  const sb = e.target.closest('[data-save]');
  if (sb) {
    const sv = S.searches.saved.find(isCurrentSearch);
    if (sv) { const r = sb.getBoundingClientRect(); return savedMenu(r.left, r.bottom + 4, sv); }
    return saveCurrentSearch();
  }
  if (!b) return;
  const k = b.dataset.clear;
  if (k === 'dups') { S.dupView = false; renderSidebar(); return runSearch(); }
  if (k === 'exts') return setFilter({ kinds: [], exts: [] });
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
  const nd = it.dups ? it.dups.length : 0, dopen = nd && S.openDups.has(it.id);
  let h = `<div class="item${it.id === S.cur ? ' sel' : ''}${sel && S.sel.size > 1 ? ' multi' : ''}${it.dupOf ? ' dup' : ''}" data-id="${it.id}">
    <div class="it-top"><span class="badge k-${it.kind}">${esc(badgeText(it))}</span>
    <div class="it-name" title="${esc(it.name)}">${it.name_segs ? segsHtml(it.name_segs) : esc(it.name)}</div>
    ${it.dupOf ? `<span class="dup-tag" title="與上面那份內容相同">副本</span>` : ''}
    ${nd ? `<button class="dup-chip${dopen ? ' open' : ''}" data-dups="${it.id}" title="${it.dup_kind === 't' ? '抽出的文字完全相同' : '文件逐字節相同（快速比對）'}，點擊${dopen ? '收起' : '展開'}">另有 ${nd} 個副本${I.chev}</button>` : ''}
    ${it.starred ? `<span class="it-star" title="已收藏">${I.starFill}</span>` : ''}
    ${simBadge(it)}${it.hits ? `<span class="it-hits" data-kwic="${it.id}" title="全文命中：點擊列出每一處的上下文">${fmtNum(it.hits)}${it.capped ? '+' : ''}</span>` : ''}</div>
    <div class="it-meta"><span class="it-path" title="${esc(it.dir)}">${esc(relDir(it))}</span>
    ${tags.length ? `<span class="it-tags">${tags.map(t => `<span class="tag-dot" title="${esc(t.name)}" style="background:${esc(t.color)}"></span>`).join('')}</span>` : ''}
    <span>${fmtSize(it.size)}</span><span class="sep">·</span><span>${fmtDate(it.mtime)}</span></div>`;
  if (S.kwicOpen === it.id && !it.dupOf) h += kwicHtml(it);
  else if (it.snippets && it.snippets.length && !it.dupOf) {
    h += '<div class="snips">' + it.snippets.map(s =>
      `<div class="snip" data-pos="${s.pos}">${s.page ? `<span class="pg">${s.page}</span>` : ''}${segsHtml(s.segs)}</div>`).join('') + '</div>';
    if (it.hits > it.snippets.length || it.capped)
      h += `<button class="snip-all" data-kwic="${it.id}" title="在這裡列出這個文件裡每一處命中的上下文">全部 ${fmtNum(it.hits)}${it.capped ? '+' : ''} 處${I.chev}</button>`;
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
  if (S.dupView) return renderDupView(list);
  if (!S.items.length) {
    const r = S.res;
    if (r && r.re_error) {
      list.innerHTML = `<div class="empty re-err">${I.search.replace('<svg', '<svg class="big-ic"')}<h3>${esc(r.re_error)}</h3>
        <p><code>${esc(r.q)}</code></p>
        <p>改一改檢索式，或關掉檢索框裡的「<a href="#" data-regex-off>.*</a>」按普通詞檢索 · <a href="#" data-syn="regex">正則寫法</a></p></div>`;
    } else if (r && r.q) {
      list.innerHTML = `<div class="empty">${I.search.replace('<svg', '<svg class="big-ic"')}<h3>沒有找到「${esc(r.q)}」</h3>
        ${S.mode !== 'full' ? `<p>試試切換到「<a href="#" data-mode-to="full">異體</a>」模式</p>` : ''}
        ${!S.fuzzy && !S.regex ? `<p>或開啟「<a href="#" data-fuzzy-on>模糊</a>」，容許脫字、訛字</p>` : ''}
        ${S.scope !== 'all' ? '<p>或把範圍改為「名稱與全文」</p>' : ''}
        ${hasFilter() ? '<p>或取消上方的篩選條件</p>' : ''}
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
  const kw = e.target.closest('[data-kwic]');
  if (kw) return toggleKwic(+kw.dataset.kwic);
  if (e.target.closest('[data-kwic-more]')) { S.kwicLimit += 500; return loadKwic(S.kwicOpen); }
  const kl = e.target.closest('.kwic .snip');
  if (kl && !e.target.closest('.sh')) {                     // 點上下文的空白處：也跳到那一處
    const id = +kl.closest('.item').dataset.id;
    if (S.cur !== id) selectItem(id);
    return revealHit(id, +kl.dataset.s0, +kl.dataset.s1);
  }
  const dc = e.target.closest('[data-dups]');
  if (dc) {                                        // 展開／收起合併的副本
    const id = +dc.dataset.dups;
    if (S.openDups.has(id)) {
      S.openDups.delete(id);
      const rep = S.items.find(i => i.id === id);
      if (rep && rep.dups && rep.dups.some(d => d.id === S.cur || S.sel.has(d.id))) { S.cur = id; S.sel = new Set([id]); loadPreview(id); }
    } else S.openDups.add(id);
    buildItems();
    return renderResults();
  }
  if (S.dupView) {
    const kp = e.target.closest('[data-keep]');
    if (kp) { S.dupKeep[+kp.dataset.g] = +kp.dataset.keep; return renderResults(); }
    const tr = e.target.closest('[data-dg-trash]');
    if (tr) return trashDupGroup(+tr.dataset.dgTrash);
  }
  if (S.q && e.target.closest('.item')) noteSearch(true);
  if (e.target.closest('[data-act="more"]')) { S.limit += 300; return runSearch({ keepScroll: true }); }
  const mt = e.target.closest('[data-mode-to]');
  if (mt) { e.preventDefault(); return setMode(mt.dataset.modeTo); }
  if (e.target.closest('[data-fuzzy-on]')) { e.preventDefault(); return setFuzzy(true); }
  if (e.target.closest('[data-regex-off]')) { e.preventDefault(); return setRegex(false); }
  const sy = e.target.closest('[data-syn]');
  if (sy) { e.preventDefault(); return openSyn(sy.dataset.syn); }
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
// 同一個文件、只是檢索詞變了：只取新的命中位置（不重傳、不重排全文），只重畫命中有變化的段落
async function refreshHits() {
  const pv = S.pv, seq = ++pvSeq;
  let r = { spans: [], diffs: [], qchars: '' };
  if (S.q.trim()) {
    try { r = await api(`find?id=${pv.id}&q=${encodeURIComponent(S.q)}&mode=${S.mode}${fzQS()}`); }
    catch (err) { if (seq === pvSeq) loadPreview(pv.id); return; }
  }
  if (seq !== pvSeq || S.pv !== pv) return;
  let spans = r.spans, diffs = r.diffs;
  if (pv.truncated) {
    const lim = pv.text.length;
    spans = spans.filter(x => x[1] <= lim);
    diffs = diffs.filter(i => i < lim);
  }
  pv.spans = spans; pv.diffs = diffs; pv.qchars = r.qchars;
  if (S.pvTab === 'text') { if (!findActive()) remarkReader(); }
  else if (S.pvTab === 'orig') origHitsChanged();
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
  if (pref === 'orig' && t.includes('orig') && (pv.kind === 'pdf' || pv.kind === 'image' || docViewable(pv))) return 'orig';
  if (t.includes(pref) && pref !== 'orig') return pref;
  if (t.includes('text')) return 'text';
  if ((pv.kind === 'pdf' || pv.kind === 'image') && t.includes('orig')) return 'orig';
  return 'info';
}
function renderPreview() {
  const el = $('#preview');
  dropViewer();
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
  if (S.pvTab !== 'orig') dropViewer();
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
  const start = S.origPage || 0;
  S.origPage = null;
  dropViewer();
  if (!pv.exists) { body.innerHTML = `<div class="pv-msg">文件已不在原處。</div>`; return; }
  if (pv.kind === 'pdf') return renderViewer(body, start);
  if (docViewable(pv)) return renderDocView(body);
  if (pv.kind === 'image') body.innerHTML = `<div class="img-view"><img src="${rawUrl(pv.id)}" alt=""></div>`;
  else if (pv.ext === 'html' || pv.ext === 'htm') body.innerHTML = `<iframe class="frame" sandbox="" src="${rawUrl(pv.id)}"></iframe>`;
  else body.innerHTML = `<div class="pv-msg">這類文件不能在通檢裡直接顯示。<br>
    <button class="btn" data-act="ql">${I.eye}快速查看</button> <button class="btn primary" data-act="open">${I.open}打開</button></div>`;
}

// ===================================================================== Word 原件：通檢按 docx 自己排版
// 版式模型由後台從 docx 讀出（tj_docx）：每段文字都帶它在全文裡的位置，所以標註、跳轉、選字與全文、索引一字不差。
// 段落、字號、粗斜體、表格、圖片、文本框、腳註照原文件；按版心寬度連續排，分頁與 Word 不同。
let DV = null;
const DOC_VIEW_EXTS = new Set(['docx', 'dotx', 'doc', 'dot']);
const docViewable = pv => !!pv && DOC_VIEW_EXTS.has(pv.ext);
const canOrigPv = pv => !!pv && pv.exists && pv.status === 1 && ((pv.kind === 'pdf' && !pv.sparse) || docViewable(pv));
function dropDocView() {
  if (DV && DV.ro) DV.ro.disconnect();
  DV = null;
}
async function renderDocView(body) {
  const pv = S.pv;
  dropDocView();
  const dv = DV = { id: pv.id, zi: S.pdfZoom != null ? S.pdfZoom : 3, spans: [], focus: null, runs: [], box: null,
    paper: null, model: null, stale: false, ro: null, t0: performance.now(), moved: false };
  if (S.docFocus && S.docFocus.id === pv.id) { dv.focus = S.docFocus; S.pendingPos = null; }
  S.docFocus = null;
  body.innerHTML = `<div class="pgbar">
      <button class="icon-btn pg-z" data-act="dv-zout" title="縮小（−）">−</button>
      <span class="pg-zl" id="pg-zl"></span>
      <button class="icon-btn pg-z" data-act="dv-zin" title="放大（＋）">＋</button>
      <span class="vsep"></span><span class="oh" id="oh"></span>
      <span class="pg-hint" id="dv-hint">正在排版……</span>
    </div><div class="docv" id="docv" tabindex="0"></div>`;
  dv.box = $('#docv', body);
  let m = pv._doc;
  if (!m) {
    try { m = await api('docview?id=' + pv.id); } catch (err) {
      if (DV === dv) { dv.box.innerHTML = `<div class="pv-msg">${esc(err.message)}</div>`; $('#dv-hint').textContent = ''; }
      return;
    }
    pv._doc = m;                                  // 只在這個文件預覽期間留著
  }
  if (DV !== dv || S.pv !== pv) return;
  dv.model = m;
  dv.stale = !!m.stale;
  dv.spans = dv.stale ? [] : annotSpans();
  buildDocView(dv, m);
  $('#dv-hint').textContent = (dv.stale ? '文件在上次掃描後改過：重新掃描（左下 ↻）後才能標註、互跳。' :
    dv.spans.length ? '黃＝命中（雙擊回到全文）· 紅框＝當前位置 · ' : '') + '按原文件重新排版，分頁與 Word 不同' +
    (m.truncated ? '；文件很長，只排了前一部分' : '');
  dvZoom(dv.zi, true);
  renderOrigHitbar();
  bindDocView(dv);
  if (dv.focus) docFocus(dv.focus.s, dv.focus.e);
  dv.ro = new ResizeObserver(() => { if (DV === dv && dv.box.clientWidth) dvZoom(dv.zi, true); });
  dv.ro.observe(dv.box);
}
// 命中：dv.spans 裡第一個結束在 o 之後的
function dvFirst(sp, o) {
  let lo = 0, hi = sp.length;
  while (lo < hi) { const m = (lo + hi) >> 1; if (sp[m][1] <= o) lo = m + 1; else hi = m; }
  return lo;
}
// 縮放：不用 CSS zoom（WebKit 裡元素位置與點擊位置會對不上），而是把版式裡所有像素尺寸乘上 --z，真正重新排版
const dvPx = css => css.replace(/(-?\d+(?:\.\d+)?)px/g, 'calc(var(--z) * $1px)');
function buildDocView(dv, m) {
  const frag = document.createDocumentFragment();
  const st = document.createElement('style');
  st.textContent = m.css.map((c, i) => `#docv .c${i}{${dvPx(c)}}`).join('\n');
  frag.appendChild(st);
  const paper = document.createElement('div');
  paper.className = 'dpaper';
  paper.style.cssText = dvPx(`width:${m.page.w - m.page.ml - m.page.mr}px;padding:${m.page.mt}px ${m.page.mr}px ${m.page.mb}px ${m.page.ml}px;font-size:14px;${m.base}`);
  const tok = encodeURIComponent(S.token);
  const run = (r, par) => {
    if (typeof r[0] === 'number') {
      const [o, x, ci] = r, end = o + x.length, sp = dv.spans;
      let p = o, k = dvFirst(sp, o);
      const put = (a, b, hit) => {
        const el = document.createElement(hit != null ? 'mark' : 'span');
        el.className = 'c' + ci + (hit != null ? ' dh' : '');
        el.dataset.o = a;
        if (hit != null) el.dataset.i = hit;
        el.textContent = x.slice(a - o, b - o);
        par.appendChild(el);
        dv.runs.push(el);
      };
      while (p < end) {
        if (k < sp.length && sp[k][0] < end) {
          const a = Math.max(p, sp[k][0]), b = Math.min(end, sp[k][1]);
          if (a > p) put(p, a, null);
          put(a, b, k);
          p = b;
          if (sp[k][1] <= b) k++;
        } else { put(p, end, null); p = end; }
      }
    } else if (r[0] === 'ref') {
      const el = document.createElement('sup');
      el.className = 'dref';
      el.dataset.n = r[1];
      par.appendChild(el);
    } else if (r[0] === 'img') {
      const el = document.createElement('img');
      el.className = 'dimg';
      el.loading = 'lazy';
      el.decoding = 'async';
      el.alt = '';
      if (r[2] && r[3]) { el.style.width = `calc(var(--z) * ${r[2]}px)`; el.style.height = 'auto'; el.style.aspectRatio = `${r[2]} / ${r[3]}`; }
      el.onerror = () => el.classList.add('bad');
      el.src = `/docmedia/${dv.id}?p=${encodeURIComponent(r[1])}&t=${tok}`;
      par.appendChild(el);
    } else if (r[0] === 'box') {
      const el = document.createElement('div');
      el.className = 'dbox';
      blocks(r[1], el);
      par.appendChild(el);
    } else if (r[0] === 'pb') {
      const el = document.createElement('span');
      el.className = 'dpb';
      par.appendChild(el);
    } else if (r[0] === 'pic') {
      const el = document.createElement('span');
      el.className = 'dpic';
      el.title = '原文件此處有圖片或嵌入對象（doc 格式的原件視圖不顯示圖片）';
      par.appendChild(el);
    }
  };
  const blocks = (bs, par) => {
    for (const b of bs) {
      if (b[0] === 'p') {
        const el = document.createElement('div');
        el.className = 'dp c' + b[1];
        for (const r of b[2]) run(r, el);
        if (!el.firstChild) el.appendChild(document.createElement('br'));
        par.appendChild(el);
        if (b[3]) { const pb = document.createElement('div'); pb.className = 'dpb'; par.appendChild(pb); }
      } else if (b[0] === 'tbl') {
        const t = document.createElement('table'), tb = document.createElement('tbody');
        t.className = 'dtb';
        for (const row of b[1]) {
          const tr = document.createElement('tr');
          for (const [cs, rs, inner] of row) {
            const td = document.createElement('td');
            if (cs > 1) td.colSpan = cs;
            if (rs > 1) td.rowSpan = rs;
            blocks(inner, td);
            tr.appendChild(td);
          }
          tb.appendChild(tr);
        }
        t.appendChild(tb);
        par.appendChild(t);
      } else if (b[0] === 'pb') {
        const el = document.createElement('div');
        el.className = 'dpb';
        par.appendChild(el);
      }
    }
  };
  blocks(m.blocks, paper);
  if (m.notes.length) {
    const box = document.createElement('div');
    box.className = 'dnotes';
    for (const [n, bs] of m.notes) {
      const el = document.createElement('div'), num = document.createElement('span'), body = document.createElement('div');
      el.className = 'dnote';
      el.dataset.n = n;
      num.className = 'dn-num';
      num.dataset.n = n;
      blocks(bs, body);
      el.append(num, body);
      box.appendChild(el);
    }
    paper.appendChild(box);
  }
  frag.appendChild(paper);
  dv.box.textContent = '';
  dv.box.appendChild(frag);
  dv.paper = paper;
}
function dvZoom(z, fit) {
  const dv = DV;
  if (!dv || !dv.paper || !dv.model) return;
  z = Math.max(0, Math.min(PDFV_ZOOMS.length - 1, z));
  if (z === dv.zi && !fit) return;
  const box = dv.box, k = box.scrollTop / Math.max(1, box.scrollHeight);
  dv.zi = S.pdfZoom = z;
  const fitZ = Math.min(1.5, Math.max(0.3, (box.clientWidth - 28) / dv.model.page.w));
  dv.paper.style.setProperty('--z', (fitZ * PDFV_ZOOMS[z]).toFixed(3));
  const zl = $('#pg-zl');
  if (zl) zl.textContent = Math.round(PDFV_ZOOMS[z] * 100) + '%';
  if (!fit) box.scrollTop = k * box.scrollHeight;
}
// 原件上的某處（檢索片段懸停、全文雙擊、右鍵「在原件中查看此處」）：是命中就紅框標出，否則選中那段；不在視區才滾
function docFocus(s, e) {
  const dv = DV;
  if (!dv || dv.stale || !dv.paper) return;
  e = e == null ? s : e;
  dv.hitIdx = spanIndexAt(dv.spans, s);
  renderOrigHitbar();
  kwicSync(s);
  dv.box.querySelectorAll('.dfoc').forEach(x => x.classList.remove('dfoc'));
  const k = dv.spans.findIndex(sp => sp[0] < Math.max(e, s + 1) && sp[1] > s);
  let target = null;
  if (k >= 0) {
    const ms = dv.box.querySelectorAll(`mark.dh[data-i="${k}"]`);
    ms.forEach(x => x.classList.add('dfoc'));
    target = ms[0];
  } else {
    const at = o => {                                       // 含位置 o 的那段字
      let lo = 0, hi = dv.runs.length - 1;
      while (lo < hi) { const m = (lo + hi + 1) >> 1; if (+dv.runs[m].dataset.o <= o) lo = m; else hi = m - 1; }
      return dv.runs[lo];
    };
    const a = at(s), b = at(Math.max(s, e - 1));
    if (a && b && a.firstChild && b.firstChild) {
      const r = document.createRange();
      r.setStart(a.firstChild, Math.min(a.firstChild.length, Math.max(0, s - +a.dataset.o)));
      r.setEnd(b.firstChild, Math.min(b.firstChild.length, Math.max(0, e - +b.dataset.o)));
      const sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(r);
      target = a;
    }
  }
  if (target) {
    const rr = target.getBoundingClientRect();
    if (!inView(dv.box, rr)) dv.box.scrollTop += rr.top - dv.box.getBoundingClientRect().top - dv.box.clientHeight / 3;
  }
}
function bindDocView(dv) {
  const box = dv.box;
  box.addEventListener('mousedown', e => {
    if (e.detail > 1 && e.target.closest('mark.dh')) e.preventDefault();   // 雙擊命中：不選詞
  });
  box.addEventListener('dblclick', e => {
    const m = e.target.closest('mark.dh');
    if (!m || dv.stale) return;
    const sp = dv.spans[+m.dataset.i];
    if (!sp) return;
    e.preventDefault();
    window.getSelection().removeAllRanges();
    gotoText(sp[0], sp[1]);
  });
  box.addEventListener('click', e => {
    const ref = e.target.closest('sup.dref');
    if (!ref) return;
    const n = [...box.querySelectorAll('.dnote')].find(x => x.dataset.n === ref.dataset.n);
    if (n) n.scrollIntoView({ block: 'center' });
  });
  box.addEventListener('wheel', e => {
    if (!e.ctrlKey) return;
    e.preventDefault();
    dv.pinch = (dv.pinch || 0) + e.deltaY;
    if (Math.abs(dv.pinch) > 30) { dvZoom(dv.zi + (dv.pinch < 0 ? 1 : -1)); dv.pinch = 0; }
  }, { passive: false });
  box.addEventListener('keydown', e => {
    const k = e.key;
    if (k === '+' || k === '=') dvZoom(dv.zi + 1);
    else if (k === '-' || k === '_') dvZoom(dv.zi - 1);
    else if (k === '0') dvZoom(3);
    else return;
    e.preventDefault();
    e.stopPropagation();
  });
  box.addEventListener('contextmenu', e => {
    const ts = origSelection(), sel = window.getSelection();
    if (ts && selectionUnder(sel, e.clientX, e.clientY)) {
      e.stopPropagation();
      S.ctx = { kind: 'orig', id: S.pv.id, sel: ts.text, s: ts.s, e: ts.e };
      if (S.native) return nativeMenu({ kind: 'orig', sel: ts.text.slice(0, 80) });
      e.preventDefault();
      return origSelMenu(e.clientX, e.clientY);
    }
    e.preventDefault();
    let o = null;
    const cr = !dv.stale && document.caretRangeFromPoint && document.caretRangeFromPoint(e.clientX, e.clientY);
    if (cr && cr.startContainer.nodeType === 3) {
      const el = cr.startContainer.parentNode;
      if (el && el.dataset && el.dataset.o != null) o = +el.dataset.o + cr.startOffset;
    }
    showMenu(e.clientX, e.clientY, [
      o != null && { label: '在全文中查看此處', icon: 'page', act: () => gotoText(o, o) },
      o != null && { sep: true },
      { label: '放大', key: '+', act: () => dvZoom(dv.zi + 1) },
      { label: '縮小', key: '−', act: () => dvZoom(dv.zi - 1) },
      { label: '適合寬度', key: '0', act: () => dvZoom(3) },
      { sep: true },
      { label: '用默認程序打開', icon: 'open', act: () => doOpen(S.pv.id) },
    ]);
  });
}

// ===================================================================== 原件：逐頁圖片，可標註
// 頁面圖和文字層的逐字位置都由後台現算（輔助進程用完即退，結果只在內存裡留最近幾頁）。
// 只為視區上下各一屏內的頁建元素（幾千頁的書也只有十來個），離開即刪掉、交還內存；滾動條由一條等高的軌道撐出。
// 標註：命中（黃底）、當前位置（紅框：從全文或檢索片段跳過來的那一處）。
const PDFV_ZOOMS = [0.5, 0.67, 0.8, 1, 1.25, 1.5, 2, 2.5, 3];
const SVGNS = 'http://www.w3.org/2000/svg';
const CHEV_L = I.chev.replace('<svg', '<svg style="transform:rotate(180deg)"');
let V = null;
function dropViewer() {
  dropDocView();
  if (!V) return;
  if (V.ro) V.ro.disconnect();
  for (const pg of V.live.values()) clearTimeout(pg.timer);
  clearTimeout(V.sraf);
  V = null;
}
// 全文（UTF-16 下標）的分頁
function pageStarts(pv) {
  if (pv._ps) return pv._ps;
  const t = pv.text || '', ps = [0];
  for (let i = t.indexOf('\f'); i >= 0; i = t.indexOf('\f', i + 1)) ps.push(i + 1);
  return (pv._ps = ps);
}
function pageOfOffset(pv, o) {
  const ps = pageStarts(pv);
  let lo = 0, hi = ps.length - 1;
  while (lo < hi) { const m = (lo + hi + 1) >> 1; if (ps[m] <= o) lo = m; else hi = m - 1; }
  return lo + 1;
}
function pageHasText(pv, n) {
  const ps = pageStarts(pv), t = pv.text || '';
  if (n > ps.length) return false;
  return /\S/.test(t.slice(ps[n - 1], n < ps.length ? ps[n] - 1 : t.length));
}
function annotSpans() {
  const pv = S.pv;
  const src = findActive() ? (findReady() ? S.find.res.spans : []) : (pv.spans || []);
  return mergeSpans(src);
}
function renderViewer(body, start) {
  const pv = S.pv, n = Math.max(1, pv.pages || 1);
  V = { id: pv.id, n, zi: S.pdfZoom != null ? S.pdfZoom : 3, pa: 1.4142, paSet: false, aspects: {}, live: new Map(),
    marksCache: new Map(), pad: 12, gap: 12, cur: 1, marked: 0, unmarked: 0, sraf: 0, ro: null,
    hasText: pv.status === 1 && pv.text != null && !pv.sparse, spans: annotSpans(), focus: null, focused: false, moved: false,
    t0: performance.now(), rehover: null };
  if (S.pdfFocus && S.pdfFocus.id === pv.id) { V.focus = S.pdfFocus; S.pendingPos = null; }
  S.pdfFocus = null;
  body.innerHTML = `<div class="pgbar">
      <button class="icon-btn" data-act="pg-prev" title="上一頁（←）">${CHEV_L}</button>
      <span class="pg-pos">第 <input id="pg-no" type="text" inputmode="numeric" autocomplete="off" value="1"> / ${fmtNum(n)} 頁</span>
      <button class="icon-btn" data-act="pg-next" title="下一頁（→）">${I.chev}</button>
      <span class="vsep"></span>
      <button class="icon-btn pg-z" data-act="pg-zout" title="縮小（−）">−</button>
      <span class="pg-zl" id="pg-zl"></span>
      <button class="icon-btn pg-z" data-act="pg-zin" title="放大（＋）">＋</button>
      <span class="vsep"></span><span class="oh" id="oh"></span>
      <span class="pg-hint" id="pg-hint"></span>
    </div><div class="pdfv" id="pdfv" tabindex="0"><div class="pdfv-track"></div></div>`;
  V.box = $('#pdfv', body);
  V.track = V.box.firstChild;
  $('#pg-zl', body).textContent = Math.round(PDFV_ZOOMS[V.zi] * 100) + '%';
  layoutViewer();
  const p0 = start || (V.focus ? pageOfOffset(pv, V.focus.s) : 0) || S.pgLast[pv.id] || 1;
  V.box.scrollTop = pageTop(Math.max(1, Math.min(n, p0))) - 10;
  updHint();
  renderOrigHitbar();
  bindViewer(V.box);
  syncPages();
  const v = V;
  V.ro = new ResizeObserver(() => { if (V === v && V.box.clientWidth) relayout(); });   // 拖動分隔條、縮放窗口
  V.ro.observe(V.box);
}
const pageTop = k => V.pad + (k - 1) * V.step;
function layoutViewer() {
  const inner = Math.max(200, V.box.clientWidth - 2 * V.pad);
  V.pageW = Math.max(120, Math.round(inner * PDFV_ZOOMS[V.zi]));
  V.slotH = Math.round(V.pageW * V.pa);
  V.step = V.slotH + V.gap;
  V.left = V.pad + Math.max(0, Math.round((inner - V.pageW) / 2));
  V.track.style.height = (2 * V.pad + V.n * V.step - V.gap) + 'px';
  V.track.style.width = (Math.max(inner, V.pageW) + 2 * V.pad) + 'px';
  for (const pg of V.live.values()) placePage(pg);
}
function placePage(pg) {
  const s = pg.el.style;
  s.top = pageTop(pg.n) + 'px'; s.left = V.left + 'px'; s.width = V.pageW + 'px'; s.height = V.slotH + 'px';
  // 這一頁自己的高寬比（與首頁不同時在槽位內縮放、居中）
  const a = pg.aspect || V.pa;
  let w = V.pageW, h = w * a;
  if (h > V.slotH) { h = V.slotH; w = h / a; }
  const t = pg.inner.style;
  t.width = w + 'px'; t.height = h + 'px'; t.left = (V.pageW - w) / 2 + 'px';
  t.setProperty('--pw', w + 'px');
}
function relayout() {
  if (!V) return;
  const k = viewPage(), frac = (V.box.scrollTop - pageTop(k)) / V.step;
  layoutViewer();
  V.box.scrollTop = pageTop(k) + frac * V.step;
  syncPages();
  for (const pg of V.live.values()) if (pg.w && pg.w < wantWidth()) loadPage(V, pg);
}
function viewPage() {
  return Math.min(V.n, Math.max(1, Math.floor((V.box.scrollTop + V.box.clientHeight * 0.35 - V.pad) / V.step) + 1));
}
function updPage() {
  if (!V) return;
  V.cur = viewPage();
  S.pgLast[V.id] = V.cur;
  const go = $('#pg-no');
  if (go && document.activeElement !== go) go.value = V.cur;
}
// 只保留視區上下各一屏內的頁；新進入的停留片刻才請求圖片（快速翻過的頁不請求）
function syncPages() {
  if (!V) return;
  const top = V.box.scrollTop, h = V.box.clientHeight || 600;
  const a = Math.max(1, Math.floor((top - h - V.pad) / V.step) + 1);
  const b = Math.min(V.n, Math.floor((top + 2 * h - V.pad) / V.step) + 1);
  const sel = window.getSelection(), hold = sel && !sel.isCollapsed ? [sel.anchorNode, sel.focusNode] : [];
  for (const [k, pg] of V.live) {
    if ((k < a - 1 || k > b + 1) && !hold.some(nd => nd && pg.el.contains(nd))) { clearTimeout(pg.timer); pg.el.remove(); V.live.delete(k); }
  }
  const v = V;
  for (let k = a; k <= b; k++) {
    if (V.live.has(k)) continue;
    const el = document.createElement('div');
    el.className = 'pdfv-page';
    el.innerHTML = `<div class="pdfv-pg"><span class="pdfv-num">${k}</span><img alt="" draggable="false" decoding="async"></div>`;
    const pg = { n: k, el, inner: el.firstChild, img: el.firstChild.lastChild, w: 0, aspect: V.aspects[k] || 0,
      marks: null, asked: false, svg: null, tl: null, timer: 0 };
    pg.img.onload = () => { setAspect(pg, pg.img.naturalHeight / Math.max(1, pg.img.naturalWidth)); askBoxes(v, pg); };
    pg.img.onerror = () => { if (pg.img.getAttribute('src')) { pg.w = 0; pg.inner.classList.add('err'); } };
    placePage(pg);
    V.track.appendChild(el);
    V.live.set(k, pg);
    pg.timer = setTimeout(() => loadPage(v, pg), 120);
  }
  updPage();
}
function updHint() {
  const el = $('#pg-hint');
  if (!el || !V) return;
  const pv = S.pv;
  if (pv.sparse || pv.status !== 1) el.textContent = '掃描件：沒有可標註的文字層';
  else if (V.marked) el.textContent = (V.spans.length ? '黃＝命中（雙擊回到全文）· ' : '') + '紅框＝當前位置';
  else if (V.unmarked) el.textContent = '這幾頁的文字層沒有位置信息，無法標註';
  else el.textContent = '';
}
function wantWidth() {
  return Math.min(3200, Math.max(600, Math.ceil(V.pageW * (window.devicePixelRatio || 1) / 200) * 200));
}
function loadPage(v, pg) {
  if (V !== v || V.live.get(pg.n) !== pg) return;
  const w = wantWidth();
  if (pg.w < w) {
    pg.w = w;
    pg.inner.classList.remove('err');
    pg.img.src = `/page/${v.id}/${pg.n}?w=${w}&t=${encodeURIComponent(S.token)}`;
  }
}
function askBoxes(v, pg) {
  if (V !== v || V.live.get(pg.n) !== pg || !v.hasText || pg.asked || !pageHasText(S.pv, pg.n)) return;
  pg.asked = true;
  const got = d => {
    if (V !== v) return;
    if (!v.marksCache.has(pg.n)) {
      v.marksCache.set(pg.n, d);
      if (v.marksCache.size > 40) v.marksCache.delete(v.marksCache.keys().next().value);   // 只記最近四十頁
      if (d.boxes.some(Boolean)) v.marked++; else v.unmarked++;
      updHint();
    }
    pg.marks = d;
    drawMarks(pg);
    if (pg.inner.matches(':hover')) buildTextLayer(pg);
  };
  const c = v.marksCache.get(pg.n);
  if (c) return got(c);
  api(`pageboxes?id=${v.id}&p=${pg.n}`).then(d => got({ o0: d.o0, boxes: d.boxes.map(b => b && [b[0] / 1e4, b[1] / 1e4, b[2] / 1e4, b[3] / 1e4]) }))
    .catch(() => {});
}
// 第一頁載入後以它的高寬比作為各頁槽位的高寬比；眼前的內容不動
function setAspect(pg, a) {
  if (!V || !a) return;
  V.aspects[pg.n] = pg.aspect = a;
  if (!V.paSet) {
    V.paSet = true;
    if (Math.abs(a - V.pa) > 1e-3) { V.pa = a; relayout(); }
  }
  placePage(pg);
  drawMarks(pg);
}
function toPage(n) {
  if (!V || n < 1 || n > V.n) return;
  V.moved = true;
  V.box.scrollTop = pageTop(n) - 10;
  syncPages();
}
function vZoom(z) {
  if (!V) return;
  z = Math.max(0, Math.min(PDFV_ZOOMS.length - 1, z));
  if (z === V.zi) return;
  const box = V.box, cx = (box.scrollLeft + box.clientWidth / 2) / Math.max(1, box.scrollWidth);
  V.zi = S.pdfZoom = z;
  $('#pg-zl').textContent = Math.round(PDFV_ZOOMS[z] * 100) + '%';
  relayout();
  box.scrollLeft = cx * box.scrollWidth - box.clientWidth / 2;
}
// 跳到某處（檢索片段懸停、全文定位）：翻到那一頁，標註到了把它紅框標出、移到視區上部
function focusOrig(s, e) {
  if (!V) return;
  V.hitIdx = spanIndexAt(V.spans, s);
  renderOrigHitbar();
  kwicSync(s);
  V.focus = { id: V.id, s, e: e == null ? s : e };
  V.focused = false;
  V.moved = false;
  const k = pageOfOffset(S.pv, s), top = pageTop(k), st = V.box.scrollTop, h = V.box.clientHeight;
  if (!V.live.has(k) || top + V.slotH < st + h * 0.1 || top > st + h * 0.8) {
    V.box.scrollTop = top - 10;
    syncPages();
  }
  for (const pg of V.live.values()) if (pg.marks) drawMarks(pg);
}
// ---- 原件上的命中：上一處／下一處（PDF 與 Word 通用）
const spanIndexAt = (sp, s) => { const k = (sp || []).findIndex(x => x[1] > s); return k >= 0 && sp[k][0] <= s + 1 ? k : -1; };
function renderOrigHitbar() {
  const el = $('#oh'), st = V || DV;
  if (!el || !st) return;
  const n = (st.spans || []).length;
  el.innerHTML = n ? `<button class="icon-btn" data-act="oh-prev" title="上一處命中（⇧⌘G）">${I.up}</button>
    <span class="oh-pos">${st.hitIdx != null && st.hitIdx >= 0 ? `第 <b>${st.hitIdx + 1}</b> / ` : ''}${fmtNum(n)} 處</span>
    <button class="icon-btn" data-act="oh-next" title="下一處命中（⌘G）">${I.down}</button><span class="vsep"></span>` : '';
}
function origHit(d) {
  const st = V || DV, sp = st && st.spans;
  if (!sp || !sp.length) return;
  const k = st.hitIdx == null || st.hitIdx < 0 ? (d > 0 ? 0 : sp.length - 1) : (st.hitIdx + d + sp.length) % sp.length;
  if (V) focusOrig(sp[k][0], sp[k][1]); else docFocus(sp[k][0], sp[k][1]);
}
// 檢索詞變了：原件上的標註跟著換（PDF 只重畫視區附近的頁；Word 稍候重排並保持位置）
function origHitsChanged() {
  if (V) {
    V.spans = annotSpans();
    V.hitIdx = -1;
    V.focus = null;
    for (const pg of V.live.values()) if (pg.marks) drawMarks(pg);
    updHint();
    renderOrigHitbar();
  }
  if (DV && DV.model) {
    const dv = DV;
    clearTimeout(dv.rt);
    dv.rt = setTimeout(() => {
      if (DV !== dv) return;
      const top = dv.box.scrollTop;
      dv.spans = dv.stale ? [] : annotSpans();
      dv.runs = [];
      dv.hitIdx = -1;
      buildDocView(dv, dv.model);
      dvZoom(dv.zi, true);
      dv.box.scrollTop = top;
      renderOrigHitbar();
    }, 300);
  }
}
// 相鄰的逐字框合成行（橫排）或列（豎排）
function mergeBoxes(list) {
  const out = [];
  let r = null, last = null;
  for (const b of list) {
    if (!b) { r = last = null; continue; }
    if (last) {
      const [x, y, w, hh] = b, [lx, ly, lw, lh] = last;
      const size = Math.max(Math.min(hh, lh), Math.min(w, lw));
      const vOver = Math.min(y + hh, ly + lh) - Math.max(y, ly), hOver = Math.min(x + w, lx + lw) - Math.max(x, lx);
      const hGap = x - (lx + lw), vGap = y - (ly + lh);
      const row = vOver > 0.5 * Math.min(hh, lh) && hGap > -0.5 * size && hGap < 0.5 * size;
      const col = hOver > 0.5 * Math.min(w, lw) && vGap > -0.5 * size && vGap < 0.5 * size;
      if (row || col) {
        const nx = Math.min(r[0], x), ny = Math.min(r[1], y);
        r[2] = Math.max(r[0] + r[2], x + w) - nx; r[3] = Math.max(r[1] + r[3], y + hh) - ny; r[0] = nx; r[1] = ny;
        last = b;
        continue;
      }
    }
    r = b.slice();
    last = b;
    out.push(r);
  }
  return out;
}
function spanBoxes(pg, s, e) {
  const { o0, boxes } = pg.marks, t = S.pv.text, list = [];
  for (let k = Math.max(s, o0), hi = Math.min(e, o0 + boxes.length); k < hi; k++) list.push(/\s/.test(t[k]) ? null : boxes[k - o0]);
  return mergeBoxes(list);
}
// 文本塊＝抽出文字裡的一行（豎排即一列）；右鍵「在全文中查看這段」用
function pageBlocks(pg) {
  if (pg.blocks) return pg.blocks;
  const { o0, boxes } = pg.marks, t = S.pv.text, out = [];
  let a = 0;
  for (let k = 0; k <= boxes.length; k++) {
    const c = t[o0 + k];
    if (k === boxes.length || c === '\n' || c === '\r') {
      if (k > a) {
        const list = [];
        for (let j = a; j < k; j++) if (boxes[j] && !/\s/.test(t[o0 + j])) list.push(boxes[j]);
        const rects = mergeBoxes(list);
        if (rects.length) out.push({ a: o0 + a, b: o0 + k, rects });
      }
      a = k + 1;
    }
  }
  return (pg.blocks = out);
}
function blockAt(pg, nx, ny) {
  if (!pg.marks) return null;
  const pad = 0.004;
  for (const bl of pageBlocks(pg)) {
    for (const r of bl.rects) {
      if (nx >= r[0] - pad && nx <= r[0] + r[2] + pad && ny >= r[1] - pad && ny <= r[1] + r[3] + pad) return bl;
    }
  }
  return null;
}
function addRect(svg, H, b, cls, pad) {
  const r = document.createElementNS(SVGNS, 'rect');
  r.setAttribute('x', (b[0] * 1000 - pad).toFixed(1)); r.setAttribute('y', (b[1] * H - pad).toFixed(1));
  r.setAttribute('width', (b[2] * 1000 + 2 * pad).toFixed(1)); r.setAttribute('height', (b[3] * H + 2 * pad).toFixed(1));
  r.setAttribute('class', cls);
  svg.appendChild(r);
}
function drawMarks(pg) {
  if (!V || !pg.marks || !pg.aspect || V.live.get(pg.n) !== pg) return;
  if (pg.svg) pg.svg.remove();
  const { o0, boxes } = pg.marks, end = o0 + boxes.length, H = 1000 * pg.aspect;
  const svg = document.createElementNS(SVGNS, 'svg');
  svg.setAttribute('viewBox', `0 0 1000 ${H.toFixed(1)}`);
  svg.setAttribute('preserveAspectRatio', 'none');
  pg.hits = [];
  for (const [s, e] of V.spans) {
    if (e <= o0) continue;
    if (s >= end) break;
    const rects = spanBoxes(pg, s, e);
    rects.forEach(b => addRect(svg, H, b, 'pm-hit', 1));
    if (rects.length) pg.hits.push({ s, e, rects });
  }
  let foc = [];
  if (V.focus && V.focus.s < end && Math.max(V.focus.e, V.focus.s + 1) > o0) {
    if (V.focus.e > V.focus.s) foc = spanBoxes(pg, V.focus.s, V.focus.e);
    else {
      const bl = pageBlocks(pg).find(x => V.focus.s >= x.a && V.focus.s <= x.b);
      foc = bl ? bl.rects : [];
    }
    foc.forEach(b => addRect(svg, H, b, 'pm-focus', 3));
    if (foc.length && V.focus.e > V.focus.s && !pg.hits.some(x => x.s === V.focus.s)) pg.hits.push({ s: V.focus.s, e: V.focus.e, rects: foc });
  }
  pg.hovG = document.createElementNS(SVGNS, 'g');
  svg.appendChild(pg.hovG);
  pg.svg = svg;
  pg.inner.appendChild(svg);
  markTl(pg);
  if (pg.tl && pg.tl.dataset.a !== String(pg.aspect)) { pg.tl.remove(); pg.tl = null; buildTextLayer(pg); }   // 高寬比變了：字號重算
  if (foc.length && !V.focused && !V.moved) {
    V.focused = true;
    const y0 = pageTop(pg.n) + foc[0][1] * pg.inner.offsetHeight, y1 = y0 + foc[0][3] * pg.inner.offsetHeight;
    const st = V.box.scrollTop, h = V.box.clientHeight;
    if (y0 < st + h * 0.1 || y1 > st + h * 0.8) {
      V.box.scrollTop = y0 - h / 3;
      syncPages();
    }
  }
  if (V.rehover) V.rehover();
}
// ---- 原件的文字層：每個字一個透明的 span，疊在頁面圖上它的位置，用來拖選、拷貝、右鍵
// 只為鼠標移到過的頁建（頁移出視區即連同頁面元素刪掉），一般只有一兩頁；字號按頁寬的比例，縮放時不用重建。
function buildTextLayer(pg) {
  if (pg.tl || !pg.marks || !pg.aspect || !V || V.live.get(pg.n) !== pg) return;
  const { o0, boxes } = pg.marks, t = S.pv.text || '', a = pg.aspect;
  let h = '';
  for (let k = 0; k < boxes.length; k++) {
    const b = boxes[k], c = t.charCodeAt(o0 + k);
    if (isNaN(c)) break;
    const two = c >= 0xd800 && c <= 0xdbff, ch = t.substr(o0 + k, two ? 2 : 1);
    if (b && !/\s/.test(ch)) {
      const fs = Math.min(b[2], b[3] * a);                 // 以頁寬為單位的字號：框的寬、高取小者
      h += `<span data-o="${o0 + k}" style="left:${(b[0] * 100).toFixed(2)}%;top:${(b[1] * 100).toFixed(2)}%;` +
        `font-size:calc(var(--pw) * ${fs.toFixed(4)})">${esc(ch)}</span>`;
    }
    if (two) k++;
  }
  if (!h) return;
  const tl = document.createElement('div');
  tl.className = 'pdfv-tl';
  tl.dataset.a = String(a);
  tl.innerHTML = h;
  pg.inner.insertBefore(tl, pg.svg || null);
  pg.tl = tl;
  markTl(pg);
}
// 文字層裡屬於命中的字：手形光標（雙擊可回到全文）
function markTl(pg) {
  if (!pg.tl) return;
  const hs = pg.hits || [];
  for (const sp of pg.tl.children) {
    const o = +sp.dataset.o;
    sp.classList.toggle('h', hs.some(x => o >= x.s && o < Math.max(x.e, x.s + 1)));
  }
}
// 原件上選中的文字 → 全文裡的範圍（按全文取，保留換行）
function origSelection() {
  const box = V ? V.box : DV && !DV.stale ? DV.box : null;
  if (!box || !S.pv || !S.pv.text) return null;
  const sel = window.getSelection();
  if (!sel || sel.isCollapsed || !sel.rangeCount || !box.contains(sel.anchorNode)) return null;
  const r = sel.getRangeAt(0);
  // 選區端點 → 全文位置：在一段字的文字節點裡、在帶位置的元素上、或在兩段字之間（容器加子節點序號）
  const spanPos = (sp, after) => +sp.dataset.o + (after ? sp.textContent.length : 0);
  const pick = (el, last) => !el || el.nodeType !== 1 ? null : el.dataset && el.dataset.o != null ? el :
    last ? [...el.querySelectorAll('[data-o]')].pop() : el.querySelector('[data-o]');
  const at = (node, off) => {
    if (!node) return null;
    if (node.nodeType === 3) {
      const sp = node.parentNode;
      return sp && sp.dataset && sp.dataset.o != null ? +sp.dataset.o + Math.min(off, node.length) : null;
    }
    if (node.dataset && node.dataset.o != null) return spanPos(node, off > 0);
    const kids = node.childNodes;
    if (!kids || !kids.length) return null;
    if (off < kids.length) { const el = pick(kids[off], false); if (el) return spanPos(el, false); }
    const el = pick(kids[Math.min(off, kids.length) - 1], true);
    return el ? spanPos(el, true) : null;
  };
  let s = at(r.startContainer, r.startOffset), e = at(r.endContainer, r.endOffset);
  if (s == null || e == null) {                            // 選區端點落在字外：按選中的字定
    let lo = Infinity, hi = -1;
    const all = V ? [...V.live.values()].flatMap(pg => pg.tl ? [...pg.tl.children] : []) : DV.runs;
    for (const sp of all) {
      if (!sel.containsNode(sp, false)) continue;   // 整個字在選區裡才算
      const o = +sp.dataset.o;
      lo = Math.min(lo, o); hi = Math.max(hi, o + sp.textContent.length);
    }
    if (hi < 0) return null;
    if (s == null) s = lo;
    if (e == null) e = hi;
  }
  if (e <= s) return null;
  const text = S.pv.text.slice(s, e).replace(/\f/g, '\n').trim();
  return text ? { s, e, text } : null;
}
document.addEventListener('copy', e => {
  const ts = origSelection();
  if (!ts) return;
  e.preventDefault();
  e.clipboardData.setData('text/plain', ts.text);
});
// 瀏覽器模式（沒有原生外殼）下原件選字的菜單
function origSelMenu(x, y) {
  const c = S.ctx, short = c.sel.length > 12 ? c.sel.slice(0, 12) + '…' : c.sel;
  showMenu(x, y, [
    { label: '拷貝', icon: 'copy', act: () => ctxAction('copy') },
    { label: '拷貝（附出處）', icon: 'copy', act: () => ctxAction('cite') },
    { sep: true },
    { label: `在通檢中檢索「${short}」`, icon: 'search', act: () => ctxAction('search') },
    { label: `在本文件內查找「${short}」`, icon: 'search', act: () => ctxAction('find') },
    { label: '在全文中查看此處', icon: 'page', act: () => ctxAction('text') },
  ]);
}
function hitAt(e) {
  const p = pagePoint(e);
  if (!p || !p.pg.hits) return null;
  const pad = 0.004, { nx, ny } = p;
  for (const h of p.pg.hits) {
    if (h.rects.some(r => nx >= r[0] - pad && nx <= r[0] + r[2] + pad && ny >= r[1] - pad && ny <= r[1] + r[3] + pad)) {
      return { pg: p.pg, s: h.s, e: h.e, rects: h.rects };
    }
  }
  return null;
}
function pagePoint(e) {
  const inner = e.target.closest && e.target.closest('.pdfv-pg');
  if (!inner || !V) return null;
  const k = +inner.parentNode.dataset.n || 0;
  const pg = [...V.live.values()].find(p => p.inner === inner);
  if (!pg) return null;
  const r = inner.getBoundingClientRect();
  return { pg, nx: (e.clientX - r.left) / r.width, ny: (e.clientY - r.top) / r.height, k };
}
function bindViewer(box) {
  const v = V;
  const go = $('#pg-no');
  go.addEventListener('keydown', e => {
    if (e.key === 'Enter') { e.preventDefault(); const k = parseInt(go.value, 10); if (k) toPage(Math.max(1, Math.min(v.n, k))); go.blur(); box.focus({ preventScroll: true }); }
    else if (e.key === 'Escape') { go.value = v.cur; go.blur(); }
  });
  go.addEventListener('focus', () => go.select());
  // 懸停在命中上：加框（雙擊可回到全文）。按指針最後的位置重算——鼠標不動而頁面滾動、標註重繪後也對
  let hov = null, px = -1, py = -1, raf = 0;
  const setHov = h => {
    if (hov && h && hov.pg === h.pg && hov.s === h.s && hov.g === h.pg.hovG && hov.g && hov.g.firstChild) return;
    if (hov && hov.pg.hovG) { hov.pg.hovG.textContent = ''; hov.pg.inner.removeAttribute('title'); }
    hov = h;
    box.classList.toggle('over-hit', !!h);
    if (h && h.pg.hovG) {
      h.g = h.pg.hovG;
      const H = 1000 * h.pg.aspect;
      h.rects.forEach(b => { addRect(h.g, H, b, 'pm-hov-halo', 4); addRect(h.g, H, b, 'pm-hov', 4); });
      h.pg.inner.title = '雙擊：在全文中查看';
    }
  };
  const updHov = () => {
    raf = 0;
    if (V !== v || px < 0) return;
    const t = document.elementFromPoint(px, py);
    if (!t || !box.contains(t)) return setHov(null);
    const at = { target: t, clientX: px, clientY: py }, p = pagePoint(at);
    if (p && !p.pg.tl) buildTextLayer(p.pg);               // 文字層只給鼠標所在的頁建（選字總從移動鼠標開始）
    setHov(hitAt(at));
  };
  v.rehover = () => { if (px >= 0 && !raf) raf = requestAnimationFrame(updHov); };
  box.addEventListener('mousemove', e => { px = e.clientX; py = e.clientY; v.rehover(); });
  box.addEventListener('mouseleave', () => { px = -1; if (V === v) setHov(null); });
  box.addEventListener('dblclick', e => {
    const h = hitAt(e);
    if (h) { e.preventDefault(); window.getSelection().removeAllRanges(); gotoText(h.s, h.e); }
  });
  box.addEventListener('scroll', () => {
    v.rehover();
    if (!v.sraf) v.sraf = setTimeout(() => { v.sraf = 0; if (V === v) syncPages(); }, 50);
  });
  // 拖動平移
  box.addEventListener('mousedown', e => {
    const r = box.getBoundingClientRect();
    if (e.button !== 0 || e.clientX - r.left > box.clientWidth || e.clientY - r.top > box.clientHeight) return;
    box.focus({ preventScroll: true });
    if (e.target.closest('.pdfv-tl span')) return;        // 在字上按下：交給瀏覽器選字
    e.preventDefault();
    if (!e.shiftKey) window.getSelection().removeAllRanges();
    const sx = e.clientX, sy = e.clientY, sl = box.scrollLeft, st = box.scrollTop;
    let moved = false;
    const move = ev => {
      if (!moved && Math.abs(ev.clientX - sx) + Math.abs(ev.clientY - sy) < 4) return;
      moved = v.moved = true;
      box.classList.add('grabbing');
      box.scrollLeft = sl - (ev.clientX - sx); box.scrollTop = st - (ev.clientY - sy);
    };
    const up = () => {
      window.removeEventListener('mousemove', move);
      window.removeEventListener('mouseup', up);
      box.classList.remove('grabbing');
    };
    window.addEventListener('mousemove', move);
    window.addEventListener('mouseup', up);
  });
  let pinch = 0;
  box.addEventListener('wheel', e => {
    if (performance.now() - v.t0 > 400) v.moved = true;  // 剛跳過來時的慣性滾動不打斷定位
    if (!e.ctrlKey) return;
    e.preventDefault();
    pinch += e.deltaY;
    if (Math.abs(pinch) > 30) { vZoom(v.zi + (pinch < 0 ? 1 : -1)); pinch = 0; }
  }, { passive: false });
  box.addEventListener('keydown', e => {
    const k = e.key;
    if (k === 'ArrowRight' || k === 'PageDown') toPage(v.cur + 1);
    else if (k === 'ArrowLeft' || k === 'PageUp') toPage(v.cur - 1);
    else if (k === 'Home') toPage(1);
    else if (k === 'End') toPage(v.n);
    else if (k === '+' || k === '=') vZoom(v.zi + 1);
    else if (k === '-' || k === '_') vZoom(v.zi - 1);
    else if (k === '0') vZoom(3);
    else { if (k === 'ArrowUp' || k === 'ArrowDown' || k === ' ') v.moved = true; return; }
    e.preventDefault();
    e.stopPropagation();
  });
  box.addEventListener('contextmenu', e => {
    const ts = origSelection(), sel = window.getSelection();
    if (ts && selectionUnder(sel, e.clientX, e.clientY)) {
      e.stopPropagation();
      S.ctx = { kind: 'orig', id: S.pv.id, sel: ts.text, s: ts.s, e: ts.e };
      if (S.native) return nativeMenu({ kind: 'orig', sel: ts.text.slice(0, 80) });
      e.preventDefault();
      return origSelMenu(e.clientX, e.clientY);
    }
    e.preventDefault();
    const p = pagePoint(e), bl = p && v.hasText ? blockAt(p.pg, p.nx, p.ny) : null;
    showMenu(e.clientX, e.clientY, [
      bl && { label: '在全文中查看這段', icon: 'page', act: () => gotoText(bl.a, bl.b) },
      bl && { label: '拷貝這段文字', icon: 'copy', act: () => copyText(S.pv.text.slice(bl.a, bl.b).trim()) },
      bl && { sep: true },
      { label: '放大', key: '+', act: () => vZoom(v.zi + 1) },
      { label: '縮小', key: '−', act: () => vZoom(v.zi - 1) },
      { label: '適合寬度', key: '0', act: () => vZoom(3) },
      { sep: true },
      { label: '用默認程序打開', icon: 'open', act: () => doOpen(S.pv.id) },
    ]);
  });
}

// ---- 展開全部命中：結果裡列出這個文件每一處命中的上下文（挨得近的併成一條），懸停、點擊都跳到那一處
// 只展開一個文件；只在內存裡留這一個文件的上下文
function kwicHtml(it) {
  const d = S.kwicData && S.kwicData.id === it.id ? S.kwicData : null;
  const head = `<div class="kwic-head"><span>${d ? `全部 <b>${fmtNum(d.total)}</b> 處${d.capped ? `，列出前 ${fmtNum(d.items.length)} 條
    <button class="kwic-more" data-kwic-more title="再列出後面的命中">再列 500 條</button>` : ''}` : '正在列出全部命中……'}</span>
    <button class="kwic-close" data-kwic="${it.id}" title="收起，回到幾條片段">收起${I.chev}</button></div>`;
  if (!d) return head + '<div class="snips kwic"></div>';
  return head + '<div class="snips kwic">' + d.items.map((c, k) =>
    `<div class="snip kw" data-s0="${c.s0}" data-s1="${c.s1}"><span class="kn">${k + 1}</span>${c.page ? `<span class="pg">${c.page}</span>` : ''}${segsHtml(c.segs)}</div>`).join('') + '</div>';
}
function rerenderItem(id) {
  const el = $(`#res-list .item[data-id="${id}"]`), it = S.items.find(i => i.id === id);
  if (el && it) el.outerHTML = itemHtml(it);
}
const kwicKey = id => [id, S.q, S.mode, fzQS(), S.kwicLimit].join('|');
async function loadKwic(id) {
  const key = kwicKey(id);
  if (S.kwicData && S.kwicData.key === key) return;
  const box = S.kwicData && S.kwicData.id === id && $(`#res-list .item[data-id="${id}"] .kwic`);
  const keep = box ? box.scrollTop : 0;                  // 「再列 500 條」時保持列表位置
  S.kwicData = null;
  if (!keep) rerenderItem(id);
  try {
    const r = await api(`contexts?id=${id}&q=${encodeURIComponent(S.q)}&mode=${S.mode}${fzQS()}&limit=${S.kwicLimit}`);
    if (S.kwicOpen !== id || key !== kwicKey(id)) return;
    S.kwicData = Object.assign(r, { id, key });
    rerenderItem(id);
    if (keep) { const b = $(`#res-list .item[data-id="${id}"] .kwic`); if (b) b.scrollTop = keep; }
    if (S.pv && S.pv.id === id && S.spans && S.spans[S.hit] && S.pvTab === 'text') kwicSync(S.spans[S.hit][0]);
  } catch (err) { fail(err); }
}
function toggleKwic(id) {
  if (S.kwicOpen === id) {
    S.kwicOpen = null;
    S.kwicData = null;
    return rerenderItem(id);
  }
  const prev = S.kwicOpen;
  S.kwicOpen = id;
  S.kwicLimit = 500;
  if (prev) { S.kwicData = null; rerenderItem(prev); }
  if (S.cur !== id) selectItem(id);
  loadKwic(id);
}
// 預覽裡的當前位置 → 對應那條上下文標為當前（列表只在需要時滾一點）
function kwicSync(s) {
  if (!S.kwicOpen || !S.pv || S.pv.id !== S.kwicOpen) return;
  const box = $(`#res-list .item[data-id="${S.kwicOpen}"] .kwic`);
  if (!box) return;
  let hit = null;
  for (const el of box.children) {
    if (+el.dataset.s0 <= s && s <= +el.dataset.s1) { hit = el; break; }
  }
  box.querySelectorAll('.kw.cur').forEach(x => { if (x !== hit) x.classList.remove('cur'); });
  if (!hit) return;
  hit.classList.add('cur');
  const br = box.getBoundingClientRect(), r = hit.getBoundingClientRect();
  if (r.top < br.top || r.bottom > br.bottom) box.scrollTop += r.top - br.top - box.clientHeight / 3;
}
// ---- 檢索片段懸停：預覽跳到那處命中（全文：跳到那處；原件：翻到那頁、紅框標出）
// 只對已單擊選中、正在預覽的那個條目起作用；鼠標劃過別的條目不會跳
let hoverTimer = 0, hoverKey = '';
function revealHit(id, s, e) {
  const pv = S.pv;
  if (!pv || pv.folder || pv.id !== id) return;
  if (S.pvTab === 'text' && $('#reader')) {
    const k = !findActive() && S.spans ? S.spans.findIndex(sp => sp[1] > s) : -1;
    if (k >= 0) return gotoHit(k);
    return selectReaderRange(s, e);
  }
  if (S.pvTab === 'orig' && V && V.id === id) focusOrig(s, e);
  if (S.pvTab === 'orig' && DV && DV.id === id) docFocus(s, e);
}
function snipHit(e) {
  const h = e.target.closest && e.target.closest('.item.sel .snip .sh');
  if (!h || S.sel.size > 1) return null;
  const id = +h.closest('.item').dataset.id;
  return S.pv && !S.pv.folder && S.pv.id === id ? { h, id } : null;
}
function hotSnip(h) {
  $$('.snip .sh.hot').forEach(x => x.classList.remove('hot'));
  if (h) h.classList.add('hot');
}
$('#res-list').addEventListener('mouseover', e => {
  const r = snipHit(e);
  if (!r) return;
  const { h, id } = r, s = +h.dataset.s, en = +h.dataset.e, key = id + ':' + s;
  hotSnip(h);
  if (key === hoverKey) return;
  hoverKey = key;
  clearTimeout(hoverTimer);
  hoverTimer = setTimeout(() => revealHit(id, s, en), 120);
});
$('#res-list').addEventListener('mouseout', e => {
  const h = e.target.closest && e.target.closest('.snip .sh');
  if (!h || (e.relatedTarget && h.contains(e.relatedTarget))) return;
  clearTimeout(hoverTimer);
  hoverKey = '';
  hotSnip(null);
});

// ---- 全文與原件互跳。全文裡的位置按 UTF-16 下標計，與後台換算後的命中位置一致
function readerOffset(node, off) {
  const el = node && (node.nodeType === 1 ? node : node.parentNode);
  const blk = el && el.closest && el.closest('#reader .blk[data-a]');
  if (!blk) return null;
  const r = document.createRange();
  r.setStart(blk, 0);
  try { r.setEnd(node, off); } catch (err) { return +blk.dataset.a; }
  let n = r.toString().length;
  const hd = blk.querySelector(':scope > .pghd');
  if (hd && r.intersectsNode(hd)) n -= Math.min(n, hd.textContent.length);
  return +blk.dataset.a + n;
}
function readerBlockAt(o) {
  let best = null;
  for (const b of $$('#reader .blk[data-a]')) { if (+b.dataset.a <= o) best = b; else break; }
  return best;
}
function textNodeAt(blk, o) {
  const w = document.createTreeWalker(blk, NodeFilter.SHOW_TEXT,
    { acceptNode: n => (n.parentNode.closest('.pghd') ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT) });
  let acc = +blk.dataset.a, last = null;
  for (let n = w.nextNode(); n; n = w.nextNode()) {
    if (o <= acc + n.data.length) return [n, o - acc];
    acc += n.data.length;
    last = n;
  }
  return last ? [last, last.data.length] : null;
}
// 目標在視區的「舒適範圍」裡（上方留一成、下方留兩成）就不必滾
function inView(box, rr) {
  const br = box.getBoundingClientRect(), h = box.clientHeight;
  return rr.top - br.top >= h * 0.1 && rr.bottom - br.top <= h * 0.8;
}
function selectReaderRange(s, e) {
  const b1 = readerBlockAt(s), b2 = readerBlockAt(e) || b1;
  if (!b1) return;
  const p = textNodeAt(b1, s), q = textNodeAt(b2, e);
  if (!p || !q) return;
  const r = document.createRange();
  r.setStart(p[0], p[1]);
  r.setEnd(q[0], q[1]);
  const sel = window.getSelection();
  sel.removeAllRanges();
  sel.addRange(r);
  const rd = $('#reader');
  const place = () => {
    const rr = r.getBoundingClientRect();
    if (!rr.height) return false;                         // 這塊還沒排版（content-visibility）
    if (!inView(rd, rr)) rd.scrollTop += rr.top - rd.getBoundingClientRect().top - rd.clientHeight / 3;
    return true;
  };
  if (place()) return;
  b1.scrollIntoView({ block: 'center' });                 // 先讓這塊排版，再一次定到上方三分之一
  if (!place()) requestAnimationFrame(place);
}
function gotoText(s, e) {
  S.pendingSel = [s, e];
  S.pvTab = S.pvTabPref = 'text';
  renderPreviewBody();
}
function locateInOrig(s, e) {
  const pv = S.pv;
  if (!canOrigPv(pv) || s == null) return;
  if (docViewable(pv)) S.docFocus = { id: pv.id, s, e: e == null ? s : e };
  else {
    S.pdfFocus = { id: pv.id, s, e: e == null ? s : e };
    S.origPage = pageOfOffset(pv, s);
  }
  S.pvTab = S.pvTabPref = 'orig';
  renderPreviewBody();
}
function readerTopOffset() {
  const rd = $('#reader');
  if (!rd) return null;
  const top = rd.getBoundingClientRect().top + 4;
  for (const b of $$('#reader .blk[data-a]')) if (b.getBoundingClientRect().bottom > top) return +b.dataset.a;
  return null;
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
// 檢索字集：正則、通配符檢索時服務器給 "*"——命中的字無從判斷是不是異體，一律按原字命中標
const qsetOf = qc => (qc === '*' ? null : new Set(Array.from(qc || '')));
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
    const k = diffs && diffs.has(i) ? 'x' : (qset && isWordChar(ch) && !qset.has(exNorm(ch)) ? 'v' : '');
    if (runK !== null && k !== runK) flush();
    runK = k;
    run += ch;
    i += ch.length;
  }
  flush();
}
function findActive() { return S.find.open && !!S.find.q.trim(); }
const findKey = () => [S.find.q.trim(), S.mode, S.find.re ? 're' : S.find.fz ? S.find.sim : ''].join('\u0001');
const findFzQS = () => (S.find.re ? '&re=1' : S.find.fz ? `&fuzzy=1&sim=${S.find.sim}` : '');
function findReady() { const r = S.find.res; return !!(r && S.pv && r.id === S.pv.id && r.key === findKey()); }
function renderReader(body) {
  const pv = S.pv;
  if (pv.status !== 1 || pv.text == null) {
    body.innerHTML = `<div class="pv-msg">${statusMsg(pv)}${pv.kind === 'pdf' && pv.exists ? `<br><button class="btn" data-tab-to="orig">${I.page}查看原件</button>` : ''}</div>`;
    return;
  }
  body.innerHTML = `<div class="findbar" id="findbar"${S.find.open ? '' : ' hidden'}>${I.search}
    <input id="find-q" type="text" spellcheck="false" autocomplete="off" placeholder="${S.find.re ? '正則表達式 —— 漢字仍簡繁異體互通' : '在本文件內查找 —— 簡繁異體互通'}" value="${esc(S.find.q)}">
    <button class="find-re${S.find.re ? ' on' : ''}" data-act="find-re" title="正則表達式（只管本文件內查找）">.*</button>
    <button class="find-fz${S.find.fz && !S.find.re ? ' on' : ''}" data-act="find-fz" title="模糊查找：容許脫字、衍字、訛字（只管本文件內查找，與上方檢索框的「模糊」互不影響）">≈ 模糊</button>
    <select id="find-sim" title="相似度下限"${S.find.fz && !S.find.re ? '' : ' hidden'}>${['0.9', '0.8', '0.7', '0.6', '0.5'].map(v =>
      `<option value="${v}"${v === S.find.sim ? ' selected' : ''}>≥ ${Math.round(v * 100)}%</option>`).join('')}</select>
    <span class="find-mode" id="find-mode" title="匹配方式跟隨上方的精確／簡繁／異體"></span>
    <button class="icon-btn" data-act="find-close" title="關閉查找（esc）">${I.x}</button></div>
    <div class="hitbar" id="hitbar"></div><div class="reader" id="reader" style="--reader-size:${S.readerSize}px"></div>`;
  bindFind();
  paintReader();
  if (findActive() && !findReady()) runFind();
}
function paintReader() {
  const pv = S.pv, reader = $('#reader');
  if (!pv || !reader || pv.text == null) return;
  const canOrig = canOrigPv(pv);
  reader.classList.toggle('can-orig', canOrig);
  // 查找框有內容時，高亮查找結果；否則高亮主檢索詞
  const src = findActive() ? (findReady() ? S.find.res : { spans: [], diffs: [], qchars: '' }) : pv;
  const spans = mergeSpans(src.spans);
  const diffs = src.diffs && src.diffs.length ? new Set(src.diffs) : null;
  S.spans = spans;
  S.hit = 0;
  reader.textContent = '';
  const paged = pv.text.indexOf('\f') >= 0;
  const text = pv.text, qset = qsetOf(src.qchars);
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
  S.rb = [];
  const ctx = { text, qset, diffs, canOrig };
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
    div.dataset.a = a;
    if (page) div.dataset.page = page;
    si = fillBlock(div, a, b, page, spans, si, ctx);
    S.rb.push({ a, b, page, el: div });
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
  if (S.pendingSel) {
    const [s, e] = S.pendingSel;
    S.pendingSel = null;
    const k = spans.findIndex(sp => sp[1] > s);
    if (k >= 0) S.hit = k;
    renderHitbar();
    return requestAnimationFrame(() => selectReaderRange(s, e));
  }
  if (spans.length) requestAnimationFrame(() => gotoHit(start));
}
// 一塊（一頁或一段）的內容：文字＋命中；返回處理到的命中序號（跨塊的命中留給下一塊接著畫）
function fillBlock(div, a, b, page, spans, si, ctx) {
  const { text, qset, diffs, canOrig } = ctx;
  div.textContent = '';
  if (page) {
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
      if (canOrig) m.title = '雙擊：在原件中查看';
      fillMark(m, text.slice(ss, ee), qset, ss, diffs);
      div.appendChild(m);
      if (!S.hitEls[si]) S.hitEls[si] = m;
    }
    pos = Math.max(pos, ee);
    if (e <= b) si++; else break;
  }
  if (pos < b) div.appendChild(document.createTextNode(text.slice(pos, b)));
  return si;
}
// 換了檢索詞（或查找詞）：只重畫原先或現在有命中的塊——幾千頁的書也只動幾十頁
function remarkReader() {
  const pv = S.pv, reader = $('#reader');
  if (!pv || !reader || pv.text == null || !S.rb || !reader.contains(S.rb[0] && S.rb[0].el)) return paintReader();
  const src = findActive() ? (findReady() ? S.find.res : { spans: [], diffs: [], qchars: '' }) : pv;
  const spans = mergeSpans(src.spans), old = S.spans || [];
  const ctx = { text: pv.text, qset: qsetOf(src.qchars),
    diffs: src.diffs && src.diffs.length ? new Set(src.diffs) : null, canOrig: canOrigPv(pv) };
  const hits = (list, a, b) => {
    let lo = 0, hi = list.length;
    while (lo < hi) { const m = (lo + hi) >> 1; if (list[m][1] <= a) lo = m + 1; else hi = m; }
    return lo < list.length && list[lo][0] < b;
  };
  S.hitEls = new Array(spans.length);
  let si = 0;
  for (const blk of S.rb) {
    while (si < spans.length && spans[si][1] <= blk.a) si++;
    if (hits(old, blk.a, blk.b) || (si < spans.length && spans[si][0] < blk.b)) si = fillBlock(blk.el, blk.a, blk.b, blk.page, spans, si, ctx);
  }
  S.spans = spans;
  S.hit = 0;
  renderHitbar();
  if (spans.length) requestAnimationFrame(() => gotoHit(0));
}
// ---- 本文件內查找（⌘F）：與主檢索框無關，用同樣的匹配方式和模糊設置
let findTimer = null, findSeq = 0;
function bindFind() {
  const inp = $('#find-q');
  if (!inp) return;
  $('#find-mode').textContent = MODE_LABEL[S.mode];
  $('#find-sim').addEventListener('change', e => {
    S.find.sim = e.target.value;
    api('settings', { find_sim: S.find.sim }).catch(() => {});
    if (findActive()) runFind();
  });
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
  if (!S.find.q.trim()) { S.find.res = null; S.find.busy = false; findSeq++; return remarkReader(); }
  const seq = ++findSeq, key = findKey();
  S.find.busy = true;
  renderHitbar();
  try {
    const r = await api(`find?id=${pv.id}&q=${encodeURIComponent(S.find.q)}&mode=${S.mode}${findFzQS()}`);
    if (seq !== findSeq || !S.pv || S.pv.id !== pv.id) return;
    S.find.res = { id: pv.id, key, spans: r.spans, diffs: r.diffs, qchars: r.qchars, error: r.re_error };
    S.find.busy = false;
    remarkReader();
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
  const msg = fa ? (S.find.busy || !findReady() ? '查找中…' : S.find.res.error ? esc(S.find.res.error) : '本文件內沒有找到')
    : `${fmtNum(pv.chars)} 字${pv.pages ? ' · ' + pv.pages + ' 頁' : ''}${S.q ? ' · 正文無命中' : ''}`;
  hb.innerHTML = `${n ? `<span>${fa ? '查找：' : ''}第 <b>${S.hit + 1}</b> / ${fmtNum(n)} 處</span>
    <button class="icon-btn" data-act="prev-hit" title="上一處（⇧⌘G）">${I.up}</button>
    <button class="icon-btn" data-act="next-hit" title="下一處（⌘G）">${I.down}</button>
    ${page ? `<span class="pg-now">第 ${page} 頁</span>` : ''}` :
    `<span style="color:var(--text-3)">${msg}</span>`}
    <span class="grow"></span>
    <button class="icon-btn${S.find.open ? ' on' : ''}" data-act="find" title="在本文件內查找（⌘F）">${I.search}</button>
    ${pv.kind === 'pdf' && pv.exists ? `<button class="icon-btn" data-act="orig-page" title="${n ? '在原件中查看這處命中' : '在原件中查看這一頁'}（也可雙擊命中的詞）">${I.page}</button>` : ''}
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
  // 只量一次位置、直接設滾動位置：長文本裡每次強制排版要幾十毫秒，scrollIntoView 會再排一次
  const rd = $('#reader'), el = S.hitEls[i], rr = el.getBoundingClientRect();
  if (!rd || !rr.height) el.scrollIntoView({ block: 'center' });
  else if (!inView(rd, rr)) rd.scrollTop += rr.top - rd.getBoundingClientRect().top - rd.clientHeight / 2 + rr.height / 2;
  renderHitbar();
  if (S.spans && S.spans[i] && !findActive()) kwicSync(S.spans[i][0]);
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
    case 'pg-prev': return V && toPage(V.cur - 1);
    case 'pg-next': return V && toPage(V.cur + 1);
    case 'pg-zin': return V && vZoom(V.zi + 1);
    case 'pg-zout': return V && vZoom(V.zi - 1);
    case 'dv-zin': return DV && dvZoom(DV.zi + 1);
    case 'oh-prev': return origHit(-1);
    case 'oh-next': return origHit(1);
    case 'dv-zout': return DV && dvZoom(DV.zi - 1);
    case 'find-fz': case 'find-re': {
      // 本文件內查找的「正則」只在這次打開通檢時有效；與模糊互斥
      if (b.dataset.act === 'find-re') { S.find.re = !S.find.re; if (S.find.re && S.find.fz) { S.find.fz = false; api('settings', { find_fuzzy: '0' }).catch(() => {}); } }
      else { S.find.fz = !(S.find.fz && !S.find.re); S.find.re = false; api('settings', { find_fuzzy: S.find.fz ? '1' : '0' }).catch(() => {}); }
      const fb = $('#findbar');
      $('.find-fz', fb).classList.toggle('on', S.find.fz);
      $('.find-re', fb).classList.toggle('on', S.find.re);
      $('#find-q').placeholder = S.find.re ? '正則表達式 —— 漢字仍簡繁異體互通' : '在本文件內查找 —— 簡繁異體互通';
      const sl = $('#find-sim');
      if (sl) sl.hidden = !S.find.fz;
      if (findActive()) runFind();
      return $('#find-q') && $('#find-q').focus();
    }
    case 'find-close': return closeFind();
    case 'orig-page': {
      const sp = S.hitEls.length && S.spans ? S.spans[S.hit] : null;
      if (sp) return locateInOrig(sp[0], sp[1]);
      const o = readerTopOffset();
      S.origPage = o != null ? pageOfOffset(S.pv, o) : null;
      S.pvTab = S.pvTabPref = 'orig';
      return renderPreviewBody();
    }
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
  if (S.dupView && S.q.trim()) { S.dupView = false; renderSidebar(); }
  if (S.q.trim()) closeQPanel();
  $('#q-clear').hidden = !S.q;
  S.limit = 200;
  scheduleSearch(S.q.trim() ? ((S.fuzzy || S.regex) && S.scope !== 'name' ? 450 : 260) : 60);
}
qEl.addEventListener('keydown', e => {
  if (e.isComposing || composing) return;
  if (e.key === 'Escape' && synOpen()) { e.preventDefault(); e.stopPropagation(); return closeSyn(); }
  if (qpOpen()) {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { e.preventDefault(); return qpMove(e.key === 'ArrowDown' ? 1 : -1); }
    if (e.key === 'Enter' && qpIdx >= 0) {
      e.preventDefault();
      const row = $$('#qpanel .qp-row')[qpIdx], en = row && qpEntry(+row.dataset.qp);
      return en && applySearch(en);
    }
    if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); return closeQPanel(); }
  } else if (e.key === 'ArrowDown' && !qEl.value.trim()) { e.preventDefault(); return openQPanel(); }
  if (e.key === 'Enter') { e.preventDefault(); S.q = qEl.value; closeQPanel(); runSearch(); noteSearch(true); }
  else if (e.key === 'Escape' && qEl.value) { e.preventDefault(); e.stopPropagation(); qEl.value = ''; onQuery(); }
  else if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { e.preventDefault(); moveCursor(e.key === 'ArrowDown' ? 1 : -1, e.shiftKey); }
});
$('#q-clear').onclick = () => { qEl.value = ''; onQuery(); qEl.focus(); };
function setMode(m) {
  S.mode = m;
  $$('#mode button').forEach(b => b.classList.toggle('on', b.dataset.mode === m));
  const fm = $('#find-mode');
  if (fm) fm.textContent = MODE_LABEL[S.mode];
  if (findActive()) runFind();
  api('settings', { mode: m }).catch(() => {});
  runSearch({ keepScroll: true });
}
$('#mode').addEventListener('click', e => { const b = e.target.closest('[data-mode]'); if (b) setMode(b.dataset.mode); });
$('#scope').onchange = e => { S.scope = e.target.value; api('settings', { scope: S.scope }).catch(() => {}); runSearch(); };
$('#sort').onchange = e => { S.sort = e.target.value; api('settings', { sort: S.sort }).catch(() => {}); runSearch(); };

// ===================================================================== 檢索語法速查
// 不彈窗：工具欄 ? 下的面板，分「基本／篩選／正則」三欄；點例子即填入檢索框試一試，面板不關，可接著改。
const SYN = {
  basic: { label: '基本', rows: [
    ['萬曆 張居正', '空格：同時包含'],
    ['後金 | 建州', '<code>|</code> 或 <code>OR</code>：包含任一個'],
    ['萬曆 -天啟', '<code>-</code> 或 <code>!</code>：排除包含該詞的文件'],
    ['"Grand Secretary"', '引號：含空格的短語當作一個詞；引號裡的 <code>*</code> <code>?</code> 按字面'],
    ['萬曆*年', '<code>*</code>：任意幾個字（不越過 。！？；）'],
    ['萬曆??年', '<code>?</code>：一個字'],
    ['*.pdf 明史', '通配符也用於文件名'],
  ], note: '漢字按上方的精確／簡繁／異體互通，跨行斷開的詞也能找到。用了通配符時，命中的字一律按原字標色。' },
  filter: { label: '篩選', append: true, rows: [
    ['ext:pdf', '擴展名'],
    ['ext:pdf;docx;doc', '幾種擴展名，用 <code>;</code> 分隔'],
    ['-ext:json', '排除某種擴展名'],
    ['size:>10mb', '大於 10 MB；單位 kb mb gb'],
    ['size:<500kb', '小於 500 KB'],
    ['size:1mb..20mb', '兩者之間'],
    ['dm:2024', '修改於 2024 年；也可寫 2024-03、2024-03-15'],
    ['dm:2023..2024-06', '時間段'],
    ['dm:>2024-01', '某時以後；<code>&lt;</code> 以前'],
    ['dm:本週', '今天 昨天 本週 上週 本月 上月 今年 去年'],
    ['dm:30d', '最近 30 天'],
    ['path:明史', '完整路徑含這幾個字（簡繁異體互通）'],
    ['-path:草稿', '排除路徑'],
  ], note: '篩選詞寫在檢索式裡，與檢索詞並用、都要滿足；只寫篩選詞就按條件列出文件。與側欄的篩選疊加。' },
  regex: { label: '正則', regex: true, rows: [
    ['萬曆.{1,4}年', '<code>.</code> 任一字，<code>{1,4}</code> 一到四個'],
    ['[甲乙丙丁戊己庚辛壬癸][子丑寅卯辰巳午未申酉戌亥]', '方括號：其中任一字（這裡是干支）'],
    ['(張|李)居正', '圓括號與 <code>|</code>：幾種之一'],
    ['卷[一二三四五六七八九十]+', '<code>+</code> 一個以上，<code>*</code> 零個以上，<code>?</code> 可有可無'],
    ['^第.{1,3}回', '<code>^</code> 行首，<code>$</code> 行尾'],
    ['\\d{4}年', '<code>\\d</code> 數字，<code>\\s</code> 空白，<code>\\w</code> 字'],
  ], note: '檢索框裡的 <b>.*</b>（⌘5）打開正則。整個檢索式（篩選詞以外）是一個正則，空格按字面。' +
    '方括號外的漢字仍按匹配方式互通（萬 也配 万），方括號裡的不展開；不分大小寫。' +
    '正則裡沒有一定出現的漢字時，要逐個文件掃，最多 6 秒。' },
};
const synOpen = () => !$('#synpanel').hidden;
function renderSyn() {
  const t = SYN[S.synTab] || SYN.basic, el = $('#synpanel');
  el.innerHTML = `<div class="syn-head"><div class="seg syn-tabs" role="tablist">${Object.entries(SYN).map(([k, v]) =>
      `<button role="tab" data-syn-tab="${k}" class="${k === S.synTab ? 'on' : ''}">${v.label}</button>`).join('')}</div>
    <span class="syn-hint">${t.append ? '點例子，加到檢索框末尾' : t.regex ? '點例子，打開正則並填入' : '點例子，填入檢索框'}</span>
    <button class="icon-btn" data-syn-close title="關閉（esc）">${I.x}</button></div>
    <div class="syn-rows">${t.rows.map(([ex, d], i) =>
      `<button class="syn-row" data-syn-ex="${i}"><code class="syn-ex">${esc(ex)}</code><span class="syn-d">${d}</span></button>`).join('')}</div>
    <p class="syn-note">${t.note}</p>
    <div class="syn-foot"><a href="#" data-syn-more>完整說明：範圍、原件、快捷鍵…</a></div>`;
}
function openSyn(tab) {
  S.synTab = tab || (S.regex ? 'regex' : S.synTab);
  closeQPanel();
  renderSyn();
  $('#synpanel').hidden = false;
  $('#help-btn').classList.add('on');
}
function closeSyn() { $('#synpanel').hidden = true; $('#help-btn').classList.remove('on'); }
$('#help-btn').onclick = () => (synOpen() ? closeSyn() : openSyn());
$('#synpanel').addEventListener('mousedown', e => e.preventDefault());      // 不搶檢索框的焦點
$('#synpanel').addEventListener('click', e => {
  const tb = e.target.closest('[data-syn-tab]');
  if (tb) { S.synTab = tb.dataset.synTab; return renderSyn(); }
  if (e.target.closest('[data-syn-close]')) return closeSyn();
  if (e.target.closest('[data-syn-more]')) { e.preventDefault(); closeSyn(); return showHelp(); }
  const ex = e.target.closest('[data-syn-ex]');
  if (!ex) return;
  const t = SYN[S.synTab], v = t.rows[+ex.dataset.synEx][0];
  if (t.append) {
    const cur = qEl.value.trim();
    qEl.value = cur.split(/\s+/).includes(v) ? cur : (cur ? cur + ' ' : '') + v;
  } else {
    qEl.value = v;
    if (!!t.regex !== S.regex) setRegex(!!t.regex, true);
  }
  qEl.focus();
  qEl.setSelectionRange(qEl.value.length, qEl.value.length);
  onQuery();
});
document.addEventListener('mousedown', e => { if (synOpen() && !e.target.closest('.help-wrap, .search')) closeSyn(); });

// ===================================================================== 檢索歷史、保存的檢索
// 歷史：檢索停留三秒、按回車或打開了結果才記（打字途中的半截詞不記），存在本機資料庫裡，最多 60 條。
// 保存的檢索：連同匹配方式、模糊、範圍和篩選一起存，在側欄或檢索框的下拉裡一點即重跑。
const CLOCK = '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="8.2"/><path d="M12 7.4V12l3.1 2"/></svg>';
const DEFAULT_FILTER = () => ({ root: null, dir: null, kind: null, tag: null, starred: false, only: null, kinds: [], exts: [] });
const hasTypes = (f = S.filter) => !!((f.kinds && f.kinds.length) || (f.exts && f.exts.length));
const hasFilter = (f = S.filter) => !!(f.root || f.dir || f.kind || f.tag || f.starred || f.only || hasTypes(f));
// ===================================================================== 側欄「類型」
// 與原來一樣按大類分行、什麼都不選＝全部類型；每行用擴展名附標代替文字。
// 點行＝整類（kinds），點附標＝單個擴展名（exts），兩者取並集，都可多選。
const KIND_ROW_MAX = 3;                                    // 每行先列文件最多的三種，其餘「+N」展開
const extKind = x => { const e = ((S.stats && S.stats.exts) || []).find(e => e[0] === x); return e ? e[1] : null; };
const kindExts = k => ((S.stats && S.stats.exts) || []).filter(e => e[1] === k).map(e => e[0]);
const extLabel = x => x ? x.toUpperCase() : '無擴展名';
function typesLabel(f = S.filter, sep = ' · ') {
  const out = [];
  for (const k of KIND_ORDER) if ((f.kinds || []).includes(k)) {
    const xs = kindExts(k);
    out.push(xs.length <= 1 ? extLabel(xs[0] || k) : xs.slice(0, 2).map(extLabel).join('、') + ' 等');
  }
  for (const x of f.exts || []) out.push(extLabel(x));
  return out.join(sep);
}
function toggleExt(x) {
  const f = S.filter, k = extKind(x);
  let kinds = (f.kinds || []).slice(), exts = (f.exts || []).slice();
  if (k && kinds.includes(k)) {                            // 整類已選：點其中一種＝只去掉這一種
    kinds = kinds.filter(y => y !== k);
    exts = exts.concat(kindExts(k).filter(y => y !== x));
  } else if (exts.includes(x)) exts = exts.filter(y => y !== x);
  else {
    exts.push(x);
    const all = k && kindExts(k);
    if (all && all.every(y => exts.includes(y))) {         // 一類裡的都點齊了：合成整類
      exts = exts.filter(y => extKind(y) !== k);
      kinds.push(k);
    }
  }
  setFilter({ kinds, exts });
}
function typesHtml(f, st) {
  const exts = st.exts || [];
  if (!exts.length) return '';
  const byKind = {};
  for (const [x, k, n] of exts) (byKind[k] = byKind[k] || []).push([x, n]);
  const kinds = f.kinds || [], selx = f.exts || [], any = kinds.length || selx.length;
  const badge = (x, k, n, on) => `<button class="tb${on ? ' on' : ''}" data-act="ext" data-ext="${esc(x)}" title="${x ? '.' + esc(x) : '沒有擴展名'}：${fmtNum(n)} 個文件">` +
    `<span class="badge k-${k}">${esc(x ? (x.length > 6 ? x.slice(0, 5) + '…' : x) : '—')}</span></button>`;
  let h = `<div class="side-sec types${any ? ' has-sel' : ''}"><div class="side-h"><span>類型</span>
    ${any ? `<button class="side-link" data-act="ext-clear" title="回到全部類型">清除</button>` : ''}
    <button class="icon-btn" data-act="ext-add" title="輸入擴展名篩選（可多個，如 caj nh）">${I.plus}</button></div>`;
  for (const k of KIND_ORDER) {
    const list = byKind[k];
    if (!list) continue;
    const kOn = kinds.includes(k), open = S.openKinds.has(k);
    const shown = open ? list : list.slice(0, KIND_ROW_MAX).concat(list.slice(KIND_ROW_MAX).filter(e => selx.includes(e[0])));
    const more = list.length - shown.length;
    const total = list.reduce((s, e) => s + e[1], 0);
    h += `<div class="side-item type-row${kOn ? ' active' : ''}${open ? ' open' : ''}" data-act="kindrow" data-kind="${k}"
      title="${kOn ? '點擊取消' : '點擊選這一類，可多選'}：${esc(list.map(e => extLabel(e[0])).join(' '))}">
      <span class="tbs">${shown.map(([x, n]) => badge(x, k, n, kOn || selx.includes(x))).join('')}${more > 0 ?
        `<button class="tb-more" data-act="kind-more" data-kind="${k}" title="展開其餘 ${more} 種">+${more}</button>` :
        open && list.length > KIND_ROW_MAX ? `<button class="tb-more" data-act="kind-more" data-kind="${k}" title="收起">−</button>` : ''}</span>
      <span class="count">${fmtNum(total)}</span></div>`;
  }
  const extra = selx.filter(x => !exts.some(e => e[0] === x));     // 輸入的、資料庫裡還沒有的擴展名
  if (extra.length) h += `<div class="side-item type-row"><span class="tbs">${extra.map(x => badge(x, 'other', 0, true)).join('')}</span><span class="count">0</span></div>`;
  return h + '</div>';
}

function canon(v) {
  if (Array.isArray(v)) return '[' + v.map(canon).join(',') + ']';
  if (v && typeof v === 'object') return '{' + Object.keys(v).sort().map(k => JSON.stringify(k) + ':' + canon(v[k])).join(',') + '}';
  return JSON.stringify(v === undefined ? null : v);
}
function currentParams() {
  const f = S.filter, flt = {};
  for (const k of ['root', 'dir', 'kind', 'tag']) if (f[k]) flt[k] = f[k];
  if (f.starred) flt.starred = true;
  if (f.kinds && f.kinds.length) flt.kinds = f.kinds.slice();
  if (f.exts && f.exts.length) flt.exts = f.exts.slice();
  if (f.only) flt.only = f.only;
  const p = { mode: S.mode, scope: S.scope };
  if (S.regex) p.regex = true;
  else if (S.fuzzy) p.fuzzy = S.fzSim;
  if (S.sort !== 'relevance') p.sort = S.sort;
  if (Object.keys(flt).length) p.filter = flt;
  return p;
}
const searchKey = (q, p) => canon([(q || '').trim(), p || {}]);
const isCurrentSearch = e => searchKey(e.q, e.params) === searchKey(S.q, currentParams());
const SCOPE_SHORT = { name: '僅文件名', all: '名稱與全文', content: '僅全文' };
function searchSummary(e) {
  const p = e.params || {}, f = p.filter || {}, out = [];
  out.push(MODE_LABEL[p.mode] || '異體');
  if (p.regex) out.push('正則');
  else if (p.fuzzy) out.push('模糊 ≥ ' + Math.round(p.fuzzy * 100) + '%');
  out.push(SCOPE_SHORT[p.scope] || '');
  if (hasTypes(f)) out.push(typesLabel(f, ' '));
  if (f.kind === 'notext') out.push('無文字層');
  if (f.dir) out.push(f.dir.split('/').pop());
  else if (f.root) { const r = rootOf(f.root); if (r) out.push(r.name); }
  if (f.only) out.push('範圍：' + onlyLabel(f.only));
  if (f.tag) { const t = S.tags.find(t => t.id === f.tag); if (t) out.push('#' + t.name); }
  if (f.starred) out.push('已收藏');
  return out.filter(Boolean);
}
function fmtAgo(ts) {
  const d = Date.now() / 1000 - ts;
  if (d < 60) return '剛才';
  if (d < 3600) return Math.floor(d / 60) + ' 分鐘前';
  if (d < 86400) return Math.floor(d / 3600) + ' 小時前';
  if (d < 86400 * 7) return Math.floor(d / 86400) + ' 天前';
  return fmtDate(ts);
}
let histTimer = 0, lastHistKey = '';
function noteSearch(now) {
  clearTimeout(histTimer);
  if (!S.q.trim() || S.dupView || S.settings.history_on === '0') return;
  const go = () => {
    if (!S.q.trim() || S.dupView) return;            // 三秒內清空了檢索框或轉去查重：不記
    const p = currentParams(), key = searchKey(S.q, p);
    if (key === lastHistKey) return;
    lastHistKey = key;
    api('searches/add', { kind: 'h', q: S.q.trim(), params: p }).then(r => { S.searches = r; if (qpOpen()) renderQPanel(); }).catch(() => {});
  };
  if (now) go(); else histTimer = setTimeout(go, 3000);
}
function applySearch(e) {
  closeQPanel();
  const p = e.params || {};
  S.dupView = false;
  qEl.value = S.q = e.q || '';
  $('#q-clear').hidden = !S.q;
  if (p.mode && p.mode !== S.mode) {
    S.mode = p.mode;
    $$('#mode button').forEach(b => b.classList.toggle('on', b.dataset.mode === S.mode));
    api('settings', { mode: S.mode }).catch(() => {});
  }
  const fz = !!p.fuzzy, rx = !!p.regex;
  if (fz !== S.fuzzy || (fz && p.fuzzy !== S.fzSim)) {
    S.fuzzy = fz;
    if (fz) S.fzSim = p.fuzzy;
    api('settings', { fuzzy: S.fuzzy ? '1' : '0', fuzzy_sim: S.fzSim }).catch(() => {});
  }
  if (rx !== S.regex) { S.regex = rx; api('settings', { regex: rx ? '1' : '0' }).catch(() => {}); }
  renderFuzzy();
  if (p.scope && p.scope !== S.scope) { S.scope = p.scope; $('#scope').value = S.scope; api('settings', { scope: S.scope }).catch(() => {}); }
  const sort = p.sort || 'relevance';
  if (sort !== S.sort) { S.sort = sort; $('#sort').value = sort; api('settings', { sort }).catch(() => {}); }
  S.filter = Object.assign(DEFAULT_FILTER(), p.filter || {});
  S.limit = 200;
  renderSidebar();
  runSearch();
  if (e.kind === 'h' || e.q) noteSearch(true);
}
async function saveCurrentSearch(fromEntry) {
  const q = fromEntry ? fromEntry.q : S.q.trim();
  const params = fromEntry ? fromEntry.params : currentParams();
  const def = q || searchSummary({ params }).slice(2).join(' ') || '我的檢索';
  const name = await promptDialog('保存檢索', '起個名字。之後在側欄「已保存的檢索」或檢索框的下拉裡一點即可重跑——連同匹配方式、模糊、範圍和篩選。', def, '保存');
  if (!name || !name.trim()) return;
  try {
    S.searches = await api('searches/add', { kind: 's', name: name.trim(), q, params });
    renderSidebar(); renderResHead();
    if (qpOpen()) renderQPanel();
    toast('已保存到側欄「已保存的檢索」');
  } catch (err) { fail(err); }
}
async function savedMenu(x, y, e) {
  showMenu(x, y, [
    { label: '重跑', icon: 'search', act: () => applySearch(e) },
    { sep: true },
    { label: '重命名…', icon: 'pencil', act: async () => {
      const n = await promptDialog('重命名保存的檢索', '', e.name);
      if (n && n.trim()) { S.searches = await api('searches/update', { id: e.id, name: n.trim() }); renderSidebar(); renderResHead(); }
    } },
    { label: '用當前檢索更新', icon: 'refresh', act: async () => {
      S.searches = await api('searches/update', { id: e.id, q: S.q.trim(), params: currentParams() });
      renderSidebar(); renderResHead(); toast(`「${e.name}」已更新為當前的檢索`);
    } },
    { sep: true },
    { label: '刪除', icon: 'trash', danger: true, act: async () => {
      S.searches = await api('searches/remove', { id: e.id }); renderSidebar(); renderResHead();
      toast(`已刪除「${e.name}」`);
    } },
  ]);
}
// ---- 檢索框下的下拉：已保存在前，最近的在後
let qpIdx = -1;
const qpOpen = () => !$('#qpanel').hidden;
function qpEntries() {
  const saved = S.searches.saved, sk = new Set(saved.map(e => searchKey(e.q, e.params)));
  return { saved, hist: S.searches.history.filter(e => !sk.has(searchKey(e.q, e.params))) };
}
function qpRow(e, kind) {
  const meta = searchSummary(e).map(x => `<span class="qp-tag">${esc(x)}</span>`).join('');
  const main = kind === 's'
    ? esc(e.name) + (e.q && e.q !== e.name ? `<span class="qp-sub">「${esc(e.q)}」</span>` : '')
    : (e.q ? esc(e.q) : '<span class="qp-sub" style="margin:0">只用篩選</span>');
  return `<div class="qp-row" data-qp="${e.id}">
    <span class="qp-ic${kind === 's' ? ' saved' : ''}">${kind === 's' ? I.starFill : CLOCK}</span>
    <span class="qp-main"><span class="qp-q">${main}</span><span class="qp-meta">${meta}</span></span>
    ${kind === 'h' ? `<span class="qp-time">${fmtAgo(e.ts)}</span>` : ''}
    <span class="qp-act">${kind === 'h' ? `<button data-qp-save="${e.id}" title="保存這個檢索">${I.star}</button>` : ''}
      <button data-qp-del="${e.id}" title="${kind === 'h' ? '從歷史中刪去' : '刪除這個保存的檢索'}">${I.x}</button></span></div>`;
}
function renderQPanel() {
  const { saved, hist } = qpEntries(), el = $('#qpanel');
  qpIdx = -1;
  if (!saved.length && !hist.length) {
    el.innerHTML = `<div class="qp-empty">${S.settings.history_on === '0' ? '檢索歷史的記錄已在設置裡關閉。' :
      '還沒有檢索歷史。檢索後停留片刻、按回車或打開結果，就會記在這裡。'}<br>點結果上方的 ☆ 可以把常用的檢索保存下來。</div>`;
    return;
  }
  let h = '';
  if (saved.length) h += `<div class="qp-h"><span>已保存</span></div>` + saved.map(e => qpRow(e, 's')).join('');
  if (hist.length) h += `<div class="qp-h"><span>最近</span><button class="qp-link" data-qp-clear>清除歷史</button></div>` + hist.map(e => qpRow(e, 'h')).join('');
  el.innerHTML = h;
}
function openQPanel() { renderQPanel(); $('#qpanel').hidden = false; $('#q-hist').classList.add('on'); }
function closeQPanel() { $('#qpanel').hidden = true; $('#q-hist').classList.remove('on'); qpIdx = -1; }
function qpMove(d) {
  const rows = $$('#qpanel .qp-row');
  if (!rows.length) return;
  qpIdx = qpIdx < 0 ? (d > 0 ? 0 : rows.length - 1) : (qpIdx + d + rows.length) % rows.length;
  rows.forEach((r, i) => r.classList.toggle('on', i === qpIdx));
  rows[qpIdx].scrollIntoView({ block: 'nearest' });
}
const qpEntry = id => S.searches.saved.find(e => e.id === id) || S.searches.history.find(e => e.id === id);
$('#qpanel').addEventListener('mousedown', e => e.preventDefault());      // 不讓檢索框失去焦點
$('#qpanel').addEventListener('click', async e => {
  const del = e.target.closest('[data-qp-del]'), sv = e.target.closest('[data-qp-save]');
  if (e.target.closest('[data-qp-clear]')) {
    S.searches = await api('searches/remove', { clear: true });
    lastHistKey = '';
    return renderQPanel();
  }
  if (del) { S.searches = await api('searches/remove', { id: +del.dataset.qpDel }); renderSidebar(); renderResHead(); return renderQPanel(); }
  if (sv) { const en = qpEntry(+sv.dataset.qpSave); closeQPanel(); return en && saveCurrentSearch(en); }
  const row = e.target.closest('.qp-row');
  if (row) { const en = qpEntry(+row.dataset.qp); if (en) applySearch(en); }
});
$('#q-hist').addEventListener('mousedown', e => e.preventDefault());
$('#q-hist').onclick = () => { if (qpOpen()) closeQPanel(); else { qEl.focus(); openQPanel(); } };
qEl.addEventListener('mousedown', () => { if (!qEl.value.trim()) setTimeout(() => { if (!qEl.value.trim()) openQPanel(); }, 0); });
qEl.addEventListener('blur', () => setTimeout(() => { if (document.activeElement !== qEl) closeQPanel(); }, 120));
document.addEventListener('mousedown', e => { if (qpOpen() && !e.target.closest('.search')) closeQPanel(); });

// ===================================================================== 查重：內容相同的文件
let dupSeq = 0;
function openDupView() {
  S.dupView = true;
  S.dupData = null;
  S.dupKeep = {};
  closeQPanel();
  renderSidebar();
  loadDups();
}
async function loadDups() {
  const seq = ++dupSeq, p = new URLSearchParams();
  filterParams(p);
  S.loading = true;
  renderResults();
  try {
    const r = await api('duplicates?' + p);
    if (seq !== dupSeq || !S.dupView) return;
    S.dupData = r;
    S.items = r.groups.flatMap(g => g.items);
    if (!S.items.some(i => i.id === S.cur)) { S.cur = S.items.length ? S.items[0].id : null; S.sel = new Set(S.cur ? [S.cur] : []); }
    S.loading = false;
    renderResults();
    if (S.cur && (!S.pv || S.pv.id !== S.cur)) loadPreview(S.cur);
    if (!hasFilter()) S.dupCount = r.count;            // 側欄的數字只記不加篩選時的總組數
    renderSidebar();
  } catch (err) { S.loading = false; renderResults(); fail(err); }
}
function renderDupView(list) {
  const d = S.dupData;
  if (!d) { list.innerHTML = `<div class="empty"><span class="spin" style="width:22px;height:22px"></span><h3>正在比對……</h3><p>第一次要讀一下各文件的開頭、中間和結尾，稍等片刻</p></div>`; return; }
  if (!d.groups.length) {
    list.innerHTML = `<div class="empty">${I.copy.replace('<svg', '<svg class="big-ic"')}<h3>沒有內容相同的文件</h3><p>${hasFilter() ? '當前篩選範圍內' : '資料庫裡'}沒有找到重複的文件。</p></div>`;
    return;
  }
  list.innerHTML = d.groups.map((g, gi) => {
    const keep = S.dupKeep[gi] != null ? S.dupKeep[gi] : g.items[0].id;
    // 同組各份的路徑只顯示彼此不同的那一截（共同的上層文件夾省作「…」），完整路徑在懸停提示裡
    const segs = g.items.map(it => relDir(it).split(' › '));
    let k = 0;
    while (segs.every(s => k < s.length - 1 && s[k] === segs[0][k])) k++;
    const short = i => (k ? '… › ' : '') + segs[i].slice(k).join(' › ');
    return `<div class="dgroup" data-g="${gi}">
      <div class="dg-head"><span class="dg-kind ${g.kind}" title="${g.kind === 't' ? '抽出的文字完全相同（文件本身可能不同，如掃描質量、書籤）' : '文件逐字節相同'}">${g.kind === 't' ? '文字相同' : '完全相同'}</span>
        <span>${g.items.length} 份 · 每份 ${fmtSize(g.size)}</span><span class="grow"></span>
        <button class="btn mini danger" data-dg-trash="${gi}">其餘 ${g.items.length - 1} 份移到廢紙簍</button></div>
      ${g.items.map((it, ii) => `<div class="item dg-row${it.id === S.cur ? ' sel' : ''}" data-id="${it.id}">
        <button class="dg-keep${it.id === keep ? ' on' : ''}" data-keep="${it.id}" data-g="${gi}" title="${it.id === keep ? '保留這一份' : '點一下改為保留這一份'}">${it.id === keep ? '保留' : '移走'}</button>
        <span class="badge k-${it.kind}">${esc(badgeText(it))}</span>
        <span class="dg-main"><span class="dg-name" title="${esc(it.name)}">${esc(it.name)}</span>
        <span class="dg-path" title="${esc(it.dir)}">${esc(short(ii))}</span></span>
        <span class="dg-date">${fmtDate(it.mtime)}</span></div>`).join('')}</div>`;
  }).join('') + (d.count > d.groups.length ? `<p class="dg-more">只列出前 ${d.groups.length} 組（共 ${fmtNum(d.count)} 組），可在側欄按類型或文件夾縮小範圍。</p>` : '');
}
async function trashDupGroup(gi) {
  const g = S.dupData.groups[gi], keep = S.dupKeep[gi] != null ? S.dupKeep[gi] : g.items[0].id;
  const keepIt = g.items.find(it => it.id === keep), ids = g.items.filter(it => it.id !== keep).map(it => it.id);
  if (g.kind === 'b') {
    const v = await api('dups/verify', { ids: [keep].concat(ids) });
    if (!v.same) return toast('逐字節核對後發現它們並不完全相同' + (v.why ? '（' + v.why + '）' : '') + '，沒有移動', { err: true });
  }
  if (!await confirmDialog(`把其餘 ${ids.length} 份移到廢紙簍？`,
    `保留：${esc(relDir(keepIt))} › <b>${esc(keepIt.name)}</b><br>可以在訪達的廢紙簍中用「放回原處」恢復，收藏、標籤、備註會一併清除。` +
    (g.kind === 't' ? '<br>注意：這幾份只是<b>抽出的文字</b>相同，文件本身可能不同（如掃描質量、書籤）。' : ''), '移到廢紙簍', true)) return;
  try {
    const r = await api('trash', { ids });
    if (r.errors && r.errors.length) toast(r.errors.join('；'), { err: true });
    if (r.trashed) toast(`已移到廢紙簍 ${r.trashed} 個文件`);
    S.dupKeep = {};
    await refreshState();
    loadDups();
  } catch (err) { fail(err); }
}
// 模糊與正則不能同時開：開一個就關掉另一個（兩個開關都看得見）
function renderFuzzy() {
  const fz = S.fuzzy && !S.regex;
  $('#fz').classList.toggle('on', fz);
  $('#fz-btn').setAttribute('aria-pressed', fz ? 'true' : 'false');
  $('#fz-btn').title = S.regex ? '模糊檢索（⌘4）—— 打開會關掉正則' : '模糊檢索：容許脫字、衍字、訛字（⌘4）';
  $('#fz-sim').value = S.fzSim;
  const re = $('#q-re');
  re.classList.toggle('on', S.regex);
  re.setAttribute('aria-pressed', S.regex ? 'true' : 'false');
  $('.search').classList.toggle('rx', S.regex);
  qEl.placeholder = S.regex ? '正則表達式 —— 漢字仍按匹配方式互通，如 萬曆.{1,4}年' : '檢索文件名與全文 —— 簡、繁、異體互通';
}
function setFuzzy(on, sim) {
  S.fuzzy = !!on;
  if (sim) S.fzSim = sim;
  const st = { fuzzy: S.fuzzy ? '1' : '0', fuzzy_sim: S.fzSim };
  if (S.fuzzy && S.regex) { S.regex = false; st.regex = '0'; }
  renderFuzzy();
  api('settings', st).catch(() => {});
  S.limit = 200;
  runSearch({ keepScroll: true });
}
function setRegex(on, quiet) {
  S.regex = !!on;
  const st = { regex: S.regex ? '1' : '0' };
  if (S.regex && S.fuzzy) { S.fuzzy = false; st.fuzzy = '0'; }
  renderFuzzy();
  api('settings', st).catch(() => {});
  if (synOpen()) renderSyn();
  S.limit = 200;
  if (!quiet && S.q.trim()) runSearch({ keepScroll: true });
}
$('#q-re').addEventListener('mousedown', e => e.preventDefault());
$('#q-re').onclick = () => setRegex(!S.regex);
$('#fz-btn').onclick = () => setFuzzy(!S.fuzzy);
$('#fz-sim').onchange = e => setFuzzy(true, e.target.value);

function showHelp() {
  dialog({
    title: '使用說明', wide: true,
    body: `<table class="syntax">
      <tr><td>萬曆 張居正</td><td>空格分隔：同時包含兩個詞</td></tr>
      <tr><td>後金 | 建州</td><td><code>|</code>：包含任一個詞</td></tr>
      <tr><td>萬曆 -天啟</td><td>減號（或 <code>!</code>）：排除包含該詞的文件</td></tr>
      <tr><td>"Grand Secretary"</td><td>引號：把含空格的西文短語當作一個詞</td></tr>
      <tr><td>萬曆*年　萬曆??年</td><td>通配符：<code>*</code> 任意幾個字（不越過句末標點），<code>?</code> 一個字</td></tr>
      <tr><td>ext:pdf size:>10mb</td><td>篩選詞：<code>ext:</code> 擴展名、<code>size:</code> 大小、<code>dm:</code> 修改時間、<code>path:</code> 路徑，前加 <code>-</code> 排除</td></tr>
      <tr><td>.* 正則</td><td>檢索框裡的 <code>.*</code>（⌘5）：整個檢索式按正則表達式匹配，漢字仍按匹配方式互通</td></tr>
      <tr><td>万历</td><td>「異體」模式下可得 萬曆、萬歷、万暦、萬厤 等寫法；跨行斷開的詞也能找到</td></tr>
      <tr><td>≈ 模糊</td><td>工具欄的「模糊」：容許脫字、衍字、訛字，如「李自成攻陷京師」也可得「李自成陷京師」。
        按相似度（1 − 差異字數 ÷ 檢索詞字數）篩選，空白和標點不計；3 字以上的詞才模糊匹配，排除詞仍按原方式</td></tr>
    </table>
    <div class="field"><label>限定檢索範圍</label>
      <p class="hint" style="margin:0">點側欄的文件夾 —— 只在該文件夾內檢索；⌘ 點擊可同時選幾個文件夾<br>
      在結果上右鍵 →「只在選中項中檢索」／「加入檢索範圍」—— 自選若干文件和文件夾；點結果上方的「範圍」標籤可查看、移除<br>
      預覽全文時按 ⌘F —— 只在當前文件內查找（與上方檢索框互不干擾，模糊開關也各自獨立）</p></div>
    <div class="field"><label>檢索歷史與保存的檢索</label>
      <p class="hint" style="margin:0">點空的檢索框、點框裡的時鐘圖標或按 ↓，列出保存的檢索和最近的檢索（連同匹配方式、模糊、範圍和篩選），↑↓ 選、回車重跑。<br>
      結果上方的 ☆ 把當前檢索保存到側欄。側欄「類型」每行一類：點行選整類，點附標只選這一種擴展名，可多選，「＋」可輸入任意擴展名；什麼都不選就是全部類型。</p></div>
    <div class="field"><label>全部命中、逐處跳</label>
      <p class="hint" style="margin:0">點結果裡的「全部 N 處」（或命中數），在結果裡展開這個文件每一處命中的上下文，懸停、點擊即跳過去。<br>
      全文和原件裡都可以用 ⌘G／⇧⌘G 跳到下一處、上一處命中。</p></div>
    <div class="field"><label>重複文件</label>
      <p class="hint" style="margin:0">檢索結果裡內容相同的文件合成一條，點「另有 N 個副本」展開。側欄「重複文件」列出全部重複的組，選留一份，其餘移到廢紙簍（移動前逐字節核對）。</p></div>
    <div class="field"><label>PDF 原件</label>
      <p class="hint" style="margin:0">「原件」逐頁顯示，黃底標出命中。先單擊選中左側的文件，再把鼠標停在它片段裡命中的詞上，右側預覽（全文或原件）就跳到那一處。<br>
      雙擊命中的詞，在全文與原件之間來回跳（原件上用紅框標出）；全文裡其他位置可右鍵 →「在原件中查看此處」，原件上右鍵 →「在全文中查看這段」。原件上可以直接拖選文字、⌘C 拷貝（保留換行），右鍵可檢索、附出處拷貝、在全文中查看；空白處拖動平移。<br>
      掃描件沒有文字層，無法標註。<br>
      Word（docx、doc）的「原件」由通檢按原文件重新排版（分頁與 Word 不同），標註、懸停跳轉、雙擊互跳、選字都與 PDF 一樣。</p></div>
    <div class="field"><label>三種匹配方式</label>
      <p class="hint" style="margin:0">精確 —— 只匹配輸入的字形（不分大小寫、全半角）<br>
      簡繁 —— 簡體與繁體互通，如 后/後、历/歷/曆<br>
      異體 —— 再加上異體字、舊字形、日本新字體、康熙部首、兼容漢字，如 峯/峰、爲/為、靑/青</p></div>
    <div class="legend"><span><span class="h1">原字命中</span></span><span><span class="h2">異體命中</span>（原文字形與檢索詞不同）</span>
      <span><span class="h3">模糊差異</span>（與檢索詞不同的字）</span></div>
    <div class="field"><label>快捷鍵</label><p class="hint" style="margin:0">
      ⌘K 檢索框 · ⌘F 在本文件內查找 · ↑↓ 選擇文件 · ↩ 打開 · 空格 快速查看 · ⌘R 在訪達中顯示 · ⌘G / ⇧⌘G 下一處／上一處命中 ·
      ⌘D 收藏 · F2 重命名 · ⌘⌫ 移到廢紙簍 · ⌘1/2/3 切換匹配方式 · ⌘4 模糊開關 · ⌘5 正則開關</p></div>
    <p class="hint">通配符、篩選詞、正則的寫法和例子：點工具欄右上角的 <b>?</b>。</p>`,
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
    desc: '匹配方式（異體）、模糊檢索（關）、正則（關）、本文件內查找的模糊（關）、檢索範圍（僅文件名）、排序、名稱排序規則（跟隨系統）、跨標點匹配（關）、實時監聽（開）、' +
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
    S.regex = s2.settings.regex === '1';
    S.fzSim = s2.settings.fuzzy_sim || '0.7';
    S.find.fz = s2.settings.find_fuzzy === '1';
    S.find.sim = s2.settings.find_sim || '0.7';
    S.pdfZoom = null;
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
      <div class="field"><label class="switch"><input type="checkbox" id="st-merge" ${st.merge_dups !== '0' ? 'checked' : ''}>合併內容相同的文件</label>
      <p class="hint" style="margin:4px 0 0 44px">檢索結果裡文字相同（或逐字節相同）的文件合成一條，點「另有 N 個副本」展開。</p></div>
      <div class="field"><label class="switch"><input type="checkbox" id="st-hist" ${st.history_on !== '0' ? 'checked' : ''}>記錄檢索歷史</label>
      <p class="hint" style="margin:4px 0 0 44px">只存在本機的資料庫裡，最多 60 條。<a href="#" data-clear-hist>清除歷史</a></p></div>
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
    merge_dups: $('#st-merge', el).checked ? '1' : '0', history_on: $('#st-hist', el).checked ? '1' : '0',
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
  if (e.key === 'Escape') { if (menuEl) return closeMenu(); if (synOpen()) return closeSyn(); return; }
  if (typing) return;
  if (mod && ['1', '2', '3'].includes(e.key)) { e.preventDefault(); return setMode(['exact', 'st', 'full'][+e.key - 1]); }
  if (mod && e.key === '4') { e.preventDefault(); return setFuzzy(!(S.fuzzy && !S.regex)); }
  if (mod && e.key === '5') { e.preventDefault(); return setRegex(!S.regex); }
  if (mod && e.key.toLowerCase() === 'g') {
    e.preventDefault();
    if (S.pvTab === 'orig' && (V || DV)) return origHit(e.shiftKey ? -1 : 1);
    return gotoHit(S.hit + (e.shiftKey ? -1 : 1));
  }
  if (inQ) return;
  if (e.key === '/' ) { e.preventDefault(); qEl.focus(); qEl.select(); return; }
  if ((e.key === 'ArrowLeft' || e.key === 'ArrowRight') && V && S.pvTab === 'orig' && $('#pdfv')) {
    e.preventDefault();
    return toPage(V.cur + (e.key === 'ArrowRight' ? 1 : -1));
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
document.addEventListener('click', async e => {
  const a = e.target.closest('[data-clear-hist]');
  if (!a) return;
  e.preventDefault();
  try { S.searches = await api('searches/remove', { clear: true }); lastHistKey = ''; toast('已清除檢索歷史'); } catch (err) { fail(err); }
});

// ===================================================================== 右鍵
// 結果、側欄、文件夾樹、原件頁面有各自的菜單（在各自的監聽器裡處理）。選中的文字、輸入框用系統菜單：
// 外殼會去掉「重新載入」「檢查元件」之類的無關項，並在全文裡加上通檢自己的命令。其餘地方（按鈕、工具欄、空白處）不彈菜單。
function selectionUnder(sel, x, y) {
  if (!sel || !sel.rangeCount) return false;
  return Array.from(sel.getRangeAt(0).getClientRects()).some(r => x >= r.left - 2 && x <= r.right + 2 && y >= r.top - 2 && y <= r.bottom + 2);
}
function nativeMenu(info) {
  try { window.webkit.messageHandlers.tj.postMessage(Object.assign({ cmd: 'menu' }, info)); } catch (err) { /* 瀏覽器模式 */ }
}
document.addEventListener('contextmenu', e => {
  if (e.defaultPrevented) return;
  const t = e.target;
  if (t.closest && t.closest('input, textarea, select, [contenteditable="true"]')) return nativeMenu({ kind: 'edit' });
  const sel = window.getSelection();
  const selText = sel && !sel.isCollapsed ? sel.toString().trim() : '';
  const rd = t.closest && t.closest('#reader');
  if (rd && S.pv && !S.pv.folder) {
    const inSel = !!selText && sel.anchorNode && rd.contains(sel.anchorNode) && selectionUnder(sel, e.clientX, e.clientY);
    let s = null, en = null;
    if (inSel) {
      const r = sel.getRangeAt(0);
      s = readerOffset(r.startContainer, r.startOffset);
      en = readerOffset(r.endContainer, r.endOffset);
    } else {
      const cr = document.caretRangeFromPoint && document.caretRangeFromPoint(e.clientX, e.clientY);
      if (cr) s = en = readerOffset(cr.startContainer, cr.startOffset);
    }
    S.ctx = { kind: 'reader', id: S.pv.id, sel: inSel ? selText : '', s, e: en };
    const pdf = canOrigPv(S.pv) && s != null;
    if (!S.native) { e.preventDefault(); return readerMenu(e.clientX, e.clientY, pdf); }
    return nativeMenu({ kind: 'reader', sel: S.ctx.sel.slice(0, 80), pdf });
  }
  if (selText && selectionUnder(sel, e.clientX, e.clientY)) {
    S.ctx = { kind: 'text', sel: selText };
    return nativeMenu({ kind: 'text', sel: selText.slice(0, 80) });
  }
  e.preventDefault();
});
function citeText(c) {
  const pv = S.pv, name = (pv.name || '').replace(/\.[^.]+$/, '');
  const page = pv.text && pv.text.indexOf('\f') >= 0 && c.s != null ? pageOfOffset(pv, c.s) : 0;
  return `${c.sel}（《${name}》${page ? `，PDF 第 ${page} 頁` : ''}）`;
}
function ctxAction(action) {
  const c = S.ctx;
  if (!c) return;
  if (action === 'search' && c.sel) { qEl.value = c.sel; onQuery(); runSearch(); }
  else if (action === 'find' && c.sel) { S.find.q = c.sel; openFind(); const inp = $('#find-q'); if (inp) inp.value = c.sel; runFind(); }
  else if (action === 'cite' && c.sel) copyText(citeText(c));
  else if (action === 'copy' && c.sel) copyText(c.sel);
  else if (action === 'orig' && c.kind === 'reader') locateInOrig(c.s, c.e);
  else if (action === 'text' && c.kind === 'orig') { window.getSelection().removeAllRanges(); gotoText(c.s, c.e); }
}
// 瀏覽器模式（沒有原生外殼）下全文裡的菜單
function readerMenu(x, y, pdf) {
  const c = S.ctx, short = c.sel.length > 12 ? c.sel.slice(0, 12) + '…' : c.sel;
  const items = [
    c.sel && { label: '拷貝', icon: 'copy', act: () => ctxAction('copy') },
    c.sel && { label: '拷貝（附出處）', icon: 'copy', act: () => ctxAction('cite') },
    c.sel && { sep: true },
    c.sel && { label: `在通檢中檢索「${short}」`, icon: 'search', act: () => ctxAction('search') },
    c.sel && { label: `在本文件內查找「${short}」`, icon: 'search', act: () => ctxAction('find') },
    pdf && { label: '在原件中查看此處', icon: 'page', act: () => ctxAction('orig') },
  ].filter(Boolean);
  showMenu(x, y, items.length ? items : [{ label: '沒有可用的操作', disabled: true }]);
}
// 雙擊全文裡命中的詞：在原件中查看（原件上雙擊命中處則回到全文）
document.addEventListener('mousedown', e => {
  if (e.detail > 1 && e.target.closest && e.target.closest('#reader.can-orig mark[data-i]')) e.preventDefault();   // 不選詞
});
document.addEventListener('dblclick', e => {
  const m = e.target.closest && e.target.closest('#reader.can-orig mark[data-i]');
  if (!m || !S.spans) return;
  const i = +m.dataset.i, sp = S.spans[i];
  if (!sp) return;
  e.preventDefault();
  window.getSelection().removeAllRanges();
  S.hit = i;
  locateInOrig(sp[0], sp[1]);
});

async function init() {
  try {
    const st = await api('state');
    S.roots = st.roots; S.tags = st.tags; S.stats = st.stats; S.status = st.status;
    try { S.searches = await api('searches'); } catch (err) { /* 舊數據庫 */ }
    S.settings = st.settings; S.meta = st.variant_meta; S.tools = st.tools; S.db = st.db;
    S.tagColors = st.tag_colors; S.customGroups = st.custom_groups; S.defaults = st.defaults;
    S.mode = ['exact', 'st', 'full'].includes(st.settings.mode) ? st.settings.mode : 'full';
    S.scope = st.settings.scope || 'name';
    S.projects = st.projects || [];
    S.sort = st.settings.sort || 'relevance';
    S.fuzzy = st.settings.fuzzy === '1';
    S.regex = st.settings.regex === '1' && !S.fuzzy;
    S.fzSim = ['0.9', '0.8', '0.7', '0.6', '0.5'].includes(st.settings.fuzzy_sim) ? st.settings.fuzzy_sim : '0.7';
    S.readerSize = Math.max(12, Math.min(28, +st.settings.reader_size || 16));
    S.find.fz = st.settings.find_fuzzy === '1';
    S.find.sim = ['0.9', '0.8', '0.7', '0.6', '0.5'].includes(st.settings.find_sim) ? st.settings.find_sim : '0.7';
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
