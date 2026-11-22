/* Student account: real short-study records only; existing account sections remain intact. */
(() => {
  'use strict';
  if (window.DSStudentAccountV55) return;
  const safe = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const api = () => window.DSStudyEntryV54;
  const rendered = new WeakMap();
  let sessionEpoch = 0;
  const freshHistory = () => ({ items: new Map(), visible: 6, loaded: false, hasMore: true, nextBefore: undefined, busy: false, error: '' });
  let history = freshHistory();
  const needsReview = r => !r.correct || r.confidence !== 'sure' || r.help;
  const date = value => { const d = new Date(value); return Number.isFinite(d.getTime()) ? d.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' }) : ''; };
  const action = (kind, value, label, primary = false) => `<button type="button" class="sa55-button${primary ? ' sa55-primary' : ''}" data-sa55-action="${kind}" data-sa55-value="${safe(value)}">${safe(label)}<span aria-hidden="true">→</span></button>`;
  function metrics(snapshot) {
    const attempts = [...(snapshot?.state?.attempts || [])].sort((a, b) => Number(b.updatedAt) - Number(a.updatedAt));
    const latest = new Map();
    for (const a of [...attempts].reverse()) for (const [id, response] of Object.entries(a.responses || {})) latest.set(id, response);
    return { attempts, answered: latest.size, correct: [...latest.values()].filter(r => r.correct).length, review: [...latest.values()].filter(needsReview).length, pending: attempts.find(a => !a.completedAt) };
  }
  function storage(snapshot, signedIn) {
    const cloud = snapshot.cloud || {};
    if (cloud.phase === 'error') return { type: 'error', text: cloud.error || '학습 기록을 계정에 저장하지 못했어요. 학습 화면에서 저장 상태를 확인해 주세요.' };
    if (cloud.phase === 'loading') return { type: 'loading', text: '계정의 학습 기록을 불러오는 중이에요.' };
    if (cloud.phase === 'saving') return { type: 'saving', text: '학습 기록을 계정에 저장하는 중이에요.' };
    if (signedIn && cloud.phase === 'ready') return { type: 'ready', text: cloud.updatedAt ? `계정에 저장됨 · ${date(cloud.updatedAt)}` : '계정의 학습 기록이 연결되어 있어요.' };
    if (signedIn) return { type: 'loading', text: '계정의 학습 기록 연결을 확인하고 있어요.' };
    return { type: 'guest', text: '이 기기에 남은 학습 기록이에요. 계정 저장은 로그인 후 이용할 수 있어요.' };
  }
  function markup(snapshot, signedIn) {
    const status = storage(snapshot, signedIn), m = metrics(snapshot), unit = m.pending?.unit || snapshot.state?.selectedUnit || snapshot.units?.[0]?.unit || '';
    if (status.type === 'loading') return `<div class="sa55-paper" data-sa55-paper><div class="sa55-title"><span>내신 공부</span><h3>내 학습 기록</h3></div><p class="sa55-status" role="status">${safe(status.text)}</p></div>`;
    const all = historyItems(snapshot), recent = all.slice(0, history.visible);
    const more = history.visible < all.length || signedIn && (!history.loaded || history.hasMore);
    const historyTools = `<div class="sa55-history-tools" aria-busy="${history.busy}">${more || history.busy ? `<button type="button" class="sa55-button" data-sa55-action="history"${history.busy ? ' disabled' : ''}>${history.busy ? '이전 기록 불러오는 중…' : history.error ? '이전 기록 다시 불러오기' : '이전 기록 더 보기'}<span aria-hidden="true">↓</span></button>` : ''}${history.error ? `<p class="sa55-history-error" role="alert">${safe(history.error)}</p>` : ''}</div>`;
    const rows = recent.map(a => {
      const responses = Object.values(a.responses || {}), total = a.refs?.length || 0, right = responses.filter(r => r.correct).length, review = responses.filter(needsReview).length;
      return `<li class="sa55-record"><div class="sa55-record-main"><span class="sa55-state${a.completedAt ? ' is-complete' : ''}">${a.completedAt ? '완료' : '진행 중'}${a.kind === 'review' ? ' · 복습' : ''}</span><strong>${safe(a.unit)}</strong><small>${safe(date(a.updatedAt || a.startedAt))} · ${responses.length}/${total}문항 확인 · ${right}문항 정답</small></div><div class="sa55-record-actions">${action('attempt', a.id, a.completedAt ? '결과 보기' : '이어서 풀기')}${a.completedAt && review ? action('review', a.id, '복습하기') : ''}</div></li>`;
    }).join('');
    return `<div class="sa55-paper" data-sa55-paper><div class="sa55-title"><span>DELTASKILL · 내신 공부</span><h3>내 학습 기록</h3><p class="sa55-status is-${status.type}" role="${status.type === 'error' ? 'alert' : 'status'}">${safe(status.text)}</p></div><div class="sa55-overview"><div class="sa55-continue"><small>${m.pending ? '공부하던 단원' : '다음 공부'}</small><h4>${safe(unit || '단원부터 골라 보세요')}</h4><p>${m.pending ? `${Object.keys(m.pending.responses || {}).length}/${m.pending.refs?.length || 0}문항 확인 · 풀던 곳부터 이어가요.` : m.answered ? '확인한 문항을 바탕으로 공부를 이어가요.' : '첫 문제를 풀면 여기에 기록이 쌓여요.'}</p>${m.pending ? action('attempt', m.pending.id, '이어서 풀기', true) : unit ? action('unit', unit, m.answered ? '공부 이어가기' : '공부 시작하기', true) : '<a class="sa55-button sa55-primary" href="#student">공부 시작하기 <span aria-hidden="true">→</span></a>'}</div><dl class="sa55-metrics"><div><dt>확인한 문항</dt><dd>${m.answered}<small>문항</small></dd></div><div><dt>정답</dt><dd>${m.correct}<small>문항</small></dd></div><div><dt>복습할 문항</dt><dd>${m.review}<small>문항</small></dd></div></dl></div><p class="sa55-count-note">최근 60회 학습 · 같은 문항은 마지막 응답으로 집계합니다.<br>오답 · 확신 없는 답 · 도움받은 문제는 다시 공부합니다.</p><div class="sa55-recent-heading"><h4>학습 기록</h4>${recent.length ? `<span>${recent.length}개 기록 표시</span>` : ''}</div>${rows ? `<ol class="sa55-records">${rows}</ol>` : '<p class="sa55-empty">아직 표시할 학습 기록이 없어요. 이전 기록을 불러오거나 한 문제씩 풀어 보세요.</p>'}${historyTools}<p class="sa55-action-error" role="alert" hidden></p></div>`;
  }
  function historyItems(snapshot) {
    const combined = new Map(history.items);
    for (const a of snapshot?.state?.attempts || []) combined.set(a.id, a);
    return [...combined.values()].sort((a, b) => Number(b.updatedAt) - Number(a.updatedAt));
  }
  async function loadMore() {
    if (history.busy) return;
    const count = historyItems(api()?.snapshot?.()).length;
    if (history.visible < count) { history.visible += 12; mount(); return; }
    if (!window.DSService?.session() || history.loaded && !history.hasMore) return;
    const epoch = sessionEpoch, target = history;
    target.busy = true; target.error = ''; mount();
    try {
      if (typeof api()?.history !== 'function') throw Error('history_unavailable');
      do {
        const cursor = target.nextBefore, page = await api().history(cursor);
        if (epoch !== sessionEpoch || target !== history || !window.DSService?.session()) return;
        if (!page || !Array.isArray(page.attempts) || page.hasMore && (page.nextBefore == null || String(page.nextBefore) === String(cursor))) throw Error('invalid_history');
        for (const a of page.attempts) if (a && typeof a.id === 'string') target.items.set(a.id, a);
        target.loaded = true; target.hasMore = Boolean(page.hasMore); target.nextBefore = page.nextBefore;
      } while (target.hasMore && historyItems(api()?.snapshot?.()).length <= count);
      target.visible += 12;
    } catch {
      if (epoch === sessionEpoch && target === history) target.error = '이전 기록을 불러오지 못했어요. 다시 시도해 주세요.';
    } finally {
      if (epoch === sessionEpoch && target === history) { target.busy = false; mount(); }
    }
  }
  function isStudent(root) {
    if (root.dataset.accountRole) return root.dataset.accountRole === 'student';
    return typeof role === 'undefined' || role !== 'teacher';
  }
  function mount(root = document.querySelector('.account-dashboard')) {
    if (location.hash !== '#account' || !root) return;
    const previous = root.querySelector('[data-sa55-paper]');
    if (!isStudent(root)) { previous?.remove(); return; }
    const section = root.querySelector('#account-study'), snapshot = api()?.snapshot?.();
    if (!section || !snapshot) return;
    const html = markup(snapshot, Boolean(window.DSService?.session()));
    if (previous && rendered.get(previous) === html) return;
    if (previous) previous.outerHTML = html;
    else {
      const heading = section.querySelector('.account-section-heading');
      if (heading) heading.insertAdjacentHTML('afterend', html);
      else section.insertAdjacentHTML('afterbegin', html);
    }
    const paper = root.querySelector('[data-sa55-paper]');
    if (paper) rendered.set(paper, html);
  }
  let scheduled = false;
  function schedule() {
    if (scheduled || location.hash !== '#account') return;
    scheduled = true;
    requestAnimationFrame(() => { scheduled = false; mount(); });
  }
  document.addEventListener('click', async event => {
    const button = event.target.closest('[data-sa55-action]');
    if (!button || !button.closest('[data-sa55-paper]')) return;
    event.preventDefault();
    if (button.dataset.sa55Action === 'history') { await loadMore(); return; }
    const methods = { attempt: 'openAttempt', unit: 'openUnit', review: 'openReview' }, method = methods[button.dataset.sa55Action];
    if (!method) return;
    const error = button.closest('[data-sa55-paper]').querySelector('.sa55-action-error');
    const epoch = sessionEpoch;
    button.disabled = true;
    try {
      if (typeof api()?.[method] !== 'function') throw Error('학습 화면을 아직 연결하지 못했어요. 잠시 후 다시 시도해 주세요.');
      const opened = await api()[method](button.dataset.sa55Value);
      if (epoch !== sessionEpoch) return;
      if (opened === false) throw Error('이 학습 기록을 열지 못했어요. 공부 화면에서 다시 확인해 주세요.');
      location.hash = '#student';
    } catch (failure) {
      if (epoch === sessionEpoch && error) { error.textContent = failure.message || '학습 기록을 열지 못했어요.'; error.hidden = false; }
    } finally { button.disabled = false; }
  });
  for (const event of ['hashchange', 'ds-study-change']) window.addEventListener(event, schedule);
  for (const event of ['ds-session-change', 'ds-session-ready']) window.addEventListener(event, () => { sessionEpoch++; history = freshHistory(); schedule(); });
  const outlet = document.getElementById('content');
  if (outlet) new MutationObserver(records => {
    if (records.some(r => !r.target.closest?.('[data-sa55-paper]'))) schedule();
  }).observe(outlet, { childList: true, subtree: true });
  window.DSStudentAccountV55 = { mount, metrics };
  schedule();
})();
