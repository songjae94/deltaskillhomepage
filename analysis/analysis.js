'use strict';
(() => {
 const D = window.DeltaAnalysis;
 const byId = id => document.getElementById(id);
 if (!D) { byId('title').textContent='기출 자료를 불러오지 못했습니다.'; return; }
 const params=new URLSearchParams(location.search);
 const embed=params.get('embed')==='1';
 document.documentElement.classList.toggle('compact',embed);
 const tablet=embed && params.get('mode')==='tablet';
 document.documentElement.classList.toggle('tablet-edition',tablet);
 const hero=tablet && params.get('layout')==='hero';
 document.documentElement.classList.toggle('hero-edition',hero);
 const views=['analysis','theory','similar','notes'];
 const canonical = value=>String(value??'').trim();
 let step=Math.max(0,Math.min(D.steps.length-1,(Number.parseInt(params.get('step'),10)||1)-1));
 let view=!embed && views.includes(params.get('view'))?params.get('view'):'analysis';
 let similarIndex=Math.max(0,D.similar.findIndex(item=>item.id===params.get('item')));
 const items=[D.original,...D.similar];
 const key='deltaskill-analysis-note-v1-'+D.original.id+'-';
 const memory=new Map(),attempts=new Map();
 let storage=true;
 function h(value){const node=document.createElement('span');node.textContent=value??'';return node.innerHTML}
 function write(item,record){
  memory.set(item.id,record);
  try{localStorage.setItem(key+item.id,JSON.stringify(record))}
  catch{storage=false}
 }
 function read(item){
  if(!storage)return memory.get(item.id)||null;
  try{const value=JSON.parse(localStorage.getItem(key+item.id));return value&&typeof value.memo==='string'?value:null}
  catch{storage=false;return memory.get(item.id)||null}
 }
 function url(detail=false){
  const next=new URL(location.href);
  if(detail&&document.documentElement.dataset.palette)next.searchParams.set('palette',document.documentElement.dataset.palette);
  if(detail){next.searchParams.delete('embed');next.searchParams.delete('mode');next.searchParams.delete('layout')}
  next.searchParams.set('step',String(step+1));
  if(view==='analysis')next.searchParams.delete('view');else next.searchParams.set('view',view);
  if(view==='similar')next.searchParams.set('item',D.similar[similarIndex].id);else next.searchParams.delete('item');
  return next.href;
 }
 function syncUrl(){
  const link=byId('open-detail');link.href=url(true);document.querySelector('.mobile-detail').href=link.href;
  try{history.replaceState(null,'',url())}catch{}
 }
 function choiceList(item){return (item.optionsHtml||[]).map((option,i)=>'<span>'+['①','②','③','④','⑤'][i]+' '+option+'</span>').join(' ')}
 function init(){
  document.title=D.title+' · 기출 분석 공부창';
  byId('source').textContent=D.source;
  byId('title').textContent=D.title;
  byId('prompt').innerHTML=D.promptHtml;
  byId('conditions').innerHTML=D.conditions.map((cond,i)=>'<div class="condition-line">'+cond.html+'</div>').join('');
  byId('after-conditions').innerHTML=D.afterHtml||'';
  byId('original-options').innerHTML=choiceList(D.original);
  byId('steps').innerHTML=D.steps.map((s,i)=>'<button type="button" data-step="'+(i+1)+'" aria-label="'+(i+1)+'단계 '+h(s.title)+'">'+(i+1)+'. '+h(s.title)+'</button>').join('');
  byId('steps').addEventListener('click',e=>{const b=e.target.closest('[data-step]');if(b)selectStep(Number(b.dataset.step)-1)});
  byId('views').addEventListener('click',e=>{const b=e.target.closest('[data-view]');if(b)selectView(b.dataset.view)});
  byId('steps').addEventListener('keydown',e=>{
   if(!['ArrowLeft','ArrowRight','Home','End'].includes(e.key))return;
   e.preventDefault();const n=e.key==='Home'?0:e.key==='End'?D.steps.length-1:(step+(e.key==='ArrowLeft'?-1:1)+D.steps.length)%D.steps.length;
   selectStep(n);byId('steps').querySelector('[data-step="'+(n+1)+'"]').focus()
  });
  selectView(view);selectStep(step);
 }
 function selectStep(index){
  step=index;const s=D.steps[step];
  document.documentElement.dataset.analysisStep=String(step+1);
  
  document.querySelectorAll('[data-step]').forEach(b=>b.setAttribute('aria-pressed',String(Number(b.dataset.step)===step+1)));
  document.querySelector('.graph-heading h2').textContent=step===0?'조건 (가)로 확정한 두 점':step===1?'경계에서 바뀌는 부호':'우극한의 부호';
  byId('diagram-summary').textContent=step===0?'가로축의 두 점 (0, 0), (2, 0). 두 점에서 함수 g와 f의 값은 모두 0이다.':s.graph==='right-limit'?'조건으로 그린 우극한 H의 그래프. x=2의 아래쪽 점을 포함하고 자연수 2, 3에서 음수이다.':D.graphAlt;
  byId('counter').textContent=(step+1)+' / '+D.steps.length;
  byId('step-explanation').innerHTML='<p class="current-condition">'+['함수의 정의와 연속성','조건 (가) · 우극한의 존재','조건 (나) · 음수인 자연수'][s.condition]+'</p><h3>'+h(s.title)+'</h3>'+(tablet?s.tabletHtml:s.html);
  syncUrl();
  if(embed && parent!==window)parent.postMessage({type:'delta-analysis-step',step:step+1},location.protocol==='file:'?'*':location.origin);
 }
 function answers(item){
  const attempt=attempts.get(item.id);
  const saved=read(item);
  let controls;
  if(item.optionsHtml?.length)controls='<fieldset class="multiple"><legend>답 선택</legend>'+item.optionsHtml.map((opt,i)=>'<label><input name="answer" type="radio" required value="'+i+'" '+(attempt?.answer===String(i)?'checked ':'')+'>'+['①','②','③','④','⑤'][i]+' '+opt+'</label>').join('')+'</fieldset>';
  else controls='<label class="answer-label" for="typed-answer">답 입력</label><input id="typed-answer" class="answer-value" name="answer" type="text" autocomplete="off" inputmode="text" required maxlength="80" value="'+h(attempt?.answer||'').replaceAll('"','&quot;')+'">';
  return '<form class="grade" data-id="'+h(item.id)+'">'+controls+'<div class="h-actions"><button class="primary" type="submit">정답 확인</button></div></form>'+
   (attempt?'<div class="result" role="status"><strong>'+(attempt.correct?'정답입니다.':'다시 확인할 문제입니다.')+'</strong><div>'+item.explanationHtml+'</div></div><form class="memo" data-id="'+h(item.id)+'"><label class="answer-label">다시 볼 때 기억할 점<textarea name="memo" maxlength="500" placeholder="막힌 조건이나 다음에 확인할 점">'+h(saved?.memo||'')+'</textarea></label><div class="h-actions"><button class="primary" type="submit">'+(attempt.correct&&attempt.retry?'복습 완료로 기록':'오답노트에 기록')+'</button></div></form>':'');
 }
 let retryId=null;
 function attachAnswers(el,item){
  const form=el.querySelector('.grade');
  if(!form)return;
  form.onsubmit=e=>{
   e.preventDefault();const ans=canonical(new FormData(form).get('answer'));
   const normalize=x=>{
    const clean=canonical(x).replace(/[−–]/g,'-').replace(/\s+/g,'');
    return /^[-+]?\d+(?:\.0+)?$/.test(clean)?String(Number(clean)):clean;
   };
   attempts.set(item.id,{answer:ans,correct:normalize(ans)===normalize(item.answer),retry:retryId===item.id});
   renderPracticeArea();const feedback=document.querySelector('.result');feedback?.scrollIntoView({block:'nearest'});
  };
  const memo=el.querySelector('.memo');
  if(memo)memo.onsubmit=e=>{
   e.preventDefault();const attempt=attempts.get(item.id);
   write(item,{memo:String(new FormData(memo).get('memo')).trim(),answer:attempt.answer,done:attempt.correct&&attempt.retry});
   retryId=null;selectView('notes');byId('detail-panel').focus({preventScroll:true});
  };
 }
 function renderPracticeArea(){
  if(view==='analysis'){
   if(embed)return;
   const el=byId('original-answer');el.innerHTML='<h2>원문항 풀기</h2>'+answers(D.original);attachAnswers(el,D.original);
  }else if(view==='similar'){
   const item=D.similar[similarIndex],el=byId('detail-panel');
   const switcher=D.similar.length>1?'<nav class="h-actions">'+D.similar.map((s,i)=>'<button type="button" data-similar="'+i+'" aria-pressed="'+(i===similarIndex)+'">'+h(s.title)+'</button>').join('')+'</nav>':'';
   el.innerHTML='<p class="source-small">유사문항</p><h2>'+h(item.title)+'</h2>'+switcher+'<div class="exercise-text">'+item.promptHtml+'</div>'+answers(item);
   el.querySelectorAll('[data-similar]').forEach(b=>b.onclick=()=>{similarIndex=Number(b.dataset.similar);syncUrl();renderPracticeArea()});
   attachAnswers(el,item);
  }
 }
 function renderDetails(){
  const el=byId('detail-panel');
  if(view==='theory'){el.innerHTML='<h2>관련 이론</h2>'+D.theoryHtml;return}
  if(view==='similar'){renderPracticeArea();return}
  if(view==='notes'){
   const notes=items.map(item=>({item,entry:read(item)})).filter(pair=>pair.entry);
   el.innerHTML='<h2>내 오답노트</h2><p class="note">'+(storage?'메모와 복습 상태를 이 브라우저에 저장합니다.':'이 환경에서는 화면을 열어 둔 동안만 기록을 보관합니다.')+'</p>'+
    (notes.length?notes.map(({item,entry})=>'<article class="record"><p class="source-small">'+(item===D.original?'원문항':'유사문항')+' · '+(entry.done?'복습 완료':'다시 풀 문항')+'</p><h3>'+h(item.title)+'</h3><p>'+h(entry.memo)+'</p><button class="secondary" type="button" data-retry="'+h(item.id)+'">다시 풀기 →</button></article>').join(''):'<p>아직 저장한 문항이 없습니다.</p><button class="secondary" type="button" data-retry="'+h(D.original.id)+'">원문항 풀기 →</button>');
   el.querySelectorAll('[data-retry]').forEach(b=>b.onclick=()=>{
    const item=items.find(x=>x.id===b.dataset.retry);retryId=item.id;attempts.delete(item.id);
    if(item===D.original){selectView('analysis');byId('original-answer').scrollIntoView({block:'start'})}
    else{similarIndex=D.similar.indexOf(item);selectView('similar')}
   });
  }
 }
 function selectView(next){
  view=embed?'analysis':next;
  byId('analysis-panel').hidden=view!=='analysis';
  byId('detail-panel').hidden=view==='analysis';
  if(view==='analysis'){byId('detail-panel').replaceChildren();renderPracticeArea()}else {byId('original-answer').replaceChildren();renderDetails()}
  document.querySelectorAll('[data-view]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.view===view)));syncUrl();
 }
 if(embed && parent!==window)window.addEventListener('message',event=>{
  const n=event.data?.step;
  if(event.source===parent && (location.protocol==='file:'||event.origin===location.origin) &&
     event.data?.type==='delta-analysis-select'&&Number.isInteger(n)&&n>0&&n<=D.steps.length)selectStep(n-1);
 });
 window.addEventListener('storage',e=>{if(view==='notes' && (e.key?.startsWith(key)||e.key===null))renderDetails()});
 init();
})();
