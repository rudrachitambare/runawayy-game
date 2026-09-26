/* SMALL HOURS — AverRides part 2: My trips (tickets with code, boarding spot, "be there by", Board / Cancel / directions),
   the departures board for where you are, the company list, and a Book button on every company site's departures. */
(function (SH) {
  const B = SH.Browser, R = SH.Routes, T = SH.Tickets, Rd = SH.Rides; if (!B || !R || !T || !Rd) return;
  const esc = B.esc, fmt = R.fmt, G = () => SH.G, NP = (id) => R.net().P[id];
  const ST = { pro: ['✅ Professional', '#6fdc8c'], unprof: ['🤷 Unprofessional', '#f2c14e'], sketchy: ['🫣 Sketchy (but safe)', '#ff9f6b'] };
  const LBL = { booked: ['Booked', '#6fdc8c'], used: ['Used', '#8a93a6'], missed: ['Missed', '#ff6b6b'], cancelled: ['Cancelled', '#8a93a6'] };
  function tickets() {
    const L = T.all(); L.forEach(T.state);
    const live = L.filter((t) => t.st === 'booked'), old = L.filter((t) => t.st !== 'booked').slice(0, 6);
    const card = (t) => {
      const soon = t.st === 'booked' && t.dep - G().t <= 60, here = t.st === 'booked' && T.here(t);
      const lb = soon ? ['Boarding soon', '#f2c14e'] : LBL[t.st];
      return `<div class="wtk" style="${t.st !== 'booked' ? 'opacity:.6' : ''}"><div style="display:flex;justify-content:space-between;align-items:center"><span class="code">${t.code}</span>${B.pill(lb[0], lb[1])}</div>
        <div style="font-size:15px;font-weight:800;margin:4px 0 2px">${esc(t.fromN)} → ${esc(t.toN)}</div>
        <div style="font-size:12px">${Rd.day(t.dep)} · <b>${fmt(t.dep)}</b> → ${fmt(t.arr)} · ${t.n} passenger${t.n > 1 ? 's' : ''}</div>
        <div class="muted" style="font-size:11px;margin:3px 0">${t.ops.map(esc).join(' → ')}</div>
        ${t.st === 'booked' ? `<div style="font-size:12px;margin:6px 0;padding:6px 8px;background:#0005;border-radius:8px">📍 <b>Board at:</b> ${esc(t.pts[0])}<br>⏰ Be there by <b>${fmt(t.dep - 10)}</b> · leaves ${T.left(t.dep)}${t.pts.length > 1 ? '<br>🔁 Change: ' + t.pts.slice(1).map(esc).join(' · ') : ''}</div>
        <div style="font-size:11.5px">${t.pay === 'card' ? `✅ Paid $${t.cost} with PocketPal` : `💵 Pay <b>$${t.cost}</b> cash when you board (you have $${Math.floor(G().money)})`}${t.lied ? ' · <span style="color:#f2c14e">booked as 15+</span>' : ''}</div>
        <div style="display:flex;gap:6px;margin-top:8px">${here ? `<button class="wbtn ok" onclick="SH.Tickets.board('${t.code}')">🎫 Board</button>` : `<button class="wbtn alt" onclick="SH.Browser.go('avermaps.av/p/${t.from}')">${SH.Atlas.here().id === t.from ? `🗺️ Go to ${t.loc === 'station' ? 'the station' : t.loc === 'bus' ? 'the bus depot' : t.loc === 'pickup' ? 'the Route 9 pickup' : 'the stop'}` : `🗺️ Get to ${esc(t.fromN)}`}</button>`}<button class="wbtn bad" style="width:auto;padding:9px 12px" onclick="SH.Tickets.cancel('${t.code}')">Cancel</button></div>
        ${!here ? `<div class="muted" style="font-size:10.5px;margin-top:5px">${SH.Atlas.here().id !== t.from ? `You're in ${esc(SH.Atlas.here().name)}. This leaves from ${esc(t.fromN)}.` : G().away ? '' : `Walk to the ${SH.Tickets.locName ? SH.Tickets.locName(t.loc) : 'bus depot'} on the map, then tap 🎫 Board there.`}</div>` : ''}` :
        t.st === 'missed' ? `<button class="wbtn alt" style="margin-top:6px" onclick="SH.Browser.go('rides.av/find?f=${t.from}&t=${t.to}&w=now')">Find the next one</button>` : ''}</div>`;
    };
    return Rd.top('tix', 'Your tickets') + (live.length ? live.map(card).join('') : B.note('No upcoming trips. Book one from the 🔎 Plan tab.', 'info')) + (old.length ? '<div class="wsec">Past</div>' + old.map(card).join('') : '') +
      B.note('<b>Boarding:</b> be at the spot on your ticket before it leaves. Away from home, the <b>🎫 Board</b> button is in the town menu. In Harlow: official buses leave from the Greyline depot, cheap buses, tempos, vans and car pools from the Route 9 pickup (Gas-N-Go lot), trains from the station. Miss it and the ticket is gone (card tickets can be cancelled before for a partial refund).', 'info');
  }
  function deps() {
    const here = SH.Atlas.here(), L = R.board(here, G().t, 360);
    return Rd.top('deps', `Departures · ${esc(here.name)} · ${fmt(G().t)}`) + (L.length ? L.map((b) => { const end = b.rt.stops.length - 1, o = b.rt.op; return B.row({ icon: o.icon, go: `rides.av/trip/${encodeURIComponent('rt:' + b.rt.id + '/' + b.i + '/' + end + '/' + b.dep)}?to=${b.rt.stops[end]}`, t: `${fmt(b.dep)}${Rd.day(b.dep) !== 'Today' ? ' ' + Rd.day(b.dep) : ''} · ${esc(o.n)} → ${esc(NP(b.rt.stops[end]).name)}`, sub: `${esc(T.ptxt(T.point(here.id, b.rt)))}<br>${b.rt.stops.slice(b.i + 1, -1).slice(0, 5).map((id) => esc(NP(id).name)).join(' · ') || 'direct'}`, right: `$${R.price(b.rt, b.i, end)}+` }); }).join('') : B.note(`Nothing leaves ${esc(here.name)}. No stop, no station.`, 'warn'));
  }
  function ops() {
    const N = R.net(), here = SH.Atlas.here(), at = N.at[here.id] || [];
    return Rd.top('ops', `${N.ops.length} companies this story`) + N.ops.map((o) => { const n = at.filter(([r]) => r.op === o).length; return B.row({ icon: o.icon, go: o.id + '.av', t: esc(o.n), sub: `${esc(o.T.v)} · ${N.routes.filter((r) => r.op === o).length / 2} lines · ${n ? 'stops in ' + esc(here.name) : 'not in ' + esc(here.name)}<br>${B.pill(ST[o.style][0], ST[o.style][1])}${o.S.cash ? B.pill('💵 cash only') : B.pill('💳 PocketPal ok')}` }); }).join('');
  }
  Rd.extra = (p) => (/^tickets/.test(p) ? tickets() : /^deps/.test(p) ? deps() : /^ops/.test(p) ? ops() : null);

  // company sites: every departure gets a Book button, plus a quick search box
  function page(o) {
    const N = R.net(), here = SH.Atlas.here(), t = G().t, mine = N.routes.filter((r) => r.op === o), lines = mine.filter((r) => r.id.endsWith(':0'));
    const deps = []; (N.at[here.id] || []).filter(([r, i]) => r.op === o && i < r.stops.length - 1).forEach(([r, i]) => { let d = R.next(r, i, t); for (let n = 0; n < 3 && d != null; n++) { deps.push([r, i, d]); d = R.next(r, i, d + 1); } });
    deps.sort((a, b) => a[2] - b[2]);
    return `<div class="wsh" style="background:${o.col}"><span class="wsi">${o.icon}</span><div><b>${esc(o.n)}</b><small>${esc(o.tag)} · ${B.pill(ST[o.style][0])}</small></div></div><!--flash-->
      ${B.note(`<b>🧒 Traveling alone?</b> ${esc(o.rule || '')}`, o.style === 'pro' ? 'warn' : 'info')}
      <div class="wsec">Book from ${esc(here.name)}</div>${deps.length ? deps.slice(0, 8).map(([r, i, d]) => { const end = r.stops.length - 1; return B.row({ go: `rides.av/trip/${encodeURIComponent('rt:' + r.id + '/' + i + '/' + end + '/' + d)}?to=${r.stops[end]}`, t: `${fmt(d)}${Rd.day(d) !== 'Today' ? ' ' + Rd.day(d) : ''} → ${esc(NP(r.stops[end]).name)}`, sub: `${esc(T.ptxt(T.point(here.id, r)))}<br>${r.stops.slice(i + 1).slice(0, 6).map((id) => esc(NP(id).name)).join(' · ')}`, right: `<span class="wpill" style="background:#1f9d55;color:#fff;border-color:#1f9d55">Book</span>` }); }).join('') : B.note(`We don't stop in ${esc(here.name)}. ${B.lnk('rides.av', 'Plan a trip with a change →')}`, 'warn')}
      <div class="wsec">Our lines (${lines.length})</div>${lines.map((r) => `<div style="font-size:11.5px;margin:4px 0">${r.stops.map((id) => esc(NP(id).name)).join(' – ')} <span class="muted">· ${r.deps.length}×/day · ${Math.floor(r.off[r.off.length - 1] / 60)}h${String(r.off[r.off.length - 1] % 60).padStart(2, '0')}</span></div>`).join('')}
      <p class="muted" style="font-size:11px">${o.S.cash ? 'Cash only. Reserve here, pay the driver.' : 'Pay by PocketPal, or reserve and pay cash when you board.'} ${o.S.delay > 30 ? 'Times are approximate.' : ''} ${B.lnk('rides.av/tickets', 'My trips →')}</p>`;
  }
  const install = () => { const N = R.net(); if (!N) return; N.ops.forEach((o) => { const s = B.SITES[o.id + '.av']; if (s && !s._book) { s._book = true; s.own = true; s.render = () => page(o); s._wrapped = false; } }); B.wrapAll && B.wrapAll(); };
  const bGo = B.go; B.go = function () { try { install(); } catch (e) {} return bGo.apply(this, arguments); };
})(window.SH);
