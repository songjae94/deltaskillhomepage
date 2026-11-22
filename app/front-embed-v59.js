/* First screen shown inside the front page (/) and swipe between the hero scenes. */
(() => {
  'use strict';
  if (window.top !== window) {
    // Inside the front page: every link opens in the whole window, and leaving the first screen moves the whole window.
    document.documentElement.classList.add('framed');
    const base = document.createElement('base'); base.target = '_top'; document.head.append(base);
    const leave = () => {
      const page = location.hash.replace(/^#/, '').split(/[/?]/)[0];
      if (!page || page === 'home') return;
      try { window.top.location.assign(location.pathname.replace(/index\.html$/, '') + location.hash); } catch { /* another site is framing this page */ }
    };
    addEventListener('hashchange', leave); leave();
  }
  // A sideways swipe on the hero moves to the next or the previous scene (the dots do the same).
  let start = null;
  addEventListener('touchstart', e => {
    const t = e.touches[0];
    start = e.touches.length === 1 && e.target.closest && e.target.closest('.cinema') ? [t.clientX, t.clientY] : null;
  }, { passive: true });
  addEventListener('touchend', e => {
    if (!start) return;
    const t = e.changedTouches[0], dx = t.clientX - start[0], dy = t.clientY - start[1]; start = null;
    if (Math.abs(dx) < 48 || Math.abs(dx) < Math.abs(dy) * 1.5) return;
    const dots = [...document.querySelectorAll('.cinema-dots [data-cinema]')];
    if (dots.length < 2) return;
    const now = Math.max(0, dots.findIndex(d => d.getAttribute('aria-pressed') === 'true'));
    dots[(now + (dx < 0 ? 1 : -1) + dots.length) % dots.length].click();
  }, { passive: true });
  // The second scene shows a print preview that asks for about 4 MB only when the scene comes up, so it stayed
  // blank for a few seconds on a phone. Those files are fetched while the first scene is on screen.
  const AHEAD = [
      "hero-print-embed-v44.css?v=52.1",
      "assets/editorial/paper-flatlay-v15.png",
      "assets/canonical-exam-v36/SNG-2021-M11/%EB%AC%B8%ED%95%AD/%EA%B3%B5%ED%86%B5_1/question.html",
      "assets/canonical-exam-v36/SNG-2021-M11/%EB%AC%B8%ED%95%AD/%EA%B3%B5%ED%86%B5_2/question.html",
      "print-paper-v48.css?v=48.1",
      "assets/canonical-exam-v36/SNG-2021-M11/%EB%A0%8C%EB%8D%94/assets/katex-embed.css",
      "assets/canonical-exam-v36/SNG-2022-M11/%EB%AC%B8%ED%95%AD/%EA%B3%B5%ED%86%B5_1/question.html",
      "assets/canonical-exam-v36/SNG-2021-M11/%EB%AC%B8%ED%95%AD/%EA%B3%B5%ED%86%B5_1/solution.html",
      "assets/canonical-exam-v36/SNG-2022-M11/%EB%AC%B8%ED%95%AD/%EA%B3%B5%ED%86%B5_1/solution.html",
      "assets/canonical-exam-v36/SNG-2023-M11/%EB%AC%B8%ED%95%AD/%EA%B3%B5%ED%86%B5_1/solution.html",
      "assets/canonical-exam-v36/SNG-2024-M11/%EB%AC%B8%ED%95%AD/%EA%B3%B5%ED%86%B5_1/solution.html",
      "assets/canonical-exam-v36/SNG-2022-M11/%EB%A0%8C%EB%8D%94/assets/katex-embed.css",
      "assets/canonical-exam-v36/SNG-2023-M11/%EB%A0%8C%EB%8D%94/assets/katex-embed.css",
      "assets/canonical-exam-v36/SNG-2024-M11/%EB%A0%8C%EB%8D%94/assets/katex-embed.css"
  ];
  let warmed = false;
  const warm = () => {
    if (warmed || !document.querySelector('.cinema') || navigator.connection?.saveData) return;
    warmed = true;
    for (const url of AHEAD) fetch(url, { priority: 'low' }).catch(() => {});
  };
  if (document.readyState === 'complete') setTimeout(warm, 1200); else addEventListener('load', () => setTimeout(warm, 1200));
})();
