/* First screen shown inside the front page (/) and swipe between the hero scenes. */
(() => {
  'use strict';
  if (window.top !== window) {
    // Inside the front page: every link opens in the whole window, and leaving the first screen moves the whole window.
    document.documentElement.classList.add('framed');
    const base = document.createElement('base'); base.target = '_top'; document.head.append(base);
    const leave = () => {
      const page = location.hash.replace(/^#/, '').split(/[/?]/)[0];
      if (!page || page === 'home') return;
      try { window.top.location.assign(location.pathname.replace(/index\.html$/, '') + location.hash); } catch { /* another site is framing this page */ }
    };
    addEventListener('hashchange', leave); leave();
  }
  // A sideways swipe on the hero moves to the next or the previous scene (the dots do the same).
  let start = null;
  addEventListener('touchstart', e => {
    const t = e.touches[0];
    start = e.touches.length === 1 && e.target.closest && e.target.closest('.cinema') ? [t.clientX, t.clientY] : null;
  }, { passive: true });
  addEventListener('touchend', e => {
    if (!start) return;
    const t = e.changedTouches[0], dx = t.clientX - start[0], dy = t.clientY - start[1]; start = null;
    if (Math.abs(dx) < 48 || Math.abs(dx) < Math.abs(dy) * 1.5) return;
    const dots = [...document.querySelectorAll('.cinema-dots [data-cinema]')];
    if (dots.length < 2) return;
    const now = Math.max(0, dots.findIndex(d => d.getAttribute('aria-pressed') === 'true'));
    dots[(now + (dx < 0 ? 1 : -1) + dots.length) % dots.length].click();
  }, { passive: true });
})();
