/* SMALL HOURS — Part 6: the world keeps going.
   Calendar: real months past November (the old date code stopped at Nov). Seasons: late fall → winter; winter nights outside
   hurt more. Halloween (Oct 31): trick-or-treating, and a costume is the best disguise there is, for one night.
   Town reputation (derived, never shown as a number): businesses, helping, being a regular vs. cops keeping an eye on you.
   Health: colds (from cold nights), blisters (from walking), sleep debt. Clinics in towns & cities. Fever can end a run.
   Achievements: saved across playthroughs (localStorage). */
(function (SH) {
  const K = SH.K, A = SH.Atlas; if (!K || !A) return;
  const G = K.G;
  /* ---------- calendar ---------- */
  const MON = [['January', 31], ['February', 28], ['March', 31], ['April', 30], ['May', 31], ['June', 30], ['July', 31], ['August', 31], ['September', 30], ['October', 31], ['November', 30], ['December', 31]];
  const cal = (t) => { let m = 9, dd = SH.START_DATE.day + SH.day(t) - 1; while (dd > MON[m][1]) { dd -= MON[m][1]; m = (m + 1) % 12; } return { m, dd }; };
  SH.dateStr = (t = SH.G.t) => { const c = cal(t); return SH.WEEKDAYS[SH.wd(t)].slice(0, 3) + ', ' + MON[c.m][0].slice(0, 3) + ' ' + c.dd; };
  SH.longDate = (t = SH.G.t) => { const c = cal(t); return SH.WEEKDAYS[SH.wd(t)] + ', ' + MON[c.m][0] + ' ' + c.dd; };
  const season = (t) => { const m = cal(t).m; return m === 11 || m <= 1 ? 'winter' : m <= 4 ? 'spring' : m <= 7 ? 'summer' : 'fall'; };
  const halloween = (t = G().t) => { const c = cal(t); return c.m === 9 && c.dd === 31; };
  const W = SH.World2 = { cal, season, halloween };
  /* ---------- reputation (derived) ---------- */
  W.rep = (p) => { const g = G(), b = (g.biz || {})[p.id], st = (g.street || {})[p.id] || 0, w = (g.watch || {})[p.id] || 0, rk = (g.rk || {})['rk_' + p.id];
    return Math.min(40, b ? b.shifts * 3 : 0) + st / 4 + (rk && rk.done === 'safe' ? 12 : 0) + ((g.lessons && g.lessons.farm === p.id) ? g.lessons.n * 2 : 0) - w * 15; };
  W.repLine = (p) => { const r = W.rep(p), b = (G().biz || {})[p.id]; return r >= 30 ? `In ${p.name}, you're ${b ? `"the ${b.name} kid${K.grp() > 1 ? 's' : ''}"` : '"that nice kid"'}. People wave.` : r >= 12 ? `A few people in ${p.name} know your face, in a good way.` : r < -5 ? `In ${p.name}, people have started to watch you.` : `Nobody in ${p.name} has an opinion about you yet.`; };
  (A.mods = A.mods || []).push((p) => { const r = W.rep(p); return r >= 30 ? 0.8 : r >= 12 ? 0.92 : r < -5 ? 1.25 : 1; });
  const bStop = SH.Police && SH.Police.stop; if (bStop) SH.Police.stop = function (p, ctx, then) { const g0 = G().awayNotice || 0; return bStop.call(this, p, ctx, (c) => { if (c.result === 'watch') { const g = G(); g.watch = g.watch || {}; g.watch[p.id] = (g.watch[p.id] || 0) + 1; } then ? then(c) : K.back(); }); };
  /* ---------- seasons + Halloween ---------- */
  K.daily.push(() => { const g = G(); if (g.phase !== 'run') return; const s = season(g.t); if (s === 'winter' && !g.room && !(g.base && SH.Bases && SH.Bases.fx('warm') >= 2)) { SH.st('warmth', -15); } if (halloween()) SH.UI.log('It\'s Halloween. Every kid in America is out on the street tonight in a disguise. So are you.', 'good'); });
  A.mods.push(() => (halloween() && SH.hour() >= 16 ? 0.35 : 1));
  function trick(p) {
    const g = G(); SH.advance(150, { interrupt: false }); if (g.ended) return; SH.st('full', 35); SH.st('mood', 20); SH.st('stress', -15); K.party().forEach((id) => SH.Group && SH.Group.att(id, 10)); g.flags.trickOrTreat = 1;
    K.D('🎃 Trick-or-treat', [`${K.grp() > 1 ? 'You make costumes out of whatever you have: ' + K.party().map((id) => K.nm(id)).join(' and ') + ' as ' + K.pick(['a ghost (a motel sheet)', 'a mummy (toilet paper)', 'a cat (eyeliner whiskers)']) + ', you as ' : 'You go as '}${K.pick(['"a runaway" (nobody gets it)', 'a vampire with ketchup blood', 'a pumpkin with a trash bag belly'])}.`, `${p.tier === 'village' ? 'Nine houses, every one of them gives full-size bars.' : 'Street after street of porch lights.'} A pillowcase of candy. For two hours you're just a kid on Halloween. Nobody looks twice at you. That's the whole point of Halloween.`], K.ok());
  }
  K.hub((p, ch) => { const h = SH.hour(); if (halloween() && h >= 17 && h < 22 && !G().flags.trickOrTreat) ch.unshift({ t: '🎃 Go trick-or-treating', cls: 'safe', sub: 'Tonight a disguise is normal', fn: () => trick(p) }); });
  /* ---------- health ---------- */
  const hp = () => (G().hp = G().hp || { cold: 0, blist: 0, debt: 0 });
  K.daily.push(() => { const g = G(), h = hp(); if (g.phase !== 'run') return;
    if (g.s.warmth < 30 && !g.room && h.cold < 20 && K.chance(0.35 + (season(g.t) === 'winter' ? 0.2 : 0))) { h.cold = 55; SH.UI.log('You wake up with a scratchy throat and a head full of cotton. A cold.', 'bad'); }
    else if (h.cold > 0) { h.cold = Math.max(0, h.cold + (g.s.warmth < 30 ? 12 : g.room || (g.base && SH.Bases.fx('warm') >= 1) ? -25 : -10) - (SH.has('x_coldmeds') ? 15 : 0)); if (h.cold >= 90) h.fever = (h.fever || 0) + 1; }
    h.blist = Math.max(0, h.blist - (SH.has('x_boots') ? 15 : 10));
    h.debt = g.s.energy < 15 ? h.debt + 1 : Math.max(0, h.debt - 1);
    if (h.cold) { SH.st('energy', -Math.round(h.cold / 5)); SH.st('mood', -4); }
    if ((h.fever || 0) >= 2 || h.debt >= 4) setTimeout(() => SH.EndX.trigger(h.debt >= 4 ? 'exhaust' : 'fever'), 80);
  });
  const bArr = A.arrive; A.arrive = function (to, m) { const r = bArr.apply(this, arguments); const h = hp(); if (m === 'walk') h.blist = Math.min(100, h.blist + (SH.has('x_boots') ? 10 : 25)); if (m === 'bike') h.blist = Math.min(100, h.blist + 6); if (h.blist >= 60) SH.st('energy', -8); return r; };
  W.hpLine = () => { const h = hp(); return [h.cold >= 70 ? 'You feel awful: fever-hot and shivery at the same time.' : h.cold > 0 ? 'You\'ve got a cold. Sniffly, foggy, tired.' : '', h.blist >= 50 ? 'Your feet are a mess of blisters.' : h.blist > 0 ? 'Your heels are sore.' : '', h.debt >= 2 ? 'You haven\'t really slept in days.' : ''].filter(Boolean).join(' ') || 'You feel okay. Tired, but okay.'; };
  function clinic(p) {
    const g = G(), city = p.tier === 'city', cost = city ? 0 : 25;
    K.D(city ? '🏥 Free community clinic' : '🏥 Walk-in clinic', [`${city ? 'A waiting room full of people who can\'t afford a doctor. Nobody asks for insurance.' : 'Plastic chairs, a TV playing the weather, a nurse with kind eyes.'} ${cost ? 'It\'s $25 without insurance.' : ''}`, 'The nurse will ask where your parents are. You should have an answer ready.'], [
      { t: `See the nurse${cost ? ' ($25)' : ''}`, cls: 'safe', fn: () => { if (cost && !K.pay(cost, 'Clinic')) return K.back(); SH.advance(90, { interrupt: false }); const h = hp(), cv = SH.Identity && SH.Identity.name(p); h.cold = 0; h.fever = 0; h.blist = 0; SH.st('mood', 6);
        const sus = !cv && K.chance(0.4); if (sus) g.awayNotice = (g.awayNotice || 0) + 30;
        K.D('The nurse', [`She listens to your chest, looks in your ears, gives you ${K.pick(['a bag of cough drops', 'a paper cup of medicine that tastes like cherries lied to it', 'moleskin for your feet and a lecture about socks'])}.`, sus ? '"And where\'s mom today, sweetheart?" You answer too fast. She writes something down.' : cv ? `"Alright, ${cv}. Rest, fluids, and tell your ${K.pick(['grandma', 'dad', 'mom'])} I said so."` : '"Rest. Fluids. Warm place to sleep." She looks at you a second longer. She doesn\'t ask.'], [{ t: 'Tell her the truth', cls: 'safe', fn: () => SH.Endings.found('self') }, { t: 'Thank her and go', fn: K.back }]); } },
      { t: 'Leave', fn: K.back }]);
  }
  K.hub((p, ch, dark) => { const h = hp(); if (!dark && (p.tier === 'town' || p.tier === 'city' || (p.tier === 'small' && p.services && p.services.clinic)) && (h.cold || h.blist >= 30)) ch.push({ t: '🏥 Clinic', sub: p.tier === 'city' ? 'Free community clinic' : 'Walk-in, $25', fn: () => clinic(p) }); });
  /* ---------- "You & your group": status lines ---------- */
  K.me((p, ch) => ch.unshift({ t: '🩺 How you\'re doing', sub: W.hpLine().slice(0, 60), fn: () => K.D('How you\'re doing', [W.hpLine(), W.repLine(p), `${SH.longDate()}. ${{ fall: 'Late fall. Leaves everywhere.', winter: 'Winter. Nights are dangerous now.', spring: 'Spring. Mud and birds.', summer: 'Summer. Long evenings.' }[season(G().t)]}`], [{ t: 'Back', fn: () => K.meOpen(p) }]) }));
  /* ---------- achievements (persist across runs) ---------- */
  const AK = 'smallhours_ach';
  const ACH = [
    ['farmhand', '🚜 Farmhand', 'Take 5 driving lessons at a farm', (g) => g.lessons && g.lessons.n >= 5], ['kart', '🏎️ Speed Racer', 'Race go-karts', (g) => g.lessons && g.lessons.kart >= 1],
    ['room', '🛏️ Do Not Disturb', 'Get a motel room', (g) => !!g.room && typeof g.room === 'object'], ['haggle', '💸 Haggler', 'Get a motel room below the asking price', (g) => g.room && SH.Motels && g.room.rate < SH.Motels.KIND[g.room.k].rate * 0.85],
    ['fakeid', '🪪 Taylor Swift, Age 18', 'Buy a fake ID', (g) => !!g.fakeId], ['regular', '☕ The Usual', 'Become a regular somewhere', (g) => Object.values(g.street || {}).some((x) => x >= 30)],
    ['note', '📝 A Good Note', 'Help a friend write a note that actually helps', (g) => Object.values(g.pw || {}).some((x) => x.note && x.note.s >= 3)], ['cover', '🎭 Method Actor', 'Keep a cover story in 3 towns', (g) => Object.keys(g.cover || {}).length >= 3],
    ['disguise', '🪞 Stranger in the Mirror', 'Change your look 4 ways', (g) => (g.flags.disguise || 0) >= 4], ['rk', '🧒 Found Family', 'Another runaway joins your group', (g) => (g.rkids || []).length >= 1],
    ['helped', '🚪 Walked Them Home', 'Help a runaway kid reach a safe adult', (g) => (g.helped || 0) >= 1], ['base', '🏕️ Home Base', 'Fully upgrade 5 things at a base', (g) => g.base && g.base.up.length >= 5],
    ['biz', '🍋 Small Business', 'Earn $100 from a group business', (g) => Object.values(g.biz || {}).some((b) => b && b.total >= 100)], ['week', '📅 One Week', 'Stay away 7 days', (g) => g.missingAt && (g.t - g.missingAt) / 1440 >= 7],
    ['month', '🗓️ One Month', 'Stay away 30 days', (g) => g.missingAt && (g.t - g.missingAt) / 1440 >= 30], ['halloween', '🎃 Just a Kid', 'Trick-or-treat while missing', (g) => g.flags.trickOrTreat],
    ['winter', '❄️ First Snow', 'Still out there in December', (g) => g.missingAt && cal(g.t).m === 11], ['group4', '👥 Crew of Four', 'Have a group of four', () => K.grp() >= 4],
    ['comfort', '🫂 Stay', 'Talk a homesick friend through it', (g) => Object.values(g.att || {}).some((x) => x >= 40)], ['lemonrep', '👋 People Wave', 'Earn a good reputation in a town', (g) => g.away && W.rep(A.here()) >= 30],
  ];
  W.ACH = ACH; W.got = () => { try { return JSON.parse(localStorage.getItem(AK) || '[]'); } catch (e) { return []; } };
  W.check = () => { const g = G(); if (!g || !g.flags) return; const got = W.got(); let ch = false; ACH.forEach(([id, n, d, f]) => { if (got.includes(id)) return; let ok = false; try { ok = !!f(g); } catch (e) {} if (ok) { got.push(id); ch = true; SH.UI.toast(`Achievement: ${n}`); } }); if (ch) try { localStorage.setItem(AK, JSON.stringify(got)); } catch (e) {} };
  K.hourly.push(() => W.check());
  K.me((p, ch) => ch.push({ t: '🏆 Achievements', sub: `${W.got().length}/${ACH.length}`, fn: () => { const got = W.got(); K.D('Achievements', ACH.map(([id, n, d]) => `${got.includes(id) ? n : '🔒 ???'}: ${d}`), [{ t: 'Back', fn: () => K.meOpen(p) }]); } }));
})(window.SH);
