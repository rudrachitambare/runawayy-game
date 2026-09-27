const errs=[]; p.on('pageerror', e=>errs.push(e.message)); const out=[];
await goTown('p2');
out.push(await p.evaluate(()=>{ const o=[]; o.push('wx p2: '+[1,20,40,60,100,150,200].map(d=>{const w=SH.weatherDay(d); return d+':'+w.lo+'-'+w.hi+w.c;}).join(' '));
  const a=SH.G.away; SH.G.away='p3'; o.push('wx p3: '+[1,20,40,60,100].map(d=>{const w=SH.weatherDay(d); return d+':'+w.lo+'-'+w.hi+w.c;}).join(' ')); SH.G.away=a;
  const cs={}; for(let d=32;d<150;d++){ const c=SH.weatherDay(d).c; cs[c]=(cs[c]||0)+1; } o.push('conds d32-150 '+JSON.stringify(cs));
  return o.join('\n'); }));
// heat over 10 days
out.push(await p.evaluate(()=>{ const g=SH.G, h=[]; for(let i=0;i<10;i++){ for(let j=0;j<4;j++){ SH.advance(360,{interrupt:false}); document.querySelector('#modal').classList.add('hidden'); } if(g.ended) break; h.push(Math.round(g.heat)); } return 'heat by day: '+h.join(' ')+' ended='+g.ended; }));
// stuff
await goTown('p1');
out.push(await p.evaluate(()=>{ SH.Catalog.give('x_tent1'); SH.Catalog.give('x_bmx'); SH.UI.afterAction(); return 'owned in p1: '+SH.G.owned.join(','); }));
await p.evaluate(()=>{ const to=SH.Atlas.data().places.find(x=>x.id==='p6'); SH.Atlas.arrive(to,{k:'bus',mins:60,e:5,cost:0}); SH.UI.afterAction(); });
await p.waitForTimeout(400);
out.push(await p.evaluate(()=>'in p6 owned: '+SH.G.owned.join(',')+' stored '+JSON.stringify(SH.G.stored)+' | '+[...document.querySelectorAll('#log .le')].slice(0,6).map(e=>e.innerText.replace(/\s+/g,' ')).filter(t=>/behind|where you left/.test(t)).join(' / ')));
await p.evaluate(()=>{ document.querySelector('#modal').classList.add('hidden'); const to=SH.Atlas.data().places.find(x=>x.id==='p1'); SH.Atlas.arrive(to,{k:'bus',mins:60,e:5,cost:0}); SH.UI.afterAction(); });
await p.waitForTimeout(400);
out.push(await p.evaluate(()=>'back p1 owned: '+SH.G.owned.join(',')+' stored '+JSON.stringify(SH.G.stored)));
// shoplift
await go('gas');
out.push(await p.evaluate(()=>{ const T=[]; const tb=SH.UI.toast; SH.UI.toast=x=>T.push(x); const r=[]; for(let i=0;i<6;i++){ document.querySelector('#modal').classList.add('hidden'); SH.Actions.shoplift(); const L=Object.values(SH.G.lift)[0]; r.push(L.n+'/'+(L.caught>0?'C':'-')+(T.length?'T':'')); T.length=0; } SH.UI.toast=tb; return 'lift: '+r.join(' '); }));
// officer
out.push(await p.evaluate(()=>{ document.querySelector('#modal').classList.add('hidden'); SH.G._vol=1; SH.Endings.found('sheriff'); return document.querySelector('#modal').innerText.slice(0,400).replace(/\n+/g,' '); }));
return out.join('\n')+'\nERRS '+errs.join('|');
