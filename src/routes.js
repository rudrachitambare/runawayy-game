/* SMALL HOURS — E2a: the transport network. Every story seeds its own operators on top of the four famous ones
   (Averline, CheapRide, Averland Regional Rail, County Transit): 7 randomized companies — 3 bus lines, a tempo
   traveller service, a minivan shuttle, a shared-car pool and a rattly unprofessional train. Each one is
   professional, unprofessional, or sketchy-but-safe (the crew is never the danger — just late, loud and loose).
   Every company runs real ROUTES: a list of stops along the road (or rail) network, both directions, with a
   daily timetable. Buses stop along the way. Nothing is stored in the save: it's all rebuilt from the seed. */
(function (SH) {
  const A = SH.Atlas; if (!A) return;
  const R = SH.Routes = {};
  const h32 = (s) => { let h = 2166136261; for (const c of String(s)) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); } return h >>> 0; };
  const rng = (s) => { let a = h32(s) || 9; return () => { a ^= a << 13; a ^= a >>> 17; a ^= a << 5; return ((a >>> 0) % 1e6) / 1e6; }; };
  R.rng = rng;
  const pick = (r, a) => a[Math.floor(r() * a.length)];
  const MI = 0.35;

  R.TYPES = {
    county: { v: 'local bus', icon: '🚏', speed: 26, dwell: 2, cap: 30, n: [5, 8], win: [360, 1260], base: 1.5, rate: 0.05 },
    express: { v: 'coach', icon: '🚌', speed: 52, dwell: 8, cap: 50, n: [2, 4], win: [330, 1320], base: 8, rate: 0.16 },
    bus: { v: 'bus', icon: '🚌', speed: 40, dwell: 4, cap: 44, n: [3, 5], win: [330, 1290], base: 3, rate: 0.1 },
    tempo: { v: 'tempo traveller', icon: '🚐', speed: 30, dwell: 3, cap: 14, n: [4, 7], win: [360, 1140], base: 1, rate: 0.07 },
    minivan: { v: 'minivan shuttle', icon: '🚙', speed: 38, dwell: 3, cap: 7, n: [2, 4], win: [390, 1200], base: 2, rate: 0.09 },
    car: { v: 'shared car', icon: '🚗', speed: 46, dwell: 0, cap: 4, n: [2, 3], win: [420, 1230], base: 3, rate: 0.18 },
    train: { v: 'train', icon: '🚆', speed: 58, dwell: 3, cap: 300, n: [4, 6], win: [300, 1350], base: 5, rate: 0.18, rail: 1 },
    oldtrain: { v: 'old train', icon: '🚃', speed: 36, dwell: 5, cap: 120, n: [2, 3], win: [330, 1290], base: 2, rate: 0.08, rail: 1 },
  };
  R.STYLES = {
    pro: { n: 'professional', strict: 0.85, delay: 6, brk: 0.004, price: 1.15, risk: 0.25 },
    unprof: { n: 'unprofessional', strict: 0.35, delay: 35, brk: 0.03, price: 0.9, risk: 0.12 },
    sketchy: { n: 'sketchy but safe', strict: 0.04, delay: 60, brk: 0.06, price: 0.7, risk: 0.05, cash: 1 },
  };
  const RULES = {
    pro: ['Unaccompanied minors under 15 are not carried. ID may be requested at boarding.', 'Children under 14 must travel with an adult. Staff will check.'],
    unprof: ['Minors should travel with an adult.* (*Driver\'s call.)', 'Kids with a parent\'s OK only. (Nobody has ever checked the OK.)'],
    sketchy: ['Cash. Get on, sit down, don\'t touch the radio.', 'Pay the driver. No refunds, no questions, no complaints.'],
  };
  const TAGS = { pro: ['On time. Every time.', 'Safe, clean, reliable.', 'Serving Averland since 1962.'], unprof: ['Usually on time!', 'We get there. Eventually.', 'Cheap seats, big hearts.'], sketchy: ['Leaves when it leaves.', 'Cheapest in the county. Don\'t ask how.', 'Ride at your own leisure.'] };
  const NAMES = {
    bus: ['Greyfield Lines', 'Prairie Star Coaches', 'Bluebird Intercity', 'Ridgeway Bus Co.', 'Silverline Express', 'Lakeside Motorcoach', 'Highway 9 Bus', 'Northstar Coaches', 'Tri-County Express', 'Red Arrow Buses', 'Sunrise Coachways', 'Crossroads Bus Lines'],
    tempo: ['Hollis Tempo Runs', 'Farmroad Tempo', 'Valley Tempo Co-op', 'Kessler Tempo Service', 'Dusty Road Tempos', 'Two Rivers Tempo'],
    minivan: ['Main Street Shuttle', 'Gus & Sons Vans', 'Kwik Shuttle', 'Pine County Van Service', 'Ride-Along Vans', 'Hometown Hopper'],
    car: ['PoolCar', 'Sal\'s Shared Cabs', 'HopIn Carpool', 'Ace Car Share', 'Two-Tone Taxi Pool', 'Doorstep Rides'],
    oldtrain: ['Old Valley Railway', 'Lakeline Local', 'Rustbelt Rail', 'Tin Can Rail Co.', 'Prairie Flyer Railroad'],
  };
  const COLS = ['#c0392b', '#16a085', '#8e44ad', '#d35400', '#2c7be5', '#7f8c2d', '#b7950b', '#1f8a70', '#a93263', '#5d6d7e'];

  /* ---------- road graph ---------- */
  function graph(D) {
    const P = {}, adj = {}; D.places.forEach((p) => { P[p.id] = p; adj[p.id] = []; });
    D.roads.forEach((e) => { const a = P[e.a], b = P[e.b], w = Math.hypot(a.x - b.x, a.y - b.y) * MI * (e.hw ? 1.05 : e.loc ? 1.3 : 1.15); adj[e.a].push([e.b, w]); adj[e.b].push([e.a, w]); });
    return { P, adj };
  }
  function dijkstra(g, src) {
    const d = { [src]: 0 }, prev = {}, done = new Set(), q = [src];
    while (q.length) { q.sort((a, b) => d[a] - d[b]); const v = q.shift(); if (done.has(v)) continue; done.add(v);
      g.adj[v].forEach(([w, c]) => { const nd = d[v] + c; if (d[w] == null || nd < d[w]) { d[w] = nd; prev[w] = v; q.push(w); } }); }
    return { d, prev };
  }
  const pathTo = (dj, id) => { const out = [id]; while (dj.prev[out[0]]) out.unshift(dj.prev[out[0]]); return out; };

  /* ---------- build the whole network for this seed ---------- */
  let NET = null;
  // official = the pro intercity/county/pro buses (Greyline depot) and rail; everything else on the road uses the Route 9 pickup
  R.informal = (o) => !!o && (o.type === 'tempo' || o.type === 'minivan' || o.type === 'car' || (o.type === 'bus' && o.style !== 'pro'));
  R.net = function () { const D = A.data(); if (!D) return null; if (NET && NET.seed === D.seed) return NET; NET = build(D); return NET; };

  function build(D) {
    const r = rng('routes:' + D.seed), g = graph(D), P = g.P, DJ = {};
    const dj = (id) => DJ[id] || (DJ[id] = dijkstra(g, id));
    const road = (a, b) => dj(a).d[b];
    const ops = [], routes = [], seen = new Set();
    const T = SH.TRANSPORT || {};
    const op = (o) => { o.T = R.TYPES[o.type]; o.S = R.STYLES[o.style]; o.strict = o.strict != null ? o.strict : o.S.strict; ops.push(o); return o; };
    // the famous four
    op({ id: 'averline', n: (T.averline || {}).n || 'Averline Coaches', icon: '🚌', col: '#0b5cad', type: 'express', style: 'pro', strict: 0.95, tag: 'Comfort. Safety. Every major city.', rule: (T.averline || {}).rule, famous: 1 });
    op({ id: 'cheapride', n: 'CheapRide', icon: '🚐', col: '#e0245e', type: 'bus', style: 'unprof', strict: 0.45, tag: 'Why pay more? (Seriously, why?)', rule: (T.cheapride || {}).rule, famous: 1 });
    op({ id: 'rail', n: 'Averland Regional Rail', icon: '🚆', col: '#5a3fa0', type: 'train', style: 'pro', strict: 0.8, tag: 'The county intercity train.', rule: (T.rail || {}).rule, famous: 1 });
    op({ id: 'county', n: 'County Transit', icon: '🚏', col: '#3a7d2c', type: 'county', style: 'pro', strict: 0.05, tag: 'Local buses, 6 AM – 9 PM.', rule: (T.county || {}).rule, famous: 1 });
    // the 7 randomized ones
    const kinds = ['oldtrain', 'bus', 'bus', 'bus', 'tempo', 'minivan', 'car'];
    const sty = ['pro', 'unprof', 'sketchy', pick(r, ['pro', 'unprof', 'sketchy']), pick(r, ['unprof', 'sketchy']), pick(r, ['pro', 'unprof', 'sketchy'])].sort(() => r() - 0.5);
    const cols = COLS.slice().sort(() => r() - 0.5), usedN = new Set();
    kinds.forEach((k, i) => {
      const style = k === 'oldtrain' ? 'unprof' : sty[i - 1];
      let n; do n = pick(r, NAMES[k === 'bus' ? 'bus' : k]); while (usedN.has(n)); usedN.add(n);
      op({ id: 'op' + i, n, icon: R.TYPES[k].icon, col: cols[i], type: k, style, tag: pick(r, TAGS[style]),
        rule: k === 'oldtrain' ? 'Buy your ticket from the conductor on board. Children should be accompanied. (The conductor is 71 and has seen everything.)' : pick(r, RULES[style]),
        region: k === 'bus' ? pick(r, D.places.filter((p) => p.tier === 'city' || p.tier === 'town')).id : null });
    });

    /* one route = stops in order (+ its reverse). Road routes follow the shortest road path and stop at places the filter allows */
    const addRoute = (o, ids, keep, rail) => {
      if (ids.length < 2) return null;
      const stops = ids.filter((id, i) => i === 0 || i === ids.length - 1 || keep(P[id]));
      const k = o.id + ':' + [stops[0], stops[stops.length - 1]].sort().join('-');
      if (seen.has(k) || stops.length < 2) return null; seen.add(k);
      const cmi = [0]; let acc = 0, si = 1;
      for (let i = 1; i < ids.length; i++) { const a = P[ids[i - 1]], b = P[ids[i]]; acc += rail ? Math.hypot(a.x - b.x, a.y - b.y) * MI * 1.1 : (g.adj[a.id].find((e) => e[0] === b.id) || [0, Math.hypot(a.x - b.x, a.y - b.y) * MI * 1.2])[1]; if (ids[i] === stops[si]) { cmi.push(acc); si++; } }
      const n = o.T.n[0] + Math.floor(r() * (o.T.n[1] - o.T.n[0] + 1));
      [stops, stops.slice().reverse()].forEach((st, dir) => {
        const c = dir ? cmi.map((x) => acc - x).reverse() : cmi.slice();
        const off = c.map((m, i) => Math.round(m / o.T.speed * 60 + i * o.T.dwell));
        const [w0, w1] = o.T.win, sp = n > 1 ? (w1 - w0) / (n - 1) : 0, deps = [];
        for (let j = 0; j < n; j++) deps.push(Math.round((w0 + j * sp + (r() - 0.5) * 40 + (dir ? sp / 3 : 0)) / 5) * 5);
        if (o.style === 'sketchy' && o.type === 'bus' && r() < 0.5) deps.push(1350 + Math.round(r() * 8) * 5); // a night run
        if (o.type === 'oldtrain' && r() < 0.35) deps.push(1380); // the late local
        routes.push({ id: k + ':' + dir, op: o, stops: st, cmi: c, off, deps: deps.filter((x, i, a) => a.indexOf(x) === i).sort((a, b) => a - b) });
      });
      return true;
    };
    const within = (a, lo, hi, f) => D.places.filter((p) => p.id !== a && f(p) && road(a, p.id) >= lo && road(a, p.id) <= hi);
    const roadRoute = (o, a, b, keep) => addRoute(o, pathTo(dj(a), b), keep);
    const non = (p) => p.tier !== 'village', all = () => true;
    ops.forEach((o) => {
      const t = o.type, big = D.places.filter((p) => p.tier === 'city' || p.tier === 'town');
      if (t === 'county') {
        D.places.filter((p) => big.includes(p) || (p.tier === 'small' && r() < 0.4)).forEach((h) => {
          let c = within(h.id, 8, 40, (p) => p.tier === 'small' || p.tier === 'village').sort(() => r() - 0.5);
          if (h.home) c = D.places.slice(3, 6).concat(c); // the villages/small town near Harlow are always on a county bus
          c.slice(0, h.home ? 4 : 2).forEach((q) => roadRoute(o, h.id, q.id, all));
        });
      } else if (t === 'express') {
        const cities = D.places.filter((p) => p.tier === 'city');
        cities.forEach((c) => cities.filter((x) => x !== c).sort((a, b) => road(c.id, a.id) - road(c.id, b.id)).slice(0, 2).forEach((x) => roadRoute(o, c.id, x.id, (p) => p.tier === 'city' || p.tier === 'town')));
        D.places.filter((p) => p.tier === 'town').forEach((tw) => { const c = cities.slice().sort((a, b) => road(tw.id, a.id) - road(tw.id, b.id))[0]; if (road(tw.id, c.id) > 30) roadRoute(o, tw.id, c.id, (p) => p.tier === 'city' || p.tier === 'town'); });
      } else if (t === 'bus') {
        const pool = D.places.filter((p) => non(p) && (!o.region || Math.hypot(p.x - P[o.region].x, p.y - P[o.region].y) < 260));
        for (let i = 0, made = 0; i < 80 && made < (o.id === 'cheapride' ? 10 : 8); i++) { const a = pick(r, pool), b = pick(r, pool); const d = road(a.id, b.id); if (a !== b && d >= 35 && d <= 170 && roadRoute(o, a.id, b.id, (p) => non(p) || r() < 0.4)) made++; }
      } else if (t === 'tempo') {
        const hubs = D.places.filter((p) => p.tier === 'small' || p.tier === 'town');
        for (let i = 0, made = 0; i < 60 && made < 9; i++) { const h = pick(r, hubs), c = within(h.id, 12, 55, (p) => p.tier === 'village'); if (c.length && roadRoute(o, h.id, pick(r, c).id, all)) made++; }
        for (let i = 0, made = 0; i < 30 && made < 3; i++) { const v = pick(r, D.places.filter((p) => p.tier === 'village')), c = within(v.id, 15, 45, (p) => p.tier === 'village'); if (c.length && roadRoute(o, v.id, pick(r, c).id, all)) made++; }
      } else if (t === 'minivan') {
        const sm = D.places.filter((p) => p.tier === 'small');
        for (let i = 0, made = 0; i < 60 && made < 7; i++) { const a = pick(r, sm), c = within(a.id, 20, 80, (p) => p.tier === 'small' || p.tier === 'town'); if (c.length && roadRoute(o, a.id, pick(r, c).id, (p) => p.tier !== 'city')) made++; }
      } else if (t === 'car') {
        for (let i = 0, made = 0; i < 60 && made < 10; i++) { const a = pick(r, D.places), c = within(a.id, 10, 70, all); if (c.length && roadRoute(o, a.id, pick(r, c).id, () => false)) made++; }
      } else if (t === 'train' || t === 'oldtrain') {
        (D.lines || []).forEach((l) => {
          let ids = l.stops.slice();
          if (t === 'oldtrain') { // the slow local also stops at the little halts beside the line
            const out = [ids[0]]; for (let i = 1; i < ids.length; i++) { const a = P[ids[i - 1]], b = P[ids[i]], dx = b.x - a.x, dy = b.y - a.y, L2 = dx * dx + dy * dy || 1;
              D.places.filter((p) => p.halt === l.id).map((p) => [p, ((p.x - a.x) * dx + (p.y - a.y) * dy) / L2]).filter(([, tt]) => tt > 0 && tt < 1).sort((x, y) => x[1] - y[1]).forEach(([p]) => { if (!out.includes(p.id)) out.push(p.id); }); out.push(ids[i]); }
            ids = out;
          }
          addRoute(o, ids, all, true);
        });
      }
    });
    // Harlow's Route 9 pickup: every unofficial bus and every tempo / minivan / car pool runs at least once from Harlow
    // (added after everything else so the rest of the network and its timetables stay exactly the same)
    const H = D.places.find((p) => p.home);
    if (H) ops.forEach((o) => {
      if (!R.informal(o) || routes.some((rt) => rt.op === o && rt.stops.includes(H.id))) return;
      const lim = o.type === 'bus' ? [35, 150] : o.type === 'minivan' ? [20, 80] : [10, 55];
      const ok = o.type === 'tempo' ? (p) => p.tier === 'village' || p.tier === 'small' : o.type === 'minivan' ? (p) => p.tier !== 'city' : o.type === 'bus' ? non : all;
      const c = within(H.id, lim[0], lim[1], ok).sort(() => r() - 0.5);
      for (const q of c) if (roadRoute(o, H.id, q.id, o.type === 'car' ? () => false : o.type === 'bus' ? (p) => non(p) || r() < 0.4 : all)) break;
    });
    // who stops where
    const at = {}; routes.forEach((rt) => rt.stops.forEach((id, i) => (at[id] = at[id] || []).push([rt, i])));
    D.places.forEach((p) => { const L = at[p.id] || []; p.busStop = L.some(([rt]) => !rt.op.T.rail); p.served = L.length > 0; });
    return { seed: D.seed, ops, routes, at, P };
  }

  /* ---------- times & journeys ---------- */
  R.fmt = (t) => { const m = ((t % 1440) + 1440) % 1440, h = Math.floor(m / 60), mm = m % 60; return (h % 12 || 12) + ':' + String(mm).padStart(2, '0') + (h < 12 ? ' AM' : ' PM'); };
  R.price = (rt, i, j) => { const o = rt.op, mi = rt.cmi[j] - rt.cmi[i]; return Math.max(1, Math.round((o.T.base + mi * o.T.rate) * o.S.price * (o.famous && o.id === 'averline' ? 1.2 : 1))); };
  /* the next departure of route rt from stop index i, at or after absolute minute t (today or the next 2 days) */
  R.next = function (rt, i, t) { const d0 = Math.floor(t / 1440) * 1440; for (let d = 0; d < 3; d++) for (const x of rt.deps) { const dep = d0 + d * 1440 + x + rt.off[i]; if (dep >= t) return dep; } return null; };
  R.seats = (rt, dep) => { const q = rng(rt.id + '@' + dep)(), c = rt.op.T.cap; return c <= 17 ? Math.floor(q * (c * 0.5 + 1)) : c >= 100 ? 99 : 3 + Math.floor(q * 25); };
  R.delay = (rt, dep) => { const q = rng('d' + rt.id + '@' + dep); const d = Math.round(Math.pow(q(), 2.2) * rt.op.S.delay); return q() < rt.op.S.brk ? d + 60 + Math.round(q() * 120) : d; };

  R.journeys = function (from, to, t, max) {
    const N = R.net(); if (!N || from.id === to.id) return [];
    const out = [], L = N.at[from.id] || [], start = t + 5;
    L.forEach(([rt, i]) => {
      const j = rt.stops.indexOf(to.id);
      if (j > i) { const dep = R.next(rt, i, start); if (dep != null) out.push({ legs: [{ rt, i, j, dep, arr: dep + rt.off[j] - rt.off[i] }] }); return; }
      for (let k = i + 1; k < rt.stops.length; k++) { // one change
        const hub = rt.stops[k], hp = N.P[hub]; if (Math.hypot(hp.x - to.x, hp.y - to.y) >= Math.hypot(from.x - to.x, from.y - to.y)) continue; const dep1 = R.next(rt, i, start); if (dep1 == null) break; const arr1 = dep1 + rt.off[k] - rt.off[i];
        (N.at[hub] || []).forEach(([r2, a]) => { if (r2 === rt) return; const b = r2.stops.indexOf(to.id); if (b <= a) return; const dep2 = R.next(r2, a, arr1 + 10); if (dep2 == null) return;
          out.push({ legs: [{ rt, i, j: k, dep: dep1, arr: arr1 }, { rt: r2, i: a, j: b, dep: dep2, arr: dep2 + r2.off[b] - r2.off[a] }] }); });
      }
    });
    out.forEach((jr) => { jr.dep = jr.legs[0].dep; jr.arr = jr.legs[jr.legs.length - 1].arr; jr.cost = jr.legs.reduce((s, l) => s + R.price(l.rt, l.i, l.j), 0); jr.key = 'rt:' + jr.legs.map((l) => l.rt.id + '/' + l.i + '/' + l.j + '/' + l.dep).join('|'); });
    out.sort((a, b) => a.arr - b.arr || a.cost - b.cost || a.legs.length - b.legs.length);
    const pickd = [], sig = new Set();
    for (const jr of out) { const s = jr.legs.map((l) => l.rt.op.id).join('+') + (jr.legs.length > 1 ? '@' + jr.legs[0].rt.stops[jr.legs[0].j] : ''); if (sig.has(s)) continue; sig.add(s); pickd.push(jr); if (pickd.length >= (max || 5)) break; }
    return pickd;
  };
  /* departures from a place in the next `win` minutes (falls back to the first ones tomorrow) */
  R.board = function (place, t, win) {
    const N = R.net(); const L = ((N && N.at[place.id]) || []).filter(([rt]) => !R.only || R.only(rt.op)), out = []; // R.only: set by pickup.js for Harlow's per-spot boards
    L.forEach(([rt, i]) => { if (i >= rt.stops.length - 1) return; let dep = R.next(rt, i, t); for (let n = 0; n < 3 && dep != null && dep <= t + (win || 360); n++) { out.push({ rt, i, dep }); dep = R.next(rt, i, dep + 1); } });
    if (!out.length) L.forEach(([rt, i]) => { if (i < rt.stops.length - 1) { const dep = R.next(rt, i, t); if (dep != null) out.push({ rt, i, dep }); } });
    return out.sort((a, b) => a.dep - b.dep).slice(0, 12);
  };
  R.byKey = function (key) {
    const N = R.net(); if (!N || !key.startsWith('rt:')) return null;
    const legs = key.slice(3).split('|').map((s) => { const [id, i, j, dep] = s.split('/'); const rt = N.routes.find((x) => x.id === id); return rt && { rt, i: +i, j: +j, dep: +dep, arr: +dep + rt.off[+j] - rt.off[+i] }; });
    if (legs.some((l) => !l)) return null;
    return { legs, key, dep: legs[0].dep, arr: legs[legs.length - 1].arr, cost: legs.reduce((s, l) => s + R.price(l.rt, l.i, l.j), 0) };
  };
})(window.SH);
