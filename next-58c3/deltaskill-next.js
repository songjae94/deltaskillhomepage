'use strict';
const $=s=>document.querySelector(s);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const get=(k,d)=>{try{return JSON.parse(localStorage.getItem('ds-next-'+k))??d}catch{return d}};
const put=(k,v)=>{try{if(k==='studio-v2'&&v?.itemSource==='exam-basic-v34')return true;const safe=k==='studio-v2'&&window.DSAccountDesignApplied?{...v,printSettings:window.PrintComposerV14.normalizeSettings()}:v;localStorage.setItem('ds-next-'+k,JSON.stringify(safe));return true}catch{return false}};
const link=(h,t,c='')=>`<a href="#${h}" class="${c}">${t}</a>`;
const math=body=>`<math xmlns="http://www.w3.org/1998/Math/MathML"><mstyle displaystyle="true">${body}</mstyle></math>`;
const bank=window.FinalsIntegralBank;
const catalog=window.DSCatalog||[];
function question(q,id,i){const shift=(i+2)%q.options.length;return {...q,id,options:q.options.slice(shift).concat(q.options.slice(0,shift)),answer:(q.answer-shift+q.options.length)%q.options.length}}
const regularBank=[bank.easy,bank.middle,bank.hard].map((q,i)=>question(q,'FINALS-'+['EASY','MIDDLE','HARD'][i],i));
const timerBank=bank.timed.map((q,i)=>question(q,'FINALS-T'+String(i+1).padStart(2,'0'),i));
let role=get('role','student'),studentTab='study',quickSelected='',quickHelp=false;
let qbank=regularBank,questionIndex=0,selected='',checked=false,hintUsed=false,sessionResults=[];
let timed=false,remaining=360,deadline=0,clock=null,ended=false,feedbackContext='';
let studio=get('studio-v2',{sku:catalog[0]?.sku,source:'materials',kind:'숫자 변형',level:'기초',layout:'2',count:'3'});
let library={subject:'전체',term:''},detailSku=catalog[0]?.sku,detailPage=0;
let loginState={busy:false,error:'',phone:''},accountState={loading:false,error:'',library:[],passSets:[]},downloadMap=new Map(),accountEpoch=0;
const nativeOrigin=window.DSService.isLiveOrigin;
function toast(message){$('#toast').textContent=message;$('#toast').classList.add('show');clearTimeout(toast.t);toast.t=setTimeout(()=>$('#toast').classList.remove('show'),4000)}
function brand(){return '<span class="brand">DELTA<span class="delta">SKILL</span></span>'}
function header(page){
 const home=page==='home',isTeacher=role==='teacher',accountPage=['login','account','account-settings'].includes(page);
 document.body.classList.toggle('home-body',home);document.body.classList.toggle('working-body',!home);document.body.classList.toggle('creator-body',['teacher','studio'].includes(page));
 const nav=isTeacher?[['teacher','자료 만들기'],['classroom','반 관리'],['library','자료실']]:[['student','공부'],['account','내 기록'],['csat','수능·모의고사']];
 $('#header').innerHTML=`<div class="header"><a href="#home" aria-label="델타스킬 대문">${brand()}</a>${home?'':`<nav aria-label="주 메뉴">${nav.map(([r,t])=>`<a href="#${r}"${r===page?' aria-current="page"':''}>${t}</a>`).join('')}</nav>`}<div class="meta">${home||page==='login'?'':`<div class="role-switch" aria-label="이용자 전환"><a href="${accountPage?'#account':'#student'}"${accountPage?' data-account-role="student"':''}${!isTeacher?' aria-current="page"':''}>학생</a><a href="${accountPage?'#account':'#teacher'}"${accountPage?' data-account-role="teacher"':''}${isTeacher?' aria-current="page"':''}>선생님</a></div>`}<a class="login" href="#${DSService.session()?'account':'login'}">${DSService.session()?'마이페이지':'로그인'}</a>${!home&&!accountPage&&!DSService.session()?'<a class="account-dot" href="#account" aria-label="마이페이지"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8" r="3.5"/><path d="M5 20v-2a7 7 0 0 1 14 0v2"/></svg></a>':''}</div></div>`;
 $('#dock').innerHTML=home?'<nav class="role-dock" aria-label="이용자 선택"><a href="#student" data-entry="student">학생</a><a href="#teacher" data-entry="teacher">선생님</a></nav>':'';
}
function compactFooter(){return `<footer class="work-footer"><span>개편 미리보기</span><div>${link('account','마이페이지')}${link('home','대문')}<button data-feedback="화면 의견">의견</button></div></footer>`}
function choices(q,name,chosen='',disabled=false){return `<fieldset class="quick-field"><legend class="sr-only">답 선택</legend><div class="quick-answers">${q.options.map((o,i)=>`<label><input type="radio" name="${name}" value="${i}"${String(i)===chosen?' checked':''}${disabled?' disabled':''}><span><small>${['①','②','③','④','⑤'][i]}</small>${math(o)}</span></label>`).join('')}</div></fieldset>`}
const studyUnits=[
 {id:'area',name:'정적분과 넓이',questions:[regularBank[0],...timerBank.slice(8,16)]},
 {id:'integral',name:'정적분 계산',questions:[regularBank[1],...timerBank.slice(0,8)]},
 {id:'defined',name:'정적분으로 정의된 함수',questions:[regularBank[2],...timerBank.slice(16,24)]}
];
let studyPick=get('question-selection',{unit:'area',id:'FINALS-EASY'});
function selectedStudyUnit(){return studyUnits.find(u=>u.id===studyPick.unit)||studyUnits[0]}
function selectedStudyQuestion(){const u=selectedStudyUnit();return u.questions.find(q=>q.id===studyPick.id)||u.questions[0]}
function studyPicker(){const u=selectedStudyUnit(),q=selectedStudyQuestion();return `<div class="study-picker" aria-label="공부할 문항 선택"><label><span>단원</span><select id="study-unit" aria-label="공부할 단원">${studyUnits.map(v=>`<option value="${v.id}"${v.id===u.id?' selected':''}>${esc(v.name)}</option>`).join('')}</select></label><label><span>문항</span><select id="study-question" aria-label="풀 문항">${u.questions.map((v,i)=>`<option value="${v.id}"${v.id===q.id?' selected':''}>${String(i+1).padStart(2,'0')} · ${i===0?v.short.split(' · ')[0]:'연습 '+i}</option>`).join('')}</select></label></div>`}
function quickQuestion(){const u=selectedStudyUnit(),q=selectedStudyQuestion(),index=u.questions.indexOf(q);return `<article class="quick-paper"><div class="paper-heading"><span>미적분Ⅰ · ${esc(u.name)}</span><span class="paper-count">${index+1} <em>/ ${u.questions.length}</em></span></div><div class="quick-question"><span class="question-no">${String(index+1).padStart(2,'0')} · ${esc(q.short)}</span><div class="question-stem">${q.question}</div></div>${choices(q,'quickanswer',quickSelected)}<div class="quick-bottom"><button class="text-action" data-quick-hint>풀이 한 단계</button><button class="primary" data-quick-check ${quickSelected===''?'disabled':''}>답 확인</button></div><div class="quick-hint solution"${quickHelp?'':' hidden'}>${q.solution[0]}</div></article>${studyPicker()}`}

function timerFeature(){return `<article class="time-feature"><div class="feature-heading"><h2>타임어택</h2><span>6문항</span></div><div class="feature-clock">06<span>:</span>00</div><div class="feature-track"><i></i></div><button data-start="timed">시작</button></article>`}
function timedLaunch(){return `<article class="timed-launch"><span class="small">정적분 · 6문항</span><h2>06<span>:</span>00</h2><div class="timed-slots">${[1,2,3,4,5,6].map(n=>`<i>${n}</i>`).join('')}</div><button class="primary" data-start="timed">시작</button><p>막히면 넘기고, 다시 돌아오세요.</p></article>`}
function student(){const last=get('results-v2',[]).at(-1);return `<section class="work-surface"><div class="work-heading"><h1>공부</h1><div class="work-tabs" aria-label="학습 선택"><button data-study-tab="study" aria-pressed="${studentTab==='study'}">바로 풀기</button><button data-study-tab="timed" aria-pressed="${studentTab==='timed'}">타임어택</button><a href="#library">내신자료</a></div></div><div class="student-work${studentTab==='timed'?' timed-first':''}"><div class="main-work">${studentTab==='timed'?timedLaunch():quickQuestion()}</div><aside class="work-shortcuts">${studentTab==='timed'?`<button class="practice-shortcut" data-study-tab="study"><span>바로 풀기</span><b>∫</b><small>정적분과 넓이</small></button>`:timerFeature()}<a href="#library" class="material-feature"><div><h2>내신 변형</h2><span>공통수학2 · 미적분Ⅰ</span></div><div class="mini-books" aria-hidden="true"><i></i><i></i><div><small>DELTASKILL</small><b>내신<br>변형</b><span>수학</span></div></div></a></aside></div><div class="recent-strip"><span>${last?'최근 학습':'내 기록'}</span><a href="#progress">${last?`정적분 · ${last.questions.filter(q=>q.correct).length} / ${last.questions.length} 정답`:'학습 기록 보기'}</a><a href="#progress" class="recent-more">전체 보기</a></div>${compactFooter()}</section>`}
function start(mode='normal',custom){clearInterval(clock);timed=mode==='timed';qbank=custom|| (timed?[0,1,8,9,16,17].map(i=>timerBank[i]):regularBank);questionIndex=0;selected='';checked=false;hintUsed=false;sessionResults=[];remaining=360;deadline=Date.now()+360000;ended=false;location.hash='#practice';renderPractice();if(timed)clock=setInterval(tick,250)}
function tick(){remaining=Math.max(0,Math.ceil((deadline-Date.now())/1000));const el=$('#clock');if(el)el.textContent=formatTime(remaining);if(remaining===0)finish()}
function pendingIndex(){let n=qbank.findIndex((_,i)=>i!==questionIndex&&!sessionResults[i]);return n>=0?n:qbank.findIndex((_,i)=>i!==questionIndex&&sessionResults[i]?.skipped)}
function formatTime(s){return String(Math.floor(s/60)).padStart(2,'0')+':'+String(s%60).padStart(2,'0')}
function renderPractice(){if(location.hash!=='#practice')return;header('practice');const q=qbank[questionIndex];$('#content').innerHTML=`<section class="work-surface practice-work"><div class="work-heading"><a href="#student" class="back-study">공부</a><div class="practice-position">${timed?'<b id="clock">'+formatTime(remaining)+'</b>':'미적분Ⅰ'}<span>${questionIndex+1} / ${qbank.length}</span></div></div><article class="quick-paper"><div class="paper-heading"><span>${esc(q.title)}</span><span>${esc(q.short)}</span></div><div class="quick-question"><span class="question-no">${String(questionIndex+1).padStart(2,'0')}</span><div class="question-stem">${q.question}</div></div>${choices(q,'answer',selected,checked)}${checked?`<div class="answer-result ${Number(selected)===q.answer?'right':'wrong'}"><strong>${Number(selected)===q.answer?'정답':'정답 '+['①','②','③','④','⑤'][q.answer]}</strong><div class="solution">${q.solution.join('')}</div></div>`:''}<div class="quick-bottom"><button class="text-action" data-hint>풀이 한 단계</button><div class="row">${!checked&&timed?'<button class="secondary" data-skip>넘기기</button>':''}${checked?`<button class="primary" data-next>${pendingIndex()<0?'결과 보기':sessionResults[pendingIndex()]?.skipped?'넘긴 문제':'다음 문제'}</button>`:`<button class="primary" data-check ${selected===''?'disabled':''}>답 확인</button>`}</div></div><div id="hint" ${hintUsed&&!checked?'':'hidden'} class="quick-hint solution">${q.solution[0]}</div></article><div class="practice-foot"><button data-feedback="${esc(q.id)}">문항 의견</button><span>델타스킬 공개 학습문항</span>${timed?'<button data-finish>마치기</button>':''}</div></section>`}
function record(skip=false){const q=qbank[questionIndex];sessionResults[questionIndex]={id:q.id,correct:!skip&&Number(selected)===q.answer,help:hintUsed,skipped:skip,answer:skip?null:Number(selected)}}
function finish(){if(ended)return;ended=true;clearInterval(clock);if(selected!==''&&!sessionResults[questionIndex])record();const questions=qbank.map((q,i)=>sessionResults[i]||{id:q.id,correct:false,help:false,skipped:true,answer:null});const item={when:new Date().toISOString(),timed,seconds:timed?360-remaining:null,questions};const results=get('results-v2',[]);results.push(item);if(!put('results-v2',results.slice(-30)))toast('이 기기에 기록을 저장하지 못했습니다.');location.hash='#progress'}
function progress(){const results=get('results-v2',[]),last=results.at(-1);return `<section class="work-surface record-surface"><div class="work-heading"><h1>내 기록</h1><span class="small muted">이 기기</span></div>${last?`<div class="record-summary"><span>최근 학습 · 정적분</span><strong>${last.questions.filter(q=>q.correct).length}<em> / ${last.questions.length}</em></strong><div><button class="primary" data-review>틀린 문항 다시 풀기</button>${link('student','새로 공부하기','quiet')}</div></div><div class="record-list">${results.slice().reverse().map(r=>`<article><div><strong>${r.timed?'타임어택':'정적분 연습'}</strong><small>${new Date(r.when).toLocaleDateString('ko-KR')}${r.timed?' · '+formatTime(r.seconds):''}</small></div><span>${r.questions.filter(q=>q.correct).length} / ${r.questions.length}</span></article>`).join('')}</div>`:`<div class="simple-empty"><span class="empty-integral">∫</span><h2>첫 문제부터.</h2>${link('student','공부하기','primary')}</div>`}${compactFooter()}</section>`}
function timedPage(){studentTab='timed';return student()}
const options=(values,current)=>values.map(v=>`<option${String(v)===String(current)?' selected':''}>${esc(v)}</option>`).join('');
function currentMaterial(){return catalog.find(d=>d.sku===studio.sku)||catalog[0]}
function updateSheet(){put('studio-v2',studio);const box=$('#sheet');if(box)box.innerHTML=sheet()}
function showPaper(){const d=currentMaterial();$('#paper-expanded').className=studio.source==='practice'?'a4':'source-sheet';$('#paper-expanded').innerHTML=sheet();$('#paper-title').textContent=studio.source==='practice'?'학습지 미리보기':d.subject+' · '+d.unit;$('#paper-dialog').showModal()}
function worksheetQuestions(){const pinned=window.DSTeacherQuestionsV34?.resolve(studio);if(pinned!==null&&pinned!==undefined)return pinned;const u=studyUnits.find(u=>u.id===studio.studyUnit);const pool=u?u.questions:regularBank;return pool.slice(0,Math.min(Number(studio.count)||3,pool.length))}
function pageGlyph(n){return `<span class="layout-glyph cells-${n}" aria-hidden="true">${Array.from({length:n},()=>'<i></i>').join('')}</span>`}
function teacher(){
 const saved=get('saved-v2',[]),d=currentMaterial(),custom=studio.source==='practice',questions=worksheetQuestions(),title=studio.title||'정적분 수업 프린트';
 return `<section class="work-surface creator-surface"><div class="creator-heading"><div><span class="creator-eyebrow">수업 준비</span><h1>자료 만들기</h1></div><div class="creator-top-links"><a class="creator-vault-link" href="#classroom">반 관리</a><a class="creator-vault-link" href="#account">내 보관함</a></div></div><div class="creator-workspace"><aside class="creator-config"><div class="creator-mode"><button data-maker-source="materials" aria-pressed="${!custom}">내신 자료</button><button data-maker-source="practice" aria-pressed="${custom}">수업 프린트</button></div><div class="creator-config-body"><section class="creator-step"><div class="creator-step-title"><b>01</b><h2>${custom?'프린트 구성':'자료 선택'}</h2></div>${custom?`<label class="creator-field">제목<input type="text" id="worksheet-title" data-studio="title" maxlength="60" value="${esc(title)}" placeholder="프린트 제목"></label><label class="creator-field">범위<select data-studio="studyUnit" aria-label="프린트 범위"><option value=""${!studio.studyUnit?' selected':''}>정적분 · 기초 / 기본 / 도전</option>${studyUnits.map(u=>`<option value="${u.id}"${studio.studyUnit===u.id?' selected':''}>${esc(u.name)}</option>`).join('')}</select></label><div class="creator-two-fields"><label class="creator-field">문항 수<select data-studio="count" aria-label="프린트 문항 수">${(studio.studyUnit?['3','6','9']:['3']).map(n=>`<option value="${n}"${String(studio.count)===n?' selected':''}>${n}문항</option>`).join('')}</select></label><label class="creator-field">형태<select data-studio="docType" aria-label="제작 형태"><option value="print"${studio.docType!=='book'?' selected':''}>수업 프린트</option><option value="book"${studio.docType==='book'?' selected':''}>표지 있는 교재</option></select></label></div>`:`<label class="creator-field">과목·단원<select aria-label="기준 자료" data-studio="sku">${catalog.map(v=>`<option value="${esc(v.sku)}"${v.sku===d.sku?' selected':''}>${esc(v.subject)} · ${esc(v.unit)}</option>`).join('')}</select></label><div class="creator-material-meta"><span>${esc(d.subject)}</span><strong>${esc(d.unit)}</strong><div><b>${d.count}<small>문항</small></b><span>문제 + 정답 + 해설</span></div></div>`}</section><section class="creator-step"><div class="creator-step-title"><b>02</b><h2>인쇄 구성</h2></div>${custom?`<div class="layout-picker">${[1,2,4].map(n=>`<button data-layout="${n}" aria-pressed="${String(studio.layout)===String(n)}">${pageGlyph(n)}<span>${n}문항</span></button>`).join('')}</div><div class="creator-inclusions"><span>✓ A4</span><span>✓ 정답·해설 포함</span></div>`:`<div class="creator-available-layouts">${d.layouts.map(v=>`<span>${esc(v)}</span>`).join('')}</div><p class="creator-small">미리보기는 2문항·2단 지면입니다.</p>`}</section><div class="creator-actions">${custom?`<button class="creator-print" data-print><span>인쇄하기</span></button><button class="creator-save" data-save-studio>초안 저장</button><p>현재 초안은 이 기기에 저장됩니다.</p>`:`<a class="creator-print" href="#material/${encodeURIComponent(d.sku)}"><span>자료 자세히 보기</span></a><a class="creator-save" href="#account">내 자료에서 찾기</a>`}</div></div></aside><div class="creator-canvas"><div class="creator-canvas-toolbar"><div><span class="creator-live-dot"></span><strong>${custom?'인쇄 미리보기':'실제 지면'}</strong><span>${custom?questions.length+'문항':'공개 미리보기'}</span></div><button data-preview-paper>확대 <span>⤢</span></button></div><div class="creator-paper-stage"><div id="sheet" class="${custom?'a4':'source-sheet'}">${sheet()}</div></div>${creatorPager()}<div class="creator-canvas-footer"><span>A4 · 210 × 297 mm</span><span>${custom?'수식·해설 포함':'DELTASKILL ORIGINAL'}</span></div></div></div><section class="creator-recent"><div class="between"><h2>최근 초안</h2><a href="#account">모두 보기</a></div>${saved.length?`<div class="creator-draft-grid">${saved.slice(-3).reverse().map((v,i)=>`<button data-reuse="${saved.length-1-i}"><span class="draft-sheet-icon">${pageGlyph(Number(v.layout)||2)}</span><span><strong>${esc(v.title||v.unit)}</strong><small>${esc(v.subject||'미적분Ⅰ')} · ${v.source==='practice'?'수업 프린트':'내신자료'}</small></span><b>→</b></button>`).join('')}</div>`:'<div class="creator-recent-empty"><span>아직 저장한 초안이 없습니다.</span><span>구성을 저장해 다시 꺼내 쓰세요.</span></div>'}</section>${compactFooter()}</section>`
}
function sheet(){
 if(studio.source!=='practice'){const d=currentMaterial();return `<img src="${d.previewPages[0]}" alt="${esc(d.subject+' '+d.unit)} 실제 미리보기 지면" width="804" height="1137">`}
 const questions=worksheetQuestions(),count=Number(studio.layout)||2;
 return `<div class="book-top">DELTASKILL <span>MATH WORKSHEET</span></div><h3>${esc(studio.title||'정적분 수업 프린트')}</h3><p class="sheet-subtitle">미적분Ⅰ <span>이름 ______________</span></p><div class="paper-rule"></div><div class="native-paper-questions sheet-layout-${count}">${questions.slice(0,count).map((q,i)=>`<div class="native-paper-question"><span>${String(i+1).padStart(2,'0')}</span><div class="question-stem">${q.question}</div><div class="print-options">${q.options.map((o,j)=>`<span>${['①','②','③','④','⑤'][j]} ${math(o)}</span>`).join('')}</div><div class="writing-space"></div></div>`).join('')}</div><div class="paper-footer"><span>DELTASKILL · 미적분Ⅰ</span><span>1</span></div>`
}
function printSheet(){
 const size=Number(studio.layout)||2,pages=[],questions=worksheetQuestions(),title=esc(studio.title||'정적분 수업 프린트');
 if(studio.docType==='book')pages.push(`<section class="print-page print-cover"><b>DELTASKILL</b><div><span>미적분Ⅰ</span><h1>${title}</h1><p>${questions.length}문항 · 문제와 해설</p></div><small>이름 __________________</small></section>`);
 for(let i=0;i<questions.length;i+=size)pages.push(`<section class="print-page print-layout-${size}"><header>DELTASKILL <b>${title}</b></header><div class="print-question-grid">${questions.slice(i,i+size).map((q,j)=>`<article><b>${String(i+j+1).padStart(2,'0')}</b><div>${q.question}</div><div class="print-options">${q.options.map((o,k)=>`<span>${['①','②','③','④','⑤'][k]} ${math(o)}</span>`).join('')}</div></article>`).join('')}</div></section>`);
 pages.push(`<section class="print-page print-solutions"><header>DELTASKILL <b>정답과 해설</b></header>${questions.map((q,i)=>`<article><b>${i+1}. ${['①','②','③','④','⑤'][q.answer]}</b>${q.solution.join('')}</article>`).join('')}</section>`);
 $('#print-area').innerHTML=pages.join('');window.print();
}
function benefitsPage(){return `<section class="work-surface benefits-surface"><a href="#teacher" class="back-study">← 자료 만들기</a><div class="benefits-heading"><span>12월 기말고사 · 운영 제안</span><h1>12월 PDF 체험</h1><p>학생은 공부할 자료를, 선생님은 다음 수업을 준비합니다.</p></div><div class="benefits-grid"><article><span>01 / 매주</span><h2>넉넉한 PDF 포인트</h2><p>한 달치를 한 번에 주는 대신, 시험 준비 기간 동안 매주 새로 지급합니다.</p></article><article><span>02 / 새로 만들 때</span><h2>제작에만 차감</h2><p>새 문항 구성의 PDF를 완성할 때 사용합니다. 실패한 제작과 같은 파일의 재인쇄는 차감하지 않습니다.</p></article><article><span>03 / 내 보관함</span><h2>수업자료가 쌓이는 곳</h2><p>교재와 프린트를 저장하고, 다음 수업에서 범위를 바꿔 다시 사용합니다.</p></article></div><div class="benefits-policy"><h2>PDF와 한글 파일</h2><div><strong>PDF</strong><span>무료 체험 포인트 → 필요할 때 충전</span></div><div><strong>한글</strong><span>편집 가능한 유료 상품으로 별도 제공</span></div><div><strong>보관본</strong><span>계정 보관·재인쇄 무료</span></div><p>지급량·유효기간·가격은 확정 전입니다. 이 화면에서 포인트가 지급되거나 결제되지 않습니다.</p></div>${compactFooter()}</section>`}

