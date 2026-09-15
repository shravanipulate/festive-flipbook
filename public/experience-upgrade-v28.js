(() => {
  if (window.__birthdayUiV28Loaded) return;
  window.__birthdayUiV28Loaded = true;

  const style = document.createElement('style');
  style.textContent = `
    /* Cleaner page-turn controls: centered vertically, tucked into the content edges. */
    #birthday-flip-nav .birthday-flip-arrow{
      width:42px!important;height:42px!important;
      top:50%!important;
      border-radius:50%!important;
      background:rgba(20,16,15,.46)!important;
      border:1px solid rgba(255,255,255,.14)!important;
      backdrop-filter:blur(10px)!important;
      box-shadow:0 6px 22px rgba(0,0,0,.16)!important;
      color:rgba(255,255,255,.86)!important;
      font-size:30px!important;font-weight:300!important;
      opacity:.58!important;
    }
    #birthday-flip-nav .birthday-flip-arrow:hover{
      opacity:.92!important;
      background:rgba(20,16,15,.66)!important;
    }
    #birthday-flip-nav .birthday-flip-arrow.left{left:clamp(18px,3vw,42px)!important}
    #birthday-flip-nav .birthday-flip-arrow.right{right:clamp(18px,3vw,42px)!important}
    @media(max-width:600px){
      #birthday-flip-nav .birthday-flip-arrow{width:38px!important;height:38px!important;font-size:27px!important}
      #birthday-flip-nav .birthday-flip-arrow.left{left:10px!important}
      #birthday-flip-nav .birthday-flip-arrow.right{right:10px!important}
    }

    /* Reply slide: plain static 🫶🏻 — absolutely no heartbeat/pulse/glow. */
    .resp-icon,
    .resp-icon *{
      animation:none!important;
      transition:none!important;
      transform:none!important;
      filter:none!important;
      text-shadow:none!important;
      box-shadow:none!important;
    }
    .resp-icon{
      display:inline-flex!important;
      align-items:center!important;
      justify-content:center!important;
      width:auto!important;height:auto!important;
      color:inherit!important;
      font-size:2rem!important;
      line-height:1!important;
    }
  `;
  document.head.appendChild(style);

  function patchHeart(root=document) {
    const candidates = root.querySelectorAll ? root.querySelectorAll('.resp-icon') : [];
    candidates.forEach(el => {
      if (el.dataset.v28HeartDone) return;
      el.dataset.v28HeartDone='1';
      el.textContent='🫶🏻';
      el.style.animation='none';
      el.style.filter='none';
      el.style.transform='none';
      el.style.textShadow='none';
      el.style.boxShadow='none';
    });
  }

  patchHeart();
  const observer = new MutationObserver(() => patchHeart());
  observer.observe(document.body,{subtree:true,childList:true,characterData:true});

  // v29 was an older, competing YouTube implementation. v33 is now the
  // single YouTube search/player implementation loaded by the app.
})();
