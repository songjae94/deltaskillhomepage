/* Preserve direct paths to existing production features. No operational requests. */
(() => {
  'use strict';
  const main = document.getElementById('content');
  if (!main) return;

  const origin = 'https://www.deltaskill.co.kr';
  const notebook = ['/study/index.html?exam=school&item=notebook#note', '기존 오답노트'];
  const orderLookup = ['/orders/', '주문 조회'];
  const pass = ['/pass/', '이용권'];
  let scheduled = false;

  function existingLink(url) {
    return Array.from(main.querySelectorAll('a[href]')).some(anchor => anchor.getAttribute('href') === url);
  }

  function place(key, label, links, target, insert = 'append') {
    if (!target || main.querySelector(`[data-existing-services-v24="${key}"]`)) return;
    const missing = links.map(([path, text]) => [origin + path, text]).filter(([url]) => !existingLink(url));
    if (!missing.length) return;

    const group = document.createElement('nav');
    group.className = 'existing-services-v24';
    group.dataset.existingServicesV24 = key;
    group.setAttribute('aria-label', label);
    for (const [url, text] of missing) {
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.target = '_blank';
      anchor.rel = 'noopener';
      anchor.textContent = text;
      const arrow = document.createElement('span');
      arrow.setAttribute('aria-hidden', 'true');
      arrow.textContent = '↗';
      const a11y = document.createElement('span');
      a11y.className = 'sr-only';
      a11y.textContent = ' 새 탭';
      anchor.append(arrow, a11y);
      group.append(anchor);
    }
    target[insert](group);
  }

  function footerLinks(links, key, label) {
    const footer = main.querySelector('.work-footer');
    if (footer) place(key, label, links, footer, 'before');
    else place(key, label, links, main.querySelector('.work-surface'));
  }

  function catalog(exam) {
    const audience = typeof role !== 'undefined' && role === 'teacher' ? 'teacher' : 'student';
    return [`/materials/index.html?exam=${exam}&audience=${audience}`, '전체 자료 목록'];
  }

  function enhance() {
    const page = location.hash.slice(1);
    if (page.startsWith('material/')) {
      let sku;
      try { sku = decodeURIComponent(page.slice('material/'.length)); } catch { return; }
      if (/^NS-[A-Z0-9]+-\d+$/.test(sku)) {
        place('purchase', '기존 상품 구매', [[`/naesin/?x=${encodeURIComponent(sku)}`, '이 자료 구매 안내']], main.querySelector('.detail-actions'), 'after');
      }
    } else if (page === 'account') {
      if (!window.DSService?.session()) return;
      place('account-materials', '기존 이용권과 주문 조회', [pass, ['/my/', '이용권 관리'], orderLookup], main.querySelector('#account-materials'));
      place('account-study', '기존 학습 기록 열기', [notebook, ['/analysis/index.html?view=notes', '수능 분석 기록']], main.querySelector('#account-study'));
    } else if (page === 'student' || page === 'timed') {
      footerLinks([notebook], 'student', '기존 공부 기능');
    } else if (page === 'csat') {
      place('csat', '기존 수능 자료', [['/features/prediction.html', '번호별 예상 주제'], catalog('csat')], main.querySelector('.cl20-archive, .sn27-archive'));
    } else if (page === 'library') {
      const exam = main.querySelector('.resource-surface')?.dataset.collection === 'exams' ? 'csat' : 'school';
      footerLinks([catalog(exam)], 'library', '기존 자료실 목록');
    } else if (page === 'teacher' || page === 'studio') {
      footerLinks([['/features/teacher.html?exam=school&audience=teacher', '강사 소개 페이지']], 'teacher', '기존 강사 소개');
    }
  }

  function schedule() {
    if (scheduled) return;
    scheduled = true;
    queueMicrotask(() => { scheduled = false; enhance(); });
  }

  new MutationObserver(schedule).observe(main, { childList: true, subtree: true });
  window.addEventListener('hashchange', schedule);
  window.addEventListener('ds-session-ready', schedule);
  enhance();
})();
