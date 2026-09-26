/* SMALL HOURS — Part 2a: getting around Averland.
   Rides: walk, kick scooter, e-scooter (battery!), bike, your own vehicle (fuel + driving skill).
   Tickets: County Transit (anyone), CheapRide (driver discretion), Averline (strict), Regional Rail (conductors).
   Rain slows every mode (x1.4) and makes falls/crashes likelier. Things happen on the road. */
(function (SH) {
  const A = SH.Atlas; if (!A) return;
  const G = () => SH.G;
  const T = SH.Travel = {};
  const own = (k) => (G().owned || []).includes(k);
  T.rides = () => ({ kick: own('x_kick'), escoot: own('x_escoot'), bike: SH.f('hasBike') || own('x_bikeused') || own('x_bmx') || own('x_bikenew') || own('x_cargo') });
  const wet = () => { const w = SH.weatherDay ? SH.weatherDay() : {}; return /rain|storm/.test(w.c || ''); };
  T.wet = wet;

  const bModes = A.modes;
  A.modes = function (from, to) {
    const g = G(), mi = A.miles(from, to), out = bModes.call(this, from, to).filter((m) => m.k !== 'intercity' && m.k !== 'bike');
    const R = T.rides(), rain = wet() ? 1.4 : 1, rn = wet() ? ' Rain: slower, slippery.' : '';
    if (R.kick && mi <= 25) out.push({ k: 'kick', n: '🛴 Kick scooter', mins: Math.round(mi * 9 * rain), cost: 0, e: Math.round(mi * 2.5), note: 'Your legs are the motor.' + rn });
    if (R.escoot) { const bat = g.escootBat == null ? 100 : g.escootBat, range = bat * 0.18; out.push({ k: 'escoot', n: '🛴 E-scooter', mins: Math.round(mi * 4.5 * rain), cost: 0, e: 1, note: `Battery ${bat}% ≈ ${range.toFixed(0)} mi.${mi > range ? ' ⚠️ Not enough charge. You\'ll be pushing it.' : ''}` + rn }); }
    if (R.bike && mi <= 30) out.push({ k: 'bike', n: '🚲 Bike', mins: Math.round(mi * 6 * rain), cost: 0, e: Math.round(mi * 1.8), note: rn.trim() });
    const v = g.veh; if (v && v.running && v.at === from.id) { const need = mi * 0.9; out.push({ k: 'drive', n: `🚗 Drive the ${v.n}`, mins: Math.round(mi * 1.6 * rain), cost: 0, e: 3, note: `Fuel ${Math.round(v.fuel)}%${v.fuel < need ? ' ⚠️ not enough gas' : ''} · driving skill ${SH.skill('drive')}.` + rn }); }
    if (mi > 9 || !out.some((m) => m.k === 'bus')) Object.entries(SH.TRANSPORT || {}).forEach(([k, c]) => {
      if (k === 'county') return;
      if (!c.tiers.includes(from.tier) || !c.tiers.includes(to.tier)) return;
      if (c.rail && !((from.rail || from.tier === 'city' || from.home) && (to.rail || to.tier === 'city'))) return;
      const price = Math.round(c.base + mi * c.rate);
      out.push({ k: 'co_' + k, n: `${c.icon} ${c.n}`, mins: Math.round(mi / (c.rail ? 55 : 42) * 60 + 30), cost: price, e: 2, note: c.rule.split('.')[0] + '.' });
    });
    return out;
  };

})(window.SH);
