/* speech memory + understanding */
module.exports = async (run, ev, tp, p) => {
  const say = async (lines) => { const out = []; for (const l of lines) { await ev((l) => { const i = document.querySelector('#tin'); if (!i) return; i.value = l; SH.Talk.say(); }, l); await p.waitForTimeout(1500); out.push('> ' + l + '\n  ' + await ev(() => { const x = [...document.querySelectorAll('#tlog .tl.npc')].pop(); return x ? x.innerText : '(none)'; })); } return out.join('\n'); };
  const local = (i) => ev((i) => { const p = SH.Atlas.here(); const who = p.people[i]; Object.assign(SH.NPCS_META.local, { n: who.n, ini: who.n[0], full: who.n + ', ' + p.name }); SH.Talk.open('local', { first: `Well hey there. I'm ${who.n}. I don't think I know you. Whose kid are you?`, turnsMax: 12, local: who, place: p, onEnd: () => {} }); return who.n + ' @' + p.name + ' (' + p.tier + ') :: ' + document.querySelector('#tlog').innerText.replace(/\n+/g, ' / '); }, i);
  await run(9, 'understanding', async () => {
    tp(await ev(() => ["you're not stupid", 'i never ran away', "i don't feel safe", "i'm not going home", 'my name is Jordan', "im 12", "i'm from cedar falls", 'heading to port aldine tomorrow', "my mom is parking the car", "i'm visiting my aunt", 'can i pay 40 for 3 nights', 'what about a week', 'how old am i', 'i dont have any money', 'I am Casey'].map((s) => { const a = SH.NLP.analyze(s); return s + ' => [' + Object.keys(a.I).join(',') + '] ' + JSON.stringify(a.claims) + (a.money ? ' $' + a.money : '') + (a.nights ? ' n' + a.nights : '') + (a.memq ? ' memq:' + a.memq.key : ''); }).join(' ## ')));
    tp(await ev(() => { SH.NLP.analyze('my mom has been weird'); const a = SH.NLP.analyze('is she okay?'); return 'pronoun ref: ' + a.ref; }));
  });
  await run(9, 'strangers remember; no re-asking; contradictions; small towns talk', async () => {
    await ev(() => T.go('village', (x) => x.people && x.people.length >= 3));
    tp(await local(0));
    tp(await say(['jordan', 'hi', "I'm 12", 'where am I going? wait what is my name', "i'm heading to port aldine"]));
    await ev(() => SH.Talk.close());
    tp(await local(0));
    tp(await say(['my name is Casey', 'how old am i', 'actually my name is Riley', 'no wait its Casey']));
    await ev(() => SH.Talk.close());
    tp(await ev(() => 'notice ' + SH.G.awayNotice + ' claims ' + JSON.stringify(Object.keys(SH.G.claims))));
    tp(await local(1));
    tp(await say(['what do you know about me?']));
    await ev(() => SH.Talk.close());
  });
  await run(9, 'core characters + separate people', async () => {
    tp(await ev(() => { SH.G.away = null; const r = SH.Brain.mom(SH.NLP.analyze('my name is Jordan'), { npc: 'mom', turn: 1, mem: {} }); return 'mom: ' + r.say; }));
    tp(await ev(() => { const r = SH.Brain.mom(SH.NLP.analyze("what's my name?"), { npc: 'mom', turn: 2, mem: {} }); return 'mom: ' + r.say; }));
    tp(await ev(() => { const c = { turn: 0, mem: {} }; const said = (s) => { c.turn++; return '> ' + s + ' :: ' + SH.Brain.jordan(SH.NLP.analyze(s), c).say; }; return [said('my favorite color is green'), said("you're not stupid lol"), said("what's my favorite color?"), said('i never ran away btw')].join(' ## '); }));
    tp(await ev(() => { const a = SH.Mind.who('local', { npc: 'local' }), b = SH.Mind.who('rk', { npc: 'rk_2' }); return 'keys: ' + a + ' | ' + b; }));
    tp(await ev(() => { const s = SH.Mind.noReask('clerk:Test', "Sure. What's your name? And how old are you?"); SH.G.claims['clerk:Test'] = { f: { name: { v: 'Riley' }, age: { v: 12 } }, asks: {}, n: 1 }; return SH.Mind.noReask('clerk:Test', "Sure. What's your name? And how old are you?") + ' (before: ' + s + ')'; }));
  });
};
