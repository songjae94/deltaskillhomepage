(() => {
  'use strict';
  const list = document.querySelector('#featuresList');
  const select = document.querySelector('#season');
  if (!list || !select) return;
  const sections = new Map([...list.children].map(section => [section.dataset.chapter, section]));
  const orders = {
    learn: ['levels', 'note', 'timed', 'books', 'forecast', 'teacher'],
    csat: ['forecast', 'timed', 'note', 'levels', 'books', 'teacher'],
    school: ['books', 'timed', 'note', 'levels', 'forecast', 'teacher'],
    review: ['note', 'levels', 'timed', 'books', 'forecast', 'teacher'],
    teaching: ['books', 'teacher', 'timed', 'note', 'levels', 'forecast']
  };
  const labels = {books:'교재 찾기', forecast:'수능예측', note:'오답노트', teacher:'강사 개인페이지', timed:'타임어택', levels:'난이도별 연습'};
  if (![...select.options].some(option => option.value === 'learn')) select.add(new Option('학생 학습 흐름', 'learn'), 0);
  const url = new URL(location.href);
  let explicit = Object.hasOwn(orders, url.searchParams.get('season')) ? url.searchParams.get('season') : null;
  let currentAudience = 'student';
  let currentExam = 'school';
  const timedSection = sections.get('timed');
  const timedPreview = timedSection.querySelector('.timedPreview');
  const modes = {
    school: {label:'내신',full:[50,24,20],short:[20,10,10]},
    csat: {label:'수능',full:[100,30,25],short:[50,15,15]}
  };
  let timedMode = 'full';
  function renderTimed() {
    const config = modes[currentExam];
    const [minutes,count,solved] = config[timedMode];
    timedSection.querySelector('.chapterCopy > p').textContent = config.label + ' 타임어택';
    timedSection.querySelector('.bodyCopy').textContent = config.full[0] + '분 실전에서는 ' + config.full[1] + '문항에 도전합니다. 짧게 연습할 때는 ' + config.short[0] + '분 ' + config.short[1] + '문항을 선택하세요. 시험을 마치면 푼 문항 수와 맞힌 문항 수, 정확도를 확인할 수 있습니다.';
    timedPreview.querySelector('h3').textContent = config.label + ' 실전 연습';
    for (const option of timedPreview.querySelectorAll('[data-mode]')) {
      const key = option.dataset.mode;
      const [time,total] = config[key];
      option.dataset.minutes = time;
      option.textContent = key === 'full' ? time + '분 실전' : time + '분 ' + total + '문항';
      option.setAttribute('aria-pressed',String(key === timedMode));
    }
    timedPreview.querySelector('#timedMinutes').firstChild.nodeValue = String(minutes);
    timedPreview.querySelector('#timedCount').textContent = count + '문항';
    timedPreview.querySelector('#timedSolved').textContent = solved + '개';
    timedPreview.querySelector('#timedCorrect').textContent = (solved * .8) + '개';
    const launch = timedPreview.querySelector('#timedLaunch');
    launch.href = 'study/index.html?exam=' + currentExam + '&minutes=' + minutes + '#timed';
    launch.textContent = (timedMode === 'full' ? minutes + '분 실전' : minutes + '분 ' + count + '문항') + ' 열기 ↗';
  }
  timedPreview.querySelector('.timedModes').addEventListener('click', event => {
    const option = event.target.closest('button[data-mode]');
    if (!option) return;
    timedMode = option.dataset.mode;
    renderTimed();
  });

  // The current finals campaign runs through the end of December in Korea.
  function schoolExamCampaign(date = new Date()) {
    const day = new Intl.DateTimeFormat('sv-SE', {
      timeZone:'Asia/Seoul',year:'numeric',month:'2-digit',day:'2-digit'
    }).format(date);
    return day >= '2026-11-13' && day <= '2026-12-31';
  }

  function arrange(season) {
    select.value = season;
    const nav = document.querySelector('#chapters');
    nav.replaceChildren();
    for (const key of orders[season]) {
      const section = sections.get(key);
      if (!section) continue;
      section.hidden = currentAudience === 'student' ? key === 'teacher' : ['timed','note','levels','forecast'].includes(key);
      if(section.hidden)continue;
      list.append(section);
      const jump = document.createElement('a');
      jump.href = '#' + section.id; jump.textContent = labels[key]; nav.append(jump);
    }
    const schoolFirst = season === 'school' && currentExam === 'school';
    const shelf = sections.get('books');
    shelf.querySelector('.brandline').textContent = schoolFirst ? '내신 시험 대비' : '델타스킬 자료실';
    const allBooks = document.querySelector('#allBooks');
    allBooks.textContent = schoolFirst ? '내신 시험 대비 자료 보기 →' : '자료 전체 보기 →';
    allBooks.href = document.querySelector(schoolFirst ? '#schoolBooks' : currentExam === 'csat' ? '#csatBooks' : '#schoolBooks').href;
    const studio = document.querySelector('#lesson-studio');
    const features = document.querySelector('#features');
    const educator = currentAudience !== 'student';
    studio.hidden=!educator;
    if(educator){const a=document.createElement('a');a.href='#lesson-studio';a.textContent='쪽 구성';nav.insertBefore(a,nav.children[1]||null);} /* 39 창 1119: 학원 관리 쪽 바로가기 뺌(쪽 파일은 남김) */
    if (educator && season === 'teaching') features.before(studio);
    else if (educator && season === 'school') sections.get('books').after(studio);
    else features.after(studio);
    const leadingStudio = features.previousElementSibling === studio;
    const first = sections.get(orders[season][0]);
    const heroJump = document.querySelector('.season-jump');
    heroJump.href = '#' + (leadingStudio ? studio.id : first.id);
    heroJump.textContent = (leadingStudio ? '수업 교재 미리보기' : labels[first.dataset.chapter]) + ' ↘';
  }

  select.onchange = () => {
    explicit = select.value;
    arrange(explicit);
    const next = new URL(location.href);
    next.searchParams.set('season', explicit);
    try { history.replaceState(null, '', next); } catch {}
  };

  function fromView(role, exam) {
    currentAudience = ['teacher','academy'].includes(role) ? role : 'student';
    const nextExam = exam === 'csat' ? 'csat' : 'school';
    if (currentExam !== nextExam) timedMode = 'full';
    currentExam = nextExam;
    renderTimed();
    document.querySelector('#chapter-heading').textContent=currentAudience==='student'?'지금 필요한 수학 연습':'수업에 필요한 자료와 기능';
    const context=new URLSearchParams({exam:currentExam,audience:currentAudience});
    for(const link of document.querySelectorAll('.teacherRoute'))link.href='features/teacher.html?'+context;
    for(const link of document.querySelectorAll('.paperShelf a')){
      const next=new URL(link.href);
      next.searchParams.set('audience',currentAudience);
      link.href=next.href;
    }
    for (const link of document.querySelectorAll('.noteRoute')) {
      link.href = 'study/index.html?exam=' + currentExam + '&item=notebook#' + (link.classList.contains('clipSurface') ? 'practice' : 'note');
      if (link.classList.contains('clipSurface')) link.setAttribute('aria-label','영상 속 문제로 오답 기록 연습하기');
    }
    const examCampaign = currentExam === 'school' && schoolExamCampaign();
    const usualOrder = currentAudience === 'student' ? (currentExam === 'csat' ? 'csat' : 'learn') : 'teaching';
    arrange(explicit || (examCampaign ? 'school' : usualOrder));
  }

  window.addEventListener('delta-view', e => fromView(e.detail.role, e.detail.exam));
  fromView(url.searchParams.get('audience'),url.searchParams.get('exam'));
  const target = document.getElementById(location.hash.slice(1));
  if (target && list.contains(target)) requestAnimationFrame(() => target.scrollIntoView());
})();
