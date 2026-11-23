/* Conditions first. All question bodies remain the existing shared-renderer documents. */
(() => {
  'use strict';
  const bank=window.DSBasicExamV34,api=window.DSCanonicalPrintV35;
  if(!bank?.canonical||!api||window.DSTeacherBuilderV36)return;
  const safe=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const all=bank.questions,byId=new Map(all.map(q=>[q.id,q]));
  const units=[...new Set(all.map(q=>q.unit))];
  const level='all';
  function pool(spec){return spec.difficulty===level?all.filter(q=>spec.unit==='all'||q.unit===spec.unit):[];}
  function choose(spec,seed=0){
    if(!Number.isInteger(spec.count)||spec.count<1||spec.count>50)return {ok:false,error:'count'};
    const available=pool(spec);if(available.length<spec.count)return {ok:false,error:'insufficient',available:available.length};
    const offset=((seed%available.length)+available.length)%available.length;
    const rotated=available.slice(offset).concat(available.slice(0,offset));
    return {ok:true,refs:rotated.slice(0,spec.count).map(q=>({itemId:q.id,version:q.version}))};
  }
  function alternatives(refs,spec,index){
    if(!Number.isInteger(index)||index<0||index>=refs.length)return [];
    const chosen=new Set(refs.map(r=>r.itemId)),previous=byId.get(refs[index].itemId);
    return pool(spec).filter(q=>!chosen.has(q.id)&&q.unit===previous?.unit);
  }
  function exchange(refs,spec,index,id){
    const q=alternatives(refs,spec,index).find(q=>q.id===id);if(!q)return null;
    return refs.map((r,i)=>i===index?{itemId:q.id,version:q.version}:{...r});
  }
  const previousTeacher=teacher;
  let embeddedDepth=0;
  let mode='print',phase='setup',seed=0,generated=null,replacing=-1,message='';
  let spec={unit:units[0]||'all',difficulty:level,count:Math.min(3,all.filter(q=>q.unit===units[0]).length)||1};
  const routeHere=()=>['#teacher','#studio'].includes(location.hash);
  const getTitle=()=>`${spec.unit==='all'?'수능 기출':spec.unit} ${mode==='book'?'교재':'수업 프린트'}`;
  function setCondition(key,value){const previousTitle=getTitle();spec={...spec,[key]:key==='count'?Number(value):value};if(!studio.title||studio.title===previousTitle)studio={...studio,title:getTitle()};message='';}
  function rerender(focus){if(embeddedDepth||!routeHere())return;document.getElementById('content').innerHTML=teacher();if(focus)document.querySelector(focus)?.focus({preventScroll:true});}
  function modes(){return `<nav class="tb36-modes" aria-label="자료 만들기 종류"><button type="button" data-tb36-mode="materials" aria-pressed="${mode==='materials'}"><span class="tb36-mode-icon tb36-icon-library" aria-hidden="true"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 5h16v14H4zM8 5v14M11 9h6m-6 4h6"/></svg></span><span><strong>내신자료</strong><small>완성된 자료 찾기</small></span><i>↗</i></button><button type="button" data-tb36-mode="print" aria-pressed="${mode==='print'}"><span class="tb36-mode-icon tb36-icon-print" aria-hidden="true"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 8V3h10v5M7 17H4V8h16v9h-3M7 14h10v7H7zM16 11h1"/></svg></span><span><strong>프린트 만들기</strong><small>오늘 수업에 맞게</small></span><i>↗</i></button><button type="button" data-tb36-mode="book" aria-pressed="${mode==='book'}"><span class="tb36-mode-icon tb36-icon-book" aria-hidden="true"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 4h7c1 0 1 1 1 1s0-1 1-1h7v15h-7c-1 0-1 1-1 1s0-1-1-1H4zM12 5v15"/></svg></span><span><strong>교재 만들기</strong><small>표지까지 내 이름으로</small></span><i>↗</i></button></nav>`;}
  function steps(){const index=phase==='setup'?0:phase==='review'?2:3;return `<ol class="tb36-steps" aria-label="제작 순서">${['조건 설정','자동 구성','문항 교체','보관·출력'].map((text,i)=>`<li class="${i<index?'is-done':i===index?'is-current':''}" ${i===index?'aria-current="step"':''}><b>${i<index?'✓':i+1}</b><span>${text}${i===2?'<small>필요할 때만</small>':''}</span></li>`).join('')}</ol>`;}
  function heading(){return `<header class="tb36-heading"><div><span>수업 준비</span><h1>${mode==='materials'?'내신자료':mode==='book'?'교재 만들기':'프린트 만들기'}</h1></div><a href="#account">내 보관함 ↗</a></header>`;}
  function setup(){const count=pool(spec).length;return `<div class="tb36-setup"><form id="tb36-form" class="tb36-conditions"><div class="tb36-section-title"><b>01</b><h2>어떤 수업을 준비하나요?</h2></div><label>단원<select data-tb36-field="unit" aria-label="단원"><option value="all" ${spec.unit==='all'?'selected':''}>수능 기출 · 단원 혼합</option>${units.map(u=>`<option value="${safe(u)}" ${spec.unit===u?'selected':''}>${safe(u)}</option>`).join('')}</select></label><label>난이도<select data-tb36-field="difficulty" aria-describedby="tb36-level-note" aria-label="난이도"><option value="all">전체 난이도</option></select><small id="tb36-level-note">기출문항을 함께 구성합니다.</small></label><label>문항 수<div class="tb36-count"><input type="number" min="1" max="50" value="${spec.count}" data-tb36-field="count" aria-label="문항 수"><span>문항</span></div><small>현재 이 범위에서 ${count}문항을 구성할 수 있습니다.</small></label>${window.DSDocumentDesign?.picker()||''}${mode==='book'?`<label>교재 제목<input data-tb36-title maxlength="60" value="${safe(studio.title||getTitle())}" placeholder="교재 이름"></label>`:''}<button type="submit" class="tb36-primary">${mode==='book'?'교재 자동 구성':'프린트 자동 구성'} <span>→</span></button><p class="tb36-message" role="status">${safe(message)}</p></form>${setupPaper()}</div>`;}
  function setupPaper(){
    const surface=window.DSPrintSurfaceV48;
    // Use the same selection and seed as compose(), without advancing the draft.
    const selected=choose(spec,seed),unit=spec.unit==='all'?'수능 기출':spec.unit;
    if(!selected.ok)return '<aside class="tb36-order-preview ds48-canvas"><div class="ds48-preview-toolbar"><strong>선택한 문항 미리보기</strong><small>'+safe(unit)+'</small></div><div class="tb53-preview-empty">'+(selected.error==='count'?'문항 수를 1~50 사이로 입력해 주세요.':'이 단원에서 사용할 수 있는 문항은 '+selected.available+'개입니다. 문항 수를 조정해 주세요.')+'</div></aside>';
    const draft={...studio,source:'practice',itemSource:'exam-basic-v34',itemRefs:selected.refs,docType:mode==='book'?'book':'print',title:mode==='book'&&studio.title?studio.title:getTitle(),subject:'수학',unit};
    const c=api.config(draft),pages=api.sequence(c),page=pages.findIndex(p=>p.type==='questions');
    return '<aside class="tb36-order-preview ds48-canvas" data-preview-unit="'+safe(unit)+'" data-preview-refs="'+safe(selected.refs.map(r=>r.itemId).join('|'))+'"><div class="ds48-preview-toolbar"><strong>선택한 문항 미리보기</strong><small>'+c.questions.length+'문항 · '+pages.length+'쪽</small></div>'+surface.scene('<iframe class="tb53-condition-preview" style="width:793.7008px;height:1122.5197px;visibility:hidden" title="'+safe(unit)+' 선택 문항 미리보기" scrolling="no" srcdoc="'+safe(api.documentHTML(c,page))+'"></iframe>')+'<p class="ds48-reference-note">'+safe(unit)+' · 문제와 정답·해설 2단</p></aside>';
  }
  function selectedRows(){return `<div class="tb36-review-list">${(studio.itemRefs||[]).map((ref,i)=>{const q=byId.get(ref.itemId),available=alternatives(studio.itemRefs,generated,i);if(!q)return '';return `<article><div class="tb36-row-top"><b>${String(i+1).padStart(2,'0')}</b><div><strong>${safe(q.title)}</strong><small>${safe(q.short)}</small></div><button type="button" data-tb36-replace="${i}" ${!available.length?'disabled':''} title="${available.length?'같은 단원의 다른 문항':'같은 조건의 다른 문항이 없습니다'}">교체</button></div>${replacing===i?`<div class="tb36-replacements"><div><strong>같은 단원의 다른 문항</strong><button type="button" data-tb36-cancel-replace aria-label="교체 목록 닫기">×</button></div>${available.map(candidate=>`<label><span>${safe(candidate.short)}</span><button type="button" data-tb36-use="${safe(candidate.id)}" data-tb36-index="${i}">이 문항으로 교체</button><details><summary>문제 확인</summary><iframe title="${safe(candidate.short)}" src="${safe(candidate.questionFrame)}" loading="lazy"></iframe></details></label>`).join('')}</div>`:''}</article>`;}).join('')}</div>`;}
  function preview(){const c=api.config(),pages=api.sequence(c);creatorPage=Math.max(0,Math.min(creatorPage,pages.length-1));return `<div class="creator-canvas td34-canvas tb36-canvas ds48-canvas"><div class="creator-canvas-toolbar"><div><strong>인쇄 미리보기</strong><span>${c.questions.length}문항 · ${pages.length}쪽</span></div><button type="button" data-preview-paper>확대 ⤢</button></div><div class="creator-paper-stage">${window.DSPrintSurfaceV48.scene(`<div id="sheet" class="a4">${sheet()}</div>`)}</div><nav class="tb36-pages" aria-label="미리보기 쪽">${pages.map((p,i)=>`<button type="button" data-creator-page="${i}" aria-pressed="${creatorPage===i}">${i+1} ${p.type==='cover'?'표지':p.type==='solutions'?'정답·해설':p.designRecord?'기록면':'문제'}</button>`).join('')}</nav><div class="creator-canvas-footer"><span>A4 · 210 × 297 mm</span><span>정답·해설 2단</span></div></div>`;}
  function review(){return `<div class="tb36-workspace"><aside class="tb36-review-panel"><div class="tb36-composed"><span>자동 구성 완료</span><h2>${safe(generated.unit==='all'?'수능 기출':generated.unit)}</h2><p>수능 기출 · ${studio.itemRefs.length}문항</p><button type="button" data-tb36-back>조건 변경</button></div><div class="tb36-review-heading"><h3>문항 확인</h3><p>그대로 사용하거나 필요한 문항만 교체하세요.</p></div>${selectedRows()}<button type="button" class="tb36-primary" data-tb36-finish>구성 완료 <span>→</span></button><p class="tb36-message" role="status">${safe(message)}</p></aside>${preview()}</div>`;}
  function finish(){return `<div class="tb36-workspace"><aside class="tb36-finish-panel"><div class="tb36-section-title"><b>04</b><h2>보관·출력</h2></div><label>제목<input data-studio="title" maxlength="60" value="${safe(studio.title)}"></label>${mode==='book'?'<div class="tb36-cover-note"><b>표지 포함</b><span>문제와 해설까지 한 권으로 구성합니다.</span></div>':''}<label>한 쪽 문항 수<select data-studio="layout">${[1,2,4].map(n=>`<option value="${n}" ${Number(studio.layout)===n?'selected':''}>${n}문항</option>`).join('')}</select></label>${window.DSDocumentDesign?.picker()||''}<a class="tb36-design-link" href="#print-design">학원명·머리말·표지 디자인 <span>↗</span></a><div class="tb36-save"><strong>보관</strong><p>인쇄하거나 PDF로 저장해 사용하세요.</p></div><button type="button" class="tb36-primary" data-print>인쇄 / PDF <span>↗</span></button><button type="button" class="tb36-quiet" data-tb36-review>문항 다시 확인</button><p class="tb36-message" role="status">${safe(message)}</p></aside>${preview()}</div>`;}
  function material(){
    const t=document.createElement('template');t.innerHTML=previousTeacher();
    const work=t.content.querySelector('.creator-workspace');
    if(!work)return '<a class="tb36-primary" href="#library">내신자료 찾기 ↗</a>';
    work.querySelectorAll('.creator-mode').forEach(x=>x.remove());
    const stage=work.querySelector('.creator-paper-stage');if(stage){stage.innerHTML=window.DSPrintSurfaceV48.scene(stage.innerHTML);stage.closest('.creator-canvas')?.classList.add('ds48-canvas');}
    return `<div class="tb36-material-lead"><p>과목과 단원으로 완성된 자료를 찾으세요.</p><a href="#library">전체 자료실 ↗</a></div>${work.outerHTML}`;
  }
  teacher=function(){return `<section class="work-surface creator-surface tb36-surface">${modes()}${heading()}${mode==='materials'?material():steps()+(phase==='setup'?setup():phase==='review'?review():finish())}${compactFooter()}</section>`;};
  function modeFromURL(){try{const requested=new URLSearchParams(location.search).get('teacherMode');return ['materials','print','book'].includes(requested)?requested:'print';}catch{return 'print';}}
  function switchMode(next,{syncURL=true}={}){
    if(!['materials','print','book'].includes(next))return;
    if(syncURL&&routeHere()&&next!==mode)try{const url=new URL(location.href);url.searchParams.set('teacherMode',next);history.pushState(history.state,'',url.href);}catch{}
    mode=next;phase='setup';replacing=-1;message='';generated=null;
    studio={...studio,source:next==='materials'?'materials':'practice',itemSource:next==='materials'?undefined:'exam-basic-v34',itemRefs:[],docType:next==='book'?'book':'print',title:next==='materials'?'':getTitle(),subject:'수학',unit:spec.unit==='all'?'수능 기출':spec.unit,layout:'2'};
    creatorPage=0;rerender();
  }
  function compose(){
    const result=choose(spec,seed++);if(!result.ok){message=result.error==='count'?'문항 수를 1~50 사이로 입력해 주세요.':`현재 조건에 맞는 문항은 ${result.available}개입니다. 문항 수를 줄이거나 단원 범위를 넓혀 주세요.`;rerender('[data-tb36-field="count"]');return false;}
    generated={...spec};studio={...studio,source:'practice',itemSource:'exam-basic-v34',itemRefs:result.refs,docType:mode==='book'?'book':'print',title:mode==='book'&&studio.title?studio.title:getTitle(),subject:'수학',unit:spec.unit==='all'?'수능 기출':spec.unit};phase='review';creatorPage=0;message='';replacing=-1;rerender();return true;
  }
  document.addEventListener('submit',e=>{if(e.target.id==='tb36-form'){e.preventDefault();compose();}});
  document.addEventListener('click',e=>{const b=e.target.closest('[data-tb36-mode],[data-tb36-back],[data-tb36-replace],[data-tb36-cancel-replace],[data-tb36-use],[data-tb36-finish],[data-tb36-review]');if(!b)return;
    if(b.dataset.tb36Mode){switchMode(b.dataset.tb36Mode);return;}
    if(b.hasAttribute('data-tb36-back')){phase='setup';message='';rerender();return;}
    if(b.hasAttribute('data-tb36-replace')){replacing=Number(b.dataset.tb36Replace);rerender();return;}
    if(b.hasAttribute('data-tb36-cancel-replace')){replacing=-1;rerender();return;}
    if(b.dataset.tb36Use){const next=exchange(studio.itemRefs,generated,Number(b.dataset.tb36Index),b.dataset.tb36Use);if(!next)return;studio.itemRefs=next;replacing=-1;creatorPage=0;message='문항을 교체했습니다.';rerender();return;}
    if(b.hasAttribute('data-tb36-finish')){phase='finish';replacing=-1;message='';creatorPage=0;rerender();return;}
    if(b.hasAttribute('data-tb36-review')){phase='review';message='';rerender();}
  });
  document.addEventListener('change',e=>{const key=e.target.dataset?.tb36Field;if(!key)return;setCondition(key,e.target.value);rerender(`[data-tb36-field="${key}"]`);});
  document.addEventListener('input',e=>{if(e.target.dataset?.tb36Field==='count')spec.count=Number(e.target.value);if(e.target.hasAttribute('data-tb36-title'))studio.title=e.target.value;});
  // The tablet uses this exact renderer and the same selection logic, with its own draft.
  function captureEmbedded(){return {mode,phase,seed,generated,replacing,message,spec,studio,creatorPage};}
  function applyEmbedded(s){({mode,phase,seed,generated,replacing,message,spec,studio,creatorPage}=s);}
  function isolated(model,fn){const saved=captureEmbedded();embeddedDepth++;try{applyEmbedded(model);const result=fn();Object.assign(model,captureEmbedded());return result;}finally{applyEmbedded(saved);embeddedDepth--;}}
  function createEmbedded(){return {mode:'print',phase:'setup',seed:0,generated:null,replacing:-1,message:'',spec:{unit:'all',difficulty:level,count:3},studio:{...studio,source:'practice',itemSource:'exam-basic-v34',itemRefs:[],docType:'print',title:'수업 프린트',subject:'수학',unit:'수능 기출',layout:'2',printSettings:api.normalizeSettings()},creatorPage:0};}
  function embeddedAction(model,action,value){return isolated(model,()=>{
    if(action==='field'){const key=value.key;if(!['unit','difficulty','count'].includes(key))return;setCondition(key,value.value);}
    else if(action==='compose')return compose();
    else if(action==='page')creatorPage=Number(value);
    else if(action==='back'){phase='setup';message='';}
    else if(action==='finish'){phase='finish';replacing=-1;creatorPage=0;}
    else if(action==='review')phase='review';
    else if(action==='replace')replacing=Number(value);
    else if(action==='cancel')replacing=-1;
    else if(action==='use'){const next=exchange(studio.itemRefs,generated,value.index,value.id);if(next){studio={...studio,itemRefs:next};replacing=-1;creatorPage=0;}}
  });}
  function fitLivePreviews(scope=document){window.DSPrintSurfaceV48?.fit(scope);scope.querySelectorAll('.tb44-paper-fit').forEach(el=>{const f=el.querySelector('iframe');if(f)f.style.transform='scale('+el.clientWidth/(210*96/25.4)+')';});}
  if(typeof MutationObserver!=='undefined'&&document.getElementById('content'))new MutationObserver(()=>fitLivePreviews()).observe(document.getElementById('content'),{childList:true,subtree:true});
  window.addEventListener('ds-document-design-change',()=>{if(mode==='book')rerender();});
  window.addEventListener('resize',()=>fitLivePreviews());
  window.DSTeacherBuilderV36={fitLivePreviews,createEmbedded,renderEmbedded:model=>isolated(model,()=>teacher()),embeddedAction,embeddedConfig:model=>isolated(model,()=>api.config()),pool,choose,alternatives,exchange,compose,switchMode,snapshot:()=>({mode,phase,spec:{...spec},generated:generated&&{...generated}})};
  window.addEventListener('ds-session-change',()=>{generated=null;phase='setup';replacing=-1;message='';studio={...studio,itemRefs:[],title:getTitle(),printSettings:api.normalizeSettings()};if(routeHere())rerender();});
  const restoreTeacherMode=()=>{if(routeHere()){const next=modeFromURL();if(next!==mode)switchMode(next,{syncURL:false});}};
  window.addEventListener('popstate',restoreTeacherMode);
  window.addEventListener('hashchange',restoreTeacherMode);
  switchMode(routeHere()?modeFromURL():'print',{syncURL:false});
})();
