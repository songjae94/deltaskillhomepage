/* School-length timing with the existing public integral questions. */
(() => {
  'use strict';
  const modes = { full: { minutes: 50, count: 25 }, half: { minutes: 25, count: 13 } };
  let mode = 'full', attempt = null, pendingStart = null;
  const draftKey = 'ds-next-time-attack-active-v23';
  let draftWarning = false;
  const previous = { start, renderPractice, tick, finish, progress };
  function pool() {
    const seen = new Set();
    return [...regularBank, ...timerBank].filter(q => {
      const key = q.question.replace(/\s+/g, '') + JSON.stringify([...q.options].sort());
      if (seen.has(key)) return false;
      seen.add(key); return true;
    });
  }
  function secondsLeft() { return attempt ? Math.max(0, Math.ceil((attempt.deadline - Date.now()) / 1000)) : 0; }
  function clearDraft() { try { sessionStorage.removeItem(draftKey); } catch { try { sessionStorage.setItem(draftKey, 'null'); } catch {} } }
  function saveDraft() {
    if (!attempt?.active) return;
    const data = { version: 1, id: attempt.id, mode: attempt.mode, ids: attempt.questions.map(q => q.id), answers: attempt.answers, index: attempt.index, started: attempt.started, deadline: attempt.deadline, pendingReason: attempt.pendingReason || '', pendingAt: attempt.pendingAt || null };
    try { sessionStorage.setItem(draftKey, JSON.stringify(data)); }
    catch { if (!draftWarning) { draftWarning = true; toast('이 탭의 복구 저장을 할 수 없습니다. 현재 연습은 계속할 수 있습니다.'); } }
  }
  function restoreDraft() {
    let raw;
    try { raw = sessionStorage.getItem(draftKey); } catch { return false; }
    if (!raw) return false;
    try {
      if (raw.length > 20000) throw Error('large');
      const data = JSON.parse(raw), now = Date.now();
      if (!data || data.version !== 1 || typeof data.id !== 'string' || !/^ta-[a-z0-9-]{8,100}$/i.test(data.id) || !Object.hasOwn(modes, data.mode)) throw Error('format');
      const config = modes[data.mode], questions = pool().slice(0, config.count);
      if (!Array.isArray(data.ids) || data.ids.length !== config.count || questions.length !== config.count || data.ids.some((id, i) => id !== questions[i].id)) throw Error('questions');
      if (!Number.isSafeInteger(data.started) || !Number.isSafeInteger(data.deadline) || data.deadline !== data.started + config.minutes * 60000 || data.started > now + 5000 || now - data.started > 86400000) throw Error('date');
      if (!Number.isInteger(data.index) || data.index < 0 || data.index >= questions.length || !data.answers || typeof data.answers !== 'object' || Array.isArray(data.answers)) throw Error('answers');
      for (const [id, value] of Object.entries(data.answers)) { const q = questions.find(q => q.id === id); if (!q || !Number.isInteger(value) || value < 0 || value >= q.options.length) throw Error('answer'); }
      if (typeof data.pendingReason !== 'string' || !['', 'submitted', 'timeout'].includes(data.pendingReason) || (!data.pendingReason && data.pendingAt !== null)) throw Error('reason');
      if (data.pendingReason && (!Number.isSafeInteger(data.pendingAt) || data.pendingAt < data.started || data.pendingAt > now + 5000 || (data.pendingReason === 'timeout' && data.pendingAt < data.deadline))) throw Error('pending');
      const results = get('results-v2', []);
      if (Array.isArray(results) && results.some(item => item?.timedAttemptId === data.id)) { clearDraft(); if (location.hash === '#practice') location.hash = '#progress'; return false; }
      mode = data.mode;
      attempt = { ...data, active: true, questions, answers: { ...data.answers }, confirm: false, interval: null };
      qbank = questions; questionIndex = data.index; selected = ''; checked = false; hintUsed = false; sessionResults = []; ended = false; timed = true; deadline = data.deadline; remaining = secondsLeft();
      if (!attempt.pendingReason && remaining) attempt.interval = setInterval(updateClock, 250);
      return true;
    } catch { clearDraft(); return false; }
  }
  function snapshot() { return attempt ? { active: attempt.active, mode: attempt.mode, count: attempt.questions.length, ids: attempt.questions.map(q => q.id), answers: { ...attempt.answers }, index: attempt.index, remaining: secondsLeft(), reason: attempt.reason || '', intervalStopped: attempt.interval === null } : null; }
  function choose(value) { if (!attempt?.active && modes[value]) mode = value; }
  function discard() {
    if (!attempt?.active) return;
    attempt.active = false; attempt.reason = 'discarded';
    clearInterval(attempt.interval); attempt.interval = null;
    clearInterval(clock); clock = null;
    ended = true; timed = false; sessionResults = [];
    clearDraft();
    pendingStart = null;
  }
  function begin() {
    if (attempt?.active) { attempt.discardConfirm = false; pendingStart = null; location.hash = '#practice'; renderPractice(); return; }
    const config = modes[mode], questions = pool().slice(0, config.count);
    if (questions.length !== config.count) { toast('중복 없는 공개 문항이 부족해 시작할 수 없습니다.'); return; }
    clearInterval(clock); clock = null;
    const started = Date.now();
    attempt = { id: 'ta-' + started.toString(36) + '-' + Math.random().toString(36).slice(2, 12), active: true, mode, questions, answers: {}, index: 0, started, deadline: started + config.minutes * 60000, confirm: false, interval: null };
    qbank = questions; questionIndex = 0; selected = ''; checked = false; hintUsed = false; sessionResults = []; ended = false; timed = true;
    remaining = config.minutes * 60; deadline = attempt.deadline;
    location.hash = '#practice';
    attempt.interval = setInterval(updateClock, 250);
    saveDraft();
    renderPractice();
  }
  function updateClock() {
    if (!attempt?.active || attempt.pendingReason) return;
    remaining = secondsLeft();
    const clockElement = document.getElementById('ta-clock-v18');
    if (clockElement) clockElement.textContent = formatTime(remaining);
    if (!remaining) complete('timeout');
  }
  function answer(value) {
    if (!attempt?.active || attempt.pendingReason) return;
    if (!secondsLeft()) { complete('timeout'); return; }
    const q = attempt.questions[attempt.index];
    if (value === null) delete attempt.answers[q.id];
    else if (Number.isInteger(value) && value >= 0 && value < q.options.length) attempt.answers[q.id] = value;
    saveDraft();
  }
  function move(index) {
    if (!attempt?.active || attempt.pendingReason || !Number.isInteger(index) || index < 0 || index >= attempt.questions.length) return;
    updateClock(); if (!attempt.active) return;
    attempt.index = index; attempt.confirm = false; saveDraft(); renderPractice();
    document.querySelector('.ta-question-v18')?.focus({ preventScroll: true });
  }
  function complete(reason = 'submitted', navigate = true) {
    if (!attempt?.active) return;
    reason = attempt.pendingReason || (secondsLeft() === 0 ? 'timeout' : reason);
    if (!['submitted', 'timeout'].includes(reason)) return false;
    const completedAt = attempt.pendingAt || Date.now();
    clearInterval(attempt.interval); attempt.interval = null;
    clearInterval(clock); clock = null;
    remaining = secondsLeft();
    const questions = attempt.questions.map(q => {
      const chosen = attempt.answers[q.id], answered = Number.isInteger(chosen);
      return { id: q.id, correct: answered && chosen === q.answer, help: false, skipped: !answered, answer: answered ? chosen : null };
    });
    const limit = modes[attempt.mode].minutes * 60;
    const item = { when: new Date(completedAt).toISOString(), timed: true, seconds: reason === 'timeout' ? limit : Math.min(limit, Math.max(0, Math.floor((completedAt - attempt.started) / 1000))), questions, timeLimitSeconds: limit, questionCount: questions.length, timedMode: attempt.mode, completionReason: reason, timedAttemptId: attempt.id };
    const stored = get('results-v2', []), results = Array.isArray(stored) ? stored : [];
    if (!results.some(previous => previous?.timedAttemptId === attempt.id) && !put('results-v2', [...results, item].slice(-30))) {
      attempt.pendingReason = reason; attempt.pendingAt = completedAt; saveDraft();
      toast('기록을 저장하지 못했습니다. 답안은 이 탭에 남아 있습니다.');
      renderPractice(); return false;
    }
    attempt.active = false; attempt.reason = reason; clearDraft();
    ended = true; timed = false; sessionResults = questions;
    if (navigate && location.hash === '#practice') location.hash = '#progress';
    return true;
  }
  function discardMarkup() {
    return '<p class="ta-launch-note-v18">진행 중인 연습의 시간은 계속 흐릅니다.</p>' + (attempt.discardConfirm ? '<section class="ta-confirm-v18" role="region" aria-labelledby="ta-discard-title-v18" tabindex="-1"><h2 id="ta-discard-title-v18">이 연습을 그만둘까요?</h2><p>결과는 저장하지 않습니다.</p><div><button type="button" data-ta-discard-cancel>계속 풀기</button><button type="button" class="primary" data-ta-discard-confirm>그만두기</button></div></section>' : '<button type="button" class="text-action" data-ta-discard>연습 그만두기</button>');
  }
  function showDiscard() {
    attempt.discardConfirm = true; studentTab = 'timed';
    if (!['#student', '#timed'].includes(location.hash)) location.hash = '#timed';
    document.getElementById('content').innerHTML = timedPage();
    document.querySelector('[data-ta-discard-confirm]')?.focus({ preventScroll: true });
  }
  timedLaunch = function () {
    const enough = pool().length >= modes[mode].count;
    return `<article class="ta-launch-v18"><span class="ta-eyebrow-v18">타임어택 · 정적분 공개 문항</span><h2>학교 시험 연습</h2><div class="ta-modes-v18" role="group" aria-label="시간과 문항 수 선택">${Object.entries(modes).map(([key,c])=>`<button type="button" data-ta-mode="${key}" aria-pressed="${mode===key}"${attempt?.active?' disabled':''}><strong>${c.minutes}<small>분</small></strong><span>${c.count}문항${key==='half'?' · 절반 분량':''}</span></button>`).join('')}</div><button type="button" class="primary" data-ta-begin${enough?'':' disabled'}>${attempt?.active?'이어서 풀기':modes[mode].minutes+'분 연습 시작'}</button><p class="ta-launch-note-v18">정답과 풀이는 제출한 뒤 확인합니다.<br>미적분Ⅰ · 정적분 공개 문항으로 연습합니다.</p>${enough?'':'<p role="status">중복 없는 공개 문항이 부족합니다.</p>'}${attempt?.active?discardMarkup():''}</article>`;
  };
  timerFeature = function () { return `<article class="time-feature editorial-time"><button type="button" class="editorial-tablet" data-start="timed" aria-label="타임어택 시간과 문항 수 고르기"><img src="assets/editorial/cool-study-v13.webp" alt="햇빛이 드는 책상 위의 패드" width="1536" height="1024"><div class="editorial-tablet-screen" aria-hidden="true"><small>TIME ATTACK</small><strong>50:00</strong><i></i></div></button><div class="feature-heading"><h2>타임어택</h2><span>50분 25문항 · 25분 13문항</span></div><div class="time-feature-bottom"><p>시간을 정하고, 끝까지.</p><button type="button" data-start="timed">분량 고르기</button></div></article>`; };
  start = function (kind = 'normal', custom) {
    if (kind === 'timed') { location.hash = '#timed'; if (typeof route === 'function') route(); return; }
    if (attempt?.active) {
      pendingStart = { kind, custom, answer: kind === 'normal' && Array.isArray(custom) && custom.length === 1 ? quickSelected : '', help: quickHelp };
      showDiscard(); return false;
    }
    return previous.start(kind, custom);
  };
  tick = function () { if (attempt?.active) updateClock(); else previous.tick(); };
  finish = function () { if (attempt?.active) { attempt.confirm = true; renderPractice(); } else previous.finish(); };
  renderPractice = function () {
    if (!attempt?.active) return previous.renderPractice();
    if (location.hash !== '#practice') return;
    if (attempt.pendingReason) {
      header('practice');
      document.getElementById('content').innerHTML = '<section class="work-surface ta-work-v18"><div class="ta-confirm-v18" role="status"><h2>답안은 남아 있습니다.</h2><p>이 기기에 기록을 저장하지 못했습니다. 저장을 다시 시도해 주세요.</p><button type="button" class="primary" data-ta-submit>기록 저장 다시 시도</button></div></section>';
      return;
    }
    if (!secondsLeft()) { complete('timeout'); return; }
    header('practice');
    const q = attempt.questions[attempt.index], chosen = attempt.answers[q.id], total = attempt.questions.length, answered = Object.keys(attempt.answers).length;
    questionIndex = attempt.index; qbank = attempt.questions; remaining = secondsLeft();
    document.getElementById('content').innerHTML = `<section class="work-surface ta-work-v18"><div class="ta-top-v18"><a href="#student">공부</a><span>정적분 공개 문항 · ${modes[attempt.mode].minutes}분 ${total}문항</span><time id="ta-clock-v18" aria-label="남은 시간">${formatTime(remaining)}</time></div><div class="ta-layout-v18"><div class="ta-main-v18"><article class="quick-paper ta-question-v18" tabindex="-1"><div class="paper-heading"><span>미적분Ⅰ · 정적분</span><span>${attempt.index+1} / ${total}</span></div><div class="quick-question"><span class="question-no">${String(attempt.index+1).padStart(2,'0')} · ${esc(q.short)}</span><div class="question-stem">${q.question}</div></div>${choices(q,'ta-answer',Number.isInteger(chosen)?String(chosen):'')}<div class="ta-question-actions-v18"><button type="button" data-ta-clear${Number.isInteger(chosen)?'':' disabled'}>답 선택 지우기</button><button type="button" data-ta-skip>넘기기 →</button></div></article><div class="ta-move-v18"><button type="button" data-ta-move="${attempt.index-1}"${attempt.index===0?' disabled':''}>이전 문항</button><button type="button" data-ta-${attempt.index===total-1?'review':'move="'+(attempt.index+1)+'"'}>${attempt.index===total-1?'제출 전 확인':'다음 문항 →'}</button></div></div><aside class="ta-answer-sheet-v18" aria-label="답안 현황"><div class="ta-answer-heading-v18"><h2>답안</h2><span id="ta-answer-count-v18">${answered} / ${total}</span></div><nav class="ta-numbers-v18" aria-label="문항 이동">${attempt.questions.map((item,i)=>`<button type="button" data-ta-move="${i}"${i===attempt.index?' aria-current="step"':''}${Number.isInteger(attempt.answers[item.id])?' class="is-answered"':''} aria-label="${i+1}번, ${Number.isInteger(attempt.answers[item.id])?'답 선택함':'미응답'}">${i+1}</button>`).join('')}</nav><p>답을 고른 번호는 색으로 표시됩니다.<br>번호를 눌러 돌아갈 수 있습니다.</p><button type="button" class="primary ta-review-v18" data-ta-review>제출하기</button><small>제출하거나 시간이 끝나면 채점합니다.</small></aside></div>${attempt.confirm?`<section class="ta-confirm-v18" role="region" aria-labelledby="ta-confirm-title-v18" tabindex="-1"><h2 id="ta-confirm-title-v18">답안을 제출할까요?</h2><p>${total-answered?`아직 답하지 않은 문항 ${total-answered}개는 오답으로 기록됩니다.`:'모든 문항에 답을 골랐습니다.'} 제출 후에는 답을 바꿀 수 없습니다.</p><div><button type="button" data-ta-cancel>계속 풀기</button><button type="button" class="primary" data-ta-submit>제출하고 채점하기</button></div></section>`:''}</section>`;
  };
  progress = function () {
    let html = previous.progress();
    const last = get('results-v2', []).at(-1);
    if (last?.timedMode && modes[last.timedMode]) {
      const label = `${modes[last.timedMode].minutes}분 · ${last.questions.length}문항 타임어택`;
      html = html.replace('최근 학습 · 정적분', label);
    }
    return html;
  };
  document.addEventListener('click', event => {
    const button = event.target.closest('button');
    if (!button || ![...button.attributes].some(a => a.name.startsWith('data-ta-'))) return;
    event.preventDefault(); event.stopImmediatePropagation();
    if (button.disabled) return;
    if (button.dataset.taMode) { choose(button.dataset.taMode); document.getElementById('content').innerHTML = timedPage(); document.querySelector(`[data-ta-mode="${mode}"]`)?.focus({preventScroll:true}); return; }
    if (button.hasAttribute('data-ta-begin')) { begin(); return; }
    if (!attempt?.active) return;
    updateClock(); if (!attempt.active) return;
    if (button.hasAttribute('data-ta-discard')) {
      pendingStart = null; showDiscard();
      return;
    }
    if (button.hasAttribute('data-ta-discard-cancel')) { begin(); return; }
    if (button.hasAttribute('data-ta-discard-confirm')) {
      const next = pendingStart; discard();
      if (next) {
        previous.start(next.kind, next.custom);
        if (next.answer !== '') { selected = next.answer; hintUsed = next.help; checked = true; record(); renderPractice(); }
      } else {
        document.getElementById('content').innerHTML = timedPage();
        document.querySelector(`[data-ta-mode="${mode}"]`)?.focus({ preventScroll: true });
      }
      return;
    }
    if (button.hasAttribute('data-ta-move')) move(Number(button.dataset.taMove));
    else if (button.hasAttribute('data-ta-clear')) { answer(null); renderPractice(); }
    else if (button.hasAttribute('data-ta-skip')) move((attempt.index+1)%attempt.questions.length);
    else if (button.hasAttribute('data-ta-review')) { attempt.confirm = true; renderPractice(); document.querySelector('.ta-confirm-v18')?.focus(); }
    else if (button.hasAttribute('data-ta-cancel')) { attempt.confirm = false; renderPractice(); }
    else if (button.hasAttribute('data-ta-submit')) complete();
  }, true);
  document.addEventListener('change', event => {
    if (event.target.name !== 'ta-answer' || !attempt?.active) return;
    answer(Number(event.target.value));
    if (!attempt.active) return;
    if (attempt.confirm) {
      attempt.confirm = false; renderPractice();
      document.querySelector(`input[name="ta-answer"][value="${event.target.value}"]`)?.focus({preventScroll:true});
    }
    const index = attempt.index;
    const button = document.querySelector(`[data-ta-move="${index}"]`);
    button?.classList.add('is-answered'); button?.setAttribute('aria-label',`${index+1}번, 답 선택함`);
    const count = document.getElementById('ta-answer-count-v18'); if (count) count.textContent = Object.keys(attempt.answers).length+' / '+attempt.questions.length;
    const clear = document.querySelector('[data-ta-clear]'); if (clear) clear.disabled = false;
  });
  document.addEventListener('visibilitychange', () => { if (!document.hidden) updateClock(); });
  window.addEventListener('pagehide', saveDraft);
  window.DSTimeAttackV18 = { choose, begin, answer, move, submit: complete, tick: updateClock, snapshot, available: () => pool().length };
  const restored = restoreDraft();
  if (restored) {
    if (!attempt.pendingReason && !secondsLeft()) complete('timeout');
    else if (location.hash === '#practice') renderPractice();
  }
  if (['#student','#timed'].includes(location.hash) && typeof route === 'function') route();
})();
