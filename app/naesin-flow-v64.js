/* 내신 자료 흐름 v64 — 책 → 시험 범위 → 문제 수준 → 미리보기 · 출력 (설계: 내신자료_흐름설계_1123).
   프린트 만들기 · 교재 만들기와 같은 뼈대(걸음 띠 · 고른 것 띠 · 왼쪽 짙은 패널 · 오른쪽 종이 · 내 보관함).
   책 · 차례 · 문항 수는 설계 1절(뽑기에 실린 2,610 의 단원 × 단계 · 뽑기조건_단원표_1122 의 차례 이름)에 있는 것만 적는다.
   문항 원문은 이 파일에 없다. 서버 menu 를 읽는 길은 LIVE 스위치(기본 꺼짐) 뒤에 있다. */
(() => {
  'use strict';
  const builder = window.DSTeacherBuilderV36;
  if (!builder || typeof teacher !== 'function' || window.DSNaesinFlowV64) return;

  // 설계 3절 ③: 포인트 판 r5 뒤 menu 응답에 book · chapter · available 이 서면 켠다. 꺼진 동안 서버 호출 0.
  const LIVE = false;

  const safe = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const num = n => Number(n).toLocaleString('ko-KR');
  const NOTICE = '출판사의 문항과 해설은 제공하지 않습니다. 델타스킬이 새로 만든 유사 문항만 제공합니다.';
  const NOTICE_SUB = '책 이름은 각 출판사의 것이며, 델타스킬은 출판사와 관계가 없습니다.';
  const GUEST_PER_UNIT = 3;          // 설계 5절 ③ 가(센터가 닫음): 가입 전에는 단원마다 3문항 · 문제 면만
  const MAX_PER_TYPE = 20;           // 설계 3절: 한 번에 20문항

  // 문제 종류 — 설계 0절 표의 화면 말 · 쓰임. 3 · 4단계는 내신 쪽에 0(설계 1절) → 그 범위에 있는 것만 그린다.
  const TYPES = [
    { stage: '1', name: '숫자만 바꾼 문제', short: '숫자만', use: '오답 다시 풀리기 · 숙제' },
    { stage: '2', name: '표현을 바꾼 문제', short: '표현', use: '주간 테스트 · 학교 시험 꼴' },
    { stage: '3', name: '풀이는 같고 겉이 다른 문제', short: '겉이 다른', use: '직전 정리' },
    { stage: '4', name: '한 걸음 더 나간 문제', short: '한 걸음 더', use: '상위권' }
  ];
  const LEVELS = ['쉬움', '보통', '어려움'];

  // 과목 · 단원 — 뽑기에 실린 단원 × 단계 수(설계 1절 표). n 이 없는 단원은 뽑기에 0(설계 1절 「함수 · 유리함수와 무리함수 단원은 뽑기에 0」).
  const SUBJECTS = {
    cm2: { name: '공통수학2', units: [
      { id: 'cm2-1', name: 'Ⅰ 도형의 방정식', n: { 1: 396, 2: 422 } },
      { id: 'cm2-2', name: 'Ⅱ 집합과 명제', n: { 1: 174, 2: 241 } },
      { id: 'cm2-3', name: 'Ⅲ 함수와 그래프', n: null }
    ] },
    ca1: { name: '미적분Ⅰ', units: [
      { id: 'ca1-1', name: 'Ⅰ 함수의 극한과 연속', n: { 1: 162, 2: 170 } },
      { id: 'ca1-2', name: 'Ⅱ 다항함수의 미분법', n: { 1: 356, 2: 280 } },
      { id: 'ca1-3', name: 'Ⅲ 다항함수의 적분법', n: { 1: 230, 2: 179 } }
    ] }
  };
  // 책 — 닮은 문제가 나온 원문항 책 두 권(설계 1절) · 차례는 뽑기조건_단원표_1122 의 중단원 번호 · 이름 그대로. 책 이름은 글자로만.
  const BOOKS = [
    { id: 'sen-cm2', title: '쎈 공통수학2', subject: 'cm2', exams: ['DLV-26-CM2'], chapters: [
      ['01', '평면좌표', 'cm2-1'], ['02', '직선의 방정식', 'cm2-1'], ['03', '원의 방정식', 'cm2-1'], ['04', '도형의 이동', 'cm2-1'],
      ['05', '집합의 뜻과 표현', 'cm2-2'], ['06', '집합의 연산', 'cm2-2']
    ],
    // 이 책에서 닮은 문제가 0 인 단원 — 이름은 설계 1절 「명제 · 함수 · 유리함수와 무리함수 단원은 뽑기에 0」 그대로. 책 차례 번호는 자료에 없어 안 적음.
    others: ['명제', '함수', '유리함수와 무리함수'] },
    { id: 'sen-ca1', title: '쎈 미적분Ⅰ', subject: 'ca1', exams: ['DLV-26-MI1'], chapters: [
      ['01', '함수의 극한', 'ca1-1'], ['02', '함수의 연속', 'ca1-1'],
      ['03', '미분계수와 도함수', 'ca1-2'], ['04', '도함수의 활용 (1)', 'ca1-2'], ['05', '도함수의 활용 (2)', 'ca1-2'], ['06', '도함수의 활용 (3)', 'ca1-2'],
      ['07', '부정적분', 'ca1-3'], ['08', '정적분', 'ca1-3'], ['09', '정적분의 활용', 'ca1-3']
    ] }
  ];
  // 책 가름 = 문항의 exam_code(32칸 판에는 책 칸이 없음 · 센터 11-23). 한 코드는 한 책에만 — 여러 책에 걸치는 코드는 「책 없이」 쪽에만.
  // 기다리는 책: 등재는 됐지만 뽑기 0(렌더 도장 전) · 책 차례 번호는 자료에 없어 과목 단원 이름으로 고름. LIVE 가 켜지고 menu 가 그 코드에 뽑을 수 있는 수를 줄 때만 목록에 나옴.
  const WAIT_BOOKS = [
    { id: 'ol-cm2', title: '올림포스 공통수학2', subject: 'cm2', exams: ['DLV-26-OLBASECM2'] },
    { id: 'olt-cm2', title: '올림포스 유형편 공통수학2', subject: 'cm2', exams: ['DLV-26-OLTYPECM2'] },
    { id: 'ol-ca1', title: '올림포스 미적분Ⅰ', subject: 'ca1', exams: ['DLV-26-OLBASEMI1'] },
    { id: 'olt-ca1', title: '올림포스 유형편 미적분Ⅰ', subject: 'ca1', exams: ['DLV-26-OLTYPEMI1'] }
  ].map(b => ({ ...b, chapters: SUBJECTS[b.subject].units.map(u => ['', u.name, u.id]) }));
  const NONE = 'none';
  // LIVE 가 꺼진 동안 넷째 걸음은 지금 실제로 되는 것(판매 단원 문제집 · 프린트 만들기 잇기)만 보여 준다.
  const STEPS = ['책', '시험 범위', '문제 수준', LIVE ? '미리보기 · 출력' : '받을 자료'];
  const KEY = 'ds-naesin-flow-v64', RESUME = 'ds-naesin-flow-v64-resume';
  const store = {
    get(k, f) { try { const v = JSON.parse(localStorage.getItem(k)); return v ?? f; } catch { return f; } },
    put(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch { return false; } },
    drop(k) { try { localStorage.removeItem(k); } catch {} }
  };
  const fresh = () => ({ step: 1, book: '', subject: '', query: '', chip: '', units: [], anchor: '', counts: { 1: 6, 2: 4, 3: 0, 4: 0 }, levels: LEVELS.slice(), answers: true, per: 2, academy: '', title: '', view: 'q', page: 0, message: '' });
  let state = Object.assign(fresh(), store.get(KEY, {}));
  state.message = '';
  const persist = () => store.put(KEY, { ...state, message: '' });

  /* ---------- 판 · 셈 ---------- */
  const unitById = id => Object.values(SUBJECTS).flatMap(s => s.units).find(u => u.id === id);
  const allBooks = () => BOOKS.concat(WAIT_BOOKS.filter(b => LIVE && b.exams.some(c => (live.exams.get(c) || 0) > 0)));
  const book = () => allBooks().find(b => b.id === state.book) || null;
  const subjectId = () => book()?.subject || (state.book === NONE ? state.subject : '');
  const subject = () => SUBJECTS[subjectId()] || null;
  const bookTotal = b => SUBJECTS[b.subject].units.reduce((n, u) => n + (u.n ? Object.values(u.n).reduce((a, x) => a + x, 0) : 0), 0);
  // 범위 줄: 책이면 그 책 차례(중단원) · 책 없이면 과목 단원.
  function rows() {
    const b = book();
    if (b) return b.chapters.map(([no, name, unit]) => ({ key: b.id + ':' + (no || unit), no, name, unit, ok: true }));
    const s = subject();
    return s ? s.units.map(u => ({ key: u.id, no: '', name: u.name, unit: u.id, ok: Boolean(u.n) })) : [];
  }
  const picked = () => rows().filter(r => r.ok && state.units.includes(r.key));
  const pickedUnits = () => [...new Set(picked().map(r => r.unit))].map(unitById);
  // 고른 범위에 있는 문제 종류만(단원 수 표에 그 단계가 있는 것).
  const types = () => { const us = pickedUnits(); return TYPES.filter(t => us.some(u => u?.n?.[t.stage] || live.stages.has(t.stage))); };
  const clamp = n => Math.max(0, Math.min(MAX_PER_TYPE, Math.round(Number(n) || 0)));
  const count = t => clamp(state.counts[t.stage]);
  const total = () => types().reduce((n, t) => n + count(t), 0);
  const per = () => (Number(state.per) === 4 ? 4 : 2);
  const signed = () => Boolean(window.DSService?.session?.());
  const plainName = r => r.no ? r.name : r.name.replace(/^[ⅠⅡⅢⅣⅤⅥ]+\s*/, '');
  function rangeText(max = 3) {
    const p = picked(), all = rows().filter(r => r.ok).map(r => r.key);
    if (!p.length) return '';
    const idx = p.map(r => all.indexOf(r.key));
    const contiguous = idx.every((v, i) => !i || v === idx[i - 1] + 1);
    if (p.length === 1) return plainName(p[0]);
    if (contiguous) return plainName(p[0]) + ' ~ ' + plainName(p[p.length - 1]);
    return p.length <= max ? p.map(plainName).join(' · ') : plainName(p[0]) + ' 외 ' + (p.length - 1) + '단원';
  }
  const levelText = () => state.levels.length === LEVELS.length ? '난도 모두' : state.levels.join(' · ');
  const mixText = () => types().filter(t => count(t)).map(t => t.short + ' ' + count(t)).join(' + ');
  const defaultTitle = () => (subject() ? subject().name + ' ' : '') + (rangeText(2) || '내신 대비') + ' 프린트';
  const title = () => state.title.trim() || defaultTitle();

  // 종이에 놓일 자리: 종류마다 고른 단원에 고르게 나눔(교재 만들기와 같은 셈) · 단원 차례대로.
  function slots() {
    const p = picked(), out = [];
    if (!p.length) return out;
    const share = types().map(t => ({ t, n: count(t) }));
    p.forEach((r, ri) => {
      let k = 0;
      share.forEach(({ n }) => { const m = Math.floor(n / p.length) + (ri < n % p.length ? 1 : 0); for (let i = 0; i < m; i++) out.push({ unit: plainName(r), inUnit: k++ }); });
    });
    return out;
  }
  const qPages = () => Math.ceil(slots().length / per());
  const sPages = () => (state.answers && slots().length ? Math.ceil(slots().length / 6) : 0);

  /* ---------- 판매 단원 문제집(이어 주기) — /naesin/catalog.json 값 그대로 ---------- */
  const sold = { load: 'idle', items: [] };
  function loadSold() {
    if (sold.load !== 'idle') return;
    sold.load = 'loading';
    fetch('/naesin/catalog.json', { cache: 'no-store' }).then(r => r.ok ? r.json() : null).catch(() => null).then(cat => {
      const now = Date.now(), out = [];
      (cat?.subjects || []).forEach(s => (s.units || []).forEach(u => {
        const pdf = u.price?.pdf;
        if (!pdf || !u.saleFrom || now < Date.parse(u.saleFrom) || (u.saleTo && now >= Date.parse(u.saleTo))) return;
        out.push({ subject: String(s.subject || '').replace(/\s*기초편$/, ''), code: s.code, sku: u.sku, unit: u.unit, roman: String(u.major || '').split(/\s/)[0], name: u.name, count: u.count, price: pdf });
      }));
      sold.items = out; sold.load = 'ready';
      if (here()) softUpdate();
    });
  }
  // 같은 과목 · 같은 대단원 번호(Ⅰ Ⅱ Ⅲ)의 판매 문제집.
  const soldFor = unitIds => {
    const s = subject(); if (!s) return [];
    const romans = new Set(unitIds.map(id => unitById(id)?.name.split(/\s/)[0]));
    return sold.items.filter(x => x.subject === s.name && romans.has(x.roman));
  };
  // 책 이름 없이 단원 이름이 같은 판매 문제집(이 책의 0 단원 줄에 씀).
  const soldByName = name => { const s = subject(); return s ? sold.items.filter(x => x.subject === s.name && x.unit === name) : []; };
  // 판매 문제집의 단원 번호(06 · 07 · 05)는 이 화면의 책 차례 번호와 다른 책의 번호라 화면 이름에서 뺀다(값 · 문항 수 · 주소는 그대로).
  const soldLabel = x => String(x.name).replace(/\s·\s\d+\s+/, ' · ');
  const soldLink = (x, cls = 'nf64-soldlink') => `<a class="${cls}" href="/naesin/?s=${encodeURIComponent(x.code)}" target="_blank" rel="noopener">${safe(soldLabel(x))}<span aria-hidden="true"> ↗</span><span class="sr-only"> 새 탭</span></a>`;
  const soldThumb = x => { const d = (Array.isArray(window.DSCatalog) ? window.DSCatalog : []).find(c => c.sku === x.sku); const p = d?.previewPages?.[0]; return p === `public-data/${x.sku}-1.png` ? p : ''; };

  /* ---------- 프린트 만들기 잇기: 같은 단원 이름이 기출 묶음에 있으면 그 단원을 골라 넘김 ---------- */
  const bankUnits = () => { const qs = window.DSBasicExamV34?.questions || []; const m = new Map(); qs.forEach(q => m.set(q.unit, (m.get(q.unit) || 0) + 1)); return m; };
  const printMatches = () => { const m = bankUnits(); return pickedUnits().map(u => u.name.replace(/^[ⅠⅡⅢⅣⅤⅥ]+\s*/, '')).filter(n => m.has(n)).map(n => ({ unit: n, count: m.get(n) })).sort((a, b) => b.count - a.count); };
  function toPrint(unit) {
    builder.switchMode('print');
    const sel = document.querySelector('[data-tb36-field="unit"]');
    if (unit && sel && [...sel.options].some(o => o.value === unit)) {
      sel.value = unit; sel.dispatchEvent(new Event('change', { bubbles: true }));
      // 그 단원의 기출 수보다 문항 수가 크면 프린트 만들기가 막히므로 있는 수까지로 맞춤.
      const have = bankUnits().get(unit) || 1, cnt = document.querySelector('[data-tb36-field="count"]');
      if (cnt && Number(cnt.value) > have) { cnt.value = String(have); cnt.dispatchEvent(new Event('change', { bubbles: true })); }
    }
    document.querySelector('.tb36-surface')?.scrollIntoView({ block: 'start', behavior: 'instant' });
  }

  /* ---------- LIVE(꺼짐): 서버 menu 의 book · chapter · available ---------- */
  const live = { counts: new Map(), exams: new Map(), stages: new Set(), asked: false };
  function readLive() {
    const host = window.DSDrawHostV59;
    if (!LIVE || live.asked || !host?.menu || !signed()) return;
    live.asked = true;
    host.menu().then(d => {
      (d?.sets || []).forEach(r => {
        if (typeof r.chapter !== 'string' || !Number.isInteger(r.available)) return;
        // exam_code 가 오면 그것으로 · 없으면 책 이름으로(옛 계약).
        const by = typeof r.exam_code === 'string' ? r.exam_code : typeof r.book === 'string' ? r.book : '';
        if (!by) return;
        const k = by + '|' + r.chapter + '|' + r.stage;
        live.counts.set(k, (live.counts.get(k) || 0) + r.available);
        if (typeof r.exam_code === 'string') live.exams.set(r.exam_code, (live.exams.get(r.exam_code) || 0) + r.available);
      });
      if (here()) softUpdate();
    }).catch(() => { live.asked = false; });
  }
  const liveAvail = t => { if (!LIVE || !book()) return null; let n = 0, seen = false; const keys = (book().exams || []).concat(book().title); picked().forEach(r => { for (const by of keys) { const v = live.counts.get(by + '|' + r.name + '|' + t.stage); if (v != null) { n += v; seen = true; break; } } }); return seen ? n : null; };

  /* ---------- 그리기 ---------- */
  const heading = () => `<header class="tb36-heading nf64-heading"><div><span>수업 준비</span><h1>내신 자료</h1><p class="nf64-lead">${LIVE ? '학교 부교재 · 시험 범위 · 반 수준으로, 내일 수업 프린트까지.' : '학교 부교재 · 시험 범위 · 반 수준을 고르면, 그 범위에 맞는 자료로 바로 잇습니다.'}</p></div><a href="#account">내 보관함 ↗</a></header>`;
  const reach = n => n === 1 || (n === 2 && state.book && (state.book !== NONE || state.subject)) || (n === 3 && picked().length) || (n === 4 && picked().length && total() > 0);
  function steps() {
    return `<ol class="tb36-steps bf62-steps nf64-steps" aria-label="내신 자료 순서">${STEPS.map((t, i) => { const n = i + 1, cur = n === state.step, done = n < state.step; return `<li class="${done ? 'is-done' : cur ? 'is-current' : ''}" ${cur ? 'aria-current="step"' : ''}><button type="button" data-nf64-step="${n}" ${reach(n) || n <= state.step ? '' : 'disabled'}><b>${done ? '✓' : n}</b><span>${t}</span></button></li>`; }).join('')}</ol>`;
  }
  function summary() {
    const b = book(), n = picked().length ? total() : 0;
    const bookLine = b ? safe(b.title) : state.book === NONE ? '책 없이' + (subject() ? ' · ' + safe(subject().name) : '') : '아직 고른 책이 없습니다';
    return `<section class="bf62-summary nf64-summary" aria-label="고른 것" aria-live="polite"><div class="bf62-sum-scope"><span>책</span><strong>${bookLine}</strong></div><dl><div class="bf62-sum-wide"><dt>시험 범위</dt><dd>${picked().length ? safe(rangeText()) : '—'}</dd></div><div class="bf62-sum-wide"><dt>문제 수준</dt><dd>${n ? safe(mixText()) + ' · ' + safe(levelText()) : '—'}</dd></div><div><dt>문항</dt><dd><b>${n}</b>문항</dd></div>${LIVE ? `<div><dt>문제 쪽</dt><dd><b>${n ? qPages() : 0}</b>쪽</dd></div>` : `<div><dt>단원</dt><dd><b>${picked().length}</b>개</dd></div>`}</dl></section>`;
  }
  const stepTitle = (n, text) => `<div class="tb36-section-title"><b>${String(n).padStart(2, '0')}</b><h2>${text}</h2></div>`;
  const notice = (sub = false) => `<div class="nf64-notice-box"><p class="bf62-notice nf64-notice" role="note">${NOTICE}</p>${sub ? `<p class="nf64-notice-sub">${NOTICE_SUB}</p>` : ''}</div>`;

  function bookCards() {
    const q = state.query.trim().toLowerCase().replace(/\s+/g, '');
    const list = allBooks().filter(b => (!state.chip || b.subject === state.chip) && (!q || (b.title + SUBJECTS[b.subject].name).toLowerCase().replace(/\s+/g, '').includes(q)));
    if (!list.length) return `<div class="nf64-empty" role="status"><p>찾는 책이 없습니다. 책 없이 과목 · 단원으로 고를 수 있습니다.</p><button type="button" class="nf64-ghost" data-nf64-none>단원으로 고르기</button><button type="button" class="nf64-textlink" data-feedback="필요한 책 알려 주기">필요한 책 알려 주기</button></div>`;
    return `<div class="bf62-choices nf64-books" role="radiogroup" aria-label="책">${list.map(b => `<label class="bf62-choice"><input type="radio" name="nf64-book" value="${b.id}" data-nf64-book ${state.book === b.id ? 'checked' : ''}><span><strong>${safe(b.title)}</strong><small>${safe(SUBJECTS[b.subject].name)} · 이 책과 닮은 새 문제 <em class="nf64-num">${num(bookTotal(b))}</em>문항</small></span></label>`).join('')}</div>`;
  }
  function bookForm() {
    const chips = [['', '전체'], ...Object.entries(SUBJECTS).map(([id, s]) => [id, s.name])];
    return `${stepTitle(1, '어느 책으로 수업하세요?')}<p class="bf62-lead">반에서 쓰는 책을 고르세요. 학교 프린트 · 자체 교재로 수업하면 맨 아래에서 과목 · 단원으로 고릅니다.</p>
      <input type="search" class="nf64-search" data-nf64-query value="${safe(state.query)}" placeholder="책 이름 · 과목 검색" aria-label="책 이름 · 과목 검색" autocomplete="off">
      <div class="bf62-units nf64-chips" role="radiogroup" aria-label="과목">${chips.map(([id, t]) => `<label class="bf62-chip"><input type="radio" name="nf64-chip" value="${id}" data-nf64-chip ${state.chip === id ? 'checked' : ''}><span>${safe(t)}</span></label>`).join('')}</div>
      <div data-nf64-books>${bookCards()}</div>
      <div class="nf64-or"><span>또는</span></div>
      <div class="bf62-choices"><label class="bf62-choice nf64-nobook"><input type="radio" name="nf64-book" value="${NONE}" data-nf64-book ${state.book === NONE ? 'checked' : ''}><span><strong>책 없이 과목 · 단원으로 고르기</strong><small>학교 프린트 · 자체 교재로 수업할 때</small></span></label></div>
      ${notice(true)}`;
  }
  function hint() {
    const n = picked().length;
    return n === 0 ? '처음 단원을 누르세요.' : n === 1 && state.anchor ? '끝 단원을 누르면 사이가 한 번에 골라집니다.' : '단원을 눌러 낱개로 빼거나 더할 수 있습니다.';
  }
  function unitCounts(u) {
    if (!u?.n) return '';
    return TYPES.filter(t => u.n[t.stage]).map(t => `${t.short} <em class="nf64-num">${num(u.n[t.stage])}</em>`).join(' · ');
  }
  function deadRow(u) {
    const links = soldFor([u.id]);
    return `<li class="nf64-dead"><div><strong>${safe(u.name)}</strong><span>이 단원에는 닮은 문제가 없습니다.</span>${links.length ? `<span class="nf64-dead-links"><span>단원 문제집으로 받기 →</span>${links.map(x => soldLink(x)).join('')}</span>` : ''}</div></li>`;
  }
  function rowButton(r) {
    const on = state.units.includes(r.key);
    return `<li><button type="button" class="nf64-row" data-nf64-row="${safe(r.key)}" aria-pressed="${on}">${r.no ? `<b>${safe(r.no)}</b>` : ''}<span>${safe(r.name)}</span>${!r.no ? `<small>${unitCounts(unitById(r.unit))}</small>` : ''}<i aria-hidden="true">${on ? '✓' : ''}</i></button></li>`;
  }
  function rangeForm() {
    const b = book(), s = subject();
    let body = '';
    if (state.book === NONE) {
      body += `<div class="bf62-units nf64-chips" role="radiogroup" aria-label="과목">${Object.entries(SUBJECTS).map(([id, x]) => `<label class="bf62-chip"><input type="radio" name="nf64-subject" value="${id}" data-nf64-subject ${state.subject === id ? 'checked' : ''}><span>${safe(x.name)}</span></label>`).join('')}</div>`;
      if (s) body += `<ol class="nf64-rows">${s.units.map(u => u.n ? rowButton({ key: u.id, no: '', name: u.name, unit: u.id }) : deadRow(u)).join('')}</ol><p class="bf62-source nf64-source">단원 곁의 수는 그 단원에 실린 닮은 문제 수입니다(숫자만 바꾼 문제 · 표현을 바꾼 문제).</p>`;
      else body += `<p class="nf64-hint">과목을 먼저 고르세요.</p>`;
    } else if (b) {
      const groups = SUBJECTS[b.subject].units;
      body += `<p class="nf64-bookline"><span>${safe(b.title)}</span> 차례</p>`;
      body += groups.map(u => {
        const ch = b.chapters.filter(c => c[2] === u.id);
        if (!ch.length) return '';      // 과목 대단원 이름은 책 차례가 아니므로 책 길에서는 「이 책의 다른 단원」에서 단원 이름으로 보인다.
        return `<section class="nf64-group"><h3>${safe(u.name)}<small>${unitCounts(u)}</small></h3><ol class="nf64-rows">${ch.map(([no, name, unit]) => rowButton({ key: b.id + ':' + (no || unit), no, name, unit })).join('')}</ol></section>`;
      }).join('');
      if (b.others?.length) body += `<section class="nf64-group nf64-group-dead"><h3>이 책의 다른 단원<small>닮은 문제가 없는 단원</small></h3><ol class="nf64-rows">${b.others.map(name => { const links = soldByName(name); return `<li class="nf64-dead"><div><strong>${safe(name)}</strong><span>이 단원에는 닮은 문제가 없습니다.</span>${links.length ? `<span class="nf64-dead-links"><span>단원 문제집으로 받기 →</span>${links.map(x => soldLink(x)).join('')}</span>` : ''}</div></li>`; }).join('')}</ol></section>`;
      body += `<p class="bf62-source nf64-source">큰 단원 이름 곁의 수는 그 단원에 실린 닮은 문제 수입니다.</p>`;
    }
    const hintLine = subject() ? `<p class="nf64-hint" aria-live="polite">${hint()}${picked().length ? ` <button type="button" class="nf64-textlink" data-nf64-clear>고른 단원 지우기</button>` : ''}</p>` : '';
    const lead = state.book === NONE ? '과목을 고르고 시험 범위에 드는 단원을 고르세요.' : '책의 단원 번호 · 이름으로 고릅니다. 시험 범위에 드는 단원을 고르세요.';
    // 책 없이 길은 과목 칩 다음에 안내 줄이 온다.
    const at = state.book === NONE ? body.indexOf('</div>') + 6 : 0;
    return `${stepTitle(2, '시험 범위는 어디부터 어디까지인가요?')}<p class="bf62-lead">${lead}</p>${body.slice(0, at)}${hintLine}${body.slice(at)}${notice()}`;
  }
  function levelForm() {
    const ts = types(), us = picked().length;
    const typeRows = ts.map(t => {
      const av = liveAvail(t);
      return `<fieldset class="bf62-part nf64-type"><legend>${safe(t.name)}</legend><p class="nf64-use">${safe(t.use)}${av != null ? ` · 뽑을 수 있는 문제 <em class="nf64-num">${num(av)}</em>` : ''}</p><div class="nf64-stepper"><button type="button" data-nf64-dec="${t.stage}" aria-label="${safe(t.name)} 한 문항 빼기" ${count(t) <= 0 ? 'disabled' : ''}>−</button><input type="number" min="0" max="${MAX_PER_TYPE}" step="1" inputmode="numeric" value="${count(t)}" data-nf64-count="${t.stage}" aria-label="${safe(t.name)} 문항 수"><button type="button" data-nf64-inc="${t.stage}" aria-label="${safe(t.name)} 한 문항 더하기" ${count(t) >= MAX_PER_TYPE ? 'disabled' : ''}>+</button><em>문항</em></div></fieldset>`;
    }).join('');
    const levels = `<fieldset class="bf62-part nf64-levelset"><legend>난도</legend><div class="bf62-levels nf64-levels" role="group" aria-label="난도">${LEVELS.map(l => `<label><input type="checkbox" value="${l}" data-nf64-level ${state.levels.includes(l) ? 'checked' : ''}><span>${l}</span></label>`).join('')}</div></fieldset>`;
    const n = total();
    const second = LIVE ? `<div><span>문제 쪽 · 한 쪽 ${per()}문항</span><strong><b>${n ? qPages() : 0}</b>쪽</strong></div>` : `<div><span>고른 단원</span><strong><b>${us}</b>개</strong></div>`;
    const box = `<div class="bf62-total nf64-total"><div><span>모두</span><strong><b>${n}</b>문항</strong></div>${second}<p>${n ? safe(mixText()) + ' = ' + n + '문항' : '문항 수를 1문항 이상 넣어 주세요.'}${us > 1 ? ` · 고른 단원 ${us}개에 고르게 나눕니다.` : ''}</p></div>`;
    const guest = LIVE && !signed() ? `<p class="nf64-guest">로그인 전에는 단원마다 ${GUEST_PER_UNIT}문항까지 문제 면을 미리 봅니다. 정답과 해설은 로그인한 뒤에 붙습니다.</p>` : '';
    return `${stepTitle(3, LIVE ? '어떤 문제로, 몇 문제 뽑을까요?' : '어떤 문제로, 몇 문제가 필요하세요?')}<p class="bf62-lead">반 수준에 맞춰 종류마다 문항 수를 정하세요. 섞어도 됩니다.</p><div class="bf62-parts">${typeRows}${levels}</div>${box}${guest}${notice()}`;
  }
  function printForm() {
    const links = soldFor(pickedUnits().map(u => u.id));
    const soldBox = links.length ? `<div class="nf64-sold"><span class="nf64-sold-k">이 단원 통째로 한 권</span>${links.map(x => `<a href="/naesin/?s=${encodeURIComponent(x.code)}" target="_blank" rel="noopener"><strong>${safe(x.name)}</strong><span><em class="nf64-num">${num(x.count)}</em>문항 · PDF <em class="nf64-num">${num(x.price)}</em>원<span aria-hidden="true"> ↗</span><span class="sr-only"> 새 탭</span></span></a>`).join('')}<p>편집이 끝난 단원 문제집입니다. 단원 통째로 숙제를 낼 때 씁니다.</p></div>` : '';
    const status = signed() ? '' : `<p class="nf64-guest">정답 · 해설 · 출력 · 보관은 로그인한 뒤에 됩니다. 로그인하면 고른 그대로 이 화면으로 돌아옵니다.</p>`;
    return `${stepTitle(4, '내일 수업에 바로 쓸 수 있나요?')}${status}
      <label class="nf64-check"><input type="checkbox" data-nf64-answers ${state.answers ? 'checked' : ''}><span><strong>정답 · 해설 붙이기</strong><small>문제 면 뒤에 정답과 해설 면이 붙습니다.</small></span></label>
      <div class="bf62-field"><span class="bf62-label">한 쪽 문항 수</span><div class="bf62-segment nf64-segment" role="radiogroup" aria-label="한 쪽 문항 수">${[2, 4].map(n => `<label><input type="radio" name="nf64-per" value="${n}" data-nf64-per ${per() === n ? 'checked' : ''}><span>${n}문항</span></label>`).join('')}</div></div>
      <label class="bf62-field"><span class="bf62-label">학원 이름 <small>머리말 왼쪽에 들어갑니다</small></span><input type="text" maxlength="30" data-nf64-field="academy" value="${safe(state.academy)}" placeholder="예: ○○수학학원"></label>
      <label class="bf62-field"><span class="bf62-label">머리말</span><input type="text" maxlength="60" data-nf64-field="title" value="${safe(state.title)}" placeholder="${safe(defaultTitle())}"></label>
      <div class="nf64-actions"><button type="button" class="tb36-primary" data-nf64-gate="print">출력 <span>↗</span></button><button type="button" class="nf64-ghost" data-nf64-gate="save">보관</button><div class="nf64-minor"><button type="button" class="nf64-textlink" data-nf64-gate="answers">정답 · 해설 보기</button><button type="button" class="nf64-textlink" data-nf64-gate="swap">다른 문항으로 바꾸기</button></div></div>
      ${soldBox}${notice()}`;
  }
  // LIVE 꺼짐: 넷째 걸음 = 고른 것 요약 + 그 범위의 판매 단원 문제집 + 프린트 만들기 잇기(지금 실제로 되는 것만).
  function rangeList() {
    return picked().map(r => `<li>${r.no ? `<b>${safe(r.no)}</b>` : ''}<span>${safe(r.name)}</span></li>`).join('') || '<li><span>—</span></li>';
  }
  function soldCards(links) {
    return links.map(x => `<a href="/naesin/?s=${encodeURIComponent(x.code)}" target="_blank" rel="noopener"><strong>${safe(soldLabel(x))}</strong><span><em class="nf64-num">${num(x.count)}</em>문항 · PDF <em class="nf64-num">${num(x.price)}</em>원<span aria-hidden="true"> ↗</span><span class="sr-only"> 새 탭</span></span></a>`).join('');
  }
  function takeForm() {
    const links = soldFor(pickedUnits().map(u => u.id)), m = printMatches();
    const recap = `<dl class="nf64-recap"><div><dt>책</dt><dd>${book() ? safe(book().title) : '책 없이 · ' + safe(subject()?.name || '')}</dd></div><div><dt>시험 범위</dt><dd><ol>${rangeList()}</ol></dd></div><div><dt>문제 수준</dt><dd>${total() ? safe(mixText()) + ' = ' + total() + '문항 · ' + safe(levelText()) : '—'}</dd></div></dl>`;
    const soldBox = links.length
      ? `<div class="nf64-sold"><span class="nf64-sold-k">이 범위의 단원 문제집 · 지금 판매 중</span>${soldCards(links)}<p>편집이 끝난 한 권(PDF)입니다. 단원 통째로 숙제를 낼 때 씁니다. 구매는 내신 자료 구매 쪽에서 합니다.</p></div>`
      : sold.load === 'ready' ? `<div class="nf64-sold nf64-sold-none"><span class="nf64-sold-k">이 범위의 단원 문제집</span><p>고른 범위와 같은 단원의 판매 문제집은 없습니다.</p><a href="#library"><strong>자료실에서 판매 자료 전체 보기</strong><span>지금 판매 중인 단원 문제집 목록</span></a></div>` : '';
    const printBox = m.length
      ? `<div class="nf64-print"><h3>프린트 만들기로 잇기</h3><p>같은 이름의 단원이 수능 기출 묶음에 있습니다. 그 단원을 골라 둔 채 프린트 만들기를 엽니다.</p>${m.map((x, i) => `<button type="button" class="${i ? 'nf64-ghost' : 'tb36-primary'}" data-nf64-print="${safe(x.unit)}">${safe(x.unit)} · 수능 기출 ${x.count}문항으로 만들기 <span>→</span></button>`).join('')}</div>`
      : `<div class="nf64-print"><h3>프린트 만들기로 잇기</h3><p>수능 · 모의고사 기출로 오늘 수업 프린트를 바로 만들 수 있습니다. 고른 범위와 같은 이름의 단원은 기출 묶음에 없어 단원은 그 쪽에서 고릅니다.</p><button type="button" class="tb36-primary" data-nf64-print="">프린트 만들기 열기 <span>→</span></button></div>`;
    return `${stepTitle(4, '이 범위로 지금 무엇을 받을 수 있나요?')}${recap}${soldBox}${printBox}${notice()}`;
  }
  function nav() {
    const back = state.step > 1 ? `<button type="button" class="bf62-back" data-nf64-step="${state.step - 1}">← ${STEPS[state.step - 2]}</button>` : '';
    const next = state.step === 3 ? `<button type="button" class="tb36-primary" data-nf64-next>${LIVE ? '문제 뽑기' : '다음 · ' + STEPS[3]} <span>→</span></button>` : state.step < 3 ? `<button type="button" class="tb36-primary" data-nf64-next>다음 · ${STEPS[state.step]} <span>→</span></button>` : '';
    return `<div class="bf62-nav${next ? ' nf64-nav-main' : ''}">${next}${back}<p class="tb36-message" role="status">${safe(state.message)}</p></div>`;
  }
  function form() {
    const body = state.step === 1 ? bookForm() : state.step === 2 ? rangeForm() : state.step === 3 ? levelForm() : LIVE ? printForm() : takeForm();
    return `<form id="nf64-form" class="tb36-conditions bf62-panel nf64-panel" novalidate>${body}${nav()}</form>`;
  }

  /* ---------- 종이 ---------- */
  const head = () => `<div class="bf62-pg-head"><span>${safe(state.academy || '학원 이름')}</span><span>${safe(title())}</span></div>`;
  function questionPage(i) {
    const all = slots(), p = per(), part = all.slice(i * p, i * p + p);
    const units = [...new Set(part.map(s => s.unit))].join(' · ');
    const boxes = Array.from({ length: p }, (_, k) => part[k] ? `<div class="bf62-q"><b>${String(i * p + k + 1).padStart(2, '0')}</b><i></i><i></i><i class="bf62-short"></i><span class="bf62-room"></span></div>` : '<div class="bf62-q nf64-q-blank"></div>').join('');
    return `<div class="bf62-paper bf62-body">${head()}<div class="bf62-sec">${safe((subject()?.name ? subject().name + ' · ' : '') + units)}</div><div class="bf62-qs bf62-qs-${p}">${boxes}</div><div class="bf62-pg-foot"><span>DELTASKILL</span><span>${i + 1}</span></div></div>`;
  }
  function answerPage(i) {
    const all = slots(), part = all.slice(i * 6, i * 6 + 6), base = qPages();
    if (!signed()) return `<div class="bf62-paper bf62-body nf64-sol">${head()}<div class="bf62-sec">정답과 해설</div><div class="nf64-sol-lock"><strong>로그인하면 이 면에 정답과 해설이 붙습니다</strong><span>${all.length}문항 · ${sPages()}쪽</span></div><div class="nf64-sol-cols">${part.map((_, k) => `<div><b>${String(i * 6 + k + 1).padStart(2, '0')}</b><i></i><i class="bf62-short"></i></div>`).join('')}</div><div class="bf62-pg-foot"><span>DELTASKILL</span><span>${base + i + 1}</span></div></div>`;
    return `<div class="bf62-paper bf62-body nf64-sol">${head()}<div class="bf62-sec">정답과 해설</div><div class="nf64-sol-cols nf64-sol-open">${part.map((_, k) => `<div><b>${String(i * 6 + k + 1).padStart(2, '0')}</b><i></i><i></i><i class="bf62-short"></i></div>`).join('')}</div><div class="bf62-pg-foot"><span>DELTASKILL</span><span>${base + i + 1}</span></div></div>`;
  }
  // LIVE 꺼짐: 오른쪽은 문항 자리 뼈대 대신 ① 넷째 걸음에서 그 범위의 판매 문제집이 있으면 그 공개 미리보기 1쪽(실물) ② 아니면 고른 것 목록.
  function sheetPreview() {
    const links = state.step === 4 ? soldFor(pickedUnits().map(u => u.id)) : [];
    const shot = links.map(x => ({ x, src: soldThumb(x) })).find(v => v.src);
    if (shot) {
      const page = `<div class="bf62-paper nf64-shot"><img src="${safe(shot.src)}" width="804" height="1137" alt="${safe(soldLabel(shot.x))} 공개 미리보기 1쪽" decoding="async"></div>`;
      return `<aside class="tb36-order-preview ds48-canvas bf62-preview nf64-preview" aria-label="단원 문제집 미리보기"><div class="ds48-preview-toolbar bf62-toolbar"><strong>단원 문제집 미리보기</strong><small>${safe(soldLabel(shot.x))} · ${num(shot.x.count)}문항</small></div><div class="bf62-stage">${window.DSPrintSurfaceV48 ? window.DSPrintSurfaceV48.scene(page) : `<div class="bf62-plain">${page}</div>`}</div><p class="bf62-stage-note">판매 중인 단원 문제집의 공개 미리보기 1쪽입니다.</p></aside>`;
    }
    const p = picked(), us = pickedUnits().filter(Boolean);
    const body = !state.book ? `<p class="nf64-sheet-empty">왼쪽에서 책을 고르면 고른 것이 여기에 차례로 쌓입니다.</p>`
      : `<section><h3>책</h3><p>${book() ? safe(book().title) : '책 없이' + (subject() ? ' · ' + safe(subject().name) : '')}</p></section>
         <section><h3>시험 범위</h3>${p.length ? `<ol class="nf64-sheet-range">${rangeList()}</ol>` : '<p class="nf64-sheet-empty">시험 범위의 단원을 고르면 여기에 쌓입니다.</p>'}</section>
         ${p.length ? `<section><h3>고른 단원이 속한 큰 단원에 실린 닮은 문제</h3><ul class="nf64-sheet-counts">${us.map(u => `<li><span>${safe(u.name)}</span><small>${unitCounts(u)}</small></li>`).join('')}</ul></section>` : ''}
         ${p.length && state.step >= 3 ? `<section><h3>문제 수준</h3><p>${total() ? safe(mixText()) + ' = ' + total() + '문항 · ' + safe(levelText()) : '—'}</p></section>` : ''}`;
    return `<aside class="tb36-order-preview ds48-canvas bf62-preview nf64-preview nf64-preview-sheet" aria-label="고른 것"><div class="ds48-preview-toolbar bf62-toolbar"><strong>고른 것</strong><small>단원 ${p.length}개${total() && p.length ? ' · ' + total() + '문항' : ''}</small></div><div class="bf62-stage nf64-sheet-stage"><div class="nf64-sheet">${body}</div></div><p class="bf62-stage-note">${state.step === 4 && sold.load === 'ready' && !links.length ? '고른 범위와 같은 단원의 판매 문제집은 없습니다.' : '고른 것은 이 브라우저에 남아 다시 열어도 그대로입니다.'}</p></aside>`;
  }
  function preview() {
    if (!LIVE) return sheetPreview();
    const n = slots().length, qp = qPages(), sp = sPages();
    const view = state.view === 's' && sp ? 's' : 'q';
    const pages = view === 's' ? sp : qp;
    const pg = Math.max(0, Math.min(state.page, Math.max(0, pages - 1)));
    const empty = `<div class="bf62-paper bf62-toc">${head()}<h4>프린트</h4><p class="bf62-toc-empty">왼쪽에서 책과 시험 범위를 고르면 프린트가 여기에 그려집니다.</p></div>`;
    const page = !n ? empty : view === 's' ? answerPage(pg) : questionPage(pg);
    const tabs = sp ? `<div class="bf62-tabs" role="tablist" aria-label="미리보기 면"><button type="button" role="tab" aria-selected="${view === 'q'}" data-nf64-view="q">문제 면</button><button type="button" role="tab" aria-selected="${view === 's'}" data-nf64-view="s">정답과 해설 면</button></div>` : '';
    const pager = pages > 1 ? `<div class="nf64-pager"><button type="button" data-nf64-page="${pg - 1}" ${pg <= 0 ? 'disabled' : ''} aria-label="앞 쪽">‹</button><span><b>${pg + 1}</b> / ${pages}</span><button type="button" data-nf64-page="${pg + 1}" ${pg >= pages - 1 ? 'disabled' : ''} aria-label="다음 쪽">›</button></div>` : '';
    const note = !n ? '책 · 시험 범위 · 문항 수를 고르면 쪽 수와 문항 자리가 바로 바뀝니다.'
      : signed() ? '종이에는 문제 종류 이름과 책 이름을 적지 않습니다. 학생 손에 가는 종이입니다.'
      : `로그인 전에는 단원마다 ${GUEST_PER_UNIT}문항까지 문제 면만 보입니다. 종이에는 문제 종류 이름과 책 이름을 적지 않습니다.`;
    return `<aside class="tb36-order-preview ds48-canvas bf62-preview nf64-preview" aria-label="프린트 미리보기"><div class="ds48-preview-toolbar bf62-toolbar"><strong>프린트 미리보기</strong><small>${n}문항 · 문제 ${qp}쪽${state.answers ? ` · 정답과 해설 ${sp}쪽` : ''}</small></div>${tabs}<div class="bf62-stage">${window.DSPrintSurfaceV48 ? window.DSPrintSurfaceV48.scene(page) : `<div class="bf62-plain">${page}</div>`}</div>${pager}<p class="bf62-stage-note">${note}</p></aside>`;
  }
  const flowView = () => `<div class="bf62-root nf64-root" data-step="${state.step}">${steps()}${summary()}<div class="tb36-setup bf62-setup">${form()}${preview()}</div></div>`;

  /* ---------- 로그인 안내 창 ---------- */
  function gate(kind) {
    persist();
    let d = document.getElementById('nf64-dialog');
    if (!d) { d = document.createElement('dialog'); d.id = 'nf64-dialog'; d.className = 'nf64-dialog'; d.setAttribute('aria-labelledby', 'nf64-dialog-title'); document.body.appendChild(d); }
    const what = { print: '출력', save: '보관', answers: '정답 · 해설 보기', swap: '다른 문항으로 바꾸기' }[kind] || '출력';
    const links = soldFor(pickedUnits().map(u => u.id));
    if (!signed()) {
      const signup = window.DSService?.accountLinks ? window.DSService.accountLinks('signup') : '';
      d.innerHTML = `<form method="dialog" class="nf64-dialog-in"><span class="nf64-dialog-k">${safe(what)}</span><h3 id="nf64-dialog-title">여기까지는 맛보기입니다</h3><p>${safe(what)} · 정답과 해설은 로그인한 선생님께 열립니다. 로그인하면 고르신 책 · 시험 범위 · 문제 수준이 그대로 남은 채 이 화면으로 돌아옵니다.</p><div class="nf64-dialog-act"><button type="button" class="nf64-dialog-primary" data-nf64-login>로그인</button>${signup ? `<a class="nf64-dialog-quiet" href="${safe(signup)}" target="_blank" rel="noopener">처음이시면 회원가입<span aria-hidden="true"> ↗</span><span class="sr-only"> 새 탭</span></a>` : ''}</div><button class="nf64-dialog-close" value="close" aria-label="닫기">닫기</button></form>`;
    } else {
      d.innerHTML = `<form method="dialog" class="nf64-dialog-in"><span class="nf64-dialog-k">${safe(what)}</span><h3 id="nf64-dialog-title">고른 조건을 이 기기에 기억했습니다</h3><p>책 · 시험 범위 · 문제 수준은 이 브라우저에 남아 있어 다시 열면 그대로 이어집니다.${links.length ? ' 같은 단원을 편집이 끝난 한 권으로 받을 수도 있습니다.' : ''}</p>${links.length ? `<div class="nf64-dialog-links">${links.map(x => soldLink(x)).join('')}</div>` : ''}<div class="nf64-dialog-act"><button type="button" class="nf64-dialog-primary" data-nf64-toprint>프린트 만들기로</button></div><button class="nf64-dialog-close" value="close" aria-label="닫기">닫기</button></form>`;
    }
    if (typeof d.showModal === 'function') { if (!d.open) d.showModal(); } else d.setAttribute('open', '');
    d.querySelector('[data-nf64-login],[data-nf64-toprint]')?.focus();
  }

  /* ---------- 잇기 ---------- */
  const previousTeacher = teacher;
  const isMine = () => builder.snapshot?.().mode === 'materials';
  // 머리 메뉴 · 이 화면 제목과 같은 띄어쓰기(「내신 자료」).
  const relabel = html => html.replace('<strong>내신자료</strong><small>완성된 자료 찾기</small>', '<strong>내신 자료</strong><small>부교재 닮은 문제</small>');
  teacher = function () {
    const html = relabel(previousTeacher.apply(this, arguments));
    if (!isMine()) return html;
    const t = document.createElement('template'); t.innerHTML = html;
    const surface = t.content.querySelector('.tb36-surface');
    if (!surface) return html;
    surface.classList.add('bf62-surface', 'nf64-surface', 'sd-downloads');
    surface.dataset.sdView = 'store';
    [...surface.children].forEach(el => { if (!el.matches('.tb36-modes, .tb36-compact-footer, footer, [class*="footer"]')) el.remove(); });
    const modes = surface.querySelector('.tb36-modes');
    const wrap = document.createElement('template'); wrap.innerHTML = window.DSMaterialsShop ? '<div class="sd-body">' + window.DSMaterialsShop.render({audience:'teacher'}) + '</div>' : heading() + flowView();
    if (modes) modes.after(wrap.content); else surface.prepend(wrap.content);
    if (!window.DSMaterialsShop) {
      loadSold(); readLive();
      requestAnimationFrame(pinSummary);
    }
    return surface.outerHTML;
  };
  const routeHere = () => ['#teacher', '#studio'].includes(location.hash);
  const here = () => routeHere() && isMine();
  function pinSummary() {
    const band = document.querySelector('.nf64-summary'), hd = document.getElementById('header');
    if (!band || !hd) return;
    const pos = getComputedStyle(hd).position;
    document.documentElement.style.setProperty('--bf62-head', (pos === 'sticky' || pos === 'fixed' ? Math.round(hd.getBoundingClientRect().height) : 0) + 'px');
  }
  addEventListener('resize', () => { if (here()) pinSummary(); });
  function rerender(focus) {
    persist();
    if (!here()) return;
    const content = document.getElementById('content'), y = scrollY;
    content.innerHTML = teacher();
    pinSummary(); scrollTo(0, y);
    if (focus) content.querySelector(focus)?.focus({ preventScroll: true });
  }
  // 글을 치는 동안 초점은 그대로: 읽기 칸만 다시 그림.
  function softUpdate() {
    persist();
    const root = document.querySelector('.nf64-root');
    if (!root) return;
    const swap = (sel, html) => { const el = root.querySelector(sel); if (el) el.outerHTML = html; };
    swap('.nf64-summary', summary());
    swap('.nf64-preview', preview());
    const books = root.querySelector('[data-nf64-books]'); if (books) books.innerHTML = bookCards();
    const t = document.createElement('template');
    if (state.step === 3) { t.innerHTML = levelForm(); const nb = t.content.querySelector('.nf64-total'), ob = root.querySelector('.nf64-total'); if (nb && ob) ob.replaceWith(nb); }
    if (state.step === 4 && !LIVE) { swap('#nf64-form', form()); return; }
    if (state.step === 4) { t.innerHTML = printForm(); const ns = t.content.querySelector('.nf64-sold'), os = root.querySelector('.nf64-sold'); if (ns && os) os.replaceWith(ns); else if (ns && !os) root.querySelector('.nf64-actions')?.after(ns); }
    if (state.step === 2) { t.innerHTML = rangeForm(); const fresh = [...t.content.querySelectorAll('.nf64-dead')]; root.querySelectorAll('.nf64-dead').forEach((el, i) => { if (fresh[i]) el.replaceWith(fresh[i]); }); }
  }
  function goStep(n) {
    n = Math.max(1, Math.min(4, Number(n) || 1));
    if (n > 1 && !state.book) { state.message = '책을 고르거나 「책 없이 과목 · 단원으로 고르기」를 눌러 주세요.'; rerender('[data-nf64-book]'); return false; }
    if (n > 2 && !picked().length) { state.step = 2; state.message = subject() ? '시험 범위의 단원을 하나 이상 골라 주세요.' : '과목을 먼저 고르세요.'; rerender(subject() ? '[data-nf64-row]' : '[data-nf64-subject]'); return false; }
    if (n > 3 && total() < 1) { state.step = 3; state.message = '문항 수를 1문항 이상 넣어 주세요.'; rerender('[data-nf64-count]'); return false; }
    if (n > 3 && !state.levels.length) { state.step = 3; state.message = '난도를 하나 이상 골라 주세요.'; rerender('[data-nf64-level]'); return false; }
    state.step = n; state.message = ''; state.page = 0; if (n < 4) state.view = 'q';
    rerender('#nf64-form h2');
    document.querySelector('.nf64-root')?.scrollIntoView({ block: 'start', behavior: 'instant' });
    return true;
  }
  function clickRow(key) {
    const order = rows().filter(r => r.ok).map(r => r.key);
    const on = state.units.includes(key);
    if (!state.units.length) { state.units = [key]; state.anchor = key; }
    else if (state.units.length === 1 && state.anchor && state.anchor !== key) {
      const a = order.indexOf(state.anchor), b = order.indexOf(key);
      state.units = order.slice(Math.min(a, b), Math.max(a, b) + 1); state.anchor = '';
    } else { state.units = on ? state.units.filter(x => x !== key) : order.filter(k => k === key || state.units.includes(k)); state.anchor = ''; }
    state.message = ''; state.page = 0;
    rerender(`[data-nf64-row="${key}"]`);
  }
  function setBook(id) {
    if (state.book === id) return;
    state.book = id; state.units = []; state.anchor = ''; state.page = 0; state.message = '';
    if (id !== NONE) state.subject = '';
    rerender(`[data-nf64-book][value="${id}"]`);
  }
  document.addEventListener('click', e => {
    if (e.target.closest('#nf64-dialog')) {
      const d = document.getElementById('nf64-dialog');
      if (e.target.closest('[data-nf64-login]')) { persist(); store.put(RESUME, 1); window.DSLoginReturn = '#teacher'; d?.close?.(); location.hash = '#login'; return; }
      if (e.target.closest('[data-nf64-toprint]')) { d?.close?.(); builder.switchMode('print'); return; }
      if (e.target === d) d.close?.();
      return;
    }
    if (!here()) return;
    const b = e.target.closest('[data-nf64-step],[data-nf64-next],[data-nf64-row],[data-nf64-clear],[data-nf64-none],[data-nf64-dec],[data-nf64-inc],[data-nf64-view],[data-nf64-page],[data-nf64-gate],[data-nf64-print]');
    if (!b || b.disabled) return;
    if (b.hasAttribute('data-nf64-print')) { persist(); toPrint(b.dataset.nf64Print); return; }
    if (b.hasAttribute('data-nf64-next')) { goStep(state.step + 1); return; }
    if (b.dataset.nf64Step) { goStep(b.dataset.nf64Step); return; }
    if (b.dataset.nf64Row) { clickRow(b.dataset.nf64Row); return; }
    if (b.hasAttribute('data-nf64-clear')) { state.units = []; state.anchor = ''; rerender('[data-nf64-row]'); return; }
    if (b.hasAttribute('data-nf64-none')) { state.query = ''; state.chip = ''; setBook(NONE); return; }
    if (b.dataset.nf64Dec || b.dataset.nf64Inc) { const s = b.dataset.nf64Dec || b.dataset.nf64Inc; state.counts[s] = clamp((state.counts[s] || 0) + (b.dataset.nf64Dec ? -1 : 1)); state.message = ''; rerender(`[data-nf64-${b.dataset.nf64Dec ? 'dec' : 'inc'}="${s}"]`); return; }
    if (b.dataset.nf64View) { state.view = b.dataset.nf64View; state.page = 0; softUpdate(); document.querySelector(`[data-nf64-view="${state.view}"]`)?.focus({ preventScroll: true }); return; }
    if (b.dataset.nf64Page) { state.page = Number(b.dataset.nf64Page); softUpdate(); document.querySelector('.nf64-pager button:not(:disabled)')?.focus({ preventScroll: true }); return; }
    if (b.dataset.nf64Gate) { gate(b.dataset.nf64Gate); }
  });
  document.addEventListener('change', e => {
    if (!here()) return;
    const t = e.target;
    if (t.hasAttribute('data-nf64-book')) { setBook(t.value); return; }
    if (t.hasAttribute('data-nf64-chip')) { state.chip = t.value; softUpdate(); return; }
    if (t.hasAttribute('data-nf64-subject')) { state.subject = t.value; state.units = []; state.anchor = ''; state.message = ''; rerender(`[data-nf64-subject][value="${t.value}"]`); return; }
    if (t.hasAttribute('data-nf64-level')) { state.levels = LEVELS.filter(l => l === t.value ? t.checked : state.levels.includes(l)); state.message = ''; softUpdate(); return; }
    if (t.dataset.nf64Count) { t.value = clamp(t.value); state.counts[t.dataset.nf64Count] = Number(t.value); rerender(`[data-nf64-count="${t.dataset.nf64Count}"]`); return; }
    if (t.hasAttribute('data-nf64-answers')) { state.answers = t.checked; if (!t.checked) state.view = 'q'; softUpdate(); return; }
    if (t.hasAttribute('data-nf64-per')) { state.per = Number(t.value); state.page = 0; softUpdate(); }
  });
  document.addEventListener('input', e => {
    if (!here()) return;
    const t = e.target;
    if (t.hasAttribute('data-nf64-query')) { state.query = t.value; softUpdate(); return; }
    if (t.dataset.nf64Field) { state[t.dataset.nf64Field] = t.value; softUpdate(); return; }
    if (t.dataset.nf64Count) { state.counts[t.dataset.nf64Count] = clamp(t.value); softUpdate(); }
  });
  document.addEventListener('submit', e => { if (e.target.id === 'nf64-form') { e.preventDefault(); if (state.step < 4) goStep(state.step + 1); } });

  // 로그인에서 돌아오면 같은 화면 · 같은 조건으로(주소에는 싣지 않음).
  function resume() {
    if (!routeHere() || !store.get(RESUME, 0)) return;
    store.drop(RESUME);
    state = Object.assign(fresh(), store.get(KEY, {}), { message: '' });
    if (!isMine()) builder.switchMode('materials'); else rerender();
  }
  addEventListener('hashchange', () => setTimeout(resume, 0));

  // 로컬 그림 재기에만: 견본 조건을 채우고 걸음을 엶(서버 호출 0).
  function demo(n) {
    state = Object.assign(fresh(), { book: n >= 1 ? 'sen-cm2' : '', units: n >= 2 ? ['sen-cm2:01', 'sen-cm2:02', 'sen-cm2:03'] : [], academy: n >= 4 ? '한빛수학학원' : '' });
    state.step = n; rerender();
  }
  window.DSNaesinFlowV64 = { demo, go: goStep, state: () => JSON.parse(JSON.stringify(state)), books: BOOKS, waitBooks: WAIT_BOOKS, subjects: SUBJECTS, live: LIVE };
  if (here()) rerender();
  setTimeout(resume, 0);
})();
