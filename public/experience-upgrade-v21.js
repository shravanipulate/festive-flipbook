(() => {
  if (window.__birthdayFinalGameV24Loaded) return;
  window.__birthdayFinalGameV24Loaded = true;

  const TARGET='YOUAREAMAZING';
  const START_ORDER=[7,1,10,4,12,0,8,3,11,5,2,9,6];
  const HIDE_ATTR='data-birthday-final-game-hidden';

  /* This mirrors the site's real Easter-egg registry so the checklist can
     persistently show progress even after leaving and returning to the slide. */
  const EGGS=[
    ['dot','✦','The tiny star'],['logo','🏷️','The top bar'],['star','⭐','The finale star'],
    ['console','🖥️','The console'],['finale','🏁','Reaching the end'],['name','⌨️','Typing your own name'],
    ['dblclick','🖱️','Double-click spam'],['idle','😴','Just sitting there'],['scroll','📜','Scrolling for secrets'],
    ['confetti','🎉','Shaking the page'],['recursion','🔁','Recursion'],['f12','🛠️','Reflex DevTools shortcut'],
    ['sudo','🔐','sudo'],['konami','🎮','The Konami code'],['rightclick','🖱️','Right-click, 3 times'],
    ['select','🖍️','Highlighting everything'],['resize','📐','Resizing the window'],['zoom','🔍','Zooming in/out']
  ];

  const style=document.createElement('style');
  style.textContent=`
    .ff-unscramble-mount{width:100%;box-sizing:border-box;margin:18px 0 8px}
    .ff-unscramble-root{width:min(760px,100%);margin:0 auto;padding:18px 0;text-align:center;font-family:inherit}
    .ff-unscramble-kicker{font-size:9px;letter-spacing:.24em;text-transform:uppercase;opacity:.48;margin-bottom:7px}
    .ff-unscramble-title{font-size:24px;font-weight:850;margin:0 0 7px}
    .ff-unscramble-copy{font-size:11px;line-height:1.6;opacity:.58;max-width:560px;margin:0 auto 18px}
    .ff-unscramble-board{display:flex;flex-wrap:wrap;justify-content:center;gap:8px;min-height:76px;padding:15px;border:1px solid rgba(255,255,255,.1);border-radius:16px;background:rgba(0,0,0,.12);box-sizing:border-box}
    .ff-unscramble-tile{width:42px;height:50px;display:flex;align-items:center;justify-content:center;border:1px solid rgba(217,164,65,.32);border-radius:10px;background:rgba(255,255,255,.045);font:800 21px/1 inherit;cursor:grab;user-select:none;touch-action:none;transition:transform .12s,opacity .12s,outline-color .12s}
    .ff-unscramble-tile:hover{transform:translateY(-2px)}
    .ff-unscramble-tile.selected{outline:2px solid rgba(233,174,80,.8);outline-offset:2px}
    .ff-unscramble-tile.dragging{opacity:.35}
    .ff-unscramble-tile.correct{border-color:rgba(100,220,150,.72);background:rgba(60,160,100,.13);cursor:default}
    .ff-unscramble-actions{display:flex;justify-content:center;gap:8px;flex-wrap:wrap;margin-top:13px}
    .ff-unscramble-btn{border:1px solid rgba(217,164,65,.4);background:rgba(217,164,65,.09);color:inherit;border-radius:10px;padding:9px 14px;cursor:pointer;font:700 11px inherit}
    .ff-unscramble-btn:disabled{opacity:.45;cursor:default}
    .ff-unscramble-status{min-height:18px;margin-top:10px;font-size:10px;opacity:.58}
    .ff-egg-checklist{margin:22px auto 0;width:min(620px,94vw);text-align:left;padding:18px;border:1px solid rgba(255,255,255,.1);border-radius:16px;background:rgba(0,0,0,.10)}
    .ff-egg-checklist-head{text-align:center;margin-bottom:14px}
    .ff-egg-kicker{font:700 8px/1.4 'Space Mono',monospace;letter-spacing:.2em;opacity:.48;text-transform:uppercase}
    .ff-egg-title{font-size:20px;font-weight:850;margin-top:5px}
    .ff-egg-progress{font:700 9px 'Space Mono',monospace;letter-spacing:.08em;opacity:.6;margin-top:7px}
    .ff-egg-row{display:flex;align-items:center;gap:10px;padding:8px 10px;border-radius:10px;border:1px solid rgba(255,255,255,.07);margin-top:6px;transition:all .3s ease}
    .ff-egg-row.found{border-color:rgba(52,211,153,.3);background:rgba(52,211,153,.055)}
    .ff-egg-box{width:22px;height:22px;border:1px solid rgba(255,255,255,.22);border-radius:6px;display:flex;align-items:center;justify-content:center;flex:none;font-size:13px;transition:all .25s}
    .ff-egg-row.found .ff-egg-box{border-color:rgba(52,211,153,.75);background:rgba(52,211,153,.16);color:var(--green)}
    .ff-egg-icon{width:24px;text-align:center;filter:grayscale(1);opacity:.42;transition:all .25s}
    .ff-egg-row.found .ff-egg-icon{filter:none;opacity:1}
    .ff-egg-name{font-size:11px;flex:1;color:var(--text2)}
    .ff-egg-row.found .ff-egg-name{color:var(--text)}
    .ff-egg-state{font:700 7px 'Space Mono',monospace;letter-spacing:.1em;opacity:.4;text-transform:uppercase}
    .ff-egg-row.found .ff-egg-state{color:var(--green);opacity:.9}
    .ff-egg-final{margin-top:16px;text-align:center;padding:13px;border-top:1px solid rgba(255,255,255,.08);font-size:12px;opacity:0;transform:translateY(6px);transition:opacity .5s,transform .5s}
    .ff-egg-final.show{opacity:1;transform:translateY(0)}
    .ff-egg-final strong{font-size:15px}
  `;
  document.head.appendChild(style);

  const text=el=>String(el?.textContent||'').replace(/\s+/g,' ').trim();
  const lower=el=>text(el).toLowerCase();

  function lettersSlide(){return document.getElementById('sLetters')||document.querySelector('[id*="letters" i]');}
  function isClearlySlide(el){if(!el||el===document.body)return true;const id=String(el.id||'');const cls=typeof el.className==='string'?el.className:'';return /^s[A-Z]/.test(id)||/\bslide\b/i.test(cls)||/slide/i.test(id);}
  function findOldCoinGame(slide){
    const markers=['fair coin','exactly two heads','coin is tossed','sequence:'];
    const leaves=[...slide.querySelectorAll('*')].filter(el=>!el.children.length&&markers.some(m=>lower(el).includes(m)));
    for(const leaf of leaves){let node=leaf;for(let depth=0;node&&depth<7;depth++,node=node.parentElement){if(node===slide||isClearlySlide(node))break;const t=lower(node),hasControl=!!node.querySelector('button,input,select,textarea');if(markers.some(m=>t.includes(m))&&hasControl&&t.length<=900)return node;}}
    return null;
  }
  function hideOldCoinGame(slide){const old=findOldCoinGame(slide);if(!old)return null;old.setAttribute(HIDE_ATTR,'coin-toss');old.style.setProperty('display','none','important');old.style.setProperty('visibility','hidden','important');return old;}
  function removeOldGameArtifacts(slide){slide.querySelectorAll('[data-final-fix-hidden="duplicate-reveal"],.us-win,.us-success-reveal,#unscramble-success-reveal,[data-unscramble-reveal]').forEach(el=>{el.style.setProperty('display','none','important');el.style.setProperty('visibility','hidden','important');});}

  function readFound(){
    try{return new Set(JSON.parse(localStorage.getItem('chinmayEggsFound')||'[]'));}catch(_){return new Set();}
  }
  function renderChecklist(root){
    const box=root.querySelector('.ff-egg-checklist');if(!box)return;
    const found=readFound();
    const count=EGGS.reduce((n,e)=>n+(found.has(e[0])?1:0),0);
    box.querySelector('.ff-egg-progress').textContent=`${count} / ${EGGS.length} secrets found`;
    box.querySelectorAll('.ff-egg-row').forEach(row=>{
      const yes=found.has(row.dataset.egg);
      row.classList.toggle('found',yes);
      row.querySelector('.ff-egg-box').textContent=yes?'✓':'';
      row.querySelector('.ff-egg-state').textContent=yes?'found':'not yet';
    });
    const final=box.querySelector('.ff-egg-final');
    if(final)final.classList.toggle('show',count===EGGS.length);
  }
  function buildChecklist(root){
    if(root.querySelector('.ff-egg-checklist'))return;
    const box=document.createElement('div');box.className='ff-egg-checklist';
    box.innerHTML=`<div class="ff-egg-checklist-head"><div class="ff-egg-kicker">system log · recovered</div><div class="ff-egg-title">Every secret you found.</div><div class="ff-egg-progress"></div></div><div class="ff-egg-list"></div><div class="ff-egg-final"><strong>YOU ARE (A)MAZ(I)NG.</strong><br><span>Okay. That one was actually deserved. ✦</span></div>`;
    const list=box.querySelector('.ff-egg-list');
    EGGS.forEach(([id,icon,title])=>{const row=document.createElement('div');row.className='ff-egg-row';row.dataset.egg=id;row.innerHTML=`<div class="ff-egg-box"></div><div class="ff-egg-icon">${icon}</div><div class="ff-egg-name">${title}</div><div class="ff-egg-state">not yet</div>`;list.appendChild(row);});
    root.appendChild(box);renderChecklist(root);
    const refresh=()=>renderChecklist(root);
    box.__eggRefresh=refresh;
    // The original showEggToast() writes chinmayEggsFound after every discovery.
    // Watch that one small storage key instead of using a page-wide observer.
    window.addEventListener('storage',refresh);
    const originalToast=document.getElementById('eggToast');
    if(originalToast){new MutationObserver(refresh).observe(originalToast,{childList:true,subtree:true,characterData:true});}
    let last='';
    const poll=setInterval(()=>{const now=localStorage.getItem('chinmayEggsFound')||'';if(now!==last){last=now;refresh();}},700);
    box.__eggPoll=poll;
  }

  function shuffle(arr){const a=arr.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}if(a.join('')===TARGET)return shuffle(arr);return a;}

  function buildGame(mount){
    if(mount.querySelector('.ff-unscramble-root'))return;
    const root=document.createElement('div');root.className='ff-unscramble-root';
    root.innerHTML=`<div class="ff-unscramble-kicker">one last little problem</div><h2 class="ff-unscramble-title">Put this back together.</h2><div class="ff-unscramble-copy">The pieces are intentionally unhelpful. No hints. Just figure it out.</div><div class="ff-unscramble-board" aria-label="Unscramble the letters"></div><div class="ff-unscramble-actions"><button class="ff-unscramble-btn" type="button" data-us-shuffle>Shuffle</button><button class="ff-unscramble-btn" type="button" data-us-check>Lock it in</button></div><div class="ff-unscramble-status" aria-live="polite"></div>`;
    mount.appendChild(root);
    const board=root.querySelector('.ff-unscramble-board'),status=root.querySelector('.ff-unscramble-status'),shuffleBtn=root.querySelector('[data-us-shuffle]'),checkBtn=root.querySelector('[data-us-check]');
    const letters=TARGET.split('');let order=START_ORDER.map(i=>letters[i]),selected=-1,dragFrom=-1,solved=false;
    function render(){board.innerHTML='';order.forEach((letter,index)=>{const tile=document.createElement('div');tile.className='ff-unscramble-tile'+(selected===index?' selected':'')+(solved?' correct':'');tile.textContent=letter;tile.draggable=!solved;tile.dataset.index=String(index);tile.addEventListener('click',()=>{if(solved)return;if(selected<0)selected=index;else if(selected===index)selected=-1;else{[order[selected],order[index]]=[order[index],order[selected]];selected=-1;status.textContent='';}render();});tile.addEventListener('dragstart',e=>{if(solved)return;dragFrom=index;selected=-1;tile.classList.add('dragging');if(e.dataTransfer){e.dataTransfer.setData('text/plain',String(index));e.dataTransfer.effectAllowed='move';}});tile.addEventListener('dragend',()=>{dragFrom=-1;tile.classList.remove('dragging');});tile.addEventListener('dragover',e=>{if(!solved)e.preventDefault();});tile.addEventListener('drop',e=>{e.preventDefault();if(solved)return;const from=dragFrom>=0?dragFrom:Number(e.dataTransfer?.getData('text/plain'));if(Number.isInteger(from)&&from>=0&&from<order.length&&from!==index){[order[from],order[index]]=[order[index],order[from]];selected=-1;status.textContent='';render();}dragFrom=-1;});board.appendChild(tile);});}
    function reset(shuffleIt){solved=false;selected=-1;dragFrom=-1;order=shuffleIt?shuffle(letters):START_ORDER.map(i=>letters[i]);status.textContent='Tap two letters to swap them, or drag them into place.';shuffleBtn.disabled=false;checkBtn.disabled=false;render();}
    shuffleBtn.addEventListener('click',()=>reset(true));
    checkBtn.addEventListener('click',()=>{if(solved)return;if(order.join('')!==TARGET){status.textContent='Not quite. Rearrange it.';return;}solved=true;selected=-1;status.textContent='Locked in ✓';render();window.__birthdayUnscrambleSolved=true;window.letterComplete=true;window.__letterComplete=true;shuffleBtn.disabled=true;checkBtn.disabled=true;buildChecklist(root);});
    reset(false);
  }

  function apply(){const slide=lettersSlide();if(!slide)return false;const old=hideOldCoinGame(slide);removeOldGameArtifacts(slide);let mount=slide.querySelector('.ff-unscramble-mount');if(!mount){mount=document.createElement('div');mount.className='ff-unscramble-mount';if(old?.parentElement)old.parentElement.insertBefore(mount,old.nextSibling);else slide.appendChild(mount);}buildGame(mount);return true;}

  let tries=0;function tick(){tries++;if(apply())return;if(tries<20)setTimeout(tick,750);}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(tick,50),{once:true});else setTimeout(tick,50);
})();