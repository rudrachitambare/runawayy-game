/* power.js (turn 49): chargers and power banks behave like real ones.
   - The phone charger is never used up. Tap it where there's an outlet and you charge; otherwise it tells you where outlets are.
     A bought "Charging cable" counts as a charger.
   - A power bank holds 3 phone charges (the big 26,800 mAh one holds 5). When it's empty it doesn't vanish:
     plug in at an outlet and it charges alongside your phone, at the same speed, without slowing the phone down.
   - After 20 full phone charges' worth of use, a power bank wears out for good.
   State: G.banks[id] = { left: 0..cap*100, used: total % delivered }. The old G.pbCharge mirrors the Harlow bank. */
(function (SH) {
  const G = () => SH.G;
  const CAP = { powerbank: 3, x_powerbank: 3, x_powerbank2: 5 };
  const LIFE = 2000; // 20 full phone charges
  const isBank = (id) => CAP[id] != null;
  const st = (id) => { const g = G(); g.banks = g.banks || {}; if (!g.banks[id]) g.banks[id] = { left: id === 'powerbank' ? Math.min(CAP[id] * 100, g.pbCharge || 0) : ((g.bankLeft || {})[id] != null ? g.bankLeft[id] : CAP[id] * 100), used: 0 }; return g.banks[id]; };
  const sync = () => { const g = G(); if (g.banks && g.banks.powerbank) g.pbCharge = g.banks.powerbank.left; };
  const banksHere = () => (G().bag || []).filter(isBank);
  const chargesTxt = (b, id) => { const c = b.left / 100; return c >= CAP[id] - 0.05 ? 'full' : c < 0.1 ? 'empty' : `${c >= 1 ? (Math.round(c * 10) / 10).toString().replace(/\.0$/, '') : 'less than one'} phone charge${c >= 1.05 || c < 1 ? 's' : ''} left`; };

  // the Harlow shop and its "one full phone charge" line
  const P0 = SH.ITEMS && SH.ITEMS.powerbank; if (P0) P0.d = 'Holds 3 phone charges. Charges back up when you plug in with your phone.';
  if (SH.Catalog && SH.Catalog.ALL) { const a = SH.Catalog.ALL.x_powerbank; if (a) a.charge = 3; }
  ['x_powerbank', 'x_powerbank2'].forEach((id) => { const it = SH.ITEMS && SH.ITEMS[id]; if (it) it.d = `${CAP[id]} phone charges · recharges at an outlet with your phone · lasts about 20 charges`; });

  /* ---------- outlet charging feeds the power bank too ---------- */
  // Any rise in battery that isn't from a power bank / solar / crank counts as an outlet. The bank gets the same amount,
  // and keeps charging while you're plugged in even after the phone hits 100%.
  const gain = (amt) => {
    if (amt <= 0) return; const ids = banksHere(); if (!ids.length) return;
    for (const id of ids) { const b = st(id), room = CAP[id] * 100 - b.left; if (room <= 0) continue; const x = Math.min(room, amt); b.left += x; amt -= x; if (amt <= 0) break; }
    sync();
  };
  const own = () => { const g = G(); if (g && g.phone) g._lb = g.phone.bat; };
  const watch = () => {
    const g = G(); if (!g || !g.phone) return; if (g._lb == null) { g._lb = g.phone.bat; return; }
    const d = g.phone.bat - g._lb; g._lb = g.phone.bat; if (d > 0.5) gain(d);
  };
  const bAdv = SH.advance;
  SH.advance = function (mins) {
    const g = G();
    try { if (g && g._inCharge) own(); else watch(); } catch (e) {}
    const r = bAdv.apply(this, arguments);
    try { if (g && g._inCharge) own(); else watch(); } catch (e) {}
    return r;
  };
  const bAA = SH.UI.afterAction; SH.UI.afterAction = function () { try { if (G() && G()._inCharge) own(); else watch(); } catch (e) {} return bAA.apply(this, arguments); };
  // motel rooms and bases set the battery straight to 100 after their hour: watch() in afterAction credits the bank the same amount

  /* ---------- using things ---------- */
  const AC = SH.Actions; if (!AC || !AC.useItem) return;
  const log = (t, c) => SH.UI.log(t, c || ''), done = () => SH.UI.afterAction();
  const bUse = AC.useItem;
  AC.useItem = function (id) {
    const g = G(); if (!g || SH.UI.modalOpen()) return bUse.apply(this, arguments);
    // chargers: find an outlet here
    if (id === 'charger' || id === 'x_cable') {
      if (g.phone.bat >= 100 && !banksHere().some((b) => st(b).left < CAP[b] * 100)) return SH.UI.toast('Your phone is already full.');
      const L = SH.Actions.list ? SH.Actions.list() : { acts: [] };
      const a = (L.acts || []).find((x) => /charge (your )?phone|charge phone/i.test(x.label) && !x.dis);
      if (a) return a.fn();
      return SH.UI.toast('No outlet here. Libraries, diners, laundromats, gas stations, a motel room, or your own place with a solar panel.');
    }
    if (isBank(id)) {
      watch(); const b = st(id), it = SH.ITEMS[id] || { n: 'power bank' };
      if (b.left <= 0) return SH.UI.toast(`${it.n} is empty. Plug in at an outlet with your phone and it charges too.`);
      if (g.phone.bat >= 99.5) return SH.UI.toast(`Phone's already full. ${it.n}: ${chargesTxt(b, id)}.`);
      const give = Math.min(100 - g.phone.bat, b.left); g.phone.bat += give; b.left -= give; b.used += give; own(); sync();
      SH.advance(20, { interrupt: false }); own();
      log(`Phone charging off the power bank. ${Math.round(g.phone.bat)}% now. The power bank has ${chargesTxt(b, id)}.`, 'sys');
      if (b.used >= LIFE) {
        SH.rmBag(id); delete g.banks[id]; sync();
        log('The power bank\'s little lights blink, blink, and go out. It\'s warm and swollen at one end. Twenty-some charges and it won\'t hold anything anymore. You throw it away in the next bin.', 'warn');
      } else if (b.used >= LIFE - 300 && !b.warned) { b.warned = 1; log('The power bank is getting hot when it charges. It\'s not going to last much longer.', 'sys'); }
      return done();
    }
    // solar / crank: their charge isn't an outlet, so it doesn't top up the power bank
    if (id === 'x_solar' || id === 'x_radio') { watch(); const r = bUse.apply(this, arguments); own(); return r; }
    return bUse.apply(this, arguments);
  };

  // the Harlow "Use the power bank" button reads G.pbCharge; keep it right and give the shop the honest line
  const bList = AC.list;
  if (bList) AC.list = function () {
    const r = bList.apply(this, arguments);
    try { sync(); (r.acts || []).forEach((a) => {
      // plugging in at an outlet: the power bank charges alongside, at the phone's speed (~68% an hour), even once the phone is full
      if (/charge (your )?phone|charge phone/i.test(a.label) && !a._pw && typeof a.fn === 'function') { const f = a.fn; a._pw = 1; a.fn = function () { const g = G(), t0 = g.t; g._inCharge = true; own(); try { return f.apply(this, arguments); } finally { g._inCharge = false; gain(Math.max(0, g.t - t0) * 68 / 60); own(); } }; } if (/^Buy a power bank/.test(a.label)) a.sub = 'Holds 3 phone charges. Recharges with your phone.'; if (/^Use the power bank/.test(a.label) && G().banks && G().banks.powerbank) a.sub = chargesTxt(G().banks.powerbank, 'powerbank'); }); } catch (e) {}
    return r;
  };
  // a new Harlow power bank arrives full (3 charges) and fresh
  const bAdd = SH.addBag;
  SH.addBag = function (id) { const r = bAdd.apply(this, arguments); try { if (r !== false && isBank(id)) { const g = G(); g.banks = g.banks || {}; g.banks[id] = { left: CAP[id] * 100, used: 0 }; sync(); } } catch (e) {} return r; };
  // x_cable counts as a charger everywhere the game asks "do you have a charger?"
  const bHas = SH.has;
  SH.has = function (id) { return bHas.apply(this, arguments) || (id === 'charger' && bHas.call(this, 'x_cable')); };
  SH.Power = { st, gain, watch, CAP, LIFE };
})(window.SH);
