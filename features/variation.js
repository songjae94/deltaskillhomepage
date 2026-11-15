(() => {
  const links = [...document.querySelectorAll('.comparison nav a')];
  function show() {
    const active = links.find(link => link.hash === location.hash) || links[0];
    for (const link of links) {
      const selected = link === active;
      link.setAttribute('aria-current', selected ? 'step' : 'false');
      document.getElementById(link.hash.slice(1)).hidden = !selected;
    }
  }
  for (const link of links) link.onclick = event => {
    event.preventDefault();
    history.pushState(null, '', link.hash);
    show();
  };
  window.addEventListener('popstate', show);
  show();

  const query = new URLSearchParams(location.search);
  const origin = query.get('from');
  const fromStudio = origin === 'home' && query.get('section') === 'lesson-studio';
  const back = document.querySelector('#return');
  const localReferrer = document.referrer ? new URL(document.referrer) : null;
  const previousQuery = localReferrer?.origin === location.origin && /\/(?:home|index)\.html$/.test(localReferrer.pathname)
    ? localReferrer.searchParams : new URLSearchParams();
  const context = new URLSearchParams();
  for (const key of ['audience','exam','palette']) {
    const value = query.get(key) || previousQuery.get(key);
    if (value) context.set(key, value);
  }
  const suffix = context.size ? '?' + context : '';
  const destinations = {
    teacher: ['teacher.html' + suffix, '수학 교실로 →'],
    guide: ['../guide/index.html' + suffix, '이용 안내로 →']
  };
  const studio = ['../home.html' + suffix + '#lesson-studio', '홈의 교재 소개로 →'];
  const home = ['../home.html' + suffix + '#technology', '홈의 학습 기술로 →'];
  const [href, label] = Object.hasOwn(destinations, origin) ? destinations[origin] : fromStudio ? studio : home;
  back.href = href;
  back.textContent = label;
  document.querySelector('#case-compose').href = window.deltaComposerUrl('book');
})();
