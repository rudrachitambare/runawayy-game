await goTown('p1'); await go('gas');
return await p.evaluate(()=>{ const g=SH.G,o=[]; const T=[]; const tb=SH.UI.toast; SH.UI.toast=x=>T.push(x);
 const last=()=>T.pop()||document.querySelector('#log .le.fresh:last-child, #log .lb .le:last-child').innerText.replace(/\s+/g,' ').slice(0,110);
 g.phone.bat=20; g.bag.push('x_powerbank','x_radio','x_earbuds','x_pillow','x_book');
 for (const id of ['x_powerbank','x_powerbank','x_radio','x_earbuds','x_earbuds','x_book']) { document.querySelector('#modal').classList.add('hidden'); if(id==='x_powerbank') g.phone.bat=Math.min(g.phone.bat,30); SH.Actions.useItem(id); o.push(id+': '+last()+' bat '+Math.round(g.phone.bat)); }
 const a=SH.insulation(true); g.bag=g.bag.filter(x=>x!=='x_pillow'); o.push('pillow sleep ins diff '+(a-SH.insulation(true)));
 SH.UI.toast=tb; return o.join('\n'); });
