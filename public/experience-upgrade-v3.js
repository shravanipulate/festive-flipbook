(() => {
  if (window.__birthdayUpgradeV3Loaded) return;
  window.__birthdayUpgradeV3Loaded = true;

  const API = 'https://ltptnyaynwvfsutfnpdu.supabase.co/functions/v1/birthday-vault';
  const PASSWORD = 'potentiallyavault';
  const clean = s => String(s || '').replace(/\s+/g, ' ').trim();

  // Make saved vault files genuinely viewable, while keeping Delete unavailable.
  const openSavedFile = async path => {
    try {
      const res = await fetch(API, {
        method: 'POST', headers: {'Content-Type':'application/json'},
        body: JSON.stringify({action:'share', password:PASSWORD, path})
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Could not open file');
      window.open(data.url, '_blank', 'noopener');
    } catch (e) { alert(e.message || 'Could not open file'); }
  };

  const patchVault = () => {
    const rows = document.querySelectorAll('#vault-modal .rv-file');
    rows.forEach(row => {
      if (row.querySelector('[data-action="open"]')) return;
      const name = row.querySelector('.rv-name')?.textContent?.trim();
      if (!name) return;
      const actions = row.querySelector('.rv-actions');
      if (!actions) return;
      const b = document.createElement('button');
      b.className = 'rv-btn'; b.dataset.action = 'open'; b.textContent = 'Open';
      b.onclick = () => openSavedFile(name);
      actions.prepend(b);
      // Safety cleanup in case an older cached script created Delete.
      row.querySelectorAll('[data-action="delete"],button').forEach(btn => {
        if (/^delete$/i.test(clean(btn.textContent))) btn.remove();
      });
    });
  };
  new MutationObserver(patchVault).observe(document.body, {subtree:true, childList:true});
  patchVault();

  // Clear, visible explanation on the actual interaction pages: replies, voice,
  // autograph and other responses can be kept in the private Birthday Vault.
  const noteStyle = document.createElement('style');
  noteStyle.textContent = `
    .birthday-vault-note{margin:10px auto 0;max-width:520px;font:500 11px/1.55 inherit;letter-spacing:.02em;opacity:.62;text-align:center}
    .birthday-vault-note strong{font-weight:800;opacity:.9}
    #site-voice-recorder .birthday-vault-note{margin-top:0;margin-bottom:16px}
  `;
  document.head.appendChild(noteStyle);

  const addNote = (el, text) => {
    if (!el || el.querySelector?.('.birthday-vault-note')) return;
    const n = document.createElement('div');
    n.className = 'birthday-vault-note';
    n.innerHTML = text;
    el.appendChild(n);
  };

  const scanForNotes = () => {
    // Don't spam the whole page. Only attach to blocks whose copy clearly refers
    // to a response the visitor is being invited to create.
    [...document.querySelectorAll('body *')].forEach(el => {
      if (el.children.length === 0) return;
      const t = clean(el.innerText);
      if (!t || t.length > 900) return;
      const hasResponseWord = /write something back|reply|autograph|signature|voice/i.test(t);
      if (!hasResponseWord) return;
      const hasControl = el.querySelector('textarea,input:not([type="hidden"]),canvas,button,[role="button"]');
      if (!hasControl) return;
      const likelySection = /write something back|voice reply|autograph|signature/i.test(t);
      if (likelySection) addNote(el, '✦ You can save what you create here to the private <strong>Birthday Vault</strong> — replies, voice replies and autographs can be kept there.');
    });
    const voice = document.querySelector('#site-voice-recorder .svr-card');
    if (voice) addNote(voice, 'Your recording can be saved to the private <strong>Birthday Vault</strong> and opened later.');
  };
  scanForNotes();
  new MutationObserver(scanForNotes).observe(document.body, {subtree:true, childList:true});

  // Stronger final-value capture for the site's reply/choice controls. This is
  // intentionally additive to v2's existing saving logic.
  const saveText = (label, value) => {
    const text = clean(value); if (!text) return;
    const form = new FormData();
    form.append('password', PASSWORD); form.append('action', 'upload');
    form.append('file', new File([text], `${label}-${Date.now()}.txt`, {type:'text/plain;charset=utf-8'}));
    fetch(API, {method:'POST', body:form}).catch(()=>{});
  };
  const fieldLabel = el => clean(el.getAttribute('aria-label') || el.getAttribute('placeholder') || el.name || 'reply').replace(/[^a-z0-9_-]+/gi,'_').slice(0,50);
  document.addEventListener('click', e => {
    const btn = e.target?.closest?.('button,[role="button"],a');
    if (!btn || btn.closest('#vault-modal') || btn.closest('#site-voice-recorder')) return;
    const text = clean(btn.innerText || btn.textContent);
    if (!/(send|submit|save|reply|finish|done|confirm|that's it|write back)/i.test(text)) return;
    const section = btn.closest('section,article,form,[class*="slide"],[class*="page"],body') || document.body;
    const fields = [...section.querySelectorAll('textarea,input:not([type="hidden"]),[contenteditable="true"]')]
      .filter(x => x.type !== 'password' && x.type !== 'file');
    fields.forEach(x => saveText(fieldLabel(x), x.isContentEditable ? x.innerText : x.value));
    const selected = [...section.querySelectorAll('input[type="radio"]:checked,input[type="checkbox"]:checked,select option:checked')];
    selected.forEach(x => saveText('choice', x.closest('label')?.innerText || x.textContent || x.value));
  }, true);

  // Voice: intercept the transition button before the legacy next-slide handler.
  // If the existing v2 recorder is available, open it; otherwise create a recorder
  // here. This keeps the visitor on the voice step instead of advancing.
  let recorder = null, stream = null, chunks = [];
  const ensureVoiceUI = () => document.querySelector('#site-voice-recorder');
  const openFallbackVoice = () => {
    let ui = ensureVoiceUI();
    if (!ui) {
      ui = document.createElement('div'); ui.id='site-voice-recorder';
      ui.innerHTML='<div class="svr-card"><div class="svr-title">🎙️ Voice reply</div><div class="svr-status" id="svr-status">Your voice reply can be saved to the private Birthday Vault.</div><div class="svr-actions"><button class="svr-btn" id="svr-start">Start recording</button><button class="svr-btn" id="svr-stop" style="display:none">Stop & save</button><button class="svr-btn" id="svr-cancel">Cancel</button></div></div>';
      document.body.appendChild(ui);
      const status=ui.querySelector('#svr-status'), start=ui.querySelector('#svr-start'), stop=ui.querySelector('#svr-stop');
      start.onclick=async()=>{try{stream=await navigator.mediaDevices.getUserMedia({audio:true});chunks=[];recorder=new MediaRecorder(stream);recorder.ondataavailable=e=>{if(e.data.size)chunks.push(e.data)};recorder.onstop=()=>{const blob=new Blob(chunks,{type:recorder.mimeType||'audio/webm'});const f=new FormData();f.append('password',PASSWORD);f.append('action','upload');f.append('file',new File([blob],`voice-reply-${Date.now()}.webm`,{type:blob.type}));fetch(API,{method:'POST',body:f}).then(()=>status.textContent='Saved to the Birthday Vault ✓').catch(()=>status.textContent='Recording made, but saving failed.');stream.getTracks().forEach(t=>t.stop());start.style.display='';stop.style.display='none';};recorder.start();status.textContent='Recording…';start.style.display='none';stop.style.display='';}catch(e){status.textContent='Microphone permission is needed to record.';}};
      stop.onclick=()=>{if(recorder&&recorder.state!=='inactive')recorder.stop()};
      ui.querySelector('#svr-cancel').onclick=()=>{if(recorder&&recorder.state!=='inactive')recorder.stop();ui.classList.remove('show');};
    }
    ui.classList.add('show');
    const status=ui.querySelector('.svr-status'); if(status) status.innerHTML='Your voice reply can be saved to the private <strong>Birthday Vault</strong>. Press start when ready.';
  };

  window.addEventListener('click', e => {
    const el=e.target?.closest?.('button,[role="button"],a'); if(!el) return;
    const text=clean(el.innerText||el.textContent);
    if (!/^(okay|ok|continue|got it)$/i.test(text)) return;
    const visible=clean(document.body.innerText);
    if (!/voice reply|voice message|record.*voice/i.test(visible)) return;
    e.preventDefault(); e.stopImmediatePropagation();
    const existing=document.querySelector('#site-voice-recorder');
    if(existing){existing.classList.add('show'); const s=existing.querySelector('.svr-status');if(s)s.innerHTML='Your voice reply can be saved to the private <strong>Birthday Vault</strong>. Press start when ready.';}
    else openFallbackVoice();
  }, true);
})();