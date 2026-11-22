/* Local request preview only. Load after the existing route add-ons. */
(() => {
  'use strict';

  if (typeof route !== 'function' || typeof header !== 'function') return;
  const priorRoute = route;
  const limitCount = 5;
  const limitBytes = 10 * 1024 * 1024;
  const formats = { jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', webp: 'image/webp', pdf: 'application/pdf' };
  const levels = { similar: '원문과 비슷하게', easier: '조금 쉽게', harder: '조금 어렵게' };
  const purposes = { practice: '개인 연습', lesson: '수업 자료' };
  const entities = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
  const escape = value => String(value ?? '').replace(/[&<>"']/g, char => entities[char]);
  const contains = (bytes, code, offset = 0) => [...code].every((letter, index) => bytes[offset + index] === letter.charCodeAt(0));
  const sizeLabel = bytes => bytes >= 1024 * 1024 ? `${(bytes / (1024 * 1024)).toFixed(1)}MB` : `${Math.max(1, Math.ceil(bytes / 1024))}KB`;
  let attachments = [];
  let generation = 0;
  let checking = false;
  let active = false;

  function detectedType(bytes) {
    if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return 'image/jpeg';
    if ([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a].every((number, index) => bytes[index] === number)) return 'image/png';
    if (contains(bytes, 'RIFF') && contains(bytes, 'WEBP', 8)) return 'image/webp';
    if (contains(bytes, '%PDF-')) return 'application/pdf';
    return '';
  }

  async function validateFile(file) {
    if (!file.size) return { error: '내용이 없는 파일입니다.' };
    if (file.size > limitBytes) return { error: '10MB를 초과했습니다.' };
    const type = formats[file.name.split('.').pop().toLowerCase()];
    const mime = file.type.toLowerCase();
    if (!type || (mime && mime !== 'application/octet-stream' && mime !== type)) return { error: 'JPG, PNG, WebP, PDF 파일을 선택해 주세요.' };
    try {
      const bytes = new Uint8Array(await file.slice(0, 12).arrayBuffer());
      if (detectedType(bytes) !== type) return { error: '확장자와 파일 내용이 일치하지 않습니다.' };
    } catch {
      return { error: '파일을 읽을 수 없습니다.' };
    }
    return { file, type };
  }

  function page() {
    const teacher = typeof role !== 'undefined' && role === 'teacher';
    return `<section class="upr22" aria-labelledby="upr22-title">
      <header class="upr22-heading"><h1 id="upr22-title">유사문항 제작 요청</h1><p>요청서 미리보기 · 아직 전송되지 않습니다</p></header>
      <form id="upr22-form" class="upr22-form" method="post" autocomplete="off" enctype="multipart/form-data">
        <section class="upr22-sheet" aria-labelledby="upr22-file-heading">
          <h2 id="upr22-file-heading">원본 파일</h2>
          <label class="upr22-file-field" for="upr22-files"><span>사진·PDF 선택</span><input id="upr22-files" type="file" name="files" accept="image/jpeg,image/png,image/webp,application/pdf,.jpg,.jpeg,.png,.webp,.pdf" multiple aria-describedby="upr22-file-hint"></label>
          <p id="upr22-file-hint" class="upr22-note">JPG·PNG·WebP·PDF, 최대 5개 · 각 10MB. 선택 파일은 이 페이지를 벗어나면 지워집니다.</p>
          <p id="upr22-file-error" class="upr22-error" role="alert" hidden></p>
          <ul id="upr22-list" class="upr22-attachments" aria-label="선택한 원본 파일"></ul>
        </section>
        <section class="upr22-sheet" aria-labelledby="upr22-scope-heading">
          <h2 id="upr22-scope-heading">만들 자료</h2>
          <div class="upr22-fields">
            <label>용도<select name="purpose"><option value="practice"${teacher ? '' : ' selected'}>개인 연습</option><option value="lesson"${teacher ? ' selected' : ''}>수업 자료</option></select></label>
            <label>원본 문항 번호<input name="original" type="text" maxlength="80" placeholder="예: 3, 7–9"></label>
            <label>만들 문항 수<input name="quantity" type="number" inputmode="numeric" min="1" step="1" required></label>
            <label>난이도<select name="level">${Object.entries(levels).map(([value, label]) => `<option value="${value}">${label}</option>`).join('')}</select></label>
            <label class="upr22-wide">요청 메모 (선택)<textarea name="memo" rows="3" maxlength="400"></textarea></label>
          </div>
          <aside class="upr22-estimate" id="upr22-estimate"${teacher ? '' : ' hidden'}><strong>수업 자료 견적 기준</strong><p>검수 후 제공한 문항 수 × 문항당 단가</p><small>문항당 단가는 확정 전입니다.</small></aside>
        </section>
        <section class="upr22-sheet upr22-contribute" aria-labelledby="upr22-contribute-heading">
          <h2 id="upr22-contribute-heading">학교 내신 기출 자료 제공</h2>
          <p class="upr22-note">자료 제공은 제작 요청과 별도입니다. 중복, 개인정보, 제공 권한을 검토한 뒤 보상을 안내합니다.</p>
          <label class="upr22-check"><input name="contribution" type="checkbox" aria-controls="upr22-contribute-source"> 학교 기출 자료의 제공 검토에 동의합니다.</label>
          <label class="upr22-source-field" id="upr22-contribute-source" hidden>자료 출처 <small>선택</small><input name="source" type="text" maxlength="100" placeholder="학년도·학기·과목"></label>
        </section>
        <div class="upr22-actions"><button class="upr22-primary" type="submit">요청서 미리보기</button><p class="upr22-error" id="upr22-form-error" role="alert" hidden></p></div>
        <section class="upr22-sheet upr22-summary" id="upr22-summary" tabindex="-1" aria-label="제작 요청서 미리보기" hidden></section>
      </form>
    </section>`;
  }

  function notifyError(form, selector, message) {
    const element = form.querySelector(selector);
    element.textContent = message;
    element.hidden = !message;
  }

  function paintFiles(form) {
    form.querySelector('#upr22-list').innerHTML = attachments.map(({ file, url, type }, index) => `<li>
      <div class="upr22-attachment-line"><div class="upr22-filename"><strong>${escape(file.name)}</strong><small>${sizeLabel(file.size)}</small></div><button type="button" data-upr22-remove="${index}" aria-label="${escape(file.name)} 선택 해제">빼기</button></div>
      ${type.startsWith('image/') ? `<details><summary>사진 보기</summary>${url ? `<img src="${escape(url)}" alt="선택한 파일 미리보기" loading="lazy">` : '<p>이 사진을 미리 볼 수 없습니다.</p>'}</details>` : ''}
    </li>`).join('');
  }

  function resetSummary(form) {
    const summary = form.querySelector('#upr22-summary');
    summary.hidden = true;
    summary.textContent = '';
    notifyError(form, '#upr22-form-error', '');
  }

  async function chooseFiles(input, form) {
    const selected = Array.from(input.files ?? []);
    input.value = '';
    if (!selected.length || checking) return;
    if (attachments.length + selected.length > limitCount) {
      notifyError(form, '#upr22-file-error', '파일은 최대 5개까지 선택할 수 있습니다.');
      return;
    }
    const round = generation;
    checking = true;
    input.disabled = true;
    try {
      const results = await Promise.all(selected.map(validateFile));
      if (round !== generation || !form.isConnected) return;
      const errors = [];
      for (const result of results) {
        if (result.error) { errors.push(result.error); continue; }
        const { file, type } = result;
        let url = '';
        if (type.startsWith('image/')) {
          try { url = URL.createObjectURL(file); } catch { /* preview can still list the selected file */ }
        }
        attachments.push({ file, url, type });
      }
      notifyError(form, '#upr22-file-error', [...new Set(errors)].join(' '));
      resetSummary(form);
      paintFiles(form);
    } finally {
      if (round === generation) {
        checking = false;
        input.disabled = false;
      }
    }
  }

  function preview(form) {
    const fd = new FormData(form);
    const get = name => String(fd.get(name) || '').trim();
    const quantity = Number(get('quantity'));
    const purpose = get('purpose');
    const level = get('level');
    if (checking || !attachments.length || !Number.isSafeInteger(quantity) || quantity < 1 || !Object.hasOwn(purposes, purpose) || !Object.hasOwn(levels, level)) {
      const message = checking ? '파일을 확인하고 있습니다.' : !attachments.length ? '원본 사진 또는 PDF를 먼저 선택해 주세요.' : '만들 자료의 용도와 문항 수, 난이도를 확인해 주세요.';
      notifyError(form, '#upr22-form-error', message);
      return;
    }
    const summary = form.querySelector('#upr22-summary');
    const fields = [['용도', purposes[purpose]], ['선택 파일', `${attachments.length}개`], ['원본 문항 번호', get('original')], ['요청 문항 수', `${quantity}문항`], ['난이도', levels[level]], ['요청 메모', get('memo')]].filter(([, value]) => value);
    summary.innerHTML = `<h2>요청서 미리보기</h2><p class="upr22-note">아직 전송되지 않았습니다.</p><dl>${fields.map(([label, value]) => `<div><dt>${label}</dt><dd>${escape(value)}</dd></div>`).join('')}</dl>
      ${purpose === 'lesson' ? '<p class="upr22-summary-line"><strong>수업 자료 견적</strong> 실제 제공 문항 수 × 문항당 단가 · 단가 확정 전</p>' : ''}
      ${fd.has('contribution') ? `<p class="upr22-summary-line"><strong>자료 제공 검토에 동의</strong>${get('source') ? ` · ${escape(get('source'))}` : ''} · 보상은 검토 후 안내</p>` : ''}`;
    notifyError(form, '#upr22-form-error', '');
    summary.hidden = false;
    summary.focus({ preventScroll: true });
    summary.scrollIntoView({ block: 'nearest' });
  }

  function discard() {
    generation += 1;
    for (const attachment of attachments) if (attachment.url) URL.revokeObjectURL(attachment.url);
    attachments = [];
    checking = false;
    active = false;
  }

  function navigate(event) {
    if (location.hash !== '#upload') {
      if (active) discard();
      priorRoute(event);
      return;
    }
    if (active && document.getElementById('upr22-form')) return;
    const content = document.getElementById('content');
    if (!content) return;
    if (typeof cinemaTimer !== 'undefined') clearTimeout(cinemaTimer);
    if (typeof clock !== 'undefined') clearInterval(clock);
    if (typeof timed !== 'undefined') timed = false;
    if (typeof diagnosticClock !== 'undefined') clearInterval(diagnosticClock);
    header('upload');
    content.innerHTML = page();
    window.scrollTo(0, 0);
    content.focus({ preventScroll: true });
    active = true;
  }

  document.addEventListener('change', event => {
    const field = event.target;
    const form = field.closest?.('#upr22-form');
    if (!form) return;
    if (field.id === 'upr22-files') { void chooseFiles(field, form); return; }
    resetSummary(form);
    if (field.name === 'purpose') form.querySelector('#upr22-estimate').hidden = field.value !== 'lesson';
    if (field.name === 'contribution') form.querySelector('#upr22-contribute-source').hidden = !field.checked;
  });
  document.addEventListener('input', event => {
    const form = event.target.closest?.('#upr22-form');
    if (form && event.target.id !== 'upr22-files') resetSummary(form);
  });
  document.addEventListener('click', event => {
    const control = event.target.closest?.('[data-upr22-remove]');
    const form = control?.closest('#upr22-form');
    const index = Number(control?.dataset.upr22Remove);
    if (!form || !Number.isInteger(index) || index < 0 || index >= attachments.length || checking) return;
    const [attachment] = attachments.splice(index, 1);
    if (attachment.url) URL.revokeObjectURL(attachment.url);
    paintFiles(form);
    resetSummary(form);
    form.querySelector('#upr22-files').focus();
  });
  document.addEventListener('submit', event => {
    if (event.target.id !== 'upr22-form') return;
    event.preventDefault();
    preview(event.target);
  });

  window.addEventListener('pagehide', () => {
    if (!active) return;
    discard();
    document.getElementById('content').textContent = '';
  });
  window.addEventListener('pageshow', event => { if (event.persisted && location.hash === '#upload') navigate(); });
  window.removeEventListener('hashchange', priorRoute);
  route = navigate;
  window.addEventListener('hashchange', navigate);
  if (location.hash === '#upload') navigate();
})();
