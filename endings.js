/*! endings.js · Case Files · CFEndings
 *  CFEndings.register(caseId, {title, endings:[{id, title, hint, type:'good'|'bad'|'neutral'|'secret', summary?}]})
 *  CFEndings.unlock(caseId, endingId) -> true if newly unlocked   (persisted in localStorage)
 *  CFEndings.isUnlocked(caseId, endingId) / progress(caseId?) -> {unlocked,total} / reset()
 *  CFEndings.mount(el, {caseId?}) -> {destroy}   gallery; omit caseId for all registered cases
 *  Locked endings render as silhouettes with a hint; secret endings stay "???" until found.
 *  Fires 'cf:ending-unlocked' {caseId, endingId, isNew, progress}
 */
(function (g) {
  'use strict';

  const KEY = 'cf_endings_v1';
  const TYPES = {
    good:    { label: 'Solved',     color: '#4fb286' },
    bad:     { label: 'Failed',     color: '#e0584d' },
    neutral: { label: 'Unresolved', color: '#8a94a6' },
    secret:  { label: 'Secret',     color: '#b57bee' }
  };

  const reg = {};
  const mem = { data: null };
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  function read() {
    if (mem.data) return mem.data;
    try { mem.data = JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { mem.data = {}; }
    return mem.data;
  }
  function write() { try { localStorage.setItem(KEY, JSON.stringify(mem.data)); } catch (e) {} }

  const isUnlocked = (c, e) => (read()[c] || []).includes(e);
  function progress(c) {
    const cases = c ? [c] : Object.keys(reg);
    return cases.reduce((p, id) => {
      const list = (reg[id] && reg[id].endings) || [];
      p.total += list.length;
      p.unlocked += list.filter(e => isUnlocked(id, e.id)).length;
      return p;
    }, { unlocked: 0, total: 0 });
  }

  const justNow = new Set();
  function unlock(c, e) {
    const d = read(), isNew = !(d[c] || []).includes(e);
    if (isNew) { (d[c] = d[c] || []).push(e); write(); justNow.add(c + '|' + e); }
    document.dispatchEvent(new CustomEvent('cf:ending-unlocked', { detail: { caseId: c, endingId: e, isNew, progress: progress(c) } }));
    return isNew;
  }

  const figure = (c, locked) =>
    '<svg viewBox="0 0 80 100" aria-hidden="true"><ellipse cx="40" cy="38" rx="30" ry="6" fill="' + c + '"/>' +
    '<path d="M24 38C24 18 56 18 56 38Z" fill="' + c + '"/><circle cx="40" cy="52" r="12" fill="' + c + '"/>' +
    '<path d="M12 100C12 72 26 66 40 66S68 72 68 100Z" fill="' + c + '"/>' +
    (locked ? '<text x="40" y="92" text-anchor="middle" font-size="22" font-weight="700" fill="rgba(255,255,255,.22)">?</text>'
            : '<rect x="24" y="31" width="32" height="4" fill="rgba(0,0,0,.35)"/>') + '</svg>';

  let cssDone = false;
  function injectCSS() {
    if (cssDone) return; cssDone = true;
    const s = document.createElement('style');
    s.textContent = `
.cfe{color:var(--cf-text,#e8e6e1);font:14px/1.4 system-ui,sans-serif;display:grid;gap:28px}
.cfe-case{display:grid;gap:14px}
.cfe-head{display:flex;align-items:baseline;justify-content:space-between;gap:12px}
.cfe-head h3{margin:0;font:600 18px/1.2 var(--cf-font-display,Georgia,serif)}
.cfe-count{font:600 12px/1 system-ui;color:var(--cf-muted,#8b93a1);letter-spacing:.06em}
.cfe-bar{height:4px;border-radius:9px;background:#232832;overflow:hidden}
.cfe-bar i{display:block;height:100%;background:var(--cf-accent,#d9a441);transition:width .5s}
.cfe-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:12px}
.cfe-card{--c:#2c3340;position:relative;display:grid;grid-template-rows:84px auto;gap:10px;padding:14px;border-radius:14px;background:var(--cf-panel,#1c2028);box-shadow:0 0 0 1px rgba(255,255,255,.06);transition:transform .2s,box-shadow .2s}
.cfe-card svg{height:100%;width:100%;justify-self:center}
.cfe-card.on{--c:var(--t);box-shadow:0 0 0 1px var(--t),0 8px 24px -10px var(--t)}
.cfe-card.on:hover{transform:translateY(-2px)}
.cfe-card.new{animation:cfe-glow 1.4s ease-out 2}
.cfe-tag{position:absolute;top:10px;right:10px;font:700 10px/1 system-ui;letter-spacing:.08em;text-transform:uppercase;padding:4px 7px;border-radius:99px;background:rgba(255,255,255,.07);color:var(--cf-muted,#8b93a1)}
.cfe-card.on .cfe-tag{background:var(--t);color:#10131a}
.cfe-card.secret:not(.on) .cfe-tag{color:#b57bee}
.cfe-title{font-weight:600}
.cfe-card:not(.on) .cfe-title{color:var(--cf-muted,#8b93a1);letter-spacing:.2em}
.cfe-text{margin-top:3px;font-size:12px;color:var(--cf-muted,#8b93a1)}
.cfe-hint{font-style:italic}
@keyframes cfe-glow{0%{box-shadow:0 0 0 2px var(--t),0 0 30px var(--t)}100%{box-shadow:0 0 0 1px var(--t),0 8px 24px -10px var(--t)}}
@media (prefers-reduced-motion:reduce){.cfe-card,.cfe-card.new{animation:none;transition:none}}`;
    document.head.appendChild(s);
  }

  function mount(el, o) {
    o = o || {}; injectCSS();
    const root = document.createElement('div');
    root.className = 'cfe';
    el.appendChild(root);

    function render() {
      const ids = o.caseId ? [o.caseId] : Object.keys(reg);
      root.innerHTML = ids.filter(id => reg[id]).map(id => {
        const c = reg[id], p = progress(id);
        return '<section class="cfe-case"><div class="cfe-head"><h3>' + esc(c.title || id) + '</h3><span class="cfe-count">' + p.unlocked + ' / ' + p.total + ' ENDINGS</span></div>' +
          '<div class="cfe-bar"><i style="width:' + (p.total ? p.unlocked / p.total * 100 : 0) + '%"></i></div><div class="cfe-grid">' +
          c.endings.map(e => {
            const t = TYPES[e.type] || TYPES.neutral, on = isUnlocked(id, e.id), fresh = justNow.has(id + '|' + e.id);
            return '<article class="cfe-card' + (on ? ' on' : '') + (e.type === 'secret' ? ' secret' : '') + (fresh ? ' new' : '') + '" style="--t:' + t.color + '">' +
              '<span class="cfe-tag">' + (on || e.type === 'secret' ? t.label : 'Locked') + '</span>' +
              figure(on ? t.color : '#2c3340', !on) +
              '<div><div class="cfe-title">' + (on ? esc(e.title) : (e.type === 'secret' ? '? ? ?' : '???')) + '</div>' +
              (on ? (e.summary ? '<div class="cfe-text">' + esc(e.summary) + '</div>' : '')
                  : (e.hint ? '<div class="cfe-text cfe-hint">' + esc(e.hint) + '</div>' : '')) + '</div></article>';
          }).join('') + '</div></section>';
      }).join('');
      justNow.clear();
    }

    document.addEventListener('cf:ending-unlocked', render);
    render();
    return { destroy() { document.removeEventListener('cf:ending-unlocked', render); root.remove(); } };
  }

  g.CFEndings = {
    register(id, def) { reg[id] = def; },
    unlock, isUnlocked, progress, mount,
    reset() { mem.data = {}; write(); }
  };
})(window);
