const { chromium } = require('playwright-core');
(async () => {
  const b = await chromium.launch({ executablePath: '/usr/bin/chromium', args: ['--no-sandbox'] });
  const p = await b.newPage(); const errs = []; p.on('pageerror', (e) => errs.push(e.message));
  await p.goto('file:///home/user/smallhours/SmallHours.html'); await p.waitForTimeout(300);
  await p.fill('#seedIn', 'chat'); await p.click('#startBtn'); await p.waitForTimeout(500);
  console.log(await p.evaluate(() => {
    const out = []; const c = { turn: 1 };
    SH.Brain.jordan(SH.NLP.analyze('i have a big science fair tomorrow'), c);
    SH.G.t += 48 * 60; const c2 = { turn: 1 };
    out.push('greet: ' + SH.Mem.greeting('jordan'));
    out.push('reply: ' + JSON.stringify(SH.Brain.jordan(SH.NLP.analyze('honestly it went terrible'), c2).say));
    out.push('lily: ' + JSON.stringify(SH.Brain.lily(SH.NLP.analyze('whats my favorite animal'), { turn: 1 }).say));
    try { out.push('okafor: ' + JSON.stringify(SH.Brain.okafor(SH.NLP.analyze('im really good at drawing'), { turn: 1, ctx: {}, d: {} }).say)); } catch (e) { out.push('okafor harness: ' + e.message); }
    out.push('patel: ' + JSON.stringify(SH.Brain.patel(SH.NLP.analyze('do you like dogs'), { turn: 1 }).say));
    out.push('summary: ' + JSON.stringify(SH.Mem.summary('jordan').slice(0, 3)));
    return out.join('\n');
  }));
  console.log('errors', errs); await b.close();
})();
