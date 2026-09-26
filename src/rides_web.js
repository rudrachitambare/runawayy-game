/* SMALL HOURS — AverRides (rides.av): the booking site. Plan → results → trip details → book → My trips.
   rides.av                         plan a trip (from/to with autocomplete, when) + your next ticket + what's leaving
   rides.av/find?f=ID&t=ID&w=now    journeys (direct, one or two changes): times, price for your group, seats,
                                    how strict each company is, where you board, night warnings
   rides.av/trip/KEY?to=ID          the timeline (board here → change there → arrive), "get off at" picker, booking form
   Tabs for My trips / Departures / Companies live in rides_web2.js. Tickets themselves: tickets.js. */
(function (SH) {
  const B = SH.Browser, R = SH.Routes, T = SH.Tickets; if (!B || !R || !T || !B.row) return;
  const esc = B.esc, fmt = R.fmt, G = () => SH.G, NP = (id) => R.net().P[id];
  const grp = () => 1 + ((G().party || []).length);
  const ST = { pro: ['✅ checks IDs', '#6fdc8c'], unprof: ["🤷 driver's call", '#f2c14e'], sketchy: ['🫣 no questions', '#ff9f6b'] };
  const Rd = SH.Rides = {};
  const dur = (m) => (m >= 60 ? Math.floor(m / 60) + 'h ' : '') + (m % 60) + 'm';
  Rd.day = (t) => { const d = Math.floor(t / 1440) - Math.floor(G().t / 1440); return d === 0 ? 'Today' : d === 1 ? 'Tomorrow' : SH.dateStr ? SH.dateStr(t).split(',')[0] : 'Later'; };
  const night = (t) => { const h = Math.floor((t % 1440) / 60); return h >= 21 || h < 5; };
  const when = (w) => { const t = G().t, d0 = Math.floor(t / 1440) * 1440; if (w === 'eve') return t < d0 + 1080 ? d0 + 1080 : d0 + 1440 + 1080; if (w === 'tmr') return d0 + 1440 + 420; if (w === 'tmra') return d0 + 1440 + 780; return t; };
  const q = (path, k) => decodeURIComponent((path.match(new RegExp('[?&]' + k + '=([^&]*)')) || [])[1] || '');
  Rd.styleOf = (jr) => (jr.legs.some((l) => l.rt.op.style === 'pro' && T.checks(l.rt.op)) ? 'pro' : jr.legs.some((l) => l.rt.op.style === 'unprof') ? 'unprof' : jr.legs.every((l) => l.rt.op.style === 'sketchy') ? 'sketchy' : 'unprof');
  Rd.top = (act, sub) => B.head(B.SITES['rides.av'], sub || 'Every bus, tempo, shuttle, car pool and train in Averland') + B.tabs([['rides.av', '🔎 Plan', 'plan'], ['rides.av/tickets', '🎫 My trips' + (T.all().filter((t) => T.state(t) === 'booked').length ? ' •' : ''), 'tix'], ['rides.av/deps', '🚏 Departures', 'deps'], ['rides.av/ops', '🏢 Companies', 'ops']], act) + '<!--flash-->';
  Rd.find = function () {
    const f = B.findPlace(B.val('rf')) || SH.Atlas.here(), t = B.findPlace(B.val('rt')), w = B.val('rw') || 'now';
    if (!B.val('rt')) { B.flash('Where to? Type a town in the "To" box.', 'warn'); return SH.Phone.render(); }
    if (!t) { B.flash(`Couldn't find "${esc(B.val('rt'))}". Start typing and pick from the list.`, 'bad'); return SH.Phone.render(); }
    if (t.id === f.id) { B.flash(`You're already going from ${esc(f.name)}. Pick somewhere else.`, 'warn'); return SH.Phone.render(); }
    B.go(`rides.av/find?f=${f.id}&t=${t.id}&w=${w}`);
  };
  Rd.form = (f, t, w) => `<div class="wform"><label>From</label>${B.inp('rf', 'From', f ? f.name : SH.Atlas.here().name, 'SH.Rides.find()', 'avpl')}<label>To</label>${B.inp('rt', 'Where to? (town, village, city)', t ? t.name : '', 'SH.Rides.find()', 'avpl')}
    <label>When</label>${B.sel('rw', [['now', 'Leaving now'], ['eve', 'This evening (6 PM)'], ['tmr', 'Tomorrow morning (7 AM)'], ['tmra', 'Tomorrow afternoon (1 PM)']], w || 'now')}<button class="wbtn" onclick="SH.Rides.find()">Search rides</button></div>${B.places()}`;
  Rd.jrow = (jr, to) => {
    const L = jr.legs, st = ST[Rd.styleOf(jr)], seats = R.seats(L[0].rt, L[0].dep), n = grp();
    const via = L.length > 1 ? ' → change at ' + L.slice(1).map((l, k) => esc(NP(L[k].rt.stops[L[k].j]).name) + ' → ' + l.rt.op.icon + ' ' + esc(l.rt.op.n)).join(' → ') : ' · direct';
    return B.row({ go: `rides.av/trip/${encodeURIComponent(jr.key)}?to=${to.id}`, t: `${fmt(jr.dep)} → ${fmt(jr.arr)} <span style="font-weight:400;color:#9aa4b8">· ${dur(jr.arr - jr.dep)}${Rd.day(jr.dep) !== 'Today' ? ' · ' + Rd.day(jr.dep) : ''}</span>`,
      sub: `${L[0].rt.op.icon} ${esc(L[0].rt.op.n)}${via}<br>Board at ${esc(T.ptxt(T.point(L[0].rt.stops[L[0].i], L[0].rt)))}<br>${B.pill(st[0], st[1])}${L[0].rt.op.style !== 'sketchy' ? B.pill(seats < n ? 'full' : seats <= 3 ? seats + ' seats left' : seats + ' seats', seats < n ? '#ff6b6b' : '') : B.pill('squeeze in')}${night(jr.dep) ? B.pill('⚠️ night', '#ff9f6b') : ''}${L.some((l) => l.rt.op.S.cash) ? B.pill('💵 cash only') : ''}`,
      right: `$${jr.cost * n}${n > 1 ? `<br><small style="font-weight:400;color:#9aa4b8">for ${n}</small>` : ''}` });
  };
  function plan() {
    const here = SH.Atlas.here(), next = T.all().find((t) => T.state(t) === 'booked'), B0 = R.board(here, G().t, 240).slice(0, 4);
    return Rd.top('plan') + Rd.form(null, null, 'now') + (next ? `<div class="wsec">Your next trip</div>` + B.row({ go: 'rides.av/tickets', icon: '🎫', t: `${fmt(next.dep)} ${Rd.day(next.dep)} → ${esc(next.toN)}`, sub: `Board at ${esc(next.pts[0])} · leaves ${T.left(next.dep)}` }) : '') +
      `<div class="wsec">Leaving ${esc(here.name)} soon</div>` + (B0.length ? B0.map((b) => { const end = b.rt.stops.length - 1; return B.row({ icon: b.rt.op.icon, go: `rides.av/trip/${encodeURIComponent('rt:' + b.rt.id + '/' + b.i + '/' + end + '/' + b.dep)}?to=${b.rt.stops[end]}`, t: `${fmt(b.dep)} ${esc(b.rt.op.n)} → ${esc(NP(b.rt.stops[end]).name)}`, sub: esc(T.ptxt(T.point(here.id, b.rt))) }); }).join('') : B.note(`Nothing leaves ${esc(here.name)}. You'll have to walk or bike to a bigger place first.`, 'warn')) +
      B.note('<b>How it works:</b> search, pick a ride, book it. Pay with PocketPal now, or reserve and pay cash when you board. Then go to the boarding spot on your ticket before it leaves and tap <b>🎫 Board</b> there (it shows in the town menu, or, in Harlow, at the spot on your ticket: the Greyline depot, the Route 9 pickup or the station).', 'info');
  }
  function find(path) {
    const f = NP(q(path, 'f')) || SH.Atlas.here(), t = NP(q(path, 't')), w = q(path, 'w') || 'now'; if (!t) return plan();
    const L = R.journeys(f, t, when(w), 7);
    let h = Rd.top('plan', `${esc(f.name)} → ${esc(t.name)}`) + Rd.form(f, t, w) + `<div class="wsec">${L.length} ride${L.length === 1 ? '' : 's'} · ${esc(f.name)} → ${esc(t.name)} · ${SH.Atlas.miles(f, t)} mi</div>`;
    if (L.length) return h + L.map((jr) => Rd.jrow(jr, t)).join('') + `<p class="muted" style="font-size:10.5px">Prices are for your whole group (${grp()}). Tap a ride for stops, rules and booking.</p>`;
    const near = SH.Atlas.data().places.filter((p) => p.id !== t.id && (R.net().at[p.id] || []).length).map((p) => [p, SH.Atlas.miles(p, t)]).sort((a, b) => a[1] - b[1]).slice(0, 3);
    return h + B.note(`No bus, train or van reaches ${esc(t.name)}${w === 'now' ? ' today' : ''}. The closest places that have rides:`, 'warn') + near.map(([p, mi]) => B.row({ go: `rides.av/find?f=${f.id}&t=${p.id}&w=${w}`, t: esc(p.name), sub: `${mi} mi from ${esc(t.name)} · walk or bike the rest`, right: '🔎' })).join('');
  }
  function trip(path) {
    const key = decodeURIComponent((path.match(/^trip\/([^?]*)/) || [])[1] || ''), jr = R.byKey(key), to = NP(q(path, 'to'));
    if (!jr || !to) return Rd.top('plan') + B.note('That trip isn\'t available anymore.', 'bad');
    const L = jr.legs, n = grp(), g = G(), strict = L.map((l) => l.rt.op).find(T.checks), cashOnly = L.some((l) => l.rt.op.S.cash), bk = SH.Bank && SH.Bank.state();
    const tl = L.map((l, k) => { const o = l.rt.op, a = NP(l.rt.stops[l.i]), b = NP(l.rt.stops[l.j]); return `<div style="--c:${o.col}"><b>${fmt(l.dep)}</b> board at ${esc(T.ptxt(T.point(a.id, l.rt)))}<br><span class="muted">${o.icon} ${esc(o.n)} ${esc(o.T.v)} · ${l.j - l.i} stop${l.j - l.i > 1 ? 's' : ''}${l.j - l.i > 1 ? ' via ' + l.rt.stops.slice(l.i + 1, l.j).slice(0, 4).map((id) => esc(NP(id).name)).join(', ') : ''} · $${R.price(l.rt, l.i, l.j)} each</span><br><i class="muted" style="font-size:10.5px">${esc(o.rule || '')}</i></div>${k < L.length - 1 ? `<div style="--c:#f2c14e"><b>${fmt(l.arr)}</b> get off at ${esc(b.name)}: change (${dur(L[k + 1].dep - l.arr)} to make it)</div>` : ''}`; }).join('') + `<div style="--c:#6fdc8c"><b>${fmt(jr.arr)}</b> arrive in ${esc(to.name)}</div>`;
    const one = L.length === 1 ? `<label>Get off at</label><select class="winp" onchange="SH.Browser.go(this.value)">${L[0].rt.stops.slice(L[0].i + 1).map((id, k) => { const j = L[0].i + 1 + k; return `<option value="rides.av/trip/${encodeURIComponent('rt:' + L[0].rt.id + '/' + L[0].i + '/' + j + '/' + L[0].dep)}?to=${id}"${id === to.id ? ' selected' : ''}>${esc(NP(id).name)} · ${fmt(L[0].dep + L[0].rt.off[j] - L[0].rt.off[L[0].i])} · $${R.price(L[0].rt, L[0].i, j) * n}</option>`; }).join('')}</select>` : '';
    const who = ['You'].concat((g.party || []).map((id) => (SH.NPCS_META[id] || {}).n || id)).join(', ');
    return Rd.top('plan', `${Rd.day(jr.dep)} · ${fmt(jr.dep)} → ${fmt(jr.arr)} · ${dur(jr.arr - jr.dep)}`) + `<div class="wtl">${tl}</div>` + `<div class="wsec">Book</div><div class="wform">${one}
      <div class="two"><div><label>Passengers</label><div style="font-size:12px;padding:4px 0">${esc(who)}</div></div><div><label>Total</label><div style="font-size:18px;font-weight:800">$${jr.cost * n}</div></div></div>
      ${strict ? `<label>Youngest passenger's age</label>${B.sel('ra', [['', 'Choose…'], ['12', '12 (the truth)'], ['15', '15'], ['16', '16'], ['18', '18+']], '')}<div class="muted" style="font-size:10.5px">${esc(strict.n)} checks. Say 12 and it won't book. Lie and staff may still check at the door.</div>` : ''}
      <label>Payment</label>${B.sel('rp', (cashOnly ? [] : [['card', `💳 PocketPal now ($${bk ? bk.bal.toFixed(2) : '0'} on card)`]]).concat([['cash', `💵 Reserve, pay $${jr.cost * n} cash when you board (you have $${Math.floor(g.money)})`]]), cashOnly ? 'cash' : 'card')}
      ${bk && bk.linked && !cashOnly ? B.note(`PocketPal is linked to Mom. She sees card charges${g.phase === 'run' ? ', and a charge shows roughly where you are' : ''}. Cash doesn't show up anywhere.`, 'warn') : ''}
      <button class="wbtn ok" onclick="SH.Rides.book('${encodeURIComponent(key)}','${to.id}')">Book ${n > 1 ? n + ' seats' : 'seat'}</button></div>`;
  }
  Rd.book = function (k, to) {
    const key = decodeURIComponent(k), age = B.val('ra'), pay = B.val('rp') || 'cash';
    if (document.getElementById('ra') && !age) { B.flash('Pick the youngest passenger\'s age first.', 'warn'); return SH.Phone.render(); }
    const r = T.book(key, to, { pay, age }); SH.Audio && SH.Audio.click && SH.Audio.click();
    if (!r.ok) { B.flash(esc(r.msg), 'bad'); return SH.Phone.render(); }
    B.flash(`<b>Booked! Ticket ${r.tk.code}.</b> ${fmt(r.tk.dep)} ${Rd.day(r.tk.dep)} from ${esc(r.tk.pts[0])}. Be there 10 minutes early and tap 🎫 Board.`, 'good'); B.go('rides.av/tickets');
  };
  Rd.pages = { plan, find, trip };
  B.SITES['rides.av'] = { n: 'AverRides', icon: '🧭', col: '#2c3e50', mb: 0.8, tile: true, order: 1, own: true, sub: 'Book buses, trains, vans', render(path) {
    const p = path || ''; if (/^find/.test(p)) return find(p); if (/^trip\//.test(p)) return trip(p);
    const x = Rd.extra && Rd.extra(p); return x != null ? x : plan();
  } };
})(window.SH);
