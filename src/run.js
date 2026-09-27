/* SMALL HOURS — the run */
(function (SH) {
  const U = SH.util, D = (o) => SH.UI.dialog(o);
  const R = SH.Run = {};

  /* ---------- leaving ---------- */
  R.prepare = function () {
    const G = SH.G, h = SH.hour();
    const items = G.bag.filter((i) => !['phone', 'key', 'buspass'].includes(i)).map((i) => SH.ITEMS[i].i + ' ' + SH.ITEMS[i].n);
    const warn = [];
    if (!SH.has('inhaler')) warn.push('You don\'t have your inhaler.');
    if (!SH.has('coat')) warn.push('No coat. Tonight\'s low: ' + SH.weatherDay(SH.day() + 1).lo + '°F.');
    if (SH.foodInBag().length === 0) warn.push('No food.');
    if (!SH.has('charger') && !SH.has('powerbank')) warn.push('No way to charge your phone.');
    D({ title: 'Leaving', text: [`It's ${SH.fmt12()}. You stand in your room with your backpack on. It weighs ${SH.bagWeight().toFixed(1)} of ${SH.BAG_CAP}.`,
      'In the bag: ' + (items.join(', ') || 'almost nothing') + '. Cash: $' + G.money.toFixed(2) + '.', warn.length ? '⚠ ' + warn.join(' ') : 'You\'ve thought about this. You think.',
      'The house makes its night noises. Somewhere below, the TV murmurs to nobody.'],
    choices: [
      { t: 'Write a note (type it)', sub: 'What do you want them to know?', cond: () => !SH.f('leftNote'), fn: () => R.note() },
      { t: 'Take the $40 from Mom\'s purse', sub: 'It\'s grocery money. You know it\'s grocery money.', cls: 'hot', cond: () => !SH.f('stoleFromMom') && SH.momWhere() !== 'work', fn: () => { SH.flag('stoleFromMom'); SH.money(40); SH.st('mood', -6); SH.UI.log('Two twenties, folded. Your hands shake. You tell yourself you\'ll pay it back.', 'warn'); R.prepare(); } },
      { t: 'Look in on Lily', cond: () => SH.lilyWhere() !== 'school' && !SH.f('goodbyeLily'), fn: () => { SH.flag('goodbyeLily'); SH.st('mood', -4); SH.st('stress', 5);
        D({ title: 'Lily', who: 'lily', text: [SH.lilyWhere() === 'asleep' ? 'She\'s asleep sideways with Sheldon under her chin. Her nightlight throws turtle shapes on the ceiling.' : 'She\'s coloring on the floor. "Where are you going?" "Just out, bug." "Will you be back for dinner?"', 'You tuck the blanket around her feet. "Love you infinity plus one," you whisper.', 'This is the hardest thing you have ever done.'], choices: [{ t: 'Go', fn: () => R.prepare() }] }); } },
      { t: 'Unpack. Not tonight.', fn: () => { SH.UI.log('You sit on your bed with the backpack on your lap for a long time. Then you put it in the closet.', 'sys'); } },
      { t: 'Leave.', cls: 'hot', fn: () => R.sneak() },
    ] });
  };
  R.note = function () {
    const md = document.querySelector('#modal'); md.classList.remove('hidden');
    md.innerHTML = `<div class="mbox"><div class="mhead"><h3>A note on your pillow</h3></div><div class="mtext"><p>Write whatever you want them to read. It matters what you say.</p>
      <textarea id="noteTa" style="width:100%;height:140px;font-family:Georgia,serif;font-size:15px" placeholder="Mom,"></textarea></div>
      <div class="mchoices"><button class="btn primary" id="noteOk">Leave it on the pillow</button></div></div>`;
    const ta = document.querySelector('#noteTa'); ta.onkeydown = (e) => e.stopPropagation(); ta.focus();
    document.querySelector('#noteOk').onclick = () => {
      const txt = ta.value.trim(); const an = SH.NLP.analyze(txt); SH.flag('leftNote'); SH.G.noteText = txt;
      if (an.has('disclose') || an.has('scared')) SH.flag('noteDisclosed');
      if (an.has('love')) SH.flag('noteLove');
      if (an.loc || an.has('grandma')) SH.flag('noteRevealed', an.loc || 'grandma');
      md.classList.add('hidden'); md.innerHTML = ''; SH.UI.log('You leave the note on your pillow: "' + (txt.slice(0, 120) || '...') + (txt.length > 120 ? '…' : '') + '"', 'say'); R.prepare();
    };
  };
  R.sneak = function () {
    const G = SH.G, rh = SH.rickWhere(), awake = rh === 'home', momHome = SH.momWhere() === 'home';
    if ((awake || momHome) && !G.flags.bigNightLeave) {
      const p = awake ? (SH.rickDrunk() >= 2 ? 0.7 : 0.45) : 0.6;
      if (!U.chance(p)) {
        D({ title: 'Caught', who: awake ? 'rick' : 'mom', text: [awake ? 'The stair creaks — the third one, it always creaks. Rick\'s voice from the couch: "Where do you think you\'re going?"' : 'Mom\'s bedroom door opens. "Sam? What are you doing with your backpack?"'],
          choices: [{ t: 'Bolt out the door', cls: 'hot', fn: () => { R.start('caught', true); } }, { t: '"Nowhere. Getting water."', fn: () => { SH.susp(25, 'caught sneaking out'); SH.st('stress', 10); SH.UI.log('You go back upstairs. Your heart is a drum.', 'warn'); SH.UI.afterAction(); } }] });
        return;
      }
    }
    R.start('sneak', false);
  };

  R.start = function (reason, discoveredNow) {
    const G = SH.G;
    SH.snapshot('left');
    G.phase = 'run'; G.missingAt = G.t; G.flags.runReason = reason; SH.flag('ranAway'); SH.tag('ranAway');
    G.room = null; G.susp = 0; G.heat = discoveredNow ? 25 : 0;
    G.discoverAt = discoveredNow ? G.t : R.calcDiscover();
    if (reason === 'bigNight') G.discoverAt = Math.min(G.discoverAt, G.t + 9 * 60);
    if (SH.f('leftNote')) G.discoverAt = Math.min(G.discoverAt, G.t + 8 * 60);
    SH.UI.log(reason === 'leftTown' ? '— You leave Harlow. —' : '— You leave. —', 'day');
    SH.UI.log(reason === 'leftTown' ? 'You didn\'t pack a speech or say goodbye. You just didn\'t turn around. The water tower gets smaller behind you, and somewhere back there, a house hasn\'t noticed yet. It will. This counts. You\'re gone.' : reason === 'bigNight' ? 'Out the window, onto the porch roof, down the drainpipe you\'ve imagined climbing a hundred times. Your hands are shaking. The cold hits you like a slap. Behind you, a light is still on.' : 'The door clicks shut behind you. The street is exactly the same as always, which feels impossible.', 'bad');
    SH.UI.log('You are twelve years old, and you are out. Open the map to go somewhere. Ask PIP for a plan. Watch your warmth, food, battery — and who\'s looking for you.', 'sys');
    SH.UI.afterAction();
  };
  R.calcDiscover = function () {
    const G = SH.G; let t = G.t + 20;
    for (let i = 0; i < 200; i++) {
      t += 10; const h = SH.hour(t);
      if (SH.isWeekday(t) && Math.abs(h - 9.5) < 0.09) return t; // school calls
      if (SH.momWhere(t) === 'home' && h > 6 && h < 23.5) return t + 15;
      if (Math.abs(h - 18.5) < 0.09 && SH.rickWhere(t) === 'home') return t;
    }
    return G.t + 10 * 60;
  };

  /* ---------- per tick ---------- */
  R.tick = function (k, opts) {
    const G = SH.G;
    if (!G.discoveredAt && G.t >= G.discoverAt) R.discovered();
    if (G.discoveredAt) {
      if (!G.reported && G.t >= G.discoveredAt + 120) { G.reported = true; G.heat = Math.max(G.heat, 35); SH.Phone.addPost('dana.reyes', `MISSING: ${G.name} Reyes, 12, last seen ${SH.dateStr(G.missingAt)} in Harlow. Grey hoodie, black backpack. Please share. Please call if you see my baby. 💔`, G.t, { missing: true, shares: 12 }); SH.UI.log('Your mom has filed a missing report. Your school photo is on Chirp.', 'bad'); }
      G.heat = Math.min(100, G.heat + (G.reported ? 2.6 : 1) * k);
      const mp = G.feed.find((p) => p.missing); if (mp) mp.shares = Math.round(mp.shares + 18 * k);
    }
    // pickups
    if (G.pickup && G.t >= G.pickup.at) { const p = G.pickup; G.pickup = null; SH.Events.queue({ id: 'pickup', run: () => R.doPickup(p) }); }
    if (G.dexMeetAt && G.t > G.dexMeetAt + 90) { G.dexMeetAt = null; }
  };
  R.discovered = function () {
    const G = SH.G; G.discoveredAt = G.t; G.heat = Math.max(G.heat, 12);
    const note = SH.f('leftNote');
    SH.Phone.push('mom', 'mom', note ? 'I found your note. Baby please. Please call me. I\'m not angry. I just need to know you\'re okay.' : 'Where are you?? Your bed wasn\'t slept in. CALL ME RIGHT NOW');
    setTimeout(() => SH.Phone.push('mom', 'mom', 'Please. Please. Please.'), 2500);
    SH.UI.log('Your phone buzzes. And buzzes. They know you\'re gone.', 'warn');
    if (G.flags.noteRevealed) G.revealed = G.flags.noteRevealed === 'grandma' ? null : G.flags.noteRevealed;
  };
  R.phoneHour = function () {
    const G = SH.G; if (!G.discoveredAt) return;
    const since = (G.t - G.discoveredAt) / 60;
    if (U.chance(0.45)) SH.Phone.push('mom', 'mom', U.pick(['Please answer.', 'Lily keeps asking where you are. What do I tell her?', 'I called the hospital to see if you came in. I call every hour.', 'Whatever happened, we can fix it. I promise.', 'Are you warm? It\'s so cold tonight.', 'I love you. I\'m not mad. I\'m so scared.', 'I know about Rick. I know. Please come home or just tell me you\'re safe.'].filter((m, i) => i !== 6 || SH.f('noteDisclosed') || SH.f('momKnows'))));
    if (since > 1 && U.chance(0.2)) SH.Phone.push('jordan', 'jordan', U.pick(['dude where r u. ur mom called my mom', 'r u ok??? everyone at school is talking about it', 'my garage is open if u need it. 4417. i didnt tell anyone', 'please just text me back so i know ur alive']));
    if (since > 3 && !G.done.grandmaRunText) { G.done.grandmaRunText = true; SH.Phone.push('grandma', 'grandma', 'Your mother called me. Sweetheart, wherever you are, call me. I will come get you. Any hour. I meant it. Love, Grandma'); SH.flag('grandmaOffer'); }
    if (since > 2 && (G.flags.dexStage || 0) >= 3 && !SH.f('dexBlocked') && !G.done.dexRun) { G.done.dexRun = true; SH.Phone.push('dex', 'dex', 'saw ur missing post 👀 u ok? i can come get u rn. i have a car and my own place. where r u'); SH.flag('dexOffer'); G.redFlags.includes('Contacts you the moment you\'re most vulnerable — after you ran away.') || G.redFlags.push('Contacts you the moment you\'re most vulnerable — after you ran away.'); }
    if (since > 0.5 && U.chance(0.18) && SH.Phone.ok() && !G.phone.airplane && !SH.Talk.cur && !SH.UI.modalOpen()) {
      SH.Phone.incoming('mom', () => SH.Talk.open('mom', { ctx: 'runText', phone: true, first: '...Sam? Sam, is that you? Oh my God. Oh my God. Are you okay? Where are you?', turnsMax: 7, onEnd: () => { if (SH.f('toldMomWhere')) R.momComing(); } }), () => { SH.st('stress', 3); });
    }
    // found check
    R.foundCheck();
  };
  R.foundCheck = function () {
    const G = SH.G; if (!G.discoveredAt || G.ended || SH.UI.modalOpen()) return;
    const L = SH.LOC[G.loc];
    if (G.phone.share && !G.phone.airplane && G.phone.bat > 0 && G.reported && U.chance(0.55)) { SH.Events.queue({ id: 'found', run: () => SH.Endings.found('tracked') }); return; }
    let p = (G.heat / 100) * (L.vis != null ? L.vis : 0.5) * 0.2;
    if (['school', 'jordan', 'park', 'bus', 'hospital', 'home'].includes(G.loc)) p *= 1.6;
    if (G.revealed === G.loc) p += 0.5;
    if (SH.isDark()) p *= 0.75;
    p *= SH.World ? SH.World.vis() : 1;
    if (U.chance(p)) SH.Events.queue({ id: 'found', run: () => SH.Endings.found(G.revealed === G.loc ? 'post' : 'police') });
  };
  R.posted = function (an) {
    const G = SH.G; G.heat = Math.min(100, G.heat + 12);
    if (an.loc) { G.revealed = an.loc; SH.UI.log('You just posted where you are. Hundreds of people are sharing your missing poster. Some of them read your post.', 'bad'); }
    setTimeout(() => SH.Phone.addPost('dana.reyes', '@' + G.feed[0].who + ' PLEASE COME HOME. PLEASE.', G.t) || SH.Phone.render(), 2500);
    setTimeout(() => SH.Phone.addPost('maddie.k', 'omg is this sam from 7B?? everyone share the missing post', G.t) || SH.Phone.render(), 4000);
  };

  /* ---------- arrivals ---------- */
  R.onArrive = function (to) {
    const G = SH.G, h = SH.hour();
    if (to === 'diner' && !G.done.dolores && (SH.isDark() || h < 8)) { G.done.dolores = true; SH.Events.queue({ id: 'dolores', run: () => D({ title: 'Nite Owl Diner', who: 'dolores', text: ['The bell on the door jingles. Warmth. Grease. A radio playing oldies to three truckers and a guy asleep in a booth.', 'A waitress with a pencil in her bun and a nametag that says DOLORES looks at you, then at the clock, then back at you. "Well hi there, hon. Little late for a school night, isn\'t it?"'],
      choices: [{ t: 'Talk to her (type it)', fn: () => SH.Talk.open('dolores', { turnsMax: 8 }) }, { t: 'Sit in the corner booth', fn: () => {} }] }) }); }
    if (to === 'underpass' && !G.done.wrenRun) { G.done.wrenRun = true; SH.Events.queue({ id: 'wrenrun', run: () => D({ title: 'Under the Bridge', who: 'wren', text: ['Trucks thunder overhead. The concrete sweats. There are three sleeping bags against the wall, a shopping cart, a small camp stove.', SH.f('metWren') ? 'Wren looks up from a paperback. Her face falls. "Oh no. Oh, kid. No."' : 'A girl with grown-out purple hair looks up from a paperback. "You\'re lost, or you\'re out. Which?"'],
      choices: [{ t: 'Talk to her (type it)', fn: () => { SH.flag('metWren'); SH.Talk.open('wren', { turnsMax: 10 }); } }, { t: 'Find a spot by the wall', fn: () => SH.flag('metWren') }] }) }); }
    if (to === 'trainyard') SH.Events.queue({ id: 'yard', run: () => R.trainyard() });
    if (to === 'store' && G.dexMeetAt && Math.abs(G.t - G.dexMeetAt) < 90) SH.Events.queue({ id: 'dexcar', run: () => SH.Endings.dex(false) });
    if (to === 'hospital') SH.Events.queue({ id: 'hosp', run: () => D({ title: 'St. Brigid\'s', text: ['The automatic doors breathe warm air at you. Behind the front desk, a nurse in teal scrubs looks up — and her face changes. You recognize her. Carla. From Mom\'s birthday.', '"Sam? Oh, sweetie. Your mom is upstairs. She\'s been here all night, she didn\'t know where else to go."'],
      choices: [{ t: 'Let Carla take you upstairs', cls: 'safe', fn: () => SH.Endings.foundMom('hospital') }, { t: 'Turn around and walk out', cls: 'hot', fn: () => { SH.G.heat = Math.min(100, SH.G.heat + 25); SH.G.revealed = 'hospital'; SH.UI.log('You hear her calling your name behind you. You don\'t stop.', 'bad'); } }] }) });
    if (to === 'police') SH.Events.queue({ id: 'selfturn', run: () => D({ title: 'Harlow Police', text: ['The lobby smells like burnt coffee. A woman officer behind the glass looks up from a crossword. Her name tag says LOWE.', 'She looks at you. At your backpack. At the MISSING poster taped to the glass, right next to her face, with your school photo on it.'],
      choices: [{ t: 'Talk to her', cls: 'safe', fn: () => SH.Endings.found('self') }, { t: 'Leave before she stands up', fn: () => { SH.G.heat += 20; SH.G.revealed = 'police'; } }] }) });
    if (to === 'harbor') SH.Events.queue({ id: 'harborArr', run: () => SH.Endings.harbor('walked') });
    if (to === 'patel') SH.Events.queue({ id: 'patelRun', run: () => SH.Endings.patel(true) });
    if (to === 'home' && G.t - G.missingAt > 30) SH.Events.queue({ id: 'homeback', run: () => D({ title: 'Maple Street', text: ['You\'re standing across the street from your house. The porch light is on. It\'s never on.', G.discoveredAt ? 'Through the window you can see Mom at the kitchen table with her head in her hands. A police cruiser is parked out front.' : 'Nobody knows you\'re gone yet. You could slip back in. Nobody would ever know.'],
      choices: [{ t: 'Go inside', cls: 'safe', fn: () => SH.Endings.walkHome() }, { t: 'Not yet', fn: () => {} }] }) });
    if (to === 'jordan' && SH.hour() >= 21 || to === 'jordan' && SH.hour() < 7) SH.Events.queue({ id: 'garage', run: () => D({ title: 'Jordan\'s Garage', who: 'jordan', text: [SH.f('jordanGarage') ? 'You punch 4417 into the side door. It clicks open. The garage smells like motor oil and Axe body spray.' : 'The side door is unlocked — it always is. Jordan says his dad forgets.', 'The couch. The mini fridge. A space heater. It\'s the nicest place you\'ve been all night.'],
      choices: [{ t: 'Sleep here till morning', cls: 'safe', fn: () => SH.Endings.garage() }, { t: 'Text Jordan you\'re here', fn: () => { SH.Phone.push('jordan', 'jordan', 'WAIT UR IN MY GARAGE?? coming down with blankets and pizza rolls'); SH.st('mood', 10); SH.st('full', 20); SH.Endings.garage(); } }, { t: 'Leave. They\'d have to call your mom.', fn: () => {} }] }) });
  };
  R.trainyard = function () {
    D({ title: 'The Rail Yard', text: ['A hole in the fence. Rusted boxcars in rows, black against a sky the color of a bruise. It looks like the movies.', 'Then you hear voices from inside one of the cars — men, arguing, slurring. A bottle smashes. Someone laughs in a way that makes every hair on your neck stand up. A flashlight beam swings toward you.'],
      choices: [{ t: 'Back away. Now.', fn: () => { SH.st('stress', 18); SH.G.loc = 'park'; SH.advance(30, { exert: 3, interrupt: false }); SH.UI.log('You run until your lungs burn and don\'t stop until you\'re under a streetlight at Riverside Park. Wren was right. It is not a movie.', 'bad'); SH.UI.afterAction(); } }] });
  };

  /* ---------- sleeping out ---------- */
  R.sleepSpots = { park: { q: 0.35, risk: 0.3, n: 'a bench under the pavilion' }, underpass: { q: 0.5, risk: 0.15, n: 'a patch of dry concrete near Wren\'s camp' },
    laundromat: { q: 0.45, risk: 0.35, n: 'the plastic chairs by the warm dryers' }, diner: { q: 0.35, risk: 0.25, n: 'the corner booth' }, bus: { q: 0.3, risk: 0.4, n: 'a bench by Bay 3' },
    library: { q: 0.4, risk: 0.5, n: 'a beanbag in the teen section' }, store: { q: 0.2, risk: 0.5, n: 'behind the dumpster' }, mall: { q: 0.3, risk: 0.6, n: 'a bench by the fountain' } };
  R.sleep = function (forced) {
    const G = SH.G, spot = R.sleepSpots[G.loc] || { q: 0.25, risk: 0.35, n: 'the ground' };
    let q = spot.q; if (SH.has('blanket')) q += 0.15; if (G.loc === 'underpass' && G.rel.wren > 10) q += 0.1;
    SH.UI.log(`You curl up on ${spot.n}${SH.has('blanket') ? ' under your dinosaur blanket' : ''}.`, 'sys');
    G.stats.nightsOut += SH.isDark() ? 1 : 0;
    const hrs = forced ? 5 : Math.min(8, Math.max(3, ((7 - SH.hour() + 24) % 24) || 6));
    let slept = 0;
    for (let i = 0; i < hrs; i++) {
      const intr = SH.advance(60, { sleep: true, quality: q, interrupt: true }); slept++;
      if (G.ended) return;
      if (intr) break;
      const risk = spot.risk * (G.loc === 'underpass' && G.rel.wren > 10 ? 0.5 : 1);
      if (U.chance(risk * 0.35)) { R.sleepEvent(); break; }
    }
    SH.UI.log(`You slept about ${slept} hour${slept === 1 ? '' : 's'}. Everything aches.`, 'sys');
    SH.UI.afterAction();
  };
  R.sleepEvent = function () {
    const G = SH.G, L = G.loc;
    if (L === 'laundromat' || L === 'bus' || L === 'library' || L === 'mall') {
      if (G.heat > 45) { SH.Events.queue({ id: 'found', run: () => SH.Endings.found('security') }); return; }
      SH.Events.queue({ id: 'kicked', run: () => D({ title: 'Woken Up', text: [`A flashlight in your face. "${L === 'laundromat' ? 'Hey. HEY. No sleeping in here. This ain\'t a hotel.' : 'Security. Can\'t sleep here, buddy. Where are your parents?'}"`], choices: [{ t: 'Mumble an apology and leave', fn: () => { SH.st('stress', 8); G.outsideOverride = false; } }] }) });
      return;
    }
    const roll = Math.random();
    if (roll < 0.4 && G.bag.length > 3) {
      const stealable = G.bag.filter((i) => !['phone', 'key', 'buspass', 'hoodie', 'coat'].includes(i));
      const lost = U.shuffle(stealable).slice(0, 2); lost.forEach((i) => SH.rmBag(i)); const cash = Math.round(G.money * 0.6); SH.money(-cash);
      SH.Events.queue({ id: 'robbed', run: () => D({ title: 'Woken Up', text: ['You wake up because someone is pulling on your backpack. A shape runs off into the dark, laughing.', `Gone: ${lost.map((i) => SH.ITEMS[i].n).join(', ') || 'nothing important'}${cash ? ' and $' + cash : ''}.`, 'You sit there shaking until the sky turns gray.'], choices: [{ t: '...', fn: () => { SH.st('stress', 20); SH.st('mood', -12); SH.tag('robbed'); } }] }) });
    } else if (roll < 0.7) {
      SH.Events.queue({ id: 'nightman', run: () => D({ title: 'Someone Standing There', text: ['You open your eyes. A man is standing a few feet away, just watching you. He\'s not homeless — his shoes are too clean. "Hey there. You look cold. I\'ve got a warm car. Heater\'s running."'],
        choices: [{ t: 'Grab your stuff and walk fast toward the lights', cls: 'safe', fn: () => { SH.st('stress', 15); SH.UI.log('You don\'t look back. Your heart doesn\'t slow down for an hour.', 'warn'); } }, { t: 'Yell for help', fn: () => { SH.st('stress', 12); SH.UI.log('He mutters something and walks away quickly. ' + (G.loc === 'underpass' ? 'Wren is already on her feet, holding a bike lock like a weapon. "Yeah, keep walking, creep."' : ''), 'warn'); } }, { t: 'Get in the car. It\'s so cold.', cls: 'hot', fn: () => SH.Endings.dex(true) }] }) });
    } else {
      SH.Events.queue({ id: 'rainwake', run: () => D({ title: 'Woken Up', text: [SH.raining() ? 'Rain finds you. It always finds you. Your hoodie is soaked through and you\'re shaking so hard your teeth click.' : 'A dog is barking, close. Then a car door. Then silence. You don\'t go back to sleep.'], choices: [{ t: '...', fn: () => { if (SH.raining()) SH.G.s.warmth -= 20; SH.st('stress', 10); } }] }) });
    }
  };

  /* ---------- random night events while walking ---------- */
  R.nightEvent = function () {
    const G = SH.G; const r = Math.random();
    if (r < 0.25) D({ title: 'A Car Slows Down', text: ['A dark sedan slows to walking pace beside you. The window slides down. A man, maybe forty, friendly smile. "You okay, kiddo? Kinda late to be out. Need a ride somewhere?"'],
      choices: [{ t: '"No thanks." Keep walking toward the lights.', cls: 'safe', fn: () => { SH.st('stress', 10); SH.UI.log('He follows for half a block. Then speeds off. You realize you were holding your breath.', 'warn'); } }, { t: 'Get in. It\'s cold and it\'s far.', cls: 'hot', fn: () => SH.Endings.dex(true) }] });
    else if (r < 0.45) { if (G.heat > 30) D({ title: 'Headlights', text: ['A police cruiser turns onto the street, slow, spotlight sweeping the sidewalks.'], choices: [{ t: 'Duck behind a hedge', fn: () => { SH.st('stress', 12); if (U.chance(G.heat / 250)) SH.Endings.found('police'); else SH.UI.log('It rolls past. You stay crouched in the wet leaves for ten minutes.', 'warn'); } }, { t: 'Wave it down', cls: 'safe', fn: () => SH.Endings.found('self') }] });
      else SH.UI.log('A cruiser passes without slowing. Nobody is looking for you yet.', 'sys'); }
    else if (r < 0.6) { SH.st('mood', 6); SH.UI.log('A skinny orange cat follows you for three blocks, chirping. When you crouch, it headbutts your hand. For one minute you are not alone.', 'good'); }
    else if (r < 0.75 && (SH.wd() === 1 || SH.wd() === 3)) D({ title: 'The Soup Van', text: ['A white van with "ST. BRIGID\'S OUTREACH" painted on the side is parked by the corner. A volunteer with a gray braid is handing out sandwiches and hot chocolate.', '"Hi, love. Take two. ...You\'re awfully young. Do you have somewhere to sleep tonight?"'],
      choices: [{ t: 'Take the food and a card', cls: 'safe', fn: () => { SH.st('full', 25); SH.st('warmth', 10); SH.flag('knowsHarbor'); SH.UI.revealHarbor(); SH.UI.log('She presses a card into your hand: Harbor House, 212 Wharf St. "They\'re good people. Tell them Bev sent you."', 'good'); } }, { t: 'Take the food and go', fn: () => SH.st('full', 25) }] });
    else if (r < 0.88) D({ title: 'Older Kids', text: ['Three older teenagers on the steps of a closed laundromat. One stands up. "Nice backpack. What\'s in it?"'],
      choices: [{ t: 'Keep walking, fast', fn: () => { if (U.chance(0.5)) { SH.UI.log('They laugh but don\'t follow.', 'sys'); } else { const i = U.pick(G.bag.filter((x) => !['phone', 'key', 'buspass', 'hoodie'].includes(x))); if (i) { SH.rmBag(i); SH.UI.log('One of them yanks your bag and runs off with your ' + SH.ITEMS[i].n + '.', 'bad'); } SH.st('stress', 12); } } }, { t: 'Give them your snacks', fn: () => { SH.foodInBag().forEach((i) => SH.rmBag(i)); SH.UI.log('They take your food and leave you alone. You\'re hungry and humiliated, but whole.', 'warn'); SH.st('mood', -5); } }] });
    else { if (SH.raining()) { G.s.warmth = Math.max(0, G.s.warmth - (SH.has('umbrella') ? 4 : 15)); SH.UI.log('The rain comes down sideways. ' + (SH.has('umbrella') ? 'Your umbrella flips inside out but mostly holds.' : 'You\'re soaked to the skin in a minute.'), 'bad'); } else SH.UI.log('The streetlights buzz. Every shadow is a person until it isn\'t.', 'sys'); }
  };

  /* ---------- pickups ---------- */
  R.grandmaComing = function () { const G = SH.G; if (G.pickup) return; G.pickup = { by: 'grandma', at: G.t + 170 }; SH.UI.log('Grandma Rose is driving through the night from Cedar Falls. About 3 hours. Stay somewhere warm and public.', 'good'); };
  R.momComing = function () { const G = SH.G; if (G.pickup && G.pickup.by === 'mom') return; G.pickup = { by: 'mom', at: G.t + 25, loc: G.flags.toldMomWhere }; SH.UI.log('Mom is on her way.', 'good'); };
  R.harborPickup = function () { const G = SH.G; if (G.pickup) return; G.pickup = { by: 'harbor', at: G.t + 50 }; SH.UI.log('A Harbor House outreach worker is coming to meet you.', 'good'); };
  R.doPickup = function (p) {
    if (p.by === 'grandma') SH.Endings.grandma('pickup');
    else if (p.by === 'mom') SH.Endings.foundMom('told');
    else SH.Endings.harbor('outreach');
  };
  R.dexMeet = function () {
    const G = SH.G; G.dexMeetAt = G.t + 30; SH.Phone.push('dex', 'dex', 'ok. quikmart parking lot, 30 min. silver car. dont tell anyone. delete this 🤫');
    setTimeout(() => SH.UI.toast('PIP: "Silver car. Parking lot. \'Delete this.\' I am begging you to read that back."'), 3500);
  };

  /* ---------- bus ---------- */
  R.DEPARTS = [7 + 10 / 60, 13 + 40 / 60, 19 + 20 / 60];
  R.nextBus = function () { const h = SH.hour(); const n = R.DEPARTS.find((x) => x > h + 0.05); return n; };
  R.buyTicket = function () {
    SH.Talk.open('agent', { first: 'Next! Where to?', turnsMax: 6, noLeave: false, onEnd: (c) => {
      const G = SH.G;
      if (c.result === 'sold') { if (G.money < 28) { SH.UI.log('"$28, hon." You don\'t have $28. Your face goes hot.', 'bad'); return; } SH.money(-28); G.tx.push({ t: G.t, d: 'Greyline → Cedar Falls', a: -28 }); SH.addBag('ticket', true); SH.UI.log('You have a ticket to Cedar Falls. Departures: 7:10 AM, 1:40 PM, 7:20 PM.', 'good'); }
      else if (c.result === 'callGrandma' && G.phase === 'home') { SH.flag('grandmaKnows'); SH.rel('grandma', 10); SH.UI.log('The agent lets you use the desk phone. Grandma picks up on the second ring. You don\'t say much, but she hears it anyway. "You call me. Any hour. You hear me, sweet pea? Any hour."', 'good'); }
      else if (c.result === 'callGrandma') { if (SH.f('knowsGrandmaNum')) SH.Endings.grandma('agent'); }
      else if (c.result === 'help' && G.phase === 'home') { SH.flag('safelineCard'); SH.addBag('safeline', true); SH.UI.log('The agent slides a little blue card under the glass: NATIONAL RUNAWAY SAFELINE, 1-800-RUNAWAY. "For whenever. Or never. Keep it anyway."', 'good'); }
      else if (c.result === 'help') SH.Endings.found('agent');
      else if (c.result === 'minor') { G.heat = Math.min(100, G.heat + 10); SH.UI.log('The agent picks up the desk phone as you walk away. You don\'t hear who she calls.', 'warn'); }
    } });
  };
  R.board = function () {
    const G = SH.G; SH.rmBag('ticket');
    D({ title: 'Bay 3', text: ['The bus hisses. You find a window seat near the back and press your forehead to the cold glass. Harlow slides away: the mall, the river, the bridge, the underpass.', 'Somewhere back there is your house, your mom, your sister. You watch until it\'s gone.'],
      choices: [{ t: 'Ride (about 3 hours)', fn: () => { if (G.heat > 55 && U.chance(0.45)) { SH.advance(40, { interrupt: false }); SH.Endings.found('bus'); return; } SH.advance(180, { sleep: true, quality: 0.6, interrupt: false }); if (!SH.f('grandmaAddr') && !SH.has('photo')) { SH.Endings.found('cedarLost'); return; } SH.Endings.grandma('bus'); } }] });
  };
})(window.SH);
