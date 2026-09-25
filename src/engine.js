/* SMALL HOURS — data-driven event engine.
   Events, props, rumor reactions and ambient life are plain data:
   { id, pool, when: ["rel.jordan < 40", "hour > 17", "weather in rain,storm"], chance, cooldown, once,
     text | texts, cls, effects: ["rel.jordan -5", "stat.stress +8"], choices: [{ t, when, effects, text }] }
   Anything can also be a function, for the rare case that needs code. */
(function (SH) {
  const U = SH.util;
  const EN = SH.Engine = { pools: {}, byId: {} };

  EN.register = function (list) {
    list.forEach((e) => { const p = e.pool || 'misc'; (EN.pools[p] = EN.pools[p] || []).push(e); EN.byId[e.id] = e; });
  };

  /* ---------------- template filling ---------------- */
  EN.fill = function (s) {
    if (typeof s === 'function') s = s();
    if (typeof s !== 'string') return s;
    const G = SH.G, L = SH.LOC[G.loc] || {};
    return s.replace(/\{([^{}]+)\}/g, (m, k) => {
      if (k.includes('|')) return U.pick(k.split('|'));
      switch (k) {
        case 'name': return G.name; case 'Name': return G.name;
        case 'cat': return (G.story && G.story.cat) || 'the cat';
        case 'temp': return SH.tempF() + '°F'; case 'time': return SH.fmt12();
        case 'weather': return SH.cond(); case 'loc': return L.name || 'here';
        case 'day': return SH.WEEKDAYS[SH.wd()];
        default: return m;
      }
    });
  };

  /* ---------------- conditions ---------------- */
  const num = (v) => (v === '' || v == null || isNaN(+v) ? v : +v);
  const cmp = (a, op, b) => { a = num(a); b = num(b);
    switch (op) { case '<': return a < b; case '<=': return a <= b; case '>': return a > b; case '>=': return a >= b; case '==': case '=': return a == b; case '!=': return a != b; } return false; };
  EN.val = function (key) {
    const G = SH.G;
    const [a, b, c] = key.split('.');
    switch (a) {
      case 'rel': return G.rel[b] || 0;
      case 'stat': return G.s[b];
      case 'hour': return SH.hour(); case 'day': return SH.day(); case 'wd': return SH.wd();
      case 'money': return G.money; case 'susp': return G.susp; case 'heat': return G.heat; case 'grades': return G.grades;
      case 'temp': return SH.tempF(); case 'weather': return SH.cond(); case 'phase': return G.phase;
      case 'loc': return G.loc; case 'loctype': return (SH.LOC[G.loc] || {}).type; case 'room': return G.room || 'bedroom';
      case 'bat': return G.phone.bat; case 'pantry': return G.pantry;
      case 'mom': return SH.momWhere(); case 'rick': return SH.rickWhere(); case 'lily': return SH.lilyWhere(); case 'drunk': return SH.rickDrunk();
      case 'flag': return G.flags[b];
      case 'npc': return SH.World ? SH.World.where(b).loc : null;
      case 'mem': return SH.Mem ? SH.Mem.has(b, c) : false;
      case 'heard': return SH.Rumor ? SH.Rumor.level(b, c) : -1;
      case 'story': return G.story ? G.story[b] : null;
    }
    return undefined;
  };
  EN.cond = function (c) {
    if (c == null) return true;
    if (typeof c === 'function') return !!c();
    if (Array.isArray(c)) return c.every(EN.cond);
    c = c.trim();
    if (c.startsWith('!')) return !EN.cond(c.slice(1));
    let m;
    if ((m = c.match(/^chance\s+([\d.]+)$/))) return Math.random() < +m[1];
    if ((m = c.match(/^has\s+(\w+)$/))) return SH.has(m[1]);
    if ((m = c.match(/^stash\s+(\w+)$/))) return SH.inStash(m[1]);
    if ((m = c.match(/^present\s+(\w+)$/))) return SH.World ? SH.World.isHere(m[1]) : false;
    if (c === 'dark') return SH.isDark();
    if (c === 'weekday') return SH.isWeekday();
    if (c === 'indoor') return !!SH.locIndoor();
    if (c === 'outdoor') return !SH.locIndoor();
    if (c === 'wet') return ['rain', 'storm'].includes(SH.cond());
    if (c === 'phoneok') return SH.Phone.ok();
    if (c === 'athome') return SH.G.loc === 'home' && SH.G.phase === 'home';
    if ((m = c.match(/^([\w.]+)\s+in\s+([\w,\-]+)$/))) return m[2].split(',').includes(String(EN.val(m[1])));
    if ((m = c.match(/^([\w.]+)\s*(<=|>=|==|!=|<|>|=)\s*([\w.\-]+)$/))) return cmp(EN.val(m[1]), m[2], m[3]);
    if ((m = c.match(/^flag\.(\w+)$/))) return !!SH.G.flags[m[1]];
    if (/^[\w.]+$/.test(c)) return !!EN.val(c);
    console.warn('Engine: unknown condition', c); return false;
  };

  /* ---------------- effects ---------------- */
  EN.effect = function (e) {
    if (e == null) return;
    if (typeof e === 'function') return e();
    if (Array.isArray(e)) return e.forEach(EN.effect);
    const G = SH.G; let m; e = e.trim();
    const sp = e.indexOf(' '), head = sp < 0 ? e : e.slice(0, sp), rest = sp < 0 ? '' : e.slice(sp + 1);
    if ((m = head.match(/^rel\.(\w+)$/))) return SH.rel(m[1], +rest);
    if ((m = head.match(/^stat\.(\w+)$/))) return SH.st(m[1], +rest);
    switch (head) {
      case 'money': SH.money(+rest); if (+rest) G.tx.push({ t: G.t, d: 'Misc', a: +rest }); return;
      case 'flag': { const [k, v] = rest.split('='); return SH.flag(k, v == null ? true : num(v)); }
      case 'unflag': delete G.flags[rest]; return;
      case 'item': return rest[0] === '-' ? SH.rmBag(rest.slice(1)) : SH.addBag(rest.replace(/^\+/, ''), true);
      case 'stash': G.stash.push(rest.replace(/^\+/, '')); return;
      case 'time': SH.advance(+rest, { interrupt: false }); return;
      case 'susp': SH.susp(+rest); return;
      case 'heat': G.heat = U.clamp(G.heat + +rest, 0, 100); return;
      case 'grades': G.grades = U.clamp(G.grades + +rest, 0, 100); return;
      case 'pantry': G.pantry = U.clamp(G.pantry + +rest, 0, 100); return;
      case 'bat': G.phone.bat = U.clamp(G.phone.bat + +rest, 0, 100); return;
      case 'log': { const [cls, ...t] = rest.split('|'); SH.UI.log(EN.fill(t.join('|')), cls); return; }
      case 'toast': SH.UI.toast(EN.fill(rest)); return;
      case 'push': { const i = rest.indexOf(' '); SH.Phone.push(rest.slice(0, i), rest.slice(0, i), EN.fill(rest.slice(i + 1))); return; }
      case 'notify': { const [app, title, ...t] = rest.split('|'); SH.Phone.notify(app, EN.fill(title), EN.fill(t.join('|'))); return; }
      case 'post': { const [who, ...t] = rest.split('|'); SH.Phone.addPost(who, EN.fill(t.join('|'))); return; }
      case 'rumor': { const [id, at] = rest.split(' '); SH.Rumor && SH.Rumor.seed(id, at || 'jordan'); return; }
      case 'mem': { const [npc, topic, ...t] = rest.split('|'); SH.Mem && SH.Mem.add(npc, { topic, text: EN.fill(t.join('|')), src: 'saw' }); return; }
      case 'discover': SH.World && SH.World.discover(rest); return;
      case 'event': EN.fire(rest); return;
    }
    console.warn('Engine: unknown effect', e);
  };

  /* ---------------- running events ---------------- */
  EN.eligible = function (ev) {
    const G = SH.G, st = (G.world.ev[ev.id] = G.world.ev[ev.id] || {});
    if (ev.once && st.n) return false;
    if (ev.cooldown && st.last && G.t - st.last < ev.cooldown * 60) return false;
    if (ev.phase && ev.phase !== G.phase) return false;
    return EN.cond(ev.when);
  };
  EN.fire = function (id, force) {
    const ev = typeof id === 'string' ? EN.byId[id] : id; if (!ev) return false;
    if (!force && !EN.eligible(ev)) return false;
    const G = SH.G, st = (G.world.ev[ev.id] = G.world.ev[ev.id] || {});
    st.n = (st.n || 0) + 1; st.last = G.t;
    G.world.log.push({ id: ev.id, t: G.t }); if (G.world.log.length > 300) G.world.log.shift();
    const text = ev.texts ? U.pick(ev.texts) : ev.text;
    if (ev.choices) {
      const show = () => SH.UI.dialog({ title: EN.fill(ev.title || ''), who: ev.who, text: [].concat(EN.fill(text) || []), choices: ev.choices.filter((c) => EN.cond(c.when)).map((c) => ({ t: EN.fill(c.t), sub: c.sub, cls: c.cls, fn: () => { EN.effect(c.effects); if (c.text) SH.UI.log(EN.fill(c.texts ? U.pick(c.texts) : c.text), c.textCls || 'sys'); } })) });
      if (SH.UI.modalOpen()) SH.Events.queue({ id: 'eng_' + ev.id, run: show }); else show();
    } else if (text) SH.UI.log(EN.fill(text), ev.cls || 'sys');
    EN.effect(ev.effects);
    return true;
  };
  // pick one eligible event from a pool by weight
  EN.roll = function (pool, baseChance = 1) {
    const list = (EN.pools[pool] || []).filter(EN.eligible);
    if (!list.length || Math.random() > baseChance) return null;
    const tot = list.reduce((a, e) => a + (e.weight || 1) * (e.chance != null ? e.chance : 1), 0);
    let r = Math.random() * tot;
    for (const e of list) { r -= (e.weight || 1) * (e.chance != null ? e.chance : 1); if (r <= 0) { EN.fire(e, true); return e; } }
    return null;
  };

  EN.hourly = function (opts) {
    const G = SH.G; if (!G || G.ended || opts.sleep) return;
    EN.roll('mundane', G.phase === 'run' ? 0.22 : 0.3);
    EN.roll('notify', 0.18);
    if (G.phase === 'run') EN.roll('run', 0.15);
    SH.Rumor && SH.Rumor.hourly();
  };
})(window.SH);
