/* gear.js: shop items promised things ("warmth +8", "health", "camping") and then did nothing.
   Now they do what their labels say:
   - clothes with warmth keep you warmer while they're in your bag; sleeping bag / mat count when you sleep
   - rain jacket / tarp take the sting out of rain like the umbrella does
   - hiking boots already cut blisters (worldsys.js)
   - band-aids / first-aid kit heal and treat blisters; cold medicine & pain reliever work if you somehow have them
   - toilet paper, pads: real hygiene items with several uses
   - energy drink: energy, not a meal; bottled water: you drink it
   - camp stove: cook a hot meal from your food; water filter: drink from any creek
   - lantern / flashlight: nights outside are less frightening
   - tarp / paracord: go on your shack pile when you're at your own place */
(function (SH) {
  const G = () => SH.G;
  const C = () => SH.Catalog;
  const cat = (id) => (C() && C().ALL && C().ALL[id]) || null;
  const ITEM = (id) => (SH.ITEMS && SH.ITEMS[id]) || {};
  const has = (id) => SH.has(id);
  const near = (id) => { const g = G(); return has(id) || ((g.owned || []).includes(id) && g.base && g.away === g.base.pid); };

  /* ---------- warmth ---------- */
  const bIns = SH.insulation;
  SH.insulation = function (sleeping) {
    let w = bIns ? bIns.apply(this, arguments) : 0, extra = 0;
    const g = G(); if (!g) return w;
    (g.bag || []).forEach((id) => { const c = cat(id); if (c && c.warm) extra += c.warm; });
    if (sleeping) { ['x_sleepbag', 'x_mat'].forEach((id) => { if (near(id)) { const c = cat(id); extra += (c && c.sleepWarm) || 0; } }); }
    return w + Math.min(extra, 55);
  };
  const bWarm = SH.warmTarget;
  SH.warmTarget = function (sleeping) {
    let v = bWarm.apply(this, arguments);
    if (!SH.locIndoor() && SH.raining() && !has('umbrella')) {
      if (has('x_rainjacket')) v += 16; else if (sleeping && near('x_tarp')) v += 14;
    }
    return Math.max(0, Math.min(90, v));
  };

  /* ---------- nights outside: a light helps ---------- */
  const bAdv = SH.advance;
  SH.advance = function (mins, opts) {
    const r = bAdv.apply(this, arguments);
    try {
      const g = G(), h = SH.hour();
      if (g && g.phase === 'run' && (h >= 21 || h < 6) && !SH.locIndoor() && (has('flashlight') || near('x_lantern'))) SH.st('stress', -0.05 * (mins || 10));
    } catch (e) {}
    return r;
  };

  /* ---------- using things ---------- */
  const AC = SH.Actions; if (!AC || !AC.useItem) return;
  const log = (t, c) => SH.UI.log(t, c || ''), done = () => SH.UI.afterAction();
  const uses = (id, n) => { const g = G(); g.useLeft = g.useLeft || {}; if (g.useLeft[id] == null) g.useLeft[id] = n; return g.useLeft; };
  const spend = (id) => { const u = G().useLeft; if (--u[id] <= 0) { SH.rmBag(id); delete u[id]; log(`That's the last of the ${ITEM(id).n.toLowerCase()}.`, 'sys'); } };
  const hp = () => { const g = G(); return (g.hp = g.hp || { cold: 0, blist: 0, debt: 0 }); };
  const outdoorsWater = () => { const g = G(); return !SH.locIndoor() && (/edge|park|creek|lake|river/.test(g.loc || '') || (g.away && (!SH.Atlas || !SH.Atlas.here || /forest|coast|lake|river|farm|hill|mount|wood|shore/.test(((SH.Atlas.here() || {}).biome) || '')))); };
  const food = () => (G().bag || []).filter((id) => { const it = ITEM(id); return it.food && !it.reusable && !/energy|water/.test(id); });

  const bUse = AC.useItem;
  AC.useItem = function (id) {
    const g = G(), it = ITEM(id); if (!g || !it || SH.UI.modalOpen()) return bUse.apply(this, arguments);
    const c = cat(id);
    // drinks aren't meals
    if (id === 'x_energy') { SH.rmBag(id); SH.st('energy', 22); SH.st('full', 3); SH.st('stress', 4); SH.advance(3, { interrupt: false }); log('You crack the energy drink. It tastes like a battery that went to college. Your heart speeds up and your eyes open wider.', ''); return done(); }
    if (id === 'x_water6') { uses(id, 6); SH.st('full', 4); SH.st('health', 2); SH.advance(3, { interrupt: false }); log(`You drink a whole bottle of water in one go. ${g.useLeft[id] - 1 > 0 ? `${g.useLeft[id] - 1} left.` : ''}`, ''); spend(id); return done(); }
    // health
    if (id === 'x_bandaids' || id === 'x_firstaid') {
      const n = id === 'x_firstaid' ? 6 : 5; uses(id, n); const h = hp(), b0 = h.blist || 0;
      h.blist = Math.max(0, b0 - (id === 'x_firstaid' ? 50 : 35)); SH.st('health', c ? c.heal : 6); SH.advance(10, { interrupt: false });
      log(b0 >= 20 ? (id === 'x_firstaid' ? 'You sit down, pull your socks off, and do it properly: antiseptic wipe, blister pads, gauze. Walking stops feeling like a punishment.' : 'You put band-aids over the worst blisters. Your shoes still hate you, but less.') : (id === 'x_firstaid' ? 'You clean up every scrape you\'ve collected. Antiseptic stings, then feels better.' : 'You put a band-aid on a scrape you didn\'t notice until now.'), 'good');
      spend(id); return done();
    }
    if (id === 'x_coldmeds') { const h = hp(); if (!h.cold) return SH.UI.toast('You don\'t have a cold. Save it.'); uses(id, 6); h.cold = Math.max(0, h.cold - 25); SH.st('energy', 5); SH.advance(5, { interrupt: false }); log('You take the cold medicine. Twenty minutes later your head unclogs a little and the world stops being cotton.', 'good'); spend(id); return done(); }
    if (id === 'x_painkiller') { uses(id, 8); const h = hp(); h.blist = Math.max(0, (h.blist || 0) - 10); SH.st('health', 4); SH.st('stress', -3); SH.advance(5, { interrupt: false }); log('You take one pill with a swallow of water. The ache in your feet and your back fades to background.', 'good'); spend(id); return done(); }
    if (id === 'x_inhaler2') { SH.rmBag(id); g.puffs = (g.puffs || 0) + 200; if (!has('inhaler')) SH.addBag ? SH.addBag('inhaler') : g.bag.push('inhaler'); log('A new rescue inhaler. You put it where your hand can find it without looking.', 'good'); return done(); }
    if (id === 'x_sunscreen') { uses(id, 10); SH.st('health', 1); SH.st('mood', 2); SH.advance(3, { interrupt: false }); log(SH.weatherDay && (SH.weatherDay(SH.day()).hi || 0) >= 75 ? 'You put sunscreen on your face and the back of your neck. You won\'t burn today.' : 'You rub in a little sunscreen. It smells like summer, even now.', ''); spend(id); return done(); }
    // hygiene
    if (id === 'x_tp') { uses(id, 8); SH.st('hyg', 6); SH.st('mood', 2); SH.advance(5, { interrupt: false }); log('Real toilet paper instead of gas-station napkins or leaves. Small dignity. Huge.', ''); spend(id); return done(); }
    if (id === 'x_pads') { uses(id, 8); SH.st('hyg', 10); SH.st('mood', 3); SH.st('stress', -2); SH.advance(5, { interrupt: false }); log('Sorted. One less thing to worry about.', ''); spend(id); return done(); }
    // camping
    if (id === 'x_stove') {
      const f = food(); if (!f.length) return SH.UI.toast('Nothing to cook. You need food in your bag.');
      if (SH.locIndoor()) return SH.UI.toast('Not indoors. Somewhere outside.');
      uses(id + '_fuel', 10); const fid = f[0], fi = ITEM(fid);
      AC.useItem(fid); SH.st('full', 6); SH.st('mood', 5); G().s.warmth = Math.min(100, G().s.warmth + 12); SH.advance(15, { interrupt: false });
      log(`You heat it on the camp stove${/ramen|cans|soup/.test(fid) ? ' until it steams' : ''}. Hot food, outside, with your hands around it. That's a whole different thing.`, 'good');
      const u = G().useLeft; if (--u[id + '_fuel'] <= 0) { delete u[id + '_fuel']; SH.rmBag(id); log('The little gas can sputters out. The stove is useless without another, and nobody sells those to a kid.', 'sys'); }
      return done();
    }
    if (id === 'x_filter') { if (!outdoorsWater()) return SH.UI.toast('No creek or pond here to drink from.'); SH.st('full', 4); SH.st('health', 2); SH.advance(5, { interrupt: false }); log('You lie on your stomach at the water and drink through the filter straw. Cold, a little earthy, totally fine.', ''); return done(); }
    if ((id === 'x_tarp' || id === 'x_rope') && SH.Shack && g.base && g.away === g.base.pid) {
      SH.rmBag(id); SH.Shack.add(id === 'x_tarp' ? 'tarp' : 'rope', id === 'x_tarp' ? 1 : 2);
      log(id === 'x_tarp' ? 'You add the tarp to your pile. A roof, maybe, or a wall against the wind.' : 'You add the paracord to your pile. Stronger than baling twine.', ''); return done();
    }
    // wearable: say what it's actually doing
    if (c && (c.warm || c.sleepWarm || c.rain || c.walk || c.disguise)) {
      const bits = [];
      if (c.warm) bits.push('keeping you warmer');
      if (c.sleepWarm) bits.push('keeping you warm when you sleep');
      if (c.rain && id !== 'x_tarp') bits.push('keeping the rain off');
      if (id === 'x_tarp') bits.push('keeping the rain off you at night');
      if (c.walk) bits.push('saving your feet');
      let t = bits.length ? `${it.n}: ${bits.join(', ')} while it's with you.` : `${it.n}.`;
      if (c.disguise) t += ' Put it to use in You & your group → Change your look.';
      return SH.UI.toast(t);
    }
    if (id === 'x_lantern' || id === 'flashlight') return SH.UI.toast(`${it.n}: nights outside feel less scary while it's with you.`);
    if (id === 'x_bugspray') { uses(id, 12); SH.st('mood', 2); SH.st('stress', -1); SH.advance(2, { interrupt: false }); log('You spray your ankles and neck. The mosquitoes reconsider.', ''); spend(id); return done(); }
    return bUse.apply(this, arguments);
  };
})(window.SH);
