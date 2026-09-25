const { chromium } = require('playwright-core');
(async () => {
  const b = await chromium.launch({ executablePath: '/usr/bin/chromium', args: ['--no-sandbox'] });
  const p = await b.newPage({ viewport: { width: 1366, height: 768 } });
  const errs = []; p.on('pageerror', (e) => errs.push(e.message + ' @ ' + (e.stack || '').split('\n')[1]));
  p.on('console', (m) => { if (m.type() === 'warning' || m.type() === 'error') errs.push('console: ' + m.text().slice(0, 200)); });
  await p.goto('file:///home/user/smallhours/src/index.html'); await p.waitForTimeout(500);
  await p.click('#startBtn'); await p.waitForTimeout(500);
  const hide = () => p.evaluate(() => { document.querySelector('#daycard') && document.querySelector('#daycard').remove(); const m = document.querySelector('#modal'); m.classList.add('hidden'); m.innerHTML = ''; });
  await hide();
  const body = () => p.evaluate(() => document.querySelector('#pbody').innerText.replace(/\n+/g, ' | ').slice(0, 260));
  console.log('HOME apps:', await p.evaluate(() => { SH.Phone.open('home'); return [...document.querySelectorAll('.homegrid .app')].map((a) => a.innerText.trim()).join(', '); }));
  for (const app of ['browser', 'bank', 'tubeyou', 'finder', 'net']) { await p.evaluate((a) => SH.Phone.open(a), app); await p.waitForTimeout(150); console.log('APP', app, '→', await body()); }
  const sites = ['seekr.av/?q=cheap%20tent', 'seekr.av/?q=i%20want%20to%20run%20away', 'ledger.av', 'skycast.av', 'avermaps.av', 'everything.av', 'everything.av/c/electronics', 'everything.av/c/adult', 'everything.av/p/x_beer', 'swapspot.av', 'swapspot.av/sell', 'threadly.av', 'threadly.av/t/abandoned', 'safeline.av', 'cheapride.av', 'averline.av', 'rail.av', 'county.av', 'stayfinder.av', 'givetogether.av', 'worknow.av', 'history.av'];
  await p.evaluate(() => SH.Phone.open('browser'));
  for (const s of sites) { await p.evaluate((s) => SH.Browser.go(s), s); await p.waitForTimeout(80); console.log('SITE', s, '→', (await body()).slice(0, 200)); }
  // data accounting
  console.log('data used (home wifi):', await p.evaluate(() => SH.G.net.used.toFixed(2)));
  // go outside, spend mobile data
  const r = await p.evaluate(() => {
    const o = [], G = SH.G; G.loc = 'park'; const s = SH.Net.state(); const mb0 = s.mb;
    SH.Browser.go('ledger.av'); SH.Phone.open('browser'); o.push('ledger cost ' + (mb0 - s.mb).toFixed(2) + 'MB');
    // messages: offline queue
    s.mb = 0; SH.Phone.send('jordan', 'yo are u there'); o.push('queue=' + SH.Net.x().queue.length);
    SH.Phone.push('jordan', 'jordan', 'held msg test'); o.push('inbox held=' + SH.Net.x().inbox.length);
    s.mb = 500; SH.advance(5); o.push('after reconnect queue=' + SH.Net.x().queue.length + ' inbox=' + SH.Net.x().inbox.length + ' last=' + (G.threads.jordan || []).slice(-2).map((m) => m.from + ':' + m.text).join(' / '));
    // bank
    o.push('bank access@park: ' + (SH.Bank.access() || 'ok') + ' bal=' + SH.Bank.state().bal);
    s.mb = 0; o.push('bank no data: ' + SH.Bank.access()); s.mb = 500;
    o.push('pay 3: ' + SH.Bank.pay(3, 'test') + ' bal=' + SH.Bank.state().bal);
    // order
    SH.Shop.order('x_powerbank', 'cash'); SH.Shop.order('x_painkiller', 'card'); o.push('orders=' + G.orders.length);
    G.t += 1500; G.loc = 'store'; G.money = 50; const acts = SH.Actions.list().acts.map((a) => a.label); o.push('store acts: ' + acts.filter((l) => /locker|data|burner|cash|PocketPal|Meet/.test(l)).join(' | '));
    return o.join('\n');
  });
  console.log(r);
  await p.evaluate(() => SH.Shop.pickup()); await p.waitForTimeout(200);
  console.log('PICKUP:', (await p.evaluate(() => document.querySelector('#modal').innerText)).replace(/\n+/g, ' / ').slice(0, 400)); await hide();
  console.log('bag has powerbank:', await p.evaluate(() => SH.G.bag.includes('x_powerbank')));
  // burner
  await p.evaluate(() => SH.Net.buyBurner()); await p.waitForTimeout(150); await hide();
  console.log('burner:', await p.evaluate(() => { SH.Phone.push('mom', 'mom', 'where are you'); return JSON.stringify(SH.Net.x().burner) + ' oldInbox=' + (SH.Net.x().oldInbox || []).length; }));
  // crew + votes + borrow
  console.log(await p.evaluate(() => { const G = SH.G; ['nia', 'marco'].forEach((id) => { const f = SH.Friends.st(id); f.met = true; G.rel[id] = 60; }); SH.Bank.openCrew(); SH.Bank.crewAdd(5, 'cash'); G.crew.bal = 60; SH.Bank.crewTake(30, 'motel room'); SH.Bank.crewTake(30, 'candy lol'); return 'crew bal=' + G.crew.bal + ' log=' + G.crew.log.slice(0, 3).map((l) => l.d).join(' ; '); }));
  // jobs
  console.log(await p.evaluate(() => { const G = SH.G; SH.Jobs2.apply('dog'); document.querySelector('#modal button').click(); SH.Jobs2.apply('dish'); [...document.querySelectorAll('#modal button')][1].click(); G.work.apps.dog.due = G.t; G.work.apps.dish.due = G.t; SH.advance(1); return JSON.stringify(G.work.apps) + ' gigs=' + G.work.gigs.map((g) => g.title).join(','); }));
  // tubeyou
  console.log(await p.evaluate(() => { SH.Jobs2.watch('drive1'); SH.Jobs2.watch('drive2'); SH.Jobs2.watch('drive3'); SH.Jobs2.watch('drive4'); SH.Jobs2.watch('drive1'); SH.Jobs2.watch('camp1'); return JSON.stringify(SH.G.skills); }));
  // forum post + creep
  await p.evaluate(() => SH.Forum.post('im 12 and i want to leave home, where can i sleep thats warm')); await p.waitForTimeout(4500);
  console.log('FORUM:', await body(), '| dms=', await p.evaluate(() => SH.G.forum.dms.length));
  // swapspot buy fair
  console.log(await p.evaluate(() => { const L = SH.Shop.listings(); const f = L.find((l) => l.kind === 'fair'); SH.Shop.swapBuy(f.id); const m = SH.G.swap.meets[0]; return 'meet at ' + m.loc + ' ' + m.locName + ' kinds=' + L.map((l) => l.kind[0]).join(''); }));
  // helpline ending
  await hide(); await p.evaluate(() => SH.Browser.reachOut('chat')); await p.waitForTimeout(150); await p.evaluate(() => document.querySelector('#modal button').click()); await p.waitForTimeout(400);
  console.log('ENDING:', (await p.evaluate(() => document.querySelector('#modal').innerText)).replace(/\n+/g, ' / ').slice(0, 500));
  console.log('errors', errs); await b.close();
})();
