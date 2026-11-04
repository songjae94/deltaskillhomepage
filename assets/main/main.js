/* 메인 — 낮/밤 단추 · 물음 단계 초점 · 뒤로 · 머리 선 · 나타남 · 영상(보일 때만 재생 · preload none · 동작 줄이기·데이터 절약이면 포스터만).
   물음 상태는 URL 해시뿐 — 서버 저장 없음. 스크립트가 꺼져도 해시 없이 첫 물음이 보이고 단계가 넘어간다(CSS :target). */
(function(){
  var H=document.documentElement, KEY='ds_theme', mq=matchMedia('(prefers-color-scheme: dark)');
  H.classList.add('js');
  function meta(){var m=document.querySelector('meta[name=theme-color]'); if(m) m.content = H.dataset.theme==='dark' ? '#121419' : '#ffffff';}
  function apply(t,save){H.dataset.theme=t; if(save){try{localStorage.setItem(KEY,t)}catch(e){}} meta();
    document.querySelectorAll('[data-theme-toggle]').forEach(function(b){b.setAttribute('aria-pressed',String(t==='dark'));});}
  meta();
  document.querySelectorAll('[data-theme-toggle]').forEach(function(b){
    b.setAttribute('aria-pressed',String(H.dataset.theme==='dark'));
    b.addEventListener('click',function(){apply(H.dataset.theme==='dark'?'light':'dark',true);});
  });
  var saved=null; try{saved=localStorage.getItem(KEY)}catch(e){}
  if(saved!=='light'&&saved!=='dark'){ var f=function(e){apply(e.matches?'dark':'light',false);}; mq.addEventListener?mq.addEventListener('change',f):mq.addListener(f); }

  // 물음 단계 — 해시가 바뀌면 맨 위로 가서 그 단계의 제목에 초점(화면 읽기 · 키보드).
  // 이 페이지에서 밟은 깊이를 기록(history.state)에 적어 두어, 「뒤로」 단추가 사이트 밖으로 나가지 않게 한다. 브라우저 뒤로를 섞어 눌러도 맞는다.
  var nav=0;
  function stamp(next){ var s=history.state; if(s&&typeof s.n==='number'){nav=s.n;} else { nav=next; try{history.replaceState({n:nav},'')}catch(e){} } }
  stamp(0);
  function stepOf(){var id=location.hash.slice(1); var el=id&&document.getElementById(id); return (el&&el.classList.contains('step'))?el:null;}
  function focusStep(){var s=stepOf()||document.querySelector('.step.first'); var h=s.querySelector('h1'); if(h){h.setAttribute('tabindex','-1'); h.focus({preventScroll:true});} }
  addEventListener('hashchange',function(){ stamp(nav+1); if(stepOf()||location.hash===''){ scrollTo(0,0); focusStep(); } });
  document.querySelectorAll('[data-back]').forEach(function(b){b.addEventListener('click',function(e){ if(nav>0){e.preventDefault(); history.back();} });});

  // 머리 선 — 첫 화면을 지나면
  var hdr=document.getElementById('hdr');
  function line(){hdr.classList.toggle('on',scrollY>24);} addEventListener('scroll',line,{passive:true}); line();

  // 나타남
  if('IntersectionObserver' in window){
    var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target);}});},{rootMargin:'0px 0px -8% 0px'});
    document.querySelectorAll('.rv').forEach(function(el){io.observe(el);});
  } else document.querySelectorAll('.rv').forEach(function(el){el.classList.add('in');});

  // 영상 — 포스터 먼저. 동작 줄이기 · 데이터 절약이면 영상을 불러오지 않는다. 보일 때(40%)만 src 를 넣고 재생, 벗어나면 멈춤.
  // 영상 파일을 못 받으면 video 가 투명한 채로 남아 포스터 그림이 그대로 보인다.
  var still=matchMedia('(prefers-reduced-motion: reduce)').matches||(navigator.connection&&navigator.connection.saveData);
  var vids=document.querySelectorAll('video[data-src]');
  if(still){ document.querySelectorAll('.screen .play').forEach(function(b){b.hidden=false;}); }
  function load(v){ if(!v.src){ v.addEventListener('loadeddata',function(){v.classList.add('ready');},{once:true}); v.src=v.dataset.src; } }
  function start(v){ load(v); var p=v.play(); if(p&&p.catch) p.catch(function(){}); }
  if(!still&&'IntersectionObserver' in window){
    var vo=new IntersectionObserver(function(es){es.forEach(function(e){var v=e.target; if(e.isIntersecting) start(v); else v.pause();});},{threshold:.4});
    vids.forEach(function(v){vo.observe(v);});
  }
  // 「재생」 단추(동작 줄이기일 때만 보임) — 사용자가 누르면 그 창만 재생
  document.querySelectorAll('.screen .play').forEach(function(b){b.addEventListener('click',function(){var v=b.parentElement.querySelector('video'); if(v.paused){start(v); b.textContent='멈춤';} else {v.pause(); b.textContent='재생';}});});
})();
