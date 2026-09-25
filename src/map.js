/* SMALL HOURS — the town map */
(function (SH) {
  const U = SH.util, $ = (s) => document.querySelector(s);
  const M = SH.Map = { open: false, sel: null, hover: null, patrols: [], base: null };
  const W = 1000, H = 650;
  const RIVER = [[280, 700], [380, 640], [470, 605], [600, 572], [700, 580], [780, 598], [880, 612], [1010, 606]];
  const ROADS_H = [[0, 175, 1000, 175, '1st St'], [0, 345, 1000, 345, 'Center Ave'], [0, 480, 700, 500, 'Maple St'], [620, 540, 1000, 540, 'Wharf St']];
  const ROADS_V = [[160, 0, 160, 650, 'Birch Ln'], [330, 0, 330, 650, '5th St'], [560, 0, 560, 650, 'Route 9'], [760, 0, 760, 650, 'Mill Rd'], [900, 0, 900, 650, 'Depot Rd']];
  function rng(seed) { let s = seed; return () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; }; }

  M.init = function () {
    M.c = $('#mapCanvas'); M.x = M.c.getContext('2d');
    M.c.addEventListener('mousemove', (e) => { const id = M.hit(e); if (id !== M.hover) { M.hover = id; M.c.style.cursor = id ? 'pointer' : 'crosshair'; } });
    M.c.addEventListener('click', (e) => { const id = M.hit(e); M.sel = id; M.info(); });
    for (let i = 0; i < 3; i++) M.patrols.push({ x: U.ri(100, 900), y: U.ri(100, 550), road: i % 2, dir: 1 });
    const loop = (t) => { if (M.open) M.draw(t / 1000); requestAnimationFrame(loop); }; requestAnimationFrame(loop);
  };
  M.tf = function () { const cw = M.c.clientWidth, ch = M.c.clientHeight; const s = Math.min(cw / W, ch / H) * 0.98; return { s, ox: (cw - W * s) / 2, oy: (ch - H * s) / 2 }; };
  M.visible = (id) => { const L = SH.LOC[id]; return !L.hidden || SH.f('knowsHarbor'); };
  M.hit = function (e) { const r = M.c.getBoundingClientRect(), { s, ox, oy } = M.tf(); const mx = (e.clientX - r.left - ox) / s, my = (e.clientY - r.top - oy) / s;
    let best = null, bd = 30; for (const id in SH.LOC) { if (!M.visible(id)) continue; const L = SH.LOC[id]; const d = Math.hypot(L.x - mx, L.y - my); if (d < bd) { bd = d; best = id; } } return best; };

  M.drawBase = function (x) {
    const r = rng(42), dark = SH.isDark();
    x.fillStyle = dark ? '#0f141d' : '#1b2330'; x.fillRect(0, 0, W, H);
    // blocks
    const xs = [0, 160, 330, 560, 760, 900, 1000], ys = [0, 175, 345, 490, 650];
    for (let i = 0; i < xs.length - 1; i++) for (let j = 0; j < ys.length - 1; j++) {
      const x0 = xs[i] + 12, y0 = ys[j] + 12, x1 = xs[i + 1] - 12, y1 = ys[j + 1] - 12;
      for (let k = 0; k < 14; k++) { const bw = 10 + r() * 28, bh = 10 + r() * 22, bx = x0 + r() * Math.max(1, x1 - x0 - bw), by = y0 + r() * Math.max(1, y1 - y0 - bh);
        x.fillStyle = dark ? `rgba(40,50,70,${0.4 + r() * 0.3})` : `rgba(60,72,95,${0.5 + r() * 0.3})`; x.fillRect(bx, by, bw, bh);
        if (dark && r() < 0.3) { x.fillStyle = 'rgba(255,200,110,.5)'; x.fillRect(bx + bw / 2, by + bh / 2, 2, 2); } }
    }
    // parks
    x.fillStyle = dark ? '#132418' : '#23402b'; x.beginPath(); x.ellipse(540, 420, 95, 60, -0.2, 0, 7); x.fill();
    x.fillRect(360, 270, 80, 55);
    // rail yard
    x.strokeStyle = dark ? '#3a3226' : '#5a4a36'; x.lineWidth = 2; for (let i = 0; i < 5; i++) { x.beginPath(); x.moveTo(860, 225 + i * 12); x.lineTo(1000, 215 + i * 12); x.stroke(); }
    // river
    x.strokeStyle = dark ? '#10243d' : '#24507f'; x.lineWidth = 46; x.lineCap = 'round'; x.lineJoin = 'round';
    x.beginPath(); RIVER.forEach(([a, b], i) => (i ? x.lineTo(a, b) : x.moveTo(a, b))); x.stroke();
    x.strokeStyle = dark ? '#16324f' : '#2f64a0'; x.lineWidth = 30; x.stroke();
    // roads
    x.lineCap = 'butt'; const road = (a, b, c, d) => { x.strokeStyle = dark ? '#2a3140' : '#3f4a5e'; x.lineWidth = 12; x.beginPath(); x.moveTo(a, b); x.lineTo(c, d); x.stroke(); x.strokeStyle = dark ? '#4a4030' : '#8a7a50'; x.lineWidth = 1; x.setLineDash([8, 10]); x.stroke(); x.setLineDash([]); };
    ROADS_H.forEach((q) => road(...q)); ROADS_V.forEach((q) => road(...q));
    // bridge
    x.fillStyle = dark ? '#3b4252' : '#6b7486'; x.fillRect(548, 560, 24, 42);
    // labels
    x.fillStyle = 'rgba(200,210,230,.35)'; x.font = '10px system-ui';
    ROADS_H.forEach((q) => x.fillText(q[4], q[0] + 20, q[1] - 8)); ROADS_V.forEach((q) => { x.save(); x.translate(q[0] + 10, 40); x.rotate(Math.PI / 2); x.fillText(q[4], 0, 0); x.restore(); });
    x.fillStyle = 'rgba(120,170,230,.5)'; x.font = 'italic 12px Georgia'; x.fillText('Harlow River', 640, 600);
  };

  M.draw = function (time) {
    const G = SH.G; if (!G) return;
    const c = M.c, x = M.x, dpr = window.devicePixelRatio || 1, cw = c.clientWidth, ch = c.clientHeight;
    if (c.width !== cw * dpr || c.height !== ch * dpr) { c.width = cw * dpr; c.height = ch * dpr; }
    const { s, ox, oy } = M.tf();
    x.setTransform(dpr, 0, 0, dpr, 0, 0); x.fillStyle = '#0b0e14'; x.fillRect(0, 0, cw, ch);
    x.setTransform(dpr * s, 0, 0, dpr * s, dpr * ox, dpr * oy);
    // cached, clipped base layer (static per day/night) — was being redrawn every frame
    const dark = SH.isDark(), key = dark ? 'd' : 'l';
    if (!M.cache || M.cacheKey !== key) { const oc = document.createElement('canvas'); oc.width = W * 2; oc.height = H * 2; const ox2 = oc.getContext('2d'); ox2.scale(2, 2); ox2.beginPath(); ox2.rect(0, 0, W, H); ox2.clip(); M.drawBase(ox2); M.cache = oc; M.cacheKey = key; }
    x.save(); x.beginPath(); if (x.roundRect) x.roundRect(0, 0, W, H, 14); else x.rect(0, 0, W, H); x.clip();
    x.drawImage(M.cache, 0, 0, W, H);
    // bus route
    x.strokeStyle = 'rgba(255,190,90,.35)'; x.lineWidth = 3; x.setLineDash([2, 6]); x.beginPath();
    SH.BUS_ROUTE.forEach((id, i) => { if (!M.visible(id)) return; const L = SH.LOC[id]; i ? x.lineTo(L.x, L.y) : x.moveTo(L.x, L.y); }); x.stroke(); x.setLineDash([]);
    // heat overlay (run)
    if (G.phase === 'run' && G.discoveredAt) {
      ['home', 'school', 'jordan', 'park', 'bus', 'hospital'].forEach((id) => { const L = SH.LOC[id]; const rr = 30 + G.heat * 0.9; const g = x.createRadialGradient(L.x, L.y, 5, L.x, L.y, rr); g.addColorStop(0, `rgba(255,60,80,${0.12 + G.heat / 600})`); g.addColorStop(1, 'rgba(255,60,80,0)'); x.fillStyle = g; x.beginPath(); x.arc(L.x, L.y, rr, 0, 7); x.fill(); });
      if (G.revealed && SH.LOC[G.revealed]) { const L = SH.LOC[G.revealed]; x.strokeStyle = `rgba(255,70,90,${0.5 + 0.5 * Math.sin(time * 5)})`; x.lineWidth = 3; x.beginPath(); x.arc(L.x, L.y, 32, 0, 7); x.stroke(); }
      if (G.reported) M.patrols.forEach((p, i) => { const sp = 0.6 + G.heat / 80; if (p.road) { p.x += sp * p.dir; if (p.x > 990 || p.x < 10) p.dir *= -1; p.y = M.patrolY ? M.patrolY(i) : [175, 345, 540][i % 3]; } else { p.y += sp * p.dir; if (p.y > 640 || p.y < 10) p.dir *= -1; p.x = M.patrolX ? M.patrolX(i) : [330, 560, 760][i % 3]; }
        const blink = Math.sin(time * 10 + i) > 0; x.fillStyle = blink ? '#ff3355' : '#3377ff'; x.beginPath(); x.arc(p.x, p.y, 5, 0, 7); x.fill(); x.fillStyle = 'rgba(255,255,255,.1)'; x.beginPath(); x.arc(p.x, p.y, 22, 0, 7); x.fill(); });
    }
    // location markers
    x.textAlign = 'center';
    for (const id in SH.LOC) {
      if (!M.visible(id)) continue; const L = SH.LOC[id], open = SH.isOpen(id), here = G.loc === id;
      const rad = M.hover === id || M.sel === id ? 19 : 16;
      x.fillStyle = here ? '#f2a65a' : open ? (id === 'harbor' ? '#3a2c18' : '#1e2638') : '#151a24'; x.strokeStyle = M.sel === id ? '#fff' : here ? '#ffd9a8' : open ? '#56627a' : '#2a3140'; x.lineWidth = 2;
      x.beginPath(); x.arc(L.x, L.y, rad, 0, 7); x.fill(); x.stroke();
      x.globalAlpha = open ? 1 : 0.4; x.font = '16px serif'; x.fillText(L.icon, L.x, L.y + 6); x.globalAlpha = 1;
      x.font = (here ? 'bold ' : '600 ') + '11.5px system-ui'; x.lineWidth = 3.5; x.strokeStyle = 'rgba(8,10,16,.85)'; x.strokeText(L.name, L.x, L.y + rad + 14); x.fillStyle = here ? '#ffd9a8' : open ? '#e6eaf2' : '#7a8396'; x.fillText(L.name, L.x, L.y + rad + 14);
      if (id === 'harbor') { const g = x.createRadialGradient(L.x, L.y, 2, L.x, L.y, 40); g.addColorStop(0, 'rgba(255,200,110,.25)'); g.addColorStop(1, 'rgba(255,200,110,0)'); x.fillStyle = g; x.beginPath(); x.arc(L.x, L.y, 40, 0, 7); x.fill(); }
    }
    // player
    const P = SH.LOC[G.loc]; const pr = 6 + Math.sin(time * 3) * 2;
    x.fillStyle = 'rgba(92,200,176,.25)'; x.beginPath(); x.arc(P.x, P.y, 26 + pr, 0, 7); x.fill();
    x.fillStyle = '#5cc8b0'; x.beginPath(); x.arc(P.x + 13, P.y - 13, 6, 0, 7); x.fill(); x.strokeStyle = '#0b0e14'; x.lineWidth = 2; x.stroke();
    if (G.phone.share && G.phase === 'run') { x.fillStyle = '#6aa7ff'; x.font = 'bold 10px system-ui'; x.fillText('📍 sharing', P.x, P.y - 30); }
    // hover card
    if (M.hover && M.hover !== M.sel) { const L = SH.LOC[M.hover], o = SH.travelOptions ? SH.travelOptions(M.hover) : []; const best = o && o.length ? o.reduce((a, b) => (a.mins <= b.mins ? a : b)) : null;
      const l1 = L.name, l2 = (SH.isOpen(M.hover) ? 'Open' : 'Closed') + (M.hover === G.loc ? ' · you are here' : best ? ` · ${best.label || 'walk'} ${best.mins != null ? best.mins + ' min' : ''}` : '');
      x.font = 'bold 12px system-ui'; const w = Math.max(x.measureText(l1).width, (x.font = '11px system-ui', x.measureText(l2).width)) + 20; let bx = L.x + 24, by = L.y - 44; if (bx + w > W - 6) bx = L.x - 24 - w; if (by < 6) by = L.y + 20;
      x.fillStyle = 'rgba(14,18,28,.94)'; x.strokeStyle = '#3a4560'; x.lineWidth = 1; x.beginPath(); x.roundRect ? x.roundRect(bx, by, w, 38, 8) : x.rect(bx, by, w, 38); x.fill(); x.stroke();
      x.textAlign = 'left'; x.fillStyle = '#fff'; x.font = 'bold 12px system-ui'; x.fillText(l1, bx + 10, by + 16); x.fillStyle = '#9aa3b5'; x.font = '11px system-ui'; x.fillText(l2, bx + 10, by + 31); x.textAlign = 'center'; }
    x.restore();
    x.strokeStyle = '#2a3346'; x.lineWidth = 1.5; x.beginPath(); x.roundRect ? x.roundRect(0, 0, W, H, 14) : x.rect(0, 0, W, H); x.stroke();
    // night / weather overlay
    x.setTransform(dpr, 0, 0, dpr, 0, 0);
    if (dark) { x.fillStyle = 'rgba(5,8,20,.28)'; x.fillRect(0, 0, cw, ch); }
    if (SH.raining()) { x.strokeStyle = 'rgba(160,180,220,.25)'; x.beginPath(); for (let i = 0; i < 80; i++) { const rx = (i * 97 + time * 300) % cw, ry = (i * 53 + time * 600) % ch; x.moveTo(rx, ry); x.lineTo(rx - 3, ry + 9); } x.stroke(); }
  };

  M.info = function () {
    const box = $('#mapInfo'), G = SH.G, id = M.sel;
    if (!id) { box.classList.add('hidden'); return; }
    const L = SH.LOC[id], open = SH.isOpen(id);
    let extra = '';
    if (G.phase === 'run') { const risk = ['home', 'school', 'jordan', 'park', 'bus', 'hospital'].includes(id) ? 'High: they\'ll look here.' : L.vis > 0.6 ? 'Visible. Lots of eyes.' : L.vis > 0.3 ? 'Some eyes.' : 'Out of sight.'; extra = `<p>👁 ${risk}</p>`; }
    if (id === 'patel' && G.phase === 'home') extra += `<p>Walks Newton: Tue & Thu, 4 to 7 PM. $8.</p>`;
    let html = `<h3>${L.icon} ${L.name}</h3><p style="color:var(--muted)">${L.sub} · ${open ? '<span style="color:#9fe3b0">Open</span>' : '<span style="color:#ff9aa5">Closed</span>'} · ${L.indoor ? 'Indoors' : 'Outdoors'}</p><p>${L.blurb}</p>${extra}`;
    if (id === G.loc) html += '<p style="color:var(--teal)">You are here.</p>';
    else SH.travelOptions(id).forEach((o, i) => { html += `<button class="btn" data-i="${i}">${o.label}: ${o.mins} min${o.cost ? ' · $' + o.cost : ''}${o.note ? '<br><small style="color:var(--muted)">' + o.note + '</small>' : ''}</button>`; });
    box.innerHTML = html; box.classList.remove('hidden');
    box.querySelectorAll('button').forEach((b) => (b.onclick = () => { const o = SH.travelOptions(id)[+b.dataset.i]; SH.UI.closeMap(); SH.travel(id, o); }));
  };
})(window.SH);
