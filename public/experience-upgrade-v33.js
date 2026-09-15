(() => {
  'use strict';
  if (window.__birthdayYouTubeIndexxV33) return;
  window.__birthdayYouTubeIndexxV33 = true;

  const YOUTUBE_API_KEY = "AIzaSyC78Uq8hOGxYE4s46QPwgk9vHa122LRgoM";
  let ytPlayer = null;

  function onYouTubeIframeAPIReady() {}

  function loadYouTubeIframeAPI() {
    if (window.YT && window.YT.Player) return;
    if (document.querySelector('script[data-birthday-youtube-api="indexx"]')) return;
    const script = document.createElement('script');
    script.src = 'https://www.youtube.com/iframe_api';
    script.dataset.birthdayYoutubeApi = 'indexx';
    document.head.appendChild(script);
  }

  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  function installCSS() {
    if (document.getElementById('birthday-youtube-indexx-style')) return;
    const style = document.createElement('style');
    style.id = 'birthday-youtube-indexx-style';
    style.textContent = `
.yt-bgm-box { margin-top:10px; padding:10px; border-radius:12px; background:rgba(127,127,127,.08); border:1px solid rgba(127,127,127,.15); }
.yt-bgm-title { font-size:12px; font-weight:800; margin-bottom:8px; letter-spacing:.4px; }
.yt-search-row { display:flex; gap:6px; }
#ytSearchInput { flex:1; min-width:0; padding:8px 9px; border-radius:8px; border:1px solid rgba(127,127,127,.25); background:var(--card,#fff); color:inherit; outline:none; font:inherit; font-size:12px; }
#ytSearchInput:focus { border-color:currentColor; }
#ytSearchBtn { padding:8px 10px; border:0; border-radius:8px; cursor:pointer; font-weight:800; font-size:10px; background:currentColor; color:var(--bg,#fff); }
#ytSearchStatus { font-size:10px; opacity:.65; margin-top:7px; }
#ytResults { display:flex; flex-direction:column; gap:6px; margin-top:8px; max-height:230px; overflow-y:auto; }
.yt-result { display:flex; align-items:center; gap:8px; padding:6px; border-radius:9px; cursor:pointer; border:1px solid rgba(127,127,127,.12); transition:transform .15s ease, background .15s ease; }
.yt-result:hover { transform:translateY(-1px); background:rgba(127,127,127,.08); }
.yt-result img { width:58px; height:34px; object-fit:cover; border-radius:5px; flex-shrink:0; }
.yt-result-info { min-width:0; }
.yt-result-title { font-size:11px; font-weight:700; line-height:1.25; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden; }
.yt-result-channel { font-size:9px; opacity:.6; margin-top:2px; }
#ytPlayerWrap { display:none; margin-top:9px; border-radius:10px; overflow:hidden; aspect-ratio:16/9; }
#ytPlayer { width:100%; height:100%; }
`;
    document.head.appendChild(style);
  }

  function installUI() {
    const panel = document.getElementById('bgmPanel');
    if (!panel) return false;
    if (panel.querySelector('.yt-bgm-box')) return true;

    const row = panel.querySelector('.bgm-row') || panel;
    const box = document.createElement('div');
    box.className = 'yt-bgm-box';
    box.innerHTML = `
<div class="yt-bgm-title">🎧 Search YouTube</div>

<div class="yt-search-row">
  <input
    id="ytSearchInput"
    type="text"
    placeholder="Search any song..."
    autocomplete="off"
  />
  <button id="ytSearchBtn" onclick="searchYouTubeBgm()">SEARCH</button>
</div>

<div id="ytSearchStatus"></div>
<div id="ytResults"></div>

<div id="ytPlayerWrap">
  <div id="ytPlayer"></div>
</div>`;

    const track1 = row.querySelector('#bgmTrack1Btn');
    if (track1) row.insertBefore(box, track1.nextSibling);
    else row.appendChild(box);
    return true;
  }

  function waitForYT() {
    if (window.YT && window.YT.Player) return Promise.resolve(window.YT);
    return new Promise((resolve, reject) => {
      const started = Date.now();
      const timer = setInterval(() => {
        if (window.YT && window.YT.Player) {
          clearInterval(timer);
          resolve(window.YT);
        } else if (Date.now() - started > 15000) {
          clearInterval(timer);
          reject(new Error('YouTube player is still loading'));
        }
      }, 100);
    });
  }

  async function searchYouTubeBgm() {
    const input = document.getElementById('ytSearchInput');
    const resultsBox = document.getElementById('ytResults');
    const status = document.getElementById('ytSearchStatus');

    if (!input || !resultsBox || !status) return;

    const query = input.value.trim();

    if (!query) {
      status.textContent = 'Type a song name first 😭';
      resultsBox.innerHTML = '';
      return;
    }

    status.textContent = 'Searching…';
    resultsBox.innerHTML = '';

    try {
      const url =
        'https://www.googleapis.com/youtube/v3/search' +
        '?part=snippet' +
        '&q=' + encodeURIComponent(query) +
        '&type=video' +
        '&videoEmbeddable=true' +
        '&maxResults=5' +
        '&key=' + encodeURIComponent(YOUTUBE_API_KEY);

      const response = await fetch(url);
      const data = await response.json();

      if (!response.ok) {
        console.error('YouTube API error:', data);
        status.textContent = 'YouTube search failed.';
        return;
      }

      if (!data.items || data.items.length === 0) {
        status.textContent = 'No results found.';
        return;
      }

      status.textContent = 'Choose a song:';

      data.items.forEach(item => {
        const videoId = item.id.videoId;
        const title = item.snippet.title;
        const channel = item.snippet.channelTitle;
        const thumbnail = item.snippet.thumbnails?.medium?.url || item.snippet.thumbnails?.default?.url;

        const result = document.createElement('div');
        result.className = 'yt-result';
        result.innerHTML = `<img src="${thumbnail}" alt=""><div class="yt-result-info"><div class="yt-result-title">${escapeHtml(title)}</div><div class="yt-result-channel">${escapeHtml(channel)}</div></div>`;
        result.onclick = () => { playYouTubeBgm(videoId, title); };
        resultsBox.appendChild(result);
      });
    } catch (error) {
      console.error(error);
      status.textContent = "Couldn't connect to YouTube.";
    }
  }

  async function playYouTubeBgm(videoId, title = '') {
    const playerWrap = document.getElementById('ytPlayerWrap');
    const status = document.getElementById('ytSearchStatus');
    if (!playerWrap || !status) return;

    playerWrap.style.display = 'block';
    status.textContent = title ? 'Playing: ' + title : 'Playing selected song';

    try {
      const YT = await waitForYT();

      if (ytPlayer) {
        ytPlayer.loadVideoById(videoId);
      } else {
        ytPlayer = new YT.Player('ytPlayer', {
          videoId,
          playerVars: { autoplay:1, controls:1, rel:0, modestbranding:1 },
          events: { onReady: e => e.target.playVideo() }
        });
      }
    } catch (error) {
      status.textContent = 'YouTube player is still loading — try again.';
      console.error(error);
    }
  }

  window.onYouTubeIframeAPIReady = onYouTubeIframeAPIReady;
  window.searchYouTubeBgm = searchYouTubeBgm;
  window.playYouTubeBgm = playYouTubeBgm;

  function wire() {
    const input = document.getElementById('ytSearchInput');
    if (!input || input.dataset.birthdayYoutubeIndexx === '1') return;
    input.dataset.birthdayYoutubeIndexx = '1';
    input.addEventListener('keydown', function(event) {
      if (event.key === 'Enter') {
        event.preventDefault();
        searchYouTubeBgm();
      }
    });
  }

  function boot() {
    installCSS();
    loadYouTubeIframeAPI();
    if (installUI()) wire();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot, { once:true });
  } else {
    boot();
  }

  const observer = new MutationObserver(() => {
    if (document.getElementById('bgmPanel') && !document.querySelector('.yt-bgm-box')) boot();
    else wire();
  });
  observer.observe(document.documentElement, { childList:true, subtree:true });
})();