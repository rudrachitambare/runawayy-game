/* SMALL HOURS — Part 2a: learning to drive, the legal-ish way.
   Villages: a farmer teaches on private farmland (legal on private land) in exchange for two hours of chores.
   +15 driving per lesson, up to 100. You pick who learns: you, or a friend in your group (their skill counts when
   they drive the van). Ask to stay long enough and the farm might become the rest of your life (never-found ending).
   Towns & cities: a go-kart track. $15 a session, +6, but karts only teach you so much (max 60). */
(function (SH) {
  const K = SH.K, A = SH.Atlas; if (!K || !A) return;
  const G = K.G;
  const L = () => (G().lessons = G().lessons || { n: 0, fsk: {}, kart: 0, farm: null, stayAsk: 0 });
  const FARMERS = [['Walt Hollis', 'he'], ['June Petersen', 'she'], ['Ray Okonkwo', 'he'], ['Marge Lindqvist', 'she'], ['Luis Ferreira', 'he']];
  const farmer = (p) => FARMERS[(p.name.length + p.pop) % FARMERS.length];
  const skillOf = (who) => (who === 'me' ? SH.skill('drive') : (L().fsk[who] || 0));
  const addSkill = (who, n, cap) => { if (who === 'me') { const s = (G().skills = G().skills || {}); s.drive = Math.min(cap, Math.max(s.drive || 0, (s.drive || 0) + n)); } else L().fsk[who] = Math.min(cap, (L().fsk[who] || 0) + n); };
  const learners = () => [['me', 'You']].concat(K.party().map((id) => [id, K.nm(id)]));
  /* the best driver in the group is whoever's at the wheel */
  SH.bestDriver = () => { let b = ['me', SH.skill('drive')]; K.party().forEach((id) => { const s = L().fsk[id] || 0; if (s > b[1]) b = [id, s]; }); return b; };
  const bSkill = SH.skill; SH.skill = (k) => (k === 'drive' && SH.G && SH.G.lessons ? Math.max(bSkill('drive'), ...K.party().map((id) => L().fsk[id] || 0)) : bSkill(k));

  function farm(p) {
    const [fn, fg] = farmer(p), l = L(), met = l.farm === p.id, h = SH.hour();
    if (h < 7 || h >= 18) return K.D(fn.split(' ')[0] + '\'s farm', 'The farmhouse lights are off except the kitchen. Farmers go to bed at eight and get up at four. Come back in daylight.');
    const intro = met ? `${fn} is fixing a fence post. "${fg === 'he' ? 'Well' : 'Look'}, it's my favorite farmhand${K.grp() > 1 ? 's' : ''}."` :
      `A farmhouse at the end of a gravel road, a red truck older than your mom, and ${fn}, ${fg === 'he' ? 'a big man in overalls' : 'a woman in a barn coat'} who looks at you${K.grp() > 1 ? ' all' : ''} for a long second. "Private land, this. You're welcome on it if you work. I've got a truck that needs driving in the back field and a barn that needs mucking. You muck, I teach. Fair?"`;
    const ch = learners().map(([id, n]) => ({ t: `${id === 'me' ? 'You take' : n + ' takes'} a lesson (2h chores + 1h driving)`, sub: `Driving: ${skillOf(id)}/100`, fn: () => lesson(p, id) }));
    if (l.n >= 3) ch.push({ t: 'Ask if you can stay', sub: l.stayAsk ? 'You asked before' : 'On the farm. For a while. Maybe longer.', fn: () => stay(p) });
    ch.push({ t: 'Leave', fn: K.back });
    l.farm = p.id; K.D(fn.split(' ')[0] + '\'s farm', intro, ch, 'local');
  }
  function lesson(p, who) {
    const g = G(), [fn] = farmer(p), l = L(); SH.advance(180, { interrupt: false }); if (g.ended) return;
    SH.st('energy', -20); SH.st('hyg', -15); SH.st('full', 10); SH.st('mood', 6); l.n++;
    const before = skillOf(who); addSkill(who, 15, 100); const n = who === 'me' ? 'You' : K.nm(who);
    const tip = before < 20 ? 'Clutch, brake, gas. The truck stalls eleven times. On the twelfth it lurches forward and a goose files a complaint.' : before < 50 ? 'Figure eights around the hay bales. Reversing with the mirror only. "Look where you want to go, not at what you\'re scared of hitting."' : before < 80 ? 'The back road to the grain elevator and back, both hands on the wheel. You check the mirror without being told.' : `${fn} just sits in the passenger seat with their eyes closed. That's the compliment.`;
    g.awayNotice = Math.max(0, (g.awayNotice || 0) - 6); // farm work = you look like you belong here
    K.D('The back field', [`Two hours of chores first: mucking, hauling feed, a chicken that has opinions. Then the truck.`, `${n === 'You' ? '' : n + ' drives. '}${tip}`, `${n}: driving ${before} → ${skillOf(who)}. ${fn.split(' ')[0]} sends you off with a jar of peaches.`], [{ t: 'Another lesson', fn: () => farm(p) }, { t: 'Done for today', fn: K.back }]);
  }
  function stay(p) {
    const l = L(), [fn, fg] = farmer(p); l.stayAsk++;
    const good = l.n >= 6 && K.days() >= 10 && (G().heat || 0) < 60 && G().s.health > 40;
    if (!good) return K.D(fn.split(' ')[0], `${fn.split(' ')[0]} wipes ${fg === 'he' ? 'his' : 'her'} hands on a rag for a long time. "Not yet, kid. I don't know you well enough, and you don't know me. Keep showing up." It's not a no.`, K.ok());
    K.D(fn.split(' ')[0], [`"I figured you'd ask." ${fn.split(' ')[0]} looks out at the field, not at you. "Spare room's got a bed and a window that sticks. There'd be rules. School, eventually. The county, eventually, because I won't hide a child. But I'd go with you, and I'd tell them the truth about how hard you work."`, 'This is the kind of choice you only get once.'], [
      { t: 'Stay', cls: 'safe', fn: () => SH.EndX.trigger('farm', { place: p, farmer: fn }) }, { t: 'Not yet', fn: K.back }]);
  }
  function kart(p) {
    const l = L(), h = SH.hour(); if (h < 10 || h >= 21) return K.D('Speedway Karts', 'Closed. The sign says 10 AM – 9 PM, and a teenager inside is mopping.');
    K.D('Speedway Karts', [`A go-kart track behind the bowling alley. $15 for a session. Nobody here cares who you are as long as you sign the waiver (you sign it "Taylor Swift").`, `Karts teach you steering, braking and not panicking. They don't teach you highways.`],
      learners().map(([id, n]) => ({ t: `${id === 'me' ? 'You race' : n + ' races'}: $15`, sub: `Driving ${skillOf(id)} (karts go up to 60)`, fn: () => { if (!K.pay(15, 'Go-karts')) return; SH.advance(60, { interrupt: false }); const b = skillOf(id); addSkill(id, b < 60 ? 6 : 0, Math.max(60, b)); l.kart++; SH.st('mood', 10); SH.st('stress', -8);
        K.D('Speedway Karts', `${id === 'me' ? 'You' : n} ${K.pick(['take the hairpin too fast and spin out in a cloud of tire smoke', 'lap a dad in a polo shirt', 'hit the tire wall exactly once and learn exactly why brakes exist', 'finish with the fastest lap of the hour and the teenager at the counter actually looks up'])}. Driving ${b} → ${skillOf(id)}.${b >= 60 ? ' (Karts have taught you everything they can.)' : ''}`, [{ t: 'Again', fn: () => kart(p) }, { t: 'Done', fn: K.back }]); } })).concat([{ t: 'Leave', fn: K.back }]));
  }
  K.hub((p, ch, dark) => {
    if (dark) return;
    if (p.tier === 'village' || (p.tier === 'small' && p.biome === 'farmland')) ch.push({ t: '🚜 ' + farmer(p)[0].split(' ')[0] + '\'s farm', sub: 'Chores for driving lessons, on private land', fn: () => farm(p) });
    if (p.tier === 'town' || p.tier === 'city') ch.push({ t: '🏎️ Go-kart track', sub: '$15 a session', fn: () => kart(p) });
  });
  SH.Lessons = { farm, kart, skillOf, L };
})(window.SH);
