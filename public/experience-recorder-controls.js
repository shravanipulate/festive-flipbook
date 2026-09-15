(() => {
  if (window.__birthdayRecorderControlsV2) return;
  window.__birthdayRecorderControlsV2 = true;

  // Kill the legacy MP3 audio immediately if an old cached/base element still exists.
  const removeLegacyBgmAudio = () => {
    document.querySelectorAll('audio').forEach(audio => {
      const src = audio.currentSrc || audio.src || audio.querySelector('source')?.src || '';
      if (/screen-capture.*cut_1sec.*\.mp3/i.test(src)) {
        try { audio.pause(); } catch (_) {}
        audio.removeAttribute('src');
        audio.load();
        audio.remove();
      }
    });
  };

  const boot = () => {
    removeLegacyBgmAudio();
    if (document.getElementById('birthday-recorder-controls-button')) return true;

    const candidates = [...document.querySelectorAll('button,a,[role="button"],input[type="button"],input[type="submit"]')];
    const bgm = candidates.find(el => /^(?:🎵\s*)?BGM\s*(?:OFF|ON)$/i.test((el.textContent || el.value || '').replace(/\s+/g, ' ').trim()));
    if (!bgm) return false;

    // Replace ONLY the old BGM OFF/ON control, in its exact DOM position.
    const replacement = document.createElement('button');
    replacement.id = 'birthday-recorder-controls-button';
    replacement.type = 'button';
    replacement.textContent = '⚙ Controls ▾';
    replacement.className = bgm.className || '';
    replacement.style.cssText = bgm.style.cssText || '';
    replacement.setAttribute('aria-label', 'Recording controls');
    replacement.title = 'Recording controls';

    const panel = document.createElement('div');
    panel.id = 'birthday-recorder-controls-panel';
    panel.innerHTML = `
      <button type="button" id="br-video-toggle">📹 Video OFF</button>
      <button type="button" id="br-audio-toggle">🎙️ Audio OFF</button>`;
    panel.style.cssText = 'display:none;position:fixed;z-index:2147483000;min-width:170px;padding:8px;border-radius:14px;background:rgba(18,15,14,.97);border:1px solid rgba(255,255,255,.16);box-shadow:0 15px 45px rgba(0,0,0,.35);backdrop-filter:blur(12px);';
    panel.querySelectorAll('button').forEach(b => {
      b.style.cssText = 'display:block;width:100%;margin:3px 0;border:1px solid rgba(255,255,255,.12);background:rgba(255,255,255,.06);color:#fff;border-radius:9px;padding:8px 10px;cursor:pointer;font:700 11px inherit;text-align:left;';
    });

    bgm.replaceWith(replacement);
    document.body.appendChild(panel);

    const positionPanel = () => {
      const r = replacement.getBoundingClientRect();
      const width = 180;
      panel.style.left = `${Math.max(8, Math.min(window.innerWidth - width - 8, r.left))}px`;
      panel.style.top = `${Math.max(8, Math.min(window.innerHeight - 95, r.bottom + 6))}px`;
    };

    replacement.addEventListener('click', e => {
      e.preventDefault();
      e.stopPropagation();
      const opening = panel.style.display === 'none';
      if (opening) positionPanel();
      panel.style.display = opening ? 'block' : 'none';
    });

    window.addEventListener('resize', () => {
      if (panel.style.display !== 'none') positionPanel();
    }, { passive: true });

    panel.querySelector('#br-video-toggle').addEventListener('click', e => {
      e.preventDefault();
      e.stopPropagation();
      const recorderButton = document.querySelector('#erc-camera');
      if (!recorderButton) return;
      recorderButton.click();
      e.currentTarget.textContent = /ON$/i.test(recorderButton.textContent || '') ? '📹 Video ON' : '📹 Video OFF';
    });

    panel.querySelector('#br-audio-toggle').addEventListener('click', e => {
      e.preventDefault();
      e.stopPropagation();
      const recorderButton = document.querySelector('#erc-mic');
      if (!recorderButton) return;
      recorderButton.click();
      e.currentTarget.textContent = /ON$/i.test(recorderButton.textContent || '') ? '🎙️ Audio ON' : '🎙️ Audio OFF';
    });

    // Keep the dropdown labels synchronized with the recorder's real state.
    const sync = () => {
      const camera = document.querySelector('#erc-camera');
      const mic = document.querySelector('#erc-mic');
      const videoToggle = panel.querySelector('#br-video-toggle');
      const audioToggle = panel.querySelector('#br-audio-toggle');
      if (camera && videoToggle) videoToggle.textContent = /ON$/i.test(camera.textContent || '') ? '📹 Video ON' : '📹 Video OFF';
      if (mic && audioToggle) audioToggle.textContent = /ON$/i.test(mic.textContent || '') ? '🎙️ Audio ON' : '🎙️ Audio OFF';
    };
    const observer = new MutationObserver(sync);
    observer.observe(document.body, { subtree: true, childList: true, characterData: true });
    sync();

    return true;
  };

  if (!boot()) {
    const observer = new MutationObserver(() => {
      if (boot()) observer.disconnect();
    });
    observer.observe(document.documentElement, { childList: true, subtree: true });
    setTimeout(() => observer.disconnect(), 15000);
  }
})();
