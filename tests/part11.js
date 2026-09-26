/* balance: notice over three weeks of ordinary days */
module.exports = async (run, ev, tp, p) => {
  await run(11, 'notice over 21 days', async () => {
    tp(await ev(() => {
      const A = SH.Atlas, B = SH.BAL, out = [];
      const sim = (tier, opts) => {
        const g = SH.G, v = T.go(tier, (x) => !x.grandma); g.ended = false; g.reported = !!opts.rep; g.heat = opts.heat || 0; g.party = opts.party ? ['nia'] : []; g.cover = {}; g.room = null; g.base = null; g.look = {};
        if (opts.cover) g.cover[v.id] = { name: 'Riley', story: 'visiting', told: [] }; if (opts.room) g.room = { pid: v.id, until: g.t + 60 * 1440 };
        g.hereSince = g.t; g.awayNotice = 0; const base = g.t, fade = B.fade, f0 = Object.assign({}, fade); const fam0 = B.fam; if (opts.old) { Object.keys(fade).forEach((k) => (fade[k] = 0)); B.fam = {}; }
        const found = { day: null }, trace = [];
        const noticed = (k) => { g.awayNotice += Math.round(100 * v.notice * k * (g.reported ? (SH.Net.posterMult ? SH.Net.posterMult(v) : 1.6) : 0.8) * (g.party.length ? 1.4 : 1) * A.mods.reduce((m, f) => { try { return m * f(v, k); } catch (e) { return m; } }, 1)); };
        for (let d = 1; d <= 21; d++) { noticed(0.5); noticed(0.3); noticed(0.3); if (d % 2) noticed(0.9); g.t = base + d * 1440; B.day(); trace.push(Math.round(g.awayNotice)); if (g.awayNotice >= 100 && !found.day) found.day = d; }
        Object.assign(fade, f0); B.fam = fam0; g.t = base;
        return `${tier}${opts.rep ? ' reported' : ''}${opts.party ? ' +friend' : ''}${opts.cover ? ' cover' : ''}${opts.room ? ' room' : ''}${opts.old ? ' [OLD]' : ''}: ${found.day ? 'FOUND day ' + found.day : 'day21 notice ' + trace[20]} | ${trace.filter((_, i) => i % 3 === 0).join(' ')}`;
      };
      [['village', {}], ['village', { cover: 1 }], ['village', { cover: 1, old: 1 }], ['small', {}], ['small', { cover: 1 }], ['small', { cover: 1, old: 1 }], ['town', {}], ['town', { old: 1 }], ['town', { rep: 1, party: 1, cover: 1, room: 1 }], ['town', { rep: 1, party: 1, cover: 1, room: 1, old: 1 }], ['town', { rep: 1, party: 1, heat: 70 }], ['city', { rep: 1, party: 1 }], ['city', { rep: 1, party: 1, old: 1 }]].forEach(([t, o]) => out.push(sim(t, o)));
      return out.join('\n');
    }));
    tp(await ev(() => { const g = SH.G, A = SH.Atlas, D = A.data(); const a = D.places.find((x) => x.tier === 'town' && !x.grandma && !x.home && x.id !== 'p0'), b = D.places.find((x) => x.tier === 'small' && !x.grandma); g.ended = false; A.arrive(a, { mins: 30, e: 1 }); g.awayNotice = 60; const t0 = g.t; A.arrive(b, { mins: 30, e: 1 }); const nb = g.awayNotice; g.t += 2 * 1440; A.arrive(a, { mins: 30, e: 1 }); return `left ${a.name} at 60 → ${b.name} starts at ${nb} → back in ${a.name} 2 days later: ${g.awayNotice} (remembered)`; }));
  });
};
