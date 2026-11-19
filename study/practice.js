'use strict';
const parameters = new URLSearchParams(location.search);
const embedded = parameters.get('embed') === '1';
if (embedded) document.documentElement.classList.add('tablet');
const exam = parameters.get('exam') === 'csat' ? 'csat' : 'school';
const examName = exam === 'csat' ? '수능' : '내신';
const home = '../index.html?audience=student&exam=' + exam;
document.querySelectorAll('a[href="../index.html"]').forEach(link=>link.href=home);
const materials = '../materials/index.html?exam=' + exam + '&audience=student';
document.getElementById('materials-top').href = materials;
const main = document.getElementById('main');
const wrap = body => '<math xmlns="http://www.w3.org/1998/Math/MathML">' + body + '</math>';
const num = value => '<mn>' + value + '</mn>';
const op = value => '<mo>' + value + '</mo>';
const x = '<mi>x</mi>', a = '<mi>a</mi>';
const frac = (top,bottom) => '<mfrac><mrow>' + top + '</mrow><mrow>' + bottom + '</mrow></mfrac>';
const paren = content => '<mrow>' + op('(') + content + op(')') + '</mrow>';
const factor = value => paren(x + op('+') + num(value));
const power = (base,exponent) => '<msup>'+num(base)+'<mrow>'+exponent+'</mrow></msup>';
const half = frac(num(1),num(2));
const levels={easy:'기초 연습',base:'기본 연습',hard:'도전 연습'};
const level=Object.hasOwn(levels,parameters.get('level'))?parameters.get('level'):'base';
const radical = body => '<msqrt><mrow>'+body+'</mrow></msqrt>';
const sub = n => '<msub><mi>a</mi>'+num(n)+'</msub>';
const fn = arg => '<mi>f</mi>'+paren(arg);
const finals=window.FinalsIntegralBank;
const ladder={easy:finals.easy,middle:finals.middle,hard:finals.hard};
const items={base:finals.middle,timed:finals.timed[16],notebook:finals.timed[10],...ladder};

