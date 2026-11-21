/* Load after the existing library page and catalog. */
(() => {
  'use strict';

  if (typeof libraryPage !== 'function') return;

  const renderOriginalLibrary = libraryPage;
  const state = { mode: 'unit', subject: '', unit: '', source: 'school', term: '' };
  const entities = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
  const escape = value => String(value ?? '').replace(/[&<>"']/g, char => entities[char]);

  function materials() {
    const seen = new Set();
    return (Array.isArray(window.DSCatalog) ? window.DSCatalog : []).filter(item => {
      if (typeof item?.sku !== 'string' || !/^NS-[A-Z0-9]+-\d+$/.test(item.sku) || !item.subject || !item.unit || seen.has(item.sku)) return false;
      seen.add(item.sku);
      return true;
    });
  }

  const option = (value, label, selected) => `<option value="${escape(value)}"${value === selected ? ' selected' : ''}>${escape(label)}</option>`;
  const unique = values => [...new Set(values)];

  const subjectOf = item => item.subject.replace(/\s+기초편$/, '');

  function subjectOptions(data) {
    return option('', '전체 과목', state.subject) + unique(data.map(subjectOf)).map(value => option(value, value, state.subject)).join('');
  }

  function unitOptions(data) {
    const units = unique(data.filter(item => !state.subject || subjectOf(item) === state.subject).map(item => item.unit));
    return option('', '전체 단원', state.unit) + units.map(value => option(value, value, state.unit)).join('');
  }

  function materialCard(item) {
    const preview = item.previewPages?.[0];
    const matchingPreview = typeof preview === 'string' && preview === `public-data/${item.sku}-1.png`;
    const samplePdf = item.pdf === `public-data/${item.sku}.pdf` ? item.pdf : '';
    const href = `#material/${encodeURIComponent(item.sku)}`;
    const previewPages = Array.isArray(item.previewPages) ? item.previewPages.length : 0;
    const name = `${item.subject} ${item.unit}`;
    return `<li class="lf19-material">
      ${matchingPreview ? `<a class="lf19-thumbnail" href="${href}" aria-label="${escape(name)} 지면 보기"><img src="${escape(preview)}" alt="" width="804" height="1137" loading="lazy"></a>` : ''}
      <div class="lf19-material-title"><span>${escape(item.subject)}</span><h3><a href="${href}">${escape(item.unit)}</a></h3>${previewPages ? `<small>공개 미리보기 ${previewPages}쪽</small>` : ''}</div>
      <div class="lf19-material-actions"><a class="lf19-quiet" href="${href}" aria-label="${escape(name)} 상세 보기">상세 보기</a>${samplePdf ? `<a class="lf19-download" href="${escape(samplePdf)}" download aria-label="${escape(name)} 미리보기 PDF 받기">미리보기 PDF <span aria-hidden="true">↓</span></a>` : ''}</div>
    </li>`;
  }

  function matchingMaterials(data) {
    const normalize = value => String(value || '').normalize('NFKC').replace(/\s+/g, '').toLowerCase();
    const term = normalize(state.term);
    return data.filter(item => (!state.subject || state.subject === subjectOf(item)) && (!state.unit || state.unit === item.unit) && (!term || normalize(`${item.subject} ${item.unit}`).includes(term)));
  }

  function unitResults(rows) {
    if (!rows.length) return '<div class="lf19-empty"><p>조건에 맞는 공개 자료가 없습니다.</p><button type="button" class="lf19-quiet" data-lf19-reset>검색 조건 지우기</button></div>';
    return `<ul class="lf19-materials">${rows.map(materialCard).join('')}</ul>`;
  }

  function unitPanel(data) {
    const rows = matchingMaterials(data);
    return `<div class="lf19-fields" role="group" aria-label="자료 범위">
      <label class="lf32-search">자료 검색<input type="search" data-lf19-search aria-label="자료 검색" aria-controls="lf19-results" placeholder="예: 정적분, 함수" value="${escape(state.term)}"></label>
      <label>과목<select data-lf19-field="subject" aria-controls="lf19-results">${subjectOptions(data)}</select></label>
      <label>단원<select data-lf19-field="unit" aria-controls="lf19-results">${unitOptions(data)}</select></label>
    </div>
    <div class="lf19-results-heading"><h2>공개 자료</h2><p class="lf19-count" role="status">${rows.length}건</p></div>
    <div id="lf19-results">${unitResults(rows)}</div>`;
  }

  function bookResult() {
    const school = state.source === 'school';
    const message = school ? '학교별 부교재 목록과 유사문항 자료가 아직 연결되지 않았습니다.' : '내 문제집을 선택할 수 있는 목록과 유사문항 자료가 아직 연결되지 않았습니다.';
    const next = school ? '<button type="button" class="lf19-quiet" data-lf19-mode="unit">과목·단원으로 찾기 <span aria-hidden="true">→</span></button>' : '<a class="lf19-quiet" href="#account" data-account-target="library">내 자료 확인 <span aria-hidden="true">→</span></a>';
    return `<div class="lf19-book-state"><div><h2>교재별 자료 연결 중</h2><p>${message}</p></div>${next}</div>`;
  }

  function bookPanel() {
    return `<div class="lf19-fields" role="group" aria-label="교재 선택">
      <label>교재 구분<select data-lf19-field="source" aria-controls="lf19-book-result">${option('school', '학교 부교재', state.source)}${option('personal', '내 문제집', state.source)}</select></label>
    </div><div id="lf19-book-result" aria-live="polite">${bookResult()}</div>`;
  }

  const modeLabels = [['unit', '과목·단원으로 찾기'], ['book', '교재로 찾기']];
  const panel = () => state.mode === 'book' ? bookPanel() : unitPanel(materials());

  libraryPage = function() {
    const original = renderOriginalLibrary();
    const template = document.createElement('template');
    template.innerHTML = original;
    const filters = template.content.querySelector('.resource-filters');
    const results = template.content.querySelector('#library-results');
    if (!filters || !results) return original;
    results.remove();
    filters.outerHTML = `<section class="lf19-finder" aria-label="내신 자료 찾기">
      <div class="lf19-modes" role="group" aria-label="자료 찾는 방법">${modeLabels.map(([id, label]) => `<button type="button" data-lf19-mode="${id}" aria-controls="lf19-panel" aria-pressed="${state.mode === id}">${label}</button>`).join('')}</div>
      <div class="lf19-panel" id="lf19-panel">${panel()}</div>
    </section>`;
    return template.innerHTML;
  };

  if (typeof materialPage === 'function') {
    const renderOriginalMaterial = materialPage;
    materialPage = function() {
      const original = renderOriginalMaterial();
      const template = document.createElement('template');
      template.innerHTML = original;
      const full = template.content.querySelector('.material-info a[href^="https://www.deltaskill.co.kr/naesin/?x="]');
      if (!full) return original;
      full.href = '#account';
      full.removeAttribute('target');
      full.removeAttribute('rel');
      full.setAttribute('data-account-target', 'library');
      full.setAttribute('aria-describedby', 'lf19-full-state');
      full.textContent = '내 자료에서 전체 파일 확인';
      const state = document.createElement('p');
      state.id = 'lf19-full-state';
      state.className = 'lf19-full-state';
      state.textContent = '로그인 후 내 자료에 있는 파일을 받을 수 있습니다. 공개 미리보기는 이 페이지에서 받을 수 있습니다.';
      const duplicate = template.content.querySelector('.detail-owned-link');
      if (duplicate) duplicate.replaceWith(state);
      else full.after(state);
      return template.innerHTML;
    };
  }

  document.addEventListener('click', event => {
    const reset = event.target.closest('[data-lf19-reset]');
    if (reset?.closest('.lf19-finder')) {
      state.term = ''; state.subject = ''; state.unit = '';
      const root = reset.closest('.lf19-finder');
      root.querySelector('#lf19-panel').innerHTML = panel();
      root.querySelector('[data-lf19-search]')?.focus({preventScroll:true});
      return;
    }
    const control = event.target.closest('[data-lf19-mode]');
    const root = control?.closest('.lf19-finder');
    const mode = control?.dataset.lf19Mode;
    if (!root || !['unit', 'book'].includes(mode) || state.mode === mode) return;
    state.mode = mode;
    const tabs = root.querySelectorAll('.lf19-modes [data-lf19-mode]');
    for (const button of tabs) button.setAttribute('aria-pressed', String(button.dataset.lf19Mode === mode));
    root.querySelector('#lf19-panel').innerHTML = panel();
    if (!control.isConnected) Array.from(tabs).find(button => button.dataset.lf19Mode === mode)?.focus({ preventScroll: true });
  });

  document.addEventListener('input', event => {
    const control = event.target;
    if (!control.hasAttribute('data-lf19-search')) return;
    const root = control.closest('.lf19-finder');
    if (!root) return;
    state.term = control.value;
    const rows = matchingMaterials(materials());
    root.querySelector('.lf19-count').textContent = `${rows.length}건`;
    root.querySelector('#lf19-results').innerHTML = unitResults(rows);
  });

  document.addEventListener('change', event => {
    const control = event.target;
    const root = control.closest('.lf19-finder');
    const field = control.dataset.lf19Field;
    if (!root || !field) return;

    if (field === 'source') {
      state.source = control.value;
      root.querySelector('#lf19-book-result').innerHTML = bookResult();
      return;
    }

    const data = materials();
    if (field === 'subject') {
      state.subject = control.value;
      state.unit = '';
      root.querySelector('[data-lf19-field="unit"]').innerHTML = unitOptions(data);
    } else if (field === 'unit') {
      state.unit = control.value;
    } else {
      return;
    }
    const rows = matchingMaterials(data);
    root.querySelector('.lf19-count').textContent = `${rows.length}건`;
    root.querySelector('#lf19-results').innerHTML = unitResults(rows);
  });

  if (typeof route === 'function' && (location.hash === '#library' || location.hash.startsWith('#material/'))) route();
})();
