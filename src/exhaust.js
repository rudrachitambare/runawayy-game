/* SMALL HOURS — turn 61: running on empty is gentler.
   After 6 days on the run, if health < 40, fullness < 25 or energy < 20 at the start of a day (or you still have no roof
   at all by day 9), you used to be found on the spot. Now:
   - a warning a few hours ahead: when a need gets close (health < 50, fullness < 35, energy < 30), about once every 8 hours;
   - the first time, you collapse instead: you lose about 5 hours and some health, then wake up;
   - you're only found if it happens again within 3 days of the last collapse. Villages stay exempt (village_calm.js). */
(function (SH) {
  const K = SH.K; if (!K || !K.hourly) return;
  const G = () => SH.G;
  const days = () => { const g = G(); return g && g.missingAt ? SH.day() - SH.day(g.missingAt) : 0; };
  const inVillage = () => !!(SH.inVillage && SH.inVillage());
  const low = () => { const s = G().s, out = []; if (s.health < 50) out.push('health'); if (s.full < 35) out.push('food'); if (s.energy < 30) out.push('energy'); return out; };

  K.hourly.push(() => {
    const g = G(); if (!g || g.ended || g.phase !== 'run' || days() < 5 || inVillage()) return;
    if (g._exGrace > g.t || (g._exWarn && g.t - g._exWarn < 8 * 60)) return;
    const l = low(); if (!l.length) return;
    g._exWarn = g.t;
    const what = { health: 'You feel sick and shaky in a way that isn\'t going away.', food: 'Your stomach has stopped growling. That\'s worse.', energy: 'Your eyes keep closing on their own.' };
    SH.UI.log(`${l.map((k) => what[k]).join(' ')} If you don't ${l.includes('food') ? 'eat' : l.includes('energy') ? 'sleep' : 'rest and eat'} soon, your body is going to decide for you.`, 'bad');
    SH.UI.toast && SH.UI.toast(`Running on empty: ${l.join(', ')}`);
  });

  const Ex = SH.Exhaust = {};
  Ex.hit = function () {
    const g = G(); if (!g || g.ended || inVillage()) return;
    if (g._exCollapse && g.t - g._exCollapse < 3 * 1440) return SH.Endings.found('exhausted');
    g._exCollapse = g.t;
    const where = g.away ? 'a bench' : 'the curb';
    SH.UI.dialog({ title: 'Your body decides', cls: 'hot', text: [
      `You sit down on ${where} "for a second." The next thing you know, the light is different and your neck hurts and a pigeon is staring at you.`,
      'Hours, gone. Nobody noticed, or everybody did and kept walking. You get up slowly. Your legs feel borrowed.',
      'That was a warning. If it happens again in the next few days, someone will notice. Eat something. Sleep somewhere real.'],
      choices: [{ t: 'Get up', fn: () => { SH.advance(300, { interrupt: false }); if (G().ended) return; SH.st('health', -8); SH.st('energy', 25); SH.st('stress', 10); SH.UI.afterAction && SH.UI.afterAction(); } }] });
  };
})(window.SH);
