(() => {
  if (window.__birthdayRecorderUiV18Loaded) return;
  window.__birthdayRecorderUiV18Loaded = true;

  const style = document.createElement('style');
  style.textContent = `
    #experience-recorder-controls{transition:opacity .18s ease,transform .18s ease}
    #experience-recorder-controls.erc-collapsed{display:none!important}
    #experience-recorder-collapse{display:block;margin-top:2px}
    #experience-recorder-reopen{position:fixed;left:10px;top:50%;transform:translateY(-50%);z-index:2147483001;display:none;border:1px solid rgba(255,255,255,.18);background:rgba(18,15,14,.82);backdrop-filter:blur(12px);color:#fff;border-radius:999px;padding:8px 9px;font:700 11px/1 system-ui,sans-serif;cursor:pointer;box-shadow:0 8px 25px rgba(0,0,0,.22)}
    #experience-recorder-reopen.show{display:block}
  `;
  document.head.appendChild(style);

  function removeVisitDisclosure(){
    document.getElementById('anonymous-visit-disclosure')?.remove();
    [...document.querySelectorAll('body *')].forEach(el => {
      if (el.id === 'anonymous-visit-disclosure') el.remove();
    });
  }

  function installCollapse(){
    const controls = document.getElementById('experience-recorder-controls');
    if (!controls || document.getElementById('experience-recorder-collapse')) return;

    const collapse = document.createElement('button');
    collapse.id = 'experience-recorder-collapse';
    collapse.type = 'button';
    collapse.className = 'erc-btn';
    collapse.textContent = '◀ Hide controls';
    collapse.title = 'Hide camera and microphone controls';
    controls.appendChild(collapse);

    const reopen = document.createElement('button');
    reopen.id = 'experience-recorder-reopen';
    reopen.type = 'button';
    reopen.textContent = '🎥';
    reopen.title = 'Show recording controls';
    document.body.appendChild(reopen);

    collapse.addEventListener('click', () => {
      controls.classList.add('erc-collapsed');
      reopen.classList.add('show');
    });
    reopen.addEventListener('click', () => {
      controls.classList.remove('erc-collapsed');
      reopen.classList.remove('show');
    });
  }

  function sync(){
    removeVisitDisclosure();
    installCollapse();
  }

  sync();
  const observer = new MutationObserver(sync);
  observer.observe(document.body, {subtree:true, childList:true});
})();
