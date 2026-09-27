const errs=[]; p.on('pageerror', e=>errs.push(e.message));
await goTown('p1'); await go('gas');
const r = await p.evaluate(()=>{
  const out=[]; const g=SH.G; const toasts=[]; const bt=SH.UI.toast; SH.UI.toast=(x)=>toasts.push(x);
  g.loc = g.loc; const ins0=SH.insulation(false); g.bag.push('x_hoodie2','x_socks'); out.push('ins '+ins0+' -> '+SH.insulation(false));
  g.bag.push('x_sleepbag'); out.push('sleep ins '+SH.insulation(true));
  const ids=['x_energy','x_water6','x_bandaids','x_firstaid','x_tp','x_pads','x_sunscreen','x_bugspray','x_ramen','x_stove','x_filter','x_rainjacket','x_dye','x_lantern'];
  ids.forEach(id=>{ if(!g.bag.includes(id)) g.bag.push(id); });
  (g.hp=g.hp||{}).blist=60;
  for (const id of ['x_energy','x_water6','x_bandaids','x_firstaid','x_tp','x_pads','x_sunscreen','x_bugspray','x_stove','x_filter','x_rainjacket','x_dye','x_lantern']) {
    document.querySelector('#modal').classList.add('hidden'); toasts.length=0; const s0=JSON.stringify(g.s);
    try { SH.Actions.useItem(id); } catch(e){ out.push(id+' ERR '+e.message); continue; }
    const L=[...document.querySelectorAll('#log .entry, #log > div')].slice(-1).map(e=>e.innerText.slice(0,90));
    out.push(id+': '+(toasts[0]||L[0])+' | blist '+g.hp.blist);
  }
  SH.UI.toast=bt; return out.join('\n');
});
console.log(r); console.log('errs', errs.join('|'));
return r+'\nERRS '+errs.join('|');
