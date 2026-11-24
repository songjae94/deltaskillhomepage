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
      products = library.buildCatalog(catalog, config).filter(i => i.formats.pdf).map(i => ({...i, source: origins[i.sku]?.book || archive, sourceId: origins[i.sku]?.bookId}));
      status = 'ready';
    } catch { status = 'error'; }
    refresh();
  }
  const title = p => p.name.replace(/\s*·\s*\d+\s+/, ' · ');
  const grouped = () => [...new Set(products.map(p => p.source))].sort((a,b) => a.localeCompare(b,'ko'));
  const key = (p, fmt) => p.sku + '.' + fmt;
  const publicPoints = Object.freeze({'NS-CM2-06':4000,'NS-CM2-07':5000,'NS-CM2B-06':2200,'NS-MI1B-05':3100});
  const quote = p => window.DSPointPdf?.product(key(p,'pdf'));
  const price = (p, fmt) => fmt === 'pdf' ? (quote(p)?.points ?? publicPoints[p.sku] ?? null) : p.formats.hwpx?.price;
  const cashReady = p => Number.isSafeInteger(p.formats.hwpx?.price) && p.formats.hwpx.price > 0 && p.formats.hwpx.files.length > 0;
  const enabled = (p, fmt) => fmt === 'pdf' ? Number.isSafeInteger(price(p,fmt)) && price(p,fmt)>0 : cashReady(p);
  const coverURL = sku => 'public-data/covers/' + encodeURIComponent(sku) + '.webp?v=shelf-1124';
  const cost = (p,fmt) => Number.isSafeInteger(price(p,fmt)) ? money(price(p,fmt)) + (fmt === 'pdf' ? ' P' : '원') : fmt === 'pdf' ? '포인트 가격 확인 중' : publicPoints[p.sku] ? '판매 예정가 ' + money(publicPoints[p.sku] * 2) + '원' : '준비 중';
  const picked = () => products.flatMap(p => ['pdf','hwpx'].filter(fmt => cart.includes(key(p,fmt)) && enabled(p,fmt)).map(fmt => ({p,fmt})));
  function options(query='') {
    const list = grouped().filter(name => normalize(name).includes(normalize(query)));
    return list.map(name => `<button type="button" data-ms-book="${escape(name)}">${escape(name)}<small>${products.filter(p=>p.source===name).length}권</small></button>`).join('') || '<p role="status">검색 결과가 없습니다.</p>';
  }
  function picker() {
    return `<div class="ms-find"><h2>${audience==='student'?'어떤 부교재로 공부하나요?':'어느 책으로 수업하세요?'}</h2><details class="ms-picker"><summary><span>${escape(scope?.label || selected || (audience==='student'?'공부하는 교재 찾기':'수업 교재 찾기'))}</span><i aria-hidden="true"></i></summary><div class="ms-popup dl63-list-wrap"><input type="search" aria-label="교재 검색" placeholder="교재명으로 검색" data-ms-search><div data-ms-options>${options()}</div></div></details></div>`;
  }
  const coverSkus = new Set(['NS-CM2-06', 'NS-CM2-07', 'NS-CM2B-06', 'NS-MI1B-05']);
  function formats(p) {
    return ['pdf','hwpx'].map(fmt => {
      const id=key(p,fmt), available=enabled(p,fmt), added=cart.includes(id);
      return `<button type="button" class="ms-format" aria-label="${escape(title(p))} ${fmt === 'pdf' ? 'PDF' : '한글'} ${cost(p,fmt)} ${added ? '담김' : '담기'}" data-ms-add="${escape(id)}" ${!available||added?'disabled':''}><span>${fmt==='pdf'?'PDF':'한글'}</span><b>${fmt==='hwpx'&&!cashReady(p)&&publicPoints[p.sku] ? '<span class="ms-planned-label">판매 예정가</span><span class="ms-price-number">'+money(publicPoints[p.sku]*2)+'원</span>' : cost(p,fmt)}</b><small>${!available?'준비 중':added?'담김':'담기 +'}</small></button>`;
    }).join('');
  }
  function coverTile(p) {
    const label = escape(title(p));
    const art = coverSkus.has(p.sku)
      ? `<img src="${coverURL(p.sku)}" width="630" height="891" alt="${label}, ${p.count}문항 표지">`
      : `<span class="ms-fallback-cover">${label}</span>`;
    const cover = p.sample
      ? `<a class="ms-book-cover" href="${escape(p.sample)}" target="_blank" rel="noopener" aria-label="${label} 지면 미리보기, 새 창">${art}</a>`
      : `<div class="ms-book-cover">${art}</div>`;
    return `<article class="ms-volume" data-sku="${escape(p.sku)}" aria-label="${label}"><div class="ms-stage">${cover}</div><div class="ms-book-info"><small>${escape(p.subject || p.source)}</small><h3>${label}</h3><span>${p.count}문항</span></div><div class="ms-formats">${formats(p)}</div></article>`;
  }
  function items() {
    const list = scope ? products.filter(p => scope.bookId
      ? p.sourceId===scope.bookId && (!scope.unitId || p.no===scope.unitId)
      : p.subject===scope.subject && p.unit===scope.unit)
      : selected ? products.filter(p => p.source === selected) : products;
    const heading = scope ? scope.label : selected ? '단원별 교재' : '판매 교재';
    const reset = scope || selected ? '<button type="button" class="ms-clear" data-ms-clear>전체 교재 보기</button>' : '';
    return `<section class="ms-items" aria-label="${escape(selected || '전체')} 판매 교재"><div class="ms-results dl63-head"><h2>${escape(heading)}</h2><span>${list.length}권</span>${reset}</div>${scope && !list.length ? '<p role="status">이 범위에서 구매할 수 있는 자료는 아직 없습니다.</p>' : ''}<div class="ms-bookshelf">${list.map(coverTile).join('')}</div></section>`;
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
      return `<li><small>${escape(p.source)}</small><strong>${escape(title(p))}</strong><div><span>${formatLabel(fmt)} · ${cost(p,fmt)}</span>${action}</div></li>`;
    }).join('');
    dialog.innerHTML = `<header><h2 id="ms-order-title">주문 내용 확인</h2><form method="dialog"><button type="submit" aria-label="주문 내용 닫기">닫기</button></form></header><ul>${lines}</ul>${totals(entries)}<p class="ms-order-note">PDF는 묶음마다 한 번만 차감합니다. 구매 화면에서 잔액과 보유 권리를 확인하며, 이미 보유한 PDF는 추가 차감하지 않습니다. 한글은 별도 원화 결제입니다.</p><form method="dialog"><button type="submit" value="basket" class="ms-review-open">장바구니로 돌아가기</button></form>`;
    dialog.addEventListener('close', () => { dialog.remove(); if (dialog.returnValue === 'basket') openCart(panel); else panel.querySelector('[data-ms-cart]')?.focus({preventScroll:true}); }, {once:true});
    panel.append(dialog);
    dialog.showModal();
  }
  function body() {
    const count = picked().length;
    const cartButton = `<button class="ms-cart-button" type="button" data-ms-cart aria-label="장바구니 ${count}개"><i aria-hidden="true"></i>장바구니 <b>${count}</b></button>`;
    const tabs = categories.map((c,i) => `<button type="button" ${i?'disabled':'aria-pressed="true"'}><small>${i+1}</small>${c}</button>`).join('');
    const catalog = status === 'error' ? '<p>교재 목록을 불러오지 못했습니다.</p><button data-ms-retry>다시 불러오기</button>' : status !== 'ready' ? '<p role="status">교재 목록을 불러오는 중입니다.</p>' : picker() + items();
    return `<div class="ms-mast dl63-head"><div>${audience==='student'?'<h2>교재 서점</h2>':'<span class="dl63-kicker">시험 범위 자료 고르기</span><h1>내신 자료</h1>'}${status==='ready' ? `<p>연계 교재 ${grouped().length}종 <i>·</i> 단원별 자료 ${products.length}권</p>` : ''}</div>${cartButton}</div><div class="ms-categories" role="group" aria-label="자료 종류">${tabs}</div>${catalog}`;
  }
  window.addEventListener('ds-point-pdf-update', () => { if (!root()?.querySelector('dialog[open]')) refresh(); });
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
  document.addEventListener('toggle',e=>{if(e.target.matches?.('.ms-picker') && e.target.open){const input=e.target.querySelector('input');input.value='';e.target.querySelector('[data-ms-options]').innerHTML=options();input.focus({preventScroll:true});}},true);
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
        const count = picked().length, opener = panel.querySelector('[data-ms-cart]');
        opener.setAttribute('aria-label',`장바구니 ${count}개`);
        opener.querySelector('b').textContent=count;
      } else refresh();
    }
  });
})();
