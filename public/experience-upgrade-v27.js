(() => {
  if (window.__birthdayFlipbookV27Loaded) return;
  window.__birthdayFlipbookV27Loaded = true;

  const style = document.createElement('style');
  style.textContent = `
    #birthday-flip-nav {
      position: fixed;
      inset: 0;
      z-index: 2147482990;
      pointer-events: none;
    }
    .birthday-flip-arrow {
      position: absolute;
      top: 50%;
      transform: translateY(-50%);
      width: 46px;
      height: 72px;
      border: 1px solid rgba(255,255,255,.16);
      border-radius: 16px;
      background: rgba(18,15,14,.58);
      backdrop-filter: blur(12px);
      color: #fff;
      font: 400 34px/1 system-ui,sans-serif;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      pointer-events: auto;
      opacity: .42;
      transition: opacity .2s, transform .2s, background .2s, border-color .2s;
      box-shadow: 0 10px 35px rgba(0,0,0,.18);
      user-select: none;
      -webkit-tap-highlight-color: transparent;
    }
    .birthday-flip-arrow:hover { opacity: .9; background: rgba(18,15,14,.78); border-color: rgba(217,164,65,.48); }
    .birthday-flip-arrow.left { left: 13px; }
    .birthday-flip-arrow.right { right: 13px; }
    .birthday-flip-arrow.left:hover { transform: translateY(-50%) translateX(-2px); }
    .birthday-flip-arrow.right:hover { transform: translateY(-50%) translateX(2px); }
    .birthday-flip-arrow.disabled { opacity: .12; pointer-events: none; }

    #birthday-page-turn {
      position: fixed;
      inset: 0;
      z-index: 2147482995;
      pointer-events: none;
      display: none;
      perspective: 1400px;
      overflow: hidden;
    }
    #birthday-page-turn.show { display: block; }
    .birthday-page {
      position: absolute;
      top: -2%;
      bottom: -2%;
      width: 53%;
      background: linear-gradient(90deg, rgba(255,255,255,.025), rgba(255,255,255,.13), rgba(255,255,255,.025));
      border: 1px solid rgba(255,255,255,.09);
      box-shadow: 0 0 45px rgba(0,0,0,.14);
      backface-visibility: hidden;
      transform-style: preserve-3d;
    }
    .birthday-page.next { right: -3%; transform-origin: left center; animation: birthdayPageNext .62s cubic-bezier(.2,.72,.18,1) both; }
    .birthday-page.prev { left: -3%; transform-origin: right center; animation: birthdayPagePrev .62s cubic-bezier(.2,.72,.18,1) both; }
    @keyframes birthdayPageNext {
      0% { transform: rotateY(0deg); opacity: .0; }
      8% { opacity: 1; }
      52% { transform: rotateY(-88deg); opacity: 1; }
      100% { transform: rotateY(-180deg); opacity: 0; }
    }
    @keyframes birthdayPagePrev {
      0% { transform: rotateY(0deg); opacity: .0; }
      8% { opacity: 1; }
      52% { transform: rotateY(88deg); opacity: 1; }
      100% { transform: rotateY(180deg); opacity: 0; }
    }
    @media(max-width:600px){
      .birthday-flip-arrow { width: 36px; height: 58px; border-radius: 13px; font-size: 27px; }
      .birthday-flip-arrow.left { left: 7px; }
      .birthday-flip-arrow.right { right: 7px; }
    }
    @media(prefers-reduced-motion:reduce){
      .birthday-page.next,.birthday-page.prev{animation-duration:.15s}
    }
  `;
  document.head.appendChild(style);

  const nav = document.createElement('div');
  nav.id = 'birthday-flip-nav';
  nav.innerHTML = '<button class="birthday-flip-arrow left" type="button" aria-label="Previous slide">‹</button><button class="birthday-flip-arrow right" type="button" aria-label="Next slide">›</button>';
  document.body.appendChild(nav);
  const left = nav.querySelector('.left');
  const right = nav.querySelector('.right');

  const turn = document.createElement('div');
  turn.id = 'birthday-page-turn';
  document.body.appendChild(turn);

  const visible = el => {
    if (!el) return false;
    const r = el.getBoundingClientRect(), s = getComputedStyle(el);
    return r.width > 0 && r.height > 0 && s.display !== 'none' && s.visibility !== 'hidden' && s.opacity !== '0';
  };
  const slides = () => [...document.querySelectorAll('#app .slide, .slide')];
  const activeIndex = () => slides().findIndex(s => s.classList.contains('active'));

  function refresh() {
    const list = slides();
    const i = list.findIndex(s => s.classList.contains('active'));
    left.classList.toggle('disabled', i <= 0);
    right.classList.toggle('disabled', i < 0 || i >= list.length - 1);
  }

  function playTurn(direction) {
    turn.innerHTML = `<div class="birthday-page ${direction}"></div>`;
    turn.classList.remove('show');
    void turn.offsetWidth;
    turn.classList.add('show');
    setTimeout(() => {
      turn.classList.remove('show');
      turn.innerHTML = '';
    }, 650);
  }

  function findNext() {
    const el = document.getElementById('navNext');
    return visible(el) ? el : null;
  }
  function findPrev() {
    const el = document.getElementById('navPrev');
    return visible(el) ? el : null;
  }

  function go(direction) {
    if (document.getElementById('pi-challenge-overlay')?.classList.contains('show')) return;
    if (document.getElementById('experience-recorder-result')?.classList.contains('show')) return;

    const target = direction === 'next' ? findNext() : findPrev();
    if (!target) return;

    playTurn(direction === 'next' ? 'next' : 'prev');
    setTimeout(() => {
      try { target.click(); } catch (_) {}
      setTimeout(refresh, 80);
    }, 135);
  }

  left.addEventListener('click', e => { e.preventDefault(); e.stopPropagation(); go('prev'); });
  right.addEventListener('click', e => { e.preventDefault(); e.stopPropagation(); go('next'); });

  document.addEventListener('keydown', e => {
    if (e.key === 'ArrowRight') { e.preventDefault(); go('next'); }
    else if (e.key === 'ArrowLeft') { e.preventDefault(); go('prev'); }
  }, true);

  const observer = new MutationObserver(refresh);
  observer.observe(document.body, {subtree:true, childList:true, attributes:true, attributeFilter:['class','style','hidden']});
  refresh();
})();
