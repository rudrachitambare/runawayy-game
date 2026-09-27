/* SMALL HOURS — talk fixes: threads, consequences, and PIP options that change.
   Problems this fixes (from a real transcript with Marco):
   - Friends asked questions without "?" ("where would you even go") so your answer ("a village") was treated as noise.
   - A friend who'd repeat themselves got swapped for a random topic ("wanna hang this weekend") mid-conversation.
   - "things aren't great" wasn't understood as a feeling; "or nah / tell quick" didn't force an answer.
   - PIP kept offering the same line, even one you'd just said.
   FRIEND THREADS (per conversation c.mem.th, remembered per friend in FR.st(id).rt):
   running away: where → how bad is it → their decision → when. Their answer is decided ONCE and remembered; ask again and
   they say the same thing ("i already said yes"). Low moods open a "what happened?" thread; a short yes/story = you told them.
   CONSEQUENCES (actions follow what was said):
   - in → f.wouldRun (they show up as "ask to come" in their menu), and if you set a time they text you that evening.
   - won't come but helps → f.offer (crash at theirs).
   - scared for you and no promise → they may tell their parent the next day, who calls your mom (or, if you've already
     left, it raises heat). "don't tell anyone" / "promise" can stop that if they trust you enough.
   - greetings remember the thread ("u still thinking about the village thing?", "...are u mad at me?").
   UNDERSTANDING: negated positives ("not great/okay/good") = low mood; "rough / bad day / things suck" = low;
   "or nah / tell quick / yes or no / be honest" = urge (forces a direct answer).
   PIP ◉ OPTIONS: built from the thread and the last line (where? how bad? when? decision?), rotate on every press, and never
   repeat something you already said in this conversation. */
