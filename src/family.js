/* SMALL HOURS — who you are and who you live with.
   Gender pick on the title screen; the family (names, who the "problem adult" is, Dad's story, money, Mom's job)
   is rolled from the story seed. Everything is applied through SH.nm, which every log line, dialog, chat line,
   text message and ending already runs through — so the whole game re-skins without touching the story files. */
(function (SH) {
  const $ = (s) => document.querySelector(s);
  const F = SH.Family = {};
  const h32 = (s) => { let h = 2166136261; for (const c of String(s)) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); } return h >>> 0; };
  function rng(seed) { let a = h32('fam:' + seed) || 1; return () => { a ^= a << 13; a ^= a >>> 17; a ^= a << 5; return ((a >>> 0) % 100000) / 100000; }; }
  const pk = (r, a) => a[Math.floor(r() * a.length)];

  const ADULT = [
    { role: 'stepdad', how: (n) => `${n} married Mom two years ago. The first year was fine. You keep trying to remember the first year.`, rel: 0 },
    { role: "mom's boyfriend", how: (n) => `${n} is Mom's boyfriend. He moved in last winter "to help with rent." He doesn't help with rent.`, rel: -6 },
    { role: 'uncle', how: (n) => `${n} is Mom's younger brother. He moved in "for a few weeks" in June, after the plant let him go. It's October.`, rel: 4 },
  ];
  const ADULT_N = ['Rick', 'Darren', 'Wade', 'Troy', 'Shane', 'Doug', 'Curtis', 'Brent'];
  const ADULT_S = ['Hollis', 'Kessler', 'Pruitt', 'Voss', 'Dunbar', 'Radley'];
  const MOM_N = ['Dana', 'Kim', 'Renee', 'Carla', 'Jess', 'Michelle', 'Tasha', 'Angie'];
  const MOM_S = ['Reyes', 'Morgan', 'Castillo', 'Webb', 'Ortiz', 'Sullivan', 'Price', 'Baptiste'];
  const SIB = ['Lily', 'Maddie', 'Rosie', 'Ava', 'Nora', 'June', 'Pearl', 'Mia'];
  const GMA = ['Rose', 'Ruth', 'Evelyn', 'Marion', 'Lorraine'];
  const JOBS = [
    ['a nursing assistant at St. Brigid\'s', 'works doubles at St. Brigid\'s'],
    ['a night-shift picker at the distribution warehouse', 'works nights at the warehouse off Route 9'],
    ['a cook at the Route 9 truck stop', 'works split shifts at the truck stop'],
    ['a home health aide', 'drives between clients all day and some nights'],
  ];
  const DAD = [
    'Your dad left when you were four. He sends a birthday card most years, usually late, usually with a ten-dollar bill.',
    'Your dad died in a car accident when you were six. You have his watch in the shoebox. It doesn\'t work. You don\'t want it fixed.',
    'Your dad is in prison two states away. You have three letters from him. You\'ve read them so many times the folds are soft.',
    'You never met your dad. Mom says he "wasn\'t ready." You\'ve decided you don\'t care. You mostly believe that.',
    'Your dad lives across the country with a new family. He calls on Christmas. Last year he called on the 27th.',
  ];
  const MONEY = ['Money is tight. The kind of tight where Mom does math on the back of envelopes.', 'Money is very tight. The lights got shut off for two days in August. Nobody talks about it.', 'Money is tight, but there\'s always cereal. Mom makes sure there\'s always cereal.'];
  const LOOKS = ['You\'re small for twelve and fast.', 'You\'re tall for twelve, which people mistake for older.', 'You have your grandma\'s eyes, everyone says. You\'ve decided that\'s a good thing.'];

  F.generate = function (seed, gender) {
    const r = rng(seed);
    const A = pk(r, ADULT);
    const f = {
      gender: gender || 'm',
      role: A.role, roleIdx: ADULT.indexOf(A), rick: pk(r, ADULT_N), rickS: pk(r, ADULT_S),
      mom: pk(r, MOM_N), momS: pk(r, MOM_S), sib: pk(r, SIB), sibAge: 6 + Math.floor(r() * 3), gma: pk(r, GMA),
      job: Math.floor(r() * JOBS.length), dad: Math.floor(r() * DAD.length), money: Math.floor(r() * MONEY.length), look: Math.floor(r() * LOOKS.length),
    };
    if (f.sib === f.gma) f.gma = 'Rose';
    return f;
  };
  F.roleWord = () => (SH.G && SH.G.fam ? SH.G.fam.role : 'stepdad');
  F.backstory = function (f) {
    f = f || SH.G.fam; if (!f) return [];
    return [ADULT[f.roleIdx].how(f.rick), DAD[f.dad], MONEY[f.money], LOOKS[f.look]];
  };
  F.summary = (f) => `Mom (${f.mom}) · ${f.role === 'uncle' ? 'Uncle ' + f.rick : f.rick + ', ' + (f.role === 'stepdad' ? 'stepdad' : "Mom's boyfriend")} · sister ${f.sib} (${f.sibAge}) · Grandma ${f.gma}`;

  /* ---------- the re-skin ---------- */
  const cased = (w, rep) => (w === w.toUpperCase() && w.length > 1 ? rep.toUpperCase() : w[0] === w[0].toUpperCase() ? rep[0].toUpperCase() + rep.slice(1) : rep);
  const GW = {
    f: [[/\bmijo\b/gi, 'mija'], [/\bBROTHER\b/g, 'SISTER'], [/\bbig brother\b/gi, 'big sister'], [/\byoung man\b/gi, 'young lady'], [/\bmy boy\b/gi, 'my girl'], [/\blittle man\b/gi, 'little miss'], [/\bgood boy\b/gi, 'good girl']],
    n: [[/\bmijo\b/gi, 'cariño'], [/\bBROTHER\b/g, 'SIBLING'], [/\bbig brother\b/gi, 'big sib'], [/\byoung man\b/gi, 'kiddo'], [/\bmy boy\b/gi, 'my kid'], [/\blittle man\b/gi, 'kiddo'], [/\bgood boy\b/gi, 'good kid']],
  };
  const baseNm = SH.nm;
  SH.nm = function (s) {
    s = baseNm(s);
    const G = SH.G; if (typeof s !== 'string' || !G || !G.fam) return s;
    const f = G.fam;
    if (f.rick !== 'Rick') s = s.replace(/\bRick\b/g, f.rick).replace(/\bRICK\b/g, f.rick.toUpperCase());
    if (f.rickS !== 'Hollis') s = s.replace(/\bHollis\b/g, f.rickS);
    if (f.role !== 'stepdad') s = s.replace(/\bstep-?dad\b|\bstepfather\b/gi, (w) => cased(w, f.role === 'uncle' ? 'uncle' : "mom's boyfriend")).replace(/\byour mom's boyfriend's\b/gi, "your mom's boyfriend's");
    if (f.sib !== 'Lily') s = s.replace(/\bLily\b/g, f.sib).replace(/\bLILY\b/g, f.sib.toUpperCase());
    if (f.mom !== 'Dana') s = s.replace(/\bDana\b/g, f.mom);
    if (f.momS !== 'Reyes') s = s.replace(/\bReyes\b/g, f.momS);
    if (f.gma !== 'Rose') s = s.replace(/\bGrandma Rose\b/g, 'Grandma ' + f.gma).replace(/\bRose\b(?= (said|says|called|calls|is|was|Hale|asked))/g, f.gma);
    if (f.gender !== 'm' && GW[f.gender]) GW[f.gender].forEach(([re, w]) => { s = s.replace(re, (m) => cased(m, w)); });
    return s;
  };

  /* the language engine understands the new names as the old roles */
  const N = SH.NLP;
  if (N && N.normalize) {
    const bn = N.normalize;
    N.normalize = function (t) {
      let s = bn.apply(this, arguments); const G = SH.G; if (!G || !G.fam || typeof s !== 'string') return s;
      const f = G.fam, lo = (x) => x.toLowerCase();
      if (f.rick !== 'Rick') s = s.replace(new RegExp('\\b' + lo(f.rick) + '\\b', 'g'), 'rick');
      if (f.role === 'uncle') s = s.replace(/\b(my )?uncle\b/g, 'stepdad'); else if (f.role !== 'stepdad') s = s.replace(/\b(my )?mom'?s boyfriend\b/g, 'stepdad');
      if (f.sib !== 'Lily') s = s.replace(new RegExp('\\b' + lo(f.sib) + '\\b', 'g'), 'lily');
      if (f.gma !== 'Rose') s = s.replace(new RegExp('\\bgrandma ' + lo(f.gma) + '\\b', 'g'), 'grandma');
      return s;
    };
  }

  /* character sheets follow the family */
  const BASE_META = {};
  F.apply = function () {
    const G = SH.G; if (!G) return; const M = SH.NPCS_META; if (!M) return;
    ['mom', 'rick', 'lily', 'grandma'].forEach((k) => { if (M[k] && !BASE_META[k]) BASE_META[k] = Object.assign({}, M[k]); });
    if (!G.fam) G.fam = F.generate((G.story && G.story.seed) || 1, G.gender || 'm');
    const f = G.fam;
    if (M.mom) M.mom.full = `${f.mom} ${f.momS}`;
    if (M.rick) { M.rick.n = f.rick; M.rick.ini = f.rick[0]; M.rick.full = `${f.rick} ${f.rickS} (${f.role})`; }
    if (M.lily) { M.lily.n = f.sib; M.lily.ini = f.sib[0]; M.lily.full = `${f.sib} (half-sister, ${f.sibAge})`; }
    if (M.grandma) M.grandma.n = 'Grandma ' + f.gma;
    if (SH.World && SH.World.PEOPLE) { SH.World.PEOPLE.rick = f.rick; SH.World.PEOPLE.lily = f.sib; }
  };

  /* ---------- new game / load ---------- */
  let pendingGender = 'm';
  const bNew = SH.newGame;
  SH.newGame = function (name, mode, seed) {
    bNew.apply(this, arguments);
    const G = SH.G; G.gender = pendingGender;
    G.fam = F.generate((G.story && G.story.seed) || seed || 1, G.gender);
    const f = G.fam;
    G.rel.rick = (G.rel.rick || 0) + ADULT[f.roleIdx].rel;
    F.apply();
  };
  const bLoad = SH.load; if (bLoad) SH.load = function () { const r = bLoad.apply(this, arguments); if (r) F.apply(); return r; };
  const bAR = SH.afterRestore; if (bAR) SH.afterRestore = function () { F.apply(); return bAR.apply(this, arguments); };

  /* the intro gets the backstory */
  function hookDialog() {
    const UI = SH.UI; if (!UI || UI._famHook) return; UI._famHook = true;
    const bd = UI.dialog;
    UI.dialog = function (o) {
      if (o && o.title === 'Small Hours' && SH.G && SH.G.fam && !o._fam && Array.isArray(o.text)) {
        o._fam = true; const f = SH.G.fam, AGE = ['zero','one','two','three','four','five','six','seven','eight','nine'][f.sibAge] || f.sibAge;
        o.text = o.text.map((t) => typeof t !== 'string' ? t : t.replace(/who is seven/g, 'who is ' + AGE).replace(/\bseven-year-old\b/g, AGE + '-year-old').replace(/works double shifts as a nursing assistant at St\. Brigid's/g, 'is ' + JOBS[f.job][0] + ' and ' + JOBS[f.job][1])); o.text.splice(1, 0, F.backstory().join(' '));
      }
      return bd.apply(this, arguments);
    };
  }

  /* ---------- title screen ---------- */
  function preview() {
    const el = $('#famPrev'); if (!el) return;
    const seedIn = $('#seedIn'); let seed = seedIn.value.trim();
    if (!seed) { seed = F.pendingSeed = F.pendingSeed || String(Math.floor(Math.random() * 1000000)); }
    let n = seed; if (SH.Story && SH.Story.hashSeed) { try { n = SH.Story.hashSeed(seed); } catch (e) {} }
    const f = F.generate(n, pendingGender);
    el.innerHTML = `<b>Family:</b> ${F.summary(f)}`;
  }
  window.addEventListener('DOMContentLoaded', () => {
    hookDialog();
    const mode = $('#modeSeg'); if (!mode) return;
    const row = document.createElement('div'); row.className = 'row';
    row.innerHTML = `<label>You are</label><div class="seg" id="genSeg"><button class="on" data-g="m">A boy</button><button data-g="f">A girl</button><button data-g="n">Nonbinary</button></div>`;
    mode.closest('.row').before(row);
    const fam = document.createElement('div'); fam.className = 'row famrow';
    fam.style.cssText += ";display:flex;align-items:center;gap:10px"; fam.innerHTML = `<label></label><div id="famPrev" style="flex:1;font-size:12px;color:var(--muted);max-width:420px;line-height:1.4"></div><button class="btn" style="flex:none" id="famRoll" title="Roll a different family (new story)">🎲</button>`;
    row.after(fam);
    row.querySelectorAll('button').forEach((b) => (b.onclick = () => { pendingGender = b.dataset.g; row.querySelectorAll('button').forEach((x) => x.classList.toggle('on', x === b)); preview(); }));
    $('#famRoll').onclick = () => { $('#seedIn').value = Math.floor(Math.random() * 1000000); preview(); };
    $('#seedIn').addEventListener('input', preview);
    const dice = $('#diceBtn'); if (dice) dice.addEventListener('click', () => setTimeout(preview, 0));
    // make sure an empty seed uses the family you were shown
    const sb = $('#startBtn'); if (sb) sb.addEventListener('click', () => { if (!$('#seedIn').value.trim() && F.pendingSeed) $('#seedIn').value = F.pendingSeed; }, true);
    preview();
  });
})(window.SH);
