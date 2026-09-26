const { chromium } = require('playwright-core');
(async () => {
  const b = await chromium.launch({ executablePath: '/usr/bin/chromium', args: ['--no-sandbox'] });
  const errs = [];
  for (const [nm, vp, mob] of [['d', { width: 1440, height: 860 }, false], ['m', { width: 390, height: 800 }, true]]) {
    const p = await b.newPage({ viewport: vp, isMobile: mob, hasTouch: mob, deviceScaleFactor: 1 });
    p.on('pageerror', (e) => errs.push(nm + ': ' + e.message));
    await p.goto('file:///home/user/runawayy-game/src/index.html'); await p.waitForTimeout(400); await p.click('#startBtn'); await p.waitForTimeout(500);
    await p.evaluate(() => { document.querySelector('#daycard') && document.querySelector('#daycard').remove(); document.querySelector('#modal').classList.add('hidden'); SH.Mobile && SH.Mobile.showPhone && SH.Mobile.showPhone(); SH.Phone.open('atlas'); });
    await p.waitForTimeout(300); await p.screenshot({ path: `shots/${nm}_atlas.png` });
    await p.click('.mfbtn'); await p.waitForTimeout(700); await p.screenshot({ path: `shots/${nm}_atlas_full.png` });
    await p.evaluate(() => { const g = document.querySelector('.apl'); g && g.dispatchEvent(new MouseEvent('click', { bubbles: true })); }); await p.waitForTimeout(300);
    console.log(nm, 'still full after tapping a place:', await p.evaluate(() => document.body.classList.contains('mapfull')));
    await p.evaluate(() => { SH.Browser.go('avermaps.av'); SH.Phone.open('browser'); }); await p.waitForTimeout(300);
    console.log(nm, 'full after switching to browser avermaps:', await p.evaluate(() => document.body.classList.contains('mapfull')));
    await p.click('.mfbtn'); await p.waitForTimeout(700); await p.screenshot({ path: `shots/${nm}_avermaps_full.png` });
    await p.keyboard.press('Escape'); await p.waitForTimeout(200);
    console.log(nm, 'after Esc:', await p.evaluate(() => document.body.classList.contains('mapfull')));
    await p.click('.mfbtn'); await p.waitForTimeout(300); await p.evaluate(() => SH.Phone.open('home')); await p.waitForTimeout(200);
    console.log(nm, 'after leaving to home:', await p.evaluate(() => document.body.classList.contains('mapfull')));
    await p.close();
  }
  console.log('errors', errs); await b.close();
})();
