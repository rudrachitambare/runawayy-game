/* websites: AverRides booking + boarding, AverMaps, Seekr instant answers, TubeYou, PIP tickets */
module.exports = async (run, ev, tp, p) => {
  const page = () => ev(() => (document.querySelector('#pbody .mapside') || document.querySelector('#pbody .appbody') || {}).innerText || '(no page)');
  const go = async (url) => { await ev((u) => { SH.Phone.open('browser'); SH.Browser.go(u); }, url); await p.waitForTimeout(250); };
  await run(14, 'browser home + AverRides plan and search', async () => {
    await ev(() => { const g = SH.G; g.phase = 'home'; g.missingAt = 0; g.away = null; g.loc = 'home'; g.money = 120; g.heat = 0; g.t = Math.floor(g.t / 1440) * 1440 + 9 * 60; });
    await go('home'); tp('HOME: ' + (await page()).replace(/\n+/g, ' | '));
    await go('rides.av'); tp('PLAN: ' + (await page()).replace(/\n+/g, ' | '));
    await ev(() => { document.getElementById('rt').value = 'Cedar Falls'; SH.Rides.find(); }); await p.waitForTimeout(250);
    tp('FIND: ' + (await page()).replace(/\n+/g, ' | '));
    await ev(() => { document.getElementById('rt').value = 'Nowheresville'; SH.Rides.find(); }); await p.waitForTimeout(200);
    tp('BAD NAME: ' + (await page()).replace(/\n+/g, ' | ').slice(0, 200));
  });
  await run(14, 'book (cash) → ticket → board from home = running away → ride', async () => {
    const r = await ev(() => { const g = SH.G, D = SH.Atlas.data(), home = D.places[0], cf = D.places.find((x) => x.grandma);
      const J = SH.Routes.journeys(home, cf, g.t, 7), jr = J.find((j) => j.legs.every((l) => !SH.Tickets.checks(l.rt.op))) || J[0]; if (!jr) return 'no journeys';
      SH.Browser.go('rides.av/trip/' + encodeURIComponent(jr.key) + '?to=' + cf.id); return 'trip ' + jr.key + ' strict=' + jr.legs.some((l) => SH.Tickets.checks(l.rt.op)); });
    tp(r); await p.waitForTimeout(250); tp('TRIP: ' + (await page()).replace(/\n+/g, ' | '));
    await ev(() => { const a = document.getElementById('ra'); if (a) a.value = '15'; const pay = document.getElementById('rp'); pay.value = 'cash'; document.querySelector('.wbtn.ok').click(); }); await p.waitForTimeout(300);
    tp('TICKETS: ' + (await page()).replace(/\n+/g, ' | '));
    tp(await ev(() => { const t = SH.Tickets.all()[0]; return t ? `ticket ${t.code} ${t.fromN}->${t.toN} dep ${SH.Routes.fmt(t.dep)} loc=${t.loc} pts=${t.pts.join(' / ')} pay=${t.pay} lied=${t.lied}` : 'NO TICKET'; }));
    tp(await ev(() => { const t = SH.Tickets.all()[0]; SH.G.loc = 'home'; const a1 = SH.Actions.list().acts.map((x) => x.label).filter((l) => /Board/.test(l)); SH.G.loc = t.loc || 'bus'; const a2 = SH.Actions.list().acts.map((x) => x.label).filter((l) => /Board/.test(l)); return 'board action at home: ' + JSON.stringify(a1) + ' | at ' + SH.G.loc + ': ' + JSON.stringify(a2); }));
    tp('too early: ' + await ev(() => { SH.Tickets.board(SH.Tickets.all()[0].code); return (document.querySelector('#toast') || {}).textContent; })); await ev(() => { SH.G.t = SH.Tickets.all()[0].dep - 40; }); await ev(() => { SH.Tickets.board(SH.Tickets.all()[0].code); }); await p.waitForTimeout(200); tp('DIALOG: ' + await ev(() => T.text())); await ev(() => T.clk('· Go$')); await p.waitForTimeout(300);
    tp('DIALOG2: ' + await ev(() => T.text())); await ev(() => { try { T.clk('Wait for it'); } catch (e) {} }); await p.waitForTimeout(600);
    tp(await ev(() => { const g = SH.G, t = SH.Tickets.all()[0]; return `phase ${g.phase} away ${g.away} (${g.away ? SH.Atlas.here().name : '-'}) money ${g.money} ticket ${t.st} | modal: ` + ((document.querySelector('#modal:not(.hidden) .mbox') || {}).innerText || '').slice(0, 200).replace(/\n+/g, ' / ') + ' | log: ' + [...document.querySelectorAll('#log .ln, #log p, #log div')].slice(-4).map((x) => x.innerText).join(' / ').slice(0, 300); }));
  });
  await run(14, 'finish the ride', async () => { for (let i = 0; i < 6; i++) { const o = await ev(() => { const m = document.querySelector('#modal:not(.hidden) .act'); if (!m) return null; const t = T.text(); m.click(); return t.slice(0, 160); }); if (!o) break; tp('  > ' + o); await p.waitForTimeout(400); }
    tp(await ev(() => { const g = SH.G; return `after ride: away ${g.away} (${g.away ? SH.Atlas.here().name : '-'}) money ${g.money} time ${SH.Routes.fmt(g.t)}`; })); });
  await run(14, 'card booking on the run, strict company age rule, missed, cancel refund', async () => {
    tp(await ev(() => { const g = SH.G; g.phase = 'run'; g.away = null; g.heat = 10; SH.Bank.state().bal = 80; SH.Bank.state().frozen = false; const D = SH.Atlas.data(), home = D.places[0];
      const all = D.places.filter((x) => x.id !== home.id).flatMap((to) => SH.Routes.journeys(home, to, g.t, 3).map((j) => [j, to])).slice(0, 60);
      const strict = all.find(([j]) => j.legs.some((l) => SH.Tickets.checks(l.rt.op))), loose = all.find(([j]) => j.legs.every((l) => !SH.Tickets.checks(l.rt.op) && !l.rt.op.S.cash));
      const out = [];
      if (strict) { out.push('strict age 12: ' + JSON.stringify(SH.Tickets.book(strict[0].key, strict[1].id, { pay: 'card', age: 12 }).msg)); const r = SH.Tickets.book(strict[0].key, strict[1].id, { pay: 'card', age: 18 }); out.push('strict age 18: ok=' + r.ok + ' ' + (r.msg || r.tk.code) + ' bal ' + SH.Bank.state().bal + ' heat ' + g.heat); }
      if (loose) { const r = SH.Tickets.book(loose[0].key, loose[1].id, { pay: 'card' }); out.push('loose card: ok=' + r.ok + ' ' + (r.msg || '') + ' cost ' + (r.tk || {}).cost + ' bal ' + SH.Bank.state().bal); if (r.ok) { SH.Tickets.cancel(r.tk.code); out.push('after cancel: ' + r.tk.st + ' bal ' + SH.Bank.state().bal); } }
      const cash = all.find(([j]) => j.legs.some((l) => l.rt.op.S.cash)); if (cash) out.push('cash-only + card: ' + SH.Tickets.book(cash[0].key, cash[1].id, { pay: 'card' }).msg);
      const t0 = SH.Tickets.all().find((t) => t.st === 'booked'); if (t0) { const keep = g.t; g.t = t0.dep + 10; out.push('after departure: ' + SH.Tickets.state(t0)); g.t = keep; }
      return out.join('\n'); }));
    await go('rides.av/tickets'); tp('MY TRIPS: ' + (await page()).replace(/\n+/g, ' | ').slice(0, 900));
  });
  await run(14, 'AverMaps: explore, tap a dot, place page, directions, nearby', async () => {
    await ev(() => { SH.G.away = null; SH.G.phase = 'run'; });
    await go('avermaps.av'); tp('EXPLORE: ' + (await page()).replace(/\n+/g, ' | ').slice(0, 700));
    await ev(() => { const g = [...document.querySelectorAll('#ammap .apl')].find((x) => x.dataset.id !== 'p0'); g.dispatchEvent(new MouseEvent('click', { bubbles: true })); }); await p.waitForTimeout(200);
    tp('after tap url=' + (await ev(() => SH.Browser.url)) + ' :: ' + (await page()).replace(/\n+/g, ' | ').slice(0, 900));
    await ev(() => SH.Browser.go('avermaps.av/dir?f=p0&t=' + SH.Atlas.data().places.find((x) => x.grandma).id)); await p.waitForTimeout(200); tp('DIRECTIONS: ' + (await page()).replace(/\n+/g, ' | ').slice(0, 800));
    await go('avermaps.av/near?k=nopolice'); tp('NEARBY: ' + (await page()).replace(/\n+/g, ' | ').slice(0, 500));
  });
  await run(14, 'Seekr instant answers, TubeYou, company Book rows, PIP', async () => {
    await ev(() => SH.Browser.search('bus to cedar falls')); await p.waitForTimeout(200); tp('SEEKR: ' + (await page()).replace(/\n+/g, ' | ').slice(0, 500));
    await ev(() => SH.Browser.search(SH.Atlas.data().places[5].name)); await p.waitForTimeout(200); tp('SEEKR place: ' + (await page()).replace(/\n+/g, ' | ').slice(0, 300));
    await go('tubeyou.av/v/0'); tp('TUBEYOU: ' + (await page()).replace(/\n+/g, ' | ').slice(0, 300));
    await go('cheapride.av'); tp('CHEAPRIDE: ' + (await page()).replace(/\n+/g, ' | ').slice(0, 400));
    await go('stayfinder.av'); tp('STAYFINDER: ' + (await page()).replace(/\n+/g, ' | ').slice(-300));
    tp('PIP: ' + await ev(() => SH.PIP.reply('where do i board')));
  });
};
