/* Shared physical paper surface. Original math documents are embedded unchanged. */
(()=>{'use strict';
 const reference='reference-print-v14/NS-CM2-06-L2.png';
 const image=()=>'<img class="ds48-original-paper" src="'+reference+'" width="1000" height="1416" alt="내신자료 함수 · 2문항 2단 실제 원본 지면">';
 const scene=content=>'<div class="paper-photo-scene ds48-paper-scene"><div class="ds48-paper-position">'+content+'</div></div>';
 function fit(scope=document){scope.querySelectorAll('.ds48-paper-position').forEach(el=>{const page=el.querySelector('.pc14-preview-scale'),iframe=el.querySelector(':scope > iframe');const target=page||iframe;if(!target)return;target.style.cssText='width:793.7008px;height:1122.5197px;max-width:none;border:0;transform:none;zoom:'+(el.clientWidth/793.7008);});}
 window.DSPrintSurfaceV48=Object.freeze({reference,image,scene,fit});
 window.addEventListener('resize',()=>fit());
})();
