const errs=[]; p.on('pageerror', e=>errs.push(e.message)); const r=[];
await goTown('p6'); await go('gas'); await p.evaluate(()=>{ SH.G.money=50; SH.G.t=Math.floor(SH.G.t/1440)*1440+12*60; document.querySelector('#modal').classList.add('hidden'); });
r.push('loc '+await p.evaluate(()=>SH.G.loc));
r.push(await act('Load cash onto PocketPal'));
r.push(await p.evaluate(()=>'money '+SH.G.money+' bal '+SH.Bank.state().bal+' log '+JSON.stringify(SH.Bank.state().log[0])+' toast '+[...document.querySelectorAll('.toast,.toast2')].map(e=>e.innerText).join('|')));
return r.join('\n')+'\nERRS '+errs.join('|');
