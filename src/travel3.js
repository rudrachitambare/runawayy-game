/* SMALL HOURS — Part 2b: the trip itself — tickets, battery, fuel, and things that happen on the road. */
(function (SH) {
  const A = SH.Atlas, T = SH.Travel; if (!A || !T) return;
  const G = () => SH.G, X = () => SH.EndX;
  const chance = (p) => Math.random() < p;

  function ticket(k, c, from, to) {
    const g = G(), heat = (g.heat || 0) / 100, look = g.flags && g.flags.disguise ? 0.15 : 0;
    const strict = Math.max(0, c.strict + heat * 0.3 - look - (g.party && g.party.length ? 0.05 : 0));
    if (k === 'averline' && chance(strict)) {
      if (g.reported && chance(0.5)) { SH.Endings.found('agent'); return false; }
      SH.UI.dialog({ title: 'Averline ticket counter', text: ['"ID, please." You don\'t have one. The agent looks at you over her glasses. "Honey, you can\'t ride alone. Is there a grown-up with you?"', 'You say your mom is parking the car. She watches you walk away.'], choices: [{ t: 'Okay', fn: () => A.hub() }] });
      g.awayNotice = (g.awayNotice || 0) + 15; return false;
    }
    if (k === 'cheapride' && chance(strict * 0.6)) {
      SH.UI.dialog({ title: 'CheapRide', text: ['The driver scans your ticket, looks at you, looks at the empty sidewalk behind you. "Where\'s your parent?" You lie. He\'s heard better. "Not on my bus, kid."'], choices: [{ t: 'Okay', fn: () => A.hub() }] });
      return false;
    }
    if (k === 'rail') g._railRisk = strict;
    if (k === 'cheapride') g._cheapRisk = strict * 0.4;
    return true;
  }
  T.ticket = ticket;

  /* incidents: some are just bad luck, some end the story */
  function incident(mode, from, to, mi) {
    const g = G(), rain = T.wet(), dark = SH.hour() >= 20 || SH.hour() < 6, bio = (to.biomes || [to.biome || ''])[0] || '';
    if (mode === 'co_rail' && chance(g._railRisk || 0)) return 'conductor';
    if (mode === 'co_cheapride' && chance(g._cheapRisk || 0)) return 'cheapDriver';
    if (mode.startsWith('co_') && dark && chance(0.18)) return chance(0.5) ? 'nightbus' : null;
    if ((mode === 'kick' || mode === 'escoot') && chance(rain ? 0.12 : 0.04)) return 'scooterFall';
    if (mode === 'escoot' && g._escootDead) return 'escootDead';
    if (mode === 'bike' && mi > 15 && g.s.energy < 30 && chance(0.4)) return 'bikeLong';
    if (mode === 'walk' && mi > 5 && dark && chance(0.2)) return 'walkHighway';
    if (mode === 'walk' && /forest/.test(bio) && chance(0.1)) return 'lostWoods';
    if (/river/.test(bio) && rain && chance(0.07)) return 'riverCold';
    if (to.tier === 'village' && chance(0.05)) return 'dog';
    if (SH.weatherDay && SH.weatherDay().c === 'storm' && chance(0.2)) return 'storm';
    if (mode === 'drive') {
      const sk = SH.skill('drive'), p = Math.max(0.02, 0.35 - sk / 330) * (rain ? 1.8 : 1) * (dark ? 1.3 : 1);
      if (chance(p)) return sk < 30 && rain ? 'crashHurt' : chance(0.5) ? 'crash' : 'crashDitch';
      if (chance(0.06 + (g.heat || 0) / 500)) return 'driveStop';
      if (g.veh.fuel < mi * 0.9) return 'outOfGas';
    }
    if (mode === 'co_cheapride' && to.tier === 'city' && g.reported && chance(0.25)) return 'cheaprideCity';
    if (mode === 'co_rail' && to.capital && chance(0.3)) return 'railCapital';
    return null;
  }

  const bGo = A.go;
  A.go = function (id, mode) {
    const g = G(), D = A.data(), from = A.here(), to = D.places.find((p) => p.id === id);
    const m = A.modes(from, to).find((x) => x.k === mode); if (!m || m.blocked) return;
    if (m.cost && g.money < m.cost) return SH.UI.toast('Not enough cash.');
    const mi = A.miles(from, to); g.lastRide = mode; g._escootDead = false;
    if (mode.startsWith('co_') && !ticket(mode.slice(3), SH.TRANSPORT[mode.slice(3)], from, to)) return;
    if (mode === 'escoot') { const bat = g.escootBat == null ? 100 : g.escootBat, need = mi / 0.18; if (need > bat) { g._escootDead = true; m.mins += Math.round((need - bat) * 0.18 * 20); } g.escootBat = Math.max(0, Math.round(bat - need)); }
    const ev = to.home ? null : incident(mode, from, to, mi);
    if (mode === 'drive') g.veh.fuel = Math.max(0, g.veh.fuel - mi * 0.9);
    if (ev && ['conductor', 'cheapDriver', 'crash', 'crashDitch', 'crashHurt', 'driveStop', 'outOfGas', 'scooterFall', 'escootDead', 'bikeLong', 'walkHighway', 'lostWoods', 'riverCold', 'storm', 'nightbus', 'dog', 'cheaprideCity', 'railCapital'].includes(ev)) {
      // half of these are survivable scares on a good day
      const soft = { nightbus: 0.6, dog: 0.7, storm: 0.5, scooterFall: 0.55, bikeLong: 0.3, walkHighway: 0.4, crash: 0.25 }[ev] || 0;
      if (chance(soft)) { scare(ev); }
      else { SH.advance(Math.round(m.mins / 2), { interrupt: false }); if (m.cost) SH.money(-m.cost); g._tripTo = to; return X().trigger(ev, { to, from, mi, mode }); }
    }
    // the car moves only once Sam actually got there (the base go re-checks modes, which need the car at the START)
    const r = bGo.apply(this, arguments);
    if (mode === 'drive' && g.veh && !g.ended && (g.away === to.id || (to.home && !g.away))) { g.veh.at = to.id; (g.skills = g.skills || {}).drive = Math.min(100, (g.skills.drive || 0) + 1); }
    return r;
  };
  function scare(ev) {
    const t = { nightbus: 'A man two seats back keeps asking where you\'re headed. A woman in scrubs sits down next to you without a word and stays there until your stop.', dog: 'A big farm dog follows you for a mile, then decides you\'re fine.', storm: 'The storm hits halfway. You wait it out under a gas station awning, soaked to the bone.', scooterFall: 'The wheel catches a crack and you go down hard. Scraped palms, torn jeans. You get back on.', bikeLong: 'Your legs turn to jelly at mile fifteen. You walk the bike the rest of the way.', walkHighway: 'Trucks blast past so close the wind shoves you. You walk in the ditch the rest of the way.', crash: 'You scrape a mailbox. It\'s fine. The mailbox is not fine.' }[ev];
    if (t) SH.UI.log(t, 'warn'); SH.st('stress', 8); SH.st('health', ev === 'scooterFall' ? -6 : -1);
  }
})(window.SH);
