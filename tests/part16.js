/* PIP context: follow-ups, typo'd towns, "there", place facts, Harlow spots */
module.exports = async (run, ev, tp, p) => {
  const say = async (list) => { for (const q of list) tp(`> ${q}\n  ${(await ev((q) => SH.PIP.reply(q), q)).replace(/\n/g, ' / ')}`); };
  await run(16, 'rides with follow-ups (in Harlow)', async () => {
    await ev(() => { const g = SH.G; g.away = null; g.money = 60; SH.Routes.net(); window._n = SH.Atlas.data().places.filter((x) => !x.home && x.served)[4].name; window._m = SH.Atlas.data().places.filter((x) => !x.home && x.served)[9].name; });
    const n = await ev(() => _n), m = await ev(() => _m), typo = n.slice(0, -2) + n.slice(-1); // drop a letter
    await say([`bus to ${typo.toLowerCase()} tmrw`, 'how much?', 'when does it leave', 'where do i get on', 'is it direct', 'do they check ids', 'cheaper?', 'faster', 'and tonight?', `what about ${m.toLowerCase()}`, `${n.toLowerCase()}?`]);
  });
  await run(16, 'place facts, "there", Harlow spots, book it', async () => {
    const n = await ev(() => _n);
    await say([`is there a motel in ${n.toLowerCase()}`, 'wifi there?', 'any cops there', 'how far is it', 'how do i get there', 'book it']);
    tp('browser now at: ' + await ev(() => SH.Browser.url));
    await say(['where do tempos leave from', 'tell me about grandmas town', 'my ticket', 'hi pip', 'im scared']);
  });
};
