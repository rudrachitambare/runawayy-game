module.exports = async (run, ev, tp, p) => {
  await run(2, 'lessons, stores, road endings', async () => {
    tp(await ev(() => { const v = T.go('village'); SH.G.money = 100; SH.Atlas.hub(); return v.name + ' HUB: ' + T.acts().join(' | '); }));
    tp(await ev(() => { T.clk("'s farm"); const a = T.text(); T.clk('You take'); const b = T.text(); T.clk('Another'); T.clk('You take'); T.clk('Another'); SH.G.t -= 600; T.clk('You take'); T.clk('Another'); return a.slice(0,150) + '\n>> ' + b.slice(-200) + '\n>> skill ' + SH.skill('drive') + ' | ' + T.acts().join(' | '); }));
    tp(await ev(() => { T.clk('Ask if you can stay'); return T.text(); }));
    tp(await ev(() => { T.go('city'); SH.Atlas.hub(); T.clk('Stores'); const a = T.text(); T.clk('Pharmacy'); const b = T.acts().join(' | '); T.clk('Health'); const c = T.acts().join(' | '); return a + '\n>> ' + b + '\n>> ' + c; }));
    tp(await ev(() => { const m0 = SH.G.money; const a = T.clk('First-aid'); const cm = T.acts().find((x) => /cold|medicine/i.test(x)); let r = ''; if (cm) r = T.clk('Cold medicine'); return `money ${m0}→${SH.G.money} notice ${SH.G.awayNotice}\n>> restricted: ${r}`; }));
    tp(await ev(() => { T.go('town'); SH.Atlas.hub(); T.clk('Stores'); T.clk('Supermarket'); const cats = T.acts().join(' | '); const ad = T.acts().find((x) => /adult|18/i.test(x)); if (!ad) return 'cats: ' + cats; T.clk('18\\+'); const it = T.acts()[0]; T.clk('^1 '); return 'adult item ' + it + ' → ' + [...document.querySelectorAll('.toast2')].map((x) => x.innerText).join(' ; ') + ' money ' + SH.G.money; }));
    tp(await ev(() => { T.go('town'); SH.G.t = Math.floor(SH.G.t / 1440) * 1440 + 720; SH.Atlas.hub(); T.clk('Go-kart'); T.clk('You race'); return T.text() + ' skill ' + SH.skill('drive'); }));
    tp(await ev(() => ['crash', 'crashDitch', 'crashHurt', 'driveStop', 'outOfGas', 'dog', 'storm', 'lostWoods', 'riverCold', 'scooterFall', 'escootDead', 'bikeLong', 'walkHighway', 'farm', 'van'].map((k) => k + ':' + (SH.EndX.defs ? SH.EndX.defs.filter((d) => d.on.includes(k)).length : '?')).join(' ')));
  });
};
