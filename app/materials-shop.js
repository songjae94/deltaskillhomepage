/* The teacher store shares its sale dates, file checks and SKU prices with the library. */
(() => {
  'use strict';
  const library = window.DSLibraryDeskV63;
  const builder = window.DSTeacherBuilderV36;
  if (!library || !builder) return;
  const archive = '델타스킬 예상문제집';
  const categories = ['문제집 변형문항', '빈출문항', '학교별기출변형', '강남3구 주요문항'];
  const escape = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;'}[c]));
  const money = value => value.toLocaleString('ko-KR');
  const normalize = value => value.normalize('NFKC').toLowerCase().replace(/\s/g, '');
  const storageKey = 'ds-materials-shop-cart-v1';
  let cart = [];
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey));
    if (Array.isArray(saved)) cart = [...new Set(saved.filter(x => typeof x === 'string'))];
  } catch {}
  let scope=null;
  let products = [], selected = '', status = 'idle', audience = 'teacher';
  // Cards on screen, and the file format each card currently has chosen.
  const cardIndex = new Map(), chosen = new Map();
  function save() {
    try { localStorage.setItem(storageKey, JSON.stringify(cart)); } catch {}
  }
  async function load() {
    if (status !== 'idle') return;
    status = 'loading';
    try {
      const [catalog, config, origins] = await Promise.all(['/naesin/catalog.json','/pay-config.json','/app/public-data/sale-origins.json'].map(async url => {
        const response = await fetch(url, {cache:'no-store'});
        if (!response.ok) throw Error();
        return response.json();
      }));
      products = library.buildCatalog(catalog, config).filter(i => i.formats.pdf || i.formats.hwpx).map(i => ({...i, source: origins[i.sku]?.book || archive, sourceId: origins[i.sku]?.bookId}));
      const restored = Object.entries(origins).filter(([, item]) => item.shelf).map(([sku, item]) => ({
        ...item.shelf, sku, source: item.book, sourceId: item.bookId, restored: true,
        name: [item.shelf.subject, item.shelf.unit, item.shelf.edition].join(' · '), formats: {}
      }));
      products.push(...restored);
      status = 'ready';
    } catch { status = 'error'; }
    refresh();
  }
  const title = p => p.name.replace(/\s*·\s*\d+\s+/, ' · ');
  const bookLabel = value => String(value ?? '').replace(/\s*\((?:19|20)\d{2}년?(?:판|용)?\)/g, '').trim();
  // The in-house practice series uses a catalog ID for filtering, without a verified source book.
  const isLinked = p => Boolean(p?.sourceId) && !p.sourceId.startsWith('DS-PRACTICE-');
  function displayBook(source) {
    const name = bookLabel(source);
    // 11-25 71 H30: 선생님 쪽도 학생 쪽과 같은 제목(EBS 뺌 · 연계변형) — 제목은 이 한 자리에서.
    const plain = name.replace(/^EBS\s+/i, '');
    const row = products.find(p => p.source === source && p.sourceId);
    if (!row) return plain;
    const subject = row.subject.replace(/\s+기초편$/, '').trim();
    const series = plain.endsWith(' ' + subject) ? plain.slice(0, -subject.length).trim() : plain;
    return series + (isLinked(row) ? ' 연계변형 · ' : ' · ') + subject;
  }
  function pickerLabel() {
    if (scope?.bookId && audience === 'student') {
      const row = products.find(p => p.sourceId === scope.bookId);
      if (row) return displayBook(row.source) + (scope.unit ? ' · ' + scope.unit : '');
    }
    return displayBook(scope?.label || selected || (audience === 'student' ? '공부하는 교재 찾기' : '수업 교재 찾기'));
  }
  const grouped = () => [...new Set(products.map(p => p.source))].sort((a,b) => a.localeCompare(b,'ko'));
  const key = (p, fmt) => p.sku + '.' + fmt;
  const publicPoints = Object.freeze({'NS-CM2-06':4000,'NS-CM2-07':5000,'NS-CM2B-06':2200,'NS-MI1B-05':3100});
  // 11-25 61: 한글(HWPX)도 포인트로 받는다 — 값은 서버 포인트 목록(quote) 먼저 · 없으면 판매 값(원 = P).
  const quote = (p, fmt = 'pdf') => window.DSPointPdf?.product(key(p,fmt));
  // H28-19 · H28-35(11-26 104): 회원 포인트 목록을 읽었는데 그 SKU 가 없으면 P 값 · 포인트 단추를 지어내지 않는다 — 한글은 카드 길만 남김.
  // 목록을 아직 못 읽은 손님 · 읽는 중에는 앞 잣대(판매 값 = P) 그대로(57 1125).
  const unlisted = (p, fmt) => window.DSPointPdf?.listed?.(key(p,fmt)) === false;
  const price = (p, fmt) => unlisted(p,fmt) ? null : fmt === 'pdf' ? (quote(p)?.points ?? publicPoints[p.sku] ?? p.formats.pdf?.price ?? null) : (quote(p,'hwpx')?.points ?? p.formats.hwpx?.price ?? null);
  const pointable = (p, fmt) => Number.isSafeInteger(price(p,fmt)) && price(p,fmt) > 0;
  const cashReady = p => Number.isSafeInteger(p.formats.hwpx?.price) && p.formats.hwpx.price > 0 && p.formats.hwpx.files.length > 0;
  const enabled = (p, fmt) => !p.restored && (fmt === 'pdf' ? pointable(p,fmt) : cashReady(p));
  const coverURL = sku => 'public-data/covers/' + encodeURIComponent(sku) + '.webp?v=cover-r2-1125';
  // One colour per shelf, taken from that series' new covers (tone = cover colour · deep = text-safe on white).
  const shelfTones = Object.freeze({
    'OL-type-CM2':['#8ee0d7','#20776d'], 'OL-advanced-CM2':['#691d2b','#691d2b'], 'DS-PRACTICE-CM2':['#136561','#136561'], 'DS-PRACTICE-CM2-PASS':['#611422','#611422'],
    'OL-type-CAL1':['#c0eb7b','#4e7411'], 'OL-advanced-CAL1':['#13286e','#13286e'], 'DS-PRACTICE-MI1':['#4a5e14','#4a5e14'],
    'DS-PRACTICE-PNC':['#9bd0f1','#1770a8'], 'SSEN-GEO':['#7868f0','#5a4bd0']
  });
  const toneStyle = id => { const t = shelfTones[id]; return t ? ` style="--ms-tone:${t[0]};--ms-deep:${t[1]}"` : ''; };
  const cost = (p,fmt) => pointable(p,fmt) ? money(price(p,fmt)) + ' P' : fmt === 'hwpx' && cashReady(p) ? '카드 ' + money(p.formats.hwpx.price) + '원' : '';
  const picked = () => products.flatMap(p => ['pdf','hwpx'].filter(fmt => cart.includes(key(p,fmt)) && enabled(p,fmt)).map(fmt => ({p,fmt})));
  function options(query='') {
    const list = grouped().filter(name => [name,displayBook(name)].some(label => normalize(label).includes(normalize(query))));
    return list.map(name => `<button type="button" data-ms-book="${escape(name)}">${escape(displayBook(name))}<small>${cardsOf(products.filter(p=>p.source===name)).length}권</small></button>`).join('') || '<p role="status">검색 결과가 없습니다.</p>';
  }
  function picker() {
    return `<details class="ms-picker"><summary><span>${escape(pickerLabel())}</span><i aria-hidden="true"></i></summary><div class="ms-popup dl63-list-wrap"><input type="search" aria-label="교재 검색" placeholder="교재명으로 검색" data-ms-search><div data-ms-options>${options()}</div></div></details>`;
  }
  const editionOf = p => p.edition || (p.name.includes('기초편') ? '기초편' : '1권');
  const baseEdition = p => editionOf(p).replace(/\s*·\s*한글\s*별도판/, '').trim();
  // One book, one card: a 한글 file catalogued apart joins the PDF card of the same book, unit, edition and item count.
  // Each format keeps its own SKU, price and cart key; only what is for sale is shown.
  function cardsOf(list) {
    const pool = list.filter(p => !p.restored), twins = new Map(), joined = new Set();
    for (const p of pool) {
      if (!p.formats.pdf || p.formats.hwpx) continue;
      const twin = pool.find(q => q !== p && !joined.has(q) && !q.formats.pdf && q.formats.hwpx && q.sourceId === p.sourceId && q.no === p.no && q.count === p.count && baseEdition(q) === baseEdition(p));
      if (twin) { twins.set(p, twin); joined.add(twin); }
    }
    return pool.filter(p => !joined.has(p)).map(p => {
      const twin = twins.get(p);
      return {id: p.sku, main: p, parts: twin ? [{p, fmts: ['pdf']}, {p: twin, fmts: ['hwpx']}] : [{p, fmts: ['pdf', 'hwpx']}], note: twin ? '한글은 PDF와 다른 판입니다' : p.editionNote || ''};
    }).filter(card => offersOf(card).length);
  }
  const offersOf = card => card.parts.flatMap(({p, fmts}) => fmts.filter(fmt => enabled(p, fmt)).map(fmt => ({p, fmt})));
  function formats(card) {
    const offers = offersOf(card);
    if (!offers.length) return '';
    // H28-60(관문 88): 담은 뒤에도 고른 형식 그대로 — 안 담긴 형식으로 저절로 옮기지 않는다(다른 형식은 손수 골라야 담김).
    const pick = offers.find(o => key(o.p, o.fmt) === chosen.get(card.id)) || offers.find(o => cart.includes(key(o.p, o.fmt))) || offers[0];
    const pickKey = key(pick.p, pick.fmt), label = escape(title(card.main)), added = cart.includes(pickKey);
    const rows = offers.map(({p, fmt}) => {
      const id = key(p, fmt);
      return `<button type="button" class="ms-pick" aria-pressed="${id === pickKey}" aria-label="${formatLabel(fmt)} ${cost(p, fmt)}${cart.includes(id) ? ' 담김' : ''}" data-ms-pick="${escape(id)}"><span>${formatLabel(fmt)}</span><b>${cost(p, fmt)}</b>${cart.includes(id) ? '<small>담김</small>' : ''}</button>`;
    }).join('');
    const action = added ? '담김' : '담기';
    const buyNow = `<button type="button" class="ms-buy-now" aria-label="${label} ${formatLabel(pick.fmt)} ${cost(pick.p, pick.fmt)} 바로 구매" data-ms-buy="${escape(pickKey)}">바로 구매</button>`;
    return `<div class="ms-choice" role="group" aria-label="${label} 파일 형식">${rows}</div><div class="ms-acts"><button type="button" class="ms-add" aria-label="${label} ${formatLabel(pick.fmt)} ${cost(pick.p, pick.fmt)} ${action}" data-ms-add="${escape(pickKey)}" ${added ? 'disabled' : ''}>${action}</button>${buyNow}</div><p class="ms-note">${escape(card.note)}</p>`;
  }
  function coverTile(card) {
    const p = card.main, label = escape(title(p));
    cardIndex.set(card.id, card);
    const art = `<img src="${coverURL(p.sku)}" width="720" height="1018" loading="lazy" decoding="async" alt="${label} 표지">`;
    const cover = p.sample
      ? `<a class="ms-book-cover" href="${escape(p.sample)}" target="_blank" rel="noopener" aria-label="${label} 지면 미리보기, 새 창">${art}<span class="ms-look">미리보기 ↗</span></a>`
      : `<div class="ms-book-cover">${art}</div>`;
    const meta = escape(editionOf(p)) + (p.count ? ` · ${p.count}문항` : '');
    return `<article class="ms-volume" data-ms-card="${escape(card.id)}" data-sku="${escape(p.sku)}" aria-label="${label}"><div class="ms-stage">${cover}</div><div class="ms-book-info"><small>${meta}</small><h3>${escape(p.unit||title(p))}</h3>${audience==='student'?'':`<span>${escape(displayBook(p.source))}</span>`}</div><div class="ms-formats">${formats(card)}</div></article>`;
  }
  function items() {
    const list = scope ? products.filter(p => scope.bookId
      ? p.sourceId===scope.bookId && (!scope.unitId || p.no===scope.unitId)
      : p.subject===scope.subject && p.unit===scope.unit)
      : selected ? products.filter(p => p.source === selected) : products;
    const heading = scope ? bookLabel(scope.label) : selected ? '단원별 교재' : audience==='student' ? '문제집 변형문항' : '판매 교재';
    const reset = scope || selected ? '<button type="button" class="ms-clear" data-ms-clear>전체 교재 보기</button>' : '';
    const shelves = new Map();
    for (const book of list) {
      if (!shelves.has(book.source)) shelves.set(book.source, []);
      shelves.get(book.source).push(book);
    }
    cardIndex.clear();
    const shelfCards = [...shelves].map(([source, books]) => [source, cardsOf(books).map(card => card.main)]).filter(([, books]) => books.length);
    const shown = shelfCards.reduce((sum, [, books]) => sum + books.length, 0);
    const rows = shelfCards.sort(([, a], [, b]) =>
      a[0].subject.localeCompare(b[0].subject, 'ko') ||
      Number(a[0].sourceId?.includes('-advanced-') || false) - Number(b[0].sourceId?.includes('-advanced-') || false)
    ).map(([source, mains]) => {
      const cards = cardsOf(shelves.get(source)).sort((a, b) => a.main.no.localeCompare(b.main.no) || editionOf(a.main).localeCompare(editionOf(b.main), 'ko'));
      const name = escape(displayBook(source));
      return `<section class="ms-shelf-group" data-ms-series="${escape(mains[0].sourceId || '')}"${toneStyle(mains[0].sourceId)} aria-label="${name}"><header><h3>${name}</h3>${audience==='student'?'':`<span>${cards.length}권</span>`}</header><div class="ms-bookshelf">${cards.map(coverTile).join('')}</div></section>`;
    }).join('');
    if (audience === 'student') {
      const empty = shown ? '' : '<p role="status">이 범위에서 받을 수 있는 자료는 아직 없습니다.</p>';
      return `<section class="ms-items" aria-label="단원별 교재">${reset ? '<div class="ms-results">' + reset + '</div>' : ''}${empty}${rows}</section>`;
    }
    return `<section class="ms-items" aria-label="${escape(selected ? displayBook(selected) : '전체')} 판매 교재"><div class="ms-results dl63-head"><h2>${escape(heading)}</h2><span>${shown}권</span>${reset}</div>${shown ? '<p class="ms-delivery">구매한 교재는 배송 없이 파일로 내려받습니다.</p>' : ''}${scope && !shown ? '<p role="status">이 범위에서 구매할 수 있는 자료는 아직 없습니다.</p>' : ''}${rows}</section>`;
  }

  const formatLabel = fmt => fmt === 'pdf' ? 'PDF' : '한글';
  function totals(entries) {
    let sum = 0, won = 0;
    for (const {p, fmt} of entries) {
      if (pointable(p, fmt)) sum += price(p, fmt);
      else if (fmt === 'hwpx' && cashReady(p)) won += p.formats.hwpx.price;
    }
    return `<div class="ms-total">${sum ? `<div>합계 <b>${money(sum)} P</b></div>` : ''}${won ? `<div>카드 결제 <b>${money(won)}원</b></div>` : ''}</div>`;
  }
  function cartContents() {
    const entries = picked();
    const lines = entries.map(({p,fmt}) => `<div class="ms-line"><span><strong>${escape(title(p))}</strong><small>${formatLabel(fmt)} · ${cost(p,fmt)}</small></span><button type="button" aria-label="${escape(title(p))} ${formatLabel(fmt)} 빼기" data-ms-remove="${escape(key(p,fmt))}">빼기</button></div>`).join('');
    return `<header><h2 id="ms-cart-title">장바구니 <small>${entries.length}</small></h2><form method="dialog"><button type="submit">닫기</button></form></header>${entries.length ? lines + totals(entries) + '<button type="button" class="ms-review-open" data-ms-review>주문 내용 확인</button>' : '<p>장바구니가 비어 있습니다.</p>'}`;
  }
  function openCart(panel) {
    const dialog = document.createElement('dialog');
    dialog.className = 'ms-order ms-cart-sheet dl63-receipt';
    dialog.setAttribute('aria-labelledby','ms-cart-title');
    dialog.innerHTML = cartContents();
    dialog.addEventListener('close', () => {
      dialog.remove();
      if (!panel.querySelector('dialog[open]')) panel.querySelector('[data-ms-cart]')?.focus({preventScroll:true});
    }, {once:true});
    panel.append(dialog);
    dialog.showModal();
  }
  function reviewOrder(panel, only) {
    const entries = only || picked();
    if (!entries.length) return;
    const dialog = document.createElement('dialog');
    dialog.className = 'ms-order dl63-receipt';
    dialog.setAttribute('aria-labelledby','ms-order-title');
    const lines = entries.map(({p,fmt}) => {
      const action = !pointable(p,fmt) ? '<small>카드 결제로 받기</small>' : `<a data-ms-point-purchase ${audience==='student'?'data-ms-point-receive="'+escape(key(p,fmt))+'"':''} href="/app/?pointPdf=${encodeURIComponent(key(p,fmt))}#library">${quote(p,fmt)?.owned ? '보유 자료 다시 받기' : '포인트 구매 확인'}</a>`;
      return `<li><small>${escape(displayBook(p.source))}</small><strong>${escape(title(p))}</strong><div><span>${formatLabel(fmt)} · ${cost(p,fmt)}</span>${action}</div></li>`;
    }).join('');
    /* 11-25 61: PDF · 한글 모두 포인트로 받는다(2026-12-31 까지 무료 기간). 큰 단추 = 포인트 받기.
       한글 카드 결제(/checkout · 3권까지)는 닫지 않고 둘째 길로 남긴다. */
    // H28-20(관문 88): 포인트로 이미 받은 한글은 카드 결제에 넣지 않는다(이중 지불 막음) — 다시 받기만.
    const ownedNow = (p, fmt) => quote(p, fmt)?.owned === true;
    const cash = entries.filter(({p,fmt}) => fmt === 'hwpx' && cashReady(p) && !ownedNow(p, fmt));
    const ownedCash = entries.filter(({p,fmt}) => fmt === 'hwpx' && cashReady(p) && ownedNow(p, fmt)).length;
    let pay = '';
    // H28-19: 포인트 단추는 포인트 목록에 있는 자료만. 없으면 카드 결제가 큰 단추.
    const points = entries.filter(({p,fmt}) => pointable(p,fmt));
    if (points.length) {
      const first = points[0], id = key(first.p, first.fmt);
      pay = `<a class="ms-review-open ms-pay" data-ms-pay ${audience==='student'?'data-ms-point-receive="'+escape(id)+'"':''} href="/app/?pointPdf=${encodeURIComponent(id)}#library">${points.length > 1 ? '첫 자료 ' : formatLabel(first.fmt)+' '}${ownedNow(first.p,first.fmt) ? '보유 자료 다시 받기 · 차감 없음' : '포인트로 받기 · ' + cost(first.p,first.fmt)}</a>${points.length > 1 ? '<p class="ms-order-note">나머지는 위 목록의 「포인트 구매 확인」을 눌러 받습니다.</p>' : ''}`;
    }
    if (points.length < entries.length) pay += '<p class="ms-order-note">포인트 목록에 없는 한글은 카드 결제로 받습니다.</p>';
    if (cash.length && cash.length <= 3) {
      const q = new URLSearchParams();
      for (const {p} of cash) q.append(cash.length === 1 ? 'sku' : 'skus', key(p,'hwpx'));
      const won = cash.reduce((s, {p}) => s + p.formats.hwpx.price, 0);
      pay += `<a class="${points.length ? 'ms-review-back' : 'ms-review-open'} ms-card-pay" href="/checkout/?${q}">한글 ${cash.length}권 카드로 결제 · ${money(won)}원</a>`;
    }
    if (ownedCash) pay += '<p class="ms-order-note">이미 받은 한글은 카드 결제에서 뺐습니다. 다시 받기는 차감 없이 됩니다.</p>';
    dialog.innerHTML = `<header><h2 id="ms-order-title">주문 내용 확인</h2><form method="dialog"><button type="submit" aria-label="주문 내용 닫기">닫기</button></form></header><ul>${lines}</ul>${totals(entries)}<p class="ms-order-note">PDF와 한글(HWPX) 모두 묶음마다 한 번만 포인트를 차감합니다. 구매 화면에서 잔액과 보유 권리를 확인하며, 이미 보유한 자료는 추가 차감하지 않습니다.</p>${pay}<form method="dialog"><button type="submit" value="${only ? '' : 'basket'}" class="ms-review-back">${only ? '계속 고르기' : '장바구니로 돌아가기'}</button></form>`;
    dialog.addEventListener('close', () => { dialog.remove(); if (dialog.returnValue === 'basket') openCart(panel); else panel.querySelector('[data-ms-cart]')?.focus({preventScroll:true}); }, {once:true});
    panel.append(dialog);
    dialog.showModal();
  }
  /* 11-25 58: 시중 교재 판매 사이트(교보문고 · YES24)처럼 담기를 누르면 바로 팝업 — 장바구니 가기 / 계속 고르기.
     장바구니는 3권까지(한 번 결제 3권과 같은 잣대) — 넘으면 담지 않고 같은 팝업에서 알린다. */
  function addedPopup(panel, item, full) {
    const dialog = document.createElement('dialog');
    dialog.className = 'ms-order ms-added dl63-receipt';
    dialog.setAttribute('aria-labelledby','ms-added-title');
    const head = full ? '장바구니는 3권까지 담을 수 있습니다' : '장바구니에 담았습니다';
    const what = item ? `<p class="ms-added-item"><strong>${escape(title(item.p))}</strong><small>${formatLabel(item.fmt)} · ${cost(item.p,item.fmt)}</small></p>` : '';
    const tail = full ? '<p class="ms-order-note">장바구니에서 하나를 빼거나, 지금 담긴 것을 먼저 결제해 주세요.</p>' : '';
    dialog.innerHTML = `<header><h2 id="ms-added-title">${head}</h2></header>${what}${tail}<p class="ms-added-count">장바구니 ${picked().length} / 3권</p><form method="dialog" class="ms-added-acts"><button type="submit" value="cart" class="ms-review-open">장바구니 가기</button><button type="submit" value="" class="ms-review-back">계속 고르기</button></form>`;
    dialog.addEventListener('close', () => { dialog.remove(); if (dialog.returnValue === 'cart') openCart(panel); else panel.querySelector('[data-ms-cart]')?.focus({preventScroll:true}); }, {once:true});
    panel.append(dialog);
    dialog.showModal();
  }
  const offerOf = id => { for (const p of products) for (const fmt of ['pdf','hwpx']) if (key(p,fmt) === id && enabled(p,fmt)) return {p, fmt}; return null; };
  function body() {
    const count = picked().length;
    const cartButton = `<button class="ms-cart-button" type="button" data-ms-cart aria-label="장바구니 ${count}개"><i aria-hidden="true"></i>장바구니 <b>${count}</b></button>`;
    const notice = status === 'error' ? '<p role="alert">교재 목록을 불러오지 못했습니다.</p><button data-ms-retry>다시 불러오기</button>' : '<p role="status">교재 목록을 불러오는 중입니다.</p>';
    if (audience === 'student') {
      const top = `<div class="ms-top"><h1>자료받기</h1><span>시험 범위 교재 고르기</span>${cartButton}</div>`;
      return `${top}${status === 'ready' ? '<div class="ms-student-find">' + picker() + '</div>' + items() : notice}`;
    }
    const tabs = categories.map((c,i) => `<button type="button" ${i?'disabled':'aria-pressed="true"'}><small>${i+1}</small>${c}</button>`).join('');
    const catalog = status === 'ready' ? '<div class="ms-find"><h2>어느 책으로 수업하세요?</h2>' + picker() + '</div>' + items() : notice;
    const navigation = `<div class="ms-categories" role="group" aria-label="자료 종류">${tabs}</div>`;
    return `<div class="ms-mast dl63-head"><div><span class="dl63-kicker">시험 범위 자료 고르기</span><h1>내신 자료</h1>${status==='ready' ? `<p>연계 교재 ${new Set(products.filter(isLinked).map(p=>p.sourceId)).size}종 <i>·</i> 단원별 자료 ${cardsOf(products).length}권</p>` : ''}</div>${cartButton}</div>${navigation}${catalog}`;
  }
  function updateCartCount(panel) {
    const opener=panel.querySelector('[data-ms-cart]'), count=picked().length;
    opener.setAttribute('aria-label',`장바구니 ${count}개`);
    opener.querySelector('b').textContent=count;
  }
  window.addEventListener('ds-point-pdf-update', () => {
    const panel=root();
    if (!panel || panel.querySelector('dialog[open]')) return;
    for (const tile of panel.querySelectorAll('[data-ms-card]')) {
      const card=cardIndex.get(tile.dataset.msCard);
      if (card) {
        const offers=tile.querySelector('.ms-formats');
        const updated=formats(card);
        if (offers.innerHTML!==updated) {
          const focused=offers.contains(document.activeElement) && document.activeElement.className;
          offers.innerHTML=updated;
          if (focused) offers.querySelector('.'+focused.split(' ')[0])?.focus({preventScroll:true});
        }
      }
    }
    updateCartCount(panel);
  });
  const root = () => document.querySelector('#content .ms-shop');
  function refresh() { const el=root(); if(el) el.innerHTML=body(); }
  window.DSMaterialsShop = {
    render(options={}) {
      audience=options.audience==='student'?'student':'teacher';
      scope=audience==='student'?options.scope||null:null;
      load();
      return '<section class="ms-shop dl63-page dl63" data-ms-audience="'+audience+'">' + body() + '</section>';
    }
  };
  function clearScope(){
    scope=null;
    const url=new URL(location.href);
    if(!['studyBook','studyUnit','studyLocal'].some(k=>url.searchParams.has(k)))return;
    for(const k of ['studyBook','studyUnit','studyLocal'])url.searchParams.delete(k);
    history.replaceState(history.state,'',url);
  }
  document.addEventListener('input',e=>{if(e.target.matches('[data-ms-search]')) root().querySelector('[data-ms-options]').innerHTML=options(e.target.value);});
  document.addEventListener('toggle',e=>{
    const picker=e.target;
    if (!picker.matches?.('.ms-picker')) return;
    const input=picker.querySelector('[data-ms-search]');
    if (picker.open) input.focus({preventScroll:true});
    else {input.value='';picker.querySelector('[data-ms-options]').innerHTML=options();}
  },true);
  document.addEventListener('keydown',e=>{
    const box=e.target.closest('.ms-picker[open]'); if(!box||e.isComposing)return;
    const choices=[...box.querySelectorAll('[data-ms-book]')],pos=choices.indexOf(e.target);
    if(e.key==='Escape'){box.open=false;box.querySelector('summary').focus();}
    if(choices.length&&['ArrowDown','ArrowUp'].includes(e.key)){e.preventDefault();choices[Math.max(0,Math.min(choices.length-1,pos+(e.key==='ArrowDown'?1:-1)))].focus();}
    if(e.key==='Enter'&&e.target.matches('input')){e.preventDefault();choices[0]?.click();}
  });
  document.addEventListener('click',e=>{
    if(e.target.closest('[data-open-naesin]')) {if(location.hash==='#student'&&window.DSStudentDownloads){e.preventDefault();window.DSStudentDownloads.open('store');return;}e.preventDefault();location.hash='teacher';setTimeout(()=>builder.switchMode('materials'),0);return;}
    const panel=root(); if(!panel) return;
    const point=e.target.closest('[data-ms-point-receive]');if(point&&panel.contains(point)){e.preventDefault();const id=point.dataset.msPointReceive;if(window.DSAuth&&!window.DSAuth.has()){location.assign(window.DSAuth.loginUrl(location.pathname+location.search+location.hash));return;}window.DSStudentDownloads?.open('files');window.DSPointPdf?.receive(id);return;}
    const picker=panel.querySelector('.ms-picker'); if(picker?.open&&!picker.contains(e.target)) picker.open=false;
    const b=e.target.closest('button'); if(!b||!panel.contains(b)) return;
    if(b.hasAttribute('data-ms-clear')){clearScope();selected='';refresh();root()?.querySelector('.ms-picker summary')?.focus();return;}
    if(b.hasAttribute('data-ms-cart')){openCart(panel);return;}
    if(b.hasAttribute('data-ms-review')){panel.querySelector('.ms-cart-sheet')?.close();reviewOrder(panel);return;}
    if(b.hasAttribute('data-ms-retry')){status='idle';load();refresh();return;}
    if(b.dataset.msPick){const tile=b.closest('[data-ms-card]'),card=cardIndex.get(tile?.dataset.msCard);if(!card)return;chosen.set(card.id,b.dataset.msPick);tile.querySelector('.ms-formats').innerHTML=formats(card);[...tile.querySelectorAll('[data-ms-pick]')].find(x=>x.dataset.msPick===b.dataset.msPick)?.focus({preventScroll:true});return;}
    if(b.dataset.msBook){clearScope();selected=b.dataset.msBook;refresh();root().querySelector('summary').focus({preventScroll:true});}
    if(b.dataset.msAdd&&!cart.includes(b.dataset.msAdd)){const item=offerOf(b.dataset.msAdd);if(!item)return;const addTile=b.closest('[data-ms-card]');if(addTile)chosen.set(addTile.dataset.msCard,b.dataset.msAdd);if(picked().length>=3){addedPopup(panel,item,true);return;}cart.push(b.dataset.msAdd);save();refresh();const fresh=root();if(fresh)addedPopup(fresh,item,false);return;}
    if(b.dataset.msBuy){const item=offerOf(b.dataset.msBuy);if(item)reviewOrder(panel,[item]);return;}
    if(b.dataset.msRemove){
      cart=cart.filter(k=>k!==b.dataset.msRemove);save();
      const sheet = panel.querySelector('.ms-cart-sheet');
      if (sheet) {
        for (const tile of panel.querySelectorAll('[data-ms-card]')) {
          const card = cardIndex.get(tile.dataset.msCard);
          if (card?.parts.some(({p}) => ['pdf','hwpx'].some(fmt => key(p,fmt) === b.dataset.msRemove))) tile.querySelector('.ms-formats').innerHTML = formats(card);
        }
        sheet.innerHTML = cartContents();
        sheet.querySelector('button')?.focus();
        updateCartCount(panel);
      } else refresh();
    }
  });
})();
