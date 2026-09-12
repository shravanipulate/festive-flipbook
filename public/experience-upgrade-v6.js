(() => {
  if (window.__birthdayUpgradeV6Loaded) return;
  window.__birthdayUpgradeV6Loaded = true;

  const isHome = () => /enter the archive/i.test(document.body?.innerText || "");

  // Opening must say ONLY CHINMAY. Remove the full name wherever it exists in DOM text.
  const cleanName = () => {
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach((node) => {
      const s = node.nodeValue || "";
      const fixed = s
        .replace(/\bChinmay\s+Shandilya\b/gi, "Chinmay")
        .replace(/\bChinmay\s*[-–—|•·]\s*Shandilya\b/gi, "Chinmay");
      if (fixed !== s) node.nodeValue = fixed;
    });

    // Also hide an exact-name element if the original experience wraps the name.
    document.querySelectorAll("body *").forEach((el) => {
      const text = (el.textContent || "").replace(/\s+/g, " ").trim();
      if (/^Chinmay\s+Shandilya$/i.test(text)) {
        el.style.setProperty("display", "none", "important");
      }
    });
  };

  // Hide the Lovable badge if Lovable injected it into the experience document.
  const hideLovableBadge = () => {
    if (!document.getElementById("birthday-hide-lovable-badge")) {
      const style = document.createElement("style");
      style.id = "birthday-hide-lovable-badge";
      style.textContent = `#lovable-badge{display:none!important;visibility:hidden!important;opacity:0!important;pointer-events:none!important}`;
      document.head.appendChild(style);
    }
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
    const max = 1600;
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
      seed: Math.random() * Math.PI * 2,
      radius: 0.9 + Math.random() * 1.2
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

      // 0–2.4s gather -> CHINMAY, 2.4–5.4s hold, 5.4–8s disperse.
      const rawGather = Math.min(1, Math.max(0, (cycle - 0.05) / 2.35));
      const ease = rawGather * rawGather * (3 - 2 * rawGather);
      const scattering = cycle >= 5.4 ? Math.min(1, (cycle - 5.4) / 2.6) : 0;
      const hold = cycle >= 2.4 && cycle < 5.4;

      for (const p of pts) {
        let tx = p.tx, ty = p.ty;
        if (scattering) {
          const a = p.seed + p.tx * 0.015;
          tx += Math.cos(a) * (60 + 700 * scattering);
          ty += Math.sin(a) * (45 + 450 * scattering);
        }

        // Strong spring so the word actually forms on screen, then breaks apart visibly.
        const speed = scattering ? 0.20 : hold ? 0.28 : 0.18 + ease * 0.12;
        p.x += (tx - p.x) * speed;
        p.y += (ty - p.y) * speed;

        ctx.globalAlpha = scattering
          ? Math.max(0, 0.90 - scattering * 0.95)
          : hold ? 0.95 : 0.82;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
  };

  const boot = () => {
    cleanName();
    hideLovableBadge();
    if (isHome()) init();
  };

  boot();
  setTimeout(boot, 150);
  setTimeout(boot, 500);
  setTimeout(boot, 1200);

  new MutationObserver(() => {
    cleanName();
    hideLovableBadge();
    if (isHome() && !canvas?.isConnected) init();
  }).observe(document.body, { subtree: true, childList: true, characterData: true });

  addEventListener("resize", () => {
    if (isHome()) init();
  });
})();
