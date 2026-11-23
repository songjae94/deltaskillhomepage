/* Student-facing CSAT hub; existing read/navigation paths only. */
(() => {
  'use strict';
  const origin = 'https://www.deltaskill.co.kr';
  const courses = { algebra: '대수', calculus: '미적분Ⅰ', probability: '확률과 통계' };
  let course = 'calculus';
  try { const stored = sessionStorage.getItem('ds-csat-course-v20'); if (Object.hasOwn(courses, stored)) course = stored; } catch {}
  const out = (path, label, cls = '') => `<a class="${cls}" href="${origin}${path}" target="_blank" rel="noopener">${label}<span aria-hidden="true">↗</span></a>`;
  function courseMarkup() {
    if (course === 'calculus') return `<div class="cl20-course-copy"><span class="cl20-label">학습 단계 진단 · 체험</span><h3>정적분</h3><p>기본 문제부터 풀며, 어느 단계까지 할 수 있는지 확인하세요.</p></div><div class="cl20-course-actions"><button type="button" class="primary" data-csat-diagnostic-v20 data-study-context="csat">정적분 진단 시작 <span aria-hidden="true">→</span></button><button type="button" class="secondary" data-csat-study-v20 data-study-context="csat">바로 공부하기</button></div>`;
    return `<div class="cl20-course-copy"><span class="cl20-label">${courses[course]}</span><h3>${courses[course]} 단원 진단</h3><p>진단 문항을 준비하고 있습니다.</p><small>기출과 공개 해설은 지금 볼 수 있습니다.</small></div><div class="cl20-course-actions"><button type="button" class="secondary" disabled>진단 준비 중</button>${out(course === 'probability' ? '/exam/sn27/' : '/sol/', '기출 해설 찾아보기', 'secondary')}</div>`;
  }
  function choose(value) {
    if (!Object.hasOwn(courses, value)) return false;
    course = value;
    try { sessionStorage.setItem('ds-csat-course-v20', course); } catch {}
    return true;
  }
  function examMaterialsMarkup() {
    return `<section class="cl20-archive" id="csat-materials" aria-labelledby="cl20-archive-title"><div class="cl20-section-top"><h2 id="cl20-archive-title">기출과 해설을 함께</h2><a href="https://wdown.ebsi.co.kr/W61001/01exam/20261119/go3/live_main_paper_1_math_K63RYJL3.pdf" target="_blank" rel="noopener">기출 문제 PDF <span aria-hidden="true">↗</span></a></div><a class="cl20-exam" href="${origin}/exam/sn27/" target="_blank" rel="noopener"><span class="cl20-exam-year">2027</span><div><span>대학수학능력시험</span><h3>원문에서 다른 풀이까지</h3><p>공개된 수능 페이지에서 해설을 살펴보세요.</p></div><span aria-hidden="true">↗</span></a><div class="cl20-archive-links">${out('/pilot/?exam=SN27', '2027 수능 풀어보기')}${out('/exam/m09/', '2027학년도 9월 모의평가')}${out('/sol/', '문항별 해설실 <small>로그인 필요</small>')}${out('/report/2027-09/', '9월 모의평가 분석')}</div><p class="cl20-source-note">기출 문제지는 무료 공개 PDF로, 해설은 델타스킬의 공개 해설 화면에서 엽니다.</p></section>`;
  }
  csatPage = function () {
    return `<section class="work-surface csat-learning-v20">
      <header class="cl20-heading"><h1>수능 공부</h1><a href="#library" data-library-view="exams">기출·해설 자료실 <span aria-hidden="true">→</span></a></header>
      <section class="cl20-hero" aria-labelledby="cl20-title"><div class="cl20-hero-copy"><span class="cl20-label">2025학년도 수능 · 공통 1번</span><h2 id="cl20-title">오늘의 수능 한 문제</h2><iframe class="cl20-first-question" title="2025학년도 수능 공통 1번 문제와 선지" src="assets/canonical-exam-v36/SNG-2024-M11/문항/공통_1/question.html"></iframe><button type="button" class="primary cl20-solve" data-csat-first-question>이 문제 풀기 <span aria-hidden="true">→</span></button>${out('/exam/sn27/', '수능 해설 펼쳐보기', 'primary cl20-main-link')}<a class="cl20-tech-link" href="#technology" data-tech-return="csat">변형문항 만들기 <span aria-hidden="true">→</span></a></div><figure class="cl20-photo"><img src="assets/editorial/csat-material-v13.png" width="1536" height="1024" alt="짙은 천 표지의 델타스킬 교재와 연필을 놓은 자료 연출 사진" fetchpriority="high"><figcaption><span>DELTASKILL</span><strong>한 문제를<br>다르게 읽는 시간</strong></figcaption></figure></section>
      <div class="cl20-workspace">${examMaterialsMarkup()}
      <section class="cl20-review" aria-labelledby="cl20-review-title"><span class="cl20-label">내 시험을 다음 공부로</span><h2 id="cl20-review-title">맞았어도,<br>다시 볼 문제.</h2><p>틀린 문제와 확신 없이 고른 문제를<br>내 기록에서 다시 살펴보세요.</p><ol><li><b>01</b><div><strong>이번 시험 돌아보기</strong><span>오답과 직접 남긴 확신 기록 확인</span></div></li><li><b>02</b><div><strong>연결된 문항으로 다시 풀기</strong><span>해설실의 이어 풀 문항 살펴보기</span></div></li><li><b>03</b><div><strong>지난 시험 다시 꺼내기</strong><span>오답노트의 타임캡슐에서 복습 확인</span></div></li></ol>${out('/my/notes/', '내 오답노트 열기', 'primary')}<a class="cl20-tech-link" href="#exam-week">번호로 빠르게 표시하기 <span aria-hidden="true">→</span></a><small class="cl20-review-note">로그인 후 내가 남긴 기록을 확인합니다.</small></section></div>
      <footer class="cl20-bottom"><span>한 번의 시험이, 다음 공부의 시작이 되도록.</span><a href="#technology" data-tech-return="csat">델타스킬 문항 변형 기술 <span aria-hidden="true">→</span></a></footer>${compactFooter()}</section>`;
  };
  document.addEventListener('click', event => {
    const button = event.target.closest('button'); if (!button) return;
    if (button.dataset.csatCourseV20) {
      if (!choose(button.dataset.csatCourseV20)) return;
      for (const option of document.querySelectorAll('[data-csat-course-v20]')) option.setAttribute('aria-pressed', String(option.dataset.csatCourseV20 === course));
      const slot = document.getElementById('cl20-course-work'); if (slot) slot.innerHTML = courseMarkup();
    }
    if (button.hasAttribute('data-csat-study-v20')) { studentTab = 'study'; location.hash = '#student'; }
    if (button.hasAttribute('data-csat-diagnostic-v20')) location.hash = '#diagnostic';
  });
  window.examMaterialsMarkup = examMaterialsMarkup;
  window.DSCSATLearningV20 = { choose, courseMarkup, archiveMarkup: examMaterialsMarkup, examMaterialsMarkup, current: () => course };
  if (location.hash === '#csat') { const target = document.getElementById('content'); if (target) target.innerHTML = csatPage(); }
})();
