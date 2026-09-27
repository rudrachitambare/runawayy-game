await goTown('p1');
return await p.evaluate(()=>{ SH.G._vol=1; SH.Endings.found('sheriff'); document.querySelector('#modal').classList.add('hidden'); SH.G.ended=false; SH.X && 0; SH.Endings.foundEnd('sheriff'); return SH.NPCS_META.officer.n+' | '+document.querySelector('#modal').innerText.slice(0,700).replace(/\n+/g,' '); });
