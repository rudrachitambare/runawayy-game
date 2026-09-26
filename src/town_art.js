/* SMALL HOURS — scene art for town spots. Same renderer and style as Harlow's places, with each town's own
   names on the signs, and a look that follows the town's size (a village gas station isn't a city terminal). */
(function (SH) {
  const PL = SH.ScenePL, K = SH.SceneKit; if (!PL || !K) return;
  const { R, rr, glow, win, facade, tree, lamp, bench, hydrant, bin, mailbox, car, rng, hs } = K;
  const L = (id) => SH.LOC[id] || {};
  const tierOf = (id) => { const T = SH.Town && SH.Town.cache[L(id).town]; return T ? T.tier : 'small'; };
  const up = (s) => String(s || '').toUpperCase();
  const small = (id) => /village|small/.test(tierOf(id));
  const store = (x, E, cx, w, h, col, name, seed, o) => facade(x, E, Object.assign({ cx, w, h, col, roof: 'flat', seed, lit: true, open: true, brick: 1, wins: { rows: 1, cols: 1, w: w - 50, h: 36, px: 25, py: 24, gx: 0, gy: 0 }, door: { w: 30, h: 42, col: '#3a4454', glass: 1, dx: w / 2 - 34 }, sign: { t: name, font: 'bold 11px system-ui', c: '#f1e7d0', dy: 14, plate: '#3a2a24' } }, o || {}));
  const rowOfShops = (x, E, id, names) => { const r = rng(hs(id)); const n = names.length, w = Math.min(170, (E.W - 80) / n); names.forEach((nm, i) => store(x, E, 40 + w / 2 + i * w, w - 10, 70 + r() * 30, ['#8a4d3c', '#6a7a5a', '#7a6a8a', '#8a7a5a', '#5a6a7a'][i % 5], nm, hs(id) + i, { awning: i % 2 ? { n: 5, sw: (w - 30) / 5, px: 10, py: 20, c1: '#b8562b', c2: '#f1e7d0' } : null })); };

  PL.tw_main = function (x, E, id) {
    const T = SH.Town.cache[L(id).town] || {}, tier = T.tier;
    if (tier === 'village') { const r = rng(hs(id)); tree(x, E, E.W * 0.06, 1.1, 'oak', r); facade(x, E, { cx: E.W * 0.3, w: 150, h: 80, col: '#b8a88a', siding: 1, roof: 'gable', roofc: '#4a3a30', pitch: 40, seed: 3, wins: { rows: 1, cols: 2, w: 28, h: 24, px: 22, py: 22, gx: 50, gy: 0 }, door: { w: 26, h: 40, col: '#2f4a6b' }, sign: { t: 'U.S. POST OFFICE', font: 'bold 9px system-ui', c: '#1d2d55', day: '#1d2d55', dy: 12, plate: '#f1e7d0' } });
      R(x, E.shade('#9a9a9a'), E.W * 0.72, E.gy - 190, 46, 190); R(x, E.shade('#8a8a8a'), E.W * 0.72 + 46, E.gy - 150, 30, 150); R(x, E.shade('#7a7a7a'), E.W * 0.72 - 6, E.gy - 196, 58, 8); x.font = 'bold 9px system-ui'; x.fillStyle = E.shade('#3a3a3a'); x.fillText('CO-OP', E.W * 0.72 + 8, E.gy - 170);
      R(x, E.shade('#5a4a3a'), E.W * 0.5, E.gy - 50, 4, 50); R(x, E.shade('#d8d0bc'), E.W * 0.5 - 30, E.gy - 72, 64, 30); x.font = '7px system-ui'; x.fillStyle = '#333'; x.fillText('NOTICES', E.W * 0.5 - 12, E.gy - 62); for (let i = 0; i < 5; i++) R(x, ['#fff', '#ffd', '#dff', '#fdd', '#fff'][i], E.W * 0.5 - 26 + i * 12, E.gy - 58, 9, 11);
      lamp(x, E, E.W * 0.9); return; }
    if (tier === 'city') { const r = rng(hs(id)); for (let i = 0; i < 6; i++) { const w = 90 + r() * 60, h = 150 + r() * 90, cx = 60 + i * (E.W / 6); facade(x, E, { cx, w, h, col: ['#6a7080', '#8a8f9a', '#5a6474', '#7a7060'][i % 4], roof: 'flat', seed: i + 40, wins: { rows: Math.floor(h / 26), cols: Math.floor(w / 24), w: 12, h: 14, px: 8, py: 10, gx: 12, gy: 12 } }); } R(x, E.shade('#2a2a30'), E.W * 0.4, E.gy - 30, 70, 30); x.font = 'bold 9px system-ui'; x.fillStyle = E.night ? '#ffd66b' : '#eee'; x.fillText('HOT DOGS · PRETZELS', E.W * 0.4 + 2, E.gy - 18); hydrant(x, E, E.W * 0.7); lamp(x, E, E.W * 0.2); lamp(x, E, E.W * 0.8); return; }
    rowOfShops(x, E, id, tier === 'town' ? ['DOLLAR GENERAL', 'RX PHARMACY', 'FIRST STATE BANK', 'THE BIJOU'] : ['HARDWARE', 'BARBER', 'BANK', 'THE ROYAL']);
    R(x, E.shade('#333a44'), E.W * 0.62, E.gy - 150, 4, 150); R(x, E.shade('#1d2230'), E.W * 0.62 - 20, E.gy - 172, 44, 24); x.font = 'bold 10px system-ui'; x.fillStyle = E.night ? '#ffb347' : '#e6d6a6'; x.fillText(SH.fmt12 ? SH.fmt12().replace(/ [AP]M/, '') : '12:00', E.W * 0.62 - 14, E.gy - 156); lamp(x, E, E.W * 0.1); bench(x, E, E.W * 0.45); hydrant(x, E, E.W * 0.8);
  };
  PL.tw_stop = function (x, E, id) {
    const tier = tierOf(id), nm = L(id).name;
    if (tier === 'city' || tier === 'town') { facade(x, E, { cx: E.W * 0.42, w: tier === 'city' ? 420 : 300, h: tier === 'city' ? 110 : 84, col: '#9aa0a8', roof: 'flat', seed: 15, lit: true, open: true, wins: { rows: 1, cols: 5, w: 50, h: 34, px: 22, py: 30, gx: 16, gy: 0 }, sign: { t: up(nm), font: 'bold 13px system-ui', c: '#8ab4ff', day: '#1d2d55', dy: 18, neon: 1 } });
      const bx = E.W * 0.42 + (tier === 'city' ? 230 : 170); rr(x, bx, E.gy - 54, 200, 48, 8); x.fillStyle = E.shade('#e4e6ea'); x.fill(); R(x, E.shade('#2b4f8a'), bx, E.gy - 22, 200, 6); for (let i = 0; i < 6; i++) win(x, bx + 10 + i * 31, E.gy - 48, 24, 18, E, true, null); x.fillStyle = '#0c0d10'; x.beginPath(); x.arc(bx + 34, E.gy - 4, 8, 0, 7); x.arc(bx + 166, E.gy - 4, 8, 0, 7); x.fill(); return; }
    const r = rng(hs(id)); tree(x, E, E.W * 0.12, 1, 'oak', r); tree(x, E, E.W * 0.86, 1.15, r() < 0.5 ? 'pine' : 'oak', r);
    const sx = E.W * 0.45; R(x, E.shade('#5a6070'), sx - 60, E.gy - 72, 4, 72); R(x, E.shade('#5a6070'), sx + 56, E.gy - 72, 4, 72); R(x, E.shade('#3a4050'), sx - 64, E.gy - 76, 128, 6);
    x.fillStyle = 'rgba(170,200,230,.18)'; x.fillRect(sx - 56, E.gy - 70, tierOf(id) === 'village' ? 60 : 112, 58); bench(x, E, sx - 30);
    R(x, E.shade('#5a6070'), sx + 90, E.gy - 96, 3, 96); R(x, E.shade('#1d6a3a'), sx + 78, E.gy - 100, 28, 22); x.font = 'bold 9px system-ui'; x.fillStyle = '#fff'; x.fillText('BUS', sx + 83, E.gy - 85);
    if (small(id)) { facade(x, E, { cx: E.W * 0.75, w: 150, h: 76, col: '#8a7a5a', roof: 'flat', seed: 7, brick: 1, wins: { rows: 1, cols: 2, w: 40, h: 30, px: 20, py: 26, gx: 30, gy: 0 }, door: { w: 26, h: 40, col: '#3a2e24' }, sign: { t: 'GENERAL STORE', font: 'bold 10px system-ui', c: '#f1e7d0', dy: 14, plate: '#3a2a24' } }); }
    lamp(x, E, E.W * 0.3); bin(x, E, sx + 70);
  };
  PL.tw_gas = function (x, E, id) {
    const nm = L(id).name, cx = E.W * 0.36; R(x, E.shade('#d8d8dc'), cx - 150, E.gy - 110, 300, 10); R(x, E.shade('#b83b3b'), cx - 150, E.gy - 102, 300, 5); [-90, 20].forEach((d) => { R(x, E.shade('#8a8f99'), cx + d, E.gy - 100, 8, 100); rr(x, cx + d - 12, E.gy - 48, 32, 48, 4); x.fillStyle = E.shade('#e8e8ee'); x.fill(); R(x, E.shade('#b83b3b'), cx + d - 12, E.gy - 48, 32, 8); });
    if (E.night) glow(x, cx, E.gy - 90, 160, 'rgba(255,245,220,A)', 0.2);
    facade(x, E, { cx: E.W * 0.74, w: 220, h: 76, col: '#c9c2b0', roof: 'flat', seed: 21, lit: true, open: true, wins: { rows: 1, cols: 3, w: 46, h: 36, px: 18, py: 26, gx: 20, gy: 0 }, door: { w: 34, h: 44, col: '#3a4454', glass: 1, dx: -80 }, sign: { t: up(nm), font: 'bold 13px system-ui', c: '#ff6b5a', day: '#b83b3b', dy: 16, neon: 1 } });
    R(x, E.shade('#5a6070'), E.W * 0.95, E.gy - 150, 5, 150); R(x, E.shade('#1d2230'), E.W * 0.95 - 30, E.gy - 190, 64, 44); x.font = 'bold 13px system-ui'; x.fillStyle = E.night ? '#ffd66b' : '#e6d6a6'; x.fillText('3.29⁹', E.W * 0.95 - 22, E.gy - 162);
    R(x, E.shade('#e8eef4'), E.W * 0.74 + 120, E.gy - 40, 30, 40); x.font = 'bold 7px system-ui'; x.fillStyle = '#2b6fd6'; x.fillText('ICE', E.W * 0.74 + 128, E.gy - 26); car(x, E, cx - 40, '#6b8e5a', true);
  };
  PL.tw_diner = function (x, E, id) {
    const nm = L(id).name, cx = E.W * 0.48; rr(x, cx - 170, E.gy - 82, 340, 82, 20); x.fillStyle = E.shade(small(id) ? '#c8b89a' : '#b8c0c8'); x.fill(); R(x, E.shade('#3a8a6a'), cx - 170, E.gy - 30, 340, 6);
    for (let i = 0; i < 6; i++) win(x, cx - 140 + i * 48, E.gy - 66, 40, 28, E, true, null);
    facade(x, E, { cx, w: 1, h: 82, col: '#b8c0c8', sign: { t: up(nm), font: 'italic bold 20px Georgia', c: '#ff5fa2', day: '#8a2a4a', dy: -16, neon: 1 } });
    facade(x, E, { cx: cx + 120, w: 1, h: 82, col: '#b8c0c8', sign: { t: 'PIE · COFFEE', font: 'bold 10px system-ui', c: '#5ff', day: '#1c6a6a', dy: -34, neon: 1 } });
    car(x, E, cx + 200, '#8a3a3a', true); car(x, E, cx - 290, '#4a4a5a', true); lamp(x, E, cx - 210);
  };
  PL.tw_library = function (x, E, id) {
    const nm = L(id).name, on = SH.isOpen(id), vil = tierOf(id) === 'village';
    facade(x, E, { cx: E.W * 0.5, w: vil ? 200 : 320, h: vil ? 86 : 92, col: vil ? '#9a7a5e' : '#bdb39e', brick: vil ? 1 : 0, roof: vil ? 'flat' : 'pediment', seed: 5, lit: on, open: on, wins: { rows: 1, cols: vil ? 2 : 4, w: 34, h: 44, px: 26, py: 24, gx: vil ? 70 : 50, gy: 0, skip: (c) => !vil && (c === 1 || c === 2) }, door: { w: 40, h: 54, col: '#3b2f28', glass: 1, light: true }, sign: { t: up(nm), font: '600 10px Georgia', c: '#3a3024', day: '#3a3024', dy: -6, plate: vil ? '#e8dcc0' : null } });
    bench(x, E, E.W * 0.5 + 180); lamp(x, E, E.W * 0.5 - 200); tree(x, E, E.W * 0.1, 1, 'oak', rng(5));
  };
  PL.tw_church = function (x, E, id) {
    const nm = L(id).name, cx = E.W * 0.5, r = rng(hs(id));
    facade(x, E, { cx, w: 200, h: 100, col: '#e8e4da', siding: 1, roof: 'gable', roofc: '#3a3a44', pitch: 60, seed: 31, lit: (c, rI, rr2) => rr2() < 0.4, wins: { rows: 1, cols: 3, w: 18, h: 44, px: 32, py: 24, gx: 38, gy: 0, skip: (c) => c === 1 }, door: { w: 34, h: 54, col: '#6b2f2a', light: true } });
    R(x, E.shade('#e8e4da'), cx - 20, E.gy - 190, 40, 90); x.fillStyle = E.shade('#3a3a44'); x.beginPath(); x.moveTo(cx - 24, E.gy - 190); x.lineTo(cx, E.gy - 250); x.lineTo(cx + 24, E.gy - 190); x.fill(); R(x, E.shade('#c9a24a'), cx - 1.5, E.gy - 272, 3, 22); R(x, E.shade('#c9a24a'), cx - 8, E.gy - 266, 16, 3);
    if (E.night) { x.fillStyle = 'rgba(255,190,110,.5)'; x.fillRect(cx - 8, E.gy - 170, 16, 26); }
    R(x, E.shade('#3a3024'), cx + 150, E.gy - 40, 3, 40); R(x, E.shade('#f1e7d0'), cx + 118, E.gy - 66, 68, 28); x.font = 'bold 7px Georgia'; x.fillStyle = '#3a3024'; x.fillText(up(nm).slice(0, 16), cx + 122, E.gy - 55); x.fillText('ALL WELCOME', cx + 126, E.gy - 44);
    for (let i = 0; i < 7; i++) { R(x, E.shade('#6a6a6a'), E.W * 0.08 + i * 22, E.gy - 14 - r() * 4, 10, 14 + r() * 4); } tree(x, E, E.W * 0.9, 1.2, 'oak', r);
  };
  PL.tw_park = function (x, E, id) { PL.park(x, E, id); };
  PL.tw_laundromat = function (x, E, id) {
    facade(x, E, { cx: E.W * 0.5, w: 250, h: 80, col: '#7a9ab0', roof: 'flat', seed: 14, lit: true, open: SH.isOpen(id), wins: { rows: 1, cols: 1, w: 200, h: 42, px: 25, py: 22, gx: 0, gy: 0 }, sign: { t: up(L(id).name), font: 'bold 11px system-ui', c: '#bfe8ff', day: '#fff', dy: 14 } });
    for (let i = 0; i < 5; i++) { x.fillStyle = E.shade('#e8eef4'); x.fillRect(E.W * 0.5 - 95 + i * 40, E.gy - 54, 30, 30); x.fillStyle = E.night ? '#9ec7e8' : E.shade('#4a6a88'); x.beginPath(); x.arc(E.W * 0.5 - 80 + i * 40, E.gy - 39, 10, 0, 7); x.fill(); } E.drums = true; lamp(x, E, E.W * 0.2);
  };
  PL.tw_police = function (x, E, id) {
    facade(x, E, { cx: E.W * 0.5, w: 300, h: 92, col: '#8a8f9a', brick: 1, roof: 'flat', seed: 8, lit: true, sills: 1, wins: { rows: 2, cols: 6, w: 26, h: 20, px: 24, py: 14, gx: 18, gy: 16, skip: (c, rI) => rI === 1 && c === 2 }, door: { w: 46, h: 44, col: '#2a3a55', glass: 1, light: true }, open: true, sign: { t: up(L(id).name), font: 'bold 11px system-ui', c: '#e9eef8', dy: 14, plate: '#1d2d55' } });
    car(x, E, E.W * 0.5 - 250, '#e8e8ee', true); R(x, E.shade('#1d2d55'), E.W * 0.5 - 240, E.gy - 8, 40, 4); E.siren = [E.W * 0.5 - 226, E.gy - 22]; R(x, E.shade('#9aa0aa'), E.W * 0.5 + 190, E.gy - 120, 3, 120); R(x, E.shade('#2b4f8a'), E.W * 0.5 + 193, E.gy - 120, 22, 14);
  };
  PL.tw_clinic = function (x, E, id) {
    facade(x, E, { cx: E.W * 0.5, w: 260, h: 84, col: '#d6dbe2', roof: 'flat', seed: 13, lit: SH.isOpen(id), open: SH.isOpen(id), wins: { rows: 1, cols: 4, w: 36, h: 30, px: 22, py: 28, gx: 24, gy: 0, skip: (c) => c === 2 }, door: { w: 44, h: 44, col: '#3a4a5a', glass: 1, light: true, dx: 34 }, sign: { t: up(L(id).name), font: 'bold 10px system-ui', c: '#2a3a55', day: '#2a3a55', dy: 14 } });
    x.fillStyle = '#e33'; x.fillRect(E.W * 0.5 - 150, E.gy - 70, 10, 26); x.fillRect(E.W * 0.5 - 158, E.gy - 62, 26, 10); car(x, E, E.W * 0.5 + 160, '#cfcfcf', true);
  };
  PL.tw_motel = function (x, E, id) {
    const nm = L(id).name, cx = E.W * 0.5; facade(x, E, { cx, w: 420, h: 70, col: '#c9a27a', roof: 'flat', seed: 51, lit: (c, rI, r) => r() < 0.5, wins: { rows: 1, cols: 7, w: 22, h: 20, px: 20, py: 20, gx: 36, gy: 0 } });
    for (let i = 0; i < 7; i++) R(x, E.shade(['#2f4a6b', '#6b2f2a', '#3a6a4a'][i % 3]), cx - 190 + i * 58 + 26, E.gy - 40, 18, 40);
    R(x, E.shade('#5a6070'), cx + 250, E.gy - 170, 5, 170); R(x, E.shade('#b83b3b'), cx + 216, E.gy - 200, 74, 40); x.font = 'bold 12px system-ui'; x.fillStyle = E.night && (SH.Scene.flick || 1) > 0.2 ? '#ffd0a0' : '#f1e7d0'; x.fillText('MOTEL', cx + 230, E.gy - 184); x.font = 'bold 8px system-ui'; x.fillText(E.night ? 'VACANCY' : 'VACANCY', cx + 232, E.gy - 170);
    x.font = 'bold 10px system-ui'; x.fillStyle = E.night ? '#ffd0a0' : '#3a2a24'; x.fillText(up(nm).slice(0, 34), cx - 190, E.gy - 78); car(x, E, cx - 300, '#3a5a9a', true); car(x, E, cx + 120, '#9a3a3a', true);
    R(x, E.shade('#e8eef4'), cx - 240, E.gy - 36, 26, 36); x.font = 'bold 7px system-ui'; x.fillStyle = '#2b6fd6'; x.fillText('ICE', cx - 234, E.gy - 22);
  };
  PL.tw_work = function (x, E, id) {
    const T = SH.Town.cache[L(id).town] || {}, p = SH.Atlas.data().places.find((q) => q.id === L(id).town) || {}, r = rng(hs(id));
    if (/coast|lake|river/.test(SH.Town.biome(p.biome)) && /dock|marina|boat|fish|charter|barge|bait/i.test(L(id).name)) { R(x, E.shade('#1d3450'), 0, E.gy - 24, E.W, 24); for (let i = 0; i < 3; i++) { const bx = E.W * 0.15 + i * E.W * 0.28; x.fillStyle = E.shade(['#e8e8ee', '#b83b3b', '#2b4f8a'][i]); x.beginPath(); x.moveTo(bx, E.gy - 30); x.lineTo(bx + 120, E.gy - 30); x.lineTo(bx + 100, E.gy - 10); x.lineTo(bx + 16, E.gy - 10); x.fill(); R(x, E.shade('#5a5a5a'), bx + 60, E.gy - 90, 3, 60); } return; }
    facade(x, E, { cx: E.W * 0.35, w: 240, h: 90, col: '#8a3a2a', roof: 'gable', roofc: '#5a5a5a', pitch: 50, seed: 61, wins: { rows: 1, cols: 2, w: 30, h: 26, px: 40, py: 20, gx: 100, gy: 0 }, door: { w: 70, h: 64, col: '#5a2a1a' } });
    R(x, E.shade('#9a9a9a'), E.W * 0.7, E.gy - 200, 50, 200); R(x, E.shade('#8a8a8a'), E.W * 0.7 + 50, E.gy - 160, 34, 160); x.font = 'bold 9px system-ui'; x.fillStyle = E.shade('#3a3a3a'); x.fillText(up(L(id).name).slice(0, 12), E.W * 0.7 + 2, E.gy - 176);
    for (let i = 0; i < 5; i++) { R(x, E.shade('#c9a24a'), E.W * 0.1 + i * 18, E.gy - 14, 16, 14); } R(x, E.shade('#3a6a3a'), E.W * 0.55, E.gy - 30, 60, 22); x.fillStyle = '#0c0d10'; x.beginPath(); x.arc(E.W * 0.55 + 12, E.gy - 6, 9, 0, 7); x.arc(E.W * 0.55 + 50, E.gy - 4, 6, 0, 7); x.fill();
  };
  PL.tw_edge = function (x, E, id) {
    const p = SH.Atlas.data().places.find((q) => q.id === L(id).town) || {}, r = rng(hs(id));
    const bm = SH.Town.biome(p.biome), ground = { fields: '#5a5a2a', coast: '#b8a878', forest: '#23402f', hills: '#4a5a3a', lake: '#3a5a3a', river: '#3a5030' }[bm] || '#4a5a3a';
    x.fillStyle = E.shade(ground); x.fillRect(0, E.gy - 40, E.W, 40); for (let i = 0; i < 40; i++) { x.fillStyle = E.shade(i % 2 ? '#6a6a3a' : '#4a4a22'); x.fillRect(r() * E.W, E.gy - 40 + r() * 36, 20 + r() * 40, 2); }
    if (bm === 'forest' || bm === 'hills') for (let i = 0; i < 12; i++) tree(x, E, r() * E.W, 0.8 + r() * 0.6, 'pine', r);
    else { facade(x, E, { cx: E.W * 0.75, w: 120, h: 70, col: '#8a3a2a', roof: 'gable', roofc: '#4a4a4a', pitch: 44, seed: 71, door: { w: 40, h: 50, col: '#3a1a10' } }); tree(x, E, E.W * 0.2, 1.3, 'oak', r); }
    R(x, E.shade('#8a8f99'), 0, E.gy - 14, E.W, 3); for (let i = 0; i < E.W; i += 50) R(x, E.shade('#6a6e76'), i, E.gy - 14, 3, 14);
    R(x, E.shade('#3a6a3a'), E.W * 0.45, E.gy - 70, 3, 70); R(x, E.shade('#2a6a3a'), E.W * 0.45 - 40, E.gy - 100, 84, 32); x.font = 'bold 9px system-ui'; x.fillStyle = '#fff'; x.fillText(up(p.name).slice(0, 14), E.W * 0.45 - 34, E.gy - 88); x.font = '8px system-ui'; x.fillText('POP. ' + (p.pop || '').toLocaleString(), E.W * 0.45 - 34, E.gy - 76);
  };
  PL.tw_station = function (x, E, id) {
    const big = /Station$/.test(L(id).name);
    if (big) { facade(x, E, { cx: E.W * 0.46, w: 340, h: 92, col: '#9a7a5e', brick: 1, roof: 'gable', roofc: '#2e3a48', pitch: 36, seed: 17, lit: true, sills: 1, wins: { rows: 1, cols: 6, w: 28, h: 42, px: 24, py: 30, gx: 22, gy: 0 }, door: { w: 42, h: 52, col: '#2e3a48', glass: 1, light: true }, open: true, sign: { t: up(L(id).name), font: 'bold 12px Georgia', c: '#f1e7d0', day: '#2e2620', dy: 16, plate: '#d9c9a8' } }); }
    else { R(x, E.shade('#8a8a8a'), E.W * 0.3, E.gy - 10, E.W * 0.4, 10); R(x, E.shade('#2a6a3a'), E.W * 0.48, E.gy - 80, 70, 22); x.font = 'bold 9px system-ui'; x.fillStyle = '#fff'; x.fillText(up(L(id).name).slice(0, 12), E.W * 0.48 + 4, E.gy - 65); R(x, E.shade('#5a6070'), E.W * 0.5, E.gy - 58, 3, 48); bench(x, E, E.W * 0.36); lamp(x, E, E.W * 0.62); }
    E.rail = true;
  };
  PL.tw_grandma = function (x, E, id) {
    const r = rng(hs(id)); [0.15, 0.85].forEach((f, i) => facade(x, E, { cx: E.W * f, w: 150, h: 80, col: ['#8a9a8a', '#a89a7a'][i], siding: 1, roof: 'gable', roofc: '#3b3038', pitch: 40, seed: 80 + i, wins: { rows: 1, cols: 2, w: 24, h: 22, px: 24, py: 20, gx: 54, gy: 0 }, door: { w: 26, h: 40, col: '#4a2e22' } }));
    facade(x, E, { cx: E.W * 0.5, w: 190, h: 92, col: '#e8dcc0', siding: 1, roof: 'gable', roofc: '#5a3a32', pitch: 48, chimney: 1, shutters: '#2c4a6b', sills: 1, seed: 41, lit: true, wins: { rows: 1, cols: 2, w: 30, h: 26, px: 26, py: 26, gx: 78, gy: 0 }, door: { w: 30, h: 46, col: '#2b6fd6', light: true } });
    x.font = 'bold 10px Georgia'; x.fillStyle = E.shade('#3a3024'); x.fillText('41', E.W * 0.5 - 6, E.gy - 52); mailbox(x, E, E.W * 0.5 + 110); tree(x, E, E.W * 0.33, 1.1, 'oak', r); for (let i = 0; i < 20; i++) { x.fillStyle = E.shade(E.autumn[i % 3]); x.fillRect(r() * E.W, E.gy - 2 + r() * 4, 3, 2); }
  };
  PL.tw_shelter = function (x, E, id) {
    facade(x, E, { cx: E.W * 0.5, w: 220, h: 110, col: '#8a4d3c', brick: 1, roof: 'gable', roofc: '#3a2a24', pitch: 44, seed: 16, lit: true, sills: 1, wins: { rows: 2, cols: 4, w: 24, h: 22, px: 22, py: 14, gx: 26, gy: 18, skip: (c, rI) => rI === 1 && (c === 1 || c === 2) }, door: { w: 34, h: 44, col: '#8a3a2a', light: true }, sign: { t: up(L(id).name).slice(0, 28), font: '600 9px Georgia', c: '#ffd08a', day: '#3a2a24', dy: 16, plate: '#f1e7d0' } });
    glow(x, E.W * 0.5, E.gy - 50, 60, 'rgba(255,200,110,A)', E.night ? 0.5 : 0.15); bench(x, E, E.W * 0.5 - 180); lamp(x, E, E.W * 0.8);
  };
  PL.tw_backst = function (x, E, id) {
    rowOfShops(x, E, id, ['PAWN · GOLD', 'TACOS', 'NO NAME BAR', 'VAPE · PHONE']); R(x, 'rgba(0,0,0,.35)', E.W * 0.47, E.gy - 90, 26, 90); bin(x, E, E.W * 0.5); bin(x, E, E.W * 0.53);
    x.font = 'bold 14px system-ui'; x.fillStyle = 'rgba(180,140,255,.45)'; x.fillText('STAY UP', E.W * 0.2, E.gy - 20);
  };
})(window.SH);
