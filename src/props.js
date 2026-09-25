/* SMALL HOURS — small interactions: sit, inspect, read signs, vending machines, browse, eavesdrop.
   Everything is data: { id, ic, l, when, min, texts|text(fn), fx, cost } keyed by location or home room. */
(function (SH) {
  const U = SH.util;
  const P = SH.PROPS = {
    'home.bedroom': [
      { id: 'b_window', ic: '🪟', l: 'Look out the window', min: 5, texts: () => [SH.isDark() ? 'Maple Street under orange streetlights. Mrs. Patel\'s porch light is on. It\'s always on.' : 'Mr. Henderson\'s sprinkler is running even though it ' + (['rain', 'storm'].includes(SH.cond()) ? 'is literally raining.' : 'rained yesterday.'), 'The window has a crack in the corner shaped like Florida. You\'ve looked at it so many times it\'s basically a friend.', SH.cond() === 'fog' ? 'Fog so thick the end of the street just stops existing. It feels like the world is only this block.' : 'A plane crawls across the sky. Three hundred people going somewhere. You wonder where.'] },
      { id: 'b_poster', ic: '🖼️', l: 'Look at your wall', min: 3, texts: ['A Skyforge poster, a drawing Lily made of you as a knight (you have a sword and a very large head), and a height chart that stops at age nine. Nobody measured after that.', 'A photo strip from the county fair: you and Mom making faces. You\'re maybe eight. She looks so young. She looks happy.'], fx: ['stat.mood +2'] },
      { id: 'b_bed', ic: '🛏️', l: 'Lie on the bed a minute', min: 10, texts: ['You stare at the glow-in-the-dark stars on the ceiling. Most of them don\'t glow anymore. You count the ones that do: eleven.', 'You lie there and listen to the house. The fridge hum. The TV downstairs. Your own heartbeat, slower now.'], fx: ['stat.stress -3', 'stat.energy +2'] },
      { id: 'b_drawer', ic: '🗄️', l: 'Dig through your drawer', min: 5, texts: ['Dead batteries, a Skyforge trading card (holographic, worth nothing), a birthday card from Grandma with a two-dollar bill still inside. You leave it there. It feels wrong to spend.', 'A friendship bracelet Jordan made you in fourth grade. It\'s ugly. You love it.', 'An old phone charger, three pennies, and a note from Mom: "Proud of you, bug." You don\'t remember what for.'] },
    ],
    'home.kitchen': [
      { id: 'k_fridge', ic: '🧊', l: 'Read the fridge', min: 3, texts: () => ['Magnets holding up: a pizza coupon (expired), Lily\'s spelling test (100%, gold star), Mom\'s work schedule with ' + (['DD', 'N'].includes(SH.MOM_SHIFTS[SH.day()]) ? 'today circled twice.' : 'three doubles highlighted this week.'), 'A past-due notice, folded so the red part faces the fridge. Like that makes it not real.', 'A photo of the four of you at a lake last summer. Rick is smiling. You forgot he could do that.'] },
      { id: 'k_mail', ic: '✉️', l: 'Look through the mail', min: 4, when: () => SH.momWhere() !== 'home', texts: ['A credit card offer for Rick. A catalog for Mom. Something from Harlow Electric marked FINAL NOTICE. You put it back exactly how it was.', 'A letter from the school: "Parent-teacher conference request." It\'s already been opened. It\'s already been ignored.', 'A birthday card for Lily from Grandma, three weeks early, because Grandma is scared the mail will be slow. It always is.'] },
      { id: 'k_sit', ic: '🪑', l: 'Sit at the table', min: 8, texts: () => [SH.momWhere() === 'home' ? 'Mom looks up from the bills and slides a cookie across the table without saying anything. You eat it. She goes back to the bills.' : 'The table has a ring from Mom\'s coffee mug burned into it. You trace it with your finger. Around and around.', 'The kitchen clock ticks loud when it\'s quiet. It\'s five minutes fast. It\'s always been five minutes fast. Nobody fixes it.'], fx: ['stat.stress -2'] },
    ],
    'home.living': [
      { id: 'l_couch', ic: '🛋️', l: 'Sit on the couch', min: 10, when: () => SH.rickWhere() !== 'home', texts: ['The couch still has a Rick-shaped dent. You sit on the other end. Old habit, even when he\'s gone.', 'You find eighty cents in the couch cushions and a Lego head. You keep both.'], fx: ['stat.stress -2'] },
      { id: 'l_photos', ic: '📷', l: 'Look at the photos', min: 4, texts: ['Wedding photo: Mom and Rick at the courthouse. She\'s holding daisies. You\'re in the corner of the frame, nine years old, not smiling. You remember that day. You remember not knowing why you weren\'t happy.', 'Your school photos, in a row, kindergarten to sixth. Seventh grade isn\'t up yet. There\'s an empty nail.'] },
    ],
    'home.bathroom': [
      { id: 'w_mirror', ic: '🪞', l: 'Look in the mirror', min: 3, texts: () => [SH.f('bruise') && SH.day() - (SH.G.flags.bruiseDay != null ? SH.G.flags.bruiseDay : SH.day()) < 7 ? 'The bruise on your arm has gone from purple to a sick yellow-green. You pull your sleeve down. Then up. Then down.' : 'You look tired. You look like Mom when she comes home from a double.', 'You practice a face that says "everything\'s fine." It looks like a face that says "everything\'s fine."'] },
    ],
    'home.out': [
      { id: 'o_house', ic: '🏠', l: 'Look at your house', min: 5, texts: () => ['From out here, the house looks normal. Blue light from the TV. ' + (SH.G.reported ? 'Mom\'s car in the driveway at the wrong time of day. The porch light is on. It\'s never on.' : 'The porch light is off.'), 'Your bedroom window is dark. Somebody closed the curtains. Or maybe they\'re waiting for you to come back and open them.'] },
    ],
    school: [
      { id: 's_trophy', ic: '🏆', l: 'Look at the trophy case', min: 4, texts: ['The trophy case: a 1998 state championship in something called "Quiz Bowl," a signed football, and a photo of a principal from the \'70s with a truly incredible mustache.'] },
      { id: 's_board', ic: '📌', l: 'Read the bulletin board', min: 4, texts: () => ['HALLOWEEN DANCE — "UNDER THE SEA" — $5. MATHLETES MEET THURS. A flyer that just says "IS YOUR PHONE SPYING ON YOU?" with no other information.', 'A poster: "Feeling overwhelmed? Ms. Okafor\'s door is always open. Room 204." Someone has drawn a small heart on it. Someone else has drawn a smaller one next to it.', SH.G.phase === 'run' ? 'A new sheet on the board, printed fast: your school photo. "HAVE YOU SEEN ' + SH.G.name.toUpperCase() + '?" The tape is already peeling.' : 'A lost-and-found list: one retainer, a single Croc, a trumpet. Who loses a trumpet?'] },
      { id: 's_vend', ic: '🥤', l: 'Vending machine', sub: '$1.50', cost: 1.5, min: 3, when: () => SH.hour() >= 7 && SH.hour() < 17, texts: ['The machine takes your dollar on the fourth try. The chips get stuck on the spiral. You shake it. A teacher sees. The chips fall. Worth it.', 'Cool Ranch. The machine gives you two bags by accident. Today is a good day, actually.'], fx: ['stat.full +10', 'stat.mood +3'] },
    ],
    store: [
      { id: 'q_browse', ic: '🧃', l: 'Browse the aisles', min: 8, texts: () => ['Aisle 3: fourteen kinds of beef jerky, a single sad bag of lentils, and a rack of phone chargers that all say "FITS ALL" and fit nothing.', 'You read the back of a cereal box. There\'s a maze. You solve it in your head. There\'s no prize.', 'A hot dog has been rotating on the roller grill since, as far as you can tell, the Bush administration.'] },
      { id: 'q_board', ic: '📋', l: 'Read the corkboard', min: 3, texts: () => ['Business cards: a plumber, a psychic, a guy who will "haul anything." A tear-off flyer: "GUITAR LESSONS — CHEAP — I\'M PATIENT."', SH.G.reported ? 'Raj has taped your MISSING flyer next to the register. He looks at it, and then at you, and then very carefully at nothing.' : 'A photo of Raj\'s daughter at her graduation. He\'s put it up next to the lottery tickets. It\'s the best thing in the store.'] },
      { id: 'q_slushie', ic: '🧊', l: 'Slushie machine', sub: '$1.25', cost: 1.25, min: 4, texts: ['You mix every flavor. It turns a color that doesn\'t exist in nature. Brain freeze. Perfect.'], fx: ['stat.mood +5', 'stat.full +3'] },
    ],
    library: [
      { id: 'lib_browse', ic: '📖', l: 'Browse the stacks', min: 20, texts: ['You find a book on how to survive in the wilderness. Chapter one: "Tell someone where you are going." You put it back.', 'A graphic novel about a girl who turns into a wolf when she\'s angry. You read the whole thing sitting on the floor between the shelves. Nobody bothers you.', 'An atlas from 1987. Half the countries are named different things now. The world keeps changing whether you\'re ready or not.'], fx: ['stat.stress -5', 'stat.mood +3'] },
      { id: 'lib_board', ic: '📌', l: 'Read the community board', min: 4, texts: () => ['Toddler story time, tax help for seniors, a knitting circle called "Purls of Wisdom."', SH.f('knowsHarbor') ? 'The Harbor House flyer is still there. Two more tabs have been torn off since you took yours.' : 'A flyer is half-hidden behind a yard-sale notice. Only the edge shows: "…N\'T GO HOME TONIGHT?"'] },
      { id: 'lib_sit', ic: '💺', l: 'Sit by the heater', min: 15, texts: ['The big armchair by the radiator. It smells like old paper and somebody\'s grandpa. You could sleep here. You almost do.'], fx: ['stat.stress -4', 'stat.warmth +8'] },
    ],
    park: [
      { id: 'p_bench', ic: '🪑', l: 'Sit on a bench', min: 15, texts: () => [SH.cond() === 'clear' ? 'Sun on your face. A dad is teaching a kid to ride a bike and keeps pretending to hold on after he lets go.' : 'The bench is wet. You sit anyway. Ducks. Wind. The river going wherever it goes.', 'A plaque on the bench: "FOR MARGARET, WHO LOVED THIS VIEW." You try to see what she saw.'], fx: ['stat.stress -4'] },
      { id: 'p_ducks', ic: '🦆', l: 'Watch the ducks', min: 10, texts: ['One duck is chasing all the other ducks. There\'s always one.', 'A duck walks right up to you, looks you dead in the eye, and honks. You feel judged.'], fx: ['stat.mood +3'] },
    ],
    mall: [
      { id: 'm_window', ic: '🎮', l: 'Window-shop GameSwap', min: 10, texts: ['The Skyforge Deluxe Edition is $69.99. You calculate it in shoebox money. You calculate it in days of food. You stop calculating.', 'The GameSwap guy is playing a demo on the big screen and dying on the first boss over and over.'] },
      { id: 'm_fountain', ic: '⛲', l: 'Look in the fountain', min: 5, texts: ['Pennies. Hundreds of wishes, glinting. You think about fishing some out. You think about what they wished for.', 'Someone threw in a whole dollar coin. Somebody really meant that one.'] },
      { id: 'm_vend', ic: '🥨', l: 'Pretzel stand', sub: '$3', cost: 3, min: 8, texts: ['A salted pretzel, still warm, the size of your face. For five minutes nothing else exists.'], fx: ['stat.full +22', 'stat.mood +4'] },
    ],
    diner: [
      { id: 'd_jukebox', ic: '🎵', l: 'Look at the jukebox', min: 3, texts: ['Every song on it is older than Mom. Somebody has picked "Don\'t Stop Believin\'" four times in a row.'] },
      { id: 'd_menu', ic: '📜', l: 'Read the specials board', min: 3, texts: () => ['TODAY: MEATLOAF. PIE OF THE DAY: ' + U.pick(['LEMON', 'CHERRY', 'PECAN', 'BANANA CREAM']) + '. "COFFEE: BOTTOMLESS. LIKE MY PATIENCE." — Dolores'] },
    ],
    laundromat: [
      { id: 'l_dryer', ic: '🌀', l: 'Watch a dryer spin', min: 15, texts: ['Somebody\'s red sock goes around and around and around. It\'s weirdly calming. You watch the whole cycle.', 'The dryers make the whole place warm. A lady folds towels into perfect squares and hums.'], fx: ['stat.stress -4', 'stat.warmth +6'] },
      { id: 'l_board', ic: '📋', l: 'Read the notices', min: 3, texts: ['"MACHINE 4 EATS QUARTERS." "MACHINE 4 IS FINE, STOP WRITING THIS." "MACHINE 4 ATE MY QUARTERS AGAIN." A war that has lasted years.'] },
    ],
    bus: [
      { id: 'bd_board', ic: '🕐', l: 'Read the departures', min: 3, texts: () => ['CEDAR FALLS 6:10 · CAPITAL CITY 9:45 · MILLBROOK 14:20 — ' + (['rain', 'storm'].includes(SH.cond()) ? 'DELAYED' : 'ON TIME'), 'A sign by the ticket desk: "Passengers under 15 traveling alone require a signed Unaccompanied Minor form." Underlined. Twice.'] },
      { id: 'bd_vend', ic: '🥤', l: 'Vending machine', sub: '$2', cost: 2, min: 3, texts: ['Peanut butter crackers and a Sprite. Dinner of champions.'], fx: ['stat.full +12'] },
    ],
    hospital: [
      { id: 'h_lobby', ic: '💺', l: 'Sit in the lobby', min: 10, texts: ['A man sits holding balloons that say IT\'S A GIRL, crying the happy kind of crying. Across from him, a woman stares at the floor. Hospitals hold both at once.'], fx: ['stat.warmth +5'] },
    ],
    police: [
      { id: 'pd_board', ic: '📌', l: 'Read the board by the door', min: 3, texts: () => ['Community notices, a bike registration form, and a poster: "Kids — if you ever feel unsafe at home, you can talk to us. You won\'t be in trouble."', SH.G.reported ? 'Your face, printed on regular paper, pinned in the middle of the board.' : 'A Neighborhood Watch flyer with a clip-art eye that\'s a little too intense.'] },
    ],
    underpass: [
      { id: 'u_graffiti', ic: '🎨', l: 'Read the graffiti', min: 5, texts: ['"K+M 4EVER." "THE TRUTH IS OUT HERE." A really good painting of a whale. And small, near the ground: "it gets better — J."', 'Someone has written a whole poem on the concrete in Sharpie. It\'s about their mom. You read it twice.'] },
    ],
    trainyard: [
      { id: 't_cars', ic: '🚃', l: 'Look at the old cars', min: 8, texts: ['Rusted boxcars with names from companies that don\'t exist anymore. One has a mural of a sunflower somebody painted with a lot of care.'] },
    ],
    harbor: [
      { id: 'hh_wall', ic: '🖍️', l: 'Look at the wall of notes', min: 5, texts: ['Hundreds of sticky notes from kids who stayed here. "Thank u for the socks." "I called my aunt. she came." "I\'m in college now!! — T." You read until your eyes blur.'], fx: ['stat.mood +8', 'stat.stress -6'] },
    ],
  };

  /* ---------------- overheard lines: the world talking about itself ---------------- */
  const O = SH.OVERHEAR = {
    school: ['"—and then he said pineapple DOES go on pizza and I just walked away." "Valid."', '"If Mr. Dale gives us a pop quiz I will literally transfer schools."', '"My mom said if I get a C I lose my phone. Like, forever."', '"Did you see Tyler\'s dad yelling in the parking lot?" "Everyone saw."'],
    store: ['Raj, on the phone in Gujarati, laughing, then in English: "No, no, tell her I said happy birthday. Tell her Dad loves her."', '"Do you guys have the blue Gatorade?" "We have the red Gatorade." "…" "It\'s basically the same." "It is NOT."'],
    library: ['Two old ladies whispering very loudly about someone named Gloria who "knows what she did."', 'A dad reading to a toddler, doing all the voices. The wolf voice is extremely committed.'],
    park: ['"Babe, the ducks are not plotting against you." "Look at that one. LOOK at it."', 'Two runners: "…and my therapist said, have you considered that you\'re allowed to rest?" "Deep." "I know."'],
    mall: ['"I\'m not saying the Crocs are ugly, I\'m saying they\'re a choice."', 'A mall cop on his radio: "Yeah, the kid with the skateboard again. No. No, he\'s fine. Just letting you know he\'s good at it."'],
    diner: ['Dolores, to the cook: "Table six wants the eggs \'barely scared.\' I don\'t know, Hank, just cook them nervously."', 'A trucker on the phone: "Tell her Daddy\'ll be home Sunday. Yeah. Tell her I got the unicorn one."'],
    laundromat: ['A guy on the phone: "No, I didn\'t shrink it on purpose, Denise."', 'Two women folding: "…seventeen years. And the first time he asked if I was okay was last week." "Better late than never?" "Is it, though?"'],
    bus: ['Over the PA: "Passenger Morrison, please return to the ticket counter. You left your… grandmother. She\'s fine. She\'s waiting."', '"Twelve hours to Capital City." "With a layover?" "With TWO."'],
    hospital: ['A nurse, into a phone: "Dana? She\'s on floor four. Double again. I know. I know."', '"Is he going to be okay?" "He\'s going to be okay."'],
    police: ['An officer at the desk: "Ma\'am, I understand, but the raccoon is not technically trespassing."'],
    underpass: ['Two older guys arguing, kind of friendly, about whether the bridge is 40 years old or 60.'],
    harbor: ['A counselor on the phone: "She\'s safe. She\'s eaten. She\'s asleep. She wanted you to know she\'s sorry. Yes. Tomorrow morning."'],
  };
  const RUN_OVERHEAR = ['"Did you see that flyer? The kid from Lincoln?" "Poor mom." "Poor kid."', '"—twelve years old. Can you imagine? I\'d be out of my mind."', '"They said on the news the kid might be at the bus depot." "Would you even recognize them?"', '"My cousin\'s kid did that once. Came home after two days. Nobody talks about why."'];

  const baseFlag = SH.flag;
  SH.flag = function (k, v) { if (k === 'bruise' && SH.G && !SH.G.flags.bruise) SH.G.flags.bruiseDay = SH.day(); return baseFlag.apply(this, arguments); };
  const Pr = SH.Props = {};
  const stamp = () => (SH.G.world.props = SH.G.world.props || {});
  Pr.key = function () { const G = SH.G; if (G.loc === 'home') return G.phase === 'home' ? 'home.' + (G.room || 'bedroom') : 'home.out'; return G.loc; };
  Pr.list = function () {
    const G = SH.G, L = SH.LOC[G.loc];
    if (G.loc !== 'home' && L.indoor && SH.isOpen && !SH.isOpen(G.loc)) return [];
    const out = (P[Pr.key()] || []).filter((p) => !p.when || p.when()).slice();
    if (O[L.type] || O[G.loc]) { if (!(G.loc === 'home')) out.push({ id: 'listen', ic: '👂', l: 'Listen in', min: 10, listen: true }); }
    return out;
  };
  Pr.use = function (p) {
    const G = SH.G, st = stamp(), rec = (st[p.id] = st[p.id] || { n: 0, last: -1 });
    if (p.cost && G.money < p.cost) { SH.UI.log('You count your money. Not enough. You look at the machine. The machine looks at you.', 'sys'); return; }
    let text;
    if (p.listen) {
      const L = SH.LOC[G.loc]; let pool = (O[G.loc] || O[L.type] || []).slice();
      if (G.phase === 'run' && G.reported) pool = pool.concat(RUN_OVERHEAR, RUN_OVERHEAR);
      if (G.loc === 'school' && SH.Rumor) SH.Rumor.list().forEach((r) => pool.push('"—did you hear? ' + r.text.replace(/^./, (c) => c.toUpperCase()) + '" "No WAY." "That\'s what I heard."'));
      const heardSet = (st.heard = st.heard || []); const fresh = pool.filter((x) => !heardSet.includes(x));
      text = U.pick(fresh.length ? fresh : pool); if (!text) text = 'Nobody\'s saying anything interesting.'; heardSet.push(text); if (heardSet.length > 60) heardSet.shift();
    } else {
      const pool = typeof p.texts === 'function' ? p.texts() : p.texts; let i = U.ri(0, pool.length - 1);
      if (pool.length > 1 && i === rec.last) i = (i + 1) % pool.length; rec.last = i; text = pool[i];
    }
    rec.n++;
    if (p.cost) { SH.money(-p.cost); G.tx.push({ t: G.t, d: p.l, a: -p.cost }); }
    SH.advance(p.min || 5, { interrupt: true });
    SH.UI.log((p.listen ? '👂 ' : '') + SH.Engine.fill(text), 'sys');
    if (p.fx) SH.Engine.effect(p.fx);
    // looking around sometimes surfaces a place you didn't know
    if (p.id === 'u_graffiti' && SH.World) SH.World.discover('trainyard');
    if (p.id === 'l_board' && SH.World) SH.World.discover('underpass');
    SH.UI.afterAction();
  };
})(window.SH);
