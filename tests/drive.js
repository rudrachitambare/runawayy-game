// interactive driver: POST js to :9333/eval (runs in node with p=page), returns result
const { chromium } = require('playwright-core'); const http = require('http');
(async () => {
  const b = await chromium.launch({ executablePath: '/usr/bin/chromium', args: ['--no-sandbox'] });
  let p; const errs = [];
  const open = async (w, h, mob) => { if (p) await p.context().close(); const ctx = await b.newContext({ viewport: { width: w, height: h }, isMobile: !!mob, hasTouch: !!mob, deviceScaleFactor: 1 }); p = await ctx.newPage(); p.on('pageerror', (e) => errs.push('ERR ' + e.message + ' ' + (e.stack || '').split('\n')[1])); p.on('console', (m) => { if (m.type() === 'error' || m.type() === 'warning') errs.push('console ' + m.text().slice(0, 200)); }); await p.goto('file:///home/user/runawayy-game/src/index.html'); await p.waitForTimeout(600); };
  await open(1366, 768);
  http.createServer((q, s) => { let d = ''; q.on('data', (c) => d += c); q.on('end', async () => { try { const f = eval('(async()=>{' + d + '})'); const r = await f(); const e = errs.splice(0); s.end((typeof r === 'string' ? r : JSON.stringify(r, null, 1)) + (e.length ? '\n!! ' + e.join('\n!! ') : '')); } catch (e) { s.end('DRIVER ' + e.message); } }); }).listen(9333, '127.0.0.1');
  console.log('ready');
})();
