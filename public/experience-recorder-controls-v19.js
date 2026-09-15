(() => {
  'use strict';
  if (window.__birthdayRecorderControlsV19Loaded) return;
  window.__birthdayRecorderControlsV19Loaded = true;

  // Remove the old BGM on/off control. The existing BGM player/search remains untouched.
  const removeBgmOff = (root = document) => {
    root.querySelectorAll?.('button,[role="button"],input[type="button"],input[type="submit"],label').forEach(el => {
      const text = String(el.innerText || el.textContent || el.value || '').replace(/\s+/g, ' ').trim();
      if (/^BGM\s+OFF$/i.test(text)) el.remove();
    });
  };
  removeBgmOff();
  const observer = new MutationObserver(mutations => {
    for (const m of mutations) {
      m.addedNodes.forEach(node => {
        if (node.nodeType === 1) {
          const text = String(node.textContent || '').replace(/\s+/g, ' ').trim();
          if (/^BGM\s+OFF$/i.test(text) && node.matches?.('button,[role="button"],input,label')) node.remove();
          else removeBgmOff(node);
        }
      });
    }
  });
  observer.observe(document.body, { childList: true, subtree: true });

  const style = document.createElement('style');
  style.textContent = `
    #experience-recorder-entry{position:fixed;left:14px;top:calc(50% - 42px);z-index:2147483001;display:none;border:1px solid rgba(255,255,255,.18);background:rgba(18,15,14,.88);backdrop-filter:blur(12px);color:#fff;border-radius:12px;padding:9px 12px;font:700 11px/1.1 inherit;cursor:pointer;box-shadow:0 8px 25px rgba(0,0,0,.22)}
    #experience-recorder-entry.show{display:block}
    #experience-recorder-controls .erc-row{display:flex;gap:6px;align-items:center}
    @media(max-width:600px){#experience-recorder-entry{left:8px}}
  `;
  document.head.appendChild(style);

  const entry = document.createElement('button');
  entry.id = 'experience-recorder-entry';
  entry.type = 'button';
  entry.textContent = '⚙ Controls';
  document.body.appendChild(entry);

  const patch = () => {
    const controls = document.getElementById('experience-recorder-controls');
    const camera = document.getElementById('erc-camera');
    const mic = document.getElementById('erc-mic');
    const hide = document.getElementById('erc-hide');
    if (!controls || !camera || !mic) return false;

    // Make the recorder options explicit: both are OFF until the user clicks them.
    camera.textContent = /ON$/i.test(camera.textContent || '') ? '📹 Video ON' : '📹 Video OFF';
    mic.textContent = /ON$/i.test(mic.textContent || '') ? '🎙️ Audio ON' : '🎙️ Audio OFF';
    camera.title = 'Optional camera video — OFF by default';
    mic.title = 'Optional microphone audio — OFF by default';

    entry.onclick = () => {
      if (controls.classList.contains('show')) {
        controls.classList.remove('show');
        entry.classList.add('show');
      } else {
        controls.classList.add('show');
        entry.classList.remove('show');
      }
    };

    if (hide && !hide.dataset.v19Patched) {
      hide.dataset.v19Patched = '1';
      hide.textContent = '↙ Hide controls';
      const oldHide = hide.onclick;
      hide.onclick = e => {
        oldHide?.call(hide, e);
        entry.classList.add('show');
      };
    }

    const sync = () => {
      const active = document.getElementById('experience-recorder-live')?.classList.contains('show');
      const panelOpen = controls.classList.contains('show');
      entry.classList.toggle('show', !!active && !panelOpen);
      if (active && !camera.dataset.v19Labels) camera.dataset.v19Labels = '1';
    };
    new MutationObserver(sync).observe(controls, { attributes: true, attributeFilter: ['class'] });
    sync();
    return true;
  };

  const wait = setInterval(() => {
    if (patch()) clearInterval(wait);
  }, 250);
  setTimeout(() => clearInterval(wait), 15000);
})();
