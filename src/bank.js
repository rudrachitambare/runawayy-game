/* SMALL HOURS — Part 1b: money. Cash is the default. Digital money lives in PocketPal (a teen card linked to
   Mom's account): it needs MOBILE DATA (banking apps refuse public wifi; home wifi is fine), Mom sees every
   transaction, and she can freeze it. Plus: savings, a shared Crew Pot with friends (goals, contributions,
   votes), borrowing & debts, and a pawn counter. No theft anywhere — money only moves when someone chooses. */
(function (SH) {
  const P = SH.Phone, NT = SH.Net;
  const G = () => SH.G, esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const $2 = (n) => '$' + (Math.round(n * 100) / 100).toFixed(2);
  const Bk = SH.Bank = {};

  Bk.state = function () {
    const g = G(); if (!g) return null;
    if (!g.bank) {
      const seed = (g.story && g.story.seed) || 7, start = 8 + (seed % 5) * 6;
      g.bank = { bal: start, sav: 0, frozen: false, linked: true, log: [{ t: g.t, d: 'Birthday money from Grandma', a: start }], pin: false };
      g.crew = null; g.debts = [];
    }
    return g.bank;
  };
  const log = (d, a) => { const b = Bk.state(); b.log.unshift({ t: G().t, d, a }); if (b.log.length > 40) b.log.pop(); };

  /* can the app talk to the bank right now? */
  Bk.access = function () {
    const g = G(), s = NT && NT.state(), b = Bk.state();
    if (g.phone.bat <= 0) return 'Your phone is dead.';
    if (g.phone.airplane) return 'Airplane mode is on.';
    const w = NT && NT.wifiHere();
    const privateWifi = w && (g.loc === 'home' || ['patel', 'jordan'].includes(g.loc) || (g.hideout && g.hideout.id));
    if (!privateWifi) {
      if (!s || s.cut) return 'No mobile service. PocketPal needs data to log in.';
      if (s.mb <= 0.2) return 'Out of data. Recharge to use PocketPal. (It won\'t connect over public wifi — "for your security".)';
    }
    if (NT && !privateWifi) NT.spend(0.3);
    return null;
  };

  /* pay by card/app (used by subscriptions, online shop, bookings). Returns true if paid. */
  Bk.pay = function (amt, what) {
    const g = G(), b = Bk.state(), why = Bk.access();
    if (why) { SH.UI.toast('💳 ' + why); return false; }
    if (b.frozen) { SH.UI.toast('💳 Card declined. Your card has been frozen by the account owner.'); return false; }
    if (b.bal < amt) { SH.UI.toast(`💳 Declined. Balance ${$2(b.bal)}.`); return false; }
    b.bal = Math.round((b.bal - amt) * 100) / 100; log(what, -amt); momSees(what, -amt); return true;
  };
  Bk.deposit = function (amt, what) { const b = Bk.state(); b.bal = Math.round((b.bal + amt) * 100) / 100; log(what, amt); };

  /* Mom sees the account. During the run, a transaction pins where you are. */
  function momSees(what, a) {
    const g = G(), b = Bk.state(); if (!b.linked) return;
    if (g.phase === 'run') {
      g.revealed = g.away ? null : g.loc; g.heat = Math.min(100, (g.heat || 0) + 8);
      if (g.away) g.awayNotice = (g.awayNotice || 0) + 12;
      if (!b.momSaw) { b.momSaw = true; setTimeout(() => SH.Phone.push('mom', 'mom', `I got a notification. ${what}. ${g.away ? '' : 'I know where that is.'} Please just come home. Or tell me you're safe.`), 1500); }
    } else if (a < -15 && !b.warned) { b.warned = true; setTimeout(() => SH.Phone.push('mom', 'mom', `why is there a ${$2(-a)} charge on your card?? "${what}"??`), 1200); }
  }
  // Mom freezes the card a day into the run (sometimes)
  const bAdv = SH.advance;
  SH.advance = function () {
    const r = bAdv.apply(this, arguments); const g = G(); if (!g || !g.bank) return r;
    const b = g.bank;
    if (g.phase === 'run' && g.missingAt && !b.freezeDecided && g.t - g.missingAt > 20 * 60) { b.freezeDecided = true; if (Math.random() < 0.5) { b.frozen = true; P.notify && P.notify('bank', 'PocketPal', 'Your card has been frozen by the account owner.'); } }
    // crew members chip in a little from their own jobs
    const c = g.crew; if (c && SH.hour() === 20 && c.lastDrip !== SH.day()) { c.lastDrip = SH.day(); (c.members || []).forEach((id) => { const att = Bk.att(id); if (Math.random() < 0.25 + att / 200) { const amt = [1, 2, 3, 5][Math.floor(Math.random() * 4)]; c.bal += amt; c.log.unshift({ t: g.t, who: id, d: 'chipped in', a: amt }); } }); }
    // debt reminders
    (g.debts || []).forEach((d) => { if (!d.paid && !d.nagged && g.t - d.t > 3 * 1440) { d.nagged = true; SH.Phone.push(d.who, d.who, pickNag(d)); SH.rel(d.who, -3); } });
    return r;
  };
  const pickNag = (d) => ['hey no pressure but the $' + d.amt + '?', 'u still owe me $' + d.amt + ' btw. just saying', 'did u forget about the money lol. it\'s fine. kinda'][Math.floor(Math.random() * 3)];

  /* attachment (shared w/ part 5): rel + time together */
  Bk.att = (id) => { const g = G(); return Math.max(0, Math.min(100, (g.rel[id] || 0) + ((g.friends && g.friends[id] && g.friends[id].hangs) || 0) * 4)); };

  /* ---------- savings ---------- */
  Bk.toSav = function (amt) { const b = Bk.state(); if (Bk.access()) return SH.UI.toast(Bk.access()); amt = Math.min(amt, b.bal); if (amt <= 0) return; b.bal -= amt; b.sav += amt; log('Moved to Savings', -amt); P.render(); };
  Bk.fromSav = function (amt) { const b = Bk.state(); if (Bk.access()) return SH.UI.toast(Bk.access()); amt = Math.min(amt, b.sav); if (amt <= 0) return; b.sav -= amt; b.bal += amt; log('From Savings', amt); P.render(); };
  /* cash <-> card happens at a register (cash back / load cash) */
  Bk.cashBack = function (amt) { const g = G(), b = Bk.state(); if (Bk.access()) return SH.UI.toast(Bk.access()); if (b.frozen) return SH.UI.toast('Card frozen.'); amt = Math.min(amt, b.bal); if (amt <= 0) return SH.UI.toast('Nothing on the card.'); b.bal -= amt; log('Cash back · QuikMart', -amt); momSees('Cash back at QuikMart', -amt); SH.money(amt); SH.UI.toast(`You get ${$2(amt)} in cash.`); SH.UI.afterAction(); };
  Bk.loadCash = function (amt, where) { const g = G(), b = Bk.state(); if (Bk.access()) return SH.UI.toast(Bk.access()); amt = Math.min(amt, g.money); if (amt < 1) return SH.UI.toast('No cash to load.'); SH.money(-amt); b.bal += amt; log(`Cash load · ${where || 'QuikMart'} ($1 fee)`, amt - 1); b.bal -= 1; SH.UI.toast(`Loaded ${$2(amt - 1)} onto PocketPal ($1 fee).`); SH.UI.afterAction(); };

  /* ---------- crew pot (group account) ---------- */
  Bk.crewable = () => { const g = G(); return Object.keys((g.friends || {})).filter((id) => g.friends[id].met && (g.rel[id] || 0) >= 35); };
  Bk.openCrew = function () {
    const g = G(); if (Bk.access()) return SH.UI.toast(Bk.access());
    const mem = Bk.crewable(); if (!mem.length) return SH.UI.toast('You need at least one close friend (they have to trust you with money).');
    g.crew = { bal: 0, goal: null, log: [{ t: g.t, who: 'me', d: 'opened the Crew Pot', a: 0 }], members: mem.slice(0, 5), votes: 0 };
    mem.forEach((id) => SH.Phone.push(id, id, ['omg a group account. we\'re like a real business', 'ok i\'m in. i have like $4 but i\'m in', 'crew pot 🫡'][Math.floor(Math.random() * 3)]));
    P.render();
  };
  Bk.crewAdd = function (amt, from) { // from: 'cash' | 'card'
    const g = G(), c = g.crew; if (!c) return; if (Bk.access()) return SH.UI.toast(Bk.access());
    if (from === 'cash') { if (g.money < amt) return SH.UI.toast('Not enough cash.'); SH.money(-amt); } else { if (!Bk.pay(amt, 'Crew Pot')) return; }
    c.bal += amt; c.log.unshift({ t: g.t, who: 'me', d: 'put in', a: amt }); c.members.forEach((id) => SH.rel(id, 1)); P.render();
  };
  Bk.crewGoal = function (name, amt) { const c = G().crew; if (!c) return; c.goal = { name, amt }; c.log.unshift({ t: G().t, who: 'me', d: 'set goal: ' + name, a: 0 }); P.render(); };
  /* taking money out needs a vote above $15: friends vote by attachment and whether the reason is good */
  Bk.crewTake = function (amt, why) {
    const g = G(), c = g.crew; if (!c || c.bal < amt) return SH.UI.toast('Not that much in the pot.');
    if (Bk.access()) return SH.UI.toast(Bk.access());
    if (amt <= 15) { c.bal -= amt; SH.money(amt); c.log.unshift({ t: g.t, who: 'me', d: 'took out (' + why + ')', a: -amt }); P.render(); return; }
    const good = /food|room|motel|bus|ticket|medicine|charger|tent|sleeping|rent|shelter|goal|scooter|bike/.test(why.toLowerCase()) || (c.goal && why.toLowerCase().includes(c.goal.name.toLowerCase()));
    const yes = c.members.filter((id) => Bk.att(id) + (good ? 30 : -10) + Math.random() * 30 > 55);
    const pass = yes.length * 2 >= c.members.length;
    c.log.unshift({ t: g.t, who: 'vote', d: `vote: take ${$2(amt)} for "${why}": ${yes.length}/${c.members.length} yes`, a: 0 });
    if (pass) { c.bal -= amt; SH.money(amt); c.log.unshift({ t: g.t, who: 'me', d: 'took out (' + why + ')', a: -amt }); SH.UI.toast(`🗳️ Vote passed (${yes.length}/${c.members.length}). ${$2(amt)} in cash.`); }
    else { SH.UI.toast(`🗳️ Vote failed (${yes.length}/${c.members.length}). ${good ? 'They\'re nervous about spending that much.' : 'Nobody gets what it\'s for.'}`); }
    P.render();
  };

  /* ---------- borrowing ---------- */
  Bk.borrow = function (id, amt) {
    const g = G(), rel = g.rel[id] || 0, m = SH.NPCS_META[id] || { n: id };
    if (NT && !NT.canData()) return SH.UI.toast('No data. The request won\'t send.');
    const owed = (g.debts || []).filter((d) => d.who === id && !d.paid).reduce((a, d) => a + d.amt, 0);
    SH.Phone.push(id, 'me', `can i borrow $${amt}? i'll pay u back`, false);
    const ok = rel - owed * 2 - amt + Math.random() * 25 > 30;
    setTimeout(() => {
      if (ok) { Bk.deposit(amt, m.n + ' sent you money'); g.debts.push({ who: id, amt, t: g.t, paid: false }); SH.Phone.push(id, id, ['sent. don\'t make it weird', 'ok sent 💸 pay me back whenever. like actually whenever', 'sent. is everything ok??'][Math.floor(Math.random() * 3)]); }
      else SH.Phone.push(id, id, owed ? 'dude u already owe me' : ['i literally have $2 sorry', 'my mom checks my app. i can\'t', 'i can\'t rn sorry 😭'][Math.floor(Math.random() * 3)]);
      P.render();
    }, 1500);
  };
  Bk.repay = function (i) { const g = G(), d = g.debts[i]; if (!d || d.paid) return; if (!Bk.pay(d.amt, 'Paid back ' + ((SH.NPCS_META[d.who] || {}).n || d.who))) return; d.paid = true; SH.rel(d.who, 6); SH.Phone.push(d.who, d.who, ['ayyy thank u', 'u actually paid me back. respect', 'ok ur officially trustworthy']); P.render(); };

  /* ---------- pawn counter (mall) ---------- */
  const VAL = { console: 60, game1: 12, game2: 12, watch: 0, sketchbook: 1, hoodie: 3, coat: 8, charger: 4, flashlight: 3, umbrella: 2, blanket: 3 };
  Bk.pawnable = () => G().bag.filter((id) => SH.ITEMS[id] && !SH.ITEMS[id].fixed && !['key', 'buspass', 'phone'].includes(id) && (VAL[id] || SH.ITEMS[id].price));

  /* ---------- PocketPal app ---------- */
  Bk.tab = 'acct';
  P.V.bank = function (body) {
    const g = G(), b = Bk.state(), why = Bk.access();
    const tabs = `<div class="seg" style="margin:6px 10px">${[['acct', 'Account'], ['crew', 'Crew Pot'], ['owe', 'IOUs']].map(([k, n]) => `<button class="${Bk.tab === k ? 'on' : ''}" style="flex:1" onclick="SH.Bank.tab='${k}';SH.Phone.render()">${n}</button>`).join('')}</div>`;
    if (why) { body.innerHTML = P.hdr('🏦 PocketPal') + `<div class="appbody" style="text-align:center;padding-top:30px"><div style="font-size:40px">💳</div><p><b>Can't connect</b></p><p class="muted" style="font-size:12.5px">${esc(why)}</p><p class="muted" style="font-size:11.5px">Cash on you: <b>${$2(g.money)}</b>. Cash still works everywhere.</p></div>`; return; }
    let h = '';
    if (Bk.tab === 'acct') {
      h = `<div style="text-align:center;margin:8px 0 12px"><div class="muted" style="font-size:11px">PocketPal Teen · linked to ${esc(SH.nm('Mom'))}${b.frozen ? ' · <b style="color:#ff6b6b">FROZEN</b>' : ''}</div><div style="font-size:36px;font-weight:300">${$2(b.bal)}</div><div class="muted" style="font-size:12px">Savings ${$2(b.sav)} · Cash on you ${$2(g.money)}</div></div>
        <div style="display:flex;gap:6px;justify-content:center;flex-wrap:wrap"><button class="btn" onclick="SH.Bank.toSav(5)">→ Save $5</button><button class="btn" onclick="SH.Bank.fromSav(5)">← Take $5</button></div>
        <p class="muted" style="font-size:11px;margin:8px 4px">Get cash out or load cash in at any QuikMart register. ${b.linked ? 'Every transaction shows up on Mom\'s phone.' : ''}</p>
        <div class="sech">ACTIVITY</div>${b.log.slice(0, 14).map((l) => `<div class="setrow" style="display:flex;justify-content:space-between;font-size:12px"><span>${esc(l.d)}<br><small class="muted">${SH.dateStr(l.t)}</small></span><b style="color:${l.a >= 0 ? '#6fdc8c' : '#ff8a8a'}">${l.a >= 0 ? '+' : ''}${$2(l.a)}</b></div>`).join('')}`;
    } else if (Bk.tab === 'crew') {
      const c = g.crew;
      if (!c) { const can = Bk.crewable(); h = `<div style="text-align:center;padding:24px 8px"><div style="font-size:38px">🫙</div><p><b>Crew Pot</b></p><p class="muted" style="font-size:12px">A shared account with your friends. Everyone can see who put in what. Taking out more than $15 needs a vote.</p>${can.length ? `<p style="font-size:12px">Would join: ${can.map((id) => esc(SH.NPCS_META[id].n)).join(', ')}</p><button class="btn primary" onclick="SH.Bank.openCrew()">Open Crew Pot</button>` : '<p class="muted" style="font-size:12px">You need a friend who really trusts you first.</p>'}</div>`; }
      else {
        const pct = c.goal ? Math.min(100, c.bal / c.goal.amt * 100) : 0;
        h = `<div style="text-align:center;margin:6px 0"><div class="muted" style="font-size:11px">${c.members.map((id) => esc(SH.NPCS_META[id].n)).join(' · ')} · you</div><div style="font-size:32px;font-weight:300">${$2(c.bal)}</div>
          ${c.goal ? `<div style="font-size:12px">Goal: <b>${esc(c.goal.name)}</b> · ${$2(c.goal.amt)}</div><div style="height:6px;background:#0005;border-radius:4px;margin:4px 20px"><i style="display:block;height:100%;width:${pct}%;background:var(--teal);border-radius:4px"></i></div>` : ''}</div>
          <div style="display:flex;gap:5px;justify-content:center;flex-wrap:wrap;margin-bottom:6px"><button class="btn" onclick="SH.Bank.crewAdd(2,'cash')">+ $2 cash</button><button class="btn" onclick="SH.Bank.crewAdd(5,'cash')">+ $5 cash</button><button class="btn" onclick="SH.Bank.crewAdd(5,'card')">+ $5 card</button></div>
          <div style="display:flex;gap:5px;margin:6px 4px"><input id="crewWhy" placeholder="take out for… (food, motel, scooter)" style="flex:1;min-width:0"><input id="crewAmt" type="number" value="10" style="width:52px"><button class="btn" onclick="SH.Bank.crewTake(+document.querySelector('#crewAmt').value||0,document.querySelector('#crewWhy').value||'stuff')">Take</button></div>
          <div style="display:flex;gap:5px;margin:6px 4px"><input id="goalN" placeholder="new goal (e.g. scooter fund)" style="flex:1;min-width:0"><input id="goalA" type="number" value="60" style="width:52px"><button class="btn" onclick="SH.Bank.crewGoal(document.querySelector('#goalN').value||'goal',+document.querySelector('#goalA').value||50)">Set</button></div>
          <div class="sech">WHO DID WHAT</div>${c.log.slice(0, 14).map((l) => `<div class="setrow" style="font-size:12px">${l.who === 'vote' ? '🗳️' : '•'} <b>${esc(l.who === 'me' ? 'You' : l.who === 'vote' ? '' : (SH.NPCS_META[l.who] || {}).n || l.who)}</b> ${esc(l.d)} ${l.a ? `<b style="color:${l.a > 0 ? '#6fdc8c' : '#ff8a8a'}">${l.a > 0 ? '+' : ''}${$2(l.a)}</b>` : ''}</div>`).join('')}`;
      }
    } else {
      const fr = Object.keys(g.friends || {}).filter((id) => g.friends[id].met).concat((g.rel.jordan || 0) > 20 ? ['jordan'] : []);
      h = `<div class="sech">ASK TO BORROW</div>${fr.length ? fr.map((id) => `<div class="setrow" style="display:flex;justify-content:space-between;align-items:center;font-size:12.5px">${esc(SH.NPCS_META[id].n)}<span><button class="btn" onclick="SH.Bank.borrow('${id}',5)">$5</button> <button class="btn" onclick="SH.Bank.borrow('${id}',15)">$15</button></span></div>`).join('') : '<p class="muted" style="font-size:12px">No friends to ask.</p>'}
        <div class="sech">YOU OWE</div>${(g.debts || []).map((d, i) => d.paid ? '' : `<div class="setrow" style="display:flex;justify-content:space-between;align-items:center;font-size:12.5px">${esc(SH.NPCS_META[d.who].n)} · ${$2(d.amt)}<button class="btn" onclick="SH.Bank.repay(${i})">Pay back</button></div>`).join('') || '<p class="muted" style="font-size:12px">Nothing. Clean.</p>'}`;
    }
    body.innerHTML = P.hdr('🏦 PocketPal') + tabs + `<div class="appbody">${h}</div>`;
  };
  P.extraApps = P.extraApps || [];
  P.extraApps.push({ at: 4, app: ['bank', '🏦', 'PocketPal', '#0a84ff'] });

  /* ---------- register actions ---------- */
  const A = SH.Actions;
  if (A && A.list) {
    const bList = A.list;
    A.list = function () {
      const r = bList.apply(this, arguments), g = G(); if (!g || g.away || !r || !r.acts) return r;
      if (g.loc === 'store') {
        r.acts.push({ label: 'Card cash-back at the register', sub: 'Up to $20 off PocketPal', fn: () => Bk.cashBack(20) });
        if (g.money >= 2) r.acts.push({ label: 'Load cash onto PocketPal', sub: '$1 fee', fn: () => Bk.loadCash(Math.floor(g.money)) });
      }
      if (g.loc === 'mall') {
        Bk.pawnable().slice(0, 4).forEach((id) => { const v = Math.max(1, Math.round((VAL[id] || SH.ITEMS[id].price || 4) * 0.35)); r.acts.push({ label: `Pawn counter: ${SH.ITEMS[id].n} → $${v}`, sub: 'They pay about a third of what it\'s worth.', fn: () => { SH.rmBag(id); SH.money(v); (g.tx = g.tx || []).push({ t: g.t, d: 'Pawn: ' + SH.ITEMS[id].n, a: v }); SH.UI.log(`The pawn guy turns your ${SH.ITEMS[id].n} over twice, like he's doing you a favor. $${v}.`, 'warn'); SH.advance(10, { interrupt: false }); SH.UI.afterAction(); } }); });
      }
      return r;
    };
  }
})(window.SH);
