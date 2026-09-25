/* SMALL HOURS — NPC memory, conversation logs, and tone reading.
   NPCs remember specific things you said (quoted, dated), notice contradictions and repeats,
   and every conversation — in person or by text — is kept as a transcript. */
(function (SH) {
  const U = SH.util;
  const M = SH.Mem = {};
  const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const q = (s, n = 42) => { s = String(s).trim().replace(/\s+/g, ' '); return s.length > n ? s.slice(0, n - 1) + '…' : s; };

  /* ---------- storage ---------- */
  const store = (npc) => { const G = SH.G; return (G.mem[npc] = G.mem[npc] || []); };
  M.add = function (npc, m) {
    const G = SH.G, L = store(npc), d = SH.day();
    const ex = L.find((x) => x.topic === m.topic && x.d === d && x.src === (m.src || 'said'));
    if (ex) { ex.text = m.text; ex.t = G.t; ex.quote = m.quote || ex.quote; return ex; }
    const rec = Object.assign({ d, t: G.t, src: 'said', w: 1, used: 0 }, m);
    L.push(rec); if (L.length > 60) L.splice(0, L.length - 60);
    return rec;
  };
  M.has = (npc, topic) => store(npc).some((x) => x.topic === topic);
  M.last = (npc, topic, beforeDay) => store(npc).filter((x) => (!topic || (Array.isArray(topic) ? topic.includes(x.topic) : x.topic === topic)) && (beforeDay == null || x.d < beforeDay)).pop();
  M.all = (npc) => store(npc).slice();

  M.when = function (t) {
    const G = SH.G, dn = SH.day(), dt = SH.day(t), diff = dn - dt;
    if (diff === 0) { const mins = G.t - t; return mins < 90 ? 'just now' : SH.hour(t) < 12 ? 'this morning' : 'earlier today'; }
    if (diff === 1) return SH.hour(t) >= 20 ? 'last night' : 'yesterday';
    const wd = DAYS[SH.wd(t)];
    if (diff < 7) return (SH.wd() > SH.wd(t) ? 'on ' : 'last ') + wd;
    return diff < 14 ? 'last ' + wd : diff + ' days ago';
  };
  const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);

  /* ---------- tone ---------- */
  const T = SH.Tone = {};
  const SLANG = /\b(lol|lmao|fr|bruh|ngl|u|ur|idk|lowkey|highkey|deadass|bet|sus|no cap|finna|tbh|rn|ong|bro|dude|smh|istg|yall|gonna|wanna|nah|yeah|ya|k|kk|omg|wtf)\b/g;
  const FORMAL = /\b(please|thank you|would you|could you|i would|mother|father|sir|ma'am|excuse me|pardon|certainly|however|therefore|i apologize|indeed)\b/g;
  const HEDGE = /\b(maybe|i guess|idk|i don't know|kinda|kind of|sort of|probably|not sure|i think|perhaps|um+|uh+|possibly|dunno)\b/g;
  const SARC = /(yeah right|oh great|wow thanks|thanks a lot|totally\b|obviously\b|\/s\b|what a surprise|love that for me|cool cool|sure+\s*\.{2,}|oh joy|great\.{2,}|fantastic\.|classic\.|big surprise|wow\.|as if)/;
  const SWEAR = /\b(fuck|shit|damn|hell|crap|ass|bitch|wtf)\w*/;
  T.read = function (raw) {
    const s = String(raw || ''), l = s.toLowerCase(), words = l.split(/\s+/).filter(Boolean), n = Math.max(1, words.length);
    const letters = s.replace(/[^A-Za-z]/g, ''), caps = letters.length > 3 ? letters.replace(/[^A-Z]/g, '').length / letters.length : 0;
    const slangHits = (l.match(SLANG) || []), formalHits = (l.match(FORMAL) || []), hedges = (l.match(HEDGE) || []);
    let formal = Math.min(1, formalHits.length * 0.35 + (/^[A-Z]/.test(s) && /[.!?]$/.test(s) && !/\b(i'm|don't|can't|won't|it's)\b/.test(l) && n > 4 ? 0.3 : 0));
    const slang = Math.min(1, slangHits.length / Math.max(2, n / 3));
    let intensity = Math.min(1, caps * 1.2 + ((s.match(/!/g) || []).length * 0.15) + (SWEAR.test(l) ? 0.35 : 0) + (/(\w)\1{3,}/.test(l) ? 0.2 : 0) + (/\b(so|really|literally|extremely|never|always)\b/.test(l) ? 0.1 : 0));
    const an = SH.NLP.analyze(s);
    let sarcasm = SARC.test(l) ? 0.7 : 0;
    if (/\b(great|nice|awesome|perfect|love|wonderful|fun)\b/.test(l) && (an.has('sad') || an.has('angry') || /\b(not|another|again)\b/.test(l)) ) sarcasm = Math.max(sarcasm, 0.55);
    if (/\blol\b|\blmao\b/.test(l) && (an.has('disclose') || an.has('sad'))) sarcasm = Math.max(sarcasm, 0.35); // laughing it off
    const uncertain = Math.min(1, hedges.length * 0.4 + (/\.\.\.|…/.test(s) ? 0.2 : 0) + (an.q && hedges.length ? 0.2 : 0));
    const emotion = an.has('selfharm') ? 'despair' : an.has('angry') || an.has('hostile') ? 'anger' : an.has('scared') ? 'fear' : an.has('sad') ? 'sadness' : an.sent > 0 ? 'warmth' : 'neutral';
    const polite = /\b(please|thanks|thank you|sorry)\b/.test(l);
    return { formal, slang, intensity, sarcasm, uncertain, emotion, polite, hedge: hedges[0], slangWord: slangHits[0], laughingOff: /\blol\b|\blmao\b|haha/.test(l) && (an.has('disclose') || an.has('sad')) };
  };
  // NPC-specific reactions to *how* something was said
  T.react = function (npc, t, c) {
    c.toneCd = c.toneCd || 0; if (c.toneCd > 0) { c.toneCd--; return null; }
    const G = SH.G, r = (pre, fx, x) => { c.toneCd = 2; return Object.assign({ pre, fx: fx || {} }, x || {}); };
    switch (npc) {
      case 'rick':
        if (t.sarcasm >= 0.5) { c.mem.anger = (c.mem.anger || 0) + 1; return r('"Oh, you think you\'re funny? Keep it up."', { stress: 4, rel: -3 }); }
        if (t.intensity >= 0.6) { c.mem.anger = (c.mem.anger || 0) + 1; return r('"Don\'t you raise your voice in my house."', { stress: 5, rel: -2 }); }
        if (t.formal >= 0.5 || /\bsir\b/i.test(c.lastText || '')) { c.mem.anger = Math.max(0, (c.mem.anger || 0) - 1); return r('(He blinks. The politeness throws him off.)', { rel: 1 }); }
        break;
      case 'mom':
        if (/\bmother\b/i.test(c.lastText || '')) return r('"\'Mother\'? Since when are we so formal?"', {});
        if (t.sarcasm >= 0.5) return r('"Don\'t take that tone with me, baby. I\'m running on four hours of sleep."', { rel: -2 });
        if (t.intensity >= 0.6 && ['sadness', 'fear', 'despair'].includes(t.emotion)) return r('"Hey. Hey. Breathe. I\'m right here."', { stress: -3 });
        if (t.laughingOff) return r('"You\'re laughing, but your face isn\'t."', {});
        break;
      case 'jordan':
        if (t.formal >= 0.6) return r('"why r u typing like a butler lmao"', {});
        if (t.sarcasm >= 0.5) return r('"lmao ok mr sarcasm"', {});
        if (t.intensity >= 0.6 && t.emotion === 'anger') return r('"whoa ok. chill. what happened"', {});
        if (t.laughingOff) return r('"u keep lol-ing about it but like. is it actually funny"', {});
        break;
      case 'okafor':
        if (t.uncertain >= 0.4 && t.hedge && !/^i (think|feel|mean)$/.test(t.hedge) && !c.mem.hedged && (c.mem.hedged = 1)) return r(`"You said '${t.hedge}.' It sounds like part of you isn't sure. That's allowed."`, { rel: 1 });
        if (t.sarcasm >= 0.5) return r('"Sarcasm\'s a good shield. I use it too. What\'s behind it?"', {});
        if (t.laughingOff) return r('"I notice you laughed when you said that. Sometimes we laugh at things that aren\'t funny at all."', { rel: 2 });
        if (t.intensity >= 0.6) return r('"I can hear how big this feels."', {});
        break;
      case 'grandma':
        if (t.slang >= 0.5 && t.slangWord) return r(`"I don't know what '${t.slangWord}' means, sweet pea, but I love you."`, { rel: 1 });
        if (t.formal >= 0.5) return r('"So polite! Somebody raised you right."', { rel: 1 });
        break;
      case 'lily':
        if (t.sarcasm >= 0.5) return r('"wait really?? ...oh. you\'re doing the voice."', {});
        if (t.intensity >= 0.6) return r('"why are you yelling 😢"', { rel: -2 });
        break;
      case 'patel':
        if (t.polite || t.formal >= 0.5) return r('"Such manners. Newton could learn from you."', { rel: 2 });
        if (t.slang >= 0.6) return r('"I am going to pretend I understood that, dear."', {});
        break;
      case 'dex':
        if (t.slang >= 0.3 && !SH.f('dexMirrorFlag')) { SH.flag('dexMirrorFlag'); G.redFlags.push('He copies the way you type, so he feels familiar.'); }
        break;
      case 'tyler':
        if (t.sarcasm >= 0.5) return r('"Oh, you think you\'re funny?"', { rel: -2 });
        break;
    }
    return null;
  };

  /* ---------- what gets remembered ---------- */
  const TOPICS = [
    { topic: 'selfharm', test: (an) => an.has('selfharm'), text: () => 'you said you didn\'t want to be here anymore', w: 5 },
    { topic: 'rickHurts', test: (an) => /\b(hit|hits|hurt|hurts|grab|grabbed|bruise|bruises|punch|shoved|threw)\b/.test(an.t) && /\b(rick|stepdad|he|him)\b/.test(an.t), text: () => 'Rick hurt you', rumor: 'bruise', w: 4 },
    { topic: 'rickScared', test: (an) => an.has('scared') && /\b(rick|stepdad|him|home)\b/.test(an.t), text: () => 'you\'re scared of Rick', w: 3 },
    { topic: 'rickDrinks', test: (an) => /\b(rick|stepdad|he)\b/.test(an.t) && /\b(drink|drinks|drinking|drunk|beer|wasted)\b/.test(an.t), text: () => 'Rick\'s been drinking', rumor: 'rickDrinks', w: 3 },
    { topic: 'runaway', test: (an) => an.has('run'), text: () => 'you wanted to run away', rumor: 'runaway', w: 4 },
    { topic: 'busPlan', test: (an) => /\b(bus|ticket|greyline)\b/.test(an.t) && /\b(cedar falls|grandma|leave|away)\b/.test(an.t), text: () => 'you were asking about the bus to Cedar Falls', rumor: 'runaway', w: 3 },
    { topic: 'dex', test: (an) => an.has('dex') || /\b(online friend|guy online|someone online|from skyforge)\b/.test(an.t), text: () => 'you\'ve been talking to some guy online', rumor: 'dex', w: 3 },
    { topic: 'hateSchool', test: (an) => /\b(hate|can't stand|sick of)\b.*\b(school|class|math|teachers?)\b|\b(school|math)\b.*\b(sucks|stupid|pointless)\b/.test(an.t), text: () => 'you hated school', rumor: 'hateSchool', w: 2 },
    { topic: 'bullied', test: (an) => an.has('bully'), text: () => 'Tyler\'s been messing with you', w: 2 },
    { topic: 'tylerDad', test: (an) => /\btyler\b/.test(an.t) && /\b(dad|father|cried|crying|yelling at him)\b/.test(an.t), text: () => 'Tyler\'s dad yells at him', rumor: 'tylerDad', w: 2 },
    { topic: 'broke', test: (an) => /\b(no money|broke|can't afford|no food|nothing to eat|bills)\b/.test(an.t), text: () => 'money\'s tight at home', rumor: 'broke', w: 2 },
    { topic: 'hungry', test: (an) => an.has('food') && /\b(hungry|starving|haven't eaten|didn't eat)\b/.test(an.t), text: () => 'you hadn\'t eaten', w: 2 },
    { topic: 'stayAsk', test: (an) => an.has('stay'), text: () => 'you asked if you could stay over', w: 2 },
    { topic: 'moneyAsk', test: (an) => an.has('money') && /\b(can i|could i|lend|borrow|need)\b/.test(an.t), text: () => 'you asked for money', w: 1 },
    { topic: 'promise', test: (an) => an.has('promise'), text: (an) => 'you promised: "' + q(an.raw, 50) + '"', w: 2 },
    { topic: 'apology', test: (an) => an.has('sorry'), text: () => 'you apologized', w: 1 },
    { topic: 'love', test: (an) => an.has('love'), text: () => 'you said you love them', w: 2 },
    { topic: 'insult', test: (an) => an.has('hostile'), text: (an) => 'you said "' + q(an.raw, 34) + '"', w: 2 },
    { topic: 'fine', test: (an) => an.has('deflect') || an.has('safe'), text: () => 'you said you were fine', w: 1 },
    { topic: 'sad', test: (an) => an.has('sad'), text: (an) => 'you told me "' + q(an.raw, 40) + '"', w: 2 },
    { topic: 'grandma', test: (an) => an.has('grandma'), text: () => 'you brought up Grandma', w: 1 },
  ];
  const HEAVY = ['sad', 'rickScared', 'rickHurts', 'selfharm', 'runaway'];

  // voice templates
  const VOICE = {
    jordan: { recall: (x, w) => `u said ${x} ${w}`, contra: (x, w) => `wait. ${w} u told me ${x}. now ur "fine"? ok sure`, repeat: (w) => `u said that ${w} too lol. u ok tho?`, insult2: (qq, w) => `bro thats twice. ${w} it was ${qq}`, apol: (w) => `ok. ${w} was kinda messed up tho. we good`, },
    mom: { recall: (x, w) => `You told me ${x} ${w}.`, contra: (x, w) => `${cap(w)} you told me ${x}. Now it's "fine"? Baby, which one is true?`, repeat: (w) => `You said that ${w} too. Is something going on?`, insult2: (qq, w) => `That's twice. ${cap(w)} it was ${qq}. I don't deserve that.`, apol: (w) => `Thank you. ${cap(w)} really hurt, you know.` },
    okafor: { recall: (x, w) => `${cap(w)}, you mentioned ${x}.`, contra: (x, w) => `I notice ${w} you told me ${x}, and today it's "fine." Both things can be true. I'm listening either way.`, repeat: (w) => `That's the second time you've said that. You said it ${w} too. What's underneath it?`, insult2: (qq, w) => `You're allowed to be angry at me. ${cap(w)} too. I'm still here.`, apol: () => `Apology accepted. You don't owe me one, though.` },
    grandma: { recall: (x, w) => `Sweetheart, ${w} you told me ${x}.`, contra: (x, w) => `Mm. ${cap(w)} you told me ${x}, sweet pea. Grandmas remember.`, repeat: (w) => `You said that ${w} too, honey.`, insult2: () => `Well. Somebody's having a day.`, apol: () => `Oh, pish. Already forgotten.` },
    rick: { recall: (x, w) => `${cap(w)} you said ${x}. Don't think I forget stuff.`, contra: (x, w) => `Yeah? That's not what you were saying ${w}.`, repeat: (w) => `Same thing you said ${w}. Broken record.`, insult2: (qq, w) => `Again? ${cap(w)} it was ${qq}. You're on thin ice.`, apol: (w) => `...Yeah. Well. ${cap(w)} was out of line.` },
    lily: { recall: (x, w) => `you said ${x} ${w}!`, contra: (x, w) => `but ${w} you said ${x}...`, repeat: (w) => `you said that ${w}!`, insult2: () => `you're being mean AGAIN`, apol: () => `ok. pinky promise you won't be mean.` },
    patel: { recall: (x, w) => `${cap(w)} you said ${x}, dear.`, contra: (x, w) => `${cap(w)} you told me ${x}. Newton and I have been worried.`, repeat: (w) => `You said the same ${w}.`, insult2: () => `Goodness.`, apol: () => `Water under the bridge, dear.` },
  };
  const V = (npc) => VOICE[npc] || { recall: (x, w) => `You said ${x} ${w}.`, contra: (x, w) => `${cap(w)} you said ${x}.`, repeat: (w) => `You said that ${w} too.`, insult2: () => '...', apol: () => 'Okay.' };

  // called on every line the player says to an NPC (in person or text). Returns an optional callback line.
  M.observe = function (npc, raw, via, an) {
    an = an || SH.NLP.analyze(raw);
    const G = SH.G, d = SH.day(); let callback = null, fx = null;
    const hits = TOPICS.filter((tp) => tp.test(an));
    for (const tp of hits) {
      const prev = M.last(npc, tp.topic, d);
      // contradiction: "fine" after something heavy
      if (tp.topic === 'fine' && !callback) {
        const heavy = store(npc).filter((x) => HEAVY.includes(x.topic) && d - x.d <= 10).pop();
        if (heavy) { callback = V(npc).contra(heavy.text, M.when(heavy.t)); heavy.used++; }
        else if (via === 'person' && (G.s.mood < 25 || G.s.stress > 75)) M.add(npc, { topic: 'lookedBad', text: 'you said you were fine, but you didn\'t look fine', src: 'saw' });
      }
      if (tp.topic === 'insult' && prev && !callback) { callback = V(npc).insult2(prev.quote || '"that"', M.when(prev.t)); fx = { rel: -3 }; }
      if (tp.topic === 'apology' && !callback) { const ins = M.last(npc, 'insult'); if (ins && !ins.forgiven) { ins.forgiven = true; callback = V(npc).apol(M.when(ins.t)); fx = { rel: 4 }; } }
      if (prev && !callback && ['hateSchool', 'runaway', 'rickScared', 'rickDrinks', 'hungry', 'stayAsk', 'moneyAsk'].includes(tp.topic)) { callback = V(npc).repeat(M.when(prev.t)); prev.used++; }
      M.add(npc, { topic: tp.topic, text: tp.text(an), quote: '"' + q(raw, 34) + '"', via, w: tp.w });
      if (tp.rumor && SH.Rumor) SH.Rumor.told(tp.rumor, npc);
    }
    return { callback, fx, topics: hits.map((h) => h.topic) };
  };

  // a memory-aware opener when you start talking to someone
  M.greeting = function (npc) { return M.recall(npc) || M.generic(npc); };
  M.recall = function (npc) {
    const G = SH.G;
    const rg = SH.Rumor && SH.Rumor.greet(npc); if (rg) return rg;
    const ins = store(npc).filter((x) => x.topic === 'insult' && !x.forgiven && SH.day() - x.d <= 3).pop();
    if (ins) return { jordan: `oh. hey. (${M.when(ins.t)} u said ${ins.quote}. just saying)`, mom: `Hi. I haven't forgotten ${M.when(ins.t)}, by the way.`, lily: `are you still being mean?`, rick: 'What.', okafor: `Hi. I'm glad you came back, even after ${M.when(ins.t)}.`, patel: 'Hello, dear.' }[npc] || null;
    const heavy = store(npc).filter((x) => x.w >= 3 && SH.day() - x.d >= 1 && SH.day() - x.d <= 6 && x.used < 2).pop();
    if (heavy && Math.random() < 0.75) { heavy.used++; return { jordan: `hey. been thinking. ${M.when(heavy.t)} u said ${heavy.text}. u ok?`, mom: `Hi, baby. ${cap(M.when(heavy.t))} you told me ${heavy.text}. I keep thinking about it.`, okafor: `Hi, ${G.name}. ${cap(M.when(heavy.t))} you mentioned ${heavy.text}. How has it been since?`, grandma: `There's my sweet pea. ${cap(M.when(heavy.t))} you told me ${heavy.text}. Grandma's been praying on it.`, lily: `${M.when(heavy.t)} you said ${heavy.text}. is it still true?`, patel: `Hello, dear. I've been thinking about what you said ${M.when(heavy.t)}.`, rick: null }[npc] || null; }
    const light = store(npc).filter((x) => SH.day() - x.d >= 1 && SH.day() - x.d <= 7 && x.used < 1 && ['hateSchool', 'bullied', 'grandma', 'promise', 'hungry'].includes(x.topic)).pop();
    if (light && Math.random() < 0.5) { light.used++; const w = M.when(light.t); return { jordan: `yo. still hate school or did u get over it (u said ${light.text} ${w})`, mom: `Hey. ${cap(w)} you said ${light.text}. Better today?`, okafor: `${cap(w)} you said ${light.text}. I wrote it down, so I'd remember to ask.`, grandma: `${cap(w)} you told me ${light.text}, honey.` }[npc] || null; }
    return null;
  };
  M.generic = function (npc) {
    const G = SH.G;
    return { jordan: 'yo', mom: 'Hi, baby.', okafor: `Hi, ${G.name}. Pull up a beanbag.`, patel: 'Hello, dear! Newton, say hello.', lily: 'hi!! wanna see something', dolores: 'Sit anywhere, hon.', wren: 'Hey.', tyler: 'What do YOU want.', rick: 'What.' }[npc] || null;
  };

  /* ---------- transcripts: every conversation, kept ---------- */
  M.startConvo = function (npc, ctx, via) {
    const G = SH.G; G.convos[npc] = G.convos[npc] || [];
    const L = G.convos[npc];
    if (via === 'text') { const last = L[L.length - 1]; if (last && last.via === 'text' && last.d === SH.day()) return last; }
    const c = { d: SH.day(), t: G.t, ctx, via, lines: [] }; L.push(c); if (L.length > 40) L.shift(); return c;
  };
  M.logLine = function (rec, who, text) { if (!rec) return; rec.lines.push([who, String(text).slice(0, 400), SH.G.t]); if (rec.lines.length > 80) rec.lines.shift(); };
  M.summary = function (npc) {
    // what this person knows / remembers about you, in plain language, newest first
    return store(npc).filter((x) => x.topic !== 'fine' || x.src === 'saw').slice(-8).reverse().map((x) => ({ when: M.when(x.t), text: x.src === 'heard' ? 'heard that ' + x.text : x.src === 'saw' ? x.text : x.text, src: x.src }));
  };

  /* ---------- text messages go through memory too ---------- */
  const P = SH.Phone;
  const basePush = P.push;
  P.push = function (id, from, text, notify) {
    const r = basePush.call(P, id, from, text, notify);
    if (SH.NPCS_META[id] && (from === 'me' || from === id)) { const rec = M.startConvo(id, 'text', 'text'); M.logLine(rec, from === 'me' ? 'me' : 'npc', SH.nm(text)); }
    return r;
  };
  const baseReply = P.reply;
  P.reply = function (id, text) {
    const o = M.observe(id, text, 'text');
    baseReply.call(P, id, text);
    if (o.callback && SH.Brain[id]) setTimeout(() => P.push(id, id, o.callback), 900);
    if (o.fx) SH.UI.applyFx(id, { fx: o.fx });
  };
})(window.SH);
