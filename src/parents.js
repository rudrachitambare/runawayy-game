/* SMALL HOURS — Part 4a: your friends' parents.
   Every friend who runs with you has a parent at home getting more worried each day (G.pw[id]); how fast depends on the
   family (warm / strict / away). They text their kid, they text YOU (the host_<id> thread, and you can text back: it's
   a real conversation), they call your mom, and eventually they post on Chirp (which makes your group easier to spot).
   The note your friend leaves on their bed matters: write it together (free text, the tone is read). A scheduled
   "I'm safe" text each night slows the worry, but every ping is a small risk of giving away where you are. */
(function (SH) {
  const K = SH.K, FR = SH.Friends; if (!K || !FR) return;
  const G = K.G, KIDS = FR.KIDS;
  const RATE = { warm: 10, strict: 14, away: 4 }, BASE = { warm: 25, strict: 35, away: 10 };
  const rel = (id) => (/^Mr\.? /.test(KIDS[id].parent) ? 'dad' : 'mom');
  const W = (id) => { const g = G(); g.pw = g.pw || {}; return (g.pw[id] = g.pw[id] || { w: BASE[KIDS[id].fam] + 12, note: null, sched: false, day: -1, chirp: false, mom: false }); };
  const bump = (id, d) => { const x = W(id); x.w = Math.max(0, Math.min(100, x.w + d)); return x.w; };
  const inParty = (id) => (G().party || []).includes(id);
  function tone(t) {
    t = t.toLowerCase(); let s = 0;
    [/\b(safe|okay|ok|fine|alright)\b/, /\blove (you|u)\b/, /\bsorry\b/, /\bdon'?t worry\b/, /\bnot your fault\b/, /\b(i'?ll|will) (call|text|come back|be back)\b/, /\bpromise\b/, /\b(with|together)\b/, /\b(eat|eating|warm|careful)\b/].forEach((r) => { if (r.test(t)) s++; });
    [/\bhate\b/, /\bnever coming (back|home)\b/, /\byour fault\b/, /\bdon'?t (look|find|come)\b/, /\bleave me alone\b/, /\bstupid\b/, /\bgoodbye forever\b/].forEach((r) => { if (r.test(t)) s -= 2; });
    return Math.max(-3, Math.min(4, s + (t.length > 80 ? 1 : 0)));
  }
  /* ---------- the note on the bed ---------- */
  function note(id) {
    const k = KIDS[id];
    K.ask(`${k.n}'s note`, [`${k.n} is sitting on ${k.g === 'he' ? 'his' : k.g === 'she' ? 'her' : 'their'} bed with a pen and a torn-out notebook page. "what do i even write. ${rel(id) === 'mom' ? 'my mom' : 'my dad'}'s gonna read this like a hundred times."`, 'Write it together. (What it says matters.)'], `Mom, I'm okay. I'm with Sam...`, (text) => {
      const s = tone(text), x = W(id); x.note = { text, s }; x.w = Math.max(5, BASE[k.fam] - s * 5);
      SH.UI.log(`${k.n} folds the note and leaves it on the pillow. ${s >= 3 ? 'It\'s a good note. It\'ll help.' : s >= 1 ? 'It says the important part.' : s < 0 ? 'Reading it back, it sounds angrier than either of you meant.' : 'It\'s short. Maybe too short.'}`, s < 0 ? 'bad' : '');
    }, true);
  }
  K.acts((acts) => { const g = G(); if (g.phase !== 'run' || g.away) return; (g.party || []).filter((id) => KIDS[id] && !W(id).note && FR.st(id).joinedAt && g.t - FR.st(id).joinedAt < 240).forEach((id) => acts.unshift({ label: `Help ${KIDS[id].n} write the note for ${({ she: 'her', he: 'his', they: 'their' })[KIDS[id].g] || 'their'} ${rel(id)}`, sub: 'The one on the pillow', cls: 'safe', fn: () => note(id) })); });
  /* ---------- daily/hourly worry ---------- */
  K.daily.push(() => { (G().party || []).filter((id) => KIDS[id]).forEach((id) => { const x = W(id); bump(id, RATE[KIDS[id].fam] * (x.sched ? 0.5 : 1) * (x.note ? 1 : 1.3)); }); });
  const LINES = {
    low: ['{k}, it\'s {p}. Call me when you get this.', 'Honey, where are you? Please call.', 'Did you stay at a friend\'s? You\'re not in trouble. Call me.'],
    mid: ['{s}, is {k} with you? Please. I just need to know she\'s safe.', 'I called the school, the hospital, everyone. {s}, if you know anything, please.', 'I\'m not angry. I promise I\'m not angry. Just tell me {k} is okay.'],
    high: ['{s}. Please. I haven\'t slept. I just need a picture. Anything.', 'The police have been here twice. I told them everything. Please bring {k} home.', 'I left the porch light on. I\'ll leave it on every night until you both come home.'],
  };
  K.hourly.push((h) => {
    const g = G(), hr = h % 24; if (g.phase !== 'run') return;
    (g.party || []).filter((id) => KIDS[id]).forEach((id) => {
      const x = W(id), k = KIDS[id], hid = 'host_' + id, fill = (s) => s.replace(/\{k\}/g, k.n).replace(/\{p\}/g, rel(id) === 'mom' ? 'Mom' : 'Dad').replace(/\{s\}|\{name\}/g, (G().name || 'Sam')).replace(/she's/g, k.g === 'he' ? 'he\'s' : k.g === 'they' ? 'they\'re' : 'she\'s');
      if ((hr === 9 || hr === 19) && x.w > 20 && K.chance(k.fam === 'away' ? 0.4 : 0.85)) SH.Phone.push(hid, hid, fill(K.pick(LINES[x.w > 70 ? 'high' : x.w > 40 ? 'mid' : 'low'])));
      if (x.w > 40 && !x.mom) { x.mom = true; SH.Phone.push('mom', 'mom', `${k.parent} just called me. Is ${k.n} with you? Sweetheart, two families are losing their minds. Please.`); }
      if (x.w > 65 && !x.chirp) { x.chirp = true; SH.UI.log(`${k.parent} posted on Chirp: "MISSING: ${k.full}, 12. Last seen with a friend. Please share." It has 2,400 shares by lunch.`, 'bad'); g.heat = Math.min(100, (g.heat || 0) + 8); }
      if (hr === 20 && x.sched) { bump(id, -6); SH.Phone.push(hid, id, 'i\'m safe. i\'m eating. i love you. don\'t look for me.', false); if (g.away && SH.Net && SH.Net.signal && SH.Net.signal().bars > 0 && K.chance(0.15)) { g.awayNotice = (g.awayNotice || 0) + 12; SH.UI.log(`${k.n}'s nightly text pinged a tower near here. Somebody, somewhere, now has a circle on a map.`, 'bad'); } }
    });
  });
  SH.Atlas && (SH.Atlas.mods = SH.Atlas.mods || []).push(() => 1 + 0.15 * Object.values(G().pw || {}).filter((x) => x.chirp).length);
  /* ---------- texting a parent back (real conversation) ---------- */
  const P = SH.Phone, bAv = P.available; P.available = function (id) { if (/^host_/.test(id) && inParty(id.slice(5))) { const h = SH.hour(); return h > 6 || W(id.slice(5)).w > 60; } return bAv.apply(this, arguments); };
  Object.keys(KIDS).forEach((id) => {
    const hid = 'host_' + id, base = SH.Brain[hid]; if (!base) return;
    SH.Brain[hid] = function (an, c) {
      if (c.ctx !== 'text' || !inParty(id)) return base.apply(this, arguments);
      const g = G(), k = KIDS[id], t = an.t, x = W(id), R = (say, fx) => ({ say, fx: fx || {} }), D = SH.day();
      const places = SH.Atlas ? SH.Atlas.data().places.filter((p) => t.includes(p.name.toLowerCase())) : [];
      if (places.length) { const p = places[0], here = SH.Atlas.here(); g.flags.toldParentPlace = p.name; g.heat = Math.min(100, (g.heat || 0) + 6); if (g.away && here.id === p.id) { g.awayNotice = (g.awayNotice || 0) + 45; return R(`${p.name}. Okay. Okay. I'm calling the police there right now. Stay where you are.`); } bump(id, -5); return R(`${p.name}? I'm getting in the car. I'm calling the sheriff there. Thank you. THANK YOU.`); }
      if (/\b(coming (home|back)|bring (her|him|them) (home|back)|on our way)\b/.test(t)) { bump(id, -15); return R(k.fam === 'strict' ? 'Good. Then come home. We will talk about consequences later, and I will hug you first.' : 'Oh thank God. I\'ll be right here. I\'ll make pancakes. I\'ll make anything.'); }
      if (/\b(don'?t|do not|please don'?t) (call|tell) (the )?(police|cops|anyone)\b/.test(t)) return R(k.fam === 'strict' ? 'I already did. Of course I did. What did you think I would do?' : k.fam === 'away' ? 'I haven\'t yet. I should. Have her call me tonight and I\'ll wait one more day.' : 'Then have her call me. Tonight. Please. I\'ll wait if I hear her voice.');
      if (an.has('hostile')) { bump(id, 10); return R('I don\'t know what I did to deserve that. I just want my kid.'); }
      if (/\b(safe|ok|okay|fine|alright|eating|warm|with me|together|she'?s good|he'?s good)\b/.test(t)) { if (x.day !== D) { x.day = D; bump(id, -8); } return R(K.pick([`Thank you. Thank you for telling me. Is ${k.g === 'he' ? 'he' : k.g === 'she' ? 'she' : 'they'} eating? Tell ${k.g === 'he' ? 'him' : k.g === 'she' ? 'her' : 'them'} I love ${k.g === 'he' ? 'him' : k.g === 'she' ? 'her' : 'them'}.`, 'Okay. Okay. Can I talk to her? Just for a second? Just her voice.', 'I believe you. I don\'t know why, but I believe you. Please keep her warm.']).replace(/her\b/g, k.g === 'he' ? 'him' : k.g === 'they' ? 'them' : 'her')); }
      if (an.q) return R(k.fam === 'strict' ? 'I\'m not answering questions. You answer mine. Where are you?' : 'Anything. I\'ll answer anything. Just tell me where you are.');
      return R(K.pick(['Please. Where are you?', `Is ${k.n} okay? That's all I need.`, 'I\'m still here. I\'m not going anywhere. Text me anything.']));
    };
  });
  /* ---------- hub + home: the nightly "I'm safe" text ---------- */
  const schedChoice = (p, ch) => (G().party || []).filter((id) => KIDS[id] && !W(id).sched).slice(0, 1).forEach((id) => ch.push({ t: `📱 Set up ${KIDS[id].n}'s nightly "I'm safe" text`, sub: 'Slows the worry. Every ping is a small risk.', fn: () => { W(id).sched = true; SH.UI.toast(`${KIDS[id].n} schedules it for 8 PM every night.`); K.back(); } }));
  K.me(schedChoice);
  SH.Parents = { W, bump, tone, note };
})(window.SH);
