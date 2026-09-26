/* SMALL HOURS — talk fixes part 2: consequences of what friends were told, greetings that remember threads,
   and PIP ◉ options that rotate on every press and never repeat something you already said. See talkfix.js. */
(function (SH) {
  const FR = SH.Friends, TF = SH.TalkFix; if (!FR || !TF) return;
  const G = () => SH.G, KIDS = FR.KIDS, norm = TF.norm, par = TF.par;
  /* ---------- the conversation layer: no more random topic swaps ---------- */
  const LOW = { teen: ['hey. that sucks. what happened?', 'damn. u ok?', 'i\'m sorry. want to talk about it?'], warm: ['That sounds hard. What happened?', 'I\'m sorry. I\'m listening.'], kid: ['oh no. are you sad?', 'do you want a hug'], gruff: ['...Rough day. Yeah.', 'Happens.'] };
  SH.CONV_LOW = LOW;
  /* ---------- consequences ---------- */
  if (SH.K && SH.K.daily) SH.K.daily.push(() => {
    const g = G(); FR.metIds().forEach((id) => {
      const f = FR.st(id), k = KIDS[id]; if (!f.mayTell || SH.day() < f.mayTell || f.secret) return;
      f.mayTell = null; f.told = SH.day(); SH.rel && SH.rel(id, -3);
      if (g.phase === 'run') { g.heat = Math.min(100, (g.heat || 0) + 8); SH.Phone.push(id, id, 'i\'m sorry. i told my ' + par(k) + '. i was so scared for u'); }
      else { SH.flag && SH.flag('momHeardRunTalk'); SH.Phone.push('mom', 'mom', `${k.parent} called me. ${k.n} says you've been talking about running away. Baby, what's going on? Please talk to me.`); SH.Phone.push(id, id, 'i\'m sorry. i told my ' + par(k) + '. i didn\'t know what else to do'); }
    });
  });
  if (SH.K && SH.K.hourly) SH.K.hourly.push((h) => {
    if (h !== 19) return; const g = G(); if (g.ended) return;
    FR.metIds().forEach((id) => { const f = FR.st(id); if (!f.rt || f.rt.when !== SH.day() || !f.wouldRun || (g.party || []).includes(id) || f.rt.pinged === SH.day()) return; f.rt.pinged = SH.day(); SH.Phone.push(id, id, SH.util.pick(['still on for tonight? i packed snacks', 'r we still doing it. i\'m kinda shaking lol', 'text me when. i\'m ready']).toLowerCase()); });
  });
  /* greetings that remember the thread */
  if (SH.Mem && SH.Mem.greeting) { const bg = SH.Mem.greeting; SH.Mem.greeting = function (npc) {
    try { if (KIDS[npc]) { const f = FR.st(npc), rt = f.rt || {}, d = SH.day();
      if (f.told && d - f.told <= 2 && !f.toldGreeted) { f.toldGreeted = 1; return '...are u mad at me? about telling. i was scared'; }
      if (f.wouldRun && rt.when && rt.when >= d && !(G().party || []).includes(npc)) return rt.when === d ? 'so. tonight. are we still doing it?' : 'so... are we still doing it?';
      if (rt.where && rt.talked && G().t - rt.talked > 12 * 60 && !rt.greeted) { rt.greeted = 1; return `hey. u still thinking about the ${rt.where} thing?`; } } } catch (e) {}
    return bg.apply(this, arguments); }; }
  /* ---------- PIP options that change ---------- */
  const bS = SH.PIP && SH.PIP.suggest;
  if (bS) SH.PIP.suggest = function (npc, lastText, ctx) {
    const T = SH.Talk, c = T && T.cur && T.cur.npc === npc ? T.cur : null, last = String(lastText || '').toLowerCase(), g = G();
    const mine = new Set([...document.querySelectorAll('#tlog .tl.me')].map((x) => norm(x.textContent)));
    const thr = (G().threads && G().threads[npc]) || []; thr.filter((m) => m.from === 'me').slice(-12).forEach((m) => mine.add(norm(m.text)));
    const st = c || (g.convMem && g.convMem[npc]) || {}; st._sug = (st._sug || 0) + 1; st._sugH = st._sugH || [[], [], []];
    let pools = null;
    if (KIDS[npc]) pools = friendPools(npc, last, c);
    const base = bS.apply(this, arguments) || [];
    const tones = ['honest', 'smartass', 'dodge'], out = [];
    tones.forEach((tone, i) => {
      const cands = [].concat(pools ? pools[i] : [], (base.find((x) => x.tone === tone) || {}).t || [], ALT[tone]);
      const H = st._sugH[i], fresh = (x) => x && !mine.has(norm(x));
      let ok = cands.filter((x) => fresh(x) && !H.includes(norm(x)));
      if (!ok.length) { H.length = 0; ok = cands.filter((x) => fresh(x) && norm(x) !== norm((out[i] || {}).t)); }
      const pickL = ok[0] || cands[0]; H.push(norm(pickL));
      out.push({ tone, t: pickL });
    });
    return out;
  };
  const ALT = {
    honest: ['Honestly, things aren\'t great.', 'Can I tell you something real?', 'I\'m scared, kind of.', 'I don\'t really know what to do.'],
    smartass: ['Could be worse. Could be raining. Oh wait.', 'Living the dream. The dream is weird.', 'On a scale of one to ten? Pineapple.', 'Great. Super great. Never been greater.'],
    dodge: ['Whatever.', 'Nothing. Forget it.', 'Anyway. What\'s up with you?', 'Can we talk about something else?'],
  };
  function friendPools(id, last, c) {
    const k = KIDS[id], f = FR.st(id), rt = f.rt || {}, th = (c && c.mem && c.mem.th) || {}, n = k.n;
    const likes = { nia: 'drawing', marco: 'skating', priya: 'baking', eli: 'skyforge', theo: 'basketball', hazel: 'climbing' }[id] || 'stuff';
    if (/where would (you|u)|where would u even go|where\??$/.test(last) || th.s === 'where') return [['Somewhere small. A village maybe. Nobody would look there.', 'My grandma\'s, maybe. Cedar Falls.', 'Somewhere far. I\'ll figure it out.'], ['Anywhere with wifi and no Rick.', 'The moon. Low rent.', 'Wherever the bus goes.'], ['I don\'t know yet.', 'Nowhere. Forget I said it.', 'Idk, it was a joke.']];
    if (/that bad|is it home|home stuff|going on at home|what happened|why run|why tho/.test(last) || th.s === 'bad' || th.s === 'what') return [['Yeah. It\'s really bad. Rick\'s drinking again.', 'He yells all the time. I\'m scared to be home.', 'Yeah. I can\'t be there anymore.'], ['Define bad. On a scale of one to Rick?', 'Home is a whole genre of bad.', 'It\'s giving horror movie.'], ['It\'s fine. Forget it.', 'Not really. I\'m just tired.', 'I don\'t want to talk about it.']];
    if (/\bwhen\??$|when\?|tell me when/.test(last) || th.s === 'when') return [['Tonight. After my mom\'s asleep.', 'Tomorrow after school.', 'This weekend.'], ['Right now. Grab your shoes.', 'When the vibes are right.', 'Friday. Dramatic, right?'], ['I don\'t know yet.', 'Soon. I\'ll text you.', 'Not sure yet.']];
    if (/tell my (mom|dad)|have to tell/.test(last)) return [['Please don\'t tell anyone. I trust you.', 'Please. If you tell, it gets worse for me.'], ['Snitches get no snacks.', 'Tell them and I\'ll never share fries again.'], ['Okay. I get it.', 'Do what you have to do.']];
    if (th.s === 'decide' || th.s === 'secret' || /come to mine|window|crash at mine|u can come/.test(last)) return [[`Would you come with me, ${n}?`, 'Can I come to yours tonight?', 'Promise you won\'t tell anyone?'], ['Two is safer than one, right?', 'Road trip. Snacks on you.', 'We\'d be like a movie. A sad one.'], ['Don\'t tell anyone, okay?', 'Forget it. I\'ll figure it out.', 'Let\'s just hang out.']];
    if (/(you|u) ok\??|are (you|u) (okay|ok|alright)/.test(last)) return [['No. Things at home are really bad.', 'Not really. Can I tell you something?'], ['Define okay.', 'I\'m a solid four out of ten.'], ['I\'m fine.', 'Yeah, just tired.']];
    return [[f.knows ? `Things at home got worse, ${n}.` : 'Can I tell you something real?', 'Do you ever think about running away?', f.offer ? 'Can I come to yours tonight?' : 'Can I sleep over sometime?'], [`Teach me ${likes}. I'll be terrible.`, 'Rate my day out of ten. I\'ll wait.', 'Tyler\'s haircut still looks like a lampshade.'], [`What are you doing later?`, `How's ${likes} going?`, 'Nm. You?']];
  }
})(window.SH);
