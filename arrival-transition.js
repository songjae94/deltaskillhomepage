(() => {
  let arrival;
  try {
    arrival = JSON.parse(sessionStorage.getItem('delta-gate-arrival'));
    sessionStorage.removeItem('delta-gate-arrival');
  } catch { return; }
  if (!arrival || arrival.href !== location.href || Date.now()-arrival.time > 10000 ||
      matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const style = document.createElement('style');
  style.textContent = 'html::after{content:"";position:fixed;inset:0;background:#fff;z-index:2147483647;pointer-events:none;opacity:1;transition:opacity 380ms ease-out}html.arrived::after{opacity:0}';
  document.head.append(style);
  const reveal = () => requestAnimationFrame(() => requestAnimationFrame(() => {
    document.documentElement.classList.add('arrived');
    setTimeout(() => { style.remove(); document.documentElement.classList.remove('arrived'); }, 450);
  }));
  document.addEventListener('DOMContentLoaded',reveal,{once:true});
})();
