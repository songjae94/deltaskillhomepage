for (const link of document.querySelectorAll('[data-compose-mode]')) {
  if (window.deltaComposerUrl) link.href = window.deltaComposerUrl(link.dataset.composeMode);
}
