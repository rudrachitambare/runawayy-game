// careful-player simulation per town; returns notice trajectory and how it ended
global.sim = async (pid, days) => {
  await goTown(pid);
  const tr = []; const note = async (tag) => { const s = await p.evaluate(() => ({ n: Math.round(SH.G.awayNotice || 0), e: !!SH.G.ended, t: SH.fmt12(), d: SH.day(), loc: SH.G.loc, m: document.querySelector('#modal:not(.hidden)')?.innerText.slice(0, 60) })); tr.push(tag + ':' + s.n + (s.e ? ' ENDED ' + s.m : '')); return s; };
  const hide = () => p.evaluate(() => { const m = document.querySelector('#modal:not(.hidden)'); if (m && !SH.G.ended) { const b = m.querySelector('.act'); if (b && /Okay|Back|Continue|Log off/i.test(b.innerText)) b.click(); else m.classList.add('hidden'); } });
  const plan = [['gas', 'Hot dog|Buy Granola'], ['library', 'Read in a corner|Charge'], ['park', 'bench'], ['church', 'back pew'], ['diner', 'pancakes|pie|Hot chocolate'], ['laundromat', 'Warm up'], ['edge', 'Look back'], ['church', 'sleep|Find somewhere']];
  for (let d = 0; d < days; d++) {
    for (const [k, re] of plan) {
      const r = await go(k); if (r === 'NOLOC') continue; await hide();
      await p.evaluate(() => { SH.G.money = Math.max(SH.G.money, 20); });
      const a = await act(re); await p.waitForTimeout(150); await hide();
      const s = await note(k + (a === 'NOACT' ? '-' : '')); if (s.e) return tr.join(' ');
    }
    // sleep for real if the plan didn't
    await p.evaluate(() => { if (SH.hour() > 12 && !SH.G.ended) { const a = SH.Actions.list().acts.find((x) => /sleep/i.test(x.label) && !x.dis); a && a.fn(); } });
    await p.waitForTimeout(200); await hide(); const s = await note('night' + d); if (s.e) return tr.join(' ');
  }
  return tr.join(' ');
};
return 'sim ok';
