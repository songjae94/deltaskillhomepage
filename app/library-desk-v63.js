/* 자료실 r1(v63) — 판매 자료 고르기 · 학교 기출 올리기 · 수능 기출 해설.
   판매 목록은 /naesin/catalog.json 과 /pay-config.json 에서만 그린다(naesin/on-sale.js 와 같은 잣대: 값 · 면세값 · 파일 · 판매일 · PAY_MODE).
   구매 주소는 내신 쪽과 같은 꼴 그대로: 구매하기 = /checkout/?sku=<SKU>.<형식> · 받을 내용 = /naesin/?s=…&v=confirm.
   학교 기출은 받는 서버가 없어 메일(admin@deltaskill.co.kr)로 보낸다. 서버 · DB 호출 0. */
(() => {
  'use strict';

  const main = document.getElementById('content');
  if (!main || typeof libraryPage !== 'function' || window.DSLibraryDeskV63) return;

  const ORIGIN = 'https://www.deltaskill.co.kr';
  const MAIL = 'admin@deltaskill.co.kr';
  // 「포인트로 받기」 스위치 — 기본 꺼짐. 켜도 포인트 서버(window.DSPointService.redeemPdf)가 없으면 아무것도 그리지 않는다.
  const POINT_PDF = true;
  const UPLOAD_POINTS = '10,000';
  const FORMATS = { pdf: 'PDF', hwpx: '한글(HWPX)' };
  const GRADES = { 1: '1학년', 2: '2학년', 3: '3학년' };
  const SEMESTERS = { 1: '1학기', 2: '2학기' };
  const PERIODS = { midterm: '중간고사', final: '기말고사' };
  const SUBJECTS = ['공통수학1', '공통수학2', '대수', '미적분Ⅰ', '확률과 통계', '미적분Ⅱ', '기하'];
  const FILE_TYPES = ['pdf', 'jpg', 'jpeg', 'png', 'webp'];
  const BOOK_NOTE = '출판사의 문항과 해설은 제공하지 않습니다. 델타스킬이 새로 만든 유사 문항만 제공합니다.';

  // 수능 · 모의평가 — 사이트에 실제로 있는 쪽만 적는다(없는 회차 · 없는 꼴은 줄을 두지 않는다).
  const EXAMS = [
    { mark: '수능', year: '2027', title: '2027학년도 대학수학능력시험', when: '2026년 11월 19일 시행',
      links: [['/my/notes/?exam=SN27&mode=grade', '채점 · 오답 기록', true],
              ['https://wdown.ebsi.co.kr/W61001/01exam/20261119/go3/live_main_paper_1_math_K63RYJL3.pdf', '문제지 PDF', false, 'EBSi 공개 파일']] },
    { mark: '9월', year: '2027', title: '2027학년도 9월 모의평가', when: '2026년 9월 2일 시행',
      links: [['/exam/m09/', '문제 · 해설 보기', true],
              ['/report/2027-09/', '난이도 분석 · 총평'], ['/my/notes/?exam=MP27_09&mode=grade', '채점하기']] },
    { mark: '6월', year: '2027', title: '2027학년도 6월 모의평가', when: '2026년 6월 4일 시행',
      links: [['/report/2027-06/', '등급을 가른 문항 분석', true], ['/my/notes/?exam=MP27_06&mode=grade', '채점하기']] }
  ];

  const entities = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
  const h = value => String(value ?? '').replace(/[&<>"']/g, c => entities[c]);
  const won = n => Number(n).toLocaleString('ko-KR') + '원';
  // 11-25 61: PDF · 한글 모두 포인트 — 꼴마다 서버 포인트 목록 SKU(<책 SKU>.pdf · .hwpx).
  // 57 1125: 손님은 포인트 목록(회원 부름)을 못 읽는다 — 판매 목록 값으로 보이고(materials-shop 과 같은 잣대), 값이 없을 때만 로그인 권함.
  const pointQuote = (item, fmt = 'pdf') => window.DSPointPdf?.product(item.sku + '.' + fmt);
  const publicPoints = (item, fmt = 'pdf') => Number.isSafeInteger(item.formats?.[fmt]?.price) ? item.formats[fmt].price : null;
  const signedIn = () => Boolean(window.DSAuth?.get?.());
  // H28-19 · H28-35(11-26 104): 목록을 읽었는데 없는 SKU 는 P 값을 지어내지 않음 — 한글은 카드 값, PDF 는 목록에 없다고.
  const unlisted = (item, fmt) => window.DSPointPdf?.listed?.(item.sku + '.' + fmt) === false;
  const shownPrice = (item,fmt) => pointQuote(item,fmt) ? pointQuote(item,fmt).points.toLocaleString('ko-KR') + ' P' : unlisted(item,fmt) ? (fmt === 'hwpx' && publicPoints(item,fmt) !== null ? '카드 ' + won(publicPoints(item,fmt)) : '포인트 목록에 없음') : publicPoints(item,fmt) !== null ? publicPoints(item,fmt).toLocaleString('ko-KR') + ' P' : signedIn() ? '포인트 가격 확인 중' : '로그인하면 포인트 값이 보여요';
  const abs = path => /^https:\/\//.test(path) ? path : ORIGIN + path;
  const outLink = (href, body, cls = '') => `<a class="${cls}" href="${h(abs(href))}" target="_blank" rel="noopener">${body}<span aria-hidden="true">↗</span><span class="sr-only"> 새 탭</span></a>`;

  /* 들어온 주소의 pointPdf(=책 SKU.pdf)를 처음 고른 자료로 — 없으면 목록 첫 책(11-25 30: 다른 책이 골라져 보였다) */
  const state = { load: 'idle', items: [], hasHwp: false, subject: '', search: '', sku: (new URLSearchParams(location.search).get('pointPdf') || '').replace(/\.(pdf|hwpx)$/, ''), fmt: 'pdf', uploadOpen: false, uploadMsg: null };

  /* ---------- 판매 목록 ---------- */
  function filesOf(u, f) { return ((u && u.files) || []).filter(x => x.fmt === f); }
  // naesin/on-sale.js 의 open() 과 같은 잣대.
  function open(u, f, now) {
    const pr = u && u.price && u.price[f];
    if (!pr || !u.taxFreeAmount || u.taxFreeAmount[f] == null || !u.saleFrom || (!u.sample && u.releaseVerified !== true) || !filesOf(u, f).length) return false;
    if (now < Date.parse(u.saleFrom)) return false;
    return !(u.saleTo && now >= Date.parse(u.saleTo));
  }
  function build(cat, cfg) {
    const out = [], now = Date.now();
    if (!cat || !Array.isArray(cat.subjects) || !cfg || (cfg.PAY_MODE !== 'test' && cfg.PAY_MODE !== 'live')) return out;
    const thumbs = new Map((Array.isArray(window.DSCatalog) ? window.DSCatalog : []).map(d => [d.sku, d]));
    cat.subjects.slice().sort((a, b) => a.grade < b.grade ? -1 : a.grade > b.grade ? 1 : 0).forEach(s => {
      (s.units || []).forEach(u => {
        const formats = {};
        for (const f of Object.keys(FORMATS)) if (open(u, f, now)) formats[f] = { reviewed: !!window.DSOnSale?.reviewed(u,f), price: u.price[f], files: filesOf(u, f) };
        if (!Object.keys(formats).length || !/^NS-[A-Z0-9]+-\d+$/.test(u.sku || '')) return;
        const book = (s.textbooks || [])[0];
        const app = thumbs.get(u.sku);
        const thumb = app && Array.isArray(app.previewPages) && app.previewPages[0] === `public-data/${u.sku}-1.png` ? app.previewPages[0] : '';
        const sample = app && app.pdf === `public-data/${u.sku}.pdf` ? app.pdf + (/^[a-f0-9]{64}$/.test(app.sha256 || '') ? '?v=' + app.sha256.slice(0,12) : '') : '';
        out.push({ sku: u.sku, grade: s.grade, subject: s.subject, code: s.code, major: u.major || '', no: u.no, unit: u.displayUnit || u.unit,
          name: u.displayTitle || u.name || `${s.subject} · ${u.no} ${u.unit}`, count: u.count || 0, edition: u.displayEdition || u.edition, editionNote: u.editionNote, book, composition: u.composition || 'C1',
          formats, thumb, sample, previewPages: (sample && app.samplePdfPages) || (u.preview && u.preview.pages) || (app && app.previewPages ? app.previewPages.length : 0) });
      });
    });
    return out;
  }
  function confirmHref(item, f) {
    if (!item.book) return ORIGIN + '/naesin/?' + new URLSearchParams({ s: item.code });
    const q = new URLSearchParams({ s: item.code });
    q.set('b', item.book.id); q.set('p', 'detail'); q.set('c', item.composition); q.set('u', item.no); q.set('x', item.sku); q.set('f', f); q.set('v', 'confirm');
    return ORIGIN + '/naesin/?' + q;
  }
  const checkoutHref = (item, f) => ORIGIN + '/checkout/?sku=' + encodeURIComponent(item.sku + '.' + f);
  const getJson = url => fetch(url, { cache: 'no-store' }).then(r => r.ok ? r.json() : null).catch(() => null);

  function load() {
    if (state.load === 'loading' || state.load === 'ready') return;
    state.load = 'loading';
    Promise.all([getJson('/naesin/catalog.json'), getJson('/pay-config.json')]).then(([cat, cfg]) => {
      if (!cat || !cfg) { state.load = 'error'; repaintShop(); return; }
      state.items = build(cat, cfg);
      state.hasHwp = state.items.some(item => item.formats.hwpx);
      state.load = 'ready';
      if (!state.items.some(item => item.sku === state.sku)) state.sku = state.items[0]?.sku || '';
      repaintShop();
    });
  }

  const current = () => state.items.find(item => item.sku === state.sku) || null;
  const normalizeSearch = value => value.normalize('NFKC').replace(/\s+/g,'').toLowerCase();
  const visible = () => state.items.filter(item => (!state.subject || item.subject === state.subject) &&
    normalizeSearch([item.subject,item.unit,item.name,item.edition,item.major].filter(Boolean).join(' ')).includes(normalizeSearch(state.search)));
  const fmtOf = item => item.formats[state.fmt] ? state.fmt : Object.keys(item.formats)[0];

  function row(item) {
    const on = item.sku === state.sku;
    const cells = Object.keys(FORMATS).filter(f => f === 'pdf' || state.hasHwp).map(f => {
      const v = item.formats[f];
      return `<span class="dl63-cell dl63-cell-${f}">${v ? `<small>${FORMATS[f]}</small><b>${shownPrice(item,f)}</b>` : '<small>—</small>'}</span>`;
    }).join('');
    return `<li><button type="button" class="dl63-row" data-dl63-pick="${h(item.sku)}" aria-pressed="${on}">
      ${item.thumb ? `<img class="dl63-thumb" src="${h(item.thumb)}" alt="" width="804" height="1137" loading="lazy">` : '<span class="dl63-thumb dl63-thumb-none" aria-hidden="true"></span>'}
      <span class="dl63-row-text"><small>${h(item.grade)} · ${h(item.subject)}</small><strong>${h(item.no)} ${h(item.unit)}</strong><span>${item.edition ? h(item.edition)+' · ' : ''}${h(item.major.replace(/^[ⅠⅡⅢⅣⅤⅥ]+\s*/, ''))} · ${item.count}문항</span></span>
      <span class="dl63-cells">${cells}</span>
    </button></li>`;
  }

  function receipt(item) {
    if (!item) return '<div class="dl63-receipt"><p class="dl63-empty">왼쪽 목록에서 자료를 고르세요.</p></div>';
    const f = fmtOf(item), v = item.formats[f];
    if (!v.reviewed) return `<div class="dl63-receipt"><h3>${h(item.name)}</h3><p>문항 재검토로 기존 파일 판매를 중단했습니다.</p><div class="dl63-sub">${item.sample ? `<a href="${h(item.sample)}">무료 미리보기</a>` : ''}<a href="/my/">내가 받은 파일 보기</a></div></div>`;
    const fmts = Object.keys(item.formats).map(k => `<button type="button" class="dl63-fmt" data-dl63-fmt="${k}" aria-pressed="${k === f}"><span>${FORMATS[k]}</span><b>${shownPrice(item,k)}</b></button>`).join('');
    const lay = v.files.filter(x => x.layout).map(x => `<li><span>${h(x.layout)}</span><b>${x.pages ? x.pages + '쪽' : ''}</b></li>`).join('');
    const quote = pointQuote(item, f), pointId = item.sku + '.' + f;
    const point = POINT_PDF && quote && typeof window.DSPointService?.redeemPdf === 'function'
      ? `<button type="button" class="dl63-point" data-dl63-point="${h(pointId)}"${window.DSPointPdf.availability(pointId) ? '' : ' disabled'}>${quote.owned ? '이미 보유 · 차감 없이 받기' : '포인트로 묶음 받기'}</button>` : POINT_PDF && !signedIn() ? '<a class="dl63-point" href="#login">로그인하고 포인트로 받기</a><p class="dl63-note">가입하면 받는 포인트로 PDF · 한글을 받을 수 있어요.</p>' : '';
    return `<div class="dl63-receipt">
      <span class="dl63-kicker">고른 자료</span>
      <h3>${h(item.name)}</h3>
      <dl class="dl63-facts"><div><dt>과목</dt><dd>${h(item.grade)} ${h(item.subject)}</dd></div><div><dt>단원</dt><dd>${h(item.major)} › ${h(item.no)} ${h(item.unit)}</dd></div><div><dt>문항</dt><dd>${item.count}문항</dd></div></dl>
      <div class="dl63-fmts" role="group" aria-label="받을 꼴">${fmts}</div>
      <div class="dl63-get"><p><strong>받는 것</strong><span>${FORMATS[f]} ${v.files.length}파일</span></p>${lay ? `<ul>${lay}</ul>` : ''}</div>
      <p class="dl63-total"><span>값</span><b>${shownPrice(item,f)}</b></p>
      ${POINT_PDF ? (quote ? '<p class="dl63-small">구성 '+v.files.length+'파일 · 묶음 가격 1회 차감</p>' : window.DSAuth && !window.DSAuth.has() ? `<a class="dl63-buy" href="${h(window.DSAuth.loginUrl('/app/?pointPdf=' + encodeURIComponent(pointId) + '#library'))}">로그인하고 포인트로 받기</a>` : unlisted(item, f) ? `<p class="dl63-small">이 ${FORMATS[f]} 자료는 포인트 목록에 없습니다.${f === 'hwpx' ? ' 아래 카드 결제로 받을 수 있습니다.' : ''}</p>` : window.DSPointPdf?.phase?.() === 'error' ? '<p class="dl63-small">포인트 목록을 확인하지 못했습니다. 「목록·잔액 다시 확인」을 눌러 주세요.</p>' : '<p class="dl63-small">포인트 가격과 파일을 확인하는 중입니다.</p>') : `<a class="dl63-buy" data-dl63-buy href="${h(checkoutHref(item, f))}" target="_blank" rel="noopener">구매하기<span aria-hidden="true">↗</span><span class="sr-only"> 새 탭</span></a>`}
      ${point}
      ${f === 'hwpx' && quote?.owned !== true ? `<a class="dl63-small dl63-card-pay" data-dl63-buy href="${h(checkoutHref(item, f))}" target="_blank" rel="noopener">한글 카드로 결제 · ${won(v.price)}<span aria-hidden="true">↗</span><span class="sr-only"> 새 탭</span></a>` : ''}
      <div class="dl63-sub">
        ${item.sample ? `<a href="${h(item.sample)}" download>미리보기 ${item.previewPages || ''}쪽 PDF<span aria-hidden="true">↓</span></a>` : ''}
        ${materialSku() === item.sku ? '' : `<a href="#material/${encodeURIComponent(item.sku)}">지면 보기</a>`}
        ${outLink(confirmHref(item, f).replace(ORIGIN, ''), '받을 내용 · 환불 자세히')}
      </div>
      ${signedIn()?'':'<p class="dl63-small">결제는 로그인 후 진행됩니다.</p>'}
    </div>`;
  }


  function shopBody() {
    if (state.load === 'error') return `<div class="dl63-state" role="status"><p>판매 목록을 불러오지 못했습니다.</p><button type="button" class="dl63-quiet" data-dl63-retry>다시 불러오기</button>${outLink('/naesin/', '내신 자료 구매 쪽에서 보기', 'dl63-quiet')}</div>`;
    if (state.load !== 'ready') return `<div class="dl63-state dl63-loading" role="status"><span></span><span></span><span></span><p>판매 목록을 불러오는 중</p></div>`;
    if (!state.items.length) return `<div class="dl63-state" role="status"><p>지금 판매 중인 자료가 없습니다.</p>${outLink('/naesin/', '내신 자료 구매 쪽 보기', 'dl63-quiet')}</div>`;
    const subjects = [...new Map(state.items.map(item => [item.subject, item.grade])).entries()];
    const chips = [['', '전체', state.items.length], ...subjects.map(([s, g]) => [s, `${g} ${s}`, state.items.filter(item => item.subject === s).length])]
      .map(([v, label, n]) => `<button type="button" class="dl63-chip" data-dl63-subject="${h(v)}" aria-pressed="${state.subject === v}">${h(label)} <b>${n}</b></button>`).join('');
    const rows = visible();
    const head = `<div class="dl63-list-head" aria-hidden="true"><span>자료</span><span class="dl63-cells"><span class="dl63-cell">PDF</span>${state.hasHwp ? '<span class="dl63-cell">한글</span>' : ''}</span></div>`;
    return `<div class="dl63-chips" role="group" aria-label="과목으로 좁히기">${chips}</div>
      <div class="dl63-grid">
        <div class="dl63-list-wrap"><p role="status">판매 자료 ${rows.length}건</p>${head}<ol class="dl63-list" aria-label="판매 자료 ${rows.length}건">${rows.map(row).join('')}</ol></div>
        <aside class="dl63-desk" aria-label="고른 자료" aria-live="polite" data-dl63-receipt>${rows.length?receipt(current()):'<p>검색어를 줄이거나 과목을 바꿔 보세요.</p>'}</aside>
      </div>`;
  }

  function shop() {
    return `<section class="dl63 dl63-shop" aria-labelledby="dl63-shop-title">
      <header class="dl63-head">
        <div><span class="dl63-kicker">판매 자료</span><h2 id="dl63-shop-title">시험 범위 자료 고르기</h2><p>단원 문제집을 고르고, 받을 꼴과 값을 확인한 뒤 구매합니다.</p></div>
        <p class="dl63-book-note">${BOOK_NOTE}</p>
      </header>
      <label>판매 자료 검색 <input type="search" data-sale-search value="${h(state.search)}" placeholder="과목·단원·자료명"></label>
      <div class="dl63-shop-body" data-dl63-shop>${shopBody()}</div>
    </section>`;
  }

  /* ---------- 학교 기출 올리기 ---------- */
  function select(name, label, values) {
    return `<label><span>${label}</span><select name="${name}" required><option value="">고르기</option>${Object.entries(values).map(([v, t]) => `<option value="${v}">${t}</option>`).join('')}</select></label>`;
  }
  function uploadForm() {
    const year = new Date().getFullYear();
    return `<form id="dl63-upload" class="dl63-form" novalidate ${state.uploadOpen ? '' : 'hidden'} aria-label="학교 기출 올리기">
      <div class="dl63-form-grid">
        <label class="dl63-wide"><span>학교</span><input name="school" type="text" maxlength="40" placeholder="예: ○○고등학교" required autocomplete="off"></label>
        <label><span>학년도</span><input name="year" type="number" inputmode="numeric" min="2000" max="${year}" value="${year}" required></label>
        ${select('grade', '학년', GRADES)}
        ${select('semester', '학기', SEMESTERS)}
        ${select('period', '시험', PERIODS)}
        <label class="dl63-wide"><span>과목</span><select name="subject" required><option value="">고르기</option>${SUBJECTS.map(s => `<option value="${s}">${s}</option>`).join('')}</select></label>
        <label class="dl63-wide"><span>포인트 받을 회원 휴대폰 번호</span><input name="account" type="tel" inputmode="tel" maxlength="20" placeholder="가입한 휴대폰 번호" required autocomplete="off"><small>포인트를 줄 회원을 찾는 데에만 씁니다.</small></label>
        <label class="dl63-wide dl63-file"><span>시험지 파일 <small>PDF · JPG · PNG · WebP</small></span><input name="files" type="file" accept=".pdf,.jpg,.jpeg,.png,.webp" multiple required></label>
      </div>
      <label class="dl63-check"><input type="checkbox" name="agree" value="masked" required><span>학생 이름 · 학번 · 필기 · 점수를 가렸습니다.</span></label>
      <label class="dl63-check"><input type="checkbox" name="agree" value="own" required><span>직접 받은 시험지입니다.</span></label>
      <p class="dl63-form-help">보내기를 누르면 메일 앱이 열립니다. 고른 시험지 파일을 메일에 첨부해 보내 주세요.</p>
      <div class="dl63-form-actions"><button type="submit" class="dl63-brass">메일로 보내기</button><button type="button" class="dl63-ghost" data-dl63-upload-open>닫기</button></div>
      <div class="dl63-up-msg" role="status" data-dl63-up-msg>${state.uploadMsg || ''}</div>
    </form>`;
  }
  function upload() {
    return `<section class="dl63 dl63-upload" id="dl63-upload-band" aria-labelledby="dl63-up-title">
      <div class="dl63-up-top">
        <div class="dl63-up-copy">
          <span class="dl63-kicker">학교별 기출</span>
          <h2 id="dl63-up-title">학교 기출 올리기</h2>
          <p class="dl63-up-lead">처음 올라온 학교 시험지는 <b>한 회차당 ${UPLOAD_POINTS}포인트</b>를 드립니다.</p>
        </div>
        <div class="dl63-seal" aria-hidden="true"><b>${UPLOAD_POINTS}</b><span>포인트</span><small>한 회차당</small></div>
      </div>
      <ol class="dl63-rules" aria-label="지급 조건">
        <li><b>한 회차</b>한 학교의 한 학년도 · 학년 · 학기 · 시험(중간 · 기말) · 과목 시험지 한 벌입니다.</li>
        <li><b>처음만</b>같은 회차가 먼저 올라와 있으면 지급되지 않습니다.</li>
        <li><b>읽을 수 있게</b>흐림 · 잘림 · 빠진 쪽으로 글자와 수식을 읽을 수 없으면 지급되지 않습니다.</li>
        <li><b>검수 뒤 지급</b>포인트는 검수를 마친 뒤 지급합니다. 같은 시험지가 먼저 들어왔으면 지급하지 않습니다. 보상 포인트는 만료되지 않습니다.</li>
        <li><b>가리고</b>학생 이름 · 학번 · 필기 · 점수는 가리고 올려 주세요.</li>
        <li><b>저작권</b>직접 받은 시험지만 올려 주세요. 시험지의 저작권은 학교와 출제 교사에게 있습니다.</li>
      </ol>
      <div class="dl63-up-actions"><button type="button" class="dl63-brass" data-dl63-upload-open aria-expanded="${state.uploadOpen}" aria-controls="dl63-upload">시험지 올리기</button><span>학교 · 학년 · 학기 · 시험 · 과목과 파일을 적어 보냅니다.</span></div>
      ${uploadForm()}
    </section>`;
  }

  function readUpload(form) {
    const d = new FormData(form);
    const v = name => String(d.get(name) || '').normalize('NFC').trim().replace(/\s+/g, ' ');
    const data = { school: v('school'), year: v('year'), grade: v('grade'), semester: v('semester'), period: v('period'), subject: v('subject'), account: v('account') };
    const files = Array.from(form.elements.files.files || []);
    const agree = d.getAll('agree');
    if (!data.school || !data.account || !/^\d{4}$/.test(data.year) || !GRADES[data.grade] || !SEMESTERS[data.semester] || !PERIODS[data.period] || !SUBJECTS.includes(data.subject)) return { error: '학교 · 학년도 · 학년 · 학기 · 시험 · 과목 · 계정을 모두 적어 주세요.', focus: [...form.querySelectorAll('[required]')].find(el => el.type !== 'file' && el.type !== 'checkbox' && !el.value.trim()) };
    if (!files.length) return { error: '시험지 파일을 하나 이상 골라 주세요.', focus: form.elements.files };
    if (!files.every(file => file.size > 0 && FILE_TYPES.includes(file.name.split('.').pop().toLowerCase()))) return { error: '내용이 있는 PDF · JPG · PNG · WebP 파일만 고를 수 있습니다.', focus: form.elements.files };
    if (!agree.includes('masked') || !agree.includes('own')) return { error: '아래 두 칸을 확인해 주세요 — 개인 정보를 가렸는지, 직접 받은 시험지인지.', focus: form.querySelector('[name="agree"]:not(:checked)') };
    return { data, files };
  }
  function mailHref({ data, files }) {
    const exam = `${data.school} ${data.year}학년도 ${GRADES[data.grade]} ${SEMESTERS[data.semester]} ${PERIODS[data.period]} ${data.subject}`;
    const body = ['[학교 기출 올리기]', `학교: ${data.school}`, `학년도: ${data.year}`, `학년: ${GRADES[data.grade]}`, `학기: ${SEMESTERS[data.semester]}`,
      `시험: ${PERIODS[data.period]}`, `과목: ${data.subject}`, `포인트 받을 회원 휴대폰 번호: ${data.account}`,
      `첨부할 파일(${files.length}개): ${files.map(file => file.name).join(', ')}`,
      '확인: 학생 이름 · 학번 · 필기 · 점수를 가렸습니다 / 직접 받은 시험지입니다', '', '※ 이 메일에 시험지 파일을 첨부해 보내 주세요.'].join('\n');
    return `mailto:${MAIL}?subject=${encodeURIComponent('학교 기출 올리기 · ' + exam)}&body=${encodeURIComponent(body)}`;
  }
  function submitUpload(form) {
    const box = form.querySelector('[data-dl63-up-msg]');
    const r = readUpload(form);
    if (r.error) { state.uploadMsg = `<p class="dl63-err">${h(r.error)}</p>`; box.innerHTML = state.uploadMsg; r.focus?.focus(); return; }
    const href = mailHref(r);
    const link = document.createElement('a');
    link.href = href;
    link.click();
    const names = r.files.map(file => h(file.name)).join(', ');
    state.uploadMsg = `<p class="dl63-ok"><strong>메일 앱을 열었습니다.</strong> 고른 파일 ${r.files.length}개(${names})를 메일에 첨부해 보내 주세요.</p><p>메일 앱이 열리지 않으면 <a href="${h(href)}">여기를 눌러 다시 열거나</a> ${MAIL} 로 직접 보내 주세요.</p>`;
    box.innerHTML = state.uploadMsg;
  }

  /* ---------- 수능 기출 해설 ---------- */
  function exams() {
    return `<section class="dl63 dl63-exams" aria-labelledby="dl63-exams-title">
      <header class="dl63-head"><div><span class="dl63-kicker">수능 · 모의평가</span><h2 id="dl63-exams-title">수능 기출 해설</h2><p>회차마다 지금 열 수 있는 문제지 · 해설 · 분석 · 채점을 모았습니다.</p></div></header>
      <ol class="dl63-exam-list">${EXAMS.map(e => `<li class="dl63-exam">
        <div class="dl63-exam-id"><span class="dl63-exam-mark">${h(e.mark)}</span><span class="dl63-exam-year">${h(e.year)}</span></div>
        <div class="dl63-exam-text"><h3>${h(e.title)}</h3><p>${h(e.when)}</p></div>
        <div class="dl63-exam-links">${e.links.map(([href, label, lead, note]) => outLink(href, `${h(label)}${note ? `<small>${h(note)}</small>` : ''}`, lead ? 'dl63-exam-lead' : '')).join('')}</div>
      </li>`).join('')}</ol>
      <p class="dl63-source">출처: 한국교육과정평가원 · 해설과 분석: 델타스킬. 문제지 PDF는 EBSi 공개 파일로 엽니다.</p>
    </section>`;
  }

  /* ---------- 자료실 쪽에 끼우기 ---------- */
  function jump() {
    return `<button type="button" class="dl63-jump" data-dl63-jump>학교 기출 올리기 <b>+${UPLOAD_POINTS}P</b></button>`;
  }
  const beforeLibrary = libraryPage;
  libraryPage = function () {
    const template = document.createElement('template');
    template.innerHTML = beforeLibrary.apply(this, arguments);
    const root = template.content.querySelector('.resource-surface');
    const finder = root && root.querySelector('.lf19-finder');
    const archive = root && root.querySelector('.nv20-exam-materials');
    if (!finder && !archive) return template.innerHTML;
    root.classList.add('dl63-page');
    template.content.querySelector('.nv20-collections')?.insertAdjacentHTML('beforeend', jump());
    if (finder) {
      load();
      const wrap = document.createElement('div');
      wrap.className = 'dl63-stack';
      wrap.innerHTML = shop() + upload();
      finder.replaceWith(wrap);
    } else {
      archive.classList.add('dl63-archive');
      archive.innerHTML = exams();
    }
    return template.innerHTML;
  };

  /* ---------- 상세 쪽(#material/<SKU>) — 11-25 44 ----------
     옛 상세 쪽은 window.DSCatalog(공개 미리보기 4책)만 읽어, 판매 목록(/naesin/catalog.json)에만 있는 책은
     「자료를 찾을 수 없습니다.」로 막혔다. DSCatalog 에 없는 책은 판매 목록 값으로 상세 쪽을 그린다(값 · 구매 고리는 목록 받침 상자와 같은 receipt()). */
  function materialSku() {
    const page = location.hash.slice(1);
    if (!page.startsWith('material/')) return '';
    try { return decodeURIComponent(page.slice('material/'.length)); } catch { return ''; }
  }
  function saleDetail(item) {
    const others = state.items.filter(v => v.sku !== item.sku && v.subject === item.subject).slice(0, 3);
    return `<section class="work-surface material-detail dl63-detail" data-dl63-detail="${h(item.sku)}">
      <nav class="page-breadcrumb" aria-label="현재 위치"><a href="#library">내신 자료</a><span>/</span><span>${h(item.subject)}</span></nav>
      <div class="dl63-grid dl63-detail-grid">
        <div class="dl63-detail-main">
          <span class="page-kicker">${h(item.grade)} · ${h(item.subject)}</span><h1 style="margin:4px 0 12px">${h(item.no)} ${h(item.unit)}</h1>
          ${item.thumb ? `<img class="dl63-detail-thumb" src="${h(item.thumb)}" width="804" height="1137" style="display:block;width:100%;max-width:520px;height:auto;margin-bottom:16px;border-radius:6px;box-shadow:0 2px 10px #0000001f" alt="${h(item.unit)} 미리보기 1쪽">` : ''}
          <p class="dl63-book-note">${BOOK_NOTE}</p>
          <div class="detail-owned-link"><span>이미 구매하셨나요?</span><a href="#account">내 자료에서 찾기</a></div>
        </div>
        <aside class="dl63-desk" aria-label="고른 자료" aria-live="polite" data-dl63-receipt>${receipt(item)}</aside>
      </div>
      ${others.length ? `<section class="detail-related"><div class="between"><h2>함께 볼 자료</h2><a href="#library">전체 자료</a></div><div>${others.map(v => `<a href="#material/${encodeURIComponent(v.sku)}"><span>${h(v.subject)}</span><strong>${h(v.no)} ${h(v.name)}</strong><small>${v.count}문항</small></a>`).join('')}</div></section>` : ''}
    </section>`;
  }
  if (typeof materialPage === 'function') {
    const beforeMaterial = materialPage;
    materialPage = function () {
      const sku = materialSku();
      const inPreview = (Array.isArray(window.DSCatalog) ? window.DSCatalog : []).some(d => d.sku === sku);
      if (!sku || inPreview || !/^NS-[A-Z0-9]+-\d+$/.test(sku)) return beforeMaterial.apply(this, arguments);
      if (state.load === 'error') return `<section class="work-surface material-detail dl63-detail" data-dl63-detail-wait="${h(sku)}">${shopBody()}</section>`;
      if (state.load !== 'ready') {
        load();
        return `<section class="work-surface material-detail dl63-detail" data-dl63-detail-wait="${h(sku)}"><div class="dl63-state dl63-loading" role="status"><span></span><span></span><span></span><p>자료를 불러오는 중</p></div></section>`;
      }
      const item = state.items.find(v => v.sku === sku);
      if (!item) return beforeMaterial.apply(this, arguments);
      state.sku = item.sku;
      if (!item.formats[state.fmt]) state.fmt = Object.keys(item.formats)[0];
      return saleDetail(item);
    };
  }
  /* 판매 목록이 다 온 뒤 기다리던 상세 쪽을 다시 그린다 */
  function repaintDetailWait() {
    const wait = main.querySelector('[data-dl63-detail-wait]');
    if (wait && wait.dataset.dl63DetailWait === materialSku()) main.innerHTML = materialPage();
  }

  function repaintShop() {
    repaintDetailWait();
    if (main.querySelector('[data-dl63-detail]')) repaintPick();
    const box = main.querySelector('[data-dl63-shop]');
    if (box) box.innerHTML = shopBody();
  }
  window.addEventListener('ds-point-pdf-update', repaintShop);
  function repaintPick() {
    for (const b of main.querySelectorAll('[data-dl63-pick]')) b.setAttribute('aria-pressed', String(b.dataset.dl63Pick === state.sku));
    const r = main.querySelector('[data-dl63-receipt]');
    if (r) r.innerHTML = receipt(current());
  }
  function toBand() {
    const band = main.querySelector('#dl63-upload-band');
    if (!band) return false;
    band.scrollIntoView({ block: 'start', behavior: 'smooth' });
    band.querySelector('[data-dl63-upload-open]')?.focus({ preventScroll: true });
    return true;
  }

  document.addEventListener('click', event => {
    const t = event.target;
    if (!main.contains(t)) return;
    const pick = t.closest('[data-dl63-pick]');
    if (pick) { state.sku = pick.dataset.dl63Pick; repaintPick(); if (innerWidth <= 900) main.querySelector('[data-dl63-receipt]')?.scrollIntoView({ block: 'nearest', behavior: 'smooth' }); return; }
    const fmt = t.closest('[data-dl63-fmt]');
    if (fmt) { state.fmt = fmt.dataset.dl63Fmt; repaintPick(); main.querySelector(`[data-dl63-fmt="${state.fmt}"]`)?.focus(); return; }
    const chip = t.closest('[data-dl63-subject]');
    if (chip) {
      state.subject = chip.dataset.dl63Subject;
      if (!visible().some(item => item.sku === state.sku)) state.sku = visible()[0]?.sku || '';
      repaintShop();
      main.querySelector(`[data-dl63-subject="${CSS.escape(state.subject)}"]`)?.focus();
      return;
    }
    if (t.closest('[data-dl63-retry]')) { state.load = 'idle'; load(); repaintShop(); return; }
    const opener = t.closest('[data-dl63-upload-open]');
    if (opener) {
      state.uploadOpen = !state.uploadOpen;
      const form = main.querySelector('#dl63-upload');
      if (form) form.hidden = !state.uploadOpen;
      for (const b of main.querySelectorAll('.dl63-up-actions [data-dl63-upload-open]')) b.setAttribute('aria-expanded', String(state.uploadOpen));
      if (state.uploadOpen) form?.querySelector('[name="school"]')?.focus();
      else main.querySelector('.dl63-up-actions [data-dl63-upload-open]')?.focus();
      return;
    }
    if (t.closest('[data-dl63-jump]')) {
      if (toBand()) return;
      main.querySelector('[data-library-view="school"]')?.click();
      requestAnimationFrame(() => requestAnimationFrame(toBand));
      return;
    }
    const point = t.closest('[data-dl63-point]');
    if (point && POINT_PDF && typeof window.DSPointService?.redeemPdf === 'function') window.DSPointService.redeemPdf(point.dataset.dl63Point);
  });
  main.addEventListener('submit', event => {
    if (event.target.id !== 'dl63-upload') return;
    event.preventDefault();
    submitUpload(event.target);
  });
  main.addEventListener('input', event => {
    if (event.target.matches('[data-sale-search]')) {
      state.search=event.target.value;
      const rows=visible();
      if(!rows.some(row=>row.sku===state.sku))state.sku=rows[0]?.sku||'';
      repaintShop();
    }
    if (event.target.form?.id === 'dl63-upload' && state.uploadMsg) { state.uploadMsg = null; const box = main.querySelector('[data-dl63-up-msg]'); if (box) box.innerHTML = ''; }
  });

  window.DSLibraryDeskV63 = Object.freeze({ buildCatalog: build, checkoutHref, reload() { state.load = 'idle'; load(); } });
  if (location.hash === '#library') main.innerHTML = libraryPage();
  /* 처음 들어온 주소가 판매 목록에만 있는 책의 상세 쪽이면 다시 그린다(첫 그리기는 이 파일이 실리기 전 옛 상세 쪽으로 됐다) */
  else if (materialSku() && main.querySelector('.simple-empty')) main.innerHTML = materialPage();
})();
