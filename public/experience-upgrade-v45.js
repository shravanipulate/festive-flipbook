(() => {
  'use strict';
  if (window.__birthdayInteractionRepairV45) return;
  window.__birthdayInteractionRepairV45 = true;

  // Final interaction repair: do not replace existing controls or navigation.
  // Only remove accidental transparent/interaction-blocking layers.
  const BLOCKER_IDS = new Set([
    'birthday-page-turn',
    'birthday-flip-nav'
  ]);

  function repair() {
    const app = document.getElementById('app');
    if (!app) return;

    // Keep the custom arrows themselves clickable.
    const nav = document.getElementById('birthday-flip-nav');
    if (nav) {
      nav.style.pointerEvents = 'none';
      nav.querySelectorAll('button').forEach(btn => {
        btn.style.pointerEvents = 'auto';
        btn.style.position = 'relative';
        btn.style.zIndex = '2147483647';
      });
    }

    // The page-turn visual is an animation layer, not an input surface.
    const turn = document.getElementById('birthday-page-turn');
    if (turn) turn.style.pointerEvents = 'none';

    // YouTube must sit above decorative overlays.
    const yt = document.getElementById('birthday-youtube-stylish-v34-box');
    if (yt) {
      yt.style.position = 'relative';
      yt.style.zIndex = '2147483000';
      yt.style.pointerEvents = 'auto';
      yt.querySelectorAll('input,button,.yt-result').forEach(el => {
        el.style.pointerEvents = 'auto';
      });
    }

    // Restore pointer interaction for normal slide controls.
    app.querySelectorAll('button, input, textarea, select, a, [role="button"]').forEach(el => {
      if (el.closest('#birthday-flip-nav') || el.closest('#birthday-youtube-stylish-v34-box')) return;
      const cs = getComputedStyle(el);
      if (cs.pointerEvents === 'none') el.style.pointerEvents = 'auto';
      el.style.position = cs.position === 'static' ? 'relative' : cs.position;
      const z = parseInt(cs.zIndex, 10);
      if (!Number.isFinite(z) || z < 10) el.style.zIndex = '20';
    });
  }

  function boot() {
    repair();
    setTimeout(repair, 100);
    setTimeout(repair, 500);
    setTimeout(repair, 1200);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
  else boot();
  new MutationObserver(repair).observe(document.documentElement, { childList: true, subtree: true });
})();
