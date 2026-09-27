/* SMALL HOURS — balance pass (money + notice).
   Before: being noticed (G.awayNotice) only ever went UP while you stayed somewhere, and dropped to 0 the moment you
   arrived anywhere (even back in a town that had nearly caught you). So staying put was impossible and ping-ponging
   between two towns was free. Now:
   - People get used to you. Every day you stay, notice fades: village 12, small town 8, town 7, city 6 a day,
     ×1.5 with a cover story there, ×1.4 with a room or base there, halved while police are hunting hard (heat ≥ 60).
   - Familiar face: in villages everyone soon knows the new kid (after 2 days −40%, after 6 days −60% attention per thing
     you do); small towns −30% / −50%; towns after 4 / 10 days −20% / −35%; cities −15% / −30%.
   - Towns remember. Leave a town and come back later and people still remember you: notice picks up where you left it,
     minus 8 a day you were gone. (Brand-new places still start at 0.)
   - Odd jobs pay $7–18 instead of $5–15 (they cost you notice; they should be worth it).
   Odd-job pay reads SH.BAL in atlas.js. The rest is K.daily / A.mods / an A.arrive wrapper. Numbers live in BAL so they're easy to tune. */
(function (SH) {
  const K = SH.K, A = SH.Atlas; if (!K || !A) return;
  const G = () => SH.G;
  const BAL = SH.BAL = { fade: { village: 20, small: 18, town: 16, city: 14 }, coverX: 1.5, roomX: 1.4, hotX: 0.7, memFade: 8, fam: { village: [[3, 0.3], [2, 0.45], [1, 0.65]], small: [[3, 0.35], [2, 0.5], [1, 0.7]], town: [[4, 0.45], [2, 0.6], [1, 0.8]], city: [[4, 0.55], [2, 0.7], [1, 0.85]] }, jobMin: 7, jobSpread: 12 };
  const store = () => { const g = G(); return (g.noticeAt = g.noticeAt || {}); };
  /* arrive: save where you left, restore where you're going */
  const bArrive = A.arrive;
  A.arrive = function (to) {
    const g = G(), from = g.away, n0 = g.awayNotice || 0, t0 = g.t;
    if (from && from !== 'p0') store()[from] = { n: n0, t: t0 };
    const r = bArrive.apply(this, arguments);
    try {
      if (g.away && g.away !== from && !g.ended) {
        g.hereSince = g.t;
        const s = store()[g.away]; if (s) { const days = (g.t - s.t) / 1440; g.awayNotice = Math.max(g.awayNotice || 0, Math.round(s.n - days * BAL.memFade)); }
      }
    } catch (e) { console.warn('balance arrive', e); }
    return r;
  };
  /* people get used to you */
  K.daily.push((BAL.day = () => {
    const g = G(); if (!g.away || g.away === 'p0' || !g.awayNotice) return;
    const p = A.here(); if (!p) return;
    let d = BAL.fade[p.tier] || 5;
    if ((g.cover || {})[p.id]) d *= BAL.coverX;
    if ((g.room && g.room.pid === p.id && g.room.until > g.t) || (g.base && g.base.pid === p.id)) d *= BAL.roomX;
    if ((g.heat || 0) >= 60 && p.tier !== 'village') d *= BAL.hotX;   // the search is online; villages mostly aren't
    g.awayNotice = Math.max(0, Math.round((g.awayNotice - d) * 10) / 10);
  }));
  /* familiar face */
  A.mods = A.mods || [];
  A.mods.push((p) => { const g = G(); if (g.hereSince == null || !p) return 1; const days = (g.t - g.hereSince) / 1440; for (const [n, x] of (BAL.fam[p.tier] || [])) if (days >= n) return x; return 1; });
})(window.SH);