const requested = parameters.get('item');
const practiceId = Object.hasOwn(items,requested) ? requested : level;
let currentId = practiceId, lesson = items[practiceId];
function entryKey(id){
 if(Object.hasOwn(ladder,id))return 'deltaskill-study-integral-v1-'+exam+'-'+id;
 return 'deltaskill-study-integral-other-v1-'+exam+(id==='base'?'':'-'+id.replace(/^previous-/,''));
}
function itemLink(id,view='practice'){
 const u=new URL(location.href);u.searchParams.delete('level');u.searchParams.set('item',id);u.hash=view;
 return escapeHTML(u.pathname.split('/').pop()+u.search+u.hash);
}
function levelPicker(){
 if (!Object.hasOwn(ladder,currentId)) return '';
 return '<nav class="levelPicker" aria-label="같은 주제 난이도"><strong>적분 · 난이도 선택</strong><div>'+
 Object.entries(levels).map(([old,name])=>{const id=old==='base'?'middle':old;return '<a href="'+itemLink(id)+'" '+(id===currentId?'aria-current="page"':'')+'>'+name+'</a>'}).join('')+'</div></nav>';
}
const circles=['①','②','③','④','⑤'];
const memory=new Map();
let storageAvailable=true, selected=null, submitted=false, notice='';
function readEntry(id=currentId){
 try {
  if (!storageAvailable) return memory.get(id)||null;
  const data=JSON.parse(localStorage.getItem(entryKey(id)));
  if(data && Number.isInteger(data.choice) && data.choice>=0 && data.choice<5 && typeof data.memo==='string')return data;
 }catch {storageAvailable=false;return memory.get(id)||null}
 return null;
}
function saveEntry(entry){
 memory.set(currentId,entry);
 try{localStorage.setItem(entryKey(currentId),JSON.stringify(entry))}
 catch{storageAvailable=false}
}
function escapeHTML(text){
 const node=document.createElement('span');
 node.textContent=text;
 return node.innerHTML;
}
function heading(title,view){
 if (embedded) {
  const note = view === 'note';
  return '<div class="tablet-bar"><span class="tablet-name">델타스킬 · '+examName+' 연습장</span><nav aria-label="연습장 메뉴">'+
   '<a href="#practice" '+(!note?'aria-current="page"':'')+'>문제</a><a href="#note" '+(note?'aria-current="page"':'')+'>오답노트</a></nav></div>';
 }
 const here=view==='hub'?'공부하기':view==='note'?'오답노트':view==='timed'?'타임어택':'한 문제 풀기';
 const root='<a href="'+home+'">홈</a><span aria-hidden="true">/</span>';
 const back=view==='hub'?'':'<a href="#hub">공부하기</a><span aria-hidden="true">/</span>';
 const switcher=['school','csat'].map(id=>'<a aria-current="'+(id===exam?'page':'false')+'" href="?exam='+id+(view==='practice'?'&item='+currentId:'')+'#'+view+'">'+(id==='school'?'내신':'수능')+'</a>').join('');
 return '<div class="crumb">'+root+back+here+'</div><div class="lead"><h1>'+title+'</h1><nav class="seg" aria-label="시험 선택">'+switcher+'</nav></div>';
}
function row(href,title,subtitle,external=false){
 return '<a class="row" href="'+href+'" '+(external?'target="_blank" rel="noopener"':'')+'><span>'+title+'<small>'+subtitle+'</small></span><span aria-hidden="true">'+(external?'↗':'→')+'</span></a>';
}
function officialLinks(){
 if (embedded) return '';
 return '<div class="strip">'+(exam==='csat'?row('../features/prediction.html','수능 번호별 예상 분석','자주 출제되는 주제와 예상 분석서'): '')+row(materials,examName+' 자료받기',exam==='csat'?'수능 대비 교재와 자료':'과목·단원별 자료와 파일 형식')+
 (exam==='csat'?row('https://www.deltaskill.co.kr/exam/sn27/','2027 수능 채점·오답노트','11월 19일 시행 · 평가원 가답안 채점 · 새 창',true):'')+
 (exam==='csat'?row('https://www.deltaskill.co.kr/exam/m09/','9월 모의평가 학습관','기존 서비스 · 채점·문제·해설 · 새 창',true):'')+
 row('https://www.deltaskill.co.kr/pilot/','내 계정의 오답노트','이 브라우저 기록과 별개입니다. 로그인 필요 · 새 창',true)+'</div>';
}
const units=[{name:'정적분과 넓이',examples:['easy','middle','hard']},{name:'적분으로 정의된 함수',examples:['timed']},{name:'오답 복습 예제',examples:['notebook']}];
function renderHub(){
 const entries=Object.keys(items).map(id=>readEntry(id)).filter(Boolean);
 const exampleId=requested?practiceId:'middle';
 const initial=units.findIndex(unit=>unit.examples.includes(exampleId));
 main.innerHTML=heading(examName+' 공부하기','hub')+
 '<section class="unitDesk"><p data-workbook-summary="연습 계획 기준" hidden></p><h2>단원별 예제</h2><nav class="unitTabs" aria-label="연습할 단원">'+units.map(({name},i)=>'<button data-unit="'+i+'" aria-controls="examples">'+name+'</button>').join('')+'</nav><div id="examples" aria-live="polite"></div></section>'+
 '<div class="studyTools"><section class="box"><p class="kicker">이 브라우저의 기록</p><h2>오답노트</h2><p>'+(entries.length?('기록한 문항 '+entries.length+'개 · 복습 완료 '+entries.filter(e=>e.done).length+'개'):'다시 볼 문제와 막힌 지점을 모아보세요.')+'</p><a class="minor" href="#note">오답노트 열기 →</a></section><section class="box"><p class="kicker">시간을 정해 연습</p><h2>타임어택</h2><p>'+timedModes.map(([minutes,count])=>minutes+'분·'+count+'문항').join(' 또는 ')+'</p><a class="minor" href="#timed">실전 연습 열기 →</a></section></div>'+officialLinks();
 function choose(index){
  const unit=units[index];
  for(const btn of main.querySelectorAll('[data-unit]'))btn.setAttribute('aria-pressed',String(Number(btn.dataset.unit)===index));
  main.querySelector('#examples').innerHTML=unit.examples.map(id=>{
   const item=items[id],entry=readEntry(id);
   return '<article class="exampleRow"><div><p class="kicker">'+item.short+'</p><h3>'+item.title+'</h3><p>'+(Object.hasOwn(ladder,id)?'부호와 넓이 · 적분의 활용':'예제와 단계별 풀이')+'</p></div><a class="action" aria-label="'+item.title+' '+(entry?'다시 풀기':'예제 풀기')+'" href="'+itemLink(id,entry?'retry':'practice')+'">'+(entry?'다시 풀기':'예제 풀기')+' →</a></article>';
  }).join('');
 }
 for(const btn of main.querySelectorAll('[data-unit]'))btn.onclick=()=>choose(Number(btn.dataset.unit));
 choose(Math.max(0,initial));
}
let timerId;
function workedSolution(){
 const formula=body=>wrap('<mstyle displaystyle="true">'+body+'</mstyle>');
 const equals=op('='), plus=op('+'), minus=op('−'), times=op('×');
 const quot=(n,d)=>frac(num(n),num(d));
 const reciprocal=denominator=>frac(num(1),denominator);
 const d='<mi>d</mi>';
 const oldKey=currentId.replace(/^previous-/,'');
 let lines;
 if(lesson.solution)lines=lesson.solution;
 else if(exam==='school' && ['base','middle','easy','hard'].includes(oldKey)){
  const end={base:9,middle:8,easy:3,hard:20}[oldKey];
  const last=factor(end);
  const first={base:2,middle:1,hard:2}[oldKey];
  lines=oldKey==='easy'?['좌변의 두 항을 통분하면 다음과 같다.']:
   ['첫째 항을 두 분수의 차로 나타내면 '+formula(frac(num(first),x+factor(first))+equals+reciprocal(x)+minus+reciprocal(factor(first)))+'이다.',
    '나머지 항도 같은 방법으로 나타내어 더하면 가운데 항이 소거된다.'];
  lines.push(formula(reciprocal(x)+minus+reciprocal(last)+equals+frac(num(end),x+last)),
   '따라서 '+formula(a+equals+num(end))+'이다.');
 }else if(exam==='school' && oldKey==='timed'){
  lines=['첫째 근호 안의 식이 0 이상이므로 '+formula(minus+num(3)+op('≤')+x+op('≤')+num(3))+'이다.',
   '둘째 근호는 분모에 있으므로 '+formula(x+plus+num(2)+op('>')+num(0))+'이다.',
   '따라서 '+formula(minus+num(2)+op('&lt;')+x+op('≤')+num(3))+'인 정수는 −1, 0, 1, 2, 3의 5개이다.'];
 }else if(exam==='school'){
  lines=['두 점근선의 방정식에서 '+formula(a+equals+num(2)) +', '+formula('<mi>b</mi>'+equals+num(4))+'이다.',
   formula(fn(x)+equals+num(2)+plus+frac(num(3),x+minus+num(4)))+'이고, 주어진 구간에서 이 함수는 감소한다.',
   '따라서 최댓값과 최솟값의 차는 '+formula(fn(num(0))+minus+fn(num(2))+equals+quot(5,4)+minus+half+equals+quot(3,4))+'이다.'];
 }else if(oldKey==='timed'){
  const derivative=arg=>'<msup><mi>f</mi><mo>′</mo></msup>'+paren(arg);
  lines=['미분계수의 정의에 의하여 주어진 극한값은 '+formula(derivative(num(2)))+'이다.',
   formula(derivative(x)+equals+num(6)+'<msup>'+x+num(2)+'</msup>'+minus+num(1))+'이므로',
   formula(derivative(num(2))+equals+num(6)+times+power(2,num(2))+minus+num(1)+equals+num(23))+'이다.'];
 }else if(oldKey==='notebook'){
  lines=['공차를 '+formula(d)+'라 하면 '+formula(sub(10)+minus+sub(7)+equals+num(3)+d+equals+num(9))+'이므로 '+formula(d+equals+num(3))+'이다.',
   '따라서 '+formula(sub(7)+equals+sub(2)+plus+num(5)+d+equals+num(2)+plus+num(15)+equals+num(17))+'이다.'];
 }else if(oldKey==='middle'){
  lines=[formula(power(4,half)+equals+num(2)) +', '+formula(power(8,quot(1,3))+equals+num(2))+'이다.',
   '따라서 주어진 식의 값은 '+formula(num(2)+times+num(2)+equals+num(4))+'이다.'];
 }else if(oldKey==='easy'){
  lines=['밑이 같은 두 거듭제곱의 곱은 지수를 더하여 나타낸다.',
   formula(power(2,half)+times+power(2,half)+equals+power(2,half+plus+half)+equals+num(2))];
 }else{
  const isHard=oldKey==='hard';
  lines=[(isHard?formula(power(8,quot(2,3))+equals+power(2,num(2)))+', ':'')+formula(power(4,minus+half)+equals+power(2,minus+num(1)))+'이다.',
   '밑을 2로 통일하면 주어진 식의 값은 다음과 같다.',
   formula(power(2,isHard?num(2):quot(3,2))+times+power(2,minus+num(1))+(isHard?op('÷')+power(2,half):'')),
   formula(equals+power(2,(isHard?num(2):quot(3,2))+minus+num(1)+(isHard?minus+half:''))+equals+power(2,half))];
 }
 return '<details class="worked"><summary>풀이 보기</summary><div>'+lines.map(line=>'<p>'+line+'</p>').join('')+'</div></details>';
}
function aiStudyGuide(){
 return '<section class="ai-guide" aria-labelledby="ai-guide-title"><div class="ai-guide-head"><strong id="ai-guide-title">델타스킬 AI</strong><span>학습 안내</span></div><h3>막힌 부분부터, 다시 풀 수 있게.</h3><p>필요한 설명을 확인하고, 더 쉬운 문제로 연습하거나 다음 단계에 도전하세요.</p><div class="ai-guide-choices" role="group" aria-label="필요한 학습 도움"><button type="button" data-ai-help="condition" aria-pressed="false">조건이 어려워요</button><button type="button" data-ai-help="calculation" aria-pressed="false">식·계산이 막혀요</button><button type="button" data-ai-help="practice" aria-pressed="false">다음 문제 고르기</button></div><div id="ai-guidance" class="ai-guidance" aria-live="polite" hidden></div><small>현재는 준비된 문항별 설명을 연결합니다. 자동 풀이 진단은 아직 연결 전입니다.</small></section>';
}
function wireAiStudyGuide(){
 const target=document.getElementById('ai-guidance');
 for(const button of main.querySelectorAll('[data-ai-help]'))button.onclick=()=>{
  main.querySelectorAll('[data-ai-help]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));
  const kind=button.dataset.aiHelp;
  const isLimit=Object.hasOwn(ladder,currentId);
  if(kind==='condition'){
   const text=isLimit?(currentId==='hard'?'적분으로 정의된 함수의 도함수와 증감 구간을 확인합니다. 수평선과의 교점 수는 극값과 구간 양 끝의 함숫값에 따라 달라집니다.':'넓이는 음수가 될 수 없으므로 함수의 영점을 기준으로 구간을 나눕니다. 각 구간의 부호를 확인한 뒤 정적분을 계산합니다.'):'적분 구간과 피적분함수를 확인합니다. 구하는 양이 정적분의 값인지 도형의 넓이인지 구분합니다.';
   target.innerHTML='<h4>먼저 확인할 조건</h4><p>'+text+'</p>'+(isLimit?'<a href="'+itemLink('easy')+'">넓이의 기본부터 연습하기 →</a>':'');
  }else if(kind==='calculation'){
   target.innerHTML='<h4>첫 풀이 단계부터 확인하기</h4><p>한 단계만 확인한 뒤 문제로 돌아가 이어서 풀어보세요.</p>'+(lesson.solution?lesson.solution.map((line,i)=>'<details><summary>'+String(i+1)+'단계 보기</summary><p>'+line+'</p></details>').join(''):workedSolution());
  }else{
   target.innerHTML='<h4>다음 연습을 선택하세요</h4><p>지금 문제를 풀기 어려웠다면 기초부터, 스스로 풀었다면 도전 문제로 이어가세요.</p>'+(isLimit?'<div class="ai-next"><a href="'+itemLink('easy')+'">더 쉬운 문제로 연습 →</a><a href="'+itemLink('hard')+'">더 어려운 문제에 도전 →</a></div>':'<a href="#hub">단원별 연습 찾기 →</a>');
   if(submitted)target.innerHTML+='<button type="button" id="ai-note-focus">이번 풀이를 오답노트에 기록 ↓</button>';
  }
  target.hidden=false;
  target.querySelector('#ai-note-focus')?.addEventListener('click',()=>{document.getElementById('note-form')?.scrollIntoView({block:'center'});document.getElementById('memo')?.focus({preventScroll:true})});
 };
}
function renderPractice(retry){
 const entry=readEntry();
 const choices=lesson.options.map((value,i)=>'<label class="choice"><input type="radio" name="answer" value="'+i+'" required '+(selected===i?'checked ':'')+(submitted?'disabled':'')+'><span>'+circles[i]+'</span>'+wrap(value)+'</label>').join('');
 const result=submitted?(selected===lesson.answer?'정답입니다.':'정답은 '+circles[lesson.answer]+' '+wrap(lesson.options[lesson.answer])+'입니다.'):'';
 main.innerHTML=heading(retry?'다시 풀기':'한 문제 풀기','practice')+
 '<section class="box sheet"><p data-workbook-summary="연습 계획 기준" hidden></p><p class="kicker">'+lesson.source+' · '+lesson.short+'</p><h2>'+lesson.title+'</h2><div class="question">'+lesson.question+
 (lesson.equation?'<div class="equation">'+lesson.equation.map(part=>wrap('<mstyle displaystyle="true">'+part+'</mstyle>')).join('<wbr>')+'</div>'+lesson.tail:'')+
 '</div><form id="answer-form"><fieldset class="choices"><legend>답 선택</legend>'+choices+'</fieldset>'+
 (submitted?'':'<button class="action">정답 확인</button>')+'</form>'+
 (submitted?'<div class="feedback" role="status">'+result+'</div>'+workedSolution()+'<form id="note-form" class="entry"><label class="text" for="memo">다시 볼 때 기억할 점 (선택)</label><textarea id="memo" maxlength="300" placeholder="어디에서 막혔나요?"></textarea><div class="form-actions"><button class="action">'+(retry&&selected===lesson.answer?'복습 완료로 기록':'오답노트에 기록')+'</button><button type="button" class="minor" id="again">한 번 더 풀기</button></div></form>':'')+
 '</section>'+aiStudyGuide()+levelPicker()+(embedded?'':'<div class="strip">'+row('#note','오답노트 보기',examName+' 학습 기록')+'</div>');
 wireAiStudyGuide();
 window.dispatchEvent(new Event('delta-workbook-render'));
 const form=document.getElementById('answer-form');
 form.onsubmit=e=>{e.preventDefault();selected=Number(new FormData(form).get('answer'));submitted=true;renderPractice(retry);const feedback=document.querySelector('.feedback');if(embedded){const top=feedback.getBoundingClientRect().top;if(top>innerHeight-90)window.scrollBy(0,top-32)}else feedback.scrollIntoView({block:'nearest'})};
 if(submitted){
  const memo=document.getElementById('memo');
  memo.value=entry?.memo||'';
  document.getElementById('note-form').onsubmit=e=>{
   e.preventDefault();
   const done=retry&&selected===lesson.answer;
   saveEntry({choice:selected,memo:memo.value.trim(),done});
   notice=done?'복습 완료로 기록했습니다.':'오답노트에 기록했습니다.';
   location.hash='note';
  };
  document.getElementById('again').onclick=()=>{selected=null;submitted=false;renderPractice(retry);document.querySelector('.choice input').focus()};
 }
}
function renderNote(){
 const sample=items.notebook;
 const sampleLink='<a class="minor" href="'+itemLink('notebook')+'">'+sample.title+' 풀고 기록하기 →</a>';
 const details=Object.keys(items).map(id=>{
 const entry=readEntry(id);
 if(!entry)return '';
 const item=items[id];
 return '<div class="entry"><span class="tag">'+(entry.done?'복습 완료':'다시 풀 문항')+'</span><p class="meta">'+item.source+' · '+item.short+'</p><h3>'+item.title+'</h3><p>지난 선택 '+circles[entry.choice]+' '+wrap(item.options[entry.choice])+'</p>'+(entry.memo?'<p>'+escapeHTML(entry.memo)+'</p>':'')+'<a href="'+itemLink(id,'retry')+'" class="minor">다시 풀기 →</a></div>';}).join('')||
 '<div class="empty"><p>아직 기록한 문항이 없어요. 한 문제를 풀고 다시 볼 점을 남겨보세요.</p>'+sampleLink+'</div>';
 main.innerHTML=heading(examName+' 오답노트','note')+'<section class="box sheet"><p class="kicker">로그인 없이 체험</p><h2>내 복습 기록</h2><p>'+(storageAvailable?'여기에 남긴 기록은 이 브라우저에 저장됩니다.':'현재 브라우저에서는 이 화면을 열어 둔 동안만 기록이 유지됩니다.')+'</p>'+(notice?'<div role="status" class="feedback">'+notice+'</div>':'')+details+(requested==='notebook' && readEntry('notebook')===null && Object.keys(items).some(id=>readEntry(id))?sampleLink:'')+'</section>'+officialLinks();notice='';
}
function render(){
 clearInterval(timerId);
 const view=location.hash.slice(1)||(embedded?'practice':'hub');
 document.querySelectorAll('#study-nav a').forEach(link=>{const match=link.hash==='#'+view || link.hash==='#hub'&&['practice','retry'].includes(view);if(match)link.setAttribute('aria-current','page');else link.removeAttribute('aria-current')});
 currentId=view==='timed'?'timed':practiceId;lesson=items[currentId];
 selected=null;submitted=false;
 if(view==='timed')renderTimed();else if(view==='note')renderNote();else if(view==='practice'||view==='retry')renderPractice(view==='retry');else renderHub();
 window.dispatchEvent(new Event('delta-workbook-render'));
 document.title=(view==='timed'?'타임어택':view==='note'?'오답노트':view==='retry'?'다시 풀기':view==='practice'?'한 문제 풀기':'공부하기')+' · '+examName+' · 델타스킬';
}
window.addEventListener('hashchange',()=>{render();main.focus({preventScroll:true});window.scrollTo(0,0)});
window.addEventListener('storage',e=>{if(Object.keys(items).some(id=>entryKey(id)===e.key) && ['','#hub','#note'].includes(location.hash))render()});
render();

if(embedded && parent !== window){
 function notifyInteraction(){
  parent.postMessage({type:'deltaskill-study-interaction',exam},location.protocol === 'file:' || location.origin === 'null'?'*':location.origin);
 }
 document.addEventListener('pointerdown',notifyInteraction,{once:true});
 document.addEventListener('keydown',notifyInteraction,{once:true});
}
