(() => {
  if (window.__birthdayUpgradeV2Loaded) return;
  window.__birthdayUpgradeV2Loaded = true;

  const GREETINGS = [
    'नमस्ते', 'Hello', 'प्रणाम', 'ਸਤ ਸ੍ਰੀ ਅਕਾਲ', 'Hallo', 'こんにちは',
    'नमः', 'নমস্কাৰ', 'নমস্কার', 'ନମସ୍କାର', 'प्रणाम', 'Hello', '你好'
  ];

  // IMPORTANT: do not create a new animation here.
  // Find the language line already present in experience.html and change ONLY its text.
  // That leaves the original animation, colors, spacing, speed and layout untouched.
  const oldLanguageBits = [
    'Hello', 'Bonjour', 'Hola', 'مرحبا', 'Olá', '안녕', 'namaste',
    'नमस्ते', 'নমস্কার', 'こんにちは', 'नमस्कार', 'ਸਤ ਸ੍ਰੀ ਅਕਾਲ', 'Hallo', '你好'
  ];

  const normalize = s => (s || '').replace(/\s+/g, ' ').trim();

  function replaceOriginalLanguageLine() {
    const candidates = [...document.querySelectorAll('body *')].filter(el => {
      if (el.children.length > 0) return false;
      const text = normalize(el.textContent);
      if (!text || text.length > 300) return false;
      const hits = oldLanguageBits.filter(x => text.toLowerCase().includes(x.toLowerCase())).length;
      return hits >= 2;
    });

    // Prefer the element immediately associated with the LANGUAGES label.
    let target = candidates.find(el => {
      const p = el.parentElement;
      return p && /languages/i.test(normalize(p.textContent));
    });
    if (!target) target = candidates[0];
    if (!target) return false;

    // If the original animation uses one text node, keep that exact element and
    // replace only its string. If it uses multiple animated spans, replace each
    // span's text without removing the spans/classes that carry the animation.
    const leaves = candidates.filter(el => target === el || target.contains(el));
    if (leaves.length > 1) {
      leaves.forEach((el, i) => {
        if (i < GREETINGS.length) el.textContent = GREETINGS[i];
      });
    } else {
      target.textContent = GREETINGS.join('   ');
    }
    return true;
  }

  const runLanguageFix = () => {
    if (replaceOriginalLanguageLine()) return;
    setTimeout(replaceOriginalLanguageLine, 300);
    setTimeout(replaceOriginalLanguageLine, 1000);
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', runLanguageFix, { once: true });
  } else {
    runLanguageFix();
  }

  // Keep the existing name cleanup from the earlier patch; this does not touch
  // the language animation.
  const cleanShandilya = () => {
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach(n => {
      if (/shandilya/i.test(n.nodeValue || '')) {
        n.nodeValue = n.nodeValue.replace(/\s*shandilya\s*/gi, ' ');
      }
    });
  };
  cleanShandilya();
  new MutationObserver(cleanShandilya).observe(document.body, {
    subtree: true, childList: true, characterData: true
  });

  const name = document.getElementById('bu-name');
  if (name) {
    const old = name.textContent || '';
    if (/chinmay/i.test(old) || /shandilya/i.test(old)) name.textContent = 'CHINMAY';
  }
  const oldReveal = window.__birthdayNameReveal;
  if (typeof oldReveal === 'function') window.__birthdayNameReveal = null;
})();
