/* SMALL HOURS — Part 4b: who you say you are.
   Cover stories: per place, pick a fake first name and a reason you're in town (G.cover[placeId]). Locals remember what you
   told them. Say a different name later and they notice. A consistent cover makes you a little less noticeable there.
   Disguises: haircut, hair dye, glasses, a new outfit. Each change makes missing-kid posters less useful (about 12% each).
   Tracked in G.look; flags.disguise = number of changes. */
(function (SH) {
  const K = SH.K, A = SH.Atlas, C = SH.Catalog; if (!K || !A) return;
  const G = K.G;
  const STORIES = [['grandma', 'Visiting my grandma for a couple weeks'], ['moved', 'My family just moved here'], ['camp', 'Staying at the campground with my dad'], ['home', 'I\'m homeschooled, so I\'m out during school hours'], ['cousin', 'Staying with my cousins while my mom\'s in the hospital']];
  const cov = () => (G().cover = G().cover || {});
  const look = () => (G().look = G().look || { hair: 0, dye: 0, glasses: 0, clothes: 0 });
  const nChanges = () => Object.values(look()).filter(Boolean).length;
  function cover(p) {
    const c = cov()[p.id];
    K.D(`Your story in ${p.name}`, c ? [`Here, you're "${c.name}". ${STORIES.find((s) => s[0] === c.story)[1]}.`, 'Stick to it. People remember.'] : ['People in small places ask. It\'s better to have an answer ready than to make one up with someone staring at you.'],
      (c ? [] : STORIES.map(([k, t]) => ({ t: `"${t}."`, fn: () => K.ask('Your name here', ['And what\'s your name? (Pick one you\'ll remember.)'], 'Jordan', (nm) => { cov()[p.id] = { name: nm.split(/\s+/)[0].replace(/[^A-Za-z'-]/g, '').slice(0, 14) || 'Jordan', story: k, told: [] }; SH.UI.toast(`In ${p.name}, you're ${cov()[p.id].name}.`); setTimeout(K.back, 30); }) }))).concat([{ t: 'Back', fn: K.back }]));
  }
  /* locals remember the name and story you gave */
  const bLocal = SH.Brain.local;
  if (bLocal) SH.Brain.local = function (an, c) {
    const p = c.opts && c.opts.place, cv = p && cov()[p.id], raw = an.raw || '';
    const m = raw.match(/\b(?:my name is|my name's|i'?m called|call me|name'?s)\s+([A-Za-z'-]{2,14})/i);
    if (m && p) {
      const said = m[1][0].toUpperCase() + m[1].slice(1).toLowerCase(), who = c.opts.local && c.opts.local.n;
      if (cv && said.toLowerCase() !== cv.name.toLowerCase()) { G().awayNotice = (G().awayNotice || 0) + 18; return K.say(K.pick([`Huh. Thought you told ${cv.told.length ? 'folks' : 'someone'} your name was ${cv.name}.`, `${said}? Bev at the store said you were ${cv.name}.`])); }
      if (!cv) cov()[p.id] = { name: said, story: null, told: [who] }; else if (who && !cv.told.includes(who)) cv.told.push(who);
      return K.say(`Nice to meet you, ${said}.`);
    }
    if (cv && /\b(whose kid|who are you|what are you doing here|where are you from|why aren'?t you in school|your folks)\b/.test(an.t) && cv.story) {
      const r = bLocal.apply(this, arguments); return K.say({ grandma: 'Oh, whose grandma? ...Never mind, I\'ll figure it out.', moved: 'New family, huh? Welcome. It\'s a small town, you\'ll know everybody by Christmas.', camp: 'Up at the campground? Tell your dad the showers are broken again.', home: 'Homeschool. My sister does that. Okay.', cousin: 'Oh, sweetheart. I hope your mom\'s okay.' }[cv.story], { fx: r.fx });
    }
    return bLocal.apply(this, arguments);
  };
  A.mods = A.mods || []; A.mods.push((p) => (cov()[p.id] && cov()[p.id].story ? 0.85 : 1));
  A.mods.push(() => (G().reported ? Math.max(0.5, 1 - 0.12 * nChanges()) : 1));
  /* ---------- disguises ---------- */
  const has = (id) => SH.has('x_' + id) || (G().owned || []).includes('x_' + id);
  function mirror(p) {
    const L = look(), town = p && p.tier !== 'village';
    const ch = [];
    if (!L.hair) { if (town) ch.push({ t: '✂️ Barber: short haircut ($12)', fn: () => { if (!K.pay(12, 'Barber')) return mirror(p); SH.advance(30); done('hair', 'The barber doesn\'t talk much. Ten minutes later a stranger looks back at you from the mirror. A stranger with a very cold neck.'); } });
      ch.push({ t: '✂️ Cut it yourself (free)', sub: 'Gas station bathroom, safety scissors', fn: () => { SH.advance(20); SH.st('mood', -4); done('hair', 'It\'s... uneven. Very uneven. But it doesn\'t look like the picture anymore, and that\'s the point.'); } }); }
    if (!L.dye) ch.push({ t: has('dye') ? '🎨 Dye your hair (you have dye)' : '🎨 Dye your hair', sub: has('dye') ? '' : 'Buy hair dye at a pharmacy or supermarket first', fn: () => { if (!has('dye')) return K.D('No dye', 'You need hair dye first. Pharmacies and supermarkets have it.', [{ t: 'Okay', fn: () => mirror(p) }]); SH.advance(60); rm('dye'); done('dye', 'Forty-five minutes in a gas station bathroom. The sink will never be the same. Your hair is a color that doesn\'t exist in nature, and your own mom would look twice.'); } });
    if (!L.glasses) ch.push({ t: '👓 Wear glasses', sub: has('glasses') ? 'You have a pair' : 'Buy some first (pharmacy, stall)', fn: () => { if (!has('glasses')) return K.D('No glasses', 'You need a pair first.', [{ t: 'Okay', fn: () => mirror(p) }]); done('glasses', 'Fake glasses. You push them up your nose like a detective. It changes your face more than you\'d think.'); } });
    if (!L.clothes) ch.push({ t: '👕 Change into different clothes', sub: 'Anything that isn\'t what you wore when you left', fn: () => { const c = (G().bag || []).concat(G().owned || []).find((id) => C.ALL[id] && C.ALL[id].cat === 'clothes'); if (!c) return K.D('Nothing to change into', 'Every piece of clothing you have is what you left in. Buy something at a store or the alley stall.', [{ t: 'Okay', fn: () => mirror(p) }]); done('clothes', `You change into the ${C.ALL[c].n}. The hoodie you left in goes to the bottom of the bag. The posters describe that hoodie.`); } });
    ch.push({ t: 'Back', fn: K.back });
    K.D('The mirror', [`Changes so far: ${nChanges()}/4.`, nChanges() >= 3 ? 'You barely recognize yourself. That\'s the idea. It\'s also a little sad.' : 'Missing posters describe what you looked like when you left.'], ch);
  }
  const rm = (id) => { const g = G(), i = g.bag.indexOf('x_' + id); if (i >= 0) g.bag.splice(i, 1); else { const j = (g.owned || []).indexOf('x_' + id); if (j >= 0) g.owned.splice(j, 1); } };
  function done(k, text) { look()[k] = SH.day() || 1; G().flags.disguise = nChanges(); K.D('New look', text, [{ t: 'Okay', fn: () => mirror(A.here()) }]); }
  K.me((p, ch, dark) => { ch.push({ t: '🎭 Your story here', sub: cov()[p.id] ? `You're "${cov()[p.id].name}" here` : 'Pick a name and a reason to be in town', fn: () => cover(p) }); ch.push({ t: '🪞 Change your look', sub: nChanges() ? `${nChanges()}/4 changes` : 'Haircut, dye, glasses, clothes', fn: () => mirror(p) }); });
  SH.Identity = { cover, mirror, look, nChanges, STORIES, name: (p) => (cov()[p.id] || {}).name };
})(window.SH);
