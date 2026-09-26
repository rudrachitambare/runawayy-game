/* SMALL HOURS — mobile Story tab scrolls as one page.
   On phones the scene + buttons used to eat ~2/3 of the screen and the story text lived in a ~200px box;
   swiping on the scene did nothing. Now #center is the scroll container (CSS in style3.css, max-width 760px):
   the scene scrolls away, the text gets the whole screen, and a "⬆ Scene" pill brings it back.
   New lines only pull the page down when they'd land below the screen, so the scene stays in view while there's room. */
(function (SH) {
  const $ = (s) => document.querySelector(s);
  const on = () => SH.Mobile && SH.Mobile.is && SH.Mobile.is();
  const C = () => $('#center');
  // bring the newest line into view (only if it's below the fold); `force` = jump to the very end
  const reveal = (force) => {
    if (!on()) return; const c = C(), l = $('#log'); if (!c || !l) return;
    requestAnimationFrame(() => {
      if (force) { c.scrollTop = c.scrollHeight; return; }
      const last = l.lastElementChild; if (!last) return;
      const cr = c.getBoundingClientRect(), r = last.getBoundingClientRect();
      const down = r.bottom - cr.bottom + 16, maxDown = r.top - cr.top - 8; // never push the new line's top off-screen
      if (down > 0 && maxDown > 0) c.scrollTop += Math.min(down, maxDown);
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
  const sync = () => {
    const c = C(), s = $('#stage'); if (!c || !s) return;
    const show = on() && (!document.body.dataset.tab || document.body.dataset.tab === 'story') && c.scrollTop > s.offsetHeight * 0.6;
    pill().classList.toggle('show', show);
  };
  const bind = () => { const c = C(); if (!c || c._ms) return; c._ms = 1; c.addEventListener('scroll', sync, { passive: true }); window.addEventListener('resize', sync); sync(); };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', bind); else bind();
  SH.MobScroll = { reveal, sync };
})(window.SH);
