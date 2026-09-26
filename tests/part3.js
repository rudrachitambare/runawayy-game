module.exports = async (run, ev, tp, p) => {
  const say = async (lines) => { const out = []; for (const l of lines) { await ev((l) => { const i = document.querySelector('#tin'); if (!i) return; i.value = l; SH.Talk.say(); }, l); await p.waitForTimeout(1700); out.push('> ' + l + '\n  ' + await ev(() => { const x = [...document.querySelectorAll('#tlog .tl.npc')].pop(); return x ? x.innerText : '(none)'; })); } return out.join('\n'); };
  const deskOf = (tier, kind) => ev(([tier, kind]) => { const v = T.go(tier, (x) => SH.Motels.motels(x).some((m) => m.k === kind)); SH.G.money = 500; SH.G.t = Math.floor(SH.G.t / 1440) * 1440 + 21 * 60; const m = SH.Motels.motels(v).find((m) => m.k === kind); SH.Motels.desk(v, m); return `${v.name}: ${m.n} (${kind}, $${m.rate}) :: ` + document.querySelector('#tlog').innerText.replace(/\n+/g, ' / '); }, [tier, kind]);
  await run(3, 'motels + side streets', async () => {
    tp(await ev(() => { T.go('city'); SH.Atlas.hub(); return T.acts().filter((x) => /Motel|Side/.test(x)).join(' | '); }));
    tp(await deskOf('town', 'loose'));
    tp(await say(['how much is it', 'my mom is in the car, she is really tired', 'what about a week', 'I can do 200', '250', 'deal']));
    await p.waitForTimeout(300); tp(await ev(() => { SH.Talk.close(); return T.text() + ' | room ' + JSON.stringify(SH.G.room) + ' money ' + SH.G.money; }));
    tp(await ev(() => { if (/one room|rooms side/i.test(T.text())) T.clk('Never'); SH.Atlas.hub(); return T.acts().slice(0, 3).join(' | '); }));
    tp(await ev(() => { if (!SH.G.room) return 'no room'; T.clk('Your room'); T.clk('Sleep'); return T.text().slice(0, 200) + ' energy ' + SH.G.s.energy + ' bat ' + SH.G.phone.bat; }));
    tp(await ev(() => { if (!SH.G.room) return 'no room'; SH.G.roomEvt = 'spooked'; SH.Atlas.hub(); T.clk('Something'); return T.text().slice(0, 250) + ' room=' + SH.G.room; }));
    tp(await deskOf('city', 'pro'));
    tp(await say(['hi can I get a room', 'my dad is parking the car', 'ok deal']));
    await ev(() => SH.Talk.close());
    tp(await deskOf('city', 'sloppy'));
    tp(await say(['20 bucks', '22', '24', 'fine']));
    await p.waitForTimeout(300); tp(await ev(() => { SH.Talk.close(); return 'sloppy → room ' + (SH.G.room && SH.G.room.rate); }));
    tp(await deskOf('town', 'loose'));
    tp(await say(['I ran away from home']));
    await ev(() => SH.Talk.close());
    // side streets
    tp(await ev(() => { const v = T.go('city'); SH.G.money = 300; SH.G.t = Math.floor(SH.G.t / 1440) * 1440 + 14 * 60; SH.Alley.streets(v); return T.acts().join(' | '); }));
    tp(await ev(() => { T.clk('diner'); T.clk('Hash'); T.clk('Okay'); T.clk('Listen'); return T.text().slice(0, 200); }));
    tp(await ev(() => { const v = SH.Atlas.here(); SH.Alley.dealer(v); T.clk('cheap one'); return T.text().slice(0, 250) + ' fakeId=' + JSON.stringify(SH.G.fakeId); }));
    tp(await ev(() => { const v = SH.Atlas.here(); SH.Alley.creep(v, 0); const a = T.text().slice(0, 200); T.clk('diner and tell'); return a + '\n>> ' + T.text().slice(0, 250); }));
    tp(await ev(() => { SH.addBag('x_powerbank', true); const v = SH.Atlas.here(); SH.Alley.streets(v); T.clk('Pawn'); return T.acts().join(' | '); }));
  });
  await run(3, 'fake ID at a pro motel', async () => {
    tp(await deskOf('city', 'pro'));
    tp(await say(['here is my id']));
    await p.waitForTimeout(300); tp(await ev(() => { SH.Talk.close(); return T.text().slice(0, 200) + ' heat ' + SH.G.heat + ' fakeId ' + SH.G.fakeId; }));
  });
};
