const errs=[]; p.on('pageerror', e=>errs.push(e.message));
const out=[];
await goTown('p1'); await go('edge');
out.push(await p.evaluate(()=>{ const g=SH.G, o=[]; const tb=SH.UI.toast; const T=[]; SH.UI.toast=x=>T.push(x);
  g.bag.push('x_stove','x_ramen','x_filter'); document.querySelector('#modal').classList.add('hidden');
  SH.Actions.useItem('x_stove'); o.push('stove: '+(T.pop()||[...document.querySelectorAll('#log .entry, #log > div')].slice(-1)[0].innerText.slice(0,120)));
  document.querySelector('#modal').classList.add('hidden'); SH.Actions.useItem('x_filter'); o.push('filter: '+(T.pop()||[...document.querySelectorAll('#log .entry, #log > div')].slice(-1)[0].innerText.slice(0,120)));
  SH.UI.toast=tb; return o.join('\n'); }));
// phone dialer
out.push(await p.evaluate(()=>{ document.querySelector('#modal').classList.add('hidden'); SH.Phone.open('calls'); return 'pad: '+!!document.querySelector('#dialpad')+' contacts: '+document.querySelectorAll('#pbody .contact').length; }));
await p.evaluate(()=>{ for (const k of ['9','1','1','call']) document.querySelector(`#dialpad button[data-k="${k}"]`).click(); });
await new Promise(r=>setTimeout(r,500));
out.push('modal: '+await p.evaluate(()=>{ const m=document.querySelector('#modal:not(.hidden)'); return m? m.innerText.slice(0,400):null; }));
await choose('I ran away');
await new Promise(r=>setTimeout(r,800));
out.push('after: ended='+await p.evaluate(()=>SH.G.ended)+' modal: '+await p.evaluate(()=>{ const m=document.querySelector('#modal:not(.hidden)'); return m? m.innerText.slice(0,300):null; }));
// village + 100
await goTown('p3'); await go('main');
await p.evaluate(()=>{ document.querySelector('#modal').classList.add('hidden'); SH.Phone.open('calls'); SH.G.phone.data=0; SH.Phone.dial('100'); });
await new Promise(r=>setTimeout(r,500));
out.push('village modal: '+await p.evaluate(()=>{ const m=document.querySelector('#modal:not(.hidden)'); return m? m.innerText.slice(0,200):null; }));
await choose('I ran away'); await new Promise(r=>setTimeout(r,800));
out.push('village after: '+await p.evaluate(()=>{ const m=document.querySelector('#modal:not(.hidden)'); return m? m.innerText.slice(0,250):null; }));
// other numbers
out.push(await p.evaluate(()=>{ const T=[]; const tb=SH.UI.toast; SH.UI.toast=x=>T.push(x); SH.G.ended=0; document.querySelector('#modal').classList.add('hidden'); SH.Phone.dial('5551234'); SH.Phone.dial('42'); SH.UI.toast=tb; return T.join(' / '); }));
return out.join('\n')+'\nERRS '+errs.join('|');
