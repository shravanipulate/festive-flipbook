(() => {
  if (window.__birthdayUpgradeV2Loaded) return;
  window.__birthdayUpgradeV2Loaded = true;

  // ONLY the languages requested by Shravani.
  const LANGS = [
    ['Hindi', 'नमस्ते'],
    ['English', 'Hello'],
    ['Maithili', 'प्रणाम'],
    ['Punjabi', 'ਸਤ ਸ੍ਰੀ ਅਕਾਲ'],
    ['German · 20%', 'Hallo'],
    ['Japanese', 'こんにちは'],
    ['Sanskrit', 'नमः'],
    ['Assamese', 'নমস্কাৰ'],
    ['Bengali', 'নমস্কার'],
    ['Odia', 'ନମସ୍କାର'],
    ['Bhojpuri', 'प्रणाम'],
    ['Tribal languages', 'Hello'],
    ['Mandarin', '你好']
  ];

  // Remove the previous continuous language-rain layer completely.
  document.getElementById('bu-language-stream')?.remove();

  const style = document.createElement('style');
  style.textContent = `
    #bu-language-message {
      position: fixed;
      left: 50%;
      top: 52%;
      transform: translate(-50%, -50%);
      z-index: 9999;
      width: min(92vw, 900px);
      text-align: center;
      pointer-events: none;
      opacity: 0;
      transition: opacity 900ms ease, transform 900ms cubic-bezier(.16,1,.3,1);
    }
    #bu-language-message.show { opacity: 1; }
    #bu-language-message .bu-multi-line {
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      align-items: baseline;
      gap: .08em .28em;
      line-height: 1.45;
    }
    #bu-language-message .bu-word {
      display: inline-block;
      font-size: clamp(18px, 3vw, 34px);
      font-weight: 600;
      letter-spacing: .015em;
      opacity: .92;
    }
    #bu-language-message .bu-word:nth-child(3n) { opacity: .72; }
    #bu-language-message .bu-word:nth-child(4n) { font-style: italic; }
    #bu-language-message .bu-label {
      margin-top: 18px;
      font-size: 11px;
      letter-spacing: .22em;
      text-transform: uppercase;
      opacity: .42;
    }
    #birthday-upgrade-overlay .bu-name {
      font-size: clamp(42px, 10vw, 118px);
      letter-spacing: .12em;
    }
    #birthday-upgrade-overlay .bu-name span {
      display: inline-block;
      will-change: transform, opacity, filter;
    }
  `;
  document.head.appendChild(style);

  // Replace the old opening language text with ONE calm, static multilingual line.
  // No continuous scrolling/rain animation.
  const message = document.createElement('div');
  message.id = 'bu-language-message';

  const line = document.createElement('div');
  line.className = 'bu-multi-line';

  // A natural birthday greeting assembled from the requested languages only.
  const words = [
    'नमस्ते',       // Hindi — Hello
    'Hello',        // English — Hello
    'प्रणाम',       // Maithili — Hello
    'ਸਤ ਸ੍ਰੀ ਅਕਾਲ', // Punjabi — Hello
    'Hallo',        // German — Hello
    'こんにちは',    // Japanese — Hello
    'नमः',          // Sanskrit — Greetings
    'নমস্কাৰ',       // Assamese — Hello
    'নমস্কার',       // Bengali — Hello
    'ନମସ୍କାର',      // Odia — Hello
    'प्रणाम',        // Bhojpuri — Hello
    'Hello',        // Tribal languages — Hello
    '你好'           // Mandarin — Hello
  ];

  words.forEach((word) => {
    const span = document.createElement('span');
    span.className = 'bu-word';
    span.textContent = word;
    line.appendChild(span);
  });

  const label = document.createElement('div');
  label.className = 'bu-label';
  label.textContent = '13+ languages · one birthday';

  message.append(line, label);
  document.body.appendChild(message);

  // Show it only on the opening page, like the original static language text.
  const setOpening = (on) => {
    message.classList.toggle('show', !!on);
  };
  setOpening(true);

  // Stop showing the replacement once the experience moves forward.
  const originalNext = window.nextSlide;
  if (typeof originalNext === 'function') {
    window.nextSlide = function (...args) {
      setOpening(false);
      return originalNext.apply(this, args);
    };
  }

  const observer = new MutationObserver(() => {
    const active = document.querySelector('.slide.active, .page.active, [data-slide].active, [aria-current="true"]');
    if (active) {
      const all = [...document.querySelectorAll('.slide, .page, [data-slide]')];
      if (all.length && all.indexOf(active) > 0) setOpening(false);
    }
  });
  observer.observe(document.body, {
    subtree: true,
    attributes: true,
    attributeFilter: ['class', 'style', 'aria-current']
  });

  // Hide only the OLD random greeting elements, leaving the original page intact.
  const hideLegacyRandomGreetings = () => {
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);

    nodes.forEach((node) => {
      const text = (node.nodeValue || '').trim();
      if (!text || node.parentElement?.closest('#bu-language-message')) return;
      if (/\b(?:Bonjour|Hola|Ciao|Salut|Привет|Ol[áa])\b|안녕/.test(text)) {
        const parent = node.parentElement;
        if (parent) {
          parent.style.visibility = 'hidden';
          parent.style.opacity = '0';
        }
      }
    });
  };
  hideLegacyRandomGreetings();
  new MutationObserver(hideLegacyRandomGreetings).observe(document.body, {
    subtree: true,
    childList: true,
    characterData: true
  });

  // Remove the surname everywhere it appears as visible text.
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
    subtree: true,
    childList: true,
    characterData: true
  });

  // Reveal only CHINMAY.
  const name = document.getElementById('bu-name');
  if (name) {
    const old = name.textContent || '';
    if (/chinmay/i.test(old) || /shandilya/i.test(old)) name.textContent = 'CHINMAY';
  }

  const oldReveal = window.__birthdayNameReveal;
  if (typeof oldReveal === 'function') window.__birthdayNameReveal = null;

  const step = document.getElementById('bu-step');
  const overlay = document.getElementById('birthday-upgrade-overlay');
  if (step && overlay) {
    step.onclick = () => {
      overlay.classList.add('show');
      setOpening(false);
      const el = document.getElementById('bu-name');
      if (!el) return;
      el.textContent = '';
      [...'CHINMAY'].forEach((ch, i) => {
        const s = document.createElement('span');
        s.textContent = ch;
        s.style.opacity = '0';
        s.style.transform = 'translateY(28px) rotateX(70deg) scale(.65)';
        s.style.filter = 'blur(7px)';
        s.style.transition = '900ms cubic-bezier(.16,1,.3,1)';
        el.appendChild(s);
        setTimeout(() => {
          s.style.opacity = '1';
          s.style.transform = 'translateY(0) rotateX(0) scale(1)';
          s.style.filter = 'blur(0)';
        }, i * 110);
      });
    };
  }
})();
