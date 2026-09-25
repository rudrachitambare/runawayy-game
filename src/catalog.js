/* SMALL HOURS — Part 1c: the product catalog ("buy ANY product"). Every category exists. Items register into
   SH.ITEMS as x_<id> so the bag/stash/pawn systems understand them. Big things (tents, bikes, scooters, TVs)
   go to G.owned instead of the backpack. Adult-only stuff exists in the catalog but Sam refuses it;
   age-restricted stuff (medicine, lighters, knives, fuel) needs an adult signature/ID and won't be handed over.
   Row: [id, name, icon, price, weight, cat, extras] */
(function (SH) {
  const C = SH.Catalog = {};
  const R = [
    // food & drink
    ['ramen', 'Instant ramen (6-pack)', '🍜', 3.5, 0.6, 'food', { food: 18, uses: 6 }], ['pb', 'Peanut butter jar', '🥜', 3.2, 0.5, 'food', { food: 15, uses: 5 }],
    ['bread', 'Loaf of bread', '🍞', 2.5, 0.5, 'food', { food: 10, uses: 6 }], ['cereal', 'Cereal box', '🥣', 4, 0.5, 'food', { food: 12, uses: 5 }],
    ['cans', 'Canned soup (3)', '🥫', 4.5, 1.2, 'food', { food: 20, uses: 3 }], ['trail', 'Trail mix', '🥜', 5, 0.4, 'food', { food: 14, uses: 4 }],
    ['jerky', 'Beef jerky', '🥩', 7, 0.2, 'food', { food: 14, uses: 3 }], ['fruit', 'Bag of apples', '🍎', 4, 1, 'food', { food: 8, uses: 6 }],
    ['energy', 'Energy drink', '🥤', 3, 0.4, 'food', { food: 2, energy: 12 }], ['water6', 'Water (6 bottles)', '💧', 4, 3, 'food', { food: 4, uses: 6 }],
    ['candy', 'Candy bag', '🍬', 3, 0.3, 'food', { food: 6, mood: 3 }], ['sandwich', 'Deli sandwich', '🥪', 6, 0.3, 'food', { food: 28 }],
    // clothes & disguise
    ['hoodie2', 'Plain gray hoodie', '🧥', 18, 0.8, 'clothes', { warm: 8, disguise: 1 }], ['beanie', 'Beanie', '🧢', 8, 0.1, 'clothes', { warm: 4, disguise: 1 }],
    ['cap', 'Baseball cap', '🧢', 12, 0.1, 'clothes', { disguise: 1 }], ['glasses', 'Clear-lens glasses', '👓', 10, 0.05, 'clothes', { disguise: 2 }],
    ['dye', 'Box hair dye', '🎨', 11, 0.3, 'clothes', { disguise: 3 }], ['socks', 'Wool socks (3)', '🧦', 12, 0.2, 'clothes', { warm: 5 }],
    ['rainjacket', 'Rain jacket', '🧥', 35, 0.6, 'clothes', { warm: 6, rain: true }], ['boots', 'Hiking boots', '🥾', 55, 1.2, 'clothes', { walk: 1 }],
    ['gloves', 'Gloves', '🧤', 9, 0.1, 'clothes', { warm: 4 }], ['sweats', 'Sweatpants', '👖', 15, 0.5, 'clothes', { warm: 3 }],
    // hygiene & health
    ['wipes', 'Baby wipes', '🧻', 4, 0.4, 'hygiene', { hygiene: 12, uses: 8 }], ['toothkit', 'Toothbrush + paste', '🪥', 4, 0.1, 'hygiene', { hygiene: 6 }],
    ['soap', 'Soap bar', '🧼', 2, 0.1, 'hygiene', { hygiene: 8 }], ['deo', 'Deodorant', '🧴', 5, 0.1, 'hygiene', { hygiene: 6 }],
    ['pads', 'Period pads', '🩹', 6, 0.2, 'hygiene', {}], ['tp', 'Toilet paper (4)', '🧻', 5, 0.6, 'hygiene', {}],
    ['bandaids', 'Band-aids', '🩹', 4, 0.05, 'health', { heal: 4 }], ['firstaid', 'First-aid kit', '⛑️', 18, 0.5, 'health', { heal: 12 }],
    ['sunscreen', 'Sunscreen', '🧴', 8, 0.2, 'health', {}], ['painkiller', 'Pain reliever', '💊', 7, 0.05, 'health', { restricted: 'medicine' }],
    ['coldmeds', 'Cold medicine', '💊', 9, 0.1, 'health', { restricted: 'medicine' }], ['inhaler2', 'Rescue inhaler', '🫁', 60, 0.1, 'health', { restricted: 'prescription' }],
    // camping & shelter
    ['sleepbag', 'Sleeping bag', '🛌', 35, 2.5, 'camping', { sleepWarm: 40 }], ['tent1', 'Small tent (1–2)', '⛺', 45, 3, 'camping', { shelter: 1, big: true }],
    ['tent4', 'Big tent (4–6)', '🏕️', 120, 7, 'camping', { shelter: 2, big: true }], ['tarp', 'Tarp', '🟦', 12, 1, 'camping', { rain: true }],
    ['mat', 'Foam sleeping mat', '🟩', 15, 0.8, 'camping', { sleepWarm: 12 }], ['stove', 'Camp stove', '🔥', 30, 1, 'camping', { cook: true }],
    ['gas', 'Stove gas canister', '🛢️', 6, 0.4, 'camping', { restricted: 'fuel' }], ['lantern', 'LED lantern', '🏮', 16, 0.5, 'camping', {}],
    ['filter', 'Water filter straw', '🥤', 20, 0.1, 'camping', {}], ['rope', 'Paracord', '🪢', 8, 0.3, 'camping', {}],
    ['bugspray', 'Bug spray', '🦟', 7, 0.2, 'camping', {}], ['cooler', 'Cooler', '🧊', 25, 3, 'camping', { big: true }],
    ['mess', 'Pot + spork kit', '🍳', 14, 0.4, 'camping', {}], ['lighter', 'Lighter', '🔥', 2, 0.05, 'camping', { restricted: 'lighter' }],
    // tools & fixing
    ['multitool', 'Multi-tool', '🛠️', 25, 0.3, 'tools', { restricted: 'blade' }], ['ducttape', 'Duct tape', '🩶', 6, 0.3, 'tools', { fix: 1 }],
    ['wrench', 'Wrench set', '🔧', 20, 1.5, 'tools', { fix: 2 }], ['pump', 'Bike pump', '🚲', 15, 0.6, 'tools', { fix: 1 }],
    ['patch', 'Tire patch kit', '🛞', 5, 0.1, 'tools', { fix: 1 }], ['lock', 'U-lock', '🔒', 25, 1.2, 'tools', {}],
    ['padlock', 'Padlock', '🔐', 8, 0.2, 'tools', {}], ['hammer', 'Hammer + nails', '🔨', 14, 1, 'tools', { fix: 2 }],
    ['broom', 'Broom', '🧹', 12, 1, 'tools', { big: true }], ['plywood', 'Plywood sheet', '🪵', 28, 10, 'tools', { big: true, build: 1 }],
    // electronics
    ['cable', 'Charging cable', '🔌', 8, 0.1, 'electronics', {}], ['powerbank', 'Power bank (10,000 mAh)', '🔋', 22, 0.3, 'electronics', { charge: 2 }],
    ['powerbank2', 'Power bank (26,800 mAh)', '🔋', 45, 0.6, 'electronics', { charge: 5 }], ['solar', 'Foldable solar charger', '☀️', 40, 0.6, 'electronics', { solar: true }],
    ['earbuds', 'Earbuds', '🎧', 15, 0.05, 'electronics', { mood: 2 }], ['speaker', 'Bluetooth speaker', '🔊', 25, 0.5, 'electronics', { mood: 3 }],
    ['flash2', 'Headlamp', '🔦', 14, 0.1, 'electronics', {}], ['radio', 'Hand-crank radio', '📻', 30, 0.6, 'electronics', { charge: 1 }],
    ['fan', 'Battery fan', '🌀', 18, 0.5, 'electronics', {}], ['heater', 'Space heater', '♨️', 35, 2, 'electronics', { big: true, needsOutlet: true, warm: 20 }],
    ['strip', 'Power strip', '🔌', 12, 0.4, 'electronics', { outlets: 4 }], ['phone2', 'Cheap Android phone', '📱', 60, 0.2, 'electronics', {}],
    ['console2', 'Handheld console', '🎮', 150, 0.4, 'electronics', { mood: 5 }], ['tv', 'Small TV', '📺', 110, 5, 'electronics', { big: true, needsOutlet: true }],
    ['kettle', 'Electric kettle', '☕', 20, 1, 'electronics', { needsOutlet: true, cook: true }], ['battery', 'AA batteries (8)', '🔋', 7, 0.2, 'electronics', {}],
    ['carbat', 'Car battery', '🔋', 95, 15, 'electronics', { big: true, vehicle: 1 }], ['inverter', 'Power inverter', '⚡', 35, 1, 'electronics', { vehicle: 1 }],
    // vehicles & rides
    ['kick', 'Kick scooter', '🛴', 40, 3, 'rides', { big: true, ride: 'kick' }], ['escoot', 'Electric scooter', '🛴', 320, 12, 'rides', { big: true, ride: 'escooter' }],
    ['bmx', 'BMX bike', '🚲', 180, 11, 'rides', { big: true, ride: 'bike' }], ['bikeused', 'Used bike', '🚲', 60, 13, 'rides', { big: true, ride: 'bike' }],
    ['bikenew', 'New mountain bike', '🚵', 420, 13, 'rides', { big: true, ride: 'bike' }], ['cargo', 'Cargo bike', '🚲', 900, 25, 'rides', { big: true, ride: 'cargo' }],
    ['helmet', 'Helmet', '⛑️', 25, 0.5, 'rides', {}], ['bikelight', 'Bike lights', '💡', 12, 0.1, 'rides', {}],
    ['tires', 'Used car tires (set)', '🛞', 80, 30, 'rides', { big: true, vehicle: 1 }], ['motoroil', 'Motor oil', '🛢️', 12, 1, 'rides', { vehicle: 1 }],
    ['sparkplugs', 'Spark plugs', '⚙️', 15, 0.2, 'rides', { vehicle: 1 }],
    // school, fun, gifts
    ['notebook', 'Notebook', '📓', 3, 0.3, 'fun', {}], ['markers', 'Markers', '🖍️', 8, 0.2, 'fun', { art: 1 }], ['cards', 'Deck of cards', '🃏', 3, 0.1, 'fun', { mood: 2 }],
    ['ball', 'Basketball', '🏀', 20, 0.6, 'fun', { mood: 3 }], ['book', 'Paperback book', '📕', 9, 0.3, 'fun', { mood: 3 }], ['plush', 'Stuffed animal', '🧸', 12, 0.3, 'fun', { mood: 4 }],
    ['flowers', 'Flowers', '💐', 10, 0.3, 'fun', { gift: 8 }], ['chocs', 'Box of chocolates', '🍫', 8, 0.3, 'fun', { gift: 6, food: 10 }], ['bracelet', 'Friendship bracelet kit', '🧶', 6, 0.1, 'fun', { gift: 10 }],
    ['giftcard', 'Game store gift card ($25)', '🎁', 25, 0, 'fun', { gift: 12 }], ['lemonade', 'Lemonade stand kit', '🍋', 15, 2, 'fun', { biz: 'stand' }],
    // home & household
    ['blanket2', 'Fleece blanket', '🛏️', 12, 2, 'home', { sleepWarm: 25 }], ['pillow', 'Pillow', '🛌', 10, 0.8, 'home', { sleepWarm: 5 }],
    ['curtain', 'Blackout curtain', '🪟', 18, 0.8, 'home', { build: 1 }], ['doorstop', 'Door wedge alarm', '🚪', 12, 0.2, 'home', {}],
    ['mattress', 'Air mattress', '🛏️', 30, 2, 'home', { big: true, sleepWarm: 15 }], ['bucket', 'Bucket', '🪣', 5, 0.5, 'home', {}],
    ['trash', 'Trash bags', '🗑️', 6, 0.3, 'home', {}], ['detergent', 'Laundry pods', '🧺', 9, 0.8, 'home', { hygiene: 4 }],
    // adult-only (exist, Sam refuses)
    ['beer', 'Beer (6-pack)', '🍺', 10, 2.5, 'adult', { adult: 'alcohol' }], ['wine', 'Wine', '🍷', 14, 1.3, 'adult', { adult: 'alcohol' }],
    ['cigs', 'Cigarettes', '🚬', 9, 0.1, 'adult', { adult: 'tobacco' }], ['vape', 'Vape', '💨', 20, 0.1, 'adult', { adult: 'vape' }],
    ['lottery', 'Lottery tickets', '🎟️', 5, 0, 'adult', { adult: 'gambling' }], ['magazine', 'Adults-only magazine', '📰', 8, 0.2, 'adult', { adult: 'adult' }],
  ];
  C.CATS = [['food', '🍎 Food'], ['clothes', '👕 Clothes'], ['hygiene', '🧼 Hygiene'], ['health', '⛑️ Health'], ['camping', '🏕️ Camping'], ['tools', '🛠️ Tools'], ['electronics', '🔌 Electronics'], ['rides', '🛴 Rides & parts'], ['fun', '🎁 Fun & gifts'], ['home', '🏠 Home'], ['adult', '🔞 18+']];
  C.ALL = {};
  R.forEach(([id, n, i, price, w, cat, x]) => {
    const key = 'x_' + id, p = Object.assign({ id: key, n, i, price, w, cat }, x);
    C.ALL[key] = p;
    if (!SH.ITEMS[key]) SH.ITEMS[key] = Object.assign({ n, i, w: p.big ? 0 : w, d: desc(p), price, sell: Math.round(price * 0.3) }, x);
  });
  function desc(p) {
    const b = [];
    if (p.food) b.push(`+${p.food} fullness${p.uses ? ` ×${p.uses}` : ''}`); if (p.sleepWarm) b.push(`warmth +${p.sleepWarm} sleeping`); if (p.warm) b.push(`warmth +${p.warm}`);
    if (p.hygiene) b.push(`hygiene +${p.hygiene}`); if (p.disguise) b.push('changes your look'); if (p.charge) b.push(`${p.charge} phone charge${p.charge > 1 ? 's' : ''}`);
    if (p.ride) b.push('a ride (faster travel)'); if (p.needsOutlet) b.push('needs an outlet'); if (p.big) b.push('too big for a backpack');
    if (p.restricted) b.push('ID/adult needed'); if (p.gift) b.push('a good gift'); return b.join(' · ') || p.cat;
  }
  C.desc = desc;
  // re-describe now that desc exists (hoisting guard)
  Object.values(C.ALL).forEach((p) => { SH.ITEMS[p.id].d = desc(p); });

  C.search = (q) => { q = (q || '').toLowerCase().trim(); if (!q) return []; return Object.values(C.ALL).filter((p) => p.n.toLowerCase().includes(q) || p.cat.includes(q) || (q.length > 3 && p.id.includes(q))); };
  C.byCat = (cat) => Object.values(C.ALL).filter((p) => p.cat === cat);
  C.refuse = (p) => ({ alcohol: 'nope. I\'m not that braindead.', tobacco: 'nope. I\'m not that braindead. Also Grandma would come back from Cedar Falls just to yell at me.', vape: 'nope. I\'m not that braindead.', gambling: 'nope. I\'m not that braindead. That\'s literally how Rick lost the car money.', adult: 'nope. absolutely not. I\'m not that braindead.' })[p.adult] || 'nope.';
  C.restrictMsg = (p) => ({ medicine: 'The clerk won\'t sell medicine to a kid alone.', prescription: 'That needs a prescription. With your name, your mom\'s insurance and a pharmacist asking questions.', fuel: 'Fuel canisters: 18+ at the register.', lighter: 'Lighters: ID required.', blade: 'Anything with a blade: 18+. They check.' })[p.restricted] || 'Adults only.';

  /* receive an item: backpack if it fits, otherwise G.owned (big things / overflow go to your stash or base) */
  C.give = function (key) {
    const g = SH.G, p = C.ALL[key]; if (!p) return false;
    if (p.adult) { SH.UI.toast(C.refuse(p)); return false; }
    g.owned = g.owned || [];
    if (p.big) { g.owned.push(key); if (p.ride === 'bike' || p.ride === 'cargo') SH.flag('hasBike'); if (p.ride) SH.flag('hasRide_' + p.ride); return true; }
    if (!SH.addBag(key)) { g.owned.push(key); SH.UI.toast(`${p.n}: backpack's full, so it goes with your other stuff.`); }
    return true;
  };
  C.fmt = (n) => '$' + n.toFixed(2);
})(window.SH);
