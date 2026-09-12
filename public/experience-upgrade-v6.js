(() => {
  if (window.__birthdayUpgradeV6Loaded) return;
  window.__birthdayUpgradeV6Loaded = true;

  const isHome = () => /enter the archive/i.test(document.body?.innerText || "");

  // Force the opening copy to use only the first name.
  const cleanName = () => {
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach((node) => {
      const s = node.nodeValue || "";
      const fixed = s.replace(/\bChinmay\s+Shandilya\b/gi, "Chinmay");
      if (fixed !== s) node.nodeValue = fixed;
    });
  };

  let canvas, ctx, raf = 0, started = 0, lastW = 0, lastH = 0;

  const makeCanvas = () => {
    if (canvas && canvas.isConnected) return canvas;
    canvas = document.createElement("canvas");
    canvas.id = "chinmay-particle-opening-v6";
    canvas.style.cssText = "position:fixed;inset:0;width:100vw;height:100vh;z-index:9999;pointer-events:none;";
    document.body.appendChild(canvas);
    ctx = canvas.getContext("2d");
    return canvas;
  };

  const resize = () => {
    makeCanvas();
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const w = Math.max(1, innerWidth), h = Math.max(1, innerHeight);
    if (w === lastW && h === lastH) return;
    lastW = w; lastH = h;
    canvas.width = Math.floor(w * dpr);
    canvas.height = Math.floor(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };

  const targetsFor = (w, h) => {
    const off = document.createElement("canvas");
    off.width = Math.floor(w); off.height = Math.floor(h);
    const o = off.getContext("2d", { willReadFrequently: true });
    const size = Math.max(64, Math.min(150, w * 0.105));
    o.font = `900 ${size}px Arial, sans-serif`;
    o.textAlign = "center";
    o.textBaseline = "middle";
    o.fillStyle = "#000";
    o.fillText("CHINMAY", w / 2, h * 0.49);
    const d = o.getImageData(0, 0, off.width, off.height).data;
    const step = Math.max(3, Math.floor(Math.min(w, h) / 150));
    const out = [];
    for (let y = 0; y < h; y += step) {
      for (let x = 0; x < w; x += step) {
        if (d[(y * off.width + x) * 4 + 3] > 80) out.push({ x, y });
      }
    }
    const max = 1400;
    if (out.length <= max) return out;
    const result = [];
    const stride = out.length / max;
    for (let i = 0; i < max; i++) result.push(out[Math.floor(i * stride)]);
    return result;
  };

  let pts = [];
  const init = () => {
    if (!isHome()) return;
    resize();
    const w = innerWidth, h = innerHeight;
    const targets = targetsFor(w, h);
    pts = targets.map((t) => ({
      x: Math.random() * w,
      y: Math.random() * h,
      tx: t.x,
      ty: t.y,
      seed: Math.random() * Math.PI * 2
    }));
    started = performance.now();
    cancelAnimationFrame(raf);
    const draw = (now) => {
      if (!canvas?.isConnected || !isHome()) {
        ctx?.clearRect(0, 0, innerWidth, innerHeight);
        return;
      }
      resize();
      const t = (now - started) / 1000;
      const cycle = t % 8;
      ctx.clearRect(0, 0, innerWidth, innerHeight);

      // 0–2.6s: scattered particles rush inward and form CHINMAY.
      // 2.6–5.5s: hold the word.
      // 5.5–8s: disperse, then repeat.
      const gather = Math.min(1, Math.max(0, (cycle - 0.15) / 2.45));
      const ease = gather * gather * (3 - 2 * gather);
      const scattering = cycle >= 5.5 ? Math.min(1, (cycle - 5.5) / 2.5) : 0;
      const hold = cycle >= 2.6 && cycle < 5.5;

      for (const p of pts) {
        let tx = p.tx, ty = p.ty;
        if (scattering) {
          const a = p.seed + p.tx * 0.015;
          tx += Math.cos(a) * (30 + 260 * scattering);
          ty += Math.sin(a) * (30 + 180 * scattering);
        }
        const speed = hold ? 0.11 : 0.025 + ease * 0.10;
        p.x += (tx - p.x) * speed;
        p.y += (ty - p.y) * speed;
        ctx.globalAlpha = hold ? 0.88 : Math.max(0.15, 0.82 - scattering * 0.55);
        ctx.beginPath();
        ctx.arc(p.x, p.y, 1.35, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
  };

  const boot = () => {
    cleanName();
    if (isHome()) init();
  };

  boot();
  setTimeout(boot, 300);
  setTimeout(boot, 1000);
  new MutationObserver(() => {
    cleanName();
    if (isHome() && !canvas?.isConnected) init();
  }).observe(document.body, { subtree: true, childList: true, characterData: true });
  addEventListener("resize", () => {
    if (isHome()) init();
  });
})();