function libraryPage(){return `<section class="work-surface resource-surface"><div class="work-heading"><h1>자료실</h1><a class="quiet" href="#csat">수능·모의고사 →</a></div><div class="resource-filters"><label><span class="sr-only">자료 검색</span><input type="search" id="lib-term" placeholder="과목·단원 검색" value="${esc(library.term)}"></label><div class="work-tabs">${['전체',...new Set(catalog.map(d=>d.subject))].map(s=>`<button data-subject="${esc(s)}" aria-pressed="${s===library.subject}">${esc(s)}</button>`).join('')}</div></div><div id="library-results">${libraryResults()}</div>${compactFooter()}</section>`}
function libraryResults(){const data=catalog.filter(d=>(library.subject==='전체'||d.subject===library.subject)&&(d.unit+' '+d.subject).includes(library.term.trim()));return data.length?`<div class="real-material-grid">${data.map((d,i)=>`<a href="#material/${encodeURIComponent(d.sku)}" class="real-material"><div class="material-art tone-${i%4}"><div class="real-book"><small>DELTASKILL</small><span>${esc(d.subject)}</span><strong>${esc(d.unit)}</strong><em>${d.count} QUESTIONS</em><div class="cover-lines"></div></div></div><div class="material-caption"><div><small>${esc(d.subject)}</small><h2>${esc(d.unit)}</h2></div><span>${d.count}문항 <b>↗</b></span></div></a>`).join('')}</div>`:'<div class="simple-empty"><h2>찾는 자료가 없습니다.</h2><button class="secondary" data-reset-library>전체 보기</button></div>'}
function materialPage(){const d=catalog.find(v=>v.sku===detailSku);if(!d)return `<section class="work-surface simple-empty"><h1>자료를 찾을 수 없습니다.</h1>${link('library','자료실','primary')}</section>`;return `<section class="work-surface material-detail"><a href="#library" class="back-study">← 자료실</a><div class="material-detail-grid"><div class="material-preview"><div class="preview-toolbar"><span>실제 지면</span><div><button data-pdf-prev aria-label="이전 미리보기"${detailPage===0?' disabled':''}>←</button><span>${detailPage+1} / ${d.previewPages.length}</span><button data-pdf-next aria-label="다음 미리보기"${detailPage===d.previewPages.length-1?' disabled':''}>→</button></div></div><img src="${d.previewPages[detailPage]}" width="804" height="1137" alt="${esc(d.unit)} 미리보기 ${detailPage+1}쪽"></div><div class="material-info"><span class="small muted">${esc(d.subject)}</span><h1>${esc(d.unit)}</h1><div class="material-specs"><b>${d.count}<span>문항</span></b><span>문제 · 정답 · 해설</span></div><div class="material-layout-list">${d.layouts.map(l=>`<span>${esc(l)}</span>`).join('')}</div><a class="primary" href="https://www.deltaskill.co.kr/naesin/?x=${encodeURIComponent(d.sku)}" target="_blank" rel="noopener">전체 자료 보기 ↗</a><a class="secondary" href="${d.pdf}" download>미리보기 3쪽 받기</a><button class="text-action" data-use-material="${esc(d.sku)}">선생님 자료로 구성 →</button><p class="source-note">현재 홈페이지의 공개 미리보기입니다.</p></div></div>${compactFooter()}</section>`}
const examNames={HP26_03:'3월 학평',HP26_05:'5월 학평',HP26_07:'7월 학평',MP27_06:'6월 모평',MP27_09:'9월 모평',EX2028_V1:'델타스킬 모의 1회',SN26:'2026 수능','PRV27-C10':'10월 사설 C','PRV27-D10':'10월 사설 D','PRV27-B10':'10월 사설 B',HP26_10:'10월 학평'};
const examName=code=>String(code||'').startsWith('자유:')?String(code).slice(3):examNames[code]||'이전 시험';
const finiteScore=value=>value===null||value===undefined||value===''?undefined:Number.isFinite(Number(value))?Number(value):undefined;
let learningState={loading:false,error:'',available:false,records:[],summary:{}},recordState={id:'',loading:false,error:'',responses:[],onlyWrong:false},passwordState={busy:false,error:'',done:false};
function loginPage(){return DSAccountViews.login({...loginState,signupUrl:DSService.accountLinks('signup'),recoverUrl:DSService.accountLinks('reset'),nextRole:role})+`<div class="login-return">${link(role==='teacher'?'teacher':'student','둘러보기 계속')}<a href="#help">이용 안내</a></div>`}
function accountProps(){const results=get('results-v2',[]),saved=get('saved-v2',[]);return {...accountState,signedIn:DSService.session(),passwordUrl:'#account-password',role,learning:learningState,unitDiagnostics:{...unitDiagnostics,localAttempts:localDiagnosticAttempts()},localSaved:saved.map(v=>({...v,kind:v.source==='practice'?'학습지':'내신자료'})),localStats:{sessions:results.length,total:results.reduce((s,r)=>s+r.questions.filter(q=>!q.skipped).length,0),correct:results.reduce((s,r)=>s+r.questions.filter(q=>q.correct).length,0),saved:saved.length}}}
function accountPage(){return (DSService.session()&&DSService.needsPasswordUpdate()?`<aside class="account-security-notice"><span>비밀번호를 영문·숫자 8자 이상으로 바꿔 주세요.</span><a href="#account-password">변경하기</a></aside>`:'')+DSAccountViews.account(accountProps())}
function settingsPage(){return DSAccountViews.settings(accountProps())}
function normalizeHistory(items){return (Array.isArray(items)?items:[]).filter(r=>r&&typeof r.submission_id==='string').map(r=>({id:r.submission_id,title:examName(r.exam_code),code:r.exam_code,when:r.created_at,attempt:Number(r.attempt_no)||1,score:finiteScore(r.score)})).sort((a,b)=>new Date(b.when)-new Date(a.when))}
async function loadAccount(){
 await DSService.ready;
 if(!DSService.session()||accountState.loading)return;
 const epoch=++accountEpoch;accountState.loading=true;accountState.error='';learningState={...learningState,loading:true,error:''};refreshAccount();
 const [me,profile,library,passes,history]=await Promise.allSettled([DSService.request('/api/me'),DSService.request('/api/profile'),DSService.request('/member-library',{action:'list'}),DSService.request('/member-library',{action:'pass_sets'}),DSService.request('/api/history')]);
 if(epoch!==accountEpoch)return;
 if(!DSService.session()){clearMemberView();refreshAccount();return}
 downloadMap=new Map();
 if(profile.status==='fulfilled'){const p=profile.value.profile||{};accountState.displayName=p.name||'';accountState.phoneMasked=me.status==='fulfilled'?me.value.phone_masked||'':'';accountState.memberSince=''}
 else accountState.error=DSService.errorText(profile.reason);
 accountState.library=[];
 if(library.status==='fulfilled'){
  for(const o of library.value.library||[]){for(const f of o.files||[]){const key='file-'+downloadMap.size;if(f.downloadable)downloadMap.set(key,{action:'download',orderId:o.orderId,fileId:f.id,received:f.downloaded});accountState.library.push({groupTitle:String(f.title||o.orderName||'내 자료').replace(/\s*[·_-]?\s*\(?[124]문항\s*[124](?:쪽|단)\)?/g,'').trim(),layout:(f.title||'').match(/(\d+문항[^·(]*)/)?.[1]?.trim()||f.fmt,title:f.title||o.orderName,format:f.fmt,received:Boolean(f.downloaded),...(f.downloadable?{fileId:key}:{})})}}
 }else accountState.error=DSService.errorText(library.reason);
 accountState.passSets=[];
 if(passes.status==='fulfilled'){
  const p=passes.value;const sets=[...(p.received||[]),...(p.pass?.state==='live'?(p.sets||[]).filter(s=>!s.received):[])];
  for(const s of sets){const key='set-'+downloadMap.size,received=Boolean(s.received||s.firstAt),can=received?s.redownloadable:p.pass?.state==='live';if(can)downloadMap.set(key,{action:'pass_download',setId:s.setId,received});accountState.passSets.push({title:s.title||s.setId,received,...(can?{fileId:key}:{})})}
 }else if(!accountState.library.length)accountState.error=DSService.errorText(passes.reason);
 if(history.status==='fulfilled'){const records=normalizeHistory(history.value.items);learningState={loading:false,error:'',available:true,records,summary:{sessions:records.length,latestScore:records[0]?.score}}}
 else learningState={loading:false,error:DSService.errorText(history.reason),available:false,records:[],summary:{}};
 const uniqueFiles=new Map();for(const item of accountState.library){const old=uniqueFiles.get(item.title);if(!old||(!old.fileId&&item.fileId))uniqueFiles.set(item.title,item)}accountState.library=[...uniqueFiles.values()];accountState.loading=false;refreshAccount();loadUnitDiagnostics(epoch);
}
function clearMemberView(){++accountEpoch;accountState={loading:false,error:'',library:[],passSets:[]};learningState={loading:false,error:'',available:false,records:[],summary:{}};recordState={id:'',loading:false,error:'',responses:[],onlyWrong:false};downloadMap.clear();diagnosticCache.clear();diagnosticLoadingEpoch=-1;unitDiagnostics={...unitDiagnostics,loading:false,error:'',items:[]};classroomState={...classroomState,demo:false,classrooms:[],preview:[],draft:{name:'',phones:''}}}
function refreshAccount(){const hash=location.hash;if(['#account','#account-settings'].includes(hash)){header(hash.slice(1));$('#content').innerHTML=hash==='#account'?accountPage():settingsPage()}else if(hash.startsWith('#record/'))renderRecord()}
async function loadRecord(id){
 await DSService.ready;if(!DSService.session())return;
 const epoch=accountEpoch;recordState={id,loading:true,error:'',responses:[],onlyWrong:false};renderRecord();
 try{const data=await DSService.request('/api/submission?id='+encodeURIComponent(id));if(epoch!==accountEpoch||recordState.id!==id)return;recordState.responses=Array.isArray(data.responses)?data.responses.filter(r=>Number.isInteger(Number(r.item_no))&&Number(r.item_no)>0):[]}
 catch(e){if(epoch===accountEpoch)recordState.error=DSService.errorText(e)}
 finally{if(epoch===accountEpoch&&recordState.id===id){recordState.loading=false;renderRecord()}}
}
function recordPage(){
 const item=learningState.records.find(r=>r.id===recordState.id),rows=recordState.responses,wrong=rows.filter(r=>String(r.result).toLowerCase()==='x'),right=rows.filter(r=>String(r.result).toLowerCase()==='o');
 const shown=recordState.onlyWrong?wrong:rows;
 return `<section class="work-surface member-record"><a class="back-study" href="#account">← 마이페이지</a><div class="member-record-heading"><div><span class="small muted">${item?.when?esc(new Date(item.when).toLocaleDateString('ko-KR')):''}${item?' · '+item.attempt+'회차':''}</span><h1>${esc(item?.title||'학습 기록')}</h1></div>${item?.score!==undefined?`<div class="member-score"><small>자기채점</small><strong>${esc(item.score)}</strong><span>점</span></div>`:''}</div>${!DSService.session()?`<div class="simple-empty"><h2>로그인 후 확인할 수 있습니다.</h2>${link('login','로그인','primary')}</div>`:recordState.loading?'<div class="record-skeleton" role="status"><i></i><i></i><i></i><span>문항 기록을 불러오는 중</span></div>':recordState.error?`<div class="simple-empty"><p>${esc(recordState.error)}</p><button class="secondary" data-account-action="retry-record">다시 불러오기</button></div>`:`<div class="record-overview"><div><b>${right.length}</b><span>정답</span></div><div><b>${wrong.length}</b><span>오답</span></div><div><b>${rows.length-right.length-wrong.length}</b><span>미채점</span></div></div><div class="record-detail-toolbar"><h2>문항별 기록</h2><button data-record-filter aria-pressed="${recordState.onlyWrong}">오답만 보기</button></div><div class="response-list">${shown.length?shown.map(r=>{const result=String(r.result).toLowerCase(),status=result==='o'?'correct':result==='x'?'incorrect':'unset';return `<details class="response-row ${status}"><summary><span class="response-no">${esc(String(r.item_no).padStart(2,'0'))}</span><span class="response-title">${esc(r.unit||r.area||'문항 기록')}<small>${esc(r.area||'')}</small></span><span class="response-state">${result==='o'?'정답':result==='x'?'오답':'미채점'}</span><span class="response-expand">＋</span></summary><div class="response-details"><div class="response-answers"><div><small>내 답</small><b>${esc(r.my_answer??'—')}</b></div><div><small>정답</small><b>${esc(r.correct_answer??'—')}</b></div></div>${r.reason?`<p><span>오답 이유</span>${esc(r.reason)}</p>`:''}${r.reached_step?`<p><span>풀이 단계</span>${esc(r.reached_step)}</p>`:''}${r.memo?`<p class="response-memo">${esc(r.memo)}</p>`:''}${!r.memo&&!r.reason&&!r.reached_step?'<p class="response-empty-note">추가 기록이 없습니다.</p>':''}</div></details>`}).join(''):'<p class="simple-empty">해당 문항 기록이 없습니다.</p>'}</div>`}${compactFooter()}</section>`
}
function renderRecord(){if(location.hash.startsWith('#record/')){$('#content').innerHTML=recordPage()}}
async function downloadOwned(key){const item=downloadMap.get(key);if(!item)return;if(!item.received&&!confirm(item.action==='pass_download'?'이 자료를 받으면 이용권에서 1세트가 차감됩니다. 받을까요?':'이 자료를 처음 받으면 수령 기록이 남으며 환불 가능 범위가 달라질 수 있습니다. 받을까요?'))return;const {received,...body}=item;try{const data=await DSService.request('/member-library',body),url=DSService.safeDownloadUrl(data.url);if(!url)throw new Error('server');location.assign(url)}catch(e){toast(DSService.errorText(e))}}
function passwordPage(){return `<section class="account-surface password-surface"><a href="#account-settings" class="account-back">← 계정 관리</a><h1>비밀번호 변경</h1>${!DSService.session()?`<p class="account-subtitle">로그인 후 변경할 수 있습니다.</p>${link('login','로그인','primary')}`:passwordState.done?`<div class="password-done"><span>✓</span><h2>비밀번호를 변경했습니다.</h2>${link('account','마이페이지','primary')}</div>`:`<form id="password-form" class="account-form"><label>현재 비밀번호<input type="password" name="pin" autocomplete="current-password" required></label><label>새 비밀번호<input type="password" name="new_pin" autocomplete="new-password" minlength="8" maxlength="64" required></label><p class="account-subtitle">영문과 숫자를 섞어 8자 이상</p><label>새 비밀번호 확인<input type="password" name="confirm_pin" autocomplete="new-password" required></label><p id="password-error" class="account-error" role="alert">${esc(passwordState.error)}</p><button class="account-primary" type="submit"${passwordState.busy?' disabled':''}>${passwordState.busy?'변경 중…':'변경하기'}</button></form>`}</section>`}

function improve(){const items=get('feedback',[]);return `<section class="work-surface record-surface"><div class="work-heading"><h1>의견</h1><button class="primary" data-feedback="홈페이지">의견 남기기</button></div><p class="source-note">이 기기에만 저장된 의견입니다 · 아직 전송되지 않습니다</p><div class="record-list">${items.map(v=>`<article><div><strong>${esc(v.kind)}</strong><p>${esc(v.message)}</p><small>${esc(v.context)}</small></div></article>`).join('')||'<div class="simple-empty">저장한 의견이 없습니다.</div>'}</div>${compactFooter()}</section>`}

let unitDiagnostics={loading:false,error:'',scale:'school',items:[],assessmentReady:false,units:[{unit:'정적분'}],selectedUnit:'정적분'};
let diagnosticLoadingEpoch=-1;const diagnosticCache=new Map();
async function loadUnitDiagnostics(epoch=accountEpoch){
 if(!DSService.session()||diagnosticLoadingEpoch===epoch||!learningState.available)return;
 diagnosticLoadingEpoch=epoch;unitDiagnostics.loading=true;unitDiagnostics.error='';refreshAccount();
 const records=learningState.records,results=new Array(records.length);let cursor=0,failed=0;
 async function worker(){while(cursor<records.length){const i=cursor++,record=records[i];try{let data=diagnosticCache.get(record.id);if(!data){data=await DSService.request('/api/submission?id='+encodeURIComponent(record.id));if(epoch!==accountEpoch)return;diagnosticCache.set(record.id,data)}results[i]=Array.isArray(data.responses)?data.responses:[]}catch{failed++}}}
 await Promise.all(Array.from({length:Math.min(3,records.length)},worker));
 if(epoch!==accountEpoch)return;
 const units=new Map(),seen=new Set();
 records.forEach((r,i)=>{for(const item of results[i]||[]){const no=Number(item.item_no),result=String(item.result).toLowerCase();if(!Number.isFinite(no)||no<=0||!['o','x'].includes(result))continue;const key=String(r.code)+':'+no;if(seen.has(key))continue;seen.add(key);const unit=String(item.unit||'').trim()||'단원 미분류';if(!units.has(unit))units.set(unit,{unit,answered:0,correct:0,wrong:0,recent:r.when,timedGrade:null,difficultyGrade:null});const u=units.get(unit);u.answered++;result==='o'?u.correct++:u.wrong++}});
 unitDiagnostics={...unitDiagnostics,loading:false,error:failed?'일부 기록을 불러오지 못했습니다. 다시 확인해 주세요.':'',items:[...units.values()].sort((a,b)=>b.answered-a.answered),assessmentReady:false};diagnosticLoadingEpoch=-1;refreshAccount();
}

let classroomState={signedIn:false,connected:false,demo:false,selectedClass:'',selectedStudent:'',filter:'all',tab:'overview',round:'',inviteOpen:false,demoDrafts:{},classrooms:[],draft:{name:'',phones:''},preview:[],error:'',busy:false};
function classroomPage(){return window.DSClassroomViews?DSClassroomViews.render({...classroomState,signedIn:DSService.session(),demoDraft:classroomState.demoDrafts[classroomState.selectedClass]||{},assignments:[]}):`<section class="work-surface"><h1>반 관리</h1><p>화면을 준비하고 있습니다.</p></section>`}
function refreshClassroom(){$('#content').innerHTML=classroomPage()}
function selectClassroom(id){
 const classes=window.DSClassroomViews?.getClasses({...classroomState,signedIn:DSService.session()})||[];
 const item=classes.find(c=>String(c.id)===String(id));
 classroomState.selectedClass=item?String(item.id):'';classroomState.selectedStudent='';classroomState.filter='all';classroomState.tab='overview';classroomState.round='';
 refreshClassroom();
}
function classAction(button){
 const action=button.dataset.classAction;
 if(action==='save-demo-lesson')return;
 if(action==='demo'||action==='live'){classroomState.demo=action==='demo';classroomState.inviteOpen=false;classroomState.preview=[];classroomState.error='';selectClassroom('');return}
 if(action==='open-class'||action==='select-class'){selectClassroom(button.dataset.classId);return}
 if(action==='lobby'){selectClassroom('');return}
 if(action==='tab'){classroomState.tab=['overview','students','analysis','next'].includes(button.dataset.classTab)?button.dataset.classTab:'overview'}
 else if(action==='select-student'){classroomState.selectedStudent=button.dataset.studentId;classroomState.tab='students'}
 else if(action==='filter'){classroomState.filter=button.dataset.classFilter;classroomState.selectedStudent=''}
 else if(action==='invite'){classroomState.inviteOpen=!classroomState.inviteOpen}
 else if(action==='edit'){classroomState.preview=[];classroomState.error='';classroomState.inviteOpen=true}
 else if(action==='supplement'||action==='create-assignment'){
  const item=window.DSClassroomViews.getClasses({...classroomState,signedIn:DSService.session()}).find(c=>String(c.id)===classroomState.selectedClass);
  const sku=button.dataset.materialSku||item?.materialSku;
  if(sku&&catalog.some(c=>c.sku===sku)){studio.sku=sku;studio.source='materials';put('studio-v2',studio)}
  location.hash='#teacher';toast('자료를 먼저 구성합니다. 학생 배부는 문항 연결 후 열립니다.');return;
 }
 refreshClassroom();
}
function saveClassLesson(form){
 if(!classroomState.demo||!classroomState.selectedClass)return;
 const fd=new FormData(form),draft={};for(const key of ['unit','material','due','note'])draft[key]=String(fd.get(key)||'').slice(0,key==='note'?1000:160);
 classroomState.demoDrafts[classroomState.selectedClass]=draft;refreshClassroom();toast('이 예시 반의 초안을 저장했습니다.');
}
function previewClassList(form){
 const fd=new FormData(form),name=String(fd.get('className')||'').trim().slice(0,60),lines=String(fd.get('phones')||'').split(/[\n,;]+/).map(v=>v.replace(/\D/g,'')).filter(Boolean),seen=new Set(),preview=[];
 for(let number of lines.slice(0,200)){if(number.startsWith('82'))number='0'+number.slice(2);const valid=/^010\d{8}$/.test(number),duplicate=seen.has(number);if(valid)seen.add(number);preview.push({masked:valid?number.slice(0,3)+'-****-'+number.slice(-4):'번호 확인 필요',valid,duplicate})}
 form.reset();classroomState={...classroomState,draft:{name,phones:''},preview,error:!name?'반 이름을 입력해 주세요.':!preview.length?'학생 전화번호를 입력해 주세요.':''};
 $('#content').innerHTML=classroomPage();
}

const diagnosticBank=[...regularBank.map((q,i)=>({...q,diagnosticLevel:['기초','기본','도전'][i]})),...timerBank];
let diagnosticState={type:'timed',unit:'정적분',active:null,lastId:'',confirm:false},diagnosticClock=null;
const diagnosticKey='ds-next-diagnostic-active-v1';
function localDiagnosticAttempts(){const rows=get('diagnostics-v1',[]);return Array.isArray(rows)?rows.filter(r=>r&&r.version===1&&['timed','difficulty'].includes(r.type)&&Array.isArray(r.questions)):[]}
function persistDiagnostic(){try{if(diagnosticState.active)sessionStorage.setItem(diagnosticKey,JSON.stringify(diagnosticState.active));else sessionStorage.removeItem(diagnosticKey)}catch{}}
function restoreDiagnostic(){try{const a=JSON.parse(sessionStorage.getItem(diagnosticKey)||'null');if(DSDiagnosticDomain.validAttempt(a,diagnosticBank)&&!localDiagnosticAttempts().some(r=>r.id===a.id)){diagnosticState.active=a;diagnosticState.type=a.type;diagnosticState.unit=a.unit}}catch{}}
restoreDiagnostic();
async function submitPassword(form){
 if(passwordState.busy||!DSService.session())return;
 const fd=new FormData(form),pin=String(fd.get('pin')||''),next=String(fd.get('new_pin')||''),confirm=String(fd.get('confirm_pin')||'');
 let error=next!==confirm?'새 비밀번호가 서로 다릅니다.':!(/^[\x21-\x7e]{8,64}$/.test(next)&&/[A-Za-z]/.test(next)&&/\d/.test(next))?'영문과 숫자를 섞어 8자 이상 입력해 주세요.':'';
 if(error){passwordState.error=error;$('#password-error').textContent=error;return}
 passwordState.busy=true;form.querySelector('button[type=submit]').disabled=true;
 try{await DSService.request('/api/password-change',{pin,new_pin:next});form.reset();passwordState={busy:false,error:'',done:true};DSService.passwordChanged();$('#content').innerHTML=passwordPage()}
 catch(e){passwordState.busy=false;passwordState.error=DSService.errorText(e);$('#password-error').textContent=passwordState.error;form.querySelector('button[type=submit]').disabled=false}
}
function startDiagnostic(type,unit='정적분'){diagnosticState.type=type==='difficulty'?'difficulty':'timed';diagnosticState.unit='정적분';diagnosticState.confirm=false;if(location.hash==='#diagnostic')renderDiagnostic();else location.hash='#diagnostic'}
function diagnosticSetup(){
 const active=diagnosticState.active,t=diagnosticState.type==='timed';
 return `<section class="work-surface diagnostic-surface"><a class="back-study" href="#account">← 마이페이지</a><div class="diagnostic-heading"><span class="eyebrow">시간 · 난이도</span><h1>단원 진단</h1><p>정적분 · 진단 체험</p></div><div class="diagnostic-types"><button data-diagnostic-type="timed" aria-pressed="${t}"><span class="diagnostic-symbol">◷</span><strong>시간 안에</strong><small>6분 · 6문항</small></button><button data-diagnostic-type="difficulty" aria-pressed="${!t}"><span class="diagnostic-symbol">▥</span><strong>어디까지</strong><small>기초 · 기본 · 도전</small></button></div><div class="diagnostic-brief"><div><span class="diagnostic-label">${t?'시간 평가':'난이도 평가'}</span><h2>${t?'6분 동안 6문항':'기초부터 도전까지'}</h2><p>${t?'정적분 계산·넓이·함수 문항을 제한시간 안에 풀어봅니다.':'기초·기본·도전 문항을 하나씩 풀며 막히는 지점을 확인합니다.'}</p><ul><li>${t?'6분이 지나면 답안이 자동으로 마감됩니다.':'제한시간 없이 3문항을 풀어봅니다.'}</li><li>넘긴 문항은 제출 전 다시 돌아올 수 있습니다.</li><li>풀이와 정답은 제출 후 공개됩니다.</li></ul></div><div class="diagnostic-start-card"><strong>${t?'06:00':'3'}<small>${t?'제한시간':'문항'}</small></strong><button class="primary" data-diagnostic-begin${active?' disabled':''}>평가 시작</button>${active?'<p>진행 중인 평가가 있습니다.</p><button class="secondary" data-diagnostic-resume>이어 풀기</button><button class="text-action" data-diagnostic-discard>평가 그만두기</button>':''}</div></div><p class="diagnostic-note">현재 공개된 정적분 문항으로 체험합니다. 기록은 이 기기에만 저장되며, 내신·수능 등급으로 환산하지 않습니다.</p></section>`;
}
function beginDiagnostic(){
 if(diagnosticState.active)return;const startedAt=Date.now(),type=diagnosticState.type;
 diagnosticState.active={id:'diag-'+startedAt+'-'+Math.random().toString(36).slice(2,8),type,unit:'정적분',startedAt,deadline:type==='timed'?startedAt+360000:null,limitSeconds:type==='timed'?360:null,index:0,questionIds:(type==='timed'?[0,1,8,9,16,17].map(i=>timerBank[i]):regularBank).map(q=>q.id),answers:{}};
 diagnosticState.confirm=false;persistDiagnostic();location.hash='#diagnostic-run';
}
function diagnosticRun(){
 const a=diagnosticState.active;if(!a)return diagnosticSetup();
 const q=diagnosticBank.find(q=>q.id===a.questionIds[a.index]),answered=Object.keys(a.answers).length,remaining=a.type==='timed'?Math.max(0,Math.ceil((a.deadline-Date.now())/1000)):null;
 return `<section class="work-surface diagnostic-surface diagnostic-running"><div class="diagnostic-run-top"><a class="back-study" href="#diagnostic">← 평가 안내</a><div><span>${esc(a.unit)} · ${a.type==='timed'?'시간 평가':'난이도 평가'}</span>${a.type==='timed'?`<b id="diagnostic-clock" aria-label="남은 시간">${formatTime(remaining)}</b>`:'<b>시간 제한 없음</b>'}</div></div><div class="diagnostic-run-grid"><article class="quick-paper"><div class="paper-heading"><span>${esc(q.title)}</span><span>${a.type==='difficulty'?esc(q.diagnosticLevel):'제한시간 평가'}</span></div><div class="quick-question"><span class="question-no">${String(a.index+1).padStart(2,'0')}</span><div class="question-stem">${q.question}</div></div>${choices(q,'diagnostic-answer',a.answers[q.id]===undefined?'':String(a.answers[q.id]))}<div class="quick-bottom"><button class="text-action" data-diagnostic-prev${a.index===0?' disabled':''}>이전 문항</button>${a.index<a.questionIds.length-1?'<button class="primary" data-diagnostic-next>다음 문항 →</button>':'<button class="primary" data-diagnostic-confirm>답안 제출</button>'}</div></article><aside class="diagnostic-answer-sheet"><div><span>답안</span><b>${answered} / ${a.questionIds.length}</b></div><nav aria-label="평가 문항 이동">${a.questionIds.map((id,i)=>`<button data-diagnostic-index="${i}" class="${a.answers[id]===undefined?'':'answered'}" aria-label="${i+1}번 ${a.answers[id]===undefined?'미응답':'답 선택됨'}"${i===a.index?' aria-current="step"':''}>${String(i+1).padStart(2,'0')}</button>`).join('')}</nav><p>선택한 답은 제출 전 바꿀 수 있습니다.</p><button class="secondary" data-diagnostic-confirm>답안 제출</button></aside></div>${diagnosticState.confirm?`<section class="diagnostic-confirm" role="alert"><div><strong>${answered===a.questionIds.length?'모든 문항에 답했습니다.':(a.questionIds.length-answered)+'문항에 아직 답하지 않았습니다.'}</strong><p>제출하면 결과와 풀이가 공개됩니다.</p></div><div><button class="secondary" data-diagnostic-cancel>계속 풀기</button><button class="primary" data-diagnostic-submit>제출하고 결과 보기</button></div></section>`:''}</section>`;
}
function renderDiagnostic(){const run=location.hash==='#diagnostic-run';header('diagnostic');$('#content').innerHTML=run?diagnosticRun():diagnosticSetup();clearInterval(diagnosticClock);if(run&&diagnosticState.active?.type==='timed'){diagnosticClock=setInterval(tickDiagnostic,250);tickDiagnostic()}}
function tickDiagnostic(){const a=diagnosticState.active;if(!a||a.type!=='timed')return;const remaining=Math.max(0,Math.ceil((a.deadline-Date.now())/1000)),el=$('#diagnostic-clock');if(el){el.textContent=formatTime(remaining);el.classList.toggle('urgent',remaining<=60)}if(remaining===0)completeDiagnostic('timeout')}
function completeDiagnostic(reason='submitted'){
 const a=diagnosticState.active;if(!a)return;clearInterval(diagnosticClock);const result=DSDiagnosticDomain.summarize(a,diagnosticBank,Date.now(),reason),all=localDiagnosticAttempts();if(!all.some(r=>r.id===a.id))all.push(result);
 if(!put('diagnostics-v1',all.slice(-40))){toast('이 기기에 결과를 저장하지 못했습니다.');return}
 diagnosticState.lastId=result.id;diagnosticState.active=null;diagnosticState.confirm=false;persistDiagnostic();location.hash='#diagnostic-result';
}
function diagnosticResult(){
 const attempts=localDiagnosticAttempts(),r=attempts.find(v=>v.id===diagnosticState.lastId)||attempts.at(-1);if(!r)return diagnosticSetup();
 const wrong=r.questions.filter(q=>!q.correct),label=r.type==='timed'?'시간 평가':'난이도 평가';
 return `<section class="work-surface diagnostic-surface"><a href="#account" class="back-study">← 마이페이지</a><div class="diagnostic-result-head"><span>${esc(r.unit)} · ${label} · 체험 결과</span><h1>${r.type==='timed'?'정적분 · 시간 평가':'정적분 · 난이도 평가'}</h1><small>${r.reason==='timeout'?'제한시간 종료 · ':''}${esc(new Date(r.when).toLocaleString('ko-KR'))}</small></div><div class="diagnostic-result-metrics"><div><span>정답</span><strong>${r.correct}<em> / ${r.total}</em></strong></div><div><span>답한 문항</span><strong>${r.answered}<em> / ${r.total}</em></strong></div><div><span>${r.type==='timed'?'사용 시간':'풀이 시간'}</span><strong>${formatTime(r.elapsedSeconds)}</strong></div></div>${r.type==='difficulty'?`<div class="diagnostic-levels">${r.questions.map(q=>`<div class="${q.correct?'correct':''}"><span>${esc(q.level)}</span><strong>${q.skipped?'미응답':q.correct?'정답':'다시 확인'}</strong><small>1문항 기준</small></div>`).join('')}</div>`:`<div class="diagnostic-pace"><span>6분 안에 ${r.answered}문항에 답했고, ${r.correct}문항을 맞혔습니다.</span><div><i style="width:${r.correct/r.total*100}%"></i></div></div>`}<div class="diagnostic-next"><div><h2>${wrong.length?'다시 풀면 내 것이 되는 문항.':'다른 방식으로도 확인해 볼까요.'}</h2><p>${wrong.length?`${wrong.length}문항의 풀이를 확인하고 다시 풀어보세요.`:'시간과 난이도를 각각 확인해 보세요.'}</p></div>${wrong.length?'<button class="primary" data-diagnostic-review>틀린 문항 다시 풀기</button>':`<button class="primary" data-diagnostic="${r.type==='timed'?'difficulty':'timed'}">${r.type==='timed'?'난이도 평가':'시간 평가'} 보기</button>`}</div><details class="diagnostic-solutions"><summary>문항별 답과 풀이</summary>${r.questions.map((item,i)=>{const q=diagnosticBank.find(q=>q.id===item.id);return q?`<article><header><b>${String(i+1).padStart(2,'0')} · ${esc(q.title)}</b><span>${item.skipped?'미응답':item.correct?'정답':'오답'}</span></header><div class="question-stem">${q.question}</div><p>내 답 ${item.answer===null?'—':['①','②','③','④','⑤'][item.answer]} · 정답 ${['①','②','③','④','⑤'][q.answer]}</p><div class="solution">${q.solution.join('')}</div></article>`:''}).join('')}</details><div class="diagnostic-result-foot"><a class="secondary" href="#account">마이페이지에서 보기</a><button class="text-action" data-diagnostic-remove="${esc(r.id)}">이 체험 기록 삭제</button></div><p class="diagnostic-note">이 기기에 저장한 진단 체험입니다. 적은 문항 수만으로 내신 5등급·수능 9등급을 추정하지 않습니다.</p></section>`;
}

function csatPage(){return `<section class="work-surface csat-surface cv7">
  <div class="cv7-heading"><div><span class="cv7-eyebrow">수능 수학 자료실</span><h1>수능·모의고사</h1></div><a href="#library">내신 자료실 </a></div>
  <section class="cv7-intro" aria-labelledby="cv7-intro-title"><div class="cv7-intro-copy"><h2 id="cv7-intro-title">문항별 풀이.<br>시험별 분석.</h2><p>공개된 기출 풀이와 시험 분석을 살펴보고,<br>배운 내용을 직접 풀며 확인하세요.</p></div><div class="cv7-feature"><div class="cv7-feature-top"><span class="cv7-free">무료 공개</span><span>2026학년도 수능 · 공통 21번</span></div><h3>공통 21번<br>풀이 분석</h3><p>원문부터 단계별 풀이,<br>유사 문항 사례까지 함께 살펴보세요.</p><a href="https://www.deltaskill.co.kr/analysis/index.html?step=1" target="_blank" rel="noopener" aria-label="기출 풀이 분석 열기, 새 탭">기출 풀이 분석 열기 </a><small>델타스킬 기존 페이지가 새 탭에서 열립니다.</small></div></section>
  <div class="cv7-workspace"><section class="cv7-archive" aria-labelledby="cv7-archive-title"><div class="cv7-section-heading"><h2 id="cv7-archive-title">공개 자료</h2><span>외부 페이지 · 새 탭으로 열림</span></div><div class="cv7-resource-list">
    <a class="cv7-resource" href="https://www.deltaskill.co.kr/sol/" target="_blank" rel="noopener" aria-label="2027학년도 9월 모의평가 문항별 해설실, 기존 해설실 로그인 필요, 새 탭"><span class="cv7-resource-kind">문항별 해설</span><div><span class="cv7-exam">2027학년도 9월 모의평가</span><h3>문항별 해설실</h3><p>공통 · 확률과 통계 · 미적분</p><span class="cv7-access">기존 해설실 로그인 필요</span></div><span class="cv7-arrow" aria-hidden="true">↗</span></a>
    <a class="cv7-resource" href="https://www.deltaskill.co.kr/report/2027-09/" target="_blank" rel="noopener" aria-label="2027학년도 9월 모의평가 시험 분석, 새 탭"><span class="cv7-resource-kind">시험 분석</span><div><span class="cv7-exam">2027학년도 9월 모의평가</span><h3>공통 문항과 난이도 변화</h3><p>시험을 돌아보고 다음 공부의 방향을 잡아보세요.</p></div><span class="cv7-arrow" aria-hidden="true">↗</span></a>
    <a class="cv7-resource" href="https://www.deltaskill.co.kr/report/2027-06/" target="_blank" rel="noopener" aria-label="2027학년도 6월 모의평가 시험 분석, 새 탭"><span class="cv7-resource-kind">시험 분석</span><div><span class="cv7-exam">2027학년도 6월 모의평가</span><h3>시험 총평과 주요 문항</h3><p>주요 문항의 특징과 시험 전체의 흐름을 살펴보세요.</p></div><span class="cv7-arrow" aria-hidden="true">↗</span></a>
  </div></section>
  <aside class="cv7-practice" aria-labelledby="cv7-practice-title"><span class="cv7-eyebrow">학습 연습</span><h2 id="cv7-practice-title">직접 풀어보기</h2><p>지금 연결된 학습 문항으로 연습하세요.</p><div class="cv7-practice-options"><button data-diagnostic="difficulty"><span><strong>난이도별 평가</strong><small>내 수준에 맞춰 차근차근</small></span></button><button data-diagnostic="timed"><span><strong>제한시간 평가</strong><small>정해진 시간 안에 풀기</small></span></button></div><a class="cv7-record" href="#account">내 학습 기록 </a></aside></div>
  <section class="cv7-coming" aria-labelledby="cv7-coming-title"><div class="cv7-coming-heading"><span class="cv7-planned">준비 중</span><h2 id="cv7-coming-title">다음으로 준비하는 자료</h2></div><div class="cv7-coming-grid"><article><h3>여러 풀이를 담은 기출 PDF</h3><p>검수한 독립 풀이를 한 권으로 모아<br>무료로 제공할 예정입니다.</p></article><article><h3>유사문항과 델타스킬 모의고사</h3><p>기출 뒤에 이어 풀 디지털 문항과<br>실물 시험지를 준비하고 있습니다.</p></article></div><p class="cv7-coming-note">아직 제공·판매를 시작하지 않았습니다. 공개 일정과 이용 방법은 추후 안내합니다.</p></section>
  ${compactFooter()}
</section>`}

// Refined page compositions; data, authentication and grading stay in their existing modules.
function header(page){
 const home=page==='home',isTeacher=role==='teacher',accountPage=['login','account','account-settings','account-password','record'].includes(page);
 document.body.classList.toggle('home-body',home);document.body.classList.toggle('working-body',!home);document.body.classList.toggle('creator-body',['teacher','studio','print-design'].includes(page));document.body.dataset.page=page;
 const titles={home:'수학, 여기 다 있다',student:'공부',teacher:'자료 만들기','print-design':'프린트 디자인',studio:'자료 만들기',library:'내신 자료',material:'자료 미리보기',csat:'수능·모의고사',account:'마이페이지',login:'로그인',help:'이용 안내',benefits:'PDF 체험 운영안',classroom:'반 관리',record:'학습 상세',practice:'문제 풀기','diagnostic-result':'진단 결과','not-found':'페이지 안내',improve:'시안 의견',progress:'학습 기록',diagnostic:'단원 진단','diagnostic-run':'단원 진단','account-settings':'계정 관리','account-password':'비밀번호 변경'};document.title=(titles[page]||'DELTASKILL')+' · DELTASKILL';
 const nav=isTeacher?[['teacher','자료 만들기'],['library','내신 자료'],['csat','수능·모의고사'],['classroom','반 관리']]:[['student','공부'],['library','내신 자료'],['csat','수능·모의고사']];
 const current=['practice','timed','diagnostic','diagnostic-run','diagnostic-result'].includes(page)?'student':page==='material'?'library':page==='print-design'?'teacher':page;
 $('#header').innerHTML=`<div class="header"><a href="#home" aria-label="델타스킬 대문">${brand()}</a>${home?'':`<nav aria-label="주 메뉴">${nav.map(([r,t])=>`<a href="#${r}"${r===current?' aria-current="page"':''}>${t}</a>`).join('')}</nav>`}<div class="meta">${home||page==='login'?'':`<div class="role-switch" aria-label="이용자 전환"><a href="${accountPage?'#account':'#student'}"${accountPage?' data-account-role="student"':''}${!isTeacher?' aria-current="page"':''}>학생</a><a href="${accountPage?'#account':'#teacher'}"${accountPage?' data-account-role="teacher"':''}${isTeacher?' aria-current="page"':''}>선생님</a></div>`}<a class="login" href="#${DSService.session()?'account':'login'}">${DSService.session()?'마이페이지':'로그인'}</a></div></div>`;
 $('#dock').innerHTML=home?'<nav class="role-dock" aria-label="이용자 선택"><a href="#student" data-entry="student">학생</a><a href="#teacher" data-entry="teacher">선생님</a></nav>':'';
}
function compactFooter(){return `<footer class="work-footer"><span>DELTASKILL <small>개편 미리보기</small></span><div>${link('home','대문')}${link('account','마이페이지')}${link('help','이용 안내')}<button data-feedback="화면 의견">의견</button></div></footer>`}
function timerFeature(){return `<article class="time-feature"><div class="feature-heading"><h2>타임어택</h2><span>정적분 · 6문항</span></div><div class="feature-clock">06<span>:</span>00</div><div class="feature-track"><i></i></div><div class="time-feature-bottom"><p>아는 문제, 시간 안에.</p><button data-start="timed">시작하기</button></div></article>`}
function student(){
 const last=get('results-v2',[]).at(-1);
 return `<section class="work-surface student-v7"><div class="work-heading"><div><span class="page-kicker">미적분Ⅰ</span><h1>공부</h1></div><div class="work-tabs" aria-label="학습 선택"><button data-study-tab="study" aria-pressed="${studentTab==='study'}">바로 풀기</button><button data-study-tab="timed" aria-pressed="${studentTab==='timed'}">타임어택</button></div></div><div class="student-work${studentTab==='timed'?' timed-first':''}"><div class="main-work">${studentTab==='timed'?timedLaunch():quickQuestion()}</div><aside class="work-shortcuts">${studentTab==='timed'?`<button class="practice-shortcut" data-study-tab="study"><span>바로 풀기</span><b>∫</b><small>정적분과 넓이</small></button>`:timerFeature()}<a href="#library" class="material-feature"><div><span class="page-kicker">기말고사 준비</span><h2>내신 자료</h2><span>공통수학2 · 미적분Ⅰ</span></div><div class="mini-books" aria-hidden="true"><i></i><i></i><div><small>DELTASKILL</small><b>내신<br>변형</b><span>수학</span></div></div></a></aside></div><div class="study-next-row"><div class="study-record-link"><span>최근 공부</span><strong>${last?`정적분 · ${last.questions.filter(q=>q.correct).length} / ${last.questions.length} 정답`:'풀었던 문제를 다시 확인하세요.'}</strong><a href="#progress">학습 기록</a></div><a class="study-diagnostic-link" href="#diagnostic"><span>단원 진단</span><strong>시간과 난이도, 따로 확인하기</strong><span class="study-link-label">진단 보기</span></a></div>${compactFooter()}</section>`;
}
function libraryPage(){return `<section class="work-surface resource-surface library-v7"><div class="library-heading"><div><span class="page-kicker">문제 · 정답 · 해설</span><h1>내신 자료</h1><p>이번 시험 범위부터 골라보세요.</p></div><a class="library-other" href="#csat"><span>수능을 준비한다면</span><strong>수능·모의고사</strong></a></div><div class="resource-filters"><label class="library-search"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/></svg><span class="sr-only">자료 검색</span><input type="search" id="lib-term" placeholder="과목이나 단원을 입력하세요" value="${esc(library.term)}"></label><div class="work-tabs" aria-label="자료 과목">${['전체',...new Set(catalog.map(d=>d.subject))].map(s=>`<button data-subject="${esc(s)}" aria-pressed="${s===library.subject}">${esc(s)}</button>`).join('')}</div></div><div id="library-results" aria-live="polite">${libraryResults()}</div><a href="#teacher" class="library-maker-link"><div><span>선생님 자료실</span><strong>수업에 맞춰 프린트 만들기</strong></div><span>자료 만들기</span></a>${compactFooter()}</section>`}
function libraryResults(){
 const query=library.term.trim().replace(/\s+/g,'').toLowerCase(),data=catalog.filter(d=>(library.subject==='전체'||d.subject===library.subject)&&(!query||(d.unit+d.subject).replace(/\s+/g,'').toLowerCase().includes(query)));
 return `<div class="library-result-meta"><span>${query?'검색 결과':'공개 미리보기 자료'} <b>${data.length}</b></span><span>PDF · 인쇄용 지면</span></div>`+(data.length?`<div class="real-material-grid">${data.map(d=>`<a href="#material/${encodeURIComponent(d.sku)}" class="real-material"><div class="material-art tone-${catalog.findIndex(v=>v.sku===d.sku)%4}"><img class="material-page-peek" src="${d.previewPages[0]}" alt="" loading="lazy" aria-hidden="true"><div class="real-book"><small>DELTASKILL</small><span>${esc(d.subject)}</span><strong>${esc(d.unit)}</strong><em>${d.count}문항</em><div class="cover-lines"></div></div><span class="material-preview-tag">지면 미리보기</span></div><div class="material-caption"><div><small>${esc(d.subject)}</small><h2>${esc(d.unit)}</h2></div><span>${d.count}문항</span></div><div class="material-card-bottom"><span>문제 + 정답 + 해설</span><span>자료 보기</span></div></a>`).join('')}</div>`:`<div class="simple-empty library-empty"><span class="empty-symbol" aria-hidden="true">⌕</span><h2>검색 결과가 없습니다.</h2><p>단원 이름을 짧게 입력하거나 전체 자료를 확인해 보세요.</p><button class="secondary" data-reset-library>전체 자료 보기</button></div>`);
}
function materialPage(){
 const d=catalog.find(v=>v.sku===detailSku);if(!d)return `<section class="work-surface simple-empty"><h1>자료를 찾을 수 없습니다.</h1>${link('library','자료실','primary')}</section>`;
 detailPage=Math.max(0,Math.min(detailPage,d.previewPages.length-1));
 return `<section class="work-surface material-detail detail-v7"><nav class="page-breadcrumb" aria-label="현재 위치"><a href="#library">내신 자료</a><span>/</span><span>${esc(d.subject)}</span></nav><div class="material-detail-grid"><div class="material-preview-wrap"><div class="material-preview"><div class="preview-toolbar"><strong>지면 미리보기</strong><div><button data-pdf-prev aria-label="이전 미리보기"${detailPage===0?' disabled':''}>‹</button><span>${detailPage+1} <em>/ ${d.previewPages.length}</em></span><button data-pdf-next aria-label="다음 미리보기"${detailPage===d.previewPages.length-1?' disabled':''}>›</button></div></div><img src="${d.previewPages[detailPage]}" width="804" height="1137" alt="${esc(d.unit)} 미리보기 ${detailPage+1}쪽"></div><div class="material-thumbnails" aria-label="미리보기 쪽 선택">${d.previewPages.map((src,i)=>`<button data-pdf-page="${i}" aria-label="${i+1}쪽 보기" aria-pressed="${detailPage===i}"><img src="${src}" width="804" height="1137" alt="" loading="lazy"><span>${i+1}</span></button>`).join('')}</div></div><aside class="material-info"><span class="page-kicker">${esc(d.subject)}</span><h1>${esc(d.unit)}</h1><div class="material-specs"><b>${d.count}<span>문항</span></b><span>문제 · 정답 · 해설</span></div><dl class="detail-facts"><div><dt>파일</dt><dd>PDF</dd></div><div><dt>인쇄</dt><dd>A4</dd></div><div><dt>미리보기</dt><dd>${d.previewPages.length}쪽</dd></div></dl><div class="detail-layouts"><h2>제공 지면</h2><div class="material-layout-list">${d.layouts.map(l=>`<span>${esc(l)}</span>`).join('')}</div></div><div class="detail-actions"><a class="primary" href="${d.pdf}" download>미리보기 PDF 받기</a><a class="secondary" href="https://www.deltaskill.co.kr/naesin/?x=${encodeURIComponent(d.sku)}" target="_blank" rel="noopener">전체 자료 확인 <small>새 창</small></a><button class="text-action" data-use-material="${esc(d.sku)}">이 자료로 수업 준비</button></div><p class="source-note">델타스킬에서 공개한 실제 지면입니다.</p><div class="detail-owned-link"><span>이미 구매하셨나요?</span><a href="#account">내 자료에서 찾기</a></div></aside></div><section class="detail-related"><div class="between"><h2>함께 볼 자료</h2><a href="#library">전체 자료</a></div><div>${catalog.filter(v=>v.sku!==d.sku).slice(0,3).map(v=>`<a href="#material/${encodeURIComponent(v.sku)}"><span>${esc(v.subject)}</span><strong>${esc(v.unit)}</strong><small>${v.count}문항</small></a>`).join('')}</div></section>${compactFooter()}</section>`;
}
function progress(){
 const results=get('results-v2',[]),last=results.at(-1),correct=last?.questions.filter(q=>q.correct).length||0,wrong=last?.questions.filter(q=>!q.correct).length||0;
 return `<section class="work-surface record-surface progress-v7"><div class="work-heading"><div><span class="page-kicker">이 기기의 학습</span><h1>학습 기록</h1></div><a class="quiet" href="#account">내 전체 기록</a></div>${last?`<div class="progress-top"><div class="record-summary"><span>최근 학습 · ${last.timed?'타임어택':'정적분'}</span><strong>${correct}<em> / ${last.questions.length}</em></strong><span>정답 문항</span></div><div class="progress-next"><span class="page-kicker">다음 공부</span><h2>${wrong?'틀린 문제부터 다시.':'다음 문제로 이어가세요.'}</h2><p>${wrong?`${wrong}문항을 다시 확인할 수 있어요.`:'최근 학습의 모든 문제를 맞혔습니다.'}</p>${wrong?'<button class="primary" data-review>오답 다시 풀기</button>':link('student','공부 계속하기','primary')}</div></div><div class="section-caption"><h2>지난 공부</h2><span>${results.length}회</span></div><div class="record-list">${results.slice().reverse().map(r=>`<article><div class="record-type-icon" aria-hidden="true">${r.timed?'◷':'∫'}</div><div><strong>${r.timed?'타임어택':'정적분 연습'}</strong><small>${new Date(r.when).toLocaleDateString('ko-KR')}${r.timed?' · '+formatTime(r.seconds):''}</small></div><span>${r.questions.filter(q=>q.correct).length}<small> / ${r.questions.length} 정답</small></span></article>`).join('')}</div>`:`<div class="simple-empty progress-empty"><span class="empty-integral">∫</span><h2>아직 공부 기록이 없어요.</h2><p>문제를 풀고 나면 이곳에 모입니다.</p>${link('student','첫 문제 풀기','primary')}</div>`}${compactFooter()}</section>`;
}
function helpPage(){return `<section class="work-surface help-v7"><div class="help-heading"><span class="page-kicker">DELTASKILL GUIDE</span><h1>이용 안내</h1><p>공부부터 자료 준비까지.</p></div><div class="help-quick"><a href="#student"><span>학생</span><strong>공부 시작</strong><small>문제 풀이와 타임어택</small></a><a href="#teacher"><span>선생님</span><strong>수업 준비</strong><small>프린트 구성과 인쇄</small></a><a href="#account"><span>내 계정</span><strong>내 자료</strong><small>구매한 자료와 학습 기록</small></a></div><div class="help-layout"><aside class="help-sidebar"><h2>자주 묻는 질문</h2><p>필요한 내용을<br>바로 확인하세요.</p></aside><div class="help-faq"><details open><summary>구매한 자료는 어디서 받나요?</summary><div>로그인한 뒤 <a href="#account">마이페이지의 내 자료</a>에서 확인합니다. 주문번호로 구매 내역을 찾으려면 <a href="https://www.deltaskill.co.kr/orders/" target="_blank" rel="noopener">기존 주문조회</a>를 열어주세요. 처음 자료를 받거나 이용권을 사용할 때는 화면의 수령 안내를 확인해 주세요.</div></details><details><summary>자료를 먼저 살펴볼 수 있나요?</summary><div><a href="#library">내신 자료실</a>에서 실제 지면 3쪽과 미리보기 PDF를 확인할 수 있습니다. 전체 파일은 로그인 후 ‘내 자료에서 전체 파일 확인’으로 이동해 받을 수 있습니다.</div></details><details><summary>수업 프린트는 어떻게 만드나요?</summary><div><a href="#teacher">자료 만들기</a>에서 ‘프린트 만들기’를 고르고 범위·문항 수·지면을 정하세요. 표지가 있는 교재도 미리 보고 인쇄할 수 있습니다. <a href="#print-design">디자인 더 보기</a>에서는 7가지 지면을 고르고 학원명·이름·머리말·꼬리말을 넣을 수 있습니다. 디자인은 계정에 저장한 뒤 마이페이지에서 수정하거나 프린트에 바로 적용할 수 있습니다. 프린트의 문항 구성은 아직 이 브라우저에 보관됩니다.</div></details><details><summary>공부 기록과 진단 기록은 어떻게 보나요?</summary><div>회원 학습 기록은 <a href="#account">마이페이지</a>에서, 이번 화면에서 풀어본 연습은 <a href="#progress">학습 기록</a>에서 확인합니다. 단원 진단 체험은 이 기기에 저장되며 실제 내신·수능 등급과 구분됩니다.</div></details><details><summary>가입하거나 비밀번호를 찾고 싶어요.</summary><div><a href="#login">새 로그인 화면</a>에서 로그인할 수 있습니다. <a href="${DSService.accountLinks('signup')}" target="_blank" rel="noopener">회원가입</a>과 <a href="${DSService.accountLinks('reset')}" target="_blank" rel="noopener">비밀번호 찾기</a>는 기존 계정 페이지에서 진행합니다. 로그인한 비밀번호를 바꾸려면 <a href="#account-settings">계정 관리</a>를 이용하세요.</div></details><details><summary>12월 PDF 체험은 어떻게 운영되나요?</summary><div>필요한 자료를 여러 번 만들어 볼 수 있도록 주간 포인트 방식을 준비하고 있습니다. 지급량·기간·가격은 아직 확정되지 않았습니다.</div></details><details><summary>이용·주문 안내와 정책은 어디에 있나요?</summary><div><a href="https://www.deltaskill.co.kr/guide/" target="_blank" rel="noopener">기존 이용안내</a>와 <a href="https://www.deltaskill.co.kr/notice/" target="_blank" rel="noopener">공지사항</a>을 확인해 주세요. 아래 정책 링크는 기존 사이트의 안내를 새 창으로 엽니다. 이 미리보기의 ‘시안 의견’은 기기에만 저장되며 운영팀에 접수되지 않습니다.</div></details></div></div><section class="help-policies"><h2>정책과 구매 안내</h2><div><a href="https://www.deltaskill.co.kr/terms/" target="_blank" rel="noopener">이용약관</a><a href="https://www.deltaskill.co.kr/privacy/" target="_blank" rel="noopener">개인정보처리방침</a><a href="https://www.deltaskill.co.kr/refund/" target="_blank" rel="noopener">환불·청약철회</a><a href="https://www.deltaskill.co.kr/minor/" target="_blank" rel="noopener">미성년자 구매 안내</a></div><p>기존 델타스킬 안내 · 새 창에서 열립니다.</p></section>${compactFooter()}</section>`}
function notFoundPage(){return `<section class="work-surface page-not-found"><span class="page-kicker">DELTASKILL</span><h1>페이지를 찾을 수 없습니다.</h1><p>주소를 확인하거나 대문에서 다시 시작해 주세요.</p><a class="primary" href="#home">대문으로</a></section>`}
let creatorPage=0;
function previewSheetCount(){return studio.source==='practice'?(studio.docType==='book'?1:0)+Math.ceil(worksheetQuestions().length/(Number(studio.layout)||2))+1:currentMaterial().previewPages.length}
function creatorPager(){const total=previewSheetCount();creatorPage=Math.max(0,Math.min(creatorPage,total-1));return `<div class="creator-page-nav"><button data-creator-page="${creatorPage-1}" aria-label="이전 지면"${creatorPage===0?' disabled':''}>‹</button><span>${creatorPage+1} <em>/ ${total}쪽</em></span><button data-creator-page="${creatorPage+1}" aria-label="다음 지면"${creatorPage===total-1?' disabled':''}>›</button></div>`}
function sheet(){
 const total=previewSheetCount();creatorPage=Math.max(0,Math.min(creatorPage,total-1));
 if(studio.source!=='practice'){const d=currentMaterial();return `<img src="${d.previewPages[creatorPage]}" alt="${esc(d.subject+' '+d.unit)} 실제 미리보기 ${creatorPage+1}쪽" width="804" height="1137">`}
 const qs=worksheetQuestions(),count=Number(studio.layout)||2,book=studio.docType==='book',page=creatorPage-(book?1:0),title=esc(studio.title||'정적분 수업 프린트');
 if(book&&creatorPage===0)return `<div class="sheet-cover"><b>DELTASKILL</b><span>미적분Ⅰ</span><h3>${title}</h3><p>${qs.length}문항 · 문제와 해설</p><small>이름 __________________</small></div>`;
 const solutions=page>=Math.ceil(qs.length/count);
 return `<div class="book-top">DELTASKILL <span>${solutions?'정답과 해설':'MATH WORKSHEET'}</span></div><h3>${solutions?'정답과 해설':title}</h3><p class="sheet-subtitle">미적분Ⅰ ${solutions?'':'<span>이름 ______________</span>'}</p><div class="paper-rule"></div>${solutions?qs.map((q,i)=>`<div class="preview-solution"><b>${i+1}. ${['①','②','③','④','⑤'][q.answer]}</b>${q.solution.join('')}</div>`).join(''):`<div class="native-paper-questions sheet-layout-${count}">${qs.slice(page*count,(page+1)*count).map((q,i)=>`<div class="native-paper-question"><span>${String(page*count+i+1).padStart(2,'0')}</span><div class="question-stem">${q.question}</div><div class="print-options">${q.options.map((o,j)=>`<span>${['①','②','③','④','⑤'][j]} ${math(o)}</span>`).join('')}</div><div class="writing-space"></div></div>`).join('')}</div>`}<div class="paper-footer"><span>DELTASKILL · 미적분Ⅰ</span><span>${creatorPage+1} / ${total}</span></div>`;
}

// Display composition only. Question content, identity and saved work are unchanged.
const quickQuestionBeforeV12=quickQuestion;
quickQuestion=function(){
 const u=selectedStudyUnit(),q=selectedStudyQuestion(),n=u.questions.indexOf(q)+1;
 return quickQuestionBeforeV12()
  .replace('<span class="paper-count">'+n+' <em>', '<span class="paper-count"><b>'+String(n).padStart(2,'0')+'</b> <em>');
};
const studentBeforeV12=student;
student=function(){
 const title=studentTab==='timed'?'타임어택':selectedStudyUnit().name;
 return studentBeforeV12().replace('<div class="work-heading">','<div class="work-heading study-heading">')
  .replace('<h1>공부</h1>',`<h1>${esc(title)}</h1>`)
  .replace(`<span>미적분Ⅰ · ${esc(selectedStudyUnit().name)}</span>`,'<span>연습 문제</span>');
};
const teacherBeforeV12=teacher;
teacher=function(){return teacherBeforeV12().replace('<h1>자료 만들기</h1>','<h1>자료 <span>만들기</span></h1>').replace('<div class="creator-paper-stage">','<div class="creator-paper-stage"><div class="paper-measure" aria-hidden="true"><i></i><span>210 mm</span><i></i></div>');};

(() => {
  const renderLibrary = libraryPage;
  const renderCsat = csatPage;
  const isV12 = () => document.documentElement.dataset.interior === 'v12';

  libraryPage = function() {
    const original = renderLibrary();
    const featured = catalog[0];
    if (!isV12() || !featured?.previewPages?.[0]) return original;

    const template = document.createElement('template');
    template.innerHTML = original;
    const heading = template.content.querySelector('.library-heading');
    const titleColumn = heading?.firstElementChild;
    const relatedLink = heading?.querySelector('.library-other');
    if (!titleColumn || !relatedLink) return original;
    titleColumn.append(relatedLink);
    const exhibit = document.createElement('a');
    exhibit.className = 'library-v12-exhibit';
    exhibit.href = '#material/' + encodeURIComponent(featured.sku);
    exhibit.setAttribute('aria-label', featured.subject + ' ' + featured.unit + ' 지면 미리보기');
    exhibit.innerHTML = `<div class="library-v12-object" aria-hidden="true">
      <img src="${esc(featured.previewPages[0])}" width="804" height="1137" alt="">
      <div class="library-v12-cover">
        <small>DELTASKILL</small>
        <span>${esc(featured.subject)}</span>
        <strong>${esc(featured.unit)}</strong>
        <div class="library-v12-cover-art"></div>
      </div>
    </div><span class="library-v12-exhibit-link">지면 미리보기 <span aria-hidden="true">↗</span></span>`;
    heading.append(exhibit);
    return template.innerHTML;
  };

  csatPage = function() {
    const original = renderCsat();
    if (!isV12()) return original;

    const template = document.createElement('template');
    template.innerHTML = original;
    const feature = template.content.querySelector('.cv7-feature');
    const number = feature?.querySelector('h3')?.textContent.match(/(\d+)번/)?.[1];
    if (!number) return original;
    const marker = document.createElement('span');
    marker.className = 'csat-v12-number';
    marker.setAttribute('aria-hidden', 'true');
    marker.textContent = number;
    feature.prepend(marker);
    return template.innerHTML;
  };
})();

(() => {
  'use strict';
  const render = () => {
    const content = document.getElementById('content');
    if (!content) return;
    const heading = content.querySelector('.help-heading');
    if (!heading) return;
    const active = document.documentElement.dataset.interior === 'v12';
    let mark = heading.querySelector('.v12-help-mark');
    if (!mark && active) {
      mark = document.createElement('span');
      mark.className = 'v12-help-mark';
      mark.setAttribute('aria-hidden', 'true');
      mark.textContent = '?';
      heading.append(mark);
    }
    if (mark && mark.hidden === active) mark.hidden = !active;
  };
  const start = () => {
    const content = document.getElementById('content');
    if (!content) return;
    render();
    new MutationObserver(render).observe(content, { childList: true, subtree: true });
    new MutationObserver(render).observe(document.documentElement, { attributes: true, attributeFilter: ['data-interior'] });
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true });
  else start();
})();

