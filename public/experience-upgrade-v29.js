(() => {
  'use strict';
  if (window.__birthdayYouTubeExistingSearchV29) return;
  window.__birthdayYouTubeExistingSearchV29 = true;

  // Uses the existing BGM YouTube search controls already present in experience.html.
  // The API key is intentionally client-side here because this is a static birthday site.
  const API_KEY = 'AIzaSyC78Uq8hOGxYE4s46QPwgk9vHa122LRgoM';
  const API = 'https://www.googleapis.com/youtube/v3/search';
  const clean = s => String(s || '').trim().slice(0, 100);

  const esc = s => String(s || '').replace(/[&<>"']/g, ch => ({
    '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
  }[ch]));

  function removeAccidentalV29Box() {
    document.getElementById('v29-youtube-search')?.remove();
  }

  function findExistingSearch() {
    const panel = document.getElementById('bgmPanel');
    if (!panel) return null;

    const inputs = [...panel.querySelectorAll('input')];
    let best = null;
    let bestScore = -1;

    for (const input of inputs) {
      const type = String(input.getAttribute('type') || 'text').toLowerCase();
      if (!['text','search','url'].includes(type)) continue;

      let score = 0;
      let node = input;
      for (let depth = 0; node && depth < 5; depth++, node = node.parentElement) {
        const text = String(node.textContent || '').toLowerCase();
        if (text.includes('search youtube')) score += 12;
        if (text.includes('type a song name first')) score += 10;
        if (text.includes('youtube')) score += 4;
        const buttons = [...node.querySelectorAll('button')];
        if (buttons.some(b => String(b.textContent || '').trim().toLowerCase() === 'search')) score += 10;
        if (buttons.some(b => /search/i.test(String(b.getAttribute('aria-label') || '')))) score += 6;
      }
      if (/youtube|song|search/i.test(String(input.placeholder || '') + ' ' + String(input.getAttribute('aria-label') || ''))) score += 8;
      if (score > bestScore) { bestScore = score; best = input; }
    }

    return bestScore >= 10 ? best : null;
  }

  function findSearchButton(input) {
    if (!input) return null;
    let node = input;
    for (let depth = 0; node && depth < 5; depth++, node = node.parentElement) {
      const buttons = [...node.querySelectorAll('button')];
      const hit = buttons.find(b => /^\s*search\s*$/i.test(String(b.textContent || '').trim()))
        || buttons.find(b => /search/i.test(String(b.getAttribute('aria-label') || '')));
      if (hit) return hit;
    }
    return null;
  }

  function findStatus(input) {
    if (!input) return null;
    const all = [...document.querySelectorAll('*')];
    return all.find(el => String(el.textContent || '').trim() === 'Type a song name first 😭') || null;
  }

  function findHost(input, button) {
    let node = input;
    for (let depth = 0; node && depth < 5; depth++, node = node.parentElement) {
      if (button && node.contains(button)) return node;
    }
    return input?.parentElement || null;
  }

  function ensureResults(host) {
    if (!host) return null;
    let results = host.parentElement?.querySelector('#birthday-existing-yt-results');
    if (!results) {
      results = document.createElement('div');
      results.id = 'birthday-existing-yt-results';
      results.style.cssText = 'margin-top:7px;display:grid;gap:6px;max-height:240px;overflow:auto;';
      (host.parentElement || host).appendChild(results);
    }
    return results;
  }

  function ensurePlayer(host) {
    if (!host) return null;
    let frame = host.parentElement?.querySelector('#birthday-existing-yt-player');
    if (!frame) {
      frame = document.createElement('iframe');
      frame.id = 'birthday-existing-yt-player';
      frame.title = 'YouTube player';
      frame.allow = 'autoplay; encrypted-media; picture-in-picture';
      frame.allowFullscreen = true;
      frame.style.cssText = 'display:none;width:100%;height:170px;margin-top:7px;border:0;border-radius:12px;background:#000;';
      (host.parentElement || host).appendChild(frame);
    }
    return frame;
  }

  function setStatus(status, text) {
    if (status) status.textContent = text;
  }

  async function searchYouTube(query, input, button, status, results, frame) {
    const q = clean(query);
    if (!q) {
      setStatus(status, 'Type a song name first 😭');
      if (results) results.innerHTML = '';
      if (frame) { frame.removeAttribute('src'); frame.style.display = 'none'; }
      return;
    }

    if (button) button.disabled = true;
    setStatus(status, '🔎 Searching YouTube…');
    if (results) results.innerHTML = '';

    try {
      const params = new URLSearchParams({
        part: 'snippet',
        q,
        type: 'video',
        maxResults: '8',
        videoEmbeddable: 'true',
        videoSyndicated: 'true',
        regionCode: 'IN',
        key: API_KEY
      });

      const response = await fetch(`${API}?${params.toString()}`);
      const data = await response.json();
      if (!response.ok) throw new Error(data?.error?.message || `HTTP ${response.status}`);

      const videos = (data.items || []).filter(item => item?.id?.videoId);
      if (!videos.length) {
        setStatus(status, 'No YouTube results found 😭');
        return;
      }

      setStatus(status, `▶ ${videos.length} results — choose one`);

      videos.forEach(item => {
        const id = item.id.videoId;
        const title = item.snippet?.title || 'Untitled';
        const channel = item.snippet?.channelTitle || '';
        const thumb = item.snippet?.thumbnails?.medium?.url || item.snippet?.thumbnails?.default?.url || `https://i.ytimg.com/vi/${id}/mqdefault.jpg`;

        const row = document.createElement('button');
        row.type = 'button';
        row.style.cssText = 'display:grid;grid-template-columns:76px 1fr;gap:7px;align-items:center;width:100%;padding:5px;border:1px solid rgba(0,0,0,.08);border-radius:10px;background:rgba(255,255,255,.45);color:inherit;text-align:left;cursor:pointer;';
        row.innerHTML = `<img src="${esc(thumb)}" alt="" style="width:76px;height:43px;object-fit:cover;border-radius:7px;background:#000"><span style="min-width:0"><span style="display:block;font-size:.72rem;line-height:1.2;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${esc(title)}</span><span style="display:block;font-size:.58rem;opacity:.65;margin-top:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${esc(channel)}</span></span>`;

        row.addEventListener('click', () => {
          if (!frame) return;
          frame.src = `https://www.youtube.com/embed/${encodeURIComponent(id)}?autoplay=1&rel=0`;
          frame.style.display = 'block';
          setStatus(status, '▶ Playing selected YouTube track');
        });
        results?.appendChild(row);
      });
    } catch (error) {
      console.error('[birthday YouTube search]', error);
      setStatus(status, '⚠️ YouTube search failed. Try again.');
    } finally {
      if (button) button.disabled = false;
    }
  }

  function wire() {
    removeAccidentalV29Box();

    const input = findExistingSearch();
    if (!input) return false;
    if (input.dataset.birthdayYoutubeV29 === '1') return true;

    const button = findSearchButton(input);
    const status = findStatus(input);
    const host = findHost(input, button);
    const results = ensureResults(host);
    const frame = ensurePlayer(host);
    if (!button || !results) return false;

    input.dataset.birthdayYoutubeV29 = '1';
    let timer = null;

    const run = () => searchYouTube(input.value, input, button, status, results, frame);

    input.addEventListener('input', () => {
      clearTimeout(timer);
      if (!input.value.trim()) {
        setStatus(status, 'Type a song name first 😭');
        results.innerHTML = '';
        if (frame) { frame.removeAttribute('src'); frame.style.display = 'none'; }
        return;
      }
      setStatus(status, '⌨️ Typing…');
      timer = setTimeout(run, 900);
    });

    input.addEventListener('keydown', event => {
      if (event.key === 'Enter') {
        event.preventDefault();
        clearTimeout(timer);
        run();
      }
    });

    button.addEventListener('click', () => {
      clearTimeout(timer);
      run();
    });

    return true;
  }

  function boot() {
    if (wire()) return;
    const observer = new MutationObserver(() => {
      if (wire()) observer.disconnect();
    });
    observer.observe(document.documentElement, { childList: true, subtree: true });
    setTimeout(() => observer.disconnect(), 20000);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
  else boot();
})();
