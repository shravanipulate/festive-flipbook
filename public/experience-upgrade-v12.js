(() => {
  if (window.__birthdayUpgradeV12Loaded) return;
  window.__birthdayUpgradeV12Loaded = true;

  function install() {
    if (window.__birthdayUpgradeV12Installed) return true;
    const originalCheckPw = window.checkPw;
    if (typeof originalCheckPw !== 'function') return false;

    window.__birthdayUpgradeV12Installed = true;
    const input = () => document.getElementById('pwIn');

    window.checkPw = function (...args) {
      const el = input();
      const value = el?.value?.trim().toLowerCase();

      // Route the alternate word through the site's existing numeric success path.
      if (value === 'potential' && el) {
        const originalValue = el.value;
        el.value = ['18', '3'].join('');
        try {
          return originalCheckPw.apply(this, args);
        } finally {
          el.value = originalValue;
        }
      }

      return originalCheckPw.apply(this, args);
    };
    return true;
  }

  // Scripts are injected dynamically into the iframe, so wait briefly if the
  // base page has not defined checkPw yet.
  if (install()) return;

  let tries = 0;
  const timer = setInterval(() => {
    if (install() || ++tries >= 40) clearInterval(timer);
  }, 100);
})();
