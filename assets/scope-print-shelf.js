/* 11/26 107 H28-85: 받은 범위 프린트 다시 열기 목록(이 기기 · 회원별).
   범위 프린트(프린트 만들기의 포인트 · 기수령 범위 뽑기)는 받은 뒤 페이지를 떠나면 다시 열 길이 없었다.
   여기에는 문항 글 · 문항 번호를 두지 않는다. 고른 범위 조건과 그때의 요청 번호(request_id)만 둔다 —
   같은 요청 번호 · 같은 조건으로 다시 부르면 서버(item-draw scope_draw → draw_scope_reopen)가 같은 문항을
   추가 차감 없이(charged 0) 돌려준다(보관 365일). 다른 회원 · 다른 기기는 서버가 막는다(student_id 묶임).
   쓰는 곳: 프린트 만들기(draw-teacher-v59.js) · 받은 자료([data-scope-shelf]) · /my/ 회원 자료함([data-scope-shelf]). */
(() => {
  'use strict';
  if (window.DSScopePrintShelf) return;
  const PREFIX = 'ds-scope-prints:', MAX = 30, KEEP_MS = 360 * 86400000;
  const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;
  const fnv = (s, h) => { h >>>= 0; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619) >>> 0; } return h.toString(16).padStart(8, '0'); };
  // 회원 자리표: 로그인 짝(전화)이 있으면 그것으로(다시 로그인해도 같은 목록) · 없으면 토큰으로. 값 자체는 두지 않는다.
  function who() {
    const a = window.DSAuth; const token = a?.get?.() || '';
    if (!token) return '';
    const id = (a.phone?.() || '') || token;
    return fnv('ds-scope-1:' + id, 2166136261) + fnv('ds-scope-2:' + id, 3735928559);
  }
  const text = (v, n) => typeof v === 'string' && v.length <= n;
  const plain = v => v && typeof v === 'object' && !Array.isArray(v);
  function valid(x) {
    if (!plain(x) || !UUID.test(x.id || '') || !plain(x.criteria) || !text(x.subject, 60) || !text(x.unit, 300) ||
        !Number.isSafeInteger(x.n) || x.n < 1 || x.n > 20 || !['point', 'received'].includes(x.mode) ||
        !Number.isSafeInteger(x.at) || Date.now() - x.at > KEEP_MS || x.at - Date.now() > 86400000) return false;
    const c = x.criteria;
    return Number.isSafeInteger(c.count) && c.count >= 1 && c.count <= 20 && text(c.subject, 60) && !('request_id' in c) && JSON.stringify(c).length <= 4000;
  }
  function list() {
    const k = who(); if (!k) return [];
    try { const v = JSON.parse(localStorage.getItem(PREFIX + k) || '[]'); return Array.isArray(v) ? v.filter(valid).slice(0, MAX) : []; } catch { return []; }
  }
  function put(rows) {
    const k = who(); if (!k) return false;
    try { localStorage.setItem(PREFIX + k, JSON.stringify(rows.slice(0, MAX))); } catch { return false; }
    window.dispatchEvent(new Event('ds-scope-shelf-change'));
    return true;
  }
  function add(entry) {
    const { request_id, ...criteria } = entry?.criteria || {};
    const row = { id: entry?.id, criteria, subject: entry?.subject || criteria.subject || '', unit: String(entry?.unit || '').slice(0, 300), n: entry?.n, mode: entry?.mode === 'received' ? 'received' : 'point', at: Date.now() };
    if (!valid(row)) return false;
    return put([row, ...list().filter(x => x.id !== row.id)]);
  }
  const find = id => list().find(x => x.id === id) || null;
  const forget = id => put(list().filter(x => x.id !== id));
  const link = id => '/app/?studentMode=create&scopePrint=' + encodeURIComponent(id) + '#student';
  const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
  const day = at => new Intl.DateTimeFormat('ko-KR', { month: 'long', day: 'numeric', timeZone: 'Asia/Seoul' }).format(new Date(at));
  const meta = x => [x.subject, x.n + '문항', x.mode === 'received' ? '기수령 범위' : '포인트로 받음', day(x.at)].filter(Boolean).join(' · ');
  // 받은 자료 · /my/ 칸: 「다시 열기(0P)」는 프린트 만들기로 가서 같은 요청 번호로 다시 연다.
  function html(rows = list(), variant = '') {
    const my = variant === 'my';
    const head = my ? '<h3 class="my-h3">받은 범위 프린트</h3>' : '<h3>받은 범위 프린트</h3>';
    const hint = t => my ? `<p class="hint">${t}</p>` : `<p>${t}</p>`;
    if (!rows.length) return head + hint('프린트 만들기에서 받은 범위 프린트가 여기에 남아요. 같은 문항을 추가 차감 없이(0P) 다시 열 수 있어요.');
    const title = x => esc(x.unit || x.subject + ' 범위 프린트');
    const open = x => `<a class="account-text-button" href="${esc(link(x.id))}">다시 열기(0P)</a>`;
    const items = rows.map(x => my
      ? `<li data-scope-print="${esc(x.id)}"><span>${title(x)}<small>${esc(meta(x))}</small></span>${open(x)}</li>`
      : `<li class="sr-row" data-scope-print="${esc(x.id)}"><span class="sr-format" aria-hidden="true">PDF</span><div><h4>${title(x)}</h4><p>${esc(meta(x))}</p><div class="sr-actions">${open(x)}</div></div></li>`).join('');
    return head + hint('같은 문항을 추가 차감 없이(0P) 다시 엽니다. 이 기기에서 받은 목록입니다.') + `<ul class="${my ? 'files' : 'sr-list'}" data-scope-shelf-list>${items}</ul>`;
  }
  const drawnHtml = new WeakMap();
  function mount() {
    for (const el of document.querySelectorAll('[data-scope-shelf]')) {
      const signed = Boolean(window.DSAuth?.get?.());
      el.hidden = !signed;
      const next = signed ? html(list(), el.dataset.scopeShelf) : '';
      if (drawnHtml.get(el) !== next) { drawnHtml.set(el, next); el.innerHTML = next; }
    }
  }
  window.DSScopePrintShelf = { list, add, find, forget, link, html, meta, mount };
  for (const evt of ['ds-scope-shelf-change', 'ds-auth-change', 'ds-session-change', 'pageshow']) window.addEventListener(evt, mount);
  window.addEventListener('storage', e => { if (e.key === null || e.key === 'ds_tk' || String(e.key).startsWith(PREFIX)) mount(); });
  if (typeof MutationObserver === 'function') {
    const start = () => { new MutationObserver(ms => { if (ms.some(m => Array.from(m.addedNodes).some(n => n.nodeType === 1 && (n.matches?.('[data-scope-shelf]') || n.querySelector?.('[data-scope-shelf]'))))) mount(); }).observe(document.body, { childList: true, subtree: true }); mount(); };
    if (document.body) start(); else document.addEventListener('DOMContentLoaded', start, { once: true });
  }
})();
