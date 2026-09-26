// scripted conversations through the real Talk UI + phone texting; prints every exchange
const { chromium } = require('playwright-core');
(async () => {
  const b = await chromium.launch({ executablePath: '/usr/bin/chromium', args: ['--no-sandbox'] });
  const p = await b.newPage({ viewport: { width: 1366, height: 768 } });
  const errs = []; p.on('pageerror', (e) => errs.push(e.message + ' @ ' + (e.stack || '').split('\n')[1]));
  await p.goto('file:///home/user/runawayy-game/SmallHours.html'); await p.waitForTimeout(300);
  await p.fill('#seedIn', 'chat'); await p.click('#startBtn'); await p.waitForTimeout(500);
  await p.evaluate(() => { document.querySelector('#daycard') && document.querySelector('#daycard').remove(); const m = document.querySelector('#modal'); m.classList.add('hidden'); m.innerHTML = ''; });
  async function talk(npc, lines) {
    await p.evaluate((n) => SH.Talk.open(n, { turnsMax: 40 }), npc); await p.waitForTimeout(300);
    const first = await p.evaluate(() => [...document.querySelectorAll('#modal .tl, #modal .msg, #modal .bub')].map((e) => e.textContent).join(' | '));
    console.log(`\n=== ${npc} (in person) ===\n  [opens] ${first.slice(0, 160)}`);
    for (const l of lines) {
      const before = await p.evaluate(() => document.querySelectorAll('#modal .tlog > *, #tlog > *').length);
      await p.fill('#tin', l); await p.keyboard.press('Enter'); await p.waitForTimeout(1700);
      const got = await p.evaluate((n) => [...document.querySelectorAll('#modal .tlog > *, #tlog > *')].slice(n).map((e) => e.textContent.trim()).join('  //  '), before);
      console.log(`  > ${l}\n    ${got.slice(0, 260)}`);
    }
    await p.evaluate(() => { SH.Talk.close && SH.Talk.close(); const m = document.querySelector('#modal'); m.classList.add('hidden'); m.innerHTML = ''; });
  }
  async function text(npc, lines) {
    console.log(`\n=== ${npc} (texting) ===`);
    for (const l of lines) { const r = await p.evaluate(([n, l]) => { SH.G.threads[n] = SH.G.threads[n] || []; SH.G.threads[n].push({ from: 'me', text: l, t: SH.G.t }); SH.Phone.reply(n, l); const th = SH.G.threads[n]; return th[th.length - 1].text; }, [npc, l]); console.log(`  > ${l}\n    ${r}`); }
  }
  const skip = (h) => p.evaluate((h) => { SH.G.t += h * 60; }, h);
  await talk('jordan', ['yo', 'my favorite color is green', 'i have a math test friday', 'i love skyforge and pizza', 'call me sammy', 'what do you think about tyler', 'whats your favorite food', 'do you like cats', 'do you like cats', 'what?', 'rick was drunk again last night', 'whats my favorite color']);
  await text('jordan', ['do u remember what i said about rick', 'what do i like', 'what do you know about me']);
  await talk('mom', ['hi mom', 'whats my favorite color', 'my birthday is march 3', 'im scared of the dark', 'what do you think of rick', 'whats your favorite movie', 'what am i scared of']);
  await skip(24 * 4);
  await talk('jordan', ['hey', 'it went great i got a b', 'whats my name', 'remember when i told you about my test']);
  await talk('grandma', ['hi grandma', 'what do you know about me', 'i want to be a vet when i grow up', 'what do i want to be']);
  console.log('\nPIP:'); for (const l of ['whats my favorite color', 'my dog is named biscuit', 'what do you know about me']) console.log('  > ' + l + '\n    ' + await p.evaluate((l) => SH.PIP.reply(l), l));
  console.log('\nfacts:', JSON.stringify(await p.evaluate(() => Object.values(SH.G.mind.facts).map((f) => f.key + '=' + f.v + ' by ' + Object.keys(f.by).join('/')))));
  console.log('errors', errs);
  await b.close();
})();
