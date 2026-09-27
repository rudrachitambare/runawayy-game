await open(390, 844, true);
await goTown('p6'); await go('main'); await clean();
await act('Look|Walk|Sit|Check'); await p.waitForTimeout(700); await clean();
await p.evaluate(()=>{ SH.UI.afterAction(); SH.UI.log('NEWEST line one of this action.'); SH.UI.log('NEWEST line two of this action.','sys'); });
await p.waitForTimeout(500);
await p.evaluate(()=>{ document.querySelector('#center').scrollTop=380; }); await p.waitForTimeout(300);
await shot('n_top2');
const a = await p.evaluate(()=>[...document.querySelectorAll('#log .le')].slice(0,6).map(e=>e.innerText.replace(/\s+/g,' ').slice(0,60)).join('\n'));
// restore
const b = await p.evaluate(()=>{ SH.UI.restoreLog(); return [...document.querySelectorAll('#log .le')].slice(0,6).map(e=>e.innerText.replace(/\s+/g,' ').slice(0,60)).join('\n'); });
// scroll down then act -> should come back to top
await p.evaluate(()=>{ document.querySelector('#center').scrollTop=2000; });
await act('Look|Walk|Sit|Check'); await p.waitForTimeout(700);
const c = await p.evaluate(()=>document.querySelector('#center').scrollTop+' pill:'+!!document.querySelector('#toScene'));
return a+'\n---restored\n'+b+'\n---after act scrollTop '+c;
