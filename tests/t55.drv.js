const errs=[]; p.on('pageerror', e=>errs.push(e.message)); const r=[];
const M=()=>p.evaluate(()=>{const m=document.querySelector('#modal:not(.hidden)'); return m? m.innerText.replace(/\s+/g,' ').replace(/\d+:\d+ [AP]M · \w+, \w+ \d+/,'').slice(0,300):'none';});
const found = async (setup) => { await goTown('p6'); await p.evaluate((s)=>{ const g=SH.G; g.t=Math.floor(g.t/1440)*1440+14*60; document.querySelector('#modal').classList.add('hidden'); if(s) SH.G.cover={[g.away]:{name:'Jamie',story:'moved',told:[]}}; g.heat=40; g.away=null; SH.Endings.found('away'); }, setup); await p.waitForTimeout(300); await choose('Talk to her'); await p.waitForTimeout(400); };
const done = async () => { await p.waitForTimeout(400); await p.evaluate(()=>{ const b=document.querySelector('#tdone'); b&&b.click(); }); await p.waitForTimeout(500); };
// A) lie with cover
await found(true);
r.push('A: '+JSON.stringify(await convo(['sorry officer, my family just moved here', "i'm Jamie", 'yes maam, thank you', 'thank you officer'])).slice(0,700));
await done(); r.push('A result: ended '+await p.evaluate(()=>!!SH.G.ended)+' away '+await p.evaluate(()=>SH.G.away+' notice '+SH.G.awayNotice)+' | '+(await M()).slice(0,120));
// B) truth
await found(false);
await convo(['my stepdad drinks and yells at me every night. im scared to go home']); await done();
r.push('B truth: ended '+await p.evaluate(()=>!!SH.G.ended)+' | '+(await M()).slice(0,140));
// C) bad lies -> cornered -> go with them (no loop)
await found(true);
await convo(['shut up', 'my grandma lives here', "i'm Tyler", 'whatever', 'ok']); await done();
r.push('C: '+(await M()).slice(0,200));
await choose('Go with them'); await p.waitForTimeout(500);
r.push('C go: ended '+await p.evaluate(()=>!!SH.G.ended)+' | '+(await M()).slice(0,140));
return r.join('\n')+'\nERRS '+errs.join('|');
