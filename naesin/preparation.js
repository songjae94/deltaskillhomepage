
(async () => {
  /* 형 1119: 출시 예정 자료는 쓰지 않는다 — 판매하는 것만 화면에 둔다. 목록이 비었거나 칸이 없으면 칸째 감춘다. */
  const panel = document.querySelector('#final-handouts');
  if (!panel) return;
  const list = panel.querySelector('ul');
  const hint = panel.querySelector('[data-preparation-status]');
  try {
    const response = await fetch('/naesin/preparation.json', {cache: 'no-store'});
    if (!response.ok) throw new Error('목록을 읽을 수 없음');
    const bundles = await response.json();
    if (!Array.isArray(bundles) || !bundles.length) { panel.hidden = true; return; }
    const entries = bundles.map(({bundle, title, edition}) => {
      const entry = document.createElement('li');
      entry.dataset.bundle = bundle;
      const name = document.createElement('strong');
      name.textContent = title;
      const format = document.createElement('span');
      format.textContent = edition;
      entry.append(name, format);
      return entry;
    });
    if (list) list.replaceChildren(...entries);
    if (hint) hint.textContent = '판매가 열린 자료는 내신 자료 목록에서 미리보기와 구매를 할 수 있습니다.';
  } catch {
    panel.hidden = true;
  }
})();
