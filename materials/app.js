(() => {
  const query = new URLSearchParams(location.search);
  const isCsat = query.get('exam') === 'csat';
  const audience = ['teacher', 'academy'].includes(query.get('audience')) ? 'teacher' : 'student';
  const context = new URLSearchParams({exam:isCsat ? 'csat' : 'school', audience});
  const school = document.querySelector('#school-materials');
  const csat = document.querySelector('#csat-materials');
  school.hidden = isCsat;
  csat.hidden = !isCsat;
  for (const tab of document.querySelectorAll('[data-exam-tab]')) {
    tab.href = '/materials/?' + new URLSearchParams({exam:tab.dataset.examTab, audience});
    if (tab.dataset.examTab === context.get('exam')) {
      tab.classList.add('on');
      tab.setAttribute('aria-current','page');
    }
  }
  document.querySelector('#design-samples').href = '/assets/sample-picker.html?' + context;
  for (const link of document.querySelectorAll('[data-compose-mode]')) link.href = window.deltaComposerUrl(link.dataset.composeMode);

})();
