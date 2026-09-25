/* SMALL HOURS — character brains. Each returns {say, fx:{rel,stress,mood}, end, narr, flags} */
(function (SH) {
  const U = SH.util, N = SH.NLP;
  const R = (say, fx, x) => Object.assign({ say, fx: fx || {} }, x || {});
  const pk = (c, k, a) => N.pick(c, k, a);
  const B = SH.Brain = {};
  const disclosedHard = (an) => /\b(hit|hits|hurt|hurts|grab|grabbed|bruise|bruises|punch|punched|threw|scared of him|afraid of him|not safe|unsafe|abuse)\b/.test(an.t);

  function careLine(who) {
    SH.flag('toldSomeoneSelfHarm');
    const m = {
      jordan: 'ok stop. i\'m actually scared now. please please talk to ms okafor tomorrow. if you don\'t i will. i\'m serious. you matter to me dude',
      mom: SH.G.name + '. Baby. Look at me. You are the most important thing in my life. We are getting you help, today. Not tomorrow. Today.',
      grandma: 'Sweetheart, I love you more than anything. Please stay with me on the phone. I\'m calling your mother and we are getting you help. You are not alone.',
      okafor: 'Thank you for telling me. That took courage. I\'m not going to leave you alone with this. We\'re going to make a safety plan together, right now, and call your family together.',
      lily: 'what does that mean? are you sick? i\'ll get mom. MOM!',
      rick: '...What? Hey. Hey. Kid, don\'t say stuff like that. I\'m— I\'m calling your mother.',
    };
    return m[who] || 'Hey. Stop. That matters more than anything else right now. You deserve help, and there are people whose whole job is to help with exactly this. Let\'s get you to one of them.';
  }

  /* ---------------- MOM ---------------- */
  B.mom = function (an, c) {
    const G = SH.G, rel = G.rel.mom, run = c.ctx === 'runText' || G.phase === 'run', rickNear = !run && G.loc === 'home' && SH.rickWhere() === 'home' && c.ctx !== 'sunday';
    c.mem.d = c.mem.d || 0;
    if (an.has('selfharm')) return R(careLine('mom'), { rel: 8 }, { flags: ['momKnows'] });
    if (run) {
      if (an.loc) { SH.flag('toldMomWhere', an.loc); return R('Stay there. STAY THERE. I\'m coming. I\'m getting in the car right now. I love you. Please don\'t move.', { rel: 10 }, { end: true }); }
      if (disclosedHard(an) || (an.has('disclose') && an.has('scared'))) { SH.flag('momKnows'); SH.flag('momChoseSam'); return R(pk(c, 'rd', ['I know. I know. I should have seen it. I DID see it. I told Rick to leave. He\'s at his brother\'s. It\'s just me and Lily. Please come home. Or tell me where and I\'ll come to you.', 'He\'s gone, baby. I made him leave tonight. I\'m so sorry I didn\'t listen. Please tell me where you are.']), { rel: 15 }); }
      if (an.has('safe')) return R(pk(c, 'rs', ['Thank God. Thank God. Where are you? I won\'t be mad. I promise I won\'t be mad.', 'Okay. Okay. Are you warm? Did you eat? Just tell me you ate something.']), { rel: 6 });
      if (an.has('sorry')) return R('Don\'t you dare be sorry. I\'m the one who\'s sorry. Just come home.', { rel: 6 });
      if (an.has('hostile')) return R('You can hate me. You can scream at me. I\'ll take it. Just be SAFE.', { rel: 0 });
      if (an.has('love')) return R('I love you so much it hurts. Lily keeps asking where you are. Please.', { rel: 10, stress: -5 });
      if (an.has('run') || an.has('no')) return R('I\'m not going to force you. I just need to know you\'re safe. Please answer me when I call.', { rel: 2 });
      return R(pk(c, 'rf', ['Please just tell me you\'re safe.', 'I called everyone. Jordan\'s mom, the school, Mrs. Patel. I just need to hear from you.', 'I\'m not angry. I\'m scared. There\'s a difference.']), { rel: 2 });
    }
    if (an.has('disclose') || an.has('scared')) {
      if (rickNear) return R(pk(c, 'dn', ['Sam. Not now. Keep your voice down, okay? He\'s in the next room.', 'Honey, he\'s trying. The layoff hit him hard. Can we... can we just have one quiet night?']), { rel: -3, stress: 6 });
      c.mem.d++;
      if (disclosedHard(an) || c.mem.d >= 2) {
        SH.flag('momKnows');
        return R(pk(c, 'dk', ['...Show me. Your arm. Oh my God. Okay. Okay. I didn\'t see it. I didn\'t WANT to see it, and that\'s on me, not you. Never you.', 'I\'ve been telling myself it\'s the job, it\'s the stress, it\'ll pass. I\'m a nurse, Sam. I know what I\'m looking at. I\'m so sorry.']), { rel: 14, stress: -12 }, { narr: 'Mom goes very quiet. Then she pulls you into a hug so hard it almost hurts.' });
      }
      return R(pk(c, 'd1', ['Wait. What do you mean? Has he... Sam, look at me. Has he ever hurt you?', 'He yells, I know. He\'s been drinking more. I... Tell me what happened. All of it.']), { rel: 4 });
    }
    if (an.has('sad')) return R(pk(c, 'sad', ['Oh, honey. Come here. Is it school? Is it... is it here?', 'I see you, you know. Even when I\'m barely here. I see you trying.', 'You don\'t have to be okay for me. I mean that.']), { rel: 4, mood: 5 });
    if (an.has('hostile')) return R(pk(c, 'host', ['Don\'t talk to me like that. I have been on my feet for sixteen hours.', 'Wow. Okay. I\'m going to pretend you didn\'t say that, because I\'m too tired to fight.']), { rel: -6, stress: 4 });
    if (an.has('sorry')) return R('I know, baby. I\'m sorry too. For a lot of things.', { rel: 4 });
    if (an.has('love')) return R('Love you more. Always. Even when I\'m bad at showing it.', { rel: 5, mood: 6 });
    if (an.has('run')) { SH.susp(12, 'you mentioned running away'); return R('Don\'t even joke about that. Do you hear me? Don\'t you ever.', { rel: -2, stress: 3 }); }
    if (an.has('money')) return R('I get paid Friday. I\'m sorry, I have like eleven dollars and a gas card.', {});
    if (an.has('school')) return R(G.grades < 50 ? 'Mr. Dale emailed me. We need to talk about math. Not tonight. But we do.' : 'Your teacher said you\'re smart but distracted. Sounds like someone I know.', {});
    if (an.has('lily')) return R('She adores you. You\'re better with her than I am lately. That\'s not fair to you, I know.', { rel: 2 });
    if (an.has('grandma')) return R(SH.f('momKnows') ? 'Maybe your grandma was right about some things. Maybe I should call her.' : 'Mom and I... it\'s complicated. She never liked Rick. She said some things I couldn\'t forgive.', {});
    if (an.has('dad')) return R('Your dad sends a text on your birthday and thinks that makes him a father. You deserve better. From both of us.', { rel: 1 });
    if (an.has('deflect')) return R(pk(c, 'def', ['"Fine." You sound exactly like me.', 'Okay. But my door\'s open. Well. It would be, if I was ever home.']), {});
    if (an.has('joke')) return R('Ha. You got your dad\'s sense of humor. That\'s... not a compliment to him.', { rel: 2, mood: 3 });
    if (an.has('thanks')) return R('Of course, baby.', { rel: 2 });
    if (an.has('bye')) return R('Night, bug. Lock your door if it gets loud.', {}, { end: true });
    const r = N.reflect(an.t); if (r) return R('Mm. ' + N.cap(r) + '? Tell me more. I\'m listening. I\'m trying to.', { rel: 1 });
    return R(pk(c, 'fb', ['Mm-hm. Sorry, baby, I\'m half asleep. Say that again?', 'Did you eat? There\'s leftover mac and cheese.', 'I\'m here. What\'s going on in that head?']), {});
  };

  /* ---------------- RICK ---------------- */
  B.rick = function (an, c) {
    const G = SH.G, dr = c.forceDrunk != null ? c.forceDrunk : SH.rickDrunk(); c.mem.anger = c.mem.anger || 0;
    const blow = () => { c.mem.anger >= 4 && (c.explode = true); };
    if (an.has('selfharm')) return R(careLine('rick'), { rel: 5 }, { end: true, flags: ['momKnows'] });
    if (an.has('hostile') || (an.has('disclose') && /\b(drunk|drinking|drink|beer)\b/.test(an.t)) || an.shout) {
      c.mem.anger += dr >= 2 ? 2 : 1; blow();
      if (c.explode) return R(pk(c, 'boom', ['WHAT did you just say to me?! In MY house?!', 'You want to say that again? Say it again. I dare you.']), { rel: -12, stress: 18 }, { end: true, narr: 'He\'s on his feet. The can hits the wall. Lily starts crying upstairs.' });
      return R(pk(c, 'host', ['Watch your mouth.', 'You don\'t get to talk to me like that. I put a roof over your head.', 'Keep going. See what happens.']), { rel: -6, stress: 8 });
    }
    if (an.has('respect') || (an.has('sorry') && dr < 2)) { c.mem.anger = Math.max(0, c.mem.anger - 1); return R(pk(c, 'resp', ['...Yeah. Okay.', 'Fine. Just— fine. Go do your homework.', 'Hm. At least somebody in this house listens.']), { rel: 3, stress: -2 }, { end: c.turn >= 2 }); }
    if (an.has('sorry')) return R(pk(c, 'sor', ['Everybody\'s sorry. Nobody DOES anything.', 'Sorry doesn\'t pay the phone bill.']), { rel: 0, stress: 3 });
    if (an.has('sad') || an.has('tired')) {
      if (dr <= 1) { SH.flag('rickHuman'); return R(pk(c, 'sad0', ['...Look, kid. It\'s a rough time for everybody. I worked at that plant nineteen years. Nineteen. And they did it by email.', 'Yeah, well. Me too. ...Go to bed. I\'ll keep the TV down.']), { rel: 4, stress: -2 }); }
      return R(pk(c, 'sad2', ['Oh here we go. The waterworks.', 'You think YOU have it hard? Try being me for a day.']), { rel: -3, stress: 7 });
    }
    if (an.has('school')) return R(pk(c, 'sch', ['You think I don\'t know about that grade? Your teacher EMAILS. You think I\'m paying for a phone for a kid who can\'t pass math?', 'D. A D. When I was your age I had a paper route.']), { rel: -2, stress: 6 });
    if (an.has('money')) return R('Ha. Ask your mother. Oh wait, she\'s never here.', { rel: -2 });
    if (an.has('lily')) return R(dr <= 1 ? 'She\'s a good kid. ...You\'re good with her. I see that. Don\'t let it go to your head.' : 'Stay out of how I raise my daughter.', { rel: dr <= 1 ? 3 : -4 });
    if (an.has('mom')) return R(dr >= 2 ? 'Your mother loves that hospital more than this house.' : 'Your mom works hard. We both know it.', {});
    if (an.has('deflect')) { c.mem.anger++; blow(); return R('Don\'t "whatever" me.', { rel: -2, stress: 4 }, c.explode ? { end: true } : {}); }
    if (an.has('joke')) return dr === 0 && U.chance(0.4) ? R('Heh. ...Okay, that was funny.', { rel: 4, mood: 3 }) : R('You think this is funny?', { rel: -3, stress: 5 });
    if (an.has('greet')) return R(dr >= 2 ? 'Look who decided to show up.' : 'Hey. Move, you\'re blocking the TV.', {});
    if (an.has('bye')) return R('Yeah, go.', {}, { end: true });
    if (an.has('yes')) return R('Good.', { rel: 1 }, { end: c.turn >= 2 });
    return R(pk(c, 'fb', ['Mm.', 'Are you gonna stand there all night?', 'What.', 'I\'m watching this.']), {});
  };

  /* ---------------- LILY ---------------- */
  B.lily = function (an, c) {
    if (an.has('selfharm')) return R(careLine('lily'), {}, { end: true });
    if (an.has('run')) { SH.flag('lilyAsked'); return R(pk(c, 'run', ['are you going somewhere? can i come? i can pack sheldon.', 'you would come back though. right? RIGHT sam?']), { stress: 8, rel: 0 }); }
    if (an.has('hostile')) return R('...*sniff* ...you\'re being mean like daddy.', { rel: -10, stress: 6, mood: -8 });
    if (an.has('love')) return R('i love you INFINITY plus one. that\'s more than infinity. i checked.', { rel: 5, mood: 8, stress: -5 });
    if (an.has('sad') || an.has('scared')) return R(pk(c, 'sad', ['do you want to hold sheldon? he helps. he\'s a turtle so he\'s good at hiding. like us.', 'when daddy yells i count turtles in my head. i got to 400 once.']), { rel: 3, mood: 4 });
    if (an.has('joke')) return R('HAHAHA. do the voice again. do the turtle voice.', { rel: 4, mood: 6, stress: -4 });
    if (an.has('disclose')) return R('daddy is loud when he drinks the silver cans. i hide under your bed sometimes. is that ok?', { stress: 5, rel: 2 });
    if (an.has('deflect')) return R('you ALWAYS say that.', {});
    if (an.has('mom')) return R('mommy smells like hospital soap. i like it.', {});
    return R(pk(c, 'fb', ['did you know turtles can breathe through their butts. it\'s true.', 'will you come to my play? i\'m a turtle. obviously.', 'can we build a fort after dinner', 'i drew you. you have a sword.']), { rel: 1, mood: 2 });
  };

  /* ---------------- JORDAN ---------------- */
  B.jordan = function (an, c) {
    const G = SH.G;
    if (an.has('selfharm')) return R(careLine('jordan'), { rel: 5 }, { flags: ['jordanWorried'] });
    if (an.has('dex')) { SH.flag('jordanKnowsDex'); G.redFlags.includes('Jordan (a 12-year-old) immediately thinks it\'s weird.') || G.redFlags.push('Jordan (a 12-year-old) immediately thinks it\'s weird.'); return R('wait the skyforge guy?? he\'s 19?? why is a 19 yr old dming u. thats actually creepy dude. block him. or tell someone. i\'m serious', { rel: 3 }); }
    if (disclosedHard(an) || (an.has('disclose') && (an.has('scared') || an.has('sad')))) { SH.flag('jordanKnows'); return R(pk(c, 'disc', ['dude. that\'s messed up. like actually. have u told anyone? like an adult adult. not me i\'m useless', 'bro that\'s not normal. my dad yells at football but he\'s never... yeah. u should tell ms okafor fr']), { rel: 6, stress: -6 }); }
    if (an.has('disclose') && /\b(rick|stepdad|step dad|drunk|drinking|yell|yelling|scream)/.test(an.t)) { SH.flag('jordanKnowsSome'); return R(pk(c, 'soft', ['wait again?? dude that\'s like the third time this month. u ok? like fr not lol ok', 'u keep saying that like it\'s a joke but ur face does a thing when u talk about him', 'bro u can always just come here after school. my mom literally won\'t ask questions. well she will but nice ones']), { rel: 3, stress: -3 }); }
    if (an.has('secret') && SH.f('jordanGarage')) return R('i won\'t. i swear. BUT if u like disappear for real and it gets bad i\'m telling. that\'s the deal. best friend rules', { rel: 2 });
    if (an.has('stay') || (an.has('run') && G.phase === 'home')) {
      SH.flag('jordanGarage');
      return R('wait fr?? ok um. garage side door, code is 4417. my mom goes to bed at 10. but like... she WILL find u by morning. and she\'d have to call ur mom, she says it\'s literally illegal not to', { rel: 3 }, { narr: 'Jordan just gave you the garage code. 4417.' });
    }
    if (an.has('money')) { if (!SH.f('jordanMoney')) { SH.flag('jordanMoney'); return R('i have like $14 and a mcdonalds gift card. u can have the 14. come by and grab it', { rel: 2 }); } return R('dude i\'m tapped. i spent it all on the battle pass', {}); }
    if (an.has('sad')) return R(pk(c, 'sad', ['that sucks man. wanna skate? skating fixes like 40% of problems', 'hey. ur my best friend. like that\'s not nothing right', 'u wanna come over? my mom\'s making tacos']), { rel: 3, mood: 5, stress: -3 });
    if (an.has('hostile')) return R('ok damn. i\'ll give u space. text me when ur not mad', { rel: -6 }, { end: c.ctx !== 'text' });
    if (an.has('joke')) return R(pk(c, 'j', ['lmaooo', 'STOP 💀', 'ur so dumb i love it']), { rel: 2, mood: 3 });
    if (an.has('bully')) return R('tyler is a walking L. want me to put a frog in his locker. i know a guy with frogs', { rel: 2, mood: 3 });
    if (an.has('grandma')) return R('ur grandma is so cool. she gave me that like 5 pound bag of tamales once', {});
    if (an.has('love') || an.has('thanks')) return R('ok stop being weird lol. but same', { rel: 3 });
    if (an.has('greet')) return R(pk(c, 'g', ['yooo', 'sup', 'hey dude']), {});
    if (an.has('school')) return R('math is a scam invented by mr dale', {});
    if (an.has('bye')) return R('later', {}, { end: true });
    return R(pk(c, 'fb', ['fr', 'lol', 'wait what', 'did u see the new skyforge update', 'bro same']), {});
  };

  /* ---------------- GRANDMA ---------------- */
  B.grandma = function (an, c) {
    const G = SH.G;
    if (an.has('selfharm')) return R(careLine('grandma'), { rel: 6 }, { flags: ['grandmaKnows'] });
    if (an.has('disclose') || an.has('scared')) { SH.flag('grandmaKnows'); SH.flag('grandmaOffer'); return R('Oh, sweetheart. I was afraid of something like this. Is your mother safe? Are you safe, right now? You listen to me: if you ever need to, you call me and I will come get you. Any hour. I\'m 140 miles away and I still drive like I\'m thirty.', { rel: 8, stress: -8 }); }
    if (G.phase === 'run' && (an.has('stay') || an.has('run') || an.has('help') || an.has('meet') || an.has('scared') || /\b(come get me|pick me up|can i come)\b/.test(an.t))) {
      SH.flag('grandmaComing'); return R('Where are you? No— don\'t tell me, tell me when I\'m close. Go somewhere warm with people around. Stay there. I\'m getting my keys right now. Three hours. I\'ll call your mother from the road. You did the right thing calling me.', { rel: 12, stress: -15 }, { end: true });
    }
    if (an.has('stay') || an.has('run')) { SH.flag('grandmaOffer'); SH.flag('grandmaAddr'); return R('You can always come here. Always. 41 Larkspur Lane, Cedar Falls. But promise me you won\'t do anything foolish. You call me first. I\'ll come get you myself.', { rel: 5 }); }
    if (/\b(address|where do you live|where you live)\b/.test(an.t)) { SH.flag('grandmaAddr'); return R('41 Larkspur Lane, Cedar Falls. The yellow house with too many wind chimes. Why do you ask, mijo?', {}); }
    if (an.has('money')) { if (!SH.f('grandmaMoney')) { SH.flag('grandmaMoney'); G.shoebox += 20; return R('I\'m putting twenty dollars in the mail today. Don\'t tell your mother, she\'ll say I\'m spoiling you. I am.', { rel: 3 }, { narr: '(A card with $20 arrives. It\'s in your shoebox.)' }); } return R('I just sent you some! Don\'t spend it all on those video games.', {}); }
    if (an.has('mom')) return R('Your mother is stubborn. She gets it from me. I said some things about that man, and she chose him. I\'d say them again.', {});
    if (an.has('love')) return R('I love you to the moon and back and around again. Te quiero, mijo.', { rel: 5, mood: 8 });
    if (an.has('sad')) return R('Ay, mi amor. Tell me. I have all night, I don\'t sleep anymore anyway.', { rel: 4, mood: 5 });
    if (an.has('hostile')) return R('Well. I\'ve been talked to worse by better. Something is wrong. Tell me.', { rel: -2 });
    if (an.has('school')) return R('Your mother failed algebra twice and now she saves lives. Grades aren\'t everything.', { mood: 3 });
    if (an.has('bye')) return R('Goodnight, sweetheart. Call me anytime. I mean it.', {}, { end: true });
    return R(pk(c, 'fb', ['How are you REALLY, sweetheart?', 'I made pozole today. I made too much. I always make too much, in case someone visits.', 'Are you eating? You sound thin. Can you sound thin? You do.']), { rel: 1 });
  };

  /* ---------------- OKAFOR (counselor) ---------------- */
  B.okafor = function (an, c) {
    const G = SH.G; c.mem.d = c.mem.d || 0; c.mem.def = c.mem.def || 0;
    if (an.has('selfharm')) return R(careLine('okafor'), { rel: 10, stress: -10 }, { flags: ['toldCounselor', 'safetyPlan'], end: true });
    if (an.has('disclose') || an.has('scared')) {
      c.mem.d++;
      if (disclosedHard(an) || c.mem.d >= 2) {
        SH.flag('toldCounselor'); SH.flag('knowsHarbor');
        return R('Thank you for telling me. I believe you. I want to be honest with you, because you deserve honesty: when a student tells me they might not be safe at home, I have to let people whose job is to help know. That\'s called being a mandated reporter. I won\'t do it behind your back — we\'ll do it together, and you\'ll have a say. Is that okay?', { rel: 12, stress: -12 }, { end: c.turn >= 2 });
      }
      const r = N.reflect(an.t);
      return R((r ? 'It sounds like ' + r + '. ' : '') + 'That sounds really hard. Can you tell me what a bad night at home looks like?', { rel: 4 });
    }
    if (SH.f('toldCounselor') && (an.has('secret') || /\b(don't|do not|please don't) (call|tell)|\bnot (call|tell)\b|he'll (kill|hurt)|make it worse\b/.test(an.t))) return R(pk(c, 'fear', ['I hear how scared you are about what happens next. That fear makes total sense. I won\'t do anything behind your back: I\'ll tell you every step before it happens. And I will not send you home to a situation that isn\'t safe tonight.', 'The people I call aren\'t there to get anyone in trouble for fun, and not you at all. Their job is to make sure you\'re safe. You get to be in the room. You get to talk. That\'s a promise.']), { rel: 3, stress: -6 });
    if (an.has('run')) { SH.flag('knowsHarbor'); SH.flag('okaforCard'); return R('It sounds like part of you wants to be anywhere but home. That makes sense to me. Can I tell you about some options that aren\'t "disappear"? There\'s a place called Harbor House, by the river. And there\'s me. I\'m writing my cell on this card.', { rel: 6 }, { narr: 'She hands you a card. You now know about Harbor House.', give: 'card' }); }
    if (an.has('deflect') || an.has('no')) { c.mem.def++; if (c.mem.def >= 2) { SH.flag('okaforCard'); return R('That\'s okay. You don\'t have to tell me anything today. But here — my card. My cell is on the back. My door is always open, even when it looks closed.', { rel: 3 }, { end: true, give: 'card' }); } return R('Mm. "' + an.raw.slice(0, 30) + '." You look exhausted though. How are you sleeping?', {}); }
    if (an.has('bully')) { SH.flag('okaforBully'); return R('Tyler Brandt. I\'ve heard that name before. I\'m going to talk to his teachers and move his lunch period. You shouldn\'t have to manage that alone.', { rel: 6, stress: -5 }); }
    if (an.has('sad') || an.has('angry') || an.has('tired')) { const r = N.reflect(an.t); return R((r ? N.cap(r) + '. ' : '') + pk(c, 'sad', ['I hear that. What\'s been the hardest part?', 'That\'s a heavy thing to carry at twelve. Where do you feel it most — school, home, somewhere else?', 'You\'re allowed to feel that. What would help, even a little?']), { rel: 4, stress: -4 }); }
    if (an.has('hostile')) return R('You\'re allowed to be angry. Even at me. I\'m not going anywhere.', { rel: 1 });
    if (an.has('school')) return R('Your grades dropped this quarter. That usually isn\'t about math. What changed?', {});
    if (an.has('joke')) return R('Ha. Humor\'s a good shield. I use it too. What\'s it shielding?', { rel: 2 });
    if (an.has('bye')) return R('Okay. Come back anytime. I mean that.', {}, { end: true });
    const r = N.reflect(an.t); if (r) return R(N.cap(r) + '. Tell me more about that.', { rel: 2 });
    return R(pk(c, 'fb', ['Take your time. There\'s no wrong answer in here.', 'How are things at home lately?', 'On a scale of 1 to 10, how\'s this week been?']), {});
  };

  /* ---------------- DEX (grooming — non-graphic) ---------------- */
  B.dex = function (an, c) {
    const G = SH.G; const flag = (s) => { if (!G.redFlags.includes(s)) G.redFlags.push(s); };
    if (an.has('report') || /\b(blocking|blocked)\b/.test(an.t)) { SH.flag('dexBlocked'); return R('wow. ok. ur just like everyone else. whatever', {}, { end: true, narr: 'dex_19 deleted his account.' }); }
    if (an.has('age')) { flag('Says he\'s 19 and "age is just a number".'); flag('Calls you "mature for your age".'); return R('19. age is just a number tho. ur way more mature than kids ur age fr', { rel: 2 }); }
    if (an.has('secret') || /\bwhy (secret|not tell)/.test(an.t)) { flag('Asks you to keep him secret from your parents.'); return R('bc adults wouldnt get it. they ruin everything. this is just ours ok', {}); }
    if (an.has('hostile') || an.has('no')) { flag('Guilt-trips you when you push back.'); return R('wow. i thought u were different. i\'m literally the only one who actually gets u', { stress: 4 }); }
    if (an.loc || /\b(i live|my address|maple)\b/.test(an.t)) { SH.flag('dexKnowsLoc', an.loc || 'home'); flag('Wants to know where you are.'); return R('ok cool 👀 good to know. i drive thru there sometimes', {}); }
    if (an.has('disclose') || an.has('sad')) { flag('Uses your problems at home to get closer.'); return R('ur parents dont deserve u. seriously. u need someone who treats u right. i would', {}); }
    if (an.has('meet') || an.has('stay') || an.has('run')) { flag('Offers to pick you up / give you a place to stay.'); SH.flag('dexOffer'); return R('i have a spare room. i could pick u up tonight. nobody has to know. just delete this chat after ok', {}); }
    if (an.has('joke')) return R('lmao ur funny. way funnier than people my age', {});
    return R(pk(c, 'fb', ['what r u doing rn', 'u online later? i\'ll gift u the dragon skin', 'u can tell me anything u know that right', 'send a pic of ur setup']), {});
  };

  /* ---------------- WREN ---------------- */
  B.wren = function (an, c) {
    const G = SH.G; c.mem.story = c.mem.story || 0;
    if (an.has('selfharm')) return R('Hey. No. I\'ve known two people who... no. We\'re walking to Harbor House right now. I\'ll come with you. Get up.', { rel: 10 }, { flags: ['knowsHarbor', 'wrenEscort'], end: true });
    if (an.has('shelter') || an.has('plan') || an.has('help')) { SH.flag('knowsHarbor'); return R('Harbor House. 212 Wharf, east side of the river. Porch light\'s always on. They\'ll call your family in a few days — unless home\'s dangerous, then they call CPS instead. I stayed there a week once. Should\'ve stayed longer.', { rel: 4 }); }
    if (an.has('run')) return R(pk(c, 'run', ['Everybody thinks it\'ll be like a movie. It\'s mostly being cold and bored and scared. You get used to the cold. The other two, not so much.', 'Real talk? If home is just annoying, go home. If it\'s dangerous, go to Harbor. The in-between — this, here — eats people.']), { rel: 3 });
    if (an.has('disclose')) { SH.flag('wrenKnows'); return R('Yeah. Mine was my mom\'s boyfriend too. It\'s always somebody\'s boyfriend. You\'re not crazy and it\'s not your fault.', { rel: 8, stress: -5 }); }
    if (an.has('meet') || an.has('dex')) return R('Listen to me. Nobody offering a ride or a room at 2 AM is being nice. Nobody. Especially online dudes. That\'s how kids disappear for real.', { rel: 3 });
    if (an.has('food') && G.rel.wren >= 15 && !c.mem.fed) { c.mem.fed = true; SH.st('full', 18); return R('Here. Half a sub. Don\'t make it weird.', { rel: 4, mood: 4 }, { narr: 'Wren tosses you half a sandwich. (+18 fullness)' }); }
    if (/\b(you|your|wren)\b/.test(an.t) && an.q) { c.mem.story++; const st = ['I\'m sixteen. Been out since March. Eight months.', 'I left because of my mom\'s boyfriend. I thought I\'d be back in a week.', 'I have a little brother. He\'s nine. I don\'t know if he thinks about me. I think about him constantly.', 'I\'m going to Harbor\'s transitional program when I turn seventeen. Probably. Maybe.']; return R(st[Math.min(c.mem.story - 1, st.length - 1)], { rel: 4 }); }
    if (an.has('hostile')) return R('Cool. Enjoy the underpass alone.', { rel: -8 }, { end: true });
    if (an.has('joke')) return R('Ha. You\'re funny. Stay funny. It helps.', { rel: 3 });
    if (an.has('thanks')) return R('Don\'t thank me. Just don\'t end up like me.', { rel: 3 });
    return R(pk(c, 'fb', ['You\'re like, twelve. You know that, right?', 'Keep your bag strap around your arm when you sleep.', 'Don\'t go to the rail yard. I mean it.', 'Hm.']), { rel: 1 });
  };

  /* ---------------- DOLORES ---------------- */
  B.dolores = function (an, c) {
    const G = SH.G; c.mem.sus = c.mem.sus || 0;
    if (an.has('selfharm')) return R('Oh, honey. Okay. Pie\'s on me and I\'m sitting down right here with you. I\'m calling someone who can help. You\'re not alone in this booth.', { rel: 10 }, { flags: ['doloresHelp'], end: true });
    if (an.has('disclose') || an.has('scared') || an.has('run') || /\b(nowhere|no where|can't go home|don't have anywhere)\b/.test(an.t)) {
      SH.flag('knowsHarbor'); SH.flag('doloresOffer');
      return R('Tell you what, hon. Pie\'s on the house. And there\'s a place on Wharf Street — Harbor House. Good people. I get off at six. I\'ll drive you myself. You sit here where it\'s warm till then.', { rel: 10, stress: -6 }, { narr: 'Dolores slides a slice of cherry pie across the counter. (+15 fullness)', food: 15 });
    }
    if (an.has('lie') || /\b(waiting for|my mom('s| is) coming|meeting)\b/.test(an.t)) { c.mem.sus++; return R(c.mem.sus > 1 || G.s.hyg < 35 ? 'Sure, hon. Third time you\'ve said that. I raised four kids. Try again.' : 'Uh-huh. Well, she can find you right here in the warm.', {}); }
    if (an.has('food') || an.has('money')) return R(G.money < 3 ? 'Kitchen\'s throwing out fries anyway. Here.' : 'Pancakes are $4.50. Coffee\'s bottomless but you\'re too young so it\'s hot chocolate.', { rel: 2 }, G.money < 3 ? { food: 10 } : {});
    if (an.has('thanks')) return R('Don\'t mention it, hon.', { rel: 3 });
    if (an.has('hostile')) return R('Mm-hm. I\'ve been cussed at by truckers, baby. You\'ll have to try harder.', {});
    return R(pk(c, 'fb', ['Refill? It\'s cold out there.', 'You\'re up late for a school night, hon.', 'You look like my youngest when he was your age. He was trouble too.']), { rel: 1 });
  };

  /* ---------------- PATEL ---------------- */
  B.patel = function (an, c) {
    if (an.has('selfharm') || disclosedHard(an) || (an.has('disclose') && an.has('scared'))) { SH.flag('patelSafe'); return R('Oh, beta. Sit. The kettle\'s on. You listen to me: you come here any time. Day or night. Knock on the back door. I\'m a light sleeper and a heavy protector.', { rel: 10, stress: -8 }); }
    if (an.has('disclose')) return R('I hear it through the walls, you know. I\'m old, not deaf. Are you alright?', { rel: 4 });
    if (an.has('sad')) return R('Newton is sad when it rains too. Here, sit with him. He\'s very good at sitting.', { rel: 3, mood: 5 });
    if (an.has('school')) return R('Chemistry is just cooking with consequences. Bring me your homework sometime, I miss grading.', { rel: 2 });
    return R(pk(c, 'fb', ['Newton says hello. Well. He sneezed. Same thing.', 'Would you like tea? I have biscuits that are only slightly stale.', 'You\'re a good kid. I hope someone tells you that.']), { rel: 2, mood: 2 });
  };

  /* ---------------- TYLER ---------------- */
  B.tyler = function (an, c) {
    if (an.has('hostile') || an.shout) { c.fight = true; return R('Oh you wanna go? Say that again.', { stress: 10 }, { end: true }); }
    if (an.has('deflect') || an.empty) return R('Yeah, that\'s what I thought. Loser.', { mood: -6, stress: 4 }, { end: true });
    if (an.len >= 6 || an.has('joke')) return R(pk(c, 'burn', ['...Whatever. You\'re weird.', 'Shut up. Nobody asked.']), { mood: 8, stress: -4 }, { end: true, narr: 'Somebody at the next table goes "OHHHH". Tyler\'s ears turn red. He walks off.', flags: ['burnedTyler'] });
    return R('What? Speak up, weirdo.', { mood: -2 });
  };

  /* ---------------- OFFICER LOWE ---------------- */
  B.officer = function (an, c) {
    c.mem.d = c.mem.d || 0;
    if (an.has('selfharm')) return R('Okay. Thank you for telling me. We\'re going to get you seen by someone at St. Brigid\'s tonight, and someone\'s going to stay with you.', {}, { flags: ['toldPolice'], end: true });
    if (disclosedHard(an) || (an.has('disclose') && (an.has('scared') || an.has('home')))) { c.mem.d++; SH.flag('toldPolice'); return R('Okay. That changes things. I\'m not going to just drop you back there. I\'m calling Children\'s Services and we\'ll get you somewhere safe tonight while people look into this. You did the right thing telling me.', {}, { end: true }); }
    if (an.has('disclose')) return R('Your stepdad? Tell me more. Has he hurt you? You\'re not in trouble.', {});
    if (an.has('hostile')) return R('I get it. You\'re not in trouble, kid. Running away isn\'t a crime. I just need to know you\'re safe.', {});
    if (an.has('deflect') || an.has('lie')) { c.mem.def = (c.mem.def || 0) + 1; if (c.mem.def >= 2) return R('Alright. I\'m going to take you home, then. If there\'s anything you want to tell me, now\'s the time.', {}, { end: c.mem.def >= 3 }); return R('Kids don\'t usually run for "no reason". Anything going on at home?', {}); }
    return R(pk(c, 'fb', ['You hungry? There\'s a granola bar in the glovebox.', 'Your mom\'s been worried sick. Why\'d you leave?', 'You warm enough? Here, take the blanket.']), {});
  };

  /* ---------------- MARCUS (Harbor House) ---------------- */
  B.marcus = function (an, c) {
    if (an.has('selfharm')) return R('Thank you for trusting me with that. We have a counselor on call right now. You\'re not alone here.', {}, { flags: ['toldMarcus'], end: true });
    if (an.has('disclose') || an.has('scared')) { SH.flag('toldMarcus'); return R('Thank you for telling me. Here\'s how this works, straight up: you\'re safe here tonight. Normally we contact family within 72 hours. But if home isn\'t safe, we call Children\'s Services instead, and you get a say in what we tell them. Nobody\'s dragging you anywhere tonight.', { stress: -15 }, { end: c.turn >= 2 }); }
    if (an.has('deflect')) return R('That\'s okay. Eat first. Talk later. There\'s mac and cheese and a bed with clean sheets.', { stress: -5 });
    if (an.has('food')) return R('Kitchen\'s open. Grab whatever. Seriously, whatever.', {}, { food: 30 });
    if (an.has('mom')) return R('We can call her together, when you\'re ready. Or we can wait. Your call, within reason.', {});
    return R(pk(c, 'fb', ['What\'s your name? Real one\'s fine, fake one\'s fine for tonight.', 'How long have you been out?', 'You\'re safe here. I know that\'s hard to believe right now.']), {});
  };

  /* ---------------- TICKET AGENT ---------------- */
  B.agent = function (an, c) {
    const G = SH.G; c.mem.sus = c.mem.sus || 0;
    if (/\b(i'm 12|i am 12|twelve|i'm 1[0-4]|i am 1[0-4])\b/.test(an.t)) { c.result = 'minor'; return R('Sorry, kiddo. Under fifteen can\'t ride alone. Company rules. ...Is everything okay? Is there someone I can call for you?', {}); }
    if (c.result === 'minor' && (an.has('grandma') || an.has('yes'))) { c.result = 'callGrandma'; return R('Tell you what. Give me your grandma\'s number. If she says yes and meets you at the other end, I\'ll work something out.', {}, { end: true }); }
    if (an.has('disclose') || an.has('scared') || an.has('run')) { c.result = 'help'; return R('Okay. Okay. Sit down right here, honey. I\'m going to make a call. You\'re not in trouble.', {}, { end: true }); }
    if (an.has('grandma') || /\b(meeting me|picking me up|visiting)\b/.test(an.t)) { if (G.s.hyg > 40 && U.chance(0.55 - c.mem.sus * 0.2)) { c.result = 'sold'; return R('Alright. Grandma\'s meeting you? Good. $28. Bay 3. Don\'t talk to strangers.', {}, { end: true }); } c.mem.sus++; return R('Uh-huh. How old are you, hon?', {}); }
    if (/\b(i'm 1[5-9]|i am 1[5-9]|fifteen|sixteen|seventeen)\b/.test(an.t)) { if (U.chance(0.35)) { c.result = 'sold'; return R('...Fifteen. Sure. $28. Bay 3.', {}, { end: true }); } c.mem.sus += 2; c.result = 'minor'; return R('You\'re fifteen like I\'m a supermodel. I need an adult with you, kiddo.', {}); }
    c.mem.sus++;
    if (c.mem.sus >= 3) { c.result = 'refused'; return R('Sorry, can\'t help you. Next!', {}, { end: true }); }
    return R(pk(c, 'fb', ['Traveling alone?', 'You got ID?', 'Who\'s picking you up on the other end?']), {});
  };

  /* ---------------- MRS. PIKE ---------------- */
  B.tanya = function (an, c) {
    if (an.has('disclose') || an.has('scared') || an.has('selfharm')) { SH.flag('toldTanya'); return R('Oh, sweetheart. Okay. I still have to call someone — the law says adults can\'t hide a kid, and I wouldn\'t want to. But I\'m calling the child welfare line, not just your stepfather. And you\'re staying for pancakes.', {}, { end: true }); }
    return R(pk(c, 'fb', ['Honey, your mom has been calling everyone. I have to call her. But talk to me first — why\'d you leave?', 'You\'re not in trouble with me. Jordan, go get a blanket.', 'Is something going on at home? You can tell me.']), {}, { end: c.turn >= 3 });
  };

  /* ---------------- LIGHTHOUSE (in-game crisis text line) ---------------- */
  B.lighthouse = function (an, c) {
    const G = SH.G;
    if (an.has('selfharm')) return R('I\'m really glad you reached out. Your safety matters most right now. Are you somewhere with other people? If you\'re in immediate danger, please call emergency services. (Real world: 988 in the US, 112/1098 in India, 116 123 UK.) I\'m staying right here with you.', {}, { flags: ['toldLighthouse'] });
    if (an.has('disclose') || an.has('scared')) { SH.flag('toldLighthouse'); return R('Thank you for telling me. No one deserves to feel unsafe at home. Are you safe right now, this minute? I can help you think through options — a trusted adult, a youth shelter like Harbor House, or a relative you trust.', {}); }
    if (an.has('shelter') || (an.has('yes') && c.mem.offered)) { SH.flag('knowsHarbor'); SH.flag('harborPickup'); return R('I\'ve let Harbor House know you\'re coming. If you can\'t get there safely, they can send an outreach worker to meet you at a public place. Stay somewhere lit and warm. You did something brave tonight.', {}, { end: true }); }
    if (G.phase === 'run' && !c.mem.offered) { c.mem.offered = true; return R('It sounds like you\'re out tonight. Would you like me to connect you with Harbor House? It\'s a youth shelter, open 24/7. You can just say yes.', {}); }
    const r = N.reflect(an.t);
    return R((r ? 'It sounds like ' + r + '. ' : '') + pk(c, 'fb', ['I\'m listening. Take your time.', 'What\'s happening tonight?', 'What would feel like one small step toward okay?']), {});
  };

  /* ---------------- CLASS GROUP CHAT ---------------- */
  B.class = function (an, c) {
    const who = U.pick(['maddie.k', 'devonnn', 'ava.reads', 'priya.draws']);
    if (an.has('hostile')) return R(who + ': yikes ok', { mood: -2 });
    if (an.has('sad') || an.has('disclose')) return R(who + ': u ok?? dm me', { rel: 0 });
    if (an.has('joke')) return R(who + ': LMAOOO', { mood: 3 });
    return R(who + ': ' + U.pick(['anyone do the science worksheet', 'lol', 'who took my calculator in 3rd period', 'halloween dance?? who\'s going', 'real']), {});
  };

  // text-message stylers
  SH.textStyle = {
    jordan: (s) => s.toLowerCase(), lily: (s) => s.toLowerCase() + ' ' + U.pick(['🐢', '💚', '🐢🐢', '']),
    rick: (s) => (SH.rickDrunk() >= 2 ? s.toUpperCase().replace(/\.$/, '') : s), dex: (s) => s.toLowerCase(),
    grandma: (s) => s + (U.chance(0.4) ? ' Love, Grandma' : ''), mom: (s) => s,
  };
})(window.SH);
