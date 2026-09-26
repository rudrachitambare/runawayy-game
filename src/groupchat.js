/* SMALL HOURS — group chats with memory.
   ENGINE (SH.GChat): every group chat keeps its own log (who said what, when; last 80 lines) in G.gc[id].
   - Several people can answer one message, and they react to each other.
   - Ask the group about the past: "what did devon say", "who said the dance was cancelled", "what did I say about rick",
     "catch me up / what did I miss / what were we talking about".
   - Nobody repeats a line in the same chat. Their questions to you are remembered, so "yeah" / "no" / a short answer lands.
   7B CLASS CHAT (maddie.k, devonnn, ava.reads, priya.draws), each with their own interests:
   - Group questions ("anyone do the worksheet?") get answered by whoever cares about that topic. Say a name to talk to one of them.
   - They remember: snap at them and the chat is cool with you until you apologize; say you're sad and Ava checks on you
     the next day; tell the same joke twice and someone notices; answer Maddie's dance question and it comes up later.
   - When you're missing, the chat is about you. Posting there is risky: parents read over shoulders, and naming a place
     spreads it (more heat; flags.toldClassPlace).
   THE SQUAD 🛹 (friends group chat, id 'crew'): appears once you've met two friends. Each friend answers with their own
   brain and memory; anything you share about yourself is heard (and remembered) by everyone in the chat. Friends who are
   with you on the road tease you for texting them from two feet away. While you're gone, friends at home pass on news
   (worried parents, who's asking questions).
   Also fixes: friends never answered 1:1 texts (Phone.available had no case for them). */
