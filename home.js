const one = selector => document.querySelector(selector);
const roles = {
  visitor: {title:'등급을 올리는<br><em>델타스킬.</em>', desc:'학생은 막힌 조건을 찾아 다시 풀고, 선생님과 학원은 수업에 맞는 교재를 만듭니다. 내신부터 수능까지, 델타스킬 AI와 함께하세요.', work:'델타스킬 기능 소개', enter:'단원별 공부 열기'},
  student: {title:'등급을 올리는<br><em>델타스킬.</em>', desc:'내 풀이가 어디서 막히는지 찾아요. 델타스킬 AI가 어려운 부분을 콕 집어, 나에게 맞는 문제로 다시 연습할 수 있게 도와줘요.', work:'델타스킬 기능 소개', enter:'단원별 공부 열기'},
  teacher: {title:'수업 자료부터<br><em>학생별 맞춤 수업까지.</em>', desc:'수업과 반별 진도에 맞춰 단원과 문항 수를 고르세요. 한 쪽 2문항 또는 4문항으로 구성하고, 문제와 해설을 받아 수업에 활용하세요.', work:'수업 교재 구성', enter:'이 교재 구성하기'},
  academy: {title:'반별 교재와<br><em>학생별 맞춤 수업.</em>', desc:'반별 진도에 맞춰 단원과 문항 수를 정하세요. 수업용 교재를 미리 보고, 반에 나눠 줄 PDF를 받을 수 있어요.', work:'학원 교재 구성', enter:'우리 반 교재 구성하기'}
};
const journey=one('#journey'), stage=one('.stage'), canvas=one('.canvas'), intro=one('.intro'), tablet=one('.tablet'),screenFrame=one('#screen');
const compact=matchMedia('(max-width:760px), (min-width:761px) and (max-width:1024px) and (orientation:portrait)'), reduced=matchMedia('(prefers-reduced-motion: reduce)');
const params=new URLSearchParams(location.search);
let role=params.get('audience')==='academy'?'teacher':Object.hasOwn(roles,params.get('audience'))?params.get('audience'):'visitor';
if(params.get('audience')==='academy'){const u=new URL(location.href);u.searchParams.set('audience','teacher');history.replaceState(null,'',u)}
let exam=params.get('exam')==='csat'?'csat':'school';
const legacyTeacher=['#teacher-film','#lessonPreview'].includes(location.hash);
if(legacyTeacher)role='teacher';
const studyUrl=(anchor='hub')=>'study/index.html?exam='+exam+'#'+anchor;
const materialsUrl=(target=exam)=>'materials/index.html?'+new URLSearchParams({exam:target,audience:role});
let scheduled=false;
function showsServiceTour(){return role==='visitor'||role==='student'}

function setFilmLink() {
  const link = one('#filmStudy');
  link.href = showsServiceTour() ? studyUrl() : educatorDestination(role, exam);
  link.querySelector('span').textContent = showsServiceTour() ? '단원별 공부 열기 ↗' : '공개 문항 지면 보기 ↗';
}

