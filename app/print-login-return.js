/* Keep only the print setup in this tab while the guest signs in. */
(() => {
  'use strict';
  const key = 'ds-print-login-draft-v1';
  const roleMode = {'#student':'studentMode', '#teacher':'teacherMode'};
  const roleTab = {'#student':'create', '#teacher':'print'};
  let fallback = null;
  function clear() {
    fallback = null;
    try { sessionStorage.removeItem(key); } catch {}
  }
  function read() {
    let draft = fallback;
    try { draft = JSON.parse(sessionStorage.getItem(key) || 'null') || draft; } catch {}
    if (!draft || !Object.hasOwn(roleMode, draft.route) || !draft.settings ||
        !Number.isFinite(draft.at) || Date.now() < draft.at || Date.now() - draft.at > 30 * 60 * 1000) {
      clear(); return null;
    }
    return draft;
  }
  function save(route, settings) {
    if (!Object.hasOwn(roleMode, route)) return;
    fallback = {route, settings, at:Date.now()};
    try { sessionStorage.setItem(key, JSON.stringify(fallback)); } catch {}
  }
  function take(route) {
    const draft = read();
    if (!draft || route !== draft.route) return null;
    clear();
    return draft.settings;
  }
  function accountLink(url) {
    const route = read()?.route;
    if (!route) return url;
    const destination = new URL(url, location.href);
    destination.searchParams.set('next','/app/?'+roleMode[route]+'='+roleTab[route]+route);
    return destination.href;
  }
  window.addEventListener('hashchange', event => {
    if (new URL(event.oldURL).hash !== '#login' || location.hash === '#login') return;
    const draft = read();
    if (draft && (location.hash !== draft.route || !window.DSService?.session())) {
      if (window.DSLoginReturn === draft.route) window.DSLoginReturn = '';
      clear();
    }
  });
  window.DSPrintLoginReturn = {save, take, route:()=>read()?.route, accountLink};
})();
