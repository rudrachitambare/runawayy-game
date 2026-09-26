/* SMALL HOURS — Part 2c: junkyards (every town; size varies) and vehicles you can buy for cash, fix, fuel,
   sleep in, and (badly, then less badly) drive. No theft: the owner sells "as-is, cash, no questions." */
(function (SH) {
  const A = SH.Atlas; if (!A) return;
  const G = () => SH.G, $ = (n) => '$' + n;
  const J = SH.Junk = {};
  const TYPES = { car: { n: 'rusty hatchback', warm: 18, seats: 4, price: [180, 320] }, tempo: { n: 'little tempo truck', warm: 12, seats: 3, price: [220, 380] }, minivan: { n: 'dented minivan', warm: 25, seats: 7, price: [260, 450] }, camper: { n: 'old camper van', warm: 40, seats: 4, price: [480, 800] } };
  const PARTS = { battery: ['x_carbat', 'Car battery', 45], tires: ['x_tires', 'Tires', 40], oil: ['x_motoroil', 'Motor oil', 8], plugs: ['x_sparkplugs', 'Spark plugs', 9] };
  J.TYPES = TYPES;
  J.yard = function (p) {
    const r = SH.Browser ? SH.Browser.rnd(p.pop + p.id.length * 131) : Math.random;
    const n = { village: 1 + Math.floor(r() * 2), small: 2 + Math.floor(r() * 2), town: 4, city: 6 }[p.tier];
    const keys = Object.keys(TYPES), out = [];
    for (let i = 0; i < n; i++) { const t = i === 0 && p.tier === 'city' ? 'camper' : keys[Math.floor(r() * keys.length)], T = TYPES[t]; out.push({ id: p.id + 'v' + i, type: t, n: T.n, price: Math.round(T.price[0] + r() * (T.price[1] - T.price[0])), need: keys.length ? Object.keys(PARTS).filter(() => r() < 0.75) : [] }); }
    return { name: { village: 'a field of dead cars behind the Pruitt barn', small: 'Dale\'s Scrap & Salvage', town: 'County Auto Salvage', city: 'Metro U-Pull-It' }[p.tier], owner: ['Dale', 'Bev', 'Gus', 'Rosa', 'Big Earl'][Math.floor(r() * 5)], cars: out };
  };
  const sold = () => (G().junkSold = G().junkSold || {});

  J.open = function (p) {
    const g = G(), Y = J.yard(p), v = g.veh, back = () => (g.away ? setTimeout(A.hub, 30) : SH.UI.afterAction());
    const ch = [];
    if (!v) Y.cars.filter((c) => !sold()[c.id]).forEach((c) => ch.push({ t: `Buy the ${c.n}: ${$(c.price)} cash`, sub: c.need.length ? `Needs: ${c.need.join(', ')} + work` : 'Needs work, but it turns over', fn: () => J.buy(p, c) }));
    if (v && v.at === p.id) {
      if (!v.running) ch.push({ t: `Work on the ${v.n} (2h)`, sub: `Progress ${Math.round(v.work)}% · mechanics ${SH.skill('mech')}`, fn: () => J.work() });
      Object.entries(PARTS).forEach(([k, [id, n, price]]) => { if (!v.parts[k]) { const have = SH.has(id) || (g.owned || []).includes(id); ch.push({ t: have ? `Install ${n}` : `Buy a used ${n.toLowerCase()} here: ${$(Math.round(price * 0.6))}`, fn: () => J.part(k, have) }); } });
      if (v.running && v.fuel < 100) ch.push({ t: 'Fill up at the pump', sub: `Fuel ${Math.round(v.fuel)}% · $5 per 10%`, fn: () => J.fuel() });
    }
    ch.push({ t: 'Leave', fn: back });
    SH.UI.dialog({ title: Y.name, text: [`${Y.owner} runs it. ${v && v.at === p.id ? `Your ${v.n} sits where you left it${v.running ? ', ready to go' : ''}.` : `${Y.cars.length} vehicle${Y.cars.length > 1 ? 's' : ''} worth looking at. "Cash, as-is, no title, no questions. You're a little young, aren't you?" A shrug. "Money's money."`}`], choices: ch });
  };
  J.buy = function (p, c) {
    const g = G(); if (g.money < c.price) return SH.UI.toast(`${$(c.price)} cash. You have ${$(Math.floor(g.money))}.`);
    SH.money(-c.price); sold()[c.id] = true; (g.tx = g.tx || []).push({ t: g.t, d: 'Junkyard: ' + c.n, a: -c.price });
    const parts = { battery: true, tires: true, oil: true, plugs: true }; c.need.forEach((k) => parts[k] = false);
    g.veh = { n: c.n, type: c.type, at: p.id, parts, work: c.need.length ? 20 : 70, fuel: 5, running: false, warm: TYPES[c.type].warm, seats: TYPES[c.type].seats, nights: 0, since: g.t };
    SH.flag('ownsVehicle'); SH.UI.log(`You own a ${c.n}. It smells like mice and old french fries. It's the best thing that's ever been yours.`, 'good'); J.open(p);
  };
  J.part = function (k, have) {
    const g = G(), v = g.veh, [id, n, price] = PARTS[k];
    if (have) { if (!SH.rmBag(id)) { const i = g.owned.indexOf(id); if (i >= 0) g.owned.splice(i, 1); } }
    else { const cost = Math.round(price * 0.6); if (g.money < cost) return SH.UI.toast('Not enough cash.'); SH.money(-cost); }
    v.parts[k] = true; SH.advance(30, { interrupt: false }); J.check(); J.open(A.here());
  };
  J.work = function () {
    const g = G(), v = g.veh; SH.advance(120, { interrupt: false }); SH.st('energy', -12); SH.st('hyg', -10);
    const gain = 10 + SH.skill('mech') / 4 + ((g.party || []).length * 5);
    v.work = Math.min(100, v.work + gain); (g.skills = g.skills || {}).mech = Math.min(100, (g.skills.mech || 0) + 3);
    SH.UI.log(`Grease to the elbows.${(g.party || []).length ? ' Everyone helps, even if "helping" means holding the flashlight wrong.' : ''} (+${Math.round(gain)}%)`, 'sys'); J.check(); J.open(A.here());
  };
  J.check = function () { const v = G().veh; if (v && !v.running && v.work >= 100 && Object.values(v.parts).every(Boolean)) { v.running = true; SH.UI.log(`You turn the key. It coughs, it rattles, and then the ${v.n} RUNS. Someone screams. It might be you.`, 'good'); SH.flag('vehicleRuns'); } };
  J.fuel = function () { const g = G(), v = g.veh; if (g.money < 5) return SH.UI.toast('$5 for 10%.'); const k = Math.min(Math.floor(g.money / 5), Math.ceil((100 - v.fuel) / 10)); SH.money(-k * 5); v.fuel = Math.min(100, v.fuel + k * 10); g.awayNotice = (g.awayNotice || 0) + 4; SH.UI.log('The clerk watches a twelve-year-old pump gas and decides it\'s not his business. Mostly.', 'warn'); J.open(A.here()); };

  /* sleeping in it: warmer, less noticed than sleeping rough */
  J.sleep = function () {
    const g = G(), v = g.veh, back = () => (g.away ? setTimeout(A.hub, 30) : SH.UI.afterAction());
    SH.advance(8 * 60, { interrupt: false }); v.nights++; SH.st('energy', 45); SH.st('warmth', v.warm); SH.st('stress', -4);
    g.awayNotice = Math.max(0, (g.awayNotice || 0) - 5);
    if (v.nights >= 12 && Math.random() < 0.15) return SH.EndX.trigger('van', {});
    SH.UI.dialog({ title: 'The ' + v.n, text: [v.type === 'camper' ? 'The camper has a real bed, sort of, and a door that locks. You sleep eight hours straight.' : `You sleep across the seats with your hoodie as a pillow. ${(g.party || []).length ? 'Somebody snores. Somebody always snores.' : 'The windows fog up. It\'s warmer than outside.'}`], choices: [{ t: 'Okay', fn: back }] });
  };

  /* hooks: Atlas hub + Harlow (trainyard backs onto County Auto Salvage) */
  (A.extra = A.extra || []).push((p, ch, dark) => {
    if (!dark) ch.push({ t: '🚙 The junkyard', sub: J.yard(p).name, fn: () => J.open(p) });
    const v = G().veh; if (v && v.at === p.id) ch.unshift({ t: `Sleep in the ${v.n}`, sub: `Warmth +${v.warm}`, fn: J.sleep });
  });
  const AC = SH.Actions;
  if (AC && AC.list) { const bl = AC.list; AC.list = function () { const r = bl.apply(this, arguments), g = G(); if (!g || g.away || !r || !r.acts) return r; if (g.loc === 'trainyard' && !SH.isDark()) r.acts.push({ label: 'Walk over to County Auto Salvage', sub: 'Junk cars, cash only', fn: () => J.open(A.data().places[0]) }); const v = g.veh; if (v && v.at === 'p0' && g.loc === 'trainyard' && g.phase === 'run') r.acts.unshift({ label: `Sleep in the ${v.n}`, sub: 'Behind the salvage yard', fn: J.sleep }); return r; }; }
})(window.SH);
