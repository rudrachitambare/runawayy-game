/* SMALL HOURS — UI */
(function (SH) {
  const $ = (s) => document.querySelector(s);
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const UI = SH.UI = {};
  const ROOMN = { bedroom: '🛏 Your room', kitchen: '🍳 Kitchen', living: '📺 Living room', bathroom: '🚿 Bathroom' };

  UI.log = function (text, cls = '') {
    text = SH.nm(text);
    const lg = document.querySelector('#log'); if (lg && lg.children.length > 140) for (let k = 0; k < 20; k++) lg.firstElementChild && lg.firstElementChild.remove();
    const G = SH.G; G.log.push([text, cls]); if (G.log.length > 120) G.log.shift();
    const p = document.createElement('p'); p.className = cls; if (cls === 'day') p.innerHTML = text; else p.textContent = text;
    const l = $('#log'); l.appendChild(p); l.scrollTop = l.scrollHeight;
  };
  UI.restoreLog = function () { const l = $('#log'); l.innerHTML = ''; SH.G.log.forEach(([t, c]) => { const p = document.createElement('p'); p.className = c; if (c === 'day') p.innerHTML = t; else p.textContent = t; l.appendChild(p); }); l.scrollTop = l.scrollHeight; };
  UI.toast = function (t) { const e = $('#toast'); e.textContent = t; e.classList.add('show'); clearTimeout(UI._tt); UI._tt = setTimeout(() => e.classList.remove('show'), 2600); };
  UI.modalOpen = () => !$('#modal').classList.contains('hidden');

  UI.dialog = function (o) {
    o.text = (o.text || []).map(SH.nm); (o.choices || []).forEach((c) => { c.t = SH.nm(c.t); c.sub = SH.nm(c.sub); });
    const md = $('#modal'); md.classList.remove('hidden');
    const m = o.who ? SH.NPCS_META[o.who] : null;
    const ch = (o.choices || []).filter((c) => !c.cond || c.cond());
    md.innerHTML = `<div class="mbox"><div class="mhead">${m ? `<div class="av" style="background:${m.col}">${m.ini}</div>` : ''}<div><h3>${esc(o.title)}</h3><small>${SH.fmt12()} · ${SH.dateStr()}</small></div></div>
      <div class="mtext">${(Array.isArray(o.text) ? o.text : [o.text]).map((p) => `<p>${o.html ? p : esc(p)}</p>`).join('')}</div>
      <div class="mchoices">${ch.map((c, i) => `<button class="act ${c.cls || ''}" data-i="${i}"><kbd>${i + 1}</kbd>${esc(c.t)}${c.sub ? `<small>${esc(c.sub)}</small>` : ''}</button>`).join('')}</div></div>`;
    md.querySelectorAll('.mchoices button').forEach((b) => (b.onclick = () => {
      const c = ch[+b.dataset.i]; md.classList.add('hidden'); md.innerHTML = ''; SH.Audio.click();
      c.fn && c.fn(); if (!UI.modalOpen()) UI.afterAction(); else UI.renderAll();
    }));
  };

  UI.applyFx = function (npc, r) {
    const fx = r.fx || {};
    if (fx.rel) SH.rel(npc, fx.rel); if (fx.stress) SH.st('stress', fx.stress); if (fx.mood) SH.st('mood', fx.mood);
    (r.flags || []).forEach((f) => SH.flag(f));
    if (r.give && !SH.has(r.give)) SH.addBag(r.give, true);
    if (r.food) SH.st('full', r.food);
    if (SH.f('knowsHarbor')) UI.revealHarbor();
  };
  UI.revealHarbor = function () { if (SH.LOC.harbor.hidden && SH.f('knowsHarbor')) { SH.LOC.harbor.hidden = false; UI.toast('🏮 Harbor House added to your map.'); } };

  /* ---------- render ---------- */
  UI.renderTop = function () {
    const G = SH.G, h = SH.hour();
    const wi = (SH.isDark() ? SH.WICON_NIGHT : SH.WICON)[SH.cond()];
    const dayLabel = G.phase === 'home' ? `Day ${SH.day()}` : G.phase === 'run' ? `Day ${SH.day()}` : '';
    let miss = '';
    if (G.phase === 'run') { const hrs = Math.floor((G.t - G.missingAt) / 60), mm = Math.floor((G.t - G.missingAt) % 60); miss = `<span class="pill" id="missingPill">${G.discoveredAt ? 'MISSING' : 'GONE'} · ${hrs}h ${mm}m</span>`; }
    $('#top').innerHTML = `<span class="brand">SMALL HOURS</span><span class="pill"><b>${SH.dateStr()}</b> · ${dayLabel}</span><span class="pill" style="font-size:15px"><b>${SH.fmt12()}</b></span>
      <span class="pill">${wi} ${SH.tempF()}°F / ${SH.toC(SH.tempF())}°C</span>${miss}<span class="grow"></span>
      <button class="btn" id="mapBtn">🗺 Map <small style="color:var(--muted)">[M]</small></button><button class="btn" id="saveBtn">💾</button><button class="btn" id="sndBtn">${SH.Audio.muted ? '🔇' : '🔊'}</button><button class="btn" id="helpBtn">?</button>`;
    $('#mapBtn').onclick = () => (SH.Map.open ? UI.closeMap() : UI.openMap());
    $('#saveBtn').onclick = () => UI.toast(SH.save() ? 'Saved.' : 'Saving is blocked in this preview. Download the file to keep progress.');
    $('#sndBtn').onclick = () => { SH.Audio.muted = !SH.Audio.muted; UI.renderTop(); };
    $('#helpBtn').onclick = () => UI.help();
  };
  const bar = (label, v, col, inv) => `<div class="bar ${(col === badc ? v >= 80 : v <= 15) ? 'crit' : ''}" title="${label.replace(/^\S+\s/, '')}: ${Math.round(v)}/100"><div class="lbl"><span>${label}</span><span class="bw">${UI.statWord(label, v)}</span></div><div class="trk"><div class="fil" style="width:${v}%;background:${typeof col === 'function' ? col(v) : col}"></div></div></div>`;
  const SW = { Fullness: ['starving', 'hungry', 'peckish', 'fed', 'stuffed'], Energy: ['running on fumes', 'exhausted', 'tired', 'okay', 'wired'], Hygiene: ['you can smell yourself', 'grubby', 'fine', 'clean', 'fresh'],
    Mood: ['hollow', 'low', 'meh', 'alright', 'good'], Stress: ['calm', 'okay', 'tense', 'wound tight', 'can\'t breathe'], Health: ['sick', 'unwell', 'run-down', 'fine', 'strong'], Warmth: ['freezing', 'shivering', 'chilly', 'fine', 'toasty'] };
  UI.statWord = (label, v) => { const k = label.replace(/^\S+\s/, ''), w = SW[k]; return w ? w[Math.min(4, Math.floor(v / 20.01))] : Math.round(v); };
  UI.suspLine = (v) => v < 15 ? 'Home feels normal. Nobody\'s looking at you twice.' : v < 35 ? 'Mom gave you a long look at dinner.' : v < 55 ? 'Mom keeps asking "where were you?" and checking your location.' : v < 75 ? 'The house is watching you. Rick too.' : 'Everyone is on edge. One more thing and it all blows up.';
  UI.heatLine = (G) => !G.discoveredAt ? 'Nobody knows you\'re gone. Yet.' : !G.reported ? 'They know. Your phone keeps lighting up.' : G.heat < 40 ? 'There\'s a police report. Your photo is out there.' : G.heat < 70 ? 'People are looking. You catch a man in a bus shelter glance at you, then at his phone.' : 'Your face is everywhere. Every car slowing down makes your heart stop.';
  UI.gradeWord = (g) => g < 35 ? 'failing' : g < 50 ? 'slipping' : g < 65 ? 'getting by' : g < 80 ? 'decent' : 'good';
  const good = (v) => (v > 60 ? '#7bd88f' : v > 30 ? '#f5c77e' : '#e05260');
  const badc = (v) => (v < 40 ? '#7bd88f' : v < 70 ? '#f5c77e' : '#e05260');
  UI.today = function () {
    const G = SH.G, h = SH.hour(), d = SH.day(), rows = [];
    const R = (i, t) => rows.push(`<div class="trow"><span>${i}</span><span>${t}</span></div>`);
    if (G.phase === 'home') {
      const shift = { D: 'day shift, 7–3', E: 'evening shift, 3–11', N: 'night shift, 11pm–7', DD: 'double, 7am–11pm', OFF: 'day off' }[SH.MOM_SHIFTS[d]] || '—';
      R('🏫', SH.isWeekday() ? (h < 15 ? 'School 8:00–3:00' + (h >= 8 && G.loc !== 'school' ? ' · <b class="lateflag">you\'re missing it</b>' : '') : 'School\'s out') : 'No school today');
      R('👩', 'Mom: ' + shift);
      const rd = (SH.RICK_DAY && SH.RICK_DAY[Math.min(d, SH.RICK_DAY.length - 1)]) || 0;
      R('🍺', 'Rick tonight: ' + ['probably okay', 'grumpy', 'drinking', '<b style="color:#ff9aa5">bad night brewing</b>'][rd]);
      if (G.s.full < 30) R('🍽', '<b style="color:#f5c77e">You need to eat.</b>');
      else if (G.s.energy < 20) R('😴', '<b style="color:#f5c77e">You need sleep.</b>');
      if (SH.f('dexOffer') && !SH.f('dexBlocked')) R('⚠️', '<span style="color:#ff9aa5">dex_19 wants to meet. PIP has thoughts.</span>');
    } else if (G.phase === 'run') {
      const W = SH.weatherDay(d + (h > 12 ? 1 : 0));
      R('🌡', `Tonight's low: ${W.lo}°F${W.lo < 36 ? ' · <b style="color:#9ecbff">frost</b>' : ''}`);
      R('🛏', SH.f('knowsHarbor') ? 'Harbor House: 212 Wharf St, open 24/7' : 'No safe place to sleep yet');
      if (G.pickup) R('⏳', { grandma: 'Grandma', mom: 'Mom', harbor: 'Harbor House van', dex: 'dex_19' }[G.pickup.by] + ' ~' + SH.fmt12(G.pickup.at));
      const nb = SH.Run && SH.Run.nextBus && SH.Run.nextBus(); if (nb) R('🚌', 'Next Greyline: ' + SH.fmt12(Math.floor(nb) * 60 + Math.round((nb % 1) * 60) + (d - 1) * 1440));
      R('🔋', `Phone ${Math.round(G.phone.bat)}%${G.phone.share ? ' · <b style="color:#9ecbff">location visible to Mom</b>' : ''}`);
    }
    return `<div class="sect today"><h4>Today</h4>${rows.join('')}</div>`;
  };
  UI.renderSide = function () {
    const G = SH.G, s = G.s;
    const hearts = (v) => { const n = Math.round((v + 100) / 40); return '<span class="hearts" style="color:' + (v > 30 ? '#e98ab0' : v > -10 ? '#aaa' : '#e05260') + '">' + '♥'.repeat(n) + '<span style="opacity:.2">' + '♥'.repeat(5 - n) + '</span></span>'; };
    const relIds = ['mom', 'rick', 'lily', 'jordan', 'grandma', 'okafor'].concat(SH.f('metWren') ? ['wren'] : []).concat(G.done.dolores ? ['dolores'] : []);
    const meter = G.phase === 'run'
      ? `<div class="sect"><h4>Out there</h4><div class="dieg">${UI.heatLine(G)}</div></div>`
      : `<div class="sect"><h4>At home</h4><div class="dieg">${UI.suspLine(G.susp)}</div></div>`;
    $('#left').innerHTML = `<div class="sect"><h4>${esc(G.name)}, 12</h4>
      ${bar('🍽 Fullness', s.full, good)}${bar('⚡ Energy', s.energy, good)}${bar('🧼 Hygiene', s.hyg, good)}${bar('🙂 Mood', s.mood, good)}${bar('💢 Stress', s.stress, badc)}${bar('❤️ Health', s.health, good)}
      ${G.phase === 'run' || !SH.locIndoor() ? bar('🌡 Warmth', s.warmth, good) : ''}</div>
      ${UI.today()}${meter}
      <div class="sect"><h4>Cash · $${G.money.toFixed(2)} ${G.phase === 'home' ? `<span style="text-transform:none;letter-spacing:0">(+$${G.shoebox} shoebox)</span>` : ''}</h4>
      <div style="font-size:12px;color:var(--muted)">📱 ${Math.round(G.phone.bat)}%${G.phone.share ? ' · 📍 sharing on' : ''} · grades ${UI.gradeWord(G.grades)}</div></div>
      <div class="sect"><h4>Backpack · ${SH.bagWeight().toFixed(1)}/${SH.BAG_CAP} kg</h4><div class="inv">${G.bag.map((id, i) => `<div class="invi" data-id="${id}" title="${esc(SH.ITEMS[id].d)}"><span>${SH.ITEMS[id].i} ${SH.ITEMS[id].n}</span><small>use</small></div>`).join('')}</div></div>
      <div class="sect"><h4>People</h4>${relIds.map((id) => `<div class="relrow"><span>${SH.NPCS_META[id].n}</span><small class="relw">${SH.relWord ? esc(SH.relWord(id)) : hearts(G.rel[id] || 0)}</small></div>`).join('')}</div>`;
    $('#left').querySelectorAll('.invi').forEach((el) => (el.onclick = () => SH.Actions.useItem(el.dataset.id)));
    UI.renderTop();
  };
  UI.locInfo = function () {
    const G = SH.G, L = SH.LOC[G.loc];
    if (G.phase === 'home' && G.loc === 'home') {
      const mw = SH.momWhere(), rw = SH.rickWhere(), lw = SH.lilyWhere(), dr = SH.rickDrunk();
      const shift = { D: 'day shift', E: 'evening shift', N: 'night shift', DD: 'a double', OFF: 'day off' }[SH.MOM_SHIFTS[SH.day()]] || '';
      return `Mom: ${mw === 'work' ? 'at work (' + shift + ')' : mw === 'asleep' ? 'asleep' : 'home'} · Rick: ${rw === 'home' ? ['on the couch', 'on the couch, a few beers in', 'drunk', 'very drunk'][dr] : rw === 'gone' ? 'gone' : rw} · Lily: ${lw}`;
    }
    const bits = [L.sub, SH.isOpen(G.loc) ? 'open' : 'closed', L.indoor ? 'indoors' : 'outdoors, ' + SH.tempF() + '°F'];
    if (G.phase === 'run' && G.pickup) bits.push('⏳ ' + { grandma: 'Grandma', mom: 'Mom', harbor: 'Harbor House' }[G.pickup.by] + ' arriving ~' + SH.fmt12(G.pickup.at));
    const pl = SH.World ? SH.World.presenceLine() : ''; if (pl) bits.push(pl);
    return bits.join(' · ');
  };
  UI.renderActions = function () {
    const G = SH.G, L = SH.LOC[G.loc];
    $('#locname').textContent = G.phase === 'run' && G.loc === 'home' ? 'Maple Street (outside)' : L.name + (G.phase === 'home' && G.loc === 'home' ? ' · ' + ROOMN[G.room || 'bedroom'].slice(2) : '');
    $('#locsub').textContent = UI.locInfo();
    const lst = SH.Actions.list();
    if (SH.World) { const have = new Set(lst.acts.map((a) => a.label)); SH.World.talkActions().forEach((a) => { const nmx = a.label.replace('Talk to ', ''); if (![...have].some((l) => l.includes(nmx))) lst.acts.push(a); }); }
    const props = SH.Props ? SH.Props.list() : [];
    let html = '';
    if (lst.rooms) html += `<div class="rooms">${lst.rooms.map((r) => `<button data-r="${r}" class="${(G.room || 'bedroom') === r ? 'on' : ''}">${ROOMN[r]}</button>`).join('')}<button data-map="1">🚪 Go out (map)</button></div>`;
    html += `<div class="agrid">${lst.acts.map((a, i) => `<button class="act ${a.cls || ''}" data-i="${i}" ${a.dis ? 'disabled' : ''}>${i < 9 ? `<kbd>${i + 1}</kbd>` : ''}${esc(a.label)}${a.sub ? `<small>${esc(a.sub)}</small>` : ''}</button>`).join('')}</div>`;
    if (props.length || G.phase) html += `<div class="looks"><span class="lk">Look around</span>${props.map((p, i) => `<button class="chip" data-p="${i}">${p.ic} ${esc(p.l)}${p.sub ? ` <small>${esc(p.sub)}</small>` : ''}</button>`).join('')}<button class="chip" data-ph="1">📱 Check phone</button></div>`;
    const el = $('#actions'); el.innerHTML = html;
    el.querySelectorAll('.looks .chip').forEach((b) => (b.onclick = () => { if (UI.modalOpen() || G.ended) return; SH.Audio.click(); if (b.dataset.ph) { SH.Phone.open('home'); SH.Mobile && SH.Mobile.tab('phone'); return; } SH.Props.use(props[+b.dataset.p]); }));
    el.querySelectorAll('.rooms button').forEach((b) => (b.onclick = () => { if (b.dataset.map) return UI.openMap(); G.room = b.dataset.r; SH.Audio.click(); UI.renderActions(); UI.roomEnter(); }));
    el.querySelectorAll('.agrid button').forEach((b) => (b.onclick = () => { if (UI.modalOpen() || G.ended) return; SH.Audio.init(); SH.Audio.click(); lst.acts[+b.dataset.i].fn(); }));
  };
  UI.roomEnter = function () {
    const G = SH.G, r = G.room;
    if (r === 'living' && SH.rickWhere() === 'home' && SH.rickDrunk() >= 2 && SH.util.chance(0.35)) { SH.st('stress', 4); UI.log(SH.util.pick(['Rick doesn\'t look at you. "Get me a beer while you\'re up."', '"You\'re blocking the TV."', 'The room smells like beer and old pizza. Rick is watching a game, jaw tight.']), 'sys'); UI.renderSide(); }
    if (r === 'kitchen' && G.pantry < 12) UI.log('The fridge is nearly empty. There\'s a note on it in Mom\'s writing: "groceries Sat, sorry!!"', 'sys');
  };
  UI.renderAll = function () { UI.renderSide(); UI.renderActions(); SH.Phone.render(); };

  UI.afterAction = function () {
    const G = SH.G; if (!G) return;
    if (G.newDayPending && G.phase !== 'end') {
      G.newDayPending = false; const d = SH.day();
      UI.log(`${SH.longDate()}<small>${G.phase === 'home' ? (SH.DAY_LINES[d] || '') : 'Another day out here.'}</small>`, 'day');
    }
    if (!G.ended) UI.renderAll(); else SH.Phone.render();
    SH.Events.flush();
    if (!G.ended && G.phase !== 'end') SH.save();
    if (SH.Map.open) SH.Map.info();
  };

  UI.openMap = function () { SH.Map.open = true; $('#mapWrap').classList.remove('hidden'); SH.Map.sel = null; $('#mapInfo').classList.add('hidden'); };
  UI.closeMap = function () { SH.Map.open = false; $('#mapWrap').classList.add('hidden'); };

  UI.help = function () {
    UI.dialog({ title: 'How to play', text: [
      'You are 12. Home is falling apart. You have about three weeks before things get worse, and a choice to make: stay, tell someone, or run.',
      'TIME moves when you act. Every action costs minutes or hours. Mom\'s shifts, Rick\'s drinking, school, stores and buses all run on a real schedule.',
      'NEEDS: Fullness, Energy, Hygiene, Mood, Stress, Health, and Warmth outside. Cold nights outside wear your health down, so pack warm.',
      'CONVERSATIONS have no menus. Type whatever you want to say. People react to tone, honesty, what you reveal, and whether they\'re sober. Press ◉ PIP for suggested replies.',
      'THE PHONE: text anyone, call them, post on Chirp (careful), check the weather, play Skyforge, and ask PIP, your sarcastic assistant. PIP reads your situation. Try "what should I do?"',
      'THE MAP [M]: click a place to see travel times. Walk, bike, or take the city bus. If you run, red zones show where people are searching.',
      'Location sharing, posts, your note, and who you trust all change how the story ends. There are 14 endings.'], choices: [{ t: 'Got it', fn: () => {} }] });
  };
})(window.SH);
