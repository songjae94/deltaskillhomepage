(() => {
  'use strict';
  const origin = 'https://cvlrphtupjmaefahodgz.supabase.co';
  const $ = id => document.getElementById(id);
  const token = () => sessionStorage.getItem('ds_admin_tk');
  const escape = value => String(value ?? '').replace(/[&<>"']/g, x => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[x]));
  const statuses = {draft:'작성 중',awaiting_payment:'결제 대기',confirming:'결제 확인 중',paid:'결제 완료 · 제작 중',delivered:'납품 완료'};
  const kind = value => ({questions:'변형문항 제작',mock:'모의고사 제작'}[value] || '맞춤 제작');
  const money = value => Number.isSafeInteger(value) ? value.toLocaleString('ko-KR')+'원' : '미확정';
  let lifecycle=0;
  let items = [], offset = 0, selected = null, activeUpload = null, busy = false, authorized = false;
  function notice(text, alert=false) {
    $('message').setAttribute('role',alert?'alert':'status');
    $('message').textContent=text;
    $('retry').hidden=!alert||authorized||!token();
  }
  function clear() {
    authorized=false;
    items=[];offset=0;selected=null;
    $('desk').hidden=true;$('detail').hidden=true;
    $('list').replaceChildren();$('body').replaceChildren();
  }
  async function api(action, data={}, signal) {
    const session=token(), started=lifecycle;
    if(!session){clear();throw Error('login');}
    const res=await fetch(origin+'/functions/v1/teacher-commission',{method:'POST',cache:'no-store',credentials:'omit',referrerPolicy:'no-referrer',signal,
      headers:{Authorization:'Bearer '+session,'Content-Type':'application/json'},body:JSON.stringify({action,...data})});
    if(started!==lifecycle||token()!==session){clear();throw Error('login');}
    if(res.status===401 || res.status===403){clear();throw Error(res.status===401?'login':'forbidden');}
    const result=await res.json();
    if(!res.ok || result.ok===false)throw Error(result.error||'service');
    return result;
  }
  const errors = {
    login:'관리자 홈에서 로그인한 뒤 다시 열어 주세요.',forbidden:'본부 운영자 권한이 필요합니다. 관리자 홈에서 로그인 상태를 확인해 주세요.',
    wrong_state:'처리 중 상태가 바뀌었습니다. 새로 고침해 주세요.',not_found:'파일이나 의뢰를 찾을 수 없습니다. 새로 고침해 주세요.',
    file_limit_or_state:'납품 가능 상태와 첨부 개수를 확인해 주세요.',invalid_file:'파일 형식과 크기를 확인해 주세요.',file_format:'파일 내용이 확장자와 맞지 않습니다. 파일을 제외하고 올바른 파일을 선택해 주세요.',
    file_size_mismatch:'파일 크기가 다릅니다. 해당 파일을 제외하고 다시 첨부해 주세요.',files_pending:'납품할 파일의 업로드를 먼저 마쳐 주세요.',
    upload_missing:'파일을 다시 선택해 업로드해 주세요.',upload_failed:'업로드를 마치지 못했습니다. 같은 파일로 다시 시도해 주세요.',
    transfer_unknown:'저장 확인을 마치지 못했습니다. 같은 파일로 다시 시도해 주세요.',storage_unavailable:'파일 저장소에 연결할 수 없습니다. 잠시 뒤 다시 시도해 주세요.'
  };
  async function act(task) {
    if(busy)return;
    busy=true;updateBusy();
    try{await task();}
    catch(e){notice(e.name==='AbortError'?'전송을 취소했습니다. 같은 파일로 다시 시도할 수 있습니다.':errors[e.message]||'처리 결과를 확인하지 못했습니다. 새로 고침한 뒤 다시 시도해 주세요.',true);}
    finally{busy=false;activeUpload=null;updateBusy();}
  }
  function updateBusy() {
    $('desk').setAttribute('aria-busy',String(busy));
    for(const el of $('desk').querySelectorAll('button,input')) {
      if(el.id==='cancel-upload'){el.hidden=!activeUpload;el.disabled=!activeUpload;}
      else el.disabled=busy;
    }
  }
  function renderList() {
    $('list').innerHTML=items.length ? items.map(r=>'<button class="request" data-open="'+escape(r.id)+'" aria-current="'+String(r.id===selected?.id)+'"><b>'+escape(r.title)+'</b><small>'+escape(kind(r.kind))+' · '+escape(statuses[r.status]||'상태 확인 필요')+'</small></button>').join(''):'<p>접수된 제작 의뢰가 없습니다.</p>';
  }
  function fileLines(files, editable=false) {
    return files.length ? files.map(f=>'<div class="file"><span>'+escape(f.name)+' <small>'+Math.ceil(f.size/1024).toLocaleString('ko-KR')+' KB</small></span>'+
      (f.uploaded?'<button data-download="'+escape(f.id)+'">받기</button>':'<small>전송 확인 전</small>')+
      (editable?'<button data-remove="'+escape(f.id)+'">제외</button>':'')+'</div>').join(''):'<p class="sub">첨부된 파일이 없습니다.</p>';
  }
  function showDetail(r) {
    selected=r;
    const sources=(r.files||[]).filter(f=>f.role==='source'), results=(r.files||[]).filter(f=>f.role==='delivery'), paid=r.status==='paid';
    $('body').innerHTML='<h3 class="text">'+escape(r.title)+'</h3><p>'+escape(kind(r.kind))+' · '+escape(statuses[r.status]||'상태 확인 필요')+'</p><p>접수 금액 <strong>'+escape(money(r.amount))+'</strong></p>'+
      (r.unitLabel?'<p>접수 단위 '+escape(r.unitLabel)+(Number.isSafeInteger(r.includedCount)?' · 포함 문항 '+r.includedCount+'개':'')+'</p>':'')+
      '<h3>제작 요청과 범위</h3><p class="text">'+escape(r.brief)+'</p><h3>접수 원본</h3>'+fileLines(sources)+
      '<h3>납품 파일</h3>'+fileLines(results,paid)+
      (paid?'<form id="upload-form"><fieldset><legend>납품 파일 준비</legend><label>파일 선택<input name="files" type="file" required multiple accept=".pdf,.hwpx,.png,.jpg,.jpeg"></label><small>PDF · HWPX · JPG · PNG, 최대 5개, 파일당 10 MB</small><div class="actions"><button type="submit">파일 올리기</button><button type="button" id="cancel-upload" hidden>전송 취소</button></div></fieldset></form>':'')+
      (paid&&results.length&&results.every(f=>f.uploaded)?'<p><button class="primary" id="deliver">회원에게 납품하기</button></p>':'');
    $('detail').hidden=false;
    const index=items.findIndex(item=>item.id===r.id);
    if(index>=0)items[index]=r;
    renderList();updateBusy();
  }
  async function readList(more=false) {
    if(!more)clear();
    const page=await api('adminList',{offset:more?offset:0});
    if(!Array.isArray(page.requests))throw Error('service');
    if(!more)items=[];
    for(const r of page.requests)if(!items.some(i=>i.id===r.id))items.push(r);
    offset=(more?offset:0)+page.requests.length;
    authorized=true;$('desk').hidden=false;$('more').hidden=page.requests.length<40;
    renderList();notice('접수 목록 '+items.length+'건');
  }
  async function detail(id,focus=false) {
    const {request}=await api('adminDetail',{id});
    if(request?.id!==id)throw Error('service');
    showDetail(request);
    if(focus)$('detail-title').focus();
  }
  async function fileKey(file) {
    const bytes=await new Blob([file.name.normalize('NFC'),new Uint8Array([0]),file]).arrayBuffer();
    const hash=new Uint8Array(await crypto.subtle.digest('SHA-256',bytes)).slice(0,16);
    hash[6]=(hash[6]&15)|0x40;hash[8]=(hash[8]&63)|0x80;
    const hex=Array.from(hash,b=>b.toString(16).padStart(2,'0')).join('');
    return [hex.slice(0,8),hex.slice(8,12),hex.slice(12,16),hex.slice(16,20),hex.slice(20)].join('-');
  }
  function signed(raw) {
    const url=new URL(raw);
    if(url.origin!==origin||!url.pathname.startsWith('/storage/v1/object/')||url.username||url.password)throw Error('service');
    return url.href;
  }
  async function upload(files,id) {
    if(!files.length||files.length>5||files.some(f=>!f.size||f.size>10*1024*1024||!/[.](pdf|hwpx|png|jpe?g)$/i.test(f.name)))throw Error('invalid_file');
    activeUpload=new AbortController();updateBusy();
    const signal=activeUpload.signal;
    for(const file of files){
      const args={id,name:file.name,size:file.size,fileKey:await fileKey(file)};
      notice(file.name+' 전송 중');
      const ticket=await api('deliveryUpload',args,signal);
      if(ticket.uploaded)continue;
      const sent=await fetch(signed(ticket.uploadUrl),{method:'PUT',headers:{'Content-Type':'application/octet-stream'},credentials:'omit',referrerPolicy:'no-referrer',signal,body:file});
      if(!sent.ok)throw Error('upload_failed');
      if(!(await api('deliveryUpload',args,signal)).uploaded)throw Error('transfer_unknown');
    }
    await detail(id);notice('파일 저장을 확인했습니다. 목록을 확인한 뒤 납품해 주세요.');
  }
  $('desk').addEventListener('submit',event=>{
    if(event.target.id!=='upload-form')return;
    event.preventDefault();
    if(authorized&&selected?.status==='paid'){const files=[...event.target.elements.files.files],id=selected.id;act(()=>upload(files,id));}
  });
  $('desk').addEventListener('click',event=>{
    const button=event.target.closest('button');
    if(!button)return;
    if(button.id==='cancel-upload'){activeUpload?.abort();return;}
    if(!authorized)return;
    if(button.id==='refresh'){act(()=>readList());return;}
    if(button.id==='more'){act(()=>readList(true));return;}
    if(button.dataset.open){act(()=>detail(button.dataset.open,true));return;}
    const r=selected;if(!r)return;
    if(button.dataset.download)act(async()=>{
      const {url}=await api('adminDownload',{id:r.id,fileId:button.dataset.download});
      const a=document.createElement('a');a.href=signed(url);a.download='';a.target='_blank';a.rel='noopener noreferrer';document.body.append(a);a.click();a.remove();
    });
    if(r.status!=='paid')return;
    if(button.dataset.remove&&confirm('이 파일을 납품 목록에서 제외할까요?'))act(async()=>{const {request}=await api('admin_remove_file',{id:r.id,fileId:button.dataset.remove});showDetail(request);notice('납품 목록에서 파일을 제외했습니다.');});
    if(button.id==='deliver'&&confirm('회원이 이 파일을 받을 수 있도록 납품할까요?'))act(async()=>{const {request}=await api('deliver',{id:r.id});showDetail(request);notice('납품했습니다. 회원이 완성 파일을 받을 수 있습니다.');});
  });
  $('retry').addEventListener('click',()=>act(()=>readList()));
  window.addEventListener('pagehide',()=>{lifecycle++;activeUpload?.abort();clear();});
  window.addEventListener('pageshow',event=>{if(event.persisted)act(()=>readList());});
  act(()=>readList());
})();
