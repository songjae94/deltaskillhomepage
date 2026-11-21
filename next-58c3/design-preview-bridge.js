// Review-only display choices. No account or learning data is read or written.
(() => {
  const design = new URLSearchParams(location.search).get('design') === 'b' ? 'b' : 'a';
  document.documentElement.dataset.design = design;
  document.documentElement.dataset.interior = 'v12';
  const notify = () => { if (parent !== window) parent.postMessage({type:'ds-design-route', route:location.hash || '#home'}, location.origin); };
  addEventListener('hashchange', notify);
  addEventListener('DOMContentLoaded', notify);
  addEventListener('message', event => {
    if (event.origin !== location.origin || event.source !== parent || !event.data) return;
    if (event.data.type === 'ds-design-change' && ['a','b'].includes(event.data.design)) {
      document.documentElement.dataset.design = event.data.design;
      const url = new URL(location.href); url.searchParams.set('design', event.data.design);
      history.replaceState(null, '', url);
    }
    if (event.data.type === 'ds-design-route' && /^#(?:home|student|teacher|print-design|library|csat|login|account|diagnostic|help|material\/[A-Za-z0-9_-]+|classroom|benefits|progress|account-settings|account-password)$/.test(event.data.route)) location.hash = event.data.route;
    if (event.data.type === 'ds-design-intro' && (!location.hash || location.hash === '#home')) document.querySelector('[data-replay]')?.click();
  });
})();
