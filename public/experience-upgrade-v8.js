(() => {
  if (window.__birthdayUpgradeV8Loaded) return;
  window.__birthdayUpgradeV8Loaded = true;

  const COMPLETE_KEY = 'chinmay-birthday-first-run-complete-v2';
  const PASSWORD_KEY = 'chinmay-birthday-first-run-password-v1';
  const completed = () => localStorage.getItem(COMPLETE_KEY) === 'yes';
  const legacyCompleted = () => localStorage.getItem('chinmay-birthday-first-run-complete-v1') === 'yes';
  const norm = s => String(s || '').replace(/\s+/g, ' ').trim();
  const visible = el => { if (!el) return false; const r=el.getBoundingClientRect(),cs=getComputedStyle(el); return r.width>0&&r.height>0&&cs.display!=='none'&&cs.visibility!=='hidden'&&cs.opacity!=='0'; };

  // Capture the password the visitor legitimately enters on the first run.
  function rememberEnteredPassword(){
    if(completed())return;
    const input=[...document.querySelectorAll('input[type="password"]')].find(visible);
    if(input?.value) localStorage.setItem(PASSWORD_KEY,input.value);
  }
  document.addEventListener('input',e=>{if(e.target?.matches?.('input[type="password"]'))rememberEnteredPassword();},true);
  document.addEventListener('change',e=>{if(e.target?.matches?.('input[type="password"]'))rememberEnteredPassword();},true);
  document.addEventListener('click',e=>{
    const el=e.target?.closest?.('button,a,[role="button"],input[type="button"],input[type="submit"]');if(!el)return;
    const text=norm(el.innerText||el.textContent||el.value);
    rememberEnteredPassword();
    if(/\breplay\b/i.test(text)||/watch\s+(it\s+)?again/i.test(text)){
      localStorage.setItem(COMPLETE_KEY,'yes');
      localStorage.removeItem('chinmay-birthday-first-run-complete-v1');
      addReset();
    }
  },true);

  const style=document.createElement('style');
  style.textContent=`
    #first-run-reset-access{position:fixed;right:12px;bottom:10px;z-index:2147483646;width:24px;height:24px;border:0;border-radius:50%;background:rgba(0,0,0,.10);color:currentColor;opacity:.22;font:600 15px/24px system-ui,sans-serif;text-align:center;padding:0;cursor:pointer;transition:opacity .2s,transform .2s}
    #first-run-reset-access:hover{opacity:.8;transform:scale(1.08)}
    #real-birthday-vault{left:14px!important;right:auto!important;top:auto!important;bottom:14px!important}
  `;
  document.head.appendChild(style);

  function addReset(){
    if(!completed()||document.getElementById('first-run-reset-access'))return;
    const b=document.createElement('button');b.id='first-run-reset-access';b.type='button';b.title='Reset first-visit access';b.setAttribute('aria-label','Reset first-visit access');b.textContent='×';
    b.onclick=()=>{localStorage.removeItem(COMPLETE_KEY);localStorage.removeItem(PASSWORD_KEY);localStorage.removeItem('chinmay-birthday-first-run-complete-v1');location.reload();};
    document.body.appendChild(b);
  }

  // On later visits, replay the original password action automatically using the
  // password that was entered during the legitimate first visit. No password is
  // hard-coded into this patch.
  function autoUnlock(){
    if(!completed())return false;
    const saved=localStorage.getItem(PASSWORD_KEY);if(!saved)return false;
    const input=[...document.querySelectorAll('input[type="password"]')].find(visible);if(!input)return false;
    if(input.value!==saved){
      const setter=Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value')?.set;
      if(setter)setter.call(input,saved);else input.value=saved;
      input.dispatchEvent(new Event('input',{bubbles:true}));input.dispatchEvent(new Event('change',{bubbles:true}));
    }
    const form=input.closest('form');
    const submit=form?.querySelector('button[type="submit"],input[type="submit"]')||[...document.querySelectorAll('button,[role="button"],input[type="button"]')].find(b=>visible(b)&&/^(enter|unlock|continue|open|start|submit|access|reveal|let'?s go)$/i.test(norm(b.innerText||b.textContent||b.value)));
    if(submit&&!submit.dataset.firstRunAutoUnlock){submit.dataset.firstRunAutoUnlock='1';setTimeout(()=>submit.click(),80);return true;}
    if(form&&!form.dataset.firstRunAutoUnlock){form.dataset.firstRunAutoUnlock='1';setTimeout(()=>{try{form.requestSubmit?.();}catch(_){form.submit?.();}},80);return true;}
    return false;
  }

  function start(){
    // A v1 completion created by the previous patch is migrated, but without a
    // remembered password it will ask once more so this improved version can learn it.
    if(legacyCompleted()&&!completed())localStorage.removeItem('chinmay-birthday-first-run-complete-v1');
    addReset();if(!completed())return;
    autoUnlock();
    const observer=new MutationObserver(()=>{addReset();autoUnlock();});
    observer.observe(document.body,{subtree:true,childList:true,attributes:true,attributeFilter:['style','class','hidden','disabled']});
    setTimeout(()=>observer.disconnect(),20000);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();