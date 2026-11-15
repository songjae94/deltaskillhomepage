// 구성창의 공개 위치가 확정되면 이 값만 바꿉니다. 개발 주소는 서버 환경값으로 둡니다.
window.DELTA_SITE = Object.freeze({ composer: '/composer/' });
window.deltaComposerUrl = function (mode) {
  const current = new URL(location.href);
  const target = new URL(window.DELTA_SITE.composer, location.origin);
  target.searchParams.set('mode', mode === 'book' ? 'book' : 'handout');
  target.searchParams.set('audience', ['teacher','academy'].includes(current.searchParams.get('audience')) ? 'teacher' : 'student');
  target.searchParams.set('exam', current.searchParams.get('exam') === 'csat' ? 'csat' : 'school');
  return target.origin === location.origin ? target.pathname + target.search : target.href;
};
