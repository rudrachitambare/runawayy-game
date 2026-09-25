/* SMALL HOURS — bigger vocabulary for the text AI: texting slang, typos (fuzzy matching), emoji, negation,
   ~20 new intents, and new replies for every main character when they'd otherwise fall back to filler. */
(function (SH) {
  const N = SH.NLP, U = SH.util;
  /* ---------- slang, texting shorthand, common misspellings ---------- */
  const X = {
    rly: 'really', rlly: 'really', srsly: 'seriously', ngl: 'not going to lie', istg: 'i swear to god', fr: 'for real', frfr: 'for real', lowkey: 'kind of', highkey: 'really',
    deadass: 'seriously', bet: 'okay', nocap: 'for real', fam: 'friend', bro: 'bro', bruh: 'bruh', aint: "isn't", "ain't": "isn't", yall: 'you all', "y'all": 'you all', gotta: 'got to', lemme: 'let me',
    kinda: 'kind of', sorta: 'sort of', dunno: "i don't know", prolly: 'probably', cya: 'see you', ttyl: 'talk to you later', brb: 'be right back', omg: 'oh my god', smh: 'shaking my head',
    tbf: 'to be fair', imo: 'in my opinion', irl: 'in real life', hbu: 'how about you', wbu: 'what about you', hru: 'how are you', wyd: 'what are you doing', wbu2: '', sry: 'sorry', soz: 'sorry',
    luv: 'love', ofc: 'of course', obv: 'obviously', idc: "i don't care", idek: "i don't even know", imy: 'i miss you', ilysm: 'i love you so much', ily: 'i love you', gm: 'good morning',
    tysm: 'thank you so much', tyvm: 'thank you', np: 'no problem', yw: "you're welcome", bday: 'birthday', wknd: 'weekend', b4: 'before', '2day': 'today', '2nite': 'tonight', '2morrow': 'tomorrow',
    l8r: 'later', gr8: 'great', becuase: 'because', becasue: 'because', bcuz: 'because', realy: 'really', scard: 'scared', skared: 'scared', hungery: 'hungry', tierd: 'tired', tird: 'tired',
    freind: 'friend', frend: 'friend', sory: 'sorry', sorri: 'sorry', plese: 'please', pleas: 'please', wierd: 'weird', definately: 'definitely', alot: 'a lot', dont: "don't", nothin: 'nothing',
    somethin: 'something', gonna: 'going to', finna: 'going to', tryna: 'trying to', outta: 'out of', lotta: 'lot of', cuz: 'because', coz: 'because', wat: 'what', nuthin: 'nothing', mom: 'mom',
    mum: 'mom', mommy: 'mom', stepdad: 'stepdad', 'step-dad': 'stepdad', grandmom: 'grandma', granny: 'grandma', abuela: 'grandma', pls: 'please', plz: 'please', thnx: 'thanks', thanx: 'thanks',
    ok: 'okay', okk: 'okay', okie: 'okay', oki: 'okay', ya: 'yeah', yea: 'yeah', yeh: 'yeah', ye: 'yeah', nah: 'no', naw: 'no', nope: 'no', yup: 'yes', yep: 'yes', mhm: 'yes', ikr: 'i know right',
    tmr: 'tomorrow', tmrw: 'tomorrow', rn: 'right now', atm: 'right now', asap: 'as soon as possible', bc: 'because', w: 'with', wo: 'without', ppl: 'people', sm: 'so much', ty: 'thanks',
  };
  const EMO = [[/😭|😢|😞|😔|💔|🥲|☹️|🙁/g, ' sad '], [/😡|🤬|😤|😠/g, ' angry '], [/😨|😱|😰|😧/g, ' scared '], [/❤️|❤|💕|💖|🥰|😍|<3/g, ' love you '], [/🥺/g, ' please '],
    [/👍|👌|✅/g, ' yes '], [/👎|❌/g, ' no '], [/😂|🤣|💀|😆/g, ' lol '], [/🙄/g, ' whatever '], [/😴|🥱/g, ' tired '], [/🥶/g, ' cold '], [/🤢|🤮/g, ' sick '], [/🍕|🍔|🍟/g, ' food ']];
  // fuzzy keyword correction (Damerau-Levenshtein, same first letter, never touches common words)
  const KEY = 'scared afraid terrified hungry starving tired exhausted drunk drinking stepdad bruise bruises grabbed yelling screaming sorry please thanks school teacher grandma library shelter police hospital ticket station train money lonely depressed anxious nervous worried angry furious because really definitely probably friend family mother sister brother bully lonely hopeless worthless myself running escape advice battery charger weather freezing homework skyforge drawing business counselor okafor jordan rick'.split(' ');
  const COMMON = new Set('the and but for not you your are was were what when where why how who this that with have has had just like want need know think thing things tried trying drink drank drive dinner stay still mean meet mine time tell told talk walk well will would could should maybe about after again always because before being best better came come didnt doesnt done dont down even ever every feel felt find first from game gave give goes going good got great hard help here home hope into its keep kind last leave left life little long look lost made make many more most much must never next nice night nothing now okay only other over people play pretty real right said same saw say see she some sorry stop sure take than them then there they thought today too took try under until very wait went while wish work worse yeah year years yes yet school sister brother hurry hurt worst world story stupid bored board broke brake sad mad bad dad rich sick scary sleep sleepy tree three trip ride rode side safe same save sale nice mice drunk dunk trunk bruised grabbing drinks'.split(' '));
  const dl = (a, b) => { const m = a.length, n = b.length; if (Math.abs(m - n) > 2) return 9; const d = []; for (let i = 0; i <= m; i++) { d[i] = [i]; } for (let j = 1; j <= n; j++) d[0][j] = j;
    for (let i = 1; i <= m; i++) for (let j = 1; j <= n; j++) { const c = a[i - 1] === b[j - 1] ? 0 : 1; d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + c); if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + 1); } return d[m][n]; };
  N.fuzzy = function (w) {
    if (w.length < 5 || COMMON.has(w) || KEY.includes(w) || !/^[a-z]+$/.test(w)) return w;
    let best = w, bd = w.length >= 8 ? 2 : 1;
    for (const k of KEY) { if (k[0] !== w[0]) continue; const d = dl(w, k); if (d <= bd && d > 0) { bd = d - 0.01; best = k; } }
    return best;
  };
  const baseNorm = N.normalize;
  N.normalize = function (raw) {
    let s = String(raw || ''); EMO.forEach(([re, rep]) => { s = s.replace(re, rep); });
    let t = baseNorm(s);
    t = t.replace(/(\w)\1{2,}/g, '$1$1'); // soooo -> soo, heyyyy -> heyy
    t = t.split(' ').map((w) => { const m = w.match(/^([a-z0-9'\-]+)([^a-z0-9']*)$/); if (!m) return w; let core = m[1]; if (X[core] != null) core = X[core]; else core = N.fuzzy(core); return core + m[2]; }).join(' ');
    return t.replace(/\s+/g, ' ').trim();
  };

  /* ---------- new intents + extra phrasings for existing ones ---------- */
  const EXTRA = {
    greet: /\b(wassup|whaddup|what's good|heyy|hii+|hola|morning|good morning|howdy|yoo+)\b/,
    bye: /\b(see you|talk to you later|peace out|peace|gotta go|night night|nighty night|catch you later|i'm out|i'm off)\b/,
    thanks: /\b(thank you so much|cheers|appreciate it|appreciate you|means a lot|you're a lifesaver)\b/,
    sorry: /\b(i apologize|didn't mean (it|that)|i shouldn't have|forgive me|i was wrong|that was mean of me)\b/,
    love: /\b(i love you|love you so much|you mean a lot|you're my favorite|grateful for you)\b/,
    hostile: /\b(kys|you're trash|ur trash|clown|you're annoying|nobody asked|get out|mind your (own )?business|go die|drop dead|i don't care about you)\b/,
    sad: /\b(down|bummed|blue|gutted|devastated|heartbroken|lost|overwhelmed|stressed|drained|burnt out|burned out|miserable|not okay|i'm not ok|falling apart|so done|over it|can't do this)\b/,
    scared: /\b(spooked|creeped out|on edge|jumpy|shaking|can't breathe|freaked out|paranoid|nightmare|nightmares)\b/,
    angry: /\b(annoyed|irritated|livid|rage|raging|so done|hate him|hate her|makes me so mad|fuming)\b/,
    disclose: /\b(wasted|hammered|booze|whiskey|vodka|hungover|slap(s|ped)?|shove[sd]?|push(es|ed) me|threaten(s|ed)?|screams at|smacks?|belt|locked me out|kicked me out)\b/,
    selfharm: /\b(kms|unalive|wish i (was|were) dead|don't want to wake up|disappear forever|sewer slide|end it|not be here anymore)\b/,
    yes: /^(bet|ofc|of course|absolutely|for sure|yessir|yes please|uh huh|mhm|totally|obviously)\b/,
    no: /^(no thanks|hell no|pass|i'm good|nah fam|no way)\b/,
    food: /\b(pizza|chips|cereal|mac and cheese|famished|stomach('s)? growling|haven't eaten|didn't eat|no food)\b/,
    money: /\b(poor|rich|allowance|paycheck|savings|saved up|shoebox)\b/,
    stay: /\b(can i sleep (at|over)|put me up|crash at yours|stay at yours|room for me)\b/,
    run: /\b(bounce|dip out|leave town|get outta here|skip town|take off|hit the road|run off|go somewhere else|never go back)\b/,
    help: /\b(i'm stuck|help me out|what would you do|any ideas|i need you)\b/,
    howru: /\b(how are you|how's it going|how you doing|how have you been|how are things|how was your day|you good|you okay|are you ok|and you)\b/,
    wyd: /\b(what are you doing|what you doing|what are you up to|what's up with you|whatcha doing)\b/,
    bored: /\b(bored|boring|nothing to do|so bored)\b/,
    excited: /\b(excited|can't wait|hyped|stoked|pumped|so happy)\b/,
    confused: /\b(confused|don't understand|what do you mean|wdym|makes no sense|i don't get it)\b|^huh\??$/,
    embarrassed: /\b(embarrass\w*|cringe|humiliat\w*|awkward|so dumb of me)\b/,
    guilty: /\b(my fault|guilty|i ruin|ruined everything|i'm the problem|i'm a burden|burden|everyone would be better)\b/,
    unfair: /\b(unfair|not fair|jealous|why does (she|he|lily) get|always my fault)\b/,
    sick: /\b(sick|stomach ?ache|headache|throw up|threw up|nauseous|fever|coughing|asthma|inhaler|wheez\w*)\b/,
    games: /\b(skyforge|video games?|gaming|console|xbox|switch|playstation|minecraft|fortnite|roblox|ice wyrm)\b/,
    art: /\b(draw(ing|s)?|art|sketch\w*|paint(ing)?|comic|doodle)\b/,
    skate: /\b(skate\w*|skateboard|kickflip|ollie|the bowl)\b/,
    animals: /\b(dog|cat|turtle|sheldon|newton|puppy|kitten|pet|raccoon)\b/,
    halloween: /\b(halloween|costume|trick or treat|the dance)\b/,
    work: /\b(job|jobs|hustle|business|selling|rak(e|ing) leaves|earn(ing)?|make money|side hustle|car wash|lemonade)\b/,
    train: /\b(train|trains|railway|railroad|amtrak|northline|platform|conductor)\b/,
    future: /\b(when i grow up|the future|someday|one day|college|my dream|i want to be)\b/,
    please: /\b(please|pretty please|i'm begging|i beg you)\b/,
    grandma: /\b(grandma|grandmother|nana|gran|rose|cedar falls|larkspur)\b/,
    mom: /\b(mom|mother|my mom|dana|parent|parents|guardian)\b/,
    time: /\b(what time|when does|when is|next train|how long|schedule|timetable|departs?|leaves? at|arriv\w*)\b/,
    truth: /\b(the truth|honestly|to be honest|tbh|i lied|i'm lying|okay fine|i'll be honest|real talk|i ran away|i'm running away|i'm alone|by myself)\b/,
    ticket: /\b(tickets?|fare|one way|round trip)\b/,
    agree: /^(true|facts|exactly|same|agreed|real|valid|fair|so true|right)\b/,
  };
  const NEG = { sad: 'sad', upset: 'sad', scared: 'scared', afraid: 'scared', worried: 'scared', angry: 'angry', mad: 'angry', hungry: 'food', tired: 'tired', cold: 'cold', bored: 'bored' };
  const baseAn = N.analyze;
  N.analyze = function (raw) {
    const an = baseAn(raw), t = an.t;
    for (const k in EXTRA) if (EXTRA[k].test(t)) an.I[k] = 1;
    if (an.I.selfharm) delete an.I.joke;
    // "i'm not scared" shouldn't count as scared
    const re = /\b(not|never|isn't|aren't|wasn't|no longer)\s+(really\s+|that\s+|very\s+|even\s+|too\s+)?(sad|upset|scared|afraid|worried|angry|mad|hungry|tired|cold|bored)\b/g; let m;
    while ((m = re.exec(t))) { const k = NEG[m[3]]; if (k && !/\b(so|really|very) (sad|scared|angry)\b/.test(t.replace(m[0], ''))) { delete an.I[k]; an.negated = (an.negated || []).concat(k); } }
    if (an.I.bye && an.I.selfharm) delete an.I.bye;
    if (an.I.disclose && /\bdrink(ing)? (some |a |my )?(water|juice|milk|soda|coffee|tea|lemonade|cocoa|pop)\b/.test(t) && !/\b(drunk|beer|hit|grab|bruise|yell|scream|wasted|hammered|shove|push|slap)/.test(t)) delete an.I.disclose;
    if (an.I.wyd) delete an.I.who;
    an.honest = (an.I.sad || an.I.scared || an.I.angry || an.I.disclose || an.I.truth || an.I.guilty) && an.len >= 4 && !an.I.joke;
    return an;
  };
  // understand the new places when people mention them
  const baseLoc = N.analyze;
  N.analyze = function (raw) { const an = baseLoc(raw); if (/\b(train station|harlow station|northline|platform)\b/.test(an.t)) an.loc = 'station'; return an; };

  /* ---------- characters answer the new intents instead of saying filler ---------- */
  const basePick = N.pick;
  N.pick = function (conv, key, arr) { if (key === 'fb' && conv) conv._fb = true; return basePick.apply(this, arguments); };
  const L = {
    mom: { howru: ['Tired. Good tired, mostly. Better now you asked.', 'Honestly? My feet hurt and the car\'s making the noise again. But you asking makes it better.'], wyd: ['Bills. Always bills. Come sit with me, I\'ll pretend to do math.'], bored: ['Bored? I have a whole sink of dishes that would LOVE to meet you.'],
      excited: ['Look at that smile. Tell me everything.'], confused: ['Sorry, baby, I\'m not making sense. Long shift. Ask me again.'], embarrassed: ['Oh, honey. Everybody\'s embarrassing at twelve. I once fell UP the stairs at my own recital.'], guilty: ['Hey. No. None of this is your fault. Do you hear me? Grown-up problems are grown-up problems.'],
      unfair: ['I know it feels that way. Sometimes it is. I\'m sorry.'], sick: ['Come here. Let me feel your forehead. ...Warm-ish. Juice and bed.'], games: ['Is that the dragon game? Show me later. I\'ll be bad at it.'], art: ['You were always drawing. On everything. Including my walls. I kept one.'], animals: ['If Newton could live here, I\'d let him. Rick\'s allergic. Or says he is.'],
      halloween: ['What are you going as? You still have the knight helmet from two years ago…'], work: ['You\'ve been working? My little hustler. Just don\'t let it eat your homework.'], train: ['Trains. Your grandpa used to take you to watch them. You\'d wave at every single one.'], future: ['You\'ll do anything you want. I believe that. I have to.'], please: ['...Okay. Okay. What do you need?'], agree: ['Mm-hm. Exactly.'] },
    jordan: { howru: ['im chillin. my mom made me clean the garage so. surviving', 'good!! skated today, ate it twice, got it the third time 🔥'], wyd: ['nothing lol. eating chips in the dark like a gremlin', 'watching skate vids. u?'], bored: ['same. wanna skate?', 'bored gang 🤝'], excited: ['LETS GOOO', 'yesss what happened'],
      confused: ['wdym lol', 'bro i\'m lost'], embarrassed: ['lmao everyone forgot already i promise', 'dude remember when i puked on the field trip bus. u r FINE'], guilty: ['it\'s literally not ur fault. like at all.'], unfair: ['fr that\'s so unfair'], sick: ['ew stay away lol. jk feel better'],
      games: ['SKYFORGE TONIGHT?? i\'ll carry u. again. 😤', 'did u get the dragon skin yet'], art: ['ur drawings go hard ngl', 'draw me as a wizard. a buff wizard'], skate: ['bowl after school??', 'i finally landed a kickflip. no one saw. it counts'], animals: ['newton is the goat. the dog. u know what i mean'],
      halloween: ['we\'re going as the ice wyrm. u r the back half', 'the dance is gonna be so cringe. we\'re going obviously'], work: ['u r like a CEO now', 'lmao capitalism'], train: ['trains are lowkey cool. my uncle rode one to the capital once, said it smelled like hot dogs'], future: ['i\'m gonna be a pro skater or a dentist. no in between'], please: ['ok ok fine'], agree: ['facts', 'fr'] },
    lily: { howru: ['good!! sheldon ate a strawberry', 'i lost a tooth almost'], wyd: ['teaching sheldon to count. he\'s at 2.'], bored: ['wanna play restaurant? i\'m the chef. you\'re the customer who is rude.'], excited: ['YAYYYY'], confused: ['huh?'], embarrassed: ['i fell at recess and everyone saw my underwear. it had turtles. so it\'s fine.'],
      guilty: ['it\'s not your fault. sheldon says.'], sick: ['do you want my blanket? it has a bear.'], games: ['can i play too? i\'ll be the dragon'], art: ['draw sheldon! draw sheldon as a king!'], animals: ['SHELDON!!!'], halloween: ['I\'m going as a TURTLE. obviously.'], work: ['can i work too? i can yell really loud'], please: ['okay but you owe me'], agree: ['yeah!'] },
    grandma: { howru: ['Oh, I\'m fine, mijo. My knee knows when it\'s going to rain before the weatherman does.', 'Better now. I made too much soup again.'], wyd: ['Watching my program. The detective is about to find out it was the brother. It\'s always the brother.'], bored: ['Bored! When I was your age we didn\'t have bored. We had chores.'],
      guilty: ['Listen to your grandmother. Nothing that happens in that house is your fault. Nothing.'], sick: ['Honey and lemon and a hot bath. And call me in the morning.'], art: ['I still have the turkey you drew me when you were five. On the fridge. It will be on the fridge when I die.'], train: ['The train comes right into Cedar Falls, you know. Two hours. I used to take it to see your mother.'],
      future: ['You\'re going to be something. I don\'t know what. Something good.'], work: ['Working! Save some, spend some. That\'s the rule.'], please: ['Anything, sweet pea. What is it?'], agree: ['That\'s right.'] },
    okafor: { howru: ['I\'m well, thank you for asking. People rarely do. How about you — really?'], wyd: ['Paperwork. Mountains of it. You\'re a welcome interruption.'], bored: ['Bored can mean a lot of things. Sometimes it means "tired of feeling the same."'], confused: ['That\'s okay. Let me try it another way.'],
      embarrassed: ['Embarrassment passes faster than it feels like it will. I promise.'], guilty: ['I want to push back on that gently. Kids aren\'t responsible for adults\' choices.'], unfair: ['It sounds like you\'re carrying more than your share.'], sick: ['Do you want to go to the nurse? You can come back after.'], art: ['I\'d love to see your drawings sometime. Art is a good place to put big feelings.'],
      future: ['What\'s one thing you\'d want future-you to know?'], work: ['Earning your own money can feel like control. Is that part of it?'], train: ['Trains. Is someone far away you\'d like to see?'], please: ['I\'m listening.'], agree: ['Mm. I thought so too.'] },
    patel: { howru: ['Old! But well. Newton is well. Newton is always well.'], wyd: ['Arguing with my crossword. It is winning.'], bored: ['Newton needs a walk, if you are bored. He is never bored. He is a philosopher.'], animals: ['Newton says you are his favorite. Don\'t tell the mailman.'], art: ['You draw? Draw Newton. He will pose. He will not move. He is very lazy.'],
      work: ['A young businessperson! My father sold bangles door to door. Keep your receipts, beta.'], train: ['I came to this town on the train, forty years ago, with one suitcase. It was raining. It is always raining when something begins.'], guilty: ['Beta. No. That is not yours to carry.'] },
    rick: { howru: ['...Fine. Why.', 'How do you think.'], wyd: ['What\'s it look like.'], bored: ['Bored? Go mow the lawn.'], games: ['Is that why the internet bill\'s so high.'], work: ['Working, huh. Hope they\'re paying you more than they paid me.'], unfair: ['Life\'s unfair. Get used to it.'], sick: ['Take a Tylenol.'] },
    wren: { howru: ['Alive. That\'s a good day out here.'], wyd: ['Reading. Pretending I\'m somewhere else.'], bored: ['Out here bored is the best-case scenario. Bored means nothing bad is happening.'], guilty: ['Kid, whatever you think you did, it didn\'t earn you this.'], train: ['Don\'t hop freights. I knew a guy. Just — don\'t.'], future: ['Future. Ha. Get a warm place first. Then future.'], work: ['Get your money before you leave, not after. After, nobody hires a kid with a backpack.'] },
    dolores: { howru: ['On my feet since five. But the pie came out good.'], wyd: ['Refilling ketchups. Glamorous, huh?'], sick: ['Chicken soup. On the house. Don\'t argue.'], work: ['Want some work? Flyers on weekends. Fifteen bucks.'], train: ['The 9:10 to Cedar Falls rattles my windows every night. You get used to it.'] },
    tyler: { howru: ['Why do you care.'], games: ['...What rank are you. — Whatever. I\'m higher.'], skate: ['You can\'t even ollie.'], animals: ['...I have a dog. Shut up.'] },
  };
  const LISTEN = { mom: ['You {r}? Tell me more, baby.', 'Wait. You {r}? Since when?'], grandma: ['You {r}? Oh, sweet pea. Keep going.'], okafor: ['It sounds like you {r}. Can you say more about that?', 'You {r}. What does that feel like?'], wren: ['You {r}. Yeah. I get that.'], patel: ['You {r}? Sit. Tell me.'], dolores: ['You {r}, huh? I\'ve got time.'], jordan: ['wait u {r}?? since when'] };
  const ORDER = ['howru', 'wyd', 'guilty', 'sick', 'unfair', 'embarrassed', 'confused', 'excited', 'bored', 'work', 'train', 'future', 'games', 'art', 'skate', 'animals', 'halloween', 'please', 'agree'];
  Object.keys(SH.Brain).forEach((npc) => {
    if (npc === 'dex' || npc === 'lighthouse' || npc === 'class') return; // leave the groomer and the crisis line scripted
    const base = SH.Brain[npc];
    SH.Brain[npc] = function (an, c) {
      c._fb = false;
      const r = base.call(this, an, c);
      if (!c._fb || an.has('selfharm')) return r;
      const lines = L[npc] || {};
      for (const k of ORDER) if (an.I[k] && lines[k]) { c.used = c.used || {}; const say = basePick(c, 'vx_' + k, lines[k]); const fx = { howru: { rel: 2 }, guilty: { stress: -3, rel: 2 }, excited: { mood: 3 }, embarrassed: { stress: -2 } }[k] || {}; return Object.assign({}, r, { say, fx: Object.assign({}, r.fx || {}, fx) }); }
      const rf = N.reflect(an.t); if (rf && LISTEN[npc] && Math.random() < 0.45 && an.len >= 4) { const tpl = U.pick(LISTEN[npc]); return Object.assign({}, r, { say: tpl.replace('{r}', rf.replace(/^you /, '')) }); }
      return r;
    };
  });
})(window.SH);
