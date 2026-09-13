(() => {
  if (window.__birthdayScreenRecorderV15Loaded) return;
  window.__birthdayScreenRecorderV15Loaded = true;

  const VAULT_API = 'https://ltptnyaynwvfsutfpndu.supabase.co/functions/v1/birthday-vault';
  const VAULT_PASSWORD = 'potentiallyavault';

  let displayStream = null;
  let cameraStream = null;
  let micStream = null;
  let audioContext = null;
  let audioDestination = null;
  let recorder = null;
  let chunks = [];
  let recordingBlob = null;
  let recordingStarted = false;
  let stopping = false;

  const style = document.createElement('style');
  style.textContent = `
    #experience-recorder-controls{position:fixed;left:14px;top:50%;transform:translateY(-50%);z-index:2147483000;display:none;flex-direction:column;gap:8px;align-items:flex-start;font-family:inherit}
    #experience-recorder-controls.show{display:flex}
    .erc-btn{border:1px solid rgba(255,255,255,.18);background:rgba(18,15,14,.82);backdrop-filter:blur(12px);color:#fff;border-radius:12px;padding:9px 12px;font:700 11px/1.1 inherit;cursor:pointer;box-shadow:0 8px 25px rgba(0,0,0,.22);transition:.2s}
    .erc-btn:hover{transform:translateX(2px);border-color:rgba(217,164,65,.7)}
    .erc-btn.on{border-color:rgba(82,210,135,.8);background:rgba(30,90,55,.75)}
    .erc-status{font-size:10px;opacity:.62;max-width:170px;line-height:1.35}
    #experience-recorder-preview{display:none;position:fixed;left:14px;bottom:14px;width:190px;aspect-ratio:4/3;object-fit:cover;z-index:2147482999;border-radius:14px;border:1px solid rgba(217,164,65,.65);box-shadow:0 14px 45px rgba(0,0,0,.4);background:#111}
    #experience-recorder-preview.show{display:block}
    #experience-recorder-live{position:fixed;right:14px;top:14px;z-index:2147483000;display:none;border:1px solid rgba(255,80,80,.45);background:rgba(25,10,10,.8);color:#fff;border-radius:999px;padding:8px 11px;font:800 10px inherit;letter-spacing:.1em}
    #experience-recorder-live.show{display:block}
    #experience-recorder-modal{position:fixed;inset:0;z-index:2147483640;display:none;align-items:center;justify-content:center;padding:20px;background:rgba(7,6,6,.78);backdrop-filter:blur(12px);font-family:inherit;color:#fff}
    #experience-recorder-modal.show{display:flex}
    .erm-card{width:min(480px,94vw);background:rgba(25,20,18,.98);border:1px solid rgba(217,164,65,.34);border-radius:22px;padding:25px;box-shadow:0 30px 100px rgba(0,0,0,.5);text-align:center}
    .erm-title{font-size:22px;font-weight:800}.erm-copy{font-size:12px;line-height:1.6;opacity:.66;margin:9px 0 20px}.erm-actions{display:grid;gap:9px}.erm-btn{border:1px solid rgba(255,255,255,.13);background:rgba(255,255,255,.055);color:#fff;border-radius:12px;padding:12px 14px;cursor:pointer;font:700 12px inherit}.erm-btn.primary{border-color:rgba(217,164,65,.55);background:rgba(217,164,65,.12)}.erm-status{min-height:17px;margin-top:12px;font-size:11px;opacity:.65}
    @media(max-width:600px){#experience-recorder-controls{left:8px}.erc-btn{padding:8px 9px}.erc-status{max-width:135px}#experience-recorder-preview{left:8px;bottom:8px;width:145px}}
  `;
  document.head.appendChild(style);

  const controls = document.createElement('div');
  controls.id = 'experience-recorder-controls';
  controls.innerHTML = `
    <button class="erc-btn" id="erc-camera">📷 Camera</button>
    <button class="erc-btn" id="erc-mic">🎙️ Microphone</button>
    <div class="erc-status" id="erc-status">Recording this experience. Camera and microphone are off until you choose them.</div>
  `;
  document.body.appendChild(controls);

  const preview = document.createElement('video');
  preview.id = 'experience-recorder-preview';
  preview.autoplay = true;
  preview.muted = true;
  preview.playsInline = true;
  document.body.appendChild(preview);

  const live = document.createElement('div');
  live.id = 'experience-recorder-live';
  live.textContent = '● RECORDING';
  document.body.appendChild(live);

  const modal = document.createElement('div');
  modal.id = 'experience-recorder-modal';
  modal.innerHTML = `
    <div class="erm-card">
      <div class="erm-title">🎥 Experience recorded</div>
      <div class="erm-copy">Your recording is ready. Keep it on your device, put it in the private Birthday Vault, or share it.</div>
      <div class="erm-actions">
        <button class="erm-btn primary" id="erm-local">↓ Save locally</button>
        <button class="erm-btn" id="erm-vault">🔐 Save to Birthday Vault</button>
        <button class="erm-btn" id="erm-share">↗ Share</button>
        <button class="erm-btn" id="erm-close">Close</button>
      </div>
      <div class="erm-status" id="erm-status"></div>
    </div>`;
  document.body.appendChild(modal);

  const status = controls.querySelector('#erc-status');
  const cameraBtn = controls.querySelector('#erc-camera');
  const micBtn = controls.querySelector('#erc-mic');
  const modalStatus = modal.querySelector('#erm-status');

  function setStatus(text) { status.textContent = text; }

  function cleanupMedia() {
    [cameraStream, micStream, displayStream].forEach(s => s?.getTracks().forEach(t => t.stop()));
    cameraStream = null;
    micStream = null;
    displayStream = null;
    if (audioContext) { try { audioContext.close(); } catch (_) {} }
    audioContext = null;
    audioDestination = null;
    preview.srcObject = null;
    preview.classList.remove('show');
    cameraBtn.classList.remove('on');
    micBtn.classList.remove('on');
  }

  async function ensureAudioMix() {
    if (audioDestination) return audioDestination;
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    audioDestination = audioContext.createMediaStreamDestination();
    if (displayStream?.getAudioTracks().length) {
      audioContext.createMediaStreamSource(new MediaStream(displayStream.getAudioTracks())).connect(audioDestination);
    }
    if (micStream?.getAudioTracks().length) {
      audioContext.createMediaStreamSource(new MediaStream(micStream.getAudioTracks())).connect(audioDestination);
    }
    return audioDestination;
  }

  function recorderStream() {
    const out = new MediaStream(displayStream.getVideoTracks());
    if (audioDestination) audioDestination.stream.getAudioTracks().forEach(t => out.addTrack(t));
    else displayStream.getAudioTracks().forEach(t => out.addTrack(t));
    return out;
  }

  function openResult() {
    live.classList.remove('show');
    controls.classList.remove('show');
    modal.classList.add('show');
    modalStatus.textContent = '';
  }

  function finishRecording() {
    recordingStarted = false;
    stopping = false;
    const mime = recorder?.mimeType || 'video/webm';
    if (chunks.length) recordingBlob = new Blob(chunks, {type:mime});
    cleanupMedia();
    if (recordingBlob?.size) openResult();
    else alert('The recording did not produce a video file.');
  }

  function stopRecording() {
    if (stopping || !recordingStarted) return;
    stopping = true;
    try {
      if (recorder && recorder.state !== 'inactive') recorder.stop();
      else finishRecording();
    } catch (_) { finishRecording(); }
  }

  async function startRecording() {
    if (recordingStarted) return;
    try {
      // Browser permission is required. In the picker, choose "This Tab" so the
      // birthday experience itself is what gets recorded.
      displayStream = await navigator.mediaDevices.getDisplayMedia({video:true, audio:true});
      chunks = [];
      recordingBlob = null;
      let options = {};
      if (MediaRecorder.isTypeSupported('video/webm;codecs=vp9,opus')) options = {mimeType:'video/webm;codecs=vp9,opus'};
      else if (MediaRecorder.isTypeSupported('video/webm;codecs=vp8,opus')) options = {mimeType:'video/webm;codecs=vp8,opus'};
      recorder = new MediaRecorder(recorderStream(), options);
      recorder.ondataavailable = e => { if (e.data?.size) chunks.push(e.data); };
      recorder.onerror = () => stopRecording();
      recorder.onstop = finishRecording;
      const videoTrack = displayStream.getVideoTracks()[0];
      videoTrack?.addEventListener('ended', stopRecording, {once:true});
      recorder.start(1000);
      recordingStarted = true;
      live.classList.add('show');
      controls.classList.add('show');
      setStatus('Recording. Camera and microphone are off until you choose them.');
    } catch (_) {
      setStatus('Screen recording was cancelled.');
    }
  }

  cameraBtn.onclick = async () => {
    if (!recordingStarted || cameraStream) return;
    try {
      cameraStream = await navigator.mediaDevices.getUserMedia({video:true, audio:false});
      preview.srcObject = cameraStream;
      preview.classList.add('show');
      cameraBtn.classList.add('on');
      setStatus('Camera on. The preview is included in the tab recording.');
    } catch (_) {
      setStatus('Camera permission was not granted.');
    }
  };

  micBtn.onclick = async () => {
    if (!recordingStarted || micStream) return;
    try {
      micStream = await navigator.mediaDevices.getUserMedia({video:false, audio:true});
      await ensureAudioMix();
      const oldRecorder = recorder;
      const wasRecording = oldRecorder && oldRecorder.state === 'recording';
      if (wasRecording) {
        oldRecorder.onstop = () => {
          recorder = new MediaRecorder(recorderStream(), oldRecorder.mimeType ? {mimeType:oldRecorder.mimeType} : {});
          recorder.ondataavailable = e => { if (e.data?.size) chunks.push(e.data); };
          recorder.onstop = finishRecording;
          recorder.start(1000);
        };
        oldRecorder.stop();
      }
      micBtn.classList.add('on');
      setStatus('Microphone on. Audio is now included in the recording.');
    } catch (_) {
      setStatus('Microphone permission was not granted.');
    }
  };

  function downloadLocal() {
    if (!recordingBlob) return;
    const url = URL.createObjectURL(recordingBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `birthday-experience-${new Date().toISOString().slice(0,10)}.webm`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    modalStatus.textContent = 'Saved locally ✓';
  }

  async function saveVault() {
    if (!recordingBlob) return;
    try {
      modalStatus.textContent = 'Saving to Birthday Vault…';
      const file = new File([recordingBlob], `screen-recordings/${new Date().toISOString().slice(0,10)}_experience-recording.webm`, {type:recordingBlob.type || 'video/webm'});
      const form = new FormData();
      form.append('password', VAULT_PASSWORD);
      form.append('action', 'upload');
      form.append('file', file);
      const res = await fetch(VAULT_API, {method:'POST', body:form});
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Vault upload failed');
      modalStatus.textContent = 'Saved to Birthday Vault ✓';
    } catch (e) {
      modalStatus.textContent = e.message || 'Could not save to the Birthday Vault.';
    }
  }

  async function shareRecording() {
    if (!recordingBlob) return;
    try {
      const file = new File([recordingBlob], `birthday-experience-${new Date().toISOString().slice(0,10)}.webm`, {type:recordingBlob.type || 'video/webm'});
      if (navigator.share && (!navigator.canShare || navigator.canShare({files:[file]}))) {
        await navigator.share({title:'Birthday experience', text:'A recording of the birthday experience.', files:[file]});
        modalStatus.textContent = 'Shared ✓';
      } else {
        modalStatus.textContent = 'File sharing is not supported in this browser. Save locally instead.';
      }
    } catch (e) {
      if (e?.name !== 'AbortError') modalStatus.textContent = 'Share was not completed.';
    }
  }

  modal.querySelector('#erm-local').onclick = downloadLocal;
  modal.querySelector('#erm-vault').onclick = saveVault;
  modal.querySelector('#erm-share').onclick = shareRecording;
  modal.querySelector('#erm-close').onclick = () => modal.classList.remove('show');

  document.addEventListener('click', e => {
    const el = e.target?.closest?.('button,[role="button"],a');
    if (!el || el.closest('#experience-recorder-controls') || el.closest('#experience-recorder-modal')) return;
    const text = String(el.innerText || el.textContent || '').trim();
    if (/^ahead\s*[→↗]?$/i.test(text)) startRecording();
  }, true);

  // The experience's final Replay/Watch Again control marks the end of the
  // recording. Stop first so the result dialog appears before replay navigation.
  document.addEventListener('click', e => {
    const el = e.target?.closest?.('button,[role="button"],a');
    if (!el || !recordingStarted) return;
    const text = String(el.innerText || el.textContent || '').replace(/\s+/g,' ').trim();
    if (/^(replay|watch again|watch it again)$/i.test(text)) {
      e.preventDefault();
      e.stopImmediatePropagation();
      stopRecording();
    }
  }, true);

  window.addEventListener('keydown', e => {
    if (e.key === 'Escape' && recordingStarted) stopRecording();
  });
})();
