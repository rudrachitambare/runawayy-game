/* SMALL HOURS — the rest of the web, made usable.
   Browser home: big search, your next ticket, sites grouped (Getting around / Money & a bed / News & help), recent pages.
   Seekr instant answers: "bus to cedar falls", "harlow to ironton", "how do i get to X" → real rides with Book;
     a place name → its AverMaps card; weather words → today's forecast.
   TubeYou (tubeyou.av): was a dead link. Now short how-to videos with the useful bit written out.
   StayFinder: how booking works (walk in; online needs a card and an adult), map links.
   PIP: "my ticket / where do I board / how do I book" answered from your real tickets. */
(function (SH) {
  const B = SH.Browser, P = SH.Phone; if (!B || !B.row) return;
  const esc = B.esc, G = () => SH.G, R = SH.Routes, T = SH.Tickets;
  const SUB = { 'seekr.av': "the search engine that doesn't judge", 'skycast.av': '7-day forecast', 'stayfinder.av': 'Motels & hotels, real reviews', 'givetogether.av': 'Fundraisers', 'everything.av': 'Anything. Next-day pickup.', 'swapspot.av': 'Used stuff near you', 'threadly.av': 'Ask anything', 'worknow.av': 'Jobs near you', 'safeline.av': 'Talk to someone, 24/7', 'history.av': 'Pages you visited', 'tubeyou.av': 'How-to videos' };
  const fix = () => { Object.entries(SUB).forEach(([d, s]) => { if (B.SITES[d]) B.SITES[d].sub = s; }); if (B.SITES['ledger.av']) B.SITES['ledger.av'].own = true; };
  const tile = (d) => { const s = B.SITES[d]; if (!s) return ''; return `<a href="#" onclick="SH.Browser.go('${d}');return false" class="wtile"><span style="background:${s.col || '#333'}">${s.icon}</span>${esc(s.n)}</a>`; };
  const GROUPS = [['Getting around', ['rides.av', 'avermaps.av', 'skycast.av', 'averline.av', 'cheapride.av', 'rail.av', 'county.av']], ['Money & a bed', ['stayfinder.av', 'worknow.av', 'everything.av', 'swapspot.av', 'givetogether.av']], ['News & help', ['safeline.av', 'ledger.av', 'threadly.av', 'tubeyou.av', 'history.av']]];
  function home() {
    fix(); const next = T && T.all().find((t) => T.state(t) === 'booked'), h = B.hist().slice(0, 3);
    return `<div style="text-align:center;margin:8px 0 8px"><div style="font-size:26px;font-weight:800;letter-spacing:-1px">Seekr</div><div class="muted" style="font-size:11px">search places, rides, jobs, stuff, help</div></div>
      <div style="display:flex;gap:6px;margin-bottom:6px">${B.inp('bq2', 'Try "bus to Cedar Falls" or "motel"', '', "SH.Browser.search(SH.Browser.val('bq2'))", 'avpl')}<button class="btn primary" onclick="SH.Browser.search(SH.Browser.val('bq2'))">Go</button></div>${B.places()}
      ${next ? B.row({ icon: '🎫', go: 'rides.av/tickets', t: `${R.fmt(next.dep)} → ${esc(next.toN)} · ${next.code}`, sub: `Board at ${esc(next.pts[0])} · ${T.left(next.dep)}` }) : ''}
      ${GROUPS.map(([n, L]) => `<div class="wsec">${n}</div><div class="wtiles">${L.map(tile).join('')}</div>`).join('')}
      ${h.length ? `<div class="wsec">Recent</div>` + h.map((x) => B.row({ go: x.url, t: esc(x.url), sub: SH.fmt12 ? SH.fmt12(x.t) : '' })).join('') : ''}
      <div class="muted" style="font-size:10.5px;margin-top:10px;text-align:center">Every page uses a little data. History can be seen by anyone who picks up your phone.</div>`;
  }
  const bV = P.V.browser;
  P.V.browser = function (body) { const r = bV.apply(this, arguments); if (B.url === 'home') { const ab = body.querySelector('.appbody'); if (ab) ab.innerHTML = home(); } return r; };

  // Seekr instant answers
  const inst = (q) => {
    if (!SH.Atlas || !R) return ''; const t = q.toLowerCase().trim(); let m, f = null, to = null;
    if ((m = t.match(/^(?:bus|train|ride|tickets?|coach|van|how (?:do i|to|can i) get|get|go|travel|directions?)(?: from ([a-z .']+?))? to ([a-z .']+)$/)) || (m = t.match(/^([a-z .']+?) to ([a-z .']+)$/))) { f = m[1] ? B.findPlace(m[1]) : SH.Atlas.here(); to = B.findPlace(m[2]); }
    if (to && f && to.id !== f.id) { const J = R.journeys(f, to, G().t, 3); return `<div class="wsec">Rides · ${esc(f.name)} → ${esc(to.name)}</div>` + (J.length && SH.Rides ? J.map((jr) => SH.Rides.jrow(jr, to)).join('') : B.note('No bus or train connects these today.', 'warn')) + B.row({ go: `rides.av/find?f=${f.id}&t=${to.id}&w=now`, icon: '🧭', t: 'More times on AverRides', sub: 'tomorrow, evenings, other companies' }); }
    const p = SH.Atlas.data().places.find((x) => x.name.toLowerCase() === t); if (p) { const here = SH.Atlas.here(); return B.row({ go: 'avermaps.av/p/' + p.id, icon: '🗺️', t: `${esc(p.name)} · ${SH.Atlas.TIERS[p.tier].n}`, sub: `${p.id === here.id ? 'You are here' : SH.Atlas.miles(here, p) + ' mi away'} · pop. ${p.pop.toLocaleString()} · motels, rides, police, wifi on AverMaps` }) + (p.id !== here.id ? B.row({ go: `rides.av/find?f=${here.id}&t=${p.id}&w=now`, icon: '🎫', t: `Rides to ${esc(p.name)}`, sub: 'Book on AverRides' }) : ''); }
    if (/weather|rain|cold|forecast|snow/.test(t) && SH.weatherDay) { const w = SH.weatherDay(SH.day()) || {}; return B.row({ go: 'skycast.av', icon: '🌦️', t: `Today: ${esc(w.c || '')} · ${w.hi}° / ${w.lo}°`, sub: w.lo < 38 ? 'Cold night. Don\'t sleep outside without a sleeping bag.' : 'Full forecast on SkyCast' }); }
    return '';
  };
  const hook = () => { const s = B.SITES['seekr.av']; if (!s || s._inst) return; s._inst = true; const r0 = s.render; s.render = function (path) { const q = decodeURIComponent((String(path).match(/q=([^&]*)/) || [])[1] || ''); const h = r0.apply(this, arguments); return q ? inst(q) + h : h; }; s._wrapped = false; B.wrapAll && B.wrapAll(); };

  // TubeYou: the dead link, now useful
  const VIDS = [['How to read a bus timetable (so you don\'t miss it)', '4:12', 'Times on the left are when it leaves each stop. "Tomorrow" means the next day. Be at the stop 10 minutes early: professional buses leave on the dot, the cheap ones leave whenever.'], ['Pitching a tent in the dark', '6:40', 'Flat ground, no dips (water pools there). Stakes at 45°, door away from the wind. Practice once in daylight.'], ['What to do if you\'re lost', '3:05', 'Stop. Find a public place: a library, a gas station, a diner. Ask a worker, not a random driver. Your phone\'s map works offline if you opened it before.'], ['Staying warm on a cold night', '5:18', 'Layers, a hat, dry socks. Sleep off the ground. Cotton wet = cold. A sleeping bag rated for the lows is the one thing worth spending on.'], ['Spotting online scams', '7:02', '"Pay a deposit first," "come alone," "send a photo," "don\'t tell anyone." Every one of those is a stop sign. Block and report.'], ['Cheap food that fills you up', '4:44', 'Peanut butter, bread, bananas, oats, rice. Gas-station hot dogs are $2 and honestly fine.']];
  B.SITES['tubeyou.av'] = { n: 'TubeYou', icon: '▶️', col: '#c4302b', mb: 2.2, tile: false, render(path) { const i = +((path.match(/^v\/(\d+)/) || [])[1]); if (path && VIDS[i]) { const v = VIDS[i]; return `<div style="aspect-ratio:16/9;background:#000;border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:40px">▶️</div><div style="font-size:14px;font-weight:700;margin:6px 0 2px">${esc(v[0])}</div><div class="muted" style="font-size:11px">${v[1]} · the useful part:</div>` + B.note(esc(v[2]), 'info') + B.lnk('tubeyou.av', '← more videos'); } return VIDS.map((v, k) => B.row({ go: 'tubeyou.av/v/' + k, icon: '▶️', t: esc(v[0]), sub: v[1] })).join(''); } };
  B.index(/video|how to|tutorial|watch|tent|lost|warm|scam|timetable/, 'tubeyou.av', 'TubeYou · how-to videos', 'Timetables, tents, staying warm, scams.');

  // StayFinder: say how booking actually works
  const hookStay = () => { const s = B.SITES['stayfinder.av']; if (!s || s._x) return; s._x = true; const r0 = s.render; s.render = function () { return r0.apply(this, arguments) + B.note('<b>Booking:</b> walk in and ask at the desk (the Motel option in the town menu). Online booking needs a card and an adult 18+. Chains want ID. Family-run places haggle.', 'info') + B.row({ go: 'avermaps.av/near?k=motel', icon: '🗺️', t: 'Motels in other towns', sub: 'Sorted by distance on AverMaps' }); }; s._wrapped = false; B.wrapAll && B.wrapAll(); };
  const bGo = B.go; B.go = function () { try { fix(); hook(); hookStay(); } catch (e) {} return bGo.apply(this, arguments); };

  // PIP knows your tickets
  if (SH.PIP && SH.PIP.reply) { const bP = SH.PIP.reply; SH.PIP.reply = function (raw) { const t = String(raw || '').toLowerCase();
    if (T && /\b(my (ticket|trip|ride|booking)s?|where do i board|where do i get on|when'?s my (bus|train|ride)|how do i (book|buy a ticket))\b/.test(t)) {
      const L = T.all().filter((x) => T.state(x) === 'booked');
      if (!L.length) return 'No tickets. Open the browser → AverRides (rides.av): search, pick a ride, book it (PocketPal or reserve and pay cash). Then be at the boarding spot on the ticket before it leaves.';
      return L.slice(0, 3).map((x) => `${x.code}: ${R.fmt(x.dep)} ${SH.Rides ? SH.Rides.day(x.dep).toLowerCase() : ''} ${x.fromN} → ${x.toN}. Board at ${x.pts[0]}, be there by ${R.fmt(x.dep - 10)}. ${x.pay === 'card' ? 'Paid.' : `Bring $${x.cost} cash.`}`).join(' ') + ' Tap 🎫 Board in the town menu when you\'re there.';
    }
    return bP.apply(this, arguments); }; }
})(window.SH);
