(() => {
  if (window.__birthdayRecorderControlsV4) return;
  window.__birthdayRecorderControlsV4 = true;

  const BGM_OFF_RE = /^(?:🎵\s*)?BGM\s*(?:OFF|ON)$/i;
  const BGM_RE = /^(?:🎵\s*)?BGM$/i;

  const cleanLegacyBgmAudio = () => {
    document.querySelectorAll('audio').forEach(audio => {
      const src = `${audio.currentSrc || audio.src || audio.querySelector('source')?.src || ''}`.toLowerCase();
      const meta = `${audio.id || ''} ${audio.className || ''} ${audio.getAttribute('aria-label') || ''}`.toLowerCase();
      if (/screen-capture.*cut_1sec.*\.mp3|bgm|background.?music/.test(`${src} ${meta}`)) {
        try { audio.pause(); } catch (_) {}
        try { audio.removeAttribute('src'); audio.load(); } catch (_) {}
        audio.remove();
      }
    });
  };

  const text = el => String(el?.textContent || el?.value || '').replace(/\s+/g, ' ').trim();
  const buttons = () => [...document.querySelectorAll('button,a,[role="button"],input[type="button"],input[type="submit"]')];

  function install() {
    cleanLegacyBgmAudio();

    let replacement = document.getElementById('birthday-recorder-controls-button');
    let panel = document.getElementById('birthday-recorder-controls-panel');
    const candidates = buttons();
    const oldOff = candidates.find(el => BGM_OFF_RE.test(text(el)));
    const oldBgm = candidates.find(el => BGM_RE.test(text(el)));

    // Replace the highlighted BGM OFF/ON control in its exact DOM position.
    if (!replacement && oldOff) {
      replacement = document.createElement('button');
      replacement.id = 'birthday-recorder-controls-button';
      replacement.type = 'button';
      replacement.textContent = '⚙ Controls ▾';
      replacement.className = oldOff.className || '';
      replacement.style.cssText = oldOff.style.cssText || '';
      replacement.setAttribute('aria-label', 'Recording controls');
      replacement.title = 'Recording controls';
      oldOff.replaceWith(replacement);
    }

    // Remove the old BGM button too: there is no BGM audio left to control.
    if (oldBgm && oldBgm !== replacement) oldBgm.remove();

    if (!replacement) return false;

    if (!panel) {
      panel = document.createElement('div');
      panel.id = 'birthday-recorder-controls-panel';
      panel.innerHTML = `
        <button type="button" id="br-video-toggle">📹 Video OFF</button>
        <button type="button" id="br-audio-toggle">🎙️ Audio OFF</button>`;
      panel.style.cssText = 'display:none;position:fixed;z-index:2147483000;min-width:170px;padding:8px;border-radius:14px;background:rgba(18,15,14,.97);border:1px solid rgba(255,255,255,.16);box-shadow:0 15px 45px rgba(0,0,0,.35);backdrop-filter:blur(12px);';
      panel.querySelectorAll('button').forEach(b => b.style.cssText = 'display:block;width:100%;margin:3px 0;border:1px solid rgba(255,255,255,.12);background:rgba(255,255,255,.06);color:#fff;border-radius:9px;padding:8px 10px;cursor:pointer;font:700 11px inherit;text-align:left;');
      document.body.appendChild(panel);

      const position = () => {
        const r = replacement.getBoundingClientRect();
        panel.style.left = `${Math.max(8, Math.min(window.innerWidth - 188, r.left))}px`;
        panel.style.top = `${Math.max(8, Math.min(window.innerHeight - 105, r.bottom + 6))}px`;
      };
      const sync = () => {
        const camera = document.querySelector('#erc-camera');
        const mic = document.querySelector('#erc-mic');
        const video = panel.querySelector('#br-video-toggle');
        const audio = panel.querySelector('#br-audio-toggle');
        if (video) video.textContent = /ON$/i.test(camera?.textContent || '') ? '📹 Video ON' : '📹 Video OFF';
        if (audio) audio.textContent = /ON$/i.test(mic?.textContent || '') ? '🎙️ Audio ON' : '🎙️ Audio OFF';
      };
      replacement.addEventListener('click', e => {
        e.preventDefault(); e.stopPropagation();
        const open = panel.style.display === 'none';
        if (open) { position(); sync(); }
        panel.style.display = open ? 'block' : 'none';
      });
      panel.querySelector('#br-video-toggle').addEventListener('click', e => {
        e.preventDefault(); e.stopPropagation();
        document.querySelector('#erc-camera')?.click();
        setTimeout(sync, 0);
      });
      panel.querySelector('#br-audio-toggle').addEventListener('click', e => {
        e.preventDefault(); e.stopPropagation();
        document.querySelector('#erc-mic')?.click();
        setTimeout(sync, 0);
      });
      window.addEventListener('resize', () => { if (panel.style.display !== 'none') position(); }, {passive:true});
    }

    // Keep old controls gone if the original experience recreates them.
    buttons().forEach(el => {
      if (el === replacement) return;
      if (BGM_OFF_RE.test(text(el)) || BGM_RE.test(text(el))) el.remove();
    });
    return true;
  }

  install();
  const observer = new MutationObserver(install);
  observer.observe(document.documentElement, {childList:true, subtree:true});
  setTimeout(() => observer.disconnect(), 15000);
})();
