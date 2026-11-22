/* Public edition guard: closed pages stay in code but are not reachable. */
(() => {
  'use strict';
  const closed = ['benefits','improve','classroom','upload','school-exams','exam-week','academy','diagnostic','diagnostic-run','diagnostic-result'];
  const isClosed = hash => closed.includes(String(hash || '').replace(/^#/, '').split(/[/?]/)[0]);
  const guardHash = () => { if (isClosed(location.hash)) { location.replace('#home'); return true; } return false; };
  guardHash();
  window.addEventListener('hashchange', guardHash);

  const linkSel = closed.map(p => `a[href="#${p}"]`).join(',');
  const direct = [linkSel, '[data-feedback]', '[data-csat-diagnostic-v20]', '[data-lf19-mode="book"]', '.lf19-book-state', '.techv20-request', '.ew25-home-banner', '.ew25-csat-entry', '.upload-entry-v22'].join(',');
  const textRules = [
    ['.help-faq details', /운영안|시안 의견|12월 PDF 체험/],
    ['.cl20-course', /진단 준비 중|단원 진단/]
  ];
  const keepRoots = new Set(['content', 'header', 'app', 'root']);
  function prune(parent) {
    while (parent && parent !== document.body && !keepRoots.has(parent.id) && !parent.children.length && !parent.textContent.trim()) {
      const up = parent.parentElement; parent.remove(); parent = up;
    }
  }
  let busy = false;
  function sweep() {
    if (busy) return; busy = true;
    try {
      for (const el of document.querySelectorAll(direct)) { const p = el.parentElement; el.remove(); prune(p); }
      for (const [sel, re] of textRules) for (const el of document.querySelectorAll(sel)) if (re.test(el.textContent)) { const p = el.parentElement; el.remove(); prune(p); }
    } finally { busy = false; }
  }
  let queued = false;
  const schedule = () => { if (queued) return; queued = true; requestAnimationFrame(() => { queued = false; sweep(); }); };
  new MutationObserver(schedule).observe(document.documentElement, { childList: true, subtree: true });
  sweep();
})();
