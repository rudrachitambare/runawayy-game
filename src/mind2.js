/* SMALL HOURS — mind 2: who-you-said-you-were memory + sharper understanding. Sits on top of mind.js / converse.js.
   MEMORY
   - Every person is their own person: each local, clerk, cop and runaway kid has separate memory (SH.Mind.who).
   - CLAIMS (G.claims[person]): your name, age, where you're from, where you're going, who you're with, where your
     parents are, your story, your school. Each person remembers what YOU told THEM, so different lies to different
     people stay straight — and a person catches it when you change your story ("You said your name was Jordan.").
     Catching you out makes strangers warier (more notice on the road).
   - Short answers to their question count: "What's your name?" → "jordan" = you told them Jordan.
   - Nobody re-asks what you already told them: the question is swapped for a line that uses it ("Jordan, right?").
   - "what's my name / how old am I / where did I say I was going" is answered from what you told THAT person.
   - Small places talk: tell one local your name and the next one in town may already know it.
   - People who actually know you know your real name ("My name is Jordan." → Mom: "Baby, your name is Sam.").
   UNDERSTANDING (wraps NLP.analyze)
   - more negation: "you're not stupid", "i never ran away", "i'm not going home" stop reading as hostile / run / home
   - "i don't feel safe" = scared; "my name is Jordan" is a name, not talk about your friend Jordan
   - numbers + money + nights ("can i pay 40", "3 nights", "a week") → an.money / an.nights / an.nums
   - he/she/they after someone was mentioned → an.ref = that person (an.people gets them too) */
