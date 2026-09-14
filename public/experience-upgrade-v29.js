(() => {
  'use strict';

  const esc = s => String(s || '').trim();
  const ytSrc = q => 'https://www.youtube.com/embed/?listType=search&list=' + encodeURIComponent(q) + '&autoplay=0&rel=0';

  function addStyles() {
    if (document.getElementById('v29-yt-style')) return;
    const st = document.createElement('style');
    st.id = 'v29-yt-style';
    st.textContent = `
      #v29-youtube-search{margin-top:12px;padding:10px;border-radius:14px;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.12)}
      #v29-youtube-search .v29-row{display:flex;gap:7px;align-items:center}
      #v29-youtube-search input{flex:1;min-width:0;padding:9px 11px;border-radius:10px;border:1px solid rgba(255,255,255,.18);background:rgba(0,0,0,.2);color:inherit;outline:none}
      #v29-youtube-search button{padding:9px 12px;border:0;border-radius:10px;cursor:pointer}
      #v29-youtube-search .v29-status{min-height:18px;margin-top:6px;font-size:.78rem;opacity:.72}
      #v29-youtube-search iframe{display:block;width:100%;height:190px;margin-top:8px;border:0;border-radius:12px;background:#000}
      @media(max-width:520px){#v29-youtube-search iframe{height:170px}}
    `;
    document.head.appendChild(st);
  }

  function makeSearchUI(panel) {
    if (document.getElementById('v29-youtube-search')) return document.getElementById('v29-youtube-search');
    const box = document.createElement('div');
    box.id = 'v29-youtube-search';
    box.innerHTML = `
      <div style="font-size:.82rem;margin-bottom:7px">▶ YouTube search</div>
      <div class="v29-row">
        <input id="v29-yt-input" type="search" autocomplete="off" placeholder="Search YouTube…" aria-label="Search YouTube">
        <button id="v29-yt-btn" type="button">Search</button>
      </div>
      <div id="v29-yt-status" class="v29-status" aria-live="polite">Type something to search.</div>
      <iframe id="v29-yt-frame" title="YouTube search" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen></iframe>
    `;
    panel.appendChild(box);
    return box;
  }

  function wire(box) {
    if (!box || box.dataset.v29Wired) return;
    box.dataset.v29Wired = '1';
    const input = box.querySelector('input');
    const btn = box.querySelector('button');
    const status = box.querySelector('.v29-status');
    const frame = box.querySelector('iframe');
    if (!input || !btn || !status || !frame) return;

    let timer = null;
    const run = () => {
      const q = esc(input.value);
      clearTimeout(timer);
      if (!q) {
        status.textContent = 'Type something to search.';
        frame.removeAttribute('src');
        return;
      }
      status.textContent = '🔎 Searching YouTube…';
      timer = setTimeout(() => {
        frame.src = ytSrc(q);
        status.textContent = '▶ YouTube results';
      }, 350);
    };

    input.addEventListener('input', () => {
      const q = esc(input.value);
      status.textContent = q ? '⌨️ Typing…' : 'Type something to search.';
      clearTimeout(timer);
      if (q) timer = setTimeout(run, 500);
    });
    input.addEventListener('keydown', e => {
      if (e.key === 'Enter') { e.preventDefault(); run(); }
    });
    btn.addEventListener('click', run);
  }

  function init() {
    addStyles();
    const panel = document.getElementById('bgmPanel');
    if (!panel) return false;

    // If the existing BGM already has a YouTube search box, wire it up.
    const inputs = [...panel.querySelectorAll('input')];
    const existing = inputs.find(i => /youtube|yt|search/i.test(
      [i.placeholder, i.getAttribute('aria-label'), i.name, i.id].filter(Boolean).join(' ')
    ));

    if (existing) {
      let box = existing.closest('.bgm-row, .bgm-search, .search-row, div');
      // Avoid grabbing the entire panel when the input is directly nested.
      if (!box || box === panel) box = existing.parentElement;
      if (!box) return false;
      if (!box.querySelector('.v29-status')) {
        const status = document.createElement('div');
        status.className = 'v29-status';
        status.style.cssText = 'min-height:18px;margin-top:6px;font-size:.78rem;opacity:.72';
        status.setAttribute('aria-live','polite');
        status.textContent = 'Type something to search.';
        box.appendChild(status);
      }
      let frame = panel.querySelector('#v29-yt-frame');
      if (!frame) {
        frame = document.createElement('iframe');
        frame.id = 'v29-yt-frame';
        frame.title = 'YouTube search';
        frame.allow = 'autoplay; encrypted-media; picture-in-picture';
        frame.allowFullscreen = true;
        frame.style.cssText = 'display:block;width:100%;height:190px;margin-top:8px;border:0;border-radius:12px;background:#000';
        panel.appendChild(frame);
      }
      // Wire the existing input with its nearest search button.
      if (!existing.dataset.v29Wired) {
        existing.dataset.v29Wired = '1';
        let timer = null;
        const status = box.querySelector('.v29-status');
        const button = box.querySelector('button') || [...panel.querySelectorAll('button')].find(b => /search|yt|youtube/i.test(b.textContent || ''));
        const run = () => {
          const q = esc(existing.value);
          clearTimeout(timer);
          if (!q) { status.textContent = 'Type something to search.'; frame.removeAttribute('src'); return; }
          status.textContent = '🔎 Searching YouTube…';
          timer = setTimeout(() => { frame.src = ytSrc(q); status.textContent = '▶ YouTube results'; }, 350);
        };
        existing.addEventListener('input', () => {
          const q = esc(existing.value);
          clearTimeout(timer);
          status.textContent = q ? '⌨️ Typing…' : 'Type something to search.';
          if (q) timer = setTimeout(run, 500);
        });
        existing.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); run(); } });
        if (button) button.addEventListener('click', run);
      }
    } else {
      wire(makeSearchUI(panel));
    }
    return true;
  }

  function boot() {
    if (init()) return;
    const mo = new MutationObserver(() => { if (init()) mo.disconnect(); });
    mo.observe(document.documentElement, {childList:true, subtree:true});
    setTimeout(() => mo.disconnect(), 15000);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, {once:true});
  else boot();
})();
