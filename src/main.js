/* SMALL HOURS — boot */
(function (SH) {
  const $ = (s) => document.querySelector(s);
  let mode = 'story';

  function titleAnim() {
    const c = $('#titleCanvas'), x = c.getContext('2d'); const drops = [];
    for (let i = 0; i < 220; i++) drops.push({ x: Math.random(), y: Math.random(), v: 0.3 + Math.random(), l: 6 + Math.random() * 14 });
    const blobs = [...Array(14)].map(() => ({ x: Math.random(), y: 0.55 + Math.random() * 0.45, r: 20 + Math.random() * 60, c: ['#f2a65a', '#e05260', '#6aa7ff', '#b48cff', '#ffcf73'][Math.floor(Math.random() * 5)], p: Math.random() * 6 }));
    function f(t) {
      if ($('#title').classList.contains('hidden')) return;
      const W = c.width = innerWidth, H = c.height = innerHeight;
      x.fillStyle = '#07090f'; x.fillRect(0, 0, W, H);
      blobs.forEach((b) => { const g = x.createRadialGradient(b.x * W, b.y * H, 0, b.x * W, b.y * H, b.r * 2.4); const a = 0.18 + 0.08 * Math.sin(t / 900 + b.p); g.addColorStop(0, b.c + Math.round(a * 255).toString(16).padStart(2, '0')); g.addColorStop(1, 'transparent'); x.fillStyle = g; x.fillRect(0, 0, W, H); });
      x.strokeStyle = 'rgba(180,200,230,.18)'; x.lineWidth = 1; x.beginPath();
      drops.forEach((d) => { d.y += d.v * 0.006; if (d.y > 1) { d.y = -0.05; d.x = Math.random(); } x.moveTo(d.x * W, d.y * H); x.lineTo(d.x * W, d.y * H + d.l); }); x.stroke();
      requestAnimationFrame(f);
    }
    requestAnimationFrame(f);
  }

  function boot(isNew) {
    $('#title').classList.add('hidden'); $('#app').classList.remove('hidden');
    SH.Scene.init($('#scene')); SH.Map.init();
    if (SH.f('knowsHarbor')) SH.LOC.harbor.hidden = false;
    document.addEventListener('keydown', (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      if (e.key === 'm' || e.key === 'M') { SH.Map.open ? SH.UI.closeMap() : SH.UI.openMap(); }
      if (e.key === 'Escape') SH.UI.closeMap();
      if (SH.UI.modalOpen()) { if (/^[1-9]$/.test(e.key)) { const bs = document.querySelectorAll('#modal .mchoices button'); const b = bs[+e.key - 1]; if (b && !document.querySelector('#modal input,#modal textarea')) b.click(); } return; }
      if (/^[1-9]$/.test(e.key)) { const b = document.querySelectorAll('#actions .agrid button')[+e.key - 1]; if (b && !b.disabled) { b.classList.add('press'); setTimeout(() => b.click(), 60); } }
      if (e.key === 'p' || e.key === 'P') { SH.Phone.open('pip'); e.preventDefault(); setTimeout(() => { const i = document.querySelector('#pbody input'); i && i.focus(); }, 50); }
      if (e.key === '?') SH.UI.help();
    });
    $('#mapClose').onclick = () => SH.UI.closeMap();
    if (isNew) {
      SH.snapshot('day1');
      const G = SH.G, P = G.story, T = SH.Story.TRAITS[P.trait], O = SH.Story.OPENINGS[P.opening];
      SH.UI.log(`${SH.longDate()}<small>${SH.DAY_LINES[1]}</small>`, 'day');
      O.log.forEach((l) => SH.UI.log(l, ''));
      SH.UI.renderAll();
      SH.UI.dialog({ title: 'Small Hours', html: true, text: [`You are ${G.name}. You are twelve. You live at 14 Maple Street in Harlow with your mom, Dana, who works double shifts as a nursing assistant at St. Brigid's; your stepdad, Rick, who lost his job at the plant four months ago and found the beer aisle; and your half-sister Lily, who is seven and thinks you hung the moon.`,
        `<span class="traitline"><b>${T.n}.</b> ${T.d}</span>`,
        'Nobody is going to tell you what to do. Not really. You have a phone, a backpack, a map of the town, and a sarcastic assistant named PIP who lives in your pocket.',
        `Tap things in the scene to use them, tap the floor to walk, and drag to look around. Talk to people by typing: there are no dialogue menus. Keys: <b>1–9</b> actions · <b>M</b> map · <b>P</b> ask PIP · <b>?</b> help.<br><span style="color:var(--muted);font-size:12px">Story #${P.seed}. Every story is different: the timing, the breaking point, the side stories, even the weather.</span>`],
        choices: [{ t: 'Get out of bed', fn: () => { SH.Audio.init(); } }] });
    } else { SH.UI.restoreLog(); SH.UI.log('— Continued. —', 'sys'); SH.UI.renderAll(); }
  }

  window.addEventListener('DOMContentLoaded', () => {
    titleAnim();
    SH.boot = boot;
    const cont = $('#contBtn'); if (SH.hasSave()) cont.classList.remove('hidden');
    try { const ns = localStorage.getItem('sh_nextSeed'); if (ns) { $('#seedIn').value = ns; localStorage.removeItem('sh_nextSeed'); } } catch (e) {}
    $('#diceBtn').onclick = () => { $('#seedIn').value = Math.floor(Math.random() * 1000000); };
    $('#modeSeg').querySelectorAll('button').forEach((b) => (b.onclick = () => { mode = b.dataset.m; $('#modeSeg').querySelectorAll('button').forEach((x) => x.classList.toggle('on', x === b)); }));
    $('#startBtn').onclick = () => { const n = ($('#nameIn').value || 'Sam').replace(/[<>&"'`]/g, '').trim().slice(0, 14) || 'Sam'; SH.newGame(n, mode, $('#seedIn').value); SH.Audio.init(); boot(true); };
    cont.onclick = () => { if (SH.load()) { SH.Audio.init(); boot(false); } };
    $('#nameIn').onkeydown = (e) => { if (e.key === 'Enter') $('#startBtn').click(); };
  });
})(window.SH);
