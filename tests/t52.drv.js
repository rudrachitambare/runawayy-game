const errs=[]; p.on('pageerror', e=>errs.push(e.message)); const r=[];
await goTown('p6');
await p.evaluate(()=>{ const g=SH.G; g.party=['jordan','priya']; g.money=200; window._log=[]; const P=SH.Phone; const b=P.push; P.push=function(id,from,text){ const before=(SH.G.threads[id]||[]).length; const res=b.apply(this,arguments); const after=(SH.G.threads[id]||[]).length; if(from!=='me'&&from!=='sys') window._log.push((after>before?'IN ':'held ')+id+'/'+from+': '+String(text).slice(0,70)); return res; }; });
// phase A: no burner, 24h
await p.evaluate(()=>{ for(let i=0;i<24;i++){ SH.advance(60); document.querySelector('#modal').classList.add('hidden'); } });
r.push('--- no burner (party jordan,tyler):'); r.push(...(await p.evaluate(()=>window._log.splice(0))).slice(0,40));
await p.evaluate(()=>{ SH.GasPhone.burner(); document.querySelector('#modal').classList.add('hidden'); });
r.push('bag after burner: '+await p.evaluate(()=>JSON.stringify(SH.G.bag)));
await p.evaluate(()=>{ for(let i=0;i<48;i++){ SH.advance(60); document.querySelector('#modal').classList.add('hidden'); } });
r.push('--- with burner:'); r.push(...(await p.evaluate(()=>window._log.splice(0))).slice(0,40));
return r.join('\n')+'\nERRS '+errs.join('|');
