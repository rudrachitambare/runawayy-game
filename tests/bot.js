const { chromium } = require('playwright-core');
(async () => {
  const [mode, seed, steps] = [process.argv[2] || 'd', process.argv[3] || '7', +(process.argv[4] || 200)];
  const b = await chromium.launch({ executablePath: '/usr/bin/chromium', args: ['--no-sandbox'] });
  const o = mode === 'm' ? { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true } : { viewport: { width: 1366, height: 768 } };
  const p = await b.newPage(o);
  const errs = []; p.on('pageerror', (e) => errs.push(e.message + ' @ ' + (e.stack || '').split('\n').slice(1, 3).join(' '))); p.on('console', (m) => m.type() === 'error' && errs.push('c:' + m.text()));
  await p.goto('file:///home/user/smallhours/src/index.html'); await p.waitForTimeout(300);
  await p.fill('#seedIn', seed); await p.click('#startBtn'); await p.waitForTimeout(500);
  let r = (+seed || 7) * 9301 % 233280; const rnd = () => (r = (r * 9301 + 49297) % 233280) / 233280;
  const says = ['hi', 'im fine', 'whatever', 'can i stay over', 'i hate it at home', 'thanks', 'where is the bus', 'rick is drunk again', 'no', 'yeah ok', 'bye', 'what do you think i should do'];
  const counts = { spot: 0, pop: 0, dock: 0, modal: 0, talk: 0, walk: 0, tab: 0 }; let i = 0, ended = false, busyN = 0;
  const T = { timeout: 1500 };
  for (; i < steps; i++) {
    const st = await p.evaluate(() => {
      const dc = document.querySelector('#daycard'); if (dc) dc.remove();
      const vis = (s) => { const e = document.querySelector(s); return !!e && !e.classList.contains('hidden') && getComputedStyle(e).display !== 'none'; };
      return { end: !!document.querySelector('.epi'), modal: vis('#modal') && document.querySelectorAll('#modal button').length, talk: !!document.querySelector('#modal:not(.hidden) #tin'), pop: vis('#pop'), busy: SH.Stage.busy, day: SH.day(), tab: document.body.dataset.tab || '' };
    });
    if (st.end) { ended = true; break; }
    try {
      if (st.busy) { busyN = (busyN || 0) + 1; if (busyN === 20) console.log('STUCK', JSON.stringify(await p.evaluate(() => ({ sam: SH.Stage.sam, view: SH.Stage.view, vis: document.querySelector('#stage').offsetParent !== null, hidden: document.hidden })))); await p.waitForTimeout(200); continue; } busyN = 0;
      if (st.talk) { if (rnd() < 0.2) await p.click('#tleave', T); else { await p.fill('#tin', says[Math.floor(rnd() * says.length)], T); await p.keyboard.press('Enter'); } counts.talk++; }
      else if (st.modal) { const bs = await p.$$('#modal button'); await bs[Math.floor(rnd() * bs.length)].click(T); counts.modal++; }
      else if (mode === 'm' && st.tab && st.tab !== 'story') { await p.click('#tabbar [data-t="story"]', T); counts.tab++; }
      else if (st.pop) { const bs = await p.$$('#pop .po:not([disabled])'); if (bs.length) { await bs[Math.floor(rnd() * bs.length)].click(T); counts.pop++; } else await p.keyboard.press('Escape'); }
      else {
        const x = rnd();
        if (x < 0.55) { const bs = await p.$$('#hot .hs:not(.off):not(.dis)'); if (bs.length) { await bs[Math.floor(rnd() * bs.length)].click(T); counts.spot++; } else { await p.click('#hot .edge.show', T).catch(() => {}); } }
        else if (x < 0.92) { const bs = await p.$$('#dock .dk[data-i]:not([disabled])'); if (bs.length) { await bs[Math.floor(rnd() * bs.length)].click(T); counts.dock++; } }
        else { const c = await p.$('#scene'); const bb = await c.boundingBox(); await p.mouse.click(bb.x + bb.width * rnd(), bb.y + bb.height * 0.8); counts.walk++; }
      }
    } catch (e) { if (process.env.V) console.log('fail', e.message.split('\n').slice(0, 6).join(' / ').slice(0, 300)); await p.evaluate(() => { const m = document.querySelector('#modal'); if (m && !m.querySelector('button')) m.classList.add('hidden'); document.body.classList.remove('allopen'); }); }
    await p.waitForTimeout(60);
  }
  const fin = await p.evaluate(() => ({ day: SH.day(), loc: SH.G.loc, phase: SH.G.phase, t: SH.fmt12() }));
  await p.screenshot({ path: `/home/user/smallhours/tests/shots/bot_${mode}_${seed}.png` });
  console.log(mode, seed, 'steps', i, JSON.stringify(fin), 'ended', ended, JSON.stringify(counts), 'errors', errs.length, errs.slice(0, 4));
  await b.close();
})();
