/* SMALL HOURS — the Stage. The scene becomes the game: a camera that follows Sam, objects you click to act on,
   people standing where they actually are, a door for the big choices, and a dock for everything else.
   Data source is the (now hidden) #actions list, so every action added anywhere in the game shows up here for free. */
(function (SH) {
  const $ = (s) => document.querySelector(s);
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const S = SH.Scene, L = S.lib, VH = 270, MINW = 720;
  const ST = SH.Stage = { cam: 0, camT: null, sam: { x: 200, tx: 200, dir: 1, walk: 0, ph: 0 }, spots: [], npcs: [], key: '', busy: false, view: { k: 1, vw: 720, W: 720 } };

  /* ---------- where things are, per room (logical coords: height 270, fl = 240, gy = 224) ---------- */
  const FL = VH - 30, GY = VH - 46;
  const ROOMS = {
    bedroom: (W) => ({
      bed: ['Bed', W * 0.52 + 95, FL - 72], shoebox: ['Shoebox', W * 0.52 + 47, FL - 14], desk: ['Desk', W * 0.84 + 45, FL - 76], console: ['Skyforge', W * 0.55 + 32, 72],
      backpack: ['Backpack', W * 0.83 + 13, FL - 42], shelf: ['Bookshelf', W * 0.36 + 35, FL - 132], window: ['Window', W * 0.14 + 55, 68], clothes: ['Drawer & clothes', W * 0.47, FL - 22],
      wall: ['Your wall', W * 0.55 + 93, 48], lily: ['Lily', W * 0.44, FL - 62], door: ['Door', 36, FL - 64] }),
    kitchen: (W) => ({ fridge: ['Fridge', W * 0.72 + 30, FL - 96], stove: ['Stove', W * 0.34 + W * 0.36 - 38, FL - 84], sink: ['Sink', W * 0.34 + 70, FL - 76], mom: ['Mom', W * 0.84 + 76, FL - 72],
      table: ['Table', W * 0.84 + 40, FL - 50], calendar: ['Calendar', W * 0.66 + 15, 44], window: ['Window', W * 0.14 + 55, 68], door: ['Door', 36, FL - 64] }),
    living: (W) => ({ rick: ['Rick', W * 0.36 + 150, FL - 82], tv: ['TV', W * 0.78 + 55, FL - 84], couch: ['Couch', W * 0.36 + 60, FL - 70], photos: ['Photos', W * 0.4 + 64, 50],
      cabinet: ['Cabinet', W * 0.1 + 35, FL - 44], window: ['Window', W * 0.14 + 55, 68], door: ['Front door', 36, FL - 64] }),
    bathroom: (W) => ({ tub: ['Shower', W * 0.36 + 90, FL - 52], sink: ['Mirror & sink', W * 0.72 + 35, FL - 96], door: ['Door', 36, FL - 64] }),
  };
  const MAP = {
    bedroom: [['door', /run away|leave for good|sneak out|slip out|climb out|go out tonight|pack.*(and|&) go|tonight\b.*(go|leave)/i], ['bed', /\b(nap|sleep|bed|lie down|rest|cry)/i], ['shoebox', /shoebox|savings|stash|money/i],
      ['console', /skyforge|console|video ?game|\bplay\b(?!.*lily)/i], ['desk', /homework|study|draw|sketch|journal|write|laptop|computer|commission|desk|flyer|plan|list/i], ['backpack', /pack|backpack|\bbag\b/i],
      ['shelf', /book|read|shelf|comic/i], ['window', /window|sky|outside|stars/i], ['clothes', /drawer|clothes|hoodie|closet|dresser|laundry/i], ['wall', /wall|poster|photo/i], ['lily', /lily/i]],
    kitchen: [['door', /run away|leave for good/i], ['mom', /\bmom\b|dana/i], ['fridge', /eat|fridge|snack|food|breakfast|lunch|cereal|sandwich|pantry|leftover|juice|milk/i], ['stove', /cook|dinner|mac|noodle|stove|make|bake/i],
      ['sink', /dish|wash|clean|chore|trash|sweep|wipe/i], ['calendar', /calendar|note|schedule|bill/i], ['table', /table|sit/i], ['window', /window/i]],
    living: [['door', /run away|leave for good|front door|slip out/i], ['rick', /rick/i], ['tv', /\btv\b|watch|cartoon|show/i], ['photos', /photo|picture|frame|album/i], ['cabinet', /cabinet|junk|mail|drawer|keys?\b/i], ['couch', /couch|sofa|sit|lily|nap/i], ['window', /window/i]],
    bathroom: [['tub', /shower|bath/i], ['sink', /mirror|brush|teeth|wash|face|clean|hygiene|medicine|inhaler/i]],
  };
  const TALK = /^(Talk to|Hang out with|Sit with|Find|Ask|Visit|Knock on|Say hi to|Approach|Check on)\s+/i;
  const BIG = (b) => /\b(hot|safe)\b/.test(b.className) || !!b.closest('.ag.leave');
  const nameToId = (label) => { const M = SH.NPCS_META || {}; let best = null; for (const id in M) { const n = M[id].n; if (n && label.includes(n.split(' ')[0]) && (!best || n.length > M[best].n.length)) best = id; } return best; };

  /* ---------- reading the (hidden) action list ---------- */
  function readActions() {
    const el = $('#actions'), out = [];
    el.querySelectorAll('button.act').forEach((b) => { const al = b.querySelector('.al'); const label = (al ? al.textContent : b.textContent).replace(/^\d+/, '').trim(); const pills = [...b.querySelectorAll('.pill')].map((p) => p.textContent.trim());
      out.push({ b, label, sub: (b.querySelector('.abody small') || {}).textContent || '', ic: (b.querySelector('.aic') || {}).textContent || '•', pills, dis: b.disabled, big: BIG(b), job: /\bjob\b/.test(b.className), kind: 'act' }); });
    el.querySelectorAll('.looks .chip').forEach((b) => { if (b.dataset.ph) return; const t = b.textContent.trim(); const m = t.match(/^(\S+)\s+(.*)$/); out.push({ b, label: m ? m[2] : t, sub: '', ic: m ? m[1] : '👁', pills: [], look: true, kind: 'look' }); });
    const rooms = [...el.querySelectorAll('.rooms button')].map((b) => ({ b, label: b.textContent.trim(), on: b.classList.contains('on'), map: !!b.dataset.map, r: b.dataset.r }));
    return { acts: out, rooms };
  }

  /* ---------- build hotspots + dock from the list ---------- */
  ST.build = function () {
    const G = SH.G; if (!G || !$('#stage')) return;
    const inside = G.phase === 'home' && G.loc === 'home', room = G.room || 'bedroom';
    const key = [G.loc, G.phase, inside ? room : ''].join('|');
    const { W } = ST.view; const { acts, rooms } = readActions();
    if (key !== ST.key) { const enter = ST.key && inside && ST.key.startsWith('home|home'); ST.key = key; ST.sam.x = enter ? 60 : inside ? W * 0.3 : W * 0.42; ST.sam.tx = inside ? W * 0.3 : W * 0.42; ST.sam.dir = 1; ST.sam.t0 = performance.now(); ST.camT = null; ST.snap = true; ST.npcs = []; closePop(); }
    const spots = {}, dock = [], npcs = [];
    const add = (id, name, x, y, a, extra) => { (spots[id] = spots[id] || Object.assign({ id, name, x, y, list: [] }, extra || {})).list.push(a); };
    const A = inside ? ROOMS[room](W) : null, lab = SH.LOC[G.loc] ? SH.LOC[G.loc].name : '';
    let slot = 0;
    acts.forEach((a) => {
      const tm = a.label.match(TALK);
      if (inside) {
        const hit = (MAP[room] || []).find(([, re]) => re.test(a.label));
        if (hit && A[hit[0]] && !(hit[0] === 'lily' && !lilyDrawn()) && !(hit[0] === 'mom' && !momDrawn()) && !(hit[0] === 'rick' && !rickDrawn())) { const [n, x, y] = A[hit[0]]; add(hit[0], n, x, y, a, { person: ['lily', 'mom', 'rick'].includes(hit[0]) ? hit[0] : null, big: a.big && hit[0] === 'door' }); }
        else if (a.big) add('door', A.door[0], A.door[1], A.door[2], a, { big: true });
        else dock.push(a);
      } else {
        if (tm && !a.big) { const id = nameToId(a.label); const k = 'p_' + (id || a.label); if (!spots[k]) { const x = W * 0.66 + (slot % 3) * 62 - Math.floor(slot / 3) * 30; npcs.push({ id, x, dir: -1, seed: slot }); slot++; } const np = npcs.find((n) => 'p_' + (n.id || a.label) === k) || npcs[npcs.length - 1]; add(k, SH.NPCS_META && id && SH.NPCS_META[id] ? SH.NPCS_META[id].n : a.label.replace(TALK, ''), np.x, GY - 86, a, { person: id || '?' }); }
        else if (a.big) dock.unshift(a);
        else if (/^(wait|sit|rest|nap|sleep|sit on|lie)/i.test(a.label) || /bench/i.test(a.label)) add('bench', 'Sit a while', W * 0.24, GY - 34, a);
        else if (a.look) add('look', 'Look around', W * 0.12, GY - 70, a);
        else if (/^(call|text|check|open)\b/i.test(a.label)) dock.push(a);
        else add('place', lab, W * 0.5, GY - 118, a, { place: true });
      }
    });
    if (inside) { const D = A.door; rooms.forEach((r) => { if (r.on) return; add('door', r.map ? 'Door' : D[0], D[1], D[2], { b: r.b, label: r.map ? 'Go out (map)' : 'Go to the ' + r.label.replace(/^\S+\s+/, '').toLowerCase(), sub: r.map ? 'Pick a place in town' : '', ic: r.map ? '🗺️' : r.label.split(' ')[0], pills: [], kind: 'room', map: r.map }); }); if (spots.door) spots.door.name = spots.door.big ? 'The door' : 'Door'; }
    const arr = Object.values(spots); declutter(arr);
    ST.spots = arr; ST.npcs = npcs; ST.dockList = dock; ST.rooms = rooms; ST.inside = inside;
    renderSpots(); renderDock(); renderTitle();
  };
  const lilyDrawn = () => SH.lilyWhere && SH.lilyWhere() === 'home' && SH.hour() > 7 && SH.hour() < 20.5 && (SH.day() + Math.floor(SH.hour())) % 4 === 0;
  const momDrawn = () => SH.momWhere && SH.momWhere() === 'home' && SH.hour() > 6 && SH.hour() < 23;
  const rickDrawn = () => SH.rickWhere && SH.rickWhere() === 'home' && SH.hour() > 8;

  const OBJ_IC = { bed: '🛏️', shoebox: '📦', desk: '✏️', console: '🎮', backpack: '🎒', shelf: '📚', window: '🪟', clothes: '👕', wall: '🖼️', fridge: '🧊', stove: '🍳', sink: '🚰', table: '🍽️', calendar: '📅', tv: '📺', couch: '🛋️', photos: '🖼️', cabinet: '🗄️', tub: '🚿', bench: '🪑', look: '👀' };
  // keep markers at least ~40px apart on screen so they never sit on top of each other
  function declutter(arr) {
    const k = ST.view.k || 1, min = 44 / k;
    for (let it = 0; it < 6; it++) for (let i = 0; i < arr.length; i++) for (let j = i + 1; j < arr.length; j++) {
      const A = arr[i], B = arr[j], dx = B.x - A.x, dy = B.y - A.y, d = Math.hypot(dx, dy);
      if (d < min) { const push = (min - d) / 2 + 0.5, ux = d ? dx / d : 1, uy = d ? dy / d : 0; const fa = A.person || A.big ? 0.2 : 1, fb = B.person || B.big ? 0.2 : 1; A.x -= ux * push * fa; A.y -= uy * push * fa; B.x += ux * push * fb; B.y += uy * push * fb; }
    }
    arr.forEach((s) => { s.y = Math.max(14 / k + 10, Math.min(VH - 20, s.y)); });
  }
  function pillsOf(a) { return a.pills.map((p) => `<i class="sp">${esc(p)}</i>`).join(''); }
  let lastSig = '';
  function renderSpots() {
    const h = $('#hot'); if (!h) return;
    const sig = ST.key + '|' + ST.spots.map((s) => s.id + ':' + s.list.map((a) => a.label + (a.dis ? '!' : '') + a.pills.join()).join(',') + '@' + Math.round(s.x) + ',' + Math.round(s.y)).join(';');
    if (sig === lastSig && h.querySelector('.hs')) { h.querySelectorAll('.hs').forEach((b) => (b.onclick = (e) => { e.stopPropagation(); spotClick(ST.spots[+b.dataset.i], b); })); return; }
    lastSig = sig;
    h.innerHTML = ST.spots.map((s, i) => { const first = s.list[0], n = s.list.length; const face = s.person && s.person !== '?' && SH.Portrait && SH.Portrait.has && SH.Portrait.has(s.person) ? `<span class="hf">${SH.Portrait.svg(s.person, { mood: SH.Portrait.moodOf(s.person) })}</span>` : `<span class="hd">${esc(s.id === 'door' ? '🚪' : s.place ? '✦' : OBJ_IC[s.id] || first.ic)}</span>`;
      const prev = s.list.slice(0, 4).map((a) => `<li${a.dis ? ' class="d"' : ''}><span>${esc(a.ic)}</span>${esc(a.label)}${a.pills[0] ? `<i>${esc(a.pills[0])}</i>` : ''}</li>`).join('') + (n > 4 ? `<li class="more">+${n - 4} more</li>` : '');
      return `<button class="hs ${s.big ? 'big' : ''} ${s.person ? 'person' : ''} ${s.place ? 'place' : ''} ${s.list.every((a) => a.dis) ? 'dis' : ''}" data-i="${i}" aria-label="${esc(s.name)}"><span class="hv">${face}</span><span class="hl"><b>${esc(s.name)}</b>${n > 1 ? `<em>${n}</em>` : first.pills.length ? `<em>${esc(first.pills[0])}</em>` : ''}</span><span class="hc"><b>${esc(s.name)}</b><ul>${prev}</ul><small>${n > 1 ? 'Click to choose' : 'Click to do it'}</small></span></button>`; }).join('')
      + '<button class="edge l" aria-label="Look left">‹</button><button class="edge r" aria-label="Look right">›</button>';
    h.querySelectorAll('.hs').forEach((b) => (b.onclick = (e) => { e.stopPropagation(); spotClick(ST.spots[+b.dataset.i], b); }));
    h.querySelector('.edge.l').onclick = () => pan(-1); h.querySelector('.edge.r').onclick = () => pan(1);
    place();
  }
  function renderDock() {
    const d = $('#dock'); if (!d) return; const G = SH.G;
    const items = ST.dockList.map((a, i) => `<button class="dk ${a.big ? 'big' : ''} ${a.job ? 'job' : ''}" data-i="${i}" ${a.dis ? 'disabled' : ''} title="${esc(a.label + (a.sub ? ' · ' + a.sub : ''))}"><span class="di">${esc(a.ic)}</span><span class="dl">${esc(a.label)}</span>${a.pills.length ? `<i class="sp">${esc(a.pills[0])}</i>` : ''}</button>`).join('');
    d.innerHTML = items + `<button class="dk all" id="allBtn" title="Every option here, as a list"><span class="di">☰</span><span class="dl">All options</span></button>`;
    d.querySelectorAll('.dk[data-i]').forEach((b) => (b.onclick = () => run(ST.dockList[+b.dataset.i], null)));
    $('#allBtn').onclick = () => document.body.classList.toggle('allopen');
    const rn = $('#roomnav'); if (!rn) return;
    const split = (t) => { const m = t.match(/^(\S+)\s+(.*)$/); return m ? `<span class="ri">${esc(m[1])}</span><span class="rl">${esc(m[2])}</span>` : esc(t); };
    rn.innerHTML = ST.rooms.length ? ST.rooms.map((r, i) => `<button class="${r.on ? 'on' : ''} ${r.map ? 'out' : ''}" data-i="${i}" title="${esc(r.label)}">${split(r.map ? '🚪 Go out' : r.label)}</button>`).join('') : `<button class="out" data-map="1">${split('🗺️ Map')}</button>`;
    rn.querySelectorAll('button').forEach((b) => (b.onclick = () => { if (SH.UI.modalOpen() || G.ended) return; if (b.dataset.map) return SH.UI.openMap(); const r = ST.rooms[+b.dataset.i]; if (r.map) return SH.UI.openMap(); walkTo(30, () => r.b.click()); }));
  }
  function fitNav() { const t = $('#stitle b'), n = $('#roomnav'); if (!t || !n) return; n.classList.remove('compact'); const tr = t.getBoundingClientRect(), nr = n.getBoundingClientRect(); if (nr.left < tr.right + 16) n.classList.add('compact'); }
  window.addEventListener('resize', () => setTimeout(fitNav, 50));
  function renderTitle() { setTimeout(fitNav, 0); const t = $('#stitle'); if (!t) return; t.innerHTML = `<b>${esc($('#locname').textContent)}</b><small title="${esc($('#locsub').textContent)}">${esc($('#locsub').textContent)}</small>`; }

  /* ---------- interaction ---------- */
  function spotClick(s, el) {
    if (SH.UI.modalOpen() || SH.G.ended || ST.busy) return; SH.Audio && SH.Audio.click();
    if (s.list.length === 1 && !s.place) return run(s.list[0], s);
    openPop(s, el);
  }
  function openPop(s, el) {
    const p = $('#pop'); const st = $('#stage').getBoundingClientRect(), r = el.getBoundingClientRect();
    p.innerHTML = `<div class="ph">${s.person && s.person !== '?' && SH.Portrait.has(s.person) ? `<span class="pf">${SH.Portrait.svg(s.person, { mood: SH.Portrait.moodOf(s.person) })}</span>` : ''}<b>${esc(s.name)}</b><button class="px" aria-label="Close">✕</button></div>`
      + s.list.map((a, i) => `<button class="po ${a.big ? 'big' : ''}" data-i="${i}" ${a.dis ? 'disabled' : ''}><span class="pi">${esc(a.ic)}</span><span class="pt"><b>${esc(a.label)}</b>${a.sub ? `<small>${esc(a.sub)}</small>` : ''}</span>${pillsOf(a)}</button>`).join('');
    p.classList.remove('hidden');
    const pw = p.offsetWidth, ph = p.offsetHeight; let x = r.left - st.left + r.width / 2 - pw / 2, y = r.top - st.top + r.height + 8;
    if (y + ph > st.height - 6) y = Math.max(6, r.top - st.top - ph - 8); x = Math.max(8, Math.min(st.width - pw - 8, x)); p.style.left = x + 'px'; p.style.top = y + 'px';
    p.querySelector('.px').onclick = closePop; p.querySelectorAll('.po').forEach((b) => (b.onclick = () => { closePop(); run(s.list[+b.dataset.i], s); }));
  }
  function closePop() { const p = $('#pop'); if (p) p.classList.add('hidden'); }
  ST.closePop = closePop;
  function run(a, s) {
    if (!a || a.dis || SH.UI.modalOpen() || SH.G.ended || ST.busy) return;
    if (a.kind === 'room') { closePop(); return walkTo(30, () => (a.map ? SH.UI.openMap() : a.b.click())); }
    const label = a.label, fire = () => { const cur = [...document.querySelectorAll('#actions button.act, #actions .looks .chip')].find((b) => { const al = b.querySelector('.al'); return (al ? al.textContent : b.textContent).includes(label); }); (cur || a.b).click(); };
    if (s && !s.place) walkTo(s.person ? s.x - 34 * (s.x > ST.sam.x ? 1 : -1) : s.x, fire); else if (s && s.place) walkTo(s.x - 20, fire); else fire();
  }
  function walkTo(x, cb) {
    const vis = $('#stage') && $('#stage').offsetParent !== null; x = Math.max(24, Math.min(ST.view.W - 24, x));
    if (!vis || Math.abs(x - ST.sam.x) < 8) { ST.sam.tx = x; ST.sam.x = x; cb && cb(); return; }
    ST.busy = true; ST.camT = null; ST.sam.tx = x; ST.sam.dir = x > ST.sam.x ? 1 : -1; ST.sam.cb = cb; ST.sam.t0 = performance.now();
  }
  ST.walkTo = walkTo;
  function pan(d) { const { vw, W } = ST.view; ST.camT = Math.max(0, Math.min(W - vw, (ST.camT == null ? ST.cam : ST.camT) + d * vw * 0.6)); }

  /* ---------- characters ---------- */
  const LOOKS = { sam: { skin: '#e0b48c', hair: '#3a2a20', top: '#6d7686', legs: '#2c3a55', shoe: '#e8e8ee' }, jordan: { skin: '#8a5a3c', hair: '#1a1410', top: '#2b6fd6', legs: '#2a2a30', shoe: '#e05260', cap: '#2b6fd6' },
    okafor: { skin: '#6a4028', hair: '#1a1410', top: '#b8562b', legs: '#3a3040', shoe: '#1a1a1a', tall: 1 }, dex: { skin: '#d8b090', hair: '#1a1a1a', top: '#1b1b1f', legs: '#2a2a30', shoe: '#555', tall: 1.12 },
    patel: { skin: '#b07850', hair: '#bbb', top: '#8a3a55', legs: '#5a4a60', shoe: '#333', tall: 1 }, tyler: { skin: '#e8c0a0', hair: '#c9a24a', top: '#c23a3a', legs: '#2c3a55', shoe: '#fff' },
    maya: { skin: '#f0c8a0', hair: '#1a1410', top: '#5cc8b0', legs: '#3a3a55', shoe: '#eee', long: 1 }, ruiz: { skin: '#c89070', hair: '#3a2418', top: '#6a4a8a', legs: '#2a2a30', shoe: '#222', tall: 1, long: 1 },
    wren: { skin: '#d8a880', hair: '#8a3a22', top: '#3a5a3a', legs: '#3a3030', shoe: '#444', long: 1 }, mom: { skin: '#e0b48c', hair: '#6a4a2a', top: '#5cc8b0', legs: '#3a4a6a', shoe: '#eee', tall: 1, long: 1 } };
  function hashLook(seed) { const r = (n) => ((seed * 9301 + n * 49297) % 233280) / 233280; return { skin: ['#e0b48c', '#8a5a3c', '#c89070', '#f0c8a0', '#6a4028'][Math.floor(r(1) * 5)], hair: ['#1a1410', '#3a2a20', '#8a5a22', '#bbb'][Math.floor(r(2) * 4)], top: ['#3a5a8a', '#8a3a3a', '#3a6a4a', '#6a5a3a', '#4a4a5a'][Math.floor(r(3) * 5)], legs: '#2a2e3a', shoe: '#333', tall: 1 }; }
  function person(x, X, base, lk, t, walk, dir, tint, bag) {
    const s = (lk.tall || 0.86) * 1.0, sw = walk ? Math.sin(walk) * 7 * s : 0, bob = walk ? Math.abs(Math.cos(walk)) * 1.6 : Math.sin(t * 2.1) * 0.7, T = (c) => L.mix(c, '#0a0d18', tint);
    x.save(); x.translate(X, base); x.scale(dir, 1);
    x.fillStyle = 'rgba(0,0,0,.28)'; x.beginPath(); x.ellipse(0, 1, 16 * s, 3.5, 0, 0, 7); x.fill();
    x.lineCap = 'round';
    x.strokeStyle = T(lk.legs); x.lineWidth = 6.5 * s; x.beginPath(); x.moveTo(-3 * s, -30 * s); x.lineTo(-3 * s + sw, -3); x.moveTo(3 * s, -30 * s); x.lineTo(3 * s - sw, -3); x.stroke();
    x.fillStyle = T(lk.shoe); x.fillRect(-7 * s + sw, -4, 9 * s, 4); x.fillRect(-1 * s - sw, -4, 9 * s, 4);
    if (bag) { L.rr(x, -15 * s, -58 * s - bob, 9 * s, 22 * s, 3); x.fillStyle = T('#2c6e8a'); x.fill(); }
    L.rr(x, -9 * s, -60 * s - bob, 18 * s, 32 * s, 6 * s); x.fillStyle = T(lk.top); x.fill();
    x.strokeStyle = T(lk.top); x.lineWidth = 5 * s; x.beginPath(); x.moveTo(-7 * s, -54 * s - bob); x.lineTo(-7 * s - sw * 0.7, -34 * s - bob); x.moveTo(7 * s, -54 * s - bob); x.lineTo(7 * s + sw * 0.7, -34 * s - bob); x.stroke();
    x.fillStyle = T(lk.skin); x.fillRect(-2.5 * s, -64 * s - bob, 5 * s, 5 * s); x.beginPath(); x.arc(1 * s, -72 * s - bob, 9 * s, 0, 7); x.fill();
    x.fillStyle = T(lk.hair); x.beginPath(); x.arc(0, -75 * s - bob, 9.4 * s, Math.PI * 0.95, Math.PI * 2.1); x.fill(); if (lk.long) x.fillRect(-9 * s, -76 * s - bob, 5 * s, 14 * s);
    if (lk.cap) { x.fillStyle = T(lk.cap); x.beginPath(); x.arc(0, -76 * s - bob, 9.6 * s, Math.PI, 0); x.fill(); x.fillRect(2 * s, -78 * s - bob, 12 * s, 3); }
    const blink = (t * 1.3 + X) % 4 < 0.12; x.fillStyle = T('#1a1410'); if (!blink) { x.fillRect(5 * s, -73 * s - bob, 2, 2.4); } else x.fillRect(4.5 * s, -72 * s - bob, 3, 1);
    x.restore();
  }
  function drawActors(x, E, t, dt) {
    const G = SH.G, inside = ST.inside, sam = ST.sam, base = inside ? FL + 6 : GY + 7;
    const tint = inside ? (E.night ? 0.38 : 0.05) : Math.max(0, 0.5 - E.dl * 0.5);
    if (inside) { const lamp = E.night ? 0.45 : 1, d = (c) => E.shadeI(c, lamp); L.R(x, d('#e8e2d4'), 10, FL - 118, 52, 118); L.R(x, d('#6b4a3a'), 15, FL - 113, 42, 113); L.R(x, d('#5a3e2e'), 19, FL - 108, 34, 46); L.R(x, d('#5a3e2e'), 19, FL - 56, 34, 50); x.fillStyle = d('#c9a24a'); x.beginPath(); x.arc(50, FL - 58, 2.5, 0, 7); x.fill(); }
    ST.npcs.forEach((n) => person(x, n.x, GY + 6, (n.id && LOOKS[n.id]) || hashLook(n.seed + 3), t, 0, n.x > sam.x ? -1 : 1, tint, false));
    if (sam.x !== sam.tx) { const sp = Math.max(170, Math.abs(sam.tx - sam.x) * 2.2) * dt; sam.dir = sam.tx > sam.x ? 1 : -1; if (Math.abs(sam.tx - sam.x) <= sp || performance.now() - (sam.t0 || 0) > 1400) { sam.x = sam.tx; sam.walk = 0; } else { sam.x += sam.dir * sp; sam.walk += dt * 11; } }
    if (sam.x === sam.tx && sam.cb) { const cb = sam.cb; sam.cb = null; ST.busy = false; setTimeout(cb, 60); } else if (sam.x === sam.tx) ST.busy = false;
    person(x, sam.x, base, LOOKS.sam, t, sam.x !== sam.tx ? sam.walk : 0, sam.dir, tint * 0.8, G.phase === 'run');
  }

  /* ---------- the new draw: fixed logical height, camera that follows Sam ---------- */
  let lastT = 0, H = VH;
  S.draw = function (time) {
    const G = SH.G; if (!G || !S.c) return;
    const c = S.c, x = S.x, dpr = Math.min(2, window.devicePixelRatio || 1), CW = c.clientWidth, CH = c.clientHeight; if (!CW || !CH) return;
    if (c.width !== Math.round(CW * dpr) || c.height !== Math.round(CH * dpr)) { c.width = Math.round(CW * dpr); c.height = Math.round(CH * dpr); }
    const k = Math.max(CH / (VH * 1.32), Math.min(CH / VH, CW / MINW)), vw = CW / k, W = Math.max(Math.round(vw), MINW), oy = CH / k - VH; const oldW = ST.view.W; ST.view = { k, vw, W, H, oy };
    if (oldW !== W && SH.G) { ST.key = ''; ST.build(); }
    H = VH; const dt = Math.min(0.1, lastT ? time - lastT : 0.033); lastT = time;
    const key = [G.loc, G.phase, G.phase === 'home' && G.loc === 'home' ? G.room || 'bedroom' : '', W, Math.round(k * dpr * 100), Math.floor(G.t / 10), SH.cond(), SH.momWhere ? SH.momWhere() : '', SH.rickWhere ? SH.rickWhere() : ''].join('|');
    const V = S.v2; if (V.key !== key) { if (V.loc !== G.loc) { V.walkers = []; V.cars = []; V.loc = G.loc; } V.cache = L.buildStatic(W, H, dpr * k); V.key = key; }
    const { c: sc, E } = V.cache; E.inside = !!E.inside;
    // camera
    const maxCam = Math.max(0, W - vw), want = ST.camT != null ? ST.camT : Math.max(0, Math.min(maxCam, ST.sam.x - vw / 2));
    ST.cam = ST.snap ? want : ST.cam + (want - ST.cam) * Math.min(1, dt * 6); ST.snap = false; ST.cam = Math.max(0, Math.min(maxCam, ST.cam));
    x.setTransform(1, 0, 0, 1, 0, 0); x.clearRect(0, 0, c.width, c.height);
    const s = dpr * k; x.setTransform(s, 0, 0, s, -ST.cam * s, 0);
    if (!E.inside) { const [top, bot] = L.skyAt(SH.hour()); const g = x.createLinearGradient(0, 0, 0, E.gy + oy); g.addColorStop(0, top); g.addColorStop(1, bot); x.fillStyle = g; x.fillRect(0, 0, W, E.gy + oy); }
    else if (oy > 0) { x.drawImage(sc, 0, 0, sc.width, 2, 0, 0, W, oy + 1); x.fillStyle = 'rgba(0,0,0,.18)'; x.fillRect(0, 0, W, oy); x.fillStyle = 'rgba(0,0,0,.25)'; x.fillRect(0, oy - 3, W, 3); }
    x.setTransform(s, 0, 0, s, -ST.cam * s, oy * s);
    L.drawSky(x, E, time); x.drawImage(sc, 0, 0, W, H);
    L.drawLife(x, E, time); L.drawLights(x, E, time); drawActors(x, E, time, dt);
    if (E.inside) L.drawWeather(x, E, time); else { x.setTransform(s, 0, 0, s, -ST.cam * s, 0); L.drawWeather(x, Object.assign({}, E, { H: H + oy, gy: E.gy + oy }), time); }
    x.setTransform(s, 0, 0, s, 0, 0); const w2 = vw; H = H + oy;
    const vg = x.createRadialGradient(w2 / 2, H * 0.55, H * 0.4, w2 / 2, H / 2, Math.max(w2, H) * 0.8); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,.45)'); x.fillStyle = vg; x.fillRect(0, 0, w2, H);
    if (G.phase === 'run' && G.s.warmth < 35) { x.fillStyle = `rgba(120,170,255,${(35 - G.s.warmth) / 140})`; x.fillRect(0, 0, w2, H); }
    if (G.phase === 'run' && G.heat > 50 && E.night) { const p = (Math.sin(time * 4) + 1) / 2; x.fillStyle = `rgba(${p > 0.5 ? '255,60,80' : '60,120,255'},${0.04 + G.heat / 2200})`; x.fillRect(0, 0, w2, H); }
    if (G.s.stress > 80) { x.fillStyle = `rgba(0,0,0,${0.12 + 0.06 * Math.sin(time * 2.2)})`; x.fillRect(0, 0, w2, H); }
    place();
  };
  function place() {
    const h = $('#hot'); if (!h) return; const { k } = ST.view, CW = S.c.clientWidth; let offL = 0, offR = 0;
    h.querySelectorAll('.hs').forEach((b) => { const s = ST.spots[+b.dataset.i]; if (!s) return; const X = (s.x - ST.cam) * k, Y = (s.y + (ST.view.oy || 0)) * k; const tf = `translate(${X.toFixed(0)}px,${Y.toFixed(0)}px)`; if (b._tf !== tf) { b.style.transform = tf; b._tf = tf; b.classList.toggle('flipx', X > CW * 0.62); b.classList.toggle('flipy', Y > (S.c.clientHeight || 300) * 0.55); } const m = CW < 600 ? 34 : 22, out = X < m || X > CW - m; b.classList.toggle('off', out); if (X < m) offL++; if (X > CW - m) offR++; });
    const l = h.querySelector('.edge.l'), r = h.querySelector('.edge.r'); if (l) { l.classList.toggle('show', offL > 0 || ST.cam > 4); l.dataset.n = offL || ''; } if (r) { r.classList.toggle('show', offR > 0 || ST.cam < ST.view.W - ST.view.vw - 4); r.dataset.n = offR || ''; }
  }

  /* ---------- canvas: tap the floor to walk, drag to look around ---------- */
  function wirePointer() {
    const c = document.getElementById('scene'); let d = null;
    c.addEventListener('pointerdown', (e) => { d = { x: e.clientX, cam: ST.cam, moved: false }; });
    window.addEventListener('pointermove', (e) => { if (!d) return; const dx = e.clientX - d.x; if (Math.abs(dx) > 6) d.moved = true; if (d.moved) ST.camT = Math.max(0, Math.min(ST.view.W - ST.view.vw, d.cam - dx / ST.view.k)); });
    window.addEventListener('pointerup', (e) => { if (!d) return; const wasDrag = d.moved; d = null; if (wasDrag || e.target !== c || ST.busy || SH.UI.modalOpen()) return; closePop(); const r = c.getBoundingClientRect(); const lx = (e.clientX - r.left) / ST.view.k + ST.cam; ST.camT = null; walkTo(lx, null); });
  }

  /* ---------- left panel: needs as rings ---------- */
  function ringify() {
    document.querySelectorAll('#left .need').forEach((n) => { const f = n.querySelector('.fil'); if (!f) return; n.style.setProperty('--v', parseFloat(f.style.width) || 0); n.style.setProperty('--c', f.style.background || 'var(--ok)'); });
  }

  /* ---------- mount ---------- */
  window.addEventListener('DOMContentLoaded', () => {
    const center = $('#center'), sc = $('#scene'); if (!center || !sc) return;
    const stg = document.createElement('div'); stg.id = 'stage';
    center.insertBefore(stg, sc); stg.appendChild(sc);
    stg.insertAdjacentHTML('beforeend', '<div id="stitle"></div><div id="roomnav"></div><div id="hot"></div><div id="dock"></div><div id="pop" class="hidden"></div>');
    document.body.classList.add('v3');
    const scrim = document.createElement('div'); scrim.id = 'allScrim'; scrim.onclick = () => document.body.classList.remove('allopen'); center.appendChild(scrim);
    const UI = SH.UI, bRA = UI.renderActions; UI.renderActions = function () { const r = bRA.apply(this, arguments); try { ST.build(); } catch (e) { console.warn(e); } return r; };
    const bRS = UI.renderSide; UI.renderSide = function () { const r = bRS.apply(this, arguments); ringify(); return r; };
    $('#actions').addEventListener('click', (e) => { if (e.target.closest('button')) document.body.classList.remove('allopen'); }, true);
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') { closePop(); document.body.classList.remove('allopen'); } });
    document.addEventListener('pointerdown', (e) => { const p = $('#pop'); if (p && !p.classList.contains('hidden') && !e.target.closest('#pop') && !e.target.closest('.hs')) closePop(); });
    wirePointer();
  });
})(window.SH);
