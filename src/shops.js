/* SMALL HOURS — Part 2b: real stores in every place, by size.
   Village: one general store (a bit of everything, pricey, the owner knows everyone).
   Small town: general store, hardware, pharmacy. Town: + supermarket, sporting goods, electronics.
   City: everything, cheapest, nobody looks at you. Buying stuff gets you noticed (less in cities).
   Clerks won't sell restricted things to a kid alone. Adult stuff can go in the basket, but Sam won't open it. */
(function (SH) {
  const K = SH.K, C = SH.Catalog, A = SH.Atlas; if (!K || !C || !A) return;
  const G = K.G;
  const STORES = {
    general: { n: 'General store', cats: ['food', 'hygiene', 'health', 'clothes', 'home', 'tools', 'fun'], max: 40, mul: 1.25 },
    hardware: { n: 'Hardware store', cats: ['tools', 'camping', 'home', 'rides'], mul: 1.05 },
    pharmacy: { n: 'Pharmacy', cats: ['health', 'hygiene', 'food'], mul: 1.1 },
    market: { n: 'Supermarket', cats: ['food', 'hygiene', 'home', 'adult'], mul: 0.95 },
    sport: { n: 'Sporting goods', cats: ['camping', 'clothes', 'rides', 'fun'], mul: 1 },
    tech: { n: 'Electronics store', cats: ['electronics'], mul: 1 },
    mall: { n: 'The mall', cats: ['clothes', 'electronics', 'fun', 'food', 'hygiene', 'health', 'camping', 'rides', 'home', 'tools', 'adult'], mul: 0.9 },
  };
  const BY_TIER = { village: ['general'], small: ['general', 'hardware', 'pharmacy'], town: ['market', 'hardware', 'pharmacy', 'sport', 'tech'], city: ['mall', 'market', 'hardware', 'pharmacy', 'sport', 'tech'] };
  const NOTICE = { village: 7, small: 4, town: 2, city: 0.5 };
  const price = (p, s, place) => Math.max(1, Math.round(p.price * STORES[s].mul * (place.tier === 'village' ? 1.1 : place.tier === 'city' ? 0.92 : 1)));
  function stock(s, place) { const st = STORES[s]; let L = st.cats.flatMap((c) => C.byCat(c)); if (st.max) L = L.filter((p) => p.price <= st.max || p.cat === 'food'); if (place.tier === 'village') L = L.filter((_, i) => (i + place.pop) % 3 !== 0); return L; }

  function store(place, s, cat) {
    const st = STORES[s], L = stock(s, place), cats = [...new Set(L.map((p) => p.cat))];
    const h = SH.hour(); if (h < 7 || h >= (place.tier === 'city' ? 22 : 20)) return K.D(st.n, 'Closed. A handwritten sign: "Back at 7."');
    if (!cat) return K.D(st.n, storeIntro(place, s), cats.map((c) => ({ t: (C.CATS.find((x) => x[0] === c) || [0, c])[1], sub: L.filter((p) => p.cat === c).length + ' things', fn: () => store(place, s, c) })).concat([{ t: 'Leave', fn: () => shops(place) }]));
    const items = L.filter((p) => p.cat === cat).slice(0, 14);
    K.D(`${st.n} · ${(C.CATS.find((x) => x[0] === cat) || [0, cat])[1]}`, `You have $${G().money.toFixed(2)}.`, items.map((p) => ({ t: `${p.i} ${p.n}: $${price(p, s, place)}`, sub: C.desc ? C.desc(p) : p.cat, fn: () => buy(place, s, p, cat) })).concat([{ t: 'Back', fn: () => store(place, s) }]));
  }
  function storeIntro(place, s) {
    const g = G();
    if (place.tier === 'village') return `A bell over the door. Bait, bread, batteries and birthday cards on the same shelf. The owner looks up. "Don't think I know you, hon." ${g.reported && K.chance(0.2) ? 'Her eyes stay on you a second too long.' : 'She goes back to her crossword.'}`;
    if (place.tier === 'city') return 'Fluorescent lights, self-checkout, a security guard watching his phone. Perfect.';
    return K.pick(['A teenage cashier with headphones in. Excellent.', 'The clerk nods at you and goes back to pricing cans.', '"Help you find anything?" "No thanks." Nobody ever means yes.']);
  }
  function buy(place, s, p, cat) {
    const g = G(), cost = price(p, s, place);
    if (p.adult) { SH.UI.toast(C.refuse(p)); SH.UI.log(`You pick it up, look at it, and put it back. ${C.refuse(p)}`, 'sys'); return store(place, s, cat); }
    if (p.restricted) { g.awayNotice = (g.awayNotice || 0) + NOTICE[place.tier] * 1.5; return K.D('At the register', [C.restrictMsg(p), place.tier === 'village' ? '"Your mom or dad can come get it for you, hon. Who\'s your mom?" You say you\'ll go get her.' : '"Is there a grown-up with you?"'], [{ t: 'Put it back', fn: () => store(place, s, cat) }]); }
    if (!K.pay(cost, `${STORES[s].n}: ${p.n}`)) return store(place, s, cat);
    if (!C.give(p.id)) { SH.money(cost); return store(place, s, cat); }
    if (g.away) { g.awayNotice = (g.awayNotice || 0) + NOTICE[place.tier]; }
    SH.UI.log(`Bought ${p.n} for $${cost}.`, 'sys'); SH.advance(10, { interrupt: false });
    store(place, s, cat);
  }
  function shops(place) {
    const list = BY_TIER[place.tier] || ['general'];
    K.D(`Stores in ${place.name}`, place.tier === 'village' ? 'One store. It sells everything, at prices that say "you should have gone to town."' : `${list.length} places to spend money you don't have much of. Buying things gets you noticed${place.tier === 'city' ? ', though not much here' : ''}.`, list.map((s) => ({ t: '🛒 ' + STORES[s].n, sub: [...new Set(stock(s, place).map((x) => x.cat))].slice(0, 5).join(', '), fn: () => store(place, s) })).concat([{ t: 'Back', fn: K.back }]));
  }
  K.hub((p, ch, dark) => { if (!dark) ch.splice(Math.min(3, ch.length), 0, { t: '🛒 Stores', sub: (BY_TIER[p.tier] || []).map((s) => STORES[s].n).join(', '), fn: () => shops(p) }); });
  SH.Stores = { STORES, BY_TIER, shops, store, price, stock };
})(window.SH);
