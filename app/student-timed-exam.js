/* Shared question desk for the free exam and the member's timed sets. */
(() => {
  'use strict';

  function prepareChoices({root,id,value,options=[],math,choose}) {
      const doc=root.ownerDocument;
      window.DSStudentFragment?.applyTypography(doc);
      const optionCount=options.length||5;
      const excludes='li,table,.bogi,.cond,.cond-box,.condition,.conditions,.katex,[data-condition]';
      const lists=[...root.querySelectorAll('ol,ul')].filter(el=>
        !el.closest(excludes) && el.children.length===optionCount &&
        [...el.children].every(child=>child.localName==='li' && !/^[(（]?[ㄱ-ㅎ가나다라마바사][.)）]/.test(child.textContent.trim())));
      const explicit=lists.filter(el=>el.matches('.ch,.ch1,.ch2,.ch3,.ch5,.dq59-choices,.choices,[data-choices]'));
      // An unlabelled list is safe only when it ends the problem. Earlier lists may be conditions.
      const trailing=lists.filter(el=>{
        const tail=doc.createRange();tail.selectNodeContents(root);tail.setStartAfter(el);
        const remainder=tail.cloneContents();remainder.querySelectorAll('style,script').forEach(n=>n.remove());
        return !remainder.textContent.trim() && !remainder.querySelector('img,svg,math,table');
      });
      let list=explicit.length===1?explicit[0]:trailing.length===1?trailing[0]:null;
      let rows=list ? [...list.children] : [];
      const numbers='①②③④⑤';
      if (!rows.length) {
        const blocks=[...root.querySelectorAll('p,div,td')].filter(el=>
          /^[①②③④⑤]/.test(el.textContent.trim()) && !el.closest('.bogi,.cond,.cond-box,.condition,.conditions,[data-condition]') && !el.querySelector('p,div,td'));
        if (blocks.length===optionCount && blocks.every((el,i)=>el.textContent.trim().startsWith(numbers[i]))) rows=blocks;
      }
      if (!rows.length && options.length>=2 && options.length<=5 && options.every(x=>['string','number'].includes(typeof x))) {
        list=doc.createElement('ol');
        rows=options.map(option=>{
          const row=doc.createElement('li');
          row.innerHTML=math(String(option));
          list.append(row);return row;
        });
        root.append(list);
      }
      if (!rows.length) {
        if (!root.querySelector('.dte-choice-issue')) {
          const note=doc.createElement('p');note.className='dte-choice-issue';
          note.setAttribute('role','status');
          note.textContent='이 문항의 선택지를 확인할 수 없습니다. 화살표로 다른 문항을 풀어 주세요.';
          root.append(note);
        }
        return;
      }
      if (!doc.getElementById('dte-choice-style')) {
        const style=doc.createElement('style');style.id='dte-choice-style';
        style.textContent=choiceStyles;
        doc.head.append(style);
      }
      if (!list) {
        // Some editions put the numbered answers in separate paragraphs or table cells.
        // Move the existing nodes so their formula layout and accessible math stay intact.
        list=doc.createElement('ol');
        const table=rows[0].closest('table');
        if (table) table.after(list);
        else rows[0].before(list);
        rows=rows.map(source=>{
          const row=doc.createElement('li');
          row.append(...Array.from(source.childNodes));
          list.append(row);
          source.remove();
          return row;
        });
        if (table && !table.textContent.trim() && !table.querySelector('img,svg,math')) table.remove();
      }
      list.classList.add('dte-source-choices');
      rows.forEach((row,index)=>{
        const button=doc.createElement('button');
        button.type='button';button.className='dte-inline-choice';
        button.dataset.examChoice=String(index);button.dataset.examId=id;
        button.setAttribute('aria-pressed',String(value!=null && value!=='' && Number(value)===index));
        const marker=doc.createElement('span');marker.className='dte-choice-no';marker.textContent=String(index+1);
        const body=doc.createElement('span');body.className='dte-choice-content';
        // Canonical PDFs use a circled marker in the first text node. Preserve the math itself.
        const sourceNumber=row.querySelector(':scope > .선지번호');
        if (sourceNumber && [numbers[index],String(index+1),String(index+1)+'.',String(index+1)+')'].includes(sourceNumber.textContent.trim())) sourceNumber.remove();
        const walker=doc.createTreeWalker(row,4);
        for(let t=walker.nextNode();t;t=walker.nextNode()) {
          if (!t.textContent.trim()) continue;
          if (t.textContent.trimStart().startsWith(numbers[index])) t.textContent=t.textContent.replace(/^\s*[①②③④⑤]\s*/,'');
          break;
        }
        body.append(...Array.from(row.childNodes));button.append(marker,body);row.append(button);
        if (choose) button.addEventListener('click',()=>choose(button));
      });
      window.DSChoiceLayout?.mount(list,Array.from(list.querySelectorAll('.dte-inline-choice')));
    }
    const choiceStyles=`
      .dte-source-choices{display:grid!important;grid-template-columns:minmax(0,1fr)!important;align-items:stretch!important;gap:4px!important;box-sizing:border-box;min-width:0;max-width:100%;margin:12px 0!important;padding:0!important;list-style:none!important}
      .dte-source-choices[data-choice-columns="5"]{grid-template-columns:repeat(5,minmax(max-content,1fr))!important}
      .dte-source-choices[data-choice-columns="3"]{grid-template-columns:repeat(3,minmax(max-content,1fr))!important}
      .dte-source-choices>li{display:flex!important;min-width:0!important;width:auto!important;margin:0!important;padding:0!important;list-style:none!important}
      .dte-source-choices>li::before,.dte-source-choices>li::marker{content:none!important}
      .dte-inline-choice{box-sizing:border-box;width:100%;min-width:0;min-height:44px;display:flex;align-items:baseline;gap:4px;padding:5px 6px;border:1px solid #c4c1b6;border-radius:4px;background:#fbf9f2;color:#292d31;cursor:pointer;text-align:start;font:inherit;line-height:1.55}
      .dte-inline-choice:hover{border-color:#949284;background:#f5f2e9}
      .dte-inline-choice[aria-pressed=true]{border-color:#78668a;background:#eee9f1}
      .dte-inline-choice:focus-visible{outline:2px solid #766686;outline-offset:-2px}
      .dte-choice-no{box-sizing:border-box;flex:0 0 1.24em;height:1.24em;display:inline-flex;align-items:center;justify-content:center;border:1px solid currentColor;border-radius:50%;font:500 1em/1 Arial,sans-serif}
      .dte-choice-content{min-width:0;max-width:100%;white-space:normal;overflow-wrap:anywhere;overflow-x:auto}
      .dte-source-choices:is([data-choice-columns="3"],[data-choice-columns="5"]) .dte-choice-content{white-space:nowrap;overflow-wrap:normal}
      @media(max-width:480px){.dte-inline-choice{gap:3px;padding-inline:4px}}
      @media(max-width:340px){.dte-source-choices{column-gap:2px!important}.dte-inline-choice{gap:2px;padding-inline:1px}.dte-source-choices .dte-choice-no{font-size:.9em}}
    `;
  function create(api) {
    const scope=api.scope || '.ds-timed';
    const { getActive, known, clock, remaining, title, paperQuestion, questionContent,
      displayedAnswer, recordAnswer, finish, paint, escape } = api;
    let setKey, page, retry, finishing, finishFailed;

    function reset() {
      setKey = null;
      page = 0;
      retry = null;
      finishing = false;
      finishFailed = false;
    }
    reset();

    const present = value => value != null && String(value).trim() !== '';
    const settled = set => ['finished', 'expired'].includes(set.status);
    const expected = (set, id) => set.gradedResponses?.[id]?.answer ?? known(id)?.answer;
    function isRight(set, id) {
      return set.gradedResponses?.[id]?.correct ??
        (present(set.responses?.[id]) && present(expected(set,id)) &&
         Number(set.responses[id]) === Number(expected(set,id)));
    }
    function current(set) {
      return (retry?.ids || set.questionIds)[page];
    }
    function focusQuestion() {
      document.querySelector(scope+' .dst-sheet')?.focus({ preventScroll:true });
    }
    function repaintQuestion() {
      paint();
      focusQuestion();
    }
    function answerBox(q, id, value, last) {
      if (q.answerType === 'choice') return '';
      return `<div class="dte-entry"><label>정답 <input type="text" maxlength="12" autocomplete="off" data-exam-input="${escape(id)}" aria-label="${page+1}번 답" value="${escape(value ?? '')}"></label>
        <button type="button" data-exam-next>${last?'채점하기':'다음 문항 →'}</button></div>`;
    }
    function feedback(set, id, value, correct) {
      const q = known(id);
      return `<div class="dst-feedback"><strong>${correct?'정답':'오답'}</strong>
        <span>내 답 ${escape(displayedAnswer(q,value))} · 정답 ${escape(displayedAnswer(q,expected(set,id)))}</span>
        <div>${questionContent(q,true)}</div></div>`;
    }
    function render() {
      const set = getActive();
      if (!set) return '';
      const key = set.setId || set.kind+'|'+set.grade+'|'+set.startedAt;
      if (key !== setKey) {
        reset();
        setKey = key;
        const firstUnanswered = set.questionIds.findIndex(id => !present(set.responses?.[id]));
        if (!settled(set) && firstUnanswered !== -1) page = firstUnanswered;
      }
      const ids = retry?.ids || set.questionIds;
      const id = current(set);
      const q = known(id);
      const answers = retry ? retry.answers : set.responses || {};
      const complete = retry ? retry.complete : settled(set);
      const nowAnswered = ids.filter(k => present(answers[k])).length;
      const score = retry ? ids.filter(k => present(answers[k]) && Number(answers[k])===Number(expected(set,k))).length :
        set.correct ?? ids.filter(k=>isRight(set,k)).length;
      const wrong = set.questionIds.filter(k=>!isRight(set,k));
      const result = complete ? `<div class="dte-summary" role="status"><span>${retry?'오답 재도전 결과':set.timedOut || set.status==='expired'?'시간 종료 · 채점 결과':'채점 결과'}</span><strong>${score} / ${ids.length} 정답</strong></div>` : '';
      const time = !settled(set) ? `<div class="dte-clock"><span>남은 시간</span><time data-time-clock role="timer" aria-label="남은 시간">${clock()}</time></div>` : '';

      const box = complete ? feedback(set,id,answers[id],retry?present(answers[id]) && Number(answers[id])===Number(expected(set,id)):isRight(set,id)) :
        answerBox(q,id,answers[id],page===ids.length-1);
      const sheet=paperQuestion(q,page,ids.length,box);
      const canChoose=!complete && q.answerType==='choice';
      if (canChoose) requestAnimationFrame(() => {
        const host=document.querySelector(scope+' [data-exam-paper-id]');
        if (host?.dataset.examPaperId===id) bindPaper(host);
      });
      const edge=(step,label,glyph,disabled)=>`<button type="button" class="dte-edge" data-exam-${step} aria-label="${label}" title="${label}" ${disabled?'disabled':''}><span aria-hidden="true">${glyph}</span></button>`;
      const numbers = ids.map((k,i) => {
        const marked = present(answers[k]);
        const correct = retry ? marked && Number(answers[k])===Number(expected(set,k)) : isRight(set,k);
        const state = complete?(correct?'정답':'오답'):marked?'응답':'미응답';
        return `<button type="button" data-time-index="${i}" aria-label="${i+1}번 문항 · ${state}" ${i===page?'aria-current="step"':''} class="${complete?(correct?'dte-right':'dte-wrong'):marked?'is-answered':''}">${i+1}</button>`;
      }).join('');
      const retryButton = complete && wrong.length ? `<button type="button" data-exam-retry>틀린 문제 다시 풀기 · ${wrong.length}문항</button>` : '';
      return `<div class="ta-top-v18"><h1>${escape(title())}</h1></div>
        <div class="ta-layout-v18 dst-layout"><div class="ta-main-v18" data-time-form>
          ${time}${result}<div class="dte-paper-frame" ${canChoose?'data-exam-paper-id="'+escape(id)+'"':''}>
          ${edge('prev','이전 문항','‹',page===0)}${sheet}${edge('forward',page===ids.length-1 && !complete?'제출하고 채점':'다음 문항','›',page===ids.length-1 && complete)}</div>
          ${finishFailed && !complete?'<button type="button" data-exam-submit>채점 다시 시도</button>':''}
        </div>
        <aside class="ta-answer-sheet-v18"><div class="ta-answer-heading-v18"><h2>${retry?'오답 재도전':'답안'}</h2><span data-time-answered>${nowAnswered} / ${ids.length}</span></div>
          <nav class="ta-numbers-v18" aria-label="문항 이동">${numbers}</nav>
          <div class="dst-actions">${!complete?'<button type="button" data-exam-finish-early>제출하고 채점</button>':''}${retryButton}${retry?'<button type="button" data-exam-original>첫 시험 결과</button>':''}
          ${complete && !retry?'<button type="button" data-time-action="print">문제지·해설 인쇄</button>':''}
          <button type="button" data-time-action="back">세트 목록</button></div>
          ${set.kind==='custom'?'<a href="#account">마이페이지 · 내 시험 기록 →</a>':complete?'<small>이 기기에 저장한 연습 기록</small><a data-time-login href="'+api.guestLoginUrl+'">로그인하고 다음 시험 풀기 →</a>':'<small>이 기기에 저장한 연습 기록</small>'}
        </aside></div>`;
    }

    // The original math and images stay in their source document, including sandboxed sheets.
    // Only the answer list gets controls. Lists within conditions or solution content are excluded.
    function bindPaper(host) {
      if (!host.isConnected) return;
      const frame=host.querySelector('.dst-prompt iframe');
      const doc=frame?.contentDocument || document;
      if (frame && (!doc.body || doc.URL==='about:blank')) return;
      const root=frame?doc.body:host.querySelector('.dst-prompt');
      if (!root || root.querySelector('.dte-inline-choice')) return;
      const set=getActive(),id=host.dataset.examPaperId;
      if (!set || id!==current(set)) return;
      const q=known(id),options=Array.isArray(q.options)?q.options:[];
      const choose=frame ? button=>{
        if(host.isConnected && getActive() && current(getActive())===id)selectChoice(button);
      } : null;
      prepareChoices({root,id,value:(retry?retry.answers:set.responses)?.[id],options,math:api.math,choose});
    }
    document.addEventListener('load',e=>{
      const frame=e.target;
      if (frame?.matches?.('.dst-prompt iframe')) {
        const host=frame.closest(scope+' [data-exam-paper-id]');
        if (host) bindPaper(host);
      }
    },true);
    function finishPractice() {
      if (retry) { retry.complete=true;page=0;repaintQuestion(); }
      else void submit();
    }
    function confirmFinish() {
      const set=getActive();
      if (!set || finishing || (retry ? retry.complete : settled(set))) return;
      const ids=retry?.ids || set.questionIds,answers=retry?retry.answers:set.responses;
      const blanks=ids.filter(id=>!present(answers?.[id])).length;
      if (!blanks) { finishPractice();return; }
      const root=document.querySelector(scope);
      if (!root || root.querySelector('.dte-submit-dialog')) return;
      const dialog=document.createElement('dialog');
      dialog.className='dst-start-dialog dte-submit-dialog';
      dialog.setAttribute('aria-labelledby','dte-submit-title');
      dialog.innerHTML=`<h2 id="dte-submit-title">이대로 제출할까요?</h2><p>아직 풀지 않은 ${blanks}문항은 오답으로 채점합니다.</p><div><button type="button" data-exam-continue autofocus>계속 풀기</button><button type="button" data-exam-confirm-submit>제출하기</button></div>`;
      dialog.addEventListener('close',()=>dialog.remove(),{once:true});
      root.append(dialog);dialog.showModal();
    }
    async function submit() {
      if (finishing || settled(getActive())) return;
      const key = setKey;
      finishing = true;
      finishFailed = false;
      try { await finish(); }
      finally {
        if (key===setKey) {
          finishing = false;
          finishFailed = Boolean(getActive() && !settled(getActive()));
          if (finishFailed) paint();
        }
      }
    }
    function selectChoice(button) {
      const set=getActive(), id=button.dataset.examId;
      if (!set || finishing || current(set)!==id || (retry?retry.complete:settled(set))) return;
      if (!retry && remaining()===0) { void submit();return; }
      const value=button.dataset.examChoice;
      if (retry) retry.answers[id]=value;
      else recordAnswer(id,value);
      const box=button.parentElement.closest('.dte-source-choices') || button.closest('body');
      for(const option of box.querySelectorAll('.dte-inline-choice')) {
        option.setAttribute('aria-pressed',String(option===button));
      }
      const mark=document.querySelector(scope+' .ta-numbers-v18 [aria-current]');
      mark?.classList.add('is-answered');
      mark?.setAttribute('aria-label',(page+1)+'번 문항 · 응답');
      const counter=document.querySelector(scope+' [data-time-answered]');
      const ids=retry?.ids || set.questionIds,answers=retry?retry.answers:set.responses;
      if (counter) counter.textContent=ids.filter(k=>present(answers?.[k])).length+' / '+ids.length;
    }
    function forward() {
      const set=getActive(),ids=retry?.ids || set.questionIds;
      if (page<ids.length-1) { page++;repaintQuestion(); }
      else if (!(retry?retry.complete:settled(set))) confirmFinish();
    }
    function confirmInput() {
      const set=getActive();
      const input=document.querySelector(scope+' [data-exam-input]');
      if (!set || !input || input.dataset.examInput!==current(set)) return;
      const value=input.value.trim();
      if (!/^-?\d{1,9}$/.test(value)) {
        input.setCustomValidity('답을 정수로 입력해 주세요.');
        input.reportValidity();input.focus();return;
      }
      if (!retry && remaining()===0) { void submit();return; }
      if (retry) retry.answers[current(set)]=value;
      else recordAnswer(current(set),value);
      forward();
    }
    function input(el) {
      if (!el.matches?.('[data-exam-input]')) return false;
      const set=getActive(), id=el.dataset.examInput;
      if (!set || id!==current(set) || finishing || (retry?retry.complete:settled(set))) return true;
      el.setCustomValidity('');
      const value=el.value.trim();
      if (!retry && remaining()>0) {
        // An unfinished edit must never leave an older, valid answer in the saved draft.
        recordAnswer(id,/^-?\d{1,9}$/.test(value)?value:'');
      } else if (retry) retry.answers[id]=/^-?\d{1,9}$/.test(value)?value:'';
      return true;
    }
    function click(button) {
      const set=getActive();
      if (!set || !button) return false;
      if (button.hasAttribute('data-exam-choice')) {
        selectChoice(button);return true;
      }
      if (button.hasAttribute('data-exam-prev') || button.hasAttribute('data-exam-forward')) {
        const ids=retry?.ids||set.questionIds,target=page+(button.hasAttribute('data-exam-prev')?-1:1);
        if (target>=0 && target<ids.length) { page=target;repaintQuestion(); }
        else if (target===ids.length) forward();
        return true;
      }
      if (button.hasAttribute('data-exam-finish-early')) {confirmFinish();return true;}
      if (button.hasAttribute('data-exam-continue')) {button.closest('dialog')?.close();return true;}
      if (button.hasAttribute('data-exam-confirm-submit')) {button.closest('dialog')?.close();finishPractice();return true;}
      if (button.hasAttribute('data-exam-next')) { confirmInput(); return true; }
      if (button.hasAttribute('data-exam-submit')) { void submit(); return true; }
      if (button.hasAttribute('data-time-index')) {
        const i=Number(button.dataset.timeIndex), ids=retry?.ids || set.questionIds;
        if (Number.isInteger(i) && i>=0 && i<ids.length) { page=i; repaintQuestion(); }
        return true;
      }
      if (button.hasAttribute('data-exam-retry') && settled(set)) {
        const ids=set.questionIds.filter(id=>!isRight(set,id));
        if (ids.length) { retry={ids,answers:{},complete:false};page=0;repaintQuestion(); }
        return true;
      }
      if (button.hasAttribute('data-exam-original')) { retry=null;page=0;repaintQuestion();return true; }
      return false;
    }
    function tick() {
      const set=getActive();
      if (!set || settled(set)) return;
      const display=document.querySelector(scope+' [data-time-clock]');
      const value=clock();
      if (display && display.textContent!==value) display.textContent=value;
      if (remaining()===0 && !finishFailed) void submit();
    }
    document.addEventListener('keydown',event=>{
      if (event.key==='Enter' && !event.isComposing && event.target.matches?.(scope+' [data-exam-input]')) {
        event.preventDefault();
        confirmInput();
      }
    });
    return {render,click,input,reset,tick};
  }
  window.DSTimedExam={create,prepareChoices};
})();
