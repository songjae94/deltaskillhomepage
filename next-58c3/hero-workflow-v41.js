/* User-order demonstrations. Existing question bodies, published paper and print renderer are reused. */
(() => {
 'use strict';
 if(window.DSHeroWorkflowV41||!window.DSHeroDetailV40)return;
 const priorScreen=window.cinemaScreen,priorShow=window.showCinema,priorPlay=window.playCinema;
 const motion=matchMedia('(prefers-reduced-motion: reduce)');
 const first=regularBank.find(q=>q.id==='FINALS-EASY'),second=timerBank[0];
 const durations={1:10000,2:7500};
 const printTiming={unitOpen:250,unit:750,topicOpen:1040,topic:1550,countOpen:1900,count:2270,compose:2870,review:3370,zoomStart:4800,zoomEnd:5750};
 let root=null,elapsed=0,started=null,raf=0,scene=0,source='library',docPage=0,mode=25,ink=[],phaseUnits={},paperIndex=-1,libraryMode=false,manualAnswers={};
 const safe=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const clamp=n=>Math.max(0,Math.min(1,n));
 const ease=n=>{n=clamp(n);return n*n*(3-2*n);};
 const paths={back:'m14 5-7 7 7 7',pen:'m4 20 1-6L16 3l5 5-11 11-6 1Zm11-16 5 5',eraser:'m4 14 8-10 9 8-7 8H9l-5-6Zm3-4 10 8',zoom:'M19 19l3 3M8 11h6m-3-3v6M19 11a8 8 0 1 1-16 0 8 8 0 0 1 16 0',expand:'M9 3H3v6m12-6h6v6M3 15v6h6m12-6v6h-6',next:'m9 5 7 7-7 7',replay:'M3 10a9 9 0 1 1 1 8M3 3v7h7',file:'M6 3h8l4 4v14H6ZM14 3v5h4M9 12h6m-6 4h6',check:'m4 12 5 5L20 6'};
 const icon=n=>`<svg viewBox="0 0 24 24" aria-hidden="true"><path d="${paths[n]}"/></svg>`;
 const action=(name,label,content,extra='')=>`<button type="button" data-hw41="${name}" aria-label="${label}" ${extra}>${content}</button>`;
 function sheet(which=source,p=docPage){
  if(which==='library')return '<img class="hw41-original" src="reference-print-v14/NS-CM2-07-L4.png" width="1000" height="1416" alt="델타스킬 유리함수와 무리함수 실제 2단 문제지">';
  const config=window.DSHeroDetailV39.printConfig();
  return `<div class="hw41-canonical"><iframe scrolling="no" title="실제 수업 프린트 ${p?'정답과 해설':'문제'}" srcdoc="${safe(window.DSCanonicalPrintV35.documentHTML(config,p))}"></iframe></div>`;
 }
 const title=()=>source==='library'?'유리함수와 무리함수':'지수와 로그 수업 프린트';
 function printField(name,label,initial,example){
  return `<div class="hw42-field" data-hw42-field="${name}"><span>${label}</span>${action('choose-'+name,label+' 선택 시연',`<span data-hw42-value>${initial}</span><i aria-hidden="true">${name==='count'?'↕':'⌄'}</i>`,'class="hw42-control"')}${name==='count'?'<small>문항</small>':`<div class="hw42-menu">${action('select-'+name,example+' 선택',example+' '+icon('check'))}</div>`}</div>`;
 }
 function materials(){return window.DSHeroPrintV44.markup();}
 function factorization(svg){
  const label=svg.querySelector('.ht23-graph-labels text:last-child');label?.remove();
  const glyph={y:['M1 3 6 13 13 2','M11 7 3 24'],x:['M1 4 12 18','M12 4 1 18'],'=':['M0 8h13','M0 14h13'],'−':['M0 11h13'],1:['M2 6 8 2 7 22'],3:['M1 4C7-1 14 1 12 6Q11 10 6 11C16 9 16 23 2 21'],'(':['M8 0Q0 11 7 25'],')':['M1 0Q9 11 2 25']};
  const group=document.createElementNS('http://www.w3.org/2000/svg','g');group.classList.add('hw41-factor');
  let x=54;
  for(const char of 'y=(x−1)(x−3)'){
   for(const d of glyph[char]){const p=document.createElementNS('http://www.w3.org/2000/svg','path');p.setAttribute('d',d);p.setAttribute('pathLength','1');p.setAttribute('transform',`translate(${x} 5) scale(.62)`);p.dataset.ink='';p.dataset.phase='factor';p.dataset.x=String(x);p.dataset.y='5';p.dataset.scale='.62';group.append(p);}
   x+=char==='('?6.5:char===')'?6.5:10.5;
  }
  svg.append(group);
 }
 function options(q){return q.options.map((o,i)=>action('answer','답 '+(i+1),`<small>${i+1}</small>${math(o)}`,`data-answer="${i}"`)).join('');}
 function study(working){return `<section class="hw41-demo hw41-study" data-view="setup" aria-label="타임어택 사용 예시. 실제 학습 기록에 저장되지 않습니다.">
 <header class="hw41-top"><strong>DELTASKILL</strong><span>타임어택</span><div class="hw41-clock"><small>남은 시간</small><time data-hw41-clock>50:00</time></div>${action('replay','타임어택 사용 순서 다시 보기',icon('replay'))}</header>
 <div class="hw41-setup"><span class="hw41-unit-label">미적분Ⅰ · 정적분</span><h2>시험 시간도 연습하자.</h2><div class="hw41-modes">${action('full','50분 25문항 연습','<b>50<span>분</span></b><strong>25문항</strong>','aria-pressed="true"')}${action('half','25분 13문항 연습','<b>25<span>분</span></b><strong>13문항</strong>','aria-pressed="false"')}</div>${action('start','타임어택 연습 시작','연습 시작 '+icon('next'),'class="hw41-primary hw41-start"')}<i class="hw41-tap" aria-hidden="true"></i></div>
 <div class="hw41-exam" hidden><div class="hw41-exam-heading"><span>미적분Ⅰ <b>정적분</b></span><span data-hw41-count>답 입력 0 / 25</span></div><div class="hw41-exam-layout"><div class="hw41-workspace"><div class="hw41-toolbar"><span>필기</span>${action('pen','필기 펜 선택',icon('pen'),'aria-pressed="false"')}<i class="hw41-pen-color"></i><span class="hw41-pen-width">0.5 mm</span><span class="hw41-toolbar-note">문제 위에 바로 쓰기</span></div><article class="hw41-question"><header><b data-hw41-number>01</b><span>정적분과 넓이</span></header><div data-hw41-question>${first.question}</div>${working}<div class="hw41-answers">${options(first)}</div></article><footer class="hw41-nextbar"><span data-hw41-answer-state>답을 선택해 주세요</span>${action('next','다음 문제로','다음 문제 '+icon('next'),'class="hw41-primary" disabled')}</footer></div><aside class="hw41-answer-sheet"><strong>답안</strong><div>${Array.from({length:25},(_,i)=>`<span data-slot="${i}" class="${i===0?'current':''}">${i+1}</span>`).join('')}</div><small>선택한 답은<br>시험이 끝난 뒤 채점</small></aside></div></div></section>`;}
 window.cinemaScreen=function(index){
  const html=priorScreen.apply(this,arguments);if(![1,2].includes(Number(index))||document.documentElement.dataset.design!=='b')return html;
  const t=document.createElement('template');t.innerHTML=html;
  const screen=t.content.querySelector('.hd40-screen');if(!screen)return html;
  const old=screen.querySelector('.hd39-app,.ht23-demo');if(!old)return html;
  let markup;
  if(Number(index)===1)markup=materials();
  else {const working=old.querySelector('.ht23-working');factorization(working.querySelector('svg'));markup=study(working.outerHTML);}
  const block=document.createElement('template');block.innerHTML=markup;old.replaceWith(block.content.firstElementChild);return t.innerHTML;
 };
 function now(){return elapsed+(started===null?0:performance.now()-started);}
 function stop(){if(started!==null){elapsed=now();started=null;}cancelAnimationFrame(raf);raf=0;}
 function canRun(){return root?.isConnected&&(scene!==1||window.DSHeroPrintV44.ready(root))&&!cinemaPaused&&!document.hidden&&!motion.matches&&document.getElementById('intro').hidden;}
 function hidden(el,value){if(el&&el.hidden!==value)el.hidden=value;}
 function text(selector,value){const el=root?.querySelector(selector);if(el&&el.textContent!==value)el.textContent=value;}
 function flash(el,on){el?.classList.toggle('hw41-touched',on);}
 function refreshDocument(){
  const pageEl=root.querySelector('.hw41-page');pageEl.innerHTML=sheet();
  text('[data-hw41-title]',source==='library'?title():'지수와 로그');
  text('[data-hw41-pages]',source==='library'?'4문항 · 1쪽':'4문항 · 2쪽');
  text('[data-hw41-caption]',source==='library'?'내신자료 · 4문항 2단':'수능 기출 · 4문항');
  const questions=root.querySelector('[data-hw41="questions"]'),answers=root.querySelector('[data-hw41="answers"]');
  questions.setAttribute('aria-pressed',String(docPage===0));answers.setAttribute('aria-pressed',String(docPage===1));
  hidden(answers,source==='library');root.querySelector('.hw41-viewport').scrollTop=0;
 }
 function paintMaterials(ms){window.DSHeroPrintV44.paint(root,ms);}
 function collectInk(){
  phaseUnits={factor:0,graph:0,formula:0,circle:0};
  ink=Array.from(root.querySelectorAll('[data-ink]'),path=>{const phase=path.dataset.phase,length=path.getTotalLength(),scale=Number(path.dataset.scale),units=Math.max(7,length*scale),offset=phaseUnits[phase];phaseUnits[phase]+=units+2;return{path,phase,length,scale,x:Number(path.dataset.x),y:Number(path.dataset.y),units,offset};});
 }
 const phases={factor:[-1000,-1],graph:[600,1800],formula:[2000,4400],circle:[4500,4800]};
 function draw(ms){
  const working=root.querySelector('.ht23-working');working.classList.toggle('has-graph',ms>=1800);
  let active=null;
  for(const stroke of ink){const[start,end]=phases[stroke.phase],units=(ms-start)/(end-start)*phaseUnits[stroke.phase];const p=clamp((units-stroke.offset)/stroke.units);stroke.path.style.strokeDashoffset=String(1-p);stroke.path.style.visibility=p?'visible':'hidden';if(p>0&&p<1)active={...stroke,p};}
  const pen=root.querySelector('[data-ht23-pencil]');pen.setAttribute('visibility',active?'visible':'hidden');
  if(active){const p=active.path.getPointAtLength(active.p*active.length);pen.setAttribute('transform',`translate(${active.x+p.x*active.scale} ${active.y+p.y*active.scale})`);}
 }
 function setPaper(index){
  if(paperIndex===index)return;paperIndex=index;const q=index?second:first;
  const question=root.querySelector('.hw41-question');
  question.querySelector('[data-hw41-question]').innerHTML=q.question;
  question.querySelector('.hw41-answers').innerHTML=options(q);text('[data-hw41-number]',index?'02':'01');
  question.querySelector('header>span').textContent=q.title;hidden(question.querySelector('.ht23-working'),!!index);
  window.WebMathRendererV23?.typeset(question);
  root.querySelectorAll('[data-slot]').forEach((el,i)=>{el.classList.toggle('current',i===index);el.classList.toggle('answered',i===0&&index>0);});
 }
 function paintStudy(ms){
  const begun=true,next=ms>=6200,index=next?1:0,automatic=ms>=5100&&!next;
  const answer=manualAnswers[index]??(automatic?first.answer:null),selected=answer!==null,answeredCount=(next?1:0)+Number(selected);
  root.dataset.view='exam';root.dataset.phase=next?'next':ms<600?'reading':ms<4800?'writing':!selected?'checking':'answer';
  hidden(root.querySelector('.hw41-setup'),begun);hidden(root.querySelector('.hw41-exam'),!begun);
  root.querySelector('[data-hw41="full"]').setAttribute('aria-pressed',String(mode===25));root.querySelector('[data-hw41="half"]').setAttribute('aria-pressed',String(mode===13));
  flash(root.querySelector('[data-hw41="start"]'),false);
  const remaining=(mode===25?3000:1500)-18-Math.max(0,Math.floor(ms/1000));text('[data-hw41-clock]',`${String(Math.floor(remaining/60)).padStart(2,'0')}:${String(remaining%60).padStart(2,'0')}`);
  if(!begun)return;setPaper(next?1:0);
  root.querySelectorAll('[data-slot]').forEach((el,i)=>hidden(el,i>=mode));
  text('[data-hw41-count]',`답 입력 ${answeredCount} / ${mode}`);
  const pen=root.querySelector('[data-hw41="pen"]');pen.setAttribute('aria-pressed',String(!next));flash(pen,false);
  if(!next)draw(ms);
  root.querySelectorAll('[data-answer]').forEach(el=>{const on=selected&&Number(el.dataset.answer)===answer;el.setAttribute('aria-pressed',String(on));flash(el,on&&ms>=5100&&ms<5550);});
  text('[data-hw41-answer-state]',selected?`${answer+1}번 선택`:'답을 선택해 주세요');
  const nextButton=root.querySelector('[data-hw41="next"]');nextButton.disabled=!next&&!selected;
  const nextLabel=next?'다시 보기':'다음 문제';nextButton.setAttribute('aria-label',next?'타임어택 시연 다시 보기':'다음 문제로');if(nextButton.firstChild.nodeValue!==nextLabel+' ')nextButton.firstChild.nodeValue=nextLabel+' ';flash(nextButton,ms>=5900&&ms<6200);
  root.querySelector('[data-slot="0"]').classList.toggle('answered',next||selected);
 }
 function paint(){if(!root)return;const ms=now();root.dataset.elapsed=String(Math.floor(ms));if(scene===1)paintMaterials(ms);else paintStudy(ms);}
 function tick(){paint();if(now()>=durations[scene]){stop();window.showCinema((scene+1)%4);window.playCinema();return;}raf=requestAnimationFrame(tick);}
 function sync(){if(canRun()){if(started===null){started=performance.now();raf=requestAnimationFrame(tick);}}else{stop();paint();}}
 function mount(){
  const next=document.querySelector('.home-body .hw41-demo');if(next===root&&root?.isConnected)return;
  stop();root=next;scene=Number(document.querySelector('.cinema')?.dataset.scene)||0;elapsed=0;paperIndex=-1;libraryMode=false;manualAnswers={};
  if(!root)return;
  if(scene===1){source='print';docPage=0;window.DSHeroPrintV44.mount(root,()=>{elapsed=motion.matches?printTiming.review:0;sync();});}else collectInk();
  if(motion.matches)elapsed=scene===1?printTiming.review:5700;paint();sync();
 }
 window.showCinema=function(index){priorShow.apply(this,arguments);mount();};
 window.playCinema=function(){if(!root?.isConnected||document.documentElement.dataset.design!=='b'||Number(document.querySelector('.cinema')?.dataset.scene)===0)return priorPlay.apply(this,arguments);clearTimeout(cinemaTimer);sync();};
 function pause(){if(!cinemaPaused)document.querySelector('[data-cinema-pause]')?.click();stop();}
 function seek(ms){stop();elapsed=ms;paint();}
 function resume(){if(cinemaPaused)document.querySelector('[data-cinema-pause]')?.click();sync();}
 function expand(){
  let modal=document.getElementById('hw41-modal');if(!modal){modal=document.createElement('dialog');modal.id='hw41-modal';modal.className='hd39-dialog hw41-dialog';document.body.append(modal);}
  modal.innerHTML=`<header><div><strong>${title()}</strong><span>${docPage?'정답과 해설':'문제'}</span></div>${action('close','프린트 확대 닫기','×')}</header><div class="hd39-paper-well is-zoomed"><div class="hd39-sheet-surface"><div class="hw41-expanded-paper">${sheet()}</div></div></div>`;
  modal.showModal();window.DSHeroDetailV39.fitAll();
 }
 document.addEventListener('click',event=>{
  const button=event.target.closest('[data-hw41]');if(!button)return;
  const name=button.dataset.hw41;if(name==='close'){document.getElementById('hw41-modal')?.close();return;}
  pause();
  if(name==='replay'){libraryMode=false;manualAnswers={};if(scene===1){source='print';docPage=0;refreshDocument();}seek(motion.matches?(scene===1?printTiming.review:5700):0);resume();}
  else if(name==='library'){libraryMode=true;seek(0);}
  else if(name==='choose-unit'||name==='choose-topic'||name==='choose-count'){libraryMode=true;seek(name==='choose-unit'?printTiming.unitOpen:name==='choose-topic'?printTiming.topicOpen:printTiming.count);}
  else if(name==='select-unit'||name==='select-topic'){libraryMode=true;seek(name==='select-unit'?printTiming.unit:printTiming.topic);root.querySelector('[data-hw41="'+name.replace('select','choose')+'"]').focus();}
  else if(name==='compose'){libraryMode=false;source='print';docPage=0;refreshDocument();seek(motion.matches?printTiming.review:printTiming.compose);resume();}
  else if(name==='open-library'||name==='open-print'){source=name==='open-library'?'library':'print';docPage=0;libraryMode=false;refreshDocument();seek(printTiming.review);}
  else if(name==='zoom'){root.querySelector('.hw41-viewport').scrollTop=0;seek(now()>(printTiming.zoomStart+printTiming.zoomEnd)/2?printTiming.review:printTiming.zoomEnd);}
  else if(name==='questions'||name==='answers'){const page=Number(name==='answers');if(docPage!==page){docPage=page;refreshDocument();paint();}}
  else if(name==='expand')expand();
  else if(name==='full'||name==='half'){mode=name==='full'?25:13;paint();}
  else if(name==='start'){seek(0);resume();}
  else if(name==='pen'){seek(600);resume();}
  else if(name==='answer'){
   manualAnswers[paperIndex]=Number(button.dataset.answer);paint();
  }else if(name==='next'){if(paperIndex===1){manualAnswers={};seek(motion.matches?5700:0);resume();}else seek(6200);}
 });
 for(const type of ['wheel','pointerdown','touchstart','keydown'])document.addEventListener(type,e=>{if(e.target.closest('.hw41-viewport'))pause();},{passive:true});
 document.addEventListener('visibilitychange',sync);motion.addEventListener?.('change',()=>{if(motion.matches&&root)seek(scene===1?printTiming.review:5700);sync();});
 document.addEventListener('click',e=>{if(e.target.closest('[data-cinema-pause]'))queueMicrotask(sync);});
 window.addEventListener('pagehide',stop);
 const content=document.getElementById('content');if(content)new MutationObserver(mount).observe(content,{childList:true});
 new ResizeObserver(()=>{if(root)paint();}).observe(document.documentElement);
 for(const src of ['reference-print-v14/NS-CM2-07-L4.png','assets/hero-v40/tablet-studio-delivery.webp']){const image=new Image();image.src=src;}
 window.DSHeroWorkflowV41=Object.freeze({durations,refresh:mount,reviewAt:ms=>{pause();seek(ms);}});
 const stage=document.querySelector('.home-body .cinema');if(stage)window.showCinema(Number(stage.dataset.scene)||0);
})();
