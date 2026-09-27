const errs=[]; p.on('pageerror', e=>errs.push(e.message)); const r=[];
await goTown('p1'); await p.evaluate(()=>{ SH.G.t=Math.floor(SH.G.t/1440)*1440+11*60; SH.G.bag.push('charger'); SH.addBag('powerbank', true); }); await go('library'); await clean();
const bank = () => p.evaluate(()=>JSON.stringify(SH.G.banks.powerbank)+' bat '+Math.round(SH.G.phone.bat));
r.push('start '+await bank());
// drain it: 3 uses from 0% phone
for (let i=0;i<4;i++){ await p.evaluate(()=>{ SH.G.phone.bat=0; SH.G._lb=0; document.querySelector('#modal').classList.add('hidden'); }); const T=await p.evaluate(()=>{ const T=[]; const tb=SH.UI.toast; SH.UI.toast=x=>T.push(x); SH.Actions.useItem('powerbank'); SH.UI.toast=tb; return T.join(''); }); r.push('use'+i+' '+(T||'')+' '+await bank()); }
// charge at outlet via tapping the charger item, phone at 20
await p.evaluate(()=>{ SH.G.phone.bat=20; document.querySelector('#modal').classList.add('hidden'); SH.Actions.useItem('charger'); });
r.push('after 1h outlet (tap charger) '+await bank());
await p.evaluate(()=>{ document.querySelector('#modal').classList.add('hidden'); SH.Actions.useItem('charger'); });
r.push('after 2nd hour (phone full) '+await bank());
// no outlet: go to park
await go('park'); r.push('park tap: '+await p.evaluate(()=>{ const T=[]; const tb=SH.UI.toast; SH.UI.toast=x=>T.push(x); document.querySelector('#modal').classList.add('hidden'); SH.Actions.useItem('charger'); SH.UI.toast=tb; return T.join(''); }));
// lifetime: simulate 20 charges
r.push(await p.evaluate(()=>{ const b=SH.G.banks.powerbank; let n=0; while(SH.G.bag.includes('powerbank') && n<40){ b.left=300; SH.G.phone.bat=0; SH.G._lb=0; document.querySelector('#modal').classList.add('hidden'); SH.Actions.useItem('powerbank'); n++; } return 'broke after '+n+' uses, in bag '+SH.G.bag.includes('powerbank')+' | '+[...document.querySelectorAll('#log .lb:first-of-type .le, #log .le')].slice(0,2).map(e=>e.innerText.replace(/\s+/g,' ').slice(0,120)).join(' / '); }));
// catalog big bank
r.push(await p.evaluate(()=>{ SH.Catalog.give('x_powerbank2'); return JSON.stringify(SH.G.banks.x_powerbank2)+' desc '+SH.ITEMS.x_powerbank2.d; }));
return r.join('\n')+'\nERRS '+errs.join('|');
