/* SMALL HOURS — towns as real places (5/5): the town map and a few things that happen when you get somewhere.
   While you're away, the map (M key / Map button / Maps app) shows the town you're in: its streets, its places,
   what's open, how far on foot. Tap a place, walk there. Harlow's places are hidden until you go back. */
(function (SH) {
  const TW = SH.Town, M = SH.Map; if (!TW || !M) return;
  const G = () => SH.G, W = 1000, H = 650;
  /* visibility: only the town you're in */
  const bVis = M.visible;
  M.visible = function (id) {
    const L = SH.LOC[id]; if (!L) return false; const g = G();
    if (g && g.away) return L.town === g.away && !L.hidden;
    if (L.town) return false;
    return bVis(id);
  };
  let cache = null, ckey = '';
  function base(T) {
    const oc = document.createElement('canvas'); oc.width = W * 2; oc.height = H * 2; const x = oc.getContext('2d'); x.scale(2, 2);
    const dark = SH.isDark(), r = TW.rng('map' + T.pid), p = SH.Atlas.here();
    const bg = { fields: dark ? '#141a12' : '#26301f', coast: dark ? '#0f161c' : '#1f2b33', forest: dark ? '#0f1812' : '#1c2b20', hills: dark ? '#15161a' : '#2a2c30', lake: dark ? '#10161c' : '#1f2a30', river: dark ? '#121814' : '#232e25' }[TW.biome(p.biome)] || (dark ? '#0f141d' : '#1b2330');
    x.fillStyle = bg; x.fillRect(0, 0, W, H);
    const tier = T.tier, MY = T.MY;
    // fields / water around small places
    if (tier === 'village' || tier === 'small') { for (let i = 0; i < 26; i++) { x.fillStyle = `rgba(${dark ? '60,70,40' : '120,130,70'},${0.08 + r() * 0.1})`; x.fillRect(r() * W, r() * H, 60 + r() * 140, 40 + r() * 90); } }
    if (/coast|lake/.test(TW.biome(p.biome))) { x.fillStyle = dark ? '#0d2238' : '#244f7c'; x.beginPath(); x.moveTo(0, H); for (let i = 0; i <= 10; i++) x.lineTo(i * 100, H - 60 - Math.sin(i * 1.3) * 18); x.lineTo(W, H); x.fill(); }
    // streets
    const road = (a, b, c, d, w) => { x.strokeStyle = dark ? '#2a3140' : '#46526a'; x.lineWidth = w || 12; x.lineCap = 'round'; x.beginPath(); x.moveTo(a, b); x.lineTo(c, d); x.stroke(); };
    const nV = { village: 1, small: 3, town: 5, city: 7 }[tier] || 3, span = tier === 'village' ? [200, 800] : tier === 'small' ? [110, 890] : [30, 970];
    // blocks of buildings along streets
    const bld = (x0, y0, x1, y1, dens) => { for (let k = 0; k < dens; k++) { const bw = 8 + r() * 20, bh = 8 + r() * 16, bx = x0 + r() * Math.max(1, x1 - x0 - bw), by = y0 + r() * Math.max(1, y1 - y0 - bh); x.fillStyle = dark ? `rgba(40,50,70,${0.45 + r() * 0.3})` : `rgba(70,82,105,${0.5 + r() * 0.3})`; x.fillRect(bx, by, bw, bh); if (dark && r() < 0.35) { x.fillStyle = 'rgba(255,200,110,.5)'; x.fillRect(bx + bw / 2, by + bh / 2, 2, 2); } } };
    const vx = []; for (let i = 0; i < nV; i++) vx.push(Math.round(span[0] + (span[1] - span[0]) * ((i + 0.5) / nV) + (r() - 0.5) * 40));
    const hy = [MY]; if (tier === 'town' || tier === 'city') { hy.push(MY - 160, MY + 150); } if (tier === 'city') hy.push(MY - 270, MY + 250);
    const dens = { village: 5, small: 9, town: 14, city: 22 }[tier] || 8;
    hy.forEach((y) => { bld(span[0], y - 60, span[1], y - 12, dens * 2); bld(span[0], y + 12, span[1], y + 60, dens * 2); });
    vx.forEach((vv) => bld(vv - 55, 30, vv - 12, H - 30, dens), vx.forEach((vv) => bld(vv + 12, 30, vv + 55, H - 30, dens)));
    // green
    const pk = T.locs[TW.id(T.pid, 'park')]; if (pk) { x.fillStyle = dark ? '#132418' : '#2a4a30'; x.beginPath(); x.ellipse(pk.x, pk.y, 70, 44, 0, 0, 7); x.fill(); }
    // roads on top
    road(T.east ? span[0] : 0, MY, T.east ? W : span[1], MY, 16); // main street runs out to the highway
    hy.slice(1).forEach((y) => road(span[0], y, span[1], y));
    vx.forEach((vv) => road(vv, tier === 'village' ? MY - 150 : 20, vv, tier === 'village' ? MY + 150 : H - 20));
    // connectors to every place so you can see how you'd walk there
    Object.values(T.locs).forEach((L) => { if (L.hidden) return; road(L.x, L.y, L.x, MY, 6); });
    // center line on main street
    x.strokeStyle = dark ? '#4a4030' : '#9a8a5a'; x.lineWidth = 1.2; x.setLineDash([10, 10]); x.beginPath(); x.moveTo(T.east ? span[0] : 0, MY); x.lineTo(T.east ? W : span[1], MY); x.stroke(); x.setLineDash([]);
    // rail
    if (T.rail) { const ry = T.railY; x.strokeStyle = dark ? '#3a3226' : '#6a5a44'; x.lineWidth = 2; for (let s = 0; s < W; s += 9) { x.beginPath(); x.moveTo(s, ry - 5); x.lineTo(s, ry + 5); x.stroke(); } x.strokeStyle = dark ? '#6d6a66' : '#a9a49c'; x.lineWidth = 1.2; [-3, 3].forEach((o) => { x.beginPath(); x.moveTo(0, ry + o); x.lineTo(W, ry + o); x.stroke(); }); }
    // labels
    x.fillStyle = 'rgba(210,220,235,.5)'; x.font = '600 11px system-ui'; x.fillText(T.street, (T.east ? span[0] : 30) + 10, MY - 12);
    x.fillStyle = 'rgba(210,200,170,.5)'; x.font = 'italic 11px Georgia'; x.fillText(T.east ? 'highway →' : '← highway', T.east ? W - 90 : 20, MY + 24);
    x.fillStyle = 'rgba(230,235,245,.8)'; x.font = 'bold 18px Georgia'; x.textAlign = 'right'; x.fillText(p.name, W - 22, 34); x.font = '12px system-ui'; x.fillStyle = 'rgba(200,210,225,.6)'; x.fillText(`${SH.Atlas.TIERS[tier].n} · pop. ${p.pop.toLocaleString()}`, W - 22, 52); x.textAlign = 'left';
    return oc;
  }
  function draw(time) {
    const g = G(), T = TW.cur(); if (!T) return false;
    const c = M.c, x = M.x, dpr = window.devicePixelRatio || 1, cw = c.clientWidth, ch = c.clientHeight;
    if (c.width !== cw * dpr || c.height !== ch * dpr) { c.width = cw * dpr; c.height = ch * dpr; }
    const t = M.tf();
    x.setTransform(dpr, 0, 0, dpr, 0, 0); x.fillStyle = '#0b0e14'; x.fillRect(0, 0, cw, ch);
    x.setTransform(dpr * t.s, 0, 0, dpr * t.s, dpr * t.ox, dpr * t.oy);
    const key = T.pid + (SH.isDark() ? 'd' : 'l') + Object.values(T.locs).map((l) => (l.hidden ? 0 : 1)).join('');
    if (!cache || ckey !== key || !M.cache) { cache = base(T); ckey = key; M.cache = cache; }
    x.save(); x.beginPath(); x.roundRect ? x.roundRect(0, 0, W, H, 14) : x.rect(0, 0, W, H); x.clip(); x.drawImage(cache, 0, 0, W, H);
    const here = SH.LOC[g.loc];
    // route preview
    if (M.sel && M.sel !== g.loc && M.visible(M.sel) && here) { const B = SH.LOC[M.sel]; x.strokeStyle = 'rgba(92,200,176,.85)'; x.lineWidth = 3; x.setLineDash([10, 7]); x.lineDashOffset = -time * 30; x.beginPath(); x.moveTo(here.x, here.y); x.lineTo(here.x, T.MY); x.lineTo(B.x, T.MY); x.lineTo(B.x, B.y); x.stroke(); x.setLineDash([]); }
    x.textAlign = 'center'; const boxes = [];
    for (const id in T.locs) {
      if (!M.visible(id)) continue; const L = SH.LOC[id], open = SH.isOpen(id), me = g.loc === id, rad = M.hover === id || M.sel === id ? 19 : 16;
      x.fillStyle = me ? '#f2a65a' : open ? '#1e2638' : '#151a24'; x.strokeStyle = M.sel === id ? '#fff' : me ? '#ffd9a8' : open ? '#56627a' : '#2a3140'; x.lineWidth = 2; x.beginPath(); x.arc(L.x, L.y, rad, 0, 7); x.fill(); x.stroke();
      x.globalAlpha = open ? 1 : 0.4; x.font = '16px serif'; x.fillText(L.icon, L.x, L.y + 6); x.globalAlpha = 1;
      x.font = (me ? 'bold ' : '600 ') + '11.5px system-ui'; x.lineWidth = 3.5; x.strokeStyle = 'rgba(8,10,16,.85)'; const lw = x.measureText(L.name).width + 6, hit = (y) => boxes.some((b) => Math.abs(b.x - L.x) * 2 < b.w + lw && Math.abs(b.y - y) < 13);
      let ly = [L.y + 30, L.y - 22, L.y + 43, L.y - 35, L.y + 56].find((y) => !hit(y)); if (ly == null) ly = L.y + 30; boxes.push({ x: L.x, y: ly, w: lw }); if (rad > 16 && ly > L.y) ly += 3;
      x.strokeText(L.name, L.x, ly); x.fillStyle = me ? '#ffd9a8' : open ? '#e6eaf2' : '#7a8396'; x.fillText(L.name, L.x, ly);
      if (L.kind === 'shelter') { const gg = x.createRadialGradient(L.x, L.y, 2, L.x, L.y, 40); gg.addColorStop(0, 'rgba(255,200,110,.25)'); gg.addColorStop(1, 'rgba(255,200,110,0)'); x.fillStyle = gg; x.beginPath(); x.arc(L.x, L.y, 40, 0, 7); x.fill(); }
    }
    if (here) { const pr = 6 + Math.sin(time * 3) * 2; x.fillStyle = 'rgba(92,200,176,.25)'; x.beginPath(); x.arc(here.x, here.y, 26 + pr, 0, 7); x.fill(); x.fillStyle = '#5cc8b0'; x.beginPath(); x.arc(here.x + 13, here.y - 13, 6, 0, 7); x.fill(); x.strokeStyle = '#0b0e14'; x.lineWidth = 2; x.stroke(); }
    if (M.hover && M.hover !== M.sel && M.visible(M.hover)) { const L = SH.LOC[M.hover], o = SH.travelOptions(M.hover) || [], best = o.length ? o.reduce((a, b) => (a.mins <= b.mins ? a : b)) : null;
      const l1 = L.name, l2 = (SH.isOpen(M.hover) ? 'Open' : 'Closed') + (M.hover === g.loc ? ' · you are here' : best ? ` · ${best.label} ${best.mins} min` : '');
      x.font = 'bold 12px system-ui'; const w = Math.max(x.measureText(l1).width, (x.font = '11px system-ui', x.measureText(l2).width)) + 20; let bx = L.x + 24, by = L.y - 44; if (bx + w > W - 6) bx = L.x - 24 - w; if (by < 6) by = L.y + 20;
      x.fillStyle = 'rgba(14,18,28,.94)'; x.strokeStyle = '#3a4560'; x.lineWidth = 1; x.beginPath(); x.roundRect ? x.roundRect(bx, by, w, 38, 8) : x.rect(bx, by, w, 38); x.fill(); x.stroke();
      x.textAlign = 'left'; x.fillStyle = '#fff'; x.font = 'bold 12px system-ui'; x.fillText(l1, bx + 10, by + 16); x.fillStyle = '#9aa3b5'; x.font = '11px system-ui'; x.fillText(l2, bx + 10, by + 31); }
    x.restore();
    x.setTransform(dpr, 0, 0, dpr, 0, 0);
    if (SH.isDark()) { x.fillStyle = 'rgba(5,8,20,.25)'; x.fillRect(0, 0, cw, ch); }
    if (SH.raining()) { x.strokeStyle = 'rgba(160,180,220,.25)'; x.beginPath(); for (let i = 0; i < 80; i++) { const rx = (i * 97 + time * 300) % cw, ry = (i * 53 + time * 600) % ch; x.moveTo(rx, ry); x.lineTo(rx - 3, ry + 9); } x.stroke(); }
    return true;
  }
  let lastHdr = '';
  function header() { const g = G(), T = g && g.away && TW.cur(); const k = T ? T.pid : 'home'; if (k === lastHdr) return; lastHdr = k; const b = document.querySelector('#mapTop b'), l = document.querySelector('#mapTop .legend'); if (!b || !l) return;
    if (T) { b.textContent = T.name; l.textContent = 'Tap a place to walk there · drag to pan · pinch/scroll to zoom · dim = closed right now'; } else { b.textContent = 'Harlow'; l.textContent = 'Tap a place · drag to pan · pinch/scroll to zoom · dashed amber = bus · fog = places you haven\'t found'; } }
  const bDraw = M.draw;
  M.draw = function (time) { header(); const g = G(); if (g && g.away && TW.loc() && draw(time)) return; if (M.cache === cache && cache) M.cache = null; return bDraw.apply(this, arguments); };
  const bInfo = M.info;
  M.info = function () {
    const g = G(); if (!(g && g.away && TW.loc())) return bInfo.apply(this, arguments);
    const box = document.querySelector('#mapInfo'), id = M.sel; if (!id || !M.visible(id)) { box.classList.add('hidden'); return; }
    const L = SH.LOC[id], open = SH.isOpen(id), ppl = TW.present(L).map((q) => q.n);
    let html = `<div class="sheetgrab"></div><h3>${L.icon} ${L.name}</h3><p style="color:var(--muted)">${L.sub} · ${open ? '<span style="color:#9fe3b0">Open</span>' : '<span style="color:#ff9aa5">Closed</span>'}${L.hours ? ` · ${L.hours[0]}:00–${L.hours[1] % 24}:00` : ''}</p><p>${L.blurb}</p>${ppl.length ? `<p>👥 ${ppl.join(', ')} ${ppl.length > 1 ? 'are' : 'is'} here.</p>` : ''}`;
    if (id === g.loc) html += '<p style="color:var(--teal)">You are here.</p>';
    else SH.travelOptions(id).forEach((o, i) => { html += `<button class="btn" data-i="${i}">${o.label}: ${o.mins} min${o.cost ? ' · $' + o.cost : ''}${o.note ? '<br><small style="color:var(--muted)">' + o.note + '</small>' : ''}</button>`; });
    box.innerHTML = html; box.classList.remove('hidden');
    box.querySelector('.sheetgrab').onclick = () => { M.sel = null; box.classList.add('hidden'); };
    box.querySelectorAll('button[data-i]').forEach((b) => (b.onclick = () => { const o = SH.travelOptions(id)[+b.dataset.i]; SH.UI.closeMap(); SH.travel(id, o); }));
  };

  /* ---------- small scenes ---------- */
  const E = SH.TownEvents = {};
  const D = (o) => SH.UI.dialog(o);
  E.car = function (p) {
    D({ title: 'A man in a nice car', text: ['A silver car slows down and matches your walking speed. The window comes down. "Hey. You look lost. Need a ride? I could buy you dinner. No big deal."', 'He\'s smiling. Your stomach does the thing it does when something is wrong. Listen to your stomach.'],
      choices: [{ t: 'Walk away fast, toward people', cls: 'safe', fn: () => { SH.st('stress', 10); SH.UI.log('You turn around and walk the other way, into the first store with people in it, and stand by the register until the car is gone. Your hands shake for twenty minutes. You were right to listen.', 'bad'); SH.UI.afterAction(); } },
        { t: 'Tell the clerk inside', cls: 'safe', fn: () => { SH.UI.log('You tell the clerk. She looks out the window, and her face goes hard. She writes down the plate. Then she looks at you, really looks.', 'warn'); SH.G._vol = 1; SH.Endings.found(p.hasPolice ? 'self' : 'sheriff'); } }] });
  };
  E.arrive = function (L) {
    const g = SH.G, st = TW.st(), k = L.kind, first = (st.seen[k] || 0) <= 1, dark = SH.isDark();
    if (!first) return;
    if (k === 'edge' && dark) SH.UI.log('No streetlights out here. When your eyes adjust, the sky is so full of stars it looks fake, like a screensaver. You didn\'t know there were this many. They were always there.', 'good');
    if (k === 'library' && g.reported && Math.random() < 0.4) SH.UI.log('The librarian looks at you over her glasses for one second longer than a librarian needs to. Then she goes back to her cart. Libraries are like that. They let you be.', 'warn');
    if (k === 'church' && Math.random() < 0.5) SH.UI.log('Somebody is practicing the organ, badly, one hand at a time. It\'s the saddest, most hopeful sound you\'ve ever heard.', '');
    if (k === 'grandma') SH.UI.log(SH.nm('Number 41. Blue door. A wind chime shaped like a fish. The kitchen light is on. You know that kitchen. You haven\'t seen it since you were nine.'), 'good');
  };
})(window.SH);
