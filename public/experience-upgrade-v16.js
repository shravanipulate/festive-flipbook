(() => {
  if (window.__birthdayScreenRecorderV17Loaded) return;
  window.__birthdayScreenRecorderV17Loaded = true;

  const VAULT_API='https://ltptnyaynwvfsutfpndu.supabase.co/functions/v1/birthday-vault';
  const VAULT_PASSWORD='potentiallyavault';
  let displayStream=null,cameraStream=null,micStream=null,micSource=null,displayAudioSource=null,audioContext=null,audioDestination=null,recorder=null,chunks=[],recordingBlob=null,recordingStarted=false,stopping=false,continueAfterStart=null,bypassNextOnce=false;
  let keyboardNavigationAt=0;
  let recordingSessionStarted=false;

  const style=document.createElement('style');style.textContent=`
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
    #experience-recorder-result{position:fixed;right:14px;bottom:14px;z-index:2147482998;display:none;width:min(430px,calc(100vw - 28px));padding:12px;background:rgba(25,20,18,.96);border:1px solid rgba(217,164,65,.34);border-radius:18px;box-shadow:0 22px 80px rgba(0,0,0,.45);backdrop-filter:blur(12px);color:#fff;font-family:inherit}
    #experience-recorder-result.show{display:block;animation:ercResultIn .35s ease both}
    @keyframes ercResultIn{from{opacity:0;transform:translateY(12px) scale(.98)}to{opacity:1;transform:none}}
    #experience-recorder-result video{display:block;width:100%;max-height:240px;object-fit:contain;background:#050505;border-radius:11px}
    .err-actions{display:flex;gap:7px;flex-wrap:wrap;margin-top:9px}
    .err-btn{border:1px solid rgba(255,255,255,.13);background:rgba(255,255,255,.055);color:#fff;border-radius:10px;padding:9px 11px;cursor:pointer;font:700 10px inherit}
    .err-btn.primary{border-color:rgba(217,164,65,.55);background:rgba(217,164,65,.12)}
    .err-status{min-height:15px;margin-top:7px;font-size:10px;opacity:.68}
    .err-note{font-size:9px;opacity:.48;margin-top:7px;line-height:1.4}
    @media(max-width:600px){#experience-recorder-controls{left:8px}.erc-btn{padding:8px 9px}.erc-status{max-width:145px}#experience-recorder-preview{left:8px;bottom:8px;width:145px}#experience-recorder-result{right:8px;bottom:8px}}
  `;document.head.appendChild(style);

  const controls=document.createElement('div');controls.id='experience-recorder-controls';controls.innerHTML='<button class="erc-btn" id="erc-camera" type="button">📷 Camera</button><button class="erc-btn" id="erc-mic" type="button">🎙️ Microphone</button><div class="erc-status" id="erc-status">Screen recording is on. Camera and microphone stay OFF until you turn them on.</div>';document.body.appendChild(controls);
  const preview=document.createElement('video');preview.id='experience-recorder-preview';preview.autoplay=true;preview.muted=true;preview.playsInline=true;document.body.appendChild(preview);
  const live=document.createElement('div');live.id='experience-recorder-live';live.textContent='● RECORDING';document.body.appendChild(live);
  const result=document.createElement('div');result.id='experience-recorder-result';result.innerHTML='<video id="err-player" controls playsinline muted></video><div class="err-actions"><button class="err-btn primary" id="err-local" type="button">↓ Save locally</button><button class="err-btn" id="err-vault" type="button">🔐 Save to Birthday Vault</button><button class="err-btn" id="err-share" type="button">↗ Share</button><button class="err-btn" id="err-close" type="button">× Close</button></div><div class="err-status" id="err-status"></div><div class="err-note">Playback starts muted. Unmute with the native player control if you want the captured audio.</div>';document.body.appendChild(result);

  const status=controls.querySelector('#erc-status'),cameraBtn=controls.querySelector('#erc-camera'),micBtn=controls.querySelector('#erc-mic'),player=result.querySelector('#err-player'),resultStatus=result.querySelector('#err-status');
  let resultUrl=null;
  function setStatus(t){status.textContent=t}
  function chooseMime(){const c=['video/webm;codecs=vp9,opus','video/webm;codecs=vp8,opus','video/webm'];return c.find(x=>window.MediaRecorder&&MediaRecorder.isTypeSupported(x))||''}
  function cleanupMedia(){[cameraStream,micStream,displayStream].forEach(s=>s?.getTracks().forEach(t=>t.stop()));cameraStream=null;micStream=null;displayStream=null;micSource=null;displayAudioSource=null;if(audioContext){try{audioContext.close()}catch(_){}}audioContext=null;audioDestination=null;preview.srcObject=null;preview.classList.remove('show');cameraBtn.classList.remove('on');micBtn.classList.remove('on')}
  async function setupAudioMix(){audioContext=new (window.AudioContext||window.webkitAudioContext)();audioDestination=audioContext.createMediaStreamDestination();try{await audioContext.resume()}catch(_){}if(displayStream?.getAudioTracks().length){displayAudioSource=audioContext.createMediaStreamSource(new MediaStream(displayStream.getAudioTracks()));displayAudioSource.connect(audioDestination)}}
  function recorderStream(){const out=new MediaStream();displayStream.getVideoTracks().forEach(t=>out.addTrack(t));audioDestination?.stream.getAudioTracks().forEach(t=>out.addTrack(t));return out}
  function openResult(){live.classList.remove('show');controls.classList.remove('show');if(resultUrl)URL.revokeObjectURL(resultUrl);resultUrl=recordingBlob?URL.createObjectURL(recordingBlob):null;if(resultUrl){player.src=resultUrl;player.muted=true;player.currentTime=0;result.classList.add('show');setTimeout(()=>{player.play().catch(()=>{});},80)}}
  function finishRecording(){recordingStarted=false;stopping=false;const mime=recorder?.mimeType||'video/webm';if(chunks.length)recordingBlob=new Blob(chunks,{type:mime});cleanupMedia();if(recordingBlob?.size)openResult();else setStatus('Recording ended, but no video data was produced.');if(continueAfterStart){const el=continueAfterStart;continueAfterStart=null;bypassNextOnce=true;try{el.click()}catch(_){}}}
  function stopRecording(){if(stopping||!recordingStarted)return;stopping=true;recordingSessionStarted=false;try{if(recorder&&recorder.state!=='inactive')recorder.stop();else finishRecording()}catch(_){finishRecording()}}

  async function startRecording(nextEl){
    // One screen-capture session per experience. Page navigation must never call
    // getDisplayMedia again after the initial capture has been granted.
    if(recordingStarted||recordingSessionStarted)return true;
    if(!navigator.mediaDevices?.getDisplayMedia){alert('Screen recording is not supported in this browser.');return false}
    recordingSessionStarted=true;
    try{
      displayStream=await navigator.mediaDevices.getDisplayMedia({video:true,audio:true});
      if(!displayStream?.getVideoTracks().length)throw new Error('No screen video track was returned.');
      chunks=[];recordingBlob=null;
      await setupAudioMix();
      const mime=chooseMime();
      recorder=new MediaRecorder(recorderStream(),mime?{mimeType:mime}:undefined);
      recorder.ondataavailable=e=>{if(e.data?.size)chunks.push(e.data)};
      recorder.onerror=()=>stopRecording();
      recorder.onstop=finishRecording;
      const videoTrack=displayStream.getVideoTracks()[0];
      videoTrack.addEventListener('ended',stopRecording,{once:true});
      recorder.start(1000);recordingStarted=true;
      live.classList.add('show');controls.classList.add('show');
      setStatus('Recording this tab. Camera and microphone are OFF.');
      if(nextEl){bypassNextOnce=true;nextEl.click()}
      return true;
    }catch(e){
      recordingSessionStarted=false;
      const name=e?.name||'Error',msg=e?.message||'';
      setStatus(name==='NotAllowedError'?'Screen sharing was cancelled or blocked.':`Recording failed: ${name}${msg?' — '+msg:''}`);
      return false;
    }
  }

  cameraBtn.onclick=async()=>{
    if(!recordingStarted)return;
    if(cameraStream){cameraStream.getTracks().forEach(t=>t.stop());cameraStream=null;preview.srcObject=null;preview.classList.remove('show');cameraBtn.classList.remove('on');setStatus(micStream?'Microphone on. Camera off.':'Recording this tab. Camera and microphone are OFF.');return}
    try{
      cameraStream=await navigator.mediaDevices.getUserMedia({video:true,audio:false});
      preview.srcObject=cameraStream;preview.classList.add('show');cameraBtn.classList.add('on');setStatus('Camera on. Its preview is visible inside the recorded tab.');
    }catch(e){setStatus(`Camera permission failed: ${e?.name||'Error'}`)}
  };

  micBtn.onclick=async()=>{
    if(!recordingStarted||!audioContext||!audioDestination)return;
    if(micStream){micStream.getTracks().forEach(t=>t.stop());micStream=null;if(micSource){try{micSource.disconnect()}catch(_){}micSource=null}micBtn.classList.remove('on');setStatus(cameraStream?'Camera on. Microphone off.':'Recording this tab. Camera and microphone are OFF.');return}
    try{
      micStream=await navigator.mediaDevices.getUserMedia({video:false,audio:true});
      micSource=audioContext.createMediaStreamSource(micStream);micSource.connect(audioDestination);try{await audioContext.resume()}catch(_){}
      micBtn.classList.add('on');setStatus(cameraStream?'Camera + microphone on.':'Microphone on.');
    }catch(e){setStatus(`Microphone permission failed: ${e?.name||'Error'}`)}
  };

  function downloadLocal(){
    if(!recordingBlob)return;
    const url=URL.createObjectURL(recordingBlob),a=document.createElement('a');a.href=url;a.download=`birthday-experience-${new Date().toISOString().slice(0,10)}.webm`;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);resultStatus.textContent='Saved locally ✓';
  }
  async function saveVault(){
    if(!recordingBlob)return;
    if(!window.confirm('Save this to Birthday Vault?'))return;
    try{
      resultStatus.textContent='Saving to Birthday Vault…';
      const file=new File([recordingBlob],`${new Date().toISOString().slice(0,10)}_experience-recording.webm`,{type:recordingBlob.type||'video/webm'}),form=new FormData();form.append('password',VAULT_PASSWORD);form.append('action','upload');form.append('file',file);
      const res=await fetch(VAULT_API,{method:'POST',body:form}),data=await res.json().catch(()=>({}));
      if(!res.ok)throw new Error(data.error||'Vault upload failed');
      resultStatus.textContent='Saved to Birthday Vault ✓';
    }catch(e){resultStatus.textContent=e?.message||'Could not save to Birthday Vault.'}
  }
  async function shareRecording(){
    if(!recordingBlob)return;
    try{
      const file=new File([recordingBlob],`birthday-experience-${new Date().toISOString().slice(0,10)}.webm`,{type:recordingBlob.type||'video/webm'});
      if(navigator.share&&(!navigator.canShare||navigator.canShare({files:[file]})){await navigator.share({title:'Birthday experience',text:'A recording of the birthday experience.',files:[file]});resultStatus.textContent='Shared ✓'}else resultStatus.textContent='This browser does not support file sharing. Save locally or use Birthday Vault.';
    }catch(e){if(e?.name!=='AbortError')resultStatus.textContent='Share was not completed.'}
  }
  result.querySelector('#err-local').onclick=downloadLocal;result.querySelector('#err-vault').onclick=saveVault;result.querySelector('#err-share').onclick=shareRecording;result.querySelector('#err-close').onclick=()=>{result.classList.remove('show');player.pause();player.removeAttribute('src');if(resultUrl){URL.revokeObjectURL(resultUrl);resultUrl=null}};

  function isNextControl(el){if(!el||el.closest('#experience-recorder-controls')||el.closest('#experience-recorder-result'))return false;if(el.id==='navNext')return true;const text=String(el.innerText||el.textContent||el.value||'').replace(/\s+/g,' ').trim();return /^(ahead|next|continue)\s*[→↗›»]?$/.test(text)}
  function isReplayControl(el){if(!el)return false;const text=String(el.innerText||el.textContent||el.value||'').replace(/\s+/g,' ').trim();return /^(replay|watch again|watch it again)$/i.test(text)}

  document.addEventListener('keydown',e=>{if(e.key==='ArrowRight'||e.key==='ArrowLeft'||e.key==='Enter')keyboardNavigationAt=Date.now();if(e.key==='Escape'&&recordingStarted)stopRecording()},true);
  document.addEventListener('click',e=>{
    const el=e.target?.closest?.('button,a,[role="button"],input[type="button"],input[type="submit"]');if(!el)return;
    if(bypassNextOnce&&isNextControl(el)){bypassNextOnce=false;return}
    if(isReplayControl(el)&&recordingStarted){e.preventDefault();e.stopImmediatePropagation();stopRecording();return}
    if(!recordingStarted&&!recordingSessionStarted&&isNextControl(el)){
      if(e.detail===0||Date.now()-keyboardNavigationAt<350)return;
      e.preventDefault();e.stopImmediatePropagation();startRecording(el);
    }
  },true);
  document.addEventListener('click',e=>{
    if(!recordingStarted)return;
    const el=e.target?.closest?.('#navNext');if(!el)return;
    const slides=[...document.querySelectorAll('#app .slide, .slide')],active=slides.findIndex(s=>s.classList.contains('active'));
    if(active>=0&&active===slides.length-1){e.preventDefault();e.stopImmediatePropagation();stopRecording()}
  },true);
})();