(function (SH) {
  const P = SH.Phone, N = SH.NLP, FR = SH.Friends; if (!P || !N) return;
  const G = () => SH.G, pick = (a) => a[Math.floor(Math.random() * a.length)], chance = (p) => Math.random() < p;
  const norm = (s) => String(s || '').toLowerCase().replace(/[^a-z0-9 ]/g, '').replace(/\s+/g, ' ').trim();
  const when = (t) => (SH.Mem && SH.Mem.when ? SH.Mem.when(t) : 'earlier');
  const qt = (s, n = 60) => { s = String(s).replace(/\s+/g, ' ').trim(); return s.length > n ? s.slice(0, n - 1) + '…' : s; };
  const R = (say, fx) => ({ say, fx: fx || {} });
  const GC = SH.GChat = {};
  const st = (id) => { const g = G(); g.gc = g.gc || {}; return (g.gc[id] = g.gc[id] || { log: [], used: {}, facts: {}, asked: null, beef: null, worry: null, jokes: {}, n: 0 }); };
  GC.st = st;
  const GROUPS = ['class', 'crew'];
  const logLine = (id, who, text) => { const s = st(id); s.log.push([who, String(text).slice(0, 200), G().t]); if (s.log.length > 80) s.log.shift(); };
  /* log everything that goes into a group thread */
  const bPush = P.push;
  P.push = function (id, from, text) {
    try { if (GROUPS.includes(id) && typeof text === 'string') { if (from === 'me') logLine(id, 'me', text); else if (from === id) { const m = text.match(/^([^:]{2,16}):\s*(.*)$/); if (!m) return; logLine(id, m[1].toLowerCase(), m[2]); } } } catch (e) {} // unattributed lines (1:1 memory callbacks) don't belong in a group
    return bPush.apply(this, arguments);
  };
  const fresh = (id, arr) => { const s = st(id), ok = arr.filter((x) => !s.used[norm(x)]); const l = pick(ok.length ? ok : arr); s.used[norm(l)] = 1; return l; };
  const post = (id, who, text, delay) => setTimeout(() => { if (!G().ended) { P.push(id, id, `${who}: ${text}`); P.render && P.render(); } }, delay);
  GC.post = post;
  /* ---------- memory questions about the chat ---------- */
  const STOP = new Set('the a an and or but i you me my your it is was to of in on at that this what did say said about who when how why do does just like so um hey yo lol u ur'.split(' '));
  function recall(id, t, members, alias, voice) {
    const s = st(id), L = s.log.slice(0, -1); // everything before the message being answered
    const find = (who, q) => { const w = norm(q).split(' ').filter((x) => x.length > 2 && !STOP.has(x)); let best = null, bs = 0; L.forEach((l) => { if (who && l[0] !== who) return; const tt = norm(l[1]); let sc = w.length ? w.filter((x) => tt.includes(x)).length : 1; if (sc > 0 && sc >= bs) { bs = sc; best = l; } }); return w.length && bs < Math.max(1, w.length * 0.5) ? null : best; };
    let m;
    if (/\b(catch me up|what did i miss|what('?s| is) going on|what were (we|u|you guys) (talking|texting) about|wh?at happened in here)\b/.test(t)) {
      const last = L.filter((l) => l[0] !== 'me' && !/^(ok so |i said "|u said "|"|me lol|nobody\?\?|nope not|yeah \S+ said|\.\.\.u did|\S+ did\. |\S+ didnt say)/.test(l[1])).slice(-5); if (!last.length) return [members[0], 'nothing lol its been dead in here'];
      return [pick(members), 'ok so ' + last.slice(-3).map((l) => `${l[0]} said "${qt(l[1], 40)}"`).join(', ') + '. thats it'];
    }
    if ((m = t.match(/\bwhat did (\w+(?:\.\w+)?) (?:say|text|post)(?: about (.+))?/))) {
      const who = m[1] === 'i' ? 'me' : alias(m[1]); if (!who) return null; const l = find(who, m[2] || ''); const ans = members.find((x) => x !== who) || members[0];
      if (!l) return [ans, who === 'me' ? 'idk u didnt say anything about that' : `${who} didnt say anything about that i think`];
      return who === 'me' ? [ans, `u said "${qt(l[1])}" ${when(l[2])}`] : [who, pick([`i said "${qt(l[1])}" keep up`, `"${qt(l[1])}". ${when(l[2])}. scroll up lol`])];
    }
    if ((m = t.match(/\bwho (?:said|was talking about|brought up|mentioned) (.+)/))) {
      const l = find(null, m[1]); const ans = pick(members);
      if (!l) return [ans, 'nobody?? u made that up'];
      return l[0] === 'me' ? [ans, `...u did. ${when(l[2])}`] : l[0] === ans ? [ans, 'me lol'] : [ans, `${l[0]} did. ${when(l[2])}`];
    }
    if ((m = t.match(/\bdid (?:i|u|you guys|anyone|any1) (?:say|tell|mention|talk about) (.+?)\??$/))) { const l = find(/\bi\b/.test(t.slice(0, 5)) ? 'me' : null, m[1]); return [pick(members), l ? `yeah ${l[0] === 'me' ? 'u' : l[0]} said "${qt(l[1])}" ${when(l[2])}` : 'nope not that i saw']; }
    return null;
  }
  /* ---------- 7B class chat ---------- */
  const CL = {
    'maddie.k': { a: /\b(maddie|maddy|madison)\b/, likes: /\b(dance|party|halloween|costume|crush|drama|tea|gossip|outfit|cute)\b/,
      topic: ['ok but whos going to the dance', 'the costume contest is gonna be so good', 'wait tell me EVERYTHING', 'omg drama'], gen: ['realll', 'lmaooo', 'wait what', 'no bc same'],
      ask: [['dance', 'sam r u going to the halloween dance??'], ['costume', 'sam what r u being for halloween']] },
    devonnn: { a: /\b(devon|dev|devonn+)\b/, likes: /\b(skyforge|game|gaming|raid|code|minecraft|console|wyrm|level|boss)\b/,
      topic: ['skyforge raid at 7 whos in', 'the ice wyrm is so broken rn', 'bro i almost had the drop', 'anyone got a skyforge code'], gen: ['lol', 'bro', 'ok fair', 'lmao who asked (jk)'],
      ask: [['raid', 'sam u doing the raid tonight?'], ['calc', 'sam did u see my calculator in 3rd']] },
    'ava.reads': { a: /\bava\b/, likes: /\b(book|read|reading|homework|worksheet|test|quiz|notes|science|math|essay|study|page|teacher)\b/,
      topic: ['the worksheet is page 42 btw', 'the test is thursday, not friday', 'i can send my notes', 'mr dale said its open book'], gen: ['same', 'haha', 'wait really', 'ok good'],
      ask: [['hw', 'sam did u get #6 on the worksheet']] },
    'priya.draws': { a: /\bpriya\b/, likes: /\b(draw|drawing|art|sketch|anime|manga|music|paint|doodle)\b/,
      topic: ['i drew mr dale as a gargoyle again', 'new sketchbook who dis', 'anyone want a portrait. $0. its bad', 'this song is stuck in my head'], gen: ['lol', 'mood', 'ok thats kinda funny', '💀'],
      ask: [['draw', 'sam want me to draw u as a knight']] },
  };
  const CM = Object.keys(CL);
  const clAlias = (w) => CM.find((k) => CL[k].a.test(w) || k.startsWith(w.toLowerCase())) || null;
  const missing = () => { const g = G(); return g.phase === 'run' && !!g.missingAt; };
  SH.Brain.class = function (an, c) {
    const id = 'class', s = st(id), t = an.t, g = G(); s.n++;
    const addr = CM.find((k) => CL[k].a.test(t)); const others = (x) => CM.filter((k) => k !== x);
    if (an.empty) return R('');
    if (an.has && an.has('selfharm')) { post(id, 'ava.reads', 'sam i dmed u. please text the lighthouse line or tell someone. im serious', 1800); SH.flag && SH.flag('toldSomeoneSelfHarm'); return R('ava.reads: sam?? are u ok. like actually'); }
    const rc = recall(id, t, CM, clAlias); if (rc) return R(`${rc[0]}: ${rc[1]}`);
    /* while missing: the chat is about you */
    if (missing()) {
      const first = !s.runSeen; s.runSeen = (s.runSeen || 0) + 1;
      if (first) { post(id, 'devonnn', 'SAM', 1400); post(id, 'ava.reads', 'everyone is looking for u. r u ok??', 3000); post(id, 'priya.draws', 'the police came to homeroom', 4600); return R('maddie.k: WAIT SAM?? where are u'); }
      const pl = SH.PIP && SH.PIP.findPlace ? (an.claims && (an.claims.going || an.claims.from) ? SH.PIP.findPlace(an.claims.going || an.claims.from) : (t.split(/[^a-z ]/).map((x) => x.trim()).filter((x) => x.length > 3).map((x) => SH.PIP.findPlace(x)).find((p) => p && t.includes(p.name.toLowerCase())))) : null;
      if (pl) { g.flags.toldClassPlace = pl.name; g.heat = Math.min(100, (g.heat || 0) + 10); post(id, 'devonnn', `bro dont post where u are in HERE`, 2000); post(id, 'ava.reads', 'my mom is literally reading this over my shoulder. sorry sam', 3800); return R(`maddie.k: wait ${pl.name.toLowerCase()}??`); }
      if (chance(0.3)) { g.heat = Math.min(100, (g.heat || 0) + 4); post(id, pick(others('maddie.k')), 'my mom saw this. she says to tell u to call ur mom', 2400); }
      if (an.has('sad') || an.has('disclose') || an.has('scared')) { s.worry = g.t; return R(`ava.reads: ${fresh(id, ['u can tell us. or ms okafor. shes actually nice', 'sam we miss u. is it bad at home?', 'i believe u. whatever it is'])}`); }
      if (an.has('hostile')) return R(`devonnn: ok ur allowed to be mad. we're just worried`);
      if (an.q) return R(`${pick(CM)}: ${fresh(id, ['everyone is freaking out tbh', 'they did an assembly about "staying safe" lol it was about u', 'ur desk is just empty. its weird', 'ur mom came to school. she looked really tired'])}`);
      return R(`${pick(CM)}: ${fresh(id, ['where r u', 'r u safe tho', 'pls text someone', 'we miss u sam', 'are u coming back'])}`);
    }
    /* their question to you: a short answer lands */
    const A = s.asked && g.t - s.asked.t < 240 ? s.asked : null;
    if (A && (an.has('yes') || an.has('no') || an.len <= 5) && !an.q) {
      s.asked = null; const y = an.has('yes') || /\b(ya|yea|sure|ofc|obv)\b/.test(t), n = an.has('no') || /\b(nah|nope)\b/.test(t);
      s.facts[A.k] = { v: y ? 'yes' : n ? 'no' : qt(an.raw, 30), t: g.t };
      const react = { dance: y ? 'YAY ok ur coming w us' : n ? 'booo ok' : 'ok mysterious', costume: `${qt(an.raw, 24)}?? thats actually hard`, raid: y ? 'bet 7pm dont be late' : 'ur loss', calc: n ? 'ugh someone stole it' : 'WHERE', hw: y ? 'ok send it pls' : 'ok good im not the only one', draw: y ? 'ok ur getting a cape' : 'rude. im drawing u anyway' }[A.k] || 'ok';
      return R(`${A.who}: ${react}`);
    }
    /* beef: they remember you snapping */
    if (s.beef && an.has('sorry')) { s.beef = null; return R(`${pick(CM)}: ok its fine. we good`, { mood: 3 }); }
    if (an.has('hostile')) { s.beef = { t: g.t, q: qt(an.raw, 40) }; post(id, pick(others('maddie.k')), 'yikes', 1600); return R(`maddie.k: ok who hurt u`, { mood: -2 }); }
    let pre = '';
    if (s.beef && g.t - s.beef.t < 2 * 1440 && !s.beef.said) { s.beef.said = 1; pre = `oh now ur nice? (${when(s.beef.t)} u said "${s.beef.q}") `; }
    if (an.has('sad') || an.has('disclose')) { s.worry = g.t; post(id, 'ava.reads', 'dm me if u want', 1700); return R(`ava.reads: ${pre}u ok??`); }
    if (an.has('joke') || an.I.laugh) {
      const k = norm(an.raw); if (s.jokes[k] && k.length > 8) return R(`devonnn: ${pre}u said that ${when(s.jokes[k])} lol. still funny tho`);
      s.jokes[k] = g.t; post(id, pick(others('maddie.k')), pick(['💀💀', 'LMAO', 'stoppp']), 1500); return R(`maddie.k: ${pre}LMAOOO`, { mood: 3 });
    }
    // facts about you: someone reacts, the group remembers (and Mind knows the class heard it)
    if (an.facts && an.facts.length) { const f = an.facts[0]; s.facts['me:' + f.key] = { v: f.v, t: g.t }; if (SH.Mind && SH.Mind.learn) SH.Mind.learn('class', f, an.raw); const w = CM.find((k) => CL[k].likes.test(f.v)) || pick(CM); return R(`${w}: ${pre}${pick([`wait sam likes ${f.v}?? same`, `${f.v}? ok valid`, `noted. ${f.v}`])}`); }
    // someone addressed by name, or a topic somebody cares about
    const fan = addr || CM.find((k) => CL[k].likes.test(t));
    if (fan) {
      const known = Object.entries(s.facts).find(([k, f]) => /^(dance|raid|costume)$/.test(k) && CL[fan].likes.test(k));
      const line = known && chance(0.5) ? { dance: known[1].v === 'yes' ? 'sam ur still coming to the dance right' : 'sam u should come to the dance tho', raid: 'sam u in for the raid again?', costume: `sam is being ${known[1].v} btw` }[known[0]] : fresh(id, an.q ? CL[fan].topic.concat(CL[fan].gen) : CL[fan].topic);
      if (an.q && !addr && chance(0.5)) post(id, pick(others(fan)), fresh(id, CL[pick(others(fan))].gen), 1800);
      return R(`${fan}: ${pre}${line}`);
    }
    // group question nobody specific cares about
    if (an.q) { const w = pick(CM); post(id, pick(others(w)), fresh(id, ['idk', 'ask mr dale', 'no clue']), 1700); return R(`${w}: ${pre}${fresh(id, ['good question', 'hmm', 'wait same q'])}`); }
    // default: a reaction; sometimes someone asks YOU something (remembered)
    const w = pick(CM);
    if (chance(0.35)) { const q = CL[w].ask.filter(([k]) => !s.facts[k])[0]; if (q) { s.asked = { who: w, k: q[0], t: g.t }; return R(`${w}: ${pre}${q[1]}`); } }
    return R(`${w}: ${pre}${fresh(id, CL[w].gen)}`);
  };
  /* ---------- the squad (friends) ---------- */
  const KIDS = (FR && FR.KIDS) || {};
  const crewIds = () => (FR && FR.metIds ? FR.metIds().filter((x) => !G().flags['blocked_' + x]) : []);
  SH.NPCS_META.crew = SH.NPCS_META.crew || { n: 'the squad 🛹', full: 'Friends group chat', col: '#6c5ce7', ini: '#', ph: true };
  const inParty = (id) => (G().party || []).includes(id);
  const crewAlias = (w) => crewIds().find((id) => id === w.toLowerCase() || KIDS[id].n.toLowerCase() === w.toLowerCase()) || null;
  function ask1(id, an) {
    const g = G(); g.convMem = g.convMem || {}; const conv = (g.convMem['crew:' + id] = g.convMem['crew:' + id] || { mem: {}, used: {}, turn: 0 });
    conv.ctx = 'text'; conv.npc = id; conv.turn++;
    const b = SH.Brain[id]; if (!b) return null; let r; try { r = b(an, conv); } catch (e) { console.warn('crew', e); return null; }
    if (!r || !r.say) return null; SH.UI && SH.UI.applyFx && SH.UI.applyFx(id, r);
    let say = N.fill ? N.fill(r.say) : r.say; say = String(say).toLowerCase(); return say;
  }
  SH.Brain.crew = function (an, c) {
    const id = 'crew', s = st(id), t = an.t, g = G(), M = crewIds(); s.n++;
    if (an.empty || !M.length) return R('');
    const nm = (x) => KIDS[x].n;
    const rc = recall(id, t, M.map(nm).map((x) => x.toLowerCase()), (w) => { const x = crewAlias(w); return x ? nm(x).toLowerCase() : null; }); if (rc) return R(`${cap(rc[0])}: ${rc[1]}`);
    // what you share about yourself, everyone in the chat hears
    if (an.facts && an.facts.length && SH.Mind && SH.Mind.learn) M.forEach((x) => an.facts.forEach((f) => SH.Mind.learn(x, f, an.raw)));
    const addr = M.find((x) => new RegExp('\\b' + nm(x).toLowerCase() + '\\b').test(t));
    // "what are y'all doing" → a couple of them say what they're actually up to
    if (!addr && /\b(what (are|r) (y'?all|yall|you all|u all|u guys|you guys|everyone|ppl) (doing|up to)|wyd|what'?s everyone (doing|up to)|anyone (around|up|awake|free))\b/.test(t)) {
      const who = M.slice().sort(() => Math.random() - 0.5).slice(0, 2);
      const act = (x) => inParty(x) ? fresh(id, ['sitting next to u??', 'literally with u', 'watching u text lol']) : missing() ? fresh(id, ['nothing. worrying about u', 'homework. cant focus', 'lying in bed thinking']) : (KIDS[x].hang ? 'just ' + KIDS[x].hang : 'nothing much');
      if (who[1]) post(id, nm(who[1]), act(who[1]), 1800);
      return R(`${nm(who[0])}: ${act(who[0])}`);
    }
    // something about you: whoever shares the taste reacts (everyone remembers it, above)
    if (an.facts && an.facts.length && !an.q) { const f = an.facts[0]; const w = M.find((x) => KIDS[x].likes && KIDS[x].likes.test(f.v)) || pick(M); return R(`${nm(w)}: ${fresh(id, [`${f.v}?? ok good taste`, `noted. ${f.v}`, `wait same honestly`, `${f.v} is so u`]).toLowerCase()}`); }
    const fans = M.filter((x) => KIDS[x].likes && KIDS[x].likes.test(t));
    const first = addr || fans[0] || M.slice().sort((a, b) => (g.rel[b] || 0) - (g.rel[a] || 0) + (Math.random() - 0.5) * 30)[0];
    // friends right next to you
    if (inParty(first) && an.len <= 4 && !an.q && chance(0.6)) return R(`${nm(first)}: ${fresh(id, ['why r u texting me im literally right here 😭', 'i can see u typing. im next to u', 'say it out loud coward', '*looks up from phone* hi'])}`);
    const say = ask1(first, an) || fresh(id, ['lol', 'fr', 'ok']);
    const rest = M.filter((x) => x !== first);
    if (rest.length && !addr && chance(an.q || (an.has && (an.has('sad') || an.has('disclose'))) ? 0.6 : 0.35)) {
      const second = rest.find((x) => KIDS[x].likes && KIDS[x].likes.test(t)) || pick(rest);
      const r2 = chance(0.5) ? fresh(id, [`what ${nm(first).toLowerCase()} said`, `lol ${nm(first).toLowerCase()}`, `${nm(first).toLowerCase()} is right tho`, 'real']) : ask1(second, an);
      if (r2 && norm(r2) !== norm(say)) post(id, nm(second), r2, 1900);
    }
    return R(`${nm(first)}: ${say}`);
  };
  const cap = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s);
  /* the squad chat shows up in Messages once you've met two friends */
  if (FR && FR.threadIds) { const bT = FR.threadIds; FR.threadIds = function () { const r = bT.apply(this, arguments); return crewIds().length >= 2 && G().threads && G().threads.crew ? r.concat(['crew']) : r; }; }
  /* who can answer a text right now */
  const bAv = P.available;
  P.available = function (id) {
    const g = G(), h = SH.hour();
    if (id === 'crew') return crewIds().length >= 2 && h > 7 && h < 23.5;
    if (KIDS[id] && !g.flags['blocked_' + id]) { if (FR.met && !FR.met(id)) return false; if (inParty(id)) return true; if (h < 7 || h >= 23) return false; if (SH.isWeekday() && h >= 8 && h < 15 && g.phase !== 'run') return chance(0.35); return chance(0.8); }
    return bAv.apply(this, arguments);
  };
  /* ---------- ambient chatter, with memory ---------- */
  function hourly(h) {
    const g = G(); if (!g || g.ended || h < 8 || h > 22) return;
    const M = crewIds();
    if (M.length >= 2 && !(g.threads && g.threads.crew)) { P.push('crew', 'sys', `${KIDS[M[0]].n} made a group chat: "the squad 🛹"`, false); post('crew', KIDS[M[0]].n, 'ok everyone is in here now. no parents allowed', 200); return; }
    const cs = st('class');
    if (missing()) {
      if (chance(0.12)) P.push('class', 'class', `${pick(CM)}: ${fresh('class', ['has anyone heard from sam', 'sam if ur reading this pls just text someone', 'my mom said not to talk about it in here', 'the police talked to ms okafor today', ...(g.reported ? ['i saw sams poster at the gas station', 'sams picture was on the news??'] : [])])}`);
      if (M.length >= 2 && chance(0.1)) { const home = M.filter((x) => !inParty(x)), away = M.filter(inParty); if (home.length) { const a = pick(home); const w = away.length && SH.Parents ? SH.Parents.W(away[0]) : null; P.push('crew', 'crew', `${KIDS[a].n}: ${fresh('crew', [...(away.length ? [`${KIDS[away[0]].n.toLowerCase()} ur mom ${w && w.w > 60 ? 'is freaking out. she called everyone' : 'called my mom'}`, `r u guys ok??`] : []), 'ur mom came by my house', 'a cop asked me if i knew where u were. i said no', 'school is so weird without u'])}`.toLowerCase().replace(/^./, (x) => x.toUpperCase())); } }
      return;
    }
    if (cs.worry && g.t - cs.worry > 12 * 60 && g.t - cs.worry < 3 * 1440 && !cs.worryAsked) { cs.worryAsked = 1; P.push('class', 'class', 'ava.reads: @sam u good today?'); return; }
    if (chance(0.05)) { const w = pick(CM), known = Object.entries(cs.facts).find(([k]) => /^me:/.test(k)); P.push('class', 'class', `${w}: ${known && chance(0.4) ? `wait sam said ${known[0].slice(3).replace(/^fav:/, 'fav ')} is ${known[1].v}. random but i thought of that` : fresh('class', CL[w].topic)}`); }
    if (M.length >= 2 && chance(0.05)) {
      const a = pick(M), f = SH.Mind && SH.Mind.facts ? Object.values(SH.Mind.facts()).filter((x) => x.by && x.by[a] != null).pop() : null;
      const line = f && chance(0.5) ? `remember when u said ${SH.Mind.describe(f).replace(/^your /, 'ur ')} lol` : fresh('crew', ['anyone awake', 'i\'m so bored', 'what r we doing this weekend', 'who wants to get pizza']);
      P.push('crew', 'crew', `${KIDS[a].n}: ${line.toLowerCase()}`);
    }
  }
  if (SH.K && SH.K.hourly) SH.K.hourly.push(hourly);
  GC.hourly = hourly;
})(window.SH);
