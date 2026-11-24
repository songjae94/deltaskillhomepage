/* Interior choices reuse the library's three roles; all specimens are content-free.
   Original questions, equations and solutions pass through the existing renderers unchanged. */
(() => {
  'use strict';
  const esc = x => String(x ?? '').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const designs = [
    {id:'DS-FOCUS-V2',name:'FOCUS',label:'집중형',desc:'큰 문항 번호 · 무지 풀이 공간',short:'집중해서 풀기'},
    {id:'DS-MARGIN-V2',name:'MARGIN',label:'기록형',desc:'첫 생각 · 막힘 · 다음 시도 기록면',short:'풀이를 돌아보기'},
    {id:'DS-SEQUENCE-V2',name:'SEQUENCE',label:'판단형',desc:'한 문항씩 세 판단 · 다시 풀기 기록면',short:'판단을 차례로 기록하기'}
  ];
  let chosen='DS-FOCUS-V2';
  try { const id=localStorage.getItem('ds-document-design-v1');if(designs.some(x=>x.id===id))chosen=id; } catch {}
  const selected=()=>designs.find(x=>x.id===chosen);
  const sampleName = id => id==='DS-MARGIN-V2'?'modern-margin':id==='DS-SEQUENCE-V2'?'modern-sequence':'modern-focus';
  function picker() {
    return `<section class="dd-design-picker" aria-label="내지 디자인"><div class="dd-heading"><h3>내지 디자인</h3><span>문항 배치와 따로 선택</span></div><div class="dd-options">${designs.map(d=>`<button type="button" data-document-design="${d.id}" aria-pressed="${chosen===d.id}" aria-label="${d.name} 선택"><span class="dd-thumb"><img src="public-data/interior-samples/${sampleName(d.id)}.webp" alt="${d.name} 문항 정보 없는 이번 웹출력 시안" loading="lazy" width="1191" height="1685"></span><small class="dd-origin-label">웹출력 시안</small><strong>${d.name}</strong><small>${d.desc}</small><i aria-hidden="true">${chosen===d.id?'선택됨':'선택'}</i></button>`).join('')}</div><div class="dd-selected"><b>${selected().name}</b><span>${selected().desc}</span><button type="button" data-document-design-sample>실물 원형과 웹출력 비교 ↗</button></div><p class="dd-note">${chosen==='DS-FOCUS-V2'?'문제와 원 해설을 그대로 구성합니다.':'문제와 원 해설을 유지하고 문항별 기록면을 함께 구성합니다.'}</p></section>`;
  }
  function records(questions) {
    if(chosen==='DS-FOCUS-V2')return [];
    return questions.map((q,i)=>({type:'design-record',designRecord:true,offset:i,questions:[q],items:[q]}));
  }
  function recordSheet(page,{title='',unit='',index=0,total=1}={}) {
    const sequence=chosen==='DS-SEQUENCE-V2',ordinal=page.offset+1;
    const prompts=sequence?[['01','조건 읽기','조건과 구하려는 것을 기록하세요.'],['02','핵심 판단','풀이를 시작할 핵심 판단을 기록하세요.'],['03','풀이 확인','계산 근거와 확인할 부분을 기록하세요.'],['↻','다시 풀기','해설을 덮고 다시 풀어 보세요.']]:[['01','첫 생각','어디에서 시작할지 기록하세요.'],['02','막힌 지점','판단이나 계산이 막힌 곳을 기록하세요.'],['03','다음 시도','다시 시도할 방법을 기록하세요.']];
    return `<section class="paper dd-record-paper"><header class="head"><div class="brand"><strong>DELTASKILL</strong><span>${esc(unit)}</span></div><h1>${ordinal}번 · ${sequence?'세 판단 기록':'풀이 기록'}</h1><small>${esc(title)}</small></header><main class="body dd-record-body" data-dd-record="${sequence?'sequence':'margin'}">${prompts.map(([n,label,help])=>`<section class="dd-record-block"><div><b>${n}</b><h2>${label}</h2></div><p>${help}</p><div class="dd-writing-lines"></div></section>`).join('')}</main><footer class="foot"><span>${selected().name} · ${ordinal}번 기록면</span><span>${index+1} / ${total}</span></footer></section>`;
  }
  const printCSS=`body[data-document-design]{--dd-ink:#292d36;color:#292d36}body[data-document-design] .paper{padding:16mm 17mm}body[data-document-design] .head{height:24mm;border:0;border-bottom:.25mm solid #c4c6dd;margin-bottom:8mm}body[data-document-design] .brand{font-size:8px;letter-spacing:.05em;color:#858997;border:0;padding:0}body[data-document-design] .brand strong{font-size:8px;font-weight:500;letter-spacing:.06em;color:#555969}body[data-document-design] .brand em{color:inherit;font-style:normal}body[data-document-design] .head h1{font-size:24px!important;font-weight:600;letter-spacing:-.04em;line-height:1.25;margin:5mm 0 2mm;color:#292d36}body[data-document-design] .head small{font-size:9px;color:#9296a0}body[data-document-design] .student{font-size:8px;color:#8b8f9b;right:17mm}body[data-document-design] .body{height:220mm}body[data-document-design] .qhead{border:0;margin-bottom:4mm;padding:0;align-items:baseline}body[data-document-design] .qhead b{font-size:20px!important;font-weight:550;letter-spacing:-.03em;color:#4f5065}body[data-document-design] .qhead small{font-size:8px;color:#9396a1}body[data-document-design] .question{border:0}body[data-document-design] .questions{column-gap:11mm;row-gap:8mm}body[data-document-design] .questions:before{border-left:.2mm solid #e2e3ec!important}body[data-document-design] .ds48-writing{background:none;border-top:.2mm solid #e9eaf0;color:#b0b2bd;font-size:8px}body[data-document-design] .ds48-writing small{display:none}body[data-document-design] .foot{left:17mm;right:17mm;bottom:11mm;border:0;font-size:8px;color:#989ca6;letter-spacing:.01em}body[data-document-design] .solhead{border-color:#e5e6ee}body[data-document-design] .solhead b{font-size:12px;font-weight:600;color:#686a85}body[data-document-design] .dd-record-body{display:grid;height:218mm;gap:10mm}body[data-document-design] .dd-record-body[data-dd-record="margin"]{grid-template-rows:repeat(3,minmax(0,1fr))}body[data-document-design] .dd-record-body[data-dd-record="sequence"]{grid-template-rows:repeat(4,minmax(0,1fr))}body[data-document-design] .dd-record-block{min-height:0;border-top:.2mm solid #dadce8;padding-top:4mm;display:flex;flex-direction:column}body[data-document-design] .dd-record-block>div:first-child{display:flex;gap:4mm;align-items:baseline}body[data-document-design] .dd-record-block b{font:11px Arial;color:#898bb0;letter-spacing:.06em}body[data-document-design] .dd-record-block h2{font-size:14px;letter-spacing:-.025em;margin:0;font-weight:550;color:#3b3f4d}body[data-document-design] .dd-record-block p{font-size:9px;color:#9599a4;margin:2mm 0 5mm;line-height:1.6}body[data-document-design] .dd-writing-lines{flex:1;background:repeating-linear-gradient(to bottom,transparent 0,transparent 8.8mm,#e9eaf0 8.8mm,#e9eaf0 9mm)}body[data-document-design] .dd-record-body[data-dd-record="margin"] .dd-record-block{display:grid;grid-template-columns:33mm minmax(0,1fr);grid-template-rows:auto 1fr;column-gap:8mm;border-top:0}body[data-document-design] .dd-record-body[data-dd-record="margin"] .dd-record-block>div:first-child{grid-row:1 / 3;display:flex;flex-direction:column;align-items:flex-start;gap:3mm;border-top:.4mm solid #b5b7d2;padding-top:3mm}body[data-document-design] .dd-record-body[data-dd-record="margin"] .dd-record-block p{margin:3mm 0 5mm}body[data-document-design] .dd-record-body[data-dd-record="sequence"] .dd-record-block:last-child{border-top:.45mm solid #bbbcd6;padding-top:4mm}body[data-document-design] .dd-record-body[data-dd-record="sequence"] .dd-record-block:last-child h2{font-size:13px}`;
  function decorateDocument(html) {
    return html.replace(/<body(?=[\s>])/,'<style data-document-design-style>'+printCSS+'</style><body data-document-design="'+chosen+'"');
  }
  function select(id) {
    if(!designs.some(d=>d.id===id))return false; chosen=id;
    try {localStorage.setItem('ds-document-design-v1',id);}catch{}
    window.dispatchEvent(new Event('ds-document-design-change'));return true;
  }
  function openSample() {
    const dialog=document.createElement('dialog');dialog.className='dd-sample-dialog';
    dialog.innerHTML=`<form method="dialog"><button aria-label="견본 닫기">닫기 ×</button></form><h2>${selected().name}</h2><p>${selected().desc}</p><div class="dd-sample-image">견본을 불러오는 중입니다.</div><p class="dd-sample-status">문항 정보를 지운 실물 원형 견본입니다. 이번 웹출력은 같은 학습 구조를 현대적으로 편집한 시안입니다.</p>`;
    document.body.append(dialog);dialog.addEventListener('close',()=>dialog.remove());dialog.addEventListener('click',e=>{if(e.target===dialog)dialog.close();});dialog.showModal();
    const kind=chosen==='DS-MARGIN-V2'?'margin':chosen==='DS-SEQUENCE-V2'?'sequence':'focus';
    const tabs=document.createElement('div');tabs.className='dd-sample-tabs';tabs.innerHTML='<button type="button" data-sample-kind="web" aria-pressed="true">웹출력 시안</button><button type="button" data-sample-kind="problem" aria-pressed="false">실물 원형 · 문제</button><button type="button" data-sample-kind="record" aria-pressed="false">실물 원형 · 기록</button>';dialog.querySelector('.dd-sample-image').before(tabs);
    let imageRequest=0;
    const load=which=>{const request=++imageRequest;const img=document.createElement('img');img.alt=selected().name+' '+(which==='web'?'이번 웹출력 시안':which==='problem'?'실물 원형 문제면':'실물 원형 기록면')+' · 문항 정보 없음';img.src='public-data/interior-samples/'+(which==='web'?'modern-'+kind:kind+'-'+which)+'.webp';dialog.querySelector('.dd-sample-status').textContent=which==='web'?'이번 웹출력에 적용되는 현대형 편집 시안입니다. 실제 문항 정보는 들어 있지 않습니다.':'기존 실물의 문항 정보를 지운 원형 견본입니다. 이번 웹출력 시안과 편집이 다릅니다.';img.onload=()=>{if(request===imageRequest&&dialog.isConnected)dialog.querySelector('.dd-sample-image')?.replaceChildren(img);};img.onerror=()=>{if(request===imageRequest&&dialog.isConnected)dialog.querySelector('.dd-sample-status').textContent='견본을 불러오지 못했습니다. 잠시 뒤 다시 열어 주세요.';};};
    tabs.addEventListener('click',e=>{const b=e.target.closest('[data-sample-kind]');if(!b)return;tabs.querySelectorAll('button').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));load(b.dataset.sampleKind);});load('web');

  }
  document.addEventListener('click',e=>{const b=e.target.closest?.('[data-document-design],[data-document-design-sample]');if(!b)return;e.preventDefault();if(b.hasAttribute('data-document-design'))select(b.dataset.documentDesign);else openSample();});
  window.DSDocumentDesign={designs,picker,records,recordSheet,decorateDocument,select,selected:()=>({...selected()}),printCSS};
})();
