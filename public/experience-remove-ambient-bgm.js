(() => {
  if (window.__removeAmbientBgmLoaded) return;
  window.__removeAmbientBgmLoaded = true;

  const remove = () => {
    const btn = document.getElementById('ambientBtn');
    if (!btn) return false;

    // Stop the original ambient-BGM click handler from running.
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopImmediatePropagation();
    }, true);

    // The generated ambient synth is no longer a usable BGM control.
    btn.remove();
    return true;
  };

  if (remove()) return;
  let tries = 0;
  const timer = setInterval(() => {
    if (remove() || ++tries >= 150) clearInterval(timer);
  }, 100);
})();
