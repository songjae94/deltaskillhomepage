/* Public-question selection and source-separated onboarding. No account writes. */
(() => {
  'use strict';
  const originalStudent = student, originalPractice = renderPractice;
  let epoch = 0, guestPracticed = false, member = { status: 'unknown', records: [], dismissed: false, practiced: false };
  const signedIn = () => Boolean(DSService.session());
  const available = () => studyUnits.filter(u => Array.isArray(u.questions) && u.questions.length > 0);
  function localHistory() {
    const values = get('results-v2', []);
    return (Array.isArray(values) ? values : []).filter(r => r && Array.isArray(r.questions) && r.questions.some(q => q && typeof q.id === 'string' && Number.isInteger(q.answer)));
  }
  function history() {
    return signedIn() ? { source: 'member', status: member.status, count: member.records.length } : { source: 'device', status: 'ready', count: localHistory().length };
  }
  function showGuide() {
    const h = history();
    return studentTab === 'study' && h.status === 'ready' && h.count === 0 && !(h.source === 'member' ? member.dismissed || member.practiced : guestPracticed || get('student-guide-dismissed-v19', false));
  }
  function guideMarkup() {
    return showGuide() ? `<aside class="student-guide-v19" aria-label="첫 공부 안내"><div><strong>단원을 고르고, 한 문제 풀어보세요.</strong><ol><li>단원·유형 선택</li><li>답 선택·풀이 확인</li><li>같은 유형 보충</li></ol><div class="student-guide-actions-v19"><button type="button" data-student-begin>한 문제 풀어보기 <span aria-hidden="true">→</span></button></div></div><button type="button" data-student-guide-hide>안내 숨기기</button></aside>` : '';
  }
  function selectionMarkup() {
    const unit = selectedStudyUnit(), q = selectedStudyQuestion();
    return `<div class="student-selection-v19"><h1 class="sr-only">공부</h1><span class="page-kicker">미적분Ⅰ</span><div class="student-select-grid-v19"><label><span>단원</span><select aria-label="공부할 단원" data-student-unit><option value="integral">정적분</option><option disabled>그 밖의 단원 · 연결된 문항 없음</option></select></label><label><span>유형</span><select id="study-unit" aria-label="공부할 유형">${available().map(u => `<option value="${esc(u.id)}"${u.id === unit.id ? ' selected' : ''}>${esc(u.name)}</option>`).join('')}</select></label><label><span>문항</span><select id="study-question" aria-label="풀 문항">${unit.questions.map((item, index) => `<option value="${esc(item.id)}"${item.id === q.id ? ' selected' : ''}>${String(index + 1).padStart(2, '0')} · ${esc(item.short)}</option>`).join('')}</select></label></div></div>`;
  }
  function historyMarkup() {
    const h = history(), isMember = h.source === 'member';
    const recordLabel = isMember ? '회원 학습 기록' : '이 기기 학습 기록';
    const returning = (h.status === 'ready' && h.count > 0) || (isMember ? member.practiced : guestPracticed);
    return `<div class="student-history-v19"><div><span>${recordLabel}</span><a href="${isMember ? '#account' : '#progress'}">기록 보기</a></div>${returning && studentTab === 'study' ? `<div class="student-continue-v19"><button type="button" data-student-continue>현재 선택 문항 풀기</button><button type="button" data-student-save>선택 저장 <small>이 브라우저</small></button></div><p class="student-selection-source-v19">문항 선택은 이 브라우저에 저장됩니다.</p><p class="student-save-status-v19" role="status"></p>` : ''}</div>`;
  }
  function paintSlots() {
    if (!['#student', '#timed'].includes(location.hash)) return;
    const guide = document.getElementById('student-guide-slot-v19');
    const record = document.getElementById('student-history-slot-v19');
    if (guide) guide.innerHTML = guideMarkup();
    if (record) record.innerHTML = historyMarkup();
  }
  function ensureMemberHistory() {
    if (!signedIn() || member.status !== 'unknown' || !['#student', '#timed'].includes(location.hash)) return;
    member.status = 'loading';
    const generation = epoch;
    Promise.resolve(DSService.ready).then(() => {
      if (generation !== epoch || !signedIn()) return null;
      return DSService.request('/api/history');
    }).then(data => {
      if (generation !== epoch || !signedIn() || !data) return;
      if (!Array.isArray(data.items)) throw new Error('invalid_history');
      member.records = data.items.filter(r => r && typeof r.submission_id === 'string' && r.submission_id);
      member.status = 'ready'; paintSlots();
    }).catch(() => {
      if (generation !== epoch || !signedIn()) return;
      member = { ...member, status: 'unavailable', records: [] }; paintSlots();
    });
  }
  // The existing IDs retain the existing question selection/change handlers.
  studyPicker = function () { return ''; };
  student = function () {
    ensureMemberHistory();
    let html = originalStudent();
    // Both modes share a fixed header. Mode-specific selectors belong below it.
    html = html.replace(/(<div class="work-heading[^\"]*">)<div>[\s\S]*?<\/div>(<div class="work-tabs")/, (_, heading, tabs) => heading + '<div class="study-context-v22"><span class="page-kicker">미적분Ⅰ · 정적분</span></div>' + tabs);
    const picker = studentTab === 'study' ? selectionMarkup().replace('<span class="page-kicker">미적분Ⅰ</span>', '') : '<h1 class="sr-only">타임어택</h1>';
    html = html.replace('<div class="student-work', `${picker}<div id="student-guide-slot-v19">${guideMarkup()}</div><div class="student-work`);
    if (studentTab === 'timed') html = html.replace(/<button class="practice-shortcut"[\s\S]*?<\/button>/, `<article class="quick-switch-v22"><div class="quick-switch-heading-v22"><span>시간 제한 없이</span><h2>바로 풀기</h2></div><div class="quick-switch-paper-v22 quick-switch-guide-v23"><div class="quick-switch-mark-v23" aria-hidden="true"><span>01</span><i></i><i></i><i></i></div><strong>공부하자.</strong><p>단원과 문항을 고르고,<br>막히면 힌트를 확인하세요.</p><div class="quick-switch-steps-v23"><span>문항 선택</span><span aria-hidden="true">→</span><span>풀이</span><span aria-hidden="true">→</span><span>확인</span></div></div><button type="button" data-study-tab="study">문제 풀기 <span aria-hidden="true">→</span></button></article>`);
    html = html.replace(/<div class="study-record-link">[\s\S]*?<\/div>/, `<div id="student-history-slot-v19">${historyMarkup()}</div>`);
    const template = document.createElement('template');
    template.innerHTML = html;
    const root = template.content.querySelector('.student-v7');
    const tools = root?.querySelector('.work-shortcuts');
    const next = root?.querySelector('.study-next-row');
    if (root) root.classList.add('study-workbench-v32');
    if (tools && next) tools.prepend(next);
    return template.innerHTML;
  };
  renderPractice = function () {
    const result = originalPractice();
    if (location.hash !== '#practice' || timed || !checked || window.DSTimeAttackV18?.snapshot()?.active) return result;
    if (Number.isInteger(sessionResults[questionIndex]?.answer)) {
      if (signedIn()) member.practiced = true;
      else guestPracticed = true;
    }
    const current = qbank[questionIndex], unit = available().find(u => u.questions.some(q => q.id === current?.id));
    if (!unit || unit.questions.length < 2) return result;
    const next = unit.questions[(unit.questions.findIndex(q => q.id === current.id) + 1) % unit.questions.length];
    const foot = document.querySelector('.practice-foot');
    if (foot && !document.querySelector('.student-supplement-v19')) foot.insertAdjacentHTML('beforebegin', `<section class="student-supplement-v19"><div><span>보충 학습</span><strong>${esc(unit.name)}</strong><small>현재 풀이를 이 기기에 저장하고 이동합니다.</small></div><button type="button" data-student-supplement="${esc(next.id)}" data-student-type="${esc(unit.id)}">같은 유형 한 문제 더 <span aria-hidden="true">→</span></button></section>`);
    return result;
  };
  function saveSelection() {
    return put('question-selection', { unit: selectedStudyUnit().id, id: selectedStudyQuestion().id });
  }
  function saveCheckedPractice() {
    if (ended) return true;
    if (!checked || timed || !Number.isInteger(sessionResults[questionIndex]?.answer)) return false;
    // Same device-only result shape as finish(), without an intermediate route.
    const questions = qbank.map((q, i) => sessionResults[i] || { id: q.id, correct: false, help: false, skipped: true, answer: null });
    const item = { when: new Date().toISOString(), timed: false, seconds: null, questions };
    const previous = get('results-v2', []), results = Array.isArray(previous) ? previous : [];
    if (!put('results-v2', [...results, item].slice(-30))) {
      toast('기록을 저장하지 못했습니다. 현재 풀이를 유지합니다.'); return false;
    }
    ended = true; clearInterval(clock); clock = null;
    return true;
  }
  function dismiss() {
    if (signedIn()) member.dismissed = true;
    else put('student-guide-dismissed-v19', true);
    paintSlots();
  }
  document.addEventListener('click', event => {
    const button = event.target.closest('button'); if (!button) return;
    if (button.dataset.studyTab) {
      document.querySelector(`.study-heading [data-study-tab="${button.dataset.studyTab}"]`)?.focus({ preventScroll:true });
      return;
    }
    if (button.hasAttribute('data-student-guide-hide')) { dismiss(); return; }
    if (button.hasAttribute('data-student-save')) {
      const ok = saveSelection(), status = document.querySelector('.student-save-status-v19');
      if (status) status.textContent = ok ? '이 브라우저에 선택을 저장했습니다.' : '선택을 저장하지 못했습니다.';
      return;
    }
    if (button.hasAttribute('data-student-continue') || button.hasAttribute('data-student-begin')) {
      document.querySelector('input[name="quickanswer"]')?.focus();
      document.querySelector('.quick-paper')?.scrollIntoView({ block: 'start', behavior: 'auto' }); return;
    }
    if (button.dataset.studentSupplement) {
      const unit = available().find(u => u.id === button.dataset.studentType);
      const q = unit?.questions.find(item => item.id === button.dataset.studentSupplement);
      if (!q) return;
      if (!saveCheckedPractice()) return;
      studyPick = { unit: unit.id, id: q.id }; saveSelection();
      quickSelected = ''; quickHelp = false; studentTab = 'study';
      location.hash = '#student';
    }
  });
  function sessionChanged() { ++epoch; member = { status: 'unknown', records: [], dismissed: false, practiced: false }; ensureMemberHistory(); paintSlots(); }
  window.addEventListener('ds-session-change', sessionChanged);
  window.addEventListener('ds-session-ready', () => { ensureMemberHistory(); paintSlots(); });
  window.DSStudentOnboardingV19 = { history, showGuide, available: () => available().map(u => ({ id: u.id, count: u.questions.length })), saveSelection, dismiss };
  if (['#student', '#timed'].includes(location.hash) && typeof route === 'function') route();
})();