(function (SH) {
  const N = SH.NLP, FR = SH.Friends; if (!N || !FR) return;
  const G = () => SH.G, pick = (a) => a[Math.floor(Math.random() * a.length)];
  const norm = (s) => String(s || '').toLowerCase().replace(/[^a-z0-9 ]/g, '').replace(/\s+/g, ' ').trim();
  const KIDS = FR.KIDS;
  /* ---------- understanding ---------- */
  const bA = N.analyze;
  N.analyze = function () {
    const an = bA.apply(this, arguments), t = an.t || '';
    if (/\b(not|aren'?t|isn'?t|ain'?t|wasn'?t|never|n't) (so |that |very |really |doing |going |feeling )?(great|good|ok|okay|fine|alright|well)\b|\b(been|is|it'?s|things are|life is|home is) (rough|hard|bad|awful|terrible|the worst|a mess)\b|\bbad day\b|\bthings suck\b|\beverything sucks\b|\bnot doing (so )?(good|well)\b/.test(t)) { an.I.low = 1; an.I.sad = 1; delete an.I.safe; delete an.I.deflect; }
    if (/\b(or nah|or not|yes or no|tell (me )?quick|just (say|tell me)|answer me|be honest|for real tho|fr tho)\b/.test(t)) { an.I.urge = 1; an.q = true; }
    return an;
  };
  /* ---------- helpers ---------- */
  const said = (c, arr) => { c.mem.usedT = c.mem.usedT || {}; const ok = arr.filter((x) => !c.mem.usedT[norm(x)]); const l = pick(ok.length ? ok : arr); c.mem.usedT[norm(l)] = 1; return l; };
  const QW = /^(where|what|why|how|who|when|are|is|do|does|did|can|could|would|will|wanna)\b/i;
  const qfix = (s) => { s = String(s || ''); const parts = s.split(/(?<=[.!?])\s+/); const last = parts[parts.length - 1]; if (last && !/[.!?]["”]?$/.test(last.trim()) && QW.test(last.trim())) parts[parts.length - 1] = last.trim() + '?'; return parts.join(' '); };
  const par = (k) => (/^Mr\.? /.test(k.parent) ? 'dad' : 'mom');
  const RUN = /\b(run(ning)? away|runaway|take off|leave (home|town|here)|get out of (here|this town|town)|just leave|disappear)\b/;
  const INVITE = /\b(come with( me)?|with me|you in|u in|(wanna|want to|gonna) come|join me|you coming|u coming|would (you|u) come)\b/;
  const ASKWANT = /\b(you|u) (ever )?(wanna|want to|feel like|think about|thought about) (run|leave|running|leaving|take off)/;
  const SECRET = /\b(don'?t tell|dont tell|promise (you|u) won'?t|keep it (a )?secret|between us|swear (you|u) won'?t|no one can know|nobody can know)\b/;
  const WHEN = /\b(tonight|tomorrow|right now|now|this weekend|friday|saturday|sunday|monday|tuesday|wednesday|thursday|next week|soon|after school)\b/;
  const FLAV = (w) => (/village|farm|country|woods|forest|nowhere|small/.test(w) ? 'like with cows and one gas station' : /city|port/.test(w) ? 'the city is huge tho. u would get lost' : /grandma|aunt|uncle|cousin/.test(w) ? 'ok that actually makes sense' : 'thats so far');
  const whenDay = (t) => { if (/\btonight|right now|\bnow\b|after school/.test(t)) return 0; if (/tomorrow/.test(t)) return 1; if (/weekend|saturday/.test(t)) return Math.max(1, (6 - (SH.wd ? SH.wd() : 0) + 7) % 7); if (/next week/.test(t)) return 7; const d = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'].findIndex((x) => t.includes(x)); if (d >= 0) return ((d - (SH.wd ? SH.wd() : 0)) + 7) % 7 || 7; return 2; };
  /* ---------- the friend thread engine ---------- */
  function thread(id, an, c) {
    const k = KIDS[id], f = FR.st(id), g = G(), t = an.t || '', rel = g.rel[id] || 0; c.mem = c.mem || {};
    const th = (c.mem.th = c.mem.th || { k: null, s: null }); const rt = (f.rt = f.rt || { asks: 0 });
    const R = (say, fx, x) => Object.assign({ say, fx: fx || {} }, x || {});
    const yes = an.has('yes') || /^(ya|yea|yeah|yep|kinda|sorta|a little|sometimes|really bad|so bad|its bad|it's bad)\b/.test(t);
    const no = an.has('no') || /^(nah|nope|not really|its fine|it's fine|nothing|not that bad)\b/.test(t);
    if (an.has('selfharm')) return null;
    // promises / secrets
    if (SECRET.test(t) && (rt.asks || f.knows)) {
      if (rel >= 25 || f.wouldRun) { f.secret = true; f.mayTell = null; return R(said(c, ['i won\'t. pinky promise. but text me every day ok', 'ok. i swear. but if u go quiet for like a day i\'m freaking out', 'my lips are sealed. like literally']), { rel: 2 }); }
      return R(said(c, ['...ok. but if something bad happens i\'m telling. sorry', 'i\'ll try. i just don\'t want u to get hurt']), {});
    }
    const decide = () => {
      rt.asks++;
      if (rt.dec == null) { const s = (f.knows ? 0.3 : 0) + (rel - 40) / 50 + (k.risk || 0.3) - 0.35 + (Math.random() - 0.5) * 0.3; rt.dec = s > 0.15 ? 'in' : rel >= 25 ? 'help' : 'no'; rt.decT = g.t; }
      th.k = 'run';
      if (rt.dec === 'in') { const first = !f.wouldRun; f.wouldRun = true; th.s = 'when'; return R(first ? said(c, [`ok. yeah. if u go i'm coming. ${rt.where ? 'even to ' + rt.where + '. ' : ''}when?`, `...yeah. i'm in. two is safer than one. when?`]) : said(c, ['i already said yes. i\'m in. u just gotta tell me when', 'dude. i\'m IN. stop asking and tell me when']), { rel: first ? 3 : 0 }, first ? { narr: `${k.n} would come with you. You're not sure if that makes it better or worse.` } : {}); }
      if (rt.dec === 'help') { const first = !f.offer; f.offer = true; th.s = 'secret'; return R(first ? said(c, [`i can't. my ${par(k)} would actually lose it. but i'll help. u can crash at mine first, and i'll bring food`, `i can't go. i'm sorry. but my window's always open, ok? and i'll sneak u snacks`]) : said(c, ['i told u. i can\'t go. but i\'ve got ur back, for real', 'still can\'t. still helping tho']), { rel: 2 }, first ? { narr: `${k.n} won't come, but ${k.g === 'he' ? 'he\'ll' : k.g === 'she' ? 'she\'ll' : 'they\'ll'} help. ${k.g === 'he' ? 'His' : k.g === 'she' ? 'Her' : 'Their'} place is an option now.` } : {}); }
      f.worry = (f.worry || 0) + 1; th.s = 'secret';
      if (f.worry >= 2 && !f.secret && !f.mayTell) { f.mayTell = SH.day() + 1; return R(said(c, [`this is scaring me. i think i have to tell my ${par(k)}. i'm sorry`, `i can't just sit here and know this. i might tell my ${par(k)}. please don't hate me`]), { rel: -1 }); }
      return R(rt.asks > 1 ? said(c, ['i said no. please don\'t do it', 'no. i\'m not doing that and i don\'t think u should either']) : said(c, ['that\'s kinda scary. i don\'t think u should. please don\'t', 'no?? that\'s dangerous. talk to someone first']), {});
    };
    // plans: "wanna draw later?" → a real yes/no that sticks
    const PLAN = /\b(do (u|you) (want|wanna) (to )?|wanna |want to |down to |u down to |can we )(\w+(?: \w+){0,3}?) ?(later|tomorrow|after school|this weekend|today|tonight|sometime|rn|now)?\??$/;
    const pm = !RUN.test(t) && an.q && t.match(PLAN);
    if (pm && !/\b(run|leave|go away|come with)\b/.test(pm[5])) {
      const act = pm[5].replace(/\b(me|with me|together)\b/g, '').trim() || 'hang', when = pm[6] || 'later', like = k.likes && k.likes.test(t);
      if (rel < 5 && !like) return R(said(c, ['maybe. i\'m kinda busy', 'idk. maybe another time']), {});
      f.plan = { what: act, when, d: SH.day() + (/tomorrow/.test(when) ? 1 : 0) }; SH.tag && SH.tag('plan_' + id);
      return R(like ? said(c, [`YES. ${act} ${when}. finally someone asked`, `omg yes. ${act}? i'm so down`]) : said(c, [`sure. ${act} ${when}. where?`, `ya ok. ${when} works`]), { rel: 2, mood: 1 });
    }
    // explicit decision triggers
    if (INVITE.test(t) || (an.I.urge && th.k === 'run') || (RUN.test(t) && (rt.asks > 0 || th.k === 'run') && (an.q || an.I.urge) && !ASKWANT.test(t))) return decide();
    // they get asked whether THEY'd run
    if (ASKWANT.test(t) || (RUN.test(t) && /\b(you|u)\b/.test(t) && an.q && !th.k)) {
      th.k = 'run'; th.s = 'why'; rt.talked = g.t;
      return R(said(c, (k.risk || 0.3) > 0.4 ? ['honestly? sometimes. my house gets loud. why. do u?', 'like every other day lol. but for real, why? is something going on?'] : ['what?? no. i mean. sometimes i think about it. why, do u?', 'not really. why?? are u ok?']), { rel: 1 });
    }
    // you bring up running (first time / continuing)
    if (RUN.test(t) || an.has('run')) {
      rt.talked = g.t;
      if (th.k === 'run' && (th.s === 'decide' || th.s === 'when' || th.s === 'secret')) return decide();
      th.k = 'run'; th.s = 'where';
      if (rt.where && rt.asks) return R(said(c, [`${rt.where} still?`, `u still thinking about ${rt.where}?`]), {});
      return R(f.offer ? said(c, ['dude. don\'t. just come to mine instead. please', 'u know u can just come to mine right?']) : said(c, ['wait like run away?? where would you even go?', 'run away where?? like where would u go?', 'wait what. where would u even go?']), { rel: 1 });
    }
    // answers inside the run thread
    if (th.k === 'run') {
      if (th.s === 'where' || th.s === 'why') {
        if (th.s === 'why' && (yes || an.has('disclose') || an.I.low)) { th.s = 'bad'; }
        else if (!an.q && an.len <= 10 && !no) {
          const w = N.clean ? N.clean(an.raw.replace(/^(to |a |an |somewhere |maybe |idk |like )+/i, '')) : an.raw; rt.where = w.slice(0, 30);
          if (SH.Mind && SH.Mind.claims) { const cl = SH.Mind.claims(id); cl.going = { v: rt.where, t: g.t, n: 1 }; }
          th.s = 'bad'; return R(said(c, [`${rt.where}?? ${FLAV(rt.where)}. how would u even get there. is it that bad at home?`, `${rt.where}. huh. ${FLAV(rt.where)}. wait is stuff that bad at home?`]), { rel: 1 });
        }
        if (no || /^idk|^i don'?t know/.test(t)) { th.s = 'bad'; return R(said(c, ['then why run?? is it home stuff?', 'ok but why tho. is something going on at home?']), {}); }
      }
      if (th.s === 'bad') {
        if (yes || an.has('disclose') || an.I.low || an.has('scared')) { const first = !f.knows; f.knows = true; SH.tag && SH.tag('toldFriend_' + id); th.s = 'decide';
          return R(rel >= 30 && !f.offer ? (f.offer = true, said(c, [`that's so messed up. u don't deserve that. ok listen, u can come to mine. like at night even`, `dude. that's not ok. my window, the one with stickers. anytime`])) : said(c, first ? ['that\'s really scary. i\'m sorry. are u ok?', 'wait. i didn\'t know. i\'m sorry. what are u gonna do?'] : ['i hate that. i\'m here ok', 'still?? ugh. i\'m sorry']), { rel: 4, stress: -3 }); }
        if (no) { th.s = 'decide'; return R(said(c, ['then don\'t run?? u can just come over when it\'s loud', 'ok. then maybe just stay at mine sometimes instead']), {}); }
      }
      if (th.s === 'when' && !WHEN.test(t) && !rt.where && !an.q && an.len <= 6 && !no && !/\b(idk|not sure|dunno)\b/.test(t)) {
        const w = (N.clean ? N.clean(an.raw.replace(/^(to |a |an |somewhere |maybe |like )+/i, '')) : an.raw).slice(0, 30); rt.where = w;
        if (SH.Mind && SH.Mind.claims) SH.Mind.claims(id).going = { v: w, t: g.t, n: 1 };
        return R(said(c, [`${w}. ${FLAV(w)}. ok. but when?`, `${w}?? ok. ${FLAV(w)}. when tho?`]), {});
      }
      if (th.s === 'when' && (WHEN.test(t) || /\b(idk|not sure|dunno)\b/.test(t))) {
        if (/\b(idk|not sure|dunno)\b/.test(t) && !WHEN.test(t)) return R(said(c, ['ok. tell me before u go. don\'t just vanish', 'ok but tell me first. promise']), {});
        const d = whenDay(t); rt.when = SH.day() + d; th.s = 'secret';
        return R(said(c, [`ok. ${d === 0 ? 'tonight' : d === 1 ? 'tomorrow' : 'then'}. i'll pack snacks. text me when u leave`, `${d === 0 ? 'tonight' : d === 1 ? 'tomorrow' : 'ok'}. ok. oh my god. ok. text me first`]), { rel: 2 }, { narr: `${k.n} is in. ${d === 0 ? 'Tonight' : d === 1 ? 'Tomorrow' : 'Soon'}.` });
      }
    }
    // low mood → "what happened?" thread
    if (an.I.low && !th.k) { th.k = 'home'; th.s = 'what'; return R(f.knows ? said(c, ['is it rick again? what happened', 'what happened. home stuff again?']) : said(c, ['wait what happened? is it home stuff?', 'hey. what\'s going on? like at home?']), { stress: -1 }); }
    if (th.k === 'home' && th.s === 'what') {
      th.k = null;
      if (yes || an.has('disclose') || an.len >= 5) { const first = !f.knows; f.knows = true; SH.tag && SH.tag('toldFriend_' + id);
        return R(rel >= 30 && !f.offer ? (f.offer = true, `that's not ok. if it gets bad u can come to mine. like at night even. my ${par(k)} would let u`) : said(c, first ? ['i\'m sorry. that sounds really hard. have u told an adult?', 'that\'s so messed up. i\'m here ok'] : ['i hate that. want me to walk u to ms okafor tomorrow?', 'ugh. i\'m sorry. i\'m here']), { rel: 4, stress: -3 }); }
      if (no) return R(said(c, ['ok. u don\'t have to say. i\'m here tho', 'ok. offer stands. snacks and silence']), { rel: 1 });
    }
    return null;
  }
  Object.keys(KIDS).forEach((id) => {
    const base = SH.Brain[id]; if (typeof base !== 'function') return;
    const w = function (an, c) {
      c = c || {}; c.mem = c.mem || {};
      let r = null; try { r = thread(id, an, c); } catch (e) { console.warn('thread', e); }
      if (!r) { r = base.apply(this, arguments) || { say: '...', fx: {} }; if (c.mem.th && c.mem.th.k && !(RUN.test(an.t) || an.I.low)) { c.mem.th.idle = (c.mem.th.idle || 0) + 1; if (c.mem.th.idle > 1) c.mem.th.k = null; } }
      else { if (c.mem.th) c.mem.th.idle = 0; try { const S = SH.Converse.cs(c); const nn = String(r.say).toLowerCase().replace(/[^a-z0-9 ]/g, '').trim(); S.said.push(nn); S.lastRaw = r.say; } catch (e) {} }
      if (r && typeof r.say === 'string') r.say = qfix(r.say);
      return r;
    };
    Object.keys(base).forEach((x) => { w[x] = base[x]; }); w._thread = true;
    SH.Brain[id] = w;
  });
  SH.TalkFix = { norm, par, said, qfix };
})(window.SH);
