/* SMALL HOURS — animated location vignette */
(function (SH) {
  const S = SH.Scene = { c: null, x: null, drops: [], stars: [], flash: 0 };
  function rng(seed) { let s = seed; return () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; }; }
  const lerp = (a, b, t) => a + (b - a) * t;
  const hex = (h) => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
  const mix = (a, b, t) => { const A = hex(a), B = hex(b); return `rgb(${Math.round(lerp(A[0], B[0], t))},${Math.round(lerp(A[1], B[1], t))},${Math.round(lerp(A[2], B[2], t))})`; };
  const KEYS = [[0, '#05070f', '#0d1224'], [5.5, '#0b0f22', '#1b1a36'], [6.8, '#2b2a55', '#f2a65a'], [8.5, '#5b8fd9', '#b9d6f2'], [16.5, '#5b8fd9', '#cfe2f5'], [18, '#3b2046', '#f28b66'], [19.3, '#141833', '#3a2a4a'], [21, '#070a16', '#121830'], [24, '#05070f', '#0d1224']];
  function sky(h) { for (let i = 0; i < KEYS.length - 1; i++) { const a = KEYS[i], b = KEYS[i + 1]; if (h >= a[0] && h <= b[0]) { const t = (h - a[0]) / (b[0] - a[0]); return [mix(a[1], b[1], t), mix(a[2], b[2], t)]; } } return ['#000', '#000']; }

  S.init = function (c) {
    S.c = c; S.x = c.getContext('2d');
    const r = rng(7); for (let i = 0; i < 90; i++) S.stars.push({ x: r(), y: r() * 0.6, s: r() * 1.4 + 0.3, p: r() * 6 });
    for (let i = 0; i < 160; i++) S.drops.push({ x: Math.random(), y: Math.random(), v: 0.6 + Math.random() * 0.6 });
    let last = 0; const loop = (t) => { requestAnimationFrame(loop); if (document.hidden || t - last < 33) return; last = t; S.draw(t / 1000); }; requestAnimationFrame(loop); // ~30fps, paused when hidden
  };

  S.draw = function (time) {
    const G = SH.G; if (!G || !S.c) return;
    const c = S.c, x = S.x, dpr = window.devicePixelRatio || 1, W = c.clientWidth, H = c.clientHeight;
    if (c.width !== W * dpr || c.height !== H * dpr) { c.width = W * dpr; c.height = H * dpr; }
    x.setTransform(dpr, 0, 0, dpr, 0, 0);
    const h = SH.hour(), cond = SH.cond(), dark = SH.isDark(h), L = SH.LOC[G.loc];
    const [top, bot] = sky(h);
    const g = x.createLinearGradient(0, 0, 0, H); g.addColorStop(0, top); g.addColorStop(1, bot); x.fillStyle = g; x.fillRect(0, 0, W, H);
    if (cond !== 'clear') { x.fillStyle = cond === 'fog' ? 'rgba(150,160,175,.35)' : 'rgba(40,46,60,.45)'; x.fillRect(0, 0, W, H); }
    // stars
    if (dark && cond === 'clear') S.stars.forEach((s) => { x.globalAlpha = 0.4 + 0.5 * Math.abs(Math.sin(time * 0.8 + s.p)); x.fillStyle = '#fff'; x.fillRect(s.x * W, s.y * H, s.s, s.s); }); x.globalAlpha = 1;
    // sun / moon
    const dayT = (h - 6.5) / 12.5; const nightT = ((h + 24 - 19) % 24) / 11.5;
    if (h > 6.5 && h < 19) { const sx = dayT * W, sy = H * 0.85 - Math.sin(dayT * Math.PI) * H * 0.7; x.fillStyle = cond === 'clear' ? '#ffe7a8' : 'rgba(255,240,200,.35)'; x.beginPath(); x.arc(sx, sy, 16, 0, 7); x.fill(); }
    else if (nightT >= 0 && nightT <= 1) { const mx = nightT * W, my = H * 0.8 - Math.sin(nightT * Math.PI) * H * 0.6; x.fillStyle = cond === 'clear' ? '#e8eefc' : 'rgba(230,235,250,.3)'; x.beginPath(); x.arc(mx, my, 11, 0, 7); x.fill(); x.fillStyle = top; x.beginPath(); x.arc(mx + 5, my - 3, 10, 0, 7); x.fill(); }
    // far skyline
    const r = rng(11); x.fillStyle = dark ? '#0a0d18' : 'rgba(40,52,78,.55)';
    for (let i = 0, px = 0; px < W; i++) { const bw = 20 + r() * 50, bh = 20 + r() * 55; x.fillRect(px, H - 40 - bh, bw, bh + 40); if (dark) { x.fillStyle = 'rgba(255,210,120,.25)'; for (let k = 0; k < 4; k++) if (r() < 0.4) x.fillRect(px + 4 + r() * (bw - 8), H - 35 - r() * bh, 2, 3); x.fillStyle = '#0a0d18'; } px += bw + 2; }
    // ground
    x.fillStyle = dark ? '#07090f' : '#2b3446'; x.fillRect(0, H - 28, W, 28);
    // foreground per location
    const fg = dark ? '#05070c' : '#1c2332', lit = dark ? '#ffcf73' : 'rgba(255,255,255,.18)';
    S.fg[L.type] ? S.fg[L.type](x, W, H, fg, lit, dark, time) : S.fg.house(x, W, H, fg, lit, dark, time);
    // street lamp glow at night
    if (dark && !['underpass', 'trainyard'].includes(L.type)) { const lx = W * 0.12; x.fillStyle = fg; x.fillRect(lx, H - 110, 3, 82); x.fillRect(lx, H - 110, 16, 3); const rg = x.createRadialGradient(lx + 14, H - 104, 2, lx + 14, H - 104, 70); rg.addColorStop(0, 'rgba(255,200,110,.45)'); rg.addColorStop(1, 'rgba(255,200,110,0)'); x.fillStyle = rg; x.fillRect(lx - 60, H - 180, 150, 160); }
    // rain
    if (SH.raining()) { x.strokeStyle = 'rgba(170,190,220,.45)'; x.lineWidth = 1; x.beginPath(); S.drops.forEach((d) => { d.y += 0.02 * d.v; d.x -= 0.004; if (d.y > 1) { d.y = 0; d.x = Math.random() * 1.1; } x.moveTo(d.x * W, d.y * H); x.lineTo(d.x * W - 3, d.y * H + 10); }); x.stroke(); }
    if (cond === 'storm') { if (Math.random() < 0.004) S.flash = 1; if (S.flash > 0) { x.fillStyle = `rgba(230,235,255,${S.flash * 0.5})`; x.fillRect(0, 0, W, H); S.flash -= 0.06; } }
    if (cond === 'fog') { x.fillStyle = 'rgba(180,188,200,.22)'; x.fillRect(0, H * 0.4, W, H * 0.6); }
    // vignette + run tint
    const vg = x.createRadialGradient(W / 2, H / 2, H * 0.3, W / 2, H / 2, W * 0.7); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,.55)'); x.fillStyle = vg; x.fillRect(0, 0, W, H);
    if (G.phase === 'run' && G.s.warmth < 35) { x.fillStyle = `rgba(120,170,255,${(35 - G.s.warmth) / 140})`; x.fillRect(0, 0, W, H); }
    if (G.phase === 'run' && G.heat > 50 && dark) { const p = (Math.sin(time * 4) + 1) / 2; x.fillStyle = `rgba(${p > 0.5 ? '255,60,80' : '60,120,255'},${0.05 + G.heat / 2000})`; x.fillRect(0, 0, W, H); }
  };

  const win = (x, X, Y, w, h, lit, on) => { x.fillStyle = on ? lit : 'rgba(0,0,0,.35)'; x.fillRect(X, Y, w, h); };
  S.fg = {
    house(x, W, H, fg, lit, dark) { const cx = W * 0.55; x.fillStyle = fg; x.fillRect(cx - 90, H - 118, 180, 90); x.beginPath(); x.moveTo(cx - 105, H - 116); x.lineTo(cx, H - 170); x.lineTo(cx + 105, H - 116); x.fill(); x.fillRect(cx + 40, H - 175, 16, 35);
      const G = SH.G; win(x, cx - 70, H - 100, 30, 24, lit, dark && SH.momWhere() !== 'work'); win(x, cx + 40, H - 100, 30, 24, dark ? '#9fb7ff' : lit, dark && SH.rickWhere() === 'home'); win(x, cx - 12, H - 150, 24, 18, lit, dark && G.phase === 'home'); x.fillStyle = dark ? '#1a1206' : '#3a2e22'; x.fillRect(cx - 12, H - 70, 24, 42);
      x.fillStyle = fg; x.fillRect(cx - 160, H - 60, 50, 32); x.fillRect(W * 0.85, H - 90, 6, 62); x.beginPath(); x.arc(W * 0.85 + 3, H - 100, 26, 0, 7); x.fill(); },
    house2(x, W, H, fg, lit, dark) { const cx = W * 0.5; x.fillStyle = fg; x.fillRect(cx - 80, H - 110, 160, 82); x.beginPath(); x.moveTo(cx - 95, H - 108); x.lineTo(cx, H - 155); x.lineTo(cx + 95, H - 108); x.fill(); win(x, cx - 55, H - 92, 26, 22, lit, true); win(x, cx + 30, H - 92, 26, 22, lit, dark); x.fillRect(cx + 90, H - 80, 90, 52); x.fillStyle = 'rgba(0,0,0,.4)'; x.fillRect(cx + 100, H - 70, 70, 42); },
    school(x, W, H, fg, lit, dark) { const cx = W * 0.5; x.fillStyle = fg; x.fillRect(cx - 200, H - 120, 400, 92); x.fillRect(cx - 40, H - 150, 80, 30); for (let i = 0; i < 9; i++) win(x, cx - 185 + i * 42, H - 105, 26, 20, lit, !dark); x.fillRect(cx + 150, H - 190, 3, 70); x.fillStyle = '#c33'; x.fillRect(cx + 153, H - 190, 22, 13); },
    store(x, W, H, fg, lit, dark, t) { const cx = W * 0.5; x.fillStyle = fg; x.fillRect(cx - 120, H - 100, 240, 72); x.fillStyle = dark ? '#ff4d6d' : '#b33'; x.fillRect(cx - 120, H - 112, 240, 14); x.fillStyle = '#fff'; x.font = 'bold 11px system-ui'; x.fillText('QUIKMART', cx - 30, H - 101); win(x, cx - 100, H - 85, 200, 40, dark ? 'rgba(220,255,240,.75)' : lit, true); x.fillStyle = fg; x.fillRect(cx + 160, H - 70, 60, 42); },
    library(x, W, H, fg, lit, dark) { const cx = W * 0.5; x.fillStyle = fg; x.fillRect(cx - 150, H - 110, 300, 82); x.beginPath(); x.moveTo(cx - 165, H - 110); x.lineTo(cx, H - 150); x.lineTo(cx + 165, H - 110); x.fill(); x.fillStyle = dark ? '#1b2030' : '#384258'; for (let i = 0; i < 6; i++) x.fillRect(cx - 130 + i * 50, H - 105, 10, 70); win(x, cx - 20, H - 80, 40, 52, lit, SH.isOpen('library')); },
    park(x, W, H, fg, lit, dark) { x.fillStyle = fg; for (let i = 0; i < 6; i++) { const tx = W * (0.1 + i * 0.16), th = 60 + (i % 3) * 18; x.fillRect(tx, H - 28 - th, 6, th); x.beginPath(); x.arc(tx + 3, H - 38 - th, 26 + (i % 2) * 8, 0, 7); x.fill(); } x.fillRect(W * 0.45, H - 48, 70, 5); x.fillRect(W * 0.45 + 4, H - 44, 4, 16); x.fillRect(W * 0.45 + 62, H - 44, 4, 16); x.strokeStyle = fg; x.lineWidth = 4; x.beginPath(); x.arc(W * 0.75, H - 28, 50, Math.PI, 0); x.stroke(); },
    police(x, W, H, fg, lit, dark, t) { const cx = W * 0.5; x.fillStyle = fg; x.fillRect(cx - 140, H - 110, 280, 82); for (let i = 0; i < 6; i++) win(x, cx - 120 + i * 42, H - 95, 24, 20, lit, true); x.fillRect(cx - 200, H - 55, 80, 27); const p = Math.sin(t * 6) > 0; x.fillStyle = p ? '#ff3355' : '#3377ff'; x.fillRect(cx - 170, H - 62, 20, 6); },
    mall(x, W, H, fg, lit, dark) { const cx = W * 0.5; x.fillStyle = fg; x.fillRect(cx - 230, H - 100, 460, 72); x.fillRect(cx - 60, H - 130, 120, 30); win(x, cx - 50, H - 90, 100, 60, lit, SH.isOpen('mall')); x.fillStyle = dark ? '#6aa7ff' : '#fff'; x.font = 'bold 12px system-ui'; x.fillText('HARLOW MALL', cx - 42, H - 112); },
    hospital(x, W, H, fg, lit, dark) { const cx = W * 0.5; x.fillStyle = fg; x.fillRect(cx - 120, H - 170, 240, 142); for (let r = 0; r < 5; r++) for (let i = 0; i < 7; i++) win(x, cx - 105 + i * 32, H - 160 + r * 26, 18, 14, lit, (r + i) % 3 !== 0); x.fillStyle = '#e33'; x.fillRect(cx - 8, H - 200, 16, 44); x.fillRect(cx - 22, H - 186, 44, 16); },
    diner(x, W, H, fg, lit, dark, t) { const cx = W * 0.5; x.fillStyle = fg; x.beginPath(); x.roundRect ? x.roundRect(cx - 150, H - 100, 300, 72, 30) : x.rect(cx - 150, H - 100, 300, 72); x.fill(); win(x, cx - 130, H - 85, 260, 32, dark ? 'rgba(255,220,160,.8)' : lit, true); const on = Math.sin(t * 3) > -0.8; x.fillStyle = on ? '#ff5fa2' : '#552233'; x.font = 'bold 18px Georgia'; x.fillText('NITE OWL', cx - 48, H - 110); x.fillStyle = on ? '#5ff' : '#244'; x.font = '11px system-ui'; x.fillText('OPEN 24 HRS', cx - 34, H - 125); },
    laundromat(x, W, H, fg, lit, dark) { const cx = W * 0.5; x.fillStyle = fg; x.fillRect(cx - 120, H - 100, 240, 72); win(x, cx - 105, H - 88, 210, 50, dark ? 'rgba(200,230,255,.7)' : lit, true); x.fillStyle = fg; for (let i = 0; i < 5; i++) { x.beginPath(); x.arc(cx - 80 + i * 40, H - 58, 12, 0, 7); x.fill(); } },
    underpass(x, W, H, fg, lit, dark, t) { x.fillStyle = fg; x.fillRect(0, H - 150, W, 30); for (let i = 0; i < 4; i++) x.fillRect(W * (0.15 + i * 0.25), H - 122, 18, 94); x.fillStyle = 'rgba(255,160,80,.5)'; const fl = 0.7 + Math.sin(t * 9) * 0.15; x.beginPath(); x.arc(W * 0.52, H - 36, 10 * fl, 0, 7); x.fill(); x.fillStyle = fg; x.fillRect(W * 0.4, H - 38, 50, 10); x.fillRect(W * 0.6, H - 36, 40, 8); x.fillStyle = 'rgba(180,140,255,.3)'; x.font = 'bold 16px system-ui'; x.fillText('W+R 4EVR', W * 0.3, H - 90); },
    bus(x, W, H, fg, lit, dark) { const cx = W * 0.45; x.fillStyle = fg; x.fillRect(cx - 160, H - 105, 320, 77); win(x, cx - 140, H - 90, 280, 30, lit, true); x.fillStyle = dark ? '#1a2336' : '#3c4a66'; x.beginPath(); x.roundRect ? x.roundRect(cx + 180, H - 78, 160, 46, 8) : x.rect(cx + 180, H - 78, 160, 46); x.fill(); for (let i = 0; i < 5; i++) win(x, cx + 190 + i * 30, H - 72, 22, 16, lit, dark); },
    trainyard(x, W, H, fg, lit, dark) { x.fillStyle = fg; for (let i = 0; i < 4; i++) x.fillRect(W * 0.05 + i * (W * 0.24), H - 80, W * 0.21, 50); x.strokeStyle = fg; x.lineWidth = 2; for (let i = 0; i < W; i += 14) { x.beginPath(); x.moveTo(i, H - 30); x.lineTo(i, H - 180); x.stroke(); } x.beginPath(); x.moveTo(0, H - 180); x.lineTo(W, H - 180); x.stroke(); },
    harbor(x, W, H, fg, lit, dark) { const cx = W * 0.5; x.fillStyle = fg; x.fillRect(cx - 100, H - 130, 200, 102); x.beginPath(); x.moveTo(cx - 115, H - 128); x.lineTo(cx - 20, H - 185); x.lineTo(cx + 115, H - 128); x.fill(); x.fillRect(cx + 50, H - 175, 30, 50); for (let i = 0; i < 4; i++) win(x, cx - 80 + i * 45, H - 112, 24, 22, '#ffd08a', true); const rg = x.createRadialGradient(cx, H - 50, 2, cx, H - 50, 60); rg.addColorStop(0, 'rgba(255,190,100,.6)'); rg.addColorStop(1, 'rgba(255,190,100,0)'); x.fillStyle = rg; x.fillRect(cx - 60, H - 110, 120, 110); x.fillStyle = '#ffcf73'; x.beginPath(); x.arc(cx, H - 50, 5, 0, 7); x.fill(); },
  };
})(window.SH);
