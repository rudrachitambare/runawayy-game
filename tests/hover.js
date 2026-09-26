const { chromium } = require('playwright-core');
(async () => {
  const b = await chromium.launch({ executablePath: '/usr/bin/chromium', args: ['--no-sandbox'] });
  const p = await b.newPage({ viewport: { width: 1366, height: 768 } });
  await p.goto('file:///home/user/runawayy-game/SmallHours.html'); await p.waitForTimeout(300);
  await p.fill('#seedIn', 'h'); await p.click('#startBtn'); await p.waitForTimeout(600);
  for (let i = 0; i < 4; i++) { await p.evaluate(() => { const d = document.querySelector('#daycard'); d && d.remove(); }); await p.click('#modal button', { timeout: 800 }).catch(() => {}); await p.waitForTimeout(300); }
  await p.evaluate(() => { const d = document.querySelector('#daycard'); d && d.remove(); });
  const hs = await p.$$('#hot .hs:not(.off)'); const bb = await hs[3].boundingBox(); console.log(bb);
  await p.mouse.move(bb.x + bb.width / 2, bb.y + bb.height / 2);
  const st = await p.$('#stage'); const sb = await st.boundingBox();
  for (let i = 0; i < 4; i++) { await p.waitForTimeout(150); await p.screenshot({ path: `shots/hv${i}.png`, clip: { x: bb.x - 330, y: bb.y - 110, width: 420, height: 230 } }); console.log(JSON.stringify(await hs[3].boundingBox()), await p.evaluate(() => document.querySelector('#hot .hs:hover') ? 'hover' : 'nohover')); }
  await p.mouse.move(bb.x + bb.width / 2 + 10, bb.y + bb.height / 2 + 12);
  await p.waitForTimeout(150); console.log('edge', await p.evaluate(() => document.querySelector('#hot .hs:hover') ? 'hover' : 'nohover'));
  await b.close();
})();
