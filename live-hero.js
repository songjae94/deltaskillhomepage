(() => {
  const intro=document.querySelector('#journey .intro');
  const routes=document.createElement('nav');routes.className='hero-routes';routes.setAttribute('aria-label','바로 시작할 작업');intro.append(routes);
  function render(){
    const teacher=role==='teacher';
    document.querySelector('#title').innerHTML=teacher?'내 수업에 필요한<br><em>수학 자료를 고르세요.</em>':'지금 필요한 공부,<br><em>여기서 시작하세요.</em>';
    document.querySelector('#desc').textContent=teacher?'단원별 변형 문제집을 고르고, 지면을 미리 본 뒤 바로 받으세요.':'문제를 풀고, 막히면 필요한 설명과 연습으로 이어가세요.';
    /* 39 창 1119: 첫 카드는 지금 되는 것만 — 선생님 둘(문제집 고르기 · 이용권) · 학생 첫 카드도 같은 고르기로 */
    const items=teacher?[
      ['naesin','내신 변형 문제집 고르기','/naesin/'],
      ['pass','변형문항 이용권','/pass/']
    ]:[
      ['naesin','내신 변형 문제집 고르기','/naesin/'],
      ['practice','난이도별 연습','#level-practice'],
      ['note','오답노트','#wrong-note'],
      ['timed','타임어택','#time-attack'],
      ['forecast','수능예측','#prediction']
    ];
    routes.replaceChildren();
    const details={naesin:sale||'단원별 변형 문항 · 해설 PDF',pass:'변형문항을 골라 프린트로 받는 1개월 이용권',timed:'제한 시간 안에 정확하게',note:'틀린 문제를 다시 내 것으로',practice:'기초부터 수능형까지',forecast:'남은 기간 준비할 유형 확인'};
    for(const [index,item] of items.entries()){
      const link=document.createElement('a');link.href=item[2];link.className='hero-route';link.dataset.view=item[0];
      link.innerHTML='<span class="route-index" aria-hidden="true">'+String(index+1).padStart(2,'0')+'</span><span class="route-copy"><strong>'+item[1]+'</strong><small>'+details[item[0]]+'</small></span><span class="route-arrow" aria-hidden="true">↗</span>';
      routes.append(link);
    }
    document.body.classList.remove('has-workspace');
  }
  /* 판매 책 수 · 가장 낮은 값은 catalog.json 에서 센다(naesin/on-sale.js · 손으로 적은 수 없음) */
  let sale='';
  if(window.DSOnSale)window.DSOnSale.load().then(items=>{if(!items.length)return;const low=Math.min(...items.map(p=>p.price));sale='판매 중 '+items.length+'권 · '+low.toLocaleString('ko-KR')+'원부터 · 지면 미리보기';render();});
  window.addEventListener('delta-view',render);render();
})();
