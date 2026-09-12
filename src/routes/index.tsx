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
      if (!doc || doc.getElementById("birthday-upgrade-script")) return;
      const script = doc.createElement("script");
      script.id = "birthday-upgrade-script";
      script.src = "/experience-upgrade-patch.js";
      script.async = false;
      doc.body.appendChild(script);
    } catch {
      // Same-origin in production; keep the original experience intact if injection is unavailable.
    }
  };

  return (
    <main className="fixed inset-0 bg-background">
      <h1 className="sr-only">A Random Site ✦ — a birthday made just for you</h1>
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
