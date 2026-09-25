/* SMALL HOURS — what you can do, where (part 1: locations) */
(function (SH) {
  const U = SH.util;
  const A = SH.Actions = {};
  const act = A.act = (label, sub, fn, o) => Object.assign({ label, sub, fn }, o || {});
  const log = (t, c) => SH.UI.log(t, c);
  const done = A.done = () => SH.UI.afterAction();
  const spend = A.spend = (amt, what) => { if (SH.G.money < amt) { SH.UI.toast('Not enough money.'); return false; } SH.money(-amt); SH.G.tx.push({ t: SH.G.t, d: what, a: -amt }); return true; };
  const doTime = A.doTime = (m, o) => SH.advance(m, o || {});

  A.list = function () {
    const G = SH.G, L = G.loc, h = SH.hour(), out = { rooms: null, acts: [] }, a = out.acts;
    if (G.phase === 'home' && L === 'home') return A.home(out);
    if (G.phase === 'run' && L === 'home') a.push(act('Walk up to the front door', 'Go home.', () => SH.Endings.walkHome(), { cls: 'safe' }));
    switch (L) {
      case 'school':
        if (SH.isOpen('school') && G.phase === 'home') {
          if (h < 15) a.push(act('Go to class', h < 8.25 ? 'On time. Until 3 PM.' : 'You\'re late. Until 3 PM.', () => A.attend()));
          if (h >= 8 && h < 15.5) a.push(act('Visit Ms. Okafor (Room 204)', 'The counselor\'s door is half open.', () => SH.Talk.open('okafor', { ctx: 'drop', first: SH.f('toldCounselor') ? 'Hey, you. Come in. How are you holding up?' : 'Oh, hi, ' + G.name + '. Come in, sit. What\'s up?' }), { cls: 'safe' }));
          if (h >= 8 && h < 16) a.push(act('Find Jordan', 'He\'s usually by the vending machines.', () => SH.Talk.open('jordan', { first: 'yo. u look like u slept in a dumpster. affectionately.' })));
          if (h >= 15 && h < 16) a.push(act('Hang on the bleachers with Jordan', '45 min', () => { doTime(45); SH.st('mood', 6); SH.st('stress', -5); SH.rel('jordan', 3); log('You and Jordan rate every car in the pickup line out of ten. A minivan with flames painted on it gets an eleven.', 'good'); done(); }));
        } else a.push(act('The school is locked', 'Nothing to do here.', () => {}, { dis: true }));
        break;
      case 'store':
        if (SH.isOpen('store')) {
          [['hotdog', 2.5], ['granola', 1.5], ['chips', 1.75], ['apple', 1]].forEach(([id, p]) => a.push(act(`Buy ${SH.ITEMS[id].n}: $${p.toFixed(2)}`, SH.ITEMS[id].d, () => { if (spend(p, 'QuikMart')) { SH.addBag(id, true); log('You buy a ' + SH.ITEMS[id].n + '.', 'sys'); doTime(5); done(); } })));
          a.push(act('Pocket a granola bar', 'Stealing. The clerk has a mirror.', () => A.shoplift(), { cls: 'hot' }));
          a.push(act('Use the restroom sink', '+hygiene', () => { doTime(10); SH.st('hyg', SH.has('toothbrush') ? 14 : 8); log('Paper towels and pink soap. You look a little less like a runaway.', 'sys'); done(); }));
        } else a.push(act('QuikMart is closed', 'Opens at 6 AM.', () => {}, { dis: true }));
        break;
      case 'library':
        if (SH.isOpen('library')) {
          a.push(act('Charge phone at the back tables', SH.has('charger') ? '1 hour. Mr. Abernathy doesn\'t mind.' : 'You need a charger.', () => { G.charging = true; doTime(60); SH.st('warmth', 10); log('You plug in and pretend to read a book about volcanoes.', 'sys'); done(); }, { dis: !SH.has('charger') }));
          a.push(act('Study / do homework', '1 hour · grades up', () => { doTime(60); G.grades = Math.min(100, G.grades + 4); SH.st('stress', -3); log('You finish your math worksheet. Mr. Abernathy slides you a peppermint without a word.', 'good'); done(); }));
          a.push(act('Use a public computer', 'Look things up.', () => A.computer()));
          a.push(act('Wash up in the restroom', '+hygiene', () => { doTime(15); SH.st('hyg', 12); done(); }));
          if (G.phase === 'run') a.push(act('Nap in the teen section beanbag', 'Risky. They check.', () => SH.Run.sleep()));
        } else a.push(act('The library is closed', SH.wd() === 6 ? 'Sunday hours 12 to 5.' : 'Open 9 to 8.', () => {}, { dis: true }));
        break;
      case 'park':
        a.push(act('Walk the river path', '30 min · clears your head', () => { doTime(30, { exert: 1 }); SH.st('stress', -7); SH.st('mood', 4); log(U.pick(['The river is high and brown and loud. It drowns out everything, which is the point.', 'Geese. So many geese. One hisses at you. You hiss back. You win.', 'You find a flat rock and skip it five times. Personal record.']), 'good'); done(); }));
        if (G.phase === 'home' && h >= 15 && h < 19 && !SH.isDark()) a.push(act('Skate the bowl', '45 min · Jordan might be here', () => { doTime(45, { exert: 3 }); SH.st('stress', -10); SH.st('mood', 8); if (U.chance(0.5)) { SH.rel('jordan', 3); log('Jordan\'s here. He films you eating it on a 50-50 and posts it with fourteen skull emojis. Best you\'ve felt all week.', 'good'); } else log('You carve the bowl until your legs shake. For forty-five minutes your brain is just wheels and concrete.', 'good'); done(); }));
        if (SH.f('metWren') && G.phase === 'home' && h >= 16) a.push(act('Talk to Wren', 'She\'s on the lip of the bowl.', () => SH.Talk.open('wren', { first: 'Hey, kid. Still thinking about it?' })));
        if (G.phase === 'run') a.push(act('Sleep on a bench under the pavilion', 'Outdoors. Cold. Exposed.', () => SH.Run.sleep(), { cls: 'hot' }));
        break;
      case 'mall':
        if (SH.isOpen('mall')) {
          ['game1', 'game2', 'console'].forEach((id) => { if (SH.has(id)) a.push(act(`GameSwap: sell ${SH.ITEMS[id].n}`, `+$${SH.ITEMS[id].sell}`, () => { SH.rmBag(id); SH.money(SH.ITEMS[id].sell); G.tx.push({ t: G.t, d: 'GameSwap', a: SH.ITEMS[id].sell }); if (id === 'console') { SH.st('mood', -8); SH.flag('soldConsole'); log('The GameSwap guy counts out $55. Dad\'s console goes on a shelf with a sticker. You don\'t look back.', 'warn'); } else log('Sold.', 'sys'); doTime(10); done(); })); });
          a.push(act('Buy a power bank: $15', 'One full phone charge.', () => { if (spend(15, 'Power bank')) { SH.addBag('powerbank', true); G.pbCharge = 100; log('A cheap power bank in a blister pack. Worth it.', 'sys'); doTime(10); done(); } }));
          a.push(act('Food court pretzel: $4', '+25 fullness', () => { if (spend(4, 'Pretzel')) { SH.st('full', 25); G.stats.meals++; doTime(15); done(); } }));
          a.push(act('Wander & warm up', '30 min · Big Lou is watching', () => { doTime(30); if (G.phase === 'run' && G.heat > 40 && U.chance(0.3)) SH.Events.queue({ id: 'found', run: () => SH.Endings.found('security') }); done(); }));
        } else a.push(act('The mall is closed', 'Open 10 to 9.', () => {}, { dis: true }));
        break;
      case 'diner':
        a.push(act('Pancakes: $4.50', '+40 fullness', () => { if (spend(4.5, 'Nite Owl')) { SH.st('full', 40); SH.st('mood', 5); G.flags.dinerOrdered = SH.day(); G.stats.meals++; doTime(25); log('A stack the size of your head. Whipped butter. You eat like you\'ve never eaten.', 'good'); done(); } }));
        a.push(act('Fries: $2.50', '+20 fullness', () => { if (spend(2.5, 'Nite Owl')) { SH.st('full', 20); G.flags.dinerOrdered = SH.day(); doTime(15); done(); } }));
        a.push(act('Hot chocolate: $2', 'warmth & mood', () => { if (spend(2, 'Nite Owl')) { SH.st('warmth', 15); SH.st('mood', 5); SH.st('stress', -3); G.flags.dinerOrdered = SH.day(); doTime(15); done(); } }));
        a.push(act('Charge phone at the booth outlet', SH.has('charger') ? '1 hour' : 'Need a charger', () => { G.charging = true; doTime(60); if (G.flags.dinerOrdered !== SH.day() && SH.isDark()) { SH.rel('dolores', -3); log('Dolores eyes the charger, then you. "Outlets are for paying customers, hon." But she doesn\'t unplug it.', 'sys'); } done(); }, { dis: !SH.has('charger') }));
        a.push(act('Wash up in the restroom', '+hygiene', () => { doTime(15); SH.st('hyg', SH.has('toothbrush') ? 16 : 10); done(); }));
        if (SH.isDark() || h < 7) a.push(act('Talk to Dolores', 'The waitress with the pencil in her bun.', () => SH.Talk.open('dolores', { first: 'Need something, hon?' })));
        if (SH.f('doloresOffer') && G.phase === 'run') a.push(act('Wait for Dolores\'s shift to end', 'She said she\'d drive you to Harbor House.', () => { const m = Math.max(10, Math.round(((6 - h + 24) % 24) * 60)); SH.advance(m, { sleep: true, quality: 0.3, interrupt: true }); if (!SH.G.ended) SH.Endings.harbor('dolores'); }, { cls: 'safe' }));
        if (G.phase === 'run') a.push(act('Doze in the corner booth', 'Dolores might let you.', () => SH.Run.sleep()));
        break;
      case 'laundromat':
        a.push(act('Sit by the warm dryers', '1 hour', () => { doTime(60); SH.st('warmth', 20); SH.st('stress', -2); log('The dryers tumble someone else\'s clothes. The heat soaks into your bones. There\'s a flyer for a lost dog named Biscuit.', 'sys'); done(); }));
        a.push(act('Wash your clothes: $3', '1 hour · +20 hygiene', () => { if (spend(3, 'Suds & Duds')) { doTime(60); SH.st('hyg', 20); SH.st('warmth', 15); log('You wash your hoodie in the smallest machine and sit in your t-shirt, arms wrapped around yourself. It comes out warm. You put it on and nearly cry.', 'good'); done(); } }));
        if (G.phase === 'run') a.push(act('Sleep in the plastic chairs', 'Warm. The owner comes at 2 AM sometimes.', () => SH.Run.sleep()));
        break;
      case 'underpass':
        if (SH.f('metWren')) a.push(act('Talk to Wren', 'She\'s reading by a camping lantern.', () => SH.Talk.open('wren', { first: G.phase === 'run' ? 'You eat today?' : 'You again.' })));
        if (SH.foodInBag().length && SH.f('metWren')) a.push(act('Share food with Wren', 'Give her something from your bag.', () => { const i = SH.foodInBag()[0]; SH.rmBag(i); SH.rel('wren', 15); SH.st('mood', 6); log(`You hand Wren your ${SH.ITEMS[i].n}. She looks at it, then at you. "...Thanks, kid." She tells you about Harbor House without you even asking.`, 'good'); SH.flag('knowsHarbor'); SH.UI.revealHarbor(); done(); }));
        if (SH.f('metWren') && SH.f('knowsHarbor') && G.rel.wren >= 15 && G.phase === 'run') a.push(act('Ask Wren to walk you to Harbor House', 'She knows the way.', () => { doTime(40, { exert: 1 }); SH.Endings.harbor('walked'); }, { cls: 'safe' }));
        if (G.phase === 'run') a.push(act('Sleep by the wall', 'Sheltered from rain. Not from people.', () => SH.Run.sleep()));
        break;
      case 'bus':
        if (SH.isOpen('bus')) {
          const nb = SH.Run.nextBus();
          if (!SH.has('ticket') && h >= 6.5 && h < 21) a.push(act('Buy a ticket to Cedar Falls: $28', 'The agent watches over her glasses.', () => SH.Run.buyTicket()));
          if (SH.has('ticket') && nb != null) a.push(act(`Board the ${SH.fmt12(Math.floor(G.t / 1440) * 1440 + nb * 60)} bus to Cedar Falls`, 'Wait at Bay 3, then go.', () => { const w = Math.round((nb - h) * 60); if (w > 0) SH.advance(w, { interrupt: true }); if (!SH.G.ended && !SH.UI.modalOpen()) SH.Run.board(); else done(); }, { cls: 'safe' }));
          a.push(act('Vending machine chips: $1.75', '', () => { if (spend(1.75, 'Vending')) { SH.addBag('chips', true); done(); } }));
          a.push(act('Wash up in the restroom', '+hygiene', () => { doTime(15); SH.st('hyg', 8); done(); }));
          if (G.phase === 'run') a.push(act('Sleep on a bench by Bay 3', 'Security walks through every hour.', () => SH.Run.sleep()));
        } else a.push(act('The depot is closed', 'Opens at 5 AM.', () => {}, { dis: true }));
        break;
      case 'jordan':
        if (G.phase === 'home') {
          a.push(act('Hang out with Jordan', '1.5 hours · mood up', () => { doTime(90); SH.st('mood', 10); SH.st('stress', -10); SH.rel('jordan', 4); if (h > 17 && h < 19.5) { SH.st('full', 30); log('Mrs. Pike makes tacos and asks you three questions about school and zero about home. You love her for it.', 'good'); } else log('You play Skyforge on his couch and argue about whether a hot dog is a sandwich. The most normal you\'ve felt all week.', 'good'); done(); }));
          a.push(act('Talk to Jordan', '', () => SH.Talk.open('jordan', { first: 'yo whats up' })));
          if (SH.f('jordanMoney') && !SH.f('gotJordanMoney')) a.push(act('Take Jordan\'s $14', 'He offered.', () => { SH.flag('gotJordanMoney'); SH.money(14); log('Jordan hands you a crumpled ten and four ones. "Don\'t make it weird."', 'sys'); done(); }));
          if (SH.f('hasBike') && !SH.f('bikeGone') && !SH.f('bikeAtJordan') && SH.day() >= 8) a.push(act('Leave your bike in Jordan\'s garage', 'Somewhere Rick can\'t sell it.', () => { SH.flag('bikeAtJordan'); log('You wheel your bike into Jordan\'s garage behind the lawnmower. "Why?" "Don\'t ask." He doesn\'t.', 'good'); done(); }));
          if (SH.f('sleepoverInvite') && SH.day() === 6 && h >= 17) a.push(act('Sleep over', 'Until morning. Lily will be home alone with them.', () => { SH.advance(Math.round(((9 - h + 24) % 24) * 60), { sleep: true, quality: 0.9, interrupt: false }); SH.st('mood', 20); SH.st('stress', -20); SH.rel('jordan', 8); SH.G.loc = 'jordan'; log('You stay up until 3 AM playing Skyforge and eating a family-size bag of Takis. In the morning there\'s a text from Lily on Mom\'s iPad: "daddy broke a glass last nite. i hid in ur room. when r u home"', 'warn'); done(); }));
        } else a.push(act('Knock on the front door', 'Mrs. Pike will answer. She\'ll have to call your mom.', () => SH.Endings.garage(), { cls: 'safe' }));
        break;
      case 'patel':
        if (G.phase === 'home') {
          if ((SH.wd() === 1 || SH.wd() === 3) && h >= 16 && h < 19 && !G.done['newton' + SH.day()]) a.push(act('Walk Newton', '45 min · $8', () => { G.done['newton' + SH.day()] = 1; doTime(45, { exert: 1 }); SH.money(8); G.tx.push({ t: G.t, d: 'Walked Newton', a: 8 }); SH.st('stress', -6); SH.st('mood', 5); SH.rel('patel', 3); log('Newton walks at the speed of continental drift and sniffs every single leaf. Mrs. Patel pays you with a crisp $5 and three $1s.', 'good'); done(); }));
          a.push(act('Have tea with Mrs. Patel', 'Talk', () => { doTime(10); SH.Talk.open('patel', { first: 'Come in, come in. Newton, move. Tea? I have the good biscuits. Well. The okay biscuits.' }); }));
        }
        break;
    }
    if (G.phase === 'run') {
      if (SH.has('powerbank') && G.pbCharge > 0 && G.phone.bat < 95) a.push(act('Use the power bank', `${Math.round(G.pbCharge)}% left in it`, () => A.useItem('powerbank')));
      a.push(act('Sit and rest', '30 min', () => { doTime(30); SH.st('energy', 4); done(); }));
    }
    a.push(act('Wait', '1 hour', () => { doTime(60, { interrupt: true }); done(); }));
    return out;
  };
})(window.SH);
