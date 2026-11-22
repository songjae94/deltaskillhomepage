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
  // Required notes on the hero: the person is AI-made; a scene that shows a screen working on the site says so.
  const MARKS = { 0: 'AI로 만든 가상 인물입니다', 2: '델타스킬 실제 화면' };
  const look = document.createElement('style');
  look.textContent = '.fx59-mark{position:absolute;z-index:6;top:68px;right:20px;margin:0;padding:5px 10px;border-radius:999px;background:rgba(16,23,43,.68);color:#fff;font-size:12px;font-weight:500;line-height:1.3;letter-spacing:-.01em;white-space:nowrap;pointer-events:none}.fx59-mark:empty{display:none}@media(min-width:900px){.fx59-mark{top:84px;right:58px;font-size:13px}}';
  document.head.append(look);
  const mark = () => {
    const stage = document.querySelector('.cinema'); if (!stage) return;
    let note = stage.querySelector(':scope > .fx59-mark');
    if (!note) { note = document.createElement('p'); note.className = 'fx59-mark'; stage.append(note); }
    const text = MARKS[stage.dataset.scene] || '';
    if (note.textContent !== text) note.textContent = text;
  };
  new MutationObserver(mark).observe(document.documentElement, { subtree: true, childList: true, attributes: true, attributeFilter: ['data-scene'] });
  mark();
})();
