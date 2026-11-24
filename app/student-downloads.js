/* Student surface over the existing store, point-PDF ledger and print pipeline. */
(()=>{'use strict';
if(window.DSStudentDownloads)return;
const panes=['store','print','files'];let pane=new URLSearchParams(location.search).get('downloadPane')||'store',rendering=false;if(!panes.includes(pane))pane='store';
const root=()=>document.querySelector('#content .sd-downloads');
const active=()=>location.hash==='#student'&&Boolean(rendering||root());
const isPrintActive=()=>active()&&pane==='print';
function printHTML(){
 const api=window.DSDrawTeacherV59;if(!api?.renderStudent)return '<p role="status">모의시험지 구성을 불러오고 있어요.</p>';
 const t=document.createElement('template');t.innerHTML=api.renderStudent();t.content.querySelectorAll('.tb36-modes,.tb36-heading,.tb36-design-link,footer').forEach(el=>el.remove());t.content.querySelectorAll('.tb36-section-title h2').forEach(el=>{if(el.textContent==='어떤 수업을 준비하나요?')el.textContent='어떤 조건으로 연습할까요?';});return '<div class="sd-print">'+t.innerHTML+'</div>';
}
function materialLink({bookId,unitId,localUnit}={}){
 const url=new URL(location.href);
 url.hash='student';url.searchParams.set('studentMode','downloads');url.searchParams.set('downloadPane','store');
 for(const key of ['studyBook','studyUnit','studyLocal'])url.searchParams.delete(key);
 if(bookId){url.searchParams.set('studyBook',bookId);if(unitId)url.searchParams.set('studyUnit',unitId);}
 else if(localUnit)url.searchParams.set('studyLocal',localUnit);
 const href=(url.pathname+url.search+url.hash).replace(/&/g,'&amp;').replace(/"/g,'&quot;');
 return '<a class="sd-material-link" href="'+href+'">전체 자료받기 <span aria-hidden="true">→</span></a>';
}
function storeScope(){
 const params=new URLSearchParams(location.search),id=params.get('studyBook'),unitId=params.get('studyUnit');
 if(id){
  const books=[...(window.DSPrintScopeData?.books||[]),...(window.DSWorkbookScope?.books||[])];
  const book=books.find(b=>b.id===id),unit=book?.units.find(u=>u.id===unitId);
  if(book)return {bookId:id,unitId,unit:unit?.label||'',label:book.label+(unit?' · '+unit.label:'')};
 }
 const local=params.get('studyLocal');
 if(['유리함수','무리함수'].includes(local))return {subject:'공통수학2',unit:'유리함수와 무리함수',label:'공통수학2 · 유리함수와 무리함수'};
 return null;
}
function categoryNavigation(){
 const labels=['부교재(변형)연습','단원평가(모의내신)','받은자료'];
 const buttons=panes.map((id,i)=>`<button type="button" data-sd-pane="${id}" aria-pressed="${pane===id}"><small>${i+1}</small>${labels[i]}</button>`).join('');
 return `<nav class="ms-categories" aria-label="자료받기 메뉴">${buttons}<button type="button" disabled title="준비 중"><small>4</small>수업자료(학원수업)</button></nav>`;
}
function render(){rendering=true;try{
 const navigation=categoryNavigation();
 let content;
 if(pane==='store'){
  content=window.DSMaterialsShop?.render({audience:'student',scope:storeScope(),navigation})||navigation+'<p role="status">교재 자료를 불러오고 있어요.</p>';
 }else{
  const isPrint=pane==='print';
  const heading=isPrint?'단원평가(모의내신)':'받은자료';
  const description=isPrint?'시험 범위와 유형을 골라 나만의 모의시험지를 만들어 보세요.':'받은 PDF는 포인트를 더 쓰지 않고 다시 열 수 있어요.';
  const body=isPrint?printHTML():'<section class="sd-files dl63-receipt"><h2>내가 받은 자료</h2><section class="ppdf ppdf-account" data-ppdf-receipts><p role="status">PDF 보관함을 불러오고 있어요.</p></section><a href="#account">한글 구매·월 이용권 자료와 전체 보관함 보기 →</a></section>';
  content=`<header class="sd-heading dl63-head"><div><h1>${heading}</h1><p>${description}</p></div></header>${navigation}${body}`;
 }
 return `<section class="sd-downloads dl63-page dl63" data-sd-view="${pane}"><div class="sd-body">${content}</div></section>`;
}finally{rendering=false;}}
function mount(container){const box=container?.matches?.('.sd-downloads')?container:container?.querySelector?.('.sd-downloads')||root();if(!box)return;window.DSDrawTeacherV59?.mount?.();window.DSTeacherBuilderV36?.fitLivePreviews?.(box);}
function refresh(focus){const old=root();if(!old)return;const t=document.createElement('template');t.innerHTML=render();old.replaceWith(t.content);mount();if(focus)root()?.querySelector(focus)?.focus({preventScroll:true});}
function open(next,{syncURL=true}={}){if(!panes.includes(next))return;if(pane==='print'&&next!=='print')window.DSDrawTeacherV59?.suspendStudent?.();pane=next;if(syncURL){const u=new URL(location.href);u.searchParams.set('downloadPane',pane);history.pushState(history.state,'',u.pathname+u.search+u.hash);}refresh('[data-sd-pane="'+pane+'"]');window.dispatchEvent(new CustomEvent('ds-student-downloads-change',{detail:{pane}}));}
document.addEventListener('click',e=>{const b=e.target.closest?.('[data-sd-pane]');if(b&&root()?.contains(b)){e.preventDefault();open(b.dataset.sdPane);}});
window.addEventListener('popstate',()=>{if(!active())return;const next=new URLSearchParams(location.search).get('downloadPane')||'store';if(panes.includes(next))open(next,{syncURL:false});});
window.addEventListener('ds-session-change',()=>{if(active()&&pane!=='print')refresh();});
window.DSStudentDownloads={render,mount,isPrintActive,refresh,open,materialLink,snapshot:()=>({pane})};
})();
