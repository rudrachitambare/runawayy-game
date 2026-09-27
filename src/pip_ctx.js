/* SMALL HOURS — PIP with context. PIP remembers what you were just talking about (a place, a ride, a topic) so
   follow-ups work the way people actually type them:
     "bus to oakton" → "how much?" · "when does it leave?" · "where do i get on?" · "cheaper?" · "faster?"
     "and tomorrow?" · "what about ashwood?" · "ashwood?" · "book it" · "is there a motel there?" · "how far is it?"
   Town names are found anywhere in a sentence and forgive typos ("bus to oaktn tmrw").
   Place questions for any town: motels, wifi/signal, police, hospital, shelter, stores, distance, "tell me about X".
   Works in Harlow too, not only once you're away. Anything it doesn't own falls through to the older PIP layers. */
(function (SH) {
  const PIP = SH.PIP; if (!PIP || !PIP.reply) return;
  const R = SH.Routes, A = SH.Atlas, T = SH.Tickets;
  const G = () => SH.G, places = () => (A.data() ? A.data().places : []), here = () => A.here();
  const C = () => { const g = G(); return (g.pipCtx = g.pipCtx || {}); };
  const fmt = (t) => R.fmt(t), dayw = (t) => (SH.Rides ? ' ' + SH.Rides.day(t).toLowerCase() : '');
  const SL = { tmrw: 'tomorrow', tmr: 'tomorrow', tmw: 'tomorrow', tmro: 'tomorrow', tomoro: 'tomorrow', tomorow: 'tomorrow', tommorow: 'tomorrow', '2moro': 'tomorrow', '2morrow': 'tomorrow', tonite: 'tonight', '2nite': 'tonight', tn: 'tonight', rn: 'now', hw: 'how', wat: 'what', wen: 'when', whn: 'when', wher: 'where', whr: 'where', hm: 'how much', chepest: 'cheapest', cheeper: 'cheaper', fastr: 'faster', motl: 'motel', hotl: 'hotel', wify: 'wifi' };
  const norm = (s) => String(s || '').toLowerCase().replace(/[^a-z0-9' ]/g, ' ').replace(/'/g, '').replace(/\s+/g, ' ').trim().split(' ').map((w) => SL[w] || w).join(' ');
  const lev = (a, b) => { if (Math.abs(a.length - b.length) > 2) return 9; const d = Array.from({ length: b.length + 1 }, (_, i) => i); for (let i = 1; i <= a.length; i++) { let p = d[0]; d[0] = i; for (let j = 1; j <= b.length; j++) { const t = d[j]; d[j] = Math.min(d[j] + 1, d[j - 1] + 1, p + (a[i - 1] === b[j - 1] ? 0 : 1)); p = t; } } return d[b.length]; };
  const STOP = new Set('to the a an in at is there any a from for of and or what about how much when where do does i get go going bus train ride ticket tempo van me my can could would should tonight tomorrow now it that this near far with have has any'.split(' '));

  /* ---------- find a town anywhere in a sentence (exact, then fuzzy) ---------- */
  function placeIn(text) {
    const s = ' ' + norm(text) + ' ', P = places(); if (!P.length) return null;
    if (/\bgrandma'?s?\b/.test(s)) return { p: P.find((x) => x.grandma), guess: false };
    if (/\b(harlow|home)\b/.test(s)) return { p: P.find((x) => x.home), guess: false };
    const byLen = P.slice().sort((a, b) => b.name.length - a.name.length);
    for (const p of byLen) if (s.includes(' ' + norm(p.name) + ' ')) return { p, guess: false };
    const w = s.trim().split(' ').filter((x) => x && !STOP.has(x)); let best = null, bd = 9;
    for (let n = 1; n <= 2; n++) for (let i = 0; i + n <= w.length; i++) { const q = w.slice(i, i + n).join(' '); if (q.length < 4) continue;
      for (const p of P) { const nm = norm(p.name), d = lev(q, nm), lim = nm.length <= 6 ? 1 : 2; if (d <= lim && d < bd) { bd = d; best = p; } } }
    return best ? { p: best, guess: bd > 0 } : null;
  }
  PIP.placeIn = placeIn;

  /* ---------- when ---------- */
  function when(t) {
    const g = G(), d0 = Math.floor(g.t / 1440) * 1440; let m = t.match(/\b(?:at|after|around)\s+(\d{1,2})(?::(\d\d))?\s*(am|pm)?\b/);
    if (m) { let h = +m[1] % 12; if (m[3] === 'pm' || (!m[3] && h < 7)) h += 12; let x = d0 + h * 60 + (+m[2] || 0); if (/\btomorrow\b/.test(t) || x < g.t) x += 1440; return x; }
    if (/\btomorrow\b/.test(t)) return d0 + 1440 + (/\b(afternoon)\b/.test(t) ? 13 * 60 : /\b(evening|night)\b/.test(t) ? 18 * 60 : 7 * 60);
    if (/\b(tonight|this evening)\b/.test(t)) return Math.max(g.t, d0 + 18 * 60);
    if (/\b(in the )?morning\b/.test(t)) return g.t % 1440 < 7 * 60 ? d0 + 7 * 60 : d0 + 1440 + 7 * 60;
    if (/\blater\b/.test(t)) return g.t + 180;
    return null;
  }

  /* ---------- rides ---------- */
  const pts = (jr) => T ? T.ptxt(T.point(jr.legs[0].rt.stops[jr.legs[0].i], jr.legs[0].rt)) : 'the stop';
  const ops = (jr) => { const a = []; jr.legs.forEach((l) => { const n = l.rt.op.icon + ' ' + l.rt.op.n, last = a[a.length - 1]; if (last && last.n === n) last.k++; else a.push({ n, k: 1 }); }); return a.map((x) => x.n + (x.k === 2 ? ' (one change)' : x.k > 2 ? ` (${x.k - 1} changes)` : '')).join(' → '); };
  const strict = (jr) => T && jr.legs.some((l) => T.checks(l.rt.op));
  function best(to, t, pref) {
    const js = R.journeys(here(), to, t, 6); if (!js.length) return null;
    const k = pref === 'cheap' ? (j) => j.cost : pref === 'fast' ? (j) => j.arr - j.dep : (j) => j.arr;
    return js.slice().sort((a, b) => k(a) - k(b))[0];
  }
  function ride(to, t, pref, guess) {
    const c = C(), from = here();
    if (from.id === to.id) return `You're already in ${to.name}.`;
    const jr = best(to, t || G().t, pref);
    c.place = to.id; c.intent = 'ride'; c.when = t || null; c.at = G().t;
    const M = G().pipMem; if (M && !M.goal) M.goal = to.id;
    if (!jr) { c.jr = null; return `${guess ? `(Guessing you mean ${to.name}.) ` : ''}No bus, tempo or train links ${from.name} and ${to.name}${t ? ' then' : ''}, even with changes. Feet, a bike, or someone's car.`; }
    const same = pref && c.jr && c.jr.key === jr.key; c.jr = { key: jr.key, to: to.id };
    if (same) return `That one's already the ${pref === 'cheap' ? 'cheapest' : 'fastest'}: ${fmt(jr.dep)}${dayw(jr.dep)}, $${jr.cost}. Nothing ${pref === 'cheap' ? 'cheaper' : 'faster'} goes to ${to.name}${t ? ' then' : ' today'}.`;
    const tag = pref === 'cheap' ? 'Cheapest: ' : pref === 'fast' ? 'Fastest: ' : '';
    return `${guess ? `(Guessing you mean ${to.name}.) ` : ''}${tag}${fmt(jr.dep)}${dayw(jr.dep)}, ${ops(jr)}, arrives ${fmt(jr.arr)}${dayw(jr.arr) !== dayw(jr.dep) ? dayw(jr.arr) : ''}. $${jr.cost}. Board at ${pts(jr)}.${strict(jr) ? ' They check ages.' : ''} Say "book it", "cheaper", "faster" or "tomorrow".`;
  }
  const cur = () => { const c = C(); if (!c.jr || G().t - (c.at || 0) > 720) return null; const jr = R.byKey(c.jr.key); return jr ? { jr, to: places().find((p) => p.id === c.jr.to) } : null; };

  /* ---------- places ---------- */
  function facts(p, t) {
    const g = G(), mi = A.miles ? Math.round(A.miles(here(), p)) : null, tier = p.tier === 'small' ? 'small town' : p.tier;
    const S = p.services || {}, net = SH.Net && SH.Net.cell ? SH.Net.cell(p) : null;
    if (/\b(motel|hotel|room|sleep|stay|bed|inn)\b/.test(t)) { const M = SH.Motels ? SH.Motels.motels(p) : []; return M.length ? `${p.name}: ${M.map((m) => `${m.n} ($${m.rate}/night, ${m.k === 'pro' ? 'chain, wants ID' : m.k === 'loose' ? 'cash, no questions' : 'family-run, haggle'})`).join('; ')}.` : `No motel in ${p.name}.${S.shelter ? ' There is a shelter.' : ''}`; }
    if (/\b(wifi|wi fi|internet|signal|service|bars|data)\b/.test(t)) return net ? `${p.name}: ${net.gen || 'weak'} signal${net.spot ? ', best at ' + net.spot : ''}.${(S.wifi || []).length ? ' Free wifi: ' + S.wifi.join(', ') + '.' : ' No free wifi.'}` : `${p.name}: ${(S.wifi || []).length ? 'free wifi at ' + S.wifi.join(', ') : 'no free wifi'}.`;
    if (/\b(police|cops?|sheriff|officers?)\b/.test(t)) return p.hasPolice === false || !p.police ? `${p.name} has no police station. The county sheriff covers it, eventually.` : `${p.name}: ${typeof p.police === 'string' ? p.police.replace(/\.+$/, '') : 'a police department'}.`;
    if (/\b(hospital|clinic|doctor|er)\b/.test(t)) return S.hospital ? `${p.name} has a hospital.` : `No hospital in ${p.name}. Nearest real one is a bigger town.`;
    if (/\b(shelter|youth house|drop in)\b/.test(t)) return S.shelter ? `${p.name} has a shelter. They take kids.` : `No shelter in ${p.name}.`;
    if (/\b(store|shop|food|grocery|buy|eat)\b/.test(t)) { const st = SH.Stores && SH.Stores.BY_TIER ? (SH.Stores.BY_TIER[p.tier] || []).map((k) => (SH.Stores.STORES[k] || {}).n || k) : []; return st.length ? `${p.name} has: ${st.slice(0, 6).join(', ')}.` : `${p.name} is too small for real stores.`; }
    if (/\b(how far|distance|miles|how long)\b/.test(t)) return mi != null ? `${p.name} is about ${mi} miles from ${here().name}.` : `${p.name} is on the map. Far-ish.`;
    return `${p.name}: ${tier}, pop. ${(p.pop || 0).toLocaleString()}${p.biome ? ', ' + p.biome : ''}${mi != null && p.id !== here().id ? `, ${mi} mi away` : ''}. ${S.hospital ? 'Hospital. ' : ''}${S.shelter ? 'Shelter. ' : ''}${p.police ? '' : 'No police station. '}${p.served ? 'Buses stop here.' : 'Nothing stops here.'}`;
  }

  /* ---------- the router ---------- */
  const base = PIP.reply;
  PIP.reply = function (raw) {
    const t = norm(raw), c = C(), an = SH.NLP && SH.NLP.analyze ? SH.NLP.analyze(raw) : null; let r = null;
    if (!G() || !A.data() || (an && an.has && an.has('selfharm'))) return base.apply(this, arguments);
    try { r = route(t, c); } catch (e) { console.warn('pip_ctx', e); r = null; }
    return r || base.apply(this, arguments);
  };
  function route(t, c) {
    if (/\bmy tickets?\b|\bmy (trip|booking)\b/.test(t)) return null; // tickets answer lives in web_more
    const found = placeIn(t), p = found && found.p, there = /\b(there|that (town|place)|it)\b/.test(t) && c.place ? places().find((x) => x.id === c.place) : null;
    const X = cur(), tm = when(t);
    // Harlow's three boarding spots
    if (/\bwhere\b/.test(t) && /\b(tempos?|vans?|minivans?|car ?pools?|cheapride|cheap bus(es)?|unofficial|pickup|pick up)\b/.test(t)) return 'In Harlow: cheap buses, tempos, vans and car pools pick up at the Route 9 pickup (the gravel lot by the Gas-N-Go, Route 9 & Center Ave). Averline and County Transit leave from the Greyline depot. Trains from Harlow Station.';
    // follow-ups about the ride we were just talking about
    if (X) {
      if (/^(ok |okay |yes |yeah |sure )?(book|reserve)( it| that| this| one| a seat| the seat)?( please)?$/.test(t) || /\bbook (it|that|this one)\b/.test(t)) { SH.Phone.open('browser'); SH.Browser.go('rides.av/trip/' + encodeURIComponent(X.jr.key) + '?to=' + X.to.id); return `Opened it on AverRides. Pick cash or card, then "Book seat".`; }
      if (!p && /\b(how much|cost|price|fare|expensive)\b/.test(t)) return `$${X.jr.cost}${X.jr.legs.some((l) => l.rt.op.S && l.rt.op.S.cash) ? ', cash only' : ''}. You have $${Math.floor(G().money)}.`;
      if (!p && /\b(when|what time)\b/.test(t) && /\b(leave|leaves|go|goes|depart|get there|arrive|arrives|it)\b/.test(t)) return `Leaves ${fmt(X.jr.dep)}${dayw(X.jr.dep)}, gets to ${X.to.name} at ${fmt(X.jr.arr)}${dayw(X.jr.arr)}.`;
      if (!p && /\bwhere\b/.test(t) && /\b(get on|board|catch|leave from|leaves from|pick ?up|wait)\b/.test(t)) return `Board at ${pts(X.jr)}. Be there 10 minutes early.`;
      if (!p && /\b(change|changes|transfer|direct)\b/.test(t)) return X.jr.legs.length > 1 ? `One change, at ${places().find((q) => q.id === X.jr.legs[1].rt.stops[X.jr.legs[1].i]).name} (${fmt(X.jr.legs[1].dep)}).` : 'Direct. No changes.';
      if (!p && /\b(check|checks|id|age|alone|by myself)\b/.test(t)) return strict(X.jr) ? `${X.jr.legs.find((l) => T.checks(l.rt.op)).rt.op.n} checks IDs. Under 15 alone gets turned away.` : 'Nobody on that one checks ages. Driver\'s call, and they don\'t call.';
      if (/\b(cheaper|cheapest|less money|budget)\b/.test(t)) return ride(p || X.to, tm || c.when, 'cheap');
      if (/\b(faster|fastest|quicker|quickest|sooner)\b/.test(t)) return ride(p || X.to, tm || c.when, 'fast');
      if (!p && tm != null && t.split(' ').length <= 5) return ride(X.to, tm);
    }
    // questions about a town ("is there a motel in X", "wifi there?", "tell me about X")
    const tgt = p || there;
    if (tgt && /\b(motel|hotel|room|sleep|stay|bed|inn|wifi|wi fi|internet|signal|service|bars|police|cops?|sheriff|hospital|clinic|doctor|shelter|store|shop|food|grocery|how far|distance|miles|tell me about|what'?s .* like|what is|whats)\b/.test(t) && !/\b(bus|train|ride|tempo|van|ticket|get to|go to|fare|how much)\b/.test(t)) { c.place = tgt.id; c.at = G().t; return (found && found.guess ? `(Guessing you mean ${tgt.name}.) ` : '') + facts(tgt, t); }
    // rides: "bus to X", "how do i get there", "what about X", "X?"
    const rideish = /\b(bus|buses|train|ride|rides|tempo|van|ticket|get to|go to|going to|travel|head to|way to|route|directions|fare)\b/.test(t) || /\bget there\b|\bhow much (is it )?(to|for)\b/.test(t);
    if (tgt && rideish) return ride(tgt, tm, /\bcheap/.test(t) ? 'cheap' : /\bfast|quick/.test(t) ? 'fast' : null, found && found.guess);
    if (p && c.intent === 'ride' && G().t - (c.at || 0) < 720 && (/^(and |what about |how about |or )/.test(t) || t.split(' ').length <= 3)) return ride(p, tm || c.when, null, found.guess);
    return null;
  }
})(window.SH);
