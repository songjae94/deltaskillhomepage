/* Student-only class materials. The member integration owns all access checks. */
(() => {
  'use strict';

  const main = document.getElementById('content');
  const member = window.DSService;
  const originalLibrary = libraryPage;
  const originalAccount = DSAccountViews.account;
  const previousRoute = route;
  const summary = {
    checking: '연결 확인 중',
    signedOut: '선생님 연결 후 이용',
    unlinked: '선생님 연결 후 이용',
    unavailable: '연결 확인 불가',
    active: ''
  };
  const detail = {
    checking: '선생님 연결을 확인하고 있어요.',
    signedOut: '로그인하고 선생님과 연결하면 수업자료를 볼 수 있어요.',
    unlinked: '선생님과 연결하면 수업자료를 볼 수 있어요.',
    unavailable: '선생님 연결 여부를 확인할 수 없어요.'
  };
  let epoch = 0;
  let status = 'checking';
  let materials = [];

  const isAcademy = () => Boolean(main.querySelector('.ac25-library'));
  const canOpen = () => status === 'active' && member.session();
  const isId = value => typeof value === 'string' && /^[A-Za-z0-9_-]{1,128}$/.test(value);
  const watchedPage = () => main.querySelector('.nv20-collections, .account-dashboard .ac25-account-entry');

  function entry(active = false, account = false) {
    return `<button type="button" class="${account ? 'ac25-account-entry' : 'ac25-collection-entry'}" data-ac25-open${account ? '' : ' data-library-view="academy"'}${active ? ' aria-pressed="true"' : account ? '' : ' aria-pressed="false"'}${canOpen() ? '' : ' disabled'}><span>수업자료</span><small data-ac25-note>${summary[status]}</small></button>`;
  }

  libraryPage = function () {
    const template = document.createElement('template');
    template.innerHTML = originalLibrary.apply(this, arguments);
    const tabs = template.content.querySelector('.nv20-collections');
    if (tabs) {
      const request = tabs.querySelector('.upload-entry-v22');
      if (request) request.insertAdjacentHTML('beforebegin', entry());
      else tabs.insertAdjacentHTML('beforeend', entry());
    }
    return template.innerHTML;
  };

  DSAccountViews.account = function (state = {}) {
    const html = originalAccount.apply(this, arguments);
    if (state.role === 'teacher') return html;
    const template = document.createElement('template');
    template.innerHTML = html;
    template.content.querySelector('.account-dashboard .ap19-sub-nav')?.insertAdjacentHTML('afterbegin', entry(false, true));
    return template.innerHTML;
  };

  function page() {
    return `<section class="work-surface resource-surface ac25-library" data-collection="academy">
      <header class="ac25-heading">
        <div><a class="ac25-breadcrumb" href="#library" data-library-view="school">자료실</a><h1>수업자료</h1><p>선생님이 나에게 배부한 자료</p></div>
        <img src="assets/editorial/paper-flatlay-v15-delivery.webp" alt="" width="1536" height="1024" decoding="async">
      </header>
      <nav class="nv20-collections" aria-label="자료실 분류">
        <a href="#library" data-library-view="school">내신 자료</a>
        <a href="#library" data-library-view="exams">기출·해설</a>
        ${entry(true)}
      </nav>
      <section class="ac25-panel" aria-label="내 수업자료" data-ac25-panel></section>
      ${compactFooter()}
    </section>`;
  }

  function textNode(tag, text, className) {
    const node = document.createElement(tag);
    node.className = className || '';
    node.textContent = text;
    return node;
  }

  function paint() {
    for (const button of main.querySelectorAll('[data-ac25-open]')) {
      button.disabled = !canOpen();
      button.querySelector('[data-ac25-note]').textContent = summary[status];
    }
    const panel = main.querySelector('[data-ac25-panel]');
    if (!panel) return;
    const body = document.createDocumentFragment();
    if (!canOpen() || materials.length === 0) {
      const message = textNode('p', detail[status] || '아직 배부된 수업자료가 없어요.', 'ac25-state');
      message.setAttribute('role', 'status');
      body.append(message);
      if (status === 'signedOut') {
        const login = textNode('a', '로그인', 'ac25-login');
        login.href = '#login';
        body.append(login);
      }
    } else {
      const list = document.createElement('ul');
      list.className = 'ac25-materials';
      for (const item of materials) {
        const row = document.createElement('li');
        const label = document.createElement('div');
        const byline = [item.teacherName, item.academyName].filter(value => typeof value === 'string' && value.trim()).join(' · ');
        label.append(textNode('h2', item.title));
        if (byline) label.append(textNode('p', byline));
        const download = textNode('button', '다운로드', 'ac25-download');
        download.type = 'button';
        download.dataset.ac25Download = item.id;
        download.setAttribute('aria-label', item.title + ' 다운로드');
        row.append(label, download);
        list.append(row);
      }
      const feedback = textNode('p', '', 'ac25-download-status');
      feedback.setAttribute('role', 'status');
      body.append(list, feedback);
    }
    panel.replaceChildren(body);
  }

  function reset() {
    ++epoch;
    status = 'checking';
    materials = [];
  }

  async function refresh() {
    reset();
    if (!watchedPage()) return;
    const generation = epoch;
    const showMaterials = isAcademy();
    paint();
    await member.ready;
    if (generation !== epoch) return;

    const service = window.DSClassMaterialsService;
    if (!member.session()) status = 'signedOut';
    else if (typeof service?.access !== 'function' || typeof service?.list !== 'function' || typeof service?.download !== 'function') status = 'unavailable';
    else {
      try {
        const result = await (showMaterials ? service.list() : service.access());
        if (generation !== epoch) return;
        if (result?.connection === 'unlinked') status = 'unlinked';
        else if (result?.connection !== 'active' || !member.session()) status = 'unavailable';
        else {
          if (showMaterials) {
            if (!Array.isArray(result.items) || !result.items.every(item => isId(item?.id) && typeof item.title === 'string' && item.title.trim())) throw new Error('invalid_materials');
            materials = result.items;
          }
          status = 'active';
        }
      } catch {
        if (generation !== epoch) return;
        status = member.session() ? 'unavailable' : 'signedOut';
      }
    }
    paint();
  }

  function academyHeader() {
    header('library');
    document.title = '수업자료 · DELTASKILL';
  }

  function navigate() {
    if (location.hash === '#content') return previousRoute.apply(this, arguments);
    reset();
    // Run the existing route's teardown before opening a different workspace.
    previousRoute.apply(this, arguments);
    if (location.hash === '#academy') {
      academyHeader();
      main.innerHTML = page();
    }
    refresh();
  }

  document.addEventListener('click', event => {
    const entryButton = event.target.closest('[data-ac25-open]');
    if (entryButton && main.contains(entryButton)) {
      event.stopPropagation();
      if (!entryButton.disabled && canOpen() && !isAcademy()) location.hash = '#academy';
    } else if (event.target.closest('#header [data-account-role]') && location.hash === '#account') {
      queueMicrotask(refresh);
    }
  }, true);

  document.addEventListener('click', async event => {
    const download = event.target.closest('[data-ac25-download]');
    const service = window.DSClassMaterialsService;
    if (!download || download.disabled || !main.contains(download) || !isAcademy() || !canOpen() || typeof service?.download !== 'function') return;
    const id = download.dataset.ac25Download;
    if (!materials.some(item => item.id === id)) return;
    const generation = epoch;
    const feedback = main.querySelector('.ac25-download-status');
    download.disabled = true;
    feedback.textContent = '파일을 준비하고 있어요.';
    try {
      const result = await service.download(id);
      if (generation !== epoch || !canOpen() || !download.isConnected) return;
      const url = member.safeDownloadUrl(result?.url);
      if (!url) throw new Error('invalid_download');
      const link = document.createElement('a');
      link.href = url;
      link.download = '';
      link.rel = 'noreferrer';
      link.click();
      feedback.textContent = '';
    } catch (error) {
      if (generation !== epoch) return;
      if ([401, 403, 404].includes(error?.status)) refresh();
      else feedback.textContent = '파일을 받지 못했어요. 다시 시도해 주세요.';
    } finally {
      if (generation === epoch) download.disabled = false;
    }
  });

  function sessionChanged() {
    if (isAcademy()) academyHeader();
    refresh();
  }

  window.removeEventListener('hashchange', previousRoute);
  route = navigate;
  window.addEventListener('hashchange', navigate);
  window.addEventListener('ds-session-change', sessionChanged);
  window.addEventListener('ds-session-ready', sessionChanged);
  window.addEventListener('pageshow', event => { if (event.persisted) refresh(); });

  if (location.hash === '#academy') navigate();
  else {
    if (location.hash === '#library') main.innerHTML = libraryPage();
    if (location.hash === '#account') refreshAccount();
    refresh();
  }
})();
