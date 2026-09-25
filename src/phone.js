/* SMALL HOURS — the phone */
(function (SH) {
  const U = SH.util, M = SH.NPCS_META;
  const $ = (s) => document.querySelector(s);
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  /* ---------- tiny audio ---------- */
  const A = SH.Audio = { ctx: null, muted: false, music: null };
  A.init = () => { if (!A.ctx) try { A.ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) {} };
  A.tone = (f, d = 0.12, type = 'sine', v = 0.05, delay = 0) => {
    if (A.muted || !A.ctx) return; const t = A.ctx.currentTime + delay;
    const o = A.ctx.createOscillator(), g = A.ctx.createGain(); o.type = type; o.frequency.value = f;
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(v, t + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, t + d);
    o.connect(g).connect(A.ctx.destination); o.start(t); o.stop(t + d + 0.05);
  };
  A.buzz = () => { A.tone(880, 0.08, 'triangle', 0.04); A.tone(1320, 0.1, 'triangle', 0.035, 0.09); };
  A.click = () => A.tone(600, 0.04, 'square', 0.015);
  A.bad = () => { A.tone(220, 0.3, 'sawtooth', 0.03); A.tone(180, 0.4, 'sawtooth', 0.03, 0.1); };
  A.ring = () => { for (let i = 0; i < 4; i++) { A.tone(740, 0.18, 'sine', 0.05, i * 0.5); A.tone(990, 0.18, 'sine', 0.04, i * 0.5 + 0.2); } };
  A.playLofi = (secs = 24) => {
    A.init(); if (!A.ctx || A.muted) return; if (A.music) return;
    const chords = [[220, 261.6, 329.6, 392], [174.6, 220, 261.6, 329.6], [196, 246.9, 293.7, 349.2], [164.8, 207.7, 246.9, 329.6]];
    const bpm = 72, beat = 60 / bpm, t0 = A.ctx.currentTime + 0.1; const master = A.ctx.createGain(); master.gain.value = 0.5; master.connect(A.ctx.destination);
    const lp = A.ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 1400; lp.connect(master);
    const bars = Math.ceil(secs / (beat * 4));
    for (let b = 0; b < bars; b++) {
      const ch = chords[b % 4], tb = t0 + b * beat * 4;
      ch.forEach((f, i) => { const o = A.ctx.createOscillator(), g = A.ctx.createGain(); o.type = 'triangle'; o.frequency.value = f * (1 + (Math.random() - 0.5) * 0.004);
        g.gain.setValueAtTime(0, tb); g.gain.linearRampToValueAtTime(0.03, tb + 0.3); g.gain.linearRampToValueAtTime(0.0001, tb + beat * 4); o.connect(g).connect(lp); o.start(tb + i * 0.02); o.stop(tb + beat * 4 + 0.1); });
      for (let k = 0; k < 4; k++) { const tk = tb + k * beat; // soft kick + hat
        const o = A.ctx.createOscillator(), g = A.ctx.createGain(); o.frequency.setValueAtTime(k % 2 ? 0 : 110, tk); o.frequency.exponentialRampToValueAtTime(40, tk + 0.15);
        g.gain.setValueAtTime(k % 2 ? 0 : 0.12, tk); g.gain.exponentialRampToValueAtTime(0.0001, tk + 0.2); o.connect(g).connect(master); o.start(tk); o.stop(tk + 0.25);
        const m = [ch[3] * 2, ch[2] * 2, ch[1] * 2, ch[2] * 2][(k + b) % 4]; if (Math.random() < 0.6) { const o2 = A.ctx.createOscillator(), g2 = A.ctx.createGain(); o2.type = 'sine'; o2.frequency.value = m;
          g2.gain.setValueAtTime(0.025, tk + beat / 2); g2.gain.exponentialRampToValueAtTime(0.0001, tk + beat * 1.4); o2.connect(g2).connect(lp); o2.start(tk + beat / 2); o2.stop(tk + beat * 1.5); } }
    }
    A.music = setTimeout(() => { A.music = null; }, bars * beat * 4 * 1000);
  };

  /* ---------- phone model ---------- */
  const P = SH.Phone = { view: { app: 'home' }, bannerTimer: null };
  P.initThreads = function () {
    const G = SH.G, t0 = G.t - 600;
    const T = G.threads;
    T.mom = [{ from: 'mom', text: 'On shift till 11. Pizza rolls in the freezer. Make sure Lily brushes her teeth. Love u', t: t0 - 900 }, { from: 'me', text: 'ok', t: t0 - 890 }, { from: 'mom', text: 'Don\'t forget picture day forms!!', t: t0 }];
    T.jordan = [{ from: 'jordan', text: 'yo did u do the math hw', t: t0 - 200 }, { from: 'me', text: 'lol no', t: t0 - 190 }, { from: 'jordan', text: 'we\'re so cooked', t: t0 - 185 }];
    T.grandma = [{ from: 'grandma', text: 'Thinking of you today sweetheart. How is school? Love, Grandma', t: t0 - 4000 }];
    T.rick = [{ from: 'rick', text: 'take out the trash when u get home', t: t0 - 2000 }];
    T.lily = [{ from: 'lily', text: 'sam its lily on mommys ipad. i love you 🐢', t: t0 - 3000 }];
    T.class = [{ from: 'class', text: 'devonnn: who has the science notes', t: t0 - 100 }, { from: 'class', text: 'maddie.k: not me lol', t: t0 - 95 }];
    T.lighthouse = [{ from: 'lighthouse', text: 'Lighthouse Line: free, confidential text support for young people. Text anything, anytime. (In-game service.)', t: t0 - 90000 }];
    G.unread = { mom: 1 };
    G.feed = []; for (let i = 0; i < 4; i++) P.addPost(...U.pick(SH.CHIRP_POOL), G.t - i * 180);
    G.tx = [{ t: G.t - 3000, d: 'Allowance', a: 10 }, { t: G.t - 1500, d: 'QuikMart', a: -6 }];
    G.notes = 'things i need to remember:\n- Lily\'s play is Wednesday the 14th\n- math test retake?\n- grandma bday soon';
  };
  P.ok = () => { const G = SH.G; return G.phone.bat > 0 && !G.phone.confiscated; };
  P.push = function (id, from, text, notify = true) {
    text = SH.nm(text);
    const G = SH.G; G.threads[id] = G.threads[id] || [];
    G.threads[id].push({ from, text, t: G.t });
    const viewing = P.view.app === 'thread' && P.view.id === id;
    if (!viewing) G.unread[id] = (G.unread[id] || 0) + 1;
    if (notify && P.ok() && !G.phone.airplane && !viewing) { P.banner((M[id] || { n: id }).n, text, () => P.open('thread', id)); A.buzz(); }
    P.render();
  };
  P.banner = function (title, body, onClick) {
    const b = $('#banner'); if (!b) return;
    b.innerHTML = `<b>${esc(title)}</b>${esc(body.length > 90 ? body.slice(0, 90) + '…' : body)}`;
    b.onclick = () => { b.classList.remove('show'); onClick && onClick(); };
    b.classList.add('show'); clearTimeout(P.bannerTimer); P.bannerTimer = setTimeout(() => b.classList.remove('show'), 4200);
  };
  P.addPost = function (who, text, t, extra) { const G = SH.G; G.feed.unshift(Object.assign({ who, text: SH.nm(text), t: t || G.t, likes: U.ri(0, 30) }, extra || {})); G.feed = G.feed.slice(0, 40); };
  P.dailyFeed = function () { for (let i = 0; i < U.ri(2, 3); i++) P.addPost(...U.pick(SH.CHIRP_POOL)); };
  P.hourly = function () {
    const G = SH.G, h = Math.floor(SH.hour());
    if (G.phase === 'home') {
      if (U.chance(0.07) && h > 7 && h < 23) P.push('jordan', 'jordan', U.pick(['bro look at this', 'skate later?', 'mr dale is a villain origin story', 'im so bored', 'did u see tylers post lmao hes so dumb', 'my mom made too many tacos come thru']));
      if (U.chance(0.06) && h > 15 && h < 22) P.push('class', 'class', U.pick(['maddie.k: who\'s going to the dance', 'devonnn: anyone got the skyforge code', 'priya.draws: i drew mr dale as a gargoyle', 'ava.reads: quiz tmrw??']));
      if (SH.momWhere() === 'work' && U.chance(0.05)) P.push('mom', 'mom', U.pick(['Break finally. Did you eat?', 'Long shift. Love u. Check on Lily?', 'Is Rick being ok tonight?', 'Home late. Lock the door.']));
    }
    if (G.phase === 'run') SH.Run && SH.Run.phoneHour();
  };

  /* ---------- sending & replies ---------- */
  P.available = function (id) {
    const G = SH.G, h = SH.hour();
    if (G.flags['blocked_' + id]) return false;
    switch (id) {
      case 'mom': return G.phase === 'run' ? true : SH.momWhere() === 'asleep' ? false : SH.momWhere() === 'work' ? U.chance(0.45) : true;
      case 'rick': return SH.rickWhere() === 'home' || SH.rickWhere() === 'out';
      case 'lily': return SH.lilyWhere() === 'home' && U.chance(0.6);
      case 'jordan': return h > 7 && h < 23.5 && !(SH.isWeekday() && h > 8 && h < 15 && U.chance(0.5));
      case 'grandma': return h > 7 && h < 22.5;
      case 'dex': return !SH.f('dexBlocked');
      case 'lighthouse': return true; case 'class': return h > 7 && h < 23;
      default: return false;
    }
  };
  P.send = function (id, text) {
    const G = SH.G; if (!text.trim()) return;
    if (!P.ok()) return;
    if (G.phone.airplane) { SH.UI.toast('Airplane mode is on. Message not sent.'); return; }
    P.push(id, 'me', text, false); G.stats.textsSent++; G.phone.bat = Math.max(0, G.phone.bat - 0.4);
    SH.advance(3, { interrupt: false }); SH.UI.renderSide();
    if (id === 'class' || id === 'dex' || id === 'lighthouse' || P.available(id)) {
      P.typing = id; P.render();
      setTimeout(() => { P.typing = null; P.reply(id, text); }, U.ri(1200, 3200));
    } else {
      P.push(id, 'sys', id === 'mom' ? 'Delivered' : 'Delivered', false);
    }
  };
  P.reply = function (id, text) {
    const G = SH.G, brain = SH.Brain[id]; if (!brain) return;
    const conv = G.convMem[id] = G.convMem[id] || { mem: {}, used: {}, turn: 0 };
    conv.ctx = G.phase === 'run' && id === 'mom' ? 'runText' : 'text'; conv.turn++;
    const an = SH.NLP.analyze(text); const r = brain(an, conv);
    SH.UI.applyFx(id, r);
    let say = SH.NLP.fill(r.say); if (SH.textStyle[id]) say = SH.textStyle[id](say);
    P.push(id, id, say);
    if (r.narr) P.push(id, 'sys', r.narr, false);
    SH.Events.afterText && SH.Events.afterText(id, an, r);
    SH.UI.renderSide();
  };

  /* ---------- calls ---------- */
  P.incoming = function (id, onAnswer, onDecline) {
    if (!P.ok() || SH.G.phone.airplane) { onDecline && onDecline(true); return; }
    A.ring(); const sc = document.createElement('div'); sc.className = 'callscreen';
    const m = M[id]; sc.innerHTML = `<div class="av" style="background:${m.col}">${m.ini}</div><div style="font-size:22px">${m.n}</div><div style="opacity:.6">incoming call…</div>
      <div class="callbtns"><button style="background:#ff3b30">✕</button><button style="background:#34c759">✆</button></div>`;
    $('#screen').appendChild(sc);
    const [dec, ans] = sc.querySelectorAll('.callbtns button');
    dec.onclick = () => { sc.remove(); onDecline && onDecline(false); };
    ans.onclick = () => { sc.remove(); onAnswer && onAnswer(); };
  };
  P.callOut = function (id) {
    const G = SH.G; if (!P.ok() || G.phone.airplane) return;
    if (!P.available(id) && !['lighthouse', 'harbor', 'okafor'].includes(id)) { SH.UI.toast(M[id].n + ' didn\'t pick up.'); SH.advance(2, { interrupt: false }); SH.UI.afterAction(); return; }
    if (id === 'okafor') { const h = SH.hour(); if (!(h > 7 && h < 21)) { SH.UI.toast('Voicemail. "You\'ve reached Adaeze Okafor…"'); return; } }
    if (id === 'harbor') { SH.flag('harborPickup'); SH.UI.log('You call Harbor House. A calm voice answers on the second ring. "Where are you? Stay somewhere public and warm. We\'ll send someone."', 'good'); SH.advance(10, { interrupt: false }); SH.UI.afterAction(); return; }
    SH.Talk.open(id === 'lighthouse' ? 'lighthouse' : id, { ctx: 'call', intro: 'You call ' + M[id].n + '.', phone: true });
  };

  /* ---------- rendering ---------- */
  P.open = function (app, id) { A.click(); P.view = { app, id }; if (app === 'thread') SH.G.unread[id] = 0; P.render(); };
  P.back = function () { P.open(P.view.app === 'thread' ? 'messages' : 'home'); };
  const hdr = (title, extra = '') => `<div class="apphdr"><button onclick="SH.Phone.back()">‹ Back</button><span style="flex:1;text-align:center;margin-right:40px">${title}</span>${extra}</div>`;
  const av = (id) => { const m = M[id] || { col: '#555', ini: '?' }; return `<div class="av" style="background:${m.col}">${m.ini}</div>`; };

  P.render = function () {
    const G = SH.G; if (!G || !$('#pbody')) return;
    const sb = $('#sbar'), body = $('#pbody'), screen = $('#screen');
    const bat = Math.round(G.phone.bat);
    $('#crack').classList.toggle('hidden', !G.phone.cracked);
    if (G.phone.confiscated) { screen.classList.add('dead'); sb.innerHTML = ''; body.innerHTML = '<div style="margin:auto;text-align:center;color:#666;padding:30px">📵<br><br>' + (G.phone.takenBy === 'mom' ? 'Mom has your phone.<br><small>It\'s on the kitchen counter, charging. Of course she charged it.</small>' : 'Rick took your phone.<br><small>"You get it back when you learn some respect."</small>') + '</div>'; return; }
    if (bat <= 0) { screen.classList.add('dead'); sb.innerHTML = ''; body.innerHTML = '<div style="margin:auto;text-align:center;color:#444;font-size:40px">🪫<div style="font-size:12px;margin-top:10px">Battery empty</div></div>'; return; }
    screen.classList.remove('dead');
    sb.innerHTML = `<span>${SH.fmt()}</span><span>${G.phone.share ? '📍 ' : ''}${G.phone.airplane ? '✈️' : '▂▄▆'} <span style="color:${bat < 20 ? '#ff453a' : bat < 40 ? '#ffd60a' : '#fff'}">${bat}%${G.charging || (G.loc === 'home' && G.room === 'bedroom' && G.phase === 'home') ? '⚡' : ''}</span></span>`;
    const v = P.view;
    if (v.app === 'home') {
      const apps = [['messages', '💬', 'Messages', '#34c759'], ['calls', '📞', 'Phone', '#30d158'], ['chirp', '🐦', 'Chirp', '#1d9bf0'], ['pip', '◉', 'PIP', '#8b5cf6'],
        ['maps', '🗺️', 'Maps', '#ff9f0a'], ['wallet', '💳', 'Wallet', '#1c1c1e'], ['notes', '📓', 'Journal', '#ffd60a'], ['weather', SH.WICON[SH.cond()], 'Weather', '#0a84ff'],
        ['music', '🎧', 'Music', '#ff375f'], ['photos', '🖼️', 'Photos', '#ff9f43'], ['skyforge', '⚔️', 'Skyforge', '#5e5ce6'], ['settings', '⚙️', 'Settings', '#636366']];
      const unread = Object.values(G.unread).reduce((a, b) => a + (b || 0), 0);
      body.innerHTML = `<div class="pclock"><div class="t">${SH.fmt()}</div><div class="d">${SH.longDate()} · ${SH.tempF()}°F</div></div>
        <div class="homegrid">${apps.map(([id, ic, n, c]) => `<button class="app" onclick="SH.Phone.open('${id}')"><div class="ic" style="background:${c}">${ic}</div>${n}${id === 'messages' && unread ? `<span class="badge">${unread}</span>` : ''}</button>`).join('')}</div>`;
      return;
    }
    if (v.app === 'messages') {
      const ids = ['mom', 'jordan', 'grandma', 'lily', 'rick', 'class', 'lighthouse'].concat(G.threads.dex && !SH.f('dexBlocked') ? ['dex'] : []).concat(SH.Friends ? SH.Friends.threadIds() : []);
      ids.sort((a, b) => ((G.threads[b] || []).slice(-1)[0] || { t: 0 }).t - ((G.threads[a] || []).slice(-1)[0] || { t: 0 }).t);
      body.innerHTML = hdr('Messages') + `<div class="appbody">${ids.map((id) => { const th = G.threads[id] || []; const last = th.filter((m) => m.from !== 'sys').slice(-1)[0];
        return `<div class="contact" onclick="SH.Phone.open('thread','${id}')">${av(id)}<div><div class="nm">${M[id].n}</div><div class="pv">${last ? esc((last.from === 'me' ? 'You: ' : '') + last.text) : ''}</div></div>${G.unread[id] ? '<div class="unread"></div>' : ''}</div>`; }).join('')}</div>`;
      return;
    }
    if (v.app === 'thread') {
      const id = v.id, th = G.threads[id] || [];
      body.innerHTML = hdr(M[id].n) + `<div class="msgs" id="msgs">${th.slice(-60).map((m) => `<div class="bub ${m.from === 'me' ? 'me' : m.from === 'sys' ? 'sys' : 'them'}">${esc(m.text)}</div>`).join('')}${P.typing === id ? '<div class="typing">typing…</div>' : ''}</div>
        <div class="sugg" id="sugg"></div>
        <div class="composer"><button class="pipb" title="PIP: suggest replies" onclick="SH.Phone.suggest('${id}')">◉</button><input id="pin" placeholder="Type anything…" autocomplete="off"><button onclick="SH.Phone.sendFromInput('${id}')">↑</button></div>`;
      const inp = $('#pin'); inp.onkeydown = (e) => { if (e.key === 'Enter') P.sendFromInput(id); e.stopPropagation(); };
      const ms = $('#msgs'); ms.scrollTop = ms.scrollHeight; setTimeout(() => inp.focus(), 30);
      return;
    }
    if (v.app === 'pip') {
      const th = G.threads.pip = G.threads.pip || [{ from: 'pip', text: 'PIP online. Ask me anything. Battery, weather, money, "what should I do", "is dex weird", jokes. I\'m a genius with a bad attitude and 0.9 versions of beta.', t: G.t }];
      const cfg = SH.PIP.cfg();
      body.innerHTML = hdr('◉ PIP', `<button onclick="SH.Phone.open('settings')" style="font-size:11px">${cfg && cfg.key ? '🧠' : ''}</button>`) + `<div class="msgs" id="msgs">${th.slice(-50).map((m) => `<div class="bub ${m.from === 'me' ? 'me' : 'pip'}">${esc(m.text)}</div>`).join('')}${P.typing === 'pip' ? '<div class="typing">PIP is judging you…</div>' : ''}</div>
        <div class="sugg">${['what should I do?', 'status', 'is dex weird?', 'weather tonight'].map((q) => `<button onclick="SH.Phone.pipAsk('${q}')"><b>›</b>${q}</button>`).join('')}</div>
        <div class="composer"><input id="pin" placeholder="Ask PIP…" autocomplete="off"><button onclick="SH.Phone.pipAsk()">↑</button></div>`;
      const inp = $('#pin'); inp.onkeydown = (e) => { if (e.key === 'Enter') P.pipAsk(); e.stopPropagation(); };
      const ms = $('#msgs'); ms.scrollTop = ms.scrollHeight; setTimeout(() => inp.focus(), 30);
      return;
    }
    if (v.app === 'calls') {
      const list = ['mom', 'grandma', 'jordan', 'lighthouse'].concat(SH.has('card') || SH.f('okaforCard') ? ['okafor'] : []).concat(SH.f('knowsHarbor') ? ['harbor'] : []);
      body.innerHTML = hdr('Phone') + `<div class="appbody">${list.map((id) => `<div class="contact" onclick="SH.Phone.callOut('${id}')">${id === 'harbor' ? '<div class="av" style="background:#f2a65a">🏮</div>' : av(id)}<div><div class="nm">${id === 'harbor' ? 'Harbor House' : M[id].n}</div><div class="pv">${id === 'lighthouse' ? 'Crisis & support line · 24/7' : id === 'harbor' ? 'Youth shelter · 24/7' : 'mobile'}</div></div><div style="margin-left:auto">📞</div></div>`).join('')}
        <p style="font-size:11px;color:#777;padding:10px">Calls open a live conversation. Type whatever you want to say.</p></div>`;
      return;
    }
    if (v.app === 'chirp') {
      body.innerHTML = hdr('🐦 Chirp') + `<div class="appbody"><div class="composer" style="border:none;padding:0 0 8px"><input id="pin" placeholder="What's happening?"><button onclick="SH.Phone.postChirp()">↑</button></div>
        ${G.feed.map((p) => `<div class="post ${p.missing ? 'missing' : ''}"><div class="who">@${esc(p.who)} <small>· ${SH.dateStr(p.t)} ${SH.fmt(p.t)}</small></div>${esc(p.text)}<div class="meta">♡ ${p.likes}${p.shares ? ' · ↻ ' + p.shares + ' shares' : ''}</div></div>`).join('')}</div>`;
      const inp = $('#pin'); inp.onkeydown = (e) => { if (e.key === 'Enter') P.postChirp(); e.stopPropagation(); };
      return;
    }
    if (v.app === 'maps') { P.view = { app: 'home' }; SH.UI.openMap(); P.render(); return; }
    if (v.app === 'wallet') {
      body.innerHTML = hdr('💳 Wallet') + `<div class="appbody"><div class="post" style="text-align:center"><div style="color:#888;font-size:11px">CASH ON YOU</div><div style="font-size:34px;font-weight:200">$${G.money.toFixed(2)}</div>
        ${G.phase === 'home' ? `<div style="color:#888;font-size:11px">Shoebox at home: $${G.shoebox}</div>` : ''}</div>
        <div style="color:#888;font-size:11px;margin:8px 4px">RECENT</div>${(G.tx || []).slice(-12).reverse().map((x) => `<div class="setrow"><span>${esc(x.d)}<small>${SH.dateStr(x.t)}</small></span><span style="color:${x.a < 0 ? '#ff6b6b' : '#7bd88f'}">${x.a < 0 ? '-' : '+'}$${Math.abs(x.a).toFixed(2)}</span></div>`).join('')}</div>`;
      return;
    }
    if (v.app === 'notes') {
      body.innerHTML = hdr('📓 Journal') + `<div class="appbody"><textarea id="notesTa" style="width:100%;height:110px;font-size:12px">${esc(G.notes || '')}</textarea>
        <div style="color:#888;font-size:11px;margin:10px 4px 4px">AUTO-JOURNAL</div>${G.journal.slice().reverse().map((j) => `<div class="post"><div class="who">${esc(j.date)}</div>${esc(j.text)}</div>`).join('') || '<p style="color:#666;font-size:12px">Entries appear at the end of each day.</p>'}</div>`;
      $('#notesTa').oninput = (e) => { G.notes = e.target.value; }; $('#notesTa').onkeydown = (e) => e.stopPropagation();
      return;
    }
    if (v.app === 'weather') {
      const d = SH.day(), W = SH.weatherDay();
      body.innerHTML = hdr('Weather') + `<div class="appbody" style="text-align:center"><div style="font-size:13px;opacity:.7;margin-top:10px">Harlow</div>
        <div style="font-size:60px;font-weight:200">${SH.tempF()}°</div><div>${SH.toC(SH.tempF())}°C · ${W.c}</div><div style="opacity:.7;font-size:12px">H:${W.hi}° L:${W.lo}°</div>
        <div style="margin-top:18px;text-align:left">${[0, 1, 2, 3, 4].map((i) => { const w = SH.weatherDay(d + i); return `<div class="setrow"><span>${i === 0 ? 'Today' : SH.WEEKDAYS[(SH.wd() + i) % 7].slice(0, 3)}</span><span>${SH.WICON[w.c]}</span><span>${w.lo}° – ${w.hi}°</span></div>`; }).join('')}</div>
        ${SH.weatherDay(d + 1).lo < 34 ? '<div class="post missing" style="margin-top:10px">⚠ Frost advisory tonight. Protect pets and plants. And yourself.</div>' : ''}</div>`;
      return;
    }
    if (v.app === 'music') {
      body.innerHTML = hdr('🎧 Music') + `<div class="appbody" style="text-align:center"><div style="width:180px;height:180px;margin:20px auto;border-radius:12px;background:linear-gradient(135deg,#ff375f,#5e5ce6);display:flex;align-items:center;justify-content:center;font-size:60px">🌧️</div>
        <div style="font-weight:600">rainy bus window</div><div style="opacity:.6;font-size:12px">lofi for when everything is loud</div>
        <button class="btn" style="margin-top:16px" onclick="SH.Phone.listen()">▶ Listen (30 min)</button><p style="font-size:11px;color:#777">Lowers stress. Drains battery.</p></div>`;
      return;
    }
    if (v.app === 'photos') {
      const ph = [['🏞️', 'Grandma & you at Lake Minnow, 3 summers ago. You caught a fish. Grandma screamed.'], ['🐢', 'Lily in her turtle costume, practicing in the kitchen.'], ['🛹', 'Jordan eating it at the skate bowl. Iconic.'], ['🎂', 'Your 10th birthday. Dad was supposed to come.'], ['🌆', 'Sunset from the bridge. You took it the day Rick moved in.']];
      if (SH.f('lilyPlay')) ph.unshift(['🎭', 'Lily on stage, giant turtle shell, waving at you in the front row.']);
      body.innerHTML = hdr('Photos') + `<div class="appbody">${ph.map(([e, c]) => `<div class="post" style="display:flex;gap:10px;align-items:center;cursor:pointer" onclick="SH.Phone.viewPhoto('${esc(c).replace(/'/g, '&#39;')}')"><div style="font-size:34px">${e}</div><div>${esc(c)}</div></div>`).join('')}</div>`;
      return;
    }
    if (v.app === 'skyforge') {
      body.innerHTML = hdr('⚔️ Skyforge Legends') + `<div class="appbody" style="text-align:center"><div style="font-size:70px;margin-top:20px">🐉</div><div style="font-weight:700">SKYFORGE LEGENDS</div><div style="opacity:.6;font-size:12px">Rank: Silver II · 3,240 gems</div>
        <button class="btn" style="margin-top:16px" onclick="SH.Phone.playGame()">Play a match (30 min)</button><p style="font-size:11px;color:#777">Fun. Lowers stress. Eats battery. Strangers can DM you.</p></div>`;
      return;
    }
    if (v.app === 'settings') {
      const cfg = SH.PIP.cfg() || {};
      body.innerHTML = hdr('Settings') + `<div class="appbody">
        <div class="setrow"><span>Share location (Famly Find)<small>Mom can see where you are</small></span><button class="tog ${G.phone.share ? 'on' : ''}" onclick="SH.Phone.toggle('share')"></button></div>
        <div class="setrow"><span>Low Power Mode<small>Battery drains ~50% slower</small></span><button class="tog ${G.phone.low ? 'on' : ''}" onclick="SH.Phone.toggle('low')"></button></div>
        <div class="setrow"><span>Airplane Mode<small>No calls, texts or tracking. Minimal drain.</small></span><button class="tog ${G.phone.airplane ? 'on' : ''}" onclick="SH.Phone.toggle('airplane')"></button></div>
        ${G.threads.dex && !SH.f('dexBlocked') ? `<div class="setrow"><span>Block & report dex_19<small>Reports to Skyforge safety team</small></span><button class="btn danger" onclick="SH.Phone.blockDex()">Block</button></div>` : ''}
        <div style="color:#888;font-size:11px;margin:14px 4px 4px">PIP BRAIN (OPTIONAL)</div>
        <p style="font-size:11px;color:#888;margin:4px">PIP runs on a built-in local language engine. Optionally connect an OpenAI-compatible endpoint for a real LLM brain (the key stays in your browser). Falls back to local if offline.</p>
        <input id="llmUrl" placeholder="https://api.openai.com/v1/chat/completions" value="${esc(cfg.url || '')}" style="width:100%;margin:3px 0;font-size:11px">
        <input id="llmKey" type="password" placeholder="API key" value="${esc(cfg.key || '')}" style="width:100%;margin:3px 0;font-size:11px">
        <input id="llmModel" placeholder="model (e.g. gpt-4o-mini)" value="${esc(cfg.model || '')}" style="width:100%;margin:3px 0;font-size:11px">
        <button class="btn" style="width:100%;margin-top:4px" onclick="SH.Phone.saveLLM()">Save brain</button>
        <div class="setrow" style="margin-top:10px"><span>Sound</span><button class="tog ${!A.muted ? 'on' : ''}" onclick="SH.Audio.muted=!SH.Audio.muted;SH.Phone.render()"></button></div></div>`;
      body.querySelectorAll('input').forEach((i) => (i.onkeydown = (e) => e.stopPropagation()));
      return;
    }
  };

  /* ---------- actions ---------- */
  P.sendFromInput = function (id) { const i = $('#pin'); if (!i) return; const v = i.value; i.value = ''; P.send(id, v); };
  P.suggest = function (id) {
    const G = SH.G, th = (G.threads[id] || []).filter((m) => m.from !== 'me' && m.from !== 'sys');
    const last = th.slice(-1)[0]; const sug = SH.PIP.suggest(id, last ? last.text : '');
    const el = $('#sugg'); if (!el) return;
    el.innerHTML = sug.map((s) => `<button data-t="${esc(s.t)}"><b>${s.tone}</b>${esc(s.t)}</button>`).join('');
    el.querySelectorAll('button').forEach((b) => (b.onclick = () => { $('#pin').value = b.dataset.t; el.innerHTML = ''; $('#pin').focus(); }));
  };
  P.pipAsk = async function (q) {
    const G = SH.G, i = $('#pin'); const text = q || (i && i.value) || ''; if (i) i.value = '';
    if (!text.trim()) return;
    G.threads.pip = G.threads.pip || [];
    G.threads.pip.push({ from: 'me', text, t: G.t }); P.typing = 'pip'; P.render();
    G.phone.bat = Math.max(0, G.phone.bat - 0.3);
    const ans = await SH.PIP.ask(text);
    setTimeout(() => { P.typing = null; G.threads.pip.push({ from: 'pip', text: ans, t: G.t }); P.render(); SH.UI.renderSide(); if (SH.f('knowsHarbor')) SH.UI.revealHarbor(); }, U.ri(500, 1400));
  };
  P.postChirp = function () {
    const G = SH.G, i = $('#pin'); const text = (i.value || '').trim(); if (!text) return; i.value = '';
    P.addPost(G.name.toLowerCase() + '_' + (G.name.length * 7 + 3), text); G.feed[0].likes = 0;
    const an = SH.NLP.analyze(text);
    if (G.phase === 'run') { SH.Run.posted(an); }
    else { if (an.has('run')) SH.susp(15, 'you posted about leaving'); if (an.has('sad') || an.has('disclose')) { setTimeout(() => P.push('jordan', 'jordan', 'saw ur chirp. u ok?'), 3000); } }
    setTimeout(() => { if (G.feed[0]) { G.feed[0].likes = U.ri(1, 9); P.render(); } }, 2500);
    SH.advance(5, { interrupt: false }); P.render(); SH.UI.afterAction();
  };
  P.toggle = function (k) {
    const G = SH.G; G.phone[k] = !G.phone[k];
    if (k === 'share' && !G.phone.share) { if (G.phase === 'home') { SH.susp(15, 'Mom got a "Sam stopped sharing" alert'); setTimeout(() => P.push('mom', 'mom', 'Why did you turn off location sharing?'), 2000); } SH.tag('shareOff'); }
    if (k === 'airplane' && !G.phone.airplane && G.pending) { G.pending.forEach((m) => P.push(m[0], m[1], m[2])); G.pending = null; }
    P.render(); SH.UI.renderSide();
  };
  P.blockDex = function () { SH.flag('dexBlocked'); SH.flag('dexReported'); SH.tag('dexReported'); SH.st('stress', -5); P.push('dex', 'sys', 'You blocked and reported dex_19. Skyforge Safety: "Thank you. We\'ve escalated this account."', false); SH.UI.log('You blocked and reported dex_19. Your hands are shaking a little. You did the right thing.', 'good'); P.render(); };
  P.saveLLM = function () { SH.PIP.setCfg({ url: $('#llmUrl').value.trim(), key: $('#llmKey').value.trim(), model: $('#llmModel').value.trim() }); SH.UI.toast('PIP brain saved.'); };
  P.listen = function () { A.playLofi(26); SH.advance(30, { interrupt: true }); SH.st('stress', -9); SH.st('mood', 6); SH.G.phone.bat = Math.max(0, SH.G.phone.bat - 3); SH.UI.log('You put your earbuds in. Rain sounds and a lazy piano. For thirty minutes, the house is someone else\'s problem.', 'good'); SH.UI.afterAction(); };
  P.viewPhoto = function (c) { const G = SH.G; if (!G.done['photo' + SH.day() + c.length]) { G.done['photo' + SH.day() + c.length] = 1; SH.st('mood', 3); } SH.UI.toast(c.slice(0, 80)); };
  P.playGame = function () {
    const G = SH.G; SH.advance(30, { interrupt: true }); SH.st('stress', -7); SH.st('mood', 5); G.phone.bat = Math.max(0, G.phone.bat - 6);
    const won = U.chance(0.55); SH.UI.log(won ? 'Skyforge: you clutch a 1v3 with a dragon lance. For a second you are a legend.' : 'Skyforge: you get destroyed by a nine-year-old named xX_Gorp_Xx. Still, it was fun.', 'sys');
    SH.Events.dexStep && SH.Events.dexStep(true); SH.UI.afterAction();
  };
})(window.SH);
