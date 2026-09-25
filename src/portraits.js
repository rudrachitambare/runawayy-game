/* SMALL HOURS — procedural SVG portraits. Every character has a look; faces shift with mood
   (neutral · warm · sad · angry · worried · guarded · tired). dex_19 never gets a face. */
(function (SH) {
  const LOOK = {
    sam: { skin: '#c98e6b', hair: '#3a2a20', style: 'messy', shirt: '#56617a', top: 'hoodie', young: 1 },
    mom: { skin: '#c68a64', hair: '#2b1d16', style: 'pony', shirt: '#6fb3b8', top: 'scrubs', bags: 1, ear: 1 },
    rick: { skin: '#e0b08e', hair: '#7a5a3a', style: 'recede', shirt: '#8a3b2b', top: 'flannel', stubble: 1, bags: 1, brow: 1.4 },
    lily: { skin: '#d49a74', hair: '#3b2517', style: 'pigtails', shirt: '#7bd88f', top: 'tee', freckles: 1, young: 2 },
    jordan: { skin: '#8d5a3b', hair: '#1c130e', style: 'short', shirt: '#2c3e66', top: 'hoodie', hat: 'beanie', hatc: '#6aa7ff', young: 1 },
    grandma: { skin: '#c68a64', hair: '#d4d4dc', style: 'bun', shirt: '#d9b86a', top: 'cardigan', glasses: '#8a6a3a', ear: 1, wrinkles: 1 },
    okafor: { skin: '#6b4128', hair: '#1a1210', style: 'none', shirt: '#e6e1d0', top: 'blouse', hat: 'wrap', hatc: '#5cc8b0', glasses: '#222', ear: 1 },
    patel: { skin: '#a8734f', hair: '#b9b6bf', style: 'bun', shirt: '#c7a4ff', top: 'shawl', bindi: 1, glasses: '#6b4b7a', wrinkles: 1 },
    tyler: { skin: '#efc3a0', hair: '#d8b56a', style: 'buzz', shirt: '#ff6b6b', top: 'jersey', young: 1, brow: 1.3 },
    maya: { skin: '#eac9a4', hair: '#15121a', style: 'bob', shirt: '#f28bd0', top: 'tee', young: 1 },
    wren: { skin: '#b98463', hair: '#b48cff', style: 'tuft', shirt: '#3b3350', top: 'hoodup', ring: 1, bags: 1 },
    dolores: { skin: '#e2b596', hair: '#b5452f', style: 'beehive', shirt: '#f28b66', top: 'uniform', pen: 1, ear: 1, wrinkles: 1 },
    officer: { skin: '#9a6545', hair: '#1d1410', style: 'bunlow', shirt: '#243a6b', top: 'uniform', hat: 'police', hatc: '#1d2d55' },
    marcus: { skin: '#5a3825', hair: '#140e0b', style: 'fade', shirt: '#f2a65a', top: 'tee', beard: 1, lanyard: 1 },
    agent: { skin: '#d9a47c', hair: '#8e8a94', style: 'short', shirt: '#8aa0b8', top: 'vest', glasses: '#333' },
    railagent: { skin: '#e8b996', hair: '#6d4a33', style: 'bob', shirt: '#7f8fa8', top: 'vest', ear: 1 },
    conductor: { skin: '#8d5a3b', hair: '#9a9aa2', style: 'short', shirt: '#26406e', top: 'uniform', hat: 'conductor', hatc: '#3f6fb5', stache: 1, wrinkles: 1 },
    tanya: { skin: '#8d5a3b', hair: '#2b1d16', style: 'curly', shirt: '#88c0ff', top: 'blouse', ear: 1 },
    henderson: { skin: '#e8c0a0', hair: '#e8e8ea', style: 'recede', shirt: '#6b8e5a', top: 'cardigan', glasses: '#555', wrinkles: 1 },
  };
  const shade = (hex, k) => { const n = parseInt(hex.slice(1), 16); const f = (v) => Math.max(0, Math.min(255, Math.round(v * k))); return '#' + [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => f(v).toString(16).padStart(2, '0')).join(''); };

  function hairBack(L) {
    const c = L.hair;
    switch (L.style) {
      case 'pony': return `<path d="M30 46 Q28 22 50 20 Q72 22 70 46 L70 60 Q66 44 50 42 Q34 44 30 60Z" fill="${c}"/><path d="M68 36 Q84 46 76 70 Q72 58 66 50Z" fill="${c}"/>`;
      case 'bob': return `<path d="M28 50 Q26 20 50 19 Q74 20 72 50 L72 64 Q66 60 64 50 L36 50 Q34 60 28 64Z" fill="${c}"/>`;
      case 'pigtails': return `<circle cx="25" cy="44" r="8" fill="${c}"/><circle cx="75" cy="44" r="8" fill="${c}"/><path d="M22 50 Q18 62 24 70" stroke="${c}" stroke-width="6" fill="none" stroke-linecap="round"/><path d="M78 50 Q82 62 76 70" stroke="${c}" stroke-width="6" fill="none" stroke-linecap="round"/>`;
      case 'bun': return `<circle cx="50" cy="17" r="9" fill="${c}"/>`;
      case 'bunlow': return `<circle cx="50" cy="60" r="0" fill="${c}"/>`;
      case 'beehive': return `<ellipse cx="50" cy="20" rx="17" ry="14" fill="${c}"/>`;
      case 'curly': return `${[[30, 34], [36, 24], [46, 19], [56, 19], [66, 24], [71, 34], [27, 45], [73, 45], [29, 56], [71, 56]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="8" fill="${c}"/>`).join('')}`;
      default: return '';
    }
  }
  function hairFront(L) {
    const c = L.hair, d = shade(c, 0.8);
    switch (L.style) {
      case 'messy': return `<path d="M31 42 Q30 24 48 22 Q66 20 70 38 Q64 32 58 34 L60 28 Q54 33 48 32 L50 26 Q42 32 36 32 Q34 38 31 42Z" fill="${c}"/>`;
      case 'pony': case 'bunlow': return `<path d="M31 42 Q32 25 50 24 Q68 25 69 42 Q60 30 50 31 Q40 30 31 42Z" fill="${c}"/>`;
      case 'recede': return `<path d="M31 40 Q31 30 38 27 Q36 34 33 44Z M69 40 Q69 30 62 27 Q64 34 67 44Z" fill="${c}"/><path d="M40 26 Q50 23 60 26" stroke="${d}" stroke-width="2" fill="none"/>`;
      case 'pigtails': return `<path d="M31 42 Q32 24 50 23 Q68 24 69 42 Q62 32 55 34 Q50 28 45 34 Q38 32 31 42Z" fill="${c}"/>`;
      case 'short': case 'fade': return `<path d="M31 40 Q31 23 50 22 Q69 23 69 40 Q64 30 50 29 Q36 30 31 40Z" fill="${c}"/>`;
      case 'bun': return `<path d="M31 42 Q32 24 50 23 Q68 24 69 42 Q60 29 50 29 Q40 29 31 42Z" fill="${c}"/>`;
      case 'buzz': return `<path d="M31 38 Q32 24 50 23 Q68 24 69 38 Q60 30 50 30 Q40 30 31 38Z" fill="${c}" opacity=".85"/>`;
      case 'bob': return `<path d="M30 44 Q30 22 50 22 Q70 22 70 44 L66 40 Q64 34 60 36 L60 31 Q50 35 40 31 L40 36 Q36 34 34 40Z" fill="${c}"/>`;
      case 'tuft': return `<path d="M38 30 Q44 22 54 25 Q50 28 52 32 Q46 28 40 34Z" fill="${c}"/>`;
      case 'beehive': return `<path d="M31 42 Q32 26 50 26 Q68 26 69 42 Q60 31 50 32 Q40 31 31 42Z" fill="${c}"/>`;
      case 'curly': return `${[[36, 28], [44, 25], [52, 24], [60, 26], [66, 31]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="6" fill="${c}"/>`).join('')}`;
      default: return '';
    }
  }
  function top(L) {
    const s = L.shirt, d = shade(s, 0.78);
    let t = `<path d="M14 100 Q16 76 36 70 L50 76 L64 70 Q84 76 86 100Z" fill="${s}"/>`;
    if (L.top === 'hoodie') t += `<path d="M32 72 Q50 86 68 72" stroke="${d}" stroke-width="3" fill="none"/><path d="M45 80 L44 92 M55 80 L56 92" stroke="#ddd" stroke-width="1.4" opacity=".7"/>`;
    if (L.top === 'hoodup') t = `<path d="M22 58 Q20 16 50 14 Q80 16 78 58 L86 100 L14 100Z" fill="${s}"/><path d="M14 100 Q16 76 36 70 L50 78 L64 70 Q84 76 86 100Z" fill="${d}"/>`;
    if (L.top === 'scrubs') t += `<path d="M40 72 L50 84 L60 72" stroke="${d}" stroke-width="2.5" fill="none"/><rect x="60" y="84" width="9" height="7" rx="1" fill="${d}"/>`;
    if (L.top === 'flannel') t += `<path d="M24 82 L76 82 M20 92 L80 92 M34 72 L34 100 M66 72 L66 100" stroke="${d}" stroke-width="2.2" opacity=".8"/><path d="M42 72 L50 82 L58 72" fill="#e8dcc8"/>`;
    if (L.top === 'cardigan') t += `<path d="M50 78 L50 100" stroke="${d}" stroke-width="2"/><circle cx="50" cy="86" r="1.3" fill="${d}"/><circle cx="50" cy="93" r="1.3" fill="${d}"/><path d="M42 72 L50 78 L58 72" fill="#f0ece2"/>`;
    if (L.top === 'blouse') t += `<path d="M42 72 L50 80 L58 72" fill="${d}"/>`;
    if (L.top === 'shawl') t += `<path d="M18 90 Q50 70 82 90 L82 100 L18 100Z" fill="${d}" opacity=".7"/>`;
    if (L.top === 'jersey') t += `<text x="50" y="97" font-size="13" font-weight="800" text-anchor="middle" fill="#fff" opacity=".85" font-family="system-ui">7</text>`;
    if (L.top === 'uniform') t += `<path d="M42 72 L50 82 L58 72" fill="#e8e8f0"/><rect x="60" y="80" width="8" height="6" rx="1" fill="#e7c65a"/>`;
    if (L.top === 'vest') t += `<path d="M40 72 L50 100 L60 72" fill="#eee"/><rect x="58" y="82" width="10" height="4" rx="1" fill="#fff" opacity=".8"/>`;
    if (L.lanyard) t += `<path d="M40 72 L50 90 L60 72" stroke="#5cc8b0" stroke-width="2" fill="none"/><rect x="46" y="89" width="8" height="10" rx="1" fill="#f4f4f4"/>`;
    return t;
  }
  function hat(L) {
    const c = L.hatc || '#333';
    if (L.hat === 'beanie') return `<path d="M29 40 Q28 17 50 16 Q72 17 71 40Z" fill="${c}"/><rect x="28" y="35" width="44" height="7" rx="3" fill="${shade(c, 0.8)}"/><circle cx="50" cy="14" r="4" fill="${shade(c, 1.2)}"/>`;
    if (L.hat === 'wrap') return `<path d="M28 40 Q24 12 50 11 Q76 12 72 40 Q62 30 50 31 Q38 30 28 40Z" fill="${c}"/><path d="M34 22 Q50 30 66 20 M30 32 Q50 24 70 32" stroke="${shade(c, 0.7)}" stroke-width="2.4" fill="none"/><circle cx="64" cy="16" r="6" fill="${c}"/>`;
    if (L.hat === 'police') return `<path d="M30 32 Q30 18 50 17 Q70 18 70 32Z" fill="${c}"/><rect x="26" y="30" width="48" height="6" rx="2" fill="#10182e"/><circle cx="50" cy="25" r="3.5" fill="#e7c65a"/>`;
    if (L.hat === 'conductor') return `<rect x="31" y="18" width="38" height="14" rx="3" fill="${c}"/><rect x="27" y="30" width="46" height="5" rx="2" fill="#162646"/><rect x="42" y="22" width="16" height="4" rx="1" fill="#e7c65a"/>`;
    return '';
  }
  // eyes/brows/mouth by mood
  function face(L, mood) {
    const young = L.young || 0, ey = 49, ex = 9.5, er = young ? 2.6 : 2.2, bw = (L.brow || 1) * 1.8, bc = shade(L.hair === '#d4d4dc' || L.hair === '#b9b6bf' || L.hair === '#e8e8ea' ? '#888888' : L.hair, 0.9);
    let eyes = '', brows = '', mouth = '';
    const E = (dx, dy = 0, r = er) => `<ellipse cx="${50 + dx}" cy="${ey + dy}" rx="${r}" ry="${r * 1.15}" fill="#1a1414"/><circle cx="${50 + dx + 0.8}" cy="${ey + dy - 0.9}" r="${r * 0.35}" fill="#fff" opacity=".85"/>`;
    const B = (lx1, ly1, lx2, ly2) => `<path d="M${50 - ex - 4} ${ly1} L${50 - ex + 4} ${ly2}" stroke="${bc}" stroke-width="${bw}" stroke-linecap="round"/><path d="M${50 + ex + 4} ${ly1} L${50 + ex - 4} ${ly2}" stroke="${bc}" stroke-width="${bw}" stroke-linecap="round"/>`;
    switch (mood) {
      case 'warm': eyes = `<path d="M${50 - ex - 3} ${ey + 1} Q${50 - ex} ${ey - 2.5} ${50 - ex + 3} ${ey + 1}" stroke="#1a1414" stroke-width="1.8" fill="none" stroke-linecap="round"/><path d="M${50 + ex - 3} ${ey + 1} Q${50 + ex} ${ey - 2.5} ${50 + ex + 3} ${ey + 1}" stroke="#1a1414" stroke-width="1.8" fill="none" stroke-linecap="round"/>`; brows = B(0, 42, 0, 41.5); mouth = `<path d="M43 60 Q50 66 57 60" stroke="#6b2b2b" stroke-width="2" fill="${young ? '#8a3a3a' : 'none'}" stroke-linecap="round"/>`; break;
      case 'sad': eyes = E(-ex, 1) + E(ex, 1); brows = B(0, 43, 0, 40.5); mouth = `<path d="M44 63 Q50 59 56 63" stroke="#6b2b2b" stroke-width="1.8" fill="none" stroke-linecap="round"/>`; break;
      case 'angry': eyes = E(-ex, 0.5, er * 0.9) + E(ex, 0.5, er * 0.9); brows = B(0, 41, 0, 44.5); mouth = `<path d="M44 62.5 Q50 60 56 62.5" stroke="#5b2222" stroke-width="2.2" fill="none" stroke-linecap="round"/>`; break;
      case 'worried': eyes = E(-ex, 0, er * 1.1) + E(ex, 0, er * 1.1); brows = B(0, 42.5, 0, 40); mouth = `<ellipse cx="50" cy="62" rx="2.6" ry="2" fill="#5b2222"/>`; break;
      case 'guarded': eyes = E(-ex, 0.8) + E(ex, 0.8) + `<path d="M${50 - ex - 3.2} ${ey - 1.2} L${50 - ex + 3.2} ${ey - 1.2} M${50 + ex - 3.2} ${ey - 1.2} L${50 + ex + 3.2} ${ey - 1.2}" stroke="${L.skin}" stroke-width="2.2"/>`; brows = B(0, 43, 0, 43); mouth = `<path d="M45 61.5 L55 61.5" stroke="#5b2222" stroke-width="2" stroke-linecap="round"/>`; break;
      case 'tired': eyes = `<path d="M${50 - ex - 3} ${ey} Q${50 - ex} ${ey + 2} ${50 - ex + 3} ${ey}" stroke="#1a1414" stroke-width="1.8" fill="none"/><path d="M${50 + ex - 3} ${ey} Q${50 + ex} ${ey + 2} ${50 + ex + 3} ${ey}" stroke="#1a1414" stroke-width="1.8" fill="none"/>`; brows = B(0, 43, 0, 42.5); mouth = `<path d="M46 62 Q50 63 54 62" stroke="#5b2222" stroke-width="1.8" fill="none"/>`; break;
      default: eyes = E(-ex) + E(ex); brows = B(0, 42.5, 0, 42); mouth = `<path d="M45 61 Q50 63.5 55 61" stroke="#6b2b2b" stroke-width="1.8" fill="none" stroke-linecap="round"/>`;
    }
    let x = brows + eyes + mouth;
    x += `<path d="M50 51 Q48.5 56 50.5 56.5" stroke="${shade(L.skin, 0.72)}" stroke-width="1.4" fill="none" stroke-linecap="round"/>`;
    if (L.bags || mood === 'tired') x += `<path d="M${50 - ex - 3} ${ey + 4} Q${50 - ex} ${ey + 5.5} ${50 - ex + 3} ${ey + 4} M${50 + ex - 3} ${ey + 4} Q${50 + ex} ${ey + 5.5} ${50 + ex + 3} ${ey + 4}" stroke="${shade(L.skin, 0.75)}" stroke-width="1" fill="none"/>`;
    if (L.freckles) x += [[-12, 55], [-9, 56.5], [-14, 57], [12, 55], [9, 56.5], [14, 57]].map(([dx, y]) => `<circle cx="${50 + dx}" cy="${y}" r=".7" fill="${shade(L.skin, 0.7)}"/>`).join('');
    if (young || mood === 'warm') x += `<ellipse cx="${50 - 13}" cy="57" rx="3.5" ry="2" fill="#e8807a" opacity=".28"/><ellipse cx="${50 + 13}" cy="57" rx="3.5" ry="2" fill="#e8807a" opacity=".28"/>`;
    if (L.stubble) x += `<path d="M36 58 Q38 72 50 73 Q62 72 64 58 Q60 66 50 67 Q40 66 36 58Z" fill="${shade(L.hair, 0.6)}" opacity=".28"/>`;
    if (L.beard) x += `<path d="M34 54 Q36 74 50 75 Q64 74 66 54 Q62 66 56 64 Q50 66 44 64 Q38 66 34 54Z" fill="${L.hair}"/>`;
    if (L.stache) x += `<path d="M42 58.5 Q50 55 58 58.5 Q50 60 42 58.5Z" fill="${L.hair}"/>`;
    if (L.wrinkles) x += `<path d="M${50 - ex - 7} ${ey} l-2 -1 M${50 + ex + 7} ${ey} l2 -1 M40 37.5 Q50 36 60 37.5" stroke="${shade(L.skin, 0.8)}" stroke-width=".8" fill="none"/>`;
    if (L.glasses) x += `<g fill="none" stroke="${L.glasses}" stroke-width="1.5"><circle cx="${50 - ex}" cy="${ey}" r="5.3"/><circle cx="${50 + ex}" cy="${ey}" r="5.3"/><path d="M${50 - ex + 5.3} ${ey} L${50 + ex - 5.3} ${ey}"/></g>`;
    if (L.bindi) x += `<circle cx="50" cy="40" r="1.4" fill="#c0283a"/>`;
    if (L.ring) x += `<circle cx="52.6" cy="55.6" r="1.1" fill="none" stroke="#ddd" stroke-width=".7"/>`;
    return x;
  }
  const P = SH.Portrait = { LOOK };
  P.LOOK = LOOK;
  P.has = (id) => !!LOOK[id] || ['dex', 'class', 'lighthouse'].includes(id);
  P.svg = function (id, o = {}) {
    const mood = o.mood || 'neutral', uid = 'p' + Math.random().toString(36).slice(2, 7);
    const meta = (SH.NPCS_META && SH.NPCS_META[id]) || { col: '#6b7690', ini: '?' };
    const bg = o.bg || meta.col || '#6b7690';
    const open = `<svg class="portrait" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><defs><radialGradient id="${uid}" cx=".5" cy=".3" r=".85"><stop offset="0" stop-color="${shade(bg, 1.15)}"/><stop offset="1" stop-color="${shade(bg, 0.45)}"/></radialGradient><clipPath id="${uid}c"><circle cx="50" cy="50" r="50"/></clipPath></defs><g clip-path="url(#${uid}c)"><rect width="100" height="100" fill="url(#${uid})"/>`;
    if (id === 'dex') return open + `<path d="M18 100 Q20 72 50 70 Q80 72 82 100Z" fill="#3b4150"/><circle cx="50" cy="46" r="18" fill="#3b4150"/><text x="50" y="53" text-anchor="middle" font-size="18" font-weight="800" fill="#8a93a6" font-family="system-ui">?</text></g></svg>`;
    if (id === 'class') return open + `<circle cx="34" cy="52" r="10" fill="#fff" opacity=".55"/><circle cx="66" cy="52" r="10" fill="#fff" opacity=".55"/><circle cx="50" cy="44" r="12" fill="#fff" opacity=".85"/><path d="M14 100 Q18 72 34 70 Q44 64 50 64 Q56 64 66 70 Q82 72 86 100Z" fill="#fff" opacity=".7"/></g></svg>`;
    if (id === 'lighthouse') return open + `<path d="M44 86 L47 40 L53 40 L56 86Z" fill="#fff"/><path d="M45 52 L55 52 L55.6 60 L44.4 60Z" fill="#e05260"/><path d="M53 38 L90 26 L90 50Z" fill="#ffd66b" opacity=".6"/><rect x="45" y="32" width="10" height="8" fill="#ffd66b"/></g></svg>`;
    const L = LOOK[id];
    if (!L) return open + `<text x="50" y="62" text-anchor="middle" font-size="36" font-weight="700" fill="#fff" font-family="system-ui">${meta.ini || '?'}</text></g></svg>`;
    const sk = L.skin, skd = shade(sk, 0.86);
    return open + hairBack(L) + top(L) +
      `<path d="M43 64 L43 74 Q50 78 57 74 L57 64Z" fill="${skd}"/>` +
      (L.ear ? `<circle cx="30" cy="52" r="3" fill="${skd}"/><circle cx="70" cy="52" r="3" fill="${skd}"/><circle cx="30" cy="56.5" r="1.2" fill="#e7c65a"/><circle cx="70" cy="56.5" r="1.2" fill="#e7c65a"/>` : `<circle cx="30.5" cy="52" r="3" fill="${skd}"/><circle cx="69.5" cy="52" r="3" fill="${skd}"/>`) +
      `<ellipse cx="50" cy="${L.young ? 49 : 48}" rx="${L.young === 2 ? 20 : 19}" ry="${L.young ? 21 : 22.5}" fill="${sk}"/>` +
      face(L, mood) + hairFront(L) + hat(L) + (L.pen ? `<rect x="66" y="36" width="3" height="16" rx="1" transform="rotate(20 67 44)" fill="#f2f2f2"/>` : '') +
      `</g></svg>`;
  };
  // best-guess mood from the world (no numbers shown to the player; faces do the talking)
  P.moodOf = function (id) {
    const G = SH.G; if (!G) return 'neutral';
    if (id === 'sam') { const s = G.s; if (s.stress > 72) return 'worried'; if (s.mood < 28) return 'sad'; if (s.energy < 22) return 'tired'; if (s.mood > 66 && s.stress < 40) return 'warm'; return 'neutral'; }
    if (id === 'rick') { const d = SH.rickDrunk ? SH.rickDrunk() : 0; if (d >= 2) return 'angry'; return (G.rel.rick || 0) < -30 ? 'guarded' : 'neutral'; }
    if (id === 'mom' && SH.MOM_SHIFTS && ['DD', 'N'].includes(SH.MOM_SHIFTS[SH.day()])) return (G.rel.mom || 0) > 50 ? 'tired' : 'tired';
    const r = G.rel[id]; if (r == null) return 'neutral';
    return r > 55 ? 'warm' : r < -25 ? 'guarded' : 'neutral';
  };
  P.html = (id, mood, cls = '') => `<span class="pt ${cls}">${P.svg(id, { mood: mood || P.moodOf(id) })}</span>`;
})(window.SH);
