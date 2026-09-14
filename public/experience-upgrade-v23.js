(() => {
  if (window.__birthdayLeaveGateV23Loaded) return;
  window.__birthdayLeaveGateV23Loaded = true;

  const RELOCK_KEY = 'chinmay-birthday-relock-after-leave-v1';
  const LEAVE_BTN_ID = 'birthday-leave-site';
  const GATE_ID = 'birthday-leave-password-gate';

  function getSiteGatePassword() {
    try {
      return typeof SITE_GATE_PASSWORD !== 'undefined' ? String(SITE_GATE_PASSWORD) : 'rarespeciwomen';
    } catch (_) {
      return 'rarespeciwomen';
    }
  }

  function addStyles() {
    if (document.getElementById('birthday-leave-v23-style')) return;
    const style = document.createElement('style');
    style.id = 'birthday-leave-v23-style';
    style.textContent = `
      #${LEAVE_BTN_ID}{position:fixed;right:14px;bottom:14px;z-index:2147483000;border:1px solid rgba(255,255,255,.18);background:rgba(18,15,14,.72);backdrop-filter:blur(12px);color:#fff;border-radius:999px;padding:8px 12px;font:700 11px/1 system-ui,sans-serif;letter-spacing:.04em;cursor:pointer;box-shadow:0 8px 25px rgba(0,0,0,.18);opacity:.72;transition:opacity .2s,transform .2s}
      #${LEAVE_BTN_ID}:hover{opacity:1;transform:translateY(-1px)}
      #${GATE_ID}{position:fixed;inset:0;z-index:2147483647;display:none;align-items:center;justify-content:center;background:rgba(8,7,7,.88);backdrop-filter:blur(14px);padding:20px}
      #${GATE_ID}.show{display:flex}
      .blg-card{width:min(390px,92vw);padding:25px;border:1px solid rgba(217,164,65,.32);border-radius:20px;background:#181412;color:#fff;text-align:center;box-shadow:0 30px 100px rgba(0,0,0,.5);font-family:inherit}
      .blg-title{font-size:21px;font-weight:800;margin-bottom:7px}
      .blg-sub{font-size:12px;line-height:1.55;opacity:.62;margin-bottom:16px}
      .blg-input{width:100%;box-sizing:border-box;padding:12px 13px;border-radius:11px;border:1px solid rgba(255,255,255,.14);background:rgba(255,255,255,.05);color:#fff;outline:none;font:inherit}
      .blg-btn{margin-top:9px;width:100%;padding:11px 13px;border-radius:11px;border:1px solid rgba(217,164,65,.45);background:rgba(217,164,65,.1);color:#fff;font:700 12px system-ui,sans-serif;cursor:pointer}
      .blg-status{min-height:17px;margin-top:9px;font-size:11px;opacity:.68}
    `;
    document.head.appendChild(style);
  }

  function ensureGate() {
    if (document.getElementById(GATE_ID)) return document.getElementById(GATE_ID);
    const gate = document.createElement('div');
    gate.id = GATE_ID;
    gate.innerHTML = `
      <div class="blg-card">
        <div class="blg-title">Welcome back ✦</div>
        <div class="blg-sub">You left the experience, so you'll need to unlock it again.</div>
        <input class="blg-input" id="birthday-leave-password" type="password" autocomplete="off" placeholder="Password">
        <button class="blg-btn" id="birthday-leave-unlock">Unlock</button>
        <div class="blg-status" id="birthday-leave-status"></div>
      </div>`;
    document.body.appendChild(gate);

    const input = gate.querySelector('#birthday-leave-password');
    const status = gate.querySelector('#birthday-leave-status');
    const unlock = () => {
      if (input.value === getSiteGatePassword()) {
        sessionStorage.removeItem(RELOCK_KEY);
        gate.classList.remove('show');
        input.value = '';
        status.textContent = '';
        return;
      }
      status.textContent = 'Nope. Wrong password.';
      input.select();
    };
    gate.querySelector('#birthday-leave-unlock').addEventListener('click', unlock);
    input.addEventListener('keydown', e => { if (e.key === 'Enter') unlock(); });
    return gate;
  }

  function showGate() {
    const gate = ensureGate();
    gate.classList.add('show');
    setTimeout(() => gate.querySelector('#birthday-leave-password')?.focus(), 40);
  }

  function addLeaveButton() {
    if (document.getElementById(LEAVE_BTN_ID)) return;
    const button = document.createElement('button');
    button.id = LEAVE_BTN_ID;
    button.type = 'button';
    button.textContent = '× Leave';
    button.title = 'Leave this birthday experience';
    button.addEventListener('click', () => {
      sessionStorage.setItem(RELOCK_KEY, 'yes');
      showGate();
    });
    document.body.appendChild(button);
  }

  function relockIfNeeded() {
    if (sessionStorage.getItem(RELOCK_KEY) === 'yes') showGate();
  }

  function init() {
    addStyles();
    addLeaveButton();
    relockIfNeeded();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})();
