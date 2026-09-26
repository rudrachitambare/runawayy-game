/* SMALL HOURS — real tickets. Book on AverRides (rides.av) or any company site; board at the right spot at the right time.
   BOOKING  T.book(key, destId, {pay, age}) → a ticket with a code, a boarding point, a status.
     pay 'card' = PocketPal now (Mom sees card charges; on the run that pins you). Not on cash-only (sketchy) companies.
     pay 'cash' = reserve a seat, pay the driver/counter when you board (you need the cash then).
     Companies that check ages (professional ones, except County Transit) ask the youngest passenger's age.
     12 → refused online ("under 15 can't travel alone"). Saying 15+ books it, but the door check still happens.
   WHERE YOU BOARD  T.point(placeId, route): Harlow → "Bay 3 · Harlow bus depot" / "Platform 2 · Harlow Station";
     cities: central terminal bays; towns: depot bays; small towns/villages: a kerbside stop outside a landmark;
     sketchy vans/car pools: a parking lot; rail: platforms, or a halt (a sign and a bench) in tiny places.
   BOARDING  "🎫 Board" shows in the town menu (away) or at the Harlow bus depot / station, and in My trips when you're
     there. From home, boarding IS running away (it asks first). You wait until departure, then ride as usual.
     Prepaid tickets skip paying at the door and make the check a bit less likely.
   MISSED / CANCEL  missed rides are marked missed; cancelling refunds card tickets (pro 90%, others 50%), cash
     reservations cancel free. A reminder shows an hour before. */
