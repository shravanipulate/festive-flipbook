(() => {
  if (window.__birthdayUpgradeV7Loaded) return;
  window.__birthdayUpgradeV7Loaded = true;

  const PI = '1415926535897932384626433832795028841971693993751058205028849593078164062862089986280348253421170679';
  const css = document.createElement('style');
  css.textContent = `#pi-challenge-overlay{position:fixed;inset:0;z-index:1000005;display:none;align-items:center;justify-content:center;padding:20px;background:rgba(10,9,8,.84);backdrop-filter:blur(16px);color:#fff;font-family:inherit}#pi-challenge-overlay.show{display:flex}.pi-card{width:min(820px,95vw);max-height:88vh;overflow:auto;background:linear-gradient(145deg,rgba(29,24,21,.99),rgba(17,15,14,.99));border:1px solid rgba(217,164,65,.35);border-radius:26px;padding:28px;box-shadow:0 35px 120px rgba(0,0,0,.58);text-align:center}.pi-kicker{font-size:9px;letter-spacing:.28em;text-transform:uppercase;opacity:.48}.pi-symbol{font-size:50px;color:#e1ae4b}.pi-title{font-size:27px;font-weight:850;margin-top:8px}.pi-copy{font-size:12px;line-height:1.65;opacity:.62;margin:9px auto 18px;max-width:560px}.pi-board{position:relative;text-align:left;border:1px solid rgba(255,255,255,.1);background:rgba(0,0,0,.18);border-radius:18px;padding:16px;min-height:125px;max-height:310px;overflow:auto}.pi-prefix{position:absolute;top:16px;left:16px;font:700 18px ui-monospace,monospace;opacity:.72}.pi-digits{padding-left:38px;display:flex;flex-wrap:wrap}.pi-digit{width:14px;height:24px;display:inline-flex;align-items:center;justify-content:center;font:700 16px ui-monospace,monospace}.pi-digit.correct{color:#70d89a}.pi-digit.wrong{color:#ff6b61;background:rgba(255,75,65,.1)}.pi-digit.fixed{color:#e9ae50;background:rgba(233,174,80,.1)}.pi-input{width:100%;box-sizing:border-box;margin-top:11px;border:1px solid rgba(217,164,65,.2);background:rgba(255,255,255,.045);color:transparent;caret-color:#e9ae50;border-radius:13px;padding:12px 14px;font:700 15px ui-monospace,monospace;outline:0}.pi-actions{display:flex;gap:8px;justify-content:center;margin-top:13px}.pi-btn{border:1px solid rgba(217,164,65,.4);background:rgba(217,164,65,.09);color:#fff;border-radius:11px;padding:10px 16px;cursor:pointer;font:700 11px inherit}.pi-btn:disabled{opacity:.45}.pi-status{display:flex;justify-content:space-between;margin-top:13px;font-size:10px;opacity:.55}.pi-live{color:#e9ae50}.pi-finish{display:none;margin-top:14px}.pi-finish.show{display:block}.pi-score{font-size:36px;font-weight:850;color:#e9ae50}.pi-finish-copy{font-size:12px;opacity:.62;line-height:1.6}.pi-secret-flash{position:fixed;inset:0;z-index:1000006;display:flex;align-items:center;justify-content:center;pointer-events:none;font-size:34px;font-weight:900;letter-spacing:.02em;color:#e9ae50;text-shadow:0 0 28px rgba(233,174,80,.38);animation:piSecretFlash .75s ease forwards}@keyframes piSecretFlash{0%{opacity:0;transform:scale(.82)}22%{opacity:1;transform:scale(1)}72%{opacity:1}100%{opacity:0;transform:scale(1.05)}}.pi-secret-source{cursor:pointer!important;animation:piSecretGlow 2.4s ease-in-out infinite}@keyframes piSecretGlow{0%,100%{filter:drop-shadow(0 0 0 rgba(233,174,80,0))}50%{filter:drop-shadow(0 0 9px rgba(233,174,80,.34))}}`;
  document.head.appendChild(css);

  const overlay = document.createElement('div');
  overlay.id = 'pi-challenge-overlay';
  overlay.innerHTML = `<div class="pi-card"><div class="pi-kicker">secret challenge unlocked</div><div class="pi-symbol">π</div><div class="pi-title">Okay. You said 100+.</div><div class="pi-copy">No timer. No pressure. Just type π from memory, <em>one digit at a time</em>.<br>Green = correct. Red = wrong. Correct a wrong digit and it turns warm yellow-orange.</div><div class="pi-board"><div class="pi-prefix">3.</div><div class="pi-digits" id="pi-digits"><span style="opacity:.25">start typing…</span></div></div><input class="pi-input" id="pi-input" inputmode="numeric" autocomplete="off" spellcheck="false" placeholder="type the digits after 3."><div class="pi-actions"><button class="pi-btn" id="pi-finish-btn">Finish ↵</button><button class="pi-btn" id="pi-close">Leave</button></div><div class="pi-status"><span id="pi-progress">0 digits</span><span class="pi-live" id="pi-live">memory mode</span></div><div class="pi-finish" id="pi-finish"><div class="pi-score" id="pi-score"></div><div class="pi-finish-copy" id="pi-finish-copy"></div></div></div>`;
  document.body.appendChild(overlay);

  const input = overlay.querySelector('#pi-input');
  const digits = overlay.querySelector('#pi-digits');
  const progress = overlay.querySelector('#pi-progress');
  const live = overlay.querySelector('#pi-live');
  const finishBox = overlay.querySelector('#pi-finish');
  const score = overlay.querySelector('#pi-score');
  const finishCopy = overlay.querySelector('#pi-finish-copy');
  const finishBtn = overlay.querySelector('#pi-finish-btn');
  let finished = false;
  const wrongBefore = new Set();
  const corrected = new Set();

  function render(){
    const value=input.value;
    digits.innerHTML='';
    if(!value){digits.innerHTML='<span style="opacity:.25">start typing…</span>';progress.textContent='0 digits';live.textContent='memory mode';return;}
    [...value].forEach((d,i)=>{const s=document.createElement('span');s.className='pi-digit '+(d===PI[i]?(corrected.has(i)?'fixed':'correct'):'wrong');s.textContent=d;digits.appendChild(s);});
    progress.textContent=`${value.length} digit${value.length===1?'':'s'}`;
    const wrong=[...value].filter((d,i)=>d!==PI[i]).length;
    live.textContent=wrong?`${wrong} currently wrong`:'all green so far';
  }

  function finish(){
    if(finished)return;
    finished=true;input.disabled=true;finishBtn.disabled=true;
    const value=input.value;let correct=0;for(let i=0;i<value.length;i++)if(value[i]===PI[i])correct++;
    score.textContent=`${correct} / ${value.length||0}`;
    const exact=value.length>0&&value===PI.slice(0,value.length);
    finishCopy.textContent=!value.length?'You stopped before entering anything. Fair enough. 😭':exact&&value.length>=100?`You got ${value.length} consecutive digits from memory. Yeah… that π flex was real.`:exact?`${value.length} consecutive digits. Not bad at all.`:`${correct} digits matched their positions. Game over.`;
    finishBox.classList.add('show');live.textContent='FINISHED';
  }

  input.addEventListener('input',()=>{
    if(finished)return;
    input.value=input.value.replace(/\D/g,'');
    const i=input.value.length-1;
    if(i>=0){if(input.value[i]!==PI[i])wrongBefore.add(i);else if(wrongBefore.has(i))corrected.add(i);}
    render();
  });
  input.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();finish();}});
  finishBtn.onclick=finish;
  overlay.querySelector('#pi-close').onclick=()=>overlay.classList.remove('show');
  overlay.addEventListener('click',e=>{if(e.target===overlay)overlay.classList.remove('show');});
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&overlay.classList.contains('show'))overlay.classList.remove('show');});

  const open=()=>{overlay.classList.add('show');input.focus();};
  const showPiSecretThenOpen=()=>{
    if(document.querySelector('.pi-secret-flash')) return;
    const flash=document.createElement('div');
    flash.className='pi-secret-flash';
    flash.textContent='<3.14';
    document.body.appendChild(flash);
    setTimeout(()=>{flash.remove();open();},750);
  };
  const decorate=()=>{
    document.querySelectorAll('body *').forEach(el=>{
      if(el.closest('#pi-challenge-overlay')||el.dataset.piSecretReady)return;
      if((el.textContent||'').trim()!=='π')return;
      el.dataset.piSecretReady='1';el.classList.add('pi-secret-source');
    });
  };
  document.addEventListener('click',e=>{
    const el=e.target?.closest?.('button,[role="button"],a,span,div');
    if(!el||el.closest('#pi-challenge-overlay')||(el.textContent||'').replace(/\s+/g,' ').trim()!=='π')return;
    e.preventDefault();e.stopImmediatePropagation();showPiSecretThenOpen();
  },true);
  decorate();
})();
