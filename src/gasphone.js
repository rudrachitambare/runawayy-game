/* SMALL HOURS — gas-station phones (turn 50).
   Every gas station on the road (away towns and villages) sells a prepaid phone and data, just like the QuikMart at home.
   The burner is a real new phone: if yours was taken (or you never had it back), buying one gives you a working phone again.
   Also: gas stations sell a bucket (the car wash business needs one). */
(function (SH) {
  const A = SH.Actions, NT = SH.Net; if (!A || !A.list || !NT) return;
  const G = () => SH.G;
  const gasHere = () => { const g = G(); return g && g.away && /^t_.+_gas$/.test(g.loc || ''); };
  const here = () => { try { const L = SH.LOC && SH.LOC[G().loc]; return (L && L.name) || 'the gas station'; } catch (e) { return 'the gas station'; } };
  const shut = () => { try { const L = SH.LOC && SH.LOC[G().loc], h = SH.hour(); return L && L.hours && !(h >= L.hours[0] && h < L.hours[1]); } catch (e) { return false; } };
  function burner() {
    const g = G(), x = NT.x && NT.x(); if (!x) return SH.UI.toast('The clerk says the phones are sold out.');
    if (x.burner && !g.phone.confiscated) return SH.UI.toast('You already have a burner.');
    if (g.money < 30) return SH.UI.toast('$30 for the phone + SIM. You don\'t have it in cash.');
    const where = here(), hadNone = !!g.phone.confiscated;
    SH.money(-30); (g.tx = g.tx || []).push({ t: g.t, d: `${where}: prepaid phone`, a: -30 });
    x.burner = { num: '(555) ' + (200 + Math.floor(Math.random() * 700)) + '-' + (1000 + Math.floor(Math.random() * 8999)), since: g.t };
    const s = NT.state(); s.mb += 1000; s.cap = Math.max(s.cap, s.mb);
    g.phone.share = false; SH.flag('burner');
    if (hadNone) { g.phone.confiscated = false; g.phone.takenBy = null; g.phoneBackAt = null; g.phone.bat = 70; }
    SH.UI.dialog({ title: 'A $30 phone', text: [
      `It hangs on a hook behind the counter at ${where}, between the phone chargers and the air fresheners: a gray brick with a SIM in a cardboard sleeve. The clerk doesn't ask why a kid wants one. People buy these for their grandmas all the time.`,
      hadNone ? `You don't have your old phone, so you type in the numbers you know by heart, and the ones you don't, you find again. Your new number: ${x.burner.num}. Out of the box it's at 70%.` : `Your new number: ${x.burner.num}. You move your contacts over.`,
      'Nobody has this number. Nobody can text you, call you, or see where you are, until you give it to them. It comes with 1 GB. Location sharing: off.'],
      choices: [{ t: 'Okay', fn: () => { SH.Phone && SH.Phone.render && SH.Phone.render(); SH.UI.afterAction && SH.UI.afterAction(); } }] });
  }
  const bList = A.list;
  A.list = function () {
    const r = bList.apply(this, arguments);
    try {
      if (r && r.acts && gasHere() && !shut()) {
        const g = G(), x = NT.x && NT.x();
        if (x && (!x.burner || g.phone.confiscated)) r.acts.push({ label: 'Buy a prepaid phone ($30)', sub: g.phone.confiscated ? 'You don\'t have yours. This one works.' : 'New number. Nobody has it.', fn: () => SH.GasPhone.burner() });
        if (!g.phone.confiscated) {
          r.acts.push({ label: 'Buy a night data pack ($3)', sub: '1 GB, midnight–6 AM', fn: () => { NT.nightPack(); SH.UI.afterAction(); } });
          r.acts.push({ label: 'Buy a monthly data bundle ($20)', sub: '8 GB for 30 days', fn: () => { NT.bundle(); SH.UI.afterAction(); } });
        }
        if (!(g.bag || []).includes('x_bucket') && SH.ITEMS && (SH.ITEMS.x_bucket || SH.ITEMS.bucket)) r.acts.push({ label: 'Buy a bucket ($5)', sub: 'Car washes, water, sitting on', fn: () => { if (g.money < 5) return SH.UI.toast('$5. Not enough cash.'); SH.money(-5); SH.addBag(SH.ITEMS.x_bucket ? 'x_bucket' : 'bucket', true); SH.UI.log('A plastic bucket from behind the ice machine. It goes on the backpack strap.', 'sys'); SH.UI.afterAction(); } });
      }
    } catch (e) {}
    return r;
  };
  SH.GasPhone = { burner };
})(window.SH);
