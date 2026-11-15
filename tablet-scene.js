// Place the film and the reading surface in whole CSS pixels on layout changes.
function drawTabletScene(canvas, deskTop, narrow) {
  const width = canvas.clientWidth, height = canvas.clientHeight;
  const start = narrow ? 0 : Math.round(width * .45);
  const controlsHeight = 46;
  const size = Math.max(1, Math.min(width - start, height - deskTop - controlsHeight));
  const left = start + Math.round((width - start - size) / 2);
  const top = deskTop + Math.round((height - deskTop - size - controlsHeight) / 2);
  canvas.style.setProperty('--intro-film-top', deskTop+'px');
  canvas.style.setProperty('--intro-toggle-top', (deskTop+size+5)+'px');
  const desk = document.querySelector('.desk');
  const shortcut = document.getElementById('filmStudy');
  for (const item of [desk, shortcut]) {
    Object.assign(item.style,{left:left+'px',top:top+'px',width:size+'px',height:size+'px'});
  }
  Object.assign(document.getElementById('filmToggle').style,{left:left+10+'px',top:top+size+5+'px'});
  const pageWidth = Math.min(990,width);
  Object.assign(tablet.style,{left:Math.floor((width-pageWidth)/2)+'px',top:'41px',
    width:pageWidth+'px',height:Math.max(1,height-44)+'px'});
}
