await open(1366, 768, false);
await goTown('p6'); await go('main'); await clean(); await act('Look|Walk|Sit|Check'); await p.waitForTimeout(700); await clean();
await shot('d_new1');
return 'ok';
