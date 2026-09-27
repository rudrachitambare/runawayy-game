/* SMALL HOURS — towns as real places (4/5): talking to the people who live there.
   Every townie has a name, a job, a mood, a place they're usually standing, and a memory of you: what you told
   them, which name you gave, whether you lied. They answer real questions about their town (where's the motel,
   when's the bus, is there work, where's Larkspur Lane) and they don't ask you the same thing twice. */
(function (SH) {
  const TW = SH.Town; if (!TW) return;
  const TT = SH.TownTalk = {};
  const G = () => SH.G;
  const pick = (a) => a[Math.floor(Math.random() * a.length)];
  const loc = (k) => { const T = TW.cur(); return T && T.locs[TW.id(T.pid, k)]; };
  const mem = (q) => { const st = TW.st(); st.met[q.id] = st.met[q.id] || { n: 0, told: {}, sus: 0, fed: -1 }; return st.met[q.id]; };
  const is = (q, re) => re.test(q.mood);

  const seen = (q) => { const p = SH.Atlas.here(); return !SH.Net || !SH.Net.knowsFace || SH.Net.knowsFace(p, q); };
  TT.opener = function (q, L) {
    const m = mem(q), g = G(), h = SH.hour(), rep = !!g.reported, T = TW.cur();
    m.n++;
    if (m.n > 1) return pick(m.told.name ? [`Hey, ${m.told.name}. Back again.`, `${m.told.name}! Still in town, huh?`, `Well, look who it is. ${m.told.name}, right?`] : ['Oh, hey. You again.', 'Back again, kiddo?', 'You\'re becoming a regular.']);
    const job = q.kind === 'diner' ? (h < 11 ? 'What can I get you, hon? Kitchen\'s doing breakfast till eleven.' : 'What can I get you?')   : q.kind === 'gas' ? pick(['Pump or inside?', 'Hot dogs are fresh. Well. They\'re hot.', 'Just holler if you need the bathroom key.']) : /librar/.test(q.role) ? 'Can I help you find something? Or just here for the outlets? That\'s allowed.' : /pastor/.test(q.role) ? 'Hello there. Door\'s always open. You\'re welcome to sit as long as you like.' : /laundr|keeps/.test(q.role) ? 'Dryer four eats quarters, just so you know.' : /foreman|farm|co-op/.test(q.role) ? 'Help you with something, kid? This isn\'t really a place to hang around.' : /bus|waiting/.test(q.role) ? 'You waiting on the 3:15 too? It\'s always late.' : '';
    if (is(q, /too friendly/)) return `Well hi there! I'm ${q.n}. You look like you could use a friend. ${job}`;
    if (is(q, /suspicious/)) return rep && T.tier !== 'city' && seen(q) ? `...Do I know you from somewhere?` : `Can I help you with something?`;
    if (is(q, /busy/)) return job || `Mm-hm?`;
    if (is(q, /lonely|talks too much|cheerful/)) return T.tier === 'village' || T.tier === 'small' ? `Well hey there! I'm ${q.n}. I don't think I know you, and I know everybody. ${job}` : `Well hey there! I'm ${q.n}. ${job || 'What can I do for you?'}`;
    if (is(q, /nosy/)) return `Hi, sweetie. Whose are you? ${job}`;
    return job || `${q.n}. You need something, kid?`;
  };

  /* small-town knowledge: where things are, from someone who lives here */
  function where(q, t, T, p) {
    const say = (k, s) => { const L = loc(k); if (!L) return null; if (L.hidden) { L.hidden = false; SH.Map && (SH.Map.cache = null); } return s(L); };
    if (/motel|hotel|room|place to stay|sleep/.test(t)) return say('motel', (L) => `${L.name}, out by the highway. ${/\bstrip\b/i.test(L.name) ? L.sub.split(' · ').join(', ') + '. ' : ''}${is(q, /nosy|suspicious/) ? 'Why, you need a room? At your age?' : 'Tell \'em I sent you, won\'t do any good but it\'s nice.'}`) || 'Motel? Here? Nearest one\'s the next town over. People stay with family here.';
    if (/bus|train|leave|get out of|ride|station/.test(t)) return (loc('station') && /train|station/.test(t) ? `Station's ${loc('station').name}. ` : '') + `Buses stop at ${loc('stop').name.toLowerCase()}. ${T.tier === 'village' ? 'Couple times a day, if you\'re lucky.' : 'There\'s a board with the times.'}`;
    if (/bathroom|restroom|toilet|pee/.test(t)) return loc('gas') ? `${loc('gas').name} has one. Ask for the key, it's on a hubcap.` : 'Library, if it\'s open. Or the park, if you\'re brave.';
    if (/wifi|internet|charge|outlet/.test(t)) return `${(p.services.wifi || ['library'])[0].replace(/^./, (c) => c.toUpperCase())}. Password's usually on the counter.`;
    if (/library/.test(t)) return say('library', (L) => `${L.name}, ${L.hours ? `open ${L.hours[0]} till ${L.hours[1] > 12 ? L.hours[1] - 12 : L.hours[1]}` : 'right there'}.`) || 'We don\'t have one. There\'s a bookmobile Thursdays.';
    if (/food|eat|hungry|grocer|store/.test(t)) return (loc('diner') ? `${loc('diner').name} for a real meal. ` : '') + (loc('gas') ? `${loc('gas').name} for snacks. ` : '') + (loc('church') ? `And ${loc('church').name} does a supper Wednesdays, free.` : '');
    if (/laundromat/.test(t)) return say('laundromat', (L) => `${L.name}, on ${T.street}. Warm in there. Nobody minds if you sit.`);
    if (/church/.test(t)) return say('church', (L) => `${L.name}. Side door's never locked.`);
    if (/police|cop|sheriff/.test(t)) return p.hasPolice ? `Station's on ${T.street}. Why, you in trouble?` : 'Sheriff\'s thirty-five minutes out. We mostly handle things ourselves.';
    if (/shelter|youth|safe place|homeless/.test(t)) return say('shelter', (L) => `${L.name}. The brick house with the porch light. They're good people. You didn't hear it from me.`) || 'Nearest shelter\'s in the city. There\'s a number, though. The library has flyers.';
    if (/work|job|money/.test(t)) return say('work', (L) => `${L.short ? L.short[0].toUpperCase() + L.short.slice(1) : L.name}, if anybody's hiring. They sometimes need a hand, cash.`);
    if (/larkspur|grandma|grandmother|nana/.test(t)) {
      if (p.grandma) return say('grandma', (L) => { SH.flag('grandmaAddr'); return /grandma|nana|grandmother/.test(t) && !/larkspur/.test(t) ? SH.nm(`Your grandma lives here? What's her name? ...Oh! ${(SH.G.fam && SH.G.fam.gma) || 'Rose'}! Larkspur Lane, blue door. Everybody knows ${(SH.G.fam && SH.G.fam.gma) || 'Rose'}. She's gonna be so happy.`) : `Larkspur? That's up past the school. Little houses. Pretty street.`; });
      return 'Never heard of it, hon. You sure you\'ve got the right town?';
    }
    return null;
  }

  function smalltalk(q, T, p) {
    const topics = {
      counter: ['Pie\'s fresh. Well. Fresh-ish.', 'Coffee\'s been on since five. It tastes like it.', `You know what ${p.name} is famous for? ${p.motto ? p.motto.replace(/^(home of|famous for|birthplace of) (the )?/i, '').replace(/^./, (c) => c.toUpperCase()) : 'Nothing'}. Don't tell anybody.`],
      librar: ['I just got the new ones in. Nobody reads anymore. Except the ones who really read. You look like a real reader.', 'Outlets are by the large print. Nobody\'s using them. Nobody under eighty, anyway.'],
      pastor: ['I\'m not going to preach at you. It\'s Tuesday. I only preach on Sundays.', 'You look like you\'re carrying something heavy. And I don\'t mean the backpack.'],
      laundr: ['This machine\'s older than me. Runs better, too.', 'You wouldn\'t believe what people leave in their pockets. Found a lottery ticket once. Lost, of course.'],
      foreman: [`${(p.econ || ['work'])[0]} doesn't wait for anybody. Neither does the weather.`, 'My grandpa worked here. My dad worked here. My kid says he\'s going to be a YouTuber.'],
      mail: ['I know every dog on every route. The dogs like me more than the people do.', 'Rain, snow, the whole thing. It\'s not a motto, it\'s a warning.'],
      teacher: ['Taught thirty-one years. I can tell when a kid\'s hiding something from across a football field. Just so you know.', 'Everybody here was in my class, or their kids were. That\'s the thing about a small town.'],
      default: ['Weather\'s turning.', `Not much happens in ${p.name}. That's how we like it.`, 'You\'re not from around here, are you?'],
    };
    const k = Object.keys(topics).find((x) => q.role.includes(x)) || (/register|clerk/.test(q.role) ? 'counter' : 'default');
    return SH.TownText.pk('st_' + q.id, [...new Set(topics[k].concat(topics.default))]);
  }


  /* ---------- topics: what are we talking about, and what about it ---------- */
  const TOPIC = [
    ['sleep', /\b(sleep|spend the night|stay tonight|somewhere to stay|where (can|do) (i|people) stay)\b/],
    ['grandma', /\b(larkspur|grandma|grandmother|nana)\b/], ['wifi', /\b(wi-?fi|internet|password|online|network)\b/], ['bathroom', /\b(bathroom|restroom|toilet|pee)\b/],
    ['shelter', /\b(shelter|youth (center|house)|safe place|homeless)\b/], ['police', /\b(police|cops?|sheriff)\b/], ['clinic', /\b(doctor|clinic|hospital|nurse|sick|medicine)\b/],
    ['motel', /\b(motel|hotel|a room|rooms|place to (stay|sleep)|stay the night|crash)\b/], ['station', /\b(train|trains|railway|station|platform)\b/], ['stop', /\b(bus|buses|coach|next ride|get out of (here|town)|leave town)\b/],
    ['library', /\b(library|librarian|books)\b/], ['laundromat', /\b(laundr\w*|wash (my )?clothes|dryers?)\b/], ['church', /\b(church|pastor|pantry|supper)\b/],
    ['diner', /\b(diner|restaurant|pancakes?|breakfast|pie)\b/], ['gas', /\b(gas station|gas|snacks?|hot ?dogs?)\b/], ['park', /\b(park|playground|benches?)\b/],
    ['work', /\b(work|jobs?|hiring|odd jobs?)\b/], ['charge', /\b(charge|charger|outlet|battery)\b/],
  ];
  const FACET = [['password', /\bpassword\b/], ['dest', /\bwhere (does|do) (it|they|that|the \w+) go\b|\bwhere('s| is) (it|that) (going|headed)\b|\bwhich (towns|places|cities)\b|\bgo(es)? to\b/], ['cost', /\b(how much|cost|costs|price|expensive|cheap|charge for)\b/], ['open', /\b(open|opens|close|closes|closed|hours)\b/], ['far', /\b(how far|far|how long (does it take|to walk)|distance|walk there)\b/], ['when', /\b(when|what time|next one|how often)\b/], ['where', /\b(where|how do i get|which way|directions|find it)\b/]];
  const hh = (x) => { x = ((x % 24) + 24) % 24; return x === 0 ? 'midnight' : x === 12 ? 'noon' : x < 12 ? x + ' in the morning' : (x - 12) + (x >= 18 ? ' at night' : ''); };
  const hash = (s) => { let h = 7; for (const ch of s) h = (h * 31 + ch.charCodeAt(0)) >>> 0; return h; };
  TT.password = (L) => (L.name.replace(/^the /i, '').replace(/[^A-Za-z]/g, '').slice(0, 7) + (10 + (hash(L.id) % 89))).toLowerCase();
  TT.dir = function (L, T) {
    const W = 1000, dy = L.y - T.MY, hwy = T.east ? L.x > 720 : L.x < 280, mid = L.x > 350 && L.x < 650;
    const a = T.rail && L.y > T.railY - 20 ? 'down by the tracks' : Math.abs(dy) < 35 ? `right on ${T.street}` : dy < 0 ? `just up off ${T.street}` : `a block down from ${T.street}`;
    const b = hwy ? 'out toward the highway' : mid ? 'in the middle of town' : 'at the quiet end of town';
    const near = Object.values(T.locs).filter((o) => o.id !== L.id && !o.hidden && !/edge|main|backst/.test(o.kind)).map((o) => [o, Math.hypot(o.x - L.x, o.y - L.y)]).sort((x, y) => x[1] - y[1])[0];
    return `${a}, ${b}${near && near[1] < 170 ? `, ${pick(['near', 'by', 'across from'])} ${near[0].name.replace(/^The /, 'the ')}` : ''}`;
  };
  function topical(q, an, c, T, p, m, t) {
    const g = G(); t = t.replace(/\b(when|where|what|how|who)s\b/g, "$1's").replace(/\bu\b/g, 'you').replace(/\bur\b/g, 'your');
    const isQ = an.q || /\?\s*$/.test(t) || /^(when|where|what|how|who|which|is|are|do|does|can|could|any)\b/.test(t);
    let topic = (TOPIC.find(([, re]) => re.test(t)) || [])[0];
    if (!topic && /\b(are )?you(r place)? (guys )?(open|close)/.test(t)) topic = q.kind;
    if (!topic && /\bhere\b/.test(t) && /\b(wifi|charge|bathroom)\b/.test(t)) topic = q.kind;
    const facet = (FACET.find(([, re]) => re.test(t)) || [])[0];
    const follow = !topic && c.mem.topic && ((facet && t.split(/\s+/).length <= 5 && !/\b(i|me|my)\b/.test(t)) || /^(and |what about |how about )?(it|that|there|they)\b|\b(it|that one|there|they)\??$/.test(t));
    if (follow) topic = c.mem.topic;
    if (!topic) return null;
    // "is there a motel" / "where's the library" only count as questions; "i went to the library" doesn't need an answer
    if (!follow && !facet && !isQ && !/\b(is there|any|need|looking for|want)\b/.test(t)) return null;
    c.mem.topic = topic;
    const L = topic === 'charge' ? null : loc(topic === 'bathroom' ? (q.kind === 'gas' || q.kind === 'diner' ? q.kind : 'gas') : topic);
    const f = facet || (/\b(is there|any)\b/.test(t) ? 'where' : 'where');
    if (topic === 'wifi' || f === 'password') {
      const w = (p.services.wifi || []), mine = w.includes(q.kind) && loc(q.kind);
      if (mine && m.toldPw) return pick([`${TT.password(mine)}. Like I said. All lowercase.`, `Still ${TT.password(mine)}, hon. I'll write it on a napkin.`]);
      if (mine) { m.toldPw = 1; (TW.st().wifi = TW.st().wifi || {})[q.kind] = 1; return `${f === 'password' || /password/.test(t) ? '' : 'Sure do. '}Network's "${mine.name.replace(/^the /i, '')} Guest", password is ${TT.password(mine)}. All lowercase. ${is(q, /busy|suspicious/) ? '' : 'Don\'t go streaming movies, it\'s slow enough already.'}`.trim(); }
      if (f === 'password') return 'Password for what? We don\'t have wifi here, hon. The library does.';
      return where(q, 'wifi', T, p);
    }
    if (topic === 'sleep') {
      c.mem.topic = loc('motel') ? 'motel' : null; m.sus += small ? 0.5 : 0.2;
      if (is(q, /suspicious|no-nonsense/)) return 'Sleep? At home, I\'d hope. Where\'s home, kid?';
      const sh = loc('shelter'), mo = loc('motel'), ch = loc('church');
      if (sh) { if (sh.hidden) { sh.hidden = false; SH.Map && (SH.Map.cache = null); } return `If you're asking for real: ${sh.name}. They take kids, and they don't make you call anybody the first night. ${TT.dir(sh, T)[0].toUpperCase() + TT.dir(sh, T).slice(1)}.`; }
      return `${mo ? `${mo.name} if you've got money. ` : ''}${ch && /kind|soft|lonely|cheerful|tired/.test(q.mood) ? `And... ${ch.name} leaves the side door open. The pastor sleeps with his phone on. You didn't hear that from me.` : 'Otherwise, honey, you should be sleeping at home.'}`;
    }
    if (topic === 'charge') return /diner|library|laundromat/.test(q.kind) ? 'Outlet\'s under the window booth. Help yourself.' : q.kind === 'gas' ? 'We sell chargers. Outlet\'s for the coffee machine, sorry.' : 'Library\'s got outlets. Laundromat too, by the change machine.';
    if (!L) {
      if (topic === 'grandma') return where(q, 'larkspur', T, p);
      if (follow) return pick(['We don\'t have one, hon. Like I said.', 'Still don\'t have one. It didn\'t grow back.']);
      return { motel: 'No motel here. Nearest one\'s the next town over.', station: 'No trains stop here anymore. They tore the platform out in the eighties.', library: 'We don\'t have one. There\'s a bookmobile Thursdays.', shelter: 'Nothing like that here. There\'s a number, though, the church has it.', clinic: 'Nearest doctor\'s the next town. For real emergencies you call 911.', police: 'Sheriff\'s thirty-five minutes out. We mostly handle things ourselves.', diner: 'No diner. Gas station has hot dogs.', laundromat: 'No laundromat. People have machines.' }[topic] || 'We don\'t have one of those, hon.';
    }
    if (L.hidden && topic !== 'grandma') { L.hidden = false; SH.Map && (SH.Map.cache = null); }
    const here = L.id === g.loc, h = SH.hour();
    if (f === 'open' || (f === 'when' && !/stop|station/.test(topic))) {
      if (!L.hours) return here ? 'Never closes. Well, it\'s a ' + (topic === 'stop' ? 'bus stop' : 'place') + '. Where would it go.' : `${L.name}? That's not the kind of place that closes.`;
      const [o, cl] = L.hours, open = SH.isOpen(L.id);
      return open ? `${here ? 'We\'re' : 'It\'s'} open till ${hh(cl)}.${cl - h < 1.5 ? ' So you\'d better hurry.' : ''}` : `${here ? 'We\'re' : 'It\'s'} closed right now. Opens at ${hh(o)}${h >= cl ? ' tomorrow' : ''}.`;
    }
    if (f === 'far') {
      if (here) return 'You\'re standing in it, hon.';
      const o = SH.travelOptions(L.id)[0]; const mins = o ? o.mins : 10;
      return `${L.name}? ${mins <= 4 ? 'Couple minutes\' walk.' : mins <= 12 ? `About ${mins} minutes on foot.` : `Oh, a good ${Math.round(mins / 5) * 5} minutes walking. ${T.tier === 'city' ? 'Take the bus.' : 'Longer if it rains.'}`}`;
    }
    if (f === 'cost') {
      if (topic === 'motel') { const ms = SH.Motels ? SH.Motels.motels(p) : []; return ms.length ? `${ms.map((x) => `${x.n}'s about $${x.rate}`).join(', ')} a night. ${ms.some((x) => x.k === 'sloppy') ? 'Cash. They don\'t ask many questions there. Which isn\'t always a good thing.' : 'They\'ll want a card and a grown-up, though.'}` : 'No motel here to cost anything.'; }
      if (topic === 'stop' || topic === 'station') return topic === 'station' ? 'Train\'s pricier. Ten, fifteen dollars to the city, more if you buy on board.' : 'County bus is two, three dollars. Exact change. The cheap vans are cheaper, if you don\'t mind the driver.';
      return { diner: 'Pancakes are five. Pie\'s three. Coffee\'s free if you\'re sitting at the counter long enough.', gas: 'Hot dogs are two-fifty. Granola bars a buck fifty. Don\'t buy the sushi.', laundromat: 'Two-fifty a wash, quarters for the dryer. The change machine eats dollars sometimes.', clinic: 'The walk-in sees you whether you can pay or not. They\'re good like that.', library: 'Free. Everything in there\'s free. That\'s the whole point of it.', church: 'Doesn\'t cost anything. There\'s a basket, but nobody watches it.', park: 'It\'s a park, hon.' }[topic] || 'Doesn\'t cost anything, far as I know.';
    }
    if (f === 'when' && (topic === 'stop' || topic === 'station')) {
      const R = SH.Routes; if (!R || !R.board) return 'There\'s a timetable on the pole.';
      const B = R.board(p, g.t).filter((b) => (topic === 'station') === !!b.rt.op.T.rail).slice(0, 2);
      if (!B.length) return topic === 'station' ? 'Nothing more today, I don\'t think. First train\'s early.' : 'Last bus already went. Morning, now.';
      const P = (id) => (SH.Atlas.data().places.find((x) => x.id === id) || { name: '?' }).name;
      return `Next one's ${R.fmt(B[0].dep)}, going to ${P(B[0].rt.stops[B[0].rt.stops.length - 1])}.${B[1] ? ` Then ${R.fmt(B[1].dep)}.` : ''} ${is(q, /cheerful|talks too much|lonely/) ? 'They\'re always late. Always.' : ''}`.trim();
    }
    if (f === 'dest' && (topic === 'stop' || topic === 'station')) {
      const R = SH.Routes; const P = (id) => (SH.Atlas.data().places.find((x) => x.id === id) || { name: '?' }).name;
      const B = R && R.board ? R.board(p, g.t).filter((b) => (topic === 'station') === !!b.rt.op.T.rail) : [];
      const ends = [...new Set(B.map((b) => P(b.rt.stops[b.rt.stops.length - 1])))].slice(0, 4);
      return ends.length ? `${ends.length > 1 ? ends.slice(0, -1).join(', ') + ' and ' + ends[ends.length - 1] : ends[0]}, today. ${topic === 'station' ? 'The train goes further, if you\'ve got the money.' : 'Most of them stop everywhere on the way.'}` : 'Nothing else today. Tomorrow, there\'s more.';
    }
    if (f === 'where' && (topic === 'stop' || topic === 'station') && !here) return `${L.name}, ${TT.dir(L, T)}. ${topic === 'station' ? 'Trains a few times a day.' : T.tier === 'village' ? 'Couple buses a day, if you\'re lucky.' : 'There\'s a board with the times.'}`;
    // where
    if (here) return pick([`You're in it, hon.`, `This is ${L.name}. You're standing in it.`]);
    const word = { stop: 'bus', station: 'train', gas: 'gas', diner: 'food', motel: 'motel', library: 'library', church: 'church', police: 'police', shelter: 'shelter', work: 'work', grandma: 'larkspur', bathroom: 'bathroom', laundromat: 'laundromat' }[topic];
    const w = word ? where(q, word, T, p) : null; if (w) return /edge|grandma|shelter|motel|police/.test(topic) || c.mem['dir_' + topic] ? w : (c.mem['dir_' + topic] = 1, `${w} It's ${TT.dir(L, T)}.`);
    const o = SH.travelOptions(L.id)[0];
    return `${L.name}. ${o && o.mins > 12 ? 'Bit of a walk.' : 'Not far.'} ${L.sub ? L.sub + '.' : ''}`.trim();
  }
  const COV = () => (SH.G.cover = SH.G.cover || {});
  const STORYSAY = { grandma: 'you were visiting your grandma', moved: 'your family just moved here', camp: 'you were camping with your dad', home: 'you were homeschooled', cousin: 'you were staying with cousins', family: 'you were staying with family' };
  function brain(an, c) {
    const q = (c.opts && c.opts.local) || { n: 'Someone', mood: 'kind', role: '' }, p = (c.opts && c.opts.place) || SH.Atlas.here(), T = TW.cur(), m = mem(q), t = an.t || '';
    c.mem.n = (c.mem.n || 0) + 1;
    const R = (say, x) => Object.assign({ say, fx: {} }, x || {}), R2 = (say, x) => Object.assign(R(say, x), { ack: 1 });
    const g = G(), rep = !!g.reported, small = T.tier === 'village' || T.tier === 'small';
    if (an.has('selfharm')) { c.result = 'help'; return R('Okay. Okay. You come sit with me. We\'re calling someone right now, and I\'m not going anywhere. You hear me? I\'m right here.', { end: true }); }
    // someone who's too friendly: the danger is them, and a gut feeling is the right answer
    if (is(q, /too friendly/)) {
      if (/\b(yes|ok|okay|sure)\b/.test(t) && c.mem.offered) { c.result = 'call'; return R(`"${q.n}, she's with me." A woman you've never seen steps between you, hand on your shoulder. "Sweetie, come inside with me. Right now." She doesn't let go until you're in the light. Then she makes a call, and she stays with you the whole time.`, { end: true }); }
      if (c.mem.n >= 2 && !c.mem.offered) { c.mem.offered = 1; return R('Hey, you need a ride somewhere? Or a place to crash? I\'ve got a spare room. No big deal. I help kids out all the time.'); }
      if (/\b(no|nope|leave me|go away|stop)\b/.test(t)) return R('Whoa, okay, okay. Just trying to be nice.', { end: true });
    }
    // villages: about 1 in 10 people is online, and those who are scroll past missing-kid posts
    if (T.tier === 'village' && SH.Net && SH.Net.person && /\b(do|are|you) (you )?(have |use |on |got |even )?(the )?(internet|online|facebook|wi-?fi at home|a smartphone|social media|chirp)\b|\b(missing (kid|child|girl|boy|poster|person)s?|amber alert|the news|on the news|posts? about)\b/.test(t) && !c.mem[/missing|amber|news|posts? about/.test(t) ? 'missTalk' : 'netTalk']) {
      const net = SH.Net.person(p, q), miss = /missing|amber|news|posts? about/.test(t); c.mem[miss ? 'missTalk' : 'netTalk'] = 1;
      if (net === 'none') return R(miss ? pick(['Missing kid? Haven\'t heard a thing. I don\'t do the internet. The paper comes Thursdays and it\'s mostly cattle prices.', 'News? I get the weather off the radio. Anything else, I hear it at church or I don\'t hear it.']) : pick(['Internet? Honey, I have a landline and a radio. The radio gets two stations.', 'Never had it, never wanted it. My nephew keeps trying. The library\'s got a computer if you need one.', 'My grandson set me up with one of those phones. It\'s in a drawer somewhere.']));
      return R(miss ? pick(['Oh, those posts? I scroll right past. Too sad, and they\'re never from around here.', 'My daughter shares those missing-kid things. I don\'t read them. I can\'t do anything about a kid three counties over.']) : pick(['I\'m on there for the weather and my church group. The rest of it\'s just people yelling.', 'For the auction listings, mostly. Signal\'s so slow out here the pictures load one line at a time.']));
    }
    // ordering from whoever works the counter ("can i get a hot chocolate?")
    const MENU = [[/hot chocolate|cocoa/, 'hot chocolate', 2.5, 10, 1], [/coffee/, 'coffee', 1.75, 2, 1], [/pancakes?|short stack/, 'short stack', 5, 38, 0], [/pie/, 'slice of pie', 3.5, 18, 0], [/toast/, 'toast', 2, 10, 0], [/eggs?|breakfast/, 'eggs and toast', 5.5, 35, 0], [/burger|cheeseburger/, 'burger', 6.5, 40, 0], [/fries/, 'fries', 3, 18, 0], [/soup|chili/, 'soup', 4, 28, 1], [/grilled cheese/, 'grilled cheese', 4.5, 30, 0], [/muffin/, 'muffin', 2.25, 14, 0], [/donut|doughnut/, 'donut', 1.5, 10, 0], [/hot ?dog/, 'hot dog', 2, 20, 0], [/sandwich/, 'sandwich', 4.5, 28, 0], [/juice|soda|pop|milk/, 'drink', 1.75, 4, 0], [/\bwater\b/, 'water', 0, 0, 0]];
    const ORDER = /\b(can i (get|have)|could i (get|have)|may i (have|get)|i'?ll (have|take|get)|i want|i'?d like|id like|gimme|give me)\b|^(a|one|some|two|just a|uh+ a|um+ a)\b|\b(please|pls)\W*$/;
    if (q.staff && /diner|gas|cafe|laundromat/.test(q.kind || '') && ORDER.test(t)) {
      const it = MENU.find(([re]) => re.test(t));
      if (it && !(q.kind === 'laundromat' && it[1] !== 'drink' && it[1] !== 'water')) {
        const [, name, price, full, warm] = it;
        if (!price) return R(pick(['Sure, hon. Here.', 'Water\'s free. Here you go.']) , { fx: {} });
        if ((g.money || 0) >= price && TW.pay(price, name)) { SH.st('full', full); if (warm) SH.st('warmth', 10); SH.advance(10, { interrupt: false }); return R(pick([`One ${name}, coming up. That's $${price.toFixed(2)}.`, `${name[0].toUpperCase() + name.slice(1)}. $${price.toFixed(2)}, hon.`, `Sure thing. $${price.toFixed(2)}.`]), { narr: warm ? 'It\'s hot enough to hurt. You hold it with both hands anyway.' : 'You eat it slower than you want to, to make it last.' }); }
        if (!m.freebie && !is(q, /busy|suspicious|no-nonsense/)) { m.freebie = 1; SH.st('full', Math.round(full * 0.8)); if (warm) SH.st('warmth', 10); m.sus += 0.5; return R(`That's $${price.toFixed(2)}... You're short, huh. ...Here. Don't tell my manager.`, { narr: 'You say thank you twice. It doesn\'t feel like enough.' }); }
        return R(`That's $${price.toFixed(2)}, hon. Come back when you've got it.`);
      }
    }
    // telling the truth to a grown-up
    if (an.has('disclose') || an.has('scared') || (an.has('run') && c.mem.n > 1)) {
      if (/pastor|librar|teacher/.test(q.role) && !m.told.resource) { m.told.resource = 1; if (!SH.has('safeline')) SH.addBag('safeline', true); const sh = loc('shelter'); if (sh) { sh.hidden = false; SH.Map && (SH.Map.cache = null); }
        return R(`Thank you for telling me. I mean that. I'm not going to grab you or call anybody this second. Here — ${sh ? `${sh.name} is a real place, and they'll let you sleep tonight without calling anyone. And ` : ''}this number's free, any hour, and they don't have to tell anybody where you are. If you want me to call somebody with you, I will. That's your choice. But I'd like it to be soon.`); }
      c.result = 'help'; return R(is(q, /busy|suspicious/) ? 'Okay. Okay, stay right there. I\'m calling someone who knows what to do. You did the right thing.' : 'Oh, sweetheart. Come here. You did the right thing telling me. Let\'s get you somewhere warm, and call the people who can help.', { end: true });
    }
    // names & ages: remembered, never re-asked
    const nm = t.match(/\b(?:my name is|i'?m|call me|it'?s)\s+([a-z]{2,12})\b/);
    if (nm && !/^(fine|ok|okay|good|hungry|lost|tired|twelve|here|not|just|from|visiting|staying|waiting|looking|so|sorry|alright|cold)$/.test(nm[1])) { const said = nm[1][0].toUpperCase() + nm[1].slice(1), cv = COV()[p.id];
      if (cv && cv.name && cv.name.toLowerCase() !== said.toLowerCase() && (cv.told || []).some((w) => w !== q.n)) { m.sus += 1; g.awayNotice = (g.awayNotice || 0) + (small ? 14 : 8); m.told.name = said; return R2(is(q, /nosy|suspicious/) ? `${said}? ${(cv.told.find((w) => w !== q.n))} said your name was ${cv.name}. ...Which is it, hon?` : `${said}. Huh. I could've sworn somebody said ${cv.name}. Must be thinking of another kid.`); }
      if (!cv) COV()[p.id] = { name: said, story: null, told: [q.n] }; else { if (!cv.name) cv.name = said; cv.told = cv.told || []; if (!cv.told.includes(q.n)) cv.told.push(q.n); }
      m.told.name = said; return R2(`${m.told.name}. Nice to meet you, ${m.told.name}. ${m.told.age || !small ? '' : 'How old are you, if you don\'t mind me asking?'}`); }
    if (an.has('age') || /\b(i'?m|i am) (1[0-9]|twelve|thirteen|fourteen|fifteen|sixteen)\b/.test(t)) {
      const young = /\b(1[0-3]|twelve|thirteen)\b/.test(t); m.told.age = young ? 'young' : 'older';
      if (/\b(1[6-9]|sixteen|seventeen)\b/.test(t)) { m.sus++; return R2('Sixteen. Uh huh. And I\'m the Queen of England.'); }
      if (young && small) { m.sus++; return R2(is(q, /nosy|suspicious|no-nonsense/) ? 'Twelve. On a school day. By yourself. ...Honey, where are your folks?' : 'Twelve! That\'s a good age. I remember twelve. Hardest year there is.'); }
      return R2(young ? pick(['Twelve, huh. You look about that.', 'Hm. Young to be out on your own.', 'Twelve. I remember twelve.']) : 'Hm.');
    }
      if (small && m.askedRel === 1 && !an.has('lie') && !['greet', 'thanks', 'bye', 'yes', 'no', 'deflect'].some((x) => an.has(x)) && !/^(yes|no|yeah|nope|ok|okay|why|what|idk|huh|hi|hey|nobody|none|sure)$/.test(t.trim()) && /^[a-z]+( [a-z]+)?$/.test(t.trim()) && t.length < 25) { m.askedRel = 2; m.sus += 0.5; return R2(is(q, /nosy|suspicious/) ? `${t.trim().replace(/\b\w/g, (x) => x.toUpperCase())}? ...Huh. Can't place 'em. And I'd place 'em.` : 'Hm. Can\'t say I know them. But I don\'t know everybody, I guess.'); }
    // cover stories
    if (an.has('lie') || /\b(visiting|staying with|my (grandma|grandpa|aunt|uncle|cousin|mom|dad) (lives|is)|waiting for my|just moved|we moved|new here|homeschool(ed)?|camp(ing|ground))\b/.test(t)) {
      m.told.cover = t.slice(0, 60); m.sus += small ? 1 : 0.5;
      // one story per town: people compare notes
      const sk = /grandma|nana|grandmother/.test(t) ? 'grandma' : /moved|new here/.test(t) ? 'moved' : /camp/.test(t) ? 'camp' : /homeschool/.test(t) ? 'home' : /cousin/.test(t) ? 'cousin' : /aunt|uncle|grandpa/.test(t) ? 'family' : null;
      const cv0 = COV()[p.id];
      if (sk && cv0 && cv0.story && cv0.story !== sk && !(sk === 'grandma' && p.grandma)) { m.sus += 1; g.awayNotice = (g.awayNotice || 0) + (small ? 12 : 6); const who = (cv0.told || []).find((w) => w !== q.n);
        return R2(who ? `Funny. ${who} said you told them ${STORYSAY[cv0.story] || 'something else'}.` : 'Hm. That\'s not what I heard around town.'); }
      if (sk && !(sk === 'grandma' && p.grandma)) { const cv = COV()[p.id] = cv0 || { name: null, story: null, told: [] }; if (!cv.story) { cv.story = sk; cv.storyText = t.slice(0, 80); } if (!cv.told.includes(q.n)) cv.told.push(q.n); }
      if (/grandma|nana|grandmother/.test(t) && p.grandma) { const w = where(q, t, T, p); return R(w || 'Oh, whose grandma?'); }
      if (m.sus >= 2.5 && /suspicious|no-nonsense/.test(q.mood)) { c.result = 'call'; return R('Uh huh. What\'s their name, then? ...What street? ...That\'s what I thought. Hang on, I\'m making a call. Stay right there.', { end: true }); }
      const rel = (t.match(/\b(grandpa|aunt|uncle|cousin|mom|dad|sister|brother|friend)\b/) || [])[1];
      if (small && rel && !m.askedRel) { m.askedRel = 1; return R2(is(q, /nosy/) ? `Your ${rel}? Which house? I know everybody in ${p.name}.` : is(q, /suspicious/) ? `Is that so. Who's your ${rel}, then?` : pick([`Oh, who's your ${rel}? Maybe I know them.`, `Your ${rel}, huh. Which end of town?`])); }
      return R2(is(q, /nosy/) ? 'Oh yeah? Which house? I know everybody.' : is(q, /suspicious/) ? 'Is that so.' : pick(['Oh, that\'s nice.', 'Well, good. Family\'s good.', 'Mm. Okay.']));
    }
    // real questions about the town, with follow-ups ("is it open?", "how far?", "what about the motel?")
    const tq = topical(q, an, c, T, p, m, t); if (tq) return R(tq);
    if (an.has('broke') || /\b(no|don'?t have (any)?|out of) money\b|\bbroke\b/.test(t)) {
      m.sus += small ? 0.3 : 0;
      if (m.fed !== SH.day() && /lonely|kind|soft|cheerful|tired/.test(q.mood) && /diner|gas/.test(q.kind)) { m.fed = SH.day(); return R(pick(['Then this one\'s on me. Sit. No, sit. I\'m not asking.', 'Well, you\'re not leaving hungry. Here. Don\'t tell my manager, he\'d do the same thing.']), { fx: { full: 18 } }); }
      const ch = loc('church'); return R(`${ch ? `${ch.name} has a pantry shelf in the hallway, nobody checks what you take. ` : ''}${loc('work') ? `And ${loc('work').short || loc('work').name} sometimes pays cash for an hour's work.` : 'Wish I had more for you.'}`);
    }
    // hungry
    if (an.has('food') || /\b(hungry|starving|haven'?t eaten)\b/.test(t)) {
      if (m.fed !== SH.day() && /lonely|kind|soft|counter|cheerful|tired|pastor/.test(q.mood + ' ' + q.role)) { m.fed = SH.day(); return R(/counter|register/.test(q.role) ? 'Here. On the house. Don\'t argue with me, I\'ll lose my train of thought.' : 'You hungry? Here, I got half a sandwich I wasn\'t going to finish. Don\'t argue.', { fx: { full: 18 } }); }
      return R(where(q, 'food', T, p) || 'Gas station\'s got hot dogs.');
    }
    if (an.has('money') || /\b(work|job|hiring)\b/.test(t)) return R(where(q, 'work', T, p) || 'Not much work around here. Not for a kid.');
    if (an.has('school')) { m.sus += small ? 0.5 : 0; return R(small ? 'School\'s in session today, far as I know. Which school do you go to?' : 'School, huh. I hated school. Don\'t tell anyone I said that.'); }
    if (/\b(what'?s|what is) your name\b|\bwho are you\b/.test(t)) { m.gaveName = 1; return R(is(q, /suspicious|busy/) ? `${q.n}. It's on the tag.` : pick([`${q.n}. Everybody just calls me ${q.n}.`, `I'm ${q.n}. And you are...?`.replace(/ And you are\.\.\.\?/, m.told.name ? '' : ' And you are...?')])); }
    if (/\b(bathroom|restroom|toilet|pee)\b/.test(t)) return R(q.kind === 'gas' ? 'Key\'s on the hubcap by the register. Bring it back or I have to hunt you down.' : q.kind === 'diner' ? 'Back past the pie case. Jiggle the handle.' : where(q, t, T, p));
    if (an.has('who') || /\bwhat do you do\b|\byour job\b/.test(t)) return R(`Me? ${TT.self(q)} Have been for ${pick(['six', 'eleven', 'twenty', 'too many'])} years.`);
    if (/\bwhat'?s (it|this (place|town)) like\b|\babout (this|the) town\b|\bwhat is there to do\b/.test(t)) return R(`${p.name}? ${p.pop.toLocaleString()} people, give or take. ${(p.econ || [])[0] ? `Mostly ${(p.econ || [])[0]}.` : ''} ${p.motto ? p.motto + '.' : ''} ${small ? 'Everybody knows everybody. That\'s the good part and the bad part.' : 'Big enough to get lost in. Small enough to get found.'}`);
    if (an.has('thanks')) return R(pick(['You\'re welcome, hon.', 'Anytime.', 'Don\'t mention it. Really. Don\'t mention it.']));
    if (an.has('bye')) return R(pick(['You take care now.', 'Stay warm.', 'Bye now. Be careful out there.']), { end: true });
    if (an.has('greet')) return R(pick(['Hi yourself.', 'Hey there.', 'Well, hello.']));
    if (an.has('compliment')) return R(pick(['Well, aren\'t you sweet.', 'Flattery gets you a free refill. That\'s all it gets you.']));
    if (an.has('weather')) return R(pick(['Supposed to get colder. You got a real coat?', 'Rain tonight, they say. They\'re usually right about rain.']));
    // they notice: rarely in a city, often in a village, faster once your face is out there
    const repq = rep && seen(q);
    const lim = (small ? 5 : 7) - (repq ? 2 : 0) - Math.floor(m.sus);
    if (c.mem.n >= lim && /nosy|no-nonsense|suspicious/.test(q.mood) && T.tier !== 'city' && !m.warned) { m.warned = SH.day(); return R(repq ? pick(['...Hang on. Turn your head a little. Do I know you from somewhere?', 'You look awful familiar, you know that? Where do I know you from?']) : pick(['Kid, can I ask you something? Is everything okay at home?', 'Where are your folks, really? And don\'t say the motel.'])); }
    if (c.mem.n >= lim && /nosy|no-nonsense|suspicious/.test(q.mood) && T.tier !== 'city' && m.warned) { c.result = 'call'; return R(repq ? 'I know where I\'ve seen you. The Facebook thing. The missing kid. ...Sweetheart, I\'m calling somebody. It\'s for your own good. You stay right there.' : 'Kid, I\'m going to be straight with you. You\'re alone, it\'s a school day, and you look like you slept outside. I\'m calling somebody. It\'s for your own good.', { end: true }); }
    if (!m.told.name && c.mem.n === 2 && small) return R('I didn\'t catch your name.');
    if (an.q || /^(what|where|when|how|who|why|is|are|do|does|can|could)\b/.test(t)) return R(SH.TownText.pk('dunno' + q.id, ['Couldn\'t tell you, hon.', 'Beats me. The library would know.', 'Hm. No idea, sorry.', 'You\'re asking the wrong person. Ask me about pie.']));
    return R(smalltalk(q, T, p));
  }
  TT.self = (q) => { const r = q.role.replace(/ \(.*\)$/, ''); const m = r.match(/^(runs|works|keeps|drives|lives|sits)\b(.*)$/); return m ? `I ${m[1].replace(/s$/, '')}${m[2]}.` : /^(retired|walking|waiting|at the)/.test(r) ? `I'm ${r}.` : `I'm ${/^(the|a|an) /.test(r) ? r : 'the ' + r}.`; };
  TT.brain = brain;
  // every townie id routes to the same brain (registered when the town is built)
  const bInst = TW.install;
  TW.install = function (p) { const T = bInst.apply(this, arguments); if (T) T.people.forEach((q) => { try { if (!SH.Brain[q.id]) SH.Brain[q.id] = brain; } catch (e) { console.warn(e); } }); return T; };
})(window.SH);
