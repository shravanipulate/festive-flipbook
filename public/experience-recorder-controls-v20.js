(() => {
  if (window.__birthdayRecorderControlsV20Loaded) return;
  window.__birthdayRecorderControlsV20Loaded = true;

  const inject = () => {
    if (document.getElementById('erc-v20-style')) return true;
    const style = document.createElement('style');
    style.id = 'erc-v20-style';
    style.textContent = `
      #erc-v20-wrap{position:fixed;left:18px;bottom:18px;z-index:2147483000;font:600 13px/1.2 system-ui,sans-serif}
      #erc-v20-btn,#erc-v20-menu button{font:inherit;border:1px solid rgba(255,255,255,.2);background:rgba(20,20,28,.88);color:#fff;border-radius:12px;cursor:pointer;box-shadow:0 6px 22px rgba(0,0,0,.25)}
      #erc-v20-btn{padding:10px 14px;backdrop-filter:blur(10px)}
      #erc-v20-menu{display:none;position:absolute;left:0;bottom:48px;min-width:175px;padding:7px;background:rgba(20,20,28,.96);border:1px solid rgba(255,255,255,.14);border-radius:14px;box-shadow:0 10px 30px rgba(0,0,0,.3)}
      #erc-v20-menu.show{display:block}
      #erc-v20-menu button{display:block;width:100%;padding:10px 11px;margin:2px 0;text-align:left;background:transparent;border-color:transparent;box-shadow:none}
      #erc-v20-menu button:hover{background:rgba(255,255,255,.09)}
    `;
    document.head.appendChild(style);

    const wrap = document.createElement('div');
    wrap.id = 'erc-v20-wrap';
    wrap.innerHTML = `<button id="erc-v20-btn" type="button" aria-expanded="false">⚙ Controls ▾</button><div id="erc-v20-menu" role="menu"><button id="erc-v20-video" type="button" role="menuitem">📹 Video OFF</button><button id="erc-v20-audio" type="button" role="menuitem">🎙️ Audio OFF</button></div>`;
    document.body.appendChild(wrap);

    const videoBtn = wrap.querySelector('#erc-v20-video');
    const audioBtn = wrap.querySelector('#erc-v20-audio');
    const setLabel = () => {
      const cam = !!document.getElementById('erc-camera')?.classList.contains('on');
      const mic = !!document.getElementById('erc-mic')?.classList.contains('on');
      videoBtn.textContent = `📹 Video ${cam ? 'ON' : 'OFF'}`;
      audioBtn.textContent = `🎙️ Audio ${mic ? 'ON' : 'OFF'}`;
    };
    const clickExisting = id => document.getElementById(id)?.click();
    videoBtn.onclick = () => { clickExisting('erc-camera'); setTimeout(setLabel,80); };
    audioBtn.onclick = () => { clickExisting('erc-mic'); setTimeout(setLabel,80); };
    const main = wrap.querySelector('#erc-v20-btn');
    const menu = wrap.querySelector('#erc-v20-menu');
    main.onclick = e => { e.stopPropagation(); const open=menu.classList.toggle('show'); main.setAttribute('aria-expanded',String(open)); };
    document.addEventListener('click', e => { if (!wrap.contains(e.target)) { menu.classList.remove('show'); main.setAttribute('aria-expanded','false'); } }, true);
    setLabel();
    return true;
  };

  const wait = () => {
    if (document.body && inject()) return;
    setTimeout(wait, 150);
  };
  wait();
})();