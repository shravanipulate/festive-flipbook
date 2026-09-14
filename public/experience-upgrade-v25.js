(() => {
  if (window.__birthdayRecorderShieldV25Loaded) return;
  window.__birthdayRecorderShieldV25Loaded = true;

  // The recorder must ask for tab capture only once. Keep the original display
  // stream alive so a stray/repeated Next click can never trigger another prompt.
  const media = navigator.mediaDevices;
  const nativeGetDisplayMedia = media?.getDisplayMedia?.bind(media);
  let grantedStream = null;
  let allowCaptureStop = false;

  if (nativeGetDisplayMedia) {
    media.getDisplayMedia = async function(options) {
      if (grantedStream) {
        const track = grantedStream.getVideoTracks()[0];
        if (track && track.readyState === 'live') return grantedStream;
        grantedStream = null;
      }
      const stream = await nativeGetDisplayMedia(options);
      grantedStream = stream;
      const track = stream.getVideoTracks()[0];
      if (track) {
        const realStop = track.stop.bind(track);
        track.stop = function() {
          if (allowCaptureStop) {
            grantedStream = null;
            return realStop();
          }
          // v16's cleanup must not kill the captured tab between slides.
        };
        track.addEventListener('ended', () => { grantedStream = null; }, {once:true});
      }
      return stream;
    };
  }

  // If v16 ever loses its recorder state while navigating, don't let its
  // capture-phase handler call getDisplayMedia again. Navigation itself still works.
  document.addEventListener('click', e => {
    const el = e.target?.closest?.('button,a,[role="button"],input[type="button"],input[type="submit"]');
    if (!el || el.closest('#experience-recorder-controls') || el.closest('#experience-recorder-result')) return;
    const text = String(el.innerText || el.textContent || el.value || '').replace(/\s+/g,' ').trim();
    if (!/^(ahead|next|continue)\s*[→↗›»]?$/.test(text)) return;
    if (!window.__birthdayDisplayCaptureGranted) return;
    if (window.__birthdayRecorderPromptShield) {
      e.preventDefault();
      e.stopImmediatePropagation();
      try { el.click(); } catch (_) {}
    }
  }, true);

  if (nativeGetDisplayMedia) {
    const original = media.getDisplayMedia;
    media.getDisplayMedia = async function(options) {
      const stream = await original(options);
      window.__birthdayDisplayCaptureGranted = true;
      window.__birthdayRecorderPromptShield = true;
      return stream;
    };
  }

  // Mouse-scroll control — the compact earlier-style interface.
  const style = document.createElement('style');
  style.textContent = `
    #birthday-scroll-toggle{position:fixed;left:14px;bottom:14px;z-index:2147483003;border:1px solid rgba(255,255,255,.18);background:rgba(18,15,14,.82);backdrop-filter:blur(12px);color:#fff;border-radius:999px;padding:9px 12px;font:700 11px/1 system-ui,sans-serif;cursor:pointer;box-shadow:0 8px 25px rgba(0,0,0,.22)}
    #birthday-scroll-toggle:hover{transform:translateY(-1px);border-color:rgba(217,164,65,.7)}
    #birthday-scroll-toggle.off{opacity:.62}
    @media(max-width:600px){#birthday-scroll-toggle{left:8px;bottom:8px;padding:8px 10px}}
  `;
  document.head.appendChild(style);
  const btn = document.createElement('button');
  btn.id = 'birthday-scroll-toggle';
  btn.type = 'button';
  document.body.appendChild(btn);
  let scrollOn = sessionStorage.getItem('birthday-scroll-enabled') !== '0';
  function render(){ btn.textContent = scrollOn ? '🐁 Scroll ON' : '🐁 Scroll OFF'; btn.classList.toggle('off', !scrollOn); }
  btn.onclick = e => { e.preventDefault(); e.stopPropagation(); scrollOn = !scrollOn; sessionStorage.setItem('birthday-scroll-enabled', scrollOn ? '1' : '0'); render(); };
  document.addEventListener('wheel', e => { if(!scrollOn){ e.preventDefault(); e.stopImmediatePropagation(); } }, {capture:true,passive:false});
  render();
})();
