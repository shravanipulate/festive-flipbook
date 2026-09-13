(() => {
  if (window.__birthdayUpgradeV8Loaded) return;
  window.__birthdayUpgradeV8Loaded = true;

  const KEY = 'chinmay-birthday-first-run-complete-v1';
  const completed = () => localStorage.getItem(KEY) === 'yes';
  const markComplete = () => {
    localStorage.setItem(KEY, 'yes');
    addReset();
  };
  const norm = s => String(s || '').replace(/\s+/g, ' ').trim();
  const visible = el => {
    if (!el) return false;
    const r = el.getBoundingClientRect(), cs = getComputedStyle(el);
    return r.width > 0 && r.height > 0 && cs.display !== 'none' && cs.visibility !== 'hidden' && cs.opacity !== '0';
  };

  // Mark the experience complete only when the existing end/replay control is reached.
  document.addEventListener('click', e => {
    const el = e.target?.closest?.('button,a,[role="button"],input[type="button"],input[type="submit"]');
    if (!el) return;
    const text = norm(el.innerText || el.textContent || el.value);
    if (/\breplay\b/i.test(text) || /watch\s+(it\s+)?again/i.test(text)) markComplete();
  }, true);

  const style = document.createElement('style');
  style.textContent = `
    #first-run-reset-access{position:fixed;right:12px;bottom:10px;z-index:2147483646;width:24px;height:24px;border:0;border-radius:50%;background:rgba(0,0,0,.10);color:currentColor;opacity:.22;font:600 15px/24px system-ui,sans-serif;text-align:center;padding:0;cursor:pointer;transition:opacity .2s,transform .2s}
    #first-run-reset-access:hover{opacity:.8;transform:scale(1.08)}
    body.first-run-auto-open .first-run-password-hidden{display:none!important}
  `;
  document.head.appendChild(style);

  function addReset(){
    if (!completed() || document.getElementById('first-run-reset-access')) return;
    const b = document.createElement('button');
    b.id = 'first-run-reset-access';
    b.type = 'button';
    b.title = 'Reset first-visit access';
    b.setAttribute('aria-label', 'Reset first-visit access');
    b.textContent = '×';
    b.onclick = () => { localStorage.removeItem(KEY); location.reload(); };
    document.body.appendChild(b);
  }

  function hidePasswordGate(){
    if (!completed()) return false;
    const input = [...document.querySelectorAll('input[type="password"]')].find(visible);
    if (!input) return false;

    let node = input;
    let candidate = null;
    for (let i=0; i<7 && node; i++, node=node.parentElement) {
      const r = node.getBoundingClientRect();
      const cs = getComputedStyle(node);
      const text = norm(node.textContent);
      if (cs.position === 'fixed' || (r.width >= innerWidth * .7 && r.height >= innerHeight * .45) || /password|passcode|enter.*secret|secret.*enter/i.test(text)) candidate = node;
    }
    candidate = candidate || input.parentElement;
    if (!candidate) return false;

    candidate.classList.add('first-run-password-hidden');
    document.body.classList.add('first-run-auto-open');
    addReset();
    return true;
  }

  function start(){
    addReset();
    if (!completed()) return;
    hidePasswordGate();
    const observer = new MutationObserver(() => { hidePasswordGate(); addReset(); });
    observer.observe(document.body, {subtree:true,childList:true,attributes:true,attributeFilter:['style','class','hidden']});
    setTimeout(() => observer.disconnect(), 15000);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, {once:true});
  else start();
})();
