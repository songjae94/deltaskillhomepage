/* First screen shown inside the front page (/), swipe between the hero scenes, files fetched ahead,
   the notes under the scenes, and the fourth scene (one original and one result, as pictures only). */
(() => {
  'use strict';
  const RESULT_SCENE = false;
  const home = () => document.querySelector('.cinema');

  if (window.top !== window) {
    // Inside the front page: links open in the whole window, and leaving the first screen moves the whole window.
    document.documentElement.classList.add('framed');
    const base = document.createElement('base'); base.target = '_top'; document.head.append(base);
    document.querySelector('a.skip')?.setAttribute('target', '_self');   // the skip link stays inside this screen
    const leave = () => {
      const page = location.hash.replace(/^#/, '').split(/[/?]/)[0];
      if (!page || page === 'home' || page === 'content') return;
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
  // blank for a few seconds on a phone. Those files are fetched one after another while the first scene is on
  // screen; the fetching stops when the first screen is left, and is skipped when the phone saves data.
  const AHEAD = ["assets/editorial/paper-flatlay-v15.png", "hero-print-embed-v44.css?v=52.1", "assets/canonical-exam-v36/SNG-2021-M11/%EB%AC%B8%ED%95%AD/%EA%B3%B5%ED%86%B5_1/question.html", "assets/canonical-exam-v36/SNG-2021-M11/%EB%AC%B8%ED%95%AD/%EA%B3%B5%ED%86%B5_2/question.html", "print-paper-v48.css?v=48.1", "assets/canonical-exam-v36/SNG-2022-M11/%EB%AC%B8%ED%95%AD/%EA%B3%B5%ED%86%B5_1/question.html", "assets/canonical-exam-v36/SNG-2021-M11/%EB%AC%B8%ED%95%AD/%EA%B3%B5%ED%86%B5_1/solution.html", "assets/canonical-exam-v36/SNG-2022-M11/%EB%AC%B8%ED%95%AD/%EA%B3%B5%ED%86%B5_1/solution.html", "assets/canonical-exam-v36/SNG-2023-M11/%EB%AC%B8%ED%95%AD/%EA%B3%B5%ED%86%B5_1/solution.html", "assets/canonical-exam-v36/SNG-2024-M11/%EB%AC%B8%ED%95%AD/%EA%B3%B5%ED%86%B5_1/solution.html", "assets/canonical-exam-v36/SNG-2021-M11/%EB%A0%8C%EB%8D%94/assets/katex-embed.css", "assets/canonical-exam-v36/SNG-2022-M11/%EB%A0%8C%EB%8D%94/assets/katex-embed.css", "assets/canonical-exam-v36/SNG-2023-M11/%EB%A0%8C%EB%8D%94/assets/katex-embed.css", "assets/canonical-exam-v36/SNG-2024-M11/%EB%A0%8C%EB%8D%94/assets/katex-embed.css"];
  let warmed = false;
  const warm = async () => {
    if (warmed || !home() || navigator.connection?.saveData) return;
    warmed = true;
    for (const url of AHEAD) {
      if (!home()) return;
      try { await fetch(url, { priority: 'low' }); } catch { return; }
    }
  };
  if (document.readyState === 'complete') setTimeout(warm, 2500); else addEventListener('load', () => setTimeout(warm, 2500));

  // Notes at the bottom edge of the hero, small and faint: the person is AI-made; a scene that shows something
  // that works on the site today says so.
  const MARKS = { 0: 'AI로 만든 가상 인물입니다', 2: '델타스킬 실제 화면', 3: '델타스킬 실제 결과' };
  const look = document.createElement('style');
  look.textContent = '.fx59-mark{position:absolute;z-index:6;left:0;right:0;bottom:5px;margin:0;text-align:center;font-size:11px;font-weight:400;line-height:1.2;letter-spacing:-.01em;color:rgba(255,255,255,.76);text-shadow:0 1px 2px rgba(8,12,26,.75);white-space:nowrap;pointer-events:none}.fx59-mark:empty{display:none}@media(min-width:900px){.fx59-mark{bottom:9px;font-size:12px}}'
    + '.fx59-result{display:grid;grid-template-columns:minmax(0,1fr) auto minmax(0,1fr);gap:16px;align-items:center;width:min(1040px,92vw);margin:0 auto}.fx59-result figure{margin:0;padding:12px 16px 14px;border-radius:10px;background:#fff;box-shadow:0 14px 34px rgba(10,16,37,.28)}.fx59-result figcaption{margin:0 0 6px;font-size:12px;font-weight:600;letter-spacing:-.01em;color:#5b6478}.fx59-result img{display:block;width:100%;height:auto}.fx59-arrow{font-size:22px;color:#fff;opacity:.85}.fx59-scale{grid-column:1/-1;margin:2px 0 0;text-align:center;font-size:13px;color:rgba(255,255,255,.86)}@media(max-width:760px){.fx59-result{grid-template-columns:minmax(0,1fr);gap:8px;width:min(430px,90vw)}.fx59-arrow{justify-self:center;transform:rotate(90deg);font-size:18px}.fx59-result figure{padding:9px 12px 10px}.fx59-scale{font-size:12px}}';
  document.head.append(look);
  const mark = () => {
    const stage = home(); if (!stage) return;
    let note = stage.querySelector(':scope > .fx59-mark');
    if (!note) { note = document.createElement('p'); note.className = 'fx59-mark'; stage.append(note); }
    const text = MARKS[stage.dataset.scene] || '';
    if (note.textContent !== text) note.textContent = text;
  };

  const priorShow = window.showCinema, priorPlay = window.playCinema;
  if (typeof priorShow === 'function' && typeof priorPlay === 'function') {
    const RESULT = '<div class="fx59-result"><figure><figcaption>원문 · 2027학년도 수능 수학 공통 12번</figcaption><img src="assets/front-v59/paper-original.webp" width="0" height="0" alt="2027학년도 수능 수학 공통 12번 원문"></figure><span class="fx59-arrow" aria-hidden="true">→</span><figure><figcaption>변형 결과 · 표현을 바꿔 새로 만든 문항</figcaption><img src="assets/front-v59/paper-result.webp" width="0" height="0" alt="같은 문항에서 표현을 바꿔 새로 만든 변형 문항"></figure><p class="fx59-scale">변형 관련 특허 출원 5건 · 2026년 11월 12일</p></div>';
    const dot = () => {
      const dots = document.querySelector('.cinema-dots');
      if (!RESULT_SCENE || !dots || dots.querySelector('[data-cinema="3"]')) return;
      const button = document.createElement('button');
      button.type = 'button'; button.dataset.cinema = '3'; button.setAttribute('aria-label', '변형 문항'); button.setAttribute('aria-pressed', 'false'); button.innerHTML = '<span></span>';
      const last = dots.querySelector('[data-cinema="2"]'); if (last) last.after(button); else dots.append(button);
    };
    window.showCinema = function (index) {
      if (!RESULT_SCENE || Number(index) !== 3) { priorShow.apply(this, Number(index) === 3 ? [0] : arguments); dot(); mark(); return; }
      priorShow.call(this, 2); dot();
      const stage = home(); if (!stage) return;
      clearTimeout(cinemaTimer); cinemaIndex = 3; stage.dataset.scene = '3';
      document.getElementById('cinema-product').innerHTML = RESULT;
      document.getElementById('cinema-title').innerHTML = '기출을 분석해,<br>새 문항으로.';
      document.getElementById('cinema-label').textContent = '변형 문항';
      document.querySelectorAll('[data-cinema]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.cinema === '3')));
      window.DSHeroWorkflowV41?.refresh?.();
      mark();
    };
    window.playCinema = function () {
      if (!RESULT_SCENE || !home() || (cinemaIndex !== 2 && cinemaIndex !== 3)) return priorPlay.apply(this, arguments);
      clearTimeout(cinemaTimer);
      if (cinemaPaused || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      cinemaTimer = setTimeout(() => { window.showCinema(cinemaIndex === 2 ? 3 : 0); window.playCinema(); }, 10000);
    };
    const content = document.getElementById('content');
    if (content) new MutationObserver(() => { dot(); mark(); }).observe(content, { childList: true });
    dot(); mark();
  }
})();
