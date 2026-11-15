'use strict';
const timedExam = new URLSearchParams(location.search).get('exam')==='csat'?'csat':'school';
const timedModes = timedExam==='csat' ? [[100,30],[50,15]] : [[50,24],[20,10]];
const timedKey = 'delta-timed-integral-v3-'+timedExam;
const legacyTimedKey = 'delta-timed-exam-v1';
const defaultMinutes=timedModes[0][0];
const requestedMinutes=Number(new URLSearchParams(location.search).get('minutes'));
let chosenMinutes=timedModes.some(([minutes])=>minutes===requestedMinutes)?requestedMinutes:defaultMinutes;
let timedRun=null, confirmFinish=false;
let filmEntry = location.hash === '#timed' && new URLSearchParams(location.search).get('entry') === 'film';
function leaveFilmSetup() {
  if (!filmEntry) return;
  filmEntry = false;
  const url = new URL(location.href);
  url.searchParams.delete('entry');
  history.replaceState(history.state, '', url);
}
function validRun(r){
  if(!r || (r.exam && r.exam!==timedExam))return false;
  const mode=timedModes.find(([minutes])=>minutes===r.minutes);
  return mode && Array.isArray(r.questions) && r.questions.length===mode[1] &&
    new Set(r.questions).size===r.questions.length && r.questions.every(id=>Number.isInteger(id)&&Boolean(window.timedBank[id])) &&
    Array.isArray(r.answers) && r.answers.length===mode[1] && r.answers.every(a=>a===null||(Number.isInteger(a)&&a>=0&&a<5)) &&
    Number.isInteger(r.pos) && r.pos>=0 && r.pos<mode[1] && Number.isFinite(r.start) &&
    Number.isFinite(r.end) && r.end>r.start && (r.finished===null||Number.isFinite(r.finished));
}
try {
  const saved=sessionStorage.getItem(timedKey);
  const legacy=null;
  const run=JSON.parse(saved||legacy);
  if(validRun(run)){
    timedRun=run;
    if(legacy){timedRun.exam=timedExam;sessionStorage.setItem(timedKey,JSON.stringify(timedRun));sessionStorage.removeItem(legacyTimedKey)}
  }
} catch {}
function keepTimed() {
  try {
    if (timedRun) sessionStorage.setItem(timedKey, JSON.stringify(timedRun));
    else sessionStorage.removeItem(timedKey);
  } catch {}
}
function timedClock(seconds) {
  return String(Math.floor(seconds / 60)).padStart(2,'0') + ':' + String(seconds % 60).padStart(2,'0');
}
function startTimed() {
  leaveFilmSetup();
  const ids = window.timedBank.map((_,i) => i);
  for (let i = ids.length - 1; i > 0; --i) {
    const j = Math.floor(Math.random() * (i + 1));
    [ids[i], ids[j]] = [ids[j], ids[i]];
  }
  const questions = ids.slice(0, timedModes.find(([minutes])=>minutes===chosenMinutes)[1]);
  const start = Date.now();
  timedRun = {exam:timedExam, minutes:chosenMinutes, questions, answers:questions.map(()=>null), pos:0, start, end:start+chosenMinutes*60000, finished:null};
  confirmFinish = false;
  keepTimed();
  renderTimed();
}
function finishTimed() {
  timedRun.finished = Math.min(Date.now(),timedRun.end);
  confirmFinish = false;
  keepTimed();
  renderTimed();
}
function renderTimed() {
  clearInterval(timerId);
  const shell = heading('타임어택','timed');
  if (filmEntry || !timedRun) {
    main.innerHTML = shell + '<section class="race box"><p class="kicker">'+examName+' 대비 · 자체 제작 고교 수학 혼합 연습 세트</p><h2>시간을 정하고 실전처럼 풀기</h2><p>막힌 문제는 건너뛰고 남은 시간에 돌아오세요. 종료 후 푼 문항 수와 정답률을 함께 확인합니다.</p><fieldset class="raceModes"><legend>연습 선택</legend>' +
      timedModes.map(([value,count],i)=>'<label><input type="radio" name="mode" value="'+value+'" '+(chosenMinutes===value?'checked':'')+'><span><strong>'+value+'분 · '+count+'문항</strong>'+(i===0?'실전 연습':'집중 연습')+'</span></label>').join('') +
      '</fieldset><button class="action" id="raceStart">'+(timedRun ? '새 세트로 시작' : '연습 시작')+'</button>' +
      (timedRun ? '<button class="minor" id="raceResume">'+(timedRun.finished || Date.now() >= timedRun.end ? '지난 결과 보기' : '진행 중인 연습 이어 풀기')+'</button>' : '')+'</section>';
    main.querySelectorAll('[name=mode]').forEach(input => input.onchange = () => {chosenMinutes = Number(input.value)});
    main.querySelector('#raceStart').onclick = startTimed;
    if (timedRun) main.querySelector('#raceResume').onclick = () => { leaveFilmSetup(); renderTimed(); };
    return;
  }
  const r = timedRun, bank = window.timedBank;
  if (!r.finished && Date.now() >= r.end) { finishTimed(); return; }
  const total = r.questions.length, solved = r.answers.filter(a=>a!==null).length;
  if (r.finished) {
    const correct = r.questions.filter((id,i)=>bank[id].answer===r.answers[i]).length;
    const accuracy = solved ? Math.round(correct/solved*100)+'%' : '—';
    const resultRow = (id,i) => {
      const q=bank[id], value=r.answers[i];
      return '<details><summary>'+String(i+1).padStart(2,'0')+'　'+q.topic+' <b>'+(value===null?'미응답':value===q.answer?'정답':'오답')+'</b></summary><div class="raceQuestion">'+q.body+'</div><p>선택한 답　'+(value===null?'없음':circles[value]+' '+q.choices[value])+'</p><p>정답　'+circles[q.answer]+' '+q.choices[q.answer]+'</p></details>';
    };
    main.innerHTML = shell+'<section class="race box"><p class="kicker">'+examName+' 대비 · '+r.minutes+'분 연습 · '+(r.finished===r.end?'시간 종료':'제출 완료')+'</p><h2>'+total+'문항 중 '+solved+'문항을 풀었습니다.</h2><div class="raceStats">'+[['정답',correct+'문항'],['푼 문항 정답률',accuracy],['미응답',(total-solved)+'문항'],['사용 시간',timedClock(Math.floor((r.finished-r.start)/1000))]].map(([name,val])=>'<div>'+name+'<strong>'+val+'</strong></div>').join('')+'</div><button class="action" id="raceNew">새 세트 연습하기</button><h3>문항별 결과</h3><div class="raceReview">'+r.questions.map(resultRow).join('')+'</div></section>';
    main.querySelector('#raceNew').onclick=()=>{chosenMinutes=r.minutes;timedRun=null;keepTimed();renderTimed();};
    return;
  }
  const q = bank[r.questions[r.pos]];
  main.innerHTML = '<section class="race raceLive box"><div class="raceTop"><div><p class="kicker">실전 연습 · '+r.minutes+'분</p><h1>'+examName+' 타임어택</h1></div><div class="clockFace"><span>남은 시간</span><strong id="raceTime" role="timer"></strong></div></div><p class="raceProgress">'+solved+' / '+total+'문항 응답</p><progress value="'+solved+'" max="'+total+'" aria-label="응답 문항 수"></progress><p class="kicker">'+q.topic+'</p><h2>문항 '+(r.pos+1)+'</h2><div class="raceQuestion">'+q.body+'</div><fieldset class="raceChoices"><legend>답 선택</legend>'+q.choices.map((html,i)=>'<label><input type="radio" name="raceAnswer" value="'+i+'" '+(r.answers[r.pos]===i?'checked':'')+'><span>'+circles[i]+'</span> '+html+'</label>').join('')+'</fieldset><div class="raceMoves"><button id="racePrev" '+(!r.pos?'disabled':'')+'>이전</button><button id="raceNext" class="action">'+(r.pos===total-1?'제출 확인':'다음 문항 →')+'</button></div><details class="raceIndex"><summary>전체 '+total+'문항 이동</summary><nav class="raceNumbers" aria-label="문항 이동">'+r.questions.map((_,i)=>'<button data-q="'+i+'" aria-label="'+(i+1)+'번 '+(r.answers[i]===null?'미응답':'응답')+'" '+(r.pos===i?'aria-current="step"':'')+' class="'+(r.answers[i]!==null?'answered':'')+'">'+(i+1)+'</button>').join('')+'</nav></details><div class="raceSubmit">'+(confirmFinish?'<strong>현재 '+solved+'문항에 답했습니다. 연습을 끝낼까요?</strong><button id="raceCancel">계속 풀기</button><button class="action" id="raceFinish">제출하고 결과 보기</button>':'<button id="raceAsk">연습 종료하기</button>')+'</div></section>';
  for (const input of main.querySelectorAll('[name=raceAnswer]')) {
    const choice = input.parentElement.cloneNode(true);
    for (const frac of choice.querySelectorAll('mfrac')) {
      const [numerator, denominator] = frac.children;
      frac.replaceWith(denominator.textContent+'분의 '+numerator.textContent);
    }
    input.setAttribute('aria-label', choice.textContent.trim());
  }
  const switcher=document.createElement('div');switcher.innerHTML=shell;
  const switchNav=switcher.querySelector('.seg');if(switchNav)main.querySelector('.raceSubmit').prepend(switchNav);
  function tick() {
    const left=Math.ceil((r.end-Date.now())/1000);
    if(left<=0){finishTimed();return false}
    main.querySelector('#raceTime').textContent=timedClock(left);
    return true;
  }
  if(!tick())return;
  timerId=setInterval(tick,250);
  const moveTo = pos => { r.pos=pos;confirmFinish=false;keepTimed();renderTimed();main.querySelector('.race h2').scrollIntoView({block:'nearest'}); };
  main.querySelectorAll('[name=raceAnswer]').forEach(input=>input.onchange=()=>{
    if(!tick())return;
    r.answers[r.pos]=Number(input.value);keepTimed();renderTimed();
    main.querySelector('[name=raceAnswer]:checked').focus({preventScroll:true});
  });
  main.querySelectorAll('[data-q]').forEach(button=>button.onclick=()=>moveTo(Number(button.dataset.q)));
  main.querySelector('#racePrev').onclick=()=>moveTo(r.pos-1);
  function ask(){confirmFinish=true;renderTimed();main.querySelector('#raceCancel')?.focus()}
  main.querySelector('#raceNext').onclick=r.pos<total-1?()=>moveTo(r.pos+1):ask;
  if(confirmFinish){
    main.querySelector('#raceCancel').onclick=()=>{confirmFinish=false;renderTimed()};
    main.querySelector('#raceFinish').onclick=finishTimed;
  }else main.querySelector('#raceAsk').onclick=ask;
}
