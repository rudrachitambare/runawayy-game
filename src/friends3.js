/* SMALL HOURS — Jordan offers, then insists; friends can come meet you in other towns (turn 37).
   - Jordan: tell him you're running (or ask to stay) and he offers his garage. Say no ("your mom would call my mom",
     "i can't", "nah") and he says he's coming with you instead. Say yes and he's in: right away if you're still in
     Harlow, or he takes the county bus to wherever you are. He has his own stuff at home too (friends2.js TR.jordan).
   - From any other town, "You & your group" has "Text <friend>: come meet me in <town>" for friends who said they'd
     come (or who know everything and are close). They take the county bus and show up hours later. If you've moved on
     by then, they text "where r u now??" and follow. */
(function (SH) {
  const FR = SH.Friends, K = SH.K, A = SH.Atlas; if (!FR || !SH.Brain) return;
  const G = () => SH.G, pick = (a) => a[Math.floor(Math.random() * a.length)];
  const pr = (id) => ({ she: ['she', 'her', 'her'], he: ['he', 'him', 'his'], they: ['they', 'them', 'their'] })[FR.KIDS[id].g] || ['they', 'them', 'their'];

  // Jordan's mom is Mrs. Pike (tanya): the parents-worry texts go to a host_jordan thread
  if (SH.NPCS_META && !SH.NPCS_META.host_jordan) SH.NPCS_META.host_jordan = Object.assign({}, SH.NPCS_META.tanya || { n: 'Mrs. Pike', col: '#88c0ff', ini: 'T' }, { full: "Mrs. Pike (Jordan's mom)", ph: false });
  if (!SH.Brain.host_jordan && SH.Brain.tanya) SH.Brain.host_jordan = function () { return SH.Brain.tanya.apply(this, arguments); };
  /* ---------- joining ---------- */
  function join(id, how) {
    const g = G(), k = FR.KIDS[id], f = FR.st(id); if ((g.party || []).includes(id) || g.ended) return;
    g.party = (g.party || []).concat(id); f.home = 0; f.joinedAt = g.t; f.wouldRun = true; SH.flag('ranWithFriend'); g.heat = Math.min(100, (g.heat || 0) + 5);
    const [he, him, his] = pr(id), v = (a, b) => (k.g === 'they' ? b : a);
    const text = how === 'bus'
      ? [`The county bus sighs to a stop and ${k.n} is the only one who gets off, backpack on both shoulders, looking around like the town might bite. Then ${he} ${v('sees', 'see')} you and ${v('does', 'do')} a stupid little wave, and something in your chest unknots.`, `"that bus smelled like feet the ENTIRE time," ${he} ${v('says', 'say')}. "ok. where are we sleeping."`]
      : [`${k.n} comes out the side door with ${his} backpack half-zipped and ${id === 'jordan' ? 'his skateboard under his arm' : 'a hoodie on over pajamas'}. "i left a note that says i'm at a sleepover. that buys us like a day."`, 'It\'s better with two. It is. It\'s also twice the people looking, and you both know whose idea this was.'];
    const show = () => SH.UI.dialog({ title: 'Two backpacks', who: id, text, choices: [{ t: 'Okay. Let\'s go.', fn: () => {} }] });
    const wait = () => (SH.UI.modalOpen() ? setTimeout(wait, 400) : show());
    setTimeout(wait, 300);
  }
  FR.joinNow = join;

  /* ---------- friends coming to meet you in another town ---------- */
  const home = () => { const D = A && A.data && A.data(); return D && D.places.find((p) => p.home); };
  function busMins(pid) { const D = A.data(), p = D.places.find((x) => x.id === pid), h = home(); if (!p || !h) return 180; return Math.max(75, Math.round(A.miles(h, p) * 2.2 + 50)); }
  function sendFor(id, why) {
    const g = G(), p = A.here(), k = FR.KIDS[id], f = FR.st(id), h = SH.hour();
    let at = g.t + busMins(p.id);
    if (h >= 21 || h < 6) { const d0 = Math.floor(g.t / 1440) * 1440 + (h >= 21 ? 1440 : 0); at = d0 + 7 * 60 + busMins(p.id); }
    g.frComing = { id, pid: p.id, at };
    SH.Phone.push(id, id, why === 'night' || h >= 21 || h < 6 ? `ok. no buses till morning. i'm on the first one. like 7. don't go anywhere` : pick([`omw. taking the county bus to ${p.name}. like ${Math.round((at - g.t) / 60)} hrs. save me a spot`, `ok ok ok. i'm doing it. bus to ${p.name}. text me where to find u`]));
    SH.UI.log(`${k.n} is coming. ${h >= 21 || h < 6 ? 'First bus in the morning.' : 'A few hours on the county bus.'} Two missing kids gets more attention than one.`, 'warn');
  }
  FR.invite2 = function (id) {
    const g = G(), k = FR.KIDS[id], f = FR.st(id), p = A.here(), rel = g.rel[id] || 0;
    SH.Phone.push(id, 'me', `i'm in ${p.name}. come meet me?`); SH.advance(10, { interrupt: false });
    if (f.wouldRun && k.fam === 'strict' && Math.random() < 0.12) { SH.Phone.push(id, id, `my ${/^Mr/.test(k.parent) ? 'dad' : 'mom'} took my phone i'm on the ipad. i can't get out today. try tomorrow?? i'm sorry`); return SH.UI.afterAction(); }
    const yes = f.wouldRun || Math.random() < (k.risk || 0.3) + (rel - 60) / 100 + (f.pull || 0) / 200;
    if (!yes) { SH.Phone.push(id, id, pick([`${p.name}?? that's so far. i can't. i'm sorry. please be safe`, 'i want to. i can\'t. please call someone. or come home. i\'ll bring food'])); g.heat = Math.min(100, (g.heat || 0) + 3); return SH.UI.afterAction(); }
    f.wouldRun = true; sendFor(id); SH.UI.afterAction();
  };
  if (K && K.me) K.me((p, ch) => {
    const g = G(); if (g.phase !== 'run' || !g.away || (g.party || []).length >= 2 || g.frComing) return;
    const h = SH.hour(); if (h < 7 || h >= 23) return;
    const ids = FR.metIds().concat('jordan').filter((id) => FR.KIDS[id] && !(g.party || []).includes(id) && !g.flags['blocked_' + id]);
    ids.filter((id) => { const f = FR.st(id); return f.wouldRun || (f.knows && (g.rel[id] || 0) >= 60) || (id === 'jordan' && f.asksCome === true); })
      .forEach((id) => ch.push({ t: `📱 Text ${FR.KIDS[id].n}: "come meet me in ${p.name}"`, sub: FR.st(id).wouldRun ? `${FR.KIDS[id].n} said ${pr(id)[0]}'d come.` : 'Maybe.', fn: () => FR.invite2(id) }));
    if (g.frComing) ch.push({ t: `${FR.KIDS[g.frComing.id].n} is on the way`, sub: 'County bus', fn: () => {} });
  });
  const bAdv = SH.advance;
  SH.advance = function () {
    const r = bAdv.apply(this, arguments);
    try {
      const g = G(), fc = g && g.frComing;
      if (fc && !g.ended && g.t >= fc.at) {
        if (g.phase !== 'run') g.frComing = null;
        else if (g.away && g.away === fc.pid) { g.frComing = null; join(fc.id, 'bus'); }
        else if (g.away) { const p = A.here(); fc.pid = p.id; fc.at = g.t + 90; SH.Phone.push(fc.id, fc.id, `i'm in the town u said and ur not here?? where r u now. ok ${p.name}. getting on another bus`); }
        else { g.frComing = null; join(fc.id, 'here'); }
      }
    } catch (e) { console.warn('frComing', e); }
    return r;
  };

  /* ---------- Jordan: garage → "then i'm coming with u" ---------- */
  const RUNNING = /\b(ran away|run away|running away|runaway|i left( home)?|leaving (home|town|harlow)|i'?m leaving|take off|taking off|get out of (here|this town|harlow)|not going (back|home))\b/;
  const NO = /^(no+|nah+|nope|i can'?t|i cant|can'?t|won'?t|i won'?t|not really|no thanks|i'?m good|it'?s fine|nty)\b|\b(your mom would|ur mom would|she'?d call|she would call|she'll call|call my mom|too close|they'?d find me|they would find me|first place they'?d look|need to (actually )?(go|leave)|not staying|can'?t stay|rather not)\b/;
  const YES = /^(y+e+s+|ya+|yea+h?|yep|yup|ok+|okay|sure|fine|bet|deal|please|pls|let'?s go|lets go|come|do it|for real|fr|really\?*|u sure|you sure|if you want|ok fine)\b/;
  const bj = SH.Brain.jordan;
  if (typeof bj === 'function') {
    const w = function (an, c) {
      const g = G(), f = FR.st('jordan'), t = an.t || '', R = (say, fx, x) => Object.assign({ say, fx: fx || {} }, x || {});
      if (an.has && (an.has('selfharm') || an.has('dex'))) return bj.apply(this, arguments);
      const inParty = (g.party || []).includes('jordan');
      if (!inParty) {
        // he offers his place first
        if (!f.offered && (an.has('stay') || an.has('run') || RUNNING.test(t))) {
          f.offered = true; SH.flag('jordanGarage'); c.mem.jflow = 'offered';
          return R(g.phase === 'run' ? 'wait WHAT. dude. ok ok. come to mine. garage side door, code 4417. my mom goes to bed at 10. i\'ll sneak blankets down. just come' : 'wait fr?? ok um. garage side door, code is 4417. my mom goes to bed at 10. but like... she WILL find u by morning. and she\'d have to call ur mom, she says it\'s literally illegal not to', { rel: 3 }, { narr: 'Jordan just gave you the garage code. 4417.' });
        }
        // you say no to the garage → he's coming with you
        if (f.offered && !f.wouldRun && f.asksCome == null && NO.test(t) && !an.q) {
          f.asksCome = true; c.mem.jflow = 'asks';
          let say = 'ok then i\'m coming with u. fr. i\'m not letting u do this alone. i have $14 and a skateboard, that\'s basically a plan';
          const tr = FR.trouble && FR.trouble('jordan');
          if (tr && !f.shared) { f.shared = true; say += '. and honestly... ' + tr.tell; }
          return R(say + '. so? yes?', { rel: 4 }, { narr: 'Jordan wants to come with you.' });
        }
        if (f.asksCome === true && !f.wouldRun) {
          if (YES.test(t) || (an.len || t.split(' ').length) <= 9 && /\b(y+e+s+|yeah|yea|ya|yep|yup|ok|okay|sure|bet|deal|let'?s go|lets go|fine|please)\b/.test(t) && !/\b(no|nah|don'?t|not)\b/.test(t) || /\b(ok(ay)? come|you can come|u can come|come with me|let'?s do it|i'?d like that)\b/.test(t)) {
            f.wouldRun = true; f.rt = f.rt || { asks: 0 }; f.rt.dec = 'in'; c.mem.jflow = 'in';
            if (g.phase === 'run' && !g.away && (g.party || []).length < 2) { setTimeout(() => join('jordan', 'here'), 50); return R('ok. OK. give me ten minutes. i\'m grabbing my stuff. don\'t leave without me', { rel: 4 }, { end: true }); }
            if (g.phase === 'run' && g.away && !g.frComing && (g.party || []).length < 2) { setTimeout(() => sendFor('jordan'), 50); return R('ok. i\'m getting on the county bus. tell me exactly where u are', { rel: 4 }); }
            return R('ok. when u go, u text me first. i\'ll be ready. i\'m literally packing a bag right now', { rel: 4 });
          }
          if (NO.test(t) || /\b(don'?t|stay home|not you|it'?s dangerous|too dangerous)\b/.test(t)) { f.asksCome = 'no'; c.mem.jflow = null; return R('...ok. but u text me every day. i\'m serious. and the garage code doesn\'t expire', { rel: 1 }); }
        }
      }
      // food / cold: he's your best friend, he'd feed you
      if (an.has && (an.has('food') || an.has('cold')) && !an.has('money') && !inParty && !c.mem.jfood) {
        c.mem.jfood = 1;
        return R(an.has('cold') && !an.has('food') ? 'dude u can have my big hoodie. the ugly one. come by, i\'ll leave it on the garage step' : pick(['wait have u eaten?? my mom made tacos, i\'ll steal like four. garage step in 20', 'bro come over. pizza rolls. i\'ll make the whole bag']), { rel: 2 });
      }
      return bj.apply(this, arguments);
    };
    Object.keys(bj).forEach((x) => { w[x] = bj[x]; });
    SH.Brain.jordan = w;
  }
  // Jordan said he'd come, but you left without him: text him from anywhere in Harlow
  if (K && K.acts) K.acts((acts) => { const g = G(), f = FR.st('jordan'); if (g.phase !== 'run' || g.away || !f.wouldRun || (g.party || []).includes('jordan') || (g.party || []).length >= 2) return; acts.push({ label: 'Text Jordan: "i left. come with?"', sub: 'He said he would.', fn: () => FR.invite('jordan') }); });
})(window.SH);
