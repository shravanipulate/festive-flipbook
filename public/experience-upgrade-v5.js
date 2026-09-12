(() => {
  if (window.__birthdayUpgradeV5Loaded) return;
  window.__birthdayUpgradeV5Loaded = true;
  const AUDIO_SRC = "/screen-capture%20%282%29_%5Bcut_1sec%5D.mp3";
  const isHome = () => /enter the archive/i.test(document.body?.innerText || "");
  const replaceHomeTrafficAudio = () => {
    if (!isHome()) return false;
    const audios = [...document.querySelectorAll("audio")];
    if (!audios.length) return false;
    const homeAudio = audios.find((a) => {
      const r = a.getBoundingClientRect();
      return r.width > 0 || r.height > 0 || a.autoplay || !a.paused;
    }) || audios[0];
    if (homeAudio.dataset.birthdayHomeAudio === "1") return true;
    const wasPlaying = !homeAudio.paused;
    homeAudio.src = AUDIO_SRC;
    homeAudio.dataset.birthdayHomeAudio = "1";
    homeAudio.load();
    if (wasPlaying || homeAudio.autoplay) homeAudio.play().catch(() => {});
    return true;
  };
  const boot = () => {
    replaceHomeTrafficAudio();
    setTimeout(replaceHomeTrafficAudio, 250);
    setTimeout(replaceHomeTrafficAudio, 1000);
    setTimeout(replaceHomeTrafficAudio, 2500);
  };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot, { once: true });
  else boot();
  new MutationObserver(replaceHomeTrafficAudio).observe(document.body, { subtree: true, childList: true });
})();
