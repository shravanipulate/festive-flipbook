(() => {
  if (window.__birthdayFinalGameV23Loaded) return;
  window.__birthdayFinalGameV23Loaded = true;

  const TARGET = 'YOUAREAMAZING';
  const START_ORDER = [7,1,10,4,12,0,8,3,11,5,2,9,6];
  const HIDE_ATTR = 'data-birthday-final-game-hidden';

  const style = document.createElement('style');
  style.textContent = `
    .ff-unscramble-mount{width:100%;box-sizing:border-box;margin:18px 0 8px}
    .ff-unscramble-root{width:min(760px,100%);margin:0 auto;padding:18px 0;text-align:center;font-family:inherit}
    .ff-unscramble-kicker{font-size:9px;letter-spacing:.24em;text-transform:uppercase;opacity:.48;margin-bottom:7px}
    .ff-unscramble-title{font-size:24px;font-weight:850;margin:0 0 7px}
    .ff-unscramble-copy{font-size:11px;line-height:1.6;opacity:.58;max-width:560px;margin:0 auto 18px}
    .ff-unscramble-board{display:flex;flex-wrap:wrap;justify-content:center;gap:8px;min-height:76px;padding:15px;border:1px solid rgba(255,255,255,.1);border-radius:16px;background:rgba(0,0,0,.12);box-sizing:border-box}
    .ff-unscramble-tile{width:42px;height:50px;display:flex;align-items:center;justify-content:center;border:1px solid rgba(217,164,65,.32);border-radius:10px;background:rgba(255,255,255,.045);font:800 21px/1 inherit;cursor:grab;user-select:none;touch-action:none;box-sizing:border-box;transition:transform .12s,opacity .12s,outline-color .12s}
    .ff-unscramble-tile:hover{transform:translateY(-2px)}
    .ff-unscramble-tile.selected{outline:2px solid rgba(233,174,80,.8);outline-offset:2px}
    .ff-unscramble-tile.dragging{opacity:.35}
    .ff-unscramble-tile.correct{border-color:rgba(100,220,150,.72);background:rgba(60,160,100,.13);cursor:default}
    .ff-unscramble-actions{display:flex;justify-content:center;gap:8px;flex-wrap:wrap;margin-top:13px}
    .ff-unscramble-btn{border:1px solid rgba(217,164,65,.4);background:rgba(217,164,65,.09);color:inherit;border-radius:10px;padding:9px 14px;cursor:pointer;font:700 11px inherit}
    .ff-unscramble-btn:disabled{opacity:.45;cursor:default}
    .ff-unscramble-status{min-height:18px;margin-top:10px;font-size:10px;opacity:.58}
    .ff-unscramble-success{margin-top:8px;font-size:12px;opacity:.78}
    .ff-unscramble-reveal-note{margin-top:14px;font-size:10px;letter-spacing:.08em;opacity:.55}
  `;
  document.head.appendChild(style);

  const text = el => String(el?.textContent || '').replace(/\s+/g,' ').trim();
  const lower = el => text(el).toLowerCase();

  function lettersSlide(){
    return document.getElementById('sLetters') || document.querySelector('[id*="letters" i]');
  }
  function isClearlySlide(el){
    if(!el || el===document.body)return true;
    const id=String(el.id||'');
    const cls=typeof el.className==='string'?el.className:'';
    return /^s[A-Z]/.test(id) || /\bslide\b/i.test(cls) || /slide/i.test(id);
  }
  function findOldCoinGame(slide){
    const markers=['fair coin','exactly two heads','coin is tossed','sequence:'];
    const leaves=[...slide.querySelectorAll('*')].filter(el=>!el.children.length&&markers.some(m=>lower(el).includes(m)));
    for(const leaf of leaves){
      let node=leaf;
      for(let depth=0;node&&depth<7;depth++,node=node.parentElement){
        if(node===slide||isClearlySlide(node))break;
        const t=lower(node), hasControl=!!node.querySelector('button,input,select,textarea');
        if(markers.some(m=>t.includes(m))&&hasControl&&t.length<=900)return node;
      }
    }
    return null;
  }
  function hideOldCoinGame(slide){
    const old=findOldCoinGame(slide);
    if(!old)return null;
    old.setAttribute(HIDE_ATTR,'coin-toss');
    old.style.setProperty('display','none','important');
    old.style.setProperty('visibility','hidden','important');
    return old;
  }

  // Only remove artifacts explicitly created by older versions of this game.
  // Never scan generic reveal/unlock/secret/easter classes.
  function removeOldGameArtifacts(slide){
    slide.querySelectorAll('[data-final-fix-hidden="duplicate-reveal"],.us-win,.us-success-reveal,#unscramble-success-reveal,[data-unscramble-reveal]').forEach(el=>{
      el.style.setProperty('display','none','important');
      el.style.setProperty('visibility','hidden','important');
    });
  }

  function showExistingEggChecklist(root){
    const wrap=document.getElementById('eggRevealWrap');
    const list=document.getElementById('eggRevealList');
    if(typeof window.playEggRevealSequence==='function'&&wrap&&list){
      // The original site owns the checklist and its EGG_LIST/eggFound state.
      // Reuse it rather than recreating or guessing its contents.
      wrap.style.display='block';
      wrap.style.opacity='0';
      wrap.style.transform='translateY(8px)';
      wrap.style.transition='opacity .55s ease,transform .55s ease';
      requestAnimationFrame(()=>{wrap.style.opacity='1';wrap.style.transform='translateY(0)';});
      try{window.playEggRevealSequence();}catch(_){ }
      return true;
    }
    return false;
  }

  function shuffle(arr){
    const a=arr.slice();
    for(let i=a.length-1;i>0;i--){
      const j=Math.floor(Math.random()*(i+1));
      [a[i],a[j]]=[a[j],a[i]];
    }
    if(a.join('')===TARGET)return shuffle(arr);
    return a;
  }

  function buildGame(mount){
    if(mount.querySelector('.ff-unscramble-root'))return;
    const root=document.createElement('div');
    root.className='ff-unscramble-root';
    root.innerHTML=`
      <div class="ff-unscramble-kicker">one last little problem</div>
      <h2 class="ff-unscramble-title">Put this back together.</h2>
      <div class="ff-unscramble-copy">The pieces are intentionally unhelpful. No hints. Just figure it out.</div>
      <div class="ff-unscramble-board" aria-label="Unscramble the letters"></div>
      <div class="ff-unscramble-actions">
        <button class="ff-unscramble-btn" type="button" data-us-shuffle>Shuffle</button>
        <button class="ff-unscramble-btn" type="button" data-us-check>Lock it in</button>
      </div>
      <div class="ff-unscramble-status" aria-live="polite"></div>
    `;
    mount.appendChild(root);

    const board=root.querySelector('.ff-unscramble-board');
    const status=root.querySelector('.ff-unscramble-status');
    const shuffleBtn=root.querySelector('[data-us-shuffle]');
    const checkBtn=root.querySelector('[data-us-check]');
    const letters=TARGET.split('');
    let order=START_ORDER.map(i=>letters[i]);
    let selected=-1,dragFrom=-1,solved=false;

    function render(){
      board.innerHTML='';
      order.forEach((letter,index)=>{
        const tile=document.createElement('div');
        tile.className='ff-unscramble-tile'+(selected===index?' selected':'')+(solved?' correct':'');
        tile.textContent=letter;
        tile.draggable=!solved;
        tile.dataset.index=String(index);
        tile.addEventListener('click',()=>{
          if(solved)return;
          if(selected<0)selected=index;
          else if(selected===index)selected=-1;
          else{[order[selected],order[index]]=[order[index],order[selected]];selected=-1;status.textContent='';}
          render();
        });
        tile.addEventListener('dragstart',e=>{
          if(solved)return;
          dragFrom=index;selected=-1;tile.classList.add('dragging');
          if(e.dataTransfer){e.dataTransfer.setData('text/plain',String(index));e.dataTransfer.effectAllowed='move';}
        });
        tile.addEventListener('dragend',()=>{dragFrom=-1;tile.classList.remove('dragging');});
        tile.addEventListener('dragover',e=>{if(!solved)e.preventDefault();});
        tile.addEventListener('drop',e=>{
          e.preventDefault();
          if(solved)return;
          const from=dragFrom>=0?dragFrom:Number(e.dataTransfer?.getData('text/plain'));
          if(Number.isInteger(from)&&from>=0&&from<order.length&&from!==index){[order[from],order[index]]=[order[index],order[from]];selected=-1;status.textContent='';render();}
          dragFrom=-1;
        });
        board.appendChild(tile);
      });
    }

    function reset(shuffleIt){
      solved=false;selected=-1;dragFrom=-1;
      order=shuffleIt?shuffle(letters):START_ORDER.map(i=>letters[i]);
      status.textContent='Tap two letters to swap them, or drag them into place.';
      shuffleBtn.disabled=false;checkBtn.disabled=false;
      render();
    }

    shuffleBtn.addEventListener('click',()=>reset(true));
    checkBtn.addEventListener('click',()=>{
      if(solved)return;
      if(order.join('')!==TARGET){status.textContent='Not quite. Rearrange it.';return;}
      solved=true;selected=-1;status.textContent='Locked in ✓';render();

      const note=document.createElement('div');
      note.className='ff-unscramble-success';
      note.innerHTML='<strong>YOU ARE (A)MAZ(I)NG.</strong><br><span>Okay. That one was actually deserved. ✦</span>';
      root.appendChild(note);
      window.__birthdayUnscrambleSolved=true;
      window.letterComplete=true;
      window.__letterComplete=true;
      shuffleBtn.disabled=true;checkBtn.disabled=true;

      // Payoff: reveal the site's REAL existing Easter-egg checklist here.
      // It remains the original registry, with the same found/missed state.
      setTimeout(()=>{
        const shown=showExistingEggChecklist(root);
        if(!shown){
          const fallback=document.createElement('div');
          fallback.className='ff-unscramble-reveal-note';
          fallback.textContent='SYSTEM LOG · RECOVERED';
          root.appendChild(fallback);
        }
      },700);
    });

    reset(false);
  }

  function apply(){
    const slide=lettersSlide();
    if(!slide)return false;
    const old=hideOldCoinGame(slide);
    removeOldGameArtifacts(slide);
    let mount=slide.querySelector('.ff-unscramble-mount');
    if(!mount){
      mount=document.createElement('div');
      mount.className='ff-unscramble-mount';
      if(old?.parentElement)old.parentElement.insertBefore(mount,old.nextSibling);
      else slide.appendChild(mount);
    }
    buildGame(mount);
    return true;
  }

  let tries=0;
  function tick(){
    tries++;
    if(apply())return;
    if(tries<20)setTimeout(tick,750);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(tick,50),{once:true});
  else setTimeout(tick,50);
})();