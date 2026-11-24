(() => {
  'use strict';

  const courses = Object.freeze({
    concept: '개념 익히기',
    types: '핵심 유형 풀기',
    supplement: '부교재 변형 연습',
    advanced: '고난도 도전'
  });
  const questions = ['목표 등급은?', '지금 필요한 공부는?', '어떤 과목과 단원을 공부할까요?'];
  const gradeValues = Array.from({length: 9}, (_, i) => String(i + 1));
  const escape = text => String(text ?? '').replace(/[&<>"']/g, c =>
    ({'&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;'})[c]);

  function answer(value, label, selected) {
    return `<button type="button" data-plan-answer value="${value}" aria-pressed="${value === selected}">${label}</button>`;
  }

  function option(value, label, selected) {
    return `<option value="${escape(value)}"${value === selected ? ' selected' : ''}>${escape(label)}</option>`;
  }

  function unitOptions(units, selected) {
    const groups = new Map();
    for (const unit of units) {
      const key = unit.group || '';
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(option(unit.id, unit.label, selected));
    }
    return [...groups].map(([group, rows]) => group
      ? `<optgroup label="${escape(group)}">${rows.join('')}</optgroup>`
      : rows.join('')).join('');
  }

  function chooseRange(draft, subjects, units) {
    const selectedSubject = subjects.includes(draft.subject) ? draft.subject : '';
    const selectedUnit = units.some(u => u.id === draft.unit) ? draft.unit : '';
    const placeholder = !selectedSubject ? '과목을 먼저 선택하세요' : units.length ? '단원을 선택하세요' : '연결된 단원이 아직 없어요';
    return `<div class="ssp-plan-range">
      <label>과목<select data-plan-subject required>
        ${option('', '과목을 선택하세요', selectedSubject)}${subjects.map(s => option(s, s, selectedSubject)).join('')}
      </select></label>
      <label>단원<select data-plan-unit required${!selectedSubject || !units.length ? ' disabled' : ''}>
        ${option('', placeholder, selectedUnit)}${selectedSubject ? unitOptions(units, selectedUnit) : ''}
      </select></label>
    </div>`;
  }

  function render({profile, draft = {}, step = 0, phase = 'survey', course, subjects = [], units = []}) {
    if (phase === 'return') {
      return `<section class="ssp-plan" aria-label="학습 시작">
        <h3 class="ssp-plan-title" tabindex="-1">오늘은 어디서 시작할까요?</h3>
        <button type="button" class="ssp-plan-primary" data-plan-resume>이어서 공부하기 <span aria-hidden="true">→</span></button>
        <button type="button" data-plan-review>복습부터 하기</button>
      </section>`;
    }
    if (phase === 'active') {
      const name = courses[course] || courses[profile?.need] || '';
      const unit = units.find(u => u.id === profile?.unit);
      const range = [profile?.subject, unit?.label || profile?.unitLabel || profile?.unit].filter(Boolean).join(' · ');
      return `<section class="ssp-plan" aria-label="선택한 공부">
        <h3 class="ssp-plan-title" tabindex="-1">${escape(name || '공부하는 중')}</h3>
        ${range ? `<p class="ssp-plan-current">${escape(range)}</p>` : ''}
        <button type="button" data-plan-reselect>공부 선택 바꾸기</button>
      </section>`;
    }
    const index = Number.isInteger(step) && step >= 0 && step < questions.length ? step : 0;
    let choices;
    if (index === 0) {
      choices = `<div class="ssp-plan-grades">${gradeValues.map(value => answer(value, value + '등급', draft.goal)).join('')}</div>`;
    } else if (index === 1) {
      choices = `<div class="ssp-plan-needs">${Object.entries(courses).map(([id, label]) => answer(id, label, draft.need)).join('')}</div>`;
    } else {
      choices = chooseRange(draft, subjects, units);
    }
    return `<section class="ssp-plan" aria-label="내 공부 선택">
      <div class="ssp-plan-progress"><span>질문 ${index + 1} / 3</span>
        ${index > 0 ? '<button class="ssp-plan-link" type="button" data-plan-back>← 이전 질문</button>' : ''}
      </div>
      <progress max="3" value="${index + 1}" aria-label="질문 진행"></progress>
      <h3 class="ssp-plan-title" tabindex="-1">${questions[index]}</h3>${choices}
    </section>`;
  }

  window.DSStudentStudyPlan = Object.freeze({render, courses});
})();
