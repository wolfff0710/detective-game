/*! epilogue.js · Case Files · CFEpilogue
 *  CFEpilogue.register(caseId, { endingId: [ {when:'Six months later', text:'...'} | 'plain string', ... ] })
 *  CFEpilogue.show(el, caseId, endingId, {type:'good'|'bad'|'neutral'|'secret', onDone, speed=22}) -> {skip, destroy}
 *    - falls back to generic lines for `type` when the ending has no custom epilogue
 *    - typewriter effect; click / Space / Enter skips; honours prefers-reduced-motion
 *    - {noButton:true} hides the Continue button
 *    - fires 'cf:epilogue-done' {caseId, endingId}
 */
(function (g) {
  'use strict';

  const reg = {};
  const DEFAULTS = {
    good: [
      { when: 'One week later', text: 'The case closes without a single loose thread. The city sleeps a little easier.' },
      { when: 'Six months later', text: 'The file stays in your top drawer. Not a trophy, a reminder.' }
    ],
    bad: [
      { when: 'The next morning', text: 'The wrong name makes the headlines. The right one is already gone.' },
      { when: 'A year later', text: 'The file is closed, but you never quite stop reading it.' }
    ],
    neutral: [
      { when: 'That night', text: 'Too many questions, too few answers. You file it under "unresolved".' },
      { when: 'Months later', text: 'A letter arrives with no return address. It says only: keep looking.' }
    ],
    secret: [
      { when: 'The same night', text: 'Everything fits. Not just the case, the whole story behind it.' },
      { when: 'Years later', text: 'Some truths are meant only for the one who refused to stop digging.' }
    ]
  };

  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const reduced = () => window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

  function lookup(caseId, endingId, type) {
    const lines = (reg[caseId] && reg[caseId][endingId]) || DEFAULTS[type] || DEFAULTS.neutral;
    return lines.map(l => typeof l === 'string' ? { when: '', text: l } : l);
  }

  let cssDone = false;
  function injectCSS() {
    if (cssDone) return; cssDone = true;
    const s = document.createElement('style');
    s.textContent = `
.cfx{background:var(--cf-panel,#1c2028);color:var(--cf-text,#e8e6e1);border-radius:14px;padding:28px 26px;box-shadow:0 0 0 1px rgba(255,255,255,.06);display:grid;gap:20px;cursor:pointer;font:16px/1.6 var(--cf-font-display,Georgia,serif)}
.cfx-eyebrow{font:600 11px/1 system-ui;letter-spacing:.18em;text-transform:uppercase;color:var(--cf-accent,#d9a441)}
.cfx-line{margin:0;opacity:0;transform:translateY(6px);transition:opacity .5s,transform .5s}
.cfx-line.on{opacity:1;transform:none}
.cfx-when{display:block;margin-bottom:2px;font:600 11px/1.4 system-ui;letter-spacing:.14em;text-transform:uppercase;color:var(--cf-muted,#8b93a1)}
.cfx-body.typing::after{content:"";display:inline-block;width:2px;height:1em;margin-left:2px;vertical-align:-.12em;background:var(--cf-accent,#d9a441);animation:cfx-blink .8s steps(2) infinite}
.cfx-btn{justify-self:start;font:600 14px/1 system-ui;border:0;border-radius:9px;padding:11px 18px;cursor:pointer;background:var(--cf-accent,#d9a441);color:#1a1405;animation:cfx-in .4s}
.cfx-btn:focus-visible{outline:2px solid #fff;outline-offset:2px}
.cfx-hint{font:12px/1 system-ui;color:var(--cf-muted,#8b93a1)}
@keyframes cfx-blink{50%{opacity:0}}
@keyframes cfx-in{from{opacity:0;transform:translateY(4px)}}
@media (prefers-reduced-motion:reduce){.cfx-line{transition:none}.cfx-btn,.cfx-body.typing::after{animation:none}}`;
    document.head.appendChild(s);
  }

  function show(el, caseId, endingId, o) {
    o = o || {}; injectCSS();
    const lines = lookup(caseId, endingId, o.type), speed = o.speed || 22;

    const root = document.createElement('section');
    root.className = 'cfx';
    root.tabIndex = 0;
    root.setAttribute('aria-live', 'polite');
    root.innerHTML = '<div class="cfx-eyebrow">Epilogue · What happened next</div>' +
      lines.map(l => '<p class="cfx-line">' + (l.when ? '<span class="cfx-when">' + esc(l.when) + '</span>' : '') + '<span class="cfx-body"></span></p>').join('') +
      '<button class="cfx-btn" hidden>' + esc(o.buttonLabel || 'Continue') + '</button><div class="cfx-hint">Click to skip</div>';
    el.innerHTML = '';
    el.appendChild(root);

    const rows = [...root.querySelectorAll('.cfx-line')].map((row, i) => ({ row, body: row.querySelector('.cfx-body'), text: lines[i].text || '' }));
    const btn = root.querySelector('.cfx-btn'), hint = root.querySelector('.cfx-hint');
    let i = 0, timer = null, done = false, dead = false;

    function complete() {
      done = true; clearTimeout(timer);
      rows.forEach(r => { r.body.textContent = r.text; r.body.classList.remove('typing'); r.row.classList.add('on'); });
      btn.hidden = !!o.noButton; hint.hidden = true;
      if (!o.noButton) btn.focus({ preventScroll: true });
    }

    function next() {
      if (dead || done) return;
      if (i >= rows.length) { complete(); return; }
      const r = rows[i++]; let n = 0;
      r.row.classList.add('on'); r.body.classList.add('typing');
      (function tick() {
        if (dead || done) return;
        r.body.textContent = r.text.slice(0, ++n);
        if (n < r.text.length) timer = setTimeout(tick, speed);
        else { r.body.classList.remove('typing'); timer = setTimeout(next, 450); }
      })();
    }

    const finish = () => {
      document.dispatchEvent(new CustomEvent('cf:epilogue-done', { detail: { caseId, endingId } }));
      o.onDone && o.onDone();
    };
    btn.addEventListener('click', e => { e.stopPropagation(); finish(); });
    root.addEventListener('click', () => { if (!done) complete(); });
    root.addEventListener('keydown', e => { if ((e.key === ' ' || e.key === 'Enter') && e.target === root && !done) { e.preventDefault(); complete(); } });

    if (reduced()) complete(); else next();
    return { skip: complete, destroy() { dead = true; clearTimeout(timer); root.remove(); } };
  }

  g.CFEpilogue = {
    register(caseId, map) { reg[caseId] = Object.assign(reg[caseId] || {}, map); },
    defaults: DEFAULTS,
    show
  };
})(window);
