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

  TT.opener = function (q, L) {
    const m = mem(q), g = G(), h = SH.hour(), rep = !!g.reported, T = TW.cur();
    m.n++;
    if (m.n > 1) return pick(m.told.name ? [`Hey, ${m.told.name}. Back again.`, `${m.told.name}! Still in town, huh?`, `Well, look who it is. ${m.told.name}, right?`] : ['Oh, hey. You again.', 'Back again, kiddo?', 'You\'re becoming a regular.']);
    const job = q.kind === 'diner' ? (h < 11 ? 'What can I get you, hon? Kitchen\'s doing breakfast till eleven.' : 'What can I get you?')   : q.kind === 'gas' ? pick(['Pump or inside?', 'Hot dogs are fresh. Well. They\'re hot.', 'Just holler if you need the bathroom key.']) : /librar/.test(q.role) ? 'Can I help you find something? Or just here for the outlets? That\'s allowed.' : /pastor/.test(q.role) ? 'Hello there. Door\'s always open. You\'re welcome to sit as long as you like.' : /laundr|keeps/.test(q.role) ? 'Dryer four eats quarters, just so you know.' : /foreman|farm|co-op/.test(q.role) ? 'Help you with something, kid? This isn\'t really a place to hang around.' : /bus|waiting/.test(q.role) ? 'You waiting on the 3:15 too? It\'s always late.' : '';
    if (is(q, /too friendly/)) return `Well hi there! I'm ${q.n}. You look like you could use a friend. ${job}`;
    if (is(q, /suspicious/)) return rep && T.tier !== 'city' ? `...Do I know you from somewhere?` : `Can I help you with something?`;
    if (is(q, /busy/)) return job || `Mm-hm?`;
    if (is(q, /lonely|talks too much|cheerful/)) return `Well hey there! I'm ${q.n}. I don't think I know you, and I know everybody. ${job}`;
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
    return SH.TownText.pk('st_' + q.id, topics[k].concat(topics.default));
  }

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
    // telling the truth to a grown-up
    if (an.has('disclose') || an.has('scared') || (an.has('run') && c.mem.n > 1)) {
      if (/pastor|librar|teacher/.test(q.role) && !m.told.resource) { m.told.resource = 1; if (!SH.has('safeline')) SH.addBag('safeline', true); const sh = loc('shelter'); if (sh) { sh.hidden = false; SH.Map && (SH.Map.cache = null); }
        return R(`Thank you for telling me. I mean that. I'm not going to grab you or call anybody this second. Here — ${sh ? `${sh.name} is a real place, and they'll let you sleep tonight without calling anyone. And ` : ''}this number's free, any hour, and they don't have to tell anybody where you are. If you want me to call somebody with you, I will. That's your choice. But I'd like it to be soon.`); }
      c.result = 'help'; return R(is(q, /busy|suspicious/) ? 'Okay. Okay, stay right there. I\'m calling someone who knows what to do. You did the right thing.' : 'Oh, sweetheart. Come here. You did the right thing telling me. Let\'s get you somewhere warm, and call the people who can help.', { end: true });
    }
    // names & ages: remembered, never re-asked
    const nm = t.match(/\b(?:my name is|i'?m|call me|it'?s)\s+([a-z]{2,12})\b/);
    if (nm && !/^(fine|ok|okay|good|hungry|lost|tired|twelve|here|not|just|from|visiting|staying|waiting|looking|so|sorry|alright|cold)$/.test(nm[1])) { m.told.name = nm[1][0].toUpperCase() + nm[1].slice(1); return R2(`${m.told.name}. Nice to meet you, ${m.told.name}. ${m.told.age || !small ? '' : 'How old are you, if you don\'t mind me asking?'}`); }
    if (an.has('age') || /\b(i'?m|i am) (1[0-9]|twelve|thirteen|fourteen|fifteen|sixteen)\b/.test(t)) {
      const young = /\b(1[0-3]|twelve|thirteen)\b/.test(t); m.told.age = young ? 'young' : 'older';
      if (/\b(1[6-9]|sixteen|seventeen)\b/.test(t)) { m.sus++; return R2('Sixteen. Uh huh. And I\'m the Queen of England.'); }
      if (young && small) { m.sus++; return R2(is(q, /nosy|suspicious|no-nonsense/) ? 'Twelve. On a school day. By yourself. ...Honey, where are your folks?' : 'Twelve! That\'s a good age. I remember twelve. Hardest year there is.'); }
      return R2(young ? pick(['Twelve, huh. You look about that.', 'Hm. Young to be out on your own.', 'Twelve. I remember twelve.']) : 'Hm.');
    }
      if (small && m.askedRel === 1 && !an.has('lie') && !['greet', 'thanks', 'bye', 'yes', 'no', 'deflect'].some((x) => an.has(x)) && !/^(yes|no|yeah|nope|ok|okay|why|what|idk|huh|hi|hey|nobody|none|sure)$/.test(t.trim()) && /^[a-z]+( [a-z]+)?$/.test(t.trim()) && t.length < 25) { m.askedRel = 2; m.sus += 0.5; return R2(is(q, /nosy|suspicious/) ? `${t.trim().replace(/\b\w/g, (x) => x.toUpperCase())}? ...Huh. Can't place 'em. And I'd place 'em.` : 'Hm. Can\'t say I know them. But I don\'t know everybody, I guess.'); }
    // cover stories
    if (an.has('lie') || /\b(visiting|staying with|my (grandma|grandpa|aunt|uncle|cousin|mom|dad) (lives|is)|waiting for my)\b/.test(t)) {
      m.told.cover = t.slice(0, 60); m.sus += small ? 1 : 0.5;
      if (/grandma|nana|grandmother/.test(t) && p.grandma) { const w = where(q, t, T, p); return R(w || 'Oh, whose grandma?'); }
      if (m.sus >= 2.5 && /suspicious|no-nonsense/.test(q.mood)) { c.result = 'call'; return R('Uh huh. What\'s their name, then? ...What street? ...That\'s what I thought. Hang on, I\'m making a call. Stay right there.', { end: true }); }
      const rel = (t.match(/\b(grandpa|aunt|uncle|cousin|mom|dad|sister|brother|friend)\b/) || [])[1];
      if (small && rel && !m.askedRel) { m.askedRel = 1; return R2(is(q, /nosy/) ? `Your ${rel}? Which house? I know everybody in ${p.name}.` : is(q, /suspicious/) ? `Is that so. Who's your ${rel}, then?` : pick([`Oh, who's your ${rel}? Maybe I know them.`, `Your ${rel}, huh. Which end of town?`])); }
      return R2(is(q, /nosy/) ? 'Oh yeah? Which house? I know everybody.' : is(q, /suspicious/) ? 'Is that so.' : pick(['Oh, that\'s nice.', 'Well, good. Family\'s good.', 'Mm. Okay.']));
    }
    // real questions about the town
    if (an.has('where') || /\b(where|how do i get|is there|any)\b.*\b(motel|hotel|bus|train|station|bathroom|restroom|toilet|pee|sleep|stay|crash|wifi|internet|library|food|eat|church|police|sheriff|shelter|work|job|larkspur|grandma|store|outlet|charge)\b/.test(t)) {
      const w = where(q, t, T, p); if (w) return R(w);
    }
    if (/\b(larkspur|my grandma|grandmother)\b/.test(t)) { const w = where(q, t, T, p); if (w) return R(w); }
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
    const lim = (small ? 5 : 7) - (rep ? 2 : 0) - Math.floor(m.sus);
    if (c.mem.n >= lim && /nosy|no-nonsense|suspicious/.test(q.mood) && T.tier !== 'city') { c.result = 'call'; return R(rep ? 'I know where I\'ve seen you. The Facebook thing. The missing kid. ...Sweetheart, I\'m calling somebody. It\'s for your own good. You stay right there.' : 'Kid, I\'m going to be straight with you. You\'re alone, it\'s a school day, and you look like you slept outside. I\'m calling somebody. It\'s for your own good.', { end: true }); }
    if (!m.told.name && c.mem.n === 2 && small) return R('I didn\'t catch your name.');
    return R(smalltalk(q, T, p));
  }
  TT.self = (q) => { const r = q.role.replace(/ \(.*\)$/, ''); const m = r.match(/^(runs|works|keeps|drives|lives|sits)\b(.*)$/); return m ? `I ${m[1].replace(/s$/, '')}${m[2]}.` : /^(retired|walking|waiting|at the)/.test(r) ? `I'm ${r}.` : `I'm ${/^(the|a|an) /.test(r) ? r : 'the ' + r}.`; };
  TT.brain = brain;
  // every townie id routes to the same brain (registered when the town is built)
  const bInst = TW.install;
  TW.install = function (p) { const T = bInst.apply(this, arguments); if (T) T.people.forEach((q) => { try { if (!SH.Brain[q.id]) SH.Brain[q.id] = brain; } catch (e) { console.warn(e); } }); return T; };
})(window.SH);
