/* SMALL HOURS — Part 7c: "Disappear for good".
   After three weeks away, if nobody's close to finding you and your life out here actually works (a place to sleep, a way
   to eat, a story people believe), you can choose to stop running and just... stay gone. That picks one of the
   never-found endings (endx_gone.js) based on your run. It's offered in "You & your group" and once, unprompted, at day 45. */
(function (SH) {
  const K = SH.K, A = SH.Atlas; if (!K || !A) return;
  const G = K.G;
  function pillars(p) {
    const g = G(), b = g.base, look = g.look ? Object.values(g.look).filter(Boolean).length : 0, biz = Object.values(g.biz || {}).filter(Boolean);
    return [
      ['A place to sleep', !!((b && b.up.length >= 3) || (g.room && g.room.until - g.t > 6 * 1440) || (g.lessons && g.lessons.n >= 6))],
      ['A way to eat', g.money >= 120 || biz.some((x) => x.total >= 100) || Object.values(g.street || {}).some((x) => x >= 30)],
      ['A story people believe', !!((g.cover || {})[p.id] && g.cover[p.id].story) || look >= 2],
      ['People who\'d vouch for you', (SH.World2 && SH.World2.rep(p) >= 12) || Object.values(g.att || {}).some((x) => x >= 40) || (g.helped || 0) >= 1],
    ];
  }
  const ready = (p) => { const g = G(); return K.days() >= 21 && (g.heat || 0) < 60 && (g.awayNotice || 0) < 50 && pillars(p).filter((x) => x[1]).length >= 3; };
  function offer(p) {
    const ps = pillars(p), n = ps.filter((x) => x[1]).length, g = G();
    const why = K.days() < 21 ? 'It\'s too soon. Everybody\'s still looking.' : (g.heat || 0) >= 60 || (g.awayNotice || 0) >= 50 ? 'People are too close. You can feel it.' : n < 3 ? 'Your life out here isn\'t steady enough yet.' : '';
    K.D('Disappear for good?', ['Not running anymore. Not hiding. Just... staying gone. Letting your old life close behind you like water.', ...ps.map(([t, ok]) => `${ok ? '✓' : '·'} ${t}`), why || 'You could do it. You really could. It would cost you things you can\'t get back.'],
      (why ? [] : [{ t: 'Disappear for good', cls: 'hot', sub: 'This ends the game with a never-found ending.', fn: () => K.D('Are you sure?', ['Your mom. Your room. Your name. Everyone who is looking for you.', 'This is the kind of choice you only get once.'], [{ t: 'Yes. Stay gone.', cls: 'hot', fn: () => { g.flags.goneForGood = 1; SH.EndX.trigger('gone', { place: p }); } }, { t: 'Not yet', fn: K.back }]) }]).concat([{ t: 'Back', fn: K.back }]));
  }
  K.me((p, ch) => { if (K.days() >= 14 && !G().later) ch.push({ t: '🌫️ Disappear for good', sub: ready(p) ? 'You could. Really.' : 'Not yet', fn: () => offer(p) }); });
  K.daily.push(() => { const g = G(); if (!g.away || g.later || g.flags.goneOffered || K.days() < 45) return; const p = A.here(); if (!ready(p)) return; g.flags.goneOffered = 1; setTimeout(() => offer(p), 100); });
  SH.NotFound = { pillars, ready, offer };
})(window.SH);
