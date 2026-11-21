/* Play the approved portrait with its media-specific timing and smile ending. */
(() => {
  'use strict';
  if (window.HeroPortraitVideoV27) return;
  const previousPlay = window.playCinema;
  const previousShow = window.showCinema;
  const content = document.getElementById('content');
  const intro = document.getElementById('intro');
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const PLAYBACK_RATE = window.DSHeroSmileV27?.playbackRate === 1 ? 1 : .5;
  const SMILE_HOLD_MS = window.DSHeroSmileV27?.holdMs === 150 ? 150 : 850;
  let video = null;
  let pending = false;
  const stage = () => document.querySelector('.home-body .cinema');
  const isBrand = () => document.documentElement.dataset.design === 'b' && stage()?.dataset.scene === '0';
  const canPlay = () => isBrand() && !cinemaPaused && !document.hidden && !motion.matches && intro.hidden;

  function schedule() {
    clearTimeout(cinemaTimer);
    if (!canPlay() || !video || !Number.isFinite(video.duration)) return;
    const remaining = Math.max(0, video.duration - video.currentTime) * 1000 / video.playbackRate + SMILE_HOLD_MS;
    cinemaTimer = setTimeout(() => {
      if (!canPlay()) return;
      // Buffering must never advance the scene before the front-facing smile.
      if (!video.ended) { schedule(); return; }
      window.showCinema(1);
      window.playCinema();
    }, remaining);
  }

  function sync() {
    if (!video) return;
    if (!canPlay()) {
      video.pause();
      if (isBrand()) clearTimeout(cinemaTimer);
      return;
    }
    if (video.ended) { schedule(); return; }
    if (!video.paused) { schedule(); return; }
    if (pending) return;
    pending = true;
    const current = video;
    current.play().then(() => {
      pending = false;
      if (current !== video || !canPlay()) { current.pause(); return; }
      schedule();
    }).catch(() => {
      pending = false;
      if (current !== video || !isBrand()) return;
      // Keep the existing replay control available if autoplay is blocked.
      cinemaPaused = true;
      const control = document.querySelector('[data-cinema-pause]');
      if (control) { control.textContent = '▶'; control.setAttribute('aria-label', '배경 재생'); }
    });
  }

  function mount() {
    const portrait = document.querySelector('html[data-design="b"] .home-body .cinema-portrait');
    if (portrait?.querySelector('video') === video && video) return;
    video?.pause();
    video = null;
    pending = false;
    if (!portrait) return;
    const clip = document.createElement('video');
    clip.className = 'hp27-film';
    clip.muted = true;
    clip.defaultMuted = true;
    clip.playsInline = true;
    clip.preload = 'auto';
    clip.defaultPlaybackRate = PLAYBACK_RATE;
    clip.playbackRate = PLAYBACK_RATE;
    clip.poster = window.DSHeroSmileV27?.poster || 'video/seedance25-00s.jpg';
    // The existing member-preview server intentionally serves a small extension
    // allowlist. A public media bundle keeps its active login sessions intact.
    if (window.DSHeroSmileV27?.src) clip.src = window.DSHeroSmileV27.src;
    else for (const [file, type] of [['webm','video/webm'], ['mp4','video/mp4']]) {
      const source = document.createElement('source');
      source.src = `video/model01-smile-front-v27.${file}`;
      source.type = type;
      clip.append(source);
    }
    clip.setAttribute('aria-hidden', 'true');
    clip.setAttribute('disablepictureinpicture', '');
    portrait.setAttribute('aria-label', '미소 짓는 학생이 태블릿으로 공부하는 모습');
    portrait.classList.add('hp27-portrait');
    portrait.append(clip);
    video = clip;
    clip.addEventListener('loadeddata', sync);
    clip.addEventListener('error', () => { clip.dataset.loadError = String(clip.error?.code || 'unknown'); });
    clip.addEventListener('playing', schedule);
    clip.addEventListener('ended', schedule);
    sync();
  }

  window.showCinema = function(index) {
    previousShow.apply(this, arguments);
    if (Number(index) === 0 && video) video.currentTime = 0;
    sync();
  };
  window.playCinema = function() {
    if (!isBrand() || !video) { video?.pause(); return previousPlay.apply(this, arguments); }
    clearTimeout(cinemaTimer);
    sync();
  };
  if (content) new MutationObserver(mount).observe(content, {childList:true});
  if (intro) new MutationObserver(sync).observe(intro, {attributes:true, attributeFilter:['hidden']});
  new MutationObserver(mount).observe(document.documentElement, {attributes:true, attributeFilter:['data-design']});
  document.addEventListener('visibilitychange', () => { if (isBrand()) sync(); });
  motion.addEventListener?.('change', sync);
  window.addEventListener('pagehide', () => video?.pause());
  window.addEventListener('pageshow', mount);
  window.HeroPortraitVideoV27 = Object.freeze({mount});
  mount();
})();
