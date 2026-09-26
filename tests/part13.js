/* speech engine fixes: friend threads, consequences, PIP rotation */
module.exports = async (run, ev, tp, p) => {
  const say = async (lines) => { const out = []; for (const l of lines) { await ev((l) => { const i = document.querySelector('#tin'); if (!i) return; i.value = l; SH.Talk.say(); }, l); await p.waitForTimeout(2200); out.push('> ' + l + '\n  ' + await ev(() => { const x = [...document.querySelectorAll('#tlog .tl.npc')].pop(); return x ? x.innerText : '(none)'; })); } return out.join('\n'); };
  const open = (id, rel) => ev(([id, rel]) => { const g = SH.G; g.phase = 'home'; g.missingAt = 0; g.away = null; g.t = Math.floor(g.t / 1440) * 1440 + 15 * 60; const f = SH.Friends.st(id); f.met = true; g.rel[id] = rel; document.querySelectorAll('.modal,.overlay').forEach((m) => m.remove && 0); SH.Talk.open(id, { turnsMax: 30 }); return 'open ' + id + ' rel ' + rel; }, [id, rel]);
  const close = () => ev(() => { try { SH.Talk.end && SH.Talk.end(); } catch (e) {} return 'closed'; });
  await run(13, 'the Marco transcript, replayed', async () => {
    tp(await open('marco', 45));
    tp(await say(['hi', 'things arent great', 'my stepdad yells a lot', 'you wanna run away?', 'i mean with me', 'you in or nah tell quick', 'a village', 'tonight']));
    tp(await ev(() => { const f = SH.Friends.st('marco'); return 'marco: ' + JSON.stringify({ knows: f.knows, wouldRun: f.wouldRun, offer: f.offer, rt: f.rt, worry: f.worry, mayTell: f.mayTell }); }));
    tp(await close());
  });
  await run(13, 'where → how bad → decision stays consistent', async () => {
    tp(await open('priya', 30));
    tp(await say(['i think im gonna run away', 'my grandmas in cedar falls', 'yeah its really bad', 'would u come with me?', 'would you come with me?', 'please dont tell anyone']));
    tp(await ev(() => { const f = SH.Friends.st('priya'); return 'priya dec ' + (f.rt || {}).dec + ' asks ' + (f.rt || {}).asks + ' secret ' + f.secret + ' mayTell ' + f.mayTell; }));
    tp(await close());
  });
  await run(13, 'a scared friend tells their parent the next day', async () => {
    tp(await ev(() => { const f = SH.Friends.st('eli'); f.met = true; f.rt = { asks: 0, dec: 'no' }; SH.G.rel.eli = 10; return 'eli forced dec=no'; }));
    tp(await open('eli', 10));
    tp(await say(['im gonna run away', 'would you come with me?', 'come with me please']));
    tp(await ev(() => { const f = SH.Friends.st('eli'); const d = f.mayTell; SH.G.t += 1440; SH.K.daily.forEach((fn) => { try { fn(SH.day()); } catch (e) {} }); return 'mayTell was ' + d + ' | told ' + f.told + ' | mom: ' + ((SH.G.threads.mom || []).slice(-1)[0] || {}).text + ' | eli: ' + ((SH.G.threads.eli || []).slice(-1)[0] || {}).text; }));
    tp(await ev(() => 'greeting: ' + SH.Mem.greeting('eli')));
    tp(await close());
  });
  await run(13, 'PIP options change every press and skip said lines', async () => {
    tp(await open('nia', 40));
    const presses = []; for (let i = 0; i < 4; i++) presses.push(await ev(() => { const last = ([...document.querySelectorAll('#tlog .tl.npc')].pop() || {}).innerText || ''; return SH.PIP.suggest('nia', last, 'talk').map((x) => x.tone[0] + ':' + x.t).join(' | '); }));
    tp(presses.join('\n'));
    tp(await say(['Honestly, things aren\'t great.']));
    tp(await ev(() => { const last = ([...document.querySelectorAll('#tlog .tl.npc')].pop() || {}).innerText || ''; const s = SH.PIP.suggest('nia', last, 'talk'); return 'after saying it: ' + s.map((x) => x.t).join(' | ') + ' | contains said: ' + s.some((x) => /things aren't great/i.test(x.t)); }));
    tp(await say(['i wanna run away']));
    tp(await ev(() => { const last = ([...document.querySelectorAll('#tlog .tl.npc')].pop() || {}).innerText || ''; return 'thread opts: ' + SH.PIP.suggest('nia', last, 'talk').map((x) => x.t).join(' | '); }));
    tp(await close());
  });
};
