// Share a delayed, non-blocking status across page visits and foreground requests.
(() => {
  'use strict';
  if (window.DSWaitStatus) return;
  const pending = new Map();
  let nextId = 0;
  let message;
  let recentAction = -Infinity;
  let endNavigation;

  function paint() {
    const ready = Array.from(pending.values()).filter(task => task.ready);
    if (!document.body || !ready.length) {
      message?.remove();
      return;
    }
    if (!message) {
      message = document.createElement('div');
      message.setAttribute('role', 'status');
      message.setAttribute('aria-live', 'polite');
      message.dataset.dsWaitStatus = '';
      message.style.cssText = 'position:fixed;inset:auto auto max(20px,env(safe-area-inset-bottom)) 50%;transform:translateX(-50%);z-index:2147483646;max-width:calc(100vw - 32px);width:max-content;padding:10px 16px;border:1px solid #c9d4e1;border-radius:6px;background:#fff;color:#253248;font:600 14px/1.5 system-ui,sans-serif;box-shadow:0 2px 8px #26364c24;pointer-events:none';
      const printStyle = document.createElement('style');
      printStyle.textContent = '@media print{[data-ds-wait-status]{display:none!important}}';
      document.head.append(printStyle);
    }
    const task = ready[ready.length - 1];
    if (!message.isConnected) document.body.append(message);
    if (message.textContent !== task.label) message.textContent = task.label;
  }

  function begin(label) {
    const id = ++nextId;
    const task = {label, ready:false};
    pending.set(id, task);
    const timer = setTimeout(() => { task.ready = true; paint(); }, 1000);
    return () => { clearTimeout(timer); pending.delete(id); paint(); };
  }
  window.DSWaitStatus = {begin};

  if (document.readyState === 'loading') {
    const done = begin('화면을 열고 있습니다.');
    document.addEventListener('DOMContentLoaded', done, {once:true});
  }
  function interacted() { recentAction = performance.now(); }
  for (const type of ['click','change','submit','keydown']) {
    document.addEventListener(type, interacted, {capture:true,passive:true});
  }
  // Only normal same-window navigation. Native links may open a download or a new tab.
  document.addEventListener('click', event => {
    const link = event.target.closest?.('a[href]');
    if (!link || event.defaultPrevented || event.button || event.ctrlKey || event.metaKey ||
        event.shiftKey || event.altKey || link.hasAttribute('download') ||
        (link.target && !['_self','_top'].includes(link.target))) return;
    const url = new URL(link.href, location.href);
    if (url.origin !== location.origin || url.pathname === location.pathname && url.search === location.search ||
        /\.(?:pdf|zip|hwpx?|png|webp|jpg)$/i.test(url.pathname)) return;
    endNavigation?.();
    endNavigation = begin('화면을 열고 있습니다.');
    const finish = endNavigation;
    queueMicrotask(() => { if (event.defaultPrevented) finish(); });
  });
  addEventListener('pageshow', () => endNavigation?.());
  addEventListener('pagehide', () => endNavigation?.());
  window.navigation?.addEventListener('navigateerror', () => endNavigation?.());
  window.navigation?.addEventListener('navigatesuccess', () => endNavigation?.());
  addEventListener('keydown', event => { if (event.key === 'Escape') endNavigation?.(); });


  // Native fetch still owns the request, retry, abort and response body. Exclude
  // prefetches and telemetry so a background request cannot hold the page status.
  const originalFetch = window.fetch;
  if (!originalFetch) return;
  window.fetch = function(input, init) {
    const href = typeof input === 'string' ? input : input?.url || input?.href;
    let path;
    try { path = new URL(href, location.href).pathname; } catch { return originalFetch.apply(this, arguments); }
    const action = performance.now() - recentAction < 1800 || document.readyState !== 'complete';
    const foreground = action && (/\/functions\/v1\//.test(path) || /\.json$/.test(path)) &&
      !/analytics|telemetry|log-event|metrics/.test(path);
    if (!foreground) return originalFetch.apply(this, arguments);
    let label = '자료를 불러오고 있습니다.';
    if (typeof init?.body === 'string' && /"action"\s*:\s*"(?:draw|trial_draw|scope_draw|received_scope_draw|trial_open_many)"/.test(init.body)) {
      label = '문항을 생성하고 있습니다.';
    }
    const done = begin(label);
    try { return originalFetch.apply(this, arguments).finally(done); }
    catch (error) { done(); throw error; }
  };
})();
