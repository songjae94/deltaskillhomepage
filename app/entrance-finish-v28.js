/* Replay the wordmark light on each entrance scene, without moving the header. */
(() => {
 'use strict';
 if (window.EntranceFinishV28 || typeof window.showCinema !== 'function') return;
 const previous = window.showCinema;
 function shine() {
  if (document.documentElement.dataset.design !== 'b' || !document.body.classList.contains('home-body')) return;
  const brand = document.querySelector('.header .brand');
  if (!brand) return;
  brand.classList.remove('hp28-logo-lit');
  void brand.offsetWidth;
  brand.classList.add('hp28-logo-lit');
 }
 window.showCinema = function(index) { previous.apply(this, arguments); shine(); };
 window.EntranceFinishV28 = Object.freeze({shine});
 shine();
})();
