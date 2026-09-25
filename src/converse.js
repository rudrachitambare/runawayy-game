/* SMALL HOURS — conversation manager (outermost layer over every brain).
   Tracks what's been talked about in THIS conversation (and per-person across visits), handles meta-talk
   ("can we talk about something else", "why do you keep asking", "I already told you"), questions about the
   NPC themselves ("do you have kids?"), pure greetings, and stops people re-asking things you just answered. */
(function (SH) {
  const N = SH.NLP, U = SH.util;
  const pick = (a) => a[Math.floor(Math.random() * a.length)];
  const cap = (s) => (s ? s[0].toUpperCase() + s.slice(1) : s);
  const norm = (s) => String(s || '').toLowerCase().replace(/[^a-z0-9 ]/g, '').trim();

  /* ---------- topics ---------- */
  const TOP = {
    home: /\b(home|house|at home|family|parents|apartment)\b/,
    rick: /\b(rick|stepdad|step dad|step-dad|mom'?s boyfriend)\b/,
    mom: /\b(mom|mum|mama|mother|my ma)\b/,
    lily: /\b(lily|little sister|my sister|sis)\b/,
    grandma: /\b(grandma|gran|nana|grandmother|granny)\b/,
    friends: /\b(jordan|friends?|bff|best friend|buddy)\b/,
    tyler: /\b(tyler|bull(y|ies|ied|ying)|push(es|ed|ing)? me|shov(es|ed|ing) me|picks? on me|trips? me)\b/,
    school: /\b(school|class(es)?|teachers?|homework|grades?|tests?|quiz|math|science|english|history|report card)\b/,
    sleep: /\b(sleep(ing)?|slept|tired|exhausted|insomnia|awake|nightmares?|can'?t sleep|up all night)\b/,
    food: /\b(eat(ing)?|ate|food|hungry|starving|dinner|breakfast|lunch|meals?)\b/,
    drink: /\b(drinks?|drinking|drunk|beer|bottles?|wasted|booze|liquor|alcohol)\b/,
    yell: /\b(yell(s|ed|ing)?|scream(s|ed|ing)?|shout(s|ed|ing)?|loud|fight(s|ing)?|argu(e|es|ing|ment)|slam(s|med)?)\b/,
    violence: /\b(hit(s|ting)?|throw(s|ing)?|threw|thrown|smash(es|ed)?|punch(es|ed)?|grab(s|bed)?|bruises?|hurt(s)? (me|her|mom|lily)|slap(s|ped)?|shov(e|es|ed) (me|her|mom)|kick(s|ed)?|choke)\b/,
    mombusy: /\b(works? (nights|late|doubles?|a lot|all the time|two jobs|so much)|night shifts?|double shifts?|doubles|never home|always (at )?work(ing)?|working (nights|late|doubles|all the time)|at work)\b/,
    care: /\b(take care of|taking care of|babysit|watch (lily|her)|make (her|lily) (dinner|food)|put (her|lily) to bed|look after)\b/,
    run: /\b(leave|leaving|run away|running away|runaway|disappear|get out of here|go somewhere else|just go)\b/,
    money: /\b(money|broke|bills?|rent|cash|allowance|afford)\b/,
    art: /\b(draw(ing|s)?|art|sketch(ing|book)?|paint(ing)?|comics?)\b/,
    games: /\b(games?|gaming|skyforge|xbox|playstation|console|kart chaos)\b/,
    feelings: /\b(sad|angry|mad|scared|lonely|anxious|stressed|depressed|upset|numb|empty|hate my life)\b/,
    good: /\b(got an? (a|b)\b|got an a\+?|aced|passed|won|proud|good news|best day|awesome day|went great|went well)\b/,
    process: /\bwhat (will|would|is gonna|is going to) happen\b|\b(will|would|are) you (gonna |going to )?(tell|call|report)\b|\bwho (will|would) you (tell|call)\b|\b(will|would) i (get|be) taken\b|\bfoster\b|\bwill (rick|he) (find out|know)\b|\bwill my mom (get in trouble|find out|know)\b|\bmandated\b|\bwhat does that mean\b/,
  };
  const topicsOf = (t) => { t = String(t || '').toLowerCase().replace(/[’']/g, "'"); return Object.keys(TOP).filter((k) => TOP[k].test(t)); };

  /* ---------- meta & about-you ---------- */
  const META = [
    ['alreadyTold', /\bi (already|just) (told|said|explained|answered)|\bi told you (already|that|before|about|this)|\bi said that\b|\byou (already )?asked (me )?(that|this)( already)?\b|\bi just answered\b/],
    ['whyAsk', /\bwhy (do|would|are|d) ?you (keep|always) (asking|bringing|saying)|\bstop asking\b|\bwhy (do you|you|would you) (care|wanna know|want to know|ask(ing)?)\b|\bwhy (does|is) (it|that) (matter|important)\b|\bwhy (are you|u) (asking|so nosy)\b/],
    ['changeTopic', /\b(can we|could we|lets|let's|can u|can you) (talk about|change|switch) (something else|the subject|the topic|anything else|topics?)|\bchange the (subject|topic)\b|\bi (don't|dont|do not) (want|wanna) (to )?talk about (it|that|this|home|him|rick|school|her|them)\b|\bnot talking about (it|that|this)\b|\bdrop it\b|\bnext topic\b|\bsomething else\b/],
    ['listen', /\bare you (even )?listening\b|\byou('re| are) not listening\b|\byou don'?t listen\b|\bdid you hear (me|what i said)\b/],
    ['askPerm', /^(can|could|may) i ask (you )?(something|a question|you something)\??$/],
    ['clarify', /\bwhat do you mean\b|\bwdym\b|\bi don'?t (get it|understand)\b|\bhuh\??$/],
  ];
  const ABOUT = [
    ['kids', /\b(do|did) (you|u) have (any )?(kids|children|a (son|daughter|kid|baby))\b|\bare (you|u) a (mom|mother|dad|parent)\b/],
    ['married', /\bare (you|u) married\b|\b(do you have|got) a (husband|wife|boyfriend|girlfriend|partner)\b/],
    ['age', /\bhow old (are|r) (you|u)\b|\bwhat'?s your age\b/],
    ['from', /\bwhere (are|r) (you|u) from\b|\bwhere did (you|u) grow up\b|\bwere (you|u) born here\b/],
    ['pets', /\b(do (you|u) have|got) (a |any )?(pets?|dogs?|cats?)\b/],
    ['hobby', /\bwhat do (you|u) do for fun\b|\b(do you have|what are your|what'?s your) hobb(y|ies)\b|\bwhat do (you|u) like to do\b/],
    ['job', /\bwhy (did you become|are you) an? (counselor|teacher|nurse|cop|police)\b|\bwhat do (you|u) do for (work|a living)\b|\bwhat'?s your job\b|\bdo (you|u) like your job\b/],
    ['day', /\bhow (was|is|'s) your (day|week|weekend|night)\b|\bhow (are|r) (you|u)( doing| feeling| today)?\b|\bhow'?s it going\b|\bhow have you been\b|\bwyd\b|\bwhat are you doing\b/],
    ['young', /\bwhat were (you|u) like (at|when you were) (my age|12|twelve|a kid|little)\b|\bwhen (you|u) were (my age|a kid|little)\b|\b(do you have|got) (any )?(brothers?|sisters?|siblings)\b/],
    ['areok', /\bare (you|u) (ok|okay|alright|all right|good|fine|feeling ok)\b|\byou (ok|okay|good)\??$/],
    ['petnews', /\bhow('s| is| are) (newton|duchess|moses|mr\.? buttons|your (cat|dog|pet|bunny))\b/],
    ['invite', /\b(do you |d'?you |u )?(want|wanna) (to )?(play|hang( out)?|come( over)?|watch|go (to|outside)|skate|get food)\b|\blet'?s (play|hang|go|skate|watch)\b/],
    ['real', /\bare (you|u) (a )?(real|robot|ai|bot|human)\b/],
    ['likeme', /\bdo (you|u) (like|hate) me\b|\bare (you|u) mad at me\b/],
    ['name', /\bwhat'?s your (real |first )?name\b/],
  ];
  const GREET = /^(hi+|hey+|hello|yo+|sup|wassup|heya|hiya|howdy|good (morning|afternoon|evening)|morning|hey there|hi there)( (ms\.? okafor|miss okafor|mom|mommy|grandma|gran|jordan|lily|mrs\.? patel|dude|man|bro|again|you))?[!. ]*$/;

  const ba = N.analyze;
  N.analyze = function (raw) {
    const an = ba.apply(this, arguments);
    const t = String(an.t || '').replace(/[’]/g, "'");
    an.topics = topicsOf(t); an.tset = {}; an.topics.forEach((k) => (an.tset[k] = 1));
    // "bad" words around school/home decide good vs bad
    if (an.tset.good && /\b(not|didn'?t|never|failed)\b/.test(t)) delete an.tset.good;
    an.meta = null; for (const [k, re] of META) if (re.test(t)) { an.meta = k; break; }
    an.about = null; for (const [k, re] of ABOUT) if (re.test(t)) { an.about = k; break; }
    an.greet = GREET.test(t.trim());
    return an;
  };

  /* ---------- voices ---------- */
  const STYLE = { jordan: 'teen', tyler: 'teen', dex: 'teen', lily: 'kid', rick: 'gruff', officer: 'gruff', wren: 'teen', mom: 'warm', grandma: 'warm', patel: 'warm', dolores: 'warm', okafor: 'warm', marcus: 'warm', tanya: 'warm' };
  const sty = (id) => (SH.CONV_STYLE || {})[id] || STYLE[id] || 'warm';
  const MV = {
    warm: {
      alreadyTold: ['You did. You said "{q}". I heard you. I\'m not going to make you say it twice.', 'You\'re right, you told me: "{q}". I\'m sorry. I was listening, I promise.'],
      alreadyNone: ['Did you? I\'m sorry. Tell me which part and I\'ll hold onto it this time.'],
      whyAsk: ['Fair question. I ask because I care how you\'re doing, not to pry. You don\'t have to answer. What would you rather talk about?', 'I\'ll stop. You\'re allowed to not want to talk about it.'],
      changeTopic: ['Of course. Something else. {q}', 'Sure, sweetheart. New subject. {q}'],
      listen: ['I am. You said "{q}". Keep going.', 'I\'m listening. Really. Start wherever you want.'],
      askPerm: ['Of course. Ask me anything.', 'Go ahead.'],
      clarify: ['I just mean: {last}', 'Let me say it better. {last}'],
      greet: ['Hi, sweetheart. How are you?', 'Hello, you.'], greetAgain: ['Hi again. I\'m still here.'],
      go: ['Go on. I\'m listening.', 'Mm-hm. And then?', 'Tell me more.', 'I\'m here. Keep going.'],
      deflect: ['Oh, that\'s a long story. Another time.', 'Ha. Let\'s keep this about you.'],
    },
    teen: {
      alreadyTold: ['oh wait yeah. u said "{q}". my bad', 'ya ya u said "{q}". i remember'],
      alreadyNone: ['did u? my bad. say it again i\'m listening fr'],
      whyAsk: ['ok ok i\'ll stop asking lol', 'idk just checking on u. ok changing the subject'],
      changeTopic: ['bet. new topic. {q}', 'ok ok. {q}'],
      listen: ['yeah i\'m listening. u said "{q}"', 'dude i\'m listening. go'],
      askPerm: ['ya what', 'sure. what'],
      clarify: ['like. {last}', 'i mean {last}'],
      greet: ['yo', 'hey', 'sup'], greetAgain: ['...hi again? lol'],
      go: ['wait fr?', 'ok and??', 'go on', 'no way. then what'],
      deflect: ['lol why u asking', 'that\'s classified'],
    },
    kid: {
      alreadyTold: ['oh yeah! you said "{q}"', 'i know! you already said!'],
      alreadyNone: ['you did?? i forgot. say it again'],
      whyAsk: ['because i wanna know!!', 'okay okay i\'ll stop'],
      changeTopic: ['okay! {q}', 'okay! guess what. {q}'],
      listen: ['i AM listening!!', 'you said "{q}"!'],
      askPerm: ['yes!!', 'okay what'],
      clarify: ['i said {last}', 'like... {last}'],
      greet: ['hi!!', 'hiii'], greetAgain: ['you already said hi silly'],
      go: ['and then what??', 'really??', 'tell me more!!'],
      deflect: ['i don\'t know!!', 'that\'s a secret'],
    },
    gruff: {
      alreadyTold: ['Yeah. I heard you the first time.', 'You said. "{q}". Happy?'],
      alreadyNone: ['Did you. Huh.'],
      whyAsk: ['Fine. Forget it.', 'Whatever. Don\'t answer, then.'],
      changeTopic: ['Fine. Whatever.', 'Sure. Talk about whatever.'],
      listen: ['I\'m listening. God.', 'Yeah, yeah. "{q}". I heard.'],
      askPerm: ['What.', 'Make it quick.'],
      clarify: ['I said what I said.', '{last}'],
      greet: ['Yeah.', 'Hey.'], greetAgain: ['You said that.'],
      go: ['Uh huh.', 'Okay.', 'And?'],
      deflect: ['None of your business.', 'Why do you care.'],
    },
  };
  // per-NPC overrides
  const MO = {
    okafor: {
      whyAsk: ['Fair question. I ask because a lot of kids carry the heaviest stuff from home, and I\'d rather ask than miss it. But you steer. What would you rather talk about?', 'That\'s fair. I\'ll stop asking about that. You get to decide what we talk about in here.'],
      changeTopic: ['Of course. You\'re steering. {q}', 'Absolutely. We can come back to it, or not. {q}'],
      greet: ['Hi yourself. How\'s today been treating you?', 'Hey. I\'m glad you came in.'], greetAgain: ['Hi again. Still here. Still listening.'],
      go: ['Go on.', 'I\'m listening.', 'Take your time. Then what?'],
    },
    mom: { greet: ['Hi, baby.', 'Hey, you.'], changeTopic: ['Okay, baby. {q}'], whyAsk: ['Because I\'m your mother. But okay. I\'ll stop.'] },
    grandma: { greet: ['There\'s my favorite grandchild. Don\'t tell your sister.', 'Hello, sweet pea!'], changeTopic: ['Of course, honey. {q}'] },
    rick: { greet: ['What.', 'Yeah?'], changeTopic: ['Fine by me.'] },
    tyler: { greet: ['Why are you talking to me.', 'Ugh. What.'], whyAsk: ['I don\'t care, freak.'], alreadyTold: ['I don\'t care what you told me.'] },
    patel: { greet: ['Hello, dear! Newton says hello too.'] },
    dex: { greet: ['heyyy', 'there u are'] },
  };
  const mv = (id, k) => (MO[id] && MO[id][k]) || MV[sty(id)][k] || MV.warm[k];

  /* ---------- about the NPC ---------- */
  const BIO = {
    okafor: { petnews: 'Moses is well. He sat on my laptop during a meeting and muted me. Best meeting of the week.', areok: 'I am. Thank you for asking. That\'s kind of you.', kids: 'No kids. I have a very opinionated cat named Moses and about four hundred students. That\'s plenty.', married: 'I am. His name is Daniel. He makes terrible puns. You would hate them.', age: 'Old enough to have a beanbag in my office on purpose.', from: 'I grew up in Lagos, then Chicago. I moved here for this job.', pets: 'Moses. A grey cat who thinks he runs the house. He does.', hobby: 'I garden. Badly. And I\'m in a choir, which I\'ll deny if you tell anyone.', job: 'When I was your age, a counselor was the first adult who asked me how I was and waited for the real answer. I wanted to be that for somebody.', day: 'Honestly? Busy. Better now. How about yours?', young: 'At twelve? Quiet. I read under the covers and kept a lot to myself. So I recognize it.', real: 'Last I checked. The coffee in my system suggests yes.', likeme: 'I do. I like you a lot, actually. You\'re sharper than you let people see.', name: 'Adaeze Okafor. Ms. Okafor is fine.' },
    mom: { areok: 'I\'m… tired, baby. But I\'m okay. Are YOU okay? You\'d tell me?', kids: 'Two. You and your sister. You\'re my whole world, you know that?', married: 'Your father and I… that was a long time ago. And Rick is… Rick.', age: 'Too old to be asked that. Thirty-four.', from: 'Right here. Harlow, born and raised. I was going to leave once.', hobby: 'Hobbies? Baby, I have a job and a half. Sleep. Sleep is my hobby.', job: 'I\'m a nurse\'s aide. It\'s hard. But I help people, and it pays the rent. Mostly.', day: 'Long. My feet hurt. Better now that you\'re here.', young: 'At your age? I was a handful. Your grandma would tell you. Don\'t ask her.', likeme: 'Like you? I love you more than anything in the world.', pets: 'No pets. Rick\'s allergic. Or says he is.' },
    jordan: { invite: 'bet. my place? my mom made that pasta thing', areok: 'ya why. do i look weird', kids: 'bro i\'m TWELVE', married: 'yes to skyforge', age: 'same as u?? we\'re in the same grade lol', from: 'here dummy', pets: 'my mom won\'t let me get a dog. she says my room is already a zoo', hobby: 'skyforge. skating. being hilarious', day: 'mid. my mom made me clean my room. how bout u', likeme: 'dude ur my best friend. obviously', real: 'no i\'m a hologram', job: 'i\'m going to be a pro gamer or a marine biologist' },
    lily: { petnews: 'Mr. Buttons had a bad dream so i gave him my pillow', invite: 'YES!! horses or tea party? you pick. no, i pick. horses', kids: 'i have Mr. Buttons', age: 'SEVEN and a HALF', pets: 'Mr. Buttons is a bunny. he\'s stuffed but he counts', hobby: 'drawing horses and dancing', day: 'good! i got a sticker', likeme: 'you\'re my favorite person. don\'t tell mom', job: 'when i grow up i\'m gonna be a vet AND a princess', married: 'ew' },
    grandma: { petnews: 'Duchess bit the mailman again. I gave him a cookie. He forgave her.', areok: 'I\'m old, honey, not broken. Mostly. Now tell me about you.', kids: 'Just the one. Your mother. And she was plenty, believe me.', married: 'I was, to your grandpa Walt, for thirty-one years. He\'d have liked you.', age: 'A lady doesn\'t say. Seventy, this year. There, I said.', from: 'Cedar Falls, all my life. Forty-one Larkspur Lane. You remember the porch?', pets: 'A mean old cat named Duchess. She bites. I love her.', hobby: 'Crosswords, church, and gossip. In that order. Mostly the last.', day: 'Oh, fine, fine. My hip is complaining. Tell me about YOU.', young: 'At twelve I climbed a water tower on a dare. Don\'t you dare do that.', likeme: 'Honey, I adore you. You\'re my sunshine.' },
    patel: { petnews: 'Newton knocked a whole plant off the windowsill this morning and looked at me like I did it.', areok: 'Oh, I am fine, dear. The knees complain, the heart is happy.', kids: 'A son. Ravi. He lives in Toronto now. He calls on Sundays. Sometimes.', married: 'My husband passed six years ago. Now it\'s me and Newton.', pets: 'Newton! Best cat in Harlow. Worst cat in Harlow. Both.', hobby: 'Cooking too much food and pushing it on neighbors.', from: 'Ahmedabad, a long time ago. Then here. Forty years.', day: 'Quiet, dear. Better now you\'re here.', likeme: 'Of course I like you! You\'re my favorite neighbor. Don\'t tell the Hendersons.' },
    rick: { kids: '...You and your sister. Sort of. Don\'t start.', job: 'Between things. Why, you hiring?', day: 'None of your business.', likeme: '...You\'re fine. Go do something.', from: 'Around.', age: 'Old enough.' },
    tyler: { day: 'Why do you care, freak?', likeme: 'Obviously not.', kids: 'What? Weirdo.', hobby: 'Football. And watching you trip. Ha.' },
    dex: { age: '19', from: 'the city. u should see it sometime', day: 'bored. talking to u makes it better tho', likeme: 'ur like the only one who gets me', real: 'lol yeah i\'m real. are u?' },
  };

  const SDEF = {
    warm: { invite: 'I\'d love that. Maybe after I sit down for five minutes.', areok: 'I\'m all right. Tired, but all right. Thank you for asking. People don\'t, much.', petnews: 'Oh, still ruling the house.', thanks: ['Anytime, dear.', 'Of course.', 'You\'re very welcome.'] },
    teen: { invite: 'bet. when', areok: 'ya i\'m good. why', petnews: 'lol what', thanks: ['np', 'ya ofc', 'anytime dude'] },
    kid: { invite: 'YES!! can we play horses??', areok: 'yeah! are YOU okay?', petnews: 'Mr. Buttons is SLEEPING. shh', thanks: ['you\'re welcome!!', 'hehe'] },
    gruff: { invite: 'No.', areok: 'I\'m fine. Why, what\'d you hear?', petnews: 'What?', thanks: ['Yeah.', 'Mm.'] },
  };
  const GOOD = {
    mom: ['A B? Baby, that\'s wonderful! That\'s going on the fridge.', 'Look at you! I\'m so proud of you. Tell me everything.'],
    grandma: ['Oh, that\'s my smart cookie! I\'m telling everyone at church.', 'Wonderful! I knew it. You get that from me.'],
    jordan: ['YOOO lets go 🎉', 'look at u. nerd. (proud of u tho)'],
    lily: ['YAY!! can i see??', 'you\'re so smart!!'],
    patel: ['Wonderful, dear! That deserves a samosa.', 'Oh, I knew you were clever. Newton knew too.'],
    rick: ['Huh. Good for you.', 'Yeah? Don\'t let it go to your head.'],
    tyler: ['Nerd.', 'Wow. Want a medal?'],
    dex: ['ayy smart AND cool', 'proud of u fr'],
    _: ['That\'s great news!', 'Hey, that\'s wonderful.'],
  };

  /* ---------- light questions to ask (never about something covered/blocked) ---------- */
  const ASK = {
    warm: [['What\'s one good thing from this week? Even a small one.', 'good'], ['How are you sleeping?', 'sleep'], ['Are you eating okay?', 'food'], ['Who do you hang out with these days?', 'friends'], ['What do you do when you want to feel better?', 'fun'], ['How\'s school feeling lately?', 'school'], ['Read anything good lately?', 'books'], ['What kind of music are you into right now?', 'music'], ['If you could be anywhere right now, where would you be?', 'dream']],
    teen: [['u still playing skyforge?', 'games'], ['hows school been', 'school'], ['wanna hang this weekend', 'plans'], ['did u see that video i sent', 'misc'], ['tyler still being a menace?', 'tyler']],
    kid: [['do you wanna play horses?', 'play'], ['can you read me a story later?', 'story'], ['guess what i drew today!', 'art'], ['do you like my hair like this?', 'misc']],
    gruff: [],
  };
  const TOPICQ = (id) => ASK[sty(id)] || [];

  function cs(c) { return (c.cs = c.cs || { top: {}, blocked: {}, said: [], me: [], asked: {} }); }
  function pnpc(id) { const G = SH.G; G.mind = G.mind || { facts: {}, npc: {} }; const P = (G.mind.npc[id] = G.mind.npc[id] || { met: 0, n: 0, qa: [], ops: {} }); P.tops = P.tops || {}; return P; }
  function nextQ(id, c, prefer) {
    const S = cs(c); const P = pnpc(id);
    const ok = (q) => !S.asked[q[0]] && !S.blocked[q[1]] && S.top[q[1]] == null && !(P.tops[q[1]] && SH.G.t - P.tops[q[1]].t < 24 * 60);
    const qs = TOPICQ(id).filter(ok); const pr = prefer ? qs.filter((q) => prefer.includes(q[1])) : [];
    const q = (pr.length ? pr : qs)[0]; if (!q) return '';
    S.asked[q[0]] = 1; return q[0];
  }
  SH.Converse = { topicsOf, nextQ, cs, pnpc, blocked: (c, t) => !!(c && c.cs && c.cs.blocked[t]) };

  const GROUP = { home: ['home', 'rick', 'drink', 'yell', 'violence', 'mombusy', 'care', 'mom', 'lily'], rick: ['rick', 'drink', 'yell', 'violence'], school: ['school', 'tyler'] };
  function lastMine(c, topic, turn) {
    const S = cs(c); const g = GROUP[topic] || [topic]; const xs = S.me.filter((m) => !m.skip && m.turn < turn && (!topic || m.tops.some((x) => g.includes(x))) && m.t.split(' ').length >= 3 && !/\b(already|just) (told|said)\b/.test(m.t));
    return xs.length ? xs[xs.length - 1].t : null;
  }
  function fill(s, v) { return s.replace(/\{(\w+)\}/g, (m, k) => (v[k] != null ? v[k] : '')).replace(/\s+/g, ' ').trim(); }
  const short = (q) => { q = String(q).replace(/\s+/g, ' ').trim(); return q.length > 90 ? q.slice(0, 87).replace(/\s\S*$/, '') + '…' : q; };

  const CLAR = { warm: ['Just what I said, sweetheart. Nothing hidden in it.', 'Oh, nothing deep. I was just talking.'], teen: ['lol nothing. just saying', 'idk i was just talking'], kid: ['i don\'t know! i was just saying', 'nothing!!'], gruff: ['Means what it means.', 'Forget it.'] };
  function metaSay(id, an, c) {
    const S = cs(c); const k = an.meta; const lastNpc = S.said.length ? S.lastRaw : '';
    const lastTops = topicsOf(lastNpc);
    if (k === 'alreadyTold') {
      const tgt = an.topics.filter((t) => t !== 'process')[0] || lastTops[0] || null;
      const pt = pnpc(id).tops, g = GROUP[tgt] || [tgt]; const old = tgt ? g.map((x) => pt[x]).filter(Boolean).sort((a, b) => b.t - a.t)[0] : null;
      const q = lastMine(c, tgt, c.turn) || (old ? old.raw : null) || lastMine(c, null, c.turn);
      (tgt ? [tgt] : []).concat(lastTops).forEach((t) => (S.blocked[t] = 1));
      return q ? fill(pick(mv(id, 'alreadyTold')), { q: short(q) }) : pick(mv(id, 'alreadyNone'));
    }
    if (k === 'whyAsk' || k === 'changeTopic') {
      an.topics.concat(lastTops).forEach((t) => (S.blocked[t] = 1));
      // "i don't want to talk about home" blocks home + everything home-shaped
      if (S.blocked.home || S.blocked.rick) ['home', 'rick', 'drink', 'yell', 'violence', 'mombusy'].forEach((t) => (S.blocked[t] = 1));
      const q = nextQ(id, c, ['good', 'fun', 'games', 'art', 'play', 'books', 'music', 'dream']);
      return fill(pick(mv(id, k)), { q: q || '' });
    }
    if (k === 'listen') { const q = lastMine(c, null, c.turn); return fill(pick(mv(id, 'listen').filter((x) => q || !x.includes('{q}'))), { q: short(q || '') }); }
    if (k === 'askPerm') return pick(mv(id, 'askPerm'));
    if (k === 'clarify') { if (!S.lastRaw) return null; const lq = (S.lastRaw.match(/[^.!?]*\?\s*$/) || [''])[0].trim(); if (lq) return fill(pick(mv(id, 'clarify')), { last: lq }); return pick(CLAR[sty(id)]); }
    return null;
  }

  function followUp(id, an, c) {
    const S = cs(c); const st = sty(id);
    if (an.has('thanks') || /\b(thanks|thank you|thx|ty)\b/.test(an.t)) return pick(SDEF[st].thanks);
    const q = nextQ(id, c);
    if (an.len >= 5) { const r = N.reflect ? N.reflect(an.t) : null; if (r && st === 'warm' && !/^you (miss|love|like|hate)\b/i.test(r)) return cap(r) + '. ' + (q || pick(mv(id, 'go'))); }
    if (q && (an.q || an.len <= 3)) return q;
    if (q && Math.random() < 0.6) return pick(mv(id, 'go').filter((x) => !/\?/.test(x))) + ' ' + q;
    return pick(mv(id, 'go'));
  }

  function wrap(id, inner) {
    return function (an, c) {
      c = c || {}; const S = cs(c);
      if (an.has && an.has('selfharm')) return inner.call(this, an, c);
      const tops = an.topics || []; const P = pnpc(id);
      const prevTops = Object.assign({}, P.tops);
      tops.forEach((t) => { S.top[t] = c.turn; });
      S.me.push({ t: String(an.raw || ''), tops, turn: c.turn, skip: !!(an.meta || an.q || an.about || an.greet) });
      const serious = an.has('disclose') || an.has('run') || (an.tset && (an.tset.violence || an.tset.drink));
      let s = null;
      // 1) meta talk (but real disclosures always go to the brain)
      if (an.meta && !an.memq && !(serious && (an.meta === 'changeTopic' || an.meta === 'clarify' || an.meta === 'askPerm'))) s = metaSay(id, an, c);
      // 2) questions about the NPC themselves
      if (!s && an.about && !serious) { let b = ((SH.CONV_BIO || {})[id] || {})[an.about] || (BIO[id] || {})[an.about] || SDEF[sty(id)][an.about] || (an.about === 'areok' ? (BIO[id] || {}).day : null); if (b && S.said.includes(norm(b))) b = an.about === 'day' || an.about === 'areok' ? ({ teen: 'still mid lol. same as 5 min ago', kid: 'still good!!', gruff: 'Same as before.', warm: 'Same as a minute ago, love. Still here.' })[sty(id)] : null; s = b ? b.replace('{name}', SH.G.name) : (an.about === 'day' || an.about === 'invite' ? null : pick(mv(id, 'deflect'))); if (s && id === 'okafor' && an.about !== 'day' && !S.whyAsked && Math.random() < 0.6) { S.whyAsked = 1; s += ' Why do you ask?'; } }
      // good news gets celebrated (before a brain turns it into a lecture)
      if (!s && an.tset && an.tset.good && !serious && !SELF.includes(id)) s = pick(GOOD[id] || GOOD._) + (sty(id) === 'warm' && Math.random() < 0.5 ? ' ' + pick(['How did it feel?', 'What was the best part?']) : '');
      // 3) a pure greeting
      if (!s && an.greet) { const op = norm(((document.querySelector('#tlog .tl.npc') || {}).textContent) || ''); const gs = mv(id, c.turn <= 1 && !S.greeted ? 'greet' : 'greetAgain'); s = fill(pick(gs.filter((g) => norm(g) !== op).concat(gs.length === 1 && norm(gs[0]) === op ? mv(id, 'go') : [])), { name: SH.G.name }); S.greeted = 1; }
      let r;
      if (s) r = { say: s, fx: { rel: an.meta === 'whyAsk' || an.meta === 'changeTopic' ? 1 : 0 } };
      else {
        c._fb = false; c._mindHit = -1;
        r = inner.call(this, an, c) || { say: '...', fx: {} };
        const filler = c._fb && c._mindHit !== c.turn;
        const said = norm(r.say); const repeat = said.length > 6 && S.said.includes(said);
        const lastQ = (String(r.say).match(/[^.!?]*\?\s*$/) || [''])[0]; const sayTops = topicsOf(lastQ);
        const badQ = !SELF.includes(id) && !!lastQ && sayTops.some((t) => S.blocked[t] || (filler && S.top[t] != null && S.top[t] < c.turn));
        if (!r.end && ((filler && !SELF.includes(id)) || repeat || badQ)) { const alt = followUp(id, an, c); if (alt && norm(alt) !== said) r = Object.assign({}, r, { say: alt }); }
      }
      if (an.meta !== 'alreadyTold') tops.forEach((t) => { P.tops[t] = { t: SH.G.t, raw: String(an.raw || '').slice(0, 90) }; });
      S.said.push(norm(r.say)); S.lastRaw = r.say;
      return r;
    };
  }

  const SELF = ['okafor']; // brains that track topics themselves
  const SKIP = ['lighthouse', 'class', 'railagent', 'conductor'];
  Object.keys(SH.Brain).forEach((id) => { if (SKIP.includes(id) || SH.Brain[id]._conv) return; const w = wrap(id, SH.Brain[id]); w._conv = true; w._mind = SH.Brain[id]._mind; SH.Brain[id] = w; });
})(window.SH);
