(() => {
  /* 39 창 1119(형 안 A2): 메인 「교재 찾기」 칸 = 지금 파는 책 카드 줄(지면 첫 쪽 · 이름 · 문항 수 · 값) + 「전체 고르기 →」 하나.
     수업 프린트 구성 시작 · 공개 문항 지면 단추는 뺐다(만드는 화면 · 수능 옛 그림 쪽은 /naesin/ 으로 넘김). 책은 catalog.json 에서 그린다(naesin/on-sale.js). */
  const heading = document.querySelector('#library h2');
  const original = heading.textContent;
  const shelf = document.querySelector('#sale-shelf');
  const proof = document.querySelector('#lesson-proof');

  function sync() {
    const teacher = role === 'teacher';
    heading.textContent = teacher ? '내신 변형 문제집' : original;
    for (const link of document.querySelectorAll('#chapters a')) {
      if (link.hash === '#library') link.textContent = teacher ? '내신 변형 문제집' : '교재 찾기';
      if (link.hash === '#lesson-studio') link.textContent = '쪽 구성';
    }
  }

  /* 지면 첫 쪽 = 리포 그림 naesin/preview/<sku>-L2.png(판매 판 2문항 2단 첫 쪽) · 없으면 미리보기 PDF 첫 쪽을 pdf.js 로 */
  function sheet(box, sku, url, alt) {
    if (!box) return;
    const i = document.createElement('img');
    i.alt = alt; i.decoding = 'async'; i.loading = 'lazy'; i.draggable = false; i.className = 'ds-sheet on';
    i.addEventListener('error', () => { i.remove(); if (url && window.DSSheet) box.append(window.DSSheet.img(url, 1, alt)); }, { once: true });
    i.src = '/naesin/preview/' + encodeURIComponent(sku) + '-L2.png?v=39-1119';
    box.append(i);
  }

  if (shelf && window.DSOnSale) {
    window.DSOnSale.load().then((items) => {
      if (!items.length) return;
      shelf.replaceChildren(...items.map((p) => {
        const a = document.createElement('a');
        a.className = 'sale-card';
        a.href = '/naesin/?x=' + encodeURIComponent(p.sku);
        const pic = document.createElement('span'); pic.className = 'sale-sheet';
        const tx = document.createElement('span'); tx.className = 'sale-tx';
        const name = document.createElement('strong'); name.textContent = p.name;
        const meta = document.createElement('small'); meta.textContent = p.grade + ' · ' + (p.count ? p.count + '문항 · ' : '') + p.price.toLocaleString('ko-KR') + '원';
        tx.append(name, meta); a.append(pic, tx);
        sheet(pic, p.sku, p.preview, p.name + ' 첫 쪽');
        return a;
      }));
      shelf.hidden = false;
      if (proof) {
        proof.href = '/naesin/?x=' + encodeURIComponent(items[0].sku);
        sheet(proof.querySelector('.lesson-sheet'), items[0].sku, items[0].preview, items[0].name + ' 첫 쪽');
      }
    });
  }

  window.addEventListener('delta-view', sync);
  sync();
})();
