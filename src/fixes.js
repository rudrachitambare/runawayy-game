/* SMALL HOURS — robustness layer:
   - snapshots are keyed per playthrough (not per seed), so a replay of the same story never loads another run's memories
   - every restore (rewind / load) resets all runtime AI state: PIP chat history, open conversations, typing indicators,
     queued events, and any delayed replies that were scheduled before the rewind ("stale timers") */
(function (SH) {
  const $ = (s) => document.querySelector(s);
  SH.epoch = 0;

  /* ---- stale-timer guard: callbacks scheduled before a rewind can't write into the restored world ---- */
  const _st = window.setTimeout.bind(window);
  window.setTimeout = function (fn, ms, ...args) {
    if (typeof fn !== 'function') return _st(fn, ms, ...args);
    const ep = SH.epoch;
    return _st(function () { if (SH.epoch !== ep) { SH._stale = true; try { fn.apply(this, args); } catch (e) {} finally { SH._stale = false; } return; } return fn.apply(this, args); }, ms);
  };
  const guard = (obj, name) => { if (!obj || typeof obj[name] !== 'function' || obj[name]._g) return; const b = obj[name]; obj[name] = function () { if (SH._stale) return; return b.apply(this, arguments); }; obj[name]._g = 1; };
  const installGuards = () => { ['push', 'reply', 'addPost', 'notify', 'banner'].forEach((n) => guard(SH.Phone, n)); ['log', 'dialog', 'toast'].forEach((n) => guard(SH.UI, n)); guard(SH.Talk, 'open'); guard(SH.Events, 'queue'); };

  /* ---- per-playthrough snapshots ---- */
  const gid = () => { const G = SH.G; if (!G.gid) G.gid = Date.now().toString(36) + Math.random().toString(36).slice(2, 7); return G.gid; };
  const key = (name) => 'sh_snap_' + gid() + '_' + name;
  SH.snapshot = function (name) { const s = JSON.stringify(SH.G); SH.snaps[name] = s; try { localStorage.setItem(key(name), s); } catch (e) { SH.purgeSnaps(true); try { localStorage.setItem(key(name), s); } catch (e2) {} } };
  SH.getSnap = function (name) { const s = SH.snaps[name]; if (s) return s; try { return localStorage.getItem(key(name)); } catch (e) { return null; } };
  // old snapshots from other playthroughs just eat storage (and used to leak memories across replays)
  SH.purgeSnaps = function (aggressive) {
    try { const mine = SH.G && SH.G.gid; const kill = []; for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); if (k && k.startsWith('sh_snap_') && (!mine || !k.startsWith('sh_snap_' + mine + '_') || (aggressive && /_day\d+$/.test(k)))) kill.push(k); } kill.forEach((k) => localStorage.removeItem(k)); } catch (e) {}
  };
  const baseNew = SH.newGame;
  SH.newGame = function () { SH.snaps = {}; baseNew.apply(this, arguments); SH.G.gid = null; gid(); SH.purgeSnaps(); SH.epoch++; };

  /* ---- a full reset of everything that lives outside SH.G ---- */
  SH.resetRuntime = function () {
    SH.epoch++;
    if (SH.PIP) SH.PIP.history = [];
    if (SH.Talk) SH.Talk.cur = null;
    if (SH.Phone) { SH.Phone.typing = null; SH.Phone.view = { app: 'home' }; }
    if (SH.Events) SH.Events.Q = [];
    if (SH.Map) { SH.Map.sel = null; SH.Map.hover = null; SH.Map.cache = null; }
    const md = $('#modal'); if (md) { md.classList.add('hidden'); md.innerHTML = ''; }
    const b = $('#banner'); if (b) b.classList.remove('show');
  };
  SH.afterRestore = function (msg) {
    SH.migrate && SH.migrate(SH.G);
    SH.City && SH.City.apply();
    SH.resetRuntime();
    if (SH.f('knowsHarbor')) SH.LOC.harbor.hidden = false;
    SH.UI.restoreLog(); if (msg) SH.UI.log(msg, 'day');
    SH.UI.renderAll(); SH.UI.afterAction();
  };
  SH.rewindTo = function (snap, mode) {
    if (!snap) return; const g = JSON.parse(snap); g.ended = false; if (g.phase === 'end') g.phase = 'home'; if (mode === 'left') g.phase = 'home';
    SH.G = g;
    SH.afterRestore(mode === 'left' ? '— Rewound to the moment before you left. —' : '— Rewound. —');
  };

  window.addEventListener('DOMContentLoaded', () => {
    installGuards();
    // ending screen: rebind rewind buttons to the clean restore path
    const EN = SH.Endings, baseShow = EN.show;
    EN.show = function () {
      const r = baseShow.apply(this, arguments);
      const a = $('#rwLeft'); if (a) a.onclick = () => SH.rewindTo(SH.getSnap('left'), 'left');
      const b = $('#rwDay'); if (b) b.onclick = () => SH.rewindTo(SH.getSnap('day' + SH.day()), 'day');
      return r;
    };
    const baseLoad = SH.load; SH.load = function () { const ok = baseLoad.apply(this, arguments); if (ok) { gid(); SH.City && SH.City.apply(); SH.resetRuntime(); } return ok; };
  });
})(window.SH);
