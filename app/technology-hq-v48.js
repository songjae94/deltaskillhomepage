/* One verified HQ question set shared by the entrance and technology page. */
(() => {
'use strict';
const data=window.DSHeroCompareContentV43;
if(!data?.stages?.length)return;
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function plate(index,original=false,marks=true){
 const s=data.stages[original?0:index], m=data.marks;
 const retained=marks?(original?m.retained.original[index]:m.retained.variant[index])||[]:[];
 const changed=marks&&index?(original?m.original[index]:m.variant[index]):[];
 return '<svg class="th48-plate" style="aspect-ratio:'+data.contentBox.width+'/'+data.contentBox.height+'" viewBox="'+[data.contentBox.x,data.contentBox.y,data.contentBox.width,data.contentBox.height].join(' ')+'" role="img" aria-label="'+esc((original?'원문항':s.label+' '+s.kind)+' · '+data.sourceLabel)+'"><image href="'+esc(s.src)+'" width="'+s.width+'" height="'+s.height+'"/>'+retained.map(([x,y,w,h])=>'<rect class="th48-kept" x="'+x+'" y="'+y+'" width="'+w+'" height="'+h+'" rx="4"/>').join('')+changed.map(([x,y,w])=>'<rect class="th48-tint" x="'+(x-3)+'" y="'+(y-25)+'" width="'+(w+6)+'" height="28" rx="3"/><path class="th48-line" d="M'+x+' '+(y+3)+'h'+w+'"/>').join('')+'</svg>';
}
function render(){
 return '<div class="th48-head"><div><p>'+esc(data.sourceLabel)+'</p><h3>원문에서 4단계까지</h3></div><div class="th48-legend"><span>유지</span><span>변경</span></div></div><nav class="th48-nav" aria-label="변형 단계로 이동">'+data.stages.slice(1).map((s,i)=>'<button type="button" data-tech-jump="'+(i+1)+'"><b>'+s.label+'</b><span>'+esc(s.kind)+'</span><i>↓</i></button>').join('')+'</nav><div class="th48-spread"><aside class="th48-original"><div class="th48-paper"><header><strong>원문항</strong><small data-th48-label>1단계와 비교</small></header><div data-th48-original>'+plate(1,true)+'</div></div><p>왼쪽은 원문, 오른쪽은 변형입니다.<br>밑줄에서 달라진 조건을 확인하세요.</p></aside><div class="th48-stages">'+data.stages.slice(1).map((s,i)=>'<section class="th48-stage" id="techv25-stage-'+(i+1)+'" data-th48-stage="'+(i+1)+'"><header><span>0'+(i+1)+'</span><div><small>'+esc(s.label)+'</small><h3>'+esc(s.kind)+'</h3></div></header><div class="th48-paper">'+plate(i+1)+'</div><p class="th48-note">'+esc(s.note)+'</p><details class="th48-mobile-original"><summary>원문과 비교</summary>'+plate(i+1,true)+'</details></section>').join('')+'</div></div>';
}
function focus(root,index){const slot=root.querySelector('[data-th48-original]');if(!slot)return;slot.innerHTML=plate(index,true);root.querySelector('[data-th48-label]').textContent=index+'단계와 비교';}
let observer;
function connect(root){observer?.disconnect();const sections=root.querySelectorAll('[data-th48-stage]');if(!sections.length)return;observer=new IntersectionObserver(entries=>{for(const e of entries)if(e.isIntersecting)focus(root,Number(e.target.dataset.th48Stage));},{rootMargin:'-15% 0px -45% 0px',threshold:0});sections.forEach(e=>observer.observe(e));}
window.DSHQComparisonV48={render,plate,focus,connect};
})();
