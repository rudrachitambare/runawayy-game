/* SMALL HOURS — multi-clause sentences (turn 37).
   Before: "im hungry and cold but i dont want to go home because rick yells" got ONE reply to ONE part, and the rest
   was ignored (or a clause like "no i cant, your mom would call my mom" confused the whole thing).
   Now: the line is split into clauses (sentences, then ", and / but / also / plus / so" when both sides are real
   clauses — "because …" stays attached). Each clause is heard in order by the same brain (so memory, threads and
   context all update as if you'd said them one after another), and the replies are joined into one natural answer:
   the most important parts first-class (danger, disclosure, questions, asks for food/shelter/money), filler replies
   ("lol", "go on") dropped when there's something real to say, never the same line twice, at most 3 parts.
   Short lines and single clauses go straight through, untouched. */
(function (SH) {
  const T = SH.Talk, NLP = SH.NLP; if (!T || !NLP || !SH.Brain) return;
  const ABBR = /\b(ms|mr|mrs|dr|st|mt|ft|jr|sr|vs|etc)\./gi;
  const START = /^(i|i'm|im|i'd|i'll|i've|can|could|would|will|do|does|did|is|are|am|was|what|what's|whats|where|when|why|how|who|you|u|your|ur|my|we|he|she|they|it's|its|there|have|has|should|please|also|and|thanks|thank|no|yes|yeah|nah|ok|okay|sorry|maybe|let|let's|lets|tell|give|need|want|wanna|gotta)\b/i;
  const words = (s) => (s.match(/[a-z0-9']+/gi) || []).length;
  const FILLER = /^(fr|lol|lmao+|ok+|okay|go on|wait what|bro same|same|hm+|mhm|\.{2,}|yeah|ya|huh|what\??|and\??|sure|cool|nice|k)\W*$/i;
  const GREETONLY = /^(hi+|hey+|hello|yo+|sup|so|um+|uh+|ok+|okay|well|listen|look|dude|bro|man|like|anyway)\W*$/i;
  function split(raw) {
    let s = String(raw || '').replace(ABBR, (m) => m.slice(0, -1) + '\u2024');
    if (words(s) < 7) return [raw];
    let parts = s.split(/(?<=[.!?;])\s+|(?<=\?)(?=\s*\w)/).map((x) => x.trim()).filter(Boolean);
    const out = [];
    parts.forEach((pt) => {
      // ", and/but/also/so/plus ..." or " but / also / plus ..." or " and <clause start>"
      const bits = pt.split(/\s*,\s*(?:and |but |also |so |plus |then )?(?=\S)|\s+(?:and also|but also|and then|also|plus|but)\s+|\s+and\s+(?=(?:i|i'm|im|can|could|do|does|is|are|what|whats|what's|where|when|why|how|who|you|u|your|ur|my|we|it's|there)\b)/i);
      let cur = '';
      bits.forEach((b) => {
        b = (b || '').trim(); if (!b) return;
        // keep tiny bits and non-clauses attached to what came before ("i'm hungry, cold" / "no, i can't")
        if (cur && (words(b) < 3 || !START.test(b) && words(b) < 5 || /^(because|cause|cuz|since|so that|if|unless|or)\b/i.test(b))) cur += (/^(because|cause|cuz|since|so that|if|unless|or)\b/i.test(b) ? ' ' : ', ') + b;
        else { if (cur) out.push(cur); cur = b; }
      });
      if (cur) out.push(cur);
    });
    // a leading lone "hey" / "no" joins the next clause
    const merged = [];
    out.forEach((x) => { const last = merged[merged.length - 1]; if (last != null && (words(last) <= 2 || words(last) <= 4 && /^(no|nah|nope|yes|yeah|ya|ok|okay|thanks|thank you|sorry|well|hey|yo|i can'?t|i cant)\b/i.test(last))) merged[merged.length - 1] = last + ', ' + x; else merged.push(x); });
    return merged.map((x) => x.replace(/\u2024/g, '.')).filter((x) => !GREETONLY.test(x.trim()));
  }
  const FAM = { shelter: ['stay', 'run', 'home', 'sleep'], food: ['food'], cold: ['cold'], money: ['money', 'broke'], feel: ['disclose', 'scared', 'sad', 'low'], police: ['police'], danger: ['selfharm'] };
  const STRONG = ['selfharm', 'disclose', 'scared', 'stay', 'run', 'food', 'cold', 'money', 'police', 'home', 'help', 'where', 'hurt', 'sick', 'tired'];
  function score(an, i) {
    if (!an) return 0; let s = 0; const has = (k) => an.has && an.has(k);
    if (has('selfharm')) s += 100; if (has('disclose') || has('scared')) s += 40;
    if (an.q) s += 25; STRONG.forEach((k) => { if (has(k)) s += 12; });
    s += Math.min(10, words(an.t || '')); return s - i;   // earlier wins ties
  }
  const norm = (x) => String(x || '').toLowerCase().replace(/[^a-z0-9 ]/g, '').trim();
  const teen = (id) => !!((SH.Friends && SH.Friends.KIDS[id]) || /^(jordan|tyler|wren|dex|lily)$/.test(id));
  function merge(rs, id) {
    const keep = []; const seen = new Set();
    rs.forEach((r) => { if (!r || typeof r.say !== 'string') return; const n = norm(r.say); if (!n || seen.has(n)) return; seen.add(n); keep.push(r); });
    const real = keep.filter((r) => !FILLER.test(r.say.trim()));
    const use = (real.length ? real : keep.slice(0, 1)).slice(0, 3);
    if (!use.length) return null;
    const out = { say: '', fx: {} };
    use.forEach((r, i) => {
      let s = r.say.trim();
      if (i > 0) { if (!/[.!?…)"'\u{1F300}-\u{1FAFF}]$/u.test(out.say)) out.say += teen(id) ? '.' : '.'; out.say += ' '; if (!teen(id)) s = s.charAt(0).toUpperCase() + s.slice(1); }
      out.say += s;
      Object.entries(r.fx || {}).forEach(([k, v]) => { if (typeof v === 'number') out.fx[k] = Math.max(-12, Math.min(12, (out.fx[k] || 0) + v)); else out.fx[k] = v; });
      Object.keys(r).forEach((k) => {
        if (k === 'say' || k === 'fx') return;
        if (k === 'narr') out.narr = out.narr ? out.narr + ' ' + r.narr : r.narr;
        else if (k === 'flags') out.flags = (out.flags || []).concat(r.flags || []);
        else if (out[k] === undefined) out[k] = r[k];
      });
    });
    return out;
  }
  const inner = SH.Brain, cache = new Map();
  let depth = 0;
  function wrap(id, fn) {
    if (cache.has(fn)) return cache.get(fn);
    const w = function (an, c) {
      if (depth || !an || !c) return fn.apply(this, arguments);
      const raw = an.raw || an.t || '';
      const cl = an.carried ? [raw] : split(raw);
      if (cl.length < 2) return fn.apply(this, arguments);
      depth++;
      try {
        // clauses about the same thing ("i need somewhere to sleep" + "can i stay at yours?") are one thought
        const fam = (a) => { const f = new Set(); if (!a || !a.has) return f; Object.entries(FAM).forEach(([k, L]) => { if (L.some((x) => a.has(x))) f.add(k); }); return f; };
        const groups = [];
        cl.forEach((x) => { let a = null; try { a = NLP.analyze(x); } catch (e) {} const fs = fam(a); const g0 = fs.size && groups.find((g) => [...fs].some((k) => g.f.has(k))); if (g0) { g0.t += (/[.!?]$/.test(g0.t) ? ' ' : ', ') + x; fs.forEach((k) => g0.f.add(k)); } else groups.push({ t: x, f: fs }); });
        if (groups.length < 2) return fn.apply(this, arguments);
        const ans = groups.slice(0, 4).map((g) => { try { return NLP.analyze(g.t); } catch (e) { return null; } });
        // pick the (up to) 3 most important clauses, then answer them in the order they were said
        const order = ans.map((a, i) => [i, score(a, i)]).sort((a, b) => b[1] - a[1]).slice(0, 3).map((x) => x[0]).sort((a, b) => a - b);
        const rs = [];
        for (const i of order) {
          const a = ans[i]; if (!a) continue;
          let r = null; try { r = fn.call(this, a, c); } catch (e) { console.warn('clause', e); }
          if (r) rs.push(r);
          if (r && (r.end || r.result)) break;
          if (c.ended) break;
        }
        const m = merge(rs, id);
        return m || fn.apply(this, arguments);
      } finally { depth--; }
    };
    Object.keys(fn).forEach((x) => { w[x] = fn[x]; });
    cache.set(fn, w); return w;
  }
  SH.Brain = new Proxy(inner, { get(tg, key) { const f = tg[key]; return typeof f === 'function' && typeof key === 'string' ? wrap(key, f) : f; }, set(tg, key, v) { tg[key] = v; return true; } });
  SH.Clauses = { split };
})(window.SH);
