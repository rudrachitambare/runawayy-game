const { chromium } = require('playwright-core');
(async () => {
  const b = await chromium.launch({ executablePath: '/usr/bin/chromium', args: ['--no-sandbox'] });
  const p = await b.newPage({ viewport: { width: 1366, height: 768 } });
  const errs = []; p.on('pageerror', (e) => errs.push(e.message + ' @ ' + (e.stack || '').split('\n')[1]));
  p.on('console', (m) => { if (m.type() === 'warning' || m.type() === 'error') errs.push('console: ' + m.text().slice(0, 200)); });
  await p.goto('file:///home/user/runawayy-game/src/index.html'); await p.waitForTimeout(500); await p.click('#startBtn'); await p.waitForTimeout(500);
  const hide = () => p.evaluate(() => { document.querySelector('#daycard') && document.querySelector('#daycard').remove(); const m = document.querySelector('#modal'); m.classList.add('hidden'); m.innerHTML = ''; });
  const M = async () => (await p.evaluate(() => document.querySelector('#modal').innerText)).replace(/\n+/g, ' / ').slice(0, 420);
  await hide();
  await p.evaluate(() => { SH.Browser.go('avermaps.av'); SH.Phone.open('browser'); }); await p.waitForTimeout(150);
  console.log('MAPS:', (await p.evaluate(() => document.querySelector('#pbody').innerText)).replace(/\n+/g, ' | ').slice(0, 300));
  await p.evaluate(() => { const G = SH.G; SH.Shop.order('x_powerbank', 'cash'); SH.Shop.order('x_painkiller', 'card'); SH.Shop.order('x_kick', 'card'); G.t += 1440 + 300; G.loc = 'store'; G.money = 60; SH.Bank.state().bal = 80; });
  console.log('store acts:', await p.evaluate(() => SH.Actions.list().acts.map((a) => a.label).slice(0, 3).join(' | ')));
  await p.evaluate(() => SH.Shop.pickup()); await p.waitForTimeout(150); console.log('PICKUP:', await M()); await hide();
  console.log('bag/owned:', await p.evaluate(() => SH.G.bag.filter((x) => x.startsWith('x_')).join(',') + ' / ' + (SH.G.owned || []).join(',') + ' hasBike=' + SH.f('hasBike') + ' kick=' + SH.f('hasRide_kick')));
  // run + card use → mom sees
  const r = await p.evaluate(() => { const G = SH.G, o = []; G.loc = 'park'; SH.Run.start('bigNight', false); document.querySelector('#modal').classList.add('hidden'); G.loc = 'mall'; G.t += 60; SH.Bank.pay(4, 'Pretzel stand'); o.push('revealed=' + G.revealed + ' heat=' + G.heat); return o.join(' '); });
  console.log(r); await p.waitForTimeout(1800); console.log('mom thread:', await p.evaluate(() => (SH.G.threads.mom || []).slice(-1).map((m) => m.text).join('')));
  // offline incoming call
  console.log('call offline:', await p.evaluate(() => { SH.Net.state().mb = 0; SH.G.loc = 'park'; let res = 'none'; SH.Phone.incoming('jordan', () => res = 'answered', (missed) => res = 'declined missed=' + missed); SH.Net.state().mb = 800; return res; }));
  // go to another town, gig + meetup + locker there
  const r2 = await p.evaluate(() => { const G = SH.G, A = SH.Atlas, D = A.data(), H = D.places[0]; const v = D.places.find((x) => !x.home && A.modes(H, x).some((m) => !m.blocked)); G.money = 40; A.go(v.id, A.modes(H, v).find((m) => !m.blocked).k); return 'away=' + G.away + ' ' + v.name + ' ' + v.tier; });
  console.log(r2); await p.waitForTimeout(300); await hide();
  const r3 = await p.evaluate(() => { const G = SH.G; SH.Shop.order('x_sleepbag', 'cash'); G.work = G.work || { apps: {}, gigs: [], fired: {} }; G.work.gigs.push({ key: 'yard', title: 'Leaf raking', where: 'here', loc: 'birch', place: G.away, h: [0, 24], days: 'any', pay: '$18/job', rate: 18, per: 'job', shifts: 0 }); const L = SH.Shop.listings(); const f = L.find((l) => l.kind === 'fair'); SH.Shop.swapBuy(f.id); G.t += 1440 + 400 - (G.t % 1440) + 300; return 'ok'; });
  await p.evaluate(() => SH.Atlas.hub()); await p.waitForTimeout(200);
  console.log('HUB:', await M());
  await p.evaluate(() => { const b = [...document.querySelectorAll('#modal .choice, #modal button')].find((x) => /Work: Leaf/.test(x.innerText)); b && b.click(); }); await p.waitForTimeout(200); console.log('GIG:', await M());
  console.log('errors', errs); await b.close();
})();
