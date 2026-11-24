/* Measure the typeset choices on their own sheet, including choices inside a print frame. */
window.DSChoiceLayout = (() => {
  const active = new WeakMap();

  function mount(group, elements) {
    if (!group) return;
    active.get(group)?.();
    const buttons = Array.from(elements);
    if (!buttons.length) return;
    const view = group.ownerDocument.defaultView;
    let frame = 0;
    let stopped = false;
    let previousWidth = -1;

    function measure() {
      frame = 0;
      if (!group.isConnected || !group.clientWidth || stopped) return;
      const style = view.getComputedStyle(group);
      const room = group.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight);
      const gap = parseFloat(style.columnGap) || 0;
      const saved = buttons.map(button => button.getAttribute('style'));
      for (const button of buttons) {
        for (const [key,value] of [['width','max-content'],['max-width','none'],['min-width','max-content'],['white-space','nowrap']]) {
          button.style.setProperty(key,value,'important');
        }
      }
      const widths = buttons.map(button => button.getBoundingClientRect().width);
      buttons.forEach((button,i) => {
        if (saved[i] === null) button.removeAttribute('style');
        else button.setAttribute('style',saved[i]);
      });
      const fits = columns => {
        const tracks = Array(columns).fill(0);
        widths.forEach((width,i) => { tracks[i % columns] = Math.max(tracks[i % columns], width); });
        return tracks.reduce((a,b) => a + b, 0) + gap * (columns - 1) <= room;
      };
      const columns = [Math.min(5,buttons.length), Math.min(3,buttons.length), 1].find(fits) || 1;
      group.dataset.choiceColumns = String(columns);
    }

    function schedule() {
      if (!frame && !stopped) frame = view.requestAnimationFrame(measure);
    }
    const resize = new view.ResizeObserver(entries => {
      const width = entries[0].contentRect.width;
      if (width !== previousWidth) { previousWidth = width; schedule(); }
    });
    resize.observe(group);
    const content = new view.MutationObserver(schedule);
    content.observe(group,{childList:true,characterData:true,subtree:true});
    group.addEventListener('load',schedule,true);
    group.ownerDocument.fonts?.ready.then(schedule);
    measure();
    const stop = () => {
      stopped = true;
      resize.disconnect();
      content.disconnect();
      view.cancelAnimationFrame(frame);
      group.removeEventListener('load',schedule,true);
      active.delete(group);
    };
    active.set(group,stop);
    return stop;
  }

  return { mount };
})();
