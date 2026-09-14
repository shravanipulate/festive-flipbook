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

  function replaceBirthdayMessage() {
    const box = document.getElementById('pwMsg');
    const p = box?.querySelector('p');
    if (!p) return false;

    p.innerHTML = `
      Oh, it's "potentially" your birthday today, but I suppose the world can survive someone who believes there's always another level to unlock. 100 ke baad 101 bhi toh hai na.<br><br>
      May you keep building, exploring the unexplored, questioning like 0!=1?, and yeah, being "self-obsessed" too. Hope 18 gives you more reasons to be proud and remember.<br><br>
      Hope this was something unique that you haven't received or made. Ab "same" mat bolna lol T_T<br><br>
      Btw, Ch(atgpt) = Ch(inmay) = Ch + preposition + gpt/may. Illogical logic, ik. 💀<br><br>
      Had 17 more ideas, but calling it done before this becomes a post. And the dice idea? Nah. You don't need to roll - you're winning anyway. Heads/tail logic, iykyk.<br><br>
      BGM ke liye YT coz I didn't wanna andazi your favourite. 3 unique sites hi banai hain total, in life, so manage the bugs lol.
    `;
    return true;
  }

  if (replaceBirthdayMessage()) return;
  let messageTries = 0;
  const messageTimer = setInterval(() => {
    if (replaceBirthdayMessage() || ++messageTries >= 40) clearInterval(messageTimer);
  }, 100);
})();
