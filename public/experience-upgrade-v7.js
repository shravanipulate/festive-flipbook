(() => {
  if (window.__birthdayUpgradeV7Loaded) return;
  window.__birthdayUpgradeV7Loaded = true;

  // Plenty of π digits so there is no 100-digit stopping point in the UI.
  const PI_DIGITS = '1415926535897932384626433832795028841971693993751058209749445923078164062862089986280348253421170679821480865132823066470938446095505822317253594081284811174502841027019385211055596446229489549303819644288109756659334461284756482337867831652712019091456485669234603486104543266482133936072602491412737245870066063155881748815209209628292540917153643678925903600113305305488204665213841469519415116094330572703657595919530921861173819326117931051185480744623799627495673518857527248912279381830119491298336733624406566430860213949463952247371907021798609437027705392171762931767523846748184676694051320005681271452635608277857713427577896091736371787214684409012249534301465495853710507922796892589235410199561121290219608640344181598136297747713099605187072113499999983729780499510597317328160963185950244594553469083026425223082533446850352619311881710100031378387528865875332083814206171776691473035982534904287554687311595628638823537875937519577818577805321712268066130019278766111959092164201989';

  const style = document.createElement('style');
  style.textContent = `
    #pi-challenge-overlay{position:fixed;inset:0;z-index:1000005;display:none;align-items:center;justify-content:center;padding:20px;background:rgba(10,9,8,.82);backdrop-filter:blur(16px);color:#fff;font-family:inherit}
    #pi-challenge-overlay.show{display:flex;animation:piFade .25s ease both}
    @keyframes piFade{from{opacity:0;transform:scale(.985)}to{opacity:1;transform:scale(1)}}
    .pi-card{width:min(820px,95vw);max-height:88vh;overflow:auto;background:linear-gradient(145deg,rgba(29,24,21,.99),rgba(17,15,14,.99));border:1px solid rgba(217,164,65,.35);border-radius:26px;padding:28px;box-shadow:0 35px 120px rgba(0,0,0,.58);text-align:center}
    .pi-kicker{font-size:9px;letter-spacing:.28em;text-transform:uppercase;opacity:.48;margin-bottom:9px}
    .pi-symbol{font-size:50px;line-height:1;color:#e1ae4b;text-shadow:0 0 30px rgba(225,174,75,.24)}
    .pi-title{font-size:27px;font-weight:850;margin-top:8px;letter-spacing:-.02em}
    .pi-copy{font-size:12px;line-height:1.65;opacity:.62;margin:9px auto 18px;max-width:560px}
    .pi-copy em{color:#e4b65c;font-style:normal;opacity:.95}
    .pi-board{position:relative;text-align:left;border:1px solid rgba(255,255,255,.10);background:rgba(0,0,0,.18);border-radius:18px;padding:16px;min-height:125px;max-height:310px;overflow:auto;box-shadow:inset 0 1px rgba(255,255,255,.035)}
    .pi-prefix{position:absolute;top:16px;left:16px;color:rgba(255,255,255,.72);font:700 18px/1 ui-monospace,SFMono-Regular,Consolas,monospace}
    .pi-digits{padding-left:38px;padding-top:0;display:flex;flex-wrap:wrap;align-content:flex-start;gap:0}
    .pi-digit{width:14px;height:24px;display:inline-flex;align-items:center;justify-content:center;font:700 16px/1 ui-monospace,SFMono-Regular,Consolas,monospace;border-radius:4px;transition:background .18s,color .18s,transform .18s}
    .pi-digit.correct{color:#70d89a;text-shadow:0 0 10px rgba(112,216,154,.22)}
    .pi-digit.wrong{color:#ff6b61;background:rgba(255,75,65,.10);text-shadow:0 0 10px rgba(255,75,65,.18);animation:piWrong .18s ease}
    .pi-digit.fixed{color:#e9ae50;background:rgba(233,174,80,.10);text-shadow:0 0 10px rgba(233,174,80,.2)}
    @keyframes piWrong{50%{transform:translateX(-2px)}}
    .pi-empty{font:500 13px/1.7 ui-monospace,SFMono-Regular,Consolas,monospace;color:rgba(255,255,255,.24);padding-top:4px}
    .pi-input-wrap{position:relative;margin-top:11px}
    .pi-input{width:100%;box-sizing:border-box;border:1px solid rgba(217,164,65,.20);background:rgba(255,255,255,.045);color:transparent;caret-color:#e9ae50;border-radius:13px;padding:12px 14px;font:700 15px ui-monospace,SFMono-Regular,Consolas,monospace;outline:none;letter-spacing:.06em;position:relative;z-index:2}
    .pi-input:focus{border-color:rgba(217,164,65,.55);box-shadow:0 0 0 3px rgba(217,164,65,.07)}
    .pi-input::placeholder{color:rgba(255,255,255,.25)}
    .pi-actions{display:flex;gap:8px;justify-content:center;margin-top:13px;flex-wrap:wrap}
    .pi-btn{border:1px solid rgba(217,164,65,.40);background:rgba(217,164,65,.09);color:#fff;border-radius:11px;padding:10px 16px;cursor:pointer;font:700 11px inherit;transition:.18s}
    .pi-btn:hover{background:rgba(217,164,65,.17);transform:translateY(-1px)}
    .pi-btn:disabled{opacity:.45;cursor:default;transform:none}
    .pi-close{border-color:rgba(255,255,255,.11);background:rgba(255,255,255,.04)}
    .pi-status{display:flex;justify-content:space-between;gap:12px;margin-top:13px;font-size:10px;opacity:.55;font-variant-numeric:tabular-nums}
    .pi-live{color:#e9ae50;opacity:.9}
    .pi-legend{margin-top:10px;display:flex;justify-content:center;gap:14px;flex-wrap:wrap;font-size:9px;opacity:.42}
    .pi-legend span{display:inline-flex;align-items:center;gap:5px}.pi-dot{width:7px;height:7px;border-radius:50%;display:inline-block}.pi-dot.g{background:#70d89a}.pi-dot.r{background:#ff6b61}.pi-dot.o{background:#e9ae50}
    .pi-finish{display:none;animation:piFinish .35s ease both}.pi-finish.show{display:block}
    @keyframes piFinish{from{opacity:0;transform:translateY(5px)}to{opacity:1;transform:none}}
    .pi-score{font-size:36px;font-weight:850;color:#e9ae50;margin:7px 0}.pi-finish-copy{font-size:12px;opacity:.62;line-height:1.6}
    .pi-transition{position:fixed;inset:0;z-index:1000006;display:none;align-items:center;justify-content:center;background:rgba(9,8,7,.94);color:#e9ae50;font:700 42px ui-monospace,SFMono-Regular,Consolas,monospace;letter-spacing:.03em}
    .pi-transition.show{display:flex;animation:piFade .2s ease both}
    @media(max-width:600px){.pi-card{padding:20px}.pi-digit{width:13px}.pi-board{max-height:260px}}
  `;
  document.head.appendChild(style);

  const transition = document.createElement('div');
  transition.className = 'pi-transition';
  transition.textContent = '<3.14';
  document.body.appendChild(transition);

  const overlay = document.createElement('div');
  overlay.id = 'pi-challenge-overlay';
  overlay.innerHTML = `<div class="pi-card">
    <div class="pi-kicker">secret challenge unlocked</div>
    <div class="pi-symbol">π</div>
    <div class="pi-title">Okay. You said 100+.</div>
    <div class="pi-copy">No timer. No pressure. Just type π from memory, <em>one digit at a time</em>.<br>Green means you nailed it. Red means nope. Erase a mistake and get it right later — that digit turns warm yellow-orange.</div>
    <div class="pi-board" id="pi-board"><div class="pi-prefix">3.</div><div class="pi-digits" id="pi-digits"><div class="pi-empty">start typing…</div></div></div>
    <div class="pi-input-wrap"><input class="pi-input" id="pi-input" inputmode="numeric" autocomplete="off" spellcheck="false" placeholder="type the digits after 3. — take your time"></div>
    <div class="pi-actions"><button class="pi-btn" id="pi-finish-btn">Finish ↵</button><button class="pi-btn pi-close" id="pi-close">Leave</button></div>
    <div class="pi-status"><span id="pi-progress">0 digits</span><span class="pi-live" id="pi-live">memory mode</span></div>
    <div class="pi-legend"><span><i class="pi-dot g"></i>correct</span><span><i class="pi-dot r"></i>wrong</span><span><i class="pi-dot o"></i>corrected</span></div>
    <div class="pi-finish" id="pi-finish"><div class="pi-score" id="pi-score"></div><div class="pi-finish-copy" id="pi-finish-copy"></div></div>
  </div>`;
  document.body.appendChild(overlay);

  const input = overlay.querySelector('#pi-input');
  const digitsEl = overlay.querySelector('#pi-digits');
  const progressEl = overlay.querySelector('#pi-progress');
  const liveEl = overlay.querySelector('#pi-live');
  const finishBtn = overlay.querySelector('#pi-finish-btn');
  const finishBox = overlay.querySelector('#pi-finish');
  const scoreEl = overlay.querySelector('#pi-score');
  const finishCopy = overlay.querySelector('#pi-finish-copy');
  let finished = false;
  let corrected = new Set();
  let hadWrong = new Set();

  const render = () => {
    const value = input.value;
    digitsEl.innerHTML = '';
    if (!value) { digitsEl.innerHTML = '<div class="pi-empty">start typing…</div>'; progressEl.textContent='0 digits'; liveEl.textContent='memory mode'; return; }
    [...value].forEach((digit, i) => {
      const span = document.createElement('span');
      span.className = 'pi-digit ' + (digit === PI_DIGITS[i] ? (corrected.has(i) ? 'fixed' : 'correct') : 'wrong');
      span.textContent = digit;
      digitsEl.appendChild(span);
    });
    progressEl.textContent = `${value.length} digit${value.length === 1 ? '' : 's'}`;
    const wrong = [...value].filter((d,i)=>d !== PI_DIGITS[i]).length;
    liveEl.textContent = wrong ? `${wrong} currently wrong` : 'all green so far';
    digitsEl.parentElement.scrollTop = digitsEl.parentElement.scrollHeight;
  };

  const finish = () => {
    if (finished) return;
    finished = true;
    input.blur();
    input.disabled = true;
    finishBtn.disabled = true;
    const value = input.value;
    let correct = 0;
    for (let i=0; i<value.length; i++) if (value[i] === PI_DIGITS[i]) correct++;
    const exact = value.length > 0 && value.length <= PI_DIGITS.length && value === PI_DIGITS.slice(0,value.length);
    scoreEl.textContent = `${correct} / ${value.length || 0}`;
    if (!value.length) finishCopy.textContent = 'You stopped before entering anything. Fair enough. 😭';
    else if (exact && value.length >= 100) finishCopy.textContent = `You got ${value.length} consecutive digits from memory. Yeah… that π flex was real.`;
    else if (exact) finishCopy.textContent = `${value.length} consecutive digits. Not bad at all. The game ends exactly where you decided to stop.`;
    else finishCopy.textContent = `${correct} digits matched their positions. Game over — no editing after Enter.`;
    finishBox.classList.add('show');
    liveEl.textContent = 'FINISHED';
  };

  input.addEventListener('input', () => {
    if (finished) return;
    const before = input.value;
    input.value = before.replace(/\D/g,'');
    const pos = input.value.length - 1;
    if (pos >= 0 && input.value[pos] !== PI_DIGITS[pos]) hadWrong.add(pos);
    else if (pos >= 0 && hadWrong.has(pos)) corrected.add(pos);
    render();
  });

  input.addEventListener('keydown', e => {
    if (e.key === 'Enter') { e.preventDefault(); finish(); }
  });
  finishBtn.addEventListener('click', finish);
  overlay.querySelector('#pi-close').addEventListener('click', () => overlay.classList.remove('show'));
  overlay.addEventListener('click', e => { if (e.target === overlay && !finished) overlay.classList.remove('show'); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && overlay.classList.contains('show') && !finished) overlay.classList.remove('show'); });

  const openGame = () => {
    transition.classList.add('show');
    setTimeout(() => {
      transition.classList.remove('show');
      overlay.classList.add('show');
      input.focus();
    }, 650);
  };

  const isPiTarget = el => {
    if (!el || el.closest('#pi-challenge-overlay')) return false;
    const text = (el.innerText || el.textContent || '').replace(/\s+/g,' ').trim();
    return text === 'π' || /^π\s*[+×x·]\s*π$/.test(text) || /^pi$/i.test(text);
  };

  const decoratePi = () => {
    const all = [...document.querySelectorAll('body *')];
    all.forEach(el => {
      if (el.closest('#pi-challenge-overlay')) return;
      const text = (el.innerText || el.textContent || '').replace(/\s+/g,' ').trim();
      if (text !== 'π') return;
      if (el.dataset.piSecretReady) return;
      el.dataset.piSecretReady = '1';
      el.style.cursor = 'pointer';
      el.style.transition = 'text-shadow .8s ease, opacity .8s ease';
      el.style.textShadow = '0 0 5px rgba(225,174,75,.22)';
      el.addEventListener('mouseenter', () => el.style.textShadow = '0 0 12px rgba(225,174,75,.55)', {passive:true});
      el.addEventListener('mouseleave', () => el.style.textShadow = '0 0 5px rgba(225,174,75,.22)', {passive:true});
    });
  };

  document.addEventListener('click', e => {
    const target = e.target?.closest?.('button,[role="button"],a,span,div');
    if (!isPiTarget(target)) return;
    e.preventDefault();
    e.stopImmediatePropagation();
    openGame();
  }, true);

  decoratePi();
  new MutationObserver(decoratePi).observe(document.body,{subtree:true,childList:true,characterData:true});
})();
