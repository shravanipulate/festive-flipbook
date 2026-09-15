(() => {
  if (window.__birthdayUpgradeV5Loaded) return;
  window.__birthdayUpgradeV5Loaded = true;
  const AUDIO_SRC = "https://cdn.jsdelivr.net/gh/shravanipulate/festive-flipbook@main/screen-capture%20%282%29_%5Bcut_1sec%5D.mp3?audio=2";
  const isHome = () => /enter the archive/i.test(document.body?.innerText || "");
  const replaceHomeTrafficAudio = () => {
    if (!isHome()) return false;
    const audios = [...document.querySelectorAll("audio")];
    if (!audios.length) return false;
    const candidates = audios.filter((a) => {
      const src = a.currentSrc || a.src || "";
      return !src.includes("screen-capture%20%282%29_%5Bcut_1sec%5D.mp3");
    });
    const homeAudio = candidates.find((a) => {
      const r = a.getBoundingClientRect();
      return r.width > 0 || r.height > 0 || a.autoplay || !a.paused;
    }) || candidates[0] || audios[0];
    if (!homeAudio || homeAudio.dataset.birthdayHomeAudio === "2") return true;
    const wasPlaying = !homeAudio.paused;
    const time = homeAudio.currentTime || 0;
    homeAudio.pause();
    homeAudio.src = AUDIO_SRC;
    homeAudio.dataset.birthdayHomeAudio = "2";
    homeAudio.load();
    const resume = () => {
      try { homeAudio.currentTime = Math.min(time, homeAudio.duration || time); } catch (_) {}
      if (wasPlaying || homeAudio.autoplay) homeAudio.play().catch(() => {});
      homeAudio.removeEventListener("loadedmetadata", resume);
    };
    homeAudio.addEventListener("loadedmetadata", resume, { once: true });
    return true;
  };
  const boot = () => {
    replaceHomeTrafficAudio();
    setTimeout(replaceHomeTrafficAudio, 100);
    setTimeout(replaceHomeTrafficAudio, 500);
    setTimeout(replaceHomeTrafficAudio, 1500);
    setTimeout(replaceHomeTrafficAudio, 3000);
  };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot, { once: true });
  else boot();
})();
