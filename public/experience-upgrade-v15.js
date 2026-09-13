/* Screen recording media-permission patch.
   Screen recording starts with screen video only.
   Camera and microphone are never requested automatically; they are allowed
   only when the visitor explicitly clicks a camera/microphone control.
*/
(() => {
  if (window.__birthdayUpgradeV15Loaded) return;
  window.__birthdayUpgradeV15Loaded = true;

  const md = navigator.mediaDevices;
  if (!md) return;

  const originalDisplay = md.getDisplayMedia?.bind(md);
  const originalUser = md.getUserMedia?.bind(md);
  if (!originalDisplay || !originalUser) return;

  let explicitMediaUntil = 0;

  const textOf = el => String(el?.innerText || el?.textContent || '').replace(/\s+/g, ' ').trim().toLowerCase();

  // A camera/microphone request is considered explicit only when it follows
  // an actual click on a control whose label clearly asks for that device.
  document.addEventListener('click', event => {
    const el = event.target?.closest?.('button,[role="button"],label,a');
    if (!el || el.closest('#site-voice-recorder')) return;
    const text = textOf(el);
    if (/camera|webcam|mic(?:rophone)?/.test(text)) {
      explicitMediaUntil = Date.now() + 2500;
    }
  }, true);

  // Screen share itself is always video-only. Browser's optional system-audio
  // checkbox is therefore not requested by this site's screen recorder.
  md.getDisplayMedia = function (constraints = {}) {
    const next = { ...constraints, video: constraints.video === false ? true : constraints.video, audio: false };
    return originalDisplay(next);
  };

  // Prevent a legacy screen-recorder start handler from silently asking for
  // camera/mic immediately after screen share. During an explicit camera/mic
  // click, pass the real request through normally.
  md.getUserMedia = function (constraints = {}) {
    if (Date.now() <= explicitMediaUntil) {
      explicitMediaUntil = 0;
      return originalUser(constraints);
    }

    const wantsCamera = !!constraints.video;
    const wantsMic = !!constraints.audio;
    if (!wantsCamera && !wantsMic) return originalUser(constraints);

    // Return an empty stream rather than rejecting, so legacy screen-recording
    // code can continue with the screen track without breaking its flow.
    return Promise.resolve(new MediaStream());
  };
})();
