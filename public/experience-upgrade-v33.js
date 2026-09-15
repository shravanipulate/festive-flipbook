(() => {
  'use strict';
  if (window.__birthdayYouTubeIndexxV33) return;
  window.__birthdayYouTubeIndexxV33 = true;

  let ytPlayer = null;
  let apiKeyPromise = null;

  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = String(text ?? '');
    return div.innerHTML;
  }

  async function getApiKey() {
    if (apiKeyPromise) return apiKeyPromise;
    apiKeyPromise = fetch('/experience-upgrade-v32.js', { cache: 'no-store' })
      .then(r => r.text())
      .then(text => {
        const match = text.match(/const API_KEY\s*=\s*['\"]([^'\"]+)['\"]/);
        if (!match) throw new Error('YouTube API key is not configured');
        return match[1];
      });
    return apiKeyPromise;
  }

  function ensureYouTubeApi() {
    if (window.YT?.Player) return Promise.resolve(window.YT);
    return new Promise(resolve => {
      const previous = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => {
        try { previous?.(); } catch (_) {}
        resolve(window.YT);
      };
      if (!document.querySelector('script[src*="youtube.com/iframe_api"]')) {
        const s = document.createElement('script');
        s.src = 'https://www.youtube.com/iframe_api';
        s.async = true;
        document.head.appendChild(s);
      }
    });
  }

  function buildPanel() {
    if (document.getElementById('birthday-youtube-panel-v33')) return document.getElementById('birthday-youtube-panel-v33');

    const style = document.createElement('style');
    style.id = 'birthday-youtube-indexx-v33-style';
    style.textContent = `
      #birthday-youtube-dock-v33{position:fixed;right:18px;bottom:18px;z-index:2147483000;font-family:inherit}
      #birthday-youtube-dock-v33 button{border:1px solid rgba(127,127,127,.22);border-radius:999px;padding:9px 13px;background:rgba(255,255,255,.82);color:inherit;backdrop-filter:blur(14px);box-shadow:0 8px 28px rgba(0,0,0,.12);cursor:pointer;font:inherit;font-size:11px;font-weight:800}
      #birthday-youtube-panel-v33{display:none;position:fixed;right:18px;bottom:64px;width:min(360px,calc(100vw - 28px));max-height:min(72vh,560px);overflow:auto;z-index:2147482999;padding:12px;border:1px solid rgba(127,127,127,.2);border-radius:16px;background:rgba(255,255,255,.94);color:#171717;backdrop-filter:blur(20px);box-shadow:0 18px 55px rgba(0,0,0,.18)}
      #birthday-youtube-panel-v33.open{display:block}
      #birthday-youtube-panel-v33 .yt-bgm-title{font-size:12px;font-weight:800;margin-bottom:8px;letter-spacing:.4px}
      #birthday-youtube-panel-v33 .yt-search-row{display:flex;gap:6px}
      #birthday-youtube-panel-v33 #ytSearchInput{flex:1;min-width:0;padding:8px 9px;border-radius:8px;border:1px solid rgba(127,127,127,.25);background:#fff;color:#171717;outline:none;font:inherit;font-size:12px}
      #birthday-youtube-panel-v33 #ytSearchBtn{padding:8px 10px;border:0;border-radius:8px;cursor:pointer;font-weight:800;font-size:10px;background:#171717;color:#fff}
      #birthday-youtube-panel-v33 #ytSearchStatus{font-size:10px;opacity:.65;margin-top:7px}
      #birthday-youtube-panel-v33 #ytResults{display:flex;flex-direction:column;gap:6px;margin-top:8px;max-height:230px;overflow-y:auto}
      #birthday-youtube-panel-v33 .yt-result{display:flex;align-items:center;gap:8px;padding:6px;border-radius:9px;cursor:pointer;border:1px solid rgba(127,127,127,.12);transition:transform .15s ease,background .15s ease;background:transparent;color:inherit;text-align:left;width:100%}
      #birthday-youtube-panel-v33 .yt-result:hover{transform:translateY(-1px);background:rgba(127,127,127,.1)}
      #birthday-youtube-panel-v33 .yt-result img{width:58px;height:34px;object-fit:cover;border-radius:5px;flex-shrink:0}
      #birthday-youtube-panel-v33 .yt-result-info{min-width:0;flex:1}
      #birthday-youtube-panel-v33 .yt-result-title{font-size:11px;font-weight:700;line-height:1.25;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
      #birthday-youtube-panel-v33 .yt-result-channel{font-size:9px;opacity:.6;margin-top:2px}
      #birthday-youtube-panel-v33 #ytPlayerWrap{display:none;margin-top:9px;border-radius:10px;overflow:hidden;aspect-ratio:16/9;background:#000}
      #birthday-youtube-panel-v33 #ytPlayer{width:100%;height:100%}
      @media(prefers-color-scheme:dark){#birthday-youtube-panel-v33{background:rgba(24,24,24,.95);color:#f5f5f5}#birthday-youtube-panel-v33 #ytSearchInput{background:#222;color:#f5f5f5}#birthday-youtube-panel-v33 #ytSearchBtn{background:#f5f5f5;color:#171717}#birthday-youtube-dock-v33 button{background:rgba(30,30,30,.82)}}
    `;
    document.head.appendChild(style);

    const panel = document.createElement('div');
    panel.id = 'birthday-youtube-panel-v33';
    panel.innerHTML = `
      <div class="yt-bgm-title">🎧 Search YouTube</div>
      <div class="yt-search-row">
        <input id="ytSearchInput" type="text" placeholder="Search any song..." autocomplete="off" />
        <button id="ytSearchBtn" type="button">SEARCH</button>
      </div>
      <div id="ytSearchStatus"></div>
      <div id="ytResults"></div>
      <div id="ytPlayerWrap"><div id="ytPlayer"></div></div>
    `;

    const dock = document.createElement('div');
    dock.id = 'birthday-youtube-dock-v33';
    dock.innerHTML = '<button type="button">🎵 BGM</button>';
    dock.querySelector('button').addEventListener('click', () => panel.classList.toggle('open'));

    document.body.appendChild(panel);
    document.body.appendChild(dock);
    return panel;
  }

  async function searchYouTubeBgm() {
    const input = document.getElementById('ytSearchInput');
    const resultsBox = document.getElementById('ytResults');
    const status = document.getElementById('ytSearchStatus');
    if (!input || !resultsBox || !status) return;
    const query = input.value.trim();
    if (!query) { status.textContent = 'Type a song name first 😭'; resultsBox.innerHTML = ''; return; }
    status.textContent = 'Searching…';
    resultsBox.innerHTML = '';
    try {
      const key = await getApiKey();
      const url = 'https://www.googleapis.com/youtube/v3/search' +
        '?part=snippet&q=' + encodeURIComponent(query) +
        '&type=video&videoEmbeddable=true&maxResults=5&order=relevance&key=' + encodeURIComponent(key);
      const response = await fetch(url, { cache: 'no-store' });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) { console.error('YouTube API error:', data); status.textContent = 'YouTube search failed.'; return; }
      if (!data.items?.length) { status.textContent = 'No results found.'; return; }
      status.textContent = 'Choose a song:';
      data.items.forEach(item => {
        const videoId = item?.id?.videoId;
        if (!videoId) return;
        const title = item?.snippet?.title || 'Untitled';
        const channel = item?.snippet?.channelTitle || '';
        const thumbnail = item?.snippet?.thumbnails?.medium?.url || item?.snippet?.thumbnails?.default?.url || '';
        const result = document.createElement('button');
        result.type = 'button';
        result.className = 'yt-result';
        result.innerHTML = `<img src="${escapeHtml(thumbnail)}" alt=""><div class="yt-result-info"><div class="yt-result-title">${escapeHtml(title)}</div><div class="yt-result-channel">${escapeHtml(channel)}</div></div>`;
        result.addEventListener('click', () => playYouTubeBgm(videoId, title));
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
    await ensureYouTubeApi();
    if (!window.YT?.Player) { status.textContent = 'YouTube player could not load.'; return; }
    if (ytPlayer) {
      ytPlayer.loadVideoById(videoId);
    } else {
      ytPlayer = new YT.Player('ytPlayer', {
        videoId,
        playerVars: { autoplay: 1, controls: 1, rel: 0, modestbranding: 1, playsinline: 1 },
        events: { onReady: event => event.target.playVideo() }
      });
    }
  }

  function boot() {
    const panel = buildPanel();
    const input = panel?.querySelector('#ytSearchInput');
    const button = panel?.querySelector('#ytSearchBtn');
    if (!input || !button || input.dataset.v33Wired === '1') return;
    input.dataset.v33Wired = '1';
    button.addEventListener('click', searchYouTubeBgm);
    input.addEventListener('keydown', event => { if (event.key === 'Enter') { event.preventDefault(); searchYouTubeBgm(); } });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
  else boot();
})();