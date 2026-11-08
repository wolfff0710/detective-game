/*! mood.js · Case Files · CFMood
 *  Per-suspect pressure meter. Push too hard -> suspect clams up until you move on and let them cool down.
 *
 *  CFMood.push(id, amount)   -> {value, mood, blocked, justClammed}   (use PRESETS)
 *  CFMood.canAsk(id)         -> false while clammed
 *  CFMood.tick(exceptId)     -> call once per player turn elsewhere; everyone else cools down
 *  CFMood.mood(id)           -> 'calm' | 'nervous' | 'angry' | 'clammed'
 *  CFMood.clamLine(id)       -> random refusal line
 *  CFMood.mount(el, id)      -> {destroy}   live meter UI
 *  CFMood.export() / import(obj) / reset() / config({...})
 *  Fires document events: 'cf:mood' {id,value,mood,clammed}  and  'cf:mood-recovered' {id}
 */
(function (g) {
  'use strict';

  const CFG = { nervousAt: 35, angryAt: 65, clamAt: 100, recoverTo: 45, decay: 6, clamDecay: 10 };
  const PRESETS = { soothe: -12, soft: -4, neutral: 6, press: 18, accuse: 30 };
  const LABEL = { calm: 'Composed', nervous: 'Rattled', angry: 'Hostile', clammed: 'Clammed up' };
  const LINES = [
    'I\'ve got nothing more to say to you.',
    'Talk to my lawyer.',
    '*crosses arms and stares at the wall*',
    'We\'re done here. Go bother someone else.'
  ];

  const S = {};
  const get = id => S[id] || (S[id] = { value: 0, clammed: false });
  const moodOf = s => s.clammed ? 'clammed' : s.value >= CFG.angryAt ? 'angry' : s.value >= CFG.nervousAt ? 'nervous' : 'calm';
  const emit = (name, detail) => document.dispatchEvent(new CustomEvent(name, { detail }));
  const announce = id => { const s = get(id); emit('cf:mood', { id, value: s.value, mood: moodOf(s), clammed: s.clammed }); };

  function push(id, amount) {
    const s = get(id);
    if (s.clammed) return { value: s.value, mood: 'clammed', blocked: true, justClammed: false };
    s.value = Math.max(0, Math.min(CFG.clamAt, s.value + amount));
    const justClammed = s.value >= CFG.clamAt;
    if (justClammed) s.clammed = true;
    announce(id);
    return { value: s.value, mood: moodOf(s), blocked: false, justClammed };
  }

  function tick(exceptId) {
    Object.keys(S).forEach(id => {
      if (id === exceptId) return;
      const s = S[id];
      if (s.value <= 0 && !s.clammed) return;
      s.value = Math.max(0, s.value - (s.clammed ? CFG.clamDecay : CFG.decay));
      if (s.clammed && s.value <= CFG.recoverTo) { s.clammed = false; announce(id); emit('cf:mood-recovered', { id }); }
      else announce(id);
    });
  }

  let cssDone = false;
  function injectCSS() {
    if (cssDone) return; cssDone = true;
    const s = document.createElement('style');
    s.textContent = `
.cfm{--c:#4fb286;display:grid;gap:6px;font:600 12px/1.2 system-ui,sans-serif;color:var(--cf-muted,#8b93a1)}
.cfm[data-mood=nervous]{--c:#d9a441}.cfm[data-mood=angry]{--c:#e0584d}
.cfm-top{display:flex;justify-content:space-between;letter-spacing:.07em;text-transform:uppercase}
.cfm-state{color:var(--cf-text,#e8e6e1)}
.cfm-bar{position:relative;height:10px;border-radius:99px;background:#232832;overflow:hidden}
.cfm-fill{position:absolute;inset:0 auto 0 0;width:0;border-radius:inherit;background:var(--c);transition:width .45s cubic-bezier(.2,.8,.2,1),background .3s}
.cfm[data-mood=clammed] .cfm-fill{background:repeating-linear-gradient(45deg,#5a6270 0 6px,#474e5b 6px 12px)}
.cfm-mark{position:absolute;top:0;bottom:0;width:2px;background:rgba(0,0,0,.55)}
.cfm-note{font-weight:500;min-height:1.2em}
.cfm.cfm-hit .cfm-bar{animation:cfm-shake .3s}
@keyframes cfm-shake{25%{transform:translateX(-2px)}75%{transform:translateX(2px)}}
@media (prefers-reduced-motion:reduce){.cfm-bar,.cfm-fill{animation:none!important;transition:none}}`;
    document.head.appendChild(s);
  }

  function mount(el, id, o) {
    o = o || {}; injectCSS();
    const root = document.createElement('div');
    root.className = 'cfm';
    root.innerHTML = '<div class="cfm-top"><span>' + (o.label || 'Composure') + '</span><span class="cfm-state"></span></div>' +
      '<div class="cfm-bar" role="progressbar" aria-valuemin="0" aria-valuemax="100"><div class="cfm-fill"></div>' +
      '<i class="cfm-mark" style="left:' + CFG.nervousAt + '%"></i><i class="cfm-mark" style="left:' + CFG.angryAt + '%"></i></div>' +
      '<div class="cfm-note"></div>';
    el.appendChild(root);
    const q = sel => root.querySelector(sel);
    const bar = q('.cfm-bar');

    function paint(s) {
      const m = moodOf(s);
      root.dataset.mood = m;
      q('.cfm-fill').style.width = s.value + '%';
      q('.cfm-state').textContent = LABEL[m];
      q('.cfm-note').textContent = m === 'clammed' ? 'Won\'t talk. Question someone else, then come back.' : '';
      bar.setAttribute('aria-valuenow', Math.round(s.value));
    }
    const on = e => {
      if (e.detail.id !== id) return;
      paint(get(id));
      root.classList.remove('cfm-hit'); void root.offsetWidth; root.classList.add('cfm-hit');
    };
    document.addEventListener('cf:mood', on);
    paint(get(id));
    return { destroy() { document.removeEventListener('cf:mood', on); root.remove(); } };
  }

  g.CFMood = {
    PRESETS, push, tick, mount,
    soothe: (id, n) => push(id, -Math.abs(n == null ? 12 : n)),
    canAsk: id => !get(id).clammed,
    mood: id => moodOf(get(id)),
    get: id => Object.assign({}, get(id), { mood: moodOf(get(id)) }),
    clamLine: () => LINES[Math.floor(Math.random() * LINES.length)],
    config: o => Object.assign(CFG, o),
    export: () => JSON.parse(JSON.stringify(S)),
    import(obj) { Object.keys(S).forEach(k => delete S[k]); Object.assign(S, obj || {}); Object.keys(S).forEach(announce); },
    reset() { Object.keys(S).forEach(k => delete S[k]); }
  };
})(window);
