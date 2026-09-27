await goTown('p6'); await p.evaluate(()=>{ SH.G.t=Math.floor(SH.G.t/1440)*1440+11*60; SH.G.bag.push('charger'); }); await go('library'); 
const r=[];
for (let i=0;i<3;i++){ await p.evaluate(()=>{ SH.G.phone.bat=20; document.querySelector('#modal').classList.add('hidden'); }); r.push(JSON.stringify(await state().then(s=>s.acts.filter(a=>/harg/i.test(a))))); r.push(await act('Charge your phone')); r.push(await p.evaluate(()=>SH.G.phone.bat+' charger:'+SH.has('charger')+' bag:'+SH.G.bag.join(','))); await p.waitForTimeout(300); }
return r.join('\n');
