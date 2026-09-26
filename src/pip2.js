/* SMALL HOURS — PIP, actually useful. PIP now knows the whole road, not just Harlow:
   - "how do I get to Port Aldine" → real journeys from where you are (times, changes, cost for your whole group)
   - "what's leaving" / "next bus" → the departure board here
   - "where can I sleep" → your room / base / this town's motels ranked by price, what each kind will ask, side streets
   - "motel tips" → how check-in works here (ID? haggling? the floor price, week/month prepay), your fake ID if you have one
   - "where can I buy a sleeping bag" → which store here sells it and for how much (or which bigger town will)
   - "money" → cash, what a day costs your group, how many days that lasts, and ways to earn in this place
   - "am I safe / is anyone looking" → how noticed you are here, heat, posters + how online this place is, your cover
   - "I feel sick" → health + the nearest clinic
   - "can I disappear" → the four pillars, which you have, what to do about the rest
   - "how are my friends' parents" → how worried each one is, and what helps
   - "what do I say to the clerk / a cop" → coaching that matches the story you've already told
   - PIP remembers: tell it your goal ("I want to get to Cedar Falls") and it keeps it, plans toward it, and brings it up.
     "what was I doing / remind me" gives you your goal + where things stand.
   - The "what should I do" plan is built from your actual situation on the road (warmth, food, battery, sleep, money
     runway, health, notice, your goal's next departure, pillars).
   - Replies in conversations (◉ PIP) know clerks, cops, locals, runaway kids and friends' parents, and keep your story straight. */
