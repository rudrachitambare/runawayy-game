/* SMALL HOURS — Part 5d: a group business (one per town you're in, G.biz[placeId]).
   Pick a kind, name it (free text), give everyone a role (make / sell / lookout). Each shift is 3 hours.
   Profit depends on the town size, how many of you, roles, and luck. Problems happen: rain, a grumpy neighbor, running out
   of supplies, a customer with too many questions, a cop stopping by (the police excuse conversation).
   Money goes to your cash, or half into the group jar (SH.Bank.crewAdd). Honest work only. */
(function (SH) {
  const K = SH.K, A = SH.Atlas; if (!K || !A) return;
  const G = K.G;
  const KINDS = {
    lemonade: { n: 'Lemonade / cocoa stand', i: '🍋', cost: 10, base: 14, tiers: ['village', 'small', 'town', 'city'], d: 'Cocoa when it\'s cold, lemonade when it isn\'t.' },
    carwash: { n: 'Car wash', i: '🧽', cost: 8, base: 22, tiers: ['small', 'town', 'city'], need: 'bucket', d: 'Gas station lot, a hose, a hand-painted sign.' },
    dogs: { n: 'Dog walking', i: '🐕', cost: 0, base: 16, tiers: ['village', 'small', 'town'], d: 'Flyers on the grocery board. Dogs don\'t ask questions.' },
    leaves: { n: 'Yard work', i: '🍂', cost: 0, base: 18, tiers: ['village', 'small', 'town'], need: 'broom', d: 'Raking, sweeping, hauling. Knock on doors.' },
    art: { n: 'Bracelet & drawing stall', i: '🎨', cost: 6, base: 15, tiers: ['town', 'city'], d: 'Friendship bracelets and five-dollar portraits.' },
    fix: { n: 'Phone & bike fix-it table', i: '🔧', cost: 5, base: 24, tiers: ['city', 'town'], d: 'Cracked screens you can\'t fix, bike chains you can.' },
  };
  const ROLES = { make: 'Makes the stuff', sell: 'Talks to customers', look: 'Watches for trouble' };
  const members = () => ['me'].concat(K.party());
  const nm = (id) => (id === 'me' ? 'You' : K.nm(id));
  const biz = (p) => { const g = G(); g.biz = g.biz || {}; return g.biz[p.id]; };
  const TIER = { village: 0.6, small: 0.8, town: 1, city: 1.3 };
  function menu(p) {
    const b = biz(p); if (!b) return pickKind(p);
    const k = KINDS[b.kind];
    K.D(`${k.i} ${b.name}`, [`${k.n} in ${p.name}. ${b.shifts} shift${b.shifts === 1 ? '' : 's'} so far, $${b.total} earned.`, 'Roles: ' + members().map((id) => `${nm(id)} (${b.roles[id] || 'unassigned'})`).join(', ') + '.'], [
      { t: 'Run a shift (3 hours)', cls: 'job', sub: SH.hour() < 8 || SH.hour() >= 18 ? 'Nobody\'s out right now' : `Supplies: $${k.cost}`, fn: () => shift(p) },
      { t: 'Change roles', fn: () => roles(p) },
      { t: 'Close the business', fn: () => { G().biz[p.id] = null; K.back(); } },
      { t: 'Back', fn: K.back }]);
  }
  function pickKind(p) {
    const L = Object.entries(KINDS).filter(([, k]) => k.tiers.includes(p.tier));
    K.D(`Start a business in ${p.name}`, ['Everybody pitches in. Kids with a business look like kids with a business: not like runaways.', K.grp() === 1 ? 'You could do this alone. It\'s better with a group.' : ''].filter(Boolean),
      L.map(([id, k]) => ({ t: `${k.i} ${k.n}`, sub: `${k.d}${k.need ? ` Needs a ${k.need}.` : ''}`, fn: () => { if (k.need && !(G().bag.includes('x_' + k.need) || (G().owned || []).includes('x_' + k.need))) return K.D('Missing something', `You need a ${k.need} first. Hardware stores have them.`, [{ t: 'Okay', fn: () => pickKind(p) }]);
        K.ask('Name it', [`What's it called? It goes on the sign.`], 'Sam & Co.', (name) => { G().biz = G().biz || {}; G().biz[p.id] = { kind: id, name: name.slice(0, 32), roles: {}, shifts: 0, total: 0, pid: p.id }; setTimeout(() => roles(p), 30); }); } })).concat([{ t: 'Back', fn: K.back }]));
  }
  function roles(p, i = 0) {
    const b = biz(p), ms = members(); if (i >= ms.length) return menu(p);
    K.D('Roles', `${nm(ms[i])}: what ${ms[i] === 'me' ? 'do you' : 'do they'} do?`, Object.entries(ROLES).map(([r, d]) => ({ t: r === 'make' ? 'Make' : r === 'sell' ? 'Sell' : 'Lookout', sub: d, fn: () => { b.roles[ms[i]] = r; roles(p, i + 1); } })));
  }
  function shift(p) {
    const g = G(), b = biz(p), k = KINDS[b.kind], h = SH.hour();
    if (h < 8 || h >= 18) return K.D('Too late', 'Nobody buys lemonade in the dark. Come back in the morning.', [{ t: 'Okay', fn: () => menu(p) }]);
    if (k.cost && !K.pay(k.cost, `${b.name} supplies`)) return menu(p);
    const R = Object.values(b.roles), has = (r) => R.includes(r), n = members().length;
    SH.advance(180, { interrupt: false }); if (g.ended) return;
    const w = SH.weatherDay ? SH.weatherDay() : {}, rain = /rain|storm/.test(w.c || '');
    let mult = TIER[p.tier] * (1 + 0.25 * (n - 1)) * (has('make') ? 1.15 : 0.85) * (has('sell') ? 1.2 : 0.9) * (0.75 + Math.random() * 0.6) * (1 + Math.min(0.3, b.shifts * 0.03));
    let prob = null;
    const r = Math.random();
    if (rain && b.kind !== 'fix') { mult *= 0.35; prob = 'Rain. Three hours under a dripping awning and four customers, one of whom was a dog.'; }
    else if (r < 0.08) { mult *= 0.5; prob = 'You run out of supplies halfway through.'; }
    else if (r < 0.15) { mult *= 0.7; prob = 'A neighbor comes out in a bathrobe to tell you that you\'re "blocking the sidewalk." You move three feet. She\'s satisfied.'; }
    else if (r < 0.22 && !has('look')) { g.awayNotice = (g.awayNotice || 0) + 15; prob = 'A customer asks where you all go to school. And which church. And what your last names are. Nobody was watching for that kind of customer.'; }
    const earn = Math.max(1, Math.round(k.base * mult));
    b.shifts++; b.total += earn; SH.st('mood', 5); SH.st('energy', -12); (g.skills = g.skills || {}).business = Math.min(100, (g.skills.business || 0) + 3);
    K.party().forEach((id) => SH.Group && SH.Group.att(id, 2));
    const pay = [{ t: `Keep the $${earn}`, fn: () => { SH.money(earn); after(p); } }];
    if (SH.Bank && SH.Bank.crewAdd && g.crew) pay.push({ t: `Half in the group jar ($${Math.floor(earn / 2)})`, fn: () => { SH.money(earn - Math.floor(earn / 2)); try { SH.money(Math.floor(earn / 2)); SH.Bank.crewAdd(Math.floor(earn / 2), 'cash'); } catch (e) {} after(p); } });
    K.D(`${k.i} ${b.name}: shift ${b.shifts}`, [K.pick([`${K.grp() > 1 ? K.nm(K.party()[0]) + ' does a voice for every customer.' : 'You get into a rhythm.'} By the end you're a machine.`, 'A man buys three and tips a dollar "for the hustle."', 'A little kid pays entirely in nickels. It takes a while. It\'s worth it.']), prob, `Made $${earn}.`].filter(Boolean), pay);
  }
  function after(p) { if (K.chance(0.12 + (G().heat || 0) / 400) && p.tier !== 'village' && SH.Police) return SH.Police.stop(p, 'business', () => menu(p)); menu(p); }
  K.hub((p, ch, dark) => { if (dark) return; const b = biz(p); ch.push({ t: b ? `${KINDS[b.kind].i} ${b.name}` : '💼 Start a business', sub: b ? `Your ${KINDS[b.kind].n.toLowerCase()} · $${b.total} so far` : 'Stand, car wash, dog walking, yard work…', fn: () => menu(p) }); });
  SH.Biz = { KINDS, menu, shift, biz };
})(window.SH);
