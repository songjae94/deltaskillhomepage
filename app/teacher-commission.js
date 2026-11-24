(() => {
  'use strict';
  const services = [
    { id: 'variant', title: '변형문항 제작', note: '수업에서 다룬 유형은 살리고 조건과 풀이를 새롭게 구성합니다.' },
    { id: 'exam', title: '모의고사 제작', note: '시험 범위와 시간에 맞춰 난이도와 배점을 정하고 한 회분의 시험지와 해설을 만듭니다.' }
  ];
  /* Online requests stay in the signed-in member's workspace. */
  function render() {
    return `<section class="commission-page" aria-labelledby="commission-title">
      <header class="commission-intro"><div><h1 id="commission-title">수업에 맞춘<br>문항 제작</h1><p>선생님의 시험 범위와 수업 자료를 바탕으로 문제지와 해설을 제작합니다.</p></div>
      <div class="commission-photo"><img src="/assets/main/media/teacher_live.jpg" alt="" loading="lazy"></div></header>
      <div class="commission-offers">${services.map(s => `<article><h2>${s.title}</h2><p>${s.note}</p><strong data-commission-rate="${s.id==='variant'?'questions':'mock'}"></strong><button type="button" data-commission-kind="${s.id==='variant'?'questions':'mock'}">${s.title} 의뢰하기 <span aria-hidden="true">↓</span></button></article>`).join('')}</div>
      <div id="commission-online"></div>
    </section>`;
  }
  window.DSCommission = { render };
})();
