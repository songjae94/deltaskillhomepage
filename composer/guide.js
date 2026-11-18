(() => {
  const query = new URLSearchParams(location.search);
  const handout = query.get('mode') === 'handout';
  const title = handout ? '수업 프린트 만들기' : '교재 한 권 만들기';
  document.title = title + ' · 델타스킬';
  document.querySelector('#composer-title').textContent = title;
  if (handout) document.querySelector('#composer-description').textContent = '수업과 숙제에 필요한 단원과 유형을 고르는 프린트를 준비하고 있습니다.';

  const audience = ['teacher', 'academy'].includes(query.get('audience')) ? query.get('audience') : 'student';
  const exam = query.get('exam') === 'csat' ? 'csat' : 'school';
  const context = new URLSearchParams({audience, exam});
  document.querySelector('#composer-home').href = '/home.html?' + context + (handout ? '#library' : '#lesson-studio');
  const materials = document.querySelector('#composer-materials');
  if (materials) materials.href = '/materials/?' + context;
  document.querySelector('#composer-sample').href = '/assets/sample-picker.html?' + context;
})();
