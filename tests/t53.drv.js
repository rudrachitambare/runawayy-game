const errs=[]; p.on('pageerror', e=>errs.push(e.message)); const r=[];
await fresh();
r.push(await p.evaluate(()=>{ const g=SH.G; g.money=100; SH.Shop.order('x_solar','cash'); return 'orders '+JSON.stringify(g.shop||Object.keys(g).filter(k=>/order|shop/i.test(k))); }));
r.push(await p.evaluate(()=>{ const o=(SH.Shop.orders?SH.Shop.orders():null); return 'loc '+SH.G.loc+' t '+SH.fmt12()+' day '+SH.day(); }));
// advance to next day 12:00
await p.evaluate(()=>{ const g=SH.G; const target=g.t+1440-(g.t%1440)+12*60; while(g.t<target && !g.ended){ SH.advance(60); document.querySelector('#modal').classList.add('hidden'); } });
r.push(await p.evaluate(()=>'now '+SH.fmt12()+' day '+SH.day()+' loc '+SH.G.loc+' ready '+SH.Shop.ready().length+' phase '+SH.G.phase));
// go to the store
r.push(await p.evaluate(()=>{ try{ const o=SH.travelOptions('store')[0]; SH.travel('store',o); }catch(e){return 'travel err '+e.message;} return 'at '+SH.G.loc+' '+SH.fmt12(); }));
await p.waitForTimeout(300); await clean();
const s=await state(); r.push('acts: '+s.acts.join(' | '));
r.push('rooms/hotspots: '+await p.evaluate(()=>JSON.stringify((SH.Actions.list().rooms||[]).map(x=>x.label||x.n||x.id)).slice(0,300)));
r.push('stage text: '+await p.evaluate(()=>(document.querySelector('#stage, .stage')||document.body).innerText.replace(/\s+/g,' ').slice(0,400)));
return r.join('\n')+'\nERRS '+errs.join('|');
