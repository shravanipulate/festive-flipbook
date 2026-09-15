(() => {
'use strict';
const run = () => {
  const panel = document.getElementById('bgmPanel');
  if (!panel || document.getElementById('birthday-youtube-stylish-v34-box')) return;
  const loader = document.createElement('script');
  loader.src = '/experience-upgrade-v34.js?v=20260915-final';
  document.body.appendChild(loader);
};
run();
new MutationObserver(run).observe(document.documentElement,{childList:true,subtree:true});
})();