(function (SH) {
  const PIP = SH.PIP, A = SH.Atlas, R = SH.Routes, K = SH.K; if (!PIP || !A) return;
  const G = () => SH.G, pick = (a) => a[Math.floor(Math.random() * a.length)];
  const fmt = (t) => { const m = ((t % 1440) + 1440) % 1440, h = Math.floor(m / 60), mm = m % 60; return `${(h % 12) || 12}:${String(mm).padStart(2, '0')} ${h < 12 ? 'AM' : 'PM'}`; };
  const dayw = (t) => { const d = Math.floor(t / 1440) - Math.floor(G().t / 1440); return d <= 0 ? '' : d === 1 ? ' tomorrow' : ` in ${d} days`; };
  const grp = () => (K ? K.grp() : 1), $ = (n) => '$' + Math.round(n);
  const mem = () => { const g = G(); return (g.pipMem = g.pipMem || { goal: null, asked: {}, last: null }); };
  const away = () => { const g = G(); return !!(g.away && g.away !== 'p0'); };
  const here = () => A.here();
  const places = () => (A.data() ? A.data().places : []);
  /* ---------- find a place by name (forgiving) ---------- */
  function findPlace(q) {
    q = String(q || '').toLowerCase().replace(/[^a-z ]/g, ' ').replace(/\b(the|town|of|city|village|please|tonight|tomorrow|now|asap|from here|by bus|by train)\b/g, ' ').replace(/\s+/g, ' ').trim(); if (q.length < 3) return null;
    if (/\bgrandma|grandmas\b/.test(q)) return places().find((p) => p.grandma) || null;
    if (/\bhome\b|\bharlow\b/.test(q)) return places().find((p) => p.id === 'p0');
    let best = null, bs = 0;
    places().forEach((p) => { const n = p.name.toLowerCase(); let s = 0; if (n === q) s = 100; else if (n.startsWith(q) || q.startsWith(n)) s = 60; else if (n.includes(q) || q.includes(n)) s = 40; else { const qw = q.split(' '), nw = n.split(' '); s = qw.filter((w) => w.length > 2 && nw.some((x) => x.startsWith(w) || w.startsWith(x))).length * 15; } if (s > bs) { bs = s; best = p; } });
    return bs >= 15 ? best : null;
  }
  PIP.findPlace = findPlace;
  /* ---------- journeys ---------- */
  function legTxt(jr) {
    const P = (id) => places().find((x) => x.id === id), L = jr.legs;
    const ch = L.length > 1 ? ', change at ' + L.slice(1).map((l, n) => `${P(L[n].rt.stops[L[n].j]).name} (${fmt(l.dep)})`).join(' then ') : ', direct';
    return `${fmt(jr.dep)}${dayw(jr.dep)} → ${fmt(jr.arr)}${dayw(jr.arr) && dayw(jr.arr) !== dayw(jr.dep) ? dayw(jr.arr) : ''}: ${L[0].rt.op.n} ${L[0].rt.op.T ? L[0].rt.op.T.v : ''}${ch}, ${$(jr.cost * grp())}${grp() > 1 ? ' for ' + grp() : ''}`;
  }
  function route(to) {
    const from = here(); if (!from || !R) return 'I can\'t see the map right now.';
    if (from.id === to.id) return `You're already in ${to.name}. Achievement unlocked: arriving.`;
    const js = R.journeys(from, to, G().t, 3), strict = js.filter((j) => j.legs.some((l) => l.rt.op.strict)).length;
    const dist = Math.round(Math.hypot(from.x - to.x, from.y - to.y));
    if (!js.length) return `No bus or train links ${from.name} and ${to.name}, even with changes. That leaves feet, a bike, or someone's car. Open the Atlas map for the roads. It's roughly ${dist} map-miles, so plan for food and a night somewhere.`;
    const money = G().money, cheap = Math.min(...js.map((j) => j.cost)) * grp();
    const viaHome = from.id !== 'p0' && to.id !== 'p0' && js.every((j) => j.legs.some((l, n) => n > 0 && l.rt.stops[l.i] === 'p0'));
    return `${from.name} → ${to.name}:\n` + js.map((j, i) => `${i + 1}) ${legTxt(j)}`).join('\n') + `\n${viaHome ? 'Heads up: that changes in Harlow. People there know your face. ' : ''}${money < cheap ? `You have ${$(money)}, which isn't enough for the cheapest one. ` : ''}${strict ? 'The big companies check ages. The scrappy ones mostly don\'t. ' : ''}Buy tickets from "Travel" in the town menu.`;
  }
  function board() {
    const p = here(); if (!R || !p) return 'No departures I can see.';
    const L = R.board(p, G().t, 300).slice(0, 6); if (!L.length) return `Nothing leaves ${p.name}. It's that kind of place.`;
    const P = (id) => places().find((x) => x.id === id);
    return `Leaving ${p.name}:\n` + L.map((b) => `${fmt(b.dep)}${dayw(b.dep)}: ${b.rt.op.n} to ${P(b.rt.stops[b.rt.stops.length - 1]).name}`).join('\n');
  }
  /* ---------- sleeping / motels ---------- */
  function sleep() {
    const g = G(), p = here(), out = [], n = grp();
    if (g.room && g.room.pid === p.id && g.room.until > g.t) { const nn = Math.max(1, Math.round((g.room.until - g.t) / 1440)); out.push(`You have a room at ${g.room.n}, paid for about ${nn} more night${nn > 1 ? 's' : ''}. Use it. Showers are free when you already paid.`); }
    if (g.base && g.base.pid === p.id) out.push(`Your base is here (${g.base.up.length} upgrade${g.base.up.length === 1 ? '' : 's'}). ${g.base.up.length < 3 ? 'Still pretty rough. Cold nights will hurt.' : 'Honestly? Decent.'}`);
    const ms = SH.Motels ? SH.Motels.motels(p) : [];
    ms.slice().sort((a, b) => a.rate - b.rate).forEach((m) => out.push(`${m.n} (${m.k === 'pro' ? 'chain, wants ID + a card' : m.k === 'loose' ? 'family-run, asks questions, haggles' : 'cash, no questions'}): ${$(m.rate)}/night${n > 1 ? ` (+$5 a head if you all share)` : ''}, ${$(m.rate * 6)}/week.`));
    if (!ms.length) out.push(`${p.name} has no motels. Villages don't.`);
    if (!g.base && /village|small/.test(p.tier)) out.push('No base yet. Woods or an old barn could be one. "Find a base" in the town menu.');
    if (/town|city/.test(p.tier) && !ms.some((m) => m.rate <= g.money)) out.push('Can\'t afford a room? The side streets have people who look out for regulars. Being a regular takes time.');
    out.push(SH.World2 && SH.World2.season && SH.World2.season(g.t) === 'winter' ? 'It\'s winter. A night outside isn\'t a plan, it\'s a gamble.' : 'Outside is free. Free has a cost.');
    return out.join('\n');
  }
  function motelTips() {
    const g = G(), p = here(), ms = SH.Motels ? SH.Motels.motels(p) : [];
    const K2 = { pro: 'Chains want ID and a card. No haggling, and they spot bad fakes. Skip unless you have a good fake ID.', loose: 'Family-run places ask questions but bargain. A believable story ("my mom\'s parking the car") plus a lower offer works. They go down to about 70%. Prepay a week and it\'s 6 nights\' price for 7.', sloppy: 'Cash places don\'t ask. Cheapest, loudest, and managers get spooked if trouble shows up.' };
    const kinds = [...new Set(ms.map((m) => m.k))];
    return (ms.length ? `In ${p.name}: ` + ms.map((m) => `${m.n} (${m.k}, ${$(m.rate)})`).join(', ') + '.\n' : `No motels in ${p.name}.\n`) + (kinds.length ? kinds : ['pro', 'loose', 'sloppy']).map((k) => K2[k]).join('\n') +
      `\nA week costs 6 nights, a month about 22.${g.fakeId ? ` Your fake ID says "${g.fakeId.name}". It's ${g.fakeId.q === 'good' ? 'decent' : 'bad. A chain clerk will notice'}.` : ''} Never tell two clerks different names in the same town.`;
  }
  /* ---------- buying ---------- */
  function buy(q) {
    const C = SH.Catalog, S = SH.Stores, p = here(); if (!C || !S) return 'My shopping database is on strike.';
    q = q.replace(/\b(a|an|some|the|new|cheap|good)\b/g, ' ').replace(/[?.!]/g, '').trim(); const hits = C.search(q).slice(0, 3); if (!hits.length) return `"${q}"? Not something stores out here carry. Try other words.`;
    const it = hits[0]; if (it.cat === 'adult') return 'That\'s grown-up stuff. You\'re not buying that. Next.';
    const list = (S.BY_TIER[p.tier] || ['general']).filter((s) => S.STORES[s].cats.includes(it.cat) && (!S.STORES[s].max || it.price <= S.STORES[s].max || it.cat === 'food'));
    if (list.length) return `${it.n}: ${list.map((s) => `${S.STORES[s].n} (${$(S.price(it, s, p))})`).join(', ')}, here in ${p.name}.${hits[1] ? ` Also: ${hits.slice(1).map((h) => h.n).join(', ')}.` : ''} Buying stuff gets you noticed${p.tier === 'city' ? ', but barely here' : ''}.`;
    const big = places().filter((x) => /town|city/.test(x.tier)).sort((a, b) => Math.hypot(a.x - p.x, a.y - p.y) - Math.hypot(b.x - p.x, b.y - p.y))[0];
    return `Nobody in ${p.name} sells ${it.n}. The nearest bigger place is ${big ? big.name : 'far'}. Or the Shoply app delivers, if you have an address and patience.`;
  }
  /* ---------- money ---------- */
  function money() {
    const g = G(), p = here(), n = grp(), ms = SH.Motels ? SH.Motels.motels(p) : [];
    const food = 9 * n, bed = g.room && g.room.until > g.t ? 0 : g.base ? 0 : ms.length ? Math.min(...ms.map((m) => m.rate)) + (n - 1) * 5 : 0, day = food + bed;
    const runway = day ? Math.floor(g.money / day) : 99;
    const earn = [];
    if (p.kidjobs && p.kidjobs.length) earn.push('odd jobs here (' + p.kidjobs.slice(0, 3).join(', ') + ')');
    earn.push(n > 1 ? 'a group business (one per town): more of you, more money' : 'a business, like a stand. Better with friends');
    if (/town|city/.test(p.tier)) earn.push('the pawn shop, for things you own and don\'t need');
    return `You have ${$(g.money)}. Out here a day costs your group about ${$(day)} (${$(food)} food${bed ? `, ${$(bed)} for the cheapest bed` : ', bed already covered'}). That's ${runway >= 99 ? 'plenty of days' : runway + ' day' + (runway === 1 ? '' : 's')}. ${runway <= 2 ? 'That\'s not a runway, that\'s a cliff. ' : ''}Ways to earn in ${p.name}: ${earn.join('; ')}.`;
  }
  /* ---------- noticed? ---------- */
  function safety() {
    const g = G(), p = here(), an = g.awayNotice || 0, heat = g.heat || 0, cv = (g.cover || {})[p.id], look = g.look ? Object.values(g.look).filter(Boolean).length : 0;
    const sig = SH.Net && SH.Net.cell ? SH.Net.cell(p) : null, pm = SH.Net && SH.Net.posterMult ? SH.Net.posterMult(p) : 1;
    const lv = an >= 70 ? 'People here are watching you. Leave soon.' : an >= 40 ? 'You\'re getting noticed here. Folks talk.' : an >= 15 ? 'A few people have clocked you. Normal for a new face.' : 'Nobody here is paying you much attention.';
    const hv = heat >= 60 ? 'Police are actively looking. Your photo is out.' : heat >= 30 ? 'Your case is open and your name is on lists.' : g.reported ? 'You\'ve been reported missing, but it\'s quiet.' : 'Nobody official is looking hard yet.';
    const tips = [];
    if (!cv) tips.push('you have no cover story here (set one up in "You & your group")');
    if (look < 2 && heat >= 30) tips.push('a haircut or a new look makes posters less useful');
    if (an >= 40) tips.push('another town would reset how noticed you are');
    const caught = Object.entries(g.claims || {}).filter(([k, c]) => c.caught && k.includes(p.name)).length; if (caught) tips.push(`${caught} person${caught > 1 ? 's' : ''} here caught you changing your story`);
    return `${lv} ${hv} ${pm < 0.8 ? `${p.name} is barely online, so posters don't travel far.` : pm > 1.1 ? `${p.name} is very online. Posters spread.` : ''}${cv ? ` Here you're "${cv.name}".` : ''}${tips.length ? ' PIP says: ' + tips.join('; ') + '.' : ''}`;
  }
  function health() {
    const p = here(), W2 = SH.World2, h = G().hp || {}, clinic = /town|city/.test(p.tier) || (p.services && p.services.clinic);
    return `${W2 && W2.hpLine ? W2.hpLine() : 'You seem okay.'} ${h.cold >= 70 ? 'That\'s a fever. Fevers end runs. ' : ''}${h.cold || h.blist >= 30 ? (clinic ? `${p.name} has a clinic (about $25). Go.` : `No clinic in ${p.name}. The nearest town has one.`) : ''} ${h.debt >= 2 ? 'Sleep somewhere with walls tonight.' : ''} ${h.blist ? 'Dry socks and better shoes help blisters.' : ''}`.replace(/\s+/g, ' ').trim();
  }
  function pillars() {
    const NF = SH.NotFound, p = here(); if (!NF) return 'Disappearing is not a feature. Yet.';
    const ps = NF.pillars(p), d = Math.floor(K ? K.days() : 0), fix = { 'A place to sleep': 'a base with 3+ upgrades, or a room paid a week ahead', 'A way to eat': '$120 saved, a business that has made $100, or regulars on the side streets', 'A story people believe': 'a cover story in this town, or two changes to how you look', 'People who\'d vouch for you': 'a good name in town, a close runaway friend, or helping someone' };
    return `Day ${d} away. ` + ps.map(([n, ok]) => `${ok ? '✓' : '✗'} ${n}${ok ? '' : ': ' + fix[n]}`).join('\n') + `\n${d < 21 ? `It's too soon. Everyone's still looking for ${21 - d} more days.` : NF.ready(p) ? 'You could stay gone. It\'s in "You & your group". I won\'t be dramatic about it. Much.' : 'Not yet. Need 3 of 4, and nobody close.'}`;
  }
  function parents() {
    const g = G(), P = SH.Parents, party = K ? K.party() : []; if (!party.length || !P) return 'No friends with you, so no parents to worry about. Except yours. Yours definitely worry.';
    return party.map((id) => { const w = P.W(id), lv = w.w >= 85 ? 'frantic' : w.w >= 60 ? 'very worried' : w.w >= 35 ? 'worried' : 'uneasy'; return `${K.nm(id)}'s parent: ${lv}${w.chirp ? ', posting online' : ''}${w.sched ? ', gets the nightly "I\'m safe" text' : ''}.`; }).join('\n') + '\nA nightly "I\'m safe" text slows the worry. Every ping is a small risk.';
  }
  function coach(who) {
    const g = G(), p = here(), cv = (g.cover || {})[p.id], cl = SH.Mind && SH.Mind.claims ? SH.Mind.claims : () => ({}), ex = (g.excuse || {})[p.id];
    if (/clerk|motel/.test(who)) return motelTips();
    if (/cop|police|officer/.test(who)) return `Cops: stay calm, short answers, no fake details you'll forget. ${ex ? `You already told police here it's "${ex}". Stick to it.` : 'Pick ONE excuse (school project, fundraiser, helping family, youth group) and keep it.'} Charities get checked. If home isn't safe, saying so is always an option. It changes what they're supposed to do.`;
    if (/kid|runaway/.test(who)) return 'Runaway kids are wary. Don\'t push. Share a bit of your story first, offer food, and ask what they need. They can join you, or you can help them get to a safe adult.';
    return `Locals: ${cv ? `you're "${cv.name}" here${cv.story ? '. Keep the same story' : ''}.` : 'pick a name and a reason to be here, and use the same one with everyone. Small towns talk.'} Short, friendly, boring. Boring is invisible.`;
  }
  /* ---------- plan on the road ---------- */
  const basePlan = PIP.plan;
  PIP.plan = function () {
    if (!away()) return basePlan.apply(this, arguments);
    const g = G(), s = g.s, p = here(), out = [], h = SH.hour(), M = mem();
    if ((s.warmth != null && s.warmth < 45) || (SH.tempF && SH.tempF() < 38 && (h >= 19 || h < 7))) out.push(`It's ${SH.tempF ? SH.tempF() + '°F' : 'cold'} and you're cold. Get indoors: ${g.room && g.room.pid === p.id ? 'your room' : SH.Motels && SH.Motels.motels(p).length ? 'a motel, the library, anywhere with heat' : 'the store, a church, a barn'}.`);
    if (s.full < 40) out.push(`Fullness ${Math.round(s.full)}%. ${SH.foodInBag && SH.foodInBag().length ? 'You have food. Eat it.' : 'Buy food. The store here has it.'}`);
    if (g.phone && g.phone.bat < 25) out.push(`I'm at ${Math.round(g.phone.bat)}%. ${g.room && g.room.pid === p.id ? 'Your room has an outlet.' : 'Find an outlet: library, diner, motel.'}`);
    if (s.energy < 30 || h >= 22 || h < 5) out.push('Sleep soon. ' + sleep().split('\n')[0]);
    if (M.goal) { const to = places().find((x) => x.id === M.goal); if (to && to.id !== p.id && R) { const j = R.journeys(p, to, g.t, 1)[0]; out.push(j ? `Your goal: ${to.name}. Next way there: ${legTxt(j)}.` : `Your goal: ${to.name}. No transit connects. Walk, bike, or rethink.`); } else if (to && to.id === p.id) out.push(`You made it to ${to.name}. Your goal. Now what?`); }
    const hh = g.hp || {}; if (hh.cold >= 70) out.push('You have a fever. Clinic, today.'); else if (hh.cold || hh.blist >= 30) out.push(`${hh.cold ? 'You\'re sick' : 'Your feet are wrecked'}. ${/town|city/.test(p.tier) || (p.services && p.services.clinic) ? 'The clinic here costs about $25.' : 'Rest somewhere warm.'}`);
    const mline = money(), md = (mline.match(/That's (\d+) day/) || [])[1]; if (md != null && +md <= 2) out.push(`Money: ${$(g.money)} lasts about ${md} day${md === '1' ? '' : 's'} here. Earn something (ask me "money").`);
    if ((g.awayNotice || 0) >= 40 || (g.heat || 0) >= 60) out.push(`${(g.awayNotice || 0) >= 70 ? 'People here are watching you. Move on soon.' : 'You\'re getting noticed here.'}${!(g.cover || {})[p.id] ? ' Set up a cover story.' : ''}`);
    if (K && K.days() >= 14) out.push(pillars().split('\n').slice(0, 1).join(''));
    if (!out.length) out.push(pick([`Things are okay. ${p.name} is quiet. Earn something, eat something, charge me.`, 'Nothing\'s on fire. Rare. Enjoy it.']));
    return out;
  };
  /* ---------- the reply router ---------- */
  const base = PIP.reply;
  const RX = {
    route: /\b(?:how (?:do|can|would|should) (?:i|we) (?:get|go) to|how to get to|way to|route to|directions to|(?:bus|train|ride|ticket)s? to|get (?:me|us) to|travel to|how far (?:is|to))\s+(.+)/,
    board: /\b(what'?s leaving|next (bus|train|ride)|departures?|timetable|schedule here|what leaves|when'?s the (next )?(bus|train))\b/,
    sleep: /\b(where|somewhere).{0,20}\b(sleep|stay|crash)\b|\bsleep tonight\b|\bstay tonight\b|\bneed a bed\b/,
    motel: /\b(motel|check ?in|get a room|haggle|clerk)\b/,
    buy: /\b(?:where (?:can|do|could) (?:i|we) (?:buy|get|find)|do (?:they|stores?) (?:sell|have)|i need to buy|buy (?:a|an|some))\s+(.+)/,
    money: /\b(money|cash|afford|broke|earn|budget|how long can i last|runway|job)\b/,
    safe: /\b(am i safe|noticed|looking for me|posters?|heat|wanted|being searched|am i (?:hidden|found)|do they know|suspicious)\b/,
    health: /\b(sick|fever|cold\b|blisters?|feet hurt|clinic|doctor|health|coughing|i feel (?:bad|awful|sick))\b/,
    pillars: /\b(disappear|stay gone|for good|never be found|never found|pillars|settle down|stop running)\b/,
    parents: /\b(parents?|worried|worry)\b.*\b(friends?|nia|marco|priya|eli|theo|hazel|their)\b|\b(nia|marco|priya|eli|theo|hazel)'?s (mom|dad|parents?)\b/,
    coach: /\b(?:what (?:do|should) i (?:say|tell)|how (?:do|should) i talk to|help me talk to|what to say to)\s+(?:to\s+)?(?:the\s+|a\s+)?(clerk|motel|cop|police|officer|local|people|kid|runaway)/,
    where: /\b(where am i|what is this place|what'?s here|tell me about (this|here))\b/,
    remind: /\b(remind me|what was i doing|what'?s my (goal|plan)|what am i doing|where was i going)\b/,
    goal: /\b(?:i want to (?:go|get) to|my goal is(?: to (?:go|get) to)?|i'?m (?:going|heading|trying to get) to|we need to get to|plan is to (?:go|get) to)\s+(.+)/,
  };
  PIP.reply = function (raw) {
    const g = G(), t = String(raw || '').toLowerCase(), M = mem(), a = SH.NLP.analyze(raw);
    if (a.has && a.has('selfharm')) return base.apply(this, arguments);
    let m, r = null;
    try {
      if ((m = t.match(RX.goal))) { const to = findPlace(m[1]); if (to) { M.goal = to.id; r = `Goal saved: ${to.name}. I'll keep it in mind${away() ? '' : ' for when you\'re out there'}. ` + (away() ? route(to) : ''); } }
      if (!r && (m = t.match(RX.route))) { const to = findPlace(m[1]); r = to ? route(to) : `"${m[1].trim()}"? Not on my map. Spell it like the Atlas does.`; if (to && !M.goal) M.goal = to.id; }
      if (!r && RX.remind.test(t)) { const to = M.goal && places().find((x) => x.id === M.goal); r = to ? `Your goal: ${to.name}.${away() && here().id !== to.id && R ? ' ' + (R.journeys(here(), to, g.t, 1).map(legTxt)[0] || 'No transit goes there from here.') : ''} ${M.last ? `Last thing you asked me about: ${M.last}.` : ''}` : `You haven't told me a goal. Say "I want to get to ___".${M.last ? ` Last thing you asked about: ${M.last}.` : ''}`; }
      if (!r && away()) {
        if (RX.board.test(t)) { r = board(); M.last = 'departures'; }
        else if ((m = t.match(RX.buy))) { r = buy(m[1]); M.last = 'buying ' + m[1].slice(0, 20); }
        else if ((m = t.match(RX.coach))) { r = coach(m[1]); M.last = 'talking to ' + m[1]; }
        else if (RX.pillars.test(t)) { r = pillars(); M.last = 'disappearing'; }
        else if (RX.parents.test(t)) { r = parents(); M.last = 'the parents'; }
        else if (RX.sleep.test(t)) { r = sleep(); M.last = 'where to sleep'; }
        else if (RX.motel.test(t)) { r = motelTips(); M.last = 'motels'; }
        else if (RX.health.test(t)) { r = health(); M.last = 'health'; }
        else if (RX.safe.test(t)) { r = safety(); M.last = 'being noticed'; }
        else if (RX.money.test(t)) { r = money(); M.last = 'money'; }
        else if (RX.where.test(t)) { const p = here(), sig = SH.Net && SH.Net.signal ? SH.Net.signal() : null; r = `${p.name}: a ${p.tier === 'small' ? 'small town' : p.tier}${p.biome ? ' (' + p.biome + ')' : ''}. ${(SH.Stores ? (SH.Stores.BY_TIER[p.tier] || []).map((s) => SH.Stores.STORES[s].n).join(', ') : '')}. ${SH.Motels && SH.Motels.motels(p).length ? SH.Motels.motels(p).length + ' motel(s).' : 'No motels.'} ${p.hasPolice ? 'Has its own police.' : 'No police station.'}${sig ? ` Signal: ${sig.bars} bar${sig.bars === 1 ? '' : 's'} ${sig.gen}.` : ''}`; M.last = 'this place'; }
      }
    } catch (e) { console.warn('pip2', e); r = null; }
    if (r) { M.asked[M.last || 'route'] = (M.asked[M.last || 'route'] || 0) + 1; return r; }
    // otherwise: the old PIP, but its "I didn't get that" becomes a real menu
    const conv = (g.convMem.pip = g.convMem.pip || {}); conv._fb = false;
    const out = base.apply(this, arguments);
    if (conv._fb) return away() ? `Not sure what you mean. Out here I can do: "how do I get to ___", "what's leaving", "where can I sleep", "motel tips", "where can I buy ___", "money", "am I safe", "I feel sick", "can I disappear", "what do I say to a cop"${K && K.party().length ? ', "how are the parents"' : ''}. Or "what should I do".` : out + ' Also try: "how do I get to Cedar Falls", "what should I do", "money".';
    return out;
  };
  /* greet with the goal when you open PIP after a while (used by phone PIP view if present) */
  PIP.nudge = function () { const M = mem(), to = M.goal && places().find((x) => x.id === M.goal); return to && away() && here().id !== to.id ? `Still headed to ${to.name}? Ask me "remind me".` : null; };
  /* ---------- suggestions for the new people ---------- */
  const baseS = PIP.suggest;
  PIP.suggest = function (npc, lastText, ctx) {
    const S = (h, s, d) => [{ tone: 'honest', t: h }, { tone: 'smartass', t: s }, { tone: 'dodge', t: d }];
    const g = G(), p = away() ? here() : null, cv = p && (g.cover || {})[p.id], c = SH.Talk && SH.Talk.cur, last = String(lastText || '');
    const k = SH.Mind && SH.Mind.who ? SH.Mind.who(npc, { npc }) : npc, cl = SH.Mind && SH.Mind.claims ? SH.Mind.claims(k) : {};
    const myName = (cl.name && cl.name.v) || (cv && cv.name) || null, ask = SH.Mind && SH.Mind.askOf ? SH.Mind.askOf(last) : null;
    const nameAns = myName ? `I'm ${myName}.` : `I'm Jordan.`;
    try {
      if (npc === 'clerk') {
        const m = c && c.opts && c.opts.m, rate = m ? m.rate : 49, low = Math.round(rate * (m && m.k === 'loose' ? 0.75 : m && m.k === 'sloppy' ? 0.65 : 1));
        if (ask === 'name') return S(nameAns, `${myName || 'Jordan'}. Like the river. Not really, I just like it.`, `${myName || 'Jordan'}. How much for a night?`);
        if (ask === 'age' || /\b(how old|id|identification|card)\b/i.test(last)) return S('I\'m 12. I just need somewhere safe to sleep tonight.', 'Old enough to pay cash. Young enough to be polite about it.', g.fakeId ? 'Here\'s my ID.' : 'My mom has the card, she\'s parking the car.');
        if (ask === 'parents' || /\b(parents?|mom|dad|adult|grown)\b/i.test(last)) return S('It\'s just me. Things at home aren\'t safe.', 'My mom\'s in the car. She\'s had a day. You don\'t want to meet her like this.', 'My mom\'s parking. She said to get the room.');
        if (m && m.k === 'pro') return S('I\'m on my own and I need a room. Please.', 'Do you have a kids\' rate? Asking for me.', 'Never mind, thanks.');
        return S(`Could you do $${low} a night? It's all I've got.`, `What about a week, cash up front? $${Math.round(rate * 6 * 0.8)}.`, `How much for one night?`);
      }
      if (npc === 'cop') {
        const ex = (g.excuse || {})[p && p.id];
        return S('Honestly? I ran away. Home isn\'t safe.', ex ? `Like I said last time, it's a ${ex}. Same as always.` : 'It\'s a school project. We\'re learning about small business.', ex ? `It's for the ${ex}.` : 'Just helping my family out.');
      }
      if (npc === 'local') {
        if (ask === 'name') return S(nameAns + (cv && cv.story ? ` ${cv.story}.` : ''), `${myName || 'Jordan'}. I'm new. Like, very new.`, `${myName || 'Jordan'}.`);
        if (ask === 'family' || ask === 'from') return S(cl.story ? `I'm ${cl.story.v}.` : (cv && cv.story ? `${cv.story}.` : 'I\'m visiting my aunt for a bit.'), 'Nobody you\'d know. We keep to ourselves.', 'Just passing through.');
        if (ask === 'going') return S('I\'m not sure yet, honestly.', 'Wherever the bus goes. Adventure!', 'Just walking around.');
        return S('Is there anywhere warm to sit around here?', 'Nice town. Very... quiet.', 'Have a good one.');
      }
      if (/^rk_|^rk$/.test(npc)) return S('I left too. My stepdad. You don\'t have to tell me yours.', 'Rate this bench out of ten. I say four.', 'Want some food? I have extra.');
      if (/^host_/.test(npc)) { const kid = npc.slice(5), nm = K ? K.nm(kid) : 'they'; return S(`${nm} is safe. We're together. I promise.`, `${nm} is fine. Eating vegetables, even. Some.`, `${nm} will text you tonight.`); }
    } catch (e) { console.warn('pip2 suggest', e); }
    return baseS.apply(this, arguments);
  };
})(window.SH);
