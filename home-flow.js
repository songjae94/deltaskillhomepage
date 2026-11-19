(() => {
  const menu = document.querySelector('#more-menu');
  const toggle = document.querySelector('#menu-toggle');
  const mobile = matchMedia('(max-width: 760px)');

  if (menu && toggle) { /* 39 1119: 메인 머리가 ds-head 로 바뀌어 옛 「전체 메뉴」 칸이 없으면 건너뜀 */
  function setMenu(open) {
    toggle.setAttribute('aria-expanded', String(mobile.matches && open));
    menu.hidden = mobile.matches && !open;
  }

  toggle.onclick = () => setMenu(menu.hidden);
  mobile.addEventListener('change', () => setMenu(false));
  document.addEventListener('pointerdown', event => {
    if (mobile.matches && !menu.hidden && !menu.contains(event.target) && !toggle.contains(event.target)) setMenu(false);
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && mobile.matches && !menu.hidden) {
      setMenu(false);
      toggle.focus();
    }
  });
  setMenu(false);
  }

  function syncLinks() {
    for (const link of document.querySelectorAll('[data-free-round]')) {
      link.href = 'materials/index.html?' + new URLSearchParams({exam:'school',audience:role}) + '#free-round';
    }
    for (const link of document.querySelectorAll('a[href*="variation.html?from=home"]')) {
      const target = new URL(link.href);
      target.searchParams.set('exam', exam);
      target.searchParams.set('audience', role);
      target.searchParams.set('palette', document.documentElement.dataset.palette || 'green');
      link.href = target.href;
    }
  }

  document.querySelector('#paletteChoice')?.addEventListener('change', syncLinks);
  window.addEventListener('delta-view', syncLinks);
  syncLinks();
})();
