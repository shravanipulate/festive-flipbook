(() => {
  if (window.__birthdayScrollToggleV24Loaded) return;
  window.__birthdayScrollToggleV24Loaded = true;

  const style = document.createElement('style');
  style.textContent = `
    #birthday-scroll-toggle{
      position:fixed;left:14px;bottom:14px;z-index:2147483002;
      border:1px solid rgba(255,255,255,.16);background:rgba(18,15,14,.82);
      backdrop-filter:blur(12px);color:#fff;border-radius:999px;
      padding:9px 12px;font:700 10px/1 system-ui,sans-serif;letter-spacing:.04em;
      cursor:pointer;box-shadow:0 8px 25px rgba(0,0,0,.22)
    }
    #birthday-scroll-toggle.off{opacity:.62}
    @media(max-width:600px){#birthday-scroll-toggle{left:8px;bottom:8px;padding:8px 10px}}
  `;
  document.head.appendChild(style);

  let scrollEnabled = sessionStorage.getItem('birthday-scroll-enabled') !== '0';

  const btn = document.createElement('button');
  btn.id = 'birthday-scroll-toggle';
  btn.type = 'button';
  document.body.appendChild(btn);

  function render(){
    btn.textContent = `🖱 Scroll: ${scrollEnabled ? 'ON' : 'OFF'}`;
    btn.classList.toggle('off', !scrollEnabled);
    btn.title = scrollEnabled ? 'Mouse wheel can change pages' : 'Mouse wheel is disabled for page navigation';
  }

  btn.onclick = e => {
    e.preventDefault();
    e.stopPropagation();
    scrollEnabled = !scrollEnabled;
    sessionStorage.setItem('birthday-scroll-enabled', scrollEnabled ? '1' : '0');
    render();
  };

  document.addEventListener('wheel', e => {
    if (!scrollEnabled) {
      e.preventDefault();
      e.stopImmediatePropagation();
    }
  }, {capture:true, passive:false});

  render();
})();
