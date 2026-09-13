(() => {
  if (window.__birthdayUpgradePatchLoaded) return;
  window.__birthdayUpgradePatchLoaded = true;

  const LANGS = [
    ['Hindi','नमस्ते'],['English','Hello'],['Maithili','प्रणाम'],['Punjabi','ਸਤ ਸ੍ਰੀ ਅਕਾਲ'],
    ['German · 20%','Hallo'],['Japanese','こんにちは'],['Sanskrit','नमः'],['Assamese','নমস্কাৰ'],
    ['Bengali','নমস্কার'],['Odia','ନମସ୍କାର'],['Bhojpuri','प्रणाम'],['Tribal languages','Hello'],['Mandarin','你好']
  ];

  const style = document.createElement('style');
  style.textContent = `
    :root{--upgrade-ink:#171312;--upgrade-paper:#fbf7f2;--upgrade-gold:#d9a441;--upgrade-coral:#e9786d}
    html[data-theme=light]{--upgrade-ink:#fbf7f2;--upgrade-paper:#171312}
    #birthday-upgrade-overlay{position:fixed;inset:0;z-index:999999;display:none;align-items:center;justify-content:center;padding:24px;background:radial-gradient(circle at 50% 42%,rgba(217,164,65,.16),transparent 38%),var(--upgrade-ink);color:#fff;overflow:hidden;font-family:inherit}
    #birthday-upgrade-overlay.show{display:flex;animation:buFade .55s ease both}
    @keyframes buFade{from{opacity:0}to{opacity:1}}
    .bu-panel{width:min(920px,94vw);text-align:center;position:relative}
    .bu-kicker{font-size:11px;letter-spacing:.28em;text-transform:uppercase;opacity:.6;margin-bottom:22px}
    .bu-name{font-size:clamp(34px,8vw,92px);font-weight:800;letter-spacing:.045em;line-height:.98;color:var(--upgrade-gold);min-height:1em;text-shadow:0 0 30px rgba(217,164,65,.28)}
    .bu-sub{margin-top:18px;color:rgba(255,255,255,.68);font-size:14px;letter-spacing:.08em}
    .bu-step{margin-top:34px;border:1px solid rgba(217,164,65,.55);background:rgba(217,164,65,.08);color:#fff;border-radius:999px;padding:13px 23px;font:600 12px inherit;letter-spacing:.13em;text-transform:uppercase;cursor:pointer;opacity:0;transition:.25s transform,.25s background}
    .bu-step.ready{opacity:1}.bu-step:hover{transform:translateY(-2px);background:rgba(217,164,65,.16)}
    .bu-bar{height:2px;width:min(380px,70vw);background:rgba(255,255,255,.12);margin:25px auto 0;border-radius:9px;overflow:hidden}.bu-bar i{display:block;height:100%;width:0;background:linear-gradient(90deg,var(--upgrade-gold),var(--upgrade-coral));animation:buTimer 9s linear forwards}@keyframes buTimer{to{width:100%}}
    #bu-languages{display:none;position:fixed;inset:0;z-index:999998;background:var(--upgrade-ink);color:#fff;padding:7vh 6vw;overflow:auto}
    #bu-languages.show{display:block;animation:buFade .45s ease both}
    .bu-lang-head{max-width:900px;margin:0 auto 28px}.bu-lang-head small{opacity:.55;letter-spacing:.2em;text-transform:uppercase}.bu-lang-head h2{font-size:clamp(28px,5vw,54px);margin:8px 0}.bu-lang-head p{opacity:.65}
    .bu-grid{max-width:900px;margin:auto;display:grid;grid-template-columns:repeat(auto-fit,minmax(155px,1fr));gap:10px}.bu-lang-card{border:1px solid rgba(217,164,65,.2);background:rgba(255,255,255,.045);border-radius:15px;padding:17px;text-align:left;cursor:pointer;transition:.2s}.bu-lang-card:hover{transform:translateY(-3px);border-color:rgba(217,164,65,.65)}.bu-lang-card b{display:block;font-size:13px}.bu-lang-card span{display:block;margin-top:8px;color:var(--upgrade-gold);font-size:19px}.bu-lang-hello{min-height:20px;margin-top:5px;font-size:11px;opacity:.65}.bu-enter{display:block;margin:30px auto 0;border:1px solid rgba(217,164,65,.55);background:rgba(217,164,65,.09);color:#fff;border-radius:999px;padding:12px 22px;cursor:pointer}
    #bu-vault{position:fixed;right:18px;top:18px;z-index:999997;border:1px solid rgba(217,164,65,.4);background:rgba(20,16,15,.72);backdrop-filter:blur(12px);color:#fff;border-radius:999px;padding:9px 14px;font:700 11px inherit;letter-spacing:.12em;cursor:grab;user-select:none;touch-action:none}
    #bu-vault.dragging{cursor:grabbing;opacity:.9}
    #bu-vault-panel{position:fixed;right:18px;top:62px;width:min(350px,calc(100vw - 36px));z-index:999997;background:rgba(27,22,20,.97);color:#fff;border:1px solid rgba(217,164,65,.28);border-radius:18px;padding:20px;box-shadow:0 20px 60px rgba(0,0,0,.4);display:none}.bu-vault-title{font-size:18px;font-weight:800}.bu-vault-copy{font-size:12px;opacity:.65;line-height:1.6;margin:8px 0 16px}.bu-vault-choice{display:grid;gap:8px}.bu-vault-choice button{border:1px solid rgba(255,255,255,.12);background:rgba(255,255,255,.05);color:#fff;border-radius:10px;padding:10px;text-align:left;cursor:pointer}.bu-vault-choice button:hover{border-color:rgba(217,164,65,.6)}
    @media(max-width:600px){#bu-vault{right:10px;top:10px}.bu-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.bu-lang-card{padding:13px}}
  `;
  document.head.appendChild(style);

  const overlay = document.createElement('div');
  overlay.id = 'birthday-upgrade-overlay';
  overlay.innerHTML = `<div class="bu-panel"><div class="bu-kicker">okay, now we actually begin</div><div class="bu-name" id="bu-name"></div><div class="bu-sub">one name · approximately infinite tabs open</div><button class="bu-step" id="bu-step">Step inside ↵</button><div class="bu-bar"><i></i></div></div>`;
  document.body.appendChild(overlay);

  const langs = document.createElement('section');
  langs.id = 'bu-languages';
  langs.innerHTML = `<div class="bu-lang-head"><small>the next page</small><h2>One brain. Thirteen-ish languages.</h2><p>Tap a card. It knows how to say hello. Mostly.</p></div><div class="bu-grid"></div><button class="bu-enter" id="bu-enter">Continue →</button>`;
  document.body.appendChild(langs);
  const grid = langs.querySelector('.bu-grid');
  LANGS.forEach(([name, hello]) => {
    const card = document.createElement('button'); card.className='bu-lang-card'; card.innerHTML=`<b>${name}</b><span>${hello}</span><div class="bu-lang-hello">tap me</div>`;
    card.addEventListener('click',()=>{card.querySelector('.bu-lang-hello').textContent=`✓ ${hello}`}); grid.appendChild(card);
  });

  const vault = document.createElement('button'); vault.id='bu-vault'; vault.textContent='🔐 VAULT'; document.body.appendChild(vault);
  const vp = document.createElement('div'); vp.id='bu-vault-panel'; vp.innerHTML=`<div class="bu-vault-title">Keep the good stuff?</div><div class="bu-vault-copy">Choose how this browser should handle things you create in the experience. You can change this later.</div><div class="bu-vault-choice"><button data-v="always">Save everything</button><button data-v="ask">Ask me each time</button><button data-v="never">Never save</button></div>`; document.body.appendChild(vp);

  // Make the Vault freely draggable and remember its position on this device.
  const VAULT_POS_KEY='birthday-vault-position-v1';
  function clampVault(x,y){
    const r=vault.getBoundingClientRect();
    return {x:Math.max(4,Math.min(x,innerWidth-r.width-4)),y:Math.max(4,Math.min(y,innerHeight-r.height-4))};
  }
  function positionVault(x,y){
    const p=clampVault(x,y); vault.style.left=p.x+'px'; vault.style.top=p.y+'px'; vault.style.right='auto'; vault.style.bottom='auto';
    vp.style.left=Math.max(4,Math.min(p.x,innerWidth-vp.offsetWidth-4))+'px';
    vp.style.top=Math.min(innerHeight-vp.offsetHeight-4,p.y+vault.offsetHeight+8)+'px';
  }
  try{const saved=JSON.parse(localStorage.getItem(VAULT_POS_KEY)||'null');if(saved&&Number.isFinite(saved.x)&&Number.isFinite(saved.y)) requestAnimationFrame(()=>positionVault(saved.x,saved.y));}catch{}
  let drag=null;
  vault.addEventListener('pointerdown',e=>{drag={id:e.pointerId,sx:e.clientX,sy:e.clientY,rect:vault.getBoundingClientRect(),moved:false};vault.setPointerCapture(e.pointerId);vault.classList.add('dragging');e.preventDefault();});
  vault.addEventListener('pointermove',e=>{if(!drag||e.pointerId!==drag.id)return;const x=drag.rect.left+e.clientX-drag.sx,y=drag.rect.top+e.clientY-drag.sy;if(Math.abs(e.clientX-drag.sx)+Math.abs(e.clientY-drag.sy)>5)drag.moved=true;positionVault(x,y);});
  vault.addEventListener('pointerup',e=>{if(!drag||e.pointerId!==drag.id)return;const moved=drag.moved;try{localStorage.setItem(VAULT_POS_KEY,JSON.stringify({x:vault.getBoundingClientRect().left,y:vault.getBoundingClientRect().top}));}catch{};vault.classList.remove('dragging');drag=null;if(moved)e.stopImmediatePropagation();});
  vault.onclick=()=>{if(!drag) {vp.style.display=vp.style.display==='block'?'none':'block'; if(vp.style.display==='block') positionVault(vault.getBoundingClientRect().left,vault.getBoundingClientRect().top);}};
  window.addEventListener('resize',()=>positionVault(vault.getBoundingClientRect().left,vault.getBoundingClientRect().top));
  vp.querySelectorAll('[data-v]').forEach(b=>b.onclick=()=>{localStorage.setItem('birthday-vault-choice',b.dataset.v);vp.style.display='none'});

  function nameReveal(){
    overlay.classList.add('show');
    const target='CHINMAY SHANDILYA', el=document.getElementById('bu-name');
    el.textContent='';
    const chars=[...target];
    chars.forEach((ch,i)=>setTimeout(()=>{const s=document.createElement('span');s.textContent=ch===' '?'\u00a0':ch;s.style.opacity='0';s.style.display='inline-block';s.style.transform='translateY(20px) scale(.7)';s.style.transition='700ms cubic-bezier(.2,.9,.2,1)';el.appendChild(s);requestAnimationFrame(()=>{s.style.opacity='1';s.style.transform='translateY(0) scale(1)'});},i*95));
    setTimeout(()=>document.getElementById('bu-step').classList.add('ready'),Math.max(900,chars.length*95+650));
    let done=false; const enter=()=>{if(done)return;done=true;document.removeEventListener('keydown',key);overlay.classList.remove('show');langs.classList.add('show')}; const key=e=>{if(e.key==='Enter')enter()}; document.addEventListener('keydown',key); document.getElementById('bu-step').onclick=enter; setTimeout(enter,9000);
  }
  document.getElementById('bu-enter').onclick=()=>{langs.classList.remove('show'); if(typeof window.nextSlide==='function') window.nextSlide()};

  const originalCheckPw=window.checkPw;
  if(typeof originalCheckPw==='function'){
    window.checkPw=function(){
      const input=document.getElementById('pwIn'); const value=input?.value.trim().toLowerCase();
      originalCheckPw.apply(this,arguments);
      if(value==='183') setTimeout(nameReveal,700);
    };
  }

  const walker=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);
  const nodes=[]; while(walker.nextNode()) nodes.push(walker.currentNode);
  nodes.forEach(n=>{if(/10\+\s*languages?/i.test(n.nodeValue)) n.nodeValue=n.nodeValue.replace(/10\+\s*languages?/gi,'13+ languages')});
  document.addEventListener('visibilitychange',()=>document.documentElement.classList.toggle('bg-paused',document.hidden));
})();
