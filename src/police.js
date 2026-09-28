/* SMALL HOURS — Part 4c: a cop stops by while you're working / running your stand or business.
   Free-text conversation. Excuses the brain understands: school project, charity/fundraiser, helping family, church/youth group.
   What you say is remembered per town (G.excuse[placeId]); change your story next time and it gets noticed.
   Fake charities can get checked the next day, and exposure brings heat. The truth is always an option. */
(function (SH) {
  const K = SH.K, A = SH.Atlas; if (!K || !A) return;
  const G = K.G;
  const COPS = ['Officer Reyes', 'Officer Lindgren', 'Deputy Hale', 'Officer Nakamura', 'Deputy Boone'];
  const STORY = [['school', /\b(school|project|assignment|class|homework|business class|economics)\b/], ['charity', /\b(charity|donat|fundrais|raising money|for (the )?(shelter|animals|hospital|cancer|kids|food bank))/], ['family', /\b(helping|help) (my|our) (aunt|uncle|grandma|grandpa|mom|dad|family|cousin)|(my|our) (aunt|uncle|family|grandma)'?s? (business|farm|shop|stand|truck)\b/], ['church', /\b(church|youth group|bible|scouts|troop)\b/]];
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
    const st = STORY.find(([, re]) => re.test(t));
    if (st) {
      if (prev && prev.story !== st[0]) { m.sus += 30; return S(`Hm. Last week you told me this was a ${prev.story === 'school' ? 'school project' : prev.story === 'charity' ? 'charity thing' : prev.story === 'family' ? 'family thing' : 'church thing'}.`); }
      g.excuse = g.excuse || {}; g.excuse[p.id] = Object.assign(prev || {}, { story: st[0] }); m.story = st[0];
      if (st[0] === 'charity') { m.askCharity = 1; return S('A charity, huh? Which one?'); }
      if (st[0] === 'school') { m.sus += SH.isWeekday && SH.isWeekday() && SH.hour() < 15 ? 15 : 0; return S(SH.isWeekday && SH.isWeekday() && SH.hour() < 15 ? 'A school project. During school hours.' : 'School project. What school?'); }
      if (st[0] === 'family') { m.sus += 5; return S('Your family, huh? Which one\'s yours? I know most people around here.'); }
      return S('Good for you. Which church?');
    }
    const nm = raw.match(/\b(?:my name is|i'?m|name'?s|call me)\s+([A-Z][a-z'-]{1,13})\b/);
    if (nm) { const cv = SH.Identity && SH.Identity.name(p); if (cv && cv.toLowerCase() !== nm[1].toLowerCase()) { m.sus += 25; return S(`${nm[1]}? The lady at the diner called you ${cv}.`); } return S(`Okay, ${nm[1]}. And your last name?`); }
    if (/\b(permit|license)\b/.test(t)) { m.sus -= 5; return S('Kids with lemonade don\'t need a permit. Kids with a whole operation... we\'ll see.'); }
    if (/\b(sorry|yes sir|yes ma'?am|officer|thank you)\b/.test(t)) m.sus -= 4;
    if (c.turn >= 4) { if (m.sus >= 70) { c.result = 'take'; return S('Alright. I think you\'d better come with me. Just until we sort out who you are.', { end: true }); } c.result = m.sus >= 40 ? 'watch' : 'ok'; return S(m.sus >= 40 ? 'I\'m going to be keeping an eye on you. You understand?' : 'Alright. Stay out of trouble. And wear a jacket, it\'s getting cold.', { end: true }); }
    return S(K.pick(['So what\'s all this, then?', 'Where are your parents?', 'Shouldn\'t you be in school?', 'What\'s your name, kid?']));
  };
  function stop(p, ctx, then) {
    const cop = COPS[(p.pop + p.name.length) % COPS.length].replace('Officer', p.hasPolice ? 'Officer' : 'Deputy'); K.npc('cop', cop, cop + (p.hasPolice ? ', ' + p.name + ' PD' : ', county sheriff'), '#2b4a7a');
    const who = p.hasPolice ? 'officer' : 'deputy';
    const intro = ctx === 'business' ? `A patrol car pulls up to the curb. The ${who} gets out slowly, the way they do when they're not in a hurry but they are curious.` : ctx === 'notice' ? `A patrol car pulls up beside you and the window comes down. Somebody in ${p.name} called about a kid on their own. The ${who} doesn't get out yet. That's something.` : 'While you\'re working, a patrol car rolls by, slows, and stops.';
    const first = ctx === 'notice' ? K.pick(['Hey. Got a minute? Couple of folks have mentioned you.', 'Hi there. You\'re not from around here, are you?']) : K.pick(['Afternoon. What\'ve we got going on here?', 'Hey there. You in charge of this?']);
    SH.Talk.open('cop', { intro, first, turnsMax: 6, p, ctx, onEnd: (c) => {
      const g = G(); g._copTalk = false;
      if (c.result === 'help') return SH.Endings.found('self');
      if (c.result === 'take') return setTimeout(() => cornered(p, cop), 60);
      if (ctx === 'notice') g.awayNotice = c.result === 'watch' ? 75 : 45; // they came, they talked, they left. People relax a little.
      else if (c.result === 'watch') g.awayNotice = (g.awayNotice || 0) + 20;
      if (c.result === 'watch') g.heat = Math.min(100, (g.heat || 0) + 5);
      then ? then(c) : K.back();
    } });
  }
  /* turn 54: when it goes badly you get one choice: go with them, or grab your stuff and run */
  function cornered(p, cop) {
    const g = G(), n = (g.party || []).length + (g.rkids || []).length, dark = SH.isDark ? SH.isDark() : (SH.hour() >= 20 || SH.hour() < 6);
    const odds = Math.max(0.15, Math.min(0.85, 0.55 + (dark ? 0.15 : 0) - 0.08 * n - ((g.s.energy || 0) < 25 ? 0.2 : 0)));
    K.D(`${cop} opens the back door`, [`"Come on. Nobody's in trouble. We just need to figure out who you are."`, `${cop} is standing between you and the car, not between you and the street.`],
      [{ t: 'Go with them', cls: 'safe', fn: () => { g.away = null; SH.Endings.found(p.hasPolice ? 'away' : 'sheriff'); } },
       { t: 'Grab your stuff and run', cls: 'hot', sub: `${dark ? 'It\'s dark, which helps. ' : ''}${n ? 'Harder with ' + (n === 1 ? 'two of you' : 'all of you') + '. ' : ''}${(g.s.energy || 0) < 25 ? 'You\'re exhausted. ' : ''}If it works, you have to leave ${p.name}.`, fn: () => bolt(p, cop, odds) }]);
  }
  function bolt(p, cop, odds) {
    const g = G();
    if (!K.chance(odds)) { SH.UI.log(`You make it two blocks. ${cop} doesn't even run. The car just turns the corner ahead of you and waits.`, 'bad'); g.away = null; return SH.Endings.found(p.hasPolice ? 'away' : 'sheriff'); }
    const D = A.data(), near = D.places.filter((q) => q.id !== p.id && !q.home).map((q) => [q, A.miles(p, q)]).sort((a, b) => a[1] - b[1]);
    const pickQ = (near.find(([q, mi]) => q.tier === 'village' && mi <= 9) || near.find(([, mi]) => mi <= 9) || near[0]); if (!pickQ) { g.away = null; return SH.Endings.found('away'); }
    const [to, mi] = pickQ;
    g.awayNotice = 95; g.heat = Math.min(100, (g.heat || 0) + 15); // the town will remember you (fades 8 a day while you're gone)
    SH.st('stress', 20); SH.st('energy', -15);
    const base = g.base && g.base.pid === p.id;
    const line = `You run. Through a yard, over a fence, behind the ${p.tier === 'city' ? 'bus depot' : 'feed store'}, and you keep going until ${p.name} is just lights behind you. ${mi} miles on foot to ${to.name}.${base ? ` Your base is still back in ${p.name}, and so is everything you left there. ${p.name} will remember your face for a while.` : ` ${p.name} will remember your face for a while.`}`;
    A.arrive(to, { k: 'walk', n: 'Run', mins: Math.max(30, Math.round(mi * 22)), cost: 0, e: Math.round(mi * 4) }, line);
  }
  /* turn 54: being noticed all the way (100) brings a patrol car to talk to you instead of ending the game on the spot */
  function closeIn(p) {
    const g = G(); if (!p || p.home || p.tier === 'village' || g.ended) return false;
    if (g._copTalk && SH.Talk && SH.Talk.cur && !SH.Talk.cur.ended) return true;
    g._copTalk = true; g.awayNotice = 99;
    setTimeout(() => { if (!G().ended) stop(p, 'notice'); }, 80);
    return true;
  }
  K.daily.push(() => { const g = G(), cc = g.flags && g.flags.charityCheck; if (!cc || SH.day() < cc.day) return; g.flags.charityCheck = null; g.flags.charityExposed = cc.n; g.heat = Math.min(100, (g.heat || 0) + 15); SH.UI.log(`The officer in town called around about "${cc.n}". Nobody's ever heard of it. Now he's asking about you.`, 'bad'); if (g.away === cc.pid) g.awayNotice = (g.awayNotice || 0) + 30; });
  const bAct = A.act; A.act = function (k) { const p = A.here(); if (k === 'work' && p.tier !== 'village' && K.chance(0.1 + (G().heat || 0) / 500)) { const r = bAct.apply(this, arguments); if (!G().ended) setTimeout(() => SH.Police.stop(p, 'work'), 60); return r; } return bAct.apply(this, arguments); };
  SH.Police = { stop, STORY, closeIn, cornered };
})(window.SH);
