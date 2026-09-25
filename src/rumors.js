/* SMALL HOURS — rumor system. Tell one person something; it travels a social graph,
   mutating as it goes, and people react to the version *they* heard. */
(function (SH) {
  const U = SH.util;
  const R = SH.Rumor = {};
  const WHO = { jordan: 'Jordan', lily: 'Lily', mom: 'Mom', rick: 'Rick', grandma: 'Grandma', okafor: 'Ms. Okafor', patel: 'Mrs. Patel', class: 'the 7B group chat', tyler: 'Tyler', maya: 'Maya' };

  // each fact has versions from true (0) to wildly distorted (3)
  R.FACTS = {
    rickDrinks: ['{n}\'s stepdad drinks a lot', '{n}\'s stepdad is an alcoholic', '{n}\'s stepdad got a DUI', '{n}\'s stepdad is going to jail'],
    bruise: ['Rick grabbed {n} hard enough to leave marks', '{n}\'s stepdad hurts {n}', '{n}\'s stepdad beats {n} up', 'CPS is taking {n} away'],
    runaway: ['{n} wants to run away', '{n} is running away this weekend', '{n} already ran away once', '{n} is moving to their grandma\'s for good'],
    hateSchool: ['{n} hates school', '{n} wants to drop out', '{n} is getting expelled', '{n} is getting homeschooled next month'],
    dex: ['{n} has a friend they met online', '{n} has an online boyfriend', '{n} is secretly dating a 19-year-old', 'some grown man online is going after {n}'],
    tylerDad: ['Tyler\'s dad yells at him', 'Tyler cried behind the gym', 'Tyler\'s dad hits him', 'Tyler\'s getting sent to military school'],
    broke: ['{n}\'s family is broke', '{n}\'s family can\'t pay rent', '{n}\'s family is getting evicted', '{n} is homeless'],
  };
  const SERIOUS = ['rickDrinks', 'bruise', 'runaway', 'dex'];
  // who talks to whom: [to, chance per day, distortion chance]
  R.EDGES = {
    jordan: [['class', 0.35, 0.5], ['tyler', 0.08, 0.6], ['mom', 0.06, 0.3], ['okafor', 0.05, 0.1]],
    lily: [['mom', 0.5, 0.5], ['rick', 0.25, 0.6], ['patel', 0.15, 0.5]],
    mom: [['grandma', 0.3, 0.2], ['rick', 0.2, 0.1], ['okafor', 0.1, 0]],
    rick: [['mom', 0.15, 0.2]],
    grandma: [['mom', 0.4, 0.1]],
    okafor: [['mom', 0.7, 0]], // mandated reporter: only serious facts leave her office, undistorted
    patel: [['mom', 0.35, 0.3]],
    class: [['tyler', 0.5, 0.5], ['okafor', 0.15, 0.3], ['maya', 0.4, 0.4], ['jordan', 0.3, 0.4]],
    tyler: [['class', 0.6, 0.7]],
    maya: [['class', 0.2, 0.3], ['okafor', 0.2, 0.1]],
  };
  const ver = (id, lvl) => R.FACTS[id][Math.min(3, lvl)].replace(/\{n\}/g, SH.G.name);
  R.version = ver;

  const st = (id) => { const G = SH.G; return (G.rumors[id] = G.rumors[id] || { lvl: {}, from: {}, day: SH.day(), seen: {} }); };
  R.level = (npc, id) => { const r = SH.G.rumors[id]; return r && r.lvl[npc] != null ? r.lvl[npc] : -1; };
  R.holders = (id) => Object.keys((SH.G.rumors[id] || { lvl: {} }).lvl);

  R.told = function (id, npc) { // you told this person directly
    if (!WHO[npc]) return; const r = st(id);
    if (r.lvl[npc] == null || r.lvl[npc] > 0) { r.lvl[npc] = 0; r.from[npc] = 'you'; }
  };
  R.seed = function (id, npc, lvl = 0) { const r = st(id); if (r.lvl[npc] == null) { r.lvl[npc] = lvl; r.from[npc] = 'around'; R.react(npc, id, lvl, 'around'); } };

  R.hourly = function () {
    const G = SH.G, h = SH.hour(); if (h < 8 || h > 22) return;
    let spread = 0;
    for (const id in G.rumors) {
      const r = G.rumors[id];
      for (const from of Object.keys(r.lvl)) {
        if (from === 'okafor' && !SERIOUS.includes(id)) continue;
        for (const [to, pDay, dist] of R.EDGES[from] || []) {
          if (r.lvl[to] != null || spread >= 1) continue;
          if (to === 'rick' && id === 'tylerDad') continue;
          if (Math.random() > pDay / 14) continue; // ~14 waking hours a day
          const lvl = Math.min(3, r.lvl[from] + (Math.random() < dist ? 1 : 0));
          r.lvl[to] = lvl; r.from[to] = from; spread++;
          G.world.log.push({ id: 'rumor:' + id + ':' + from + '>' + to + ':' + lvl, t: G.t });
          if (SH.Mem && SH.NPCS_META[to]) SH.Mem.add(to, { topic: 'heard_' + id, text: ver(id, lvl) + ' (' + (from === 'class' ? 'people at school are saying' : WHO[from] + ' told them') + ')', src: 'heard', w: 3 });
          R.react(to, id, lvl, from);
        }
      }
    }
  };

  const D = (o) => { const show = () => SH.UI.dialog(o); if (SH.UI.modalOpen()) SH.Events.queue({ id: 'rum_' + o.title + SH.G.t, run: show }); else SH.Events.queue({ id: 'rum_' + o.title + SH.G.t, run: show }); };
  const HANDLES = ['maddie.k', 'devonnn', 'priya.draws', 'ava.reads', 'b.rando', 'kaylee_xo'];

  R.react = function (to, id, lvl, from) {
    const G = SH.G, v = ver(id, lvl), P = SH.Phone;
    switch (to) {
      case 'class': {
        P.push('class', 'class', U.pick(HANDLES) + ': ' + U.pick(['wait is it true that ', 'ok but i heard ', 'not to be messy but ', 'someone said ']) + v + (U.chance(0.5) ? ' 👀' : ''));
        if (['bruise', 'broke', 'dex', 'rickDrinks'].includes(id) && G.phase === 'home') { SH.st('mood', -6); SH.st('stress', 5); }
        break;
      }
      case 'tyler':
        if (id === 'tylerDad') { SH.rel('tyler', -35); SH.flag('tylerKnowsYouTold'); SH.Phone.addPost('tyler.b', 'some snitch in 7B needs to learn to shut up. u know who u are'); }
        else if (G.phase === 'home') SH.Phone.addPost('tyler.b', U.pick(['lmaooo apparently ', 'imagine being the kid whose ', 'heard ']) + v.charAt(0).toLowerCase() + v.slice(1) + ' 💀');
        break;
      case 'jordan':
        if (from !== 'you') P.push('jordan', 'jordan', 'ok so ppl r saying ' + v.charAt(0).toLowerCase() + v.slice(1) + '. is that true?? why didnt u tell ME');
        break;
      case 'mom':
        if (G.phase !== 'home') break;
        if (id === 'dex') { SH.flag('momKnowsDex'); P.push('mom', 'mom', 'Who is "dex_19"? Someone told me you have an older friend online. I need you to show me those messages tonight. I\'m not mad at you. I\'m scared FOR you.'); SH.susp(10); }
        else if (id === 'runaway') { SH.susp(22); P.push('mom', 'mom', 'We need to talk when I get home. Please don\'t make plans.'); }
        else if (id === 'rickDrinks' || id === 'bruise') { SH.flag('momHeardRick'); P.push('mom', 'mom', from === 'okafor' ? 'Your counselor called me at work. I\'m coming home early. I love you. Nobody is in trouble.' : 'Somebody said something to me today about home and I can\'t stop thinking about it. Are you okay? Really?'); SH.rel('mom', 3); }
        else if (id === 'broke') { SH.rel('mom', -4); P.push('mom', 'mom', 'Mrs. Patel offered to "help with groceries." Who\'s been saying we\'re broke? We\'re fine. We\'re FINE.'); }
        else if (id === 'hateSchool') P.push('mom', 'mom', 'Did you tell someone you want to DROP OUT?? Baby you\'re 12. Call me.');
        break;
      case 'rick':
        if (G.phase !== 'home') break;
        if (id === 'rickDrinks' || id === 'bruise') {
          SH.flag('rickHeardRumor'); SH.rel('rick', -15); SH.st('stress', 14);
          D({ title: 'Our Business', who: 'rick', text: [`Rick is waiting in the kitchen. His voice is very calm, which is worse. "Funny thing. ${from === 'lily' ? 'Your sister' : 'Somebody'} tells me people are saying ${v.replace(G.name + '\'s stepdad', 'I').replace(/\bRick\b/, 'I')}."`, '"You been running your mouth about this family?"'],
            choices: [{ t: '"I didn\'t say anything."', fn: () => { SH.st('stress', 6); SH.UI.log('He looks at you for a long time. "Better not have." He goes back to the couch. The TV gets very loud.', 'sys'); } },
              { t: '"Maybe if you stopped drinking, people wouldn\'t talk."', cls: 'hot', fn: () => { SH.rel('rick', -15); SH.st('stress', 12); SH.flag('stoodUpToRick'); SH.UI.log('The silence is enormous. Then he laughs, one ugly syllable, and throws his can in the sink so hard it bounces out. He doesn\'t touch you. He doesn\'t talk to you for the rest of the night, either. You don\'t know if you won something or lost it.', 'warn'); } },
              { t: 'Say nothing. Look at the floor.', fn: () => { SH.st('mood', -6); } }] });
        } else if (id === 'runaway') { SH.st('stress', 8); SH.UI.log('Rick, passing your door: "Heard you wanna leave. Door\'s right there, kid." He doesn\'t mean it. He doesn\'t not mean it.', 'bad'); }
        else if (id === 'broke') { SH.rel('rick', -8); SH.UI.log('Rick slams a cabinet. "Who\'s telling people we\'re broke?" Nobody answers. Everybody knows.', 'bad'); }
        break;
      case 'grandma':
        if (id === 'runaway' || id === 'bruise' || id === 'rickDrinks') { SH.flag('grandmaOffer'); SH.flag('grandmaWorried'); P.push('grandma', 'grandma', 'Sweet pea, your mother told me some things and my heart is in my throat. You can ALWAYS come to me. 41 Larkspur Lane. I will drive through the night. Call me.'); }
        break;
      case 'okafor':
        if (SERIOUS.includes(id)) SH.flag('okaforCallIn');
        break;
      case 'patel':
        if (id === 'bruise' || id === 'rickDrinks') { SH.flag('patelWatching'); SH.rel('patel', 5); }
        break;
    }
  };

  // when you next talk to someone who has heard something, they bring it up — in their own words
  R.greet = function (npc) {
    const G = SH.G;
    for (const id in G.rumors) {
      const r = G.rumors[id]; if (r.lvl[npc] == null || r.from[npc] === 'you' || r.seen[npc]) continue;
      r.seen[npc] = true; const v = ver(id, r.lvl[npc]), src = r.from[npc], srcN = src === 'class' ? 'people at school' : WHO[src] || 'someone';
      const lv = new RegExp('^(' + G.name + '|Sam)\\b').test(v) ? v : v.charAt(0).toLowerCase() + v.slice(1);
      return { jordan: `ok so ${srcN} ${src === 'class' ? 'are' : 'is'} saying ${lv}. is that true??`, mom: `Baby... ${srcN} told me ${lv}. I need you to be honest with me. Is it true?`, okafor: `I heard something secondhand, and I'd rather hear it from you: that ${lv}. Is any of that true?`, grandma: `Your mother called. She said ${lv}. Oh, sweet pea. Talk to me.`, patel: `People talk on this street, dear. I heard ${lv}. You don't have to say a word. But my kettle is on.`, lily: `${srcN} said ${lv}. is it true?? are you leaving??`, rick: `Heard a funny thing today. Heard ${lv}.`, tyler: `heard ${lv}. that true, loser?` }[npc] || null;
    }
    return null;
  };

  // what the town is saying — for the phone
  R.list = function () {
    const G = SH.G, out = [];
    for (const id in G.rumors) { const r = G.rumors[id]; const hs = Object.keys(r.lvl); if (hs.length < 2) continue; const maxL = Math.max(...hs.map((h) => r.lvl[h])); out.push({ id, text: ver(id, maxL), n: hs.length, who: hs.map((h) => WHO[h] || h) }); }
    return out;
  };
})(window.SH);
