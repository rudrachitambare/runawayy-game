/* SMALL HOURS — the Route 9 Pickup: Harlow's unofficial stop.
   The Greyline depot is for the official lines (Averline, County Transit, professional coaches); Harlow Station is rail.
   Everything else on the road (CheapRide and the other cheap buses, tempos, minivan shuttles, car pools) picks up in the
   gravel lot beside the Gas-N-Go on Route 9 & Center Ave. No ticket window, no bays: a painted board, a crate bench,
   drivers who shout where they're going. Less watched than the depot. Operators here are sketchy-but-safe at worst.
   routes.js guarantees each of these companies runs at least once from Harlow (R.informal marks them). */
(function (SH) {
  const U = SH.util, R = SH.Routes, A = SH.Atlas, D = (o) => SH.UI.dialog(o), log = (t, c) => SH.UI.log(t, c || 'sys');
  const G = () => SH.G, H = () => A.data().places.find((p) => p.home) || A.data().places[0];
  const fmt = (t) => R.fmt(t);

  SH.LOC.pickup = { name: 'Route 9 Pickup', sub: 'Gas-N-Go lot · vans, tempos, cheap buses', x: 585, y: 318, type: 'pickup', icon: '🚐', indoor: false, vis: 0.5, bus: true,
    blurb: 'A gravel lot beside the Gas-N-Go where the cheap buses, tempos and van shuttles pull in. A hand-painted board, a bench made of a plank on two crates, and nobody checking anything.' };
  SH.OPEN.pickup = () => true;
  if (SH.World && SH.World.START_KNOWN && !SH.World.START_KNOWN.includes('pickup')) SH.World.START_KNOWN.push('pickup');

  /* which services use which Harlow spot */
  const WHERE = { bus: (o) => !o.T.rail && !R.informal(o), station: (o) => !!o.T.rail, pickup: (o) => R.informal(o) };
  const T = SH.Tickets;
  T.locName = (l) => ({ station: 'train station', bus: 'Greyline bus depot', pickup: 'Route 9 pickup (Gas-N-Go lot)' })[l] || 'stop';
  const SPOTS = ['the curb by the air pump', 'the painted board by the ice machine', 'the crate bench', 'the far end of the lot, by the dumpster fence'];
  const bp = T.point;
  T.point = function (pid, rt) {
    const p = A.data().places.find((x) => x.id === pid);
    if (p && p.home && rt && rt.op && R.informal(rt.op)) { let h = 0; for (const c of String(rt.id)) h = (h * 31 + c.charCodeAt(0)) >>> 0; return { n: 'Route 9 pickup', at: SPOTS[h % SPOTS.length], loc: 'pickup' }; }
    return bp.apply(this, arguments);
  };

  /* departures boards in Harlow only show what actually leaves from where you're standing */
  const bView = R.boardView;
  R.boardView = function (place) { const g = G(); R.only = (!g.away && place && place.home && WHERE[g.loc]) || null; try { return bView.apply(this, arguments); } finally { R.only = null; } };
  // (boardView builds its choices synchronously, so the filter only applies to that one board)

  const here = () => { const g = G(); R.only = WHERE.pickup; try { return R.board(H(), g.t); } finally { R.only = null; } };
  const soon = () => here().filter((b) => b.dep - G().t <= 90);

  /* ---------- actions ---------- */
  const bl = SH.Actions.list;
  SH.Actions.list = function () {
    const out = bl.apply(this, arguments), g = G(); if (!g || g.loc !== 'pickup' || g.away || !out || !out.acts) return out;
    const a = out.acts, act = (label, sub, fn, o) => Object.assign({ label, sub, fn }, o || {}), done = () => SH.UI.afterAction();
    const B = here(), nx = B[0];
    a.push(act('🚏 Rides leaving from here', nx ? `Next: ${fmt(nx.dep)} ${nx.rt.op.icon} ${nx.rt.op.n}` : 'Nothing else today', () => {
      if (g.phase !== 'home') return R.boardView(H());
      D({ title: 'This is it', text: ['If you get in one of these, you\'ve run away. No going back upstairs and pretending.', 'Nobody here will ask. That\'s the point of this place.'],
        choices: [{ t: 'Get on something', cls: 'hot', fn: () => { SH.Run.start('pickup', false); setTimeout(() => R.boardView(H()), 60); } }, { t: 'Not today', cls: 'safe', fn: () => {} }] });
    }, { cls: g.phase === 'home' ? 'hot' : 'safe' }));
    a.push(act('Read the painted board', 'Who stops here, and when', () => {
      SH.advance(3, { interrupt: false }); const ops = {}; B.forEach((b) => { const o = b.rt.op; (ops[o.id] = ops[o.id] || { o, t: [] }).t.push(b.dep); });
      const lines = Object.values(ops).map(({ o, t }) => `${o.icon} ${o.n.toUpperCase()}: ${t.slice(0, 3).map(fmt).join(', ')}`);
      log(lines.length ? 'The board is plywood, repainted so many times the old times show through. ' + lines.join(' · ') + '. Underneath, in marker: "PAY THE DRIVER. NO REFUNDS. NO CRYING."' : 'The board is plywood. Everything on it for today is crossed out.', 'sys'); done();
    }));
    a.push(act('Ask a driver where he\'s headed', '5 min', () => {
      SH.advance(5, { interrupt: false }); const s = soon();
      if (!s.length) { log('The lot is empty except for a pigeon and a guy filling up a lawnmower gas can. Nothing\'s pulling in for a while.', 'sys'); return done(); }
      const b = U.pick(s), o = b.rt.op, end = A.data().places.find((p) => p.id === b.rt.stops[b.rt.stops.length - 1]);
      const who = { tempo: 'A tempo driver with a toothpick', minivan: 'A woman leaning on a dented van', car: 'A guy in a sedan with a RIDES sign on the dash', bus: 'A bus driver finishing a cigarette' }[o.type] || 'A driver';
      log(`${who} squints at you. "${end.name}. ${fmt(b.dep)}. ${R.price(b.rt, b.i, b.rt.stops.length - 1)} bucks, cash, pay when you get in." ${o.style === 'sketchy' ? 'He doesn\'t ask how old you are. He doesn\'t ask anything.' : '"You by yourself?" You shrug. He shrugs back.'}`, 'sys');
      SH.flag('knowsPickup'); done();
    }));
    a.push(act('Gas-N-Go: chips $1.75', '', () => { if (g.money < 1.75) return SH.UI.toast('Not enough cash.'); SH.money(-1.75); (g.tx = g.tx || []).push({ t: g.t, d: 'Gas-N-Go', a: -1.75 }); SH.addBag('chips', true); done(); }));
    a.push(act('Gas-N-Go restroom', '+hygiene · the key is on a hubcap', () => { SH.advance(10, { interrupt: false }); SH.st('hyg', 6); done(); }));
    if (g.phase === 'run') a.push(act('Sit on the crate bench and wait', '30 min · cold, but nobody looks', () => { SH.advance(30, { interrupt: true }); SH.st('warmth', SH.raining() ? -8 : -3); SH.st('stress', -3); log(U.pick(['A tempo pulls in, honks twice, and leaves half-full. The driver yells a town name you don\'t catch.', 'Two farmhands load a crate of chickens onto the roof of a van. The chickens have opinions.', 'The Gas-N-Go clerk comes out to smoke, looks at you, looks at the road, goes back in.']), 'sys'); done(); }));
    return out;
  };

  /* ---------- scene art ---------- */
  const PL = SH.ScenePL;
  if (PL) PL.pickup = function (x, E) {
    const gy = E.gy, W = E.W, sh = E.shade, Rr = (c, X, Y, w, h) => { x.fillStyle = c; x.fillRect(X, Y, w, h); };
    Rr(sh('#6d6558'), 0, gy - 6, W, 6); // gravel
    for (let i = 0; i < 60; i++) Rr(sh(i % 2 ? '#7c7466' : '#5c5549'), (i * 97) % W, gy - 5 + (i % 3), 3, 2);
    const cx = W * 0.3; // Gas-N-Go canopy + pumps
    Rr(sh('#dedad2'), cx - 120, gy - 118, 240, 16); Rr(E.night ? '#ff8a3d' : sh('#d4602a'), cx - 120, gy - 104, 240, 4);
    Rr(sh('#b8b4ac'), cx - 100, gy - 102, 6, 102); Rr(sh('#b8b4ac'), cx + 94, gy - 102, 6, 102);
    [cx - 40, cx + 30].forEach((px) => { Rr(sh('#e8e4dc'), px, gy - 38, 20, 38); Rr(E.night ? '#ffcf6b' : sh('#333'), px + 4, gy - 32, 12, 7); });
    x.font = 'bold 12px system-ui'; x.fillStyle = E.night ? '#ffb070' : sh('#b24a1c'); x.fillText('GAS-N-GO', cx - 30, gy - 107);
    if (E.night) E.lamps.push([cx, gy - 100, 1.6]);
    const bx = W * 0.62; // the painted board + crate bench
    Rr(sh('#5a4632'), bx, gy - 70, 5, 70); Rr(sh('#5a4632'), bx + 95, gy - 70, 5, 70); Rr(sh('#e2d6b8'), bx - 6, gy - 96, 112, 34);
    x.font = 'bold 11px system-ui'; x.fillStyle = sh('#b0261e'); x.fillText('RIDES · VANS', bx + 8, gy - 82); x.font = 'bold 9px system-ui'; x.fillStyle = sh('#2a2a2a'); x.fillText('TEMPOS · $ CASH', bx + 10, gy - 69);
    Rr(sh('#8a6a3e'), bx + 10, gy - 16, 22, 16); Rr(sh('#8a6a3e'), bx + 70, gy - 16, 22, 16); Rr(sh('#a8844e'), bx + 4, gy - 21, 94, 5);
    const b = soon()[0]; // something idling in the lot when a ride is due
    if (b && b.dep - G().t <= 25) {
      const t = b.rt.op.type, vx = W * 0.8, col = sh(b.rt.op.col || '#c9a227');
      const w = t === 'bus' ? 190 : t === 'car' ? 90 : t === 'tempo' ? 80 : 120, h = t === 'bus' ? 46 : t === 'car' ? 24 : 36;
      x.beginPath(); x.roundRect ? x.roundRect(vx - w / 2, gy - h - 8, w, h, 7) : x.rect(vx - w / 2, gy - h - 8, w, h); x.fillStyle = col; x.fill();
      x.fillStyle = E.night ? 'rgba(255,230,170,.75)' : 'rgba(170,200,230,.7)'; for (let i = 0; i < Math.max(1, Math.floor(w / 36)); i++) x.fillRect(vx - w / 2 + 8 + i * 34, gy - h - 2, 24, h * 0.4);
      x.fillStyle = '#0c0d10'; x.beginPath(); x.arc(vx - w / 2 + 16, gy - 6, 7, 0, 7); x.arc(vx + w / 2 - 16, gy - 6, 7, 0, 7); x.fill();
    }
  };
})(window.SH);
