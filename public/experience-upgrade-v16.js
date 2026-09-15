(() => {
  if (window.__birthdayScreenRecorderV17Loaded) return;
  window.__birthdayScreenRecorderV17Loaded = true;

  const VAULT_API = 'https://ltptnyaynwvfsutfpndu.supabase.co/functions/v1/birthday-vault';
  const VAULT_PASSWORD = 'potentiallyavault';
  let displayStream = null;
  let recorder = null;
  let chunks = [];
  let recordingBlob = null;
  let recordingStarted = false;
  let stopping = false;
  let resultUrl = null;
  let lastStartAttempt = 0;

  const style = document.createElement('style');
  style.textContent = `
    #experience-recorder-controls{position:fixed;left:14px;top:50%;transform:translateY(-50%);z-index:2147483000;display:none;flex-direction:column;gap:8px;align-items:flex-start;font-family:inherit}
    #experience-recorder-controls.show{display:flex}
    .erc-status{font-size:10px;opacity:.68;max-width:185px;line-height:1.4}
    #experience-recorder-live{position:fixed;right:14px;top:14px;z-index:2147483000;display:none;border:1px solid rgba(255,80,80,.45);background:rgba(25,10,10,.82);color:#fff;border-radius:999px;padding:8px 11px;font:800 10px inherit;letter-spacing:.1em}
    #experience-recorder-live.show{display:block}
    #experience-recorder-result{position:fixed;right:14px;bottom:14px;z-index:2147482998;display:none;width:min(430px,calc(100vw - 28px));padding:12px;background:rgba(25,20,18,.96);border:1px solid rgba(217,164,65,.34);border-radius:18px;box-shadow:0 22px 80px rgba(0,0,0,.45);backdrop-filter:blur(12px);color:#fff;font-family:inherit}
    #experience-recorder-result.show{display:block}
    #experience-recorder-result video{display:block;width:100%;max-height:240px;object-fit:contain;background:#050505;border-radius:11px}
    .err-actions{display:flex;gap:7px;flex-wrap:wrap;margin-top:9px}
    .err-btn{border:1px solid rgba(255,255,255,.13);background:rgba(255,255,255,.055);color:#fff;border-radius:10px;padding:9px 11px;cursor:pointer;font:700 10px inherit}
    .err-btn.primary{border-color:rgba(217,164,65,.55);background:rgba(217,164,65,.12)}
    .err-status{min-height:15px;margin-top:7px;font-size:10px;opacity:.68}
    .err-note{font-size:9px;opacity:.48;margin-top:7px;line-height:1.4}
    @media(max-width:600px){#experience-recorder-controls{left:8px}.erc-status{max-width:150px}#experience-recorder-result{right:8px;bottom:8px}}
  `;
  document.head.appendChild(style);

  const controls = document.createElement('div');
  controls.id = 'experience-recorder-controls';
  controls.innerHTML = '<div class="erc-status" id="erc-status">Screen recording starts when you click Ahead. Choose This Tab in the browser picker.</div>';
  document.body.appendChild(controls);

  const live = document.createElement('div');
  live.id = 'experience-recorder-live';
  live.textContent = '● RECORDING';
  document.body.appendChild(live);

  const result = document.createElement('div');
  result.id = 'experience-recorder-result';
  result.innerHTML = '<video id="err-player" controls playsinline></video><div class="err-actions"><button class="err-btn primary" id="err-local" type="button">↓ Save locally</button><button class="err-btn" id="err-vault" type="button">🔐 Save to Birthday Vault</button><button class="err-btn" id="err-share" type="button">↗ Share</button><button class="err-btn" id="err-close" type="button">× Close</button></div><div class="err-status" id="err-status"></div><div class="err-note">The recording contains screen video only. The experience’s own audio/video is left untouched and plays only when the site itself starts it.</div>';
  document.body.appendChild(result);

  const status = controls.querySelector('#erc-status');
  const player = result.querySelector('#err-player');
  const resultStatus = result.querySelector('#err-status');

  function setStatus(text) { status.textContent = text; }
  function today() { return new Date().toISOString().slice(0, 10); }
  function chooseMime() {
    const types = ['video/webm;codecs=vp9','video/webm;codecs=vp8','video/webm'];
    return types.find(type => window.MediaRecorder?.isTypeSupported(type)) || '';
  }

  function cleanupMedia() {
    displayStream?.getTracks().forEach(track => track.stop());
    displayStream = null;
  }

  function openResult() {
    live.classList.remove('show');
    controls.classList.remove('show');
    if (resultUrl) URL.revokeObjectURL(resultUrl);
    resultUrl = recordingBlob ? URL.createObjectURL(recordingBlob) : null;
    if (!resultUrl) return;
    player.src = resultUrl;
    player.currentTime = 0;
    result.classList.add('show');
    // Do not autoplay the recorded video. The user controls playback.
  }

  function finishRecording() {
    const mime = recorder?.mimeType || 'video/webm';
    if (chunks.length) recordingBlob = new Blob(chunks, { type: mime });
    recordingStarted = false;
    stopping = false;
    cleanupMedia();
    if (recordingBlob?.size) openResult();
    else setStatus('Recording ended, but no video data was produced.');
  }

  function stopRecording() {
    if (stopping || !recordingStarted) return;
    stopping = true;
    try {
      if (recorder && recorder.state !== 'inactive') recorder.stop();
      else finishRecording();
    } catch (_) {
      finishRecording();
    }
  }

  async function startRecording() {
    if (recordingStarted) return;
    const now = Date.now();
    if (now - lastStartAttempt < 1200) return;
    lastStartAttempt = now;

    if (!navigator.mediaDevices?.getDisplayMedia || !window.MediaRecorder) {
      setStatus('This browser does not support screen recording.');
      return;
    }

    try {
      // SCREEN VIDEO ONLY. No microphone, camera, tab/system audio, or audio mixer.
      displayStream = await navigator.mediaDevices.getDisplayMedia({
        video: { frameRate: { ideal: 30, max: 30 } },
        audio: false,
        preferCurrentTab: true,
        selfBrowserSurface: 'include',
        surfaceSwitching: 'include'
      });

      const videoTrack = displayStream.getVideoTracks()[0];
      if (!videoTrack) throw new Error('No screen track returned.');

      const mimeType = chooseMime();
      recorder = mimeType ? new MediaRecorder(new MediaStream([videoTrack]), { mimeType }) : new MediaRecorder(new MediaStream([videoTrack]));
      chunks = [];
      recordingBlob = null;
      recorder.ondataavailable = event => { if (event.data?.size) chunks.push(event.data); };
      recorder.onerror = () => stopRecording();
      recorder.onstop = finishRecording;
      videoTrack.addEventListener('ended', stopRecording, { once: true });
      recorder.start(1000);
      recordingStarted = true;
      live.classList.add('show');
      controls.classList.add('show');
      setStatus('Recording screen only. Site audio/video is not captured or changed.');
    } catch (error) {
      cleanupMedia();
      setStatus(error?.name === 'NotAllowedError' ? 'Screen capture was cancelled or blocked. Click Ahead again and choose This Tab.' : `Screen recording could not start: ${error?.message || 'unknown error'}`);
    }
  }

  function isAhead(el) {
    if (!el || el.closest?.('#experience-recorder-controls') || el.closest?.('#experience-recorder-result')) return false;
    const text = String(el.innerText || el.textContent || el.value || '').replace(/\s+/g, ' ').trim();
    return /^ahead(?:\s*[→↗➜])?$/i.test(text);
  }

  function isReplay(el) {
    if (!el) return false;
    const text = String(el.innerText || el.textContent || el.value || '').replace(/\s+/g, ' ').trim();
    return /^(replay|watch again|watch it again)$/i.test(text);
  }

  // One lightweight delegated listener instead of repeatedly scanning the entire DOM.
  document.addEventListener('click', event => {
    const el = event.target?.closest?.('button,a,[role="button"],input[type="button"],input[type="submit"]');
    if (!el) return;
    if (!recordingStarted && isAhead(el)) {
      event.preventDefault();
      event.stopImmediatePropagation();
      startRecording().then(() => {
        if (recordingStarted) el.click();
      });
      return;
    }
    if (recordingStarted && (isReplay(el) || el.id === 'navNext')) {
      const slides = [...document.querySelectorAll('#app .slide, .slide')];
      const active = slides.findIndex(slide => slide.classList.contains('active'));
      if (isReplay(el) || (active >= 0 && active === slides.length - 1)) {
        event.preventDefault();
        event.stopImmediatePropagation();
        stopRecording();
      }
    }
  }, true);

  result.querySelector('#err-local').onclick = () => {
    if (!recordingBlob) return;
    const url = URL.createObjectURL(recordingBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `birthday-experience-${today()}.webm`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    resultStatus.textContent = 'Saved locally ✓';
  };

  result.querySelector('#err-vault').onclick = async () => {
    if (!recordingBlob) return;
    if (!window.confirm('Save this to Birthday Vault?')) return;
    try {
      resultStatus.textContent = 'Saving to Birthday Vault…';
      const file = new File([recordingBlob], `${today()}_experience-recording.webm`, { type: recordingBlob.type || 'video/webm' });
      const form = new FormData();
      form.append('password', VAULT_PASSWORD);
      form.append('action', 'upload');
      form.append('file', file);
      const response = await fetch(VAULT_API, { method: 'POST', body: form });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || 'Vault upload failed');
      resultStatus.textContent = 'Saved to Birthday Vault ✓';
    } catch (error) {
      resultStatus.textContent = error?.message || 'Could not save to Birthday Vault.';
    }
  };

  result.querySelector('#err-share').onclick = async () => {
    if (!recordingBlob) return;
    try {
      const file = new File([recordingBlob], `birthday-experience-${today()}.webm`, { type: recordingBlob.type || 'video/webm' });
      if (navigator.share && (!navigator.canShare || navigator.canShare({ files: [file] }))) {
        await navigator.share({ title: 'Birthday experience', text: 'A recording of the birthday experience.', files: [file] });
        resultStatus.textContent = 'Shared ✓';
      } else {
        resultStatus.textContent = 'File sharing is not supported in this browser. Save locally instead.';
      }
    } catch (error) {
      if (error?.name !== 'AbortError') resultStatus.textContent = 'Share was not completed.';
    }
  };

  result.querySelector('#err-close').onclick = () => {
    result.classList.remove('show');
    player.pause();
    player.removeAttribute('src');
    if (resultUrl) {
      URL.revokeObjectURL(resultUrl);
      resultUrl = null;
    }
  };
})();