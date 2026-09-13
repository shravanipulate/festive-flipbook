(() => {
  if (window.__birthdayUpgradeV7Loaded) return;
  window.__birthdayUpgradeV7Loaded = true;

  const style = document.createElement('style');
  style.textContent = `
    #pi-challenge-overlay{position:fixed;inset:0;z-index:1000005;display:none;align-items:center;justify-content:center;padding:20px;background:rgba(8,7,7,.86);backdrop-filter:blur(16px);color:#fff;font-family:inherit}
    #pi-challenge-overlay.show{display:flex;animation:piFade .25s ease both}
    @keyframes piFade{from{opacity:0;transform:scale(.985)}to{opacity:1;transform:scale(1)}}
    .pi-card{width:min(820px,95vw);min-height:390px;background:linear-gradient(145deg,rgba(29,24,21,.99),rgba(16,14,13,.99));border:1px solid rgba(217,164,65,.35);border-radius:26px;padding:30px;box-shadow:0 35px 120px rgba(0,0,0,.58);text-align:center}
    .pi-kicker{font-size:9px;letter-spacing:.28em;text-transform:uppercase;opacity:.45;margin-bottom:10px}
    .pi-title{font-size:27px;font-weight:850;letter-spacing:-.02em;margin:0}
    .pi-copy{font-size:12px;line-height:1.65;opacity:.58;margin:10px auto 22px;max-width:570px}
    .pi-board{min-height:155px;border:1px solid rgba(255,255,255,.10);background:rgba(0,0,0,.18);border-radius:18px;padding:20px;display:flex;flex-wrap:wrap;gap:10px;align-content:center;justify-content:center;overflow:hidden}
    .pi-letter{width:46px;height:56px;border:1px solid rgba(217,164,65,.30);background:linear-gradient(145deg,rgba(255,255,255,.075),rgba(255,255,255,.025));color:#fff;border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:24px;font-weight:850;cursor:grab;user-select:none;touch-action:none;box-shadow:0 8px 22px rgba(0,0,0,.18);transition:transform .16s,border-color .16s,background .16s,opacity .16s}
    .pi-letter:hover{transform:translateY(-3px);border-color:rgba(217,164,65,.7)}
    .pi-letter.dragging{opacity:.35;transform:scale(.94);cursor:grabbing}
    .pi-letter.correct{border-color:rgba(100,220,150,.75);background:rgba(60,160,100,.14)}
    .pi-actions{display:flex;justify-content:center;gap:9px;margin-top:16px;flex-wrap:wrap}
    .pi-btn{border:1px solid rgba(217,164,65,.40);background:rgba(217,164,65,.09);color:#fff;border-radius:11px;padding:10px 16px;cursor:pointer;font:700 11px inherit}
    .pi-btn:hover{background:rgba(217,164,65,.17);transform:translateY(-1px)}
    .pi-status{min-height:18px;margin-top:13px;font-size:10px;opacity:.5}
    .pi-finish{display:none;margin-top:18px;animation:piWin .45s ease both}.pi-finish.show{display:block}
    @keyframes piWin{from{opacity:0;transform:translateY(8px) scale(.98)}to{opacity:1;transform:none}}
    .pi-finish-main{font-size:30px;font-weight:900;letter-spacing:.06em}
    .pi-finish-main .a,.pi-finish-main .i{color:#e9ae50;text-shadow:0 0 18px rgba(233,174,80,.25)}
    .pi-finish-copy{font-size:11px;opacity:.5;margin-top:7px}
    @media(max-width:600px){.pi-card{padding:20px}.pi-letter{width:38px;height:48px;font-size:20px}}
  `;
  document.head.appendChild(style);

  const overlay = document.createElement('div');
  overlay.id = 'pi-challenge-overlay';
  overlay.innerHTML = `
    <div class="pi-card">
      <div class="pi-kicker">one last little problem</div>
      <h2 class="pi-title">Put this back together.</h2>
      <div class="pi-copy">The pieces are intentionally unhelpful. No hints. No word length. No indication of how many words there are. Just figure it out.</div>
      <div class="pi-board" id="pi-board"></div>
      <div class="pi-actions"><button class="pi-btn" id="pi-shuffle" type="button">Shuffle</button><button class="pi-btn" id="pi-finish-btn" type="button">Lock it in</button><button class="pi-btn" id="pi-close" type="button">Leave</button></div>
      <div class="pi-status" id="pi-status"></div>
      <div class="pi-finish" id="pi-finish"><div class="pi-finish-main">YOU ARE <span class="a">(A)</span>MAZ<span class="i">(I)</span>NG</div><div class="pi-finish-copy">Okay. That one was actually deserved.</div></div>
    </div>`;
  document.body.appendChild(overlay);

  const board = overlay.querySelector('#pi-board');
  const status = overlay.querySelector('#pi-status');
  const finishBox = overlay.querySelector('#pi-finish');
  const target = 'YOUAREAMAZING';
  let letters = [];
  let finished = false;
  let dragIndex = null;

  // Deliberately hostile arrangement: no word grouping, no obvious sequence.
  const hardOrder = [7,1,10,4,12,0,8,3,11,5,2,9,6];

  function reset(){
    finished = false;
    finishBox.classList.remove('show');
    status.textContent = '';
    const source = [...target];
    letters = hardOrder.map(i => source[i]);
    render();
  }

  function render(){
    board.innerHTML = '';
    letters.forEach((letter,index) => {
      const el = document.createElement('div');
      el.className = 'pi-letter';
      el.draggable = true;
      el.textContent = letter;
      el.dataset.index = String(index);
      el.addEventListener('dragstart', e => {
        if(finished) return;
        dragIndex = index;
        el.classList.add('dragging');
        e.dataTransfer.effectAllowed = 'move';
      });
      el.addEventListener('dragend', () => el.classList.remove('dragging'));
      el.addEventListener('dragover', e => e.preventDefault());
      el.addEventListener('drop', e => {
        e.preventDefault();
        if(finished || dragIndex === null || dragIndex === index) return;
        const moved = letters.splice(dragIndex,1)[0];
        letters.splice(index,0,moved);
        dragIndex = null;
        render();
      });
      board.appendChild(el);
    });
  }

  function finish(){
    if(finished) return;
    if(letters.join('') !== target){
      status.textContent = 'Not quite. Rearrange it.';
      board.animate([{transform:'translateX(-4px)'},{transform:'translateX(4px)'},{transform:'translateX(0)'}],{duration:220});
      return;
    }
    finished = true;
    [...board.children].forEach(el => el.classList.add('correct'));
    status.textContent = 'Locked in ✓';
    finishBox.classList.add('show');
  }

  overlay.querySelector('#pi-shuffle').addEventListener('click', reset);
  overlay.querySelector('#pi-finish-btn').addEventListener('click', finish);
  overlay.querySelector('#pi-close').addEventListener('click', () => overlay.classList.remove('show'));
  overlay.addEventListener('click', e => { if(e.target === overlay && !finished) overlay.classList.remove('show'); });
  document.addEventListener('keydown', e => { if(e.key === 'Escape' && overlay.classList.contains('show') && !finished) overlay.classList.remove('show'); });

  function isPiTarget(el){
    if(!el || el.closest('#pi-challenge-overlay')) return false;
    const text = String(el.innerText || el.textContent || '').replace(/\s+/g,' ').trim();
    return text === 'π' || /^π\s*[+×x·]\s*π$/.test(text) || /^pi$/i.test(text);
  }

  function decorate(){
    document.querySelectorAll('body *').forEach(el => {
      if(el.closest('#pi-challenge-overlay')) return;
      const text = String(el.innerText || el.textContent || '').replace(/\s+/g,' ').trim();
      if(text !== 'π' || el.dataset.piUnscrambleReady) return;
      el.dataset.piUnscrambleReady = '1';
      el.style.cursor = 'pointer';
      el.style.opacity = '.72';
    });
  }

  document.addEventListener('click', e => {
    const el = e.target?.closest?.('button,a,span,div,[role="button"]');
    if(!isPiTarget(el)) return;
    e.preventDefault();
    e.stopImmediatePropagation();
    reset();
    overlay.classList.add('show');
  }, true);

  decorate();
  new MutationObserver(decorate).observe(document.body,{subtree:true,childList:true,characterData:true});
})();
