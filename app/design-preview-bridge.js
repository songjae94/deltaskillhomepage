// Public display: design b, interior v12, always.
(() => {
  document.documentElement.dataset.design = 'b';
  document.documentElement.dataset.interior = 'v12';
  // Pages that are not open yet: the address is put back to the front page before any routing reads it.
  const closed = ['benefits', 'improve', 'classroom', 'upload', 'school-exams', 'exam-week', 'academy', 'diagnostic', 'diagnostic-run', 'diagnostic-result', 'technology', 'technology-about'];
  const shut = () => {
    if (closed.includes(location.hash.replace(/^#/, '').split(/[/?]/)[0])) history.replaceState(null, '', location.pathname + location.search + '#home');
  };
  shut();
  addEventListener('hashchange', shut);
})();
