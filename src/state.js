/* SMALL HOURS — core state & simulation */
(function (SH) {
  const U = SH.util;

  // ---------- time helpers ----------
  SH.day = (t = SH.G.t) => Math.floor(t / 1440) + 1;
  SH.hour = (t = SH.G.t) => (t % 1440) / 60;
  SH.wd = (t = SH.G.t) => (((SH.day(t) - 1) % 7) + 7) % 7;
  SH.fmt = (t = SH.G.t) => { const m = Math.floor(t % 1440); return U.pad(Math.floor(m / 60)) + ':' + U.pad(m % 60); };
  SH.nm = (s) => (typeof s === 'string' && SH.G && SH.G.name && SH.G.name !== 'Sam') ? s.replace(/\bSam\b/g, SH.G.name).replace(/\bSAM\b/g, SH.G.name.toUpperCase()) : s;
  SH.fmt12 = (t = SH.G.t) => { const m = Math.floor(t % 1440); let h = Math.floor(m / 60); const ap = h >= 12 ? 'PM' : 'AM'; h = h % 12 || 12; return h + ':' + U.pad(m % 60) + ' ' + ap; };
  SH.dateStr = (t = SH.G.t) => {
    const d = SH.day(t); let dd = SH.START_DATE.day + d - 1, mon = 'Oct';
    if (dd > 31) { dd -= 31; mon = 'Nov'; }
    return SH.WEEKDAYS[SH.wd(t)].slice(0, 3) + ', ' + mon + ' ' + dd;
  };
  SH.longDate = (t = SH.G.t) => {
    const d = SH.day(t); let dd = SH.START_DATE.day + d - 1, mon = 'October';
    if (dd > 31) { dd -= 31; mon = 'November'; }
    return SH.WEEKDAYS[SH.wd(t)] + ', ' + mon + ' ' + dd;
  };
  SH.isDark = (h = SH.hour()) => h < 6.9 || h > 18.6;
  SH.isWeekday = (t = SH.G.t) => SH.wd(t) < 5;

  SH.weatherDay = (d = SH.day()) => SH.WEATHER[Math.min(d, SH.WEATHER.length - 1)] || SH.WEATHER[SH.WEATHER.length - 1];
  SH.tempF = (t = SH.G.t) => {
    const d = SH.day(t), h = SH.hour(t);
    const W = SH.weatherDay(d), Wp = SH.weatherDay(Math.max(1, d - 1)), Wn = SH.weatherDay(d + 1);
    let v;
    if (h >= 5 && h <= 15) v = W.lo + (W.hi - W.lo) * (1 - Math.cos(Math.PI * (h - 5) / 10)) / 2;
    else if (h > 15) v = W.hi + (Wn.lo - W.hi) * (1 - Math.cos(Math.PI * (h - 15) / 14)) / 2;
    else v = Wp.hi + (W.lo - Wp.hi) * (1 - Math.cos(Math.PI * (h + 9) / 14)) / 2;
    return Math.round(v);
  };
  SH.cond = (t = SH.G.t) => SH.weatherDay(SH.day(t)).c;
  SH.raining = (t = SH.G.t) => { const c = SH.cond(t); const h = SH.hour(t); return (c === 'rain' && (h > 11 || h < 3)) || c === 'storm'; };
  SH.toC = (f) => Math.round((f - 32) * 5 / 9);

  // ---------- schedules ----------
  SH.momWhere = (t = SH.G.t) => {
    const G = SH.G; if (G.flags.momAtHospitalVigil) return 'work';
    const d = SH.day(t), h = SH.hour(t), s = SH.MOM_SHIFTS[d] || 'E', p = SH.MOM_SHIFTS[d - 1];
    if (p === 'N' && h < 7.5) return 'work';
    if (p === 'N' && h >= 8 && h < 14) return 'asleep';
    if (s === 'N' && h >= 22.5) return 'work';
    if (s === 'D' && h >= 6.5 && h < 15.5) return 'work';
    if (s === 'E' && h >= 14.5 && h < 23.5) return 'work';
    if (s === 'DD' && h >= 6.5 && h < 23.5) return 'work';
    if (h < 6 || h >= 23.75) return 'asleep';
    return 'home';
  };
  SH.rickWhere = (t = SH.G.t) => {
    const G = SH.G; if (G.flags.rickGone) return 'gone';
    const h = SH.hour(t), wd = SH.wd(t);
    const wake = wd >= 5 ? 11 : 10;
    if (h >= 1 && h < wake) return 'asleep';
    if (SH.rickDrunk(t) >= 3 && (h >= 23.5 || h < 1)) return 'asleep';
    if ((wd === 0 || wd === 2 || wd === 4) && h >= 13 && h < 16.5) return 'out';
    return 'home';
  };
  SH.rickDrunk = (t = SH.G.t) => {
    const d = SH.day(t), h = SH.hour(t); let b = SH.RICK_DAY[Math.min(d, SH.RICK_DAY.length - 1)] || 2;
    if (SH.G.flags.rickSober) b = Math.max(0, b - 2);
    if (h < 1) return Math.min(3, b + 1);
    if (h < 15) return 0;
    if (h < 18) return Math.min(1, b);
    if (h < 21) return b;
    return Math.min(3, b + (b > 0 ? 1 : 0));
  };
  SH.lilyWhere = (t = SH.G.t) => {
    const h = SH.hour(t);
    if (SH.isWeekday(t) && h >= 7.75 && h < 15.25) return 'school';
    if (h >= 20 || h < 7) return 'asleep';
    return 'home';
  };
  SH.isOpen = (id, t = SH.G.t) => {
    const f = SH.OPEN[id]; if (!f) return true;
    return f(SH.hour(t), SH.wd(t));
  };

  // ---------- new game ----------
  SH.newGame = function (name, mode, seed) {
    SH.G = {
      v: 3, name: name || 'Sam', mode: mode || 'story', t: 7 * 60, phase: 'home', loc: 'home', room: 'bedroom',
      s: { full: 55, energy: 62, hyg: 55, mood: 38, stress: 48, health: 92, warmth: 80 },
      money: 4, shoebox: 23, grades: 52, pantry: 50, susp: 0, heat: 0,
      missingAt: null, discoveredAt: null, reported: false,
      rel: { mom: 45, rick: -15, lily: 72, jordan: 62, grandma: 50, okafor: 15, dex: 5, wren: 0, dolores: 0, patel: 30, tyler: -40 },
      bag: ['phone', 'key', 'buspass', 'hoodie'],
      stash: ['charger', 'coat', 'blanket', 'water', 'flashlight', 'clothes', 'toothbrush', 'sketchbook', 'umbrella', 'game1', 'game2', 'console'],
      pbCharge: 0,
      phone: { bat: 71, share: true, airplane: false, low: false, cracked: false, confiscated: false },
      flags: { hasBike: true, knowsGrandmaNum: true },
      threads: {}, unread: {}, feed: [], journal: [], tags: [], log: [],
      done: {}, cool: {}, shownDay: 0, choresToday: 0, choresWeek: 0, lunchPaid: false, ateToday: 0,
      stats: { hoursOut: 0, nightsOut: 0, meals: 0, walked: 0, textsSent: 0, pipChats: 0 },
      convMem: {}, redFlags: [], lastSleepDay: 0, missedSchool: 0,
    };
    SH.Phone && SH.Phone.initThreads();
    SH.Story && SH.Story.init(seed);
  };

  // ---------- stat helpers ----------
  SH.st = (k, d) => { const G = SH.G; G.s[k] = U.clamp(G.s[k] + d, 0, 100); };
  SH.rel = (k, d) => { const G = SH.G; G.rel[k] = U.clamp((G.rel[k] || 0) + d, -100, 100); };
  SH.flag = (k, v = true) => { SH.G.flags[k] = v; };
  SH.f = (k) => !!SH.G.flags[k];
  SH.tag = (x) => { const G = SH.G; G.tags.push({ d: SH.day(), x }); };
  SH.susp = (d, why) => {
    const G = SH.G; if (G.phase !== 'home') return;
    G.susp = U.clamp(G.susp + d, 0, 100);
    if (d >= 6 && why) SH.UI && SH.UI.toast('👀 ' + (SH.SUSP_LINE ? SH.SUSP_LINE(why) : why));
  };
  SH.money = (d) => { SH.G.money = Math.max(0, Math.round((SH.G.money + d) * 100) / 100); };

  // ---------- inventory ----------
  SH.has = (id) => SH.G.bag.includes(id);
  SH.count = (id) => SH.G.bag.filter((x) => x === id).length;
  SH.inStash = (id) => SH.G.stash.includes(id);
  SH.bagWeight = () => SH.G.bag.reduce((a, id) => a + (SH.ITEMS[id] ? SH.ITEMS[id].w : 0), 0);
  SH.addBag = (id, force) => {
    const it = SH.ITEMS[id];
    if (!force && SH.bagWeight() + it.w > SH.BAG_CAP + 0.001) { SH.UI.toast('Backpack is full.'); return false; }
    SH.G.bag.push(id); return true;
  };
  SH.rmBag = (id) => { const i = SH.G.bag.indexOf(id); if (i >= 0) { SH.G.bag.splice(i, 1); return true; } return false; };
  SH.rmStash = (id) => { const i = SH.G.stash.indexOf(id); if (i >= 0) { SH.G.stash.splice(i, 1); return true; } return false; };
  SH.insulation = (sleeping) => {
    let w = 0; if (SH.has('hoodie')) w += 15; if (SH.has('coat')) w += 30;
    if (sleeping && SH.has('blanket')) w += 25; return w;
  };
  SH.foodInBag = () => SH.G.bag.filter((id) => SH.ITEMS[id].food && !SH.ITEMS[id].reusable);

  // ---------- environment ----------
  SH.locIndoor = () => { const L = SH.LOC[SH.G.loc]; return L.indoor && !SH.G.outsideOverride; };
  SH.warmTarget = (sleeping) => {
    if (SH.locIndoor()) return SH.G.loc === 'laundromat' ? 88 : 84;
    const T = SH.tempF(); let v = 22 + (T - 32) * 1.6 + SH.insulation(sleeping);
    if (SH.raining()) v -= SH.has('umbrella') && !sleeping ? 6 : 24;
    if (SH.G.loc === 'underpass') v += 8; // shelter from wind / rain
    if (sleeping) v -= 8;
    return U.clamp(v, 0, 90);
  };

  // ---------- simulation step ----------
  // opts: {sleep:bool, quality:0..1, exert:0..n, act:'string', interrupt:bool}
  SH.advance = function (mins, opts = {}) {
    const G = SH.G; const steps = Math.max(1, Math.round(mins / 10));
    const hard = G.mode === 'survival' ? 1.3 : 1;
    let interrupted = false;
    for (let i = 0; i < steps; i++) {
      const prevDay = SH.day(); const prevHour = Math.floor(SH.hour());
      G.t += 10; const k = 10 / 60;
      // needs
      SH.st('full', -(opts.sleep ? 1.8 : 3.7) * k * hard);
      if (opts.sleep) SH.st('energy', (opts.quality != null ? opts.quality : 1) * 13 * k);
      else SH.st('energy', -(4.8 + (opts.exert || 0)) * k * hard);
      SH.st('hyg', -1.7 * k * (G.phase === 'run' ? 1.4 : 1));
      // warmth
      const tgt = SH.warmTarget(opts.sleep);
      G.s.warmth += (tgt - G.s.warmth) * 0.12;
      G.s.warmth = U.clamp(G.s.warmth, 0, 100);
      // health
      let dh = 0;
      if (G.s.full < 15) dh -= 0.7; if (G.s.full <= 0) dh -= 1.3;
      if (G.s.warmth < 30) dh -= 2.2; if (G.s.warmth < 15) dh -= 4.5;
      if (G.s.energy <= 0) dh -= 0.8;
      if (G.s.full > 45 && G.s.warmth > 45 && G.s.energy > 20) dh += opts.sleep ? 2 : 0.8;
      SH.st('health', dh * k * hard);
      // mood / stress drift
      if (G.s.full < 20) SH.st('mood', -2 * k);
      if (G.s.warmth < 35) { SH.st('mood', -3 * k); SH.st('stress', 2.5 * k); }
      if (G.s.hyg < 20) SH.st('mood', -1 * k);
      if (G.phase === 'home' && G.loc === 'home' && SH.rickWhere() === 'home' && SH.rickDrunk() >= 2 && !opts.sleep) SH.st('stress', 2 * k);
      if (G.phase === 'run') SH.st('stress', (SH.isDark() && !SH.locIndoor() ? 3 : 0.8) * k);
      // phone battery
      if (G.phone.bat > 0 && !G.phone.confiscated) {
        let drain = G.phone.airplane ? 0.6 : (G.phone.low ? 1.6 : 3.2);
        const charging = G.loc === 'home' && G.phase === 'home' && (G.room === 'bedroom' || opts.sleep);
        if (charging) G.phone.bat = Math.min(100, G.phone.bat + 30 * k);
        else if (G.charging) { G.phone.bat = Math.min(100, G.phone.bat + 32 * k); }
        else G.phone.bat = Math.max(0, G.phone.bat - drain * k);
        if (G.phone.bat <= 0) { G.phone.bat = 0; SH.UI.log('Your phone screen goes black. Battery dead.', 'bad'); SH.tag('phoneDied'); }
      }
      // run phase
      if (G.phase === 'run') SH.Run && SH.Run.tick(k, opts);
      // hour boundary
      const nh = Math.floor(SH.hour());
      if (nh !== prevHour) {
        SH.hourly && SH.hourly(opts);
      }
      if (SH.day() !== prevDay) SH.onNewDay(prevDay);
      // events
      const ev = SH.Events.check(opts);
      if (ev) { SH.Events.queue(ev); if (opts.interrupt !== false && ev.interrupt !== false) { interrupted = true; break; } }
      if (G.s.health <= 0) { interrupted = true; SH.Events.queue({ id: 'collapse', run: () => SH.Endings.collapse() }); break; }
      if (G.ended) { interrupted = true; break; }
    }
    G.charging = false;
    return interrupted;
  };

  SH.hourly = function (opts) {
    const G = SH.G;
    // phone ambient
    SH.Phone && SH.Phone.hourly();
    // home suspicion natural decay
    if (G.phase === 'home') G.susp = Math.max(0, G.susp - 0.4);
    if (G.phase === 'run') G.stats.hoursOut++;
    // curfew — out after 10 PM before running away
    if (G.phase === 'home' && G.loc !== 'home' && (SH.hour() >= 22 || SH.hour() < 5) && G.curfewDay !== SH.day() && !opts.sleep && !G.ended) {
      G.curfewDay = SH.day();
      SH.Events.queue({ id: 'curfew', run: () => {
        const momHome = SH.momWhere() === 'home';
        const who = momHome ? 'Mom' : 'Rick';
        const ch = [{ t: 'Go home. Now.', fn: () => {
          SH.G.loc = 'home'; SH.G.room = 'bedroom'; SH.advance(25, { interrupt: false, exert: 2 }); SH.susp(12);
          if (momHome) { SH.rel('mom', -4); SH.UI.log('Mom is waiting on the stairs in her scrubs. She doesn\'t yell. That\'s worse. "Do you know what I thought happened to you?" Grounded, phone on the counter overnight.', 'warn'); SH.G.phone.confiscated = true; SH.G.phone.takenBy = 'mom'; SH.G.phoneBackAt = SH.G.t + 9 * 60; }
          else { SH.rel('rick', -6); SH.st('stress', 12); SH.UI.log('Rick is up. "You think this is a hotel?" He says a lot of other things. You look at the carpet until he runs out.', 'bad'); }
          SH.UI.afterAction(); } }];
        if (SH.f('runUnlocked')) ch.push({ t: 'Put the phone face-down. Don\'t go back.', cls: 'danger', sub: 'This is it, then.', fn: () => SH.Run.start('stayedOut', false) });
        SH.UI.dialog({ title: 'After Curfew', who, text: [`It's ${SH.fmt12()}. Your phone lights up: ${who.toUpperCase()}. Then again. Then a text: "${momHome ? 'Where ARE you. Answer me right now.' : 'get home. now.'}"`, SH.f('runUnlocked') ? 'You could go home. Or you could just... not.' : 'You\'re not ready for "not going home." Not yet. Your feet already know the way back.'], choices: ch });
      } });
    }
    // household dinner (18:00–19:59) — who cooks tells you what kind of night it is
    if (G.phase === 'home' && G.loc === 'home' && SH.hour() >= 18 && SH.hour() < 20 && G.lastDinner !== SH.day() && !opts.sleep) {
      G.lastDinner = SH.day();
      const mom = SH.momWhere() === 'home', dr = SH.rickDrunk(), rick = SH.rickWhere() === 'home';
      let line, full = 30, cls = 'sys';
      if (mom) { line = U.pick(['Mom makes spaghetti. She asks about school and actually waits for the answer.', 'Mom brings home a rotisserie chicken. Lily does her chicken dance. Even Rick laughs.', 'Mom\'s too tired to cook, so it\'s breakfast-for-dinner. Lily gets the pancake shaped like a Lily.']); SH.st('mood', 4); SH.rel('mom', 1); cls = 'good'; }
      else if (rick && dr < 2) { line = U.pick(['Rick throws a frozen pizza in the oven and doesn\'t burn it. That counts.', 'Rick makes boxed mac and cheese and gets the ratio of milk right. He says "Chef Rick" in a voice. Lily giggles.']); }
      else if (G.pantry > 10) { line = 'Nobody\'s making dinner, so you do. Two bowls of cereal: one for you, one for Lily, with the good spoon for her.'; G.pantry -= 5; full = 22; SH.rel('lily', 2); }
      else { line = 'There\'s no dinner. You split a sleeve of crackers with Lily and tell her it\'s a picnic.'; full = 10; SH.st('mood', -4); SH.rel('lily', 2); cls = 'bad'; }
      SH.st('full', full); G.stats.meals++;
      SH.UI && SH.UI.log(line, cls);
    }
    // low energy forced sleep
    if (G.s.energy <= 1 && !opts.sleep) SH.Events.queue({ id: 'passout', run: () => SH.Events.passOut() });
    // the living world: data-driven ambient events + rumor spread
    if (SH.Engine && G.world) { try { SH.Engine.hourly(opts); } catch (e) { console.error('Engine.hourly', e); } }
  };

  SH.onNewDay = function (prevDay) {
    const G = SH.G;
    SH.Journal.writeDay(prevDay);
    G.choresToday = 0; G.lunchPaid = false; G.ateToday = 0;
    G.pantry = Math.max(0, G.pantry - 6);
    if ((SH.MOM_SHIFTS[SH.day()] === 'OFF')) G.pantry = Math.min(100, G.pantry + 45);
    SH.Phone && SH.Phone.dailyFeed();
    if (G.phase === 'home' && SH.day() > SH.HOME_DAYS) {
      SH.Events.queue({ id: 'stayedEnd', run: () => SH.Endings.stayed() });
    }
    if (G.phase === 'run' && !(G._exGrace > G.t) && SH.day() - SH.day(G.missingAt) >= 6 && (G.s.health < 40 || G.s.full < 25 || G.s.energy < 20 || (!G.away && !G.veh && !G.hideout && !G.base && SH.day() - SH.day(G.missingAt) >= 9))) {
      SH.Events.queue({ id: 'longRun', run: () => (SH.Exhaust ? SH.Exhaust.hit() : SH.Endings.found('exhausted')) });
    }
    G.newDayPending = true;
  };

  // ---------- travel ----------
  SH.travelOptions = function (to) {
    const G = SH.G, A = SH.LOC[G.loc], B = SH.LOC[to];
    const d = U.dist(A, B); const out = [];
    const walk = Math.max(5, Math.round(d / 6 / 5) * 5);
    out.push({ mode: 'walk', label: 'Walk', mins: walk, cost: 0, exert: 1.5 });
    if (SH.f('hasBike') && G.phase === 'home' && !SH.f('bikeGone')) out.push({ mode: 'bike', label: 'Bike', mins: Math.max(5, Math.round(d / 16 / 5) * 5), cost: 0, exert: 2 });
    if (G.phase === 'run' && SH.f('bikeWithMe')) out.push({ mode: 'bike', label: 'Bike', mins: Math.max(5, Math.round(d / 16 / 5) * 5), cost: 0, exert: 2 });
    if (A.bus && B.bus && to !== G.loc) {
      const h = SH.hour();
      if (h >= 6 && h < 23) {
        const ia = SH.BUS_ROUTE.indexOf(G.loc), ib = SH.BUS_ROUTE.indexOf(to, ia + 1) >= 0 ? SH.BUS_ROUTE.indexOf(to, ia + 1) : SH.BUS_ROUTE.indexOf(to);
        let stops = ib - ia; if (stops <= 0) stops += SH.BUS_ROUTE.length - 1;
        const wait = 30 - (Math.floor(G.t) % 30);
        const free = SH.has('buspass') && SH.isWeekday() && h < 19;
        out.push({ mode: 'bus', label: 'City bus', mins: wait + stops * 7, cost: free ? 0 : 2, exert: 0.2, note: stops + ' stops, next bus in ' + wait + 'm' + (free ? ' (pass)' : '') });
      }
    }
    return out;
  };

  SH.travel = function (to, opt) {
    const G = SH.G;
    if (opt.cost > G.money) { SH.UI.toast('Not enough money for the bus.'); return; }
    SH.money(-opt.cost);
    const from = G.loc;
    G.outsideOverride = opt.mode !== 'bus'; // you're outside while walking
    G.stats.walked += opt.mode === 'walk' ? opt.mins : 0;
    SH.UI.log(`You ${opt.mode === 'walk' ? 'walk' : opt.mode === 'bike' ? 'ride your bike' : 'take the bus'} to ${SH.LOC[to].name}. (${opt.mins} min)`, 'sys');
    const intr = SH.advance(opt.mins, { exert: opt.exert, act: 'travel', interrupt: false });
    G.outsideOverride = false;
    G.loc = to; G.room = 'bedroom';
    if (to !== 'home') G.lastAway = G.t;
    if (G.phase === 'home' && to !== 'home') SH.checkTruancy();
    SH.Run && G.phase === 'run' && SH.Run.onArrive(to, from);
    if (G.phase === 'run' && opt.mode === 'walk' && SH.isDark() && U.chance(0.18)) SH.Events.queue({ id: 'nightwalk', run: () => SH.Events.nightWalk() });
    SH.Events.onArrive && SH.Events.onArrive(to);
    SH.UI.afterAction();
  };

  SH.checkTruancy = function () {
    const G = SH.G;
    if (G.phase !== 'home' || !SH.isWeekday()) return;
    const h = SH.hour();
    if (h >= 9.5 && h < 15 && G.loc !== 'school' && !G.done['truant' + SH.day()] && !G.flags['excused' + SH.day()]) {
      G.done['truant' + SH.day()] = true; G.missedSchool++;
      SH.Events.queue({ id: 'truancy', run: () => SH.Events.truancyCall() });
    }
  };

  // ---------- save / load ----------
  SH.save = function () { try { localStorage.setItem('smallhours_save', JSON.stringify(SH.G)); return true; } catch (e) { return false; } };
  SH.load = function () { try { const s = localStorage.getItem('smallhours_save'); if (!s) return false; SH.G = JSON.parse(s); SH.Story && SH.Story.apply(); return true; } catch (e) { return false; } };
  SH.hasSave = function () { try { return !!localStorage.getItem('smallhours_save'); } catch (e) { return false; } };
})(window.SH);
