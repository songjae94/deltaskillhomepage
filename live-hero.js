(() => {
  const intro=document.querySelector('#journey .intro');
  const routes=document.createElement('nav');routes.className='hero-routes';routes.setAttribute('aria-label','바로 시작할 작업');intro.append(routes);
  function render(){
    const teacher=role==='teacher';
    document.querySelector('#title').innerHTML=teacher?'내 수업에 필요한<br><em>수학 자료를 고르세요.</em>':'지금 필요한 공부,<br><em>여기서 시작하세요.</em>';
    document.querySelector('#desc').textContent=teacher?'프린트와 교재 구성 미리보기에서 지면과 제공 상태를 확인하세요.':'문제를 풀고, 막히면 필요한 설명과 연습으로 이어가세요.';
    const materials='#library';
    const items=teacher?[
      ['materials','수업 프린트 안내',materials],
      ['build','교재 한 권 만들기 안내','#lesson-studio'],
      ['teacher','강사 개인페이지','#instructor'],
      ['management','학원 관리 · 구성안','features/academy-plan.html']
    ]:[
      ['materials','교재 찾기 안내',materials],
      ['practice','난이도별 연습','#level-practice'],
      ['note','오답노트','#wrong-note'],
      ['timed','타임어택','#time-attack'],
      ['forecast','수능예측','#prediction']
    ];
    routes.replaceChildren();
    const details={materials:teacher?'구성 미리보기 · 검수 중':'시험 범위별 자료와 무료 회차',build:'구성 미리보기 · 검수 중',teacher:'수업 소개와 자료를 한곳에',management:'반·진도·과제 운영 구성안',timed:'제한 시간 안에 정확하게',note:'틀린 문제를 다시 내 것으로',practice:'기초부터 수능형까지',forecast:'남은 기간 준비할 유형 확인'};
    for(const [index,item] of items.entries()){
      const link=document.createElement('a');link.href=item[2];link.className='hero-route';link.dataset.view=item[0];
      link.innerHTML='<span class="route-index" aria-hidden="true">'+String(index+1).padStart(2,'0')+'</span><span class="route-copy"><strong>'+item[1]+'</strong><small>'+details[item[0]]+'</small></span><span class="route-arrow" aria-hidden="true">↗</span>';
      routes.append(link);
    }
    document.body.classList.remove('has-workspace');
  }
  window.addEventListener('delta-view',render);render();
})();
