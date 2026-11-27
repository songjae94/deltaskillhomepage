(() => {
  const query = new URLSearchParams(location.search);
  const select = document.querySelector('#sample-item');
  const image = document.querySelector('#sample-image');
  let item = (query.get('item') || '').toUpperCase();
  if (/^\d+$/.test(item)) item = 'C' + item;
  if (Array.from(select.options).some(option => option.value === item)) select.value = item;
  function render() {
    image.src = '/store/preview/' + select.value + '-1.png';
    image.alt = select.value + ' 공개 문항 지면';
  }
  select.addEventListener('change', render);
  render();
  const context = new URLSearchParams();
  for (const key of ['exam', 'audience', 'palette']) if (query.has(key)) context.set(key, query.get(key));
  const home = document.querySelector('#sample-home');
  if (home) home.href = '/';
  document.querySelector('#sample-materials').href = '/materials/?' + context;
})();
