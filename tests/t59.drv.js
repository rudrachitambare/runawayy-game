const errs=[]; p.on('pageerror', e=>errs.push(e.message)); const r=[];
await goTown('p1');
await p.evaluate(()=>{ const g=SH.G; g.heat=10; g.cover=g.cover||{}; g.cover[g.away]={name:'Sean',story:'moved',told:1}; document.querySelector('#modal').classList.add('hidden'); });
const foundOnce = async (label, reason) => {
  await p.evaluate((rs)=>{ document.querySelector('#modal').classList.add('hidden'); SH.Endings.found(rs); }, reason);
  await p.waitForTimeout(200);
  const m = await p.evaluate(()=>{ const m=document.querySelector('#modal:not(.hidden)'); return m? m.innerText.replace(/\s+/g,' ').slice(0,200):null; });
  if (!m) { r.push(label+': no found dialog. log: '+await p.evaluate(()=>document.querySelector('#log').innerText.replace(/\s+/g,' ').slice(0,200))); return; }
  r.push(label+' dialog: '+m.slice(0,170));
  await choose('Talk to her'); await p.waitForTimeout(200);
  const tr = await convo(["Sorry officer, my family just moved here.", "I'm Sean", "Yes sir, thank you", "Thank you, officer"]);
  await p.waitForTimeout(300); await p.evaluate(()=>{ const b=document.querySelector('#tdone'); b&&b.click(); }); await p.waitForTimeout(300);
  r.push('  -> '+tr.slice(-3).join(' / ').slice(0,200)+' | ended '+await p.evaluate(()=>!!SH.G.ended)+' talks '+await p.evaluate(()=>JSON.stringify(SH.G.copTalks)));
};
r.push('patrol name: '+await p.evaluate(()=>SH.Police.copName(SH.Atlas.here())));
await foundOnce('1','sheriff');
await foundOnce('1b same day','sheriff');
await p.evaluate(()=>{ SH.G.t+=1500; }); await foundOnce('2 next day','sheriff');
await p.evaluate(()=>{ SH.G.t+=1500; SH.G._exGrace=0; }); await foundOnce('3 exhausted','exhausted');
r.push('closeIn: '+await p.evaluate(()=>{ SH.G.awayNotice=99; SH.Atlas.noticed(SH.Atlas.here(),0.5); return 'talk '+!!(SH.Talk.cur&&!SH.Talk.cur.ended)+' notice '+SH.G.awayNotice; }));
return r.join('\n')+'\nERRS '+errs.join('|');
