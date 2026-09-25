/* SMALL HOURS — work before the run: odd jobs (gigs) and little businesses with stock, prices, demand and risk.
   Money is the one number the game shows plainly — because a kid counting dollars is the point. */
(function (SH) {
  const U = SH.util, D = (o) => SH.UI.dialog(o), log = (t, c) => SH.UI.log(t, c || 'sys');
  const J = SH.Jobs = {};
  J.state = () => { const G = SH.G; return (G.biz = G.biz || { candy: { stock: 0, rep: 0, sold: 0, heat: 0, ban: 0 }, art: { stock: 0, rep: 0, sold: 0 }, stand: { cups: 0, runs: 0 }, carry: { rep: 0, runs: 0 }, cans: 0, earned: 0, week: {}, ledger: [], rival: 0 }); };
  J.earn = function (amt, what) {
    const G = SH.G, B = J.state(); amt = Math.round(amt * 100) / 100; if (amt <= 0) return 0;
    SH.money(amt); G.tx.push({ t: G.t, d: what, a: amt }); B.earned += amt; const wk = Math.floor((SH.day() - 1) / 7); B.week[wk] = (B.week[wk] || 0) + amt;
    B.ledger.push({ t: G.t, d: what, a: amt }); if (B.ledger.length > 60) B.ledger.shift(); return amt;
  };
  J.spend = function (amt, what) { const G = SH.G; if (G.money < amt) { log('You count your money twice. Not enough.', 'warn'); return false; } SH.money(-amt); G.tx.push({ t: G.t, d: what, a: -amt }); J.state().ledger.push({ t: G.t, d: what, a: -amt }); return true; };
  const wet = () => ['rain', 'storm'].includes(SH.cond());
  const weekend = () => !SH.isWeekday();
  const cool = (k, days) => { const G = SH.G, c = (G.biz.cool = G.biz.cool || {}); if (c[k] != null && G.t - c[k] < days * 1440) return false; return true; };
  const setCool = (k) => { const G = SH.G; (G.biz.cool = G.biz.cool || {})[k] = G.t; };
  const lunch = () => { const h = SH.hour(); return SH.isWeekday() && ((h >= 11 && h < 13.5) || (h >= 15 && h < 15.9)); };
  const repWord = (r) => r < 1 ? 'nobody knows yet' : r < 4 ? 'a few kids know' : r < 8 ? 'people come looking for you' : 'you\'re kind of famous for it';
  J.repWord = repWord;

  /* ---------------- odd jobs ---------------- */
  J.GIGS = [
    { id: 'rake', flag: 'gigRake', loc: 'home', label: 'Rake Mr. Henderson\'s leaves', sub: '~90 min · $10–14', days: 2,
      when: () => !wet() && SH.G.phase === 'home' && (weekend() ? SH.hour() >= 9 && SH.hour() < 17 : SH.hour() >= 15.5 && SH.hour() < 18),
      run: () => { SH.advance(90, { exert: 3, interrupt: false }); SH.st('hyg', -8); const pay = U.ri(10, 14) + (SH.tempF() < 45 ? 2 : 0); J.earn(pay, 'Raking — Henderson');
        log(U.pick([`Forty-one bags of leaves. Mr. Henderson inspects the lawn like a general, then peels $${pay} off a folded roll. "Good stripes," he says, about the rake marks. From him that's a medal.`, `You rake. The wind un-rakes. You rake again. Mr. Henderson brings out a mug of cider halfway through and doesn't say anything, which is the nicest thing he's ever done. $${pay}.`]), 'good'); } },
    { id: 'groc', loc: 'store', label: 'Carry groceries for tips', sub: '30 min · tips', days: 0.2, when: () => SH.hour() >= 9 && SH.hour() < 20,
      run: () => { SH.advance(30, { exert: 2, interrupt: false }); const tip = SH.G.s.hyg < 30 ? U.ri(0, 1) : U.pick([0, 1, 2, 2, 3, 5]); if (tip) J.earn(tip, 'Grocery tips');
        log(tip ? U.pick([`An old lady with four bags and a cane lets you carry them to her Buick. She presses $${tip} into your hand and says you remind her of her grandson, "before he got an attitude."`, `A dad juggling a baby and a case of water. You take the water. He gives you $${tip} and a look like you saved his life.`]) : 'Two people say "I\'m fine, thanks" like you tried to steal something. Raj gives you a free slushie for trying.', tip ? 'good' : 'sys'); } },
    { id: 'cans', loc: ['park', 'mall', 'school'], label: 'Collect cans and bottles', sub: '40 min · 10¢ each at QuikMart', days: 0.3, when: () => SH.hour() >= 7 && SH.hour() < 20,
      run: () => { SH.advance(40, { exert: 1.5, interrupt: false }); const n = U.ri(5, 12) + (weekend() && SH.G.loc === 'park' ? U.ri(4, 10) : 0); J.state().cans += n; SH.st('hyg', -5);
        log(`You fish ${n} cans and bottles out of trash cans and from under bleachers. Sticky. A woman watches you like you're a raccoon. Worth ${(n * 0.1).toFixed(2)} dollars. Probably.`, 'sys'); } },
    { id: 'redeem', loc: 'store', label: 'Return cans at the machine', sub: () => J.state().cans + ' cans', days: 0, when: () => J.state().cans > 0,
      run: () => { const B = J.state(), n = B.cans; B.cans = 0; SH.advance(10, { interrupt: false }); J.earn(n * 0.1, 'Can deposits'); log(`The reverse vending machine eats ${n} cans one at a time, judging each one. It spits out a slip for $${(n * 0.1).toFixed(2)}. Raj pays it out in dimes, grinning.`, 'good'); } },
    { id: 'flyers', flag: 'gigFlyers', loc: 'diner', label: 'Hand out flyers for Dolores', sub: '2 hrs · $15', days: 1, when: () => weekend() && SH.hour() >= 10 && SH.hour() < 16 && !wet() && SH.G.phase === 'home',
      run: () => { SH.advance(120, { exert: 3, interrupt: false }); J.earn(15, 'Flyers — Nite Owl'); SH.rel('dolores', 6); log('"NITE OWL DINER — HALLOWEEN PIE WEEK." Two hundred flyers. You put one under every windshield wiper on Mill Rd and hand the rest to people who take them like you handed them a live fish. Dolores pays you $15 and a slice of pie.', 'good'); SH.st('full', 12); } },
    { id: 'carwash', flag: 'gigCarwash', loc: 'school', label: 'Car wash with Jordan', sub: '3 hrs · split tips', days: 6, when: () => SH.wd() === 5 && SH.hour() >= 10 && SH.hour() < 14 && !wet(),
      run: () => { SH.advance(180, { exert: 3, interrupt: false }); const t = SH.tempF(), pay = Math.max(5, Math.round((t - 35) * 0.45 + U.ri(0, 6))); J.earn(pay, 'Car wash (half)'); SH.rel('jordan', 6); SH.st('mood', 10); SH.st('stress', -8); SH.st('hyg', 6);
        log(t < 50 ? `It is too cold to be doing this. Your fingers go numb. Jordan sprays a minivan, a mail truck, and accidentally a man. You split $${pay * 2}. Best day in weeks.` : `Jordan holds a sign that says "CAR WASH (WE TRY OUR BEST)". It works. Suds everywhere. You split $${pay * 2} and a gas-station pizza on the curb afterward.`, 'good'); } },
    { id: 'shelve', loc: 'library', label: 'Volunteer shelving books', sub: '1 hr · no pay', days: 1, when: () => SH.isOpen('library'),
      run: () => { SH.advance(60, { interrupt: false }); SH.st('stress', -8); SH.st('mood', 5); SH.rel('okafor', 1); SH.flag('ruizFriend'); log('Ms. Ruiz shows you the Dewey decimal system like it\'s a secret society. You shelve 900s (history) and find a book about a kid who sailed around the world alone. She gives you a granola bar and says you can come back anytime. "Anytime," she repeats.', 'good'); SH.st('full', 6); } },
  ];
  J.gigAvail = (g) => { const G = SH.G; const locs = [].concat(g.loc); if (!locs.includes(G.loc)) return false; if (g.flag && !SH.f(g.flag)) return false; if (!SH.isOpen(G.loc) && G.loc !== 'home' && G.loc !== 'park') return false; return (!g.when || g.when()) && (!g.days || cool(g.id, g.days)); };

  /* ---------------- businesses ---------------- */
  J.buyCandy = () => { if (J.spend(8, 'Bulk candy box')) { J.state().candy.stock += 24; SH.advance(5, { interrupt: false }); log('A bulk box of 24 assorted candy bars from the back shelf. Raj raises an eyebrow. "Big night?" "Business," you say. He respects it.', 'sys'); } };
  J.sellCandy = function () {
    const B = J.state(), c = B.candy;
    D({ title: 'Lunch Rush', text: [`You have ${c.stock} candy bars in your backpack. Word at school: ${repWord(c.rep)}.`, B.rival > SH.day() ? 'Devon is selling Takis by the water fountain. At fifty cents. Traitor.' : 'Mr. Dale is on hall duty. He\'s eating a sad sandwich and scanning the room.'],
      choices: [0.5, 1, 1.5, 2].map((p) => ({ t: `Sell at $${p.toFixed(2)}`, sub: p === 0.5 ? 'Cheap. Moves fast. Thin profit.' : p === 1 ? 'Fair.' : p === 1.5 ? 'Premium.' : 'Bold.', fn: () => J.doSellCandy(p) })).concat([{ t: 'Not today', fn: () => {} }]) });
  };
  J.doSellCandy = function (price) {
    const G = SH.G, B = J.state(), c = B.candy;
    if (c.lastT != null) c.heat *= Math.pow(0.55, (G.t - c.lastT) / 1440); c.lastT = G.t;
    SH.advance(25, { interrupt: false });
    let base = 5 + c.rep * 0.7 + (SH.wd() === 4 ? 3 : 0) + (wet() ? 3 : 0) + U.ri(-2, 3); if (B.rival > SH.day()) base *= price <= 0.5 ? 0.8 : 0.5;
    const mult = { 0.5: 1.5, 1: 1, 1.5: 0.65, 2: 0.38 }[price]; let sold = Math.max(0, Math.min(c.stock, Math.round(base * mult)));
    c.stock -= sold; c.sold += sold; c.rep = U.clamp(c.rep + (price <= 1 ? 0.8 : price >= 2 ? -0.5 : 0.3) + sold * 0.05, 0, 12); c.heat += sold * 0.7;
    if (sold) J.earn(sold * price, 'Candy sales');
    if (U.chance(Math.min(0.6, c.heat / 55))) {
      const lost = c.stock; c.stock = 0; c.heat = 0; c.ban = SH.day() + 3; SH.flag('candyCaught'); SH.susp(10, 'school called about selling candy');
      return log(`You sell ${sold} before a shadow falls over your backpack. Mr. Dale. "Is this a school or a Costco?" He confiscates ${lost ? 'the other ' + lost : 'your empty box'} and writes something on a pink slip. The pink slip is going home.`, 'bad');
    }
    log(sold === 0 ? 'Nobody bites. A kid asks if you take Skyforge gems. You do not.' : U.pick([`${sold} sold. $${(sold * price).toFixed(2)} in crumpled bills and one very sticky quarter.`, `A line forms. An actual line. ${sold} gone in twelve minutes. Maddie calls you "the candy dealer" and you pretend to hate it.`, `${sold} sold. A sixth grader tries to pay you in Pokémon cards. You consider it.`]), sold ? 'good' : 'sys');
  };
  J.draw = function () {
    const G = SH.G, B = J.state(); const n = 1 + (G.story && G.story.trait === 'artist' ? 1 : 0);
    if (B.art.stock >= 6) { log('You already have ' + B.art.stock + ' drawings nobody has bought yet. Sell some before your sketchbook runs out of pages.', 'sys'); return; }
    SH.advance(60, { interrupt: true }); B.art.stock = Math.min(6, B.art.stock + n); SH.st('stress', -6); SH.st('mood', 5);
    log(U.pick(['A Skyforge dragon mid-roar, with the ice wyrm\'s scales done in blue pen. It\'s good. It\'s actually good.', 'Maddie\'s cat as a knight. Devon as a wizard (he asked for "cool," you gave him "cool but kind of a nerd").', 'You draw until your hand cramps and the house noise disappears. For an hour, you\'re just someone who draws.']) + (n > 1 ? ' You finish two.' : ''), 'good');
  };
  J.sellArt = function () {
    const B = J.state(), a = B.art; SH.advance(20, { interrupt: false });
    const want = Math.min(a.stock, Math.max(0, Math.round(1 + a.rep * 0.35 + U.ri(-1, 2)))), price = a.rep >= 6 ? 5 : a.rep >= 3 ? 4 : 3;
    a.stock -= want; a.sold += want; a.rep = Math.min(12, a.rep + want * 0.6);
    if (want) { J.earn(want * price, 'Drawings'); if (a.rep >= 3 && !SH.f('artBuzz')) { SH.flag('artBuzz'); SH.Phone.push('class', 'class', 'priya.draws: ok ' + SH.G.name.toLowerCase() + '\'s dragon is actually fire. i\'m not jealous. i\'m a little jealous'); } }
    log(want ? `${want} drawing${want > 1 ? 's' : ''} sold at $${price}. A girl in 7C tapes yours inside her locker. You walk past it twice.` : 'Everyone says "omg so good" and nobody has money. Classic.', want ? 'good' : 'sys');
  };
  J.buyStand = () => { if (J.spend(6, 'Drink stand supplies')) { J.state().stand.cups += 20; SH.advance(5, { interrupt: false }); log('Cocoa mix, lemonade powder, 20 paper cups and a Sharpie for the sign. You are now a small business.', 'sys'); } };
  J.runStand = function () {
    const G = SH.G, B = J.state(), t = SH.tempF(), cocoa = t < 58;
    D({ title: cocoa ? 'Hot Cocoa Stand' : 'Lemonade Stand', text: [`${B.stand.cups} cups. ${t}°F, ${SH.cond()}. ${cocoa ? 'Cold enough that people want something warm.' : t > 66 ? 'Warm enough for lemonade.' : 'Nobody wants either very much today.'}`, SH.lilyWhere() === 'home' ? 'Lily begs to come. She has made a sign with a turtle on it.' : ''].filter(Boolean),
      choices: [1, 2, 3].map((p) => ({ t: `$${p} a cup`, fn: () => J.doStand(p, cocoa) })).concat([{ t: 'Pack up', fn: () => {} }]) });
  };
  J.doStand = function (price, cocoa) {
    const G = SH.G, B = J.state(), t = SH.tempF(), lily = SH.lilyWhere() === 'home';
    SH.advance(120, { exert: 1, interrupt: false });
    let base = cocoa ? 8 + (58 - t) * 0.35 : t > 66 ? 6 + (t - 66) * 0.5 : 4; if (wet()) base = 1.5; if (lily) base *= 1.35; base += U.ri(-2, 3);
    const mult = { 1: 1.3, 2: 0.9, 3: 0.55 }[price]; const sold = Math.max(0, Math.min(B.stand.cups, Math.round(base * mult))); B.stand.cups -= sold; B.stand.runs++;
    let tip = U.chance(0.25) ? U.pick([1, 2, 5]) : 0; J.earn(sold * price + tip, cocoa ? 'Cocoa stand' : 'Lemonade stand');
    if (lily) { SH.rel('lily', 8); SH.flag('lilyStand'); }
    log((sold ? `${sold} cups at $${price}. ` : 'Zero cups. ') + U.pick([tip ? `A jogger drops $${tip} in the jar and doesn't take a drink. "For the sign."` : 'A cop buys one, says "good hustle," and gives it a thumbs-up like it\'s a crime scene he approves of.', 'The wind knocks your sign over three times. The fourth time you tape it to a trash can.', lily ? 'Lily yells "COCOA! LEMONADE! TURTLE!" at every single person. It works terrifyingly well.' : 'A dog steals a cup. Its owner pays for it.']), sold ? 'good' : 'sys');
  };
  J.carry = function () {
    const G = SH.G, B = J.state(), c = B.carry;
    if (G.phone.bat < 15) return log('Phone\'s too low to play. Skyforge eats battery like it\'s its job.', 'warn');
    SH.advance(60, { interrupt: true }); G.phone.bat = Math.max(0, G.phone.bat - 14); c.runs++; if (SH.isWeekday()) G.grades = Math.max(0, G.grades - 0.6);
    const pay = Math.min(9, 3 + Math.floor(c.rep / 2)); c.rep = Math.min(12, c.rep + 1);
    if (U.chance(0.15)) return log('You carry a sixth grader through the whole Ice Wyrm raid. He says he\'ll pay you "tomorrow for sure." He blocks you in the group chat twenty minutes later. Lesson learned.', 'bad');
    J.earn(pay, 'Skyforge carries'); SH.st('stress', -4); log(`You get "xX_Devon_Xx" past the Ice Wyrm. He screams so loud through the mic you have to turn it down. $${pay} on the way.`, 'good');
  };

  /* ---------------- actions ---------------- */
  const baseList = SH.Actions.list;
  SH.Actions.list = function () {
    const out = baseList.apply(this, arguments), G = SH.G, a = out.acts, B = J.state(), L = G.loc, h = SH.hour();
    const act = (label, sub, fn, o) => Object.assign({ label, sub: typeof sub === 'function' ? sub() : sub, fn: () => { fn(); if (!SH.UI.modalOpen()) SH.UI.afterAction(); } }, o || {});
    J.GIGS.forEach((g) => { if (J.gigAvail(g)) a.push(act('💼 ' + g.label, g.sub, () => { setCool(g.id); g.run(); }, { cls: 'job' })); });
    if (G.phase !== 'home') return out;
    if (L === 'store' && SH.isOpen('store')) {
      if (SH.f('bizCandy')) a.push(act('💼 Buy bulk candy to resell', '$8 · 24 bars', J.buyCandy, { cls: 'job' }));
      if (SH.f('bizStand')) a.push(act('💼 Buy drink-stand supplies', '$6 · 20 cups', J.buyStand, { cls: 'job' }));
    }
    if (L === 'school' && SH.isOpen('school') && lunch()) {
      if (B.candy.stock > 0) a.push(act('💼 Sell candy', B.candy.ban > SH.day() ? 'Mr. Dale is watching you specifically' : B.candy.stock + ' bars', J.sellCandy, { cls: B.candy.ban > SH.day() ? 'hot job' : 'job' }));
      if (B.art.stock > 0) a.push(act('💼 Sell drawings', B.art.stock + ' ready', J.sellArt, { cls: 'job' }));
    }
    if (L === 'home' && (G.room || 'bedroom') === 'bedroom') {
      if (SH.f('bizArt') && (SH.inStash('sketchbook') || SH.has('sketchbook'))) a.push(act('💼 Draw commissions', '1 hr · ' + B.art.stock + ' ready to sell', J.draw, { cls: 'job' }));
      if (SH.f('bizCarry') && h >= 15.5 && h < 23 && !G.phone.confiscated) a.push(act('💼 Skyforge carries for classmates', '1 hr · battery', J.carry, { cls: 'job' }));
    }
    if (L === 'park' && B.stand.cups > 0 && weekend() && h >= 10 && h < 17) a.push(act('💼 Run your drink stand', '2 hrs · ' + B.stand.cups + ' cups', J.runStand, { cls: 'job' }));
    return out;
  };
})(window.SH);
