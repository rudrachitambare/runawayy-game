/* SMALL HOURS — lexicon v3. A deeper parse of whatever the player types:
   - ~350 more slang / shorthand / misspelling mappings and multi-word phrase rewrites
   - more ways to say every feeling, plus new intents (happy, proud, jealous, bored, guilty, curious…)
   - clause splitting, question type, people/place/time entities
   - FACT extraction ("my favorite color is green", "i have a math test friday", "call me Sammy")
   - MEMORY questions ("what's my favorite color?", "remember what i said about rick?", "what do you know about me")
   - OPINION questions ("do you like pizza", "what do you think of tyler", "what's your favorite movie")
   All of it lands on the same `an` object the characters already read, so nothing else has to change. */
(function (SH) {
  const N = SH.NLP;
  /* ---------- more words ---------- */
  const X2 = {
    // texting shorthand
    wyd: 'what are you doing', wya: 'where are you', hmu: 'hit me up', ily2: 'i love you too', lmk: 'let me know', nvm: 'never mind', nm: 'not much', ikr: 'i know right', icl: "i can't lie",
    iirc: 'if i remember correctly', afaik: 'as far as i know', tbd: 'to be decided', fyi: 'for your information', jk: 'just kidding', btw: 'by the way', ofc: 'of course', idgaf: "i don't care",
    wdym: 'what do you mean', wtv: 'whatever', whatev: 'whatever', whatevs: 'whatever', stfu: 'shut up', gtfo: 'get out', imho: 'in my opinion', tldr: 'basically', ig: 'i guess', iykyk: 'you know',
    hbd: 'happy birthday', gg: 'good game', ez: 'easy', rip: 'rest in peace', oof: 'oof', yikes: 'yikes', ugh: 'ugh', meh: 'meh', huh: 'huh', wut: 'what', wot: 'what', wha: 'what', whut: 'what',
    y: 'why', wy: 'why', bcs: 'because', cause: 'because', cos: 'because', tho: 'though', thru: 'through', nite: 'night', tonite: 'tonight', '2moro': 'tomorrow', tmw: 'tomorrow', yday: 'yesterday', ystd: 'yesterday',
    r: 'are', u: 'you', ur: 'your', urs: 'yours', urself: 'yourself', ure: "you're", im: "i'm", ima: "i'm going to", imma: "i'm going to", ive: "i've", iam: 'i am',
    wont: "won't", cant: "can't", dont: "don't", doesnt: "doesn't", didnt: "didn't", isnt: "isn't", wasnt: "wasn't", werent: "weren't", havent: "haven't", hasnt: "hasn't", shouldnt: "shouldn't", wouldnt: "wouldn't", couldnt: "couldn't",
    thats: "that's", whats: "what's", wheres: "where's", whos: "who's", hows: "how's", theres: "there's", heres: "here's", lets: "let's", its: "it's", hes: "he's", shes: "she's", theyre: "they're", youre: "you're", were2: 'were',
    // slang
    sus: 'suspicious', mid: 'mediocre', bussin: 'really good', slaps: 'is great', goated: 'the best', lit: 'great', dope: 'cool', sick2: 'cool', rad: 'cool', based: 'cool',
    cringe: 'embarrassing', cringy: 'embarrassing', salty: 'annoyed', pressed: 'annoyed', triggered: 'upset', shook: 'shocked', vibe: 'feeling', vibes: 'feeling', vibing: 'relaxing',
    chillin: 'relaxing', chilling: 'relaxing', lowkey2: 'kind of', simp: 'fan', stan: 'fan', bestie: 'best friend', bff: 'best friend', homie: 'friend', buddy: 'friend', pal: 'friend', dawg: 'bro', dude: 'dude', mate: 'friend',
    yeet: 'throw', finna: 'going to', boutta: 'about to', bout: 'about', abt: 'about', ab: 'about', gimme: 'give me', lemme: 'let me', wanna: 'want to', gotta: 'got to', hafta: 'have to', oughta: 'ought to', kinda: 'kind of',
    nah: 'no', nahh: 'no', noo: 'no', nooo: 'no', yass: 'yes', yas: 'yes', yesss: 'yes', yess: 'yes', yuh: 'yeah', yeahh: 'yeah', mhmm: 'yes', uhuh: 'yes', nuh: 'no', nuhuh: 'no',
    // misspellings
    becuz: 'because', becaus: 'because', beacuse: 'because', bcause: 'because', freinds: 'friends', frens: 'friends', gurl: 'girl', gud: 'good', gd: 'good', nvr: 'never', evry: 'every', evryone: 'everyone', evrything: 'everything',
    somthing: 'something', sumthing: 'something', smth: 'something', sth: 'something', nothign: 'nothing', anythign: 'anything', thier: 'their', tommorow: 'tomorrow', tomorow: 'tomorrow', tomorrw: 'tomorrow', tonigth: 'tonight',
    recieve: 'receive', beleive: 'believe', belive: 'believe', untill: 'until', wich: 'which', whith: 'with', wiht: 'with', teh: 'the', hte: 'the', adn: 'and', nad: 'and', waht: 'what', wat2: 'what', whta: 'what', hwo: 'how', ot: 'to',
    sad2: 'sad', saad: 'sad', happpy: 'happy', hapy: 'happy', angy: 'angry', angery: 'angry', scaredd: 'scared', srry: 'sorry', sorrry: 'sorry', sowwy: 'sorry', thnks: 'thanks', thanku: 'thank you', thankyou: 'thank you', tyty: 'thanks',
    pleez: 'please', plox: 'please', pwease: 'please', hlp: 'help', halp: 'help', hepl: 'help', skool: 'school', scool: 'school', shcool: 'school', techer: 'teacher', teecher: 'teacher', homwork: 'homework', hw: 'homework', math2: 'math',
    stepfather: 'stepdad', stepdads: "stepdad's", moms: "mom's", mommas: "mom's", momma: 'mom', mama2: 'mom', ma2: 'mom', grams: 'grandma', gramma: 'grandma', grandmas: "grandma's", nana2: 'grandma', sis2: 'sister', bro2: 'brother',
    favorite: 'favorite', favourite: 'favorite', fave: 'favorite', fav: 'favorite', favs: 'favorites', faves: 'favorites', colour: 'color', colours: 'colors', bday2: 'birthday', birfday: 'birthday', burthday: 'birthday',
  };
  // multi-word rewrites that single-token maps can't do
  const PHR = [
    [/\bhow (are|r) (you|u) doing\b/g, 'how are you'], [/\bhow('s| is) it going\b/g, 'how are you'], [/\bwhat('s| is) up\b/g, 'what are you doing'], [/\bwhat are you up to\b/g, 'what are you doing'],
    [/\bhow have you been\b/g, 'how are you'], [/\byou good\??$/g, 'are you okay'], [/\bu good\??$/g, 'are you okay'], [/\bare you alright\b/g, 'are you okay'],
    [/\bi don't wanna\b/g, "i don't want to"], [/\bi dont know\b/g, "i don't know"], [/\bi do not\b/g, "i don't"], [/\bi can not\b/g, "i can't"], [/\bi am not\b/g, "i'm not"], [/\bi am\b/g, "i'm"],
    [/\bdo you remember\b/g, 'remember'], [/\bdo u remember\b/g, 'remember'], [/\bd'?you remember\b/g, 'remember'], [/\byou remember\b/g, 'remember'],
    [/\bfav(ou?rite)?\b/g, 'favorite'], [/\bmy fave\b/g, 'my favorite'], [/\bi really really\b/g, 'i really'], [/\bkind of\b/g, 'kind of'], [/\bsort of\b/g, 'kind of'],
    [/\bno one\b/g, 'nobody'], [/\bnoone\b/g, 'nobody'], [/\bevery one\b/g, 'everyone'], [/\bwhat do you mean\b/g, 'what do you mean'], [/\bwhy not\b/g, 'why not'],
  ];
  const baseNorm = N.normalize;
  N.normalize = function (raw) {
    let t = String(raw || '').toLowerCase().replace(/[’‘]/g, "'");
    t = t.split(/\s+/).map((w) => { const m = w.match(/^([a-z0-9']+)([^a-z0-9']*)$/); if (!m) return w; const k = m[1].replace(/'/g, ''); if (X2[k] != null && !/\d$/.test(X2[k]) && X2[k] !== k) return X2[k] + m[2]; return w; }).join(' ');
    t = baseNorm(t);
    PHR.forEach(([re, rep]) => { t = t.replace(re, rep); });
    return t.replace(/\s+/g, ' ').trim();
  };

  /* ---------- more intents / phrasings ---------- */
  const MORE = {
    happy: /\b(happy|glad|great day|good day|best day|stoked|pumped|hyped|thrilled|over the moon|so good|feeling good|feel good|amazing|wonderful|awesome day)\b/,
    proud: /\b(proud|i did it|nailed it|aced|got an a|passed|won|finally landed|i made it)\b/,
    jealous: /\b(jealous|envious|not fair that (he|she|they))\b/,
    lonely: /\b(lonely|no friends|nobody to talk to|all alone|by myself all|left out|ignored|invisible)\b/,
    bored: /\b(bored|boring|nothing to do|so dull)\b/,
    excited: /\b(excited|can't wait|cannot wait|so hyped|looking forward)\b/,
    guilty: /\b(my fault|guilty|i ruined|because of me|i caused|blame myself|i'm the problem|i'm a burden)\b/,
    confused: /\b(confused|don't get it|don't understand|makes no sense|what do you mean|wdym|huh\??$)\b/,
    curious: /\b(i wonder|curious|just wondering|why is|how come)\b/,
    howru: /\b(how are you|how you feeling|how do you feel|how was your day|how's your day|you okay\??$|are you okay)\b/,
    wyd: /\b(what are you doing|what you doing|doing anything|busy\??$)\b/,
    sick: /\b(sick|fever|throw(ing)? up|threw up|puked|headache|stomach ?ache|cough|flu|cold (and|&))\b/,
    music: /\b(music|song|songs|band|album|rap|playlist|spotify|headphones|singer|concert)\b/,
    movie: /\b(movie|movies|film|show|series|netflix|youtube|anime|cartoon)\b/,
    sports: /\b(soccer|basketball|football|baseball|hockey|sports?|team|practice|game tonight)\b/,
    animals: /\b(dog|dogs|cat|cats|puppy|kitten|turtle|sheldon|newton|pet|pets|animal|animals|bird|hamster|fish)\b/,
    games: /\b(skyforge|video games?|gaming|console|xbox|playstation|switch|minecraft|fortnite|roblox)\b/,
    art: /\b(draw|drawing|drew|sketch|sketchbook|paint|painting|art|comic|comics|doodle)\b/,
    skate: /\b(skate|skating|skateboard|board|kickflip|ollie|bowl)\b/,
    future: /\b(when i grow up|in the future|someday|one day i|future|college|when i'm older|dream job)\b/,
    halloween: /\b(halloween|costume|trick or treat|candy)\b/,
    what: /^(what|wut|huh|hm+|excuse me|come again|pardon)\??$/,
    why: /^(why|how come|why not|but why|why\?+|for what)\??$/,
    really: /^(really|for real|seriously|are you serious|no way|wait what|fr)\??!?$/,
    agree: /^(true|facts|exactly|same|agreed|real|valid|fair|so true|right|ikr|i know right|mood)\b/,
    laugh: /^(lol|lmao|haha+|hehe+|laughing|rofl|xd)\W*$/,
    idk: /^(i don't know|idk|not sure|dunno|no idea|i'm not sure|beats me|maybe)\W*$/,
  };
  // things the player might name as an opinion topic — map to a canonical id
  const PEOPLE = [['mom', /\b(mom|mother|dana|mama)\b/], ['rick', /\b(rick|stepdad)\b/], ['lily', /\b(lily|sister)\b/], ['jordan', /\bjordan\b/], ['grandma', /\b(grandma|rose)\b/], ['okafor', /\b(okafor|counselor)\b/],
    ['patel', /\b(patel)\b/], ['tyler', /\btyler\b/], ['dex', /\bdex\b/], ['maya', /\bmaya\b/], ['ruiz', /\b(ruiz|librarian)\b/], ['wren', /\bwren\b/], ['dolores', /\bdolores\b/], ['newton', /\bnewton\b/], ['sheldon', /\bsheldon\b/]];
  const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  const clean = (s) => String(s || '').replace(/\b(too|lol|lmao|tbh|honestly|though|i guess|a lot|so much|really|haha)\b/g, '').replace(/[^a-z0-9' \-]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 40);
  const dayOffset = (t) => { if (/\btonight\b|\btoday\b|\blater\b/.test(t)) return 0; if (/\btomorrow\b/.test(t)) return 1; const m = t.match(/\b(this |next |on )?(monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/); if (!m) return null; const w = SH.wd ? SH.wd() : 0; let o = (DAYS.indexOf(m[2]) - w + 7) % 7; if (o === 0 || m[1] === 'next ') o += 7; return o; };

  /* ---------- facts the player states about themselves ---------- */
  const FACTS = [
    [/\bmy (?:all ?time |absolute )?favorite ([a-z ]{2,18}?) (?:is|are|was|would be) (?:probably |definitely |prob )?(.+)/, (m) => ({ kind: 'fav', key: 'fav:' + m[1].trim().replace(/s$/, ''), cat: m[1].trim(), v: clean(m[2]) })],
    [/\bi (?:really |kind of |totally |absolutely )?(?:love|like|adore|enjoy|am obsessed with|'m obsessed with|'m into|am into|'m a fan of) (?!you\b|u\b|ya\b|it when)(.+)/, (m) => ({ kind: 'like', key: 'like:' + clean(m[1]), v: clean(m[1]) })],
    [/\bi (?:really |kind of |totally )?(?:hate|can't stand|don't like|dislike|despise|am sick of|'m sick of) (?!you\b|u\b|ya\b|myself\b|my life\b|it here)(.+)/, (m) => ({ kind: 'dislike', key: 'dislike:' + clean(m[1]), v: clean(m[1]) })],
    [/\bi'?m (?:really |pretty |kind of )?good at (.+)/, (m) => ({ kind: 'skill', key: 'skill:' + clean(m[1]), v: clean(m[1]) })],
    [/\bi'?m (?:really |so |kind of )?(?:scared|afraid|terrified|frightened) of (.+)/, (m) => ({ kind: 'fear', key: 'fear:' + clean(m[1]), v: clean(m[1]) })],
    [/\bi (?:want|wanna|'d like|would like|hope) to (?:be|become) an? (.+?)(?: when i grow up| someday| one day|$)/, (m) => ({ kind: 'dream', key: 'dream', v: clean(m[1]) })],
    [/\bwhen i grow up i (?:want to|wanna|'m going to) be an? (.+)/, (m) => ({ kind: 'dream', key: 'dream', v: clean(m[1]) })],
    [/\bmy birthday(?: is|'s)(?: on)? (.+)/, (m) => ({ kind: 'birthday', key: 'birthday', v: clean(m[1]) })],
    [/\bmy (dog|cat|turtle|pet|fish|hamster|bird|rabbit|lizard)(?:'s)? (?:name is|is called|is named) (\w+)/, (m) => ({ kind: 'pet', key: 'pet', v: m[2] + ' (' + m[1] + ')' })],
    [/\bi have an? (dog|cat|turtle|pet|fish|hamster|bird|rabbit|lizard) (?:named|called) (\w+)/, (m) => ({ kind: 'pet', key: 'pet', v: m[2] + ' (' + m[1] + ')' })],
    [/\b(?:call me|you can call me|everyone calls me|my nickname is) ([a-z]{2,14})\b/, (m) => ({ kind: 'nick', key: 'nick', v: m[1].charAt(0).toUpperCase() + m[1].slice(1) })],
    [/\bmy best friend(?: is|'s) (\w+)/, (m) => ({ kind: 'bff', key: 'bff', v: clean(m[1]) })],
    [/\bi got an? ([a-f][+-]?|\d{1,3}%?)(?: on| in) (?:my |the )?(.+)/, (m) => ({ kind: 'grade', key: 'grade:' + clean(m[2]), v: m[1].toUpperCase() + ' on ' + clean(m[2]) })],
    [/\bi miss (?!you\b|u\b)(.+)/, (m) => ({ kind: 'miss', key: 'miss:' + clean(m[1]), v: clean(m[1]) })],
    [/\bi wish (.+)/, (m) => ({ kind: 'wish', key: 'wish', v: clean(m[1]) })],
    [/\bi (?:have|got|'ve got) (?:a |an |my |this |the )?(?:(?:big|huge|stupid|dumb|important|scary|major|final|little|whole) )?((?:math |science |history |english |spelling |reading |art |band |soccer |basketball |swim |chess |talent )?(?:test|quiz|exam|game|match|tryouts?|recital|practice|presentation|project|appointment|doctor|dentist|field trip|dance|sleepover|party|fair|bee|concert|audition|show|meet|competition|tournament|interview|contest|play|report|essay))(?: due)?(.*)/, (m, t) => { const o = dayOffset(m[2] || t); return o == null ? null : { kind: 'event', key: 'event:' + m[1], v: m[1], due: o }; }],
    [/\bi'?m going to (?:the |a )?([a-z ]{3,24}?) (tomorrow|tonight|on \w+day|this \w+day|next \w+day|friday|saturday|sunday|monday|tuesday|wednesday|thursday)\b/, (m) => { const o = dayOffset(m[2]); return o == null ? null : { kind: 'event', key: 'event:' + clean(m[1]), v: 'going to ' + clean(m[1]), due: o }; }],
  ];

  /* ---------- questions about memory ---------- */
  const MEMQ = [
    [/\b(?:what(?:'s| is| was)|remember|know|tell me) my favorite ([a-z ]{2,18}?)\??$/, (m) => ({ kind: 'fact', key: 'fav:' + m[1].trim().replace(/s$/, ''), desc: 'favorite ' + m[1].trim() })],
    [/\bwhat(?:'s| is) my favorite\b|\bremember my favorite\b/, () => ({ kind: 'favs' })],
    [/\b(?:what(?:'s| is)|remember|know) my (name|nickname)\b/, () => ({ kind: 'fact', key: 'nick', desc: 'name' })],
    [/\b(?:what(?:'s| is)|remember|know|when is|when's) my birthday\b/, () => ({ kind: 'fact', key: 'birthday', desc: 'birthday' })],
    [/\b(?:what(?:'s| is)|remember|know) my (?:dog|cat|turtle|pet|fish|hamster)(?:'s)? name\b|\bremember my (?:dog|cat|pet)\b/, () => ({ kind: 'fact', key: 'pet', desc: "pet's name" })],
    [/\b(?:what do i want to be|remember what i want to be|what's my dream)\b/, () => ({ kind: 'fact', key: 'dream', desc: 'dream' })],
    [/\bwho(?:'s| is) my best friend\b/, () => ({ kind: 'fact', key: 'bff', desc: 'best friend' })],
    [/\bwhat (?:do|did) i (?:like|love|enjoy)\b|\bwhat am i into\b|\bwhat things do i like\b/, () => ({ kind: 'likes' })],
    [/\bwhat (?:do|did) i (?:hate|not like|dislike)\b/, () => ({ kind: 'dislikes' })],
    [/\bwhat (?:am i|i'm) (?:scared|afraid) of\b/, () => ({ kind: 'fears' })],
    [/\bwhat do you know about me\b|\bwhat have i told you\b|\bhow well do you know me\b|\btell me about (?:me|myself)\b/, () => ({ kind: 'about' })],
    [/\bremember me\b|\bdo you know who i am\b|\bhave we (?:met|talked) before\b/, () => ({ kind: 'meet' })],
    [/\b(?:remember|recall) (?:when|what|how|that)? ?i (?:said|told you|mentioned|talked)(?: about)? ?(.*)/, (m) => ({ kind: 'search', who: 'me', q: m[1] })],
    [/\bwhat did i (?:say|tell you|mention)(?: about)? ?(.*)/, (m) => ({ kind: 'search', who: 'me', q: m[1] })],
    [/\bdid i (?:tell you|say|mention)(?: about| that)? ?(.*)/, (m) => ({ kind: 'search', who: 'me', q: m[1] })],
    [/\bwhat did you (?:say|tell me)(?: about)? ?(.*)/, (m) => ({ kind: 'search', who: 'you', q: m[1] })],
    [/\bremember (?:the |our |that |when )(.+)/, (m) => ({ kind: 'search', who: 'both', q: m[1] })],
    [/\bwhat were we (?:talking|texting) about\b|\bwhere were we\b|\bwhat was i saying\b/, () => ({ kind: 'last' })],
  ];
  /* ---------- opinion questions aimed at the character ---------- */
  const OPQ = [
    [/\bwhat(?:'s| is) your favorite ([a-z ]{2,18}?)\??$/, (m) => ({ kind: 'fav', cat: m[1].trim().replace(/s$/, '') })],
    [/\bdo you (?:even )?(?:like|love|enjoy|hate) ([a-z' ]{2,30}?)\??$/, (m) => ({ kind: 'op', x: m[1].trim() })],
    [/\bwhat do you think (?:of|about) ([a-z' ]{2,30}?)\??$/, (m) => ({ kind: 'op', x: m[1].trim() })],
    [/\bhow do you feel about ([a-z' ]{2,30}?)\??$/, (m) => ({ kind: 'op', x: m[1].trim() })],
    [/\bare you (?:into|a fan of) ([a-z' ]{2,30}?)\??$/, (m) => ({ kind: 'op', x: m[1].trim() })],
    [/\b(?:is|are) ([a-z' ]{2,24}?) (?:good|cool|bad|overrated|underrated)\??$/, (m) => ({ kind: 'op', x: m[1].trim() })],
  ];

  const baseAn = N.analyze;
  N.analyze = function (raw) {
    const an = baseAn(raw), t = an.t;
    for (const k in MORE) if (MORE[k].test(t)) an.I[k] = 1;
    if (an.I.love && /\b(love|like) (pizza|it|that|this|games?|skyforge|drawing|music|dogs?|cats?)\b/.test(t) && !/\blove (you|u|ya)\b/.test(t)) delete an.I.love;
    an.clauses = t.split(/[.!?;]+|\bbut\b|\band then\b|,\s*(?=i |my |he |she )/).map((s) => s.trim()).filter(Boolean);
    an.qtype = an.q ? ((t.match(/^(who|what|where|when|why|how)\b/) || [])[1] || 'yn') : null;
    an.people = PEOPLE.filter(([, re]) => re.test(t)).map(([id]) => id);
    an.pron = /\b(he|him|his)\b/.test(t) ? 'm' : /\b(she|her|hers)\b/.test(t) ? 'f' : /\b(they|them)\b/.test(t) ? 'n' : null;
    an.facts = []; const seen = new Set();
    an.clauses.forEach((cl) => FACTS.forEach(([re, fn]) => { const m = cl.match(re); if (!m) return; const f = fn(m, cl); if (f && f.v && f.v.length >= 2 && !seen.has(f.key)) { seen.add(f.key); an.facts.push(f); } }));
    an.memq = null; for (const [re, fn] of MEMQ) { const m = t.match(re); if (m) { an.memq = fn(m); if (an.memq.q != null) an.memq.q = clean(an.memq.q.replace(/\b(yesterday|earlier|last night|before|the other day|today|about)\b/g, '')); an.memq.when = /\byesterday|last night\b/.test(t) ? 1 : /\bearlier|today\b/.test(t) ? 0 : null; break; } }
    an.opq = null; if (!an.memq) for (const [re, fn] of OPQ) { const m = t.match(re); if (m) { an.opq = fn(m); break; } }
    if (an.memq || an.opq) { delete an.I.love; }
    // asking an opinion / recalling a fact / naming a harmless fear is NOT a disclosure
    const ABUSE = /\b(hit|hits|hitting|hurt|hurts|grab|grabbed|bruise|bruises|drunk|drinks|drinking|beer|yell|yells|yelling|scream|screams|screaming|punch|punched|shove|shoved|slap|slapped|threw|throws|wasted|smash|smashed|scared of (him|rick)|afraid of (him|rick))\b/;
    const soft = !ABUSE.test(t);
    const harmlessFear = an.facts.some((f) => f.kind === 'fear' && !/\b(rick|stepdad|him|he|home|house|dad|going home)\b/.test(f.v));
    const chatty = an.facts.some((f) => /^(fav|like|dislike|skill|dream|birthday|pet|nick|bff|wish)$/.test(f.kind));
    if (soft && (an.memq || an.opq || harmlessFear || chatty)) { delete an.I.disclose; if (an.memq || an.opq || harmlessFear) delete an.I.scared; delete an.I.angry; }
    an.short = an.len <= 3;
    return an;
  };
  N.clean = clean; N.dayOffset = dayOffset; N.PEOPLE = PEOPLE;
})(window.SH);
