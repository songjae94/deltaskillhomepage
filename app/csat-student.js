/* The CSAT desk shares the student's paper, option layout and timed test engine. */
(() => {
  'use strict';
  const publicBank = new Map((window.DSBasicExamV34?.questions || []).map(q => [q.id,q]));
  const tabs = {study:'공부하기',downloads:'자료받기',create:'자료만들기',mock:'모의고사'};
  const icons = ['M3 5h6q3 0 3 3 0-3 3-3h6v14h-6q-3 0-3 2 0-2-3-2H3zM12 8v13','M12 3v12m-5-5 5 5 5-5M4 16v5h16v-5','M7 3h10v5H7zM6 17H4V9h16v8h-2M7 14h10v7H7z','M9 2h6m-3 0v3M12 9v5l3 1M20 14a8 8 0 1 1-16 0 8 8 0 0 1 16 0'];
  const area = document.getElementById('content');
  const signed = () => Boolean(window.DSService?.session());
  const service = () => window.DSStudentServices;
  const escape = v => String(v ?? '').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const option = (key,text,chosen) => '<option value="'+escape(key)+'"'+(String(key)===String(chosen)?' selected':'')+'>'+escape(text)+'</option>';
  const date = value => new Intl.DateTimeFormat('ko-KR',{month:'long',day:'numeric',timeZone:'Asia/Seoul'}).format(new Date(value));
  const active = () => location.hash==='#csat';
  const tab = () => {const value=new URLSearchParams(location.search).get('csatMode');return Object.hasOwn(tabs,value)?value:'study';};
  const fixtureId = 'SNG-2024-M11#공통#1';
  let goal='',unit='',index=0,choice=null,feedback=null,notice='',opened=Date.now(),pendingSubmission=null,busy=false,ownerEpoch=0;
  let recordCache=null,recordsOpen=false,historyLoading=false,historyError=false;
  let studyRows=null,studyRequest=null,studyError=false;
  let pendingQuestion=new URLSearchParams(location.search).get('csatItem');
  let mockCount=15,mockRows=null,mockRequest=null,mockError=false;

  function items(){
    const rows=(signed()&&studyRows ? studyRows : [...publicBank.values()]).filter(q=>!unit||q.unit===unit);
    if(!unit && !goal)rows.sort((a,b)=>Number(b.id===fixtureId)-Number(a.id===fixtureId));
    if(goal)rows.sort((a,b)=>goal<=3?b.points-a.points:a.points-b.points);
    return rows;
  }
  async function loadStudy(){
    if(!signed()||studyRows||studyRequest||studyError)return;
    const epoch=ownerEpoch;
    studyRequest=(async()=>{
      try{
        const result=await service().catalog({purpose:'study_free',sourceKind:'existing_public'});
        if(epoch!==ownerEpoch)return;
        const allowed=new Map(result.questions.map(q=>[q.id,q.version]));
        studyRows=[...publicBank.values()].filter(q=>allowed.get(q.id)===q.version);
        applyRequestedQuestion();
      }catch{if(epoch===ownerEpoch)studyError=true;}
      finally{if(epoch===ownerEpoch){studyRequest=null;if(active()&&tab()==='study')paint();}}
    })();
  }
  const current=()=>items()[index];
  function resetAnswer(){choice=null;feedback=null;notice='';opened=Date.now();pendingSubmission=null;}
  function nav(){
    return '<div class="dsh-navigation"><nav class="tb36-modes dsh-tabs" aria-label="수능 공부 메뉴">'+Object.entries(tabs).map(([id,label],i)=>'<button type="button" data-csat-tab="'+id+'" aria-pressed="'+(tab()===id)+'"><span class="tb36-mode-icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="'+icons[i]+'"/></svg></span><strong>'+label+'</strong></button>').join('')+'</nav></div>';
  }
  function paper(q,solution=false){
    const path=q?.[solution?'solutionFrame':'questionFrame'];
    if(!path)return '';
    const url=new URL(path,document.baseURI);
    if(url.origin!==location.origin||!url.pathname.startsWith('/app/assets/canonical-exam-v36/'))return '';
    return '<iframe class="csat-frame" data-csat-frame="'+(solution?'solution':'question')+'" data-id="'+escape(q.id)+'" src="'+escape(url.href)+'" title="'+escape(q.short+(solution?' 해설':' 문제'))+'"></iframe>';
  }
  function desk(){
    const rows=items(),q=rows[index];
    if(!q)return '<p role="status">현재 계정에서 풀 수 있는 수능 기출이 아직 없습니다.</p>';
    const units=[...new Set((signed()&&studyRows?studyRows:[...publicBank.values()]).map(q=>q.unit))];
    const status=feedback ? '<div class="ssp-hint" role="status"><strong>'+(feedback.correct?'정답이에요':'다시 풀어볼 문제예요')+'</strong><p>내 답 '+(choice+1)+'번 · 정답 '+(feedback.answer+1)+'번</p>'+paper(q,true)+'</div>' : '';
    const controls=pendingSubmission?'<div class="csat-check"><button class="ssp-primary" data-csat-grade="retry">풀이 기록 다시 저장</button></div>':studyError?'<button data-csat-study-reload>문항 연결 다시 확인</button>':'<div class="csat-check"'+(choice===null?' hidden':'')+'><button class="ssp-primary" data-csat-grade="sure">확신해요 · 채점</button><button data-csat-grade="unsure">헷갈려요 · 채점</button></div>';
    return '<section class="ssp ssp-desk sl54-shell student-signed-in csat-desk"><header class="ssil-heading"><h1>수능 공부</h1><a href="#account" data-csat-account>내 수능 기록 ↗</a></header><div class="ssil-main"><div class="ssil-today ssil-live-paper ssp-body"><article class="ssp-paper"><div class="ssp-paper-top"><span>'+escape(q.short)+' · '+escape(q.points)+'점</span><span>'+(index+1)+' / '+rows.length+'</span></div><h2 class="ssp-problem-heading">'+escape(q.unit)+'</h2>'+paper(q)+(feedback?status:controls)+'<div class="csat-pager"><button data-csat-move="-1" '+(!index||busy?'disabled':'')+'>‹ 이전 문제</button><button data-csat-move="1" '+(index===rows.length-1||busy?'disabled':'')+'>다음 문제 ›</button></div></article></div><aside class="ssil-review ssp-desk-controls csat-settings"><div><label>목표 등급<select data-csat-goal>'+option('','등급 선택',goal)+Array.from({length:9},(_,i)=>option(i+1,i+1+'등급',goal)).join('')+'</select></label><label>단원<select data-csat-unit>'+option('','전체 단원',unit)+units.map(v=>option(v,v,unit)).join('')+'</select></label></div><a href="#account" data-csat-account>내 수능 공부 기록 →</a></aside></div><p role="status" class="ssp-live">'+escape(notice)+'</p></section>';
  }
  function page(){
    let body;
    switch(tab()){
      case 'downloads': body=window.DSCSATMaterials?.render()||'';break;
      case 'create': body=window.DSCSATPrint?.render()||'';break;
      case 'mock': body=window.DSCSATTimed?.render()||'';break;
      default: body=desk();
    }
    return '<div class="dsh csat-student">'+nav()+body+'</div>';
  }
  function paint(){if(!active())return;area.innerHTML=page();mount();}
  function applyRequestedQuestion(){
    if(!pendingQuestion)return;
    const i=items().findIndex(q=>q.id===pendingQuestion);if(i!==-1){index=i;resetAnswer();}
    pendingQuestion=null;
  }
  function go(id,params={}){
    const url=new URL(location.href);url.hash='csat';url.searchParams.set('csatMode',id);
    for(const key of ['csatItem','csatSet']){url.searchParams.delete(key);if(params[key])url.searchParams.set(key,params[key]);}
    if(!active()){location.assign(url.href);return;}
    history.pushState(null,'',url);paint();
  }
  function fit(frame){
    const doc=frame.contentDocument;if(!doc?.body||doc.URL==='about:blank')return;
    const update=()=>{if(frame.isConnected)frame.style.height=Math.ceil(doc.body.getBoundingClientRect().height+parseFloat(getComputedStyle(doc.body).marginTop||0)+parseFloat(getComputedStyle(doc.body).marginBottom||0)+4)+'px';};
    update();
    const observer=new ResizeObserver(()=>{if(frame.isConnected)update();else observer.disconnect();});
    observer.observe(doc.body);doc.fonts?.ready.then(update);
  }
  document.addEventListener('load',e=>{
    const frame=e.target;if(!frame?.matches?.('[data-csat-frame]'))return;
    const q=publicBank.get(frame.dataset.id),doc=frame.contentDocument;
    if(tab()==='study'&&frame.dataset.csatFrame==='question'&&q&&doc?.body){
      window.DSTimedExam.prepareChoices({root:doc.body,id:q.id,value:choice,choose:button=>{
        if(!frame.isConnected||current()?.id!==q.id||feedback||busy||pendingSubmission||(signed()&&!studyRows))return;
        choice=Number(button.dataset.examChoice);
        for(const b of doc.querySelectorAll('[data-exam-choice]'))b.setAttribute('aria-pressed',String(b===button));
        const controls=area.querySelector('.csat-check');if(controls)controls.hidden=false;
      }});
      if(feedback||pendingSubmission)for(const b of doc.querySelectorAll('[data-exam-choice]'))b.disabled=true;
    }
    fit(frame);
  },true);
  async function submit(confidence){
    const q=current();if(!q||choice===null||feedback||busy||(signed()&&!studyRows))return;
    const epoch=ownerEpoch;busy=true;
    const controls=area.querySelector('.csat-check');controls?.querySelectorAll('button').forEach(b=>b.disabled=true);
    try{
      if(signed()){
        pendingSubmission ||= {questionId:q.id,version:q.version,answer:choice,course:'advanced',confidence,help:false,seconds:Math.min(86400,Math.max(0,Math.round((Date.now()-opened)/1000))),requestId:crypto.randomUUID()};
        const result=await service().submit(pendingSubmission);
        if(epoch!==ownerEpoch)return;
        feedback={correct:result.record.correct,answer:result.answer};pendingSubmission=null;recordCache=null;
      }else{feedback={correct:q.answer===choice,answer:q.answer};notice='로그인하면 다음 풀이부터 마이페이지에 기록됩니다.';}
    }catch{if(epoch===ownerEpoch)notice='풀이 기록을 저장하지 못했어요. 같은 답으로 다시 확인해 주세요.';}
    finally{if(epoch===ownerEpoch){busy=false;paint();}}
  }

  // A subject match alone would admit school workbooks. Only a registered exam source can enter a mock.
  function examSource(q){
    return q?.sourceKind==='csat_mock'||(q?.sourceKind==='existing_public' &&
      (publicBank.get(q.id)?.version===q.version||/^(SNG-|SN\d{2}[#-]|MP\d{2}[_-])/.test(q.id)));
  }
  async function loadMocks(){
    if(!signed()||mockRows||mockRequest)return mockRequest;
    const epoch=ownerEpoch;
    mockRequest=(async()=>{
      try{
        const responses=await Promise.all(['existing_public','csat_mock'].map(sourceKind=>service().catalog({purpose:'timeattack',sourceKind})));
        if(epoch!==ownerEpoch)return;
        mockRows=[...new Map(responses.flatMap(x=>x.questions).filter(examSource).map(q=>[q.id,q])).values()];mockError=false;
      }catch{if(epoch===ownerEpoch)mockError=true;}
      finally{if(epoch===ownerEpoch){mockRequest=null;if(active()&&tab()==='mock')window.DSCSATTimed?.refresh();}}
    })();return mockRequest;
  }
  function mockSetup(){
    const signedIn=signed(),available=mockRows?.length;
    const enabled=signedIn&&available>=mockCount;
    return '<div class="ta-top-v18"><h1>수능 모의고사</h1></div><div class="ta-layout-v18 dst-layout"><div class="ta-main-v18"><article class="quick-paper ta-question-v18 sl54-paper-preview dst-sheet"><div class="paper-heading"><span>공개 기출 미리보기</span></div>'+paper(publicBank.get(fixtureId),'')+'</article></div><aside class="dst-panel sl54-unit-side dst-config"><h2>시험 선택</h2><label>시험 구성<select data-csat-mock-size>'+option(15,'미니 모의고사 · 15문항 · 50분',mockCount)+option(30,'실전 모의고사 · 30문항 · 100분',mockCount)+'</select></label>'+(signedIn?(enabled?'<button class="dst-start" data-time-action="quote">시험 시작</button>':mockError?'<button data-csat-mock-reload>문항 다시 확인</button>':'<p role="status">'+(available===undefined?'출제 가능한 문항을 확인하고 있어요.':available+' / '+mockCount+'문항 준비 · 등록 후 시작할 수 있어요.')+'</p>'):'<a href="#login">로그인하고 시험 선택하기 →</a>')+'</aside></div>';
  }
  async function mockSelection(){
    await loadMocks();const rows=[...(mockRows||[])];if(rows.length<mockCount)return [];
    for(let i=rows.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[rows[i],rows[j]]=[rows[j],rows[i]];}
    return rows.slice(0,mockCount);
  }
  function isMockSet(set){
    if(!set)return false;
    const rows=set.questions||[], ids=set.questionIds||rows.map(q=>q.id);
    return ((ids.length===15&&set.durationSeconds===3000)||(ids.length===30&&set.durationSeconds===6000)) &&
      ids.every((id,i)=>publicBank.has(id)||examSource(rows[i])||mockRows?.some(q=>q.id===id));
  }
  function mount(){
    if(!active())return;
    if(tab()==='create'){
      const wrapper=area.querySelector('.csat-student');
      if(wrapper && !wrapper.dataset.printMounted && window.DSCSATPrint){wrapper.dataset.printMounted='1';window.DSCSATPrint.mount?.(wrapper);}
    }
    if(tab()==='study'){if(!signed())applyRequestedQuestion();void loadStudy();}
    const url=new URL(location.href),saved=url.searchParams.get('csatSet');
    if(tab()==='mock'&&saved&&signed()){
      url.searchParams.delete('csatSet');history.replaceState(history.state,'',url);
      if(/^[0-9a-f-]{36}$/i.test(saved))void window.DSCSATTimed.openSaved(saved);
    }
    if(tab()==='mock'&&!mockRows&&!mockError)void loadMocks();
  }
  document.addEventListener('change',e=>{
    if(!active()||busy)return;
    if(e.target.hasAttribute('data-csat-goal'))goal=e.target.value;
    else if(e.target.hasAttribute('data-csat-unit'))unit=e.target.value;
    else if(e.target.hasAttribute('data-csat-mock-size')){mockCount=e.target.value==='30'?30:15;window.DSCSATTimed.refresh();return;}
    else return;
    index=0;resetAnswer();paint();
  });
  document.addEventListener('click',async e=>{
    const button=e.target.closest('button,a');if(!button)return;
    if(button.hasAttribute('data-csat-account')){recordsOpen=true;return;}
    if(button.hasAttribute('data-csat-tab')){if(!busy)go(button.dataset.csatTab);return;}
    if(button.hasAttribute('data-csat-move')&&!busy){index=Math.max(0,Math.min(items().length-1,index+Number(button.dataset.csatMove)));resetAnswer();paint();return;}
    if(button.hasAttribute('data-csat-study-reload')){studyError=false;void loadStudy();return;}
    if(button.hasAttribute('data-csat-grade')){void submit(button.dataset.csatGrade);return;}
    if(button.hasAttribute('data-csat-mock-reload')){mockError=false;void loadMocks();return;}
    if(button.hasAttribute('data-csat-history')){recordsOpen=true;void loadHistory();return;}
    if(button.hasAttribute('data-csat-redo')){
      const id=button.dataset.csatRedo;unit='';pendingQuestion=id;applyRequestedQuestion();go('study',{csatItem:id});return;
    }
    if(button.hasAttribute('data-csat-result'))go('mock',{csatSet:button.dataset.csatResult});
  });
  function account(){
    if(location.hash!=='#account'||!signed())return;
    const host=area.querySelector('.student-account-signed-in');if(!host)return;
    let section=host.querySelector('[data-csat-records]');
    if(!section){section=document.createElement('section');section.className='csat-records';section.dataset.csatRecords='';section.innerHTML='<h2>내 수능 기록</h2><button data-csat-history>수능 공부와 모의고사 기록 보기</button><div aria-live="polite"></div>';host.append(section);}
    if(!recordsOpen)return;
    const list=section.querySelector('div');let content;
    if(recordCache){
      content='<h3>기출 공부</h3>'+(recordCache.free.map(r=>'<button data-csat-redo="'+escape(r.questionId)+'">'+escape(publicBank.get(r.questionId)?.short||r.unit)+' · '+(r.correct?'정답':'다시 풀기')+' · '+date(r.at)+'</button>').join('')||'<p>아직 푼 수능 문항이 없어요.</p>')+'<h3>모의고사</h3>'+(recordCache.sets.map(s=>'<button data-csat-result="'+escape(s.setId)+'">'+date(s.at)+' · '+s.total+'문항 · '+(s.status==='running'?'이어 풀기':'결과 보기')+'</button>').join('')||'<p>아직 시작한 수능 모의고사가 없어요.</p>');
    }else if(historyError)content='<p>기록을 불러오지 못했어요. 다시 확인해 주세요.</p>';
    else{content='<p>기록을 불러오고 있어요.</p>';if(!historyLoading)void loadHistory();}
    // This account surface is hydrated by the shared dashboard observer.
    if(list.dataset.content!==content){list.innerHTML=content;list.dataset.content=content;}
  }
  async function loadHistory(){
    if(historyLoading||!signed())return;
    const epoch=ownerEpoch;historyLoading=true;historyError=false;
    try{
      const free=[],sets=[];
      for(const kind of ['free','timeattack']){
        let before;do{
          const page=await service().history({kind,limit:50,before});if(epoch!==ownerEpoch)return;
          if(kind==='free')free.push(...page.records.filter(r=>publicBank.has(r.questionId)));
          else for(const r of page.records.filter(r=>r.total===15||r.total===30)){
            const d=await service().read({setId:r.setId});if(isMockSet(d.set||d))sets.push(r);
          }
          before=page.hasMore?page.nextBefore:null;
        }while(before && epoch===ownerEpoch);
      }
      if(epoch===ownerEpoch)recordCache={free,sets};
    }catch{if(epoch===ownerEpoch)historyError=true;}
    finally{if(epoch===ownerEpoch){historyLoading=false;account();}}
  }
  window.addEventListener('ds-session-change',()=>{
    ownerEpoch++;goal='';unit='';index=0;resetAnswer();busy=false;recordsOpen=false;historyLoading=false;historyError=false;recordCache=null;studyRows=null;studyError=false;studyRequest=null;mockRows=null;mockRequest=null;mockError=false;paint();
  });
  window.DSCSATStudent={mockSetup,mockSelection,isMockSet};
  csatPage=page;
  const observer=new MutationObserver(()=>{
    if(active()){
      if(area.querySelector('.csat-student'))mount();
    }else if(location.hash==='#account')account();
  });
  observer.observe(area,{childList:true,subtree:true});
  window.addEventListener('hashchange',()=>{if(active())paint();else if(location.hash==='#account')account();});
  window.addEventListener('popstate',()=>{if(active())paint();});
  window.addEventListener('ds-session-ready',()=>{if(active())paint();});
  paint();account();
})();
