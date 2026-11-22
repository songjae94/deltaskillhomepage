'use strict';

(() => {
  const entities = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
  const escape = value => String(value ?? '').replace(/[&<>"']/g, char => entities[char]);
  const studentStatuses = new Map([
    ['pending_signup', '가입 확인 대기'], ['가입 확인 대기', '가입 확인 대기'],
    ['pending_join', '반 가입 확인 대기'], ['반 가입 확인 대기', '반 가입 확인 대기'],
    ['connected', '연결됨'], ['연결됨', '연결됨']
  ]);
  const demoClasses = [
    demoClass({ id: 'demo-school', name: '함수 내신반', subject: '공통수학', schedule: '월요일 17:00', unit: '함수', materialSku: 'NS-CM2-06', materialName: '공통수학 · 함수 내신자료', names: ['A', 'B', 'C'], step: '함수의 정의역 확인', detail: '식을 계산하기 전에 입력값의 범위를 표시합니다.' }),
    demoClass({ id: 'demo-basic', name: '적분 기본반', subject: '미적분Ⅰ', schedule: '수요일 19:00', unit: '정적분', materialSku: 'NS-MI1B-05', materialName: '미적분Ⅰ · 정적분 내신자료', names: ['D', 'E', 'F'], step: '그래프가 만나는 점 확인', detail: '그래프의 위아래가 바뀌는 곳을 찾아 적분 구간을 나눕니다.' }),
    demoClass({ id: 'demo-exam', name: '적분 실전반', subject: '미적분Ⅰ', schedule: '토요일 10:30', unit: '정적분', materialSku: 'NS-MI1B-05', materialName: '미적분Ⅰ · 정적분 내신자료', names: ['G', 'H', 'I'], step: '정적분의 부호 구분', detail: '정적분의 값과 도형의 넓이를 각각 확인합니다.' })
  ];
  const tabs = [['overview', '확인할 일'], ['students', '학생 명단'], ['analysis', '풀이 단계 분석'], ['next', '수업 초안']];
  const statusOf = student => studentStatuses.get(student?.status) || '상태 확인 필요';
  const isCount = value => Number.isSafeInteger(value) && value >= 0;
  const itemId = (item, index) => String(item?.id ?? index);

  function demoClass(classInfo) {
    const { id, names, unit, step, detail, materialSku, materialName } = classInfo;
    const [first, second, third] = names.map(name => ({ id: `${id}-${name.toLowerCase()}`, name: `학생 ${name}` }));
    const timed = { correct: 3, total: 4, elapsedSeconds: 94, withinTime: 3 };
    const difficulty = { correct: 4, total: 6, level: '기초·기본·도전' };
    return { ...classInfo,
      students: [
        { ...first, status: 'connected', diagnosticUnit: unit, diagnostics: { timed, difficulty } },
        { ...second, status: 'pending_signup' },
        { ...third, status: 'pending_join' }
      ],
      rounds: [
        { id: 'round-2', title: '2회차', unit, summary: `${step}을 수업에서 다시 확인합니다.`, timed, difficulty, followUps: [{ studentId: first.id, name: first.name, note: '풀이 단계 다시 확인' }, { studentId: third.id, name: third.name, note: '반 가입 확인 대기' }], missedSteps: [{ problem: '예시 3번', step, count: 1, detail, materialSku, materialName }] },
        { id: 'round-1', title: '1회차', unit, summary: `${unit}의 기본 풀이 순서를 확인한 수업입니다.`, followUps: [{ studentId: second.id, name: second.name, note: '가입 확인 대기' }], missedSteps: [] }
      ]
    };
  }

  function maskedNumber(value) {
    if (typeof value !== 'string') return '';
    const text = value.trim();
    if (!/^[\d\s*•·xX()+-]{3,30}$/.test(text)) return '';
    const digits = text.replace(/\D/g, '');
    if (digits.length >= 9) return `${digits.slice(0, 3)}-****-${digits.slice(-4)}`;
    return /[*•·xX].*[*•·xX]/.test(text) ? text : '';
  }

  function previewRows(items, busy) {
    if (!items.length) return '';
    const rows = items.map(item => {
      const duplicate = item?.duplicate === true;
      const valid = item?.valid === true;
      const label = duplicate ? '중복 제외' : valid ? '형식 확인' : '형식 오류';
      return `<li><span>${escape(maskedNumber(item?.masked) || '번호 비공개')}</span><span class="classroom-status${valid && !duplicate ? ' classroom-status-ready' : ''}">${label}</span></li>`;
    });
    const duplicates = items.filter(item => item?.duplicate === true).length;
    const ready = items.filter(item => item?.valid === true && item?.duplicate !== true).length;
    const invalid = items.length - ready - duplicates;
    return `<section class="classroom-preview" aria-labelledby="classroom-preview-title">
      <div class="classroom-section-header"><h3 id="classroom-preview-title">명단 확인</h3><button type="button" class="classroom-quiet" data-class-action="edit"${busy ? ' disabled' : ''}>다시 입력</button></div>
      <dl class="classroom-counts"><div><dt>확인</dt><dd>${ready}명</dd></div><div><dt>중복 제외</dt><dd>${duplicates}건</dd></div><div><dt>형식 오류</dt><dd>${invalid}건</dd></div></dl>
      <ul class="classroom-preview-list">${rows.join('')}</ul>
    </section>`;
  }

  function studentName(student) {
    const name = student?.name;
    if (typeof name === 'string' && name.replace(/\D/g, '').length >= 9 && /^[\d\s*•·xX()+-]+$/.test(name)) return maskedNumber(name);
    return name || maskedNumber(student?.masked) || '이름 미확인';
  }

  function studentRows(students, selected) {
    if (!students.length) return '<p class="classroom-muted">조건에 맞는 학생이 없습니다.</p>';
    return `<ul class="classroom-students">${students.map(({ student, id }) => {
      const status = statusOf(student);
      return `<li><button type="button" data-class-action="select-student" data-student-id="${escape(id)}" aria-pressed="${id === selected}"><span>${escape(studentName(student))}</span><span class="classroom-status${status === '연결됨' ? ' classroom-status-ready' : ''}">${status}</span><span class="classroom-row-arrow" aria-hidden="true">→</span></button></li>`;
    }).join('')}</ul>`;
  }

  function assessment(label, result, timed) {
    const counts = isCount(result?.correct) && isCount(result?.total);
    const seconds = isCount(result?.elapsedSeconds) ? result.elapsedSeconds : null;
    const time = seconds === null ? '' : `${Math.floor(seconds / 60)}분 ${seconds % 60}초`;
    const within = isCount(result?.withinTime) ? `제한 내 ${result.withinTime}문항` : '';
    const details = timed ? [time, within].filter(Boolean).join(' · ') : result?.level;
    return `<div><h3>${label}</h3>${counts ? `<strong>${result.correct}/${result.total} 정답</strong>` : '<p class="classroom-muted">기록 없음</p>'}${details ? `<p>${escape(details)}</p>` : ''}</div>`;
  }

  function studentDetail(student, demo) {
    if (!student) return '<h2>학생 상세</h2><p class="classroom-muted">명단에서 학생을 선택하면 상세를 볼 수 있습니다.</p>';
    const status = statusOf(student);
    const masked = maskedNumber(student.masked);
    const pending = status === '가입 확인 대기' || status === '반 가입 확인 대기';
    const title = `<div class="classroom-detail-heading"><div><p>${demo ? '예시 학생' : '학생 상세'}</p><h2>${escape(studentName(student))}</h2></div><span class="classroom-status${status === '연결됨' ? ' classroom-status-ready' : ''}">${status}</span></div>`;
    const number = masked && student.name && studentName(student) !== masked ? `<p class="classroom-muted">${escape(masked)}</p>` : '';
    if (pending) {
      const copy = status === '가입 확인 대기' ? '학생이 가입하고 번호를 인증하면 반 가입 확인으로 넘어갑니다.' : '학생이 반 가입을 확인하면 명단에서 연결 상태를 확인할 수 있습니다.';
      return `${title}${number}<div class="classroom-pending"><strong>초대 대기</strong><p>${copy}</p></div>`;
    }
    if (status !== '연결됨') return `${title}${number}`;
    return `${title}${number}${student.diagnosticUnit?`<div class="classroom-unit-title"><span>단원별 평가</span><strong>${escape(student.diagnosticUnit)}</strong></div>`:''}<div class="classroom-assessments">${assessment('제한시간', student.diagnostics?.timed, true)}${assessment('난이도별', student.diagnostics?.difficulty, false)}</div>`;
  }

  function roster(item, state, demo) {
    const filter = ['pending', 'connected'].includes(state.filter) ? state.filter : 'all';
    const source = Array.isArray(item.students) ? item.students : [];
    const students = source.map((student, index) => ({ student, id: itemId(student, index) })).filter(({ student }) => {
      const status = statusOf(student);
      return filter === 'all' || (filter === 'connected' ? status === '연결됨' : status === '가입 확인 대기' || status === '반 가입 확인 대기');
    });
    const selected = students.find(({ id }) => id === String(state.selectedStudent)) ?? students[0];
    const filters = [['all', '전체'], ['pending', '초대 대기'], ['connected', '연결됨']].map(([value, label]) => `<button type="button" data-class-action="filter" data-class-filter="${value}" aria-pressed="${filter === value}">${label}</button>`).join('');

    return `<div class="classroom-layout classroom-workspace">
      <section class="classroom-sheet" aria-labelledby="classroom-list-title">
        <h2 id="classroom-list-title">학생 명단</h2>
        <div class="classroom-roster-filter" role="group" aria-label="학생 상태 필터">${filters}</div>
        ${studentRows(students, selected?.id)}
      </section>
      <aside class="classroom-sheet classroom-detail" aria-label="학생 상세">${studentDetail(selected?.student, demo)}</aside>
    </div>`;
  }

  function inviteForm({ connected, draft, preview, error, busy }) {
    const rows = Array.isArray(preview) ? preview : [];
    return `<div class="classroom-layout classroom-invite">
        <section class="classroom-sheet" aria-labelledby="classroom-invite-title">
          <h2 id="classroom-invite-title">초대 명단</h2>
          <p class="classroom-muted">${connected ? '명단에서 번호 형식과 중복을 확인할 수 있습니다.' : '반 등록 준비 중 · 지금은 명단 형식을 확인할 수 있습니다.'}</p>
          <form id="classroom-form" class="classroom-form" method="post" aria-busy="${Boolean(busy)}">
            <label for="classroom-name">반 이름</label>
            <input id="classroom-name" name="className" type="text" value="${escape(draft?.name)}" required${busy ? ' readonly' : ''}>
            <label for="classroom-phones">학생 전화번호</label>
            <textarea id="classroom-phones" name="phones" rows="4" autocomplete="off" spellcheck="false" placeholder="학생 전화번호를 한 줄에 하나씩 입력" required${busy ? ' readonly' : ''}></textarea>
            ${error ? `<p class="classroom-error" role="alert">${escape(error)}</p>` : ''}
            <button type="submit" class="classroom-primary"${busy ? ' disabled' : ''}>${busy ? '명단 확인 중…' : '명단 확인'}</button>
          </form>
          ${previewRows(rows, busy)}
        </section>
        <aside class="classroom-sheet" aria-label="학생 연결 순서"><h2>학생 연결 순서</h2><ol class="classroom-steps"><li>초대 명단</li><li>번호 인증</li><li>학생 가입 확인</li><li>관리</li></ol></aside>
      </div>`;
  }

  function getClasses(state = {}) {
    if (state.demo === true) return demoClasses;
    if (!state.signedIn || !state.connected || !Array.isArray(state.classrooms)) return [];
    return state.classrooms.filter(item => item?.name && (typeof item.id === 'string' && item.id.trim() || Number.isSafeInteger(item.id)));
  }

  function classLobby(classes, state, demo) {
    const cards = classes.map(item => `<li><button type="button" class="classroom-lobby-card" data-class-action="open-class" data-class-id="${escape(item.id)}">
      <span class="classroom-card-subject">${escape(item.subject || '수학')}${demo ? ' · 예시' : ''}</span>
      <strong>${escape(item.name)}</strong>
      <span class="classroom-card-info">${[item.schedule, item.unit].filter(Boolean).map(escape).join(' · ')}</span>
      <span class="classroom-card-open">반 열기 <span aria-hidden="true">→</span></span>
    </button></li>`).join('');
    return `<section class="classroom-lobby" aria-labelledby="classroom-lobby-title">
      <div class="classroom-section-header"><h2 id="classroom-lobby-title">${demo ? '예시 반 선택' : '내 반 선택'}</h2>${demo ? '' : '<button type="button" class="classroom-quiet" data-class-action="invite">초대 명단 확인</button>'}</div>
      ${state.selectedClass != null && state.selectedClass !== '' ? '<p class="classroom-muted" role="status">요청한 반을 찾을 수 없습니다.</p>' : ''}
      ${cards ? `<ul class="classroom-lobby-grid">${cards}</ul>` : `<div class="classroom-sheet classroom-lobby-empty"><p>${!state.connected ? '아직 연결 전' : !state.signedIn ? '로그인 후 확인' : '등록된 반이 없습니다.'}</p><button type="button" class="classroom-quiet" data-class-action="demo">예시 반 보기 →</button></div>`}
    </section>`;
  }

  function overview(item, round, state, demo) {
    const list = Array.isArray(round?.followUps) ? round.followUps.filter(entry => entry?.name) : [];
    const checks = [...list];
    (Array.isArray(item.students) ? item.students : []).forEach((student, index) => {
      const id = itemId(student, index);
      if (statusOf(student) !== '연결됨' && !checks.some(entry => String(entry.studentId) === id)) checks.push({ studentId: id, name: studentName(student), note: statusOf(student) });
    });
    const followUps = checks.map(entry => `<li><span><strong>${escape(entry.name)}</strong>${entry.note ? `<small>${escape(entry.note)}</small>` : ''}</span>${entry.studentId == null ? '' : `<button type="button" class="classroom-quiet" data-class-action="select-student" data-student-id="${escape(entry.studentId)}">학생 보기 →</button>`}</li>`).join('');
    const draft = demo ? state.demoDraft || {} : {};
    const materialSku = draft.material ?? item.materialSku;
    const materialName = materialSku ? item.materialName || '연결된 자료' : '선택한 자료 없음';
    return `<div class="classroom-layout classroom-workspace classroom-priorities">
      <section class="classroom-sheet classroom-checks" aria-labelledby="classroom-checks-title"><div class="classroom-section-header"><h2 id="classroom-checks-title">확인이 필요한 학생</h2><button type="button" class="classroom-quiet" data-class-action="tab" data-class-tab="students">전체 명단 →</button></div>${followUps ? `<ul class="classroom-followups">${followUps}</ul>` : '<p class="classroom-muted">기록된 확인 사항이 없습니다.</p>'}<p class="classroom-muted classroom-source-note">${demo ? '예시 회차 기록과 가입 상태를 바탕으로 표시합니다.' : '선택한 회차 기록과 가입 상태를 바탕으로 표시합니다.'}</p></section>
      <section class="classroom-sheet classroom-preparation" aria-labelledby="classroom-preparation-title"><h2 id="classroom-preparation-title">다음 수업 · 과제 준비</h2><dl class="classroom-preparation-list"><div><dt>단원</dt><dd>${escape(draft.unit || item.unit || '미정')}</dd></div><div><dt>자료</dt><dd>${escape(materialName)}</dd></div>${draft.due ? `<div><dt>초안 마감</dt><dd>${escape(draft.due)}</dd></div>` : ''}</dl>${draft.note ? `<p class="classroom-muted">${escape(draft.note)}</p>` : ''}<div class="classroom-preparation-actions">${materialSku ? `<button type="button" class="classroom-primary" data-class-action="supplement" data-material-sku="${escape(materialSku)}">수업 자료 구성</button>` : ''}<button type="button" class="classroom-quiet" data-class-action="tab" data-class-tab="next">${demo ? '예시 수업 초안' : '수업 기록 확인'} →</button></div><p class="classroom-muted classroom-source-note">${demo ? '예시 초안만 보관됩니다. 학생에게 배포되지 않습니다.' : '과제 배부·제출 기록은 아직 연결되지 않았습니다.'}</p></section>
      <section class="classroom-sheet classroom-round-summary"><div class="classroom-section-header"><h2>선택 회차의 수업 기록</h2><button type="button" class="classroom-quiet" data-class-action="tab" data-class-tab="analysis">풀이 단계 보기 →</button></div>${round?.unit || item.unit ? `<p class="classroom-unit-name">${escape(round?.unit || item.unit)}</p>` : ''}<p class="classroom-muted">${escape(round?.summary || '아직 수업 기록이 없습니다.')}</p>
        <div class="classroom-assessments">${assessment('제한시간 평가', round?.timed, true)}${assessment('난이도별 평가', round?.difficulty, false)}</div>
      </section>
    </div>`;
  }

  function analysis(item, round) {
    const steps = Array.isArray(round?.missedSteps) ? round.missedSteps.filter(row => row?.step) : [];
    const rows = steps.map(row => {
      const sku = row.materialSku || item.materialSku;
      const name = row.materialName || item.materialName || '연결된 자료';
      return `<tr><td>${escape(row.problem || '—')}</td><td><details class="classroom-step-detail"><summary>${escape(row.step)}</summary><p>${escape(row.detail || '기록된 단계 설명이 없습니다.')}</p></details></td>
        <td>${isCount(row.count) ? `${row.count}명` : '—'}</td><td>${sku ? `<button type="button" class="classroom-quiet classroom-supplement" data-class-action="supplement" data-material-sku="${escape(sku)}">${escape(name)} <span aria-hidden="true">→</span></button>` : '—'}</td></tr>`;
    }).join('');
    return `<section class="classroom-sheet" aria-labelledby="classroom-analysis-title"><h2 id="classroom-analysis-title">막힌 풀이 단계</h2>
      ${rows ? `<div class="classroom-analysis-scroll" tabindex="0" role="region" aria-label="풀이 단계 표"><table class="classroom-analysis-table"><thead><tr><th scope="col">문항</th><th scope="col">풀이 단계</th><th scope="col">학생</th><th scope="col">보충 자료</th></tr></thead><tbody>${rows}</tbody></table></div>` : '<p class="classroom-muted">아직 기록된 풀이 단계가 없습니다.</p>'}
    </section>`;
  }

  function nextLesson(item, draft, demo) {
    if (!demo) return '<section class="classroom-sheet"><h2>다음 수업</h2><p class="classroom-muted">다음 수업 기록이 아직 없습니다.</p></section>';
    const material = draft?.material ?? item.materialSku ?? '';
    const source = item.materialSku || '';
    return `<section class="classroom-sheet classroom-next" aria-labelledby="classroom-next-title"><h2 id="classroom-next-title">다음 수업</h2><p class="classroom-muted">예시 초안은 학생에게 배포되지 않습니다.</p>
      <form id="class-lesson-form" class="classroom-form classroom-lesson-form" method="post">
        <label>단원<input name="unit" value="${escape(draft?.unit ?? item.unit)}" required></label>
        <label>자료<select name="material"><option value="">선택 안 함</option>${source ? `<option value="${escape(source)}"${material === source ? ' selected' : ''}>${escape(item.materialName || source)}</option>` : ''}</select></label>
        <label>마감일<input type="date" name="due" value="${escape(draft?.due)}"></label>
        <label class="classroom-lesson-note">메모<textarea name="note" rows="3">${escape(draft?.note)}</textarea></label>
        <button type="submit" class="classroom-primary" data-class-action="save-demo-lesson">예시 초안 저장</button>
      </form>
    </section>`;
  }

  function assignmentList(items) {
    const rows = (Array.isArray(items) ? items : []).filter(item => item?.id != null && item.title).map(item => {
      const meta = [isCount(item.questionCount) ? `${item.questionCount}문항` : '', isCount(item.submissionCount) ? `제출 ${item.submissionCount}건` : '', item.due ? `마감 ${item.due}` : ''].filter(Boolean).map(escape).join(' · ');
      return `<li><div><strong>${escape(item.title)}</strong>${meta ? `<small>${meta}</small>` : ''}</div><button type="button" class="classroom-quiet" data-class-action="open-assignment" data-assignment-id="${escape(item.id)}">과제 보기 →</button></li>`;
    }).join('');
    return `<section class="classroom-sheet classroom-assignment-list"><h2>과제</h2>${rows ? `<ul class="classroom-followups">${rows}</ul>` : '<p class="classroom-muted">과제 배부·제출 기록은 아직 연결되지 않았습니다.</p>'}</section>`;
  }

  function classDashboard(classes, item, state, demo) {
    const rounds = (Array.isArray(item.rounds) ? item.rounds : []).filter(round => round?.id != null && round.title);
    const round = rounds.find(entry => String(entry.id) === String(state.round)) ?? rounds[0];
    const tab = tabs.some(([key]) => key === state.tab) ? state.tab : 'overview';
    const navigation = tabs.map(([key, label]) => `<button type="button" data-class-action="tab" data-class-tab="${key}" aria-pressed="${tab === key}">${label}</button>`).join('');
    let content;
    if (tab === 'students') content = roster(item, state, demo);
    else if (tab === 'analysis') content = analysis(item, round);
    else if (tab === 'next') content = `${nextLesson(item, state.demoDraft, demo)}${demo ? assignmentList(state.assignments) : ''}`;
    else content = overview(item, round, state, demo);
    return `<div class="classroom-dashboard">
      <div class="classroom-class-header"><div><button type="button" class="classroom-quiet classroom-back" data-class-action="lobby">← 반 선택</button><h2>${escape(item.name)}</h2><p>${[item.subject, item.schedule, demo ? '예시 반' : ''].filter(Boolean).map(escape).join(' · ')}</p></div>
        <div class="classroom-class-controls"><label>반<select data-class-switch>${classes.map(entry => `<option value="${escape(entry.id)}"${entry === item ? ' selected' : ''}>${escape(entry.name)}</option>`).join('')}</select></label>
          ${round ? `<label>회차<select data-class-round>${rounds.map(entry => `<option value="${escape(entry.id)}"${entry === round ? ' selected' : ''}>${escape(entry.title)}</option>`).join('')}</select></label>` : ''}
          ${demo ? `<button type="button" class="classroom-primary" data-class-action="create-assignment" data-class-id="${escape(item.id)}">과제 자료 구성</button>` : ''}
        </div>
      </div>
      <nav class="classroom-class-tabs" aria-label="반 관리 메뉴">${navigation}</nav>
      ${content}
    </div>`;
  }

  // Public edition: no class server is connected, so the page shows only real paths (no sample classes, no roster form).
  function render() {
    return `<section class="classroom-surface" aria-labelledby="classroom-title">
      <header class="classroom-heading"><h1 id="classroom-title">반·학생 관리</h1></header>
      <div class="classroom-sheet classroom-lobby-empty">
        <p>반·학생 관리는 교육기관 도입 문의로 안내합니다.</p>
        <p class="classroom-muted">학원·학교 단위로 쓰실 곳은 아래로 연락해 주세요.</p>
        <p><a class="classroom-primary" href="/partners/">교육기관 도입 안내</a> <a class="classroom-quiet" href="mailto:admin@deltaskill.co.kr?subject=%EB%B0%98%C2%B7%ED%95%99%EC%83%9D%20%EA%B4%80%EB%A6%AC%20%EB%AC%B8%EC%9D%98">메일 문의</a></p>
      </div>
      <div class="classroom-sheet">
        <h2>지금 쓸 수 있는 것</h2>
        <p><a class="classroom-quiet" href="#teacher">자료 만들기</a> <a class="classroom-quiet" href="#library">자료실</a></p>
      </div>
    </section>`;
  }

  function renderWithClasses(state = {}) {
    const demo = state.demo === true;
    const classes = getClasses(state);
    const selected = state.selectedClass == null || state.selectedClass === '' ? undefined : classes.find(item => String(item.id) === String(state.selectedClass));
    return `<section class="classroom-surface" aria-labelledby="classroom-title">
      <header class="classroom-heading"><h1 id="classroom-title">반·학생 관리</h1><div class="classroom-mode">
        <button type="button" class="classroom-quiet" data-class-action="${demo ? 'live' : 'demo'}">${demo ? '내 반 관리로' : '예시 둘러보기'}</button>
        ${state.signedIn || demo ? '' : '<a href="#login" class="classroom-primary">로그인</a>'}
      </div></header>
      ${demo ? '<p class="classroom-demo-notice"><strong>예시 모드</strong> 가상 반과 학생으로 화면을 살펴봅니다.</p>' : ''}
      ${selected ? classDashboard(classes, selected, state, demo) : classLobby(classes, state, demo)}
      ${!demo && (state.inviteOpen || state.preview?.length || state.error) ? inviteForm(state) : ''}
    </section>`;
  }

  window.DSClassroomViews = { render, getClasses };
})();
