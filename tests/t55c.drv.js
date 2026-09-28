const errs=[]; p.on('pageerror', e=>errs.push(e.message)); const r=[];
await goTown('p6'); await p.evaluate(()=>{ const g=SH.G; g.t=Math.floor(g.t/1440)*1440+14*60; document.querySelector('#modal').classList.add('hidden'); SH.G.cover={[g.away]:{name:'Jamie',story:'moved',told:[]}}; g.heat=40; g.away=null; SH.Endings.found('away'); }); await p.waitForTimeout(300); await choose('Talk to her'); await p.waitForTimeout(400);
r.push(JSON.stringify(await convo(['shut up', 'my grandma lives here', "i'm Tyler", 'whatever', 'ok'])));
await p.waitForTimeout(400); r.push('tdone '+await p.evaluate(()=>!!document.querySelector('#tdone')));
await p.evaluate(()=>{ const b=document.querySelector('#tdone'); b&&b.click(); }); await p.waitForTimeout(600);
r.push('modal: '+await p.evaluate(()=>{const m=document.querySelector('#modal:not(.hidden)'); return m? m.innerText.replace(/\s+/g,' ').slice(0,250):'none';}));
await p.evaluate(()=>{ const b=[...document.querySelectorAll('#modal .act')].find(x=>/Go with them/.test(x.innerText)); b&&b.click(); }); await p.waitForTimeout(600);
r.push('after go: ended '+await p.evaluate(()=>!!SH.G.ended)+' '+await p.evaluate(()=>{const m=document.querySelector('#modal:not(.hidden)'); return m? m.innerText.replace(/\s+/g,' ').slice(0,120):'none';}));
return r.join('\n')+'\nERRS '+errs.join('|');
