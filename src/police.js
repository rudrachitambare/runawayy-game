/* SMALL HOURS — Part 4c: a cop stops by while you're working / running your stand or business.
   Free-text conversation. Excuses the brain understands: school project, charity/fundraiser, helping family, church/youth group.
   What you say is remembered per town (G.excuse[placeId]); change your story next time and it gets noticed.
   Fake charities can get checked the next day, and exposure brings heat. The truth is always an option. */
(function (SH) {
  const K = SH.K, A = SH.Atlas; if (!K || !A) return;
  const G = K.G;
  const COPS = ['Officer Reyes', 'Officer Lindgren', 'Deputy Hale', 'Officer Nakamura', 'Deputy Boone'];
  const STORY = [['school', /\b(school|project|assignment|class|homework|business class|economics)\b/], ['charity', /\b(charity|donat|fundrais|raising money|for (the )?(shelter|animals|hospital|cancer|kids|food bank))/], ['family', /\b(helping|help) (my|our) (aunt|uncle|grandma|grandpa|mom|dad|family|cousin)|(my|our) (aunt|uncle|family|grandma)'?s? (business|farm|shop|stand|truck)\b/], ['church', /\b(church|youth group|bible|scouts|troop)\b/]];
  /* turn 59: one cop per town, the same person whether they stop you at work or come because you were 'found' */
  const SUR = ['Ruiz', 'Hanley', 'Okonkwo', 'Brandt', 'Castillo', 'Pruitt', 'Nakamura', 'Sorensen', 'Dube', 'Whitaker', 'Aguilar', 'Kowalski'];
  const hash = (s) => { let h = 2166136261; s = String(s); for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; };
  const copName = (p, dep) => `${(dep || !p.hasPolice) ? 'Deputy' : 'Officer'} ${SUR[hash(p.id) % SUR.length]}`;
  const ex = (p) => { const g = G(); g.excuse = g.excuse || {}; return g.excuse[p.id]; };
  SH.Brain.cop = function (an, c) {
    const p = c.opts.p, m = c.mem, t = an.t, raw = an.raw || '', g = G(), prev = ex(p); m.sus = m.sus || (g.heat || 0) / 4 + (c.opts.ctx === 'notice' ? 15 : 0);
    const S = (say, x) => K.say(say, x);
    if (/\b(ran away|run away|running away|i left home|can'?t go home|scared to go home)\b/.test(t) || an.has('disclose')) { c.result = 'help'; return S('Okay. Thank you for telling me. You\'re not in any trouble, you hear me? Let\'s get you somewhere warm and figure this out together.', { end: true }); }
    if (an.has('hostile') || an.shout) { m.sus += 25; return S('Watch the tone, kid. I\'m being nice right now.'); }
    if (m.askCharity) {
      m.askCharity = 0; m.charity = raw.slice(0, 40); const real = /\b(red cross|unicef|salvation army|food bank|humane society|st\.? jude|habitat)\b/i.test(raw);
      if (prev && prev.charity && prev.charity.toLowerCase() !== m.charity.toLowerCase()) { m.sus += 30; return S(`Funny. Last time you said it was for ${prev.charity}.`); }
      g.excuse = g.excuse || {}; g.excuse[p.id] = Object.assign(g.excuse[p.id] || { story: 'charity' }, { charity: m.charity });
      if (!real && K.chance(0.4)) g.flags.charityCheck = { pid: p.id, day: SH.day() + 1, n: m.charity };
      m.sus += real ? -5 : 8; return S(real ? 'Good cause. My mom gave to them every Christmas.' : `"${m.charity}." He writes it down. "Never heard of it."`);
    }
    const cv = coverSay(t, p, m); if (cv) return S(cv);
    const st = STORY.find(([, re]) => re.test(t));
    if (st) {
      if (prev && prev.story !== st[0]) { m.sus += 30; return S(`Hm. Last week you told me this was a ${prev.story === 'school' ? 'school project' : prev.story === 'charity' ? 'charity thing' : prev.story === 'family' ? 'family thing' : 'church thing'}.`); }
      g.excuse = g.excuse || {}; g.excuse[p.id] = Object.assign(prev || {}, { story: st[0] }); m.story = st[0];
      if (st[0] === 'charity') { m.askCharity = 1; return S('A charity, huh? Which one?'); }
      if (st[0] === 'school') { m.sus += SH.isWeekday && SH.isWeekday() && SH.hour() < 15 ? 15 : 0; return S(SH.isWeekday && SH.isWeekday() && SH.hour() < 15 ? 'A school project. During school hours.' : 'School project. What school?'); }
      if (st[0] === 'family') { m.sus += 5; return S('Your family, huh? Which one\'s yours? I know most people around here.'); }
      return S('Good for you. Which church?');
    }
    const nm = raw.match(/\b(?:[Mm]y name is|[Ii]'?m|[Ii] am|[Nn]ame'?s|[Cc]all me)\s+([A-Z][a-z'-]{1,13})\b/);
    if (nm) { const cv = SH.Identity && SH.Identity.name(p); if (cv && cv.toLowerCase() !== nm[1].toLowerCase()) { m.sus += 25; return S(`${nm[1]}? The lady at the diner called you ${cv}.`); } return S(`Okay, ${nm[1]}. And your last name?`); }
    if (/\b(permit|license)\b/.test(t)) { m.sus -= 5; const bk = (((g.biz || {})[p.id]) || {}).kind; const what = { lemonade: 'Kids with a lemonade stand', carwash: 'Kids washing cars', dogs: 'Kids walking dogs', leaves: 'Kids raking leaves', art: 'Kids selling bracelets', fix: 'Kids patching bike tires' }[bk] || 'Kids doing odd jobs'; return S(`${what} don't need a permit. Kids with a whole operation... we'll see.`); }
    if (/\b(sorry|yes sir|yes ma'?am|officer|thank you)\b/.test(t)) m.sus -= 4;
    if (c.turn >= 4) { if (m.sus >= 70) { c.result = 'take'; return S('Alright. I think you\'d better come with me. Just until we sort out who you are.', { end: true }); } c.result = m.sus >= 40 ? 'watch' : 'ok'; return S(m.sus >= 40 ? 'I\'m going to be keeping an eye on you. You understand?' : 'Alright. Stay out of trouble. And wear a jacket, it\'s getting cold.', { end: true }); }
    return S(K.pick(['So what\'s all this, then?', 'Where are your parents?', 'Shouldn\'t you be in school?', 'What\'s your name, kid?']));
  };
  const talks = (p) => { const g = G(); g.copTalks = g.copTalks || {}; return (g.copTalks[p.id] = g.copTalks[p.id] || { n: 0, last: -1e9 }); };
  const leftAlone = (p) => talks(p).n >= 3;
  function stop(p, ctx, then) {
    if (ctx !== 'notice') { const tk = talks(p); if (tk.n >= 3 || G().t - tk.last < 1440) { if (tk.n >= 3 && K.chance(0.3)) SH.UI.log(K.pick([`The patrol car rolls past. The ${p.hasPolice ? 'officer' : 'deputy'} lifts two fingers off the wheel at you and keeps going.`, `The ${p.hasPolice ? 'officer' : 'deputy'} drives by, slows down just enough to nod, and doesn't stop. You're a regular now.`]), ''); return then ? then({}) : undefined; } }
    const cop = copName(p); K.npc('cop', cop, cop + (p.hasPolice ? ', ' + p.name + ' PD' : ', county sheriff'), '#2b4a7a');
    const who = p.hasPolice ? 'officer' : 'deputy';
    const intro = ctx === 'business' ? `A patrol car pulls up to the curb. The ${who} gets out slowly, the way they do when they're not in a hurry but they are curious.` : ctx === 'notice' ? `A patrol car pulls up beside you and the window comes down. Somebody in ${p.name} called about a kid on their own. The ${who} doesn't get out yet. That's something.` : 'While you\'re working, a patrol car rolls by, slows, and stops.';
    const first = ctx === 'notice' ? K.pick(['Hey. Got a minute? Couple of folks have mentioned you.', 'Hi there. You\'re not from around here, are you?']) : K.pick(['Afternoon. What\'ve we got going on here?', 'Hey there. You in charge of this?']);
    SH.Talk.open('cop', { intro, first, turnsMax: 6, p, ctx, onEnd: (c) => {
      const g = G(); g._copTalk = false;
      if (c.result === 'help') return SH.Endings.found('self');
      if (c.result === 'take') return setTimeout(() => cornered(p, cop), 60);
      if (c.result === 'ok' || c.result === 'watch' || !c.result) { const tk = talks(p); tk.n++; tk.last = g.t; if (tk.n === 3) SH.UI.log(`That's the third time the ${p.hasPolice ? 'officer' : 'deputy'} has talked to you. Same questions, same answers. You get the feeling that's the last time.`, 'good'); }
      if (ctx === 'notice') g.awayNotice = c.result === 'watch' ? 75 : 45; // they came, they talked, they left. People relax a little.
      else if (c.result === 'watch') g.awayNotice = (g.awayNotice || 0) + 20;
      if (c.result === 'watch') g.heat = Math.min(100, (g.heat || 0) + 5);
      then ? then(c) : K.back();
    } });
  }
  /* turn 54: when it goes badly you get one choice: go with them, or grab your stuff and run */
  function cornered(p, cop, onGo) {
    const go = onGo || (() => { G().away = null; SH.Endings.found(p.hasPolice ? 'away' : 'sheriff'); });
    const g = G(), n = (g.party || []).length + (g.rkids || []).length, dark = SH.isDark ? SH.isDark() : (SH.hour() >= 20 || SH.hour() < 6);
    const odds = Math.max(0.15, Math.min(0.85, 0.55 + (dark ? 0.15 : 0) - 0.08 * n - ((g.s.energy || 0) < 25 ? 0.2 : 0)));
    K.D(`${cop} opens the back door`, [`"Come on. Nobody's in trouble. We just need to figure out who you are."`, `${cop} is standing between you and the car, not between you and the street.`],
      [{ t: 'Go with them', cls: 'safe', fn: go },
       { t: 'Grab your stuff and run', cls: 'hot', sub: `${dark ? 'It\'s dark, which helps. ' : ''}${n ? 'Harder with ' + (n === 1 ? 'two of you' : 'all of you') + '. ' : ''}${(g.s.energy || 0) < 25 ? 'You\'re exhausted. ' : ''}If it works, you have to leave ${p.name}.`, fn: () => bolt(p, cop, odds, go) }]);
  }
  function bolt(p, cop, odds, go) {
    const g = G();
    if (!K.chance(odds)) { SH.UI.log(`You make it two blocks. ${cop} doesn't even run. The car just turns the corner ahead of you and waits.`, 'bad'); return go(); }
    const D = A.data(), near = D.places.filter((q) => q.id !== p.id && !q.home).map((q) => [q, A.miles(p, q)]).sort((a, b) => a[1] - b[1]);
    const pickQ = (near.find(([q, mi]) => q.tier === 'village' && mi <= 9) || near.find(([, mi]) => mi <= 9) || near[0]); if (!pickQ) return go();
    const [to, mi] = pickQ;
    g.awayNotice = 95; g.heat = Math.min(100, (g.heat || 0) + 15); // the town will remember you (fades 8 a day while you're gone)
    SH.st('stress', 20); SH.st('energy', -15);
    const base = g.base && g.base.pid === p.id;
    const line = `You run. Through a yard, over a fence, behind the ${p.tier === 'city' ? 'bus depot' : 'feed store'}, and you keep going until ${p.name} is just ${SH.hour() >= 19 || SH.hour() < 6 ? 'lights' : 'a water tower'} behind you. ${mi} miles on foot to ${to.name}.${base ? ` Your base is still back in ${p.name}, and so is everything you left there. ${p.name} will remember your face for a while.` : ` ${p.name} will remember your face for a while.`}`;
    A.arrive(to, { k: 'walk', n: 'Run', mins: Math.max(30, Math.round(mi * 22)), cost: 0, e: Math.round(mi * 4) }, line);
  }
  /* turn 54: being noticed all the way (100) brings a patrol car to talk to you instead of ending the game on the spot */
  function closeIn(p) {
    const g = G(); if (!p || p.home || p.tier === 'village' || g.ended) return false;
    if (g._copTalk && SH.Talk && SH.Talk.cur && !SH.Talk.cur.ended) return true;
    if (!leftAlone(p) && g.t - talks(p).last < 1440) { g.awayNotice = 60; SH.UI.log(`Somebody calls in about a kid on their own. ${copName(p)} already talked to you today and doesn't come back out.`, 'good'); return true; }
    if (leftAlone(p)) { g.awayNotice = 45; SH.UI.log(`Somebody calls in about a kid on their own. You find out later the ${p.hasPolice ? 'officer' : 'deputy'} just said, "I know that kid. That kid's fine," and didn't even come out.`, 'good'); return true; }
    g._copTalk = true; g.awayNotice = 99;
    setTimeout(() => { if (!G().ended) stop(p, 'notice'); }, 80);
    return true;
  }
  K.daily.push(() => { const g = G(), cc = g.flags && g.flags.charityCheck; if (!cc || SH.day() < cc.day) return; g.flags.charityCheck = null; g.flags.charityExposed = cc.n; g.heat = Math.min(100, (g.heat || 0) + 15); SH.UI.log(`The officer in town called around about "${cc.n}". Nobody's ever heard of it. Now he's asking about you.`, 'bad'); if (g.away === cc.pid) g.awayNotice = (g.awayNotice || 0) + 30; });
  const bAct = A.act; A.act = function (k) { const p = A.here(); if (k === 'work' && p.tier !== 'village' && K.chance(0.1 + (G().heat || 0) / 500)) { const r = bAct.apply(this, arguments); if (!G().ended) setTimeout(() => SH.Police.stop(p, 'work'), 60); return r; } return bAct.apply(this, arguments); };
  /* ---------- turn 55: your cover story counts with police ---------- */
  const COVER_RE = { grandma: /\b(grandma|grandmother|nana|granny)\b/, moved: /\b(just moved|moved here|moved in|new here|new in town|we moved|family moved)\b/, camp: /\b(campground|camping|camp site|campsite)\b/, home: /\bhome ?school/, cousin: /\bcousins?\b/ };
  const COVER_OK = { grandma: 'Visiting grandma. Okay. Which house?', moved: 'New family, huh? Welcome to town, I guess.', camp: 'Up at the campground. Sure.', home: 'Homeschooled. That explains the hour.', cousin: 'Staying with cousins. Alright.' };
  function coverSay(t, p, m) {
    if (!p || m.coverSaid) return null;
    const id = Object.keys(COVER_RE).find((k) => COVER_RE[k].test(t)); if (!id) return null;
    m.coverSaid = 1; const cv = (G().cover || {})[p.id];
    if (cv && cv.story && cv.story !== id) { m.sus += 30; return `Huh. That's not what you told folks at the diner.`; }
    if (cv && cv.story === id) { m.sus -= 8; return COVER_OK[id]; }
    m.sus += 5; return COVER_OK[id].replace(/\.$/, '') + '. Nobody mentioned it to me.';
  }
  /* ---------- turn 55: the "Found" officer can be talked out of it, like the patrol car ----------
     Only when it's a stranger stopping a kid who might be you (not when you walked in, not in a friend's kitchen, not
     collapsed). She thinks you're the kid on the poster, so she starts more suspicious than a patrol car. Telling her the
     truth about home still gets you the "Someone Wrote It Down" ending. */
  const placeNow = () => { const g = G(), m = /^t_(p\d+)_/.exec(g.loc || ''), id = g.away || (m && m[1]); return (id && A.data().places.find((q) => q.id === id)) || A.here(); };
  const ESC = ['tracked', 'police', 'post', 'security', 'agent', 'bus', 'sheriff', 'away', 'railagent', 'train'];
  const canEscape = (reason) => !['self', 'host'].includes(reason); // turn 56: everything else too (collapsed, lost, etc.)
  function foundBrain(an, c, base) {
    const g = G(), m = c.mem, t = an.t, raw = an.raw || '', p = placeNow(), S = (say, x) => K.say(say, x);
    if (m.sus == null) m.sus = (g.heat || 0) / 4 + 20 + (c.opts.reason === 'tracked' ? 15 : 0) + (c.opts.reason === 'exhausted' ? 10 : 0);
    const real = (g.name || 'Sam').toLowerCase();
    // the truth (or anything about home being bad) goes to the normal officer: that's the safe-placement path
    if (an.has('selfharm') || an.has('disclose') || /\b(ran away|run away|running away|i left home|left home|can'?t go (back|home)|scared to go home|don'?t want to go home|he hits|hurts me|my stepdad|rick)\b/.test(t)) { m.truth = 1; return base(an, c); }
    if (m.truth) return base(an, c);
    if (new RegExp(`\\b(that'?s me|yeah,? i'?m ${real}|yes,? i'?m ${real}|i'?m ${real}|my name is ${real}|it'?s me)\\b`).test(t)) { m.sus += 40; return S('Thought so. Okay. Thank you for being honest with me.'); }
    if (an.has('hostile') || an.shout) { m.sus += 25; return S('Hey. Easy. I\'m not the bad guy here.'); }
    const cv = coverSay(t, p, m); if (cv) return S(cv);
    const nm = raw.match(/\b(?:[Mm]y name is|[Ii]'?m|[Ii] am|[Nn]ame'?s|[Cc]all me)\s+([A-Z][a-z'-]{1,13})\b/);
    if (nm && nm[1].toLowerCase() !== real) { const cn = SH.Identity && p && SH.Identity.name(p); if (cn && cn.toLowerCase() !== nm[1].toLowerCase()) { m.sus += 25; return S(`${nm[1]}? The lady at the diner called you ${cn}.`); } m.sus += cn ? -6 : 4; return S(cn ? `${nm[1]}. Huh. Okay, ${nm[1]}.` : `${nm[1]}. Okay. You look an awful lot like the kid on this poster, ${nm[1]}.`); }
    if (/\b(not (me|her|him|them)|wrong (kid|person|girl|boy)|got the wrong|that'?s not me|never heard of)\b/.test(t)) { m.sus += 3; return S('Could\'ve sworn. Same jacket as the photo, even.'); }
    const st = STORY.find(([, re]) => re.test(t));
    if (st && !m.story) { m.story = st[0]; const prev = ex(p || {}); if (prev && prev.story && prev.story !== st[0]) { m.sus += 30; return S('Funny. That\'s not what you told the officer last time.'); } m.sus += st[0] === 'school' && SH.isWeekday && SH.isWeekday() && SH.hour() < 15 ? 15 : st[0] === 'family' ? 5 : 0; return S(st[0] === 'school' ? 'A school thing. Which school?' : st[0] === 'charity' ? 'A charity. Sure.' : st[0] === 'family' ? 'Your family, huh. Which one?' : 'Which church?'); }
    if (/\b(sorry|yes sir|yes ma'?am|officer|thank you|thanks)\b/.test(t)) m.sus -= 4;
    if (c.turn >= 4) {
      if (m.sus >= 70) { c.result = 'take'; return S('I don\'t think so, hon. Come on. Let\'s get you in the car.', { end: true }); }
      c.result = m.sus >= 40 ? 'watch' : 'free';
      return S(m.sus >= 40 ? 'Alright. I\'m not sure about you. I\'m going to be around, okay? You know where to find me.' : 'Okay. Sorry, kid. You really do look just like the kid on the poster. Get home safe, alright?', { end: true });
    }
    return S(K.pick(['Where do you live, then?', 'Who are your folks?', 'What are you doing out here on your own?', 'Your mom\'s been worried sick. You sure you\'re not her kid?']));
  }
  function foundTalk(reason) {
    const p = placeNow(), g = G();
    const done = (c) => {
      if (c.result === 'free' || c.result === 'watch') return release(c.result, reason);
      if (c.result === 'take' && !c.mem.truth) { const cop = (g._cop && g._cop.name) || 'The officer'; return setTimeout(() => cornered(p || {}, cop, () => SH.Endings.foundEnd(reason)), 60); }
      SH.Endings.foundEnd(reason);
    };
    SH.Talk.open('officer', { ctx: 'found', turnsMax: 7, noLeave: true, reason, escape: true, first: 'So. Want to tell me why you left?', onEnd: done });
  }
  function release(res, reason) {
    const g = G(); g._copTalk = false;
    if (!g.away) { const m = /^t_(p\d+)_/.exec(g.loc || ''); if (m) g.away = m[1]; }
    { const p = placeNow(); if (p && !p.home && p.tier !== 'village') { const tk = talks(p); tk.n = res === 'free' ? Math.max(3, tk.n + 1) : tk.n + 1; tk.last = g.t; } } // turn 59: a found-officer talk counts; 'sorry kid' = done with you
    if (reason === 'exhausted') { g._exGrace = g.t + 24 * 60; SH.st('energy', 10); }
    g.awayNotice = res === 'watch' ? 75 : 45; if (res === 'watch') g.heat = Math.min(100, (g.heat || 0) + 5);
    SH.UI.log(res === 'watch' ? 'The cruiser pulls away slowly. You can feel it in the mirror. Don\'t push your luck here.' : 'The cruiser pulls away. You stand there until your hands stop shaking. Then you walk the other way.', res === 'watch' ? 'bad' : '');
    SH.UI.afterAction && SH.UI.afterAction();
  }
  const bOff = SH.Brain.officer;
  if (bOff) SH.Brain.officer = function (an, c) { if (c && c.opts && c.opts.escape) return foundBrain(an, c, bOff); return bOff.apply(this, arguments); };
  SH.Police = { stop, STORY, closeIn, cornered, canEscape, foundTalk, release, copName, talks, leftAlone, placeNow };
})(window.SH);
