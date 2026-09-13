(() => {
  if (window.__birthdayUpgradeV7Loaded) return;
  window.__birthdayUpgradeV7Loaded = true;

  const PI_DIGITS = '1415926535897932384626433832795028841971693993751058209749445923078164062862089986280348253421170679';

  const style = document.createElement('style');
  style.textContent = `
    .pi-seven-trigger{cursor:pointer!important;animation:piSevenGlow 2s ease-in-out infinite!important;border-radius:6px;padding:1px 3px;}
    @keyframes piSevenGlow{0%,100%{text-shadow:0 0 0 transparent;opacity:.82}50%{text-shadow:0 0 10px rgba(217,164,65,.72),0 0 22px rgba(217,164,65,.25);opacity:1}}
    #pi-reveal-overlay{position:fixed;inset:0;z-index:1000006;display:none;align-items:center;justify-content:center;background:rgba(10,9,8,.92);color:#fff;font-family:inherit}
    #pi-reveal-overlay.show{display:flex;animation:piReveal .22s ease both}
    @keyframes piReveal{from{opacity:0}to{opacity:1}}
    .pi-reveal-text{font:700 clamp(30px,7vw,72px)/1 ui-monospace,SFMono-Regular,Consolas,monospace;letter-spacing:.04em;animation:piRevealText .7s ease both}
    @keyframes piRevealText{0%{opacity:0;transform:scale(.92)}35%,70%{opacity:1;transform:scale(1)}100%{opacity:0;transform:scale(1.04)}}
    #pi-challenge-overlay{position:fixed;inset:0;z-index:1000005;display:none;align-items:center;justify-content:center;padding:20px;background:rgba(10,9,8,.78);backdrop-filter:blur(12px);color:#fff;font-family:inherit}
    #pi-challenge-overlay.show{display:flex;animation:piFade .28s ease both}
    @keyframes piFade{from{opacity:0}to{opacity:1}}
    .pi-card{width:min(650px,94vw);background:rgba(24,20,18,.98);border:1px solid rgba(217,164,65,.34);border-radius:22px;padding:28px;box-shadow:0 30px 100px rgba(0,0,0,.48);text-align:center}
    .pi-kicker{font-size:10px;letter-spacing:.25em;text-transform:uppercase;opacity:.5;margin-bottom:10px}
    .pi-symbol{font-size:48px;line-height:1;color:#d9a441}
    .pi-title{font-size:25px;font-weight:800;margin-top:8px}
    .pi-copy{font-size:12px;line-height:1.6;opacity:.64;margin:10px auto 20px;max-width:480px}
    .pi-input{width:100%;box-sizing:border-box;border:1px solid rgba(255,255,255,.14);background:rgba(255,255,255,.055);color:#fff;border-radius:13px;padding:14px;font:600 15px/1.4 ui-monospace,SFMono-Regular,Consolas,monospace;outline:none;letter-spacing:.04em}
    .pi-input:focus{border-color:rgba(217,164,65,.7);box-shadow:0 0 0 3px rgba(217,164,65,.08)}
    .pi-actions{display:flex;gap:8px;justify-content:center;margin-top:13px;flex-wrap:wrap}
    .pi-btn{border:1px solid rgba(217,164,65,.42);background:rgba(217,164,65,.09);color:#fff;border-radius:11px;padding:10px 15px;cursor:pointer;font:700 11px inherit}
    .pi-btn:hover{background:rgba(217,164,65,.16);transform:translateY(-1px)}
    .pi-close{border-color:rgba(255,255,255,.12);background:rgba(255,255,255,.045)}
    .pi-progress{margin-top:15px;font-size:11px;opacity:.55;font-variant-numeric:tabular-nums}
    .pi-result{min-height:38px;margin-top:13px;font-size:12px;line-height:1.55}
    .pi-result.good{color:#d9a441}.pi-result.bad{color:#fff}.pi-result strong{font-weight:800}
    .pi-hint{font-size:10px;opacity:.35;margin-top:10px}
  `;
  document.head.appendChild(style);

  const reveal = document.createElement('div');
  reveal.id = 'pi-reveal-overlay';
  reveal.innerHTML = '<div class="pi-reveal-text">&lt;3.14</div>';
  document.body.appendChild(reveal);

  const overlay = document.createElement('div');
  overlay.id = 'pi-challenge-overlay';
  overlay.innerHTML = `<div class="pi-card">
    <div class="pi-kicker">secret challenge unlocked</div>
    <div class="pi-symbol">π</div>
    <div class="pi-title">The π Challenge</div>
    <div class="pi-copy">You said you know π to 100+ digits.<br>Okay then. Let's see how far that memory goes.</div>
    <input class="pi-input" id="pi-input" inputmode="numeric" autocomplete="off" spellcheck="false" maxlength="100" placeholder="1415926535…">
    <div class="pi-actions"><button class="pi-btn" id="pi-check">Check π</button><button class="pi-btn pi-close" id="pi-close">Escape</button></div>
    <div class="pi-progress" id="pi-progress">0 / 100 digits</div>
    <div class="pi-result" id="pi-result"></div>
    <div class="pi-hint">Enter the 100 digits after 3.</div>
  </div>`;
  document.body.appendChild(overlay);

  const input = overlay.querySelector('#pi-input');
  const progress = overlay.querySelector('#pi-progress');
  const result = overlay.querySelector('#pi-result');

  const cleanInput = () => {
    input.value = input.value.replace(/\D/g, '').slice(0, 100);
    progress.textContent = `${input.value.length} / 100 digits`;
    result.textContent = '';
    result.className = 'pi-result';
  };
  input.addEventListener('input', cleanInput);

  const check = () => {
    const typed = input.value;
    if (!typed) { result.textContent = 'Start with the digits after 3.'; return; }
    let correct = 0;
    while (correct < typed.length && typed[correct] === PI_DIGITS[correct]) correct++;
    if (typed.length === 100 && correct === 100) {
      result.className = 'pi-result good';
      result.innerHTML = '<strong>Okay wtf 😭</strong><br>You actually know all 100.';
      progress.textContent = '100 / 100 digits ✓';
    } else if (correct < typed.length) {
      result.className = 'pi-result bad';
      result.innerHTML = `<strong>${correct} correct in a row.</strong><br>The first mismatch is at digit ${correct + 1}.`;
    } else {
      result.className = 'pi-result good';
      result.innerHTML = `<strong>${correct} correct so far.</strong><br>Keep going — ${100 - correct} to go.`;
    }
  };

  overlay.querySelector('#pi-check').addEventListener('click', check);
  input.addEventListener('keydown', e => { if (e.key === 'Enter') check(); });
  overlay.querySelector('#pi-close').addEventListener('click', () => overlay.classList.remove('show'));
  overlay.addEventListener('click', e => { if (e.target === overlay) overlay.classList.remove('show'); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') overlay.classList.remove('show'); });

  const findSevenPi = () => {
    const leaves = [...document.querySelectorAll('body *')].filter(el => {
      if (el.children.length) return false;
      const text = (el.textContent || '').replace(/\s+/g, ' ').trim();
      return text === 'π' || /^pi$/i.test(text);
    });
    for (const el of leaves) {
      let p = el.parentElement;
      for (let depth = 0; p && depth < 6; depth++, p = p.parentElement) {
        const context = (p.innerText || p.textContent || '').replace(/\s+/g, ' ').trim();
        const sevens = (context.match(/7/g) || []).length;
        if (sevens >= 2 && context.includes(el.textContent.trim())) {
          el.classList.add('pi-seven-trigger');
          el.setAttribute('title', '…you noticed π.');
          return el;
        }
      }
    }
    return null;
  };

  const openChallenge = () => {
    reveal.classList.add('show');
    setTimeout(() => {
      reveal.classList.remove('show');
      overlay.classList.add('show');
      input.focus();
    }, 760);
  };

  let piTarget = null;
  const boot = () => { piTarget = piTarget || findSevenPi(); };
  boot();
  new MutationObserver(boot).observe(document.body, {subtree:true, childList:true, characterData:true});

  document.addEventListener('click', e => {
    const target = e.target?.closest?.('.pi-seven-trigger');
    if (!target) return;
    e.preventDefault();
    e.stopImmediatePropagation();
    openChallenge();
  }, true);
})();
