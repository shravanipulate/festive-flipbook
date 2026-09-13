(() => {
  if (window.__birthdayScreenRecorderV16Loaded) return;
  window.__birthdayScreenRecorderV16Loaded = true;

  const VAULT_API = 'https://ltptnyaynwvfsutfpndu.supabase.co/functions/v1/birthday-vault';
  const VAULT_PASSWORD = 'potentiallyavault';

  let displayStream = null;
  let cameraStream = null;
  let micStream = null;
  let micSource = null;
  let displayAudioSource = null;
  let audioContext = null;
  let audioDestination = null;
  let recorder = null;
  let chunks = [];
  let recordingBlob = null;
  let recordingStarted = false;
  let stopping = false;
  let continueAfterStart = null;
  let bypassNextOnce = false;

  const style = document.createElement('style');
  style.textContent = `
    #experience-recorder-controls{position:fixed;left:14px;top:50%;transform:translateY(-50%);z-index:2147483000;display:none;flex-direction:column;gap:8px;align-items:flex-start;font-family:inherit}
    #experience-recorder-controls.show{display:flex}
    .erc-btn{border:1px solid rgba(255,255,255,.18);background:rgba(18,15,14,.82);backdrop-filter:blur(12px);color:#fff;border-radius:12px;padding:9px 12px;font:700 11px/1.1 inherit;cursor:pointer;box-shadow:0 8px 25px rgba(0,0,0,.22);transition:.2s}
    .erc-btn:hover{transform:translateX(2px);border-color:rgba(217,164,65,.7)}
    .erc-btn.on{border-color:rgba(82,210,135,.8);background:rgba(30,90,55,.75)}
    .erc-status{font-size:10px;opacity:.68;max-width:175px;line-height:1.4}
    #experience-recorder-preview{display:none;position:fixed;left:14px;bottom:14px;width:190px;aspect-ratio:4/3;object-fit:cover;z-index:2147482999;border-radius:14px;border:1px solid rgba(217,164,65,.65);box-shadow:0 14px 45px rgba(0,0,0,.4);background:#111}
    #experience-recorder-preview.show{display:block}
    #experience-recorder-live{position:fixed;right:14px;top:14px;z-index:2147483000;display:none;border:1px solid rgba(255,80,80,.45);background:rgba(25,10,10,.82);color:#fff;border-radius:999px;padding:8px 11px;font:800 10px inherit;letter-spacing:.1em}
    #experience-recorder-live.show{display:block}
    #experience-recorder-modal{position:fixed;inset:0;z-index:2147483640;display:none;align-items:center;justify-content:center;padding:20px;background:rgba(7,6,6,.78);backdrop-filter:blur(12px);font-family:inherit;color:#fff}
    #experience-recorder-modal.show{display:flex}
    .erm-card{width:min(480px,94vw);background:rgba(25,20,18,.98);border:1px solid rgba(217,164,65,.34);border-radius:22px;padding:25px;box-shadow:0 30px 100px rgba(0,0,0,.5);text-align:center}
    .erm-title{font-size:22px;font-weight:800}.erm-copy{font-size:12px;line-height:1.6;opacity:.66;margin:9px 0 20px}.erm-actions{display:grid;gap:9px}.erm-btn{border:1px solid rgba(255,255,255,.13);background:rgba(255,255,255,.055);color:#fff;border-radius:12px;padding:12px 14px;cursor:pointer;font:700 12px inherit}.erm-btn.primary{border-color:rgba(217,164,65,.55);background:rgba(217,164,65,.12)}.erm-status{min-height:17px;margin-top:12px;font-size:11px;opacity:.68}
    @media(max-width:600px){#experience-recorder-controls{left:8px}.erc-btn{padding:8px 9px}.erc-status{max-width:145px}#experience-recorder-preview{left:8px;bottom:8px;width:145px}}
  `;
  document.head.appendChild(style);

  const controls = document.createElement('div');
  controls.id = 'experience-recorder-controls';
  controls.innerHTML = `
    <button class="erc-btn" id="erc-camera" type="button">📷 Camera</button>
    <button class="erc-btn" id="erc-mic" type="button">🎙️ Microphone</button>
    <div class="erc-status" id="erc-status">Screen recording is on. Camera and microphone stay off until you turn them on.</div>
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
      <div class="erm-copy">The birthday experience recording is ready.</div>
      <div class="erm-actions">
        <button class="erm-btn primary" id="erm-local" type="button">↓ Save locally</button>
        <button class="erm-btn" id="erm-vault" type="button">🔐 Save to Birthday Vault</button>
        <button class="erm-btn" id="erm-share" type="button">↗ Share</button>
        <button class="erm-btn" id="erm-close" type="button">Close</button>
      </div>
      <div class="erm-status" id="erm-status"></div>
    </div>`;
  document.body.appendChild(modal);

  const status = controls.querySelector('#erc-status');
  const cameraBtn = controls.querySelector('#erc-camera');
  const micBtn = controls.querySelector('#erc-mic');
  const modalStatus = modal.querySelector('#erm-status');

  function setStatus(text){ status.textContent = text; }

  function chooseMime(){
    const candidates = [
      'video/webm;codecs=vp9,opus',
      'video/webm;codecs=vp8,opus',
      'video/webm'
    ];
    return candidates.find(x => MediaRecorder.isTypeSupported(x)) || '';
  }

  function cleanupMedia(){
    [cameraStream, micStream, displayStream].forEach(s => s?.getTracks().forEach(t => t.stop()));
    cameraStream = null;
    micStream = null;
    displayStream = null;
    micSource = null;
    displayAudioSource = null;
    if(audioContext){ try{ audioContext.close(); }catch(_){} }
    audioContext = null;
    audioDestination = null;
    preview.srcObject = null;
    preview.classList.remove('show');
    cameraBtn.classList.remove('on');
    micBtn.classList.remove('on');
  }

  async function setupAudioMix(){
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    audioDestination = audioContext.createMediaStreamDestination();
    try{ await audioContext.resume(); }catch(_){}

    if(displayStream?.getAudioTracks().length){
      displayAudioSource = audioContext.createMediaStreamSource(new MediaStream(displayStream.getAudioTracks()));
      displayAudioSource.connect(audioDestination);
    }
  }

  function recorderStream(){
    const out = new MediaStream();
    displayStream.getVideoTracks().forEach(t => out.addTrack(t));
    if(audioDestination?.stream.getAudioTracks().length){
      audioDestination.stream.getAudioTracks().forEach(t => out.addTrack(t));
    }
    return out;
  }

  function openResult(){
    live.classList.remove('show');
    controls.classList.remove('show');
    modal.classList.add('show');
    modalStatus.textContent = '';
  }

  function finishRecording(){
    recordingStarted = false;
    stopping = false;
    const mime = recorder?.mimeType || 'video/webm';
    if(chunks.length) recordingBlob = new Blob(chunks, {type:mime});
    cleanupMedia();
    if(recordingBlob?.size) openResult();
    else setStatus('Recording ended, but no video data was produced.');
    if(continueAfterStart){
      const el = continueAfterStart;
      continueAfterStart = null;
      bypassNextOnce = true;
      try{ el.click(); }catch(_){}
    }
  }

  function stopRecording(){
    if(stopping || !recordingStarted) return;
    stopping = true;
    try{
      if(recorder && recorder.state !== 'inactive') recorder.stop();
      else finishRecording();
    }catch(_){ finishRecording(); }
  }

  async function startRecording(nextEl){
    if(recordingStarted) return;
    if(!navigator.mediaDevices?.getDisplayMedia){
      alert('Screen recording is not supported in this browser.');
      return;
    }
    try{
      // Must be invoked directly from the visitor's click. The browser will show
      // its normal screen/tab picker; choose this tab to capture the experience.
      displayStream = await navigator.mediaDevices.getDisplayMedia({video:true, audio:true});
      if(!displayStream?.getVideoTracks().length) throw new Error('No screen video track was returned.');

      chunks = [];
      recordingBlob = null;
      await setupAudioMix();

      const mime = chooseMime();
      recorder = new MediaRecorder(recorderStream(), mime ? {mimeType:mime} : undefined);
      recorder.ondataavailable = e => { if(e.data?.size) chunks.push(e.data); };
      recorder.onerror = () => stopRecording();
      recorder.onstop = finishRecording;

      const videoTrack = displayStream.getVideoTracks()[0];
      videoTrack.addEventListener('ended', stopRecording, {once:true});

      recorder.start(1000);
      recordingStarted = true;
      live.classList.add('show');
      controls.classList.add('show');
      setStatus('Recording this tab. Camera and microphone are OFF.');

      // Continue the exact navigation action after capture permission succeeds.
      if(nextEl){
        bypassNextOnce = true;
        nextEl.click();
      }
      return true;
    }catch(e){
      const name = e?.name || 'Error';
      const msg = e?.message || '';
      setStatus(name === 'NotAllowedError' ? 'Screen sharing was cancelled or blocked.' : `Recording failed: ${name}${msg ? ' — ' + msg : ''}`);
      return false;
    }
  }

  cameraBtn.onclick = async () => {
    if(!recordingStarted) return;
    if(cameraStream){
      cameraStream.getTracks().forEach(t=>t.stop());
      cameraStream = null;
      preview.srcObject = null;
      preview.classList.remove('show');
      cameraBtn.classList.remove('on');
      setStatus(micStream ? 'Microphone on. Camera off.' : 'Recording this tab. Camera and microphone are OFF.');
      return;
    }
    try{
      cameraStream = await navigator.mediaDevices.getUserMedia({video:true, audio:false});
      preview.srcObject = cameraStream;
      preview.classList.add('show');
      cameraBtn.classList.add('on');
      setStatus('Camera on. Its preview is visible inside the recorded tab.');
    }catch(e){
      setStatus(`Camera permission failed: ${e?.name || 'Error'}`);
    }
  };

  micBtn.onclick = async () => {
    if(!recordingStarted || !audioContext || !audioDestination) return;
    if(micStream){
      micStream.getTracks().forEach(t=>t.stop());
      micStream = null;
      if(micSource){ try{micSource.disconnect();}catch(_){} micSource = null; }
      micBtn.classList.remove('on');
      setStatus(cameraStream ? 'Camera on. Microphone off.' : 'Recording this tab. Camera and microphone are OFF.');
      return;
    }
    try{
      micStream = await navigator.mediaDevices.getUserMedia({video:false, audio:true});
      micSource = audioContext.createMediaStreamSource(micStream);
      micSource.connect(audioDestination);
      try{ await audioContext.resume(); }catch(_){}
      micBtn.classList.add('on');
      setStatus(cameraStream ? 'Camera + microphone on.' : 'Microphone on.');
    }catch(e){
      setStatus(`Microphone permission failed: ${e?.name || 'Error'}`);
    }
  };

  function downloadLocal(){
    if(!recordingBlob) return;
    const url = URL.createObjectURL(recordingBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `birthday-experience-${new Date().toISOString().slice(0,10)}.webm`;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(()=>URL.revokeObjectURL(url),1000);
    modalStatus.textContent = 'Saved locally ✓';
  }

  async function saveVault(){
    if(!recordingBlob) return;
    try{
      modalStatus.textContent = 'Saving to Birthday Vault…';
      const file = new File([recordingBlob], `${new Date().toISOString().slice(0,10)}_experience-recording.webm`, {type:recordingBlob.type || 'video/webm'});
      const form = new FormData();
      form.append('password', VAULT_PASSWORD);
      form.append('action', 'upload');
      form.append('file', file);
      const res = await fetch(VAULT_API,{method:'POST',body:form});
      const data = await res.json().catch(()=>({}));
      if(!res.ok) throw new Error(data.error || 'Vault upload failed');
      modalStatus.textContent = 'Saved to Birthday Vault ✓';
    }catch(e){
      modalStatus.textContent = e?.message || 'Could not save to Birthday Vault.';
    }
  }

  async function shareRecording(){
    if(!recordingBlob) return;
    try{
      const file = new File([recordingBlob], `birthday-experience-${new Date().toISOString().slice(0,10)}.webm`, {type:recordingBlob.type || 'video/webm'});
      if(navigator.share && (!navigator.canShare || navigator.canShare({files:[file]}))){
        await navigator.share({title:'Birthday experience', text:'A recording of the birthday experience.', files:[file]});
        modalStatus.textContent = 'Shared ✓';
      }else{
        modalStatus.textContent = 'This browser does not support file sharing. Save locally or use Birthday Vault.';
      }
    }catch(e){
      if(e?.name !== 'AbortError') modalStatus.textContent = 'Share was not completed.';
    }
  }

  modal.querySelector('#erm-local').onclick = downloadLocal;
  modal.querySelector('#erm-vault').onclick = saveVault;
  modal.querySelector('#erm-share').onclick = shareRecording;
  modal.querySelector('#erm-close').onclick = () => modal.classList.remove('show');

  function isNextControl(el){
    if(!el || el.closest('#experience-recorder-controls') || el.closest('#experience-recorder-modal')) return false;
    if(el.id === 'navNext') return true;
    const text = String(el.innerText || el.textContent || el.value || '').replace(/\s+/g,' ').trim();
    return /^(ahead|next|continue)\s*[→↗›»]?$/.test(text);
  }

  function isReplayControl(el){
    if(!el) return false;
    const text = String(el.innerText || el.textContent || el.value || '').replace(/\s+/g,' ').trim();
    return /^(replay|watch again|watch it again)$/i.test(text);
  }

  document.addEventListener('click', e => {
    const el = e.target?.closest?.('button,a,[role="button"],input[type="button"],input[type="submit"]');
    if(!el) return;

    if(bypassNextOnce && isNextControl(el)){
      bypassNextOnce = false;
      return;
    }

    if(isReplayControl(el) && recordingStarted){
      e.preventDefault();
      e.stopImmediatePropagation();
      stopRecording();
      return;
    }

    if(!recordingStarted && isNextControl(el)){
      e.preventDefault();
      e.stopImmediatePropagation();
      startRecording(el);
    }
  }, true);

  // Also stop when the active slide is the last slide and its normal next control is used.
  document.addEventListener('click', e => {
    if(!recordingStarted) return;
    const el = e.target?.closest?.('#navNext');
    if(!el) return;
    const slides = [...document.querySelectorAll('#app .slide, .slide')];
    const active = slides.findIndex(s => s.classList.contains('active'));
    if(active >= 0 && active === slides.length - 1){
      e.preventDefault();
      e.stopImmediatePropagation();
      stopRecording();
    }
  }, true);

  window.addEventListener('keydown', e => {
    if(e.key === 'Escape' && recordingStarted) stopRecording();
  });
})();
