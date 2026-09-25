/* SMALL HOURS — Part 1e: The Ledger (local news; your missing poster appears, updates, gets comments),
   Safeline (help — reaching out ends the run, bittersweet and honest), Threadly (forums you can post to; creeps DM). */
(function (SH) {
  const B = SH.Browser; if (!B) return;
  const G = () => SH.G, esc = B.esc;
  const nm = (s) => SH.nm(s);
  const who = () => G().name || 'Sam';

  /* ---------------- The Ledger ---------------- */
  function stories() {
    const g = G(), r = B.rnd(B.seed() * 13 + SH.day()), out = [], d = SH.day(), here = B.place();
    const party = (g.party || []).map((id) => (SH.NPCS_META[id] || {}).n).filter(Boolean);
    if (g.phase === 'run' && g.reported) {
      const days = Math.max(1, Math.ceil((g.t - (g.missingAt || g.t)) / 1440));
      const names = [who()].concat(party), multi = names.length > 1;
      out.push({ id: 'missing', hot: true, h: multi ? `MISSING: ${names.length} Harlow kids, last seen together` : `MISSING: ${who()}, 12, last seen in Harlow`, sub: `Day ${days}. ${multi ? names.join(', ') : who()}. ${g.away ? 'Police say sightings have been reported outside Harlow.' : 'Police are asking anyone with information to call.'}`,
        body: [`${multi ? names.join(', ') + ' were' : who() + ' was'} reported missing ${days === 1 ? 'yesterday' : days + ' days ago'}. ${nm('Mom')} told the Ledger: "We just want ${multi ? 'them' : 'you'} home. Nobody is in trouble."`, g.away ? 'The county sheriff\'s office has shared the poster with neighboring towns.' : `Officer Lowe of Harlow PD said most runaway kids come home, or reach out, within a week. "The first 48 hours matter. If you see a kid alone at the bus station or the underpass late at night, call."`, 'If you are a young person and need help, the Runaway Safeline is free and confidential.'],
        comments: [['concerned_mom_of3', 'praying 🙏 sharing'], ['harlow_steve', 'saw a kid with a backpack near the Route 9 overpass last night, called it in'], ['mk_2011', 'i go to school with ' + who() + '. they\'re really nice. please come back'], ['anon', 'kids these days. where are the parents'], ['ruiz_teacher', 'Whoever reads this: you are not in trouble. You are missed.']].slice(0, 3 + Math.min(2, days)) });
    }
    const pool = [
      ['Plant layoffs: 140 more jobs cut at Route 9 facility', 'The second round this year. The union says families are "barely hanging on."'],
      ['Harbor House seeks volunteers for youth shelter', 'The Wharf St. shelter offers kids 12–17 a bed, meals and counseling for up to 21 days. "No kid should have to sleep outside."'],
      ['Lincoln Middle School fall carnival this Saturday', 'Face painting, a bake sale and the famous teachers-vs-students dodgeball game.'],
      ['Lost dog: "Biscuit," golden mix, near Maple St.', 'Answers to Biscuit and also to the sound of a chip bag.'],
      ['City council votes on new park lighting', 'Residents near the underpass have asked for more lights for years.'],
      ['Harlow Mobile outage leaves customers without data for 3 hours', 'The carrier apologized and offered 500 MB of free data.'],
      ['Food pantry hours extended for the winter', 'St. Brigid\'s pantry is now open Tuesday and Thursday evenings. No ID needed.'],
      ['High school football: Harlow beats Saltmore 21–14', 'A fourth-quarter interception sealed it.'],
      ['Police warn of online "job offers" targeting teens', 'Officers say scammers post "easy cash" jobs and ask for deposits or personal photos.'],
      ['Motel on Route 9 cited for code violations', 'Inspectors found broken smoke detectors and mold. The owner says repairs are "underway."'],
    ];
    const idx = pool.map((_, i) => i).sort(() => r() - 0.5).slice(0, 5);
    idx.forEach((i) => out.push({ id: 'n' + i, h: pool[i][0], sub: pool[i][1] }));
    if (here && here.name !== 'Harlow') out.splice(1, 0, { id: 'local', h: `${here.name}: ${here.notice > 0.6 ? 'Neighbors start Facebook group to "keep an eye out"' : 'Harvest festival draws a small crowd'}`, sub: `From the ${here.name} ${here.tier === 'village' ? 'church bulletin' : 'Courier'}.` });
    return out;
  }
  B.SITES['ledger.av'] = { n: 'The Ledger', icon: '📰', col: '#8a1c1c', mb: 1.2, tile: true, order: 2, render(path) {
    const S = stories(); const id = (path.match(/^a\/(\w+)/) || [])[1];
    if (id) { const s = S.find((x) => x.id === id) || S[0];
      return `<div style="font-size:11px;color:#ff8a8a">${s.hot ? 'DEVELOPING' : 'LOCAL'}</div><div style="font-size:16px;font-weight:700;line-height:1.25;margin:3px 0 6px">${esc(s.h)}</div>${s.hot ? `<div style="display:flex;gap:10px;align-items:center;background:#fff;color:#111;border-radius:8px;padding:8px;margin:6px 0"><div style="width:54px;height:66px;background:#ccc;border-radius:4px;display:flex;align-items:center;justify-content:center;font-size:30px">🧒</div><div style="font-size:11.5px"><b style="font-size:14px;color:#b00">MISSING</b><br>${esc(who())}, 12<br>Last seen: Harlow<br>Call Harlow PD</div></div>` : ''}${(s.body || [s.sub]).map((p) => `<p>${esc(p)}</p>`).join('')}${s.comments ? `<div class="sech">COMMENTS</div>${s.comments.map(([u, c]) => `<div class="setrow" style="font-size:12px"><b>${esc(u)}</b> ${esc(c)}</div>`).join('')}` : ''}${s.hot ? `<p>${B.lnk('safeline.av', '💛 Runaway Safeline: free, confidential')}</p>` : ''}`;
    }
    if (S[0].hot) G().flags.sawPoster = true;
    return `<div style="font-family:Georgia,serif;font-size:22px;font-weight:700;text-align:center;border-bottom:1px solid #fff3;padding-bottom:4px">The Ledger</div><div class="muted" style="text-align:center;font-size:10.5px;margin-bottom:6px">${SH.dateStr()} · Harlow & the county</div>${S.map((s) => B.card(`${s.hot ? '<b style="color:#ff6b6b">● </b>' : ''}${B.lnk('ledger.av/a/' + s.id, '<b>' + esc(s.h) + '</b>')}<br><span class="muted">${esc(s.sub)}</span>`, s.hot ? 'border-color:#ff6b6b66' : '')).join('')}`;
  } };
  B.index(/news|missing|poster|ledger|harlow|police|what happened|local/, 'ledger.av', 'The Ledger · Harlow news', 'Local news, updated daily.');

  /* ---------------- Safeline ---------------- */
  B.SITES['safeline.av'] = { n: 'Safeline', icon: '💛', col: '#b58a12', mb: 0.4, tile: true, order: 1, render() {
    return `<div style="font-size:17px;font-weight:700">Runaway Safeline</div><p>Thinking about leaving home? Already left? Not safe where you are? You can talk to a real person, 24/7. It's free and confidential. You're not in trouble.</p>
      ${B.card(`<b>What happens if I reach out?</b><br><span class="muted">They listen first. They help you figure out a safe place tonight. If home isn't safe, they don't just send you back: they connect you with a youth shelter and people whose job is to protect kids.</span>`)}
      ${B.card(`<b>Real-life numbers</b> (outside the game)<br>🇺🇸 1-800-786-2929 · 988 &nbsp; 🇬🇧 116 000 · Childline 0800 1111 &nbsp; 🇮🇳 1098 · 112`, 'border-color:#f2c14e55')}
      <div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:8px">${B.btn("SH.Browser.reachOut('chat')", '💬 Chat with someone now', 'primary')}${B.btn("SH.Browser.reachOut('call')", '📞 Call')}</div>
      <p class="muted" style="font-size:11px;margin-top:10px">In the game, reaching out ends your story. You'll be safe. It won't be simple.</p>`;
  } };
  B.index(/help|safe|scared|abuse|hurt|hit|shelter|hotline|helpline|runaway|ran away|talk to someone|suicid|kill myself|want to die/, 'safeline.av', 'Runaway Safeline · talk to someone 24/7', 'Free, confidential, you\'re not in trouble.');

  B.reachOut = function (how) {
    const g = G(); if (g.ended) return;
    SH.UI.dialog({ title: 'Reach out?', text: ['If you do this, your story ends here. You\'ll be safe.', 'Your phone will probably be handed over. Contact with your friends gets cut for a while. You might go back to the same house with a social worker checking in, or somewhere else entirely.'], choices: [
      { t: how === 'call' ? 'Call them' : 'Start the chat', cls: 'safe', fn: () => B.reachEnd(how) },
      { t: 'Not yet', fn: () => {} }] });
  };
  B.reachEnd = function (how) {
    const g = G(), gma = (g.rel.grandma || 0) >= 55, hurt = SH.f('hitByRick') || SH.f('bruise') || SH.f('toldOkafor') || SH.f('cpsVisit');
    const party = (g.party || []).map((id) => (SH.NPCS_META[id] || {}).n).filter(Boolean);
    const path = gma ? 'grandma' : hurt ? 'foster' : 'home';
    const open = how === 'call' ? `The woman who answers has a voice like a warm blanket. She asks where you are, then asks if you've eaten.` : `You type "hi" and delete it four times. A person named Tasha types back in under a minute: "Hey. I'm really glad you reached out. Are you somewhere safe right now?"`;
    const mid = g.phase === 'run' ? `By morning there's a social worker named Mr. Adeyemi, a vending-machine breakfast, and a form with your name spelled wrong. ${party.length ? party.join(' and ') + (party.length > 1 ? ' get' : ' gets') + ' picked up by their parents first. Nobody gets to say goodbye properly.' : ''}` : `Two days later there's a knock at the door, and it's not a cop. It's a social worker named Mr. Adeyemi, who sits at your kitchen table and asks ${nm('Mom')} questions she doesn't want to answer.`;
    const end = { grandma: [`You go to Grandma ${nm('Rose')}'s in Cedar Falls. "For now," everybody says. The bed smells like cedar and old books. It's quiet in a way that's hard at first.`, 'Your phone is in a drawer in the social worker\'s office. You don\'t get it back for three weeks. When you do, there are 214 messages. You read all of them.'],
      foster: [`You go to a foster home in Saltmore: a couple named the Okekes, two other kids, a chore chart on the fridge. They're kind. It isn't home. Some nights that's the good part and some nights it's the worst part.`, `Your friends' numbers are "on hold" until the caseworker says so. You write letters instead. Nobody writes letters. It's weird. It's kind of nice.`],
      home: [`You go back to the same house. It's not the same house, exactly: there's a safety plan taped inside your closet, a counselor on Thursdays, and a caseworker who drops by without calling first. ${nm('Rick')} is quieter. Whether that lasts is the question.`, `You lose your phone for a month. You lose the group chat. You lose the feeling of being the kid who got away. What you get is harder to name.`] }[path];
    SH.Endings.show('reachedOut', 'You reached out', path === 'grandma' ? 'Cedar Falls, for now' : path === 'foster' ? 'Somewhere new' : 'The same house, not the same', [open, mid].concat(end, ['It isn\'t a happy ending. It\'s a safe one. Some days you\'re not sure those are the same thing. Later, a lot later, you are.']));
  };

})(window.SH);
