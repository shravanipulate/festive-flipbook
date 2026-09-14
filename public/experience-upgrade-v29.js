(() => {
  'use strict';
  const APIS = [
    'https://pipedapi.kavin.rocks/search',
    'https://pipedapi.adminforge.de/search',
    'https://api.piped.yt/search',
    'https://pipedapi.owo.si/search'
  ];
  const clean = s => String(s || '').trim().slice(0, 100);
  const videoId = item => {
    const raw = String(item?.url || item?.id || '');
    const m = raw.match(/(?:v=|\/watch\?v=|\/shorts\/|\/embed\/|^)([A-Za-z0-9_-]{11})(?:[?&#/]|$)/);
    return m ? m[1] : (String(item?.id || '').match(/^[A-Za-z0-9_-]{11}$/)?.[0] || '');
  };
  function styles(){
    if(document.getElementById('v29-yt-style')) return;
    const s=document.createElement('style'); s.id='v29-yt-style';
    s.textContent=`#v29-youtube-search{margin-top:12px;padding:10px;border-radius:14px;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.12)}#v29-youtube-search .v29-row{display:flex;gap:7px;align-items:center}#v29-youtube-search input{flex:1;min-width:0;padding:9px 11px;border-radius:10px;border:1px solid rgba(255,255,255,.18);background:rgba(0,0,0,.2);color:inherit;outline:none}#v29-youtube-search button{padding:9px 12px;border:0;border-radius:10px;cursor:pointer}#v29-youtube-search .v29-status{min-height:18px;margin-top:6px;font-size:.78rem;opacity:.72}#v29-youtube-search .v29-results{display:grid;gap:7px;margin-top:8px;max-height:300px;overflow:auto}#v29-youtube-search .v29-result{display:grid;grid-template-columns:92px 1fr;gap:8px;width:100%;text-align:left;padding:6px;border:1px solid rgba(255,255,255,.1);border-radius:10px;background:rgba(255,255,255,.04);color:inherit;cursor:pointer}#v29-youtube-search .v29-result:hover{background:rgba(255,255,255,.09)}#v29-youtube-search .v29-result img{width:92px;height:52px;object-fit:cover;border-radius:7px;background:#000}#v29-youtube-search .v29-title{font-size:.72rem;line-height:1.25;font-weight:600}#v29-youtube-search .v29-channel{font-size:.58rem;opacity:.6;margin-top:3px}#v29-youtube-search iframe{display:block;width:100%;height:190px;margin-top:8px;border:0;border-radius:12px;background:#000}@media(max-width:520px){#v29-youtube-search iframe{height:170px}.v29-result{grid-template-columns:82px 1fr!important}.v29-result img{width:82px!important;height:47px!important}}`;
    document.head.appendChild(s);
  }
  function build(panel){
    let box=document.getElementById('v29-youtube-search'); if(box) return box;
    box=document.createElement('div'); box.id='v29-youtube-search';
    box.innerHTML='<div style="font-size:.82rem;margin-bottom:7px">▶ YouTube search</div><div class="v29-row"><input id="v29-yt-input" type="search" autocomplete="off" placeholder="Search YouTube…" aria-label="Search YouTube"><button id="v29-yt-btn" type="button">Search</button></div><div id="v29-yt-status" class="v29-status" aria-live="polite">Type something to search.</div><div id="v29-yt-results" class="v29-results"></div><iframe id="v29-yt-frame" title="YouTube player" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen></iframe>';
    panel.appendChild(box); return box;
  }
  async function search(q,status,results,frame){
    status.textContent='🔎 Searching YouTube…'; results.innerHTML='';
    let lastError=null;
    for(const api of APIS){
      try{
        const r=await fetch(api+'?q='+encodeURIComponent(q)+'&filter=videos',{headers:{Accept:'application/json'}});
        if(!r.ok) throw Error('HTTP '+r.status);
        const data=await r.json();
        const items=Array.isArray(data?.items)?data.items:(Array.isArray(data?.results)?data.results:[]);
        const videos=items.map(item=>({id:videoId(item),title:String(item?.title||'Untitled'),channel:String(item?.uploaderName||item?.channel||''),thumb:String(item?.thumbnail||'')})).filter(x=>x.id);
        if(!videos.length) continue;
        status.textContent=`▶ ${videos.length} results`;
        videos.slice(0,10).forEach(v=>{
          const b=document.createElement('button'); b.type='button'; b.className='v29-result';
          b.innerHTML=`<img src="${v.thumb||`https://i.ytimg.com/vi/${v.id}/mqdefault.jpg`}" alt=""><span><span class="v29-title"></span><span class="v29-channel"></span></span>`;
          b.querySelector('.v29-title').textContent=v.title; b.querySelector('.v29-channel').textContent=v.channel;
          b.addEventListener('click',()=>{frame.src='https://www.youtube.com/embed/'+v.id+'?autoplay=1&rel=0';status.textContent='▶ Playing selected video';frame.scrollIntoView({behavior:'smooth',block:'nearest'});});
          results.appendChild(b);
        });
        return;
      }catch(e){lastError=e;}
    }
    status.textContent='⚠️ YouTube search is temporarily unavailable. Try again.';
  }
  function init(){
    styles(); const panel=document.getElementById('bgmPanel'); if(!panel) return false;
    const box=build(panel); if(box.dataset.wired) return true; box.dataset.wired='1';
    const input=box.querySelector('#v29-yt-input'),btn=box.querySelector('#v29-yt-btn'),status=box.querySelector('#v29-yt-status'),results=box.querySelector('#v29-yt-results'),frame=box.querySelector('#v29-yt-frame');
    let timer=null;
    const run=()=>{const q=clean(input.value);clearTimeout(timer);if(!q){status.textContent='Type something to search.';results.innerHTML='';frame.removeAttribute('src');return;}search(q,status,results,frame);};
    input.addEventListener('input',()=>{clearTimeout(timer);status.textContent=input.value.trim()?'⌨️ Typing…':'Type something to search.';if(input.value.trim())timer=setTimeout(run,700);});
    input.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();run();}}); btn.addEventListener('click',run); return true;
  }
  function boot(){if(init())return;const mo=new MutationObserver(()=>{if(init())mo.disconnect()});mo.observe(document.documentElement,{childList:true,subtree:true});setTimeout(()=>mo.disconnect(),15000)}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
