/* SMALL HOURS — Part 5a: other runaway kids.
   Some towns have a kid who's out here too: sitting too long at the bus station, sleeping in the library, hanging near the diner.
   Each has a name, an age (11–15), a reason, a personality. You talk to them in free text (they're wary; earn it).
   Two good outcomes: invite them into your group (G.rkids), or help them reach a safe adult (a shelter, a teacher, a pastor, a
   relative). Helping someone else might mean that adult starts asking about you, too. */
(function (SH) {
  const K = SH.K, A = SH.Atlas; if (!K || !A) return;
  const G = K.G;
  const NAMES = [['Dev', 'he'], ['Kayla', 'she'], ['Jonah', 'he'], ['Ari', 'they'], ['Mia', 'she'], ['Tre', 'he'], ['Luz', 'she'], ['Sky', 'they'], ['Owen', 'he'], ['Rosie', 'she'], ['Malik', 'he'], ['Wren', 'she']];
  const WHY = [['foster', 'a foster home where nobody talked to them', 'my placement. they had like six kids. nobody noticed i left.'], ['step', 'a stepdad who yells', 'my stepdad. it\'s not like hitting. it\'s just... all the time.'], ['bully', 'a school that got unbearable', 'school. everybody. there was a video. i\'m not going back.'], ['kicked', 'a mom who told them to get out', 'my mom told me to get out. so i got out.'], ['grief', 'a house that went quiet after their dad died', 'my dad died in march and my mom stopped getting out of bed.']];
  const SPOT = { city: ['sitting in the back of the bus station, same seat as yesterday', 'asleep in a library armchair with shoes still on'], town: ['on the curb behind the diner, splitting fries with a pigeon', 'at the laundromat, not doing laundry'], small: ['on the swings at the empty playground after dark', 'at the gas station, counting coins'] };
  const hash = (s) => [...s].reduce((h, c) => (h * 33 + c.charCodeAt(0)) >>> 0, 5);
  const col = ['#6aa84f', '#c27ba0', '#e69138', '#45818e', '#8e7cc3', '#cc4125'];
  function kidAt(p) {
    if (!SPOT[p.tier]) return null; const h = hash(p.id + 'rk'); if (h % 100 > (p.tier === 'city' ? 70 : p.tier === 'town' ? 40 : 22)) return null;
    const i = h % NAMES.length, id = 'rk_' + p.id, g = G(); g.rk = g.rk || {};
    const st = (g.rk[id] = g.rk[id] || { trust: 0, done: null, told: 0 });
    if (!SH.NPCS_META[id]) { K.npc(id, NAMES[i][0], NAMES[i][0] + ', ' + (11 + (h % 5)) + ', also out here', col[h % col.length]); }
    return { id, n: NAMES[i][0], g: NAMES[i][1], age: 11 + (h % 5), why: WHY[(h >> 3) % WHY.length], spot: SPOT[p.tier][(h >> 5) % SPOT[p.tier].length], st, p };
  }
  const pron = (k, w) => ({ he: { s: 'he', o: 'him', p: 'his' }, she: { s: 'she', o: 'her', p: 'her' }, they: { s: 'they', o: 'them', p: 'their' } }[k.g][w]);
  SH.Brain.rk = function (an, c) {
    const k = c.opts.kid, st = k.st, t = an.t, S = (say, x) => K.say(say, x); c.mem.n = (c.mem.n || 0) + 1;
    if (an.has('hostile')) { st.trust -= 20; c.result = 'leave'; return S('whatever. forget it.', { end: true }); }
    if (/\b(police|cops|call someone|tell someone|report)\b/.test(t) && st.trust < 40) { st.trust -= 10; return S('don\'t. please. i\'ll just leave. i\'m good at leaving.'); }
    if (/\b(why|what happened|how come|where are you from|what'?s your story)\b/.test(t)) { st.trust += 8; if (st.told) return S('i told you already.'); st.told = 1; return S(st.trust >= 15 ? k.why[2] : 'why do you care.'); }
    if (/\b(me too|same|i ran|i left|i'?m (also|running)|my (stepdad|mom|dad|rick))\b/.test(t)) { st.trust += 18; return S(K.pick(['...yeah? huh. how long?', 'oh. okay. so you get it.', 'for real? you don\'t look like you ran away. that\'s smart.'])); }
    if (/\b(hungry|food|eat|snack|fries|want some)\b/.test(t)) { st.trust += 12; return S('...i mean. yeah. if you have extra.'); }
    if (/\b(name|who are you)\b/.test(t)) { st.trust += 4; return S(`${k.n}. don't wear it out.`); }
    if (/\b(come with|join|with us|our group|stick together|come along|you can come)\b/.test(t)) { if (st.trust >= 35 || (st.trust >= 20 && K.grp() >= 2)) { c.result = 'join'; return S(K.pick(['...okay. yeah. okay. i\'m in. i carry my own stuff.', 'you mean it? ...okay. don\'t make it weird.'])); } st.trust += 3; return S('i don\'t even know you.'); }
    if (/\b(shelter|safe (place|adult|person)|teacher|counselor|pastor|church|someone who can help|grown ?up|adult you trust|aunt|grandma|relative)\b/.test(t)) { if (st.trust >= 30) { c.result = 'safe'; return S(K.pick([`there's... my aunt ${K.pick(['Denise', 'Carla', 'Joy'])} two towns over. she always said i could. i was scared to ask.`, 'the youth place in the city had a lady who was nice to me. would you walk me there?', 'my old art teacher. she gave me her number once. i still have it.'])); } st.trust += 4; return S('adults make everything worse.'); }
    if (an.has('sad') || an.has('scared') || /\b(are you (ok|okay|alright|good)|you (ok|okay|alright))\b/.test(t)) { st.trust += 10; return S(K.pick(['no. but thanks for asking. nobody asks.', 'i\'m fine. (they\'re not fine.)', 'i\'m cold, mostly.'])); }
    st.trust += 2; return S(K.pick(['...', 'what do you want.', 'you gonna keep standing there?', 'you\'re not a cop, right? you\'re like, twelve.']));
  };
  function meet(p) {
    const k = kidAt(p); if (!k) return K.back(); SH.Brain[k.id] = (an, c) => SH.Brain.rk(an, c);
    SH.Talk.open(k.id, { intro: `A kid about ${k.age}, ${k.spot}. Backpack with the straps pulled tight. Same look you've seen in the bathroom mirror.`, first: k.st.trust > 10 ? 'oh. it\'s you again.' : K.pick(['what.', 'you lost or something?', 'i\'m waiting for someone.']), turnsMax: 9, kid: k, onEnd: (c) => after(k, c) });
  }
  function after(k, c) {
    const g = G();
    if (c.result === 'join') { g.rkids = (g.rkids || []).concat(k.id); k.st.done = 'joined'; g.att = g.att || {}; g.att[k.id] = 15; return K.D('One more', [`${k.n} picks up ${pron(k, 'p')} backpack. "so where are we going." Your group just got bigger.`, K.grp() >= 4 ? 'A big group is harder to hide. It\'s also harder to be scared in.' : ''].filter(Boolean), K.ok()); }
    if (c.result === 'safe') return K.D('Walk them there?', `${k.n} looks at you like it's a dare. "you'd come with me?"`, [
      { t: `Walk ${k.n} to a safe adult`, cls: 'safe', sub: 'Takes a couple of hours. They might ask about you, too.', fn: () => {
        SH.advance(120, { interrupt: false }); if (g.ended) return; k.st.done = 'safe'; g.helped = (g.helped || 0) + 1; SH.st('mood', 15); SH.st('stress', -10);
        const ask = K.chance(0.35);
        K.D('Safe', [`The door opens. The adult takes one look at ${k.n} and pulls ${pron(k, 'o')} into a hug without saying anything at all. ${k.n} doesn't let go for a long time.`, ask ? `Then the adult looks at you over ${k.n}'s shoulder. "And you, sweetheart? Who's waiting for you?"` : `${k.n} turns around at the door. "hey. thanks. i mean it." Then the door closes, and you're alone on the step, and you feel... good. Really good. For the first time in a while.`],
          ask ? [{ t: 'Tell the truth. Stay.', cls: 'safe', fn: () => SH.EndX.trigger('rkSafe', { kid: k.n }) }, { t: '"Oh, I\'m fine. My mom\'s around the corner."', fn: () => { g.awayNotice = (g.awayNotice || 0) + 20; K.back(); } }] : K.ok()); } },
      { t: 'Not today', fn: K.back }]);
    K.back();
  }
  K.hub((p, ch) => { const k = kidAt(p); if (k && !k.st.done && !(G().rkids || []).includes(k.id)) ch.push({ t: `🧒 A kid ${k.spot.split(',')[0]}`, sub: k.st.trust ? `${k.n}. You've talked before.` : 'Looks like they\'re out here too', fn: () => meet(p) }); });
  /* talk to runaway kids in your group anywhere */
  K.me((p, ch) => (G().rkids || []).forEach((id) => ch.push({ t: `Talk to ${K.nm(id)}`, sub: 'Part of your group now', fn: () => { SH.Brain[id] = (an, c) => SH.Brain.rkGroup(an, c, id); SH.Talk.open(id, { first: K.pick(['hey.', 'what\'s up.', 'you good?']), turnsMax: 6, onEnd: K.back }); } })));
  SH.Brain.rkGroup = (an, c, id) => { const t = an.t; if (/\b(glad|happy|thanks|thank you)\b.*\b(here|with us|came)\b|\b(family|crew|team)\b/.test(t)) { G().att[id] = Math.min(100, (G().att[id] || 0) + 8); return K.say('...yeah. me too. don\'t make it a whole thing.'); } if (/\b(miss|home|back)\b/.test(t)) return K.say('sometimes. not the house. the before, i guess.'); return K.say(K.pick(['i\'m good. i\'m hungry, but i\'m good.', 'this is better than where i was.', 'you ever think about what happens after?'])); };
  /* endings see runaway kids as part of your group */
  const X = SH.EndX; if (X) { const bc = X.ctx; X.ctx = function () { const c = bc.apply(this, arguments), rk = (G().rkids || []).filter((id) => SH.NPCS_META[id]); if (rk.length) { c.party = c.party.concat(rk); c.pn = c.party.map((id) => SH.NPCS_META[id].n); c.n = c.party.length; c.pl = c.n === 1 ? c.pn[0] : c.pn.slice(0, -1).join(', ') + ' and ' + c.pn[c.n - 1]; c.they = c.n === 1 ? c.pl : 'your friends'; c.withYou = ` with ${c.pl}`; c.rk = rk.length; } return c; };
    X.add([{ k: 'rkSafe', on: ['rkSafe'], p: 1, t: 'Two Kids on a Doorstep', sub: 'you walked someone else home', x: (c) => [`You came to get ${c.extra.kid || 'them'} somewhere safe. You didn't plan on the part where the adult at the door would look at you the same way.`, 'She makes two cups of cocoa. She calls two families. She sits between you on the couch while you wait, one arm around each of you, and doesn\'t say "everything will be fine," because she doesn\'t know that. She says "you did a brave thing tonight, both of you." She knows that.', `${c.extra.kid || 'They'} still sends you a text every birthday. Just a frog emoji. You always send one back.`] }]); }
  SH.Runaways = { kidAt, meet };
})(window.SH);