(() => {
  const renderLibrary = libraryPage;

  libraryPage = function() {
    const original = renderLibrary();
    if (document.documentElement.dataset.interior !== 'v12') return original;

    const template = document.createElement('template');
    template.innerHTML = original;
    const exhibit = template.content.querySelector('.library-v12-exhibit');
    const object = exhibit?.querySelector('.library-v12-object');
    if (!object) return original;

    const photo = document.createElement('img');
    photo.className = 'library-v13-exhibit-photo';
    photo.src = 'assets/editorial/fresh-materials-v13.png';
    photo.width = 1536;
    photo.height = 1024;
    photo.alt = '';
    photo.fetchPriority = 'high';
    object.replaceWith(photo);
    return template.innerHTML;
  };
})();

// Photographic presentation. Existing question, timer and navigation actions are retained.
timerFeature=function(){return `<article class="time-feature editorial-time"><button type="button" class="editorial-tablet" data-start="timed" aria-label="6분 타임어택 시작"><img src="assets/editorial/cool-study-v13.png" alt="햇빛이 드는 책상 위의 패드" width="1536" height="1024"><div class="editorial-tablet-screen" aria-hidden="true"><small>TIME ATTACK</small><strong>06:00</strong><i></i></div></button><div class="feature-heading"><h2>타임어택</h2><span>6분 · 6문항</span></div><div class="time-feature-bottom"><p>아는 문제, 시간 안에.</p><button data-start="timed">시작하기</button></div></article>`;};
const studentBeforeEditorial13=student;
student=function(){return studentBeforeEditorial13().replace('<a href="#library" class="material-feature">','<a href="#library" class="material-feature editorial-material"><img src="assets/editorial/fresh-materials-v13.png" alt="펼쳐진 델타스킬 함수 교재" width="1536" height="1024">');};
const csatBeforeEditorial13=csatPage;
csatPage=function(){return csatBeforeEditorial13().replace('<h3>공통 21번<br>풀이 분석</h3>','<h3>공통 21번 풀이 분석</h3>').replace('<div class="cv7-feature">','<div class="cv7-feature editorial-csat"><a class="editorial-csat-image" href="https://www.deltaskill.co.kr/analysis/index.html?step=1" target="_blank" rel="noopener" aria-label="공통 21번 풀이 분석 열기, 새 탭"><img class="editorial-csat-photo" src="assets/editorial/csat-material-v13.png" alt="21번 풀이 분석을 위한 교재 표지 연출" width="1536" height="1024"></a>');};

