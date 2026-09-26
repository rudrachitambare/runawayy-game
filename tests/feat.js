const { chromium } = require('playwright-core');
(async () => {
  const b = await chromium.launch({ executablePath: '/usr/bin/chromium', args: ['--no-sandbox'] });
  const p = await b.newPage({ viewport: { width: 1366, height: 768 } });
  const errs = []; p.on('pageerror', (e) => errs.push(e.message + ' @ ' + (e.stack || '').split('\n')[1]));
  await p.goto('file:///home/user/runawayy-game/SmallHours.html'); await p.waitForTimeout(400);
  console.log('title fam:', await p.evaluate(() => document.querySelector('#famPrev') && document.querySelector('#famPrev').textContent));
  await p.click('#genSeg button[data-g="f"]'); await p.fill('#seedIn', 'feat7'); await p.waitForTimeout(100);
  console.log('preview:', await p.evaluate(() => document.querySelector('#famPrev').textContent));
  await p.click('#startBtn'); await p.waitForTimeout(700);
  await p.screenshot({ path: 'shots/f_intro.png' });
  console.log('intro:', (await p.evaluate(() => document.querySelector('#modal').innerText)).slice(0, 900));
  console.log('G.fam:', await p.evaluate(() => JSON.stringify(SH.G.fam)), 'meta rick:', await p.evaluate(() => SH.NPCS_META.rick.full));
  await p.evaluate(() => { document.querySelector('#daycard') && document.querySelector('#daycard').remove(); const m = document.querySelector('#modal'); m.classList.add('hidden'); m.innerHTML = ''; });
  // NLP alias
  console.log('alias:', await p.evaluate(() => { const f = SH.G.fam; const a = SH.NLP.analyze(f.rick.toLowerCase() + ' was drunk and hit me'); return a.t + ' | disclose=' + a.has('disclose'); }));
  console.log('nm:', await p.evaluate(() => SH.nm('Rick yelled. Your stepdad is scary. Lily cried. Grandma Rose called. Te quiero, mijo. You\'re my BROTHER.')));
  // friends
  const r = await p.evaluate(() => {
    const o = []; SH.G.t = 16 * 60; SH.G.loc = SH.World.where('nia').loc; o.push('nia at ' + SH.G.loc + ' / marco at ' + SH.World.where('marco').loc);
    SH.G.loc = SH.World.where('nia').loc; const acts = SH.Actions.list().acts.map((a) => a.label); o.push('acts: ' + acts.filter((l) => /Nia|Marco|Priya|Eli|Theo|Hazel/.test(l)).join(' | '));
    const c = { turn: 1, mem: {}, used: {} };
    ['hi', 'i love drawing anime', 'you are really funny', 'my stepdad drinks and yells every night', 'what do you do for fun', 'do you like anyone', 'i like you'].forEach((t, i) => { c.turn = i + 1; const an = SH.NLP.analyze(SH.nm(t)); o.push('> ' + t + '\n    ' + SH.Brain.nia(an, c).say); });
    o.push('rel nia=' + SH.G.rel.nia + ' state=' + JSON.stringify(SH.G.friends.nia));
    SH.G.rel.nia = 50; SH.G.friends.nia.cool = 0; c.turn = 9; o.push('> will you go out with me\n    ' + SH.Brain.nia(SH.NLP.analyze('will you go out with me'), c).say + ' crush=' + JSON.stringify(SH.G.crush));
    return o.join('\n');
  });
  console.log(r);
  // phone: atlas + net
  await p.evaluate(() => SH.Phone.open('atlas')); await p.waitForTimeout(300);
  console.log('atlas:', (await p.evaluate(() => document.querySelector('#pbody').innerText)).slice(0, 500));
  await p.screenshot({ path: 'shots/f_atlas.png' });
  await p.evaluate(() => { const D = SH.Atlas.data(); const v = D.places.find((x) => x.tier === 'village'); SH.Atlas.sel = v.id; SH.Phone.render(); });
  console.log('village card:', (await p.evaluate(() => document.querySelector('.acard').innerText)).slice(0, 700));
  await p.evaluate(() => SH.Phone.open('net')); await p.waitForTimeout(200);
  console.log('net:', (await p.evaluate(() => document.querySelector('#pbody').innerText)).slice(0, 400), '| sbar:', await p.evaluate(() => document.querySelector('#sbar').innerText));
  await p.evaluate(() => { SH.G.net.mb = 0; SH.G.loc = 'park'; SH.Phone.open('chirp'); }); await p.waitForTimeout(200);
  console.log('chirp w/o data:', (await p.evaluate(() => document.querySelector('#pbody').innerText)).slice(0, 160));
  // run: invite a friend, go to another town
  const r2 = await p.evaluate(() => {
    const o = []; const G = SH.G; SH.G.net.mb = 2000;
    SH.Run.start('bigNight', false); document.querySelector('#modal').classList.add('hidden');
    G.friends.marco = G.friends.marco || SH.Friends.st('marco'); G.friends.marco.met = true; G.friends.marco.knows = true; G.friends.marco.wouldRun = true; G.rel.marco = 70;
    G.loc = 'birch'; o.push('run acts @birch: ' + SH.Actions.list().acts.map((a) => a.label).join(' | '));
    return o.join('\n');
  });
  console.log(r2);
  await p.evaluate(() => { const G = SH.G; SH.Friends.invite('marco'); }); await p.waitForTimeout(300);
  console.log('invite dlg:', (await p.evaluate(() => document.querySelector('#modal').innerText)).slice(0, 300), 'party=', await p.evaluate(() => JSON.stringify(SH.G.party)));
  await p.evaluate(() => { const m = document.querySelector('#modal'); m.classList.add('hidden'); m.innerHTML = ''; });
  const r3 = await p.evaluate(() => { const D = SH.Atlas.data(), H = D.places[0]; const near = D.places.filter((x) => !x.home && SH.Atlas.miles(H, x) <= 9).sort((a, b) => SH.Atlas.miles(H, a) - SH.Atlas.miles(H, b))[0] || D.places[1]; SH.G.money = 20; SH.Atlas.go(near.id, SH.Atlas.modes(H, near)[0].k); return 'went to ' + near.name + ' (' + near.tier + ', ' + SH.Atlas.miles(H, near) + 'mi) away=' + SH.G.away; });
  console.log(r3); await p.waitForTimeout(300);
  console.log('hub:', (await p.evaluate(() => document.querySelector('#modal').innerText)).slice(0, 600));
  await p.screenshot({ path: 'shots/f_hub.png' });
  console.log('acts while away:', await p.evaluate(() => SH.Actions.list().acts.map((a) => a.label).join(' | ')));
  await p.evaluate(() => SH.Atlas.act('walk')); await p.waitForTimeout(200);
  console.log('walk:', (await p.evaluate(() => document.querySelector('#modal').innerText)).slice(0, 300));
  console.log('errors', errs); await b.close();
})();
