/* Book form v62: the teacher's "교재 만들기" builds one light book across several subjects and units.
   Same frame as 프린트 만들기 (steps · dark condition panel · preview). Form and preview skeleton only:
   no question is fetched here, nothing is sent to a server, and the saved composition stays in this browser. */
(() => {
  'use strict';
  const builder = window.DSTeacherBuilderV36;
  if (!builder || typeof teacher !== 'function' || window.DSBookFormV62) return;
  const safe = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  // 2022 개정 교육과정 고시문([별책 8] 수학과 교육과정)의 과목별 영역 이름 그대로.
  const SUBJECTS = [
    { id: 'cm1', name: '공통수학1', units: ['다항식', '방정식과 부등식', '경우의 수', '행렬'] },
    { id: 'cm2', name: '공통수학2', units: ['도형의 방정식', '집합과 명제', '함수와 그래프'] },
    { id: 'alg', name: '대수', units: ['지수함수와 로그함수', '삼각함수', '수열'] },
    { id: 'ca1', name: '미적분Ⅰ', units: ['함수의 극한과 연속', '미분', '적분'] },
    { id: 'pst', name: '확률과 통계', units: ['경우의 수', '확률', '통계'] },
    { id: 'ca2', name: '미적분Ⅱ', units: ['수열의 극한', '미분법', '적분법'] },
    { id: 'geo', name: '기하', units: ['이차곡선', '공간도형과 공간좌표', '벡터'] }
  ];
  const BASES = [
    { id: 'exam', name: '기출문제(모의고사)', note: '수능 · 학력평가 기출을 바탕으로' },
    { id: 'ebs', name: 'EBS 교재', note: 'EBS 교재의 흐름을 바탕으로' },
    { id: 'market', name: '시중 교재', note: '반에서 쓰는 책의 흐름을 바탕으로' }
  ];
  // 시중 교재 목록: 앱 안에 올라온 목록이 있으면 그것만 씀(이름 글자만). 지금 앱에는 목록이 없다.
  const BOOK_LIST = Array.isArray(window.DSBookTitles) ? window.DSBookTitles.map(String).filter(Boolean) : [];
  const NOTICE = '출판사의 문항과 해설은 제공하지 않습니다. 델타스킬이 새로 만든 유사 문항만 제공합니다.';
  const LEVELS = [['easy', '쉬움'], ['mid', '보통'], ['hard', '어려움'], ['mix', '섞기']];
  const STRUCTURES = [
    { id: 's1', name: '기본문제 – 예제 – 연습문제', use: '개념을 막 끝낸 반', parts: [['기본문제', 20, 'easy'], ['예제', 15, 'mid'], ['연습문제', 25, 'mix']] },
    { id: 's2', name: '기본문제 – 유형별 문제 – 연습문제', use: '유형을 고르게 익힐 반', parts: [['기본문제', 15, 'easy'], ['유형별 문제', 40, 'mid'], ['연습문제', 20, 'mix']] },
    { id: 's3', name: '개념 확인 – 대표 유형 – 실전 문제', use: '상위권 반', parts: [['개념 확인', 15, 'easy'], ['대표 유형', 30, 'mid'], ['실전 문제', 20, 'hard']] },
    { id: 's4', name: '유형별 문제 – 단원 마무리', use: '시험 2~3주 전', parts: [['유형별 문제', 45, 'mid'], ['단원 마무리', 20, 'mix']] },
    { id: 's5', name: '기본문제 – 유형별 문제 – 실전 테스트', use: '범위 전체를 한 번 훑을 때', parts: [['기본문제', 15, 'easy'], ['유형별 문제', 30, 'mid'], ['실전 테스트', 30, 'mix', 'end']] },
    { id: 's6', name: '실전 테스트만', use: '시험 전 주 · 전날', parts: [['실전 테스트', 60, 'mix', 'end']] }
  ];
  const normalizeCover=id=>window.DSBookCoverV65?.normalize(id)||(['sunprint','mobileart','press','graphite','ocean'].includes(id)?id:'mobileart');
  const STEPS = ['범위', '바탕 · 구성', '문항 수 · 난이도', '꼴 · 만들기'];
  const KEY = 'ds-bookform-v62', SAVED = 'ds-bookform-saved-v62';
  const store = {
    get(k, f) { try { const v = JSON.parse(localStorage.getItem(k)); return v ?? f; } catch { return f; } },
    put(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch { return false; } }
  };
  const fresh = () => ({ step: 1, units: [], base: 'exam', book: '', structure: 's1', parts: STRUCTURES[0].parts.map(p => ({ count: p[1], level: p[2] })), layout: 2, documentDesign: window.DSDocumentDesign?.selected().id || 'DS-FOCUS-V2', title: '', academy: '', cover: 'mobileart', view: '', message: '' });
  let coverQuery='',coverGroup='';
  let state = Object.assign(fresh(), store.get(KEY, {}));
  state.cover=normalizeCover(state.cover);
  state.message = '';
  state.documentDesign = window.DSDocumentDesign?.selected().id || state.documentDesign;
  const persist = () => {state.cover=normalizeCover(state.cover);if(typeof studio==='object')studio={...studio,bookCover:coverModel()};return store.put(KEY,{...state,message:''});};

  const unitKey = (s, i) => s.id + ':' + i;
  const structure = () => STRUCTURES.find(s => s.id === state.structure) || STRUCTURES[0];
  const chosen = () => SUBJECTS.flatMap(s => s.units.map((u, i) => ({ subject: s, unit: u, key: unitKey(s, i) }))).filter(x => state.units.includes(x.key));
  const subjectAll = s => s.units.every((_, i) => state.units.includes(unitKey(s, i)));
  const subjectSome = s => s.units.some((_, i) => state.units.includes(unitKey(s, i)));
  const clampCount = n => Math.max(0, Math.min(100, Math.round(Number(n) || 0)));
  const partsNow = () => structure().parts.map((p, i) => ({ name: p[0], where: p[3] || 'unit', count: clampCount(state.parts[i]?.count ?? p[1]), level: state.parts[i]?.level || p[2] }));
  const total = () => partsNow().reduce((n, p) => n + p.count, 0);
  const levelName = id => (LEVELS.find(l => l[0] === id) || LEVELS[3])[1];
  const baseName = () => (BASES.find(b => b.id === state.base) || BASES[0]).name;
  const scopeText = () => {
    const parts = SUBJECTS.filter(subjectSome).map(s => subjectAll(s) ? s.name + ' 전체' : s.name + ' ' + s.units.filter((_, i) => state.units.includes(unitKey(s, i))).join(' · '));
    return parts.join(' / ');
  };
  const defaultTitle = () => {
    const subs = SUBJECTS.filter(subjectSome);
    if (!subs.length) return '내신 대비 문제집';
    return (subs.length === 1 ? subs[0].name : subs[0].name + ' 외 ' + (subs.length - 1) + '과목') + ' 내신 대비';
  };
  const title = () => state.title.trim() || defaultTitle();

  function coverModel(){return {style:normalizeCover(state.cover),title:title(),subject:SUBJECTS.filter(subjectSome).map(s=>s.name).join(' · '),units:chosen().map(u=>u.unit),academy:state.academy,count:chosen().length?total():0};}

  // 어림 쪽 수: 표지 1 · 차례 1 · 단원마다 부분마다 새 쪽 · 정답과 해설 2단(한 쪽 6문항 어림).
  function plan() {
    const units = chosen(), parts = partsNow(), per = Number(state.layout) || 2;
    const rows = [];
    let page = 3;
    const unitParts = parts.filter(p => p.where === 'unit'), endParts = parts.filter(p => p.where === 'end');
    units.forEach((u, ui) => {
      const items = unitParts.map(p => {
        const n = Math.floor(p.count / units.length) + (ui < p.count % units.length ? 1 : 0);
        const pages = n ? Math.ceil(n / per) : 0;
        const row = { name: p.name, count: n, level: p.level, page };
        page += pages;
        return row;
      });
      rows.push({ kind: 'unit', subject: u.subject.name, unit: u.unit, page: items[0]?.page ?? page, items });
    });
    endParts.forEach(p => { const pages = p.count ? Math.ceil(p.count / per) : 0; rows.push({ kind: 'end', name: p.name, count: p.count, level: p.level, page }); page += pages; });
    const n = units.length ? total() : 0;
    if(window.DSDocumentDesign?.selected().id !== 'DS-FOCUS-V2')page += n;
    const solutionPage = page;
    page += n ? Math.ceil(n / 6) : 0;
    return { rows, solutionPage, pages: units.length ? page - 1 : 0, perUnit: units.length };
  }

  /* ---------- markup ---------- */
  const heading = () => `<header class="tb36-heading"><div><span>수업 준비</span><h1>교재 만들기</h1></div><a href="#account">내 보관함 ↗</a></header>`;
  function steps() {
    return `<ol class="tb36-steps bf62-steps" aria-label="교재 만들기 순서">${STEPS.map((t, i) => { const n = i + 1, cur = n === state.step, done = n < state.step; return `<li class="${done ? 'is-done' : cur ? 'is-current' : ''}" ${cur ? 'aria-current="step"' : ''}><button type="button" data-bf62-step="${n}" ${n > state.step + 1 || (n > 1 && !chosen().length) ? 'disabled' : ''}><b>${done ? '✓' : n}</b><span>${t}</span></button></li>`; }).join('')}</ol>`;
  }
  function summary() {
    const p = plan(), n = chosen().length ? total() : 0;
    return `<section class="bf62-summary" aria-label="고른 구성 요약" aria-live="polite"><div class="bf62-sum-scope"><span>범위</span><strong>${chosen().length ? safe(scopeText()) : '아직 고른 단원이 없습니다'}</strong></div><dl><div class="bf62-sum-wide"><dt>바탕</dt><dd>${safe(baseName())}${state.base !== 'exam' && state.book ? ' · ' + safe(state.book) : ''}</dd></div><div class="bf62-sum-wide"><dt>구성</dt><dd>${safe(structure().name)}</dd></div><div><dt>문항</dt><dd><b>${n}</b>문항</dd></div><div><dt>어림 쪽 수</dt><dd><b>${p.pages}</b>쪽</dd></div></dl></section>`;
  }
  function stepTitle(n, text) { return `<div class="tb36-section-title"><b>${String(n).padStart(2, '0')}</b><h2>${text}</h2></div>`; }
  function scopeForm() {
    return `${stepTitle(1, '어느 범위로 묶을까요?')}<p class="bf62-lead">과목 전체나 단원을 여러 개 고를 수 있습니다. 과목을 섞어도 됩니다.</p><div class="bf62-subjects">${SUBJECTS.map(s => {
      const all = subjectAll(s), some = subjectSome(s);
      return `<fieldset class="bf62-subject${some ? ' is-on' : ''}"><legend>${safe(s.name)}</legend><label class="bf62-all"><input type="checkbox" data-bf62-all="${s.id}" ${all ? 'checked' : ''} aria-label="${safe(s.name)} 전체">전체</label><div class="bf62-units">${s.units.map((u, i) => `<label class="bf62-chip"><input type="checkbox" data-bf62-unit="${unitKey(s, i)}" ${state.units.includes(unitKey(s, i)) ? 'checked' : ''}><span>${safe(u)}</span></label>`).join('')}</div></fieldset>`;
    }).join('')}</div><p class="bf62-source">단원 이름은 2022 개정 교육과정 고시문의 과목별 영역 이름입니다.</p>`;
  }
  function bookPicker() {
    if (state.base === 'exam') return '';
    const label = state.base === 'ebs' ? 'EBS 교재 이름' : '시중 교재 이름';
    const list = BOOK_LIST.length
      ? `<select data-bf62-field="book" aria-label="${label}"><option value="">책을 고르세요</option>${BOOK_LIST.map(b => `<option ${state.book === b ? 'selected' : ''}>${safe(b)}</option>`).join('')}</select>`
      : `<p class="bf62-empty">이 화면에 올라온 책 목록이 없습니다. 반에서 쓰는 책 이름을 글자로 적어 주세요.</p><input type="text" maxlength="40" data-bf62-field="book" value="${safe(state.book)}" placeholder="예: 학교 부교재 이름" aria-label="${label}">`;
    return `<div class="bf62-book"><span class="bf62-label">${label}${state.base === 'market' ? '' : ' <small>(고르지 않아도 됩니다)</small>'}</span>${list}<p class="bf62-notice" role="note">${NOTICE}</p></div>`;
  }
  function baseForm() {
    return `${stepTitle(2, '무엇을 바탕으로 만들까요?')}<div class="bf62-choices" role="radiogroup" aria-label="바탕">${BASES.map(b => `<label class="bf62-choice"><input type="radio" name="bf62-base" value="${b.id}" data-bf62-base ${state.base === b.id ? 'checked' : ''}><span><strong>${b.name}</strong><small>${b.note}</small></span></label>`).join('')}</div>${bookPicker()}<div class="bf62-subhead"><h3>책의 구성</h3><p>고르면 오른쪽 차례가 바로 바뀝니다.</p></div><div class="bf62-choices bf62-structures" role="radiogroup" aria-label="책의 구성">${STRUCTURES.map(s => `<label class="bf62-choice"><input type="radio" name="bf62-structure" value="${s.id}" data-bf62-structure ${state.structure === s.id ? 'checked' : ''}><span><strong>${s.name}</strong><small>${s.use}</small></span></label>`).join('')}</div>`;
  }
  function countForm() {
    const parts = partsNow(), p = plan();
    return `${stepTitle(3, '부분마다 몇 문항, 어떤 난이도로?')}<p class="bf62-lead">문항 수는 책 전체 기준입니다. 고른 단원 ${p.perUnit}개에 고르게 나눕니다.</p><div class="bf62-parts">${parts.map((x, i) => `<fieldset class="bf62-part"><legend>${safe(x.name)}${x.where === 'end' ? ' <small>책 끝에 한 번</small>' : ''}</legend><label class="bf62-count"><span>문항 수</span><input type="number" min="0" max="100" step="1" inputmode="numeric" value="${x.count}" data-bf62-count="${i}" aria-label="${safe(x.name)} 문항 수"><em>문항</em></label><div class="bf62-levels" role="radiogroup" aria-label="${safe(x.name)} 난이도">${LEVELS.map(([v, t]) => `<label><input type="radio" name="bf62-level-${i}" value="${v}" data-bf62-level="${i}" ${x.level === v ? 'checked' : ''}><span>${t}</span></label>`).join('')}</div></fieldset>`).join('')}</div><div class="bf62-total"><div><span>책 전체</span><strong><b>${total()}</b>문항</strong></div><div><span>어림 쪽 수</span><strong><b>${p.pages}</b>쪽</strong></div><p>표지 · 차례 · 정답과 해설을 넣은 어림입니다. 한 쪽 ${state.layout}문항 기준이며 다음 걸음에서 바꿀 수 있습니다.</p></div>`;
  }
  function makeArea() {
    const signed = Boolean(window.DSService?.session?.());
    const saved = store.get(SAVED, []);
    const head = `<div class="bf62-make"><h3>구성 보관</h3><p>지금은 구성과 지면 견본을 확인하는 단계입니다. 실제 문항이 담긴 교재 파일 생성은 아직 연결되지 않았습니다.</p><button type="button" class="bf62-cover-print" data-bf62-print-cover>표지 인쇄 / PDF <span>↗</span></button>`;
    if (!signed) {
      const signup = window.DSService?.accountLinks ? window.DSService.accountLinks('signup') : '';
      return `${head}<p>로그인하면 이 구성을 보관할 수 있습니다. 로그인 뒤 이 화면으로 돌아오며 고른 구성은 그대로 남습니다.</p><button type="button" class="tb36-primary" data-bf62-login>로그인하고 이어 가기 <span>→</span></button>${signup ? `<a class="bf62-signup" href="${safe(signup)}" target="_blank" rel="noopener">처음이면 회원가입 <span aria-hidden="true">↗</span></a><p class="bf62-small">가입은 새 창에서 열립니다. 가입을 마치고 이 창에서 로그인하면 됩니다.</p>` : ''}</div>`;
    }
    return `${head}<p>지금 고른 범위 · 바탕 · 구성 · 문항 수 · 난이도 · 꼴을 한 묶음으로 보관합니다. 보관함은 이 브라우저에 저장되어 다른 기기에서는 보이지 않습니다.</p><button type="button" class="tb36-primary" data-bf62-save>이 구성 보관 <span>→</span></button><p class="tb36-message bf62-made" role="status">${safe(state.message)}</p>${saved.length ? `<div class="bf62-saved"><strong>이 브라우저에 보관한 구성</strong><ul>${saved.slice().reverse().map((x, i) => `<li><span>${safe(x.title)}<small>${safe(x.when)} · ${x.total}문항</small></span><button type="button" data-bf62-open="${saved.length - 1 - i}">다시 열기</button></li>`).join('')}</ul></div>` : ''}</div>`;
  }
  function styleForm() {
    return `${stepTitle(4, '책의 꼴을 정합니다')}${window.DSDocumentDesign?.picker()||''}<div class="bf62-field"><span class="bf62-label">한 쪽 문항 수</span><div class="bf62-segment" role="radiogroup" aria-label="한 쪽 문항 수">${[1, 2, 4].map(n => `<label><input type="radio" name="bf62-layout" value="${n}" data-bf62-layout ${Number(state.layout) === n ? 'checked' : ''}><span>${n}문항</span></label>`).join('')}</div></div><label class="bf62-field"><span class="bf62-label">책 제목</span><input type="text" maxlength="60" data-bf62-field="title" value="${safe(state.title)}" placeholder="${safe(defaultTitle())}"></label><label class="bf62-field"><span class="bf62-label">학원 이름 <small>머리말과 표지에 들어갑니다</small></span><input type="text" maxlength="30" data-bf62-field="academy" value="${safe(state.academy)}" placeholder="예: ○○수학학원"></label><div class="bf62-field"><span class="bf62-label">표지</span>${window.DSBookCoverV65?.picker(coverModel(),coverQuery,coverGroup)||'<p>표지 선택기를 불러오고 있습니다.</p>'}</div>${makeArea()}`;
  }
  function nav() {
    const back = state.step > 1 ? `<button type="button" class="bf62-back" data-bf62-step="${state.step - 1}">← ${STEPS[state.step - 2]}</button>` : '';
    const next = state.step < 4 ? `<button type="button" class="tb36-primary" data-bf62-next>다음 · ${STEPS[state.step]} <span>→</span></button>` : '';
    const signedSave = state.step === 4 && Boolean(window.DSService?.session?.());
    return `<div class="bf62-nav">${next}${back}${signedSave ? '' : `<p class="tb36-message" role="status">${safe(state.message)}</p>`}</div>`;
  }
  function form() {
    const body = state.step === 1 ? scopeForm() : state.step === 2 ? baseForm() : state.step === 3 ? countForm() : styleForm();
    return `<form id="bf62-form" class="tb36-conditions bf62-panel" novalidate>${body}${nav()}</form>`;
  }

  /* ---------- preview ---------- */
  const roman = n => ['Ⅰ', 'Ⅱ', 'Ⅲ', 'Ⅳ', 'Ⅴ', 'Ⅵ', 'Ⅶ', 'Ⅷ', 'Ⅸ', 'Ⅹ', 'Ⅺ', 'Ⅻ'][n] || String(n + 1);
  function coverPage() {
    return `<div class="bf62-paper bf62-cover">${window.DSBookCoverV65?.render(coverModel())||`<h4>${safe(title())}</h4>`}</div>`;
  }
  function tocPage() {
    const p = plan();
    if (!p.rows.length) return `<div class="bf62-paper bf62-toc"><div class="bf62-pg-head"><span>${safe(state.academy || '학원 이름')}</span><span>차례</span></div><h4>차례</h4><p class="bf62-toc-empty">왼쪽에서 단원을 고르면 차례가 여기에 그려집니다.</p></div>`;
    let ui = 0;
    const unitRows = p.rows.filter(r => r.kind === 'unit'), endRows = p.rows.filter(r => r.kind === 'end');
    const lines = r => r.kind === 'unit' ? 1 + r.items.length : 1;
    const shown = [];
    let used = endRows.length + 1;
    for (const r of unitRows) { if (used + lines(r) > 15) break; shown.push(r); used += lines(r); }
    const hidden = unitRows.length - shown.length;
    const more = hidden ? `<li class="bf62-toc-more">단원 ${hidden}개가 차례 다음 쪽에 이어집니다</li>` : '';
    const rows = [...shown, ...endRows].map(r => r.kind === 'unit'
      ? `<li class="bf62-toc-unit"><div><b>${roman(ui++)}</b><strong>${safe(r.unit)}</strong><small>${safe(r.subject)}</small><em>${r.page}</em></div><ol>${r.items.map(it => `<li><span>${safe(it.name)}</span><small>${it.count}문항 · ${levelName(it.level)}</small><em>${it.page}</em></li>`).join('')}</ol></li>`
      : `<li class="bf62-toc-unit bf62-toc-end"><div><b>+</b><strong>${safe(r.name)}</strong><small>${r.count}문항 · ${levelName(r.level)}</small><em>${r.page}</em></div></li>`).join('');
    return `<div class="bf62-paper bf62-toc"><div class="bf62-pg-head"><span>${safe(state.academy || '학원 이름')}</span><span>${safe(title())}</span></div><h4>차례</h4><ol class="bf62-toc-list">${rows.replace(/(<li class="bf62-toc-unit bf62-toc-end">)/, more + '$1') || ''}${endRows.length ? '' : more}<li class="bf62-toc-unit bf62-toc-end"><div><b>=</b><strong>정답과 해설</strong><small>2단</small><em>${p.solutionPage}</em></div></li></ol></div>`;
  }
  function bodyPage() {
    const p = plan(), per = Number(state.layout) || 2, first = p.rows.find(r => r.kind === 'unit');
    const label = first ? `${roman(0)}. ${first.unit} · ${first.items[0]?.name || ''}` : (p.rows[0]?.name || '본문');
    const boxes = Array.from({ length: per }, (_, i) => `<div class="bf62-q"><b>${String(i + 1).padStart(2, '0')}</b><i></i><i></i><i class="bf62-short"></i><span class="bf62-room"></span></div>`).join('');
    return `<div class="bf62-paper bf62-body" data-document-design="${safe(window.DSDocumentDesign?.selected().id||'DS-FOCUS-V2')}"><div class="bf62-pg-head"><span>${safe(state.academy || '학원 이름')}</span><span>${safe(title())}</span></div><div class="bf62-sec">${safe(label)}</div><div class="bf62-qs bf62-qs-${per}">${boxes}</div><div class="bf62-pg-foot"><span>DELTASKILL</span><span>${first?.page || 3}</span></div></div>`;
  }
  function recordPreview() {
    const sequence=window.DSDocumentDesign?.selected().id === 'DS-SEQUENCE-V2';
    const labels=sequence?['01 · 조건 읽기','02 · 핵심 판단','03 · 풀이 확인','다시 풀기']:['첫 생각','막힌 지점','다음 시도'];
    return `<div class="bf62-paper bf62-body dd-book-record"><div class="bf62-pg-head"><span>${safe(state.academy||'학원 이름')}</span><span>${safe(title())}</span></div><div class="bf62-sec">01번 · ${sequence?'세 판단 기록':'풀이 기록'}</div><div class="dd-book-records" data-record-kind="${sequence?'sequence':'margin'}">${labels.map(t=>`<section><b>${t}</b><div></div></section>`).join('')}</div><div class="bf62-pg-foot"><span>${safe(window.DSDocumentDesign?.selected().name)}</span><span>문항별 기록면</span></div></div>`;
  }
  function preview() {
    const view = state.view || (state.step === 4 ? 'cover' : 'toc');
    const p = plan();
    const tabs = [['cover', '표지'], ['toc', '차례'], ['page', '문제면']];
    if(window.DSDocumentDesign?.selected().id !== 'DS-FOCUS-V2')tabs.push(['record','기록면']);
    const page = view === 'cover' ? coverPage() : view === 'page' ? bodyPage() : view === 'record' ? recordPreview() : tocPage();
    return `<aside class="tb36-order-preview ds48-canvas bf62-preview" aria-label="책 미리보기"><div class="ds48-preview-toolbar bf62-toolbar"><strong>책 미리보기</strong><small>${chosen().length ? total() : 0}문항 · 어림 ${p.pages}쪽 · 한 쪽 ${state.layout}문항</small></div><div class="bf62-tabs" role="tablist" aria-label="미리보기 쪽">${tabs.map(([v, t]) => `<button type="button" role="tab" aria-selected="${view === v}" data-bf62-view="${v}">${t}</button>`).join('')}</div><div class="bf62-stage">${window.DSPrintSurfaceV48 ? window.DSPrintSurfaceV48.scene(page) : `<div class="bf62-plain">${page}</div>`}</div><p class="bf62-stage-note">${view === 'record' ? '선택한 디자인의 문항별 기록면 견본입니다. 실제 문항 정보는 들어 있지 않습니다.' : view === 'page' ? '쪽 그림 뼈대입니다. 문항 자리와 머리말 · 쪽 번호의 놓임을 보여 줍니다.' : view === 'cover' ? '표지 꼴과 제목 · 학원 이름이 놓이는 자리입니다.' : '쪽 번호는 고른 문항 수와 한 쪽 문항 수로 셈한 어림입니다.'}</p></aside>`;
  }

  function bookView() {
    return `<div class="bf62-root">${steps()}${summary()}<div class="tb36-setup bf62-setup">${form()}${preview()}</div></div>`;
  }

  /* ---------- wiring ---------- */
  const previousTeacher = teacher;
  const isBook = () => builder.snapshot?.().mode === 'book';
  teacher = function () {
    if (!isBook()) return previousTeacher.apply(this, arguments);
    const html = previousTeacher.apply(this, arguments);
    const start = html.indexOf('<header class="tb36-heading">');
    if (start < 0) return html;
    const t = document.createElement('template'); t.innerHTML = html;
    const surface = t.content.querySelector('.tb36-surface');
    if (!surface) return html;
    surface.classList.add('bf62-surface','dd-modern');
    [...surface.children].forEach(el => { if (!el.matches('.tb36-modes, .tb36-compact-footer, footer, [class*="footer"]')) el.remove(); });
    const modes = surface.querySelector('.tb36-modes');
    const wrap = document.createElement('template'); wrap.innerHTML = heading() + bookView();
    if (modes) modes.after(wrap.content); else surface.prepend(wrap.content);
    requestAnimationFrame(() => pinSummary());
    return surface.outerHTML;
  };
  const routeHere = () => ['#teacher', '#studio'].includes(location.hash);
  function rerender(focus) {
    persist();
    if (!routeHere() || !isBook()) return;
    const content = document.getElementById('content');
    const y = scrollY;
    content.innerHTML = teacher();
    pinSummary();
    scrollTo(0, y);
    if (focus) content.querySelector(focus)?.focus({ preventScroll: true });
  }
  function pinSummary() {
    // The site header is sticky; the summary band sits right under it.
    const band = document.querySelector('.bf62-summary'), head = document.getElementById('header');
    if (!band || !head) return;
    const sticky = getComputedStyle(head).position === 'sticky' || getComputedStyle(head).position === 'fixed';
    document.documentElement.style.setProperty('--bf62-head', (sticky ? Math.round(head.getBoundingClientRect().height) : 0) + 'px');
  }
  addEventListener('resize', () => { if (routeHere() && isBook()) pinSummary(); });
  function softUpdate() {
    // Typing keeps the focused input: only the read-only parts are redrawn.
    persist();
    const root = document.querySelector('.bf62-root');
    if (!root) return;
    const swap = (sel, html) => { const el = root.querySelector(sel); if (el) el.outerHTML = html; };
    swap('.bf62-summary', summary());
    swap('.bf62-preview', preview());
    const focusCover=document.activeElement?.hasAttribute?.('data-bf62-cover')?document.activeElement.value:null;
    const oldScroll=root.querySelector('.bf62-covers')?.scrollTop||0;
    if(window.DSBookCoverV65){
      swap('.bf62-covers',window.DSBookCoverV65.options(coverModel(),coverQuery,coverGroup));
      swap('.bc65-current',window.DSBookCoverV65.status(coverModel()));
    }
    const grid=root.querySelector('.bf62-covers');if(grid)grid.scrollTop=oldScroll;
    if(focusCover)root.querySelector(`[data-bf62-cover][value="${focusCover}"]`)?.focus({preventScroll:true});
    const totalBox = root.querySelector('.bf62-total');
    if (totalBox) { const t = document.createElement('template'); t.innerHTML = countForm(); const nt = t.content.querySelector('.bf62-total'); if (nt) totalBox.replaceWith(nt); }
  }
  function goStep(n) {
    n = Math.max(1, Math.min(4, Number(n) || 1));
    if (n > 1 && !chosen().length) { state.message = '단원을 하나 이상 골라 주세요. 과목의 「전체」를 눌러도 됩니다.'; rerender('[data-bf62-all]'); return false; }
    if (n > 2 && state.base === 'market' && !state.book.trim()) { state.step = 2; state.message = '시중 교재 이름을 적어 주세요. 그 책의 흐름에 맞춰 차례를 짭니다.'; rerender('[data-bf62-field="book"]'); return false; }
    if (n > 3 && total() < 1) { state.step = 3; state.message = '문항 수를 1문항 이상 넣어 주세요.'; rerender('[data-bf62-count]'); return false; }
    state.step = n; state.view = ''; state.message = '';
    rerender('#bf62-form h2');
    document.querySelector('.bf62-root')?.scrollIntoView({ block: 'start', behavior: 'instant' });
    return true;
  }
  function setStructure(id) {
    const s = STRUCTURES.find(x => x.id === id); if (!s) return;
    state.structure = id; state.parts = s.parts.map(p => ({ count: p[1], level: p[2] }));
  }
  async function printCover(){
    const html=window.DSBookCoverV65?.documentHTML(coverModel());if(!html)return;
    const win=window.open('','_blank');if(!win){state.message='팝업을 허용한 뒤 표지 인쇄를 다시 눌러 주세요.';rerender();return;}
    win.document.open();win.document.write(html);win.document.close();
    const started=Date.now();const timer=setInterval(()=>{if(win.closed){clearInterval(timer);return;}if(win.document.body?.dataset.ready==='true'){clearInterval(timer);if(win.document.body.dataset.renderError){state.message='표지 이미지를 불러오지 못했습니다. 잠시 뒤 다시 눌러 주세요.';rerender();return;}win.focus();win.print();}else if(Date.now()-started>14000){clearInterval(timer);state.message='표지를 불러오는 시간이 길어지고 있습니다. 새 표지 창에서 다시 확인해 주세요.';rerender();}},80);
  }
  function saveConfig() {
    const list = store.get(SAVED, []);
    const now = new Date();
    const when = `${now.getMonth() + 1}월 ${now.getDate()}일 ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    state.documentDesign=window.DSDocumentDesign?.selected().id||state.documentDesign;
    list.push({ title: title(), when, total: total(), config: { ...state, step: 4, view: '', message: '' } });
    const ok = store.put(SAVED, list.slice(-12));
    state.message = ok ? '이 브라우저의 보관함에 담았습니다. 아래 목록에서 다시 열 수 있습니다.' : '이 브라우저에 보관하지 못했습니다. 사생활 보호 창이면 일반 창에서 다시 눌러 주세요.';
    rerender('[data-bf62-save]');
  }
  document.addEventListener('click', e => {
    if (!routeHere() || !isBook()) return;
    const b = e.target.closest('[data-bf62-step],[data-bf62-next],[data-bf62-view],[data-bf62-login],[data-bf62-save],[data-bf62-open],[data-bf62-print-cover]');
    if (!b || b.disabled) return;
    if (b.hasAttribute('data-bf62-next')) { goStep(state.step + 1); return; }
    if (b.dataset.bf62Step) { goStep(b.dataset.bf62Step); return; }
    if (b.dataset.bf62View) { state.view = b.dataset.bf62View; persist(); const el = document.querySelector('.bf62-preview'); if (el) el.outerHTML = preview(); document.querySelector(`[data-bf62-view="${state.view}"]`)?.focus({ preventScroll: true }); return; }
    if (b.hasAttribute('data-bf62-login')) { persist(); window.DSLoginReturn = '#teacher'; location.hash = '#login'; return; }
    if (b.hasAttribute('data-bf62-print-cover')) { printCover(); return; }
    if (b.hasAttribute('data-bf62-save')) { saveConfig(); return; }
    if (b.dataset.bf62Open) { const x = store.get(SAVED, [])[Number(b.dataset.bf62Open)]; if (x?.config) { state = Object.assign(fresh(), x.config, { message: '보관한 구성을 다시 열었습니다.' }); state.cover=normalizeCover(state.cover);if(state.documentDesign)window.DSDocumentDesign?.select(state.documentDesign); rerender(); } }
  });
  document.addEventListener('change', e => {
    if (!routeHere() || !isBook()) return;
    const t = e.target;
    if (t.dataset.bf62Unit) { const k = t.dataset.bf62Unit; state.units = t.checked ? [...new Set([...state.units, k])] : state.units.filter(x => x !== k); state.message = ''; rerender(`[data-bf62-unit="${k}"]`); return; }
    if (t.dataset.bf62All) { const s = SUBJECTS.find(x => x.id === t.dataset.bf62All); const keys = s.units.map((_, i) => unitKey(s, i)); state.units = t.checked ? [...new Set([...state.units, ...keys])] : state.units.filter(x => !keys.includes(x)); state.message = ''; rerender(`[data-bf62-all="${s.id}"]`); return; }
    if (t.hasAttribute('data-bf62-base')) { state.base = t.value; if (t.value === 'exam') state.book = ''; state.message = ''; rerender(`[data-bf62-base][value="${t.value}"]`); return; }
    if (t.hasAttribute('data-bf62-structure')) { setStructure(t.value); rerender(`[data-bf62-structure][value="${t.value}"]`); return; }
    if (t.dataset.bf62Level) { const i = Number(t.dataset.bf62Level); state.parts[i] = { ...state.parts[i], level: t.value }; softUpdate(); return; }
    if (t.dataset.bf62Count) { const i = Number(t.dataset.bf62Count); t.value = clampCount(t.value); state.parts[i] = { ...state.parts[i], count: Number(t.value) }; softUpdate(); return; }
    if (t.hasAttribute('data-bf62-layout')) { state.layout = Number(t.value); softUpdate(); return; }
    if(t.hasAttribute('data-bf62-cover-group')){coverGroup=t.value;softUpdate();document.querySelector('.bf62-covers')?.scrollTo(0,0);return;}
    if (t.hasAttribute('data-bf62-cover')) { state.cover = normalizeCover(t.value); state.view = 'cover'; softUpdate(); return; }
    if (t.tagName === 'SELECT' && t.dataset.bf62Field === 'book') { state.book = t.value; softUpdate(); }
  });
  document.addEventListener('input', e => {
    if (!routeHere() || !isBook()) return;
    const t = e.target;
    if(t.hasAttribute('data-bf62-cover-filter')){coverQuery=t.value;softUpdate();return;}
    if (t.dataset.bf62Field && t.tagName === 'INPUT') { state[t.dataset.bf62Field] = t.value; if (t.dataset.bf62Field !== 'book') state.view = 'cover'; softUpdate(); return; }
    if (t.dataset.bf62Count) { const i = Number(t.dataset.bf62Count); state.parts[i] = { ...state.parts[i], count: clampCount(t.value) }; softUpdate(); }
  });
  document.addEventListener('submit', e => { if (e.target.id === 'bf62-form') { e.preventDefault(); if (state.step < 4) goStep(state.step + 1); } });

  window.addEventListener('ds-document-design-change',()=>{state.documentDesign=window.DSDocumentDesign.selected().id;if(routeHere()&&isBook()){state.view=state.documentDesign==='DS-FOCUS-V2'?'page':'record';rerender();}});
  // Local screenshots only: fill a sample composition and open a step.
  function demo(n) {
    state = Object.assign(fresh(), { units: ['cm1:0', 'cm1:1', 'cm1:2', 'cm1:3', 'alg:2'], base: n >= 2 ? 'market' : 'exam', book: n >= 2 ? '학교 부교재' : '', academy: n >= 3 ? '한빛수학학원' : '', title: n >= 4 ? '2학기 기말 대비' : '' });
    setStructure('s2');
    state.step = n; rerender();
  }
  window.DSBookFormV62 = { coverModel, coverDocument:()=>window.DSBookCoverV65?.documentHTML(coverModel()), demo, go: goStep, preview: v => { state.view = v; rerender(); }, state: () => JSON.parse(JSON.stringify(state)), subjects: SUBJECTS, structures: STRUCTURES };
  if (routeHere() && isBook()) rerender();
})();
