(() => {
  if (window.__birthdayUpgradeV2Loaded) return;
  window.__birthdayUpgradeV2Loaded = true;

  // EXACTLY the languages requested — no Korean, French, Spanish, etc.
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

  const ALLOWED_HELLOS = new Set(LANGS.map(([, hello]) => hello));

  const style = document.createElement('style');
  style.textContent = `
    #bu-language-stream{position:fixed;inset:0;z-index:9999;pointer-events:none;overflow:hidden;display:none;opacity:.78;mask-image:linear-gradient(to bottom,transparent 0%,black 13%,black 87%,transparent 100%)}
    #bu-language-stream.show{display:block}
    .bu-stream-col{position:absolute;top:-25vh;display:flex;flex-direction:column;gap:22px;white-space:nowrap;animation:buStream linear infinite}
    .bu-stream-word{font-size:clamp(13px,1.5vw,20px);letter-spacing:.08em;opacity:.32;font-weight:600}
    .bu-stream-word:nth-child(3n){opacity:.18;font-size:.85em}
    .bu-stream-word:nth-child(4n){opacity:.45}
    @keyframes buStream{from{transform:translateY(-10vh)}to{transform:translateY(125vh)}}
    #birthday-upgrade-overlay .bu-name{font-size:clamp(42px,10vw,118px);letter-spacing:.12em}
    #birthday-upgrade-overlay .bu-name span{display:inline-block;will-change:transform,opacity,filter}
    #birthday-upgrade-overlay .bu-name .bu-name-space{width:.34em}
  `;
  document.head.appendChild(style);

  // Our replacement stream.
  const stream = document.createElement('div');
  stream.id = 'bu-language-stream';
  const shuffled = [...LANGS, ...LANGS.slice(0, 6)];
  for (let c = 0; c < 10; c++) {
    const col = document.createElement('div');
    col.className = 'bu-stream-col';
    col.style.left = `${c * 10 + 2 + (c % 2) * 2}%`;
    col.style.animationDuration = `${13 + (c % 5) * 2}s`;
    col.style.animationDelay = `${-(c * 1.7)}s`;
    for (let i = 0; i < 7; i++) {
      const [name, hello] = shuffled[(i + c * 2) % shuffled.length];
      const word = document.createElement('span');
      word.className = 'bu-stream-word';
      word.textContent = hello;
      word.title = name;
      col.appendChild(word);
    }
    stream.appendChild(col);
  }
  document.body.appendChild(stream);

  let opening = true;
  const setOpening = (on) => {
    opening = !!on;
    stream.classList.toggle('show', opening);
  };

  // HARD-SUPPRESS the legacy random greeting animation on page 1.
  // The old experience contains greetings such as Bonjour/Hola/Korean, so hide
  // only elements that actually contain non-requested greeting text. This leaves
  // the rest of the page untouched.
  const unwantedGreeting = /(?:bonjour|hola|안녕|你好|ciao|salut|привет|olá|ola|hallo|hello|नमस्ते|प्रणाम|ਸਤ ਸ੍ਰੀ ਅਕਾਲ|こんにちは|नमः|নমস্কাৰ|নমস্কার|ନମସ୍କାର)/i;
  const allowedGreeting = (text) => ALLOWED_HELLOS.has((text || '').trim());
  const hideLegacyRandomGreetings = () => {
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);

    nodes.forEach((node) => {
      const text = (node.nodeValue || '').trim();
      if (!text || allowedGreeting(text)) return;

      // These are the clearly identifiable greetings visible in the old stream.
      if (/\b(?:Bonjour|Hola|Ciao|Salut|Привет|Ol[áa])\b|안녕/.test(text)) {
        const parent = node.parentElement;
        if (parent && !parent.closest('#bu-language-stream')) {
          parent.style.visibility = 'hidden';
          parent.style.opacity = '0';
        }
      }
    });
  };

  setOpening(true);
  hideLegacyRandomGreetings();
  new MutationObserver(hideLegacyRandomGreetings).observe(document.body, {
    subtree: true,
    childList: true,
    characterData: true
  });

  // Stop the language stream after leaving the opening page.
  const originalNext = window.nextSlide;
  if (typeof originalNext === 'function') {
    window.nextSlide = function(...args) {
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
  observer.observe(document.body, {subtree:true, attributes:true, attributeFilter:['class','style','aria-current']});

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
  new MutationObserver(cleanShandilya).observe(document.body, {subtree:true, childList:true, characterData:true});

  // Reveal only CHINMAY, with clean letter-by-letter spacing.
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
    const revealOnlyChinmay = () => {
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
    step.onclick = revealOnlyChinmay;
  }
})();
