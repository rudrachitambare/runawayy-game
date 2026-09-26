const { chromium } = require('playwright-core');
(async () => {
  const b = await chromium.launch({ executablePath: '/usr/bin/chromium', args: ['--no-sandbox'] });
  const p = await b.newPage(); const errs = []; p.on('pageerror', (e) => errs.push(e.message));
  await p.goto('file:///home/user/runawayy-game/SmallHours.html'); await p.waitForTimeout(300);
  await p.fill('#seedIn', 'x'); await p.click('#startBtn'); await p.waitForTimeout(400);
  console.log(await p.evaluate(() => { const o = [];
    o.push('tylerG=' + JSON.stringify(SH.Mem.greeting('tyler')) + ' nm=' + JSON.stringify(SH.nm('What do YOU want.')));
    SH.G.mind = SH.G.mind || { facts: {}, npc: {} }; const P = SH.G.mind.npc.okafor = SH.G.mind.npc.okafor || { met: 1, n: 1, qa: [], ops: {} }; P.tops = { drink: { t: SH.G.t - 3000, raw: 'rick drinks' } };
    const c = { turn: 1, mem: {}, used: {} }; o.push(SH.Brain.okafor(SH.NLP.analyze('rick was yelling again last night'), c).say); o.push(JSON.stringify(Object.keys(SH.G.mind.npc.okafor.tops))); return o.join('\n'); }));
  console.log(errs); await b.close();
})();
