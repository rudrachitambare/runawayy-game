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
  /* free-text input dialog: K.ask(title, lines, placeholder, cb(text), big) */
  K.ask = (title, lines, ph, cb, big) => {
    const md = document.querySelector('#modal'); md.classList.remove('hidden'); const esc = (x) => String(x).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
    md.innerHTML = `<div class="mbox dlg"><div class="mhead"><div><h3>${esc(title)}</h3><small>${SH.fmt12()} · ${SH.dateStr()}</small></div></div><div class="mtext">${[].concat(lines).map((l) => `<p>${esc(l)}</p>`).join('')}</div>
      <div style="padding:0 18px 16px">${big ? `<textarea id="kask" rows="5" style="width:100%;box-sizing:border-box" placeholder="${esc(ph)}"></textarea>` : `<input id="kask" style="width:100%;box-sizing:border-box" placeholder="${esc(ph)}">`}
      <div style="display:flex;gap:8px;margin-top:10px;justify-content:flex-end"><button class="btn" id="kaskNo">Cancel</button><button class="btn primary" id="kaskOk">Done</button></div></div></div>`;
    const i = md.querySelector('#kask'); i.addEventListener('keydown', (e) => { e.stopPropagation(); if (e.key === 'Enter' && !big) ok(); }); setTimeout(() => i.focus(), 30);
    const close = () => { md.classList.add('hidden'); md.innerHTML = ''; };
    const ok = () => { const v = i.value.trim(); if (!v) return; close(); cb(v); if (!SH.UI.modalOpen()) SH.UI.afterAction(); };
    md.querySelector('#kaskOk').onclick = ok; md.querySelector('#kaskNo').onclick = () => { close(); K.back(); };
  };
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
  /* "You & your group" submenu in the town hub (keeps the main menu short) */
  K.meList = []; K.me = (f) => K.meList.push(f);
  K.meOpen = (p) => { const ch = []; const dark = SH.hour() >= 20 || SH.hour() < 6; K.meList.forEach((f) => { try { f(p, ch, dark); } catch (e) { console.warn(e); } }); ch.push({ t: 'Back', fn: K.back }); K.D('You & your group', [`$${Math.floor(SH.G.money)} · ${K.grp() > 1 ? K.grp() + ' of you' : 'just you'} · day ${Math.max(1, Math.ceil(K.days()))} away`], ch); };
  K.hub((p, ch) => { if (K.meList.length) ch.push({ t: '🎒 You & your group', sub: 'Your story, your look, your people', fn: () => K.meOpen(p) }); });
  K.acts = (f) => { const AC = SH.Actions; if (!AC || !AC.list) return; const bl = AC.list; AC.list = function () { const r = bl.apply(this, arguments); try { if (r && r.acts && SH.G) f(r.acts); } catch (e) { console.warn(e); } return r; }; };
})(window.SH);