(function (SH) {
  const N = SH.NLP, MI = SH.Mind; if (!N || !MI) return;
  const G = () => SH.G, cap = (s) => { s = s == null ? '' : String(s); return s ? s.charAt(0).toUpperCase() + s.slice(1) : s; };
  const pick = (a) => a[Math.floor(Math.random() * a.length)];
  /* ---------- who is this, really ---------- */
  const SHARED = /^(local|clerk|cop|officer|agent|conductor|driver|rk|rkGroup)$/;
  MI.who = function (id, c) {
    const npc = (c && c.npc) || id;
    if (!SHARED.test(npc)) return npc;
    const m = (SH.NPCS_META || {})[npc] || {}; return npc + ':' + (m.full || m.n || '?');
  };
  const isCore = (k) => !/[:]/.test(k) && !/^(rk_|host_|local|clerk|cop|dex|pip)/.test(k) && !!(SH.NPCS_META || {})[k];
  const knowsReal = (k) => isCore(k) || /^host_/.test(k);
  const stranger = (k) => /[:]/.test(k) || /^rk_/.test(k);
  /* ---------- claims: what you say about yourself ---------- */
  const NAMEBAD = /^(a|an|the|not|so|just|fine|okay|ok|good|here|there|scared|sad|sorry|tired|hungry|lost|alone|home|going|from|with|staying|visiting|new|back|done|sure|really|in|at|safe|cold|waiting|looking|leaving|running|serious|kidding|joking|bored|hurt|sick|only|still|also|gonna|trying|like|nobody|nothing|no|yes|yeah|nope|idk|what|who|why|hi|hey|hello|thanks|twelve|eleven|thirteen|ten|fourteen|fifteen)$/i;
  const NUMW = { ten: 10, eleven: 11, twelve: 12, thirteen: 13, fourteen: 14, fifteen: 15, sixteen: 16, seventeen: 17, eighteen: 18, nineteen: 19, twenty: 20 };
  const PLACE = "([a-z][a-z .'-]{1,24}?)(?=[.,!?]|$| and | but | because | with | to see| tonight| tomorrow| for )";
  N.claims = function (raw) {
    const r = String(raw || ''), t = r.toLowerCase().replace(/\bim\b/g, "i'm"), f = {};
    let m = r.match(/\b(?:my name is|my name's|name's|call me|i go by|the name's)\s+([A-Za-z][A-Za-z'-]{1,14})/i) || r.match(/\b(?:i'?m|I am)\s+([A-Z][a-z'-]{1,14})\b(?!\s*(?:years|yrs))/) || r.match(/\b(?:no,? |wait,? )+it'?s\s+([A-Z][a-z'-]{1,14})\b/);
    if (m && !NAMEBAD.test(m[1])) f.name = cap(m[1].toLowerCase());
    m = t.match(/\b(?:i'm|i am)\s+(1[0-9]|20|[5-9]|ten|eleven|twelve|thirteen|fourteen|fifteen|sixteen|seventeen|eighteen|nineteen|twenty)\b(?!\s*(?:dollars|bucks|minutes|min|miles|%))/) || t.match(/\b(1[0-9]|[5-9])\s*(?:years?|yrs?) old\b/);
    if (m) f.age = NUMW[m[1]] || +m[1];
    m = t.match(new RegExp("\\b(?:i'm from|i am from|i come from|i live in|we live in|i used to live in|i grew up in)\\s+" + PLACE)); if (m) f.from = m[1].trim();
    m = t.match(new RegExp("\\b(?:going to|heading to|on my way to|trying to get to|want to go to|traveling to|headed to|going up to|going down to)\\s+(?:see\\s+)?" + PLACE));
    if (m && !/^(be|do|sleep|bed|get|go|school|stay|eat|the bathroom|bathroom|buy|try|call|tell|pay|ask|talk|need|have|run|walk|find|make|take|look|wait|work|say|kill|die|cry|hit|hurt|leave|miss)\b/.test(m[1].trim()) && !/\bhome\b/.test(m[1])) f.going = m[1].trim().replace(/^the /, '');
    m = t.match(/\b(?:i'm|i am|we're|we are|i'm here|i'm staying|staying)\s+with\s+(my\s+[a-z]+|[a-z]+(?: and [a-z]+)?)/); if (m && !/^(you|it|that|him|her|them)$/.test(m[1])) f.with = m[1];
    m = t.match(/\bmy (mom|dad|mother|father|parents|aunt|uncle|grandma|grandpa|folks)\s+(?:is|are|'s|'re)\s+((?:in|at|out|over|parking|getting|waiting|inside|outside|coming|picking|on|just|working|back|busy|asleep)[a-z ,']{0,36}?)(?=[.!?]|$| so | but )/); if (m) f.parents = `${m[1]} ${/s$/.test(m[1]) || m[1] === 'folks' ? 'are' : 'is'} ${m[2].trim()}`;
    m = t.match(/\b(?:i'm|i am|we're)\s+(visiting (?:my )?[a-z]+(?: [a-z]+)?|homeschooled|new here|new in town|on (?:a )?(?:field|school|band|class) trip|staying at the campground|here for the summer|doing a school project|on vacation)/); if (m) f.story = m[1];
    m = t.match(/\bi go to\s+([a-z .'-]{2,30}?(?:school|academy|middle|elementary|junior high))\b/); if (m) f.school = m[1];
    return f;
  };
  const CL = (k) => { const g = G(); g.claims = g.claims || {}; return (g.claims[k] = g.claims[k] || { f: {}, asks: {}, n: 0 }); };
  const TOWN = (pid) => { const g = G(); g.townTalk = g.townTalk || {}; return (g.townTalk[pid] = g.townTalk[pid] || {}); };
  const here = () => (G().away && SH.Atlas && SH.Atlas.here ? SH.Atlas.here() : null);
  MI.claims = (k) => CL(k).f; MI.claim = (k, key) => { const f = CL(k).f[key]; return f ? f.v : key === 'name' && knowsReal(k) ? G().name : null; };
  /* ---------- understanding ---------- */
  const NEGATABLE = ['hostile', 'run', 'love', 'sad', 'scared', 'angry', 'tired', 'food', 'disclose'];
  const NEG_RE = /\b(not|never|no longer|isn't|aren't|wasn't|weren't|ain't|didn't|don't|won't|not really|never ever)\s+(?:(?:so|very|that|really|even|too|at all|a|an|going|gonna|ever|been|being)\s+){0,2}([a-z']+)/g;
  const baseA = N.analyze;
  let focus = null; // last person mentioned in the current conversation
  N.analyze = function (raw) {
    const an = baseA.apply(this, arguments), t = an.t;
    // negation (selfharm never gets dropped)
    if (NEG_RE.test(t)) { NEG_RE.lastIndex = 0; const t2 = t.replace(NEG_RE, ' '), r2 = baseA.call(this, t2); an.negated = an.negated || [];
      NEGATABLE.forEach((k) => { if (an.I[k] && !r2.I[k] && !(k === 'disclose' && /\b(hit|hurt|grab|touch)/.test(t))) { delete an.I[k]; an.negated.push(k); } });
      if (/\b(don't|do not|never|not) (feel )?safe\b/.test(t)) { an.I.scared = 1; an.I.unsafe = 1; delete an.I.safe; delete an.I.deflect; } }
    NEG_RE.lastIndex = 0;
    if (/\b(not|never|won't|ain't) (going|gonna|go) (back )?home\b|\bnever going back\b/.test(t)) an.I.refuseHome = 1;
    if (/\b(don't|do not|dont) have (any |much )?(money|cash)|\bno money\b|\bi'm broke\b|\bout of money\b/.test(t)) an.I.broke = 1;
    // claims
    an.claims = N.claims(raw);
    if (an.claims.name) { const nl = an.claims.name.toLowerCase(); delete an.I[nl]; if (an.people) an.people = an.people.filter((p) => p !== nl); if (an.facts) an.facts = an.facts.filter((f) => f.kind !== 'nick' || f.v.toLowerCase() !== nl || /call me/.test(t)); }
    if (an.claims.age) delete an.I.age;
    // memory questions about claims
    if (/\bhow old (am i|did i say i was|i said i was)\b/.test(t)) an.memq = { kind: 'claim', key: 'age' };
    else if (/\bwhere (am i from|did i say i('m| was| am) from|i said i('m| was) from)\b/.test(t)) an.memq = { kind: 'claim', key: 'from' };
    else if (/\bwhere (am i going|am i headed|did i say i was going|was i going)\b/.test(t)) an.memq = { kind: 'claim', key: 'going' };
    else if (/\b(what'?s|what is|what did i say) my name( was| is)?\b|\bdo you (know|remember) my name\b/.test(t)) an.memq = { kind: 'claim', key: 'name' };
    else if (/\bwhat (was|is) my story\b|\bwhat did i tell you about me\b/.test(t)) an.memq = { kind: 'claim', key: '*' };
    // numbers, money, nights
    const nums = (t.match(/\$?\b\d+(?:\.\d+)?\b/g) || []).map((x) => +x.replace('$', '')); an.nums = nums;
    let mm = t.match(/\$\s?(\d+)|\b(\d+)\s*(?:dollars|bucks|usd)\b|\b(?:pay|give you|offer|do|how about|what about|make it)\s+\$?(\d+)\b/); if (mm) an.money = +(mm[1] || mm[2] || mm[3]);
    mm = t.match(/\b(\d+|one|two|three|four|five|six|a couple|a few)\s+(nights?|days?)\b/); if (mm) an.nights = { one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, 'a couple': 2, 'a few': 3 }[mm[1]] || +mm[1];
    if (/\b(a|one|the|for a|whole) week\b|\bweekly\b/.test(t)) an.nights = 7; if (/\b(a|one|the|for a|whole) month\b|\bmonthly\b/.test(t)) an.nights = 30;
    // he / she / they
    if (an.people && an.people.length) focus = an.people[an.people.length - 1];
    else if (an.pron && focus) { const F = { mom: 'f', grandma: 'f', lily: 'f', okafor: 'f', patel: 'f', rick: 'm', jordan: 'm', tyler: 'm', dex: 'm' }; if (!F[focus] || F[focus] === an.pron || an.pron === 'n') { an.ref = focus; an.people = [focus]; } }
    return an;
  };
  /* ---------- the NPC's question → which claim it asks for ---------- */
  const ASKS = [['name', /\b(what'?s|what is|and) your (first |real )?name\b|\byour name\b[^.!]*\?|\bwhat do (they|people|your friends) call you\b|\bwho might you be\b|\bgot a name\b/i],
    ['age', /\bhow old are you\b|\bwhat are you,? (like )?(ten|eleven|twelve|\d+)\?|\byour age\b/i],
    ['family', /\bwhose (kid|child|boy|girl|young'?un) are you\b|\bwho are your (folks|people|parents)\b/i], ['from', /\bwhere (are you|you) from\b|\bwhere do you live\b|\bwhere('s| is) home\b|\bnot from (around )?here\b[^.!]*\?/i],
    ['going', /\bwhere (are you|you|ya) (going|headed|heading|off to)\b|\bwhere to\b[^.!]*\?|\bwhat brings you\b/i],
    ['parents', /\bwhere are your (parents|folks|mom|dad|mother|father|people)\b|\bdo(es)? your (mom|mother|dad|father|parents|folks) know\b|\bis there (a|an) (grown-?up|adult) with you\b|\bwho'?s looking after you\b/i],
    ['school', /\b(shouldn'?t you be in school|what school|which school|no school today)\b/i], ['with', /\bwho are you (with|here with|traveling with)\b|\bjust you\?|\ball by yourself\b[^.!]*\?/i]];
  const askOf = (s) => { for (const [k, re] of ASKS) if (re.test(s)) return k; return null; };
  MI.askOf = askOf;
  const ACK = {
    name: (v) => pick([`${v}, right?`, `You said ${v}, yeah?`, `${v}. I remember.`]), age: (v) => pick([`You said you're ${v}.`, `${v}, you said.`]), from: (v) => pick([`${cap(v)}, you said.`, `You said ${v}, right?`]),
    going: (v) => pick([`${cap(v)}, you said. Still the plan?`, `Still headed to ${v}?`]), parents: (v) => `You said your ${v}.`, family: (v) => /visiting|staying/.test(v) ? `${cap(v)}, you said.` : pick([`The ${cap(v)} kid, you said.`, `${cap(v)}'s kid, right?`]), school: (v) => `${cap(v)}, you said.`, with: (v) => `With ${v}, you said.`,
  };
  const STORYV = { from: (s) => /visiting|campground|vacation|summer|trip/.test(s) ? s : null };
  const knownV = (k, key) => { const F = CL(k).f; if (F[key]) return F[key].v; if (key === 'family' && F.story && /visiting|staying/.test(F.story.v)) return F.story.v; if (key === 'from' && F.story && STORYV.from(F.story.v)) return F.story.v; return null; };
  /* swap already-answered questions for a line that uses what you told them */
  MI.noReask = function (k, say) {
    if (!say || typeof say !== 'string') return say; const parts = say.match(/[^.!?]+[.!?]*["”]?\s*/g) || [say]; let ch = false;
    const out = parts.map((s) => { if (!/\?/.test(s)) return s; const key = askOf(s); if (!key) return s; const v = knownV(k, key); if (v == null) return s; ch = true; return ACK[key](v) + ' '; });
    return ch ? out.join('').replace(/\s+/g, ' ').trim() : say;
  };
  const CONTRA = {
    name: (a, b) => pick([`Wait. You told me your name was ${a}. Now it's ${b}?`, `Hold on. ${a}, you said before. Which is it?`]), age: (a, b) => `Hang on, you said you were ${a}. Now you're ${b}?`,
    from: (a, b) => `I thought you said you were from ${a}.`, going: (a, b) => `You said you were going to ${a} before.`, story: (a, b) => `Before, you said you were ${a}.`, parents: (a) => `Earlier you said your ${a}.`,
  };
  const NEWR = {
    name: (v) => pick([`${v}. Okay.`, `${v}, huh.`, `Nice to meet you, ${v}.`]), age: (v) => pick([`${v}. Huh.`, `${v}? You look about that.`, `Only ${v}.`]),
    going: (v) => pick([`${cap(v)}? That's a ways.`, `${cap(v)}, huh.`, `${cap(v)}. Long trip for somebody your size.`]), from: (v) => pick([`${cap(v)}. Never been.`, `${cap(v)}, huh.`]),
    story: (v) => pick([`${cap(v)}. Okay.`, `Oh, ${v}.`]), with: (v) => `With ${v}. Okay.`, parents: () => pick(['Mm-hm.', 'Okay.']),
  };
  const REAL = { mom: (n) => `Baby, your name is ${n}. I picked it. Are you okay?`, grandma: (n) => `Your name is ${n}, sweet pea. I was there the day you got it.`, lily: (n) => `no it's NOT. it's ${n}. you're being weird.`, jordan: (n) => `lmao ok. ur ${n}. u good??`, rick: () => 'Real funny.', okafor: (n) => `If you'd like me to call you something else, I will. But I know you as ${n}. Is something going on?` };
  function recallClaim(k, key) {
    const F = CL(k).f, nm = knowsReal(k) ? G().name : F.name ? F.name.v : null;
    if (key === 'name') return nm ? (F.name && !knowsReal(k) ? pick([`${nm}. That's what you told me.`, `You said ${nm}.`]) : `...${nm}. Are you feeling okay?`) : pick(['You never told me.', "You didn't say. I noticed."]);
    if (key !== '*') { const v = F[key] && F[key].v; return v != null ? { age: `You said ${v}.`, from: `${cap(v)}. That's what you said.`, going: `${cap(v)}, you said.` }[key] : pick(["You never said.", "You didn't tell me that."]); }
    const b = []; if (nm && !knowsReal(k)) b.push(`you're ${nm}`); if (F.age) b.push(`you're ${F.age.v}`); if (F.story) b.push(`you're ${F.story.v}`); if (F.from) b.push(`you're from ${F.from.v}`); if (F.going) b.push(`you're headed to ${F.going.v}`); if (F.with) b.push(`you're with ${F.with.v}`); if (F.parents) b.push(`your ${F.parents.v}`);
    return b.length ? `You told me ${b.join(', ')}.` : "You haven't told me much about you. I noticed.";
  }
  /* ---------- claims layer around every brain ---------- */
  const raw = SH.Brain, cache = new Map();
  function layer(id, fn) {
    if (cache.has(fn)) return cache.get(fn);
    const w = function (an, c) {
      if (!an || !an.claims || (c && c._cl)) return fn.apply(this, arguments);
      c = c || {}; c._cl = true;
      try {
        const k = MI.who(id, c), rec = CL(k), g = G(), now = g.t; rec.n++;
        if (an.has && an.has('selfharm')) return fn.call(this, an, c);
        // short answer to their last question
        const la = rec.lastAsk && now - rec.lastAskT < 12 * 60 ? rec.lastAsk : null; rec.lastAsk = null;
        if (la && an.len && an.len <= 5 && !Object.keys(an.claims).length && !an.q && !(an.has('no') || an.has('deflect') || an.I.idk || an.I.hostile)) {
          const ans = String(an.raw).replace(/^(it'?s|i'?m|um+|uh+|well|my name is|i am|like)\s+/i, '').replace(/[.!]+$/, '').trim(), fx = {};
          if (la === 'name' && /^[A-Za-z][A-Za-z'-]{1,14}$/.test(ans) && !NAMEBAD.test(ans)) fx.name = cap(ans.toLowerCase());
          else if (la === 'age' && /^(1[0-9]|[5-9]|ten|eleven|twelve|thirteen|fourteen|fifteen)$/i.test(ans)) fx.age = NUMW[ans.toLowerCase()] || +ans;
          else if (['from', 'going', 'school', 'with', 'family'].includes(la) && ans.length > 1 && !/^(yes|yeah|no|nope|idk|nowhere|none|why)\b/i.test(ans)) fx[la] = ans.toLowerCase().replace(/^(to|from|with) /, '');
          if (Object.keys(fx).length) { an.claims = fx; if (fx.name) an.I.name = 1; }
        }
        // contradictions + storing
        let contra = null;
        Object.entries(an.claims).forEach(([key, v]) => {
          const old = rec.f[key], lv = String(v).toLowerCase();
          if (key === 'name' && knowsReal(k) && lv !== String(g.name).toLowerCase()) { if (!old) contra = REAL[k] ? REAL[k](g.name) : `...Your name is ${g.name}. I know you.`; rec.f.name = { v, t: now, fake: true }; return; }
          if (old && CONTRA[key] && String(old.v).toLowerCase() !== lv && !an.I.correction && !/^(i mean|actually|sorry,? i meant|wait,? no)\b/.test(an.t)) {
            contra = contra || CONTRA[key](old.v, v); if (c.mem) c.mem.sus = (c.mem.sus || 0) + 15;
            if (stranger(k)) { g.awayNotice = (g.awayNotice || 0) + 4; rec.caught = (rec.caught || 0) + 1; }
          }
          rec.f[key] = { v, t: now, n: old && String(old.v).toLowerCase() === lv ? (old.n || 1) + 1 : 1 };
          const p = here(); if (p && (key === 'name' || key === 'story') && /village|small|town/.test(p.tier || '') && stranger(k)) TOWN(p.id)[key] = { v, by: k, t: now };
        });
        if (an.memq && an.memq.kind === 'claim') return { say: (contra ? contra + ' ' : '') + recallClaim(k, an.memq.key), fx: {} };
        if (an.memq && an.memq.key === 'nick' && !knowsReal(k)) return { say: recallClaim(k, 'name'), fx: {} };
        const r = fn.call(this, an, c) || { say: '...', fx: {} };
        if (typeof r.say === 'string') {
          r.say = MI.noReask(k, r.say);
          // strangers react to something new you told them (if their brain didn't)
          if (!contra && stranger(k) && !r.end) { const nk = Object.keys(an.claims).find((x) => NEWR[x] && rec.f[x] && rec.f[x].n === 1 && !String(r.say).toLowerCase().includes(String(an.claims[x]).toLowerCase().split(' ')[0])); if (nk) r.say = NEWR[nk](an.claims[nk]) + ' ' + r.say; }
          if (contra && !r.say.includes(contra)) r.say = contra + ' ' + r.say;
          if (stranger(k)) r.say = r.say.charAt(0).toUpperCase() + r.say.slice(1);
          const q = r.say.match(/[^.!?]*\?/g); const key = q && askOf(q[q.length - 1]); if (key) { rec.lastAsk = key; rec.lastAskT = now; rec.asks[key] = now; }
        }
        return r;
      } finally { c._cl = false; }
    };
    Object.keys(fn).forEach((x) => { w[x] = fn[x]; });
    cache.set(fn, w); return w;
  }
  SH.Brain = new Proxy(raw, { get(t, key) { const f = t[key]; return typeof f === 'function' && typeof key === 'string' ? layer(key, f) : f; } });
  /* ---------- openers: names remembered; small towns talk ---------- */
  const T = SH.Talk, bOpen = T && T.open;
  if (bOpen) T.open = function (npc, opts) {
    opts = opts || {}; arguments[1] = opts;
    try {
      const k = MI.who(npc, { npc }), rec = CL(k), p = here();
      if (stranger(k) && typeof opts.first === 'string') {
        const nm = rec.f.name && rec.f.name.v;
        if (nm && rec.n > 0 && !opts.first.includes(nm)) opts.first = pick([`${nm}! `, `Hey, ${nm}. `, `${nm}, right? `]) + opts.first.replace(/^(well,? )?(hey|hi|hello)( there)?[.!,]?\s*/i, '');
        else if (!rec.n && p && /village|small|town/.test(p.tier || '')) { const tw = TOWN(p.id); if (tw.name && tw.name.by !== k) { const who = String(tw.name.by).split(':')[1]; const wn = who ? who.split(/[ ,]/)[0] : 'Someone'; opts.first = `You must be ${tw.name.v}. ${wn} mentioned you.` + (tw.story ? ` ${cap(tw.story.v)}, right?` : '') + ' ' + opts.first.replace(/\b(what'?s your name|who are you)[^?]*\?\s*/i, '').replace(/\s*I don'?t think I know you\.?/i, ''); rec.f.name = { v: tw.name.v, t: G().t, heard: wn }; if (tw.story && !rec.f.story) rec.f.story = { v: tw.story.v, t: G().t, heard: wn }; } }
      }
      if (typeof opts.first === 'string') { opts.first = MI.noReask(k, opts.first); const key = askOf(opts.first); if (key) { rec.lastAsk = key; rec.lastAskT = G().t; } }
    } catch (e) { console.warn('mind2 open', e); }
    focus = null;
    return bOpen.apply(this, arguments);
  };
  /* texts: re-asks swapped, questions remembered */
  const P = SH.Phone, bPush = P.push;
  P.push = function (id, from, text) { try { if (from === id && typeof text === 'string' && (SH.NPCS_META || {})[id]) { arguments[2] = MI.noReask(id, text); const key = askOf(arguments[2]); if (key) { const rec = CL(id); rec.lastAsk = key; rec.lastAskT = G().t; } } } catch (e) {} return bPush.apply(this, arguments); };
  /* what people remember about you (contact view / "what do you know about me") includes your claims */
  if (SH.Mem && SH.Mem.summary) { const bs = SH.Mem.summary; SH.Mem.summary = function (npc) { const r = bs.apply(this, arguments) || []; try { const F = CL(npc).f, W = SH.Mem.when; ['name', 'age', 'story', 'from', 'going', 'with', 'parents'].forEach((key) => { const f = F[key]; if (!f || (key === 'name' && knowsReal(npc) && !f.fake)) return; r.unshift({ when: W(f.t), text: f.heard ? `${f.heard} says your ${key === 'name' ? 'name is' : 'story is'} ${f.v}` : key === 'name' ? `you said your name is ${f.v}` : key === 'age' ? `you said you're ${f.v}` : key === 'story' ? `you said you're ${f.v}` : key === 'from' ? `you said you're from ${f.v}` : key === 'going' ? `you said you're going to ${f.v}` : key === 'with' ? `you said you're with ${f.v}` : `you said your ${f.v}`, src: f.heard ? 'heard' : 'claim' }); }); } catch (e) {} return r.slice(0, 10); }; }
})(window.SH);
