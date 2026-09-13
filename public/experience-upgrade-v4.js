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
    const all = [...document.querySelectorAll('body *')];
    const archive = all.find(el => /enter the archive/i.test((el.innerText || '').trim()));
    if (!archive) return false;
    let root = archive;
    for (let i = 0; i < 6 && root.parentElement; i++) {
      const p = root.parentElement;
      const txt = (p.innerText || '').trim();
      if (txt.length > 0 && txt.length < 2200) root = p;
      else break;
    }
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach(node => {
      const value = node.nodeValue || '';
      const next = value.replace(/\bChinmay\s+[A-Z][A-Za-z.'-]+\b/g, 'Chinmay');
      if (next !== value) node.nodeValue = next;
    });
    return true;
  };

  const boot = () => {
    cleanFirstName();
    replaceContactNumber();
  };

  boot();
  new MutationObserver(boot).observe(document.body, {
    subtree: true,
    childList: true,
    characterData: true
  });
})();
