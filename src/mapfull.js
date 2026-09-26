/* SMALL HOURS — fullscreen maps. The ⛶ button in the Atlas app and on AverMaps (avermaps.av) toggles fullscreen:
   - desktop: the phone turns sideways (landscape), centered over a dimmed game: map on the left, info on the right.
   - mobile (≤760px wide): the phone fills the whole screen but stays portrait: map on top, the list scrolls below.
   Esc, the button again, or tapping the dimmed area exits. Leaving the map (Back, another app/site) exits too. */
(function (SH) {
  const P = SH.Phone; if (!P) return;
  const B = () => document.body;
  const on = () => B().classList.contains('mapfull');
  const isMap = () => { const v = P.view || {}; return v.app === 'atlas' || (v.app === 'browser' && SH.Browser && /^avermaps\.av/.test(SH.Browser.url || '')); };
  const bg = () => { let d = document.getElementById('mfBg'); if (!d) { d = document.createElement('div'); d.id = 'mfBg'; d.onclick = () => MF.set(false); document.body.appendChild(d); } return d; };
  const MF = SH.MapFull = {
    btn: () => `<button class="mfbtn" title="${on() ? 'Exit fullscreen (Esc)' : 'Fullscreen'}" onclick="SH.MapFull.toggle();event.stopPropagation()">${on() ? '🗗' : '⛶'}</button>`,
    set(v) {
      if (v === on()) return; bg();
      B().classList.toggle('mapfull', v);
      if (v) { B().classList.add('mfanim'); setTimeout(() => B().classList.remove('mfanim'), 500); }
      SH.Audio && SH.Audio.click && SH.Audio.click();
      P.render();
    },
    toggle() { MF.set(!on()); },
    on,
  };
  const bR = P.render;
  P.render = function () { const r = bR.apply(this, arguments); if (on() && !isMap()) B().classList.remove('mapfull'); return r; };
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && on()) { e.stopPropagation(); e.preventDefault(); MF.set(false); } }, true);
})(window.SH);
