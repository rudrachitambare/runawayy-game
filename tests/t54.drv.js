const errs=[]; p.on('pageerror', e=>errs.push(e.message)); const r=[];
const M=()=>p.evaluate(()=>{const m=document.querySelector('#modal:not(.hidden)'); return m? m.innerText.replace(/\s+/g,' ').replace(/\d+:\d+ [AP]M · \w+, \w+ \d+/,'').slice(0,420):'none';});
// A) notice 100 in small town -> cop talk, not ending
await goTown('p1'); await p.evaluate(()=>{ SH.G.t=Math.floor(SH.G.t/1440)*1440+13*60; document.querySelector('#modal').classList.add('hidden'); });
r.push('tier '+await p.evaluate(()=>SH.Atlas.here().tier+' PD '+SH.Atlas.here().hasPolice));
await p.evaluate(()=>{ SH.G.awayNotice=98; SH.Atlas.noticed(SH.Atlas.here(), 0.5); });
await p.waitForTimeout(400);
r.push('ended '+await p.evaluate(()=>!!SH.G.ended)+' talk open '+await p.evaluate(()=>!!(SH.Talk.cur&&!SH.Talk.cur.ended))+' | '+await p.evaluate(()=>(document.querySelector('#tlog')||{innerText:''}).innerText.replace(/\s+/g,' ').slice(0,250)));
// talk nicely
r.push(JSON.stringify(await convo(['hi officer, sorry', 'im helping my grandma with her farm stand', 'the hendersons, on the east road', 'thank you, yes sir', 'ok'])).slice(-300));
await p.waitForTimeout(500);
r.push('after polite: ended '+await p.evaluate(()=>!!SH.G.ended)+' notice '+await p.evaluate(()=>SH.G.awayNotice)+' | '+(await M()).slice(0,150));
// B) cornered -> run
await p.evaluate(()=>{ document.querySelector('#modal').classList.add('hidden'); SH.Police.cornered(SH.Atlas.here(), 'Deputy Hale'); });
await p.waitForTimeout(200); r.push('cornered: '+await M());
await p.evaluate(()=>{ window._r=Math.random; Math.random=()=>0.01; });
await choose('Grab your stuff'); await p.evaluate(()=>{ Math.random=window._r; }); await p.waitForTimeout(500);
r.push('after run: ended '+await p.evaluate(()=>!!SH.G.ended)+' away '+await p.evaluate(()=>SH.G.away+' '+(SH.Atlas.here()||{}).name+' '+(SH.Atlas.here()||{}).tier+' notice '+SH.G.awayNotice+' stored '+JSON.stringify(SH.G.noticeAt||{})));
r.push('log: '+await p.evaluate(()=>document.querySelector('#log').innerText.replace(/\s+/g,' ').slice(0,400)));
// C) failed run -> ending
await goTown('p1'); await p.evaluate(()=>{ document.querySelector('#modal').classList.add('hidden'); SH.Police.cornered(SH.Atlas.here(), 'Deputy Hale'); window._r=Math.random; Math.random=()=>0.99; });
await choose('Grab your stuff'); await p.evaluate(()=>{ Math.random=window._r; }); await p.waitForTimeout(500);
r.push('failed run: ended '+await p.evaluate(()=>!!SH.G.ended)+' | '+(await M()).slice(0,160));
return r.join('\n')+'\nERRS '+errs.join('|');
