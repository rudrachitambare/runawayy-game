const errs=[]; p.on('pageerror', e=>errs.push(e.message)); const r=[];
for (const reason of ['exhausted','cedarLost','self']) {
  await goTown('p6'); await p.evaluate((reason)=>{ const g=SH.G; g.t=Math.floor(g.t/1440)*1440+14*60; document.querySelector('#modal').classList.add('hidden'); g.heat=40; g.away=null; SH.Endings.found(reason); }, reason); await p.waitForTimeout(300); await choose('Talk to her');
  await p.waitForTimeout(400);
  const tr = await convo(['Sorry officer, my family just moved here', "I'm Sean", 'Yes ma\'am, thank you.', 'Thank you officer']);
  await p.waitForTimeout(400); await p.evaluate(()=>{ const b=document.querySelector('#tdone'); b&&b.click(); }); await p.waitForTimeout(500); r.push(reason+': '+tr.slice(1).join(' / ').slice(0,400)+' || ended '+await p.evaluate(()=>!!SH.G.ended+' grace '+(SH.G._exGrace>SH.G.t)));
}
return r.join('\n')+'\nERRS '+errs.join('|');
