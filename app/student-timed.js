(()=>{
'use strict';
const bank=window.DSFinalPracticeBank;
const byId=new Map(bank.map(q=>[q.id,q]));
const gradeNames=['','공통수학2','미적분Ⅰ'];
const escape=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const math=s=>String(s).split('$').map((part,i)=>i%2?katex.renderToString(part,{throwOnError:false,trust:false,output:'htmlAndMathml'}):escape(part)).join('');
const signed=()=>Boolean(window.DSService?.session());
const service=()=>window.DSStudentServices;
const gradeBank=()=>bank.filter(q=>q.grade===grade);
let grade=1,level='',unit='',book='',count=4,minutes=24,active=null,quote=null,selection=[],busy=false,notice='',epoch=0;
const scope='.ds-timed';
const label=q=>gradeNames[q.grade]+' · '+q.unit;
function accountChanged(){epoch++;seq++;remote=null;remoteStatus='';resources.clear();catalogById.clear();active=null;quote=null;notice='';busy=false;selection=[];}
window.addEventListener('ds-session-change',accountChanged);
function options(values,chosen){return values.map(([value,title])=>'<option value="'+escape(value)+'"'+(String(chosen)===String(value)?' selected':'')+'>'+escape(title)+'</option>').join('');}
const fixedKey=g=>'ds-fixed-final-v1-'+g;
function remembered(g){try{const obj=JSON.parse(localStorage.getItem(fixedKey(g)));return obj?.kind==='fixed'&&obj.grade===g&&Number.isFinite(obj.startedAt)&&obj.questionIds?.join()===bank.filter(q=>q.grade===g).map(q=>q.id).join()?obj:null;}catch{return null;}}
function saveFixed(){if(active?.kind==='fixed')try{localStorage.setItem(fixedKey(active.grade),JSON.stringify(active));}catch{}}
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
document.addEventListener('load',event=>{const el=event.target;if(el?.matches?.('.dst-source-frame'))sizeFrame(el).catch(()=>{});},true);
function displayedAnswer(q,value){
 if(value==null||value==='')return '미응답';
 return q.answerType==='choice'?String(Number(value)+1)+'번':String(value);
}
function responseControl(q,id,index,response){
 const attrs=' aria-label="'+(index+1)+'번 답" data-time-answer="'+escape(id)+'"';
 if(q.answerType==='choice'){
  const choices=[['','선택하세요'],...Array.from({length:q.options?.length||5},(_,n)=>[n,(n+1)+'번'])];
  return '<label>정답 번호 <select'+attrs+'>'+options(choices,response)+'</select></label>';
 }
 return '<label>답 <input'+attrs+' inputmode="text" maxlength="12" value="'+escape(response)+'"></label>';
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
function title(){return '고'+grade+' '+gradeNames[grade]+(active?.kind==='custom'?' 맞춤 타임어택':' 기말 연습');}
function attemptHTML(){
 const finished=['finished','expired'].includes(active.status);
 const count=active.questionIds.length;
 const correct=Number.isInteger(active.correct)?active.correct:active.questionIds.filter(id=>{
  const value=active.responses?.[id];return value!=null&&String(value).trim()!==''&&Number(value)===known(id).answer;
 }).length;
 const heading='<header class="dst-head"><div><p>'+(active.kind==='fixed'?'학년 공통 무료 세트':'내 맞춤 세트')+'</p><h2>'+escape(title())+'</h2></div><strong data-time-clock>'+(finished?correct+' / '+count+' 정답':clock())+'</strong></header>';
 const questions=active.questionIds.map((id,i)=>{
  const q=known(id),response=active.responses?.[id]??'',answer=active.gradedResponses?.[id]?.answer??q.answer;
  const prompt=questionContent(q);
  const answerBox=finished?'<p>내 답 '+escape(displayedAnswer(q,response))+' · 정답 <strong>'+escape(answer==null?'확인 중':displayedAnswer(q,answer))+'</strong></p><div>'+questionContent(q,true)+'</div>':responseControl(q,id,i,response);
  return '<article class="dst-question"><b>'+String(i+1).padStart(2,'0')+'</b><div><small>'+escape(q.unit||'')+'</small><div class="dst-prompt">'+prompt+'</div>'+answerBox+'</div></article>';
 }).join('');
 return heading+'<div data-time-form>'+questions+'</div><div class="dst-actions">'+(finished?'':'<button data-time-action="finish">채점하고 마치기</button>')+'<button data-time-action="print">'+(finished?'문제지·해설 인쇄':'문제지 인쇄')+'</button><button data-time-action="back">세트 목록</button></div>';
}
const catalogById=new Map(), resources=new Map();
let remote=null,remoteStatus='',seq=0,type='',scopeMode='specific';
function subjectBooks(){return (window.DSWorkbookScope?.books||[]).filter(b=>b.subject===gradeNames[grade]);}
function selectedBook(){return subjectBooks().find(b=>b.id===book);}
function unitOptions(){if(book)return selectedBook()?.units||[];return [...new Map(subjectBooks().filter(b=>b.series==='쎈').flatMap(b=>b.units).map(u=>[u.id,u])).values()];}
function typeOptions(){return unitOptions().filter(u=>!unit||u.id===unit).flatMap(u=>u.types||[]);}
function criteria(){
 const t=typeOptions().find(t=>t.id===type);
 const typeIds=!type||scopeMode==='unit'?[]:scopeMode==='family'&&t?.familyId?typeOptions().filter(x=>x.familyId===t.familyId).map(x=>x.id):[type];
 return {purpose:'timeattack',sourceKind:'existing_print',grade,subject:gradeNames[grade],...(book?{bookId:book}:{}),unitIds:unit?[unit]:[],typeIds:[...new Set(typeIds)]};
}
function cleanRemote(r){
 return (r.questions||[]).filter(q=>typeof q.id==='string'&&!byId.has(q.id)&&typeof q.version==='string'&&q.id.length<220).map(q=>({...q,level:q.stage??q.level??(Number.isInteger(q.difficulty)?q.difficulty:null)}));
}
async function loadCatalog(){
 const own=++seq;quote=null;remote=null;remoteStatus='확인 중';paint();
 try{if(!signed()||!service()?.catalog)throw Error();const requested=criteria();const r=await service().catalog(requested);if(own!==seq||!signed())return;
 const rows=cleanRemote(r).filter(q=>q.subject===requested.subject&&(!requested.bookId||(q.bookId===requested.bookId||q.bookIds?.includes(requested.bookId)))&&(!requested.unitIds.length||requested.unitIds.includes(q.unitId)||requested.unitIds.includes(q.subunitId)||q.unitIds?.some(v=>requested.unitIds.includes(v)))&&(!requested.typeIds.length||requested.typeIds.includes(q.typeId)||q.typeIds?.some(v=>requested.typeIds.includes(v))));remote={rows,catalogVersion:r.catalogVersion};for(const q of rows)catalogById.set(q.id,q);remoteStatus='';}
 catch{if(own===seq)remoteStatus='문항 자료를 불러오지 못했어요. 다시 확인해 주세요.';}
 if(own===seq)paint();
}
function candidates(){return (remote?.rows||[]).filter(q=>!level||String(q.level)===level);}
function customSetup(){
 const books=subjectBooks(),types=typeOptions(),t=types.find(x=>x.id===type),pool=candidates(),shortage=!!remote&&pool.length<count;
 const filters='<div class="dst-fields"><label>부교재<select data-time-field="book">'+options([['','교재 지정 없이 섞기'],...books.map(b=>[b.id,b.label])],book)+'</select></label><label>소단원<select data-time-field="unit">'+options([['','여러 소단원 섞기'],...unitOptions().map(u=>[u.id,u.label])],unit)+'</select></label><label>유형<select data-time-field="type">'+options([['','여러 유형 섞기'],...types.map(t=>[t.id,t.label])],type)+'</select></label><label>단계<select data-time-field="level">'+options([['','여러 단계 섞기'],...[1,2,3,4].map(n=>[n,n+'단계'])],level)+'</select></label><label>문항 수<select data-time-field="count">'+options(Array.from({length:16},(_,i)=>[i+1,(i+1)+'문항']),count)+'</select></label><label>제한 시간<select data-time-field="minutes">'+options([6,12,18,24,30].map(n=>[n,n+'분']),minutes)+'</select></label></div>';
 let controls=remote?'<p>현재 범위에서 이용 가능 '+pool.length+'문항'+'</p>':'<p role="status">'+escape(remoteStatus)+'</p><button data-time-action="catalog">기존 문항 조회</button>';
 if(shortage){controls+='<p>요청한 '+count+'문항보다 '+(count-pool.length)+'문항 부족해요.</p><div class="dst-actions">';
 if(type&&scopeMode==='specific'&&t?.familyId&&types.filter(x=>x.familyId===t.familyId).length>1)controls+='<button data-time-action="family">'+escape(t.familyId)+' 유형군 보기</button>';
 if(type&&scopeMode!=='unit')controls+='<button data-time-action="unitwide">소단원 전체 유형 보기</button>';
 if(unit)controls+='<button data-time-action="bookwide">같은 교재의 다른 소단원 포함</button>';
 if(level)controls+='<button data-time-action="alllevels">현재 범위에서 여러 단계 섞기</button>';
 if(!unit&&!type&&book&&!pool.length)controls+='<button data-time-action="allbooks">같은 과목의 다른 교재 포함</button>';
 if(pool.length)controls+='<button data-time-action="fewer">현재 '+pool.length+'문항으로 구성</button>';controls+='</div>';}
 if(quote)controls+='<p><strong>'+selection.length+'문항 · '+Number(quote.chargePoints).toLocaleString()+'P</strong></p><button data-time-action="start">이 조건으로 시작하기</button>';
 else if(remote&&!shortage)controls+='<button data-time-action="quote">시작 전 포인트 확인</button>';
 return filters+controls+' <button data-time-action="resume">최근 맞춤 세트 열기</button>';
}
function setup(){const prev=remembered(grade);return '<header class="dst-head"><div><p>기말고사 연습</p><h2>타임어택</h2></div></header><div class="dst-grades">'+[1,2].map(g=>'<button data-time-grade="'+g+'" aria-pressed="'+(grade===g)+'">고'+g+'　'+gradeNames[g]+'</button>').join('')+'</div><section class="dst-panel"><span>학년 공통 · 무료</span><h3>'+gradeNames[grade]+' 기말 연습</h3><p>쎈 단원 구성을 참고한 델타스킬 대표 유형 8문항 · 24분</p><button data-time-action="fixed">'+(prev?prev.status==='finished'?'채점 결과 다시 보기':'공통 세트 이어 풀기':'공통 세트 풀기')+'</button></section><section class="dst-panel"><h3>내 맞춤 타임어택</h3>'+(!signed()?'<p>로그인하면 단계와 단원을 고를 수 있어요. 첫 맞춤 세트는 무료예요.</p><a href="#login">로그인하고 구성하기 →</a>':'<p>첫 세트 무료 · 이후 프린트와 같은 문항별 포인트를 시작 전에 확인합니다.</p>'+customSetup())+'</section>';}
function html(){return '<section class="ds-timed">'+(active?attemptHTML():setup())+'<p role="status">'+escape(notice)+'</p></section>';}
function paint(){const root=document.querySelector(scope);if(root)root.outerHTML=html();}
let req=null,lastId=null;
window.addEventListener('ds-session-change',()=>{req=null;lastId=null;});
function known(id){return resources.get(id)||byId.get(id);}
function fetchItem(publicQ,meta){
 return {...meta,grade:gradeNames.indexOf(meta.subject)>0?gradeNames.indexOf(meta.subject):grade,id:publicQ.id,unit:publicQ.unit,answer:publicQ.answer,prompt:'',solution:'',questionFrame:publicQ.questionFrame,solutionFrame:publicQ.solutionFrame,answerType:'choice'};
}
async function accept(result){const s=result.set||result;const ids=s.questionIds||s.questions?.map(q=>q.id);if(!Array.isArray(ids)||!ids.length||!s.setId||!Number.isFinite(new Date(s.startedAt).getTime())||!(s.durationSeconds>0))throw Error('세트 정보를 확인할 수 없어요.');const observedEpoch=epoch;
 for(const id of ids){if(byId.has(id))continue;const i=ids.indexOf(id),version=s.versions?.[i];if(resources.has(id)&&resources.get(id).version===version&&s.status==='running')continue;
  const meta=catalogById.get(id)||s.questions?.find(q=>q.id===id)||{};
  const pub=window.DSBasicExamV34?.questions.find(q=>q.id===id);
  if(pub&&pub.version===version){resources.set(id,{...fetchItem(pub,meta),version:pub.version,grade:gradeNames.indexOf(meta.subject)>0?gradeNames.indexOf(meta.subject):2});continue;}
  const response=await service().open({setId:s.setId,questionId:id,version});if(epoch!==observedEpoch)return;
  const q=response.question||response.item||response;if(q.version!==version||!(q.format==='sandbox-html'?typeof q.questionHTML==='string'&&q.questionHTML.trim():typeof q.prompt==='string'&&q.prompt.trim()))throw Error();
  resources.set(id,{...meta,...q,id,unit:q.unit||meta.unit||'',grade:gradeNames.indexOf(q.subject||meta.subject)>0?gradeNames.indexOf(q.subject||meta.subject):grade});
 }
 if(s.status!=='running'&&service()?.review){
   for(const [i,id] of ids.entries()){if(byId.has(id)||verifiedFrame(known(id),true))continue;const response=await service().review({setId:s.setId,questionId:id,version:s.versions?.[i]});if(epoch!==observedEpoch)return;const result=response.question||response.review||response;
    if(result.version===s.versions?.[i])resources.set(id,{...known(id),answer:s.gradedResponses?.[id]?.answer??result.answer,solution:typeof result.solution==='string'?result.solution:'',solutionHTML:typeof result.solutionHTML==='string'?result.solutionHTML:''});
   }
  }
 if(epoch!==observedEpoch)return;lastId=s.setId;grade=known(ids[0]).grade;const now=Date.parse(result.serverNow||s.serverNow);active={...s,offset:Number.isFinite(now)?now-Date.now():0,kind:'custom',questionIds:ids,responses:{...(s.responses||{})}};}
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
  }catch(err){if(ownerEpoch===epoch){item.pendingAnswers={...draft,...item.pendingAnswers};item.dirty=true;const msg=document.querySelector('.ds-timed>[role=status]');if(msg)msg.textContent='답 저장을 확인하지 못했어요. 세트를 닫기 전에 다시 시도해 주세요.';}throw err;}
 });return draftQueue;
}
async function action(command){if(busy)return;const sessionEpoch=epoch;notice='';
 if(command==='back'){if(active?.kind==='custom'){busy=true;try{await flushDraft(active);}catch{busy=false;return;}busy=false;}active=null;quote=null;paint();return;}
 if(command==='fixed'){active=remembered(grade)||{kind:'fixed',grade,questionIds:gradeBank().map(q=>q.id),startedAt:Date.now(),durationSeconds:1440,status:'running',responses:{}};saveFixed();paint();return;}
 if(command==='catalog'){await loadCatalog();return;}
 if(['family','unitwide','bookwide','fewer','alllevels','allbooks'].includes(command)){
  if(command==='alllevels'){level='';quote=null;paint();return;}
  if(command==='allbooks'){book='';unit='';type='';scopeMode='specific';}
  if(command==='fewer'){count=candidates().length;quote=null;paint();return;}
  if(command==='family')scopeMode='family';
  if(command==='unitwide'){scopeMode='unit';if(!unit){const u=unitOptions().find(u=>u.types?.some(t=>t.id===document.querySelector('[data-time-field=type]')?.value));unit=u?.id||'';}type='';}
  if(command==='bookwide'){unit='';type='';scopeMode='specific';}
  await loadCatalog();return;
 }
 if(command==='print'){printPaper(active.questionIds,title(),['finished','expired'].includes(active.status));return;}
 if(command==='finish'&&active?.kind==='fixed'){active.status='finished';saveFixed();paint();return;}
 if(!signed()||!service()){notice='로그인과 계정 연결을 확인해 주세요.';paint();return;}
 busy=true;try{
 if(command==='quote'){selection=candidates().map(q=>q.id);for(let i=selection.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[selection[i],selection[j]]=[selection[j],selection[i]];}selection=[...selection.filter(id=>catalogById.get(id)?.sourceKind==='existing_print'),...selection.filter(id=>catalogById.get(id)?.sourceKind!=='existing_print')].slice(0,count);if(selection.length!==count)throw Error('조건에 맞는 문항이 없어요.');const r=await service().quote({questionIds:selection,durationSeconds:minutes*60});if(sessionEpoch!==epoch)return;if(!Number.isSafeInteger(r.chargePoints)||r.chargePoints<0)throw Error('문항별 포인트를 확인할 수 없어요.');quote=r;req=nextRequest();}
 if(command==='start'&&quote){const result=await service().start({questionIds:selection,durationSeconds:minutes*60,catalogVersion:quote.catalogVersion,expectedCharge:quote.chargePoints,requestId:req});if(sessionEpoch!==epoch)return;await accept(result);quote=null;}
 if(command==='resume'){const result=await service().read(lastId?{setId:lastId}:{});if(sessionEpoch!==epoch)return;if(result.set===null){notice='아직 시작한 맞춤 세트가 없어요.';}else{await accept(result);}}
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
 }catch(e){if(sessionEpoch===epoch&&command==='start'&&['quote_changed','price_changed'].includes(e.code||e.message)){quote=null;notice='조건이 달라졌어요. 시작 전에 포인트를 다시 확인해 주세요.';}else if(sessionEpoch===epoch)notice=command==='resume'?'최근 세트를 불러오지 못했어요. 계정의 시작 기록을 확인해 주세요.':e.code==='no_points'||e.code==='insufficient_points'?'포인트가 부족해요. 문항 수를 줄인 뒤 다시 확인해 주세요.':e.code==='bad_answer'||e.message==='정수로 입력해 주세요.'?'답은 정수로 입력해 주세요.':'계정에서 요청을 확인하지 못했어요. 같은 조건으로 다시 확인해 주세요.';}finally{if(sessionEpoch===epoch){busy=false;paint();}}}
