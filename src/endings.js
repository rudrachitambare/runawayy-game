/* SMALL HOURS — endings, epilogues, journal, snapshots */
(function (SH) {
  const U = SH.util, D = (o) => SH.UI.dialog(o), f = (k) => SH.f(k);
  const EN = SH.Endings = {};

  /* ---------- snapshots ---------- */
  SH.snaps = {};
  SH.snapshot = function (name) { const s = JSON.stringify(SH.G); SH.snaps[name] = s; try { localStorage.setItem('sh_snap_' + ((SH.G.story && SH.G.story.seed) || 0) + '_' + name, s); } catch (e) {} };
  SH.getSnap = function (name) { if (SH.snaps[name]) return SH.snaps[name]; try { return localStorage.getItem('sh_snap_' + ((SH.G.story && SH.G.story.seed) || 0) + '_' + name); } catch (e) { return null; } };

  /* ---------- journal ---------- */
  SH.Journal = {
    writeDay(d) {
      const G = SH.G; const tags = G.tags.filter((t) => t.d === d).map((t) => t.x); const s = G.s;
      const L = [];
      L.push(s.mood > 60 ? 'Today was okay. Actually okay.' : s.mood > 35 ? 'Today was a day.' : 'Today was bad.');
      const M = { phoneTaken: 'Rick took my phone. I felt like a ghost all night.', burnedTyler: 'I finally said something back to Tyler. People laughed at HIM. I keep replaying it.', fight: 'I hit Tyler. I don\'t even feel bad. I feel something though.',
        okaforTalk: 'Ms. Okafor asked how things were. I almost told her. Maybe I did a little.', bikeSold: 'He sold my bike. Grandma\'s bike. I hate him. I\'m allowed to write that here.',
        skippedPlay: 'I missed Lily\'s play. She said it was okay. She\'s seven and she already lies like me.', grabbed: 'He grabbed me. My arm has his fingers on it. I keep pulling my sleeve down.',
        froze: 'I didn\'t do anything when he screamed at Lily. I just sat there. I\'m a coward.', protectedLily: 'Lily slept in my room again. I told her the turtle knight story. I\'m her fort.',
        cps: 'A lady from Children\'s Services came. I told her the truth. Rick is gone. The house sounds different.', dexReported: 'I blocked dex. My hands were shaking. PIP said I did the right thing. A phone app said that. Weird.',
        bigNight: 'He broke my phone screen. He put his fist in the wall next to my head.', lockedIn: 'I stayed up all night with my back against the door.', phoneDied: 'My phone died. Everything got very quiet.', ranAway: 'I left.' };
      tags.forEach((t) => M[t] && L.push(M[t]));
      if (s.full < 30) L.push('I\'m so hungry.'); if (s.stress > 75) L.push('My chest has felt tight all day.');
      if (SH.day() > 1 && G.phase === 'home' && !tags.length) L.push(U.pick(['Nothing happened, which in this house counts as good.', 'Jordan sent me a video of a raccoon stealing a whole pizza. Best part of the day.', 'Rick fell asleep on the couch at 9. I did my homework in the quiet.', 'Mom texted "love u" from work. I read it like eleven times.']));
      G.journal.push({ date: SH.longDate((d - 1) * 1440 + 60), text: L.join(' ') });
      SH.snapshot('day' + (d + 1));
    },
  };

  /* ---------- epilogue builder ---------- */
  function epilogue(key) {
    const G = SH.G, told = f('toldCounselor') || f('toldPolice') || f('toldMarcus') || f('cpsTruth') || f('toldTanya') || f('momKnows') || f('noteDisclosed');
    const safeKey = ['harbor', 'grandma', 'patel', 'call911', 'foundSafe', 'listened', 'foundMomKnows', 'garageTold'].includes(key);
    const out = [];
    // Rick
    if (f('rickGone') || safeKey || (told && key !== 'dexNo')) out.push(['Rick', f('rickHuman') ? 'Rick moved to his brother\'s. After two months he started going to meetings in a church basement on Tuesdays. He sent you a letter that said "I\'m sorry" four times and "I was wrong" once. You haven\'t decided what to do with it yet. You don\'t have to.' : 'Rick moved out. A family court judge ordered supervised visits with Lily only, and only if he stays sober. So far he has missed two of them.']);
    else out.push(['Rick', 'Rick is still on the couch. Still drinking. Nothing about him changed, because nobody made it change. The house is loud again by Thursday.']);
    // Mom
    out.push(['Mom', f('momKnows') || f('momChoseSam') || safeKey ? 'Mom dropped to four shifts a week and started seeing a counselor at the hospital. Some nights she sits on the edge of your bed and just asks about your day, badly, the way people do when they\'re practicing. It\'s working.' : 'Mom hugged you so hard it hurt. Then she went back to double shifts, because rent. She still doesn\'t know everything. She hasn\'t asked.']);
    // Lily
    out.push(['Lily', G.rel.lily > 70 ? 'Lily drew a new picture: two turtles in capes. The big one is labeled SAM and the small one is labeled ME. They\'re holding hands and there is a very large sun.' : f('ranAway') ? 'While you were gone, Lily slept in your bed every night holding Sheldon. When you got back she didn\'t say anything for an hour. Then she said, "Don\'t do that again." You promised.' : 'Lily is still counting turtles when things get loud. You taught her to count them out loud now, so she knows she isn\'t alone.']);
    // Jordan
    out.push(['Jordan', 'Jordan moved to Portland on the 31st. He texts you every day, mostly skate videos and pictures of weird Portland dogs. ' + (f('jordanKnows') ? 'Every Sunday he asks "u ok? like actually?" and you\'ve started answering honestly.' : 'You never told him everything. Maybe someday.')]);
    // Grandma
    out.push(['Grandma Rose', key === 'grandma' || f('grandmaKnows') ? 'Grandma and Mom are talking again. Carefully. Thanksgiving is at the yellow house with too many wind chimes this year. Grandma made enough pozole for forty people. "In case someone visits."' : 'Grandma still calls every Sunday. She still says "any hour." One day, you might take her up on it.']);
    // Dex
    if (G.flags.dexStage) out.push(['dex_19', f('dexReported') || f('jordanKnowsDex') || key === 'dex' || key === 'dexNo' ? 'dex_19 was not nineteen. He was thirty-one. When police traced his account, they found he had been messaging eleven other kids in three states. Your report was the one that started it.' : 'dex_19 is still out there, still "nineteen," still telling some other kid they\'re mature for their age. You think about that sometimes. You wish you\'d told someone.']);
    // Wren
    if (f('metWren')) out.push(['Wren', key === 'harbor' ? 'Wren showed up at Harbor House four days after you did. "Don\'t make it weird," she said. You made it a little weird. She\'s in the transitional living program now. She sends you book recommendations.' : 'You never saw Wren again. Sometimes you walk past the underpass and look. There\'s a new mural there — a purple-haired girl reading a book. You hope it\'s her.']);
    return out;
  }
  function moments() {
    const G = SH.G, m = [];
    const add = (c, t) => c && m.push(t);
    add(f('toldCounselor'), '🗣 Told Ms. Okafor'); add(f('momKnows'), '💬 Told Mom the truth'); add(f('lilyPlay'), '🐢 Went to Lily\'s play'); add(G.tags.find((t) => t.x === 'protectedLily'), '🛡 Protected Lily');
    add(f('dexReported'), '🚫 Reported dex_19'); add(f('burnedTyler'), '🔥 Out-talked Tyler'); add(f('bruise'), '💜 Stepped in for Lily'); add(f('metWren'), '📖 Met Wren');
    add(f('knowsHarbor'), '🏮 Found Harbor House'); add(f('grandmaKnows'), '🌻 Told Grandma'); add(f('leftNote'), '✉️ Left a note'); add(f('stoleFromMom'), '💵 Took Mom\'s $40'); add(f('patelSafe'), '🐕 Told Mrs. Patel');
    add(G.stats.nightsOut, `🌙 ${G.stats.nightsOut} night${G.stats.nightsOut > 1 ? 's' : ''} outside`); add(G.stats.hoursOut, `⏱ ${G.stats.hoursOut} hours missing`);
    add(G.stats.pipChats, `◉ ${G.stats.pipChats} chats with PIP`); add(G.stats.textsSent, `💬 ${G.stats.textsSent} texts sent`);
    return m;
  }

  function storyCard() {
    const P = SH.G.story; if (!P) return '';
    const T = SH.Story.TRAITS[P.trait], C = SH.Story.CATALYSTS[P.catalyst];
    const chip = (a, b) => `<div class="scard"><small>${a}</small><b>${b}</b></div>`;
    return `<div class="sgrid">${chip('Seed', '#' + P.seed)}${chip('You were', T.n)}${chip('Breaking point', C.n)}${chip('Side stories', P.subplots.map((k) => SH.SUBPLOTS[k].n).join(' · '))}</div>`;
  }
  EN.show = function (key, title, sub, paras) {
    paras = (paras || []).map(SH.nm); title = SH.nm(title); sub = SH.nm(sub);
    const G = SH.G; if (G.ended) return; G.ended = true; G.endKey = key; G.phase = 'end';
    SH.UI.closeMap();
    const md = document.querySelector('#modal'); md.classList.remove('hidden');
    const ep = epilogue(key), mo = moments();
    const snapLeft = SH.getSnap('left'), dayN = SH.day(), snapDay = SH.getSnap('day' + dayN);
    md.innerHTML = `<div class="mbox" style="width:min(760px,95vw)"><div class="mtext">
      <div class="ending"><small style="color:var(--muted);letter-spacing:3px">ENDING</small><h1>${title}</h1><div style="color:var(--muted);font-style:italic">${sub}</div></div>
      <div class="epi">${paras.map((p) => `<p>${p}</p>`).join('')}
      <h4>After</h4>${ep.map(([w, t]) => `<p><b style="font-family:system-ui;font-size:13px;color:var(--amber)">${w}.</b> ${t}</p>`).join('')}
      <h4>Moments</h4><div>${mo.map((x) => `<span class="stamp">${x}</span>`).join('') || '<span class="stamp">—</span>'}</div>
      <h4>This story</h4>${storyCard()}
      <h4>There are other ways this story goes</h4><p style="font-size:13.5px;color:var(--muted)">Every new story reshuffles the breaking point, the side stories, the weather, the timing, even who you are. And there are ${SH.EndX && SH.EndX.total ? SH.EndX.total() + ' endings' + (SH.EndX.seenList ? ` (you've seen ${SH.EndX.seenList().length})` : '') : 'a lot of endings'}. Some depend on who you tell, and exactly what you type when it matters.</p>
      <h4>If any of this is close to home</h4><div class="resources">This is fiction, but these are real, free and confidential:<br>
      🇺🇸 National Runaway Safeline: <b>1-800-RUNAWAY</b> (1-800-786-2929), 1800runaway.org · Crisis: call/text <b>988</b><br>
      🇮🇳 CHILDLINE: <b>1098</b> · Emergency: <b>112</b><br>
      🇬🇧 Runaway Helpline: call/text <b>116 000</b> · Childline: <b>0800 1111</b><br>
      Elsewhere: search "child helpline" + your country, or talk to a teacher, counselor, or relative you trust.</div></div></div>
      <div class="mchoices" style="flex-direction:row;flex-wrap:wrap">
        ${snapLeft && key !== 'listened' && key !== 'quiet' ? '<button class="btn" id="rwLeft">⟲ Rewind to the moment you left</button>' : ''}
        ${snapDay ? `<button class="btn" id="rwDay">⟲ Rewind to start of Day ${dayN}</button>` : ''}
        ${G.story ? `<button class="btn" id="sameSeed">↻ Replay story #${G.story.seed}</button>` : ''}
        <button class="btn primary" id="newG">✦ New story</button></div></div>`;
    const ss = document.querySelector('#sameSeed'); if (ss) ss.onclick = () => { try { localStorage.removeItem('smallhours_save'); localStorage.setItem('sh_nextSeed', String(G.story.seed)); } catch (e) {} location.reload(); };
    const rw = (s) => { SH.G = JSON.parse(s); SH.G.ended = false; if (SH.G.phase === 'end') SH.G.phase = 'home'; md.classList.add('hidden'); SH.Events.Q = []; SH.UI.log('— Rewound. —', 'day'); SH.UI.afterAction(); };
    const a = document.querySelector('#rwLeft'); if (a) a.onclick = () => { const s = SH.getSnap('left'); const g = JSON.parse(s); g.phase = 'home'; SH.G = g; SH.G.ended = false; md.classList.add('hidden'); SH.Events.Q = []; SH.UI.log('— Rewound to the moment before you left. —', 'day'); SH.UI.afterAction(); };
    const b = document.querySelector('#rwDay'); if (b) b.onclick = () => rw(snapDay);
    document.querySelector('#newG').onclick = () => { try { localStorage.removeItem('smallhours_save'); } catch (e) {} location.reload(); };
    try { localStorage.removeItem('smallhours_save'); } catch (e) {}
    SH.Audio.bad && SH.Audio.tone(392, 1.2, 'sine', 0.04); SH.Audio.tone(523, 1.4, 'sine', 0.03, 0.3);
  };

  /* ---------- individual endings ---------- */
  EN.found = function (reason) {
    const G = SH.G; if (G.ended) return;
    const intro = { tracked: 'Your phone. The little blue dot. Location sharing was on the whole time. A cruiser pulls up within twenty minutes.',
      police: 'A cruiser rolls up slow and stops. The door opens. A woman officer gets out, hands visible, voice soft.', post: 'Someone recognized the place from your Chirp post. A cruiser is there in fifteen minutes.',
      security: 'The security guard looks at you, then at his phone, then at you. Your missing poster. He makes a call. A cruiser arrives.', self: 'Officer Lowe comes around from behind the glass and crouches to your eye level.',
      agent: 'The ticket agent sits with you on the bench, one hand on your shoulder, until a police officer arrives. She buys you a hot chocolate from the machine.', bus: 'At the second stop, a police officer climbs aboard and walks down the aisle, looking at faces. She stops at yours.',
      cedarLost: 'Cedar Falls. You get off the bus and realize you don\'t know Grandma\'s address. You walk until you can\'t. A police officer finds you asleep on a bench outside the post office.',
      host: 'Your friend\'s parent hangs up the phone and sits down across from you. "She\'s on her way. So is an officer. Nobody is angry. I promise you, nobody in this kitchen is angry."',
      sheriff: 'There\'s no police station here, just the county sheriff. So it takes forty minutes, but a county sheriff\'s cruiser eventually crunches into the gravel lot, and a deputy in a brown jacket gets out slow.',
      away: 'You stand out. A new kid in a place this size always does. Someone called it in, kindly. A cruiser pulls up beside you.',
      exhausted: 'Too many days of this. Your body is done. When the cruiser pulls up, you don\'t even try to get up.' }[reason] || 'A police cruiser.';
    D({ title: 'Found', who: 'officer', text: [intro, '"Hey. I\'m Officer Lowe. You\'re ' + G.name + ', right? Your mom\'s been really worried. You\'re not in trouble. Running away isn\'t a crime. I just need to make sure you\'re okay."'],
      choices: [{ t: 'Talk to her (type it)', sub: 'What you say now changes where you sleep tonight.', fn: () => (SH.Police && SH.Police.canEscape && SH.Police.canEscape(reason) ? SH.Police.foundTalk(reason) : SH.Talk.open('officer', { ctx: 'found', turnsMax: 6, noLeave: true, first: 'So. Want to tell me why you left?', onEnd: () => EN.foundEnd(reason) })) }] });
  };
  EN.foundEnd = function (reason) {
    const G = SH.G;
    if (f('toldPolice')) return EN.show('foundSafe', 'Someone Wrote It Down', 'Found · and heard', [
      'Officer Lowe doesn\'t drive you home. She drives you to the station, gets you a blanket and a vending-machine burrito, and makes a phone call. At 4 AM a woman from Children\'s Services arrives with a lanyard and a tired, kind face.',
      'You tell her too. It gets easier the second time. Everything you say goes into a report with a case number, and for the first time, what happens in your house exists somewhere outside of it.',
      'You sleep at an emergency foster home for two nights. Then Mom comes, and she\'s alone, and she says "He\'s gone. I made him go." She holds your face in both hands like she\'s checking it\'s really you.']);
    EN.show('foundHome', 'The Ride Home', 'Found · returned', [
      'Officer Lowe drives you home. You watch the town slide by from the back seat, the same streets you walked all night, much shorter by car.',
      'Mom runs down the porch steps in her socks. Rick stands in the doorway with his arms crossed. "You know what you put us through?"',
      'The officer looks at you one more time, like she\'s giving you a last chance to say something. You don\'t. She leaves a card on the kitchen table.',
      G.stats.hoursOut > 24 ? 'That night, Mom sleeps on the floor of your room. Rick doesn\'t speak to you for a week. Nothing is fixed. But you know now what the outside is like, and you know about the card on the table.' : 'Nothing is fixed. But there\'s a card on the kitchen table now, and you know what\'s on it.']);
  };
  EN.foundMom = function (how) {
    const G = SH.G, knows = f('momKnows') || f('noteDisclosed') || f('momChoseSam');
    EN.show(knows ? 'foundMomKnows' : 'foundMom', 'Headlights', how === 'hospital' ? 'St. Brigid\'s · 4 West' : 'Mom came',
      [how === 'hospital' ? 'Carla walks you up to 4 West. Mom is in the break room in her scrubs, staring at her phone, and when she looks up she makes a sound you\'ve never heard a person make.' : 'Headlights sweep across you. The car stops so hard it rocks. Mom is out before the engine\'s off, and then you are inside her coat and she smells like hospital soap and she is shaking harder than you are.',
        knows ? '"He\'s gone," she says into your hair. "He\'s at his brother\'s. I told him if he comes near you I\'m calling the police. I should have done it a year ago. I should have LISTENED."' : '"Why? Why, baby?" You tell her some of it. Not all. She says "we\'ll figure it out" in the voice she uses when she doesn\'t know how.',
        'In the car, she turns the heat all the way up and doesn\'t say anything for a long time. At a red light, she reaches over and holds your hand, and doesn\'t let go when it turns green.']);
  };
  EN.harbor = function (how) {
    const G = SH.G;
    D({ title: 'Harbor House', who: 'marcus', text: [how === 'outreach' ? 'A beat-up van with a lighthouse logo. A tall guy with a beard and a lanyard gets out, holding a thermos. "You must be ' + G.name + '. I\'m Marcus, from Harbor House. Hot cocoa? It\'s the good kind."' : how === 'dolores' ? 'Dolores drives you in her old Buick at 6:05 AM, the radio on low. She walks you up the porch steps and knocks. "Marcus, this one\'s special. Treat ' + G.name + ' right."' : 'A big old Victorian by the river. The porch light is on, like the flyer said. You knock before you can talk yourself out of it. A tall guy with a beard opens the door. "Hey. Come in. It\'s cold. I\'m Marcus."', 'Inside it smells like laundry and pasta. There\'s a couch with a quilt, a shelf of board games missing pieces, a kid about fifteen asleep in an armchair with headphones on.'],
      choices: [{ t: 'Talk to Marcus (type it)', fn: () => SH.Talk.open('marcus', { ctx: 'intake', turnsMax: 6, noLeave: true, first: 'So. First things first — are you hurt anywhere? Then food. Then, if you want, you can tell me what\'s going on.', onEnd: () => EN.harborEnd(how) }) }] });
  };
  EN.harborEnd = function (how) {
    const told = f('toldMarcus');
    EN.show('harbor', 'Porch Light', 'Harbor House · 212 Wharf St', [
      'You sleep fourteen hours in a bed with sheets that smell like someone cared. When you wake up there\'s a toothbrush still in its packaging on the nightstand, and a note: "breakfast is whenever. — M"',
      told ? 'Because you told Marcus the truth about home, Harbor House calls Children\'s Services instead of just calling your house. Ms. Hale from CFS comes on day two. On day four, there\'s a meeting — you, Mom, Marcus, Ms. Hale — in a room with a box of tissues and a bad painting of a sailboat. Rick is not invited.' : 'On day three, as the law says they must, Harbor House calls your mom. She comes that afternoon. Marcus sits in on the conversation, and when Mom starts to say "Rick is going through a lot," Marcus says, gently, "Let\'s hear from Sam first." And she does. She listens.',
      'You stay nine days. You learn to play a card game called Spit. You go to three family sessions. On the last day, Marcus gives you a keychain shaped like a lighthouse. "In case you ever need to find us again. Hope you don\'t. But in case."']);
  };
  EN.grandma = function (how) {
    const G = SH.G;
    const intro = how === 'bus' ? ['Cedar Falls. The bus hisses into a station the size of your kitchen. You walk the address on the back of the photo — 41 Larkspur Lane — for forty minutes in the gray morning.', 'The yellow house. Too many wind chimes. You knock. The door opens, and Grandma Rose is in her robe with a spatula in her hand, and she drops it.']
      : how === 'agent' ? ['The ticket agent dials the number you give her. You hear Grandma\'s voice through the receiver, tiny and loud: "Put my grandbaby on the phone RIGHT NOW."', 'Three hours later, a dented green station wagon with a CEDAR FALLS LIBRARY FRIENDS bumper sticker pulls up outside the depot. Grandma Rose gets out in her slippers.']
        : ['A dented green station wagon pulls into the lot with its high beams on. Grandma Rose gets out in her coat over her nightgown, in slippers, at 4 AM, after driving 140 miles.', 'She doesn\'t say anything. She just opens her arms.'];
    EN.show('grandma', 'Wind Chimes', '41 Larkspur Lane · Cedar Falls', intro.concat([
      '"Mijo. Mijo. Look at you. You\'re frozen. Get inside. There\'s pozole. There is always pozole."',
      'She calls your mom from the kitchen with the door closed. You hear her voice rise and fall — angry, then crying, then very quiet. When she comes out, her eyes are red. "Your mother is coming tomorrow. Alone. And you\'re staying here as long as you need. That\'s not a question, it\'s a fact."',
      'You sleep in the room with the quilt she made when you were born. The wind chimes play all night. For the first time in months, nothing else does.']));
  };
  EN.walkHome = function () {
    const G = SH.G;
    if (!G.discoveredAt) {
      G.phase = 'home'; G.missingAt = null; G.heat = 0; G.loc = 'home'; G.room = 'bedroom'; G.discoverAt = null; SH.flag('secretReturn'); SH.tag('returned');
      SH.UI.log('You slip back in through the same door. The third stair creaks. Nobody wakes up. You lie in bed fully dressed, backpack still on, heart pounding. Nobody will ever know. You\'re not sure if that\'s better or worse.', 'warn');
      SH.UI.afterAction(); return;
    }
    const knows = f('momKnows') || f('noteDisclosed');
    EN.show('walkHome', 'The Long Walk Back', 'You came home on your own', ['You walk up the porch steps yourself. Nobody brought you. That matters, somehow.',
      'The door opens before you knock. Mom. She pulls you in so hard your backpack straps dig into your shoulders. Behind her, a police officer quietly closes her notebook.',
      knows ? 'Rick\'s truck is gone from the driveway. "He\'s not coming back tonight," Mom says. "Or tomorrow. We\'re going to talk. All of us. With someone who knows how."' : 'Rick\'s truck is in the driveway. Your stomach drops. But Mom keeps her arm around you the whole night, and when Rick starts to say something, she says "Not tonight," in a voice you have never heard her use with him.',
      'Lily comes down the stairs in her turtle pajamas, sees you, and bursts into tears. "I KNEW you\'d come back. I told Sheldon."']);
  };
  EN.collapse = function () {
    if (SH.G.phase === 'home') { SH.flag('toldCounselor'); return EN.show('empty', 'Running on Empty', 'Lincoln Middle · nurse\'s office', ['It happens in the hallway between second and third period. The lockers tilt. The floor comes up to meet you.',
      'You wake up on the cot in the nurse\'s office with a juice box in your hand and Ms. Okafor sitting on the next chair. The nurse says words like "malnourished" and "exhausted" and "when did you last eat a real meal?" You can\'t remember.',
      'Ms. Okafor doesn\'t let it go this time. She asks the questions gently, one at a time, and waits for every answer. That afternoon a caseworker calls your mom at work. Mom leaves in the middle of her shift.',
      'Sometimes the body tells the truth before you\'re ready to. It isn\'t the way you would have chosen. But people are looking now.']); }
    EN.show('collapse', 'Cold', 'St. Brigid\'s Hospital · Pediatrics', ['The last thing you remember is the ground being surprisingly warm, which is how you know something is very wrong.',
      'You wake up in a bed with rails. There\'s a warming blanket that hums, an IV in the back of your hand, a monitor beeping your heart. A nurse in teal scrubs checks your chart and says, "Hypothermia, dehydration. You\'re lucky a jogger found you."',
      'The door opens. It\'s Mom — in her own scrubs, from her own floor, three levels up. She\'s been working the whole time you were gone because she didn\'t know what else to do. She sits on the edge of your bed and puts her forehead against yours and doesn\'t say anything at all.',
      'A social worker comes by the next morning. She asks a lot of questions. You\'re too tired to lie, so you don\'t.']);
    SH.flag('toldPolice');
  };
  EN.dex = function (stranger) {
    const G = SH.G, watched = f('dexReported') || f('jordanKnowsDex') || f('toldCounselor');
    const para = stranger ? ['The car is warm. That\'s the first thing. The heater is blasting, and there\'s a gas station air freshener shaped like a pine tree, and the man is talking about how cold it is, how dangerous it is for a kid out here.',
      'Then the locks click. He doesn\'t turn toward the diner. He turns toward the highway. "Where are we going?" "My place. You can warm up." He takes your phone out of your hand. "You won\'t need that."']
      : ['The silver car is idling at the far end of the QuikMart lot. The man inside is not nineteen. He is maybe thirty-five, with a baseball cap pulled low. He smiles. "Hey, you. Get in, it\'s freezing."',
        'You get in. The locks click. He says, "Give me your phone, we don\'t want anyone tracking you, right?" and holds his hand out, and the way he says it is not a question.'];
    const end = watched && !stranger ? ['You never make it out of the parking lot. Two unmarked cars box him in. Doors fly open. Someone is yelling "HANDS! HANDS ON THE WHEEL!" A detective opens your door and says, very gently, "You\'re safe. We\'ve been watching this account since it was reported."']
      : ['At the stoplight on Route 9, you remember everything Wren said, everything PIP flagged. You yank the door handle. It\'s locked — but the window button works. You scream. You scream like you have never screamed in your life, out the window, at a woman pumping gas.',
        'She drops the nozzle and runs toward the car, phone already at her ear. The man swears, unlocks the doors to shove you out, and peels away. The woman wraps her coat around you on the curb until the police come. She read his license plate out loud to the dispatcher. Twice.'];
    EN.show('dex', stranger ? 'The Warm Car' : 'The Silver Car', 'The danger was real', para.concat(end, ['You are okay. Physically, you are okay. But you shake for three days, and for a long time after, you can\'t get into any car without checking the lock.',
      'Officer Lowe tells you, quietly, that you were lucky, and that most kids who get into that car are not. Then she tells you it was never your fault. Grown-ups who hunt for kids who are alone are the ones to blame. Always.']));
    SH.flag('dexReported');
  };
  EN.garage = function () {
    const G = SH.G; SH.advance(Math.max(60, ((7 - SH.hour() + 24) % 24) * 60), { sleep: true, quality: 0.85, interrupt: false });
    D({ title: 'Morning', who: 'tanya', text: ['You wake up to the garage door grinding open and daylight flooding in. Jordan\'s mom is standing there in her bathrobe, holding a coffee mug that says WORLD\'S OKAYEST MOM.', 'She doesn\'t yell. She sets the mug down very carefully.'],
      choices: [{ t: 'Talk to her (type it)', fn: () => SH.Talk.open('tanya', { turnsMax: 4, noLeave: true, first: 'Oh, honey. Your mom has called here four times. Are you okay? What happened?', onEnd: () => EN.show(f('toldTanya') ? 'garageTold' : 'garage', 'Jordan\'s Garage', 'Birch Lane · pancakes', [
        'Mrs. Pike makes pancakes while she makes phone calls. Jordan sits next to you at the counter and shares his syrup without being asked, which from Jordan is basically a love letter.',
        f('toldTanya') ? 'She calls the child welfare hotline first, and your mom second. When your mom arrives, Mrs. Pike takes her onto the porch for twenty minutes. Your mom comes back in with a face like she\'s been slapped awake. "Rick\'s leaving," she says. "Today."' : 'She calls your mom. "It\'s the law, sweetheart, and it\'s also just right." Your mom arrives with Rick in the passenger seat. Mrs. Pike looks at Rick for a long time, and then at you, and quietly writes her cell number on your hand.',
        'Before you leave, Jordan hugs you — an actual hug, not a bro hug — and says "text me every day or I\'m calling ur grandma." He means it.']) }) }] });
  };
  EN.patel = function (fromRun) {
    EN.show('patel', 'Next Door', '16 Maple St · Newton the beagle', [fromRun ? 'You knock on Mrs. Patel\'s back door. It\'s past midnight. The kitchen light comes on before your second knock.' : 'You run. Down the stairs, past Rick, out the front door, across the wet lawn in your socks. You pound on Mrs. Patel\'s door. It opens before your third knock — she was already awake. She heard.',
      'She pulls you inside, locks the door, and puts herself between you and the window. Newton the beagle presses his warm, old body against your legs. "Beta, sit. Tea. And then I am making a phone call, and you are not going to stop me."',
      fromRun ? 'She calls your mother first. Then, while you drink your tea, she calls the child welfare line, and she reads them the notes she has kept — dates, times, what she heard through the wall — in a small notebook for the past year. "I\'m a scientist," she says. "I keep records."' : 'The police arrive in six minutes. They talk to Rick on the porch. They see the hole in the wall. They see your phone. Rick spends the night somewhere else, and a caseworker is at your door by noon.',
      'You sleep on her couch under an afghan, with Newton snoring on your feet. It is the safest you have felt in a year.']);
    SH.flag('patelSafe'); SH.flag('rickGone');
  };
  EN.call911 = function () {
    D({ title: '911', text: ['"911, what is your emergency?" "My stepdad— he\'s drunk, he broke my phone, he punched the wall, he—" Your voice cracks. Lily\'s asleep across the hall.', '"Okay. You did the right thing calling. Are you in a room that locks? Stay on the line with me. Officers are on the way."'],
      choices: [{ t: 'Stay on the line', cls: 'safe', fn: () => EN.show('call911', 'The Call', 'Harlow PD · Children\'s Services', ['You sit with your back against the door, phone pressed to your ear, the dispatcher\'s calm voice telling you about her dog to keep you talking. Blue lights sweep across your ceiling.',
        'They take Rick outside. You hear him shouting, then not. An officer knocks softly: "' + SH.G.name + '? I\'m Officer Lowe. You can open the door."', 'Mom leaves her shift in the middle of the night. She arrives in her scrubs and sees the hole in the wall six inches from your pillow and sits down right on the floor.',
        'A caseworker comes in the morning. Rick is served with an emergency protective order that afternoon. The hole in the wall stays for a while. Eventually, you and Mom patch it together, badly, and paint it blue.']) }] });
    SH.flag('toldPolice'); SH.flag('rickGone');
  };
  EN.stayed = function () {
    const G = SH.G;
    if (f('cpsTruth') || f('rickGone') || (f('momKnows') && f('toldCounselor'))) return EN.show('listened', 'Someone Listened', 'You stayed · and you said it out loud', ['You never ran. Instead, you did the scarier thing: you told the truth to people who could do something about it.',
      'It wasn\'t fast, or clean. There were forms, and a caseworker named Ms. Hale, and a family court date, and one horrible night where Rick came back and banged on the door until the police came. But the house is different now. Quieter. The good kind of quiet.',
      'On the last day of October, you and Lily trick-or-treat as two turtles. Mom takes the night off to walk you around the block. She holds both your hands.']);
    EN.show('quiet', 'The Quiet', 'You stayed', ['Three weeks. You didn\'t run. You didn\'t tell. You just... got through it, the way you always have.',
      'Rick is still on the couch. Mom is still on doubles. Lily still counts turtles. Nothing changed, because nothing was made to change.',
      'But you\'re still here. And there\'s a card in your wallet with a counselor\'s cell number on it, and a Grandma in Cedar Falls who said "any hour," and a turtle drawing on your wall that says SAM IS MY HERO.',
      'Tomorrow is another day. Maybe tomorrow you\'ll say it out loud.']);
  };
})(window.SH);
