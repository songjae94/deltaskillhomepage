/* Secondary entrances to the local request composer. No request is transmitted here. */
(() => {
  'use strict';
  const beforeLibrary = libraryPage, beforeTeacher = teacher, beforeFooter = compactFooter;
  const link = '<a class="upload-entry-v22" href="#upload">사진·PDF로 제작 요청 <span aria-hidden="true">↗</span></a>';
  compactFooter = function() { return beforeFooter().replace('<button data-feedback', link + '<button data-feedback'); };
  libraryPage = function() {
    const template=document.createElement('template'); template.innerHTML=beforeLibrary();
    const tabs=template.content.querySelector('.nv20-collections');
    if(tabs)tabs.insertAdjacentHTML('beforeend',link);
    return template.innerHTML;
  };
  teacher = function() {
    const template=document.createElement('template'); template.innerHTML=beforeTeacher();
    const links=template.content.querySelector('.creator-top-links');
    if(links)links.insertAdjacentHTML('beforeend',link);
    return template.innerHTML;
  };
  if (['#library','#teacher','#studio'].includes(location.hash)) route();
  // The first route ran before this module installed the footer renderer.
  const footer = document.querySelector('.work-footer');
  const feedback = footer?.querySelector('button[data-feedback]');
  if (feedback && !footer.querySelector('a[href="#upload"]')) feedback.insertAdjacentHTML('beforebegin',link);
})();
