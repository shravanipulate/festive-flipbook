(() => {
  if (window.__birthdayUpgradeV2Loaded) return;
  window.__birthdayUpgradeV2Loaded = true;

  // Only replace the existing opening language text. Nothing new is added.
  const replacement = [
    'नमस्ते',       // Hindi
    'Hello',        // English
    'प्रणाम',       // Maithili
    'ਸਤ ਸ੍ਰੀ ਅਕਾਲ', // Punjabi
    'Hallo',        // German
    'こんにちは',    // Japanese
    'नमः',          // Sanskrit
    'নমস্কাৰ',       // Assamese
    'নমস্কার',       // Bengali
    'ନମସ୍କାର',      // Odia
    'प्रणाम',        // Bhojpuri
    'Hello',        // Tribal languages
    '你好'           // Mandarin
  ].join('');

  const oldTokens = [
    'Bonjour', 'Hola', 'Ciao', 'Salut', 'Привет', 'Olá', '안녕', 'مرحبا',
    'नमस्कार', 'নমস্কার', 'নমস্কাৰ', 'こんにちは', 'नमस्ते', 'Hello'
  ];

  const replaceExistingLanguageLine = () => {
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);

    // Prefer the actual existing language line: a text node containing several
    // greeting tokens. Replace that node only, preserving its original element,
    // position, CSS, animation and surrounding page exactly as-is.
    for (const node of nodes) {
      const text = node.nodeValue || '';
      if (!text.trim()) continue;
      const hits = oldTokens.reduce((n, token) => n + (text.includes(token) ? 1 : 0), 0);
      if (hits >= 2) {
        node.nodeValue = replacement;
        return true;
      }
    }

    // If the original line is split into spans/text nodes, replace only the
    // smallest parent containing multiple old-language greetings.
    const elements = [...document.body.querySelectorAll('*')];
    for (const el of elements) {
      if (el.id === 'birthday-upgrade-v2-script') continue;
      const text = el.textContent || '';
      const hits = oldTokens.reduce((n, token) => n + (text.includes(token) ? 1 : 0), 0);
      if (hits >= 3 && text.length < 300) {
        const directTextNodes = [];
        const tw = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
        while (tw.nextNode()) directTextNodes.push(tw.currentNode);
        const languageNodes = directTextNodes.filter(n =>
          oldTokens.some(token => (n.nodeValue || '').includes(token))
        );
        if (languageNodes.length >= 2) {
          el.textContent = replacement;
          return true;
        }
      }
    }

    return false;
  };

  replaceExistingLanguageLine();

  // The original page can render the line after load, so retry briefly without
  // creating any replacement element or changing any other content.
  let tries = 0;
  const timer = setInterval(() => {
    if (replaceExistingLanguageLine() || ++tries > 20) clearInterval(timer);
  }, 250);
})();
