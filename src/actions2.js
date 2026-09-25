/* SMALL HOURS — actions part 2: home, school day, computer, packing, items */
(function (SH) {
  const U = SH.util, D = (o) => SH.UI.dialog(o), A = SH.Actions;
  const act = A.act, done = A.done, doTime = A.doTime;
  const log = (t, c) => SH.UI.log(t, c);

  A.home = function (out) {
    const G = SH.G, h = SH.hour(), r = G.room || 'bedroom', a = out.acts;
    out.rooms = ['bedroom', 'kitchen', 'living', 'bathroom'];
    const rickHere = SH.rickWhere() === 'home', momHere = SH.momWhere() === 'home', lilyHere = SH.lilyWhere() === 'home';
    if (r === 'bedroom') {
      const night = h >= 20 || h < 5;
      a.push(act(night ? 'Go to sleep' : 'Take a nap', night ? 'Until morning' : '1 hour', () => A.sleep(night)));
      a.push(act('Do homework', '1 hour · grades ' + Math.round(G.grades), () => { doTime(60); G.grades = Math.min(100, G.grades + 4); SH.st('stress', 2); log(U.pick(['Fractions. Why are there so many fractions.', 'You write a paragraph about the water cycle. It is the best paragraph ever written about the water cycle.', 'You get stuck on problem 7 for 20 minutes, then get it. Tiny victory.']), 'sys'); done(); }));
      if (SH.inStash('sketchbook') || SH.has('sketchbook')) a.push(act('Draw in your sketchbook', '30 min · calms you down', () => { doTime(30); SH.st('stress', -7); SH.st('mood', 4); log(U.pick(['You draw Newton as a knight. He looks noble. He would hate it.', 'You draw the view from your window. Your hand stops shaking halfway through.', 'You draw a door. Then a road. Then you stop.']), 'good'); done(); }));
      if (SH.inStash('console')) a.push(act('Play Skyforge on the console', '1 hour', () => { doTime(60); SH.st('stress', -8); SH.st('mood', 6); SH.Events.dexStep(true); log('One more match. One more. One more.', 'sys'); done(); }));
      a.push(act('Pack / manage backpack', `${SH.bagWeight().toFixed(1)}/${SH.BAG_CAP} weight`, () => A.packing()));
      a.push(act(`Shoebox savings ($${G.shoebox})`, 'Take or stash cash, photos', () => A.shoebox()));
      if (SH.day() >= 2) a.push(act('Leave.', G.flags.runUnlocked ? 'You\'ve had enough.' : 'Run away. Now.', () => SH.Run.prepare(), { cls: 'hot' }));
    }
    if (r === 'kitchen') {
      a.push(act('Eat something', `Pantry: ${G.pantry > 40 ? 'stocked-ish' : G.pantry > 12 ? 'getting low' : 'basically empty'}`, () => { doTime(20); if (G.pantry > 10) { SH.st('full', 35); G.pantry -= 7; G.stats.meals++; log(U.pick(['Cereal for dinner. Again.', 'Microwave mac and cheese. You burn your tongue. Worth it.', 'Pizza rolls. Lava interiors. The classic.', 'A PB&J and the last of the milk.']), 'sys'); } else { SH.st('full', 6); SH.st('mood', -3); log('Ketchup packets, half an onion, and a jar of pickles. You eat four pickles standing up.', 'bad'); } done(); }));
      a.push(act('Make a sandwich for later', 'Goes in your backpack', () => { if (G.pantry < 8) { SH.UI.toast('There\'s no bread.'); return; } doTime(10); G.pantry -= 6; SH.addBag('sandwich', true); SH.susp(3); done(); }));
      a.push(act('Grab snacks for your bag', '2 granola bars · someone might notice', () => { if (G.pantry < 8) { SH.UI.toast('There are no snacks.'); return; } doTime(5); G.pantry -= 5; SH.addBag('granola', true); SH.addBag('granola', true); SH.susp(momHere || rickHere ? 7 : 3, momHere || rickHere ? 'someone saw you taking food' : null); done(); }));
      if (G.choresToday < 2) a.push(act(['Do the dishes', 'Take out the trash', 'Fold the laundry'][(SH.day() + G.choresToday) % 3], '30 min · counts toward allowance', () => { doTime(30, { exert: 1 }); G.choresToday++; G.choresWeek++; SH.rel('mom', 1); if (rickHere) SH.rel('rick', 1); log('Chore done. ' + (rickHere ? 'Rick grunts. That might be approval.' : 'Nobody sees it. It counts anyway.'), 'sys'); done(); }));
      if (momHere) a.push(act('Talk to Mom', 'She\'s at the table with coffee and bills.', () => SH.Talk.open('mom', { first: U.pick(['Hey, baby. Come sit with me a sec.', 'Hi, bug. How was your day? Really.']) }), { cls: 'safe' }));
    }
    if (r === 'living') {
      a.push(act('Watch TV', '1 hour', () => { doTime(60); if (rickHere && SH.rickDrunk() >= 2) { SH.st('stress', 5); log('Rick changes it to sports without asking and turns it up. You last ten minutes.', 'sys'); } else { SH.st('stress', -4); SH.st('mood', 3); log('Cartoons. You\'re too old for them. You watch them anyway.', 'sys'); } done(); }));
      if (rickHere) a.push(act('Talk to Rick', SH.rickDrunk() >= 2 ? 'He\'s had a few. Careful.' : 'He\'s sober-ish.', () => SH.Talk.open('rick', { first: SH.rickDrunk() >= 2 ? 'What. What do you want.' : 'Hm? What.' }), { cls: SH.rickDrunk() >= 2 ? 'hot' : '' }));
      if (momHere) a.push(act('Talk to Mom', '', () => SH.Talk.open('mom', { first: 'Hey, bug.' })));
      if (lilyHere) {
        a.push(act('Play with Lily', '30 min', () => { doTime(30); SH.rel('lily', 5); SH.st('stress', -6); SH.st('mood', 6); log(U.pick(['You play "turtle hospital". Sheldon has a broken shell. You are the surgeon. He pulls through.', 'Lily teaches you a clapping game with 40 rules that change every round. You lose every time.', 'You build a pillow maze. Lily gets stuck on purpose so you have to rescue her.']), 'good'); done(); }));
        a.push(act('Talk to Lily', '', () => SH.Talk.open('lily', { first: U.pick(['sam! guess what', 'hi. sheldon says hi.', 'can you do the turtle voice']) })));
      }
      if (!rickHere && !momHere && !lilyHere) a.push(act('The house is empty', 'The quiet is loud.', () => {}, { dis: true }));
    }
    if (r === 'bathroom') {
      a.push(act('Shower', '15 min', () => { doTime(15); G.s.hyg = 100; SH.st('mood', 3); log('The hot water runs out after six minutes. It always does.', 'sys'); done(); }));
      a.push(act('Look in the mirror', '', () => { const s = G.s; log(`${s.energy < 30 ? 'Purple under your eyes. ' : ''}${s.hyg < 35 ? 'Your hair is a crime scene. ' : ''}${SH.f('bruise') ? 'Four fingerprint bruises on your arm, going yellow at the edges. ' : ''}${s.mood < 30 ? 'You don\'t recognize the face. It looks like someone who stopped expecting things.' : 'Just you. Twelve. Tired. Still here.'}`, 'sys'); done(); }));
      if (SH.inStash('inhaler') && !SH.has('inhaler')) a.push(act('Take your inhaler', `It\'s in the cabinet. ${G.puffs} puffs.`, () => { SH.rmStash('inhaler'); SH.addBag('inhaler', true); log('Inhaler in your pocket. Just in case.', 'sys'); done(); }));
    }
    a.push(act('Wait', '1 hour', () => { doTime(60, { interrupt: true }); done(); }));
    return out;
  };

  A.sleep = function (night) {
    const G = SH.G, h = SH.hour();
    let mins = 60;
    if (night) { const wkd = SH.isWeekday(G.t + (h >= 12 ? 720 : 0)), al = G.alarm || { on: true, h: 6.75 }; const wake = wkd ? (al.on ? al.h : 7.6 + Math.random() * 0.5) : 9; if (wkd && !al.on) G.flags.overslept = SH.day() + (h >= 12 ? 1 : 0); mins = Math.round(((wake - h + 24) % 24) * 60); if (mins < 60) mins = 60; }
    const q = U.clamp(1 - G.s.stress / 220 - (SH.rickDrunk() >= 3 ? 0.15 : 0), 0.35, 1);
    if (night && G.flags.overslept === SH.day() && SH.isWeekday()) { log('No alarm. You wake up to sunlight in the wrong place on the wall. ' + SH.fmt12() + '. The bus is long gone.', 'bad'); SH.st('stress', 6); }
    if (night) log(q < 0.6 ? 'You lie awake a long time, listening to the house.' : 'You fall asleep fast, for once.', 'sys');
    let left = mins;
    while (left > 0) { const step = Math.min(60, left); const intr = SH.advance(step, { sleep: true, quality: q, interrupt: true }); left -= step; if (intr) break; }
    done();
  };

  A.attend = function () {
    const G = SH.G, h = SH.hour();
    if (h > 8.25 && !G.done['tardy' + SH.day()]) { G.done['tardy' + SH.day()] = 1; SH.susp(4, 'tardy'); log('You slide in late. Mr. Dale says "Nice of you to join us" without looking up.', 'warn'); }
    G.done['truant' + SH.day()] = true;
    const mins = Math.max(10, Math.round((15 - h) * 60)), before = h < 12;
    const intr = SH.advance(mins, { interrupt: true });
    if (before && SH.hour() >= 12 && !G.lunchPaid) {
      G.lunchPaid = true;
      if (G.money >= 3) { SH.money(-3); G.tx.push({ t: G.t, d: 'School lunch', a: -3 }); SH.st('full', 30); }
      else if (U.chance(0.5)) { SH.st('full', 15); log('You didn\'t have lunch money. Jordan split his fries with you without saying anything.', 'sys'); }
      else log('No lunch money today. You sit in the library and pretend you\'re not hungry.', 'bad');
    }
    if (!intr) { G.grades = Math.min(100, G.grades + 2); SH.st('stress', 3); log(U.pick(['Math, English, science, social studies. Mr. Dale uses the word "disappointed" twice, both times near you.', 'A sub in science shows a movie about octopuses. Best day of the month.', 'You fall asleep in social studies. Nobody notices, or nobody says anything.', 'Pop quiz in math. You do better than you expected. Still not great.']), 'sys'); }
    done();
  };

  A.computer = function () {
    D({ title: 'Public Computer', text: ['A beige computer from the dawn of time. The mouse is sticky. A sign says: 30 MINUTE LIMIT. BE KIND.'],
      choices: [
        { t: 'Search: "bus to Cedar Falls"', fn: () => { SH.advance(15); SH.flag('knowsBusTimes'); log('Greyline: Harlow to Cedar Falls. 7:10 AM, 1:40 PM, 7:20 PM. $28. "Passengers under 15 must travel with an adult."', 'sys'); done(); } },
        { t: 'Search: "Rose Delgado Cedar Falls"', fn: () => { SH.advance(15); SH.flag('grandmaAddr'); log('A Cedar Falls Library Friends newsletter: "Volunteer of the month: Rose Delgado of Larkspur Lane." 41 Larkspur. You memorize it.', 'good'); done(); } },
        { t: 'Search: "what to do if you can\'t go home"', fn: () => { SH.advance(15); SH.flag('knowsHarbor'); SH.UI.revealHarbor(); log('First local result: Harbor House, 212 Wharf St. Youth drop-in & emergency shelter, ages 11 to 17, open 24/7. Below it, a national hotline number and a line: "You are not in trouble for reaching out."', 'good'); done(); } },
        { t: 'Search: "is it abuse if"', fn: () => { SH.advance(20); SH.st('stress', 4); SH.flag('searchedAbuse'); log('You read for twenty minutes. Yelling. Grabbing. Punching walls near someone. Making someone afraid in their own home. You close the browser. You open it again. It still says the same thing.', 'warn'); done(); } },
        { t: 'Never mind', fn: () => {} }] });
  };

  A.shoplift = function () {
    const G = SH.G; SH.advance(5, { interrupt: false });
    if (U.chance(0.35)) {
      if (G.phase === 'run' && G.heat > 30) { SH.Endings.found('security'); return; }
      SH.st('stress', 15); SH.susp(20, 'QuikMart called home');
      D({ title: 'Caught', text: ['A hand on your shoulder. The clerk, an older guy in a veteran\'s cap. "Put it back, kid." You put it back.', 'He looks at you for a long time. "You hungry?" You don\'t answer. He hands you the granola bar anyway. "Don\'t do that again. Next time I call somebody."'], choices: [{ t: 'Nod', fn: () => { SH.addBag('granola', true); } }] });
    } else { SH.addBag('granola', true); SH.st('stress', 6); SH.st('mood', -3); SH.tag('stole'); log('It\'s in your sleeve before you can think. Your heart doesn\'t slow down for two blocks.', 'warn'); }
    done();
  };

  A.shoebox = function () {
    const G = SH.G;
    D({ title: 'Shoebox', text: [`An old sneaker box under your bed. $${G.shoebox} inside, a birthday card from Grandma, and a photo of you two at the lake. You have $${G.money.toFixed(2)} on you.`],
      choices: [{ t: 'Take all the money', cond: () => G.shoebox > 0, fn: () => { SH.money(G.shoebox); G.shoebox = 0; done(); } },
        { t: 'Put $10 in', cond: () => G.money >= 10, fn: () => { SH.money(-10); G.shoebox += 10; done(); } },
        { t: 'Take the photo of Grandma', cond: () => !SH.has('photo') && !SH.f('tookPhoto'), fn: () => { SH.flag('tookPhoto'); SH.flag('grandmaAddr'); SH.addBag('photo', true); log('On the back, in Grandma\'s loopy handwriting: "Lake Minnow! Come visit, 41 Larkspur Ln, Cedar Falls. xo"', 'sys'); done(); } },
        { t: 'Close it', fn: () => {} }] });
  };

  A.packing = function () {
    const G = SH.G, md = document.querySelector('#modal'); md.classList.remove('hidden');
    const row = (id, where, i) => { const it = SH.ITEMS[id]; return `<div class="invi" data-i="${i}" data-w="${where}"><span>${it.i} ${it.n}</span><small>${it.w ? it.w + ' kg' : ''} ${where === 'stash' ? '→' : '←'}</small></div>`; };
    const draw = () => {
      md.innerHTML = `<div class="mbox" style="width:min(720px,95vw)"><div class="mhead"><h3>Your room & backpack</h3><div style="flex:1"></div><small>Backpack: <b style="color:${SH.bagWeight() > SH.BAG_CAP - 1 ? '#ff9aa5' : '#9fe3b0'}">${SH.bagWeight().toFixed(1)} / ${SH.BAG_CAP} kg</b></small></div>
        <div class="mtext" style="display:grid;grid-template-columns:1fr 1fr;gap:16px;font-family:system-ui;font-size:13px">
          <div><h4 style="margin:0 0 6px;color:var(--muted)">IN YOUR ROOM</h4><div class="inv">${G.stash.map((id, i) => row(id, 'stash', i)).join('') || '<small>Empty</small>'}</div></div>
          <div><h4 style="margin:0 0 6px;color:var(--muted)">BACKPACK</h4><div class="inv">${G.bag.map((id, i) => row(id, 'bag', i)).join('')}</div></div></div>
        <div class="hint">Click to move items. Think: coat, inhaler, charger, food, money, something with Grandma's address. A bulging backpack might get noticed.</div>
        <div class="mchoices"><button class="btn primary" id="packDone">Done</button></div></div>`;
      md.querySelectorAll('.invi').forEach((el) => el.onclick = () => {
        const i = +el.dataset.i;
        if (el.dataset.w === 'stash') { const id = G.stash[i], it = SH.ITEMS[id]; if (SH.bagWeight() + it.w > SH.BAG_CAP + 0.001) { SH.UI.toast('Too heavy. Take something out.'); return; } G.stash.splice(i, 1); G.bag.push(id); if (id === 'coat' || id === 'blanket') SH.susp(2); }
        else { const id = G.bag[i], it = SH.ITEMS[id]; if (it.fixed || id === 'key' || id === 'buspass') { SH.UI.toast('You always keep that on you.'); return; } G.bag.splice(i, 1); G.stash.push(id); }
        draw();
      });
      document.querySelector('#packDone').onclick = () => { md.classList.add('hidden'); md.innerHTML = ''; SH.advance(10, { interrupt: false }); done(); };
    };
    draw();
  };

  A.useItem = function (id) {
    const G = SH.G, it = SH.ITEMS[id];
    if (SH.UI.modalOpen()) return;
    if (it.food) { if (it.reusable) { SH.st('full', 4); SH.st('health', 1); log('You drink some water.', 'sys'); } else { SH.rmBag(id); SH.st('full', it.food); G.stats.meals++; log(`You eat the ${it.n}.`, 'sys'); } SH.advance(5, { interrupt: false }); return done(); }
    if (id === 'clothes') { SH.rmBag(id); SH.st('hyg', 25); SH.st('mood', 4); log('Clean socks. You didn\'t know socks could feel like hope.', 'good'); SH.advance(10, { interrupt: false }); return done(); }
    if (id === 'toothbrush') { if (!SH.locIndoor()) return SH.UI.toast('You need a sink.'); SH.st('hyg', 6); SH.advance(5, { interrupt: false }); return done(); }
    if (id === 'drawing') { if (G.done['draw' + SH.day()]) return SH.UI.toast('SAM IS MY HERO.'); G.done['draw' + SH.day()] = 1; SH.st('mood', 10); SH.st('stress', -6); log('A turtle in a cape. SAM IS MY HERO. You fold it back up very carefully.', 'good'); return done(); }
    if (id === 'photo') { SH.flag('grandmaAddr'); SH.st('mood', 4); log('You and Grandma at Lake Minnow. On the back: 41 Larkspur Ln, Cedar Falls.', 'sys'); return done(); }
    if (id === 'flyer') { SH.flag('knowsHarbor'); SH.UI.revealHarbor(); log('Harbor House. 212 Wharf St. 24/7. "No judgment."', 'sys'); return done(); }
    if (id === 'card') { SH.flag('okaforCard'); log('Ms. Okafor\'s card. Her cell is on the back. You could call her from the Phone app.', 'sys'); return done(); }
    if (id === 'powerbank') { if (G.pbCharge <= 0) return SH.UI.toast('Power bank is empty.'); const give = Math.min(100 - G.phone.bat, G.pbCharge); G.phone.bat += give; G.pbCharge -= give; log('Phone charging off the power bank.', 'sys'); SH.advance(15, { interrupt: false }); return done(); }
    if (id === 'sketchbook') { SH.advance(30, { interrupt: false }); SH.st('stress', -6); SH.st('mood', 3); log('You draw until your hands stop shaking.', 'good'); return done(); }
    if (id === 'inhaler') return SH.UI.toast(`${G.puffs} puffs left. Used automatically during an attack.`);
    if (id === 'ticket') return SH.UI.toast('Greyline to Cedar Falls. 7:10 AM · 1:40 PM · 7:20 PM. Go to the bus depot.');
    SH.UI.toast(it.d);
  };
})(window.SH);
