/* SMALL HOURS — procedural Harlow. Every story seed builds a different town: river side, street grid, rail line,
   where you live and where everything else ends up. Saved in G.city so a playthrough keeps its own town. */
(function (SH) {
  const W = 1000, H = 650;
  const mul = (a) => () => { a |= 0; a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  const HPOOL = ['1st St', 'Center Ave', 'Oak St', 'Grand Ave', 'Elm St', 'Lake St', 'Park Ave', 'Main St', 'Chestnut St'];
  const VPOOL = ['Mill Rd', 'Depot Rd', 'Cedar Ave', '2nd St', 'Hill Rd', 'Ash Ln', 'Pine St', 'Union St', 'Kettle Rd'];
  const C = SH.City = {};

  C.riverY = function (city, x) { const R = city.river; for (let i = 1; i < R.length; i++) if (x <= R[i][0]) { const [a, b] = R[i - 1], [c, d] = R[i]; return b + (d - b) * ((x - a) / (c - a || 1)); } return R[R.length - 1][1]; };
  C.railY = function (city, x) { const [a, b, c, d] = city.rail; return b + (d - b) * ((x - a) / (c - a)); };

  C.generate = function (seed) {
    const r = mul((+seed || 1) * 7919 + 17), ri = (a, b) => a + Math.floor(r() * (b - a + 1)), rf = (a, b) => a + r() * (b - a), pick = (a) => a[Math.floor(r() * a.length)];
    const city = { seed: +seed || 1 };
    const riverBottom = r() < 0.6;
    const base = riverBottom ? rf(565, 605) : rf(45, 85), ph = rf(0, 6), per = rf(140, 230), amp = rf(12, 32);
    city.river = []; for (let x = -30; x <= 1040; x += 110) city.river.push([x, Math.round(base + Math.sin(x / per + ph) * amp + rf(-6, 6))]);
    city.riverBottom = riverBottom;
    // streets
    const wharf = Math.round(riverBottom ? base - 62 - amp : base + 62 + amp);
    const landTop = riverBottom ? 30 : wharf + 20, landBot = riverBottom ? wharf - 20 : 630;
    const nH = ri(3, 4), hs = []; for (let i = 0; i < nH; i++) hs.push(Math.round(landTop + (landBot - landTop) * ((i + 0.5) / nH) + rf(-22, 22)));
    city.h = hs.map((y) => ({ y, n: '' })); city.h.push({ y: wharf, n: 'Wharf St', wharf: true });
    city.h.sort((a, b) => a.y - b.y);
    const vs = []; let x = ri(60, 120); while (x < 960) { vs.push(x); x += ri(140, 215); }
    city.v = vs.map((x) => ({ x, n: '' }));
    // rail: a gently sloped line between two avenues
    const inner = city.h.filter((h) => !h.wharf).map((h) => h.y).sort((a, b) => a - b); const gi = ri(0, inner.length - 2);
    const ry = (inner[gi] + inner[gi + 1]) / 2; const slope = rf(-40, 40); city.rail = [-10, Math.round(ry - slope / 2), 1010, Math.round(ry + slope / 2)];
    // which side of town you live on
    const west = r() < 0.5; const X = (u) => Math.round(west ? u : W - u);
    city.homeWest = west;
    const P = {}, placed = [];
    const ok = (p, md = 72) => p[0] > 36 && p[0] < 964 && p[1] > 34 && p[1] < 616 && Math.abs(p[1] - C.riverY(city, p[0])) > 46 && placed.every((q) => Math.hypot(q[0] - p[0], q[1] - p[1]) > md);
    const put = (id, gen, md) => { let p; for (let k = 0; k < 90; k++) { p = gen(); if (ok(p, k > 60 ? md * 0.7 : md)) break; } p = [Math.round(Math.max(40, Math.min(960, p[0]))), Math.round(Math.max(38, Math.min(612, p[1])))]; P[id] = p; placed.push(p); };
    const nearRoadY = () => pick(city.h.filter((h) => !h.wharf)).y;
    const onBlock = (y) => y + (r() < 0.5 ? -1 : 1) * rf(18, 28);
    put('home', () => [X(rf(120, 260)), onBlock(nearRoadY())], 80);
    put('patel', () => [P.home[0] + (west ? 1 : -1) * rf(52, 70), P.home[1] + rf(-12, 12)], 45);
    put('jordan', () => { const a = rf(0, 6.28), d = rf(150, 260); return [P.home[0] + Math.cos(a) * d, P.home[1] + Math.sin(a) * d]; }, 80);
    // the corner store sits on your street at the nearest cross street
    const homeRoad = city.h.filter((h) => !h.wharf).reduce((a, b) => (Math.abs(b.y - P.home[1]) < Math.abs(a.y - P.home[1]) ? b : a));
    homeRoad.n = 'Maple St';
    const vNear = (px) => city.v.reduce((a, b) => (Math.abs(b.x - px) < Math.abs(a.x - px) ? b : a));
    const storeV = city.v.filter((v) => Math.abs(v.x - P.home[0]) > 60).reduce((a, b) => (Math.abs(b.x - P.home[0]) < Math.abs(a.x - P.home[0]) ? b : a));
    put('store', () => [storeV.x + rf(-22, 22), homeRoad.y + (r() < 0.5 ? -1 : 1) * rf(20, 30)], 55);
    put('school', () => { const a = rf(0, 6.28), d = rf(160, 300); return [P.home[0] + Math.cos(a) * d, P.home[1] + Math.sin(a) * d]; }, 80);
    ['library', 'police', 'mall', 'hospital'].forEach((id) => put(id, () => [X(rf(380, 920)), rf(50, 600)], 85));
    const riverLand = (px, off) => C.riverY(city, px) + (riverBottom ? -1 : 1) * off;
    put('park', () => { const px = X(rf(330, 660)); return [px, riverLand(px, rf(70, 110))]; }, 90);
    put('diner', () => { const px = X(rf(430, 720)); return [px, wharf + (riverBottom ? -1 : 1) * rf(18, 30)]; }, 75);
    put('laundromat', () => [X(rf(190, 470)), rf(60, 600)], 75);
    // Route 9: the one road with a real bridge; the underpass is where it meets the river
    const bridgeV = city.v.filter((v) => { const u = west ? v.x : W - v.x; return u > 300 && u < 760; }); const b9 = bridgeV.length ? pick(bridgeV) : city.v[Math.floor(city.v.length / 2)];
    b9.n = 'Route 9'; b9.bridge = true; city.bridgeX = b9.x;
    put('underpass', () => [b9.x + rf(-14, 14), riverLand(b9.x, rf(40, 52))], 50);
    put('bus', () => [X(rf(690, 900)), rf(80, 580)], 85);
    put('harbor', () => { const px = X(rf(740, 950)); return [px, wharf + (riverBottom ? -1 : 1) * rf(18, 30)]; }, 80);
    put('station', () => { const px = X(rf(560, 820)); return [px, C.railY(city, px) + (r() < 0.5 ? -18 : 18)]; }, 80);
    put('trainyard', () => { const px = X(rf(890, 955)); return [px, C.railY(city, px) + rf(-8, 8)]; }, 60);
    city.pos = P;
    // names
    const hp = HPOOL.slice(); city.h.forEach((h) => { if (!h.n) { h.n = hp.splice(Math.floor(r() * hp.length), 1)[0]; } });
    const vp = VPOOL.slice(); storeV.n = storeV.n || '5th St'; const jv = vNear(P.jordan[0]); if (!jv.n) jv.n = 'Birch Ln';
    city.v.forEach((v) => { if (!v.n) v.n = vp.splice(Math.floor(r() * vp.length), 1)[0]; });
    // green space
    city.greens = [[P.park[0], P.park[1], rf(80, 105), rf(50, 66), rf(-0.4, 0.4)]];
    if (r() < 0.7) { const s = P.school; city.greens.push([s[0] + rf(-40, 40), s[1] + rf(20, 35), 40, 24, 0]); }
    city.name = pick(['Harlow']);
    return city;
  };

  // write a city onto the live location table, bus route and map
  C.apply = function () {
    const G = SH.G; if (!G) return;
    if (!G.city || !G.city.pos) G.city = C.generate((G.story && G.story.seed) || 1);
    const city = SH.CITY = G.city;
    for (const id in city.pos) if (SH.LOC[id]) { SH.LOC[id].x = city.pos[id][0]; SH.LOC[id].y = city.pos[id][1]; }
    const hn = (id) => { const y = SH.LOC[id].y; return city.h.reduce((a, b) => (Math.abs(b.y - y) < Math.abs(a.y - y) ? b : a)).n; };
    const vn = (id) => { const x = SH.LOC[id].x; return city.v.reduce((a, b) => (Math.abs(b.x - x) < Math.abs(a.x - x) ? b : a)).n; };
    SH.LOC.home.sub = '14 Maple St'; SH.LOC.patel.sub = '16 Maple St'; SH.LOC.store.sub = 'Corner of Maple & ' + vn('store');
    SH.LOC.jordan.sub = '88 ' + vn('jordan'); SH.LOC.library.sub = hn('library') + ' · Free wifi. Outlets. Warm.';
    // bus: nearest-neighbour loop starting at home
    const stops = Object.keys(SH.LOC).filter((id) => SH.LOC[id].bus && id !== 'home'); const route = ['home']; let cur = 'home';
    while (stops.length) { let bi = 0, bd = 1e9; stops.forEach((id, i) => { const d = Math.hypot(SH.LOC[id].x - SH.LOC[cur].x, SH.LOC[id].y - SH.LOC[cur].y); if (d < bd) { bd = d; bi = i; } }); cur = stops.splice(bi, 1)[0]; route.push(cur); }
    route.push('home'); SH.BUS_ROUTE = route;
    if (SH.Map) { SH.Map.cache = null; SH.Map.cacheKey = null; }
  };

  // wire into game creation; loads/rewinds call C.apply via SH.afterRestore / SH.load
  const baseNew = SH.newGame;
  SH.newGame = function () { baseNew.apply(this, arguments); SH.G.city = null; C.apply(); };

  /* ---------- drawing the generated town ---------- */
  const M = SH.Map;
  M.drawBase = function (x) {
    const city = SH.CITY; if (!city) return;
    const r = mul(city.seed * 31 + 5), dark = SH.isDark();
    x.fillStyle = dark ? '#0f141d' : '#1b2330'; x.fillRect(0, 0, W, H);
    const xs = [0].concat(city.v.map((v) => v.x), [W]), ys = [0].concat(city.h.map((h) => h.y), [H]);
    const cx = 500, cy = 325;
    for (let i = 0; i < xs.length - 1; i++) for (let j = 0; j < ys.length - 1; j++) {
      const x0 = xs[i] + 11, y0 = ys[j] + 11, x1 = xs[i + 1] - 11, y1 = ys[j + 1] - 11; if (x1 - x0 < 12 || y1 - y0 < 12) continue;
      const dens = 8 + Math.round(10 * (1 - Math.hypot((x0 + x1) / 2 - cx, (y0 + y1) / 2 - cy) / 600));
      for (let k = 0; k < dens; k++) { const bw = 9 + r() * 26, bh = 9 + r() * 20, bx = x0 + r() * Math.max(1, x1 - x0 - bw), by = y0 + r() * Math.max(1, y1 - y0 - bh);
        if (Math.abs(by + bh / 2 - C.riverY(city, bx + bw / 2)) < 42) continue;
        if (Math.abs(by + bh / 2 - C.railY(city, bx + bw / 2)) < 12) continue;
        x.fillStyle = dark ? `rgba(40,50,70,${0.4 + r() * 0.3})` : `rgba(60,72,95,${0.5 + r() * 0.3})`; x.fillRect(bx, by, bw, bh);
        if (dark && r() < 0.3) { x.fillStyle = 'rgba(255,200,110,.5)'; x.fillRect(bx + bw / 2, by + bh / 2, 2, 2); } }
    }
    city.greens.forEach(([gx, gy, rx, ryy, rot]) => { x.fillStyle = dark ? '#132418' : '#23402b'; x.beginPath(); x.ellipse(gx, gy, rx, ryy, rot, 0, 7); x.fill(); });
    // river
    x.lineCap = 'round'; x.lineJoin = 'round';
    x.strokeStyle = dark ? '#10243d' : '#24507f'; x.lineWidth = 50; x.beginPath(); city.river.forEach(([a, b], i) => (i ? x.lineTo(a, b) : x.moveTo(a, b))); x.stroke();
    x.strokeStyle = dark ? '#16324f' : '#2f64a0'; x.lineWidth = 32; x.stroke();
    // roads
    x.lineCap = 'butt';
    const road = (a, b, c, d) => { x.strokeStyle = dark ? '#2a3140' : '#3f4a5e'; x.lineWidth = 12; x.beginPath(); x.moveTo(a, b); x.lineTo(c, d); x.stroke(); x.strokeStyle = dark ? '#4a4030' : '#8a7a50'; x.lineWidth = 1; x.setLineDash([8, 10]); x.stroke(); x.setLineDash([]); };
    city.h.forEach((h) => road(0, h.y, W, h.y));
    city.v.forEach((v) => { if (v.bridge) { road(v.x, 0, v.x, H); return; } const ry = C.riverY(city, v.x); if (city.riverBottom) road(v.x, 0, v.x, ry - 30); else road(v.x, ry + 30, v.x, H); });
    // bridge deck
    const by = C.riverY(city, city.bridgeX); x.fillStyle = dark ? '#3b4252' : '#6b7486'; x.fillRect(city.bridgeX - 12, by - 28, 24, 56);
    // railway: ties + rails
    const [ra, rb, rc, rd] = city.rail; const len = Math.hypot(rc - ra, rd - rb), ux = (rc - ra) / len, uy = (rd - rb) / len;
    x.strokeStyle = dark ? '#3a3226' : '#6a5a44'; x.lineWidth = 2; for (let s = 0; s < len; s += 9) { const px = ra + ux * s, py = rb + uy * s; x.beginPath(); x.moveTo(px - uy * 5, py + ux * 5); x.lineTo(px + uy * 5, py - ux * 5); x.stroke(); }
    x.strokeStyle = dark ? '#6d6a66' : '#a9a49c'; x.lineWidth = 1.2; [-3, 3].forEach((o) => { x.beginPath(); x.moveTo(ra - uy * o, rb + ux * o); x.lineTo(rc - uy * o, rd + ux * o); x.stroke(); });
    // yard sidings
    const ty = SH.LOC.trainyard; x.strokeStyle = dark ? '#3a3226' : '#5a4a36'; x.lineWidth = 2; for (let i = -2; i <= 2; i++) { x.beginPath(); x.moveTo(ty.x - 60, ty.y + i * 10); x.lineTo(ty.x + 60, ty.y + i * 10 + 3); x.stroke(); }
    // labels
    x.fillStyle = 'rgba(200,210,230,.38)'; x.font = '10px system-ui';
    city.h.forEach((h) => x.fillText(h.n, 14, h.y - 8));
    city.v.forEach((v) => { x.save(); x.translate(v.x + 10, city.riverBottom ? 22 : H - 90); x.rotate(Math.PI / 2); x.fillText(v.n, 0, 0); x.restore(); });
    x.fillStyle = 'rgba(120,170,230,.55)'; x.font = 'italic 12px Georgia'; const lx = SH.CITY.homeWest ? 760 : 160; x.fillText('Harlow River', lx, C.riverY(city, lx) + 4);
    x.fillStyle = 'rgba(200,190,170,.45)'; x.font = 'italic 10px Georgia'; x.fillText('Northline Railroad', 40, C.railY(city, 40) - 8);
  };
  M.patrolY = (i) => { const c = SH.CITY; return c ? c.h[i % c.h.length].y : [175, 345, 540][i % 3]; };
  M.patrolX = (i) => { const c = SH.CITY; return c ? c.v[(i * 2 + 1) % c.v.length].x : [330, 560, 760][i % 3]; };
})(window.SH);
