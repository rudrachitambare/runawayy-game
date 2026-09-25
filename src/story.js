/* SMALL HOURS — procedural story director.
   Every new game rolls a seed that decides: beat timing, which beats happen at all, the breaking point
   ("catalyst"), 3–4 side stories, Sam's trait, the weather, Mom's rota, Rick's bad days, Dex's pacing,
   the opening, and the daily inner-monologue lines. Same seed = same story skeleton. */
(function (SH) {
  const ST = SH.Story = {};
  const D = (o) => SH.UI.dialog(o);
  const log = (t, c) => SH.UI.log(t, c || 'sys');

  // ---------- seeded RNG ----------
  function rng(seed) { let a = seed >>> 0; return () => { a |= 0; a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
  ST.hashSeed = (s) => { s = String(s || '').trim(); if (/^\d+$/.test(s)) return (+s) % 1000000; let h = 2166136261; for (const ch of s) { h ^= ch.charCodeAt(0); h = Math.imul(h, 16777619); } return (h >>> 0) % 1000000; };
  const wdOf = (d) => (d - 1) % 7; // 0=Mon
  const isWk = (d) => wdOf(d) < 5;

  // snapshot pristine data once, so apply() is idempotent across rewinds / loads
  const BASE = { WEATHER: SH.WEATHER.slice(), MOM: SH.MOM_SHIFTS.slice(), RICK: (SH.RICK_DAY || []).slice(), LINES: Object.assign({}, SH.DAY_LINES) };

  ST.CATALYSTS = {
    juice: { n: 'The Spilled Juice', d: 'Rick turns on Lily over a spilled cup. You step in, or you don\'t.' },
    shoebox: { n: 'The Shoebox', d: 'Rick finds the money you\'ve been saving.' },
    lockout: { n: 'The Locked Door', d: 'A deadbolt, a cold porch, and nobody coming.' },
  };
  ST.TRAITS = {
    artist: { n: 'The Artist', d: 'You draw when things get loud. Your sketchbook is basically a second diary.', apply: (G) => { G.s.mood += 6; if (G.stash.includes('sketchbook')) { G.stash.splice(G.stash.indexOf('sketchbook'), 1); G.bag.push('sketchbook'); } } },
    bookworm: { n: 'The Bookworm', d: 'Books are a door you can close. Teachers like you. That\'s a mixed blessing.', apply: (G) => { G.grades += 14; G.rel.okafor += 10; } },
    skater: { n: 'The Skater', d: 'You and Jordan spend every free minute at the bowl in Riverside Park. You know every shortcut in town.', apply: (G) => { G.rel.jordan += 10; G.s.stress -= 5; G.s.energy += 6; } },
    caretaker: { n: 'The Big Sibling', d: 'You make Lily\'s lunches, check her homework, and know which turtle is Sheldon. Nobody asked you to.', apply: (G) => { G.rel.lily += 14; G.rel.mom += 5; G.s.stress += 6; } },
    joker: { n: 'The Class Clown', d: 'If you make them laugh first, they can\'t laugh at you. Mostly works.', apply: (G) => { G.rel.tyler += 15; G.s.mood += 4; G.grades -= 4; } },
  };
  ST.OPENINGS = [
    { log: ['Your alarm goes off at 7:00. It\'s the third alarm. The first two you don\'t remember.', 'Downstairs, the TV. Across the hall, Lily singing a song about turtles. On your phone, a text from Mom.'] },
    { log: ['You wake up before the alarm, which never happens. The house is holding its breath.', 'A beer can on the stairs. Lily\'s turtle backpack by the door. A text from Mom glowing on your phone.'] },
    { log: ['Rain on the window. You\'ve been awake since five, listening to the gutter drip.', 'Lily is already in your doorway in her pajamas, holding Sheldon. "Is it a school day?" It is. Your phone buzzes: Mom.'] },
    { log: ['You dreamed about the lake at Grandma\'s. You wake up with the feeling still on you, then it\'s gone.', 'The smell of burnt toast from somebody else\'s kitchen. The TV murmuring downstairs to nobody. A text from Mom, sent at 5:52.'] },
  ];

  const GENERIC_LINES = [
    'Mom\'s scrubs are on the chair. She came home at midnight and left at six.',
    'You slept four hours. The walls here are thin and Rick is loud.',
    'There\'s a new dent in the fridge door. Nobody mentions it.',
    'Lily drew you a picture: you, her, and a turtle the size of a house.',
    'The shower was cold again. Rick "forgot" to pay the gas on time.',
    'Somebody\'s car alarm went off at 3 AM. You were already awake.',
    'Everybody at school is talking about the Halloween dance. It feels like another planet.',
    'You counted the ceiling tiles again: 48. Same as yesterday.',
    'Rick is being nice this morning. That\'s almost scarier.',
    'Your shoes have a hole in the left toe now. You walk so nobody sees.',
    'The house looks the same. That\'s the worst part.',
    'You dreamed you were on a bus that never stopped. It wasn\'t a bad dream.',
    'Mom left a note on the counter: "Love you. Leftovers in fridge." There are no leftovers in the fridge.',
    'The neighbor\'s wind chimes are going. Mrs. Patel says they "keep the bad luck guessing."',
    'You forgot to eat dinner last night. Your stomach remembered.',
    'Lily asked why Rick is "always tired." You told her grown-ups are like that.',
  ];
  const WEEKEND_LINES = ['Saturday. The house is quiet in the dangerous way.', 'Sunday. Church bells from across the river. Nobody here goes anymore.', 'No school. Twelve hours to fill in a house that\'s too small.'];

  // ---------- generation ----------
  ST.generate = function (seed) {
    const R = rng(seed), ri = (a, b) => a + Math.floor(R() * (b - a + 1)), pk = (a) => a[Math.floor(R() * a.length)];
    const shuf = (a) => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(R() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
    const wkIn = (days) => { const w = days.filter(isWk); return pk(w.length ? w : days); };
    const P = { seed, dayMap: {}, skip: {}, lines: {}, extra: [] };

    P.catalyst = pk(Object.keys(ST.CATALYSTS));
    P.trait = pk(Object.keys(ST.TRAITS));
    P.opening = ri(0, ST.OPENINGS.length - 1);

    // --- core beat timing ---
    const m = P.dayMap;
    m.bully = wkIn([2, 3, 4]);
    m.okafor1 = wkIn([3, 4, 5].filter((d) => d !== m.bully).concat([m.bully + 1]));
    m.conference = wkIn([5, 8, 9]); m.confBack = m.conference;
    m.fight6 = pk([6, 7, 11, 13]);
    m.grandmaCall = pk([7, 9, 10, 11]);
    m.bill = ri(8, 10); m.bike = m.bill + ri(1, 2);
    m.play = wkIn([9, 10, 11]);
    m.moving = ri(10, 12); m.movingText = m.moving;
    const cat = pk([12, 13, 15, 16]);
    P.catDay = cat;
    const nextWk = (d) => { let x = d + 1; while (!isWk(x)) x++; return x; };
    m.bruiseSchool = nextWk(cat);
    m.cps = cat + 2;
    m.askOk = Math.min(20, cat + 3);
    m.bigNight = Math.min(20, Math.max(17, cat + ri(3, 4))); m.quietNight = m.bigNight;
    // optional beats — not every life has every chapter
    if (R() < 0.3) P.skip.bike = true;
    if (R() < 0.2) P.skip.play = true;
    if (R() < 0.4) { P.skip.moving = true; P.skip.movingText = true; }
    if (P.catalyst !== 'juice') P.skip.juice = true;
    if (P.catalyst === 'lockout') P.skip.bruiseSchool = true; // replaced by lockoutSchool
    P.catBeat = { juice: 'juice', shoebox: 'cat_shoebox', lockout: 'cat_lockout' }[P.catalyst];
    m[P.catBeat] = cat;
    if (P.catalyst === 'lockout') m.lockoutSchool = nextWk(cat);

    // --- side stories ---
    const used = new Set([cat, m.bigNight]);
    const pool = shuf(Object.keys(SH.SUBPLOTS || {}));
    P.subplots = pool.slice(0, ri(3, 4));
    P.subDays = {};
    P.subplots.forEach((k) => {
      const sp = SH.SUBPLOTS[k]; let d, tries = 0;
      do { d = ri(sp.range[0], sp.range[1]); if (sp.weekday) while (!isWk(d)) d++; tries++; } while (used.has(d) && tries < 12);
      used.add(d); P.subDays[k] = d;
    });

    // --- Dex pacing ---
    const d1 = ri(2, 3), d2 = d1 + ri(2, 3), d3 = d2 + ri(2, 4), d4 = d3 + ri(3, 4), d5 = Math.min(18, d4 + ri(3, 5));
    P.dex = [d1, d2, d3, d4, d5];

    // --- world ---
    P.weather = BASE.WEATHER.map((w, d) => {
      if (!w) return w; const hi = Math.round(64 - d * 0.75 + (R() * 8 - 4)), lo = hi - ri(11, 17);
      const r = R(); const c = r < 0.3 ? 'clear' : r < 0.58 ? 'cloudy' : r < 0.82 ? 'rain' : r < 0.92 ? 'fog' : 'storm';
      return { hi, lo, c };
    });
    // Mom's rota: shuffle weekdays within each week, then pin the few days the plot needs
    const mom = BASE.MOM.slice();
    for (let w = 0; w < 5; w++) { const idx = [1, 2, 3, 4, 5].map((i) => w * 7 + i).filter((i) => i < mom.length); const vals = shuf(idx.map((i) => mom[i])); idx.forEach((i, j) => (mom[i] = vals[j])); }
    mom[m.conference] = pk(['E', 'DD']); mom[14] = 'OFF'; mom[m.bigNight] = 'N';
    P.mom = mom;
    const rick = BASE.RICK.length ? BASE.RICK.map((v, d) => (v == null ? v : Math.max(0, Math.min(3, v + (R() < 0.35 ? (R() < 0.5 ? -1 : 1) : 0))))) : [];
    if (rick.length) { rick[cat] = 3; rick[m.bigNight] = 3; rick[m.fight6] = Math.max(2, rick[m.fight6] || 2); }
    P.rick = rick;
    P.jitter = { money: ri(2, 7), shoebox: ri(15, 34), mom: ri(-8, 8), rick: ri(-8, 6), lily: ri(-6, 8), jordan: ri(-8, 8), grandma: ri(-6, 10) };

    // --- inner monologue for each morning ---
    const beatLine = {
      [m.conference]: 'Parent-teacher conferences today. You already know who won\'t come.',
      [m.bill]: 'The phone bill came. Rick left it on the counter like evidence.',
      [m.bully]: 'Tyler has been staring at you all week. You know what that means.',
      14: 'Mom\'s day off. The house smells like pancakes, which is almost suspicious.',
      [m.bigNight]: 'Mom\'s on nights. It\'s just you, Lily, and Rick.',
    };
    if (!P.skip.bike) beatLine[m.bike] = 'Your bike is in the garage. For now.';
    if (!P.skip.play) beatLine[m.play] = 'Lily\'s school play is tonight. She\'s a turtle. She\'s been practicing for weeks.';
    if (!P.skip.moving) beatLine[m.moving] = 'Jordan texted at 1 AM: "can u talk tmrw. its important"';
    beatLine[cat + 1] = { juice: 'You didn\'t sleep much. Every sound in the house is too loud now.', shoebox: 'The shoebox under your bed is empty. You keep checking anyway.', lockout: 'You can still feel the cold of the porch in your fingers.' }[P.catalyst];
    P.subplots.forEach((k) => { const L = SH.SUBPLOTS[k].line; if (L && !beatLine[P.subDays[k]]) beatLine[P.subDays[k]] = L; });
    const gen = shuf(GENERIC_LINES), wkd = shuf(WEEKEND_LINES);
    let gi = 0, wi = 0;
    for (let d = 2; d <= 22; d++) P.lines[d] = beatLine[d] || (isWk(d) ? gen[gi++ % gen.length] : wkd[wi++ % wkd.length]);
    P.lines[1] = pk(['The fridge hums. The TV is already on downstairs. It is always already on.', 'Monday. Three weeks until Halloween. It feels further.', 'The first cold morning of October. Your breath fogs at the bus stop.']);
    return P;
  };

  // ---------- apply to the running game ----------
  ST.apply = function () {
    const G = SH.G; const P = G && G.story; if (!P) return;
    SH.WEATHER.length = 0; P.weather.forEach((w) => SH.WEATHER.push(w));
    SH.MOM_SHIFTS.length = 0; P.mom.forEach((v) => SH.MOM_SHIFTS.push(v));
    if (SH.RICK_DAY && P.rick.length) { SH.RICK_DAY.length = 0; P.rick.forEach((v) => SH.RICK_DAY.push(v)); }
    Object.keys(SH.DAY_LINES).forEach((k) => delete SH.DAY_LINES[k]); Object.assign(SH.DAY_LINES, P.lines);
    ST.installBeats();
  };
  ST.dayOf = (e) => { const P = SH.G && SH.G.story; return P && P.dayMap[e.id] != null ? P.dayMap[e.id] : e.d; };
  ST.skipped = (e) => { const P = SH.G && SH.G.story; if (!P) return /^cat_|^lockoutSchool$|^sp_/.test(e.id); return !!(P.skip[e.id] || (e.sub && !P.subplots.includes(e.sub)) || (/^cat_/.test(e.id) && e.id !== P.catBeat) || (e.id === 'juice' && P.catBeat !== 'juice') || (e.id === 'lockoutSchool' && P.catalyst !== 'lockout')); };

  ST.init = function (seedInput) {
    const G = SH.G;
    const seed = seedInput != null && String(seedInput).trim() !== '' ? ST.hashSeed(seedInput) : Math.floor(Math.random() * 1000000);
    const P = G.story = ST.generate(seed);
    // starting-condition jitter
    const J = P.jitter; G.money = J.money; G.shoebox = J.shoebox;
    ['mom', 'rick', 'lily', 'jordan', 'grandma'].forEach((k) => (G.rel[k] += J[k]));
    ST.TRAITS[P.trait].apply(G);
    Object.keys(G.s).forEach((k) => (G.s[k] = Math.max(0, Math.min(100, G.s[k]))));
    ST.apply();
  };

  ST.summary = function () {
    const P = SH.G.story; if (!P) return '';
    return `Story #${P.seed} · ${ST.TRAITS[P.trait].n} · Breaking point: ${ST.CATALYSTS[P.catalyst].n} · Side stories: ${P.subplots.map((k) => SH.SUBPLOTS[k].n).join(', ')}`;
  };

  // ---------- catalyst beats + side-story beats get merged into the scripted list ----------
  const home = () => SH.G.phase === 'home' && SH.G.loc === 'home';
  const atSchool = () => SH.G.loc === 'school' && SH.isWeekday() && SH.hour() >= 8 && SH.hour() < 15;
  ST.home = home; ST.atSchool = atSchool;

  ST.CAT_BEATS = [
    { id: 'cat_shoebox', d: 15, h: [19, 23.5], c: () => home() && SH.rickWhere() === 'home' && !SH.f('rickGone'), run: () => {
      const G = SH.G, amt = G.shoebox;
      D({ title: 'The Shoebox', who: 'rick', text: ['Your bedroom door is open. It\'s never open.', `Rick is sitting on your bed with the shoebox in his lap. The photos are spilled on the floor. He's holding the money: $${amt}, fanned out like a card hand.`, '"Where does a twelve-year-old get this kind of cash? Huh? You stealing from your mother? From ME?"'],
        choices: [
          { t: '"It\'s mine. I saved it." Reach for it.', cls: 'hot', fn: () => { SH.flag('bruise'); SH.flag('runUnlocked'); SH.tag('grabbed'); SH.tag('shoeboxTaken'); G.shoebox = 0; SH.rel('rick', -22); SH.st('stress', 24); SH.st('health', -5);
            D({ title: 'His Grip', text: ['Your hand closes on the bills. His closes on your wrist.', 'He squeezes until your fingers open by themselves. He doesn\'t say anything. He doesn\'t have to. Then he pockets the money and steps over the photos on his way out.', 'Your wrist is red, then purple. You pick up the photos one by one. The one of Grandma at the lake has a bootprint on it.'], choices: [{ t: 'Put the photos back', fn: () => { SH.st('mood', -12); } }] }); } },
          { t: 'Say nothing. Let him take it.', fn: () => { SH.flag('runUnlocked'); SH.tag('shoeboxTaken'); G.shoebox = 0; SH.st('mood', -18); SH.st('stress', 16);
            D({ title: 'Gone', text: ['He counts it in front of you. Twice. "Rent money," he says, and leaves.', `$${amt}. Three months of Patel dog-walks and birthday cards and lunch money you didn't spend.`, 'Lily peeks in after. She puts her tooth-fairy dollar in the empty box and pushes it under your bed without a word.'], choices: [{ t: 'Hug her', fn: () => { SH.rel('lily', 8); } }] }); } },
        ] }); } },
    { id: 'cat_lockout', d: 15, h: [21.5, 23.9], c: () => home() && SH.rickWhere() === 'home' && !SH.f('rickGone'), run: () => {
      const G = SH.G;
      D({ title: 'The Locked Door', who: 'rick', text: [`"Trash." Rick doesn't look away from the TV. You take the bag out to the curb in your socks. It's ${SH.tempF()}°F.`, 'Behind you: the deadbolt. Click.', 'Through the door, muffled: "Maybe next time you\'ll remember to take it out BEFORE I ask." The porch light goes off.'],
        choices: [
          { t: 'Knock. Keep knocking.', fn: () => { SH.flag('runUnlocked'); SH.flag('lockedOut'); SH.tag('lockedOut'); SH.advance(150, { interrupt: false }); SH.st('warmth', -30); SH.st('health', -6); SH.st('stress', 20);
            log('Nobody comes. At 1 AM the back window slides open an inch. Lily, in her turtle pajamas, whispering: "I waited till he was snoring." You climb in over the sink. She makes you promise not to tell that she helped.', 'bad'); SH.rel('lily', 10); } },
          { t: 'Go to Mrs. Patel\'s porch', cls: 'safe', fn: () => { SH.flag('runUnlocked'); SH.flag('lockedOut'); SH.flag('patelKnows'); SH.tag('lockedOut'); SH.rel('patel', 20); SH.advance(60, { interrupt: false });
            log('Her porch light comes on before you knock. Newton barks once. Mrs. Patel takes one look at your socks and wraps you in an afghan that smells like cardamom. She makes cocoa. She calls your mom\'s cell and leaves a message in a voice you\'ve never heard her use. At midnight she walks you back and stands on the step until Rick opens the door.', 'good'); } },
          { t: 'Wait it out in the garage', fn: () => { SH.flag('runUnlocked'); SH.flag('lockedOut'); SH.tag('lockedOut'); SH.advance(240, { interrupt: false }); SH.st('warmth', -20); SH.st('health', -4); SH.st('mood', -12);
            log('The side door of the garage doesn\'t lock. You sit on an upturned bucket between the lawnmower and the spot where your bike used to be, and you do the math on how many nights you could do this. More than one. The thought scares you less than it should.', 'bad'); } },
        ] }); } },
    { id: 'lockoutSchool', d: 16, h: [9, 14], c: () => atSchool() && SH.f('lockedOut') && !SH.f('toldCounselor'), run: () => D({
      title: 'Room 204', who: 'okafor', text: ['You fall asleep in second period with your cheek on your math book. Mr. Dale doesn\'t yell. He writes a pass.', 'Ms. Okafor looks at yesterday\'s hoodie, the gray under your eyes. "Rough night?" She waits. "You can tell me how rough."'],
      choices: [{ t: 'Tell her (type it)', cls: 'safe', fn: () => SH.Talk.open('okafor', { ctx: 'bruise', turnsMax: 8 }) }, { t: '"Just stayed up gaming."', fn: () => { SH.rel('okafor', -2); log('"Okay." She doesn\'t believe you and doesn\'t pretend to. "My door."', 'sys'); } }] }) },
  ];

  ST.installBeats = function () {
    const S = SH.Events.scripted; if (!S || ST._installed) return;
    ST._installed = true;
    ST.CAT_BEATS.forEach((b) => S.push(b));
    Object.entries(SH.SUBPLOTS || {}).forEach(([k, sp]) => sp.beats.forEach((b, i) => {
      S.push(Object.assign({}, b, { sub: k, id: 'sp_' + k + '_' + i, d: 0 }));
    }));
    // subplot beat days are relative to the subplot's rolled day
    const od = ST.dayOf;
    ST.dayOf = (e) => { const P = SH.G && SH.G.story; if (P && e.sub) { const b = SH.SUBPLOTS[e.sub].beats[+e.id.split('_').pop()]; return (P.subDays[e.sub] || 99) + (b.off || 0); } return od(e); };
  };
})(window.SH);
