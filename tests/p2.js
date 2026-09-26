const { chromium } = require('playwright-core');
(async () => {
  const b = await chromium.launch({ executablePath: '/usr/bin/chromium', args: ['--no-sandbox'] });
  const p = await b.newPage(); const errs = []; p.on('pageerror', (e) => errs.push(e.message));
  await p.goto('file:///home/user/runawayy-game/src/index.html'); await p.waitForTimeout(500); await p.click('#startBtn'); await p.waitForTimeout(400);
  console.log(await p.evaluate(() => { const o = [], G = SH.G, A = SH.Atlas, D = A.data(), H = D.places[0]; document.querySelector('#modal').classList.add('hidden');
    G.owned = ['x_kick', 'x_escoot']; const far = D.places.find((x) => A.miles(H, x) > 30 && x.tier !== 'village');
    o.push('modes near: ' + A.modes(H, D.places[3]).map((m) => m.k).join(',')); o.push('modes far: ' + A.modes(H, far).map((m) => m.k + ':' + m.cost).join(','));
    SH.Run.start('bigNight', false); document.querySelector('#modal').classList.add('hidden'); G.money = 900;
    SH.Junk.buy(H, SH.Junk.yard(H).cars[0]); document.querySelector('#modal').classList.add('hidden');
    const v = G.veh; Object.keys(v.parts).forEach((k) => v.parts[k] = true); v.work = 100; SH.Junk.check(); v.fuel = 100;
    o.push('veh running=' + v.running + ' modes: ' + A.modes(H, D.places[3]).map((m) => m.k).join(','));
    return o.join('\n'); }));
  await p.evaluate(() => { SH.G.skills = { drive: 0 }; SH.Atlas.go(SH.Atlas.data().places[3].id, 'drive'); }); await p.waitForTimeout(300);
  console.log('after drive:', (await p.evaluate(() => document.querySelector('#modal').innerText)).replace(/\n+/g, ' / ').slice(0, 250), 'ended=', await p.evaluate(() => SH.G.ended));
  console.log('footer:', await p.evaluate(() => SH.EndX.total()));
  console.log('errors', errs); await b.close();
})();
