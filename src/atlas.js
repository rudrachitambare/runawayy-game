/* SMALL HOURS — Atlas: a whole (fictional) country in your pocket.
   Seeded per story: cities, towns, small towns, villages. Each place has its own size, economy, jobs, people,
   services and — realistically — its own policing: cities have big departments, towns small ones, and many
   villages have none at all and rely on a county sheriff who may be 30–45 minutes away.
   During the run you can actually go to nearby places (walk, bike, county bus). Intercity buses and trains
   won't carry a 12-year-old alone. That's not the game being mean; that's the real rule. */
(function (SH) {
  const U = SH.util;
  const A = SH.Atlas = {};
  const h32 = (s) => { let h = 2166136261; for (const c of String(s)) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); } return h >>> 0; };
  const rngOf = (seed) => { let a = h32('atlas:' + seed) || 7; return () => { a ^= a << 13; a ^= a >>> 17; a ^= a << 5; return ((a >>> 0) % 1e6) / 1e6; }; };
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const pick = (r, a) => a[Math.floor(r() * a.length)];

  const PRE = ['Oak', 'Cedar', 'Mill', 'Stone', 'Ash', 'Clear', 'Red', 'Pine', 'Fox', 'Iron', 'Silver', 'Elm', 'Bright', 'Wolf', 'Maple', 'Hollow', 'North', 'West', 'Salt', 'Crane', 'Birch', 'Copper', 'Willow', 'Long'];
  const SUF = ['field', 'ford', ' Falls', 'brook', 'ton', 'ville', ' Springs', 'wood', ' Creek', ' Ridge', 'port', ' Junction', 'dale', ' Point', 'burg', ' Hollow', ' Crossing', 'more'];
  const BIOME = ['farmland', 'forest', 'river valley', 'lakeshore', 'hill country', 'coast', 'prairie'];
  const ECON = {
    farmland: ['grain co-op', 'dairy farms', 'feed store', 'tractor repair'], forest: ['sawmill', 'logging', 'hunting outfitter', 'campground'],
    'river valley': ['barge terminal', 'canning plant', 'bait shop'], lakeshore: ['marina', 'summer cabins', 'fishing charters'],
    'hill country': ['quarry', 'orchards', 'wind farm'], coast: ['fishing fleet', 'boatyard', 'seafood plant', 'tourist shops'], prairie: ['cattle ranches', 'grain elevator', 'rail depot'],
  };
  const KIDJOBS = {
    farmland: ['help at the farm stand ($)', 'stack hay bales', 'feed chickens for Mrs. Olsen'], forest: ['stack firewood', 'sweep the campground office'],
    'river valley': ['sort bait at the bait shop', 'carry groceries at the IGA'], lakeshore: ['hose down boats at the marina', 'rake a cabin yard'],
    'hill country': ['pick apples at the orchard', 'pull weeds'], coast: ['untangle nets on the dock', 'bus tables at the chowder shack'], prairie: ['muck stalls', 'wash pickup trucks'],
  };
  const CITYJOBS = ['hand out flyers', 'carry bags at the farmers market', 'wash dishes in a back kitchen (cash, no questions — that\'s the problem)', 'walk dogs for a building'];
  const PEOPLE_N = ['Walt', 'Bev', 'Ray', 'June', 'Luis', 'Marge', 'Dale', 'Nadia', 'Hank', 'Tammy', 'Earl', 'Rosa', 'Gus', 'Irene', 'Omar', 'Pat', 'Linh', 'Vern'];
  const PEOPLE_R = ['runs the diner', 'owns the hardware store', 'the librarian (part-time, Tuesdays and Thursdays)', 'drives the school bus', 'pastor at the white church', 'works the gas station night shift', 'retired teacher who knows everybody', 'the mail carrier', 'runs the laundromat', 'volunteers at the food pantry'];
  const MOOD = ['kind but nosy', 'suspicious of strangers', 'lonely, likes to talk', 'no-nonsense, soft underneath', 'too friendly (trust your gut)', 'busy, barely looks up'];

  A.TIERS = {
    city: { n: 'City', pop: [180000, 1400000], police: (p) => `City police department: about ${Math.round(p / 450)} officers, 24/7. Patrol cars everywhere.`, sheriff: false },
    town: { n: 'Town', pop: [14000, 90000], police: (p) => `Town police department: ${Math.round(p / 600)} officers, a station open all night.`, sheriff: false },
    small: { n: 'Small town', pop: [1200, 9000], police: (p, r) => r() < 0.65 ? `Small department: ${Math.max(2, Math.round(p / 900))} officers, the chief works days. The county sheriff covers nights.` : 'No police department. The county sheriff covers it from the county seat, about 20 minutes out.', sheriff: true },
    village: { n: 'Village', pop: [90, 1100], police: (p, r) => `No police. The county sheriff is ${25 + Math.floor(r() * 25)} minutes away. State troopers pass through on the highway.`, sheriff: true },
  };

  A.generate = function (seed) {
    const r = rngOf(seed), places = [], used = new Set();
    const name = () => { for (let i = 0; i < 40; i++) { const n = pick(r, PRE) + pick(r, SUF); if (!used.has(n)) { used.add(n); return n.replace(/^(\w+) (\w)/, '$1 $2'); } } return 'Nowhere ' + places.length; };
    const add = (o) => { o.id = 'p' + places.length; places.push(o); return o; };
    // coast on the east edge, a big river, some mountains in the northwest
    const coast = []; for (let y = 0; y <= 600; y += 40) coast.push([860 + Math.sin(y / 70 + r() * 2) * 30 + r() * 20, y]);
    const river = []; let rx = 80, ry = 120 + r() * 80; for (let i = 0; i < 18; i++) { river.push([rx, ry]); rx += 45 + r() * 15; ry += (r() - 0.45) * 50; }
    const mountains = []; for (let i = 0; i < 16; i++) mountains.push([60 + r() * 260, 30 + r() * 140]);
    const forests = []; for (let i = 0; i < 22; i++) forests.push([100 + r() * 650, 250 + r() * 330, 14 + r() * 26]);
    const lakes = []; for (let i = 0; i < 4; i++) lakes.push([200 + r() * 500, 120 + r() * 400, 12 + r() * 18]);
    const biomeAt = (x, y) => x > 790 ? 'coast' : y < 170 && x < 340 ? 'hill country' : forests.some((f) => Math.hypot(f[0] - x, f[1] - y) < f[2] + 15) ? 'forest' : lakes.some((l) => Math.hypot(l[0] - x, l[1] - y) < l[2] + 25) ? 'lakeshore' : river.some((p) => Math.hypot(p[0] - x, p[1] - y) < 35) ? 'river valley' : y > 430 ? 'prairie' : 'farmland';
    const spot = (minD) => { for (let i = 0; i < 200; i++) { const x = 60 + r() * 770, y = 40 + r() * 530; if (places.every((p) => Math.hypot(p.x - x, p.y - y) > minD)) return [x, y]; } return [60 + r() * 770, 40 + r() * 530]; };
    // fixed story places
    const harlow = add({ name: 'Harlow', tier: 'town', x: 470, y: 330, home: true });
    const cedar = add({ name: 'Cedar Falls', tier: 'small', x: 470 + 110, y: 330 - 95, grandma: true });
    const capital = add({ name: 'Port Aldine', tier: 'city', x: 820, y: 220, capital: true });
    // a few places within walking / biking / county-bus range of home, so running somewhere is possible
    [[17, 'village'], [23, 'village'], [48, 'small'], [100, 'town']].forEach(([d, tier], i) => { let x, y; for (let k = 0; k < 40; k++) { const a = r() * Math.PI * 2; x = harlow.x + Math.cos(a) * d; y = harlow.y + Math.sin(a) * d; if (places.every((p) => p === harlow || Math.hypot(p.x - x, p.y - y) > d * 0.7)) break; } add({ name: name(), tier, x, y }); });
    const c2 = spot(160); add({ name: name(), tier: 'city', x: c2[0], y: c2[1] });
    for (let i = 0; i < 6; i++) { const p = spot(90); add({ name: name(), tier: 'town', x: p[0], y: p[1] }); }
    for (let i = 0; i < 11; i++) { const p = spot(60); add({ name: name(), tier: 'small', x: p[0], y: p[1] }); }
    for (let i = 0; i < 16; i++) { const p = spot(38); add({ name: name(), tier: 'village', x: p[0], y: p[1] }); }
    places.forEach((p) => {
      const T = A.TIERS[p.tier]; const [a, b] = T.pop;
      p.pop = p.home ? 41200 : p.grandma ? 6800 : Math.round(a + (b - a) * Math.pow(r(), 1.8));
      p.biome = biomeAt(p.x, p.y); p.econ = ECON[p.biome].slice(0, 2 + Math.floor(r() * 2));
      p.police = T.police(p.pop, r); p.hasPolice = !/^No police/.test(p.police);
      p.services = { hospital: p.tier === 'city' || p.tier === 'town' || (p.tier === 'small' && r() < 0.3), shelter: p.tier === 'city' || p.home, library: p.tier !== 'village' || r() < 0.3, wifi: [], grocery: p.tier !== 'village' || r() < 0.5, church: true, laundromat: p.tier !== 'village', gas: true };
      p.services.wifi = [p.services.library ? 'library' : null, p.tier !== 'village' ? 'diner' : r() < 0.5 ? 'gas station' : null, p.tier === 'city' ? 'coffee shops' : null].filter(Boolean);
      p.station = p.tier === 'city' || p.home || p.grandma || (p.tier === 'town' && r() < 0.6);
      p.busStop = p.tier !== 'village' || r() < 0.4;
      p.kidjobs = p.tier === 'city' ? CITYJOBS : KIDJOBS[p.biome];
      p.jobs = p.tier === 'city' ? ['hospitals', 'warehouses', 'restaurants', 'offices', 'the port', 'delivery'] : p.econ.concat(p.tier === 'town' ? ['school district', 'big-box store'] : []);
      p.people = []; for (let i = 0, tries = 0; p.people.length < (p.tier === 'village' ? 3 : 4) && tries < 60; tries++) { const n = pick(r, PEOPLE_N), role = pick(r, PEOPLE_R); if (p.people.some((q) => q.n === n || q.role === role)) continue; p.people.push({ n, role, mood: pick(r, MOOD) }); }
      p.notice = p.tier === 'village' ? 0.35 : p.tier === 'small' ? 0.22 : p.tier === 'town' ? 0.1 : 0.04; // how fast a new kid gets noticed
      p.danger = p.tier === 'city' ? 0.12 : p.tier === 'town' ? 0.05 : 0.02;
      p.motto = p.home ? 'Home of the 1911 station clock' : pick(r, ['"A Nice Place to Stay"', 'Home of the county fair', 'Pop. ' + p.pop.toLocaleString() + ' and one stoplight', 'Birthplace of a minor astronaut', 'Famous for its pie', 'You just missed the festival', 'Est. 1854']);
      if (p.home) p.police = 'Harlow PD: 64 officers on Route 9. You\'ve met Officer Lowe.';
      if (p.grandma) p.police = 'Cedar Falls PD: 6 officers, and the chief went to school with Grandma.';
    });
    // roads: connect each place to its 2 nearest, plus a highway through towns/cities
    const roads = [];
    places.forEach((p) => { places.filter((q) => q !== p).sort((a, b) => Math.hypot(a.x - p.x, a.y - p.y) - Math.hypot(b.x - p.x, b.y - p.y)).slice(0, p.tier === 'village' ? 1 : 2).forEach((q) => { const k = [p.id, q.id].sort().join('-'); if (!roads.some((r2) => r2.k === k)) roads.push({ k, a: p.id, b: q.id, hw: p.tier !== 'village' && q.tier !== 'village' }); }); });
    const rail = [harlow.id, cedar.id, capital.id]; places.filter((p) => p.station && !rail.includes(p.id)).forEach((p) => rail.push(p.id));
    return { seed, name: 'Averland', state: pick(r, ['North Averland', 'Averland']), places, roads, rail, coast, river, mountains, forests, lakes };
  };

  A.data = function () { const G = SH.G; if (!G) return null; if (!G.atlas || !G.atlas.places) G.atlas = A.generate((G.story && G.story.seed) || 1); return G.atlas; };
  A.here = () => { const D = A.data(); return D.places.find((p) => p.id === (SH.G.away || 'p0')); };
  const MI = 0.35; // miles per map unit
  A.miles = (a, b) => Math.round(Math.hypot(a.x - b.x, a.y - b.y) * MI);
  A.modes = function (from, to) {
    const G = SH.G, mi = A.miles(from, to), out = [];
    if (mi <= 9) out.push({ k: 'walk', n: 'Walk', mins: Math.round(mi * 22), cost: 0, e: Math.round(mi * 4), note: mi > 5 ? 'Long. Your legs will hate you.' : '' });
    if (mi <= 22 && (SH.f('hasBike') || G.bag.includes('bike'))) out.push({ k: 'bike', n: 'Bike', mins: Math.round(mi * 7), cost: 0, e: Math.round(mi * 2) });
    if (from.busStop && to.busStop && mi <= 40) out.push({ k: 'bus', n: 'County bus', mins: Math.round(mi * 3 + 25), cost: 2 + Math.round(mi / 10), e: 2, note: 'Local transit. Kids ride these alone all the time.' });
    if (mi > 9) out.push({ k: 'intercity', n: 'Intercity bus / train', blocked: 'Won\'t sell a ticket to anyone 12 or under without an adult. Real rule, real companies.' });
    return out;
  };

  /* ---------- drawing ---------- */
  A.svg = function (D, sel, W = 900, H = 600) {
    const P = (id) => D.places.find((p) => p.id === id);
    const cur = A.here();
    const pl = (pts) => pts.map((p) => p.map((v) => v.toFixed(0)).join(',')).join(' ');
    let s = `<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" class="atlas-svg" style="width:100%;height:auto;display:block;background:#1c2a3a;border-radius:10px">`;
    s += `<polygon points="0,0 ${pl(D.coast)} 0,600" fill="#2f4a36"/>`;
    D.forests.forEach((f) => { s += `<circle cx="${f[0].toFixed(0)}" cy="${f[1].toFixed(0)}" r="${f[2].toFixed(0)}" fill="#264530" opacity=".85"/>`; });
    D.mountains.forEach((m) => { s += `<path d="M${(m[0] - 14).toFixed(0)} ${(m[1] + 10).toFixed(0)} L${m[0].toFixed(0)} ${(m[1] - 12).toFixed(0)} L${(m[0] + 14).toFixed(0)} ${(m[1] + 10).toFixed(0)}Z" fill="#5d6b5a" stroke="#839180" stroke-width="1"/>`; });
    D.lakes.forEach((l) => { s += `<ellipse cx="${l[0].toFixed(0)}" cy="${l[1].toFixed(0)}" rx="${(l[2] * 1.4).toFixed(0)}" ry="${l[2].toFixed(0)}" fill="#2d5a80"/>`; });
    s += `<polyline points="${pl(D.river)}" fill="none" stroke="#3a6f99" stroke-width="4" stroke-linecap="round"/>`;
    D.roads.forEach((r) => { const a = P(r.a), b = P(r.b); s += `<line x1="${a.x.toFixed(0)}" y1="${a.y.toFixed(0)}" x2="${b.x.toFixed(0)}" y2="${b.y.toFixed(0)}" stroke="${r.hw ? '#c9b27a' : '#7f7a68'}" stroke-width="${r.hw ? 2.2 : 1.2}" opacity=".8"/>`; });
    for (let i = 1; i < D.rail.length; i++) { const a = P(D.rail[i - 1]), b = P(D.rail[i]); s += `<line x1="${a.x.toFixed(0)}" y1="${a.y.toFixed(0)}" x2="${b.x.toFixed(0)}" y2="${b.y.toFixed(0)}" stroke="#d0d6e0" stroke-width="1.5" stroke-dasharray="5 4" opacity=".55"/>`; }
    const R = { city: 9, town: 6.5, small: 4.5, village: 3 };
    D.places.forEach((p) => {
      const on = sel === p.id, isCur = cur && cur.id === p.id;
      s += `<g class="apl" data-id="${p.id}" style="cursor:pointer"><circle cx="${p.x.toFixed(0)}" cy="${p.y.toFixed(0)}" r="${R[p.tier] + 9}" fill="transparent"/>`;
      s += `<circle cx="${p.x.toFixed(0)}" cy="${p.y.toFixed(0)}" r="${R[p.tier]}" fill="${p.home ? '#ffd166' : p.grandma ? '#f4a2c0' : p.tier === 'city' ? '#ff8c69' : p.tier === 'town' ? '#f2e2b8' : '#d6d0c0'}" stroke="${on ? '#fff' : '#111'}" stroke-width="${on ? 3 : 1}"/>`;
      if (isCur) s += `<circle cx="${p.x.toFixed(0)}" cy="${p.y.toFixed(0)}" r="${R[p.tier] + 6}" fill="none" stroke="#5ac8fa" stroke-width="2.5"><animate attributeName="r" values="${R[p.tier] + 4};${R[p.tier] + 10};${R[p.tier] + 4}" dur="2s" repeatCount="indefinite"/></circle>`;
      if (p.tier !== 'village' || on) s += `<text x="${(p.x + R[p.tier] + 4).toFixed(0)}" y="${(p.y + 4).toFixed(0)}" font-size="${p.tier === 'city' ? 15 : p.tier === 'town' ? 12.5 : 10.5}" fill="#f4f1e8" font-family="system-ui" font-weight="${p.tier === 'city' || p.home ? 700 : 500}" paint-order="stroke" stroke="#0d1520" stroke-width="3">${esc(p.name)}</text>`;
      s += '</g>';
    });
    s += `<text x="14" y="${H - 14}" font-size="13" fill="#9fb0c4" font-family="system-ui">${esc(D.state)} · ${D.places.length} places · — rail · ▬ highway</text></svg>`;
    return s;
  };

  A.card = function (p) {
    const G = SH.G, cur = A.here(), T = A.TIERS[p.tier], mi = A.miles(cur, p);
    const sv = p.services;
    const modes = cur.id === p.id ? [] : A.modes(cur, p);
    const canGo = G.phase === 'run' && !G.ended && cur.id !== p.id;
    return `<div class="acard"><div style="display:flex;justify-content:space-between;align-items:baseline;gap:8px"><b style="font-size:16px">${esc(p.name)}</b><small>${T.n} · pop. ${p.pop.toLocaleString()}</small></div>
      <div class="muted" style="font-size:12px;margin:2px 0 8px">${esc(p.motto)} · ${esc(p.biome)}${cur.id === p.id ? ' · <b style="color:#5ac8fa">you are here</b>' : ` · ${mi} mi away`}</div>
      <div class="arow">🚓 ${esc(p.police)}</div>
      <div class="arow">🏭 Works at: ${esc(p.jobs.join(', '))}</div>
      <div class="arow">🧒 A kid might find: ${esc(p.kidjobs.join('; '))}</div>
      <div class="arow">🏥 ${sv.hospital ? 'Hospital' : 'No hospital (nearest clinic is a drive)'} · ${sv.shelter ? '🏠 Youth shelter' : 'No youth shelter'} · ${sv.library ? '📚 Library' : 'No library'}</div>
      <div class="arow">📶 Free wifi: ${sv.wifi.length ? esc(sv.wifi.join(', ')) : 'none. Bring data.'} · ${p.station ? '🚆 Station' : ''} ${p.busStop ? '🚌 Bus stop' : 'No bus'}</div>
      <div class="arow">👥 ${p.people.map((x) => `<b>${esc(x.n)}</b> ${esc(x.role)} <i>(${esc(x.mood)})</i>`).join('; ')}</div>
      ${p.grandma ? `<div class="arow">💗 Grandma lives here.${SH.f('grandmaAddr') ? ' 41 Larkspur Lane.' : ' You don\'t know the exact address.'}</div>` : ''}
      ${modes.length ? `<div class="sech" style="margin-top:8px">GETTING THERE</div>${modes.map((m) => m.blocked ? `<div class="arow muted">🚫 ${m.n}: ${esc(m.blocked)}</div>` : `<div class="arow">${m.k === 'walk' ? '🚶' : m.k === 'bike' ? '🚲' : '🚌'} ${m.n}: ${Math.floor(m.mins / 60)}h ${m.mins % 60}m${m.cost ? ' · $' + m.cost : ''} ${m.note ? '<i>' + esc(m.note) + '</i>' : ''} ${canGo ? `<button class="btn small" onclick="SH.Atlas.go('${p.id}','${m.k}')">Go</button>` : ''}</div>`).join('')}${G.phase !== 'run' ? '<div class="muted" style="font-size:11.5px">Just looking. (You haven\'t left home.)</div>' : ''}` : ''}</div>`;
  };

  /* ---------- phone app ---------- */
  A.sel = null;
  function view(body) {
    const D = A.data(); const P = SH.Phone;
    const sel = A.sel && D.places.find((p) => p.id === A.sel) || A.here();
    body.innerHTML = P.hdr('🧭 Atlas') + `<div class="appbody"><div class="muted" style="font-size:11.5px;margin-bottom:6px">${esc(D.name)}. Tap a place.</div>${A.svg(D, sel.id)}${A.card(sel)}</div>`;
    body.querySelectorAll('.apl').forEach((g) => (g.onclick = () => { A.sel = g.dataset.id; P.render(); }));
  }
  if (SH.Phone && SH.Phone.V) { SH.Phone.V.atlas = view; (SH.Phone.extraApps = SH.Phone.extraApps || []).push({ at: 9, app: ['atlas', '🧭', 'Atlas', '#2a9d8f'] }); }

  /* ---------- going somewhere ---------- */
  A.go = function (id, mode) {
    const G = SH.G, D = A.data(), from = A.here(), to = D.places.find((p) => p.id === id);
    const m = A.modes(from, to).find((x) => x.k === mode); if (!m || m.blocked) return;
    if (m.cost && G.money < m.cost) return SH.UI.toast('Not enough money.');
    if (to.home) { G.away = null; SH.money(-(m.cost || 0)); SH.advance(m.mins, { interrupt: false }); SH.st('energy', -m.e); G.loc = 'bus'; SH.UI.log(`Back in Harlow. It looks exactly the same, which feels rude.`, 'sys'); SH.UI.afterAction(); SH.Phone.render(); return; }
    if (m.cost) SH.money(-m.cost);
    SH.st('energy', -m.e); SH.st('full', -Math.round(m.mins / 30));
    SH.advance(m.mins, { interrupt: false });
    if (G.ended) return;
    G.away = id; G.awayVisits = G.awayVisits || {}; G.awayVisits[id] = (G.awayVisits[id] || 0) + 1; G.awayNotice = 0;
    SH.UI.log(`You arrive in ${to.name}. ${to.tier === 'village' ? 'One street, a church, a grain elevator. A dog watches you like it\'s going to report you.' : to.tier === 'small' ? 'A main street with a diner, a hardware store, and a lot of people who know each other\'s trucks.' : to.tier === 'town' ? 'Bigger than Harlow. Nobody looks twice. Yet.' : 'Noise, traffic, a thousand strangers. Invisible feels good for about ten minutes.'}`, 'day');
    if (to.grandma) SH.UI.log(SH.f('grandmaAddr') ? 'Grandma\'s street is ten minutes from here. 41 Larkspur Lane.' : 'Grandma is somewhere in this town. You don\'t know the address.', 'sys');
    SH.Phone.render(); A.hub();
  };

  /* the town view: a place isn't a location on the Harlow map, so it gets its own menu */
  A.hub = function () {
    const G = SH.G; if (!G.away || G.ended) return;
    const p = A.here(), sv = p.services, h = SH.hour(), dark = h >= 20 || h < 6;
    const ch = [];
    ch.push({ t: 'Walk around', sub: 'See what this place is like', fn: () => A.act('walk') });
    if (sv.grocery || p.tier !== 'village') ch.push({ t: 'Buy food ($3)', sub: sv.grocery ? 'The grocery / gas station' : 'Gas station', fn: () => A.act('food') });
    if (sv.wifi.length && !dark) ch.push({ t: 'Find wifi (' + sv.wifi[0] + ')', sub: 'Charge a bit, get online', fn: () => A.act('wifi') });
    if (!dark) ch.push({ t: 'Ask around for work', sub: p.kidjobs[0], fn: () => A.act('work') });
    ch.push({ t: 'Talk to someone', sub: p.people.map((x) => x.n).join(', '), fn: () => A.act('talk') });
    if (p.grandma && SH.f('grandmaAddr')) ch.push({ t: 'Go to Grandma\'s house', cls: 'safe', fn: () => SH.Endings.grandma('walk') });
    if (sv.shelter && p.tier === 'city') ch.push({ t: 'Find the youth shelter', cls: 'safe', sub: 'Every city has one. They\'ll take you in, no questions tonight.', fn: () => SH.Endings.harbor ? SH.Endings.harbor('city') : SH.Endings.found('self') });
    if (p.hasPolice) ch.push({ t: 'Walk into the police station', cls: 'safe', sub: 'Tell them. Running away isn\'t a crime.', fn: () => SH.Endings.found('self') });
    else ch.push({ t: 'Call the sheriff (911 non-emergency)', cls: 'safe', sub: 'No station here. A deputy will drive out.', fn: () => SH.Endings.found('sheriff') });
    ch.push({ t: dark ? 'Find somewhere to sleep' : 'Rest a while', sub: p.tier === 'village' ? 'Church steps, a bus shelter, a barn' : 'A laundromat, a bench, a library corner', fn: () => A.act('sleep') });
    ch.push({ t: 'Open Atlas (go somewhere else)', fn: () => { SH.Phone.open('atlas'); SH.Mobile && SH.Mobile.showPhone && SH.Mobile.showPhone(); } });
    SH.UI.dialog({ title: p.name, text: [`${A.TIERS[p.tier].n}, pop. ${p.pop.toLocaleString()} · ${SH.fmt()} · ${dark ? 'dark' : 'daylight'}`, noticeLine(p)], choices: ch });
  };
  function noticeLine(p) { const n = SH.G.awayNotice || 0; return n > 60 ? 'People are definitely looking at you now.' : n > 30 ? 'The woman at the gas station looked at you a second too long.' : p.tier === 'city' ? 'Nobody\'s looking at you. That\'s good and bad.' : 'So far nobody\'s asked who you are.'; }
  function noticed(p, k) {
    const G = SH.G; G.awayNotice = (G.awayNotice || 0) + Math.round(100 * p.notice * k * (G.reported ? 1.6 : 0.8) * (G.party && G.party.length ? 1.4 : 1));
    if (G.awayNotice >= 100) { G.away = null; SH.Endings.found(p.hasPolice ? 'away' : 'sheriff'); return true; }
    return false;
  }
  A.act = function (k) {
    const G = SH.G, p = A.here(), back = () => setTimeout(A.hub, 30);
    const D = (title, text, extra) => SH.UI.dialog({ title, text: [].concat(text), choices: [{ t: 'Okay', fn: back }].concat(extra || []) });
    if (k === 'walk') { SH.advance(40, { interrupt: false }); if (noticed(p, 0.5)) return; SH.st('mood', 2);
      const bits = { village: [`You walk the whole village in twelve minutes. There's a notice board: a lost cat, a church supper, a tractor for sale. ${p.people[0].n}, who ${p.people[0].role}, waves at you like everybody waves at everybody.`], small: [`Main Street: ${p.econ[0]}, a diner with pie in the window, a closed movie theater with a sign that still says COMING SOON. The trucks all have the same county sticker.`], town: [`${p.name} has a real downtown. You pass the ${p.econ[0]}, a Dollar General, a high school with a football field bigger than your whole block.`], city: [`Buses, sirens, food carts. You pass three people talking to themselves and one of them is on a phone. You pass a sign for the youth shelter without meaning to look for it.`] };
      if (Math.random() < p.danger) return SH.UI.dialog({ title: 'A man in a nice car', text: ['He slows down beside you. "Hey, you look lost. Need a ride? I can buy you dinner. No big deal."', 'Your stomach does the thing it does when something is wrong.'], choices: [{ t: 'Walk away fast, toward people', cls: 'safe', fn: () => { SH.st('stress', 10); SH.UI.log('You walk into the nearest store and stand by the register until the car is gone. Your hands don\'t stop shaking for twenty minutes. You were right to listen to your stomach.', 'bad'); back(); } }, { t: 'Tell a store clerk', cls: 'safe', fn: () => SH.Endings.found('self') }] });
      return D(p.name, pick2(bits[p.tier])); }
    if (k === 'food') { if (G.money < 3) return D('Food', 'You count your change twice. It\'s not enough.'); SH.money(-3); SH.st('full', 30); SH.advance(15, { interrupt: false }); if (noticed(p, 0.4)) return; return D('Food', `A hot dog and a chocolate milk. The cashier ${p.tier === 'village' || p.tier === 'small' ? 'asks if you\'re "one of the Hendersons\' grandkids." You nod. It\'s easier.' : 'doesn\'t look up.'}`); }
    if (k === 'wifi') { SH.advance(60, { interrupt: false }); SH.Net && SH.Net.joinPublic(p.name + ' ' + p.services.wifi[0]); G.phone.bat = Math.min(100, G.phone.bat + 15); if (noticed(p, 0.3)) return; return D('Wifi', `The ${p.services.wifi[0]} has an outlet and a password taped to the counter. Your phone buzzes back to life with ${Object.values(G.unread || {}).reduce((a, b) => a + (b || 0), 0)} unread messages.`); }
    if (k === 'work' && (SH.hour() < 7 || SH.hour() >= 20)) return D('Work', 'Everything that might need a kid to sweep or stack or pick is closed. A dog barks at you from behind a fence. Try in the morning.');
    if (k === 'work') { SH.advance(120, { interrupt: false }); if (noticed(p, 0.9)) return; const job = pick2(p.kidjobs), ok = Math.random() < (p.tier === 'city' ? 0.35 : 0.55);
      if (!ok) return D('Work', `You ask about "${job}". ${pick2(['"How old are you, hon? ...Where are your folks?" You leave before the second question gets a follow-up.', '"Sorry kid, I can\'t pay a minor. I\'d lose my license." He says it kindly. It doesn\'t help.', '"You should be in school," the woman says, and reaches for her phone, and you are already walking.'])}`);
      const pay = 5 + Math.floor(Math.random() * 11); SH.money(pay); SH.st('energy', -15); SH.st('mood', 4);
      return D('Work', `You ${job.replace(/ \(.+\)$/, '')} for two hours. Your back hurts. ${pick2(p.people).n} pays you $${pay} in crumpled bills and gives you a look that says they know. They don't say it. Yet.`); }
    if (k === 'talk') { const who = pick2(p.people); Object.assign(SH.NPCS_META.local, { n: who.n, ini: who.n[0], full: who.n + ', ' + p.name }); return SH.Talk.open('local', { first: localOpen(who), turnsMax: 7, local: who, place: p, onEnd: (c) => { if (c.result === 'help') return SH.Endings.found(p.hasPolice ? 'self' : 'sheriff'); if (c.result === 'call') { G.awayNotice = 100; noticed(p, 0); return; } back(); } }); }
    if (k === 'sleep') { const dark = SH.hour() >= 20 || SH.hour() < 6; const mins = dark ? 7 * 60 : 120; SH.st('warmth', p.tier === 'village' ? -18 : -10); SH.advance(mins, { interrupt: false }); SH.st('energy', dark ? 40 : 18); if (G.ended) return; if (noticed(p, dark ? 0.6 : 0.3)) return; return D('Rest', dark ? `You sleep in ${pick2(p.tier === 'village' ? ['a bus shelter with one wall missing', 'the church doorway', 'a hay barn that smells like summer'] : ['a 24-hour laundromat, curled on a plastic chair', 'a bench behind the library', 'the stairwell of a parking garage'])}. Badly. You wake up every time a car passes.` : 'You close your eyes for a while. It helps a little.'); }
  };
  const pick2 = (a) => a[Math.floor(Math.random() * a.length)];
  function localOpen(w) { return /nosy|friendly|lonely/.test(w.mood) ? `Well hey there. I'm ${w.n}. I don't think I know you. Whose kid are you?` : /suspicious/.test(w.mood) ? 'Can I help you with something?' : `${w.n}. You need something, kid?`; }

  SH.NPCS_META.local = { n: 'A local', full: 'Someone who lives here', col: '#9a8c7a', ini: '?', ph: false };
  SH.Brain.local = function (an, c) {
    const w = (c.opts && c.opts.local) || { n: 'Someone', mood: 'kind' }, p = (c.opts && c.opts.place) || {}; c.mem.n = (c.mem.n || 0) + 1;
    if (c.turn === 1 && SH.NPCS_META.local) SH.NPCS_META.local.n = w.n;
    const R = (say, x) => Object.assign({ say, fx: {} }, x || {});
    if (an.has('selfharm')) { c.result = 'help'; return R('Okay. You come sit with me. We\'re calling someone right now, and I\'m not going anywhere.', { end: true }); }
    if (an.has('disclose') || an.has('scared') || (an.has('run') && c.mem.n > 1)) { c.result = 'help'; return R(/too friendly/.test(w.mood) ? 'You know what, let me call somebody who does this for a living. Stay right here, in the store, where people can see.' : 'Oh, sweetheart. Okay. You did the right thing telling me. Let\'s get you somewhere warm and call the people who can help.', { end: true }); }
    if (/too friendly/.test(w.mood) && /\b(ride|stay|place|sleep|money)\b/.test(an.t)) { c.result = 'call'; return R('...Actually, let me make a call first.', { end: true }); }
    if (an.has('lie') || /\b(visiting|my (grandma|aunt|uncle|cousin) lives)\b/.test(an.t)) { c.mem.sus = (c.mem.sus || 0) + 1; if (c.mem.sus >= 2 && /suspicious|no-nonsense/.test(w.mood)) { c.result = 'call'; return R('Uh huh. What\'s their name, then? ...That\'s what I thought. Hang on.', { end: true }); } return R(/nosy/.test(w.mood) ? 'Oh yeah? Which house? I know everybody.' : 'Mm. Okay.'); }
    if (an.has('hungry') || /\bfood|eat\b/.test(an.t)) return R(/lonely|kind|soft/.test(w.mood) ? 'You hungry? Here, I got half a sandwich I wasn\'t going to finish. Don\'t argue.' : 'There\'s a gas station on the corner.', { fx: { full: 15 } });
    if (/\b(what|anything) (is there )?to do\b|\bwhat'?s (it|this place) like\b/.test(an.t)) return R(`Here? ${p.econ ? 'The ' + p.econ[0] + ', mostly. ' : ''}${p.tier === 'village' ? 'Everybody knows everybody. That\'s the good part and the bad part.' : 'Depends who you ask.'}`);
    if (c.mem.n >= 4 && /nosy|no-nonsense|suspicious/.test(w.mood)) { c.result = 'call'; return R('Kid, I\'m going to be straight with you. You\'re alone, it\'s a school day, and you look like you slept outside. I\'m calling somebody. It\'s for your own good.', { end: true }); }
    return R(pick2(['School out today, is it?', 'You\'re not from around here.', 'Cold one today.', /lonely/.test(w.mood) ? 'Nobody much comes through anymore. Nice to have somebody to talk to.' : 'Mm-hm.']));
  };

  // while you're somewhere else, the Harlow menu shouldn't show Harlow things
  const bList = SH.Actions.list;
  SH.Actions.list = function () {
    const G = SH.G;
    if (G && G.away && G.phase === 'run') { const p = A.here(); return { rooms: null, acts: [{ label: `Look around ${p.name}`, sub: A.TIERS[p.tier].n + ' · pop. ' + p.pop.toLocaleString(), cls: 'safe', fn: () => A.hub() }, { label: 'Open Atlas', sub: 'Go somewhere else', fn: () => SH.Phone.open('atlas') }] }; }
    return bList.apply(this, arguments);
  };
})(window.SH);
