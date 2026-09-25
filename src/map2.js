/* SMALL HOURS — map upgrades: zoom/pan/pinch, fog of war, learned routines (people dots), weather layers, route preview, richer info sheet. */
(function (SH) {
  const M = SH.Map, $ = (s) => document.querySelector(s);
  const W = 1000, H = 650;
  M.v = { z: 1, px: 0, py: 0 };
  const baseTf = M.tf;
  M.tf = function () { const b = baseTf(); const s = b.s * M.v.z; const cw = M.c.clientWidth, ch = M.c.clientHeight; return { s, ox: (cw - W * s) / 2 + M.v.px, oy: (ch - H * s) / 2 + M.v.py, base: b.s }; };
  const clampPan = () => { const cw = M.c.clientWidth, ch = M.c.clientHeight, s = baseTf().s * M.v.z; const mx = Math.max(0, (W * s - cw) / 2 + 60), my = Math.max(0, (H * s - ch) / 2 + 60); M.v.px = Math.max(-mx, Math.min(mx, M.v.px)); M.v.py = Math.max(-my, Math.min(my, M.v.py)); };
  M.zoomAt = function (f, cx, cy) {
    const old = M.tf(), z = Math.max(1, Math.min(3.2, M.v.z * f)); if (z === M.v.z) return;
    const wx = (cx - old.ox) / old.s, wy = (cy - old.oy) / old.s; M.v.z = z; const nw = M.tf(); M.v.px += cx - (wx * nw.s + nw.ox); M.v.py += cy - (wy * nw.s + nw.oy); clampPan();
  };
  M.center = function (id) { const L = SH.LOC[id || SH.G.loc]; if (!L) return; M.v.px = 0; M.v.py = 0; const t = M.tf(), cw = M.c.clientWidth, ch = M.c.clientHeight; M.v.px = cw / 2 - (L.x * t.s + t.ox); M.v.py = ch / 2 - (L.y * t.s + t.oy); clampPan(); };

  M.fitMobile = function () { const c = M.c; if (!c.clientWidth) return; const b = baseTf(); const zh = (c.clientHeight * 0.92) / (H * b.s); M.v = { z: Math.max(1, Math.min(3.2, zh)), px: 0, py: 0 }; M.center(); };
  // fog of war: places you don't know about don't show up until you pass near them
  const baseVis = M.visible;
  M.visible = (id) => baseVis(id) && (!SH.World || SH.World.known(id));
  const fogged = () => Object.keys(SH.LOC).filter((id) => !SH.LOC[id].hidden && SH.World && !SH.World.known(id));

  const baseInit = M.init;
  M.init = function () {
    baseInit();
    const c = M.c, pts = new Map(); let drag = null, moved = 0, pinch = null;
    c.style.touchAction = 'none';
    c.addEventListener('wheel', (e) => { e.preventDefault(); const r = c.getBoundingClientRect(); M.zoomAt(e.deltaY < 0 ? 1.15 : 1 / 1.15, e.clientX - r.left, e.clientY - r.top); }, { passive: false });
    c.addEventListener('pointerdown', (e) => { pts.set(e.pointerId, { x: e.clientX, y: e.clientY }); moved = 0; if (pts.size === 1) drag = { x: e.clientX, y: e.clientY }; if (pts.size === 2) { const [a, b] = [...pts.values()]; pinch = { d: Math.hypot(a.x - b.x, a.y - b.y) }; } try { c.setPointerCapture(e.pointerId); } catch (x) {} });
    c.addEventListener('pointermove', (e) => {
      if (!pts.has(e.pointerId)) return; pts.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (pts.size === 2 && pinch) { const [a, b] = [...pts.values()], d = Math.hypot(a.x - b.x, a.y - b.y), r = c.getBoundingClientRect(); M.zoomAt(d / pinch.d, (a.x + b.x) / 2 - r.left, (a.y + b.y) / 2 - r.top); pinch.d = d; moved = 99; return; }
      if (drag) { const dx = e.clientX - drag.x, dy = e.clientY - drag.y; moved += Math.abs(dx) + Math.abs(dy); if (moved > 6) { M.v.px += dx; M.v.py += dy; clampPan(); c.style.cursor = 'grabbing'; } drag = { x: e.clientX, y: e.clientY }; }
    });
    const up = (e) => { pts.delete(e.pointerId); if (pts.size < 2) pinch = null; if (!pts.size) { drag = null; c.style.cursor = ''; } };
    c.addEventListener('pointerup', up); c.addEventListener('pointercancel', up);
    // swallow the click that ends a drag; handle fog clicks
    c.addEventListener('click', (e) => {
      if (moved > 6) { e.stopImmediatePropagation(); return; }
      if (!M.sel) { const r = c.getBoundingClientRect(), t = M.tf(), mx = (e.clientX - r.left - t.ox) / t.s, my = (e.clientY - r.top - t.oy) / t.s; const f = fogged().find((id) => Math.hypot(SH.LOC[id].x - mx, SH.LOC[id].y - my) < 34); if (f) { M.fogInfo(f); } }
    }, true);
    const wrap = $('#mapWrap'); if (wrap && !$('#mapZoom')) {
      const z = document.createElement('div'); z.id = 'mapZoom';
      z.innerHTML = '<button data-z="in" aria-label="Zoom in">+</button><button data-z="out" aria-label="Zoom out">−</button><button data-z="me" aria-label="Center on me">◎</button><button data-z="fit" aria-label="Fit">⤢</button>';
      wrap.appendChild(z);
      z.onclick = (e) => { const k = e.target.dataset.z; if (!k) return; const cw = c.clientWidth / 2, ch = c.clientHeight / 2; if (k === 'in') M.zoomAt(1.35, cw, ch); if (k === 'out') M.zoomAt(1 / 1.35, cw, ch); if (k === 'fit') M.v = { z: 1, px: 0, py: 0 }; if (k === 'me') { if (M.v.z < 1.8) M.v.z = 1.8; M.center(); } };
    }
    const leg = document.querySelector('#mapTop .legend'); if (leg) leg.textContent = 'Tap a place · drag to pan · pinch/scroll to zoom · dashed amber = bus · fog = places you haven\'t found';
  };

  const COL = (id) => (SH.NPCS_META[id] || {}).col || '#888';
  const baseDraw = M.draw;
  M.draw = function (time) {
    baseDraw(time);
    const G = SH.G; if (!G) return;
    const x = M.x, dpr = window.devicePixelRatio || 1, t = M.tf();
    x.save(); x.setTransform(dpr * t.s, 0, 0, dpr * t.s, dpr * t.ox, dpr * t.oy);
    // route preview
    if (M.sel && M.sel !== G.loc && M.visible(M.sel)) {
      const A = SH.LOC[G.loc], B = SH.LOC[M.sel]; x.strokeStyle = 'rgba(92,200,176,.85)'; x.lineWidth = 3; x.setLineDash([10, 7]); x.lineDashOffset = -time * 30;
      x.beginPath(); x.moveTo(A.x, A.y); x.lineTo(A.x, B.y); x.lineTo(B.x, B.y); x.stroke(); x.setLineDash([]);
      const o = SH.travelOptions(M.sel) || [], best = o.length ? o.reduce((a, b) => (a.mins <= b.mins ? a : b)) : null;
      if (best) { const lx = A.x, ly = (A.y + B.y) / 2; x.font = 'bold 11px system-ui'; const s = best.mins + ' min'; const w = x.measureText(s).width + 12; x.fillStyle = 'rgba(12,30,28,.92)'; x.fillRect(lx - w / 2, ly - 9, w, 18); x.fillStyle = '#9ff0dd'; x.textAlign = 'center'; x.fillText(s, lx, ly + 4); }
    }
    // learned routines: people you've seen here before who are probably here right now
    if (SH.World) {
      const seen = G.world.seen || {};
      const byLoc = {};
      Object.keys(seen).forEach((n) => { const w = SH.World.where(n); if (!w || !w.loc || !M.visible(w.loc)) return; if ((seen[n][w.loc] || 0) >= 2 || w.loc === G.loc) (byLoc[w.loc] = byLoc[w.loc] || []).push(n); });
      for (const id in byLoc) { const L = SH.LOC[id]; byLoc[id].slice(0, 4).forEach((n, i) => { const px = L.x - 18 + i * 12, py = L.y - 24; x.fillStyle = COL(n); x.beginPath(); x.arc(px, py, 6, 0, 7); x.fill(); x.strokeStyle = '#0b0e14'; x.lineWidth = 1.5; x.stroke(); x.fillStyle = '#fff'; x.font = 'bold 7px system-ui'; x.textAlign = 'center'; x.fillText(((SH.NPCS_META[n] || {}).ini || '?').slice(0, 1), px, py + 2.5); }); }
    }
    // fog of war
    fogged().forEach((id) => { const L = SH.LOC[id]; const g = x.createRadialGradient(L.x, L.y, 6, L.x, L.y, 70); g.addColorStop(0, 'rgba(150,160,180,.30)'); g.addColorStop(1, 'rgba(150,160,180,0)'); x.fillStyle = g; x.beginPath(); x.arc(L.x, L.y, 70, 0, 7); x.fill();
      x.fillStyle = 'rgba(220,225,235,.55)'; x.font = 'bold 18px Georgia'; x.textAlign = 'center'; x.fillText('?', L.x, L.y + 6); });
    x.restore();
    // weather layers (screen space)
    x.setTransform(dpr, 0, 0, dpr, 0, 0); const cw = M.c.clientWidth, ch = M.c.clientHeight, cnd = SH.cond();
    if (cnd === 'fog') { x.fillStyle = 'rgba(190,200,215,.10)'; x.fillRect(0, 0, cw, ch); for (let i = 0; i < 6; i++) { const fx = ((i * 211 + time * 12) % (cw + 400)) - 200, fy = (i * 137) % ch; const g = x.createRadialGradient(fx, fy, 10, fx, fy, 220); g.addColorStop(0, 'rgba(200,210,225,.12)'); g.addColorStop(1, 'rgba(200,210,225,0)'); x.fillStyle = g; x.fillRect(fx - 220, fy - 220, 440, 440); } }
    if (cnd === 'storm' && Math.sin(time * 0.7) > 0.995) { x.fillStyle = 'rgba(220,230,255,.18)'; x.fillRect(0, 0, cw, ch); }
    if (cnd === 'clear' && !SH.isDark()) { x.fillStyle = 'rgba(255,220,150,.03)'; x.fillRect(0, 0, cw, ch); }
    // compass + weather chip
    x.font = '600 12px system-ui'; x.textAlign = 'left'; x.fillStyle = 'rgba(14,18,28,.85)'; const lbl = `${SH.WICON[cnd]} ${SH.tempF()}°F · ${cnd}${SH.World && SH.World.vis() < 1 ? ' · low visibility' : ''}`; const lw = x.measureText(lbl).width + 16; x.fillRect(10, ch - 34, lw, 24); x.fillStyle = '#dfe6f2'; x.fillText(lbl, 18, ch - 18);
  };

  // info sheet: who you might find here, what the weather does to the trip
  const baseInfo = M.info;
  M.info = function () {
    baseInfo();
    const box = $('#mapInfo'), id = M.sel, G = SH.G; if (!id || box.classList.contains('hidden')) return;
    const seen = G.world.seen || {}, usual = Object.keys(seen).filter((n) => (seen[n][id] || 0) >= 2).map((n) => (SH.World.PEOPLE[n] || n));
    const now = SH.World ? SH.World.present(id) : [];
    let add = '';
    if (now.length && id === G.loc) add += `<p>👥 Here now: ${now.map((n) => SH.World.PEOPLE[n] || n).join(', ')}</p>`;
    else if (usual.length) add += `<p>👥 You've run into ${usual.join(', ')} here before.</p>`;
    const cnd = SH.cond(); if (['rain', 'storm'].includes(cnd) && !SH.LOC[id].indoor) add += '<p>🌧 Outdoors, in this weather. You\'ll get soaked.</p>'; if (cnd === 'fog') add += '<p>🌫 Fog. Harder to see — and to be seen.</p>';
    if (add) { const h3 = box.querySelector('h3'); const holder = document.createElement('div'); holder.innerHTML = add; const firstBtn = box.querySelector('button'); firstBtn ? box.insertBefore(holder, firstBtn) : box.appendChild(holder); }
    if (!box.querySelector('.sheetgrab')) { const g = document.createElement('div'); g.className = 'sheetgrab'; g.onclick = () => { M.sel = null; box.classList.add('hidden'); }; box.prepend(g); }
  };
  M.fogInfo = function (id) {
    const box = $('#mapInfo'); const hint = { laundromat: 'There\'s a part of 5th Street you never go down.', underpass: 'Somewhere under the Route 9 bridge. Kids talk about it.', trainyard: 'Past the depot, the tracks go somewhere.' }[id] || 'You haven\'t been this way.';
    box.innerHTML = `<div class="sheetgrab"></div><h3>❓ Unexplored</h3><p>${hint}</p><p style="color:var(--muted)">Travel nearby to find out what's here.</p>`; box.classList.remove('hidden');
    box.querySelector('.sheetgrab').onclick = () => box.classList.add('hidden');
  };
})(window.SH);
