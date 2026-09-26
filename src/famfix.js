/* SMALL HOURS — the rolled family everywhere.
   family.js renames the default cast (Rick / Lily / Dana Reyes / Hollis / Grandma Rose / "stepdad") through SH.nm,
   but lots of UI writes text straight to the page (scene header, hotspot labels, side panel, props, endings,
   phone notes...) or paints it on the canvas, so the old default names leaked through.
   This is a safety net: any text that reaches the page or the canvas goes through the same renamer.
   It costs nothing when your family happens to use the default names. */
(function (SH) {
  const OLD = /\b(Rick|RICK|Lily|LILY|Dana|Hollis|Reyes|Rose|step-?dad|stepfather|Sam|SAM)\b/i;
  const on = () => { const G = SH.G, f = G && G.fam; if (!f) return false; return f.rick !== 'Rick' || f.sib !== 'Lily' || f.mom !== 'Dana' || f.momS !== 'Reyes' || f.rickS !== 'Hollis' || f.gma !== 'Rose' || f.role !== 'stepdad' || (G.name && G.name !== 'Sam') || f.gender !== 'm'; };
  const fix = (s) => (typeof s === 'string' && s && OLD.test(s) && on()) ? SH.nm(s) : s;
  SH.famFix = fix;

  /* ---------- the page ---------- */
  const SKIP = /^(SCRIPT|STYLE|TEXTAREA|INPUT|NOSCRIPT)$/;
  const ATTRS = ['title', 'placeholder', 'aria-label', 'alt'];
  let busy = false;
  const fixText = (n) => { const p = n.parentNode; if (!p || SKIP.test(p.nodeName) || (p.isContentEditable)) return; const v = n.nodeValue, w = fix(v); if (w !== v) n.nodeValue = w; };
  const fixEl = (el) => { if (SKIP.test(el.nodeName)) return; for (const a of ATTRS) { const v = el.getAttribute && el.getAttribute(a); if (v) { const w = fix(v); if (w !== v) el.setAttribute(a, w); } } };
  const walk = (root) => {
    if (root.nodeType === 3) return fixText(root);
    if (root.nodeType !== 1 || SKIP.test(root.nodeName)) return;
    fixEl(root);
    const tw = document.createTreeWalker(root, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT);
    let n; while ((n = tw.nextNode())) { if (n.nodeType === 3) fixText(n); else fixEl(n); }
  };
  const mo = new MutationObserver((list) => {
    if (busy || !on()) return; busy = true;
    try { for (const m of list) { if (m.type === 'characterData') fixText(m.target); else if (m.type === 'attributes') fixEl(m.target); else m.addedNodes.forEach(walk); } }
    finally { mo.takeRecords(); busy = false; }
  });
  const start = () => { mo.observe(document.body, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ATTRS }); if (on()) walk(document.body); };
  if (document.body) start(); else document.addEventListener('DOMContentLoaded', start);
  SH.famFixAll = () => { if (on()) walk(document.body); };

  /* ---------- the canvas (scene labels, speech bubbles, signs) ---------- */
  const C = window.CanvasRenderingContext2D && CanvasRenderingContext2D.prototype;
  if (C && !C._fam) { C._fam = 1; ['fillText', 'strokeText', 'measureText'].forEach((k) => { const f = C[k]; C[k] = function (t) { if (typeof t === 'string' && OLD.test(t)) { const a = [...arguments]; a[0] = fix(t); return f.apply(this, a); } return f.apply(this, arguments); }; }); }

  /* after a load / new game, fix what's already on screen */
  ['newGame', 'load'].forEach((k) => { const b = SH[k]; if (typeof b === 'function' && !b._fam) { SH[k] = function () { const r = b.apply(this, arguments); setTimeout(SH.famFixAll, 0); return r; }; SH[k]._fam = 1; } });
})(window.SH);
