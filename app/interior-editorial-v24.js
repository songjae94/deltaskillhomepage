/* Editorial surroundings only: keep all existing controls, state and source pages. */
(() => {
  'use strict';
  const images = {
    upload: ['assets/editorial/paper-flatlay-v15.webp', '원목 책상 위 원고지와 필기 도구'],
    diagnostic: ['assets/editorial/cool-study-v13.webp', '빛이 드는 책상 위 학습 패드']
  };
  function photo(kind) {
    const [src, alt] = images[kind];
    return `<figure class="ie24-photo ie24-${kind}-photo"><img src="${src}" alt="${alt}" decoding="async" width="1536" height="1024"></figure>`;
  }
  function headingMarkup(html, className, kind) {
    const expression = new RegExp('<div class="' + className + '">([\\s\\S]*?)<\\/div>');
    return html.replace(expression, (_, content) => `<div class="${className} ie24-photo-heading ie24-${kind}-heading"><div class="ie24-heading-copy">${content}</div>${photo(kind)}</div>`);
  }
  if (typeof diagnosticSetup === 'function') {
    const original = diagnosticSetup;
    diagnosticSetup = function () { return headingMarkup(original.apply(this, arguments), 'diagnostic-heading', 'diagnostic'); };
  }
  function frameLibrary(html) {
    const template = document.createElement('template'); template.innerHTML = html;
    const root = template.content.querySelector('.resource-surface');
    if (!root || root.dataset.collection === 'exams') return html;
    const picture = root.querySelector('.library-v13-exhibit-photo');
    const link = picture?.closest('a.library-v12-exhibit');
    const sku = link?.getAttribute('href')?.replace(/^#material\//, '');
    const item = (window.DSCatalog || []).find(value => value.sku === sku);
    const preview = item?.previewPages?.[0];
    if (!picture || !preview || !/^public-data\/[A-Za-z0-9-]+\.png$/.test(preview)) return html;
    const scene = document.createElement('div'); scene.className = 'ie24-document-still-life'; scene.setAttribute('aria-hidden', 'true');
    const background = document.createElement('img'); background.className = 'ie24-desk'; background.src = 'assets/editorial/paper-flatlay-v15.webp'; background.alt = '';
    const page = document.createElement('img'); page.className = 'ie24-real-page'; page.src = preview; page.alt = ''; page.width = 804; page.height = 1137;
    scene.append(background, page); picture.replaceWith(scene);
    return template.innerHTML;
  }
  if (typeof libraryPage === 'function') {
    const original = libraryPage;
    libraryPage = function () { return frameLibrary(original.apply(this, arguments)); };
  }
  function decorateHeading(heading, kind) {
    if (!heading || heading.querySelector('.ie24-photo')) return;
    const copy = document.createElement('div'); copy.className = 'ie24-heading-copy';
    while (heading.firstChild) copy.append(heading.firstChild);
    heading.classList.add('ie24-photo-heading', 'ie24-' + kind + '-heading');
    heading.append(copy); heading.insertAdjacentHTML('beforeend', photo(kind));
  }
  function decorate() {
    const content = document.getElementById('content'); if (!content) return;
    decorateHeading(content.querySelector('.diagnostic-heading'), 'diagnostic');
    decorateHeading(content.querySelector('.upr22-heading'), 'upload');
  }
  window.addEventListener('hashchange', () => requestAnimationFrame(decorate));
  decorate();
  // Only a library's first paint predates this late wrapper. Its filters live in
  // the existing module, so re-rendering here retains their selected values.
  if (location.hash === '#library') {
    const content = document.getElementById('content'); if (content) content.innerHTML = libraryPage();
  }
  window.InteriorEditorialV24 = { headingMarkup, frameLibrary };
})();
