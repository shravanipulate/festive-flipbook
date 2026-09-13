(() => {
  if (window.__birthdayUpgradeV10Loaded) return;
  window.__birthdayUpgradeV10Loaded = true;

  // Make whichever Vault control the active upgrade created genuinely draggable.
  const getVault=()=>document.getElementById('real-birthday-vault')||document.getElementById('bu-vault');
  const getPanel=()=>document.getElementById('vault-modal')||document.getElementById('bu-vault-panel');
  const KEY='birthday-vault-position-v2';
  let drag=null;

  function apply(x,y){
    const v=getVault(); if(!v)return;
    const r=v.getBoundingClientRect();
    x=Math.max(6,Math.min(x,innerWidth-r.width-6));
    y=Math.max(6,Math.min(y,innerHeight-r.height-6));
    v.style.left=x+'px';v.style.top=y+'px';v.style.right='auto';v.style.bottom='auto';
    const p=getPanel();
    if(p&&p.id==='bu-vault-panel'&&p.style.display==='block'){
      p.style.left=Math.max(6,Math.min(x,innerWidth-p.offsetWidth-6))+'px';
      p.style.top=Math.min(innerHeight-p.offsetHeight-6,y+r.height+8)+'px';
      p.style.right='auto';p.style.bottom='auto';
    }
  }

  function install(){
    const v=getVault(); if(!v||v.dataset.dragReady==='1')return !!v;
    v.dataset.dragReady='1';
    v.style.cursor='grab';v.style.touchAction='none';v.style.userSelect='none';
    try{const p=JSON.parse(localStorage.getItem(KEY)||'null');if(p&&Number.isFinite(p.x)&&Number.isFinite(p.y))requestAnimationFrame(()=>apply(p.x,p.y));}catch(_){}

    v.addEventListener('pointerdown',e=>{
      drag={id:e.pointerId,sx:e.clientX,sy:e.clientY,x:v.getBoundingClientRect().left,y:v.getBoundingClientRect().top,moved:false};
      try{v.setPointerCapture(e.pointerId);}catch(_){}
      v.style.cursor='grabbing';e.preventDefault();e.stopPropagation();
    },true);
    v.addEventListener('pointermove',e=>{
      if(!drag||e.pointerId!==drag.id)return;
      const x=drag.x+e.clientX-drag.sx,y=drag.y+e.clientY-drag.sy;
      if(Math.abs(e.clientX-drag.sx)+Math.abs(e.clientY-drag.sy)>4)drag.moved=true;
      apply(x,y);e.preventDefault();e.stopPropagation();
    },true);
    v.addEventListener('pointerup',e=>{
      if(!drag||e.pointerId!==drag.id)return;
      const moved=drag.moved,p=v.getBoundingClientRect();
      try{localStorage.setItem(KEY,JSON.stringify({x:p.left,y:p.top}));}catch(_){}
      v.style.cursor='grab';drag=null;
      if(moved){e.preventDefault();e.stopImmediatePropagation();}
    },true);
    v.addEventListener('click',e=>{if(drag===null&&v.dataset.justDragged==='1'){e.preventDefault();e.stopImmediatePropagation();v.dataset.justDragged='0';}},true);
    return true;
  }

  install();
  new MutationObserver(install).observe(document.body,{subtree:true,childList:true});
  window.addEventListener('resize',()=>{const v=getVault();if(v)apply(v.getBoundingClientRect().left,v.getBoundingClientRect().top);});
})();
