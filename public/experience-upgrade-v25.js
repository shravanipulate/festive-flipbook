(() => {
  if (window.__birthdayRecorderShieldV25Loaded) return;
  window.__birthdayRecorderShieldV25Loaded = true;

  const media = navigator.mediaDevices;
  const nativeGetDisplayMedia = media?.getDisplayMedia?.bind(media);
  let grantedStream = null;
  let allowCaptureStop = false;
  let bypassNavigation = false;

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
        };
        track.addEventListener('ended', () => { grantedStream = null; }, {once:true});
      }
      window.__birthdayDisplayCaptureGranted = true;
      return stream;
    };
  }

  // v16 must never get a chance to start a second capture session after the
  // first permission has been granted. Re-fire navigation exactly once.
  document.addEventListener('click', e => {
    const el = e.target?.closest?.('button,a,[role="button"],input[type="button"],input[type="submit"]');
    if (!el || el.closest('#experience-recorder-controls') || el.closest('#experience-recorder-result')) return;
    const text = String(el.innerText || el.textContent || el.value || '').replace(/\s+/g,' ').trim();
    if (!/^(ahead|next|continue)\s*[→↗›»]?$/.test(text)) return;
    if (!window.__birthdayDisplayCaptureGranted || bypassNavigation) {
      if (bypassNavigation) bypassNavigation = false;
      return;
    }
    e.preventDefault();
    e.stopImmediatePropagation();
    bypassNavigation = true;
    try { el.click(); } catch (_) { bypassNavigation = false; }
  }, true);

  // Compact earlier-style mouse control.
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
