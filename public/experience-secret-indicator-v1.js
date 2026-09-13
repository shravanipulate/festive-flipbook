(() => {
  if (window.__secretTraceIndicatorLoaded) return;
  window.__secretTraceIndicatorLoaded = true;

  const pw = () => document.getElementById('pwIn');
  const visible = el => {
    if (!el) return false;
    const r = el.getBoundingClientRect();
    const s = getComputedStyle(el);
    return r.width > 0 && r.height > 0 && s.display !== 'none' && s.visibility !== 'hidden' && s.opacity !== '0';
  };

  const style = document.createElement('style');
  style.textContent = `
    #secret-trace-line-guide{position:fixed;z-index:2147483640;height:2px;transform-origin:left center;pointer-events:none;opacity:0;transition:opacity .2s;background:rgba(120,80,40,.32);box-shadow:0 0 7px rgba(120,80,40,.12)}
    #secret-trace-progress-dot{position:fixed;z-index:2147483641;width:9px;height:9px;border-radius:50%;pointer-events:none;transform:translate(-50%,-50%);opacity:0;background:rgba(120,80,40,.45);box-shadow:0 0 0 3px rgba(120,80,40,.08),0 0 12px rgba(120,80,40,.18)}
    #secret-trace-hint{position:fixed;z-index:2147483642;left:50%;bottom:24px;transform:translateX(-50%);pointer-events:none;opacity:0;font:500 11px/1.2 system-ui,sans-serif;letter-spacing:.08em;color:rgba(45,35,30,.68);transition:opacity .2s}
    #secret-trace-hint.on{opacity:.72}
  `;
  document.head.appendChild(style);

  const line = document.createElement('div'); line.id = 'secret-trace-line-guide'; document.body.appendChild(line);
  const dot = document.createElement('div'); dot.id = 'secret-trace-progress-dot'; document.body.appendChild(dot);
  const hint = document.createElement('div'); hint.id = 'secret-trace-hint'; document.body.appendChild(hint);

  const geom = () => {
    const a = {x: innerWidth * .605, y: innerHeight * .533};
    const b = {x: innerWidth * .91, y: innerHeight * .22};
    return {a,b};
  };

  const nearLine = (p,a,b) => {
    const dx=b.x-a.x, dy=b.y-a.y;
    const t=Math.max(0,Math.min(1,((p.x-a.x)*dx+(p.y-a.y)*dy)/(dx*dx+dy*dy||1)));
    const q={x:a.x+dx*t,y:a.y+dy*t};
    return {d:Math.hypot(p.x-q.x,p.y-q.y),t,q};
  };

  let tracing=false;

  function drawGuide(){
    const {a,b}=geom();
    const dx=b.x-a.x,dy=b.y-a.y;
    const len=Math.hypot(dx,dy);
    line.style.left=a.x+'px';
    line.style.top=a.y+'px';
    line.style.width=len+'px';
    line.style.transform=`rotate(${Math.atan2(dy,dx)}rad)`;
  }

  window.addEventListener('resize',drawGuide);
  drawGuide();

  document.addEventListener('pointermove',e=>{
    if(!visible(pw())){line.style.opacity='0';dot.style.opacity='0';hint.classList.remove('on');return;}
    const {a,b}=geom();
    const hit=nearLine({x:e.clientX,y:e.clientY},a,b);
    const close=hit.d<Math.max(42,innerWidth*.05);
    line.style.opacity=close||tracing?'1':'0';
    if(close||tracing){
      dot.style.left=e.clientX+'px';
      dot.style.top=e.clientY+'px';
      dot.style.opacity='.8';
    }else dot.style.opacity='0';
    if(close && !tracing){hint.textContent='trace the line';hint.classList.add('on');}
    else if(tracing){hint.textContent='keep going…';hint.classList.add('on');}
  },true);

  document.addEventListener('pointerdown',e=>{
    if(!visible(pw())) return;
    const {a,b}=geom();
    const hit=nearLine({x:e.clientX,y:e.clientY},a,b);
    if(hit.d<Math.max(52,innerWidth*.065)) tracing=true;
  },true);

  document.addEventListener('pointerup',()=>{
    tracing=false;
    hint.classList.remove('on');
  },true);
})();
