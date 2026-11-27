(() => {
  const params = new URLSearchParams(location.search);
  const role = ['teacher','academy'].includes(params.get('audience')) ? params.get('audience') : 'student';
  const exam = params.get('exam') === 'csat' ? 'csat' : 'school';
  const name = {student:'학생',teacher:'선생님',academy:'학원'}[role];
  function route(path, extra={}, hash='') {
    return path + '?' + new URLSearchParams({exam,audience:role,...extra}) + hash;
  }
  const find = id => document.getElementById(id);
  for (const a of document.querySelectorAll('[data-for]')) {
    a.href = route('index.html',{audience:a.dataset.for});
    if (a.dataset.for === role) a.setAttribute('aria-current','page');
  }
  document.querySelectorAll('header a').forEach(a => {if(!a.closest('.ds-menu,.ds-acct'))a.href='/'});
  for(const key of ['school','csat'])find(key).href=route('../materials/index.html',{exam:key});
  find('custom').href=route('../materials/index.html',{exam:'school',view:'studio'});
  find('study').href=route('../study/index.html',{},'#note');
  find('variation').href=route('../features/variation.html',{from:'guide'});
  find('guide-kicker').textContent = name+' · '+(exam==='school'?'내신':'수능');
  find('guide-heading').textContent = role==='student'?'어떻게 공부할까요?':role==='academy'?'우리 반 교재 준비':'다음 수업 준비';
  const steps = role === 'student' ? [
    ['단원별 공부','연습할 주제를 골라 문제 풀기',route('../study/index.html',{},'#hub')],
    ['타임어택',exam==='csat'?'100분 실전 또는 50분 집중 연습':'50분 실전 또는 20분 집중 연습',route('../study/index.html',{},'#timed')],
    ['오답노트','기록한 문제 다시 풀기',find('study').href]
  ] : [
    [role==='academy'?'반별 교재 만들기':'수업 교재 만들기','문항 수와 지면을 정해 공개 교재 PDF 받기',route('../materials/embed.html')],
    ['판매 교재 찾기',exam==='csat'?'준비할 번호와 과목으로 선택':'수업 단원과 필요한 유형으로 선택',route('../materials/index.html')],
    ['강사 개인페이지','수업 자료와 복습이 이어지는 예시 보기',route('../features/teacher.html')]
  ];
  for (const [title,detail,href] of steps) {
    const a=document.createElement('a'), text=document.createElement('div'), strong=document.createElement('strong'), description=document.createElement('small');
    a.href=href;strong.textContent=title;description.textContent=detail;text.append(strong,description);a.append(text,'→');find('guide-actions').append(a);
  }
})();
