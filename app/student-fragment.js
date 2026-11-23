(() => {
  'use strict';
  const policy = "default-src 'none'; img-src data:; style-src 'unsafe-inline'; font-src data:; form-action 'none'; base-uri 'none'";
  const attr = value => String(value).replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  function render(html, title) {
    const template = document.createElement('template');
    template.innerHTML = html;
    template.content.querySelectorAll('script,iframe,frame,frameset,embed,object,base,meta,link,form,button,input,video,audio,template,foreignObject,animate,animateMotion,animateTransform,set').forEach(node => node.remove());
    for (const el of template.content.querySelectorAll('*')) {
      for (const attribute of Array.from(el.attributes)) {
        const key = attribute.name.toLowerCase();
        if (key.startsWith('on') || ['srcdoc','target','download','action','formaction','srcset','ping','autofocus','contenteditable'].includes(key)) el.removeAttribute(attribute.name);
        if (['href','xlink:href','src'].includes(key) && !(attribute.value.startsWith('#') || (/^(?:img|image)$/i.test(el.localName) && /^data:image\/(?:png|jpeg|gif|webp|svg\+xml)[;,]/i.test(attribute.value)))) el.removeAttribute(attribute.name);
      }
    }
    const base = 'html,body{margin:0;height:auto;min-height:0}body{display:flow-root;color:#171923;background:white;line-height:1.6;overflow-wrap:break-word}img,svg{max-width:100%}img{height:auto}@media print{body{color:black}}';
    const layout = '<style>.katex-display{max-width:100%;overflow-x:auto;overflow-y:hidden;padding-block:.25em} @media print{.katex-display{overflow:visible}.katex-display>.katex{white-space:normal}}</style>';
    const doc = '<!doctype html><html lang="ko"><head><meta charset="utf-8"><meta http-equiv="Content-Security-Policy" content="'+attr(policy)+'"><style>'+base+'</style></head><body>'+template.innerHTML+layout+'</body></html>';
    return '<iframe class="ds-student-fragment" title="'+attr(title)+'" sandbox="allow-same-origin" referrerpolicy="no-referrer" style="display:block;width:100%;min-width:0;height:12rem;border:0;background:white" srcdoc="'+attr(doc)+'"></iframe>';
  }
  const observers = new WeakMap();
  const measured = new WeakMap();
  async function fit(frame) {
    if (measured.has(frame)) return measured.get(frame);
    const task = (async () => {
      if (frame.contentDocument?.URL !== 'about:srcdoc' || frame.contentDocument.readyState !== 'complete') {
        await new Promise((resolve,reject) => {
          const timer = setTimeout(() => reject(Error('문항 로딩 지연')),15000);
          frame.addEventListener('load',() => { clearTimeout(timer); resolve(); },{once:true});
        });
      }
      const doc = frame.contentDocument;
      if (!doc?.body) throw Error('문항 지면 없음');
      await doc.fonts.ready;
      const resize = () => { const box = doc.body.getBoundingClientRect(); const bottom = parseFloat(doc.defaultView.getComputedStyle(doc.body).marginBottom)||0; const height = Math.max(box.bottom+doc.defaultView.scrollY,box.top+doc.body.scrollHeight)+Math.max(0,bottom); if (height>0) frame.style.height = Math.ceil(height+2)+'px'; };
      resize();
      if (!observers.has(frame) && typeof ResizeObserver==='function') {
        const observer = new ResizeObserver(resize);
        observer.observe(doc.body);
        observers.set(frame,observer);
        frame.contentWindow.addEventListener('pagehide',() => observer.disconnect(),{once:true});
      }
    })();
    measured.set(frame,task);
    try { return await task; } catch(error) { measured.delete(frame); throw error; }
  }
  document.addEventListener('load',event => { if (event.target?.matches?.('.ds-student-fragment')) fit(event.target).catch(() => {}); },true);
  window.DSStudentFragment = Object.freeze({render,fit});
})();
