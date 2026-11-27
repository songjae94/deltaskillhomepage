// Old bookmarks and campaign links now open the matching live screen.
(() => {
  'use strict';
  const from = new URL(location.href);
  const section = from.hash.slice(1);
  const audience = from.searchParams.get('audience');
  const teacher = audience === 'teacher' || audience === 'academy';
  const exam = from.searchParams.get('exam');
  const csat = exam === 'csat';
  const library = csat ? '/app/?csatMode=downloads#csat'
    : teacher ? '/app/?teacherMode=materials#teacher' : '/app/?studentMode=downloads#student';
  const entry = csat ? (teacher ? '/app/?csatMode=create#csat' : '/app/#csat')
    : teacher ? '/app/#teacher' : audience === 'student' || audience === 'school' || exam === 'school' ? '/app/#student' : '/';

  function destination() {
    switch (section) {
      case 'student': case 'school': return csat ? '/app/#csat' : '/app/#student';
      case 'teacher': case 'academy': return csat ? '/app/?csatMode=create#csat' : '/app/#teacher';
      case 'csat': return '/app/#csat';
      case 'bizinfo': case 'about': case 'about-title': case 'entrance': return '/#' + section;
      case 'lesson-studio': case 'teacher-film': case 'lessonPreview': case 'sale-shelf':
        return csat ? library : '/naesin/';
      case 'library': case 'allBooks': return library;
      case 'schoolBooks': return '/naesin/';
      case 'csatBooks': return '/app/?csatMode=downloads#csat';
      case 'prediction': return '/features/prediction.html';
      case 'instructor': case 'teacherAbout': return '/features/teacher.html';
      case 'technology': return '/app/#technology';
      case 'wrong-note': case 'review': return '/my/notes/';
      case 'time-attack': case 'level-practice': {
        // These bookmarked activities use the original timed sets and difficulty choices.
        const target = new URL('/study/', from.origin);
        target.searchParams.set('exam', csat ? 'csat' : 'school');
        if (section === 'time-attack') {
          const minutes = from.searchParams.get('minutes');
          target.searchParams.set('minutes', ['20','50','100'].includes(minutes) ? minutes : csat ? '100' : '50');
          target.hash = 'timed';
        } else {
          const item = from.searchParams.get('item');
          target.searchParams.set('item', ['easy','middle','hard'].includes(item) ? item : 'middle');
          target.hash = 'practice';
        }
        return target;
      }
      case 'how': return '/guide/';
      case 'faq': return '/guide/#faq';
      case 'data': return '/partners/#data';
      case 'rx': return '/app/#diagnostic';
      case 'workspace': case 'story': case 'features': return entry === '/' ? '/app/#student' : entry;
      default: return entry;
    }
  }

  const target = new URL(destination(), from.origin);
  if (section === 'prediction' && from.searchParams.has('item')) target.searchParams.set('item', from.searchParams.get('item'));
  for (const [key, value] of from.searchParams) {
    if (target.pathname === '/features/teacher.html' && ['exam','audience','palette'].includes(key)) target.searchParams.set(key, value);
    if (key.startsWith('utm_')) target.searchParams.append(key, value);
  }
  if (target.href !== from.href) location.replace(target.href);
})();
