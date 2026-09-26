// Parts 2–6 test harness. Usage: node parts.js 2 3 ... (no args = all)
const { chromium } = require('playwright-core');
const ROOT = 'file://' + require('path').resolve(__dirname, '../src/index.html');
const want = process.argv.slice(2).map(Number);
(async () => {
  const b = await chromium.launch({ executablePath: '/usr/bin/chromium', args: ['--no-sandbox'] });
  const errs = []; let p;
  const fresh = async () => {
    p = await b.newPage({ viewport: { width: 1400, height: 900 } }); 
  p.on('pageerror', (e) => errs.push(e.message)); p.on('console', (m) => { if (m.type() === 'error' || /warn/.test(m.type())) errs.push(m.type() + ': ' + m.text()); });
  await p.goto(ROOT); await p.waitForTimeout(500); await p.click('#startBtn'); await p.waitForTimeout(400);
  await p.evaluate(() => { SH.Net.instant = true; const d = document.querySelector('#daycard'); d && d.remove(); SH.Run.start('bigNight', false);
    window.T = { acts: () => [...document.querySelectorAll('#modal .act')].map((x) => x.innerText.replace(/\n/g, ' · ')),
      text: () => (document.querySelector('#modal .mbox') || document.querySelector('#modal')).innerText.replace(/\n+/g, ' / '),
      clk: (re) => { const a = [...document.querySelectorAll('#modal .act')].find((x) => new RegExp(re, 'i').test(x.innerText.replace(/\n/g, ' · '))); if (!a) throw new Error('no choice /' + re + '/ in: ' + T.acts().join(' | ')); a.click(); return T.text(); },
      go: (tier, f) => { const D = SH.Atlas.data(), v = D.places.find((x) => x.tier === tier && !x.grandma && !x.home && (!f || f(x))); SH.G.away = v.id; SH.G.awayNotice = 0; return v; },
      day: () => { const G = SH.G; G.t = Math.floor(G.t / 1440) * 1440 + 1440 + 10 * 60; } };
    T.day(); });
  };
  const run = async (n, name, fn) => { if (want.length && !want.includes(n)) return; console.log(`\n=== PART ${n}: ${name}`); try { await fn(); } catch (e) { console.log('FAIL', e.message); errs.push('part' + n + ': ' + e.message); } };
  const ev = (f, a) => p.evaluate(f, a);
  const tp = (x) => console.log(typeof x === 'string' ? x.slice(0, 600) : JSON.stringify(x));
  for (const f of require('fs').readdirSync(__dirname).filter((x) => /^part\d\.js$/.test(x)).sort()) { const n = +f.match(/\d/)[0]; if (want.length && !want.includes(n)) continue; await fresh(); await require('./' + f)(run, ev, tp, p); await p.close(); }
  console.log('\nerrors', errs.filter((e) => !/no ending for/.test(e))); await b.close();
})();
