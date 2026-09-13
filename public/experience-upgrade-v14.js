/* Anonymous site-visit timing patch.
   Stores only a visit id, timestamps, and approximate active duration.
   A small disclosure is added to the experience UI.
*/
(function () {
  'use strict';

  const ENDPOINT = 'https://ltptnyaynwvfsutfpndu.supabase.co/functions/v1/site-visits';
  let visitId = null;
  let activeSeconds = 0;
  let lastTick = Date.now();
  let ended = false;

  function isActive() {
    return document.visibilityState === 'visible';
  }

  function accrue() {
    const now = Date.now();
    if (isActive()) {
      activeSeconds += Math.max(0, Math.floor((now - lastTick) / 1000));
    }
    lastTick = now;
  }

  async function post(payload, keepalive) {
    try {
      await fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        keepalive: !!keepalive,
      });
    } catch (_) {}
  }

  async function start() {
    try {
      const res = await fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'start' }),
      });
      const data = await res.json();
      if (data && data.visit_id) visitId = data.visit_id;
    } catch (_) {}
  }

  function heartbeat() {
    if (!visitId || ended) return;
    accrue();
    post({ action: 'heartbeat', visit_id: visitId, duration_seconds: activeSeconds });
  }

  function endVisit() {
    if (!visitId || ended) return;
    ended = true;
    accrue();
    const payload = JSON.stringify({
      action: 'end',
      visit_id: visitId,
      duration_seconds: activeSeconds,
    });

    try {
      if (navigator.sendBeacon) {
        navigator.sendBeacon(
          ENDPOINT,
          new Blob([payload], { type: 'application/json' }),
        );
        return;
      }
    } catch (_) {}

    post({ action: 'end', visit_id: visitId, duration_seconds: activeSeconds }, true);
  }

  function addDisclosure() {
    if (document.getElementById('anonymous-visit-disclosure')) return;
    const el = document.createElement('div');
    el.id = 'anonymous-visit-disclosure';
    el.textContent = 'Anonymous site stats: visit count + approximate active time only.';
    el.style.cssText = [
      'position:fixed', 'right:8px', 'bottom:6px', 'z-index:2147483646',
      'font:10px/1.25 system-ui,sans-serif', 'opacity:.42',
      'pointer-events:none', 'max-width:260px', 'text-align:right'
    ].join(';');
    (document.body || document.documentElement).appendChild(el);
  }

  document.addEventListener('visibilitychange', function () {
    if (document.visibilityState === 'hidden') heartbeat();
    else lastTick = Date.now();
  });
  window.addEventListener('pagehide', endVisit);
  window.addEventListener('beforeunload', endVisit);
  setInterval(heartbeat, 15000);

  addDisclosure();
  start();
})();
