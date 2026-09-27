await goTown('p2');
return await p.evaluate(()=>{ const g=SH.G; const o=[]; let last=SH.day(); let guard=0;
 while(SH.day()<14 && guard++<2000 && !g.ended){ SH.advance(60,{interrupt:false}); document.querySelector('#modal').classList.add('hidden'); if(SH.day()!==last){ last=SH.day(); o.push('d'+last+':'+Math.round(g.heat)); g.s.full=80; g.s.energy=80; g.s.health=90; g.s.warmth=70; } }
 return o.join(' ')+' ended='+g.ended; });
