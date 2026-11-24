/* Student surface over the existing store, point-PDF ledger and print pipeline. */
(()=>{'use strict';
if(window.DSStudentDownloads)return;
let pane='store',rendering=false;
const root=()=>document.querySelector('#content .sd-downloads');
const active=()=>location.hash==='#student'&&Boolean(rendering||root());
const isPrintActive=()=>active()&&pane==='print';
function printHTML(){
 const api=window.DSDrawTeacherV59;
 if(!api?.renderStudent)return '<p role="status">프린트 설정을 불러오고 있어요.</p>';
 const template=document.createElement('template');
 template.innerHTML=api.renderStudent();
 template.content.querySelectorAll('.tb36-modes,.tb36-heading,.existing-services-v24,footer').forEach(el=>el.remove());
 return '<div class="sd-print">'+template.innerHTML+'</div>';
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
function render(view=pane){pane=view;rendering=true;try{
 const files='<section class="sd-files dl63-receipt" aria-labelledby="sd-files-title"><h2 id="sd-files-title" tabindex="-1">받은 자료</h2><section class="ppdf ppdf-account" data-ppdf-receipts data-student-receipts><p role="status">PDF 보관함을 불러오고 있어요.</p></section><div data-student-acquisitions></div></section>';
 const content=pane==='print'
  ? '<header class="sd-heading dl63-head"><div><h1>프린트 만들기</h1></div></header>'+printHTML()
  : (window.DSMaterialsShop?.render({audience:'student',scope:storeScope()})||'<p role="status">교재 자료를 불러오고 있어요.</p>')+files;
 return `<section class="sd-downloads dl63-page dl63" data-sd-view="${pane}"><div class="sd-body">${content}</div></section>`;
}finally{rendering=false;}}
function mount(container){
 const box=container?.matches?.('.sd-downloads')?container:container?.querySelector?.('.sd-downloads')||root();
 if(!box)return;
 if(pane==='print'){window.DSDrawTeacherV59?.mount?.();window.DSTeacherBuilderV36?.fitLivePreviews?.(box);}
 else if(new URLSearchParams(location.search).get('downloadPane')==='files'&&!box.dataset.focusedFiles){
  box.dataset.focusedFiles='true';box.querySelector('#sd-files-title')?.focus();
 }
}
function refresh(focus){const old=root();if(!old)return;const t=document.createElement('template');t.innerHTML=render();old.replaceWith(t.content);mount();if(focus)root()?.querySelector(focus)?.focus({preventScroll:true});}
function open(next){
 if(!['store','print','files'].includes(next))return;
 const u=new URL(location.href);
 u.searchParams.set('studentMode',next==='print'?'create':'downloads');
 if(next==='files')u.searchParams.set('downloadPane','files');else u.searchParams.delete('downloadPane');
 history.pushState(history.state,'',u);
 window.dispatchEvent(new CustomEvent('ds-student-downloads-change',{detail:{pane:next}}));
}
window.addEventListener('ds-session-change',()=>{if(active()&&pane!=='print')refresh();});
window.DSStudentDownloads={render,mount,isPrintActive,refresh,open,materialLink,snapshot:()=>({pane})};
})();
