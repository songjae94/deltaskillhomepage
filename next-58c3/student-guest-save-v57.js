/* Guest records move only after a second, explicit confirmation in the signed-in session. */
(() => {
  'use strict';
  if (window.DSGuestSaveV57) return;
  const KEY = 'ds-study-guest-save-v57', TTL = 15 * 60 * 1000;
  const api = () => window.DSStudyEntryV54;
  const member = () => Boolean(window.DSService?.session());
  const review = () => new URLSearchParams(location.search).has('study-review') || api()?.storage?.() === 'review-session';
  const hasAnswer = state => state?.version === 1 && Array.isArray(state.attempts) && state.attempts.some(a => Object.values(a.responses || {}).some(r => Number.isInteger(r?.choice) && r.choice >= 0 && r.choice < 5));
  let epoch = 0, dialog = null, busy = false, offered = false, expiryTimer = 0, frame = 0, dismissed = '';
  function discard() { try { sessionStorage.removeItem(KEY); } catch {} clearTimeout(expiryTimer); expiryTimer = 0; }
  function intent() {
    try {
      const raw = sessionStorage.getItem(KEY);
      if (!raw) return null;
      if (raw.length > 150000) { discard(); return null; }
      const value = JSON.parse(raw);
      if (!value || typeof value.id !== 'string' || !Number.isFinite(value.expiresAt) || value.expiresAt <= Date.now() || value.expiresAt > Date.now() + TTL || !hasAnswer(value.state)) { discard(); return null; }
      return value.id === dismissed ? null : value;
    } catch { discard(); return null; }
  }
  function close() { if (dialog) { if (dialog.open) dialog.close(); dialog.remove(); dialog = null; } busy = false; }
  function expire(value) {
    clearTimeout(expiryTimer);
    expiryTimer = setTimeout(() => { const current = intent(); if (!current || current.id === value.id) { discard(); close(); } }, Math.max(1, value.expiresAt - Date.now()));
  }
  function cancel() { const value = intent(); if (value) dismissed = value.id; discard(); close(); }
  function showConfirmation() {
    if (review()) { discard(); close(); return; }
    const value = intent();
    if (!value || !member() || dialog) return;
    offered = true;
    const generation = epoch;
    dialog = document.createElement('dialog');
    dialog.className = 'gs57-dialog';
    dialog.setAttribute('aria-labelledby', 'gs57-dialog-title');
    dialog.setAttribute('aria-describedby', 'gs57-dialog-note');
    dialog.innerHTML = '<form method="dialog"><span class="gs57-eyebrow">내 학습 기록</span><h2 id="gs57-dialog-title">이 기기에서 푼 학습 기록을<br>로그인한 계정에 저장할까요?</h2><p id="gs57-dialog-note">저장하면 마이페이지에서 이어서 공부할 수 있어요.</p><p class="gs57-error" role="alert" hidden></p><div class="gs57-dialog-actions"><button type="button" data-gs57-later autofocus>나중에</button><button type="button" data-gs57-confirm>저장하기</button></div></form>';
    const currentDialog = dialog;
    dialog.addEventListener('cancel', e => { e.preventDefault(); if (!busy) cancel(); });
    dialog.querySelector('[data-gs57-later]').addEventListener('click', cancel);
    dialog.querySelector('[data-gs57-confirm]').addEventListener('click', async () => {
      if (busy || generation !== epoch || !member() || review()) return;
      const current = intent();
      if (!current || current.id !== value.id) { close(); return; }
      const error = currentDialog.querySelector('.gs57-error'), confirm = currentDialog.querySelector('[data-gs57-confirm]'), later = currentDialog.querySelector('[data-gs57-later]');
      busy = true; confirm.disabled = true; later.disabled = true;
      confirm.textContent = '저장하는 중…'; error.hidden = true;
      try {
        if (typeof api()?.importGuestRecords !== 'function') throw Error('unavailable');
        const result = await api().importGuestRecords(current.state);
        if (generation !== epoch || !member() || review() || dialog !== currentDialog || intent()?.id !== value.id) return;
        if (result !== true && result?.ok !== true) throw Error('not_saved');
        dismissed = value.id; discard(); close(); location.hash = '#account';
      } catch {
        if (generation === epoch && dialog === currentDialog) { error.textContent = '기록을 저장하지 못했어요. 잠시 후 다시 시도해 주세요.'; error.hidden = false; }
      } finally {
        if (generation === epoch && dialog === currentDialog) { busy = false; confirm.disabled = false; later.disabled = false; confirm.textContent = '저장하기'; }
      }
    });
    document.body.append(dialog);
    dialog.showModal();
    expire(value);
  }
  function mount() {
    const result = location.hash === '#student' && document.querySelector('.sl54-result');
    const previous = document.querySelector('[data-gs57-offer]');
    if (!result || member() && !review()) { previous?.remove(); return; }
    const testing = review();
    if (!testing && (api()?.storage?.() !== 'this-device' || !hasAnswer(api()?.snapshot?.().state))) { previous?.remove(); return; }
    if (previous && previous.parentElement === result && previous.dataset.gs57Review === String(testing)) return;
    previous?.remove();
    const section = document.createElement('aside');
    section.className = 'gs57-offer'; section.dataset.gs57Offer = ''; section.dataset.gs57Review = String(testing);
    section.innerHTML = testing ? '<p class="gs57-review-note">체험 중 · 실제 기록에 남지 않습니다.</p>' : '<div><span class="gs57-eyebrow">내 학습 기록</span><h2>여기까지 푼 기록, 내 계정에.</h2></div><button type="button" data-gs57-save>기록 저장하기 <span aria-hidden="true">→</span></button><p class="gs57-offer-error" role="alert" hidden></p>';
    result.append(section);
  }
  function schedule() {
    if (frame) return;
    frame = requestAnimationFrame(() => { frame = 0; mount(); showConfirmation(); });
  }
  document.addEventListener('click', e => {
    const button = e.target.closest('[data-gs57-save]');
    if (!button || !button.closest('[data-gs57-offer]') || member() || review() || api()?.storage?.() !== 'this-device') return;
    const state = api()?.snapshot?.().state;
    if (!hasAnswer(state)) return;
    try {
      const value = { id: crypto.randomUUID(), expiresAt: Date.now() + TTL, state };
      const text = JSON.stringify(value); if (text.length > 150000) throw Error('oversized');
      sessionStorage.setItem(KEY, text); dismissed = ''; offered = false; expire(value); location.hash = '#login';
    } catch {
      const error = button.closest('[data-gs57-offer]').querySelector('.gs57-offer-error');
      error.textContent = '이 브라우저에 기록을 잠시 보관하지 못했어요. 기록 저장을 다시 시도해 주세요.'; error.hidden = false;
    }
  });
  window.addEventListener('ds-session-change', () => { epoch++; if (offered) { discard(); close(); } offered = false; schedule(); });
  for (const event of ['ds-session-ready', 'ds-study-change', 'hashchange']) window.addEventListener(event, schedule);
  const outlet = document.getElementById('content');
  if (outlet) new MutationObserver(changes => { if (changes.some(c => !c.target.closest?.('[data-gs57-offer]'))) schedule(); }).observe(outlet, { childList: true, subtree: true });
  window.DSGuestSaveV57 = { mount };
  if (review()) discard(); else { const pending = intent(); if (pending) expire(pending); }
  schedule();
})();
