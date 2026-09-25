/* SMALL HOURS — mobile shell: bottom tabs (Story / You / Phone / Map), swipe-free, thumb-sized. */
(function (SH) {
  const $ = (s) => document.querySelector(s);
  const MQ = window.matchMedia('(max-width: 760px)');
  const Mo = SH.Mobile = { cur: 'story' };
  Mo.is = () => MQ.matches;
  Mo.tab = function (t) {
    if (!Mo.is()) { if (t === 'map') SH.UI.openMap(); return; }
    Mo.cur = t; document.body.dataset.tab = t;
    document.querySelectorAll('#tabbar button').forEach((b) => b.classList.toggle('on', b.dataset.t === t));
    if (t === 'map') { SH.UI.openMap(); setTimeout(() => SH.Map.fitMobile && SH.Map.fitMobile(), 80); } else if (SH.Map.open) SH.UI.closeMap();
    if (t === 'phone') SH.Phone.render();
    if (t === 'you') SH.UI.renderSide();
    if (t === 'story') { const l = $('#log'); if (l) l.scrollTop = l.scrollHeight; }
  };
  Mo.badge = function () {
    const b = $('#tabbar [data-t="phone"] .tb'); if (!b || !SH.G) return;
    const n = (SH.Phone.unreadNotifs ? SH.Phone.unreadNotifs() : 0);
    b.textContent = n > 9 ? '9+' : n || ''; b.style.display = n ? '' : 'none';
  };
  Mo.phoneOpened = function () { if (Mo.is() && Mo.cur !== 'phone' && SH.G && !SH.G._booting) Mo.tab('phone'); };

  function build() {
    if ($('#tabbar')) return;
    const bar = document.createElement('nav'); bar.id = 'tabbar';
    bar.innerHTML = [['story', '📖', 'Story'], ['you', '🧍', 'You'], ['phone', '📱', 'Phone'], ['map', '🗺️', 'Map']].map(([t, i, n]) => `<button data-t="${t}" class="${t === 'story' ? 'on' : ''}"><span class="ti">${i}</span>${n}${t === 'phone' ? '<span class="tb" style="display:none"></span>' : ''}</button>`).join('');
    document.body.appendChild(bar);
    bar.onclick = (e) => { const b = e.target.closest('button'); if (b) { SH.Audio && SH.Audio.click(); Mo.tab(b.dataset.t); } };
    document.body.dataset.tab = 'story';
  }

  window.addEventListener('DOMContentLoaded', () => {
    build();
    // closing the map from its own button returns you to the story tab on mobile
    const UI = SH.UI; const baseClose = UI.closeMap; UI.closeMap = function () { baseClose.apply(this, arguments); if (Mo.is() && Mo.cur === 'map') { Mo.cur = 'story'; document.body.dataset.tab = 'story'; document.querySelectorAll('#tabbar button').forEach((b) => b.classList.toggle('on', b.dataset.t === 'story')); } };
    const baseOpen = UI.openMap; UI.openMap = function () { baseOpen.apply(this, arguments); if (Mo.is() && Mo.cur !== 'map') { Mo.cur = 'map'; document.body.dataset.tab = 'map'; document.querySelectorAll('#tabbar button').forEach((b) => b.classList.toggle('on', b.dataset.t === 'map')); } };
    // phone "open" calls from inside the game (e.g. a banner tap) jump to the phone tab
    const B = $('#banner'); if (B) B.addEventListener('click', () => Mo.is() && Mo.tab('phone'));
    // travel from the map sheet lands you back in the story
    const baseTravel = SH.travel; SH.travel = function () { const r = baseTravel.apply(this, arguments); if (Mo.is()) Mo.tab('story'); return r; };
    MQ.addEventListener ? MQ.addEventListener('change', () => { if (!Mo.is()) delete document.body.dataset.tab; else document.body.dataset.tab = Mo.cur; }) : 0;
    setInterval(Mo.badge, 1500);
  });
})(window.SH);
