/* SMALL HOURS — the railway. Harlow Station on the Northline, the freight yard, and why a twelve-year-old can't just buy a ticket.
   (Real-world basis: on Amtrak-style railroads, children 12 and under may not travel without an adult 18+; 13–15 only under
   strict unaccompanied-minor rules between staffed stations.) */
(function (SH) {
  const U = SH.util, D = (o) => SH.UI.dialog(o), log = (t, c) => SH.UI.log(t, c || 'sys');
  SH.LOC.station = { name: 'Harlow Station', sub: 'Northline Rail · Platforms 1–2', x: 760, y: 300, type: 'station', icon: '🚆', indoor: true, vis: 0.75, bus: true,
    blurb: 'A brick station from 1911 with a clock that\'s right twice a day and a departures board that clicks. Trains to Cedar Falls and the capital.' };
  SH.OPEN.station = (h) => h >= 5 && h < 23.5;
  if (SH.World) SH.World.START_KNOWN.push('station');
  SH.NPCS_META.conductor = { n: 'Conductor', full: 'Northline · Train 41', col: '#3f6fb5', ini: 'C', ph: false };
  SH.NPCS_META.railagent = { n: 'Ticket window', full: 'Harlow Station', col: '#7f8fa8', ini: 'T', ph: false };

  const RL = SH.Rail = {};
  RL.DEPARTS = [6.75, 11.5, 16 + 50 / 60, 21 + 10 / 60]; // to Cedar Falls, ~2h05
  RL.ARRIVES = [9.5, 14.25, 19.5, 23];                  // from Cedar Falls
  RL.next = (list = RL.DEPARTS) => { const h = SH.hour(); return list.find((x) => x > h + 0.02); };
  RL.fmt = (h) => SH.fmt12(Math.floor(SH.G.t / 1440) * 1440 + Math.round(h * 60));

  /* ---------- scene art ---------- */
  if (SH.Scene && SH.Scene.fg) SH.Scene.fg.station = function (x, W, H, fg, lit, dark, time) {
    const cx = W * 0.42; x.fillStyle = fg; x.fillRect(cx - 170, H - 118, 340, 90);
    x.beginPath(); x.moveTo(cx - 185, H - 118); x.lineTo(cx, H - 150); x.lineTo(cx + 185, H - 118); x.fill();
    x.fillStyle = lit ? 'rgba(255,214,150,.75)' : 'rgba(90,110,140,.5)'; for (let i = 0; i < 6; i++) { x.beginPath(); x.roundRect ? x.roundRect(cx - 150 + i * 52, H - 100, 30, 44, [14, 14, 2, 2]) : x.rect(cx - 150 + i * 52, H - 100, 30, 44); x.fill(); }
    x.fillStyle = '#e8e2d0'; x.beginPath(); x.arc(cx, H - 128, 9, 0, 7); x.fill(); x.strokeStyle = '#222'; x.lineWidth = 1.5; x.beginPath(); x.moveTo(cx, H - 128); x.lineTo(cx + 5 * Math.cos(time * 0.2), H - 128 + 5 * Math.sin(time * 0.2)); x.stroke();
    x.fillStyle = dark ? '#262c36' : '#59616e'; x.fillRect(0, H - 28, W, 6); x.fillStyle = dark ? '#4a4f58' : '#8b8f96'; x.fillRect(0, H - 20, W, 2); x.fillRect(0, H - 12, W, 2);
    const n = RL.next(); if (n != null && n - SH.hour() < 0.3) { const tx = (W + 60) - ((time * 40) % (W + 400)); x.fillStyle = '#2d4f8a'; x.fillRect(tx, H - 58, 300, 34); x.fillStyle = lit ? '#ffe6b0' : '#9fb3d6'; for (let i = 0; i < 8; i++) x.fillRect(tx + 12 + i * 36, H - 52, 22, 12); }
  };

  /* ---------- brains ---------- */
  const R = (say, fx, x) => Object.assign({ say, fx: fx || {} }, x || {});
  SH.Brain.railagent = function (an, c) {
    c.mem.n = (c.mem.n || 0) + 1;
    if (an.has('disclose') || an.has('scared') || an.has('run') || an.has('selfharm')) { c.result = 'help'; return R('Okay, sweetheart. Come around the side door, sit in the office with me where it\'s warm. You\'re not in any trouble. I\'m going to call someone who can help.', {}, { end: true }); }
    if (/\b(i'm|i am) (12|twelve|11|eleven|10|ten)\b|\btwelve\b/.test(an.t)) { c.result = 'minor'; return R('Then I can\'t sell you a ticket, honey. Twelve and under ride with an adult — that\'s Northline policy, and it\'s a good one. Is somebody meeting you? Do you want to call them from my phone?', {}); }
    if (c.result === 'minor' && (an.has('grandma') || an.has('yes') || an.has('mom'))) { c.result = 'call'; return R('Here. Desk phone. Take your time.', {}, { end: true }); }
    if (/\b(i'm|i am) (1[3-5]|thirteen|fourteen|fifteen)\b/.test(an.t)) { c.result = 'um'; return R('Thirteen to fifteen can ride alone only with the unaccompanied-minor form, signed by a parent, in person, here. Daytime trains only, staffed stations only. Is your parent with you?', {}); }
    if (/\b(i'm|i am) (1[6-9]|sixteen|seventeen|eighteen)\b/.test(an.t)) { c.mem.sus = (c.mem.sus || 0) + 2; return R('I\'m going to need to see an ID, then. ...No? Mm-hm.', {}); }
    if (an.has('ticket') || an.has('grandma') || /\bcedar\b/.test(an.t)) { c.mem.sus = (c.mem.sus || 0) + 1; return R('Cedar Falls, one way is $22. Who are you traveling with, hon?', {}); }
    if (an.has('money') || /\bhow much\b/.test(an.t)) return R('Twenty-two to Cedar Falls. Forty-one to the capital. Kids half-price — with a grown-up.', {});
    if (an.has('time') || /\bwhen\b|\bnext train\b/.test(an.t)) { const n = RL.next(); return R(n != null ? 'Next one to Cedar Falls is the ' + RL.fmt(n) + '. Platform 2.' : 'Last train\'s gone for tonight, hon. First one\'s 6:45.', {}); }
    if ((c.mem.sus || 0) >= 3 || c.mem.n >= 5) { c.result = 'minor'; return R('Honey, I think you and I both know I can\'t sell you anything. But I can help. Want to use my phone?', {}); }
    return R(U.pick(['Where are you headed?', 'Just you today?', 'You look cold. There\'s a heater by bench four.']), {});
  };
  SH.Brain.conductor = function (an, c) {
    const G = SH.G; c.mem.n = (c.mem.n || 0) + 1;
    if (an.has('selfharm')) { c.result = 'told'; return R('Okay. Then you\'re sitting with me the rest of the way, and I\'m getting you help the second we stop. You matter more than any schedule on this railroad.', {}, { end: true }); }
    if (an.has('disclose') || an.has('scared') || (an.has('sad') && an.honest) || an.has('truth')) { c.result = 'told'; SH.flag('toldConductor'); return R('...Alright. Thank you for telling me. Here\'s what\'s happening: you\'re riding up front with me, you\'re getting a hot chocolate from the café car on me, and at Millbrook there\'ll be people who help kids for a living. Nobody\'s mad at you.', { stress: -10 }, { end: true }); }
    if (an.has('grandma')) { c.mem.gm = 1; return R('Your grandma, huh? Does your grandma know you\'re on my train? What\'s her number? I\'ll call her myself.', {}); }
    if (c.mem.gm && (an.has('yes') || /\d{3}/.test(an.t))) { c.result = 'grandma'; return R('Okay. I\'m calling her from the office. You sit right here where I can see you.', {}, { end: true }); }
    if (an.has('hostile')) { c.result = 'off'; return R('Alright. That\'s enough. Next stop, you\'re getting off with me, and there\'ll be an officer on the platform.', {}, { end: true }); }
    if (an.has('money') || an.has('ticket')) return R('Can\'t sell you a fare on board, kiddo. Twelve and under doesn\'t ride without a grown-up, period.', {});
    if (c.mem.n >= 4) { c.result = 'off'; return R('Okay. I have to radio ahead. That\'s not a punishment — it\'s the rule, and it exists because kids alone on trains get hurt.', {}, { end: true }); }
    return R(U.pick(['Where are your folks, bud?', 'Ticket? ...No ticket. How old are you?', 'You\'re not in trouble. I just need to know who you\'re with.', G.reported ? 'Hey... I\'ve seen your face today. On the alert. You\'re ' + G.name + '.' : 'Where\'d you get on?']), {});
  };

  /* ---------- station actions ---------- */
  RL.ticketWindow = function () {
    SH.Talk.open('railagent', { first: 'Next! Where to, sweetheart?', turnsMax: 6, onEnd: (c) => {
      const G = SH.G;
      if (c.result === 'help' && G.phase === 'run') return SH.Endings.found('railagent');
      if (c.result === 'help') { SH.flag('safelineCard'); SH.addBag('safeline', true); log('She slides a card under the glass with the Runaway Safeline number on it. "For whenever. Or never. Keep it."', 'good'); }
      if (c.result === 'call') RL.callGrandma();
      if (c.result === 'minor' || c.result === 'um') { SH.flag('knowsTrainRule'); if (G.phase === 'run') G.heat = Math.min(100, G.heat + 8); }
    } });
  };
  RL.callGrandma = function () {
    const G = SH.G;
    if (!SH.f('knowsGrandmaNum')) { log('You don\'t know Grandma\'s number by heart. You never needed to. It lives in your phone.', 'warn'); return; }
    if (G.phase === 'home') { SH.flag('grandmaKnows'); SH.rel('grandma', 8); log('Grandma answers on the first ring. "The TRAIN station? Sweet pea, what— no. Listen to me. If you ever need me, you call, and I get on that train and come get you. Any day. Any hour."', 'good'); return; }
    const arr = RL.next(RL.ARRIVES); if (arr == null) { SH.Run.grandmaComing(); return; }
    const wait = Math.round((arr - SH.hour()) * 60) + 150;
    D({ title: 'The Payphone by Platform 1', who: 'grandma', text: ['"Where are you. WHERE. — The station. Harlow Station. Okay. Okay."', '"You go sit by the ticket window, where the lady can see you. You don\'t go outside, you don\'t talk to anybody else. I\'m getting on the next train down, and then you and I are riding back up together. You hear me? Together."'],
      choices: [{ t: 'Wait by the ticket window', cls: 'safe', fn: () => { G.pickup = { by: 'grandma', at: G.t + wait, how: 'train' }; G.flags.grandmaTrain = 1; log('Grandma is coming on the train. About ' + Math.round(wait / 60) + ' hours. The ticket lady brings you a cup of hot water with a tea bag in it without asking.', 'good'); } }] });
  };
  RL.ride = function () {
    const G = SH.G, n = RL.next(); if (n == null) return;
    const w = Math.round((n - SH.hour()) * 60); if (w > 0) SH.advance(w, { interrupt: true }); if (G.ended || SH.UI.modalOpen()) return;
    D({ title: 'Train 41 · Car 3', text: ['The doors hiss. You step on behind a man with a cello case, like you belong with him. The car smells like coffee and wet coats. The platform slides away.', 'Tickets get checked. Everyone knows that. The question is when.'],
      choices: [{ t: 'Window seat, hood up', sub: 'Hope for a tired conductor.', fn: () => RL.check(0.85) }, { t: 'Hide in the restroom', sub: 'Until someone knocks.', fn: () => RL.check(0.6, 'restroom') }, { t: 'Sit across from a family', sub: 'Look like you\'re with them.', fn: () => RL.check(0.72, 'family') }] });
  };
  RL.check = function (p, how) {
    const G = SH.G; SH.st('stress', 8);
    if (G.reported) p = Math.min(0.97, p + G.heat / 300);
    SH.advance(25, { interrupt: false });
    if (U.chance(p)) {
      const intro = how === 'restroom' ? 'Knock knock. "Conductor. Everything okay in there?" You open the door. He\'s older, with reading glasses on a string, and he looks at you the way teachers do when they already know.' : how === 'family' ? 'The mom across from you has been watching you for ten minutes. When the conductor comes, she says quietly, "He\'s not with us. I think he\'s alone." She doesn\'t say it meanly. She says it like she\'s worried.' : 'A hand on the seat back. "Tickets, folks." The conductor is older, with reading glasses on a string. He looks at your empty hands, then at you.';
      D({ title: 'Tickets', who: 'conductor', text: [intro], choices: [{ t: 'Talk to him (type it)', fn: () => SH.Talk.open('conductor', { turnsMax: 6, noLeave: true, first: 'Hey there. No ticket, huh? How old are you, bud?', onEnd: (c) => RL.caught(c.result) }) }] });
      return;
    }
    SH.advance(95, { sleep: true, quality: 0.5, interrupt: false });
    log('Nobody comes. The train rocks you through fields and backyards and a town with one stoplight. You fall asleep against the window and wake up with the conductor calling "Cedar Falls. Ceeedar Falls."', 'sys');
    if (!SH.f('grandmaAddr') && !SH.has('photo')) return SH.Endings.found('cedarLost');
    SH.Endings.grandma('train');
  };
  RL.caught = function (res) {
    const G = SH.G;
    if (res === 'grandma' && SH.f('knowsGrandmaNum')) return SH.Endings.grandma('conductor');
    if (res === 'told') return SH.Endings.show('trainSafe', 'Millbrook', 'Found · and heard', [
      'The conductor sits you in the empty seat across from his, in the car with the little office. He radios ahead in a low voice. The café attendant brings you a hot chocolate with too much whipped cream and says it was "a mistake order."',
      'At Millbrook, two people are waiting on the platform: a transit police officer with her hat in her hands, and a woman from children\'s services with a lanyard and a granola bar. They don\'t grab you. They ask if you\'re hurt, then if you\'re hungry.',
      'You tell them what you told the conductor. Then more. It all goes into a report with a case number — which means, for the first time, what happens in your house exists somewhere outside of it.',
      'Mom gets there at 2 AM. She\'s alone. She holds on to you on a bench under a sign that says MILLBROOK like she\'s afraid the platform will tip over.']);
    if (!SH.f('toldPolice')) G.flags.trainCaught = 1;
    SH.Endings.found('train');
  };
  // freight yard: daytime has a railroad officer, night keeps the old scare
  const baseYard = SH.Run.trainyard;
  SH.Run.trainyard = function () {
    const h = SH.hour();
    if (h >= 7 && h < 18) return D({ title: 'The Rail Yard', text: ['In daylight the yard is loud: a switch engine shoving cars, couplers banging like gunshots, a man in an orange vest walking the rows.', 'An open boxcar at the end of a line. Cardboard inside. Someone else\'s blanket.'],
      choices: [{ t: 'Climb into the boxcar', cls: 'hot', fn: () => D({ title: 'Railroad Police', who: 'officer', text: ['You get one foot on the ladder before a truck skids up in the gravel. RAILROAD POLICE on the door. The officer isn\'t angry. He\'s white-faced.', '"Get down. Slowly. — Kid, those cars move without warning. Twenty tons, no sound until it\'s too late. I pull people out from under these every year and some of them are your age." He sits you in the truck with the heat on and makes a call.'], choices: [{ t: '...', fn: () => SH.Endings.found('yard') }] }) },
        { t: 'Leave', fn: () => { SH.G.loc = 'station'; SH.advance(15, { interrupt: false }); log('You walk the long way around the fence to Harlow Station. Real trains. With seats. And rules.', 'sys'); SH.UI.afterAction(); } }] });
    return baseYard();
  };

  // actions at the station (wrap the action list)
  const baseList = SH.Actions.list;
  SH.Actions.list = function () {
    const out = baseList.apply(this, arguments), G = SH.G, a = out.acts, h = SH.hour();
    if (G.loc !== 'station') return out;
    const act = (label, sub, fn, o) => Object.assign({ label, sub, fn }, o || {});
    const done = () => SH.UI.afterAction();
    if (!SH.isOpen('station')) { a.push(act('The station is locked', 'Opens at 5 AM.', () => {}, { dis: true })); return out; }
    const n = RL.next();
    a.push(act('Read the departures board', n != null ? 'Next to Cedar Falls: ' + RL.fmt(n) : 'No more trains tonight', () => { SH.advance(3, { interrupt: false }); SH.flag('knowsTrain'); log('NORTHLINE — Cedar Falls: 6:45 AM · 11:30 AM · 4:50 PM · 9:10 PM · Capital City: 8:05 AM · 5:40 PM. Under it, a laminated sign: "CHILDREN 12 AND UNDER MUST TRAVEL WITH AN ADULT."', 'sys'); done(); }));
    a.push(act('Go to the ticket window', 'Cedar Falls $22', () => RL.ticketWindow()));
    a.push(act('Watch the trains come in', '20 min', () => { SH.advance(20, { interrupt: true }); SH.st('stress', -6); SH.st('mood', 4); log(U.pick(['A freight train goes through without stopping: a hundred cars, graffiti blurring into one long painting. The whole platform shakes. It feels like being inside a heartbeat.', 'People get off the 11:30. A soldier in uniform. A grandpa who gets tackled by three grandkids. A woman who nobody meets, who stands a second, then walks off alone.', 'You count the cars. Forty-two. You don\'t know why that helps. It helps.']), 'sys'); done(); }));
    if (G.phase === 'run') {
      if (n != null && n - h < 1.25) a.push(act('Slip onto the ' + RL.fmt(n) + ' without a ticket', 'Tickets get checked. Usually.', () => RL.ride(), { cls: 'hot' }));
      if (SH.f('knowsGrandmaNum') && !G.pickup) a.push(act('Call Grandma from the payphone', 'She could come get you on the train', () => RL.callGrandma(), { cls: 'safe' }));
      a.push(act('Sit in the waiting room', 'Warm. Watched.', () => { SH.advance(45, { interrupt: true }); SH.st('warmth', 15); SH.st('energy', 3); if (G.reported && U.chance(0.12 + G.heat / 250)) return SH.Endings.found('security'); log('The heaters tick. A janitor mops around your feet without asking you to move.', 'sys'); done(); }));
    }
    return out;
  };

  // grandma arriving by train
  const baseDo = SH.Run.doPickup;
  SH.Run.doPickup = function (p) { if (p && p.how === 'train') return SH.Endings.grandma('platform'); return baseDo.apply(this, arguments); };
  const baseGm = SH.Endings.grandma;
  SH.Endings.grandma = function (how) {
    const I = { train: ['Cedar Falls. A station the size of a garage and one bench. You walk the address — 41 Larkspur Lane — for forty minutes in the gray light.', 'The yellow house. Too many wind chimes. You knock. The door opens, and Grandma Rose is in her robe, and she makes a sound you will remember forever.'],
      platform: ['The 7:30 from Cedar Falls pulls in with a long sigh. The doors open and Grandma Rose is the first one off, in her church coat and her slippers, because she forgot to change her shoes.', 'She doesn\'t run. She can\'t run. She walks faster than you\'ve ever seen her walk, and the ticket lady comes out from behind the glass to watch.'],
      conductor: ['At the next stop, the conductor walks you to the office and hands you the phone. Grandma is already crying. "I\'m in the car. I\'m in the car right now. You stay with that nice man."', 'She\'s at Millbrook station ninety minutes later, in her coat over her nightgown.'] }[how];
    if (!I) return baseGm.apply(this, arguments);
    SH.Endings.show('grandma', 'Wind Chimes', how === 'train' ? '41 Larkspur Lane · Cedar Falls' : 'Northline · the ride back', I.concat([
      '"Mijo. Mijo. Look at you. You\'re frozen." She wraps her scarf around your neck twice. "There\'s pozole. There is always pozole."',
      'She calls your mom with the door closed. Her voice rises and falls — angry, then crying, then very quiet. "Your mother is coming. Alone. And you\'re staying with me as long as you need. That\'s not a question."',
      'You sleep under the quilt she made when you were born. The wind chimes play all night. For the first time in months, nothing else does.']));
  };
  // found intros for the railway
  const baseFound = SH.Endings.found;
  SH.Endings.found = function (reason) {
    const extra = { train: 'At Millbrook the doors open and a transit officer is already on the platform, looking right at your car.', yard: 'The railroad officer drives you to the station. Officer Lowe is waiting in the lot.', railagent: 'The ticket agent sits with you in the little office. A police officer comes in quietly and takes off her hat.' }[reason];
    if (extra) { const G = SH.G; if (G.ended) return; D({ title: 'Found', who: 'officer', text: [extra, '"Hey. I\'m Officer Lowe. You\'re ' + G.name + ', right? You\'re not in trouble. Running away isn\'t a crime. I just need to make sure you\'re okay."'], choices: [{ t: 'Talk to her (type it)', sub: 'What you say now changes where you sleep tonight.', fn: () => SH.Talk.open('officer', { ctx: 'found', turnsMax: 6, noLeave: true, first: 'So. Want to tell me why you left?', onEnd: () => SH.Endings.foundEnd(reason) }) }] }); return; }
    return baseFound.apply(this, arguments);
  };
})(window.SH);
