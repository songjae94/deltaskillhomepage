/* Only print-released question PDFs enter this catalog. Screen-study and exam permissions are separate. */
window.DSCSATPrint = (() => {
  'use strict';
  const base='/app/public-data/csat-print/';
  const levels={'2':'2점','3':'3점','4-standard':'4점 보통','4-advanced':'4점 고난도'};
  const escape=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const nonempty=s=>typeof s==='string'&&s.trim().length>0;
  let pdfLibRequest;
  function level(q){
    if(q.points===2||q.points===3)return String(q.points);
    const d=q.difficulty;
    if(q.points===4&&d?.reviewedVersion===q.version&&['standard','advanced'].includes(d.tag))return '4-'+d.tag;
    return '';
  }
  function approved(q){
    if(!q||!['csat','mock_assessment'].includes(q.examKind)||![q.id,q.version,q.unit,q.examTitle].every(nonempty)||
      !Number.isInteger(q.questionNumber)||q.questionNumber<1||!level(q))return false;
    const r=q.release,f=q.pdf;
    return r?.status==='approved'&&r.scope==='public-print'&&r.reviewedVersion===q.version&&nonempty(r.evidenceId)&&
      f&&/^\/app\/public-data\/csat-print\/files\/[a-zA-Z0-9_-]+\.pdf$/.test(f.path)&&/^[a-f0-9]{64}$/.test(f.sha256)&&Number.isInteger(f.pages)&&f.pages>0;
  }
  async function catalog(){
    const r=await fetch(base+'catalog.json',{cache:'no-store',credentials:'same-origin'});
    if(!r.ok)throw Error('catalog');
    const data=await r.json();
    if(data.version!==1||!Array.isArray(data.questions))throw Error('catalog');
    const rows=data.questions.filter(approved),ids=new Map();
    for(const q of rows)ids.set(q.id,(ids.get(q.id)||0)+1);
    return rows.filter(q=>ids.get(q.id)===1);
  }
  async function pdfLib(){
    if(window.PDFLib?.PDFDocument)return window.PDFLib;
    if(!pdfLibRequest)pdfLibRequest=new Promise((resolve,reject)=>{
      const script=document.createElement('script');script.src='/materials/vendor/pdf-lib.min.js';
      script.onload=()=>{if(window.PDFLib?.PDFDocument)resolve(window.PDFLib);else{pdfLibRequest=null;reject(Error('pdf'));}};
      script.onerror=()=>{pdfLibRequest=null;script.remove();reject(Error('pdf'));};
      document.head.append(script);
    });
    return pdfLibRequest;
  }
  async function verifiedBytes(q){
    const r=await fetch(q.pdf.path,{cache:'no-store',credentials:'same-origin',redirect:'error'});
    if(!r.ok)throw Error('source');
    const bytes=new Uint8Array(await r.arrayBuffer());
    const digest=await crypto.subtle.digest('SHA-256',bytes);
    const hex=Array.from(new Uint8Array(digest),x=>x.toString(16).padStart(2,'0')).join('');
    if(hex!==q.pdf.sha256)throw Error('hash');return bytes;
  }
  function pin(q){return JSON.stringify([q.id,q.version,q.unit,level(q),q.release.evidenceId,q.pdf.path,q.pdf.sha256,q.pdf.pages]);}
  async function output(selected){
    const latest=new Map((await catalog()).map(q=>[q.id,pin(q)]));
    if(!selected.length||!selected.every(q=>latest.get(q.id)===pin(q)))throw Error('release');
    const {PDFDocument,degrees}=await pdfLib(),out=await PDFDocument.create();
    out.setTitle('델타스킬 수능 기출 문제지');
    for(const q of selected){
      const src=await PDFDocument.load(await verifiedBytes(q));
      if(src.getPageCount()!==q.pdf.pages)throw Error('pages');
      // Keep A4 pages unchanged. Fit other original page sizes within A4 at the same aspect ratio.
      for(const [index,page] of src.getPages().entries()){
        const box=page.getCropBox(),rot=page.getRotation().angle;
        const w=595.276,h=841.89;
        if(Math.abs(box.width-w)<1&&Math.abs(box.height-h)<1&&rot===0){
          const [copy]=await out.copyPages(src,[index]);out.addPage(copy);
        }else{
          const angle=((rot%360)+360)%360;
          const swaps=angle===90||angle===270,visualW=swaps?box.height:box.width,visualH=swaps?box.width:box.height;
          const scale=Math.min(w/visualW,h/visualH);
          const ww=box.width*scale,hh=box.height*scale,x=(w-visualW*scale)/2,y=(h-visualH*scale)/2;
          const embedded=await out.embedPage(page,{left:box.x,bottom:box.y,right:box.x+box.width,top:box.y+box.height});
          const sheet=out.addPage([w,h]);
          const anchor={0:[x,y],90:[x,y+ww],180:[x+ww,y+hh],270:[x+hh,y]}[angle];
          sheet.drawPage(embedded,{x:anchor[0],y:anchor[1],width:ww,height:hh,rotate:degrees(-angle)});
        }
      }
    }
    return new Blob([await out.save()],{type:'application/pdf'});
  }
  function render(){
    return '<section class="ssp ssp-desk sl54-shell student-signed-in csat-print" data-csat-print><header class="ssil-heading"><h1>수능 자료만들기</h1></header><div class="ssil-main"><div class="ssil-today ssil-live-paper ssp-body"><article class="ssp-paper"><h2 class="ssp-problem-heading">기출 문제지</h2><div data-print-list aria-live="polite">문항을 확인하고 있어요.</div></article></div><aside class="ssil-review ssp-desk-controls"><label>단원<select data-print-unit><option value="">전체 단원</option></select></label><label>배점·난도<select data-print-level><option value="">전체 배점</option>'+Object.entries(levels).map(([v,label])=>'<option value="'+v+'">'+label+'</option>').join('')+'</select></label><button class="ssp-primary" data-print-build disabled>시험지 PDF 만들기</button><div data-print-result aria-live="polite"></div></aside></div></section>';
  }
  let cleanup;
  function mount(wrapper){
    const root=wrapper?.matches?.('[data-csat-print]')?wrapper:wrapper?.querySelector('[data-csat-print]');
    if(!root||root.dataset.bound)return;
    cleanup?.();root.dataset.bound='1';
    const units=root.querySelector('[data-print-unit]'),tiers=root.querySelector('[data-print-level]'),list=root.querySelector('[data-print-list]'),
      generate=root.querySelector('[data-print-build]'),result=root.querySelector('[data-print-result]');
    let rows=[],filtered=[],selection=new Set(),ready=false,pending=false,token=0,url=null;
    function clearOutput(){token++;if(url)URL.revokeObjectURL(url);url=null;result.replaceChildren();}
    function dispose(){clearOutput();window.removeEventListener('hashchange',leave);window.removeEventListener('pagehide',dispose);observer.disconnect();}
    function leave(){if(location.hash!=='#csat')dispose();}
    const observer=new MutationObserver(()=>{if(!root.isConnected)dispose();});
    observer.observe(document.getElementById('content'),{childList:true,subtree:true});
    window.addEventListener('hashchange',leave);window.addEventListener('pagehide',dispose,{once:true});cleanup=dispose;
    function button(){generate.disabled=pending||!selection.size;generate.textContent=pending?'PDF 만드는 중…':'시험지 PDF 만들기';}
    function update(){
      clearOutput();pending=false;
      filtered=rows.filter(q=>(!units.value||q.unit===units.value)&&(!tiers.value||level(q)===tiers.value));selection=new Set(filtered.map(q=>q.id));button();
      if(!rows.length){list.textContent=ready?'인쇄용 기출을 준비하고 있어요. 등록되면 이곳에서 단원과 배점을 골라 문제지를 만들 수 있어요.':'문항을 확인하고 있어요.';return;}
      if(!filtered.length){list.textContent='이 조건에 등록된 기출이 아직 없어요. 다른 단원이나 배점을 골라 보세요.';return;}
      list.innerHTML='<p>'+filtered.length+'문항</p>'+filtered.map((q,i)=>'<label><input type="checkbox" data-print-row="'+i+'" checked><span>'+escape(q.examTitle)+' · '+q.questionNumber+'번<small>'+escape(q.unit)+' · '+levels[level(q)]+'</small></span></label>').join('');
    }
    async function load(){
      clearOutput();generate.disabled=true;
      try{const next=await catalog();if(!root.isConnected)return;rows=next;ready=true;
        const old=units.value;
        // Only unit names (never question bodies) from the public study bank supply the initial navigation.
        const names=new Set(rows.map(q=>q.unit));for(const q of window.DSBasicExamV34?.questions||[])if(q.unit)names.add(q.unit);
        units.innerHTML='<option value="">전체 단원</option>'+Array.from(names,u=>'<option>'+escape(u)+'</option>').join('');
        if(names.has(old))units.value=old;update();
      }catch{if(root.isConnected){rows=[];selection.clear();ready=false;button();list.innerHTML='인쇄용 문항을 불러오지 못했어요. <button data-print-reload>다시 확인</button>';}}
    }
    root.addEventListener('change',e=>{
      if(e.target===units||e.target===tiers){update();return;}
      if(e.target.hasAttribute('data-print-row')){clearOutput();pending=false;const q=filtered[Number(e.target.dataset.printRow)];if(!q)return;if(e.target.checked)selection.add(q.id);else selection.delete(q.id);button();}
    });
    root.addEventListener('click',async e=>{
      if(e.target.closest('[data-print-reload]')){void load();return;}
      if(!e.target.closest('[data-print-build]')||pending||!selection.size)return;
      clearOutput();const turn=token;pending=true;button();
      try{
        const file=await output(filtered.filter(q=>selection.has(q.id)));if(!root.isConnected||turn!==token)return;
        url=URL.createObjectURL(file);
        result.innerHTML='<a target="_blank" rel="noopener" href="'+url+'">PDF 열기 · 인쇄 ↗</a><a download="델타스킬_수능_기출문제지.pdf" href="'+url+'">PDF 저장</a>';
      }catch{if(root.isConnected&&turn===token)result.innerHTML='원본 파일과 인쇄 승인을 다시 확인해야 해요. <button data-print-reload>자료 다시 확인</button>';}
      finally{if(turn===token){pending=false;button();}}
    });
    void load();
  }
  return {render,mount};
})();
