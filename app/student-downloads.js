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
function render(){rendering=true;try{
 const tabs=panes.map((id,i)=>'<button type="button" data-sd-pane="'+id+'" aria-pressed="'+(pane===id)+'">'+['교재 자료','모의시험지','받은 PDF'][i]+'</button>').join('');let body;
 if(pane==='store')body=(window.DSMaterialsShop?.render({audience:'student'})||'<p role="status">교재 자료를 불러오고 있어요.</p>')+'<p class="sd-evidence">선택한 교재와 연계가 확인된 단원별 자료를 보여드려요. 원래 교재의 모든 문항과 같은 유형이 준비된 것은 아니에요.</p><details class="sd-owned"><summary>이미 받은 PDF와 구매 결과 확인</summary><section class="ppdf ppdf-account" data-ppdf-receipts><p role="status">PDF 보관함을 불러오고 있어요.</p></section></details>';
 else if(pane==='print')body=printHTML();
 else body='<section class="sd-files dl63-receipt"><h2>내가 받은 자료</h2><p>서버에 보관된 PDF를 다시 열 수 있어요. 이미 받은 같은 PDF는 추가 포인트가 차감되지 않아요.</p><section class="ppdf ppdf-account" data-ppdf-receipts><p role="status">PDF 보관함을 불러오고 있어요.</p></section><a href="#account">한글 구매·월 이용권 자료와 전체 보관함 보기 →</a></section>';
 return '<section class="sd-downloads dl63-page dl63" data-sd-view="'+pane+'"><header class="sd-heading dl63-head"><div><span class="dl63-kicker">내 공부 자료</span><h1>자료받기</h1><p>'+(pane==='print'?'필요한 범위를 골라 종이에 풀어봐요.':'공부하는 교재에 맞춰 연습 자료를 찾아봐요.')+'</p></div><a href="#account">마이페이지 →</a></header><nav class="sd-tabs" aria-label="자료받기 메뉴">'+tabs+'</nav><div class="sd-body">'+body+'</div></section>';
}finally{rendering=false;}}
function mount(container){const box=container?.matches?.('.sd-downloads')?container:container?.querySelector?.('.sd-downloads')||root();if(!box)return;window.DSDrawTeacherV59?.mount?.();window.DSTeacherBuilderV36?.fitLivePreviews?.(box);}
function refresh(focus){const old=root();if(!old)return;const t=document.createElement('template');t.innerHTML=render();old.replaceWith(t.content);mount();if(focus)root()?.querySelector(focus)?.focus({preventScroll:true});}
function open(next,{syncURL=true}={}){if(!panes.includes(next))return;if(pane==='print'&&next!=='print')window.DSDrawTeacherV59?.suspendStudent?.();pane=next;if(syncURL){const u=new URL(location.href);u.searchParams.set('downloadPane',pane);history.pushState(history.state,'',u.pathname+u.search+u.hash);}refresh('[data-sd-pane="'+pane+'"]');window.dispatchEvent(new CustomEvent('ds-student-downloads-change',{detail:{pane}}));}
document.addEventListener('click',e=>{const b=e.target.closest?.('[data-sd-pane]');if(b&&root()?.contains(b)){e.preventDefault();open(b.dataset.sdPane);}});
window.addEventListener('popstate',()=>{if(!active())return;const next=new URLSearchParams(location.search).get('downloadPane')||'store';if(panes.includes(next))open(next,{syncURL:false});});
window.addEventListener('ds-session-change',()=>{if(active()&&pane!=='print')refresh();});
window.DSStudentDownloads={render,mount,isPrintActive,refresh,open,snapshot:()=>({pane})};
})();
