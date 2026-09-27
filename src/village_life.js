/* SMALL HOURS — village life (turn 40). Sits on top of shack.js.
   1) Villagers remember you: every week you spend in a village (or small town) somebody warms up a little more.
      The farmer leaves boards by the fence, the diner saves you a plate, the gas-station clerk slips you the day-old
      hot dogs and lets you charge, the church lets you use the basement shower, and people stop looking twice.
      No ending of its own: it just makes staying possible.
   2) Small trades from the shack: forage what the season has (walnuts and apples in fall, pine boughs in December,
      wild onions and morels in spring, blackberries in summer), fish if there's water, whittle spoons by the fire.
      Eat it, cook it, or sell it at the farm stand or off a card table on the main road.
   3) Quiet days: at your base, let three days, a week or two weeks go by. The game simulates meals, sleep, washing,
      money and the odd trip to town, stops early if anything goes wrong, and tells you how it went.
   4) Weather: the phone's Weather app shows where you ARE (not Harlow), what it means for you tonight, and needs
      signal (villages: cached forecast or nothing). At the edge of town you can read the sky instead. */
(function (SH) {
  const TW = SH.Town, A = SH.Atlas, K = SH.K, S = SH.Shack, B = SH.Bases; if (!TW || !A || !K || !S || !B) return;
  const G = () => SH.G, pick = (a) => a[Math.floor(Math.random() * a.length)], log = (t, c) => SH.UI.log(t, c || '');
  const done = () => SH.UI.afterAction();
  const act = (label, sub, fn, o) => Object.assign({ label, sub, fn }, o || {});
  const day = () => SH.day();
  const here = () => (G().away && A.here ? A.here() : null);
  const W2 = () => SH.World2 || { cal: () => ({ m: 9 }), season: () => 'fall' };
  const month = () => W2().cal(G().t).m, season = () => W2().season(G().t);
  const person = (kind, p) => { const T = TW.cache[p.id] || TW.cur(); const q = T && T.people.find((x) => x.kind === kind); return q ? q.n : null; };

  /* ================= 1) villagers remember you ================= */
  const V = SH.Village = {};
  const vs = (pid) => { const g = G(); g.vill = g.vill || {}; return (g.vill[pid] = g.vill[pid] || { pts: {}, perks: [], wk: 0, days: 0 }); };
  V.st = vs;
  V.bump = (p, who, n) => { const s = vs(p.id || p); s.pts[who] = (s.pts[who] || 0) + (n || 1); };
  V.has = (p, k) => !!p && vs(p.id).perks.includes(k);
  const PERKS = {
    farm: { need: (p) => true, who: (p) => S.FARM(p).n,
      line: (p, n) => `One morning there's a stack of boards by ${S.FARM(p).place}'s fence with a rock on top and a note in pencil: FOR THE KID. ${n} doesn't mention it when you walk by. ${n} just lifts two fingers off the steering wheel, the way farmers wave. (Every week now: a few boards and some straw added to your pile.)` },
    diner: { need: (p) => !!TW.cache[p.id] && !!A.data && !!person('diner', p), who: (p) => person('diner', p),
      line: (p, n) => `At the diner, ${n} sets down a plate you didn't order. "Kitchen made too much." The kitchen did not make too much. "Come by around two, most days. There's always something." (Free plate at the diner, once a day.)` },
    gas: { need: (p) => !!person('gas', p), who: (p) => person('gas', p),
      line: (p, n) => `${n} at the gas station starts sliding the day-old hot dogs across the counter in a paper boat and pointing at the outlet under the coffee machine without looking up. "They go in the trash at six anyway." (Free hot dog and charging at the gas station.)` },
    church: { need: (p) => !!person('church', p), who: (p) => person('church', p),
      line: (p, n) => `${n} from the church catches you on the steps. "There's a shower in the basement for the youth group. Nobody's used it since 2019. Towels are in the closet." Then, holding out a folded wool blanket that smells like cedar: "And this was in the rummage pile. Too scratchy for anybody." (Basement shower at the church, and the blanket keeps you warmer at night.)` },
    nod: { need: () => true, who: () => 'people',
      line: (p) => `Somewhere in the second week or the third, ${p.name} stops looking at you twice. The man with the dog says "morning." The lady at the post office window says "you again." You're not news anymore. You're weather. (People notice you less here.)` },
  };
  const ORDER = ['farm', 'diner', 'gas', 'nod', 'church'];
  K.daily.push(() => {
    const g = G(), p = here(); if (!p || g.phase !== 'run' || !S.ok(p) || g.ended) return;
    const s = vs(p.id); s.days++;
    if (s.perks.includes('farm') && s.days % 7 === 0) { S.add('plank', 3); S.add('straw', 1); s.farmDrop = (s.farmDrop || 0) + 1; if (s.farmDrop > 1) log(`Boards by ${S.FARM(p).place}'s fence again, same rock, same note. You add them to your pile.`, 'good'); }
    const wk = Math.floor(s.days / 7); if (wk <= s.wk) return; s.wk = wk;
    const byPts = ORDER.filter((k) => !s.perks.includes(k) && PERKS[k].need(p)).sort((a, b) => (s.pts[b] || 0) - (s.pts[a] || 0));
    const k = byPts[0]; if (!k) return; s.perks.push(k);
    log(PERKS[k].line(p, PERKS[k].who(p)), 'good');
    if (k === 'church') g.flags.vBlanket = 1;
  });
  (A.mods = A.mods || []).push((p) => { if (!p || !S.ok(p) || !G().vill || !G().vill[p.id]) return 1; const n = vs(p.id).perks.length; return Math.max(0.7, 1 - 0.05 * n - (vs(p.id).perks.includes('nod') ? 0.1 : 0)); });
  // the blanket: warmer nights at your base
  K.daily.push(() => { const g = G(); if (g.flags.vBlanket && g.base && g.away === g.base.pid) SH.st('warmth', 10); });
  // visits count: who you go see most warms up first. Warm people greet you.
  const bArr = TW.onArrive;
  TW.onArrive = function (L) {
    const r = bArr ? bArr.apply(this, arguments) : undefined;
    try {
      const p = here(); const kind = L && L.id ? String(L.id).replace('t_' + (p && p.id) + '_', '') : null;
      if (p && S.ok(p) && kind) { V.bump(p, kind, 1);
        if (V.has(p, kind) && Math.random() < 0.5 && PERKS[kind]) { const n = PERKS[kind].who(p);
          log(pick({ diner: [`${n} sees you come in and just points at your booth.`, `"There's my regular," ${n} says, to nobody.`], gas: [`${n} doesn't look up. "Rollers are on the left, outlet's where it always is."`, `"You look cold," ${n} says. "Coffee's burnt but it's hot."`], church: [`${n} is changing the letters on the sign out front and waves with a Y.`, `"Towels are clean," ${n} says, passing you in the hall.`] }[kind] || ['Somebody nods.']), ''); } }
    } catch (e) { console.warn('village arrive', e); }
    return r;
  };
  const once = (k) => { const g = G(); g._vday = g._vday || {}; const key = k + ':' + day(); if (g._vday[key]) return false; g._vday[key] = 1; return true; };
  const wrapKind = (kind, f) => { const b = TW.KIND[kind]; if (!b) return; TW.KIND[kind] = function (a, L, T, p, c) { b.apply(this, arguments); try { if (S.ok(p)) f(a, L, T, p, c); } catch (e) { console.warn(e); } }; };
  wrapKind('diner', (a, L, T, p, c) => { if (!c.open || !V.has(p, 'diner')) return; const n = PERKS.diner.who(p);
    a.push(act(`${n} saved you a plate`, 'Free · once a day', () => { if (!once('plate' + p.id)) { log(`"Already fed you today, kiddo. Come back tomorrow."`, 'sys'); return done(); } if (TW.time(25, 0)) return; SH.st('full', 40); SH.st('mood', 5); SH.st('stress', -4); log(pick([`Meatloaf, mashed potatoes, green beans that have been cooking since breakfast. ${n} refills your milk twice and doesn't ask a single question.`, `Chicken and dumplings. ${n} sits across from you for one minute on her break, doing the crossword, and asks you a seven-letter word for "tired." You say "wrecked." It fits.`, `A grilled cheese cut in triangles and a cup of tomato soup. "That's what my kids ate at your age," ${n} says. "They turned out fine. Mostly."`]).replace(/her break/, 'a break'), 'good'); done(); }, { cls: 'safe' })); });
  wrapKind('gas', (a, L, T, p, c) => { if (!c.open || !V.has(p, 'gas')) return; const n = PERKS.gas.who(p);
    a.push(act('Day-old hot dog and the outlet', `Free · ${n} looks the other way`, () => { if (!once('hd' + p.id)) { log(`"That was today's," ${n} says. "Tomorrow's are still rolling."`, 'sys'); return done(); } if (TW.time(40, 0)) return; SH.st('full', 20); const ph = G().phone; if (ph) ph.bat = Math.min(100, (ph.bat || 0) + 45); log(`A hot dog in a paper boat, a phone on the outlet under the coffee machine, forty minutes of ${n}'s radio. Phone at ${Math.round((ph || {}).bat || 0)}%.`, 'good'); done(); }, { cls: 'safe' })); });
  wrapKind('church', (a, L, T, p, c) => { if (!V.has(p, 'church') || c.dark) return;
    a.push(act('Basement shower', 'Free · towels in the closet', () => { if (!once('sh' + p.id)) { log('You already showered today. Twice would be showing off.', 'sys'); return done(); } if (TW.time(30, 0)) return; G().s.hyg = Math.max(G().s.hyg, 90); SH.st('mood', 6); SH.st('stress', -5); log(pick(['The water takes four minutes to get hot and then it\'s the best four minutes of your week. You stand there until your fingers prune.', 'A basement shower with a mildew curtain and a bar of Ivory soap. You come out pink and new. Somebody left a comb on the sink, like a gift.']), 'good'); done(); }, { cls: 'safe' })); });

  /* ================= 2) small trades ================= */
  Object.assign(S.NAMES, {
    walnut: ['bag of black walnuts', 'bags of black walnuts'], apple: ['apple', 'apples'], greens: ['bundle of pine boughs', 'bundles of pine boughs'],
    ramp: ['bunch of wild onions', 'bunches of wild onions'], morel: ['bag of morels', 'bags of morels'], berry: ['pint of blackberries', 'pints of blackberries'],
    fish: ['fish', 'fish'], spoon: ['carved spoon', 'carved spoons'], line: ['hook-and-line kit', 'hook-and-line kits'], knife: ['pocketknife', 'pocketknives'],
  });
  const PRICE = { walnut: 3, apple: 0.5, greens: 2, ramp: 3, morel: 8, berry: 4, fish: 3, spoon: 2 };
  const FOOD = { apple: 10, berry: 14, walnut: 12 }; // eat raw from the pile
  const WATER = ['lake', 'river', 'coast'];
  // what the season has, by biome
  function crop(p) {
    const m = month(), b = S.biome(p);
    if (m >= 8 && m <= 10) { if (b === 'coast') return null; const k = m === 10 || !(b === 'fields' || b === 'hills') ? 'walnut' : pick(['walnut', 'apple']);
      return k === 'apple' ? { k, where: 'the old orchard behind a fallen-down farmhouse', how: 'Nobody has picked these trees in years. You fill your shirt with the good windfalls and one perfect one off a high branch.' } : { k, where: 'the black walnut trees along the ' + (b === 'fields' ? 'fencerow' : 'creek'), how: 'You fill a feed sack with walnuts in their green husks, which stain your hands brown for a week.' }; }
    if (m === 11) return b === 'fields' ? null : { k: 'greens', where: 'the pines', how: 'You cut low boughs off the pines with more patience than skill. The farm stand sells wreaths in December; everybody needs boughs.' };
    if (m <= 1) return null;
    if (m === 2) return { k: 'ramp', where: 'the damp woods along the creek', how: 'The first green thing in the woods: wild onions, in patches. You dig them with a stick. Your hands smell like them for hours and you don\'t care.' };
    if (m <= 4) return b === 'coast' ? { k: 'ramp', where: 'the wet ground behind the dunes', how: 'Wild onions, the last of them.' } : { k: Math.random() < 0.55 ? 'morel' : 'ramp', where: 'under the dying elms and old apple trees', how: 'Morels: little brain-looking mushrooms that people in these parts lose their minds over. You learn what they look like and, more importantly, what the poisonous ones look like. ' + (S.FARM(p).n) + ' taught you: cut one in half, real ones are hollow.' };
    return { k: 'berry', where: 'the brambles along the ditch', how: 'Blackberries, hot from the sun. You eat one for every two that go in the container. Maybe one for one.' };
  }
  const has = (k, n) => (S.pile()[k] || 0) >= (n || 1);
  const sellable = () => Object.keys(PRICE).filter((k) => has(k));
  const worth = (mult) => sellable().reduce((s, k) => s + PRICE[k] * S.pile()[k], 0) * (mult || 1);

  function forage(p) {
    const cr = crop(p); if (!cr) { log(pick(['You walk the woods for an hour looking for anything worth picking. It\'s the wrong time of year for everything. You find a very nice rock.', 'Nothing out here right now but dead stalks and rose hips the birds already got to.']), 'sys'); TW.time(45, 0); return done(); }
    if (!once('forage' + p.id)) { log('You already picked over everything within walking distance today.', 'sys'); return done(); }
    if (TW.time(90 * (S.rainy() ? 1.3 : 1), 0.02, { exert: 1.5 })) return;
    const n = 1 + Math.floor(Math.random() * 3) + S.crew().length; S.add(cr.k, n); SH.st('energy', -8); SH.st('mood', 4);
    log(`You go out to ${cr.where}. ${cr.how} ${S.nm(cr.k, n)} for the pile.`, 'good'); log(`Your pile: ${S.pileTxt()}.`, 'sys'); done();
  }
  function fish(p) {
    if (!has('line')) { log('You need a hook and line. The gas station sells a little kit on the hardware shelf.', 'sys'); return done(); }
    if (TW.time(120, 0.02, { exert: 0.5 })) return;
    const sk = (G().skills || {}).fish || 0, ch = (season() === 'winter' ? 0.2 : 0.45) + sk * 0.05 + S.crew().length * 0.05;
    G().skills = G().skills || {}; G().skills.fish = Math.min(10, sk + 0.5);
    const water = { lake: 'the end of an old dock', river: 'a slow bend in the river', coast: 'the rocks below the jetty' }[S.biome(p)];
    if (Math.random() < ch) { const n = Math.random() < 0.3 ? 2 : 1; S.add('fish', n); SH.st('mood', 8); log(`Two hours at ${water} with a stick, a line and a worm you found under a log. ${n === 2 ? 'Two fish' : 'One fish'}${S.crew().length ? `, and ${K.nm(S.crew()[0])} won't stop talking about it` : ''}. ${pick(['Not big. Big enough.', 'You\'re not sure what kind. The kind you can eat, the farmer says later.'])}`, 'good'); }
    else log(`Two hours at ${water}. The bobber doesn't move once. ${pick(['It\'s still the most peaceful two hours you\'ve had in weeks.', 'A heron fishing twenty feet away catches three. It does not share.'])}`, '');
    done();
  }
  function whittle(p, fire) {
    if (!has('knife')) { log('You need a pocketknife. The gas station has one on the hardware shelf.', 'sys'); return done(); }
    if (!has('branch')) { log('No branches left in your pile to carve.', 'sys'); return done(); }
    if (TW.time(60, 0)) return; S.pile().branch--; const sk = (G().skills || {}).carve || 0; G().skills = G().skills || {}; G().skills.carve = Math.min(10, sk + 1);
    const good = Math.random() < 0.5 + sk * 0.06; if (good) S.add('spoon', 1); SH.st('stress', -8); SH.st('mood', 4);
    log(good ? pick([`${fire ? 'By the fire, ' : ''}you carve a spoon out of a straight piece of branch. The bowl is a little lopsided. It holds soup. That\'s the whole job of a spoon.`, `You get into a rhythm with the knife, long thin curls falling on your shoes. A spoon, a real one. You sand it on a flat stone until it\'s smooth.`, `This one comes out good enough that you almost keep it.`]) : pick(['The branch splits right down the middle where the bowl should be. Firewood, then.', 'You carve too deep and go straight through. Now it\'s a spoon with a hole in it, which is a fork, sort of. No.']), good ? 'good' : '');
    done();
  }
  function eat(p, fire) {
    const g = G(), ch = [];
    const EATL = { apple: 'A windfall apple, a little bruised, very sweet.', berry: 'A pint of blackberries. Your fingers go purple.', walnut: 'You crack walnuts between two stones. It takes forever and they taste like dirt and butter. Worth it.' };
    Object.keys(FOOD).forEach((k) => { if (!has(k)) return; ch.push({ t: `Eat: ${S.NAMES[k][0]}`, sub: `${S.pile()[k]} left`, fn: () => { S.pile()[k]--; SH.st('full', FOOD[k]); log(EATL[k], ''); done(); } }); });
    if (has('fish') && fire) ch.push({ t: 'Cook a fish on the fire ring', sub: 'The good stuff', fn: () => { if (TW.time(40, 0)) return; S.pile().fish--; SH.st('full', 40); SH.st('mood', 8); SH.st('warmth', 6); log(pick(['Gutting it is gross the first time and fine the second. On a flat stone at the edge of the fire, skin crackling. You eat it with your fingers and a carved spoon.', `You cook it on a green stick over the fire${S.crew().length ? ` and split it with ${K.nm(S.crew()[0])}` : ''}. Best meal of your life, probably. Definitely the proudest.`]), 'good'); done(); } });
    if (!ch.length) { log('Nothing in the pile you can eat' + (has('fish') ? ' raw. You need a fire ring to cook the fish.' : '.'), 'sys'); return done(); }
    ch.push({ t: 'Back', fn: done }); SH.UI.dialog({ title: 'From your pile', text: [`Your pile: ${S.pileTxt()}.`], choices: ch });
  }
  // selling: farm stand (inside the farm dialog) and a card table on the main road
  const SELL_LINES = [(n) => `${n} turns a spoon over, runs a thumb down the bowl. "Huh." Puts it on the stand next to the honey.`, (n) => `${n} weighs everything on the egg scale and pays you like a grown-up, out of a coffee can.`, (n) => `"People from the city pay stupid money for this kind of thing," ${n} says. "Don't tell them it was a kid."`];
  function sellAll(mult) { const P = S.pile(); let tot = 0; const what = []; sellable().forEach((k) => { tot += PRICE[k] * P[k] * mult; what.push(S.nm(k, P[k])); P[k] = 0; }); tot = Math.round(tot * 4) / 4; SH.money(tot); (G().tx = G().tx || []).push({ t: G().t, d: 'Sold: ' + what.join(', '), a: tot }); return { tot, what }; }
  V.sell = (p, back) => { if (!sellable().length) return []; const F = S.FARM(p);
    return [{ t: `Sell at the farm stand: ~$${worth(1).toFixed(2)}`, sub: sellable().map((k) => S.nm(k, S.pile()[k])).join(', '), fn: () => { const r = sellAll(1); V.bump(p, 'farm', 1); log(`${pick(SELL_LINES)(F.n)} $${r.tot.toFixed(2)} for ${r.what.join(', ')}.`, 'good'); back(); } }]; };
  wrapKind('main', (a, L, T, p, c) => { if (c.dark || !sellable().length) return;
    a.push(act('Set up a card table by the road', `2 hours · sell your stuff (~$${worth(1.3).toFixed(0)}) · people see you`, () => {
      if (!once('table' + p.id)) { log('You already sold here today. Twice looks like a business, and businesses get asked questions.', 'sys'); return done(); }
      if (TW.time(120, 0.12)) return; const r = sellAll(1.3);
      log(`A card table from the church basement, a cardboard sign in marker. ${pick(['A lady in a minivan buys everything and tells you to "keep at it, sweetie."', 'Three cars stop. One of them is just for directions. The other two buy.', 'A man in a feed-store cap haggles you down a dollar and then leaves an extra five on the table when he goes.'])} $${r.tot.toFixed(2)}.`, 'good'); done(); })); });
  // gas shelf: fishing kit and a pocketknife
  wrapKind('gas', (a, L, T, p, c) => { if (!c.open) return;
    if (!has('line') && WATER.includes(S.biome(p))) a.push(act('Buy a hook-and-line kit: $3', 'Hooks, line, sinkers, a bobber, on a card', () => { if (!TW.pay(3, 'Fishing kit')) return done(); S.add('line', 1); log('A little fishing kit on a cardboard card. The clerk says the fish are "biting at the dock, or they were in 1994."', ''); done(); }));
    if (!has('knife')) a.push(act('Buy a pocketknife: $7', 'Small, folding. For carving and cutting twine.', () => { if (!TW.pay(7, 'Pocketknife')) return done(); S.add('knife', 1); log('A small folding knife in a blister pack. The clerk looks at you, looks at the knife, shrugs. "Cut away from yourself."', ''); done(); })); });
  // the edge of town: trades, plus reading the sky
  const bEdge = TW.KIND.edge;
  TW.KIND.edge = function (a, L, T, p, c) {
    bEdge.apply(this, arguments); if (!S.ok(p)) return;
    const g = G(), b = g.base, mine = b && b.pid === p.id, fire = mine && b.up.includes('sh_fire');
    if (!c.dark) { const cr = crop(p); a.push(act(cr ? `Forage: ${S.NAMES[cr.k][1]}` : 'Look for anything worth picking', cr ? '1.5 hours · eat it or sell it' : 'Wrong season for most things', () => forage(p)));
      if (WATER.includes(S.biome(p))) a.push(act('Go fishing', has('line') ? '2 hours · maybe dinner' : 'Needs a hook-and-line kit (gas station)', () => fish(p))); }
    if (!c.dark || fire) a.push(act(fire && c.dark ? 'Whittle by the fire' : 'Whittle a spoon', has('knife') ? '1 hour · uses a branch · sells at the farm stand' : 'Needs a pocketknife (gas station)', () => whittle(p, fire && c.dark)));
    if (Object.keys(FOOD).some((k) => has(k)) || (has('fish') && fire)) a.push(act('Eat from your pile', S.pileTxt(), () => eat(p, fire)));
    a.push(act('Read the sky', '5 min · what tomorrow looks like', () => { if (TW.time(5, 0)) return; log(sky(), ''); done(); }));
  };

  /* ================= 4) weather ================= */
  function sky() {
    const w = SH.weatherDay(day() + 1) || {}, right = Math.random() < 0.8, c = right ? w.c : pick(['clear', 'cloudy', 'rain', 'fog']), p = here();
    const L = { clear: 'The sunset is clean and orange all the way down, no clouds stacked in the west. Clear tomorrow, probably.', cloudy: 'High thin clouds coming in like brushed hair. Grey tomorrow, not wet.', rain: 'Mackerel sky, and the wind has backed around from the south. The cows are all lying down. Rain by tomorrow.', storm: `The farmers are moving equipment into the sheds and nobody's saying why. The air feels thick. Something big tomorrow.`, fog: 'The air is dead still and wet, and the low spots are already going white. Fog in the morning.' };
    const cold = w.lo < 36 ? ' The air has that metal smell, too. It\'s going to freeze tonight.' : '';
    return `You watch the sky ${p ? 'over ' + p.name : ''} for a while. ${L[c] || L.clear}${right ? cold : ''}`;
  }
  function advice() {
    const g = G(), t = SH.weatherDay(day()), n = SH.weatherDay(day() + 1), b = g.base, p = here(), mine = b && p && b.pid === p.id;
    const warm = mine ? B.fx('warm') : 0, dry = mine ? B.fx('dry') : 0, L = [];
    if (t.lo < 34) L.push(mine ? (warm >= 2 ? `Freezing tonight (${t.lo}°). Your base holds heat. You'll be okay.` : `Freezing tonight (${t.lo}°), and your base is drafty. Walls, a fire ring, straw. Or sleep indoors tonight.`) : `Freezing tonight (${t.lo}°). Find walls.`);
    else if (t.lo < 42) L.push(`Cold tonight (${t.lo}°). Layers.`);
    if (/rain|storm/.test(t.c)) L.push(mine && dry ? 'Rain today, but your roof holds. Good day for carving, fixing, staying in.' : 'Rain today. Everything outside takes longer. A roof would help.');
    else if (/rain|storm/.test(n.c)) L.push('Dry today, wet tomorrow: gather and build today.');
    else L.push('Dry for now. Good day to gather, build, work.');
    if (n.c === 'storm') L.push('Storm tomorrow. Stay close to shelter.');
    return L;
  }
  const P = SH.Phone;
  if (P && P.V) P.V.weather = function (body) {
    const g = G(), d = day(), W = SH.weatherDay(), p = here(), NT = SH.Net;
    const online = !NT || !NT.online || NT.online() || !g.away;
    if (online) g._wx = { d, t: g.t };
    const last = g._wx, stale = !online && last ? Math.round((g.t - last.t) / 60) : 0, from = online ? d : last ? last.d : null;
    const rows = from == null ? '' : [0, 1, 2, 3, 4].map((i) => from + i).filter((x) => x >= d).map((x) => { const w = SH.weatherDay(x); return `<div class="setrow"><span>${x === d ? 'Today' : SH.WEEKDAYS[(SH.wd() + x - d) % 7].slice(0, 3)}</span><span>${SH.WICON[w.c] || '·'}</span><span>${w.lo}° – ${w.hi}°</span></div>`; }).join('');
    const hdr = P.hdr ? P.hdr('Weather') : '';
    body.innerHTML = hdr + `<div class="appbody" style="text-align:center"><div style="font-size:13px;opacity:.7;margin-top:10px">${p ? p.name : 'Harlow'}</div>
      ${online || (last && stale < 30) ? `<div style="font-size:60px;font-weight:200">${SH.tempF()}°</div><div>${SH.toC ? SH.toC(SH.tempF()) + '°C · ' : ''}${W.c}</div><div style="opacity:.7;font-size:12px">H:${W.hi}° L:${W.lo}°</div>` : '<div style="font-size:40px;margin:14px 0">📵</div>'}
      ${!online ? `<div class="post" style="margin-top:10px;font-size:12px">${last ? `No signal. Showing the forecast from ${stale < 90 ? stale + ' minutes' : Math.round(stale / 60) + ' hours'} ago.` : 'No signal, and no saved forecast. Find signal, or go read the sky at the edge of town.'}</div>` : ''}
      <div style="margin-top:14px;text-align:left">${rows}</div>
      ${rows ? `<div class="sech" style="text-align:left;margin-top:14px">FOR YOU</div><div style="text-align:left;font-size:13px">${advice().map((x) => `<p style="margin:6px 0">${x}</p>`).join('')}</div>` : ''}</div>`;
  };

  /* ================= 3) quiet days ================= */
  const nearMeal = () => { const P0 = S.pile(); return ['fish', 'walnut', 'berry', 'apple'].find((k) => (P0[k] || 0) > 0 && (k !== 'fish' || (G().base && G().base.up.includes('sh_fire')))); };
  function canQuiet(p) {
    const g = G(), b = g.base;
    if (!b || b.pid !== p.id) return 'Only at your base.';
    if ((g.heat || 0) >= 60 || (g.awayNotice || 0) >= 55) return 'Too many people are looking for you right now.';
    if (g.money < 10 && !nearMeal()) return 'You need food or money to last.';
    return null;
  }
  // while quiet days run, small everyday popups resolve themselves (first calm choice) and go in the summary;
  // anything that smells like trouble stops the days and is shown for real.
  let QD = null;
  const DANGER = /police|officer|deputy|sheriff|\bcops?\b|recogni|poster|missing|amber|your mom|found you|fever|hospital|clinic|stranger|follow|ranger|social worker|truant|storm/i;
  const bDlg = SH.UI.dialog;
  SH.UI.dialog = function (o) {
    if (!QD || QD.stop || !o) return bDlg.apply(this, arguments);
    const txt = (o.title || '') + ' ' + [].concat(o.text || []).join(' ') + ' ' + (o.choices || []).map((c) => c.t).join(' ');
    if (DANGER.test(txt) || QD.depth > 3) { QD.stop = o.title || 'Something'; return bDlg.apply(this, arguments); }
    const ch = (o.choices || []).filter((c) => !c.cond || c.cond()), c = ch.find((x) => !x.cls || x.cls === 'safe') || ch[0];
    QD.side.push(`${o.title || 'Something'}: ${c ? String(c.t).replace(/^\W+/, '').toLowerCase() : 'you let it go'}.`);
    QD.depth++; try { c && c.fn && c.fn(); } catch (e) { console.warn('quiet auto', e); } QD.depth--;
  };
  function quiet(p, n) {
    QD = { side: [], depth: 0, stop: null };
    try { return quiet0(p, n); } finally { QD = null; }
  }
  function quiet0(p, n) {
    const g = G(), b = g.base, lines = [], m0 = g.money, md = document.querySelector('#modal'), P0 = S.pile();
    const s = S.ok(p) ? vs(p.id) : null; let why = null, did = 0, spoons = 0, forg = 0, fishN = 0;
    const shut = () => g.ended || !!QD.stop;
    SH.UI.closeModal ? SH.UI.closeModal() : md && md.classList.add('hidden');
    for (let i = 0; i < n && !why; i++) {
      // morning: eat
      const meal = () => { const f = nearMeal(); if (f) { P0[f]--; SH.st('full', f === 'fish' ? 40 : 25); } else if (g.money >= 3.5) { SH.money(-3.5); SH.st('full', 35); } };
      meal();
      // day: in chunks so nights, weather and the town clock all happen
      const wake = SH.hour(); let awake = Math.max(0, Math.round(((22 - wake + 24) % 24) * 60)); if (awake > 17 * 60) awake = 14 * 60;
      let noon = false;
      while (awake > 0 && !why) { const st = Math.min(60, awake); SH.advance(st, { interrupt: false }); awake -= st; if (shut()) { why = 'Something happened.'; break; }
        if (!noon && SH.hour() >= 12) { noon = true; meal(); } }
      meal();
      if (why) break;
      // chores: wash, a small trade, one trip to town
      g.s.hyg = Math.max(g.s.hyg, V.has(p, 'church') ? 85 : 55);
      if (has('knife') && has('branch') && Math.random() < 0.6) { P0.branch--; S.add('spoon', 1); spoons++; }
      const cr = crop(p); if (cr && Math.random() < 0.5) { S.add(cr.k, 1); forg++; }
      if (has('line') && WATER.includes(S.biome(p)) && Math.random() < 0.35) { S.add('fish', 1); fishN++; }
      if (TW.notice(0.06) && (g.awayNotice || 0) >= 55) { why = 'Someone at the gas station asked where your parents were, and didn\'t let it go.'; }
      if (g.ended) break;
      // night
      SH.st('warmth', 8 * B.fx('warm')); SH.st('stress', -12); SH.st('mood', 6 + 3 * B.fx('mood')); if (g.s.full > 30 && g.s.warmth > 40) SH.st('health', 4); const q = Math.min(1, 0.55 + 0.1 * B.fx('rest') + 0.08 * B.fx('warm'));
      for (let h = 0; h < 9 && !shut(); h++) SH.advance(60, { sleep: true, quality: q, interrupt: false });
      if (shut()) { why = why || 'Something happened in the night.'; }
      b.nights = (b.nights || 0) + 1; did++;
      g.s.hyg = Math.max(g.s.hyg, V.has(p, 'church') ? 85 : 55); g.s.stress = Math.min(g.s.stress, 50 - 3 * B.fx('mood')); g.s.mood = Math.max(g.s.mood, 40 + 3 * B.fx('mood'));
      // one line for the day
      const w = SH.weatherDay(day() - 1) || {}, fr = S.crew();
      lines.push(`<b>${SH.dateStr(g.t - 600).split(',')[0]}.</b> ` + pick([
        /rain|storm/.test(w.c) ? (B.fx('dry') ? 'Rain on the roof all day. You carve and listen to it.' : 'Rain. You spend it trying to stay dry and mostly failing.') : null,
        w.lo < 34 ? 'A hard frost. The pile of branches is white in the morning. You feed the fire.' : null,
        fr.length ? `${K.nm(pick(fr))} teaches you a card game that has no rules as far as you can tell.` : null,
        s && s.perks.includes('diner') ? `Lunch at the diner. ${PERKS.diner.who(p)} asks how "the cabin" is going.` : null,
        s && s.perks.includes('farm') ? `You help ${S.FARM(p).n} fix a fence for an hour for nothing. It feels good to be asked.` : null,
        'Nothing happens. You walk to the gas station and back. You watch a hawk for a long time.',
        'You sleep late, wash at the creek, and read a paperback somebody left at the church, cover to cover.',
        'You patch the gaps in the walls with leaves and mud. You\'re getting good at this.',
        'Grey and quiet. A good day to not be anybody in particular.',
      ].filter(Boolean)));
      if (SH.Tale && SH.Tale.pending()) why = 'Something came up.';
      if (g.s.health < 35) why = 'You\'re feeling sick. Quiet days aren\'t helping.';
      if (g.money < 3.5 && !nearMeal()) why = 'You\'re out of money and out of food.';
    }
    if (g.ended) return;
    if (shut()) { SH.UI.log(`— ${did} quiet day${did === 1 ? '' : 's'} went by before something came up. —`, 'day'); return; }
    const spent = Math.max(0, m0 - g.money);
    const sum = [`${did} day${did === 1 ? '' : 's'} go by at your ${b.shack ? 'shack' : B.TYPES[b.type].n.toLowerCase()} outside ${p.name}.`].concat(lines.slice(-7));
    if (lines.length > 7) sum.splice(1, 0, `<i>(…${lines.length - 7} more days like it.)</i>`);
    sum.push([`Spent: $${spent.toFixed(2)}. Money left: $${g.money.toFixed(2)}.`, spoons ? `You carved ${spoons} spoon${spoons > 1 ? 's' : ''}.` : '', forg ? `You foraged ${forg} lots for the pile.` : '', fishN ? `Caught ${fishN} fish.` : ''].filter(Boolean).join(' '));
    if (QD.side.length) sum.push(`<i>Along the way: ${[...new Set(QD.side)].slice(-4).join(' ')}</i>`);
    if (why) sum.push(`<b>You stop.</b> ${why}`);
    SH.UI.log(`— ${did} quiet day${did === 1 ? '' : 's'} at your base. —`, 'day');
    QD = null;
    SH.UI.dialog({ title: `⏩ ${did} quiet day${did === 1 ? '' : 's'}`, text: sum, html: true, choices: [{ t: 'Okay', fn: K.back }] });
  }
  K.me((p, ch) => {
    const g = G(); if (!p || !g.base || g.base.pid !== p.id) return; const no = canQuiet(p);
    ch.push({ t: '⏩ Let some quiet days go by', sub: no || 'At your base. Meals, sleep, chores. Stops if anything happens.', fn: () => {
      if (no) { SH.UI.toast(no); return K.back(); }
      K.D('Quiet days', ['Nothing much happens: you eat, wash, carve, go to town once, sleep. About $10 a day for food, less if your pile has some. If anything goes wrong, you stop.'], [3, 7, 14].map((n) => ({ t: n === 3 ? 'Three days' : n === 7 ? 'A week' : 'Two weeks', sub: `~$${(n * 10).toFixed(0)} without pile food`, fn: () => quiet(p, n) })).concat([{ t: 'Back', fn: K.back }]));
    } });
  });
  V.quietOn = () => !!QD;
  V.quiet = quiet; V.crop = crop; V.sky = sky; V.advice = advice;
})(window.SH);