// Short navigation and action copy, without changing service availability or data.
const libraryBeforeCopy13=libraryPage;
libraryPage=function(){return libraryBeforeCopy13().replace('이번 시험 범위부터 골라보세요.','시험 범위로 찾아보세요.').replace('수능을 준비한다면','수능 준비 자료').replaceAll('지면 미리보기','문제 미리보기');};
const libraryResultsBeforeCopy13=libraryResults;
libraryResults=function(){return libraryResultsBeforeCopy13().replace('공개 미리보기 자료','공개 자료').replace('PDF · 인쇄용 지면','인쇄용 PDF');};
const csatBeforeCopy13=csatPage;
csatPage=function(){return csatBeforeCopy13().replace('문항별 풀이.<br>시험별 분석.','기출 한 문제,<br>여러 가지 풀이.').replace('공개된 기출 풀이와 시험 분석을 살펴보고,<br>배운 내용을 직접 풀며 확인하세요.','막힌 문항의 다른 풀이를 찾아보세요.').replace('원문부터 단계별 풀이,<br>유사 문항 사례까지 함께 살펴보세요.','원문, 단계별 풀이, 유사 문항을 함께 확인하세요.').replace('기출 풀이 분석 열기 </a>','풀이 보기 ↗</a>');};
const loginBeforeCopy13=loginPage;
loginPage=function(){return loginBeforeCopy13().replace('가입할 때 사용한 휴대폰 번호를 입력하세요.','가입한 휴대폰 번호로 로그인하세요.');};
const diagnosticBeforeCopy13=diagnosticSetup;
diagnosticSetup=function(){return diagnosticBeforeCopy13().replace('<strong>시간 안에</strong>','<strong>시간 진단</strong>').replace('<strong>어디까지</strong>','<strong>난이도 진단</strong>').replace('>평가 시작</button>','>진단 시작</button>');};
const teacherBeforeCopy13=teacher;
teacher=function(){return teacherBeforeCopy13().replace('<h2>인쇄 구성</h2>','<h2>페이지 구성</h2>');};

