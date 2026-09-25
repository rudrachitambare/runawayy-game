/* SMALL HOURS — free-text conversations */
(function (SH) {
  const $ = (s) => document.querySelector(s);
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const T = SH.Talk = { cur: null };

  T.open = function (npc, opts = {}) {
    const G = SH.G, m = SH.NPCS_META[npc];
    const conv = { npc, ctx: opts.ctx || 'talk', turn: 0, mem: {}, used: {}, forceDrunk: opts.forceDrunk, opts };
    // persistent memory of what was used/learned across conversations
    const pm = G.convMem['talk_' + npc] = G.convMem['talk_' + npc] || { used: {}, times: 0 };
    conv.used = pm.used; pm.times++;
    T.cur = conv;
    conv.rec = SH.Mem.startConvo(npc, conv.ctx, opts.phone ? 'call' : 'person');
    if (!opts.intro && !opts.phone && (!opts.ctx || ['drop', 'meet', 'run', 'rumor'].includes(opts.ctx))) { const rc = SH.Mem.recall(npc); if (rc) opts.first = rc; }
    if (!opts.first && !opts.intro) opts.first = SH.Mem.greeting(npc);
    const md = $('#modal'); md.classList.remove('hidden');
    md.innerHTML = `<div class="mbox"><div class="mhead"><div class="av" style="background:${m.col}">${m.ini}</div><div><h3>${m.n}</h3><small>${m.full}${opts.phone ? ' · on the phone' : ''}</small></div>
      <div style="flex:1"></div><small id="talkRel"></small></div>
      <div class="talklog" id="tlog"></div>
      <div class="sugg" id="tsugg" style="padding:0 14px 6px"></div>
      <div class="talkin"><button class="btn" title="PIP whispers suggestions" id="tpip">◉ PIP</button><input type="text" id="tin" placeholder="Type what you say… anything." autocomplete="off"><button class="btn primary" id="tsend">Say</button><button class="btn" id="tleave">${opts.noLeave ? '' : 'Leave'}</button></div>
      <div class="hint">No dialogue menus: type what ${G.name} says. Tone, honesty and what you reveal all matter. PIP can whisper ideas (if your phone has battery).</div></div>`;
    if (opts.noLeave) $('#tleave').style.display = 'none';
    const inp = $('#tin');
    inp.onkeydown = (e) => { e.stopPropagation(); if (e.key === 'Enter') T.say(); };
    $('#tsend').onclick = () => T.say();
    $('#tleave').onclick = () => T.close();
    $('#tpip').onclick = () => T.suggest();
    if (opts.intro) T.line('narr', opts.intro);
    if (opts.first) T.line('npc', opts.first);
    T.showRel();
    setTimeout(() => inp.focus(), 50);
  };
  T.showRel = function () { /* intentionally no trust meter: read the room instead */ };
  T.line = function (who, text) {
    text = SH.nm(text);
    T.cur && SH.Mem.logLine(T.cur.rec, who, text);
    const l = $('#tlog'); if (!l) return; const d = document.createElement('div'); d.className = 'tl ' + who; d.textContent = text; l.appendChild(d); l.scrollTop = l.scrollHeight;
  };
  T.suggest = function () {
    const c = T.cur; if (!c) return;
    if (!SH.Phone.ok()) { SH.UI.toast('Your phone is dead. PIP can\'t help. You\'re on your own.'); return; }
    const last = [...document.querySelectorAll('#tlog .tl.npc')].pop();
    const sug = SH.PIP.suggest(c.npc, last ? last.textContent : '', c.ctx);
    const el = $('#tsugg'); el.innerHTML = sug.map((s) => `<button data-t="${esc(s.t)}"><b>${s.tone}</b>${esc(s.t)}</button>`).join('');
    el.querySelectorAll('button').forEach((b) => (b.onclick = () => { $('#tin').value = b.dataset.t; el.innerHTML = ''; $('#tin').focus(); }));
    SH.G.phone.bat = Math.max(0, SH.G.phone.bat - 0.3);
  };
  T.say = function () {
    const c = T.cur; if (!c || c.ended) return; const inp = $('#tin'); const text = inp.value.trim(); if (!text) return; inp.value = ''; $('#tsugg').innerHTML = '';
    T.line('me', text);
    if (c.lastText && c.lastText.toLowerCase() === text.toLowerCase()) { T.line('npc', SH.util.pick(['You just said that.', '...You said that already.', 'Okay. I heard you the first time.'])); return; }
    c.lastText = text; c.turn++;
    const an = SH.NLP.analyze(text), tone = SH.Tone.read(text);
    const mo = SH.Mem.observe(c.npc, text, c.opts.phone ? 'call' : 'person', an);
    const tr = SH.Tone.react(c.npc, tone, c);
    const brain = SH.Brain[c.npc];
    const r = brain ? brain(an, c) : { say: '...', fx: {} };
    // memory & tone modulate the brain's effect: e.g. a recent unforgiven insult cools any warmth
    const ins = SH.Mem.last(c.npc, 'insult'); if (ins && !ins.forgiven && SH.day() - ins.d <= 2 && r.fx && r.fx.rel > 0) r.fx.rel = Math.ceil(r.fx.rel / 2);
    SH.UI.applyFx(c.npc, r);
    if (tr) SH.UI.applyFx(c.npc, { fx: tr.fx }); if (mo.fx) SH.UI.applyFx(c.npc, { fx: mo.fx });
    SH.advance(4, { interrupt: false });
    setTimeout(() => {
      if (tr && tr.pre) T.line(/^\(/.test(tr.pre) ? 'narr' : 'npc', tr.pre.replace(/^"|"$/g, ''));
      if (mo.callback) T.line('npc', mo.callback);
      T.line('npc', SH.NLP.fill(r.say));
      if (r.narr) T.line('narr', r.narr);
      T.showRel(); SH.UI.renderSide();
      const max = c.opts.turnsMax || 12;
      if (r.end || c.turn >= max) T.finish();
    }, 350 + Math.min(1200, r.say.length * 8));
  };
  T.finish = function () {
    const c = T.cur; if (!c) return; c.ended = true;
    const bar = document.querySelector('.talkin');
    bar.innerHTML = `<div style="flex:1;color:var(--muted);font-size:13px;align-self:center">The conversation is over.</div><button class="btn primary" id="tdone">Continue</button>`;
    $('#tdone').onclick = () => T.close();
  };
  T.close = function () {
    const c = T.cur; T.cur = null;
    $('#modal').classList.add('hidden'); $('#modal').innerHTML = '';
    if (c && c.opts.onEnd) c.opts.onEnd(c);
    SH.UI.afterAction();
  };
})(window.SH);
