/* Original photo/art cover layouts. No sales catalogue, account state or interior changes. */
(() => {
  'use strict';
  if (window.DSBookCoverPhotoTemplates) return;
  const base = new URL('.', document.currentScript?.src || location.href);
  const asset = file => new URL('public-data/cover-photo/' + file, base).href;
  const escape = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const text = (value, max) => typeof value === 'string' ? [...value.normalize('NFC').replace(/[\u0000-\u001f\u007f]/g, ' ').trim()].slice(0, max).join('') : '';
  const styles = Object.freeze([
    {id:'photo-botanical',name:'세피아 꽃사진'},
    {id:'photo-studio',name:'검은 사진집'},
    {id:'photo-alpine',name:'산과 계단 활자'},
    {id:'photo-horizon',name:'풍경과 청록 필기'},
    {id:'photo-burgundy',name:'버건디 꽃그림'},
    {id:'photo-architecture',name:'건축과 여백'}
  ].map(Object.freeze));
  const css = `
@font-face{font-family:BCPhotoSans;src:url("${asset('nanum-gothic.woff2')}") format("woff2");font-style:normal;font-weight:400;font-display:block}
@font-face{font-family:BCPhotoPen;src:url("${asset('nanum-pen.woff2')}") format("woff2");font-style:normal;font-weight:400;font-display:block}
.bc65-cover.bc65-photo{position:relative;container-type:inline-size;isolation:isolate;width:100%;height:100%;aspect-ratio:210/297;overflow:hidden;box-sizing:border-box!important;background:#fbfaf5;color:var(--bc-photo-ink,#292c2d)!important;font-family:BCPhotoSans,'Apple SD Gothic Neo','Malgun Gothic',sans-serif;print-color-adjust:exact;-webkit-print-color-adjust:exact;text-align:left}
.bc65-cover.bc65-photo *{box-sizing:border-box}
.bc65-photo .bc65-photo-art{position:absolute;inset:0;width:auto;height:auto;z-index:0;overflow:hidden;pointer-events:none}
.bc65-photo .bc65-photo-art img{display:block;position:absolute;inset:0;width:100%;height:100%;max-width:none;object-fit:cover;object-position:center;z-index:0}
.bc65-photo .bc65-photo-copy{position:absolute;z-index:2;left:8cqw;right:8cqw;top:8cqw;color:var(--bc-photo-ink,#292c2d)!important}
.bc65-photo .bc65-photo-copy p{margin:0;color:inherit!important;word-break:keep-all;overflow-wrap:anywhere}
.bc65-photo .bc65-photo-academy{font-size:2.4cqw;line-height:1.35;margin-bottom:2.1cqw!important;font-weight:600}
.bc65-photo .bc65-photo-subject{font-size:2cqw;line-height:1.4;margin-bottom:2cqw!important;font-weight:500}
.bc65-photo h2.bc65-title{position:relative;margin:0!important;padding:0!important;border:0!important;background:none!important;color:inherit!important;font-size:var(--bc-photo-title,8.4cqw)!important;font-weight:500;line-height:1.16!important;letter-spacing:-.035em;word-break:keep-all;overflow-wrap:anywhere;text-align:left;max-width:100%}
.bc65-photo .bc65-photo-units{font-size:2cqw!important;line-height:1.45!important;margin-top:2.4cqw!important;letter-spacing:0}
.bc65-photo .bc65-photo-count{font-size:2cqw!important;line-height:1.4!important;margin-top:1.2cqw!important}
.bc65-photo .bc65-photo-brand{position:absolute;z-index:2;left:8cqw;bottom:6.5cqw;font-size:2.2cqw;line-height:1.3;letter-spacing:.12em;color:var(--bc-photo-ink,#292c2d)!important}
.bc65-photo-botanical{--bc-photo-ink:#43382d;background:#fffefa!important}
.bc65-photo-botanical .bc65-photo-art{left:6cqw;right:6cqw;top:21cqw;bottom:auto;height:58cqw}
.bc65-photo-botanical .bc65-photo-art img{transform:scale(1.14);filter:saturate(.75) contrast(.97) brightness(1.03)}
.bc65-photo-botanical .bc65-photo-copy{top:90cqw;left:9cqw;right:9cqw}
.bc65-photo-botanical h2.bc65-title{font-family:'AppleMyungjo','Noto Serif KR','Batang',serif;line-height:1.2!important;font-weight:400}
.bc65-photo-botanical .bc65-photo-academy{position:absolute;top:-82cqw;left:0;margin:0!important}
.bc65-photo-botanical .bc65-photo-brand{left:9cqw}
.bc65-photo-studio{--bc-photo-ink:#f0eeea;background:#111213!important}
.bc65-photo-studio .bc65-photo-art{left:52cqw;right:9cqw;top:56cqw;bottom:auto;height:39cqw}
.bc65-photo-studio .bc65-photo-art img{filter:saturate(.7) contrast(1.04)}
.bc65-photo-studio .bc65-photo-copy{top:11cqw;left:9cqw;right:9cqw}
.bc65-photo-studio h2.bc65-title{font-family:'AppleMyungjo','Noto Serif KR','Batang',serif;max-width:82cqw;font-weight:400;line-height:1.2!important}
.bc65-photo-studio .bc65-photo-academy{position:absolute;top:94cqw}
.bc65-photo-studio .bc65-photo-subject{position:absolute;top:100cqw}
.bc65-photo-studio .bc65-photo-units{position:absolute;top:104cqw;margin-top:0!important;max-width:82cqw}
.bc65-photo-studio .bc65-photo-count{position:absolute;top:114cqw;margin-top:0!important}
.bc65-photo-alpine{--bc-photo-ink:#14242e;background:#b8c2c9!important}
.bc65-photo-alpine .bc65-photo-art img{filter:saturate(.55) contrast(.94) brightness(1.04)}
.bc65-photo-alpine .bc65-photo-copy{top:10cqw;left:35cqw;right:7cqw}
.bc65-photo-alpine h2.bc65-title{font-weight:750;line-height:1.12!important}
.bc65-photo-alpine h2.bc65-title span{display:block;width:max-content;max-width:100%;margin-left:calc(var(--bc-step)*3cqw)}
.bc65-photo-alpine .bc65-photo-academy{position:absolute;top:95cqw;right:0;text-align:right;width:80cqw;max-width:80cqw}
.bc65-photo-alpine .bc65-photo-subject{position:absolute;top:101cqw;right:0;text-align:right;width:80cqw}
.bc65-photo-alpine .bc65-photo-units{position:absolute;top:105cqw;right:0;width:80cqw;max-width:80cqw;margin:0!important;text-align:right}
.bc65-photo-alpine .bc65-photo-count{position:absolute;top:115cqw;right:0;margin:0!important;text-align:right}
.bc65-photo-alpine .bc65-photo-brand{left:auto;right:7cqw}
.bc65-photo-alpine[data-long-title="true"] .bc65-photo-copy{left:10cqw;right:10cqw}
.bc65-photo-horizon{--bc-photo-ink:#176e68;background:#eeeade!important}
.bc65-photo-horizon .bc65-photo-art{bottom:auto;height:87cqw}
.bc65-photo-horizon .bc65-photo-art img{filter:saturate(.8) brightness(1.02);object-position:center 50%}
.bc65-photo-horizon .bc65-photo-copy{top:93cqw;left:8cqw;right:8cqw}
.bc65-photo-horizon h2.bc65-title,.bc65-photo-burgundy h2.bc65-title{font-family:BCPhotoPen,BCPhotoSans,sans-serif;font-size:calc(var(--bc-photo-title)*1.18)!important;line-height:1.02!important;font-weight:400;letter-spacing:0}
.bc65-photo-horizon h2.bc65-title{transform:rotate(-2deg);transform-origin:left top}
.bc65-photo-horizon .bc65-photo-academy{position:absolute;top:-86cqw;left:0;color:#244941!important}
.bc65-photo-horizon .bc65-photo-subject{position:absolute;top:-80cqw;left:0;color:#244941!important}
.bc65-photo-horizon .bc65-photo-brand{left:auto;right:8cqw;font-size:2cqw;bottom:4cqw}
.bc65-photo-horizon .bc65-photo-units{font-size:1.9cqw!important;margin-top:2cqw!important}
.bc65-photo-horizon .bc65-photo-count{font-size:1.9cqw!important;margin-top:.8cqw!important}
.bc65-photo-burgundy{--bc-photo-ink:#fff0d2;background:#60091c!important}
.bc65-photo-burgundy .bc65-photo-art img{filter:saturate(.85) brightness(.98)}
.bc65-photo-burgundy .bc65-photo-copy{top:12cqw;left:8cqw;right:11cqw}
.bc65-photo-burgundy h2.bc65-title{transform:rotate(-4deg);transform-origin:left center;margin-top:8cqw!important}
.bc65-photo-burgundy .bc65-photo-units{margin-top:5cqw!important;max-width:75cqw}
.bc65-photo-architecture{--bc-photo-ink:#202a31;background:#c1c5c7!important}
.bc65-photo-architecture .bc65-photo-art img{filter:saturate(.4) contrast(.94) brightness(1.05);object-position:center}
.bc65-photo-architecture .bc65-photo-art:after{content:'';position:absolute;inset:0;background:linear-gradient(180deg,#edf0ed44 0%,transparent 55%)}
.bc65-photo-architecture .bc65-photo-copy{top:10cqw;left:8cqw;right:13cqw}
.bc65-photo-architecture h2.bc65-title{font-weight:600;letter-spacing:-.055em}
.bc65-photo-architecture .bc65-photo-academy{margin-bottom:6cqw!important}
.bc65-photo-architecture .bc65-photo-brand{color:#f5f3ef!important;text-shadow:0 1px 3px #0009}
`;
  function render(style, model = {}) {
    const selected = styles.find(s => s.id === style) || styles[0];
    const m = model && typeof model === 'object' && !Array.isArray(model) ? model : {};
    const title = text(m.title, 60) || '학습 자료';
    const subject = text(m.subject, 40), academy = text(m.academy, 30);
    const units = Array.isArray(m.units) ? [...new Set(m.units.filter(v => typeof v === 'string').slice(0, 20).map(v => text(v, 36)).filter(Boolean))] : [];
    const summary = units.slice(0, 3).join(' · ') + (units.length > 3 ? ' 외 ' + (units.length - 3) + '단원' : '');
    const count = Number.isSafeInteger(m.count) && m.count >= 0 && m.count <= 1000000 ? m.count : null;
    const length = [...title].length, size = length > 44 ? 4 : length > 28 ? 5 : length > 16 ? 6 : 7.4;
    let heading = escape(title);
    if (selected.id === 'photo-alpine') {
      const words = title.split(/\s+/).filter(Boolean), lines = [];
      if (words.length <= 4) lines.push(...words);
      else {
        const target = Math.ceil(length / 4);
        for (const word of words) {
          const last = lines.length - 1;
          if (last < 0 || ([...lines[last]].length + [...word].length + 1 > target && lines.length < 4)) lines.push(word);
          else lines[last] += ' ' + word;
        }
      }
      heading = lines.map((line, i) => `<span style="--bc-step:${i}">${escape(line)}</span>`).join('');
    }
    return `<section class="bc65-cover bc65-photo bc65-${selected.id}" data-cover-style="${selected.id}" data-long-title="${length > 28}" style="--bc-photo-title:${size}cqw" aria-label="${escape(title)} 표지"><div class="bc65-photo-art"><img class="bc65-background" src="${escape(asset(selected.id.slice(6) + '.webp'))}" alt="" decoding="sync"></div><div class="bc65-photo-copy">${academy ? `<p class="bc65-photo-academy">${escape(academy)}</p>` : ''}${subject ? `<p class="bc65-photo-subject">${escape(subject)}</p>` : ''}<h2 class="bc65-title" aria-label="${escape(title)}">${heading}</h2>${summary ? `<p class="bc65-photo-units">${escape(summary)}</p>` : ''}${count !== null ? `<p class="bc65-photo-count">${count.toLocaleString('ko-KR')}문항</p>` : ''}</div><div class="bc65-photo-brand">델타스킬</div></section>`;
  }
  window.DSBookCoverPhotoTemplates = Object.freeze({ styles, css, render });
})();
