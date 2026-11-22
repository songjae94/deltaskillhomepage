/* Interior-only accessibility and honest preview labels. Load after the app. */
(() => {
  'use strict';
  const content = document.getElementById('content');
  if (!content) return;
  let queued = false;
  const schedule = () => {
    if (queued) return;
    queued = true;
    queueMicrotask(() => { queued = false; enhance(); });
  };
  function enhance() {
    const search = content.querySelector('#lib-term');
    if (search) {
      let clear = content.querySelector('[data-clear-library-v17]');
      if (!clear) {
        clear = document.createElement('button');
        clear.type = 'button';
        clear.className = 'library-clear-v17';
        clear.setAttribute('data-clear-library-v17', '');
        clear.setAttribute('aria-label', '검색어 지우기');
        clear.textContent = '지우기';
        search.parentElement.append(clear);
      }
      clear.hidden = !search.value;
      search.setAttribute('aria-controls', 'library-results');
    }
    for (const button of content.querySelectorAll('[data-quick-hint], [data-hint]')) {
      const hint = button.closest('.quick-paper')?.querySelector('.quick-hint');
      if (!hint) continue;
      if (!hint.id) hint.id = 'study-hint-v17';
      button.setAttribute('aria-controls', hint.id);
      button.setAttribute('aria-expanded', String(!hint.hidden));
    }
    const practice = content.querySelector('.cv7-practice-options');
    if (practice && !content.querySelector('.csat-scope-v17')) {
      const note = document.createElement('p');
      note.className = 'csat-scope-v17';
      note.textContent = '미적분Ⅰ · 정적분 공개 문항으로 연습합니다. 위 시험의 기출 문항을 푸는 평가는 아닙니다.';
      practice.before(note);
    }
    const demo = content.querySelector('.classroom-demo-notice');
    if (demo && !demo.querySelector('.classroom-scope-v17')) {
      const note = document.createElement('span');
      note.className = 'classroom-scope-v17';
      note.textContent = '실제 학생에게 배부되지 않습니다. 예시 수업 초안은 새로고침하면 지워집니다.';
      demo.append(note);
    }
    const assignment = content.querySelector('[data-class-action="create-assignment"]');
    if (demo && assignment && assignment.textContent.trim() !== '예시 자료 구성하기') {
      assignment.textContent = '예시 자료 구성하기';
    }
  }
  // Existing handlers rebuild these controls. Restore their exact counterpart,
  // or a usable page selector when the pressed arrow becomes disabled.
  document.addEventListener('click', event => {
    const control = event.target.closest('button');
    if (!control || !content.contains(control)) return;
    if (control.hasAttribute('data-clear-library-v17')) {
      const search = content.querySelector('#lib-term');
      if (search) {
        search.value = '';
        search.dispatchEvent(new Event('input', { bubbles: true }));
        search.focus({ preventScroll: true });
        schedule();
      }
      return;
    }
    const attribute = ['data-study-tab', 'data-pdf-page', 'data-pdf-next', 'data-pdf-prev']
      .find(name => control.hasAttribute(name));
    if (attribute && document.activeElement === control) {
      const value = control.getAttribute(attribute);
      queueMicrotask(() => {
        if (control.isConnected) return;
        const replacement = Array.from(content.querySelectorAll('button[' + attribute + ']'))
          .find(button => button.getAttribute(attribute) === value && !button.disabled);
        const currentPage = content.querySelector('[data-pdf-page][aria-pressed="true"]');
        (replacement || currentPage)?.focus({ preventScroll: true });
      });
    }
    if (control.matches('[data-quick-hint], [data-hint]')) schedule();
  }, true);
  document.addEventListener('input', event => {
    if (event.target.id === 'lib-term') schedule();
  });
  new MutationObserver(schedule).observe(content, { childList: true, subtree: true });
  enhance();
})();
