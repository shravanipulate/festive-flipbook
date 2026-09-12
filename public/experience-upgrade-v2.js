(() => {
  if (window.__birthdayUpgradeV2Loaded) return;
  window.__birthdayUpgradeV2Loaded = true;

  const LANGS = [
    ['Hindi','नमस्ते'], ['English','Hello'], ['Maithili','प्रणाम'],
    ['Punjabi','ਸਤ ਸ੍ਰੀ ਅਕਾਲ'], ['German · 20%','Hallo'], ['Japanese','こんにちは'],
    ['Sanskrit','नमः'], ['Assamese','নমস্কাৰ'], ['Bengali','নমস্কার'],
    ['Odia','ନମସ୍କାର'], ['Bhojpuri','प्रणाम'], ['Tribal languages','Hello'],
    ['Mandarin','你好']
  ];

  const style = document.createElement('style');
  style.textContent = `
    #bu-language-stream{position:fixed;inset:0;z-index:12;pointer-events:none;overflow:hidden;display:none;opacity:.78;mask-image:linear-gradient(to bottom,transparent 0%,black 13%,black 87%,transparent 100%)}
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

  // Replace the old random-language visual with only the requested set.
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

  // Only show the requested language stream on the opening page.
  let opening = true;
  const setOpening = (on) => {
    opening = !!on;
    stream.classList.toggle('show', opening);
  };
  setOpening(true);

  // If the original experience exposes nextSlide, stop the stream as soon as it advances.
  const originalNext = window.nextSlide;
  if (typeof originalNext === 'function') {
    window.nextSlide = function(...args) {
      setOpening(false);
      return originalNext.apply(this, args);
    };
  }

  // Also react to common page/slide visibility changes without touching the legacy HTML.
  const observer = new MutationObserver(() => {
    const active = document.querySelector('.slide.active, .page.active, [data-slide].active, [aria-current="true"]');
    if (active) {
      const all = [...document.querySelectorAll('.slide, .page, [data-slide]')];
      if (all.length && all.indexOf(active) > 0) setOpening(false);
    }
  });
  observer.observe(document.body, {subtree:true, attributes:true, attributeFilter:['class','style','aria-current']});

  // Remove any accidental Shandilya text introduced by the previous upgrade layer.
  const cleanShandilya = () => {
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach(n => {
      if (/shandilya/i.test(n.nodeValue || '')) n.nodeValue = n.nodeValue.replace(/\s*shandilya\s*/gi, ' ');
    });
  };
  cleanShandilya();
  new MutationObserver(cleanShandilya).observe(document.body, {subtree:true, childList:true, characterData:true});

  // Make the reveal say only CHINMAY, with cleaner spacing and a more deliberate entrance.
  const name = document.getElementById('bu-name');
  if (name) {
    const old = name.textContent || '';
    if (/chinmay/i.test(old) || /shandilya/i.test(old)) name.textContent = 'CHINMAY';
  }
  const oldReveal = window.__birthdayNameReveal;
  if (typeof oldReveal === 'function') window.__birthdayNameReveal = null;

  // Patch the existing reveal if the previous layer's button is present.
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
