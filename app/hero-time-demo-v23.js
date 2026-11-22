/* Hand-drawn graph and area calculation for the first full-length item. */
(() => {
  'use strict';
  if (window.HeroTimeDemoV23 || typeof window.cinemaScreen !== 'function') return;
  const beforeScreen = window.cinemaScreen;
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const question = regularBank.find(item => item.id === 'FINALS-EASY');
  const seen = new Set();
  // Use the same deduplication and total as the full-length mode.
  const total = [...regularBank, ...timerBank].filter(item => {
    if (!item || !Array.isArray(item.options) || typeof item.question !== 'string') return false;
    const key = item.question.replace(/\s+/g, '') + JSON.stringify([...item.options].sort());
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  }).slice(0, 25).length;

  const glyph = {
    1: ['M2 7 Q6 5 9 2 L8 23'],
    3: ['M2 5 C5 1 13 0 14 5 C15 9 10 11 7 12 C11 11 16 13 15 17 C14 22 8 25 2 21'],
    4: ['M11 2 L2 16 L17 16', 'M13 3 L12 23'],
    6: ['M13 3 C8 1 4 7 3 13 C1 20 5 24 10 22 C15 21 17 14 12 12 C9 11 5 13 3 16'],
    '−': ['M1 13 L16 13'],
    '=': ['M1 10 L17 10', 'M1 17 L17 17'],
    '(': ['M9 0 C3 7 2 17 7 25'],
    ')': ['M1 0 C7 7 7 17 2 25']
  };
  const phases = {
    graph: [850, 2700],
    formula: [3090, 6500],
    circle: [6500, 7330]
  };
  let product = null;
  let observer = null;
  let live = null;
  let clock = null;
  let answer = null;
  let pencil = null;
  let working = null;
  let strokes = [];
  let phaseUnits = {};
  let shownTime = '';
  let started = null;
  let elapsed = 0;
  let frame = 0;
  let inkSettled = false;

  const enabled = () => document.documentElement.dataset.design === 'b' && total === 25 && question;
  const paused = () => typeof cinemaPaused !== 'undefined' && cinemaPaused;
  const elapsedNow = () => elapsed + (started === null ? 0 : performance.now() - started);
  const stamp = seconds => `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;

  function ink(d, phase, x = 0, y = 0, scale = 1) {
    return `<path data-ink data-phase="${phase}" data-x="${x}" data-y="${y}" data-scale="${scale}" pathLength="1" d="${d}" transform="translate(${x} ${y}) scale(${scale})"/>`;
  }

  function handwriting() {
    // Coordinates map (x, y) to (36 + 38x, 67 - 27y).
    const graph = `
      <path class="ht23-graph-details ht23-region" d="M74 67 Q112 121 150 67 Z"/>
      <g class="ht23-axes">${ink('M14 67 H192', 'graph')}${ink('M36 103 V14', 'graph')}</g>
      <g class="ht23-curve">${ink('M55 33.25 Q112 154.75 169 33.25', 'graph')}</g>
      <g class="ht23-graph-details ht23-graph-labels">
        <path d="M194 67 186 64 186 70 Z M36 12 33 20 39 20 Z"/>
        <text class="ht23-variable" x="194" y="85">x</text>
        <text class="ht23-variable" x="21" y="19">y</text>
        <text x="22" y="85">O</text>
        <text x="74" y="85" text-anchor="middle">1</text>
        <text x="150" y="85" text-anchor="middle">3</text>
        <text x="55" y="25"><tspan class="ht23-variable">y</tspan>=(<tspan class="ht23-variable">x</tspan>−1)(<tspan class="ht23-variable">x</tspan>−3)</text>
      </g>`;
    const letter = (symbol, x, y, scale) => glyph[symbol].map(d => ink(d, 'formula', x, y, scale)).join('');
    const formula = [
      letter('6', 248, 68), ink('M209 59 Q256 58 305 59', 'formula'),
      letter('(', 211, 29), letter('3', 224, 30), letter('−', 246, 30),
      letter('1', 268, 30), letter(')', 280, 29), letter('3', 290, 22, .58),
      letter('=', 323, 46), letter('3', 364, 68),
      ink('M358 59 Q372 58 387 59', 'formula'), letter('4', 365, 30),
      ink('M392 37 C407 59 400 91 380 96 C363 101 346 89 349 59 C350 31 374 20 392 35', 'circle')
    ].join('');
    return `<div class="ht23-working"><svg class="ht23-ink" viewBox="0 0 420 118" aria-hidden="true">
      ${graph}<g class="ht23-strokes">${formula}</g>
      <g class="ht23-pencil" data-ht23-pencil visibility="hidden">
        <path d="M0 0 4 -6 33 -21 Q36 -23 38 -20 L39 -18 Q40 -15 37 -14 L9 0 Z" fill="#fffefd" stroke="#898d94" stroke-width=".8"/>
        <path d="M0 0 4 -6 9 0 Z" fill="#969aa1"/><path d="M0 0 2 -3 4 0 Z" fill="#3c4046"/>
      </g>
    </svg><div class="ht23-solution" data-ht23-solution hidden>포물선은 x축과 x가 1과 3인 점에서 만난다. 그 사이에 칠한 영역의 넓이는 두 근의 거리 3 빼기 1을 세제곱하여 6으로 나눈 값, 즉 3분의 4이다. 정답은 ①이다.</div></div>`;
  }

  function markup() {
    const options = question.options.map((option, i) =>
      `<span data-ht23-option="${i}"><small>${['①', '②', '③', '④', '⑤'][i]}</small>${math(option)}</span>`
    ).join('');
    return `<div class="ht23-demo" role="group" aria-label="타임어택 50분 25문항 화면 시연. 실제 학습 기록에 저장되지 않습니다.">
      <div class="ht23-heading"><div><span class="ht23-brand">DELTASKILL</span><strong>타임어택</strong></div><span>화면 시연</span></div>
      <div class="ht23-timing"><div><span class="ht23-label">남은 시간</span><time class="ht23-clock" data-ht23-clock>50:00</time></div><div class="ht23-total"><strong>총 <b>25</b>문항</strong><span data-ht23-position>01번 풀이 중</span></div></div>
      <div class="ht23-paper"><div class="ht23-paper-top"><strong data-ht23-number>01</strong><span>미적분Ⅰ · 정적분</span></div><div class="ht23-question">${question.question}</div>
      ${handwriting()}<div class="ht23-options">${options}</div></div>
      <div class="ht23-bottom"><div class="ht23-progress" aria-label="시연 문항 진행"><span class="is-current">1</span><span>2</span><span>3</span><span>4</span><span>5</span><i>…</i><span>25</span></div></div>
    </div>`;
  }

  function replaceImage(root) {
    const image = root.querySelector('.ip19-device .ip19-glass > img.ip19-screen[src*="time-screen"]');
    if (!image) return false;
    const holder = document.createElement('template');
    holder.innerHTML = markup();
    image.replaceWith(holder.content.firstElementChild);
    const device = root.querySelector('.ip19-device');
    device?.setAttribute('role', 'group');
    device?.setAttribute('aria-label', '타임어택 화면 시연. 50분, 총 25문항.');
    return true;
  }

  window.cinemaScreen = function(index) {
    const html = beforeScreen.apply(this, arguments);
    if (Number(index) !== 2 || !enabled()) return html;
    const template = document.createElement('template');
    template.innerHTML = html;
    return replaceImage(template.content) ? template.innerHTML : html;
  };

  function stop() {
    if (started === null) return;
    elapsed = elapsedNow();
    started = null;
    cancelAnimationFrame(frame);
  }

  function setStroke(stroke, progress) {
    if (progress === stroke.progress) return;
    stroke.progress = progress;
    stroke.path.style.strokeDashoffset = 1 - progress;
    // Prevent a dashed stroke's round cap from leaving a dot before the pen arrives.
    stroke.path.style.visibility = progress ? 'visible' : 'hidden';
  }

  function paintInk(ms) {
    const revealed = motion.matches || ms >= phases.circle[1];
    if (revealed && inkSettled) return;
    working.classList.toggle('has-graph', revealed || ms >= phases.graph[1]);
    if (inkSettled !== revealed) {
      inkSettled = revealed;
      answer.classList.toggle('is-selected', revealed);
      live.querySelector('[data-ht23-solution]').hidden = !revealed;
      live.querySelector('[data-ht23-position]').textContent = revealed ? '01번 답 선택' : '01번 풀이 중';
    }
    const phaseProgress = {};
    for (const [phase, [start, end]] of Object.entries(phases)) {
      phaseProgress[phase] = (ms - start) / (end - start) * phaseUnits[phase];
    }
    let active = null;
    for (const stroke of strokes) {
      const progress = revealed ? 1 : Math.max(0, Math.min(1, (phaseProgress[stroke.phase] - stroke.offset) / stroke.units));
      setStroke(stroke, progress);
      if (progress > 0 && progress < 1) active = stroke;
    }
    pencil.setAttribute('visibility', active ? 'visible' : 'hidden');
    if (active) {
      const tip = active.path.getPointAtLength(active.progress * active.length);
      pencil.setAttribute('transform', `translate(${active.x + tip.x * active.scale} ${active.y + tip.y * active.scale})`);
    }
  }

  function paint() {
    if (!live?.isConnected) return;
    const ms = elapsedNow();
    const time = stamp(Math.max(0, 3000 - Math.floor(ms / 1000)));
    if (time !== shownTime) {
      clock.textContent = time;
      shownTime = time;
    }
    paintInk(ms);
  }

  function tick() {
    paint();
    frame = requestAnimationFrame(tick);
  }

  function syncPlayback() {
    const stage = document.querySelector('.home-body .cinema');
    if (!enabled() || !live?.isConnected || stage?.dataset.scene !== '2' || document.hidden || paused() || motion.matches) {
      stop();
      paint();
      return;
    }
    if (started !== null) return;
    started = performance.now();
    tick();
  }

  function refresh() {
    const next = document.querySelector('.home-body .cinema[data-scene="2"] .ht23-demo');
    if (next !== live) {
      stop();
      live = next;
      elapsed = 0;
      shownTime = '';
      inkSettled = false;
      if (live) {
        clock = live.querySelector('[data-ht23-clock]');
        answer = live.querySelector(`[data-ht23-option="${question.answer}"]`);
        pencil = live.querySelector('[data-ht23-pencil]');
        working = live.querySelector('.ht23-working');
        phaseUnits = {graph: 0, formula: 0, circle: 0};
        const paths = live.querySelectorAll('[data-ink]');
        strokes = Array.from(paths, path => {
          const {x, y, scale, phase} = path.dataset;
          const length = path.getTotalLength();
          const units = Math.max(7, length * Number(scale));
          const stroke = {path, length, x: Number(x), y: Number(y), scale: Number(scale), units, phase, offset: phaseUnits[phase]};
          phaseUnits[phase] += units + (phase === 'circle' ? 0 : 1.8);
          return stroke;
        });
        paint();
      }
    }
    syncPlayback();
  }

  function mount() {
    const next = document.getElementById('cinema-product');
    if (next !== product) {
      observer?.disconnect();
      product = next;
      if (product) {
        // Observe slide replacement, not countdown or math-renderer updates.
        observer = new MutationObserver(refresh);
        observer.observe(product, {childList: true});
      }
    }
    if (enabled() && product && !product.querySelector('.ht23-demo')) replaceImage(product);
    refresh();
  }

  const content = document.getElementById('content');
  if (content) new MutationObserver(mount).observe(content, {childList: true});
  document.addEventListener('visibilitychange', syncPlayback);
  document.addEventListener('click', event => {
    if (event.target.closest('[data-cinema-pause]')) queueMicrotask(syncPlayback);
  });
  motion.addEventListener?.('change', syncPlayback);
  window.addEventListener('pagehide', stop);
  window.addEventListener('pageshow', mount);
  window.HeroTimeDemoV23 = {refresh: mount, snapshot: () => ({
    running: started !== null, elapsedMilliseconds: Math.floor(elapsedNow()), questionIndex: live ? 0 : -1, total,
    graphComplete: !!live && working.classList.contains('has-graph'),
    answerRevealed: !!live && inkSettled
  })};
  mount();
})();
