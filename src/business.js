/* SMALL HOURS — Part 5d: a kid business (one per town you're in, G.biz[placeId]).
   Turn 50 rewrite: every kind has its own jobs, its own hours, its own problems and its own good moments.
   No more "nobody buys lemonade in the dark" for dog walking, "a customer buys three" for yard work, or
   "run out of supplies" for things that don't use supplies.
   SOLO: no role screen; you do everything (make and sell), and you have to keep half an eye out yourself.
   TEAM: each person gets a role named for the actual work (walks the dogs / knocks on doors / keeps watch);
   doubling up on a role still helps, just less. You carry the group's money (it pays for everyone), or put half in the group jar.
   Money: cash, or half of your cut into the group jar (only if you have one). Honest work only. */
(function (SH) {
  const K = SH.K, A = SH.Atlas; if (!K || !A) return;
  const G = K.G;
  // roles: make / sell / look, but each kind names them for what they are
  const KINDS = {
    lemonade: { n: 'Lemonade / cocoa stand', i: '🍋', cost: 10, supplies: 'cups, mix, a thermos', base: 14, tiers: ['village', 'small', 'town', 'city'], hours: [9, 18], unit: 'cup', d: 'Cocoa when it\'s cold, lemonade when it isn\'t.',
      roles: { make: 'Mixes and pours', sell: 'Waves people over', look: 'Keeps watch' },
      dark: 'Nobody stops for a cup of anything once it\'s dark. Come back in the morning.',
      rain: 'Rain. You move the stand under the laundromat awning. Four customers, one of whom wanted directions.',
      good: ['A man buys three cups and tips a dollar "for the hustle."', 'A little kid pays entirely in nickels. It takes a while. It\'s worth it.', 'A mail carrier buys one on the way in and one on the way back.'],
      probs: [['out', 'You run out of cups halfway through and have to wash the same six in a bucket.'], ['neighbor', 'A neighbor in a bathrobe says you\'re "blocking the sidewalk." You move the table three feet. She\'s satisfied.']] },
    carwash: { n: 'Car wash', i: '🧽', cost: 8, supplies: 'soap and sponges', base: 22, tiers: ['small', 'town', 'city'], need: 'bucket', hours: [9, 17], unit: 'car', d: 'Gas station lot, a hose, a hand-painted sign.',
      roles: { make: 'Scrubs', sell: 'Holds the sign by the road', look: 'Keeps watch' },
      dark: 'You can\'t see the dirt in the dark, and nobody wants a car wash at night.',
      rain: 'Rain. Nobody pays to wash a car while it\'s getting rained on. You wash one truck, for a guy who says he likes to support "go-getters."',
      good: ['A pickup covered in field mud. It takes three buckets. The farmer pays double.', 'A lady in a minivan watches the whole time and tips you in granola bars and cash.', 'You get a rhythm going: soap, scrub, rinse, dry, wave.'],
      probs: [['out', 'The soap runs out halfway through and the last two cars get "a very thorough rinse."'], ['owner', 'The gas station manager says you can stay if you stop splashing his ice machine. You stop splashing his ice machine.']] },
    dogs: { n: 'Dog walking', i: '🐕', cost: 0, base: 16, tiers: ['village', 'small', 'town'], hours: [7, 19], unit: 'dog', d: 'Flyers on the grocery board. Dogs don\'t ask questions.',
      roles: { make: 'Walks the dogs', sell: 'Knocks on doors, talks to owners', look: 'Keeps watch' },
      dark: 'Owners don\'t hand their dog to a kid after dark. Fair.',
      rain: 'Rain. Half the owners cancel. The dogs who do come out are thrilled about it. You are not.',
      good: ['A beagle named Captain pulls you three blocks toward a squirrel and you let him win.', 'An old man pays you and then asks if you can come back Thursday. Same time. Same dog.', 'Two dogs, one leash tangle, one very good boy who sits every time you stop.'],
      probs: [['escape', 'A terrier slips his collar and you spend forty minutes and all your dignity getting him back.'], ['owner', 'One owner wants to "meet your parents first." You say they\'re at work. She keeps her dog.']] },
    leaves: { n: 'Yard work', i: '🍂', cost: 0, base: 18, tiers: ['village', 'small', 'town'], need: 'broom', hours: [8, 17], unit: 'yard', d: 'Raking, sweeping, hauling. Knock on doors.',
      roles: { make: 'Rakes and hauls', sell: 'Knocks on doors', look: 'Keeps watch' },
      dark: 'You can\'t rake what you can\'t see. Tomorrow.',
      rain: 'Rain. Wet leaves weigh about a hundred pounds each. You do one yard and your arms quit.',
      good: ['A woman pays you and then brings out lemonade, which feels like a trade secret.', 'You make one giant pile, and for about four seconds you all forget and jump in it.', 'A retired guy supervises from his porch and pays extra "for putting up with me."'],
      probs: [['neighbor', 'A man says his son "does the yard" and closes the door. His yard has not been done since August.'], ['tired', 'The third yard has a hill. You finish it, barely.']] },
    art: { n: 'Bracelet & drawing stall', i: '🎨', cost: 6, supplies: 'thread and paper', base: 15, tiers: ['town', 'city'], hours: [10, 19], unit: 'piece', d: 'Friendship bracelets and five-dollar portraits.',
      roles: { make: 'Makes bracelets and portraits', sell: 'Talks to people walking by', look: 'Keeps watch' },
      dark: 'The good foot traffic is gone once it\'s dark. So is the light for drawing.',
      rain: 'Rain. You pack up the drawings before they run. You sell two bracelets from under a bus shelter.',
      good: ['A teenage girl buys four bracelets "for my whole friend group" and wears all four.', 'A man sits for a portrait and says it looks exactly like him, which is generous.', 'Someone asks if you take commissions. You say yes before you know what that means.'],
      probs: [['out', 'You run out of the good thread and start making "minimalist" bracelets.'], ['owner', 'A shop owner says you can\'t set up in front of his window. You move to the corner.']] },
    fix: { n: 'Bike fix-it table', i: '🔧', cost: 5, supplies: 'patches, chain oil, zip ties', base: 24, tiers: ['city', 'town'], hours: [9, 18], unit: 'bike', d: 'Flat tires, loose chains, squeaky brakes. Things you can actually fix.',
      roles: { make: 'Does the fixing', sell: 'Flags down riders', look: 'Keeps watch' },
      dark: 'You can\'t find a pinhole in a tube in the dark. Nobody rides by to ask, either.',
      rain: 'Rain. Fewer riders, more rusty chains. You oil four and get grease up to your elbows.',
      good: ['A delivery rider with a flat, a deadline, and a twenty. You patch it in six minutes.', 'A kid your age brings a bike with a chain that\'s "just broken." It\'s just off. You put it back on for free.', 'You fix a squeak that a man says has been "driving him insane since spring."'],
      probs: [['out', 'You run out of patches and have to send a flat tire away. It hurts.'], ['hard', 'A bent wheel. Out of your league. You tell the guy honestly, and he tips you anyway for not pretending.']] },
  };
  const members = () => ['me'].concat(K.party());
  const solo = () => members().length === 1;
  const nm = (id) => (id === 'me' ? 'You' : K.nm(id));
  const biz = (p) => { const g = G(); g.biz = g.biz || {}; return g.biz[p.id]; };
  const TIER = { village: 0.6, small: 0.8, town: 1, city: 1.3 };
  const open = (k) => { const h = SH.hour(); return h >= k.hours[0] && h < k.hours[1]; };
  const fmtH = (h) => `${((h + 11) % 12) + 1} ${h < 12 ? 'AM' : 'PM'}`;
  const roleTxt = (b, k, id) => (b.roles[id] ? k.roles[b.roles[id]] : 'no job yet');

  function menu(p) {
    const b = biz(p); if (!b) return pickKind(p);
    const k = KINDS[b.kind]; if (!k) { G().biz[p.id] = null; return pickKind(p); }
    const lines = [`${k.n} in ${p.name}. ${b.shifts} shift${b.shifts === 1 ? '' : 's'} so far, $${b.total} earned.`];
    if (solo()) lines.push('It\'s just you: you do the work, find the customers, and keep half an eye out.');
    else lines.push(members().map((id) => `${nm(id)}: ${roleTxt(b, k, id).toLowerCase()}`).join(' · ') + '.');
    const ch = [{ t: 'Run a shift (3 hours)', cls: 'job', sub: !open(k) ? `Open ${fmtH(k.hours[0])}–${fmtH(k.hours[1])}` : k.cost ? `Supplies: $${k.cost} (${k.supplies})` : 'No supplies needed', fn: () => shift(p) }];
    if (!solo()) ch.push({ t: 'Change who does what', fn: () => roles(p) });
    ch.push({ t: 'Close the business', fn: () => K.D('Close it?', `${b.name} is done in ${p.name}. You can start something new here later.`, [{ t: 'Close it', fn: () => { G().biz[p.id] = null; K.back(); } }, { t: 'Keep it', fn: () => menu(p) }]) });
    ch.push({ t: 'Back', fn: K.back });
    K.D(`${k.i} ${b.name}`, lines, ch);
  }
  function pickKind(p) {
    const L = Object.entries(KINDS).filter(([, k]) => k.tiers.includes(p.tier));
    const intro = solo() ? ['A kid with a business looks like a kid with a business: not like a runaway. It\'s harder alone, but everything you make is yours.'] : ['Everybody pitches in. Kids with a business look like kids with a business: not like runaways.'];
    K.D(`Start a business in ${p.name}`, intro,
      L.map(([id, k]) => ({ t: `${k.i} ${k.n}`, sub: `${k.d}${k.need ? ` Needs a ${k.need}.` : ''}${k.cost ? ` About $${k.cost} in supplies a shift.` : ''}`, fn: () => {
        if (k.need && !(G().bag.includes('x_' + k.need) || (G().owned || []).includes('x_' + k.need))) return K.D('Missing something', `You need a ${k.need} first. The hardware shelf at the gas station or a hardware store has them.`, [{ t: 'Okay', fn: () => pickKind(p) }]);
        const def = solo() ? `${G().name || 'Sam'}'s ${k.n.split(/[ /]/)[0]}` : `${G().name || 'Sam'} & Co.`;
        K.ask('Name it', ['What\'s it called? It goes on the sign.'], def, (name) => { G().biz = G().biz || {}; G().biz[p.id] = { kind: id, name: (name || def).slice(0, 32), roles: {}, shifts: 0, total: 0, pid: p.id }; setTimeout(() => (solo() ? menu(p) : roles(p)), 30); }); const inp = document.querySelector('#kask'); if (inp) { inp.value = def; inp.select && setTimeout(() => inp.select(), 40); }
      } })).concat([{ t: 'Back', fn: K.back }]));
  }
  function roles(p, i = 0) {
    const b = biz(p), k = KINDS[b.kind], ms = members(); if (solo() || i >= ms.length) return menu(p);
    K.D('Who does what?', `${nm(ms[i])}: what ${ms[i] === 'me' ? 'do you' : 'do they'} do?`, Object.entries(k.roles).map(([r, d]) => ({ t: d, sub: ms.filter((x, j) => j < i && b.roles[x] === r).map(nm).join(', ') ? `Already: ${ms.filter((x, j) => j < i && b.roles[x] === r).map(nm).join(', ')}` : '', fn: () => { b.roles[ms[i]] = r; roles(p, i + 1); } })));
  }
  function shift(p) {
    const g = G(), b = biz(p), k = KINDS[b.kind];
    if (!open(k)) return K.D('Not now', `${k.dark} (${fmtH(k.hours[0])}–${fmtH(k.hours[1])})`, [{ t: 'Okay', fn: () => menu(p) }]);
    if (!solo() && members().some((id) => !b.roles[id])) return K.D('Hang on', 'Not everybody knows what they\'re doing yet.', [{ t: 'Sort out who does what', fn: () => roles(p) }, { t: 'Back', fn: () => menu(p) }]);
    if (k.cost && !K.pay(k.cost, `${b.name} supplies`)) return menu(p);
    const n = members().length;
    // how many people on each job (solo: you're doing make + sell, and watching a little)
    const cnt = { make: 0, sell: 0, look: 0 };
    if (solo()) { cnt.make = 1; cnt.sell = 1; cnt.look = 0.5; } else members().forEach((id) => { cnt[b.roles[id]] = (cnt[b.roles[id]] || 0) + 1; });
    const staff = (c) => (c <= 0 ? 0.85 : 1 + 0.15 * Math.min(c, 1) + 0.07 * Math.max(0, c - 1)); // doubling up helps, less each time
    SH.advance(180, { interrupt: false }); if (g.ended) return;
    const w = SH.weatherDay ? SH.weatherDay() : {}, rain = /rain|storm/.test(w.c || '');
    let mult = TIER[p.tier] * (solo() ? 0.8 : 1 + 0.2 * (n - 1)) * staff(cnt.make) * staff(cnt.sell) * (0.75 + Math.random() * 0.6) * (1 + Math.min(0.3, b.shifts * 0.03));
    let prob = null; const r = Math.random();
    if (rain) { mult *= b.kind === 'fix' ? 0.7 : 0.35; prob = k.rain; }
    else if (r < 0.16) { const [pk, pt] = K.pick(k.probs); prob = pt; mult *= pk === 'out' ? 0.55 : pk === 'hard' ? 0.85 : 0.7; }
    else if (r < 0.23 && cnt.look < 1 && p.tier !== 'village') { g.awayNotice = (g.awayNotice || 0) + (cnt.look ? 8 : 15); prob = solo() ? 'A customer asks where you go to school. And what your last name is. You were busy and didn\'t see that kind of customer coming.' : 'A customer asks where you all go to school. And which church. And what your last names are. Nobody was watching for that kind of customer.'; }
    const earn = Math.max(1, Math.round(k.base * mult)), cut = earn;
    b.shifts++; b.total += earn; SH.st('mood', 5); SH.st('energy', b.kind === 'leaves' || b.kind === 'carwash' ? -16 : -10); (g.skills = g.skills || {}).business = Math.min(100, (g.skills.business || 0) + 3);
    K.party().forEach((id) => SH.Group && SH.Group.att(id, 2));
    const good = K.pick(k.good), lead = !solo() && K.party().find((id) => b.roles[id] === 'sell');
    const flavor = lead && Math.random() < 0.4 ? `${K.nm(lead)} is a natural with customers. ${good}` : good;
    const pay = [{ t: solo() ? `Keep the $${earn}` : `Hold onto the $${earn}`, sub: solo() ? '' : 'You carry the group\'s money. It pays for everyone\'s food and beds.', fn: () => { SH.money(cut); after(p); } }];
    if (SH.Bank && SH.Bank.crewAdd && g.crew && cut >= 2) pay.push({ t: `Put half in the group jar ($${Math.floor(cut / 2)})`, fn: () => { SH.money(cut); try { SH.Bank.crewAdd(Math.floor(cut / 2), 'cash'); } catch (e) {} after(p); } });
    K.D(`${k.i} ${b.name}: shift ${b.shifts}`, [rain ? null : flavor, prob, `Made $${earn}${solo() ? '' : ` together`}.`].filter(Boolean), pay);
  }
  function after(p) { if (K.chance(0.12 + (G().heat || 0) / 400) && p.tier !== 'village' && SH.Police) return SH.Police.stop(p, 'business', () => menu(p)); menu(p); }
  K.hub((p, ch, dark) => { if (dark) return; const b = biz(p), k = b && KINDS[b.kind]; ch.push({ t: k ? `${k.i} ${b.name}` : '💼 Start a business', sub: k ? `Your ${k.n.toLowerCase()} · $${b.total} so far` : 'Stand, car wash, dog walking, yard work…', fn: () => menu(p) }); });
  SH.Biz = { KINDS, menu, shift, biz };
})(window.SH);
