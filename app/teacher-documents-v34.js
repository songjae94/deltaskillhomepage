/* Curated, version-pinned questions. Document storage contains references, never question HTML. */
(() => {
  'use strict';
  const api=window.DSCanonicalPrintV35||window.PrintComposerV14, bank=window.DSBasicExamV34;
  if(!api||!bank||window.DSTeacherQuestionsV34)return;
  const VERSION=bank.version, SOURCE='exam-basic-v34', byId=new Map(bank.questions.map(q=>[q.id,q]));
  const safe=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const refs=()=>bank.questions.map(q=>({itemId:q.id,version:q.version}));
  function resolve(s){
    if(s?.itemSource!==SOURCE)return null;
    const r=s.itemRefs;
    if(!Array.isArray(r)||new Set(r.map(x=>x?.itemId)).size!==r.length||r.some(x=>!byId.has(x?.itemId)||x.version!==byId.get(x.itemId).version))return [];
    return r.map(x=>byId.get(x.itemId));
  }
  window.DSTeacherQuestionsV34={resolve};
  const originalTeacher=teacher, originalAccount=accountPage;
  let currentId='',currentVersion=0,loadedAccount=false,epoch=0,busy=false,status='',listState='idle',documents=[];
  let pendingSave=null,baseline='',editorEpoch=0,listSequence=0;
  const teacherRoute=()=>['#teacher','#studio'].includes(location.hash);
  const active=()=>studio.source==='practice'&&studio.itemSource===SOURCE;
  const errorText=e=>({conflict:'다른 곳에서 수정한 자료입니다. 보관함에서 최신 자료를 열거나 복사본으로 저장하세요.',quota:'보관함이 가득 찼습니다.',unauthorized:'로그인 후 계정에 저장해 주세요.',session_changed:'계정이 변경되었습니다. 다시 열어 주세요.',bank_unavailable:'문항 연결을 확인하고 있습니다. 인쇄는 계속할 수 있습니다.',validation:'저장할 구성을 확인해 주세요.',unavailable:'계정 보관 연결이 아직 준비되지 않았습니다. 현재 구성으로 인쇄할 수 있습니다.'}[e?.code||e?.message]||'계정 보관에 연결하지 못했습니다. 현재 구성은 유지됩니다.');
  function documentValue(id=currentId||crypto.randomUUID()){
    const c=api.config();
    return {id,title:String(studio.title||'수능 기본 기출').trim().slice(0,60),docType:c.book?'book':'print',layout:String(c.layout),printDesign:c.design,printSettings:api.normalizeSettings(c.settings),itemRefs:(studio.itemRefs||[]).map(r=>({...r})),subject:String(studio.subject||'수학').slice(0,60),unit:String(studio.unit||'기본 기출').slice(0,100)};
  }
  function fingerprint(){return active()?JSON.stringify(documentValue(currentId||'draft')):'';}
  function notice(){if(bank.canonical)return '기존 디지털 원문·검증 해설로 출력합니다. 계정 보관은 아직 연결 전입니다.';return status||(currentId?(fingerprint()===baseline?'계정에 저장된 구성입니다.':'수정한 내용을 계정에 저장해 주세요.'):DSService.session()?'문항·순서·지면을 함께 보관합니다.':'로그인하면 다른 컴퓨터에서도 꺼내 쓸 수 있습니다.');}
  async function request(body){const result=await DSService.request('/teacher-documents',body);if(!result?.ok)throw Object.assign(new Error(result?.error||'unavailable'),{code:result?.error});return result;}
  function rerender(focus){if(!teacherRoute())return;document.getElementById('content').innerHTML=teacher();if(focus)document.querySelector(focus)?.focus({preventScroll:true});}
  function selectBasic(){
    editorEpoch++;
    const carriesAccountSettings=loadedAccount||!!window.DSAccountDesignApplied;
    studio={...studio,source:'practice',itemSource:SOURCE,itemRefs:refs(),title:'수능 기본 기출',subject:'수학',unit:'지수 · 미분계수 · 중복순열',docType:'print',layout:'4'};
    currentId='';currentVersion=0;loadedAccount=carriesAccountSettings;pendingSave=null;baseline='';status='';creatorPage=0;
    if(teacherRoute())rerender();else location.hash='#teacher';
  }
  function questionChoices(){
    const selected=studio.itemRefs||[], chosen=new Set(selected.map(r=>r.itemId));
    return `<div class="td34-bank-heading"><h2>문항 선택</h2><span>${safe(bank.examLabel||'기본 기출')}</span></div><div class="td34-bank">${bank.questions.map(q=>`<article class="td34-item ${chosen.has(q.id)?'is-selected':''}"><label><input type="checkbox" data-td34-select="${safe(q.id)}" ${chosen.has(q.id)?'checked':''}><span><b>${safe(q.title)}</b><small>${safe(q.short)} · ${safe(q.unit)}</small></span></label><details><summary>문제 보기</summary><div class="td34-item-stem">${q.canonical?'<iframe title="'+safe(q.short)+' 원본 디지털 문항" src="'+safe(q.questionFrame)+'" style="width:'+bank.cardWidth+'px"></iframe>':q.question}<div class="print-options">${q.options.map((x,i)=>`<span>${['①','②','③','④','⑤'][i]} ${math(x)}</span>`).join('')}</div></div></details></article>`).join('')}</div><div class="td34-order"><div><h3>선택한 순서</h3><span>${selected.length}문항</span></div><ol>${selected.map((r,i)=>{const q=byId.get(r.itemId);return q?`<li><span class="td34-order-no">${String(i+1).padStart(2,'0')}</span><span>${safe(q.title)}</span><button type="button" data-td34-move="${i}:up" aria-label="${safe(q.title)} 위로" ${i===0?'disabled':''}>↑</button><button type="button" data-td34-move="${i}:down" aria-label="${safe(q.title)} 아래로" ${i===selected.length-1?'disabled':''}>↓</button></li>`:'';}).join('')}</ol>${!selected.length?'<p>위에서 프린트에 담을 문항을 선택하세요.</p>':''}</div>`;
  }
  function basicTeacher(){
    const qs=resolve(studio)||[],c=api.config(),pages=api.sequence(c);
    creatorPage=Math.max(0,Math.min(creatorPage,pages.length-1));
    return `<section class="work-surface creator-surface td34-surface"><header class="td34-heading"><div><span class="td34-eyebrow">수업 준비 / 기출문항</span><h1>수업 프린트</h1><p>고르고, 다듬고, 바로 출력하세요.</p></div><div><button type="button" data-td34-exit>기존 자료</button><a href="#account">내 보관함 ↗</a></div></header><nav class="td34-steps" aria-label="자료 제작 순서"><span><b>1</b>문항 선택</span><i>→</i><span><b>2</b>지면 편집</span><i>→</i><span><b>3</b>보관 · 출력</span></nav><p class="td34-source-note">기존 디지털 원문 · 최신 검증 해설 · 공통 렌더 규칙</p><div class="creator-workspace td34-workspace"><aside class="creator-config td34-config"><div class="td34-selection">${questionChoices()}</div><section class="td34-settings"><h2>프린트 구성</h2><label class="creator-field">제목<input data-studio="title" maxlength="60" value="${safe(studio.title)}" placeholder="수업 프린트 제목"></label><div class="creator-two-fields"><label class="creator-field">형태<select data-studio="docType"><option value="print" ${studio.docType!=='book'?'selected':''}>수업 프린트</option><option value="book" ${studio.docType==='book'?'selected':''}>표지 있는 교재</option></select></label><label class="creator-field">한 쪽 문항 수<select data-studio="layout">${[1,2,4].map(n=>`<option value="${n}" ${Number(studio.layout)===n?'selected':''}>${n}문항</option>`).join('')}</select></label></div><a class="td34-design-link" href="#print-design">학원명 · 머리말 · 디자인 편집 <span>↗</span></a></section><div class="td34-actions"><button type="button" class="primary" data-td34-save ${busy||!qs.length||bank.canonical?'disabled':''}>${busy?'저장 중…':currentId?'수정 내용 저장':'계정에 보관'}</button><button type="button" class="secondary" data-print ${!qs.length?'disabled':''}>인쇄 / PDF</button><p data-td34-status role="status">${safe(notice())}</p>${currentId?'<button type="button" class="td34-copy" data-td34-copy>복사본으로 보관</button>':''}</div></aside><div class="creator-canvas td34-canvas"><div class="creator-canvas-toolbar"><div><strong>인쇄 미리보기</strong><span>${qs.length}문항 · ${pages.length}쪽</span></div><button data-preview-paper ${!qs.length?'disabled':''}>확대 ⤢</button></div><div class="creator-paper-stage"><div id="sheet" class="a4">${qs.length?sheet():'<div class="td34-empty-paper"><strong>첫 문항을 골라 주세요.</strong><p>선택한 순서대로 지면에 들어갑니다.</p></div>'}</div></div>${qs.length?creatorPager():''}<div class="td34-page-tabs">${pages.map((p,i)=>`<button type="button" data-creator-page="${i}" aria-pressed="${i===creatorPage}">${i+1} ${p.type==='cover'?'표지':p.type==='solutions'?'정답·해설':'문제'}</button>`).join('')}</div><div class="creator-canvas-footer"><span>A4 · 210 × 297 mm</span><span>정답·해설 2단</span></div></div></div><section class="td34-vault" data-td34-vault>${vault()}</section>${compactFooter()}</section>`;
  }
  teacher=function(){if(active())return basicTeacher();return originalTeacher().replace('<div class="creator-workspace"',`<div class="td34-entry"><div><strong>기출문항으로 프린트 만들기</strong><span>2027 수능 기본 기출 · 직접 골라 담기</span></div><button type="button" data-td34-start>문항 선택 ↗</button></div><div class="creator-workspace"`);};
  function vault(){
    const heading='<div class="td34-vault-heading"><div><h2>내 프린트 · 내 교재</h2><p>보관한 구성 그대로 다시 출력합니다.</p></div><button type="button" data-td34-list>목록 새로고침</button></div>';
    if(bank.canonical)return '<div class="td34-vault-empty">기존 디지털 문항을 연결한 출력 시안입니다. 계정 보관은 아직 연결 전입니다.</div>';
    if(!DSService.session())return heading+'<div class="td34-vault-empty">로그인하면 계정에 보관한 자료가 여기에 나타납니다. <a href="#login">로그인 ↗</a></div>';
    if(listState==='loading')return heading+'<p role="status">보관함을 불러오는 중…</p>';
    if(listState==='error')return heading+'<p class="td34-vault-empty">계정 보관함에 연결하지 못했습니다. <button type="button" data-td34-list>다시 연결</button></p>';
    if(!documents.length)return heading+'<p class="td34-vault-empty">아직 보관한 프린트가 없습니다. 문항을 선택해 첫 자료를 만들어 보세요.</p>';
    return heading+'<div class="td34-document-list">'+documents.map(d=>`<article><div class="td34-file" aria-hidden="true"><i></i><i></i><i></i></div><div><span>${d.docType==='book'?'내 교재':'프린트'} · ${d.questionCount}문항</span><h3>${safe(d.title)}</h3><small>${safe(d.unit)} · ${new Date(d.updatedAt).toLocaleDateString('ko-KR')}</small></div><div class="td34-file-actions"><button type="button" data-td34-open="${safe(d.id)}">열기 · 수정</button><button type="button" data-td34-reprint="${safe(d.id)}">다시 출력</button></div></article>`).join('')+'</div>';
  }
  accountPage=function(){const html=originalAccount();if(role!=='teacher')return html;const t=document.createElement('template');t.innerHTML=html;const target=t.content.querySelector('.account-surface,.account-v7,.member-surface,section');if(target){const section=document.createElement('section');section.className='td34-vault';section.dataset.td34Vault='';section.innerHTML=vault();const heading=target.querySelector('h1');if(heading?.parentElement?.parentElement===target)heading.parentElement.after(section);else target.prepend(section);}return t.innerHTML;};
  function refreshSlots(){for(const el of document.querySelectorAll('[data-td34-vault]'))el.innerHTML=vault();const note=document.querySelector('[data-td34-status]');if(note)note.textContent=notice();for(const b of document.querySelectorAll('[data-td34-save],[data-td34-copy]'))b.disabled=busy||!resolve(studio)?.length||!!bank.canonical;}
  async function list(force=false){await DSService.ready;if(bank.canonical||!DSService.session()||(!force&&['loading','ready'].includes(listState)))return;const ticket=epoch,sequence=++listSequence;listState='loading';refreshSlots();try{const r=await request({action:'list'});if(ticket!==epoch||sequence!==listSequence)return;documents=r.documents;listState='ready';}catch{if(ticket!==epoch||sequence!==listSequence)return;listState='error';}refreshSlots();}
  async function save(copy=false){
    if(bank.canonical||busy||!active()||!resolve(studio)?.length)return;
    if(!DSService.session()){window.DSLoginReturn='#teacher';status='로그인 후 이 구성으로 저장을 이어갑니다.';location.hash='#login';return;}
    const ticket=epoch,editorTicket=editorEpoch;busy=true;status='계정에 보관하는 중…';refreshSlots();
    const value=documentValue(copy||!currentId?crypto.randomUUID():currentId),expected=copy?0:currentVersion;
    const signature=JSON.stringify({...value,id:copy?'copy':currentId||'new'});
    if(pendingSave?.signature!==signature)pendingSave={signature,body:{action:'save',expectedVersion:expected,document:value}};
    try{const r=await request(pendingSave.body);if(ticket!==epoch)return;if(editorTicket===editorEpoch){currentId=r.document.id;currentVersion=r.document.version;loadedAccount=true;const d=r.document;baseline=JSON.stringify({id:d.id,title:d.title,docType:d.docType,layout:d.layout,printDesign:d.printDesign,printSettings:api.normalizeSettings(d.printSettings),itemRefs:d.itemRefs.map(x=>({...x})),subject:d.subject,unit:d.unit});status=fingerprint()===baseline?'계정에 보관했습니다. 다른 컴퓨터에서도 불러올 수 있습니다.':'저장하는 동안 변경한 내용이 있습니다. 수정 내용도 저장해 주세요.';}pendingSave=null;await list(true);}
    catch(e){if(ticket===epoch)status=errorText(e);}
    finally{if(ticket===epoch){busy=false;rerender();}}
  }
  async function openDocument(id,reprint=false){
    if(busy)return;
    if(active()&&currentId&&baseline&&fingerprint()!==baseline&&!confirm('저장하지 않은 수정 내용이 있습니다. 보관된 자료를 열까요?'))return;
    const ticket=epoch;busy=true;status='보관한 자료를 불러오는 중…';refreshSlots();
    try{const {document:d}=await request({action:'get',id});if(ticket!==epoch)return;
      const next={...d,source:'practice',itemSource:SOURCE};if(!resolve(next)?.length)throw Error('bank_unavailable');
      editorEpoch++;studio=next;currentId=d.id;currentVersion=d.version;loadedAccount=true;window.DSAccountDesignApplied=true;pendingSave=null;creatorPage=0;baseline=fingerprint();status='보관한 문항과 순서, 디자인을 불러왔습니다.';
      if(teacherRoute())rerender();else location.hash='#teacher';
      if(reprint)await api.printConfig(api.config());
    }catch(e){if(ticket===epoch){status=errorText(e);toast(status);}}
    finally{if(ticket===epoch){busy=false;refreshSlots();}}
  }
  document.addEventListener('click',e=>{
    const b=e.target.closest('[data-td34-start],[data-td34-exit],[data-td34-save],[data-td34-copy],[data-td34-move],[data-td34-list],[data-td34-open],[data-td34-reprint]');if(!b)return;
    if(b.hasAttribute('data-td34-start')){selectBasic();list();return;}
    if(b.hasAttribute('data-td34-exit')){editorEpoch++;studio={source:'materials',sku:studio.sku,layout:'2'};currentId='';currentVersion=0;loadedAccount=false;baseline='';pendingSave=null;status='';rerender();return;}
    if(b.hasAttribute('data-td34-save')){save();return;}
    if(b.hasAttribute('data-td34-copy')){save(true);return;}
    if(b.hasAttribute('data-td34-list')){list(true);return;}
    if(b.dataset.td34Open||b.dataset.td34Reprint){openDocument(b.dataset.td34Open||b.dataset.td34Reprint,!!b.dataset.td34Reprint);return;}
    if(b.dataset.td34Move){const [raw,direction]=b.dataset.td34Move.split(':'),i=Number(raw),j=i+(direction==='up'?-1:1),r=[...studio.itemRefs];if(i<0||j<0||i>=r.length||j>=r.length)return;[r[i],r[j]]=[r[j],r[i]];studio.itemRefs=r;status='';creatorPage=0;rerender(`[data-td34-move="${j}:${direction}"]`);}
  });
  document.addEventListener('change',e=>{const id=e.target.dataset?.td34Select;if(id){if(!byId.has(id))return;studio.itemRefs=e.target.checked?[...studio.itemRefs,{itemId:id,version:byId.get(id).version}]:studio.itemRefs.filter(x=>x.itemId!==id);studio.unit=[...new Set((resolve(studio)||[]).map(q=>q.unit))].join(' · ')||'기본 기출';creatorPage=0;status='';rerender(`[data-td34-select="${id}"]`);}else if(active()&&e.target.matches('[data-studio]')){status='';if(e.target.dataset.studio==='layout')rerender();else refreshSlots();}});
  function sessionReset(){epoch++;editorEpoch++;busy=false;documents=[];listState='idle';currentId='';currentVersion=0;pendingSave=null;baseline='';status='';if(loadedAccount){studio={source:'practice',itemSource:SOURCE,itemRefs:refs(),title:'수능 기본 기출',subject:'수학',unit:'기본 기출',layout:'4',docType:'print'};loadedAccount=false;if(teacherRoute())rerender();}refreshSlots();list();}
  window.addEventListener('ds-session-change',sessionReset);
  window.addEventListener('hashchange',()=>{if(['#account','#teacher','#studio'].includes(location.hash))list();});
  document.addEventListener('input',e=>{if(active()&&e.target.matches('[data-studio]')){if(e.target.dataset.studio==='title'){studio.title=e.target.value;updateSheet();}status='';refreshSlots();}});
  window.DSTeacherDocumentsV34={list,resolve,documentValue};
  if(new URLSearchParams(location.search).get('sample')==='basic'&&!active())selectBasic();
  DSService.ready.then(()=>{if(['#account','#teacher','#studio'].includes(location.hash))list();});
})();
