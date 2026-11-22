/* User-defined learning rubric only. No score conversion or new assessment engine. */
(() => {
  'use strict';
  const rows = [
    [5, '기본 문항도 아직 풀기 어려움'],
    [4, '기본 문항까지 풀 수 있음'],
    [3, '유형서의 유형별 문항을 풀 수 있음'],
    [2, '유형서의 어려운 문항을 풀 수 있음'],
    [1, '모의고사형 문항을 풀 수 있음']
  ];
  function rubricMarkup() {
    return `<details class="lg23-rubric"><summary><strong>학습등급 기준</strong><span>5단계 · 시간 평가는 별도</span></summary><ol>${rows.map(([grade, text]) => `<li><b>${grade}<small>등급</small></b><span>${text}</span></li>`).join('')}</ol><p>내신·수능 성적이 아닌 학습 기준입니다.</p></details>`;
  }
  if (typeof diagnosticSetup === 'function') {
    const original = diagnosticSetup;
    diagnosticSetup = function () {
      return original.apply(this, arguments)
        .replace('<div class="diagnostic-brief">', rubricMarkup() + '<div class="diagnostic-brief">')
        .replace('<span class="diagnostic-label">난이도 평가</span>', '<span class="diagnostic-label">풀이 범위 체험</span>');
    };
  }
  if (window.DSAccountViews?.account) {
    const original = window.DSAccountViews.account;
    window.DSAccountViews.account = function () {
      let html = original.apply(this, arguments);
      html = html.replace('<div class="account-unit-tools">', rubricMarkup() + '<div class="account-unit-tools">');
      html = html.replace(/<div class="account-unit-scales"[^>]*>[\s\S]*?<\/div>/, '<p class="lg23-scale-label">학습등급 · 5단계</p>');
      html = html.replace('등급은 진단 기준이 연결되면 표시합니다.', '학습등급은 평가 전입니다.');
      html = html.replace(/(<dl class="account-unit-grades">)([\s\S]*?)(<\/dl>)/g, (_, start, body, end) => start + body.replace(/<div><dt>난이도별<\/dt><dd class="account-unit-grade(?: account-unit-grade-ready)?">[\s\S]*?<\/dd><\/div>/g, '<div><dt>학습등급</dt><dd class="account-unit-grade">평가 전</dd></div>') + end);
      return html;
    };
  }
  window.LearningGradeV23 = { rubricMarkup };
  if (location.hash === '#diagnostic' && typeof renderDiagnostic === 'function') renderDiagnostic();
  if (location.hash === '#account' && typeof refreshAccount === 'function') refreshAccount();
})();
