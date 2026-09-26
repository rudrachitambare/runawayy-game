/* SMALL HOURS — Part 5c: a base. One at a time (G.base).
   Forest camp (villages / small towns, or anywhere near woods), abandoned building (towns / cities), old barn (farm country).
   Renovate with real stuff from stores: each upgrade makes nights warmer, safer, or less likely to be found.
   Nightly threats when you sleep there: raccoons, storms, cold, teenagers, the owner or a ranger. */
(function (SH) {
  const K = SH.K, A = SH.Atlas, C = SH.Catalog; if (!K || !A) return;
  const G = K.G;
  const TYPES = {
    camp: { n: 'Forest camp', i: '🏕️', d: 'A clearing a quarter-mile off the trail, ringed by pines. Flat ground, a fallen log for a bench.' },
    building: { n: 'Abandoned building', i: '🏚️', d: 'An old laundromat with boarded windows and a back door that doesn\'t lock. Dusty, dry, and nobody\'s been here in years.' },
    barn: { n: 'Old barn', i: '🛖', d: 'A hayloft in a barn nobody uses anymore. It smells like summer and mice. The farmhouse is a long way off.' },
  };
  const UPS = [
    ['tarp', 'Tarp roof', ['tarp'], 'Keeps the rain off', { dry: 1 }], ['tent', 'Tent', ['tent1', 'tent4'], 'Walls, sort of', { dry: 1, warm: 1 }],
    ['bed', 'Real bedding', ['sleepbag', 'mattress', 'mat', 'blanket2'], 'Sleep that actually counts', { warm: 1, rest: 1 }], ['light', 'Lantern', ['lantern'], 'Nights less scary', { mood: 1 }],
    ['lock', 'Padlock + doorstop', ['padlock', 'doorstop'], 'Nobody wanders in', { safe: 1 }], ['cover', 'Curtains / boarded windows', ['curtain', 'plywood'], 'No light shows outside', { hide: 1 }],
    ['heat', 'Heater (+ power)', ['heater'], 'Winter-proof', { warm: 2 }], ['clean', 'Clean it up', ['broom', 'trash'], 'Less gross, fewer critters', { mood: 1, critter: 1 }],
    ['food', 'Critter-proof food bucket', ['bucket'], 'Raccoons hate this one trick', { critter: 1 }], ['power', 'Solar panel', ['solar', 'powerbank'], 'Charge your phone', { power: 1 }],
  ];
  const has = (id) => { const g = G(); return g.bag.includes('x_' + id) || (g.owned || []).includes('x_' + id); };
  const use = (id) => { const g = G(), k = 'x_' + id; let i = (g.owned || []).indexOf(k); if (i >= 0) return g.owned.splice(i, 1); i = g.bag.indexOf(k); if (i >= 0) g.bag.splice(i, 1); };
  const fx = (k) => (G().base ? G().base.up.reduce((s, u) => s + ((((UPS.find((x) => x[0] === u) || [])[4]) || {})[k] || 0), 0) : 0);
  const typesFor = (p) => (p.tier === 'village' || p.tier === 'small' ? (p.biome === 'farmland' ? ['barn', 'camp'] : ['camp', 'barn']) : ['building']);
  function search(p) {
    const g = G(); if (g.base && g.base.pid !== p.id) return K.D('You already have a base', `Your ${TYPES[g.base.type].n.toLowerCase()} is in ${A.data().places.find((x) => x.id === g.base.pid).name}. One base at a time. (You can abandon it from there.)`, K.ok());
    SH.advance(180, { interrupt: false }); if (g.ended) return;
    if (!K.chance(0.65)) { SH.st('energy', -10); return K.D('Nothing', 'Three hours of looking. Everything is either locked, lived in, or too close to the road.', K.ok()); }
    const t = K.pick(typesFor(p));
    K.D(TYPES[t].i + ' ' + TYPES[t].n, [TYPES[t].d, 'It isn\'t much. It could be.'], [{ t: 'Make it your base', cls: 'safe', fn: () => { g.base = { type: t, pid: p.id, up: [], day: SH.day(), nights: 0 }; SH.UI.log(`You have a base: the ${TYPES[t].n.toLowerCase()} outside ${p.name}.`, 'good'); base(p); } }, { t: 'Keep looking another day', fn: K.back }]);
  }
  function base(p) {
    const g = G(), b = g.base, T = TYPES[b.type], lvl = b.up.length;
    K.D(`${T.i} Your ${T.n.toLowerCase()}`, [T.d, lvl ? `Upgrades: ${b.up.map((u) => UPS.find((x) => x[0] === u)[1]).join(', ')}.` : 'Bare. Just you and the dust.', `${b.nights} night${b.nights === 1 ? '' : 's'} here so far.`], [
      { t: SH.hour() >= 20 || SH.hour() < 6 ? 'Sleep here' : 'Rest here (2h)', cls: 'safe', fn: () => sleep(p) },
      { t: '🔨 Fix it up', sub: `${UPS.length - lvl} upgrades left`, fn: () => upgrades(p) },
      ...(fx('power') ? [{ t: 'Charge your phone', fn: () => { SH.advance(90, { interrupt: false }); g.phone.bat = 100; base(p); } }] : []),
      { t: 'Abandon this base', fn: () => K.D('Abandon it?', 'You\'d lose the upgrades. The stuff stays behind.', [{ t: 'Abandon', cls: 'hot', fn: () => { g.base = null; K.back(); } }, { t: 'Keep it', fn: () => base(p) }]) },
      { t: 'Back', fn: K.back }]);
  }
  function upgrades(p) {
    const b = G().base, L = UPS.filter((u) => !b.up.includes(u[0]));
    K.D('Fix it up', 'Uses one of the listed items from your stuff. Buy them at hardware and sporting goods stores.', L.map(([id, n, items, d]) => { const it = items.find(has); return { t: `${n}${it ? ' ✓' : ''}`, sub: it ? `Use your ${C.ALL['x_' + it].n}: ${d}` : `Needs: ${items.map((i) => (C.ALL['x_' + i] || { n: i }).n).join(' or ')}`, fn: () => { if (!it) return upgrades(p); use(it); b.up.push(id); SH.advance(60, { interrupt: false }); SH.st('mood', 5); SH.UI.log(`Base upgraded: ${n}.`, 'good'); upgrades(p); } }; }).concat([{ t: 'Back', fn: () => base(p) }]));
  }
  const THREATS = [
    ['raccoon', () => fx('critter') < 1, 'Something rustles at 3 AM. In the morning your food is gone and there are tiny muddy handprints on everything. Raccoons.', () => { SH.st('full', -20); }],
    ['storm', () => fx('dry') < 1 && K.chance(0.6), 'Rain all night, and nothing between you and it. You wake up in a puddle.', () => { SH.st('warmth', -30); SH.st('energy', -20); }],
    ['cold', () => fx('warm') < 2, 'The cold gets into your bones around 4 AM and stays there.', () => { SH.st('warmth', -25); }],
    ['teens', () => G().base.type === 'building' && fx('safe') < 1, 'Teenagers break in at midnight with a speaker and a bag of chips. You hide in the back room until they leave at 2. They never see you. Your heart doesn\'t stop pounding till dawn.', () => { SH.st('stress', 20); SH.st('energy', -15); }],
    ['found', () => fx('hide') < 1 && K.chance(0.5), '', null],
  ];
  function sleep(p) {
    const g = G(), b = g.base, dark = SH.hour() >= 20 || SH.hour() < 6; SH.advance(dark ? 8 * 60 : 120, { interrupt: false }); if (g.ended) return;
    b.nights += dark ? 1 : 0; SH.st('energy', dark ? 30 + 12 * fx('rest') + 5 * fx('warm') : 15); SH.st('warmth', 10 * fx('warm')); SH.st('mood', 3 * fx('mood'));
    if (A.noticed(p, 0.04 / (1 + fx('hide')))) return;
    const th = dark && K.chance(0.35) ? K.pick(THREATS.filter((x) => x[1]())) : null;
    if (th && th[0] === 'found') { const who = b.type === 'camp' ? 'A park ranger' : b.type === 'barn' ? 'The farmer who owns the barn' : 'A city inspector'; g.awayNotice = (g.awayNotice || 0) + 25; g.base = null; return K.D('Found your base', `${who} finds your ${TYPES[b.type].n.toLowerCase()} in the morning. You're already gone (you heard the footsteps), but your base isn't yours anymore.`, K.ok()); }
    if (th) { th[3](); return K.D('A long night', th[2], [{ t: 'Okay', fn: () => base(p) }]); }
    K.D('Morning at base', K.pick(['Birds. Actual birds. You slept through the whole night.', 'It\'s starting to feel like somewhere. Like yours.', 'You wake up and know exactly where you are, and it\'s okay.']), [{ t: 'Okay', fn: () => base(p) }]);
  }
  K.hub((p, ch) => { const b = G().base; if (b && b.pid === p.id) ch.unshift({ t: `${TYPES[b.type].i} Your base`, cls: 'safe', sub: `${b.up.length} upgrades · ${b.nights} nights`, fn: () => base(p) }); else if (!b) ch.push({ t: '🔎 Look for a place to make a base', sub: typesFor(p).map((t) => TYPES[t].n).join(' or ') + ' · 3 hours', fn: () => search(p) }); });
  SH.Bases = { base, search, sleep, upgrades, fx, TYPES, UPS };
})(window.SH);
