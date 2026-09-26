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
    const p = c.opts.p, m = c.mem, t = an.t, raw = an.raw || '', g = G(), prev = ex(p); m.sus = m.sus || (g.heat || 0) / 4;
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
    SH.Talk.open('cop', { intro: ctx === 'business' ? 'A patrol car pulls up to the curb. The officer gets out slowly, the way they do when they\'re not in a hurry but they are curious.' : 'While you\'re working, a patrol car rolls by, slows, and stops.', first: K.pick(['Afternoon. What\'ve we got going on here?', 'Hey there. You in charge of this?']), turnsMax: 6, p, onEnd: (c) => {
      const g = G();
      if (c.result === 'help') return SH.Endings.found('self');
      if (c.result === 'take') { g.away = null; return SH.Endings.found(p.hasPolice ? 'away' : 'sheriff'); }
      if (c.result === 'watch') { g.awayNotice = (g.awayNotice || 0) + 20; g.heat = Math.min(100, (g.heat || 0) + 5); }
      then ? then(c) : K.back();
    } });
  }
  K.daily.push(() => { const g = G(), cc = g.flags && g.flags.charityCheck; if (!cc || SH.day() < cc.day) return; g.flags.charityCheck = null; g.heat = Math.min(100, (g.heat || 0) + 15); SH.UI.log(`The officer in town called around about "${cc.n}". Nobody's ever heard of it. Now he's asking about you.`, 'bad'); if (g.away === cc.pid) g.awayNotice = (g.awayNotice || 0) + 30; });
  const bAct = A.act; A.act = function (k) { const p = A.here(); if (k === 'work' && p.tier !== 'village' && K.chance(0.1 + (G().heat || 0) / 500)) { const r = bAct.apply(this, arguments); if (!G().ended) setTimeout(() => stop(p, 'work'), 60); return r; } return bAct.apply(this, arguments); };
  SH.Police = { stop, STORY };
})(window.SH);
