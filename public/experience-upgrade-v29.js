(() => {
  'use strict';
  if (window.__birthdayYouTubeExistingSearchV29) return;
  window.__birthdayYouTubeExistingSearchV29 = true;

  const API_KEY = 'AIzaSyC78Uq8hOGxYE4s46QPwgk9vHa122LRgoM';
  const YT_API = 'https://www.googleapis.com/youtube/v3/search';
  const PIPED_APIS = [
    'https://pipedapi.kavin.rocks/search',
    'https://pipedapi.adminforge.de/search',
    'https://api.piped.yt/search'
  ];
  const clean = s => String(s || '').trim().slice(0, 100);

  function removeAccidentalBox() {
    document.getElementById('v29-youtube-search')?.remove();
  }

  function getPanel() {
    return document.getElementById('bgmPanel');
  }

  function findExistingInput(panel) {
    if (!panel) return null;
    const inputs = [...panel.querySelectorAll('input')];
    let best = null, bestScore = -Infinity;

    for (const input of inputs) {
      const type = String(input.type || 'text').toLowerCase();
      if (!['text', 'search', 'url'].includes(type)) continue;
      let score = 0;
      const hint = `${input.placeholder || ''} ${input.getAttribute('aria-label') || ''}`.toLowerCase();
      if (/youtube|song|search/.test(hint)) score += 20;

      let node = input;
      for (let depth = 0; node && depth < 6; depth++, node = node.parentElement) {
        const text = String(node.textContent || '').toLowerCase();
        if (text.includes('search youtube')) score += 20;
        if (text.includes('type a song name first')) score += 15;
        if (text.includes('youtube')) score += 5;
        const buttons = [...node.querySelectorAll('button')];
        if (buttons.some(b => /^\s*search\s*$/i.test(String(b.textContent || '').trim()))) score += 20;
      }
      if (score > bestScore) { bestScore = score; best = input; }
    }
    return bestScore >= 20 ? best : null;
  }

  function findExistingButton(input) {
    let node = input;
    for (let depth = 0; node && depth < 6; depth++, node = node.parentElement) {
      const buttons = [...node.querySelectorAll('button')];
      const b = buttons.find(x => /^\s*search\s*$/i.test(String(x.textContent || '').trim()))
        || buttons.find(x => /search/i.test(String(x.getAttribute('aria-label') || '')));
      if (b) return b;
    }
    return null;
  }

  function findSearchBlock(input, button) {
    let node = input;
    for (let depth = 0; node && depth < 6; depth++, node = node.parentElement) {
      if (button && node.contains(button)) return node;
    }
    return input?.parentElement || null;
  }

  function findStatus(block) {
    if (!block) return null;
    const candidates = [...block.querySelectorAll('*')];
    return candidates.find(el => {
      const t = String(el.textContent || '').trim();
      return t === 'Type a song name first 😭' || /song name first/i.test(t);
    }) || null;
  }

  function setStatus(el, text) {
    if (el) el.textContent = text;
  }

  function ensureResults(block) {
    if (!block) return null;
    let el = block.querySelector('#birthday-existing-yt-results');
    if (!el) {
      el = document.createElement('div');
      el.id = 'birthday-existing-yt-results';
      el.style.cssText = 'margin-top:7px;display:grid;gap:6px;max-height:230px;overflow:auto;';
      block.appendChild(el);
    }
    return el;
  }

  // Native YouTube embedded-player style: the selected video is rendered as
  // an actual YouTube iframe inside the existing BGM search block.
  function ensurePlayer(block) {
    if (!block) return null;
    let frame = block.querySelector('#birthday-existing-yt-player');
    if (!frame) {
      frame = document.createElement('iframe');
      frame.id = 'birthday-existing-yt-player';
      frame.title = 'YouTube player';
      frame.setAttribute('frameborder', '0');
      frame.setAttribute('referrerpolicy', 'strict-origin-when-cross-origin');
      frame.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen';
      frame.allowFullscreen = true;
      frame.style.cssText = 'display:none;width:100%;aspect-ratio:16/9;height:auto;min-height:170px;margin-top:8px;border:0;border-radius:12px;background:#000;overflow:hidden;';
      block.appendChild(frame);
    }
    return frame;
  }

  function clearResults(results, frame) {
    if (results) results.innerHTML = '';
    if (frame) {
      frame.removeAttribute('src');
      frame.style.display = 'none';
    }
  }

  function addResult(results, frame, status, video) {
    const row = document.createElement('button');
    row.type = 'button';
    row.style.cssText = 'display:grid;grid-template-columns:76px 1fr;gap:7px;align-items:center;width:100%;padding:5px;border:1px solid rgba(0,0,0,.08);border-radius:10px;background:rgba(255,255,255,.45);color:inherit;text-align:left;cursor:pointer;';

    const img = document.createElement('img');
    img.src = video.thumb || `https://i.ytimg.com/vi/${video.id}/mqdefault.jpg`;
    img.alt = '';
    img.style.cssText = 'width:76px;height:43px;object-fit:cover;border-radius:7px;background:#000;';

    const text = document.createElement('span');
    text.style.minWidth = '0';
    const title = document.createElement('span');
    title.textContent = video.title;
    title.style.cssText = 'display:block;font-size:.72rem;line-height:1.2;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;';
    const channel = document.createElement('span');
    channel.textContent = video.channel || '';
    channel.style.cssText = 'display:block;font-size:.58rem;opacity:.65;margin-top:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;';
    text.append(title, channel);
    row.append(img, text);

    row.addEventListener('click', () => {
      const origin = encodeURIComponent(window.location.origin);
      frame.src = `https://www.youtube.com/embed/${video.id}?enablejsapi=1&origin=${origin}&playsinline=1&autoplay=1&rel=0`;
      frame.style.display = 'block';
      setStatus(status, '▶ Playing selected YouTube track');
    });
    results.appendChild(row);
  }

  async function officialSearch(q) {
    const params = new URLSearchParams({
      part: 'snippet',
      q,
      type: 'video',
      maxResults: '8',
      videoEmbeddable: 'true',
      videoSyndicated: 'true',
      regionCode: 'IN',
      safeSearch: 'strict',
      key: API_KEY
    });
    const r = await fetch(`${YT_API}?${params}`);
    const data = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(data?.error?.message || `YouTube API HTTP ${r.status}`);
    return (data.items || []).map(x => ({
      id: x?.id?.videoId || '',
      title: x?.snippet?.title || 'Untitled',
      channel: x?.snippet?.channelTitle || '',
      thumb: x?.snippet?.thumbnails?.medium?.url || x?.snippet?.thumbnails?.default?.url || ''
    })).filter(x => x.id);
  }

  function getPipedId(item) {
    const raw = String(item?.url || item?.id || '');
    const m = raw.match(/(?:v=|\/watch\?v=|\/shorts\/|\/embed\/|^)([A-Za-z0-9_-]{11})(?:[?&#/]|$)/);
    return m ? m[1] : (String(item?.id || '').match(/^[A-Za-z0-9_-]{11}$/)?.[0] || '');
  }

  async function pipedSearch(q) {
    for (const base of PIPED_APIS) {
      try {
        const r = await fetch(`${base}?q=${encodeURIComponent(q)}&filter=videos`, { headers: { Accept: 'application/json' } });
        if (!r.ok) continue;
        const data = await r.json();
        const items = Array.isArray(data?.items) ? data.items : (Array.isArray(data?.results) ? data.results : []);
        const videos = items.map(x => ({
          id: getPipedId(x),
          title: String(x?.title || 'Untitled'),
          channel: String(x?.uploaderName || x?.channel || ''),
          thumb: String(x?.thumbnail || '')
        })).filter(x => x.id);
        if (videos.length) return videos.slice(0, 8);
      } catch (_) {}
    }
    return [];
  }

  async function search(q, input, button, status, results, frame) {
    q = clean(q);
    if (!q) {
      setStatus(status, 'Type a song name first 😭');
      clearResults(results, frame);
      return;
    }
    if (button) button.disabled = true;
    setStatus(status, '🔎 Searching YouTube…');
    clearResults(results, frame);

    try {
      let videos;
      try {
        videos = await officialSearch(q);
      } catch (officialError) {
        console.warn('[birthday YouTube official search]', officialError);
        setStatus(status, '🔄 YouTube API unavailable — trying backup…');
        videos = await pipedSearch(q);
        if (!videos.length) throw officialError;
      }

      if (!videos.length) {
        setStatus(status, 'No YouTube results found 😭');
        return;
      }
      setStatus(status, `▶ ${videos.length} results — choose one`);
      videos.forEach(v => addResult(results, frame, status, v));
    } catch (error) {
      console.error('[birthday YouTube search]', error);
      setStatus(status, `⚠️ Search failed: ${error?.message || 'try again'}`);
    } finally {
      if (button) button.disabled = false;
    }
  }

  function wire() {
    removeAccidentalBox();
    const panel = getPanel();
    const input = findExistingInput(panel);
    if (!input) return false;
    const button = findExistingButton(input);
    const block = findSearchBlock(input, button);
    const status = findStatus(block);
    const results = ensureResults(block);
    const frame = ensurePlayer(block);
    if (!button || !results) return false;

    if (input.dataset.birthdayYoutubeV29 === '1') return true;
    input.dataset.birthdayYoutubeV29 = '1';

    let timer = null;
    const run = () => search(input.value, input, button, status, results, frame);

    input.addEventListener('input', () => {
      clearTimeout(timer);
      if (!input.value.trim()) {
        setStatus(status, 'Type a song name first 😭');
        clearResults(results, frame);
        return;
      }
      setStatus(status, '⌨️ Typing…');
      timer = setTimeout(run, 900);
    });
    input.addEventListener('keydown', e => {
      if (e.key === 'Enter') {
        e.preventDefault();
        clearTimeout(timer);
        run();
      }
    });
    button.addEventListener('click', e => {
      e.preventDefault();
      e.stopImmediatePropagation();
      clearTimeout(timer);
      run();
    }, true);
    return true;
  }

  function boot() {
    if (wire()) return;
    const observer = new MutationObserver(() => { if (wire()) observer.disconnect(); });
    observer.observe(document.documentElement, { childList: true, subtree: true });
    setTimeout(() => observer.disconnect(), 20000);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
  else boot();
})();
