/* Entrance polish v17. Load after deltaskill-next.js; design A remains unchanged. */
(() => {
  'use strict';
  if (window.EntrancePolishV17 || typeof window.cinemaScreen !== 'function') return;
  const originalScreen = window.cinemaScreen;
  const originalShow = window.showCinema;
  const active = () => document.documentElement.dataset.design === 'b';
  const wifi = '<svg viewBox="0 0 20 14" aria-hidden="true"><path d="M1 4Q10-3 19 4M4 7Q10 2 16 7M7 10Q10 8 13 10" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><circle cx="10" cy="13" r="1.1" fill="currentColor"/></svg>';
  const battery = '<svg viewBox="0 0 28 14" aria-hidden="true"><rect x="1" y="1" width="23" height="12" rx="3" fill="none" stroke="currentColor"/><rect x="3" y="3" width="19" height="8" rx="1.5" fill="currentColor"/><path d="M26 4v6" stroke="currentColor" stroke-width="2"/></svg>';
  function screen(index) {
    if (!active()) return originalScreen(index);
    if (index === 0) return '';
    const timed = index === 2;
    const description = timed ? '실제 타임어택 연습 화면. 50분 25문항, 수식과 답안 번호판' : '실제 자료 만들기 화면. 단원과 지면을 선택하고 수학 프린트 제작';
    return `<div class="cinema-tablet ip19-device ${timed ? 'time-tablet' : ''}" role="img" aria-label="${description}">
      <span class="ip19-edge" aria-hidden="true"></span>
      <div class="ip19-glass">
        <div class="ip19-statusbar" aria-hidden="true"><span>9:41</span><span>${wifi} 100% ${battery}</span></div>
        <img class="ip19-screen" src="assets/hero-v19/${timed ? 'time' : 'worksheet'}-screen.jpg?v=21.1" width="1024" height="724" alt="${description}" decoding="async">
        <div class="ip19-system-bottom" aria-hidden="true"><span class="ip19-home-indicator"></span></div>
        <span class="ip19-reflection" aria-hidden="true"></span>
      </div>
      <span class="ip19-camera" aria-hidden="true"></span><span class="ip19-power" aria-hidden="true"></span>
      <span class="ip19-volume one" aria-hidden="true"></span><span class="ip19-volume two" aria-hidden="true"></span>
    </div>`;
  }
  window.cinemaScreen = screen;
  function mountRequestLink() {
    const dock = document.querySelector('.home-body .role-dock');
    const existing = dock?.querySelector('.ip23-request-entry');
    if (!active()) { existing?.remove(); return; }
    if (!dock || existing) return;
    const entry = document.createElement('a');
    entry.className = 'ip23-request-entry';
    entry.href = '#technology';
    entry.dataset.techReturn = 'home';
    entry.innerHTML = '<span class="ip26-request-mark" aria-hidden="true"><svg viewBox="0 0 40 40" fill="none"><path class="ip26-sheet-back" d="M13 5h17a3 3 0 0 1 3 3v21a3 3 0 0 1-3 3H13z"/><path class="ip26-sheet-front" d="M8 10h16l6 6v18a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V12a2 2 0 0 1 2-2Z"/><path class="ip26-sheet-fold" d="M24 10v6h6"/><path class="ip26-sheet-ink" d="M12 22h12m-12 5h8"/></svg></span><span class="ip25-request-copy"><strong>변형문항 만들기</strong><span>사진,pdf를 내문제로</span></span><span class="ip25-request-arrow" aria-hidden="true"><svg viewBox="0 0 20 20" fill="none"><path d="M5 15 15 5M5 5h10v10"/></svg></span>';
    dock.append(entry);
  }
  window.showCinema = function(index) {
    originalShow(index);
    if (!active()) return;
    const title = document.getElementById('cinema-title');
    const label = document.getElementById('cinema-label');
    if (title) title.innerHTML = ['수학,<br>여기 다 있다.','공부할 자료도,<br>가르칠 자료도.','시간 안에 푸는<br>연습까지.'][index];
    if (label) label.textContent = ['', '내신 · 수능 · 수업 자료', '타임어택 · 50분 25문항 / 25분 13문항'][index];
    document.querySelector('[data-cinema="1"]')?.setAttribute('aria-label', '공부·수업 자료');
  };
  function refresh() {
    const stage = document.querySelector('.home-body .cinema');
    if (stage) window.showCinema(Number(stage.dataset.scene) || 0);
    mountRequestLink();
  }
  new MutationObserver(refresh).observe(document.documentElement, {attributes:true, attributeFilter:['data-design']});
  const entranceDock = document.getElementById('dock');
  if (entranceDock) new MutationObserver(mountRequestLink).observe(entranceDock, {childList:true});
  window.EntrancePolishV17 = {refresh};
  refresh();
})();
