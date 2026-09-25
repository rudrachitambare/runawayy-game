/* SMALL HOURS — UI v2: HUD, character panel, grouped actions, richer story log, portrait dialogs,
   a living conversation screen, day cards with a recap of yesterday, stacked toasts, polished endings. */
(function (SH) {
  const $ = (s) => document.querySelector(s);
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const UI = SH.UI, PT = SH.Portrait;
  const U2 = SH.UI2 = { prev: null, prevHour: -1, trend: {} };

  /* ---------- icons (stroke SVG) ---------- */
  const IP = {
    map: 'M9 4 3 6v14l6-2 6 2 6-2V4l-6 2-6-2Zm0 0v14m6-12v14', save: 'M5 3h11l3 3v15H5zM8 3v6h8V3M8 21v-7h8v7', snd: 'M4 9h4l5-4v14l-5-4H4zM16 9a4 4 0 0 1 0 6M18.5 6.5a8 8 0 0 1 0 11', mute: 'M4 9h4l5-4v14l-5-4H4zM17 9l5 6m0-6-5 6',
    help: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18ZM9.5 9a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .9-1 1.6V14M12 17.5v.01', cash: 'M3 7h18v10H3zM12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM6 10v4m12-4v4', bag: 'M6 8h12l1 13H5zM9 8V6a3 3 0 0 1 6 0v2',
    bat: 'M3 8h15v8H3zM21 11v2', people: 'M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM2 21a7 7 0 0 1 14 0M17 3.5a4 4 0 0 1 0 7.5M22 21a7 7 0 0 0-4-6.3', clock: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18ZM12 7v5l3 2',
    pin: 'M12 21s-7-6.2-7-12a7 7 0 0 1 14 0c0 5.8-7 12-7 12Zm0-9a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z', eye: 'M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Zm10 3a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z', book: 'M4 4h6a2 2 0 0 1 2 2v14a2 2 0 0 0-2-2H4zM20 4h-6a2 2 0 0 0-2 2v14a2 2 0 0 1 2-2h6z',
  };
  const ic = (k, cls = '') => `<svg class="ic ${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="${IP[k]}"/></svg>`;
  U2.ic = ic;
  const DOW = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const COND = { clear: 'Clear', cloudy: 'Overcast', rain: 'Rain', storm: 'Thunderstorm', fog: 'Fog', drizzle: 'Drizzle', snow: 'Snow' };

  /* ---------- top HUD ---------- */
  function ribbon() { // the day as a strip of sky colours with a marker for now
    const st = [[0, '#0c1120'], [5.5, '#1b1a36'], [6.8, '#f2a65a'], [8.5, '#8fb5e6'], [16.5, '#9cc0ea'], [18, '#f28b66'], [19.3, '#3a2a4a'], [21, '#121830'], [24, '#0c1120']];
    return `linear-gradient(90deg,${st.map(([h, c]) => `${c} ${(h / 24 * 100).toFixed(1)}%`).join(',')})`;
  }
  UI.renderTop = function () {
    const G = SH.G, h = SH.hour(), wx = SH.weatherDay(SH.day()), cond = SH.cond();
    const wi = (SH.isDark() ? SH.WICON_NIGHT : SH.WICON)[cond];
    const t12 = SH.fmt12().split(' ');
    let miss = '';
    if (G.phase === 'run') { const hrs = Math.floor((G.t - G.missingAt) / 60), mm = Math.floor((G.t - G.missingAt) % 60); miss = `<span class="hchip alert" id="missingPill"><i class="dot"></i>${G.discoveredAt ? 'MISSING' : 'GONE'} ${hrs}h ${String(mm).padStart(2, '0')}m</span>`; }
    const bat = Math.round(G.phone.bat), batc = bat < 15 ? 'crit' : bat < 35 ? 'low' : '';
    $('#top').innerHTML = `<span class="brand"><span class="mark"></span><span class="bt">SMALL HOURS</span></span>
      <div class="hdate"><span class="dow">${DOW[SH.wd()]}</span><b>${SH.dateStr().replace(/^\w+,\s*/, '')}</b><span class="dayn">Day ${SH.day()}</span></div>
      <div class="hclock"><div class="ht"><b>${t12[0]}</b><small>${t12[1]}</small></div><div class="ribbon" style="background:${ribbon()}"><i style="left:${(h / 24 * 100).toFixed(2)}%"></i></div></div>
      <span class="hchip wx" title="${COND[cond] || cond} · high ${wx.hi}° / low ${wx.lo}°"><span class="wi">${wi}</span><b>${SH.tempF()}°</b><small class="hide-s">${COND[cond] || cond}</small></span>
      <span class="hchip cash hide-s" title="Cash on you">${ic('cash')}<b>$${G.money.toFixed(2)}</b></span>
      <span class="hchip bat ${batc} hide-s" title="Phone battery">${ic('bat')}<b>${G.phone.confiscated ? 'taken' : bat + '%'}</b></span>${miss}
      <span class="grow"></span>
      <button class="ibtn" id="mapBtn" title="Map [M]">${ic('map')}<span class="lbl">Map</span><kbd>M</kbd></button>
      <button class="ibtn" id="saveBtn" title="Save">${ic('save')}</button><button class="ibtn" id="sndBtn" title="Sound">${ic(SH.Audio.muted ? 'mute' : 'snd')}</button><button class="ibtn" id="helpBtn" title="How to play">${ic('help')}</button>`;
    $('#mapBtn').onclick = () => (SH.Map.open ? UI.closeMap() : UI.openMap());
    $('#saveBtn').onclick = () => UI.toast(SH.save() ? 'Saved.' : 'Saving is blocked in this preview. Download the file to keep progress.', 'save');
    $('#sndBtn').onclick = () => { SH.Audio.muted = !SH.Audio.muted; UI.renderTop(); };
    $('#helpBtn').onclick = () => UI.help();
  };

  /* ---------- left panel ---------- */
  const STATS = [['full', '🍽', 'Fullness', 1], ['energy', '⚡', 'Energy', 1], ['hyg', '🧼', 'Hygiene', 1], ['mood', '🙂', 'Mood', 1], ['stress', '💢', 'Stress', 0], ['health', '❤️', 'Health', 1]];
  const colr = (v, good) => { const q = good ? v : 100 - v; return q > 60 ? 'var(--ok)' : q > 30 ? 'var(--warn)' : 'var(--bad)'; };
  function headline(G) {
    const s = G.s, bits = [];
    if (s.full < 25) bits.push('starving'); else if (s.full < 45) bits.push('hungry');
    if (s.energy < 22) bits.push('exhausted'); else if (s.energy < 40) bits.push('tired');
    if (s.stress > 75) bits.push('panicky'); else if (s.stress > 55) bits.push('on edge');
    if (s.mood < 25) bits.push('hollow'); else if (s.mood > 70 && s.stress < 40) bits.push('actually okay');
    if (G.phase === 'run' && s.warmth < 35) bits.push('cold to the bone');
    if (!bits.length) return 'Holding it together.';
    const t = bits.slice(0, 2).join(' and '); return t.charAt(0).toUpperCase() + t.slice(1) + '.';
  }
  function trends(G) {
    const hr = Math.floor(G.t / 60);
    if (U2.prevHour !== hr) { if (U2.prev) STATS.forEach(([k]) => { const d = G.s[k] - U2.prev[k]; U2.trend[k] = Math.abs(d) < 3 ? 0 : d > 0 ? 1 : -1; }); U2.prev = Object.assign({}, G.s); U2.prevHour = hr; }
  }
  UI.renderSide = function () {
    const G = SH.G, s = G.s; trends(G);
    const relIds = ['mom', 'rick', 'lily', 'jordan', 'grandma', 'okafor'].concat(SH.f('metWren') ? ['wren'] : []).concat(G.done && G.done.dolores ? ['dolores'] : []).concat(G.rel.patel != null && SH.f('foundNewton') ? ['patel'] : []);
    const needs = STATS.map(([k, i, n, good]) => { const v = s[k], tr = U2.trend[k] || 0, crit = good ? v <= 15 : v >= 80;
      return `<div class="need ${crit ? 'crit' : ''}" title="${n}"><span class="ni">${i}</span><div class="nb"><div class="nl"><span>${n}</span><em>${UI.statWord(i + ' ' + n, v)}${tr ? `<i class="tr ${(tr > 0) === !!good ? 'up' : 'dn'}">${tr > 0 ? '▲' : '▼'}</i>` : ''}</em></div><div class="trk"><div class="fil" style="width:${v}%;background:${colr(v, good)}"></div></div></div></div>`; }).join('')
      + (G.phase === 'run' || !SH.locIndoor() ? (() => { const v = s.warmth; return `<div class="need ${v <= 15 ? 'crit' : ''}"><span class="ni">🌡</span><div class="nb"><div class="nl"><span>Warmth</span><em>${UI.statWord('🌡 Warmth', v)}</em></div><div class="trk"><div class="fil" style="width:${v}%;background:${colr(v, 1)}"></div></div></div></div>`; })() : '');
    const meter = G.phase === 'run' ? `<div class="card status run"><h4>${ic('eye')} Out there</h4><p>${UI.heatLine(G)}</p></div>` : `<div class="card status"><h4>${ic('eye')} At home</h4><p>${UI.suspLine(G.susp)}</p></div>`;
    const tiles = [[ic('cash'), '$' + G.money.toFixed(2), 'on you'], G.phase === 'home' ? ['📦', '$' + G.shoebox, 'shoebox'] : null, [ic('bat'), G.phone.confiscated ? '—' : Math.round(G.phone.bat) + '%', G.phone.share ? 'sharing location' : 'phone'], ['🫁', SH.has('inhaler') ? G.puffs + ' puffs' : 'none!', 'inhaler'], ['📚', UI.gradeWord(G.grades), 'grades']].filter(Boolean);
    const w = SH.bagWeight(), cap = SH.BAG_CAP;
    $('#left').innerHTML = `<div class="card me"><div class="mept">${PT.svg('sam', { mood: PT.moodOf('sam') })}</div><div class="mei"><h3>${esc(G.name)}</h3><small>12 · 7th grade${G.story && G.story.trait && SH.Story && SH.Story.TRAITS[G.story.trait] ? ' · ' + esc(SH.Story.TRAITS[G.story.trait].n.replace(/^The /, '')) : ''}</small><p>${headline(G)}</p></div></div>
      <div class="card needs">${needs}</div>
      ${UI.today()}${meter}
      <div class="tiles">${tiles.map(([i, v, l], n) => `<div class="tile ${l === 'inhaler' && v === 'none!' ? 'warn' : ''} ${n >= 3 ? (tiles.length === 4 ? 'w6' : 'w3') : ''}"><span class="ti">${i}</span><b>${v}</b><small>${l}</small></div>`).join('')}</div>
      <div class="card"><h4>${ic('bag')} Backpack <span class="hsub">${w.toFixed(1)} / ${cap} kg</span></h4><div class="wbar"><i style="width:${Math.min(100, w / cap * 100)}%;${w / cap > 0.85 ? 'background:var(--warn)' : ''}"></i></div>
        <div class="inv2">${G.bag.map((id) => `<button class="item" data-id="${id}" title="${esc(SH.ITEMS[id].d)}"><span>${SH.ITEMS[id].i}</span><small>${esc(SH.ITEMS[id].n)}</small></button>`).join('') || '<p class="muted">Empty.</p>'}</div></div>
      <div class="card"><h4>${ic('people')} People</h4>${relIds.map((id) => `<button class="prow" data-p="${id}">${PT.svg(id, { mood: PT.moodOf(id) })}<span class="pn">${esc(SH.NPCS_META[id].n)}</span><small>${esc(SH.relWord ? SH.relWord(id) : '')}</small></button>`).join('')}</div>`;
    $('#left').querySelectorAll('.item').forEach((el) => (el.onclick = () => { if (UI.modalOpen() || G.ended) return; SH.Actions.useItem(el.dataset.id); }));
    $('#left').querySelectorAll('.prow').forEach((el) => (el.onclick = () => { SH.Phone.open('person', el.dataset.p); SH.Mobile && SH.Mobile.is() && SH.Mobile.tab('phone'); }));
    UI.renderTop();
  };

  /* ---------- actions: grouped, iconed, with time/cost pills ---------- */
  const AIC = [[/sleep|nap|bed\b|lie down/i, '😴'], [/draw|sketch|\bart\b|commission/i, '✏️'], [/homework|study|read|book|library/i, '📚'], [/skyforge|console|game/i, '🎮'], [/pack|backpack/i, '🎒'], [/shoebox|savings|stash/i, '📦'], [/wait|sit|rest/i, '⏳'],
    [/eat|food|snack|breakfast|lunch|dinner|cook|cereal|fridge|pie|burger|pancake/i, '🍽️'], [/shower|bath|wash|laundry|brush/i, '🧼'], [/walk|river|stroll/i, '🚶'], [/bus|greyline|board/i, '🚌'], [/train|ticket|platform|depart/i, '🚆'], [/call|phone/i, '📞'], [/text|message/i, '💬'],
    [/talk|ask|tell|say|visit|hang out|knock/i, '🗣️'], [/buy|shop|store|vending|purchase/i, '🛒'], [/sell|stand|candy|lemonade|cocoa/i, '💵'], [/rake|leaves|flyer|car wash|groceries|cans|shelv|work|job/i, '🧹'], [/tv|watch/i, '📺'], [/hide|sneak|slip/i, '🫥'], [/go home|walk up to the front door|home/i, '🏠'], [/police|officer/i, '👮'], [/help|shelter|harbor/i, '🏮'], [/dog|newton|cat/i, '🐾'], [/look|read|board|check/i, '👀']];
  const pick = (label) => { for (const [re, i] of AIC) if (re.test(label)) return i; return '•'; };
  const baseRA = UI.renderActions;
  UI.renderActions = function () {
    baseRA.apply(this, arguments);
    const el = $('#actions'), grid = el.querySelector('.agrid'); if (!grid) return;
    const btns = [...grid.querySelectorAll('button.act')];
    const groups = { now: [], people: [], work: [], leave: [] };
    btns.forEach((b) => {
      const small = b.querySelector('small'), kbd = b.querySelector('kbd'); const lab = [...b.childNodes].filter((n) => n.nodeType === 3).map((n) => n.textContent).join('').trim();
      const clean = lab.replace(/^💼\s*/, '');
      b.innerHTML = ''; if (kbd) b.appendChild(kbd);
      const i = document.createElement('span'); i.className = 'aic'; i.textContent = lab.startsWith('💼') ? '💼' : pick(clean); b.appendChild(i);
      const body = document.createElement('span'); body.className = 'abody'; body.innerHTML = `<span class="al">${esc(clean)}</span>`; b.appendChild(body);
      if (small) { const sub = small.textContent; const tm = sub.match(/(\d+(?:\.\d+)?\s?(?:min|mins|hr|hrs|hour|hours))\b/i), cost = sub.match(/\$\d+(?:\.\d\d)?/); let rest = sub; [tm && tm[0], cost && cost[0]].forEach((p) => { if (p) rest = rest.replace(p, ''); }); rest = rest.replace(/^[\s·,]+|[\s·,]+$/g, '').replace(/\s*·\s*·\s*/g, ' · ');
        if (rest) { const s2 = document.createElement('small'); s2.textContent = rest; body.appendChild(s2); }
        if (tm || cost) { const pills = document.createElement('span'); pills.className = 'pills'; pills.innerHTML = (tm ? `<i class="pill t">${ic('clock')}${esc(tm[0].replace(/hours?/, 'h').replace(/mins?/, 'm').replace(/\s/g, ''))}</i>` : '') + (cost ? `<i class="pill c">${esc(cost[0])}</i>` : ''); b.appendChild(pills); } }
      const cls = b.className;
      if (/\bjob\b/.test(cls)) groups.work.push(b); else if (/^(Talk to|Call|Text|Ask|Visit|Hang out|Knock|Sit with|Find)/i.test(clean)) groups.people.push(b); else if (/\b(hot|safe)\b/.test(cls) || /run away|leave for good|slip onto|board the|walk up to the front door/i.test(clean)) groups.leave.push(b); else groups.now.push(b);
    });
    const G = SH.G, L = SH.LOC[G.loc];
    const title = { now: G.phase === 'home' && G.loc === 'home' ? 'At home' : 'Here', people: 'People', work: 'Work & money', leave: G.phase === 'run' ? 'Big choices' : 'Choices that matter' };
    const wrap = document.createElement('div'); wrap.className = 'agroups';
    ['leave', 'now', 'people', 'work'].forEach((k) => { if (!groups[k].length) return; const sec = document.createElement('section'); sec.className = 'ag ' + k; sec.innerHTML = `<h5>${title[k]}</h5>`; const g2 = document.createElement('div'); g2.className = 'agrid'; groups[k].forEach((b) => g2.appendChild(b)); sec.appendChild(g2); wrap.appendChild(sec); });
    grid.replaceWith(wrap);
    // keep keyboard numbers in visual order
    [...wrap.querySelectorAll('button.act')].forEach((b, n) => { const k = b.querySelector('kbd'); if (k) k.textContent = n < 9 ? n + 1 : ''; else if (n < 9) { const kk = document.createElement('kbd'); kk.textContent = n + 1; b.prepend(kk); } b.dataset.vis = n; });
    const lk = el.querySelector('.looks .lk'); if (lk) lk.innerHTML = `${ic('eye')} Look around`;
  };
  // number keys follow the new visual order
  document.addEventListener('keydown', (e) => {
    if (!SH.G || UI.modalOpen() || /INPUT|TEXTAREA/.test((document.activeElement || {}).tagName || '') || !/^[1-9]$/.test(e.key)) return;
    const b = document.querySelector(`#actions button.act[data-vis="${+e.key - 1}"]`); if (b && !b.disabled) { e.stopImmediatePropagation(); e.preventDefault(); b.click(); }
  }, true);

  /* ---------- story log ---------- */
  const LIC = { good: '✦', bad: '▲', sys: '', warn: '!', day: '' };
  let lastStamp = '', newBatch = false;
  function para(text, cls, t) {
    const p = document.createElement('div'); p.className = 'le ' + (cls || '');
    if (cls === 'day') { p.innerHTML = `<div class="chap">${text}</div>`; lastStamp = ''; return p; }
    const stamp = t != null ? SH.fmt12(t) : ''; const show = stamp && stamp !== lastStamp; lastStamp = stamp;
    p.innerHTML = `<span class="ts">${show ? stamp.replace(' ', '<br>') : ''}</span><span class="lt"></span>`; p.querySelector('.lt').textContent = text; return p;
  }
  UI.log = function (text, cls = '') {
    text = SH.nm(text); const G = SH.G, l = $('#log'); if (!l) return;
    if (l.children.length > 160) for (let k = 0; k < 20; k++) l.firstElementChild && l.firstElementChild.remove();
    G.log.push([text, cls, G.t]); if (G.log.length > 140) G.log.shift();
    if (newBatch) { l.querySelectorAll('.le.fresh').forEach((e) => e.classList.remove('fresh')); newBatch = false; }
    const p = para(text, cls, G.t); p.classList.add('fresh', 'in'); l.appendChild(p); l.scrollTop = l.scrollHeight;
    if (cls === 'day' && !G._booting && !/Rewound|You leave/.test(text)) U2.dayCard(text);
  };
  UI.restoreLog = function () { const l = $('#log'); l.innerHTML = ''; lastStamp = ''; SH.G.log.forEach(([t, c, tm]) => l.appendChild(para(t, c, tm))); l.scrollTop = l.scrollHeight; };
  const baseAfter = UI.afterAction; UI.afterAction = function () { const r = baseAfter.apply(this, arguments); newBatch = true; return r; };

  /* ---------- day card + recap ---------- */
  const rec = () => { const G = SH.G; G.ui2 = G.ui2 || { talked: {}, places: {} }; return G.ui2; };
  const baseTravel = SH.travel; SH.travel = function (to) { const R2 = rec(), d = SH.day(); (R2.places[d] = R2.places[d] || []); if (!R2.places[d].includes(to)) R2.places[d].push(to); return baseTravel.apply(this, arguments); };
  const baseTalk = SH.Talk.open; SH.Talk.open = function (npc) { const R2 = rec(), d = SH.day(); (R2.talked[d] = R2.talked[d] || []); if (!R2.talked[d].includes(npc)) R2.talked[d].push(npc); const r = baseTalk.apply(this, arguments); U2.talkDress(npc); return r; };
  U2.dayCard = function (html) {
    const G = SH.G, d = SH.day(), y = d - 1, W = SH.weatherDay(d), cond = W.c || SH.cond(), R2 = rec();
    const tx = (G.tx || []).filter((t) => SH.day(t.t) === y); const inc = tx.filter((t) => t.a > 0).reduce((a, t) => a + t.a, 0), out = -tx.filter((t) => t.a < 0).reduce((a, t) => a + t.a, 0);
    const talked = (R2.talked[y] || []).filter((n) => SH.NPCS_META[n]); const places = (R2.places[y] || []).filter((p) => SH.LOC[p]).map((p) => SH.LOC[p].name);
    const tmp = document.createElement('div'); tmp.innerHTML = html; const sub = tmp.querySelector('small'); const subT = sub ? sub.textContent : ''; if (sub) sub.remove();
    const el = document.createElement('div'); el.id = 'daycard';
    el.innerHTML = `<div class="dc"><div class="dcn">Day ${d}</div><div class="dcd">${esc(tmp.textContent.trim())}</div><div class="dcw"><span>${(SH.WICON || {})[cond] || ''}</span> ${W.hi}° / ${W.lo}° · ${COND[cond] || cond}${G.phase === 'home' && SH.MOM_SHIFTS ? ' · Mom: ' + ({ D: 'day shift', E: 'evening shift', N: 'night shift', DD: 'a double', OFF: 'day off' }[SH.MOM_SHIFTS[d]] || '—') : ''}</div>${subT ? `<p class="dcs">${esc(subT)}</p>` : ''}
      ${y >= 1 && (talked.length || places.length || inc || out) ? `<div class="dcr"><h6>Yesterday</h6>${talked.length ? `<div class="dcp">${talked.slice(0, 6).map((n) => `<span title="${esc(SH.NPCS_META[n].n)}">${PT.svg(n, { mood: PT.moodOf(n) })}</span>`).join('')}<small>talked to ${talked.map((n) => esc(SH.NPCS_META[n].n)).slice(0, 4).join(', ')}</small></div>` : ''}${places.length ? `<div class="dcl">${ic('pin')} ${esc(places.slice(0, 5).join(' · '))}</div>` : ''}${inc || out ? `<div class="dcl">${ic('cash')} ${inc ? `<b class="pos">+$${inc.toFixed(2)}</b>` : ''} ${out ? `<b class="neg">−$${out.toFixed(2)}</b>` : ''}</div>` : ''}</div>` : ''}
      <small class="dck">tap to continue</small></div>`;
    const old = $('#daycard'); if (old) old.remove(); document.body.appendChild(el);
    const kill = () => { el.classList.add('out'); setTimeout(() => el.remove(), 450); };
    el.onclick = kill; setTimeout(kill, 4200);
  };

  /* ---------- toasts ---------- */
  UI.toast = function (t) {
    let box = $('#toasts'); if (!box) { box = document.createElement('div'); box.id = 'toasts'; document.body.appendChild(box); }
    const e = document.createElement('div'); e.className = 'toast2'; e.textContent = t; box.appendChild(e);
    while (box.children.length > 3) box.firstElementChild.remove();
    setTimeout(() => { e.classList.add('out'); setTimeout(() => e.remove(), 400); }, 2800);
  };

  /* ---------- dialogs: scene header + portrait ---------- */
  const sceneShot = () => { try { SH.Scene.draw(performance.now() / 1000); } catch (e) {} try { const c = SH.Scene.c; return c && c.width ? c.toDataURL('image/jpeg', 0.72) : ''; } catch (e) { return ''; } };
  const baseDialog = UI.dialog;
  UI.dialog = function (o) {
    const r = baseDialog.apply(this, arguments);
    const md = $('#modal'), box = md.querySelector('.mbox'); if (!box) return r;
    box.classList.add('dlg');
    const img = SH.G && SH.G.away ? null : sceneShot(); if (img) { const sc = document.createElement('div'); sc.className = 'mscene'; sc.style.backgroundImage = `url(${img})`; sc.innerHTML = `<span class="mloc">${ic('pin')} ${esc(SH.LOC[SH.G.loc] ? SH.LOC[SH.G.loc].name : '')}</span>`; box.prepend(sc); }
    const av = box.querySelector('.mhead .av'); if (av && o.who && PT.has(o.who)) { const n = document.createElement('div'); n.className = 'mpt'; n.innerHTML = PT.svg(o.who, { mood: o.mood || PT.moodOf(o.who) }); av.replaceWith(n); box.classList.add('haswho'); }
    box.querySelectorAll('.mtext p').forEach((p, i) => { p.style.animationDelay = (i * 0.12) + 's'; });
    return r;
  };

  /* ---------- conversations ---------- */
  const VIBE = { neutral: ['listening', 'waiting to see where this goes', 'hard to read'], warm: ['softening', 'smiling a little', 'leaning in'], guarded: ['arms crossed', 'guarded', 'giving you nothing'], angry: ['jaw tight', 'getting angry', 'done with this'], worried: ['worried about you', 'really listening now', 'very still'], sad: ['quiet', 'eyes down'], tired: ['running on empty', 'tired'] };
  U2.talkMood = function (m) { const c = SH.Talk.cur; if (!c) return; c.face = m; const p = $('#tpt'), v = $('#tvibe'); if (p) p.innerHTML = PT.svg(c.npc, { mood: m }); if (v) { const a = VIBE[m] || VIBE.neutral; v.textContent = a[Math.floor(Math.random() * a.length)]; v.dataset.m = m; } };
  U2.talkDress = function (npc) {
    const md = $('#modal'), box = md.querySelector('.mbox'); if (!box || !$('#tlog')) return;
    box.classList.add('talkbox'); const m = SH.NPCS_META[npc] || {};
    const stage = document.createElement('div'); stage.className = 'tstage';
    const img = sceneShot(); if (img) stage.style.backgroundImage = `linear-gradient(180deg,rgba(11,14,20,.2),rgba(11,14,20,.95)),url(${img})`;
    stage.innerHTML = `<div class="tpt" id="tpt"></div><div class="tname">${esc(m.n || npc)}</div><div class="tfull">${esc(m.full || '')}</div><div class="tvibe" id="tvibe"></div>`;
    const head = box.querySelector('.mhead'); if (head) head.classList.add('thead');
    const body = document.createElement('div'); body.className = 'tmain'; [...box.children].forEach((ch) => body.appendChild(ch));
    box.appendChild(stage); box.appendChild(body);
    U2.talkMood(PT.has(npc) ? PT.moodOf(npc) : 'neutral');
    [...box.querySelectorAll('#tlog .tl')].forEach(dress);
  };
  function dress(d) {
    const c = SH.Talk.cur; if (!c || d.dataset.dz) return; d.dataset.dz = 1;
    if (d.classList.contains('npc') && PT.has(c.npc)) { d.insertAdjacentHTML('afterbegin', `<span class="tav">${PT.svg(c.npc, { mood: c.face || 'neutral' })}</span>`); }
    if (d.classList.contains('me')) d.insertAdjacentHTML('beforeend', `<span class="tav me">${PT.svg('sam', { mood: PT.moodOf('sam') })}</span>`);
  }
  const T = SH.Talk, baseLine = T.line;
  T.line = function (who) { const l = $('#tlog'); if (l && who !== 'me') l.querySelectorAll('.tl.typing').forEach((e) => e.remove()); const r = baseLine.apply(this, arguments); if (l && l.lastElementChild) dress(l.lastElementChild); return r; };
  const baseSay = T.say;
  T.say = function () {
    const c = T.cur, inp = $('#tin'), text = inp ? inp.value.trim() : '';
    if (c && text) { const an = SH.NLP.analyze(text); c._pend = an.has('selfharm') || an.has('disclose') || (an.honest && (an.has('scared') || an.has('sad'))) ? 'worried' : an.has('hostile') ? 'angry' : null; }
    const r = baseSay.apply(this, arguments);
    const l = $('#tlog'); if (c && text && l && !c.ended) { const d = document.createElement('div'); d.className = 'tl npc typing'; d.innerHTML = '<i></i><i></i><i></i>'; l.appendChild(d); l.scrollTop = l.scrollHeight; }
    return r;
  };
  const baseFx = UI.applyFx;
  UI.applyFx = function (npc, r) {
    const out = baseFx.apply(this, arguments); const c = T.cur;
    if (c && c.npc === npc && r && r.fx && ('rel' in r.fx || 'stress' in r.fx)) { const rel = r.fx.rel || 0; let m = c._pend || (rel >= 2 ? 'warm' : rel <= -4 ? 'angry' : rel < 0 ? 'guarded' : (c.face || 'neutral'));
      if (npc === 'rick' && SH.rickDrunk && SH.rickDrunk() >= 2 && m === 'warm') m = 'neutral'; setTimeout(() => U2.talkMood(m), 380); }
    return out;
  };

  /* ---------- endings: portraits beside each epilogue ---------- */
  window.addEventListener('DOMContentLoaded', () => {
    const EN = SH.Endings, baseShow = EN.show; const byName = {}; Object.keys(SH.NPCS_META).forEach((k) => (byName[SH.NPCS_META[k].n] = k));
    EN.show = function () {
      const r = baseShow.apply(this, arguments); const box = document.querySelector('#modal .mbox'); if (!box) return r; box.classList.add('endbox');
      box.querySelectorAll('p > b:first-child').forEach((b) => { const id = byName[b.textContent.replace(/\.$/, '')]; if (id && PT.has(id)) { const p = b.parentElement; p.classList.add('epi'); p.insertAdjacentHTML('afterbegin', `<span class="epipt">${PT.svg(id, { mood: PT.moodOf(id) })}</span>`); } });
      const img = sceneShot(); if (img) box.style.setProperty('--endimg', `url(${img})`);
      return r;
    };
  });
})(window.SH);

/* v2.1: keep HUD/side in sync whenever time moves, whatever moved it */
(function () {
  const SH = window.SH, adv = SH.advance; let q = 0;
  SH.advance = function () { const r = adv.apply(this, arguments); if (!q) { q = requestAnimationFrame(() => { q = 0; try { SH.UI.renderTop(); SH.UI.renderSide(); } catch (e) {} }); } return r; };
})();
