// scans the page for the default family names when the rolled family is different
const { chromium } = require('playwright-core');
const ROOT = 'file://' + require('path').resolve(__dirname, '../src/index.html');
(async () => { const b = await chromium.launch({ executablePath: '/usr/bin/chromium', args: ['--no-sandbox'] });
 const errs = []; let leaks = 0;
 const fresh = async () => { const p = await b.newPage({ viewport: { width: 1400, height: 900 } }); p.on('pageerror', (e) => errs.push(e.message));
  await p.goto(ROOT); await p.waitForTimeout(400);
  // roll until every default name differs
  await p.evaluate(() => { for (let s = 1; s < 500; s++) { const f = SH.Family.generate(s, 'f'); if (f.rick !== 'Rick' && f.sib !== 'Lily' && f.mom !== 'Dana' && f.gma !== 'Rose' && f.role !== 'stepdad') { document.getElementById('seedIn').value = String(s); break; } } });
  await p.click('#startBtn'); await p.waitForTimeout(600); await p.evaluate(() => { SH.Net.instant = true; const d = document.getElementById('daycard'); d && d.remove(); }); return p; };
 const scan = async (p, label) => { const r = await p.evaluate(() => { const f = SH.G.fam, bad = []; const re = /\b(Rick|Lily|Dana|Hollis|Reyes|Grandma Rose|stepdad|step-dad)\b/g; const txt = document.body.innerText; let m; while ((m = re.exec(txt))) bad.push(txt.slice(Math.max(0, m.index - 40), m.index + 30).replace(/\n/g, ' ')); return { fam: `${f.mom} ${f.momS}, ${f.rick} ${f.rickS} (${f.role}), ${f.sib}, Grandma ${f.gma}`, bad: [...new Set(bad)].slice(0, 6) }; });
  if (r.bad.length) leaks += r.bad.length; console.log((r.bad.length ? 'LEAK ' : 'ok   ') + label.padEnd(22), r.bad.length ? JSON.stringify(r.bad) : ''); return r; };
 let p = await fresh(); console.log('family:', (await scan(p, 'intro dialog')).fam);
 await p.click('#modal .act'); await p.waitForTimeout(300); await scan(p, 'home / bedroom');
 for (const room of ['kitchen', 'living', 'bathroom']) { await p.evaluate((r) => { SH.G.room = r; SH.UI.render && SH.UI.render(); SH.UI.renderScene && SH.UI.renderScene(); }, room); await p.waitForTimeout(300); await scan(p, 'room ' + room); }
 for (const app of ['messages', 'notes', 'photos', 'contacts', 'chirp']) { await p.evaluate((a) => { try { SH.Phone.open(a); } catch (e) {} }, app); await p.waitForTimeout(250); await scan(p, 'phone ' + app); }
 await p.evaluate(() => { try { SH.Phone.open('messages'); SH.Phone.openThread ? SH.Phone.openThread('mom') : SH.Phone.open('thread:mom'); } catch (e) {} }); await p.waitForTimeout(250); await scan(p, 'mom thread');
 await p.evaluate(() => { const A = SH.Actions.list(); SH.UI.dialog({ title: 'Actions', text: [A.acts.map((a) => a.label).join(' · ')], choices: [{ t: 'x', fn: () => {} }] }); }); await p.waitForTimeout(250); await scan(p, 'action labels');
 await p.evaluate(() => { const m = document.querySelector('#modal .act'); m && m.click(); });
 const ends = [['found', "EN.found('police')"], ['grandma', "EN.grandma('bus')"], ['walkHome', 'EN.walkHome()'], ['harbor', "EN.harbor('walk')"], ['collapse', 'EN.collapse()'], ['patel', 'EN.patel(true)'], ['stayed', 'EN.stayed()'], ['foundMom', "EN.foundMom('call')"]];
 for (const [n, js] of ends) { await p.close(); p = await fresh(); await p.evaluate(() => { const m = document.querySelector('#modal .act'); m && m.click(); SH.Run.start('bigNight', false); SH.G.missingAt = SH.G.t - 3 * 1440; });
  await p.evaluate((js) => { const EN = SH.Endings; try { eval(js); } catch (e) { console.error(e.message); } }, js); await p.waitForTimeout(700);
  for (let i = 0; i < 6; i++) { await scan(p, 'ending ' + n + ' #' + i); const more = await p.evaluate(() => { const a = document.querySelector('#modal:not(.hidden) .act'); if (!a) return false; a.click(); return true; }); if (!more) break; await p.waitForTimeout(400); } }
 console.log('\nLEAKS', leaks, 'errors', errs); await b.close(); })();