/* A single page renderer is shared by preview, enlarged view and browser print. */
(() => {
  'use strict';
  const original = { sheet, previewSheetCount, printSheet };
  const designs = [{ id: 'standard', name: '기본형' }, { id: 'exam', name: '시험형' }, { id: 'notes', name: '풀이형' }, { id: 'academy', name: '학원형' }, { id: 'editorial', name: '에디토리얼형' }, { id: 'grid', name: '격자형' }, { id: 'band', name: '타이틀형' }];
  const normalizeDesign = value => designs.some(d => d.id === value) ? value : 'standard';
  const escapeText = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c]));
  const isPractice = () => studio.source === 'practice';
  const plain = (value, limit) => String(value ?? '').replace(/[\u0000-\u001f\u007f]/g, ' ').trim().slice(0, limit);
  function normalizeSettings(value = {}) {
    const s = value && typeof value === 'object' ? value : {};
    return { academyName: plain(s.academyName, 32), teacherName: plain(s.teacherName, 20), headerText: plain(s.headerText, 60), footerText: plain(s.footerText, 60), identityPlacement: ['header','footer','both','none'].includes(s.identityPlacement) ? s.identityPlacement : 'header', accent: ['default','ink','indigo','claret','slate'].includes(s.accent) ? s.accent : 'default', font: ['default','sans','serif'].includes(s.font) ? s.font : 'default', titleAlign: s.titleAlign === 'center' ? 'center' : 'left', showStudentName: s.showStudentName !== false, showPageNumber: s.showPageNumber !== false };
  }
  function config(source = studio) {
    return { design: normalizeDesign(source.printDesign), layout: [1, 2, 4].includes(Number(source.layout)) ? Number(source.layout) : 2, book: source.docType === 'book', title: String(source.title || '정적분 수업 프린트'), subject: source.itemSource==='exam-basic-v34'?String(source.subject||'수학'):'미적분Ⅰ', unit: source.itemSource==='exam-basic-v34'?String(source.unit||'기본 기출'):(typeof studyUnits !== 'undefined' && studyUnits.find(u => u.id === source.studyUnit)?.name) || '정적분', settings: normalizeSettings(source.printSettings), questions: source.itemSource==='exam-basic-v34'?(window.DSTeacherQuestionsV34?.resolve(source)||[]):worksheetQuestions() };
  }
  function sequence(c) {
    const pages = [];
    if (c.book) pages.push({ type: 'cover', offset: 0, questions: [] });
    for (let i = 0; i < c.questions.length; i += c.layout) pages.push({ type: 'questions', offset: i, questions: c.questions.slice(i, i + c.layout) });
    return pages.concat(solutionPages(c));
  }
  function renderSolution({ question, number, start, end }) {
    const answer = ['①','②','③','④','⑤'][question.answer];
    return `<article class="pc14-solution"><h2>${number}. <span>${start ? '계속' : answer}</span></h2><div>${question.solution.slice(start, end).join('')}</div></article>`;
  }
  const solutionCache = new Map();
  function solutionPages(c) {
    if (!c.questions.length) return [];
    const entries = c.questions.map((question, i) => ({ question, number: i + 1, start: 0, end: question.solution.length }));
    const mathRenderer = window.WebMathRendererV23;
    const key = JSON.stringify([c.design, c.title, c.subject, c.unit, normalizeSettings(c.settings),
      mathRenderer?.engineStatus(), entries.map(({ question }) => [question.answer, question.solution])]);
    if (solutionCache.has(key)) return solutionCache.get(key);

    const probe = document.body?.appendChild?.(document.createElement('div'));
    let fits = column => column.reduce((sum, entry) => sum + entry.end - entry.start + 1, 0) <= 12;
    if (probe) {
      probe.className = 'pc14-measuring';
      probe.setAttribute('aria-hidden', 'true');
      probe.inert = true;
      probe.innerHTML = renderPage(c, { type: 'solutions', columns: [[], []] }, 0, 1);
      const column = probe.querySelector('.pc14-solution-column');
      fits = entries => {
        column.innerHTML = entries.map(renderSolution).join('');
        mathRenderer?.typeset(column);
        return column.scrollHeight <= column.clientHeight;
      };
    }
    try {
      const columns = [];
      let column = [];
      for (const entry of entries) {
        if (fits([...column, entry])) {
          column.push(entry);
          continue;
        }
        if (column.length) columns.push(column);
        column = [];
        if (fits([entry])) {
          column.push(entry);
          continue;
        }
        // A solution longer than one column can continue at a source paragraph boundary.
        let start = entry.start;
        while (start < entry.end) {
          let end = start + 1;
          while (end < entry.end && fits([{ ...entry, start, end: end + 1 }])) end++;
          column = [{ ...entry, start, end }];
          if (end < entry.end) columns.push(column);
          start = end;
        }
      }
      if (column.length) columns.push(column);
      // Give the last page two readable columns even when a few solutions fit on one side.
      if (columns.length % 2) {
        const last = columns.pop();
        const middle = Math.ceil(last.length / 2);
        columns.push(last.slice(0, middle), last.slice(middle));
      }
      const pages = [];
      for (let i = 0; i < columns.length; i += 2) {
        pages.push({ type: 'solutions', columns: columns.slice(i, i + 2) });
      }
      if (solutionCache.size >= 16) solutionCache.clear();
      solutionCache.set(key, pages);
      return pages;
    } finally {
      probe?.remove();
    }
  }
  function renderPage(c, page, index, total) {
    const title = escapeText(c.title), subject = escapeText(c.subject), unit = escapeText(c.unit || c.subject);
    const s = normalizeSettings(c.settings), identity = [s.academyName,s.teacherName].filter(Boolean).map(escapeText).join(' · ');
    const identityHead = identity && ['header','both'].includes(s.identityPlacement) ? `<div class="pc16-identity"><b>${escapeText(s.academyName)}</b><span>${escapeText(s.teacherName)}</span></div>` : '';
    const identityFoot = identity && ['footer','both'].includes(s.identityPlacement) ? identity : '';
    const head = `<header class="pc14-head">${identityHead}<div class="pc14-brandline"><b>DELTASKILL</b><span>${subject} · ${unit}</span></div><div class="pc14-titleline"><h1>${page.type === 'solutions' ? '정답과 해설' : title}</h1>${s.showStudentName ? '<span>이름 ______________</span>' : ''}</div>${s.headerText ? `<p class="pc16-header-text">${escapeText(s.headerText)}</p>` : ''}${page.type === 'solutions' ? `<p class="pc14-original-title">${title}</p>` : ''}</header>`;
    let body = '';
    if (page.type === 'cover') body = `<div class="pc14-cover"><span>${subject}</span><h2>${title}</h2><p>${c.questions.length}문항 · 문제와 해설</p><div class="pc14-cover-rule"></div></div>`;
    if (page.type === 'questions') body = `<div class="pc14-questions pc14-layout-${c.layout}">${page.questions.map((q, i) => `<article class="pc14-question"><div class="pc14-question-top"><span class="pc14-question-number">${String(page.offset + i + 1).padStart(2, '0')}</span><span class="pc14-question-meta">${escapeText(q.short || '')}</span></div><div class="pc14-stem">${q.question}</div><div class="pc14-options">${q.options.map((o, j) => `<span>${['①','②','③','④','⑤'][j]} ${math(o)}</span>`).join('')}</div><div class="pc14-writing"><span class="pc14-writing-label">풀이</span><div class="pc14-writing-lines" aria-hidden="true"><i></i><i></i><i></i><i></i></div></div><div class="pc14-checks">검산 <span>□ 조건　□ 계산　□ 답</span></div></article>`).join('')}</div>`;
    if (page.type === 'solutions') body = `<div class="pc14-solution-columns">${page.columns.map(column => `<div class="pc14-solution-column">${column.map(renderSolution).join('')}</div>`).join('')}</div>`;
    const footer = [identityFoot,escapeText(s.footerText)].filter(Boolean).join(' · ');
    return `<section class="pc14-page pc14-${page.type}" data-print-design="${normalizeDesign(c.design)}" data-print-accent="${s.accent}" data-print-font="${s.font}" data-title-align="${s.titleAlign}" aria-label="${index + 1}쪽 ${page.type === 'solutions' ? '정답과 해설' : page.type === 'cover' ? '표지' : '문제'}">${head}<div class="pc14-body">${body}</div><footer class="pc14-foot"><div class="pc16-footer-copy">${footer ? `<p>${footer}</p>` : ''}<span>DELTASKILL · ${unit}</span></div>${s.showPageNumber ? `<span>${index + 1} / ${total}</span>` : ''}</footer></section>`;
  }
  function renderPages(c = config()) { const pages = sequence(c); return pages.map((p, i) => renderPage(c, p, i, pages.length)); }
  previewSheetCount = function () { return isPractice() ? sequence(config()).length : original.previewSheetCount.apply(this, arguments); };
  sheet = function () {
    if (!isPractice()) return original.sheet.apply(this, arguments);
    const pages = renderPages();
    creatorPage = Math.max(0, Math.min(Number(creatorPage) || 0, Math.max(0, pages.length - 1)));
    return `<div class="pc14-preview-scale">${pages[creatorPage] || ''}</div>`;
  };
  let printing = false;
  async function printConfig(c = config()) {
    if (printing) return;
    printing = true;
    const area = document.getElementById('print-area');
    try {
      if (!area) return;
      if (document.fonts?.ready) await document.fonts.ready;
      const pages = renderPages(c);
      if (!pages.length) return;
      area.innerHTML = pages.join('');
      window.WebMathRendererV23?.typeset(area);
      if (document.fonts?.ready) await document.fonts.ready;
      area.classList.add('pc14-proofing');
      const overflows = [...area.querySelectorAll('.pc14-page')].some(page => {
        const regions = page.querySelectorAll('.pc14-body,.pc14-solution-column');
        return [...regions].some(b => b.scrollHeight > b.clientHeight + 2 || b.scrollWidth > b.clientWidth + 2);
      });
      area.classList.remove('pc14-proofing');
      if (overflows) { if (typeof toast === 'function') toast('A4 지면을 넘는 내용이 있습니다. 미리보기에서 확인해 주세요.'); return; }
      document.body.classList.add('pc14-printing');
      window.print();
    } catch (error) { if (typeof toast === 'function') toast('인쇄 지면을 준비하지 못했습니다. 다시 시도해 주세요.'); }
    finally { area?.classList.remove('pc14-proofing'); document.body.classList.remove('pc14-printing'); printing = false; }
  }
  printSheet = async function () { if (!isPractice()) return original.printSheet.apply(this, arguments); return printConfig(); };
  const fitState = new WeakMap();
  const mmToPx = 96 / 25.4;
  function fit(host) {
    if (!host.isConnected || !host.querySelector('.pc14-page')) return;
    const available = host.getBoundingClientRect().width;
    if (available <= 0) return;
    const scale = Math.min(1, available / (210 * mmToPx));
    const height = 297 * mmToPx * scale;
    const previous = fitState.get(host);
    if (!previous || Math.abs(previous.width - available) > .25) {
      host.style.setProperty('--pc14-scale', String(scale));
      host.style.setProperty('--pc14-preview-height', `${height}px`);
      fitState.set(host, { width: available });
    }
  }
  const resizeObserver = typeof ResizeObserver === 'function' ? new ResizeObserver(entries => { for (const { target } of entries) fit(target); }) : null;
  const observed = new Set();
  function setUpPreview() {
    const enlarged=document.getElementById('paper-expanded');
    if(enlarged?.children.length){
      if(!enlarged.parentElement.classList.contains('pc14-expanded-scroll')){const frame=document.createElement('div');frame.className='pc14-expanded-scroll';frame.setAttribute('aria-label','확대 지면, 가로와 세로로 이동할 수 있습니다');enlarged.parentElement.insertBefore(frame,enlarged);frame.append(enlarged);}
      enlarged.classList.toggle('pc14-original-zoom',!enlarged.querySelector('.pc14-page')&&!!enlarged.querySelector('img'));
    }
    for (const old of observed) if (!old.isConnected || !old.querySelector('.pc14-page')) { resizeObserver?.unobserve(old); observed.delete(old); old.classList.remove('pc14-preview-host'); old.style.removeProperty('--pc14-scale'); old.style.removeProperty('--pc14-preview-height'); fitState.delete(old); }
    for (const host of document.querySelectorAll('#sheet,#paper-expanded')) {
      if (!host.querySelector('.pc14-page')) { host.classList.remove('pc14-preview-host'); continue; }
      host.classList.add('pc14-preview-host');
      if (!observed.has(host)) { observed.add(host); resizeObserver?.observe(host); }
      fit(host);
    }
  }
  function installChooser() {
    const canvas = document.querySelector('.creator-canvas');
    if (!canvas || !isPractice() || document.body.dataset.page === 'print-design') return;
    studio.printDesign = normalizeDesign(studio.printDesign);
    let picker = canvas.querySelector('.pc14-design-picker');
    if (!picker) {
      picker = document.createElement('div');
      picker.className = 'pc14-design-picker';
      picker.innerHTML = `<span class="pc14-picker-label">지면 디자인</span><label class="pc14-select-label">지면 디자인<select data-studio="printDesign" aria-label="지면 디자인">${designs.map(d => `<option value="${d.id}">${d.name}</option>`).join('')}</select></label><div class="pc14-design-swatches" aria-label="지면 디자인 선택">${designs.slice(0,3).map(d => `<button type="button" data-pc14-swatch="${d.id}" aria-pressed="false" aria-label="${d.name} 지면 선택"><span class="pc14-swatch-paper" aria-hidden="true"><b></b><i></i><i></i><i></i></span><span>${d.name}</span></button>`).join('')}</div><a class="pc16-more" href="#print-design">디자인 더 보기 <span aria-hidden="true">↗</span></a>`;
      canvas.querySelector('.creator-canvas-toolbar').after(picker);
    }
    const select = picker.querySelector('select');
    if (select.value !== studio.printDesign) select.value = studio.printDesign;
    for (const swatch of picker.querySelectorAll('[data-pc14-swatch]')) { const chosen=swatch.dataset.pc14Swatch === studio.printDesign; swatch.classList.toggle('is-current',chosen); swatch.setAttribute('aria-pressed',String(chosen)); }
    const more=picker.querySelector('.pc16-more'), label=designs.find(d=>d.id===studio.printDesign)?.name;
    const text=designs.slice(0,3).some(d=>d.id===studio.printDesign)?'디자인 더 보기 ↗':label+' · 편집 ↗';
    if(more && more.textContent!==text)more.textContent=text;
  }
  let queued = false;
  function schedule() {
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => { queued = false; installChooser(); setUpPreview(); });
  }
  function refreshMeasuredPreview() {
    solutionCache.clear();
    const initial = document.getElementById('sheet');
    if (initial && isPractice() && document.querySelector('.creator-surface')) {
      initial.innerHTML = sheet();
      const pager = document.querySelector('.creator-page-nav');
      if (pager) pager.outerHTML = creatorPager();
      const summary = document.getElementById('tb20-review');
      if (summary && window.TeacherBooksV20) {
        const wasOpen = summary.querySelector('details')?.open;
        summary.outerHTML = window.TeacherBooksV20.review();
        const details = document.querySelector('#tb20-review details');
        if (details && wasOpen) details.open = true;
      }
      const dialog = document.getElementById('paper-dialog');
      if (dialog?.open) document.getElementById('paper-expanded').innerHTML = sheet();
    }
    document.dispatchEvent(new Event('ds-print-fonts-ready'));
    schedule();
  }
  function start() {
    const content = document.getElementById('content');
    if (content) {
      new MutationObserver(schedule).observe(content, { childList: true, subtree: true });
      const initial = document.getElementById('sheet');
      if (initial && isPractice() && content.querySelector('.creator-surface')) {
        initial.innerHTML = sheet();
        const pager = content.querySelector('.creator-page-nav');
        if (pager && typeof creatorPager === 'function') pager.outerHTML = creatorPager();
      }
    }
    const expanded = document.getElementById('paper-expanded');
    if (expanded) new MutationObserver(schedule).observe(expanded, { childList: true, subtree: true });
    const dialog = document.getElementById('paper-dialog');
    if (dialog) new MutationObserver(schedule).observe(dialog, { attributes: true, attributeFilter: ['open'] });
    document.addEventListener('change', e => { if (e.target?.dataset?.studio === 'printDesign') schedule(); });
    document.addEventListener('click', e => { const button=e.target.closest('[data-pc14-swatch]'); if(!button)return; const select=document.querySelector('[data-studio="printDesign"]'); if(!select)return; select.value=button.dataset.pc14Swatch; select.dispatchEvent(new Event('change',{bubbles:true})); });
    window.addEventListener('resize', schedule);
    document.fonts?.ready?.then(schedule);
    document.fonts?.addEventListener('loadingdone', refreshMeasuredPreview);
    window.addEventListener('load', refreshMeasuredPreview, { once: true });
    schedule();
  }
  window.PrintComposerV14 = { normalizeDesign, normalizeSettings, config, sequence, renderPage, renderPages, printConfig, designs };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true }); else start();
})();

