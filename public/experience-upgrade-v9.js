(() => {
  if (window.__birthdayUpgradeV9Loaded) return;
  window.__birthdayUpgradeV9Loaded = true;

  const visible = el => {
    if (!el) return false;
    const r = el.getBoundingClientRect(), s = getComputedStyle(el);
    return r.width > 0 && r.height > 0 && s.display !== 'none' && s.visibility !== 'hidden' && s.opacity !== '0';
  };
  const active = () => visible(document.getElementById('pwIn'));
  const dims = () => ({
    star:{x:innerWidth*.605,y:innerHeight*.533},
    a:{x:innerWidth*.625,y:innerHeight*.455},
    b:{x:innerWidth*.86,y:innerHeight*.255}
  });
  const dist=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
  const proj=(p,a,b)=>{const dx=b.x-a.x,dy=b.y-a.y,l=dx*dx+dy*dy||1;return((p.x-a.x)*dx+(p.y-a.y)*dy)/l;};
  const lineDist=(p,a,b)=>{const t=Math.max(0,Math.min(1,proj(p,a,b)));return dist(p,{x:a.x+(b.x-a.x)*t,y:a.y+(b.y-a.y)*t});};

  const css=document.createElement('style');css.textContent=`
    #secret-trace-glow{position:fixed;pointer-events:none;z-index:2147483640;width:18px;height:18px;border-radius:50%;transform:translate(-50%,-50%);opacity:0;transition:opacity .2s,box-shadow .2s;box-shadow:0 0 0 0 rgba(120,90,55,0)}
    #secret-trace-glow.on{opacity:.3;box-shadow:0 0 20px 6px rgba(120,90,55,.17)}
    #secret-trace-status{position:fixed;left:50%;bottom:20px;transform:translateX(-50%);z-index:2147483641;padding:7px 11px;border-radius:999px;background:rgba(20,16,14,.76);color:rgba(255,255,255,.72);font:500 10px/1.2 system-ui,sans-serif;opacity:0;pointer-events:none;transition:opacity .2s;backdrop-filter:blur(8px)}
    #secret-trace-status.show{opacity:.8}
  `;document.head.appendChild(css);
  const glow=document.createElement('div');glow.id='secret-trace-glow';document.body.appendChild(glow);
  const status=document.createElement('div');status.id='secret-trace-status';document.body.appendChild(status);
  const hint=t=>{status.textContent=t;status.classList.toggle('show',!!t);clearTimeout(hint.t);if(t)hint.t=setTimeout(()=>status.classList.remove('show'),1000);};

  let phase=0,tracing=false,startT=0,circle=[],total=0,lastAngle=null;

  function open(){
    const input=document.getElementById('pwIn');
    if(!input)return;
    const box=input.closest('[id],[class]');
    if(box)box.style.display='none';
    try{if(typeof window.nextSlide==='function')window.nextSlide();}catch(_){}
    window.dispatchEvent(new CustomEvent('birthday-secret-unlock'));
  }

  document.addEventListener('pointermove',e=>{
    if(!active()||phase===3)return;
    const p={x:e.clientX,y:e.clientY},d=dims();
    glow.style.left=e.clientX+'px';glow.style.top=e.clientY+'px';
    const near=lineDist(p,d.a,d.b)<Math.max(30,innerWidth*.04);glow.classList.toggle('on',near);
    if(phase===1&&tracing&&near){
      const t=proj(p,d.a,d.b),progress=startT<.5?t-startT:startT-t;
      if(progress>.70&&((startT<.5&&t>.82)||(startT>=.5&&t<.18))){phase=2;tracing=false;circle=[];total=0;lastAngle=null;hint('✦');}
    }else if(phase===2){
      const r=dist(p,d.star);
      if(r<=Math.max(82,innerWidth*.10)){
        const angle=Math.atan2(p.y-d.star.y,p.x-d.star.x);
        if(lastAngle!==null){let delta=angle-lastAngle;while(delta>Math.PI)delta-=Math.PI*2;while(delta<-Math.PI)delta+=Math.PI*2;if(Math.abs(delta)<1.25)total+=Math.abs(delta);}
        lastAngle=angle;circle.push(p);
        if(total>Math.PI*1.7&&circle.length>16&&dist(circle[0],p)<Math.max(48,innerWidth*.065)){phase=3;glow.classList.remove('on');hint('✦');setTimeout(open,100);}
      }
    }
  },true);

  document.addEventListener('pointerdown',e=>{
    if(!active()||phase===3)return;
    const p={x:e.clientX,y:e.clientY},d=dims();
    if(phase===0){
      const da=dist(p,d.a),db=dist(p,d.b),limit=Math.max(65,innerWidth*.075);
      if(Math.min(da,db)<=limit){phase=1;tracing=true;startT=proj(p,d.a,d.b);hint('...');}
    }else if(phase===2){circle=[p];total=0;lastAngle=Math.atan2(p.y-d.star.y,p.x-d.star.x);}
  },true);
  document.addEventListener('pointerup',()=>{if(phase===1){phase=0;tracing=false;hint('');}},true);
  new MutationObserver(()=>{if(!active()&&phase!==3){phase=0;tracing=false;circle=[];glow.classList.remove('on');}}).observe(document.body,{subtree:true,childList:true,attributes:true,attributeFilter:['style','class','hidden']});
})();
