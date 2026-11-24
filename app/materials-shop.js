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
    if (audience !== 'student') return name;
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
  const quote = p => window.DSPointPdf?.product(key(p,'pdf'));
  const price = (p, fmt) => fmt === 'pdf' ? (quote(p)?.points ?? publicPoints[p.sku] ?? p.formats.pdf?.price ?? null) : p.formats.hwpx?.price;
  const cashReady = p => Number.isSafeInteger(p.formats.hwpx?.price) && p.formats.hwpx.price > 0 && p.formats.hwpx.files.length > 0;
  const enabled = (p, fmt) => !p.restored && (fmt === 'pdf' ? Number.isSafeInteger(price(p,fmt)) && price(p,fmt)>0 : cashReady(p));
  const coverURL = sku => 'public-data/covers/' + encodeURIComponent(sku) + '.webp?v=editorial-light-1124';
  const cost = (p,fmt) => Number.isSafeInteger(price(p,fmt)) ? money(price(p,fmt)) + (fmt === 'pdf' ? ' P' : '원') : fmt === 'pdf' ? '포인트 가격 확인 중' : publicPoints[p.sku] ? '판매 예정가 ' + money(publicPoints[p.sku] * 2) + '원' : '준비 중';
  const picked = () => products.flatMap(p => ['pdf','hwpx'].filter(fmt => cart.includes(key(p,fmt)) && enabled(p,fmt)).map(fmt => ({p,fmt})));
  function options(query='') {
    const list = grouped().filter(name => [name,displayBook(name)].some(label => normalize(label).includes(normalize(query))));
    return list.map(name => `<button type="button" data-ms-book="${escape(name)}">${escape(displayBook(name))}<small>${products.filter(p=>p.source===name).length}권</small></button>`).join('') || '<p role="status">검색 결과가 없습니다.</p>';
  }
  function picker() {
    return `<details class="ms-picker"><summary><span>${escape(pickerLabel())}</span><i aria-hidden="true"></i></summary><div class="ms-popup dl63-list-wrap"><input type="search" aria-label="교재 검색" placeholder="교재명으로 검색" data-ms-search><div data-ms-options>${options()}</div></div></details>`;
  }
  const coverSkus = new Set(['NS-CM2-06', 'NS-CM2-07', 'NS-CM2B-06', 'NS-MI1B-05']);
  function formats(p) {
    return ['pdf','hwpx'].filter(fmt => fmt !== 'pdf' || Boolean(p.formats.pdf)).map(fmt => {
      const id=key(p,fmt), available=enabled(p,fmt), added=cart.includes(id);
      const planned=fmt==='hwpx'&&!available&&publicPoints[p.sku];
      const format=fmt==='pdf'?'PDF':'한글';
      const amount=planned?money(publicPoints[p.sku]*2)+'원':cost(p,fmt);
      const action=!available?'준비 중':added?'담김':'담기';
      return `<button type="button" class="ms-format" aria-label="${escape(title(p))} ${format} ${cost(p,fmt)} ${action}" data-ms-add="${escape(id)}" ${!available||added?'disabled':''}><span>${format}${planned?'<em>예정가</em>':''}</span><b>${amount}</b><small>${action}</small></button>`;
    }).join('');
  }
  function coverTile(p) {
    const label = escape(title(p));
    const art = (p.restored && p.coverReady !== false) || coverSkus.has(p.sku)
      ? `<img src="${coverURL(p.sku)}" width="630" height="891" alt="${label} 표지">`
      : `<span class="ms-fallback-cover">${label}</span>`;
    const cover = p.sample
      ? `<a class="ms-book-cover" href="${escape(p.sample)}" target="_blank" rel="noopener" aria-label="${label} 지면 미리보기, 새 창">${art}<span class="ms-look">미리보기 ↗</span></a>`
      : `<div class="ms-book-cover">${art}</div>`;
    const edition = p.edition || (p.name.includes('기초편') ? '기초편' : '1권');
    const meta = p.count ? `${edition}<i aria-hidden="true">·</i>${p.count}문항` : edition;
    const offer = p.restored
      ? '<div class="ms-formats ms-upcoming"><span>PDF · 한글</span><strong>판매 준비 중</strong></div>'
      : '<div class="ms-formats">' + formats(p) + '</div>';
    return `<article class="ms-volume" data-sku="${escape(p.sku)}" aria-label="${label}"><div class="ms-stage">${cover}</div><div class="ms-book-info"><small>${meta}</small><h3>${escape(p.unit||title(p))}</h3>${p.editionNote?`<span>${escape(p.editionNote)}</span>`:''}${audience==='student'?'':`<span>${isLinked(p)?'연계 · ':''}${escape(displayBook(p.source))}</span>`}</div>${offer}</article>`;
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
    const rows = [...shelves].sort(([, a], [, b]) =>
      a[0].subject.localeCompare(b[0].subject, 'ko') ||
      Number(a[0].sourceId?.includes('-advanced-') || false) - Number(b[0].sourceId?.includes('-advanced-') || false)
    ).map(([source, books]) => {
      books.sort((a, b) => a.no.localeCompare(b.no) || (a.edition || a.name).localeCompare(b.edition || b.name, 'ko'));
      const name = escape(displayBook(source));
      return `<section class="ms-shelf-group" data-ms-series="${escape(books[0].sourceId || '')}" aria-label="${name}"><header><h3>${name}</h3>${audience==='student'?'':`<span>${books.length}권</span>`}</header><div class="ms-bookshelf">${books.map(coverTile).join('')}</div></section>`;
    }).join('');
    if (audience === 'student') {
      const empty = list.length ? '' : '<p role="status">이 범위에서 받을 수 있는 자료는 아직 없습니다.</p>';
      return `<section class="ms-items" aria-label="단원별 교재">${reset ? '<div class="ms-results">' + reset + '</div>' : ''}${empty}${rows}</section>`;
    }
    return `<section class="ms-items" aria-label="${escape(bookLabel(selected || '전체'))} 판매 교재"><div class="ms-results dl63-head"><h2>${escape(heading)}</h2><span>${list.length}권</span>${reset}</div>${list.length ? '<p class="ms-delivery">구매한 교재는 배송 없이 파일로 내려받습니다.</p>' : ''}${scope && !list.length ? '<p role="status">이 범위에서 구매할 수 있는 자료는 아직 없습니다.</p>' : ''}${rows}</section>`;
  }

  const formatLabel = fmt => fmt === 'pdf' ? 'PDF' : '한글';
  function totals(entries) {
    const sums = {pdf:0, hwpx:0};
    for (const {p, fmt} of entries) sums[fmt] += price(p, fmt);
    return `<div class="ms-total">${sums.pdf ? `<div>PDF 합계 <b>${money(sums.pdf)} P</b></div>` : ''}${sums.hwpx ? `<div>한글 합계 <b>${money(sums.hwpx)}원</b></div>` : ''}</div>`;
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
  function reviewOrder(panel) {
    const entries = picked();
    if (!entries.length) return;
    const dialog = document.createElement('dialog');
    dialog.className = 'ms-order dl63-receipt';
    dialog.setAttribute('aria-labelledby','ms-order-title');
    const lines = entries.map(({p,fmt}) => {
      const action = fmt === 'pdf'
        ? `<a data-ms-point-purchase ${audience==='student'?'data-ms-point-receive="'+escape(key(p,fmt))+'"':''} href="/app/?pointPdf=${encodeURIComponent(key(p,fmt))}#library">${quote(p)?.owned ? '보유 PDF 다시 받기' : '포인트 구매 확인'}</a>`
        : cashReady(p) ? `<a href="${escape(library.checkoutHref(p,fmt))}">한글 결제하기</a>` : '<small>한글 준비 중</small>';
      return `<li><small>${escape(displayBook(p.source))}</small><strong>${escape(title(p))}</strong><div><span>${formatLabel(fmt)} · ${cost(p,fmt)}</span>${action}</div></li>`;
    }).join('');
    dialog.innerHTML = `<header><h2 id="ms-order-title">주문 내용 확인</h2><form method="dialog"><button type="submit" aria-label="주문 내용 닫기">닫기</button></form></header><ul>${lines}</ul>${totals(entries)}<p class="ms-order-note">PDF는 묶음마다 한 번만 차감합니다. 구매 화면에서 잔액과 보유 권리를 확인하며, 이미 보유한 PDF는 추가 차감하지 않습니다. 한글은 별도 원화 결제입니다.</p><form method="dialog"><button type="submit" value="basket" class="ms-review-open">장바구니로 돌아가기</button></form>`;
    dialog.addEventListener('close', () => { dialog.remove(); if (dialog.returnValue === 'basket') openCart(panel); else panel.querySelector('[data-ms-cart]')?.focus({preventScroll:true}); }, {once:true});
    panel.append(dialog);
    dialog.showModal();
  }
  function body() {
    const count = picked().length;
    const cartButton = `<button class="ms-cart-button" type="button" data-ms-cart aria-label="장바구니 ${count}개"><i aria-hidden="true"></i>장바구니 <b>${count}</b></button>`;
    const notice = status === 'error' ? '<p role="alert">교재 목록을 불러오지 못했습니다.</p><button data-ms-retry>다시 불러오기</button>' : '<p role="status">교재 목록을 불러오는 중입니다.</p>';
    if (audience === 'student') {
      const question = '<div class="ms-question"><span class="dl63-kicker">시험 범위 자료 고르기</span><h1>어떤 부교재로 공부하나요?</h1></div>';
      return `<div class="ms-student-find">${question}${status === 'ready' ? picker() : ''}${cartButton}</div>${status === 'ready' ? items() : notice}`;
    }
    const tabs = categories.map((c,i) => `<button type="button" ${i?'disabled':'aria-pressed="true"'}><small>${i+1}</small>${c}</button>`).join('');
    const catalog = status === 'ready' ? '<div class="ms-find"><h2>어느 책으로 수업하세요?</h2>' + picker() + '</div>' + items() : notice;
    const navigation = `<div class="ms-categories" role="group" aria-label="자료 종류">${tabs}</div>`;
    return `<div class="ms-mast dl63-head"><div><span class="dl63-kicker">시험 범위 자료 고르기</span><h1>내신 자료</h1>${status==='ready' ? `<p>연계 교재 ${new Set(products.filter(isLinked).map(p=>p.sourceId)).size}종 <i>·</i> 단원별 자료 ${products.length}권</p>` : ''}</div>${cartButton}</div>${navigation}${catalog}`;
  }
  function updateCartCount(panel) {
    const opener=panel.querySelector('[data-ms-cart]'), count=picked().length;
    opener.setAttribute('aria-label',`장바구니 ${count}개`);
    opener.querySelector('b').textContent=count;
  }
  window.addEventListener('ds-point-pdf-update', () => {
    const panel=root();
    if (!panel || panel.querySelector('dialog[open]')) return;
    for (const tile of panel.querySelectorAll('.ms-volume')) {
      const product=products.find(p=>p.sku===tile.dataset.sku);
      if (product && !product.restored) {
        const offers=tile.querySelector('.ms-formats');
        const updated=formats(product);
        if (offers.innerHTML!==updated) {
          const focused=offers.contains(document.activeElement) && document.activeElement.dataset.msAdd;
          offers.innerHTML=updated;
          if (focused) [...offers.querySelectorAll('button')].find(b=>b.dataset.msAdd===focused)?.focus({preventScroll:true});
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
    const point=e.target.closest('[data-ms-point-receive]');if(point&&panel.contains(point)){e.preventDefault();const id=point.dataset.msPointReceive;window.DSStudentDownloads?.open('files');window.DSPointPdf?.receive(id);return;}
    const picker=panel.querySelector('.ms-picker'); if(picker?.open&&!picker.contains(e.target)) picker.open=false;
    const b=e.target.closest('button'); if(!b||!panel.contains(b)) return;
    if(b.hasAttribute('data-ms-clear')){clearScope();selected='';refresh();root()?.querySelector('.ms-picker summary')?.focus();return;}
    if(b.hasAttribute('data-ms-cart')){openCart(panel);return;}
    if(b.hasAttribute('data-ms-review')){panel.querySelector('.ms-cart-sheet')?.close();reviewOrder(panel);return;}
    if(b.hasAttribute('data-ms-retry')){status='idle';load();refresh();return;}
    if(b.dataset.msBook){clearScope();selected=b.dataset.msBook;refresh();root().querySelector('summary').focus({preventScroll:true});}
    if(b.dataset.msAdd&&!cart.includes(b.dataset.msAdd)){const match=products.find(p=>['pdf','hwpx'].some(fmt=>key(p,fmt)===b.dataset.msAdd&&enabled(p,fmt)));if(!match)return;cart.push(b.dataset.msAdd);save();refresh();}
    if(b.dataset.msRemove){
      cart=cart.filter(k=>k!==b.dataset.msRemove);save();
      const sheet = panel.querySelector('.ms-cart-sheet');
      if (sheet) {
        const oldButton = [...panel.querySelectorAll('[data-ms-add]')].find(button => button.dataset.msAdd === b.dataset.msRemove);
        const product = products.find(p => ['pdf','hwpx'].some(fmt => key(p,fmt) === b.dataset.msRemove));
        if (oldButton && product) oldButton.closest('.ms-formats').innerHTML = formats(product);
        sheet.innerHTML = cartContents();
        sheet.querySelector('button')?.focus();
        updateCartCount(panel);
      } else refresh();
    }
  });
})();
