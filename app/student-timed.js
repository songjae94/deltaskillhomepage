(()=>{
'use strict';
function createRunner(csat){
const bank=window.DSFinalPracticeBank;
const byId=new Map(bank.map(q=>[q.id,q]));
const gradeNames=['','공통수학2','미적분Ⅰ'];
const escape=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
// v66: shared preprocessor · R5 marks · counted failures (math-typeset-v66.js), same as every other surface.
const math=s=>window.DSMathTypeset?window.DSMathTypeset.dollars(s,escape):String(s).split('$').map((part,i)=>i%2?katex.renderToString(part,{throwOnError:false,trust:false,output:'htmlAndMathml'}):escape(part)).join('');
const signed=()=>Boolean(window.DSService?.session());
const service=()=>window.DSStudentServices;
const gradeBank=()=>bank.filter(q=>q.grade===grade);
const subjects=['공통수학2','미적분Ⅰ','기하','확률과 통계'];
const presets=[10,20,25];
let currentSubject=subjects[0],dialogMode='';
let grade=1,level='',unit='',book='',count=10,minutes=20,active=null,quote=null,selection=[],busy=false,notice='',epoch=0;
const space=csat?'csat':'school';
const guestLoginUrl=csat?'/auth/?next='+encodeURIComponent('/app/?csatMode=mock#csat'):'#login';
const scope='.ds-timed[data-timed-space="'+space+'"]';
const label=q=>gradeNames[q.grade]+' · '+q.unit;
function accountChanged(){currentSubject=subjects[0];grade=1;book='';unit='';type='';level='';count=10;minutes=20;exam.reset();dialogMode='';receivedSource=null;epoch++;seq++;remote=null;remoteStatus='';resources.clear();catalogById.clear();active=null;quote=null;notice='';busy=false;selection=[];}
let previousMember=signed(),claiming=false;
const resultKey='ds-school-timed-submit-v1';
let resultCache;
const fixedStorage=()=>csat?localStorage:sessionStorage;
function logoutMarker(){
 try{return localStorage.getItem('ds_logout_epoch')||'';}catch{return '';}
}
function resultTicket(){
 if(resultCache!==undefined)return resultCache;
 try{return resultCache=JSON.parse(sessionStorage.getItem(resultKey));}catch{return resultCache=null;}
}
let submittingTicket=null;
function loginTicket(){
 if(csat||location.hash!=='#login')return null;
 const ticket=resultTicket();
 return ticket?.id&&new URLSearchParams(location.search).get('trialLogin')===ticket.id?ticket:null;
}
if(loginTicket()&&!signed())window.DSLoginReturn='#student';
function replaceTrialQuery(key,value){
 const url=new URL(location.href);url.searchParams.delete('trialLogin');url.searchParams.delete('trialResult');
 if(key)url.searchParams.set(key,value);
 history.replaceState(history.state,'',url);
}
document.addEventListener('submit',event=>{
 if(!csat&&event.target.id==='login-form')submittingTicket=loginTicket()?.id||null;
},true);
document.addEventListener('click',event=>{
 const ticket=loginTicket(),link=event.target.closest?.('a[href]');
 if(!ticket||!link)return;
 const url=new URL(link.href);
 if(url.origin!==location.origin||url.pathname!=='/auth/')return;
 url.searchParams.set('next','/app/?studentMode=timed&trialResult='+ticket.id+'#student');
 link.href=url.href;
},true);
window.addEventListener('hashchange',()=>{
 if(csat||location.hash==='#login')return;
 submittingTicket=null;
 if(new URLSearchParams(location.search).has('trialLogin'))replaceTrialQuery();
});
function setTicket(ticket){
 resultCache=ticket;
 try{if(ticket)sessionStorage.setItem(resultKey,JSON.stringify(ticket));else sessionStorage.removeItem(resultKey);}catch{}
}
function clearTrial(){
 if(csat)return;
 setTicket(null);
 try{for(const g of [1,2])sessionStorage.removeItem(fixedKey(g));}catch{}
 writeRunning(null);
}
// H28-1(지휘 106): 회원 맞춤 세트는 서버에만 있어 새로고침하면 화면이 잃었다. 이 탭에 세트 번호 · 아직 저장 안 된 답만 둔다
// (토큰은 남기지 않고 토큰 지문으로 주인을 가림 · 로그아웃 · 회원 바뀜이면 지움). 세트 · 시간 · 답의 정본은 그대로 서버.
const runningKey='ds-school-timed-running-v1',SET_ID=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
let ownerMemo={token:null,value:''},autoResumed=false,resuming=false;
function readRunning(){
 if(csat)return null;
 try{const m=JSON.parse(sessionStorage.getItem(runningKey));return m&&SET_ID.test(m.setId||'')&&typeof m.owner==='string'&&m.owner?m:null;}catch{return null;}
}
function writeRunning(m){
 if(csat)return;
 try{if(m)sessionStorage.setItem(runningKey,JSON.stringify(m));else sessionStorage.removeItem(runningKey);}catch{}
}
async function memberOwner(){
 const token=window.DSAuth?.get()||'';
 if(ownerMemo.token===token&&ownerMemo.value)return ownerMemo.value;
 let value='';
 if(token){
  const digest=await crypto.subtle.digest('SHA-256',new TextEncoder().encode('school-timed:'+token));
  value=Array.from(new Uint8Array(digest),n=>n.toString(16).padStart(2,'0')).join('');
 }else if(window.DSService?.memberPreview&&signed()){value=(await service().getProgress()).ownerKey||'';}
 if((window.DSAuth?.get()||'')!==token)return '';
 ownerMemo={token,value};return value;
}
function runningForMember(){
 const m=readRunning();
 return m&&signed()&&ownerMemo.value&&ownerMemo.token===(window.DSAuth?.get()||'')&&m.owner===ownerMemo.value?m:null;
}
window.addEventListener('ds-session-change',()=>{
 if(!csat&&signed()&&submittingTicket&&loginTicket()?.id===submittingTicket){
  replaceTrialQuery('trialResult',submittingTicket);submittingTicket=null;
 }
 if(previousMember&&!signed())clearTrial();
 previousMember=signed();accountChanged();
});
window.addEventListener('storage',event=>{
 if(!csat&&(event.key==='ds_tk'||event.key==='ds_logout_epoch'||event.key===null)){
  clearTrial();
  if(active?.kind==='fixed'){accountChanged();paint();}
 }
});
function options(values,chosen){return values.map(([value,title])=>'<option value="'+escape(value)+'"'+(String(chosen)===String(value)?' selected':'')+'>'+escape(title)+'</option>').join('');}
const fixedKey=g=>csat?'ds-fixed-csat-mini-v1':'ds-fixed-final-v1-'+g;
function fixedQuestions(g){
 if(!csat)return bank.filter(q=>q.grade===g);
 return (window.DSBasicExamV34?.questions||[]).slice(0,15);
}
function remembered(g){
 try{
  const prior=JSON.parse(fixedStorage().getItem(fixedKey(g))),ids=fixedQuestions(g).map(q=>q.id);
  if(!csat&&((prior?.logoutMarker||'')!==logoutMarker()||prior?.owner&&!signed()))return null;
  if(prior?.kind!=='fixed'||prior.grade!==g||!Number.isFinite(prior.startedAt)||!Array.isArray(prior.questionIds))return null;
  return (prior.questionIds.length===ids.length||!csat&&prior.questionIds.length===8)&&prior.questionIds.every((id,i)=>id===ids[i])?prior:null;
 }catch{return null;}
}
function saveFixed(){if(active?.kind==='fixed')try{fixedStorage().setItem(fixedKey(active.grade),JSON.stringify(active));}catch{}}
function remaining(){return Math.max(0,Math.ceil((new Date(active.startedAt).getTime()+active.durationSeconds*1000-(Date.now()+(active.offset||0)))/1000));}
function clock(){const seconds=remaining();return Math.floor(seconds/60)+':'+String(seconds%60).padStart(2,'0');}
function nextRequest(){return crypto.randomUUID();}
function verifiedFrame(q,solution){
 const publicQuestion=window.DSBasicExamV34?.questions.find(row=>row.id===q.id&&row.version===q.version);
 const path=publicQuestion?.[solution?'solutionFrame':'questionFrame'];
 if(!path)return '';
 const url=new URL(path,document.baseURI);
 return url.origin===location.origin&&url.pathname.includes('/assets/canonical-exam-v36/')?url.href:'';
}
function questionContent(q,solution=false){
 if(q.format==='sandbox-html'){
  const fragment=solution?q.solutionHTML:q.questionHTML;
  return fragment?window.DSStudentFragment.render(fragment,(q.unit||'문항')+(solution?' 해설':' 문제')):'';
 }
 const frame=verifiedFrame(q,solution);
 if(frame)return '<iframe class="dst-source-frame" title="'+escape(q.unit+(solution?' 해설':' 문제'))+'" src="'+escape(frame)+'"></iframe>';
 const content=math(q[solution?'solution':'prompt']||'');
 if(solution||!q.options?.length)return content;
 return content+'<ol>'+q.options.map(v=>'<li>'+math(String(v))+'</li>').join('')+'</ol>';
}
async function sizeFrame(frame){
 if(!frame.contentDocument?.body||frame.contentDocument.URL==='about:blank')await new Promise((ok,fail)=>{const timer=setTimeout(()=>fail(Error('문항 로딩 지연')),9000);frame.addEventListener('load',()=>{clearTimeout(timer);ok();},{once:true});});
 const doc=frame.contentDocument;if(!doc?.body)return;await doc.fonts.ready;
 frame.style.height='1px';frame.style.height=Math.ceil(Math.max(doc.body.scrollHeight,doc.documentElement.scrollHeight))+'px';
}
document.addEventListener('load',event=>{const el=event.target;if(el?.matches?.('.dst-source-frame') && el.closest(scope))sizeFrame(el).catch(()=>{});},true);
function displayedAnswer(q,value){
 if(value==null||value==='')return '미응답';
 return q.answerType==='choice'?String(Number(value)+1)+'번':String(value);
}
function renderPaper(ids,solution=false){
 return ids.map((id,i)=>{const q=known(id);return '<article class="dst-question"><b>'+String(i+1).padStart(2,'0')+'</b><div><small>'+escape(q.unit)+'</small><p>'+questionContent(q)+'</p>'+(solution?'<p><strong>정답 '+escape(q.answer==null?'채점 결과 확인 중':displayedAnswer(q,q.answer))+'</strong>　'+questionContent(q,true)+'</p>':'')+'</div></article>';}).join('');
}
async function printPaper(ids,title,includeSolutions=true){
 const w=window.open('','_blank');if(!w){notice='인쇄 창을 허용해 주세요.';paint();return;}
 const doc=w.document;doc.open();doc.write('<!doctype html><html lang="ko"><head><meta charset="utf-8"></head><body><p role="status">문제지와 해설을 조판하고 있어요.</p></body></html>');doc.close();doc.title=title;
 try{
  const styles=await Promise.all(['assets/vendor/katex-0.18.4/katex-embed.css','student-hub.css'].map(async name=>{const r=await fetch(new URL(name,document.baseURI));if(!r.ok)throw Error();return r.text();}));
  if(w.closed)return;
  const style=doc.createElement('style');style.textContent=styles.join('\n');doc.head.append(style);
  const main=doc.createElement('main');main.className='dst-paper';
  const groupSize=ids.some(id=>known(id).format==='sandbox-html'||verifiedFrame(known(id),false))?1:4;
  for(const sol of (includeSolutions?[false,true]:[false]))for(let i=0;i<ids.length;i+=groupSize){
   const chunk=ids.slice(i,i+groupSize), sheet=doc.createElement('section');sheet.className='dst-sheet';
   sheet.innerHTML='<header><small>DELTASKILL　·　'+(sol?'정답과 해설':'학생용 문제지')+'</small><h1>'+escape(title)+'</h1><p>델타스킬　·　'+(i+1)+'–'+(i+chunk.length)+'번</p></header>'+renderPaper(chunk,sol);
   sheet.querySelectorAll('.dst-question>b').forEach((el,j)=>el.textContent=String(i+j+1).padStart(2,'0'));main.append(sheet);
  }
  doc.body.replaceChildren(main);await Promise.all([...main.querySelectorAll('iframe')].map(f=>f.matches('.ds-student-fragment')?window.DSStudentFragment.fit(f):sizeFrame(f)));await doc.fonts.ready;await new Promise(ok=>w.requestAnimationFrame(()=>w.requestAnimationFrame(ok)));if(!w.closed)w.print();
 }catch{if(!w.closed)doc.body.textContent='문제지 조판을 불러오지 못했습니다. 창을 닫고 다시 인쇄해 주세요.';}
}
function title(){
 if(csat)return (active?.questionIds.length||count)===30?'수능 실전 모의고사':'수능 미니 모의고사';
 if(receivedSource)return receivedSource.title+' 타임어택';
 return active?.kind==='custom'?(known(active.questionIds[0])?.subject||currentSubject)+' 맞춤 타임어택':'고'+grade+' '+gradeNames[grade]+' 기말 연습';
}
function paperQuestion(q,index,total,answerBox=''){
 return `<article class="quick-paper ta-question-v18 sl54-paper-preview dst-sheet" tabindex="-1">
 <div class="paper-heading"><span>${escape(q.unit||'타임어택')}</span><span>${index+1} / ${total}</span></div>
 <div class="quick-question"><b class="question-no">${String(index+1).padStart(2,'0')}</b><div class="dst-prompt question-stem">${questionContent(q)}</div></div>${answerBox}</article>`;
}
const exam=window.DSTimedExam.create({
 scope,getActive:()=>active,known,clock,remaining,title,paperQuestion,questionContent,displayedAnswer,
 recordAnswer,finish:()=>action('finish'),paint,escape,math,guestLoginUrl,signed
});
const catalogById=new Map(), resources=new Map();
let receivedSource=null;
let remote=null,remoteStatus='',seq=0,type='',scopeMode='specific';
function subjectBooks(){return (window.DSWorkbookScope?.books||[]).filter(b=>b.subject===currentSubject);}
function selectedBook(){return subjectBooks().find(b=>b.id===book);}
function unitOptions(){if(book)return selectedBook()?.units||[];return [...new Map(subjectBooks().flatMap(b=>b.units).map(u=>[u.id,u])).values()];}
function typeOptions(){return unitOptions().filter(u=>!unit||u.id===unit).flatMap(u=>u.types||[]);}
function criteria(){
 const t=typeOptions().find(t=>t.id===type);
 const typeIds=!type||scopeMode==='unit'?[]:scopeMode==='family'&&t?.familyId?typeOptions().filter(x=>x.familyId===t.familyId).map(x=>x.id):[type];
 return {purpose:'timeattack',sourceKind:'existing_print',subject:currentSubject,...(book?{bookId:book}:{}),unitIds:unit?[unit]:[],typeIds:[...new Set(typeIds)]};
}
const receivedSku='NS-CM2-07.pdf';
function canOpenReceived(row){
 return Boolean(row?.fileId===receivedSku&&row.receiptId&&row.redownloadable!==false);
}
async function questionPin(id,version){
 const hash=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(id+'|'+version));
 return Array.from(new Uint8Array(hash),b=>b.toString(16).padStart(2,'0')).join('');
}
function savedReceiptSet(receiptId){
 try{return localStorage.getItem('ds-received-timed:'+receiptId);}catch{return null;}
}
async function openReceived(row,delivery){
 const sessionEpoch=epoch;
 if(busy||!signed()||!canOpenReceived(row)||delivery?.receiptId!==row.receiptId||delivery.fileId!==row.fileId||delivery.charged!==0)throw Error('unverified_receipt');
 const file=delivery.files?.find(f=>f.fileId==='NS-CM2-07-L1.pdf');
 const safe=window.DSPointPdf?.safeUrl(file?.url);
 if(!safe)throw Error('unverified_edition');
 const path=new URL(safe).pathname.split('/');
 const edition=path.at(-2);
 if(path.at(-3)!==row.fileId||!(path.at(-1)===file.fileId+'.pdf'||path.at(-1)===file.fileId))throw Error('unverified_edition');
 const response=await fetch(new URL('public-data/received-timed-pins.json',document.baseURI));
 if(!response.ok)throw Error('missing_edition');
 const collection=await response.json(),pins=collection.groups[collection.editions[edition]];
 if(!Array.isArray(pins)||!pins.length)throw Error('unverified_edition');
 const tab=document.querySelector('[data-hub-tab="timed"]');
 if(active?.kind==='custom'&&active.dirty)await flushDraft(active);
 if(epoch!==sessionEpoch||!signed()||!tab?.isConnected)throw Error('session_changed');
 receivedSource={receiptId:row.receiptId,pins:new Set(pins),title:row.title||'유리함수와 무리함수',lastSet:savedReceiptSet(row.receiptId)};
 grade=1;currentSubject=subjects[0];book='OL-type-CM2';unit='';type='';level='';scopeMode='specific';count=10;minutes=20;
 active=null;remote=null;quote=null;req=null;selection=[];remoteStatus='';notice='';seq++;
 tab.click();
}
function cleanRemote(r){
 return (r.questions||[]).filter(q=>typeof q.id==='string'&&!byId.has(q.id)&&typeof q.version==='string'&&q.id.length<220).map(q=>({...q,level:q.stage??q.level??(Number.isInteger(q.difficulty)?q.difficulty:null)}));
}
async function loadCatalog(){
 const own=++seq;quote=null;remote=null;remoteStatus='확인 중';paint();
 try{if(!signed()||!service()?.catalog)throw Error();const requested=criteria();const r=await service().catalog(requested);if(own!==seq||!signed())return;
 let rows=cleanRemote(r).filter(q=>q.sourceKind===requested.sourceKind&&q.subject===requested.subject&&(!requested.bookId||(q.bookId===requested.bookId||q.bookIds?.includes(requested.bookId)))&&(!requested.unitIds.length||requested.unitIds.includes(q.unitId)||requested.unitIds.includes(q.subunitId)||q.unitIds?.some(v=>requested.unitIds.includes(v)))&&(!requested.typeIds.length||requested.typeIds.includes(q.typeId)||q.typeIds?.some(v=>requested.typeIds.includes(v))));
 const source=receivedSource;
 if(source){
  const pins=await Promise.all(rows.map(q=>questionPin(q.id,q.version)));
  if(own!==seq||!signed()||source!==receivedSource)return;
  rows=rows.filter((q,i)=>source.pins.has(pins[i]));
 }
 remote={rows,catalogVersion:r.catalogVersion};for(const q of rows)catalogById.set(q.id,q);remoteStatus='';}
 catch{if(own===seq)remoteStatus='문항 자료를 불러오지 못했어요. 다시 확인해 주세요.';}
 if(own===seq)paint();
}
function candidates(){return (remote?.rows||[]).filter(q=>!level||String(q.level)===level);}
function field(key,name,values,value){
 return `<label>${name}<select data-time-field="${key}">${options(values,value)}</select></label>`;
}
function fixedStartLabel(){
 const set=remembered(grade);
 return !set?'시험 시작':set.status==='running'?'이어 풀기':csat?'채점 결과 보기':'로그인하고 채점하기';
}
function fixedSetup(){
 const prior=remembered(grade),duration=prior?prior.durationSeconds/60:20;
 const size=prior?.questionIds.length||gradeBank().length;
 const range=grade===1?'집합과 명제 · 함수':'함수의 극한 · 미분 · 적분';
 return '<div class="dst-fields">'+[
  field('subject','과목',[[gradeNames[1],'고1 · '+gradeNames[1]],[gradeNames[2],'고2 · '+gradeNames[2]]],gradeNames[grade]),
  field('fixed-book','연계 교재',[['','교재 없이 구성']],''),
  field('fixed-unit','단원',[['',range]],''),
  field('fixed-preset','시험 구성',[['',size+'문항 · '+duration+'분']],'')
 ].join('')+'</div><button class="dst-start" data-time-action="quote">'+fixedStartLabel()+'</button>';
}
function customSetup(){
 const books=subjectBooks(),types=typeOptions();
 const scopeFields=receivedSource?'':[
  field('subject','과목',subjects.map(x=>[x,x]),currentSubject),
  field('book','연계 교재',[['','교재 없이 구성'],...books.map(b=>[b.id,b.label])],book),
  field('unit','단원',[['','전체 단원'],...unitOptions().map(u=>[u.id,u.label])],unit)
 ].join('');
 const extra=receivedSource?'':'<details class="dst-extra"'+(type||level?' open':'')+'><summary>유형·변형 단계 설정</summary><div class="dst-fields">'+field('type','유형',[['','전체 유형'],...types.map(t=>[t.id,t.label])],type)+field('level','변형 단계',[['','여러 단계 섞기'],...[1,2].map(n=>[n,n+'단계'])],level)+'</div></details>';
 const preset=field('preset','시험 구성',presets.map(n=>[n,n+'문항 · '+(n*2)+'분']),count);
 const start='<button class="dst-start" data-time-action="quote"'+(busy?' disabled':'')+'>시험 시작</button>';
 const running=receivedSource?null:runningForMember();
 const resume=running?'<button class="dst-start" data-time-action="resume-running"'+(busy?' disabled':'')+'>'+(running.status==='running'?'이어 풀기 · 진행 중인 시험':'최근 시험 결과 보기')+'</button>':'';
 return resume+'<div class="dst-fields">'+scopeFields+preset+'</div>'+extra+start;
}
function startDialog(){
 if(!dialogMode)return '';
 let body='',button='';
 if(dialogMode==='member-login'){
  return '<dialog class="dst-start-dialog" aria-labelledby="dst-confirm-title"><h2 id="dst-confirm-title">로그인이 필요해요</h2><p>이 시험은 로그인 후 이용할 수 있어요.</p><div><button autofocus data-time-action="dismiss">돌아가기</button><a data-time-login href="'+guestLoginUrl+'">로그인</a></div></dialog>';
 }
 if(dialogMode==='member-mock'){
  return '<dialog class="dst-start-dialog" aria-labelledby="dst-confirm-title"><h2 id="dst-confirm-title">실전 모의고사</h2><p>30문항 · 100분 시험은 로그인 후 이용할 수 있어요.</p><div><button autofocus data-time-action="dismiss">돌아가기</button><a data-time-login href="'+guestLoginUrl+'">로그인</a></div></dialog>';
 }
 if(dialogMode==='quote'&&quote){
  const amount=quote.chargePoints;
  const title=csat?'수능 모의고사':receivedSource?.title||selectedBook()?.label||currentSubject;
  const unitName=unitOptions().find(item=>item.id===unit)?.label;
  const price=Number(amount).toLocaleString()+'P';
  const balance=amount&&Number.isSafeInteger(quote.remaining)?'<p>보유 포인트 '+quote.remaining.toLocaleString()+'P</p>':'';
  body='<p>'+escape([title,unitName].filter(Boolean).join(' · '))+'<br>'+count+'문항 · '+minutes+'분</p><strong>'+(amount?'사용할 포인트 '+price:quote.firstFreeAvailable?'첫 시험 무료 · 0P':'무료 · 0P')+'</strong>'+balance;
  button='<button data-time-action="start">'+(amount?price+' 사용하고 시작':'무료로 시작')+'</button>';
 }else if(dialogMode==='short'){
  body='<p>이 범위에서 풀 수 있는 문항은 '+candidates().length+'개입니다. '+count+'문항을 채우려면 단원이나 교재 범위를 넓혀 주세요.</p>';
 }else{
  body='<p>'+escape(notice||'문항 목록을 확인할 수 없습니다. 다시 시도해 주세요.')+'</p>';
 }
 return '<dialog class="dst-start-dialog" aria-labelledby="dst-confirm-title"><h2 id="dst-confirm-title">'+(dialogMode==='quote'?'시험을 시작할까요?':'시험 조건 확인')+'</h2>'+body+'<div><button autofocus data-time-action="dismiss">'+(dialogMode==='quote'?'취소':'조건 다시 고르기')+'</button>'+button+'</div></dialog>';
}
function schoolLogin(){
 const ticket=resultTicket();if(!ticket?.id)return;
 replaceTrialQuery('trialLogin',ticket.id);
 window.DSLoginReturn='#student';
 const url=new URL(location.href);url.searchParams.set('studentMode','timed');
 history.replaceState(history.state,'',url);location.hash='#login';
}
function submitSchoolTrial(set){
 const left=remaining();
 set.submittedAt=Date.now();set.remainingAtSubmit=left;set.timedOut=left===0;set.status='submitted';
 saveFixed();setTicket({grade:set.grade,startedAt:set.startedAt,id:nextRequest()});
 active=null;exam.reset();
 if(location.hash==='#student'&&document.querySelector(scope))schoolLogin();
}
async function restoreSchoolResult(){
 if(csat||!signed()||claiming||active)return;
 const ticket=resultTicket();if(!ticket)return;
 const set=remembered(ticket.grade);
 const claim=new URLSearchParams(location.search).get('trialResult');
 if(!ticket.owner&&(!ticket.id||claim!==ticket.id)){clearTrial();paint();return;}
 if(!set||set.startedAt!==ticket.startedAt||!['submitted','finished','expired'].includes(set.status)){setTicket(null);paint();return;}
 const token=window.DSAuth?.get(),generation=epoch;
 claiming=true;
 try{
  // Scope the tab's local result to this login without copying credentials into storage.
  let owner;
  if(token){
   const digest=await crypto.subtle.digest('SHA-256',new TextEncoder().encode('school-trial:'+token));
   owner=Array.from(new Uint8Array(digest),n=>n.toString(16).padStart(2,'0')).join('');
  }else if(window.DSService?.memberPreview){owner=(await service().getProgress()).ownerKey;}
  if(!owner||epoch!==generation||!signed()||window.DSAuth?.get()!==token||ticket!==resultTicket())return;
  if((ticket.owner&&ticket.owner!==owner)||(set.owner&&set.owner!==owner)){clearTrial();paint();return;}
  if(location.hash!=='#student'||!document.querySelector(scope))return;
  grade=set.grade;currentSubject=gradeNames[grade];
  active=set;active.owner=owner;active.status=set.timedOut?'expired':'finished';
  setTicket({...ticket,owner});saveFixed();if(claim)replaceTrialQuery();exam.reset();paint();showExamStart();
 }finally{claiming=false;}
}
function setup(){
 if(csat)return window.DSCSATStudent?.mockSetup()||'';
 if(signed()&&resultTicket())return '<p role="status">제출한 답안을 채점하고 있어요.</p>';
 const member=signed(),preview=gradeBank()[0],total=gradeBank().length;
 const sample=paperQuestion(preview,0,total);
 return `<div class="ta-top-v18"><h1>타임어택</h1><span>${receivedSource?escape(receivedSource.title):'기말고사 연습'}</span></div>
 <div class="ta-layout-v18 dst-layout"><div class="ta-main-v18"><div class="dst-sample-label">${gradeNames[grade]} · 첫 문항</div>${sample}</div>
 <aside class="dst-panel sl54-unit-side dst-config"><h2>시험 조건</h2>${member?customSetup():fixedSetup()}
 ${receivedSource?'<button data-time-action="leave-received">전체 타임어택 보기</button>':''}</aside></div>`;
}
function html(){return '<section data-timed-space="'+space+'" class="ds-timed ta-work-v18 sl54-shell work-surface" data-sl-view="entry">'+(active?exam.render():resuming?'<div class="ta-top-v18"><h1>타임어택</h1></div><p role="status">진행 중인 시험을 불러오고 있어요.</p>':setup()+startDialog())+'<p role="status">'+escape(notice)+'</p></section>';}
function showExamStart(){
 requestAnimationFrame(()=>{
  const clock=document.querySelector(scope+' .dte-clock');
  if(!clock)return;
  const top=document.querySelector('#header')?.getBoundingClientRect().bottom||0;
  const bounds=clock.getBoundingClientRect();
  if(bounds.top<top+2||bounds.bottom>window.innerHeight/2)clock.scrollIntoView({block:'start',behavior:'instant'});
 });
}
function paint(){
 const root=document.querySelector(scope);if(!root)return;
 root.outerHTML=html();
 const dialog=document.querySelector(scope+' dialog');if(dialog&&!dialog.open)dialog.showModal();
}
document.addEventListener('cancel',e=>{if(e.target.matches('.dst-start-dialog') && e.target.closest(scope)){e.preventDefault();action('dismiss');}});

let req=null,lastId=null;
window.addEventListener('ds-session-change',()=>{req=null;lastId=null;});
function known(id){return resources.get(id)||byId.get(id);}
function fetchItem(publicQ,meta){
 return {...meta,grade:gradeNames.indexOf(meta.subject)>0?gradeNames.indexOf(meta.subject):grade,id:publicQ.id,unit:publicQ.unit,answer:publicQ.answer,prompt:'',solution:'',questionFrame:publicQ.questionFrame,solutionFrame:publicQ.solutionFrame,answerType:'choice'};
}
async function accept(result){const s=result.set||result;const ids=s.questionIds||s.questions?.map(q=>q.id);if(!Array.isArray(ids)||!ids.length||!s.setId||!Number.isFinite(new Date(s.startedAt).getTime())||!(s.durationSeconds>0))throw Error('세트 정보를 확인할 수 없어요.');const observedEpoch=epoch,receivedAt=Date.now();
 async function loadQuestion(id,i){
  if(epoch!==observedEpoch||byId.has(id))return;
  const version=s.versions?.[i],cached=resources.get(id);
  const meta=catalogById.get(id)||s.questions?.find(q=>q.id===id)||{};
  const pub=window.DSBasicExamV34?.questions.find(q=>q.id===id);
  if(pub?.version===version&&pub){resources.set(id,{...fetchItem(pub,meta),version});return;}
  if(cached?.version!==version){
   const response=await service().open({setId:s.setId,questionId:id,version});
   if(epoch!==observedEpoch)return;
   const q=response.question||response;
   if(q.version!==version||!(q.format==='sandbox-html'?q.questionHTML?.trim():q.prompt?.trim()))throw Error();
   resources.set(id,{...meta,...q,id,unit:q.unit||meta.unit||''});
  }
  if(s.status!=='running'&&service()?.review){
   const response=await service().review({setId:s.setId,questionId:id,version});
   if(epoch!==observedEpoch)return;
   const review=response.question||response.review||response;
   if(review.version!==version)throw Error('review_version');
   resources.set(id,{...known(id),answer:s.gradedResponses?.[id]?.answer??review.answer,solution:review.solution||'',solutionHTML:review.solutionHTML||''});
  }
 }
 for(let i=0;i<ids.length;i+=4){
  if(epoch!==observedEpoch)return;
  await Promise.all(ids.slice(i,i+4).map((id,j)=>loadQuestion(id,i+j)));
 }
 if(epoch!==observedEpoch)return;if(active?.setId!==s.setId)exam.reset();lastId=s.setId;const now=Date.parse(result.serverNow||s.serverNow);active={...s,offset:Number.isFinite(now)?now-receivedAt:0,kind:'custom',questionIds:ids,responses:{...(s.responses||{})}};
 if(!csat){
  const owner=await memberOwner().catch(()=>'');if(epoch!==observedEpoch||active?.setId!==s.setId)return;
  const prior=readRunning(),same=prior?.setId===s.setId&&prior.owner===owner;
  if(same&&active.status==='running'&&prior.responses&&typeof prior.responses==='object'){
   for(const [id,value] of Object.entries(prior.responses)){
    if(!ids.includes(id)||typeof value!=='string'||String(active.responses[id]??'')===value)continue;
    active.responses[id]=value;(active.pendingAnswers||={})[id]=value;active.dirty=true;
   }
   if(active.dirty){const item=active;clearTimeout(draftTimer);draftTimer=setTimeout(()=>flushDraft(item).catch(()=>{}),500);}
  }
  if(owner&&active.status==='running')writeRunning({setId:s.setId,owner,status:'running',responses:same?{...(prior.responses||{})}:{}});
  else if(owner&&same)writeRunning({...prior,status:active.status,responses:{}});
 }
}
let draftTimer=0,draftQueue=Promise.resolve();
function numericAnswers(values){
 const answers={};for(const [id,value] of Object.entries(values)){const v=String(value??'').trim();if(!v){answers[id]=null;continue;}if(!/^-?\d{1,9}$/.test(v))throw Error('정수로 입력해 주세요.');answers[id]=Number(v);}return answers;
}
function flushDraft(item){
 clearTimeout(draftTimer);if(item?.kind!=='custom'||!item.dirty)return draftQueue;
 const draft=Object.fromEntries(Object.entries(item.pendingAnswers||{}));if(!Object.keys(draft).length)return draftQueue;
 item.pendingAnswers={};item.dirty=false;const ownerEpoch=epoch;
 draftQueue=draftQueue.catch(()=>{}).then(async()=>{
  if(ownerEpoch!==epoch)return;
  try{const payload={setId:item.setId,responses:numericAnswers(item.responses),expectedVersion:item.version,requestId:nextRequest()};let saved;
   try{saved=await service().saveResponses(payload);}
   catch(err){if((err.status===409||err.code==='conflict'||err.code==='version_conflict')&&epoch===ownerEpoch){
    const latest=await service().read({setId:item.setId});const remote=latest.set||latest;
    if(remote.status!=='running')throw err;const merged={...remote.responses,...draft};
    saved=await service().saveResponses({...payload,responses:numericAnswers(merged),expectedVersion:remote.version,requestId:nextRequest()});
    if(epoch===ownerEpoch)item.responses={...merged,...item.pendingAnswers};
   }else throw err;}
   if(epoch===ownerEpoch)item.version=(saved.set||saved).version;
  }catch(err){if(ownerEpoch===epoch){item.pendingAnswers={...draft,...item.pendingAnswers};item.dirty=true;const msg=document.querySelector(scope+'>[role=status]');if(msg)msg.textContent='답 저장을 확인하지 못했어요. 세트를 닫기 전에 다시 시도해 주세요.';}throw err;}
 });return draftQueue;
}
async function action(command){if(busy)return;const sessionEpoch=epoch;notice='';
 if(command==='dismiss'){dialogMode='';quote=null;notice='';paint();document.querySelector(scope+' [data-time-action="quote"]')?.focus();return;}
 if(command==='resume-running'){const m=runningForMember();if(m){await openSaved(m.setId);if(!active&&readRunning()?.setId===m.setId&&sessionEpoch===epoch&&!notice)notice='최근 세트를 불러오지 못했어요. 마이페이지 내 시험 기록에서 열어 주세요.';if(!active)paint();}return;}
 if(command==='leave-received'){receivedSource=null;book='';remoteStatus='';seq++;await loadCatalog();return;}
 if(command==='back'){if(!csat&&signed()&&active?.kind==='fixed'){
  setTicket(null);try{sessionStorage.removeItem(fixedKey(active.grade));}catch{}
 }if(active?.kind==='custom'){busy=true;try{await flushDraft(active);}catch{busy=false;return;}busy=false;if(active.status!=='running'&&readRunning()?.setId===active.setId)writeRunning(null);}active=null;exam.reset();dialogMode='';quote=null;paint();return;}
 if(command==='quote'&&!signed()){
  if(csat&&document.querySelector(scope+' [data-csat-mock-size]')?.value==='30'){
   dialogMode='member-mock';paint();return;
  }
  const rows=fixedQuestions(grade);
  if(csat){
   if(rows.length!==15||rows.some(q=>!verifiedFrame(q,false)||!verifiedFrame(q,true))){notice='공개 모의고사를 준비하고 있어요.';paint();return;}
   for(const q of rows)resources.set(q.id,{...fetchItem(q,q),version:q.version});
  }
  const previous=remembered(grade);
  if(!csat&&previous&&previous.status!=='running'){
   setTicket({grade,startedAt:previous.startedAt,id:nextRequest()});schoolLogin();return;
  }
  exam.reset();active=previous||{kind:'fixed',grade,questionIds:rows.map(q=>q.id),startedAt:Date.now(),durationSeconds:csat?3000:1200,status:'running',responses:{}};
  if(!csat&&!previous)active.logoutMarker=logoutMarker();
  saveFixed();paint();showExamStart();return;
 }
 if(command==='catalog'){await loadCatalog();return;}
 if(command==='print'){printPaper(active.questionIds,title(),['finished','expired'].includes(active.status));return;}
 if(command==='finish'&&active?.kind==='fixed'){if(!csat&&!signed()){submitSchoolTrial(active);return;}active.timedOut=remaining()===0;active.status=active.timedOut?'expired':'finished';saveFixed();paint();return;}
 if(!signed()){dialogMode='';quote=null;if(!csat&&window.DSGuestFirstUse?.prompt){paint();window.DSGuestFirstUse.prompt('timed',{need:true});return;}if(csat){dialogMode='member-login';paint();return;}notice='로그인하고 이어서 이용해 주세요.';paint();return;}if(!service()){notice='로그인과 계정 연결을 확인해 주세요.';paint();return;}
 busy=true;try{
 if(command==='quote'){
  if(csat){
   const rows=await window.DSCSATStudent.mockSelection();
   if(sessionEpoch!==epoch)return;
   if(!rows || ![15,30].includes(rows.length))throw Error('unavailable');
   count=rows.length;minutes=count===15?50:100;
   for(const q of rows)catalogById.set(q.id,q);
   selection=rows.map(q=>q.id);const r=await service().quote({questionIds:selection,durationSeconds:minutes*60});
   if(sessionEpoch!==epoch)return;
   if(r.questions.length!==rows.length||r.questions.some((q,i)=>q.id!==rows[i].id||q.version!==rows[i].version))throw Error('version_changed');
   quote=r;dialogMode='quote';req=nextRequest();return;
  }
  if(!remote)await loadCatalog();
  if(sessionEpoch!==epoch)return;
  if(!remote||candidates().length<count){dialogMode=remote?'short':'error';return;}
  selection=candidates().map(q=>q.id);for(let i=selection.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[selection[i],selection[j]]=[selection[j],selection[i]];}selection=[...selection.filter(id=>catalogById.get(id)?.sourceKind==='existing_print'),...selection.filter(id=>catalogById.get(id)?.sourceKind!=='existing_print')].slice(0,count);if(selection.length!==count)throw Error('조건에 맞는 문항이 없어요.');const r=await service().quote({questionIds:selection,durationSeconds:minutes*60});if(sessionEpoch!==epoch)return;if(!Number.isSafeInteger(r.chargePoints)||r.chargePoints<0)throw Error('문항별 포인트를 확인할 수 없어요.');if(!Array.isArray(r.questions)||r.questions.length!==selection.length||r.questions.some((q,i)=>q.id!==selection[i]||q.version!==catalogById.get(q.id)?.version)){
   remote=null;quote=null;remoteStatus='문항 목록이 바뀌었어요. 선택한 교재와 단원을 다시 확인해 주세요.';return;
  }
  quote=r;dialogMode='quote';req=nextRequest();}
 if(command==='start'&&quote){
  const button=document.querySelector(scope+' [data-time-action=start]');
  if(button){button.disabled=true;button.textContent='시험 여는 중…';}
  const result=await service().start({questionIds:selection,durationSeconds:minutes*60,catalogVersion:quote.catalogVersion,expectedCharge:quote.chargePoints,requestId:req});if(sessionEpoch!==epoch)return;if(receivedSource){
    const set=(result.set||result);receivedSource.lastSet=set.setId;try{localStorage.setItem('ds-received-timed:'+receivedSource.receiptId,set.setId);}catch{}
  }
  await accept(result);quote=null;dialogMode='';}
 if(command==='resume'){const setId=receivedSource?receivedSource.lastSet:lastId;if(receivedSource&&!setId)throw Error();const result=await service().read(setId?{setId}:{});if(sessionEpoch!==epoch)return;if(result.set===null){notice='아직 시작한 맞춤 세트가 없어요.';}else{
    if(csat && !window.DSCSATStudent?.isMockSet(result.set||result))throw Error('wrong_set');
    if(receivedSource){const source=receivedSource;const set=result.set||result;const pins=await Promise.all(set.questionIds.map((id,i)=>questionPin(id,set.versions[i])));if(sessionEpoch!==epoch||source!==receivedSource||!pins.every(pin=>source.pins.has(pin)))throw Error();}
    await accept(result);}}
 if(command==='finish'&&active){
   const item=active;
   if(remaining()>0)await flushDraft(item);
   else{clearTimeout(draftTimer);await draftQueue.catch(()=>{});}
   item.finishId ||= nextRequest();
   const seconds=remaining();
   try{
     const result=await service().finish({setId:item.setId,responses:seconds?numericAnswers(item.responses):{},expectedVersion:item.version,elapsedSeconds:Math.max(0,item.durationSeconds-seconds),requestId:item.finishId});
     if(sessionEpoch===epoch)await accept(result);
   }catch(error){
     if(sessionEpoch!==epoch)return;
     if(error.set&&['finished','expired'].includes(error.set.status)){await accept(error.set);}
     else if(error.code==='version_conflict'){const result=await service().read({setId:item.setId});await accept(result);notice='다른 창에서 저장한 답을 불러왔어요. 확인한 뒤 채점해 주세요.';}
     else throw error;
   }
 }
 }catch(e){if(sessionEpoch===epoch&&command==='start')dialogMode='error';if(sessionEpoch===epoch&&command==='start'&&['quote_changed','price_changed'].includes(e.code||e.message)){quote=null;notice='조건이 달라졌어요. 시작 전에 포인트를 다시 확인해 주세요.';}else if(sessionEpoch===epoch)notice=command==='resume'?'최근 세트를 불러오지 못했어요. 계정의 시작 기록을 확인해 주세요.':e.code==='no_points'||e.code==='insufficient_points'?'포인트가 부족해요. 문항 수를 줄인 뒤 다시 확인해 주세요.':e.code==='bad_answer'||e.message==='정수로 입력해 주세요.'?'답은 정수로 입력해 주세요.':'계정에서 요청을 확인하지 못했어요. 같은 조건으로 다시 확인해 주세요.';}finally{if(sessionEpoch===epoch){busy=false;paint();if(active&&['start','resume'].includes(command))showExamStart();}}}
document.addEventListener('click',e=>{if(!csat&&e.target.closest(scope+' [data-time-login]'))window.DSLoginReturn='#student';const b=e.target.closest(scope+' button');if(!b||busy)return;if(active&&exam.click(b))return;if(b.dataset.timeAction)action(b.dataset.timeAction);});
document.addEventListener('change',e=>{const key=e.target.dataset.timeField;if(!key||busy||!e.target.closest(scope))return;const v=e.target.value;
 if(!signed()){
  if(!csat&&key==='subject'&&gradeNames.slice(1).includes(v)){grade=gradeNames.indexOf(v);currentSubject=v;notice='';paint();document.querySelector(scope+' [data-time-field="subject"]')?.focus({preventScroll:true});}
  return;
 }
 if(key==='subject'){if(!subjects.includes(v))return;currentSubject=v;if(gradeNames.includes(v))grade=gradeNames.indexOf(v);book='';unit='';type='';level='';scopeMode='specific';}
 if(key==='unit'){unit=v;type='';scopeMode='specific';}if(key==='type'){type=v;scopeMode='specific';if(type&&!unit)unit=unitOptions().find(u=>u.types?.some(t=>t.id===type))?.id||'';}
 if(key==='level')level=v;if(key==='preset'){if(!presets.includes(Number(v)))return;count=Number(v);minutes=count*2;}if(key==='book'){book=v;unit='';type='';scopeMode='specific';}
 quote=null;notice='';if(['subject','book','unit','type'].includes(key))loadCatalog();else paint();});
function recordAnswer(id,value){
 const item=active;
 if(!item?.questionIds.includes(id)||item.status!=='running'||remaining()===0)return;
 item.responses[id]=String(value);
 if(item.kind==='fixed'){saveFixed();return;}
 item.pendingAnswers||={};item.pendingAnswers[id]=item.responses[id];item.dirty=true;
 const mark=readRunning();if(mark?.setId===item.setId){mark.responses={...(mark.responses||{}),[id]:item.responses[id]};writeRunning(mark);}
 clearTimeout(draftTimer);draftTimer=setTimeout(()=>flushDraft(item).catch(()=>{}),500);
}
document.addEventListener('input',e=>{if(active&&!busy&&e.target.closest(scope))exam.input(e.target);});
setInterval(()=>{if(!busy)exam.tick();},250);
document.addEventListener('visibilitychange',()=>{if(!document.hidden&&!busy)exam.tick();});
const mount=()=>{
 if(csat||!signed()||active)return;
 if(resultTicket()){void restoreSchoolResult().catch(()=>{notice='제출한 답안의 로그인 정보를 다시 확인해 주세요.';});return;}
 if(!remote&&!remoteStatus)loadCatalog();
 if(readRunning())void resumeRunning().catch(()=>{});
};
async function resumeRunning(){
 // 그림마다 hub 가 mount 를 다시 부른다 — 이미 보인 단추면 다시 그리지 않는다(되풀이 0).
 const shown=Boolean(runningForMember()),generation=epoch,owner=await memberOwner();
 if(generation!==epoch||!signed()||active||busy)return;
 const m=readRunning();if(!m)return;
 if(!owner||m.owner!==owner){writeRunning(null);if(shown)paint();return;}
 if(autoResumed||location.hash!=='#student'||!document.querySelector(scope)){if(!shown)paint();return;}
 autoResumed=true;resuming=true;paint();
 try{await openSaved(m.setId);}finally{resuming=false;}
 if(!active)paint();else showExamStart();
}
async function openSaved(id){
 if(!signed()||busy)return;
 if(active?.kind==='custom'&&active.dirty){try{await flushDraft(active);}catch{return;}}
 receivedSource=null;lastId=id;await action('resume');
}
return {render:html,fixedStartLabel,printPaper,renderPaper,mount,openSaved,openReceived,canOpenReceived,refresh:paint};
}
window.DSStudentTimed=createRunner(false);
window.DSCSATTimed=createRunner(true);
})();