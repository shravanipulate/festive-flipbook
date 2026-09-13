(() => {
  if (window.__birthdayRecorderGuardV20Loaded) return;
  window.__birthdayRecorderGuardV20Loaded = true;

  let captureStream = null;
  let bypassNavigationOnce = false;
  let finalStopScheduled = false;

  const originalGetDisplayMedia = navigator.mediaDevices?.getDisplayMedia?.bind(navigator.mediaDevices);
  if (originalGetDisplayMedia) {
    navigator.mediaDevices.getDisplayMedia = async function(options) {
      const stream = await originalGetDisplayMedia(options);
      captureStream = stream;
      const track = stream.getVideoTracks()[0];
      track?.addEventListener('ended', () => { captureStream = null; }, {once:true});
      return stream;
    };
  }

  function isNext(el){
    if(!el || el.closest('#experience-recorder-controls') || el.closest('#experience-recorder-modal')) return false;
    if(el.id === 'navNext') return true;
    const text = String(el.innerText || el.textContent || el.value || '').replace(/\s+/g,' ').trim();
    return /^(ahead|next|continue)\s*[→↗›»]?$/.test(text);
  }

  function recordingLooksActive(){
    return !!document.querySelector('#experience-recorder-live.show');
  }

  // v16 listens for every Next click at capture phase. Once recording is active,
  // do not let that listener treat the next arrow as a new recording request.
  // Re-fire the same navigation after one guarded synthetic click instead.
  document.addEventListener('click', e => {
    const el = e.target?.closest?.('button,a,[role="button"],input[type="button"],input[type="submit"]');
    if(!isNext(el) || !recordingLooksActive()) return;
    if(bypassNavigationOnce) {
      bypassNavigationOnce = false;
      return;
    }
    e.preventDefault();
    e.stopImmediatePropagation();
    bypassNavigationOnce = true;
    try { el.click(); } catch(_) { bypassNavigationOnce = false; }
  }, true);

  function activeSlides(){
    return [...document.querySelectorAll('.slide')];
  }

  function finalSlide(){
    const slides = activeSlides();
    if(!slides.length) return null;
    return slides.find(s => s.classList.contains('active')) === slides[slides.length - 1] ? slides[slides.length - 1] : null;
  }

  function animationTimeMs(root){
    let max = 0;
    const nodes = [root, ...root.querySelectorAll('*')];
    for(const el of nodes){
      const cs = getComputedStyle(el);
      const parseList = value => value.split(',').map(v => {
        v = v.trim();
        if(v.endsWith('ms')) return parseFloat(v) || 0;
        if(v.endsWith('s')) return (parseFloat(v) || 0) * 1000;
        return 0;
      });
      const ad = parseList(cs.animationDuration);
      const al = parseList(cs.animationDelay);
      const td = parseList(cs.transitionDuration);
      const tl = parseList(cs.transitionDelay);
      max = Math.max(max, ...ad.map((x,i)=>x+(al[i]||al[al.length-1]||0)), ...td.map((x,i)=>x+(tl[i]||tl[tl.length-1]||0)));
    }
    return max;
  }

  function stopAfterFinalPage(){
    if(finalStopScheduled || !captureStream) return;
    const slide = finalSlide();
    if(!slide) return;
    finalStopScheduled = true;
    const wait = Math.min(Math.max(animationTimeMs(slide) + 700, 1800), 12000);

    const stop = () => {
      finalStopScheduled = false;
      if(!captureStream) return;
      const track = captureStream.getVideoTracks()[0];
      if(track && track.readyState === 'live') track.stop();
    };

    setTimeout(stop, wait);
  }

  const observer = new MutationObserver(() => {
    if(recordingLooksActive()) stopAfterFinalPage();
  });
  observer.observe(document.body, {subtree:true, childList:true, attributes:true, attributeFilter:['class']});

  const poll = setInterval(() => {
    if(recordingLooksActive()) stopAfterFinalPage();
    else if(!captureStream) finalStopScheduled = false;
  }, 350);

  window.addEventListener('pagehide', () => clearInterval(poll), {once:true});
})();
