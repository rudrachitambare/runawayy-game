await goTown('p3');
return await p.evaluate(()=>{ const o={};
 o.wlen=SH.WEATHER.length; o.w=[1,10,25,40,80,120].map(d=>{const w=SH.weatherDay(d); return d+':'+w.lo+'-'+w.hi+w.c;}).join(' ');
 const g=SH.G; o.heat0=g.heat;
 for(let i=0;i<20;i++){ SH.advance(600,{interrupt:false}); document.querySelector('#modal').classList.add('hidden'); if(g.ended) break; }
 o.heatLater=g.heat+' day '+SH.day()+' ended '+g.ended;
 o.temp=[SH.tempF()]; o.places=SH.Atlas.data().places.slice(0,8).map(p=>p.id+':'+p.tier+':'+(p.biome||'')+':'+Math.round(p.dist||p.mi||0)).join(' ');
 return o; });
