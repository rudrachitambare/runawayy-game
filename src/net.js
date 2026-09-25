/* SMALL HOURS — mobile data, wifi, top-ups.
   Your phone is on Mom's prepaid plan: a few GB a month, which runs out faster than you'd think. Texts and calls
   don't need data; Chirp, Atlas, music and PIP's smart mode do. Wifi is free at the library, the diner, the mall,
   the laundromat — and at home, until you leave. Top-up cards are sold at QuikMart ($10 = 2 GB, $15 = 5 GB,
   $25 = 15 GB, roughly real prepaid prices).
   And a real trade-off: location sharing needs a connection. No data, no wifi = no blue dot for anyone. */
(function (SH) {
  const NT = SH.Net = {};
  const G = () => SH.G;
  const COST = { chirp: 12, atlas: 6, music: 25, pip: 1, skyforge: 18, weather: 1, camera: 0, photos: 0 };
  const WIFI = {
    home: { n: 'Hollis-Home-5G', free: false, pass: 'rememberthename', note: 'On the fridge, on a sticky note.' },
    library: { n: 'HarlowPublicLibrary', free: true }, diner: { n: 'Route9Diner_Guest', free: true, note: 'Password is "pie". It\'s always pie.' },
    mall: { n: 'Harlow Commons Free WiFi', free: true }, laundromat: { n: 'SUDS-n-DUDS', free: true }, station: { n: 'Northline_Station', free: true },
    school: { n: 'LincolnMS-Student', free: true, filtered: true, note: 'Blocks basically everything fun.' }, hospital: { n: 'StBrigids-Guest', free: true },
    patel: { n: 'PatelHouse', free: false, pass: 'newton2014', note: 'Mrs. Patel will tell you if you ask. She\'ll also feed you.' },
    jordan: { n: 'PikeFamily', free: false, pass: 'tacotuesday', note: 'Jordan knows it.' }, birch: { n: 'xfinitywifi', free: true },
  };
  NT.state = function () {
    const g = G(); if (!g) return null;
    if (!g.net) g.net = { mb: 2600, cap: 3000, renew: 31, joined: { home: true }, cards: [], public: null, cut: false, used: 0 };
    return g.net;
  };
  NT.wifiHere = function () {
    const g = G(), s = NT.state(); if (!g) return null;
    if (g.away) return s.public && s.public.at === g.away ? { n: s.public.n, free: true } : null;
    if (g.loc === 'home' && g.phase !== 'home') return null; // you left
    const w = WIFI[g.loc]; if (!w) return null;
    if (!w.free && !s.joined[g.loc]) return null;
    const h = SH.hour(); if (SH.OPEN && SH.OPEN[g.loc] && !SH.OPEN[g.loc](h) && !['home', 'patel', 'jordan', 'birch'].includes(g.loc)) return w.free && ['library', 'mall'].includes(g.loc) ? Object.assign({ weak: true }, w) : null;
    return w;
  };
  NT.online = () => { const g = G(), s = NT.state(); if (!g || g.phone.airplane) return false; return !!NT.wifiHere() || (s.mb > 0 && !s.cut); };
  NT.use = function (app) {
    const g = G(), s = NT.state(); if (!s) return true;
    const c = COST[app]; if (!c) return true;
    const w = NT.wifiHere(); if (w && !(w.filtered && app !== 'pip' && app !== 'weather' && app !== 'atlas')) return true;
    if (g.phone.airplane || s.cut || s.mb <= 0) return false;
    s.mb = Math.max(0, s.mb - c); s.used += c;
    if (s.mb <= 300 && !s.warned300) { s.warned300 = true; SH.Phone.notify && SH.Phone.notify('settings', 'Harlow Mobile', 'You have 300 MB of data left. Top up at any retailer.'); }
    if (s.mb <= 0) SH.Phone.notify && SH.Phone.notify('settings', 'Harlow Mobile', 'You\'ve used all your data. Texts and calls still work.');
    return true;
  };
  NT.joinPublic = function (n) { const s = NT.state(); s.public = { n, at: G().away }; };
  NT.blocked = function (body, name) {
    const s = NT.state(), w = WIFI[G().loc];
    body.innerHTML = SH.Phone.hdr(name) + `<div class="appbody" style="text-align:center;padding-top:30px"><div style="font-size:40px">📵</div><b>No connection</b>
      <p class="muted">${s.cut ? 'Your line has been suspended by the account holder.' : s.mb <= 0 ? 'You\'re out of data.' : 'Airplane mode is on.'} Texts and calls still work.</p>
      <p class="muted" style="font-size:12px">${w && !w.free ? `There's a network here ("${w.n}"), but it has a password. ${w.note || ''}` : 'Free wifi: the library, the diner, the mall, the laundromat, the station.'}</p>
      <button class="btn" onclick="SH.Phone.open('net')">Network &amp; data</button></div>`;
  };

  /* ---------- the Network app ---------- */
  function view(body) {
    const g = G(), s = NT.state(), w = NT.wifiHere(), here = WIFI[g.loc];
    const pct = Math.round(100 * s.mb / s.cap);
    const renewIn = s.renew - SH.day();
    body.innerHTML = SH.Phone.hdr('📶 Network') + `<div class="appbody">
      <div class="sech">WI-FI</div>
      <div class="setrow"><span>${w ? '✅ ' + SH.Phone.esc(w.n) + (w.weak ? ' (weak, from outside)' : '') + (w.filtered ? ' · filtered' : '') : 'Not connected'}</span></div>
      ${here && !w && !here.free && g.phase === 'home' || (here && !w && !here.free && g.loc !== 'home') ? `<div class="setrow"><span>🔒 ${SH.Phone.esc(here.n)}</span><button class="btn small" onclick="SH.Net.ask()">Ask for the password</button></div>` : ''}
      <div class="sech">MOBILE DATA · Harlow Mobile prepaid</div>
      <div class="setrow"><span>${s.cut ? '⛔ Line suspended' : (s.mb / 1000).toFixed(2) + ' GB left of ' + (s.cap / 1000).toFixed(0) + ' GB'}</span></div>
      <div style="height:8px;background:#333;border-radius:5px;overflow:hidden;margin:4px 0 8px"><div style="height:100%;width:${pct}%;background:${pct < 15 ? '#ff453a' : pct < 35 ? '#ffd60a' : '#30d158'}"></div></div>
      <div class="muted" style="font-size:11.5px">${renewIn > 0 ? `Mom's plan renews in ${renewIn} day${renewIn === 1 ? '' : 's'}${g.phase === 'run' ? ' (if she doesn\'t cancel it)' : ''}.` : 'Plan renewal overdue.'} Used so far: ${(s.used / 1000).toFixed(2)} GB. Texts and calls don't use data.</div>
      <div class="sech">TOP-UP CARDS</div>
      ${s.cards.length ? s.cards.map((c, i) => `<div class="setrow"><span>🎫 ${c} GB card</span><button class="btn small" onclick="SH.Net.redeem(${i})">Redeem</button></div>`).join('') : '<p class="muted" style="font-size:12px">None. QuikMart sells them by the register: $10 = 2 GB · $15 = 5 GB · $25 = 15 GB.</p>'}
      <div class="sech">LOCATION</div>
      <p class="muted" style="font-size:12px">Location sharing: ${g.phone.share ? 'ON' : 'off'}. ${g.phone.share ? (NT.online() ? 'Your blue dot is updating.' : 'You\'re offline, so your dot is frozen where you last had signal.') : ''}</p></div>`;
  }
  NT.ask = function () {
    const g = G(), w = WIFI[g.loc], s = NT.state(); if (!w) return;
    const ok = g.loc === 'home' ? g.phase === 'home' : g.loc === 'patel' ? (g.rel.patel || 0) > 10 : g.loc === 'jordan' ? (g.rel.jordan || 0) > 20 : true;
    if (ok) { s.joined[g.loc] = true; SH.UI.toast(`Connected to ${w.n}. ${g.loc === 'patel' ? '"Of course, dear. Did you eat?"' : ''}`); } else SH.UI.toast('"Not right now, kid."');
    SH.Phone.render();
  };
  NT.redeem = function (i) { const s = NT.state(), c = s.cards.splice(i, 1)[0]; s.mb += c * 1000; s.cap = Math.max(s.cap, s.mb); s.cut = false; s.warned300 = false; SH.UI.toast(`+${c} GB. Your phone feels alive again.`); SH.Phone.render(); };
  if (SH.Phone && SH.Phone.V) { SH.Phone.V.net = view; (SH.Phone.extraApps = SH.Phone.extraApps || []).push({ at: 15, app: ['net', '📶', 'Network', '#0a84ff'] }); }

  /* ---------- buying cards at QuikMart ---------- */
  const bList = SH.Actions.list;
  SH.Actions.list = function () {
    const out = bList.apply(this, arguments), g = G();
    if (g && g.loc === 'store' && !g.away && (!SH.OPEN || !SH.OPEN.store || SH.OPEN.store(SH.hour()))) {
      out.acts.push({ label: 'Buy a phone top-up card', sub: '$10 = 2 GB · $15 = 5 GB · $25 = 15 GB', fn: () => SH.UI.dialog({ title: 'Top-up cards', text: ['A rack of plastic cards by the register, next to the lottery tickets. The cashier doesn\'t care who buys them.'], choices: [[10, 2], [15, 5], [25, 15]].map(([p, gb]) => ({ t: `$${p}: ${gb} GB`, fn: () => { if (g.money < p) { SH.UI.toast('Not enough money.'); return SH.UI.afterAction(); } SH.money(-p); g.tx && g.tx.push({ t: g.t, d: 'Top-up card', a: -p }); NT.state().cards.push(gb); SH.UI.log(`You buy a ${gb} GB top-up card. Redeem it in the Network app.`, 'sys'); SH.UI.afterAction(); } })).concat([{ t: 'Never mind', fn: () => SH.UI.afterAction() }]) }) });
    }
    return out;
  };

  /* ---------- background data use, renewal, Mom cutting the line ---------- */
  const bAdv = SH.advance;
  SH.advance = function (mins) {
    const g = G(), t0 = g ? g.t : 0; const r = bAdv.apply(this, arguments);
    if (!g || g.ended) return r; const s = NT.state();
    const hrs = Math.floor(g.t / 60) - Math.floor(t0 / 60);
    for (let i = 0; i < hrs; i++) {
      if (!NT.wifiHere() && !g.phone.airplane && s.mb > 0 && !s.cut && g.phone.bat > 0) s.mb = Math.max(0, s.mb - (g.phone.share ? 3 : 1) - (SH.hour() > 8 && SH.hour() < 23 ? 4 : 0)); // background sync, location, a little scrolling
      if (SH.day() >= s.renew && g.phase === 'home' && !s.cut) { s.renew += 30; s.mb = s.cap = 3000; s.warned300 = false; }
      if (g.phase === 'run' && g.missingAt && !s.cutDecided && g.t - g.missingAt > 36 * 60) { s.cutDecided = true; if (Math.random() < 0.35) { s.cut = true; SH.Phone.notify && SH.Phone.notify('settings', 'Harlow Mobile', 'Your line has been suspended by the account holder.'); SH.UI.log('Your data just... stops. Someone at home cancelled the plan. Or maybe they\'re hoping you\'ll call from a pay phone. Texts still go through on wifi-calling, sometimes.', 'bad'); } }
    }
    return r;
  };

  /* offline = no location updates: the tracker only works while you're connected */
  if (SH.Run && SH.Run.phoneHour) { const bph = SH.Run.phoneHour; SH.Run.phoneHour = function () { const g = G(); if (g && g.phone.share && !NT.online()) return; return bph.apply(this, arguments); }; }

  /* data-hungry apps check the connection */
  const P = SH.Phone;
  const NAMES = { chirp: '🐦 Chirp', music: '🎧 Music', skyforge: '⚔️ Skyforge', atlas: '🧭 Atlas' };
  const bOpen = P.open;
  P.open = function (app) { if (NAMES[app]) P._blocked = NT.use(app) ? null : app; return bOpen.apply(this, arguments); };

  /* status bar: wifi / LTE / offline */
  const bRender = P.render;
  P.render = function () {
    const r = bRender.apply(this, arguments), g = G(); if (!g) return r;
    if (P._blocked && P.view && P.view.app === P._blocked && document.querySelector('#pbody') && g.phone.bat > 0 && !g.phone.confiscated) { if (NT.online()) P._blocked = null; else NT.blocked(document.querySelector('#pbody'), NAMES[P._blocked]); }
    const sb = document.querySelector('#sbar'); const w = NT.wifiHere(), s = NT.state();
    if (sb && !g.phone.airplane && g.phone.bat > 0 && !g.phone.confiscated) { const html = sb.innerHTML; sb.innerHTML = html.replace('▂▄▆', w ? '📶wifi' : s.cut || s.mb <= 0 ? '▂▄▆ <span style="color:#ff453a">no data</span>' : '▂▄▆ LTE'); }
    return r;
  };
})(window.SH);
