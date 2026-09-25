const { chromium } = require('playwright-core');
(async () => {
  const b = await chromium.launch({ executablePath: '/usr/bin/chromium', args: ['--no-sandbox'] });
  const p = await b.newPage({ viewport: { width: 390, height: 700 }, isMobile: true, hasTouch: true });
  await p.goto('file:///home/user/smallhours/src/index.html'); await p.waitForTimeout(400); await p.click('#startBtn'); await p.waitForTimeout(500);
  await p.evaluate(() => { document.querySelector('#daycard') && document.querySelector('#daycard').remove(); document.querySelector('#modal').classList.add('hidden'); if (SH.Mobile && SH.Mobile.showPhone) SH.Mobile.showPhone(); SH.Phone.open('home'); });
  await p.waitForTimeout(300);
  console.log(await p.evaluate(() => { const pb = document.querySelector('#pbody'); const r = pb.getBoundingClientRect(); const x = r.x + r.width / 2, y = r.y + r.height / 2; const top = document.elementFromPoint(x, y); const chain = []; for (let e = top; e; e = e.parentElement) { const c = getComputedStyle(e); chain.push((e.id || e.className || e.tagName).toString().slice(0, 30) + '[ta=' + c.touchAction + ' ov=' + c.overflowY + ' pe=' + c.pointerEvents + ' pos=' + c.position + ']'); } return 'rect ' + JSON.stringify(r) + '\n' + chain.join('\n'); }));
  await b.close();
})();
