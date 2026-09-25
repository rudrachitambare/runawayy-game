/* SMALL HOURS — living world: NPC routines, weather effects, discovery. */
(function (SH) {
  const U = SH.util;
  const W = SH.World = {};

  // deterministic per-(npc, day) noise so routines wobble but are stable within a day
  const h32 = (s) => { let h = 2166136261; for (const c of s) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); } return h >>> 0; };
  const noise = (npc, d, k = '') => (h32(npc + ':' + d + ':' + k + ':' + ((SH.G.story && SH.G.story.seed) || 0)) % 10000) / 10000;

  /* Routine blocks: [from, to, loc, activity, opts]
     opts: wk (weekdays only) / we (weekends only) / wet: [loc, act] (rain/storm replacement) / p (probability of that block happening today) */
  W.ROUTINES = {
    jordan: [
      [0, 7.5, 'jordan', 'asleep'], [7.5, 8, 'jordan', 'eating cereal over the sink'],
      [8, 15, 'school', 'in class, probably drawing in the margins', { wk: 1 }],
      [15.3, 18, 'park', 'skating the bowl', { wk: 1, wet: ['jordan', 'playing Skyforge'], p: 0.75 }],
      [15.3, 18, 'jordan', 'playing Skyforge', { wk: 1 }],
      [10, 13, 'jordan', 'sleeping in', { we: 1 }], [13, 17, 'mall', 'at the arcade in the mall', { we: 1, p: 0.6 }], [13, 17, 'park', 'skating', { we: 1, wet: ['mall', 'at the arcade in the mall'] }],
      [18, 21, 'jordan', 'eating tacos with his family'], [21, 23.5, 'jordan', 'on his phone in bed'], [23.5, 24, 'jordan', 'asleep'],
    ],
    okafor: [
      [7.3, 16.5, 'school', 'in Room 204', { wk: 1 }], [16.5, 18, 'library', 'returning a stack of books', { wk: 1, p: 0.3 }],
      [18.5, 19.5, 'diner', 'eating pie alone with a paperback', { wk: 1, p: 0.15 }],
      [10, 12, 'store', 'buying an absurd amount of seltzer', { we: 1, p: 0.25 }],
    ],
    patel: [
      [8, 10, 'patel', 'in her garden'], [10, 11, 'store', 'buying chai and one lottery ticket', { p: 0.4 }],
      [16, 17.2, 'park', 'walking Newton', { wet: ['patel', 'watching Newton sulk at the rain'] }], [17.2, 22, 'patel', 'on her porch'],
    ],
    tyler: [
      [8, 15, 'school', 'at school, loudly', { wk: 1 }], [15.3, 18, 'park', 'with his friends at the benches', { wk: 1, p: 0.6, wet: ['mall', 'loitering by the food court'] }],
      [12, 17, 'mall', 'loitering by the food court', { we: 1, p: 0.6 }],
    ],
    dolores: [[22, 24, 'diner', 'working the night shift'], [0, 6, 'diner', 'working the night shift']],
    wren: [[9, 17, 'library', 'reading in the back corner', { p: 0.7 }], [19, 24, 'underpass', 'by the wall', {}], [0, 8, 'underpass', 'asleep under a sleeping bag']],
    maya: [[8, 15, 'school', 'in class, first row', { wk: 1 }], [15.3, 17.5, 'library', 'doing homework with a color-coded binder', { wk: 1, p: 0.7 }]],
    lowe: [[8, 16, 'police', 'at the front desk'], [16, 20, 'store', 'getting coffee at QuikMart', { p: 0.25 }]],
  };
  W.PEOPLE = { jordan: 'Jordan', okafor: 'Ms. Okafor', patel: 'Mrs. Patel', tyler: 'Tyler', dolores: 'Dolores', wren: 'Wren', maya: 'Maya', lowe: 'Officer Lowe', mom: 'Mom', rick: 'Rick', lily: 'Lily' };
  W.TALKABLE = ['jordan', 'okafor', 'patel', 'tyler', 'dolores', 'wren', 'mom', 'rick', 'lily'];

  W.where = function (npc, t = SH.G.t) {
    const d = SH.day(t), h = SH.hour(t), wk = SH.isWeekday(t), wet = ['rain', 'storm'].includes(SH.weatherDay(d).c);
    if (npc === 'mom') { const w = SH.momWhere(t); return { loc: w === 'work' ? 'hospital' : 'home', act: w === 'work' ? 'on shift at St. Brigid\'s' : w === 'asleep' ? 'asleep' : 'home' }; }
    if (npc === 'rick') { const w = SH.rickWhere(t); return { loc: w === 'home' || w === 'asleep' ? 'home' : w === 'gone' ? null : 'store', act: w === 'asleep' ? 'asleep' : w === 'out' ? 'out (says "errands")' : 'on the couch' }; }
    if (npc === 'lily') { const w = SH.lilyWhere(t); return { loc: w === 'school' ? null : 'home', act: w }; }
    const R = W.ROUTINES[npc]; if (!R) return { loc: null, act: '' };
    const jit = (noise(npc, d, 'j') - 0.5) * 0.6; // ±18 min wobble
    for (let i = 0; i < R.length; i++) {
      const [a, b, loc, act, o = {}] = R[i];
      if (o.wk && !wk) continue; if (o.we && wk) continue;
      if (h < a + jit || h >= b + jit) continue;
      if (o.p != null && noise(npc, d, 'p' + i) > o.p) continue; // skipped today
      if (wet && o.wet) return { loc: o.wet[0], act: o.wet[1] };
      return { loc, act };
    }
    return { loc: null, act: '' };
  };
  W.present = function (loc = SH.G.loc) {
    return Object.keys(W.PEOPLE).filter((n) => { if (['mom', 'rick', 'lily'].includes(n)) return false; const w = W.where(n); return w.loc === loc && !/asleep/.test(w.act); });
  };
  W.isHere = (npc) => W.where(npc).loc === SH.G.loc;
  W.seeHere = function () {
    const G = SH.G; W.present().forEach((n) => { G.world.seen[n] = G.world.seen[n] || {}; G.world.seen[n][G.loc] = (G.world.seen[n][G.loc] || 0) + 1; });
  };

  /* ---------------- weather effects ---------------- */
  W.vis = function () { const c = SH.cond(); let v = { fog: 0.5, rain: 0.78, storm: 0.6 }[c] || 1; if (SH.isDark()) v *= 0.85; return v; };
  W.wet = () => ['rain', 'storm'].includes(SH.cond());
  const baseTO = SH.travelOptions;
  SH.travelOptions = function (to) {
    const out = baseTO(to), c = SH.cond(), G = SH.G;
    out.forEach((o) => {
      if (o.mode === 'walk' || o.mode === 'bike') {
        const k = c === 'storm' ? 1.5 : c === 'rain' ? 1.2 : c === 'fog' ? 1.1 : 1;
        if (k > 1) { o.mins = Math.round(o.mins * k / 5) * 5; o.note = (o.note ? o.note + ' · ' : '') + (c === 'fog' ? 'slow going in the fog' : SH.has('umbrella') ? 'wet, but you have an umbrella' : 'you\'ll get soaked'); o.wet = !SH.has('umbrella'); }
        if (o.mode === 'bike' && c === 'storm') o.note = 'biking in a storm is a bad idea';
      }
      if (o.mode === 'bus' && (c === 'storm' || c === 'rain') && noise('bus', SH.day(), String(Math.floor(G.t / 30))) < 0.35) { o.mins += 15; o.note = (o.note || '') + ' · running late (weather)'; }
    });
    return out;
  };
  const baseTravel = SH.travel;
  SH.travel = function (to, o) {
    const G = SH.G, from = G.loc;
    const r = baseTravel(to, o);
    if (o && o.wet && G.loc === to) { SH.st('warmth', -10); SH.st('hyg', -4); SH.st('mood', -3); if (U.chance(0.35)) SH.UI.log(U.pick(['Your socks are soaked through. There is no worse feeling. You have checked.', 'Rain runs down the back of your neck the whole way.', 'A car hits a puddle right next to you. Of course it does.']), 'sys'); }
    W.passBy(from, to);
    W.seeHere();
    return r;
  };

  /* ---------------- discovery ---------------- */
  W.START_KNOWN = ['home', 'patel', 'jordan', 'school', 'store', 'library', 'park', 'police', 'mall', 'hospital', 'diner', 'bus'];
  W.known = (id) => { const G = SH.G; return !G.world || G.world.discovered[id] !== undefined ? true : W.START_KNOWN.includes(id); };
  W.discover = function (id, quiet) {
    const G = SH.G; if (!SH.LOC[id] || G.world.discovered[id]) return;
    G.world.discovered[id] = G.t;
    if (!quiet) { SH.UI.toast('📍 New place: ' + SH.LOC[id].name); }
  };
  W.passBy = function (from, to) {
    const A = SH.LOC[from], B = SH.LOC[to]; if (!A || !B) return;
    W.discover(to, true);
    for (const id in SH.LOC) {
      if (W.known(id) || SH.LOC[id].hidden) continue; const P = SH.LOC[id];
      const dx = B.x - A.x, dy = B.y - A.y, L2 = dx * dx + dy * dy || 1; const t = U.clamp(((P.x - A.x) * dx + (P.y - A.y) * dy) / L2, 0, 1);
      const d = Math.hypot(A.x + t * dx - P.x, A.y + t * dy - P.y);
      if (d < 85) { W.discover(id); SH.UI.log({ laundromat: 'On the way you pass a laundromat with its lights on. Suds & Duds. A sign says OPEN 24 HOURS. The dryers look warm.', underpass: 'You cut under the Route 9 bridge. It\'s dry under there, and someone has left a folded sleeping bag against the wall.', trainyard: 'Past the fence: the old rail yard. Rusted boxcars, weeds, a hole in the chain-link somebody made on purpose.' }[id] || ('You notice ' + P.name + '.'), 'sys'); }
    }
  };

  /* ---------------- people you can talk to in person ---------------- */
  W.talkActions = function () {
    const G = SH.G, out = [];
    W.present().forEach((n) => {
      if (!W.TALKABLE.includes(n) || !SH.Brain[n]) return;
      const w = W.where(n);
      out.push({ label: 'Talk to ' + W.PEOPLE[n], sub: w.act, cls: G.phase === 'run' && ['jordan', 'okafor', 'patel', 'tyler'].includes(n) ? 'hot' : '', fn: () => {
        if (G.phase === 'run' && ['jordan', 'okafor', 'patel', 'tyler', 'maya'].includes(n)) { G.heat = Math.min(100, G.heat + 15); G.revealed = G.loc; }
        SH.Talk.open(n, { ctx: G.phase === 'run' ? 'run' : 'meet', turnsMax: 8 });
      } });
    });
    return out;
  };
  W.presenceLine = function () {
    const p = W.present(); if (!p.length) return '';
    return 'Here: ' + p.map((n) => W.PEOPLE[n] + ' (' + W.where(n).act + ')').join(', ');
  };
})(window.SH);
