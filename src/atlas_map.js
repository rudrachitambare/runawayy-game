/* SMALL HOURS — E2e: the Atlas map grows up. 110+ places need a real map: zoom (buttons, wheel, pinch), drag to
   pan, search by name, labels that appear as you zoom in, and the route of the best ride to the place you tapped
   drawn in the company's color. */
(function (SH) {
  const A = SH.Atlas, P = SH.Phone; if (!A || !P || !P.V) return;
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const W = 900, H = 600;
  A.cam = A.cam || { cx: 450, cy: 300, z: 1 };
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const vb = () => { const c = A.cam, w = W / c.z, h = H / c.z; c.cx = clamp(c.cx, w / 2, W - w / 2); c.cy = clamp(c.cy, h / 2, H - h / 2); return [c.cx - w / 2, c.cy - h / 2, w, h]; };
  A.zoomBy = (k, fx, fy) => { const c = A.cam, v = vb(), nz = clamp(c.z * k, 1, 6); if (fx != null) { const px = v[0] + fx * v[2], py = v[1] + fy * v[3]; c.cx = px - (fx - 0.5) * W / nz; c.cy = py - (fy - 0.5) * H / nz; } c.z = nz; };
  A.focus = (id) => { const p = A.data().places.find((q) => q.id === id); if (!p) return; A.cam.cx = p.x; A.cam.cy = p.y; A.cam.z = Math.max(A.cam.z, 2.2); };

  function highlight(D, sel) {
    const here = A.here(); if (!SH.Routes || !sel || sel.id === here.id || !SH.G) return null;
    const jr = SH.Routes.journeys(here, sel, SH.G.t, 1)[0]; if (!jr) return null;
    return jr.legs.map((l) => ({ ids: l.rt.stops.slice(l.i, l.j + 1), col: l.rt.op.col }));
  }
  let q = '';
  function view(body) {
    const D = A.data(), sel = (A.sel && D.places.find((p) => p.id === A.sel)) || A.here();
    const hits = q.length > 1 ? D.places.filter((p) => p.name.toLowerCase().includes(q.toLowerCase())).slice(0, 6) : [];
    const cnt = {}; D.places.forEach((p) => (cnt[p.tier] = (cnt[p.tier] || 0) + 1));
    body.innerHTML = P.hdr('🧭 Atlas', SH.MapFull ? SH.MapFull.btn() : '') + `<div class="appbody maplay"><div class="mapc">
      <div style="display:flex;gap:5px;margin-bottom:6px"><input id="atq" value="${esc(q)}" placeholder="Find a place… (${D.places.length})" style="flex:1;min-width:0;padding:6px 10px;border-radius:14px;border:1px solid #ffffff22;background:#0008;color:inherit;font-size:12px">
        <button class="btn small" id="atm">−</button><button class="btn small" id="atp">+</button><button class="btn small" id="ath" title="Where am I">⌖</button></div>
      ${hits.length ? `<div style="margin:-2px 0 6px">${hits.map((p) => `<button class="btn small athit" data-id="${p.id}" style="margin:2px">${esc(p.name)} <small class="muted">${p.tier === 'small' ? 'small town' : p.tier}</small></button>`).join('')}</div>` : ''}
      <div id="atmap" class="mapsvg" style="touch-action:none;border-radius:10px;overflow:hidden;position:relative">${A.svg(D, sel.id, W, H, { z: A.cam.z, vb: vb(), hl: highlight(D, sel) })}</div>
      <div class="muted" style="font-size:10.5px;margin:4px 0 2px">${cnt.city} cities · ${cnt.town} towns · ${cnt.small} small towns · ${cnt.village} villages · drag to pan, pinch or scroll to zoom</div></div>
      <div class="mapside">${A.card(sel)}</div></div>`;
    const re = () => P.render();
    body.querySelector('#atp').onclick = () => { A.zoomBy(1.6); re(); };
    body.querySelector('#atm').onclick = () => { A.zoomBy(1 / 1.6); re(); };
    body.querySelector('#ath').onclick = () => { A.sel = null; A.focus(A.here().id); re(); };
    const qi = body.querySelector('#atq'); qi.oninput = () => { q = qi.value; re(); const n = document.querySelector('#atq'); if (n) { n.focus(); n.setSelectionRange(q.length, q.length); } };
    body.querySelectorAll('.athit').forEach((b) => (b.onclick = () => { A.sel = b.dataset.id; A.focus(b.dataset.id); q = ''; re(); }));
    const box = body.querySelector('#atmap'), svg = box.querySelector('svg');
    let drag = null, moved = false; const pts = new Map();
    const setVB = () => svg.setAttribute('viewBox', vb().map((v) => v.toFixed(1)).join(' '));
    box.addEventListener('pointerdown', (e) => { pts.set(e.pointerId, [e.clientX, e.clientY]); drag = { x: e.clientX, y: e.clientY, cx: A.cam.cx, cy: A.cam.cy, z: A.cam.z, d: null }; moved = false; });
    box.addEventListener('pointermove', (e) => {
      if (!drag || !pts.has(e.pointerId)) return; pts.set(e.pointerId, [e.clientX, e.clientY]);
      const rc = box.getBoundingClientRect(), k = Math.max(W / A.cam.z / rc.width, H / A.cam.z / rc.height); // map may be letterboxed in fullscreen
      if (pts.size === 2) { const [a, b] = [...pts.values()], d = Math.hypot(a[0] - b[0], a[1] - b[1]); if (!drag.d) { drag.d = d; drag.z = A.cam.z; } A.cam.z = clamp(drag.z * d / drag.d, 1, 6); moved = true; setVB(); return; }
      const dx = e.clientX - drag.x, dy = e.clientY - drag.y; if (Math.abs(dx) + Math.abs(dy) > 5) moved = true;
      if (moved) { A.cam.cx = drag.cx - dx * k; A.cam.cy = drag.cy - dy * k; setVB(); }
    });
    const up = (e) => { pts.delete(e.pointerId); if (pts.size) return; if (drag && moved && Math.abs(A.cam.z - drag.z) > 0.01) { drag = null; re(); return; } drag = null; };
    box.addEventListener('pointerup', up); box.addEventListener('pointercancel', up);
    box.addEventListener('wheel', (e) => { e.preventDefault(); const rc = box.getBoundingClientRect(); A.zoomBy(e.deltaY < 0 ? 1.25 : 0.8, (e.clientX - rc.left) / rc.width, (e.clientY - rc.top) / rc.height); re(); }, { passive: false });
    box.querySelectorAll('.apl').forEach((g) => (g.onclick = (e) => { if (moved) { moved = false; return; } A.sel = g.dataset.id; re(); }));
  }
  P.V.atlas = view;
})(window.SH);
