(() => {
  if (window.__birthdayUnscrambleReplacementLoaded) return;
  window.__birthdayUnscrambleReplacementLoaded = true;

  const style = document.createElement('style');
  style.textContent = `#unscramble-overlay{position:fixed;inset:0;z-index:1000005;display:none;align-items:center;justify-content:center;padding:20px;background:rgba(8,7,7,.96);backdrop-filter:blur(16px);color:#fff;font-family:inherit}#unscramble-overlay.show{display:flex}.us-card{width:min(820px,95vw);min-height:390px;background:linear-gradient(145deg,rgba(29,24,21,.99),rgba(16,14,13,.99));border:1px solid rgba(217,164,65,.35);border-radius:26px;padding:30px;box-shadow:0 35px 120px rgba(0,0,0,.58);text-align:center}.us-kicker{font-size:9px;letter-spacing:.28em;text-transform:uppercase;opacity:.45}.us-title{font-size:27px;font-weight:850;margin:0}.us-copy{font-size:12px;line-height:1.65;opacity:.58;margin:10px auto 22px;max-width:570px}.us-board{min-height:155px;border:1px solid rgba(255,255,255,.1);background:rgba(0,0,0,.18);border-radius:18px;padding:20px;display:flex;flex-wrap:wrap;gap:10px;align-content:center;justify-content:center}.us-letter{width:46px;height:56px;border:1px solid rgba(217,164,65,.3);background:rgba(255,255,255,.05);color:#fff;border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:24px;font-weight:850;cursor:grab;user-select:none}.us-letter.dragging{opacity:.35}.us-letter.correct{border-color:rgba(100,220,150,.75);background:rgba(60,160,100,.14)}.us-actions{display:flex;justify-content:center;gap:9px;margin-top:16px}.us-btn{border:1px solid rgba(217,164,65,.4);background:rgba(217,164,65,.09);color:#fff;border-radius:11px;padding:10px 16px;cursor:pointer;font:700 11px inherit}.us-status{min-height:18px;margin-top:13px;font-size:10px;opacity:.5}.us-win{display:none;margin-top:18px}.us-win.show{display:block}.us-win-main{font-size:30px;font-weight:900;letter-spacing:.06em}.us-win-main .a,.us-win-main .i{color:#e9ae50}.us-win-sub{font-size:11px;opacity:.5;margin-top:7px}#sLetters.birthday-unscramble-host .letter-game,#sLetters.birthday-unscramble-host .letters-game,#sLetters.birthday-unscramble-host [id*="letter-question"],#sLetters.birthday-unscramble-host [class*="letter-question"]{display:none!important}`;
  document.head.appendChild(style);

  const overlay=document.createElement('div');overlay.id='unscramble-overlay';
  overlay.innerHTML=`<div class="us-card"><div class="us-kicker">one last little problem</div><h2 class="us-title">Put this back together.</h2><div class="us-copy">The pieces are intentionally unhelpful. No hints. No word length. No indication of how many words there are. Just figure it out.</div><div class="us-board" id="us-board"></div><div class="us-actions"><button class="us-btn" id="us-shuffle">Shuffle</button><button class="us-btn" id="us-check">Lock it in</button><button class="us-btn" id="us-leave">Leave</button></div><div class="us-status" id="us-status"></div><div class="us-win" id="us-win"><div class="us-win-main">YOU ARE <span class="a">(A)</span>MAZ<span class="i">(I)</span>NG</div><div class="us-win-sub">Okay. That one was actually deserved.</div></div></div>`;
  document.body.appendChild(overlay);

  const board=overlay.querySelector('#us-board'),status=overlay.querySelector('#us-status'),win=overlay.querySelector('#us-win');
  const target='YOUAREAMAZING',hardOrder=[7,1,10,4,12,0,8,3,11,5,2,9,6];
  let letters=[],solved=false,dragIndex=null,opened=false;

  function render(){
    board.innerHTML='';letters.forEach((letter,index)=>{const el=document.createElement('div');el.className='us-letter';el.draggable=true;el.textContent=letter;el.ondragstart=e=>{if(!solved){dragIndex=index;el.classList.add('dragging');e.dataTransfer.effectAllowed='move';}};el.ondragend=()=>el.classList.remove('dragging');el.ondragover=e=>e.preventDefault();el.ondrop=e=>{e.preventDefault();if(solved||dragIndex===null||dragIndex===index)return;const moved=letters.splice(dragIndex,1)[0];letters.splice(index,0,moved);dragIndex=null;render();};board.appendChild(el);});
  }
  function reset(){solved=false;win.classList.remove('show');status.textContent='';letters=hardOrder.map(i=>target[i]);render();}
  function check(){if(solved)return;if(letters.join('')===target){solved=true;[...board.children].forEach(el=>el.classList.add('correct'));status.textContent='Locked in ✓';win.classList.add('show');window.__birthdayUnscrambleSolved=true;window.letterComplete=true;}else{status.textContent='Not quite. Rearrange it.';}}
  overlay.querySelector('#us-shuffle').onclick=reset;overlay.querySelector('#us-check').onclick=check;overlay.querySelector('#us-leave').onclick=()=>overlay.classList.remove('show');
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&overlay.classList.contains('show')&&!solved)overlay.classList.remove('show');});

  function slideActive(){return document.getElementById('sLetters')?.classList.contains('active');}
  function enter(){
    const slide=document.getElementById('sLetters');if(!slide)return;
    slide.classList.add('birthday-unscramble-host');
    slide.querySelectorAll('button,a,input,select,textarea,[role="button"]').forEach(el=>{const t=String(el.innerText||el.textContent||el.value||'').replace(/\s+/g,' ').trim();if(/skip|1\/2|3\/8|sequence|fair coin|one last problem/i.test(t))el.style.display='none';});
    reset();overlay.classList.add('show');
  }
  const tick=()=>{if(slideActive()){if(!opened){opened=true;enter();}}else opened=false;};
  // Poll only the one slide instead of observing every DOM attribute/style mutation in the 8MB page.
  setInterval(tick,700);tick();
})();
