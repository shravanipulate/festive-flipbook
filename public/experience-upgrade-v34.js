(() => {
  'use strict';
  if (window.__birthdayYouTubeStylishV34) return;
  window.__birthdayYouTubeStylishV34 = true;

  const STYLE_ID = 'birthday-youtube-stylish-v34-style';
  const BOX_ID = 'birthday-youtube-stylish-v34-box';
  let ytPlayer = null;
  let ytApiPromise = null;

  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text == null ? '' : String(text);
    return div.innerHTML;
  }

  function installCSS() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      #${BOX_ID} { margin-top:12px; padding:12px; border-radius:16px; background:linear-gradient(135deg,rgba(127,127,127,.10),rgba(127,127,127,.035)); border:1px solid rgba(127,127,127,.18); box-shadow:0 8px 24px rgba(0,0,0,.06); }
      #${BOX_ID} .yt-v34-heading { display:flex; align-items:center; justify-content:space-between; gap:8px; margin-bottom:9px; }
      #${BOX_ID} .yt-v34-title { font-size:12px; font-weight:900; letter-spacing:.35px; }
      #${BOX_ID} .yt-v34-subtitle { font-size:9px; opacity:.55; }
      #${BOX_ID} .yt-v34-search { display:flex; gap:7px; align-items:center; padding:5px; border:1px solid rgba(127,127,127,.22); border-radius:12px; background:var(--card,#fff); transition:border-color .18s ease,box-shadow .18s ease,transform .18s ease; }
      #${BOX_ID} .yt-v34-search:focus-within { border-color:currentColor; box-shadow:0 0 0 3px rgba(127,127,127,.10); transform:translateY(-1px); }
      #${BOX_ID} #ytSearchInput { flex:1; min-width:0; border:0; outline:0; background:transparent; color:inherit; padding:8px; font:inherit; font-size:12px; }
      #${BOX_ID} #ytSearchInput::placeholder { opacity:.48; }
      #${BOX_ID} #ytSearchBtn { border:0; border-radius:9px; padding:8px 11px; cursor:pointer; font-size:10px; font-weight:900; letter-spacing:.35px; background:currentColor; color:var(--bg,#fff); transition:transform .15s ease,opacity .15s ease; }
      #${BOX_ID} #ytSearchBtn:hover { transform:scale(1.03); }
      #${BOX_ID} #ytSearchBtn:active { transform:scale(.97); }
      #${BOX_ID} #ytSearchBtn:disabled { opacity:.5; cursor:wait; transform:none; }
      #${BOX_ID} .yt-v34-hint { margin-top:7px; font-size:9px; opacity:.48; }
      #${BOX_ID} #ytSearchStatus { font-size:10px; opacity:.68; margin-top:8px; min-height:14px; }
      #${BOX_ID} #ytResults { display:flex; flex-direction:column; gap:7px; margin-top:8px; max-height:245px; overflow-y:auto; scrollbar-width:thin; }
      #${BOX_ID} .yt-result { display:flex; align-items:center; gap:9px; padding:7px; border-radius:11px; cursor:pointer; border:1px solid rgba(127,127,127,.14); background:rgba(127,127,127,.035); transition:transform .16s ease,background .16s ease,border-color .16s ease; }
      #${BOX_ID} .yt-result:hover { transform:translateY(-1px); background:rgba(127,127,127,.09); border-color:rgba(127,127,127,.25); }
      #${BOX_ID} .yt-result img { width:64px; height:38px; object-fit:cover; border-radius:7px; flex-shrink:0; background:rgba(127,127,127,.1); }
      #${BOX_ID} .yt-result-info { min-width:0; }
      #${BOX_ID} .yt-result-title { font-size:11px; font-weight:800; line-height:1.3; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden; }
      #${BOX_ID} .yt-result-channel { font-size:9px; opacity:.58; margin-top:3px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
      #${BOX_ID} #ytPlayerWrap { display:none; margin-top:10px; border-radius:12px; overflow:hidden; aspect-ratio:16/9; background:#000; }
      #${BOX_ID} #ytPlayer { width:100%; height:100%; }
    `;
    document.head.appendChild(style);
  }

  function installUI() {
    const panel = document.getElementById('bgmPanel');
    if (!panel) return false;
    const old = panel.querySelector('.yt-bgm-box:not(#' + BOX_ID + ')');
    if (old) old.remove();

    let box = document.getElementById(BOX_ID);
    if (!box) {
      box = document.createElement('div');
      box.id = BOX_ID;
      box.innerHTML = `
        <div class="yt-v34-heading"><div class="yt-v34-title">🎧 Search YouTube</div><div class="yt-v34-subtitle">find a song instantly</div></div>
        <div class="yt-v34-search"><input id="ytSearchInput" type="text" placeholder="Search any song..." autocomplete="off" /><button id="ytSearchBtn" type="button">SEARCH</button></div>
        <div class="yt-v34-hint">Try a song, artist, remix, soundtrack, or vibe.</div>
        <div id="ytSearchStatus"></div>
        <div id="ytResults"></div>
        <div id="ytPlayerWrap"><div id="ytPlayer"></div></div>
      `;
      const track1 = panel.querySelector('#bgmTrack1Btn');
      if (track1 && track1.parentElement === panel) panel.insertBefore(box, track1.nextSibling);
      else panel.appendChild(box);
    }

    const input = box.querySelector('#ytSearchInput');
    const button = box.querySelector('#ytSearchBtn');
    if (button && button.dataset.v34Wired !== '1') {
      button.dataset.v34Wired = '1';
      button.addEventListener('click', searchYouTubeBgm);
    }
    if (input && input.dataset.v34Wired !== '1') {
      input.dataset.v34Wired = '1';
      input.addEventListener('keydown', event => {
        if (event.key === 'Enter') { event.preventDefault(); searchYouTubeBgm(); }
      });
    }
    return true;
  }

  async function getApiKey() {
    if (window.__birthdayV34ApiKey) return window.__birthdayV34ApiKey;
    try {
      const response = await fetch('/experience-upgrade-v33.js', { cache:'no-store' });
      if (!response.ok) throw new Error('Key source unavailable');
      const source = await response.text();
      const match = source.match(/YOUTUBE_API_KEY\\s*=\\s*["']([^"']+)["']/);
      if (!match || !match[1]) throw new Error('YouTube key not found');
      window.__birthdayV34ApiKey = match[1];
      return match[1];
    } catch (error) {
      console.error('YouTube key bootstrap failed:', error);
      return null;
    }
  }

  function loadYouTubeAPI() {
    if (window.YT && window.YT.Player) return Promise.resolve();
    if (ytApiPromise) return ytApiPromise;
    ytApiPromise = new Promise((resolve, reject) => {
      const previous = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => {
        if (typeof previous === 'function') { try { previous(); } catch (_) {} }
        resolve();
      };
      const existing = document.querySelector('script[src*="youtube.com/iframe_api"]');
      if (existing) {
        const started = Date.now();
        const timer = setInterval(() => {
          if (window.YT && window.YT.Player) { clearInterval(timer); resolve(); }
          else if (Date.now() - started > 12000) { clearInterval(timer); reject(new Error('YouTube player timed out')); }
        }, 100);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://www.youtube.com/iframe_api';
      script.async = true;
      script.onerror = () => reject(new Error('Could not load YouTube player'));
      document.head.appendChild(script);
      setTimeout(() => {
        if (!(window.YT && window.YT.Player)) reject(new Error('YouTube player timed out'));
      }, 12000);
    });
    return ytApiPromise;
  }

  async function searchYouTubeBgm() {
    const input = document.getElementById('ytSearchInput');
    const resultsBox = document.getElementById('ytResults');
    const status = document.getElementById('ytSearchStatus');
    const button = document.getElementById('ytSearchBtn');
    if (!input || !resultsBox || !status) return;
    const query = input.value.trim();
    if (!query) { status.textContent = 'Type a song name first 😭'; resultsBox.innerHTML = ''; return; }

    status.textContent = 'Searching…';
    resultsBox.innerHTML = '';
    if (button) button.disabled = true;

    try {
      const apiKey = await getApiKey();
      if (!apiKey) throw new Error('API key unavailable');
      const url = 'https://www.googleapis.com/youtube/v3/search' +
        '?part=snippet&q=' + encodeURIComponent(query) +
        '&type=video&videoEmbeddable=true&maxResults=5&key=' + encodeURIComponent(apiKey);
      const response = await fetch(url);
      const data = await response.json();
      if (!response.ok) {
        console.error('YouTube API error:', data);
        status.textContent = 'YouTube search failed.';
        return;
      }
      if (!data.items || !data.items.length) { status.textContent = 'No results found.'; return; }
      status.textContent = 'Choose a song:';
      data.items.forEach(item => {
        const videoId = item.id && item.id.videoId;
        if (!videoId) return;
        const title = item.snippet && item.snippet.title || 'Untitled video';
        const channel = item.snippet && item.snippet.channelTitle || '';
        const thumbnail = item.snippet && item.snippet.thumbnails && (item.snippet.thumbnails.medium || item.snippet.thumbnails.default);
        const result = document.createElement('div');
        result.className = 'yt-result';
        result.innerHTML = `<img src="${escapeHtml(thumbnail ? thumbnail.url : '')}" alt=""><div class="yt-result-info"><div class="yt-result-title">${escapeHtml(title)}</div><div class="yt-result-channel">${escapeHtml(channel)}</div></div>`;
        result.addEventListener('click', () => playYouTubeBgm(videoId, title));
        resultsBox.appendChild(result);
      });
    } catch (error) {
      console.error(error);
      status.textContent = 'Couldn’t connect to YouTube.';
    } finally {
      if (button) button.disabled = false;
    }
  }

  async function playYouTubeBgm(videoId, title) {
    const playerWrap = document.getElementById('ytPlayerWrap');
    const status = document.getElementById('ytSearchStatus');
    if (!playerWrap) return;
    playerWrap.style.display = 'block';
    if (status) status.textContent = title ? 'Loading: ' + title : 'Loading selected song…';
    try {
      await loadYouTubeAPI();
      if (ytPlayer && typeof ytPlayer.loadVideoById === 'function') {
        ytPlayer.loadVideoById(videoId);
      } else {
        ytPlayer = new YT.Player('ytPlayer', {
          videoId,
          playerVars:{ autoplay:1, controls:1, rel:0, modestbranding:1 },
          events:{ onReady:event => event.target.playVideo(), onStateChange:event => { if (event.data === 1 && status) status.textContent = title ? 'Playing: ' + title : 'Playing selected song'; } }
        });
      }
    } catch (error) {
      console.error(error);
      if (status) status.textContent = 'Couldn’t load the YouTube player.';
    }
  }

  window.searchYouTubeBgm = searchYouTubeBgm;
  window.playYouTubeBgm = playYouTubeBgm;

  function boot() { installCSS(); installUI(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once:true });
  else boot();

  const observer = new MutationObserver(() => { if (document.getElementById('bgmPanel')) boot(); });
  observer.observe(document.documentElement, { childList:true, subtree:true });
})();
