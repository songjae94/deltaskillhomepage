/* Student shelf contains only server-confirmed purchases and deliveries. */
(()=>{
  'use strict';
  const escape=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[c]);
  const knownCovers=new Set(['NS-CM2-06','NS-CM2-07','NS-CM2B-06','NS-MI1B-05']);
  const date=value=>Number.isFinite(Date.parse(value))?new Intl.DateTimeFormat('ko-KR',{year:'numeric',month:'long',day:'numeric',timeZone:'Asia/Seoul'}).format(new Date(value)):'';
  const disabled=value=>value?' disabled':'';
  function card({title,fileId,meta,actions,format='PDF'}){
    const sku=String(fileId||'').replace(/\.pdf$/i,'');
    const cover=knownCovers.has(sku)?`<img src="public-data/covers/${sku}.webp?v=cover-r2-1125" alt="" width="50" height="71">`:`<span class="sr-format" aria-hidden="true">${escape(format||'파일')}</span>`;
    return `<li class="sr-row">${cover}<div><h4>${escape(title)}</h4><p>${escape(meta.filter(Boolean).join(' · '))}</p><div class="sr-actions">${actions}</div></div></li>`;
  }
  function pointList(rows,busy){
    const heading='<h3>포인트로 받은 교재</h3>';
    if(!rows.length)return heading+'<p>포인트로 구매한 교재가 여기에 보관돼요.</p>';
    return heading+'<ul class="sr-list">'+rows.map(row=>{
      const key=escape(row.receiptId),ready=row.fileStored===true&&row.fileState==='stored'&&row.redownloadable!==false;
      const resume=window.DSReceivedPdf?.hasProgress(row.receiptId);
      const actions=ready?
        `<button type="button" data-ppdf-study="${key}" data-mode="${resume?'resume':'read'}"${disabled(busy)}>${resume?'이어풀기':'바로 풀기'}</button>
          <button type="button" data-ppdf-again="${key}"${disabled(busy)}>다시 받기</button>
          ${window.DSStudentTimed?.canOpenReceived(row)?`<button type="button" data-ppdf-timed="${key}"${disabled(busy)}>타임어택</button>`:'<span>타임어택 문항 연결 준비 중</span>'}`:
        (row.redownloadable===false?'<span>지금은 다시 받을 수 없어요</span>':`<button type="button" data-ppdf-again="${key}"${disabled(busy)}>다시 받기</button><span>보관 상태 확인 필요</span>`);
      return card({title:row.title||row.fileId,fileId:row.fileId,meta:[row.subject,'PDF',row.points.toLocaleString('ko-KR')+' P',date(row.receivedAt)],actions});
    }).join('')+'</ul>';
  }
  window.DSStudentReceipts={pointList};
  const token=()=>window.DSAuth?.get?.()||'';
  const host=()=>document.querySelector('[data-student-acquisitions]');
  let current=null,revision=0;
  const validId=v=>(typeof v==='string'&&v.trim().length>0&&v.length<=160&&!/[\u0000-\u001f]/.test(v))||Number.isSafeInteger(v);
  function purchases(data){
    if(!Array.isArray(data?.library))throw Error('invalid_orders');
    return data.library.flatMap(order=>(Array.isArray(order?.files)?order.files:[]).filter(f=>f&&validId(f.id)&&validId(order.orderId)).map(f=>({
      title:f.title||order.orderName||'구매 자료',format:String(f.fmt||'파일').toUpperCase(),fileId:f.id,
      meta:[order.orderName&&order.orderName!==f.title?order.orderName:'',f.fmt],ready:f.downloadable===true,
      received:f.downloaded===true,body:{action:'download',orderId:order.orderId,fileId:f.id}
    })));
  }
  function monthly(data){
    return window.DSMemberPrints.snapshot(data).received.map(s=>({
      title:s.title||s.setId,format:'PDF',fileId:s.setId,meta:['이용권 프린트',date(s.firstAt)],
      ready:s.fileReady&&s.redownloadable===true,received:true,body:{action:'pass_download',setId:s.setId}
    }));
  }
  function section(state,items,heading){
    if(!items.length)return '';
    return '<h3>'+heading+'</h3><ul class="sr-list">'+items.map(row=>{
      const i=state.rows.indexOf(row),readable=row.format==='PDF'&&row.receiptId;
      const resume=readable&&window.DSReceivedPdf?.hasProgress(row.receiptId);
      const actions=row.ready?
        (readable?`<button type="button" data-sr-mode="${resume?'resume':'read'}" data-sr-index="${i}"${disabled(state.busy)}>${resume?'이어풀기':'바로 풀기'}</button>`:'')+
        `<button type="button" data-sr-mode="download" data-sr-index="${i}"${disabled(state.busy)}>${row.received?'다시 받기':'파일 받기'}</button>`:'<span>현재 다운로드할 수 없어요</span>';
      return card({...row,actions});
    }).join('')+'</ul>';
  }
  function draw(s){
    if(current!==s||s.el!==host()||s.owner!==token())return;
    s.el.innerHTML=section(s,s.orders,'구입한 자료')+section(s,s.prints,'이용권으로 받은 프린트')+
      (s.error?'<p role="status">'+escape(s.error)+' <button type="button" data-sr-refresh>다시 확인</button></p>':'')+
      (s.notice?'<p role="status">'+escape(s.notice)+'</p>':'')+
      (s.url?'<a href="'+escape(s.url)+'" target="_blank" rel="noopener noreferrer">파일 열기 · 저장 ↗</a>':'');
  }
  async function load(el){
    const seq=++revision,s={el,owner:token(),orders:[],prints:[],rows:[],busy:false};current=s;
    if(!window.DSService?.session())return;
    el.innerHTML='<p role="status">구매·수령 내역을 확인하고 있어요.</p>';
    const api=window.DSService;
    const [orders,prints]=await Promise.allSettled([
      api.request('/member-library',{action:'list'}).then(purchases),
      api.request('/member-library',{action:'pass_sets'}).then(monthly)
    ]);
    if(seq!==revision||host()!==el||s.owner!==token())return;
    s.orders=orders.status==='fulfilled'?orders.value:[];
    s.prints=prints.status==='fulfilled'?prints.value:[];
    if(orders.status==='rejected'||prints.status==='rejected')s.error='일부 구매·수령 내역을 불러오지 못했어요.';
    s.rows=[...s.orders,...s.prints];
    draw(s);
    if(!s.rows.some(r=>r.ready&&r.format==='PDF'))return;
    try{
      const {ownerKey}=await window.DSStudentServices.getProgress();
      if(seq!==revision||host()!==el||s.owner!==token()||!/^[a-f0-9]{64}$/.test(ownerKey))return;
      for(const r of s.rows)r.receiptId=r.body.action==='pass_download'?`pass:${ownerKey}:${r.body.setId}`:`order:${ownerKey}:${encodeURIComponent(r.body.orderId)}:${encodeURIComponent(r.fileId)}`;
      draw(s);
    }catch{/* Existing files can still be downloaded when progress is unavailable. */}
  }
  async function openRow(s,row,mode){
    if(s.busy||!row?.ready||!window.DSService?.session()||s.owner!==token())return;
    if(!row.received&&!confirm('처음 파일을 열면 수령 기록이 남고 환불 가능 범위가 달라질 수 있어요. 열까요?'))return;
    const seq=revision;s.busy=true;s.url='';s.notice='파일을 확인하고 있어요.';draw(s);
    try{
      const data=await window.DSService.request('/member-library',row.body);
      if(seq!==revision||current!==s||s.el!==host()||s.owner!==token())return;
      const url=row.body.action==='pass_download'?window.DSMemberPrints.receipt(data,true).url:window.DSPointPdf.safeUrl(data.url);
      if(!url)throw Error('invalid_file');
      row.received=true;
      if(mode==='download'){s.url=url;s.notice='파일이 준비됐어요.';}
      else{
        if(!await window.DSReceivedPdf.open({receiptId:row.receiptId,title:row.title,files:[{fileId:String(row.fileId),title:row.title,url}],resume:mode==='resume'}))throw Error('reader_unavailable');
        s.notice='';
      }
    }catch{s.notice='파일을 열 수 없어요. 수령 내역과 다시 받기 기간을 확인해 주세요.';}
    finally{s.busy=false;draw(s);}
  }
  function mount(){
    const el=host();
    if(!el){if(current){current=null;revision++;}return;}
    if(current?.el===el&&current.owner===token())return;
    el.replaceChildren();load(el);
  }
  document.addEventListener('click',e=>{
    const el=host(),s=current,b=e.target.closest('[data-sr-index],[data-sr-refresh]');
    if(!b||!el?.contains(b)||s?.el!==el||s.owner!==token())return;
    if(b.hasAttribute('data-sr-refresh'))load(el);else openRow(s,s.rows[Number(b.dataset.srIndex)],b.dataset.srMode);
  });
  function reset(){current=null;revision++;mount();}
  for(const evt of ['ds-session-change','ds-session-ready','ds-auth-change'])window.addEventListener(evt,reset);
  window.addEventListener('storage',e=>{if(e.key==='ds_tk')reset();});
  window.addEventListener('ds-received-pdf-progress',()=>{if(current)draw(current);});
  new MutationObserver(mount).observe(document.body,{subtree:true,childList:true});
  mount();
})();
