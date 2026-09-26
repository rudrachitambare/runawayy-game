// E2 test: bigger Atlas, route network, riding, departures board, drive fix, new endings
const { chromium } = require('playwright-core');
const ROOT = 'file://' + require('path').resolve(__dirname, '../src/index.html');
(async () => {
  const b = await chromium.launch({ executablePath: '/usr/bin/chromium', args: ['--no-sandbox'] });
  const p = await b.newPage({ viewport: { width: 1400, height: 900 } }); const errs = [];
  p.on('pageerror', (e) => errs.push(e.message)); p.on('console', (m) => { if (m.type() === 'error' || /EndX: no ending/.test(m.text())) errs.push('console: ' + m.text()); });
  await p.goto(ROOT); await p.waitForTimeout(500); await p.click('#startBtn'); await p.waitForTimeout(400); await p.evaluate(() => { SH.Net.instant = true; });
  const hide = () => p.evaluate(() => { const d = document.querySelector('#daycard'); d && d.remove(); document.querySelector('#modal').classList.add('hidden'); });
  await hide();
  console.log(await p.evaluate(() => { const D = SH.Atlas.data(), N = SH.Routes.net(), c = {}; D.places.forEach((x) => c[x.tier] = (c[x.tier] || 0) + 1);
    return `places ${D.places.length} ${JSON.stringify(c)} lines ${D.lines.map((l) => l.n + ':' + l.stops.length).join(',')} | ops ${N.ops.length}: ${N.ops.map((o) => o.n + '[' + o.type + '/' + o.style + ']').join(', ')} | routes ${N.routes.length} | served ${D.places.filter((x) => x.served).length} | atlas in save: ${!!SH.G.atlas}`; }));
  // start the run, then ride
  await p.evaluate(() => { SH.Run.start('bigNight', false); }); await hide();
  const r1 = await p.evaluate(() => { const G = SH.G, A = SH.Atlas, D = A.data(); G.money = 500; Math._r = Math.random; Math.random = () => 0.99; // no refusals/incidents
    const H = A.here(); const dest = D.places.find((x) => x.tier === 'town' && !x.home && SH.Routes.journeys(H, x, G.t, 1).length);
    const ms = A.modes(H, dest).filter((m) => m.jr); const m = ms[0]; const t0 = G.t, $0 = G.money;
    A.go(dest.id, m.k); document.querySelectorAll('#modal .act').forEach((b) => { if (/Wait for it/.test(b.textContent)) b.click(); });
    return `to ${dest.name}: ${ms.length} options; took "${m.n}" note="${m.note}" → away=${G.away === dest.id} spent=$${$0 - G.money} mins=${G.t - t0}`; });
  console.log(r1); await hide();
  // departures board from here
  const r2 = await p.evaluate(() => { const A = SH.Atlas, p0 = A.here(); SH.Routes.boardView(p0); const t = document.querySelector('#modal').innerText.replace(/\n+/g, ' / ').slice(0, 400); const first = document.querySelector('#modal .act'); first.click(); const t2 = document.querySelector('#modal').innerText.replace(/\n+/g, ' / ').slice(0, 250); const stop = document.querySelector('#modal .act'); const before = SH.G.away; stop.click(); document.querySelectorAll('#modal .act').forEach((b) => { if (/Wait for it/.test(b.textContent)) b.click(); }); return 'BOARD: ' + t + '\nSTOPS: ' + t2 + '\nmoved: ' + before + ' -> ' + SH.G.away; });
  console.log(r2); await hide();
  // group that doesn't fit + transfer journeys
  const r3 = await p.evaluate(() => { const A = SH.Atlas, D = A.data(), H = A.here(), G = SH.G; let tr = 0, all = 0; D.places.forEach((x) => { if (x === H) return; const J = SH.Routes.journeys(H, x, G.t, 5); all += J.length ? 1 : 0; tr += J.some((j) => j.legs.length > 1) ? 1 : 0; }); return `reachable from ${H.name}: ${all}/${D.places.length - 1}, with a change: ${tr}`; });
  console.log(r3);
  // drive fix
  const r4 = await p.evaluate(() => { Math.random = Math._r; const G = SH.G, A = SH.Atlas, D = A.data(); G.away = null; const H = D.places[0]; const out = {};
    for (let i = 0; i < 20; i++) { G.away = null; G.ended = false; G.veh = { n: 'car', type: 'car', at: H.id, parts: { battery: 1, tires: 1, oil: 1, plugs: 1 }, work: 100, fuel: 100, running: true, warm: 10, seats: 4, nights: 0 }; G.skills = { drive: 80 }; const to = D.places[3]; A.go(to.id, 'drive');
      const k = G.ended ? 'ended' : (G.away === to.id && G.veh.at === to.id) ? 'both-arrived' : (G.away === to.id) ? 'CAR-LEFT-BEHIND' : (G.veh.at === to.id) ? 'CAR-TELEPORTED' : 'nothing'; out[k] = (out[k] || 0) + 1; document.querySelector('#modal').classList.add('hidden'); }
    return 'drive x20: ' + JSON.stringify(out); });
  console.log(r4);
  // each new ending renders from the engine (not the fallback)
  const r5 = await p.evaluate(() => { const out = []; for (const k of ['conductor', 'oldTrain', 'kindDriver', 'posterDriver', 'busAgent', 'nightbus', 'tempoBreak', 'railCapital', 'cheapDriver']) { SH.G.ended = false; SH.EndX.trigger(k, {}); out.push(k + '=' + (SH.G.endKey === k ? 'ok' : 'BAD:' + SH.G.endKey)); } return out.join(' '); });
  console.log(r5);
  // atlas phone view: zoom + search + highlight; screenshot
  await p.evaluate(() => { SH.G.ended = false; SH.G.phase = 'run'; document.querySelector('#modal').classList.add('hidden'); SH.G.away = null; const D = SH.Atlas.data(); SH.Atlas.sel = D.places[2].id; SH.Phone.open('atlas'); });
  await p.waitForTimeout(300); await p.screenshot({ path: __dirname + '/shots/e2_atlas.png' });
  await p.click('#atp'); await p.waitForTimeout(200); await p.click('#atp'); await p.waitForTimeout(200);
  await p.screenshot({ path: __dirname + '/shots/e2_zoom.png' });
  await p.fill('#atq', 'ce'); await p.waitForTimeout(200); console.log('search hits:', await p.evaluate(() => [...document.querySelectorAll('.athit')].map((b) => b.textContent).join(' | ')));
  await p.evaluate(() => { SH.Browser.go('rides.av'); SH.Phone.open('browser'); }); await p.waitForTimeout(300);
  console.log('RIDES:', (await p.evaluate(() => document.querySelector('#pbody').innerText)).replace(/\n+/g, ' / ').slice(0, 500));
  await p.screenshot({ path: __dirname + '/shots/e2_rides.png' });
  console.log('errors', errs); await b.close();
})();
