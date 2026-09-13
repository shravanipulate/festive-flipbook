(() => {
  if (window.__birthdayTraceIndicatorLoaded) return;
  window.__birthdayTraceIndicatorLoaded = true;

  const pw = () => document.getElementById('pwIn');
  const visible = el => {
    if (!el) return false;
    const r = el.getBoundingClientRect(), s = getComputedStyle(el);
    return r.width > 0 && r.height > 0 && s.display !== 'none' && s.visibility !== 'hidden';
  };
  const gateActive = () => visible(pw());
  const P = (x,y) => ({x,y});
  const D = (a,b) => Math.hypot(a.x-b.x,a.y-b.y);
  const G = () => ({a:P(innerWidth*.605,innerHeight*.533), b:P(innerWidth*.91,innerHeight*.22)});
  const project = (p,a,b) => { const dx=b.x-a.x,dy=b.y-a.y,l=dx*dx+dy*dy||1; return ((p.x-a.x)*dx+(p.y-a.y)*dy)/l; };
  const closest = (p,a,b) => { const t=Math.max(0,Math.min(1,project(p,a,b))); return P(a.x+(b.x-a.x)*t,a.y+(b.y-a.y)*t); };
  const corridor = () => Math.max(120, innerWidth*.14);

  const style=document.createElement('style');
  style.textContent=`
    #trace-guide-line{position:fixed;z-index:2147483640;height:2px;transform-origin:0 50%;pointer-events:none;opacity:0;transition:opacity .25s;box-shadow:0 0 7px rgba(120,85,50,.35)}
    #trace-guide-line.show{opacity:.42}
    #trace-guide-dot{position:fixed;z-index:2147483641;width:9px;height:9px;border-radius:50%;transform:translate(-50%,-50%);pointer-events:none;opacity:0;box-shadow:0 0 0 2px rgba(120,85,50,.14),0 0 12px rgba(120,85,50,.3);transition:opacity .15s}
    #trace-guide-dot.show{opacity:.8}
    #trace-guide-label{position:fixed;z-index:2147483642;pointer-events:none;opacity:0;transform:translate(-50%,0);font:500 10px/1.2 system-ui,sans-serif;letter-spacing:.1em;text-transform:lowercase;transition:opacity .2s}
    #trace-guide-label.show{opacity:.55}
    #trace-star-hint{position:fixed;z-index:2147483641;width:30px;height:30px;border:1px solid rgba(120,85,50,.35);border-radius:50%;transform:translate(-50%,-50%) scale(.7);pointer-events:none;opacity:0;transition:opacity .25s,transform .3s}
    #trace-star-hint.show{opacity:.7;transform:translate(-50%,-50%) scale(1)}
  `;
  document.head.appendChild(style);

  const line=document.createElement('div'); line.id='trace-guide-line'; document.body.appendChild(line);
  const dot=document.createElement('div'); dot.id='trace-guide-dot'; document.body.appendChild(dot);
  const label=document.createElement('div'); label.id='trace-guide-label'; document.body.appendChild(label);
  const star=document.createElement('div'); star.id='trace-star-hint'; document.body.appendChild(star);

  let tracing=false, progress=0, completed=false;
  function renderLine(){
    const g=G(), dx=g.b.x-g.a.x, dy=g.b.y-g.a.y;
    line.style.left=g.a.x+'px'; line.style.top=g.a.y+'px';
    line.style.width=Math.hypot(dx,dy)+'px'; line.style.transform='rotate('+Math.atan2(dy,dx)+'rad)';
  }
  function showTarget(){
    renderLine(); line.classList.add('show');
    label.textContent='trace'; label.style.left=G().a.x+'px'; label.style.top=(G().a.y+18)+'px'; label.classList.add('show');
  }
  function finish(){
    completed=true; tracing=false; line.classList.remove('show'); dot.classList.remove('show'); label.classList.remove('show');
    const g=G(); star.style.left=g.a.x+'px'; star.style.top=g.a.y+'px'; star.classList.add('show');
    label.textContent='double-click ✦'; label.style.left=g.a.x+'px'; label.style.top=(g.a.y+22)+'px'; label.classList.add('show');
    setTimeout(()=>label.classList.remove('show'),1800);
  }

  document.addEventListener('pointermove',e=>{
    if(!gateActive()||completed)return;
    const g=G(),p=P(e.clientX,e.clientY),c=closest(p,g.a,g.b),d=D(p,c),t=project(p,g.a,g.b);
    if(!tracing){
      if(d<corridor()){ showTarget(); }
      return;
    }

    // Deliberately forgiving: you do NOT have to keep the cursor exactly on the line.
    // We only care that the cursor generally travels from the start toward the end.
    if(d>corridor()) return;
    dot.style.left=e.clientX+'px'; dot.style.top=e.clientY+'px'; dot.classList.add('show');
    progress=Math.max(progress,t);

    // Once most of the line has been traversed, reaching the broad end zone is enough.
    if(progress>.62 && t>.82){ finish(); }
  },true);

  document.addEventListener('pointerdown',e=>{
    if(!gateActive()||completed)return;
    const g=G(),p=P(e.clientX,e.clientY),c=closest(p,g.a,g.b),d=D(p,c),t=project(p,g.a,g.b);
    // Start anywhere reasonably close to the beginning of the guide, not on one exact pixel.
    if(!tracing && d<corridor() && t>=-.20 && t<=.28){
      tracing=true; progress=Math.max(0,t); showTarget();
      dot.style.left=e.clientX+'px'; dot.style.top=e.clientY+'px'; dot.classList.add('show');
      e.preventDefault();
    }
  },true);

  document.addEventListener('pointerup',()=>{
    // Let the user lift/reposition without forcing a pixel-perfect continuous trace.
    if(tracing){ tracing=false; dot.classList.remove('show'); }
  },true);

  new MutationObserver(()=>{ if(!gateActive()){line.classList.remove('show');dot.classList.remove('show');label.classList.remove('show');star.classList.remove('show');} }).observe(document.body,{subtree:true,childList:true,attributes:true,attributeFilter:['style','class','hidden']});
})();
