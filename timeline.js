/*! timeline.js · Case Files · CFTimeline
 *  const tl = CFTimeline.mount(el, statements, {title, showCount=true})
 *  statement: {id, who, about?, start:'21:00', end?:'21:30', place, text, contradicts?:[ids]}
 *    - `who`   = speaker, `about` = whose whereabouts (defaults to who)
 *    - auto-conflict: same `about`, overlapping times, different `place` (or manual `contradicts`)
 *  tl.add(stmt | [stmts])  tl.select(id)  tl.contradictions() -> [[idA,idB]]  tl.statements()  tl.destroy()
 *  Click a block -> conflicting blocks light up + detail panel. Fires 'cf:contradiction' {a,b} once per newly-seen pair.
 *  Times past midnight: use 24:30, 25:00 ...
 */
(function (g) {
  'use strict';

  const PX = 2.4, LABEL_W = 120, MIN_W = 120, ROW_H = 58;
  const toMin = t => { const p = String(t).split(':').map(Number); return p[0] * 60 + (p[1] || 0); };
  const fmt = m => { m = ((m % 1440) + 1440) % 1440; return String(Math.floor(m / 60)).padStart(2, '0') + ':' + String(m % 60).padStart(2, '0'); };
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const norm = s => String(s).trim().toLowerCase();
  const hue = s => [...String(s)].reduce((h, c) => (h * 31 + c.charCodeAt(0)) % 360, 11);
  const range = s => s.start === s.end ? fmt(s.a) : fmt(s.a) + '–' + fmt(s.b);

  function conflicts(x, y) {
    if (x.id === y.id) return false;
    if ((x.contradicts || []).includes(y.id) || (y.contradicts || []).includes(x.id)) return true;
    return x.about === y.about && x.place && y.place && norm(x.place) !== norm(y.place) && x.a < y.b && y.a < x.b;
  }

  let cssDone = false;
  function injectCSS() {
    if (cssDone) return; cssDone = true;
    const s = document.createElement('style');
    s.textContent = `
.cft{background:var(--cf-panel,#1c2028);color:var(--cf-text,#e8e6e1);border-radius:14px;padding:16px;font:14px/1.4 system-ui,sans-serif;box-shadow:0 0 0 1px rgba(255,255,255,.06)}
.cft-head{display:flex;align-items:center;justify-content:space-between;margin-bottom:12px}
.cft-head h3{margin:0;font:600 13px/1 system-ui;letter-spacing:.1em;text-transform:uppercase;color:var(--cf-muted,#8b93a1)}
.cft-badge{font:600 12px/1 system-ui;padding:5px 10px;border-radius:99px;background:rgba(224,88,77,.15);color:#ff8f85}
.cft-scroll{overflow-x:auto;border-radius:10px;background:#161a21;padding-bottom:4px}
.cft-inner{position:relative}
.cft-axis{position:relative;height:28px;border-bottom:1px solid rgba(255,255,255,.08)}
.cft-tick{position:absolute;top:8px;transform:translateX(-50%);font:11px/1 ui-monospace,monospace;color:var(--cf-muted,#8b93a1)}
.cft-lane{position:relative;border-bottom:1px solid rgba(255,255,255,.05);background-image:linear-gradient(90deg,rgba(255,255,255,.06) 1px,transparent 1px)}
.cft-label{position:sticky;left:0;z-index:3;width:${LABEL_W}px;height:100%;box-sizing:border-box;padding:10px 12px;background:#161a21;border-right:1px solid rgba(255,255,255,.08);font-weight:600;display:flex;align-items:flex-start}
.cft-block{position:absolute;box-sizing:border-box;height:${ROW_H - 10}px;padding:6px 10px;border:1px solid hsl(var(--h) 45% 45%);border-radius:9px;background:hsl(var(--h) 40% 22%);color:inherit;text-align:left;cursor:pointer;display:grid;align-content:center;gap:2px;overflow:hidden;transition:opacity .2s,box-shadow .2s,transform .15s;font:inherit}
.cft-block b{font-size:13px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.cft-block span{font-size:11px;color:var(--cf-muted,#a6aebb);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.cft-block:hover{transform:translateY(-1px)}
.cft-block:focus-visible{outline:2px solid var(--cf-accent,#d9a441);outline-offset:2px}
.cft-block.sel{box-shadow:0 0 0 2px var(--cf-accent,#d9a441)}
.cft-block.hit{border-color:#e0584d;background:rgba(224,88,77,.28);box-shadow:0 0 0 2px #e0584d;animation:cft-pulse 1.1s ease-in-out infinite}
.cft-block.dim{opacity:.35}
@keyframes cft-pulse{50%{box-shadow:0 0 0 5px rgba(224,88,77,.25)}}
.cft-detail{margin-top:14px;min-height:48px;display:grid;gap:8px}
.cft-quote{margin:0;padding-left:12px;border-left:3px solid var(--cf-accent,#d9a441)}
.cft-quote small{display:block;color:var(--cf-muted,#8b93a1);margin-top:2px}
.cft-warn{padding:10px 12px;border-radius:9px;background:rgba(224,88,77,.12);color:#ffb0a8}
.cft-ok,.cft-empty{color:var(--cf-muted,#8b93a1)}
@media (prefers-reduced-motion:reduce){.cft-block,.cft-block.hit{animation:none;transition:none}}`;
    document.head.appendChild(s);
  }

  function mount(el, initial, opts) {
    opts = opts || {}; injectCSS();
    const list = [], found = new Set();
    let sel = null;

    const root = document.createElement('section');
    root.className = 'cft';
    root.innerHTML = '<header class="cft-head"><h3>' + esc(opts.title || 'Alibi timeline') + '</h3><span class="cft-badge" hidden></span></header>' +
      '<div class="cft-scroll"></div><div class="cft-detail" aria-live="polite"></div>';
    el.appendChild(root);
    const scroll = root.querySelector('.cft-scroll'), detail = root.querySelector('.cft-detail'), badge = root.querySelector('.cft-badge');

    const partners = s => list.filter(o => conflicts(s, o));
    const pairs = () => {
      const out = [];
      for (let i = 0; i < list.length; i++) for (let j = i + 1; j < list.length; j++) if (conflicts(list[i], list[j])) out.push([list[i].id, list[j].id]);
      return out;
    };

    function render() {
      if (!list.length) { scroll.innerHTML = '<p class="cft-empty" style="padding:16px">No statements recorded yet.</p>'; badge.hidden = true; return; }
      const step = (Math.max(...list.map(s => s.b)) - Math.min(...list.map(s => s.a))) > 360 ? 60 : 30;
      const lo = Math.floor((Math.min(...list.map(s => s.a)) - 15) / step) * step;
      const hi = Math.ceil((Math.max(...list.map(s => s.b)) + 15) / step) * step;
      const width = LABEL_W + (hi - lo) * PX;

      let ticks = '';
      for (let t = lo; t <= hi; t += step) ticks += '<span class="cft-tick" style="left:' + (LABEL_W + (t - lo) * PX) + 'px">' + fmt(t) + '</span>';

      const lanes = [...new Set(list.map(s => s.about))].map(who => {
        const rows = [];
        const blocks = list.filter(s => s.about === who).sort((x, y) => x.a - y.a).map(s => {
          const left = LABEL_W + (s.a - lo) * PX, w = Math.max((s.b - s.a) * PX, MIN_W);
          let r = rows.findIndex(end => end + 8 <= left);
          if (r < 0) r = rows.length;
          rows[r] = left + w;
          return '<button class="cft-block" data-id="' + esc(s.id) + '" style="--h:' + hue(s.who) + ';left:' + left + 'px;width:' + w + 'px;top:' + (r * ROW_H + 6) + 'px" title="' + esc(s.who + ' · ' + s.place) + '">' +
            '<b>' + esc(s.place) + '</b><span>' + esc(s.who) + ' · ' + range(s) + '</span></button>';
        }).join('');
        return '<div class="cft-lane" style="height:' + (rows.length * ROW_H + 10) + 'px;background-size:' + (step * PX) + 'px 100%;background-position:' + LABEL_W + 'px 0">' +
          '<div class="cft-label">' + esc(who) + '</div>' + blocks + '</div>';
      }).join('');

      scroll.innerHTML = '<div class="cft-inner" style="width:' + width + 'px"><div class="cft-axis">' + ticks + '</div>' + lanes + '</div>';

      const n = pairs().length;
      badge.hidden = !(opts.showCount !== false && n);
      badge.textContent = n + (n === 1 ? ' conflict' : ' conflicts') + ' in the record';
      paintSel();
    }

    function paintSel() {
      const s = list.find(x => x.id === sel);
      const hits = s ? partners(s).map(p => p.id) : [];
      scroll.querySelectorAll('.cft-block').forEach(b => {
        const id = b.dataset.id;
        b.classList.toggle('sel', id === sel);
        b.classList.toggle('hit', hits.includes(id));
        b.classList.toggle('dim', !!s && id !== sel && !hits.includes(id));
      });
      if (!s) { detail.innerHTML = '<p class="cft-empty">Select a statement to cross-check it against the rest.</p>'; return; }
      const ps = partners(s);
      detail.innerHTML = '<blockquote class="cft-quote">“' + esc(s.text || s.place) + '”<small>' + esc(s.who) + ' on ' + esc(s.about) + ' · ' + range(s) + '</small></blockquote>' +
        (ps.length
          ? ps.map(p => '<div class="cft-warn">⚠ <b>Conflict:</b> ' + esc(s.who) + ' puts ' + esc(s.about) + ' at <b>' + esc(s.place) + '</b> (' + range(s) + '), but ' +
              esc(p.who) + ' says ' + (p.about === s.about ? 'they were at' : esc(p.about) + ' was at') + ' <b>' + esc(p.place) + '</b> (' + range(p) + ').</div>').join('')
          : '<p class="cft-ok">✓ Nothing in the record contradicts this statement.</p>');
      ps.forEach(p => {
        const key = [s.id, p.id].sort().join('|');
        if (!found.has(key)) { found.add(key); document.dispatchEvent(new CustomEvent('cf:contradiction', { detail: { a: s.id, b: p.id } })); }
      });
    }

    function select(id) { sel = sel === id ? null : id; paintSel(); }
    scroll.addEventListener('click', e => { const b = e.target.closest('.cft-block'); if (b) select(b.dataset.id); });

    function add(input) {
      [].concat(input).forEach(s => {
        if (!s || list.some(x => x.id === s.id)) return;
        const a = toMin(s.start), end = s.end ? toMin(s.end) : a;
        list.push(Object.assign({}, s, { about: s.about || s.who, end: s.end || s.start, a, b: Math.max(end, a + 1) }));
      });
      render();
    }

    add(initial || []);
    return {
      add, select,
      contradictions: pairs,
      statements: () => list.map(s => { const c = Object.assign({}, s); delete c.a; delete c.b; return c; }),
      destroy() { root.remove(); }
    };
  }

  g.CFTimeline = { mount };
})(window);
