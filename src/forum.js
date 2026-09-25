/* SMALL HOURS — Part 1f: Threadly forums. Read boards, post your own question (free text) and get replies.
   Some DMs are creeps: the game throws a ⚠️ risk pop-up before you engage. */
(function (SH) {
  const B = SH.Browser; if (!B) return;
  const G = () => SH.G, esc = B.esc;
  const BOARDS = {
    harlow: ['t/Harlow', 'Local stuff', [
      ['bluecollar_bill', 'Anyone else hear the plant is cutting more shifts?', ['yep my husband got the letter', 'this town is dying man']],
      ['maplestreet_mom', 'PSA: the underpass lights are out AGAIN', ['called the city twice', 'keep your kids away from there at night']],
      ['quikmart_kev', 'Top-up cards back in stock at the Route 9 QuikMart', ['finally', 'do u have the $15 ones']]]],
    camping: ['t/CampingOnABudget', 'Gear, spots, cold nights', [
      ['trailmix_tina', 'Sleeping bag temp ratings are LIES. a "40°F" bag is miserable at 40.', ['always go 10-15 degrees lower than the forecast', 'foam pad under you matters more than people think']],
      ['stealth_camper', 'Tarp over the tent = dry tent. Every time.', ['and pitch on high ground, not in the dip', 'learned this the hard way lol']],
      ['cheapgear', 'Best $40 tent?', ['walmart 2-person is fine for a season', 'check SwapSpot, people dump barely used ones']]]],
    abandoned: ['t/AbandonedAverland', 'Urbex, photos, history', [
      ['rust_hunter', 'The old textile mill outside town. Roof is half gone on the east side, west wing still dry.', ['security drives by on weekends', 'floor on the 2nd story is NOT safe']],
      ['barnfinder', 'Every village around here has a dead barn or two. Most owners don\'t care, some really do.', ['got yelled at by a farmer with a shotgun once. ask first', 'the ones with new locks = someone still cares']],
      ['motelghost', 'Closed-down Starlite Motel on the county road. Power is off, water is off.', ['cops check it after noise complaints', 'kids party there on fridays']]]],
    lefthome: ['t/LeftHome', 'People who ran away as kids, talking about it', [
      ['wasfifteen', 'Ran at 15. First night felt like freedom. Third night I was hungry, cold and a guy at the bus station was being "nice." Please call someone before it gets to that.', ['same. the "nice" guy thing is real', 'called the Safeline on day 4. best thing i did']],
      ['foster_to_fine', 'If home is actually unsafe, telling someone doesn\'t always mean going back. It didn\'t for me.', ['this. cps isn\'t perfect but they moved me to my aunt', 'thank you for posting this']],
      ['couch_era', 'Couch surfed at friends\' houses for 2 months at 14. Their parents knew. Eventually one of them called my school counselor. I was mad. Now I\'m grateful.', ['friends\' parents are underrated', 'same, my friend\'s mom basically adopted me']]]],
    rides: ['t/ScootAndPedal', 'Scooters, bikes, repairs', [
      ['voltvic', 'E-scooter range is always 60% of what the box says. Hills eat battery.', ['cold kills it too', 'carry the charger. always']],
      ['fixiefran', 'Flat tire? $5 patch kit + a pump. Takes 15 min once you learn.', ['tubeyou has good videos on it', 'bring tire levers']]]],
  };
  const MY = () => (G().forum = G().forum || { posts: [], dms: [], blocked: false });

  function replies(q) {
    const t = q.toLowerCase(), out = [];
    const add = (u, s) => out.push([u, s]);
    if (/cold|freez|warm|night|sleep outside/.test(t)) add('trailmix_tina', 'sleeping bag + foam pad + a beanie. you lose a ton of heat from your head. and don\'t sleep in wet clothes');
    if (/food|hungry|eat|cheap/.test(t)) add('broke_but_fed', 'food pantries don\'t ask for ID. church suppers too. ramen + peanut butter = cheapest calories');
    if (/tent|camp|where.*(sleep|stay)|spot/.test(t)) add('stealth_camper', 'public land or ask a farmer. never somewhere with "no trespassing" and fresh locks');
    if (/money|job|work|cash/.test(t)) add('hustle_hank', 'yard work, dog walking, car washes. anyone asking for a "deposit" first is a scam');
    if (/phone|data|wifi|charge/.test(t)) add('techtina', 'libraries have free wifi and outlets. power bank is the best $20 you\'ll spend');
    if (/scooter|bike|flat|tire/.test(t)) add('fixiefran', 'patch kit + pump. check tubeyou for a tutorial');
    if (/run ?away|ran away|leave home|left home|parents|stepdad|mom|dad|home/.test(t)) { add('wasfifteen', 'hey. are you ok? if you\'re a kid and home isn\'t safe, the Safeline is real people. i promise it\'s not a trap'); add('mod_threadly', '🛡️ Automated message: if you or someone you know is in danger, contact local emergency services or a youth helpline. safeline.av'); }
    if (/motel|hotel|room/.test(t)) add('roadtrip_ro', 'most places want ID and a card. the cheap ones on the edge of town are sketchy for a reason');
    if (!out.length) add('randomuser_88', ['lol what', 'good question honestly', 'following', 'did u try searching first'][Math.floor(Math.random() * 4)]);
    if (/\b(1[0-4]|twelve|thirteen|eleven)\b|\bi'?m a kid\b|years old/.test(t) || /run ?away|ran away|left home/.test(t)) out.push(['__creep', '']);
    return out;
  }

  B.SITES['threadly.av'] = { n: 'Threadly', icon: '🧵', col: '#ff5a1f', mb: 0.9, tile: true, order: 7, render(path) {
    const f = MY(), m = path.match(/^t\/(\w+)/), mine = path.match(/^mine\/(\d+)/);
    const nav = `<div style="display:flex;gap:4px;flex-wrap:wrap;margin-bottom:6px">${Object.entries(BOARDS).map(([k, b]) => B.lnk('threadly.av/t/' + k, b[0], 'font-size:11px;background:#ffffff12;padding:2px 7px;border-radius:10px')).join('')}${B.lnk('threadly.av/dms', '✉️ DMs' + (f.dms.filter((d) => !d.read).length ? ' •' : ''), 'font-size:11px;background:#ffffff12;padding:2px 7px;border-radius:10px')}</div>`;
    if (path === 'dms') { f.dms.forEach((d) => d.read = true); return nav + (f.dms.map((d, i) => B.card(`<b>${esc(d.u)}</b><br>${esc(d.text)}${d.creep && !d.done ? `<div style="margin-top:6px">${B.btn(`SH.Forum.creep(${i},'reply')`, 'Reply')}${B.btn(`SH.Forum.creep(${i},'block')`, '🚫 Block & report', 'primary')}</div>` : ''}`)).join('') || '<p class="muted">No messages.</p>'); }
    if (mine) { const p = f.posts[+mine[1]]; if (!p) return nav; return nav + B.card(`<b>${esc(p.q)}</b><br><small class="muted">posted by you · ${SH.dateStr(p.t)}</small>`) + p.r.filter((x) => x[0] !== '__creep').map(([u, s]) => `<div class="setrow" style="font-size:12px"><b>${esc(u)}</b> ${esc(s)}</div>`).join(''); }
    if (m && BOARDS[m[1]]) { const b = BOARDS[m[1]]; return nav + `<b>${b[0]}</b> <span class="muted">· ${b[1]}</span>` + b[2].map(([u, t, rs]) => B.card(`<b>${esc(t)}</b><br><small class="muted">u/${esc(u)}</small>${rs.map((r) => `<div style="font-size:11.5px;margin-top:4px;padding-left:8px;border-left:2px solid #ffffff22">${esc(r)}</div>`).join('')}`)).join(''); }
    return nav + `<b>Ask Threadly</b><div style="display:flex;gap:5px;margin:5px 0"><input id="fq" placeholder="ask anything (anonymous-ish)" style="flex:1;min-width:0"><button class="btn primary" onclick="SH.Forum.post(document.querySelector('#fq').value)">Post</button></div>` +
      (f.posts.length ? '<div class="sech">YOUR POSTS</div>' + f.posts.map((p, i) => `<div class="setrow" style="font-size:12px">${B.lnk('threadly.av/mine/' + i, esc(p.q))} <span class="muted">· ${p.r.filter((x) => x[0] !== '__creep').length} replies</span></div>`).join('') : '') +
      '<div class="sech">BOARDS</div>' + Object.entries(BOARDS).map(([k, b]) => `<div class="setrow">${B.lnk('threadly.av/t/' + k, '<b>' + b[0] + '</b>')} <span class="muted" style="font-size:11px">${b[1]}</span></div>`).join('');
  } };
  B.index(/forum|threadly|advice|ask|camp|tent|abandon|urbex|mill|barn|scooter|bike|reddit/, 'threadly.av', 'Threadly · ask anything', 'Forums: camping, abandoned places, rides, local, people who left home.');

  const F = SH.Forum = {};
  F.post = function (q) {
    q = (q || '').trim(); if (!q) return; const f = MY();
    const r = replies(q); f.posts.unshift({ q, t: G().t, r });
    if (r.some((x) => x[0] === '__creep') && !f.creepSent) { f.creepSent = true; setTimeout(() => { f.dms.unshift({ u: 'chill_dude_27', text: 'hey saw ur post. i was in the same spot at ur age. i have a spare room, no rules, no questions. i can pick u up. don\'t tell anyone tho, ppl wouldn\'t get it', creep: true, t: G().t }); SH.Phone.notify && SH.Phone.notify('browser', 'Threadly', 'New message from chill_dude_27'); }, 4000); }
    SH.Browser.go('threadly.av/mine/0');
  };
  F.creep = function (i, what) {
    const f = MY(), d = f.dms[i]; if (!d) return;
    if (what === 'block') { d.done = true; SH.st('stress', -2); SH.flag('blockedCreep'); SH.UI.toast('Blocked and reported. Threadly removed the account an hour later.'); SH.Phone.render(); return; }
    SH.UI.dialog({ title: '⚠️ This is risky', text: ['A stranger online offering a free room, "no questions," and asking you to keep it secret is exactly how kids get hurt. Adults who actually want to help don\'t ask you to hide it.', 'Do you still want to reply?'], choices: [
      { t: 'Block and report instead', cls: 'safe', fn: () => F.creep(i, 'block') },
      { t: 'Reply anyway', cls: 'danger', fn: () => { d.done = true; SH.st('stress', 8); f.dms.unshift({ u: 'chill_dude_27', text: 'cool. where are u rn? send a pic so i know what u look like. i\'ll come get u tonight, just u tho ok', t: G().t }); SH.UI.dialog({ title: 'chill_dude_27', text: ['"where are u rn? send a pic so i know what u look like. i\'ll come get u tonight, just u tho ok"', 'Your stomach drops. Just you. Send a pic. Tonight. Every alarm in your body goes off at once.'], choices: [{ t: 'Block him. Tell someone.', cls: 'safe', fn: () => { SH.flag('blockedCreep'); SH.st('stress', -4); SH.UI.log('You block him and screenshot everything. Your hands are shaking. You did the right thing. You know that.', 'good'); SH.Phone.render(); } }] }); } }] });
  };
})(window.SH);
