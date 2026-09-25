const { chromium } = require('playwright-core');
(async () => {
  const b = await chromium.launch({ executablePath: '/usr/bin/chromium', args: ['--no-sandbox'] });
  const p = await b.newPage({ viewport: { width: 1366, height: 768 } });
  const errs = []; p.on('pageerror', (e) => errs.push(e.message + ' @ ' + (e.stack || '').split('\n')[1]));
  const M = async () => (await p.evaluate(() => document.querySelector('#modal').innerText)).replace(/\n+/g, ' / ');
  const hide = () => p.evaluate(() => { document.querySelector('#daycard') && document.querySelector('#daycard').remove(); const m = document.querySelector('#modal'); m.classList.add('hidden'); m.innerHTML = ''; });
  await p.goto('file:///home/user/smallhours/SmallHours.html'); await p.waitForTimeout(400);
  await p.click('#genSeg button[data-g="m"]'); await p.fill('#seedIn', 'feat7'); await p.click('#startBtn'); await p.waitForTimeout(600);
  console.log('INTRO', (await M()).slice(0, 700)); await hide();
  console.log(await p.evaluate(() => { const D = SH.Atlas.data(), H = D.places[0]; return D.places.map((x) => x.name + ':' + x.tier + ':' + SH.Atlas.miles(H, x) + ':' + SH.Atlas.modes(H, x).map((m) => m.k).join('/')).slice(0, 8).join(' | '); }));
  // stage at birch pre-run with friends present
  await p.evaluate(() => { SH.G.t = 19 * 60; SH.G.loc = 'birch'; SH.UI.renderAll(); }); await p.waitForTimeout(400);
  console.log('BIRCH actions:', await p.evaluate(() => [...document.querySelectorAll('#actions button, .hot:not(.off), .hs:not(.off)')].map((e) => e.innerText.replace(/\n/g, ' ')).slice(0, 14).join(' | ')));
  await p.screenshot({ path: 'shots/f_birch.png' });
  // host path: priya during run
  await p.evaluate(() => { const G = SH.G; Object.assign(SH.Friends.st('priya'), { met: true, knows: true, offer: true }); G.rel.priya = 70; SH.Run.start('bigNight', false); }); await hide();
  await p.evaluate(() => { SH.G.loc = 'birch'; SH.G.t = SH.G.t; }); 
  const lab = await p.evaluate(() => SH.Actions.list().acts.map((a) => a.label)); console.log('RUN birch:', lab.join(' | '));
  await p.evaluate(() => { const a = SH.Actions.list().acts.find((x) => /Priya/.test(x.label)); a && a.fn(); }); await p.waitForTimeout(300);
  console.log('KNOCK:', (await M()).slice(0, 500));
  await p.evaluate(() => { const b = [...document.querySelectorAll('#modal button')]; b[0] && b[0].click(); }); await p.waitForTimeout(300);
  console.log('NEXT:', (await M()).slice(0, 500), '| hideout', await p.evaluate(() => JSON.stringify(SH.G.hideout)));
  await hide();
  // travel
  const r = await p.evaluate(() => { const D = SH.Atlas.data(), H = D.places[0]; const v = D.places.find((x) => !x.home && SH.Atlas.modes(H, x).some((m) => !m.blocked)); SH.G.hideout = null; SH.G.money = 30; SH.Atlas.go(v.id, SH.Atlas.modes(H, v).find((m) => !m.blocked).k); return v.name + ' ' + v.tier + ' away=' + SH.G.away; });
  console.log('GO', r); await p.waitForTimeout(400); console.log('TRIP:', (await M()).slice(0, 500));
  await p.evaluate(() => { const b = [...document.querySelectorAll('#modal button')]; b[b.length - 1].click(); }); await p.waitForTimeout(300);
  console.log('HUB:', (await M()).slice(0, 600)); await p.screenshot({ path: 'shots/f_hub.png' });
  for (const k of ['food', 'wifi', 'work', 'walk', 'sleep']) { await hide(); await p.evaluate((k) => SH.Atlas.act(k), k); await p.waitForTimeout(250); console.log(k.toUpperCase() + ':', (await M()).slice(0, 260), 'notice=', await p.evaluate(() => SH.G.awayNotice)); }
  await hide(); await p.evaluate(() => SH.Atlas.act('talk')); await p.waitForTimeout(300);
  for (const t of ['hi', 'im just visiting my aunt', 'where can i get food', 'i ran away and i dont feel safe at home']) { await p.evaluate((t) => { const i = document.querySelector('#tin'); i.value = t; i.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true })); const f = i.closest('form'); if (f) f.requestSubmit && 0; }, t); await p.waitForTimeout(1800); }
  console.log('LOCALTALK:', (await M()).slice(-700));
  console.log('errors', errs); await b.close();
})();
