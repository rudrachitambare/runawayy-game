await goTown('p1'); await p.evaluate(()=>{ SH.G.t=Math.floor(SH.G.t/1440)*1440+11*60; SH.G.bag.push('charger'); }); await go('library'); await clean();
await p.evaluate(()=>{ SH.G.phone.bat=20; document.querySelector('#modal').classList.add('hidden'); SH.UI.afterAction(); }); await p.waitForTimeout(300);
const info = await p.evaluate(()=>[...document.querySelectorAll('button')].filter(x=>/Charge/i.test(x.innerText)).map(b=>b.id+'|'+b.className+'|'+b.innerText.replace(/\s+/g,' ')+'|vis '+!!b.offsetParent+'|dis '+b.disabled).join('\n'));
await p.evaluate(()=>{ const b=[...document.querySelectorAll('button')].find(x=>/Charge/i.test(x.innerText) && x.offsetParent); b.click(); });
await p.waitForTimeout(600);
const after = await p.evaluate(()=>'bat '+SH.G.phone.bat+' t '+SH.fmt12()+' modal '+(document.querySelector('#modal:not(.hidden)')||{innerText:''}).innerText.slice(0,300)+' log '+[...document.querySelectorAll('#log .le')].slice(0,3).map(e=>e.innerText.replace(/\s+/g,' ')).join(' / '));
return info+'\n'+after;
