(() => {
  if (window.__birthdayUpgradeV11Loaded) return;
  window.__birthdayUpgradeV11Loaded = true;

  const getPw = () => document.getElementById('pwIn');
  const visible = el => {
    if (!el) return false;
    const r = el.getBoundingClientRect(), s = getComputedStyle(el);
    return r.width > 0 && r.height > 0 && s.display !== 'none' && s.visibility !== 'hidden' && s.opacity !== '0';
  };
  const gateActive = () => visible(getPw());
  const point = (x,y) => ({x,y});
  const dist = (a,b) => Math.hypot(a.x-b.x,a.y-b.y);
  const project = (p,a,b) => { const dx=b.x-a.x,dy=b.y-a.y,l=dx*dx+dy*dy||1; return ((p.x-a.x)*dx+(p.y-a.y)*dy)/l; };
  const lineDistance = (p,a,b) => { const t=Math.max(0,Math.min(1,project(p,a,b))); return dist(p,point(a.x+(b.x-a.x)*t,a.y+(b.y-a.y)*t)); };

  // The artwork scales with the viewport. These are the two endpoints of the thin diagonal
  // in the opening card, plus the little mark/star where the line begins.
  const geometry = () => ({
    star: point(innerWidth*.605, innerHeight*.533),
    lineA: point(innerWidth*.605, innerHeight*.533),
    lineB: point(innerWidth*.91, innerHeight*.22)
  });

  const style=document.createElement('style');
  style.textContent=`
    #secret-trace-cursor{position:fixed;z-index:2147483646;width:16px;height:16px;border-radius:50%;pointer-events:none;transform:translate(-50%,-50%);opacity:0;transition:opacity .15s;box-shadow:0 0 0 1px rgba(130,90,55,.18),0 0 18px rgba(130,90,55,.16)}
    #secret-trace-cursor.hot{opacity:.42}
    #secret-trace-ring{position:fixed;z-index:2147483645;border:1px solid rgba(150,100,50,.28);border-radius:50%;pointer-events:none;transform:translate(-50%,-50%) scale(.6);opacity:0;transition:opacity .25s,transform .35s;width:116px;height:116px}
    #secret-trace-ring.on{opacity:.32;transform:translate(-50%,-50%) scale(1)}
    #secret-trace-message{position:fixed;left:50%;bottom:22px;transform:translateX(-50%);z-index:2147483647;pointer-events:none;opacity:0;color:rgba(40,30,25,.7);font:500 11px/1.2 system-ui,sans-serif;letter-spacing:.08em;transition:opacity .2s}
    #secret-trace-message.on{opacity:.72}
  `;
  document.head.appendChild(style);
  const cursor=document.createElement('div');cursor.id='secret-trace-cursor';document.body.appendChild(cursor);
  const ring=document.createElement('div');ring.id='secret-trace-ring';document.body.appendChild(ring);
  const msg=document.createElement('div');msg.id='secret-trace-message';document.body.appendChild(msg);
  const message=t=>{msg.textContent=t;msg.classList.toggle('on',!!t);clearTimeout(message.t);if(t)message.t=setTimeout(()=>msg.classList.remove('on'),900);};

  let phase=0,down=false,startT=0,lastAngle=null,totalAngle=0,startedAt=0;

  function directAdvance(){
    const pw=getPw();
    if(!pw)return;
    // Remove only the visible password gate layer. Do not persist an unlocked state.
    let gate=pw;
    for(let i=0;i<10 && gate.parentElement;i++){
      const r=gate.getBoundingClientRect(),s=getComputedStyle(gate);
      if(r.width>=innerWidth*.65 && r.height>=innerHeight*.35 && (s.position==='fixed'||s.position==='absolute')) break;
      gate=gate.parentElement;
    }
    gate.style.setProperty('display','none','important');
    gate.style.setProperty('pointer-events','none','important');

    // Use the site's own navigation control if present; otherwise advance the visible slide
    // directly. This avoids depending on the password handler's internal state.
    const next=document.getElementById('navNext');
    if(next && visible(next)) { next.click(); return; }
    const slides=[...document.querySelectorAll('#app .slide, .slide')];
    const active=slides.findIndex(s=>s.classList.contains('active'));
    if(active>=0 && slides[active+1]){
      slides[active].classList.remove('active');
      slides[active].classList.add('out');
      slides[active+1].classList.remove('out');
      slides[active+1].classList.add('active');
    }
  }

  function complete(){
    if(phase===3)return;
    phase=3;down=false;cursor.classList.remove('hot');ring.classList.remove('on');message('✦');
    setTimeout(directAdvance,180);
  }

  document.addEventListener('pointermove',e=>{
    if(!gateActive()||phase===3)return;
    const p=point(e.clientX,e.clientY),g=geometry();
    cursor.style.left=e.clientX+'px';cursor.style.top=e.clientY+'px';

    if(phase===0){
      const near=lineDistance(p,g.lineA,g.lineB)<Math.max(46,innerWidth*.055);
      cursor.classList.toggle('hot',near);
      return;
    }

    if(phase===1 && down){
      const t=project(p,g.lineA,g.lineB);
      const forward=startT<.5 ? t-startT : startT-t;
      if(forward>.58 && ((startT<.5&&t>.82)||(startT>=.5&&t<.18))){
        phase=2;down=false;lastAngle=null;totalAngle=0;ring.style.left=g.star.x+'px';ring.style.top=g.star.y+'px';ring.classList.add('on');message('✦');
      }
      return;
    }

    if(phase===2 && down){
      const r=dist(p,g.star);
      if(r<=Math.max(108,innerWidth*.125)){
        const a=Math.atan2(p.y-g.star.y,p.x-g.star.x);
        if(lastAngle!==null){let d=a-lastAngle;while(d>Math.PI)d-=Math.PI*2;while(d<-Math.PI)d+=Math.PI*2;if(Math.abs(d)<1.55)totalAngle+=Math.abs(d);}
        lastAngle=a;
        if(totalAngle>=Math.PI*1.45 && dist(p,g.star)<=Math.max(92,innerWidth*.11)) complete();
      }
    }
  },true);

  document.addEventListener('pointerdown',e=>{
    if(!gateActive()||phase===3)return;
    const p=point(e.clientX,e.clientY),g=geometry();
    if(phase===0){
      const t=project(p,g.lineA,g.lineB),near=lineDistance(p,g.lineA,g.lineB)<Math.max(52,innerWidth*.065);
      if(near && t>=-.12 && t<=1.12){phase=1;down=true;startT=t;startedAt=performance.now();message('...');e.preventDefault();}
    }else if(phase===2){
      if(dist(p,g.star)<=Math.max(120,innerWidth*.14)){down=true;lastAngle=Math.atan2(p.y-g.star.y,p.x-g.star.x);totalAngle=0;e.preventDefault();}
    }
  },true);

  document.addEventListener('pointerup',()=>{
    if(phase===1){phase=0;down=false;message('');}
    else if(phase===2 && !down){ /* keep the second stage armed */ }
    else if(phase===2){down=false;}
  },true);

  // Reset if the password gate disappears normally or the page changes.
  new MutationObserver(()=>{if(!gateActive()&&phase!==3){phase=0;down=false;cursor.classList.remove('hot');ring.classList.remove('on');}}).observe(document.body,{subtree:true,childList:true,attributes:true,attributeFilter:['style','class','hidden']});
})();
