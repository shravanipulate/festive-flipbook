(() => {
  if (window.__birthdayCEasterDemo) return;
  window.__birthdayCEasterDemo = true;

  const input = () => document.getElementById('pwIn');
  const visible = el => {
    if (!el) return false;
    const r = el.getBoundingClientRect(), s = getComputedStyle(el);
    return r.width > 0 && r.height > 0 && s.display !== 'none' && s.visibility !== 'hidden';
  };

  let demoArmed = false;

  function makeDemo() {
    if (document.getElementById('c-easter-demo')) return;
    const box = document.createElement('div');
    box.id = 'c-easter-demo';
    box.innerHTML = '<div class="ced-title">okay, you found the side door ✦</div><div class="ced-copy">this is the tiny easter-egg demo — the normal password gate is still untouched.</div><button type="button" id="ced-close">back</button>';
    const style = document.createElement('style');
    style.textContent = `
      #c-easter-demo{position:fixed;inset:0;z-index:2147483000;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:28px;background:rgba(250,247,242,.97);font-family:system-ui,sans-serif}
      .ced-title{font-size:clamp(24px,4vw,42px);font-weight:600;letter-spacing:-.03em}
      .ced-copy{max-width:520px;margin:14px 0 24px;opacity:.65;line-height:1.6}
      #ced-close{border:1px solid currentColor;background:transparent;border-radius:999px;padding:8px 18px;cursor:pointer}
    `;
    document.head.appendChild(style);
    document.body.appendChild(box);
    document.getElementById('ced-close').addEventListener('click', () => box.remove());
  }

  document.addEventListener('keydown', e => {
    const el = input();
    if (!el || !visible(el)) return;
    if (e.key === 'Enter' && el.value === 'c') {
      e.preventDefault();
      e.stopImmediatePropagation();
      demoArmed = true;
      el.value = '';
      el.blur();
      makeDemo();
    }
  }, true);

  // The demo is deliberately separate from the real authentication flow.
  // Double-clicking the existing star while demo mode is active reveals the demo overlay.
  document.addEventListener('dblclick', e => {
    if (!demoArmed) return;
    const t = e.target;
    if (!(t instanceof Element)) return;
    if (t.textContent?.trim() === '✦' || t.closest('[aria-label*="star" i], [data-star]')) {
      makeDemo();
    }
  }, true);
})();
