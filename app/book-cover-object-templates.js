/* Original text-free still-life backgrounds; all book information stays dynamic. */
(() => {
  'use strict';
  const styles=[{id:'study-notes',name:'책상 노트'},{id:'quiet-ceramic',name:'고요한 도자기'},{id:'botanical-frame',name:'꽃 테두리'},{id:'ink-garden',name:'잉크 정원'},{id:'teal-botanic',name:'청록 꽃문자'},{id:'winter-walk',name:'겨울 산책'},{id:'math-tools',name:'수학 도구 노트'}];
  const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const base=new URL('.',document.currentScript?.src||location.href);
  const css=`
.bc65-cover.bc65-object{position:relative;container-type:inline-size;isolation:isolate;width:100%;height:100%;aspect-ratio:210/297;overflow:hidden;background:#f7f2e9;color:#292b2b!important;font-family:Arial,'Malgun Gothic',sans-serif;print-color-adjust:exact;-webkit-print-color-adjust:exact}
.bc65-object *{box-sizing:border-box}.bc65-object .bc65-background{position:absolute!important;inset:0!important;width:100%!important;height:100%!important;max-width:none!important;max-height:none!important;object-fit:cover;z-index:-1}
.bc65-object .bco-copy{position:absolute;left:10cqw;right:14cqw;top:18cqw;color:inherit!important}.bc65-object .bco-academy{font-size:2.2cqw;line-height:1.5;margin:0 0 4cqw}.bc65-object .bco-subject{font-size:2.5cqw;line-height:1.6;margin:0 0 3cqw;font-weight:600}.bc65-object .bc65-title{font-size:var(--bco-title-size,6.2cqw)!important;line-height:1.45!important;font-weight:600!important;letter-spacing:-.04em!important;margin:0!important;word-break:keep-all;overflow-wrap:anywhere;font-family:'Noto Serif KR','Nanum Myeongjo',Batang,serif}.bc65-object .bco-units{font-size:2.3cqw;line-height:1.7;margin:4cqw 0 0;word-break:keep-all;overflow-wrap:anywhere}.bc65-object .bco-count{font-size:2.1cqw;line-height:1.6;margin:2cqw 0 0}.bc65-object .bco-brand{position:absolute;left:10cqw;bottom:8cqw;font-size:2.3cqw;font-weight:600;letter-spacing:.04em;color:inherit!important}
.bc65-object[data-cover-style="study-notes"]{color:#392c54!important}.bc65-object[data-cover-style="study-notes"] .bco-copy{top:21cqw;right:20cqw}.bc65-object[data-cover-style="study-notes"] .bc65-title{font-family:'Nanum Pen Script','Nanum Myeongjo',Batang,serif}.bc65-object[data-cover-style="study-notes"] .bco-brand{top:9cqw;bottom:auto}
.bc65-object[data-cover-style="quiet-ceramic"] .bco-copy{top:16cqw;right:25cqw}.bc65-object[data-cover-style="quiet-ceramic"] .bco-brand{bottom:9cqw}
.bc65-object[data-cover-style="botanical-frame"]{color:#445346!important}.bc65-object[data-cover-style="botanical-frame"] .bco-copy{top:34cqw;left:18cqw;right:18cqw;text-align:center}.bc65-object[data-cover-style="botanical-frame"] .bco-brand{left:18cqw;right:18cqw;bottom:15cqw;text-align:center}.bc65-object[data-cover-style="botanical-frame"] .bco-subject{font-size:2.4cqw;letter-spacing:.08em}.bc65-object[data-cover-style="botanical-frame"] .bco-units{margin-top:5cqw}

.bc65-object .bco-free{position:absolute;font-size:2.2cqw;line-height:1.65;margin:0;max-width:52cqw;color:inherit!important}.bc65-object[data-cover-style="ink-garden"] .bco-copy{top:25cqw;left:22cqw;right:22cqw}.bc65-object[data-cover-style="ink-garden"] .bco-free{right:22cqw;bottom:30cqw;text-align:right;max-width:45cqw}.bc65-object[data-cover-style="ink-garden"] .bco-brand{left:22cqw;bottom:28cqw}
.bc65-object[data-cover-style="teal-botanic"]{color:#31574f!important}.bc65-object[data-cover-style="teal-botanic"] .bco-copy{top:77cqw;left:18cqw;right:18cqw;text-align:center}.bc65-object[data-cover-style="teal-botanic"] .bco-free{left:18cqw;top:23cqw;right:27cqw}.bc65-object[data-cover-style="teal-botanic"] .bco-brand{left:auto;right:18cqw;bottom:13cqw}.bc65-object .bco-monogram{position:absolute;left:18cqw;top:54cqw;font-family:Georgia,serif;font-size:12cqw;line-height:1;color:#6a8f81;opacity:.55}
.bc65-object[data-cover-style="winter-walk"]{color:#fff9e8!important}.bc65-object[data-cover-style="winter-walk"] .bco-copy{top:13cqw;left:14cqw;right:14cqw}.bc65-object[data-cover-style="winter-walk"] .bco-free{top:57cqw;left:14cqw;right:38cqw;font-size:2.1cqw}.bc65-object[data-cover-style="winter-walk"] .bco-brand{top:7cqw;right:14cqw;left:auto;bottom:auto;font-size:1.9cqw}
.bc65-object[data-cover-style="math-tools"]{color:#36433c!important}.bc65-object[data-cover-style="math-tools"] .bco-copy{top:39cqw;left:19cqw;right:24cqw}.bc65-object[data-cover-style="math-tools"] .bco-free{left:19cqw;top:100cqw;right:35cqw}.bc65-object[data-cover-style="math-tools"] .bco-brand{left:19cqw;bottom:16cqw}
.bc65-object[data-cover-style="winter-walk"] .bc65-title,html[data-design] body[data-page] .dd-modern .bf62-root .bc65-object[data-cover-style="winter-walk"] .bco-copy>*{color:#fff9e8!important}
html[data-design] body[data-page] .bc65-object .bco-copy,html[data-design] body[data-page] .bc65-object .bco-copy>*{color:inherit!important}
`;
  function render(style,model={}){
    const id=styles.some(s=>s.id===style)?style:'study-notes';
    const title=String(model.title||'내 교재'),academy=String(model.academy||'');
    const units=(Array.isArray(model.units)?model.units:model.unit?[model.unit]:[]).filter(Boolean).map(String);
    const summary=units.slice(0,3).join(' · ')+(units.length>3?' 외 '+(units.length-3)+'단원':'');
    const size=Array.from(title).length>28?3.6:Array.from(title).length>16?4.8:6.2;
    const floating=['ink-garden','teal-botanic','winter-walk','math-tools'].includes(id);
    const unitHTML=summary?`<p class="bco-units${floating?' bco-free':''}">${esc(summary)}</p>`:'';
    const src=new URL('public-data/cover-object/'+id+'.webp',base).href;
    return `<div class="bc65-cover bc65-object" data-cover-style="${id}" style="--bco-title-size:${size}cqw" aria-label="${esc(title)} 표지"><img class="bc65-background" src="${esc(src)}" alt="" decoding="sync"><div class="bco-copy">${academy?`<p class="bco-academy">${esc(academy)}</p>`:''}${model.subject?`<p class="bco-subject">${esc(model.subject)}</p>`:''}<h2 class="bc65-title">${esc(title)}</h2>${floating?'':unitHTML}${Number.isSafeInteger(model.count)&&model.count>0?`<p class="bco-count">${model.count}문항</p>`:''}</div>${floating?unitHTML:''}${id==='teal-botanic'?'<span class="bco-monogram" aria-hidden="true">D</span>':''}<div class="bco-brand">델타스킬</div></div>`;
  }
  window.DSBookCoverObjectTemplates={styles,css,render};
})();
