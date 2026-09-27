const errs=[]; p.on('pageerror', e=>errs.push(e.message)); const r=[];
await goTown('p6'); await p.evaluate(()=>{ SH.G.t=Math.floor(SH.G.t/1440)*1440+10*60; SH.G.money=100; SH.G.bag.push('x_bucket'); document.querySelector('#modal').classList.add('hidden'); });
r.push('gas name: '+await p.evaluate(()=>SH.LOC[SH.Town.id('p6','gas')]&&SH.LOC[SH.Town.id('p6','gas')].name));
const M=()=>p.evaluate(()=>{const m=document.querySelector('#modal:not(.hidden)'); return m? m.innerText.replace(/\s+/g,' ').replace(/\d+:\d+ [AP]M · \w+, \w+ \d+/,'').slice(0,500):'none';});
await p.evaluate(()=>SH.Biz.menu(SH.Atlas.data().places.find(x=>x.id==='p6')));
await choose('Car wash'); await p.waitForTimeout(200); r.push('ask: '+await M());
await p.evaluate(()=>{ const i=document.querySelector('#modal input, #modal textarea'); if(i) i.value='Suds Bros'; }); await p.click('#kaskOk'); await p.waitForTimeout(300);
r.push('solo menu: '+await M());
await choose('Run a shift'); await p.waitForTimeout(500); r.push('shift: '+await M());
await choose('Keep'); await p.waitForTimeout(300); r.push('money '+await p.evaluate(()=>SH.G.money)+' | '+ (await M()).slice(0,120));
// team
await p.evaluate(()=>{ SH.G.party=Object.keys(SH.NPCS_META).filter(k=>SH.NPCS_META[k].friend||/jordan|priya|leo|tyler|zoe|eli/.test(k)).slice(0,2); });
r.push('party '+await p.evaluate(()=>JSON.stringify(SH.K.party())));
await p.evaluate(()=>SH.Biz.menu(SH.Atlas.data().places.find(x=>x.id==='p6'))); r.push('team menu: '+await M());
await choose('Run a shift'); await p.waitForTimeout(300); r.push('team shift nop roles: '+await M());
await choose('Sort out'); r.push('roles1: '+await M()); await choose('Scrubs'); r.push('roles2: '+await M()); await choose('sign'); await choose('Scrubs'); await p.waitForTimeout(200); r.push('after roles: '+await M());
await choose('Run a shift'); await p.waitForTimeout(500); r.push('team shift: '+await M());
return r.join('\n')+'\nERRS '+errs.join('|');
