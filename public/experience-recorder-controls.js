(() => {
  if (window.__birthdayRecorderControlsV1) return;
  window.__birthdayRecorderControlsV1 = true;

  const boot = () => {
    if (document.getElementById('birthday-recorder-controls-button')) return true;

    const candidates = [...document.querySelectorAll('button,a,[role="button"],input[type="button"],input[type="submit"]')];
    const bgm = candidates.find(el => /^(?:🎵\s*)?BGM\s*(?:OFF|ON)$/i.test((el.textContent || el.value || '').replace(/\s+/g, ' ').trim()));
    if (!bgm) return false;

    // Remove only the old BGM OFF/ON control. Do not touch the existing BGM feature/panel.
    const replacement = document.createElement('button');
    replacement.id = 'birthday-recorder-controls-button';
    replacement.type = 'button';
    replacement.textContent = '⚙ Controls';
    replacement.className = bgm.className || '';
    replacement.style.cssText = bgm.style.cssText || '';
    replacement.setAttribute('aria-label', 'Recording controls');
    replacement.title = 'Recording controls';

    const panel = document.createElement('div');
    panel.id = 'birthday-recorder-controls-panel';
    panel.innerHTML = `
      <button type="button" id="br-video-toggle">📹 Video OFF</button>
      <button type="button" id="br-audio-toggle">🎙️ Audio OFF</button>
      <button type="button" id="br-controls-close">× Close</button>`;
    panel.style.cssText = 'display:none;position:absolute;z-index:2147483000;min-width:155px;padding:8px;border-radius:14px;background:rgba(18,15,14,.96);border:1px solid rgba(255,255,255,.16);box-shadow:0 15px 45px rgba(0,0,0,.35);backdrop-filter:blur(12px);';
    panel.querySelectorAll('button').forEach(b => b.style.cssText = 'display:block;width:100%;margin:3px 0;border:1px solid rgba(255,255,255,.12);background:rgba(255,255,255,.06);color:#fff;border-radius:9px;padding:8px 10px;cursor:pointer;font:700 11px inherit;text-align:left;');

    bgm.replaceWith(replacement);
    document.body.appendChild(panel);

    replacement.addEventListener('click', e => {
      e.preventDefault(); e.stopPropagation();
      const r = replacement.getBoundingClientRect();
      panel.style.left = `${Math.max(8, Math.min(window.innerWidth - 175, r.left))}px`;
      panel.style.top = `${Math.min(window.innerHeight - 145, r.bottom + 6)}px`;
      panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
    });
    panel.querySelector('#br-controls-close').addEventListener('click', () => panel.style.display = 'none');

    // These toggles are intentionally UI-only here; the recorder's own camera/mic controls remain authoritative.
    panel.querySelector('#br-video-toggle').addEventListener('click', () => {
      const b = panel.querySelector('#br-video-toggle');
      b.textContent = b.textContent.includes('OFF') ? '📹 Video ON' : '📹 Video OFF';
      document.querySelector('#erc-camera')?.click();
    });
    panel.querySelector('#br-audio-toggle').addEventListener('click', () => {
      const b = panel.querySelector('#br-audio-toggle');
      b.textContent = b.textContent.includes('OFF') ? '🎙️ Audio ON' : '🎙️ Audio OFF';
      document.querySelector('#erc-mic')?.click();
    });

    return true;
  };

  if (!boot()) {
    const observer = new MutationObserver(() => { if (boot()) observer.disconnect(); });
    observer.observe(document.documentElement, {childList:true, subtree:true});
    setTimeout(() => observer.disconnect(), 15000);
  }
})();
