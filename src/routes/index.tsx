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
              if (doc.getElementById("birthday-upgrade-v7-script")) return;
              const game = doc.createElement("script");
              game.id = "birthday-upgrade-v7-script";
              game.src = "/experience-upgrade-v7.js";
              game.async = false;
              game.onload = () => {
                if (doc.getElementById("birthday-upgrade-v21-script")) return;
                const replacementGame = doc.createElement("script");
                replacementGame.id = "birthday-upgrade-v21-script";
                replacementGame.src = "/experience-upgrade-v21.js";
                replacementGame.async = false;
                replacementGame.onload = () => {
                  if (doc.getElementById("birthday-upgrade-v10-script")) return;
                  const vault = doc.createElement("script");
                  vault.id = "birthday-upgrade-v10-script";
                  vault.src = "/experience-upgrade-v10.js";
                  vault.async = false;
                  vault.onload = () => {
                    if (doc.getElementById("birthday-upgrade-v11-script")) return;
                    const secretFix = doc.createElement("script");
                    secretFix.id = "birthday-upgrade-v11-script";
                    secretFix.src = "/experience-upgrade-v11.js";
                    secretFix.async = false;
                    secretFix.onload = () => {
                      if (doc.getElementById("birthday-c-easter-demo-script")) return;
                      const easter = doc.createElement("script");
                      easter.id = "birthday-c-easter-demo-script";
                      easter.src = "/experience-easter-demo.js";
                      easter.async = false;
                      easter.onload = () => {
                        if (doc.getElementById("birthday-upgrade-v12-script")) return;
                        const potential = doc.createElement("script");
                        potential.id = "birthday-upgrade-v12-script";
                        potential.src = "/experience-upgrade-v12.js";
                        potential.async = false;
                        potential.onload = () => {
                          if (doc.getElementById("birthday-upgrade-v13-script")) return;
                          const reactions = doc.createElement("script");
                          reactions.id = "birthday-upgrade-v13-script";
                          reactions.src = "/experience-upgrade-v13.js";
                          reactions.async = false;
                          reactions.onload = () => {
                            if (doc.getElementById("birthday-upgrade-v14-script")) return;
                            const visits = doc.createElement("script");
                            visits.id = "birthday-upgrade-v14-script";
                            visits.src = "/experience-upgrade-v14.js";
                            visits.async = false;
                            visits.onload = () => {
                              if (doc.getElementById("birthday-upgrade-v20-script")) return;
                              const recorderGuard = doc.createElement("script");
                              recorderGuard.id = "birthday-upgrade-v20-script";
                              recorderGuard.src = "/experience-upgrade-v20.js";
                              recorderGuard.async = false;
                              recorderGuard.onload = () => {
                                if (doc.getElementById("birthday-upgrade-v16-script")) return;
                                const recorder = doc.createElement("script");
                                recorder.id = "birthday-upgrade-v16-script";
                                recorder.src = "/experience-upgrade-v16.js";
                                recorder.async = false;
                                recorder.onload = () => {
                                  if (doc.getElementById("birthday-upgrade-v17-script")) return;
                                  const footer = doc.createElement("script");
                                  footer.id = "birthday-upgrade-v17-script";
                                  footer.src = "/experience-upgrade-v17.js";
                                  footer.async = false;
                                  doc.body.appendChild(footer);
                                };
                                doc.body.appendChild(recorder);
                              };
                              doc.body.appendChild(recorderGuard);
                            };
                            doc.body.appendChild(visits);
                          };
                          doc.body.appendChild(reactions);
                        };
                        doc.body.appendChild(potential);
                      };
                      doc.body.appendChild(easter);
                    };
                    doc.body.appendChild(secretFix);
                  };
                  doc.body.appendChild(vault);
                };
                doc.body.appendChild(replacementGame);
              };
              doc.body.appendChild(game);
            };
            doc.body.appendChild(audio);
          };
          doc.body.appendChild(opening);
        };
        doc.body.appendChild(fix);
      };
      doc.body.appendChild(script);
    } catch {
      // Same-origin in production; keep original experience intact if injection unavailable.
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
        allow="camera; microphone; display-capture; autoplay; fullscreen; clipboard-write; accelerometer; gyroscope"
        allowFullScreen
      />
    </main>
  );
}
