(()=>{
'use strict';
const area=document.getElementById('content'),entry=window.DSStudyEntryV54;
if(!area||!entry)return;
const tabs=[
 ['study','공부하기','M3 5h6c2 0 3 1 3 2 0-1 1-2 3-2h6v14h-6c-2 0-3 1-3 2 0-1-1-2-3-2H3zM12 7v14'],
 ['downloads','자료받기','M12 3v12m-5-5 5 5 5-5M4 16v5h16v-5'],
 ['create','자료만들기','M7 3h10v5H7zM6 17H4V9h16v8h-2M7 14h10v7H7zM16 11h1'],
 ['timed','타임어택','M9 2h6m-3 0v3m7 2 2-2M12 9v5l3 1M20 14a8 8 0 1 1-16 0 8 8 0 0 1 16 0']
];
function currentMode(){
 const params=new URLSearchParams(location.search),mode=params.get('studentMode');
 if(mode==='downloads'&&params.get('downloadPane')==='print')return 'create';
 return tabs.some(([key])=>key===mode)?mode:'study';
}
let tab=currentMode(),initialSessionReady=false;
if(location.hash==='#student'&&tab==='study'&&(!window.DSStudentStudyPaths||!window.DSStudentStudyPlan))return;
let csatPractice=null,csatArrived=false;
let sessionEpoch=0,controller=null,bound=null,accountData=null,loading=null;
const signed=()=>Boolean(window.DSService?.session());
const inStudentAccount=()=>location.hash==='#account'&&signed()&&(typeof role==='undefined'||role==='student');
function wrapper(legacy){
 const buttons=tabs.map(([key,label,path])=>`<button type="button" data-hub-tab="${key}" aria-pressed="${tab===key}"><span class="tb36-mode-icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="${path}"/></svg></span><strong>${label}</strong></button>`);
 const freeStudyNote=tab==='study' && Date.now()<Date.parse('2027-01-01T00:00:00+09:00')
  ? `<p class="dsh-free-study">12월 31일까지 내신 화면 학습 무료 · ${signed()?'제출한 풀이는 계정에 저장돼요.':'공부 기록을 저장하고 다음에 이어서 풀려면 로그인하세요.'}</p>` : '';
 const nav='<div class="dsh-navigation"><nav class="tb36-modes dsh-tabs" aria-label="내신 공부하기 메뉴">'+buttons.join('')+'</nav>'+freeStudyNote+'</div>';
 let body='';
 if(tab==='timed')body=window.DSStudentTimed.render();
 if(tab==='downloads'||tab==='create')body=window.DSStudentDownloads.render(tab==='create'?'print':'store');
 if(tab==='study'){
 if(!signed()||legacy.includes('data-sl-view="signed-home"'))return '<div class="dsh">'+nav+'<div data-hub-paths>'+window.DSStudentStudyPaths.render({view:'desk'})+'</div></div>';
 body=legacy;
 }return '<div class="dsh">'+nav+body+'</div>';
}
const render=()=>wrapper(tab==='study'&&signed()?entry.render():'');
student=render;
entry.setHostRenderer(legacy=>{
 if(tab!=='study'&&area.querySelector('.dsh-tabs'))return null;
 if(tab==='study'&&area.querySelector('[data-hub-paths]')&&(!signed()||legacy.includes('data-sl-view="signed-home"')))return null;
 return wrapper(legacy);
});
function update(){if(location.hash==='#student'){area.innerHTML=render();mount();}}
function bindCourse(el,history=false){
 if(bound===el)return;
 controller?.();bound=el;
 const epoch=sessionEpoch;let retryOperation=null;
 const guard=()=>{if(epoch!==sessionEpoch||!signed()||!accountData?.ownerKey||!window.DSStudentServices)throw Error('다시 로그인해 주세요.');};
 async function send(operation,keepalive=false){
  for(let tries=0;tries<4;tries++){
   guard();try{const result=await DSStudentServices.saveProgress(operation.state,{courseId:'student-paths-v1',expectedVersion:operation.expectedVersion,requestId:operation.requestId,keepalive});guard();if(result.ownerKey!==accountData.ownerKey)throw Error('session_changed');accountData={...accountData,...result};retryOperation=null;return result;}
   catch(error){if(error.code!=='version_conflict'||tries===3)throw error;if(error.ownerKey&&error.ownerKey!==accountData.ownerKey)throw Error('session_changed');operation={state:window.DSStudentStudyPaths.mergeProgress(error.state,operation.state),expectedVersion:error.version,requestId:crypto.randomUUID()};retryOperation=operation;}
  }
 }
 const options={view:history?'history':'desk',signedIn:signed,ownerKey:()=>accountData?.ownerKey||'',loadProgress:async()=>accountData?.state||{},onProgress:async (next,meta)=>{
  guard();const keepalive=Boolean(meta?.keepalive);if(retryOperation)await send(retryOperation,keepalive);
  const operation={state:window.DSStudentStudyPaths.mergeProgress(accountData.state,next),expectedVersion:accountData.version,requestId:crypto.randomUUID()};retryOperation=operation;
  const result=await send(operation,keepalive);return {saved:true,state:result.state,localOnly:result.localOnly};
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
 if(location.hash==='#student'&&(tab==='downloads'||tab==='create')){const dl=area.querySelector('.sd-downloads');if(dl&&!dl.dataset.hubMounted){dl.dataset.hubMounted='true';window.DSStudentDownloads.mount(dl);}return;}
 let el=area.querySelector('[data-hub-paths]');const account=inStudentAccount();
 if(account){const root=area.querySelector('.student-account-signed-in');
   const section=root?.querySelector('#account-study');
   if(section&&!section.querySelector('[data-path-history]')){
     const div=document.createElement('div');div.setAttribute('data-path-history','');
     div.innerHTML=window.DSStudentStudyPaths.render({view:'history'});
     const heading=section.querySelector('.account-section-heading');
     if(heading)heading.after(div);else section.prepend(div);
   }
   el=section?.querySelector('[data-path-history]');
   if(root&&!root.querySelector('[data-time-history]')){
     const section=document.createElement('section');section.dataset.timeHistory='';section.className='ssp-panel';
     section.innerHTML='<h2>내 타임어택</h2><button data-time-history-load>이전 세트와 포인트 내역 보기</button><div aria-live="polite"></div>';root.append(section);
   }
 }
 // Restore the guest desk if an older route renderer finished after the hub.
 // The data-hub-paths container is also the binding guard for repeated renders.
 if(!el&&location.hash==='#student'&&tab==='study'&&!signed()&&
    area.querySelector('[data-hub-study-pending],.fv57-shell')){
  area.innerHTML=render();
  el=area.querySelector('[data-hub-paths]');
 }
 if(!el||bound===el)return;
 if(!signed()){
  if(!initialSessionReady)return;
  controller?.();bound=el;
  controller=window.DSStudentStudyPaths.bind(el,{view:'desk',guestTrial:true,signedIn:false});
  return;
 }
 if(!accountData&&!loading&&window.DSStudentServices){
  const epoch=sessionEpoch,done=window.DSWaitStatus?.begin('계정의 학습 기록을 불러오고 있어요.');
  loading=Promise.resolve().then(()=>DSStudentServices.getProgress('student-paths-v1')).then(x=>{
   if(epoch===sessionEpoch)accountData=x;
  }).catch(()=>{if(epoch===sessionEpoch)accountData={};}).finally(()=>{
   done?.();if(epoch===sessionEpoch){loading=null;mount();}
  });return;
 }
 if(!loading)bindCourse(el,account);
}
document.addEventListener('click',e=>{
 if(e.target.closest('[data-hub-study-link]')){
  tab='study';const url=new URL(location.href);url.searchParams.set('studentMode',tab);history.replaceState(history.state,'',url);
  if(location.hash==='#student'&&!area.querySelector('[data-hub-paths]'))update();
 }
 if(e.target.closest('[data-csat-first-question]')){
  if(!signed()){location.hash='#login';return;}
  csatPractice='SNG-2024-M11#공통#1';csatArrived=false;tab='study';
  const u=new URL(location.href);u.searchParams.set('studentMode',tab);history.replaceState(history.state,'',u);location.hash='#student';return;
 }
 if(e.target.closest('[data-hub-sync]')){accountData=null;controller?.();controller=null;bound=null;mount();return;}const b=e.target.closest('[data-hub-tab]');
 if(b){
  const next=b.dataset.hubTab;
  if(tab==='create'&&next!=='create')window.DSDrawTeacherV59?.suspendStudent?.();
  const u=new URL(location.href);u.searchParams.set('studentMode',next);u.searchParams.delete('downloadPane');
  if(next==='downloads')for(const key of ['studyBook','studyUnit','studyLocal'])u.searchParams.delete(key);
  tab=next;history.replaceState(history.state,'',u);update();
  area.querySelector('[data-hub-tab][aria-pressed="true"]')?.focus({preventScroll:true});
 }
});
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
window.addEventListener('ds-student-downloads-change',event=>{
 if(location.hash!=='#student')return;
 const next=event.detail.pane==='print'?'create':'downloads';
 if(tab==='create'&&next!=='create')window.DSDrawTeacherV59?.suspendStudent?.();
 tab=next;update();
});
window.addEventListener('popstate',()=>{
 if(location.hash!=='#student')return;
 const next=currentMode();
 if(tab==='create'&&next!==tab)window.DSDrawTeacherV59?.suspendStudent?.();
 tab=next;update();
});
window.addEventListener('ds-study-change',()=>{if(csatPractice&&csatArrived)mount();});
window.addEventListener('hashchange',()=>{csatArrived=location.hash==='#student';if(!csatArrived)csatPractice=null;else if(csatPractice)mount();});
/* 11/25 60: 다른 저장 길(공부 계획 저장)이 올린 진행 판을 받아 둔다 — 낡은 판으로 보내 409 가 나던 것(부딪침 길은 그대로) */
addEventListener('ds-progress-saved',e=>{const d=e.detail;if(accountData?.ownerKey&&d?.ownerKey===accountData.ownerKey&&Number.isSafeInteger(d.version)&&d.version>(accountData.version||0))accountData={...accountData,...d};});
function sessionChanged(){csatPractice=null;sessionEpoch++;accountData=null;loading=null;controller?.();bound=null;controller=null;update();mount();}
window.addEventListener('ds-session-change',sessionChanged);window.addEventListener('ds-session-ready',()=>{if(!bound)update();});
new MutationObserver(mount).observe(area,{subtree:true,childList:true});
Promise.resolve(window.DSService?.ready).then(()=>{initialSessionReady=true;mount();});
if(location.hash==='#student')update();else mount();
})();