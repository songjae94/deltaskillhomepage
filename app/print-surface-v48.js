/* Shared physical paper surface. Original math documents are embedded unchanged. */
(()=>{'use strict';
 const reference='reference-print-v14/NS-CM2-06-L2.png';
 const image=()=>'<img class="ds48-original-paper" src="'+reference+'" width="1000" height="1416" alt="내신자료 함수 · 2문항 2단 실제 원본 지면">';
 const scene=content=>'<div class="paper-photo-scene ds48-paper-scene"><div class="ds48-paper-position">'+content+'</div></div>';
 const observed=new WeakSet();
 const paperResize=new ResizeObserver(entries=>entries.forEach(({target})=>fit(target.parentElement)));
 function fit(scope=document){scope.querySelectorAll('.ds48-paper-position').forEach(el=>{const page=el.querySelector('.pc14-preview-scale'),iframe=el.querySelector(':scope > iframe');const target=page||iframe;if(!target)return;if(!observed.has(el)){observed.add(el);paperResize.observe(el);}target.style.cssText='width:793.7008px;height:1122.5197px;max-width:none;border:0;transform:none;zoom:'+(el.clientWidth/793.7008);});}
 function openPaper(source) {
   const modal = document.createElement('dialog');
   modal.className = 'ds-print-reader';
   modal.setAttribute('aria-label', 'A4 프린트 원본 보기');
   modal.innerHTML = '<header><strong>A4 프린트</strong><button type="button" data-paper-fit aria-pressed="false">폭 맞춤</button><form method="dialog"><button autofocus aria-label="원본 보기 닫기">닫기 ×</button></form></header><div class="ds-print-reader-scroll" tabindex="0" aria-label="시험지 가로·세로 이동"><div class="ds-print-reader-page"></div></div>';
   const scroll = modal.querySelector('.ds-print-reader-scroll');
   const paper = modal.querySelector('.ds-print-reader-page');
   const frame = document.createElement('iframe');
   frame.title = source.title;
   frame.srcdoc = source.srcdoc;
   frame.tabIndex = -1;
   frame.setAttribute('scrolling','no');
   paper.append(frame);
   const control = modal.querySelector('[data-paper-fit]');
   function size() {
     const factor = control.getAttribute('aria-pressed') === 'true' ? Math.min(1, (scroll.clientWidth - 16) / 793.7008) : 1;
     paper.style.width = (793.7008 * factor) + 'px';
     paper.style.height = (1122.5197 * factor) + 'px';
     frame.style.transform = 'scale(' + factor + ')';
   }
   control.addEventListener('click', () => {
     control.setAttribute('aria-pressed', String(control.getAttribute('aria-pressed') !== 'true'));
     size();
   });
   document.body.append(modal);
   modal.showModal();
   size();
   const observer = new ResizeObserver(size);
   observer.observe(scroll);
   const close = () => modal.close();
   const lifecycle = new AbortController();
   for (const event of ['hashchange','ds-session-change','pagehide']) {
     window.addEventListener(event, close, {signal:lifecycle.signal});
   }
   modal.addEventListener('close', () => { lifecycle.abort(); observer.disconnect(); modal.remove(); }, {once:true});
 }
 window.DSPrintSurfaceV48=Object.freeze({reference,image,scene,fit,openPaper});
 window.addEventListener('resize',()=>fit());
})();
