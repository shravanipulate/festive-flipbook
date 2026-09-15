(() => {
  if (window.__birthdayScreenRecorderV18Loaded) return;
  window.__birthdayScreenRecorderV18Loaded = true;

  const VAULT_API = 'https://ltptnyaynwvfsutfpndu.supabase.co/functions/v1/birthday-vault';
  const VAULT_PASSWORD = 'potentiallyavault';
  let displayStream=null,cameraStream=null,micStream=null,micSource=null,audioContext=null,audioDestination=null,recorder=null,chunks=[],recordingBlob=null,recordingStarted=false,stopping=false,resultUrl=null,lastStartAttempt=0;

  const style=document.createElement('style');style.textContent=`
    #experience-recorder-controls{position:fixed;left:14px;top:50%;transform:translateY(-50%);z-index:2147483000;display:none;flex-direction:column;gap:7px;align-items:flex-start;font-family:inherit}
    #experience-recorder-controls.show{display:flex}
    .erc-row{display:flex;gap:6px;align-items:center}
    .erc-btn{border:1px solid rgba(255,255,255,.18);background:rgba(18,15,14,.84);backdrop-filter:blur(12px);color:#fff;border-radius:12px;padding:9px 12px;font:700 11px/1.1 inherit;cursor:pointer;box-shadow:0 8px 25px rgba(0,0,0,.22);transition:.2s}
    .erc-btn:hover{transform:translateX(2px);border-color:rgba(217,164,65,.7)}
    .erc-btn.on{border-color:rgba(82,210,135,.8);background:rgba(30,90,55,.75)}
    .erc-btn.hide{font-size:10px;padding:8px 10px;opacity:.8}
    .erc-status{font-size:10px;opacity:.68;max-width:185px;line-height:1.4}
    #experience-recorder-preview{display:none;position:fixed;right:14px;bottom:14px;width:190px;aspect-ratio:4/3;object-fit:cover;z-index:2147482999;border-radius:14px;border:1px solid rgba(217,164,65,.65);box-shadow:0 14px 45px rgba(0,0,0,.4);background:#111}
    #experience-recorder-preview.show{display:block}
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
    @media(max-width:600px){#experience-recorder-controls{left:8px}.erc-btn{padding:8px 9px}.erc-status{max-width:150px}#experience-recorder-preview{right:8px;bottom:8px;width:145px}#experience-recorder-result{right:8px;bottom:8px}}
  `;document.head.appendChild(style);

  const controls=document.createElement('div');controls.id='experience-recorder-controls';controls.innerHTML=`
    <div class="erc-row"><button class="erc-btn" id="erc-camera" type="button">📷 Camera OFF</button><button class="erc-btn" id="erc-mic" type="button">🎙️ Mic OFF</button></div>
    <button class="erc-btn hide" id="erc-hide" type="button">↙ Hide controls</button>
    <div class="erc-status" id="erc-status">Screen recording is on. Camera and microphone stay OFF until you turn them on.</div>`;document.body.appendChild(controls);

  const preview=document.createElement('video');preview.id='experience-recorder-preview';preview.autoplay=true;preview.muted=true;preview.playsInline=true;document.body.appendChild(preview);
  const live=document.createElement('div');live.id='experience-recorder-live';live.textContent='● RECORDING';document.body.appendChild(live);
  const result=document.createElement('div');result.id='experience-recorder-result';result.innerHTML='<video id="err-player" controls playsinline></video><div class="err-actions"><button class="err-btn primary" id="err-local" type="button">↓ Save locally</button><button class="err-btn" id="err-vault" type="button">🔐 Save to Birthday Vault</button><button class="err-btn" id="err-share" type="button">↗ Share</button><button class="err-btn" id="err-close" type="button">× Close</button></div><div class="err-status" id="err-status"></div><div class="err-note">The recording captures the selected screen/tab and its available tab audio. Camera and microphone are optional and only activate when you click them. Site media is not auto-started.</div>';document.body.appendChild(result);

  const status=controls.querySelector('#erc-status'),cameraBtn=controls.querySelector('#erc-camera'),micBtn=controls.querySelector('#erc-mic'),hideBtn=controls.querySelector('#erc-hide'),player=result.querySelector('#err-player'),resultStatus=result.querySelector('#err-status');
  function setStatus(t){status.textContent=t}
  function today(){return new Date().toISOString().slice(0,10)}
  function chooseMime(){const types=['video/webm;codecs=vp9,opus','video/webm;codecs=vp8,opus','video/webm'];return types.find(t=>window.MediaRecorder?.isTypeSupported(t))||''}

  function cleanupMedia(){[cameraStream,micStream,displayStream].forEach(s=>s?.getTracks().forEach(t=>t.stop()));if(micSource){try{micSource.disconnect()}catch(_){}}if(audioContext){try{audioContext.close()}catch(_){}}cameraStream=null;micStream=null;displayStream=null;micSource=null;audioContext=null;audioDestination=null;preview.srcObject=null;preview.classList.remove('show');cameraBtn.classList.remove('on');micBtn.classList.remove('on');cameraBtn.textContent='📷 Camera OFF';micBtn.textContent='🎙️ Mic OFF'}

  function openResult(){live.classList.remove('show');controls.classList.remove('show');if(resultUrl)URL.revokeObjectURL(resultUrl);resultUrl=recordingBlob?URL.createObjectURL(recordingBlob):null;if(!resultUrl)return;player.src=resultUrl;player.currentTime=0;result.classList.add('show')}
  function finishRecording(){const mime=recorder?.mimeType||'video/webm';if(chunks.length)recordingBlob=new Blob(chunks,{type:mime});recordingStarted=false;stopping=false;cleanupMedia();if(recordingBlob?.size)openResult();else setStatus('Recording ended, but no video data was produced.')}
  function stopRecording(){if(stopping||!recordingStarted)return;stopping=true;try{if(recorder&&recorder.state!=='inactive')recorder.stop();else finishRecording()}catch(_){finishRecording()}}

  async function setupAudioMix(){audioContext=new(window.AudioContext||window.webkitAudioContext)();audioDestination=audioContext.createMediaStreamDestination();try{await audioContext.resume()}catch(_){}if(displayStream?.getAudioTracks().length){const source=audioContext.createMediaStreamSource(new MediaStream(displayStream.getAudioTracks()));source.connect(audioDestination)}}
  function recorderStream(){const out=new MediaStream();displayStream?.getVideoTracks().forEach(t=>out.addTrack(t));audioDestination?.stream.getAudioTracks().forEach(t=>out.addTrack(t));return out}

  async function startRecording(){if(recordingStarted)return;const now=Date.now();if(now-lastStartAttempt<1200)return;lastStartAttempt=now;if(!navigator.mediaDevices?.getDisplayMedia||!window.MediaRecorder){setStatus('This browser does not support screen recording.');return}try{
    displayStream=await navigator.mediaDevices.getDisplayMedia({video:{frameRate:{ideal:30,max:30}},audio:true,preferCurrentTab:true,selfBrowserSurface:'include',surfaceSwitching:'include'});
    const videoTrack=displayStream.getVideoTracks()[0];if(!videoTrack)throw new Error('No screen track returned.');
    chunks=[];recordingBlob=null;await setupAudioMix();const mimeType=chooseMime();recorder=mimeType?new MediaRecorder(recorderStream(),{mimeType}):new MediaRecorder(recorderStream());recorder.ondataavailable=e=>{if(e.data?.size)chunks.push(e.data)};recorder.onerror=()=>stopRecording();recorder.onstop=finishRecording;videoTrack.addEventListener('ended',stopRecording,{once:true});recorder.start(1000);recordingStarted=true;live.classList.add('show');controls.classList.add('show');setStatus('Recording screen/tab. Camera and microphone are OFF until clicked.');
  }catch(error){cleanupMedia();setStatus(error?.name==='NotAllowedError'?'Screen capture was cancelled or blocked. Click Ahead again and choose This Tab.':`Screen recording could not start: ${error?.message||'unknown error'}`)}}

  cameraBtn.onclick=async()=>{if(!recordingStarted)return;if(cameraStream){cameraStream.getTracks().forEach(t=>t.stop());cameraStream=null;preview.srcObject=null;preview.classList.remove('show');cameraBtn.classList.remove('on');cameraBtn.textContent='📷 Camera OFF';setStatus(micStream?'Microphone ON. Camera OFF.':'Recording screen/tab. Camera and microphone are OFF.');return}try{cameraStream=await navigator.mediaDevices.getUserMedia({video:true,audio:false});preview.srcObject=cameraStream;preview.classList.add('show');cameraBtn.classList.add('on');cameraBtn.textContent='📷 Camera ON';setStatus('Camera ON. Its preview is inside the recorded tab, like before.')}catch(e){setStatus(`Camera permission failed: ${e?.name||'Error'}`)}};

  micBtn.onclick=async()=>{if(!recordingStarted||!audioContext||!audioDestination)return;if(micStream){micStream.getTracks().forEach(t=>t.stop());micStream=null;if(micSource){try{micSource.disconnect()}catch(_){}}micSource=null;micBtn.classList.remove('on');micBtn.textContent='🎙️ Mic OFF';setStatus(cameraStream?'Camera ON. Microphone OFF.':'Recording screen/tab. Camera and microphone are OFF.');return}try{micStream=await navigator.mediaDevices.getUserMedia({video:false,audio:true});micSource=audioContext.createMediaStreamSource(micStream);micSource.connect(audioDestination);micBtn.classList.add('on');micBtn.textContent='🎙️ Mic ON';setStatus(cameraStream?'Camera + microphone ON.':'Microphone ON.')}catch(e){setStatus(`Microphone permission failed: ${e?.name||'Error'}`)}};

  hideBtn.onclick=()=>{controls.classList.remove('show');hideBtn.dataset.hidden='1';let reveal=document.getElementById('erc-reveal');if(!reveal){reveal=document.createElement('button');reveal.id='erc-reveal';reveal.type='button';reveal.textContent='🎥 Recorder controls';Object.assign(reveal.style,{position:'fixed',left:'14px',top:'50%',transform:'translateY(-50%)',zIndex:'2147483000',display:'none',border:'1px solid rgba(255,255,255,.18)',background:'rgba(18,15,14,.84)',color:'#fff',borderRadius:'12px',padding:'9px 12px',font:'700 11px inherit',cursor:'pointer'});document.body.appendChild(reveal);reveal.onclick=()=>{controls.classList.add('show');reveal.style.display='none'}}reveal.style.display=recordingStarted?'block':'none'};

  result.querySelector('#err-local').onclick=()=>{if(!recordingBlob)return;const url=URL.createObjectURL(recordingBlob),a=document.createElement('a');a.href=url;a.download=`birthday-experience-${today()}.webm`;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);resultStatus.textContent='Saved locally ✓'};
  result.querySelector('#err-vault').onclick=async()=>{if(!recordingBlob||!window.confirm('Save this to Birthday Vault?'))return;try{resultStatus.textContent='Saving to Birthday Vault…';const file=new File([recordingBlob],`${today()}_experience-recording.webm`,{type:recordingBlob.type||'video/webm'}),form=new FormData();form.append('password',VAULT_PASSWORD);form.append('action','upload');form.append('file',file);const response=await fetch(VAULT_API,{method:'POST',body:form}),data=await response.json().catch(()=>({}));if(!response.ok)throw new Error(data.error||'Vault upload failed');resultStatus.textContent='Saved to Birthday Vault ✓'}catch(e){resultStatus.textContent=e?.message||'Could not save to Birthday Vault.'}};
  result.querySelector('#err-share').onclick=async()=>{if(!recordingBlob)return;try{const file=new File([recordingBlob],`birthday-experience-${today()}.webm`,{type:recordingBlob.type||'video/webm'});if(navigator.share&&(!navigator.canShare||navigator.canShare({files:[file]}))){await navigator.share({title:'Birthday experience',text:'A recording of the birthday experience.',files:[file]});resultStatus.textContent='Shared ✓'}else resultStatus.textContent='File sharing is not supported in this browser. Save locally instead.'}catch(e){if(e?.name!=='AbortError')resultStatus.textContent='Share was not completed.'}};
  result.querySelector('#err-close').onclick=()=>{result.classList.remove('show');player.pause();player.removeAttribute('src');if(resultUrl){URL.revokeObjectURL(resultUrl);resultUrl=null}};

  function isAhead(el){if(!el||el.closest?.('#experience-recorder-controls')||el.closest?.('#experience-recorder-result')||el.id==='erc-reveal')return false;const text=String(el.innerText||el.textContent||el.value||'').replace(/\s+/g,' ').trim();return /^ahead(?:\s*[→↗➜])?$/i.test(text)}
  function isReplay(el){if(!el)return false;const text=String(el.innerText||el.textContent||el.value||'').replace(/\s+/g,' ').trim();return /^(replay|watch again|watch it again)$/i.test(text)}
  document.addEventListener('click',event=>{const el=event.target?.closest?.('button,a,[role="button"],input[type="button"],input[type="submit"]');if(!el)return;if(!recordingStarted&&isAhead(el)){event.preventDefault();event.stopImmediatePropagation();startRecording().then(()=>{if(recordingStarted)el.click()});return}if(recordingStarted&&(isReplay(el)||el.id==='navNext')){const slides=[...document.querySelectorAll('#app .slide,.slide')],active=slides.findIndex(s=>s.classList.contains('active'));if(isReplay(el)||(active>=0&&active===slides.length-1)){event.preventDefault();event.stopImmediatePropagation();stopRecording()}}},true);
})();