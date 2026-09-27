/* SMALL HOURS — scripted & random events */
(function (SH) {
  const U = SH.util;
  const E = SH.Events = { Q: [] };
  const D = (o) => SH.UI.dialog(o);
  const home = () => SH.G.loc === 'home';
  const atSchool = () => SH.G.loc === 'school';

  E.queue = (ev) => { if (!E.Q.find((x) => x.id === ev.id)) E.Q.push(ev); };
  E.flush = function () {
    if (SH.UI.modalOpen() || SH.G.ended) return;
    const ev = E.Q.shift(); if (ev) ev.run();
  };

  /* ---------- scripted story beats (home phase) ---------- */
  const S = [
    { id: 'grade', d: 1, h: [18.5, 22.5], c: () => home() && SH.rickWhere() === 'home', run: () => D({
      title: 'The Math Test', who: 'rick', text: ['Rick doesn\'t look away from the TV. "Your teacher emailed. A D. In math."', 'The can in his hand crinkles. "You wanna explain that to me?"'],
      choices: [
        { t: 'Answer him (type it)', sub: 'Say whatever you want. He\'s had a couple.', fn: () => SH.Talk.open('rick', { ctx: 'grade', first: 'Well? I\'m waiting.', turnsMax: 5, noLeave: true, onEnd: (c) => {
          if (c.explode || c.mem.anger >= 3) { SH.G.phone.confiscated = true; SH.G.phone.takenBy = 'rick'; SH.G.phoneBackAt = SH.G.t + 14 * 60; SH.UI.log('Rick holds out his hand. "Phone." You give it to him. You get it back tomorrow, maybe.', 'bad'); SH.tag('phoneTaken'); SH.Phone.render(); }
          else SH.UI.log('He turns the TV up. The conversation is over. You made it out with your phone.', 'sys'); } }) },
        { t: 'Mumble "sorry" and go upstairs', fn: () => { SH.st('stress', 5); SH.rel('rick', -2); SH.UI.log('"Yeah, walk away. Real mature." You close your door very, very quietly.', 'sys'); } },
      ] }) },
    { id: 'bully', d: 3, h: [11.5, 13.5], c: () => atSchool(), run: () => E.bully() },
    { id: 'okafor1', d: 4, h: [9.5, 14], c: () => atSchool(), run: () => D({
      title: 'Counselor\'s Office', who: 'okafor', text: ['A note from the office: "Please send ' + SH.G.name + ' to Ms. Okafor, Room 204."', 'Her office has a beanbag, a tissue box that\'s mostly empty, and a poster of a cat hanging from a branch. "HANG IN THERE." She sees you looking at it. "I know. It\'s terrible. I keep it ironically."', '"Some of your teachers noticed you seem tired lately. You\'re not in trouble. I just wanted to check in. How are things?"'],
      choices: [{ t: 'Talk to her (type it)', sub: 'She\'s a mandated reporter. She\'ll tell you that honestly.', fn: () => SH.Talk.open('okafor', { ctx: 'intake', turnsMax: 8, onEnd: () => SH.tag('okaforTalk') }) },
        { t: '"I have a test next period."', fn: () => { SH.rel('okafor', -2); SH.UI.log('"Of course. My door\'s open." You leave. It feels like closing a window in a burning house.', 'sys'); } }] }) },
    { id: 'conference', d: 5, h: [17, 20], c: () => true, run: () => { SH.Phone.push('mom', 'mom', 'Baby I\'m so sorry. They won\'t let me leave, we\'re short 2 aides. Rick said he\'d go to your conference. I\'m sorry. I\'ll make it up to you.'); } , interrupt: false },
    { id: 'confBack', d: 5, h: [19.5, 22.5], c: () => home() && SH.rickWhere() === 'home', run: () => D({
      title: 'Parent-Teacher Night', who: 'rick', text: ['Rick is back from your conference. He smells like the bar on Route 9.', '"Your teacher says you\'re \'withdrawn\'. Says you\'re \'bright but disengaged\'. You know how that makes me look? Like I don\'t know what\'s going on in my own house."', SH.G.grades >= 55 ? '"...She did say your English essay was good. Whatever."' : '"She says you might fail the quarter."'],
      choices: [{ t: 'Say nothing. Wait it out.', fn: () => { SH.st('stress', 8); } }, { t: 'Respond (type it)', fn: () => SH.Talk.open('rick', { ctx: 'conf', turnsMax: 4, noLeave: true }) }] }) },
    { id: 'sleepInvite', d: 5, h: [15.5, 22], c: () => true, interrupt: false, run: () => { SH.flag('sleepoverInvite'); SH.Phone.push('jordan', 'jordan', 'SLEEPOVER SAT?? my mom said yes. we can play skyforge till 4am. come over whenever'); } },
    { id: 'allowance', d: 6, h: [8, 14], c: () => home(), run: () => {
      if (SH.G.choresWeek >= 3) { SH.money(10); SH.G.tx.push({ t: SH.G.t, d: 'Allowance (sticky note)', a: 10 }); D({ title: 'Allowance', text: ['There\'s a ten-dollar bill on the counter under a sticky note in Mom\'s handwriting: "For my hard worker ♥ M"', 'You did the dishes three times this week. She noticed. Something in your chest unclenches a tiny bit.'], choices: [{ t: 'Pocket it', fn: () => SH.st('mood', 6) }] }); }
      else D({ title: 'Allowance', text: ['There\'s a sticky note on the counter in Rick\'s block capitals: "NO CHORES NO ALLOWANCE."', '(Do chores in the kitchen during the week — dishes, trash, laundry.)'], choices: [{ t: 'Great.', fn: () => SH.st('mood', -3) }] });
      SH.G.choresWeek = 0; } },
    { id: 'fight6', d: 6, h: [22, 24], c: () => home(), run: () => E.fightNight() },
    { id: 'grandmaCall', d: 7, h: [11, 20], c: () => SH.Phone.ok(), run: () => SH.Phone.incoming('grandma', () => SH.Talk.open('grandma', { ctx: 'call', phone: true, first: 'There\'s my favorite grandchild! Don\'t tell Lily I said that. How ARE you, sweetheart? And don\'t say "fine", I can hear it in your voice.', onEnd: () => SH.flag('talkedGrandma') }),
      () => { SH.Phone.push('grandma', 'grandma', 'I tried calling, sweetheart. I just wanted to hear your voice. Call me back any time. Any hour. Love, Grandma'); }) },
    { id: 'bill', d: 8, h: [17.5, 22], c: () => home() && SH.rickWhere() === 'home', run: () => D({
      title: 'The Phone Bill', who: 'rick', text: ['Rick slaps the phone bill on the table. "$142. For a family plan. You know what that is, for a guy with no paycheck?"', '"End of the month, you\'re off the plan. You want a phone, get a job."', 'Out in the garage, you saw him earlier taking photos of your bike.'],
      choices: [{ t: 'Say nothing', fn: () => { SH.st('stress', 8); SH.flag('phoneThreat'); SH.flag('bikeWarning'); } }, { t: 'Respond (type it)', fn: () => { SH.flag('phoneThreat'); SH.flag('bikeWarning'); SH.Talk.open('rick', { ctx: 'bill', turnsMax: 4, noLeave: true }); } }] }) },
    { id: 'bike', d: 9, h: [15.5, 22], c: () => home(), run: () => {
      if (SH.f('bikeAtJordan')) { D({ title: 'The Garage', text: ['Rick is in the garage, staring at the spot where your bike used to be.', '"Where\'s your bike?" "Jordan borrowed it." He looks at you for a long time. You hold his stare.', 'For once, you were one step ahead.'], choices: [{ t: 'Walk away before he thinks harder', fn: () => { SH.st('mood', 5); SH.rel('rick', -4); } }] }); return; }
      SH.flag('bikeGone'); SH.flag('hasBike', false); SH.rel('rick', -15); SH.st('stress', 15); SH.st('mood', -15); SH.tag('bikeSold');
      D({ title: 'The Garage', who: 'rick', text: ['The garage is empty. Just the outline of dust where your bike leaned against the wall for two years.', 'Rick doesn\'t look up from his phone. "Sold it. Eighty bucks. Groceries don\'t buy themselves."', 'Grandma bought you that bike.'], choices: [{ t: '...', fn: () => {} }, { t: 'Respond (type it)', fn: () => SH.Talk.open('rick', { ctx: 'bike', turnsMax: 4, noLeave: true }) }] }); } },
    { id: 'play', d: 10, h: [17, 18], c: () => true, run: () => D({
      title: 'Lily\'s Play', who: 'lily', text: ['Lily\'s class play, "The Tortoise and the Hare (and Friends)", starts at 6 at Maple Elementary. She\'s the tortoise. She has one line and she has said it to you roughly nine hundred times.', 'Mom is working. Rick said he\'s "not feeling it."', SH.G.loc === 'home' ? 'Lily is standing by the door in a cardboard shell, looking at you.' : 'Mom texted: "can you go?? please?? she\'ll be crushed"'],
      choices: [{ t: 'Go. (about 1.5 hours)', cls: 'safe', fn: () => { SH.advance(90, { interrupt: false }); SH.rel('lily', 15); SH.st('mood', 14); SH.st('stress', -8); SH.flag('lilyPlay'); SH.G.stash.push('drawing'); SH.G.loc = 'home';
        D({ title: 'Slow and Steady', who: 'lily', text: ['She says her line — "Slow and steady wins the race!" — and then, off-script, points at you in the front row and yells "THAT\'S MY SAM!"', 'Everyone laughs. You don\'t care. Afterward she gives you a drawing: a turtle in a cape. SAM IS MY HERO.', '(Lily\'s drawing is in your room.)'], choices: [{ t: 'Walk home holding her hand', fn: () => {} }] }); } },
        { t: 'Skip it', fn: () => { SH.rel('lily', -14); SH.st('mood', -6); SH.tag('skippedPlay'); SH.UI.log('Later, you hear Lily tell Rick that "nobody came, but it\'s okay." It is not okay.', 'bad'); } }] }) },
    { id: 'moving', d: 12, h: [8, 21], c: () => atSchool() || SH.G.loc === 'jordan' || SH.G.loc === 'park', run: () => D({
      title: 'Jordan\'s News', who: 'jordan', text: ['Jordan won\'t look at you. He\'s picking at the grip tape on his board.', '"My dad got a job in Portland. We\'re moving. End of the month." He tries to laugh. "So. You\'re gonna have to find a new best friend. Sorry. Tyler\'s available."'],
      choices: [{ t: 'Talk to him (type it)', fn: () => { SH.st('mood', -10); SH.Talk.open('jordan', { ctx: 'moving', turnsMax: 6 }); } }] }) },
    { id: 'movingText', d: 12, h: [21, 23], c: () => !SH.G.done.moving, interrupt: false, run: () => { SH.G.done.moving = true; SH.st('mood', -8); SH.Phone.push('jordan', 'jordan', 'wanted to tell u in person but. my dad got a job in portland. we\'re moving end of month. sorry dude'); } },
    { id: 'sunday', d: 14, h: [9, 12.5], c: () => home() && !SH.f('rickGone'), run: () => D({
      title: 'Pancakes', who: 'mom', text: ['Mom is making pancakes. Actual pancakes, with the chocolate chips shaped into smiley faces like when you were little. Rick went "to help his brother move a couch." Lily is watching cartoons.', 'Mom slides a plate in front of you and sits down. She looks at you — really looks, for the first time in weeks.', '"Hey. Talk to me. How are you actually doing?"'],
      choices: [{ t: 'Talk to her (type it)', sub: 'Rick isn\'t home. This might be the moment.', cls: 'safe', fn: () => SH.Talk.open('mom', { ctx: 'sunday', turnsMax: 8, onEnd: () => { SH.st('mood', 6); SH.flag('sundayTalk'); } }) },
        { t: 'Eat and say "good"', fn: () => { SH.st('full', 35); SH.st('mood', 4); SH.UI.log('"Good." She smiles like she\'s relieved. You both let the moment go.', 'sys'); } }] }) },
    { id: 'juice', d: 15, h: [7, 8.2], c: () => home() && !SH.f('rickGone'), run: () => D({
      title: 'Spilled Juice', who: 'rick', text: ['Lily knocks over her orange juice. It\'s an accident — her elbow, the table, a slow-motion glug across Rick\'s job applications.', 'Rick is up before the cup stops rolling. "ARE YOU KIDDING ME? LOOK AT THIS!" He\'s towering over her. Lily is frozen, eyes huge, hands up by her face.'],
      choices: [
        { t: 'Step between them', cls: 'hot', fn: () => { SH.flag('bruise'); SH.flag('runUnlocked'); SH.rel('lily', 12); SH.rel('rick', -20); SH.st('stress', 25); SH.st('health', -6); SH.tag('grabbed');
          D({ title: 'His Hand', text: ['"Don\'t yell at her!" — it comes out of you before you decide to say it.', 'His hand closes around your upper arm and he shoves you back against the counter. Hard. His fingers dig in. For one second you see something in his face that you will remember for the rest of your life.', 'Then he lets go, grabs his keys, and slams the door so hard a picture falls.', 'Lily is crying. Your arm throbs. By lunch there are four purple marks.'], choices: [{ t: 'Hold Lily until she stops shaking', fn: () => { SH.st('mood', -10); } }] }); } },
        { t: 'Freeze. Don\'t make it worse.', fn: () => { SH.rel('lily', -8); SH.st('stress', 18); SH.st('mood', -12); SH.flag('runUnlocked'); SH.tag('froze');
          D({ title: 'Quiet', text: ['You stare at your cereal. He screams at her for a full minute. She wets herself. He storms out.', 'Later she crawls into your lap and says "it\'s okay, I\'m used to it." She is seven.'], choices: [{ t: '...', fn: () => {} }] }); } }] }) },
    { id: 'bruiseSchool', d: 16, h: [8.5, 14.5], c: () => atSchool() && SH.f('bruise') && !SH.f('toldCounselor'), run: () => D({
      title: 'Room 204', who: 'okafor', text: ['In gym you forget and push your sleeves up. Coach M sees. By third period you\'re in Ms. Okafor\'s office again.', 'She doesn\'t start with small talk this time. She just says, gently: "Can you tell me what happened to your arm?"'],
      choices: [{ t: 'Tell her (type it)', cls: 'safe', fn: () => SH.Talk.open('okafor', { ctx: 'bruise', turnsMax: 8 }) }, { t: '"I fell off my bike."', sub: 'Your bike was sold a week ago.', fn: () => { SH.rel('okafor', -2); SH.flag('okaforSuspects'); SH.UI.log('"Okay," she says, and writes something down. She doesn\'t believe you. Part of you is glad.', 'sys'); } }] }) },
    { id: 'cps', d: 17, h: [15.5, 19.5], c: () => home() && (SH.f('toldCounselor') || SH.f('toldPolice')) && !SH.f('cpsDone'), run: () => E.cpsVisit() },
    { id: 'askOk', d: 18, h: [7, 8], c: () => home() && SH.momWhere() === 'home', run: () => D({ title: 'Morning', who: 'mom', text: ['Mom is putting on her shoes. She stops. "Hey. Are you okay? You\'ve been so quiet."'],
      choices: [{ t: 'Answer (type it)', fn: () => SH.Talk.open('mom', { ctx: 'morning', turnsMax: 5 }) }, { t: '"Fine."', fn: () => { SH.UI.log('"Fine." She believes you, because she needs to.', 'sys'); } }] }) },
    { id: 'bigNight', d: 19, h: [21, 23.8], c: () => home() && !SH.f('rickGone'), run: () => E.bigNight() },
    { id: 'quietNight', d: 19, h: [20, 22], c: () => home() && SH.f('rickGone'), run: () => D({ title: 'Movie Night', text: ['Mom took the night off. The three of you watch a cartoon movie about a robot on the couch Rick used to sleep on.', 'Lily falls asleep on your shoulder. Mom mouths "thank you" over her head. It\'s not fixed. But it\'s quiet in the good way.'], choices: [{ t: 'Stay on the couch', fn: () => { SH.st('stress', -20); SH.st('mood', 20); } }] }) },
  ];
  E.scripted = S;

  E.check = function (opts) {
    const G = SH.G; if (G.phase !== 'home' || G.ended) return null;
    const d = SH.day(), h = SH.hour();
    if (G.phone.confiscated && G.t >= (G.phoneBackAt || 0)) { G.phone.confiscated = false; SH.Phone.render(); SH.UI.log('Your phone is back on your bed. No note.', 'sys'); }
    for (const e of S) {
      if (G.done[e.id] || SH.Story.dayOf(e) !== d || h < e.h[0] || h >= e.h[1] || SH.Story.skipped(e)) continue;
      if (opts.sleep && e.interrupt !== false && !['fight6', 'bigNight'].includes(e.id)) continue;
      if (e.c && !e.c()) continue;
      G.done[e.id] = true;
      if (e.interrupt === false) { e.run(); continue; }
      return e;
    }
    // dex thread progression
    E.dexStep(false);
    // random ambient (once per hour boundary)
    if (Math.floor(G.t) % 60 === 0 && !opts.sleep) { const r = E.randomHour(); if (r) return r; }
    // suspicion consequences
    if (G.susp >= 70 && home() && SH.momWhere() === 'home' && !G.done['bag' + d] && SH.bagWeight() > 5) { G.done['bag' + d] = true; return { id: 'bagFound', run: () => E.bagFound() }; }
    return null;
  };

  E.randomHour = function () {
    const G = SH.G, h = SH.hour(), cd = (k, hrs) => { if ((G.cool[k] || -1e9) > G.t) return false; G.cool[k] = G.t + hrs * 60; return true; };
    if (home() && SH.rickWhere() === 'home' && SH.rickDrunk() >= 2 && U.chance(0.25) && cd('yell', 3)) {
      return { id: 'yell', interrupt: false, run: () => { SH.st('stress', 6); SH.UI.log(U.pick(['From downstairs: a crash, then Rick swearing at the TV.', '"WHO LEFT THE LIGHTS ON? YOU THINK I\'M MADE OF MONEY?"', 'Rick is on the phone with his brother, loud. Your name comes up. You put your pillow over your head.', 'A can hits the wall downstairs. Lily\'s door clicks shut.']), 'bad'); } };
    }
    if (home() && SH.lilyWhere() === 'home' && h > 15.5 && h < 19.5 && U.chance(0.2) && cd('lilyplay', 20)) {
      return { id: 'lilyplay', run: () => D({ title: 'Lily', who: 'lily', text: ['Lily appears in your doorway holding Sheldon, her stuffed turtle. "Will you play fort with me? Sheldon needs a castle. He has enemies."'],
        choices: [{ t: 'Build the fort (30 min)', cls: 'safe', fn: () => { SH.advance(30, { interrupt: false }); SH.rel('lily', 6); SH.st('stress', -8); SH.st('mood', 8); SH.UI.log('You build a fort out of every blanket in the house. Sheldon is crowned King of the Couch Cushions.', 'good'); } },
          { t: 'Talk to her (type it)', fn: () => SH.Talk.open('lily', { turnsMax: 6 }) }, { t: '"Not now, Lil."', fn: () => { SH.rel('lily', -3); } }] }) };
    }
    if (h > 16 && h < 23 && U.chance(0.05) && cd('patelwave', 48) && home()) return { id: 'patelwave', interrupt: false, run: () => { SH.st('mood', 3); SH.UI.log('Through the window, Mrs. Patel waves at you from her porch with Newton\'s paw.', 'good'); } };
    return null;
  };

  /* ---------- Dex: a grooming thread, shown non-graphically, flagged by PIP ---------- */
  E.dexStep = function (fromGame) {
    const G = SH.G; if (SH.f('dexBlocked') || G.phase === 'end') return;
    const d = SH.day(), st = G.flags.dexStage || 0, h = SH.hour();
    const X = (G.story && G.story.dex) || [2, 4, 7, 11, 16];
    const msg = (t) => SH.Phone.push('dex', 'dex', t);
    if (st === 0 && (d >= X[0] && h > 16 || fromGame)) { SH.flag('dexStage', 1); msg('gg earlier. ur actually cracked at skyforge. what rank r u'); G.redFlags.push('An adult stranger started DMing you out of nowhere.'); return; }
    if (st === 1 && d >= X[1] && h > 17) { SH.flag('dexStage', 2); msg('ngl ur way more mature than other ppl ur age. how old r u anyway'); return; }
    if (st === 2 && d >= X[2] && h > 19) { SH.flag('dexStage', 3); msg('sent u 500 gems btw 🎁 dont tell ur parents about me tho. adults dont get online friendships'); G.redFlags.push('Sends you gifts (gems) to make you feel you owe him.'); G.redFlags.push('Asks you to keep him secret from your parents.'); return; }
    if (st === 3 && d >= X[3] && h > 21) { SH.flag('dexStage', 4); msg('u seem sad lately. u can tell me anything. just delete our chats after ok? my ex was crazy about that stuff lol'); G.redFlags.push('Asks you to delete your chats.'); return; }
    if (st === 4 && d >= X[4] && h > 20) { SH.flag('dexStage', 5); SH.flag('dexOffer'); msg('if things r bad at home i could come get u. i have my own place. nobody has to know 🤫'); G.redFlags.push('Offers to pick you up and let you stay with him — "nobody has to know".'); return; }
  };

  /* ---------- individual events ---------- */
  E.bully = function () {
    if (SH.f('okaforBully')) { SH.UI.log('Tyler glares at you from across the cafeteria, but a lunch aide is standing right by his table. Ms. Okafor must have said something.', 'good'); return; }
    D({ title: 'Cafeteria', who: 'tyler', text: ['Your tray hits the floor before you realize his foot was out. Tater tots everywhere. The table behind you erupts.', 'Tyler Brandt leans back. "Whoa. Gravity\'s hard for some people, huh? Maybe if you showered you\'d be more aerodynamic."', 'Forty people are watching.'],
      choices: [
        { t: 'Say something back (type it)', sub: 'A good comeback beats a fist. PIP might help.', fn: () => SH.Talk.open('tyler', { ctx: 'bully', turnsMax: 2, noLeave: true, onEnd: (c) => { if (c.fight) E.fightChoice(); else if (SH.f('burnedTyler')) SH.tag('burnedTyler'); } }) },
        { t: 'Tell the lunch aide', fn: () => { SH.rel('tyler', -10); SH.flag('snitched'); SH.UI.log('The aide gives Tyler lunch detention. On the way out he mouths "you\'re dead." Later there\'s a post about you on Chirp.', 'warn'); SH.Phone.addPost('tyler.b', 'imagine being such a baby u tell on ppl for a JOKE 😂 some ppl in 7B lol'); SH.st('stress', 6); } },
        { t: 'Pick up your tray. Say nothing.', fn: () => { SH.st('mood', -10); SH.st('full', -5); SH.UI.log('You pick up the tots one by one. Nobody helps. You don\'t eat lunch.', 'bad'); } }] });
  };
  E.fightChoice = function () {
    D({ title: 'Fists', who: 'tyler', text: ['Tyler shoves you. The circle forms automatically — you\'ve seen it happen to other kids. Phones come out.'],
      choices: [{ t: 'Swing', cls: 'hot', fn: () => { SH.flag('suspended'); SH.st('health', -8); SH.st('stress', 15); SH.susp(10); SH.tag('fight'); SH.flag('excused' + (SH.day() + 1)); SH.flag('excused' + (SH.day() + 2));
        D({ title: 'Suspended', text: ['You connect once. He connects three times. A teacher pulls you apart. Two-day suspension, both of you.', 'The school calls home. Rick answers.', 'That night is very, very loud.'], choices: [{ t: '...', fn: () => { SH.rel('rick', -10); SH.st('stress', 12); } }] }); } },
        { t: 'Walk away', fn: () => { SH.st('mood', -4); SH.UI.log('You walk. Someone yells "COWARD". A girl from your science class catches your eye and nods, like: good call.', 'sys'); } }] });
  };
  E.fightNight = function () {
    if (SH.G.loc === 'jordan') return;
    D({ title: 'Through the Wall', text: ['Mom\'s home from her shift. Rick\'s been drinking since four. It starts low, then it isn\'t low.', '"—EVERY SINGLE NIGHT, Dana—" "—don\'t you DARE—" Something glass breaks.', 'Your door creaks. Lily is standing there in her turtle pajamas, holding Sheldon, not crying yet but close.'],
      choices: [
        { t: 'Let her in. Build a blanket fort. Whisper stories.', cls: 'safe', fn: () => { SH.rel('lily', 10); SH.st('stress', 4); SH.st('mood', 3); SH.UI.log('You tell her the story of Sheldon the Turtle Knight until the yelling stops, and then some. She falls asleep holding your sleeve.', 'good'); SH.tag('protectedLily'); } },
        { t: 'Put your headphones on and turn toward the wall', fn: () => { SH.rel('lily', -6); SH.st('stress', 2); SH.UI.log('Lily stands there for a while. Then she goes back to her room. The music doesn\'t help as much as you hoped.', 'bad'); } },
        { t: 'Go downstairs', cls: 'hot', fn: () => { SH.st('stress', 14); D({ title: 'Downstairs', who: 'rick', text: ['The kitchen floor is glittering with a broken glass. Mom has her arms crossed, face blotchy. Rick turns to you.', '"Oh great. The audience." Mom: "Sam, go upstairs. Now. Please."'],
          choices: [{ t: 'Go back upstairs', fn: () => {} }, { t: 'Say something (type it)', fn: () => SH.Talk.open('rick', { ctx: 'fight', forceDrunk: 3, turnsMax: 3, noLeave: true, onEnd: (c) => { if (c.explode) { SH.st('stress', 10); SH.UI.log('Mom physically pushes you toward the stairs. "GO." Her voice cracks. You go.', 'bad'); } } }) }] }); } }] });
  };
  E.cpsVisit = function () {
    SH.flag('cpsDone');
    D({ title: 'A Knock at the Door', text: ['A woman with a lanyard and a kind, tired face: "Hi. I\'m Ms. Hale, from Children and Family Services. Your school counselor asked me to come by. Is it okay if we talk, just you and me, on the porch?"', 'Behind you, Rick has gone very still in front of the TV.'],
      choices: [{ t: 'Tell her everything', cls: 'safe', fn: () => { SH.flag('cpsTruth'); SH.flag('rickGone'); SH.st('stress', -10); SH.tag('cps');
        D({ title: 'The Porch', text: ['You tell her about the yelling, the cans, the wall, Lily\'s juice, your arm. She writes it down. She doesn\'t look shocked. She looks like someone who believes you.', 'That night, after a very long phone call with Ms. Hale, Mom tells Rick to pack a bag. He goes to his brother\'s. There will be a safety plan, and meetings, and a lot of forms.', 'It doesn\'t feel like winning. It feels like a window opening in a room you didn\'t know was stuffy.'], choices: [{ t: 'Breathe', fn: () => { SH.st('mood', 12); } }] }); } },
        { t: 'Say it\'s all fine', fn: () => { SH.flag('cpsDenied'); SH.st('stress', 10); SH.UI.log('"Everything\'s fine." Ms. Hale gives you a card too. Your wallet is becoming a collection of adults who want to help.', 'sys'); } }] });
  };
  E.bigNight = function () {
    const G = SH.G; SH.flag('runUnlocked'); SH.tag('bigNight');
    D({ title: 'Friday Night', who: 'rick', text: ['Mom is on nights. Lily is asleep. Rick has been drinking since noon.', 'He comes into your room without knocking, holding your phone bill in one hand and a can in the other. "You know what this is? This is you. Bleeding me dry. Just like your mother. Just like your deadbeat father."', 'He grabs your phone off the bed and throws it. It hits the wall and the screen spiders into a web of cracks.', 'Then his fist goes into the drywall six inches from your head. Plaster dust drifts onto your pillow.', '"Don\'t. Look at me. Like that."'],
      choices: [
        { t: 'Grab your bag and go. Right now.', cls: 'hot', sub: 'Out the window, onto the porch roof, into the dark.', fn: () => { G.phone.cracked = true; SH.Run.start('bigNight'); } },
        { t: 'Run next door to Mrs. Patel\'s', cls: 'safe', sub: 'Her porch light is on.', fn: () => { G.phone.cracked = true; SH.Endings.patel(); } },
        { t: 'Lock your door, grab your phone, call 911', cls: 'safe', fn: () => { G.phone.cracked = true; if (G.phone.bat <= 0) { SH.UI.toast('Your phone is dead.'); E.lockIn(); return; } SH.Endings.call911(); } },
        { t: 'Lock the door. Wait for it to end.', fn: () => { G.phone.cracked = true; E.lockIn(); } }] });
  };
  E.lockIn = function () {
    SH.st('stress', 20); SH.st('mood', -15); SH.tag('lockedIn');
    D({ title: 'Locked', text: ['He pounds on the door twice. Then he laughs — a horrible, tired laugh — and goes downstairs.', 'You sit with your back against the door until 3 AM. The cracks in your phone screen catch the streetlight.', 'You don\'t sleep. You think about the window. You think about Lily.'], choices: [{ t: 'Morning comes anyway', fn: () => { SH.advance(240, { interrupt: false }); } }] });
  };
  E.bagFound = function () {
    SH.G.susp = 35; SH.flag('momSuspects');
    D({ title: 'Your Backpack', who: 'mom', text: ['Mom is sitting on your bed. Your backpack is open next to her. The coat. The food. The charger. The money.', 'Her voice is very small. "Sam. What is this?"'],
      choices: [{ t: 'Talk to her (type it)', fn: () => SH.Talk.open('mom', { ctx: 'bag', turnsMax: 6, first: 'Were you going to leave? Were you going to just... leave?' }) }] });
  };
  E.truancyCall = function () {
    SH.susp(12, 'school called home');
    const who = SH.momWhere() === 'work' ? 'mom' : 'rick';
    SH.Phone.push(who, who, who === 'mom' ? 'School just called. You\'re not in class?? Where are you. Call me NOW.' : 'SCHOOL CALLED. WHERE ARE YOU.');
    SH.rel(who, -4); SH.st('stress', 6);
  };
  E.passOut = function () {
    const G = SH.G; SH.UI.log('Your body decides for you. You fall asleep wherever you are.', 'bad');
    if (G.phase === 'run') SH.Run.sleep(true); else { SH.advance(360, { sleep: true, quality: 0.6, interrupt: false }); }
  };
  E.nightWalk = function () { SH.Run.nightEvent(); };
  E.onArrive = function (to) {
    const G = SH.G, d = SH.day();
    if (to === 'library' && d >= 8 && !SH.f('knowsHarbor')) { SH.flag('knowsHarbor'); SH.addBag('flyer', true); SH.UI.revealHarbor(); E.queue({ id: 'flyer', run: () => D({ title: 'The Bulletin Board', text: ['Between a lost cat poster and a flyer for toddler story time, there\'s a sheet with tear-off tabs: "CAN\'T GO HOME TONIGHT? Harbor House — youth drop-in & shelter. Ages 11–17. 24/7. Food, beds, someone to talk to. No judgment. 212 Wharf St."', 'Three tabs have already been torn off. You take one.'], choices: [{ t: 'Pocket it', fn: () => {} }] }) }); }
    if (to === 'park' && d >= 11 && SH.hour() >= 16.5 && !SH.f('metWren') && G.phase === 'home') { SH.flag('metWren'); E.queue({ id: 'wren', run: () => D({ title: 'The Skate Bowl', who: 'wren', text: ['A girl, maybe sixteen, is sitting on the lip of the bowl with a huge backpack, a sleeping bag tied to the bottom. Purple hair grown out, chipped nails, eyes that look older than the rest of her.', 'She clocks your face the way you clock Rick\'s truck in the driveway. "You\'ve got that look."', '"What look?" "The \'thinking about leaving\' look. I\'m Wren."'], choices: [{ t: 'Talk to her (type it)', fn: () => SH.Talk.open('wren', { turnsMax: 10 }) }, { t: 'Nod and skate away', fn: () => {} }] }) }); }
  };
  E.afterText = function (id, an, r) {
    const G = SH.G;
    if (id === 'grandma' && SH.f('grandmaComing') && G.phase === 'run') SH.Run.grandmaComing();
    if (id === 'mom' && G.phase === 'run' && SH.f('toldMomWhere')) SH.Run.momComing();
    if (id === 'dex' && G.phase === 'run' && SH.f('dexOffer') && an.has('yes')) SH.Run.dexMeet();
    if (id === 'lighthouse' && SH.f('harborPickup')) SH.Run.harborPickup && G.phase === 'run' && SH.Run.harborPickup();
  };
})(window.SH);
