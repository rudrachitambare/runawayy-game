return await p.evaluate(()=>{ const g=SH.G; return 'Q '+JSON.stringify(SH.Events.Q.map(e=>e.id))+' ex '+g._exGrace+' t '+g.t+' day '+SH.day(); });
