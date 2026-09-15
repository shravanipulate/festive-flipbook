(() => {
  'use strict';
  const boot=()=>{
    const p=document.getElementById('bgmPanel');
    if(!p || document.getElementById('birthday-youtube-stylish-v34-box')) return;
    const s=document.createElement('script');
    s.src='/experience-upgrade-v34.js?v=20260915-live';
    s.async=false;
    document.body.appendChild(s);
  };
  boot();
  new MutationObserver(boot).observe(document.documentElement,{childList:true,subtree:true});
})();
