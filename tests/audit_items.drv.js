const errs=[]; p.on('pageerror', e=>errs.push(e.message));
await goTown('p1'); await go('gas');
await p.evaluate(()=>{ SH.G.t = Math.floor(SH.G.t/1440)*1440 + 11*60; Object.assign(SH.G.s,{full:50,energy:60,hyg:50,mood:50,stress:40,health:80,warmth:60}); SH.G.phone.bat=50; SH.G.pbCharge=50; });
const res = await p.evaluate(()=>{
  const KEYS=['s','money','bag','owned','flags','look','pbCharge','puffs','useLeft','done'];
  const pickS=()=>{ const g=SH.G,o={}; KEYS.forEach(k=>o[k]=g[k]); o.bat=g.phone.bat; return JSON.parse(JSON.stringify(o)); };
  const diff=(a,b,path='')=>{ if (typeof a==='number'&&typeof b==='number') return Math.abs(a-b)>0.6?[path]:[]; if (a&&b&&typeof a==='object'&&typeof b==='object'){ let d=[]; new Set([...Object.keys(a),...Object.keys(b)]).forEach(k=>{ d=d.concat(diff(a[k],b[k],path+'.'+k)); }); return d;} return JSON.stringify(a)===JSON.stringify(b)?[]:[path]; };
  const snap0=JSON.stringify(SH.G), out=[];
  const toasts=[]; const bt=SH.UI.toast; SH.UI.toast=(x)=>toasts.push(x);
  for (const id of Object.keys(SH.ITEMS)) {
    SH.G=JSON.parse(snap0); if (!SH.G.bag.includes(id)) SH.G.bag.push(id); const snap=JSON.stringify(SH.G);
    const m=document.querySelector('#modal'); m.classList.add('hidden');
    toasts.length=0; const t0=SH.G.t, n0=document.querySelectorAll('#log .entry, #log > div').length; let err=null;
    try { SH.Actions.useItem(id); } catch(e){ err=e.message; }
    const opened=!m.classList.contains('hidden'); const after=pickS(), dt=SH.G.t-t0;
    const logs=[...document.querySelectorAll('#log .entry, #log > div')].slice(n0).map(e=>e.innerText.replace(/\n/g,' ')).join(' ').slice(0,140);
    SH.G=JSON.parse(snap); SH.advance(dt,{interrupt:false}); const d=diff(after,pickS());
    out.push(`${id} [${SH.ITEMS[id].n}] ${d.length?'CHANGED '+d.slice(0,3).join(','):'NOTHING'}${opened?' (dialog)':''}${err?' ERR '+err:''} :: ${toasts.join('|')} ${logs}`);
  }
  SH.UI.toast=bt; SH.G=JSON.parse(snap0); return out;
});
return res.join('\n')+'\nERR:'+[...new Set(errs)].join('|');
