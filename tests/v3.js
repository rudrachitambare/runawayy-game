const { chromium } = require('playwright-core');
(async () => {
  const tag = process.argv[2] || 'v';
  const b = await chromium.launch({ executablePath: '/usr/bin/chromium', args: ['--no-sandbox'] });
  for (const [nm, vp] of [['d', { width: 1440, height: 900 }], ['l', { width: 1280, height: 720 }], ['m', { width: 390, height: 844, isMobile: true, hasTouch: true, deviceScaleFactor: 2 }]]) {
    const o = { viewport: { width: vp.width, height: vp.height } }; if (vp.isMobile) Object.assign(o, { isMobile: true, hasTouch: true, deviceScaleFactor: 2 });
    const p = await b.newPage(o); const errs = []; p.on('pageerror', (e) => errs.push(e.message)); p.on('console', (m) => m.type() === 'error' && errs.push(m.text()));
    await p.goto('file:///home/user/smallhours/SmallHours.html'); await p.waitForTimeout(300);
    await p.fill('#seedIn', 'v3'); await p.click('#startBtn'); await p.waitForTimeout(900);
    for (let i = 0; i < 6; i++) { const open = await p.evaluate(() => { const d = document.querySelector('#daycard'); d && d.remove(); const m = document.querySelector('#modal'); return m && !m.classList.contains('hidden') && m.querySelector('button') ? 1 : 0; }); if (!open) break; await p.click('#modal button', { timeout: 2000 }).catch(() => {}); await p.waitForTimeout(400); }
    await p.waitForTimeout(500); await p.screenshot({ path: `/home/user/smallhours/tests/shots/${tag}_${nm}_1.png` });
    // click a hotspot with several actions
    const hs = await p.$$('#hot .hs:not(.off)'); console.log(nm, 'hotspots', hs.length, 'dock', (await p.$$('#dock .dk')).length);
    const multi = await p.$('#hot .hs:not(.off):has(.hl em)'); if (multi) { await multi.click({ timeout: 3000 }); await p.waitForTimeout(300); await p.screenshot({ path: `/home/user/smallhours/tests/shots/${tag}_${nm}_2.png` }); await p.keyboard.press('Escape'); }
    // kitchen at evening
    await p.evaluate(() => { SH.G.t += 11 * 60; SH.G.room = 'living'; SH.UI.renderAll(); const m = document.querySelector('#modal'); m.classList.add('hidden'); });
    await p.waitForTimeout(700); await p.screenshot({ path: `/home/user/smallhours/tests/shots/${tag}_${nm}_3.png` });
    await p.evaluate(() => { SH.G.loc = 'park'; SH.G.phase = 'run'; SH.G.missingAt = SH.G.t; SH.UI.renderAll(); });
    await p.waitForTimeout(900); await p.screenshot({ path: `/home/user/smallhours/tests/shots/${tag}_${nm}_4.png` });
    console.log(nm, errs.slice(0, 4)); await p.close();
  }
  await b.close();
})();
