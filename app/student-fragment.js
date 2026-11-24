(() => {
  'use strict';
  const policy = "default-src 'none'; img-src data:; style-src 'unsafe-inline'; font-src data:; form-action 'none'; base-uri 'none'";
  const attr = value => String(value).replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  const questionTypography = `
    body :is(.katex,math){font-size:1em}
    article :is(.bogi,.cond-box){position:relative;box-sizing:border-box;min-width:0;border:1px solid #736f66;padding:.85em .9em;margin:1.15em 0 .8em;break-inside:avoid}
    article .bogi:has(>.bt),article .cond-box:has(>.상자딱지){padding-top:1em}
    article .bogi>.bt,article .cond-box>.상자딱지{position:absolute;top:0;left:50%;transform:translate(-50%,-50%);padding:0 .55em;background:#fff;color:inherit;font-weight:600;line-height:1.15;white-space:nowrap}
    article :is(.bogi .brow,.cond-box .cond-line){margin:0;line-height:1.69}
    article .brow+.brow,article .cond-line+.cond-line{margin-top:.22em}
    .dte-source-choices .dte-inline-choice{font-size:inherit;align-items:baseline}
    .dte-source-choices .dte-choice-no{box-sizing:border-box;font-size:1em;line-height:1;inline-size:1.24em;block-size:1.24em;flex-basis:1.24em;display:inline-flex;align-items:center;justify-content:center;align-self:baseline}
    .dte-source-choices .dte-choice-content{line-height:inherit}
  `;
  function applyTypography(doc){
    if(!doc?.head||doc===document||doc.getElementById('ds-study-math-size'))return;
    const style=doc.createElement('style');style.id='ds-study-math-size';
    style.textContent=questionTypography;doc.head.append(style);
  }
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
    const doc = '<!doctype html><html lang="ko"><head><meta charset="utf-8"><meta http-equiv="Content-Security-Policy" content="'+attr(policy)+'"><style>'+base+'</style></head><body>'+template.innerHTML+layout+'<style id="ds-study-math-size">'+questionTypography+'</style></body></html>';
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
  window.DSStudentFragment = Object.freeze({render,fit,applyTypography});
})();
