/* Public workbook study. Draw only on a study action. Keep the current set in this tab. */
(() => {
  'use strict';
  const esc = text => String(text ?? '').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  const numbers = '①②③④⑤';
  const intentKey = 'ds-public-workbook-study-save';
  const returnId = () => new URLSearchParams(location.search).get('workbookReview');
  const shape = q => q?.id && q.version && ['choice','integer'].includes(q.answerType);
  const validAnswer = (value, type) => Number.isSafeInteger(value) && (type === 'choice' ? value >= 0 && value <= 4 : Math.abs(value) <= 1e9);
  const papers = () => window.DSGuestWorkbook;
  function create({books, renderFrame, mathStyle, redraw, signed, owner, live, catalogChanged, wait}) {
    const catalogs = new Map(), typeCounts = new Map();
    let serial = 0, baseRange, range, history = [], at = -1, busy = false, message = '', end = false;
    let prepared = null;
    let scope = '', course = '', review, saving = false, saved = false, reviewError = '';
    let frameHost, frameItem, answerBox, answerState, explanation;
    try {
      const value = JSON.parse(sessionStorage.getItem(intentKey));
      if (value?.rid === returnId() && value.expiry > Date.now() && shape(value) &&
          (value.answer === null || validAnswer(value.answer,value.answerType))) review = value;
    } catch {}
    const availableBooks = () => books().filter(b => b.subject && Array.isArray(b.units) && b.units.length);
    async function catalog(subject, retry = false) {
      if (!subject || !papers()) return;
      const cached = catalogs.get(subject);
      if (cached && !(retry && cached.error)) return cached.task;
      const entry = {busy:true, rows:[]};
      catalogs.set(subject,entry);
      entry.task = wait('선택한 과목의 교재와 단원을 확인하고 있어요.',()=>papers().catalog({purpose:'study',subject})).then(value => {
        if (!Array.isArray(value?.questions)) throw Error('invalid_catalog');
        entry.rows = value.questions.filter(q => shape(q) && q.subject === subject && q.bookId);
      }).catch(() => {entry.error=true;}).finally(() => {entry.busy=false; if(live())catalogChanged();});
      return entry.task;
    }
    function typeCount(range,type,retry=false) {
      if(!type || !range?.types?.some(t=>t.id===type))return null;
      const query={...range.query,typeIds:[type]},key=JSON.stringify(query);
      let entry=typeCounts.get(key);
      if(entry && !(retry&&entry.error))return entry;
      entry={busy:true};typeCounts.set(key,entry);
      wait('선택한 유형의 문항 수를 확인하고 있어요.',()=>papers().catalog(query)).then(data=>{
        if(!Array.isArray(data?.questions))throw Error('invalid_catalog');
        entry.size=data.questions.length;
      }).catch(()=>{entry.error=true;}).finally(()=>{entry.busy=false;if(live())redraw();});
      return entry;
    }
    function ranges(subject, need) {
      const rows = catalogs.get(subject)?.rows || [];
      const byBook = new Map();
      for (const q of rows) {
        if (!byBook.has(q.bookId)) byBook.set(q.bookId,[]);
        byBook.get(q.bookId).push(q);
      }
      const result = [];
      for (const book of availableBooks().filter(b => b.subject === subject && byBook.has(b.id))) {
        if (need === 'concept' && !book.id.startsWith('OL-base-')) continue;
        if (need === 'advanced' && !book.id.startsWith('OL-advanced-')) continue;
        if (need === 'types' && !(book.id.startsWith('OL-type-') || book.id.startsWith('SSG-'))) continue;
        const rows=byBook.get(book.id),units=new Map(book.units.map(unit=>[unit.id,unit]));
        for(const row of rows)for(const id of row.unitIds?.length?row.unitIds:[row.unitId]){
          if(typeof id==='string'&&id&&!units.has(id))units.set(id,{id,label:id.replace(/^unmapped:/,''),types:[]});
        }
        for (const unit of units.values()) {
          const pool = rows.filter(q => (q.unitIds?.length?q.unitIds:[q.unitId]).includes(unit.id));
          if (!pool.length) continue;
          const typed = new Set(pool.flatMap(q => q.typeIds?.length?q.typeIds:[q.typeId]).filter(Boolean));
          result.push({id:'workbook:'+book.id+'/'+unit.id,label:unit.label,group:book.label,book:book.id,
            types:(unit.types||[]).filter(t => typed.has(t.id)), size:pool.length,
            query:{purpose:'study',subject,bookId:book.id,unitIds:[unit.id]}});
        }
      }
      return result;
    }
    function start(value, need, type) {
      cancel();
      baseRange = range = value;
      course = need;
      scope = value.group+' · '+value.label;
      if (type && value.types.some(t => t.id === type)) range = {...value,size:typeCount(value,type)?.size??value.size,query:{...value.query,typeIds:[type]}};
      void openNext();
    }
    function cancel() {
      serial++; busy=false; prepared=null; baseRange=range=null; history=[]; at=-1; message=''; end=false;
      frameHost=null;frameItem=null;answerBox=null;answerState='';explanation=null;
    }
    async function requestNext(query,seen,target) {
      const args={...query,count:1};
      if(target)args.questionIds=[target.id];
      else if (seen.length<=300) args.excludeIds=seen;
      else {
        const catalog=await papers().catalog(query);
        const used=new Set(seen),rest=catalog.questions.filter(q=>!used.has(q.id));
        if(!rest.length)return null;
        args.questionIds=[rest[Math.floor(Math.random()*rest.length)].id];
      }
      try {
        const value=await papers().draw(args);
        if(!Array.isArray(value?.questions))throw Error('invalid_draw');
        const q=value.questions[0];
        if(!q)return null;
        if (!shape(q) || !validAnswer(q.answer,q.answerType) || !q.questionHTML || !q.solutionHTML ||
            seen.includes(q.id) || (target && (q.id!==target.id||q.version!==target.version))) throw Error('invalid_draw');
        return q;
      } catch(error) {
        if(error?.code==='insufficient_items')return null;
        throw error;
      }
    }
    function prepareNext() {
      if(!range || end || at+1<history.length || signed() || prepared)return;
      const seen=history.map(row=>row.q.id);
      // This public draw is explicitly non-metered. An early answer/solution view starts
      // one next question while the student reads. A navigation consumes that same promise.
      const task=requestNext(range.query,seen).then(q=>({q}),error=>({error}));
      prepared={task};
    }
    async function related(item) {
      const api=window.DSStudentReviewVariants;
      if(!api || (item.choice===item.q.answer&&!item.hint))return;
      const record={questionId:item.q.id,version:item.q.version,correct:item.choice===item.q.answer,help:item.hint||item.choice===null};
      const generation=serial;
      try{
        if(api.needsRegistered(record))await api.loadRegistered();
        if(!live()||generation!==serial||!item.checked)return;
        const pool=await papers().catalog(range.query);
        if(!live()||generation!==serial||!item.checked)return;
        const eligible=new Map(pool.questions.map(q=>[q.id,q.version]));
        const target=api.next(record,[],[...eligible.keys()]);
        item.related=target && eligible.get(target.id)===target.version ? target : null;
        item.relatedError=false;
      }catch{if(generation===serial)item.relatedError=true;}
      if(live()&&generation===serial)redraw();
    }
    async function openNext(target=null) {
      if (!range || busy || signed()) return;
      if(target){
        const previous=history.findIndex(row=>row.q.id===target.id);
        if(previous>=0){at=previous;message='';redraw();return;}
      }else{
        if (at+1<history.length) {at++;message='';redraw();return;}
        if(end)return;
      }
      const generation=serial;
      busy=true; message=''; redraw();
      try {
        if(target){
          const task=requestNext(range.query,history.map(row=>row.q.id),target).then(q=>({q}),error=>({error}));
          prepared={task};
        }else prepareNext();
        const label=target?'비슷한 문제를 불러오고 있어요.':at>=0?'다음 문항을 불러오고 있어요.':'선택한 단원의 첫 문항을 불러오고 있어요.';
        const [result,style] = await wait(label,()=>Promise.all([prepared.task,mathStyle()]));
        if (!live() || generation!==serial || signed()) return;
        if(result.error){prepared=null;throw result.error;}
        const q=result.q;
        if (!q) {end=true;prepared=null;return;}
        history.push({q,question:renderFrame(style+q.questionHTML,'교재 문제'),style,
          choice:null,checked:false,hint:false,revealed:false,opened:Date.now()});
        at=history.length-1;prepared=null;end=history.length>=range.size;
      } catch(error) {
        if(generation===serial)message=error?.status===429?'잠시 후 다음 문항을 다시 불러와 주세요.':'문항을 불러오지 못했어요. 다시 불러와 주세요.';
      } finally {if(live() && generation===serial){busy=false;redraw();}}
    }
    function confirmAnswer(button, item, skip) {
      const input=button.closest('.ssp-paper')?.querySelector('[data-workbook-integer]');
      if(!skip && input) {
        const value=input.value.trim(), actual=Number(value);
        if(!/^-?\d+$/.test(value)||!validAnswer(actual,'integer')){input.setCustomValidity('−10억부터 10억까지의 정수를 입력해 주세요.');input.reportValidity();input.setCustomValidity('');input.focus();return;}
        item.choice=actual;
      }
      if(!skip && item.choice===null){message='답을 먼저 선택해 주세요.';redraw();return;}
      if(skip)item.choice=null;
      item.checked=true;item.revealed=skip;message='';redraw();void related(item);if(at+1<range.size)prepareNext();
    }
    function login(item) {
      const q=item.q, rid=crypto.randomUUID(), next='/app/?studentMode=study&workbookReview='+rid+'#student';
      try {
        sessionStorage.setItem(intentKey,JSON.stringify({rid,id:q.id,version:q.version,answerType:q.answerType,
          answer:item.choice,course,scope,help:item.hint||item.revealed,seconds:Math.min(86400,Math.max(0,Math.round((Date.now()-item.opened)/1000))),expiry:Date.now()+900000}));
      } catch {message='로그인 뒤 이 풀이를 연결할 수 있도록 브라우저의 임시 저장을 허용해 주세요.';redraw();return;}
      location.assign('/auth/?next='+encodeURIComponent(next));
    }
    async function saveReview() {
      if(!review||saved||saving||!signed()||!owner())return;
      const id=owner(), value=review;
      saving=true;reviewError='';redraw();
      try {
        const res=await wait('이 계정에 풀이 기록을 저장하고 있어요.',()=>window.DSStudentServices.submit({questionId:value.id,version:value.version,purpose:'study_free',
          answer:value.answer,course:value.course,confidence:value.answer===null?'unsure':'sure',help:value.help,seconds:value.seconds,requestId:value.rid}));
        if(!live()||owner()!==id||review!==value)return;
        if(res?.record?.questionId!==value.id||res.record.version!==value.version)throw Error('invalid_record');
        saved=true;sessionStorage.removeItem(intentKey);
        window.dispatchEvent(new CustomEvent('ds-student-free-record',{detail:{record:res.record}}));
      } catch {if(live()&&owner()===id)reviewError='이 풀이를 저장하지 못했어요. 같은 시도로 다시 확인할 수 있어요.';}
      finally {if(live()&&owner()===id){saving=false;redraw();}}
    }
    function click(button) {
      const action=button.dataset.workbookAction;
      if (!action) return false;
      const item=history[at];
      if(action==='confirm'){void saveReview();return true;}
      if(action==='dismiss'){if(!saving){review=null;sessionStorage.removeItem(intentKey);redraw();}return true;}
      if(action==='next'){void openNext();return true;}
      if(action==='type'&&!busy&&range){
        const type=button.dataset.workbookType;
        if(baseRange.types.some(t=>t.id===type))start(baseRange,course,type);
        return true;
      }
      if(action==='related'&&item?.related){void openNext(item.related);return true;}
      if(action==='related-retry'&&item?.checked){void related(item);return true;}
      if(action==='previous'&&!busy&&at>0){at--;message='';redraw();return true;}
      if(!item||busy)return true;
      if(action==='hint'){item.hint=!item.hint;redraw();}
      if(action==='check'||action==='skip')confirmAnswer(button,item,action==='skip');
      if(action==='solution'){item.revealed=!item.revealed;redraw();}
      if(action==='retry'){item.related=null;item.relatedError=false;item.choice=null;item.checked=false;item.revealed=false;item.hint=false;message='';redraw();}
      if(action==='save')login(item);
      return true;
    }
    function change(input) {
      const item=history[at];
      if(input.name!=='workbook-study-choice'||!item||item.checked||busy)return false;
      const answer=Number(input.value);
      if(validAnswer(answer,'choice')){item.choice=answer;message='';redraw();}
      return true;
    }
    const shell='<article class="ssp-paper"><div class="ssp-paper-top"><span data-wb-scope></span><span data-wb-number></span></div><h2 tabindex="-1">교재 문제 풀기</h2><p data-wb-status role="status"></p><div class="ssp-prompt" data-wb-prompt></div><div data-wb-answer></div><div data-wb-feedback hidden></div><section class="ssp-solution" data-wb-solution hidden></section><nav class="ssp-actions" data-wb-nav aria-label="문항 이동"></nav></article>';
    function syncFrameChoices(frame,item,box) {
      if(item!==history[at]||!frame.isConnected||item.q.answerType!=='choice')return;
      const doc=frame.contentDocument;
      if(doc?.URL!=='about:srcdoc'||!doc.body||!window.DSTimedExam?.prepareChoices)return;
      if(!doc.querySelector('.dte-source-choices')&&!doc.body.hasAttribute('data-study-choices-checked')){
        doc.body.setAttribute('data-study-choices-checked','');
        window.DSTimedExam.prepareChoices({root:doc.body,id:item.q.id,value:item.choice,choose:button=>{
          if(!live()||history[at]!==item||item.checked||busy)return;
          const answer=Number(button.dataset.examChoice);
          if(validAnswer(answer,'choice')){item.choice=answer;message='';redraw();}
        }});
      }
      const buttons=doc.querySelectorAll('[data-exam-choice]');
      if(buttons.length===5) {
        const group=box.querySelector('.ssp-options');if(group)group.hidden=true;
        for(const button of buttons){button.disabled=item.checked||busy;button.setAttribute('aria-pressed',String(item.choice===Number(button.dataset.examChoice)));}
      }else doc.querySelector('.dte-choice-issue')?.remove(); // The accessible numbered answer group remains available.
    }
    function paint(body){
      const item=history[at], q=item?.q, node=s=>body.querySelector('[data-wb-'+s+']');
      node('scope').textContent=scope;node('number').textContent=item?(at+1)+'번':'';
      const status=node('status');
      status.textContent=busy?'선택한 범위에서 문제를 불러오고 있어요.':message||(end&&at+1===history.length?'이 범위의 문항을 모두 확인했어요.':'');status.hidden=!status.textContent;
      const prompt=node('prompt'), box=node('answer');
      const replaced=frameHost!==prompt||frameItem!==item;
      if(replaced){
        prompt.innerHTML=item?.question||'';frameHost=prompt;frameItem=item;answerState='';answerBox=null;explanation=null;
      }
      const state=JSON.stringify([q?.id,item?.checked,item?.hint,item?.revealed,busy]);
      if(answerBox!==box||answerState!==state){
        const draft=box.querySelector('[data-workbook-integer]')?.value;
        const same=answerBox===box&&answerState && JSON.parse(answerState)[0]===q?.id;
        answerState=state;answerBox=box;
        box.innerHTML=!item?'':`<fieldset class="${q.answerType==='choice'?'ssp-options':'ssp-integer-answer'}" aria-label="답안" ${item.checked||busy?'disabled':''}>${q.answerType==='choice'?[...numbers].map((n,i)=>`<label><input type="radio" name="workbook-study-choice" value="${i}" ${item.choice===i?'checked':''}><span class="ssp-option-no">${n}</span></label>`).join(''):'<label>정수 답안 <input data-workbook-integer type="text" enterkeyhint="done" autocomplete="off" aria-label="정수 답안"></label>'}</fieldset>
        ${!item.checked?`<div class="ssp-actions"><button class="ssp-primary" data-workbook-action="check">답 제출</button><button data-workbook-action="hint">첫 힌트 ${item.hint?'접기':'보기'}</button><button data-workbook-action="skip">모르겠어요 · 해설 보기</button></div>`:''}
        ${item.hint?'<p class="ssp-note">주어진 조건과 구할 값을 표시하고, 둘을 연결하는 식을 세워 보세요.</p>':''}`;
        const field=box.querySelector('[data-workbook-integer]');
        if(field)field.value=item.choice??(same?draft:'')??'';
      }
      const frame=prompt.querySelector('iframe');
      if(frame&&item?.q.answerType==='choice'){
        if(replaced)frame.addEventListener('load',()=>syncFrameChoices(frame,item,box),{once:true});
        syncFrameChoices(frame,item,box);
      }
      const feedback=node('feedback');feedback.hidden=!item?.checked;feedback.classList.toggle('ssp-feedback',Boolean(item?.checked));
      const response=item?.checked?`<h3 tabindex="-1">${item.choice===null?'함께 풀이를 확인해 봐요.':item.choice===q.answer?'맞았어요.':'답을 다시 살펴볼까요?'}</h3><p>정답은 ${q.answerType==='choice'?numbers[q.answer]+'번':q.answer}이에요.</p>
        <div class="ssp-actions"><button data-workbook-action="solution" aria-expanded="${item.revealed}">해설 ${item.revealed?'접기':'보기'}</button><button data-workbook-action="retry">다시 풀기</button>${item.related?'<button data-workbook-action="related">비슷한 문제 풀기</button>':item.relatedError?'<button data-workbook-action="related-retry">비슷한 문제 다시 확인</button>':''}<button data-workbook-action="save">로그인하고 풀이 저장</button></div>`:'';
      if(feedback.dataset.paint!==response){feedback.innerHTML=response;feedback.dataset.paint=response;}
      const solution=node('solution');solution.hidden=!item?.revealed;
      if(item?.revealed&&explanation!==item){solution.innerHTML=renderFrame(item.style+q.solutionHTML,'교재 해설');explanation=item;}
      const types=baseRange?.types||[];
      const index=types.findIndex(t=>t.id===(range.query.typeIds?.[0]||q?.typeId));
      const typeStep=(offset,label)=>{const t=types[index+offset];return '<button data-workbook-action="type" data-workbook-type="'+esc(t?.id)+'" '+(!t||busy?'disabled':'')+'>'+label+'</button>';};
      const typeNav=course==='types'&&types.length>1&&index>=0?typeStep(-1,'← 이전 유형')+typeStep(1,'다음 유형 →'):'';
      const nav=node('nav'),actions=`${at>0?'<button data-workbook-action="previous">이전 문항</button>':''}${!busy&&(!end||at+1<history.length)?`<button data-workbook-action="next">${message?'다시 불러오기':'다음 문항'}</button>`:''}${typeNav}<button data-ssp-choose-range>다른 단원 고르기</button>`;
      if(nav.dataset.paint!==actions){nav.innerHTML=actions;nav.dataset.paint=actions;}
    }
    function reviewHTML(){
      return `<article class="ssp-paper"><h2>로그인 전에 푼 문항</h2><p>${esc(review.scope)}</p><p>내 답안 · ${review.answer===null?'모르겠어요':review.answerType==='choice'?numbers[review.answer]+'번':esc(review.answer)}</p><p role="status">${saved?'계정에 풀이를 저장했어요.':esc(reviewError)}</p><div class="ssp-actions">${saved?'':`<button class="ssp-primary" data-workbook-action="confirm" ${saving||!owner()?'disabled':''}>${saving?'저장하는 중…':'이 계정에 풀이 저장'}</button>`}<button data-workbook-action="dismiss" ${saving?'disabled':''}>공부로 돌아가기</button></div></article>`;
    }
    return {catalog,availableBooks,ranges,typeCount,phase:subject=>catalogs.get(subject),start,cancel,paint,shell,click,change,
      reviewing:()=>Boolean(review&&signed()),reviewHTML};
  }
  window.DSGuestWorkbookStudy=Object.freeze({create});
})();
