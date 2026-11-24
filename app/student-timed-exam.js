/* Shared question desk for the free exam and the member's timed sets. */
(() => {
  'use strict';

  function create(api) {
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
      document.querySelector('.ds-timed .dst-sheet')?.focus({ preventScroll:true });
    }
    function repaintQuestion() {
      paint();
      focusQuestion();
    }
    function answerBox(q, id, value, last) {
      if (q.answerType === 'choice') {
        return '<div class="dte-choices" role="group" aria-label="답 선택">' +
          Array.from({ length:q.options?.length || 5 }, (_, i) =>
            `<button type="button" data-exam-choice="${i}" data-exam-id="${escape(id)}" aria-label="${i+1}번 선택" aria-pressed="${present(value) && Number(value)===i}">${i+1}</button>`
          ).join('') + '</div>';
      }
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
      const unfilledExcludingThis = ids.some(k=>k!==id && !present(answers[k]));
      const box = complete ? feedback(set,id,answers[id],retry?Number(answers[id])===Number(expected(set,id)):isRight(set,id)) :
        answerBox(q,id,answers[id],!unfilledExcludingThis);
      const numbers = ids.map((k,i) => {
        const marked = present(answers[k]);
        const correct = retry ? marked && Number(answers[k])===Number(expected(set,k)) : isRight(set,k);
        const state = complete?(correct?'정답':'오답'):marked?'응답':'미응답';
        return `<button type="button" data-time-index="${i}" aria-label="${i+1}번 문항 · ${state}" ${i===page?'aria-current="step"':''} class="${complete?(correct?'dte-right':'dte-wrong'):marked?'is-answered':''}">${i+1}</button>`;
      }).join('');
      const retryButton = complete && wrong.length ? `<button type="button" data-exam-retry>틀린 문제 다시 풀기 · ${wrong.length}문항</button>` : '';
      return `<div class="ta-top-v18"><h1>${escape(title())}</h1></div>
        <div class="ta-layout-v18 dst-layout"><div class="ta-main-v18" data-time-form>
          ${time}${result}${paperQuestion(q,page,ids.length,box)}
          ${finishFailed && !complete?'<button type="button" data-exam-submit>채점 다시 시도</button>':''}
        </div>
        <aside class="ta-answer-sheet-v18"><div class="ta-answer-heading-v18"><h2>${retry?'오답 재도전':'답안'}</h2><span data-time-answered>${nowAnswered} / ${ids.length}</span></div>
          <nav class="ta-numbers-v18" aria-label="문항 이동">${numbers}</nav>
          <div class="dst-actions">${retryButton}${retry?'<button type="button" data-exam-original>첫 시험 결과</button>':''}
          ${complete && !retry?'<button type="button" data-time-action="print">문제지·해설 인쇄</button>':''}
          <button type="button" data-time-action="back">세트 목록</button></div>
          ${set.kind==='custom'?'<a href="#account">마이페이지 · 내 시험 기록 →</a>':'<small>이 기기에 저장한 연습 기록</small>'}
        </aside></div>`;
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
    function advance(id, value) {
      const set = getActive();
      if (!set || current(set)!==id || finishing || (retry ? retry.complete : settled(set))) return;
      if (!retry && remaining()===0) { void submit(); return; }
      if (retry) retry.answers[id]=value;
      else recordAnswer(id,value);
      const answers = retry ? retry.answers : set.responses;
      const ids = retry?.ids || set.questionIds;
      for (let offset=1; offset<ids.length; offset++) {
        const next=(page+offset)%ids.length;
        if (!present(answers?.[ids[next]])) { page=next; repaintQuestion(); return; }
      }
      if (retry) { retry.complete=true; page=0; repaintQuestion(); }
      else void submit();
    }
    function confirmInput() {
      const set=getActive();
      const input=document.querySelector('.ds-timed [data-exam-input]');
      if (!set || !input || input.dataset.examInput!==current(set)) return;
      const value=input.value.trim();
      if (!/^-?\d{1,9}$/.test(value)) {
        input.setCustomValidity('답을 정수로 입력해 주세요.');
        input.reportValidity();input.focus();return;
      }
      advance(current(set),value);
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
        advance(button.dataset.examId,button.dataset.examChoice);return true;
      }
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
      const display=document.querySelector('.ds-timed [data-time-clock]');
      const value=clock();
      if (display && display.textContent!==value) display.textContent=value;
      if (remaining()===0 && !finishFailed) void submit();
    }
    document.addEventListener('keydown',event=>{
      if (event.key==='Enter' && !event.isComposing && event.target.matches?.('.ds-timed [data-exam-input]')) {
        event.preventDefault();
        confirmInput();
      }
    });
    return {render,click,input,reset,tick};
  }
  window.DSTimedExam={create};
})();
