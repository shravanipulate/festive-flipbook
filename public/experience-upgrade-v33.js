(() => {
  'use strict';
  if (window.__birthdayYouTubeIndexxV33) return;
  window.__birthdayYouTubeIndexxV33 = true;

  // Supplied working YouTube Data API configuration. The IFrame player API is
  // loaded lazily only after a result is selected, keeping initial load lighter.
  const YOUTUBE_API_KEY = 'AIzaSyC78Uq8hOGxYE4s46QPwgk9vHa122LRgoM';
  const YOUTUBE_SEARCH_URL = 'https://www.googleapis.com/youtube/v3/search';
  let ytPlayer = null;
  let ytApiPromise = null;
  let activeSearch = 0;

  function escapeHtml(text) { const div=document.createElement('div'); div.textContent=text==null?'':String(text); return div.innerHTML; }

  function installCSS() {
    if(document.getElementById('birthday-youtube-indexx-style'))return;
    const style=document.createElement('style'); style.id='birthday-youtube-indexx-style';
    style.textContent=`
.yt-bgm-box{position:relative;z-index:10001;pointer-events:auto;margin-top:10px;padding:10px;border-radius:12px;background:rgba(127,127,127,.08);border:1px solid rgba(127,127,127,.15)}
.yt-bgm-box input,.yt-bgm-box button,.yt-bgm-box .yt-result{position:relative;z-index:10002;pointer-events:auto!important}
.yt-bgm-title{font-size:12px;font-weight:800;margin-bottom:8px;letter-spacing:.4px}.yt-search-row{display:flex;gap:6px;position:relative;z-index:10002}
#ytSearchInput{flex:1;min-width:0;padding:8px 9px;border-radius:8px;border:1px solid rgba(127,127,127,.25);background:var(--card,#fff);color:inherit;outline:none;font:inherit;font-size:13px;pointer-events:auto!important}
#ytSearchInput:focus{border-color:currentColor}#ytSearchBtn{padding:8px 10px;border:0;border-radius:8px;cursor:pointer;font-weight:800;font-size:10px;background:currentColor;color:var(--bg,#fff);pointer-events:auto!important}#ytSearchBtn:disabled{opacity:.55;cursor:wait}
#ytSearchStatus{font-size:10px;opacity:.65;margin-top:7px;min-height:14px}#ytResults{display:flex;flex-direction:column;gap:6px;margin-top:8px;max-height:230px;overflow-y:auto;position:relative;z-index:10002;pointer-events:auto}
.yt-result{display:flex;align-items:center;gap:8px;padding:6px;border-radius:9px;cursor:pointer;border:1px solid rgba(127,127,127,.12);transition:transform .15s ease,background .15s ease}.yt-result:hover{transform:translateY(-1px);background:rgba(127,127,127,.08)}.yt-result:focus{outline:2px solid currentColor;outline-offset:1px}
.yt-result img{width:58px;height:34px;object-fit:cover;border-radius:5px;flex-shrink:0;pointer-events:none}.yt-result-info{min-width:0;pointer-events:none}.yt-result-title{font-size:11px;font-weight:700;line-height:1.25;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}.yt-result-channel{font-size:9px;opacity:.6;margin-top:2px}
#ytPlayerWrap{display:none;margin-top:9px;border-radius:10px;overflow:hidden;aspect-ratio:16/9;position:relative;z-index:10001;background:#000}#ytPlayer{width:100%;height:100%}
#yt-standalone-container{position:fixed;bottom:20px;right:20px;width:280px;max-width:calc(100vw - 24px);box-sizing:border-box;background:rgba(20,20,30,.95);border:1px solid rgba(200,200,200,.3);border-radius:12px;padding:12px;z-index:10000;backdrop-filter:blur(10px);box-shadow:0 8px 32px rgba(0,0,0,.3);pointer-events:auto}
#yt-standalone-container input,#yt-standalone-container button,#yt-standalone-container .yt-result{pointer-events:auto!important}@media(max-width:600px){#yt-standalone-container{right:12px;bottom:12px;width:calc(100vw - 24px)}}`;
    document.head.appendChild(style);
  }

  function installUI(){
    const panel=document.getElementById('bgmPanel');
    if(panel){
      if(panel.querySelector('.yt-bgm-box'))return;
      const row=panel.querySelector('.bgm-row')||panel; const box=document.createElement('div'); box.className='yt-bgm-box';
      box.innerHTML=`<div class="yt-bgm-title">🎧 Search YouTube</div><div class="yt-search-row"><input id="ytSearchInput" type="text" placeholder="Search any song..." autocomplete="off"><button id="ytSearchBtn" type="button">SEARCH</button></div><div id="ytSearchStatus" aria-live="polite"></div><div id="ytResults"></div><div id="ytPlayerWrap"><div id="ytPlayer"></div></div>`;
      const track1=row.querySelector('#bgmTrack1Btn'); if(track1)row.insertBefore(box,track1.nextSibling);else row.appendChild(box); return;
    }
    if(document.getElementById('yt-standalone-container'))return;
    const container=document.createElement('div'); container.id='yt-standalone-container';
    container.innerHTML=`<div class="yt-bgm-box" style="margin:0;background:transparent;border:none"><div class="yt-bgm-title">🎧 Search YouTube</div><div class="yt-search-row"><input id="ytSearchInput" type="text" placeholder="Search any song..." autocomplete="off"><button id="ytSearchBtn" type="button">GO</button></div><div id="ytSearchStatus" aria-live="polite"></div><div id="ytResults"></div><div id="ytPlayerWrap"><div id="ytPlayer"></div></div></div>`;
    document.body.appendChild(container);
  }

  function loadYouTubeIframeAPI(){
    if(window.YT&&window.YT.Player)return Promise.resolve(window.YT); if(ytApiPromise)return ytApiPromise;
    ytApiPromise=new Promise((resolve,reject)=>{
      const previous=window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady=()=>{try{if(typeof previous==='function')previous();}catch(_){} if(window.YT&&window.YT.Player)resolve(window.YT);else reject(new Error('YouTube Player API unavailable'));};
      const existing=document.querySelector('script[data-birthday-youtube-api="indexx"]');
      if(existing){const started=Date.now();const timer=setInterval(()=>{if(window.YT&&window.YT.Player){clearInterval(timer);resolve(window.YT);}else if(Date.now()-started>15000){clearInterval(timer);reject(new Error('YouTube player timed out'));}},100);return;}
      const script=document.createElement('script'); script.src='https://www.youtube.com/iframe_api'; script.dataset.birthdayYoutubeApi='indexx'; script.async=true; script.onload=()=>{if(window.YT&&window.YT.Player)resolve(window.YT);}; script.onerror=()=>reject(new Error('Could not load YouTube player')); document.head.appendChild(script);
    }); return ytApiPromise;
  }

  async function searchYouTubeBgm(){
    const input=document.getElementById('ytSearchInput'), resultsBox=document.getElementById('ytResults'), status=document.getElementById('ytSearchStatus'), button=document.getElementById('ytSearchBtn'); if(!input||!resultsBox||!status)return;
    const query=input.value.trim(); if(!query){status.textContent='Type a song name first 😭';resultsBox.innerHTML='';input.focus();return;}
    const requestId=++activeSearch; status.textContent='Searching…';resultsBox.innerHTML='';if(button)button.disabled=true;
    const controller=new AbortController(), timeout=setTimeout(()=>controller.abort(),10000);
    try{
      const params=new URLSearchParams({part:'snippet',q:query,type:'video',videoEmbeddable:'true',maxResults:'5',key:YOUTUBE_API_KEY});
      const response=await fetch(`${YOUTUBE_SEARCH_URL}?${params.toString()}`,{signal:controller.signal,cache:'no-store'}); const data=await response.json().catch(()=>({})); if(requestId!==activeSearch)return;
      if(!response.ok){const reason=data?.error?.errors?.[0]?.reason||data?.error?.status||'';console.error('YouTube API error:',data);status.textContent=reason==='quotaExceeded'?'YouTube search quota is exhausted.':reason==='keyInvalid'?'The YouTube API key is invalid.':'YouTube search failed — try again.';return;}
      const items=Array.isArray(data.items)?data.items.filter(item=>item?.id?.videoId):[]; if(!items.length){status.textContent='No results found.';return;}
      status.textContent='Choose a song:'; const fragment=document.createDocumentFragment();
      items.forEach(item=>{const videoId=item.id.videoId,title=item.snippet?.title||'Untitled video',channel=item.snippet?.channelTitle||'',thumbnail=item.snippet?.thumbnails?.medium?.url||item.snippet?.thumbnails?.default?.url||'';const result=document.createElement('div');result.className='yt-result';result.tabIndex=0;result.setAttribute('role','button');result.innerHTML=`<img src="${escapeHtml(thumbnail)}" alt=""><div class="yt-result-info"><div class="yt-result-title">${escapeHtml(title)}</div><div class="yt-result-channel">${escapeHtml(channel)}</div></div>`;const select=()=>playYouTubeBgm(videoId,title);result.addEventListener('click',select);result.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();select();}});fragment.appendChild(result);});
      resultsBox.appendChild(fragment);
    }catch(error){if(requestId!==activeSearch)return;console.error(error);status.textContent=error?.name==='AbortError'?'YouTube took too long to respond.':"Couldn't connect to YouTube.";}finally{clearTimeout(timeout);if(button)button.disabled=false;}
  }

  async function playYouTubeBgm(videoId,title=''){
    const playerWrap=document.getElementById('ytPlayerWrap'),status=document.getElementById('ytSearchStatus');if(!playerWrap||!status||!videoId)return;playerWrap.style.display='block';status.textContent=title?`Loading: ${title}`:'Loading selected song…';
    try{const YT=await loadYouTubeIframeAPI();if(ytPlayer){ytPlayer.loadVideoById(videoId);status.textContent=title?`Playing: ${title}`:'Playing selected song';return;}ytPlayer=new YT.Player('ytPlayer',{videoId,playerVars:{autoplay:1,controls:1,rel:0,modestbranding:1,playsinline:1},events:{onReady:e=>e.target.playVideo(),onStateChange:e=>{if(e.data===1)status.textContent=title?`Playing: ${title}`:'Playing selected song';},onError:e=>{console.error('YouTube player error:',e.data);status.textContent='This video cannot be embedded. Pick another result.';}}});}catch(error){console.error(error);status.textContent='YouTube player could not load. Search still works.';}
  }

  window.searchYouTubeBgm=searchYouTubeBgm;window.playYouTubeBgm=playYouTubeBgm;
  function wire(){const input=document.getElementById('ytSearchInput'),button=document.getElementById('ytSearchBtn');if(!input||input.dataset.birthdayYoutubeIndexx==='1')return;input.dataset.birthdayYoutubeIndexx='1';if(button)button.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();searchYouTubeBgm();});input.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();e.stopPropagation();searchYouTubeBgm();}});}
  function boot(){installCSS();installUI();wire();}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
  const observer=new MutationObserver(()=>{if(!document.getElementById('ytSearchInput'))installUI();wire();});observer.observe(document.documentElement,{childList:true,subtree:true});
})();
