/* 지침 확인: 렌더규격-0903@r1.11 · 카드@r1
 * Presentation only: published page bytes and the shared print renderer are reused.
 * Question text, equations, source cards and print CSS are never rewritten here.
 */
(() => {
  'use strict';
  if (window.DSHeroDetailV39 || typeof window.cinemaScreen !== 'function') return;
  const previousScreen = window.cinemaScreen;
  const previousShow = window.showCinema;
  const content = document.getElementById('content');
  const paperWidth = 210 * 96 / 25.4;
  const paperHeight = 297 * 96 / 25.4;
  let source = 'library', page = 0, zoom = true, sizeObserver;
  const icon = (name) => {
    const paths = {
      back:'M15 5 8 12l7 7', chevron:'m9 5 7 7-7 7',
      expand:'M9 3H3v6m12-6h6v6M3 15v6h6m12-6v6h-6',
      book:'M12 5v15M3 4c4-1 6 0 9 1 3-1 5-2 9-1v15c-4-1-6 0-9 1-3-1-5-2-9-1Z',
      file:'M6 3h8l4 4v14H6ZM14 3v5h4M9 12h6m-6 4h6',
      close:'m6 6 12 12M6 18 18 6', zoom:'M18 18l4 4M8 11h6m-3-3v6M19 11a8 8 0 1 1-16 0 8 8 0 0 1 16 0'
    };
    return `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="${paths[name]}"/></svg>`;
  };
  const safe = value => String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  function printConfig() {
    const questions = window.DSBasicExamV34?.questions.filter(q=>q.unit==='지수와 로그').slice(0,4) || [];
    return {canonical:true,design:'exam',layout:4,book:false,title:'지수와 로그 수업 프린트',
      subject:'수학Ⅰ',unit:'지수와 로그',questions,
      settings:{titleAlign:'center',showStudentName:true,showPageNumber:true,headerText:'수능 기출 · 지수와 로그',footerText:'DELTASKILL · 수업 프린트'}};
  }
  function model() {
    return source==='library'
      ? {title:'유리함수와 무리함수',file:'유리함수와 무리함수.pdf',caption:'내신자료 · 4문항 2단',pageLabel:'문제 1쪽'}
      : {title:'지수와 로그 수업 프린트',file:'지수와 로그 수업 프린트.pdf',caption:'수능 기출 · 4문항',pageLabel:`${page+1} / 2`};
  }
  function sheet() {
    if(source==='library') return '<img class="hd39-published-page" src="reference-print-v14/NS-CM2-07-L4.png" width="1000" height="1416" alt="델타스킬 실제 내신자료 원본. 유리함수와 무리함수 4문항 2단 프린트." decoding="async">';
    const api=window.DSCanonicalPrintV35, c=printConfig();
    if(!api || c.questions.length!==4) return '<p class="hd39-loading">프린트를 불러오는 중입니다.</p>';
    return `<div class="hd39-canonical-page"><iframe title="실제 프린트 ${page===0?'문제':'정답과 해설'} 지면" scrolling="no" srcdoc="${safe(api.documentHTML(c,page))}"></iframe></div>`;
  }
  function reader() {
    const m=model();
    return `<div class="hd39-app" role="group" aria-label="실제 델타스킬 자료를 보는 패드 화면">
      <div class="hd39-appbar"><span class="hd39-app-symbol">${icon('book')}</span><strong>자료실</strong><span class="hd39-wordmark">DELTASKILL</span></div>
      <div class="hd39-tabs" role="group" aria-label="패드에서 볼 자료">
        <button type="button" data-hd39-source="library" aria-pressed="${source==='library'}">내신자료</button>
        <button type="button" data-hd39-source="print" aria-pressed="${source==='print'}">수업 프린트</button>
      </div>
      <div class="hd39-filebar"><span>${icon('file')}<strong>${m.file}</strong></span><button type="button" data-hd39-open aria-label="패드 지면 크게 보기">${icon('expand')}</button></div>
      <div class="hd39-paper-well ${zoom?'is-zoomed':''}" tabindex="0" aria-label="프린트 지면 스크롤"><div class="hd39-sheet-surface">${sheet()}</div></div>
      <div class="hd39-readerbar"><span>${m.caption}</span><div class="hd39-page-controls">${source==='print'?`<button type="button" data-hd39-page="0" ${page===0?'disabled':''} aria-label="문제 쪽 보기">${icon('back')}</button>`:''}<strong>${m.pageLabel}</strong>${source==='print'?`<button type="button" data-hd39-page="1" ${page===1?'disabled':''} aria-label="정답과 해설 쪽 보기">${icon('chevron')}</button>`:''}</div><button type="button" data-hd39-zoom aria-pressed="${zoom}" aria-label="${zoom?'프린트 전체 보기':'프린트 확대하기'}">${icon('zoom')}</button></div>
    </div>`;
  }
  function enhance(html,index) {
    if(document.documentElement.dataset.design!=='b' || ![1,2].includes(Number(index)))return html;
    const template=document.createElement('template');template.innerHTML=html;
    const device=template.content.querySelector('.ip19-device');if(!device)return html;
    device.classList.add('hd39-device');
    if(Number(index)===1) {
      device.classList.add('hd39-portrait-device');
      device.setAttribute('role','group');device.setAttribute('aria-label','세로 패드의 실제 델타스킬 프린트');
      const target=device.querySelector('.hf26-demo, img.ip19-screen');
      if(target){const inner=document.createElement('template');inner.innerHTML=reader();target.replaceWith(inner.content.firstElementChild);}
      const stylus=document.createElement('span');stylus.className='hd39-pencil';stylus.setAttribute('aria-hidden','true');device.append(stylus);
    } else {
      const hint=device.querySelector('.ht23-heading>span');if(hint)hint.textContent='50분 · 25문항';
    }
    return template.innerHTML;
  }
  window.cinemaScreen=function(index){return enhance(previousScreen.apply(this,arguments),index);};
  function fitSurface(surface) {
    const well=surface.closest('.hd39-paper-well');if(!well)return;
    const padding=getComputedStyle(well);
    const available=Math.max(0,well.clientHeight-parseFloat(padding.paddingTop)-parseFloat(padding.paddingBottom));
    const wide=Math.max(0,well.clientWidth-parseFloat(padding.paddingLeft)-parseFloat(padding.paddingRight));
    if(!available||!wide)return;
    const isExpanded=well.classList.contains('is-zoomed');
    const width=isExpanded ? wide : Math.min(wide,available*210/297);
    surface.style.width=width+'px';
    surface.style.setProperty('--hd39-page-scale',String(surface.clientWidth/paperWidth));
  }
  function fitAll(){document.querySelectorAll('.hd39-sheet-surface').forEach(fitSurface);}
  function observe() {
    sizeObserver?.disconnect();sizeObserver=new ResizeObserver(fitAll);
    document.querySelectorAll('.hd39-paper-well').forEach(el=>sizeObserver.observe(el));
    fitAll();
  }
  function pauseForReading(){
    const control=document.querySelector('[data-cinema-pause][aria-label="배경 일시정지"]');
    control?.click();
  }
  function repaint() {
    const app=document.querySelector('.home-body .hd39-app');
    if(app){app.outerHTML=reader();observe();}
  }
  function openReader() {
    pauseForReading();
    let dialog=document.getElementById('hd39-reader');
    if(!dialog){dialog=document.createElement('dialog');dialog.id='hd39-reader';dialog.className='hd39-dialog';document.body.append(dialog);dialog.addEventListener('close',observe);}
    const m=model();
    dialog.innerHTML=`<header><div><strong>${m.title}</strong><span>${m.caption}</span></div><button type="button" data-hd39-close aria-label="지면 확대 닫기">${icon('close')}</button></header><div class="hd39-paper-well is-zoomed" tabindex="0" aria-label="확대한 프린트 지면"><div class="hd39-sheet-surface">${sheet()}</div></div>`;
    dialog.showModal();observe();
  }
  window.showCinema=function(index){previousShow.apply(this,arguments);observe();};
  document.addEventListener('click',event=>{
    const target=event.target.closest('[data-hd39-source],[data-hd39-page],[data-hd39-zoom],[data-hd39-open],[data-hd39-close]');
    if(!target)return;
    if(target.hasAttribute('data-hd39-close')){document.getElementById('hd39-reader')?.close();return;}
    pauseForReading();
    if(target.hasAttribute('data-hd39-open')){openReader();return;}
    if(target.hasAttribute('data-hd39-source')){source=target.dataset.hd39Source;page=0;}
    if(target.hasAttribute('data-hd39-page'))page=Number(target.dataset.hd39Page);
    if(target.hasAttribute('data-hd39-zoom'))zoom=!zoom;
    repaint();
  });
  if(content)new MutationObserver(observe).observe(content,{childList:true});
  window.DSHeroDetailV39=Object.freeze({printConfig,fitAll});
  const stage=document.querySelector('.home-body .cinema');
  if(stage)window.showCinema(Number(stage.dataset.scene)||0);
})();
