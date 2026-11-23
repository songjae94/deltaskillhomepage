(()=>{
'use strict';
const area=document.getElementById('content'),entry=window.DSStudyEntryV54;
if(!area||!entry)return;
const tabs=[['study','공부하기'],['downloads','자료받기'],['timed','타임어택']];
const param=new URLSearchParams(location.search).get('studentMode');
let tab=tabs.some(([key])=>key===param)?param:'study';
let sessionEpoch=0,controller=null,bound=null,accountData=null,loading=null,requestedResume=false;
const signed=()=>Boolean(window.DSService?.session());
const inStudentAccount=()=>location.hash==='#account'&&signed()&&(typeof role==='undefined'||role==='student');
function wrapper(legacy){
 const nav='<nav class="dsh-tabs" aria-label="내신 공부하기 메뉴">'+tabs.map(([key,label])=>'<button data-hub-tab="'+key+'" aria-pressed="'+(tab===key)+'">'+label+'</button>').join('')+'</nav>';
 let body='';
 if(tab==='timed')body=window.DSStudentTimed.render();
 if(tab==='downloads')body=window.DSStudentDownloads.render();
 if(tab==='study'){
 if(!signed())body='<section class="dsh-guest"><small>학생 · 내신 공부하기</small><h1>오늘의 학습 이어하기</h1><p>로그인하면 무료로 문제를 풀고, 틀린 유형을 모아 다시 공부할 수 있어요.</p><a href="#login">로그인하고 공부하기 →</a><button data-hub-tab="timed">무료 타임어택 풀기</button></section>';
 else body=legacy+(legacy.includes('data-sl-view="signed-home"')?'<div data-hub-paths>'+window.DSStudentStudyPaths.render()+'</div>':'');
 }return '<div class="dsh">'+nav+body+'</div>';
}
const render=()=>wrapper(entry.render());
student=render;
entry.setHostRenderer(legacy=>{if(tab!=='study'&&area.querySelector('.dsh-tabs'))return null;if(tab==='study'&&area.querySelector('[data-hub-paths]')&&legacy.includes('data-sl-view="signed-home"')){const t=document.createElement('template');t.innerHTML=legacy;area.querySelector('.student-signed-in')?.replaceWith(t.content);return null;}return wrapper(legacy);});
function update(){if(location.hash==='#student'){area.innerHTML=render();mount();}}
const setTodayText=(el,text)=>{if(el&&el.textContent!==text)el.textContent=text;};
function refreshToday(){
 if(location.hash!=='#student'||tab!=='study'||!signed())return;
 const data=window.DSStudentStudyPaths.snapshot()||accountData?.state;
 const pending=[...Object.entries(data?.pending||{}),...Object.entries(data?.sourcePending||{}).map(([id,p])=>[id,{...p,source:true}])].filter(([,p])=>!p.cleared&&(p.source||Array.isArray(p.pool)&&p.pool.length)).sort((a,b)=>b[1].updatedAt-a[1].updatedAt)[0];
 const legacy=entry.snapshot()?.state?.attempts?.filter(a=>!a.completedAt).sort((a,b)=>b.updatedAt-a.updatedAt)[0];
 const card=area.querySelector('.ssil-today');if(!card)return;
 if(!pending||legacy&&legacy.updatedAt>pending[1].updatedAt){if(card.querySelector('[data-hub-resume]'))entry.refresh();return;}
 const [id,p]=pending,course=window.DSStudentStudyPaths.courses.find(c=>c.id===id);const button=card.querySelector('[data-ssil-continue],[data-hub-resume]');if(!button)return;
 setTodayText(card.querySelector('h2'),(course?.name||'내신 공부')+' · '+(p.source?'풀던 기존 문항':(p.cursor+1)+'번 문제'));
 const label=card.querySelector('.ssil-label');setTodayText(label,p.source?'진행 중 · 기존 자료':'진행 중 · 공통수학2');
 const message=card.querySelector('.ssil-description');setTodayText(message,p.source?'계정에 허용된 기존 문항을 다시 확인하고, 입력한 답을 유지해 이어가요.':'유리함수와 무리함수 · 선택한 답과 확인한 힌트를 유지하고 이어가요.');
 button.removeAttribute('data-ssil-continue');button.removeAttribute('data-sl-sync');button.setAttribute('data-hub-resume','');button.disabled=false;setTodayText(button,'풀던 공부 이어하기 →');
 const progress=card.querySelector('.ssil-progress');if(progress&&p.source)progress.hidden=true;if(progress&&!p.source){const n=progress.querySelector('strong'),bar=progress.querySelector('progress');setTodayText(n,p.cursor+' / '+p.pool.length);if(bar){bar.max=p.pool.length;bar.value=p.cursor;}}
 const sync=card.querySelector('.ssil-sync');setTodayText(sync,data?.storage||'저장된 학습 위치에서 이어가요.');
}
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
 const options={view:history?'history':'home',signedIn:signed,ownerKey:()=>accountData?.ownerKey||'',loadProgress:async()=>accountData?.state||{},onProgress:async next=>{
  guard();if(retryOperation)await send(retryOperation);
  const operation={state:window.DSStudentStudyPaths.mergeProgress(accountData.state,next),expectedVersion:accountData.version,requestId:crypto.randomUUID()};retryOperation=operation;
  const result=await send(operation);refreshToday();return {saved:true,state:result.state};
 }};
 controller=window.DSStudentStudyPaths.bind(el,options);
 if(!accountData?.ownerKey){const notice=document.createElement('p');notice.className='ssp-note';notice.textContent='계정 기록을 불러오지 못했어요. 현재 화면에서 풀 수 있지만 계정 저장은 연결 후 가능해요. ';const retry=document.createElement('button');retry.dataset.hubSync='';retry.textContent='기록 다시 불러오기';notice.append(retry);el.prepend(notice);}
 if(requestedResume&&!history){requestedResume=false;window.DSStudentStudyPaths.resume?.();}
 refreshToday();
}
function mount(){
 refreshToday();
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
document.addEventListener('click',e=>{const resume=e.target.closest('[data-hub-resume]');if(resume){requestedResume=true;if(window.DSStudentStudyPaths.resume())requestedResume=false;return;}if(e.target.closest('[data-hub-sync]')){accountData=null;controller?.();controller=null;bound=null;mount();return;}const b=e.target.closest('[data-hub-tab]');if(b){tab=b.dataset.hubTab;const u=new URL(location.href);u.searchParams.set('studentMode',tab);history.replaceState(history.state,'',u);update();area.querySelector('[data-hub-tab][aria-pressed="true"]')?.focus({preventScroll:true});}});
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
function sessionChanged(){sessionEpoch++;accountData=null;loading=null;controller?.();bound=null;controller=null;update();mount();}
window.addEventListener('ds-session-change',sessionChanged);window.addEventListener('ds-session-ready',()=>{if(!bound)update();});
window.addEventListener('ds-student-paths-change',refreshToday);
new MutationObserver(mount).observe(area,{subtree:true,childList:true});
if(location.hash==='#student')update();else mount();
})();