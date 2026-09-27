/* SMALL HOURS — more story (turn 41). Three strands, all queued as scenes that play when you next have a free moment
   (never in the middle of another dialog, a conversation, or quiet days; quiet days stop when one is waiting).
   A) Village storylines: a kid your age who finds your shack, the farmer's missing dog, the diner lady's son who ran
      off years ago, the church harvest supper, and a storm night at the shack.
   B) Back home: what happens in Harlow over the weeks you're gone. Your sibling's message, the search party, your mom's
      video, the stepdad in the driveway, the vigil, the case going cold. Some of it you can answer. Postcards home.
   C) The calendar: first snow, Thanksgiving, Christmas Eve, New Year's, the first warm day of spring. Mostly for the
      "Keep living it" months, but they happen whenever you're out there on the date.
   New second endings: "The Call" (you called home on Christmas) and "Postcards" (you kept writing). Village kid and
   the diner promise add lines to the other "later" endings. */
(function (SH) {
  const TW = SH.Town, A = SH.Atlas, K = SH.K, S = SH.Shack, V = SH.Village, X = SH.EndX; if (!A || !K) return;
  const G = () => SH.G, pick = (a) => a[Math.floor(Math.random() * a.length)], log = (t, c) => SH.UI.log(t, c || '');
  const nm = (x) => (SH.nm ? SH.nm(x) : x);
  const here = () => (G().away && A.here ? A.here() : null);
  const villageOk = (p) => p && (p.tier === 'village' || p.tier === 'small');
  const T = () => { const g = G(); return (g.tale = g.tale || { q: [], done: {}, kid: {}, dog: {}, home: {}, cards: 0, lastCard: -9 }); };
  const seen = (k) => !!T().done[k], mark = (k) => { T().done[k] = G().t; };
  const keyOf = (e) => e.id + (e.pid ? ':' + e.pid : '') + (e.key != null ? ':' + e.key : '');
  const LOGONLY = new Set(['search', 'drawing', 'vigil', 'cold', 'quiet']);
  const queue = (id, o) => { const t = T(); const key = keyOf(Object.assign({ id }, o || {})); if (t.q.some((x) => x.id === id) || seen(key)) return;
    if (LOGONLY.has(id) || (id === 'stepdad' && SH.f('rickGone'))) { mark(key); try { SC[id](o || {}); } catch (e) { console.warn(e); } return; }
    t.q.push(Object.assign({ id }, o || {})); };
  const D = (title, text, choices) => SH.UI.dialog({ title, text: [].concat(text), choices: choices || [{ t: 'Okay' }] });
  const vdays = (p) => (V && p ? V.st(p.id).days : 0);
  const cal = () => (SH.World2 ? SH.World2.cal(G().t) : { m: 9, dd: 5 });
  const wdN = () => SH.WEEKDAYS[SH.wd()];
  const missingDays = () => { const g = G(); return g.missingAt != null ? (g.t - g.missingAt) / 1440 : 0; };
  const online = () => { const g = G(); return !!(g.phone && !g.phone.confiscated && (g.phone.bat || 0) > 0 && (!SH.Net || !SH.Net.online || SH.Net.online())); };
  const hasBase = (p) => { const b = G().base; return b && p && b.pid === p.id; };
  const sib = () => nm('Lily'), mom = () => nm('Mom'), rick = () => nm('Rick');

  /* ---------- show queued scenes when the player is free ---------- */
  const busy = () => { const g = G(); return !g || g.ended || g.phase === 'end' || (SH.UI.modalOpen && SH.UI.modalOpen()) || (V && V.quietOn && V.quietOn()) || (SH.Talk && SH.Talk.cur && !SH.Talk.cur.ended && document.querySelector('#talk:not(.hidden), #tlog')); };
  function show() {
    const t = G() && T(); if (!t || !t.q.length || busy()) return;
    const e = t.q.shift(); const f = SC[e.id]; if (!f) return;
    mark(keyOf(e));
    try { f(e); } catch (err) { console.warn('tale', e.id, err); }
  }
  const bAA = SH.UI.afterAction;
  SH.UI.afterAction = function () { const r = bAA.apply(this, arguments); setTimeout(show, 120); return r; };
  const Tale = SH.Tale = { pending: () => !!(G() && G().tale && G().tale.q.length), show, queue };

  /* ================= A) village storylines ================= */
  const KIDS = [['Wren', 'she'], ['Hollis', 'he'], ['Junie', 'she'], ['Cal', 'he'], ['Posy', 'she'], ['Theo', 'he'], ['Mae', 'she'], ['Eli', 'he']];
  const kidOf = (p) => { const k = KIDS[(p.id.charCodeAt(1) * 3 + p.name.length) % KIDS.length]; return { n: k[0], he: k[1], He: k[1] === 'she' ? 'She' : 'He', his: k[1] === 'she' ? 'her' : 'his', him: k[1] === 'she' ? 'her' : 'him' }; };
  const kst = (p) => { const t = T(); return (t.kid[p.id] = t.kid[p.id] || { step: 0, at: 0 }); };
  const DOGS = ['Biscuit', 'Tater', 'Duchess', 'Rooster', 'Maggie', 'Boone'];
  const dogOf = (p) => DOGS[(p.name.charCodeAt(0) + p.id.length) % DOGS.length];
  const farmer = (p) => (S && S.FARM ? S.FARM(p) : { n: 'the farmer', g: 'he', place: 'the farm' });

  function villageTick(h) {
    const g = G(), p = here(); if (!p || !villageOk(p) || g.phase !== 'run') return;
    const d = vdays(p), day = SH.day(), dark = SH.isDark(h);
    // the kid: after school, when you have a base or a pile here
    const k = kst(p); const pile = S ? Object.values(S.pile(p.id)).some((n) => n > 0) : false;
    if ((hasBase(p) || pile) && !dark && h >= 15 && h <= 17 && k.step < 6 && k.step >= 0 && day >= (k.at || 0) && d >= 2) queue('kid', { pid: p.id, key: k.step });
    // the farmer's dog
    const fm = g._farm && g._farm[p.id]; const dg = (T().dog[p.id] = T().dog[p.id] || { step: 0 });
    if (fm && fm.met && d >= 5 && dg.step === 0 && !dark && h >= 8 && h <= 16) queue('dog', { pid: p.id });
    // the diner lady's son
    if (V && V.has(p, 'diner') && d >= 9 && h >= 13 && h <= 15 && !seen('danny:' + p.id)) queue('danny', { pid: p.id });
    // harvest supper: a Saturday in fall, a week in
    if (d >= 6 && wdN() === 'Saturday' && h === 16 && cal().m >= 8 && cal().m <= 10 && !seen('supper:' + p.id)) queue('supper', { pid: p.id });
    // storm night at the shack
    const w = SH.weatherDay ? SH.weatherDay() : {}; const b = g.base;
    if (w.c === 'storm' && hasBase(p) && (h >= 22 || h <= 3) && !seen('storm:' + p.id + ':' + day)) queue('storm', { pid: p.id, key: day });
  }
  K.hourly.push((h) => { try { villageTick(((h % 24) + 24) % 24); homeTick(((h % 24) + 24) % 24); dateTick(((h % 24) + 24) % 24); } catch (e) { console.warn('tales tick', e); } });

  const SC = {};
  SC.kid = (e) => {
    const p = here(); if (!p || p.id !== e.pid) return; const k = kst(p), K2 = kidOf(p), step = k.step; const next = (n, days) => { k.step = n; k.at = SH.day() + (days || 1); };
    if (step === 0) return D(`${K2.n}`, [`A kid about your age is sitting on a bike at the end of the tractor path, one foot on the ground, watching you haul branches. Grass-stained knees. A bread bag tied to the handlebars for no reason you can see.`, `"Are you building a fort?"`], [
      { t: '"Kind of."', fn: () => { next(1, 1); log(`"Cool," says ${K2.n}, and watches for another twenty minutes without offering to help, then pedals off yelling "BYE." Tomorrow ${K2.he} comes back.`, ''); } },
      { t: '"It\'s a house, actually."', fn: () => { next(1, 1); log(`${K2.n} considers this very seriously. "A house house?" You nod. "That's the coolest thing anyone in this whole town has ever done," ${K2.he} says, and means it.`, 'good'); SH.st('mood', 6); } },
      { t: '"Go away."', fn: () => { k.step = -1; log(`${K2.n}'s face closes like a door. ${K2.He} pedals away without a word. You tell yourself it's safer this way. It is. It doesn't feel like anything but lonely.`, ''); SH.st('mood', -4); } }]);
    if (step === 1) return D(K2.n, [`${K2.n} is back, and this time the bread bag has bread in it. Half a loaf, a jar of peanut butter with a butter knife sticking out of it like a flag.`, `"My mom thinks I eat a LOT," ${K2.he} says. "I'm going through a growth spurt. Officially."`], [
      { t: 'Make sandwiches together', fn: () => { next(2, 2); SH.st('full', 30); SH.st('mood', 8); log(`You make sandwiches on a flat stone. ${K2.n} tells you everything: ${K2.his} brother's truck, the teacher who cries at poems, the goat at the Pruitts' that escapes every Tuesday. You don't have to say anything. It's the best lunch you've had since you left.`, 'good'); } },
      { t: '"You didn\'t have to."', fn: () => { next(2, 2); SH.st('full', 30); log(`"I know," ${K2.n} says, the way you say something obvious to somebody slow. "That's what makes it nice." ${K2.He} leaves the whole jar.`, 'good'); } }]);
    if (step === 2) return D(K2.n, [`${K2.n} is lying on ${K2.his} back in the grass by your pile, looking at the sky. Out of nowhere:`, `"Do you live here? Like, LIVE live here? Because nobody builds a fort with a bed in it."`], [
      { t: 'Tell the truth', fn: () => { k.truth = 1; next(3, 3); SH.flag('kidKnows'); log(`You tell ${K2.him}. Not everything. Enough. ${K2.n} is quiet for a long time. Then ${K2.he} holds out a pinky. "I swear on my grandma, who's dead, so it counts double." You hook pinkies. You didn't know how much you needed one person to know.`, 'good'); SH.st('stress', -10); SH.st('mood', 6); } },
      { t: '"I\'m camping. With my uncle."', fn: () => { k.truth = 0; next(3, 3); log(`"Where's your uncle?" "Working." ${K2.n} looks at the bed, and the fire ring, and the three days of dirt on you. "Okay," ${K2.he} says. It's the least convinced "okay" you have ever heard.`, ''); } }]);
    if (step === 3) {
      if (k.truth) return D(K2.n, [`${K2.n} comes up the path fast, standing on the pedals. "Okay so, funny thing."`, `"Your face was on the TV at the feed store. Like, the news. My dad looked right at it, said 'huh,' and changed it to the weather." ${K2.He} laughs. "Nobody out here cares about stuff on TV. Mrs. Pruitt thinks the news is made up by the government. You're, like, the safest kid in the county."`], [
        { t: '"That\'s... weirdly nice."', fn: () => { next(4, 6); SH.st('stress', -8); log(`${K2.n} shrugs. "It's a village. We mind our own business. It's like the one thing we're good at."`, 'good'); } }]);
      return D(K2.n, [`${K2.n} doesn't come for a few days. Then ${K2.he} does, and hangs back by the fence.`, `"I know you don't have an uncle." A pause. "It's fine. Nobody here's gonna say anything. I just wanted you to know I know."`], [
        { t: 'Tell the truth now', fn: () => { k.truth = 1; next(4, 5); SH.flag('kidKnows'); log(`You tell ${K2.him}. ${K2.n} nods like ${K2.he} already knew, because ${K2.he} did. "Cool. Do you want a sandwich or not."`, 'good'); } },
        { t: 'Stick to the story', fn: () => { next(4, 7); log(`"Okay," ${K2.n} says. "Say hi to your uncle." ${K2.He} grins. It isn't mean.`, ''); } }]);
    }
    if (step === 4) return D(K2.n, [`${K2.n} shows up with a shoebox. Inside: a flashlight, four AA batteries, a pair of wool socks that are definitely ${K2.his} dad's, and a note that says EMERGENCY KIT in marker, underlined three times.`, `"For if you ever need to leave in a hurry," ${K2.he} says. "Or if you don't. The socks are good either way."`], [
      { t: 'Put the socks on right there', fn: () => { next(5, 14); SH.st('warmth', 15); SH.st('mood', 10); log(`They're too big and they're the warmest thing you've ever put on. ${K2.n} laughs at you. You laugh too, and for a second you're not a missing kid. You're just a kid, in somebody's dad's socks, laughing.`, 'good'); } }]);
    if (step === 5) { const cold = cal().m === 11 || cal().m <= 1;
      return D(K2.n, [cold ? `${K2.n} trudges up through the snow dragging a sled with a puffy coat on it, bright purple, the zipper pull shaped like a fish. "It's my cousin's. She got a new one. It's ugly but it's WARM."` : `${K2.n} sits with you by the fire ring while the evening goes orange. ${K2.He} doesn't say much. Then: "When you leave, are you gonna say bye? Because people don't, sometimes."`], [
        { t: cold ? 'Wear the ugly coat' : '"I\'ll say bye. I promise."', fn: () => { k.step = 6; SH.flag('kidPromise'); if (cold) SH.st('warmth', 25); log(cold ? 'You wear the purple coat all winter. You will remember it longer than almost anything else about these months.' : `${K2.n} nods, satisfied, and throws a pinecone into the fire. You watch it catch. You mean it. You'll say bye.`, 'good'); } }]); }
  };
  SC.dog = (e) => {
    const p = here(); if (!p || p.id !== e.pid) return; const F = farmer(p), dog = dogOf(p), dg = (T().dog[p.id] = T().dog[p.id] || { step: 0 });
    D(F.place, [`${F.n} is standing in the yard calling "${dog}! ${dog.toUpperCase()}!" in a voice that's trying hard not to crack.`, `"Old girl got out last night. Fourteen years old. Half blind. She never goes past the mailbox." ${F.g === 'she' ? 'She' : 'He'} looks at you. "You're out in those trees more than anybody. You see a yellow dog, you holler."`], [
      { t: `Go look for ${dog} right now`, fn: () => { if (TW && TW.time(120, 0.02, { exert: 1.5 })) return; dg.step = 2; SH.flag('foundDog'); if (V) V.bump(p, 'farm', 4);
        D(F.place, [`Two hours along the creek, calling. You almost give up. Then you hear it: a thin whine from inside a culvert under the county road.`, `${dog} is wedged in there with a cut paw, shivering, and when you crawl in on your elbows she licks your whole face like you're the best thing that ever happened. You carry her back. She's heavier than she looks. You don't put her down once.`, `${F.n} doesn't say anything for a long moment. Just holds the dog. Then: "Anybody ever asks, you're my sister's grandkid, down from Joplin for a while." ${F.g === 'she' ? 'She' : 'He'} clears ${F.g === 'she' ? 'her' : 'his'} throat. "Your grandma's name is Arlene. She makes a bad pie."`],
          [{ t: 'Arlene. Bad pie. Got it.', fn: () => { T().cover = T().cover || {}; T().cover[p.id] = 1; SH.st('mood', 12); SH.st('stress', -10); log(`You have a cover story now, and it came with a grandma. In ${p.name}, you're somebody's family.`, 'good'); } }]); } },
      { t: '"I\'ll keep an eye out."', fn: () => { dg.step = 1; log(`You keep an eye out. Two days later ${dog} limps home on her own. ${F.n} tells everybody at the diner. You wish you'd gone looking.`, ''); } }]);
  };
  (A.mods = A.mods || []).push((p) => (p && G().tale && G().tale.cover && G().tale.cover[p.id] ? 0.85 : 1));
  SC.danny = (e) => {
    const p = here(); if (!p || p.id !== e.pid) return; const n = (V && TW && TW.cache[p.id] && (TW.cache[p.id].people.find((q) => q.kind === 'diner') || {}).n) || 'The waitress';
    D('The diner, after the lunch rush', [`It's dead in the diner. ${n} sits down across from you with a coffee, which she has never done, and looks out the window at nothing.`, `"My boy Danny left when he was sixteen. Took the truck and forty dollars out of my purse. I didn't hear from him for three years." She turns the cup around. "Three years of every car in the driveway being him. Every phone call. Then one Christmas, he called. Just to say he was alive. He didn't say where. I didn't ask. I've never been so grateful for anything in my life."`, `She finally looks at you. "I'm not asking you anything. I'm just saying. Someday, when it's safe. One phone call. It doesn't have to be to your mother. Just somebody who's up at night."`], [
      { t: '"Someday. I promise."', fn: () => { SH.flag('promisedCall'); SH.st('stress', -6); log(`${n} nods once and goes back behind the counter like nothing happened. When you leave, there's a slice of pie in a to-go box on your stool. You didn't order it.`, 'good'); } },
      { t: 'Say nothing', fn: () => { log(`You don't say anything. ${n} doesn't need you to. She refills your hot chocolate and goes back to wiping a counter that's already clean.`, ''); } }]);
  };
  SC.supper = (e) => {
    const p = here(); if (!p || p.id !== e.pid) return;
    D(`Harvest supper, ${p.name}`, [`A hand-painted sign on the church lawn: HARVEST SUPPER, 5 PM, ALL WELCOME, FREEWILL OFFERING. You can smell ham from the road.`, `The whole village is in the fellowship hall at long tables with paper tablecloths. Nobody would notice one more kid. Probably.`], [
      { t: 'Go in and help carry pies', fn: () => { if (TW && TW.time(150, 0.08)) return; SH.st('full', 60); SH.st('mood', 14); SH.st('stress', -8); if (V) V.bump(p, 'church', 3);
        D('Harvest supper', [`Somebody hands you an apron before you can say anything, and suddenly you're carrying pies with three other kids, which is the best disguise there is. Ham, scalloped potatoes, green bean casserole, seven kinds of pie, and a Jell-O thing that nobody eats but everybody brings.`, `At the end the pastor stops you by the door, not blocking it, just there. "Good to see you." A beat. "The door's open on weekdays too. Just so you know. For anything."`], [{ t: '"Thanks."', fn: () => log('You leave with a paper plate of leftovers under foil, heavy as a brick. It feeds you for two days.', 'good') }]); } },
      { t: 'Too many people. Skip it.', fn: () => log('You watch the lit windows of the church hall from the road for a while, and the shapes of people passing plates. Then you walk back in the dark.', '') }]);
  };
  SC.storm = (e) => {
    const p = here(); if (!p || p.id !== e.pid || !hasBase(p)) return; const b = G().base, B = SH.Bases, F = farmer(p);
    const roof = B && B.fx('dry') > 0, walls = B && B.fx('warm') >= 2, fm = G()._farm && G()._farm[p.id] && G()._farm[p.id].met;
    if (roof && walls) return D('Storm', ['The storm comes in around midnight like a train. Thunder you feel in your teeth. The whole shack creaks and flexes.', 'And holds. Water finds exactly one gap in the roof, over your feet, and you move your feet. You lie there in the dark listening to the worst storm of the year happen to everybody else.'], [{ t: 'Sleep, eventually', fn: () => { SH.st('mood', 10); SH.flag('shackHeld'); log('In the morning there are branches down all over the county and your shack is still standing. You built that.', 'good'); } }]);
    D('Storm', [`The storm hits around midnight. The wind gets under ${roof ? 'the walls' : 'the roof'} and part of it just leaves, into the dark. Rain sideways. Everything you own getting soaked.`, fm ? `Then headlights, bouncing up the tractor path. ${F.n}'s truck, wipers going crazy. The window rolls down. "Get in. Don't argue."` : 'You grab your bag and run for the only shelter you can think of.'], [
      fm ? { t: 'Get in', fn: () => { SH.advance(420, { sleep: true, quality: 0.7, interrupt: false }); SH.st('warmth', 40); if (V) V.bump(p, 'farm', 3); log(`You sleep on a cot in ${F.place}'s mudroom next to a dog bed. In the morning there's coffee you're too young for and eggs. ${F.n} drives you back to see the damage and helps you fix it without being asked.`, 'good'); } }
        : { t: 'Run for the church porch', fn: () => { SH.advance(420, { sleep: true, quality: 0.3, interrupt: false }); SH.st('warmth', -20); SH.st('health', -6); log('You spend the night curled on the church porch under the overhang, soaked through. In the morning your shack is a mess and you are a worse one.', ''); } }]);
  };

  /* ================= B) back home ================= */
  const HOME = [
    [3, 'sibmsg'], [6, 'search'], [9, 'plea'], [13, 'stepdad'], [18, 'drawing'], [24, 'reply'], [30, 'vigil'], [42, 'cold'], [60, 'sibbday'], [90, 'quiet'],
  ];
  function homeTick(h) {
    const g = G(); if (g.phase !== 'run' || g.missingAt == null || h < 9 || h > 21) return;
    const d = missingDays(); for (const [n, id] of HOME) if (d >= n && !seen(id)) { if (id === 'reply' && !SH.f('toldSafe')) continue; queue(id); break; }
  }
  const via = () => (online() ? 'phone' : 'town');
  const heard = (onlineTxt, offTxt) => (via() === 'phone' ? onlineTxt : offTxt);
  SC.sibmsg = () => {
    const s = sib();
    if (!G().phone || G().phone.confiscated) return log(`You think about ${s} a lot today. Whether ${s} is sleeping. Whether anybody is making ${s} breakfast.`, '');
    D(`Message from ${s}`, [`Your phone buzzes${online() ? '' : ' the second it finds a bar of signal'}. ${s}.`, `"r u ok"`, `"i didnt tell them anything. they keep asking. i said i didnt know. i promise i didnt"`, `"mom cries in the car. dont tell her i told u"`], [
      { t: '"I\'m ok. You did good. Don\'t worry about me."', fn: () => { SH.flag('sibContact'); G().rel.lily = (G().rel.lily || 0) + 10; if (G().phone.share) G().heat = (G().heat || 0) + 8; log(`Three dots for a long time. Then: "ok". Then: "i put ur hoodie on ur bed so it looks like ur there". You have to put the phone face down for a while.`, 'good'); } },
      { t: 'Read it. Don\'t answer.', fn: () => { SH.st('mood', -6); log(`You read it eleven times. You don't answer, because answering makes it real, and because they'd look at ${s}'s phone. It's the right call. It feels like the worst thing you've ever done.`, ''); } }]);
  };
  SC.search = () => log(heard(`On Chirp: photos from the search in Harlow. Forty people in orange vests walking the ravine behind the middle school in a long line. You recognize your math teacher. You recognize the lady from the laundromat. People who've never said ten words to you, spending their Saturday looking for your body in a creek. You close the app.`, `There's a Harlow paper on the rack at the gas station, three days old. SEARCH FOR MISSING 12-YEAR-OLD DRAWS 40 VOLUNTEERS. A photo of people in orange vests in a long line. You recognize your math teacher. You put the paper back face down.`), '');
  SC.plea = () => {
    const m = mom();
    D(heard('A video', 'The TV over the counter'), [heard(`A local news clip, shared a thousand times. ${m} at a podium in the police station lobby, a sheriff next to her, your school photo on an easel.`, `The little TV behind the gas station counter, sound low. Then your school photo. Then ${m}, at a podium, a sheriff beside her. The clerk turns it up without being asked. You stand very still by the chips.`), `${m} reads from a paper that shakes. "Sam, if you see this, you're not in trouble. Nobody's mad. I just need to know you're okay. Please. Just let somebody know you're okay."`, `She stops reading. She looks straight into the camera. "Please."`], [
      { t: 'Let her know you\'re alive', fn: () => { SH.flag('toldSafe'); G().heat = Math.max(0, (G().heat || 0) - 15);
        log(`You don't call. You ${online() ? 'make a throwaway email on your phone, and' : 'go to the library computer, make a throwaway email, and'} write one line to the address on the flyer: "I'm safe. I'm eating. Please stop looking. — S." You hit send before you can think. Later you hear the case got changed to "runaway, believed safe." Fewer people look at kids' faces.`, 'good'); } },
      { t: 'You can\'t. Not yet.', fn: () => { SH.st('stress', 12); SH.st('mood', -8); log('You walk out before it ends. Behind you, somebody says "that poor woman." You walk until your legs hurt.', ''); } }]);
  };
  SC.stepdad = () => {
    const r = rick(), role = (G().fam && G().fam.role) || 'stepdad';
    if (SH.f('rickGone')) return log(heard(`A Harlow community page post: "${r} has moved out, for anyone asking. Please respect the family's privacy." Forty-two comments. You read none of them. You read all of them.`, `You overhear two women at the post office window. One of them has a cousin in Harlow. "…and the ${role} moved out, that's what she heard. Good riddance, she said."`), '');
    D(r, [heard(`A clip of ${r} in the driveway, a reporter's microphone in his face. He's wearing the shirt he always wears on Saturdays.`, `The Harlow paper at the gas station. Page two: a photo of ${r} in the driveway, and a quote.`), `"Kid's fine. Kid's being dramatic. ${G().name || 'Sam'}'ll come back when ${G().name || 'Sam'} gets hungry, and then we'll have a talk."`, heard('The comments under it are brutal. Somebody has posted a screenshot of an old noise complaint.', 'Somebody has written "SHAME" across his face in ballpoint.')], [
      { t: 'Close it', fn: () => { SH.st('stress', 8); log(`"We'll have a talk." You know exactly what that means. So, it turns out, do a lot of strangers.`, ''); } }]);
  };
  SC.drawing = () => log(heard(`${mom()} posted a photo on Chirp: a drawing ${sib()} made. A house, a sun, and a kid with a backpack walking away, and a speech bubble: COME HOME WHEN UR READY. Two thousand shares.`, `Taped inside the gas station door, next to your MISSING flyer, somebody has put up a printout of a kid's drawing that went around online: a kid with a backpack, and COME HOME WHEN UR READY. You don't know who put it here. You don't want to know.`), '');
  SC.reply = () => {
    const m = mom();
    D(`Email from ${m}`, [`The throwaway email has one message.`, `"I got your message. I read it forty times. I'm not going to beg you to come home. I'm not going to ask where you are. I just want you to know that I know why, now. Some of it. More than I let myself know before. I'm working on it. Tell me you're eating. That's all. Love, Mom."`], [
      { t: 'Write back: "I\'m eating."', fn: () => { SH.flag('momWrote'); SH.st('mood', 8); SH.st('stress', -8); log('Two words. It takes you twenty minutes. You add "love you" and delete it and add it back and send it.', 'good'); } },
      { t: 'Don\'t write back', fn: () => { SH.st('mood', -4); log('You close it. You don\'t delete it. You check it more than you\'d ever admit.', ''); } }]);
  };
  SC.vigil = () => { const j = (G().party || []).includes('jordan'); log(heard(`A candlelight vigil at Harlow Middle School. A hundred phones held up like lighters. ${j ? 'People keep asking about Jordan too; two missing kids.' : 'Jordan reads something off his phone, voice cracking: "Sam, the skatepark misses you. I miss you. Text me back, idiot."'} You watch it twice, at 3 AM, with the brightness all the way down.`, `A kid at the gas station is telling the clerk about a vigil in some town an hour away, for a missing kid. Candles on the school steps. "My cousin went. She said everyone cried." You pay for your hot dog and go.`), ''); };
  SC.cold = () => log(heard('A short news item: the sheriff\'s office has moved your case to a detective who handles long-term missing kids. "The search is ongoing." Nobody reads to the end anymore.', 'Your flyer on the corkboard at the gas station is sun-bleached now, the color gone out of your face. Someone pinned a lost-cat flyer over the corner of it.'), '');
  SC.sibbday = () => { const s = sib();
    D(`${s}'s birthday`, [`You do the math on your fingers twice. It's ${s}'s birthday this week. ${s} is going to blow out candles in that kitchen, and ${mom()} is going to set a place at the table that nobody sits at.`], [
      { t: 'Mail something (no return address)', fn: () => { SH.flag('sibGift'); T().cards++; if (G().money >= 2) SH.money(-2); log(`You mail ${s} ${S && (S.pile()[`spoon`] || 0) > 0 ? 'your best carved spoon, wrapped in a paper towel,' : 'a postcard of a covered bridge'} with no return address and a note: HAPPY BIRTHDAY. EAT THE CAKE FOR ME. — ME. The postmark will give away the county. You decide you don't care.`, 'good'); G().heat = (G().heat || 0) + 4; } },
      { t: 'Just think about it', fn: () => log(`You sing it under your breath at the edge of a field, badly, the way ${s} likes it.`, '') }]);
  };
  SC.quiet = () => log(heard(`Three months. ${mom()}'s Chirp account has gone from posting every hour to every few days. The last one is just a photo of your bedroom door, closed, and one word: "Still."`, 'Three months. Nobody in the county looks at kid faces anymore. The world has moved on to other emergencies. Some part of you is relieved. Some part of you wanted them to keep looking forever.'), '');
  // postcards home: the gas station sells them; once a week; no return address
  if (TW && TW.KIND && TW.KIND.gas) { const bGas = TW.KIND.gas;
    TW.KIND.gas = function (a, L, Tt, p, c) { bGas.apply(this, arguments); try { const g = G(); if (!c.open || g.phase !== 'run' || g.missingAt == null) return; const t = T(); if (SH.day() - t.lastCard < 7) return;
      a.push({ label: 'Send a postcard home: $1', sub: 'No return address. Postmark says the county.', fn: () => { if (g.money < 1) { SH.UI.toast('You need a dollar.'); return SH.UI.afterAction(); } SH.money(-1); t.cards++; t.lastCard = SH.day(); g.heat = (g.heat || 0) + 3;
        const lines = ['I\'M OK. I\'M EATING. I HAVE A COAT.', 'THERE\'S A GOAT HERE THAT ESCAPES EVERY TUESDAY. I\'M FINE.', `TELL ${sib().toUpperCase()} I SAID HI AND TO STOP READING MY DIARY.`, 'I SAW A HERON. I\'M SAFE. DON\'T LOOK FOR ME.', 'IT SNOWED. I WAS WARM. I PROMISE.', 'I\'M LEARNING TO CARVE. I\'LL MAKE YOU A SPOON.'];
        log(`A postcard with a covered bridge on it. You write, in capitals so nobody can say it's your handwriting: "${lines[(t.cards - 1) % lines.length]}" No return address. Into the blue box.`, 'good'); SH.UI.afterAction(); } }); } catch (e) { console.warn(e); } }; }

  /* ================= C) the calendar ================= */
  function dateTick(h) {
    const g = G(), p = here(); if (!p || g.phase !== 'run' || g.missingAt == null) return; const c = cal(), w = SH.weatherDay ? SH.weatherDay() : {};
    if (!seen('snow') && (c.m === 10 || c.m === 11 || c.m <= 2) && w.lo <= 30 && /rain|storm|cloudy/.test(w.c || '') && h === 7) queue('snow');
    if (!seen('thanks') && c.m === 10 && c.dd >= 22 && c.dd <= 28 && wdN() === 'Thursday' && h === 15) queue('thanks');
    if (!seen('xmas') && c.m === 11 && c.dd === 24 && h === 18) queue('xmas');
    if (!seen('newyear') && c.m === 11 && c.dd === 31 && h === 21) queue('newyear');
    if (!seen('spring') && c.m >= 2 && c.m <= 4 && w.hi >= 60 && h === 12 && missingDays() > 30) queue('spring');
  }
  const warmN = (p) => (V && p ? V.st(p.id).perks.length : 0);
  const withWho = () => { const pt = K.party(); return pt.length ? pt.map(K.nm).join(' and ') : ''; };
  SC.snow = () => { const p = here(), b = hasBase(p), w = withWho();
    D('First snow', [`You wake up and the light is wrong. Too bright, too quiet. ${b ? 'You push the door open and' : 'You look out and'} the whole world has been erased and redrawn in white. ${p ? p.name : 'The town'} is silent in a way that makes you whisper.`, w ? `${w} ${K.party().length > 1 ? 'are' : 'is'} already outside, catching snowflakes with ${K.party().length > 1 ? 'their mouths' : 'an open mouth'}, looking about six years old.` : 'Nobody made you breakfast. Nobody told you to wear boots. You stand in it anyway, in the first snow, and nobody on earth knows where you are, and for once that feels like a gift instead of a threat.'],
      [{ t: 'Make one snow angel', fn: () => { SH.st('mood', 12); SH.st('warmth', -6); SH.flag('firstSnow'); log('A snow angel, the first one since you were small. It\'s lopsided. You leave it there for the deer to be confused by.', 'good'); } }]); };
  SC.thanks = () => { const p = here(), wn = warmN(p), w = withWho(), kid = p && kst(p).step >= 3 && kst(p).truth ? kidOf(p) : null;
    if (wn >= 2 || kid) return D('Thanksgiving', [kid ? `${kid.n} shows up at your door with a foil-covered paper plate the size of a hubcap. "My mom made too much. I told her it was for the birds. She said, and I quote, 'big birds.'" Turkey, stuffing, sweet potatoes with marshmallows, a roll with a thumbprint in it.` : `A foil-covered plate is waiting on the stump by your pile, with a note: "Too much food at our house. Happy Thanksgiving. —the church." Turkey, stuffing, a roll, pie.`, w ? `You split it with ${w}, sitting on the woodpile, taking turns saying what you're thankful for as a joke until it isn't.` : 'You eat it slowly, and think about the table in Harlow, and how you are more thankful for this paper plate than for any Thanksgiving you can remember.'],
      [{ t: 'Say thanks to nobody in particular', fn: () => { SH.st('full', 60); SH.st('mood', 14); log('You wash the plate in the creek and leave it on the stump. It\'s gone the next morning.', 'good'); } }]);
    D('Thanksgiving', ['Everything is closed except the gas station. The clerk has a paper turkey taped to the register and a sad look for anyone who comes in today.', `You buy the last slice of pumpkin pie from the case, and ${w ? `you and ${w} eat it` : 'you eat it'} on the curb with a plastic fork while the whole town eats somewhere behind lit windows.`],
      [{ t: 'It\'s actually pretty good pie', fn: () => { if (G().money >= 3) SH.money(-3); SH.st('full', 20); SH.st('mood', 2); log('The clerk comes out on a smoke break and says "happy Thanksgiving, kid" and it\'s the nicest thing anyone says to you all day.', ''); } }]); };
  SC.xmas = () => { const p = here(), wn = warmN(p), w = withWho(), m = mom(), kid = p && kst(p).step >= 4 ? kidOf(p) : null;
    const scene = [wn >= 3 ? `Christmas Eve. ${p.name} has put lights on the grain elevator. When you get back to your spot there's a stocking nailed to ${hasBase(p) ? 'your door' : 'a tree by your pile'}: an orange, a candy cane, wool mittens, a five-dollar bill, and a card signed by what looks like half the village.` : `Christmas Eve. Carolers come down the main street in a clump, off-key, holding paper cups of cocoa. They sing "Silent Night" right past you and one of them, an old man, winks.`,
      kid ? `${kid.n} gave you a present this afternoon wrapped in the Sunday comics: a pocketknife sharpener and a drawing of your shack with smoke coming out of the chimney. "So you have a Christmas card," ${kid.he} said.` : '', w ? `You and ${w} trade presents you made: things carved, things found, things that are mostly jokes. You laugh so hard it hurts.` : '',
      `At 9 PM your phone finds one bar. ${online() ? `A message from ${m}: "Merry Christmas, wherever you are. I set a plate. I'll always set a plate."` : 'No messages. You look at the number you still know by heart.'}`].filter(Boolean);
    if (wn >= 3) SH.money(5);
    D('Christmas Eve', scene, [
      { t: `Call ${m}. Just for a minute.`, fn: () => { SH.flag('calledHome'); G().heat = (G().heat || 0) + 10; SH.st('mood', 10); SH.st('stress', -10);
        D('The call', [`It rings once. "Hello?" Her voice is already breaking; she knows. Of course she knows.`, `"It's me. I'm okay. I'm warm. I just wanted to say Merry Christmas."`, `She doesn't ask where you are. You can hear her not asking; it's the loudest thing you've ever heard. She says, "Merry Christmas, baby. Thank you. Thank you for calling." And then, because she can't not: "Will you call again?"`, SH.f('promisedCall') ? 'You think of the diner, and a woman whose son called once, after three years.' : ''].filter(Boolean),
          [{ t: '"I\'ll call again."', fn: () => log('You hang up first. You sit in the snow for a long time. You kept one promise tonight, at least to yourself.', 'good') }]); } },
      { t: 'Not tonight', fn: () => { SH.st('mood', 4); log('You don\'t call. You watch the lights on the grain elevator until they turn off at midnight, and then it\'s Christmas, and you\'re still here.', ''); } }]);
  };
  SC.newyear = () => { const w = withWho(), p = here();
    D('New Year\'s Eve', [`At midnight somebody in ${p ? p.name : 'town'} sets off fireworks from a pickup bed, the cheap kind, three of them, and every dog in the county loses its mind.`, w ? `${w} counts down with you, out loud, from ten, in the cold. At zero, nobody knows what to do, so you all just yell.` : 'You count down from ten out loud, alone, in the cold. At zero you say "happy new year" to the sky, and it doesn\'t say anything back, and that\'s okay.', `Last year at midnight you were ${pick(['hiding in your room with headphones on', 'watching the ball drop on the couch while the house got loud behind you', 'asleep before ten, on purpose'])}. This year you're somewhere nobody chose for you.`],
      [{ t: 'Make a resolution', fn: () => { SH.st('mood', 8); SH.flag('resolution'); log(`You make one resolution, and you don't tell anybody, and you keep it.`, 'good'); } }]); };
  SC.spring = () => { const p = here();
    D('First warm day', [`The first warm day. Everything drips. The creek is loud with snowmelt, the fields are black mud, and some bird you don't know the name of won't shut up about it.`, `You take your coat off for the first time in months. Your arms are pale and thinner and stronger than they were in October. You made it through a whole winter.`, hasBase(p) && G().base.up.includes('sh_footing') ? 'The low ground around your shack is flooded, but your stone footing keeps the floor dry. Past-you knew what they were doing.' : hasBase(p) ? 'Water runs through the low side of your shack. Stone footing would have kept it out. Next time.' : ''].filter(Boolean),
      [{ t: 'Sit in the sun', fn: () => { SH.st('mood', 15); SH.st('stress', -10); SH.flag('madeItWinter'); log('You sit in the sun on a rock until you fall asleep. Nobody wakes you up.', 'good'); } }]); };

  /* ================= endings: two new "later" endings, and extra lines in the others ================= */
  if (X) {
    const ex = (g) => (g.later ? Math.round((g.t - g.later.t0) / 1440) : 0);
    X.add([
      { k: 'laterCall', on: ['later'], p: 7, w: (c) => c.f('calledHome'), t: 'The Call', sub: 'One phone call on Christmas Eve. Never found.',
        x: (c) => [`You called ${c.momN} on Christmas Eve and she didn't ask where you were. That one phone call is the hinge the whole winter swung on.`,
          `After that, you call once a month, from a different place each time, never longer than three minutes. She never asks. She just tells you things: ${c.sib} lost a tooth, the neighbor's dog had puppies, ${c.f('rickGone') ? `${c.rick} is gone and isn't coming back,` : 'she\'s seeing a counselor now,'} she's learning to cook something besides spaghetti.`,
          c.f('promisedCall') ? 'Somewhere in a village diner, a waitress who waited three years for one call would be glad. You never tell her. You think she knows.' : '',
          `Nobody finds you. In spring you tell her the name of a town, and a day, and a time, and you watch from across the street as she gets out of the car, and you decide. That part is yours. The story stops at the moment you step off the curb.`].filter(Boolean) },
      { k: 'laterPostcards', on: ['later'], p: 5, w: (c) => (c.g.tale && c.g.tale.cards >= 3), t: 'Postcards', sub: (c) => `${c.g.tale.cards} postcards. No return address. Never found.`,
        x: (c) => [`Every week or two, a postcard in capital letters arrives in Harlow with a covered bridge or a grain elevator or a lake on the front, postmarked somewhere different, no return address. I'M OK. I'M EATING. I HAVE A COAT.`,
          `${c.momN} keeps them in a shoebox. Then on the fridge. Then, when the fridge is full, on the wall of the hallway, in a line, like a road.`,
          `${c.sib} reads them out loud at dinner. The detective on your case reads them too, and one day, quietly, closes the file: "runaway, in contact, believed safe."`,
          `Nobody finds you. You're not lost. You're just somewhere else, writing home.`] },
    ]);
    X.defs.filter((d) => d.on.includes('later') && d.k !== 'laterCall').forEach((d) => { const bx = d.x; d.x = (c) => { const r = bx(c).slice(); const p = c.place, g = c.g;
      const k = p && g.tale && g.tale.kid && g.tale.kid[p.id]; if (k && k.step >= 3 && k.truth) { const K2 = kidOf(p); r.splice(Math.max(1, r.length - 1), 0, `${K2.n} kept your secret the whole time. ${SH.f('kidPromise') ? `When you finally leave ${p.name}, you say bye, like you promised. ${K2.n} pretends not to cry. You both pretend.` : `${K2.He} still has the pinky-swear scar on ${K2.his} dignity, ${K2.he} says. You don't know what that means. You'll miss ${K2.him} anyway.`}`); }
      if (c.f('momWrote') && d.k !== 'laterPostcards') r.splice(Math.max(1, r.length - 1), 0, `Every few weeks you write ${c.momN} two words from a library computer: "I'm eating." Every time, she writes back more.`);
      return r; }; });
  }
})(window.SH);
