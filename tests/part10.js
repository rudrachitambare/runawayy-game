/* PIP, actually useful */
module.exports = async (run, ev, tp, p) => {
  const ask = (qs) => ev((qs) => qs.map((q) => '> ' + q + '\n  ' + SH.PIP.reply(q).replace(/\n/g, '\n  ')).join('\n'), qs);
  await run(10, 'PIP on the road', async () => {
    await ev(() => { const v = T.go('town', (x) => SH.Motels.motels(x).length >= 2); SH.G.missingAt = SH.G.t - 3 * 1440; SH.G.money = 140; SH.G.awayNotice = 45; SH.G.heat = 35; SH.G.reported = true; SH.G.party = ['nia']; SH.G.hp = { cold: 30, blist: 40, debt: 0 }; SH.G.t = Math.floor(SH.G.t / 1440) * 1440 + 14 * 60; return v.name; });
    const far = await ev(() => { const p = SH.Atlas.here(); return SH.Atlas.data().places.filter((x) => x.id !== p.id && SH.Routes.journeys(p, x, SH.G.t, 3).length).sort((a, b) => Math.hypot(b.x - p.x, b.y - p.y) - Math.hypot(a.x - p.x, a.y - p.y))[0].name; });
    tp(await ask(['where am i', `how do i get to ${far.toLowerCase()}`, "what's leaving", 'where can i sleep tonight', 'motel tips']));
    tp(await ask(['where can i buy a sleeping bag', 'money', 'am i safe here?', 'i feel sick', 'can i disappear for good', 'how are nia\'s parents doing', 'what do i say to a cop']));
    tp(await ask([`i want to get to ${far}`, 'remind me', 'what should i do', 'asdf qwerty']));
    tp(await ev(() => SH.PIP.plan().join(' || ')));
  });
  await run(10, 'PIP whispers for new people', async () => {
    tp(await ev(() => { const p = SH.Atlas.here(); const m = SH.Motels.motels(p).find((x) => x.k !== 'pro') || SH.Motels.motels(p)[0]; SH.Motels.desk(p, m); const s = SH.PIP.suggest('clerk', 'Just you? Where are your parents?'); const s2 = SH.PIP.suggest('clerk', 'How much? Well, rate is what it is.'); SH.Talk.close(); return m.k + ' $' + m.rate + ' :: ' + s.map((x) => x.tone + ': ' + x.t).join(' | ') + ' :: ' + s2.map((x) => x.t).join(' | '); }));
    tp(await ev(() => { SH.G.cover = SH.G.cover || {}; SH.G.cover[SH.Atlas.here().id] = { name: 'Riley', story: 'Visiting my aunt', told: [] }; return SH.PIP.suggest('local', "Well hey there. What's your name?").map((x) => x.t).join(' | ') + ' :: ' + SH.PIP.suggest('host_nia', 'Where is she??').map((x) => x.t).join(' | '); }));
  });
  await run(10, 'PIP at home still works', async () => {
    tp(await ev(() => { SH.G.away = null; return ['hi', 'what should i do', 'how do i get to cedar falls', 'battery'].map((q) => '> ' + q + ' :: ' + SH.PIP.reply(q).slice(0, 160)).join('\n'); }));
  });
};
