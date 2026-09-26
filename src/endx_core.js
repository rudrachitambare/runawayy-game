/* SMALL HOURS — ending engine. Sits in front of SH.Endings.show: whenever the story reaches an ending, the engine
   builds a context (who's with you, where, weather, vehicle, money, days gone, family setup, skills…) and picks
   the MOST SPECIFIC matching ending from the registry. New systems can also trigger endings directly with
   SH.EndX.trigger(base, extra). Found endings are remembered across playthroughs (localStorage). */
(function (SH) {
  const EN = SH.Endings; if (!EN) return;
  const X = SH.EndX = { defs: [], KEY: 'smallhours_endings' };
  const G = () => SH.G;
  X.add = (list) => list.forEach((d) => { d.p = d.p || 1; X.defs.push(d); });

  /* ---------- context ---------- */
  X.ctx = function (base, extra) {
    const g = G(), M = SH.NPCS_META, nm = (id) => (M[id] || {}).n || id;
    const party = (g.party || []).filter((id) => M[id]);
    const partner = g.crush && g.crush.status === 'going' ? g.crush.id : null;
    const place = g.away && SH.Atlas ? SH.Atlas.here() : null;
    const w = SH.weatherDay ? SH.weatherDay() : {};
    const h = SH.hour();
    const c = {
      g, base, reason: g._foundReason || null, extra: extra || {},
      party, pn: party.map(nm), n: party.length, pl: party.length === 1 ? nm(party[0]) : party.length ? party.slice(0, -1).map(nm).join(', ') + ' and ' + nm(party[party.length - 1]) : '',
      partner, partnerN: partner ? nm(partner) : '', partnerWith: partner && party.includes(partner),
      place, tier: place ? place.tier : 'town', town: place ? place.name : 'Harlow', away: !!place,
      rain: /rain|storm/.test(w.c || ''), storm: w.c === 'storm', cold: (w.lo || 50) < 40, night: h >= 21 || h < 6, h,
      days: g.missingAt ? (g.t - g.missingAt) / 1440 : 0, run: g.phase === 'run' || !!g.missingAt,
      money: g.money || 0, bank: g.bank ? g.bank.bal : 0, frozen: !!(g.bank && g.bank.frozen),
      veh: g.veh || null, ride: g.lastRide || null, skill: (k) => ((g.skills || {})[k] || 0),
      burner: !!(g.net && g.net.x && g.net.x.burner), crew: g.crew || null, fund: g.fund || null,
      role: (g.fam && g.fam.role) || 'stepdad', rick: SH.nm('Rick'), mom: SH.nm('Mom'), momN: (g.fam && g.fam.mom) || 'Mom', sib: SH.nm('Lily'), gma: SH.nm('Grandma Rose'),
      rel: (id) => g.rel[id] || 0, f: (k) => SH.f(k), name: g.name || 'Sam',
      heat: g.heat || 0, notice: g.awayNotice || 0, poster: !!(g.flags && g.flags.sawPoster) || !!g.reported,
    };
    c.they = c.n ? (c.n === 1 ? c.pl : 'your friends') : '';
    c.withYou = c.n ? ` with ${c.pl}` : '';
    return c;
  };

  /* ---------- resolve ---------- */
  X.pick = function (base, c) {
    const cands = X.defs.filter((d) => d.on.includes(base) && (!d.w || safe(() => d.w(c))));
    if (!cands.length) return null;
    cands.sort((a, b) => b.p - a.p);
    const top = cands.filter((d) => d.p === cands[0].p);
    return top[Math.floor(Math.random() * top.length)];
  };
  const safe = (fn) => { try { return !!fn(); } catch (e) { return false; } };

  const bShow = EN.show;
  EN.show = function (key, title, sub, paras) {
    const g = G(); if (!g || g.ended || X._inner) return bShow.apply(this, arguments);
    try {
      const c = X.ctx(key), d = X.pick(key, c);
      if (d) { X._inner = true; try { return X.render(d, c); } finally { X._inner = false; } }
    } catch (e) { console.warn('EndX', e); }
    X.seen(key); return bShow.apply(this, arguments);
  };
  X.render = function (d, c) {
    let paras = d.x(c); paras = paras.filter(Boolean);
    X.seen(d.k);
    return bShow.call(EN, d.k, typeof d.t === 'function' ? d.t(c) : d.t, typeof d.sub === 'function' ? d.sub(c) : d.sub, paras);
  };
  /* direct trigger from new systems */
  X.trigger = function (base, extra) {
    const g = G(); if (!g || g.ended) return;
    const c = X.ctx(base, extra), d = X.pick(base, c);
    if (d) { X._inner = true; try { return X.render(d, c); } finally { X._inner = false; } }
    console.warn('EndX: no ending for', base); EN.found && EN.found('police');
  };
  const bFound = EN.found;
  EN.found = function (reason) { const g = G(); if (g) g._foundReason = reason; return bFound.apply(this, arguments); };

  /* ---------- tracker ---------- */
  X.seenList = () => { try { return JSON.parse(localStorage.getItem(X.KEY) || '[]'); } catch (e) { return []; } };
  X.seen = (k) => { const L = X.seenList(); if (!L.includes(k)) { L.push(k); try { localStorage.setItem(X.KEY, JSON.stringify(L)); } catch (e) {} } };
  X.total = () => { const s = new Set(X.defs.map((d) => d.k)); ['harbor', 'grandma', 'patel', 'call911', 'foundSafe', 'foundHome', 'foundMom', 'foundMomKnows', 'walkHome', 'garage', 'garageTold', 'collapse', 'empty', 'dex', 'dexNo', 'trainSafe', 'listened', 'quiet', 'friendFamily', 'reachedOut'].forEach((k) => s.add(k)); return s.size; };
  document.addEventListener('DOMContentLoaded', () => setTimeout(() => {
    const card = document.querySelector('#start .card, #start, .startcard'); if (!card) return;
    const foot = [...document.querySelectorAll('div')].find((d) => /endings/.test(d.textContent) && d.children.length === 0 && d.textContent.length < 220);
    if (foot) foot.textContent = foot.textContent.replace(/\d+ endings/, `${X.total()} endings (you've found ${X.seenList().length})`);
  }, 50));

  /* helpers for ending text */
  X.pick1 = (a) => a[Math.floor(Math.random() * a.length)];
})(window.SH);
