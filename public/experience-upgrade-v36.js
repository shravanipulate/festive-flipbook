(() => {
  'use strict';
  const boot = () => {
    if (!document.getElementById('bgmPanel')) return;
    if (!document.getElementById('birthday-youtube-stylish-v34-style')) {
      const s = document.createElement('script');
      s.src = '/experience-upgrade-v34.js?v=20260915-wow2';
      s.async = false;
      document.body.appendChild(s);
    }
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, {once:true}); else boot();
})();
