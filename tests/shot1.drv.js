await p.evaluate(()=>{ SH.Mobile.tab('story'); document.querySelector('#center').scrollTop=0; }); await p.waitForTimeout(300);
await shot('m_top');
await p.evaluate(()=>{ document.querySelector('#center').scrollTop=900; }); await p.waitForTimeout(300);
await shot('m_mid');
return await p.evaluate(()=>[...document.querySelector('#center').children].map(e=>(e.id||e.className)+':'+e.offsetTop+'+'+e.offsetHeight+(e.offsetParent?'':'(hid)')).join(' '));
