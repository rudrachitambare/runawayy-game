/* SMALL HOURS — conversation context layer (turn 34).
   Sits on top of every brain (Harlow people, phone calls, townies). It keeps a short transcript per conversation
   and fixes the things that made talking feel like a vending machine:
   - "what did I just ask you?" / "what did you say?"  → they actually remember the last lines
   - "what about tomorrow?" / "and tonight?"          → carries the last request forward ("can I stay tonight" → "…tomorrow")
   - "why not?" / "how come?"                         → a reason tied to what they just refused, in their own voice
   - a few requests the core adults used to answer with therapy-speak (can I stay with you / do you have food / what
     should I do) get real, in-character answers.
   Replies never repeat word-for-word what they said the turn before. */
(function (SH) {
  const T = SH.Talk, NLP = SH.NLP; if (!T || !NLP || !SH.Brain) return;
  const pick = (a) => a[Math.floor(Math.random() * a.length)];
  const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);
  const TEEN = /^(jordan|lily|tyler|dex|wren|nia|marco|priya|eli|theo|hazel|rk)/;
  const teen = (id) => TEEN.test(id);
  const hist = (c) => (c.mem._h = c.mem._h || []); // [{who:'me'|'npc', t, in}]
  const lastOf = (c, who, skip = 0) => { const h = hist(c); for (let i = h.length - 1, k = 0; i >= 0; i--) if (h[i].who === who && !h[i].meta) { if (k++ === skip) return h[i]; } return null; };
  const gist = (s) => { const p = s.split(/(?<=[.!?])\s+/); let o = p[0]; for (let i = 1; i < p.length && o.length < 40; i++) o += ' ' + p[i]; return o.length > 140 ? o.slice(0, 137) + '…' : o; };

  // "can i stay at yours tonight" → "if you could stay at mine tonight"
  function swap(s) {
    const M = { i: 'you', "i'm": "you're", 'im': "you're", me: 'me', my: 'your', mine: 'yours', myself: 'yourself', you: 'me', your: 'my', yours: 'mine', "you're": "I'm", u: 'me', ur: 'my', am: 'are', "i've": "you've", "i'll": "you'll" };
    return s.replace(/[?!.]+$/, '').split(/\s+/).map((w, i, a) => { const lw = w.toLowerCase(), pv = i > 0 ? a[i - 1].toLowerCase() : '';
      if (lw === 'me') return 'you';
      if (lw === 'you' || lw === 'u') return i === 0 || /^(do|did|can|could|will|would|are|were|if|and|that|so|when|because|bc)$/.test(pv) ? 'I' : 'me';
      return M[lw] != null ? M[lw] : w; }).join(' ');
  }
  function asked(text) {
    const t = text.trim().replace(/[?!.]+$/, '');
    let m;
    if ((m = t.match(/^(can|could|may) i (.+)$/i))) return `if you could ${swap(m[2])}`;
    if ((m = t.match(/^(can|could|would|will) you (.+)$/i))) return `if I could ${swap(m[2])}`;
    if ((m = t.match(/^(do|does|did|is|are|was|were|have|has) (.+)$/i))) return `if ${swap(m[2])}`;
    if ((m = t.match(/^(what|where|when|why|how|who|which)( \w+)? (are|am|do|can|could|will|would|should) (you|u|i)\b(.*)$/i))) {
      const subj = /^(you|u)$/i.test(m[4]) ? 'I' : 'you', aux = m[3].toLowerCase(), v = aux === 'do' ? '' : aux === 'are' || aux === 'am' ? (subj === 'I' ? ' am' : ' are') : ' ' + aux;
      return `${m[1].toLowerCase()}${m[2] || ''} ${subj}${v}${swap(m[5] || '') ? ' ' + swap(m[5]).trim() : ''}`.replace(/\s+/g, ' ').trim();
    }
    if ((m = t.match(/^(what|where|when|why|how|who|which)\b(.*)$/i))) return `"${t}"`;
    return `"${t}"`;
  }

  const TIME = /\b(tonight|today|tomorrow|tmrw|this weekend|next week|later|in the morning|after school|right now)\b/;
  const STRONG = ['stay', 'food', 'money', 'meet', 'help', 'run', 'home', 'ride'];
  /* rewrite elliptical follow-ups using the previous thing you said */
  function carry(c, text) {
    const t = text.toLowerCase().trim().replace(/[?!.]+$/, '');
    let prev = null; for (let k = 0; k < 3; k++) { const x = lastOf(c, 'me', k); if (!x) break; if ((x.I || []).length || TIME.test(x.t)) { prev = x; break; } } if (!prev) return null;
    const m = t.match(/^(and |what about |how about |ok |okay |but )?(tonight|today|tomorrow|tmrw|this weekend|next week|later|in the morning|after school|right now)$/);
    if (m) {
      const strong = (prev.I || []).length > 0;
      return TIME.test(prev.t) ? prev.t.replace(TIME, m[2]) : `${prev.t.replace(/[?!.]+$/, '')} ${m[2]}`;
    }
    return null;
  }

  /* reasons, when they said no and you ask why */
  const WHY = {
    jordan: { stay: ['bc my mom literally checks the garage now. she has like a sixth sense. and she said if she finds u she HAS to call ur mom', 'ok real talk my mom would call ur mom in like 4 seconds. it\'s not that i don\'t want u here'], def: ['idk it\'s just a lot rn', 'bc... idk. i\'m scared i\'ll get u caught'] },
    lily: { def: ['because!!', 'because mom said. and because i said.'] },
    okafor: { stay: ['Because I\'m an adult you know from school, and there are rules about that — good ones, even when they feel like a wall. They exist to protect kids. What I can do is help you find a place tonight that\'s actually set up for this.'], def: ['Fair question. I\'d rather tell you the truth than something easy: I have to keep you safe, and sometimes that means I can\'t do the thing you asked.'] },
    mom: { def: ['Because I\'m your mother and I need to know you\'re safe. That\'s the whole reason. That\'s every reason.'] },
    grandma: { def: ['Because I love you, mijo. That\'s the only reason I ever have for anything.'] },
    rick: { def: ['Because I said so.', 'Don\'t start.'] },
    _adult: { def: ['Because it isn\'t safe, kid. Not for you, not for me.', 'I just can\'t. I\'m sorry.'] },
    _teen: { def: ['idk it\'s complicated', 'bc it just is ok'] },
  };
  const REFUSE = /\b(no|nope|can'?t|cannot|won'?t|not (going to|gonna)|shouldn'?t|i'?m sorry|not allowed|not a good idea|illegal|rules)\b/i;

  /* real answers for requests the core adults used to deflect */
  const ASK = {
    okafor: {
      stay: (c) => { c.mem._refused = 'stay'; return 'I can\'t have you stay with me. I wish the answer were different. But I can help you find somewhere safe tonight — there\'s a youth line that finds beds for kids, and they don\'t call anyone without talking to you first. Want me to dial it with you?'; },
      food: (c) => { if (c.mem._fed) return 'That was my last granola bar, I\'m afraid. But the cafeteria does breakfast free before first bell — nobody asks why you\'re there.'; c.mem._fed = 1; return { say: 'Here. *slides open a drawer full of granola bars* I keep these for exactly this. Take two. Take three. No, I don\'t want to hear about it.', fx: { full: 14 } }; },
      advice: () => 'Honestly? The next right thing is somewhere warm tonight, and one adult who knows where you are. That could be your grandma. It could be me. It could be the youth line. It doesn\'t have to be home — not tonight. What feels least scary?',
    },
    jordan: {
      food: (c) => (c.mem._fed ? 'bro i already gave u my pop tarts 😭 i can bring more tmrw' : (c.mem._fed = 1, { say: 'omg wait yes. i have pop tarts and like half a lunchable. meet me by the bike rack? or i can leave it in our mailbox', fx: {} })),
      advice: () => pick(['ur grandma?? she\'s literally the nicest person alive. she\'d let u stay forever', 'the library is warm and nobody cares if u sit there all day. and it has outlets', 'idk... maybe tell okafor? she\'s not like the other adults i swear']),
    },
    grandma: { advice: () => 'You come here. You come to me. 41 Larkspur Lane, the blue door. Everything else we\'ll figure out at my kitchen table.' },
  };
  const isAdvice = (t) => /\b(what (should|do|can) i do|where (should|can|do) i go|what now|what do i do now|help me (figure|decide))\b/.test(t);
  const isFood = (t) => /\b(any food|something to eat|have (any )?food|i'?m (so )?(hungry|starving)|can i (have|get) (some )?food)\b/.test(t);

  /* wrap every brain: memory questions, why-not, real answers, no verbatim repeats, keep a transcript */
  const inner = SH.Brain, cache = new Map();
  function wrap(id, fn) {
    if (cache.has(fn)) return cache.get(fn);
    const w = function (an, c) {
      if (!an || !c || !c.mem || (c && c._cx)) return fn.apply(this, arguments);
      c._cx = true;
      try {
        const t = (an.t || '').toLowerCase(), h = hist(c), prevMe = lastOf(c, 'me'), prevNpc = lastOf(c, 'npc');
        let r = null, meta = false;
        if (!an.has || !an.has('selfharm')) {
          // what did I ask / say?
          if (/\bwhat (did|was) i (just )?(ask|say|tell|asking|saying)\b|\bwhat were we (talking about|saying)\b/.test(t)) { meta = true;
            r = { say: prevMe ? (teen(id) ? `u asked ${asked(prevMe.raw)}${prevNpc ? '. and i said ' + gist(prevNpc.t).toLowerCase() : ''}` : `You asked ${asked(prevMe.raw)}.${prevNpc ? ` And I said: "${gist(prevNpc.t)}"` : ''}`) : (teen(id) ? 'u literally just got here lol' : 'You haven\'t asked me anything yet.'), fx: {} };
          } else if (/\bwhat did you (just )?say\b|\bsay that again\b|\bcome again\b|\brepeat that\b/.test(t) && prevNpc) { meta = true;
            r = { say: teen(id) ? `i said ${prevNpc.t.toLowerCase()}` : `I said, ${prevNpc.t.charAt(0).toLowerCase() + prevNpc.t.slice(1)}`, fx: {} };
          } else if (/^(why|why not|how come|but why|why tho|why though)\??$/.test(t.trim()) && prevNpc && (REFUSE.test(prevNpc.t) || c.mem._refused)) {
            const tab = WHY[id] || (teen(id) ? WHY._teen : WHY._adult), k = c.mem._refused || (prevMe && (prevMe.I || []).includes('stay') ? 'stay' : 'def');
            r = { say: pick(tab[k] || tab.def || WHY._adult.def), fx: {} };
          } else if (ASK[id]) {
            const A = ASK[id];
            const k = an.has && an.has('stay') && A.stay ? 'stay' : isFood(t) && A.food ? 'food' : isAdvice(t) && A.advice ? 'advice' : null;
            if (k) { const v = A[k](c); r = typeof v === 'string' ? { say: v, fx: {} } : v; }
          }
        }
        if (!r) r = fn.apply(this, arguments) || { say: '...', fx: {} };
        if (typeof r.say === 'string') {
          // a carried follow-up ("what about tomorrow?") that lands on an answer they already gave: say so, briefly
          if (an.carried && h.some((x) => x.who === 'npc' && x.t.trim() === r.say.replace(/\*[^*]+\*\s*/g, '').trim())) {
            const first = r.say.split(/(?<=[.!?])\s+/)[0];
            r.say = teen(id) ? pick(['same answer tbh. ' + first.toLowerCase(), 'still no, sorry. ' + first.toLowerCase()]) : pick([`Same answer, I'm afraid. ${first}`, `That part doesn't change, I'm sorry. ${first}`]);
          }
          // never the exact same line twice in a row
          if (prevNpc && r.say.trim() === prevNpc.t.trim()) r.say = teen(id) ? pick(['like i said. ' + r.say.toLowerCase(), 'bro i just said that 😭']) : pick([`Like I said — ${r.say.charAt(0).toLowerCase() + r.say.slice(1)}`, 'I just told you, hon. ' + r.say]);
          if (REFUSE.test(r.say) && an.has && an.has('stay')) c.mem._refused = 'stay';
          else if (an.has && !an.has('stay') && !/^(why|how come)/.test(t)) c.mem._refused = REFUSE.test(r.say) ? 'def' : null;
          h.push({ who: 'me', t: an.carried || an.t, raw: an.carried || an.raw || an.t, meta, I: STRONG.filter((k) => an.has && an.has(k)) }); h.push({ who: 'npc', meta, t: r.say.replace(/\*[^*]+\*\s*/g, '') });
          if (h.length > 24) h.splice(0, h.length - 24);
        }
        return r;
      } finally { c._cx = false; }
    };
    Object.keys(fn).forEach((x) => { w[x] = fn[x]; });
    cache.set(fn, w); return w;
  }
  SH.Brain = new Proxy(inner, { get(tg, key) { const f = tg[key]; return typeof f === 'function' && typeof key === 'string' ? wrap(key, f) : f; }, set(tg, key, v) { tg[key] = v; return true; } });

  /* context carry: rewrite "what about tomorrow?" into the full request before the brain sees it */
  const bAnalyze = NLP.analyze; let pending = null;
  NLP.analyze = function (raw) {
    if (pending && raw === pending.text) {
      if (pending.full === undefined) pending.full = carry(pending.c, raw) || null;
      if (pending.full) { const an = bAnalyze.call(this, pending.full); an.raw = raw; an.carried = pending.full; return an; }
    }
    return bAnalyze.apply(this, arguments);
  };
  const bSay = T.say;
  T.say = function () {
    const c = T.cur, inp = document.getElementById('tin');
    if (c && !c.ended && inp && inp.value.trim()) pending = { c, text: inp.value.trim() };
    try { return bSay.apply(this, arguments); } finally { pending = null; }
  };
  SH.Ctx2 = { swap, asked, carry };
})(window.SH);
