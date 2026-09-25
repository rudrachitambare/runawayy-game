const { chromium } = require('playwright-core');
(async () => {
  const b = await chromium.launch({ executablePath: '/usr/bin/chromium', args: ['--no-sandbox'] });
  const p = await b.newPage(); const errs = []; p.on('pageerror', (e) => errs.push(e.message));
  await p.goto('file:///home/user/smallhours/SmallHours.html'); await p.waitForTimeout(300);
  await p.fill('#seedIn', 'x'); await p.click('#startBtn'); await p.waitForTimeout(400);
  console.log(await p.evaluate(() => ['what will happen if i tell someone', 'ok thanks', 'my friend jordan is the only one i talk to'].map((s) => { const a = SH.NLP.analyze(s); return s + ' => t=' + a.t + ' topics=' + a.topics + ' meta=' + a.meta + ' I=' + Object.keys(a.I) + ' len=' + a.len; }).join('\n')));
  await b.close();
})();
