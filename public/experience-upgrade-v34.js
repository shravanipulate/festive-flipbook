(() => {
  'use strict';
  if (window.__birthdayYouTubeStylishV34) return;
  window.__birthdayYouTubeStylishV34 = true;

  const STYLE_ID = 'birthday-youtube-stylish-v34-style';
  const BOX_ID = 'birthday-youtube-stylish-v34-box';

  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  function installCSS() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      #${BOX_ID} {
        margin-top: 12px;
        padding: 12px;
        border-radius: 16px;
        background: linear-gradient(135deg, rgba(127,127,127,.10), rgba(127,127,127,.04));
        border: 1px solid rgba(127,127,127,.18);
        box-shadow: 0 8px 24px rgba(0,0,0,.06);
      }
      #${BOX_ID} .yt-v34-heading {
        display:flex;
        align-items:center;
        justify-content:space-between;
        gap:8px;
        margin-bottom:9px;
      }
      #${BOX_ID} .yt-v34-title {
        font-size:12px;
        font-weight:900;
        letter-spacing:.35px;
      }
      #${BOX_ID} .yt-v34-subtitle {
        font-size:9px;
        opacity:.55;
      }
      #${BOX_ID} .yt-v34-search {
        display:flex;
        gap:7px;
        align-items:center;
        padding:5px;
        border:1px solid rgba(127,127,127,.22);
        border-radius:12px;
        background:var(--card,#fff);
        transition:border-color .18s ease, box-shadow .18s ease, transform .18s ease;
      }
      #${BOX_ID} .yt-v34-search:focus-within {
        border-color:currentColor;
        box-shadow:0 0 0 3px rgba(127,127,127,.10);
        transform:translateY(-1px);
      }
      #${BOX_ID} #ytSearchInput {
        flex:1;
        min-width:0;
        border:0;
        outline:0;
        background:transparent;
        color:inherit;
        padding:8px 8px;
        font:inherit;
        font-size:12px;
      }
      #${BOX_ID} #ytSearchInput::placeholder { opacity:.48; }
      #${BOX_ID} #ytSearchBtn {
        border:0;
        border-radius:9px;
        padding:8px 11px;
        cursor:pointer;
        font-size:10px;
        font-weight:900;
        letter-spacing:.35px;
        background:currentColor;
        color:var(--bg,#fff);
        transition:transform .15s ease, opacity .15s ease;
      }
      #${BOX_ID} #ytSearchBtn:hover { transform:scale(1.03); }
      #${BOX_ID} #ytSearchBtn:active { transform:scale(.97); }
      #${BOX_ID} .yt-v34-hint {
        margin-top:7px;
        font-size:9px;
        opacity:.48;
      }
      #${BOX_ID} #ytSearchStatus {
        font-size:10px;
        opacity:.68;
        margin-top:8px;
        min-height:14px;
      }
      #${BOX_ID} #ytResults {
        display:flex;
        flex-direction:column;
        gap:7px;
        margin-top:8px;
        max-height:245px;
        overflow-y:auto;
        scrollbar-width:thin;
      }
      #${BOX_ID} .yt-result {
        display:flex;
        align-items:center;
        gap:9px;
        padding:7px;
        border-radius:11px;
        cursor:pointer;
        border:1px solid rgba(127,127,127,.14);
        background:rgba(127,127,127,.035);
        transition:transform .16s ease, background .16s ease, border-color .16s ease;
      }
      #${BOX_ID} .yt-result:hover {
        transform:translateY(-1px);
        background:rgba(127,127,127,.09);
        border-color:rgba(127,127,127,.25);
      }
      #${BOX_ID} .yt-result img {
        width:64px;
        height:38px;
        object-fit:cover;
        border-radius:7px;
        flex-shrink:0;
        background:rgba(127,127,127,.1);
      }
      #${BOX_ID} .yt-result-info { min-width:0; }
      #${BOX_ID} .yt-result-title {
        font-size:11px;
        font-weight:800;
        line-height:1.3;
        display:-webkit-box;
        -webkit-line-clamp:2;
        -webkit-box-orient:vertical;
        overflow:hidden;
      }
      #${BOX_ID} .yt-result-channel {
        font-size:9px;
        opacity:.58;
        margin-top:3px;
        white-space:nowrap;
        overflow:hidden;
        text-overflow:ellipsis;
      }
      #${BOX_ID} #ytPlayerWrap {
        display:none;
        margin-top:10px;
        border-radius:12px;
        overflow:hidden;
        aspect-ratio:16/9;
        background:#000;
      }
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
        <div class="yt-v34-heading">
          <div class="yt-v34-title">🎧 Search YouTube</div>
          <div class="yt-v34-subtitle">find a song instantly</div>
        </div>
        <div class="yt-v34-search">
          <input id="ytSearchInput" type="text" placeholder="Search any song..." autocomplete="off" />
          <button id="ytSearchBtn" type="button">SEARCH</button>
        </div>
        <div class="yt-v34-hint">Try a song, artist, remix, soundtrack, or vibe.</div>
        <div id="ytSearchStatus"></div>
        <div id="ytResults"></div>
        <div id="ytPlayerWrap"><div id="ytPlayer"></div></div>
      `;

      const track1 = panel.querySelector('#bgmTrack1Btn');
      if (track1 && track1.parentElement === panel) {
        panel.insertBefore(box, track1.nextSibling);
      } else {
        panel.appendChild(box);
      }
    }

    const input = box.querySelector('#ytSearchInput');
    const button = box.querySelector('#ytSearchBtn');
    if (button && button.dataset.v34Wired !== '1') {
      button.dataset.v34Wired = '1';
      button.addEventListener('click', () => {
        if (typeof window.searchYouTubeBgm === 'function') window.searchYouTubeBgm();
      });
    }
    if (input && input.dataset.v34Wired !== '1') {
      input.dataset.v34Wired = '1';
      input.addEventListener('keydown', event => {
        if (event.key === 'Enter') {
          event.preventDefault();
          if (typeof window.searchYouTubeBgm === 'function') window.searchYouTubeBgm();
        }
      });
    }
    return true;
  }

  function boot() {
    installCSS();
    installUI();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot, { once:true });
  } else {
    boot();
  }

  const observer = new MutationObserver(() => {
    if (document.getElementById('bgmPanel')) boot();
  });
  observer.observe(document.documentElement, { childList:true, subtree:true });
})();
