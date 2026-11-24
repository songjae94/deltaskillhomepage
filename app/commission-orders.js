(() => {
  'use strict';
  const stateNames = { draft:'작성 중', awaiting_payment:'결제 대기', confirming:'결제 확인 중', paid:'제작 중', delivered:'수령 가능' };
  const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const won = value => new Intl.NumberFormat('ko-KR').format(value) + '원';
  const container = () => document.getElementById('commission-online');
  const call = (action, data={}) => window.DSService.request('/teacher-commission', {action,...data});
  const login = () => '/auth/?next=' + encodeURIComponent('/app/?teacherMode=commission#teacher');
  const isoDate = value => {const date=new Date(value);return Number.isNaN(date.getTime())?'':date.toLocaleDateString('ko-KR');};
  const fileName = file => file.name + ' (' + (file.size < 1048576 ? Math.ceil(file.size/1024)+' KB' : (file.size/1048576).toFixed(1)+' MB') + ')';
  const message = error => {
    const code=error?.message||'';
    return ({unauthorized:'로그인한 뒤 다시 열어 주세요.',invalid_file:'파일 형식과 크기를 확인해 주세요.',missing_file:'첨부 파일의 전송이 끝난 뒤 다시 접수해 주세요.',quote_changed:'제작비가 변경되었습니다. 금액을 확인하고 다시 결제해 주세요.',price_unavailable:'이 상품은 제작비 확정 후 결제할 수 있습니다. 올린 자료는 초안에 보관됩니다.',invalid_state:'의뢰 상태가 변경되었습니다. 목록을 새로 고침해 주세요.',payment_mode:'결제 환경을 확인할 수 없습니다. 잠시 뒤 다시 시도해 주세요.',payment_unconfirmed:'아직 결제가 확인되지 않았습니다. 의뢰 상태를 확인해 주세요.',payment_retry:'결제 확인 중입니다. 잠시 뒤 결과를 다시 확인해 주세요.',payment_mismatch:'결제 금액을 확인할 수 없습니다. 결제 내역을 확인해 주세요.',upload_failed:'전송하지 못한 파일이 있습니다. 작성 중인 의뢰에서 다시 첨부해 주세요.'})[code] || '처리 결과를 확인하지 못했습니다. 내 제작 의뢰를 새로 고침해 주세요.';
  };
  let orderSdk, mounted, submitting=false, requests=[], refreshEpoch=0, rates=[];
  const findRate=kind=>rates.find(r=>!r.planId&&r.kind===kind&&r.available&&Number.isSafeInteger(r.amount)&&r.amount>0);
  const rateText=r=>[r.unitLabel,r.includedCount&&!r.unitLabel?.includes(String(r.includedCount))?r.includedCount+'문항':'',won(r.amount)].filter(Boolean).join(' · ');
  function showRate(){
    const host=container();if(!host)return;
    const form=host.querySelector('[data-cr-form]'),rate=form&&findRate(form.elements.kind.value);
    if(form){form.querySelector('[data-cr-rate]').textContent=rate?rateText(rate):'이 제작 상품은 가격 확정 후 결제할 수 있습니다.';form.querySelector('button').textContent=rate?'자료 올리고 '+won(rate.amount)+' 결제하기':'의뢰 초안 저장';}
    for(const row of document.querySelectorAll('[data-commission-rate]')){
      const r=findRate(row.dataset.commissionRate);row.textContent=r?rateText(r):'';
    }
  }
  async function loadRates(host){
    try{const result=await window.DSService.request('/teacher-commission',{action:'prices'},false);if(host!==container())return;rates=result.prices||[];}catch{if(host!==container())return;rates=[];}
    showRate();
  }
  document.addEventListener('change',e=>{if(e.target.matches('#commission-online select[name="kind"]'))showRate();});
  const keyFor = new WeakMap();
  async function fileKey(file){
    const bytes = await new Blob([file.name.normalize('NFC'), new Uint8Array([0]), file]).arrayBuffer();
    const digest = new Uint8Array(await crypto.subtle.digest('SHA-256', bytes)).slice(0,16);
    digest[6]=(digest[6]&15)|0x40; digest[8]=(digest[8]&63)|0x80;
    const hex = Array.from(digest, b=>b.toString(16).padStart(2,'0')).join('');
    return [hex.slice(0,8),hex.slice(8,12),hex.slice(12,16),hex.slice(16,20),hex.slice(20)].join('-');
  }
  const paymentReturn = new URLSearchParams(location.search);
  const returning = paymentReturn.get('commissionPayment');
  let callbackDone=false;
  const notice = (text,bad=false) => {const p=container()?.querySelector('[data-cr-note]');if(p){p.textContent=text;p.setAttribute('role',bad?'alert':'status');}};
  function draftForm(){
    return `<form data-cr-form><fieldset><legend>새 제작 의뢰</legend><label>제작 종류<select name="kind"><option value="questions">변형문항</option><option value="mock">모의고사</option></select></label><label>의뢰 제목<input required name="title" maxlength="80" placeholder="예) 공통수학2 기말 대비 모의고사"></label><label>제작 요청<textarea required name="brief" maxlength="1500" rows="3" placeholder="단원, 문항 수, 난이도, 희망 수령일을 적어 주세요."></textarea></label>${fileBox()}<strong data-cr-rate aria-live="polite"></strong><button type="submit">의뢰 초안 저장</button></fieldset></form>`;
  }
  function fileBox(){return '<label>참고 자료<input name="files" type="file" accept=".pdf,.hwpx,.jpg,.jpeg,.png" multiple><small>PDF · HWPX · JPG · PNG, 최대 5개, 파일당 10 MB</small></label>';}
  function renderOrder(r){
    const delivery=(r.files||[]).filter(f=>f.role==='delivery'), sources=(r.files||[]).filter(f=>f.role==='source');
    let actions='';
    if(r.status==='draft')actions=`<form data-cr-resume="${esc(r.id)}">${fileBox()}<button type="submit">${findRate(r.kind)?"첨부 확인하고 결제 단계로":"초안에 파일 저장"}</button></form>`;
    if(r.status==='awaiting_payment' && !r.planId && Number.isSafeInteger(r.amount) && r.amount>0)actions=`<button data-cr-pay="${esc(r.id)}">${won(r.amount)} 결제하기</button>`;
    if(r.status==='confirming')actions='<button type="button" data-cr-check="'+esc(r.id)+'">결제 결과 다시 확인</button>';
    if(r.status==='delivered')actions=delivery.map(f=>`<button data-cr-dl="${esc(f.id)}" data-request="${esc(r.id)}">${esc(fileName(f))} 내려받기</button>`).join('');
    return `<article class="cr-order"><header><h3>${esc(r.title)}</h3><strong>${esc(stateNames[r.status]||'확인 중')}</strong></header><p>${r.kind==='mock'?'모의고사':'변형문항'} · ${esc(isoDate(r.createdAt))}${r.amount?' · '+esc(won(r.amount)):''}</p>${sources.length?`<details><summary>올린 자료 ${sources.length}개</summary><ul>${sources.map(f=>'<li>'+esc(fileName(f))+(r.status==='draft'&&!f.uploaded?' <button type="button" data-cr-remove="'+esc(f.id)+'" data-request="'+esc(r.id)+'">미완료 첨부 삭제</button>':'')+'</li>').join('')}</ul></details>`:''}${r.dueDate?'<p>예정 수령일 '+esc(r.dueDate)+'</p>':''}${r.quoteNote?'<p>'+esc(r.quoteNote)+'</p>':''}${actions}</article>`;
  }
  async function refresh(){
    const epoch=++refreshEpoch, host=container(); if(!host)return;
    try{const result=await call('list');if(host!==container()||epoch!==refreshEpoch)return;requests=result.requests||[];
      host.querySelector('[data-cr-list]').innerHTML=requests.length?requests.map(renderOrder).join(''):'<p>접수한 제작 의뢰가 없습니다.</p>';
    }catch(e){if(host===container()&&epoch===refreshEpoch){host.querySelector('[data-cr-list]').textContent='목록을 불러오지 못했습니다.';notice(message(e),true);}}
  }
  function mount(){
    const host=container();if(!host||host===mounted)return;
    mounted=host;requests=[];refreshEpoch++;loadRates(host);
    if(!window.DSService?.session()){
      host.innerHTML=`<div class="cr-entry"><h2>온라인 제작 의뢰</h2><p>참고 자료를 올리고 선택한 상품의 제작비를 결제하세요. 완성된 문제지와 해설은 내 제작 의뢰에서 받습니다.</p><a class="cr-primary" href="${esc(login())}">로그인하고 의뢰하기</a></div>`;return;
    }
    host.innerHTML=`${draftForm()}<section class="cr-history"><header><h2>내 제작 의뢰</h2><button type="button" data-cr-refresh>새로 고침</button></header><div data-cr-list>의뢰 내역을 불러오는 중입니다.</div></section><p data-cr-note role="status" aria-live="polite"></p>`;
    if(returning&&!callbackDone){finishPayment().catch(async e=>{await refresh();notice(message(e),true);});}else refresh();
  }
  async function finishPayment(){
    if(returning==='success'){
      const amount=Number(paymentReturn.get('amount')),orderId=paymentReturn.get('orderId'),paymentKey=paymentReturn.get('paymentKey');
      if(!Number.isSafeInteger(amount)||amount<1||!orderId||!paymentKey)throw Error('payment_mismatch');
      await call('confirm',{amount,orderId,paymentKey});
      notice('결제가 확인되었습니다. 제작 진행 상황을 이곳에서 확인하세요.');
    }else notice('결제가 완료되지 않았습니다. 내 제작 의뢰에서 다시 결제할 수 있습니다.');
    callbackDone=true;const url=new URL(location.href);
    for(const k of ['commissionPayment','amount','orderId','paymentKey','code','message'])url.searchParams.delete(k);
    history.replaceState(history.state,'',url);await refresh();
  }
  function storageURL(raw){
    const u=new URL(raw);
    if(u.protocol!=='https:'||u.hostname!=='cvlrphtupjmaefahodgz.supabase.co'||!u.pathname.startsWith('/storage/v1/'))throw Error('invalid_file');
    return u.href;
  }
  async function upload(id,file){
    const ticket=await call('upload',{id,fileKey:await fileKey(file),name:file.name,size:file.size});
    if(ticket.uploaded)return;
    const r=await fetch(storageURL(ticket.uploadUrl),{method:'PUT',credentials:'omit',headers:{'Content-Type':'application/octet-stream'},body:file});
    if(!r.ok)throw Error('upload_failed');
  }
  document.addEventListener('submit',async e=>{
    const form=e.target;if(!form.matches('[data-cr-form],[data-cr-resume]'))return;e.preventDefault();if(submitting)return;
    const files=[...form.elements.files.files];
    if(files.length>5||files.some(f=>!f.size||f.size>10*1024*1024||!/[.](?:pdf|hwpx|jpe?g|png)$/i.test(f.name))){notice('지원 형식과 파일당 10 MB, 최대 5개 제한을 확인해 주세요.',true);return;}
    const selectedKind=form.elements.kind?.value||requests.find(r=>r.id===form.dataset.crResume)?.kind;
    const visibleRate=findRate(selectedKind);
    submitting=true;const button=form.querySelector('button');button.disabled=true;notice('의뢰를 접수하는 중입니다.');
    try{
      let id=form.dataset.crResume;
      if(!id){if(!keyFor.has(form))keyFor.set(form,crypto.randomUUID());const data=new FormData(form);
        const result=await call('create',{requestKey:keyFor.get(form),kind:data.get('kind'),title:String(data.get('title')).trim(),brief:String(data.get('brief')).trim()});id=result.request.id;}
      for(const file of files){notice(file.name+' 전송 중');await upload(id,file);}
      keyFor.delete(form);form.reset();
      if(!visibleRate){notice('자료를 초안에 보관했습니다. 제작비가 확정되면 결제할 수 있습니다.');return;}
      const submitted=await call('submit',{id});await refresh();
      if(submitted.request?.amount!==visibleRate.amount||submitted.request?.priceVersion!==visibleRate.version)throw Error('quote_changed');
      notice('제작비 결제창을 엽니다.');await pay(id);
    }catch(err){notice(message(err),true);}finally{submitting=false;button.disabled=false;await refresh();}
  });
  async function sdk(){
    if(window.TossPayments)return window.TossPayments;
    if(!orderSdk)orderSdk=new Promise((ok,no)=>{const el=document.createElement('script');el.src='https://js.tosspayments.com/v2/standard';el.onload=()=>ok(window.TossPayments);el.onerror=()=>{orderSdk=null;no(Error('sdk'));};document.head.append(el);});return orderSdk;
  }
  async function pay(id){
    const item=requests.find(r=>r.id===id&&r.status==='awaiting_payment'&&!r.planId);if(!item)return;
    const [order,config]=await Promise.all([call('checkout',{id}),fetch('/pay-config.json',{cache:'no-store'})]);
    const cfg=config.ok?await config.json():null;
    const keyMode=typeof cfg?.clientKey==='string'?/^(test|live)_ck_[A-Za-z0-9_-]+$/.exec(cfg.clientKey)?.[1]:null;
    if(!keyMode || keyMode!==cfg.PAY_MODE || keyMode!==order.mode)throw Error('payment_mode');
    if(order.amount!==item.amount||!Number.isSafeInteger(order.amount)||order.amount<1){await refresh();throw Error('quote_changed');}
    const url=state=>location.origin+'/app/?teacherMode=commission&commissionPayment='+state+'#teacher';
    const Toss=await sdk();
    await Toss(cfg.clientKey).payment({customerKey:Toss.ANONYMOUS}).requestPayment({method:'CARD',amount:{currency:'KRW',value:order.amount},orderId:order.orderId,orderName:order.orderName,successUrl:url('success'),failUrl:url('fail')});
  }
  document.addEventListener('click',async e=>{
    const btn=e.target.closest('#commission-online button[type="button"],[data-cr-pay],[data-cr-dl]');if(!btn)return;
    btn.disabled=true;
    try{
      if(btn.hasAttribute('data-cr-refresh')){if(returning&&!callbackDone)await finishPayment();else await refresh();}
      else if(btn.dataset.crRemove){await call('remove_file',{id:btn.dataset.request,fileId:btn.dataset.crRemove});await refresh();}
      else if(btn.dataset.crCheck){
        const id=btn.dataset.crCheck;
        if(!requests.some(r=>r.id===id&&r.status==='confirming'))return;
        try{
          const {request}=await call('resume_payment',{id});
          if(request?.id!==id||!['paid','delivered'].includes(request.status))throw Error('payment_unconfirmed');
          notice('결제가 확인되었습니다.');
        }finally{await refresh();}
      }
      else if(btn.dataset.crPay)await pay(btn.dataset.crPay);
      else if(btn.dataset.crDl){const r=await call('download',{id:btn.dataset.request,fileId:btn.dataset.crDl});const a=document.createElement('a');a.href=storageURL(r.url);a.download='';a.click();}
    }catch(err){notice(message(err),true);}finally{btn.disabled=false;}
  });
  document.addEventListener('click',e=>{const b=e.target.closest('[data-commission-kind]');if(!b)return;const selector=container()?.querySelector('[name="kind"]');if(selector){selector.value=b.dataset.commissionKind;showRate();container().querySelector('[name="title"]').focus();}else container()?.querySelector('a')?.focus();});
  new MutationObserver(mount).observe(document.getElementById('content'),{childList:true,subtree:true});
  window.addEventListener('ds-session-change',()=>{mounted=null;mount();});mount();
})();
