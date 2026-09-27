/* SMALL HOURS — "Keep living it" (turn 40). After a never-found ending, you can keep playing for up to four more
   months, stop whenever you want, and get a SECOND ending: either one of the "later" endings below (picked from how
   those months went: the shack, friends, a base, money, how long you lasted), or whatever catches up with you
   first (being found counts). Once per run. Both endings are recorded. */
(function (SH) {
  const EN = SH.Endings, X = SH.EndX, K = SH.K; if (!EN || !X || !K) return;
  const G = () => SH.G, DAYS = 120;
  const isGone = (key) => X.defs.some((d) => d.k === key && d.on.includes('gone')) || /^gone/.test(key || '');
  const ex = (g) => (g.later ? Math.max(0, Math.round((g.t - g.later.t0) / 1440)) : 0);
  const mon = (t) => { const W = SH.World2; return W ? ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'][W.cal(t).m] : ''; };
  const seas = (t) => (SH.World2 ? SH.World2.season(t) : 'spring');

  /* after any ending screen is drawn: offer to keep going, or mark it as the second ending */
  function after() {
    const g = G(), md = document.querySelector('#modal'); if (!g || !g.ended || !md || md.classList.contains('hidden') || md._later) return;
    const box = md.querySelector('.mchoices'), h1 = md.querySelector('.ending h1'); if (!box || !h1) return;
    md._later = 1;
    if (isGone(g.endKey) || X.defs.some((d) => d.k === g.endKey && d.on.includes('later'))) afterNeverFound(md, g);
    if (g.later && !g.later.done) {
      g.later.done = true; g.later.second = g.endKey; g.later.secondTitle = h1.textContent;
      h1.insertAdjacentHTML('beforebegin', `<small style="display:block;color:var(--amber);letter-spacing:2px;margin-bottom:4px">SECOND ENDING · ${ex(g)} DAYS AFTER “${g.later.firstTitle}”</small>`);
      return;
    }
    if (g.later || !isGone(g.endKey)) return;
    const btn = document.createElement('button'); btn.className = 'btn primary'; btn.id = 'keepLiving'; btn.textContent = '🌱 Keep living it (up to 4 more months)';
    btn.title = 'Play on from here. Stop any time (You & your group) for a second ending.';
    box.prepend(btn);
    btn.onclick = () => {
      g.later = { first: g.endKey, firstTitle: h1.textContent, t0: g.t, until: g.t + DAYS * 1440, beat: 0 };
      g.ended = false; g.endKey = null; g.phase = 'run';
      md.classList.add('hidden'); md.innerHTML = ''; md._later = 0; if (SH.Events) SH.Events.Q = [];
      SH.UI.log(`— You keep going. Up to four more months, until ${SH.longDate ? SH.longDate(g.later.until) : 'spring'}. You can stop any time from “You & your group”. —`, 'day');
      SH.UI.afterAction();
    };
  }
  // never-found endings: the generic "After" section (Mom hugging you, etc.) doesn't fit, so tell what happens at home instead
  function afterNeverFound(md, g) {
    const h = [...md.querySelectorAll('h4')].find((x) => /^after$/i.test(x.textContent.trim())); if (!h) return;
    let n = h.nextElementSibling; while (n && n.tagName !== 'H4') { const nx = n.nextElementSibling; n.remove(); n = nx; }
    const nm = (x) => (SH.nm ? SH.nm(x) : x), rick = nm('Rick'), mom = nm('Mom'), sib = nm('Lily');
    const contact = SH.f('calledHome') || SH.f('momWrote') || (g.tale && g.tale.cards >= 3);
    const L = [[mom, contact ? `${mom} keeps your room the way it was, and a shoebox by the phone: ${SH.f('calledHome') ? 'the dates of every call, written on the lid' : 'every postcard and every printed email'}. She stopped asking where a long time ago. She asks how, now. She's getting better at listening to the answer.` : `${mom} keeps your room the way it was. Some nights she calls your old number just to hear the voicemail, and then she hangs up before the beep, because she doesn't know what to say to it.`],
      [rick, `${rick} tells anybody who asks that you'll come back when you get hungry. You don't. After a while nobody asks him anymore, and the house gets very quiet around him.`],
      [sib, g.rel && g.rel.lily > 50 ? `${sib} sleeps in your hoodie. She draws the same picture over and over: a house in the woods with smoke coming out of the chimney. She says you live there. She's not wrong.` : `${sib} stops asking where you went. She starts leaving the porch light on instead.`],
      ['The posters', 'Your face stays on the corkboard at the Harlow library for a year. Then somebody pins a lost-cat flyer over one corner, and then another over the rest.']];
    h.insertAdjacentHTML('afterend', L.map(([w, t]) => `<p><b style="font-family:system-ui;font-size:13px;color:var(--amber)">${w}.</b> ${t}</p>`).join(''));
  }
  const sched = () => setTimeout(after, 80);
  const bShow = EN.show; EN.show = function () { const r = bShow.apply(this, arguments); sched(); return r; };
  const bRender = X.render; X.render = function () { const r = bRender.apply(this, arguments); sched(); return r; };
  // reset the marker when a new modal is drawn
  const bDlg = SH.UI.dialog; SH.UI.dialog = function () { const md = document.querySelector('#modal'); if (md) md._later = 0; return bDlg.apply(this, arguments); };

  function finish(full) { const g = G(); if (!g || g.ended || !g.later) return; const p = g.away && SH.Atlas ? SH.Atlas.here() : null; X.trigger('later', { full, place: p }); }
  /* stop any time */
  K.me((p, ch) => { const g = G(); if (!g.later || g.later.done) return; const d = ex(g);
    ch.push({ t: '🌱 Stop here (second ending)', sub: `Day ${d} of ${DAYS} of your extra months`, cls: 'hot', fn: () => K.D('Stop here?', [`It's been ${d} day${d === 1 ? '' : 's'} since “${g.later.firstTitle}”. This ends the story here, with a second ending.`], [{ t: 'Yes, end it here', cls: 'hot', fn: () => finish(false) }, { t: 'Not yet', fn: K.back }]) }); });
  /* the months go by: a beat each month, and the end at four months */
  K.daily.push(() => { const g = G(); if (!g.later || g.later.done || g.ended) return; const d = ex(g);
    if (g.t >= g.later.until) return setTimeout(() => finish(true), 60);
    const b = Math.floor(d / 30); if (b > g.later.beat) { g.later.beat = b;
      SH.UI.log(`— ${b === 1 ? 'One month' : b === 2 ? 'Two months' : 'Three months'} since you decided to disappear. It's ${mon(g.t)}. ${{ winter: 'The cold is the whole job now.', spring: 'Things are turning green at the edges.', summer: 'The days are long and the nights are short and warm.', fall: 'The leaves are turning, again.' }[seas(g.t)]}${b === 3 ? ' One month left, if you want it.' : ''} —`, 'day'); } });

  /* ---------- the "later" endings ---------- */
  const shackHere = (c) => { const b = c.g.base; return b && b.shack && c.place && b.pid === c.place.id && b.up.filter((u) => /^sh_/.test(u)).length >= 5; };
  const warm = (c) => { const v = c.g.vill && c.place && c.g.vill[c.place.id]; return v ? v.perks.length : 0; };
  const wk = (c) => `${ex(c.g)} days`;
  const whenNow = (c) => `${mon(c.g.t)}`;
  X.add([
    { k: 'laterShort', on: ['later'], p: 6, w: (c) => ex(c.g) < 21, t: 'A Few More Weeks', sub: 'You stopped. That\'s allowed.',
      x: (c) => [`${ex(c.g) < 2 ? 'You barely gave it another day' : `You gave it ${wk(c)} more`}. Then one morning in ${c.town} you woke up and knew you'd had enough of it. Not of being free. Of being careful every minute of every day.`,
        `${c.name} stayed out of sight for exactly as long as ${c.name} wanted to, which is more than most people ever get to say about anything.`,
        `What came after is yours. The story stops here because you stopped it. That was the point all along: somebody else was always deciding. This time you did.`] },
    { k: 'laterShack', on: ['later'], p: 5, w: shackHere, t: 'Four Walls I Made', sub: c => c.extra.full ? 'Four months in a shack. Never found.' : 'A shack past the last fence. Never found.',
      x: (c) => [`By ${whenNow(c)} the shack outside ${c.town} has a path worn to it. The door sticks in wet weather; you've learned to lift it as you push. There's a shelf now, made of a board ${warm(c) ? 'the farmer left by the fence' : 'from the FREE pile'}, ${(c.g.skills || {}).carve ? ' with a row of carved spoons on it that got better from left to right' : ' with a jar of creek stones on it, for no reason, because you wanted a shelf with something on it'}.`,
        c.n ? `${c.pl} ${c.n === 1 ? 'is' : 'are'} still here. Some nights nobody talks at all. You just watch the fire ring go orange and then red and then grey, and it's enough.` : `Most nights it's just you and the fire. You thought that would be lonely. Sometimes it is. Mostly it's quiet in a way nothing in ${c.momN}'s house ever was.`,
        warm(c) >= 3 ? `The village has quietly decided you're theirs. Nobody says it. The diner keeps a plate back. The clerk keeps the outlet free. People have stopped asking where you're from, and started asking how the roof's holding up.` : `A few people in ${c.town} know there's a kid out past the fields. None of them have ever said a word to anyone.`,
        `Nobody ever finds ${c.name}. The shack stands for years after you leave it, when you're old enough to leave it on your own terms, and a hunter who finds it one November sits inside out of the wind and wonders who built something that careful, that small.`] },
    { k: 'laterFriends', on: ['later'], p: 4, w: (c) => c.n >= 1, t: c => c.n === 1 ? 'Still the Two of Us' : 'Still All of Us', sub: 'Months later. Never found. Not alone.',
      x: (c) => [`${wk(c)} after you meant to vanish, you and ${c.pl} are still out here, in ${c.town}, in ${whenNow(c)}. You've had exactly one real fight (about a sandwich) and a hundred small ones (about everything else), and every single morning you both woke up and chose to still be here.`,
        `You know things about each other now that nobody else will ever know. What ${c.n === 1 ? c.pl + ' is' : 'they\'re'} scared of. What you're scared of. What you both say in your sleep.`,
        `Nobody finds you. Years from now, grown, you'll meet for coffee in some ordinary city and one of you will say "remember the—" and the other will already be laughing.`] },
    { k: 'laterBase', on: ['later'], p: 3, w: (c) => !!c.g.base, t: 'A Place of My Own', sub: 'A base, a routine, a life. Never found.',
      x: (c) => [`It's ${whenNow(c)}. ${wk(c)} since you decided to stop being findable, and you're still at your ${c.g.base.type === 'barn' ? 'barn' : c.g.base.type === 'building' ? 'empty building' : 'camp'} outside ${c.town}. You know which floorboard creaks, which way the wind comes from, what time the school bus goes by on the road so you can be out of sight.`,
        `A routine is a kind of house, it turns out. You built one out of hours instead of boards.`,
        `Nobody ever comes. When you finally leave, it's because you're ready, and you close the door behind you like you're coming back.`] },
    { k: 'laterMoney', on: ['later'], p: 3, w: (c) => c.money >= 300, t: 'Paid in Cash', sub: c => `$${Math.floor(c.money)} saved. Never found.`,
      x: (c) => [`By ${whenNow(c)} you have $${Math.floor(c.money)} folded into a sock, earned a few dollars at a time: farm work, spoons, a card table on the main road, whatever needed doing.`,
        `Nobody gave you a dollar of it. It's the first money in your life that nobody can take away by being angry.`,
        `Nobody finds you. You spend it slowly, on the kind of things that make a life: boots that fit, a library card under a name that's close enough, a bus ticket to somewhere you pick.`] },
    { k: 'laterSpring', on: ['later'], p: 1, t: c => c.extra.full ? 'Four Months' : 'Somewhere, Later', sub: 'Never found.',
      x: (c) => [`${c.extra.full ? 'Four months' : wk(c)} after you meant to disappear, it's ${whenNow(c)} in ${c.town}. ${{ winter: 'You made it through the cold, which is its own kind of diploma.', spring: 'The mud is back and so are the birds, and so, somehow, are you.', summer: 'It\'s warm enough to sleep anywhere. You still pick carefully.', fall: 'The leaves are turning, the way they were when you left.' }[seas(c.g.t)]}`,
        `You are not the kid who left ${c.momN}'s house. You can't point to the day that kid stopped being you. There wasn't one. It happened the way weather happens.`,
        `Nobody ever finds ${c.name}. Somewhere there's a missing poster going soft in the rain, and the face on it looks like somebody you used to know.`] },
  ]);
  SH.Later = { finish, after, ex };
})(window.SH);
