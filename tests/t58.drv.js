const errs=[]; p.on('pageerror', e=>errs.push(e.message));
await goTown('p6');
const out = await p.evaluate(()=>{
  const g=SH.G, rec=[]; g.heat=40; g.awayNotice=0;
  const bF=SH.Endings.found; SH.Endings.found=function(r){ rec.push('FOUND '+r+' day'+SH.day()+' '+SH.hour()+'h loc '+g.loc+' | '+(new Error().stack.split('\n').slice(2,5).map(s=>s.trim().replace(/.*\/src\//,'')).join(' < '))); };
  const bT=SH.Talk.open; SH.Talk.open=function(id,o){ rec.push('TALK '+id+' ctx '+(o&&o.ctx)+' day'+SH.day()); g._copTalk=false; if(o&&o.onEnd) try{o.onEnd({result:'ok',mem:{}})}catch(e){rec.push('err '+e.message)} };
  for(let i=0;i<24*6;i++){ Object.assign(g.s,{health:90,full:90,energy:90,warmth:90,mood:70,stress:10,hyg:80}); try{SH.advance(60)}catch(e){rec.push('adv err '+e.message)} document.querySelectorAll('#modal').forEach(m=>m.classList.add('hidden')); if(g.ended){rec.push('ENDED');break;} }
  return rec.concat(['notice '+g.awayNotice+' copTalks '+JSON.stringify(g.copTalks)]).join('\n');
});
return out+'\nERRS '+errs.slice(0,3).join('|');
