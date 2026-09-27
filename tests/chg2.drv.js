const r=[];
for (const [pid,kind] of [['p3','gas'],['p1','gas'],['p1','library'],['p6','diner'],['p2','laundromat']]) {
await goTown(pid); await p.evaluate(()=>{ SH.G.t=Math.floor(SH.G.t/1440)*1440+11*60; SH.G.bag.push('charger'); }); await go(kind); await clean();
for (let i=0;i<3;i++){ await p.evaluate(()=>{ SH.G.phone.bat=20; document.querySelector('#modal').classList.add('hidden'); SH.UI.afterAction(); }); await p.waitForTimeout(200);
 const res = await p.evaluate(()=>{ const b=[...document.querySelectorAll('button')].find(x=>/Charge/i.test(x.innerText) && x.offsetParent); if(!b) return 'NOBTN'; if(b.disabled) return 'DIS'; b.click(); return 'ok'; });
 await p.waitForTimeout(400); r.push(pid+kind+' try'+i+': '+res+' bat '+Math.round(await p.evaluate(()=>SH.G.phone.bat))); }
}
return r.join('\n');
