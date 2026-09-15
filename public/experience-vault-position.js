(() => {
  'use strict';
  if (window.__birthdayVaultPositionFix) return;
  window.__birthdayVaultPositionFix = true;

  const KEY = 'birthday-vault-position-v1';
  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

  function isLastPage() {
    const slides = [...document.querySelectorAll('#app .slide, .slide')];
    if (!slides.length) return false;
    const active = slides.findIndex(s => s.classList.contains('active'));
    return active >= 0 && active === slides.length - 1;
  }

  function syncVisibility() {
    const button = document.getElementById('real-birthday-vault');
    const modal = document.getElementById('vault-modal');
    if (!button) return false;

    const show = isLastPage();
    button.style.display = show ? 'block' : 'none';
    button.setAttribute('aria-hidden', show ? 'false' : 'true');

    // Don't leave the vault modal sitting over another page.
    if (!show && modal) modal.classList.remove('show');
    return true;
  }

  function install() {
    const button = document.getElementById('real-birthday-vault');
    if (!button) return false;

    if (button.dataset.draggableVault !== '1') {
      button.dataset.draggableVault = '1';
      button.style.left = '14px';
      button.style.right = 'auto';
      button.style.top = '50%';
      button.style.bottom = 'auto';
      button.style.transform = 'translateY(-50%)';
      button.style.cursor = 'grab';
      button.style.touchAction = 'none';

      try {
        const saved = JSON.parse(localStorage.getItem(KEY) || 'null');
        if (saved && Number.isFinite(saved.x) && Number.isFinite(saved.y)) {
          button.style.left = `${clamp(saved.x, 4, innerWidth - button.offsetWidth - 4)}px`;
          button.style.top = `${clamp(saved.y, 4, innerHeight - button.offsetHeight - 4)}px`;
          button.style.transform = 'none';
        }
      } catch (_) {}

      let dragging = false;
      let moved = false;
      let startX = 0, startY = 0, originX = 0, originY = 0;

      const move = e => {
        if (!dragging) return;
        const x = clamp(originX + e.clientX - startX, 4, innerWidth - button.offsetWidth - 4);
        const y = clamp(originY + e.clientY - startY, 4, innerHeight - button.offsetHeight - 4);
        button.style.left = `${x}px`;
        button.style.top = `${y}px`;
        button.style.right = 'auto';
        button.style.bottom = 'auto';
        button.style.transform = 'none';
        moved = true;
      };

      const end = () => {
        if (!dragging) return;
        dragging = false;
        button.style.cursor = 'grab';
        if (moved) {
          localStorage.setItem(KEY, JSON.stringify({
            x: parseFloat(button.style.left),
            y: parseFloat(button.style.top)
          }));
          setTimeout(() => { moved = false; }, 0);
        }
        window.removeEventListener('pointermove', move);
        window.removeEventListener('pointerup', end);
      };

      button.addEventListener('pointerdown', e => {
        if (e.button !== undefined && e.button !== 0) return;
        dragging = true;
        moved = false;
        startX = e.clientX;
        startY = e.clientY;
        const r = button.getBoundingClientRect();
        originX = r.left;
        originY = r.top;
        button.style.cursor = 'grabbing';
        button.setPointerCapture?.(e.pointerId);
        window.addEventListener('pointermove', move, { passive: true });
        window.addEventListener('pointerup', end, { once: true });
      });

      button.addEventListener('click', e => {
        if (moved) {
          e.preventDefault();
          e.stopImmediatePropagation();
          moved = false;
        }
      }, true);

      window.addEventListener('resize', () => {
        const r = button.getBoundingClientRect();
        const x = clamp(r.left, 4, innerWidth - button.offsetWidth - 4);
        const y = clamp(r.top, 4, innerHeight - button.offsetHeight - 4);
        button.style.left = `${x}px`;
        button.style.top = `${y}px`;
        button.style.transform = 'none';
        localStorage.setItem(KEY, JSON.stringify({ x, y }));
      });
    }

    syncVisibility();
    return true;
  }

  if (install()) {
    const observer = new MutationObserver(() => {
      if (!install()) return;
      syncVisibility();
    });
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['class', 'style', 'hidden']
    });
  } else {
    const observer = new MutationObserver(() => {
      if (install()) {
        observer.disconnect();
        const pageObserver = new MutationObserver(syncVisibility);
        pageObserver.observe(document.body, {
          childList: true,
          subtree: true,
          attributes: true,
          attributeFilter: ['class', 'style', 'hidden']
        });
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });
  }
})();
