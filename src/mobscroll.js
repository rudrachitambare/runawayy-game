/* SMALL HOURS — mobile Story tab scrolls as one page.
   On phones the scene + buttons used to eat ~2/3 of the screen and the story text lived in a ~200px box;
   swiping on the scene did nothing. Now #center is the scroll container (CSS in style3.css, max-width 760px):
   the scene scrolls away and the text gets the whole screen. Turn 45: newest text is on top, right under the scene,
   and the floating "⬆ Scene" pill is removed. */
(function (SH) {
  const $ = (s) => document.querySelector(s);
  const on = () => SH.Mobile && SH.Mobile.is && SH.Mobile.is();
  const C = () => $('#center');
  // bring the newest line into view (only if it's below the fold); `force` = jump to the very end
  // newest lines sit at the TOP of the story now (turn 45), right under the scene: bring them into view if you'd scrolled down
  const reveal = (force) => {
    if (!on()) return; const c = C(), l = $('#log'); if (!c || !l) return;
    requestAnimationFrame(() => {
      const st = $('#stage'), first = l.querySelector('.lb') || l.firstElementChild; if (!first) return;
      const cr = c.getBoundingClientRect(), r = first.getBoundingClientRect();
      if (!force && r.top >= cr.top - 4 && r.top < cr.bottom - 60) return; // already visible
      const sh = st ? st.offsetHeight : 0;
      c.scrollTop = sh + 140 < c.clientHeight ? 0 : Math.max(0, c.scrollTop + r.top - cr.top - 8);
    });
  };
  const UI = SH.UI;
  const wrap = (o, k, after) => { const f = o[k]; if (typeof f !== 'function' || f._ms) return; o[k] = function () { const r = f.apply(this, arguments); after(); return r; }; o[k]._ms = 1; };
  wrap(UI, 'log', () => reveal(false));
  wrap(UI, 'restoreLog', () => reveal(true));
  if (SH.Mobile) wrap(SH.Mobile, 'tab', () => { if (SH.Mobile.cur === 'story') reveal(false); });

  // "⬆ Scene" pill, shown once the scene has scrolled mostly out of view
  const pill = () => {
    let b = $('#toScene'); if (b) return b;
    b = document.createElement('button'); b.id = 'toScene'; b.type = 'button'; b.textContent = '⬆ Scene';
    b.onclick = () => { const c = C(); c && c.scrollTo({ top: 0, behavior: 'smooth' }); };
    document.body.appendChild(b); return b;
  };
  // the floating "⬆ Scene" pill is gone (turn 45: it covered the story text); newest-first makes it unnecessary
  const sync = () => { const b = $('#toScene'); if (b) b.remove(); };
  const bind = () => { const c = C(); if (!c || c._ms) return; c._ms = 1; c.addEventListener('scroll', sync, { passive: true }); window.addEventListener('resize', sync); sync(); };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', bind); else bind();
  SH.MobScroll = { reveal, sync };
})(window.SH);
