/* SMALL HOURS — Part 5b: the group.
   Attachment (G.att[id]) grows every hour you're together and more when you actually talk. No jealousy, no splits (house rule).
   Groups are easy to explain for a few days ("we're cousins visiting") and get noticed if they stay in one place too long:
   under 5 days in a place a group is actually safer than one kid alone; after that, less so (G.stay tracks it).
   Homesick friends: you can sit with them and talk about home (free text). Say the right things and they stay, for real.
   Your crush can come too. */
(function (SH) {
  const K = SH.K, A = SH.Atlas, FR = SH.Friends; if (!K || !A) return;
  const G = K.G;
  const att = (id, d) => { const g = G(); g.att = g.att || {}; if (d) g.att[id] = Math.max(0, Math.min(100, (g.att[id] || 10) + d)); return g.att[id] || 10; };
  K.hourly.push(() => { const g = G(); if (g.phase !== 'run') return; K.party().forEach((id) => att(id, 0.4)); });
  const bArr = A.arrive; A.arrive = function (to) { const g = G(), r = bArr.apply(this, arguments); if (g.away && (!g.stay || g.stay.pid !== g.away)) g.stay = { pid: g.away, since: g.t }; return r; };
  const stayDays = (p) => { const s = G().stay; return s && s.pid === p.id ? (G().t - s.since) / 1440 : 0; };
  const Group = SH.Group = {
    mult(p) { const n = K.grp(); if (n < 2) return 1; const d = stayDays(p); return (d < 5 ? 0.75 : 1.2 + 0.05 * Math.min(10, d - 5)) * (n > 3 ? 1 + 0.1 * (n - 3) : 1); },
    att, stayDays,
  };
  (A.mods = A.mods || []).push((p) => Group.mult(p));
  /* ---------- homesick: comfort talk ---------- */
  const COMFORT = [/\b(it'?s|that'?s) (okay|ok|normal|not dumb|not stupid)\b/, /\b(miss|missing) (her|him|them|your|home)\b/, /\bme too\b/, /\b(we can|you can|i'?ll) (go back|call|text|walk you)\b/, /\b(not|aren'?t) (alone|dumb|stupid|weak)\b/, /\b(i'?m|we'?re) (here|with you)\b/, /\b(love|loves) you\b/, /\bwhatever you (want|decide|need)\b/, /\bno matter what\b/];
  const bDlg = SH.UI.dialog;
  SH.UI.dialog = function (o) {
    if (o && o.title === 'Getting quiet' && o.who && FR && FR.KIDS[o.who] && !o._c) {
      const id = o.who, k = FR.KIDS[id], orig = Object.assign({}, o, { _c: 1, choices: o.choices.slice() });
      o = Object.assign({}, o, { _c: 1, choices: [{ t: 'Sit with them. Talk about home.', cls: 'safe', sub: 'Just listen first', fn: () => SH.Talk.open(id, { ctx: 'homesick', first: `i don't even know what i want. i just... ${k.fam === 'away' ? 'my dad texts me more now than when i was home. isn\'t that dumb?' : 'i keep thinking about her making dinner and there\'s an empty chair.'}`, turnsMax: 6, onEnd: (c) => {
        if ((c.mem.comfort || 0) >= 2) { FR.st(id).home = 0; FR.st(id).asked = false; att(id, 15); SH.st('mood', 6); SH.UI.log(`${k.n} wipes ${k.g === 'he' ? 'his' : k.g === 'she' ? 'her' : 'their'} face on a sleeve. "okay. okay. i'm staying. not because you asked. because i want to." ${c.mem.call ? 'Later, ' + k.n + ' texts home: just "i\'m ok. i love you."' : ''}`, 'good'); if (c.mem.call && SH.Parents) SH.Parents.bump(id, -15); SH.UI.afterAction(); }
        else SH.UI.dialog(orig);
      } }) }].concat(o.choices) });
    }
    return bDlg.call(this, o);
  };
  if (FR) Object.keys(FR.KIDS).forEach((id) => {
    const b = SH.Brain[id]; if (!b) return;
    SH.Brain[id] = function (an, c) {
      if (c.ctx !== 'homesick') return b.apply(this, arguments);
      const t = an.t, k = FR.KIDS[id]; c.mem.comfort = c.mem.comfort || 0;
      if (/\b(call|text) (her|him|them|your (mom|dad))\b/.test(t)) { c.mem.call = 1; c.mem.comfort++; return K.say('...if i text, i\'ll want to go home. but maybe. maybe just "i\'m okay."'); }
      const hit = COMFORT.filter((r) => r.test(t)).length;
      if (/\b(don'?t be|stop being|you'?re being) (a baby|dramatic|dumb|stupid)|\bget over it\b|\bman up\b/.test(t) || (!hit && an.has('hostile'))) { c.mem.comfort -= 2; return K.say('wow. okay. thanks.'); }
      if (hit) { c.mem.comfort += hit; att(id, 3 * hit); return K.say(K.pick(['yeah. yeah, i guess.', 'thanks. for real.', '...you\'re better at this than you think.', 'okay. i needed somebody to say that.'])); }
      if (an.q) return K.say(k.fam === 'strict' ? 'she\'s strict but she\'d drive through a wall for me. that\'s the annoying part.' : 'the stupid stuff. the way the kitchen smells. the dog.');
      return K.say(K.pick(['yeah.', 'i don\'t know.', '...', 'mm.']));
    };
  });
  /* ---------- your crush can join ---------- */
  K.acts((acts) => { const g = G(); if (!FR || g.phase !== 'run' || g.away || !g.crush || g.crush.status !== 'going') return; const id = g.crush.id; if ((g.party || []).includes(id) || (g.party || []).length >= 3) return; acts.push({ label: `Text ${FR.KIDS[id].n}: "come with me?"`, sub: 'You\'re going out. That counts for something.', fn: () => { FR.st(id).wouldRun = true; FR.invite(id); } }); });
})(window.SH);
