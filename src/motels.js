/* SMALL HOURS — Part 3a: motels. Three kinds:
   pro (chain, ID + card, no haggling, spots fakes), loose (family-run, asks questions, haggles), sloppy (cash, no questions).
   Check-in is a free-text conversation with the clerk: tell a story, name a price, ask for a week or a month (prepaying is cheaper).
   Your room = real sleep, a shower, a charger. Things that can get you kicked out: noise, a spooked manager, a police drive-by,
   late payment, a new clerk with questions. Never crowding (house rule). Groups: separate rooms, or +$5 a head in one. */
(function (SH) {
  const K = SH.K, A = SH.Atlas; if (!K || !A) return;
  const G = K.G;
  const KIND = { pro: { rate: 79, floor: 1, sus: 40 }, loose: { rate: 49, floor: 0.72, sus: 15 }, sloppy: { rate: 32, floor: 0.6, sus: 0 } };
  const NAMES = { pro: ['Starlite Inn & Suites', 'Comfort Harbor Inn', 'Roadway Express Inn'], loose: ['Pine Rest Motel', 'The Bluebird Motor Court', 'Sunset Vista Motel'], sloppy: ['Budget 8 Motel', 'Econo Stay', 'The Lamplighter Motor Lodge'] };
  const CLERKS = { pro: ['Brianna', 'Marcus', 'Deb'], loose: ['Mrs. Patel', 'Mr. Oduya', 'Gloria'], sloppy: ['Vic', 'Randy', 'a guy named Stu'] };
  const hash = (s) => [...s].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7);
  function motels(p) {
    const n = { village: 0, small: 1, town: 2, city: 3 }[p.tier] || 0, h = hash(p.id), out = [];
    const kinds = p.tier === 'small' ? [h % 2 ? 'loose' : 'sloppy'] : p.tier === 'town' ? ['pro', h % 2 ? 'loose' : 'sloppy'] : ['pro', 'loose', 'sloppy'];
    kinds.slice(0, n).forEach((k, i) => { const j = (h >> (i + 2)) % 3; out.push({ i, k, n: NAMES[k][j], clerk: CLERKS[k][(j + i) % 3], rate: Math.round(KIND[k].rate * (p.tier === 'city' ? 1.2 : p.tier === 'small' ? 0.85 : 1)) }); });
    return out;
  }
  const quote = (m, len) => (len === 'month' ? Math.round(m.rate * 22) : len === 'week' ? m.rate * 6 : m.rate);
  const LEN = { night: 1, week: 7, month: 30 };

  /* ---------- the clerk brain (free text) ---------- */
  SH.Brain.clerk = function (an, c) {
    const m = c.opts.m, k = m.k, mem = c.mem, t = an.t, raw = (an.raw || '').toLowerCase(), g = G();
    mem.sus = mem.sus || 0; mem.len = mem.len || 'night'; mem.ask = mem.ask || quote(m, mem.len);
    const S = (say, x) => K.say(say, x);
    const floor = () => Math.round(quote(m, mem.len) * KIND[k].floor);
    if (/\b(week|7 nights|seven nights)\b/.test(t) && mem.len !== 'week') { mem.len = 'week'; mem.ask = quote(m, 'week'); return S(`A week's $${mem.ask}. That's one night free, basically.${k === 'pro' ? ' Card on file.' : ''}`); }
    if (/\bmonth\b/.test(t) && mem.len !== 'month') { mem.len = 'month'; mem.ask = quote(m, 'month'); return S(k === 'pro' ? `Monthly is $${mem.ask}, and I'd need a manager to approve it. And an adult on the reservation.` : `A month? $${mem.ask}, paid up front. Cheapest way to do it.`); }
    if (/\b(ran away|run away|running away|no parents|nobody knows|i'?m (alone|by myself|12|twelve|11|13))\b/.test(t)) {
      if (k === 'sloppy') { mem.sus += 10; return S('Didn\'t hear that. Didn\'t hear anything. You got cash or not?'); }
      mem.sus += 60; c.result = k === 'pro' ? 'call' : 'refuse'; return S(k === 'pro' ? 'Okay. Okay, sweetie, stay right there, I\'m going to call someone who can help, alright?' : 'Oh, honey. No. I can\'t rent you a room. But there\'s a youth line on this card: take it. Please.', { end: true });
    }
    if (/\b(i'?m|we'?re|i am) (18|eighteen|an adult|adults|grown)\b/.test(t)) { mem.sus += 25; return S(k === 'sloppy' ? 'Sure you are. Doesn\'t matter to me.' : 'Uh huh. And I\'m the Queen of England.'); }
    if (/\b(id|license|card)\b/.test(t) && g.fakeId) {
      const f = g.fakeId, caught = k === 'pro' ? (f.q === 'bad' || K.chance(0.6)) : k === 'loose' ? f.q === 'bad' && K.chance(0.6) : false;
      if (caught) { mem.sus += 50; c.result = 'fake'; return S(`The clerk tilts the card under the light. Then tilts it back. "I'm going to hang on to this, okay?" ${k === 'pro' ? 'She picks up the phone.' : 'He doesn\'t pick up the phone. Yet.'}`, { end: true }); }
      mem.id = 1; mem.sus = Math.max(0, mem.sus - 20); return S(k === 'pro' ? `"${f.name}." She types for a while. "Okay, ${f.name.split(' ')[0]}. $${mem.ask}${mem.len === 'night' ? ' a night' : ''}. Cash deposit's fine."` : 'Close enough for me. So: how long?');
    }
    if (/\b(mom|dad|mum|parents?|aunt|uncle|grandma|grandpa|brother|sister|cousin|coach|guardian)\b/.test(t) && /\b(car|outside|parking|park|coming|on (her|his|their|the) way|work|late|tired|asleep|sleeping|sent me|told me|downstairs|gas)\b/.test(t)) {
      mem.story = 'adult'; mem.sus += KIND[k].sus * (mem.storyTold ? 1.5 : 1); mem.storyTold = 1;
      if (k === 'pro') return S(mem.id ? 'Mm-hm. I just need the adult to come in and sign.' : 'That\'s fine, they\'ll just need to come in with an ID and a card. Policy.');
      return S(k === 'loose' ? `${K.pick(['Your mom sent you in by yourself?', 'In the car, huh?'])} ${mem.sus > 40 ? 'I\'d like to meet her.' : 'Alright. Well. I\'ll need her to sign in the morning.'} It's $${mem.ask}.` : 'Whatever. $' + mem.ask + '.');
    }
    if (/\b(tournament|team|school trip|field trip|band trip|competition|hockey|soccer|swim meet)\b/.test(t)) { mem.story = 'team'; mem.sus += k === 'pro' ? 20 : 5; return S(k === 'loose' ? 'Oh, the tournament! The Hendersons had a team through last month. Where\'s your coach?' : 'Coach needs to book it.'); }
    const num = raw.match(/\$?\s?(\d{1,4})(?:\s?(?:bucks|dollars))?/);
    if (num && /\d/.test(raw) && !/\b(nights?|days?|people|of us|years?)\b/.test(raw.slice(raw.indexOf(num[1]) + num[1].length, raw.indexOf(num[1]) + num[1].length + 8))) {
      const offer = +num[1]; mem.irk = (mem.irk || 0) + 1;
      if (k === 'pro') return S(`Rates are the rates. $${mem.ask}. I don't set them.`);
      if (offer >= mem.ask) { mem.deal = mem.ask; c.result = 'deal'; return S(`$${mem.ask}'s the price. Deal.`, { end: true }); }
      if (mem.irk > 3) return S('I\'m done haggling. $' + mem.ask + ' or the door.');
      if (offer >= floor()) { if (mem.lastOffer && offer >= mem.lastOffer && offer >= (mem.ask + floor()) / 2) { mem.deal = offer; c.result = 'deal'; return S(`...Fine. $${offer}. Don't tell anybody.`, { end: true }); } mem.ask = Math.round((mem.ask + offer) / 2 + 1); mem.lastOffer = offer; return S(K.pick([`$${mem.ask}.`, `Meet me at $${mem.ask}.`, `I can do $${mem.ask}. That's it.`])); }
      return S(k === 'sloppy' ? `$${offer}? Get outta here. $${mem.ask}.` : `Oh, sweetheart, no. $${mem.ask}.`);
    }
    if (/\b(deal|ok(ay)?|fine|sure|yes|yeah|i'?ll take it|sounds good|that works|alright)\b/.test(t) && c.turn > 1) {
      if (k === 'pro' && !mem.id) return S('I still need that ID and an adult signature, hon.');
      if (k === 'loose' && mem.sus >= 55) { c.result = 'refuse'; return S('I don\'t think so. I\'m sorry. Something here isn\'t right, and I\'d never forgive myself.', { end: true }); }
      mem.deal = mem.ask; c.result = 'deal'; return S(`Room ${10 + (hash(m.n) % 30)}. Checkout's at eleven.`, { end: true });
    }
    if (an.q && /\b(price|cost|how much|rate)\b/.test(t)) return S(`$${quote(m, 'night')} a night, $${quote(m, 'week')} a week${k === 'pro' ? '' : ', $' + quote(m, 'month') + ' a month'}.`);
    if (mem.sus >= 70 && k !== 'sloppy') { c.result = k === 'pro' ? 'call' : 'refuse'; return S('I think you should go. Actually, wait here a sec.', { end: true }); }
    return S(K.pick(k === 'pro' ? ['Checking in? I\'ll need an ID and a card.', 'Do you have a reservation?'] : k === 'loose' ? ['How many nights, hon?', 'Where are your folks?', 'It\'s $' + mem.ask + '. You paying cash?'] : ['Cash. Nightly. What do you want.', '$' + mem.ask + '. Yes or no.']));
  };

  function desk(p, m) {
    const g = G(); K.npc('clerk', m.clerk.replace(/^a guy named /, ''), `${m.n} front desk`, m.k === 'pro' ? '#3b6ea8' : m.k === 'loose' ? '#a8763b' : '#6b6b6b');
    const intro = m.k === 'pro' ? `A lobby that smells like waffles and carpet shampoo. ${m.clerk} smiles the corporate smile. There's a sign: "Guests must be 21+ with valid photo ID."` : m.k === 'loose' ? `A bell on the counter, a TV playing game shows, a cat asleep on the guest book. ${m.clerk} looks at you over reading glasses.` : `A window with bulletproof glass and a slot. ${m.clerk} is eating chips and doesn't look up.`;
    SH.Talk.open('clerk', { intro, first: m.k === 'sloppy' ? 'Yeah?' : m.k === 'loose' ? 'Well hi there. Just you?' : 'Hi! Welcome to ' + m.n + '. Checking in?', turnsMax: 10, m, onEnd: (c) => endDesk(p, m, c) });
  }
  function endDesk(p, m, c) {
    const g = G(), r = c.result;
    if (r === 'call') { g.flags.clerkCalled = m.n; g.awayNotice = (g.awayNotice || 0) + 70; g.heat = (g.heat || 0) + 10; if (A.noticed(p, 0.3)) return; return K.D(m.n, 'You don\'t wait to find out who she\'s calling. You walk out fast, not running, and around the corner, and then you run.'); }
    if (r === 'fake') { g.flags.fakeCaught = m.n; g.fakeId = null; g.heat = (g.heat || 0) + 20; g.awayNotice = (g.awayNotice || 0) + (m.k === 'pro' ? 50 : 20); if (A.noticed(p, 0.2)) return; return K.D(m.n, 'You leave the ID on the counter. Sixty dollars, gone. Your face is hot all the way down the block.'); }
    if (r !== 'deal') return K.D(m.n, 'You leave without a room.', K.ok());
    const nights = LEN[c.mem.len], price = c.mem.deal, grp = K.grp();
    const one = price + (grp - 1) * 5 * nights, sep = price * Math.ceil(grp / 2);
    const book = (total, how) => { if (!K.pay(total, `${m.n}: ${nights} night${nights > 1 ? 's' : ''}`)) return K.back(); g.room = { pid: p.id, n: m.n, k: m.k, mi: m.i, clerk: m.clerk, rate: Math.round(total / nights), until: Math.floor(g.t / 1440) * 1440 + nights * 1440 + 660, how, grp }; SH.UI.log(`Checked in at ${m.n}. Paid $${total}.`, 'sys'); roomMenu(p); };
    if (grp === 1) return book(price, 'solo');
    K.D(m.n, `There are ${grp} of you.`, [{ t: `One room, everyone squeezes in: $${one}`, sub: '+$5 a head per night', fn: () => book(one, 'one') }, { t: `${Math.ceil(grp / 2)} rooms side by side: $${sep}`, fn: () => book(sep, 'sep') }, { t: 'Never mind', fn: K.back }]);
  }
  const here = (p) => G().room && G().room.pid === p.id;
  function roomMenu(p) {
    const g = G(), r = g.room, left = Math.max(0, Math.ceil((r.until - g.t) / 1440)), dark = SH.hour() >= 20 || SH.hour() < 6;
    K.D(`${r.n}, your room`, [`Two beds with scratchy bedspreads, a TV bolted to the dresser, a painting of a duck. ${left > 0 ? left + ' night' + (left > 1 ? 's' : '') + ' paid.' : 'You owe for tonight.'}`], [
      { t: dark ? 'Sleep (a real bed)' : 'Nap (2 hours)', cls: 'safe', fn: () => sleep(p, dark) },
      { t: 'Shower', sub: 'Hot water. Actual soap.', fn: () => { SH.advance(20, { interrupt: false }); SH.st('hyg', 100); SH.st('mood', 6); roomMenu(p); } },
      { t: 'Charge your phone', fn: () => { SH.advance(60, { interrupt: false }); g.phone.bat = 100; SH.UI.toast('Phone: 100%'); roomMenu(p); } },
      { t: `Pay another night ($${r.rate})`, fn: () => { if (K.pay(r.rate, r.n)) r.until += 1440; roomMenu(p); } },
      { t: 'Check out', fn: () => { g.room = null; SH.UI.log('You leave the key on the dresser.', 'sys'); K.back(); } },
      { t: 'Go back out', fn: K.back }]);
  }
  function sleep(p, dark) {
    const g = G(); SH.advance(dark ? 8 * 60 : 120, { interrupt: false }); if (g.ended) return;
    SH.st('energy', dark ? 70 : 25); SH.st('warmth', 40); SH.st('stress', -12); SH.st('mood', 8); g.phone.bat = 100;
    if (A.noticed(p, 0.03)) return; if (g.roomEvt) return event(p);
    K.D('Morning', K.pick(['You sleep like you fell off a cliff. The ice machine hums all night and you don\'t hear it once.', 'You wake up and for three whole seconds you forget where you are.', 'Real sleep. In a real bed. Your body didn\'t know it was this tired.']), [{ t: 'Okay', fn: () => roomMenu(p) }]);
  }
  /* ---------- daily motel life: payment + trouble ---------- */
  K.daily.push(() => {
    const g = G(), r = g.room; if (!r || typeof r !== 'object') return;
    if (g.t > r.until) { r.late = (r.late || 0) + 1; if (r.late > (r.k === 'sloppy' ? 2 : 1)) g.roomEvt = 'late'; return; }
    const risk = { pro: 0.07, loose: 0.08, sloppy: 0.1 }[r.k]; if (!K.chance(risk)) return;
    const ev = ['spooked', 'police', 'newclerk']; if (K.party().length >= 2) ev.push('noise'); if (!g.reported) ev.splice(0, 1);
    g.roomEvt = K.pick(ev);
  });
  const EV = {
    late: (r) => [`${r.clerk} is at your door with a key card that doesn't work anymore. "You're ${r.late} days behind, kid. Room's locked. Your stuff's in a bag at the desk."`],
    noise: (r) => [`Someone bangs on the wall at midnight. In the morning ${r.clerk} is waiting. "Three complaints. Three. I don't care how many of you there are, I care that it's LOUD. You're out."`],
    spooked: (r) => [`The manager comes by with a printout in her hand and doesn't show it to you. She doesn't have to. "I need the room back. Today. I'm sorry." She means it, which is worse.`],
    police: (r) => ['A cruiser idles in the parking lot for twenty minutes, right outside your window. It isn\'t for you. Probably. You pack in four minutes flat and leave through the back stairwell.'],
    newclerk: (r) => [`There's a new clerk. He's read the guest list, and he has questions. "So which room is your mom in?" He writes things down. You decide not to be there tonight.`],
  };
  function event(p) { const g = G(), r = g.room, e = g.roomEvt; g.roomEvt = null; if (!r) return K.back(); g.room = null; if (e === 'spooked' || e === 'newclerk') g.awayNotice = (g.awayNotice || 0) + 15; K.D('Out', EV[e](r), K.ok()); }
  K.hub((p, ch, dark) => {
    if (G().roomEvt && here(p)) ch.unshift({ t: '⚠️ Something\'s wrong at the motel', cls: 'hot', fn: () => event(p) });
    if (here(p)) ch.unshift({ t: `🛏️ Your room at ${G().room.n}`, cls: 'safe', sub: 'Sleep, shower, charge', fn: () => roomMenu(p) });
    else if (motels(p).length) ch.push({ t: '🏨 Motels', sub: motels(p).map((m) => m.n).join(' · '), fn: () => K.D(`Motels in ${p.name}`, 'A room means a door that locks. Getting one at twelve is another story.', motels(p).map((m) => ({ t: `${m.n}: $${m.rate}/night`, sub: m.k === 'pro' ? 'Chain. Wants ID and a card.' : m.k === 'loose' ? 'Family-run. Asks questions. Haggles.' : 'Cash, no questions, bulletproof glass.', fn: () => desk(p, m) })).concat([{ t: 'Back', fn: K.back }])) });
  });
  SH.Motels = { motels, desk, roomMenu, event, quote, KIND };
})(window.SH);
