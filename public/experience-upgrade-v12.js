(() => {
  if (window.__birthdayUpgradeV12Loaded) return;
  window.__birthdayUpgradeV12Loaded = true;

  const input = () => document.getElementById('pwIn');
  const originalCheckPw = window.checkPw;
  if (typeof originalCheckPw !== 'function') return;

  window.checkPw = function (...args) {
    const el = input();
    const value = el?.value?.trim().toLowerCase();

    // "potential" follows the exact same ordinary-success path as mnbvcxz.
    if (value === 'potential' && el) {
      const originalValue = el.value;
      el.value = 'mnbvcxz';
      try {
        return originalCheckPw.apply(this, args);
      } finally {
        el.value = originalValue;
      }
    }
    return originalCheckPw.apply(this, args);
  };
})();
