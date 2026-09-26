/* group chats with memory */
module.exports = async (run, ev, tp, p) => {
  // send as the player (P.reply directly, then collect everything new in the thread after follow-ups land)
  const chat = async (id, lines, wait = 5200) => { const out = []; for (const l of lines) { const n0 = await ev(([id, l]) => { const th = SH.G.threads[id] || []; const n = th.length; SH.Phone.push(id, 'me', l, false); SH.Phone.reply(id, l); return n; }, [id, l]); await p.waitForTimeout(wait); out.push('> ' + l + '\n    ' + (await ev(([id, n0]) => (SH.G.threads[id] || []).slice(n0 + 1).filter((m) => m.from !== 'me').map((m) => m.text).join('\n    '), [id, n0]))); } return out.join('\n'); };
  await run(12, 'class chat: topics, memory, beef, recall', async () => {
    await ev(() => { const g = SH.G; g.phase = 'home'; g.missingAt = 0; g.away = null; g.t = Math.floor(g.t / 1440) * 1440 + 17 * 60; });
    tp(await chat('class', ['anyone do the science worksheet?', 'devon are u doing the skyforge raid', 'my favorite game is skyforge', 'ur all so stupid', 'anyway whats up', 'sorry', 'what did devon say', 'who said page 42', 'catch me up']));
    tp(await ev(() => { const s = SH.GChat.st('class'); s.asked = { who: 'maddie.k', k: 'dance', t: SH.G.t }; return 'asked: maddie.k dance'; }));
    tp(await chat('class', ['yeah', 'i feel really sad lately']));
    tp(await ev(() => { const s = SH.GChat.st('class'); SH.G.t += 20 * 60; SH.GChat.hourly(10); return 'facts ' + JSON.stringify(s.facts) + ' | next day: ' + (SH.G.threads.class.slice(-1)[0] || {}).text; }));
  });
  await run(12, 'class chat while missing', async () => {
    tp(await ev(() => { const g = SH.G; g.phase = 'run'; g.missingAt = g.t - 2 * 1440; g.reported = true; g.heat = 20; return 'missing'; }));
    tp(await chat('class', ['hey guys', "i'm ok. i'm going to cedar falls", 'please dont tell anyone']));
    tp(await ev(() => 'heat ' + SH.G.heat + ' toldClassPlace ' + SH.G.flags.toldClassPlace));
  });
  await run(12, 'the squad: friends group chat', async () => {
    tp(await ev(() => { const g = SH.G; g.phase = 'home'; g.missingAt = 0; ['nia', 'marco', 'priya'].forEach((id) => { SH.Friends.st(id).met = true; g.rel[id] = 40; }); g.t = Math.floor(g.t / 1440) * 1440 + 16 * 60; SH.GChat.hourly(16); return 'created: ' + JSON.stringify((g.threads.crew || []).map((m) => m.text)) + ' | in Messages: ' + SH.Friends.threadIds().includes('crew') + ' | available nia ' + [0, 1, 2, 3, 4].map(() => SH.Phone.available('nia')).join(','); }));
    await p.waitForTimeout(600);
    tp(await chat('crew', ['hey guys what are yall doing', 'nia do u want to draw later?', 'my favorite color is green', "what's up marco"]));
    tp(await ev(() => { const k = SH.Mind.knownBy ? SH.Mind.knownBy('fav:color') : []; return 'fav:color heard by ' + JSON.stringify(k); }));
    tp(await ev(() => { const c = { turn: 1, mem: {} }; return 'ask priya 1:1 "whats my favorite color": ' + SH.Brain.priya(SH.NLP.analyze("what's my favorite color?"), c).say; }));
    tp(await ev(() => { SH.G.party = ['nia']; return 'ok'; }));
    tp(await chat('crew', ['nia hi', 'what did i say about green']));
  });
};
