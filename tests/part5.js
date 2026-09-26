module.exports = async (run, ev, tp, p) => {
  const say = async (lines) => { const out = []; for (const l of lines) { await ev((l) => { const i = document.querySelector('#tin'); if (!i) return; i.value = l; SH.Talk.say(); }, l); await p.waitForTimeout(1700); out.push('> ' + l + '\n  ' + await ev(() => { const x = [...document.querySelectorAll('#tlog .tl.npc')].pop(); return x ? x.innerText : '(none)'; })); } return out.join('\n'); };
  await run(5, 'runaway kids, group, base, business', async () => {
    tp(await ev(() => { const g = SH.G; g.party = []; g.rkids = []; const v = T.go('city', (x) => SH.Runaways.kidAt(x)); g.t = Math.floor(g.t / 1440) * 1440 + 13 * 60; SH.Atlas.hub(); const kid = T.acts().find((x) => /🧒/.test(x)); T.clk('🧒'); return v.name + ' ' + kid + ' :: ' + document.querySelector('#tlog').innerText.replace(/\n+/g, ' / '); }));
    tp(await say(['are you okay?', 'i ran away too, my stepdad is awful', 'what happened to you?', 'want some fries? i have food', 'you can come with us, we stick together']));
    await p.waitForTimeout(300); tp(await ev(() => { SH.Talk.close(); return T.text().slice(0, 200) + ' | rkids ' + JSON.stringify(SH.G.rkids) + ' grp ' + SH.K.grp(); }));
    tp(await ev(() => { T.clk('Okay'); SH.Atlas.hub(); T.clk('You & your group'); return T.acts().join(' | '); }));
    // endings see rk kids
    tp(await ev(() => { const c = SH.EndX.ctx('x'); return 'ctx party ' + c.pl + ' n=' + c.n; }));
    // group mult by stay
    tp(await ev(() => { const v = SH.Atlas.here(), g = SH.G; g.stay = { pid: v.id, since: g.t }; const a = SH.Group.mult(v); g.stay.since -= 7 * 1440; const b = SH.Group.mult(v); g.stay.since = g.t; return `group mult day0 ${a} day7 ${b.toFixed(2)}`; }));
    // homesick comfort
    await ev(() => { const g = SH.G; g.party = ['nia']; SH.Friends.st('nia').home = 16; SH.UI.dialog({ title: 'Getting quiet', who: 'nia', text: ['test'], choices: [{ t: 'Go back', fn: () => {} }, { t: 'Let them go', fn: () => {} }] }); });
    tp(await ev(() => T.acts().join(' | ')));
    await ev(() => T.clk('Sit with them'));
    tp(await say(["it's okay to miss her, that's not dumb", "i'm here with you no matter what", 'maybe text your mom that you are okay']));
    await p.waitForTimeout(300); tp(await ev(() => { SH.Talk.close(); return 'nia home=' + SH.Friends.st('nia').home + ' att ' + JSON.stringify(SH.G.att) + ' pw ' + (SH.G.pw && SH.G.pw.nia && SH.G.pw.nia.w); }));
    // base
    tp(await ev(() => { const g = SH.G; const v = T.go('village'); g.t = Math.floor(g.t / 1440) * 1440 + 10 * 60; g.base = null; let tries = 0; while (!g.base && tries++ < 10) { SH.Bases.search(v); if (/Make it your base/.test(T.text())) T.clk('Make it your base'); } return T.text().slice(0, 300); }));
    tp(await ev(() => { ['tarp', 'sleepbag', 'lantern', 'bucket'].forEach((i) => SH.Catalog.give('x_' + i)); T.clk('Fix it up'); T.clk('Tarp'); T.clk('Real bedding'); T.clk('Lantern'); T.clk('bucket'); return T.acts().slice(0, 5).join(' | ') + ' up=' + SH.G.base.up; }));
    tp(await ev(() => { const g = SH.G; g.t = Math.floor(g.t / 1440) * 1440 + 21 * 60; SH.Bases.sleep(SH.Atlas.here()); return T.text().slice(0, 200) + ' energy ' + g.s.energy.toFixed(0) + ' nights ' + (g.base && g.base.nights); }));
    // business
    tp(await ev(() => { const g = SH.G; const v = T.go('town'); g.t = Math.floor(g.t / 1440) * 1440 + 10 * 60; g.money = 50; SH.Biz.menu(v); return T.acts().join(' | '); }));
    tp(await ev(() => { T.clk('Lemonade'); document.querySelector('#kask').value = 'Frog & Friends Lemonade'; document.querySelector('#kaskOk').click(); return 'ok'; }));
    await p.waitForTimeout(100);
    tp(await ev(() => { let s = T.text().slice(0, 80); for (let i = 0; i < 5 && /^Roles/.test(T.text()); i++) T.clk(['Sell', 'Make', 'Lookout'][i % 3]); s += ' → ' + T.text().slice(0, 250); T.clk('Run a shift'); s += '\n>> ' + T.text().slice(0, 350); T.clk('Keep'); return s + ' money ' + SH.G.money; }));
  });
};
