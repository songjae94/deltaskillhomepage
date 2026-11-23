// Editable covers derived from the visual language of the DeltaSkill entrance.
(() => {
  'use strict';
  const art = new URL('public-data/cover-editorial/', document.currentScript.src);
  const styles = [
    {id:'signature', name:'델타스킬 영문 로고', group:'브랜드'},
    {id:'wheat-gallery', name:'밀밭의 붓결', group:'명화·드로잉'},
    {id:'spine', name:'회전 책등', group:'타이포그래피'},
    {id:'leaf-margin', name:'세이지 책갈피', group:'타이포그래피'},
    {id:'orbit-field', name:'올리브 관측창', group:'사진·공간'},
    {id:'city-band', name:'도시 항공사진', group:'사진·공간'},
  ];
  const escape = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const css = `
  .bc65-editorial{color:var(--ink)!important;text-align:left;background:var(--stock);font-family:Arial,'Apple SD Gothic Neo','Malgun Gothic',sans-serif}
  .bc65-editorial *{box-sizing:border-box}
  .bc65-editorial .ed-copy{position:absolute;inset:auto 9% 12%;color:var(--ink)!important;z-index:1}
  .bc65-editorial .ed-copy .bc65-title{font-size:var(--ed-title)!important;color:var(--ink)!important;font-weight:600;line-height:1.23;word-break:keep-all;overflow-wrap:anywhere;letter-spacing:-.055em;margin:1.7cqw 0}
  .bc65-editorial .ed-small,.bc65-editorial .ed-unit{display:block;font:500 2.45cqw/1.5 Arial,'Apple SD Gothic Neo',sans-serif!important;letter-spacing:0;overflow-wrap:anywhere;color:var(--ink)!important}
  .bc65-editorial .ed-unit{font-size:2.15cqw!important;margin-top:2.4cqw}
  .bc65-editorial .ed-academy{position:absolute;top:6%;left:9%;right:9%;font:600 2.4cqw/1.4 Arial,sans-serif;color:var(--ink)!important;overflow-wrap:anywhere}
  .bc65-editorial .ed-foot{position:absolute;bottom:4.5%;left:9%;right:9%;display:flex;justify-content:space-between;font:600 1.9cqw/1.4 Arial,sans-serif;letter-spacing:.06em;color:var(--ink)!important}
  .bc65-signature{--ink:#dce4ef;--stock:#19233c}
  .bc65-signature:before{content:'';position:absolute;width:147%;height:39%;left:-16%;top:20%;transform:rotate(-13deg);border-top:1px solid #98a8c447;border-bottom:1px solid #98a8c447;background:linear-gradient(175deg,#8393ae04,#657da225 78%,#bdcde11a)}
  .bc65-editorial .ed-wordmark{position:absolute;top:39%;left:8.6%;font:900 13.1cqw/.95 Arial,sans-serif!important;letter-spacing:-.067em;color:#e2eaf3!important;white-space:nowrap}
  .bc65-editorial .ed-wordmark span{color:inherit!important}
  .bc65-spine{--ink:#432736;--stock:#ead5cd;background:linear-gradient(90deg,#c7746e 0 12%,#ead5cd 12% 83%,#dba89c 83%)}
  .bc65-spine:before{content:'';position:absolute;inset:5% 21% 5% 17%;border-right:1px solid #ab7c79;border-left:1px solid #ab7c79}
  .bc65-spine .ed-academy{left:23%}
  .bc65-spine .ed-copy{left:23%;right:24%;bottom:10%}
  .bc65-spine[data-short=true] .ed-copy{left:25%;top:84%;bottom:auto;right:auto;width:99cqw;transform-origin:top left;transform:rotate(-90deg)}
  .bc65-spine[data-short=true] .ed-copy .bc65-title{font-size:6.25cqw!important;letter-spacing:-.04em}
  .bc65-spine .ed-foot{left:23%}
  .bc65-spine>.ed-unit{position:absolute;left:86%;top:12%;writing-mode:vertical-rl;text-orientation:upright;max-height:62%;margin:0;letter-spacing:.05em}
  .bc65-leaf-margin[data-short=true] .ed-copy{top:23%;bottom:22%;left:11%;right:31%;display:flex;flex-direction:row-reverse;justify-content:flex-end;gap:4cqw}
  .bc65-leaf-margin[data-short=true] .bc65-title{writing-mode:vertical-rl;text-orientation:upright;letter-spacing:.09em!important;width:auto;max-height:100%;margin:0;line-height:1.38;font-size:5.8cqw!important}
  .bc65-leaf-margin[data-short=true] .ed-small{writing-mode:vertical-rl;text-orientation:mixed;font-size:2.5cqw!important}
  .bc65-leaf-margin{--ink:#425965;--stock:#f3f6e8}
  .bc65-leaf-margin .ed-copy{right:23%;bottom:auto;top:37%}
  .bc65-leaf-margin .ed-copy .bc65-title{font-family:'AppleMyungjo','Batang',serif;font-weight:500;line-height:1.34}
  .ed-leaf{position:absolute;inset:0 4% 0 auto;width:12%;border-left:1px solid #9fae9d}
  .ed-leaf i{position:absolute;left:-.4cqw;width:9cqw;height:15cqw;border-radius:100% 0 100% 0;background:#677e81;transform:rotate(-9deg);transform-origin:bottom left}
  .ed-leaf i:nth-child(even){left:-6.6cqw;transform:scaleX(-1) rotate(9deg);width:6cqw;height:10cqw;background:#a5b4a2}
  .bc65-orbit-field{--ink:#f5f3db;--stock:#38452d;background:repeating-radial-gradient(ellipse at 110% 200%,#344129 0 .45cqw,#3a472e .6cqw 1cqw,#39462d 1.5cqw 2cqw)}
  .bc65-orbit-field .bc65-background{inset:16% auto auto 16%;width:52%;height:auto;aspect-ratio:1;z-index:0;object-fit:cover}
  .bc65-orbit-field .ed-copy{left:16%;right:12%;top:56%;bottom:auto}
  .bc65-orbit-field .ed-foot{font-size:1.65cqw;letter-spacing:.025em}
  .bc65-wheat-gallery{--ink:#1b413a;--stock:#e7efe5;background:linear-gradient(to right,#bdd3b1 0 21%,#e7efe5 21%)}
  .bc65-wheat-gallery .bc65-background{inset:0 0 auto auto;width:79%;height:54%;object-position:59% center;z-index:0}
  .bc65-wheat-gallery .ed-copy{left:28%;right:8%;bottom:auto;top:60%;text-align:left}
  .bc65-wheat-gallery .ed-academy{top:4%;left:3%;right:82%;font-size:2.2cqw}
  .bc65-wheat-gallery>.ed-unit,.bc65-signature>.ed-unit,.bc65-leaf-margin>.ed-unit,.bc65-city-band>.ed-unit,.bc65-orbit-field>.ed-unit{position:absolute;z-index:1;margin:0}
  .bc65-wheat-gallery>.ed-unit{left:3%;right:82%;top:61%;line-height:1.65!important}
  .bc65-signature>.ed-unit{left:56%;right:9%;top:6%;text-align:right}
  .bc65-signature .ed-academy{right:50%}
  .bc65-leaf-margin>.ed-unit{left:9%;right:24%;bottom:15%;border-top:1px solid #83958b;padding-top:2cqw}
  .bc65-orbit-field>.ed-unit{top:8%;left:52%;right:8%;text-align:right}
  .bc65-orbit-field .ed-academy{right:54%}
  .bc65-city-band>.ed-unit{right:8%;left:9%;bottom:10%;text-align:right}
  .bc65-city-band[data-dense=true] .ed-copy{top:65%}
  .bc65-wheat-gallery .ed-foot{font-size:1.65cqw;letter-spacing:0}
  .bc65-city-band{--ink:#222e2b;--stock:#eeeede}
  .bc65-city-band .bc65-background{inset:0 0 auto;width:100%;height:64%;z-index:0;object-position:center 45%}
  .bc65-city-band .ed-academy{background:#f3f0df;right:auto;max-width:80%;padding:1cqw 2cqw;top:4%}
  .bc65-city-band .ed-copy{top:68%;bottom:auto}
  `;
  function render(style, model = {}) {
    const title = String(model.title || '내 교재');
    const units = Array.isArray(model.units) ? model.units.filter(Boolean) : [model.unit].filter(Boolean);
    const unit = units.slice(0, 2).join(' · ') + (units.length > 2 ? ' 외 '+(units.length-2)+'단원' : '');
    const length = Array.from(title).length;
    const size = length > 32 ? 4.25 : length > 16 ? 5.1 : 6.3;
    const image = (file,alt) => '<img class="bc65-background" src="'+new URL(file,art).href+'" alt="'+alt+'">';
    const artworks = {
      'wheat-gallery':image('cypresses.webp','빈센트 반 고흐의 사이프러스가 있는 밀밭'),
      spine:'',
      signature:'<div class="ed-wordmark" aria-label="델타스킬">DELTA<span>SKILL</span></div>',
      'leaf-margin':'<div class="ed-leaf" aria-hidden="true">'+[5,19,29,43,58,69,83,96].map(y=>'<i style="top:'+y+'%"></i>').join('')+'</div>',
      'orbit-field':image('earthrise.webp','달 지평선 위로 떠오르는 지구'),
      'city-band':image('city.webp','도시의 강과 다리를 내려다본 풍경'),
    };
    const credit = style === 'wheat-gallery' ? 'Vincent van Gogh, 1889 · The Met' : style === 'orbit-field' ? 'Earthrise · NASA / Bill Anders' : style === 'signature' ? '델타스킬' : 'DELTASKILL';
    return `<div class="bc65-cover bc65-editorial bc65-${style}" data-cover-style="${style}" data-dense="${length>32}" data-short="${length<=16}" style="--ed-title:${size}cqw" aria-label="${escape(title)} 표지">${artworks[style]}<div class="ed-academy">${escape(model.academy)}</div><div class="ed-copy"><span class="ed-small">${escape(model.subject)}</span><h2 class="bc65-title">${escape(title)}</h2></div><span class="ed-unit">${escape(unit)}</span><div class="ed-foot"><span>${credit}</span><span>${Number.isInteger(model.count)&&model.count>0?model.count+'문항':''}</span></div></div>`;
  }
  window.DSBookCoverEditorialTemplates={styles,css,render};
})();
