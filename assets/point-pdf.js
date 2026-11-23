/* Approved existing PDF bundles only. Prices, ownership, debits and archives belong to member-library. */
(() => {
  'use strict';
  if(window.DSPointPdf)return;
  const ENDPOINT='https://cvlrphtupjmaefahodgz.supabase.co/functions/v1/member-library';
  const entities={'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'};
  const h=v=>String(v??'').replace(/[&<>"']/g,c=>entities[c]);
  const int=v=>Number.isSafeInteger(v)&&v>=0;
  const id=v=>typeof v==='string'&&/^[A-Za-z0-9._:-]{1,160}$/.test(v);
  const uuid=v=>typeof v==='string'&&/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(v);
  const money=v=>v.toLocaleString('ko-KR')+' P';
  const token=()=>window.DSAuth?.get?.()||'';
  const login=()=>window.DSAuth?.loginUrl?.(location.pathname+location.search+location.hash)||'/auth/?next='+encodeURIComponent(location.pathname+location.search+location.hash);
  const when=v=>typeof v==='string'&&Number.isFinite(Date.parse(v))?new Intl.DateTimeFormat('ko-KR',{timeZone:'Asia/Seoul',year:'numeric',month:'long',day:'numeric'}).format(new Date(v)):'';
  const selectedQuery=new URLSearchParams(location.search).get('pointPdf');let productFocused=false;
  const state={selected:id(selectedQuery)?selectedQuery:'',owner:token(),phase:'idle',receiptPhase:'idle',catalog:null,receipts:[],subject:'',term:'',busy:false,message:'',error:false,monthlySet:'',files:[],version:0};
  function safeUrl(value){try{const u=new URL(value);return u.protocol==='https:'&&!u.username&&!u.password&&!u.port&&['cvlrphtupjmaefahodgz.supabase.co','www.deltaskill.co.kr','deltaskill.co.kr'].includes(u.hostname)?u.href:null}catch{return null}}
  function catalogData(d){
    if(!d||typeof d.ready!=='boolean'||!Array.isArray(d.products)||d.products.length>10000)throw Error('invalid_catalog');
    const seen=new Set();const products=d.products.map(p=>{
      const fileCount=Number.isSafeInteger(p.fileCount)?p.fileCount:Array.isArray(p.files)?p.files.length:0;
      if(!p||!id(p.fileId)||!p.fileId.endsWith('.pdf')||seen.has(p.fileId)||typeof p.title!=='string'||!p.title||p.title.length>250||!int(p.points)||p.points<1||typeof p.ready!=='boolean'||typeof p.owned!=='boolean'||!Number.isSafeInteger(fileCount)||fileCount<1||fileCount>500)throw Error('invalid_catalog');
      seen.add(p.fileId);return {...p,fileCount,subject:typeof p.subject==='string'?p.subject:'기타'};
    });
    const free=d.balance?.free_remaining;
    return {...d,products,available:free===0?0:d.ready&&d.balance?.ready===true&&d.balance?.enabled===true&&int(free)?free:null};
  }
  function receiptRows(d){
    if(!d||!Array.isArray(d.receipts)||d.receipts.length>10000)throw Error('invalid_receipts');
    if(d.receipts.some(r=>!r||!uuid(r.receiptId)||!id(r.fileId)||(!int(r.points)||r.points<1)))throw Error('invalid_receipts');
    return d.receipts;
  }
  function delivery(d,{expected,again=false,count,expectedFiles}={}){
    if(!d||!uuid(d.receiptId)||!id(d.fileId)||!int(d.points)||d.points<1||!int(d.charged)||d.fileStored!==true||d.fileState!=='stored'||!Array.isArray(d.files)||!d.files.length||d.files.length>500)throw Error('unverified_delivery');
    if(again&&d.charged!==0)throw Error('unverified_delivery');
    if(!again&&d.charged!==0&&(d.charged!==expected||d.points!==expected))throw Error('unverified_delivery');
    if(count&&d.files.length!==count)throw Error('unverified_delivery');
    const seen=new Set(),files=d.files.map(f=>{const url=safeUrl(f?.url);if(!f||!id(f.fileId)||seen.has(f.fileId)||!url)throw Error('unverified_delivery');seen.add(f.fileId);return {fileId:f.fileId,title:typeof f.title==='string'?f.title:'PDF 파일',url};});
    if(Array.isArray(expectedFiles)&&expectedFiles.length){const ids=expectedFiles.map(x=>x.fileId).sort();if(JSON.stringify(ids)!==JSON.stringify(files.map(x=>x.fileId).sort()))throw Error('unverified_delivery');}
    return {...d,files};
  }
  async function call(body){
    const owner=token();if(!owner)throw Error('unauthorized');
    let response;try{response=await fetch(ENDPOINT,{method:'POST',credentials:'omit',cache:'no-store',headers:{'Content-Type':'application/json',Authorization:'Bearer '+owner},body:JSON.stringify(body)});}catch{throw Error('network')}
    const d=await response.json().catch(()=>null);if(token()!==owner)throw Error('session_changed');
    if(!response.ok||!d||d.ok===false)throw Object.assign(Error(d?.error||'server'),{data:d,status:response.status});return d;
  }
  function emit(){state.version++;renderAll();window.dispatchEvent(new Event('ds-point-pdf-update'));}
  let readEpoch=0;
  async function refresh(){
    const epoch=++readEpoch,owner=token();if(!owner){reset();return;}
    state.owner=owner;state.phase='loading';state.receiptPhase='loading';state.catalog=null;emit();
    const results=await Promise.allSettled([call({action:'point_pdf_catalog'}),call({action:'point_pdf_receipts'})]);
    if(token()!==owner||epoch!==readEpoch)return;
    try{if(results[0].status!=='fulfilled')throw results[0].reason;state.catalog=catalogData(results[0].value);state.phase='ready';}catch{state.catalog=null;state.phase='error';}
    try{if(results[1].status!=='fulfilled')throw results[1].reason;state.receipts=receiptRows(results[1].value);state.receiptPhase='ready';}catch{state.receipts=[];state.receiptPhase='error';}
    emit();
  }
  function reset(){readEpoch++;state.owner=token();state.phase='idle';state.receiptPhase='idle';state.catalog=null;state.receipts=[];state.files=[];state.message='';state.monthlySet='';state.busy=false;emit();}
  async function pendingId(fileId,points){
    const digest=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(token())))).map(x=>x.toString(16).padStart(2,'0')).join('');
    let saved;try{saved=JSON.parse(sessionStorage.getItem('point-pdf-attempts')||'null')}catch{}
    if(saved?.owner!==digest)saved={owner:digest,items:{}};
    const old=saved.items?.[fileId];if(old&&old.points===points&&uuid(old.requestId))return old.requestId;
    const requestId=crypto.randomUUID();saved.items[fileId]={requestId,points};try{sessionStorage.setItem('point-pdf-attempts',JSON.stringify(saved))}catch{}return requestId;
  }
  function forget(fileId){try{const d=JSON.parse(sessionStorage.getItem('point-pdf-attempts')||'null');if(d?.items){delete d.items[fileId];sessionStorage.setItem('point-pdf-attempts',JSON.stringify(d))}}catch{}}
  function failure(e){
    if(e.message==='price_changed')return '가격이 바뀌었습니다. 새 목록과 묶음 가격을 확인한 뒤 다시 선택해 주세요.';
    if(e.message==='no_points'){const x=e.data;return int(x?.required)&&int(x?.remaining)&&int(x?.shortage)?`잔액이 부족합니다. 필요한 포인트 ${money(x.required)} · 사용 가능 ${money(x.remaining)} · 부족 ${money(x.shortage)}.`:'사용 가능한 포인트가 부족합니다. 잔액을 다시 확인해 주세요.';}
    return ({unauthorized:'로그인한 뒤 이용해 주세요.',file_not_ready:'실제 PDF 파일을 준비하고 있습니다. 보관이 확인된 파일만 받을 수 있습니다.',not_ready:'포인트 PDF 구매를 준비하고 있습니다.',disabled:'포인트 사용을 준비하고 있습니다. 사용 가능한 잔액이 확인되면 구매할 수 있습니다.',not_owned:'이 계정의 PDF 수령 기록을 찾을 수 없습니다.',network:'수령 결과를 확인하지 못했습니다. 내 파일과 잔액을 확인한 뒤 같은 상품으로 다시 시도해 주세요.',unverified_delivery:'수령 파일과 차감을 확인하지 못했습니다. 내 파일과 잔액을 다시 확인해 주세요.'})[e.message]||'요청 결과를 확인하지 못했습니다. 내 파일과 잔액을 확인한 뒤 다시 시도해 주세요.';
  }
  function product(fileId){return state.catalog?.products.find(p=>p.fileId===(fileId.endsWith('.pdf')?fileId:fileId+'.pdf'))||null;}
  async function receive(fileId){
    if(state.busy)return;const p=product(fileId);if(!token()){location.assign(login());return;}
    if(!p||!p.ready||!state.catalog?.ready||(!p.owned&&state.catalog.available===null)){state.message='구매할 수 있는 PDF 목록과 잔액을 먼저 확인해 주세요.';state.error=true;emit();return;}
    if(!p.owned&&state.catalog.available<p.points){state.message=`잔액이 부족합니다. 필요한 포인트 ${money(p.points)} · 사용 가능 ${money(state.catalog.available)}.`;state.error=true;emit();return;}
    if(!p.owned&&!confirm(`${p.title}\nPDF ${p.fileCount}파일 묶음 · ${money(p.points)} 1회 차감\n구성 파일은 모두 내 파일에 보관됩니다. 구매할까요?`))return;
    const owner=token();state.busy=true;state.message='묶음 수령과 포인트 차감을 확인하는 중…';state.error=false;state.files=[];state.monthlySet='';emit();
    try{
      const requestId=await pendingId(p.fileId,p.points);if(token()!==owner)return;
      const result=delivery(await call({action:'point_pdf_receive',fileId:p.fileId,expectedPoints:p.points,requestId}),{expected:p.points,count:p.fileCount,expectedFiles:p.files});
      if(token()!==owner)return;if(result.fileId!==p.fileId)throw Error('unverified_delivery');
      state.files=result.files;state.message=`내 파일 보관 확인 · 이번 차감 ${money(result.charged)} · 구성 ${result.files.length}개 파일${int(result.remaining)?' · 남은 '+money(result.remaining):''}. 파일을 열어 기기에 저장해 주세요.`;forget(p.fileId);
    }catch(e){if(token()!==owner)return;state.message=failure(e);state.error=true;if(e.message==='existing_monthly_right'){state.monthlySet=id(e.data?.setId)?e.data.setId:'*';state.message='이용 기간 안에 이미 받은 월 이용권 프린트입니다. 추가 P 구매 대신 내 월벌 자료에서 열어 주세요.';}if(['price_changed','no_points'].includes(e.message))forget(p.fileId);}
    finally{if(token()===owner){await refresh();state.busy=false;emit();}}
  }
  async function redownload(receiptId){
    if(state.busy)return;const row=state.receipts.find(r=>r.receiptId===receiptId);if(!row)return;
    const owner=token();state.busy=true;state.files=[];state.message='내 파일과 다시 받기 주소를 확인하는 중…';state.error=false;emit();
    try{const result=delivery(await call({action:'point_pdf_redownload',receiptId}),{again:true,count:Number.isSafeInteger(row.fileCount)?row.fileCount:undefined});if(token()!==owner)return;if(result.receiptId!==row.receiptId||result.fileId!==row.fileId||result.points!==row.points)throw Error('unverified_delivery');state.files=result.files;state.message=`다시 받기 · 추가 차감 0 P · 내 파일 ${result.files.length}개 보관 확인. 파일을 열어 기기에 저장해 주세요.`;}
    catch(e){if(token()!==owner)return;state.message=failure(e);state.error=true;}
    finally{if(token()===owner){await refresh();state.busy=false;emit();}}
  }
  const retry='<button type="button" class="ppdf-quiet" data-ppdf-action="reload">목록·잔액 다시 확인</button>';
  function notice(){return (state.message?`<div class="ppdf-notice${state.error?' ppdf-error':''}" role="status">${h(state.message)}${state.monthlySet?` <a href="${state.monthlySet==='*'?'/my/#pprint':'/my/?passSet='+encodeURIComponent(state.monthlySet)+'#pprint'}">내 월벌 열기 →</a>`:''}</div>`:'')+(state.files.length?`<ul class="ppdf-files">${state.files.map(f=>`<li><a href="${h(f.url)}" target="_blank" rel="noopener noreferrer">${h(f.title)} · 열기/저장 ↗</a></li>`).join('')}</ul>`:'');}
  function shop(){
    const heading='<header class="ppdf-heading"><div><span>PDF 포인트 자료</span><h2>필요한 자료를 내 파일로</h2></div><div><a href="#account">내 파일 보기 →</a>'+(state.selected?' <button type="button" class="ppdf-quiet" data-ppdf-action="all">전체 PDF 목록</button>':'')+'</div></header>';
    if(!token())return heading+`<p>포인트 구매 목록과 사용 가능한 잔액은 로그인한 뒤 확인할 수 있습니다.</p><a class="ppdf-primary" href="${h(login())}">로그인하고 확인</a>`;
    if(state.phase==='idle'||state.phase==='loading')return heading+'<p role="status">승인된 PDF 목록과 잔액을 확인하는 중…</p>';
    if(state.phase==='error')return heading+'<p role="status">포인트 PDF 목록과 잔액을 확인하지 못했습니다.</p>'+retry+notice();
    const c=state.catalog,subjects=[...new Set(c.products.map(p=>p.subject))],rows=c.products.filter(p=>(!state.selected||p.fileId===state.selected)&&(!state.subject||p.subject===state.subject)&&(!state.term||(p.title+' '+p.subject).includes(state.term)));
    return heading+`<div class="ppdf-wallet"><strong>사용 가능한 포인트</strong><b>${c.available===null?'잔액을 확인할 수 없습니다':money(c.available)}</b>${c.available===0?'<span>현재 사용할 수 있는 포인트가 없습니다.</span>':''}${retry}</div><p class="ppdf-help">PDF 구성 파일 묶음 가격으로 한 번 구매합니다. 한글 원화 구매·월 이용권 벌 수와 별도입니다. 신규 회원 혜택은 미사용 시 1·2·3주차에 3,000·6,000·9,000P로 모아 쓰고, 가입 후 3주가 끝나면 남은 혜택 포인트만 만료됩니다.</p>${!c.ready?'<p role="status">PDF 포인트 구매를 준비하고 있습니다. 준비 완료된 항목만 구매할 수 있습니다.</p>':''}<div class="ppdf-filters"><label>과목<select data-ppdf-subject><option value="">전체 과목</option>${subjects.map(s=>`<option${s===state.subject?' selected':''}>${h(s)}</option>`).join('')}</select></label><label>자료 검색<input data-ppdf-search value="${h(state.term)}" placeholder="자료명·과목"></label></div>${notice()}<ul class="ppdf-products">${rows.map(p=>{const ready=c.ready&&p.ready&&(p.owned||c.available!==null),short=!p.owned&&c.available!==null&&c.available<p.points;return `<li data-ppdf-product="${h(p.fileId)}"${p.fileId===state.selected?' class="ppdf-selected"':''}><div><small>${h(p.subject)} · PDF ${p.fileCount}파일 묶음</small><h3>${h(p.title)}</h3><p>묶음 1회 구매 · 구성 파일 모두 보관</p></div><div class="ppdf-product-price"><strong>${money(p.points)}</strong><button type="button" class="ppdf-primary" data-ppdf-buy="${h(p.fileId)}"${state.busy||!ready||short?' disabled':''}>${p.owned?'이미 보유 · 차감 없이 받기':!p.ready?'파일 준비 중':!c.ready?'구매 정보 확인 필요':c.available===null?'잔액 확인 필요':short?(c.available===0?'포인트 없음':'잔액 부족'):'포인트로 구매'}</button></div></li>`}).join('')||'<li><p>현재 조건에 맞는 승인된 PDF가 없습니다.</p></li>'}</ul>`;
  }
  function receipts(){
    let body;if(!token())body=`<p>로그인하면 포인트로 받은 PDF를 다시 받을 수 있습니다.</p><a href="${h(login())}">로그인</a>`;
    else if(['idle','loading'].includes(state.receiptPhase))body='<p role="status">내 파일 수령 기록을 확인하는 중…</p>';
    else if(state.receiptPhase==='error')body='<p role="status">내 파일 수령 기록을 확인하지 못했습니다.</p>'+retry;
    else body=state.receipts.length?`<ul class="ppdf-receipts">${state.receipts.map(r=>`<li><div><h4>${h(r.title||r.fileId)}</h4><p>${h(r.subject||'PDF')} · 구매 당시 ${money(r.points)}${when(r.receivedAt)?' · '+h(when(r.receivedAt)):''}</p><small>${r.fileStored===true&&r.fileState==='stored'?'내 파일 보관 확인':'보관 상태 확인 필요'}</small></div><button type="button" class="ppdf-quiet" data-ppdf-again="${h(r.receiptId)}"${state.busy||r.redownloadable===false?' disabled':''}>다시 받기 · 0 P</button></li>`).join('')}</ul>`:'<p>서버에 확인된 포인트 PDF 수령 내역이 없습니다.</p>';
    return '<h3>포인트로 받은 PDF · 내 파일</h3><p class="ppdf-help">이미 받은 상품의 구성 파일은 혜택 포인트가 만료된 뒤에도 추가 P 차감 없이 다시 받을 수 있습니다.</p>'+notice()+body;
  }
  function renderAll(){
    for(const host of document.querySelectorAll('[data-ppdf-shop],[data-ppdf-receipts]')){
      if(host.dataset.ppdfRevision===String(state.version))continue;host.dataset.ppdfRevision=String(state.version);host.innerHTML=host.hasAttribute('data-ppdf-shop')?shop():receipts();if(!productFocused&&state.selected&&state.phase==='ready'&&host.hasAttribute('data-ppdf-shop')){const row=[...host.querySelectorAll('[data-ppdf-product]')].find(x=>x.dataset.ppdfProduct===state.selected);if(row){row.scrollIntoView({block:'center'});productFocused=true;}}
      if(host.dataset.ppdfBound)continue;host.dataset.ppdfBound='1';
      host.addEventListener('click',e=>{const buy=e.target.closest('[data-ppdf-buy]'),again=e.target.closest('[data-ppdf-again]'),reload=e.target.closest('[data-ppdf-action="reload"]'),all=e.target.closest('[data-ppdf-action="all"]');if(buy||again||reload||all){e.preventDefault();e.stopPropagation();if(buy)receive(buy.dataset.ppdfBuy);else if(again)redownload(again.dataset.ppdfAgain);else if(all){state.selected='';const u=new URL(location.href);u.searchParams.delete('pointPdf');history.replaceState(null,'',u.pathname+u.search+u.hash);emit();}else refresh();}});
      host.addEventListener('change',e=>{if(e.target.matches('[data-ppdf-subject]')){state.selected='';state.subject=e.target.value;emit();}});
      host.addEventListener('input',e=>{if(e.target.matches('[data-ppdf-search]')){const start=e.target.selectionStart;state.selected='';state.term=e.target.value;emit();const next=host.querySelector('[data-ppdf-search]');next.focus();next.setSelectionRange(start,start);}});
    }
  }
  function mount(){
    if(location.pathname.startsWith('/my/')){const box=document.querySelector('#library');if(box&&!box.querySelector('[data-ppdf-receipts]')){const section=document.createElement('section');section.className='ppdf ppdf-account';section.setAttribute('data-ppdf-receipts','');box.appendChild(section);}}
    renderAll();if(token()&&state.phase==='idle'&&document.querySelector('[data-ppdf-shop],[data-ppdf-receipts]'))refresh();
  }
  const shell=mode=>`<section class="ppdf ${mode==='shop'?'ppdf-shop':'ppdf-account'}" data-ppdf-${mode}></section>`;
  if(typeof libraryPage==='function'){
    const original=libraryPage;libraryPage=function(){const html=original(),t=document.createElement('template');t.innerHTML=html;const root=t.content.firstElementChild;if(root){const anchor=root.querySelector('.dl63-stack,.lf19-finder,.resource-filters');const footer=root.querySelector('footer');if(anchor)anchor.insertAdjacentHTML('beforebegin',shell('shop'));else if(footer)footer.insertAdjacentHTML('beforebegin',shell('shop'));else root.insertAdjacentHTML('beforeend',shell('shop'));}return t.innerHTML;};
  }
  if(window.DSAccountViews?.account){const original=DSAccountViews.account;DSAccountViews.account=function(...args){const t=document.createElement('template');t.innerHTML=original.apply(this,args);t.content.querySelector('#account-materials')?.insertAdjacentHTML('beforeend',shell('receipts'));return t.innerHTML;};}
  window.DSPointPdf={product,refresh,receive,redownload,safeUrl,availability:fileId=>{const p=product(fileId);return !!(p&&p.ready&&state.catalog?.ready&&(p.owned||(state.catalog.available!==null&&state.catalog.available>=p.points))&&!state.busy)},validate:{catalogData,receiptRows,delivery}};
  window.DSPointService={...(window.DSPointService||{}),redeemPdf:receive};
  new MutationObserver(mount).observe(document.body,{childList:true,subtree:true});
  for(const event of ['ds-auth-change','ds-session-change'])window.addEventListener(event,()=>{reset();mount();});
  window.addEventListener('storage',e=>{if(e.key==='ds_tk'){reset();mount();}});
  if(location.hash==='#library'&&typeof libraryPage==='function'&&document.querySelector('#content'))document.querySelector('#content').innerHTML=libraryPage();
  if(location.hash==='#account'&&typeof refreshAccount==='function')refreshAccount();
  mount();
})();
