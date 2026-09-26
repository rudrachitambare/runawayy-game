/* SMALL HOURS — cell signal & village internet.
   Every place has phone service, but not the same service: cities get 5G, towns LTE, villages a flickering
   3G or EDGE that changes by the hour, the weather, and where you stand (the hill by the water tower is always
   better). Speed decides how long pages and apps take to LOAD, and one bar of EDGE can time out.
   Zero bars = no service: messages queue, calls fail, your location stops updating.
   Villagers: most of them aren't online at all. Some who are don't follow missing-kid news. Only the few who
   are online AND care can recognize a poster, so a missing poster matters much less in a village. */
(function (SH) {
  const NT = SH.Net, P = SH.Phone, A = SH.Atlas; if (!NT || !P) return;
  const G = () => SH.G;
  const h32 = (s) => { let h = 2166136261; for (const c of String(s)) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); } return h >>> 0; };
  const q = (s) => (h32(s) % 10000) / 10000;
  const GEN = { '5G': 90, LTE: 22, '3G': 2.2, E: 0.12 };
  const HARLOW = { underpass: 1, trainyard: 2, harbor: 3, park: 3, birch: 3, school: 3, hospital: 3 };

  /* ---------- per-place network ---------- */
  NT.cell = function (p) {
    if (!p) return null; if (p._cell) return p._cell;
    const r = q('cell' + p.id + p.name), r2 = q('cell2' + p.name);
    const c = p.tier === 'city' ? { gen: '5G', base: 4 } : p.tier === 'town' ? { gen: r < 0.8 ? 'LTE' : '5G', base: 4 } : p.tier === 'small' ? { gen: r < 0.75 ? 'LTE' : '3G', base: 2 + Math.round(r2 * 2) } : { gen: r < 0.35 ? 'LTE' : r < 0.8 ? '3G' : 'E', base: 1 + Math.round(r2 * 2) };
    c.spot = p.tier === 'village' || p.tier === 'small' ? ['the hill by the water tower', 'the church steps', 'the top of the grain elevator road', 'the far end of the gas station lot', 'the old railroad bridge'][Math.floor(r2 * 5)] : null;
    // villagers online: most aren't; of those who are, some don't care about missing kids
    c.online = p.tier === 'village' ? 0.12 + r * 0.25 : p.tier === 'small' ? 0.55 + r * 0.2 : 0.92;
    c.care = p.tier === 'village' ? 0.35 + r2 * 0.3 : p.tier === 'small' ? 0.6 : 0.75;
    return (p._cell = c);
  };
  NT.person = function (p, who) { const c = NT.cell(p), a = q('net' + p.id + who.n), b = q('care' + p.id + who.n); return a > c.online ? 'none' : b > c.care ? 'online' : 'cares'; };

  /* current signal: place base, wobbling by the hour, worse in storms, better at the good spot */
  NT.signal = function () {
    const g = G(); if (!g) return { bars: 4, gen: 'LTE', mbps: 22 };
    let gen = 'LTE', bars = 4, p = null;
    if (g.away && A) { p = A.here(); const c = NT.cell(p); gen = c.gen; bars = c.base; if (p.tier !== 'city') bars += Math.round((q('w' + p.id + Math.floor(g.t / 60)) - 0.5) * 2.2); }
    else bars = HARLOW[g.loc] || 4;
    const w = SH.weatherDay ? SH.weatherDay() : {}; if (/storm/.test(w.c || '')) bars -= 2; else if (/rain|snow/.test(w.c || '')) bars -= 1;
    const bo = g.sigBoost; if (bo && bo.at === (g.away || 'p0') && g.t < bo.until) bars += bo.b;
    bars = Math.max(0, Math.min(4, bars));
    if (p && p.tier === 'village' && bars === 0 && q('z' + p.id + Math.floor(g.t / 60)) < 0.5) bars = 1; // villages flicker back
    const mbps = bars ? +(GEN[gen] * (0.25 + bars * 0.19)).toFixed(2) : 0;
    return { bars, gen, mbps, spot: p ? NT.cell(p).spot : null };
  };
  const hasWifi = () => !!NT.wifiHere();
  const bCan = NT.canData; NT.canData = function () { const g = G(); if (g && !hasWifi() && !g.phone.airplane && NT.signal().bars === 0) return false; return bCan.apply(this, arguments); };
  const bOn = NT.online; NT.online = function () { const g = G(); if (g && !hasWifi() && NT.signal().bars === 0) return false; return bOn.apply(this, arguments); };
  const bBlk = NT.blocked; NT.blocked = function (body, name) {
    const g = G(), s = NT.state();
    if (!hasWifi() && !g.phone.airplane && !s.cut && s.mb > 0 && NT.signal().bars === 0) { const sp = NT.signal().spot; body.innerHTML = P.hdr(name) + `<div class="appbody" style="text-align:center;padding-top:30px"><div style="font-size:40px">📵</div><b>No service</b><p class="muted">Zero bars. Your messages will wait on "sending…" until the signal comes back.</p>${sp ? `<p class="muted" style="font-size:12px">Somebody said the signal's better up at ${sp}.</p>` : ''}</div>`; return; }
    return bBlk.apply(this, arguments);
  };

  /* ---------- loading time: pages and data apps take as long as the connection says ---------- */
  const APPMB = { chirp: 1.2, tubeyou: 3, atlas: 0.8, music: 1.5, skyforge: 2 };
  let LD = null;
  const loadMs = (mb) => { const s = NT.signal(); if (hasWifi()) return 250 + Math.random() * 400; return Math.min(7000, Math.max(150, mb * 8 / s.mbps * 1000 * 0.35)); };
  const bars = (n) => [1, 2, 3, 4].map((i) => `<span style="opacity:${i <= n ? 1 : 0.25}">${'▂▃▅▇'[i - 1]}</span>`).join('');
  function wrap(key, mbOf) {
    const base = P.V[key]; if (!base) return;
    P.V[key] = function (body) {
      const g = G(); if (!g || NT.instant || !NT.canData()) return base.apply(this, arguments); // NT.instant: tests skip load times
      const id = key + '|' + (key === 'browser' ? SH.Browser.url : '') + '|' + (P._openN || 0);
      if (id.endsWith('|home|' + (P._openN || 0)) || (LD && LD.id === id && LD.done)) return base.apply(this, arguments);
      if (!LD || LD.id !== id) { const s = NT.signal(); LD = { id, t0: Date.now(), ms: loadMs(mbOf()), fail: !hasWifi() && s.bars <= 1 && (s.gen === 'E' ? 0.5 : 0.15) > Math.random() }; setTimeout(() => { if (LD && LD.id === id) { LD.done = !LD.fail; LD.failed = LD.fail; P.render(); } }, LD.ms); }
      const s = NT.signal(), el = Date.now() - LD.t0, pct = Math.min(95, Math.round(100 * (1 - Math.exp(-3 * el / LD.ms))));
      const title = key === 'browser' ? '🌐 ' + (SH.Browser.url || '') : { chirp: '🐦 Chirp', tubeyou: '▶️ TubeYou', atlas: '🧭 Atlas', music: '🎧 Music', skyforge: '⚔️ Skyforge' }[key] || key;
      if (LD.failed) { body.innerHTML = P.hdr(title) + `<div class="appbody" style="text-align:center;padding-top:34px"><div style="font-size:34px">🐌</div><b>This is taking too long</b><p class="muted">${bars(s.bars)} ${s.gen} · the connection timed out.</p><button class="btn" id="ldre">Try again</button></div>`; body.querySelector('#ldre').onclick = () => { LD = null; P.render(); }; return; }
      body.innerHTML = P.hdr(title) + `<div class="appbody" style="text-align:center;padding-top:40px"><div class="muted" style="font-size:12px;margin-bottom:8px">${hasWifi() ? 'Wi-Fi' : `${bars(s.bars)} ${s.gen} · ~${s.mbps < 1 ? Math.round(s.mbps * 1000) + ' kbps' : s.mbps + ' Mbps'}`}</div><div style="height:4px;background:#ffffff18;border-radius:3px;overflow:hidden;margin:0 20px"><div style="height:100%;width:${pct}%;background:#0a84ff;transition:width .3s"></div></div><p class="muted" style="font-size:11.5px;margin-top:10px">${LD.ms > 3000 ? 'Loading… slowly. Very slowly.' : 'Loading…'}</p></div>`;
      clearTimeout(LD.tick); LD.tick = setTimeout(() => { if (LD && LD.id === id && !LD.done && !LD.failed && P.view && document.querySelector('#pbody')) P.render(); }, 400);
    };
  }
  const bOpen = P.open; P.open = function () { P._openN = (P._openN || 0) + 1; return bOpen.apply(this, arguments); };
  const B = SH.Browser;
  if (B) { const bGo = B.go; B.go = function () { P._openN = (P._openN || 0) + 1; return bGo.apply(this, arguments); }; }
  wrap('browser', () => { const d = (B.url || '').split('/')[0].split('?')[0]; return (B.SITES[d] && B.SITES[d].mb) || 0.6; });
  Object.keys(APPMB).forEach((k) => wrap(k, () => APPMB[k]));

  /* ---------- status bar + Network app ---------- */
  const bRender = P.render;
  P.render = function () {
    const r = bRender.apply(this, arguments), g = G(); if (!g) return r;
    const sb = document.querySelector('#sbar'); if (!sb || g.phone.airplane || g.phone.bat <= 0) return r;
    const s = NT.signal(), h = sb.innerHTML;
    if (h.includes('▂▄▆')) sb.innerHTML = h.replace('▂▄▆ LTE', s.bars ? `${bars(s.bars)} ${s.gen}` : '<span style="color:#ff9f0a">No service</span>').replace(/▂▄▆( <span style="color:#ff453a">no data<\/span>)/, `${bars(s.bars)}$1`);
    return r;
  };
  const bNet = P.V.net;
  if (bNet) P.V.net = function (body) {
    bNet.apply(this, arguments); const s = NT.signal(), ab = body.querySelector('.appbody'); if (!ab) return;
    const p = G().away && A ? A.here() : null, c = p && NT.cell(p);
    ab.insertAdjacentHTML('afterbegin', `<div class="sech">CELL SIGNAL</div><div class="setrow"><span>${s.bars ? bars(s.bars) + ' ' + s.gen + ' · ~' + (s.mbps < 1 ? Math.round(s.mbps * 1000) + ' kbps' : s.mbps + ' Mbps') : '📵 No service'}</span></div><div class="muted" style="font-size:11.5px">${p ? `${p.name}: ${c.gen} coverage.${p.tier === 'village' ? ' It comes and goes by the hour.' : ''}${s.spot && s.bars < 3 ? ` Better up at ${s.spot}.` : ''}` : 'Harlow Mobile coverage.'} ${hasWifi() ? 'Wi-Fi is on, so pages load fast anyway.' : 'Slow signal = pages take longer to load.'}</div>`);
  };

  /* ---------- towns: look for better signal; the Atlas card shows coverage and who's online ---------- */
  if (A) {
    (A.extra = A.extra || []).push((p, ch, dark) => { const c = NT.cell(p); if (c.spot && NT.signal().bars < 3) ch.push({ t: '📶 Look for better signal', sub: `People say ${c.spot} is best`, fn: () => {
      const g = G(); SH.advance(20, { interrupt: false }); if (g.ended) return; const b = 1 + (Math.random() < 0.5 ? 1 : 0); g.sigBoost = { at: p.id, until: g.t + 90, b };
      SH.UI.dialog({ title: 'Signal hunting', text: [`You walk up to ${c.spot} holding your phone over your head like everybody does. ${b > 1 ? 'Two more bars. Messages start pouring in.' : 'One more bar. It\'ll do.'}${dark ? ' It\'s very dark up here.' : ''}`], choices: [{ t: 'Okay', fn: () => setTimeout(A.hub, 30) }] }); } }); });
    const bCard = A.card;
    A.card = function (p) {
      const h = bCard.apply(this, arguments), c = NT.cell(p);
      const on = p.people.filter((x) => NT.person(p, x) !== 'none'), off = p.people.filter((x) => NT.person(p, x) === 'none');
      const line = `<div class="arow">📶 Phone signal: ${c.gen}${p.tier === 'village' ? ', patchy (1–3 bars, changes by the hour)' : p.tier === 'small' ? ', okay' : ', strong'}${c.spot ? `. Best at ${c.spot}` : ''}.</div>
        <div class="arow">🌐 ${p.tier === 'village' ? `Only about 1 in ${Math.max(2, Math.round(1 / c.online))} people here is online.` : p.tier === 'small' ? 'Most people are online.' : 'Everyone is online.'}${p.people.length ? ` ${off.length ? off.map((x) => x.n).join(', ') + ': no internet. ' : ''}${on.map((x) => `${x.n}: ${NT.person(p, x) === 'cares' ? 'online, reads the local news' : 'online, doesn\'t care about missing-kid posts'}`).join('; ')}` : ''}</div>`;
      return h.replace(/(<div class="arow">👥)/, line + '$1');
    };
  }

  /* ---------- the poster matters less where nobody's online (or nobody cares) ---------- */
  NT.posterMult = (p) => { if (!p || (p.tier !== 'village' && p.tier !== 'small')) return 1.6; const c = NT.cell(p); return Math.min(1.6, 0.8 + 2 * c.online * c.care); };
  const bLocal = SH.Brain && SH.Brain.local;
  if (bLocal) SH.Brain.local = function (an, c) {
    const w = (c.opts && c.opts.local) || null, p = (c.opts && c.opts.place) || null, g = G();
    if (w && p && p.people) {
      const net = NT.person(p, w), t = an.t || '';
      if (/\b(wifi|wi-fi|internet|online|signal|charge|charger|news|facebook|chirp|phone)\b/.test(t) && !c.mem.netTalk) { c.mem.netTalk = 1;
        if (net === 'none') return { say: pk(['Internet? Honey, I have a landline and a radio. The radio gets two stations.', 'Never had it, never wanted it. The library in town\'s got computers, I think.', 'My grandson set me up with one of those phones. It\'s in a drawer somewhere.']), fx: {} };
        if (net === 'cares') return { say: pk(['Sure, I\'m on the county page every morning with my coffee. Lost dogs, church suppers, road closures. I keep an eye on things.', 'Signal\'s lousy, but I get the news. Somebody\'s always missing something around here, a cow, a dog.']), fx: {} };
        if (net === 'online') return { say: pk(['I\'m on there for the weather and my church group. The rest of it\'s just people yelling.', 'My daughter keeps sending me those missing-kid things. I don\'t read them. Too sad, and none of them are from here.']), fx: {} }; }
      if (net === 'cares' && g.reported && c.turn >= 2 && !c.mem.recog && Math.random() < 0.35) { c.mem.recog = 1; c.result = 'call';
        return { say: 'Hold on. You\'re... I saw you. On the county page this morning. Your mama\'s looking all over for you, sweetheart. Sit down. I\'m calling somebody.', fx: {}, end: true }; }
    }
    return bLocal.apply(this, arguments);
  };
  const pk = (a) => a[Math.floor(Math.random() * a.length)];
})(window.SH);
