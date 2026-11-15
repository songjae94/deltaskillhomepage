(() => {
  const heading = document.querySelector('#library h2');
  const original = heading.textContent;
  const intro = document.createElement('div');
  intro.className = 'teacher-print-intro';
  intro.innerHTML = '<p><strong>구성 미리보기 · 검수 중</strong><br>수업, 숙제, 시험 대비에 필요한 단원과 유형을 골라 지면을 구성할 수 있습니다. 한글(HWPX) 파일과 출력 결과를 검수 중입니다.</p><a href="/composer/?mode=handout">수업 프린트 구성 시작 ↗</a>';
  document.querySelector('#library .shelfTop').after(intro);
  const compose = intro.querySelector('a');

  function sync() {
    const teacher = role === 'teacher';
    intro.hidden = !teacher;
    heading.textContent = teacher ? '필요한 만큼, 수업 프린트' : original;
    compose.href = window.deltaComposerUrl('handout');
    for (const link of document.querySelectorAll('#chapters a')) {
      if (link.hash === '#library') link.textContent = teacher ? '수업 프린트 안내' : '교재 찾기 안내';
      if (link.hash === '#lesson-studio') link.textContent = '교재 한 권 만들기 안내';
    }
    const sample = document.querySelector('#library .sampleRoute');
    if (sample) {
      sample.setAttribute('aria-label', '공개 교재 디자인 예시 보기');
      sample.querySelector('.sampleCall').textContent = '디자인 예시 보기 →';
    }
    document.querySelector('#allBooks').textContent = teacher ? '제공 자료와 샘플 보기 →' : '자료 전체 보기 →';
  }

  window.addEventListener('delta-view', sync);
  sync();
})();
