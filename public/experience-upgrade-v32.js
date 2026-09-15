(() => {
  'use strict';
  if (window.__birthdayYouTubeExistingSearchV32) return;
  window.__birthdayYouTubeExistingSearchV32 = true;

  // YouTube Data API v3 is used only for search. Playback uses the IFrame Player API.
  const API_KEY = 'AIzaSyC78Uq8hOGxYE4s46QPwgk9vHa122LRgoM';
  const SEARCH_URL = 'https://www.googleapis.com/youtube/v3/search';
  let ytApiPromise = null;
  let player = null;

  const panel = () => document.getElementById('bgmPanel');
  const clean = s => String(s || '').replace(/\s+/g, ' ').trim().slice(0, 100);
  const escapeHtml = s => String(s || '').replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));

  function findInput() {
    const p = panel();
    if (!p) return null;
    const xs = [...p.querySelectorAll('input')].filter(x => /^(text|search|url)$/i.test(x.type || 'text'));
    return xs.sort((a, b) => {
      const score = x => /youtube|song|search/i.test(`${x.placeholder || ''} ${x.getAttribute('aria-label') || ''}`) ? 10 : 0;
      return score(b) - score(a);
    })[0] || null;
  }

  function findButton(input) {
    const p = panel();
    if (!p) return null;
    const all = [...p.querySelectorAll('button')];
    return all.find(b => /search/i.test(`${b.textContent || ''} ${b.getAttribute('aria-label') || ''}`)) || null;
  }

  function hostBlock(input, button) {
    const p = panel();
    if (!p) return null;
    let n = input;
    for (let i = 0; n && i < 8; i++, n = n.parentElement) {
      if (button && n.contains(button)) return n;
      if (n === p) return n;
    }
    return input?.parentElement || p;
  }

  function makeUI(block) {
    let status = block.querySelector('#birthday-yt-status-v32');
    if (!status) {
      status = document.createElement('div');
      status.id = 'birthday-yt-status-v32';
      status.style.cssText = 'margin-top:6px;font-size:.7rem;opacity:.75;line-height:1.3;';
      status.textContent = 'Type a song name, then press Search 🎵';
      block.appendChild(status);
    }
    let results = block.querySelector('#birthday-yt-results-v32');
    if (!results) {
      results = document.createElement('div');
      results.id = 'birthday-yt-results-v32';
      results.style.cssText = 'margin-top:7px;display:grid;gap:6px;max-height:240px;overflow:auto;';
      block.appendChild(results);
    }
    let host = block.querySelector('#birthday-yt-player-v32');
    if (!host) {
      host = document.createElement('div');
      host.id = 'birthday-yt-player-v32';
      host.style.cssText = 'display:none;width:100%;min-height:200px;aspect-ratio:16/9;margin-top:8px;border-radius:12px;overflow:hidden;background:#000;';
      block.appendChild(host);
    }
    return { status, results, host };
  }

  const setStatus = (el, text) => { if (el) el.textContent = text; };

  function loadYT() {
    if (window.YT?.Player) return Promise.resolve(window.YT);
    if (ytApiPromise) return ytApiPromise;
    ytApiPromise = new Promise(resolve => {
      const old = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => { try { old?.(); } catch (_) {} resolve(window.YT); };
      const s = document.createElement('script');
      s.src = 'https://www.youtube.com/iframe_api';
      s.async = true;
      document.head.appendChild(s);
    });
    return ytApiPromise;
  }

  async function play(id, title, ui) {
    ui.host.style.display = 'block';
    setStatus(ui.status, `▶ Loading: ${title}`);
    const YT = await loadYT();
    if (!YT?.Player) throw new Error('YouTube player API did not load');
    if (player?.loadVideoById) {
      player.loadVideoById(id);
      try { player.unMute(); player.setVolume(70); player.playVideo(); } catch (_) {}
      setStatus(ui.status, `▶ Playing: ${title}`);
      return;
    }
    player = new YT.Player(ui.host, {
      width: '100%', height: '100%', videoId: id,
      playerVars: { playsinline: 1, autoplay: 1, controls: 1, rel: 0, enablejsapi: 1, origin: location.origin },
      events: {
        onReady: e => { try { e.target.unMute(); e.target.setVolume(70); e.target.playVideo(); } catch (_) {} setStatus(ui.status, `▶ Playing: ${title}`); },
        onStateChange: e => { if (e.data === YT.PlayerState.PLAYING) setStatus(ui.status, `▶ Playing: ${title}`); },
        onAutoplayBlocked: () => setStatus(ui.status, '▶ Player ready — tap Play once'),
        onError: e => setStatus(ui.status, `⚠️ YouTube player error (${e.data})`)
      }
    });
  }

  async function search(q, button, ui) {
    q = clean(q);
    if (!q) { setStatus(ui.status, 'Type a song name first 😭'); ui.results.innerHTML = ''; return; }
    button && (button.disabled = true);
    setStatus(ui.status, '🔎 Searching YouTube…');
    ui.results.innerHTML = '';
    try {
      const url = new URL(SEARCH_URL);
      url.search = new URLSearchParams({ part:'snippet', q, type:'video', videoEmbeddable:'true', maxResults:'5', order:'relevance', key:API_KEY });
      const r = await fetch(url, { cache:'no-store' });
      const data = await r.json().catch(() => ({}));
      if (!r.ok) {
        const reason = data?.error?.errors?.[0]?.reason;
        throw new Error(reason ? `${data?.error?.message || 'YouTube API error'} [${reason}]` : (data?.error?.message || `HTTP ${r.status}`));
      }
      const videos = (data.items || []).map(x => ({ id:x?.id?.videoId, title:x?.snippet?.title || 'Untitled', channel:x?.snippet?.channelTitle || '', thumb:x?.snippet?.thumbnails?.medium?.url || x?.snippet?.thumbnails?.default?.url || '' })).filter(x => x.id);
      if (!videos.length) { setStatus(ui.status, 'No results found. Try the exact song title + artist.'); return; }
      setStatus(ui.status, 'Choose a song:');
      for (const v of videos) {
        const b = document.createElement('button');
        b.type = 'button';
        b.style.cssText = 'display:grid;grid-template-columns:76px 1fr;gap:7px;align-items:center;width:100%;padding:5px;border:1px solid rgba(0,0,0,.08);border-radius:10px;background:rgba(255,255,255,.45);color:inherit;text-align:left;cursor:pointer;';
        b.innerHTML = `<img src="${escapeHtml(v.thumb)}" alt="" style="width:76px;height:43px;object-fit:cover;border-radius:7px;background:#000"><span style="min-width:0"><span style="display:block;font-size:.72rem;line-height:1.2;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${escapeHtml(v.title)}</span><span style="display:block;font-size:.58rem;opacity:.65;margin-top:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${escapeHtml(v.channel)}</span></span>`;
        b.addEventListener('click', () => play(v.id, v.title, ui).catch(e => setStatus(ui.status, `⚠️ ${e.message || 'Player failed'}`)));
        ui.results.appendChild(b);
      }
    } catch (e) {
      console.error('[birthday YouTube v32]', e);
      setStatus(ui.status, `⚠️ Search failed: ${e.message || 'try again'}`);
    } finally { button && (button.disabled = false); }
  }

  function wire() {
    const input = findInput();
    if (!input || input.dataset.birthdayYoutubeV32 === '1') return;
    const button = findButton(input);
    const block = hostBlock(input, button);
    const ui = makeUI(block);
    input.dataset.birthdayYoutubeV32 = '1';
    const run = () => search(input.value, button, ui);
    input.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); run(); } });
    if (button) button.addEventListener('click', e => { e.preventDefault(); e.stopImmediatePropagation(); run(); }, true);
    input.addEventListener('input', () => { if (!input.value.trim()) setStatus(ui.status, 'Type a song name, then press Search 🎵'); else setStatus(ui.status, '⌨️ Ready — press Search'); });
  }

  const boot = () => { wire(); new MutationObserver(wire).observe(document.documentElement, { childList:true, subtree:true }); };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once:true }); else boot();
})();
