/* SMALL HOURS — E2d: every operator gets a web page (timetable from where you are, the lines it runs, its rules),
   plus AverRides, a little hub that lists every company running in Averland this story. Replaces the old
   "teleport anywhere" timetables of the four famous companies with their real routes. */
(function (SH) {
  const B = SH.Browser, R = SH.Routes; if (!B || !R) return;
  const esc = B.esc, fmt = R.fmt;
  const P = (id) => R.net().P[id];
  const pl = (v) => (/s$|ch$/.test(v) ? v + 'es' : v + 's');
  const ST = { pro: '✅ Professional', unprof: '🤷 Unprofessional', sketchy: '🫣 Sketchy (but safe)' };
  function page(o) {
    const N = R.net(), here = B.place(), t = SH.G.t;
    const mine = N.routes.filter((r) => r.op === o);
    const lines = mine.filter((r) => r.id.endsWith(':0'));
    const from = (N.at[here.id] || []).filter(([r, i]) => r.op === o && i < r.stops.length - 1);
    const deps = [];
    from.forEach(([r, i]) => { let d = R.next(r, i, t); for (let n = 0; n < 3 && d != null; n++) { deps.push([r, i, d]); d = R.next(r, i, d + 1); } });
    deps.sort((a, b) => a[2] - b[2]);
    const day = (d) => (Math.floor(d / 1440) > Math.floor(t / 1440) ? ' <small class="muted">tomorrow</small>' : '');
    return `<div style="background:${o.col};margin:-8px -10px 8px;padding:12px 10px"><div style="font-size:17px;font-weight:700">${o.icon} ${esc(o.n)}</div><div style="font-size:11.5px;opacity:.85">${esc(o.tag)} · ${esc(pl(o.T.v))} · ${ST[o.style]}</div></div>
      <b>Departures from ${esc(here.name)}</b>${deps.length ? deps.slice(0, 8).map(([r, i, d]) => `<div class="setrow" style="font-size:12px"><div style="display:flex;justify-content:space-between"><b>${fmt(d)}${day(d)} → ${esc(P(r.stops[r.stops.length - 1]).name)}</b><span>from $${R.price(r, i, i + 1)}</span></div><span class="muted">${r.stops.slice(i + 1).map((id) => esc(P(id).name)).join(' · ')}</span></div>`).join('') : `<p class="muted">We don't stop in ${esc(here.name)}.</p>`}
      <div class="sech" style="margin-top:8px">OUR LINES (${lines.length})</div>${lines.map((r) => `<div style="font-size:11.5px;margin:3px 0">${r.stops.map((id) => esc(P(id).name)).join(' – ')} <span class="muted">· ${r.deps.length}×/day · ${Math.floor(r.off[r.off.length - 1] / 60)}h${String(r.off[r.off.length - 1] % 60).padStart(2, '0')}</span></div>`).join('')}
      ${B.card(`<b>🧒 Traveling alone?</b><br><span class="muted">${esc(o.rule || '')}</span>`, 'border-color:#f2c14e55')}
      <p class="muted" style="font-size:11px">${o.S.cash ? 'Cash only. Pay the driver.' : o.style === 'pro' ? 'Online booking needs a card and an adult 18+. Tickets also sold at the counter.' : 'Pay on board or at the stop. Card machine "usually" works.'} ${o.S.delay > 30 ? 'Times are approximate.' : ''}</p>`;
  }
  const install = () => {
    const N = R.net(); if (!N) return false;
    N.ops.forEach((o, i) => {
      const key = o.id + '.av';
      B.SITES[key] = Object.assign(B.SITES[key] || {}, { n: o.n.split(' ')[0], icon: o.icon, col: o.col, mb: 1, tile: !!o.famous, order: 10 + i, render: () => page(o) });
    });
    return true;
  };
  B.SITES['rides.av'] = { n: 'AverRides', icon: '🧭', col: '#2c3e50', mb: 0.8, tile: true, order: 9, render() {
    install(); const N = R.net(), here = B.place();
    const at = N.at[here.id] || [];
    return `<div style="font-size:16px;font-weight:700">🧭 AverRides</div><div class="muted" style="font-size:11.5px;margin-bottom:6px">Every bus, tempo, shuttle, car pool and train in Averland.</div>
      ${N.ops.map((o) => { const n = at.filter(([r]) => r.op === o).length; return `<div class="setrow" style="font-size:12px"><div style="display:flex;justify-content:space-between"><b>${B.lnk(o.id + '.av', o.icon + ' ' + esc(o.n))}</b><span>${ST[o.style]}</span></div><span class="muted">${esc(pl(o.T.v))} · ${N.routes.filter((r) => r.op === o).length / 2} lines · ${n ? `stops in ${esc(here.name)}` : `not in ${esc(here.name)}`}</span></div>`; }).join('')}`;
  } };
  B.index(/bus|train|rail|coach|ticket|travel|get to|go to|timetable|schedule|tempo|shuttle|van|car ?pool|ride|taxi|transit/, 'rides.av', 'AverRides · every way to get around', 'Buses, tempos, shuttles, car pools and trains.');
  // the site list is built from the seed, so install once a game is running
  const bGo = B.go; B.go = function () { install(); return bGo.apply(this, arguments); };
  document.addEventListener('DOMContentLoaded', () => setTimeout(() => { try { SH.G && install(); } catch (e) {} }, 100));
})(window.SH);