// Exact public DELTASKILL first-page assets. Original preview PDFs remain unchanged.
const originalSourceSheet14=sheet;
const originalSourceCount14=previewSheetCount;
const originalSourceTeacher14=teacher;
const originalSourceUpdate14=updateSheet;
const originalSourcePrint14=printSheet;
const sourceLayout14=()=>['1','2','4'].includes(String(studio.sourceLayout))?String(studio.sourceLayout):'pdf';
const sourceLayoutPath14=(d,n)=>'reference-print-v14/'+encodeURIComponent(d.sku)+'-L'+n+'.png';
previewSheetCount=function(){return studio.source!=='practice'&&sourceLayout14()!=='pdf'?1:originalSourceCount14();};
sheet=function(){
 if(studio.source==='practice'||sourceLayout14()==='pdf')return originalSourceSheet14();
 creatorPage=0;const d=currentMaterial(),n=sourceLayout14();
 return `<img class="original-layout-page" src="${sourceLayoutPath14(d,n)}" alt="${esc(d.subject+' '+d.unit)} · ${n}문항 ${n==='1'?'1단':'2단'} · 실제 첫 지면" width="1000" height="1416">`;
};
teacher=function(){
 const html=originalSourceTeacher14();if(studio.source==='practice')return html;
 const d=currentMaterial(),selected=sourceLayout14();
 return html.replace(/<div class="creator-available-layouts">[\s\S]*?<\/div><p class="creator-small">[\s\S]*?<\/p>/,
 `<label class="creator-field source-layout-field">원본 지면<select data-studio="sourceLayout" aria-label="원본 지면 구성"><option value="pdf"${selected==='pdf'?' selected':''}>PDF 미리보기 · ${d.previewPages.length}쪽</option>${[1,2,4].map(n=>`<option value="${n}"${selected===String(n)?' selected':''}>${n}문항 · ${n===1?'1단':'2단'} · 첫 지면</option>`).join('')}</select></label><div class="original-layout-thumbs" aria-label="판형별 실제 지면">${[1,2,4].map(n=>`<button type="button" data-original-layout="${n}" aria-pressed="${selected===String(n)}" aria-label="${n}문항 실제 첫 지면 보기"><img src="${sourceLayoutPath14(d,n)}" alt="" loading="lazy" width="1000" height="1416"><span>${n}문항</span></button>`).join('')}</div><p class="creator-small">기존 사이트에서 제공하는 원본 지면입니다.</p>`);
};
updateSheet=function(){
 originalSourceUpdate14();
 if(studio.source==='practice')return;
 const nav=document.querySelector('.creator-page-nav');if(nav)nav.outerHTML=creatorPager();
 document.querySelectorAll('[data-original-layout]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.originalLayout===sourceLayout14())));
};
printSheet=function(){if(studio.source==='practice')return originalSourcePrint14.apply(this,arguments);if(typeof toast==='function')toast('원본 자료는 미리보기 PDF에서 인쇄할 수 있습니다.');};
document.addEventListener('click',event=>{
 const button=event.target.closest('[data-original-layout]');if(!button)return;
 const select=document.querySelector('[data-studio="sourceLayout"]');if(!select)return;
 select.value=button.dataset.originalLayout;
 select.dispatchEvent(new Event('change',{bubbles:true}));
});

/* Photographic paper beneath the original page: screen presentation only. */
(() => {
  let queued = false;
  function framePage(element, variant) {
    if (!element || element.parentElement?.classList.contains('paper-photo-scene')) return;
    const frame = document.createElement('div');
    frame.className = 'paper-photo-scene ' + variant;
    element.before(frame);
    frame.append(element);
  }
  function decorate() {
    queued = false;
    framePage(document.querySelector('.creator-paper-stage > #sheet'), 'paper-photo-workspace');
    framePage(document.querySelector('.material-preview > img'), 'paper-photo-detail');
    document.querySelectorAll('.material-art > .material-page-peek').forEach(image => framePage(image, 'paper-photo-catalog'));
  }
  function schedule() {
    if (queued) return;
    queued = true;
    requestAnimationFrame(decorate);
  }
  function start() {
    const content = document.getElementById('content');
    if (!content) return;
    new MutationObserver(schedule).observe(content, { childList: true, subtree: true });
    decorate();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true });
  else start();
})();