function distance(){return Math.max(1,journey.offsetHeight-stage.offsetHeight)}
function paint(){
  scheduled=false;
  const t=Math.min(1,Math.max(0,-journey.getBoundingClientRect().top/distance()));
  window.dispatchEvent(new CustomEvent('delta-journey',{detail:t}));
}
function layoutStage(){
  if(document.body.classList.contains("live-home"))return;
  drawTabletScene(canvas,compact.matches?intro.offsetHeight+12:0,compact.matches);
  schedule();
}
function showReading(active){
  stage.classList.toggle('active',active);
  stage.classList.toggle('intro-shot',!active);
  screenFrame.inert=!active;
  one('#motionHint').textContent=active?'아래로 스크롤하면 기능별 소개로 이어집니다':'아래로 스크롤해 둘러보기';
}
function schedule(){if(!scheduled){scheduled=true;requestAnimationFrame(paint)}}
function move(end,animated=true){
  const y=window.scrollY+journey.getBoundingClientRect().top+(end?distance():0);
  window.scrollTo({top:Math.ceil(y),behavior:animated&&!reduced.matches?'smooth':'instant'});
}
function connectStudyScenes() {
  const section = one('[data-chapter="levels"]');
  section.querySelector('.chapterLink').href = 'study/index.html?exam='+exam+'&item=middle#practice';
  for (const link of section.querySelectorAll('[data-level]')) link.href = 'study/index.html?exam='+exam+'&item='+link.dataset.level+'#practice';
}
function educatorDestination(audience, exam) {
  return 'assets/sample-picker.html?' + new URLSearchParams({exam, audience});
}
function setScreen(remember){
  connectStudyScenes();
  document.body.dataset.audience=role;
  const item=roles[role],student=role==='student';
  const common=role==='visitor';
  document.body.classList.toggle('common',common);
  const group=one('.roles');
  one('.toolbar').prepend(group);
  for(const b of document.querySelectorAll('[data-role]'))b.setAttribute('aria-pressed',String(b.dataset.role===role));
  for(const b of document.querySelectorAll('[data-exam]'))b.setAttribute('aria-pressed',String(b.dataset.exam===exam));
  one('#title').innerHTML=item.title;
  one('#desc').textContent=item.desc;
  one('#workTitle').textContent=item.work;
  const enterText=item.enter;
  one('#enter span').textContent=enterText+' ↗';
  one('#enter').setAttribute('aria-label',enterText);
  const primary=one('#primary'),secondary=one('#secondary'),extra=one('#extra');
  primary.textContent=common?'학생 공부창 열기 ↗':student?'공부하기 ↗':role==='academy'?'반별 교재 만들기 →':'수업 교재 만들기 →';
  secondary.textContent=common?'공개 문항 지면 보기 →':student?'자료받기 →':'자료실 바로가기 ↗';
  primary.href=showsServiceTour()?studyUrl():'#workspace';
  secondary.href=common?educatorDestination('teacher',exam):materialsUrl();
  extra.textContent=student?(exam==='csat'?'수능 100분 실전 풀기 ↗':'내신 50분 실전 풀기 ↗'):'수업 자료 이용 안내 ↗';
  const guide='guide/index.html?'+new URLSearchParams({exam,audience:role});
  extra.href=student?'study/index.html?exam='+exam+'&minutes='+(exam==='csat'?100:50)+'#timed':guide;
  one('#navStudy').href=studyUrl();one('#navBooks').href=materialsUrl();one('#navGuide').href=guide;
  one('#allBooks').href=materialsUrl();one('#schoolBooks').href=materialsUrl('school');one('#csatBooks').href=materialsUrl('csat');
  const example=one('#educator-preview');
  example.hidden=common||student;
  if(!example.hidden){
    example.href=educatorDestination(role,exam);
    primary.href=example.href;
  }
  screenFrame.title=one('#workTitle').textContent;
  if(remember){const u=new URL(location.href);u.searchParams.set('exam',exam);u.searchParams.set('audience',role);u.hash='';try{history.replaceState(null,'',u)}catch{}}
  window.dispatchEvent(new CustomEvent('delta-view', {detail:{role,exam}}));
  refreshFilmLink();
  layoutStage();
  paint();
}
for(const b of document.querySelectorAll('[data-role],[data-exam]'))b.onclick=()=>{
  if(b.dataset.role)role=b.dataset.role;else exam=b.dataset.exam;
  if(stage.classList.contains('active'))move(false,false);
  setScreen(true);
};
function refreshFilmLink() { setFilmLink(); }
one('#enter').onclick=()=>{refreshFilmLink();location.assign(one('#filmStudy').href)};
for(const event of ['pointerdown','focus','click','auxclick'])one('#filmStudy').addEventListener(event,refreshFilmLink);
one('#backIntro').onclick=()=>{move(false,false);window.dispatchEvent(new Event('delta-replay-intro'))};
window.addEventListener('scroll',schedule,{passive:true});window.addEventListener('resize',layoutStage);const stageObserver=new ResizeObserver(layoutStage);stageObserver.observe(intro);stageObserver.observe(canvas);
setScreen(false);
if(legacyTeacher||['#workspace','#story'].includes(location.hash))window.addEventListener('load',()=>move(true,false),{once:true});

const account=one('#member-account');
function updateLoginReturn(){
  account.href='/auth/?next='+encodeURIComponent(location.pathname+location.search+location.hash);
}
window.addEventListener('delta-view', updateLoginReturn);
window.addEventListener('hashchange', updateLoginReturn);
updateLoginReturn();
