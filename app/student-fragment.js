(() => {
  'use strict';
  const policy = "default-src 'none'; img-src data:; style-src 'unsafe-inline'; font-src data:; form-action 'none'; base-uri 'none'";
  const attr = value => String(value).replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  const questionTypography = `
    body article{font-family:var(--ds-q-serif,"Noto Serif KR","Nanum Myeongjo","AppleMyungjo",Batang,serif);line-height:var(--ds-q-lh,1.69);word-break:keep-all;overflow-wrap:break-word}
    body :is(.katex,math){font-size:1em}
    article .katex:not(.katex-display>.katex){margin-inline:.06em}
    article :is(.bogi,.cond-box){position:relative;box-sizing:border-box;min-width:0;border:1px solid #736f66;padding:.85em .9em;margin:1.15em 0 .8em;break-inside:avoid}
    article .bogi:has(>.bt),article .cond-box:has(>.상자딱지){padding-top:1em}
    article .bogi>.bt,article .cond-box>.상자딱지{position:absolute;top:0;left:50%;transform:translate(-50%,-50%);padding:0 .55em;background:#fff;color:inherit;font-weight:600;line-height:1.15;white-space:nowrap}
    article :is(.bogi .brow,.cond-box .cond-line){margin:0;line-height:1.69}
    article .brow+.brow,article .cond-line+.cond-line{margin-top:.22em}
    .dte-source-choices .dte-inline-choice{font-size:inherit;align-items:center}
    .dte-source-choices .dte-choice-no{box-sizing:border-box;font-size:1em;line-height:inherit;inline-size:auto;block-size:auto;flex:0 0 auto;display:inline-flex;align-items:center;justify-content:center;align-self:center}
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
    // R-112: a formula is never broken, on screen or in print.
    const layout = '<style>.katex-display{max-width:100%;overflow-x:auto;overflow-y:hidden;padding-block:.25em} @media print{.katex-display{overflow:visible}}</style>';
    const doc = '<!doctype html><html lang="ko"><head><meta charset="utf-8"><meta http-equiv="Content-Security-Policy" content="'+attr(policy)+'"><style>'+base+'</style></head><body class="ds-render">'+withMath(expand(template.innerHTML))+layout+'<style id="ds-render-rules">'+renderRules()+'</style><style id="ds-study-math-size">'+questionTypography+'</style></body></html>';
    return '<iframe class="ds-student-fragment" title="'+attr(title)+'" sandbox="allow-same-origin" referrerpolicy="no-referrer" style="display:block;width:100%;min-width:0;height:'+(lastHeight.get(title)||'12rem')+';border:0;background:white" srcdoc="'+attr(doc)+'"></iframe>';
  }
  // v66: the frame gets the same canonical render rules as the page (draw-math-v61.css, one source):
  // read once from the page's own stylesheet, no second copy to keep in step.
  let rulesText = null;
  function renderRules() {
    if (rulesText !== null) return rulesText;
    try {
      const sheet = Array.from(document.styleSheets).find(item => /\/draw-math-v61\.css(?:\?|$)/.test(item.href || ''));
      if (!sheet) return '';
      rulesText = Array.from(sheet.cssRules, rule => rule.cssText).join('\n');
    } catch { return ''; }
    return rulesText;
  }
  // v66: every server answer repeats the same ~370KB math stylesheet (fonts inlined). Keep ONE copy and hold
  // the question as its ~1KB body; the frame gets the stylesheet back when it is drawn (render → expand).
  const shared = new Map();
  const BIG_STYLE = /<style\b[^>]*>([\s\S]*?)<\/style>/gi;
  function compact(html) {
    if (typeof html !== 'string' || html.length < 50000) return html;
    return html.replace(BIG_STYLE, (whole, css) => {
      if (css.length < 50000 || !/KaTeX_Main/.test(css) || !/@font-face/.test(css)) return whole;
      const key = css.length + ':' + css.slice(0, 64) + css.slice(-64);
      let id = shared.get(key)?.id;
      if (!id) { id = 'm' + shared.size; shared.set(key, { id, css }); }
      return '<style data-ds-shared-math="' + id + '"></style>';
    });
  }
  function expand(html) {
    if (!shared.size || !html.includes('data-ds-shared-math')) return html;
    const byId = new Map(Array.from(shared.values(), entry => [entry.id, entry.css]));
    return html.replace(/<style data-ds-shared-math="(m\d+)"><\/style>/g, (whole, id) => byId.has(id) ? '<style>' + byId.get(id) + '</style>' : '');
  }
  // When the server stops repeating the math stylesheet (proposal C-1), the frame takes the page's own copy
  // (the pinned katex-embed.css link, read once) — so that server change needs no front-end release.
  let katexText = null;
  function withMath(html) {
    if (/KaTeX_Main/.test(html) || !/class="katex/.test(html)) return html;
    if (katexText === null) {
      try {
        const sheet = Array.from(document.styleSheets).find(item => item.ownerNode?.matches?.('link[data-ds-katex-version]'));
        katexText = sheet ? Array.from(sheet.cssRules, rule => rule.cssText).join('\n') : '';
      } catch { katexText = ''; }
      if (!katexText) { katexText = null; return html; }
    }
    return '<style>' + katexText + '</style>' + html;
  }
  const lastHeight = new Map();
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
      const resize = () => { const box = doc.body.getBoundingClientRect(); const bottom = parseFloat(doc.defaultView.getComputedStyle(doc.body).marginBottom)||0; const height = Math.max(box.bottom+doc.defaultView.scrollY,box.top+doc.body.scrollHeight)+Math.max(0,bottom); if (height>0) { frame.style.height = Math.ceil(height+2)+'px'; if (frame.title) lastHeight.set(frame.title, frame.style.height); } };
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
  window.DSStudentFragment = Object.freeze({render,fit,applyTypography,compact,renderRules});
})();
