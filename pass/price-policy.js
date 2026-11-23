/* Monthly pass pricing only; no point campaign or content functions. */
(() => {
  'use strict';
  const priceEnd = Date.parse('2027-01-01T00:00:00+09:00');
  const price = (now = Date.now()) => now < priceEnd ? 15000 : 30000;
  const priceNote = (now = Date.now()) => now < priceEnd ? '2026년 12월 31일(한국시간)까지 신규 가입 월 30,000원 → 50% 할인 15,000원' : '신규 가입 월 30,000원';
  const priceMarkup = (now = Date.now()) => now < priceEnd
    ? '<div class="wp-price-offer"><div class="wp-list-price"><span>정가</span> <del>30,000원</del></div><div class="wp-sale-price"><span>할인가</span> <strong>15,000원</strong><span> / 월</span></div><div class="wp-sale-term"><b>50% 할인</b> · 2026년 12월 31일까지 (한국시간)</div></div>'
    : '<div class="wp-price-offer"><div class="wp-sale-price"><span>신규 가입 요금</span> <strong>30,000원</strong><span> / 월</span></div></div>';
  window.DSMonthlyPrice = {amount:price, note:priceNote, markup:priceMarkup};
})();
