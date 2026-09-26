module.exports = async (run, ev, tp, p) => {
  await run(7, 'endings render + disappear for good', async () => {
    tp(await ev(() => { const g = SH.G, v = T.go('city'); g.phase = 'run'; g.missingAt = g.t - 25 * 1440;
      g.base = { type: 'camp', pid: v.id, up: ['tarp', 'bed', 'light', 'food', 'lock'], nights: 9 }; g.room = { pid: v.id, n: 'Pine Rest Motel', k: 'loose', clerk: 'Gloria', rate: 39, until: g.t + 9 * 1440, how: 'sep' };
      g.biz = { [v.id]: { kind: 'fix', name: 'Sam Fix', roles: {}, shifts: 12, total: 180, pid: v.id } }; g.rkids = ['rk_p2']; if (!SH.NPCS_META.rk_p2) SH.Runaways.kidAt(SH.Atlas.data().places[2]); g.party = ['nia'];
      g.cover = { [v.id]: { name: 'Jordan', story: 'grandma', told: [] } }; g.look = { hair: 1, dye: 1, glasses: 1, clothes: 1 }; g.street = { [v.id]: 40 }; g.lessons = { n: 6, fsk: {}, kart: 1, farm: v.id };
      g.pw = { nia: { w: 70, note: { text: 'x', s: 4 }, chirp: true } }; g.fakeId = { q: 'ok', name: 'Casey Reed' }; g.hp = { cold: 60, blist: 70, debt: 0 }; g.watch = { [v.id]: 1 }; g.excuse = { a: { story: 'school' }, b: { story: 'charity' } }; g.helped = 1; g.att = { nia: 70 }; Object.assign(g.flags, { clerkCalled: 'Pine Rest', fakeCaught: 'Starlite', toldParentPlace: v.name, charityExposed: 'Paws', creepDiner: 'Bev', goneOffered: 1 }); g.crush = { id: 'nia', status: 'going' };
      const X = SH.EndX, keys = new Set(['gone', 'fever', 'exhaust', 'foundHome', 'foundSafe', 'rkSafe', 'farm', 'crash', 'crashDitch', 'crashHurt', 'driveStop', 'outOfGas', 'van', 'dog', 'storm', 'lostWoods', 'riverCold', 'scooterFall', 'escootDead', 'bikeLong', 'walkHighway']);
      const defs = X.defs.filter((d) => d.on.some((k) => keys.has(k))); const bad = []; let ok = 0;
      defs.forEach((d) => { const c = X.ctx(d.on[0], { place: v, kid: 'Owen', farmer: 'Ray Okonkwo', to: v }); let wOk; try { wOk = !d.w || d.w(c); } catch (e) { wOk = 'ERR ' + e.message; } try { const s = [typeof d.t === 'function' ? d.t(c) : d.t, typeof d.sub === 'function' ? d.sub(c) : d.sub].concat(d.x(c)).join(' '); if (/undefined|NaN|\[object|null/.test(s)) bad.push(d.k + ': ' + s.match(/.{0,40}(undefined|NaN|\[object|null).{0,20}/)[0]); else ok++; } catch (e) { bad.push(d.k + ' THROW ' + e.message); } if (typeof wOk === 'string') bad.push(d.k + ' w ' + wOk); });
      const uniq = new Set(X.defs.map((d) => d.k)).size;
      return `new-system ending defs: ${defs.length}, rendered clean: ${ok}, unique ending keys total: ${uniq}\nbad: ${bad.join('\n')}`; }));
    tp(await ev(() => { const v = SH.Atlas.here(); const ps = SH.NotFound.pillars(v); SH.G.heat = 10; SH.G.awayNotice = 5; return 'pillars ' + JSON.stringify(ps) + ' ready ' + SH.NotFound.ready(v); }));
    tp(await ev(() => { const g = SH.G; g.base = null; const c = SH.EndX.ctx('gone', {}); return 'gone candidates now: ' + SH.EndX.defs.filter((d) => d.on.includes('gone') && (!d.w || (() => { try { return d.w(c); } catch (e) { return false; } })())).map((d) => d.k + ':' + d.p).join(' '); }));
    tp(await ev(() => { SH.Atlas.hub(); T.clk('You & your group'); T.clk('Disappear for good'); const a = T.text().slice(0, 400); T.clk('^1 · Disappear'); T.clk('Yes. Stay gone'); return a + '\n>> ENDING: ' + (document.querySelector('#modal .mbox, #ending, .ending') || document.body).innerText.replace(/\n+/g, ' / ').slice(0, 600); }));
  });
};
