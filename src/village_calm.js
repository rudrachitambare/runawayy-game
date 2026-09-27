/* SMALL HOURS — villages don't care (turn 43). User rule: nobody in a village cares about a runaway kid.
   In a village: people never "notice" you (awayNotice doesn't grow), no patrol car stops you, and nothing drags you
   home: the police/poster/tracked/heat "found" endings are cancelled while you're in a village. Turn 44: not even a
   deputy you call yourself comes out here (dialing 911 in a village gets you nowhere).
   Also: soap, deodorant and the toothbrush work anywhere now, and eating says how it felt. */
(function (SH) {
  const A = SH.Atlas, EN = SH.Endings; if (!A || !EN) return;
  const G = () => SH.G;
  // some code clears g.away just before calling found(); fall back to the town the current location belongs to (t_<pid>_<kind>)
  const inVillage = () => {
    const g = G(); if (!g) return false;
    let p = g.away && A.here ? A.here() : null;
    if (!p) { const m = /^t_(p\d+)_/.exec(g.loc || '') || (g._lastVillage && g.loc === g._lastVillageLoc ? [0, g._lastVillage] : null); if (m && A.data) p = A.data().places.find((x) => x.id === m[1]); }
    return !!(p && p.tier === 'village');
  };
  SH.inVillage = inVillage;

  /* nobody notices you */
  const bNot = A.noticed;
  A.noticed = function (p) { if (p && p.tier === 'village') return false; return bNot.apply(this, arguments); };
  if (SH.Town && SH.Town.notice) { const bTN = SH.Town.notice; SH.Town.notice = function () { if (inVillage()) return false; return bTN.apply(this, arguments); }; }
  // arriving in a village: whatever notice you brought from the last town doesn't follow you here
  const bArr = A.arrive;
  if (bArr) A.arrive = function () { const r = bArr.apply(this, arguments); try { if (inVillage()) G().awayNotice = 0; } catch (e) {} return r; };

  /* no patrol stops */
  if (SH.Police && SH.Police.stop) { const bStop = SH.Police.stop; SH.Police.stop = function (p, ctx, then) { if ((p && p.tier === 'village') || inVillage()) { return then ? then({ result: 'ok' }) : (SH.K && SH.K.back ? SH.K.back() : null); } return bStop.apply(this, arguments); }; }

  /* nothing drags you home from a village. Only what YOU choose. */
  // turn 44: no police or deputy ever comes to a village, not even if you call them yourself.
  // Only endings that don't involve police can happen there.
  const CHOSEN = new Set(['harbor', 'grandma', 'cedarLost']);
  const bFound = EN.found;
  EN.found = function (reason) {
    const g = G(); if (g) g._vol = 0;
    if (g && reason === 'exhausted' && inVillage()) {
      if (SH.Events && SH.Events.Q) SH.Events.Q = SH.Events.Q.filter((e) => e.id !== 'longRun');
      SH.UI.log('You don\'t really remember sitting down. Somebody\'s grandmother finds you on her porch step, clicks her tongue, and brings out soup and a blanket without asking a single question. She doesn\'t ask your name. She doesn\'t call anyone. Nobody out here ever does.', 'good');
      SH.st('full', 40); SH.st('energy', 30); SH.st('health', 15); SH.st('warmth', 20);
      return;
    }
    if (g && !CHOSEN.has(reason) && inVillage()) { console.info('village: found(' + reason + ') cancelled'); if (SH.Events && SH.Events.Q) SH.Events.Q = SH.Events.Q.filter((e) => e.id !== 'found'); restore(); return; }
    return bFound.apply(this, arguments);
  };
  // if something cleared g.away on the way to a (cancelled) found, put you back where you were and redraw
  function restore() {
    const g = G(); if (!g || g.ended) return;
    if (!g.away) { const m = /^t_(p\d+)_/.exec(g.loc || ''); if (m) g.away = m[1]; }
    setTimeout(() => { try { if (!SH.UI.modalOpen()) SH.UI.afterAction(); } catch (e) {} }, 60);
  }
  /* catch-all: no police scene of any kind opens in a village */
  const COP = /police|officer|deputy|sheriff|cruiser|patrol car|squad car/i;
  const bDlg = SH.UI.dialog;
  SH.UI.dialog = function (o) {
    try { if (o && inVillage() && (o.title === 'Found' || o.who === 'officer' || o.who === 'cop')) { console.info('village: police dialog blocked', o.title); restore(); return; } } catch (e) {}
    return bDlg.apply(this, arguments);
  };
  if (SH.Talk && SH.Talk.open) { const bT = SH.Talk.open; SH.Talk.open = function (npc) { if ((npc === 'officer' || npc === 'cop') && inVillage()) { console.info('village: police talk blocked'); restore(); return; } return bT.apply(this, arguments); }; }
  if (SH.EndX && SH.EndX.render) {
    const OKX = /^(later|gone|farm|fever|shack|village|tale)/;
    const bR = SH.EndX.render;
    SH.EndX.render = function (d, c) {
      try { const g = G(); if (inVillage() && !g._tripTo && !OKX.test(d.k || '') && !OKX.test((d.on || [])[0] || '')) { const t = [].concat(d.x(c) || []).join(' '); if (COP.test(t)) { console.info('village: police ending blocked', d.k); if (/exhaust/.test(d.k || '')) { (g.hp = g.hp || {}).debt = 0; SH.UI.log('You don\'t really remember sitting down. Somebody\'s grandmother finds you asleep on her porch step and puts you on her couch under three quilts. You sleep fourteen hours. She doesn\'t ask your name. Nobody out here ever does.', 'good'); SH.st('energy', 60); SH.st('full', 30); SH.st('health', 10); } restore(); return; } } } catch (e) {}
      return bR.apply(this, arguments);
    };
  }
  // queued "found" events (heat checks, phone tracking) are dropped while you're in a village
  if (SH.Events && SH.Events.queue) { const bQ = SH.Events.queue; SH.Events.queue = function (e) { if (e && e.id === 'found' && inVillage()) return; return bQ.apply(this, arguments); }; }

  /* ---------- items that did nothing ---------- */
  const AC = SH.Actions; if (!AC || !AC.useItem) return;
  const log = (t, c) => SH.UI.log(t, c || ''), done = () => SH.UI.afterAction();
  const pick = (a) => a[Math.floor(Math.random() * a.length)];
  const water = () => { const L = SH.LOC[G().loc] || {}; return SH.locIndoor() ? 'sink' : SH.has('water') || SH.has('x_water') ? 'bottle' : /edge|park/.test(G().loc || '') || (G().base && G().away === G().base.pid) ? 'creek' : 'bottle'; };
  const feel = (k) => { const v = G().s[k]; return k === 'full' ? (v >= 85 ? 'You\'re stuffed.' : v >= 60 ? 'You\'re full.' : v >= 35 ? 'Better. Still a little hungry.' : 'It barely touches the hunger.') : (v >= 80 ? 'You feel clean. Actually clean.' : v >= 55 ? 'You feel a lot less gross.' : 'Better than nothing.'); };
  const bUse = AC.useItem;
  AC.useItem = function (id) {
    const g = G(), it = SH.ITEMS[id]; if (!it || SH.UI.modalOpen()) return bUse.apply(this, arguments);
    // hygiene items (soap, deodorant, wipes…): usable anywhere, several uses each
    if (it.hygiene && !it.food) {
      g.useLeft = g.useLeft || {}; if (g.useLeft[id] == null) g.useLeft[id] = /soap/.test(id) ? 6 : 8;
      const w = water(); SH.advance(/soap/.test(id) ? 15 : 3, { interrupt: false });
      SH.st('hyg', it.hygiene * 2.5); SH.st('mood', 2);
      log(/soap/.test(id) ? { sink: 'You scrub up at the sink with your own bar of soap, face, neck, arms, behind the ears like somebody used to make you.', bottle: 'You wash with soap and half a water bottle, bent over so it doesn\'t go down your shirt. It mostly doesn\'t.', creek: 'You wash in the creek with your bar of soap. The water is so cold it makes you gasp, and then you feel brand new.' }[w] + ' ' + feel('hyg') : `${it.n}. ${feel('hyg')}`, 'good');
      if (--g.useLeft[id] <= 0) { SH.rmBag(id); delete g.useLeft[id]; log(`That's the last of the ${it.n.toLowerCase()}.`, 'sys'); }
      return done();
    }
    // toothbrush: any water will do
    if (id === 'toothbrush') {
      const w = water(); SH.advance(5, { interrupt: false }); SH.st('hyg', 8); SH.st('mood', 2);
      log({ sink: 'You brush your teeth at the sink. Minty. Human.', bottle: 'You brush your teeth with a swig from your water bottle and spit into the weeds. Minty. Human.', creek: 'You brush your teeth with creek water and spit into the ferns. Minty. Human.' }[w], '');
      return done();
    }
    // food: catalog food counts properly (multi-use packs, a real meal's worth), and you hear how it felt
    if (it.food && !it.reusable) {
      const f0 = g.s.full; g.useLeft = g.useLeft || {}; const uses = it.uses || 1; if (g.useLeft[id] == null) g.useLeft[id] = uses;
      SH.st('full', Math.round(it.food * (/^x_/.test(id) ? 1.6 : 1.2))); SH.st('mood', 2); g.stats && g.stats.meals++;
      SH.advance(8, { interrupt: false });
      if (--g.useLeft[id] <= 0) { SH.rmBag(id); delete g.useLeft[id]; }
      log(`You eat ${uses > 1 ? 'some of ' : ''}the ${it.n.toLowerCase()}${g.useLeft[id] ? ` (${g.useLeft[id]} more servings)` : ''}. ${g.s.full > f0 ? feel('full') : 'You\'re too full to enjoy it.'}`, '');
      return done();
    }
    return bUse.apply(this, arguments);
  };
})(window.SH);
