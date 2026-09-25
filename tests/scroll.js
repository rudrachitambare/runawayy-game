const { chromium } = require('playwright-core');
(async () => {
  const b = await chromium.launch({ executablePath: '/usr/bin/chromium', args: ['--no-sandbox'] });
  for (const mob of [false, true]) {
    const p = await b.newPage(mob ? { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true } : { viewport: { width: 1366, height: 768 } });
    await p.goto('file:///home/user/smallhours/src/index.html'); await p.waitForTimeout(400); await p.click('#startBtn'); await p.waitForTimeout(500);
    await p.evaluate(() => { document.querySelector('#daycard') && document.querySelector('#daycard').remove(); const m = document.querySelector('#modal'); m.classList.add('hidden'); if (SH.Mobile && SH.Mobile.showPhone) SH.Mobile.showPhone(); });
    for (const app of ['atlas', 'net', 'messages', 'people']) {
      await p.evaluate((a) => SH.Phone.open(a), app); await p.waitForTimeout(200);
      const r = await p.evaluate(() => { const a = document.querySelector('#pbody .appbody'); if (!a) return 'no appbody'; const cs = getComputedStyle(a); const pb = document.querySelector('#pbody'); const before = a.scrollTop; a.scrollTop = 200; return `ab h=${a.clientHeight} sh=${a.scrollHeight} ov=${cs.overflowY} minH=${cs.minHeight} scrolled=${a.scrollTop} | pbody h=${pb.clientHeight} sh=${pb.scrollHeight} | screen h=${document.querySelector('#screen').clientHeight}`; });
      // wheel test
      const box = await p.evaluate(() => { const r = document.querySelector('#pbody .appbody').getBoundingClientRect(); return [r.x + r.width / 2, r.y + r.height / 2]; }).catch(() => null);
      let wheel = '';
      if (box) { await p.evaluate(() => document.querySelector('#pbody .appbody').scrollTop = 0); await p.mouse.move(box[0], box[1]); await p.mouse.wheel(0, 300); await p.waitForTimeout(200); wheel = await p.evaluate(() => document.querySelector('#pbody .appbody').scrollTop); 
        const top = await p.evaluate(([x, y]) => { const e = document.elementFromPoint(x, y); return e ? e.tagName + '#' + e.id + '.' + e.className : 'none'; }, box); wheel += ' top=' + top; }
      console.log(mob ? 'MOB' : 'DSK', app, r, 'wheel->', wheel);
    }
    await p.close();
  }
  await b.close();
})();
