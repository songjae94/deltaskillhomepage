/* Compact the existing student links without duplicating navigation or account state. */
(() => {
  'use strict';
  function mount() {
    const host = document.getElementById('header');
    if (!host) return;
    const compact = matchMedia('(max-width: 900px), (pointer: coarse) and (max-width: 1366px)');
    let menu = null;

    function setOpen(open, focusToggle = false) {
      if (!menu) return;
      const {button, panel} = menu;
      button.setAttribute('aria-expanded', String(open));
      button.setAttribute('aria-label', open ? '메뉴 닫기' : '메뉴 열기');
      if (!open && focusToggle) button.focus({preventScroll:true});
      panel.hidden = !open;
    }

    function restore() {
      if (!menu) return;
      const {header, nav, meta, account, nextAccountSibling, button, panel} = menu;
      const compactControlFocused = button === document.activeElement;
      menu = null;
      if (!header.isConnected) return;
      if (panel.contains(nav)) header.insertBefore(nav, button);
      if (panel.contains(meta)) header.insertBefore(meta, button);
      if (account?.parentNode === header) {
        account.classList.remove('ds-mobile-account');
        meta.insertBefore(account, nextAccountSibling?.parentNode === meta ? nextAccountSibling : null);
      }
      button.remove();
      panel.remove();
      header.classList.remove('ds-mobile-header');
      if (compactControlFocused) header.querySelector('a')?.focus({preventScroll:true});
    }

    function sync() {
      const header = host.querySelector('.header');
      if (menu?.header === header && compact.matches && menu.panel.isConnected) return;
      restore();
      if (!compact.matches || !header) return;
      const nav = header.querySelector('nav[aria-label="주 메뉴"]');
      const meta = header.querySelector('.meta');
      const account = meta?.querySelector('a.login');
      const nextAccountSibling = account?.nextSibling;
      if (!nav || !meta || !nav.querySelector('a[href="#student"]')) return;
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'ds-mobile-toggle';
      button.setAttribute('aria-controls', 'ds-mobile-navigation');
      button.innerHTML = '<span aria-hidden="true"></span>';
      const panel = document.createElement('div');
      panel.id = 'ds-mobile-navigation';
      panel.className = 'ds-mobile-menu';
      header.classList.add('ds-mobile-header');
      header.append(button, panel);
      menu = {header, button, panel, nav, meta, account, nextAccountSibling};
      if (account) {
        account.classList.add('ds-mobile-account');
        header.insertBefore(account, button);
      }
      setOpen(false);
      panel.append(nav, meta);
      button.addEventListener('click', () => setOpen(panel.hidden, true));
    }

    host.addEventListener('click', event => {
      const link = event.target.closest('a');
      if (link && menu?.panel.contains(link)) setOpen(false, true);
    });
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape' && menu && !menu.panel.hidden) {
        event.preventDefault();
        setOpen(false, true);
      }
    });
    function closeOutside(event) {
      if (menu && !menu.panel.hidden && !menu.header.contains(event.target)) setOpen(false);
    }
    document.addEventListener('pointerdown', closeOutside);
    document.addEventListener('focusin', closeOutside);
    window.addEventListener('hashchange', () => setOpen(false));
    window.addEventListener('popstate', () => setOpen(false));
    window.addEventListener('pageshow', () => {setOpen(false);sync();});
    compact.addEventListener('change', sync);
    new MutationObserver(sync).observe(host, {childList:true, subtree:true});
    sync();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount, {once:true});
  else mount();
})();
