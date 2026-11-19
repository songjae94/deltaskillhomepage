(() => {
  const query = new URLSearchParams(location.search);
  const isCsat = query.get('exam') === 'csat';
  const audience = ['teacher', 'academy'].includes(query.get('audience')) ? 'teacher' : 'student';
  const context = new URLSearchParams({exam:isCsat ? 'csat' : 'school', audience});
  const school = document.querySelector('#school-materials');
  const csat = document.querySelector('#csat-materials');
  school.hidden = isCsat;
  csat.hidden = !isCsat;
  for (const tab of document.querySelectorAll('[data-exam-tab]')) {
    tab.href = '/materials/?' + new URLSearchParams({exam:tab.dataset.examTab, audience});
    if (tab.dataset.examTab === context.get('exam')) {
      tab.classList.add('on');
      tab.setAttribute('aria-current','page');
    }
  }
  for (const link of document.querySelectorAll('[data-compose-mode]')) link.href = window.deltaComposerUrl(link.dataset.composeMode);
  /* 38 창 1119: 「지금 판매 중」은 catalog.json 에서 그린다(naesin/on-sale.js · 내신 목록과 같은 잣대) — 새 책은 저절로 선다 · 판매 중이 없으면 칸을 숨긴다 */
  const saleBox = document.querySelector('#free-round');
  const saleList = document.querySelector('#sale-books');
  if (saleBox && saleList && window.DSOnSale) {
    window.DSOnSale.load().then((items) => {
      if (!items.length) { saleBox.hidden = true; return; }
      saleList.replaceChildren(...items.map((p) => {
        const li = document.createElement('li');
        const a = document.createElement('a');
        a.href = '/naesin/?x=' + encodeURIComponent(p.sku); /* 39 창 1119: 고르기 화면에서 그 책이 골라진 채 열림 */
        const name = document.createElement('strong'); name.textContent = p.name;
        const meta = document.createElement('span'); meta.textContent = p.grade + ' ' + p.subject + ' · ' + window.DSOnSale.meta(p);
        const go = document.createElement('em'); go.textContent = '지면 보기 · 구매하기 →';
        a.append(name, meta, go); li.append(a); return li;
      }));
      saleList.hidden = false;
      const fb = document.querySelector('#sale-fallback'); if (fb) fb.remove();
    });
  }

})();
