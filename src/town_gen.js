/* SMALL HOURS — towns as real places (1/5): the generator.
   Every Atlas town gets a street layout and a set of locations built from what it actually has (tier, services,
   economy, rail, motels, Grandma). They go into SH.LOC tagged with `town: <place id>` so the same map, scene,
   travel and action systems that run Harlow run them too. Harlow's own locations are hidden while you're away. */
(function (SH) {
  const TW = SH.Town = SH.Town || {};
  const h32 = (s) => { let h = 2166136261; for (const c of String(s)) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); } return h >>> 0; };
  const rngOf = (s) => { let a = h32(s) || 1; return () => { a ^= a << 13; a ^= a >>> 17; a ^= a << 5; return ((a >>> 0) % 1000003) / 1000003; }; };
  TW.rng = rngOf; TW.h32 = h32;
  const pk = (r, a) => a[Math.floor(r() * a.length)];

  const DINER = ['Rosie\'s', 'The Coffee Cup', 'Dot\'s Grill', 'The Chuckwagon', 'Sunrise Cafe', 'The Blue Plate', 'Lucky\'s', 'The Depot Diner', 'Hilltop Grill', 'Mae\'s Kitchen', 'The Egg & I', 'Frank\'s'];
  const GAS = ['Kwik Stop', 'Gas-N-Go', 'Pump & Pantry', 'Prairie Fuel', 'Hi-Way Mart', 'Tri-County Fuel', 'Speedy Mart', 'Git-N-Split', 'Fill-Er-Up', 'Corner Fuel'];
  const CHURCH = ['First Lutheran', 'St. Anne\'s', 'Grace Methodist', 'Trinity Church', 'First Baptist', 'St. Joseph\'s', 'Hope Community Church', 'the white church'];
  const LAUND = ['Wash World', 'Bubbles Laundry', 'Spin City', 'Clean Scene Coin-Op', 'The Suds Stop', 'Wishy Washy'];
  const PARK = { village: ['the ballfield', 'the church lawn', 'the little park by the water tower'], small: ['Town Square', 'Memorial Park', 'the bandstand green'], town: ['Veterans Park', 'Lions Park', 'Heritage Park', 'Centennial Park'], city: ['Riverside Commons', 'Liberty Park', 'Union Square', 'the Greenway'] };
  const STAFF = ['Deb', 'Carl', 'Lorna', 'Hank', 'Tammy', 'Ray', 'Bev', 'Duane', 'Shirley', 'Marcus', 'Ines', 'Tom', 'Yolanda', 'Walt', 'Kendra', 'Omar', 'Pearl', 'Vic', 'Luann', 'Dale', 'Priya', 'Arlo', 'Connie', 'Jerome', 'Faye', 'Gordon', 'Mireille', 'Sid'];
  const MOODS = ['lonely, likes to talk', 'busy, barely looks up', 'suspicious of strangers', 'no-nonsense, soft underneath', 'kind, a little nosy', 'tired, kind', 'cheerful, talks too much'];
  const WORK = { 'grain co-op': ['Grain Co-op', 'the grain elevator'], 'dairy farms': ['Dairy farm', 'a dairy barn'], 'feed store': ['Feed & Seed', 'the feed store'], 'fishing fleet': ['The docks', 'the fishing docks'], boatyard: ['Boatyard', 'the boatyard'], 'seafood plant': ['Seafood plant', 'the seafood plant'], orchards: ['Orchard', 'the apple orchard'], 'apple orchards': ['Orchard', 'the orchard'], sawmill: ['Sawmill', 'the sawmill'], 'lumber mill': ['Lumber mill', 'the mill'], quarry: ['Quarry road', 'the quarry'], mine: ['Mine road', 'the mine'], 'ski resort': ['Ski lodge', 'the lodge'], vineyards: ['Vineyard', 'the vineyard'], 'cattle ranches': ['Ranch', 'a ranch'], warehouses: ['Warehouse row', 'the warehouses'], 'the port': ['The port', 'the port'], 'tractor repair': ['Tractor repair', 'the tractor shop'], logging: ['Logging yard', 'the logging yard'], 'hunting outfitter': ['Outfitter', 'the outfitter'], campground: ['Campground', 'the campground'], 'barge terminal': ['Barge terminal', 'the barge terminal'], 'canning plant': ['Canning plant', 'the cannery'], 'bait shop': ['Bait shop', 'the bait shop'], marina: ['Marina', 'the marina'], 'summer cabins': ['Cabin rentals', 'the cabins'], 'fishing charters': ['Charter dock', 'the charter dock'], 'wind farm': ['Wind farm road', 'the wind farm'], 'tourist shops': ['Boardwalk', 'the boardwalk'], 'grain elevator': ['Grain elevator', 'the grain elevator'], 'rail depot': ['Rail depot', 'the rail depot'] };
  TW.biome = (b) => ({ farmland: 'fields', prairie: 'fields', 'hill country': 'hills', forest: 'forest', lakeshore: 'lake', 'river valley': 'river', coast: 'coast' })[b] || 'fields';
  const ROLE2KIND = [[/laundromat/, 'laundromat'], [/diner|cafe|waitress|cook/, 'diner'], [/gas station|clerk|night shift/, 'gas'], [/pastor|church|priest/, 'church'], [/librar/, 'library'], [/bus/, 'stop'], [/mail/, 'main'], [/teacher|knows everybody/, 'park'], [/motel/, 'motel'], [/farm|co-op|mill|dock|fisher/, 'work'], [/nurse|clinic|doctor/, 'clinic'], [/deputy|sheriff|police/, 'main']];
  const STAFF_ROLE = { diner: (L) => `works the counter at ${L.name}`, gas: (L) => `runs the register at ${L.name}`, library: () => 'the librarian', church: () => 'the pastor', laundromat: (L) => `keeps ${L.name} running`, clinic: () => 'at the clinic front desk', work: (L) => `foreman at ${L.short}`, park: () => 'walking an old dog, slowly', stop: () => 'waiting for the same bus as you, maybe' };

  /* hours: [open, close] in hours, or null = always */
  function hoursFor(kind, tier) {
    const big = tier === 'town' || tier === 'city';
    return { gas: big ? null : tier === 'small' ? [6, 22] : [6, 21], diner: tier === 'city' ? null : tier === 'town' ? [6, 22] : tier === 'small' ? [6, 20] : [6, 14], library: tier === 'village' ? [10, 16] : [9, 19],
      church: [7, 19], laundromat: tier === 'city' ? null : [6, 22], clinic: [8, 18], work: [6, 18], station: [5, 24] }[kind] || null;
  }

  TW.id = (pid, kind) => 't_' + pid + '_' + kind;
  TW.cache = {};
  TW.build = function (p) {
    if (!p || p.home) return null;
    if (TW.cache[p.id]) return TW.cache[p.id];
    const r = rngOf('town:' + p.id + ':' + ((SH.Atlas && SH.Atlas.data && SH.Atlas.data().seed) || 1)), tier = p.tier, sv = p.services || {};
    const east = r() < 0.5, X = (u) => Math.round(east ? u : 1000 - u), MY = 300 + Math.round(r() * 50);
    const squeeze = tier === 'village' ? 0.72 : tier === 'small' ? 0.86 : 1, U = (u) => X(500 + (u - 500) * squeeze);
    const T = { pid: p.id, name: p.name, tier, east, MY, locs: {}, people: [], rail: !!(p.rail || p.halt), railY: Math.min(600, MY + 190 + Math.round(r() * 30)) };
    const L = T.locs, placed = [];
    const add = (kind, o, u, dy) => {
      let x = U(u + (r() - 0.5) * 40), y = MY + dy + Math.round((r() - 0.5) * 24);
      for (let k = 0; k < 40 && placed.some((q) => Math.hypot(q[0] - x, q[1] - y) < 78); k++) { x += (r() - 0.5) * 60; y += (r() - 0.5) * 50; }
      x = Math.max(50, Math.min(950, Math.round(x))); y = Math.max(40, Math.min(610, Math.round(y))); placed.push([x, y]);
      const id = TW.id(p.id, kind), hrs = hoursFor(kind, tier);
      L[id] = Object.assign({ id, kind, town: p.id, x, y, type: 'tw_' + kind, indoor: false, vis: 0.6, hours: hrs, sub: '', blurb: '' }, o);
      return L[id];
    };
    const dn = pk(r, DINER), gn = pk(r, GAS), cn0 = pk(r, CHURCH), cn = cn0 === 'the white church' ? 'The White Church' : cn0, ln = pk(r, LAUND), park = pk(r, PARK[tier] || PARK.small);
    const street = tier === 'village' ? pk(r, ['Main Street', 'County Road 4', 'Front Street', 'Church Street']) : tier === 'city' ? pk(r, ['Market Street', 'Broadway', 'Central Avenue', '5th Avenue']) : 'Main Street';
    T.street = street;
    add('main', { name: tier === 'city' ? 'Downtown' : street, icon: '🏘️', sub: tier === 'village' ? 'The only street' : tier === 'city' ? street + ' and around' : 'Shops, the post office', vis: 0.8,
      blurb: { village: `${street}: a post office in somebody's front room, a notice board, a grain elevator you can see from anywhere.`, small: `Brick storefronts from 1910, half of them still open. Angle parking. Everybody's truck has the same county sticker.`, town: `A real downtown: a Dollar General, a pharmacy, two banks, a closed movie theater with a hopeful sign.`, city: `Traffic, food carts, glass towers at one end and pawn shops at the other. Nobody looks at anybody.` }[tier] }, 500, -52);
    const stopName = tier === 'city' ? p.name + ' Bus Terminal' : tier === 'town' ? p.name + ' bus depot' : tier === 'small' ? 'The bus stop' : 'The bus shelter';
    add('stop', { name: stopName, icon: '🚏', sub: tier === 'village' || tier === 'small' ? 'Outside the ' + pk(r, ['post office', 'general store', 'diner', 'feed store']) : 'Buses & tickets', vis: tier === 'city' ? 0.5 : 0.8, indoor: tier === 'city' || tier === 'town',
      blurb: tier === 'village' ? 'A plexiglass shelter with one wall kicked out and a timetable faded to pale blue. It smells like rain even when it isn\'t raining.' : tier === 'city' ? 'Twenty bays, a food court that closed in 2019, and security guards who are paid to notice kids alone.' : 'A bench, a timetable, a trash can. The place everyone in town sees on the way to somewhere else.' }, 430, 46);
    if (sv.gas !== false) add('gas', { name: gn, icon: '⛽', sub: tier === 'village' ? 'Gas, groceries, bait, gossip' : 'Gas station & store', vis: 0.7, indoor: true, blurb: `${gn}: two pumps, a coffee machine that's always on, a rack of phone chargers nobody buys, and a counter where the whole town's news goes through.` }, 770, 44);
    if (tier !== 'village' || (sv.wifi || []).includes('diner')) add('diner', { name: dn, icon: '☕', sub: tier === 'city' ? 'Open 24 hours' : 'Breakfast all day', vis: 0.6, indoor: true, blurb: `${dn}: vinyl booths, pie under a plastic dome, a waitress who calls everyone "hon". ${tier === 'village' || tier === 'small' ? 'The regulars have their own mugs on hooks.' : 'Truckers at the counter, students in the back.'}` }, 590, -50);
    if (sv.library) add('library', { name: tier === 'village' ? p.name + ' Library' : p.name + ' Public Library', icon: '📚', sub: 'Free wifi, outlets, warm', vis: 0.4, indoor: true, blurb: tier === 'village' ? 'One room in the old bank building. The vault is the children\'s section.' : 'Carpet that smells like old paper and radiator heat. Kids charge phones at the back tables and nobody asks.' }, 350, -54);
    if (sv.church) add('church', { name: cn, icon: '⛪', sub: 'Doors open days', vis: 0.4, indoor: true, blurb: `${cn}. The side door is usually unlocked. There's a food pantry shelf in the basement hallway with a sign that says TAKE WHAT YOU NEED.` }, 440, -150);
    add('park', { name: park[0].toUpperCase() + park.slice(1), icon: '🌳', sub: 'Benches, a restroom, trees', vis: 0.5, blurb: tier === 'village' ? 'A backstop, a set of bleachers, and a porta-potty. At night it\'s the darkest place in town.' : 'Paths, benches, a restroom that\'s locked after dusk, and a gazebo where teenagers smoke.' }, 560, 150);
    if (sv.laundromat) add('laundromat', { name: ln, icon: '🧺', sub: tier === 'city' ? 'Coin laundry · 24h' : 'Coin laundry', vis: 0.35, indoor: true, blurb: `${ln}: warm dryers, a folding table, a TV bolted high in the corner playing the weather on mute.` }, 650, 52);
    if (p.hasPolice) add('police', { name: p.name + ' Police', icon: '🚓', sub: tier === 'city' ? 'Precinct · 24/7' : 'Police station', vis: 1, indoor: true, blurb: 'Flag, glass doors, a bench in the lobby. Running away isn\'t a crime. Walking in here ends this, one way or another.' }, 300, 52);
    if (sv.hospital || tier === 'town' || tier === 'city') add('clinic', { name: sv.hospital && tier === 'city' ? p.name + ' General' : p.name + ' Community Clinic', icon: '🏥', sub: tier === 'city' ? 'Hospital + free clinic' : 'Walk-in clinic', vis: 0.8, indoor: true, blurb: 'Plastic chairs, a TV playing a cooking show, and a nurse at the desk who has seen every kind of kid come in.' }, 250, -66);
    const ms = SH.Motels && SH.Motels.motels ? SH.Motels.motels(p) : [];
    if (ms.length) add('motel', { name: ms.length > 1 ? 'Motel strip' : ms[0].n, icon: '🏨', sub: ms.map((m) => m.n).join(' · '), vis: 0.5, blurb: ms.length > 1 ? `Out by the highway: ${ms.map((m) => m.n).join(', ')}. Ice machines humming, trucks idling.` : `${ms[0].n}. A buzzing sign, an ice machine, a row of doors facing the parking lot.` }, 860, -48);
    const econ = (p.econ || [])[0] || 'feed store', wk = WORK[econ] || [econ[0].toUpperCase() + econ.slice(1), 'the ' + econ];
    add('work', { name: wk[0], short: wk[1], icon: '🚜', sub: 'Where the work is: ' + econ, vis: 0.5, blurb: `${wk[1][0].toUpperCase() + wk[1].slice(1)}. ${tier === 'city' ? 'Loading docks, forklifts, men on smoke breaks.' : 'Trucks in and out. Somebody here always needs a pair of hands for an hour.'}` }, 110, 120);
    add('edge', { name: 'Edge of town', icon: '🛣️', sub: 'Where it turns back into ' + { fields: 'fields', coast: 'dunes', forest: 'woods', hills: 'hills', lake: 'shoreline', river: 'river bottoms' }[TW.biome(p.biome)], vis: 0.15,
      blurb: { fields: p.biome === 'prairie' ? 'The sidewalk gives up. Grass to the horizon, barbed wire, cattle standing around like they\'re waiting for a bus.' : 'The sidewalk gives up. Corn stubble to the horizon, a grain truck every ten minutes, a barn with a sagging roof.', coast: 'Past the last house, the road bends along the dunes. Wind, gulls, a boarded-up bait shack.', forest: 'The streetlights stop and the pines start. A logging road goes off between the trees, and after about fifty feet you can\'t see where it goes.', hills: 'The road climbs out of town in switchbacks. Below, the whole place fits in your hand.', lake: 'The road runs along the water past shut-up summer cabins. A dock with no boat. Loons, if you\'re lucky.', river: 'The road drops down to the river: brown water, cottonwoods, a boat ramp, a sign that says NO SWIMMING that everyone ignores in July.' }[TW.biome(p.biome)] }, 960, 4);
    if (T.rail) { const st = add('station', { name: p.station || tier === 'city' || tier === 'town' ? p.name + ' Station' : p.name + ' halt', icon: '🚉', sub: p.station || tier === 'city' || tier === 'town' ? 'Trains' : 'A platform, a sign, a bench', vis: 0.5, indoor: !!(p.station || tier === 'city'), blurb: p.station || tier === 'city' ? 'A waiting room with wooden benches, a departures screen, and a vending machine that eats dollars.' : 'A concrete platform in the middle of nowhere. A sign with the town\'s name. A bench. A button that says PUSH TO SIGNAL TRAIN.' }, 520, 0); st.y = T.railY - 16; }
    if (p.grandma) add('grandma', { name: 'Larkspur Lane', icon: '🏡', sub: 'Grandma\'s street', vis: 0.6, hidden: true, blurb: 'Neat little houses, leaf piles at the curbs, wind chimes. Number 41 has a blue door.' }, 300, -170);
    if (sv.shelter && (tier === 'city' || tier === 'town')) add('shelter', { name: tier === 'city' ? 'Safe Harbor Youth Center' : p.name + ' Youth Shelter', icon: '🏮', sub: 'Youth drop-in · 24/7', vis: 0.1, indoor: true, blurb: 'A brick house with a porch light that never goes off. For kids who can\'t go home tonight. They don\'t call anybody the first night.' }, 690, -160);
    if (tier === 'town' || tier === 'city') add('backst', { name: 'Side streets', icon: '🌃', sub: 'Pawn shop, stalls, people who don\'t ask', vis: 0.25, blurb: 'Behind the main drag: a pawn shop, a taco stall, a bar with no windows, alleys that smell like fryer oil.' }, 620, -118);
    // people: the Atlas locals where their job is, plus someone behind every counter
    const used = {};
    (p.people || []).forEach((pp, i) => { let kind = (ROLE2KIND.find(([re]) => re.test(pp.role)) || [0, 'main'])[1]; let role = pp.role; if (!L[TW.id(p.id, kind)]) { kind = 'main'; role = pk(r, [`lives on ${street}`, 'retired, and on every committee in town', `drives a truck for ${(p.econ || ['the co-op'])[0]}`, 'runs the post office out of a front room']); } used[kind] = 1; T.people.push({ id: 'tw_' + p.id + '_' + i, n: pp.n, role, mood: pp.mood, kind }); });
    Object.keys(STAFF_ROLE).forEach((kind, j) => { const Lk = L[TW.id(p.id, kind)]; if (!Lk || used[kind]) return; if ((kind === 'park' || kind === 'stop') && r() < 0.4) return; let n = pk(r, STAFF); for (let k = 0; k < 6 && T.people.some((q) => q.n === n); k++) n = pk(r, STAFF); T.people.push({ id: 'tw_' + p.id + '_s' + j, n, role: STAFF_ROLE[kind](Lk), mood: pk(r, MOODS), kind, staff: true }); });
    // no townie shares a name with Sam's family or Harlow regulars; roles name the real building
    { const f = (SH.G && SH.G.fam) || {}, bad = new Set([f.mom, f.rick, f.sib, f.gma, SH.G && SH.G.name, 'Rick', 'Lily', 'Dana', 'Rose', 'Jordan', 'Pearl', 'Sam'].filter(Boolean).map((x) => String(x).toLowerCase()));
      T.people.forEach((q) => { for (let k = 0; k < 12 && (bad.has(q.n.toLowerCase()) || T.people.some((o) => o !== q && o.n === q.n)); k++) q.n = pk(r, STAFF.filter((x) => x !== 'Pearl'));
        const Lk = L[TW.id(p.id, q.kind)];
        if (q.kind === 'church' && Lk && /pastor/.test(q.role)) q.role = `the pastor at ${Lk.name}`;
        if (q.kind === 'library' && p.tier !== 'village' && p.tier !== 'small') q.role = q.role.replace(/ \(part-time[^)]*\)/, '');
        if (q.kind === 'work' && Lk && /^foreman at /.test(q.role)) q.role = `foreman at ${Lk.short || Lk.name}`;
        if (q.kind === 'stop' && /school bus/.test(q.role) && p.tier === 'city') q.role = 'waiting for the same bus as you, maybe'; }); }
    T.people.forEach((q) => { if (SH.NPCS_META && !SH.NPCS_META[q.id]) SH.NPCS_META[q.id] = { n: q.n, full: `${q.n}, ${q.role.replace(/ \(.*\)$/, '')} · ${p.name}`, col: ['#9a8c7a', '#7a8c9a', '#8a7a9a', '#7a9a8a', '#9a7a7a'][h32(q.id) % 5], ini: q.n[0], ph: false }; });
    TW.cache[p.id] = T;
    return T;
  };

  /* install into the live tables */
  TW.install = function (p) {
    const T = TW.build(p); if (!T) return null;
    Object.values(T.locs).forEach((L) => { SH.LOC[L.id] = L; if (SH.OPEN) SH.OPEN[L.id] = (h) => !L.hours || (h >= L.hours[0] && h < L.hours[1]); });
    if (SH.Run && SH.Run.sleepSpots) Object.assign(SH.Run.sleepSpots, TW.sleepSpots(T));
    return T;
  };
  TW.sleepSpots = function (T) {
    const o = {}, id = (k) => TW.id(T.pid, k), v = T.tier === 'village';
    o[id('stop')] = { q: 0.25, risk: 0.4, n: v ? 'the bench in the bus shelter, knees up, hood up' : 'a bench by the bays' };
    o[id('park')] = { q: 0.3, risk: 0.35, n: v ? 'the bleachers, under the top row where the wind can\'t reach' : 'the gazebo floor' };
    o[id('laundromat')] = { q: 0.45, risk: 0.35, n: 'a plastic chair by the warm dryers' };
    o[id('church')] = { q: 0.4, risk: 0.15, n: 'the step of the church doorway, out of the wind' };
    o[id('edge')] = { q: 0.35, risk: 0.2, n: v || T.tier === 'small' ? ({ forest: 'a bed of pine needles under a big spruce', coast: 'the sand on the lee side of a dune, out of the wind', lake: 'the porch of a shut-up summer cabin', river: 'the dry sand under the bridge' }[TW.biome((SH.Atlas.data().places.find((x) => x.id === T.pid) || {}).biome)] || 'loose hay in an open barn that smells like summer') : 'the dry concrete of a drainage culvert' };
    o[id('diner')] = { q: 0.3, risk: 0.3, n: 'the corner booth, pretending to wait for someone' };
    o[id('station')] = { q: 0.3, risk: 0.35, n: 'the wooden bench on the platform' };
    o[id('main')] = { q: 0.2, risk: 0.45, n: 'a doorway on ' + T.street };
    o[id('backst')] = { q: 0.25, risk: 0.55, n: 'a loading dock behind the pawn shop' };
    o[id('work')] = { q: 0.3, risk: 0.3, n: 'a pile of feed sacks in an open shed' };
    o[id('gas')] = { q: 0.15, risk: 0.5, n: 'the ice-machine corner behind the station' };
    return o;
  };
  TW.cur = () => { const G = SH.G; if (!G || !G.away) return null; return TW.cache[G.away] || (SH.Atlas && TW.install(SH.Atlas.here())); };
  TW.loc = (id) => { const L = SH.LOC[id || (SH.G && SH.G.loc)]; return L && L.town ? L : null; };
  TW.here = () => TW.loc();
  TW.people = (kind) => { const T = TW.cur(); return T ? T.people.filter((q) => q.kind === kind) : []; };
  TW.st = (pid) => { const G = SH.G; G.tw = G.tw || {}; return (G.tw[pid || G.away] = G.tw[pid || G.away] || { seen: {}, met: {}, told: {}, day: {} }); };
})(window.SH);
