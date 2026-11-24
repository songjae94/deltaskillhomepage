/* Account presentation only. Existing sections, data and delegated actions remain. */
(() => {
  'use strict';
  const renderAccount = DSAccountViews.account;
  const keys = ['materials', 'designs', 'study', 'units', 'saved'];
  const normalizeTarget = value => value === 'library' ? 'materials' : keys.includes(value) ? value : '';
  let pendingTarget = '', frame = 0, renderGeneration = 0;
  const normalize = value => String(value || '').replace(/[\s·ⅠⅡⅢ]/g, c => ({'Ⅰ':'I','Ⅱ':'II','Ⅲ':'III'}[c] || '')).toLowerCase();
  function previewFor(title) {
    const name = normalize(title);
    const matches = (window.DSCatalog || []).filter(item => name === normalize(item.subject + item.unit) || (item.sku && name.includes(normalize(item.sku))));
    matches.sort((a, b) => normalize(b.subject + b.unit).length - normalize(a.subject + a.unit).length);
    if (!matches.length || (matches[1] && normalize(matches[0].subject + matches[0].unit).length === normalize(matches[1].subject + matches[1].unit).length)) return '';
    const src = matches[0].previewPages?.[0];
    return typeof src === 'string' && /^public-data\/[A-Za-z0-9-]+\.png$/.test(src) ? src : '';
  }
  function markActive() {
    if (location.hash !== '#account') return;
    const root = document.querySelector('.account-polish-v19'); if (!root) return;
    const sections = Array.from(root.querySelectorAll(':scope > .account-section'));
    const line = 170;
    const current = sections.filter(section => section.getBoundingClientRect().top <= line).at(-1) || sections[0];
    for (const button of root.querySelectorAll('[data-account-section]')) {
      if (button.getAttribute('aria-controls') === current?.id) button.setAttribute('aria-current', 'location');
      else button.removeAttribute('aria-current');
    }
  }
  function applyTarget(settled = document.querySelector('.account-polish-v19')?.dataset.accountLoading !== 'true') {
    if (location.hash !== '#account') return;
    const key = pendingTarget, section = key && document.getElementById('account-' + key);
    if (section) { section.focus({ preventScroll: true }); section.scrollIntoView({ block: 'start', behavior: 'auto' }); if (settled) pendingTarget = ''; }
    markActive();
  }
  function openSection(value) {
    const key = normalizeTarget(value); if (!key) return false;
    pendingTarget = key;
    if (location.hash !== '#account') location.hash = '#account';
    else requestAnimationFrame(() => applyTarget());
    return true;
  }
  DSAccountViews.account = function (state = {}) {
    const template = document.createElement('template'); template.innerHTML = renderAccount(state);
    const root = template.content.querySelector('.account-dashboard'); if (!root) return template.innerHTML;
    root.classList.add('account-polish-v19');
    root.dataset.accountRole = state.role === 'teacher' ? 'teacher' : 'student';
    root.dataset.signedIn = String(Boolean(state.signedIn));
    root.dataset.accountLoading = String(Boolean(state.loading));
    const heading = root.querySelector('.account-heading');
    if (state.signedIn && !state.loading) heading?.insertAdjacentHTML('afterend', DSWelcomePoints.panel(state.welcomePoints, {pass:state.membership}));
    const identity = heading?.firstElementChild;
    if (identity) {
      const label = document.createElement('span'); label.className = 'ap19-role';
      label.textContent = state.role === 'teacher' ? '선생님의 작업 공간' : '학생의 학습 공간'; identity.prepend(label);
      if (!state.signedIn) {
        const note = document.createElement('p'); note.className = 'ap19-welcome'; note.textContent = '로그인 후 자료와 기록을 확인하세요.'; identity.append(note);
      }
    }
    if (heading) {
      const photo = document.createElement('figure'); photo.className = 'ap19-masthead-photo';
      photo.innerHTML = '<img src="assets/editorial/paper-flatlay-v15.png" width="1024" height="1536" alt="공개 지면과 필기 도구를 놓은 프린트 연출"><img class="ap19-public-page" src="public-data/NS-MI1B-05-1.png" width="804" height="1137" alt="" aria-hidden="true"><figcaption>DELTASKILL · 공개 지면</figcaption>';
      heading.append(photo);
      heading.querySelector('.account-class-link')?.remove();
    }
    const nav = root.querySelector('.account-nav');
    if (nav) {
      const teacher = state.role === 'teacher';
      const items = teacher ? [['materials','내 자료'],['designs','내 디자인'],['study','학습 기록']] : [['materials','내 자료'],['study','내 공부 기록'],['units','단원별 실력'],['designs','내 디자인']];
      nav.innerHTML = `<div class="ap19-main-nav">${items.map(([key,label]) => `<button type="button" data-account-section="${key}" aria-controls="account-${key}">${label}<span aria-hidden="true">↗</span></button>`).join('')}</div><div class="ap19-sub-nav"><button type="button" data-account-section="saved" aria-controls="account-saved">저장한 구성 <small>이 기기</small></button>${teacher ? '<button type="button" data-account-section="units" aria-controls="account-units">단원별 실력</button>' : ''}<a href="#account-settings">계정 관리</a><a href="#help">이용 안내</a></div>`;
    }
    const order = state.role === 'teacher' ? ['materials','designs','saved','units','study'] : ['materials','study','units','designs','saved'];
    for (const key of order) { const section = root.querySelector('#account-' + key); if (section) root.append(section); }
    for (const bundle of root.querySelectorAll('.account-material-bundle')) {
      const title = bundle.querySelector('.account-material-title h3')?.textContent || '';
      const visual = document.createElement('div'); visual.className = 'ap19-material-paper'; visual.setAttribute('aria-hidden', 'true');
      const preview = previewFor(title);
      if (preview) {
        const image = document.createElement('img'); image.src = preview; image.alt = ''; image.loading = 'lazy'; image.width = 804; image.height = 1137; visual.append(image);
      } else {
        const brand = document.createElement('small'); brand.textContent = 'DELTASKILL';
        const name = document.createElement('strong'); name.textContent = title;
        const rule = document.createElement('i'); visual.append(brand, name, rule);
      }
      bundle.prepend(visual);
      const body = document.createElement('div'); body.className = 'ap19-material-body';
      for (const node of Array.from(bundle.children)) if (node !== visual) body.append(node);
      bundle.append(body);
    }
    const generation = ++renderGeneration;
    requestAnimationFrame(() => { if (generation === renderGeneration) applyTarget(!state.loading); });
    return template.innerHTML;
  };
  document.addEventListener('click', event => {
    const link = event.target.closest('a[href="#account"][data-account-target]');
    if (link) { pendingTarget = normalizeTarget(link.dataset.accountTarget); if (location.hash === '#account') requestAnimationFrame(() => applyTarget()); return; }
    const button = event.target.closest('[data-account-section]');
    if (button && location.hash === '#account') openSection(button.dataset.accountSection);
  }, true);
  window.addEventListener('scroll', () => {
    if (location.hash !== '#account' || frame) return;
    frame = requestAnimationFrame(() => { frame = 0; markActive(); });
  }, { passive: true });
  window.DSAccountPolishV19 = { openSection, previewFor, normalizeTarget };
  if (location.hash === '#account' && typeof refreshAccount === 'function') refreshAccount();
})();