/* Isolated design draft. Apply commits it; leaving the editor does not. */
(() => {
  const api = window.PrintComposerV14;
  const key = 'print-designs-v16';
  const descriptions = { standard:'익숙한 수업 지면', exam:'시험지처럼 단정하게', notes:'풀이를 차근차근', academy:'이름이 돋보이는 구성', editorial:'여백과 큰 제목', grid:'계산과 그래프 연습', band:'제목을 또렷하게' };
  let draft = null, page = 0, profileId = '', profileName = '', profileVersion = 0, profileSource = '', previewQueued = false, saveBusy = false, resumeAfterLogin = false, saveAttempt=null;
  const cleanName = value => String(value ?? '').replace(/[\u0000-\u001f\u007f]/g,' ').trim().slice(0,32);
  const normalizeProfile = value => {
    if (!value || typeof value !== 'object' || !cleanName(value.name)) return null;
    return { id: String(value.id||'').replace(/[^a-z0-9-]/gi,'').slice(0,64), name: cleanName(value.name), printDesign:api.normalizeDesign(value.printDesign), printSettings:api.normalizeSettings(value.printSettings), layout:[1,2,4].includes(Number(value.layout))?String(value.layout):'2', docType:value.docType==='book'?'book':'print' };
  };
  const profiles = () => { const value=get(key,[]); return Array.isArray(value)?value.map(normalizeProfile).filter(Boolean):[]; };
  const value = name => esc(draft.printSettings[name]);
  const field = (name,label,max,placeholder) => `<label class="pd16-field">${label}<input data-print-setting="${name}" value="${value(name)}" maxlength="${max}" placeholder="${placeholder}" autocomplete="off"></label>`;
  const options = (values,current) => values.map(([v,t])=>`<option value="${v}"${v===current?' selected':''}>${t}</option>`).join('');
  function ensureDraft() {
    if (draft) return;
    draft={...studio,source:'practice',printDesign:api.normalizeDesign(studio.printDesign),printSettings:api.normalizeSettings(studio.printSettings)};
    page=0; profileId=''; profileName='';
  }
  function pages() { return api.renderPages(api.config(draft)); }
  function preview() {
    const all=pages();page=Math.max(0,Math.min(page,all.length-1));
    return `<div class="pc14-preview-scale">${all[page]}</div>`;
  }
  function pager() {
    const total=pages().length;page=Math.max(0,Math.min(page,total-1));
    return `<button type="button" data-design-page="${page-1}" aria-label="이전 디자인 지면"${page===0?' disabled':''}>‹</button><span>${page+1} <em>/ ${total}쪽</em></span><button type="button" data-design-page="${page+1}" aria-label="다음 디자인 지면"${page===total-1?' disabled':''}>›</button>`;
  }
  function savedOptions() {
    const cloud=window.DSPrintDesigns?.snapshot().items||[], local=profiles();
    const group=(items,source,label)=>items.length?`<optgroup label="${label}">${items.map(p=>`<option value="${source}:${esc(p.id)}"${p.id===profileId&&profileSource===source?' selected':''}>${esc(p.name)}</option>`).join('')}</optgroup>`:'';
    return '<option value="">저장한 디자인 선택</option>'+group(cloud,'cloud','내 계정')+group(local,'local','이 기기에만 저장된 디자인');
  }
  function updateSavedControls(){
    if(location.hash!=='#print-design')return;
    const select=document.querySelector('[data-design-load]');if(select)select.innerHTML=savedOptions();
    const button=document.querySelector('[data-design-save]');if(button){button.disabled=saveBusy;button.textContent=saveBusy?'저장 중…':'계정에 저장';}
    const note=document.querySelector('.pd16-local-note');if(note)note.textContent=DSService.session()?'계정에 저장하면 다른 컴퓨터에서도 불러올 수 있습니다.':'로그인하면 내 계정에 저장할 수 있습니다.';
    const feedback=document.querySelector('[data-design-cloud-state]'),s=window.DSPrintDesigns?.snapshot();
    if(feedback&&s){feedback.textContent=s.phase==='loading'?'내 디자인 불러오는 중…':s.phase==='error'?s.error:'';}
  }
  function gallery() {
    const c=api.config(draft), questionPage=api.sequence(c).find(p=>p.type==='questions');
    return api.designs.map((d,i)=>`<button type="button" class="pd16-template" data-design-template="${d.id}" aria-pressed="${d.id===draft.printDesign}" aria-label="${d.name} 선택"><span class="pd16-thumb" aria-hidden="true"><span class="pd16-thumb-scale">${(questionPage?api.renderPage({...c,design:d.id,settings:api.normalizeSettings()},questionPage,0,1):'')}</span></span><span class="pd16-template-name">${d.name}<i>${i<3?'기본':'추가'}</i></span><span class="pd16-template-desc">${descriptions[d.id]}</span><span class="pd16-template-check" aria-hidden="true">✓</span></button>`).join('');
  }
  function render() {
    ensureDraft();const s=draft.printSettings;
    return `<section class="work-surface pd16-editor"><div class="pd16-heading"><div><a class="pd16-back" href="#teacher">← 자료 만들기</a><h1>프린트 디자인</h1></div><button class="primary" type="button" data-design-apply>이 디자인 적용 <span aria-hidden="true">↗</span></button></div><div class="pd16-workbench"><aside class="pd16-settings"><div class="pd29-designs"><div class="pd16-gallery-heading"><h2>지면 고르기</h2><span>7가지 디자인</span></div><div class="pd16-gallery" aria-label="프린트 디자인 7종">${gallery()}</div></div><div class="pd16-setting-content"><fieldset><legend>이름 · 학원명</legend>${field('academyName','학원명',32,'예: 오늘수학')}${field('teacherName','이름',20,'예: 김수학 선생님')}<label class="pd16-field">표시 위치<select data-print-setting="identityPlacement" aria-label="표시 위치">${options([['header','머리말'],['footer','꼬리말'],['both','머리말 + 꼬리말'],['none','표시하지 않음']],s.identityPlacement)}</select></label></fieldset><fieldset><legend>머리말 · 꼬리말</legend>${field('headerText','머리말 문구',60,'예: 고2 A반 · 기말고사 대비')}${field('footerText','꼬리말 문구',60,'예: 오늘의 풀이를 내일의 실력으로')}</fieldset><details class="pd16-options"><summary>글자와 페이지 구성 <span aria-hidden="true">＋</span></summary><div class="pd16-option-grid"><label class="pd16-field">글자체<select data-print-setting="font" aria-label="글자체">${options([['default','디자인 기본'],['sans','고딕'],['serif','명조']],s.font)}</select></label><label class="pd16-field">제목 정렬<select data-print-setting="titleAlign" aria-label="제목 정렬">${options([['left','왼쪽'],['center','가운데']],s.titleAlign)}</select></label><label class="pd16-field">한 쪽 문항 수<select data-design-layout aria-label="한 쪽 문항 수">${options([['1','1문항'],['2','2문항'],['4','4문항']],String(draft.layout))}</select></label><label class="pd16-field">제작 형태<select data-design-doctype aria-label="제작 형태">${options([['print','수업 프린트'],['book','표지 있는 교재']],draft.docType||'print')}</select></label></div><fieldset class="pd16-colors"><legend>인쇄 포인트색</legend>${[['default','디자인 기본'],['ink','검정'],['indigo','남색'],['claret','버건디'],['slate','청회색']].map(([id,label])=>`<button type="button" data-design-accent="${id}" aria-label="${label} 포인트색" aria-pressed="${s.accent===id}"><i aria-hidden="true"></i><span>${label}</span></button>`).join('')}</fieldset><label class="pd16-checkbox"><input type="checkbox" data-print-setting="showStudentName"${s.showStudentName?' checked':''}> 학생 이름칸</label><label class="pd16-checkbox"><input type="checkbox" data-print-setting="showPageNumber"${s.showPageNumber?' checked':''}> 페이지 번호</label></details><section class="pd16-save-section"><h3>내 디자인</h3><label class="pd16-field">저장한 디자인<select data-design-load aria-label="저장한 디자인">${savedOptions()}</select></label><label class="pd16-field">디자인 이름<input data-design-name maxlength="32" value="${esc(profileName)}" placeholder="예: 고2 정규반 프린트"></label><button type="button" class="secondary pd16-save" data-design-save>계정에 저장</button><p class="pd16-local-note">로그인하면 다른 컴퓨터에서도 불러올 수 있습니다.</p><p data-design-cloud-state role="status"></p><div class="pd17-save-extras">${DSService.session()?'<button type="button" data-design-refresh>최신 목록</button><button type="button" data-design-save-copy>복사본 저장</button>':'<button type="button" data-design-login>로그인하고 이어서 편집</button>'}<a href="#account">마이페이지에서 관리 ↗</a></div></section></div></aside><div class="pd16-live"><div class="creator-canvas"><div class="creator-canvas-toolbar"><div><strong data-design-current>${api.designs.find(d=>d.id===draft.printDesign).name}</strong><span>미리보기</span></div><div class="pd16-preview-actions"><button type="button" data-design-expand>확대 ⤢</button><button type="button" data-design-print>인쇄</button></div></div><div class="creator-paper-stage"><div id="sheet" class="a4">${preview()}</div></div><div class="creator-page-nav pd16-pager">${pager()}</div><div class="creator-canvas-footer"><span>A4 · 210 × 297 mm</span><span>문제 · 정답 · 해설</span></div></div><p class="pd16-status" data-design-status role="status">미리보기에서 확인한 뒤 적용하세요.</p><div class="pd16-finish"><a href="#teacher">돌아가기</a><button type="button" class="primary" data-design-apply>이 디자인 적용</button></div></div></div><div class="pd16-mobile-actions" aria-label="디자인 편집 바로가기"><button type="button" data-design-jump="settings">문구 편집</button><button type="button" data-design-jump="preview">미리보기</button><button type="button" data-design-apply>적용</button></div>${compactFooter()}</section>`;
  }
  function refreshPreview() {
    previewQueued=false;if(!draft || location.hash!=='#print-design')return;
    const sheet=document.getElementById('sheet');if(sheet)sheet.innerHTML=preview();
    const nav=document.querySelector('.pd16-pager');if(nav)nav.innerHTML=pager();
    const label=document.querySelector('[data-design-current]');if(label)label.textContent=api.designs.find(d=>d.id===draft.printDesign).name;
    document.querySelectorAll('[data-design-template]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.designTemplate===draft.printDesign)));
    document.querySelectorAll('[data-design-accent]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.designAccent===draft.printSettings.accent)));
  }
  function schedulePreview(){if(previewQueued)return;previewQueued=true;requestAnimationFrame(refreshPreview);}
  document.addEventListener('ds-print-fonts-ready',schedulePreview);
  function status(text){const el=document.querySelector('[data-design-status]');if(el)el.textContent=text;}
  async function save(asCopy=false) {
    if(saveBusy)return;
    const name=cleanName(profileName);
    if(!name){status('저장할 디자인 이름을 입력해 주세요.');document.querySelector('[data-design-name]')?.focus();return;}
    if(!DSService.session()){status('로그인 후 계정에 저장해 주세요. 입력한 내용은 로그인하는 동안 유지됩니다.');return;}
    const expectedVersion=!asCopy&&profileSource==='cloud'?profileVersion:0;
    const fingerprint=JSON.stringify({profileId,profileSource,name,printDesign:draft.printDesign,printSettings:draft.printSettings,layout:draft.layout,docType:draft.docType,asCopy,expectedVersion});
    if(!saveAttempt||saveAttempt.fingerprint!==fingerprint)saveAttempt={fingerprint,id:expectedVersion?profileId:crypto.randomUUID()};
    const id=saveAttempt.id;
    const editingDraft=draft,item=normalizeProfile({...draft,id,name});saveBusy=true;updateSavedControls();
    try{
      const saved=await DSPrintDesigns.save(item,expectedVersion);
      if(draft!==editingDraft)return;
      profileId=saved.id;profileVersion=saved.version;profileSource='cloud';
      saveAttempt=null;
      status('“'+saved.name+'” 디자인을 계정에 저장했습니다.');
    }catch(e){if(draft===editingDraft)status(DSPrintDesigns.errorText(e));}
    finally{saveBusy=false;updateSavedControls();}
  }
  function openProfile(p,source='cloud') {
    saveAttempt=null;
    ensureDraft();draft={...draft,printDesign:p.printDesign,printSettings:{...p.printSettings},layout:p.layout,docType:p.docType};profileId=p.id;profileName=p.name;profileVersion=p.version||0;profileSource=source;page=0;
    if(location.hash!=='#print-design'){location.hash='#print-design';return;}
    document.getElementById('content').innerHTML=render();status('“'+p.name+'” 디자인을 불러왔습니다.');
  }
  function loadProfile(value) { const [source,id]=value.split(':');const p=(source==='cloud'?DSPrintDesigns.snapshot().items:profiles()).find(p=>p.id===id);if(p)openProfile(p,source); }
  function apply() {
    const next={...studio,source:'practice',printDesign:draft.printDesign,printSettings:api.normalizeSettings(draft.printSettings),layout:draft.layout,docType:draft.docType||'print'};
    const persisted=profileSource==='cloud'?{...next,printSettings:api.normalizeSettings()}:next;
    if(!put('studio-v2',persisted)){status('적용 내용을 저장하지 못했습니다. 브라우저 저장 공간을 확인해 주세요.');return;}
    studio=next;if(profileSource==='cloud')window.DSAccountDesignApplied=true;creatorPage=0;location.hash='#teacher';
  }
  document.addEventListener('input',e=>{
    if(location.hash!=='#print-design'||!draft)return;
    if(e.target.hasAttribute('data-design-name')){profileName=e.target.value;return;}
    const name=e.target.dataset.printSetting;if(!name||e.target.type==='checkbox'||e.target.tagName==='SELECT')return;
    draft.printSettings=api.normalizeSettings({...draft.printSettings,[name]:e.target.value});schedulePreview();
  });
  document.addEventListener('change',e=>{
    if(location.hash!=='#print-design'||!draft)return;
    if(e.target.hasAttribute('data-design-load')){loadProfile(e.target.value);return;}
    const name=e.target.dataset.printSetting;
    if(name)draft.printSettings=api.normalizeSettings({...draft.printSettings,[name]:e.target.type==='checkbox'?e.target.checked:e.target.value});
    if(e.target.hasAttribute('data-design-layout')){draft.layout=e.target.value;page=0;}
    if(e.target.hasAttribute('data-design-doctype')){draft.docType=e.target.value;page=0;}
    schedulePreview();
  });
  document.addEventListener('click',e=>{
    if(location.hash!=='#print-design'||!draft)return;
    const b=e.target.closest('button');if(!b)return;
    if(b.dataset.designTemplate){draft.printDesign=api.normalizeDesign(b.dataset.designTemplate);schedulePreview();}
    if(b.dataset.designAccent){draft.printSettings=api.normalizeSettings({...draft.printSettings,accent:b.dataset.designAccent});schedulePreview();}
    if(b.dataset.designPage!==undefined){page=Number(b.dataset.designPage)||0;refreshPreview();}
    if(b.hasAttribute('data-design-save'))save();
    if(b.hasAttribute('data-design-save-copy'))save(true);
    if(b.hasAttribute('data-design-login')){resumeAfterLogin=true;window.DSLoginReturn='#print-design';location.hash='#login';}
    if(b.hasAttribute('data-design-refresh'))DSPrintDesigns.list(true);
    if(b.hasAttribute('data-design-apply'))apply();
    if(b.hasAttribute('data-design-print'))api.printConfig(api.config(draft));
    if(b.dataset.designJump){document.querySelector(b.dataset.designJump==='settings'?'.pd16-setting-content':'.pd16-live')?.scrollIntoView({block:'start',behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});}
    if(b.hasAttribute('data-design-expand')){const target=document.getElementById('paper-expanded');target.className='a4';target.innerHTML=preview();document.getElementById('paper-title').textContent='내 프린트 미리보기';document.getElementById('paper-dialog').showModal();}
  });
  window.addEventListener('hashchange',()=>{if(location.hash==='#print-design')resumeAfterLogin=false;else if(!(resumeAfterLogin&&location.hash==='#login')){draft=null;page=0;profileId='';profileName='';profileSource='';profileVersion=0;resumeAfterLogin=false;}});
  document.addEventListener('ds-print-fonts-ready',schedulePreview);
  window.addEventListener('ds-designs-change',updateSavedControls);
  window.addEventListener('ds-session-change',()=>{saveAttempt=null;if(window.DSAccountDesignApplied){studio.printSettings=api.normalizeSettings();window.DSAccountDesignApplied=false;}if(profileSource==='cloud'){draft=null;profileId='';profileName='';profileSource='';profileVersion=0;if(location.hash==='#print-design')document.getElementById('content').innerHTML=render();}});
  const resize=new ResizeObserver(entries=>entries.forEach(({target})=>target.style.setProperty('--pd16-thumb-scale',String(target.clientWidth/(210*96/25.4)))));
  const observed=new Set();
  function observeThumbs(){for(const el of observed)if(!el.isConnected){resize.unobserve(el);observed.delete(el);}document.querySelectorAll('.pd16-thumb').forEach(el=>{if(observed.has(el))return;observed.add(el);resize.observe(el);});}
  document.addEventListener('DOMContentLoaded',()=>{new MutationObserver(observeThumbs).observe(document.getElementById('content'),{childList:true,subtree:true});observeThumbs();});
  window.PrintDesignEditorV16={render,normalizeProfile,openProfile,updateSavedControls};
})();
function printDesignPage(){return window.PrintDesignEditorV16.render();}

/* Member designs live in the authenticated service, never an unscoped browser cache. */
(() => {
  'use strict';
  let state={phase:'idle',items:[],error:''}, epoch=0, revision=0, pending=null, writing=false;
  const signal=()=>window.dispatchEvent(new Event('ds-designs-change'));
  const snapshot=()=>({...state,items:state.items.map(p=>({...p,printSettings:{...p.printSettings}})),busy:writing});
  const fail=code=>Object.assign(new Error(code),{code});
  const text=error=>({unauthorized:'로그인 후 내 디자인을 불러올 수 있습니다.',session_changed:'계정이 변경되었습니다. 다시 로그인해 주세요.',conflict:'다른 화면에서 수정된 디자인입니다. 최신 디자인을 불러오거나 복사본으로 저장해 주세요.',quota:'디자인은 100개까지 저장할 수 있습니다. 사용하지 않는 디자인을 정리해 주세요.',unavailable:'계정 저장에 연결하지 못했습니다. 입력한 내용은 이 화면에 남아 있으니 다시 시도해 주세요.',busy:'저장 중입니다. 잠시 기다려 주세요.',invalid:'디자인 이름과 입력 내용을 확인해 주세요.',not_found:'디자인이 삭제되었거나 더 이상 사용할 수 없습니다.'})[error?.message]||'연결하지 못했습니다. 입력한 내용은 남아 있으니 다시 시도해 주세요.';
  const normalize=p=>{
    const d=window.PrintDesignEditorV16.normalizeProfile(p);
    return d&&/^[a-f0-9]{8}-(?:[a-f0-9]{4}-){3}[a-f0-9]{12}$/i.test(d.id)&&Number.isSafeInteger(p.version)&&p.version>0?{...d,version:p.version,updatedAt:typeof p.updatedAt==='string'?p.updatedAt:''}:null;
  };
  async function request(body){
    try{return await DSService.request('/print-designs',body)}
    catch(e){console.warn('Design service response',e.status,['unavailable','route_rejected','NOT_FOUND','connection_failed','invalid_response'].includes(e.message)?e.message:'request_failed');if([502,503].includes(e.status)||['NOT_FOUND','not_deployed','route_rejected'].includes(e.message))throw fail('unavailable');throw e}
  }
  function reset(){epoch++;revision++;pending=null;writing=false;state={phase:DSService.session()?'idle':'signed-out',items:[],error:''};signal()}
  async function list(force=false){
    await DSService.ready;
    if(!DSService.session()){if(state.phase!=='signed-out')reset();return []}
    if(pending)return pending;
    if(writing||(!force&&state.phase==='ready'))return snapshot().items;
    const ticket=epoch, startedRevision=revision;state={...state,phase:'loading',error:''};signal();
    const task=(async()=>{
      try{
        const result=await request({action:'list'});
        if(ticket!==epoch||startedRevision!==revision)return [];
        if(!Array.isArray(result.designs))throw fail('invalid_response');
        const items=result.designs.map(normalize);if(items.some(p=>!p))throw fail('invalid_response');
        state={phase:'ready',items,error:''};return snapshot().items;
      }catch(e){if(ticket===epoch&&startedRevision===revision)state={...state,phase:DSService.session()?'error':'signed-out',error:text(e),items:DSService.session()?state.items:[]};return []}
      finally{if(ticket===epoch){pending=null;signal()}}
    })();pending=task;return task;
  }
  async function mutate(body){
    await DSService.ready;if(!DSService.session())throw fail('unauthorized');if(writing)throw fail('busy');
    const ticket=epoch;writing=true;revision++;signal();
    try{const data=await request(body);if(ticket!==epoch||!DSService.session())throw fail('session_changed');return data}
    finally{if(ticket===epoch){writing=false;signal()}}
  }
  async function save(design,expectedVersion=0){
    const ticket=epoch;
    const input=window.PrintDesignEditorV16.normalizeProfile(design);if(!input)throw fail('invalid');
    const payload={id:input.id||crypto.randomUUID(),name:input.name,printDesign:input.printDesign,printSettings:input.printSettings,layout:input.layout,docType:input.docType};
    const data=await mutate({action:'save',design:payload,expectedVersion});
    if(ticket!==epoch)throw fail('session_changed');
    const saved=normalize(data.design);if(!saved)throw fail('invalid_response');
    state={phase:'ready',items:[saved,...state.items.filter(p=>p.id!==saved.id)],error:''};signal();return saved;
  }
  async function remove(design){
    const ticket=epoch;
    await mutate({action:'delete',id:design.id,expectedVersion:design.version});
    if(ticket!==epoch)throw fail('session_changed');
    state={...state,items:state.items.filter(p=>p.id!==design.id)};signal();
  }
  window.DSPrintDesigns={snapshot,list,save,remove,reset,errorText:text};
  window.addEventListener('ds-session-change',reset);
  window.addEventListener('storage',e=>{if(e.key==='ds_tk'||e.key==='ds_logout_epoch')reset()});
})();

(() => {
  'use strict';
  const store=window.DSPrintDesigns;
  const templates=()=>window.PrintComposerV14.designs;
  let appliedAccountDesign=false, appliedDesignId='';
  const quickMarkup = new WeakMap();
  const accountMarkup = new WeakMap();
  function render(){
    const s=store.snapshot();
    const top=`<div class="pd17-library-top"><p>수업에 맞춰 둔 지면을 꺼내 쓰세요.</p><div><a href="#print-design" class="secondary">새 디자인</a>${DSService.session()?'<button type="button" data-cloud-refresh>새로고침</button>':''}</div></div>`;
    if(!DSService.session())return top+'<div class="pd17-empty"><strong>내 디자인, 어느 컴퓨터에서나.</strong><p>로그인하면 계정에 저장한 디자인을 불러올 수 있습니다.</p><a class="primary" href="#login">로그인</a></div>';
    const notice=s.phase==='loading'?'<p class="pd17-sync" role="status">디자인 불러오는 중…</p>':s.error?`<p class="pd17-sync pd17-error" role="alert">${esc(s.error)}</p>`:'';
    const cards=s.items.map(p=>{
      const name=templates().find(d=>d.id===p.printDesign)?.name||'기본형',d=new Date(p.updatedAt),date=Number.isNaN(d.valueOf())?'':d.toLocaleDateString('ko-KR');
      return `<article class="pd17-card"><div class="pd17-paper-mark" data-template="${p.printDesign}" aria-hidden="true"><b>${esc(p.printSettings.academyName||'DELTASKILL')}</b><span>${esc(p.name)}</span><i></i><i></i><i></i></div><div class="pd17-card-body"><span class="pd17-card-type">${name} · ${p.layout}문항</span><h3>${esc(p.name)}</h3><p>${esc(p.printSettings.academyName||p.printSettings.teacherName||'나의 수업 지면')}</p><small>${date?'수정 '+date:''}</small><div class="pd17-card-actions"><button type="button" data-cloud-use="${esc(p.id)}" class="primary">프린트에 적용</button><button type="button" data-cloud-open="${esc(p.id)}">수정</button><button type="button" data-cloud-delete="${esc(p.id)}" aria-label="${esc(p.name)} 디자인 삭제"${s.busy?' disabled':''}>삭제</button></div></div></article>`;
    }).join('');
    return top+notice+(cards?`<div class="pd17-design-grid">${cards}</div>`:s.phase==='ready'?'<div class="pd17-empty"><strong>아직 저장한 디자인이 없습니다.</strong><p>7가지 지면 중 하나를 골라 이름을 넣어 보세요.</p><a href="#print-design" class="primary">디자인 만들기</a></div>':'');
  }
  function update(){
    // hashchange listeners may run before route() replaces the previous page.
    // Never mutate an old account slot while the new hash points at teacher.
    if(location.hash==='#account'){
      const slot=document.querySelector('[data-account-designs]');
      if(slot){const content=render();if(accountMarkup.get(slot)!==content){accountMarkup.set(slot,content);slot.innerHTML=content;}}
    }
    if(location.hash==='#print-design')window.PrintDesignEditorV16?.updateSavedControls();
    const canvas=document.querySelector('.creator-canvas');
    if(!canvas||!['#teacher','#studio'].includes(location.hash)||studio.source!=='practice')return;
    let field=canvas.querySelector('.pd17-quick');
    if(!field){field=document.createElement('div');field.className='pd17-quick';canvas.querySelector('.creator-canvas-toolbar').after(field);}
    const s=store.snapshot(),content=DSService.session()?`<label>내 디자인<select data-cloud-quick aria-label="계정에 저장한 디자인 적용"><option value="">저장한 디자인을 선택하세요</option>${s.items.map(p=>`<option value="${esc(p.id)}"${appliedDesignId===p.id?' selected':''}>${esc(p.name)}</option>`).join('')}</select></label><a href="#account">관리 ↗</a>${s.error?`<span class="pd17-error">${esc(s.error)} <button type="button" data-cloud-refresh>다시 연결</button></span>`:s.phase==='loading'?'<span role="status">불러오는 중…</span>':''}`:'<span>내 계정의 디자인으로 만들기</span><a href="#login">로그인 ↗</a>';
    if(quickMarkup.get(field)!==content){quickMarkup.set(field,content);field.innerHTML=content;}
  }
  function apply(p){
    const next={...studio,source:'practice',printDesign:p.printDesign,printSettings:{...p.printSettings},layout:p.layout,docType:p.docType};
    if(!put('studio-v2',{...next,printSettings:PrintComposerV14.normalizeSettings()})){toast('브라우저 저장 공간을 확인해 주세요.');return;}
    studio=next;appliedAccountDesign=true;appliedDesignId=p.id;window.DSAccountDesignApplied=true;creatorPage=0;
    if(['#teacher','#studio'].includes(location.hash))route();else location.hash='#teacher';
    toast('“'+p.name+'” 디자인을 적용했습니다.');
  }
  function activate(){if(['#account','#print-design','#teacher','#studio'].includes(location.hash)){store.list();update();}}
  document.addEventListener('click',async e=>{
    const b=e.target.closest('[data-cloud-refresh],[data-cloud-open],[data-cloud-use],[data-cloud-delete]');if(!b)return;
    if(b.hasAttribute('data-cloud-refresh')){store.list(true);return;}
    const id=b.dataset.cloudOpen||b.dataset.cloudUse||b.dataset.cloudDelete,p=store.snapshot().items.find(p=>p.id===id);if(!p)return;
    if(b.dataset.cloudOpen){PrintDesignEditorV16.openProfile(p);return;}
    if(b.dataset.cloudUse){apply(p);return;}
    if(b.dataset.cloudDelete&&confirm('“'+p.name+'” 디자인을 내 디자인 목록에서 삭제할까요?')){
      b.disabled=true;try{await store.remove(p);toast('디자인을 삭제했습니다.')}catch(e){toast(store.errorText(e));await store.list(true);}finally{if(b.isConnected)b.disabled=false;}
    }
  });
  document.addEventListener('change',e=>{if(e.target.hasAttribute('data-cloud-quick')){const p=store.snapshot().items.find(p=>p.id===e.target.value);if(p)apply(p);}});
  window.addEventListener('ds-designs-change',update);
  window.addEventListener('ds-session-ready',activate);
  window.addEventListener('ds-session-change',()=>{
    appliedDesignId='';
    if(appliedAccountDesign){studio.printSettings=PrintComposerV14.normalizeSettings();appliedAccountDesign=false;}
    activate();
  });
  window.addEventListener('hashchange',activate);
  let queued=false;
  const start=()=>{
    const content=document.getElementById('content');if(!content)return;
    new MutationObserver(records=>{
      if(queued||!['#teacher','#studio'].includes(location.hash)||studio.source!=='practice')return;
      const canvas=content.querySelector('.creator-canvas');if(!canvas)return;
      if(!records.some(record=>record.target===content||canvas.contains(record.target)||Array.from(record.addedNodes).some(node=>node===canvas||node.contains?.(canvas))))return;
      queued=true;queueMicrotask(()=>{queued=false;if(['#teacher','#studio'].includes(location.hash)&&content.querySelector('.creator-canvas'))update();});
    }).observe(content,{childList:true,subtree:true});activate();
  };
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
  window.PrintDesignAccountV17={render,apply};
})();

let cinemaIndex=0,cinemaTimer=null,cinemaPaused=false;
function home(){return `<section class="cinema" data-scene="0"><div class="cinema-portrait" role="img" aria-label="선택한 1번 모델의 학습 이미지"></div><div class="cinema-wash"></div><div id="cinema-product"></div><div class="cinema-copy"><span id="cinema-label"></span><h1 id="cinema-title">수학,<br>여기 다 있다.</h1></div><div class="cinema-controls"><div class="cinema-dots" aria-label="배경 장면">${['브랜드','내신 변형자료','타임어택'].map((n,i)=>`<button aria-label="${n}" data-cinema="${i}" aria-pressed="${i===0}"><span></span></button>`).join('')}</div><button data-cinema-pause aria-label="배경 일시정지">Ⅱ</button><button data-replay aria-label="로고 다시 보기" class="cinema-replay">↻</button></div></section>`}
function showCinema(i){cinemaIndex=i;const stage=$('.cinema');if(!stage)return;stage.dataset.scene=i;$('#cinema-product').innerHTML=cinemaScreen(i);$('#cinema-title').innerHTML=['수학,<br>여기 다 있다.','내신 변형자료','타임어택'][i];$('#cinema-label').textContent=['','학교 부교재 · 기출 변형','시험 시간도 연습하자'][i];document.querySelectorAll('[data-cinema]').forEach(b=>b.setAttribute('aria-pressed',Number(b.dataset.cinema)===i))}
function playCinema(){clearTimeout(cinemaTimer);if(cinemaPaused||matchMedia('(prefers-reduced-motion: reduce)').matches)return;cinemaTimer=setTimeout(()=>{showCinema((cinemaIndex+1)%3);playCinema()},cinemaIndex===0?11000:10000)}
function intro(){clearTimeout(cinemaTimer);if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;const el=$('#intro');el.hidden=false;el.style.opacity='1';$('#header').inert=true;$('#content').inert=true;$('#dock').inert=true;$('.intro-word').style.animation='none';void el.offsetWidth;$('.intro-word').style.animation='';clearTimeout(intro.t);intro.t=setTimeout(closeIntro,4100);$('#skip-intro').focus()}
function closeIntro(){clearTimeout(intro.t);$('#intro').hidden=true;$('#header').inert=false;$('#content').inert=false;$('#dock').inert=false;if($('.cinema')){showCinema(0);playCinema()}$('#content').focus({preventScroll:true})}
function cinemaScreen(index){
 if(index===0)return '';
 const q=index===1?regularBank[0]:timerBank[0];
 if(index===1)return `<div class="cinema-tablet"><div class="cinema-screen"><div class="screen-brand">DELTASKILL <span>내신 대비</span></div><div class="screen-content"><div class="screen-breadcrumb">미적분Ⅰ / 정적분</div><h2>정적분과 넓이</h2><div class="screen-tabs"><span class="selected">기초</span><span>기본</span><span>도전</span></div><div class="screen-paper"><span class="q-no">01</span><div class="hero-question">${q.question}</div><div class="hero-options">${q.options.map((o,i)=>`<span>${['①','②','③','④','⑤'][i]} ${math(o)}</span>`).join('')}</div></div><div class="screen-action"><span>문항 · 정답 · 해설</span><span>풀이 확인 →</span></div></div></div></div>`;
 return `<div class="cinema-tablet time-tablet"><div class="cinema-screen"><div class="screen-brand">DELTASKILL <span>타임어택</span></div><div class="screen-content"><div class="screen-breadcrumb">정적분 / 6문항</div><div class="cinema-clock">05<span>:</span>42</div><div class="time-track"><i></i></div><div class="time-questions"><span class="current">1</span><span>2</span><span>3</span><span>4</span><span>5</span><span>6</span></div><div class="screen-paper time-paper"><span class="q-no">01</span><div class="hero-question">${q.question}</div><div class="screen-answers"><span>남은 문항 6</span><span class="answer-check">답 확인</span></div></div></div></div></div>`;
}
function route(){
 let page=location.hash.slice(1)||'home';if(page==='content')return;
 if(page.startsWith('material/')){try{detailSku=decodeURIComponent(page.slice(9))}catch{detailSku=''}detailPage=0;page='material'}
 let recordId='';if(page.startsWith('record/')){try{recordId=decodeURIComponent(page.slice(7))}catch{}recordState.id=recordId;page='record'}
 const views={home,student,teacher,'print-design':printDesignPage,studio:teacher,library:libraryPage,'school-exams':window.DSSchoolExamLibraryV26?.page,material:materialPage,progress,timed:timedPage,improve,login:loginPage,account:accountPage,'account-settings':settingsPage,'account-password':passwordPage,record:recordPage,benefits:benefitsPage,csat:csatPage,classroom:classroomPage,diagnostic:diagnosticSetup,'diagnostic-run':diagnosticRun,'diagnostic-result':diagnosticResult,help:helpPage,'not-found':notFoundPage};
 if(page!=='practice'&&!views[page])page='not-found';clearTimeout(cinemaTimer);
 if(page!=='practice'){clearInterval(clock);timed=false}
 if(['teacher','studio','classroom','print-design'].includes(page))role='teacher';if(['student','practice','progress','timed','diagnostic','diagnostic-run','diagnostic-result'].includes(page))role='student';put('role',role);
 if(page==='practice'){if(ended){ended=false;questionIndex=0;selected='';checked=false;hintUsed=false;sessionResults=[];timed=false;qbank=regularBank}renderPractice()}
 else{header(page);$('#content').innerHTML=views[page]()}
 if(page==='home'){cinemaIndex=0;playCinema()}
 if(['diagnostic','diagnostic-run'].includes(page))renderDiagnostic();else clearInterval(diagnosticClock);
 if(['account','account-settings'].includes(page))loadAccount();if(page==='record'){if(!learningState.available)loadAccount();loadRecord(recordId)}
 window.scrollTo(0,0);$('#content').focus({preventScroll:true});
}
document.addEventListener('click',async e=>{
 const ar=e.target.closest('[data-account-role]');if(ar){e.preventDefault();role=ar.dataset.accountRole==='teacher'?'teacher':'student';put('role',role);refreshAccount();return}
 const entry=e.target.closest('[data-entry]');if(entry){studentTab=cinemaIndex===2?'timed':'study';quickSelected='';quickHelp=false}
 const b=e.target.closest('button');if(!b)return;
 if(b.dataset.studyTab){studentTab=b.dataset.studyTab;$('#content').innerHTML=student();return}
 if(b.hasAttribute('data-quick-hint')){quickHelp=!quickHelp;const el=$('.quick-hint');if(el)el.hidden=!quickHelp;return}
 if(b.hasAttribute('data-quick-check')&&quickSelected!==''){const answer=quickSelected,help=quickHelp,q=selectedStudyQuestion();start('normal',[q]);selected=answer;hintUsed=help;checked=true;record();renderPractice();return}
 if(b.dataset.cinema!==undefined){showCinema(Number(b.dataset.cinema));playCinema();return}
 if(b.hasAttribute('data-cinema-pause')){cinemaPaused=!cinemaPaused;b.textContent=cinemaPaused?'▶':'Ⅱ';b.setAttribute('aria-label',cinemaPaused?'배경 재생':'배경 일시정지');playCinema();return}
 if(b.hasAttribute('data-replay')){intro();return}if(b.id==='skip-intro'){closeIntro();return}
 if(b.dataset.start){start(b.dataset.start);return}
 if(b.hasAttribute('data-hint')){hintUsed=true;$('#hint').hidden=false;return}
 if(b.hasAttribute('data-check')&&!checked&&selected!==''){checked=true;record();renderPractice();return}
 if(b.hasAttribute('data-next')||b.hasAttribute('data-skip')){if(b.hasAttribute('data-skip'))record(true);const next=pendingIndex();if(next>=0){questionIndex=next;selected='';checked=false;hintUsed=false;renderPractice()}else finish();return}
 if(b.hasAttribute('data-finish')){finish();return}
 if(b.hasAttribute('data-review')){const last=get('results-v2',[]).at(-1),ids=last?.questions.filter(q=>!q.correct).map(q=>q.id)||[],all=regularBank.concat(timerBank),review=ids.map(id=>all.find(q=>q.id===id)).filter(Boolean);if(!review.length){toast('틀린 문항이 없습니다. 새로 공부해 보세요.');return}start('review',review);return}
 if(b.dataset.layout){studio.layout=b.dataset.layout;put('studio-v2',studio);$('#content').innerHTML=teacher();return}
 if(b.dataset.gradeScale){unitDiagnostics.scale=b.dataset.gradeScale;refreshAccount();document.getElementById('account-units')?.scrollIntoView({block:'start'});return}
 if(b.dataset.diagnostic){startDiagnostic(b.dataset.diagnostic,b.dataset.diagnosticUnit);return}
 if(b.dataset.diagnosticResult){diagnosticState.lastId=b.dataset.diagnosticResult;location.hash='#diagnostic-result';return}
 if(b.dataset.diagnosticType){diagnosticState.type=b.dataset.diagnosticType;renderDiagnostic();return}
 if(b.hasAttribute('data-diagnostic-begin')){beginDiagnostic();return}
 if(b.hasAttribute('data-diagnostic-resume')){location.hash='#diagnostic-run';return}
 if(b.hasAttribute('data-diagnostic-discard')){clearInterval(diagnosticClock);diagnosticState.active=null;persistDiagnostic();renderDiagnostic();return}
 if(b.dataset.diagnosticIndex!==undefined||b.hasAttribute('data-diagnostic-prev')||b.hasAttribute('data-diagnostic-next')){const a=diagnosticState.active;if(!a)return;const index=b.dataset.diagnosticIndex!==undefined?Number(b.dataset.diagnosticIndex):a.index+(b.hasAttribute('data-diagnostic-prev')?-1:1);if(Number.isInteger(index)&&index>=0&&index<a.questionIds.length){a.index=index;diagnosticState.confirm=false;persistDiagnostic();renderDiagnostic()}return}
 if(b.hasAttribute('data-diagnostic-confirm')||b.hasAttribute('data-diagnostic-cancel')){diagnosticState.confirm=b.hasAttribute('data-diagnostic-confirm');renderDiagnostic();document.querySelector('.diagnostic-confirm')?.scrollIntoView({block:'nearest'});return}
 if(b.hasAttribute('data-diagnostic-submit')){completeDiagnostic();return}
 if(b.dataset.diagnosticRemove){put('diagnostics-v1',localDiagnosticAttempts().filter(r=>r.id!==b.dataset.diagnosticRemove));diagnosticState.lastId='';location.hash='#account';return}
 if(b.hasAttribute('data-diagnostic-review')){const r=localDiagnosticAttempts().find(v=>v.id===diagnosticState.lastId)||localDiagnosticAttempts().at(-1);const qs=(r?.questions||[]).filter(q=>!q.correct).map(q=>diagnosticBank.find(v=>v.id===q.id)).filter(Boolean);if(qs.length)start('review',qs);return}
 if(b.dataset.classAction){classAction(b);return}
 if(b.dataset.creatorPage!==undefined){creatorPage=Number(b.dataset.creatorPage);$('#content').innerHTML=teacher();return}
 if(b.dataset.pdfPage!==undefined){detailPage=Number(b.dataset.pdfPage);$('#content').innerHTML=materialPage();return}
 if(b.dataset.makerSource){studio.source=b.dataset.makerSource;put('studio-v2',studio);$('#content').innerHTML=teacher();return}
 if(b.hasAttribute('data-preview-paper')){showPaper();return}if(b.hasAttribute('data-close-paper')){$('#paper-dialog').close();return}
 if(b.hasAttribute('data-print')){printSheet();return}
 if(b.hasAttribute('data-save-studio')){const list=get('saved-v2',[]),d=currentMaterial();list.push({...studio,printSettings:window.DSAccountDesignApplied?PrintComposerV14.normalizeSettings():studio.printSettings,unit:studio.source==='practice'?'정적분':d.unit,subject:studio.source==='practice'?'미적분Ⅰ':d.subject});const ok=put('saved-v2',list.slice(-20));put('studio-v2',studio);toast(ok?'구성을 저장했습니다.':'구성을 저장하지 못했습니다.');if(ok)$('#content').innerHTML=teacher();return}
 if(b.dataset.reuse!==undefined){const v=get('saved-v2',[])[Number(b.dataset.reuse)];if(v){studio={...v};put('studio-v2',studio);if(['#teacher','#studio'].includes(location.hash)){$('#content').innerHTML=teacher();window.scrollTo(0,0)}else location.hash='#teacher'}return}
 if(b.dataset.subject){library.subject=b.dataset.subject;document.querySelectorAll('[data-subject]').forEach(el=>el.setAttribute('aria-pressed',el===b));$('#library-results').innerHTML=libraryResults();return}
 if(b.hasAttribute('data-reset-library')){library={subject:'전체',term:''};$('#content').innerHTML=libraryPage();return}
 if(b.hasAttribute('data-pdf-next')||b.hasAttribute('data-pdf-prev')){const d=catalog.find(v=>v.sku===detailSku);detailPage=Math.max(0,Math.min(d.previewPages.length-1,detailPage+(b.hasAttribute('data-pdf-next')?1:-1)));$('#content').innerHTML=materialPage();return}
 if(b.dataset.useMaterial){studio.sku=b.dataset.useMaterial;studio.source='materials';put('studio-v2',studio);location.hash='#teacher';return}
 if(b.dataset.accountSection){const section=document.getElementById(b.getAttribute('aria-controls'));section?.focus({preventScroll:true});section?.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});return}
 if(b.dataset.accountAction==='logout'){clearMemberView();await DSService.logout();location.hash='#login';route();return}
 if(b.dataset.accountAction==='toggle-password'){const field=$('#account-password');if(field){const show=field.type==='password';field.type=show?'text':'password';b.setAttribute('aria-pressed',String(show));b.textContent=show?'숨기기':'보기'}return}
 if(b.dataset.accountAction==='retry'){if(b.dataset.retryTarget==='units')loadUnitDiagnostics();else loadAccount();return}
 if(b.dataset.accountAction==='record'){location.hash='#record/'+encodeURIComponent(b.dataset.recordId);return}
 if(b.dataset.accountAction==='retry-record'){loadRecord(recordState.id);return}
 if(b.hasAttribute('data-record-filter')){recordState.onlyWrong=!recordState.onlyWrong;renderRecord();return}
 if(b.dataset.accountAction==='download'){if(b.disabled)return;b.disabled=true;await downloadOwned(b.dataset.fileId);if(b.isConnected)b.disabled=false;return}
 if(b.dataset.feedback!==undefined){feedbackContext=b.dataset.feedback;$('#feedback-context').textContent=feedbackContext;$('#feedback').showModal();return}
 if(b.hasAttribute('data-close'))$('#feedback').close();
});
document.addEventListener('change',e=>{
 if(e.target.hasAttribute('data-class-switch')){selectClassroom(e.target.value);return}
 if(e.target.hasAttribute('data-class-round')){classroomState.round=e.target.value;refreshClassroom();return}
 if(e.target.hasAttribute('data-diagnostic-unit')){unitDiagnostics.selectedUnit=e.target.value;refreshAccount();document.getElementById('account-units')?.scrollIntoView({block:'start'});return}
 if(e.target.name==='diagnostic-answer'){const a=diagnosticState.active;if(!a)return;if(a.type==='timed'&&Date.now()>=a.deadline){completeDiagnostic('timeout');return}const value=Number(e.target.value);a.answers[a.questionIds[a.index]]=value;persistDiagnostic();renderDiagnostic();document.querySelector('input[name="diagnostic-answer"][value="'+value+'"]')?.focus({preventScroll:true});return}
 if(e.target.id==='study-unit'||e.target.id==='study-question'){if(e.target.id==='study-unit'){studyPick.unit=e.target.value;studyPick.id=selectedStudyUnit().questions[0].id}else studyPick.id=e.target.value;put('question-selection',studyPick);quickSelected='';quickHelp=false;$('#content').innerHTML=student();document.getElementById(e.target.id)?.focus({preventScroll:true});return}
 if(e.target.name==='quickanswer'){quickSelected=e.target.value;const b=$('[data-quick-check]');if(b)b.disabled=false}
 if(e.target.name==='answer'){selected=e.target.value;const b=$('[data-check]');if(b)b.disabled=false}
 if(e.target.dataset.studio){studio[e.target.dataset.studio]=e.target.value;put('studio-v2',studio);if(['sku','studyUnit','count','docType'].includes(e.target.dataset.studio))$('#content').innerHTML=teacher();else updateSheet()}
});
document.addEventListener('input',e=>{if(e.target.id==='lib-term'){library.term=e.target.value;$('#library-results').innerHTML=libraryResults()}});
document.addEventListener('submit',e=>{if(e.target.id==='class-lesson-form'){e.preventDefault();saveClassLesson(e.target)}});
document.addEventListener('submit',async e=>{if(e.target.id==='classroom-form'){e.preventDefault();previewClassList(e.target);return}if(e.target.id==='password-form'){e.preventDefault();await submitPassword(e.target);return}if(e.target.id!=='login-form')return;e.preventDefault();if(loginState.busy)return;const fd=new FormData(e.target),phone=String(fd.get('phone')||'').replace(/\D/g,''),pin=String(fd.get('pin')||'');if(phone.length<10||phone.length>11||!pin){loginState.error='번호와 비밀번호를 확인해 주세요.';$('#content').innerHTML=loginPage();return}loginState={phone,error:'',busy:true};$('#content').innerHTML=loginPage();try{await DSService.login(phone,pin);loginState.busy=false;const next=window.DSLoginReturn;window.DSLoginReturn='';location.hash=['#print-design','#teacher'].includes(next)?next:'#account'}catch(error){loginState.busy=false;loginState.error=DSService.errorText(error);$('#content').innerHTML=loginPage()}});
$('#feedback-form').addEventListener('submit',e=>{e.preventDefault();const fd=new FormData(e.target),message=String(fd.get('message')).trim();if(!message)return;const items=get('feedback',[]);items.push({kind:fd.get('kind'),message,context:feedbackContext});if(!put('feedback',items.slice(-30))){toast('이 기기에 저장할 수 없습니다.');return}$('#feedback').close();e.target.reset();toast('이 시안에 저장했습니다. 운영팀에는 전송되지 않습니다.');if(location.hash==='#improve')route()});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!$('#intro').hidden)closeIntro()});
document.addEventListener('visibilitychange',()=>{if(!document.hidden){if(timed&&!ended)tick();if(diagnosticState.active?.type==='timed'&&location.hash==='#diagnostic-run')tickDiagnostic()}});
window.addEventListener('storage',e=>{if(e.key==='ds_tk'||e.key==='ds_logout_epoch'){clearMemberView();if(['#account','#account-settings'].includes(location.hash))route()}});
window.addEventListener('ds-session-ready',()=>{header(location.hash.slice(1)||'home');if(['#account','#account-settings'].includes(location.hash))loadAccount();if(location.hash.startsWith('#record/')){loadAccount();loadRecord(recordState.id)}});
window.addEventListener('ds-session-change',()=>{if(!DSService.session()){clearMemberView();refreshAccount();if(location.hash.startsWith('#record/'))renderRecord();header(location.hash.slice(1)||'home')}});
window.addEventListener('hashchange',route);route();
try{if((!location.hash||location.hash==='#home')&&!sessionStorage.getItem('ds-next-intro')){sessionStorage.setItem('ds-next-intro','1');intro()}}catch{}
