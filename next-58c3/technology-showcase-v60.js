/* Technology page: one 2027 CSAT question and its four steps of change, set on screen with the bundled KaTeX. */
(() => {
  'use strict';

  if (typeof route !== 'function' || typeof header !== 'function') return;
  const previousRoute = route;

  // One question, four steps. Text is set on screen only; no data file is fetched.
  const circled = ['①', '②', '③', '④', '⑤'];
  const ladderItems = [
    {
      badge: '원문항', name: '2027학년도 수능 공통 12번', original: true,
      body: [
        '등차수열 $\\{a_n\\}$의 첫째항부터 제$n$항까지의 합을 $S_n$이라 하자.',
        { d: 'a_3 = |a_8|, \\quad S_3 = S_8 + 15' },
        '일 때, $S_4$의 값은? [4점]'
      ],
      choices: ['66', '69', '72', '75', '78'], answer: 2
    },
    {
      badge: '1단계', name: '숫자만 바꿈',
      body: [
        '등차수열 $\\{a_n\\}$의 첫째항부터 제$n$항까지의 합을 $S_n$이라 하자.',
        { d: 'a_2 = |a_7|, \\quad S_2 = S_7 + 20' },
        '일 때, $S_3$의 값은? [4점]'
      ],
      choices: ['60', '63', '66', '69', '72'], answer: 0
    },
    {
      badge: '2단계', name: '표현 바꿈',
      body: [
        '등차수열 $\\{a_n\\}$이 다음 조건을 만족시킨다.',
        '$|a_9|$의 값은 $a_2$와 같고, $\\displaystyle\\sum_{k=4}^{8} a_k = -10$이다.',
        '$\\displaystyle\\sum_{k=1}^{4} a_k$의 값은? [4점]'
      ],
      choices: ['40', '42', '44', '46', '48'], answer: 4
    },
    {
      badge: '3단계', name: '푸는 핵심은 같고 겉이 다름',
      body: [
        '최고차항의 계수가 $1$인 이차함수 $f(x)$가 다음 조건을 만족시킨다.',
        { d: 'f(1) = |f(3)|, \\quad f(4) = 1' },
        '$f(5)$의 값은? [4점]'
      ],
      choices: ['4', '5', '6', '7', '8'], answer: 1
    },
    {
      badge: '4단계', name: '한 걸음 더함',
      body: [
        '공차가 정수인 등차수열 $\\{a_n\\}$이 다음 조건을 만족시킨다.',
        { box: ['(가) $a_5 = -4$', '(나) $a_3 = |a_k|$인 $3$이 아닌 자연수 $k$가 있다.'] },
        '모든 $a_1$의 값의 합은? [4점]'
      ],
      choices: ['28', '32', '36', '40', '44'], answer: 3
    }
  ];

  const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  const rich = (line, tex) => String(line).split(/\$([^$]+)\$/).map((part, i) => i % 2 ? tex(part, false) : esc(part)).join('');
  const block = (b, tex) => {
    if (typeof b === 'string') return `<p>${rich(b, tex)}</p>`;
    if (b.d) return `<div class="tsc60-display">${tex(b.d, true)}</div>`;
    if (b.box) return `<div class="tsc60-box">${b.box.map(l => `<p>${rich(l, tex)}</p>`).join('')}</div>`;
    return '';
  };
  const question = (item, tex) => `<div class="tsc60-q">${item.body.map(b => block(b, tex)).join('')}<p class="tsc60-choices">${item.choices.map((c, i) => `<span>${circled[i]} ${tex(c, false)}</span>`).join('')}</p></div>`;

  function ladder(tex) {
    const rungs = ladderItems.map((item, i) => `<li class="tsc60-rung${item.original ? ' tsc60-rung--original' : ''}" style="--rung:${i}">
        <p class="tsc60-tag"><span class="tsc60-badge">${item.badge}</span><strong>${item.name}</strong></p>
        ${question(item, tex)}
        <p class="tsc60-answer"><span>정답</span> <span class="tsc60-answer-v">${circled[item.answer]} ${tex(item.choices[item.answer], false)}</span></p>
      </li>`).join('');
    return `<section class="tsc60-ladder-wrap" aria-label="원문항과 네 단계 변형 결과"><ol class="tsc60-ladder">${rungs}</ol></section>`;
  }

  const plate = (label, figure) => `<figure class="tsc60-plate"><figcaption>${label}</figcaption>${figure}</figure>`;
  function pair(p, tex) {
    const show = side => side.img
      ? `<img src="${p.dir}${side.img.file}" width="${side.img.width || 860}" height="${side.img.height}" alt="${esc(side.img.alt)}" loading="lazy" decoding="async" draggable="false">`
      : question(side, tex);
    return `<article class="tsc60-pair">
        <header><p class="tsc60-subject">${p.subject} <span>${p.unit}</span></p><p class="tsc60-source">${p.source}</p></header>
        <div class="tsc60-pair-body">${plate('원문항', show(p.original))}<span class="tsc60-arrow" aria-hidden="true">→</span>${plate('변형 결과', show(p.variant))}</div>
      </article>`;
  }
  function pairs(list, title, tex) {
    return `<section class="tsc60-pairs" aria-labelledby="tsc60-pairs-title"><h2 id="tsc60-pairs-title">${title}</h2><div class="tsc60-pair-list">${list.map(p => pair(p, tex)).join('')}</div></section>`;
  }

  const hero = back => `<header class="tsc60-hero">
        ${back || ''}
        <p class="tsc60-eyebrow">DELTASKILL 문항 변형</p>
        <h1 id="tsc60-title">수능 한 문제를,<br>네 단계 새 문제로.</h1>
        <p class="tsc60-lead">2027학년도 수능 수학 공통 12번을 델타스킬이 네 단계로 바꾼 결과입니다. 단계가 오를수록 원문항과 멀어집니다.</p>
      </header>`;

  const dir = 'assets/technology-showcase/';
  const smallPairs = [
    {
      dir, subject: '수학Ⅱ', unit: '다항함수의 적분법', source: '2027학년도 수능 공통 9번 · 4점',
      original: { img: { file: 'velocity-distance-original.webp', height: 298, alt: '수능 공통 9번 원문항. 수직선 위를 움직이는 점이 움직인 거리를 구하는 문제' } },
      variant: { img: { file: 'velocity-distance-variant.webp', height: 345, alt: '변형 결과. 움직인 거리가 주어졌을 때 속도 식의 상수를 구하는 문제' } }
    },
    {
      dir, subject: '확률과 통계', unit: '확률', source: '2027학년도 수능 확률과 통계 26번 · 3점',
      original: { img: { file: 'dice-product-original.webp', height: 200, alt: '수능 확률과 통계 26번 원문항. 주사위를 두 번 던진 눈의 곱에 대한 확률 문제' } },
      variant: { img: { file: 'dice-product-variant.webp', height: 202, alt: '변형 결과. 주사위를 세 번 던진 눈의 곱에 대한 확률 문제' } }
    }
  ];

  // Math is written first as its source, then set by KaTeX once the bundled script is on the page.
  const tex = (src, display) => `<span class="tsc60-m"${display ? ' data-display=""' : ''} data-tex="${esc(src)}">${esc(src)}</span>`;
  function typeset(root) {
    const run = () => {
      if (!window.katex) return false;
      for (const el of root.querySelectorAll('.tsc60-m[data-tex]')) {
        const src = el.getAttribute('data-tex');
        try { window.katex.render(src, el, { displayMode: el.hasAttribute('data-display'), throwOnError: false }); el.removeAttribute('data-tex'); } catch (e) { /* the source stays readable */ }
      }
      return true;
    };
    if (!run()) {
      document.addEventListener('DOMContentLoaded', run, { once: true });
      window.addEventListener('load', run, { once: true });
    }
  }

  function page() {
    return `<article class="tsc60" aria-labelledby="tsc60-title">
      ${hero('<a class="tsc60-back" href="#csat"><span aria-hidden="true">←</span> 수능 공부</a>')}
      ${ladder(tex)}
      ${pairs(smallPairs, '다른 과목에서도', tex)}
      <section class="tsc60-figures" aria-label="변형 규모">
        <dl>
          <div><dt>2027학년도 수능 수학<br>공통 · 확률과 통계</dt><dd>30<span>문항 모두</span></dd></div>
          <div><dt>만든 변형 문항</dt><dd>180<span>개</span></dd></div>
        </dl>
        <p class="tsc60-note">2026년 11월 델타스킬 집계. 위 문항들은 그 가운데 고른 예시입니다.</p>
      </section>
      <footer class="tsc60-foot">
        <p>특허출원 · <span>문항 분석 10-2026-0226038</span> · <span>문항 변형 10-2026-0226050</span></p>
        <p>수능 원문항 출처: 한국교육과정평가원 2027학년도 대학수학능력시험 수학 영역 문제지</p>
        <a class="tsc60-cta" href="#csat">수능 공부로 가기 <span aria-hidden="true">→</span></a>
      </footer>
    </article>${typeof compactFooter === 'function' ? compactFooter() : ''}`;
  }

  function navigate() {
    if (location.hash !== '#technology') return previousRoute.apply(this, arguments);
    const content = document.getElementById('content');
    if (!content) return;
    if (typeof cinemaTimer !== 'undefined') clearTimeout(cinemaTimer);
    if (typeof clock !== 'undefined') clearInterval(clock);
    if (typeof diagnosticClock !== 'undefined') clearInterval(diagnosticClock);
    header('technology');
    document.title = '델타스킬 기술 · DELTASKILL';
    content.innerHTML = page();
    typeset(content);
    window.scrollTo(0, 0);
    content.focus({ preventScroll: true });
  }

  window.removeEventListener('hashchange', previousRoute);
  route = navigate;
  window.addEventListener('hashchange', navigate);
  if (location.hash === '#technology') navigate();
})();
