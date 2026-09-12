import { createFileRoute } from "@tanstack/react-router";

const TITLE = "A Random Site ✦ — a birthday made just for you";
const DESCRIPTION =
  "A private 32-page birthday experience: letters, candles, games, secrets and a replay archive to watch it all again.";

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
  const injectUpgrade = (event: any) => {
    const frame = event.currentTarget as HTMLIFrameElement;
    try {
      const doc = frame.contentDocument;
      if (!doc || doc.getElementById("birthday-upgrade-v2-script")) return;
      const script = doc.createElement("script");
      script.id = "birthday-upgrade-v2-script";
      script.src = "/experience-upgrade-v2.js";
      script.async = false;
      script.onload = () => {
        if (doc.getElementById("birthday-upgrade-v3-script")) return;
        const fix = doc.createElement("script");
        fix.id = "birthday-upgrade-v3-script";
        fix.src = "/experience-upgrade-v3.js";
        fix.async = false;
        fix.onload = () => {
          if (doc.getElementById("birthday-upgrade-v4-script")) return;
          const opening = doc.createElement("script");
          opening.id = "birthday-upgrade-v4-script";
          opening.src = "/experience-upgrade-v4.js";
          opening.async = false;
          opening.onload = () => {
            if (doc.getElementById("birthday-upgrade-v5-script")) return;
            const audio = doc.createElement("script");
            audio.id = "birthday-upgrade-v5-script";
            audio.src = "/experience-upgrade-v5.js";
            audio.async = false;
            audio.onload = () => {
              if (doc.getElementById("birthday-upgrade-v6-script")) return;
              const particle = doc.createElement("script");
              particle.id = "birthday-upgrade-v6-script";
              particle.src = "/experience-upgrade-v6.js";
              particle.async = false;
              doc.body.appendChild(particle);
            };
            doc.body.appendChild(audio);
          };
          doc.body.appendChild(opening);
        };
        doc.body.appendChild(fix);
      };
      doc.body.appendChild(script);
    } catch {
      // Same-origin in production; keep the original experience intact if injection is unavailable.
    }
  };

  return (
    <main className="fixed inset-0 bg-background">
      <style>{`#lovable-badge{display:none!important;visibility:hidden!important;opacity:0!important;pointer-events:none!important}`}</style>
      <h1 className="sr-only">A Random Site ✦ — a birthday experience</h1>
      <iframe
        src="/experience.html"
        title="A Random Site — birthday experience"
        className="h-full w-full border-0"
        onLoad={injectUpgrade}
        allow="camera; microphone; autoplay; fullscreen; clipboard-write; accelerometer; gyroscope"
        allowFullScreen
      />
    </main>
  );
}
