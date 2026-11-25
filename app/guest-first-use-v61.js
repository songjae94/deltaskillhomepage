// v61 (11/25 61 · 형 「비로그인 회원이 최소 각 기능을 한번씩은 이용후에 2회차 부터 로그인을 하도록 유도」)
// A guest (no session) may use each feature once without signing in. From the second use the sign-in card
// opens instead. Features the server already counts for guests (the trial draw) keep the server's count:
// the card only asks, and 「로그인 없이 계속」 goes on to the server, which still refuses at its own limit.
// Payment, purchase and point paths are not touched here: they stay members only where they already are.
(() => {
  'use strict';
  if (window.DSGuestFirstUse) return;
  const KEY = 'ds-guest-first-use-v1';
  const signed = () => Boolean(window.DSService?.session?.());
  const read = () => { try { const v = JSON.parse(localStorage.getItem(KEY) || '{}'); return v && typeof v === 'object' && !Array.isArray(v) ? v : {}; } catch { return {}; } };
  const write = v => { try { localStorage.setItem(KEY, JSON.stringify(v)); } catch {} };
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  // short text key for one study question (the same question checked again is still the first use)
  const sig = el => { const p = el?.closest?.('.ssp-paper')?.querySelector('.ssp-prompt'); const t = (p?.textContent || '').replace(/\s+/g, ''); let h = 0; for (let i = 0; i < t.length; i++) h = (h * 31 + t.charCodeAt(i)) | 0; return t ? String(h) : ''; };

  // key · name on the card · what counts as one use · server = the server counts this one for guests
  const FEATURES = [
    { key: 'study', name: '공부하기 문제 풀기', click: '[data-ssp-check],[data-ssp-skip]', same: sig },
    { key: 'study-trial', name: '공개 문항 체험', click: '[data-ssp-guest-next]', server: true },
    { key: 'draw', name: '프린트 만들기', submit: '#dq59-form', server: true },
    { key: 'draw-print', name: '프린트 문제지 인쇄 / PDF', click: '[data-dq-print]' },
    { key: 'timed', name: '타임어택', click: '[data-time-action="quote"]' },
    { key: 'preview', name: '교재 미리보기', click: 'a[href*="public-data/NS-"][href*=".pdf"],a[href^="#material/"]' },
    { key: 'cart', name: '장바구니 담기', click: '[data-ms-add]' },
    { key: 'book', name: '교재 만들기 구성 보관', click: '[data-bf62-save]' },
    { key: 'book-cover', name: '교재 표지 인쇄', click: '[data-bf62-print-cover]' },
    { key: 'design-print', name: '프린트 디자인 인쇄', click: '[data-design-print]' },
    { key: 'wrong-note', name: '오답노트', submit: '#ew25-form' }
  ];

  let bypass = false;
  const uses = key => { const r = read()[key]; return r && Number.isInteger(r.n) ? r.n : 0; };
  function note(f, el) {
    const all = read(), r = all[f.key] && typeof all[f.key] === 'object' ? all[f.key] : { n: 0 };
    const s = f.same ? f.same(el) : '';
    if (f.same && r.n >= 1 && s && r.s === s) return true;          // the first question again
    if (r.n >= 1) return false;
    all[f.key] = { n: 1, s, at: new Date().toISOString() };
    write(all);
    return true;
  }

  function nextPath() {
    const p = location.pathname + location.search + location.hash;
    return /^\/[A-Za-z0-9_\-./?#=&%]*$/.test(p) && !p.startsWith('//') ? p : '/app/';
  }
  function dialog() {
    let d = document.getElementById('gf61');
    if (d) return d;
    d = document.createElement('dialog');
    d.id = 'gf61'; d.className = 'gf61'; d.setAttribute('aria-labelledby', 'gf61-title');
    d.addEventListener('click', e => {
      if (e.target === d) { d.close(); return; }
      const b = e.target.closest('[data-gf61]');
      if (!b) return;
      const act = b.dataset.gf61;
      if (act === 'close') { e.preventDefault(); d.close(); return; }
      if (act === 'login') {
        e.preventDefault(); d.close();
        if (['#student', '#teacher', '#print-design'].includes(location.hash)) window.DSLoginReturn = location.hash;
        location.hash = '#login'; return;
      }
      if (act === 'go') { e.preventDefault(); const go = d._go; d._go = null; d.close(); if (go) go(); }
    });
    d.addEventListener('close', () => { d._go = null; });
    document.body.append(d);
    return d;
  }
  // go: only for a feature the server counts — 「로그인 없이 계속」 does the action as asked
  // need: a members-only step (11/25 79 H31a) — the card asks to sign in without saying 「한 번 써 보셨어요」
  function prompt(f, go, need) {
    const d = dialog();
    d._go = go || null;
    const signup = '/auth/?mode=signup&next=' + encodeURIComponent(nextPath());
    d.innerHTML = `<div class="gf61-card"><button type="button" class="gf61-x" data-gf61="close" aria-label="닫기">×</button><span class="gf61-kicker">${esc(f.name)}</span><h2 id="gf61-title">${need ? '로그인하고 이어서 쓸 수 있어요.' : '한 번 써 보셨어요.'}</h2><p>${need ? '이 단계는 로그인한 뒤에 열려요. 가입하면 이 화면으로 돌아와요.' : go ? '로그인하면 기록이 남고, 정답 · 해설까지 이어서 볼 수 있어요.' : '두 번째부터는 로그인하고 이어서 쓸 수 있어요. 가입하면 이 화면으로 돌아와요.'}</p><div class="gf61-actions"><button type="button" class="gf61-primary" data-gf61="login">로그인</button><a class="gf61-ghost" href="${esc(signup)}">회원가입</a></div>${go ? '<button type="button" class="gf61-later" data-gf61="go">로그인 없이 계속</button>' : ''}</div>`;
    if (!d.open) { try { d.showModal(); } catch { d.setAttribute('open', ''); } }
    d.querySelector('[data-gf61="login"]')?.focus();
  }

  function guard(e, f, el, again) {
    if (bypass || signed()) return;
    if (f.server) {
      if (uses(f.key) < 1) { note(f, el); return; }
      e.preventDefault(); e.stopImmediatePropagation();
      prompt(f, again);
      return;
    }
    if (note(f, el)) return;
    e.preventDefault(); e.stopImmediatePropagation();
    prompt(f);
  }
  document.addEventListener('click', e => {
    if (bypass || signed() || e.button) return;
    for (const f of FEATURES) {
      if (!f.click) continue;
      const el = e.target.closest?.(f.click);
      if (!el || el.disabled || el.closest('#gf61')) continue;
      guard(e, f, el, () => { const t = el.isConnected ? el : document.querySelector(f.click); bypass = true; try { t?.click(); } finally { bypass = false; } });
      return;
    }
  }, true);
  document.addEventListener('submit', e => {
    if (bypass || signed()) return;
    const form = e.target;
    for (const f of FEATURES) {
      if (!f.submit || !form.matches?.(f.submit)) continue;
      const submitter = e.submitter || null;
      guard(e, f, form, () => { const t = form.isConnected ? form : document.querySelector(f.submit); bypass = true; try { t?.requestSubmit(submitter && submitter.form === t ? submitter : undefined); } finally { bypass = false; } });
      return;
    }
  }, true);
  window.addEventListener('ds-session-change', () => { if (signed()) document.getElementById('gf61')?.close(); });

  window.DSGuestFirstUse = {
    features: () => FEATURES.map(f => ({ key: f.key, name: f.name, server: Boolean(f.server), uses: uses(f.key) })),
    used: key => uses(key) >= 1,
    prompt: (key, opts) => { const f = FEATURES.find(x => x.key === key); if (f) prompt(f, null, Boolean(opts?.need)); }
  };
})();
