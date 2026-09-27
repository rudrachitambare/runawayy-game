const errs=[]; p.on('pageerror', e=>errs.push(e.message)); const r=[];
await fresh();
r.push(await p.evaluate(()=>'stash '+JSON.stringify(SH.G.stash)+' puffs '+SH.G.puffs));
r.push(await p.evaluate(()=>{ for(let i=0;i<30;i++) SH.advance(60); return 'advanced ok, ended '+!!SH.G.ended; }));
r.push(await p.evaluate(()=>'left panel inhaler? '+/inhaler|puffs/i.test(document.body.innerText)));
// old save migration
r.push(await p.evaluate(()=>{ const g=SH.G; g.bag.push('inhaler','x_inhaler2'); g.puffs=30; localStorage.setItem('smallhours_save', JSON.stringify(g)); SH.load(); return 'migrated bag '+SH.G.bag.includes('inhaler')+' '+SH.G.bag.includes('x_inhaler2')+' puffs '+SH.G.puffs; }));
await goTown('p6'); r.push('town ok '+(await state()).loc);
await clean(); await p.screenshot({path:'shots/t51.png'});
return r.join('\n')+'\nERRS '+errs.join('|');
