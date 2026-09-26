const { chromium } = require('playwright-core');
(async () => {
  const b = await chromium.launch({ executablePath: '/usr/bin/chromium', args: ['--no-sandbox'] });
  const p = await b.newPage({ viewport: { width: 1366, height: 768 } });
  await p.goto('file:///home/user/runawayy-game/src/index.html'); await p.waitForTimeout(400); await p.click('#startBtn'); await p.waitForTimeout(500);
  await p.evaluate(() => { document.querySelector('#daycard') && document.querySelector('#daycard').remove(); document.querySelector('#modal').classList.add('hidden'); SH.Phone.open('atlas'); });
  await p.waitForTimeout(200);
  console.log(await p.evaluate(() => { const a = document.querySelector('#pbody .appbody'); const cs = getComputedStyle(a); const kids = [...a.children].map((k) => { const c = getComputedStyle(k); return k.className + ' h=' + k.clientHeight + '/' + k.scrollHeight + ' ov=' + c.overflow + ' shrink=' + c.flexShrink; }); return 'display=' + cs.display + ' dir=' + cs.flexDirection + '\n' + kids.join('\n'); }));
  await b.close();
})();
