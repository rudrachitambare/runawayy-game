/* dialer.js: a real keypad in the Phone app.
   There's no "call the sheriff" button anywhere; if you want the police you dial them, like a person would.
   911 / 100 / 112 / 999 → emergency dispatch (works with no data, no wifi, even in airplane mode; needs battery).
   988 → the Lighthouse crisis line. Anything else: not in service. */
(function (SH) {
  const P = SH.Phone; if (!P) return;
  const G = () => SH.G;
  const EMERG = ['911', '100', '112', '999'];
  let num = '';
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  const pad = () => {
    const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '*', '0', '#'];
    return `<div id="dialpad" style="padding:6px 10px 10px;border-bottom:1px solid rgba(255,255,255,.08);margin-bottom:6px">
      <div id="dialnum" style="height:34px;text-align:center;font-size:24px;letter-spacing:3px;font-variant-numeric:tabular-nums;color:#fff">${esc(num) || '<span style="color:#666;font-size:13px;letter-spacing:0">enter a number</span>'}</div>
      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:7px;max-width:230px;margin:4px auto 0">
        ${keys.map((k) => `<button data-k="${k}" style="height:40px;border-radius:20px;border:none;background:rgba(255,255,255,.1);color:#fff;font-size:18px">${k}</button>`).join('')}
        <span></span><button data-k="call" style="height:40px;border-radius:20px;border:none;background:#34c759;color:#fff;font-size:18px">✆</button><button data-k="del" style="height:40px;border-radius:20px;border:none;background:transparent;color:#aaa;font-size:18px">⌫</button>
      </div></div>`;
  };
  const wire = () => {
    const box = document.querySelector('#dialpad'); if (!box) return;
    box.querySelectorAll('button[data-k]').forEach((b) => {
      b.onclick = (e) => {
        e.stopPropagation(); const k = b.dataset.k;
        if (k === 'del') num = num.slice(0, -1);
        else if (k === 'call') { const n = num; num = ''; if (n) P.dial(n); else SH.UI.toast('Type a number first.'); if (!n) return; P.render(); return; }
        else if (num.length < 14) num += k;
        SH.Audio && SH.Audio.click && SH.Audio.click();
        const d = document.querySelector('#dialnum'); if (d) d.innerHTML = esc(num) || '<span style="color:#666;font-size:13px;letter-spacing:0">enter a number</span>';
      };
    });
  };

  // draw the keypad on top of the normal contacts list
  const bRender = P.render;
  P.render = function () {
    const r = bRender.apply(this, arguments);
    try {
      const g = G(); const v = P.view || {};
      if (g && v.app === 'calls' && g.phone.bat > 0 && !g.phone.confiscated && !document.querySelector('#dialpad')) {
        const body = document.querySelector('#pbody .appbody'); if (body) { body.insertAdjacentHTML('afterbegin', pad()); wire(); }
      }
    } catch (e) { console.warn(e); }
    return r;
  };

  const place = () => { const g = G(); return g.away && SH.Actions && SH.Actions.here ? SH.Actions.here() : null; };

  // the emergency call itself
  const emergency = (n) => {
    const g = G(), p = place(), home = g.phase !== 'run';
    SH.advance(2, { interrupt: false });
    if (home) {
      const late = SH.hour() >= 21 || SH.hour() < 5;
      return SH.UI.dialog({ title: n, cls: 'safe', text: [`It rings once. "${n === '911' ? '911' : n === '100' ? 'Police' : 'Emergency services'}, what's your emergency?"`, 'The voice is calm and quick. Behind it, other phones are ringing.'],
        choices: [
          { t: 'Tell them about Rick', cls: 'safe', sub: late ? 'Right now. Tonight.' : 'All of it.', fn: () => {
            if (late && SH.Endings.call911) return SH.Endings.call911();
            SH.flag && SH.flag('toldPolice');
            SH.UI.log('You tell the dispatcher about Rick. The yelling, the wall, the way the house goes quiet when his truck pulls in. She doesn\'t rush you. "Okay. Nobody is hurt right now? Then I\'m going to put this in, and I\'m giving you a number that\'s just for kids. Call it, or call us back the second anything happens. Anything."', 'good');
            SH.advance(15, { interrupt: false }); SH.UI.afterAction();
          } },
          { t: '…Sorry. Wrong number.', sub: 'Hang up.', fn: () => { SH.UI.log('"Okay, hon. If you need us, call back." You hang up. Your heart is going like you ran here.', 'sys'); SH.UI.afterAction(); } },
        ] });
    }
    // villages: nobody comes. Not police, not a deputy. The call just goes nowhere.
    if (SH.inVillage && SH.inVillage()) {
      return SH.UI.dialog({ title: n, cls: 'safe', text: [`It rings for a long time. Then: "County dispatch." You tell her where you are, and there's a pause, and typing.`, `"${(p && p.name) || 'Out there'}? Okay, hon. I've got it down. I'll pass it along." She doesn't say anyone's coming, because nobody is. Out here, nobody ever comes.`],
        choices: [{ t: 'Hang up', fn: () => { SH.UI.log('You hang up. Nobody calls back. If you ever want to go home, you\'ll have to get yourself to a bigger town first.', 'sys'); SH.UI.afterAction(); } }] });
    }
    const hasPolice = !g.away || (p && p.hasPolice);
    const where = !g.away ? 'Harlow' : (p && p.name) || 'here';
    return SH.UI.dialog({ title: n, cls: 'safe', text: [`It rings once. "${n === '911' ? '911' : n === '100' ? 'Police' : 'Emergency services'}, what's your emergency?"`],
      choices: [
        { t: 'I ran away from home. Can someone come get me?', cls: 'safe', sub: 'This ends the run.', fn: () => {
          SH.UI.log(`"I ran away. I'm in ${where}. I want to go home." You say it before you can stop yourself. The dispatcher asks your name, and where exactly, and whether you're safe right now. "Stay right there, sweetheart. Someone's ${hasPolice ? 'on the way' : 'driving out from the county. It might take a while'}. Stay on the line with me if you want."`, 'sys');
          g._vol = 1; SH.advance(hasPolice ? 15 : 40, { interrupt: false });
          SH.Endings.found(hasPolice ? 'police' : 'sheriff');
        } },
        { t: 'I\'m not safe right now', cls: 'hot', sub: 'Someone is scaring you.', fn: () => {
          SH.UI.log(`You whisper where you are. The dispatcher's voice changes: slower, closer. "Go somewhere with people and light. Stay on with me." ${hasPolice ? 'A cruiser' : 'A deputy'} is coming. It's not really a question anymore.`, 'bad');
          g._vol = 1; SH.advance(hasPolice ? 10 : 35, { interrupt: false });
          SH.Endings.found(hasPolice ? 'police' : 'sheriff');
        } },
        { t: 'Hang up', sub: 'Before they can ask your name.', fn: () => {
          SH.UI.log('You hang up. The phone is warm in your hand. They have your number now, probably. Probably they have a lot of numbers.', 'sys');
          SH.UI.afterAction();
        } },
      ] });
  };

  P.dial = function (n) {
    const g = G(); if (!g) return;
    n = String(n).replace(/[^0-9*#]/g, '');
    if (g.phone.confiscated) return SH.UI.toast('You don\'t have your phone.');
    if (g.phone.bat <= 0) return SH.UI.toast('Your phone is dead.');
    if (EMERG.includes(n)) return emergency(n);
    if (n === '988') { if (P.callOut) return P.callOut('lighthouse'); }
    if (g.phone.airplane) return SH.UI.toast('Airplane mode is on. Only emergency calls go through.');
    if (n === '18007862929' || n === '1800786') return P.callOut && P.callOut('lighthouse');
    SH.advance(1, { interrupt: false });
    SH.UI.toast(n.length < 7 ? 'Call failed. That\'s not a full number.' : 'The number you have dialed is not in service.');
  };
})(window.SH);
