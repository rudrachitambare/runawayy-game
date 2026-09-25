/* SMALL HOURS — Part 1i: WorkNow (a real job board: real jobs, realistic pay, real age rules — most say 16+,
   so a 12-year-old has to find the ones that'll take them) and TubeYou (videos that teach skills:
   driving theory, bike repair, camping, cooking, first aid, fixing things, running a business). */
(function (SH) {
  const B = SH.Browser, P = SH.Phone, NT = SH.Net; if (!B) return;
  const G = () => SH.G, esc = B.esc, $2 = B.$2;
  const W = () => (G().work = G().work || { apps: {}, gigs: [], fired: {} });

  // [key, title, employer, pay, per, minAge, permit, harlowLoc, tiers, hours [from,to], days, note]
  const JOBS = [
    ['dish', 'Dishwasher', 'Route 9 Diner', 12.5, 'h', 16, true, 'diner', ['city', 'town', 'small'], [16, 21], 'any', 'Evenings, fast-paced, food handler card provided.'],
    ['stock', 'Overnight shelf stocker', 'ValuMart', 13.75, 'h', 18, false, 'mall', ['city', 'town'], [22, 6], 'any', 'Must lift 40 lbs. Background check.'],
    ['bag', 'Grocery bagger / cart attendant', 'FreshWay Market', 11, 'h', 14, true, 'store', ['city', 'town', 'small'], [15, 19], 'any', 'Work permit required under 16. Friendly attitude a must!'],
    ['wash', 'Car wash attendant', 'Sudz Express', 12, 'h', 16, true, 'bus', ['city', 'town'], [10, 17], 'we', 'Outdoor work, tips daily.'],
    ['deliv', 'Delivery driver helper', 'QuickHaul', 15, 'h', 18, false, null, ['city', 'town'], [8, 16], 'wk', 'Valid driver\'s license required.'],
    ['farm', 'Seasonal farm hand (harvest)', 'Hollis Family Farm', 12, 'h', 12, false, null, ['small', 'village'], [7, 13], 'any', 'Picking and sorting. Minors 12–13 welcome with parent OK (farm rules).'],
    ['dog', 'Dog walker (2 dogs, weekday afternoons)', 'Deb R. (private)', 10, 'job', 0, false, 'park', ['city', 'town', 'small', 'village'], [15, 18], 'wk', 'Must love dogs. Must not lose dogs.'],
    ['yard', 'Leaf raking / yard cleanup', 'Mr. Kowalski (private)', 18, 'job', 0, false, 'birch', ['city', 'town', 'small', 'village'], [9, 17], 'we', 'Rakes provided. Big yard. Cookies included.'],
    ['helper', 'Mother\'s helper (play with 2 kids while I work from home)', 'Jen T. (private)', 7, 'h', 11, false, 'birch', ['city', 'town', 'small'], [15, 18], 'wk', 'Great for a responsible preteen!'],
    ['flyer', 'Flyer delivery', 'Harlow Pizza Co.', 0.12, 'flyer', 11, false, 'store', ['city', 'town', 'small'], [10, 18], 'any', 'Paid per flyer. ~150 per route.'],
    ['tutor', 'Reading buddy for a 2nd grader', 'Parent (via library board)', 9, 'h', 12, false, 'library', ['city', 'town', 'small'], [15, 17], 'wk', 'Patient, good reader. Meet at the library only.'],
    ['pet', 'Pet sitting (feed cats, 3 days)', 'Marisol (private)', 25, 'job', 0, false, 'birch', ['city', 'town', 'small', 'village'], [8, 20], 'any', 'Two cats. One is mean. His name is Pancake.'],
    ['cash', '💰 EASY CASH $500/WEEK, NO EXPERIENCE, WORK FROM PHONE', 'Opportunity Now LLC', 500, 'wk', 0, false, null, ['city', 'town', 'small', 'village'], [0, 24], 'any', 'Just send a $40 starter kit fee and a photo of yourself!!'],
  ];
  const J2 = SH.Jobs2 = { JOBS };
  const tierHere = () => (SH.Atlas ? SH.Atlas.here().tier : 'town');
  const placeKey = () => G().away || 'harlow';
  const payTxt = (j) => j[4] === 'h' ? $2(j[3]) + '/hr' : j[4] === 'job' ? $2(j[3]) + '/job' : j[4] === 'flyer' ? '$' + j[3].toFixed(2) + '/flyer' : $2(j[3]) + '/week';
  const ageTxt = (j) => j[5] >= 16 ? `${j[5]}+${j[6] ? ' · work permit' : ''}` : j[5] >= 14 ? `${j[5]}+ · work permit` : j[5] > 0 ? `${j[5]}+` : 'any age';

  B.SITES['worknow.av'] = { n: 'WorkNow', icon: '💼', col: '#2d6cdf', mb: 0.8, tile: true, order: 12, render(path) {
    const w = W(), t = tierHere(), L = JOBS.filter((j) => j[8].includes(t) && (G().away ? true : true));
    const mine = Object.entries(w.apps);
    return `<b>Jobs near ${esc(B.place().name)}</b> <span class="muted" style="font-size:11px">· ${L.length} listings</span>
      ${w.gigs.length ? B.card('<b>Your jobs</b>' + w.gigs.map((g) => `<div style="font-size:11.5px">✅ ${esc(g.title)} · ${esc(g.where)} · ${g.h[0]}:00–${g.h[1]}:00 ${g.days === 'wk' ? 'weekdays' : g.days === 'we' ? 'weekends' : 'daily'} · ${esc(g.pay)}</div>`).join(''), 'border-color:#6fdc8c66') : ''}
      ${mine.length ? B.card('<b>Applications</b>' + mine.map(([k, a]) => `<div style="font-size:11.5px">${esc(JOBS.find((j) => j[0] === k)[1])}: <b>${a.status}</b>${a.msg ? ' · <span class="muted">' + esc(a.msg) + '</span>' : ''}</div>`).join('')) : ''}
      ${L.map((j) => B.card(`<div style="display:flex;justify-content:space-between;gap:6px"><b>${esc(j[1])}</b><b style="white-space:nowrap">${payTxt(j)}</b></div><div class="muted" style="font-size:11px">${esc(j[2])} · ${j[9][0]}:00–${j[9][1]}:00 · <b style="color:${j[5] > 12 ? '#ffb86b' : '#6fdc8c'}">${ageTxt(j)}</b></div><div style="font-size:11.5px;margin:3px 0">${esc(j[11])}</div>${w.apps[j[0]] ? '' : B.btn(`SH.Jobs2.apply('${j[0]}')`, 'Apply')}`)).join('')}
      <p class="muted" style="font-size:11px">Under 14, most real jobs are private gigs (dogs, yards, pets), farm work, or flyers. Anyone asking YOU to pay first is a scam.</p>`;
  } };
  B.index(/job|work|hiring|money|earn|cash|gig|employ|hire/, 'worknow.av', 'WorkNow · jobs near you', 'Real jobs, real pay. Check the age rules.');

  J2.apply = function (k) {
    const j = JOBS.find((x) => x[0] === k), w = W();
    if (k === 'cash') return SH.UI.dialog({ title: '⚠️ This is risky', text: ['"$500 a week," "no experience," "pay a fee first," "send a photo of yourself." Every one of those is a scam sign. The last one is worse than a scam.'], choices: [{ t: 'Report it and move on', cls: 'safe', fn: () => { w.apps[k] = { status: 'reported', t: G().t }; SH.flag('spottedScam'); P.render(); } }, { t: 'Apply anyway', cls: 'danger', fn: () => { w.apps[k] = { status: 'ignored', msg: 'They wanted $40 and a selfie. You closed the tab. Good.', t: G().t }; SH.st('stress', 4); P.render(); } }] });
    const need = j[5];
    const choices = [{ t: 'Tell the truth: you\'re 12', cls: 'safe', fn: () => send(j, 12) }];
    if (need > 12) choices.push({ t: `Say you're ${need}`, sub: 'Lie on the application', fn: () => send(j, need, true) });
    choices.push({ t: 'Cancel', fn: () => {} });
    SH.UI.dialog({ title: 'Apply: ' + j[1], text: [`${j[2]} · ${payTxt(j)} · ${ageTxt(j)}`, 'The form asks for your age, a phone number and "why do you want this job?"'], choices });
  };
  function send(j, age, lied) {
    const w = W(), g = G(); if (NT && !NT.canData()) return SH.UI.toast('No data. The application won\'t send.');
    w.apps[j[0]] = { status: 'sent', t: g.t, lied: !!lied, due: g.t + 180 + Math.floor(Math.random() * 600), age };
    SH.UI.toast('Application sent.'); P.render();
  }
  function decide(k, a) {
    const j = JOBS.find((x) => x[0] === k), g = G(), heat = (g.heat || 0) + (g.reported ? 30 : 0);
    let ok, msg;
    if (a.age < j[5]) { ok = false; msg = j[5] >= 16 ? 'Thanks for applying! Unfortunately this position requires applicants to be 16+.' : 'Sorry, we need a work permit for anyone under 16.'; }
    else if (a.lied) { ok = Math.random() < (j[6] ? 0.2 : 0.3); msg = ok ? 'Can you start this week? Bring your work permit your first day.' : 'We couldn\'t verify your info. Thanks for applying!'; }
    else { ok = Math.random() < 0.75 - heat / 250; msg = ok ? ['Sure! Can you start tomorrow?', 'You sound responsible. Let\'s try it!', 'Great, come by and we\'ll show you the ropes.'][Math.floor(Math.random() * 3)] : 'Thanks! We found someone already.'; }
    a.status = ok ? 'hired' : 'rejected'; a.msg = msg;
    if (ok) W().gigs.push({ key: k, title: j[1], where: j[7] ? (SH.LOC[j[7]] || {}).name || j[7] : (SH.Atlas ? SH.Atlas.here().name : 'here'), loc: j[7], place: placeKey(), h: j[9], days: j[10], pay: payTxt(j), rate: j[3], per: j[4], lied: a.lied, shifts: 0 });
    P.notify && P.notify('browser', 'WorkNow · ' + j[2], msg);
  }

  const bAdv = SH.advance;
  SH.advance = function () { const r = bAdv.apply(this, arguments); const g = G(); if (g && g.work) Object.entries(g.work.apps).forEach(([k, a]) => { if (a.status === 'sent' && g.t >= a.due) decide(k, a); }); return r; };

  /* ---------- working a shift ---------- */
  const onShift = (gig) => { const h = SH.hour(), wk = SH.isWeekday ? SH.isWeekday() : true; if (gig.days === 'wk' && !wk) return false; if (gig.days === 'we' && wk) return false; return gig.h[0] < gig.h[1] ? h >= gig.h[0] && h < gig.h[1] - 1 : h >= gig.h[0] || h < gig.h[1] - 1; };
  J2.work = function (gig) {
    const g = G(), hrs = gig.per === 'h' ? 2 : gig.per === 'flyer' ? 2 : 1.5;
    if (g.phase === 'home' && SH.isWeekday && SH.isWeekday() && SH.hour() < 15 && SH.hour() >= 8) return SH.UI.toast('You\'re supposed to be in school.');
    let pay = gig.per === 'h' ? gig.rate * hrs : gig.per === 'flyer' ? gig.rate * (120 + Math.floor(Math.random() * 60)) : gig.rate;
    pay = Math.round(pay * 100) / 100; gig.shifts++;
    SH.advance(hrs * 60, { interrupt: false }); SH.st('energy', -8 * hrs); SH.st('mood', 2);
    if (SH.Jobs && SH.Jobs.earn) SH.Jobs.earn(pay, gig.title); else SH.money(pay);
    const txt = { dog: 'Two dogs, one leash tangle, zero lost dogs.', yard: 'Twenty-two bags of leaves. Mr. Kowalski\'s cookies are the good kind.', helper: 'You build a blanket fort and referee a war over a purple crayon.', flyer: 'Your legs hate you. Every mailbox in the neighborhood knows about the Tuesday two-for-one.', tutor: 'The kid reads a whole page without stopping and looks at you like you did magic.', pet: 'Pancake bites you once, affectionately.', farm: 'Apples, apples, apples. Your hands smell like apples for a day.', bag: 'Paper or plastic, four hundred times.', dish: 'Steam, grease, and a cook who calls you "chief."' }[gig.key] || 'You work. It\'s work.';
    let extra = '';
    if (gig.lied && gig.shifts === 1 && Math.random() < 0.5) { extra = ' At the end of the shift the manager asks for your work permit. You don\'t have one. "Look, kid, I can\'t. I\'m sorry." They pay you for today, at least.'; W().gigs = W().gigs.filter((x) => x !== gig); }
    if (g.phase === 'run' && g.reported && Math.random() < 0.12) { extra += ' Someone keeps looking from their phone to you and back.'; g.heat = Math.min(100, (g.heat || 0) + 10); if (g.away) g.awayNotice = (g.awayNotice || 0) + 15; }
    SH.UI.dialog({ title: gig.title, text: [txt + ` +${$2(pay)}.` + extra], choices: [{ t: 'Okay', fn: () => (g.away && SH.Atlas ? setTimeout(SH.Atlas.hub, 30) : SH.UI.afterAction()) }] });
  };
  const A = SH.Actions;
  if (A && A.list) { const bList = A.list; A.list = function () { const r = bList.apply(this, arguments), g = G(); if (!g || g.away || !r || !r.acts) return r; W().gigs.forEach((gig) => { if (gig.place === 'harlow' && gig.loc === g.loc && onShift(gig)) r.acts.unshift({ label: 'Work: ' + gig.title, sub: gig.pay, fn: () => J2.work(gig) }); }); return r; }; }
  if (SH.Atlas) (SH.Atlas.extra = SH.Atlas.extra || []).push((p, ch) => { W().gigs.forEach((gig) => { if (gig.place === p.id && onShift(gig)) ch.unshift({ t: 'Work: ' + gig.title, sub: gig.pay, fn: () => J2.work(gig) }); }); });

  /* ---------------- TubeYou ---------------- */
  const VIDS = [
    ['drive1', 'Driving basics: pedals, mirrors, what the lights mean', 'drive', 8, 45, 18], ['drive2', 'Parallel parking without crying', 'drive', 8, 40, 15], ['drive3', 'Road signs explained in 10 minutes', 'drive', 7, 30, 10], ['drive4', 'Manual vs automatic: how clutches work', 'drive', 7, 40, 15],
    ['bike1', 'Fix a flat bike tire in 15 minutes', 'fix', 10, 35, 15], ['bike2', 'Adjust bike brakes and chain', 'fix', 8, 35, 15], ['scoot1', 'E-scooter battery care & range tips', 'fix', 6, 25, 10],
    ['car1', 'Jump-start a dead car battery', 'mech', 10, 40, 15], ['car2', 'Check oil, coolant & tires', 'mech', 8, 35, 12], ['car3', 'Junkyard finds: what\'s worth fixing', 'mech', 8, 50, 20],
    ['camp1', 'Pitch a tent in the rain (and stay dry)', 'camp', 10, 40, 15], ['camp2', 'Sleeping warm: bags, pads, layers', 'camp', 10, 35, 12], ['camp3', 'Tarp shelters 101', 'camp', 8, 40, 15],
    ['cook1', 'Cheap camp meals under $2', 'cook', 10, 30, 12], ['cook2', '5 things to cook with just a kettle', 'cook', 8, 25, 10],
    ['aid1', 'First aid: cuts, blisters, sprains', 'aid', 12, 35, 15], ['aid2', 'Hypothermia signs (and what to do)', 'aid', 10, 30, 12],
    ['build1', 'Patch a leaky roof with a tarp', 'build', 10, 40, 18], ['build2', 'Basic carpentry: measure, cut, nail', 'build', 8, 45, 20],
    ['biz1', 'How I made $300 with a lemonade stand (for real)', 'biz', 10, 35, 15], ['biz2', 'Flipping thrift finds for profit', 'biz', 8, 40, 15],
    ['fun1', 'Skyforge speedrun WR (any%)', 'fun', 0, 60, 25], ['fun2', 'Cats being idiots compilation', 'fun', 0, 45, 15], ['fun3', 'Lo-fi beats to not think to', 'fun', 0, 70, 30],
  ];
  const SK = { drive: '🚗 Driving (theory)', fix: '🔧 Bike & scooter repair', mech: '🛠️ Car mechanics', camp: '🏕️ Camping', cook: '🍳 Cooking', aid: '⛑️ First aid', build: '🔨 Building', biz: '💼 Business' };
  const CAP = { drive: 40 };
  SH.skill = (k) => ((G().skills || {})[k] || 0);
  P.V.tubeyou = function (body) {
    const g = G(); g.skills = g.skills || {}; g.watched = g.watched || {};
    if (!NT.canData()) return NT.blocked(body, '▶️ TubeYou');
    const bars = Object.entries(SK).map(([k, n]) => `<div style="font-size:11px;display:flex;align-items:center;gap:6px"><span style="width:128px">${n}</span><div style="flex:1;height:5px;background:#0005;border-radius:3px"><i style="display:block;height:100%;width:${SH.skill(k)}%;background:#ff3b30;border-radius:3px"></i></div><b style="width:22px;text-align:right">${SH.skill(k)}</b></div>`).join('');
    body.innerHTML = P.hdr('▶️ TubeYou') + `<div class="appbody"><div class="sech">YOUR SKILLS</div>${bars}<p class="muted" style="font-size:10.5px">Videos teach theory. Real practice teaches the rest. (Driving theory maxes at 40: you need real lessons for more.)</p><div class="sech">RECOMMENDED</div>${VIDS.map((v) => `<div class="contact" style="cursor:pointer" onclick="SH.Jobs2.watch('${v[0]}')"><div class="av" style="background:#c4302b;border-radius:6px;width:54px">▶</div><div style="flex:1"><div class="nm" style="font-size:12px;white-space:normal">${esc(v[1])}</div><div class="pv">${v[4]} min · ~${v[5]} MB${g.watched[v[0]] ? ' · watched' : ''}</div></div></div>`).join('')}</div>`;
  };
  J2.watch = function (id) {
    const g = G(), v = VIDS.find((x) => x[0] === id); if (!v) return;
    if (!NT.spend(v[5])) return SH.UI.toast('Buffering… forever. Not enough data.');
    SH.advance(Math.min(v[4], 40), { interrupt: false });
    const first = !g.watched[id]; g.watched[id] = (g.watched[id] || 0) + 1;
    if (v[2] === 'fun') { SH.st('mood', 5); SH.st('stress', -4); SH.UI.toast('That was nice. Your brain is mush now.'); }
    else { const gain = first ? v[3] : 1; const cap = CAP[v[2]] || 100; g.skills[v[2]] = Math.min(cap, (g.skills[v[2]] || 0) + gain); SH.UI.toast(`${SK[v[2]]}: +${gain}${g.skills[v[2]] >= cap && CAP[v[2]] ? ' (videos can\'t teach you more)' : ''}`); }
    P.render();
  };
  P.extraApps = P.extraApps || [];
  P.extraApps.push({ at: 6, app: ['tubeyou', '▶️', 'TubeYou', '#ff0000'] });
})(window.SH);
