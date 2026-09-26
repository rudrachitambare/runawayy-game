/* SMALL HOURS — E2b: riding the network. Journeys show up in the Atlas as real departures ("9:12 AM from Harlow,
   arrives 10:40, 4 stops, change at Long Junction"). Waiting, boarding (age checks by style), seats for your
   whole group (nobody gets left behind: you all wait for the next one, or squeeze in on the sketchy ones),
   delays, breakdowns, missed connections, and a departures board in every served town. */
(function (SH) {
  const A = SH.Atlas, R = SH.Routes; if (!A || !R) return;
  const G = () => SH.G, P = (id) => R.net().P[id], fmt = R.fmt;
  const chance = (p) => Math.random() < p;
  const back = () => (G().away ? setTimeout(A.hub, 30) : SH.UI.afterAction());
  const D = (title, text, choices) => SH.UI.dialog({ title, text: [].concat(text), choices: choices || [{ t: 'Okay', fn: back }] });
  const grp = () => 1 + ((G().party || []).length);
  const day = (t) => (Math.floor(t / 1440) > Math.floor(G().t / 1440) ? (Math.floor(t / 1440) - Math.floor(G().t / 1440) === 1 ? ' tomorrow' : ' in 2 days') : '');
  const styleTag = (o) => ({ pro: 'professional', unprof: 'unprofessional', sketchy: 'sketchy but safe' })[o.style];
  const night = (t) => { const h = Math.floor((t % 1440) / 60); return h >= 21 || h < 5; };

  /* ---------- the Atlas lists real journeys instead of "teleport to any town" ---------- */
  const bModes = A.modes;
  A.modes = function (from, to) {
    const out = bModes.call(this, from, to).filter((m) => !/^co_/.test(m.k) && m.k !== 'bus' && m.k !== 'intercity');
    const g = G(); if (!g || !from || !to || from.id === to.id) return out;
    R.journeys(from, to, g.t, 5).forEach((jr) => {
      const L = jr.legs, o = L[0].rt.op, stops = L.reduce((s, l) => s + l.j - l.i, 0), cost = jr.cost * grp();
      const ch = L.length > 1 ? ' · ' + L.slice(1).map((l, n) => `${n ? 'then ' : 'change at '}${P(L[n].rt.stops[L[n].j]).name} (${l.rt.op.n}, ${fmt(l.dep)})`).join(', ') : '';
      out.push({ k: jr.key, jr, n: `${o.icon} ${o.n}${L.length > 1 ? ' + ' + L[1].rt.op.icon : ''}`, mins: jr.arr - g.t, cost, e: 2 * L.length,
        note: `Leaves ${fmt(jr.dep)}${day(jr.dep)} · arrives ${fmt(jr.arr)}${day(jr.arr)} · ${stops} stop${stops > 1 ? 's' : ''} · ${styleTag(o)}${ch}${night(jr.dep) ? ' · ⚠️ night run' : ''}${grp() > 1 ? ` · $${jr.cost} each` : ''}` });
    });
    if (!out.some((m) => m.jr) && !to.served) out.push({ k: 'none', n: 'No bus, no train', blocked: 'Nothing stops here. You\'d have to walk, bike or drive the last stretch.' });
    return out;
  };

  const bGo = A.go;
  A.go = function (id, mode) {
    if (!/^rt:/.test(mode || '')) return bGo.apply(this, arguments);
    const jr = R.byKey(mode), to = A.data().places.find((p) => p.id === id); if (!jr || !to) return;
    if (G().money < jr.cost * grp()) return SH.UI.toast(`That's $${jr.cost * grp()}${grp() > 1 ? ' for all of you' : ''}. You have $${Math.floor(G().money)}.`);
    const wait = jr.dep - G().t;
    const go = () => R.take(jr, to);
    const warn = night(jr.dep) ? ' ⚠️ It\'s a night run: fewer people around, and the ones who are around are awake for a reason.' : '';
    if (wait > 90 || warn) return D('Wait for it?', `The ${jr.legs[0].rt.op.n} ${jr.legs[0].rt.op.T.v} leaves at ${fmt(jr.dep)}${day(jr.dep)}. That's ${Math.floor(wait / 60)}h ${wait % 60}m of waiting${wait > 300 ? ', most of it on a bench' : ''}.${warn}`,
      [{ t: 'Wait for it', cls: warn ? 'hot' : '', fn: go }, { t: 'Never mind', fn: back }]);
    go();
  };

  /* ---------- the ride itself ---------- */
  R.take = function (jr, dest, li) {
    li = li || 0; const g = G(), L = jr.legs[li], rt = L.rt, o = rt.op, from = P(rt.stops[L.i]), to = P(rt.stops[L.j]), last = li === jr.legs.length - 1;
    const wait = Math.max(0, L.dep - g.t); if (wait) { SH.advance(wait, { interrupt: false }); if (g.ended) return; }
    const strand = (msg) => A.arrive(from, { mins: 0, cost: 0, e: 0 }, msg);
    // boarding: age check depends on the company's style
    const heat = (g.heat || 0) / 100, look = g.flags && g.flags.disguise ? 0.15 : 0;
    const s = Math.max(0, o.strict + heat * 0.3 - look - (grp() - 1) * 0.05);
    if (chance(s)) {
      if (o.style === 'pro') {
        if (g.reported && chance(0.5)) return SH.Endings.found(o.T.rail ? 'agent' : 'bus');
        g.awayNotice = (g.awayNotice || 0) + 15;
        const t = o.T.rail ? `The conductor at the door checks tickets and faces. "Who are you traveling with, sweetheart?" There's no good answer. "Not today. Go find your grown-up."` : `"ID?" The ${o.n} driver doesn't take your money. "Kids your age don't ride alone on my coach. Company rule, and a good one." The door hisses shut.`;
        return li ? D(o.n, t + ` You're stuck in ${from.name}.`, [{ t: 'Okay', fn: () => strand() }]) : D(o.n, t);
      }
      return D(o.n, `The ${o.T.v === 'old train' ? 'conductor' : 'driver'} looks at you, then at the empty space behind you. "Where's your mom?"`, [
        { t: `"Meeting me at ${to.name}. She's late, as usual."`, fn: () => { if (chance(0.55)) { SH.UI.log('A long look. A shrug. "Sit up front where I can see you."', 'sys'); board(); } else D(o.n, '"Nice try. Not on my ' + (o.T.rail ? 'train' : 'bus') + '."', [{ t: 'Okay', fn: () => (li ? strand() : back()) }]); } },
        { t: 'Walk away', fn: () => (li ? strand() : back()) }]);
    }
    board();
    function board() {
      const free = R.seats(rt, L.dep);
      if (free < grp() && o.style !== 'sketchy') {
        const nx = R.next(rt, L.i, L.dep + 1);
        const msg = `The ${o.T.v} pulls up full${free ? `: ${free} seat${free > 1 ? 's' : ''} for ${grp()} of you` : ''}. Nobody's getting left on the curb, so you all wait.`;
        if (nx == null) return D(o.n, msg + ' That was the last one.', [{ t: 'Okay', fn: () => (li ? strand() : back()) }]);
        return D(o.n, msg + ` Next one: ${fmt(nx)}${day(nx)}.`, [{ t: 'Wait for the next one', fn: () => R.take(retime(jr, li, nx), dest, li) }, { t: 'Forget it', fn: () => (li ? strand() : back()) }]);
      }
      if (free < grp()) SH.UI.log(`It's already full. The driver waves you in anyway: "Squeeze. Three to a seat, kids on laps, it's fine." It is not fine. It's warm, though.`, 'sys');
      const fare = R.price(rt, L.i, L.j) * grp(); SH.money(-fare); (g.tx = g.tx || []).push({ t: g.t, d: `${o.n}: ${from.name} → ${to.name}`, a: -fare });
      g.lastRide = 'rt_' + o.type; g.rides = (g.rides || 0) + 1;
      const late = R.delay(rt, L.dep), ride = L.arr - L.dep + late;
      flavor(o, from, to, late);
      const ev = incident(o, rt, L, to, late);
      if (ev) { SH.advance(Math.round(ride / 2), { interrupt: false }); if (g.ended) return; g._tripTo = to; return SH.EndX.trigger(ev, { to, from, op: o, mode: 'rt_' + o.type }); }
      if (last) return A.arrive(dest, { mins: ride, cost: 0, e: 2 }, late > 20 ? `(${late} minutes late${late > 60 ? '. Of course.' : '.'})` : '');
      SH.advance(ride, { interrupt: false }); if (g.ended) return;
      const nxt = jr.legs[li + 1];
      if (g.t + 5 > nxt.dep) { // missed the connection
        const again = R.next(nxt.rt, nxt.i, g.t + 5);
        return A.arrive(to, { mins: 0, cost: 0, e: 1 }, `The ${o.n} crawls into ${to.name} ${late} minutes late. The ${nxt.rt.op.n} left at ${fmt(nxt.dep)}. ${again != null ? `Next one: ${fmt(again)}${day(again)}.` : 'That was the last one.'}`);
      }
      SH.UI.log(`${to.name}. You change to the ${nxt.rt.op.n} ${nxt.rt.op.T.v}.`, 'sys');
      R.take(jr, dest, li + 1);
    }
  };
  const retime = (jr, li, dep) => { const legs = jr.legs.slice(); const L = legs[li]; legs[li] = Object.assign({}, L, { dep, arr: dep + L.rt.off[L.j] - L.rt.off[L.i] }); return Object.assign({}, jr, { legs }); };

  function flavor(o, from, to, late) {
    const T = {
      tempo: ['The tempo leaves when it\'s full, and it\'s full of sacks of feed, a crate of chickens and a grandma who gives you a peppermint.', 'Fourteen people in a tempo built for twelve. Every pothole is a group experience.'],
      minivan: ['The shuttle driver plays the same country station the whole way and sings along to the ads.', 'Seven seats, seven strangers, one air freshener shaped like a pine tree doing its best.'],
      car: ['The shared car smells like vanilla and old coffee. The other passenger sleeps with his mouth open.', 'The driver takes "shortcuts" that add twenty minutes, then tells you about his divorce.'],
      bus: ['The bus stops at every gas station, grain elevator and crossroads on the way, and somebody gets on or off at almost all of them.', 'You watch the towns go by: a water tower, a Dollar General, a church, repeat.'],
      express: ['The coach is quiet and cold, with a toilet you are not going to use.'],
      county: ['The county bus smells like wet umbrellas. The driver knows every old lady by name.'],
      train: ['The train sways. Fields slide past in the window like somebody is pulling a long painting.'],
      oldtrain: ['The old train rattles so hard your teeth click. It stops at halts that are just a sign and a bench in a field.', 'The conductor punches your ticket with a clicker older than your mom and calls you "young traveler."'],
    }[o.type] || [];
    const st = o.style === 'sketchy' ? ' The radio is loud, the seats are taped together, and nobody asks you a single thing.' : '';
    if (T.length) SH.UI.log(T[Math.floor(Math.random() * T.length)] + st, 'sys');
    if (late >= 60) SH.UI.log(o.T.rail ? 'The train stops in the middle of nowhere for an hour. "Signal problems." Cows watch you through the window.' : `Halfway there the ${o.T.v} coughs, shudders and dies on the shoulder. ${o.style === 'sketchy' ? 'The driver fixes it with a coat hanger and a lot of swearing.' : 'A replacement comes eventually.'}`, 'warn');
  }

  function incident(o, rt, L, to, late) {
    const g = G(), rep = g.reported ? 1 : 0.3, heat = (g.heat || 0) / 100 + 0.2, dep = L.dep;
    if (chance(o.S.risk * rep * heat * 0.6)) return o.type === 'train' ? 'conductor' : o.type === 'oldtrain' ? 'oldTrain' : o.style === 'sketchy' ? 'kindDriver' : o.style === 'unprof' ? 'posterDriver' : 'busAgent';
    if (night(dep) && !o.T.rail && chance(0.12)) return 'nightbus';
    if (o.type === 'tempo' && late >= 60 && to.tier === 'village' && chance(0.25)) return 'tempoBreak';
    if (o.type === 'train' && to.capital && g.reported && chance(0.2)) return 'railCapital';
    return null;
  }

  /* ---------- departures board (towns you're in, and Harlow's bus + train stations) ---------- */
  R.boardView = function (place) {
    const g = G(), B = R.board(place, g.t);
    if (!B.length) return D('Departures', `Nothing leaves ${place.name}. No bus stop, no station, not even a tempo. Just the road.`);
    SH.UI.dialog({ title: `🚏 Departures · ${place.name}`, text: [`${SH.fmt ? SH.fmt() : ''} · ${grp() > 1 ? grp() + ' of you' : 'just you'}`], choices: B.map((b) => {
      const o = b.rt.op, end = P(b.rt.stops[b.rt.stops.length - 1]), via = b.rt.stops.slice(b.i + 1, -1).map((id) => P(id).name);
      return { t: `${fmt(b.dep)}${day(b.dep)} ${o.icon} ${o.n} → ${end.name}`, sub: `${styleTag(o)} ${o.T.v}${via.length ? ' · via ' + via.slice(0, 4).join(', ') + (via.length > 4 ? '…' : '') : ' · direct'}`, fn: () => stopsView(place, b) };
    }).concat([{ t: 'Back', fn: back }]) });
  };
  function stopsView(place, b) {
    const rt = b.rt, o = rt.op;
    SH.UI.dialog({ title: `${o.icon} ${o.n}`, text: [`${fmt(b.dep)} from ${place.name}. ${o.rule}`, 'Where do you get off?'], choices: rt.stops.slice(b.i + 1).map((id, k) => {
      const j = b.i + 1 + k, arr = b.dep + rt.off[j] - rt.off[b.i], price = R.price(rt, b.i, j);
      return { t: `${P(id).name}`, sub: `arrives ${fmt(arr)}${day(arr)} · $${price}${grp() > 1 ? ' each' : ''} · ${P(id).tier === 'small' ? 'small town' : P(id).tier}`, fn: () => A.go(id, 'rt:' + rt.id + '/' + b.i + '/' + j + '/' + b.dep) };
    }).concat([{ t: 'Back', fn: () => R.boardView(place) }]) });
  }
  (A.extra = A.extra || []).push((p, ch) => { if (p.served) ch.splice(Math.min(2, ch.length), 0, { t: '🚏 Departures board', sub: 'Buses, tempos, shuttles' + (p.rail || p.halt ? ', trains' : ''), fn: () => R.boardView(p) }); });
  const AC = SH.Actions;
  if (AC && AC.list) { const bl = AC.list; AC.list = function () { const r = bl.apply(this, arguments), g = G(); if (!g || g.away || g.phase !== 'run' || !r || !r.acts) return r; if (g.loc === 'bus' || g.loc === 'station') r.acts.unshift({ label: '🚏 Departures board', sub: 'Where can you actually get to from here?', fn: () => R.boardView(A.data().places[0]) }); return r; }; }
})(window.SH);
