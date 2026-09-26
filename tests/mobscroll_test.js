const { chromium } = require('playwright-core');
(async () => { const b = await chromium.launch({ executablePath: '/usr/bin/chromium', args: ['--no-sandbox'] });
 for (const H of [700, 600]) {
 const ctx = await b.newContext({ viewport: { width: 390, height: H }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 }); const p = await ctx.newPage(); const errs = []; p.on('pageerror', (e) => errs.push(e.message));
 const cdp = await ctx.newCDPSession(p); const T = (type, x, y) => cdp.send('Input.dispatchTouchEvent', { type, touchPoints: type === 'touchEnd' ? [] : [{ x, y }] });
 const swipe = async (x, y, dy) => { await T('touchStart', x, y); for (let k = 10; k <= Math.abs(dy); k += 10) { await T('touchMove', x, y - Math.sign(dy) * k); await p.waitForTimeout(12); } await T('touchEnd'); await p.waitForTimeout(500); };
 const cs = () => p.evaluate(() => Math.round(document.getElementById('center').scrollTop));
 await p.goto('file:///home/user/runawayy-game/SmallHours.html'); await p.waitForTimeout(500);
 await swipe(195, H - 150, 250); console.log(H, 'title scrollTop', await p.evaluate(() => document.getElementById('title').scrollTop), 'start btn visible', await p.evaluate(() => { const r = document.getElementById('startBtn').getBoundingClientRect(); return r.bottom <= innerHeight && r.top >= 0; }));
 await p.evaluate(() => document.getElementById('title').scrollTop = 9999); await p.click('#startBtn'); await p.waitForTimeout(4800); await p.click('#modal .act'); await p.waitForTimeout(600);
 console.log(H, 'start center', await cs(), 'pill', await p.evaluate(() => document.getElementById('toScene').classList.contains('show')));
 await swipe(195, 250, 250); console.log(H, 'after swipe ON THE SCENE', await cs(), 'pill', await p.evaluate(() => document.getElementById('toScene').classList.contains('show')));
 if (H === 700) await p.screenshot({ path: '/home/user/runawayy-game/tests/shots/ms_scrolled.png' });
 await p.evaluate(() => { for (let i = 0; i < 4; i++) SH.UI.log('Test line ' + i + ': a longer paragraph of story text to see whether the newest line comes into view on its own when it is added at the bottom.'); }); await p.waitForTimeout(300);
 console.log(H, 'after 4 new lines', await cs(), 'last line visible', await p.evaluate(() => { const r = document.querySelector('#log').lastElementChild.getBoundingClientRect(); return Math.round(r.top) + '-' + Math.round(r.bottom) + ' / ' + innerHeight; }));
 await p.click('#toScene'); await p.waitForTimeout(700); console.log(H, 'after ⬆ Scene', await cs(), 'max', await p.evaluate(() => { const c = document.getElementById('center'); return c.scrollHeight - c.clientHeight; }), 'hit', await p.evaluate(() => document.elementFromPoint(120, 250).tagName + '#' + document.elementFromPoint(120, 250).id));
 await swipe(120, 250, 200); console.log(H, 'swipe starting on scene canvas', await cs(), 'pill', await p.evaluate(() => document.getElementById('toScene').classList.contains('show'))); if (H === 700) await p.screenshot({ path: '/home/user/runawayy-game/tests/shots/ms_scrolled.png' });
 await p.evaluate(() => SH.Mobile.tab('phone')); await p.waitForTimeout(300); console.log(H, 'pill on phone tab', await p.evaluate(() => document.getElementById('toScene').classList.contains('show')));
 await p.evaluate(() => { SH.Net.instant = true; SH.Phone.open('browser'); SH.Browser.go('rides.av/find?f=p0&t=p1&w=now'); }); await p.waitForTimeout(400);
 await swipe(195, H - 150, 250); console.log(H, 'rides results scroll', await p.evaluate(() => document.querySelector('#pbody .appbody').scrollTop));
 await p.evaluate(() => SH.Mobile.tab('you')); await p.waitForTimeout(300); await swipe(195, H - 150, 250); console.log(H, 'you tab scroll', await p.evaluate(() => document.getElementById('left').scrollTop));
 await p.evaluate(() => SH.Mobile.tab('story')); await p.waitForTimeout(300); await p.evaluate(() => { const a = document.querySelector('#dock .dbtn, #dock button'); a && a.click(); }); await p.waitForTimeout(500);
 await swipe(195, H / 2, 150); console.log(H, 'dialog after tapping a dock button scrolls', await p.evaluate(() => { const m = document.querySelector('#modal:not(.hidden) .mtext'); return m ? m.scrollTop + '/' + (m.scrollHeight - m.clientHeight) : 'no dialog'; }));
 console.log(H, 'errs', errs); await ctx.close(); }
 await b.close(); })();
