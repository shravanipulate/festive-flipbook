(() => {
  if (window.__birthdayUnscrambleReplacementLoaded) return;
  window.__birthdayUnscrambleReplacementLoaded = true;

  const style=document.createElement('style');
  style.textContent=`#unscramble-overlay{position:fixed;inset:0;z-index:1000005;display:none;align-items:center;justify-content:center;padding:20px;background:rgba(8,7,7,.97);backdrop-filter:blur(16px);color:#fff;font-family:inherit}#unscramble-overlay.show{display:flex}.us-card{width:min(820px,95vw);min-height:390px;background:linear-gradient(145deg,rgba(29,24,21,.99),rgba(16,14,13,.99));border:1px solid rgba(217,164,65,.35);border-radius:26px;padding:30px;box-shadow:0 35px 120px rgba(0,0,0,.58);text-align:center}.us-kicker{font-size:9px;letter-spacing:.28em;text-transform:uppercase;opacity:.45}.us-title{font-size:27px;font-weight:850;margin:0}.us-copy{font-size:12px;line-height:1.65;opacity:.58;margin:10px auto 22px;max-width:570px}.us-board{min-height:155px;border:1px solid rgba(255,255,255,.1);background:rgba(0,0,0,.18);border-radius:18px;padding:20px;display:flex;flex-wrap:wrap;gap:10px;align-content:center;justify-content:center}.us-letter{width:46px;height:56px;border:1px solid rgba(217,164,65,.3);background:rgba(255,255,255,.05);color:#fff;border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:24px;font-weight:850;cursor:grab;user-select:none;touch-action:none}.us-letter.dragging{opacity:.35}.us-letter.selected{outline:2px solid rgba(233,174,80,.8);outline-offset:2px}.us-letter.correct{border-color:rgba(100,220,150,.75);background:rgba(60,160,100,.14)}.us-actions{display:flex;justify-content:center;gap:9px;margin-top:16px;flex-wrap:wrap}.us-btn{border:1px solid rgba(217,164,65,.4);background:rgba(217,164,65,.09);color:#fff;border-radius:11px;padding:10px 16px;cursor:pointer;font:700 11px inherit}.us-status{min-height:18px;margin-top:13px;font-size:10px;opacity:.5}`;
  document.head.appendChild(style);

  const overlay=document.createElement('div');overlay.id='unscramble-overlay';overlay.innerHTML=`<div class="us-card"><div class="us-kicker">one last little problem</div><h2 class="us-title">Put this back together.</h2><div class="us-copy">The pieces are intentionally unhelpful. No hints. No word length. No indication of how many words there are. Just figure it out.</div><div class="us-board" id="us-board"></div><div class="us-actions"><button class="us-btn" id="us-shuffle" type="button">Shuffle</button><button class="us-btn" id="us-check" type="button">Lock it in</button><button class="us-btn" id="us-leave" type="button">Leave</button></div><div class="us-status" id="us-status"></div></div>`;document.body.appendChild(overlay);
  const board=overlay.querySelector('#us-board'),status=overlay.querySelector('#us-status');
  const target='YOUAREAMAZING',hardOrder=[7,1,10,4,12,0,8,3,11,5,2,9,6];
  let letters=[],solved=false,dragIndex=null,selectedIndex=null,opened=false;

  function render(){
    board.innerHTML='';
    letters.forEach((letter,index)=>{
      const el=document.createElement('div');
      el.className='us-letter'+(selectedIndex===index?' selected':'')+(solved?' correct':'');
      el.draggable=!solved;
      el.textContent=letter;
      el.addEventListener('click',()=>{
        if(solved)return;
        if(selectedIndex===null){selectedIndex=index;render();return}
        if(selectedIndex===index){selectedIndex=null;render();return}
        [letters[selectedIndex],letters[index]]=[letters[index],letters[selectedIndex]];
        selectedIndex=null;status.textContent='';render();
      });
      el.addEventListener('dragstart',e=>{if(solved)return;dragIndex=index;selectedIndex=null;el.classList.add('dragging');if(e.dataTransfer)e.dataTransfer.effectAllowed='move'});
      el.addEventListener('dragend',()=>{dragIndex=null;el.classList.remove('dragging')});
      el.addEventListener('dragover',e=>{if(!solved)e.preventDefault()});
      el.addEventListener('drop',e=>{e.preventDefault();if(solved||dragIndex===null||dragIndex===index)return;const moved=letters.splice(dragIndex,1)[0];letters.splice(index,0,moved);dragIndex=null;selectedIndex=null;status.textContent='';render()});
      board.appendChild(el);
    });
  }

  function reset(){solved=false;selectedIndex=null;dragIndex=null;status.textContent='Tap two letters to swap them, or drag them into place.';letters=hardOrder.map(i=>target[i]);render()}
  function check(){
    if(solved)return;
    if(letters.join('')===target){solved=true;selectedIndex=null;status.textContent='Locked in ✓';render();window.__birthdayUnscrambleSolved=true;window.letterComplete=true;window.__letterComplete=true}
    else status.textContent='Not quite. Rearrange it.';
  }

  overlay.querySelector('#us-shuffle').onclick=reset;
  overlay.querySelector('#us-check').onclick=check;
  overlay.querySelector('#us-leave').onclick=()=>{overlay.classList.remove('show');selectedIndex=null};
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&overlay.classList.contains('show')&&!solved)overlay.classList.remove('show')});

  function hideOldQuestionnaire(slide){
    const needles=['fair coin','exactly two heads','sequence:','0 / 13'];
    const hits=[...slide.querySelectorAll('*')].filter(el=>!el.children.length&&needles.some(n=>String(el.textContent||'').toLowerCase().includes(n)));
    const hidden=new Set();
    hits.forEach(hit=>{
      let p=hit;
      for(let depth=0;depth<7&&p&&p!==slide;depth++,p=p.parentElement){
        const t=String(p.textContent||'').replace(/\s+/g,' ').trim().toLowerCase();
        const game=t.includes('fair coin')||t.includes('exactly two heads')||t.includes('sequence:')||t.includes('0 / 13');
        const controls=p.querySelector('button,input,select,textarea');
        if(game&&controls&&t.length<650){hidden.add(p);break}
      }
    });
    hidden.forEach(el=>{el.style.setProperty('display','none','important');el.style.setProperty('visibility','hidden','important')});
    hits.forEach(hit=>{if(!hit.closest('[data-unscramble-old-hidden]')){const t=String(hit.textContent||'').toLowerCase();if(needles.some(n=>t.includes(n))){hit.setAttribute('data-unscramble-old-hidden','1');hit.style.setProperty('display','none','important')}}});
  }

  function slideActive(){return document.getElementById('sLetters')?.classList.contains('active')}
  function enter(){const slide=document.getElementById('sLetters');if(!slide)return;hideOldQuestionnaire(slide);reset();overlay.classList.add('show')}
  const tick=()=>{if(slideActive()){if(!opened){opened=true;enter()}}else{opened=false;overlay.classList.remove('show')}};
  setInterval(tick,700);tick();
})();
