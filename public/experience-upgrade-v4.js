(() => {
  if (window.__birthdayUpgradeV4Loaded) return;
  window.__birthdayUpgradeV4Loaded = true;

  // First-page cleanup: show only "Chinmay" rather than a full name.
  const cleanFirstName = () => {
    const all = [...document.querySelectorAll('body *')];
    const archive = all.find(el => /enter the archive/i.test((el.innerText || '').trim()));
    if (!archive) return false;

    // Work upward to the smallest sensible first-page container.
    let root = archive;
    for (let i = 0; i < 6 && root.parentElement; i++) {
      const p = root.parentElement;
      const txt = (p.innerText || '').trim();
      if (txt.length > 0 && txt.length < 2200) root = p;
      else break;
    }

    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach(node => {
      const value = node.nodeValue || '';
      // Only alter text that explicitly contains Chinmay followed by another word.
      // This leaves the rest of the original typography/layout untouched.
      const next = value.replace(/\bChinmay\s+[A-Z][A-Za-z.'-]+\b/g, 'Chinmay');
      if (next !== value) node.nodeValue = next;
    });
    return true;
  };

  // A lightweight particle-to-word animation for the opening canvas.
  // It uses the existing first-page canvas when possible and never intercepts input.
  let particleCanvas = null;
  let raf = 0;
  let points = [];
  let targets = [];
  let startedAt = performance.now();

  const firstPageVisible = () => /enter the archive/i.test(document.body?.innerText || '');

  const getOpeningCanvas = () => {
    const canvases = [...document.querySelectorAll('canvas')];
    return canvases.find(c => {
      const r = c.getBoundingClientRect();
      return r.width > 120 && r.height > 60;
    }) || null;
  };

  const buildTargets = (ctx, w, h) => {
    const off = document.createElement('canvas');
    off.width = Math.max(1, Math.floor(w));
    off.height = Math.max(1, Math.floor(h));
    const o = off.getContext('2d', {willReadFrequently:true});
    const size = Math.max(38, Math.min(110, w / 5.2));
    o.font = `800 ${size}px Arial, sans-serif`;
    o.textAlign = 'center';
    o.textBaseline = 'middle';
    o.fillText('CHINMAY', w / 2, h / 2);
    const data = o.getImageData(0, 0, off.width, off.height).data;
    const step = Math.max(3, Math.floor(Math.min(w, h) / 95));
    const out = [];
    for (let y = 0; y < h; y += step) {
      for (let x = 0; x < w; x += step) {
        if (data[(y * off.width + x) * 4 + 3] > 100) out.push({x, y});
      }
    }
    // Keep animation light on small/mobile screens.
    const max = 650;
    if (out.length > max) {
      const picked = [];
      const stride = out.length / max;
      for (let i = 0; i < max; i++) picked.push(out[Math.floor(i * stride)]);
      return picked;
    }
    return out;
  };

  const initParticles = () => {
    const canvas = getOpeningCanvas();
    if (!canvas) return;
    particleCanvas = canvas;
    const rect = canvas.getBoundingClientRect();
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const w = Math.max(1, Math.floor(rect.width));
    const h = Math.max(1, Math.floor(rect.height));
    // Preserve the canvas's displayed size while ensuring a usable drawing buffer.
    canvas.width = Math.floor(w * dpr);
    canvas.height = Math.floor(h * dpr);
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    targets = buildTargets(ctx, w, h);
    points = targets.map(t => ({
      x: Math.random() * w,
      y: Math.random() * h,
      tx: t.x,
      ty: t.y,
      vx: 0,
      vy: 0
    }));
    startedAt = performance.now();
    cancelAnimationFrame(raf);
    const draw = now => {
      if (!particleCanvas || !document.contains(particleCanvas) || !firstPageVisible()) return;
      const r = particleCanvas.getBoundingClientRect();
      const cw = r.width, ch = r.height;
      ctx.clearRect(0, 0, cw, ch);
      const elapsed = (now - startedAt) / 1000;
      const cycle = elapsed % 7.5;
      const gather = Math.min(1, Math.max(0, (cycle - 0.2) / 2.2));
      const hold = cycle >= 2.4 && cycle < 5.6;
      const scatter = cycle >= 5.6 ? Math.min(1, (cycle - 5.6) / 1.4) : 0;
      const ease = gather * gather * (3 - 2 * gather);
      for (const p of points) {
        let tx = p.tx, ty = p.ty;
        if (scatter) {
          tx += Math.sin(p.tx * 0.08 + elapsed) * 35 * scatter;
          ty += Math.cos(p.ty * 0.07 + elapsed) * 35 * scatter;
        }
        if (cycle < 2.4 || scatter) {
          p.x += (tx - p.x) * (0.018 + ease * 0.075);
          p.y += (ty - p.y) * (0.018 + ease * 0.075);
        } else if (hold) {
          p.x += (p.tx - p.x) * 0.08;
          p.y += (p.ty - p.y) * 0.08;
        }
        const alpha = hold ? 0.82 : Math.max(0.12, 0.7 - scatter * 0.45);
        ctx.globalAlpha = alpha;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 1.25, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
  };

  const boot = () => {
    cleanFirstName();
    if (firstPageVisible() && !particleCanvas) initParticles();
  };

  boot();
  new MutationObserver(() => {
    cleanFirstName();
    if (!particleCanvas && firstPageVisible()) initParticles();
  }).observe(document.body, {subtree:true, childList:true, characterData:true});
  window.addEventListener('resize', () => {
    if (firstPageVisible()) { particleCanvas = null; initParticles(); }
  });
})();
