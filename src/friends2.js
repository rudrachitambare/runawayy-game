/* SMALL HOURS — friends have their own reasons, and you can actually talk them into it (turn 34).
   Before: whether a friend would run with you was one dice roll, made the first time you asked and never changed, and
   none of them had any trouble of their own — so there was no reason for them to come, and nothing you said mattered.
   Now:
   - Every friend has a trouble of their own (two possibilities each, picked per story seed): a move they don't want,
     a dad who's never home, a failed test with a forged signature… Ask how they're doing (or tell them about yours) and
     they'll tell you. It never shows up as a number.
   - Talking them into it is a conversation. What moves them: their own trouble ("you said your dad's never home"),
     a real plan (where you'd sleep, money, a ticket — checked against what you actually have), promising to stick
     together, and that they can go home any time. Pushing, insulting or calling them scared pushes them away.
     When they're close, they tell you what's still bothering them ("but where would we even sleep").
   - Once they've said yes, "come with?" works (unless a strict parent took their phone — and they tell you that).
   - Friends with worse trouble at home last longer on the road before they get homesick. */
(function (SH) {
  const FR = SH.Friends; if (!FR || !SH.Brain) return;
  const G = () => SH.G, pick = (a) => a[Math.floor(Math.random() * a.length)];
  const TR = FR.TROUBLE = {
    nia: [{ sev: 20, k: /\b(detroit|move|moving|divorce|split(ting)?|your dad|ur dad)\b/, tell: 'honestly? my parents are splitting up. i\'m supposed to move to my dad\'s in detroit next month. i barely know him. nobody asked me', yes: 'ok. if it means not getting shipped to detroit... yeah. i\'m in.' },
      { sev: 15, k: /\b(brother|nights|your mom works|ur mom works)\b/, tell: 'my mom works nights so my brother\'s "in charge". he\'s fine till his friends come over. then i just lock my door', yes: 'my brother wouldn\'t even notice till like thursday. ok. yeah. i\'ll come.' }],
    marco: [{ sev: 20, k: /\b(truck|rent|money|burden|mouth to feed|your mom|ur mom)\b/, tell: 'the truck\'s not doing good. i heard my mom crying about rent. like, one less kid to feed would kinda help her, right? jk. mostly', yes: '...one less mouth, right? ok. ok i\'m in. don\'t tell my abuela.' },
      { sev: 25, k: /\b(texas|uncle|sending you|send you|shipping you)\b/, tell: 'they\'re sending me to my uncle\'s in texas "for a while". nobody will say how long. i asked like five times', yes: 'better than texas. ok. i\'m coming. for real.' }],
    priya: [{ sev: 25, k: /\b(test|grade|signature|forged|failed|fail|report card)\b/, tell: 'I failed the physics test. First time ever. I forged my mom\'s signature on it. The school emails parents on Friday. I think about that every second.', yes: 'Friday\'s going to happen either way. ...Okay. Okay. I\'ll come. I\'m bringing a first aid kit.' },
      { sev: 20, k: /\b(tutor|tutoring|piano|kumon|schedule|free time|pressure|never let you)\b/, tell: 'My parents schedule every minute. Tutoring, piano, Kumon, robotics. I haven\'t had a free afternoon in two years. I timed it once.', yes: 'I\'ve never done one thing that wasn\'t on a schedule. ...Okay. I\'m in. I\'m making a packing list.' }],
    eli: [{ sev: 30, k: /\b(your dad|ur dad|alone|fridge|nobody would notice|no one would notice|gone for|by yourself)\b/, tell: 'my dad\'s been gone three weeks. the fridge is ketchup and one egg. if i left nobody would notice till like next month', yes: 'nobody\'s even home to miss me. yeah. i\'ll come.' },
      { sev: 25, k: /\b(move|moving|again|new school|starting over|fifth school)\b/, tell: 'we\'re moving again in two weeks. fifth school. i\'m so tired of being the new kid', yes: 'if i\'m gonna be somewhere new anyway... at least it\'d be with you. ok.' }],
    theo: [{ sev: 20, k: /\b(your dad|ur dad|yell|yells|losing|lose|dinner|westfield)\b/, tell: 'after we lost to westfield my dad didn\'t let me eat dinner. like as a lesson. he yells in the car the whole way home', yes: 'i\'m not sitting in that car again. ok. i\'m in.' },
      { sev: 15, k: /\b(math|cut|the team|grade)\b/, tell: 'if my math grade doesn\'t come up i\'m off the team. and basketball\'s literally the only thing i\'m good at', yes: 'if i\'m getting cut anyway... whatever. ok. i\'ll come.' }],
    hazel: [{ sev: 25, k: /\b(house|notice|evict|lose the|quinn place|farm|pink)\b/, tell: 'there\'s a pink notice on our door. we might lose the quinn place. my dad won\'t talk about it, he just works more', yes: 'if we\'re losing the house anyway i\'d rather be somewhere with trees. i\'m in. obviously.' },
      { sev: 20, k: /\b(your dad|ur dad|alone|doubles|by yourself|doesn'?t come home)\b/, tell: 'my dad works doubles so i basically raise myself. some nights he doesn\'t come home at all. it\'s fine. it\'s mostly fine', yes: 'i basically live alone already. at least this way i\'d have company. ok!' }],
  };
  // Jordan: your best friend since forever. Not one of the Birch Street kids, but he has his own stuff too.
  TR.jordan = [{ sev: 20, k: /\b(parents|fight|fighting|hours|whisper|your dad|ur dad|money|job)\b/, tell: 'ngl my house is weird rn. my dad\'s hours got cut and they fight every night. like whisper-fighting. it\'s worse than yelling. i just turn my music up', yes: 'better than listening to them whisper-fight all night. ok. i\'m in. fr.' },
    { sev: 20, k: /\b(ohio|move|moving|transfer|transferred|december)\b/, tell: 'my dad got transferred. we\'re moving to ohio in december. i didn\'t even get a vote. ur literally the only reason i like it here', yes: 'i\'m getting dragged to ohio anyway. might as well go somewhere with u first. i\'m in.' }];
  if (!FR.KIDS.jordan) FR.KIDS.jordan = { n: 'Jordan', full: 'Jordan Pike', g: 'he', col: '#6aa7ff', ini: 'J', age: 12, vibe: 'best friend', risk: 0.45, fam: 'warm', parent: 'Mrs. Pike', pjob: 'a dental hygienist', extra: true,
    likes: /\b(skate|skating|skyforge|takis|pizza|raccoons?)\b/, dislikes: /\b(math|mr dale|tyler)\b/, look: { skin: '#c68e62', hair: '#20150e', style: 'short', shirt: '#6aa7ff', top: 'hoodie', young: 1 },
    hang: 'skating the bowl', where: 'park', we: 'park', hi: 'yo', fb: ['did u see the new skyforge update', 'bro same', 'fr'], bio: {} };
  const trouble = (id) => { const L = TR[id]; if (!L) return null; const s = ((G().story && G().story.seed) || 1) + id.length * 13; return L[s % L.length]; };
  FR.trouble = trouble;
  const THR = (id) => 60 + (FR.KIDS[id].fam === 'strict' ? 10 : 0);
  const RUN = /\b(run(ning)? away|runaway|take off|leave (home|town|here)|get out of (here|this town|town)|just leave|disappear|come with|with me|you in|u in|join me|you coming|u coming)\b/;
  const ASKTHEM = /\b(you ok|u ok|are you okay|r u ok|how('s| is) (your|ur) (home|house|family|dad|mom|brother)|what'?s wrong|what about you|what about u|how about you|hbu|wbu|is everything ok|anything going on|how are things (at home|with you)|do you (ever )?have problems|your (parents|family)|ur (parents|family)|is it bad at (yours|your house|ur house))\b/;
  const ARGS = {
    plan: /\b(plan|grandma|aunt|uncle|money|saved|ticket|bus|train|shelter|safe place|i know a place|motel|we'?d sleep|place to sleep|i have \$?\d+|got \$?\d+|food)\b/,
    together: /\b(together|not alone|look out for|need you|best friend|two is safer|stick together|i'?ll protect|i won'?t leave you|won'?t let anything happen|i got you|we got this)\b/,
    back: /\b(come back|just a few days|any ?time you want|go home whenever|can go home|not forever|only for a bit|a weekend)\b/,
  };
  const PUSH = /\b(coward|chicken|scared(y)? cat|baby|you'?re scared|ur scared|don'?t be lame|lame|you owe me|u owe me|if you were my friend|if u were my friend)\b/;
  function brainWrap(id, base) {
    const w = function (an, c) {
      c = c || {}; c.mem = c.mem || {};
      const f = FR.st(id), g = G(), t = an.t || '', rel = g.rel[id] || 0, tr = trouble(id), k = FR.KIDS[id], rt = (f.rt = f.rt || { asks: 0 }), th = (c.mem.th = c.mem.th || { k: null, s: null });
      const dec00 = f.rt && f.rt.dec, R = (say, fx, x) => Object.assign({ say, fx: fx || {} }, x || {});
      if (!tr || (an.has && an.has('selfharm'))) return base.apply(this, arguments);
      // they tell you about their own trouble
      if (!f.shared && (ASKTHEM.test(t) || (f.knows && th.k === 'home' && an.q && /\b(you|u)\b/.test(t))) && rel >= 10) { f.shared = true; c.mem.fr2 = 'shared'; return R(tr.tell, { rel: 3 }, { narr: `${k.n} has never told anyone that. You can tell.` }); }
      if (f.shared && ASKTHEM.test(t)) return R(pick(['same stuff. it\'s whatever', 'still the same. thanks for asking tho. nobody asks']), { rel: 1 });
      // persuading: only while the running-away talk is on, and they haven't said yes yet
      const onRun = th.k === 'run' || RUN.test(t) || rt.asks > 0;
      if (onRun && !f.wouldRun && !(g.party || []).includes(id)) {
        f.args = f.args || {};
        if (f.pull == null) f.pull = (f.knows ? 15 : 0) + (rel - 30) / 2 + (f.shared ? tr.sev : tr.sev / 2) + (k.risk || 0.3) * 30;
        let d = 0, used = [];
        if (PUSH.test(t) || (an.I && an.I.hostile)) { f.pull -= 15; return R(pick(['wow. ok. that\'s not how u get someone to come with u', 'don\'t call me that. i\'m not scared, i\'m thinking', 'dude. rude. i was actually thinking about it']), { rel: -4 }); }
        if (f.shared && tr.k.test(t) && !f.args.trouble) { d += 25; used.push('trouble'); }
        if (ARGS.plan.test(t) && !f.args.plan) { d += 15 + ((g.money || 0) >= 30 || (g.tickets && Object.keys(g.tickets).length) || SH.f('grandmaAddr') ? 10 : 0); used.push('plan'); }
        if (ARGS.together.test(t) && !f.args.together) { d += 12; used.push('together'); }
        if (ARGS.back.test(t) && !f.args.back) { d += 8; used.push('back'); }
        if (used.length) {
          used.forEach((u) => { f.args[u] = 1; }); f.pull += d; th.k = 'run';
          if (f.pull >= THR(id)) { f.wouldRun = true; rt.dec = 'in'; th.s = 'when'; SH.flag && SH.flag('talkedFriendIn'); return R(`${tr.yes} when?`, { rel: 4 }, { narr: `${k.n} would come with you. You talked ${k.g === 'he' ? 'him' : k.g === 'she' ? 'her' : 'them'} into it. You're not sure if that makes it better or worse.` }); }
          // close, but something's still bugging them: tell you what
          const need = !f.args.plan ? 'plan' : !f.args.together ? 'together' : f.shared && !f.args.trouble ? 'trouble' : !f.args.back ? 'back' : 'time';
          const NEED = { plan: ['ok but where would we even sleep. like actually. and with what money', 'i mean... maybe. but what\'s the actual plan. like where do we go'], together: ['and what if we get split up or something. i\'d freak out', 'maybe. but promise we\'d stick together? like no matter what?'], trouble: ['...idk. it\'s not like home is great for me either. but', 'i mean. you know how it is at my house. but still'], back: ['what if i want to come home tho. like after a day', 'and if i hate it, i can just go home right?'], time: ['i\'m like... almost there. give me a sec. this is huge', 'ok ok ok. i\'m thinking about it. for real this time'] };
          rt.dec = rt.dec === 'no' ? 'help' : rt.dec;
          const ACK = { trouble: ['...yeah. i hate it there. i do.', 'ok that\'s. yeah. that\'s true.'], plan: ['ok that\'s actually a plan.', 'huh. ok. u really thought about it.'], together: ['ok. together. that helps.', 'promise? ok.'], back: ['ok. that makes it less scary.', 'ok. not forever. i can do not forever.'] };
          const far = f.pull < THR(id) - 25;
          return R(`${pick(ACK[used[used.length - 1]])} ${far ? pick(['still. this is huge. ', 'but i don\'t know. ']) : ''}${pick(NEED[need])}`, { rel: 1 });
        }
        // first time they're asked: decide from who they are, not a coin
        if (rt.dec == null && /\b(come with|with me|you in|u in|join me|you coming|u coming|would (you|u) come|wanna come|want to come)\b/.test(t)) {
          if (f.pull >= THR(id)) { rt.dec = 'in'; } else { rt.dec = rel >= 25 ? 'help' : 'no'; rt.asks = (rt.asks || 0); }
        }
      }
      const dec0 = dec00, r = base.apply(this, arguments);
      if (dec0 == null && (rt.dec === 'help' || rt.dec === 'no') && r && typeof r.say === 'string' && !f.wouldRun && rt.dec !== dec0 && !f._hinted) {
        f._hinted = true; r.say += ' ' + (f.shared ? pick(['...i mean. part of me wants to. i just don\'t know how it\'d even work', '...ugh. with my stuff at home, part of me really wants to']) : pick(['...not that my house is perfect either', '...it\'s not like everything\'s great at mine either tho']));
      }
      return r;
    };
    Object.keys(base).forEach((x) => { w[x] = base[x]; }); w._fr2 = true;
    return w;
  }
  FR.brainWrap = brainWrap;
  Object.keys(FR.KIDS).forEach((id) => { const b = SH.Brain[id]; if (typeof b === 'function' && !b._fr2) SH.Brain[id] = brainWrap(id, b); });

  /* inviting by text: a yes is a yes */
  const bInv = FR.invite;
  FR.invite = function (id) {
    const f = FR.st(id), k = FR.KIDS[id], g = G();
    if (f.wouldRun && k.fam === 'strict' && Math.random() < 0.12) {
      SH.Phone.push(id, 'me', 'i left. come with?'); SH.advance(10, { interrupt: false });
      SH.Phone.push(id, id, `${k.parent === 'Dr. Nair' ? 'my mom' : 'my dad'} took my phone. i'm texting from my ipad under the covers. i can't get out tonight. i'm so sorry. try tomorrow??`);
      SH.UI.log(`${k.n} wanted to. Their ${k.parent.startsWith('Mr') ? 'dad' : 'mom'} got in the way. Maybe tomorrow.`, 'warn'); return SH.UI.afterAction();
    }
    if (f.wouldRun) { const r0 = k.risk; k.risk = 2; try { return bInv.apply(this, arguments); } finally { k.risk = r0; } }
    return bInv.apply(this, arguments);
  };

  /* worse trouble at home = lasts longer before homesickness */
  if (SH.K && SH.K.daily) SH.K.daily.push(() => { const g = G(); (g.party || []).forEach((id) => { const tr = trouble(id), f = FR.st(id); if (tr && f.home > 0 && Math.random() < tr.sev / 40) f.home = Math.max(0, f.home - 1); }); });
})(window.SH);
