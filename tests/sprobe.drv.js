await open(390, 844, true);
const out=[];
await goTown('p6'); await go('main'); await clean();
const sc = async (label, sel) => out.push(label+' '+sel+': '+await p.evaluate(s=>{ const e=document.querySelector(s); return e? e.scrollTop+'/'+(e.scrollHeight-e.clientHeight):'none'; }, sel));
// fill log
await p.evaluate(()=>{ for(let i=0;i<40;i++) SH.UI.log('filler line number '+i+' lorem ipsum dolor sit amet consectetur', i%3?'':'sys'); });
await p.evaluate(()=>{ document.querySelector('#center').scrollTop=600; });
await sc('story before', '#center');
await act('Look|Walk|Sit|Check'); await p.waitForTimeout(600); await clean();
await sc('story after act', '#center');
// you tab
await p.evaluate(()=>SH.Mobile.tab('you')); await p.waitForTimeout(300);
const yous = await p.evaluate(()=>{ const r=[]; document.querySelectorAll('*').forEach(e=>{ const cs=getComputedStyle(e); if(/(auto|scroll)/.test(cs.overflowY) && e.scrollHeight>e.clientHeight+5 && e.offsetParent) r.push((e.id?'#'+e.id:'')+'.'+[...e.classList].join('.')+' '+e.scrollHeight+'/'+e.clientHeight); }); return r.join(' | '); });
out.push('you scrollables: '+yous);
return out.join('\n');
