/* SMALL HOURS — Part 1h: transport company sites (timetables, prices, age rules — booking arrives in Part 2),
   StayFinder (motel listings with fake + real reviews — booking arrives in Part 3), GiveTogether (fundraisers;
   a fake one can earn a little and can blow up in your face). */
(function (SH) {
  const B = SH.Browser; if (!B) return;
  const G = () => SH.G, esc = B.esc, $2 = B.$2;

  /* ---------------- transport companies ---------------- */
  const CO = SH.TRANSPORT = {
    averline: { n: 'Averline Coaches', icon: '🚌', col: '#0b5cad', tag: 'Comfort. Safety. Every major city.', rate: 0.16, base: 12, tiers: ['city', 'town'],
      rule: 'Children under 15 may not travel unaccompanied. Photo ID checked at boarding for all passengers who look under 18.', strict: 0.95 },
    cheapride: { n: 'CheapRide', icon: '🚐', col: '#e0245e', tag: 'Why pay more? (Seriously, why?)', rate: 0.07, base: 5, tiers: ['city', 'town', 'small'],
      rule: 'Unaccompanied minors 15+ only.* (*Driver discretion.)', strict: 0.45, late: 0.4 },
    rail: { n: 'Averland Regional Rail', icon: '🚆', col: '#5a3fa0', tag: 'The scenic way.', rate: 0.2, base: 9, tiers: ['city', 'town'], rail: true,
      rule: 'Children 12 and under must travel with an adult 18+. Ages 13–15 may travel alone on daytime trains with a consent form. Conductors check.', strict: 0.8 },
    county: { n: 'County Transit', icon: '🚏', col: '#3a7d2c', tag: 'Local buses, 6 AM – 9 PM.', rate: 0.05, base: 2, tiers: ['city', 'town', 'small', 'village'], local: 40,
      rule: 'Kids 10+ ride alone all the time. Exact change or tap card.', strict: 0.05 },
  };
  function routes(co) {
    const A = SH.Atlas; if (!A) return [];
    const D = A.data(), H = A.here(), c = CO[co];
    return D.places.filter((p) => p !== H && c.tiers.includes(p.tier) && (!c.local || A.miles(H, p) <= c.local) && (!c.rail || p.rail || p.tier === 'city'))
      .map((p) => { const mi = A.miles(H, p); return { p, mi, price: Math.round((c.base + mi * c.rate) * (SH.isWeekday && !SH.isWeekday() ? 1.15 : 1)), hrs: Math.max(0.3, mi / (c.rail ? 55 : 42)) }; })
      .sort((a, b) => a.mi - b.mi).slice(0, 8);
  }
  Object.entries(CO).forEach(([k, c], i) => {
    B.SITES[k + '.av'] = { n: c.n.split(' ')[0], icon: c.icon, col: c.col, mb: 1, tile: true, order: 10 + i, render() {
      const R = routes(k), h = SH.hour(), r = B.rnd(B.seed() + SH.day() * 3 + i);
      const times = (n) => Array.from({ length: n }, (_, j) => { const t = 6 + Math.floor(r() * 15); return (t % 12 || 12) + ':' + ['00', '15', '30', '45'][Math.floor(r() * 4)] + (t < 12 ? ' AM' : ' PM'); }).sort();
      return `<div style="background:${c.col};margin:-8px -10px 8px;padding:12px 10px"><div style="font-size:17px;font-weight:700">${c.icon} ${esc(c.n)}</div><div style="font-size:11.5px;opacity:.85">${esc(c.tag)}</div></div>
        <b>From ${esc(B.place().name)}</b>${R.length ? R.map((x) => `<div class="setrow" style="font-size:12px"><div style="display:flex;justify-content:space-between"><b>${esc(x.p.name)}</b><b>${$2(x.price)}</b></div><span class="muted">${x.mi} mi · ${x.hrs < 1 ? Math.round(x.hrs * 60) + ' min' : x.hrs.toFixed(1) + ' h'} · ${times(k === 'county' ? 4 : 2).join(', ')}${c.late ? ' · often late' : ''}</span></div>`).join('') : '<p class="muted">No routes from here.</p>'}
        ${B.card(`<b>🧒 Traveling alone?</b><br><span class="muted">${esc(c.rule)}</span>`, 'border-color:#f2c14e55')}
        <p class="muted" style="font-size:11px">Online booking needs a card. ${k === 'county' ? 'Just get on the bus.' : 'Tickets can also be bought at the station.'}</p>`;
    } };
  });
  B.index(/bus|train|rail|coach|ticket|travel|get to|go to|cheapride|averline|transit|timetable|schedule/, 'cheapride.av', 'CheapRide · buses from $5', 'Cheap intercity buses. Driver discretion.');
  B.index(/bus|train|rail|coach|ticket|travel|averline|timetable/, 'averline.av', 'Averline Coaches · every major city', 'Comfort. Safety. ID checked.');
  B.index(/train|rail|station|timetable/, 'rail.av', 'Averland Regional Rail', 'Scenic routes. Conductors check.');
  B.index(/bus|local|county|transit/, 'county.av', 'County Transit · local buses', '$2 local routes, 6 AM – 9 PM.');

  /* ---------------- StayFinder (motel listings) ---------------- */
  const MOT = ['Starlite', 'Route 9', 'Budget Inn', 'Sleepwell', 'Pines', 'Travelers Rest', 'Blue Moon', 'Harbor View', 'Sunset', 'Western'];
  SH.motels = function (placeId) {
    const A = SH.Atlas, p = A ? A.data().places.find((x) => x.id === (placeId || (G().away || 'p0'))) : null; if (!p) return [];
    const r = B.rnd(B.seed() * 5 + p.id.length * 97 + p.pop), n = { city: 5, town: 3, small: 2, village: r() < 0.4 ? 1 : 0 }[p.tier], out = [];
    for (let i = 0; i < n; i++) {
      const tier = i === 0 && p.tier === 'city' ? 'pro' : r() < 0.4 ? 'sloppy' : r() < 0.6 ? 'loose' : 'pro';
      const base = { pro: 89, loose: 52, sloppy: 29 }[tier] + Math.round(r() * 15);
      out.push({ id: p.id + 'm' + i, place: p.id, n: (tier === 'pro' ? ['Hampton Suites', 'Averland Inn & Suites', 'Comfort Lodge'][i % 3] : MOT[Math.floor(r() * MOT.length)] + (tier === 'sloppy' ? ' Motel' : ' Motor Inn')), tier, night: base, week: Math.round(base * 5.2), month: Math.round(base * 17),
        stars: tier === 'pro' ? 4.2 : tier === 'loose' ? 3.1 : 2.2 + r() * 0.6, alley: tier === 'sloppy' && r() < 0.6,
        fake: tier !== 'pro' ? ['Clean and quiet!! Best stay ever!!!!', 'Very nice staff 10/10 would come again'][Math.floor(r() * 2)] : null,
        real: { pro: ['Front desk was super strict about ID, even for my teenage son.', 'Clean, boring, expensive. Exactly what you want.'], loose: ['Clerk didn\'t really care who was staying. Wifi password was on a sticky note.', 'Fine for a night. Thin walls.'], sloppy: ['Cash only, no questions, and I mean NO questions.', 'Found mold behind the bed. Room is basically a mattress, one outlet and a window.', 'Manager kicked out the room next to me at 2 AM, no refund. Pay by the night.'] }[tier] });
    }
    return out;
  };
  B.SITES['stayfinder.av'] = { n: 'StayFinder', icon: '🛏️', col: '#c23b6e', mb: 1.8, tile: true, order: 8, render() {
    const L = SH.motels(); const TN = { pro: 'Hotel', loose: 'Motel', sloppy: 'Budget motel' };
    return `<b>Stays in ${esc(B.place().name)}</b>${L.length ? L.map((m) => B.card(`<div style="display:flex;justify-content:space-between"><b>${esc(m.n)}</b><span>⭐ ${m.stars.toFixed(1)}</span></div><div class="muted" style="font-size:11px">${TN[m.tier]}${m.alley ? ' · back street off Main' : ''} · from ${$2(m.night)}/night · ${$2(m.week)}/week · ${$2(m.month)}/month</div>${m.fake ? `<div style="font-size:11.5px;margin-top:4px">★★★★★ "${esc(m.fake)}"</div>` : ''}${m.real.map((x) => `<div style="font-size:11.5px;margin-top:3px">★★ "${esc(x)}"</div>`).join('')}`)).join('') : '<p class="muted">No places to stay listed here. It\'s that kind of town.</p>'}<p class="muted" style="font-size:11px">Online booking requires a card and an adult 18+. Walk-in rates are negotiable at some places.</p>`;
  } };
  B.index(/motel|hotel|room|stay|sleep|bed|inn|night/, 'stayfinder.av', 'StayFinder · motels & hotels', 'Compare prices. Read the real reviews.');

  /* ---------------- GiveTogether ---------------- */
  B.SITES['givetogether.av'] = { n: 'GiveTogether', icon: '🤲', col: '#1f9d55', mb: 1, tile: true, order: 9, render() {
    const g = G(), mine = g.fund;
    const others = [['Help the Delgado food truck recover from the fire', 1840, 5000], ['Harbor House winter coat drive', 3120, 4000], ['Biscuit\'s surgery fund 🐶', 610, 2200], ['Lincoln MS robotics team to state', 900, 1500]];
    return `<b>GiveTogether</b><p class="muted" style="font-size:11.5px">Fundraisers from real people. (Mostly.)</p>${others.map(([t, a, goal]) => B.card(`<b>${esc(t)}</b><div style="height:5px;background:#0005;border-radius:3px;margin:5px 0"><i style="display:block;height:100%;width:${a / goal * 100}%;background:#1f9d55;border-radius:3px"></i></div><span class="muted" style="font-size:11px">${$2(a)} of ${$2(goal)}</span>`)).join('')}
      <div class="sech">START A FUNDRAISER</div>${mine ? B.card(`<b>${esc(mine.title)}</b><br>Raised: <b>${$2(mine.raised)}</b> · ${mine.flagged ? '<b style="color:#ff6b6b">Removed: under review</b>' : mine.withdrawn ? 'Closed' : 'Live'}${!mine.flagged && !mine.withdrawn && mine.raised >= 1 ? '<br>' + B.btn('SH.Browser.fundOut()', 'Withdraw to PocketPal') : ''}`) : `<div style="display:flex;gap:5px"><input id="fundT" placeholder="title (e.g. school trip fund)" style="flex:1;min-width:0"><button class="btn" onclick="SH.Browser.fundStart(document.querySelector('#fundT').value)">Start</button></div><p class="muted" style="font-size:11px">Organizers must be 18+ or have a parent co-sign. Payouts go to a linked account.</p>`}`;
  } };
  B.index(/fundrais|donat|charity|gofundme|givetogether|raise money/, 'givetogether.av', 'GiveTogether · fundraisers', 'Start one, or help someone.');
  B.fundStart = function (title) {
    title = (title || '').trim(); if (!title) return;
    const fake = !/real|actually|honest/i.test(title) && /cancer|army|veteran|charity|sick|hospital|surgery|orphan|disaster|fire/i.test(title);
    SH.UI.dialog({ title: '⚠️ This is risky', text: [fake ? 'Raising money for a cause you aren\'t actually raising money for is fraud. Sites flag it, people report it, and it gets traced to the account it pays into: your mom\'s.' : 'You have to fake a parent co-sign, and payouts go to PocketPal, which Mom can see.', 'Start it anyway?'], choices: [
      { t: 'Never mind', cls: 'safe', fn: () => {} },
      { t: 'Start it', cls: 'danger', fn: () => { G().fund = { title, raised: 0, fake, t: G().t, flagged: false }; SH.Phone.render(); } }] });
  };
  B.fundOut = function () { const f = G().fund; if (!f || f.flagged || !SH.Bank) return; SH.Bank.deposit(f.raised, 'GiveTogether payout'); SH.UI.toast(`${$2(f.raised)} to PocketPal. ${SH.Bank.state().linked ? 'Mom will see this.' : ''}`); f.withdrawn = true; f.raised = 0; if (G().phase === 'run') { G().revealed = G().away ? null : G().loc; } SH.Phone.render(); };
  const bAdv = SH.advance;
  SH.advance = function () { const r = bAdv.apply(this, arguments); const f = G() && G().fund; if (f && !f.flagged && !f.withdrawn && SH.hour() % 3 === 0 && f.lastH !== SH.G.t / 180 | 0) { f.lastH = SH.G.t / 180 | 0; if (Math.random() < 0.35) f.raised += [5, 10, 10, 20, 25][Math.floor(Math.random() * 5)]; if (f.fake && f.raised > 20 && Math.random() < 0.2) { f.flagged = true; G().heat = Math.min(100, (G().heat || 0) + 25); SH.Phone.notify && SH.Phone.notify('browser', 'GiveTogether', 'Your fundraiser was removed after reports. Funds are frozen pending review.'); SH.Phone.push('mom', 'mom', 'Why did I just get an email from a fundraising site asking me to verify a campaign in your name??'); } } return r; };
})(window.SH);
