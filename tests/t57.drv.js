const errs=[]; p.on('pageerror', e=>errs.push(e.message)); const r=[];
await goTown('p6'); await p.evaluate(()=>{ const g=SH.G; g.t=Math.floor(g.t/1440)*1440+11*60; g.heat=10; g.biz={[g.away]:{kind:'dogs',name:'X',roles:{},shifts:1,total:5}}; document.querySelector('#modal').classList.add('hidden'); });
const talkOnce = async (label) => {
  const opened = await p.evaluate(()=>{ let cb=false; SH.Police.stop(SH.Atlas.here(),'business',()=>{ window._cb=true; }); return !!(SH.Talk.cur && !SH.Talk.cur.ended); });
  if (!opened) { r.push(label+': no stop. log: '+await p.evaluate(()=>document.querySelector('#log').innerText.replace(/\s+/g,' ').slice(0,160))); return; }
  const tr = await convo(['Sorry officer', 'Do I need a permit or anything?', 'Yes sir, thank you', 'Thank you, officer']);
  await p.waitForTimeout(300); await p.evaluate(()=>{ const b=document.querySelector('#tdone'); b&&b.click(); }); await p.waitForTimeout(300);
  r.push(label+': '+tr.slice(-5).join(' / ').slice(0,260)+' | talks '+await p.evaluate(()=>JSON.stringify(SH.G.copTalks)));
};
await talkOnce('1');
await talkOnce('1b same day');
await p.evaluate(()=>{ SH.G.t+=1500; }); await talkOnce('2');
await p.evaluate(()=>{ SH.G.t+=1500; }); await talkOnce('3');
r.push('log after 3: '+await p.evaluate(()=>document.querySelector('#log').innerText.replace(/\s+/g,' ').slice(0,200)));
await p.evaluate(()=>{ SH.G.t+=3000; document.querySelector('#modal').classList.add('hidden'); }); await talkOnce('4');
r.push('notice 100: '+await p.evaluate(()=>{ SH.G.awayNotice=99; SH.Atlas.noticed(SH.Atlas.here(),0.5); return 'talk open '+!!(SH.Talk.cur&&!SH.Talk.cur.ended)+' notice '+SH.G.awayNotice+' ended '+!!SH.G.ended; }));
return r.join('\n')+'\nERRS '+errs.join('|');
