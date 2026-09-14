(() => {
  if (window.__birthdayPiSecretV26Loaded) return;
  window.__birthdayPiSecretV26Loaded = true;

  const style = document.createElement('style');
  style.textContent = `
    .birthday-pi-secret-ready {
      cursor: pointer !important;
      animation: birthdayPiSecretGlow 2.4s ease-in-out infinite;
    }
    @keyframes birthdayPiSecretGlow {
      0%,100% { filter: drop-shadow(0 0 0 rgba(233,174,80,0)); }
      50% { filter: drop-shadow(0 0 9px rgba(233,174,80,.34)); }
    }
    .birthday-pi-secret-flash {
      position: fixed;
      inset: 0;
      z-index: 2147483005;
      display: flex;
      align-items: center;
      justify-content: center;
      pointer-events: none;
      font: 900 34px/1 system-ui,sans-serif;
      color: #e9ae50;
      text-shadow: 0 0 28px rgba(233,174,80,.38);
      animation: birthdayPiSecretFlash .75s ease forwards;
    }
    @keyframes birthdayPiSecretFlash {
      0% { opacity: 0; transform: scale(.82); }
      22% { opacity: 1; transform: scale(1); }
      72% { opacity: 1; }
      100% { opacity: 0; transform: scale(1.05); }
    }
  `;
  document.head.appendChild(style);

  let replaying = false;
  let flashActive = false;

  function markPi() {
    document.querySelectorAll('body *').forEach(el => {
      if (el.closest('#pi-challenge-overlay') || el.dataset.piV26Ready) return;
      if ((el.textContent || '').trim() !== 'π') return;
      el.dataset.piV26Ready = '1';
      el.classList.add('birthday-pi-secret-ready');
    });
  }

  document.addEventListener('click', e => {
    if (replaying || flashActive) return;
    const el = e.target?.closest?.('button,[role="button"],a,span,div');
    if (!el || el.closest('#pi-challenge-overlay') || (el.textContent || '').replace(/\s+/g,' ').trim() !== 'π') return;

    e.preventDefault();
    e.stopImmediatePropagation();
    flashActive = true;

    const flash = document.createElement('div');
    flash.className = 'birthday-pi-secret-flash';
    flash.textContent = '<3.14';
    document.body.appendChild(flash);

    setTimeout(() => {
      flash.remove();
      flashActive = false;
      replaying = true;
      try { el.click(); } finally {
        setTimeout(() => { replaying = false; }, 0);
      }
    }, 750);
  }, true);

  const observer = new MutationObserver(markPi);
  observer.observe(document.body, { childList: true, subtree: true });
  markPi();
})();
