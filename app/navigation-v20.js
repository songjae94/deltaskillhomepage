/* Navigation by intent: learn first; keep both document collections together. */
(() => {
  'use strict';
  const originalHeader = header, originalLibrary = libraryPage, originalFooter = compactFooter;
  compactFooter = function() { return originalFooter().replace('<button data-feedback', '<a href="#technology" data-tech-return="footer">델타스킬 기술</a><button data-feedback'); };
  let libraryView = 'school', studyContext = 'school', libraryJump = false;
  const learningPages = ['student','practice','timed','diagnostic','diagnostic-run','diagnostic-result','progress'];
  let headerLoginTarget = '';
  window.addEventListener('hashchange', event => {
    if (new URL(event.oldURL).hash !== '#login') return;
    if (headerLoginTarget && window.DSLoginReturn === headerLoginTarget && !DSService.session()) window.DSLoginReturn = '';
    headerLoginTarget = '';
  });
  function renderHeader(page) {
    // Legacy studio links use the same teacher workspace and visual identity.
    if (page === 'studio') page = 'teacher';
    if (page === 'diagnostic-result' && !localDiagnosticAttempts().length) page = 'diagnostic';
    originalHeader(page);
    const meta = document.querySelector('#header .meta');
    const login = meta?.querySelector('a[href="#login"]');
    if (login && (page === 'teacher' || page === 'student')) {
      login.addEventListener('click', () => {
        headerLoginTarget = '#' + page;
        window.DSLoginReturn = headerLoginTarget;
      });
    }
    if (meta && DSService.session()) {
      const logout = document.createElement('button');
      logout.type = 'button';
      logout.className = 'header-account-logout';
      logout.dataset.accountAction = 'logout';
      logout.textContent = '로그아웃';
      meta.append(logout);
    }
    const nav = document.querySelector('#header nav[aria-label="주 메뉴"]');
    if (!nav) return;
    const teacher = role === 'teacher';
    const csatLabel=Date.now()<Date.parse('2026-12-26T00:00:00+09:00')?'수능 공부 · 12/26 예정':'수능 공부';
    const items = teacher ? [['teacher','자료 만들기'],['library','자료실']] : [['student','내신 공부'],['csat',csatLabel],['library','자료실']];
    const current = learningPages.includes(page) ? (studyContext === 'csat' ? 'csat' : 'student') : page === 'upload' ? (teacher ? 'teacher' : 'library') : page === 'material' ? 'library' : ['studio','print-design'].includes(page) ? 'teacher' : page;
    nav.innerHTML = items.map(([key,label])=>`<a href="#${key}"${key===current?' aria-current="page"':''}${key==='student'?' data-study-context="school"':''}>${label}</a>`).join('');
    if (page === 'student') document.title = (studyContext === 'csat' ? '수능 공부' : '내신 공부') + ' · DELTASKILL';
    if (page === 'library') document.title = '자료실 · DELTASKILL';
    if (page === 'csat') document.title = '수능 공부 · DELTASKILL';
    if (page === 'technology') document.title = '델타스킬 기술 · DELTASKILL';
    if (page === 'upload') document.title = '유사문항 제작 요청 · DELTASKILL';
    const pageTitles = {timed:'타임어택',practice:'문제 풀기',diagnostic:'단원 진단','diagnostic-run':'단원 진단','diagnostic-result':'진단 결과',progress:'학습 기록','print-design':'내 지면 디자인',benefits:'PDF 체험 안내'};
    if (pageTitles[page]) document.title = pageTitles[page] + ' · DELTASKILL';
  }
  header = renderHeader;
  libraryPage = function() {
    const template = document.createElement('template'); template.innerHTML = originalLibrary();
    const root = template.content.querySelector('.resource-surface');
    const finder = root?.querySelector('.lf19-finder');
    if (!root || !finder) return template.innerHTML;
    root.classList.add('nv20-library'); root.dataset.collection = libraryView;
    const title = root.querySelector('.library-heading h1'); if (title) title.textContent = '자료실';
    const sub = root.querySelector('.library-heading p'); if (sub) sub.textContent = libraryView === 'exams' ? '기출 문제와 해설을 함께.' : '시험 범위로 찾아보세요.';
    const related = root.querySelector('.library-other');
    if (related) { related.href='#csat'; related.innerHTML='<span>문제를 풀고 싶다면</span><strong>수능 공부 →</strong>'; }
    const tabs = document.createElement('nav'); tabs.className='nv20-collections'; tabs.setAttribute('aria-label','자료실 분류');
    tabs.innerHTML = [['school','내신 자료'],['exams','기출·해설']].map(([id,label])=>`<button type="button" data-library-view="${id}" aria-pressed="${libraryView===id}">${label}</button>`).join('');
    finder.before(tabs);
    if (libraryView === 'exams') {
      const archive = document.createElement('div'); archive.className = 'nv20-exam-materials';
      archive.innerHTML = window.DSCSATLearningV20?.archiveMarkup?.() || '<a class="primary" href="#csat">기출·해설 보기 →</a>';
      finder.replaceWith(archive);
      const photo = root.querySelector('.library-v13-exhibit-photo'); if(photo) photo.src='assets/editorial/csat-material-v13.webp';
      const exhibit = root.querySelector('.library-v12-exhibit');
      if(exhibit){exhibit.href='#csat';exhibit.setAttribute('aria-label','수능 공부로 이동');}
      const caption=root.querySelector('.library-v12-exhibit-link'); if(caption) caption.textContent='수능 공부 →';
      root.querySelector('.library-maker-link')?.remove();
    }
    return template.innerHTML;
  };
  function redrawLibrary() {
    const main=document.getElementById('content');
    if(location.hash!=='#library'||!main)return;
    main.innerHTML=libraryPage();
    const tab=main.querySelector(`[data-library-view="${libraryView}"]`);
    tab?.focus({preventScroll:true});
    main.querySelector('.nv20-collections')?.scrollIntoView({block:'start',behavior:'auto'});
  }
  document.addEventListener('click', event => {
    const target=event.target.closest('[data-study-context]');
    if(target && ['school','csat'].includes(target.dataset.studyContext)) studyContext=target.dataset.studyContext;
    const direct=event.target.closest('#header nav a[href="#student"]');
    if(direct && location.hash==='#student') renderHeader('student');
    const collection=event.target.closest('[data-library-view]');
    if(!collection||!['school','exams'].includes(collection.dataset.libraryView))return;
    libraryView=collection.dataset.libraryView;
    if(collection.tagName==='BUTTON'){event.preventDefault();redrawLibrary();}
    else if(location.hash==='#library')redrawLibrary();
    else libraryJump=true;
  },true);
  window.addEventListener('hashchange',()=>{ if(location.hash==='#library' && libraryJump){libraryJump=false;requestAnimationFrame(()=>document.querySelector('.nv20-collections')?.scrollIntoView({block:'start',behavior:'auto'}));} });
  window.DSNavigationV20={getLibraryView:()=>libraryView,getStudyContext:()=>studyContext};
  const footerButton=document.querySelector('.work-footer button[data-feedback]');
  if(footerButton && !document.querySelector('.work-footer a[href="#technology"]')) {
    const tech=document.createElement('a');tech.href='#technology';tech.dataset.techReturn='footer';tech.textContent='델타스킬 기술';footerButton.before(tech);
  }
  header(document.body.dataset.page || location.hash.slice(1) || 'home');
  if(location.hash==='#library')document.getElementById('content').innerHTML=libraryPage();
})();
