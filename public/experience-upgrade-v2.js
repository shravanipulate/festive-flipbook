(() => {
  if (window.__birthdayUpgradeV2Loaded) return;
  window.__birthdayUpgradeV2Loaded = true;

  const GREETINGS = [
    'नमस्ते', 'Hello', 'प्रणाम', 'ਸਤ ਸ੍ਰੀ ਅਕਾਲ', 'Hallo', 'こんにちは',
    'नमः', 'নমস্কাৰ', 'নমস্কার', 'ନମସ୍କାର', 'प्रणाम', 'Hello', '你好'
  ];

  const oldLanguageBits = [
    'Hello', 'Bonjour', 'Hola', 'مرحبا', 'Olá', '안녕', 'namaste',
    'नमस्ते', 'নমস্কার', 'こんにちは', 'नमस्कार', 'ਸਤ ਸ੍ਰੀ ਅਕਾਲ', 'Hallo', '你好'
  ];
  const normalize = s => (s || '').replace(/\s+/g, ' ').trim();

  function replaceOriginalLanguageLine() {
    const candidates = [...document.querySelectorAll('body *')].filter(el => {
      if (el.children.length > 0) return false;
      const text = normalize(el.textContent);
      if (!text || text.length > 300) return false;
      const hits = oldLanguageBits.filter(x => text.toLowerCase().includes(x.toLowerCase())).length;
      return hits >= 2;
    });
    let target = candidates.find(el => {
      const p = el.parentElement;
      return p && /languages/i.test(normalize(p.textContent));
    });
    if (!target) target = candidates[0];
    if (!target) return false;
    const leaves = candidates.filter(el => target === el || target.contains(el));
    if (leaves.length > 1) {
      leaves.forEach((el, i) => { if (i < GREETINGS.length) el.textContent = GREETINGS[i]; });
    } else {
      target.textContent = GREETINGS.join('   ');
    }
    return true;
  }

  const runLanguageFix = () => {
    if (replaceOriginalLanguageLine()) return;
    setTimeout(replaceOriginalLanguageLine, 300);
    setTimeout(replaceOriginalLanguageLine, 1000);
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', runLanguageFix, { once: true });
  else runLanguageFix();

  const cleanShandilya = () => {
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach(n => {
      if (/shandilya/i.test(n.nodeValue || '')) n.nodeValue = n.nodeValue.replace(/\s*shandilya\s*/gi, ' ');
    });
  };
  cleanShandilya();
  new MutationObserver(cleanShandilya).observe(document.body, { subtree: true, childList: true, characterData: true });

  const name = document.getElementById('bu-name');
  if (name) {
    const old = name.textContent || '';
    if (/chinmay/i.test(old) || /shandilya/i.test(old)) name.textContent = 'CHINMAY';
  }
  const oldReveal = window.__birthdayNameReveal;
  if (typeof oldReveal === 'function') window.__birthdayNameReveal = null;

  // ---------------- REAL VAULT ----------------
  // The password is checked server-side by the Supabase Edge Function.
  const VAULT_API = 'https://ltptnyaynwvfsutfnpdu.supabase.co/functions/v1/birthday-vault';
  const VAULT_PASSWORD = 'potentiallyavault';
  let vaultPassword = sessionStorage.getItem('birthday-vault-unlocked') || '';

  const vaultStyle = document.createElement('style');
  vaultStyle.textContent = `
    #real-birthday-vault{position:fixed;right:18px;top:18px;z-index:1000000;border:1px solid rgba(217,164,65,.48);background:rgba(18,15,14,.82);backdrop-filter:blur(14px);color:#fff;border-radius:999px;padding:10px 15px;font:700 11px inherit;letter-spacing:.12em;cursor:pointer;box-shadow:0 8px 30px rgba(0,0,0,.16)}
    #real-birthday-vault:hover{border-color:rgba(217,164,65,.9);transform:translateY(-1px)}
    #vault-modal{position:fixed;inset:0;z-index:1000001;display:none;align-items:center;justify-content:center;padding:18px;background:rgba(8,7,7,.72);backdrop-filter:blur(10px)}
    #vault-modal.show{display:flex}
    .rv-card{width:min(760px,96vw);max-height:88vh;overflow:auto;background:#181412;color:#fff;border:1px solid rgba(217,164,65,.3);border-radius:22px;padding:22px;box-shadow:0 30px 100px rgba(0,0,0,.45);font-family:inherit}
    .rv-top{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:18px}.rv-title{font-size:22px;font-weight:800}.rv-close{border:0;background:rgba(255,255,255,.07);color:#fff;border-radius:10px;padding:8px 11px;cursor:pointer}
    .rv-sub{font-size:12px;line-height:1.6;opacity:.62;margin-top:-10px;margin-bottom:18px}.rv-login{display:grid;gap:10px}.rv-input{width:100%;box-sizing:border-box;border:1px solid rgba(255,255,255,.14);background:rgba(255,255,255,.05);color:#fff;border-radius:12px;padding:12px 13px;font:inherit;outline:none}.rv-input:focus{border-color:rgba(217,164,65,.75)}
    .rv-btn{border:1px solid rgba(217,164,65,.42);background:rgba(217,164,65,.1);color:#fff;border-radius:11px;padding:11px 14px;cursor:pointer;font:700 12px inherit}.rv-btn:hover{background:rgba(217,164,65,.17)}.rv-btn.danger{border-color:rgba(231,120,109,.4);background:rgba(231,120,109,.08)}
    .rv-toolbar{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:15px}.rv-files{display:grid;gap:9px}.rv-file{display:flex;align-items:center;gap:12px;padding:12px;border:1px solid rgba(255,255,255,.09);background:rgba(255,255,255,.035);border-radius:13px}.rv-icon{font-size:23px;width:32px;text-align:center}.rv-info{min-width:0;flex:1}.rv-name{font-size:13px;font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.rv-meta{font-size:10px;opacity:.5;margin-top:4px}.rv-actions{display:flex;gap:6px}.rv-actions button{font-size:10px;padding:7px 9px}.rv-empty{padding:28px 8px;text-align:center;opacity:.52;font-size:12px;border:1px dashed rgba(255,255,255,.1);border-radius:13px}.rv-status{font-size:11px;min-height:16px;opacity:.65;margin-top:8px}.rv-drop{border:1px dashed rgba(217,164,65,.32);padding:15px;border-radius:13px;text-align:center;font-size:11px;opacity:.75;margin-bottom:14px}.rv-drop input{display:none}.rv-drop label{cursor:pointer;display:block}
    @media(max-width:600px){#real-birthday-vault{right:10px;top:10px}.rv-card{padding:17px}.rv-file{align-items:flex-start}.rv-actions{flex-wrap:wrap}}
  `;
  document.head.appendChild(vaultStyle);

  const vaultBtn = document.createElement('button');
  vaultBtn.id = 'real-birthday-vault';
  vaultBtn.textContent = '🔐 VAULT';
  document.body.appendChild(vaultBtn);

  const modal = document.createElement('div');
  modal.id = 'vault-modal';
  modal.innerHTML = `<div class="rv-card"><div class="rv-top"><div class="rv-title">🔐 Birthday Vault</div><button class="rv-close" id="rv-close">×</button></div><div id="rv-body"></div></div>`;
  document.body.appendChild(modal);
  const rvBody = modal.querySelector('#rv-body');

  const iconFor = name => {
    const ext = (name.split('.').pop() || '').toLowerCase();
    if (['png','jpg','jpeg','gif','webp','svg'].includes(ext)) return '🖼️';
    if (['mp3','wav','m4a','ogg'].includes(ext)) return '🎧';
    if (['mp4','mov','webm','avi'].includes(ext)) return '🎬';
    if (['pdf'].includes(ext)) return '📄';
    if (['zip','rar','7z'].includes(ext)) return '🗜️';
    if (['txt','md','doc','docx'].includes(ext)) return '📝';
    return '📦';
  };
  const formatBytes = n => { if (!Number.isFinite(n) || n <= 0) return ''; const u=['B','KB','MB','GB']; let i=0,v=n; while(v>=1024&&i<u.length-1){v/=1024;i++;} return `${v.toFixed(v>=10||i===0?0:1)} ${u[i]}`; };

  function loginView(message='') {
    rvBody.innerHTML = `<div class="rv-sub">A private little storage room for files you want to keep with the experience.</div><div class="rv-login"><input class="rv-input" id="rv-pass" type="password" autocomplete="off" placeholder="Vault password"><button class="rv-btn" id="rv-unlock">Unlock vault</button></div><div class="rv-status" id="rv-status">${message}</div>`;
    const input = rvBody.querySelector('#rv-pass');
    const status = rvBody.querySelector('#rv-status');
    const unlock = async () => {
      const pass = input.value;
      if (pass !== VAULT_PASSWORD) { status.textContent = 'Nope. Wrong password.'; input.select(); return; }
      status.textContent = 'Checking vault…';
      try {
        const res = await fetch(VAULT_API, { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({action:'list',password:pass}) });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Could not unlock');
        vaultPassword = pass; sessionStorage.setItem('birthday-vault-unlocked', pass); renderVault(data.files || []);
      } catch (e) { status.textContent = e.message || 'Vault unavailable'; }
    };
    rvBody.querySelector('#rv-unlock').onclick = unlock;
    input.onkeydown = e => { if(e.key === 'Enter') unlock(); };
    setTimeout(()=>input.focus(),30);
  }

  async function vaultRequest(payload, isForm=false) {
    const opts = { method:'POST' };
    if (isForm) opts.body = payload;
    else { opts.headers={'Content-Type':'application/json'}; opts.body=JSON.stringify({...payload,password:vaultPassword}); }
    const res = await fetch(VAULT_API, opts);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Vault request failed');
    return data;
  }

  function renderVault(files) {
    rvBody.innerHTML = `<div class="rv-sub">Files saved here stay in the private Supabase bucket. Share creates a temporary link.</div><div class="rv-toolbar"><button class="rv-btn" id="rv-refresh">↻ Refresh</button><button class="rv-btn danger" id="rv-lock">Lock vault</button></div><div class="rv-drop"><label for="rv-file-input">＋ Save a file to the vault<input id="rv-file-input" type="file" multiple></label></div><div class="rv-status" id="rv-status"></div><div class="rv-files" id="rv-files"></div>`;
    const list = rvBody.querySelector('#rv-files');
    if (!files.length) list.innerHTML = '<div class="rv-empty">Nothing saved yet. Add a file above.</div>';
    files.forEach(file => {
      const row = document.createElement('div'); row.className='rv-file';
      const size = file.metadata?.size ? formatBytes(Number(file.metadata.size)) : '';
      const date = file.created_at ? new Date(file.created_at).toLocaleString() : '';
      row.innerHTML = `<div class="rv-icon">${iconFor(file.name)}</div><div class="rv-info"><div class="rv-name" title="${file.name.replace(/"/g,'&quot;')}">${file.name}</div><div class="rv-meta">${[size,date].filter(Boolean).join(' · ')}</div></div><div class="rv-actions"><button class="rv-btn" data-action="download">Save</button><button class="rv-btn" data-action="share">Share</button><button class="rv-btn danger" data-action="delete">Delete</button></div>`;
      const status = rvBody.querySelector('#rv-status');
      row.querySelector('[data-action="download"]').onclick = async () => { try { status.textContent='Preparing download…'; const d=await vaultRequest({action:'download',path:file.name}); window.open(d.url,'_blank','noopener'); status.textContent='Download link opened.'; } catch(e){status.textContent=e.message;} };
      row.querySelector('[data-action="share"]').onclick = async () => { try { status.textContent='Creating 1-hour share link…'; const d=await vaultRequest({action:'share',path:file.name}); await navigator.clipboard?.writeText(d.url); status.textContent='Share link copied. It expires in 1 hour.'; } catch(e){status.textContent=e.message;} };
      row.querySelector('[data-action="delete"]').onclick = async () => { if(!confirm(`Delete “${file.name}” from the vault?`)) return; try { status.textContent='Deleting…'; await vaultRequest({action:'delete',path:file.name}); await refreshVault(); } catch(e){status.textContent=e.message;} };
      list.appendChild(row);
    });
    rvBody.querySelector('#rv-refresh').onclick = refreshVault;
    rvBody.querySelector('#rv-lock').onclick = () => { vaultPassword=''; sessionStorage.removeItem('birthday-vault-unlocked'); loginView(); };
    rvBody.querySelector('#rv-file-input').onchange = async e => {
      const filesToUpload = [...e.target.files]; if(!filesToUpload.length) return;
      const status = rvBody.querySelector('#rv-status');
      for (const file of filesToUpload) {
        try {
          status.textContent = `Saving ${file.name}…`;
          const form = new FormData(); form.append('password',vaultPassword); form.append('action','upload'); form.append('file',file);
          await vaultRequest(form,true);
        } catch(err) { status.textContent = `${file.name}: ${err.message}`; return; }
      }
      await refreshVault();
    };
  }

  async function refreshVault() {
    try { const data=await vaultRequest({action:'list'}); renderVault(data.files || []); }
    catch(e) { loginView(e.message || 'Session expired.'); }
  }

  vaultBtn.onclick = () => { modal.classList.add('show'); if(vaultPassword) refreshVault(); else loginView(); };
  modal.querySelector('#rv-close').onclick = () => modal.classList.remove('show');
  modal.addEventListener('click', e => { if(e.target === modal) modal.classList.remove('show'); });
  document.addEventListener('keydown', e => { if(e.key === 'Escape') modal.classList.remove('show'); });
})();
