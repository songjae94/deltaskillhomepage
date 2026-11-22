/* Public school-exam archive and a read-only contribution check. */
(() => {
  'use strict';

  const outlet = document.getElementById('content');
  if (!outlet || typeof libraryPage !== 'function' || window.DSSchoolExamLibraryV26) return;
  const originalLibraryPage = libraryPage;
  const originalHeader = header;
  const periods = { midterm: '중간고사', final: '기말고사' };
  const grades = { 1: '1학년', 2: '2학년', 3: '3학년' };
  const semesters = { 1: '1학기', 2: '2학기' };
  const subjects = ['공통수학1', '공통수학2', '대수', '미적분Ⅰ', '미적분Ⅱ', '확률과 통계', '기하'];
  const fieldNames = ['school', 'grade', 'year', 'semester', 'period', 'subject'];
  const formats = { pdf: 'application/pdf', jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', webp: 'image/webp' };
  const service = () => window.DSSchoolExamService;
  const yearMax = () => new Date().getFullYear();
  let active = null;

  function tabs(nav, current = false) {
    if (!nav) return;
    nav.classList.add('se26-tabbar');
    const csat = nav.querySelector('[data-library-view="exams"]');
    if (csat) csat.textContent = '수능 기출·해설';
    if (nav.querySelector('.se26-tab')) return;
    const link = document.createElement('a');
    link.className = 'se26-tab';
    link.href = '#school-exams';
    link.textContent = '학교별 기출';
    if (current) link.setAttribute('aria-current', 'page');
    const next = csat || nav.querySelector('[data-ac25-open], .upload-entry-v22');
    if (next) next.before(link);
    else nav.append(link);
  }

  libraryPage = function () {
    const template = document.createElement('template');
    template.innerHTML = originalLibraryPage.apply(this, arguments);
    tabs(template.content.querySelector('.nv20-collections'));
    return template.innerHTML;
  };

  header = function (page) {
    if (page !== 'school-exams') return originalHeader.apply(this, arguments);
    originalHeader.call(this, 'library');
    document.title = '학교별 기출 · DELTASKILL';
  };

  function schoolTabs() {
    const template = document.createElement('template');
    template.innerHTML = originalLibraryPage();
    const nav = template.content.querySelector('.nv20-collections');
    if (!nav) return '<nav class="nv20-collections se26-tabbar" aria-label="자료실 분류"><a href="#library">내신 자료</a><a class="se26-tab" aria-current="page" href="#school-exams">학교별 기출</a></nav>';
    nav.querySelector('.upload-entry-v22')?.remove();
    for (const button of nav.querySelectorAll('button[data-library-view="school"], button[data-library-view="exams"]')) {
      const link = document.createElement('a');
      link.href = '#library';
      link.dataset.libraryView = button.dataset.libraryView;
      link.textContent = button.textContent;
      button.replaceWith(link);
    }
    tabs(nav, true);
    return nav.outerHTML;
  }

  function fields(required = false) {
    const req = required ? ' required' : '';
    const select = (name, label, values) => `<label>${label}<select name="${name}"${req}><option value="">${required ? '선택' : '전체'}</option>${
      Object.entries(values).map(([value, text]) => `<option value="${value}">${text}</option>`).join('')
    }</select></label>`;
    return `<div class="se26-fields">
      <label>학교<input name="school" type="text" maxlength="80" placeholder="학교 이름"${req}></label>
      ${select('grade', '학년', grades)}
      <label>학년도<input name="year" type="number" inputmode="numeric" min="1900" max="${yearMax()}" placeholder="${required ? '연도 입력' : '전체'}"${req}></label>
      ${select('semester', '학기', semesters)}
      ${select('period', '중간·기말', periods)}
      <label>과목<input name="subject" type="text" list="se26-subjects" maxlength="80" placeholder="${required ? '과목명' : '전체'}"${req}></label>
      ${required ? '<label class="se26-full">별도시험 정보 <small>선택</small><input name="examVariant" type="text" maxlength="80" placeholder="재시험·추가시험인 경우 입력"></label>' : ''}
    </div>`;
  }

  // No upload server is connected: contributions go by mail to the address already published on the site.
  const mailtoHref = 'mailto:admin@deltaskill.co.kr?subject=%ED%95%99%EA%B5%90%20%EA%B8%B0%EC%B6%9C%20%EC%A0%9C%EA%B3%B5';
  function page() {
    return `<section class="work-surface resource-surface se26" data-collection="school-exams" aria-labelledby="se26-title">
      <header class="se26-heading">
        <div><a href="#library" data-library-view="school">자료실</a><h1 id="se26-title">학교별 기출</h1><p>학교별로 공개된 시험지를 찾아봅니다.</p></div>
        <a class="se26-primary" href="${mailtoHref}">학교 기출 보내기</a>
      </header>
      ${schoolTabs()}
      <datalist id="se26-subjects">${subjects.map(subject => `<option value="${subject}"></option>`).join('')}</datalist>
      <div class="se26-layout">
        <section class="se26-archive" aria-labelledby="se26-search-title">
          <h2 id="se26-search-title" tabindex="-1">시험지 찾기</h2>
          <form id="se26-search" autocomplete="off">
            ${fields()}
            <div class="se26-actions"><button class="se26-primary" type="submit">검색</button><button class="se26-quiet" type="reset">조건 초기화</button></div>
          </form>
          <div class="se26-results" data-se26-results aria-live="polite"></div>
        </section>
        <aside class="se26-contribute" aria-labelledby="se26-contribute-title">
          <h2 id="se26-contribute-title">학교 기출 보내기</h2>
          <p>가진 학교 시험지는 메일로 보내 주실 수 있습니다. 학교 · 학년 · 학년도 · 학기 · 중간·기말 · 과목을 함께 적어 주세요.</p>
          <p>PDF·JPG·PNG·WebP. 이름이나 학번이 보이는 부분은 가려 주세요.</p>
          <div class="se26-actions"><a class="se26-quiet" href="${mailtoHref}">메일로 보내기</a></div>
        </aside>
      </div>
      ${compactFooter()}
    </section>`;
  }

  const clean = value => typeof value === 'string' ? value.normalize('NFC').trim().replace(/\s+/g, ' ') : '';
  const isYear = year => /^\d{4}$/.test(year) && Number(year) >= 1900 && Number(year) <= yearMax();
  const known = (choices, value) => Object.hasOwn(choices, value);
  const textLimit = value => value.length <= 80;
  function readFields(form, required = false) {
    const data = new FormData(form);
    const fields = Object.fromEntries(fieldNames.map(name => [name, clean(data.get(name))]));
    if (required) fields.examVariant = clean(data.get('examVariant'));
    if ((required && fieldNames.some(name => !fields[name])) ||
        ![fields.school, fields.subject, fields.examVariant ?? ''].every(textLimit) ||
        (fields.year && !isYear(fields.year)) ||
        (fields.grade && !known(grades, fields.grade)) ||
        (fields.semester && !known(semesters, fields.semester)) ||
        (fields.period && !known(periods, fields.period))) return null;
    return fields;
  }

  function pdfUrl(value) {
    if (typeof value !== 'string' || !value || value.startsWith('//')) return '';
    try {
      const url = new URL(value, location.origin + '/');
      if (url.username || url.password || !url.pathname.toLowerCase().endsWith('.pdf')) return '';
      if (url.origin === location.origin && url.pathname.startsWith('/public-data/school-exams/')) return url.href;
      if (url.protocol === 'https:') return window.DSService?.safeDownloadUrl?.(url.href) || '';
    } catch { /* A malformed address cannot be used as a public file link. */ }
    return '';
  }

  function examDescription(exam) {
    return [exam.year + '학년도', grades[exam.grade], semesters[exam.semester], periods[exam.period], exam.examVariant].filter(Boolean).join(' · ');
  }

  function examRows(items) {
    if (!items.length) return '<p class="se26-state">조건에 맞는 공개 시험지가 없습니다.</p>';
    return `<ul class="se26-exam-list">${items.map(exam => `<li>
      <div><h3>${esc(exam.school)} · ${esc(exam.subject)}</h3><p>${esc(examDescription(exam))}</p></div>
      <div class="se26-file-links"><a class="se26-quiet" href="${esc(exam.url)}" rel="noreferrer">PDF 보기</a></div>
    </li>`).join('')}</ul>`;
  }

  function normalizeRecords(result) {
    if (!Array.isArray(result?.items)) throw new Error('invalid_school_exam_list');
    const rows = [];
    const seen = new Set();
    for (const item of result.items) {
      if (typeof item?.id !== 'string' || !item.id || seen.has(item.id)) throw new Error('invalid_school_exam_id');
      const row = Object.fromEntries(fieldNames.map(key => [key, clean(item[key])]));
      row.examVariant = clean(item.examVariant);
      row.url = pdfUrl(item.publicUrl);
      if (!row.url || !row.school || !row.subject || !isYear(row.year) ||
          !known(grades, row.grade) || !known(semesters, row.semester) || !known(periods, row.period)) {
        throw new Error('invalid_school_exam_row');
      }
      rows.push(row);
      seen.add(item.id);
    }
    return rows;
  }

  async function list(state, filters = {}) {
    state.listRequest?.abort();
    const box = state.root.querySelector('[data-se26-results]');
    const adapter = service();
    if (typeof adapter?.list !== 'function') {
      box.innerHTML = '<p class="se26-state">공개된 학교별 시험지가 없습니다. 단원별 내신 자료는 <a href="#library" data-library-view="school">자료실</a>에서 볼 수 있습니다.</p>';
      return;
    }
    const request = new AbortController();
    state.listRequest = request;
    box.innerHTML = '<p class="se26-state">학교 기출 목록을 불러오고 있습니다.</p>';
    try {
      const result = await adapter.list(filters, { signal: request.signal });
      if (!request.signal.aborted && state.root.isConnected) box.innerHTML = examRows(normalizeRecords(result));
    } catch {
      if (!request.signal.aborted && state.root.isConnected) box.innerHTML = '<p class="se26-state">목록을 불러오지 못했습니다. 다시 검색해 주세요.</p>';
    }
  }

  function message(state, text, action = '') {
    state.root.querySelector('[data-se26-check-status]').innerHTML = text ? `<strong>${esc(text)}</strong>${action}` : '';
  }

  function reviewReset(state) {
    const review = state.root.querySelector('[data-se26-review]');
    review.hidden = true;
    review.replaceChildren();
    const error = state.root.querySelector('[data-se26-file-error]');
    error.hidden = true;
    error.textContent = '';
  }

  function invalidate(state) {
    state.checkRequest?.abort();
    state.checkRequest = null;
    state.draft = null;
    state.existing = null;
    const files = state.root.querySelector('#se26-files');
    if (!files) return;
    files.reset();
    files.hidden = true;
    reviewReset(state);
    message(state, typeof service()?.checkDuplicate === 'function' ? '' : '중복 확인 준비 중');
  }

  async function duplicateCheck(state, form) {
    invalidate(state);
    const data = readFields(form, true);
    if (!data) {
      message(state, '시험 정보를 모두 입력해 주세요.');
      return;
    }
    const adapter = service();
    if (typeof adapter?.checkDuplicate !== 'function') return;
    const request = new AbortController();
    state.checkRequest = request;
    message(state, '중복 여부를 확인하고 있습니다.');
    try {
      const result = await adapter.checkDuplicate(data, { signal: request.signal });
      if (request.signal.aborted || !state.root.isConnected) return;
      if (result?.status === 'existing') {
        const url = pdfUrl(result.item?.publicUrl);
        state.existing = data;
        const action = url
          ? `<a class="se26-text-link" href="${esc(url)}" rel="noreferrer">기존 자료 보기</a>`
          : '<button type="button" class="se26-text-link" data-se26-existing>기존 자료 보기</button>';
        message(state, '이미 등록되어 있습니다.', action);
      } else if (result?.status === 'pending') {
        message(state, '먼저 접수된 시험지를 확인하고 있습니다.');
      } else if (result?.status === 'new') {
        state.draft = data;
        message(state, '같은 시험지를 찾지 못했습니다. 파일을 선택해 주세요.');
        state.root.querySelector('#se26-files').hidden = false;
      } else {
        message(state, '학교와 시험 구분을 확인해 다시 입력해 주세요.');
      }
    } catch {
      if (!request.signal.aborted && state.root.isConnected) message(state, '중복 여부를 확인하지 못했습니다. 다시 시도해 주세요.');
    }
  }

  function isAttachment(file) {
    const extension = file.name.split('.').pop().toLowerCase();
    return file.size > 0 && known(formats, extension) &&
      (!file.type || file.type === 'application/octet-stream' || file.type === formats[extension]);
  }

  function review(state, form) {
    reviewReset(state);
    const files = Array.from(form.elements.files.files);
    if (!state.draft || form.hidden || !files.length) return;
    if (!files.every(isAttachment)) {
      const error = form.querySelector('[data-se26-file-error]');
      error.textContent = '내용이 있는 PDF, JPG, PNG, WebP 파일을 선택해 주세요.';
      error.hidden = false;
      return;
    }
    const target = state.root.querySelector('[data-se26-review]');
    const exam = state.draft;
    target.innerHTML = `<h3 id="se26-review-title">요청 미리보기</h3><p><strong>${esc(exam.school)} · ${esc(exam.subject)}</strong><br>${esc(examDescription(exam))}</p>
      <ul>${files.map(file => `<li>${esc(file.name)}</li>`).join('')}</ul><p>이 화면은 미리보기입니다. 파일 전송과 실제 접수는 이루어지지 않았습니다.</p>`;
    target.hidden = false;
    target.focus();
  }

  function sync() {
    const root = outlet.querySelector('.se26');
    if (!root) tabs(outlet.querySelector('.ac25-library .nv20-collections'));
    if (root === (active?.root || null)) return;
    active?.listRequest?.abort();
    active?.checkRequest?.abort();
    active = root ? { root, listRequest: null, checkRequest: null, draft: null, existing: null } : null;
    if (!active) return;
    invalidate(active);
    list(active);
  }

  outlet.addEventListener('submit', event => {
    const form = event.target;
    const state = active;
    if (!state?.root.contains(form)) return;
    event.preventDefault();
    if (form.id === 'se26-search') {
      const filters = readFields(form);
      if (filters) list(state, filters);
    } else if (form.id === 'se26-check') duplicateCheck(state, form);
    else if (form.id === 'se26-files') review(state, form);
  });
  outlet.addEventListener('reset', event => {
    if (active?.root.contains(event.target) && event.target.id === 'se26-search') list(active);
  });
  function formChanged(event) {
    const state = active;
    if (!state?.root.contains(event.target)) return;
    const id = event.target.form?.id;
    if (id === 'se26-check') invalidate(state);
    if (id === 'se26-files') reviewReset(state);
  }
  outlet.addEventListener('input', formChanged);
  outlet.addEventListener('change', formChanged);
  outlet.addEventListener('click', event => {
    const state = active;
    if (!state?.root.contains(event.target)) return;
    if (event.target.closest('[data-se26-open]')) {
      const details = state.root.querySelector('[data-se26-details]');
      details.open = true;
      details.querySelector('[name="school"]').focus();
    } else if (event.target.closest('[data-se26-existing]') && state.existing) {
      const form = state.root.querySelector('#se26-search');
      for (const name of fieldNames) form.elements[name].value = state.existing[name];
      list(state, readFields(form));
      state.root.querySelector('#se26-search-title').focus();
    }
  });

  window.DSSchoolExamLibraryV26 = Object.freeze({ page });
  new MutationObserver(sync).observe(outlet, { childList: true });
  if (location.hash === '#school-exams') route();
  else if (location.hash === '#library') tabs(outlet.querySelector('.nv20-collections'));
  sync();
})();
