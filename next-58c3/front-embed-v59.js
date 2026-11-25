/* First screen shown inside the front page (/), swipe between the hero scenes, files fetched ahead,
   the notes under the scenes, and the fourth scene: one CSAT question and its four steps of change,
   the same question, text and badges as the technology page (technology-showcase-v60.js). */
(() => {
  'use strict';
  const RESULT_SCENE = true;
  const home = () => document.querySelector('.cinema');
  const ladder = () => window.DSLadderV60;
  const resultOn = () => RESULT_SCENE && document.documentElement.dataset.design === 'b' && !!ladder();   // the scene's layout exists for this design only

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
  // A swipe on the row of step cards scrolls the cards instead.
  let start = null;
  addEventListener('touchstart', e => {
    const t = e.touches[0];
    start = e.touches.length === 1 && e.target.closest && e.target.closest('.cinema') && !e.target.closest('.fx60-track') ? [t.clientX, t.clientY] : null;
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

  // Fourth scene look, paper cards with a faint grain
  // on the navy stage with a fine weave, violet steps, the technology page's badge. Radii 4 · 8 · 999 only, type on
  // the 12 · 13 · 14 · 15 · 24 · 32 scale, the three shadow steps, light from the upper left.
  // .fx60-steps is placed under the title and above the buttons by place(); data-mode picks the arrangement:
  // row (five across), grid (the original across, the four steps under it) or track (one card at a time, sideways).
  const SANS = '"Pretendard Variable",Pretendard,-apple-system,BlinkMacSystemFont,"Apple SD Gothic Neo","Malgun Gothic",sans-serif';
  const look = document.createElement('style');
  look.textContent = '.fx59-mark{position:absolute;z-index:6;left:0;right:0;bottom:5px;margin:0;text-align:center;font-size:12px;font-weight:400;line-height:1.25;letter-spacing:-.01em;color:rgba(255,255,255,.8);text-shadow:0 1px 2px rgba(8,12,26,.75);white-space:nowrap;pointer-events:none}.fx59-mark:empty{display:none}@media(min-width:900px){.fx59-mark{bottom:9px}}'
    /* the stage: the scene's navy with a fine woven line, about 5 % */
    + 'html[data-design="b"] .cinema[data-scene="3"]{background:url("assets/textures/fx60-panel-weave.webp") 0 0/48px 48px repeat,radial-gradient(ellipse at 80% 28%,#354258 0,#192235 49%,#111b2a 100%)}'
    + 'html[data-design="b"] .cinema[data-scene="3"] #cinema-label{font-size:12px;font-weight:550;letter-spacing:.04em;color:#b9bdd0}'
    + 'html[data-design="b"] .cinema[data-scene="3"] #cinema-title{font-size:32px;line-height:1.25;letter-spacing:-.03em;text-wrap:balance}'
    + '@media(max-width:700px){html[data-design="b"] .cinema[data-scene="3"] #cinema-title{font-size:24px}}'
    + '.fx60-steps{--ds-rule-1:#e3e1da;--ds-sh-1:0 1px 2px rgba(32,37,54,.06);--ds-sh-2:0 2px 6px rgba(32,37,54,.08),0 1px 0 rgba(32,37,54,.04);--ds-sh-3:0 12px 32px rgba(32,37,54,.14);--fx-gapc:16px;'
    + 'position:absolute;z-index:4;left:var(--fx-x,5%);right:var(--fx-x,5%);top:var(--fx-top,190px);display:flex;flex-direction:column;margin:0;font-family:' + SANS + ';color:#fff;word-break:keep-all;-webkit-font-smoothing:antialiased}'
    + '.fx60-track{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:var(--fx-gapc);margin:0;padding:0;list-style:none}'
    /* a sheet of question paper: 1px pale edge, 2px step colour on top, a bright line under the top edge, lifted */
    + '.fx60-card{position:relative;display:grid;grid-template-rows:subgrid;grid-row:span 3;row-gap:0;min-width:0;margin:0;padding:12px 12px 16px;border:1px solid var(--ds-rule-1);border-top:2px solid #bdb5ea;border-radius:8px;background:#fffefb url("assets/textures/fx60-paper-grain.webp") 0 0/128px 128px repeat;color:#2d3136;box-shadow:inset 0 1px 0 #fff,var(--ds-sh-1),var(--ds-sh-3);animation:fx60-in .5s cubic-bezier(.2,.7,.2,1) both;animation-delay:calc(var(--i) * 140ms + 60ms)}'
    + '.fx60-card:nth-child(3){border-top-color:#9d92e0}.fx60-card:nth-child(4){border-top-color:#7f71d6}.fx60-card:nth-child(5){border-top-color:#6253cc}.fx60-card--original{border-top-color:#353a40}'
    + '.fx60-card:not(:last-child)::after{content:"";position:absolute;top:20px;right:calc(var(--fx-gapc) / -2 - 5px);width:7px;height:7px;border-top:2px solid #b4abef;border-right:2px solid #b4abef;transform:rotate(45deg);pointer-events:none}'
    + '.fx60-tag{display:flex;flex-wrap:wrap;align-items:center;align-content:start;gap:4px 8px;margin:0}'
    + '.fx60-tag .tsc60-badge{padding:2px 8px;border-radius:4px;font-size:12px;font-weight:700;line-height:1.5;letter-spacing:.02em;background:#eeebfa;box-shadow:inset 0 0 0 1px #dcd6f3}.fx60-card--original .tsc60-badge{background:#353a40;color:#fff;box-shadow:none}'
    + '.fx60-tag strong{flex:1 1 100%;color:#353a40;font-size:15px;font-weight:700;line-height:1.25;letter-spacing:-.03em}'
    + '.fx60-change{margin:8px 0 0;color:#4b505a;font-size:14px;font-weight:400;line-height:1.5;letter-spacing:-.01em}'
    + '.fx60-card .tsc60-q{margin-top:12px;padding-top:12px;border-top-color:var(--ds-rule-1);font-size:15px;line-height:1.65}'
    + '.fx60-card .tsc60-display{margin:.25em 0 .25em .6em}'
    + '.fx60-card .tsc60-box{margin:.35em 0;padding:4px 8px}'
    + '.fx60-card .tsc60-choices{gap:4px 8px;margin-top:8px!important;font-size:14px}'
    + '.fx60-rail{display:none}'
    + '.fx60-cite{order:4;margin:16px 0 0;color:#b9bdd0;font-size:12px;font-weight:400;line-height:1.5;letter-spacing:-.01em;animation:fx60-in .5s cubic-bezier(.2,.7,.2,1) both;animation-delay:820ms}.fx60-cite span{white-space:nowrap}'
    /* the way on to the technology page: a quiet key on the navy, lit along its top edge */
    + '.fx60-more{position:absolute;right:0;bottom:calc(100% + var(--fx-gap,24px));animation:fx60-in .5s cubic-bezier(.2,.7,.2,1) both;animation-delay:760ms;display:inline-flex;align-items:center;gap:8px;min-height:44px;padding:0 16px;border:1px solid rgba(255,255,255,.4);border-radius:8px;background:linear-gradient(180deg,rgba(255,255,255,.1),rgba(255,255,255,.05));color:#fff!important;font-size:14px;font-weight:700;letter-spacing:-.01em;text-decoration:none;white-space:nowrap;box-shadow:inset 0 1px 0 #ffffff24,0 2px 6px rgba(4,9,22,.24);transition:background-color .15s,border-color .15s,transform .1s}'
    + '.fx60-more:hover{background:linear-gradient(180deg,rgba(255,255,255,.16),rgba(255,255,255,.09));border-color:rgba(255,255,255,.62)}.fx60-more:active{transform:translateY(1px)}'
    + '.fx60-more:focus-visible,.fx60-rail button:focus-visible{outline:2px solid #2448cc;outline-offset:2px;box-shadow:0 0 0 2px #fff}'
    + '.fx60-more span{font-size:15px;line-height:1}'
    + '.fx60-steps[data-mode="row"] .fx60-card .tsc60-choices,.fx60-steps[data-mode="grid"] .fx60-card .tsc60-choices{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:4px 8px}'
    /* the original across the top, the four steps in a row under it */
    + '.fx60-steps[data-mode="grid"]{--fx-gapc:12px}.fx60-steps[data-mode="grid"] .fx60-track{grid-template-columns:repeat(4,minmax(0,1fr))}'
    + '.fx60-steps[data-mode="grid"] .fx60-card .tsc60-q{font-size:14px}.fx60-steps[data-mode="grid"] .fx60-card .tsc60-q .katex{font-size:1em}.fx60-steps[data-mode="grid"] .fx60-card .tsc60-display{margin-left:0}'
    + '.fx60-steps[data-mode="grid"] .fx60-card--original{grid-column:1/-1;grid-template-rows:auto 1fr;grid-template-columns:minmax(0,15em) minmax(0,1fr);column-gap:24px}'
    + '.fx60-steps[data-mode="grid"] .fx60-card--original .fx60-tag,.fx60-steps[data-mode="grid"] .fx60-card--original .fx60-change{grid-column:1}'
    + '.fx60-steps[data-mode="grid"] .fx60-card--original .tsc60-q{grid-column:2;grid-row:1/span 2;margin:0;padding:0 0 0 24px;border-top:0;border-left:1px solid var(--ds-rule-1)}'
    + '.fx60-steps[data-mode="grid"] .fx60-card--original::after{top:auto;right:auto;bottom:calc(var(--fx-gapc) / -2 - 5px);left:50%;margin-left:-4px;transform:rotate(135deg)}'
    /* one at a time, sideways: the next card shows at the edge, the step pills above jump to a card */
    + '.fx60-steps[data-mode="track"]{--fx-gapc:12px}'
    + '.fx60-steps[data-mode="track"] .fx60-rail{display:flex;gap:4px;margin:-6px 0 4px;padding:0;list-style:none;overflow-x:auto;scrollbar-width:none}.fx60-steps[data-mode="track"] .fx60-rail::-webkit-scrollbar{display:none}'
    + '.fx60-rail button{flex:none;display:flex;align-items:center;min-height:44px;padding:0;border:0;background:none;font:inherit;cursor:pointer}'
    + '.fx60-rail button span{display:block;padding:6px 12px;border:1px solid rgba(255,255,255,.34);border-radius:999px;color:#d3ddea;font-size:13px;font-weight:550;line-height:1.5;letter-spacing:-.01em}'
    + '.fx60-rail button[aria-pressed="true"] span{border-color:#fffefb;background:#fffefb;color:#353a40;box-shadow:inset 0 1px 0 #fff,var(--ds-sh-2)}'
    + '.fx60-steps[data-mode="track"] .fx60-track{grid-template-columns:none;grid-auto-flow:column;grid-auto-columns:var(--fx-card,300px);grid-template-rows:auto auto auto;margin:0 calc(var(--fx-xp,24px) * -1);padding:0 var(--fx-xp,24px) 16px;overflow-x:auto;overscroll-behavior-x:contain;scroll-snap-type:x mandatory;scroll-padding-inline:var(--fx-xp,24px);scrollbar-width:none;-webkit-overflow-scrolling:touch}'
    + '.fx60-steps[data-mode="track"] .fx60-track::-webkit-scrollbar{display:none}'
    + '.fx60-steps[data-mode="track"] .fx60-card{scroll-snap-align:start}'
    + '.fx60-steps[data-mode="track"] .fx60-card .tsc60-q{font-size:14px}'
    + '.fx60-steps[data-mode="track"] .fx60-tag{flex-wrap:nowrap}.fx60-steps[data-mode="track"] .fx60-tag strong{flex:0 1 auto}'
    + '.fx60-steps.fx60-nocite .fx60-cite{display:none}'
    + '.fx60-steps.fx60-short .fx60-rail{display:none}.fx60-steps.fx60-short .fx60-track{padding-bottom:8px}'
    + '.fx60-steps[data-mode="track"] .fx60-more{position:static;order:3;align-self:flex-start}'
    + '.fx60-steps[data-mode="track"] .fx60-cite{margin-top:8px}'
    + '@keyframes fx60-in{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:none}}'
    + '@media(prefers-reduced-motion:reduce){.fx60-card,.fx60-more,.fx60-cite{animation:none}}';
  document.head.append(look);
  const mark = () => {
    const stage = home(); if (!stage) return;
    let note = stage.querySelector(':scope > .fx59-mark');
    if (!note) { note = document.createElement('p'); note.className = 'fx59-mark'; stage.append(note); }
    const text = MARKS[stage.dataset.scene] || '';
    if (note.textContent !== text) note.textContent = text;
  };

  // What changed at each step, in a line a student can read at a glance (no solution, no making process).
  const CHANGES = [
    '네 단계 모두 여기서 시작해요.',
    '항 번호와 숫자만 바뀌었어요.',
    '합은 Σ로, 등식은 말로 바꿨어요.',
    '등차수열이 이차함수로 바뀌었어요.',
    '조건이 늘고, 가능한 값이 여럿이에요.'
  ];
  const STEPS = () => {
    const L = ladder(), items = L.items;
    const cards = items.map((item, i) => `<li class="fx60-card${item.original ? ' fx60-card--original' : ''}" style="--i:${i}" id="fx60-step-${i}">
        <p class="fx60-tag"><span class="tsc60-badge">${item.badge}</span><strong>${item.name}</strong></p>
        <p class="fx60-change">${CHANGES[i] || ''}</p>
        ${L.question(item, L.tex)}
      </li>`).join('');
    const rail = items.map((item, i) => `<li><button type="button" data-fx60-step="${i}" aria-controls="fx60-step-${i}" aria-pressed="${i === 0}"><span>${item.original ? '원문항' : item.badge}</span></button></li>`).join('');
    return `<section class="fx60-steps" aria-label="수능 한 문항과 네 단계 변형">
      <ul class="fx60-rail" aria-label="단계로 넘기기">${rail}</ul>
      <ol class="fx60-track">${cards}</ol>
      <a class="fx60-more" href="#technology">더 보기 · 델타스킬 기술 <span aria-hidden="true">→</span></a>
      <p class="fx60-cite"><span>특허 출원 5건(그중 변형 문항 생성 1건)</span> · <span>원문항 출처: 한국교육과정평가원</span> <span>2027학년도 대학수학능력시험</span></p>
    </section>`;
  };

  // Place the steps under the title and above the buttons at the bottom, and choose how the cards sit so that
  // nothing is cut off: five across, the original over four, or one at a time sideways.
  const place = () => {
    const stage = home(), box = stage?.querySelector(':scope > .fx60-steps'); if (!box) return;
    const S = stage.getBoundingClientRect(), title = document.getElementById('cinema-title')?.getBoundingClientRect();
    let floor = S.bottom - 8;
    for (const el of document.querySelectorAll('a, button')) {
      if (box.contains(el)) continue;
      const r = el.getBoundingClientRect();
      if (r.height && r.width && r.top > S.top + S.height * .45) floor = Math.min(floor, r.top);
    }
    const x = title && title.width ? Math.max(16, Math.round(title.left - S.left)) : Math.round(S.width * .05);
    const gap = S.height < 760 ? 16 : 24;
    const top = Math.round((title && title.height ? title.bottom - S.top : 170) + gap);
    const room = floor - S.top - top - (S.height < 700 ? 8 : S.height < 760 ? 12 : 18);
    box.style.setProperty('--fx-x', x + 'px');
    box.style.setProperty('--fx-xp', x + 'px');
    box.style.setProperty('--fx-top', top + 'px');
    box.style.setProperty('--fx-gap', gap + 'px');
    box.style.setProperty('--fx-card', Math.min(340, Math.round(S.width - x * 2 - 24)) + 'px');
    const order = S.width >= 1025 ? ['row', 'grid', 'track'] : S.width >= 600 ? ['grid', 'track'] : ['track'];
    // a set formula does not wrap: a card too narrow for its widest formula does not fit either
    const narrow = () => [...box.querySelectorAll('.fx60-card')].some(card => {
      const edge = card.getBoundingClientRect().right - parseFloat(getComputedStyle(card).paddingRight) + 1;
      return [...card.querySelectorAll('.katex, .tsc60-choices')].some(m => m.getBoundingClientRect().right > edge);
    });
    // Each try drops one thing that is said elsewhere too: the source line (the original card names the
    // question), then on short phones the step buttons (the cards still swipe and the next one shows).
    const tries = [[], ['fx60-nocite'], ['fx60-nocite', 'fx60-short']];
    outer: for (const mode of order) {
      box.dataset.mode = mode;
      for (const extra of tries) {
        if (extra.includes('fx60-short') && mode !== 'track') continue;
        box.classList.remove('fx60-nocite', 'fx60-short');
        box.classList.add(...extra);
        if (box.offsetHeight <= room && (mode === 'track' || !narrow())) break outer;
      }
    }
    box.dataset.fits = String(box.offsetHeight <= room);
  };

  const follow = box => {
    const track = box.querySelector('.fx60-track'), buttons = [...box.querySelectorAll('[data-fx60-step]')];
    const cards = [...track.children];
    let chosen = -1;
    ['pointerdown', 'wheel', 'touchstart', 'keydown'].forEach(ev => track.addEventListener(ev, () => { chosen = -1; }, { passive: true }));
    const pressed = () => {
      const step = cards[1] ? cards[1].offsetLeft - cards[0].offsetLeft : 1;
      let now = Math.max(0, Math.min(cards.length - 1, Math.round(track.scrollLeft / step)));
      if (track.scrollLeft + track.clientWidth >= track.scrollWidth - 2) now = cards.length - 1;
      if (chosen >= 0) now = chosen;
      buttons.forEach((b, i) => b.setAttribute('aria-pressed', String(i === now)));
    };
    let wait = 0;
    track.addEventListener('scroll', () => {
      cancelAnimationFrame(wait); wait = requestAnimationFrame(pressed);
      if (typeof window.playCinema === 'function' && cinemaIndex === 3) window.playCinema();   // someone is reading: the scene stays a while longer
    }, { passive: true });
    buttons.forEach((b, i) => b.addEventListener('click', () => {
      chosen = i; pressed();
      track.scrollTo({ left: cards[i].offsetLeft - cards[0].offsetLeft, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
    }));
  };

  const priorShow = window.showCinema, priorPlay = window.playCinema;
  if (typeof priorShow === 'function' && typeof priorPlay === 'function') {
    const dot = () => {
      const dots = document.querySelector('.cinema-dots');
      if (!resultOn() || !dots || dots.querySelector('[data-cinema="3"]')) return;
      const button = document.createElement('button');
      button.type = 'button'; button.dataset.cinema = '3'; button.setAttribute('aria-label', '네 단계 변형'); button.setAttribute('aria-pressed', 'false'); button.innerHTML = '<span></span>';
      const last = dots.querySelector('[data-cinema="2"]'); if (last) last.after(button); else dots.append(button);
    };
    window.showCinema = function (index) {
      home()?.querySelector(':scope > .fx60-steps')?.remove();
      if (!resultOn() || Number(index) !== 3) { priorShow.apply(this, Number(index) === 3 ? [0] : arguments); dot(); mark(); return; }
      priorShow.call(this, 2); dot();
      const stage = home(); if (!stage) return;
      clearTimeout(cinemaTimer); cinemaIndex = 3; stage.dataset.scene = '3';
      document.getElementById('cinema-product').innerHTML = '';
      document.getElementById('cinema-title').innerHTML = '수능 한 문제를,<br>네 단계 새 문제로.';
      document.getElementById('cinema-label').textContent = '델타스킬 문항 변형';
      stage.insertAdjacentHTML('beforeend', STEPS());
      const box = stage.querySelector(':scope > .fx60-steps');
      ladder().typeset(box);
      place(); follow(box);
      document.fonts?.ready?.then(() => { if (box.isConnected) place(); });
      document.querySelectorAll('[data-cinema]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.cinema === '3')));
      window.DSHeroWorkflowV41?.refresh?.();
      mark();
    };
    window.playCinema = function () {
      if (!resultOn() || !home() || (cinemaIndex !== 2 && cinemaIndex !== 3)) return priorPlay.apply(this, arguments);
      clearTimeout(cinemaTimer);
      if (cinemaPaused || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      // five question cards take longer to read than the other scenes
      cinemaTimer = setTimeout(() => { window.showCinema(cinemaIndex === 2 ? 3 : 0); window.playCinema(); }, cinemaIndex === 3 ? 18000 : 10000);
    };
    let sized = 0;
    addEventListener('resize', () => { cancelAnimationFrame(sized); sized = requestAnimationFrame(place); });
    const content = document.getElementById('content');
    if (content) new MutationObserver(() => { dot(); mark(); }).observe(content, { childList: true });
    dot(); mark();
  }
})();
