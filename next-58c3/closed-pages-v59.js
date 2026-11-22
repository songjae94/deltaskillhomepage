/* Closed pages: the address goes back to the front page and links to them are taken out. */
(() => {
  'use strict';
  const closed = ['technology', 'technology-about'];
  const isClosed = hash => closed.includes(String(hash || '').replace(/^#/, '').split(/[/?]/)[0]);
  const guard = () => { if (isClosed(location.hash)) location.replace('#home'); };
  guard();
  window.addEventListener('hashchange', guard);
  const sel = closed.map(p => `a[href="#${p}"]`).join(',');
  const sweep = () => { for (const el of document.querySelectorAll(sel)) el.remove(); };
  let queued = false;
  new MutationObserver(() => { if (queued) return; queued = true; requestAnimationFrame(() => { queued = false; sweep(); }); }).observe(document.documentElement, { childList: true, subtree: true });
  sweep();
})();
