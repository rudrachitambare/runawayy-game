// cell signal + village internet test
const { chromium } = require('playwright-core');
const ROOT = 'file://' + require('path').resolve(__dirname, '../src/index.html');
(async () => {
  const b = await chromium.launch({ executablePath: '/usr/bin/chromium', args: ['--no-sandbox'] });
  const p = await b.newPage({ viewport: { width: 1400, height: 900 } }); const errs = [];
  p.on('pageerror', (e) => errs.push(e.message)); p.on('console', (m) => { if (m.type() === 'error') errs.push('console: ' + m.text()); });
  await p.goto(ROOT); await p.waitForTimeout(500); await p.click('#startBtn'); await p.waitForTimeout(400);
  const hide = () => p.evaluate(() => { const d = document.querySelector('#daycard'); d && d.remove(); document.querySelector('#modal').classList.add('hidden'); });
  await hide(); await p.evaluate(() => { SH.Run.start('bigNight', false); }); await hide();
  console.log(await p.evaluate(() => { const D = SH.Atlas.data(), N = SH.Net, out = {};
    D.places.forEach((x) => { const c = N.cell(x); const k = x.tier; out[k] = out[k] || {}; out[k][c.gen] = (out[k][c.gen] || 0) + 1; });
    const v = D.places.filter((x) => x.tier === 'village'), ppl = { none: 0, online: 0, cares: 0 }; v.forEach((x) => x.people.forEach((w) => ppl[N.person(x, w)]++));
    return 'gens ' + JSON.stringify(out) + '\nvillage people ' + JSON.stringify(ppl) + '\nposterMult village avg ' + (v.reduce((s, x) => s + N.posterMult(x), 0) / v.length).toFixed(2) + ', town ' + N.posterMult(D.places[0]); }));
  // go to a village: signal over a day
  console.log(await p.evaluate(() => { const G = SH.G, D = SH.Atlas.data(), v = D.places.find((x) => x.tier === 'village' && SH.Net.cell(x).gen !== 'LTE'); G.away = v.id; const t0 = G.t, row = [];
    for (let h = 0; h < 24; h++) { G.t = t0 + h * 60; const s = SH.Net.signal(); row.push(s.bars + s.gen); } G.t = t0; SH.Net.state().public = null;
    return `${v.name} (${SH.Net.cell(v).gen}) by hour: ${row.join(' ')}`; }));
  // loading time in the browser on village signal vs wifi
  const timing = async (wifi) => p.evaluate(async (wifi) => { const G = SH.G; SH.Net.state().public = wifi ? { n: 'x', at: G.away } : null; G.sigBoost = { at: G.away, until: G.t + 60, b: 0 };
    G.t = G.t; let s = SH.Net.signal(); if (!wifi && s.bars === 0) { G.sigBoost.b = 1; s = SH.Net.signal(); }
    SH.Phone.open('browser'); SH.Browser.go('avermaps.av'); const t0 = performance.now();
    for (let i = 0; i < 100; i++) { await new Promise((r) => setTimeout(r, 100)); const txt = document.querySelector('#pbody').innerText; if (/timed out/.test(txt)) return `${wifi ? 'wifi' : s.bars + ' bars ' + s.gen}: TIMED OUT after ${Math.round(performance.now() - t0)}ms`; if (!/Loading/.test(txt)) return `${wifi ? 'wifi' : s.bars + ' bars ' + s.gen}: loaded in ${Math.round(performance.now() - t0)}ms`; }
    return 'never loaded'; }, wifi);
  console.log(await timing(false)); console.log(await timing(true));
  await p.evaluate(() => { SH.Net.state().public = null; SH.Browser.go('seekr.av'); }); await p.waitForTimeout(150);
  await p.screenshot({ path: __dirname + '/shots/cell_loading.png' });
  // no service (storm + weak village) blocks data; status bar
  console.log(await p.evaluate(() => { const G = SH.G; const sm = SH.Atlas.data().places.find((x) => x.tier === 'small' && !x.grandma); const keep = G.away; G.away = sm.id; G.sigBoost = { at: G.away, until: G.t + 60, b: -9 }; const can = SH.Net.canData(); SH.Phone.open('browser'); const txt = document.querySelector('#pbody').innerText.replace(/\n+/g, ' / ').slice(0, 120); const sb = document.querySelector('#sbar').innerText; G.sigBoost = null; G.away = keep; SH.Phone.render(); return `no service: canData=${can} page="${txt}" sbar="${sb}" → after: "${document.querySelector('#sbar').innerText}"`; }));
  // atlas card + hub + local talk
  console.log(await p.evaluate(() => { const v = SH.Atlas.here(); const h = SH.Atlas.card(v); const d = document.createElement('div'); d.innerHTML = h; return [...d.querySelectorAll('.arow')].map((x) => x.innerText).filter((x) => /📶|🌐/.test(x)).join('\n'); }));
  console.log(await p.evaluate(() => { SH.Atlas.hub(); return [...document.querySelectorAll('#modal .act')].map((x) => x.innerText.split('\n')[1] || x.innerText).filter((x) => /signal/i.test(x)).join(' | '); }));
  console.log(await p.evaluate(() => { const v = SH.Atlas.here(), out = []; SH.G.reported = true; v.people.forEach((w) => { const c = { turn: 1, mem: {}, used: {}, opts: { local: w, place: v } }; const an = SH.NLP.analyze ? SH.NLP.analyze('do you have wifi here') : { t: 'do you have wifi here', has: () => false }; const r = SH.Brain.local(an, c); out.push(`${w.n} [${SH.Net.person(v, w)}]: ${r.say}`); }); return out.join('\n'); }));
  await hide(); await p.evaluate(() => SH.Phone.open('net')); await p.waitForTimeout(700);
  console.log('NET:', (await p.evaluate(() => document.querySelector('#pbody').innerText)).replace(/\n+/g, ' / ').slice(0, 300));
  console.log('errors', errs); await b.close();
})();
