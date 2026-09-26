/* SMALL HOURS — kit: tiny shared helpers for Parts 2–6 (dialogs, paying, where-am-I, NPC registration). */
(function (SH) {
  const K = SH.K = {};
  K.G = () => SH.G;
  K.pick = (a) => a[Math.floor(Math.random() * a.length)];
  K.chance = (p) => Math.random() < p;
  K.here = () => (SH.Atlas ? SH.Atlas.here() : { id: 'p0', name: 'Harlow', tier: 'town', home: true });
  K.away = () => !!(SH.G && SH.G.away);
  K.run = () => SH.G && (SH.G.phase === 'run' || !!SH.G.missingAt);
  K.back = () => (SH.G.away ? setTimeout(SH.Atlas.hub, 30) : SH.UI.afterAction());
  K.D = (title, text, choices, who) => SH.UI.dialog({ title, who, text: [].concat(text), choices: choices || [{ t: 'Okay', fn: K.back }] });
  K.ok = (fn) => [{ t: 'Okay', fn: fn || K.back }];
  K.pay = (amt, desc) => { const g = SH.G; if (g.money < amt) { SH.UI.toast(`That's $${amt}. You have $${Math.floor(g.money)}.`); return false; } SH.money(-amt); (g.tx = g.tx || []).push({ t: g.t, d: desc || 'Cash', a: -amt }); return true; };
  K.party = () => (SH.G.party || []).filter((id) => SH.NPCS_META[id]);
  K.nm = (id) => (SH.NPCS_META[id] || {}).n || id;
  K.grp = () => 1 + K.party().length;
  K.days = () => (SH.G.missingAt ? (SH.G.t - SH.G.missingAt) / 1440 : 0);
  K.npc = (id, n, full, col) => { SH.NPCS_META[id] = Object.assign(SH.NPCS_META[id] || {}, { n, full: full || n, col: col || '#8a8f98', ini: n.replace(/^(Ms\.|Mrs\.|Mr\.|Dr\.|Officer|Deputy) /, '')[0], ph: false }); };
  K.say = (say, x) => Object.assign({ say, fx: {} }, x || {});
  /* per-day hook without touching state.js again */
  K.daily = []; K.hourly = [];
  const bAdv = SH.advance;
  SH.advance = function () {
    const g = SH.G, t0 = g ? g.t : 0; const r = bAdv.apply(this, arguments); if (!g || g.ended) return r;
    const h0 = Math.floor(t0 / 60), h1 = Math.floor(g.t / 60);
    for (let h = h0 + 1; h <= h1 && !g.ended; h++) K.hourly.forEach((f) => { try { f(h); } catch (e) { console.warn(e); } });
    if (Math.floor(g.t / 1440) > Math.floor(t0 / 1440)) K.daily.forEach((f) => { try { !g.ended && f(); } catch (e) { console.warn(e); } });
    return r;
  };
  /* hub hook helper: add a choice before "Find somewhere to sleep" */
  K.hub = (f) => (SH.Atlas.extra = SH.Atlas.extra || []).push(f);
  K.acts = (f) => { const AC = SH.Actions; if (!AC || !AC.list) return; const bl = AC.list; AC.list = function () { const r = bl.apply(this, arguments); try { if (r && r.acts && SH.G) f(r.acts); } catch (e) { console.warn(e); } return r; }; };
})(window.SH);
