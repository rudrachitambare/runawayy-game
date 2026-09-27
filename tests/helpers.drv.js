// driver helpers: `./d.sh < helpers.drv.js` after (re)starting drive.js. Defines node globals that use the page `p`.
global.P = () => p;
global.clean = async () => { await p.evaluate(() => { document.querySelectorAll('#daycard,.toast2').forEach((e) => e.remove()); }); };
global.state = async () => p.evaluate(() => { const g = SH.G; if (!g) return null; const L = SH.Actions && SH.Actions.list ? SH.Actions.list() : { acts: [] };
  return { t: SH.fmt12 ? SH.fmt12() : g.t, day: SH.day(), loc: g.loc, away: g.away, money: g.money, notice: g.awayNotice, s: JSON.stringify(g.s), modal: (() => { const m = document.querySelector('#modal:not(.hidden)'); return m ? m.innerText.slice(0, 1500) : null; })(),
    log: [...document.querySelectorAll('#log .entry, #log > div')].slice(-4).map((e) => e.innerText.replace(/\n/g, ' ')), acts: (L.acts || []).map((a) => a.label + (a.dis ? ' [x]' : '')) }; });
global.fresh = async () => { await p.reload(); await p.waitForTimeout(700); await p.click('#startBtn'); await p.waitForTimeout(500); await p.click('#modal .act'); await p.waitForTimeout(200); await clean(); };
global.act = async (re) => p.evaluate((re) => { const a = SH.Actions.list().acts.find((x) => new RegExp(re, 'i').test(x.label) && !x.dis); if (!a) return 'NOACT'; a.fn(); return a.label; }, re);
global.choose = async (re) => p.evaluate((re) => { const b = [...document.querySelectorAll('#modal:not(.hidden) .act')].find((x) => new RegExp(re, 'i').test(x.innerText)); if (!b) return 'NOCHOICE'; b.click(); return b.innerText.replace(/\n/g, ''); }, re);
global.go = async (kind) => { const r = await p.evaluate((k) => { const id = SH.Town.id(SH.G.away, k); if (!SH.LOC[id]) return 'NOLOC'; const o = SH.travelOptions(id)[0]; SH.travel(id, o); return o.mins; }, kind); await p.waitForTimeout(250); return r; };
global.shot = async (n) => { await clean(); await p.screenshot({ path: 'shots/' + n + '.png' }); return n; };
global.goTown = async (pid) => { await fresh(); await p.evaluate((pid) => { SH.Run.start('test', false); SH.G.phone.share = false; const m = document.querySelector('#modal'); m.classList.add('hidden'); m.innerHTML = ''; const to = SH.Atlas.data().places.find((x) => x.id === pid); SH.Atlas.arrive(to, { k: 'bus', mins: 60, e: 5, cost: 0 }); }, pid); await p.waitForTimeout(600); await p.evaluate(() => { const m = document.querySelector('#modal'); if (m) m.classList.add('hidden'); }); };
global.mapTab = async () => { await p.evaluate(() => { const b = [...document.querySelectorAll('button,.tab,[data-tab]')].find((e) => /^\W*Map\s*$/i.test(e.textContent.trim())); b && b.click(); }); await p.waitForTimeout(500); };
// talk: open a conversation first, then say() lines; returns the whole transcript
global.say = async (t) => { const ok = await p.evaluate((t) => { const i = document.querySelector('#tin'); if (!i || !SH.Talk.cur || SH.Talk.cur.ended) return false; i.value = t; SH.Talk.say(); return true; }, t); if (ok) await p.waitForTimeout(2000); return ok; };
global.transcript = async () => p.evaluate(() => [...document.querySelectorAll('#tlog .tl')].map((e) => (e.classList.contains('me') ? '> ' : '  ') + e.textContent));
global.convo = async (lines) => { for (const l of lines) if (!(await say(l))) break; return transcript(); };
return 'helpers ok';
