(() => {
  'use strict';

  const main = document.getElementById('content');
  const previousRoute = route;
  const previousFooter = compactFooter;

  const techniques = [
    {
      title: '풀이 구조 분석',
      number: '10-2026-0226038',
      invention: '풀이열 표준화에 기반한 수학 문항 분석 데이터 추출 방법',
      benefit: '풀이를 나누어 어느 조건에서 어떤 판단이 필요한지 보여 줍니다.'
    },
    {
      title: '핵심 판단 변형',
      number: '10-2026-0226050',
      invention: '판단열 보존에 기반한 수학 변형 문항 생성 방법',
      benefit: '연습할 판단을 남겨 두고 숫자, 조건, 질문 또는 풀이의 연결을 바꿉니다.'
    },
    {
      title: '막힘 진단',
      number: '10-2026-0226060',
      invention: '학생 풀이 상태 분석을 통한 수학 학습 진행 제어 방법',
      benefit: '학생의 풀이에서 막힌 지점을 찾아 다음 판단을 안내하는 기능입니다.'
    },
    {
      title: '설명 효과 및 배정',
      number: '10-2026-0226072',
      invention: '학생의 후속 풀이 결과에 따른 수학 설명 콘텐츠 배정 방법',
      benefit: '이어 푼 문제의 결과를 살펴 학생에게 필요한 설명을 고르는 기능입니다.'
    },
    {
      title: '자력 풀이 판정',
      number: '10-2026-0226079',
      invention: '학생 수학 풀이의 자력 수행 여부 판정 방법',
      benefit: '힌트와 설명을 받은 정도를 살펴 혼자 풀 수 있는지 확인하는 기능입니다.'
    }
  ];

  function technologyList(items) {
    return `<ul class="to25-list">${items.map(({ title, number, invention, benefit }) => `
      <li>
        <h3>${title}</h3>
        <p class="to25-number">출원번호 <span>${number}</span></p>
        <p>${benefit}</p>
        <details class="to25-patent">
          <summary>발명의 명칭</summary>
          <p>${invention}</p>
        </details>
      </li>`).join('')}</ul>`;
  }

  function page() {
    return `<article class="to25" aria-labelledby="to25-title">
      <header class="to25-hero">
        <div class="to25-intro">
          <h1 id="to25-title">델타스킬 기술</h1>
          <p>문제의 풀이를 분석하고, 그 판단을 다시 연습할 문항을 만듭니다.</p>
          <p><strong>관문</strong>은 풀이에서 다음으로 넘어가기 위해 필요한 판단입니다.</p>
          <a class="to25-action" href="#technology">변형문항 직접보기 <span aria-hidden="true">→</span></a>
        </div>
        <figure class="to25-sample">
          <div class="to25-photo">
            <div class="to25-paper">
              <div><p>수능 수학 공통 21번 · 원문항</p><img src="assets/tech-sn27-v23/common-21-original.webp" width="1375" height="512" alt="수능 수학 공통 21번 원문. 구간별 최댓값과 최솟값의 곱을 분석하는 문제"></div>
              <div><p>같은 관문을 쓰는 4단계 변형</p><img src="assets/tech-sn27-v25/common-21-4a.webp" width="1375" height="411" alt="공통 21번의 4단계 변형. 도함수의 근 조건을 함수의 근 조건으로 바꾼 문제"></div>
            </div>
          </div>
          <figcaption>이 변형에서는 도함수의 근 조건을 함수의 근 조건으로 바꿉니다. 구간별 최댓값·최솟값의 곱을 분석하는 구조는 유지합니다.</figcaption>
        </figure>
      </header>

      <section class="to25-section" aria-labelledby="to25-current">
        <div>
          <h2 id="to25-current">지금 볼 수 있는 기술</h2>
          <p>변형문항은 답을 가리고 다시 풀어 검산합니다. 연습하려는 판단이 남아 있는지, 건너뛰어도 풀리는지 확인합니다.</p>
        </div>
        ${technologyList(techniques.slice(0, 2))}
      </section>

      <section class="to25-section" aria-labelledby="to25-planned">
        <div>
          <h2 id="to25-planned">개발 중인 학생 풀이 진단</h2>
          <p>막힌 곳을 찾고, 필요한 설명을 읽은 뒤 같은 관문이 있는 문제로 혼자 다시 풀어 보는 흐름을 개발하고 있습니다.</p>
        </div>
        ${technologyList(techniques.slice(2))}
      </section>
    </article>`;
  }

  const footerLinkSelector = '.work-footer a[data-tech-return="footer"][href="#technology"]';
  compactFooter = function () {
    return previousFooter.apply(this, arguments).replace(
      '<a href="#technology" data-tech-return="footer">델타스킬 기술</a>',
      '<a href="#technology-about">델타스킬 기술</a>'
    );
  };

  function updateLinks() {
    for (const link of main.querySelectorAll(footerLinkSelector)) {
      link.href = '#technology-about';
      delete link.dataset.techReturn;
    }
    if (location.hash === '#csat') {
      const link = main.querySelector('.cl20-bottom a[href="#technology"]');
      if (link) {
        link.href = '#technology-about';
        link.innerHTML = '델타스킬 기술 <span aria-hidden="true">→</span>';
        delete link.dataset.techReturn;
      }
    }
  }

  function navigate() {
    const result = previousRoute.apply(this, arguments);
    if (location.hash === '#technology-about') {
      header('technology-about');
      document.title = '델타스킬 기술 · DELTASKILL';
      main.innerHTML = page();
      window.scrollTo(0, 0);
      main.focus({ preventScroll: true });
    } else {
      updateLinks();
    }
    return result;
  }

  window.removeEventListener('hashchange', previousRoute);
  route = navigate;
  window.addEventListener('hashchange', navigate);
  if (location.hash === '#technology-about') navigate();
  else updateLinks();
})();
