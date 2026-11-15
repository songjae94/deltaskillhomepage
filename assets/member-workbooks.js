(() => {
  const panel = document.querySelector('[data-member-books]');
  if (!panel) return;
  panel.setAttribute('aria-label', '내신 자료 이용 안내');
  panel.innerHTML = '<h2>내신 자료</h2><p>부교재별 구성과 받을 수 있는 파일은 내신 자료에서 확인하세요.</p><p><a href="/naesin/">내신 자료 보기</a> · <a href="/orders/">구매한 파일 받기</a></p>';
  panel.hidden = false;
})();
