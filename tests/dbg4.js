const { chromium } = require('playwright-core');
(async () => {
  const b = await chromium.launch({ executablePath: '/usr/bin/chromium', args: ['--no-sandbox'] });
  const p = await b.newPage({ viewport: { width: 1366, height: 768 } });
  await p.goto('file:///home/user/runawayy-game/SmallHours.html'); await p.waitForTimeout(300);
  await p.fill('#seedIn', 'convo'); await p.click('#startBtn'); await p.waitForTimeout(500);
  await p.evaluate(() => { document.querySelector('#daycard') && document.querySelector('#daycard').remove(); SH.Talk.open('tyler', { turnsMax: 9 }); });
  await p.waitForTimeout(300);
  console.log(await p.evaluate(() => document.querySelector('#tlog').innerHTML));
  await b.close();
})();
