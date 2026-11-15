(() => {
  const url = new URL(location.href);
  if (url.searchParams.has('audience') || url.searchParams.has('exam') || (url.hash && url.hash !== '#entrance')) {
    url.pathname = url.pathname.replace(/(?:index\.html)?$/, 'home.html');
    location.replace(url.href);
    return;
  }
  const passage = document.querySelector('.passage');
  const status = document.querySelector('#gateStatus');
  let entering = false;
  const palette = url.searchParams.get('palette');
  if (palette === 'ink' || palette === 'green') {
    document.querySelectorAll('.entrances a, .browse').forEach(link => {
      const target = new URL(link.href);
      target.searchParams.set('palette', palette);
      link.href = target.href;
    });
  }
  window.addEventListener('pageshow', () => {
    entering = false;
    passage.hidden = true;
    passage.classList.remove('open');
    document.body.classList.remove('entering','launching');
    status.textContent = '';
  });
  document.querySelectorAll('.entrances a').forEach(link => {
    link.addEventListener('click', async event => {
      if (event.button || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      event.preventDefault();
      if (entering) return;
      entering = true;
      document.body.classList.add('launching');
      status.textContent = '페이지를 여는 중입니다';
      passage.hidden = false;
      requestAnimationFrame(() => requestAnimationFrame(() => passage.classList.add('open')));
      setTimeout(() => {
        try { sessionStorage.setItem('delta-gate-arrival', JSON.stringify({href:link.href,time:Date.now()})); } catch {}
        location.assign(link.href);
      }, 420);
    });
  });
})();
