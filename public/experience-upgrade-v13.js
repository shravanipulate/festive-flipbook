(() => {
  if (window.__birthdayUpgradeV13Loaded) return;
  window.__birthdayUpgradeV13Loaded = true;

  const STYLE_ID = 'birthday-final-reaction-toggle-style';

  function installStyle() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      #finalReactions .vault-reaction[data-reaction]:not([data-reaction="Neech"]) {
        position:relative;
        transition:transform .2s ease, background .2s ease, border-color .2s ease, color .2s ease, filter .2s ease, box-shadow .2s ease;
      }
      #finalReactions .vault-reaction[data-reaction]:not([data-reaction="Neech"]).reaction-on {
        transform:translateY(-2px) scale(1.06);
        color:var(--cyan, #67e8f9);
        background:rgba(34,211,238,.10);
        border-color:rgba(34,211,238,.34);
        box-shadow:0 0 18px rgba(34,211,238,.20), inset 0 0 12px rgba(34,211,238,.06);
        filter:drop-shadow(0 0 8px rgba(34,211,238,.34));
      }
      #finalReactions .vault-reaction[data-reaction]:not([data-reaction="Neech"]).reaction-on .vr-icon { filter:drop-shadow(0 0 8px rgba(255,255,255,.32)); }
      #finalReactions .vault-reaction[data-reaction]:not([data-reaction="Neech"]).reaction-off { transform:none; box-shadow:none; filter:none; }
    `;
    document.head.appendChild(style);
  }

  function getButtons() {
    return [...document.querySelectorAll('#finalReactions .vault-reaction[data-reaction]')].filter(btn => btn.dataset.reaction !== 'Neech');
  }
  function setReaction(btn, on) {
    btn.classList.toggle('reaction-on', on);
    btn.classList.toggle('reaction-off', !on);
    btn.classList.toggle('selected', on);
    btn.setAttribute('aria-pressed', on ? 'true' : 'false');
  }
  function syncStatus(btn, on) {
    const status = document.getElementById('finalReactionStatus');
    if (!status || !btn) return;
    status.textContent = on ? '✓ Reacted: ' + btn.dataset.reaction : '○ ' + btn.dataset.reaction + ' unselected';
  }
  function patchButtons() {
    installStyle();
    getButtons().forEach(btn => {
      if (btn.dataset.reactionTogglePatched === '1') return;
      btn.dataset.reactionTogglePatched = '1';
      setReaction(btn, btn.classList.contains('selected'));
    });
  }

  document.addEventListener('click', event => {
    const btn = event.target?.closest?.('#finalReactions .vault-reaction[data-reaction]');
    if (!btn || btn.dataset.reaction === 'Neech') return;
    event.preventDefault();
    event.stopImmediatePropagation();
    const on = !btn.classList.contains('reaction-on');
    setReaction(btn, on);
    syncStatus(btn, on);
  }, true);

  patchButtons();
})();
