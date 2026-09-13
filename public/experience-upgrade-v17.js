(() => {
  if (window.__birthdayMadeWithBrainV17Loaded) return;
  window.__birthdayMadeWithBrainV17Loaded = true;

  const replacement = '-[Made With Brain 🧠]';
  const pattern = /shravani\.exe/gi;

  function patch(root) {
    if (!root) return;
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach(node => {
      if (pattern.test(node.nodeValue || '')) {
        pattern.lastIndex = 0;
        node.nodeValue = node.nodeValue.replace(pattern, replacement);
      }
    });
    pattern.lastIndex = 0;
  }

  patch(document.body);
  const observer = new MutationObserver(mutations => {
    mutations.forEach(m => {
      m.addedNodes.forEach(node => {
        if (node.nodeType === Node.TEXT_NODE) {
          const value = node.nodeValue || '';
          if (pattern.test(value)) {
            pattern.lastIndex = 0;
            node.nodeValue = value.replace(pattern, replacement);
          }
          pattern.lastIndex = 0;
        } else if (node.nodeType === Node.ELEMENT_NODE) {
          patch(node);
        }
      });
    });
  });
  if (document.body) observer.observe(document.body, {subtree:true, childList:true, characterData:true});
})();
