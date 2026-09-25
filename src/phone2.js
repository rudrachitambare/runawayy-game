/* SMALL HOURS — phone OS layer: notification centre, People (memory + transcripts + rumors), camera & gallery,
   calendar, clock/alarm. Wraps the base phone renderer. */
(function (SH) {
  const P = SH.Phone, U = SH.util, M = SH.NPCS_META;
  const $ = (s) => document.querySelector(s);
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const hdr = (title, extra = '') => `<div class="apphdr"><button onclick="SH.Phone.back()">‹ Back</button><span style="flex:1;text-align:center;margin-right:40px">${title}</span>${extra}</div>`;
  const av = (id) => { const m = M[id] || { col: '#555', ini: '?' }; return `<div class="av" style="background:${m.col}">${m.ini}</div>`; };
  const G = () => SH.G;

  /* ---------------- notifications ---------------- */
  const ICON = { messages: '💬', weather: '🌦️', skyforge: '⚔️', settings: '🔋', chirp: '🐦', calendar: '📅', clock: '⏰', calls: '📞', people: '👥', camera: '📷' };
  P.notify = function (app, title, text, open) {
    const g = G(); if (!g) return; g.notifs = g.notifs || [];
    g.notifs.unshift({ app, title: SH.nm(title), text: SH.nm(text), t: g.t, read: false, open }); g.notifs = g.notifs.slice(0, 60);
    if (P.ok() && !g.phone.airplane) { P.banner((ICON[app] || '•') + ' ' + title, SH.nm(text), () => { P.open(app === 'messages' ? 'messages' : app); }); SH.Audio.buzz(); }
    SH.Mobile && SH.Mobile.badge();
  };
  const basePush = P.push;
  P.push = function (id, from, text, notify) {
    const r = basePush.apply(P, arguments);
    const g = G(); if (g && from !== 'me' && from !== 'sys' && notify !== false) { g.notifs = g.notifs || []; g.notifs.unshift({ app: 'thread', id, title: (M[id] || { n: id }).n, text: SH.nm(text), t: g.t, read: false }); g.notifs = g.notifs.slice(0, 60); SH.Mobile && SH.Mobile.badge(); }
    return r;
  };
  P.unreadNotifs = () => (G().notifs || []).filter((n) => !n.read).length;

  /* ---------------- relationship, spoken like a person would ---------------- */
  const LADDER = [[-40, 'can\'t stand you right now'], [-15, 'cold with you lately'], [10, 'distant'], [35, 'okay with you'], [60, 'warm'], [80, 'close'], [999, 'really, really in your corner']];
  SH.relWord = function (npc) {
    const r = G().rel[npc] || 0, base = LADDER.find(([v]) => r <= v)[1];
    const ins = SH.Mem && SH.Mem.all(npc).filter((x) => x.topic === 'insult' && !x.forgiven && SH.day() - x.d <= 3).length;
    if (ins) return 'still hurt about something you said';
    return base;
  };
  P.PEOPLE = ['mom', 'lily', 'rick', 'grandma', 'jordan', 'okafor', 'patel', 'tyler', 'wren', 'dolores', 'dex'];
  const known = (id) => {
    const g = G();
    if (id === 'dex') return !!g.threads.dex; if (id === 'wren') return SH.f('metWren'); if (id === 'dolores') return !!(g.convos && g.convos.dolores);
    return !!M[id];
  };
  const lastTalk = (id) => { const L = (G().convos || {})[id] || []; const c = L[L.length - 1]; return c ? SH.Mem.when(c.t) : 'not recently'; };

  /* ---------------- calendar data ---------------- */
  const calFor = function (d) {
    const g = G(), st = g.story || {}, out = [], dm = st.dayMap || {}, skip = st.skip || {};
    const sh = SH.MOM_SHIFTS[d]; if (sh) out.push({ c: '#ff9f0a', t: 'Mom: ' + { D: 'day shift', E: 'evening', N: 'night', DD: 'DOUBLE', OFF: 'off' }[sh] });
    if (dm.conference != null && dm.conference === d && !skip.conference) out.push({ c: '#ff453a', t: 'Parent-teacher conf. 4pm' });
    if (dm.play != null && dm.play === d && !skip.play) out.push({ c: '#30d158', t: 'Lily\'s play! 6pm' });
    if (st.subDays && st.subDays.grandma70 != null && st.subDays.grandma70 === d) out.push({ c: '#bf5af2', t: 'Grandma turns 70' });
    if (st.subDays && st.subDays.science != null && st.subDays.science === d) out.push({ c: '#64d2ff', t: 'Science fair' });
    if (d === 26) out.push({ c: '#5e5ce6', t: 'Halloween dance' });
    if (d === 11) out.push({ c: '#8e8e93', t: 'Picture day (ugh)' });
    (g.userCal || {})[d] && out.push({ c: '#ffd60a', t: g.userCal[d] });
    return out;
  };
  P.calendarPing = function () {
    const h = SH.hour(); if (h < 7 || h > 9) return; const d = SH.day(), g = G(); g.world.calPinged = g.world.calPinged || {};
    if (g.world.calPinged[d]) return; const ev = calFor(d).filter((e) => !e.t.startsWith('Mom:')); if (!ev.length) return;
    g.world.calPinged[d] = 1; P.notify('calendar', 'Today', ev.map((e) => e.t).join(' · '));
  };

  /* ---------------- camera ---------------- */
  P.snap = function (kind) {
    const g = G(); g.gallery = g.gallery || [];
    let src = '';
    try { const c = $('#scene'), w = 160, hh = Math.round(160 * (c.height / c.width || 0.6)); const t = document.createElement('canvas'); t.width = w; t.height = hh; t.getContext('2d').drawImage(c, 0, 0, w, hh); src = t.toDataURL('image/jpeg', 0.6); } catch (e) {}
    const L = SH.LOC[g.loc], where = g.loc === 'home' && g.phase === 'home' ? 'home' : L.name;
    const item = { src, t: g.t, where, cap: kind === 'bruise' ? 'Your arm. The marks are clear. Dated ' + SH.dateStr() + '.' : U.pick(['', 'Nothing special. You just wanted to remember it.', 'The light was weird.', SH.cond() === 'rain' ? 'Rain on the lens.' : 'Blurry. Your hands were cold.']), evidence: kind === 'bruise' };
    g.gallery.unshift(item); g.gallery = g.gallery.slice(0, 12); g.phone.bat = Math.max(0, g.phone.bat - 0.5);
    if (kind === 'bruise') { SH.flag('bruisePhoto'); SH.Mem && SH.Mem.add('okafor', { topic: 'evidence', text: 'you have a photo of the bruise', src: 'saw', w: 1 }); SH.UI.log('You take the photo fast, like it might change its mind. Then you look at it. It looks worse on a screen. It looks real.', 'sys'); }
    SH.Audio.tone(1800, 0.05, 'square', 0.03); P.view = { app: 'camera' }; P.render();
  };

  // only what YOU could plausibly know about who's heard it
  const knownHolders = function (id) {
    const r = G().rumors[id]; if (!r) return ''; const WHO = (n) => n === 'class' ? 'the 7B group chat' : ((M[n] || {}).n || n);
    const told = [], heard = []; let hidden = 0;
    Object.keys(r.lvl).forEach((h) => { if (r.from[h] === 'you') told.push(WHO(h)); else if (r.seen[h] || h === 'class' || h === 'tyler') heard.push(WHO(h)); else hidden++; });
    return [told.length ? 'You told ' + told.join(', ') + '.' : '', heard.length ? 'Now ' + heard.join(', ') + (heard.length > 1 ? ' know.' : ' knows.') : '', hidden ? 'Maybe others.' : ''].filter(Boolean).join(' ');
  };
  /* ---------------- views ---------------- */
  const V = {};
  V.home = function (body) {
    const g = G();
    const apps = [['messages', '💬', 'Messages', '#34c759'], ['calls', '📞', 'Phone', '#30d158'], ['people', '👥', 'People', '#ff6482'], ['chirp', '🐦', 'Chirp', '#1d9bf0'],
      ['camera', '📷', 'Camera', '#48484a'], ['photos', '🖼️', 'Photos', '#ff9f43'], ['calendar', '📅', 'Calendar', '#ff453a'], ['clock', '⏰', 'Clock', '#1c1c1e'],
      ['maps', '🗺️', 'Maps', '#ff9f0a'], ['wallet', '💳', 'Wallet', '#2c2c2e'], ['notes', '📓', 'Journal', '#ffd60a'], ['weather', SH.WICON[SH.cond()], 'Weather', '#0a84ff'],
      ['pip', '◉', 'PIP', '#8b5cf6'], ['music', '🎧', 'Music', '#ff375f'], ['skyforge', '⚔️', 'Skyforge', '#5e5ce6'], ['settings', '⚙️', 'Settings', '#636366']];
    (P.extraApps || []).forEach((x) => apps.splice(x.at, 0, x.app));
    const unread = Object.values(g.unread).reduce((a, b) => a + (b || 0), 0), nn = P.unreadNotifs();
    const top = (g.notifs || []).filter((n) => !n.read).slice(0, 2);
    body.innerHTML = `<div class="pclock"><div class="t">${SH.fmt()}</div><div class="d">${SH.longDate()} · ${SH.tempF()}°F ${SH.WICON[SH.cond()]}</div></div>
      <button class="ncpill" onclick="SH.Phone.open('notifs')">🔔 ${nn ? nn + ' new' : 'No new notifications'}</button>
      ${top.map((n) => `<div class="nmini" onclick="SH.Phone.openNotif(${(g.notifs || []).indexOf(n)})"><b>${ICON[n.app] || '💬'} ${esc(n.title)}</b><span>${esc(n.text.slice(0, 60))}</span></div>`).join('')}
      <div class="homegrid">${apps.map(([id, ic, n, c]) => `<button class="app" onclick="SH.Phone.open('${id}')"><div class="ic" style="background:${c}">${ic}</div>${n}${id === 'messages' && unread ? `<span class="badge">${unread}</span>` : ''}</button>`).join('')}</div>`;
  };
  P.openNotif = function (i) { const n = (G().notifs || [])[i]; if (!n) return; n.read = true; if (n.app === 'thread') P.open('thread', n.id); else if (V[n.app] || n.app === 'weather' || n.app === 'skyforge' || n.app === 'chirp') P.open(n.app); else P.open('notifs'); };
  V.notifs = function (body) {
    const g = G(), L = g.notifs || [];
    body.innerHTML = hdr('Notifications', `<button onclick="SH.G.notifs=[];SH.Phone.render()" style="font-size:11px">Clear</button>`) + `<div class="appbody">${L.map((n, i) => `<div class="post ${n.read ? '' : 'unreadn'}" onclick="SH.Phone.openNotif(${i})" style="cursor:pointer"><div class="who">${ICON[n.app] || '💬'} ${esc(n.title)} <small>· ${SH.Mem.when(n.t)}</small></div>${esc(n.text)}</div>`).join('') || '<p style="color:#777;text-align:center;margin-top:30px">Nothing. The silence is kind of nice.</p>'}</div>`;
    L.forEach((n) => (n.read = true)); SH.Mobile && SH.Mobile.badge();
  };
  V.people = function (body) {
    const g = G(), tab = P.view.tab || 'people';
    const tabs = `<div class="ptabs"><button class="${tab === 'people' ? 'on' : ''}" onclick="SH.Phone.view.tab='people';SH.Phone.render()">People</button><button class="${tab === 'talk' ? 'on' : ''}" onclick="SH.Phone.view.tab='talk';SH.Phone.render()">What people are saying</button></div>`;
    if (tab === 'talk') {
      const L = SH.Rumor ? SH.Rumor.list() : [];
      body.innerHTML = hdr('👥 People') + tabs + `<div class="appbody">${L.length ? L.map((r) => `<div class="post"><div class="who">Going around${r.n > 4 ? ' — everywhere' : r.n > 2 ? ' — spreading' : ''}</div>"${esc(r.text)}"<div class="meta">${esc(knownHolders(r.id))}</div></div>`).join('') : '<p style="color:#777;font-size:12px;padding:10px">Nobody\'s talking about you. As far as you know. Things you tell people can travel — and change on the way.</p>'}</div>`;
      return;
    }
    const ids = P.PEOPLE.filter(known);
    body.innerHTML = hdr('👥 People') + tabs + `<div class="appbody">${ids.map((id) => `<div class="contact" onclick="SH.Phone.open('person','${id}')">${av(id)}<div><div class="nm">${esc((M[id] || {}).n || id)}</div><div class="pv">${id === 'dex' ? 'online friend' : esc(SH.relWord(id))} · talked ${esc(lastTalk(id))}</div></div></div>`).join('')}</div>`;
  };
  V.person = function (body) {
    const g = G(), id = P.view.id, m = M[id] || { n: id, full: '' };
    const mem = SH.Mem ? SH.Mem.summary(id) : [];
    const heard = []; for (const k in g.rumors || {}) { const r = g.rumors[k]; if (r.lvl[id] != null && r.from[id] !== 'you') heard.push(SH.Rumor.version(k, r.lvl[id])); }
    const cv = ((g.convos || {})[id] || []).slice().reverse();
    body.innerHTML = hdr(esc(m.n)) + `<div class="appbody"><div style="display:flex;gap:10px;align-items:center;margin:6px 0 10px">${av(id)}<div><b>${esc(m.full || m.n)}</b><div style="font-size:12px;color:#aaa">${id === 'dex' ? 'You\'ve never met in person.' : 'Seems ' + esc(SH.relWord(id)) + '.'}</div></div></div>
      <div class="sech">WHAT THEY REMEMBER</div>${mem.length ? mem.map((x) => `<div class="memrow"><span>${x.src === 'heard' ? '👂' : x.src === 'saw' ? '👁' : '💬'}</span><div>${esc(x.text)}<small>${esc(x.when)}</small></div></div>`).join('') : '<p class="muted">Nothing that stuck. Yet.</p>'}
      ${heard.length ? `<div class="sech">WHAT THEY'VE HEARD</div>${heard.map((h) => `<div class="memrow"><span>🗣️</span><div>"${esc(h)}"</div></div>`).join('')}` : ''}
      <div class="sech">CONVERSATIONS (${cv.length})</div>${cv.map((c, i) => `<div class="setrow" style="cursor:pointer" onclick="SH.Phone.open('convo','${id}');SH.Phone.view.i=${cv.length - 1 - i};SH.Phone.render()"><span>${c.via === 'text' ? '💬' : c.via === 'call' ? '📞' : '🗣️'} ${SH.dateStr(c.t)} ${SH.fmt(c.t)}</span><small>${c.lines.length} lines ›</small></div>`).join('') || '<p class="muted">You haven\'t really talked.</p>'}</div>`;
  };
  V.convo = function (body) {
    const g = G(), id = P.view.id, c = ((g.convos || {})[id] || [])[P.view.i];
    if (!c) { P.view = { app: 'person', id }; return V.person(body); }
    body.innerHTML = hdr(esc((M[id] || {}).n || id) + ' · ' + SH.dateStr(c.t)) + `<div class="msgs">${c.lines.map(([w, t]) => `<div class="bub ${w === 'me' ? 'me' : w === 'npc' ? 'them' : 'sys'}">${esc(t)}</div>`).join('')}</div>`;
  };
  V.camera = function (body) {
    const g = G(), gal = g.gallery || [];
    const canBruise = SH.f('bruise') && !SH.f('bruisePhoto') && g.loc === 'home' && g.phase === 'home' && ['bedroom', 'bathroom'].includes(g.room || 'bedroom');
    body.innerHTML = hdr('📷 Camera') + `<div class="appbody"><div class="camview"><button class="shutter" onclick="SH.Phone.snap()"></button></div>
      ${canBruise ? '<button class="btn" style="width:100%;margin:6px 0" onclick="SH.Phone.snap(\'bruise\')">📷 Photograph the bruise on your arm</button>' : ''}
      <div class="sech">RECENT (${gal.length}/12)</div><div class="galgrid">${gal.map((p, i) => `<div onclick="SH.Phone.open('shot');SH.Phone.view.i=${i};SH.Phone.render()">${p.src ? `<img src="${p.src}">` : '<div class="noimg">📷</div>'}${p.evidence ? '<i>!</i>' : ''}</div>`).join('') || '<p class="muted">No photos yet.</p>'}</div></div>`;
  };
  V.shot = function (body) {
    const p = (G().gallery || [])[P.view.i]; if (!p) { P.view = { app: 'camera' }; return V.camera(body); }
    body.innerHTML = hdr('Photo') + `<div class="appbody" style="text-align:center">${p.src ? `<img src="${p.src}" style="width:100%;border-radius:10px;image-rendering:pixelated">` : ''}<p style="font-size:12px">${esc(p.where)} · ${SH.dateStr(p.t)} ${SH.fmt(p.t)}</p><p class="muted">${esc(p.cap)}</p></div>`;
  };
  V.calendar = function (body) {
    const g = G(), today = SH.day(), sel = P.view.sel || today;
    const first = SH.START_DATE.day - 1 - (0), cells = []; // Oct 1 2026-style: day 1 (Oct 5) is Monday → Oct 1 is Thursday
    const lead = 3; for (let i = 0; i < lead; i++) cells.push('<div></div>');
    for (let dd = 1; dd <= 31; dd++) { const d = dd - SH.START_DATE.day + 1, ev = d >= 1 ? calFor(d).filter((e) => !e.t.startsWith('Mom:')) : [];
      cells.push(`<div class="cal ${d === today ? 'today' : ''} ${d === sel ? 'sel' : ''} ${d < today ? 'past' : ''}" ${d >= 1 ? `onclick="SH.Phone.view.sel=${d};SH.Phone.render()"` : ''}>${dd}${ev.length ? `<i style="background:${ev[0].c}"></i>` : ''}</div>`); }
    const evs = sel >= 1 ? calFor(sel) : [];
    body.innerHTML = hdr('📅 October') + `<div class="appbody"><div class="calgrid">${['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((x) => `<b>${x}</b>`).join('')}${cells.join('')}</div>
      <div class="sech">${sel === today ? 'TODAY' : SH.dateStr(sel * 1440 - 1)}</div>${evs.map((e) => `<div class="memrow"><span style="color:${e.c}">●</span><div>${esc(e.t)}</div></div>`).join('') || '<p class="muted">Nothing planned.</p>'}
      <div class="composer" style="border:none;padding:6px 0"><input id="calIn" placeholder="Add a note to this day…" maxlength="40"><button onclick="SH.Phone.calAdd(${sel})">+</button></div></div>`;
    const i = $('#calIn'); if (i) i.onkeydown = (e) => { e.stopPropagation(); if (e.key === 'Enter') P.calAdd(sel); };
  };
  P.calAdd = function (d) { const v = ($('#calIn') || {}).value; if (!v) return; const g = G(); g.userCal = g.userCal || {}; g.userCal[d] = v.slice(0, 40); P.render(); };
  V.clock = function (body) {
    const g = G(), a = g.alarm || (g.alarm = { on: true, h: 6.75 });
    const opts = [6, 6.5, 6.75, 7, 7.25, 7.5];
    body.innerHTML = hdr('⏰ Clock') + `<div class="appbody" style="text-align:center"><div style="font-size:52px;font-weight:200;margin:16px 0 4px">${SH.fmt()}</div><div class="muted">${SH.longDate()}</div>
      <div class="sech" style="text-align:left">SCHOOL-DAY ALARM</div>
      <div class="setrow"><span>Alarm</span><button class="tog ${a.on ? 'on' : ''}" onclick="SH.G.alarm.on=!SH.G.alarm.on;SH.Phone.render()">${a.on ? 'ON' : 'OFF'}</button></div>
      <div class="alarmrow">${opts.map((h) => `<button class="${a.h === h ? 'on' : ''}" onclick="SH.G.alarm.h=${h};SH.Phone.render()">${SH.fmt12 ? SH.fmt12(h * 60) : h}</button>`).join('')}</div>
      <p class="muted" style="text-align:left">Bus leaves 7:20. Without an alarm you'll sleep until your body gives up on sleeping, which is usually "too late."</p></div>`;
  };

  P.V = V; P.esc = esc; P.hdr = hdr;
  const baseRender = P.render;
  P.render = function () {
    const g = G(); if (!g || !$('#pbody')) return;
    const v = P.view || { app: 'home' };
    if (!V[v.app] || g.phone.confiscated || g.phone.bat <= 0) return baseRender.call(P);
    baseRender.call(P, true); // draw status bar etc. (base will render its own view first)
    if (g.phone.confiscated || g.phone.bat <= 0) return;
    V[v.app]($('#pbody'));
  };
  const baseOpen = P.open;
  P.open = function (app, id) { const r = baseOpen.call(P, app, id); SH.Mobile && SH.Mobile.phoneOpened && SH.Mobile.phoneOpened(); return r; };
  P.back = function () {
    const a = (P.view || {}).app;
    const up = { thread: 'messages', person: 'people', convo: 'person', shot: 'camera' }[a] || 'home';
    const id = P.view.id; P.view = { app: up, id: up === 'person' ? id : undefined }; SH.Audio.click(); P.render();
  };
})(window.SH);
