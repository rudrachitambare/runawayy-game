const errs=[]; p.on('pageerror', e=>errs.push(e.message)); const r=[];
// 1) village: away nulled then found
await goTown('p3'); await clean();
r.push('loc '+await p.evaluate(()=>SH.G.loc+' away '+JSON.stringify(SH.G.away)));
r.push(await p.evaluate(()=>{ const g=SH.G; const a=g.away; g.away=null; SH.Endings.found('away'); const m=document.querySelector('#modal:not(.hidden)'); return 'after found: ended '+!!g.ended+' away '+JSON.stringify(g.away)+' modal '+(m?m.innerText.slice(0,120):'none'); }));
r.push(await p.evaluate(()=>{ try{ SH.Talk && SH.Talk.open && SH.Talk.open('officer'); }catch(e){return 'talk err '+e.message;} return 'talk cur '+(SH.Talk.cur?SH.Talk.cur.id||'open':'none'); }));
r.push(await p.evaluate(()=>{ SH.UI.dialog({title:'Found', text:['A deputy walks up.'], choices:[{t:'ok',fn:()=>{}}]}); const m=document.querySelector('#modal:not(.hidden)'); return 'found dialog shown: '+(m?/deputy/.test(m.innerText):false); }));
// 2) gas phone in village
await p.evaluate(()=>{ SH.G.t=Math.floor(SH.G.t/1440)*1440+11*60; SH.G.money=100; document.querySelector('#modal').classList.add('hidden'); });
r.push('go gas '+await go('gas')); await clean();
r.push('acts '+(await state()).acts.filter(a=>/phone|data|bucket/i.test(a)).join(' | '));
await p.evaluate(()=>{ SH.G.phone.confiscated=true; SH.G.phone.bat=0; });
r.push('acts conf '+(await state()).acts.filter(a=>/phone|data|bucket/i.test(a)).join(' | '));
r.push(await act('prepaid phone')); await p.waitForTimeout(200);
r.push(await p.evaluate(()=>'conf '+SH.G.phone.confiscated+' bat '+SH.G.phone.bat+' money '+SH.G.money+' ok '+SH.Phone.ok()+' | '+(document.querySelector('#modal:not(.hidden)')||{innerText:''}).innerText.slice(0,200)));
await choose('Okay');
r.push(await act('bucket')); r.push('bag bucket '+await p.evaluate(()=>SH.G.bag.includes('x_bucket')));
// 3) business solo in town p6
await goTown('p6'); await p.evaluate(()=>{ SH.G.t=Math.floor(SH.G.t/1440)*1440+10*60; SH.G.money=100; SH.G.bag.push('x_bucket'); });
r.push(await p.evaluate(()=>{ SH.Biz.menu(SH.Atlas.here? (SH.Atlas.data().places.find(x=>x.id==='p6')):null); return document.querySelector('#modal:not(.hidden)').innerText.replace(/\s+/g,' ').slice(0,400); }));
return r.join('\n')+'\nERRS '+errs.join('|');
