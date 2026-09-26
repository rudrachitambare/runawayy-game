/* SMALL HOURS — more people, real friendships, crushes.
   Six new kids around Harlow with their own personalities, routines, families and opinions. Friendship grows
   by talking, hanging out and showing up. Any of them can become your crush — kept the way it is at twelve:
   notes, awkward texts, sitting together at lunch. Nothing more.
   Friends who know what's happening at home offer a couch. Some will run with you. Their parents are real
   people with their own rules (and, in real life, their own legal duty to call someone). */
(function (SH) {
  const U = SH.util, N = SH.NLP;
  const R = (say, fx, x) => Object.assign({ say, fx: fx || {} }, x || {});
  const pick = (a) => a[Math.floor(Math.random() * a.length)];
  const FR = SH.Friends = {};

  /* ---------- the kids ---------- */
  // g: pronoun set · risk: how likely to run with you · fam: parent type (warm = feeds you + calls in the morning,
  // strict = calls right away, away = parent rarely home so sneaking in works)
  FR.KIDS = {
    nia: { n: 'Nia', full: 'Nia Brooks', g: 'she', col: '#e76f9a', ini: 'N', age: 12, vibe: 'artist', risk: 0.35, fam: 'warm', parent: 'Ms. Brooks', pjob: 'a respiratory therapist',
      likes: /\b(draw|drawing|art|anime|manga|sketch|comics?|music|paint)\b/, dislikes: /\b(football|sports|math)\b/,
      look: { skin: '#6b4430', hair: '#1a1210', style: 'pony', shirt: '#e76f9a', top: 'hoodie', young: 1 },
      hang: 'drawing in a sketchbook', where: 'library', we: 'mall',
      hi: 'oh hey. you\'re in my science class right? you sit by the window and look like you\'re planning a heist',
      fb: ['ok but what\'s your opinion on the new Skyforge art style. it\'s a crime', 'i drew the lunch lady as a dragon today. it\'s my best work', 'do you ever feel like everybody\'s reading a script you didn\'t get'],
      bio: { hobby: 'drawing. mostly dragons. sometimes people who annoy me, as dragons', kids: 'i\'m twelve lol', pets: 'a fish named Gerald. he\'s thriving', day: 'fine. drew a thing. you?', from: 'Detroit, till I was 8', job: 'i\'m gonna do concept art for games' } },
    marco: { n: 'Marco', full: 'Marco Delgado', g: 'he', col: '#f4a236', ini: 'M', age: 12, vibe: 'clown', risk: 0.6, fam: 'warm', parent: 'Mrs. Delgado', pjob: 'runs a food truck',
      likes: /\b(skate|skating|skateboard|jokes?|memes?|tacos?|food|pranks?|videos?)\b/, dislikes: /\b(homework|reading|books?)\b/,
      look: { skin: '#b07a52', hair: '#1c130e', style: 'messy', shirt: '#f4a236', top: 'tee', young: 1 },
      hang: 'trying the same kickflip for the 40th time', where: 'park', we: 'park',
      hi: 'YO. you\'re the kid who told Tyler his haircut looked like a lampshade. legend. i\'m Marco',
      fb: ['ok real question. would you fight one horse-sized duck or', 'my abuela says hi. she doesn\'t know you. she says hi to everyone', 'i\'m banned from the QuikMart microwave. long story. not my fault. mostly'],
      bio: { hobby: 'skating. making my sisters mad. professionally', kids: 'bro', pets: 'we have a chihuahua named Tank. he hates me personally', day: 'fell off my board like six times. great day', from: 'here. born at St. Brigid\'s. famous', job: 'food truck empire. like my mom but with drones' } },
    priya: { n: 'Priya', full: 'Priya Nair', g: 'she', col: '#9b7bff', ini: 'P', age: 13, vibe: 'brain', risk: 0.15, fam: 'strict', parent: 'Dr. Nair', pjob: 'a pharmacist',
      likes: /\b(science|space|robots?|books?|reading|chess|debate|coding|math)\b/, dislikes: /\b(pranks?|tiktok|gossip)\b/,
      look: { skin: '#9c6b4b', hair: '#140d0a', style: 'bob', shirt: '#9b7bff', top: 'cardigan', young: 1 },
      hang: 'doing homework that isn\'t due until next week', where: 'library', we: 'library',
      hi: 'Hi. You dropped this in the hallway last week, I\'ve been carrying it around. It\'s a pencil. I\'m Priya.',
      fb: ['Did you know octopuses have three hearts? I think about that when I\'m stressed.', 'I\'m reading a book about black holes. It\'s weirdly comforting. Everything ends, so nothing matters that much.', 'Do you want to be study partners? I mean. Only if you want. It\'s efficient.'],
      bio: { hobby: 'Chess club, robotics, and reading under the covers with a flashlight like a Victorian child.', kids: 'I\'m thirteen.', pets: 'My parents said no pets until I\'m "responsible." I have a 4.0.', day: 'Productive. I color-coded my binder again.', from: 'Columbus. We moved here for my mom\'s job.', job: 'Astrophysicist. Or pharmacist, if my mom wins.' } },
    eli: { n: 'Eli', full: 'Eli Hart', g: 'they', col: '#4fc3b0', ini: 'E', age: 12, vibe: 'quiet', risk: 0.45, fam: 'away', parent: 'Mr. Hart', pjob: 'drives trucks long-haul',
      likes: /\b(games?|gaming|skyforge|music|headphones|cats?|rain|night)\b/, dislikes: /\b(crowds?|parties|gym)\b/,
      look: { skin: '#e8c4a8', hair: '#6b4a2e', style: 'messy', shirt: '#4fc3b0', top: 'hoodie', young: 1 },
      hang: 'playing something on a cracked handheld', where: 'mall', we: 'mall',
      hi: '...oh. hi. sorry. i didn\'t think anyone could see me back here',
      fb: ['my dad\'s on a run to Nevada till thursday. the house is really quiet', 'you play Skyforge? i\'m stuck on the ice temple. it\'s been three weeks', 'sometimes i just ride the bus loop with headphones. it\'s nice. nobody asks you anything'],
      bio: { hobby: 'games. walking at night. collecting bus transfers', kids: 'no?', pets: 'a stray cat visits my window. i call her Toast', day: 'quiet. the good kind. mostly', from: 'we move a lot. this is my fourth school', job: 'i don\'t know yet. something with no meetings' } },
    theo: { n: 'Theo', full: 'Theo Nguyen', g: 'he', col: '#3d8bfd', ini: 'T', age: 12, vibe: 'jock', risk: 0.3, fam: 'strict', parent: 'Mr. Nguyen', pjob: 'owns the nail salon at the mall',
      likes: /\b(basketball|hoops|sports|shoes|sneakers|gym|win|winning)\b/, dislikes: /\b(losing|poetry)\b/,
      look: { skin: '#dcb48c', hair: '#0f0b08', style: 'short', shirt: '#3d8bfd', top: 'jersey', young: 1 },
      hang: 'shooting free throws', where: 'park', we: 'mall',
      hi: 'sup. you\'re Jordan\'s friend right. you guys are loud in the lunchroom. it\'s kinda funny ngl',
      fb: ['we lost to Westfield by two. i\'m still mad', 'my dad wants me to get a B in math or no tournament. so like. help', 'tyler\'s kind of a lot, huh. i used to hang with him. used to'],
      bio: { hobby: 'hoops. hoops. sometimes hoops', kids: 'lol no', pets: 'a turtle my sister named Sir Turtle. she\'s six', day: 'practice ran long. legs are dead', from: 'here', job: 'NBA. or physical therapist. my dad says have a backup' } },
    hazel: { n: 'Hazel', full: 'Hazel Quinn', g: 'she', col: '#8fbf5a', ini: 'H', age: 12, vibe: 'wild', risk: 0.7, fam: 'away', parent: 'Mr. Quinn', pjob: 'works at the grain co-op out past the county line',
      likes: /\b(horses?|outside|woods|camping|fishing|climb|trees?|creek|adventure)\b/, dislikes: /\b(mall|makeup|rules)\b/,
      look: { skin: '#f0c8a0', hair: '#b5642a', style: 'pigtails', shirt: '#8fbf5a', top: 'flannel', freckles: 1, young: 1 },
      hang: 'sitting in a tree like it\'s a chair', where: 'park', we: 'park',
      hi: 'hey! you ever climbed the water tower? me neither. yet. i\'m Hazel. you look like you need an adventure',
      fb: ['there\'s a fox den by the creek behind the trainyard. i\'m not telling you where. ok i\'ll tell you', 'my dad\'s working doubles at the co-op so i basically raise myself. it\'s fine. i\'m great at it', 'i caught a crayfish yesterday. named him Doug. released Doug. miss Doug'],
      bio: { hobby: 'climbing stuff i\'m not supposed to. fishing. horses when i can sneak into the Millers\' field', kids: 'ew', pets: 'two barn cats and a goat named Pancake', day: 'good! fell out of a tree. didn\'t die', from: 'out past the county line, on the old Quinn place', job: 'park ranger. or a horse. whichever' } },
  };
  const IDS = Object.keys(FR.KIDS);
  const pron = (id) => ({ she: ['she', 'her', 'her'], he: ['he', 'him', 'his'], they: ['they', 'them', 'their'] })[FR.KIDS[id].g];

  /* ---------- registration: world, meta, map, phone ---------- */
  SH.LOC.birch = { name: 'Birch Street', sub: 'Where half your class lives', x: 250, y: 395, type: 'house2', icon: '🏡', indoor: false, vis: 0.9,
    blurb: 'Duplexes with porch lights and bikes on lawns. Nia, Marco, Priya, Theo and Eli all live within four houses of each other. Hazel says she lives "out past the county line," but she\'s here more than she\'s there.' };
  if (SH.World && SH.World.START_KNOWN) SH.World.START_KNOWN.push('birch');
  IDS.forEach((id) => {
    const k = FR.KIDS[id];
    SH.NPCS_META[id] = { n: k.n, full: k.full + ' (' + k.age + ')', col: k.col, ini: k.ini, ph: true };
    SH.NPCS_META['host_' + id] = { n: k.parent, full: k.parent + ' (' + k.n + '\'s ' + (/^Mr\.? /.test(k.parent) ? 'dad' : 'mom') + ')', col: '#8a8f98', ini: k.parent.replace(/^(Ms\.|Mrs\.|Mr\.|Dr\.) /, '')[0], ph: false };
    const W = SH.World;
    W.ROUTINES[id] = [
      [0, 7, 'birch', 'asleep'], [7, 7.8, 'birch', 'running late'],
      [8, 15, 'school', 'in class', { wk: 1 }],
      [15.3, 18, k.where, k.hang, { wk: 1, p: 0.8, wet: ['mall', 'killing time at the mall'] }],
      [11, 17, k.we, k.hang, { we: 1, p: 0.75, wet: ['mall', 'killing time at the mall'] }],
      [18, 22.5, 'birch', 'home'], [22.5, 24, 'birch', 'asleep'],
    ];
    W.PEOPLE[id] = k.n; W.TALKABLE.push(id);
    (SH.CONV_STYLE = SH.CONV_STYLE || {})[id] = 'teen';
    (SH.CONV_BIO = SH.CONV_BIO || {})[id] = Object.assign({ invite: pick(['bet. when', 'ya ok', 'sure!']), areok: 'ya why', likeme: 'i mean. i\'m talking to you, aren\'t i' }, k.bio);
  });
  if (SH.Phone && SH.Phone.PEOPLE) IDS.forEach((id) => SH.Phone.PEOPLE.push(id));
  const PT = SH.Portraits || SH.Portrait; if (PT && PT.LOOK) IDS.forEach((id) => { PT.LOOK[id] = FR.KIDS[id].look; });

  /* ---------- state ---------- */
  FR.st = function (id) {
    const G = SH.G; G.friends = G.friends || {};
    const k = FR.KIDS[id];
    if (!G.friends[id]) { const seed = ((G.story && G.story.seed) || 1) * 31 + id.length * 7 + id.charCodeAt(0); G.friends[id] = { met: false, knows: false, offer: false, wouldRun: false, hangs: 0, today: 0, day: 0, compat: ((seed * 9301 + 49297) % 233280) / 233280, cool: 0 }; if (G.rel[id] == null) G.rel[id] = 0; }
    return G.friends[id];
  };
  FR.met = (id) => !!(SH.G.friends && SH.G.friends[id] && SH.G.friends[id].met);
  FR.metIds = () => IDS.filter(FR.met);
  FR.crush = () => SH.G.crush || null;
  FR.dating = (id) => !!(SH.G.crush && SH.G.crush.id === id && SH.G.crush.status === 'going');
  FR.level = (id) => { const r = SH.G.rel[id] || 0; return r >= 70 ? 'best friend' : r >= 45 ? 'close friend' : r >= 20 ? 'friend' : r >= 5 ? 'getting to know' : r <= -20 ? 'not a fan' : 'barely know'; };
  function bump(id, d) { const f = FR.st(id); if (SH.day() !== f.day) { f.day = SH.day(); f.today = 0; } if (d > 0) { d = Math.max(0, Math.min(d, 8 - f.today)); f.today += d; } SH.rel(id, d); }

  /* ---------- the kid brain ---------- */
  const CARE = 'wait. stop. that\'s serious. please tell ms okafor or call 988, like today. i\'m not leaving you alone with that, ok? you matter';
  function brain(id) {
    const k = FR.KIDS[id];
    return function (an, c) {
      const G = SH.G, f = FR.st(id), t = an.t, rel = G.rel[id] || 0, tp = an.tset || {};
      if (!f.met) { f.met = true; SH.rel(id, 3); }
      if (an.has('selfharm')) { SH.flag('toldSomeoneSelfHarm'); return R(CARE, { rel: 6 }, { flags: ['friendWorried'] }); }
      c.mem.n = (c.mem.n || 0) + 1;
      // crushes
      const confess = /\bi (like|like like|have a crush on) (you|u)\b|\b(will|would|do) (you|u) (wanna |want to )?(go out|be my (girlfriend|boyfriend|gf|bf|partner))\b|\bgo out with me\b|\bbe my (gf|bf|girlfriend|boyfriend)\b/.test(t);
      if (confess) {
        if (FR.dating(id)) return R(pick(['stop 😳 i know. me too. obviously', 'you\'re so embarrassing. (me too)']), { rel: 2, mood: 4 });
        if (f.cool > SH.G.t) return R('we literally just talked about this 😭', {});
        const yes = rel >= 40 && f.compat > 0.3 && !(G.crush && G.crush.status === 'going');
        f.cool = G.t + 24 * 60;
        if (yes) { G.crush = { id, status: 'going', since: G.t, notes: 0 }; SH.tag('goingOut_' + id); return R(pick(['...wait fr? ok. yeah. yes. oh my god don\'t look at me', 'i was literally gonna ask YOU. ok. yes. we\'re going out. that\'s so weird to say']), { rel: 8, mood: 14, stress: -4 }, { narr: `You're going out with ${k.n}. In seventh grade, that mostly means sitting together at lunch and texting until your thumbs hurt. It feels enormous.` }); }
        if (G.crush && G.crush.status === 'going') return R('uh. aren\'t you going out with ' + FR.KIDS[G.crush.id].n + '??', { rel: -3 });
        return R(rel >= 25 ? pick(['oh. um. you\'re like. one of my best friends? i don\'t wanna mess that up. is that ok', 'that\'s really nice. i just don\'t like anyone like that right now. we\'re good tho. promise']) : 'oh. um. we kinda just met?? that\'s nice tho', { rel: rel >= 25 ? 0 : -2, mood: -6 }, { narr: 'Your face is doing a thing. It\'ll stop doing it in about three days.' });
      }
      if (/\b(do|does) (you|u) (like|have a crush on) (anyone|someone|somebody)\b|\bwho do (you|u) like\b/.test(t)) return R(FR.dating(id) ? 'um. YOU?? obviously' : f.compat > 0.5 && rel >= 30 ? pick(['...maybe. not telling. (don\'t ask again) (ask again later)', 'that\'s classified. why. do YOU']) : pick(['no. everyone at our school is chaos', 'nope. i like sleep']), { rel: 1 });
      // home stuff: friends are where a lot of kids tell first
      if (an.has('disclose') || tp.drink || tp.violence || (an.has('scared') && (tp.rick || tp.home))) {
        const first = !f.knows; f.knows = true; SH.tag('toldFriend_' + id);
        if (rel >= 30 && !f.offer) { f.offer = true; return R(pick([`that's so messed up. you don't deserve that. ok listen: if it ever gets bad you can come to mine. like at night even. ${k.fam === 'away' ? 'my ' + (/^Mr\.? /.test(k.parent) ? 'dad' : 'mom') + '\'s gone half the week anyway' : 'my ' + (/^Mr\.? /.test(k.parent) ? 'dad' : 'mom') + ' would let you. ' + (/^Mr\.? /.test(k.parent) ? 'he' : 'she') + '\'d ask questions but nice ones'}`, 'wait. dude. that\'s not ok. you can crash at mine. i mean it. just text me']), { rel: 6, stress: -6 }, { narr: `${k.n} means it. You file that away somewhere safe.` }); }
        return R(first ? pick(['wait what?? that\'s not ok. are you ok? like actually', 'i\'m sorry. that\'s really scary. have you told anyone? like an adult?']) : pick(['still?? you should tell Ms. Okafor. i\'ll walk you there', 'i hate that. i\'m here ok']), { rel: 4, stress: -3 });
      }
      if (an.has('run') || tp.run) {
        if (f.knows && rel >= 50 && Math.random() < k.risk + 0.2) { f.wouldRun = true; return R(pick(['if you go, i\'m coming. not letting you go alone. i mean it', 'ok but take me. seriously. two is safer than one right']), { rel: 3 }, { narr: `${k.n} would come with you. You're not sure if that makes it better or worse.` }); }
        return R(f.offer ? 'dude. don\'t. just come to mine instead. please' : pick(['wait like run away?? where would you even go?', 'that sounds scary. are things that bad?']), { rel: 1 });
      }
      const FAV = { nia: 'drawing. dragons mostly. and that one anime nobody else watches', marco: 'skating. and making people laugh. and my mom\'s food truck tacos, no contest', priya: 'science olympiad. don\'t laugh. also baking when my mom lets me', eli: 'skyforge. obviously. and old handheld games', theo: 'basketball. and my little brothers, but don\'t tell them', hazel: 'climbing stuff. trees, fences, the water tower once (don\'t tell)' };
      if (/\b(fav(orite|ourite|e)?|what do (you|u) (like|do for fun)|what are (you|u) into|hobby|hobbies)\b/.test(t)) { bump(id, 1); f.asked = (f.asked || 0) + 1; return R(FAV[id] + (f.asked === 1 ? '. what about u' : ''), { mood: 1 }); }
      if (/\b(stay|sleep|crash|live|hide) (at|with|over at|in) (your|ur|you)\b|\b(sleep ?over)\b|\bcan i come (over|to (your|ur))\b|\bstay (at )?(your|ur) (place|house)\b/.test(t)) {
        if (f.knows && rel >= 20) { f.offer = true; return R(pick(['yes. obviously. just knock on my window, the one with the stickers. i\'ll deal with my ' + (/^Mr\.? /.test(k.parent) ? 'dad' : 'mom'), 'duh. anytime. like actually anytime. even 2am']), { rel: 2 }, { narr: `${k.n} means it. Birch Street, four houses down from everyone.` }); }
        if (rel >= 12) return R(f.knows ? 'yeah. i mean i\'d have to ask. but yeah' : 'like a sleepover? sure i\'d have to ask. is everything ok?', { rel: 1 });
        return R('uh. we don\'t really know each other like that yet lol', {});
      }
      if (/\b(come with me|run away with me|would (you|u) come|come with)\b/.test(t)) {
        if (f.knows && rel >= 45) { f.wouldRun = true; return R(pick(['if you go, i\'m coming. i mean it', 'ok. yeah. two is safer than one']), { rel: 2 }, { narr: `${k.n} would come. You're not sure if that makes it better or worse.` }); }
        return R(f.knows ? 'come where?? what\'s going on' : 'come where? lol', {});
      }
      if (an.has('hostile')) { bump(id, -6); return R(pick(['wow ok. rude', 'what did i do??', 'ok bye then']), { mood: -3 }, { end: rel < 10 }); }
      if (/\b(you'?re|youre|ur|you are|u r) (really |so |super |kinda |actually |pretty |very )?(cool|funny|nice|awesome|smart|the best|chill|talented|sweet|kind|pretty|cute|hilarious|great)\b|\bi like (your|ur) \w+/.test(t)) { bump(id, 3); return R(pick(['stoppp. ok keep going', 'ok you\'re cool too i guess', 'wow. thanks. that\'s like. nice']), { mood: 3 }); }
      if (k.likes.test(t)) { bump(id, 3); return R(pick([`wait you're into that too?? ok we're friends now. that's the rule`, `ok FINALLY someone gets it`, `no way. ok tell me everything`]), { mood: 3 }); }
      if (k.dislikes.test(t)) { bump(id, 1); return R(pick(['ugh. not my thing honestly', 'respectfully. no']), {}); }
      if (an.has('joke') || /\b(lol|lmao|haha)\b/.test(t)) { bump(id, 2); return R(pick(['LMAO', 'ok that was actually funny', 'stop 😭']), { mood: 2 }); }
      if (an.has('sad') || an.has('tired') || tp.feelings) { bump(id, 2); return R(pick(['hey. you ok? want a snack. i have like half a granola bar', 'that sucks. wanna hang later? distraction is my specialty', 'i get that. for real']), { stress: -2 }); }
      if (an.has('bully') || tp.tyler) return R(pick(['tyler is a walking group project nobody wants', 'ugh. tyler. want me to stand by you at lockers tomorrow', 'he did that to me in 5th grade. he\'s all talk']), { rel: 2 });
      if (an.has('bye')) return R(pick(['later!', 'bye. text me', 'ok see u']), {}, { end: true });
      bump(id, 1);
      return R(N.pick(c, 'fb_' + id, k.fb.concat(['ok wait tell me something interesting about you', 'what are you doing after school?'])), {});
    };
  }
  IDS.forEach((id) => { SH.Brain[id] = brain(id); });
  // the pick() fallback flag only triggers on key 'fb'; route our keyed banks through it
  const bp = N.pick; N.pick = function (conv, key, arr) { if (conv && /^fb_/.test(key)) conv._fb = true; return bp.apply(this, arguments); };

  /* ---------- parents (their house, their rules) ---------- */
  IDS.forEach((id) => {
    const k = FR.KIDS[id], hid = 'host_' + id;
    SH.Brain[hid] = function (an, c) {
      const t = an.t; c.mem.n = (c.mem.n || 0) + 1;
      if (an.has('selfharm')) { c.result = 'help'; return R('Okay. Thank you for telling me. You\'re staying right here with me, and we\'re calling for help together right now. You matter.', {}, { end: true }); }
      if (an.has('disclose') || an.has('scared') || (an.tset && (an.tset.violence || an.tset.drink))) { c.result = 'truth'; SH.flag('toldHost'); return R(k.fam === 'strict' ? 'Thank you for telling me. I believe you. I\'m not calling anyone to take you back there. I\'m calling the county, the people whose job this is, and you\'re staying in our kitchen until they come. Nobody\'s angry at you.' : 'Oh, honey. Come here. Okay. You\'re staying with us tonight, and in the morning we call the people who can actually fix this. Not to send you back. To make it safe. Deal?', { stress: -12 }, { end: true }); }
      if (an.has('lie') || /\b(my mom said|mom knows|she said it'?s ok|i have permission)\b/.test(t)) { c.mem.sus = (c.mem.sus || 0) + 1; return R(pick(['Mm-hm. Then she won\'t mind if I give her a quick call.', 'Sweetheart, I\'ve been a parent for a long time. Try again.']), {}); }
      if (an.has('hostile')) { c.result = 'call'; return R('Okay. I\'m calling your mother.', {}, { end: true }); }
      if (c.mem.n >= 4) { c.result = k.fam === 'strict' ? 'call' : 'night'; return R(k.fam === 'strict' ? 'I\'m sorry, but I have to call your mom. That\'s what I\'d want someone to do for ' + k.n + '.' : 'Okay. You can stay tonight. But in the morning, I\'m calling your mom. That\'s not negotiable, and I think you know why.', {}, { end: true }); }
      return R(pick(['Does your mom know where you are?', 'It\'s late. What\'s going on at home, hon?', 'You look like you haven\'t slept. Why don\'t you tell me what happened?', 'You\'re welcome for dinner. I\'d just like to know what I\'m dealing with.']), {});
    };
  });

  /* ---------- actions ---------- */
  const W = SH.World, bTalk = W.talkActions;
  W.talkActions = function () {
    const G = SH.G, out = bTalk.apply(this, arguments);
    out.forEach((a) => { const id = IDS.find((x) => a.label === 'Talk to ' + FR.KIDS[x].n); if (id && !FR.met(id)) { a.label = 'Say hi to ' + FR.KIDS[id].n; a.sub = FR.KIDS[id].hang; const fn = a.fn; a.fn = () => { SH.Talk.open(id, { first: FR.KIDS[id].hi, turnsMax: 8 }); }; } });
    W.present().filter((n) => IDS.includes(n) && FR.met(n) && (G.rel[n] || 0) >= 15 && G.phase === 'home').forEach((id) => {
      const k = FR.KIDS[id];
      out.push({ label: 'Hang out with ' + k.n + (FR.dating(id) ? ' ♥' : ''), sub: FR.level(id) + ' · about 1½ hours', fn: () => FR.hang(id) });
    });
    return out;
  };
  const HANG = {
    artist: ['You and Nia draw each other as dragons. Yours has a tiny hat. Hers has your exact eyebrows. You laugh until the librarian shushes you twice.', 'Nia shows you her sketchbook, the real one, the one she doesn\'t show people. There\'s a drawing of a house with every window lit. "It\'s nobody\'s house," she says. "It\'s just a house where everybody\'s home."'],
    clown: ['Marco teaches you to ollie. You land one. Sort of. He screams like you won the Olympics and a dog walker applauds.', 'You split a bag of hot chips with Marco and rate every car that drives by out of ten. A minivan gets a 10. "Confidence," Marco says.'],
    brain: ['Priya helps you with the math worksheet and it actually makes sense for the first time since September. "You\'re not bad at math," she says. "You\'re tired at math." It\'s the nicest thing anyone\'s said to you all week.', 'Priya tells you about the ISS passing over Harlow at 7:42. You both stand in the library parking lot and watch a dot of light cross the whole sky in four minutes.'],
    quiet: ['You and Eli beat the ice temple on their cracked handheld, passing it back and forth. Neither of you says much. It\'s the most relaxed you\'ve been in days.', 'Eli takes you on the bus loop. Headphones, one earbud each, the whole town sliding by like a movie. Nobody asks either of you anything.'],
    jock: ['Theo plays you in HORSE and doesn\'t let you win, which is somehow better. You get H-O-R. He gets H. "Rematch Thursday," he says, like it\'s a promise.', 'Theo quizzes you on math flashcards between free throws. Miss a shot, answer a problem. You both get better at both.'],
    wild: ['Hazel shows you the fox den behind the trainyard. You wait twenty minutes, lying in cold leaves, and then a kit pokes its head out and looks right at you. Neither of you breathes.', 'You and Hazel build a dam in the creek that lasts almost an hour. Your shoes are soaked. You don\'t care at all.'],
  };
  FR.hang = function (id) {
    const G = SH.G, k = FR.KIDS[id], f = FR.st(id);
    f.hangs++; bump(id, 7); SH.st('mood', 9); SH.st('stress', -7); SH.advance(90, { interrupt: false });
    let txt = pick(HANG[k.vibe]);
    if (FR.dating(id)) txt += ' ' + pick([`At some point your hands are next to each other on the bench. Neither of you moves. It's the loudest nothing you've ever heard.`, `${k.n} passes you a folded note on the way out. It says "this was fun" with a drawing of a very bad frog. You'll keep it forever.`]);
    if (f.knows && !f.offer && (G.rel[id] || 0) >= 30) { f.offer = true; txt += ` Before you split up, ${k.n} says, not looking at you: "the thing you told me. if it gets bad. my house. ok?"`; }
    SH.UI.dialog({ title: 'Hanging out', who: id, text: [txt], choices: [{ t: 'Head out', fn: () => SH.UI.afterAction() }] });
  };

  /* Birch Street: knock on doors — during the run, this is the "stay with a friend" path */
  const bList = SH.Actions.list;
  SH.Actions.list = function () {
    const out = bList.apply(this, arguments), G = SH.G, h = SH.hour();
    if (G.loc === 'birch' && !G.away) {
      FR.metIds().filter((id) => (G.rel[id] || 0) >= 20).forEach((id) => {
        const k = FR.KIDS[id];
        if (G.phase === 'run' && !G.hideout) out.acts.unshift({ label: `Knock on ${k.n}'s door`, sub: FR.st(id).offer ? `${k.n} said you could come.` : `${k.n}'s ${/^Mr\.? /.test(k.parent) ? 'dad' : 'mom'} will answer, probably.`, cls: 'safe', fn: () => FR.knock(id) });
        else if (G.phase === 'home' && h >= 15 && h < 21 && W.where(id).loc === 'birch') out.acts.push({ label: `Knock on ${k.n}'s door`, sub: 'Hang out at ' + (k.g === 'they' ? 'their' : k.g === 'he' ? 'his' : 'her') + ' place', fn: () => FR.hang(id) });
      });
    }
    // friends with you on the run
    (G.party || []).forEach((id) => out.acts.push({ label: 'Talk to ' + FR.KIDS[id].n, sub: 'With you. ' + (FR.st(id).home > 12 ? 'Getting quiet.' : 'Still in.'), fn: () => SH.Talk.open(id, { ctx: 'run', turnsMax: 8 }) }));
    if (G.phase === 'run' && !G.away && (G.party || []).length < 2) {
      FR.metIds().filter((id) => !(G.party || []).includes(id) && (FR.st(id).wouldRun || (FR.st(id).knows && (G.rel[id] || 0) >= 60))).forEach((id) => out.acts.push({ label: `Text ${FR.KIDS[id].n}: "i left. come with?"`, sub: 'They said they would.', fn: () => FR.invite(id) }));
    }
    return out;
  };

  FR.knock = function (id) {
    const G = SH.G, k = FR.KIDS[id], f = FR.st(id), h = SH.hour(), late = h >= 21 || h < 6;
    const ppl = /^Mr\.? /.test(k.parent) ? 'dad' : 'mom';
    if (k.fam === 'away' && (late || Math.random() < 0.6)) {
      return SH.UI.dialog({ title: `${k.n}'s house`, who: id, text: [`${k.n} opens the door in pajamas and a hoodie. "${f.offer ? 'you came. ok. ok. get in, it\'s freezing' : 'wait what are you doing here? ...oh. get in.'}" Their ${ppl} is on a long shift. The house smells like microwave popcorn and quiet.`, `${k.n} makes you a bed out of couch cushions on the floor of ${k.g === 'they' ? 'their' : k.g === 'he' ? 'his' : 'her'} room. It is the safest you've felt in weeks. It is also, you both know, not a plan.`],
        choices: [{ t: 'Stay (hide out here)', cls: 'safe', fn: () => { G.hideout = { id, since: G.t, nights: 0 }; SH.flag('hidAtFriend'); SH.st('warmth', 30); SH.st('full', 20); SH.st('stress', -15); SH.UI.log(`You're hiding at ${k.n}'s. Every car door outside makes you both freeze.`, 'good'); SH.UI.afterAction(); } },
          { t: 'Don\'t get them in trouble. Leave.', fn: () => { SH.rel(id, 4); SH.UI.log(`"text me," ${k.n} says. "like every hour. i'm serious."`, ''); SH.UI.afterAction(); } }] });
    }
    SH.UI.dialog({ title: `${k.n}'s house`, who: 'host_' + id, text: [`${k.parent} answers. ${k.pjob[0].toUpperCase() + k.pjob.slice(1)}, still in work clothes. ${k.n} is right behind, mouthing "sorry" or maybe "hi."`, late ? `"It's the middle of the night. Get inside. Now. You're shivering."` : `"Well, hi. ${k.n}'s friend, right? Is everything okay, honey?"`],
      choices: [{ t: 'Talk to ' + k.parent + ' (type it)', cls: 'safe', fn: () => SH.Talk.open('host_' + id, { first: pick(['Sit. Eat something first. Then tell me what\'s going on.', 'Okay. Kitchen. Talk to me.']), turnsMax: 7, onEnd: (c) => FR.hostOutcome(id, c.result) }) },
        { t: 'Say you\'re fine and leave', fn: () => { SH.UI.log(`${k.parent} watches you go down the steps. You hear the door stay open a long time. Then you hear a phone.`, 'bad'); G.heat = Math.min(100, (G.heat || 0) + 20); SH.UI.afterAction(); } }] });
  };
  FR.hostOutcome = function (id, res) {
    const G = SH.G, k = FR.KIDS[id];
    if (res === 'truth' || res === 'help') return FR.endFriendFamily(id);
    if (res === 'night') { G.hideout = { id, since: G.t, nights: 0, known: true }; SH.st('full', 35); SH.st('warmth', 40); SH.st('stress', -10); SH.UI.log(`${k.parent} makes up the couch. Real blankets. A glass of water on the side table. In the morning there will be a phone call.`, 'good'); return SH.UI.afterAction(); }
    SH.UI.log(`${k.parent} calls your mom. You sit on the stairs and listen to half a conversation.`, 'bad');
    SH.Endings.found('host');
  };
  FR.endFriendFamily = function (id) {
    const k = FR.KIDS[id], G = SH.G;
    SH.Endings.show('friendFamily', 'The Spare Room', `${k.full}'s house · Birch Street`, [
      `${k.parent} calls the county instead of your mom. A caseworker named Ms. Adeyemi comes to the Birches' kitchen at 9 a.m. and drinks their terrible coffee and listens to all of it, the parts you told ${k.parent} and the parts you didn't know you were going to say until you said them.`,
      `It turns out there's a word for what happens next: kin placement. When home isn't safe, the county would rather you stay with people you already know than with strangers. ${k.parent} signs a lot of forms. ${k.n} gives up half ${k.g === 'they' ? 'their' : k.g === 'he' ? 'his' : 'her'} closet without being asked.`,
      `It's not a fairy tale. You still wake up at 3 a.m. listening for footsteps that aren't there. Mom visits on Sundays with a caseworker in the room, and the first visit is mostly crying and the second is mostly Uno. ${G.fam ? G.fam.rick : 'Rick'} has to do things now: classes, meetings, a lot of saying sorry to people who don't have to believe him.`,
      `But there's a toothbrush with your name on it in a cup by someone else's sink, and nobody slams anything, and on Thursday ${k.n} leaves a note on your pillow that just says "HOUSEMATES" with a very bad frog. It's a start. Starts count.`]);
  };
  FR.invite = function (id) {
    const G = SH.G, k = FR.KIDS[id], f = FR.st(id);
    SH.Phone.push(id, 'me', 'i left. come with?');
    const yes = Math.random() < k.risk + (f.wouldRun ? 0.35 : 0) + ((G.rel[id] || 0) - 60) / 100;
    SH.advance(yes ? 60 : 10, { interrupt: false });
    if (!yes) { SH.Phone.push(id, id, pick(['i can\'t. i\'m sorry. please go to Ms. Okafor or come here. please', 'i want to but i can\'t. my mom would lose it. where are u. i\'ll bring food'])); SH.UI.log(`${k.n} isn't coming. But now ${k.g === 'they' ? 'they know' : k.g + ' knows'}.`, 'bad'); G.heat = Math.min(100, (G.heat || 0) + 5); return SH.UI.afterAction(); }
    G.party = (G.party || []).concat(id); f.home = 0; f.joinedAt = G.t; SH.flag('ranWithFriend');
    SH.Phone.push(id, id, pick(['omw. bringing snacks and my charger', 'ok. ok. i\'m climbing out the window. this is insane. omw']));
    SH.UI.dialog({ title: 'Two backpacks', who: id, text: [`${k.n} shows up an hour later with a backpack that clearly has way too much stuff in it: two hoodies, a bag of pretzels, a phone charger, a stuffed animal ${k.g === 'they' ? 'they pretend isn\'t theirs' : k.g === 'he' ? 'he pretends isn\'t his' : 'she pretends isn\'t hers'}.`, 'It\'s better with two. It is. It\'s also twice the people looking for you, and you both know whose idea this was.'], choices: [{ t: 'Okay. Let\'s go.', fn: () => SH.UI.afterAction() }] });
  };

  /* ---------- time: party, hideout, crush ---------- */
  const bAdv = SH.advance;
  SH.advance = function (mins, o) {
    const G = SH.G, t0 = G ? G.t : 0; const r = bAdv.apply(this, arguments);
    if (!G || G.phase === 'end' || G.ended) return r;
    const hrs = Math.floor(G.t / 60) - Math.floor(t0 / 60);
    for (let i = 0; i < hrs; i++) hour();
    return r;
  };
  function hour() {
    const G = SH.G;
    if (G.phase === 'run' && (G.party || []).length) {
      SH.st('mood', 1); SH.st('stress', -1);
      G.party.forEach((id) => {
        const f = FR.st(id), k = FR.KIDS[id]; f.home = (f.home || 0) + 1;
        if (f.home === 6) { G.heat = Math.min(100, (G.heat || 0) + 20); SH.UI.log(`${k.n}'s ${/^Mr\.? /.test(k.parent) ? 'dad' : 'mom'} has noticed ${k.g === 'they' ? 'they\'re' : k.g + '\'s'} gone. Two missing kids gets a lot more attention than one.`, 'bad'); }
        if (f.home === 16 && !f.asked) { f.asked = true; setTimeout(() => homesick(id), 50); }
      });
    }
    if (G.hideout && G.phase === 'run') {
      const H = G.hideout; H.hours = (H.hours || 0) + 1;
      if (H.hours % 24 === 0) H.nights++;
      const k = FR.KIDS[H.id];
      if (H.known && H.hours >= 10) { G.hideout = null; SH.UI.log(`Morning. ${k.parent} is on the phone in the kitchen, voice low. She's calling your mom.`, 'bad'); setTimeout(() => SH.Endings.found('host'), 60); return; }
      if (!H.known && Math.random() < 0.02 + H.nights * 0.03) { H.known = true; H.hours = 0; SH.UI.log(`${k.parent} comes home early and finds two kids and one extra toothbrush. There is a very long silence.`, 'bad'); setTimeout(() => SH.Talk.open('host_' + H.id, { first: 'Okay. Somebody explain. Starting with you, sweetheart.', turnsMax: 7, onEnd: (c) => FR.hostOutcome(H.id, c.result) }), 60); }
      SH.st('warmth', 6); SH.st('stress', -1);
    }
    // crushes text; going out makes school less awful
    if (G.crush && G.crush.status === 'going' && G.phase === 'home') {
      const h = SH.hour(), id = G.crush.id, k = FR.KIDS[id];
      if (h === 21 && Math.random() < 0.7) SH.Phone.push(id, id, pick(['gn 🌙', 'did u do the science thing. also hi', 'thinking about that frog drawing lol', 'ur funny. that\'s it that\'s the text', 'lunch tmrw? same table?']));
      if (h === 12 && SH.World.where(id).loc === 'school' && G.loc === 'school') { SH.st('mood', 4); SH.UI.log(`You sit with ${k.n} at lunch. ${pick(['You split a cookie with surgical precision.', 'You don\'t say much. You don\'t need to.', 'Tyler says something. ' + k.n + ' says something back that makes the whole table go "OHHH."'])}`, 'good'); }
    }
    if (G.phase === 'run' && G.crush && G.crush.status === 'going' && !(G.party || []).includes(G.crush.id) && Math.random() < 0.08) SH.Phone.push(G.crush.id, G.crush.id, pick(['where are u. please just tell me ur ok', 'everyone\'s saying u left. is it true?? please text back', 'i\'m not mad. i\'m scared. please']));
  }
  function homesick(id) {
    const G = SH.G, k = FR.KIDS[id];
    SH.UI.dialog({ title: 'Getting quiet', who: id, text: [`${k.n} has been quiet for an hour. Then: "i miss my ${/^Mr\.? /.test(k.parent) ? 'dad' : 'mom'}. that's so dumb. i know. ${k.fam === 'away' ? 'even if he\'s never home' : 'she\'s probably freaking out'}."`, `${k.g === 'they' ? 'They look' : (k.g === 'he' ? 'He looks' : 'She looks')} at you. "we could both go back. to mine, i mean. my ${/^Mr\.? /.test(k.parent) ? 'dad' : 'mom'} would help. i think actually help."`],
      choices: [
        { t: `Go back to ${k.n}'s house together`, cls: 'safe', fn: () => { G.party = G.party.filter((x) => x !== id); SH.Talk.open('host_' + id, { first: `${k.parent} opens the door before you knock, phone in hand, eyes red. "Oh thank God. Both of you. Inside. Then talk."`, turnsMax: 7, onEnd: (c) => FR.hostOutcome(id, c.result === 'call' ? 'call' : c.result || 'night') }); } },
        { t: 'Let them go home. You keep going.', fn: () => { G.party = G.party.filter((x) => x !== id); const tell = Math.random() < 0.5; SH.UI.log(`${k.n} hugs you hard and walks away fast so neither of you changes your mind.${tell ? ' An hour later the whole town knows which direction you went.' : ''}`, tell ? 'bad' : ''); if (tell) G.heat = Math.min(100, (G.heat || 0) + 30); SH.UI.afterAction(); } },
        { t: 'Talk them into staying', fn: () => { FR.st(id).home = 4; SH.rel(id, -8); SH.UI.log(`${k.n} stays. ${k.g === 'they' ? 'They don\'t' : (k.g === 'he' ? 'He doesn\'t' : 'She doesn\'t')} really look at you for a while.`, 'bad'); SH.UI.afterAction(); } },
      ] });
  }

  /* ---------- phone threads ---------- */
  FR.threadIds = () => FR.metIds();
})(window.SH);
