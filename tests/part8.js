module.exports = async (run, ev, tp, p) => {
  await run(8, 'two-change trips', async () => {
    tp(await ev(() => { const R = SH.Routes, D = SH.Atlas.data(), N = R.net(), served = D.places.filter((x) => (N.at[x.id] || []).length); const base = (a, b, t) => { const k = R.journeys; return k; };
      let n = 0, one = 0, two = 0, ms2 = 0, max2 = 0; const t = SH.G.t; const orig = R.journeys;
      for (let i = 0; i < served.length; i += 3) for (let j = 1; j < served.length; j += 4) { const a = served[i], b = served[j]; if (a === b) continue; n++; const t0 = performance.now(); const r = R.journeys(a, b, t, 4); const dt = performance.now() - t0; ms2 += dt; max2 = Math.max(max2, dt); if (r.length) one++; if (r.length && r.every((x) => x.legs.length === 3)) two++; }
      return `served ${served.length}/${D.places.length}; sampled pairs ${n}; with any journey ${one} (${(100 * one / n).toFixed(0)}%); reachable ONLY thanks to 2 changes ${two}; avg ${(ms2 / n).toFixed(1)}ms max ${max2.toFixed(0)}ms`; }));
    tp(await ev(() => { const R = SH.Routes, D = SH.Atlas.data(), N = R.net(), served = D.places.filter((x) => (N.at[x.id] || []).length); for (const a of served) for (const b of served) { if (a === b) continue; const r = R.journeys(a, b, SH.G.t, 4).find((x) => x.legs.length === 3); if (r) { const kk = R.byKey(r.key); return `${a.name} → ${b.name}: ` + r.legs.map((l) => `${l.rt.op.n} ${D.places.find((x) => x.id === l.rt.stops[l.i]).name}→${D.places.find((x) => x.id === l.rt.stops[l.j]).name}`).join(' | ') + ` $${r.cost} byKey ok=${!!kk && kk.legs.length === 3}`; } } return 'none'; }));
  });
};
