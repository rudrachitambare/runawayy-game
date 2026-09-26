/* Route 9 pickup (unofficial stop), per-spot departures, shoplifting never sends you home, family names */
module.exports = async (run, ev, tp, p) => {
  await run(15, 'which services leave from which Harlow spot', async () => {
    tp(await ev(() => {
      const R = SH.Routes, N = R.net(), H = SH.Atlas.data().places.find((x) => x.home), out = [];
      const inf = N.ops.filter(R.informal), miss = inf.filter((o) => !N.routes.some((rt) => rt.op === o && rt.stops.includes(H.id)));
      out.push('informal ops: ' + inf.map((o) => `${o.n}[${o.type}/${o.style}]`).join(', '));
      out.push('informal ops NOT serving Harlow: ' + (miss.map((o) => o.n).join(', ') || 'none'));
      const g = SH.G; g.phase = 'run'; g.away = null;
      for (const loc of ['bus', 'pickup', 'station']) { g.loc = loc; SH.Routes.boardView(H); const acts = [...document.querySelectorAll('#modal .act')].map((a) => a.innerText.split('\n').slice(-2, -1)[0] || a.innerText).slice(0, 12); out.push(loc.toUpperCase() + ' board: ' + acts.join(' | ')); }
      return out.join('\n');
    }));
  });
  await run(15, 'book an unofficial ride → boards at the pickup → ride', async () => {
    tp(await ev(() => {
      const g = SH.G, R = SH.Routes, D = SH.Atlas.data(), H = D.places.find((x) => x.home);
      g.phase = 'home'; g.missingAt = 0; g.away = null; g.loc = 'home'; g.money = 100;
      const b = R.board(H, g.t).find((x) => R.informal(x.rt.op)); if (!b) return 'no informal departure';
      const to = b.rt.stops[b.rt.stops.length - 1], J = R.journeys(H, D.places.find((x) => x.id === to), g.t, 8).find((j) => R.informal(j.legs[0].rt.op));
      if (!J) return 'no journey';
      const r = SH.Tickets.book(J.key, to, { pay: 'cash', age: 15 }); if (!r.ok) return 'book failed: ' + r.msg;
      window._tk = r.tk; return `ticket ${r.tk.code}: ${r.tk.ops[0]} ${SH.Routes.fmt(r.tk.dep)} board at "${r.tk.pts[0]}" loc=${r.tk.loc}`;
    }));
    tp(await ev(() => { const g = SH.G; g.loc = 'bus'; SH.Tickets.board(_tk.code); return 'at depot: ' + [...document.querySelectorAll('.toast2')].map((x) => x.textContent).pop(); }));
    tp(await ev(() => { const g = SH.G; g.loc = 'pickup'; g.t = _tk.dep - 30; const acts = SH.Actions.list().acts.map((a) => a.label); return 'pickup actions: ' + acts.join(' | '); }));
    await ev(() => SH.Tickets.board(_tk.code)); await p.waitForTimeout(200); tp('DIALOG: ' + await ev(() => T.text()));
    await ev(() => T.clk('· Go$')); await p.waitForTimeout(300); await ev(() => { try { T.clk('Wait for it'); } catch (e) {} }); await p.waitForTimeout(500);
    for (let i = 0; i < 6; i++) { const o = await ev(() => { const m = document.querySelector('#modal:not(.hidden) .act'); if (!m || SH.G.away) return null; const t = T.text(); m.click(); return t.slice(0, 150); }); if (!o) break; tp('  > ' + o); await p.waitForTimeout(400); }
    tp(await ev(() => `after: phase ${SH.G.phase} away ${SH.G.away} (${SH.G.away ? SH.Atlas.here().name : '-'}) money ${SH.G.money} ticket ${_tk.st}`));
  });
  await run(15, 'walk-up from home at the pickup, painted board, ask a driver, scene art', async () => {
    await ev(() => { const g = SH.G; g.phase = 'home'; g.missingAt = 0; g.away = null; g.loc = 'pickup'; g.t = Math.floor(g.t / 1440) * 1440 + 1440 + 9 * 60; document.getElementById('modal').classList.add('hidden'); });
    tp(await ev(() => { const L = SH.Actions.list().acts; L.find((a) => /painted board/.test(a.label)).fn(); L.find((a) => /Ask a driver/.test(a.label)).fn(); return [...document.querySelectorAll('#log p, #log .le')].slice(-2).map((x) => x.innerText.replace(/\n/g, ' ')).join('\n'); }));
    await ev(() => { const d = document.getElementById('daycard'); d && d.remove(); SH.UI.render && SH.UI.render(); }); await p.waitForTimeout(800); await ev(() => { const d = document.getElementById('daycard'); d && d.remove(); }); await p.screenshot({ path: __dirname + '/shots/pickup_scene.png' });
    await ev(() => SH.Actions.list().acts.find((a) => /Rides leaving/.test(a.label)).fn()); await p.waitForTimeout(200); tp('WALK-UP: ' + await ev(() => T.text()));
    await ev(() => T.clk('Get on something')); await p.waitForTimeout(300); tp('phase ' + await ev(() => SH.G.phase) + ' · BOARD: ' + (await ev(() => T.text())).slice(0, 400));
  });
  await run(15, 'shoplifting on the run with high heat: caught, but never sent home', async () => {
    const r = await ev(() => { const g = SH.G; g.phase = 'run'; g.away = null; g.loc = 'store'; g.heat = 85; g.reported = true; document.getElementById('modal').classList.add('hidden');
      const c = SH.util.chance; SH.util.chance = () => true; try { SH.Actions.shoplift(); } finally { SH.util.chance = c; } return T.text(); });
    tp('CAUGHT: ' + r); await ev(() => T.clk('hungry')); await p.waitForTimeout(300);
    tp(await ev(() => `after: phase ${SH.G.phase} ended ${!!SH.G.ended} loc ${SH.G.loc} modal: ${((document.querySelector('#modal:not(.hidden) .mbox') || {}).innerText || '').slice(0, 80)}`));
  });
};
