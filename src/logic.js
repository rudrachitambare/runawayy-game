/* logic.js (turn 48): the "big ones" from the logic review.
   1. Weather after day 31 used to be a permanent 27–43°F storm, and the same everywhere. Now: seasonal weather
      for as long as you play, and every town gets its own (coast milder and foggier, hills colder, cities warmer,
      rain arriving a day early or late).
   2. (heat decay lives in run.js R.tick)
   3. Big stuff (tents, TVs, coolers, overflow) no longer teleports with you. It stays in the town where you left it
      and is there when you come back. Bikes and scooters come with you, because you ride them.
   4. The officer who finds you is local, not Officer Lowe from Harlow, and the ride home is a real ride home.
   5. (shoplifting memory lives in actions2.js A.shoplift) */
(function (SH) {
  const G = () => SH.G;
  const hash = (s) => { let h = 2166136261; s = String(s); for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; };
  const rnd = (s) => (hash(s) % 100000) / 100000;
  const places = () => (SH.Atlas && SH.Atlas.data ? SH.Atlas.data().places : []);
  const placeOf = (pid) => places().find((p) => p.id === pid);
  const pidNow = () => { const g = G(); if (!g) return null; if (g.away) return g.away; const m = /^t_(p\d+)_/.exec(g.loc || ''); return m ? m[1] : null; };

  /* ---------- 1. weather ---------- */
  const BASE = SH.WEATHER.slice(); // story.js may rewrite SH.WEATHER per seed; read it live below
  const NORM = [[33, 17], [37, 20], [48, 29], [61, 39], [72, 50], [81, 60], [85, 64], [83, 62], [76, 53], [63, 42], [49, 32], [37, 22]];
  const MON = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  const monthOf = (d) => { let m = 9, dd = (SH.START_DATE ? SH.START_DATE.day : 5) + d - 1; while (dd > MON[m]) { dd -= MON[m]; m = (m + 1) % 12; } return { m, dd }; };
  const seed = () => { const w = SH.WEATHER[1] || {}; return `${w.lo}|${w.hi}|${w.c}|${(SH.WEATHER[5] || {}).lo}`; };
  const gen = (d) => {
    const { m, dd } = monthOf(d), a = NORM[m], b = NORM[(m + 1) % 12], f = dd / MON[m];
    const hi0 = a[0] + (b[0] - a[0]) * f, lo0 = a[1] + (b[1] - a[1]) * f, s = seed();
    // weather comes in spells: a slow wobble over several days plus a daily jitter
    const spell = Math.sin((d + rnd(s + 'ph') * 20) / 3.1) * 6, jit = (rnd(s + d) - 0.5) * 8;
    const hi = Math.round(hi0 + spell + jit), lo = Math.round(Math.min(hi - 6, lo0 + spell * 0.8 + (rnd(s + 'l' + d) - 0.5) * 6));
    const wet = rnd(s + 'w' + d), summer = m >= 5 && m <= 7, wetDay = wet < (m >= 10 || m <= 2 ? 0.28 : 0.32);
    const c = wetDay ? (rnd(s + 'st' + d) < (summer ? 0.35 : 0.15) ? 'storm' : 'rain') : rnd(s + 'c' + d) < 0.4 ? 'cloudy' : rnd(s + 'f' + d) < ((m >= 8 && m <= 10) || (m >= 2 && m <= 4) ? 0.12 : 0.04) ? 'fog' : 'clear';
    return { lo, hi, c };
  };
  const baseDay = (d) => { const L = SH.WEATHER.length; return d >= 1 && d < L && SH.WEATHER[d] ? SH.WEATHER[d] : gen(d); };
  const local = (w, d, pid) => {
    const p = placeOf(pid); if (!p || p.home) return w;
    const b = String(p.biome || ''), h = hash(pid);
    let dl = 0, dh = 0;
    if (/coast|shore|bay|harbor|lake/.test(b)) { dl += 5; dh -= 3; }
    if (/mount|hill|ridge|highland/.test(b)) { dl -= 5; dh -= 6; }
    if (/forest|wood/.test(b)) { dl -= 2; dh -= 1; }
    if (/valley|river/.test(b)) dl -= 2;
    if (p.tier === 'city') { dl += 2; dh += 2; }
    dl += (h % 5) - 2; dh += ((h >> 3) % 5) - 2;
    const shift = ((h >> 6) % 3) - 1, wc = shift ? baseDay(Math.max(1, d + shift)).c : w.c;
    let c = wc; if (c === 'clear' && /coast|shore|bay/.test(b) && rnd(pid + d) < 0.25) c = 'fog';
    return { lo: Math.round(w.lo + dl), hi: Math.round(Math.max(w.lo + dl + 5, w.hi + dh)), c };
  };
  SH.weatherDay = (d = SH.day()) => { const w = baseDay(d), pid = SH.G ? pidNow() : null; return pid ? local(w, d, pid) : w; };
  SH.Weather2 = { gen, local, baseDay };

  /* ---------- 3. big stuff stays where you left it ---------- */
  const rides = (id) => { const c = SH.Catalog && SH.Catalog.ALL && SH.Catalog.ALL[id]; return !!(c && c.ride); };
  const nmOf = (w) => (w === 'harlow' ? 'Harlow' : ((placeOf(w) || {}).name || 'town'));
  const list = (ids) => { const c = {}; ids.forEach((id) => { const n = ((SH.ITEMS && SH.ITEMS[id]) || {}).n || id; c[n] = (c[n] || 0) + 1; }); const a = Object.entries(c).map(([n, k]) => (k > 1 ? `${k}× ${n.toLowerCase()}` : n.toLowerCase())); return a.length > 1 ? a.slice(0, -1).join(', ') + ' and ' + a[a.length - 1] : a[0]; };
  const whereKey = () => { const g = G(); return g.away || (g.phase === 'run' || g.phase === 'home' ? 'harlow' : null); };
  const swap = () => {
    const g = G(); if (!g || g.ended || !g.owned) return;
    const now = whereKey(); if (!now) return;
    if (g._where == null) { g._where = now; return; }
    if (g._where === now) return;
    const from = g._where; g._where = now; g.stored = g.stored || {};
    const leave = g.owned.filter((id) => !rides(id)), keep = g.owned.filter((id) => rides(id));
    if (leave.length) (g.stored[from] = g.stored[from] || []).push(...leave);
    const back = g.stored[now] || []; delete g.stored[now];
    g.owned = keep.concat(back);
    if (leave.length) SH.UI.log(`Your ${list(leave)} stay${leave.length > 1 ? '' : 's'} behind in ${nmOf(from)}. Too big to bring. ${leave.length > 1 ? 'They\'ll' : 'It\'ll'} be there if you go back.`, 'sys');
    if (back.length) SH.UI.log(`Your ${list(back)} ${back.length > 1 ? 'are' : 'is'} right where you left ${back.length > 1 ? 'them' : 'it'}.`, 'sys');
  };
  const bAdv = SH.advance;
  SH.advance = function () { try { swap(); } catch (e) { console.warn(e); } const r = bAdv.apply(this, arguments); try { swap(); } catch (e) { console.warn(e); } return r; };
  const bAA = SH.UI.afterAction;
  SH.UI.afterAction = function () { try { swap(); } catch (e) { console.warn(e); } return bAA.apply(this, arguments); };
  SH.Stuff = { swap, stored: () => (G().stored || {}) };

  /* ---------- 4. a local officer, a real ride home ---------- */
  const COPS = ['Ruiz', 'Hanley', 'Okonkwo', 'Brandt', 'Castillo', 'Pruitt', 'Nakamura', 'Sorensen', 'Dube', 'Whitaker', 'Aguilar', 'Kowalski'];
  const META = SH.NPCS_META && SH.NPCS_META.officer ? Object.assign({}, SH.NPCS_META.officer) : null;
  const EN = SH.Endings;
  if (EN && EN.found) {
    const bFound = EN.found;
    EN.found = function (reason) {
      const g = G(); if (!g || g.ended) return bFound.apply(this, arguments);
      const pid = pidNow(), p = pid && placeOf(pid);
      if (p && !p.home) {
        const dep = reason === 'sheriff' || !p.hasPolice, sur = COPS[hash(pid) % COPS.length];
        g._cop = { name: `${dep ? 'Deputy' : 'Officer'} ${sur}`, org: dep ? 'County Sheriff' : `${p.name} PD`, place: p.name };
      } else g._cop = null;
      if (META && SH.NPCS_META.officer) Object.assign(SH.NPCS_META.officer, g._cop ? { n: g._cop.name, full: g._cop.org } : META);
      return bFound.apply(this, arguments);
    };
  }
  const RIDE = 'Officer Lowe drives you home. You watch the town slide by from the back seat, the same streets you walked all night, much shorter by car.';
  const bNm = SH.nm;
  SH.nm = function (s) {
    s = bNm.apply(this, arguments); const g = SH.G;
    if (typeof s !== 'string' || !g || s.indexOf('Lowe') < 0 && s.indexOf('streets you walked all night') < 0) return s;
    const cop = g._cop;
    if (s.indexOf(RIDE) >= 0) {
      const long = (g.stats && g.stats.hoursOut) > 30;
      s = s.replace(RIDE, cop
        ? `${cop.name} keeps you at the station in ${cop.place} with a blanket and a vending-machine hot chocolate until a Harlow cruiser comes for you. It's hours of highway. You watch ${cop.place} slide away through the back window, then fields, then towns you only know from the bus, and then, much too soon, the Harlow water tower.`
        : `Officer Lowe drives you home. You watch the town slide by from the back seat, the same streets you walked ${long ? 'for days' : 'all night'}, much shorter by car.`);
    }
    if (cop) s = s.replace(/Officer Lowe/g, cop.name).replace(/Officer Lowe's/g, cop.name + '\'s');
    return s;
  };
})(window.SH);
