/* SMALL HOURS — turn 59: the found-officer counts too.
   The "you look like the kid on the poster" cop (EN.found in a town) used to be separate from the patrol-stop limit,
   so the same deputy could keep coming back. Now:
   - talking your way out of it counts as a talk with that town's cop. A full "sorry kid, you just look like her" means
     they're done with you in that town; "I'll be around" counts as one talk;
   - after 3 talks, or within a day of the last one, that cop won't come out for you in that town
     (called in, looking rough, the patrol car cornering you: they drive past instead). */
(function (SH) {
  const P = SH.Police, EN = SH.Endings, K = SH.K; if (!P || !P.talks || !EN || !EN.found || !K) return;
  const G = () => SH.G;
  const LOCAL = ['away', 'sheriff', 'exhausted', 'police'];
  const town = () => { const g = G(); if (!g) return null; const m = /^t_(p\d+)_/.exec(g.loc || ''); const id = g.away || (m && m[1]); if (!id) return null; const p = SH.Atlas.data().places.find((q) => q.id === id); return p && !p.home && p.tier !== 'village' ? p : null; };

  const bFound = EN.found;
  EN.found = function (reason) {
    const g = G(), p = town();
    if (!g || g.ended || !p || !LOCAL.includes(reason)) return bFound.apply(this, arguments);
    const tk = P.talks(p), recent = g.t - tk.last < 1440;
    if (!(P.leftAlone(p) || recent)) return bFound.apply(this, arguments);
    const cop = P.copName(p, reason === 'sheriff');
    g._copTalk = false; g.awayNotice = recent && !P.leftAlone(p) ? 60 : 45;
    if (!g.away) g.away = p.id;
    if (reason === 'exhausted') {
      g._exGrace = g.t + 24 * 60; SH.st('energy', 12); SH.st('full', 20);
      SH.UI.log(`${cop} pulls over, sees it's you, and sighs. "You look beat, kid." A gas-station sandwich and a bottle of water come out the window. "Eat that. Get some sleep." Then the car pulls away.`, 'good');
    } else SH.UI.log(K.pick([
      `A patrol car slows down next to you. It's ${cop}. They look at you for a second, give a small nod, and drive on. They've already decided about you.`,
      `${cop} rolls by, lifts two fingers off the wheel, and doesn't stop. In ${p.name}, you're just a kid who lives here now.`,
      `Somebody must have called again. ${cop} drives past, sees it's you, and keeps going.`]), 'good');
    SH.UI.afterAction && SH.UI.afterAction();
  };

})(window.SH);
