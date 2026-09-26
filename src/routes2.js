/* SMALL HOURS — two-change trip planning. When there's no direct or one-change journey (or fewer than asked),
   search journeys with two changes: from → hub1 → hub2 → destination. Each hub must get you closer to where you're going,
   and every connection needs at least 10 minutes. Same journey objects as routes.js, so boarding/tickets just work. */
(function (SH) {
  const R = SH.Routes; if (!R || !R.journeys) return;
  const base = R.journeys;
  R.journeys2 = function (from, to, t, max) {
    const N = R.net(); if (!N || from.id === to.id) return [];
    const P = N.P, d = (a) => Math.hypot(P[a].x - to.x, P[a].y - to.y), d0 = Math.hypot(from.x - to.x, from.y - to.y);
    const out = [], start = t + 5, reach = {}; // reach[stopId] = legs to get there with ≤1 change... we only need hub2 routes that contain `to`
    const toRoutes = new Map(); (N.at[to.id] || []).forEach(([rt, b]) => toRoutes.set(rt, b));
    if (!toRoutes.size) return [];
    // stops from which a route reaches `to` directly: stopId -> [[rt, a, b]]
    const feeders = {}; toRoutes.forEach((b, rt) => { for (let a = 0; a < b; a++) (feeders[rt.stops[a]] = feeders[rt.stops[a]] || []).push([rt, a, b]); });
    (N.at[from.id] || []).forEach(([r1, i]) => {
      const dep1 = R.next(r1, i, start); if (dep1 == null) return;
      for (let k = i + 1; k < r1.stops.length; k++) {
        const h1 = r1.stops[k]; if (d(h1) >= d0) continue; const arr1 = dep1 + r1.off[k] - r1.off[i];
        (N.at[h1] || []).forEach(([r2, a2]) => {
          if (r2 === r1 || toRoutes.has(r2)) return; const dep2 = R.next(r2, a2, arr1 + 10); if (dep2 == null) return;
          for (let m = a2 + 1; m < r2.stops.length; m++) {
            const h2 = r2.stops[m], fs = feeders[h2]; if (!fs || h2 === from.id || d(h2) >= d(h1)) continue; const arr2 = dep2 + r2.off[m] - r2.off[a2];
            fs.forEach(([r3, a3, b3]) => { if (r3 === r2 || r3 === r1) return; const dep3 = R.next(r3, a3, arr2 + 10); if (dep3 == null || dep3 - start > 2 * 1440) return;
              out.push({ legs: [{ rt: r1, i, j: k, dep: dep1, arr: arr1 }, { rt: r2, i: a2, j: m, dep: dep2, arr: arr2 }, { rt: r3, i: a3, j: b3, dep: dep3, arr: dep3 + r3.off[b3] - r3.off[a3] }] }); });
          }
        });
      }
    });
    out.forEach((jr) => { jr.dep = jr.legs[0].dep; jr.arr = jr.legs[2].arr; jr.cost = jr.legs.reduce((s, l) => s + R.price(l.rt, l.i, l.j), 0); jr.key = 'rt:' + jr.legs.map((l) => [l.rt.id, l.i, l.j, l.dep].join('/')).join('|'); });
    out.sort((a, b) => a.arr - b.arr || a.cost - b.cost);
    const pick = [], sig = new Set();
    for (const jr of out) { const s = jr.legs.map((l) => l.rt.op.id + '@' + l.rt.stops[l.j]).join('+'), s2 = jr.dep + '>' + jr.arr; if (sig.has(s) || sig.has(s2)) continue; sig.add(s); sig.add(s2); pick.push(jr); if (pick.length >= (max || 3)) break; }
    return pick;
  };
  R.journeys = function (from, to, t, max) {
    const r = base.apply(this, arguments); max = max || 4;
    if (r.length >= Math.min(2, max)) return r;
    let extra = []; try { extra = R.journeys2(from, to, t, max - r.length); } catch (e) { console.warn(e); }
    return r.concat(extra).sort((a, b) => a.arr - b.arr || a.cost - b.cost).slice(0, max);
  };
})(window.SH);
