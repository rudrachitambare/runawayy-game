const { chromium } = require('playwright-core');
(async () => {
  const b = await chromium.launch({ executablePath: '/usr/bin/chromium', args: ['--no-sandbox'] });
  const p = await b.newPage({ viewport: { width: 390, height: 700 }, isMobile: true, hasTouch: true });
  await p.goto('file:///home/user/smallhours/src/index.html'); await p.waitForTimeout(400); await p.click('#startBtn'); await p.waitForTimeout(500);
  await p.evaluate(() => { document.querySelector('#daycard') && document.querySelector('#daycard').remove(); document.querySelector('#modal').classList.add('hidden'); if (SH.Mobile && SH.Mobile.showPhone) SH.Mobile.showPhone(); });
  const cdp = await p.context().newCDPSession(p);
  const swipe = async (x, y1, y2) => { await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y: y1 }] }); for (let i = 1; i <= 12; i++) { await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x, y: y1 + (y2 - y1) * i / 12 }] }); await p.waitForTimeout(16); } await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }); await p.waitForTimeout(400); };
  for (const app of ['home', 'atlas', 'people']) {
    await p.evaluate((a) => SH.Phone.open(a), app); await p.waitForTimeout(250);
    await swipe(195, 520, 250);
    console.log(app, await p.evaluate(() => { const a = document.querySelector('#pbody .appbody') || document.querySelector('#pbody'); const pb = document.querySelector('#pbody'); return 'inner ' + a.scrollTop + '/' + (a.scrollHeight - a.clientHeight) + ' pbody ' + pb.scrollTop + '/' + (pb.scrollHeight - pb.clientHeight); }));
  }
  await b.close();
})();
