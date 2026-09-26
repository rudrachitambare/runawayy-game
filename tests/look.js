const { chromium } = require('playwright-core');
(async () => {
  const b = await chromium.launch({ executablePath: '/usr/bin/chromium', args: ['--no-sandbox'] });
  const p = await b.newPage({ viewport: { width: 1366, height: 768 } });
  const errs = []; p.on('pageerror', (e) => errs.push(e.message));
  await p.goto('file:///home/user/runawayy-game/src/index.html'); await p.waitForTimeout(600);
  await p.screenshot({ path: 'shots/L0.png' });
  await p.click('#startBtn'); await p.waitForTimeout(800);
  await p.screenshot({ path: 'shots/L1.png' });
  console.log(await p.evaluate(() => document.querySelector('#modal').innerText.slice(0, 1500)));
  console.log(errs);
  await b.close();
})();
