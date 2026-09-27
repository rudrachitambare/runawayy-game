/* SMALL HOURS — build a shack out past the edge of a village (turn 39).
   In villages (and small towns), the edge of town has stuff lying around: fallen branches, logs, creek stones.
   Gather them (slow, tiring, rain makes it slower, never impossible), buy what you can't find from the farm down
   the county road (old barn boards, straw, twine, a sheet of roofing tin, nails) or the hardware shelf at the gas
   station on the main road, or work for the farmer and get paid in boards and straw. Then build, part by part:
   a log frame, woven-branch walls, a roof, a straw bed, a stone fire ring, a plank door, stone footing.
   The shack IS your base (G.base, type 'camp', shack:true): it sleeps like the forest camp, its parts count as
   upgrades (warmth, dry, hidden, safe…), and the endings treat it as the campsite. One base at a time.
   Resources live in a pile at that town (G.res[pid]); you don't carry logs around in a backpack. */
(function (SH) {
  const TW = SH.Town, A = SH.Atlas, K = SH.K, B = SH.Bases; if (!TW || !TW.KIND || !A || !K || !B) return;
  const G = () => SH.G, pick = (a) => a[Math.floor(Math.random() * a.length)], log = (t, c) => SH.UI.log(t, c || '');
  const done = () => SH.UI.afterAction();
  const act = (label, sub, fn, o) => Object.assign({ label, sub, fn }, o || {});
  const ok = (p) => p && (p.tier === 'village' || p.tier === 'small');
  const NAMES = { branch: ['branch', 'branches'], log: ['log', 'logs'], stone: ['stone', 'stones'], plank: ['board', 'boards'], straw: ['straw bale', 'straw bales'], rope: ['coil of twine', 'coils of twine'], tin: ['sheet of roofing tin', 'sheets of roofing tin'], nail: ['can of nails', 'cans of nails'], tarp: ['tarp', 'tarps'] };
  const nm = (k, n) => `${n} ${NAMES[k][n === 1 ? 0 : 1]}`;
  const pile = (pid) => { const g = G(); g.res = g.res || {}; return (g.res[pid || g.away] = g.res[pid || g.away] || {}); };
  const add = (k, n) => { const r = pile(); r[k] = (r[k] || 0) + n; };
  const have = (need) => { const r = pile(); return Object.entries(need).every(([k, n]) => (r[k] || 0) >= n); };
  const take = (need) => { const r = pile(); Object.entries(need).forEach(([k, n]) => { r[k] -= n; }); };
  const pileTxt = () => { const r = pile(), L = Object.keys(NAMES).filter((k) => r[k] > 0).map((k) => nm(k, r[k])); return L.length ? L.join(', ') : 'nothing yet'; };
  const biome = (p) => TW.biome ? TW.biome(p.biome) : 'forest';
  const rainy = () => (SH.raining && SH.raining()) || false;
  const day = () => SH.day();

  /* ---------- the shack's parts: they are base upgrades, so warmth/dry/hidden/safe all work through bases.js ---------- */
  const PARTS = [
    { id: 'sh_frame', n: 'Log frame', mins: 120, need: [{ log: 2, branch: 6 }], d: 'Two logs dragged into an A, branches lashed across. It already looks like something.', fx: {} },
    { id: 'sh_walls', n: 'Woven branch walls', mins: 180, need: [{ branch: 16 }, { plank: 6, branch: 6 }], d: 'Branches woven through the frame, gaps stuffed with leaves. The wind has to try now.', fx: { warm: 1, hide: 1 }, after: 'sh_frame' },
    { id: 'sh_roof', n: 'A real roof', mins: 120, need: [{ tin: 1 }, { tarp: 1 }, { plank: 8, straw: 1 }], d: 'Rain on the roof sounds different when you\'re under it and dry.', fx: { dry: 1 }, after: 'sh_frame' },
    { id: 'sh_bed', n: 'Straw and pine-bough bed', mins: 60, need: [{ straw: 2 }, { branch: 12 }], d: 'It crackles when you move and smells like a barn. Best bed you\'ve had in days.', fx: { rest: 1, warm: 1 }, after: 'sh_frame' },
    { id: 'sh_fire', n: 'Stone fire ring', mins: 60, need: [{ stone: 10 }], d: 'A circle of creek stones in front of the door. Small fires only. You learn fast what smokes and what doesn\'t.', fx: { warm: 1, mood: 1 }, after: 'sh_frame' },
    { id: 'sh_door', n: 'Plank door with a twine latch', mins: 90, need: [{ plank: 4, rope: 1, nail: 1 }], d: 'It closes. It latches. From the inside.', fx: { safe: 1 }, after: 'sh_walls' },
    { id: 'sh_footing', n: 'Stone footing, gaps packed with mud', mins: 150, need: [{ stone: 16 }], d: 'No more drafts along the floor, and nothing with four legs gets in underneath.', fx: { warm: 1, critter: 1 }, after: 'sh_walls' },
  ];
  PARTS.forEach((pt) => { if (!B.UPS.find((u) => u[0] === pt.id)) B.UPS.push([pt.id, pt.n, ['__shack'], pt.d, pt.fx]); });
  // keep the shack's parts out of the base "Fix it up" (store items) list
  const bD = K.D, SHN = new Set(PARTS.map((p) => p.n));
  K.D = function (title, text, choices, who) { if (title === 'Fix it up' && Array.isArray(choices)) choices = choices.filter((c) => !SHN.has(String(c.t).replace(/ ✓$/, ''))); return bD.call(this, title, text, choices, who); };
  // bases.js "Fix it up" for a shack: everything there still works (lantern, curtains…) on top of the shack parts

  const needTxt = (need) => need.map((o) => Object.entries(o).map(([k, n]) => nm(k, n)).join(' + ')).join('  OR  ');
  const firstHave = (pt) => pt.need.find(have);

  /* ---------- gathering at the edge of town ---------- */
  const SPOT = { forest: ['in the woods past the last fence', 'under the pines'], fields: ['along the windbreak at the edge of the fields', 'in the shelterbelt trees'], coast: ['in the scrub behind the dunes', 'along the high-tide line'], hills: ['on the wooded slope above town', 'down in the draw'], lake: ['in the trees along the shore', 'past the boat ramp'], river: ['in the river bottoms', 'along the cutbank'] };
  const STONES = { forest: 'the creek bed', fields: 'the rock pile at the corner of a field, where farmers dump what the plow turns up', coast: 'the beach', hills: 'a dry wash', lake: 'the shoreline', river: 'a gravel bar' };
  function gather(kind, p) {
    const g = G(), b = biome(p), slow = rainy() ? 1.5 : 1, st = TW.st ? TW.st() : (g.twx = g.twx || {});
    const lim = (g._resDay = g._resDay || {}); const key = p.id + ':' + day(); lim[key] = lim[key] || { log: 0 };
    if (kind === 'branch') { if (TW.time(Math.round(40 * slow), 0.02, { exert: 1.5 })) return; const n = 4 + Math.floor(Math.random() * 4); add('branch', n); SH.st('energy', -6); SH.st('hyg', -3);
      log(`You pick up fallen branches ${pick(SPOT[b] || SPOT.forest)}. ${n} good ones, straight enough, dry enough${rainy() ? '. Well, not dry. Nothing is dry today. It takes forever' : ''}. Your hands are scratched and sticky with sap.`, ''); }
    if (kind === 'log') {
      if (lim[key].log >= 2) { log('You look for another log you can actually move. Everything left is either rotten through or the size of a car. Tomorrow.', 'sys'); return done(); }
      if (TW.time(Math.round(60 * slow), 0.03, { exert: 2.5 })) return; lim[key].log++; add('log', 1); SH.st('energy', -12); SH.st('hyg', -4);
      log(pick(['You find a fallen log about as long as you are tall and drag it, a few feet at a time, to your pile. You have to sit down twice.', 'A dead tree came down in some storm. You roll one piece of it end over end back to your spot. Your arms are shaking by the end.']), ''); }
    if (kind === 'stone') { if (TW.time(Math.round(40 * slow), 0.02, { exert: 1.8 })) return; const n = 5 + Math.floor(Math.random() * 5); add('stone', n); SH.st('energy', -8);
      log(`You carry stones up from ${STONES[b] || STONES.forest}, two at a time, like eggs. ${n} of them. The pile looks bigger than it feels.`, ''); }
    log(`Your pile: ${pileTxt()}.`, 'sys'); done();
  }

  /* ---------- the farm down the county road ---------- */
  const FARMERS = [['Mr. Albers', 'he'], ['Mrs. Hendricks', 'she'], ['Mr. Voss', 'he'], ['Mrs. Kowalski', 'she'], ['Mr. Dietz', 'he'], ['Mrs. Brandt', 'she']];
  const farmer = (p) => FARMERS[(p.id.length * 7 + p.name.charCodeAt(0)) % FARMERS.length];
  const FARM = (p) => { const f = farmer(p); return { n: f[0], g: f[1], place: `the ${f[0].replace(/^(Mr|Mrs)\. /, '')} place` }; };
  function farm(p) {
    const g = G(), F = FARM(p), h = SH.hour(), st = (g._farm = g._farm || {}), me = (st[p.id] = st[p.id] || { met: 0, work: -1 });
    if (h < 7 || h >= 19) { log(`The ${F.place} is dark except for the yard light. A dog barks once, like a warning. Come back in daylight.`, 'sys'); return done(); }
    const first = !me.met; me.met = 1;
    const buy = (k, n, price, line) => ({ t: `Buy ${nm(k, n)}: $${price}`, sub: line, fn: () => { if (!TW.pay(price, `${F.n}: ${nm(k, n)}`)) return farm(p); add(k, n); if (TW.time(5, 0)) return; log(`${F.n} ${pick(['takes your money and doesn\'t count it.', 'folds the bills into a shirt pocket.', 'says "don\'t hurt yourself" and means it.'])} Your pile: ${pileTxt()}.`, 'good'); farm(p); } });
    const work = (label, mins, cash, goods, line) => ({ t: label, sub: me.work === day() ? 'Already worked today. Come back tomorrow.' : `${Math.round(mins / 60 * 10) / 10}h · $${cash}, or ${Object.entries(goods).map(([k, n]) => nm(k, n)).join(' + ')}`, fn: () => {
      if (me.work === day()) { log(`"You did plenty today," ${F.n} says. "Go on."`, 'sys'); return farm(p); }
      SH.UI.dialog({ title: F.place, text: [line, 'How do you want to be paid?'], choices: [
        { t: `Cash: $${cash}`, fn: () => { me.work = day(); if (TW.time(mins, 0.02, { exert: 2 })) return; SH.money(cash); SH.st('energy', -20); SH.st('hyg', -10); SH.st('full', -10); log(`${F.n} pays you $${cash} in fives and ones, and a glass of water from the hose.`, 'good'); done(); } },
        { t: `In stuff: ${Object.entries(goods).map(([k, n]) => nm(k, n)).join(' + ')}`, fn: () => { me.work = day(); if (TW.time(mins, 0.02, { exert: 2 })) return; Object.entries(goods).forEach(([k, n]) => add(k, n)); SH.st('energy', -20); SH.st('hyg', -10); SH.st('full', -10); log(`"Take it, it's just sitting there rotting," ${F.n} says, and helps you load it into a wheelbarrow you promise to bring back. You do. Your pile: ${pileTxt()}.`, 'good'); done(); } },
        { t: 'Never mind', fn: () => farm(p) }] });
    } });
    const hi = first ? [`${F.n} is in the yard with a bucket, and looks at you a long second. "Whose kid are you?"`, pick([`You say you're staying with family in town. ${F.g === 'she' ? 'She' : 'He'} nods like that's an answer. Out here people let you have your business.`, `"Visiting," you say. "Mm," ${F.n} says, and goes back to the bucket. "Well. You look like you could use something to do."`])] : [pick([`${F.n} lifts a hand without looking up. "Back again."`, `${F.n} is fixing a fence. "Help yourself to the hose if you're thirsty."`])];
    if (first) TW.notice(0.02);
    SH.UI.dialog({ title: F.place, text: hi.concat([`Your pile back in the trees: ${pileTxt()}.`]), choices: [
      buy('plank', 4, 4, 'Old barn boards, grey and a little warped. Nails already pulled.'), buy('straw', 1, 4, 'A bale of straw. Heavier than it looks.'), buy('rope', 1, 2, 'Orange baling twine. Farmers have miles of it.'),
      buy('tin', 1, 6, 'A sheet of old roofing tin off the shed. A little rusty. Rain doesn\'t care.'), buy('nail', 1, 2, 'A coffee can of bent-but-fine nails.'),
      work('Work: stack hay bales in the loft', 120, 10, { plank: 6, straw: 1 }, `"Bales go up, stacked tight, don't fall out of the loft." It's hot and itchy and you're sneezing the whole time.`),
      work('Work: muck out the stalls', 90, 8, { straw: 2, rope: 1 }, `"Shovel, wheelbarrow, pile out back. Don't let the goat eat your shoelaces." The goat tries anyway.`),
      { t: 'Back', fn: done }] });
  }

  /* ---------- the main road: hardware shelf at the gas station, and the FREE pile ---------- */
  function shelf(a) {
    [['tarp', 1, 8, 'Blue tarp. The universal answer.'], ['rope', 1, 3, 'Nylon rope, 50 ft.'], ['nail', 1, 3, 'Box of nails.']].forEach(([k, n, price, d]) => a.push(act(`Buy ${nm(k, n)}: $${price}`, d + ' Goes to your pile.', () => { if (!TW.pay(price, nm(k, n))) return; add(k, n); if (TW.time(5, 0.03)) return; log(`The clerk rings it up without a word. Your pile: ${pileTxt()}.`, ''); done(); })));
  }
  function freePile(p) {
    const g = G(), k = 'free' + p.id + ':' + day(); g._resDay = g._resDay || {};
    if (g._resDay[k]) { log('The FREE pile is the same as this morning: a broken lamp and a box of National Geographics.', 'sys'); return done(); }
    g._resDay[k] = 1; if (TW.time(15, 0.03)) return;
    const r = Math.random();
    if (r < 0.35) { const n = 2 + Math.floor(Math.random() * 4); add('plank', n); log(`At the end of a driveway on the main road, a hand-lettered FREE sign on a pile of lumber from somebody's old deck. You take ${nm('plank', n)}. Your pile: ${pileTxt()}.`, 'good'); }
    else if (r < 0.5) { add('tin', 1); log(`A FREE pile by a mailbox on the main road: a sheet of roofing tin, somebody's old shed roof. You carry it on your head like a very loud hat. Your pile: ${pileTxt()}.`, 'good'); }
    else if (r < 0.62) { add('tarp', 1); log('FREE: a folded tarp with one hole in it. You can work with one hole.', 'good'); }
    else log(pick(['The FREE pile at the end of a driveway: a recliner, a box of cassette tapes, a single ski. Nothing you can build with.', 'No FREE pile today. Just mailboxes and the sound of the highway.']), 'sys');
    done();
  }

  /* ---------- building ---------- */
  function buildMenu(p) {
    const g = G(), b = g.base;
    if (b && b.pid !== p.id) return SH.UI.dialog({ title: 'You already have a base', text: [`Your ${B.TYPES[b.type].n.toLowerCase()} is in ${A.data().places.find((x) => x.id === b.pid).name}. One base at a time. (You can abandon it from there.)`], choices: [{ t: 'Okay', fn: done }] });
    if (b && b.type !== 'camp') return SH.UI.dialog({ title: 'You already have a base here', text: [`You've got the ${B.TYPES[b.type].n.toLowerCase()}. A shack would be a second base. (Abandon the ${B.TYPES[b.type].n.toLowerCase()} first if you'd rather build.)`], choices: [{ t: 'Okay', fn: done }] });
    const up = b ? b.up : [];
    const rows = PARTS.filter((pt) => !up.includes(pt.id)).map((pt) => {
      const blocked = pt.after && !up.includes(pt.after), o = firstHave(pt);
      return { t: `${pt.n}${o && !blocked ? ' ✓' : ''}`, sub: blocked ? `First: ${PARTS.find((x) => x.id === pt.after).n.toLowerCase()}` : `${Math.round(pt.mins / 60 * 10) / 10}h · needs ${needTxt(pt.need)}`, fn: () => build(p, pt) };
    });
    const built = PARTS.filter((pt) => up.includes(pt.id)).map((pt) => pt.n.toLowerCase());
    SH.UI.dialog({ title: b ? '🛖 Your shack' : '🛖 Build a shack', text: [b ? (built.length ? `So far: ${built.join(', ')}.` : 'A cleared spot and a plan.') : `There's a flat spot ${pick(SPOT[biome(p)] || SPOT.forest)}, out of sight of the road. You could build something here. Something that's yours.`, `Your pile: ${pileTxt()}.`, rows.length ? 'Gather branches, logs and stones out here. Buy boards, straw, twine and tin from the farm down the road or the gas station.' : 'It\'s done. It\'s a real shack. You built it.'], choices: rows.concat(b ? [{ t: SH.hour() >= 20 || SH.hour() < 6 ? 'Sleep in your shack' : 'Rest in your shack (2h)', cls: 'safe', fn: () => B.sleep(p) }] : [], [{ t: 'Back', fn: done }]) });
  }
  function build(p, pt) {
    const g = G(); let b = g.base; const up = b ? b.up : [];
    if (pt.after && !up.includes(pt.after)) { log(`You need the ${PARTS.find((x) => x.id === pt.after).n.toLowerCase()} first.`, 'sys'); return buildMenu(p); }
    const o = firstHave(pt); if (!o) { SH.UI.toast(`Needs ${needTxt(pt.need)}. You have: ${pileTxt()}.`); return buildMenu(p); }
    if (SH.isDark()) { log('You try, in the dark. You drop a log on your foot. Build in daylight.', 'sys'); return done(); }
    take(o);
    if (!b) { b = g.base = { type: 'camp', shack: true, pid: p.id, up: [], day: day(), nights: 0 }; log(`You have a base: a shack you're building outside ${p.name}.`, 'good'); }
    b.shack = true;
    if (TW.time(Math.round(pt.mins * (rainy() ? 1.3 : 1)), 0.02, { exert: 2 })) return;
    b.up.push(pt.id); SH.st('energy', -Math.round(pt.mins / 8)); SH.st('hyg', -8); SH.st('mood', 6); SH.st('stress', -6); SH.flag('builtShack');
    log(`${pt.n}: done. ${pt.d}`, 'good');
    const left = PARTS.filter((x) => !b.up.includes(x.id)).length;
    if (!left) log('You stand back and look at it. Walls, roof, a door that latches, a fire ring, a bed. Nobody gave you this. You made it out of a forest and some farmer\'s leftover boards.', 'good');
    done();
  }

  /* ---------- where it all shows up ---------- */
  const bEdge = TW.KIND.edge;
  TW.KIND.edge = function (a, L, T, p, c) {
    bEdge.apply(this, arguments);
    if (!ok(p)) return;
    const g = G(), b = g.base, mine = b && b.pid === p.id && b.shack;
    if (!c.dark) {
      a.push(act('Gather fallen branches', `${rainy() ? '1 hour (rain)' : '40 min'} · for building`, () => gather('branch', p)));
      a.push(act('Drag a fallen log to your spot', `${rainy() ? '1.5 hours (rain)' : '1 hour'} · heavy`, () => gather('log', p)));
      a.push(act('Carry stones up from ' + ({ forest: 'the creek', fields: 'the rock pile', coast: 'the beach', hills: 'the wash', lake: 'the shore', river: 'the gravel bar' }[biome(p)] || 'the creek'), `${rainy() ? '1 hour (rain)' : '40 min'} · for a fire ring, footing`, () => gather('stone', p)));
      a.push(act(`Walk out to ${FARM(p).place}`, '20 min down the county road · boards, straw, tin, work', () => { if (TW.time(20, 0)) return; farm(p); }));
    }
    a.push(act(mine ? '🛖 Your shack' : '🛖 Build a shack', mine ? `${b.up.filter((u) => /^sh_/.test(u)).length}/${PARTS.length} parts · your pile: ${pileTxt()}` : `Your pile: ${pileTxt()}`, () => buildMenu(p), { cls: mine ? 'safe' : '' }));
    if (mine && c.dark) a.push(act('Sleep in your shack', 'Your own four walls, more or less', () => B.sleep(p), { cls: 'safe' }));
  };
  const bGas = TW.KIND.gas, bMain = TW.KIND.main;
  if (bGas) TW.KIND.gas = function (a, L, T, p, c) { bGas.apply(this, arguments); if (ok(p) && c.open) shelf(a); };
  if (bMain) TW.KIND.main = function (a, L, T, p, c) { bMain.apply(this, arguments); if (ok(p) && !c.dark) a.push(act('Check the FREE pile on the main road', '15 min · people leave lumber out sometimes', () => freePile(p))); };

  SH.Shack = { PARTS, pile, add, gather, farm, build, buildMenu };
})(window.SH);
