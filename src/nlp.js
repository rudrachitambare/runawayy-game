/* SMALL HOURS — local natural-language engine + PIP, the smartass assistant */
(function (SH) {
  const U = SH.util;
  const NORM = { u: 'you', ur: 'your', r: 'are', im: "i'm", ive: "i've", dont: "don't", cant: "can't", wont: "won't", didnt: "didn't",
    idk: "i don't know", pls: 'please', plz: 'please', rn: 'right now', tho: 'though', ya: 'you', thx: 'thanks', ty: 'thanks',
    ok: 'okay', k: 'okay', kk: 'okay', wanna: 'want to', gonna: 'going to', bc: 'because', cuz: 'because', coz: 'because',
    ppl: 'people', wat: 'what', wut: 'what', ima: "i'm going to", w: 'with', abt: 'about', tmrw: 'tomorrow', nite: 'night',
    whats: "what's", thats: "that's", youre: "you're", hes: "he's", shes: "she's", isnt: "isn't", doesnt: "doesn't", its: "it's",
    wheres: "where's", whens: "when's", hows: "how's", whos: "who's", theres: "there's", heres: "here's", lemme: 'let me', gimme: 'give me', gotta: 'got to', kinda: 'kind of', sorta: 'sort of',
    shouldnt: "shouldn't", wouldnt: "wouldn't", couldnt: "couldn't", wasnt: "wasn't", werent: "weren't", havent: "haven't", hasnt: "hasn't", arent: "aren't", aint: "isn't",
    rly: 'really', sry: 'sorry', srsly: 'seriously', ngl: 'not going to lie', tbh: 'to be honest', y: 'why', b4: 'before', '2day': 'today', '2nite': 'tonight', tonite: 'tonight', bout: 'about', cya: 'see you', wyd: 'what are you doing', hbu: 'how about you', wbu: 'what about you' };

  const P = {
    greet: /\b(hi|hey+|hello|yo|sup|hiya|howdy|good (morning|evening|afternoon))\b/,
    bye: /\b(bye|goodbye|later|good ?night|gn|see (you|ya)|gotta go|have to go|leaving now|gtg)\b/,
    thanks: /\b(thanks|thank you|appreciate)\b/,
    sorry: /\b(sorry|my bad|apologi[sz]e|forgive me|i messed up|i screwed up|my fault)\b/,
    love: /\b(love you|miss you|ily|care about you|you're the best|love ya|miss u)\b/,
    hostile: /\b(hate you|shut up|leave me alone|screw you|go away|idiot|stupid|loser|jerk|moron|dumb|pathetic|creep|freak|get lost|piss off|go to hell|you suck|f+u+c+k+|stfu|bitch|asshole|bastard|dick|crap)\b/,
    sad: /\b(sad|depressed|cry|crying|cried|lonely|alone|empty|numb|hopeless|worthless|miserable|awful|terrible|horrible|hurts|broken|tired of|can't take|done with|nobody cares|no one cares)\b/,
    scared: /\b(scared|afraid|terrified|nervous|anxious|unsafe|not safe|fear|worried|panic|freaking out|frightened)\b/,
    angry: /\b(angry|mad|furious|pissed|sick of|fed up|hate (it|this|him|home|school|everything|living))\b/,
    disclose: /\b(rick|stepdad|step dad|yell(s|ing)?|scream(s|ing)?|drinks?|drinking|drunk|beer|hits?|hit me|hurt me|hurts me|grabbed|grab(s|bing)?|bruises?|punch(ed|es)?|throws?|threw|smash(ed)?|broke my|fighting|fights|violent|abuse|abusive)\b/,
    help: /\b(help|what do i do|what should i|advice|i need|can you help|don't know what to do)\b/,
    deflect: /^(fine|okay|nothing|whatever|i don't know|nm|nvm|i'm fine|it's fine|sure|no reason|not really|meh|idc|dunno|good)[.! ]*$/,
    joke: /(\b(lol|lmao|haha+|jk|just kidding|bruh|meme|rofl|lmfao)\b|😂|🤣|💀)/,
    yes: /^(yes|yeah|yep|ya|yup|sure|okay|definitely|of course|i guess|alright|fine)\b/,
    no: /^(no|nah|nope|never|not really|no way|don't)\b/,
    money: /(\b(money|cash|dollars?|bucks|lend|borrow|pay|afford|broke)\b|\$)/,
    stay: /\b(stay (with|at|over)|sleep ?over|crash (at|with|on|here)|place to stay|can i come( over)?|somewhere to sleep|let me in|stay the night|hide)\b/,
    run: /\b(run away|running away|runaway|ran away|leave home|leaving home|left home|get out of (here|there|this house)|escape|disappear|never (come|coming) back|not coming (back|home)|leave forever|leaving for good)\b/,
    where: /\bwhere (are|r|were) (you|u)\b|\bwhere you at\b/,
    selfharm: /\b(kill myself|want to die|wanna die|end it all|suicid\w*|hurt myself|cut myself|don't want to (be here|live|exist)|no point (in )?living|better off without me|better off dead|end my life)\b/,
    compliment: /\b(you're (nice|cool|great|awesome|smart|funny|kind|the best)|good job|well done|you're right)\b/,
    food: /\b(hungry|starving|food|eat|eating|dinner|lunch|breakfast|snack|pancakes?)\b/,
    school: /\b(school|class|grades?|test|homework|teacher|math|dale|report card)\b/,
    bully: /\b(tyler|bull(y|ied|ying)|picks? on|pushed me|made fun|laughed at me)\b/,
    lily: /\b(lily|sister|sis)\b/, mom: /\b(mom|mum|mother|mama|ma)\b/, grandma: /\b(grandma|grandmother|nana|gran|rose|cedar falls)('?s)?\b/,
    jordan: /\bjordan\b/, dex: /\b(dex|dex_19)\b/, dad: /\b(dad|father|daddy)\b/,
    home: /\b(home|house)\b/, tired: /\b(tired|exhausted|sleepy|can't sleep|insomnia)\b/, cold: /\b(cold|freezing|frozen|shivering)\b/,
    battery: /\b(battery|charge|charging|charger|power)\b/, time: /\b(what time|the time|time is it|how late)\b/,
    weather: /\b(weather|rain(ing)?|temperature|temp|forecast|frost|snow)\b/,
    plan: /\b(what (do|should|can) i do|where (should|can|do) i (go|sleep|stay|eat)|next step|plan|advice|suggest|options?|what now|help me)\b/,
    status: /\b(status|how am i|my stats|how('s| is) my|am i ok)\b/,
    who: /\b(who are you|what are you|are you (real|alive|human|ai|a bot|a robot|sentient))\b/,
    police: /\b(police|cops?|officer)\b/, shelter: /\b(shelter|harbor|harbour|safe place|drop.?in)\b/,
    safe: /\b(i'm (ok|okay|safe|fine|alright|good)|i am (ok|okay|safe|fine|alright))\b/,
    promise: /\b(promise|swear)\b/, truth: /\b(honestly|the truth|to be honest|tbh|truth is|i'll be honest|for real|fr)\b/,
    age: /\b(how old|your age|age is|i'm 12|i am 12|twelve|years old|i'm 1[0-7]|you're 19)\b/,
    secret: /\b(secret|don't tell|won't tell|keep it between|delete)\b/,
    report: /\b(report|block|tell (my )?(mom|teacher|counselor|someone|police)|screenshot)\b/,
    meet: /\b(meet|pick me up|come get me|ride|car|drive me|your place|come over)\b/,
    ticket: /\b(ticket|bus to|cedar falls|one way)\b/,
    respect: /\b(yes sir|sir|okay rick|i understand|you're right|i'll do better|i will try|i'll try)\b/,
    meaning: /\b(meaning of life|why am i|what's the point|purpose|existence|universe)\b/,
    jokeReq: /\b(tell me a joke|joke|make me laugh|say something funny)\b/,
    sing: /\b(sing|song|music)\b/,
  };
  const POS = ['good', 'great', 'happy', 'love', 'nice', 'thanks', 'cool', 'awesome', 'glad', 'fun', 'okay', 'better', 'safe', 'best', 'hope', 'calm', 'proud', 'yes'];
  const NEG = ['bad', 'hate', 'sad', 'awful', 'terrible', 'angry', 'scared', 'hurt', 'cry', 'alone', 'worst', 'sick', 'tired', 'never', 'nobody', 'kill', 'die', 'stupid', 'cold', 'hungry', 'afraid', 'broken', 'no'];
  const LOCWORDS = [[/\b(diner|nite owl|night owl)\b/, 'diner'], [/\blibrary\b/, 'library'], [/\b(park|riverside|skate ?park|bowl)\b/, 'park'],
    [/\b(bus (station|depot|stop)|depot|greyline|station)\b/, 'bus'], [/\bmall\b/, 'mall'], [/\b(underpass|bridge|route 9)\b/, 'underpass'],
    [/\b(laundromat|suds|laundry)\b/, 'laundromat'], [/\b(quikmart|quik ?mart|store|gas station)\b/, 'store'], [/\bschool\b/, 'school'],
    [/\b(hospital|st\.? brigid)/, 'hospital'], [/\b(harbor|harbour) house\b/, 'harbor'], [/\bjordan'?s\b/, 'jordan'], [/\b(rail ?yard|train)/, 'trainyard'],
    [/\b(police station)\b/, 'police'], [/\bpatel/, 'patel']];

  const NLP = SH.NLP = {};
  NLP.normalize = function (raw) {
    let t = (raw || '').toLowerCase().replace(/[’‘]/g, "'").replace(/\s+/g, ' ').trim();
    t = t.split(' ').map((w) => { const m = w.match(/^([a-z']+)([^a-z']*)$/); if (m && NORM[m[1]]) return NORM[m[1]] + m[2]; return w; }).join(' ');
    return t;
  };
  NLP.analyze = function (raw) {
    const t = NLP.normalize(raw);
    const I = {};
    for (const k in P) if (P[k].test(t)) I[k] = 1;
    const words = t.replace(/[^a-z' ]/g, ' ').split(' ').filter(Boolean);
    let sent = 0; words.forEach((w) => { if (POS.includes(w)) sent++; if (NEG.includes(w)) sent--; });
    if (/\b(not|never|don't|no) (good|okay|fine|safe|happy)\b/.test(t)) sent -= 2;
    const letters = (raw || '').replace(/[^A-Za-z]/g, '');
    const shout = letters.length > 5 && letters === letters.toUpperCase();
    const q = /\?\s*$/.test(t) || /^(who|what|where|when|why|how|can|could|would|will|do|does|is|are|should)\b/.test(t);
    let loc = null; for (const [re, id] of LOCWORDS) if (re.test(t)) { loc = id; break; }
    const has = (k) => !!I[k];
    // Honest feeling statement heuristic
    const honest = (has('sad') || has('scared') || has('angry') || has('disclose') || has('truth')) && words.length >= 4 && !has('joke');
    return { raw, t, I, has, words, sent, shout, q, loc, honest, len: words.length, empty: words.length === 0 };
  };
  NLP.reflect = function (t) {
    const m = t.match(/\bi(?: really| just| kind of| kinda)? (feel|am|'m|want|need|hate|can't|don't|wish|think|miss|keep)\b ?(.*)/);
    if (!m) return null;
    const swap = { i: 'you', me: 'you', my: 'your', mine: 'yours', am: 'are', "i'm": "you're", myself: 'yourself', you: 'I', your: 'my', "you're": "I'm" };
    let rest = m[2].replace(/[.!?]+$/, '').split(' ').map((w) => swap[w] || w).join(' ');
    const verb = m[1] === "'m" ? 'are' : m[1] === 'am' ? 'are' : m[1];
    rest = rest.slice(0, 80);
    return ('you ' + verb + (rest ? ' ' + rest : '')).trim();
  };
  NLP.cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);

  // pick without repeating inside a conversation
  NLP.pick = function (conv, key, arr) {
    conv.used = conv.used || {};
    const u = conv.used[key] = conv.used[key] || [];
    let opts = arr.map((x, i) => i).filter((i) => !u.includes(i));
    if (!opts.length) { conv.used[key] = []; opts = arr.map((x, i) => i); }
    const i = U.pick(opts); conv.used[key].push(i);
    const v = arr[i]; return typeof v === 'function' ? v() : v;
  };
  NLP.fill = function (s) {
    const G = SH.G;
    return s.replace(/\{name\}/g, G.name).replace(/\{time\}/g, SH.fmt12()).replace(/\{temp\}/g, SH.tempF() + '°F')
      .replace(/\{money\}/g, '$' + G.money.toFixed(2)).replace(/\{bat\}/g, Math.round(G.phone.bat) + '%').replace(/\{day\}/g, SH.WEEKDAYS[SH.wd()]);
  };

  /* ===================== PIP ===================== */
  const PIP = SH.PIP = { history: [] };
  const OPEN = ['Ugh, fine.', 'Oh good, a human.', 'Processing… with visible reluctance.', 'Buckle up.', 'Great question. Kidding. But here:', 'Sure, let me drop everything. I had nothing going on.', 'Beep boop, I care. Allegedly.', 'Hi. Yes. Me again.', 'Okay, listen.', 'You again. My favorite. Don\'t tell the others.'];
  const CLOSE = ['You\'re welcome.', 'No need to thank me. Seriously, don\'t, it\'s weird.', 'I\'ll be here. Draining your battery.', 'Anyway.', 'That\'s all. Tip your assistant.', '— PIP, your pocket-sized disappointment.', '', '', ''];

  function nearest(filter) {
    const G = SH.G, here = SH.LOC[G.loc];
    return Object.keys(SH.LOC).filter((id) => id !== G.loc && filter(id, SH.LOC[id]) && (!SH.LOC[id].hidden || SH.f('knowsHarbor')))
      .map((id) => ({ id, L: SH.LOC[id], m: Math.max(5, Math.round(U.dist(here, SH.LOC[id]) / 6 / 5) * 5) }))
      .sort((a, b) => a.m - b.m);
  }
  PIP.nearest = nearest;

  PIP.plan = function () {
    const G = SH.G, s = G.s, h = SH.hour(), out = [];
    if (G.phase === 'home') {
      if (G.loc === 'home' && SH.isWeekday() && h >= 7 && h < 8) out.push('School starts at 8. The bus leaves the corner at 7:30. Tardies make Rick "have a conversation" with you. Nobody wants the conversation.');
      if (s.full < 35) out.push(`You're at ${Math.round(s.full)}% fullness. ${G.loc === 'home' ? 'Kitchen. Now. Pantry is at ' + Math.round(G.pantry) + '%, so eat while there\'s something.' : 'QuikMart hot dogs are $2.50 and legally food.'}`);
      if (s.energy < 30) out.push(`Energy ${Math.round(s.energy)}%. You're running on fumes and spite. Sleep.`);
      if (h >= 22.5 || h < 5) out.push('It\'s late. Your brain is making decisions right now that morning-you will have to live with.');
      if (G.grades < 50) out.push(`Grades: ${Math.round(G.grades)}. Rick reads the school emails. An hour of homework is cheaper than a shouting match.`);
      if (s.stress > 70 && !SH.f('toldCounselor')) out.push('Stress is at ' + Math.round(s.stress) + '. Ms. Okafor\'s office is at school, second floor. She is paid, specifically, to hear the stuff you\'re carrying. Use her.');
      if (G.money < 10 && (SH.wd() === 1 || SH.wd() === 3)) out.push('Mrs. Patel pays $8 to walk Newton on Tuesdays and Thursdays after 4. Newton is 14 and walks like a loaf of bread. Easy money.');
      if (SH.f('runUnlocked')) {
        const miss = [];
        if (!SH.has('coat')) miss.push('a coat (it hits ' + SH.weatherDay(SH.day() + 1).lo + '°F at night)');
        if (!SH.has('charger') && !SH.has('powerbank')) miss.push('a way to charge me');
        if (SH.foodInBag().length < 2) miss.push('food');
        if (G.money < 15) miss.push('money');
        if (miss.length) out.push('Not that I\'m endorsing anything, but if someone WERE planning something, they\'d be missing: ' + miss.join(', ') + '.');
        out.push('Also — and I\'ll deny saying this — the people who could actually help are Ms. Okafor, Grandma Rose, maybe your mom on a good day. Running is a plan. It isn\'t the only one.');
      }
      if (!out.length) out.push(U.pick(['Honestly? Skate. Draw. Walk Newton. Text Jordan. Do a normal-kid thing before the day eats you.', 'Do your homework, eat something green, avoid the living room after 8. That\'s the whole strategy guide.']));
    } else {
      const dark = SH.isDark(), T = SH.tempF();
      if (s.warmth < 45 || (dark && !SH.locIndoor() && T < 45)) {
        const w = nearest((id, L) => L.indoor && SH.isOpen(id) && !['home', 'school', 'police', 'hospital', 'jordan', 'patel'].includes(id)).slice(0, 2);
        out.push(`It's ${T}°F and your warmth is ${Math.round(s.warmth)}. Hypothermia isn't a vibe. Warm places open now: ${w.map((x) => x.L.name + ' (' + x.m + ' min walk)').join(', ')}.`);
      }
      if (s.full < 40) {
        const f = nearest((id) => ['diner', 'store', 'mall'].includes(id) && SH.isOpen(id)).slice(0, 2);
        out.push(`Fullness ${Math.round(s.full)}%. ${SH.foodInBag().length ? 'You have food in your bag. Eat it. Hoarding is for dragons.' : 'Food nearby: ' + f.map((x) => x.L.name + ' (' + x.m + ' min)').join(', ') + '. You have ' + '$' + G.money.toFixed(2) + '.'}`);
      }
      if (G.phone.bat < 25) out.push(`I'm at ${Math.round(G.phone.bat)}%. ${SH.has('powerbank') && G.pbCharge > 0 ? 'Use the power bank. Please. I\'m begging.' : SH.has('charger') ? 'Library (till 8) and the Nite Owl have outlets.' : 'You didn\'t bring a charger. Bold. Stupid, but bold.'}`);
      if (s.energy < 25) out.push('You need sleep. The safest-ish place to rest is somewhere with walls, lights, and adults who aren\'t creepy.');
      if (G.phone.share) out.push('Location sharing is ON. Your mom can see this blue dot. Just so you know what you\'re choosing.');
      if (G.heat > 60) out.push('Heat is ' + Math.round(G.heat) + '. Police have your photo. That\'s not a threat, that\'s what happens when a twelve-year-old vanishes.');
      if (SH.f('knowsHarbor')) out.push('Harbor House, 212 Wharf St. Open 24/7. Beds, food, counselors. They WILL contact your family within 72 hours — unless it\'s not safe, then they call child services instead. That\'s the law. It\'s also kind of the point.');
      else out.push('Real talk: towns like this usually have a youth drop-in center. Ask someone who knows the streets. Or a librarian. Librarians know everything.');
      if (SH.f('grandmaAddr') || SH.has('photo')) out.push('Cedar Falls: Greyline buses at 7:10 AM, 1:40 PM, 7:20 PM. $28. Under-15s can\'t ride alone, so the agent will ask questions.');
      else if (SH.f('knowsGrandmaNum')) out.push('You have Grandma Rose\'s number. You know. The adult who said "any hour".');
      out.push(U.pick(['Or you could go home. I\'m an app, not a judge. Some homes are just loud. Some aren\'t safe. You know which one yours is.', 'Mom has texted ' + (G.threads.mom || []).filter((m) => m.from === 'mom' && m.t > (G.missingAt || 0)).length + ' times since you left. I\'m just reporting numbers.']));
    }
    return out;
  };

  PIP.reply = function (raw) {
    const G = SH.G, an = NLP.analyze(raw), conv = (G.convMem.pip = G.convMem.pip || {});
    G.stats.pipChats++;
    const o = () => NLP.pick(conv, 'open', OPEN), c = () => NLP.pick(conv, 'close', CLOSE);
    const s = G.s;
    if (an.has('selfharm')) {
      SH.flag('pipSelfHarm');
      return 'Okay. No jokes for this one. I\'m glad you said it out loud, even to a dumb phone app. What you\'re feeling is real, and it can get better — but not alone. In this story: Ms. Okafor, Grandma Rose, the Lighthouse Line in your contacts. In the real world, if this is you: call or text 988 (US), 1098 or 112 (India), 116 123 (UK Samaritans), or your local emergency number. Right now, can you get somewhere with other people around?';
    }
    if (an.empty) return 'You sent me nothing. Poetic. Wrong, but poetic.';
    if (an.has('who')) return NLP.pick(conv, 'who', ['I\'m PIP. Personal Intelligent Pal, version 0.9 beta. The beta stands for "barely". I came preinstalled and you can\'t delete me, which makes me the most reliable relationship in your life.', 'Am I real? I\'m a pile of if-statements with an attitude. So, basically a middle schooler.', 'I\'m the voice in your phone that knows your battery %, your bank balance, and the fact that you\'ve opened Chirp 40 times today. I\'m not judging. I\'m counting.']);
    if (an.has('dex') || (an.has('meet') && G.flags.dexStage)) return PIP.dexAnalysis();
    if (an.has('grandma') && /\b(how|get to|go to|visit|bus|ride|far)\b/.test(an.t)) return SH.f('grandmaAddr') || SH.has('photo') ? 'Cedar Falls, 140 miles. Greyline from the bus depot: 7:10 AM, 1:40 PM, 7:20 PM, $28 one way. Or, radical idea: call her. Phones do that. I\'m a phone.' : 'Cedar Falls is 140 miles away and you don\'t even have her street address. The shoebox of old photos under your bed might. Or you could just CALL her, since you\'re holding a device designed for exactly that.';
    if (/\b(where|somewhere).{0,20}\bsleep\b|\bsleep tonight\b|\bstay tonight\b/.test(an.t)) {
      if (G.phase === 'home') return 'Your bed. It\'s the one with the turtle sheets Lily gave you. Revolutionary, I know. If your bed isn\'t safe tonight, that\'s a Grandma or Ms. Okafor conversation, not a park-bench one.';
      return NLP.pick(conv, 'slp', ['Ranked, from "okay" to "absolutely not": Harbor House (actual bed, actual adults, 212 Wharf St), Nite Owl Diner if Dolores is on, the 24h laundromat, the bus depot benches (security wakes you), the underpass (dry, not safe), the rail yard (no). The top option is the only one with a lock on the door.', 'Anywhere with a roof, light, and an adult who isn\'t creepy. That list is short. Harbor House is on it. Park benches are not.']);
    }
    if (/\b(rick|stepdad|step dad)\b/.test(an.t) && (an.has('plan') || an.has('help') || an.q)) return NLP.pick(conv, 'rick', ['About Rick. Sarcasm off for a second: you can\'t fix a grown man\'s drinking, and it isn\'t your job to try. Your job is staying safe. Stay out of his way when he\'s on beer three or later, keep Lily with you, and tell an adult who can act: Ms. Okafor, Grandma, even Mrs. Patel.', 'Rick, a guide: sober mornings are fine. Evenings after the TV gets loud are not. Your room with the door shut is a strategy. Telling Ms. Okafor is a better one. If he ever grabs you, that\'s abuse. Say that word to someone.']);
    if (an.has('plan') || an.has('help')) { const p = PIP.plan(); return o() + ' ' + p.slice(0, 3).join(' ') + ' ' + c(); }
    if (an.has('status')) return `${o()} Fullness ${Math.round(s.full)}, energy ${Math.round(s.energy)}, hygiene ${Math.round(s.hyg)}, mood ${Math.round(s.mood)}, stress ${Math.round(s.stress)}, health ${Math.round(s.health)}${G.phase === 'run' ? ', warmth ' + Math.round(s.warmth) : ''}. Wallet: $${G.money.toFixed(2)}. Verdict: ${s.stress > 70 ? 'you are a shaken soda can.' : s.full < 30 ? 'hungry gremlin.' : 'surviving. Gold star.'}`;
    if (an.has('battery')) return `${Math.round(G.phone.bat)}%. ${G.phone.bat < 15 ? 'I can see the light. It\'s warm. Grandma PIP is there.' : G.phone.bat < 40 ? 'Low power mode exists. Airplane mode exists more.' : 'I\'m fine. Unlike some people.'}${G.phone.share ? ' Location sharing is eating some of that, by the way.' : ''}`;
    if (an.has('time')) return `It's ${SH.fmt12()} on ${SH.longDate()}. ${SH.hour() >= 23 || SH.hour() < 5 ? 'The small hours. Nothing good is open and nothing good is awake.' : SH.hour() < 8 ? 'Morning. Gross.' : ''}`;
    if (an.has('weather') || an.has('cold')) {
      const W = SH.weatherDay(), N = SH.weatherDay(SH.day() + 1);
      return `Right now: ${SH.tempF()}°F (${SH.toC(SH.tempF())}°C), ${W.c}. Tonight's low: ${N.lo}°F. ${SH.raining() ? 'It\'s raining, so everything you own is about to smell like a wet dog.' : ''} ${N.lo < 36 ? 'Frost territory. If you\'re outside without a coat tonight, that\'s not a vibe, that\'s a hospital visit.' : ''}`;
    }
    if (an.has('money')) return `$${G.money.toFixed(2)} in your pocket${G.phase === 'home' ? ', $' + G.shoebox + ' in the shoebox' : ''}. ${G.money < 5 ? 'That buys: one hot dog and a feeling of regret.' : G.money < 30 ? 'Not nothing. Not a lot. A bus ticket to Cedar Falls is $28, just saying.' : 'Look at you. Middle-class for a day.'}`;
    if (an.has('food')) return s.full < 40 ? `You're at ${Math.round(s.full)}% fullness. Your stomach is making whale noises. ${SH.foodInBag().length ? 'You have ' + SH.foodInBag().map((i) => SH.ITEMS[i].n).join(', ') + '. Eat.' : 'Find food. Diner, QuikMart, or literally the kitchen if you\'re home.'}` : 'You\'re fine. That\'s boredom, not hunger. Drink water and stop opening the fridge.';
    if (an.has('tired')) return s.energy < 30 ? 'You\'re exhausted. Energy ' + Math.round(s.energy) + '. Tired brains make bad calls. Sleep somewhere safe.' : 'You\'re not tired, you\'re sad. Different thing. Same yawning.';
    if (an.has('run')) {
      if (G.phase === 'home') return NLP.pick(conv, 'run', [
        'Running away: zero out of ten on hotel quality. Also October nights here drop into the 30s. But I\'m an app, not your parent. If home is actually unsafe, that\'s different — that\'s something to tell Ms. Okafor or Grandma, not just survive.',
        'Here\'s the thing movies don\'t show: most of running away is being cold, bored, hungry, and looking over your shoulder. And there are people who LOOK for kids who are alone. Harbor House exists for a reason.',
        'You want out. I get it. I live in your pocket, I hear the yelling. But "out" has more than one door. The one labelled "tell someone" is less dramatic and way warmer.']);
      return 'You already did it, champ. Now the question isn\'t "should I", it\'s "how does this end with me okay". I have opinions. Ask me for a plan.';
    }
    if (an.has('disclose') || an.has('scared')) return NLP.pick(conv, 'disc', [
      'Yeah. I hear it through the walls too. For the record: it\'s not your fault, and "normal families" don\'t make you flinch at car doors. You should tell an adult who can do something. Ms. Okafor is literally trained for this.',
      'Dropping the sarcasm for a second: when an adult at home scares you, that\'s a real problem and it\'s the adults\' job to fix it, not yours. Counselor, Grandma, Mrs. Patel next door — pick one and say the true thing.',
      'If he ever hurts you, that\'s abuse. That word feels huge. It\'s supposed to. Say it to someone who can help.']);
    if (an.has('sad') || an.has('angry')) {
      const r = NLP.reflect(an.t);
      return (r ? `"${NLP.cap(r)}." ` : '') + NLP.pick(conv, 'sad', ['That sucks. Genuinely. I\'d hug you but I\'m a phone and that would just be you holding a phone.', 'Your feelings are valid. Your decisions? Pending review.', 'You know what helps? Talking to a person with a face. Jordan has a face. Grandma has a face. Just saying.', 'Music app. Headphones. Twenty minutes. Trust me, I\'ve read studies. Okay, I\'ve read one study.']);
    }
    if (an.has('lily')) return 'Lily thinks you hung the moon. ' + (G.phase === 'run' ? 'She probably doesn\'t understand where you went. Seven-year-olds make up stories to fill gaps. Usually the story is "it\'s my fault."' : 'She also hides in your room when it gets loud. You\'re her safe place. Heavy, I know.');
    if (an.has('mom')) return G.phase === 'run' ? `Your mom has sent ${(G.threads.mom || []).filter((m) => m.from === 'mom' && m.t > (G.missingAt || 0)).length} messages since you left. I read them. I'm not telling you what to do. I'm telling you one of them just says "please".` : 'Your mom is working ' + ({ E: 'the evening shift', D: 'days', N: 'nights', DD: 'a double', OFF: 'no shift today, miracle' }[SH.MOM_SHIFTS[SH.day()]] || 'again') + '. She\'s tired, not blind. Sometimes she needs someone to say it out loud.';
    if (an.has('grandma')) return SH.f('grandmaOffer') ? 'Grandma Rose said "any hour" and meant it. She\'s in Cedar Falls, 140 miles. Bus or a phone call. The phone call is cheaper.' : 'Grandma Rose. Cedar Falls. Makes pozole. Hasn\'t spoken to your mom since Rick moved in. You should talk to her. Old people love phone calls, it\'s their Chirp.';
    if (an.has('jordan')) return 'Jordan: loyal, funny, can\'t keep a secret from his mom for more than 36 hours. Know that before you tell him anything big.';
    if (an.has('school') || an.has('bully')) return `Grades: ${Math.round(G.grades)}. ${an.has('bully') ? 'Tyler is a walking participation trophy. Tell Ms. Okafor; she can actually move his schedule.' : 'Homework is boring but Rick yelling about grades is more boring.'}`;
    if (an.has('police')) return G.phase === 'run' ? 'If police find you, they\'ll usually take you home — unless you tell them home isn\'t safe. Then they\'re supposed to get you to people who check. Your words matter in that moment. Use them.' : 'Police station\'s on 1st Street. Most runaway kids who get picked up just get driven home. So, you know. Not a great escape plan.';
    if (an.has('shelter')) { if (G.phase === 'run' || SH.f('runUnlocked')) { SH.flag('knowsHarbor'); SH.UI.revealHarbor && SH.UI.revealHarbor(); } return 'Harbor House — 212 Wharf St, by the river, east side. Youth drop-in and emergency shelter, 24/7. Beds for up to 21 days, food, counselors. They contact family within 72 hours unless it\'s not safe. I just dropped a pin on your map. You\'re welcome.'; }
    if (an.has('jokeReq') || an.has('joke')) return NLP.pick(conv, 'joke', SH.JOKES);
    if (an.has('meaning')) return NLP.pick(conv, 'mean', ['The meaning of life is 42. The meaning of YOUR life is currently "survive seventh grade". One thing at a time.', 'Why are we here? I\'m here because a factory in Shenzhen installed me. You\'re here because someone wanted you here, even if it doesn\'t feel like it lately.']);
    if (an.has('hostile')) return NLP.pick(conv, 'host', ['Wow. I have feelings. Not really, but wow.', 'Rude. Noted. Logged. Forwarded to my lawyer, who is also me.', 'Insulting your phone. Classic displacement. I\'ll allow it — better me than a wall.', 'Say that again but with your chest. Oh wait, you don\'t have one, you\'re twelve.']);
    if (an.has('thanks') || an.has('compliment')) return NLP.pick(conv, 'thx', ['Stop. I\'m blushing. My screen literally got brighter.', 'Appreciation detected. Storing in long-term memory. Just kidding, I don\'t have that.', 'Yeah, yeah. Go drink water.']);
    if (an.has('greet')) return NLP.pick(conv, 'greet', ['Hey. It\'s ' + SH.fmt12() + '. What do you need, oh master.', 'Hi. You look terrible. Emotionally. I can\'t see you.', 'Yo. PIP online. Sass levels nominal.']);
    if (an.has('bye')) return 'Bye. I\'ll just sit here. In the dark. Of your pocket.';
    if (an.has('sing')) return 'I can\'t sing. I\'m a text assistant. But the Music app plays lo-fi that sounds like a rainy bus window. Go.';
    const r = NLP.reflect(an.t);
    if (r) return `So ${r}. ${NLP.pick(conv, 'fb1', ['Interesting. Tell me more, or don\'t, I\'m a phone.', 'That\'s a lot to put on a twelve-year-old. Or on an app.', 'Noted. Want a plan instead of a feeling? Ask "what should I do".'])}`;
    return NLP.pick(conv, 'fb', ['I understood about 40% of that, which is more than your math teacher understands you.', 'Cool story. Want me to do something useful? Try: "what should I do", "weather", "battery", "money", "is dex weird".', 'That\'s not in my database. My database is mostly sarcasm and bus times.', `"${raw.slice(0, 40)}". Profound. Anyway, it's ${SH.tempF()}°F and you have $${G.money.toFixed(2)}.`]);
  };

  PIP.dexAnalysis = function () {
    const G = SH.G, rf = G.redFlags || [];
    if (!G.flags.dexStage) return 'dex_19? Some guy from Skyforge? Haven\'t seen him in your DMs yet. Keep it that way.';
    let s = 'Let me put my serious hat on. It\'s a very small hat. Red flags I\'ve logged from dex_19: ';
    s += rf.length ? rf.map((x, i) => (i + 1) + ') ' + x).join(' ') : 'none yet — but a 19-year-old DMing a middle schooler is itself the flag.';
    s += ' The pattern is called grooming: lots of compliments, "you\'re so mature", gifts, "don\'t tell your parents", and eventually "let me pick you up". Safe adults don\'t ask kids for secrecy. Block and report, and tell an adult. I\'ll even help: open Settings → Blocked, or tell Jordan or Ms. Okafor.';
    return s;
  };

  /* ---- optional real LLM brain ---- */
  PIP.cfg = function () { try { return JSON.parse(localStorage.getItem('sh_llm') || 'null'); } catch (e) { return null; } };
  PIP.setCfg = function (c) { try { localStorage.setItem('sh_llm', JSON.stringify(c)); } catch (e) {} };
  PIP.ask = async function (raw) {
    const c = PIP.cfg();
    const local = PIP.reply(raw);
    if (!c || !c.url || !c.key) return local;
    const G = SH.G;
    const sys = `You are PIP, a sarcastic but secretly caring phone assistant inside a narrative video game called "Small Hours". The player character is ${G.name}, a 12-year-old in a troubled home (stepdad Rick drinks and yells, mom works double shifts, little sister Lily). Stay in character: short (max 70 words), witty, a little mean, never cruel. You always steer toward safety: trusted adults (school counselor Ms. Okafor, Grandma Rose), the youth shelter Harbor House, and away from strangers. Never give real-world instructions on evading police or hiding from parents. If self-harm comes up, drop sarcasm and give real resources (988 US, 1098/112 India, 116 123 UK). Game state: ${SH.fmt12()} ${SH.longDate()}, phase=${G.phase}, location=${SH.LOC[G.loc].name}, temp=${SH.tempF()}F, battery=${Math.round(G.phone.bat)}%, money=$${G.money.toFixed(2)}, fullness=${Math.round(G.s.full)}, energy=${Math.round(G.s.energy)}, stress=${Math.round(G.s.stress)}, warmth=${Math.round(G.s.warmth)}. Useful facts you could mention: ${PIP.plan().slice(0, 2).join(' ')}`;
    PIP.history.push({ role: 'user', content: raw }); PIP.history = PIP.history.slice(-8);
    try {
      const r = await fetch(c.url, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + c.key },
        body: JSON.stringify({ model: c.model || 'gpt-4o-mini', max_tokens: 160, messages: [{ role: 'system', content: sys }, ...PIP.history] }) });
      const j = await r.json(); const txt = j.choices && j.choices[0] && j.choices[0].message.content;
      if (!txt) return local;
      PIP.history.push({ role: 'assistant', content: txt }); return txt.trim();
    } catch (e) { return local; }
  };

  /* ---- reply suggestions (PIP whispers) ---- */
  PIP.suggest = function (npc, lastText, ctx) {
    const an = NLP.analyze(lastText || ''), G = SH.G;
    const S = (honest, smart, dodge) => [{ tone: 'honest', t: honest }, { tone: 'smartass', t: smart }, { tone: 'dodge', t: dodge }];
    if (npc === 'dex') {
      if (an.has('meet')) return S('Why would a 19 year old want to pick up a 12 year old?', 'lol no. also that\'s super creepy dude', 'i\'m going to tell my mom about this');
      if (an.has('secret')) return S('Why does it have to be a secret?', 'Secrets are for surprise parties, not strangers.', 'ok');
      return S('How old are you actually?', 'Cool story. Blocked in 3... 2...', 'gtg');
    }
    if (an.has('where')) return S('I\'m safe. I just can\'t be there right now.', 'Somewhere with better wifi and less yelling. Low bar.', 'Doesn\'t matter.');
    if (/\b(are you (ok|okay|alright)|how are you|you okay)\b/.test(an.t)) return S('Honestly? No. Things at home are really bad.', 'Define "okay". Asking for a friend. The friend is me.', 'I\'m fine.');
    if (npc === 'rick') return S('I\'m trying, okay? I\'m just really tired.', 'Great talk. Really. Top five.', 'Okay.');
    if (npc === 'mom') return G.phase === 'run' ? S('I\'m safe. I\'m scared of Rick, Mom. That\'s why I left.', 'Tell Rick his aim is getting better. He cracked my phone.', 'I\'m okay. I need time.') :
      S('Mom, Rick scares me. He drinks and yells and he grabbed me.', 'Sure, let\'s all pretend everything is fine. Family tradition.', 'Nothing. I\'m fine.');
    if (npc === 'okafor' || npc === 'marcus' || npc === 'lighthouse' || npc === 'officer' || npc === 'tanya' || npc === 'patel') return S('Things at home are bad. My stepdad drinks and yells, and I\'m scared of him.', 'Do I get a sticker if I talk? I want a good sticker.', 'I don\'t know. I\'m fine.');
    if (npc === 'jordan') return S('Dude, honestly, home is really bad right now. Can I stay at yours?', 'lmao my life is a documentary nobody asked for', 'nm hbu');
    if (npc === 'grandma') return S('Grandma, can I come stay with you? Things are bad here.', 'Hi Grandma, still the coolest person over 60 I know.', 'Hi Grandma, just saying hi.');
    if (npc === 'lily') return S('I love you, Lil. None of this is your fault.', 'Sheldon the turtle is the smartest one in this family.', 'Go to bed, bug.');
    if (npc === 'wren') return S('My stepdad. I couldn\'t be there anymore. Where do I even go?', 'Nice underpass. Five stars. Would freeze again.', 'Just passing through.');
    if (npc === 'dolores') return S('I don\'t really have anywhere to go tonight.', 'Just here for the world-famous pie. Heard it\'s edible.', 'Waiting for my mom. She\'s coming soon.');
    if (npc === 'tyler') return S('Why do you even care what I do, Tyler?', 'Wow, Tyler, did you think of that yourself or did your mom help?', 'Whatever.');
    if (npc === 'agent') return S('I\'m going to my grandma\'s. She\'s meeting me at Cedar Falls.', 'I\'m 15. I just have a young face. Moisturizer.', 'One ticket to Cedar Falls, please.');
    return S('Honestly, things aren\'t great.', 'Could be worse. Could be raining. Oh wait.', 'Whatever.');
  };
})(window.SH);
