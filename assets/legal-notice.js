// 운영 메인 고지 원문: 2026-11-14 확인. 정책을 새로 작성하지 않습니다.
(() => {
  const info=document.querySelector('footer.business-footer .business-info');
  if(!info || info.querySelector('[data-operating-notice]')) return;
  const nav=info.querySelector('nav');
  if(nav && !nav.querySelector('a[href*="/minor/"]')) nav.insertAdjacentHTML('beforeend',"<a href=\"https://www.deltaskill.co.kr/minor/\">미성년자 구매 안내</a>");
  const section=document.createElement('div');section.dataset.operatingNotice='2026-11-14';
  section.innerHTML="<p class=\"src\">자료 출처: 평가원 공개 자료 + EBSi 공개 채점 자료 · 판매 PDF는 델타스킬이 직접 제작한 콘텐츠입니다 · 디지털콘텐츠 환불(받기 전이면 결제일부터 7일 안 전액 환불 · 일부 받았으면 받은 파일 값을 뺀 만큼 7일 안 환불 · 받은 파일은 청약철회 제한) · 변형문항 이용권은 매월 자동 갱신(정기결제) · 그 밖의 상품은 단건 결제 · 데모 화면의 기관 · 이름 · 수치는 가상입니다</p><p class=\"src\">특정 학생의 성적 향상을 보장하지 않습니다.</p><p class=\"copy\">© 2026 델타스킬. All rights reserved.</p>";info.append(section);
})();
