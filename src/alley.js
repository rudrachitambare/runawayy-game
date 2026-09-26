/* SMALL HOURS — Part 3b: the side streets (small towns get a diner; towns and cities get the lot).
   Grimy diner (cheap food, a waitress who notices, rumors), alley stall (used stuff, cheap), pawn shop (sell YOUR things,
   never stolen ones: there's no theft in this game), a fake-ID guy (costs $60–150, bad or ok quality; pro motels spot them,
   and getting caught brings heat). Creeps: ⚠️ pop-ups, always with a way out. Street rep per place (G.street) means regulars
   look out for you, and the fake-ID guy will talk to you at all. */
(function (SH) {
  const K = SH.K, A = SH.Atlas, C = SH.Catalog; if (!K || !A) return;
  const G = K.G;
  const rep = (p, d) => { const s = (G().street = G().street || {}); if (d) s[p.id] = Math.max(0, Math.min(100, (s[p.id] || 0) + d)); return s[p.id] || 0; };
  const WAIT = ['Dolores', 'Bev', 'Tasha', 'Rosa', 'Kim'];
  const waitress = (p) => WAIT[p.name.length % WAIT.length];
  const RUMOR = (p) => {
    const ms = SH.Motels ? SH.Motels.motels(p) : [], sl = ms.find((m) => m.k === 'sloppy'), lo = ms.find((m) => m.k === 'loose');
    return [sl ? `"${sl.n}? Stu doesn't ask questions. Stu doesn't do anything, honestly."` : null, lo ? `"The lady at ${lo.n} will talk you down on the price if you're nice. And if you have a sad story. She loves a sad story."` : null,
      `"The cops here do a lap of the bus station at ten and two. Like clockwork."`, `"Don't go down by the tracks after dark, hon. I mean it."`, `"The library lets you sit all day if you're reading. Actually reading."`].filter(Boolean);
  };
  function streets(p) {
    const g = G(), dark = SH.hour() >= 20 || SH.hour() < 6, r = rep(p);
    if (dark && K.chance(Math.max(0.04, 0.2 - r / 400)) && !g.flags.creepToday) { g.flags.creepToday = SH.day(); return creep(p, r); }
    const ch = [{ t: `🍳 ${p.tier === 'city' ? 'The 24-hour diner' : 'The diner'}`, sub: 'Coffee-stained menus, $2 hash browns', fn: () => diner(p) }];
    if (p.tier !== 'small') { ch.push({ t: '🧺 The alley stall', sub: 'Used stuff, cheap, no receipts', fn: () => stall(p) }); ch.push({ t: '💍 Pawn shop', sub: 'Sell things you own', fn: () => pawn(p) }); }
    if (p.tier !== 'small' && (r >= 15 || p.tier === 'city')) ch.push({ t: '🪪 The guy by the laundromat', sub: 'People say he makes IDs', fn: () => dealer(p) });
    ch.push({ t: 'Back', fn: K.back });
    K.D(`The side streets of ${p.name}`, [dark ? 'Streetlights buzz. A neon OPEN sign flickers on the diner. Somewhere a dog, somewhere a car alarm.' : 'Behind the main street: dumpsters, a mural, a pawn shop with bars on the window.', r >= 30 ? 'A few people nod at you. You\'re a regular now. That counts for something out here.' : ''].filter(Boolean), ch);
  }
  function diner(p) {
    const g = G(), w = waitress(p), r = rep(p);
    K.D('The diner', [`${w} pours you water without asking. ${r >= 20 ? `"Hey, you. The usual?"` : '"What\'ll it be, sugar?"'}`], [
      { t: 'Hash browns and toast ($2)', fn: () => { if (!K.pay(2, 'Diner')) return diner(p); SH.st('full', 30); SH.st('mood', 4); SH.advance(25, { interrupt: false }); rep(p, 4); K.D('The diner', 'Greasy, perfect. Refills on the water are free and she keeps them coming.', [{ t: 'Okay', fn: () => diner(p) }]); } },
      { t: 'The big breakfast ($6)', fn: () => { if (!K.pay(6, 'Diner')) return diner(p); SH.st('full', 70); SH.st('mood', 8); SH.st('warmth', 15); SH.advance(40, { interrupt: false }); rep(p, 6); K.D('The diner', 'Eggs, pancakes, bacon, a sausage you didn\'t order that she swears was a mistake.', [{ t: 'Okay', fn: () => diner(p) }]); } },
      { t: 'Listen to the regulars', sub: 'Local gossip', fn: () => { SH.advance(30, { interrupt: false }); rep(p, 2); K.D('The counter', K.pick(RUMOR(p)), [{ t: 'Okay', fn: () => diner(p) }]); } },
      { t: `Tip ${w} a dollar`, fn: () => { if (K.pay(1, 'Tip')) { rep(p, 5); SH.UI.toast(`${w} winks.`); } diner(p); } },
      { t: 'Leave', fn: () => streets(p) }], 'local');
    g.awayNotice = (g.awayNotice || 0) + (r >= 20 ? 0 : 1);
  }
  const STALL = ['hoodie2', 'beanie', 'cap', 'glasses', 'powerbank', 'rainjacket', 'blanket2', 'lantern'];
  function stall(p) {
    const L = STALL.map((i) => C.ALL['x_' + i]).filter(Boolean), pr = (x) => Math.max(1, Math.round(x.price * 0.55));
    K.D('The alley stall', 'A folding table under a tarp. A woman with a cashbox and a lot of rings. "Everything\'s used. Everything works. Mostly."',
      L.map((x) => ({ t: `${x.i} ${x.n}: $${pr(x)}`, sub: 'used', fn: () => { if (K.pay(pr(x), 'Stall: ' + x.n) && C.give(x.id)) { rep(p, 2); SH.UI.log(`Bought a used ${x.n}.`, 'sys'); } stall(p); } })).concat([{ t: 'Back', fn: () => streets(p) }]));
  }
  function pawn(p) {
    const g = G(), mine = [...new Set(g.bag)].map((id) => C.ALL[id]).filter((x) => x && x.price >= 5);
    K.D('Pawn shop', ['Guitars on the wall, a glass case of rings, a man who looks at everything like he\'s pricing it. Including you.', mine.length ? '"What\'ve you got?" He pays about a third.' : 'You don\'t have anything worth selling. He goes back to his newspaper.'],
      mine.slice(0, 10).map((x) => ({ t: `Sell your ${x.n}: $${Math.floor(x.price * 0.33)}`, fn: () => { const i = g.bag.indexOf(x.id); if (i >= 0) { g.bag.splice(i, 1); SH.money(Math.floor(x.price * 0.33)); SH.UI.log(`Pawned your ${x.n}.`, 'sys'); } pawn(p); } })).concat([{ t: 'Back', fn: () => streets(p) }]));
  }
  function dealer(p) {
    const g = G(); if (g.fakeId) return K.D('The laundromat', `"You already got one, ${g.fakeId.name.split(' ')[0]}." He doesn't look up from his phone.`, [{ t: 'Back', fn: () => streets(p) }]);
    K.D('The laundromat', ['A guy in a puffer jacket sitting on a dryer. He looks at you for a long time. "How old are you, like eleven?"', '"Doesn\'t matter. Nobody\'s gonna believe you\'re eighteen. But a chain motel clerk who\'s tired at 2 AM might not look close. Might."'], [
      { t: 'The cheap one: $60', sub: 'Laminated at a copy shop. Bad.', fn: () => buyId(p, 60, 'bad') },
      { t: 'The good one: $150', sub: 'Hologram and everything. Okay-ish.', fn: () => buyId(p, 150, 'ok') },
      { t: 'No thanks', fn: () => streets(p) }]);
  }
  const FAKE = ['Jordan Miller', 'Taylor Brooks', 'Casey Reed', 'Morgan Hayes', 'Riley Carter'];
  function buyId(p, cost, q) {
    const g = G(); if (!K.pay(cost, 'Cash')) return dealer(p); SH.advance(q === 'ok' ? 180 : 40, { interrupt: false });
    g.fakeId = { q, name: K.pick(FAKE), at: p.id }; rep(p, 5); g.heat = (g.heat || 0) + 3;
    K.D('The laundromat', [`${q === 'ok' ? 'Three hours later' : 'Forty minutes later'}, a card that says you're ${g.fakeId.name}, born eighteen years ago. The photo is you in a borrowed collared shirt.`, q === 'bad' ? 'The lamination is already peeling at one corner.' : 'It looks real. You don\'t look eighteen. That part is up to you.'], [{ t: 'Back', fn: () => streets(p) }]);
  }
  function creep(p, r) {
    const g = G(), w = waitress(p);
    const s = K.pick([['A car pulls up alongside you and slows to your walking speed. The window comes down. A man, smiling. "Hey, you look cold. I\'ve got a warm place, food, whatever you need. Hop in."', 'car'], ['A man has been behind you for three blocks. When you stop, he stops. When you look back, he smiles like you\'re friends.', 'follow'], ['A woman at the bus shelter says she runs "a place for kids like you." She knows your first name. You never told her your first name.', 'offer']]);
    K.D('⚠️ Something\'s wrong', [s[0], 'Every part of you says: this is the kind of adult Mom warned you about.'], [
      { t: 'Walk away, fast, toward lights and people', cls: 'safe', fn: () => { SH.st('stress', 20); SH.advance(10); K.D('Safe', 'You walk into the brightest place you can find and stand by the counter until your heart slows down. When you look out the window, they\'re gone.', [{ t: 'Okay', fn: () => streets(p) }]); } },
      { t: `Go into the diner and tell ${w}`, cls: 'safe', fn: () => { rep(p, 8); g.flags.creepDiner = w; SH.st('stress', 10); K.D('The diner', [`${w} is out the door before you've finished the sentence, with the cook behind her holding a spatula like a sword. ${s[1] === 'car' ? 'The car peels off.' : 'Whoever it was, they\'re gone.'}`, `She sits you in the back booth with a cocoa. "You come here anytime, you hear me? Anytime." ${r >= 20 ? 'She squeezes your shoulder.' : ''}`, 'She also writes down the plate number and calls it in. Not about you. About him.'], [{ t: 'Okay', fn: () => streets(p) }]); } },
      { t: '"My dad\'s right over there."', fn: () => { const ok = K.chance(0.75); SH.st('stress', ok ? 12 : 25); K.D(ok ? 'Gone' : 'Run', ok ? 'You wave at a random man across the street. He waves back, confused. It\'s enough. They leave.' : 'They look where you pointed and then back at you, and you realize they don\'t believe you, so you run and don\'t stop until you\'re inside a gas station with a very large clerk.', [{ t: 'Okay', fn: () => streets(p) }]); } }]);
  }
  K.hub((p, ch) => { if (p.tier !== 'village') ch.push({ t: '🌃 Side streets', sub: p.tier === 'small' ? 'The diner' : 'Diner, stall, pawn shop, and people who don\'t ask', fn: () => streets(p) }); });
  K.daily.push(() => { if (G().flags) G().flags.creepToday = 0; });
  SH.Alley = { streets, diner, dealer, creep, rep };
})(window.SH);
