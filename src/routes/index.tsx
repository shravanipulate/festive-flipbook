import { createFileRoute } from "@tanstack/react-router";

const TITLE = "A Random Site ✦ — a birthday made just for you";
const DESCRIPTION =
  "A private 32-page birthday experience: letters, candles, games, secrets and a replay archive to watch it all again.";

const CRITICAL_SCRIPTS = [
  "experience-upgrade-v2.js",
  "experience-vault-position.js",
  "experience-upgrade-v3.js",
  "experience-upgrade-v4.js",
  "experience-upgrade-v5.js",
  "experience-upgrade-v7.js",
  "experience-upgrade-v21.js",
  "experience-upgrade-v10.js",
  "experience-upgrade-v11.js",
  "experience-easter-demo.js",
  "experience-upgrade-v12.js",
  "experience-upgrade-v13.js",
  "experience-upgrade-v14.js",
  "experience-upgrade-v16.js",
  "experience-upgrade-v17.js",
] as const;

const IDLE_SCRIPTS = [
  "experience-upgrade-v25.js",
  "experience-upgrade-v27.js",
  "experience-upgrade-v28.js",
  "experience-upgrade-v32.js",
  "experience-upgrade-v33.js",
  "experience-upgrade-v22.js",
] as const;

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "preload", as: "document", href: "/experience.html" }],
  }),
  component: Index,
});

function Index() {
  const injectUpgrades = (event: any) => {
    const frame = event.currentTarget as HTMLIFrameElement;
    try {
      const doc = frame.contentDocument;
      if (!doc?.body || doc.getElementById("birthday-upgrade-loader")) return;

      // Fetch the upgrade files in parallel, but do not execute them yet.
      // The actual execution remains ordered so existing feature dependencies
      // are preserved while network latency is removed from the critical path.
      [...CRITICAL_SCRIPTS, ...IDLE_SCRIPTS].forEach(src => {
        const link = doc.createElement("link");
        link.rel = "preload";
        link.as = "script";
        link.href = "/" + src;
        doc.head.appendChild(link);
      });

      const loader = doc.createElement("script");
      loader.id = "birthday-upgrade-loader";
      loader.textContent = `
        (() => {
          const critical = ${JSON.stringify(CRITICAL_SCRIPTS)};
          const idle = ${JSON.stringify(IDLE_SCRIPTS)};

          const loadScript = (src) => new Promise((resolve) => {
            const script = document.createElement('script');
            script.src = '/' + src;
            script.async = false;
            script.onload = resolve;
            script.onerror = () => {
              console.error('[Birthday] Failed to load', src);
              resolve();
            };
            document.body.appendChild(script);
          });

          const nextFrame = () => new Promise(resolve => requestAnimationFrame(resolve));

          (async () => {
            for (const src of critical) {
              await loadScript(src);
              await nextFrame();
            }

            const runIdle = () => {
              let i = 0;
              const pump = (deadline) => {
                // Execute at most one optional upgrade per idle slice. This keeps
                // slide animations responsive even on slower laptops/phones.
                if (i < idle.length && (deadline?.timeRemaining?.() > 8 || !deadline)) {
                  loadScript(idle[i++]);
                }
                if (i < idle.length) {
                  if (window.requestIdleCallback) requestIdleCallback(pump, { timeout: 1800 });
                  else setTimeout(() => pump(null), 140);
                }
              };
              if (window.requestIdleCallback) requestIdleCallback(pump, { timeout: 1200 });
              else setTimeout(() => pump(null), 300);
            };
            runIdle();
          })();
        })();
      `;
      doc.body.appendChild(loader);
    } catch {
      // Same-origin in production; keep the original experience intact if injection fails.
    }
  };

  return (
    <main className="fixed inset-0 bg-background">
      <style>{`#lovable-badge{display:none!important;visibility:hidden!important;opacity:0!important;pointer-events:none!important}`}</style>
      <iframe
        src="/experience.html"
        title="A Random Site"
        className="fixed inset-0 h-full w-full border-0"
        allow="camera; microphone; display-capture; autoplay; fullscreen; clipboard-write; accelerometer; gyroscope"
        onLoad={injectUpgrades}
      />
    </main>
  );
}
