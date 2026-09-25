/* SMALL HOURS — Ms. Okafor v2: an actual counselor.
   She tracks what you've told her (this visit AND past visits), reflects your specifics back, asks the NEXT
   question instead of the same one, answers "what happens if I tell?" honestly, and doesn't slam the door
   after the mandated-reporter moment: she asks for consent and keeps going with a safety plan. */
(function (SH) {
  const N = SH.NLP;
  const old = SH.Brain.okafor; // kept for the self-harm path (care line + resources)
  const R = (say, fx = {}, extra = {}) => Object.assign({ say, fx: fx || {} }, extra);
  const pick = (a) => a[Math.floor(Math.random() * a.length)];
  const cap = (s) => (s ? s[0].toUpperCase() + s.slice(1) : s);
  const joinL = (a) => (a.length <= 1 ? a.join('') : a.slice(0, -1).join(', ') + ' and ' + a[a.length - 1]);

  const DETAIL = { drink: 'Rick drinks', yell: 'it gets loud, really loud', violence: 'things get physical', mombusy: 'your mom works long shifts, so she\'s not always there', care: 'you\'re the one looking after Lily', sleep: 'you\'re not sleeping', food: 'meals aren\'t a sure thing', tyler: 'Tyler\'s been going after you', run: 'part of you wants to leave' };
  const HOMEISH = ['drink', 'yell', 'violence', 'mombusy', 'care', 'rick'];

  function S(c) {
    c.mem = c.mem || {}; const m = c.mem;
    m.k = m.k || {}; m.asked = m.asked || {}; m.def = m.def || 0; m.d = m.d || 0; m.said = m.said || {};
    return m;
  }
  const past = () => ((SH.G.mind && SH.G.mind.npc && SH.G.mind.npc.okafor && SH.G.mind.npc.okafor.tops) || {});
  const knows = (m, t) => !!m.k[t] || (!!past()[t] && SH.G.t - past()[t].t > 30); // from an earlier visit
  const blocked = (c, t) => SH.Converse && SH.Converse.blocked(c, t);
  // the line bank never gives the same line twice in one visit
  function once(m, key, arr) { const xs = arr.filter((x) => !m.said[x]); const s = (xs.length ? pick(xs) : null); if (s) m.said[s] = 1; return s; }

  /* questions she can ask next, in priority order; each asked at most once per visit */
  const QUEUE = [
    { id: 'phys', when: (m) => (m.k.drink || m.k.yell) && !m.k.violence, top: 'violence', q: 'When he\'s like that, does it ever get physical? With you, or with your mom?' },
    { id: 'whoHome', when: (m) => m.k.mombusy && !m.k.care, top: 'care', q: 'So who\'s home with you when she\'s at work?' },
    { id: 'whoYou', when: (m) => m.k.care, top: 'care2', q: 'So who takes care of YOU?' },
    { id: 'sleep', when: (m) => (m.k.yell || m.k.drink) && !m.k.sleep, top: 'sleep', q: 'How are you sleeping, with all that going on?' },
    { id: 'safe', when: (m) => m.d >= 1, top: 'safeplace', q: 'Is there anywhere that feels safe to you right now? A place, or a person?' },
    { id: 'food', when: (m) => m.k.mombusy || m.k.care, top: 'food', q: 'Are you eating okay? Real meals, I mean, not vending machine dinners.' },
    { id: 'talkTo', when: () => true, top: 'friends', q: 'Who do you talk to when it gets bad?' },
    { id: 'scale', when: (m) => m.d === 0, top: 'scale', q: 'On a scale of 1 to 10, how\'s this week been? No wrong answer.' },
    { id: 'good', when: () => true, top: 'good', q: 'What\'s one thing this week that didn\'t suck? Even something tiny.' },
    { id: 'home', when: (m) => m.d === 0 && !HOMEISH.some((t) => m.k[t]), top: 'home', q: 'How are things at home lately?' },
    { id: 'fun', when: () => true, top: 'fun', q: 'What do you do when you want to stop thinking for a while?' },
    { id: 'school', when: (m) => !m.k.school, top: 'school', q: 'How\'s school feeling? Not grades. Just school.' },
  ];
  function nextQ(c, m) {
    for (const x of QUEUE) {
      if (m.asked[x.id] || !x.when(m) || blocked(c, x.top) || (x.top !== 'care2' && m.k[x.top])) continue;
      if (x.top === 'home' && (blocked(c, 'rick') || knows(m, 'drink') || knows(m, 'yell'))) continue;
      m.asked[x.id] = 1; m.pq = x.id; return x.q;
    }
    m.pq = null; return '';
  }

  function processAnswer(an, m) {
    const t = an.t, gm = SH.f('grandmaAddr') || m.k.grandma || past().grandma;
    if (/\b(taken|foster|take me away|put me somewhere)\b/.test(t)) return 'That\'s almost never the first step. Usually a caseworker talks to you and your family and makes a plan so home is safe. And if home can\'t be safe, the first choice is family' + (gm ? ', like your grandma' : '') + ', not strangers.';
    if (/\b(rick|he|him)\b.*\b(find out|know|mad|angry)\b|\bwill (rick|he) (find out|know)\b/.test(t)) return 'Your safety is the first thing everyone plans around. I will not send you home to a situation where you\'re in danger because you talked to me. If it\'s not safe to go home, you don\'t go home tonight.';
    if (/\bmom\b.*\b(trouble|find out|know|mad)\b/.test(t)) return 'The point isn\'t to punish your mom. It\'s to get your family help. Honestly? A lot of moms are relieved when someone finally says it out loud.';
    if (/\bmandated|what does that mean\b/.test(t)) return 'Mandated reporter means if a student might not be safe, I\'m required to tell people whose job is keeping kids safe. It\'s not a punishment. It\'s the law making sure nobody looks away.';
    return 'Honest version: I call the people whose job is keeping kids safe. Someone might come talk to you, here or at home. You can tell them the truth, and what you\'re scared of. You\'re not in trouble. Nothing you say is "getting someone in trouble." Rick\'s choices are his.';
  }

  function brain(an, c) {
    const G = SH.G, m = S(c), t = an.t, tp = an.tset || {};
    c._fb = false;
    if (!m.init) { m.init = 1; if (SH.f('toldCounselor')) m.rep = 'done'; }
    if (an.has('selfharm')) return old(an, c);

    // learn details
    const fresh = [];
    ['drink', 'yell', 'violence', 'mombusy', 'care', 'sleep', 'food', 'tyler', 'run', 'rick', 'mom', 'lily', 'grandma', 'friends', 'school', 'art', 'games'].forEach((k) => { if (tp[k] && !m.k[k]) { m.k[k] = 1; fresh.push(k); } });
    if (/\b(don'?t|never|can'?t) (really )?sleep\b|\bup all night\b|\bnightmares?\b/.test(t)) { if (!m.k.sleep) fresh.push('sleep'); m.k.sleep = 1; }
    const hard = tp.violence || /\b(scared of (him|rick)|afraid of (him|rick)|not safe|unsafe|abuse)\b/.test(t);
    if (tp.drink || tp.yell || hard || (tp.rick && an.sent < 0)) m.d++;

    // 1) "what happens if I tell?" — always honest, never deflected
    if (tp.process) return R(processAnswer(an, m) + (m.rep === 'asked' ? ' So. Can we do this together?' : ''), { rel: 4, stress: -4 });

    // 2) consent after the mandated-reporter talk
    if (m.rep === 'asked') {
      if (an.has('yes') || (an.I && an.I.agree && an.len <= 6) || /^(ok|okay|fine|sure|alright|i guess|yeah|yes|yea|ya|that'?s (ok|okay|fine)|we can|let'?s do it|do it)\b.{0,12}$/.test(t)) {
        m.rep = 'yes'; SH.flag('okaforConsent'); m.pq = 'safeSpot';
        return R('Okay. Thank you for trusting me. We\'ll make the call together after this. Right now let\'s plan for tonight: if it gets loud at home, where in the house do you feel safest?', { rel: 8, stress: -8 });
      }
      if (an.has('no') || an.has('secret') || /\b(don'?t|do not|please don'?t) (call|tell)|make it worse|he'?ll (kill|hurt)/.test(t)) {
        m.rep = 'scared'; m.pq = 'fear';
        return R('I hear you. I\'m not going to trick you, and I won\'t do anything behind your back. I also can\'t un-hear it, and honestly I wouldn\'t want to. What\'s the scariest part about me calling?', { rel: 3 });
      }
    }
    // 3) answers to her own last question
    if (m.pq === 'safeSpot' && an.len >= 1 && !an.q) { m.pq = 'who'; SH.flag('safetyPlan'); SH.flag('okaforCard'); const pl = (t.match(/\b(my room|the closet|closet|bathroom|under (my|the) bed|jordan'?s( house)?|mrs\.? patel'?s|the library|outside|the park|the roof|lily'?s room|my sister'?s room|the car|the porch|nowhere|no ?where|school)\b/) || [])[0]; return R(`${pl ? (/no ?where/.test(pl) ? 'Nowhere. Okay. That tells me a lot, and it\'s exactly why we\'re making this plan.' : cap(pl) + '. Good.') : tp.friends ? 'With someone you trust. Good, a person counts.' : 'Okay.'} And if it's not safe even there, who could you call? Here, I'm writing my cell on this card. Day or night.`, { rel: 4, stress: -5 }, { narr: 'She hands you a card with a phone number on the back.', give: 'card' }); }
    if (m.pq === 'who' && !an.q) { m.pq = null; return R('Okay. Keep that in your head, and keep my card somewhere Rick won\'t find it. You did something really hard today. I mean that.', { rel: 4, stress: -6 }); }
    if (m.pq === 'fear' && !an.q) { m.pq = null; return R('That makes sense. Being scared of what happens next is normal, it doesn\'t mean you did something wrong. Here\'s my promise: every step, I tell you before it happens. You won\'t be surprised by anything.', { rel: 4, stress: -4 }); }
    if (m.pq === 'scale') { const n = +((t.match(/\b(10|[0-9])\b/) || [])[1]); if (!isNaN(n)) { m.pq = null; m.scale = n; return R(n <= 3 ? `A ${n}. That's a rough week. What made it a ${n}?` : n <= 6 ? `A ${n}. Kind of in the middle. What would've made it a ${n + 2}?` : `A ${n}! Okay, I'll take it. What went right?`, { rel: 2 }); } }

    // 4) disclosure: reflect THEIR specifics, then either report honestly or ask the next real question
    const disc = fresh.filter((k) => DETAIL[k] && k !== 'run' && k !== 'tyler');
    if (hard || disc.length || (m.d >= 1 && (an.has('disclose') || an.has('scared')))) {
      if ((hard || m.d >= 3) && !m.rep) {
        SH.flag('toldCounselor'); SH.flag('knowsHarbor'); m.rep = 'asked';
        const NOT = { drink: 'the drinking', yell: 'the yelling', violence: /\bthr(ow|ew)/.test(t) ? 'him throwing things' : 'him getting physical' };
        const what = ['drink', 'yell', 'violence'].filter((k) => m.k[k]).map((k) => NOT[k]);
        m.repTurn = c.turn;
        return R(`Thank you for telling me. ${what.length ? 'What you just described, ' + joinL(what) + ', is not okay. And none of it is your fault. ' : ''}I believe you. I want to be honest with you, because you deserve honesty: when a student tells me they might not be safe at home, I have to let people whose job is to help know. That's called being a mandated reporter. I won't do it behind your back. We'll do it together, and you'll have a say. Is that okay?`, { rel: 12, stress: -12 });
      }
      const bits = disc.map((k) => DETAIL[k]);
      const lead = bits.length ? (once(m, 'lead', [`So ${joinL(bits)}.`, `Okay. ${cap(joinL(bits))}.`, `Let me make sure I've got it: ${joinL(bits)}.`, `${cap(joinL(bits))}. I'm holding onto that.`]) || `${cap(joinL(bits))}.`) + ' ' + once(m, 'weight', ['That\'s a lot to carry.', 'That\'s heavy for anyone, let alone a twelve-year-old.', 'Thank you for saying it out loud.', 'I\'m glad you told me.']) : once(m, 'hear', ['I hear you.', 'That sounds really hard.', 'Okay. I\'m listening.']) || 'I hear you.';
      const pastBits = ['drink', 'yell', 'violence', 'mombusy', 'care', 'sleep'].filter((k) => !disc.includes(k) && !m.k[k] && knows(m, k));
      let lead2 = lead;
      if (pastBits.length && !m.pastRef) { m.pastRef = 1; pastBits.forEach((k) => (m.k[k] = 1)); const PL = { violence: 'things getting physical', drink: 'Rick\'s drinking', yell: 'the yelling', sleep: 'not sleeping', care: 'looking after Lily', mombusy: 'your mom\'s long shifts' }; const top2 = ['violence', 'drink', 'yell', 'sleep', 'care', 'mombusy'].filter((k) => pastBits.includes(k)).slice(0, 2); lead2 = `Last time you told me about ${joinL(top2.map((k) => PL[k]))}. Now this. ` + lead.replace(/^(So|Okay\.) /, ''); }
      if (m.rep === 'done' && hard && !m.doneRef) { m.doneRef = 1; lead2 += ' I\'m going to add this to what I already reported, so the caseworker knows it\'s still happening.'; }
      let q = nextQ(c, m);
      if (m.rep === 'asked' && c.turn - m.repTurn >= 2 && !m.reAsked) { m.reAsked = 1; q = 'And about what I said before, making that call together. Is that okay with you?'; }
      return R(lead2 + (q ? ' ' + q : ''), { rel: 4, stress: -3 });
    }

    // 5) running away: the Harbor House card (once), then gentler follow-ups
    if (an.has('run') || tp.run) {
      if (!m.ranTalk) { m.ranTalk = 1; SH.flag('knowsHarbor'); SH.flag('okaforCard'); return R('It sounds like part of you wants to be anywhere but home. That makes sense to me. Can I tell you about some options that aren\'t "disappear"? There\'s a place called Harbor House, by the river. Kids can go there. And there\'s me. I\'m writing my cell on this card.', { rel: 6 }, { narr: 'She hands you a card. You now know about Harbor House.', give: 'card' }); }
      return R('I hear that. When you picture leaving, what are you getting away FROM, most?', { rel: 2 });
    }
    // 6) Tyler
    if (an.has('bully') || tp.tyler) {
      if (!m.bully && !SH.f('okaforBully')) { m.bully = 1; SH.flag('okaforBully'); return R('Tyler Brandt. I\'ve heard that name before. I\'m going to talk to his teachers and move his lunch period. You shouldn\'t have to manage that alone.', { rel: 6, stress: -5 }); }
      m.bully = 1; return R(once(m, 'ty', ['I talked to his teachers. Has it gotten better, worse, or just sneakier?', 'Is he doing it where adults can see, or where they can\'t?']) || 'I\'m keeping an eye on Tyler. Tell me if anything changes.', { rel: 2 });
    }
    // 7) good news — celebrate it, don't pivot to problems
    if (tp.good || (an.I && (an.I.proud || an.I.happy))) {
      const gr = /\bgot an? (a|b)\b/.test(t);
      if (gr) { G.grades = Math.min(100, (G.grades || 50) + 1); }
      return R((gr ? 'Wait. On a week like yours? That\'s real. ' : once(m, 'yay', ['Okay, I love that. ', 'Look at you. ', 'That made my day, honestly. ']) || 'Good. ') + once(m, 'yayq', ['What was the best part?', 'Who else did you tell?', 'How did it feel?']), { rel: 4, mood: 4 });
    }
    // 8) facts about you (art, dreams, grandma, pets…)
    const f = (an.facts || [])[0];
    if (f) {
      if (f.kind === 'dream') return R(`${cap(f.v)}. I can see that. What made you want that?`, { rel: 3 });
      if (f.kind === 'skill' || tp.art) return R(once(m, 'art', ['You draw? What do you draw: people, places, or things that don\'t exist?', 'That\'s a real skill. Do you show people, or keep it to yourself?']) || `${cap(f.v || 'that')}. Nice.`, { rel: 3 });
      if (f.kind === 'miss' || tp.grandma) return R(tp.grandma ? 'Tell me about your grandma. Is she someone you could call, if you ever needed to?' : `You miss ${f.v}. What do you miss most?`, { rel: 3 });
      if (f.kind === 'pet') return R(`${cap(f.v)}! Okay, I need to hear about this pet.`, { rel: 2 });
    }
    if (tp.grandma) return R(once(m, 'gm', ['Tell me about your grandma. Is she someone you could call, if you ever needed to?', 'She sounds important to you. When did you last talk to her?']) || 'Your grandma sounds like a good person to have.', { rel: 3 });
    if (tp.art && !m.artTalk) { m.artTalk = 1; return R('You draw? What do you draw: people, places, or things that don\'t exist?', { rel: 3 }); }
    // friends: Jordan matters a lot here
    if (tp.friends && !m.friendTalk) { m.friendTalk = 1; m.asked.talkTo = 1; const j = /jordan/.test(t); return R(j ? 'Jordan. I\'m really glad you have Jordan. Does Jordan know any of this?' : 'I\'m glad you have someone. Do they know how things are for you?', { rel: 3 }); }
    // 9) school — only "your grades dropped" if they're actually bad and she hasn't said it
    if (tp.school && !m.gradeTalk && (an.sent < 0 || /\b(fail|failing|bad|hate|suck|behind|f\b|d\b)\b/.test(t))) { m.gradeTalk = 1; return R('Your grades dropped this quarter. That usually isn\'t about math. What changed?', {}); }
    // 10) feelings without a home detail
    if (an.has('sad') || an.has('angry') || an.has('tired') || an.has('scared') || tp.feelings) {
      const r = N.reflect(an.t);
      return R((r && !/^you (miss|love|like)\b/i.test(r) ? cap(r) + '. ' : '') + (once(m, 'feel', ['What\'s been the hardest part?', 'Where do you feel it most: school, home, somewhere else?', 'You\'re allowed to feel that. What would help, even a little?', 'How long has it felt like this?']) || nextQ(c, m) || 'I\'m here.'), { rel: 4, stress: -4 });
    }
    // 11) short / deflecting answers
    if (an.has('deflect') || an.has('no') || (an.I && an.I.idk) || /^(fine|ok|okay|good|nothing|nm|idk|whatever|i guess|i'?m (fine|good|ok|okay)( i guess)?|fine i guess|its fine|it'?s whatever)[.! ]*$/.test(t)) {
      m.def++;
      if (m.def === 1) { m.asked.scale = 1; m.pq = 'scale'; return R('"Fine" is a big word in this room. On a scale of 1 to 10, how\'s this week really been?', {}); }
      if (m.def === 2) return R('That\'s okay. We can just sit here a minute. You don\'t owe me a story.', { stress: -2 });
      if (!SH.f('okaforCard')) { SH.flag('okaforCard'); return R('Here: my card. My cell is on the back. My door is always open, even when it looks closed. We can also just sit.', { rel: 3 }, { give: 'card' }); }
      return R(once(m, 'quiet', ['Okay.', 'Take your time.', 'I\'m not going anywhere.']) || 'Okay.', {});
    }
    if (an.has('hostile')) return R(once(m, 'host', ['You\'re allowed to be angry. Even at me. I\'m not going anywhere.', 'Okay. Be mad. I can handle it.']) || 'Okay.', { rel: 1 });
    if (an.has('joke')) return R(once(m, 'joke', ['Ha. Humor\'s a good shield. I use it too. What\'s it shielding?', 'Okay, that was funny. I\'m still going to ask how you are.']) || 'Ha.', { rel: 2 });
    if (an.has('thanks') || /\b(thanks|thank you|thx)\b/.test(t)) return R(once(m, 'ty', ['Of course. That\'s what I\'m here for.', 'Thank YOU. That took guts.']) || 'Anytime.', { rel: 2 });
    if (an.has('bye')) return R(m.d ? 'Okay. Remember: my door\'s open, and you did nothing wrong. Come back anytime.' : 'Okay. Come back anytime. I mean that.', {}, { end: true });

    // 12) anything else: brief reflection + the next unasked question (questions about HER go to memory/opinions)
    c._fb = !!(an.q || an.opq || an.memq);
    const r = an.len >= 4 ? N.reflect(an.t) : null;
    const q = nextQ(c, m);
    const lead = r && !/^you (miss|love|like|hate)\b/i.test(r) ? cap(r) + '.' : (an.len >= 4 ? once(m, 'ack', ['Okay.', 'Mm.', 'I hear you.', 'Got it.']) || 'Okay.' : '');
    return R((lead + ' ' + (q || once(m, 'open', ['I\'m listening. Whatever you want to say next is fine.', 'Take your time. There\'s no wrong answer in here.']) || 'I\'m here.')).trim(), { rel: 1 });
  }
  SH.Brain.okafor = brain;
})(window.SH);
