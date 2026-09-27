#!/bin/sh
# sandbox bootstrap: headless chromium (@sparticuz) + playwright-core for tests/drive.js
mkdir -p /tmp/spc && cd /tmp/spc && npm i -s @sparticuz/chromium@129 >/dev/null 2>&1
node -e "
const z=require('zlib'),fs=require('fs'),cp=require('child_process');
for (const f of ['al2023.tar.br','al2.tar.br','chromium.br','swiftshader.tar.br','fonts.tar.br']) { const p='node_modules/@sparticuz/chromium/bin/'+f; if(!fs.existsSync(p)) continue; const b=z.brotliDecompressSync(fs.readFileSync(p)); if(f.endsWith('.tar.br')){fs.writeFileSync('/tmp/x.tar',b);cp.execSync('tar -xf /tmp/x.tar -C /tmp');} else {fs.writeFileSync('/tmp/chromium',b);fs.chmodSync('/tmp/chromium',0o755);} }
"
sudo ln -sf /tmp/chromium /usr/bin/chromium
cd "$(dirname "$0")" 2>/dev/null; cd /home/user/runawayy-game/tests && npm i -s >/dev/null 2>&1; npm i -s >/dev/null 2>&1; ls node_modules | grep playwright
