const { chromium } = require('playwright-core');
(async () => {
  const b = await chromium.launch({ executablePath: '/usr/bin/chromium', args: ['--no-sandbox'] });
  const errs = [];
  for (const [nm, o] of [['DSK', { viewport: { width: 1366, height: 700 } }], ['MOB', { viewport: { width: 390, height: 700 }, isMobile: true, hasTouch: true }]]) {
    const p = await b.newPage(o); p.on('pageerror', (e) => errs.push(e.message));
    await p.goto('file:///home/user/smallhours/src/index.html'); await p.waitForTimeout(400); await p.click('#startBtn'); await p.waitForTimeout(500);
    await p.evaluate(() => { document.querySelector('#daycard') && document.querySelector('#daycard').remove(); document.querySelector('#modal').classList.add('hidden'); if (SH.Mobile && SH.Mobile.showPhone) SH.Mobile.showPhone(); SH.Phone.open('home'); });
    await p.waitForTimeout(300);
    const info = await p.evaluate(() => { const pb = document.querySelector('#pbody'); return { h: pb.clientHeight, sh: pb.scrollHeight, apps: document.querySelectorAll('.homegrid .app').length }; });
    const box = await p.evaluate(() => { const r = document.querySelector('#pbody').getBoundingClientRect(); return [r.x + r.width / 2, r.y + r.height / 2]; });
    let res = [];
    if (nm === 'DSK') {
      await p.mouse.move(...box); await p.mouse.wheel(0, 250); await p.waitForTimeout(200); res.push('wheel=' + await p.evaluate(() => document.querySelector('#pbody').scrollTop));
      await p.evaluate(() => document.querySelector('#pbody').scrollTop = 0);
      await p.mouse.move(box[0], box[1] + 100); await p.mouse.down(); await p.mouse.move(box[0], box[1] - 60, { steps: 8 }); await p.mouse.up(); await p.waitForTimeout(100);
      res.push('drag=' + await p.evaluate(() => document.querySelector('#pbody').scrollTop) + ' view=' + await p.evaluate(() => SH.Phone.view && SH.Phone.view.app));
      // tap still opens an app
      await p.evaluate(() => document.querySelector('#pbody').scrollTop = 0); await p.click('.homegrid .app >> nth=0'); await p.waitForTimeout(200); res.push('tap->' + await p.evaluate(() => SH.Phone.view && SH.Phone.view.app));
    } else {
      const cdp = await p.context().newCDPSession(p);
      await cdp.send('Input.synthesizeScrollGesture', { x: Math.round(box[0]), y: Math.round(box[1]), yDistance: -250, gestureSourceType: 'touch', speed: 800 });
      await p.waitForTimeout(400); res.push('swipe=' + await p.evaluate(() => document.querySelector('#pbody').scrollTop));
      await p.evaluate(() => SH.Phone.open('atlas')); await p.waitForTimeout(200);
      const b2 = await p.evaluate(() => { const r = document.querySelector('#pbody .appbody').getBoundingClientRect(); return [r.x + r.width / 2, r.y + r.height / 2]; });
      await cdp.send('Input.synthesizeScrollGesture', { x: Math.round(b2[0]), y: Math.round(b2[1]), yDistance: -250, gestureSourceType: 'touch', speed: 800 });
      await p.waitForTimeout(400); res.push('atlas swipe=' + await p.evaluate(() => { const a = document.querySelector('#pbody .appbody'); return a.scrollTop + '/' + (a.scrollHeight - a.clientHeight); }));
    }
    console.log(nm, JSON.stringify(info), res.join(' '));
    await p.close();
  }
  console.log('errors', errs); await b.close();
})();
