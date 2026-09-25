/* SMALL HOURS — side stories. Each run the Story director picks 3–4 and schedules them.
   Beat format: { off: days after the rolled day, h: [from, to], c: condition, run, interrupt } */
(function (SH) {
  const D = (o) => SH.UI.dialog(o);
  const log = (t, c) => SH.UI.log(t, c || 'sys');
  const home = () => SH.G.phase === 'home' && SH.G.loc === 'home';
  const atSchool = () => SH.G.loc === 'school' && SH.isWeekday() && SH.hour() >= 8 && SH.hour() < 15;
  const ok = () => SH.G.phase === 'home';
  const adv = (m) => SH.advance(m, { interrupt: false });

  Object.assign(SH.ITEMS, {
    ribbon: { n: 'Science fair ribbon', w: 0, i: '🎗️', d: '2nd place. Your name, spelled right, in gold letters.' },
    tooth: { n: 'Lily\'s tooth-fairy note', w: 0, i: '🦷', d: '"Deer toothfary, pleez make Rick nice. Also a unicorn." In purple crayon.' },
    patelkey: { n: 'Mrs. Patel\'s porch key', w: 0, i: '🗝️', d: 'On a ribbon with a tiny brass elephant. "For emergencies, or for Newton."' },
    card70: { n: 'Birthday card envelope', w: 0, i: '✉️', d: 'Addressed in Mom\'s handwriting: Rose Alvarez, 41 Larkspur Lane, Cedar Falls.' },
    catphoto: { n: 'Blurry cat photo', w: 0, i: '🐈', d: 'Proof the cat exists. The cat looks unimpressed.' },
  });

  SH.SUBPLOTS = {
    /* ---------------- 1. Newton goes missing ---------------- */
    newton: { n: 'Newton Is Missing', range: [3, 9], line: 'Mrs. Patel is out on her lawn in her slippers, calling a name.', beats: [
      { off: 0, h: [15.5, 19], c: () => home() || SH.G.loc === 'patel', run: () => D({ title: 'Newton Is Missing', who: 'patel', text: ['Mrs. Patel is at your door, still in her gardening gloves. "Newton slipped his leash at the park. Forty minutes ago. He\'s fourteen. He doesn\'t see well anymore."', 'Her voice is steady. Her hands aren\'t.'],
        choices: [{ t: 'Help search the park (≈1.5 h)', cls: 'safe', fn: () => { adv(90); SH.G.loc = 'park';           if (Math.random() < 0.75) { SH.rel('patel', 18); SH.st('mood', 14); SH.money(10); SH.G.tx.push({ t: SH.G.t, d: 'Reward from Mrs. Patel', a: 10 }); SH.flag('foundNewton');
            log('You find him under the skate-park bleachers, shivering, very pleased with himself. Mrs. Patel cries a little, then pretends it\'s allergies. She presses a ten into your hand and won\'t take it back.', 'good'); }
          else { SH.rel('patel', 10); SH.st('mood', -4); log('You search until the streetlights come on. No Newton. Mrs. Patel squeezes your shoulder: "You looked. That matters." (He turns up the next morning on the Hendersons\' porch, eating their cat\'s food.)', 'sys'); } } },
        { t: '"Sorry, I have homework."', fn: () => { SH.rel('patel', -4); log('"Of course, dear." She goes down the street alone, calling his name.', 'sys'); } }] }) },
      { off: 3, h: [15.5, 20], c: () => home() && SH.G.rel.patel >= 40, interrupt: false, run: () => { SH.G.stash.push('patelkey'); SH.flag('patelKey'); log('There\'s a small package on your windowsill: a key on a ribbon with a brass elephant, and a note in beautiful handwriting. "For emergencies, or for Newton. My kettle is always on. — A. Patel." (Added to your stash.)', 'good'); } },
    ] },

    /* ---------------- 2. Science fair ---------------- */
    science: { n: 'The Science Fair', range: [2, 7], weekday: true, line: 'Science fair partners get assigned today. Please not Tyler. Please not Tyler.', beats: [
      { off: 0, h: [9, 14.5], c: atSchool, run: () => D({ title: 'Lab Partners', text: ['Ms. Greer reads the pairs off a clipboard. You get Maya Chen: color-coded binder, the fastest hand in 7B.', '"I want to test which liquids keep a phone battery coolest," she says, before you\'ve even sat down. "You\'re good at... are you good at anything?"'],
        choices: [{ t: '"I can draw the poster."', cls: 'safe', fn: () => { SH.flag('sciPartner'); SH.st('mood', 5); log('She squints at the dragon in the margin of your notebook. "Okay. Yes. That\'s acceptable." From Maya, that\'s a medal.', 'good'); } },
          { t: '"I\'m good at not caring."', fn: () => { SH.flag('sciPartner'); SH.flag('sciLazy'); log('"Great. I\'ll do everything then." She will. She\'ll also tell Ms. Greer.', 'sys'); } }] }) },
      { off: 2, h: [15.2, 17.5], c: () => SH.f('sciPartner') && !SH.f('sciLazy') && (SH.G.loc === 'school' || SH.G.loc === 'library' || home()), run: () => D({ title: 'The Project', text: ['Maya texts: "LIBRARY. NOW. The ice test has to run for 90 minutes."'],
        choices: [{ t: 'Go work on it (≈2 h)', cls: 'safe', fn: () => { adv(120); SH.G.loc = 'library'; SH.flag('sciWorked'); SH.G.grades = Math.min(100, SH.G.grades + 6); SH.st('stress', -8); SH.st('mood', 8); log('Two hours of timers and thermometers and Maya saying "no, LEGIBLY." It\'s the most normal you\'ve felt in weeks. She laughs at one of your jokes, then looks annoyed about it.', 'good'); } },
          { t: '"Can\'t tonight."', fn: () => { SH.flag('sciLazy'); } }] }) },
      { off: 5, h: [9, 14.5], c: atSchool, run: () => { if (SH.f('sciWorked')) { SH.G.stash.push('ribbon'); SH.st('mood', 18); SH.rel('okafor', 5); SH.G.grades = Math.min(100, SH.G.grades + 5); D({ title: 'Second Place', text: ['The judges stop at your poster for a long time. Your dragon is holding a thermometer.', 'Second place. Maya shakes your hand like a businessman. Ms. Okafor, walking past, gives you two thumbs up and mouths "I KNEW IT."', 'You want to show someone at home. You imagine the ribbon on the fridge, then you imagine Rick seeing it, and you put it in your backpack.'], choices: [{ t: 'Keep it', fn: () => {} }] }); } else log('The science fair is today. Maya presents alone. She doesn\'t look at you.', 'bad'); } },
    ] },

    /* ---------------- 3. The stray cat ---------------- */
    stray: { n: 'The Stray', range: [2, 8], line: 'There was a cat on the fence this morning. It looked at you like it knew something.', beats: [
      { off: 0, h: [15, 19.5], c: () => ok() && ['store', 'home', 'park', 'underpass'].includes(SH.G.loc), run: () => D({ title: 'A Cat', text: ['A skinny gray cat with one torn ear follows you half a block, stopping whenever you stop. Like a spy. A bad spy.', 'It sits. It stares. Its ribs show.'],
        choices: ['Pickles', 'Ghost', 'Captain', 'Meatball'].map((nm) => ({ t: `Share your snack. Name it "${nm}".`, fn: () => { SH.G.story.cat = nm; SH.flag('strayCat'); SH.st('full', -4); SH.st('mood', 10); SH.st('stress', -6); SH.G.stash.push('catphoto'); log(`${nm} eats like it's a competition. When you walk away it follows you all the way to Maple Street, then sits on your fence like it pays rent.`, 'good'); } })).concat([{ t: 'Keep walking', fn: () => {} }]) }) },
      { off: 2, h: [21, 23.9], c: () => home() && SH.f('strayCat'), run: () => D({ title: 'The Windowsill', text: [`Tap tap tap on your window. ${SH.G.story.cat}, rain-soaked and furious about it.`, 'Downstairs, Rick is yelling at the TV. You open the window a crack.'],
        choices: [{ t: 'Let the cat in', cls: 'safe', fn: () => { SH.st('stress', -14); SH.st('mood', 12); SH.flag('catInRoom'); log(`${SH.G.story.cat} walks across your homework, sits on your chest, and purrs like a lawnmower. The yelling downstairs sounds farther away. You sleep better than you have all month.`, 'good'); } },
          { t: 'Leave it. If Rick finds out...', fn: () => { SH.st('mood', -4); } }] }) },
    ] },

    /* ---------------- 4. Rick's job interview ---------------- */
    interview: { n: 'Rick\'s Interview', range: [5, 11], line: 'Rick ironed a shirt last night. You didn\'t know he knew how.', beats: [
      { off: 0, h: [17, 21], c: () => home() && SH.rickWhere() === 'home', run: () => D({ title: 'The Tie', who: 'rick', text: ['Rick is in the hallway, fighting a tie in front of the mirror. No beer in sight. He has an interview tomorrow: Delgado Logistics, warehouse shift lead.', 'He catches you watching. For a second he looks embarrassed, which is new. "You know how to do these? Your mom always did it."'],
        choices: [{ t: 'Look it up on your phone and help him', cls: 'safe', fn: () => { SH.rel('rick', 12); SH.flag('helpedTie'); log('YouTube, two tries, one "hold still." He looks at himself in the mirror. "Huh." Then, not looking at you: "Thanks, kid." It\'s the first nice thing he\'s said to you this month. You don\'t know where to put it.', 'good'); } },
          { t: '"No."', fn: () => { SH.rel('rick', -3); log('"Figures." He gets it on the fifth try. It\'s crooked.', 'sys'); } },
          { t: 'Talk to him (type it)', fn: () => SH.Talk.open('rick', { ctx: 'tie', turnsMax: 4 }) }] }) },
      { off: 2, h: [17, 22], c: () => home(), run: () => { const G = SH.G; const got = Math.random() < (SH.f('helpedTie') ? 0.55 : 0.35);
        if (got) { SH.flag('rickSober'); SH.flag('rickJob'); G.pantry = Math.min(100, G.pantry + 30); SH.st('stress', -10); D({ title: 'Callback', who: 'rick', text: ['Rick comes home with groceries. Real ones. Chicken, apples, the cereal you like.', '"Start Monday. Probation, but." He clears his throat. He doesn\'t open a beer. Mom comes home and hugs him in the kitchen, and for one evening the house feels like a house.', 'You don\'t trust it. You want to.'], choices: [{ t: 'Let yourself want it', fn: () => { SH.st('mood', 10); } }] }); }
        else { SH.st('stress', 12); D({ title: 'No Callback', who: 'rick', text: ['The shirt is in a ball on the stairs. The tie is in the trash.', 'Rick started drinking at two. "They wanted someone younger. Someone with a DEGREE. For a WAREHOUSE." The can hits the wall. Not near you. This time.'], choices: [{ t: 'Stay in your room', fn: () => { SH.rel('rick', -4); } }] }); } } },
    ] },

    /* ---------------- 5. Tyler's dad ---------------- */
    tyler: { n: 'Tyler\'s Secret', range: [4, 12], weekday: true, line: 'Tyler wasn\'t at the bus stop today. Nobody noticed but you.', beats: [
      { off: 0, h: [14.8, 16], c: () => SH.G.loc === 'school' || SH.G.loc === 'park', run: () => D({ title: 'The Parking Lot', who: 'tyler', text: ['Behind the gym, a man in a truck is screaming at a kid. The kid is Tyler Brandt.', '"—embarrassing me in front of that coach, you useless—" The truck door slams. Tyler stands there with his face red and wet, and then he sees you seeing him.'],
        choices: [{ t: 'Nod. Walk away. Never mention it.', cls: 'safe', fn: () => { SH.rel('tyler', 30); SH.flag('tylerTruce'); log('The next day, Tyler walks past your table and doesn\'t say anything. The day after that, he tells Brandon to "leave it" when Brandon starts in on you. You\'ll never be friends. But you both know something now.', 'good'); } },
          { t: '"Hey. You okay?"', fn: () => { SH.rel('tyler', 40); SH.flag('tylerTruce'); SH.flag('tylerTalked'); log('"Mind your business." But his voice cracks. Then, quieter: "Don\'t tell anyone." You don\'t. You recognize the look on his face. You see it in the mirror.', 'good'); } },
          { t: 'Take a video', cls: 'danger', fn: () => { SH.rel('tyler', -30); SH.st('mood', -8); log('You get six seconds before you feel sick and delete it. Tyler saw the phone, though. From now on, he\'s worse.', 'bad'); } }] }) },
    ] },

    /* ---------------- 6. Grandma's 70th ---------------- */
    grandma70: { n: 'Grandma\'s 70th', range: [3, 10], line: 'Grandma turns seventy this week. Nobody\'s mentioned it.', beats: [
      { off: 0, h: [17, 21.5], c: () => home() && SH.momWhere() === 'home', run: () => D({ title: 'Seventy', who: 'mom', text: ['Mom is at the kitchen table holding a birthday card she hasn\'t signed. "Your grandmother turns seventy on Thursday."', 'She and Grandma haven\'t really talked since the thing about Rick at Easter. "I don\'t know what to write," Mom says. "Maybe you could draw something?"'],
        choices: [{ t: 'Draw her the lake house (≈45 min)', cls: 'safe', fn: () => { adv(45); SH.flag('grandmaAddr'); SH.G.stash.push('card70'); SH.rel('mom', 8); SH.rel('grandma', 10); SH.st('mood', 8); log('You draw the dock, the canoe, Grandma in her enormous sun hat. Mom looks at it a long time. She writes one line under it, then crosses it out, then writes "We miss you. — D." She gives you the envelope to mail: 41 Larkspur Lane, Cedar Falls. You memorize it without meaning to.', 'good'); } },
          { t: '"Why don\'t you just call her?"', fn: () => { SH.rel('mom', -3); log('"It\'s complicated, baby." It isn\'t, really. You both know it isn\'t.', 'sys'); } }] }) },
      { off: 3, h: [18, 21.5], c: () => SH.Phone.ok() && SH.f('grandmaAddr'), interrupt: false, run: () => { SH.Phone.push('grandma', 'grandma', 'I got a card in the mail today with a drawing of the lake. I have been crying for an hour. Tell your mother thank you. Tell yourself thank you too. Come see me, sweet pea. 41 Larkspur. The porch light is always on.'); SH.rel('grandma', 8); SH.flag('grandmaOffer'); } },
    ] },

    /* ---------------- 7. Tooth fairy ---------------- */
    tooth: { n: 'The Tooth Fairy', range: [3, 12], line: 'Lily\'s front tooth is hanging by a thread. She wiggles it at everyone.', beats: [
      { off: 0, h: [19, 21], c: () => home() && SH.lilyWhere() === 'home', run: () => D({ title: 'The Tooth', who: 'lily', text: ['"IT CAME OUT!" Lily holds up the tiniest tooth in the world. There\'s blood on her chin and pure joy on her face.', 'Then the joy wobbles. "Sam... does the tooth fairy know our address? Mom\'s at work. And Rick said the tooth fairy is for babies."'],
        choices: [{ t: 'Be the tooth fairy ($2 from the shoebox)', cls: 'safe', fn: () => { const G = SH.G; if (G.shoebox >= 2) G.shoebox -= 2; else SH.money(-Math.min(2, G.money)); SH.flag('toothFairy'); SH.rel('lily', 12); SH.st('mood', 10); log('At midnight you creep in and swap the tooth for two dollars and a note in fancy handwriting. Under her pillow there\'s already a note for the tooth fairy. You take it with you.', 'good'); G.stash.push('tooth'); } },
          { t: '"Rick\'s right. It\'s for babies."', fn: () => { SH.rel('lily', -12); SH.st('mood', -8); log('Her face does something you will think about for a long time.', 'bad'); } }] }) },
      { off: 1, h: [7, 8.5], c: () => home() && SH.f('toothFairy'), interrupt: false, run: () => { SH.st('mood', 6); log('Lily comes to breakfast glowing. "She CAME. She has really nice handwriting. She said I was brave." She looks at you sideways. "Also she spells \'brave\' like you do."', 'good'); } },
    ] },

    /* ---------------- 8. Lily's fever ---------------- */
    fever: { n: 'Lily\'s Fever', range: [6, 13], line: 'Lily was coughing all night. You heard it through the wall.', beats: [
      { off: 0, h: [19, 22.5], c: () => home() && SH.momWhere() === 'work', run: () => D({ title: 'Burning Up', who: 'lily', text: ['Lily\'s forehead is hot. Really hot. She\'s shivering under two blankets and whispering that Sheldon is scared.', `Mom is at work. Rick is ${SH.rickDrunk() >= 2 ? 'passed out on the couch' : 'watching TV'}. The kids' medicine is in the bathroom cabinet.`],
        choices: [{ t: 'Call Mom at work', cls: 'safe', fn: () => { SH.rel('mom', 8); SH.flag('feverHandled'); log('Mom picks up on the first ring, in her calm nurse voice: half a dose by weight, read me the box, cool cloth, call me back in an hour. At 11 she calls back just to hear Lily breathing. "You did everything right," she says. "You shouldn\'t have to. But you did."', 'good'); SH.st('stress', 4); adv(60); } },
          { t: 'Read the box and handle it yourself', fn: () => { SH.flag('feverHandled'); SH.rel('lily', 10); SH.st('stress', 10); adv(90); log('You read the dosing chart three times. You set a timer. You sit on the floor next to her bed with a wet washcloth until her breathing slows down. You fall asleep there.', 'sys'); } },
          { t: 'Wake Rick up', fn: () => { if (SH.rickDrunk() >= 2) { SH.st('stress', 12); log('"Figure it out, you\'re not stupid." He rolls over. You figure it out.', 'bad'); SH.flag('feverHandled'); } else { SH.rel('rick', 8); log('Rick actually gets up. He finds the thermometer, reads it twice, and drives to the 24-hour pharmacy in his slippers. When he gets back, he sits on the end of Lily\'s bed for an hour. You didn\'t know he could do that.', 'good'); } } }] }) },
    ] },

    /* ---------------- 9. The library ---------------- */
    library: { n: 'Ms. Ruiz\'s Bulletin Board', range: [2, 9], weekday: true, line: 'You have a library book that\'s two weeks overdue. Maybe that\'s a reason to go.', beats: [
      { off: 0, h: [10, 14.5], c: atSchool, run: () => D({ title: 'The Librarian', text: ['The school librarian, Ms. Ruiz, catches you eating lunch between the shelves. She doesn\'t kick you out.', '"Hiding\'s allowed in here," she says. "Reading is encouraged. Crying is fine, but not on the graphic novels." She slides you a granola bar and goes back to her desk.'],
        choices: [{ t: 'Eat and read', cls: 'safe', fn: () => { SH.st('full', 10); SH.st('stress', -8); SH.flag('ruizFriend'); log('The bulletin board by her desk has a flyer half-covered by a book-fair poster: HARBOR HOUSE: youth drop-in, 212 Wharf St. Food, showers, someone to talk to. No questions you don\'t want to answer. 24/7. You read it twice.', 'good'); SH.flag('knowsHarbor'); SH.UI.revealHarbor && SH.UI.revealHarbor(); } },
          { t: 'Leave', fn: () => {} }] }) },
    ] },

    /* ---------------- 10. Jordan's dare ---------------- */
    dare: { n: 'The Rail Yard Dare', range: [4, 11], line: 'Jordan has a plan. Jordan\'s plans usually involve getting grounded.', beats: [
      { off: 0, h: [15.5, 18.5], c: () => ok() && SH.G.loc !== 'school', run: () => D({ title: 'The Dare', who: 'jordan', text: ['Jordan texts: "old rail yard. tonight. 9pm. marcus says theres a boxcar u can climb into and see the whole river. DARE."', '"u in or r u chicken 🐔"'],
        choices: [{ t: '"I\'m in."', fn: () => { SH.flag('dareYes'); log('"LETS GOOOO." You already feel sick.', 'sys'); } }, { t: '"Pass. Rick would kill me."', cls: 'safe', fn: () => { SH.rel('jordan', -2); log('"ok grandma 👵" A minute later: "jk. prob smart honestly."', 'sys'); } }] }) },
      { off: 0, h: [20.5, 22], c: () => SH.f('dareYes') && ok(), run: () => { const G = SH.G; adv(80); SH.flag('knowsYard'); G.susp = Math.min(100, G.susp + 10);
        if (Math.random() < 0.6) { SH.rel('jordan', 10); SH.st('mood', 12); D({ title: 'Top of the Boxcar', who: 'jordan', text: ['You climb up together. The river is black and gold with streetlights. Jordan yells "WE ARE KINGS" and a dog barks somewhere, and you both lie on the cold metal laughing.', 'On the way out you notice a man sleeping under a tarp by the tracks. And broken glass. And a needle cap. It isn\'t a place you\'d want to be alone.'], choices: [{ t: 'Go home', fn: () => {} }] }); }
        else { SH.st('stress', 14); D({ title: 'Flashlight', text: ['A flashlight beam swings across the gravel. "HEY! That\'s private property!" A security guard, or someone pretending to be one.', 'You run. Jordan runs faster. You tear your hoodie on the fence and get home at 10:40 with your heart punching your ribs.'], choices: [{ t: 'Sneak in the back', fn: () => { SH.susp(10, 'came home late'); } }] }); } } },
    ] },
  };
})(window.SH);
