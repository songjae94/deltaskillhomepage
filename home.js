const one = selector => document.querySelector(selector);
const roles = {
  visitor: {title:'등급을 올리는<br><em>델타스킬.</em>', desc:'학생은 막힌 조건을 찾아 다시 풀고, 선생님과 학원은 수업에 맞는 교재를 만듭니다. 내신부터 수능까지, 델타스킬 AI와 함께하세요.', work:'델타스킬 기능 소개', enter:'단원별 공부 열기'},
  student: {title:'등급을 올리는<br><em>델타스킬.</em>', desc:'내 풀이가 어디서 막히는지 찾아요. 델타스킬 AI가 어려운 부분을 콕 집어, 나에게 맞는 문제로 다시 연습할 수 있게 도와줘요.', work:'델타스킬 기능 소개', enter:'단원별 공부 열기'},
  teacher: {title:'수업 자료부터<br><em>학생별 맞춤 수업까지.</em>', desc:'단원별 변형 문제집을 고르고 지면을 미리 본 뒤 바로 받으세요. 한 값에 1문항 1쪽 · 2문항 2단 · 4문항 2단 PDF를 모두 받습니다.', work:'내신 변형 문제집', enter:'문제집 고르기'},
  academy: {title:'반별 교재와<br><em>학생별 맞춤 수업.</em>', desc:'단원별 변형 문제집을 고르고 지면을 미리 본 뒤 바로 받으세요. 한 값에 1문항 1쪽 · 2문항 2단 · 4문항 2단 PDF를 모두 받습니다.', work:'내신 변형 문제집', enter:'문제집 고르기'}
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
  link.querySelector('span').textContent = showsServiceTour() ? '단원별 공부 열기 ↗' : '내신 변형 문제집 고르기 ↗';
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
/* 39 창 1119: 선생님 · 학원 길은 공개 문항 지면(수능 옛 그림)이 아니라 내신 변형 문제집 고르기 한 자리로 */
function educatorDestination() {
  return '/naesin/';
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
  primary.textContent=common?'학생 공부창 열기 ↗':student?'공부하기 ↗':'내신 변형 문제집 고르기 →';
  secondary.textContent=common?'내신 변형 문제집 고르기 →':student?'자료받기 →':'자료실 바로가기 ↗';
  primary.href=showsServiceTour()?studyUrl():'#workspace';
  secondary.href=common?educatorDestination('teacher',exam):materialsUrl();
  extra.textContent=student?(exam==='csat'?'수능 100분 실전 풀기 ↗':'내신 50분 실전 풀기 ↗'):'수업 자료 이용 안내 ↗';
  const guide='guide/index.html?'+new URLSearchParams({exam,audience:role});
  extra.href=student?'study/index.html?exam='+exam+'&minutes='+(exam==='csat'?100:50)+'#timed':guide;
  for(const [q,h] of [['#navStudy',studyUrl()],['#navBooks',materialsUrl()],['#navGuide',guide]]){const n=one(q);if(n)n.href=h;} /* 39 1119: 메인 머리 = 다른 쪽과 같은 ds-head(내신 자료 · 이용권 · 주문 조회 · 계정) — 옛 칸은 없을 수 있음 */
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
  if(!account)return; /* 계정 칸은 /auth.js 가 #authnav 로 채움 */
  account.href='/auth/?next='+encodeURIComponent(location.pathname+location.search+location.hash);
}
window.addEventListener('delta-view', updateLoginReturn);
window.addEventListener('hashchange', updateLoginReturn);
updateLoginReturn();
