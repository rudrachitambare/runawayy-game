/* SMALL HOURS — turn 52: two phones, and nobody texts the kid sitting next to them.
   1) Friends who ran away WITH you don't text or call you. They're right there. (Their own parents still text
      THEM, which shows up in the host_ threads as before.)
   2) Buying a burner doesn't throw your old phone away. It goes in your pocket switched off: weighs nothing,
      can't be dropped or pawned, and pings nobody. Anything sent to your old number waits on it.
      Tap it: see how much is waiting. Turning it on is possible, but it shows up on the family map.
   3) The Phone item reads "Burner phone" once you have one. */
(function (SH) {
  const P = SH.Phone; if (!P || !SH.ITEMS) return;
  const G = () => SH.G;
  const party = () => { const g = G(); return g ? (g.party || []).concat(g.rkids || []) : []; };
  const withYou = (id) => { const g = G(); return !!(g && g.phase === 'run' && party().includes(id)); };
  const X = () => (SH.Net && SH.Net.x ? SH.Net.x() : null);

  /* ---------- 1) people with you don't text you ---------- */
  const bPush = P.push;
  P.push = function (id, from, text) {
    try { if (from !== 'me' && from !== 'sys' && withYou(id) && !/^host_/.test(id)) return; } catch (e) {}
    return bPush.apply(this, arguments);
  };
  if (P.incoming) { const bInc = P.incoming; P.incoming = function (id, onAnswer, onDecline) { if (withYou(id)) return; return bInc.apply(this, arguments); }; }

  /* ---------- 2) the old phone ---------- */
  SH.ITEMS.oldphone = { n: 'Your old phone (off)', w: 0, i: '📴', d: 'Switched off in your pocket. Weighs nothing. Anything sent to your old number waits here.', fixed: true };
  const ph = SH.ITEMS.phone;
  if (ph) {
    const base = { n: ph.n, d: ph.d, i: ph.i };
    const burn = () => { const x = X(); return !!(x && x.burner); };
    Object.defineProperty(ph, 'n', { get: () => (burn() ? 'Burner phone' : base.n), configurable: true });
    Object.defineProperty(ph, 'd', { get: () => (burn() ? `The $30 gray brick. ${X().burner.num}. Only people you text from it have this number.` : base.d), configurable: true });
  }
  const ensureOld = () => { const g = G(), x = X(); if (g && x && x.burner && !x.burner.noOld && !g.bag.includes('oldphone')) g.bag.push('oldphone'); };
  const waiting = () => { const x = X(); return x ? (x.oldInbox || []).length : 0; };
  function tapOld() {
    const g = G(), x = X(), n = waiting(), who = [...new Set((x.oldInbox || []).map((m) => (SH.NPCS_META[m.id] || {}).n).filter(Boolean))].slice(0, 4);
    SH.UI.dialog({ title: '📴 Your old phone', text: [
      'Switched off. The cracked case, the sticker on the back. It feels heavier than it is.',
      n ? `There are ${n} message${n === 1 ? '' : 's'} waiting for your old number${who.length ? `: ${who.join(', ')}${who.length < new Set((x.oldInbox || []).map((m) => m.id)).size ? ' and others' : ''}` : ''}. You can't read them without turning it on.` : 'Nothing has come in for your old number that you know of. You can\'t know without turning it on.',
      'If you turn it on, it finds a tower, and your family\'s map puts a dot right where you\'re standing.'],
      choices: [
        { t: 'Leave it off', cls: 'safe', fn: () => SH.UI.afterAction && SH.UI.afterAction() },
        { t: 'Turn it on for a minute', cls: 'hot', sub: 'Read what came in. Everyone can see where you are.', fn: () => turnOn() }] });
  }
  function turnOn() {
    const g = G(), x = X(), msgs = (x.oldInbox || []).splice(0);
    if (g.away) g.awayNotice = (g.awayNotice || 0) + 25; g.heat = Math.min(100, (g.heat || 0) + 10);
    SH.Net && (SH.Net._flushing = true);
    try { msgs.forEach((m) => { (g.threads[m.id] = g.threads[m.id] || []).push({ from: m.from, text: m.text, t: m.t }); g.unread = g.unread || {}; g.unread[m.id] = (g.unread[m.id] || 0) + 1; }); } finally { SH.Net && (SH.Net._flushing = false); }
    SH.UI.log(msgs.length ? `The old phone buzzes ${msgs.length} time${msgs.length === 1 ? '' : 's'} in your hand, one after another. You read them all. Then you hold the power button until the screen goes black again. Somewhere, a dot on a map blinked where you are.` : 'The old phone finds a tower. Nothing comes in. You turn it back off, but somewhere a dot on a map blinked where you are.', 'bad');
    SH.Phone.render && SH.Phone.render(); SH.UI.afterAction && SH.UI.afterAction();
  }
  const AC = SH.Actions;
  if (AC && AC.useItem) { const bUse = AC.useItem; AC.useItem = function (id) { if (id === 'oldphone') return tapOld(); return bUse.apply(this, arguments); }; }
  // add the old phone whenever a burner appears (either shop); a burner bought after your phone was taken doesn't have one
  if (SH.GasPhone && SH.GasPhone.burner) { const b = SH.GasPhone.burner; SH.GasPhone.burner = function () { const had = G().phone.confiscated, r = b.apply(this, arguments); const x = X(); if (x && x.burner && had) x.burner.noOld = true; ensureOld(); return r; }; }
  if (SH.Net && SH.Net.buyBurner) { const b = SH.Net.buyBurner; SH.Net.buyBurner = function () { const r = b.apply(this, arguments); ensureOld(); return r; }; }
  if (SH.migrate) { const bm = SH.migrate; SH.migrate = function (g) { const r = bm.apply(this, arguments); try { ensureOld(); } catch (e) {} return r; }; }
  const bAdv = SH.advance; SH.advance = function () { const r = bAdv.apply(this, arguments); try { ensureOld(); } catch (e) {} return r; };
  SH.Phones2 = { tapOld, withYou };
})(window.SH);
