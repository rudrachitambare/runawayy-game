/* SMALL HOURS — towns as real places (2/5): playing them.
   Arriving puts you at a real spot (the bus stop, the station, or the edge of town if you walked in).
   Each spot has its own things to do, people behind the counter, hours, and the same scene/stage as Harlow.
   Everything the older systems used to add to the town pop-up menu (motels, stores, boards, junkyard, gigs,
   clinics, side streets, runaway kids…) is routed to the spot where it physically happens. */
(function (SH) {
  const TW = SH.Town, A = SH.Atlas; if (!TW || !A) return;
  const G = () => SH.G, U = SH.util;
  const log = (t, c) => SH.UI.log(t, c || '');
  const done = () => SH.UI.afterAction();
  const act = (label, sub, fn, o) => Object.assign({ label, sub, fn }, o || {});
  const TX = () => SH.TownText;
  const pick = (a) => a[Math.floor(Math.random() * a.length)];
  const kindOf = (id) => (SH.LOC[id] || {}).kind;

  /* ---------- noticing: every action in a small place is a little bit of exposure ---------- */
  TW.notice = function (k) { const p = A.here(); if (!p || p.home) return false; return A.noticed(p, k); };
  TW.time = function (mins, k, o) { SH.advance(mins, Object.assign({ interrupt: false }, o || {})); if (G().ended) return true; return k ? TW.notice(k) : false; };
  TW.pay = (amt, what) => { if (G().money < amt) { SH.UI.toast(`That's $${amt.toFixed(2)}. You have $${G().money.toFixed(2)}.`); return false; } SH.money(-amt); (G().tx = G().tx || []).push({ t: G().t, d: what, a: -amt }); return true; };

  /* ---------- arriving ---------- */
  TW.enter = function (to, m, extraLog) {
    const g = G(), T = TW.install(to); if (!T) return;
    const has = (k) => SH.LOC[TW.id(to.id, k)];
    const ride = g._arrRide || '', rail = /train/.test(ride), informal = /car|minivan|tempo/.test(ride);
    const walkIn = m && (m.k === 'walk' || m.k === 'bike');
    extraLog = extraLog || g._arrLog; g._arrLog = '';
    const at = walkIn ? 'edge' : rail && has('station') ? 'station' : informal && has('gas') ? 'gas' : 'stop';
    g.loc = TW.id(to.id, at); if (!g.room || typeof g.room !== 'object') g.room = 'bedroom';
    const st = TW.st(to.id); st.visits = (st.visits || 0) + 1; st.seen[at] = (st.seen[at] || 0) + 1;
    if (extraLog) log(extraLog, 'sys');
    log(TX().arrive(to, T, at, st.visits), '');
    if (to.grandma) log(SH.f('grandmaAddr') ? `Grandma's street is somewhere on this map. Larkspur Lane. You could walk there in ${T.tier === 'small' ? 'fifteen minutes' : 'twenty'}.` : 'Grandma lives somewhere in this town. You don\'t know the street. Somebody here might. The library might.', 'sys');
    if (to.grandma && SH.f('grandmaAddr')) { SH.LOC[TW.id(to.id, 'grandma')].hidden = false; }
    SH.Map && (SH.Map.cache = null);
  };

  /* ---------- the hub is gone: going "back" just returns you to where you're standing ---------- */
  A.hub = function () { const g = G(); if (!g || g.ended) return; if (g.away && !TW.loc()) { TW.install(A.here()); const T = TW.cur(); if (T) g.loc = TW.id(g.away, 'stop'); } done(); SH.Phone && SH.Phone.render && SH.Phone.render(); };

  /* ---------- routing the old hub extras to physical places ---------- */
  const ROUTE = [
    [/Board:|Departures board/, (c, T) => (/Station|halt|train/i.test((c.sub || '') + c.t) && T.locs[TW.id(T.pid, 'station')] ? 'station' : /gas station lot/.test(c.sub || '') ? 'gas' : /diner parking/.test(c.sub || '') ? 'diner' : /laundromat/.test(c.sub || '') ? 'laundromat' : 'stop')],
    [/motel|Motels|Your room at|Something's wrong at the motel/i, () => 'motel'],
    [/The junkyard|Sleep in the/, () => 'edge'],
    [/Side streets/, (c, T) => (T.locs[TW.id(T.pid, 'backst')] ? 'backst' : 'diner')],
    [/farm|Go-kart/, (c) => (/farm/.test(c.t) ? 'work' : 'main')],
    [/Clinic/, () => 'clinic'],
    [/A kid /, () => 'park'],
    [/Pickup locker|SwapSpot/, () => 'gas'],
    [/^Work:/, () => 'work'],
    [/Look for better signal/, () => 'edge'],
    [/Stores|business|Your base|trick-or-treat/i, () => 'main'],
    [/You & your group/, () => '*'],
  ];
  function extras(T, dark) {
    const p = A.here(), ch = [], out = {};
    (A.extra || []).forEach((f) => { try { f(p, ch, dark); } catch (e) { console.warn(e); } });
    ch.forEach((c) => { const r = ROUTE.find(([re]) => re.test(c.t)); let k = r ? r[1](c, T) : 'main'; if (k !== '*' && !T.locs[TW.id(T.pid, k)]) k = 'main'; (out[k] = out[k] || []).push(c); });
    return out;
  }
  const fromChoice = (c) => act(c.t.replace(/^\S+\s(?=[A-Z"])/u, (m) => (/\p{Extended_Pictographic}/u.test(m) ? '' : m)), c.sub || '', c.fn, { cls: c.cls, ic: (c.t.match(/^\p{Extended_Pictographic}\S*/u) || [])[0] });

  /* ---------- people who are here right now ---------- */
  TW.present = function (L) {
    const T = TW.cur(); if (!T) return []; const h = SH.hour(), open = SH.isOpen(L.id);
    return T.people.filter((q) => q.kind === L.kind && (q.staff || q.kind !== 'main' ? open : !SH.isDark()) && !(q.kind === 'park' && (h < 7 || h > 19)) && !(q.kind === 'stop' && (h < 6 || h > 21)));
  };
  function talkTo(q, L) {
    return act(`Talk to ${q.n}`, q.role, () => SH.Talk.open(q.id, { turnsMax: 9, local: q, place: A.here(), spot: L, first: SH.TownTalk ? SH.TownTalk.opener(q, L) : 'Hi.', onEnd: (c) => { if (c.result === 'help') return SH.Endings.found(A.here().hasPolice ? 'self' : 'sheriff'); if (c.result === 'call') { G().awayNotice = 100; TW.notice(0); return; } done(); } }));
  }

  /* ---------- the action list for a town spot ---------- */
  TW.actions = function () {
    const g = G(), L = TW.loc(); if (!L) return null;
    const T = TW.cur(), p = A.here(), h = SH.hour(), dark = SH.isDark(), open = SH.isOpen(L.id), a = [];
    const X = extras(T, h >= 20 || h < 6);
    const K = KIND[L.kind];
    if (K) { try { K(a, L, T, p, { h, dark, open }); } catch (e) { console.warn(e); } }
    TW.present(L).forEach((q) => a.push(talkTo(q, L)));
    (X[L.kind] || []).forEach((c) => a.push(fromChoice(c)));
    (X['*'] || []).forEach((c) => a.push(fromChoice(c)));
    // everywhere: rest / sleep, and getting out of town
    if (dark && !['police', 'shelter', 'grandma', 'motel'].includes(L.kind)) a.push(act('Find somewhere to sleep here', (SH.Run.sleepSpots[L.id] || {}).n || 'Wherever you can', () => SH.Run.sleep()));
    else if (!dark) a.push(act('Sit a while', '30 min · rest your legs', () => { if (TW.time(30, 0.15)) return; SH.st('energy', 6); SH.st('stress', -3); log(TX().idle(L, T), ''); done(); }));
    if (!p.hasPolice && ['main', 'gas', 'stop', 'church'].includes(L.kind)) a.push(act('Call the sheriff (non-emergency)', 'No police here. A deputy drives out. It ends this.', () => SH.Endings.found('sheriff'), { cls: 'safe' }));
    a.push(act('Open Atlas', 'Leave town: buses, trains, roads', () => { SH.Phone.open('atlas'); SH.Mobile && SH.Mobile.showPhone && SH.Mobile.showPhone(); }));
    return { rooms: null, acts: a };
  };

  /* ---------- per-kind actions ---------- */
  const food = (a, items, where) => items.forEach(([n, price, full, extra, txt]) => a.push(act(`${n}: $${price.toFixed(2)}`, extra || `+food`, () => { if (!TW.pay(price, where)) return; SH.st('full', full); if (/cocoa|coffee|soup|chocolate|chili/i.test(n)) SH.st('warmth', 10); if (TW.time(/cocoa|chocolate|coffee/i.test(n) ? 20 : 15, 0.2)) return; log(typeof txt === 'function' ? txt() : txt, 'good'); done(); })));
  const bagBuy = (a, list, where) => list.forEach(([id, price]) => { const it = SH.ITEMS[id]; if (!it) return; a.push(act(`Buy ${it.n}: $${price.toFixed(2)}`, it.d, () => { if (!TW.pay(price, where)) return; SH.addBag(id, true); if (TW.time(5, 0.12)) return; log(`You buy ${/^[aeiou]/i.test(it.n) ? 'an' : 'a'} ${it.n.toLowerCase()} and it goes in the backpack.`, 'sys'); done(); })); });
  const wifiHere = (L, p) => (p.services.wifi || []).some((w) => new RegExp(w.split(' ')[0], 'i').test(L.kind === 'gas' ? 'gas station' : L.kind === 'diner' ? 'diner' : L.kind === 'library' ? 'library' : L.kind === 'laundromat' ? 'laundromat' : 'x'));
  const charge = (a, L, mins, k, txt) => a.push(act('Charge your phone', SH.has('charger') ? `${mins} min at an outlet` : 'You need a charger', () => { const g = G(); g.charging = true; g.phone.bat = Math.min(100, g.phone.bat + Math.round(mins * 0.6)); if (TW.time(mins, k)) return; SH.st('warmth', 6); log(txt(), 'sys'); done(); }, { dis: !SH.has('charger') }));
  const wifi = (a, L, p) => { if (!wifiHere(L, p)) return; a.push(act('Get on the wifi', 'Messages, maps, the news', () => { SH.Net && SH.Net.joinPublic && SH.Net.joinPublic(`${L.name} Guest`); if (TW.time(10, 0.08)) return; const un = Object.values(G().unread || {}).reduce((s, v) => s + (v || 0), 0); log(`The password is taped to the ${L.kind === 'library' ? 'circulation desk' : 'register'}: ${pick(['pie2024', 'guest1234', 'welcome!', 'GoEagles', 'coffee4u'])}. Your phone buzzes${un ? ` ${un} times` : ''} as everything catches up.`, 'sys'); done(); })); };
  const wash = (a, where, k) => a.push(act('Wash up in the restroom', '+hygiene', () => { if (TW.time(12, k)) return; SH.st('hyg', SH.has('toothbrush') ? 14 : 9); log(TX().wash(where), 'sys'); done(); }));

  const KIND = {
    main(a, L, T, p, c) {
      a.push(act(`Walk ${T.tier === 'city' ? 'around downtown' : 'the length of ' + T.street}`, '30 min · see what\'s here', () => { if (TW.time(30, 0.35)) return; SH.st('mood', 2); TX().walk(L, T, p); done(); }));
      if (T.tier !== 'city') a.push(act('Read the notice board', 'Lost cats, church suppers, odd jobs', () => { if (TW.time(10, 0.1)) return; TX().board(L, T, p); done(); }));
      if (!c.dark && (T.tier === 'village' || T.tier === 'small')) a.push(act('Check the post office lobby', 'Warm, and the bulletin board inside', () => { if (TW.time(15, 0.3)) return; SH.st('warmth', 8); log(TX().post(T, p), ''); done(); }));
    },
    gas(a, L, T, p, c) {
      if (!c.open) { a.push(act(`${L.name} is closed`, `Opens at ${L.hours[0]} AM. The ice machine hums.`, () => {}, { dis: true })); return; }
      food(a, [['Hot dog', 2.5, 22, 'Rolled since morning', () => pick(['It has been on the rollers since before you were born, probably. It\'s the best thing you\'ve ever eaten.', 'You eat it standing by the window. Ketchup, relish, the works. The clerk doesn\'t say anything about the relish.'])], ['Cup of cocoa', 1.25, 6, 'From the machine · warms you up', () => pick(['Powdered cocoa from the machine, scalding. You hold it with both hands until you can feel your fingers.', 'The machine grinds and spits out something that\'s 40% cocoa and 60% hot. You drink every drop.'])]], L.name);
      bagBuy(a, [['granola', 1.5], ['chips', 1.75], ['water', 1.5]], L.name);
      a.push(act('Pocket something', 'Stealing. There\'s a round mirror in the corner.', () => SH.Actions.shoplift(), { cls: 'hot' }));
      wash(a, 'gas', 0.15); wifi(a, L, p);
      if (T.tier === 'village') charge(a, L, 30, 0.35, () => `There's an outlet under the coffee counter. ${pick(['The clerk watches you plug in and says nothing.', '"Just don\'t trip anybody with that cord, hon."'])}`);
    },
    diner(a, L, T, p, c) {
      if (!c.open) { a.push(act(`${L.name} is closed`, `Opens at ${L.hours[0]} AM. Chairs up on the tables.`, () => {}, { dis: true })); return; }
      const bfast = c.h < 11;
      food(a, [bfast ? ['Short stack of pancakes', 5, 38, 'Butter, syrup, the whole thing', () => pick(['Three pancakes the size of hubcaps. You eat until you can\'t, then eat one more bite out of spite.', 'The syrup comes in a little metal pitcher. You use all of it. The waitress brings another without being asked.'])] : ['Grilled cheese and soup', 5.5, 40, 'Tomato soup, extra crackers', () => pick(['The grilled cheese is cut corner to corner, the right way. You dunk it and for ten minutes nothing is wrong.', 'Soup so hot you have to wait, so you watch the steam and don\'t think about anything.'])],
        ['Slice of pie', 3, 18, 'Whatever\'s under the dome today', () => `${pick(['Cherry', 'Apple', 'Pecan', 'Banana cream', 'Rhubarb'])}. ${pick(['It\'s the best pie in three counties, according to a laminated sign. The sign is right.', 'Your grandma makes it better. You eat every crumb anyway.'])}`],
        ['Hot chocolate (refills free)', 1.75, 6, 'Buys you a warm booth for an hour', () => pick(['She tops it off twice without asking. You stay in the booth for an hour and watch the parking lot. Nobody asks you to leave.', 'Whipped cream from a can, a candy cane stirrer even though it\'s not Christmas. You make it last an hour.'])]], L.name);
      wash(a, 'diner', 0.15); wifi(a, L, p);
      if (wifiHere(L, p)) charge(a, L, 45, 0.25, () => 'You find the booth with the outlet under the table. Everyone who\'s ever been broke knows which booth.');
      if (!c.dark) a.push(act('Ask if they need dishes washed', 'Cash, maybe. Questions, definitely.', () => TW.work('diner', L, T, p)));
    },
    library(a, L, T, p, c) {
      if (!c.open) { a.push(act('The library is closed', `Open ${L.hours[0]} to ${L.hours[1] - 12} PM.`, () => {}, { dis: true })); return; }
      charge(a, L, 60, 0.15, () => pick(['You plug in at the back table and pretend to read a book about the Dust Bowl. It\'s actually interesting.', 'The outlet is behind the large-print Westerns. You sit on the floor. Nobody minds.']));
      wifi(a, L, p);
      a.push(act('Use a public computer', '30 minute limit · look things up', () => TW.computer(L, T, p)));
      a.push(act('Read in a corner chair', '1 hour · warm, quiet', () => { if (TW.time(60, 0.12)) return; SH.st('stress', -8); SH.st('mood', 5); SH.st('warmth', 10); log(TX().read(T), 'good'); done(); }));
      a.push(act('Check the bulletin board', 'Flyers by the door', () => { if (TW.time(5, 0.05)) return; TX().libboard(L, T, p); done(); }));
      wash(a, 'library', 0.1);
    },
    church(a, L, T, p, c) {
      if (!c.open) { a.push(act('The doors are locked', 'The porch is out of the wind, at least.', () => {}, { dis: true })); return; }
      a.push(act('Sit in a back pew', '30 min · quiet', () => { if (TW.time(30, 0.1)) return; SH.st('stress', -10); SH.st('mood', 3); SH.st('warmth', 8); log(TX().pew(T), 'good'); done(); }));
      const st = TW.st(), d = SH.day();
      a.push(act('The pantry shelf in the hallway', st.day.pantry === d ? 'You already took something today' : 'TAKE WHAT YOU NEED', () => { if (TW.time(5, 0.15)) return; st.day.pantry = d; const it = pick(['granola', 'apple', 'sandwich', 'water']); SH.addBag(it, true); log(TX().pantry(it), 'good'); done(); }, { dis: st.day.pantry === d }));
      if (SH.wd() === 2 && c.h >= 16.5 && c.h < 19) a.push(act('Wednesday supper in the basement', 'Free. Casseroles. Lots of questions.', () => { if (TW.time(60, 0.6)) return; SH.st('full', 55); SH.st('mood', 8); SH.st('warmth', 15); log(TX().supper(T), 'good'); done(); }, { cls: 'job' }));
    },
    park(a, L, T, p, c) {
      if (!c.dark) a.push(act(T.tier === 'village' ? 'Sit on the bleachers' : 'Sit on a bench and watch people', '45 min', () => { if (TW.time(45, 0.2)) return; SH.st('stress', -6); SH.st('energy', 5); log(TX().park(T, c), ''); done(); }));
      if (SH.has('sketchbook') && !c.dark) a.push(act('Draw what you see', '40 min · your sketchbook', () => { if (TW.time(40, 0.12)) return; SH.st('stress', -10); SH.st('mood', 6); log(TX().draw(T, L), 'good'); done(); }));
      if (!c.dark && c.h < 18) a.push(act('Use the park restroom', '+hygiene · cold water only', () => { if (TW.time(10, 0.1)) return; SH.st('hyg', 7); log('Cold water, no soap, a hand dryer that blows lukewarm air for three seconds. Better than nothing, barely.', 'sys'); done(); }));
    },
    laundromat(a, L, T, p, c) {
      if (!c.open) { a.push(act(`${L.name} is closed`, 'Dark inside. The dryers are cold.', () => {}, { dis: true })); return; }
      a.push(act('Warm up by the dryers', '30 min', () => { if (TW.time(30, 0.1)) return; SH.st('warmth', 22); SH.st('stress', -3); log(TX().dryers(T), 'good'); done(); }));
      a.push(act('Wash your clothes', '$3 · 1 hour · +hygiene', () => { if (!TW.pay(3, L.name)) return; if (TW.time(60, 0.15)) return; SH.st('hyg', 22); SH.st('mood', 4); log('You wash everything but what you\'re wearing, then sit in the bathroom in your hoodie while that washes too. Clean socks. Warm from the dryer. You could cry. You don\'t, but you could.', 'good'); done(); }));
      charge(a, L, 45, 0.12, () => 'The outlet by the change machine works if you jiggle the plug. You jiggle the plug.');
    },
    police(a, L, T, p) {
      a.push(act('Walk in and tell them', 'Running away isn\'t a crime. They\'ll call home, or someone.', () => SH.Endings.found('self'), { cls: 'safe' }));
      a.push(act('Keep walking past', 'Head down. Normal pace.', () => { if (TW.time(5, 0.5)) return; log(pick(['An officer on the steps is eating a breakfast burrito. He doesn\'t look up. You don\'t breathe until the corner.', 'Your own face is on a sheet of paper behind the glass door. Or someone who looks like you. You don\'t stop to check.']), 'warn'); done(); }));
    },
    clinic(a, L, T, p, c) {
      if (!c.open) { a.push(act('The clinic is closed', 'An after-hours number is taped to the door.', () => {}, { dis: true })); return; }
      a.push(act('Sit in the waiting room', '30 min · warm, nobody talks', () => { if (TW.time(30, 0.3)) return; SH.st('warmth', 14); SH.st('stress', -2); log('A TV plays a cooking show with the sound off. A baby cries, stops, cries. A nurse calls names that aren\'t yours. It\'s warm, and it smells like hand sanitizer, and nobody talks to you.', ''); done(); }));
      if (G().s.health < 70 && !SH.has('x_painkiller')) a.push(act('Ask the nurse for something for your head', 'She\'ll have questions', () => { if (TW.time(15, 0.8)) return; SH.st('health', 8); log('"How old are you, sweetie? Where\'s your mom?" You say she\'s parking the car. She gives you two children\'s Tylenol in a paper cup and watches the door for a mom who doesn\'t come.', 'warn'); done(); }));
    },
    motel() {},
    work(a, L, T, p, c) {
      if (c.dark || !c.open) { a.push(act('Everyone\'s gone home', 'Come back after 6 AM', () => {}, { dis: true })); return; }
      a.push(act('Ask around for work', (p.kidjobs || [])[0] || 'An hour or two, cash', () => TW.work('work', L, T, p)));
    },
    edge(a, L, T, p, c) {
      a.push(act('Look back at the town', '15 min', () => { if (TW.time(15, 0)) return; SH.st('stress', -4); log(TX().edge(T, p, c), ''); done(); }));
      if (!c.dark) a.push(act('Walk out along the road a while', '1 hour · clears your head', () => { if (TW.time(60, 0.05, { exert: 1.5 })) return; SH.st('stress', -8); SH.st('mood', 4); log(TX().road(T, p), 'good'); done(); }));
    },
    station(a, L, T, p, c) {
      a.push(act('Read the timetable', 'When things leave', () => { if (SH.Routes && SH.Routes.boardView) return SH.Routes.boardView(p); }));
    },
    stop(a, L, T, p, c) {
      a.push(act(T.tier === 'city' || T.tier === 'town' ? 'Check the departures screen' : 'Read the timetable', T.tier === 'city' || T.tier === 'town' ? 'Buses, bays, times' : 'Faded, but readable', () => { if (SH.Routes && SH.Routes.boardView) return SH.Routes.boardView(p); }));
    },
    grandma(a) { a.push(act('Walk up to number 41', 'The blue door', () => SH.Endings.grandma('walk'), { cls: 'safe' })); },
    shelter(a, L, T, p) { a.push(act('Ring the bell', 'They take you in tonight. No calls till you\'re ready.', () => (SH.Endings.harbor ? SH.Endings.harbor('city') : SH.Endings.found('self')), { cls: 'safe' })); a.push(act('Read the sign on the door', '', () => { log('ANY KID, ANY TIME. HOT FOOD. SHOWERS. NO ONE WILL MAKE YOU DO ANYTHING TONIGHT. Underneath, in marker, someone added a smiley face and "the mac & cheese is legit".', 'good'); done(); })); },
    backst() {},
  };
  TW.KIND = KIND;

  /* ---------- work: real asks, real answers ---------- */
  TW.work = function (where, L, T, p) {
    const g = G(); if (TW.time(where === 'diner' ? 20 : 60, where === 'diner' ? 0.5 : 0.7)) return;
    const st = TW.st(), d = SH.day(); st.day.worked = st.day.worked || {};
    if (st.day.worked[where] === d) { log(pick(['"Already told you, kid. Nothing today."', 'Same answer as this morning. Friendlier, though.']), 'sys'); return done(); }
    const named = where === 'work' && st.helpName && !st.usedHelp; if (named) st.usedHelp = d;
    const ok = named || Math.random() < (T.tier === 'city' ? 0.4 : where === 'diner' ? 0.5 : 0.6);
    if (named) log(`You ask for ${st.helpName}, like the notice said. ${pick(['A pause. Then: "Firewood\'s round back. Gloves are on the post. Don\'t get a splinter, I\'m not your mom."', 'They look at you for a long second, then at the woodpile. "You\'re small. Wood\'s not heavy if you carry less of it. Go on."'])}`, '');
    st.day.worked[where] = d;
    if (!ok) { log(TX().noWork(where, T), 'warn'); return done(); }
    const pay = (SH.BAL ? SH.BAL.jobMin : 6) + Math.floor(Math.random() * (SH.BAL ? SH.BAL.jobSpread : 10)) + (where === 'diner' ? 0 : 3);
    SH.advance(where === 'diner' ? 90 : 120, { interrupt: false, exert: 2 }); if (g.ended) return;
    SH.money(pay); SH.st('energy', -14); SH.st('mood', 5); SH.st('hyg', -6); if (where === 'diner') SH.st('full', 25);
    (g.tx = g.tx || []).push({ t: g.t, d: `Odd job: ${L.name}`, a: pay });
    log(TX().didWork(where, T, p, pay), 'good'); done();
  };

  /* ---------- a library computer that knows where you are ---------- */
  TW.computer = function (L, T, p) {
    const D = (t, ch) => SH.UI.dialog({ title: 'Public computer', text: [].concat(t), choices: ch });
    const back = { t: 'Log off', fn: done };
    const ch = [];
    if (p.grandma && !SH.f('grandmaAddr')) ch.push({ t: `Search: your grandma's name + "${p.name}"`, fn: () => { if (TW.time(15, 0.05)) return; SH.flag('grandmaAddr'); SH.LOC[TW.id(p.id, 'grandma')].hidden = false; SH.Map && (SH.Map.cache = null); log(SH.nm(`A library newsletter from last spring: "Volunteer of the month: ${(SH.G.fam && SH.G.fam.gma) || 'Rose'} of Larkspur Lane, who has read to the Tuesday toddlers for eleven years." Larkspur Lane. It's on the town map. It's a twenty-minute walk.`), 'good'); done(); } });
    ch.push({ t: 'Search: "runaway help"', fn: () => { if (TW.time(15, 0.05)) return; SH.flag('knowsHarbor'); if (!SH.has('safeline')) SH.addBag('safeline', true); log(`The first result is the National Runaway Safeline: call or text, 24/7, free, and they don't have to tell anyone where you are. ${T.locs[TW.id(p.id, 'shelter')] ? `The second is ${T.locs[TW.id(p.id, 'shelter')].name}, right here in ${p.name}. It's on your map now.` : `The nearest youth shelter is in a bigger town. You write the number on your hand anyway.`}`, 'good'); done(); } });
    ch.push({ t: 'Search your own name', fn: () => { if (TW.time(15, 0.05)) return; SH.st('stress', G().reported ? 10 : 2); log(G().reported ? `There it is. MISSING, and your school picture, the one where you blinked. ${pick(['A county sheriff\'s page. A Facebook group with 2,400 members.', 'Forty-one comments. You read three and close the window.'])} Somewhere, someone is refreshing that page every hour.` : 'Nothing yet. A kid with your name won a spelling bee in Ohio in 2019. You feel weirdly proud of him.', G().reported ? 'bad' : 'sys'); done(); } });
    ch.push({ t: 'Look at the town map', fn: () => { if (TW.time(10, 0)) return; log(`You print a map of ${p.name} for ten cents. ${Object.values(T.locs).filter((l) => !l.hidden).length} places worth knowing. You fold it into your back pocket.`, 'sys'); done(); } });
    ch.push(back);
    D(['An old computer with a sticky mouse. A sign: 30 MINUTES. BE KIND. The librarian glances over once and goes back to her cart.'], ch);
  };

  /* ---------- plug into the game ---------- */
  const bList = SH.Actions.list;
  SH.Actions.list = function () {
    const g = G(); if (g && g.away && g.phase === 'run') { TW.cur(); if (!TW.loc()) { g.loc = TW.id(g.away, 'stop'); } const r = TW.actions(); if (r) return r; }
    return bList.apply(this, arguments);
  };
  const bTO = SH.travelOptions;
  SH.travelOptions = function (to) {
    const L = TW.loc(to), here = TW.loc(); if (!L || !here) return bTO.apply(this, arguments);
    const T = TW.cur(), d = Math.hypot(L.x - here.x, L.y - here.y), f = { village: 0.02, small: 0.028, town: 0.04, city: 0.055 }[T.tier] || 0.03;
    const out = [{ mode: 'walk', label: 'Walk', mins: Math.max(2, Math.round(d * f)), cost: 0, exert: 1.2 }];
    if (SH.f('bikeWithMe')) out.push({ mode: 'bike', label: 'Bike', mins: Math.max(2, Math.round(d * f / 2.6)), cost: 0, exert: 1.5 });
    if (T.tier === 'city' && d > 280 && SH.hour() >= 5.5 && SH.hour() < 24) { const wait = 12 - (Math.floor(G().t) % 12); out.push({ mode: 'bus', label: 'City bus', mins: wait + Math.round(d * 0.018), cost: 2, exert: 0.2, note: `next bus in ${wait}m` }); }
    return out;
  };
  const bTravel = SH.travel;
  SH.travel = function (to, opt) {
    const L = TW.loc(to); if (!L) return bTravel.apply(this, arguments);
    const g = G(); if (opt.cost > g.money) return SH.UI.toast('Not enough money for the bus.');
    if (opt.cost) SH.money(-opt.cost);
    const from = TW.loc();
    g.outsideOverride = opt.mode !== 'bus';
    { const c = (g._twc || 0) + opt.mins, m = Math.round(c / 10) * 10; g._twc = c - m; if (m > 0) SH.advance(m, { exert: opt.exert, act: 'travel', interrupt: false }); } g.outsideOverride = false; if (g.ended) return;
    if (opt.wet) { SH.st('warmth', -8); SH.st('hyg', -3); }
    g.loc = to; const st = TW.st(); st.seen[L.kind] = (st.seen[L.kind] || 0) + 1;
    log(TX().go(from, L, opt, st.seen[L.kind]), 'sys');
    if (TW.notice((L.vis || 0.5) * 0.25 * (opt.mode === 'bus' ? 0.5 : 1))) return;
    TW.onArrive(L);
    if (SH.Mobile && SH.Mobile.is && SH.Mobile.is()) SH.Mobile.tab('story');
    done();
  };
  TW.onArrive = function (L) { SH.TownEvents && SH.TownEvents.arrive(L); };

  /* going somewhere new from the Atlas: land at a real spot */
  const bArr = A.arrive;
  A.arrive = function (to, m, extraLog) {
    const g = G(); g._arrRide = (g.rides || 0) !== (g._ridesSeen || 0) ? g.lastRide : null; g._ridesSeen = g.rides || 0;
    return bArr.call(this, to, m, extraLog);
  };
  /* after load: rebuild the town you're in */
  const reinstall = () => { const g = G(); if (g && g.away && SH.Atlas) { TW.install(A.here()); if (!SH.LOC[g.loc]) g.loc = TW.id(g.away, 'stop'); } };
  const bLoad = SH.load; if (bLoad) SH.load = function () { const r = bLoad.apply(this, arguments); if (r) reinstall(); return r; };
  const bAR = SH.afterRestore; SH.afterRestore = function () { reinstall(); return bAR ? bAR.apply(this, arguments) : undefined; };
  TW.reinstall = reinstall;
})(window.SH);
/* in town, the bus stop's timetable shows buses and the station's shows trains; the Atlas hub board shows everything */
(function (SH) {
  const R = SH.Routes, TW = SH.Town; if (!R || !R.board || !TW) return;
  const bBoard = R.board;
  R.board = function (place, t) {
    const g = SH.G, L = g && g.away && TW.loc && TW.loc();
    if (R.only || !L || !place || place.id !== g.away || (L.kind !== 'station' && L.kind !== 'stop')) return bBoard.apply(this, arguments);
    R.only = L.kind === 'station' ? (o) => !!o.T.rail : (o) => !o.T.rail;
    try { return bBoard.apply(this, arguments); } finally { R.only = null; }
  };
})(window.SH);
/* walking up to Grandma's door yourself: its own intro (the base ones are about trains, buses and a 4 AM drive) */
(function (SH) {
  const E = SH.Endings; if (!E || !E.grandma) return;
  const bG = E.grandma;
  E.grandma = function (how) {
    if (how !== 'walk') return bG.apply(this, arguments);
    const h = SH.hour(), dark = SH.isDark ? SH.isDark() : h < 6 || h >= 20, rain = SH.raining && SH.raining(), p = SH.Atlas.here() || { name: 'Cedar Falls' };
    const intro = [
      `Number 41. You stand on the walk for a long time. ${rain ? 'The rain runs off the porch roof in a line, like a curtain you have to go through.' : dark ? 'The porch light is on. It has always been on. She says it\'s for the moths.' : 'A leaf blower somewhere. A dog. The fish wind chime turning slowly.'} You count to ten twice.`,
      'You knock. Footsteps. The blue door opens a crack on the chain, then shuts, then opens all the way, and Grandma Rose is standing there with her reading glasses pushed up in her hair and a dish towel in her hand.',
      'For a second neither of you moves. Then the dish towel is on the floor.',
    ];
    E.show('grandma', 'Wind Chimes', `41 Larkspur Lane · ${p.name}`, intro.concat([
      '"Mijo. Mijo. Look at you. You walked here? You WALKED here?" She pulls you inside by both hands. "Sit. Eat. Then talk. In that order."',
      'She calls your mom from the kitchen with the door closed. You hear her voice rise and fall — angry, then crying, then very quiet. When she comes out, her eyes are red. "Your mother is coming tomorrow. Alone. And you\'re staying here as long as you need. That\'s not a question, it\'s a fact."',
      'You sleep in the room with the quilt she made when you were born. The wind chimes play all night. For the first time in months, nothing else does.']));
  };
})(window.SH);
