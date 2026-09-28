const errs=[]; p.on('pageerror', e=>errs.push(e.message)); const r=[];
await goTown('p6');
const L = () => p.evaluate(()=>document.querySelector('#log').innerText.replace(/\s+/g,' ').slice(0,220));
const M = () => p.evaluate(()=>{ const m=document.querySelector('#modal:not(.hidden)'); return m? m.innerText.replace(/\s+/g,' ').slice(0,160):null; });
await p.evaluate(()=>{ const g=SH.G; g.missingAt=g.t-7*1440; g.s.full=30; g._exWarn=0; document.querySelector('#modal').classList.add('hidden'); for(let i=0;i<2;i++) SH.advance(60); });
r.push('warn log: '+await L());
// force daily check: set low and run the event
await p.evaluate(()=>{ const g=SH.G; g.s.full=10; document.querySelector('#modal').classList.add('hidden'); const h=SH.hour(); for(let i=0;i<30;i++){ SH.advance(60); g.s.full=10; if(document.querySelector('#modal:not(.hidden)')) break; } });
r.push('1st: '+await M()+' ended '+await p.evaluate(()=>!!SH.G.ended));
await choose('Get up'); await p.waitForTimeout(200);
r.push('after get up: ended '+await p.evaluate(()=>!!SH.G.ended+' collapse '+SH.G._exCollapse+' t '+SH.G.t+' health '+SH.G.s.health));
await p.evaluate(()=>{ const g=SH.G; document.querySelector('#modal').classList.add('hidden'); for(let i=0;i<30;i++){ SH.advance(60); g.s.full=10; if(document.querySelector('#modal:not(.hidden)')||g.ended) break; } });
r.push('2nd: '+await M());
// gas station cash
await p.evaluate(()=>{ const g=SH.G; if(g.ended){} });
return r.join('\n')+'\nERRS '+errs.join('|');
