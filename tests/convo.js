// usage: node convo.js scripts.json  -> runs each {npc, ctx, lines[]} through the real Talk UI
const { chromium } = require('playwright-core'); const fs = require('fs');
const scripts = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
(async () => {
  const b = await chromium.launch({ executablePath: '/usr/bin/chromium', args: ['--no-sandbox'] });
  const p = await b.newPage({ viewport: { width: 1366, height: 768 } });
  const errs = []; p.on('pageerror', (e) => errs.push(e.message + ' @ ' + (e.stack || '').split('\n')[1]));
  await p.goto('file:///home/user/smallhours/SmallHours.html'); await p.waitForTimeout(300);
  await p.fill('#seedIn', process.env.SEED || 'convo'); await p.click('#startBtn'); await p.waitForTimeout(500);
  for (const s of scripts) {
    await p.evaluate(() => { document.querySelector('#daycard') && document.querySelector('#daycard').remove(); const m = document.querySelector('#modal'); m.classList.add('hidden'); m.innerHTML = ''; });
    if (s.setup) await p.evaluate(s.setup);
    await p.evaluate(([n, ctx]) => SH.Talk.open(n, { ctx, turnsMax: 40 }), [s.npc, s.ctx || 'talk']); await p.waitForTimeout(200);
    console.log(`\n=== ${s.npc} [${s.ctx || 'talk'}] ===\n  ${await p.evaluate(() => [...document.querySelectorAll('#tlog .tl')].map((e) => e.className.split(' ')[1] + ': ' + e.textContent).join('\n  '))}`);
    for (const l of s.lines) {
      const n0 = await p.evaluate(() => document.querySelectorAll('#tlog .tl').length);
      if (await p.evaluate(() => !document.querySelector('#tin'))) { console.log('  [conversation ended]'); break; }
      await p.fill('#tin', l); await p.keyboard.press('Enter'); await p.waitForTimeout(1800);
      console.log('  ' + (await p.evaluate((n) => [...document.querySelectorAll('#tlog .tl')].slice(n).map((e) => (e.className.split(' ')[1] === 'me' ? 'ME   ' : e.className.split(' ')[1] === 'npc' ? '  <- ' : '  (narr) ') + e.textContent).join('\n  '), n0)));
    }
    await p.evaluate(() => { const m = document.querySelector('#modal'); m.classList.add('hidden'); m.innerHTML = ''; SH.Talk.cur = null; });
  }
  console.log('\nerrors', errs); await b.close();
})();
