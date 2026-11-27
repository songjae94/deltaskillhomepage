/* SN27 editorial landing. Load after the existing application. No source PDFs. */
(() => {
  'use strict';
  const site = 'https://www.deltaskill.co.kr';
  const external = (path, label, className = '') => `<a class="${className}" href="${site}${path}" target="_blank" rel="noopener">${label}<span class="sn27-arrow" aria-hidden="true">↗</span></a>`;
  csatPage = function () {
    return `<section class="work-surface csat-surface sn27-v17">
      <header class="sn27-heading"><h1>수능·모의고사</h1><a href="#library">내신 자료실 <span aria-hidden="true">→</span></a></header>
      <section class="sn27-hero" aria-labelledby="sn27-title">
        <div class="sn27-lead"><p class="sn27-kicker">2027학년도 대학수학능력시험</p><h2 id="sn27-title">한 문제,<br>여러 풀이.</h2><p class="sn27-intro">답을 찾은 뒤에도,<br>다른 생각으로 한 번 더.</p><div class="sn27-actions">${external('/exam/sn27/', '수능 해설 보기', 'sn27-primary')}${external('/pilot/?exam=SN27', '이번 수능 풀어보기', 'sn27-text-link')}</div><p class="sn27-external-note">기존 델타스킬 화면이 새 탭에서 열립니다.</p></div>
        <figure class="sn27-photo"><img src="assets/editorial/csat-material-v13-delivery.webp" width="1536" height="1024" alt="짙은 천 표지의 델타스킬 교재와 연필을 놓은 자료 연출 사진" fetchpriority="high"><figcaption><span>DELTASKILL · 수능 수학</span><strong>2027</strong><span>풀이를 읽는 시간</span></figcaption></figure>
      </section>
      <section class="sn27-reading" aria-labelledby="sn27-reading-title">
        <div class="sn27-section-intro"><span class="sn27-kicker">해설의 구성</span><h2 id="sn27-reading-title">풀이보다 먼저,<br>무엇을 볼까요?</h2><p>처음 볼 것부터 이어 풀 문항까지.<br>해설이 담고 있는 내용을 살펴보세요.</p><span class="sn27-caption">구성 살펴보기</span></div>
        <div class="sn27-reading-list">
          <details open><summary><span class="sn27-index">01</span><span><strong>문제에서 첫 생각 찾기</strong><small>묻는 핵심 · 처음 볼 것</small></span><span class="sn27-disclosure" aria-hidden="true"></span></summary><div class="sn27-detail-copy">무엇을 구하는지 짚고, 풀이를 시작할 단서를 살펴봅니다.</div></details>
          <details><summary><span class="sn27-index">02</span><span><strong>같은 답, 다른 풀이 비교하기</strong><small>좋은 풀이 · 다른 풀이 · 생각이 갈리는 곳</small></span><span class="sn27-disclosure" aria-hidden="true"></span></summary><div class="sn27-detail-copy">풀이의 출발점과 순서를 나란히 봅니다. 교과서 밖의 추가 풀이는 따로 구분합니다.</div></details>
          <details><summary><span class="sn27-index">03</span><span><strong>다음 문제에 써 보기</strong><small>막히는 곳 · 틀리기 쉬운 곳 · 이어 풀 문항</small></span><span class="sn27-disclosure" aria-hidden="true"></span></summary><div class="sn27-detail-copy">막힌 지점을 돌아보고, 이어지는 문항에서 같은 생각을 다시 써 봅니다.</div></details>
        </div>
      </section>
      <section class="sn27-variation" aria-labelledby="sn27-variation-title">
        <div class="sn27-variation-heading"><div><span class="sn27-kicker">문항 변형 과정</span><h2 id="sn27-variation-title">무엇이 달라졌을까요?</h2></div><p>같은 풀이를 익히고,<br>다른 질문에도 써 보기.</p></div>
        <div class="sn27-stage-grid">
          <details open><summary><span class="sn27-stage-number">1</span><strong>숫자를 바꾸면</strong><span class="sn27-disclosure" aria-hidden="true"></span></summary><div class="sn27-stage-body"><p>같은 풀이를 다른 수로<br>다시 밟아 봅니다.</p><dl><div><dt>그대로</dt><dd>질문과 풀이 순서</dd></div><div><dt>달라짐</dt><dd>식 속의 수와 범위</dd></div></dl></div></details>
          <details open><summary><span class="sn27-stage-number">2</span><strong>표현을 바꾸면</strong><span class="sn27-disclosure" aria-hidden="true"></span></summary><div class="sn27-stage-body"><p>겉모습이 달라도<br>같은 조건을 알아봅니다.</p><dl><div><dt>그대로</dt><dd>판단과 풀이 순서</dd></div><div><dt>달라짐</dt><dd>조건의 표현과 숫자</dd></div></dl></div></details>
          <details open><summary><span class="sn27-stage-number">3</span><strong>질문을 바꾸면</strong><span class="sn27-disclosure" aria-hidden="true"></span></summary><div class="sn27-stage-body"><p>같은 판단을<br>다른 질문에 옮겨 씁니다.</p><dl><div><dt>그대로</dt><dd>핵심 판단</dd></div><div><dt>달라짐</dt><dd>주어진 것과 구하는 것</dd></div></dl></div></details>
        </div><p class="sn27-variation-note">변형 과정의 구성을 소개한 화면입니다. 단계 제목을 누르면 설명을 접거나 펼칠 수 있습니다.</p>
      </section>
      <div class="sn27-lower">
        <section class="sn27-archive" aria-labelledby="sn27-archive-title"><div class="sn27-section-line"><h2 id="sn27-archive-title">함께 볼 자료</h2><span>새 탭에서 열림</span></div><div class="sn27-resource-list">${external('/report/2027-09/', '<span><small>2027학년도 9월 모의평가</small><strong>시험 분석</strong></span>', 'sn27-resource')}${external('/report/2027-06/', '<span><small>2027학년도 6월 모의평가</small><strong>시험 총평과 주요 문항</strong></span>', 'sn27-resource')}${external('/sol/', '<span><small>기존 해설실 · 로그인 필요</small><strong>문항별 해설 찾아보기</strong></span>', 'sn27-resource')}</div></section>
        <aside class="sn27-practice" aria-labelledby="sn27-practice-title"><span class="sn27-kicker">공개 문항 연습</span><h2 id="sn27-practice-title">정적분을 더 풀어볼까요?</h2><p>미적분Ⅰ · 정적분 공개 문항 연습입니다.</p><div class="sn27-practice-actions"><button type="button" data-diagnostic="difficulty">난이도별 연습 <span aria-hidden="true">→</span></button><button type="button" data-diagnostic="timed">제한시간 연습 <span aria-hidden="true">→</span></button></div>${external('/my/notes/', '내 학습 기록', 'sn27-notes')}<small class="sn27-login-note">학습 기록은 로그인 후 확인합니다.</small></aside>
      </div>
      ${compactFooter()}
    </section>`;
  };
  // A direct #csat load may already have rendered before this last script loads.
  if (typeof document !== 'undefined' && location.hash === '#csat') {
    const target = document.getElementById('content');
    if (target) target.innerHTML = csatPage();
  }
})();
