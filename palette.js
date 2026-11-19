(() => {
  const key='deltaskill-color';
  const url=new URL(location.href);
  const known=value=>value==='ink'||value==='green';
  const preferred=url.searchParams.get('palette');
  let saved='';
  try {saved=localStorage.getItem(key)} catch {}
  function apply(value) {
    value='ink';
    document.documentElement.dataset.palette=value;
    const selector=document.querySelector('#paletteChoice');
    if(selector)selector.value=value;
    const meta=document.querySelector('meta[name="theme-color"]');
    if(meta)meta.content='#fff';
  }
  const initial='ink';
  apply(initial);
  if(window===window.parent&&known(preferred)){try{localStorage.setItem(key,preferred)}catch{}}
  function address(value){
    const next=new URL(location.href);
    next.searchParams.set('palette',value);
    try{history.replaceState(null,'',next)}catch{}
  }
  function signal(){
    const el=document.getElementById('screen');
    if(el?.contentWindow)el.contentWindow.postMessage({type:'delta-palette',value:document.documentElement.dataset.palette},location.protocol==='file:'?'*':location.origin);
  }
  function choose(value){
    if(!known(value))return;
    apply(value);address(value);
    try{localStorage.setItem(key,value)}catch{}
    signal();
  }
  window.addEventListener('message',event=>{
    if(window===window.parent||event.source!==window.parent||(location.protocol!=='file:'&&event.origin!==location.origin)||event.data?.type!=='delta-palette'||!known(event.data.value))return;
    apply(event.data.value);
  });
  function wire(){
    apply(initial);
    const el=document.querySelector('#paletteChoice');
    if(el)el.onchange=()=>choose(el.value);
    document.querySelector('#screen')?.addEventListener('load',signal);
    // Preserve the version across local HTML pages, including pages opened in a new tab.
    const keep=event=>{
      const a=event.target.closest?.('a[href]');
      if(!a||a.hasAttribute('download'))return;
      const raw=a.getAttribute('href');
      if(raw.startsWith('#')||!raw)return;
      const next=new URL(a.href);
      if(next.protocol!==location.protocol||next.origin!==location.origin||!next.pathname.endsWith('.html'))return;
      next.searchParams.set('palette',document.documentElement.dataset.palette);
      a.href=next.href;
    };
    document.addEventListener('click',keep,true);
    document.addEventListener('auxclick',keep,true);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',wire,{once:true});else wire();
})();
