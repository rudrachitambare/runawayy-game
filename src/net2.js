/* SMALL HOURS — Part 1a: messaging over data, offline queue, held inbox, burner phone, data saver, bundles,
   night pack, Friend Finder subscription, free App Lock.
   Messages & calls are internet-based now (like most messaging apps): a text is tiny, a photo isn't,
   a voice call is ~0.75 MB/min, video ~6 MB/min. No data + no wifi = "sending…" until you're back online,
   and nobody's messages reach you either — they arrive in a burst when you reconnect. */
(function (SH) {
  const NT = SH.Net, P = SH.Phone;
  if (!NT || !P) return;
  const G = () => SH.G, $ = (s) => document.querySelector(s);
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const MB = { text: 0.05, photo: 1.6, callMin: 0.75, videoMin: 6 };
  NT.MB = MB;

  const X = NT.x = function () {
    const s = NT.state(); if (!s) return null;
    if (!s.x) s.x = { queue: [], inbox: [], saver: false, night: 0, burner: null, gave: {}, sub: { finder: 0 }, lock: { pin: null, apps: {} }, hist: [] };
    return s.x;
  };

  /* raw data spend (MB) — honours wifi, saver, night pack */
  NT.spend = function (mb, why) {
    const g = G(), s = NT.state(), x = X(); if (!s) return true;
    if (NT.wifiHere()) return true;
    if (g.phone.airplane || s.cut) return false;
    if (x.saver) mb *= 0.55;
    const h = SH.hour();
    if (x.night > 0 && (h < 6)) { const take = Math.min(x.night, mb); x.night -= take; mb -= take; }
    if (mb <= 0) return true;
    if (s.mb < mb) return false;
    s.mb = Math.max(0, s.mb - mb); s.used += mb; return true;
  };
  NT.canData = () => { const g = G(), s = NT.state(); return !!NT.wifiHere() || (!g.phone.airplane && !s.cut && (s.mb > 0.05 || (X().night > 0 && SH.hour() < 6))); };
  // data saver: background app costs drop too
  const bUse = NT.use; NT.use = function (app) { const x = X(); if (x && x.saver && NT.state().mb > 0 && !NT.wifiHere()) { const s = NT.state(); const before = s.mb; const r = bUse.apply(this, arguments); s.mb = Math.min(before, s.mb + (before - s.mb) * 0.45); return r; } return bUse.apply(this, arguments); };

  /* ---------- sending ---------- */
  const bSend = P.send;
  P.send = function (id, text) {
    const g = G(); if (!text || !text.trim() || !P.ok() || g.phone.airplane) return bSend.apply(this, arguments);
    const x = X();
    if (x.burner && !x.gave[id] && !['class', 'lighthouse', 'harbor'].includes(id)) { x.gave[id] = true; P.push(id, 'sys', 'Texting from your new number. ' + ((SH.NPCS_META[id] || {}).n || 'They') + ' has it now.', false); }
    if (!NT.spend(MB.text, 'text')) {
      P.push(id, 'me', text, false); P.push(id, 'sys', '⏳ Sending… (no data, no wifi)', false);
      x.queue.push({ id, text, t: g.t }); g.stats.textsSent++; SH.advance(2, { interrupt: false }); SH.UI.renderSide(); P.render(); return;
    }
    return bSend.apply(this, arguments);
  };

  /* ---------- receiving: hold while offline or when they don't have your burner number ---------- */
  const bPush = P.push;
  P.push = function (id, from, text, notify) {
    const g = G(), x = g && g.net && g.net.x;
    if (g && x && from !== 'me' && from !== 'sys' && !NT._flushing) {
      const blocked = x.burner && !x.gave[id] && !['class', 'lighthouse', 'harbor', 'bank', 'carrier'].includes(id);
      if (blocked) { (x.oldInbox = x.oldInbox || []).push({ id, from, text, t: g.t }); return; }
      if (!NT.canData()) { x.inbox.push({ id, from, text, t: g.t, notify }); return; }
      NT.spend(MB.text * (/📷|photo|pic/i.test(text) ? 30 : 1));
    }
    return bPush.apply(this, arguments);
  };

  NT.flush = function () {
    const g = G(), x = X(); if (!x || !NT.canData()) return 0;
    let n = 0;
    if (x.queue.length) {
      const q = x.queue.splice(0); q.forEach((m) => {
        NT.spend(MB.text); const th = g.threads[m.id] || [];
        for (let i = th.length - 1; i >= 0; i--) if (th[i].from === 'sys' && /^⏳ Sending/.test(th[i].text)) { th[i].text = 'Delivered ' + SH.fmt12(); break; }
        if (P.available(m.id) || ['class', 'dex'].includes(m.id)) setTimeout(() => P.reply(m.id, m.text), 900 + Math.random() * 2500);
      });
    }
    if (x.inbox.length) {
      const inb = x.inbox.splice(0); n = inb.length; NT._flushing = true;
      try { inb.forEach((m) => P.push(m.id, m.from, m.text, m.notify)); } finally { NT._flushing = false; }
      SH.UI.toast(`📶 Back online. ${n} message${n > 1 ? 's' : ''} came in at once.`);
    }
    return n;
  };
  const bAdv = SH.advance;
  SH.advance = function () { const r = bAdv.apply(this, arguments); try { NT.flush(); } catch (e) { console.warn(e); } return r; };
  const bOpen = P.open; P.open = function () { try { NT.flush(); } catch (e) {} return bOpen.apply(this, arguments); };

  /* ---------- calls ---------- */
  const bCall = P.callOut;
  P.callOut = function (id) {
    const g = G(); if (id === 'harbor' || id === '911') return bCall.apply(this, arguments); // emergency & helplines always go through
    if (!NT.canData()) { SH.UI.toast('Call failed. No data, no wifi. (Your calls go over the internet.)'); return; }
    const x = X(); if (x.burner && !x.gave[id]) { x.gave[id] = true; }
    if (!NT.spend(MB.callMin * 6)) { SH.UI.toast('Call dropped. Out of data.'); return; }
    return bCall.apply(this, arguments);
  };
  const bInc = P.incoming;
  P.incoming = function (id, onAnswer, onDecline) {
    const x = X();
    if (!NT.canData() || (x && x.burner && !x.gave[id])) { onDecline && onDecline(true); if (x) (x.missed = x.missed || []).push({ id, t: G().t }); return; }
    return bInc.call(this, id, () => { NT.spend(MB.callMin * 5); onAnswer && onAnswer(); }, onDecline);
  };

  /* ---------- burner, saver, packs, subscriptions, lock ---------- */
  NT.buyBurner = function () {
    const g = G(), x = X(); if (x.burner) return SH.UI.toast('You already have a burner.');
    if (g.money < 30) return SH.UI.toast('$30 for the phone + SIM. You don\'t have it in cash.');
    SH.money(-30); (g.tx = g.tx || []).push({ t: g.t, d: 'QuikMart: prepaid phone', a: -30 });
    x.burner = { num: '(555) ' + (200 + Math.floor(Math.random() * 700)) + '-' + (1000 + Math.floor(Math.random() * 8999)), since: g.t };
    const s = NT.state(); s.mb += 1000; s.cap = Math.max(s.cap, s.mb);
    g.phone.share = false; SH.flag('burner');
    SH.UI.dialog({ title: 'A $30 phone', text: ['It\'s a gray brick with a SIM in a cardboard sleeve. The QuikMart guy doesn\'t ask why a kid wants one. People buy these for grandmas all the time.', `Your new number: ${x.burner.num}. You move your contacts over. Nobody has this number. Nobody can text you, call you, or see where you are, until you give it to them.`, 'It comes with 1 GB. Location sharing: off. Your old phone\'s blue dot just… stops.'], choices: [{ t: 'Okay', fn: () => { SH.UI.afterAction && SH.UI.afterAction(); } }] });
  };
  NT.give = function (id) { const x = X(); x.gave[id] = true; const old = (x.oldInbox || []).filter((m) => m.id === id); x.oldInbox = (x.oldInbox || []).filter((m) => m.id !== id); P.push(id, 'sys', 'You sent your new number.', false); NT._flushing = true; try { old.slice(-3).forEach((m) => P.push(m.id, m.from, m.text, false)); } finally { NT._flushing = false; } P.render(); };
  NT.nightPack = function () { const g = G(); if (g.money < 3) return SH.UI.toast('$3. Not enough cash.'); SH.money(-3); X().night += 1024; SH.UI.toast('🌙 Night pack: 1 GB, midnight–6 AM only.'); P.render(); };
  NT.bundle = function () { const g = G(), s = NT.state(); if (g.money < 20) return SH.UI.toast('$20 for the monthly bundle. Not enough cash.'); SH.money(-20); s.mb += 8192; s.cap = Math.max(s.cap, s.mb); s.renew = 30; s.cut = false; SH.UI.toast('📦 Monthly bundle: 8 GB added.'); P.render(); };
  NT.finderOn = () => { const x = X(); return x && x.sub.finder > SH.G.t; };
  NT.subscribe = function () {
    const Bk = SH.Bank; if (!Bk) return;
    if (!Bk.pay(4.99, 'Friend Finder+ (monthly)')) return;
    X().sub.finder = G().t + 30 * 1440; SH.UI.toast('Friend Finder+ active for 30 days.'); P.render();
  };
  NT.locked = (app) => { const x = X(); return !!(x && x.lock.pin && x.lock.apps[app]); };

  /* ---------- Network app: extra sections ---------- */
  const bNet = P.V.net;
  P.V.net = function (body) {
    bNet.call(this, body);
    const g = G(), s = NT.state(), x = X(); const ab = body.querySelector('.appbody'); if (!ab) return;
    const q = x.queue.length, ib = x.inbox.length;
    const box = document.createElement('div');
    box.innerHTML = `<div class="sech">MESSAGING</div><div class="setrow" style="font-size:12px;line-height:1.5">Texts ≈ ${MB.text * 1000 | 0} KB · photos ≈ ${MB.photo} MB · calls ≈ ${MB.callMin} MB/min · video ≈ ${MB.videoMin} MB/min.<br>${q ? `⏳ <b>${q}</b> waiting to send.` : 'Nothing waiting to send.'} ${ib ? `📥 <b>${ib}</b> held until you're online.` : ''}</div>
      <div class="sech">SAVE DATA</div>
      <div class="setrow" style="display:flex;justify-content:space-between;align-items:center">Data saver <button class="btn" onclick="SH.Net.x().saver=!SH.Net.x().saver;SH.Phone.render()">${x.saver ? 'ON' : 'OFF'}</button></div>
      <div class="setrow" style="font-size:11.5px;color:var(--muted)">Blocks autoplay and images. Everything costs about half.</div>
      <div class="sech">BUY (CASH, AT QUIKMART OR GAS STATIONS)</div>
      <div class="setrow" style="font-size:12px;line-height:1.6">🌙 Night pack · $3 · 1 GB, midnight–6 AM ${x.night > 0 ? `(<b>${(x.night / 1024).toFixed(2)} GB</b> left)` : ''}<br>📦 Monthly bundle · $20 · 8 GB<br>📱 Prepaid burner phone · $30 · new number, 1 GB</div>
      ${x.burner ? `<div class="sech">BURNER</div><div class="setrow" style="font-size:12px">Number: <b>${x.burner.num}</b><br>Has it: ${Object.keys(x.gave).map((id) => esc((SH.NPCS_META[id] || {}).n || id)).join(', ') || 'nobody yet'}<br>${(x.oldInbox || []).length ? `Your old number got <b>${x.oldInbox.length}</b> messages you'll never see unless you give them the new one.` : ''}</div>` : ''}
      <div class="sech">SUBSCRIPTIONS</div>
      <div class="setrow" style="font-size:12px;line-height:1.5">👀 <b>Friend Finder+</b> · $4.99/mo (card only) · see friends who share with you, live.<br>${NT.finderOn() ? `Active until ${SH.dateStr(x.sub.finder)}.` : `<button class="btn" onclick="SH.Net.subscribe()">Subscribe</button>`}</div>
      <div class="sech">APP LOCK (FREE)</div>
      <div class="setrow" style="font-size:12px;line-height:1.6">${x.lock.pin ? `PIN set. Locked: ${Object.keys(x.lock.apps).filter((k) => x.lock.apps[k]).join(', ') || 'none'}.` : 'No PIN.'}<br>${['messages', 'browser', 'bank', 'people', 'photos'].map((a) => `<button class="btn" style="margin:2px" onclick="SH.Net.toggleLock('${a}')">${x.lock.apps[a] ? '🔒' : '🔓'} ${a}</button>`).join('')}<br><span style="color:var(--muted)">If someone grabs your phone, locked apps stay shut. It won't stop anyone from seeing that you locked them.</span></div>`;
    ab.appendChild(box);
  };
  NT.toggleLock = function (a) { const x = X(); if (!x.lock.pin) x.lock.pin = String(1000 + Math.floor(Math.random() * 8999)); x.lock.apps[a] = !x.lock.apps[a]; SH.UI.toast(x.lock.apps[a] ? `🔒 ${a} locked (PIN ${x.lock.pin}).` : `🔓 ${a} unlocked.`); P.render(); };

  /* ---------- Friend Finder app ---------- */
  P.V.finder = function (body) {
    const g = G(), W = SH.World, F = SH.Friends;
    if (!NT.finderOn()) { body.innerHTML = P.hdr('👀 Friend Finder') + `<div class="appbody" style="text-align:center;padding-top:30px"><div style="font-size:40px">👀</div><p>See your friends on the map, live.</p><p class="muted" style="font-size:12px">$4.99/month, card only. Only shows people who choose to share with you.</p><button class="btn primary" onclick="SH.Net.subscribe()">Subscribe</button></div>`; return; }
    if (!NT.canData()) return NT.blocked(body, '👀 Friend Finder');
    NT.spend(0.4);
    const ids = (F ? Object.keys(F.KIDS) : []).concat(['jordan']).filter((id) => g.rel[id] != null && (id === 'jordan' || (g.friends && g.friends[id] && g.friends[id].met)));
    const rows = ids.map((id) => {
      const m = SH.NPCS_META[id] || { n: id, col: '#666', ini: '?' }, shares = (g.rel[id] || 0) >= 30 || (g.party || []).includes(id);
      let where = '—';
      if (shares) { if ((g.party || []).includes(id)) where = 'with you'; else { const w = W.where(id); where = w && w.loc ? ((SH.LOC[w.loc] || {}).name || w.loc) + ' · ' + w.act : 'offline'; } }
      return `<div class="contact"><div class="av" style="background:${m.col}">${m.ini}</div><div style="flex:1"><div class="nm">${esc(m.n)}</div><div class="pv">${shares ? '📍 ' + esc(where) : 'Not sharing with you'}</div></div></div>`;
    }).join('');
    body.innerHTML = P.hdr('👀 Friend Finder') + `<div class="appbody">${rows || '<p class="muted">No friends yet. Go say hi to people.</p>'}<p class="muted" style="font-size:11px;margin-top:10px">Friends share with you once you're close (and always, if they're with you).</p></div>`;
  };

  /* ---------- lock screen gate ---------- */
  const bOpen2 = P.open;
  P.open = function (app) {
    if (NT.locked(app) && !P._unlocked) { P._unlocked = true; setTimeout(() => { P._unlocked = false; }, 60000); SH.UI.toast('🔒 PIN ' + X().lock.pin + ' entered.'); }
    return bOpen2.apply(this, arguments);
  };

  P.extraApps = P.extraApps || [];
  P.extraApps.push({ at: 16, app: ['finder', '👀', 'Finder', '#ff9f0a'] });

  /* ---------- shop actions: top-ups & burner at QuikMart ---------- */
  const A = SH.Actions;
  if (A && A.list) {
    const bList = A.list;
    A.list = function () {
      const r = bList.apply(this, arguments); const g = G();
      if (g && !g.away && ['store', 'station', 'bus'].includes(g.loc) && r && r.acts) {
        const x = X();
        r.acts.push({ label: 'Buy a night data pack ($3)', sub: '1 GB, midnight–6 AM', fn: () => { NT.nightPack(); SH.UI.afterAction(); } });
        r.acts.push({ label: 'Buy a monthly data bundle ($20)', sub: '8 GB for 30 days', fn: () => { NT.bundle(); SH.UI.afterAction(); } });
        if (!x.burner) r.acts.push({ label: 'Buy a prepaid burner phone ($30)', sub: 'New number. Nobody has it.', fn: () => NT.buyBurner() });
      }
      return r;
    };
  }
})(window.SH);
