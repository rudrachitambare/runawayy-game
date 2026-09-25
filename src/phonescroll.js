/* Drag-to-scroll inside the phone for mouse users (scrollbars are hidden, so give them a grip). */
(function () {
  const scroller = (el) => { for (; el && el.id !== 'screen'; el = el.parentElement) { if (el.scrollHeight > el.clientHeight + 2 && /auto|scroll/.test(getComputedStyle(el).overflowY)) return el; } return null; };
  let st = null, moved = false;
  document.addEventListener('mousedown', (e) => {
    if (e.button !== 0 || !e.target.closest || !e.target.closest('#pbody') || e.target.closest('input,textarea,select,svg')) return;
    const el = scroller(e.target); if (!el) return; st = { el, y: e.clientY, top: el.scrollTop }; moved = false;
  });
  document.addEventListener('mousemove', (e) => {
    if (!st) return; const dy = e.clientY - st.y;
    if (!moved && Math.abs(dy) > 6) { moved = true; document.querySelector('#pbody').classList.add('dragging'); }
    if (moved) { st.el.scrollTop = st.top - dy; e.preventDefault(); }
  });
  document.addEventListener('mouseup', () => { if (!st) return; st = null; const pb = document.querySelector('#pbody'); pb && pb.classList.remove('dragging'); });
  // a drag shouldn't also count as a tap on whatever was under the cursor
  document.addEventListener('click', (e) => { if (moved && e.target.closest && e.target.closest('#pbody')) { e.stopPropagation(); e.preventDefault(); moved = false; } }, true);
})();
