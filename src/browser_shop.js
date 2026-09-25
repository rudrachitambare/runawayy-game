/* SMALL HOURS — Part 1g: Everything (online store — any product; pickup locker; pay by card or cash at pickup)
   and SwapSpot (used marketplace: fair sellers, scams that want a deposit, and red-flag "come alone" sellers;
   you can list your own stuff too). No theft: things only change hands when someone pays. */
(function (SH) {
  const B = SH.Browser, C = SH.Catalog; if (!B || !C) return;
  const G = () => SH.G, esc = B.esc, $2 = B.$2;
  const S = SH.Shop = {};
  const orders = () => (G().orders = G().orders || []);
  const here = () => { const g = G(); return g.away ? g.away : 'harlow'; };
  const hereName = () => (G().away && SH.Atlas ? SH.Atlas.here().name : 'Harlow');

  /* ---------------- Everything ---------------- */
  B.SITES['everything.av'] = { n: 'Everything', icon: '📦', col: '#e38b12', mb: 1.4, tile: true, order: 3, render(path) {
    const pm = path.match(/^p\/(x_\w+)/), cm = path.match(/^c\/(\w+)/), q = decodeURIComponent((path.match(/q=([^&]*)/) || [])[1] || '');
    const top = `<div style="display:flex;gap:5px;margin-bottom:6px"><input id="esq" placeholder="Search Everything" value="${esc(q)}" style="flex:1;min-width:0"><button class="btn" onclick="SH.Browser.go('everything.av/?q='+encodeURIComponent(document.querySelector('#esq').value))">🔎</button></div>`;
    const tile = (p) => `<a href="#" onclick="SH.Browser.go('everything.av/p/${p.id}');return false" style="color:inherit;text-decoration:none;display:block;background:#ffffff0d;border-radius:9px;padding:6px;text-align:center"><div style="font-size:24px">${p.i}</div><div style="font-size:11px;line-height:1.2;height:27px;overflow:hidden">${esc(p.n)}</div><b style="font-size:12px">${$2(p.price)}</b></a>`;
    const grid = (L) => `<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:6px">${L.map(tile).join('')}</div>`;
    const mine = orders().filter((o) => !o.done);
    const ob = mine.length ? B.card(`<b>📦 Your orders</b>${mine.map((o) => `<div style="font-size:11.5px">${C.ALL[o.key].i} ${esc(C.ALL[o.key].n)} · ${o.paid ? 'paid' : 'pay ' + $2(o.price + 1) + ' cash at pickup'} · ${G().t >= o.ready ? `<b style="color:#6fdc8c">ready at ${esc(o.atName)} locker</b>` : 'arrives ' + SH.dateStr(o.ready) + ' ' + SH.fmt12(o.ready)}</div>`).join('')}`) : '';
    if (pm) {
      const p = C.ALL[pm[1]]; if (!p) return top + 'Not found.';
      return top + `<div style="text-align:center;font-size:54px">${p.i}</div><div style="font-size:15px;font-weight:600">${esc(p.n)}</div><div style="font-size:20px;margin:2px 0">${$2(p.price)}</div><div class="muted" style="font-size:12px">${esc(C.desc(p))}</div>
        ${p.adult ? B.card('🔞 18+ only. You look at it for exactly one second. <i>' + esc(C.refuse(p)) + '</i>') : p.restricted ? B.card('🪪 Adult signature required on delivery. ' + esc(C.restrictMsg(p))) : ''}
        <div class="muted" style="font-size:11px;margin:6px 0">Ships to the pickup locker at the ${esc(hereName())} ${G().away ? 'gas station' : 'QuikMart'}, next day.</div>
        ${p.adult ? '' : `<div style="display:flex;gap:5px;flex-wrap:wrap">${B.btn(`SH.Shop.order('${p.id}','card')`, '💳 Buy with PocketPal', 'primary')}${B.btn(`SH.Shop.order('${p.id}','cash')`, '💵 Pay cash at pickup (+$1)')}</div>`}
        <p>${B.lnk('everything.av/c/' + p.cat, '← more ' + esc((C.CATS.find((c) => c[0] === p.cat) || [0, p.cat])[1]))}</p>`;
    }
    if (q) { const L = C.search(q); return top + ob + (L.length ? grid(L) : `<p class="muted">No results for "${esc(q)}". Everything has everything, just not that.</p>`); }
    if (cm) return top + ob + `<b>${esc((C.CATS.find((c) => c[0] === cm[1]) || [0, cm[1]])[1])}</b>` + (cm[1] === 'adult' ? B.card('You\'re twelve. Sam scrolls past this so fast the page barely loads.') : '') + grid(C.byCat(cm[1]));
    return top + ob + `<div style="display:grid;grid-template-columns:repeat(2,1fr);gap:6px">${C.CATS.map(([k, n]) => B.lnk('everything.av/c/' + k, n, 'display:block;background:#ffffff0d;border-radius:9px;padding:9px;font-size:12.5px')).join('')}</div><div class="sech">POPULAR NEAR YOU</div>` + grid(['x_powerbank', 'x_sleepbag', 'x_kick', 'x_ramen', 'x_tent1', 'x_beanie'].map((k) => C.ALL[k]));
  } };
  B.index(/buy|shop|store|order|amazon|everything|price|cheap|deliver/, 'everything.av', 'Everything · the everything store', 'Anything, next-day pickup.');

  S.order = function (key, how) {
    const g = G(), p = C.ALL[key]; if (!p) return; if (p.adult) return SH.UI.toast(C.refuse(p));
    if (how === 'card' && !(SH.Bank && SH.Bank.pay(p.price, 'Everything: ' + p.n))) return;
    const ready = g.t + 1440 - (g.t % 1440) + 11 * 60; // next day 11 AM
    orders().push({ key, price: p.price, paid: how === 'card', at: here(), atName: hereName(), ready, t: g.t });
    SH.UI.toast(`📦 Ordered ${p.n}. Pickup at the ${hereName()} locker tomorrow after 11 AM.`); SH.Browser.go('everything.av');
  };
  S.ready = () => { const g = G(); return orders().filter((o) => !o.done && o.at === here() && g.t >= o.ready); };
  S.pickup = function () {
    const g = G(), L = S.ready(); if (!L.length) return SH.UI.toast('Nothing in the locker for you yet.'); const got = [], lines = [];
    L.forEach((o) => {
      const p = C.ALL[o.key];
      if (p.restricted) { o.done = true; if (o.paid && SH.Bank) SH.Bank.deposit(o.price, 'Refund: ' + p.n); lines.push(`${p.n}: the clerk needs an adult signature. "Sorry, bud." ${o.paid ? 'Refunded to your card.' : ''}`); return; }
      if (!o.paid) { if (g.money < o.price + 1) { lines.push(`${p.n}: ${$2(o.price + 1)} cash due. You don't have it. It'll wait 3 more days.`); return; } SH.money(-(o.price + 1)); (g.tx = g.tx || []).push({ t: g.t, d: 'Everything pickup: ' + p.n, a: -(o.price + 1) }); }
      o.done = true; C.give(o.key); got.push(p.i + ' ' + p.n);
    });
    SH.advance(5, { interrupt: false });
    SH.UI.dialog({ title: 'Pickup locker', text: [got.length ? `You punch in the code. The little door pops open: ${got.join(', ')}.` : 'Nothing you can take today.'].concat(lines), choices: [{ t: 'Okay', fn: () => (g.away && SH.Atlas ? setTimeout(SH.Atlas.hub, 30) : SH.UI.afterAction()) }] });
  };

  /* ---------------- SwapSpot ---------------- */
  const SELL = ['kick', 'escoot', 'bikeused', 'bmx', 'sleepbag', 'tent1', 'tent4', 'powerbank', 'solar', 'stove', 'lantern', 'console2', 'heater', 'speaker', 'mattress', 'boots', 'rainjacket', 'helmet', 'lock'];
  const NAMES = ['Deb R.', 'Tony M.', 'Kayla', 'Big Gary', 'J. Whitfield', 'Marisol', 'Dwayne', 'Pastor Lin', 'Chloe (moving sale)', 'Rob\'s Garage', 'user8812', 'Nikki T.'];
  S.listings = function () {
    const g = G(), day = SH.day(), r = B.rnd(B.seed() * 7 + day * 31 + (g.away ? g.away.length * 17 : 0)), L = [];
    for (let i = 0; i < 9; i++) {
      const key = 'x_' + SELL[Math.floor(r() * SELL.length)], p = C.ALL[key], roll = r();
      const kind = roll < 0.16 ? 'scam' : roll < 0.26 ? 'creep' : 'fair';
      const pct = kind === 'scam' ? 0.25 + r() * 0.1 : 0.4 + r() * 0.3;
      const cond = ['like new', 'good', 'used', 'well loved', 'needs a little work'][Math.floor(r() * 5)];
      const where = kind === 'creep' ? 'pickup at my place, come alone' : ['meet at the mall entrance', 'meet at the QuikMart', 'porch pickup, daytime', 'meet at the library parking lot'][Math.floor(r() * 4)];
      const note = kind === 'scam' ? 'MUST GO TODAY!! PocketPal deposit first to hold it, then I ship. No meetups sorry.' : kind === 'creep' ? 'Just come by yourself, I\'ll throw in something extra 😉 young buyers welcome' : ['Works great, just upgraded.', 'Kid outgrew it.', 'Cash only, no holds.', 'Small scuff, otherwise perfect.', 'Moving, everything must go.'][Math.floor(r() * 5)];
      L.push({ id: day + '_' + i, key, price: Math.max(3, Math.round(p.price * pct)), seller: NAMES[Math.floor(r() * NAMES.length)], kind, cond, where, note });
    }
    return L;
  };
  const deals = () => (G().swap = G().swap || { bought: {}, meets: [], mine: [] });
  B.SITES['swapspot.av'] = { n: 'SwapSpot', icon: '♻️', col: '#12a37f', mb: 1.6, tile: true, order: 4, render(path) {
    const d = deals(), L = S.listings(), m = path.match(/^l\/(\w+)/);
    if (path === 'sell') {
      const g = G(), mine = (g.owned || []).concat(g.bag).filter((k) => C.ALL[k] && !C.ALL[k].adult);
      return `<b>Sell your stuff</b><p class="muted" style="font-size:11.5px">List it and someone usually bites within a day. You meet in public and get cash.</p>${mine.length ? mine.map((k) => `<div class="setrow" style="display:flex;justify-content:space-between;align-items:center;font-size:12px">${C.ALL[k].i} ${esc(C.ALL[k].n)}${d.mine.some((x) => x.key === k && !x.done) ? '<span class="muted">listed</span>' : B.btn(`SH.Shop.list('${k}')`, 'List ' + $2(Math.round(C.ALL[k].price * 0.5)))}</div>`).join('') : '<p class="muted">Nothing to sell (catalog items only).</p>'}`;
    }
    if (m) { const l = L.find((x) => x.id === m[1]); if (!l) return 'Listing expired.'; const p = C.ALL[l.key];
      return `<div style="text-align:center;font-size:50px">${p.i}</div><b style="font-size:15px">${esc(p.n)}</b> · ${esc(l.cond)}<div style="font-size:20px">${$2(l.price)} <small class="muted" style="font-size:11px">new: ${$2(p.price)}</small></div><div class="muted" style="font-size:12px">${esc(l.seller)} · ${esc(l.where)}</div>${B.card(esc(l.note))}
        ${d.bought[l.id] ? '<p class="muted">You already arranged this one.</p>' : `<div>${B.btn(`SH.Shop.swapBuy('${l.id}')`, l.kind === 'scam' ? '💳 Send deposit' : 'Message seller', 'primary')}</div>`}<p class="muted" style="font-size:11px">Tips: meet in public, in daylight. Never pay before you see it. Anyone who says "come alone" is a no.</p>`; }
    return `<div style="display:flex;justify-content:space-between;align-items:center"><b>Near ${esc(hereName())}</b>${B.lnk('swapspot.av/sell', '+ Sell')}</div>${d.meets.filter((x) => !x.done).map((x) => B.card(`📍 Meet ${esc(x.seller)} at <b>${esc(x.locName)}</b> for ${esc(C.ALL[x.key].n)} · ${$2(x.price)} cash`, 'border-color:#12a37f88')).join('')}${d.mine.filter((x) => !x.done && x.buyer).map((x) => B.card(`💵 ${esc(x.buyer)} wants your ${esc(C.ALL[x.key].n)} · meet at <b>the mall</b>`, 'border-color:#12a37f88')).join('')}
      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:6px">${L.map((l) => `<a href="#" onclick="SH.Browser.go('swapspot.av/l/${l.id}');return false" style="color:inherit;text-decoration:none;background:#ffffff0d;border-radius:9px;padding:6px;text-align:center;display:block"><div style="font-size:22px">${C.ALL[l.key].i}</div><div style="font-size:10.5px;height:26px;overflow:hidden">${esc(C.ALL[l.key].n)}</div><b>${$2(l.price)}</b></a>`).join('')}</div>`;
  } };
  B.index(/used|second ?hand|swap|marketplace|craigslist|sell|scooter|bike|tent|sleeping bag|cheap/, 'swapspot.av', 'SwapSpot · buy & sell used stuff nearby', 'Used scooters, bikes, gear. Meet in public.');

  S.swapBuy = function (id) {
    const g = G(), d = deals(), l = S.listings().find((x) => x.id === id); if (!l) return; const p = C.ALL[l.key];
    if (l.kind === 'scam') {
      return SH.UI.dialog({ title: '⚠️ This is risky', text: ['A price this low, "deposit first," "no meetups": those are the three classic signs of a scam. If you pay, the money is gone.'], choices: [
        { t: 'Skip it', cls: 'safe', fn: () => {} },
        { t: `Pay the ${$2(Math.round(l.price / 2))} deposit anyway`, cls: 'danger', fn: () => { if (!SH.Bank || !SH.Bank.pay(Math.round(l.price / 2), 'SwapSpot deposit: ' + l.seller)) return; d.bought[id] = true; setTimeout(() => SH.Phone.notify && SH.Phone.notify('browser', 'SwapSpot', `${l.seller} has deleted their account.`), 5000); SH.UI.toast('Deposit sent. "Great!! shipping tomorrow!!" says ' + l.seller + '.'); SH.Phone.render(); } }] });
    }
    if (l.kind === 'creep') {
      return SH.UI.dialog({ title: '⚠️ This is risky', text: ['"Come by yourself." "Young buyers welcome." A winky face. An adult inviting a kid to their place alone is a huge red flag, whatever they\'re selling.'], choices: [
        { t: 'Nope. Report the listing.', cls: 'safe', fn: () => { d.bought[id] = true; SH.flag('reportedListing'); SH.UI.toast('Reported. The listing disappears by evening.'); SH.Phone.render(); } },
        { t: 'Ask if you can meet somewhere public instead', fn: () => { d.bought[id] = true; SH.UI.dialog({ title: l.seller, text: ['"nah it\'s at my place or nothing. why r u being weird about it"', 'That answer tells you everything.'], choices: [{ t: 'Block them', cls: 'safe', fn: () => SH.Phone.render() }] }); } }] });
    }
    const spots = g.away ? [['hub', hereName() + ' gas station']] : [['mall', 'the mall entrance'], ['store', 'the QuikMart'], ['library', 'the library lot']];
    const sp = spots[Math.floor(Math.random() * spots.length)];
    d.bought[id] = true; d.meets.push({ id, key: l.key, price: l.price, seller: l.seller, loc: sp[0], locName: sp[1], at: here(), t: g.t });
    SH.UI.toast(`${l.seller}: "sure! meet at ${sp[1]}, bring cash." It's on SwapSpot's front page.`); SH.Phone.render();
  };
  S.meetsHere = () => { const g = G(); return deals().meets.filter((x) => !x.done && x.at === here() && (g.away ? x.loc === 'hub' : x.loc === g.loc)); };
  S.doMeet = function (x) {
    const g = G(), p = C.ALL[x.key];
    if (g.money < x.price) return SH.UI.toast(`${x.seller} wants ${$2(x.price)} cash. You have ${$2(g.money)}.`);
    SH.money(-x.price); (g.tx = g.tx || []).push({ t: g.t, d: 'SwapSpot: ' + p.n, a: -x.price }); x.done = true; C.give(x.key); SH.advance(15, { interrupt: false });
    SH.UI.dialog({ title: 'SwapSpot meetup', text: [`${x.seller} is exactly who the profile picture said. They hand over the ${p.n}, count your cash, and say "${['have fun with it', 'take care of her', 'pleasure doing business', 'my kid loved that thing'][Math.floor(Math.random() * 4)]}." ${Math.random() < 0.3 ? 'They look at you a second longer than normal, like they\'re doing math about your age. Then they let it go.' : ''}`], choices: [{ t: 'Okay', fn: () => (g.away && SH.Atlas ? setTimeout(SH.Atlas.hub, 30) : SH.UI.afterAction()) }] });
  };
  S.list = function (key) { const d = deals(); d.mine.push({ key, price: Math.round(C.ALL[key].price * 0.5), t: G().t, buyer: null }); SH.UI.toast('Listed. Someone will probably message you by tomorrow.'); SH.Phone.render(); };
  S.sellMeet = function (x) {
    const g = G(); const i = (g.owned || []).indexOf(x.key); if (i >= 0) g.owned.splice(i, 1); else if (!SH.rmBag(x.key)) { x.done = true; return SH.UI.toast('You don\'t have it anymore.'); }
    x.done = true; SH.money(x.price); (g.tx = g.tx || []).push({ t: g.t, d: 'Sold on SwapSpot: ' + C.ALL[x.key].n, a: x.price }); SH.advance(15, { interrupt: false });
    SH.UI.log(`${x.buyer} checks the ${C.ALL[x.key].n} over, nods, and pays you $${x.price} in cash.`, 'good'); SH.UI.afterAction();
  };
  // buyers show up for your listings
  const bAdv = SH.advance;
  SH.advance = function () { const r = bAdv.apply(this, arguments); const g = G(); if (g && g.swap) g.swap.mine.forEach((x) => { if (!x.done && !x.buyer && g.t - x.t > 360 && Math.random() < 0.15) { x.buyer = NAMES[Math.floor(Math.random() * NAMES.length)]; SH.Phone.notify && SH.Phone.notify('browser', 'SwapSpot', `${x.buyer} wants your ${C.ALL[x.key].n} for $${x.price}. Meet at the mall.`); } }); return r; };

  /* ---------------- actions: locker, meetups (Harlow) + Atlas hub ---------------- */
  const A = SH.Actions;
  if (A && A.list) {
    const bList = A.list;
    A.list = function () {
      const r = bList.apply(this, arguments), g = G(); if (!g || g.away || !r || !r.acts) return r;
      if (g.loc === 'store' && S.ready().length) r.acts.unshift({ label: `Open the pickup locker (${S.ready().length})`, sub: 'Your Everything order is here.', fn: S.pickup });
      S.meetsHere().forEach((x) => r.acts.unshift({ label: `Meet ${x.seller} (SwapSpot)`, sub: `${C.ALL[x.key].n} · $${x.price} cash`, fn: () => S.doMeet(x) }));
      if (g.loc === 'mall' && g.swap) g.swap.mine.filter((x) => !x.done && x.buyer).forEach((x) => r.acts.unshift({ label: `Sell to ${x.buyer} (SwapSpot)`, sub: `${C.ALL[x.key].n} · +$${x.price}`, fn: () => S.sellMeet(x) }));
      return r;
    };
  }
  if (SH.Atlas) (SH.Atlas.extra = SH.Atlas.extra || []).push((p, ch, dark) => {
    if (S.ready().length && !dark) ch.unshift({ t: `Pickup locker (${S.ready().length})`, sub: 'At the gas station', fn: S.pickup });
    S.meetsHere().forEach((x) => { if (!dark) ch.unshift({ t: `Meet ${x.seller} (SwapSpot)`, sub: `$${x.price} cash`, fn: () => S.doMeet(x) }); });
  });
})(window.SH);
