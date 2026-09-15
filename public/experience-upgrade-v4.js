(() => {
  if (window.__birthdayUpgradeV4Loaded) return;
  window.__birthdayUpgradeV4Loaded = true;

  const replaceContactNumber = () => {
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach(node => {
      const value = node.nodeValue || '';
      const next = value.replace(/7903875007/g, '7005783097');
      if (next !== value) node.nodeValue = next;
    });
  };

  const cleanFirstName = () => {
    const candidates = [...document.querySelectorAll('body *')].filter(el => /enter the archive/i.test((el.innerText || '').trim()));
    const archive = candidates[0];
    if (!archive) return;
    let root = archive;
    for (let i = 0; i < 6 && root.parentElement; i++) {
      const p = root.parentElement;
      const txt = (p.innerText || '').trim();
      if (txt.length > 0 && txt.length < 2200) root = p; else break;
    }
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach(node => {
      const value = node.nodeValue || '';
      const next = value.replace(/\bChinmay\s+[A-Z][A-Za-z.'-]+\b/g, 'Chinmay');
      if (next !== value) node.nodeValue = next;
    });
  };

  const replaceRoadAheadLine = () => {
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach(node => {
      const value = node.nodeValue || '';
      const next = value.replace(
        /Dude really looked like he had a five-year plan at approximately zero years old\.\s*\^\.\^/g,
        'Bro really looked like he had a five-year plan at approximately zero years old. ^.^'
      );
      if (next !== value) node.nodeValue = next;
    });
  };

  const removeAmbientBgm = () => {
    const btn = document.getElementById('ambientBtn');
    if (!btn) return false;
    btn.addEventListener('click', e => {
      e.preventDefault();
      e.stopImmediatePropagation();
    }, true);
    btn.remove();
    return true;
  };

  const boot = () => {
    requestAnimationFrame(() => {
      cleanFirstName();
      replaceContactNumber();
      replaceRoadAheadLine();
      removeAmbientBgm();
    });
  };

  boot();
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot, { once: true });
  }
})();
