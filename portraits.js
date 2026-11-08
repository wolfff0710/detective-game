/*! portraits.js · Case Files · CFPortrait
 *  CFPortrait.mount(el, {id, name, mood='calm', size=120}) -> {setMood(m), el}
 *  CFPortrait.svg(id, mood) -> SVG string
 *  Moods: calm | nervous | angry | clammed   (same keys as mood.js)
 *  Faces are generated deterministically from `id` (skin, hair, shirt, glasses, mustache).
 */
(function (g) {
  'use strict';

  const SKIN  = ['#f3d2b5', '#e3b088', '#c98d5f', '#9a6240', '#6e4529'];
  const HAIR  = ['#17140f', '#3a2514', '#6b4423', '#9b9b9b', '#a83a28', '#d9b86c'];
  const SHIRT = ['#35506b', '#5b3a4a', '#3f5e4a', '#6b5a35', '#4a4a5e', '#7a3b3b'];

  const MOODS = {
    calm:    { brows: 'M-17 -10Q-11 -13 -5 -10M5 -10Q11 -13 17 -10', mouth: 'M-8 19Q0 23 8 19',          eye: 4.2, pupil: [0, 0],     sweat: false, flush: 0 },
    nervous: { brows: 'M-17 -9L-5 -15M5 -15L17 -9',                  mouth: 'M-8 20Q-4 16 0 20T8 20',     eye: 5.2, pupil: [-1.6, 1], sweat: true,  flush: 0.08 },
    angry:   { brows: 'M-17 -15L-5 -8M5 -8L17 -15',                  mouth: 'M-8 23Q0 15 8 23',          eye: 3,   pupil: [0, 0.5],   sweat: false, flush: 0.35 },
    clammed: { brows: 'M-17 -11L-5 -11M5 -11L17 -11',                mouth: 'M-7 21L7 21',               eye: 1.6, pupil: [0, 0],     sweat: false, flush: 0 }
  };

  const hash = s => [...String(s)].reduce((h, c) => (Math.imul(h, 31) + c.charCodeAt(0)) >>> 0, 17);
  const pick = (arr, h, sh) => arr[(h >>> sh) % arr.length];

  function svg(id, mood) {
    const h = hash(id), m = MOODS[mood] || MOODS.calm;
    const skin = pick(SKIN, h, 0), hair = pick(HAIR, h, 3), shirt = pick(SHIRT, h, 6);
    const style = (h >>> 9) % 4, glasses = (h >>> 12) % 3 === 0, stache = (h >>> 14) % 4 === 0;
    const pr = Math.min(2.2, m.eye - 0.3);

    const eyes = [-11, 11].map(x =>
      `<ellipse cx="${x}" rx="5.6" ry="${m.eye}" fill="#fff"/>` +
      `<circle cx="${x + m.pupil[0]}" cy="${m.pupil[1]}" r="${pr}" fill="#1a1a1a"/>`).join('');

    const hairFront = [
      'M22 52C19 16 81 16 78 52C73 37 61 31 50 31C39 31 27 37 22 52Z',
      'M22 52C19 16 81 16 78 52C73 37 61 31 50 31C39 31 27 37 22 52Z',
      '',
      'M21 50C20 20 68 12 79 44C66 30 45 31 31 40C26 43 23 46 21 50Z'
    ][style];

    return `<svg viewBox="0 0 100 120" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
${style === 1 ? `<path d="M20 58C14 18 86 18 80 58L84 104H16Z" fill="${hair}"/>` : ''}
<path d="M10 120C10 98 28 92 50 92S90 98 90 120Z" fill="${shirt}"/>
<path d="M42 82h16v14c-4 5-12 5-16 0Z" fill="${skin}"/><path d="M42 82h16v14c-4 5-12 5-16 0Z" fill="rgba(0,0,0,.18)"/>
<path d="M40 93L50 106L60 93Z" fill="#e9e6df"/>
<circle cx="23" cy="58" r="5" fill="${skin}"/><circle cx="77" cy="58" r="5" fill="${skin}"/>
<ellipse cx="50" cy="56" rx="27" ry="33" fill="${skin}"/>
<ellipse cx="50" cy="56" rx="27" ry="33" fill="#e0584d" opacity="${m.flush * 0.4}"/>
<g transform="translate(50 52)">
  <circle cx="-15" cy="11" r="6" fill="#e0584d" opacity="${m.flush}"/><circle cx="15" cy="11" r="6" fill="#e0584d" opacity="${m.flush}"/>
  ${eyes}
  ${glasses ? '<g fill="none" stroke="#222" stroke-width="1.6"><circle cx="-11" r="8"/><circle cx="11" r="8"/><path d="M-3 0H3"/></g>' : ''}
  <path d="${m.brows}" fill="none" stroke="${hair}" stroke-width="2.6" stroke-linecap="round"/>
  <path d="M0 3Q-4 12 0 13Q3 13 3 11" fill="none" stroke="rgba(0,0,0,.28)" stroke-width="1.6" stroke-linecap="round"/>
  ${stache ? `<path d="M-8 14Q-4 10 0 13Q4 10 8 14Q4 17 0 15Q-4 17 -8 14Z" fill="${hair}"/>` : ''}
  <path d="${m.mouth}" fill="none" stroke="#3a1f1a" stroke-width="2" stroke-linecap="round"/>
  ${m.sweat ? '<path d="M24 -8q-4 6 0 9q4-3 0-9z" fill="#7ec8f0"/>' : ''}
</g>
${hairFront ? `<path d="${hairFront}" fill="${hair}"/>` : ''}
</svg>`;
  }

  let cssDone = false;
  function injectCSS() {
    if (cssDone) return; cssDone = true;
    const s = document.createElement('style');
    s.textContent = `
.cfp{--s:120px;width:var(--s);height:var(--s);border-radius:16px;overflow:hidden;position:relative;
  background:linear-gradient(160deg,#2a303b,#171b22);
  box-shadow:inset 0 0 0 2px var(--cfp-ring,#3a4252),0 6px 18px rgba(0,0,0,.35);transition:box-shadow .3s,filter .3s}
.cfp svg{width:100%;height:100%;display:block}
.cfp[data-mood=nervous]{--cfp-ring:#d9a441}
.cfp[data-mood=angry]{--cfp-ring:#e0584d}
.cfp[data-mood=clammed]{--cfp-ring:#6b7380;filter:saturate(.5) brightness(.9)}
.cfp[data-mood=nervous] svg{animation:cfp-jit .3s steps(2) infinite}
.cfp[data-mood=angry] svg{animation:cfp-pulse .8s ease-in-out infinite}
.cfp.cfp-pop svg{animation:cfp-pop .35s ease-out}
@keyframes cfp-jit{50%{transform:translateX(1.5px)}}
@keyframes cfp-pulse{50%{transform:scale(1.03)}}
@keyframes cfp-pop{0%{transform:scale(.92)}60%{transform:scale(1.05)}100%{transform:scale(1)}}
@media (prefers-reduced-motion:reduce){.cfp svg{animation:none!important}}`;
    document.head.appendChild(s);
  }

  function mount(el, o) {
    o = o || {}; injectCSS();
    const box = document.createElement('div');
    box.className = 'cfp';
    box.style.setProperty('--s', (o.size || 120) + 'px');
    box.setAttribute('role', 'img');
    box.addEventListener('animationend', () => box.classList.remove('cfp-pop'));
    el.appendChild(box);

    let mood;
    function setMood(m) {
      if (!MOODS[m]) m = 'calm';
      const changed = mood !== undefined && m !== mood;
      mood = m;
      box.dataset.mood = m;
      box.innerHTML = svg(o.id || o.name || 'x', m);
      box.setAttribute('aria-label', (o.name || 'Suspect') + ' looks ' + m);
      if (changed) { box.classList.remove('cfp-pop'); void box.offsetWidth; box.classList.add('cfp-pop'); }
    }
    setMood(o.mood || 'calm');
    return { el: box, setMood };
  }

  g.CFPortrait = { svg, mount, moods: Object.keys(MOODS) };
})(window);
