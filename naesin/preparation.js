(async () => {
  const panel = document.querySelector('#final-handouts');
  const list = panel.querySelector('ul');
  const hint = panel.querySelector('[data-preparation-status]');
  try {
    const response = await fetch('/naesin/preparation.json', {cache: 'no-store'});
    if (!response.ok) throw new Error('준비 목록을 읽을 수 없음');
    const bundles = await response.json();
    const entries = bundles.map(({bundle, title, edition, status}) => {
      const entry = document.createElement('li');
      entry.dataset.bundle = bundle;
      const name = document.createElement('strong');
      name.textContent = title;
      const format = document.createElement('span');
      format.textContent = edition;
      entry.append(name, format);
      if (status) {
        const progress = document.createElement('span');
        progress.dataset.bundleStatus = '';
        progress.textContent = status;
        entry.append(progress);
      }
      return entry;
    });
    list.replaceChildren(...entries);
    hint.textContent = '미리보기와 자료받기는 자료 공개 후 이용할 수 있습니다.';
  } catch {
    hint.textContent = '준비 목록을 불러오지 못했습니다. 잠시 뒤 다시 확인해 주세요.';
  }
})();
