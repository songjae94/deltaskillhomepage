(() => {
  'use strict';
  const mobile = matchMedia('(max-width:600px)');
  const states = new WeakMap(), frameDocuments = new WeakSet(), dismissed = new Set();
  const paperSelector = '.ssp-paper:has(.ssp-prompt),.ds-timed .dst-sheet:has(.dst-prompt)';
  const controlSelector = 'button:not([disabled]),a[href],input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"]),iframe';
  const icon = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14 4h6v6M20 4l-7 7M4 14v6h6M4 20l7-7"/></svg>';
  let session = null, queued = false, suppressMode = null;
  const visible = node => !!node?.isConnected && !node.closest('[hidden]') && !!node.getClientRects().length && getComputedStyle(node).display !== 'none' && getComputedStyle(node).visibility !== 'hidden';
  function mode() {
    if (location.hash !== '#student') return null;
    const selected = document.querySelector('[data-hub-tab][aria-pressed="true"]')?.dataset.hubTab;
    const value = selected || new URLSearchParams(location.search).get('studentMode') || 'study';
    return ['study','timed'].includes(value) ? value : null;
  }
  function fingerprint(text) {
    let value = 2166136261;
    for (let i=0;i<text.length;i++) value = Math.imul(value ^ text.charCodeAt(i),16777619);
    return (value>>>0).toString(36);
  }
  function bindFrame(frame) {
    try {
      const doc = frame.contentDocument;
      if (!doc || frameDocuments.has(doc)) return;
      frameDocuments.add(doc); doc.addEventListener('keydown', keydown);
    } catch { /* A cross-origin source remains under its original sandbox policy. */ }
  }
  function register(root) {
    if (states.has(root)) return states.get(root);
    const prompt = root.querySelector('.ssp-prompt,.dst-prompt');
    if (!prompt || (!prompt.textContent.trim() && !prompt.querySelector('iframe[srcdoc],iframe[src],img,svg,math'))) return null;
    const timed = !!root.closest('.ds-timed');
    if ((timed ? 'timed' : 'study') !== mode()) return null;
    const id = root.closest('[data-exam-paper-id]')?.dataset.examPaperId;
    const key = (timed?'timed:':'study:') + (id || fingerprint(prompt.innerHTML));
    const button = document.createElement('button');
    button.type='button'; button.className='ds-qfs-toggle'; button.title='문제와 보기 전체화면';
    button.setAttribute('aria-label',button.title); button.setAttribute('aria-haspopup','dialog'); button.setAttribute('aria-expanded','false'); button.innerHTML=icon;
    root.prepend(button);
    const state={root,prompt,button,key,timed}; states.set(root,state);
    button.addEventListener('click',()=>open(state,true));
    root.querySelectorAll('iframe').forEach(bindFrame);
    return state;
  }
  function finished(state) {
    return !!state.root.querySelector('.ssp-feedback,.dst-feedback') || !!state.root.closest('.ds-timed')?.querySelector('.dte-summary');
  }
  function override(current,node,properties) {
    for (const [property,value] of Object.entries(properties)) {
      current.styles.push([node,property,node.style.getPropertyValue(property),node.style.getPropertyPriority(property)]);
      node.style.setProperty(property,value,'important');
    }
  }
  function hideExtras(current) {
    const root=current.state.root, keep=[current.state.prompt];
    root.querySelectorAll('.ssp-options,.ssp-integer-answer,.dte-entry input').forEach(node=>keep.push(node));
    const branches=new Set([root]);
    for(const node of keep) for(let ancestor=node;ancestor&&ancestor!==root;ancestor=ancestor.parentElement) branches.add(ancestor);
    for(const branch of branches) {
      if(keep.includes(branch)) continue;
      for(const child of branch.children) {
        if(branches.has(child)||child===current.closeButton||child===current.state.button)continue;
        if(!child.classList.contains('ds-qfs-hidden')){
          child.classList.add('ds-qfs-hidden');current.hidden.push(child);
          // Existing screen rules also use !important; preserve and restore the
          // original inline declaration while guaranteeing that actions stay out.
          override(current,child,{'display':'none'});
        }
      }
    }
  }
  function open(state,gesture) {
    if(session||!mode()||!visible(state.root))return;
    const root=state.root,backdrop=document.createElement('div'),closeButton=document.createElement('button');
    backdrop.className='ds-qfs-backdrop'; backdrop.setAttribute('aria-hidden','true');
    closeButton.type='button';closeButton.className='ds-qfs-close';closeButton.title='전체화면 닫기';closeButton.setAttribute('aria-label',closeButton.title);
    closeButton.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 4v5H4m5 0L3 3m12 17v-5h5m-5 0 6 6"/></svg>';
    const current={state,closeButton,backdrop,styles:[],hidden:[],inert:[],attrs:[],scrollX,scrollY,focus:document.activeElement,mode:mode(),nativeRequested:false};
    session=current;
    for(const name of ['role','aria-modal','aria-label','tabindex']) current.attrs.push([name,root.getAttribute(name)]);
    root.setAttribute('role','dialog');root.setAttribute('aria-modal','true');root.setAttribute('aria-label','문제와 보기 전체화면');root.tabIndex=-1;
    state.button.setAttribute('aria-expanded','true');root.classList.add('ds-qfs-active');root.append(closeButton);document.body.append(backdrop);
    for(let branch=root;branch&&branch!==document.documentElement;branch=branch.parentElement){
      if(branch!==root) override(current,branch,{'transform':'none','filter':'none','perspective':'none','contain':'none','isolation':'auto','z-index':'auto','overflow':'visible','clip-path':'none'});
      if(branch.parentElement)for(const sibling of branch.parentElement.children){
        if(sibling===branch||sibling===backdrop)continue;
        current.inert.push([sibling,sibling.inert]);sibling.inert=true;
      }
    }
    override(current,document.body,{'overflow':'hidden'});
    override(current,root,{'position':'fixed','inset':'0','width':'100%','max-width':'none','height':'100dvh','min-height':'0','max-height':'none','margin':'0','padding':'var(--ds-qfs-padding)','box-sizing':'border-box','background':'#fff','border':'0','border-radius':'0','box-shadow':'none','transform':'none','overflow':'auto','overscroll-behavior':'contain','z-index':'2147483200','isolation':'isolate','transition':'none'});
    hideExtras(current); closeButton.addEventListener('click',()=>close());
    root.scrollTop=0;closeButton.focus({preventScroll:true});
    root.querySelectorAll('iframe').forEach(bindFrame);
    if(gesture&&!mobile.matches&&document.fullscreenEnabled&&root.requestFullscreen){
      current.nativeRequested=true;
      root.requestFullscreen().then(()=>{if(session!==current&&document.fullscreenElement===root)document.exitFullscreen?.().catch(()=>{});}).catch(()=>{});
    }
    window.dispatchEvent(new Event('resize'));
  }
  function close({restoreFocus=true,remember=true}={}) {
    if(remember)suppressMode=mode();
    if(!session)return;
    const current=session;session=null;const root=current.state.root;
    if(remember){dismissed.add(current.state.key);if(dismissed.size>100)dismissed.delete(dismissed.values().next().value);}
    current.closeButton.remove();current.backdrop.remove();root.classList.remove('ds-qfs-active');current.state.button.setAttribute('aria-expanded','false');
    current.hidden.forEach(node=>node.classList.remove('ds-qfs-hidden'));
    for(const [node,name,value,priority] of current.styles.reverse()){if(value)node.style.setProperty(name,value,priority);else node.style.removeProperty(name);}
    for(const [node,value] of current.inert)if(node.isConnected)node.inert=value;
    for(const [name,value] of current.attrs){if(value===null)root.removeAttribute(name);else root.setAttribute(name,value);}
    if(document.fullscreenElement===root)document.exitFullscreen?.().catch(()=>{});
    window.scrollTo(current.scrollX,current.scrollY);
    if(restoreFocus){const focus=visible(current.focus)?current.focus:current.state.button;if(visible(focus))focus.focus({preventScroll:true});}
    window.dispatchEvent(new Event('resize'));
  }
  function allControls() {
    const result=[];
    for(const node of session.state.root.querySelectorAll(controlSelector)){
      if(!visible(node))continue;
      if(node.tagName==='IFRAME'){
        try{const controls=Array.from(node.contentDocument.querySelectorAll(controlSelector)).filter(visible);result.push(...(controls.length?controls:[node]));}catch{result.push(node);}
      }else result.push(node);
    }
    return result;
  }
  function keydown(event) {
    if(!session)return;
    if(event.key==='Escape'){event.preventDefault();event.stopPropagation();close();return;}
    if(event.key!=='Tab')return;
    const controls=allControls(),first=controls[0],last=controls[controls.length-1];
    let active=document.activeElement;
    try{while(active?.tagName==='IFRAME'&&active.contentDocument)active=active.contentDocument.activeElement;}catch{}
    if(event.shiftKey&&(active===first||!controls.includes(active))){event.preventDefault();last?.focus();}
    else if(!event.shiftKey&&(active===last||!controls.includes(active))){event.preventDefault();first?.focus();}
  }
  function refresh() {
    queued=false;
    if(session&&(!session.state.root.isConnected||!mode()||session.mode!==mode()||session.state.root.closest('[hidden]')||finished(session.state)))close({restoreFocus:false,remember:finished(session.state)});
    if(!mode())return;
    for(const root of document.querySelectorAll(paperSelector)){
      const state=register(root);if(!state)continue;
      root.querySelectorAll('iframe').forEach(bindFrame);
      if(mobile.matches&&!session&&!finished(state)&&!dismissed.has(state.key)&&suppressMode!==mode()&&visible(root))open(state,false);
    }
  }
  function schedule(){if(!queued){queued=true;requestAnimationFrame(refresh);}}
  document.addEventListener('keydown',keydown,true);
  document.addEventListener('load',event=>{if(event.target?.matches?.('.ssp-prompt iframe,.dst-prompt iframe')){bindFrame(event.target);schedule();}},true);
  document.addEventListener('fullscreenchange',()=>{if(session&&document.fullscreenElement!==session.state.root&&session.nativeRequested)close();});
  document.addEventListener('click',event=>{
    if(event.target.closest('[data-hub-tab],[data-sample-action="next"],[data-ssp-next],[data-exam-forward],[data-time-index],[data-time-action],[data-ssp-start],[data-ssp-type],[data-ssp-retry],[data-ssp-remote-retry]')){suppressMode=null;schedule();}
  },true);
  for(const event of ['hashchange','popstate','ds-session-change'])window.addEventListener(event,()=>{suppressMode=null;schedule();});
  mobile.addEventListener('change',()=>{if(mobile.matches)suppressMode=null;schedule();});
  new MutationObserver(records=>{
    if(records.some(record=>record.type==='childList'||record.type==='characterData'||record.attributeName==='hidden'||record.attributeName==='aria-pressed'))schedule();
  }).observe(document.body,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:['hidden','aria-pressed']});
  window.DSQuestionFullscreen=Object.freeze({close:()=>close(),refresh:schedule});
  schedule();
})();
