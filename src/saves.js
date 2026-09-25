/* SMALL HOURS — full world saves: autosave + 3 slots + export/import, migration, and a record of every choice. */
(function (SH) {
  const $ = (s) => document.querySelector(s);
  const KEY = 'smallhours_save', SLOT = (n) => 'smallhours_slot_' + n;
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  // bring any save (old or new) up to the current shape
  SH.migrate = function (G) {
    if (!G) return G;
    G.world = G.world || {}; const W = G.world;
    W.ev = W.ev || {}; W.log = W.log || []; W.discovered = W.discovered || {}; W.seen = W.seen || {}; W.props = W.props || {};
    G.mem = G.mem || {}; G.convos = G.convos || {}; G.rumors = G.rumors || {}; G.notifs = G.notifs || []; G.gallery = G.gallery || [];
    G.alarm = G.alarm || { on: true, h: 6.75 }; G.userCal = G.userCal || {}; G.choices = G.choices || []; G.convMem = G.convMem || {};
    G.tone = G.tone || {}; G.tx = G.tx || []; G.v = Math.max(G.v || 0, 4);
    return G;
  };
  const baseNew = SH.newGame;
  SH.newGame = function () { baseNew.apply(this, arguments); SH.migrate(SH.G); };
  const baseLoad = SH.load;
  SH.load = function () { const ok = baseLoad.apply(this, arguments); if (ok) { SH.migrate(SH.G); if (SH.G.world.discovered && SH.f('knowsHarbor')) SH.LOC.harbor.hidden = false; } return ok; };

  const meta = (G) => ({ name: G.name, day: SH.day(G.t), date: SH.dateStr(G.t), time: SH.fmt(G.t), phase: G.phase, loc: (SH.LOC[G.loc] || {}).name, seed: G.story && G.story.seed, saved: Date.now() });
  const S = SH.Saves = {};
  S.read = (n) => { try { const s = localStorage.getItem(n === 0 ? KEY : SLOT(n)); return s ? JSON.parse(s) : null; } catch (e) { return null; } };
  S.write = function (n) {
    try { const G = SH.G; G.meta = meta(G); localStorage.setItem(n === 0 ? KEY : SLOT(n), JSON.stringify(G)); return true; } catch (e) { return false; }
  };
  S.restore = function (data) {
    // put data in the autosave slot, then reload into it cleanly (no duplicate listeners / half-built scenes)
    try { localStorage.setItem(KEY, JSON.stringify(SH.migrate(data))); sessionStorage.setItem('sh_autoload', '1'); location.reload(); return true; } catch (e) { SH.UI && SH.UI.toast('Couldn\'t load: storage is blocked here.'); return false; }
  };
  S.exportFile = function () {
    const G = SH.G; G.meta = meta(G);
    const blob = new Blob([JSON.stringify(G)], { type: 'application/json' }), a = document.createElement('a');
    a.href = URL.createObjectURL(blob); a.download = `smallhours_${G.name}_day${SH.day()}_${(G.story || {}).seed || ''}.json`; document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500);
  };
  S.importFile = function () {
    const i = document.createElement('input'); i.type = 'file'; i.accept = '.json,application/json';
    i.onchange = () => { const f = i.files[0]; if (!f) return; const r = new FileReader(); r.onload = () => { try { const d = JSON.parse(r.result); if (!d || !d.rel || !d.t) throw 0; S.restore(d); } catch (e) { alert('That file isn\'t a Small Hours save.'); } }; r.readAsText(f); };
    i.click();
  };
  const row = (n, inGame) => {
    const d = S.read(n), m = d && (d.meta || meta(d));
    return `<div class="slot"><div><b>${n === 0 ? 'Autosave' : 'Slot ' + n}</b><small>${m ? `${esc(m.name)} · Day ${m.day} (${esc(m.date)} ${esc(m.time)}) · ${esc(m.phase === 'run' ? 'gone' : m.loc || '')}${m.seed ? ' · #' + m.seed : ''}` : 'Empty'}</small></div>
      <div class="slotb">${inGame && n ? `<button class="btn" data-sv="${n}">Save</button>` : ''}${m ? `<button class="btn" data-ld="${n}">Load</button>` : ''}</div></div>`;
  };
  S.open = function (inGame) {
    const html = `<div class="slots">${[0, 1, 2, 3].map((n) => row(n, inGame)).join('')}</div>
      <div class="row" style="margin-top:10px;gap:8px;flex-wrap:wrap">${inGame ? '<button class="btn" id="svExp">⬇ Export file</button>' : ''}<button class="btn" id="svImp">⬆ Import file</button></div>
      <p style="font-size:11px;color:var(--muted);margin-top:8px">Saves keep everything: every conversation, what each person remembers, rumors in flight, the weather, your photos, your calendar and every choice you made.</p>`;
    if (inGame) {
      SH.UI.dialog({ title: 'Saves', html: true, text: [html], choices: [{ t: 'Close', fn: () => {} }] });
      wire(true);
    } else {
      let ov = $('#saveOv'); if (!ov) { ov = document.createElement('div'); ov.id = 'saveOv'; document.body.appendChild(ov); }
      ov.innerHTML = `<div class="mbox" style="max-width:520px"><div class="mhead"><h3>Load a game</h3><div style="flex:1"></div><button class="btn" id="svClose">✕</button></div><div style="padding:14px">${html}</div></div>`;
      ov.className = 'saveov'; $('#svClose').onclick = () => ov.remove(); wire(false);
    }
  };
  function wire(inGame) {
    document.querySelectorAll('[data-sv]').forEach((b) => (b.onclick = () => { const n = +b.dataset.sv; SH.UI.toast(S.write(n) ? 'Saved to slot ' + n + '.' : 'Saving is blocked here. Use Export instead.'); S.open(true); }));
    document.querySelectorAll('[data-ld]').forEach((b) => (b.onclick = () => { const d = S.read(+b.dataset.ld); if (d) S.restore(d); }));
    const ex = $('#svExp'); if (ex) ex.onclick = S.exportFile; const im = $('#svImp'); if (im) im.onclick = S.importFile;
  }

  // every choice you make in a dialog is written into the world
  const hookDialog = () => {
    const UI = SH.UI; if (!UI || UI._choiceHook) return; UI._choiceHook = true;
    const base = UI.dialog;
    UI.dialog = function (o) {
      if (o && o.choices && SH.G) o.choices = o.choices.map((c) => Object.assign({}, c, { fn: function () { const G = SH.G; if (G && o.choices.length > 1) { G.choices = G.choices || []; G.choices.push({ d: SH.day(), t: G.t, title: String(o.title || '').slice(0, 40), c: String(c.t || '').replace(/<[^>]+>/g, '').slice(0, 60) }); if (G.choices.length > 250) G.choices.shift(); } return c.fn && c.fn.apply(this, arguments); } }));
      return base.call(UI, o);
    };
  };

  window.addEventListener('DOMContentLoaded', () => {
    hookDialog();
    const sb = $('#saveBtn'); if (sb) sb.onclick = () => S.open(true);
    // title screen: slots / import
    const cont = $('#contBtn');
    if (cont && !$('#slotsBtn')) { const b = document.createElement('button'); b.className = 'btn'; b.id = 'slotsBtn'; b.textContent = 'Load…'; b.onclick = () => S.open(false); cont.after(b); }
    try { if (sessionStorage.getItem('sh_autoload')) { sessionStorage.removeItem('sh_autoload'); setTimeout(() => cont && cont.click(), 50); } } catch (e) {}
  });
  // the top bar is re-rendered, so re-bind the save button after each render
  const reb = () => { const UI = SH.UI; if (!UI || UI._saveHook) return; UI._saveHook = true; const base = UI.renderTop; if (base) UI.renderTop = function () { const r = base.apply(this, arguments); const sb = $('#saveBtn'); if (sb) sb.onclick = () => S.open(true); return r; }; };
  reb();
})(window.SH);
