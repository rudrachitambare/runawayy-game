/* SMALL HOURS — web kit: every site gets the same usable building blocks.
   B.head(site, sub)      branded header bar (icon, name, tagline) in the site's color
   B.tabs(list, active)   tab strip: [[url, label, key]...]
   B.row(o)               tappable list row {t, sub, right, go, js, icon}
   B.inp(id, ph, val, enter, list)  text input; Enter runs `enter` (a JS string); list = datalist id
   B.sel(id, opts, val)   select: opts [[value, label]...]
   B.note(html, kind)     banner: info | good | warn | bad
   B.flash(html, kind)    banner shown once on the next page render (confirmations)
   B.places()             <datalist id="avpl"> of every place name (autocomplete for from/to fields)
   B.val(id)              read an input's value
   Sites without their own header get B.head() added automatically (site.own = true opts out). */
(function (SH) {
  const B = SH.Browser, P = SH.Phone; if (!B || !P) return;
  const esc = B.esc;
  B.head = (s, sub) => `<div class="wsh" style="background:${s.col || '#333'}"><span class="wsi">${s.icon || '🌐'}</span><div style="min-width:0"><b>${esc(s.n)}</b>${sub ? `<small>${sub}</small>` : ''}</div></div>`;
  B.tabs = (L, act) => `<div class="wtabs">${L.map(([u, l, k]) => `<a href="#" class="${k === act ? 'on' : ''}" onclick="SH.Browser.go('${u}');return false">${l}</a>`).join('')}</div>`;
  B.row = (o) => {
    const click = o.go ? `SH.Browser.go('${o.go}')` : o.js || '';
    return `<div class="wrow${click ? ' tap' : ''}" ${click ? `onclick="${click}"` : ''}>${o.icon ? `<span class="wri">${o.icon}</span>` : ''}<div class="wrm"><div class="wrt">${o.t}</div>${o.sub ? `<div class="wrs">${o.sub}</div>` : ''}</div>${o.right ? `<div class="wrr">${o.right}</div>` : ''}${click && !o.noArrow ? '<span class="wra">›</span>' : ''}</div>`;
  };
  B.inp = (id, ph, val, enter, list) => `<input id="${id}" class="winp" placeholder="${esc(ph || '')}" value="${esc(val || '')}"${enter ? ` data-enter="${esc(enter)}"` : ''}${list ? ` list="${list}"` : ''} autocomplete="off">`;
  B.sel = (id, opts, val) => `<select id="${id}" class="winp">${opts.map(([v, l]) => `<option value="${esc(v)}"${String(v) === String(val) ? ' selected' : ''}>${esc(l)}</option>`).join('')}</select>`;
  B.note = (h, k) => `<div class="wnote ${k || 'info'}">${h}</div>`;
  B.pill = (t, c) => `<span class="wpill" style="${c ? `background:${c}33;color:${c};border-color:${c}66` : ''}">${t}</span>`;
  B.val = (id) => { const e = document.getElementById(id); return e ? e.value.trim() : ''; };
  B.flash = (h, k) => { B._flash = B.note(h, k || 'good'); };
  B.places = () => { const D = SH.Atlas && SH.Atlas.data(); if (!D) return ''; return `<datalist id="avpl">${D.places.map((p) => `<option value="${esc(p.name)}">`).join('')}</datalist>`; };
  B.findPlace = (q) => {
    q = String(q || '').trim(); if (!q || !SH.Atlas) return null; const D = SH.Atlas.data(), ql = q.toLowerCase();
    return D.places.find((p) => p.name.toLowerCase() === ql) || D.places.find((p) => p.name.toLowerCase().startsWith(ql)) || (SH.PIP && SH.PIP.findPlace ? SH.PIP.findPlace(q) : null) || D.places.find((p) => p.name.toLowerCase().includes(ql));
  };
  // Enter-to-submit, flash banners, and the automatic header
  const bR = P.render;
  P.render = function () {
    const r = bR.apply(this, arguments);
    document.querySelectorAll('#pbody input[data-enter]').forEach((i) => { if (i._we) return; i._we = 1; i.addEventListener('keydown', (e) => { e.stopPropagation(); if (e.key === 'Enter') { e.preventDefault(); try { new Function(i.dataset.enter)(); } catch (x) { console.warn(x); } } }); });
    return r;
  };
  const wrapAll = () => Object.entries(B.SITES).forEach(([d, s]) => {
    if (s._wrapped || typeof s.render !== 'function') return; const inner = s.render; s._wrapped = true;
    s.render = function () {
      let h = inner.apply(this, arguments); const f = B._flash || ''; B._flash = null;
      if (h.includes('<!--flash-->')) return h.replace('<!--flash-->', f); // site says where banners go
      return (!s.own && !/class="wsh"/.test(h) ? B.head(s, s.sub) : '') + f + h;
    };
  });
  B.wrapAll = wrapAll;
  const bGo = B.go; B.go = function () { wrapAll(); return bGo.apply(this, arguments); };
  document.addEventListener('DOMContentLoaded', () => setTimeout(wrapAll, 200));
})(window.SH);