(function (SH) {
  const R = SH.Routes, A = SH.Atlas; if (!R || !A) return;
  const G = () => SH.G, fmt = R.fmt, NP = (id) => R.net().P[id];
  const grp = () => 1 + ((G().party || []).length);
  const T = SH.Tickets = {};
  T.all = () => (G().tickets = G().tickets || []);
  T.get = (code) => T.all().find((t) => t.code === code);
  const pk = (r, a) => a[Math.floor(r() * a.length)];
  T.checks = (o) => o.style === 'pro' && o.id !== 'county' && o.strict >= 0.2;
  T.point = function (pid, rt) {
    const p = NP(pid), o = rt.op, r = R.rng('bp' + pid + o.id);
    if (o.T.rail) {
      if (p.home) return { n: 'Harlow Station', at: 'Platform ' + (1 + Math.floor(r() * 2)), loc: 'station' };
      return p.station || p.tier === 'city' || p.tier === 'town' ? { n: p.name + ' Station', at: 'Platform ' + (1 + Math.floor(r() * (p.tier === 'city' ? 6 : 3))) } : { n: p.name + ' halt', at: 'a sign and a bench by the tracks' };
    }
    if (p.home) return { n: 'Harlow bus depot', at: 'Bay ' + (1 + Math.floor(r() * 6)), loc: 'bus' };
    if (o.style === 'sketchy' || o.type === 'car' || o.type === 'minivan') return { n: pk(r, ['the gas station lot', 'the diner parking lot', 'the corner by the laundromat', 'the lot behind the feed store']) + ', ' + p.name, at: o.type === 'car' ? `a car with a ${o.n} sign in the window` : `the ${o.T.v} with the engine running` };
    if (p.tier === 'city') return { n: p.name + ' Central Bus Terminal', at: 'Bay ' + (1 + Math.floor(r() * 14)) };
    if (p.tier === 'town') return { n: p.name + ' bus depot', at: 'Bay ' + (1 + Math.floor(r() * 6)) };
    if (o.type === 'tempo') return { n: 'the tempo stand, ' + p.name, at: 'by the ' + pk(r, ['water pump', 'tea stall', 'feed store', 'big oak']) };
    return { n: 'the stop in ' + p.name, at: 'outside the ' + pk(r, p.tier === 'village' ? ['church', 'general store', 'grain elevator', 'war memorial'] : ['post office', 'gas station', 'diner', 'library']) };
  };
  T.ptxt = (pt) => (/^(Bay|Platform)/.test(pt.at) ? `${pt.at} · ${pt.n}` : `${pt.n} (${pt.at})`);
  const code = (key) => { const r = R.rng(key + G().t), c = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; let s = ''; for (let i = 0; i < 6; i++) s += c[Math.floor(r() * c.length)]; return s.slice(0, 3) + '-' + s.slice(3); };
  T.left = (t) => { const m = t - G().t; if (m < 0) return 'left ' + fmt(t); if (m < 60) return 'in ' + m + ' min'; return 'in ' + Math.floor(m / 60) + 'h ' + (m % 60) + 'm'; };
  T.state = (tk) => { if (tk.st === 'booked' && G().t > tk.dep + 2) tk.st = 'missed'; return tk.st; };

  T.book = function (key, destId, o) {
    o = o || {}; const g = G(), jr = R.byKey(key), to = NP(destId); if (!jr || !to) return { ok: false, msg: 'That trip doesn\'t exist anymore.' };
    if (jr.dep < g.t + 5) return { ok: false, msg: 'Too late. That one\'s already boarding or gone.' };
    const ops = jr.legs.map((l) => l.rt.op), n = grp(), cost = jr.cost * n;
    const cashOnly = ops.find((x) => x.S.cash);
    if (o.pay === 'card' && cashOnly) return { ok: false, msg: `${cashOnly.n} is cash only. Reserve the seat and pay the driver.` };
    const strict = ops.find(T.checks);
    if (strict && !(+o.age >= 15)) return { ok: false, msg: `${strict.n}: "Unaccompanied minors under 15 can't be booked online. An adult must book and travel with the child." (You could say you're older. The door check still happens.)` };
    const L0 = jr.legs[0]; if (R.seats(L0.rt, L0.dep) < n && L0.rt.op.style !== 'sketchy') return { ok: false, msg: `Sold out: fewer than ${n} seats left on the ${fmt(L0.dep)}.` };
    if (T.all().some((t) => t.key === key && t.st === 'booked')) return { ok: false, msg: 'You already have a ticket for that one. Check My trips.' };
    const from = NP(L0.rt.stops[L0.i]);
    if (o.pay === 'card' && !(SH.Bank && SH.Bank.pay(cost, `AverRides: ${ops[0].n} ${from.name} → ${to.name}`))) return { ok: false, msg: 'Payment didn\'t go through.' };
    const tk = { code: code(key), key, to: to.id, toN: to.name, from: from.id, fromN: from.name, dep: jr.dep, arr: jr.arr, n, cost, pay: o.pay === 'card' ? 'card' : 'cash', lied: !!strict && +o.age >= 15,
      ops: ops.map((x) => x.icon + ' ' + x.n), pts: jr.legs.map((l) => T.ptxt(T.point(l.rt.stops[l.i], l.rt))), loc: T.point(L0.rt.stops[L0.i], L0.rt).loc || null, st: 'booked', t: g.t };
    T.all().unshift(tk); if (T.all().length > 30) T.all().pop();
    return { ok: true, tk };
  };
  T.cancel = function (c) {
    const tk = T.get(c); if (!tk || T.state(tk) !== 'booked') return;
    let msg = 'Reservation cancelled.';
    if (tk.pay === 'card') { const jr = R.byKey(tk.key), pro = jr && jr.legs.every((l) => l.rt.op.style === 'pro'), back = Math.floor(tk.cost * (pro ? 0.9 : 0.5)); if (back > 0 && SH.Bank) SH.Bank.deposit(back, 'AverRides refund ' + tk.code); msg = `Cancelled. $${back} back to PocketPal${pro ? ' (10% fee)' : ' (this company refunds half)'}.`; }
    tk.st = 'cancelled'; SH.UI.toast(msg); SH.Phone.render();
  };
  T.here = (tk) => { const g = G(); if (A.here().id !== tk.from) return false; return !!g.away || !tk.loc || g.loc === tk.loc; };
  T.board = function (c) {
    const tk = T.get(c), g = G(); if (!tk) return; if (T.state(tk) !== 'booked') return SH.UI.toast('That ticket is ' + tk.st + '.');
    if (A.here().id !== tk.from) return SH.UI.toast(`This leaves from ${tk.fromN}. You're in ${A.here().name}.`);
    if (!g.away && tk.loc && g.loc !== tk.loc) return SH.UI.toast(`Go to the ${tk.loc === 'station' ? 'train station' : 'bus depot'} first. ${tk.pts[0]}.`);
    const go = () => { tk.st = 'used'; const jr = R.byKey(tk.key); jr.prepaid = tk.pay === 'card'; jr.tk = tk.code; SH.Mobile && SH.Mobile.is && SH.Mobile.is() && SH.Mobile.tab('story'); document.body.classList.remove('mapfull'); R.take(jr, A.data().places.find((p) => p.id === tk.to)); };
    const wait = tk.dep - g.t;
    const waitThen = () => (wait > 3 ? SH.UI.dialog({ title: `🎫 ${tk.code}`, text: [`You wait at ${tk.pts[0]}. It leaves at ${fmt(tk.dep)} (${Math.floor(wait / 60) ? Math.floor(wait / 60) + 'h ' : ''}${wait % 60}m).`], choices: [{ t: 'Wait for it', cls: 'safe', fn: go }, { t: 'Not yet', fn: () => {} }] }) : go());
    if (g.phase === 'home' && wait > 90) return SH.UI.toast(`It leaves at ${fmt(tk.dep)}. Come back after ${fmt(tk.dep - 90)}. Sitting at the depot for hours is how people notice you.`);
    if (g.phase === 'home') return SH.UI.dialog({ title: 'This is it', text: ['If you get on, you\'ve run away. No going back upstairs and pretending.', `${tk.ops[0]} to ${tk.toN}, ${fmt(tk.dep)}.`], choices: [{ t: 'Go', cls: 'hot', fn: () => { SH.Run.start('ticket', false); setTimeout(waitThen, 60); } }, { t: 'Not today', cls: 'safe', fn: () => {} }] });
    waitThen();
  };
  const boardable = (p) => T.all().filter((t) => T.state(t) === 'booked' && t.from === p.id && t.dep - G().t <= 12 * 60);
  (A.extra = A.extra || []).push((p, ch) => { boardable(p).forEach((t) => ch.unshift({ t: `🎫 Board: ${fmt(t.dep)} → ${t.toN}`, sub: `${t.pts[0]} · leaves ${T.left(t.dep)}`, cls: 'safe', fn: () => T.board(t.code) })); });
  const AC = SH.Actions;
  if (AC && AC.list) { const bl = AC.list; AC.list = function () { const r = bl.apply(this, arguments), g = G(); if (!g || g.away || !r || !r.acts) return r; boardable(A.here()).filter((t) => t.loc === g.loc).forEach((t) => r.acts.unshift({ label: `🎫 Board your ${fmt(t.dep)} ride → ${t.toN}`, sub: `${t.pts[0]} · ${T.left(t.dep)}`, cls: 'safe', fn: () => T.board(t.code) })); return r; }; }
  if (SH.K && SH.K.hourly) SH.K.hourly.push(() => { T.all().forEach((t) => { if (T.state(t) === 'booked' && t.dep - G().t <= 75 && t.dep - G().t > 0 && !t.rem) { t.rem = 1; SH.UI.toast(`🎫 ${fmt(t.dep)} to ${t.toN} leaves ${T.left(t.dep)} from ${t.pts[0]}.`); } }); });
})(window.SH);
