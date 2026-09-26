/* SMALL HOURS — AverMaps (avermaps.av), rebuilt. A map you can actually use:
   Explore   search any place (autocomplete), zoom +/− / wheel / pinch, drag to pan, tap a dot to open it, ⌖ back to you.
   Place     distance + compass direction, the best ride there (Book), walk/bike times, what leaves from there,
             motels (price, strict or not), youth shelter, stores, hospital/library/wifi, cell signal, police or sheriff,
             how much people notice newcomers, kid jobs, who's around. The best ride is drawn on the map.
   Directions  from/to: walking, biking and every bus/train option with Book buttons (→ AverRides).
   Nearby    filters: motels, free wifi, shelter, hospital, no police, quiet, station, rides. Sorted by distance.
   ⛶ fullscreen (mapfull.js): landscape on desktop, portrait on mobile. Map taps/zoom don't cost extra data. */
(function (SH) {
  const B = SH.Browser, A = SH.Atlas, R = SH.Routes, P = SH.Phone; if (!B || !A || !B.row) return;
  const esc = B.esc, G = () => SH.G, W = 900, H = 600, fmt = R ? R.fmt : (t) => t;
  const M = SH.AverMaps = { cam: { cx: 450, cy: 300, z: 1 } };
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const vb = () => { const c = M.cam, w = W / c.z, h = H / c.z; c.cx = clamp(c.cx, w / 2, W - w / 2); c.cy = clamp(c.cy, h / 2, H - h / 2); return [c.cx - w / 2, c.cy - h / 2, w, h]; };
  const byId = (id) => A.data().places.find((p) => p.id === id);
  const q = (path, k) => decodeURIComponent((path.match(new RegExp('[?&]' + k + '=([^&]*)')) || [])[1] || '');
  const dir = (a, b) => { const ang = (Math.atan2(-(b.y - a.y), b.x - a.x) * 180) / Math.PI; return ['E', 'NE', 'N', 'NW', 'W', 'SW', 'S', 'SE'][Math.round(((ang + 360) % 360) / 45) % 8]; };
  const served = (p) => R && (R.net().at[p.id] || []).length;
  const best = (a, b) => (R && a.id !== b.id ? R.journeys(a, b, G().t, 3) : []);
  M.zoom = (k) => { M.cam.z = clamp(M.cam.z * k, 1, 6); P.render(); };
  M.focus = (id) => { const p = byId(id); if (!p) return; M.cam.cx = p.x; M.cam.cy = p.y; M.cam.z = Math.max(M.cam.z, 2.2); };
  M.open = (id) => { M.focus(id); B.url = 'avermaps.av/p/' + id; P.render(); }; // no new page load: taps are free
  M.search = (fld) => { const p = B.findPlace(B.val(fld || 'amq')); if (!p) { B.flash(`No place called "${esc(B.val(fld || 'amq'))}". Pick one from the list as you type.`, 'bad'); return P.render(); } M.focus(p.id); B.go('avermaps.av/p/' + p.id); };
  M.dir = () => { const f = B.findPlace(B.val('adf')) || A.here(), t = B.findPlace(B.val('adt')); if (!t) { B.flash('Type where you want to go.', 'warn'); return P.render(); } B.go(`avermaps.av/dir?f=${f.id}&t=${t.id}`); };
  const top = (act, sub) => B.head(B.SITES['avermaps.av'], sub || esc(A.data().name)) + `<div style="display:flex;gap:6px;align-items:center;margin-bottom:6px"><div class="wtabs" style="margin:0;flex:1">${[['avermaps.av', '🗺️ Explore', 'ex'], ['avermaps.av/dir', '🧭 Directions', 'dir'], ['avermaps.av/near', '📍 Nearby', 'near']].map(([u, l, k]) => `<a href="#" class="${k === act ? 'on' : ''}" onclick="SH.Browser.go('${u}');return false">${l}</a>`).join('')}</div>${SH.MapFull ? SH.MapFull.btn() : ''}</div><!--flash-->`;
  const hl = (sel) => { const here = A.here(); if (!sel || sel.id === here.id) return null; const jr = best(here, sel)[0]; return jr ? jr.legs.map((l) => ({ ids: l.rt.stops.slice(l.i, l.j + 1), col: l.rt.op.col })) : null; };
  const map = (sel) => `<div class="mapc"><div style="display:flex;gap:5px;margin-bottom:6px">${B.inp('amq', `Search ${A.data().places.length} places…`, '', 'SH.AverMaps.search()', 'avpl')}<button class="btn small" onclick="SH.AverMaps.zoom(1/1.6)">−</button><button class="btn small" onclick="SH.AverMaps.zoom(1.6)">+</button><button class="btn small" title="Where am I" onclick="SH.AverMaps.focus(SH.Atlas.here().id);SH.AverMaps.open(SH.Atlas.here().id)">⌖</button></div>
    <div id="ammap" class="mapsvg" style="touch-action:none;border-radius:10px;overflow:hidden;position:relative">${A.svg(A.data(), sel ? sel.id : A.here().id, W, H, { z: M.cam.z, vb: vb(), hl: hl(sel) })}</div><div class="muted" style="font-size:10.5px;margin-top:3px">Tap a dot · drag to pan · scroll or pinch to zoom</div>${B.places()}</div>`;
  const mot = { pro: 'chain, wants ID + card', loose: 'family-run, asks questions', sloppy: 'cash, no questions' };
  function place(p) {
    const here = A.here(), me = p.id === here.id, mi = A.miles(here, p), sv = p.services || {}, c = SH.Net && SH.Net.cell ? SH.Net.cell(p) : null;
    const mots = SH.Motels ? SH.Motels.motels(p) : [], st = SH.Stores ? (SH.Stores.BY_TIER[p.tier] || []).map((s) => SH.Stores.STORES[s].n) : [];
    const J = me ? [] : best(here, p), walk = me ? null : A.modes(here, p).filter((m) => /walk|bike|scoot|kick/.test(m.k) && !m.blocked);
    const deps = R ? R.board(p, G().t, 300).slice(0, 4) : [];
    const noticeTxt = p.notice > 0.6 ? 'a lot: everyone knows everyone' : p.notice > 0.3 ? 'some' : 'barely: easy to blend in';
    let h = `<div style="display:flex;justify-content:space-between;align-items:baseline;gap:6px"><b style="font-size:17px">${esc(p.name)}</b>${B.pill(A.TIERS[p.tier].n)}</div><div class="muted" style="font-size:11.5px">pop. ${p.pop.toLocaleString()} · ${esc(p.biome)} · ${me ? '<b style="color:#5ac8fa">you are here</b>' : `${mi} mi ${dir(here, p)} of ${esc(here.name)}`}</div><div class="muted" style="font-size:11px;font-style:italic;margin:2px 0 6px">${esc(p.motto || '')}</div>`;
    h += `<div style="display:flex;gap:5px;margin:6px 0">${me ? '' : `<button class="wbtn" onclick="SH.Browser.go('avermaps.av/dir?f=${here.id}&t=${p.id}')">🧭 Directions</button>`}<button class="wbtn ok" onclick="SH.Browser.go('rides.av/find?f=${me ? p.id : here.id}&t=${me ? '' : p.id}&w=now')">🎫 ${me ? 'Rides from here' : 'Book a ride'}</button></div>`;
    if (!me) h += `<div class="wsec">Getting there</div>` + (J[0] ? B.row({ icon: J[0].legs[0].rt.op.icon, go: `rides.av/trip/${encodeURIComponent(J[0].key)}?to=${p.id}`, t: `${fmt(J[0].dep)} → ${fmt(J[0].arr)} · $${J[0].cost}`, sub: `${esc(J[0].legs.map((l) => l.rt.op.n).join(' → '))}${J[0].legs.length > 1 ? ' · 1 change' : ' · direct'}${J.length > 1 ? ` · +${J.length - 1} more` : ''}`, right: 'Book' }) : B.note('No bus or train goes there from here today.', 'warn')) + (walk || []).map((m) => `<div style="font-size:11.5px;margin:3px 2px">${m.k === 'walk' ? '🚶' : m.k === 'bike' ? '🚲' : '🛴'} ${esc(m.n)}: ${Math.floor(m.mins / 60)}h ${m.mins % 60}m</div>`).join('');
    h += `<div class="wsec">Leaving from ${esc(p.name)}</div>` + (deps.length ? deps.map((b) => `<div style="font-size:11.5px;margin:3px 2px">${b.rt.op.icon} <b>${fmt(b.dep)}</b> ${esc(b.rt.op.n)} → ${esc(R.net().P[b.rt.stops[b.rt.stops.length - 1]].name)}</div>`).join('') : '<div class="muted" style="font-size:11.5px">Nothing. No stop, no station.</div>');
    h += `<div class="wsec">Sleep</div>` + (mots.length ? mots.map((m) => `<div style="font-size:11.5px;margin:3px 2px">🛏️ <b>${esc(m.n)}</b> · $${m.rate}/night · <span class="muted">${mot[m.k] || ''}</span></div>`).join('') : '<div class="muted" style="font-size:11.5px">No motels.</div>') + (sv.shelter ? '<div style="font-size:11.5px;margin:3px 2px">🏠 <b>Youth shelter</b>: open 24/7, ages 11–17</div>' : '');
    h += `<div class="wsec">Around town</div><div style="font-size:11.5px;line-height:1.6">🛒 ${st.length ? esc(st.join(', ')) : 'one general store'}<br>${sv.hospital ? '🏥 Hospital' : '🏥 No hospital'} · ${sv.library ? '📚 Library' : 'no library'}<br>📶 ${c ? `${c.gen}, ${c.base >= 4 ? 'strong' : c.base >= 2 ? 'patchy' : 'weak'} signal${c.spot ? ` (best: ${esc(c.spot)})` : ''}` : ''} · free wifi: ${sv.wifi && sv.wifi.length ? esc(sv.wifi.join(', ')) : 'none'}<br>🚓 ${esc(p.police || '')}<br>👀 People notice newcomers: ${noticeTxt}${c ? ` · about ${Math.round(c.online * 100)}% are online` : ''}</div>`;
    h += `<div class="wsec">A kid could earn</div><div style="font-size:11.5px">${esc((p.kidjobs || []).join('; '))}</div><div class="wsec">Locals</div><div style="font-size:11.5px;line-height:1.5">${(p.people || []).map((x) => `<b>${esc(x.n)}</b>, ${esc(x.role)}`).join('<br>')}</div>`;
    if (p.grandma) h += B.note(`💗 Grandma lives here.${SH.f && SH.f('grandmaAddr') ? ' 41 Larkspur Lane.' : ' You don\'t know the exact address.'}`, 'good');
    return h;
  }
  function explore(path) { const id = (path.match(/^p\/(\w+)/) || [])[1], sel = (id && byId(id)) || A.here(); if (id && M._f !== id) M.focus(id); M._f = id; return top('ex', id ? esc(sel.name) : '') + `<div class="maplay">${map(sel)}<div class="mapside">${place(sel)}</div></div>`; }
  function directions(path) {
    const f = byId(q(path, 'f')) || A.here(), t = byId(q(path, 't'));
    let h = top('dir') + `<div class="maplay">${map(t)}<div class="mapside"><div class="wform"><label>From</label>${B.inp('adf', 'From', f.name, 'SH.AverMaps.dir()', 'avpl')}<label>To</label>${B.inp('adt', 'To', t ? t.name : '', 'SH.AverMaps.dir()', 'avpl')}<button class="wbtn" onclick="SH.AverMaps.dir()">Get directions</button></div>`;
    if (t && t.id !== f.id) {
      const J = best(f, t), ms = A.modes(f, t).filter((m) => /walk|bike|scoot|kick|drive/.test(m.k));
      h += `<div class="wsec">${esc(f.name)} → ${esc(t.name)} · ${A.miles(f, t)} mi ${dir(f, t)}</div>` + (J.length ? J.map((jr) => SH.Rides ? SH.Rides.jrow(jr, t) : '').join('') : B.note('No bus or train connects these today.', 'warn'));
      h += ms.map((m) => B.row({ icon: m.k === 'walk' ? '🚶' : m.k === 'bike' ? '🚲' : m.k === 'drive' ? '🚗' : '🛴', t: esc(m.n), sub: m.blocked ? esc(m.blocked) : esc(m.note || ''), right: m.blocked ? '—' : `${Math.floor(m.mins / 60)}h ${m.mins % 60}m` })).join('');
    }
    return h + '</div></div>';
  }
  const F = { motel: ['🛏️ Motels', (p) => SH.Motels && SH.Motels.motels(p).length, (p) => 'from $' + Math.min(...SH.Motels.motels(p).map((m) => m.rate)) + '/night'], wifi: ['📶 Free wifi', (p) => p.services.wifi.length, (p) => p.services.wifi.join(', ')], shelter: ['🏠 Shelter', (p) => p.services.shelter, () => 'youth shelter, 24/7'], hospital: ['🏥 Hospital', (p) => p.services.hospital, () => 'hospital'], nopolice: ['🤠 No police', (p) => !p.hasPolice, () => 'sheriff covers it'], quiet: ['🤫 Quiet', (p) => p.notice < 0.3, () => 'people don\'t notice much'], station: ['🚆 Train', (p) => p.station || p.rail || p.halt, (p) => (p.station ? 'station' : 'halt')], rides: ['🚌 Rides', served, (p) => served(p) + ' routes stop here'] };
  function near(path) {
    const k = q(path, 'k') || 'motel', here = A.here(), f = F[k] || F.motel;
    const L = A.data().places.filter((p) => { try { return f[1](p); } catch (e) { return false; } }).map((p) => [p, A.miles(here, p)]).sort((a, b) => a[1] - b[1]).slice(0, 15);
    return top('near', `Near ${esc(here.name)}`) + B.tabs(Object.entries(F).map(([x, v]) => [`avermaps.av/near?k=${x}`, v[0], x]), k) + L.map(([p, mi]) => B.row({ js: `SH.AverMaps.open('${p.id}')`, t: `${esc(p.name)}${p.id === here.id ? ' (here)' : ''}`, sub: `${A.TIERS[p.tier].n} · ${esc(f[2](p))}`, right: p.id === here.id ? '📍' : `${mi} mi ${dir(here, p)}` })).join('');
  }
  B.SITES['avermaps.av'] = { n: 'AverMaps', icon: '🗺️', col: '#2f8f5b', mb: 1.2, tile: true, order: 2, own: true, render(path) { const p = path || ''; return /^dir/.test(p) ? directions(p) : /^near/.test(p) ? near(p) : explore(p); } };
  // map gestures on the page: tap a dot, drag, wheel, pinch (re-render only, no reload)
  const bR = P.render;
  P.render = function () {
    const r = bR.apply(this, arguments), box = document.getElementById('ammap'); if (!box) return r; const svg = box.querySelector('svg'); if (!svg) return r;
    let drag = null, moved = false; const pts = new Map(), setVB = () => svg.setAttribute('viewBox', vb().map((v) => v.toFixed(1)).join(' '));
    box.addEventListener('pointerdown', (e) => { pts.set(e.pointerId, [e.clientX, e.clientY]); drag = { x: e.clientX, y: e.clientY, cx: M.cam.cx, cy: M.cam.cy, z: M.cam.z, d: null }; moved = false; });
    box.addEventListener('pointermove', (e) => { if (!drag || !pts.has(e.pointerId)) return; pts.set(e.pointerId, [e.clientX, e.clientY]); const rc = box.getBoundingClientRect(), k = Math.max(W / M.cam.z / rc.width, H / M.cam.z / rc.height);
      if (pts.size === 2) { const [a, b] = [...pts.values()], d = Math.hypot(a[0] - b[0], a[1] - b[1]); if (!drag.d) { drag.d = d; drag.z = M.cam.z; } M.cam.z = clamp(drag.z * d / drag.d, 1, 6); moved = true; setVB(); return; }
      const dx = e.clientX - drag.x, dy = e.clientY - drag.y; if (Math.abs(dx) + Math.abs(dy) > 5) moved = true; if (moved) { M.cam.cx = drag.cx - dx * k; M.cam.cy = drag.cy - dy * k; setVB(); } });
    const up = (e) => { pts.delete(e.pointerId); if (!pts.size) drag = null; }; box.addEventListener('pointerup', up); box.addEventListener('pointercancel', up);
    box.addEventListener('wheel', (e) => { e.preventDefault(); M.cam.z = clamp(M.cam.z * (e.deltaY < 0 ? 1.25 : 0.8), 1, 6); setVB(); }, { passive: false });
    box.querySelectorAll('.apl').forEach((g) => (g.onclick = () => { if (moved) { moved = false; return; } M.open(g.dataset.id); }));
    return r;
  };
})(window.SH);
