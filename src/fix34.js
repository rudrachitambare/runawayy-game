/* SMALL HOURS — turn 34 fixes.
   1) Leaving Harlow IS running away. Before, if you left town by map / bus / ride without pressing "run away",
      the game still thought you were at home (nobody would look for you, no run started). Now the moment you
      arrive anywhere outside Harlow while still "at home", the run starts ("— You leave Harlow. —").
   2) L = back. Closes a menu/dialog (clicks its Back / Close / Never mind if it has one), leaves a conversation
      (when you're not typing), closes the full map / map / stage pop-ups, and goes back a screen on the phone.
      Menus with lots of options that had no way out now get a "Back" at the bottom.
   3) Long option lists scroll (touch, wheel, keys) inside dialogs; no scrollbars, but a soft fade at the
      bottom shows there's more. */
(function (SH) {
  const A = SH.Atlas, $ = (s) => document.querySelector(s);

  /* ---------- 1) leaving town starts the run ---------- */
  if (A && A.arrive) {
    const bArr = A.arrive;
    A.arrive = function (to) {
      const g = SH.G;
      if (g && g.phase === 'home' && !g.ended && to && !to.home && SH.Run && SH.Run.start) {
        const ui = SH.UI.afterAction; SH.UI.afterAction = () => {};   // arrive renders; don't render twice
        try { SH.Run.start('leftTown', false); } finally { SH.UI.afterAction = ui; }
      }
      return bArr.apply(this, arguments);
    };
  }

  /* ---------- 2) L = back ---------- */
  const BACK = /^\s*(\d\s*)?(←\s*)?(back|close|cancel|never ?mind|not now|not today|nah|no thanks|leave it|done|go back|✕)\b/i;
  const txt = (b) => ([...b.childNodes].filter((n) => n.nodeType === 3 || (n.tagName && !/KBD|SMALL/.test(n.tagName))).map((n) => n.textContent).join('')).trim();
  function goBack() {
    const md = $('#modal');
    if (md && !md.classList.contains('hidden')) {
      if (SH.Talk && SH.Talk.cur && !SH.Talk.cur.ended && $('#tlog')) { const lv = $('#tleave'); if (lv && lv.style.display !== 'none') { lv.click(); return true; } return false; }
      const bs = [...md.querySelectorAll('.mchoices button, button')];
      const b = bs.find((x) => BACK.test(txt(x))) || md.querySelector('.px, .mclose, [data-close]');
      if (b) { b.click(); return true; }
      return false;   // a real decision with no way out: stays
    }
    if (document.body.classList.contains('mapfull') && SH.MapFull && SH.MapFull.set) { SH.MapFull.set(false); return true; }
    const mw = $('#mapWrap'); if (mw && !mw.classList.contains('hidden')) { SH.UI.closeMap(); return true; }
    const pop = $('#pop'); if (pop && !pop.classList.contains('hidden') && SH.Stage && SH.Stage.closePop) { SH.Stage.closePop(); return true; }
    if (document.body.classList.contains('allopen')) { document.body.classList.remove('allopen'); return true; }
    const P = SH.Phone; if (P && P.view && P.view.app !== 'home' && P.back) { P.back(); return true; }
    return false;
  }
  SH.goBack = goBack;
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'l' && e.key !== 'L') return;
    const a = document.activeElement; if (a && /INPUT|TEXTAREA|SELECT/.test(a.tagName) || (a && a.isContentEditable)) return;
    if (!SH.G || e.ctrlKey || e.metaKey || e.altKey) return;
    if (goBack()) { e.preventDefault(); e.stopImmediatePropagation(); }
  }, true);

  /* menus with many options and no way out get a Back */
  const bDlg = SH.UI.dialog;
  SH.UI.dialog = function (o) {
    try {
      const ch = (o && o.choices || []).filter((c) => !c.cond || c.cond());
      if (o && !o.noBack && !(SH.G && SH.G.ended) && ch.length >= 4 && !ch.some((c) => BACK.test(String(c.t || '')))) o.choices = (o.choices || []).concat({ t: 'Back', fn: () => {} });
    } catch (e) {}
    const r = bDlg.apply(this, arguments);
    setTimeout(fadeCheck, 30);
    return r;
  };

  /* ---------- 3) scrolling long lists ---------- */
  const css = document.createElement('style');
  css.textContent = `
  .mbox:not(.talkbox){display:flex;flex-direction:column;min-height:0}
  .mbox .mtext{flex:0 1 auto;min-height:0;overflow-y:auto;max-height:42vh}
  .mbox .mchoices{flex:1 1 auto;min-height:0;overflow-y:auto;overscroll-behavior:contain;-webkit-overflow-scrolling:touch;touch-action:pan-y}
  .mbox .mchoices.more{-webkit-mask-image:linear-gradient(180deg,#000 82%,transparent);mask-image:linear-gradient(180deg,#000 82%,transparent)}
  #pop,#pbody,#actions{overscroll-behavior:contain;-webkit-overflow-scrolling:touch}
  @media (max-width:760px){.mbox .mtext{max-height:36dvh}}`;
  document.head.appendChild(css);
  function fadeCheck() {
    document.querySelectorAll('.mbox .mchoices').forEach((m) => {
      const up = () => m.classList.toggle('more', m.scrollHeight - m.scrollTop - m.clientHeight > 6);
      up(); if (!m._fc) { m._fc = 1; m.addEventListener('scroll', up, { passive: true }); }
    });
  }
  window.addEventListener('resize', () => setTimeout(fadeCheck, 50));
})(window.SH);