document.addEventListener('click',e=>{const b=e.target.closest(scope+' button');if(!b||busy)return;if(b.dataset.timeGrade){grade=+b.dataset.timeGrade;unit='';level='';book='';type='';scopeMode='specific';remote=null;seq++;quote=null;notice='';paint();}else if(b.dataset.timeAction)action(b.dataset.timeAction);});
document.addEventListener('change',e=>{const key=e.target.dataset.timeField;if(!key||busy)return;const v=e.target.value;
 if(key==='unit'){unit=v;type='';scopeMode='specific';}if(key==='type'){type=v;scopeMode='specific';if(type&&!unit)unit=unitOptions().find(u=>u.types?.some(t=>t.id===type))?.id||'';}
 if(key==='level')level=v;if(key==='minutes')minutes=+v;if(key==='count')count=+v;if(key==='book'){book=v;unit='';type='';scopeMode='specific';}
 quote=null;notice='';if(['book','unit','type'].includes(key))loadCatalog();else paint();});
document.addEventListener('input',e=>{const id=e.target.dataset.timeAnswer;if(id&&active?.questionIds.includes(id)&&!['finished','expired'].includes(active.status)&&remaining()>0){active.responses[id]=e.target.value.trim();saveFixed();if(active.kind==='custom'){const item=active;item.pendingAnswers||={};item.pendingAnswers[id]=active.responses[id];item.dirty=true;clearTimeout(draftTimer);draftTimer=setTimeout(()=>flushDraft(item).catch(()=>{}),600);}}});
setInterval(()=>{const el=document.querySelector('[data-time-clock]');if(!el||!active||['finished','expired'].includes(active.status))return;el.textContent=clock();if(remaining()===0&&!busy){if(active.kind==='fixed')action('finish');else if(!active.expirySent){const item=active;item.expirySent=true;action('finish');}}},1000);
const mount=()=>{if(signed()&&!remote&&!remoteStatus&&!active)loadCatalog();};
async function openSaved(id){
 if(!signed()||busy)return;
 if(active?.kind==='custom'&&active.dirty){try{await flushDraft(active);}catch{return;}}
 lastId=id;await action('resume');
}
window.DSStudentTimed={render:html,printPaper,renderPaper,mount,openSaved};
})();