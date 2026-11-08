/*! save.js · Case Files · CFSave
 *  CFSave.save(caseId, state, {label})  -> bool        state = any JSON-serialisable object
 *  CFSave.load(caseId)                  -> state | null
 *  CFSave.has(caseId) / clear(caseId) / list() -> [{caseId,label,savedAt}] newest first
 *  CFSave.autosave(caseId, getState, {label: () => 'str', delay=400}) -> {touch(), stop()}
 *      touch() after every player action; also saves on tab hide / close.
 *  CFSave.mountContinue(el, {titles:{caseId:'Title'}, onResume(caseId,state), onDelete?(caseId)}) -> {refresh()}
 *  Falls back to in-memory if localStorage is blocked. Bump CFSave.config({version}) to invalidate old saves.
 */
(function (g) {
  'use strict';

  const CFG = { prefix: 'cf_save_', version: 1 };
  const mem = {};

  const ls = {
    get(k) { try { const v = localStorage.getItem(k); if (v !== null) return v; } catch (e) {} return mem[k] == null ? null : mem[k]; },
    set(k, v) { try { localStorage.setItem(k, v); delete mem[k]; } catch (e) { mem[k] = v; } },
    del(k) { try { localStorage.removeItem(k); } catch (e) {} delete mem[k]; },
    keys() { let a = []; try { a = Object.keys(localStorage); } catch (e) {} return [...new Set(a.concat(Object.keys(mem)))]; }
  };

  const key = id => CFG.prefix + id;
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const ago = t => {
    const s = (Date.now() - t) / 1000;
    if (s < 60) return 'just now';
    if (s < 3600) return Math.floor(s / 60) + ' min ago';
    if (s < 86400) return Math.floor(s / 3600) + ' h ago';
    return Math.floor(s / 86400) + ' d ago';
  };

  function read(id) {
    try {
      const o = JSON.parse(ls.get(key(id)));
      return o && o.v === CFG.version ? o : null;
    } catch (e) { return null; }
  }

  function save(id, state, meta) {
    try {
      ls.set(key(id), JSON.stringify({ v: CFG.version, savedAt: Date.now(), label: (meta && meta.label) || '', state }));
      return true;
    } catch (e) { return false; }
  }

  const load = id => { const o = read(id); return o ? o.state : null; };
  const has = id => !!read(id);
  const clear = id => ls.del(key(id));
  const list = () => ls.keys().filter(k => k.indexOf(CFG.prefix) === 0).map(k => {
    const id = k.slice(CFG.prefix.length), o = read(id);
    return o && { caseId: id, label: o.label, savedAt: o.savedAt };
  }).filter(Boolean).sort((a, b) => b.savedAt - a.savedAt);

  function autosave(id, getState, o) {
    o = o || {};
    let t = null;
    const flush = () => { clearTimeout(t); t = null; save(id, getState(), { label: o.label ? o.label() : '' }); };
    const touch = () => { clearTimeout(t); t = setTimeout(flush, o.delay == null ? 400 : o.delay); };
    const hide = () => { if (document.visibilityState === 'hidden') flush(); };
    document.addEventListener('visibilitychange', hide);
    window.addEventListener('pagehide', flush);
    return { touch, flush, stop() { clearTimeout(t); document.removeEventListener('visibilitychange', hide); window.removeEventListener('pagehide', flush); } };
  }

  let cssDone = false;
  function injectCSS() {
    if (cssDone) return; cssDone = true;
    const s = document.createElement('style');
    s.textContent = `
.cfs{background:var(--cf-panel,#1c2028);color:var(--cf-text,#e8e6e1);border-radius:14px;padding:16px;font:14px/1.4 system-ui,sans-serif;box-shadow:0 0 0 1px rgba(255,255,255,.06);display:grid;gap:10px}
.cfs h3{margin:0;font:600 13px/1 system-ui;letter-spacing:.1em;text-transform:uppercase;color:var(--cf-muted,#8b93a1)}
.cfs-row{display:flex;align-items:center;gap:12px;padding:10px 12px;border-radius:10px;background:#161a21}
.cfs-info{flex:1;min-width:0}
.cfs-title{font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.cfs-meta{font-size:12px;color:var(--cf-muted,#8b93a1)}
.cfs button{font:inherit;cursor:pointer;border:0;border-radius:8px;padding:8px 14px;transition:filter .15s,transform .1s}
.cfs-go{background:var(--cf-accent,#d9a441);color:#1a1405;font-weight:600}
.cfs-del{background:transparent;color:var(--cf-muted,#8b93a1);padding:8px 10px!important}
.cfs button:hover{filter:brightness(1.12)}.cfs button:active{transform:scale(.97)}
.cfs button:focus-visible{outline:2px solid var(--cf-accent,#d9a441);outline-offset:2px}`;
    document.head.appendChild(s);
  }

  function mountContinue(el, o) {
    o = o || {}; injectCSS();
    const root = document.createElement('section');
    root.className = 'cfs';
    el.appendChild(root);

    function refresh() {
      const items = list();
      root.hidden = !items.length;
      root.innerHTML = '<h3>Continue investigation</h3>' + items.map(it =>
        '<div class="cfs-row"><div class="cfs-info"><div class="cfs-title">' + esc((o.titles && o.titles[it.caseId]) || it.caseId) + '</div>' +
        '<div class="cfs-meta">' + (it.label ? esc(it.label) + ' · ' : '') + 'saved ' + ago(it.savedAt) + '</div></div>' +
        '<button class="cfs-go" data-go="' + esc(it.caseId) + '">Resume</button>' +
        '<button class="cfs-del" data-del="' + esc(it.caseId) + '" aria-label="Delete save">✕</button></div>').join('');
    }

    root.addEventListener('click', e => {
      const go = e.target.closest('[data-go]'), del = e.target.closest('[data-del]');
      if (go) { const id = go.dataset.go; o.onResume && o.onResume(id, load(id)); }
      if (del) { const id = del.dataset.del; clear(id); o.onDelete && o.onDelete(id); refresh(); }
    });

    refresh();
    return { refresh };
  }

  g.CFSave = { save, load, has, clear, list, autosave, mountContinue, config: o => Object.assign(CFG, o) };
})(window);
