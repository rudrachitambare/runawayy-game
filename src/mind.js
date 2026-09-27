/* SMALL HOURS — the Mind: real, specific memory for every character.
   - Facts you tell someone ("my favorite color is green", "i have a test friday") are remembered BY THAT PERSON, dated.
   - Ask "what's my favorite color?" / "what did i say about rick?" / "what do you know about me?" and they answer from memory
     (or say you never told them, or that you told someone else instead).
   - Plans come back: tell Jordan about Friday's test and on Saturday he asks how it went.
   - Characters have stable opinions and favorites, and remember what THEY told you, so they don't contradict themselves.
   - Conversation context: answering their questions with "yeah"/"no"/"idk" works, "what?" makes them repeat, "why?" follows up.
   - Everything lives in G.mind, so saves keep it and rewinds roll it back with the rest of the world. */
(function (SH) {
  const N = SH.NLP, U = SH.util;
  const MS = () => { const G = SH.G; G.mind = G.mind || { facts: {}, npc: {} }; return G.mind; };
  const NP = (id) => { const m = MS(); return (m.npc[id] = m.npc[id] || { met: SH.G.t, n: 0, qa: [], ops: {}, said: [] }); };
  const when = (t) => (SH.Mem && SH.Mem.when ? SH.Mem.when(t) : 'before');
  const cap = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s);
  const nm = (id) => { const m = SH.NPCS_META && SH.NPCS_META[String(id).split(':')[0]]; const p = String(id).split(':')[1]; return p ? p.split(/[ ,]/)[0] : m ? m.n.split(' ')[0] : id; };
  const fill = (tpl, o) => tpl.replace(/\{(\w+)\}/g, (_, k) => (o[k] != null ? o[k] : ''));
  const pick = (c, key, arr) => (c && N.pick ? N.pick(c, 'mind_' + key, arr) : U.pick(arr));
  const hash = (s) => { let h = 7; for (const ch of String(s)) h = (h * 31 + ch.charCodeAt(0)) >>> 0; return h; };
  const SKIP = ['dex', 'lighthouse', 'class', 'railagent', 'conductor'];

  /* ---------- how a fact sounds said back to you ---------- */
  function describe(f) {
    switch (f.kind) {
      case 'fav': return `your favorite ${f.cat} is ${f.v}`; case 'like': return `you like ${f.v}`; case 'dislike': return `you can't stand ${f.v}`;
      case 'skill': return `you're good at ${f.v}`; case 'fear': return `you're scared of ${f.v}`; case 'dream': return `you want to be ${/^[aeiou]/.test(f.v) ? 'an' : 'a'} ${f.v}`;
      case 'birthday': return `your birthday is ${f.v}`; case 'pet': return `your pet is ${f.v}`; case 'nick': return `you like being called ${f.v}`; case 'bff': return `your best friend is ${f.v}`;
      case 'grade': return `you got ${/^[AEF8]/.test(f.v) ? 'an' : 'a'} ${f.v}`; case 'miss': return `you miss ${f.v}`; case 'wish': return `you wish ${f.v}`;
      case 'event': return `you had ${/^going/.test(f.v) ? '' : 'a '}${f.v}`.replace('had going', 'were going'); default: return f.v;
    }
  }

  /* ---------- voices ---------- */
  const VO = {
    jordan: { ack: ['noted 📝 {d}', 'wait {d}?? ok i see u', 'lol ok. {d}. filing that away', 'bet. {d}. i\'ll remember'], like: ['{v}?? ok taste', 'same honestly. {v} goes hard', 'u like {v}? respect'], dislike: ['{v} is mid anyway', 'ugh yeah {v}. valid'],
      event: ['ooh good luck w the {v} 🍀 tell me how it goes', '{v}?? u got this'], recall: ['{d}. u told me {w}. i listen 😤', 'duh. {d}. {w}'], unknown: ['u never told me ur {x} lol', 'idk?? u never said'], other: ['u told {who} that, not me. wow', 'pretty sure u told {who}, not me 👀'],
      list: ['ok so. {list}. i pay attention', 'lemme think. {list}'], none: ['nothing?? u never tell me stuff', 'bro u tell me nothing'], found: ['yeah {w} u said "{q}"', '{w}. u said "{q}". i remember stuff'], foundYou: ['{w} i said "{q}"'],
      notfound: ['i don\'t remember that tbh', 'hm. no?? when'], meet: ['bro we\'ve talked like {n} times', 'uh yes?? since forever'], pos: ['{x}? love', '{x} goes hard', '{x} is lowkey the best'], neg: ['{x}? no. mid', 'not a {x} guy ngl', '{x} is overrated fr'],
      meh: ['{x} is fine i guess', 'eh. {x}. neutral'], fav: ['{v}. obviously', 'easy. {v}'], again: ['u asked me that {w} lol.', 'déjà vu. u asked {w}.'], what: ['i said: {last}', 'lol i said {last}'], why: ['idk bc?? thats just how it is', 'bc i said so. jk. idk tbh'],
      really: ['fr fr', 'yes really lol'], yesOk: ['ok but like actually tho?', 'cool cool. u sure?'], noOk: ['wait what happened. talk to me', 'ok. im here. what\'s up'], yesOffer: ['bet', 'say less'], noOffer: ['ur loss lol', 'ok more for me'],
      yes: ['ok bet', 'nice'], no: ['oh ok', 'fair'], idk: ['same tbh', 'lol ok mysterious'], how: ['how\'d the {v} go??', 'wait how was the {v}'], good: ['LETS GO', 'told u 😤'], bad: ['ugh that sucks. next time', 'damn. u ok tho?'], answer: ['{v}? good answer', 'ok {v}. noted'] },
    mom: { ack: ['Oh? {D}. I\'ll remember that, baby.', 'Mm. {D}. Look at you, telling me things.'], like: ['{v}? I didn\'t know that. I love learning things about you.'], dislike: ['Noted. No {v} in this house, then.'],
      event: ['A {v}? Tell me how it goes, okay? I want to hear.'], recall: ['{D}. You told me {w}. Moms remember.', 'Of course I know. {D}.'], unknown: ['You\'ve never told me your {x}, honey. Tell me now.'], other: ['I think you told {who} that. Not me. It\'s okay. Tell me too.'],
      list: ['Let\'s see. {list}. I listen, even when I\'m tired.'], none: ['You don\'t tell me much lately. I wish you would.'], found: ['{W} you said "{q}". I haven\'t stopped thinking about it.', 'You said "{q}", {w}.'], foundYou: ['{W} I said "{q}". I meant it.'],
      notfound: ['I don\'t remember that, baby. Tell me again?'], meet: ['Remember you? I made you. Twelve years ago.'], pos: ['{x}? I like that.', 'Oh, I love {x}.'], neg: ['Honestly? Not a fan of {x}.'], meh: ['{x} is… fine.'], fav: ['My favorite {cat}? {v}. Don\'t laugh.'],
      again: ['You asked me that {w}, baby.'], what: ['I said, {last}'], why: ['Because I love you. That\'s usually the reason.', 'Because… it\'s complicated, honey.'], really: ['Really.'], yesOk: ['Okay. You\'d tell me if you weren\'t, right?'], noOk: ['Come here. Tell me what\'s going on.'],
      yesOffer: ['Good. Sit.'], noOffer: ['Okay. The offer stands.'], yes: ['Okay.', 'Good.'], no: ['Okay, baby.'], idk: ['That\'s okay. You don\'t have to know yet.'], how: ['Hey, how did the {v} go? I thought about you.'], good: ['I knew it! I\'m so proud of you.'], bad: ['Oh, honey. One bad day doesn\'t make you.'], answer: ['{v}. Okay. I\'ll remember that.'] },
    lily: { ack: ['ok!! {d}', 'i\'m gonna remember that forever. {d}'], like: ['I LIKE {v} TOO', '{v}!!!'], dislike: ['ew {v}', 'me too i hate {v}'], event: ['good luck on your {v}!! sheldon says good luck'],
      recall: ['{d}! you told me {w}!', 'i know! {d}!'], unknown: ['you never told me!!', 'i don\'t know!! tell me'], other: ['you told {who} and NOT me??'], list: ['{list}! i remember EVERYTHING'], none: ['you never tell me anything 😤'],
      found: ['you said "{q}" {w}!'], foundYou: ['i said "{q}"!'], notfound: ['i don\'t remember'], meet: ['you\'re my BROTHER. obviously.'], pos: ['{x} is the BEST', 'i love {x}'], neg: ['{x} is yucky'], meh: ['{x} is ok'], fav: ['{v}!! and sheldon'],
      again: ['you already asked me!'], what: ['i SAID {last}'], why: ['because!!', 'because sheldon said'], really: ['REALLY'], yesOk: ['ok good'], noOk: ['do you want a hug'], yesOffer: ['YAY'], noOffer: ['aww'], yes: ['ok!!'], no: ['aww ok'], idk: ['me neither'],
      how: ['how was your {v}??'], good: ['YAYYY'], bad: ['aww. sheldon says it\'s ok'], answer: ['{v}! ok!'] },
    grandma: { ack: ['Oh, sweet pea. {D}. I\'m writing it on the calendar.', '{D}? Well, I never knew. Tell me more.'], like: ['{v}! Your grandpa loved {v} too.'], dislike: ['Well, we won\'t have any {v} when you visit.'], event: ['A {v}! Call me after and tell me all about it.'],
      recall: ['Of course, honey. {D}. You told me {w}.'], unknown: ['You never told your grandmother your {x}. Shame on you. Tell me now.'], other: ['I think you told {who}, sweet pea, not me. That\'s all right.'], list: ['Let me see. {list}. I keep it all right here.'],
      none: ['You don\'t tell your grandma much, mijo.'], found: ['{W} you told me "{q}". Grandmas remember.'], foundYou: ['{W} I told you "{q}". Still true.'], notfound: ['My memory\'s not what it was, honey. Remind me?'], meet: ['Remember you? I changed your diapers.'],
      pos: ['Oh, I love {x}.'], neg: ['{x}? Not for me, honey.'], meh: ['{x}. It\'s all right.'], fav: ['My favorite {cat}? {v}. Always has been.'], again: ['You asked me that {w}, sweet pea.'], what: ['I said, {last}'], why: ['Because that\'s how it is, honey.'], really: ['Really and truly.'],
      yesOk: ['Good. But you call me if that changes.'], noOk: ['Oh, honey. Tell your grandmother.'], yesOffer: ['Good.'], noOffer: ['Well, it\'ll be here.'], yes: ['Good.'], no: ['All right, honey.'], idk: ['That\'s all right.'], how: ['How did your {v} go, sweet pea?'],
      good: ['I knew it! I\'m telling everyone at church.'], bad: ['Oh, well. Tomorrow\'s another day, mijo.'], answer: ['{v}. I\'ll remember.'] },
    okafor: { ack: ['Thank you for telling me. {D}. I\'ll hold onto that.', '{D}. That tells me something about you.'], like: ['{v}. What do you like about it?'], dislike: ['{v}, huh. What is it about {v}?'], event: ['A {v}. How are you feeling about it?'],
      recall: ['{D}. You mentioned it {w}.'], unknown: ['I don\'t think you\'ve told me your {x}. I\'d like to know.'], other: ['I don\'t think that was me. Maybe you told {who}?'], list: ['Here\'s what I know: {list}.'], none: ['Not much yet. That\'s okay. We have time.'],
      found: ['{W}, you said "{q}". I wrote it down.'], foundYou: ['{W} I said "{q}". I still mean it.'], notfound: ['I don\'t have that. Would you tell me again?'], meet: ['Of course. We\'ve talked {n} times now.'], pos: ['I do like {x}. What about you?'], neg: ['{x} isn\'t my favorite, honestly.'],
      meh: ['I don\'t feel strongly about {x}. Do you?'], fav: ['My favorite {cat}? {v}. Now you.'], again: ['You asked me that {w}.'], what: ['I said: {last}'], why: ['Good question. What do you think?', 'Because I think it matters.'], really: ['Really.'],
      yesOk: ['Okay. I\'m going to gently check again later.'], noOk: ['Thank you for being honest. What\'s going on?'], yesOffer: ['Good.'], noOffer: ['That\'s fine. It\'s here.'], yes: ['Okay.'], no: ['Okay.'], idk: ['Not knowing is allowed.'], how: ['How did the {v} go?'],
      good: ['That\'s wonderful. How does it feel?'], bad: ['That\'s hard. What would help?'], answer: ['{v}. Thank you.'] },
    rick: { ack: ['...Okay. {D}. Why are you telling me.', 'Great. {D}. Fascinating.'], like: ['{v}. Sure.'], dislike: ['Tough.'], event: ['A {v}. Don\'t make it my problem.'], recall: ['{D}. I\'m not deaf.'], unknown: ['How would I know. You never said.'],
      other: ['Tell {who}. You tell {who} everything.'], list: ['{list}. Happy?'], none: ['You don\'t talk to me. Fine by me.'], found: ['{W} you said "{q}". I remember stuff.'], foundYou: ['I said "{q}". So?'], notfound: ['Don\'t remember. Don\'t care.'], meet: ['Funny.'],
      pos: ['{x}\'s alright.'], neg: ['{x}? Garbage.'], meh: ['Don\'t care about {x}.'], fav: ['{v}. Why.'], again: ['You already asked me that. {W}.'], what: ['I said {last}'], why: ['Because.', 'Because I said so.'], really: ['Yeah. Really.'], yesOk: ['Good.'], noOk: ['...What.'],
      yesOffer: ['Then get it yourself.'], noOffer: ['Whatever.'], yes: ['Good.'], no: ['Fine.'], idk: ['Figures.'], how: ['That thing. The {v}. How\'d it go.'], good: ['Huh. Good.'], bad: ['Yeah, well.'], answer: ['{v}. Okay.'] },
  };
  const DEF = { ack: ['{D}. Good to know.', 'Oh? {D}.'], like: ['{v}? Nice.'], dislike: ['{v}, huh. Fair.'], event: ['A {v}. Good luck.'], recall: ['{D}. You told me {w}.'], unknown: ['You never told me your {x}.'], other: ['I think you told {who}, not me.'],
    list: ['{list}.'], none: ['You haven\'t told me much.'], found: ['{W} you said "{q}".'], foundYou: ['{W} I said "{q}".'], notfound: ['I don\'t remember that.'], meet: ['Sure. We\'ve talked before.'], pos: ['I like {x}.'], neg: ['Not a fan of {x}.'], meh: ['{x}? Eh. Can\'t complain.', 'No strong feelings about {x}.'],
    fav: ['{v}.'], again: ['You asked me that {w}.'], what: ['I said, {last}'], why: ['Just because.'], really: ['Really.'], yesOk: ['Okay. Good.'], noOk: ['What\'s wrong?'], yesOffer: ['Okay.'], noOffer: ['All right.'], yes: ['Okay.'], no: ['All right.'], idk: ['That\'s okay.'],
    how: ['How did the {v} go?'], good: ['That\'s great.'], bad: ['Sorry, kid.'], answer: ['{v}. Okay.'] };
  const FLAVOR = { patel: { ack: ['Oh, how lovely. {D}. Newton, did you hear?'], recall: ['{D}, dear. You told me {w}.'], fav: ['My favorite {cat}? {v}, beta.'] }, wren: { ack: ['{D}. Cool. Hold onto stuff like that out here.'], pos: ['{x}\'s good.'], neg: ['{x}? Nah.'] },
    dolores: { ack: ['{D}? Well, how about that, hon.'], fav: ['{v}, hon. Every time.'] }, tyler: { ack: ['Nobody asked. ...{D}. Whatever.'], pos: ['...{x} is fine. Shut up.'], neg: ['{x} is for losers.'], unknown: ['Why would I know that.'] } };
  const voice = (id) => Object.assign({}, DEF, FLAVOR[id] || {}, VO[id] || {});
  const say = (id, key, o, c) => { const arr = voice(id)[key] || DEF[key]; const s = fill(pick(c, key, arr), o); return s; };

  /* ---------- their own tastes (stable) ---------- */
  const FAVS = {
    jordan: { color: 'blue. like skyforge blue', food: 'takis. or pizza. takis pizza', movie: 'the skate one w the dog', game: 'skyforge obviously', song: 'the one from the skate video', animal: 'raccoons. trash kings', subject: 'lunch', season: 'summer', place: 'the bowl' },
    mom: { color: 'yellow', food: 'your grandma\'s enchiladas', movie: 'The Princess Bride', song: 'anything from 1998', animal: 'otters', season: 'fall', place: 'the lake, before you were born', subject: 'biology. Hence the scrubs.' },
    lily: { color: 'PINK and green', food: 'strawberries', movie: 'the turtle one', animal: 'TURTLES', game: 'restaurant', song: 'the alphabet one', season: 'halloween', place: 'your room' },
    grandma: { color: 'lavender', food: 'my own soup, if I\'m honest', movie: 'Casablanca', song: 'Moon River', animal: 'cardinals', season: 'spring', place: 'my porch', book: 'the one I\'m reading. They\'re all good.' },
    okafor: { color: 'green', food: 'jollof rice. My mother\'s.', book: 'anything by Toni Morrison', movie: 'Spirited Away', song: 'something with a good bass line', season: 'the first cold week of fall', subject: 'art, secretly' },
    rick: { color: 'black', food: 'steak', movie: 'the old Westerns', song: 'the radio', team: 'the Bears. God help me.', season: 'none', place: 'the plant, back when it was open' },
    patel: { color: 'marigold', food: 'my samosas. Everyone else\'s are wrong.', animal: 'Newton, obviously', movie: 'old Bollywood', season: 'monsoon', place: 'my garden' },
    wren: { color: 'green, like trees', food: 'anything hot', place: 'the library, when it\'s raining', song: 'the one stuck in my head' },
    dolores: { food: 'the cherry pie, hon', color: 'red', song: 'Patsy Cline' },
  };
  const OPS = {
    jordan: { rick: ['ngl rick kinda scares me', -1], tyler: ['tyler is a menace', -1], school: ['school is a prison w lunch', -1], mom: ['ur mom\'s nice. she gave me a juice box once', 1], lily: ['lily is hilarious', 1], okafor: ['ms okafor is chill actually', 1], math: ['math is evil', -1], pizza: ['pizza is life', 1], skyforge: ['SKYFORGE IS LIFE', 1] },
    mom: { rick: ['Rick… is going through a lot. I\'m trying.', 0], jordan: ['I like Jordan. He\'s good for you.', 1], school: ['School matters, baby. I know it\'s hard.', 0], grandma: ['Your grandma is… a lot. I love her.', 1], okafor: ['She called me. She seems to care about you.', 1], work: ['Work is work.', 0] },
    lily: { rick: ['rick is loud', -1], sheldon: ['SHELDON IS THE BEST TURTLE', 1], mom: ['mommy is the best', 1], jordan: ['jordan does the funny voice', 1], school: ['i like recess', 1] },
    grandma: { rick: ['I\'ll keep my opinions about that man to myself. For now.', -1], mom: ['Your mother works too hard. She always has.', 1], school: ['School is your job, mijo. But you\'re more than a report card.', 0] },
    okafor: { rick: ['I think what matters is how you feel around him.', 0], school: ['School can be a lot. What part is hardest?', 0], tyler: ['I think Tyler is carrying some things too. That doesn\'t make it okay.', 0] },
    rick: { school: ['School\'s a joke. Go anyway.', -1], jordan: ['That kid talks too much.', -1], mom: ['Your mom… Don\'t.', 0], skyforge: ['Waste of electricity.', -1], work: ['Don\'t talk to me about work.', -1] },
  };
  const BIAS = { jordan: 1, lily: 1.5, grandma: 1, patel: 1, mom: 0.5, okafor: 0, rick: -1.2, tyler: -1, wren: 0, dolores: 0.5 };
  function opinion(id, x) {
    const k = x.replace(/^(the|a|an|your|my) /, '').trim(), P = NP(id);
    const canon = (N.PEOPLE || []).find(([, re]) => re.test(k)); const key = canon ? canon[0] : k;
    const o = (OPS[id] || {})[key]; if (o) return { line: o[0], s: o[1] };
    if (P.ops[key] == null) { const b = BIAS[id] || 0; const r = (hash(id + ':' + key) % 100) / 100 * 3 - 1.5 + b * 0.6; P.ops[key] = r > 0.45 ? 1 : r < -0.45 ? -1 : 0; }
    return { s: P.ops[key], key };
  }

  /* ---------- storing ---------- */
  function learn(id, f, raw) {
    const M = MS(), G = SH.G, ex = M.facts[f.key];
    const rec = ex && ex.v === f.v ? ex : Object.assign({}, f, { d: SH.day(), t: G.t, by: ex ? ex.by : {}, raw: String(raw).slice(0, 80) });
    if (f.kind === 'event') { rec.dueDay = SH.day() + (f.due || 0); rec.asked = rec.asked || {}; }
    rec.by[id] = G.t; M.facts[f.key] = rec;
    if (f.kind === 'nick') M.nick = f.v;
    return rec;
  }
  const known = (id, key) => { const f = MS().facts[key]; return f && f.by[id] != null ? f : null; };
  const knownBy = (key) => { const f = MS().facts[key]; return f ? Object.keys(f.by) : []; };
  const listOf = (id, kinds) => Object.values(MS().facts).filter((f) => f.by[id] != null && (!kinds || kinds.includes(f.kind))).sort((a, b) => b.by[id] - a.by[id]);
  const joinL = (a) => (a.length <= 1 ? a.join('') : a.slice(0, -1).join(', ') + ' and ' + a[a.length - 1]);

  /* ---------- search what was said (transcripts + phone threads) ---------- */
  function lines(id) {
    const G = SH.G, out = [];
    (G.convos && G.convos[id] || []).forEach((cv) => cv.lines.forEach(([who, text, t]) => out.push({ who: who === 'me' ? 'me' : who === 'narr' ? 'narr' : 'you', text, t })));
    const th = G.threads && G.threads[id]; if (th) th.forEach((m) => { const who = m.from === 'me' ? 'me' : m.from === id ? 'you' : null; if (who && m.text) out.push({ who, text: m.text, t: m.t || 0 }); });
    return out.filter((l) => l.who !== 'narr');
  }
  const STOP = new Set('the a an and or but i you me my your it is was to of in on at that this what did say said tell told about when how why do does just like so um uh hey yo remember'.split(' '));
  function search(id, q, who, dayAgo) {
    const words = N.clean(q || '').split(' ').filter((w) => w.length > 2 && !STOP.has(w));
    let L = lines(id).filter((l) => (who === 'both' || l.who === who) && l.t < SH.G.t - 1);
    if (dayAgo != null) L = L.filter((l) => SH.day() - SH.day(l.t) === dayAgo);
    if (!words.length) return L.filter((l) => l.text.length > 8).pop() || null;
    let best = null, bs = 0;
    L.forEach((l) => { const t = N.normalize(l.text); let s = 0; words.forEach((w) => { if (t.includes(w)) s += 1; else if (t.includes(w.slice(0, 4))) s += 0.5; }); if (s > bs || (s === bs && s > 0)) { bs = s; best = l; } });
    return bs >= Math.min(1, words.length * 0.5) ? best : null;
  }
  const qt = (s, n = 70) => { s = String(s).replace(/\s+/g, ' ').trim(); return s.length > n ? s.slice(0, n - 1) + '…' : s; };

  /* ---------- answering memory questions ---------- */
  function answerMem(id, mq, c) {
    const M = MS(), P = NP(id);
    if (mq.kind === 'fact') {
      const f = known(id, mq.key); if (f) return say(id, 'recall', { d: describe(f), D: cap(describe(f)), w: when(f.by[id]), W: cap(when(f.by[id])) }, c);
      const others = knownBy(mq.key).filter((x) => x !== id && x !== 'pip'); if (others.length) return say(id, 'other', { who: nm(others[0]) }, c);
      if (mq.key === 'nick') return say(id, 'recall', { d: `you're ${SH.G.name}`, D: `You're ${SH.G.name}`, w: 'the day we met', W: 'The day we met' }, c);
      return say(id, 'unknown', { x: mq.desc }, c);
    }
    const lst = (kinds) => listOf(id, kinds).slice(0, 5).map(describe);
    if (mq.kind === 'favs') { const l = lst(['fav']); return l.length ? say(id, 'list', { list: joinL(l) }, c) : say(id, 'unknown', { x: 'favorites' }, c); }
    if (mq.kind === 'likes') { const l = lst(['like', 'fav']); return l.length ? say(id, 'list', { list: joinL(l) }, c) : say(id, 'none', {}, c); }
    if (mq.kind === 'dislikes') { const l = lst(['dislike']); return l.length ? say(id, 'list', { list: joinL(l) }, c) : say(id, 'none', {}, c); }
    if (mq.kind === 'fears') { const l = lst(['fear']); return l.length ? say(id, 'list', { list: joinL(l) }, c) : say(id, 'none', {}, c); }
    if (mq.kind === 'about') {
      const l = lst(null); const tops = (SH.Mem && SH.Mem.summary ? SH.Mem.summary(id) : []).filter((x) => x.src !== 'fact').slice(0, 3).map((x) => x.text);
      const all = l.concat(tops.filter((t) => !l.includes(t))).slice(0, 6);
      return all.length ? say(id, 'list', { list: joinL(all) }, c) : say(id, 'none', {}, c);
    }
    if (mq.kind === 'meet') return say(id, 'meet', { n: Math.max(2, P.n), first: when(P.met) }, c);
    if (mq.kind === 'last') { const l = lines(id).filter((x) => x.who === 'me' && x.t < SH.G.t - 1).slice(-2)[0]; return l ? say(id, 'found', { q: qt(l.text), w: when(l.t), W: cap(when(l.t)) }, c) : say(id, 'notfound', {}, c); }
    if (mq.kind === 'search') {
      const hit = search(id, mq.q, mq.who === 'you' ? 'you' : mq.who === 'both' ? 'both' : 'me', mq.when);
      if (hit) return say(id, hit.who === 'you' ? 'foundYou' : 'found', { q: qt(hit.text), w: when(hit.t), W: cap(when(hit.t)) }, c);
      const f = Object.values(M.facts).find((x) => x.by[id] != null && mq.q && (x.v.includes(mq.q) || mq.q.includes(x.v.split(' ')[0])));
      if (f) return say(id, 'recall', { d: describe(f), D: cap(describe(f)), w: when(f.by[id]), W: cap(when(f.by[id])) }, c);
      const mem = SH.Mem && SH.Mem.all ? SH.Mem.all(id).filter((m) => mq.q && (m.text || '').includes(mq.q.split(' ')[0])).pop() : null;
      if (mem) return say(id, 'recall', { d: mem.text, D: cap(mem.text), w: when(mem.t), W: cap(when(mem.t)) }, c);
      return say(id, 'notfound', {}, c);
    }
    return null;
  }

  /* ---------- context: what kind of question did THEY just ask? ---------- */
  function qkind(s) {
    const t = s.toLowerCase();
    if (/\b(are you|you) (ok|okay|alright|all right|good|safe)\b|\beverything okay\b|\bis something wrong\b/.test(t)) return 'ok';
    if (/\bfavorite (\w+)/.test(t)) return 'fav';
    if (/\b(want|wanna|would you like|do you need|you hungry|can i get you|should i|shall i|let's|come with)\b/.test(t)) return 'offer';
    if (/^(how|what|which|who|where|when|why)\b|\b(what|which) (do|did|are|is)\b/.test(t)) return 'open';
    return 'yn';
  }

  /* ---------- the wrapper around every character ---------- */
  function wrap(id0, base) {
    return function (an, c) {
      c = c || {}; const id = SH.Mind.who ? SH.Mind.who(id0, c) : id0; const P = NP(id), G = SH.G, heavy = an.has('selfharm');
      if (c._mindTurn !== c.turn) { c._mindTurn = c.turn; }
      if (heavy) { const r = base.call(this, an, c); remember(id, c, an, r); return r; }
      // facts are always learned, whoever handles the reply
      const learned = (an.facts || []).map((f) => learn(id, f, an.raw));
      // pending how-did-it-go from the greeting
      if (P.pendingHow && c.turn <= 2 && !c.pq) { c.pq = { kind: 'how', v: P.pendingHow }; P.pendingHow = null; }
      // explicit memory questions: answered from memory
      if (an.memq) { const s = answerMem(id, an.memq, c); if (s) return out(id, c, an, { say: s, fx: { rel: 1 } }); }
      const r = base.call(this, an, c) || { say: '...', fx: {} };
      const filler = !!c._fb;
      let s = null, fx = null;
      if (filler) {
        const pq = c.pq;
        if (pq && pq.kind === 'how') { const good = an.sent > 0 || an.has('yes') || an.I.happy || an.I.proud || /\b(good|great|aced|passed|won|fine|okay)\b/.test(an.t); const bad = an.sent < 0 || /\b(bad|failed|terrible|lost|awful|bombed)\b/.test(an.t); s = say(id, bad && !good ? 'bad' : 'good', {}, c); fx = { rel: 2, mood: bad ? 0 : 2 }; }
        else if (pq && (an.has('yes') || an.has('no') || an.I.idk || an.I.agree || (an.short && pq.kind === 'open' && !an.q && !/^(what|where|when|why|how|who|can|could|do|does|did|is|are|will|would)\b/.test(an.t)))) {
          const y = an.has('yes') || an.I.agree, n = an.has('no');
          if (pq.kind === 'ok') s = say(id, y ? 'yesOk' : n ? 'noOk' : 'idk', {}, c);
          else if (pq.kind === 'offer') s = say(id, y ? 'yesOffer' : n ? 'noOffer' : 'idk', {}, c);
          else if (pq.kind === 'fav' && !y && !n && !an.I.idk) { const cat = (pq.text.match(/favorite (\w+)/) || [])[1] || 'thing'; learn(id, { kind: 'fav', key: 'fav:' + cat.replace(/s$/, ''), cat, v: N.clean(an.t) }, an.raw); s = say(id, 'answer', { v: N.clean(an.t) }, c); }
          else if (pq.kind === 'open' && !y && !n && !an.I.idk) s = say(id, 'answer', { v: N.clean(an.t) }, c);
          else s = say(id, y ? 'yes' : n ? 'no' : 'idk', {}, c);
        }
        if (!s && learned.length) { const f = learned[0]; const k = /^(like|dislike|event)$/.test(f.kind) && voice(id)[f.kind] ? f.kind : 'ack'; s = say(id, k, { d: describe(f), D: cap(describe(f)), v: f.v, cat: f.cat || '' }, c); fx = { rel: 1 }; }
        if (!s && an.opq) {
          if (an.opq.kind === 'fav') { const v = (FAVS[id] || {})[an.opq.cat] || (FAVS[id] ? Object.values(FAVS[id])[hash(an.opq.cat) % Object.values(FAVS[id]).length] : null); s = v ? say(id, 'fav', { v, cat: an.opq.cat }, c) : say(id, 'meh', { x: an.opq.cat }, c); }
          else { const o = opinion(id, an.opq.x); s = o.line || say(id, o.s > 0 ? 'pos' : o.s < 0 ? 'neg' : 'meh', { x: an.opq.x }, c); }
          fx = { rel: 1 };
        }
        if (!s && an.I.what && c.lastSay) s = say(id, 'what', { last: c.lastSay.replace(/^(i said:? )+/i, '') }, c);
        if (!s && an.I.why && c.lastSay) s = say(id, 'why', {}, c);
        if (!s && an.I.really && c.lastSay) s = say(id, 'really', {}, c);
        if (!s && an.q) { const prev = sameQ(P, an.t); if (prev) s = say(id, 'again', { w: when(prev.t), W: cap(when(prev.t)) }, c) + ' ' + prev.a; }
      }
      if (s) c._mindHit = c.turn;
      const res = s ? Object.assign({}, r, { say: s, fx: Object.assign({}, r.fx || {}, fx || {}) }) : r;
      return out(id, c, an, res, !!s || filler);
    };
  }
  function sameQ(P, t) {
    const A = new Set(t.split(' ').filter((w) => !STOP.has(w))); if (A.size < 2) return null;
    return P.qa.filter((x) => SH.day() - SH.day(x.t) <= 3).reverse().find((x) => { const B = new Set(x.q.split(' ').filter((w) => !STOP.has(w))); let i = 0; A.forEach((w) => B.has(w) && i++); return i / Math.max(A.size, B.size) >= 0.75; }) || null;
  }
  function out(id, c, an, r, storeQA) {
    const P = NP(id), nick = MS().nick;
    if (nick && known(id, 'nick') && r.say) r.say = nickify(r.say, nick);
    if (storeQA !== false && an.q && r.say) { P.qa.push({ q: an.t, a: r.say, t: SH.G.t }); if (P.qa.length > 40) P.qa.shift(); }
    remember(id, c, an, r); return r;
  }
  function remember(id, c, an, r) {
    const P = NP(id); P.n++;
    const s = r && r.say ? String(r.say) : ''; c.lastSay = s.replace(/\{\w+\}/g, '').slice(0, 160);
    c.pq = /\?\s*["”]?\s*$/.test(s) ? { kind: qkind(s), text: s } : null;
    if (an.people && an.people.length) c.focus = an.people[an.people.length - 1];
  }

  /* ---------- greetings that come from memory ---------- */
  function nickify(str, nick) { const n = SH.G.name; if (!n || n === nick) return str; return str.replace(new RegExp('\\b' + n + '\\b(?![a-z])', 'g'), nick); }
  function followUp(id) {
    const M = MS(), d = SH.day();
    const ev = Object.values(M.facts).filter((f) => f.kind === 'event' && f.by[id] != null && f.dueDay != null && d > f.dueDay && d - f.dueDay <= 4 && !(f.asked || {})[id]).pop();
    if (ev) { ev.asked = ev.asked || {}; ev.asked[id] = 1; NP(id).pendingHow = ev.v; return say(id, 'how', { v: ev.v.replace(/^going to /, '') }, null); }
    const today = Object.values(M.facts).filter((f) => f.kind === 'event' && f.by[id] != null && f.dueDay === d && !(f.luck || {})[id]).pop();
    if (today) { today.luck = today.luck || {}; today.luck[id] = 1; return { jordan: `yo isn't ur ${today.v} today?? good luck 🍀`, mom: `Isn't your ${today.v} today? You've got this, baby.`, grandma: `Today's your ${today.v}, isn't it? I lit a candle.`, okafor: `Your ${today.v} is today, right? How are you feeling?`, lily: `is it your ${today.v} today??` }[id] || null; }
    const f = listOf(id, ['like', 'fav', 'pet', 'dream', 'skill']).filter((x) => SH.day() - SH.day(x.by[id]) >= 1 && !(x.cb || {})[id])[0];
    if (f && Math.random() < 0.35) { f.cb = f.cb || {}; f.cb[id] = 1; const d2 = describe(f); return { jordan: `yo. u said ${d2}. random but i thought of u`, mom: `I keep thinking about how ${d2}. I like knowing things about you.`, grandma: `I told the ladies at church ${d2}. They were very impressed.`, lily: `i remember ${d2}!!`, okafor: `I remembered something: ${d2}.` }[id] || null; }
    return null;
  }

  /* ---------- install ---------- */
  function install() {
    Object.keys(SH.Brain).forEach((id) => { if (SKIP.includes(id) || SH.Brain[id]._mind) return; const w = wrap(id, SH.Brain[id]); w._mind = true; w._base = SH.Brain[id]; SH.Brain[id] = w; });
    if (SH.Mem) {
      const bg = SH.Mem.greeting; SH.Mem.greeting = function (npc) { let g = null; try { g = followUp(npc); } catch (e) {} const r = g || bg.apply(this, arguments); const nick = MS().nick; return r && nick && known(npc, 'nick') ? nickify(String(r), nick) : r; };
      const bs = SH.Mem.summary; SH.Mem.summary = function (npc) { const base = bs.apply(this, arguments) || []; const facts = listOf(npc, null).slice(0, 6).map((f) => ({ when: when(f.by[npc]), text: describe(f), src: 'fact' })); return facts.concat(base).slice(0, 12); };
    }
    // PIP reads everything. Of course it does.
    if (SH.PIP && SH.PIP.reply) {
      const bp = SH.PIP.reply; SH.PIP.reply = function (raw) {
        const an = N.analyze(raw);
        if (!an.has('selfharm') && an.facts && an.facts.length) { const f = learn('pip', an.facts[0], raw); return U.pick([`Noted: ${describe(f)}. Stored forever in my cold silicon heart.`, `Saving "${describe(f)}" to your permanent record. Kidding. Mostly.`, `Cool. ${cap(describe(f))}. I'll bring it up at the worst possible moment.`]); }
        if (!an.has('selfharm') && an.memq) {
          const mq = an.memq, M = MS();
          if (mq.key) { const f = M.facts[mq.key]; if (!f) return `You've never told anyone your ${mq.desc}. Not even me, and I read everything.`; const who = Object.keys(f.by).filter((x) => x !== 'pip').map(nm); return `${cap(describe(f))}. You said it ${when(f.t)}${who.length ? ' to ' + joinL(who) : ''}. I have receipts.`; }
          const all = Object.values(M.facts).sort((a, b) => b.t - a.t).slice(0, 6).map(describe); return all.length ? `Here's your file: ${joinL(all)}. I'm basically your biographer. Unpaid.` : 'You haven\'t told anyone anything about yourself. Mysterious. Or just twelve.';
        }
        return bp.apply(this, arguments);
      };
    }
  }
  SH.Mind = { install, describe, learn, known, knownBy, opinion, NP, facts: () => MS().facts };
  install();
})(window.SH);
