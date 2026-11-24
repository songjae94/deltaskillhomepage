(()=>{
'use strict';
const area=document.getElementById('content'),entry=window.DSStudyEntryV54;
if(!area||!entry)return;
const tabs=[
 ['study','공부하기','M3 5h6c2 0 3 1 3 2 0-1 1-2 3-2h6v14h-6c-2 0-3 1-3 2 0-1-1-2-3-2H3zM12 7v14'],
 ['downloads','자료받기','M12 3v12m-5-5 5 5 5-5M4 16v5h16v-5'],
 ['timed','타임어택','M9 2h6m-3 0v3m7 2 2-2M12 9v5l3 1M20 14a8 8 0 1 1-16 0 8 8 0 0 1 16 0']
];
const param=new URLSearchParams(location.search).get('studentMode');
let tab=tabs.some(([key])=>key===param)?param:'study';
let guestSubject='대수',guestChoice=null;
let csatPractice=null,csatArrived=false;
let sessionEpoch=0,controller=null,bound=null,accountData=null,loading=null;
const signed=()=>Boolean(window.DSService?.session());
const inStudentAccount=()=>location.hash==='#account'&&signed()&&(typeof role==='undefined'||role==='student');
function wrapper(legacy){
 const buttons=tabs.map(([key,label,path])=>`<button type="button" data-hub-tab="${key}" aria-pressed="${tab===key}"><span class="tb36-mode-icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="${path}"/></svg></span><strong>${label}</strong></button>`);
 const nav='<div class="dsh-navigation"><nav class="tb36-modes dsh-tabs" aria-label="내신 공부하기 메뉴">'+buttons.join('')+'</nav></div>';
 let body='';
 if(tab==='timed')body=window.DSStudentTimed.render();
 if(tab==='downloads')body=window.DSStudentDownloads.render();
 if(tab==='study'){
 if(signed()&&legacy.includes('data-sl-view="signed-home"'))return '<div class="dsh">'+nav+'<div data-hub-paths>'+window.DSStudentStudyPaths.render({view:'desk'})+'</div></div>';
 if(!signed())body=entry.renderGuestDesk(guestSubject,guestChoice)||legacy;
 else body=legacy;
 }return '<div class="dsh">'+nav+body+'</div>';
}
const render=()=>wrapper(entry.render());
student=render;
entry.setHostRenderer(legacy=>{
 if(tab!=='study'&&area.querySelector('.dsh-tabs'))return null;
 if(tab==='study'&&area.querySelector('[data-hub-paths]')&&legacy.includes('data-sl-view="signed-home"'))return null;
 return wrapper(legacy);
});
function update(){if(location.hash==='#student'){area.innerHTML=render();mount();}}
function bindCourse(el,history=false){
 if(bound===el)return;
 controller?.();bound=el;
 const epoch=sessionEpoch;let retryOperation=null;
 const guard=()=>{if(epoch!==sessionEpoch||!signed()||!accountData?.ownerKey||!window.DSStudentServices)throw Error('다시 로그인해 주세요.');};
 async function send(operation){
  for(let tries=0;tries<4;tries++){
   guard();try{const result=await DSStudentServices.saveProgress(operation.state,{courseId:'student-paths-v1',expectedVersion:operation.expectedVersion,requestId:operation.requestId});guard();if(result.ownerKey!==accountData.ownerKey)throw Error('session_changed');accountData={...accountData,...result};retryOperation=null;return result;}
   catch(error){if(error.code!=='version_conflict'||tries===3)throw error;if(error.ownerKey&&error.ownerKey!==accountData.ownerKey)throw Error('session_changed');operation={state:window.DSStudentStudyPaths.mergeProgress(error.state,operation.state),expectedVersion:error.version,requestId:crypto.randomUUID()};retryOperation=operation;}
  }
 }
 const options={view:history?'history':'desk',signedIn:signed,ownerKey:()=>accountData?.ownerKey||'',loadProgress:async()=>accountData?.state||{},onProgress:async next=>{
  guard();if(retryOperation)await send(retryOperation);
  const operation={state:window.DSStudentStudyPaths.mergeProgress(accountData.state,next),expectedVersion:accountData.version,requestId:crypto.randomUUID()};retryOperation=operation;
  const result=await send(operation);return {saved:true,state:result.state};
 }};
 controller=window.DSStudentStudyPaths.bind(el,options);
 if(!accountData?.ownerKey){const notice=document.createElement('p');notice.className='ssp-note';notice.textContent='계정 기록을 불러오지 못했어요. 현재 화면에서 풀 수 있지만 계정 저장은 연결 후 가능해요. ';const retry=document.createElement('button');retry.dataset.hubSync='';retry.textContent='기록 다시 불러오기';notice.append(retry);el.prepend(notice);}
}
function mount(){
 if(csatArrived&&csatPractice&&location.hash==='#student'&&signed()){
  const id=csatPractice,phase=entry.snapshot().cloud.phase;
  if(phase==='ready'||phase==='saving'){csatPractice=null;entry.openPractice(id);return;}
 }
 if(bound&&!bound.isConnected){controller?.();controller=null;bound=null;}
 if(location.hash==='#student'&&tab==='timed'&&area.querySelector('.ds-timed')){window.DSStudentTimed.mount?.();return;}
 if(location.hash==='#student'&&tab==='downloads'){const dl=area.querySelector('.sd-downloads');if(dl&&!dl.dataset.hubMounted){dl.dataset.hubMounted='true';window.DSStudentDownloads.mount(dl);}return;}
 let el=area.querySelector('[data-hub-paths]');const account=inStudentAccount();
 if(account){const root=area.querySelector('.student-account-signed-in');if(root&&!root.querySelector('[data-path-history]')){const div=document.createElement('div');div.setAttribute('data-path-history','');div.innerHTML=window.DSStudentStudyPaths.render({view:'history'});root.append(div);}el=area.querySelector('[data-path-history]');
   if(root&&!root.querySelector('[data-time-history]')){
     const section=document.createElement('section');section.dataset.timeHistory='';section.className='ssp-panel';
     section.innerHTML='<h2>내 타임어택</h2><button data-time-history-load>이전 세트와 포인트 내역 보기</button><div aria-live="polite"></div>';root.append(section);
   }
 }
 if(!el||!signed()||bound===el)return;
 if(!accountData&&!loading&&window.DSStudentServices){const epoch=sessionEpoch;loading=Promise.resolve().then(()=>DSStudentServices.getProgress('student-paths-v1')).then(x=>{if(epoch===sessionEpoch)accountData=x;}).catch(()=>{if(epoch===sessionEpoch)accountData={};}).finally(()=>{if(epoch===sessionEpoch){loading=null;mount();}});return;}
 if(!loading)bindCourse(el,account);
}
document.addEventListener('click',e=>{if(e.target.closest('[data-csat-first-question]')){
  if(!signed()){location.hash='#login';return;}
  csatPractice='SNG-2024-M11#공통#1';csatArrived=false;tab='study';
  const u=new URL(location.href);u.searchParams.set('studentMode',tab);history.replaceState(history.state,'',u);location.hash='#student';return;
 }
 const subject=e.target.closest('[data-hub-guest-subject]'),choice=e.target.closest('[data-hub-guest-choice]');
 if(subject){guestSubject=subject.dataset.hubGuestSubject;guestChoice=null;update();area.querySelector('[data-hub-guest-subject][aria-pressed=true]')?.focus({preventScroll:true});return;}
 if(choice){guestChoice=Number(choice.dataset.hubGuestChoice);for(const key of area.querySelectorAll('[data-hub-guest-choice]'))key.setAttribute('aria-pressed',String(key===choice));return;}
 if(e.target.closest('[data-hub-sync]')){accountData=null;controller?.();controller=null;bound=null;mount();return;}const b=e.target.closest('[data-hub-tab]');if(b){tab=b.dataset.hubTab;const u=new URL(location.href);u.searchParams.set('studentMode',tab);history.replaceState(history.state,'',u);update();area.querySelector('[data-hub-tab][aria-pressed="true"]')?.focus({preventScroll:true});}});
document.addEventListener('click',async event=>{
 const button=event.target.closest('[data-time-history-load],[data-time-history-id]');
 if(!button||!signed()||!inStudentAccount())return;
 if(button.dataset.timeHistoryId){
   tab='timed';const url=new URL(location.href);url.searchParams.set('studentMode',tab);url.hash='student';
   history.pushState(null,'',url);update();await window.DSStudentTimed.openSaved(button.dataset.timeHistoryId);return;
 }
 const section=button.closest('[data-time-history]'),list=section.querySelector('[aria-live]'),generation=sessionEpoch;
 button.disabled=true;
 try{
   const result=await DSStudentServices.history({kind:'timeattack',limit:10,...(button.dataset.before?{before:button.dataset.before}:{})});
   if(generation!==sessionEpoch||!section.isConnected)return;
   if(!button.dataset.before)list.replaceChildren();
   if(!result.records.length&&!button.dataset.before)list.textContent='아직 시작한 맞춤 세트가 없어요.';
   for(const row of result.records){
     const action=document.createElement('button');action.dataset.timeHistoryId=row.setId;
     const date=new Intl.DateTimeFormat('ko-KR',{month:'long',day:'numeric',timeZone:'Asia/Seoul'}).format(new Date(row.at));
     action.textContent=date+' · '+row.total+'문항 · '+row.charged+'P · '+(row.status==='running'?'이어 풀기':'채점 결과 보기');list.append(action);
   }
   button.hidden=!result.hasMore;button.dataset.before=result.nextBefore||'';button.textContent='이전 세트 더 보기';
 }catch{if(generation===sessionEpoch&&section.isConnected){button.textContent='타임어택 내역 다시 불러오기';}}
 finally{button.disabled=false;}
});
window.addEventListener('ds-student-downloads-change',()=>{if(location.hash==='#student'&&tab!=='downloads'){tab='downloads';update();}});
window.addEventListener('ds-study-change',()=>{if(csatPractice&&csatArrived)mount();});
window.addEventListener('hashchange',()=>{csatArrived=location.hash==='#student';if(!csatArrived)csatPractice=null;else if(csatPractice)mount();});
function sessionChanged(){csatPractice=null;sessionEpoch++;accountData=null;loading=null;controller?.();bound=null;controller=null;update();mount();}
window.addEventListener('ds-session-change',sessionChanged);window.addEventListener('ds-session-ready',()=>{if(!bound)update();});
new MutationObserver(mount).observe(area,{subtree:true,childList:true});
if(location.hash==='#student')update();else mount();
})();