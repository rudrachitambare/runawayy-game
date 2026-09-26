const { chromium } = require('playwright-core');
(async () => {
  const b = await chromium.launch({ executablePath: '/usr/bin/chromium', args: ['--no-sandbox'] });
  const p = await b.newPage({ viewport: { width: 390, height: 780 }, isMobile: true, hasTouch: true, deviceScaleFactor: 1 });
  await p.goto('file:///home/user/runawayy-game/src/index.html'); await p.waitForTimeout(400); await p.click('#startBtn'); await p.waitForTimeout(500);
  await p.evaluate(() => { document.querySelector('#daycard') && document.querySelector('#daycard').remove(); document.querySelector('#modal').classList.add('hidden'); SH.Mobile && SH.Mobile.showPhone && SH.Mobile.showPhone(); SH.Browser.go('everything.av'); SH.Phone.open('browser'); });
  await p.waitForTimeout(300); await p.screenshot({ path: 'shots/m_shop.png' });
  await p.evaluate(() => SH.Phone.open('bank')); await p.waitForTimeout(200); await p.screenshot({ path: 'shots/m_bank.png' });
  await b.close();
})();
