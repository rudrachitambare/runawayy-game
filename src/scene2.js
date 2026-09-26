/* SMALL HOURS — scene renderer v2: layered, detailed, alive.
   Static layers are cached per (place, room, size, 10-min slot, weather); life (people, cars, weather, flicker) is drawn every frame. */
(function (SH) {
  const S = SH.Scene;
  const rng = (seed) => { let s = seed % 2147483647 || 7; return () => ((s = (s * 16807) % 2147483647) - 1) / 2147483646; };
  const hs = (str) => { let h = 7; for (const c of String(str)) h = (h * 31 + c.charCodeAt(0)) >>> 0; return h; };
  const lerp = (a, b, t) => a + (b - a) * t;
  const hx = (h) => h[0] === '#' ? [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)] : (h.match(/\d+(\.\d+)?/g) || [0, 0, 0]).slice(0, 3).map(Number);
  const mix = (a, b, t) => { const A = hx(a), B = hx(b); return `rgb(${Math.round(lerp(A[0], B[0], t))},${Math.round(lerp(A[1], B[1], t))},${Math.round(lerp(A[2], B[2], t))})`; };
  const KEYS = [[0, '#04060d', '#0c1120', '#070a14'], [5.2, '#0a0e20', '#1d1a38', '#0b0e1a'], [6.6, '#2e2c5c', '#f0a060', '#3a3040'], [8.3, '#5b8fd9', '#bcd8f2', '#6f7c92'], [16.3, '#5a8ed8', '#d2e4f5', '#6f7c92'], [17.9, '#3c2248', '#f58c62', '#4a3440'], [19.2, '#151935', '#3b2b4c', '#161a28'], [20.8, '#070a16', '#121830', '#0a0d17'], [24, '#04060d', '#0c1120', '#070a14']];
  function skyAt(h) { for (let i = 0; i < KEYS.length - 1; i++) { const a = KEYS[i], b = KEYS[i + 1]; if (h >= a[0] && h <= b[0]) { const t = (h - a[0]) / (b[0] - a[0]); return [mix(a[1], b[1], t), mix(a[2], b[2], t), mix(a[3], b[3], t)]; } } return ['#000', '#000', '#000']; }
  const dayLight = (h) => (h < 5.5 || h > 20.5 ? 0 : h < 7.5 ? (h - 5.5) / 2 : h > 18.5 ? (20.5 - h) / 2 : 1);
  S.v2 = { walkers: [], cars: [], birds: [], splash: [], cache: null, key: '' };

  /* ---------------- helpers ---------------- */
  const R = (x, c, X, Y, w, h) => { x.fillStyle = c; x.fillRect(X, Y, w, h); };
  function rr(x, X, Y, w, h, r) { x.beginPath(); if (x.roundRect) x.roundRect(X, Y, w, h, r); else x.rect(X, Y, w, h); }
  function glow(x, X, Y, r, col, a) { const g = x.createRadialGradient(X, Y, 0, X, Y, r); g.addColorStop(0, col.replace('A', a)); g.addColorStop(1, col.replace('A', 0)); x.fillStyle = g; x.fillRect(X - r, Y - r, r * 2, r * 2); }
  // window: dark glass by day (sky reflection), warm/cool light at night with a silhouette now and then
  function win(x, X, Y, w, h, E, on, r) {
    if (E.night && on) { x.fillStyle = E.warm; x.fillRect(X, Y, w, h); x.fillStyle = 'rgba(0,0,0,.18)'; x.fillRect(X, Y + h * 0.62, w, h * 0.38); if (r && r() < 0.12) { x.fillStyle = 'rgba(20,14,10,.55)'; x.fillRect(X + w * 0.3, Y + h * 0.35, w * 0.3, h * 0.65); } }
    else { const g = x.createLinearGradient(X, Y, X + w, Y + h); g.addColorStop(0, E.glassA); g.addColorStop(1, E.glassB); x.fillStyle = g; x.fillRect(X, Y, w, h); x.fillStyle = 'rgba(255,255,255,.08)'; x.fillRect(X, Y, w * 0.35, h); }
    x.strokeStyle = E.trim; x.lineWidth = 1; x.strokeRect(X + 0.5, Y + 0.5, w - 1, h - 1);
  }
  function facade(x, E, o) {
    const { cx, w, h } = o, X = cx - w / 2, Y = E.gy - h, r = rng(o.seed || 3);
    const base = E.shade(o.col);
    x.fillStyle = base; x.fillRect(X, Y, w, h);
    if (o.brick) { x.fillStyle = 'rgba(0,0,0,.10)'; for (let yy = Y + 4; yy < E.gy; yy += 6) x.fillRect(X, yy, w, 1); }
    if (o.siding) { x.fillStyle = 'rgba(0,0,0,.12)'; for (let yy = Y + 5; yy < E.gy; yy += 7) x.fillRect(X, yy, w, 1.2); }
    x.fillStyle = 'rgba(255,255,255,.05)'; x.fillRect(X, Y, w, 3);
    if (o.roof === 'gable') { x.fillStyle = E.shade(o.roofc || '#3a2f33'); x.beginPath(); x.moveTo(X - 12, Y + 2); x.lineTo(cx, Y - (o.pitch || 48)); x.lineTo(X + w + 12, Y + 2); x.fill(); }
    if (o.roof === 'flat') R(x, E.shade('#2a303c'), X - 4, Y - 6, w + 8, 7);
    if (o.roof === 'pediment') { x.fillStyle = E.shade(o.col); x.beginPath(); x.moveTo(X - 10, Y); x.lineTo(cx, Y - 30); x.lineTo(X + w + 10, Y); x.fill(); x.strokeStyle = 'rgba(0,0,0,.25)'; x.stroke(); }
    if (o.chimney) R(x, E.shade('#5a3a32'), X + w * 0.72, Y - 40, 14, 34);
    const wn = o.wins; if (wn) for (let rI = 0; rI < wn.rows; rI++) for (let c = 0; c < wn.cols; c++) {
      const wx = X + wn.px + c * (wn.w + wn.gx), wy = Y + wn.py + rI * (wn.h + wn.gy); if (wn.skip && wn.skip(c, rI)) continue;
      win(x, wx, wy, wn.w, wn.h, E, o.lit != null ? (typeof o.lit === 'function' ? o.lit(c, rI, r) : o.lit) : r() < 0.55, r);
      if (o.shutters) { R(x, E.shade(o.shutters), wx - 5, wy, 4, wn.h); R(x, E.shade(o.shutters), wx + wn.w + 1, wy, 4, wn.h); }
      if (o.sills) R(x, 'rgba(255,255,255,.14)', wx - 2, wy + wn.h, wn.w + 4, 2);
    }
    if (o.door) { const d = o.door; const dx = cx + (d.dx || 0) - d.w / 2; R(x, E.shade(d.col || '#4a2e22'), dx, E.gy - d.h, d.w, d.h); if (d.glass) win(x, dx + 3, E.gy - d.h + 3, d.w - 6, d.h - 6, E, o.open, null); x.fillStyle = '#d9b86a'; x.fillRect(dx + d.w - 6, E.gy - d.h / 2, 2, 2); if (d.light && E.night) glow(x, dx + d.w / 2, E.gy - d.h - 6, 38, 'rgba(255,205,130,A)', 0.55); }
    if (o.awning) { const a = o.awning; for (let i = 0; i < a.n; i++) { x.fillStyle = E.shade(i % 2 ? a.c1 : a.c2); x.beginPath(); const ax = X + a.px + i * a.sw; x.moveTo(ax, Y + a.py); x.lineTo(ax + a.sw, Y + a.py); x.lineTo(ax + a.sw + 3, Y + a.py + 14); x.lineTo(ax + 3, Y + a.py + 14); x.fill(); } }
    if (o.sign) { const s = o.sign; x.font = s.font || 'bold 12px system-ui'; const tw = x.measureText(s.t).width; const sx = cx + (s.dx || 0) - tw / 2, sy = Y + (s.dy || -8);
      if (s.plate) { R(x, E.shade(s.plate), sx - 8, sy - 13, tw + 16, 18); }
      if (s.neon && E.night) { x.shadowColor = s.c; x.shadowBlur = 12; x.fillStyle = (S.flick || 1) > 0.2 ? s.c : 'rgba(80,40,50,.6)'; } else x.fillStyle = s.day || s.c;
      x.fillText(s.t, sx, sy); x.shadowBlur = 0; }
  }
  function tree(x, E, X, sc, kind, r) {
    const trunk = E.shade('#3d2c22'), leaf = E.shade(kind === 'pine' ? '#23402f' : E.autumn[Math.floor(r() * E.autumn.length)]);
    R(x, trunk, X - 3 * sc, E.gy - 40 * sc, 6 * sc, 40 * sc);
    x.fillStyle = leaf;
    if (kind === 'pine') { x.beginPath(); x.moveTo(X, E.gy - 95 * sc); x.lineTo(X - 22 * sc, E.gy - 30 * sc); x.lineTo(X + 22 * sc, E.gy - 30 * sc); x.fill(); }
    else for (let i = 0; i < 5; i++) { x.beginPath(); x.arc(X + (r() - 0.5) * 30 * sc, E.gy - (52 + r() * 24) * sc, (14 + r() * 10) * sc, 0, 7); x.fill(); }
  }
  function lamp(x, E, X) { R(x, E.shade('#1d222c'), X, E.gy - 92, 3, 92); R(x, E.shade('#1d222c'), X, E.gy - 92, 16, 3); R(x, E.night ? '#ffd9a0' : E.shade('#8890a0'), X + 12, E.gy - 90, 7, 4); E.lamps.push([X + 15, E.gy - 86]); }
  function bench(x, E, X) { const c = E.shade('#4a3a2e'); R(x, c, X, E.gy - 16, 40, 4); R(x, c, X, E.gy - 26, 40, 3); R(x, c, X + 3, E.gy - 13, 3, 13); R(x, c, X + 34, E.gy - 13, 3, 13); }
  function hydrant(x, E, X) { R(x, E.shade('#b33a32'), X, E.gy - 14, 8, 14); R(x, E.shade('#b33a32'), X - 2, E.gy - 10, 12, 3); }
  function bin(x, E, X) { R(x, E.shade('#2f4a3a'), X, E.gy - 20, 14, 20); R(x, E.shade('#253b2e'), X - 1, E.gy - 22, 16, 3); }
  function mailbox(x, E, X) { R(x, E.shade('#555c68'), X + 3, E.gy - 22, 3, 22); rr(x, X - 3, E.gy - 30, 15, 9, 4); x.fillStyle = E.shade('#2b4f8a'); x.fill(); }
  function car(x, E, X, col, parked) { const y = E.gy + (parked ? 3 : 12); rr(x, X, y - 14, 58, 12, 4); x.fillStyle = E.shade(col); x.fill(); rr(x, X + 12, y - 23, 30, 10, 4); x.fill(); R(x, E.night ? 'rgba(255,220,160,.25)' : 'rgba(170,200,230,.45)', X + 15, y - 21, 11, 7); R(x, E.night ? 'rgba(255,220,160,.25)' : 'rgba(170,200,230,.45)', X + 28, y - 21, 11, 7); x.fillStyle = '#0c0d10'; x.beginPath(); x.arc(X + 13, y - 1, 5, 0, 7); x.arc(X + 45, y - 1, 5, 0, 7); x.fill(); }

  /* ---------------- locations as data + a little code ---------------- */
  const PL = {
    house(x, E, id) { const r = rng(hs(id)); const col = id === 'home' ? '#6c7a8f' : id === 'patel' ? '#8a6f5a' : '#6f8a72';
      tree(x, E, E.W * 0.16, 1.1, 'oak', r); facade(x, E, { cx: E.W * 0.52, w: 230, h: 104, col, siding: 1, roof: 'gable', roofc: '#3b3038', pitch: 56, chimney: 1, shutters: '#2c3444', sills: 1, seed: hs(id),
        wins: { rows: 2, cols: 3, w: 30, h: 24, px: 30, py: 14, gx: 55, gy: 20, skip: (c, rI) => rI === 1 && c === 1 }, door: { w: 30, h: 46, col: id === 'home' ? '#6b2f2a' : '#2f4a6b', light: true },
        lit: (c, rI, rr2) => (id === 'home' && SH.G.phase === 'run' ? rI === 0 : rr2() < 0.6) });
      R(x, E.shade('#8f8a80'), E.W * 0.52 - 26, E.gy - 4, 52, 4); mailbox(x, E, E.W * 0.52 + 150); lamp(x, E, E.W * 0.84);
      if (id === 'home') { R(x, E.shade('#5a5448'), E.W * 0.3, E.gy - 3, 60, 3); car(x, E, E.W * 0.27, SH.momWhere && SH.momWhere() === 'work' ? '#1b1b1b' : '#7a8594', true); }
      if (id === 'patel') { x.fillStyle = E.shade('#c7a4ff'); for (let i = 0; i < 6; i++) { x.beginPath(); x.arc(E.W * 0.38 + i * 9, E.gy - 6, 4, 0, 7); x.fill(); } }
      for (let i = 0; i < 18; i++) { x.fillStyle = E.shade(E.autumn[i % 3]); x.fillRect(r() * E.W, E.gy - 2 + r() * 4, 3, 2); } },
    school(x, E) { const r = rng(9); tree(x, E, E.W * 0.08, 1, 'oak', r); tree(x, E, E.W * 0.93, 1.1, 'oak', r);
      facade(x, E, { cx: E.W * 0.5, w: Math.min(E.W * 0.78, 560), h: 96, col: '#8a4d3c', brick: 1, roof: 'flat', seed: 4, sills: 1, lit: () => SH.isOpen('school') || r() < 0.08,
        wins: { rows: 2, cols: 10, w: 26, h: 22, px: 22, py: 14, gx: Math.max(10, (Math.min(E.W * 0.78, 560) - 44 - 260) / 9), gy: 16, skip: (c) => c === 4 || c === 5 }, door: { w: 54, h: 42, col: '#35506b', glass: 1 }, open: SH.isOpen('school'),
        sign: { t: 'LINCOLN MIDDLE SCHOOL', font: 'bold 12px Georgia', c: '#f1e7d0', dy: 12, plate: '#3a2a24' } });
      R(x, E.shade('#8a8f99'), E.W * 0.5 + 130, E.gy - 130, 3, 130); R(x, E.shade('#b83b3b'), E.W * 0.5 + 133, E.gy - 130, 24, 8); R(x, E.shade('#f0f0f0'), E.W * 0.5 + 133, E.gy - 122, 24, 4); R(x, E.shade('#2b4f8a'), E.W * 0.5 + 133, E.gy - 118, 24, 4);
      rr(x, E.W * 0.03, E.gy - 30, 90, 26, 5); x.fillStyle = E.shade('#e0a82e'); x.fill(); R(x, 'rgba(0,0,0,.35)', E.W * 0.03 + 6, E.gy - 26, 78, 8); bin(x, E, E.W * 0.5 - 200); },
    store(x, E) { const on = SH.isOpen('store'); facade(x, E, { cx: E.W * 0.47, w: 290, h: 78, col: '#d8d2c4', roof: 'flat', seed: 11, lit: on, open: on,
        wins: { rows: 1, cols: 3, w: 70, h: 40, px: 16, py: 26, gx: 20, gy: 0, skip: (c) => c === 1 }, door: { w: 40, h: 48, col: '#44505e', glass: 1 },
        sign: { t: 'QUIKMART', font: 'bold 18px system-ui', c: '#ff4d6d', day: '#c6283f', dy: 18, neon: 1 } });
      R(x, E.shade('#c6283f'), E.W * 0.47 - 150, E.gy - 82, 300, 5);
      const px = E.W * 0.47 + 190; R(x, E.shade('#d8d2c4'), px - 60, E.gy - 90, 150, 8); R(x, E.shade('#9aa0aa'), px - 50, E.gy - 82, 5, 82); R(x, E.shade('#9aa0aa'), px + 70, E.gy - 82, 5, 82);
      rr(x, px - 5, E.gy - 36, 18, 36, 3); x.fillStyle = E.shade('#e2e2e2'); x.fill(); rr(x, px + 30, E.gy - 36, 18, 36, 3); x.fill(); R(x, E.night ? '#ff4d6d' : E.shade('#c6283f'), px - 2, E.gy - 32, 12, 6);
      if (E.night) E.lamps.push([px + 15, E.gy - 84, 1.4]); x.font = 'bold 10px system-ui'; x.fillStyle = E.night ? '#ffe7a0' : E.shade('#333'); x.fillText('GAS  3.49', px - 40, E.gy - 94); bin(x, E, E.W * 0.47 - 170); },
    library(x, E) { const r = rng(5); tree(x, E, E.W * 0.12, 1.2, 'oak', r); tree(x, E, E.W * 0.88, 1.1, 'oak', r); const on = SH.isOpen('library');
      facade(x, E, { cx: E.W * 0.5, w: 320, h: 92, col: '#bdb39e', roof: 'pediment', seed: 5, lit: on, wins: { rows: 1, cols: 4, w: 34, h: 46, px: 30, py: 22, gx: 50, gy: 0, skip: (c) => c === 1 || c === 2 }, door: { w: 44, h: 56, col: '#3b2f28', glass: 1, light: true }, open: on,
        sign: { t: 'HARLOW PUBLIC LIBRARY · 1911', font: '600 10px Georgia', c: '#3a3024', day: '#3a3024', dy: -6 } });
      for (let i = 0; i < 6; i++) { const cxp = E.W * 0.5 - 135 + i * 54; if (i === 2 || i === 3) continue; R(x, E.shade('#d8d0bc'), cxp, E.gy - 88, 10, 88); R(x, 'rgba(0,0,0,.12)', cxp + 7, E.gy - 88, 3, 88); }
      for (let i = 0; i < 3; i++) R(x, E.shade('#a39a86'), E.W * 0.5 - 40 - i * 8, E.gy - 4 + i * 0 - (2 - i) * 3, 80 + i * 16, 3); bench(x, E, E.W * 0.5 + 180); lamp(x, E, E.W * 0.5 - 200); },
    park(x, E) { const r = rng(21); x.fillStyle = E.shade('#2e4a2e'); x.beginPath(); x.ellipse(E.W * 0.5, E.gy + 6, E.W * 0.7, 26, 0, Math.PI, 0); x.fill();
      for (let i = 0; i < 9; i++) tree(x, E, E.W * (0.04 + i * 0.12) + r() * 20, 0.9 + r() * 0.5, i % 4 === 3 ? 'pine' : 'oak', r);
      bench(x, E, E.W * 0.42); lamp(x, E, E.W * 0.34); lamp(x, E, E.W * 0.7);
      x.strokeStyle = E.shade('#8a8f99'); x.lineWidth = 3; x.beginPath(); x.moveTo(E.W * 0.58, E.gy); x.lineTo(E.W * 0.6, E.gy - 60); x.lineTo(E.W * 0.68, E.gy - 60); x.lineTo(E.W * 0.7, E.gy); x.stroke(); x.lineWidth = 1.2; x.beginPath(); x.moveTo(E.W * 0.62, E.gy - 60); x.lineTo(E.W * 0.62, E.gy - 22); x.moveTo(E.W * 0.66, E.gy - 60); x.lineTo(E.W * 0.66, E.gy - 22); x.stroke(); R(x, E.shade('#3a2e24'), E.W * 0.615, E.gy - 22, 20, 3);
      x.strokeStyle = E.shade('#5a6070'); x.lineWidth = 4; x.beginPath(); x.arc(E.W * 0.86, E.gy + 2, 36, Math.PI, 0); x.stroke(); x.lineWidth = 1; },
    police(x, E) { facade(x, E, { cx: E.W * 0.5, w: 330, h: 98, col: '#8a8f9a', brick: 1, roof: 'flat', seed: 8, lit: true, sills: 1, wins: { rows: 2, cols: 7, w: 26, h: 20, px: 24, py: 14, gx: 17, gy: 16, skip: (c, rI) => rI === 1 && c === 3 }, door: { w: 46, h: 44, col: '#2a3a55', glass: 1, light: true }, open: true,
        sign: { t: 'HARLOW POLICE DEPARTMENT', font: 'bold 11px system-ui', c: '#e9eef8', dy: 14, plate: '#1d2d55' } });
      car(x, E, E.W * 0.5 - 250, '#e8e8ee', true); R(x, E.shade('#1d2d55'), E.W * 0.5 - 240, E.gy - 8, 40, 4); E.siren = [E.W * 0.5 - 226, E.gy - 22]; R(x, E.shade('#9aa0aa'), E.W * 0.5 + 200, E.gy - 120, 3, 120); R(x, E.shade('#2b4f8a'), E.W * 0.5 + 203, E.gy - 120, 22, 14); },
    mall(x, E) { const on = SH.isOpen('mall'); facade(x, E, { cx: E.W * 0.5, w: Math.min(E.W * 0.9, 620), h: 84, col: '#b9b1a4', roof: 'flat', seed: 12, lit: on, open: on, wins: { rows: 1, cols: 5, w: 60, h: 38, px: 30, py: 34, gx: Math.max(10, (Math.min(E.W * 0.9, 620) - 60 - 300) / 4), gy: 0, skip: (c) => c === 2 }, door: { w: 80, h: 50, col: '#3a4454', glass: 1 },
        sign: { t: 'HARLOW MALL', font: 'bold 20px system-ui', c: '#6aa7ff', day: '#2b4f8a', dy: 22, neon: 1 } });
      R(x, E.shade('#9a9286'), E.W * 0.5 - 70, E.gy - 110, 140, 30); x.font = 'bold 9px system-ui'; x.fillStyle = E.night ? '#ffd66b' : E.shade('#333'); x.fillText('GAMESWAP · CINNABON · FOOT LOCKER · CLAIRE\'S', E.W * 0.5 - 118, E.gy - 92);
      for (let i = 0; i < 4; i++) car(x, E, E.W * 0.05 + i * 70, ['#9a3a3a', '#3a5a9a', '#cfcfcf', '#2a2a2a'][i], true); },
    hospital(x, E) { facade(x, E, { cx: E.W * 0.5, w: 260, h: 150, col: '#d6dbe2', roof: 'flat', seed: 13, lit: (c, rI, r) => r() < 0.7, wins: { rows: 5, cols: 7, w: 20, h: 14, px: 18, py: 14, gx: 12, gy: 12 }, door: { w: 60, h: 36, col: '#3a4a5a', glass: 1, light: true }, open: true,
        sign: { t: 'ST. BRIGID\'S', font: 'bold 13px Georgia', c: '#e6eef8', day: '#2a3a55', dy: -10 } });
      R(x, E.shade('#d6dbe2'), E.W * 0.5 + 150, E.gy - 44, 110, 44); x.font = 'bold 12px system-ui'; x.fillStyle = E.night ? '#ff5a6a' : '#c0283a'; x.fillText('EMERGENCY', E.W * 0.5 + 165, E.gy - 26); if (E.night) glow(x, E.W * 0.5 + 205, E.gy - 30, 60, 'rgba(255,80,100,A)', 0.25);
      x.fillStyle = '#e33'; x.fillRect(E.W * 0.5 - 7, E.gy - 186, 14, 36); x.fillRect(E.W * 0.5 - 18, E.gy - 175, 36, 14); },
    diner(x, E) { const cx = E.W * 0.48; rr(x, cx - 170, E.gy - 82, 340, 82, 34); x.fillStyle = E.shade('#b8c0c8'); x.fill(); R(x, E.shade('#d4526e'), cx - 170, E.gy - 30, 340, 6); R(x, 'rgba(255,255,255,.15)', cx - 150, E.gy - 76, 300, 3);
      for (let i = 0; i < 6; i++) win(x, cx - 140 + i * 48, E.gy - 66, 40, 28, E, true, null);
      if (E.night) { x.fillStyle = 'rgba(30,20,20,.55)'; x.fillRect(cx - 40, E.gy - 54, 8, 16); x.fillRect(cx + 60, E.gy - 52, 8, 14); }
      facade(x, E, { cx, w: 1, h: 82, col: '#b8c0c8', sign: { t: 'NITE OWL', font: 'italic bold 26px Georgia', c: '#ff5fa2', day: '#b0305f', dy: -18, neon: 1 } });
      facade(x, E, { cx: cx + 110, w: 1, h: 82, col: '#b8c0c8', sign: { t: 'OPEN 24 HRS', font: 'bold 11px system-ui', c: '#5ff', day: '#1c6a6a', dy: -34, neon: 1 } });
      car(x, E, cx + 200, '#6b8e5a', true); lamp(x, E, cx - 230); },
    laundromat(x, E) { facade(x, E, { cx: E.W * 0.5, w: 250, h: 80, col: '#6a8aa0', roof: 'flat', seed: 14, lit: true, open: true, wins: { rows: 1, cols: 1, w: 200, h: 42, px: 25, py: 22, gx: 0, gy: 0 }, sign: { t: 'SUDS & DUDS · COIN LAUNDRY', font: 'bold 11px system-ui', c: '#bfe8ff', day: '#fff', dy: 14 } });
      for (let i = 0; i < 5; i++) { x.fillStyle = E.shade('#e8eef4'); x.fillRect(E.W * 0.5 - 95 + i * 40, E.gy - 54, 30, 30); x.fillStyle = E.night ? '#9ec7e8' : E.shade('#4a6a88'); x.beginPath(); x.arc(E.W * 0.5 - 80 + i * 40, E.gy - 39, 10, 0, 7); x.fill(); } E.drums = true; },
    underpass(x, E) { R(x, E.shade('#4a4e56'), 0, E.gy - 130, E.W, 26); R(x, E.shade('#3a3e46'), 0, E.gy - 104, E.W, 6); for (let i = 0; i < 5; i++) R(x, E.shade('#50545c'), E.W * (0.08 + i * 0.22), E.gy - 104, 20, 104);
      x.font = 'bold 18px system-ui'; x.fillStyle = 'rgba(180,140,255,.45)'; x.fillText('W+R 4EVR', E.W * 0.28, E.gy - 60); x.fillStyle = 'rgba(92,200,176,.4)'; x.font = 'bold 13px system-ui'; x.fillText('SKY KING', E.W * 0.62, E.gy - 76);
      R(x, E.shade('#6a5a48'), E.W * 0.42, E.gy - 12, 60, 12); R(x, E.shade('#3a4a6a'), E.W * 0.56, E.gy - 10, 46, 10); R(x, E.shade('#8a8a8a'), E.W * 0.5, E.gy - 18, 12, 18); E.fire = [E.W * 0.506, E.gy - 20]; },
    bus(x, E) { facade(x, E, { cx: E.W * 0.4, w: 300, h: 86, col: '#9aa0a8', roof: 'flat', seed: 15, lit: true, open: true, wins: { rows: 1, cols: 4, w: 54, h: 34, px: 22, py: 26, gx: 16, gy: 0 }, sign: { t: 'GREYLINE', font: 'bold 16px system-ui', c: '#8ab4ff', day: '#1d2d55', dy: 18, neon: 1 } });
      const bx = E.W * 0.4 + 180; rr(x, bx, E.gy - 54, 200, 48, 8); x.fillStyle = E.shade('#e4e6ea'); x.fill(); R(x, E.shade('#2b4f8a'), bx, E.gy - 22, 200, 6); for (let i = 0; i < 6; i++) win(x, bx + 10 + i * 31, E.gy - 48, 24, 18, E, true, null); x.fillStyle = '#0c0d10'; x.beginPath(); x.arc(bx + 34, E.gy - 4, 8, 0, 7); x.arc(bx + 166, E.gy - 4, 8, 0, 7); x.fill();
      x.font = 'bold 9px system-ui'; x.fillStyle = E.night ? '#ffb347' : E.shade('#333'); x.fillText('CEDAR FALLS', bx + 140, E.gy - 29); },
    trainyard(x, E) { const r = rng(3); for (let i = 0; i < 5; i++) { const bx = E.W * 0.02 + i * (E.W * 0.2); rr(x, bx, E.gy - 62, E.W * 0.18, 54, 3); x.fillStyle = E.shade(['#6a3a2a', '#3a4a5a', '#6a5a2a', '#4a3a4a', '#2a4a3a'][i]); x.fill(); x.fillStyle = 'rgba(0,0,0,.2)'; for (let k = 6; k < E.W * 0.18; k += 8) x.fillRect(bx + k, E.gy - 60, 1.5, 50); x.font = 'bold 11px system-ui'; x.fillStyle = ['rgba(255,120,200,.55)', 'rgba(120,220,255,.5)', 'rgba(255,220,80,.5)'][i % 3]; x.fillText(['ZORK', 'MIRA', 'NOVA', 'KEEP GOING', 'HOME?'][i], bx + 10, E.gy - 30); x.fillStyle = '#0c0d10'; x.beginPath(); x.arc(bx + 14, E.gy - 6, 5, 0, 7); x.arc(bx + E.W * 0.18 - 14, E.gy - 6, 5, 0, 7); x.fill(); }
      x.strokeStyle = E.shade('#5a5e66'); x.lineWidth = 1.5; for (let i = 0; i < E.W; i += 12) { x.beginPath(); x.moveTo(i, E.gy - 70); x.lineTo(i, E.gy - 150); x.stroke(); } x.beginPath(); x.moveTo(0, E.gy - 150); x.lineTo(E.W, E.gy - 150); x.stroke(); lamp(x, E, E.W * 0.9); },
    harbor(x, E) { R(x, E.shade('#1d3450'), 0, E.gy - 30, E.W, 30); facade(x, E, { cx: E.W * 0.5, w: 220, h: 110, col: '#6a5a4a', siding: 1, roof: 'gable', roofc: '#3a2a24', pitch: 50, seed: 16, lit: true, sills: 1, wins: { rows: 2, cols: 4, w: 24, h: 22, px: 22, py: 14, gx: 26, gy: 18, skip: (c, rI) => rI === 1 && (c === 1 || c === 2) }, door: { w: 34, h: 44, col: '#8a3a2a', light: true },
        sign: { t: 'HARBOR HOUSE · 212 WHARF ST', font: '600 10px Georgia', c: '#ffd08a', day: '#3a2a24', dy: 16, plate: '#f1e7d0' } });
      R(x, E.shade('#d9c9a8'), E.W * 0.5 + 160, E.gy - 150, 12, 150); E.beacon = [E.W * 0.5 + 166, E.gy - 154]; bench(x, E, E.W * 0.5 - 190); },
    station(x, E) { facade(x, E, { cx: E.W * 0.46, w: 360, h: 96, col: '#9a7a5e', brick: 1, roof: 'gable', roofc: '#2e3a48', pitch: 38, seed: 17, lit: () => SH.isOpen('station'), sills: 1, wins: { rows: 1, cols: 6, w: 30, h: 44, px: 26, py: 30, gx: 24, gy: 0 }, door: { w: 44, h: 54, col: '#2e3a48', glass: 1, light: true }, open: SH.isOpen('station'),
        sign: { t: 'HARLOW', font: 'bold 14px Georgia', c: '#f1e7d0', day: '#2e2620', dy: 16, plate: '#d9c9a8' } });
      x.fillStyle = E.shade('#f1e7d0'); x.beginPath(); x.arc(E.W * 0.46, E.gy - 118, 12, 0, 7); x.fill(); x.strokeStyle = '#222'; x.lineWidth = 1.5; x.beginPath(); x.moveTo(E.W * 0.46, E.gy - 118); x.lineTo(E.W * 0.46 + 2, E.gy - 126); x.moveTo(E.W * 0.46, E.gy - 118); x.lineTo(E.W * 0.46 + 6, E.gy - 116); x.stroke();
      R(x, E.shade('#6a6e76'), E.W * 0.46 + 200, E.gy - 8, E.W, 8); R(x, E.shade('#2e3a48'), E.W * 0.46 + 200, E.gy - 70, E.W, 5); for (let i = 0; i < 4; i++) R(x, E.shade('#2e3a48'), E.W * 0.46 + 210 + i * 70, E.gy - 66, 4, 58); E.rail = true; },
  };
  PL.house2 = PL.house;
  SH.ScenePL = PL; // other files add art for new location types (pickup.js)
  SH.SceneKit = { R, rr, glow, win, facade, tree, lamp, bench, hydrant, bin, mailbox, car, rng, hs, mix }; // shared drawing helpers (town_art.js)

  /* ---------------- interiors (home, before you leave) ---------------- */
  function interior(x, E, room) {
    const { W, H } = E, G = SH.G, night = E.night, fl = H - 30;
    const wall = { bedroom: '#3b4a63', kitchen: '#6b6a55', living: '#5a4a44', bathroom: '#5a7482' }[room];
    const lamp = night ? 0.45 : 1; const wg = x.createLinearGradient(0, 0, 0, fl); wg.addColorStop(0, E.shadeI(wall, lamp * 0.8)); wg.addColorStop(1, E.shadeI(wall, lamp)); x.fillStyle = wg; x.fillRect(0, 0, W, fl);
    if (room === 'bathroom') { x.fillStyle = 'rgba(255,255,255,.07)'; for (let yy = fl - 90; yy < fl; yy += 12) x.fillRect(0, yy, W, 1); for (let xx = 0; xx < W; xx += 12) x.fillRect(xx, fl - 90, 1, 90); }
    else { x.fillStyle = 'rgba(0,0,0,.06)'; for (let xx = 0; xx < W; xx += 26) x.fillRect(xx, 0, 1, fl); }
    const fg = x.createLinearGradient(0, fl, 0, H); fg.addColorStop(0, E.shadeI(room === 'bathroom' ? '#8a9aa2' : room === 'kitchen' ? '#7a6a58' : '#5a4232', lamp)); fg.addColorStop(1, '#0a0806'); x.fillStyle = fg; x.fillRect(0, fl, W, 30);
    x.fillStyle = 'rgba(0,0,0,.25)'; for (let xx = 0; xx < W; xx += 38) x.fillRect(xx, fl, 1, 30); R(x, E.shadeI('#d8d0c0', lamp * 0.7), 0, fl - 6, W, 6);
    // window onto the actual sky
    const wx = W * 0.14, wy = 26, ww = 110, wh = 84; const [a, b] = skyAt(SH.hour()); const sg = x.createLinearGradient(0, wy, 0, wy + wh); sg.addColorStop(0, a); sg.addColorStop(1, b); x.fillStyle = sg; x.fillRect(wx, wy, ww, wh);
    x.fillStyle = night ? '#0a0d18' : 'rgba(40,52,78,.6)'; for (let i = 0; i < 5; i++) x.fillRect(wx + i * 24, wy + wh - 18 - (i * 13) % 20, 20, 30);
    if (night) { x.fillStyle = 'rgba(255,210,120,.5)'; x.fillRect(wx + 30, wy + wh - 10, 2, 3); x.fillRect(wx + 76, wy + wh - 14, 2, 3); }
    R(x, E.shadeI('#e8e2d4', lamp * 0.8), wx - 5, wy - 5, ww + 10, 5); R(x, E.shadeI('#e8e2d4', lamp * 0.8), wx - 5, wy + wh, ww + 10, 6); R(x, E.shadeI('#e8e2d4', lamp * 0.8), wx + ww / 2 - 2, wy, 4, wh); R(x, E.shadeI('#e8e2d4', lamp * 0.8), wx, wy + wh / 2 - 2, ww, 4);
    x.fillStyle = E.shadeI(room === 'bedroom' ? '#2b4f8a' : room === 'kitchen' ? '#c9a24a' : '#7a3a3a', lamp * 0.85); x.fillRect(wx - 22, wy - 8, 18, wh + 20); x.fillRect(wx + ww + 4, wy - 8, 18, wh + 20);
    E.window = [wx, wy, ww, wh];
    const P = (X, base, sc, col, sit) => { x.fillStyle = col; x.beginPath(); x.arc(X, base - (sit ? 52 : 74) * sc, 9 * sc, 0, 7); x.fill(); rr(x, X - 11 * sc, base - (sit ? 42 : 64) * sc, 22 * sc, (sit ? 30 : 44) * sc, 7 * sc); x.fill(); if (!sit) { x.fillRect(X - 8 * sc, base - 22 * sc, 6 * sc, 22 * sc); x.fillRect(X + 2 * sc, base - 22 * sc, 6 * sc, 22 * sc); } };
    const dim = (c) => E.shadeI(c, lamp);
    if (room === 'bedroom') {
      R(x, dim('#6b4a3a'), W * 0.52, fl - 44, 190, 12); rr(x, W * 0.52, fl - 62, 190, 22, 6); x.fillStyle = dim('#3a6a8a'); x.fill(); rr(x, W * 0.52 + 150, fl - 70, 36, 14, 6); x.fillStyle = dim('#e8e2d4'); x.fill(); R(x, dim('#4a3024'), W * 0.52 + 182, fl - 86, 8, 86); R(x, dim('#4a3024'), W * 0.52, fl - 58, 6, 58);
      rr(x, W * 0.55, 30, 64, 84, 3); x.fillStyle = dim('#1f2a4a'); x.fill(); x.fillStyle = dim('#5e5ce6'); x.beginPath(); x.moveTo(W * 0.55 + 10, 100); x.lineTo(W * 0.55 + 32, 44); x.lineTo(W * 0.55 + 54, 100); x.fill(); x.font = 'bold 8px system-ui'; x.fillStyle = dim('#ffd66b'); x.fillText('SKYFORGE', W * 0.55 + 10, 110);
      R(x, dim('#f4f0e6'), W * 0.55 + 76, 44, 34, 28); x.fillStyle = dim('#7bd88f'); x.beginPath(); x.arc(W * 0.55 + 93, 60, 7, 0, 7); x.fill();
      R(x, dim('#6b4a3a'), W * 0.84, fl - 50, 90, 6); R(x, dim('#4a3024'), W * 0.84 + 4, fl - 44, 5, 44); R(x, dim('#4a3024'), W * 0.84 + 80, fl - 44, 5, 44); R(x, dim('#2a2e36'), W * 0.84 + 50, fl - 62, 4, 12); R(x, dim('#e0c080'), W * 0.84 + 42, fl - 70, 20, 8); E.desklamp = [W * 0.84 + 52, fl - 60];
      R(x, dim('#c9a24a'), W * 0.52 + 30, fl - 8, 34, 8);
      if (night) { x.fillStyle = 'rgba(190,255,190,.5)'; const r = rng(4); for (let i = 0; i < 11; i++) x.fillRect(W * 0.3 + r() * W * 0.6, 6 + r() * 20, 2, 2); }
      if (SH.f('catInRoom')) { x.fillStyle = dim('#2a2522'); x.beginPath(); x.ellipse(W * 0.52 + 110, fl - 66, 12, 6, 0, 0, 7); x.fill(); x.beginPath(); x.arc(W * 0.52 + 98, fl - 70, 5, 0, 7); x.fill(); }
      if (SH.lilyWhere && SH.lilyWhere() === 'home' && SH.hour() > 7 && SH.hour() < 20.5 && (SH.day() + Math.floor(SH.hour())) % 4 === 0) P(W * 0.44, fl, 0.62, dim('#2a3a2c'));
    } else if (room === 'kitchen') {
      R(x, dim('#8a7a62'), W * 0.34, fl - 46, W * 0.36, 46); R(x, dim('#c8bca6'), W * 0.34, fl - 50, W * 0.36, 5); for (let i = 0; i < 4; i++) { R(x, dim('#7a6a52'), W * 0.34 + 6 + i * (W * 0.09), fl - 40, W * 0.08, 34); R(x, dim('#7a6a52'), W * 0.34 + 6 + i * (W * 0.09), 22, W * 0.08, 40); }
      R(x, dim('#dfe2e4'), W * 0.72, fl - 130, 60, 130); R(x, 'rgba(0,0,0,.2)', W * 0.72, fl - 84, 60, 2); x.fillStyle = ['#e05260', '#6aa7ff', '#ffd66b', '#7bd88f'].map(dim)[0]; x.fillRect(W * 0.72 + 12, fl - 118, 6, 6); x.fillStyle = dim('#f4f0e6'); x.fillRect(W * 0.72 + 26, fl - 116, 18, 22); x.fillStyle = dim('#ffd66b'); x.fillRect(W * 0.72 + 8, fl - 72, 16, 12);
      R(x, dim('#6b4a3a'), W * 0.84, fl - 40, 110, 6); R(x, dim('#4a3024'), W * 0.84 + 8, fl - 34, 5, 34); R(x, dim('#4a3024'), W * 0.84 + 96, fl - 34, 5, 34);
      if (SH.momWhere && SH.momWhere() === 'home' && SH.hour() > 6 && SH.hour() < 23) { P(W * 0.84 + 76, fl, 0.8, dim('#27393c'), true); R(x, dim('#f4f0e6'), W * 0.84 + 30, fl - 44, 26, 3); }
      E.pendant = [W * 0.84 + 55, 20];
    } else if (room === 'living') {
      rr(x, W * 0.36, fl - 58, 200, 44, 10); x.fillStyle = dim('#5a3a3a'); x.fill(); rr(x, W * 0.36, fl - 78, 200, 30, 10); x.fillStyle = dim('#4a2e2e'); x.fill(); R(x, dim('#3a2424'), W * 0.36 + 6, fl - 14, 8, 14); R(x, dim('#3a2424'), W * 0.36 + 186, fl - 14, 8, 14);
      R(x, dim('#2a2a2e'), W * 0.78, fl - 44, 110, 44); R(x, '#05060a', W * 0.78 + 8, fl - 112, 94, 60); E.tv = [W * 0.78 + 8, fl - 112, 94, 60];
      R(x, dim('#e8e2d4'), W * 0.4, 34, 40, 30); R(x, dim('#e8e2d4'), W * 0.4 + 52, 30, 30, 40); R(x, dim('#e8e2d4'), W * 0.4 + 94, 38, 34, 26); x.fillStyle = dim('#8a8a8a'); x.fillRect(W * 0.4 + 4, 38, 32, 22); x.fillRect(W * 0.4 + 56, 34, 22, 32); x.fillRect(W * 0.4 + 98, 42, 26, 18);
      if (SH.rickWhere && SH.rickWhere() === 'home' && SH.hour() > 8) { P(W * 0.36 + 150, fl - 14, 0.95, dim('#2a1a14'), true); const d = SH.rickDrunk ? SH.rickDrunk() : 0; for (let i = 0; i < d * 2 + 1; i++) R(x, dim('#c9c2a8'), W * 0.66 + i * 9, fl - 10 - (i % 2) * 3, 5, 9); E.rick = 1; }
    } else {
      rr(x, W * 0.36, fl - 46, 180, 44, 16); x.fillStyle = dim('#e8eef4'); x.fill(); R(x, dim('#c8d0d8'), W * 0.36 - 6, 20, 6, fl - 60); x.fillStyle = dim('#8ab4c8'); for (let i = 0; i < 8; i++) x.fillRect(W * 0.36 + i * 12, 22, 10, fl - 76);
      R(x, dim('#e8eef4'), W * 0.72, fl - 60, 70, 12); R(x, dim('#c8d0d8'), W * 0.72 + 28, fl - 48, 14, 48); R(x, dim('#9ab0bc'), W * 0.72 + 6, 34, 58, 70); R(x, 'rgba(255,255,255,.18)', W * 0.72 + 10, 38, 16, 62); R(x, dim('#e05260'), W * 0.9, 60, 26, 50);
    }
  }

  function extras(x, E, room) {
    const { W, H } = E, fl = H - 30, night = E.night, lampk = night ? 0.45 : 1, dim = (c) => E.shadeI(c, lampk), r = rng(room.length * 97);
    x.fillStyle = 'rgba(0,0,0,.18)'; x.beginPath(); x.ellipse(W * 0.6, fl + 14, W * 0.3, 10, 0, 0, 7); x.fill();
    R(x, dim('#2a2e36'), W / 2 - 1, 0, 2, 10); rr(x, W / 2 - 16, 8, 32, 8, 4); x.fillStyle = dim('#e8e2d4'); x.fill(); E.ceil = [W / 2, 18];
    if (room === 'bedroom') {
      const bx = W * 0.36; R(x, dim('#5a3e2e'), bx, fl - 120, 70, 120); for (let s2 = 0; s2 < 4; s2++) { R(x, dim('#3e2a20'), bx + 3, fl - 118 + s2 * 29, 64, 3); let px = bx + 5; while (px < bx + 62) { const bw = 4 + r() * 5, bh = 14 + r() * 10; R(x, dim(['#b8562b', '#2b4f8a', '#7bd88f', '#c9a24a', '#8a3a55', '#5cc8b0', '#e8e2d4'][Math.floor(r() * 7)]), px, fl - 118 + s2 * 29 + 29 - bh, bw, bh); px += bw + 1; } }
      x.fillStyle = dim('#8a3a3a'); x.beginPath(); x.ellipse(W * 0.66, fl + 12, 90, 11, 0, 0, 7); x.fill(); x.strokeStyle = dim('#c9a24a'); x.lineWidth = 2; x.beginPath(); x.ellipse(W * 0.66, fl + 12, 78, 8, 0, 0, 7); x.stroke();
      rr(x, W * 0.83, fl - 36, 26, 34, 7); x.fillStyle = dim('#2c6e8a'); x.fill(); R(x, dim('#1f4f63'), W * 0.83 + 4, fl - 24, 18, 10);
      x.fillStyle = dim('#56617a'); x.beginPath(); x.ellipse(W * 0.47, fl - 4, 22, 7, 0, 0, 7); x.fill(); x.fillStyle = dim('#8a3a3a'); x.beginPath(); x.ellipse(W * 0.47 + 10, fl - 8, 12, 5, 0.3, 0, 7); x.fill();
      R(x, dim('#3e2a20'), W * 0.86 + 16, fl - 58, 34, 4); R(x, dim('#3e2a20'), W * 0.86 + 18, fl - 54, 4, 54); R(x, dim('#3e2a20'), W * 0.86 + 44, fl - 54, 4, 54); R(x, dim('#3e2a20'), W * 0.86 + 44, fl - 84, 4, 30);
      if (night) { for (let i = 0; i < 18; i++) { const lx = W * 0.3 + i * (W * 0.035), ly = 30 + Math.sin(i * 0.9) * 6; E.fairy = E.fairy || []; E.fairy.push([lx, ly]); } x.strokeStyle = 'rgba(0,0,0,.4)'; x.lineWidth = 1; x.beginPath(); E.fairy.forEach(([lx, ly], i) => (i ? x.lineTo(lx, ly) : x.moveTo(lx, ly))); x.stroke(); }
    } else if (room === 'living') {
      x.fillStyle = dim('#3a4a6a'); x.beginPath(); x.ellipse(W * 0.52, fl + 12, 130, 12, 0, 0, 7); x.fill();
      R(x, dim('#4a3024'), W * 0.45, fl - 20, 110, 6); R(x, dim('#3a2418'), W * 0.45 + 6, fl - 14, 5, 14); R(x, dim('#3a2418'), W * 0.45 + 99, fl - 14, 5, 14); R(x, dim('#e8e2d4'), W * 0.45 + 20, fl - 24, 22, 4); R(x, dim('#c9a24a'), W * 0.45 + 70, fl - 27, 8, 7);
      R(x, dim('#2a2e36'), W * 0.3, fl - 120, 3, 120); x.fillStyle = dim('#e8d8b0'); x.beginPath(); x.moveTo(W * 0.3 - 14, fl - 120); x.lineTo(W * 0.3 + 17, fl - 120); x.lineTo(W * 0.3 + 10, fl - 140); x.lineTo(W * 0.3 - 7, fl - 140); x.fill(); E.floorlamp = [W * 0.3 + 1, fl - 124];
      R(x, dim('#6b4a3a'), W * 0.94, fl - 24, 22, 24); x.fillStyle = dim('#2f5a3a'); for (let i = 0; i < 6; i++) { x.beginPath(); x.ellipse(W * 0.94 + 11 + (i - 3) * 6, fl - 40 - (i % 3) * 8, 5, 14, (i - 3) * 0.3, 0, 7); x.fill(); }
      R(x, dim('#1a1c22'), W * 0.1, fl - 70, 70, 70); R(x, dim('#2a2c32'), W * 0.1 + 4, fl - 66, 62, 28); R(x, dim('#2a2c32'), W * 0.1 + 4, fl - 34, 62, 30);
    } else if (room === 'kitchen') {
      R(x, dim('#2a2c30'), W * 0.34 + W * 0.36 - 70, fl - 50, 64, 50); x.fillStyle = dim('#111'); [[14, 0], [42, 0]].forEach(([dx]) => { x.beginPath(); x.ellipse(W * 0.34 + W * 0.36 - 70 + dx + 4, fl - 52, 10, 3, 0, 0, 7); x.fill(); }); R(x, dim('#8a8e96'), W * 0.34 + W * 0.36 - 60, fl - 72, 18, 20); R(x, dim('#6a6e76'), W * 0.34 + W * 0.36 - 64, fl - 74, 26, 4);
      R(x, dim('#c8ccd2'), W * 0.34 + 40, fl - 54, 60, 5); R(x, dim('#8a8e96'), W * 0.34 + 66, fl - 70, 3, 16); R(x, dim('#8a8e96'), W * 0.34 + 66, fl - 70, 12, 3);
      R(x, dim('#f4f0e6'), W * 0.66, 28, 30, 36); R(x, dim('#e05260'), W * 0.66, 28, 30, 7); x.fillStyle = dim('#555'); for (let i = 0; i < 12; i++) x.fillRect(W * 0.66 + 3 + (i % 4) * 7, 39 + Math.floor(i / 4) * 8, 4, 4);
      for (let i = 0; i < 3; i++) { R(x, dim(['#c9a24a', '#e8e2d4', '#8a3a3a'][i]), W * 0.34 + 120 + i * 14, fl - 64 - i * 2, 10, 14 + i * 2); }
    } else if (room === 'bathroom') {
      R(x, dim('#5cc8b0'), W * 0.72 + 44, fl - 70, 8, 10); R(x, dim('#e8e2d4'), W * 0.72 + 10, fl - 68, 6, 8); x.fillStyle = dim('#4a6a8a'); x.beginPath(); x.ellipse(W * 0.6, fl + 10, 50, 8, 0, 0, 7); x.fill();
    }
  }

  /* ---------------- static layer (cached) ---------------- */
  function buildStatic(W, H, dpr) {
    const G = SH.G, h = SH.hour(), cond = SH.cond(), L = SH.LOC[G.loc];
    const c = document.createElement('canvas'); c.width = W * dpr; c.height = H * dpr; const x = c.getContext('2d'); x.setTransform(dpr, 0, 0, dpr, 0, 0);
    const dl = dayLight(h), night = dl < 0.35, [top, bot, amb] = skyAt(h);
    const E = { W, H, gy: H - (H > 200 ? 46 : 34), night, dl, lamps: [], cond,
      shade: (col) => mix(col, amb, 0.78 - 0.62 * dl - (cond === 'clear' ? 0 : -0.06)), shadeI: (col, k) => mix('#000000', col, Math.max(0.12, Math.min(1, k))),
      warm: 'rgba(255,208,130,.92)', glassA: mix('#2a3446', top, 0.5), glassB: mix('#11161f', bot, 0.3), trim: 'rgba(0,0,0,.35)', autumn: ['#b8562b', '#d08a2a', '#8a3a22', '#c9a24a'] };
    const inside = G.phase === 'home' && G.loc === 'home';
    if (inside) { interior(x, E, G.room || 'bedroom'); extras(x, E, G.room || 'bedroom'); E.inside = true; return { c, E }; }
    const g = x.createLinearGradient(0, 0, 0, E.gy); g.addColorStop(0, top); g.addColorStop(1, bot); x.fillStyle = g; x.fillRect(0, 0, W, H);
    if (cond !== 'clear') { x.fillStyle = cond === 'fog' ? 'rgba(160,168,182,.4)' : cond === 'cloudy' ? 'rgba(70,78,96,.35)' : 'rgba(40,46,60,.5)'; x.fillRect(0, 0, W, H); }
    // far skyline (seeded by the city)
    const r = rng(11 + (G.city && G.city.seed ? G.city.seed % 997 : 0)); const far = mix('#2a3448', amb, 0.55 - 0.3 * dl);
    const twT = L.town && SH.Town && SH.Town.cache[L.town] ? SH.Town.cache[L.town].tier : null, hMul = twT === 'city' ? 1.8 : twT === 'town' ? 0.7 : 1;
    if (twT === 'village' || twT === 'small') { // open country: hills, a tree line, maybe a water tower
      x.fillStyle = far; x.beginPath(); x.moveTo(0, E.gy - 20); for (let px = 0; px <= W; px += 40) x.lineTo(px, E.gy - 34 - Math.sin(px / 170 + (G.away || '').length) * 16 - r() * 6); x.lineTo(W, E.gy); x.lineTo(0, E.gy); x.fill();
      if (r() < 0.8) { const wx = W * (0.15 + r() * 0.7); x.fillRect(wx - 1, E.gy - 110, 3, 70); x.fillRect(wx + 19, E.gy - 110, 3, 70); x.beginPath(); x.ellipse(wx + 10, E.gy - 118, 22, 14, 0, 0, 7); x.fill(); }
    } else
    for (let px = -10; px < W;) { const bw = 18 + r() * 44, bh = (26 + r() * 64) * hMul; x.fillStyle = far; x.fillRect(px, E.gy - 30 - bh, bw, bh + 30); if (r() < 0.2) x.fillRect(px + bw / 2, E.gy - 40 - bh, 1.5, 12); if (night) { for (let k = 0; k < bw * bh / 180; k++) if (r() < 0.35) { x.fillStyle = r() < 0.8 ? 'rgba(255,210,130,.45)' : 'rgba(160,200,255,.4)'; x.fillRect(px + 3 + r() * (bw - 6), E.gy - 26 - r() * bh, 2, 2.5); } } px += bw + 2 + r() * 6; }
    // near row of trees / roofs
    x.fillStyle = mix('#1f2a2a', amb, 0.6 - 0.35 * dl); for (let px = 0; px < W; px += 22) { x.beginPath(); x.arc(px + r() * 10, E.gy - 18 - r() * 16, 14 + r() * 10, 0, 7); x.fill(); } x.fillRect(0, E.gy - 20, W, 20);
    // sidewalk + street
    R(x, E.shade('#7a7e86'), 0, E.gy, W, 8); R(x, 'rgba(0,0,0,.18)', 0, E.gy + 7, W, 1); x.fillStyle = 'rgba(0,0,0,.12)'; for (let px = 0; px < W; px += 44) x.fillRect(px, E.gy, 1, 8);
    const sg = x.createLinearGradient(0, E.gy + 8, 0, H); sg.addColorStop(0, E.shade('#3a3e46')); sg.addColorStop(1, E.shade('#202329')); x.fillStyle = sg; x.fillRect(0, E.gy + 8, W, H - E.gy);
    if (!['park', 'trainyard', 'underpass', 'harbor'].includes(L.type)) { x.fillStyle = E.shade('#c9a24a'); for (let px = 10; px < W; px += 40) x.fillRect(px, E.gy + 19, 20, 2); }
    if (E.rail || L.type === 'station') { R(x, E.shade('#4a3a30'), 0, H - 9, W, 3); R(x, E.shade('#8a8e96'), 0, H - 12, W, 2); R(x, E.shade('#8a8e96'), 0, H - 4, W, 2); }
    (PL[L.type] || PL.house)(x, E, G.loc);
    if (SH.raining()) { x.fillStyle = 'rgba(200,215,240,.06)'; x.fillRect(0, E.gy + 8, W, H - E.gy); }
    return { c, E };
  }

  /* ---------------- per-frame life ---------------- */
  function busy() { const G = SH.G, h = SH.hour(), t = SH.LOC[G.loc].type; if (G.phase === 'home' && G.loc === 'home') return 0; const base = { mall: 4, school: 3, store: 2.5, bus: 2.5, station: 3, park: 2, diner: 1.5, hospital: 2, police: 1.2, library: 1.2, laundromat: 1, house: 0.6, house2: 0.6, underpass: 0.3, trainyard: 0.1, harbor: 0.6 }[t] || 1; const tod = h < 6 ? 0.08 : h < 8 ? 0.6 : h < 20 ? 1 : h < 23 ? 0.45 : 0.15; return base * tod * (SH.raining() ? 0.55 : 1); }
  function drawLife(x, E, t) {
    const V = S.v2, W = E.W, H = E.H, gy = E.gy, rain = SH.raining();
    if (E.inside) return;
    const want = busy();
    if (V.walkers.length < want * 2.2 && Math.random() < 0.02 * want) { const dir = Math.random() < 0.5 ? 1 : -1; V.walkers.push({ x: dir > 0 ? -20 : W + 20, dir, v: 0.35 + Math.random() * 0.4, sc: 0.75 + Math.random() * 0.35, ph: Math.random() * 6, umb: rain && Math.random() < 0.7, col: ['#1a1d24', '#232833', '#2a2124', '#1e2a28'][Math.floor(Math.random() * 4)], kid: Math.random() < 0.18, dog: Math.random() < 0.08 }); }
    if (V.cars.length < 2 && Math.random() < 0.006 * (want + 0.3) && !['park', 'trainyard', 'underpass'].includes(SH.LOC[SH.G.loc].type)) { const dir = Math.random() < 0.5 ? 1 : -1; V.cars.push({ x: dir > 0 ? -80 : W + 80, dir, v: 2 + Math.random() * 1.6, col: ['#8a2a2a', '#2a4a8a', '#d0d0d4', '#1b1b1b', '#6b8e5a', '#c9a24a'][Math.floor(Math.random() * 6)], y: dir > 0 ? H - 10 : H - 18 }); }
    if (!E.night && !rain && V.birds.length < 3 && Math.random() < 0.004) V.birds.push({ x: -10, y: 20 + Math.random() * 40, v: 0.8 + Math.random() * 0.5, n: 3 + Math.floor(Math.random() * 3) });
    const col = (c) => (E.night ? c : mix(c, '#3a4050', 0.25));
    V.walkers = V.walkers.filter((w) => { w.x += w.dir * w.v; w.ph += 0.18 * w.v; const s = w.sc * (w.kid ? 0.68 : 1), X = w.x, sw = Math.sin(w.ph) * 5 * s, y = gy + 6;
      x.fillStyle = col(w.col); x.beginPath(); x.arc(X, y - 44 * s, 5 * s, 0, 7); x.fill(); rr(x, X - 5.5 * s, y - 38 * s, 11 * s, 20 * s, 4 * s); x.fill();
      x.strokeStyle = col(w.col); x.lineWidth = 3.4 * s; x.lineCap = 'round'; x.beginPath(); x.moveTo(X, y - 19 * s); x.lineTo(X + sw, y); x.moveTo(X, y - 19 * s); x.lineTo(X - sw, y); x.stroke();
      if (w.umb) { x.fillStyle = col(['#2b4f8a', '#8a2a3a', '#1b1b1b'][Math.floor(w.ph) % 3 === 0 ? 0 : 2]); x.beginPath(); x.arc(X, y - 52 * s, 13 * s, Math.PI, 0); x.fill(); x.fillRect(X - 0.5, y - 52 * s, 1, 10 * s); }
      if (w.dog) { x.fillStyle = col('#3a2e24'); rr(x, X + w.dir * 14, y - 9, 14, 6, 3); x.fill(); x.fillRect(X + w.dir * 14 + (w.dir > 0 ? 12 : -2), y - 12, 4, 5); }
      return X > -40 && X < W + 40; });
    V.cars = V.cars.filter((c) => { c.x += c.dir * c.v; const X = c.x; rr(x, X, c.y - 14, 60, 12, 4); x.fillStyle = col(c.col); x.fill(); rr(x, X + 13, c.y - 22, 30, 9, 4); x.fill(); x.fillStyle = '#0a0b0e'; x.beginPath(); x.arc(X + 13, c.y - 2, 4.5, 0, 7); x.arc(X + 47, c.y - 2, 4.5, 0, 7); x.fill();
      if (E.night) { const fx = c.dir > 0 ? X + 60 : X; const g = x.createLinearGradient(fx, 0, fx + c.dir * 130, 0); g.addColorStop(0, 'rgba(255,240,200,.35)'); g.addColorStop(1, 'rgba(255,240,200,0)'); x.fillStyle = g; x.beginPath(); x.moveTo(fx, c.y - 9); x.lineTo(fx + c.dir * 130, c.y - 22); x.lineTo(fx + c.dir * 130, c.y + 6); x.fill(); x.fillStyle = '#ff3b3b'; x.fillRect(c.dir > 0 ? X - 1 : X + 59, c.y - 11, 2, 3); }
      return X > -120 && X < W + 120; });
    V.birds = V.birds.filter((b) => { b.x += b.v; x.strokeStyle = 'rgba(20,24,32,.7)'; x.lineWidth = 1.2; for (let i = 0; i < b.n; i++) { const bx = b.x - i * 12, by = b.y + Math.sin(t * 3 + i) * 3 + i * 3, f = Math.sin(t * 10 + i) * 3; x.beginPath(); x.moveTo(bx - 4, by - f); x.lineTo(bx, by); x.lineTo(bx + 4, by - f); x.stroke(); } return b.x < W + 60; });
  }
  function drawLights(x, E, t) {
    x.save(); x.globalCompositeOperation = 'lighter';
    if (E.night) E.lamps.forEach(([lx, ly, k]) => { glow(x, lx, ly, 80 * (k || 1), 'rgba(255,196,120,A)', 0.32); x.fillStyle = 'rgba(255,190,110,.07)'; x.beginPath(); x.moveTo(lx - 6, ly); x.lineTo(lx - 44, E.gy + 10); x.lineTo(lx + 44, E.gy + 10); x.lineTo(lx + 6, ly); x.fill(); });
    if (E.siren) { const p = Math.sin(t * 7) > 0; glow(x, E.siren[0], E.siren[1], 34, p ? 'rgba(255,60,90,A)' : 'rgba(70,120,255,A)', 0.55); }
    if (E.fire) { const f = 0.8 + Math.sin(t * 11) * 0.12 + Math.sin(t * 17) * 0.08; glow(x, E.fire[0], E.fire[1], 70 * f, 'rgba(255,140,60,A)', 0.5); x.fillStyle = 'rgba(255,190,90,.9)'; x.beginPath(); x.moveTo(E.fire[0] - 5, E.fire[1] + 2); x.quadraticCurveTo(E.fire[0], E.fire[1] - 14 * f, E.fire[0] + 5, E.fire[1] + 2); x.fill(); }
    if (E.beacon) { const a = (t * 0.9) % (Math.PI * 2); glow(x, E.beacon[0], E.beacon[1], 26, 'rgba(255,214,107,A)', 0.8); if (E.night) { x.fillStyle = 'rgba(255,214,107,.08)'; x.beginPath(); x.moveTo(E.beacon[0], E.beacon[1]); x.lineTo(E.beacon[0] + Math.cos(a) * 400, E.beacon[1] - 60 + Math.sin(a) * 30); x.lineTo(E.beacon[0] + Math.cos(a + 0.12) * 400, E.beacon[1] - 40 + Math.sin(a + 0.12) * 30); x.fill(); } }
    if (E.tv) { const f = 0.5 + Math.sin(t * 5.3) * 0.2 + Math.sin(t * 13) * 0.15; const [tx, ty, tw, th] = E.tv; x.fillStyle = `rgba(${120 + f * 80},${150 + f * 60},255,${0.5 + f * 0.3})`; x.fillRect(tx + 2, ty + 2, tw - 4, th - 4); glow(x, tx + tw / 2, ty + th / 2, 220, `rgba(110,150,255,A)`, E.night ? 0.22 * f + 0.08 : 0.06); }
    if (E.fairy) E.fairy.forEach(([fx, fy], i) => { const tw = 0.6 + 0.4 * Math.sin(t * 2 + i * 1.7); x.fillStyle = ['rgba(255,214,107,', 'rgba(255,140,170,', 'rgba(140,200,255,'][i % 3] + tw + ')'; x.beginPath(); x.arc(fx, fy + 2, 2, 0, 7); x.fill(); glow(x, fx, fy + 2, 10, 'rgba(255,214,150,A)', 0.25 * tw); });
    if (E.floorlamp && E.night) glow(x, E.floorlamp[0], E.floorlamp[1], 140, 'rgba(255,205,130,A)', 0.35);
    if (E.ceil && !E.night && E.inside) glow(x, E.ceil[0], E.ceil[1], 90, 'rgba(255,240,210,A)', 0.08);
    if (E.desklamp && E.night) glow(x, E.desklamp[0], E.desklamp[1], 120, 'rgba(255,200,120,A)', 0.35);
    if (E.pendant && E.night && SH.momWhere && SH.momWhere() === 'home') glow(x, E.pendant[0], E.pendant[1] + 30, 160, 'rgba(255,210,140,A)', 0.3);
    x.restore();
    if (E.drums) { for (let i = 0; i < 2; i++) { const cx = E.W * 0.5 - 80 + (i * 3) * 40, cy = E.gy - 39; x.strokeStyle = 'rgba(255,255,255,.35)'; x.lineWidth = 1.5; x.beginPath(); x.arc(cx, cy, 6, t * 8 + i, t * 8 + i + 2.5); x.stroke(); } }
  }
  function drawWeather(x, E, t) {
    const V = S.v2, W = E.W, H = E.H, cond = SH.cond(), inside = E.inside;
    if (inside && E.window) { x.save(); const [wx, wy, ww, wh] = E.window; x.beginPath(); x.rect(wx, wy, ww, wh); x.clip(); }
    if (SH.raining()) { const heavy = cond === 'storm'; x.strokeStyle = inside ? 'rgba(200,215,240,.5)' : 'rgba(175,195,225,.42)'; x.lineWidth = 1; x.beginPath(); const n = heavy ? 160 : 110; for (let i = 0; i < n; i++) { const d = S.drops[i % S.drops.length]; d.y += 0.022 * d.v * (heavy ? 1.4 : 1); d.x -= heavy ? 0.006 : 0.003; if (d.y > 1) { d.y = 0; d.x = Math.random() * 1.1; if (!inside && Math.random() < 0.5) V.splash.push({ x: d.x * W, y: E.gy + 10 + Math.random() * (H - E.gy - 12), a: 1 }); } x.moveTo(d.x * W, d.y * H); x.lineTo(d.x * W - (heavy ? 5 : 3), d.y * H + 11); } x.stroke();
      V.splash = V.splash.filter((s) => { s.a -= 0.08; x.strokeStyle = `rgba(200,215,240,${s.a * 0.5})`; x.beginPath(); x.ellipse(s.x, s.y, 4 * (1.2 - s.a) + 1, 1.2, 0, 0, 7); x.stroke(); return s.a > 0; }); }
    if (inside && E.window) x.restore();
    if (cond === 'storm') { if (Math.random() < 0.004) S.flash = 1; if (S.flash > 0) { x.fillStyle = `rgba(230,235,255,${S.flash * (inside ? 0.25 : 0.5)})`; x.fillRect(0, 0, W, H); S.flash -= 0.06; } }
    if (cond === 'fog' && !inside) { for (let i = 0; i < 3; i++) { const g = x.createLinearGradient(0, H * (0.35 + i * 0.18), 0, H * (0.55 + i * 0.18)); g.addColorStop(0, 'rgba(190,198,210,0)'); g.addColorStop(0.5, `rgba(190,198,210,${0.16 + 0.04 * Math.sin(t * 0.3 + i)})`); g.addColorStop(1, 'rgba(190,198,210,0)'); x.fillStyle = g; x.fillRect(0, H * (0.3 + i * 0.18), W, H * 0.3); } }
  }
  function drawSky(x, E, t) {
    if (E.inside) return;
    const h = SH.hour(), cond = SH.cond(), W = E.W, H = E.H;
    if (E.night && cond === 'clear') S.stars.forEach((s) => { x.globalAlpha = 0.35 + 0.5 * Math.abs(Math.sin(t * 0.7 + s.p)); x.fillStyle = '#fff'; x.fillRect(s.x * W, s.y * (E.gy - 60), s.s, s.s); }); x.globalAlpha = 1;
    const dayT = (h - 6.5) / 12.5, nightT = ((h + 24 - 19) % 24) / 11.5;
    if (h > 6.5 && h < 19) { const sx = dayT * W, sy = E.gy * 0.95 - Math.sin(dayT * Math.PI) * E.gy * 0.8; glow(x, sx, sy, 70, 'rgba(255,225,160,A)', cond === 'clear' ? 0.5 : 0.18); x.fillStyle = cond === 'clear' ? '#fff0c4' : 'rgba(255,240,200,.35)'; x.beginPath(); x.arc(sx, sy, 13, 0, 7); x.fill(); }
    else if (nightT >= 0 && nightT <= 1) { const mx = nightT * W, my = E.gy * 0.9 - Math.sin(nightT * Math.PI) * E.gy * 0.7; glow(x, mx, my, 50, 'rgba(210,225,255,A)', cond === 'clear' ? 0.25 : 0.08); x.fillStyle = cond === 'clear' ? '#eef2fc' : 'rgba(230,235,250,.3)'; x.beginPath(); x.arc(mx, my, 10, 0, 7); x.fill(); x.fillStyle = skyAt(h)[0]; x.beginPath(); x.arc(mx + 4.5, my - 2.5, 9, 0, 7); x.fill(); }
    const nC = cond === 'clear' ? 3 : cond === 'cloudy' || cond === 'fog' ? 7 : 9, cc = E.night ? 'rgba(40,46,64,.55)' : cond === 'clear' ? 'rgba(255,255,255,.55)' : 'rgba(120,128,146,.6)';
    x.fillStyle = cc; for (let i = 0; i < nC; i++) { const cx = ((i * 197 + t * (4 + i % 3)) % (W + 240)) - 120, cy = 16 + (i * 37) % Math.max(20, E.gy * 0.4); for (let k = 0; k < 4; k++) { x.beginPath(); x.ellipse(cx + k * 18, cy + (k % 2) * 4, 22, 9 + (k % 2) * 3, 0, 0, 7); x.fill(); } }
  }

  /* ---------------- main draw ---------------- */
  S.draw = function (time) {
    const G = SH.G; if (!G || !S.c) return;
    const c = S.c, x = S.x, dpr = Math.min(2, window.devicePixelRatio || 1), W = c.clientWidth, H = c.clientHeight; if (!W || !H) return;
    if (c.width !== Math.round(W * dpr) || c.height !== Math.round(H * dpr)) { c.width = Math.round(W * dpr); c.height = Math.round(H * dpr); }
    S.flick = Math.random() < 0.02 ? 0 : 1;
    const key = [G.loc, G.phase, G.phase === 'home' && G.loc === 'home' ? G.room || 'bedroom' : '', W, H, dpr, Math.floor(G.t / 10), SH.cond(), SH.momWhere ? SH.momWhere() : '', SH.rickWhere ? SH.rickWhere() : ''].join('|');
    const V = S.v2; if (V.key !== key) { if (V.loc !== G.loc) { V.walkers = []; V.cars = []; V.loc = G.loc; } V.cache = buildStatic(W, H, dpr); V.key = key; }
    const { c: sc, E } = V.cache; x.setTransform(1, 0, 0, 1, 0, 0); x.clearRect(0, 0, c.width, c.height);
    x.setTransform(dpr, 0, 0, dpr, 0, 0);
    if (!E.inside) { const [top, bot] = skyAt(SH.hour()); const g = x.createLinearGradient(0, 0, 0, E.gy); g.addColorStop(0, top); g.addColorStop(1, bot); x.fillStyle = g; x.fillRect(0, 0, W, E.gy); }
    drawSky(x, E, time);
    x.drawImage(sc, 0, 0, W, H);
    drawLife(x, E, time); drawLights(x, E, time); drawWeather(x, E, time);
    const vg = x.createRadialGradient(W / 2, H * 0.55, H * 0.35, W / 2, H / 2, W * 0.75); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,.5)'); x.fillStyle = vg; x.fillRect(0, 0, W, H);
    const fade = x.createLinearGradient(0, H - 26, 0, H); fade.addColorStop(0, 'rgba(11,14,20,0)'); fade.addColorStop(1, 'rgba(11,14,20,.85)'); x.fillStyle = fade; x.fillRect(0, H - 26, W, 26);
    if (G.phase === 'run' && G.s.warmth < 35) { x.fillStyle = `rgba(120,170,255,${(35 - G.s.warmth) / 140})`; x.fillRect(0, 0, W, H); }
    if (G.phase === 'run' && G.heat > 50 && E.night) { const p = (Math.sin(time * 4) + 1) / 2; x.fillStyle = `rgba(${p > 0.5 ? '255,60,80' : '60,120,255'},${0.04 + G.heat / 2200})`; x.fillRect(0, 0, W, H); }
    if (G.s.stress > 80) { x.fillStyle = `rgba(0,0,0,${0.12 + 0.06 * Math.sin(time * 2.2)})`; x.fillRect(0, 0, W, H); }
  };
  S.lib = { buildStatic, drawSky, drawLife, drawLights, drawWeather, skyAt, mix, rr, glow, dayLight, R };
  // the old stripped-down scene had its own cache; the map module reads S.fg only for the station art — keep it
})(window.SH);
