/* SMALL HOURS — Part 1d: the web browser. Made-up sites, each costs data per page. History is saved (and can be
   seen by whoever gets your phone, unless you clear it or App-Lock the browser).
   Shell + Seekr (search) + SkyCast (weather) + AverMaps + history. Other sites register into SH.Browser.SITES
   from browser_news.js, browser_shop.js and browser2.js. */
(function (SH) {
  const P = SH.Phone, NT = SH.Net;
  const G = () => SH.G, esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const B = SH.Browser = { url: 'home', stack: [], SITES: {}, esc };
  B.$2 = (n) => '$' + (+n).toFixed(2);
  B.lnk = (url, txt, st) => `<a href="#" onclick="SH.Browser.go('${url}');return false" style="color:#7ab8ff;text-decoration:none;${st || ''}">${txt}</a>`;
  B.card = (h, st) => `<div style="background:#ffffff0d;border:1px solid #ffffff14;border-radius:10px;padding:9px 10px;margin:7px 0;${st || ''}">${h}</div>`;
  B.btn = (js, txt, cls) => `<button class="btn ${cls || ''}" style="margin:2px" onclick="${js}">${txt}</button>`;
  B.rnd = (seed) => { let s = (seed >>> 0) || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); };
  B.seed = () => ((G().story && G().story.seed) || 7);
  B.place = () => (SH.Atlas && SH.Atlas.here ? SH.Atlas.here() : { name: 'Harlow', tier: 'town' });
  const hist = () => (NT && NT.x ? NT.x().hist : (G()._hist = G()._hist || []));
  B.hist = hist;

  B.go = function (url, noPush) {
    if (url !== B.url && !noPush) B.stack.push(B.url);
    B.url = url;
    if (url !== 'home') { const h = hist(); if (!h[0] || h[0].url !== url) h.unshift({ url, t: G().t }); if (h.length > 60) h.pop(); }
    B._charged = false; P.render();
  };
  B.back = function () { if (B.stack.length) { B.url = B.stack.pop(); B._charged = false; P.render(); } else P.open('home'); };
  B.search = function (q) {
    q = (q || '').trim(); if (!q) return;
    if (/^[a-z0-9]+\.av(\/.*)?$/i.test(q)) return B.go(q.toLowerCase());
    B.go('seekr.av/?q=' + encodeURIComponent(q));
  };

  /* ---------- search index: keywords -> sites ---------- */
  B.INDEX = [];
  B.index = (re, url, title, blurb) => B.INDEX.push({ re, url, title, blurb });

  /* ---------- the shell ---------- */
  P.V.browser = function (body) {
    const g = G();
    if (!NT.canData()) return NT.blocked(body, '🌐 Browser');
    const url = B.url, dom = url.split('/')[0].split('?')[0], site = B.SITES[dom];
    const mb = url === 'home' ? 0 : (site && site.mb) || 0.6;
    if (!B._charged) { B._charged = true; if (mb && !NT.spend(mb)) return NT.blocked(body, '🌐 Browser'); }
    let page;
    try { page = url === 'home' ? home() : site ? site.render(url.slice(dom.length).replace(/^\//, ''), url) : notFound(url); } catch (e) { console.warn(e); page = B.card('This page isn\'t loading. (' + esc(e.message) + ')'); }
    body.innerHTML = `<div class="apphdr" style="gap:6px"><button onclick="SH.Browser.back()">‹</button><input id="burl" value="${esc(url === 'home' ? '' : url)}" placeholder="Search or type a .av address" style="flex:1;min-width:0;font-size:12px;padding:5px 8px;border-radius:14px;border:1px solid #ffffff22;background:#0008;color:inherit"><button onclick="SH.Browser.go('home')">⌂</button></div>
      <div class="appbody" style="font-size:12.5px;line-height:1.45">${page}</div>`;
    const i = body.querySelector('#burl'); i.onkeydown = (e) => { e.stopPropagation(); if (e.key === 'Enter') B.search(i.value); };
    body.querySelectorAll('input:not(#burl),textarea').forEach((x) => x.addEventListener('keydown', (e) => e.stopPropagation()));
  };
  function notFound(url) { return B.card(`<b>This site can't be reached</b><br><span class="muted">${esc(url)} doesn't exist. Try ${B.lnk('seekr.av', 'Seekr')}.</span>`); }

  function home() {
    const tiles = Object.entries(B.SITES).filter(([, s]) => s.tile).sort((a, b) => (a[1].order || 50) - (b[1].order || 50));
    return `<div style="text-align:center;margin:10px 0 8px"><div style="font-size:26px;font-weight:700;letter-spacing:-1px">Seekr</div><div class="muted" style="font-size:11px">the search engine that doesn't judge</div></div>
      <div style="display:flex;gap:6px;margin:0 4px 10px"><input id="bq" placeholder="Search anything…" style="flex:1;min-width:0;padding:7px 10px;border-radius:16px;border:1px solid #ffffff22;background:#0008;color:inherit"><button class="btn primary" onclick="SH.Browser.search(document.querySelector('#bq').value)">Go</button></div>
      <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px 4px;text-align:center">${tiles.map(([d, s]) => `<a href="#" onclick="SH.Browser.go('${d}');return false" style="color:inherit;text-decoration:none;font-size:10.5px"><div style="width:42px;height:42px;margin:0 auto 3px;border-radius:11px;background:${s.col || '#333'};display:flex;align-items:center;justify-content:center;font-size:20px">${s.icon}</div>${esc(s.n)}</a>`).join('')}</div>
      <div class="muted" style="font-size:10.5px;margin-top:12px;text-align:center">Every page uses a little data. ${B.lnk('history.av', 'History')}</div>`;
  }
  // the home search box needs Enter too
  const bRender = P.render;
  P.render = function () { const r = bRender.apply(this, arguments); const q = document.querySelector('#bq'); if (q && !q._k) { q._k = 1; q.onkeydown = (e) => { e.stopPropagation(); if (e.key === 'Enter') B.search(q.value); }; } return r; };

  /* ---------- Seekr ---------- */
  B.SITES['seekr.av'] = { n: 'Seekr', icon: '🔎', col: '#3a3f58', mb: 0.3, render(path) {
    const q = decodeURIComponent((path.match(/q=([^&]*)/) || [])[1] || '');
    if (!q) return home();
    const ql = q.toLowerCase(); const hits = B.INDEX.filter((x) => x.re.test(ql));
    const prod = SH.Catalog ? SH.Catalog.search(ql).slice(0, 4) : [];
    let h = `<div class="muted" style="font-size:11px">Results for <b>${esc(q)}</b> · near ${esc(B.place().name)}</div>`;
    if (/run ?away|ran away|leave home|leaving home|unsafe at home|scared.*home|abuse|hit me|hurt/.test(ql)) h += B.card(`<b>💛 If you're thinking about leaving home or you're not safe</b><br>You can talk to someone right now. Free, confidential. ${B.lnk('safeline.av', 'Runaway Safeline →')}`, 'border-color:#f2c14e66');
    hits.forEach((x) => { h += B.card(`${B.lnk(x.url, '<b>' + esc(x.title) + '</b>')}<br><small style="color:#6fdc8c">${esc(x.url)}</small><br><span class="muted">${esc(x.blurb)}</span>`); });
    if (prod.length) h += B.card(`<b>Shopping</b> · ${prod.map((p) => B.lnk('everything.av/p/' + p.id, p.i + ' ' + esc(p.n) + ' ' + B.$2(p.price))).join(' · ')}`);
    if (!hits.length && !prod.length) h += B.card(`No great results. Seekr suggests: ${B.lnk('threadly.av', 'ask on Threadly')} · ${B.lnk('tubeyou.av', 'watch a video')} · ${B.lnk('everything.av', 'shop')}`);
    return h;
  } };

  /* ---------- SkyCast ---------- */
  B.SITES['skycast.av'] = { n: 'SkyCast', icon: '🌦️', col: '#1c6fb8', mb: 0.5, tile: true, order: 5, render() {
    const d = SH.day(), ic = { clear: '☀️', cloudy: '☁️', rain: '🌧️', storm: '⛈️', fog: '🌫️', snow: '❄️' };
    const rows = [0, 1, 2, 3, 4, 5, 6].map((i) => { const w = SH.weatherDay(d + i) || {}; const cold = w.lo < 38, wet = /rain|storm/.test(w.c); return `<div class="setrow" style="display:flex;justify-content:space-between"><span>${i ? SH.dateStr(SH.G.t + i * 1440).split(',')[0] : 'Today'}</span><span>${ic[w.c] || '·'} ${w.c || ''}</span><b>${w.hi}° / ${w.lo}°</b>${cold ? '<span title="cold night">🥶</span>' : wet ? '<span title="rain">☔</span>' : '<span></span>'}</div>`; }).join('');
    const tn = SH.weatherDay(d + 1) || {};
    return `<div style="font-size:15px;font-weight:600">${esc(B.place().name)} · 7 days</div>${rows}${tn.lo < 40 ? B.card('🥶 <b>Cold night alert.</b> Lows near ' + tn.lo + '°F. Sleeping outside without a sleeping bag is dangerous.', 'border-color:#6aa7ff66') : ''}`;
  } };
  B.index(/weather|rain|forecast|cold|temperature|storm/, 'skycast.av', 'SkyCast · 7-day forecast', 'Rain, lows, cold-night alerts.');

  /* ---------- AverMaps ---------- */
  B.SITES['avermaps.av'] = { n: 'AverMaps', icon: '🗺️', col: '#2f8f5b', mb: 2.5, tile: true, order: 6, render() {
    const A = SH.Atlas; if (!A) return B.card('Maps unavailable.');
    const D = A.data(), H = A.here();
    const near = D.places.filter((p) => p !== H).map((p) => [p, A.miles(H, p)]).sort((a, b) => a[1] - b[1]).slice(0, 8);
    const jy = (p) => ({ city: 'huge auto salvage yard', town: 'big junkyard', small: 'small scrapyard', village: 'a field of dead cars behind a farm' })[p.tier];
    return `${A.svg ? `<div style="border-radius:10px;overflow:hidden">${A.svg(D, H.id)}</div>` : ''}<div class="sech">NEAR ${esc(H.name.toUpperCase())}</div>${near.map(([p, mi]) => `<div class="setrow" style="font-size:12px"><b>${esc(p.name)}</b> · ${mi} mi · ${esc(A.TIERS[p.tier].n)}<br><span class="muted">🚙 ${jy(p)} · ${p.hasPolice ? '🚓 police' : '🤠 sheriff only'}${p.services.wifi.length ? ' · 📶 ' + esc(p.services.wifi[0]) : ''}</span></div>`).join('')}
      <div class="setrow" style="font-size:12px"><b>${esc(H.name)}</b> (here) · 🚙 ${jy(H)}</div><p class="muted" style="font-size:11px">Open the Atlas app to travel.</p>`;
  } };
  B.index(/map|direction|route|junk ?yard|scrap|salvage|how far|near me|town|village|city/, 'avermaps.av', 'AverMaps · places & junkyards near you', 'Distances, police, wifi, junkyards.');

  /* ---------- history ---------- */
  B.SITES['history.av'] = { n: 'History', icon: '🕘', col: '#444', mb: 0, render() {
    const h = hist();
    return `<div style="display:flex;justify-content:space-between;align-items:center"><b>History</b>${B.btn("SH.Browser.hist().length=0;SH.Phone.render()", 'Clear all')}</div><p class="muted" style="font-size:11px">Anyone who picks up your phone can read this.${NT.locked && NT.locked('browser') ? ' (Browser is App-Locked.)' : ''}</p>${h.map((x) => `<div class="setrow" style="font-size:12px">${B.lnk(x.url, esc(x.url))}<br><small class="muted">${SH.dateStr(x.t)} ${SH.fmt12(x.t)}</small></div>`).join('') || '<p class="muted">Empty.</p>'}`;
  } };

  P.extraApps = P.extraApps || [];
  P.extraApps.push({ at: 3, app: ['browser', '🌐', 'Browser', '#5e5ce6'] });
})(window.SH);
