const errs=[]; p.on('pageerror', e=>errs.push(e.message));
const report=[];
for (const pid of ['p3','p1','p6','p2']) {
  await goTown(pid);
  await p.evaluate(()=>{ SH.G.t = Math.floor(SH.G.t/1440)*1440 + 11*60; SH.G.money=200; Object.assign(SH.G.s,{full:50,energy:60,hyg:50,mood:50,stress:40,health:90,warmth:60}); SH.G.phone.bat=50; });
  const kinds = await p.evaluate(()=>Object.keys(SH.LOC).filter(k=>k.startsWith('t_'+SH.G.away+'_')).map(k=>k.split('_').slice(2).join('_')));
  for (const k of kinds) {
    const r = await go(k); if (r==='NOLOC') continue;
    await p.evaluate(()=>{ document.querySelector('#modal').classList.add('hidden'); });
    const res = await p.evaluate(()=>{
      const KEYS=['s','money','bag','owned','flags','rel','skills','look','res','base','tale','vill','pbCharge','heat','awayNotice','room','party','done','useLeft','biz','tw','twx','crew','veh','bank'];
      const pickS=()=>{ const g=SH.G, o={}; KEYS.forEach(k=>o[k]=g[k]); o.bat=g.phone&&g.phone.bat; return JSON.parse(JSON.stringify(o)); };
      const diff=(a,b,path='')=>{ if (typeof a==='number'&&typeof b==='number') return Math.abs(a-b)>0.6?[path]:[]; if (a&&b&&typeof a==='object'&&typeof b==='object'){ let d=[]; new Set([...Object.keys(a),...Object.keys(b)]).forEach(k=>{ d=d.concat(diff(a[k],b[k],path+'.'+k)); }); return d;} return JSON.stringify(a)===JSON.stringify(b)?[]:[path]; };
      const snap=JSON.stringify(SH.G); const acts=SH.Actions.list().acts.filter(a=>!a.dis);
      const out=[];
      const SKIP=/Open Atlas|You & your group|Talk to|Stores|All options|Look back|The junkyard|Walk out to|Build a shack|Your shack|Call|timetable|Departures|Board:|Walk into|Ring the bell|Go to|Sleep|motel|Leave|Read the notice/i;
      for (const a of acts) {
        if (SKIP.test(a.label)) continue;
        SH.G=JSON.parse(snap); const m=document.querySelector('#modal'); m.classList.add('hidden'); m.innerHTML='';
        const t0=SH.G.t, n0=document.querySelectorAll('#log .entry, #log > div').length;
        let err=null; try{ SH.Actions.list().acts.find(x=>x.label===a.label).fn(); }catch(e){ err=e.message; }
        const opened=!m.classList.contains('hidden'); const mtxt=opened? m.innerText.slice(0,80).replace(/\n/g,' '):'';
        const after=pickS(), dt=SH.G.t-t0; const logs=[...document.querySelectorAll('#log .entry, #log > div')].slice(n0).map(e=>e.innerText.replace(/\n/g,' ')).join(' ').slice(0,200);
        SH.G=JSON.parse(snap); SH.advance(dt,{interrupt:false}); const base=pickS();
        const d=diff(after,base).filter(x=>!/\.tw\.|\.twx\./.test(x)||true);
        out.push({label:a.label, dt, d:d.slice(0,6), opened, mtxt, logs, err});
      }
      SH.G=JSON.parse(snap); document.querySelector('#modal').classList.add('hidden');
      return out;
    });
    res.forEach(x=>{ if (!x.opened && (!x.d.length || x.err)) report.push(`${pid}/${k}: "${x.label}" dt=${x.dt} d=${x.d.join(',')} ${x.err?'ERR '+x.err:''} :: ${x.logs}`); });
  }
}
return report.join('\n')+'\nERR:'+[...new Set(errs)].join('|');
