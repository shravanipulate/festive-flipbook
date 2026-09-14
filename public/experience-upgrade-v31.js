(() => {
  'use strict';
  if (window.__birthdayYouTubeExistingSearchV31) return;
  window.__birthdayYouTubeExistingSearchV31 = true;

  const API_KEY = 'AIzaSyC78Uq8hOGxYE4s46QPwgk9vHa122LRgoM';
  const SEARCH_URL = 'https://www.googleapis.com/youtube/v3/search';
  let ytApiPromise = null;
  let player = null;

  const clean = s => String(s || '').replace(/\s+/g, ' ').trim().slice(0, 100);
  const isTextInput = el => el && ['text', 'search', 'url'].includes(String(el.type || 'text').toLowerCase());
  const panel = () => document.getElementById('bgmPanel');

  function existingInput() {
    const p = panel();
    if (!p) return null;
    const inputs = [...p.querySelectorAll('input')].filter(isTextInput);
    let best = null, bestScore = -1;
    for (const input of inputs) {
      let score = 0;
      const hint = `${input.placeholder || ''} ${input.getAttribute('aria-label') || ''}`.toLowerCase();
      if (/youtube|song|search/.test(hint)) score += 50;
      let n = input;
      for (let i = 0; n && i < 8; i++, n = n.parentElement) {
        const text = String(n.textContent || '').toLowerCase();
        if (text.includes('search youtube')) score += 40;
        if (text.includes('song name')) score += 20;
        if ([...n.querySelectorAll('button')].some(b => /search/i.test(`${b.textContent || ''} ${b.getAttribute('aria-label') || ''}`))) score += 30;
      }
      if (score > bestScore) { bestScore = score; best = input; }
    }
    return best || inputs[0] || null;
  }

  function searchButton(input) {
    let n = input;
    for (let i = 0; n && i < 8; i++, n = n.parentElement) {
      const b = [...n.querySelectorAll('button')].find(x => /search/i.test(`${x.textContent || ''} ${x.getAttribute('aria-label') || ''}`));
      if (b) return b;
    }
    return null;
  }

  function searchBlock(input, button) {
    if (!input) return panel();
    let n = input;
    for (let i = 0; n && i < 8; i++, n = n.parentElement) {
      if (button && n.contains(button)) return n;
      if (n === panel()) return n;
    }
    return input.parentElement || panel();
  }

  function ensureStatus(block) {
    if (!block) return null;
    let el = block.querySelector('#birthday-existing-yt-status-v31');
    if (!el) {
      el = document.createElement('div');
      el.id = 'birthday-existing-yt-status-v31';
      el.textContent = 'Type a song name first 😭';
      el.style.cssText = 'margin-top:6px;font-size:.7rem;opacity:.72;line-height:1.25;';
      block.appendChild(el);
    }
    return el;
  }

  function ensureResults(block) {
    let el = block?.querySelector('#birthday-existing-yt-results');
    if (!el && block) {
      el = document.createElement('div');
      el.id = 'birthday-existing-yt-results';
      el.style.cssText = 'margin-top:7px;display:grid;gap:6px;max-height:240px;overflow:auto;';
      block.appendChild(el);
    }
    return el;
  }

  function ensurePlayerHost(block) {
    let host = block?.querySelector('#birthday-existing-yt-player');
    if (!host && block) {
      host = document.createElement('div');
      host.id = 'birthday-existing-yt-player';
      host.style.cssText = 'display:none;width:100%;min-width:200px;min-height:200px;aspect-ratio:16/9;margin-top:8px;border-radius:12px;overflow:hidden;background:#000;';
      block.appendChild(host);
    }
    return host;
  }

  function setStatus(el, text) { if (el) el.textContent = text; }

  function loadYTApi() {
    if (window.YT && window.YT.Player) return Promise.resolve(window.YT);
    if (ytApiPromise) return ytApiPromise;
    ytApiPromise = new Promise(resolve => {
      const previous = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => { try { if (typeof previous === 'function') previous(); } catch (_) {} resolve(window.YT); };
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      tag.async = true;
      document.head.appendChild(tag);
    });
    return ytApiPromise;
  }

  async function playVideo(videoId, title, status, host) {
    host.style.display = 'block';
    setStatus(status, `▶ Loading: ${title}`);
    const YT = await loadYTApi();
    if (!YT?.Player) throw new Error('YouTube player API did not load');
    if (player?.loadVideoById) {
      player.loadVideoById(videoId);
      try { player.unMute(); player.setVolume(70); player.playVideo(); } catch (_) {}
      return;
    }
    player = new YT.Player(host, {
      width: '100%', height: '100%', videoId,
      playerVars: { playsinline: 1, autoplay: 1, controls: 1, rel: 0, enablejsapi: 1, origin: window.location.origin },
      events: {
        onReady: e => { try { e.target.setVolume(70); e.target.unMute(); e.target.playVideo(); } catch (_) {} setStatus(status, `▶ Playing: ${title}`); },
        onStateChange: e => { if (window.YT && e.data === YT.PlayerState.PLAYING) setStatus(status, `▶ Playing: ${title}`); },
        onAutoplayBlocked: () => setStatus(status, '▶ Player ready — tap Play once if autoplay was blocked'),
        onError: e => setStatus(status, `⚠️ YouTube player error (${e.data})`)
      }
    });
  }

  async function requestSearch(q, embeddableOnly) {
    const params = new URLSearchParams({
      part: 'snippet', q, type: 'video', maxResults: '10',
      key: API_KEY
    });
    if (embeddableOnly) params.set('videoEmbeddable', 'true');
    const response = await fetch(`${SEARCH_URL}?${params}`, { cache: 'no-store' });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      const reason = data?.error?.errors?.[0]?.reason;
      throw new Error(reason ? `${data?.error?.message || 'YouTube API error'} [${reason}]` : (data?.error?.message || `YouTube API HTTP ${response.status}`));
    }
    const items = Array.isArray(data.items) ? data.items : [];
    return items.map(x => ({
      id: x?.id?.videoId || '',
      title: x?.snippet?.title || 'Untitled',
      channel: x?.snippet?.channelTitle || '',
      thumb: x?.snippet?.thumbnails?.medium?.url || x?.snippet?.thumbnails?.default?.url || ''
    })).filter(x => x.id);
  }

  function addResult(results, video, status, host) {
    const row = document.createElement('button');
    row.type = 'button';
    row.style.cssText = 'display:grid;grid-template-columns:76px 1fr;gap:7px;align-items:center;width:100%;padding:5px;border:1px solid rgba(0,0,0,.08);border-radius:10px;background:rgba(255,255,255,.45);color:inherit;text-align:left;cursor:pointer;';
    const img = document.createElement('img');
    img.src = video.thumb || `https://i.ytimg.com/vi/${video.id}/mqdefault.jpg`;
    img.alt = '';
    img.style.cssText = 'width:76px;height:43px;object-fit:cover;border-radius:7px;background:#000;';
    const text = document.createElement('span'); text.style.minWidth = '0';
    const title = document.createElement('span'); title.textContent = video.title; title.style.cssText = 'display:block;font-size:.72rem;line-height:1.2;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;';
    const channel = document.createElement('span'); channel.textContent = video.channel; channel.style.cssText = 'display:block;font-size:.58rem;opacity:.65;margin-top:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;';
    text.append(title, channel); row.append(img, text);
    row.addEventListener('click', async () => {
      try { await playVideo(video.id, video.title, status, host); }
      catch (err) { console.error('[birthday YouTube player]', err); setStatus(status, `⚠️ Could not load player: ${err?.message || 'try again'}`); }
    });
    results.appendChild(row);
  }

  async function searchYouTube(q, button, status, results, host) {
    q = clean(q);
    if (!q) { setStatus(status, 'Type a song name first 😭'); results.innerHTML = ''; return; }
    if (button) button.disabled = true;
    setStatus(status, '🔎 Searching YouTube…');
    results.innerHTML = '';
    try {
      let videos = [];
      try { videos = await requestSearch(q, true); } catch (firstError) { console.warn('[birthday YouTube embeddable search]', firstError); }
      if (!videos.length) videos = await requestSearch(q, false);
      if (!videos.length) {
        setStatus(status, 'YouTube returned 0 matching videos. Try a simpler search like the song title + artist.');
        return;
      }
      setStatus(status, `▶ ${videos.length} results — choose one`);
      videos.forEach(v => addResult(results, v, status, host));
    } catch (error) {
      console.error('[birthday YouTube search]', error);
      setStatus(status, `⚠️ Search failed: ${error?.message || 'try again'}`);
    } finally { if (button) button.disabled = false; }
  }

  function wire() {
    const input = existingInput();
    if (!input || input.dataset.birthdayYoutubeV31 === '1') return !!input;
    const button = searchButton(input);
    const block = searchBlock(input, button);
    const status = ensureStatus(block);
    const results = ensureResults(block);
    const host = ensurePlayerHost(block);
    if (!results || !host) return false;
    input.dataset.birthdayYoutubeV31 = '1';
    let timer = null;
    const run = () => searchYouTube(input.value, button, status, results, host);
    input.addEventListener('input', () => {
      clearTimeout(timer);
      if (!input.value.trim()) { setStatus(status, 'Type a song name first 😭'); results.innerHTML = ''; return; }
      setStatus(status, '⌨️ Typing…');
      timer = setTimeout(run, 900);
    });
    input.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); clearTimeout(timer); run(); } });
    if (button) button.addEventListener('click', e => { e.preventDefault(); e.stopImmediatePropagation(); clearTimeout(timer); run(); }, true);
    return true;
  }

  function boot() {
    wire();
    const observer = new MutationObserver(() => wire());
    observer.observe(document.documentElement, { childList: true, subtree: true });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true }); else boot();
})();
