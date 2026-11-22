/* 지침 확인: 렌더규격-0903@r1.11 · 카드@r1 (스킬: 렌더생산|렌더전수조사)
   One web MathML -> TeX -> pinned KaTeX path. Mathematical source is preserved.
   Requires the verified ops KaTeX 0.18.4 bundle and its embedded-font CSS.
   Missing/wrong engine or unsupported syntax keeps native MathML and reports it.
   No CDN, font override, script-position CSS, question creation or persistence. */
((global) => {
  'use strict';
  if (global.WebMathRendererV23) return;
  const expectedVersion='0.18.4';
  const namespace='http://www.w3.org/1998/Math/MathML';
  const failures=[],failureKeys=new Set(),originals=new WeakMap(),failedNodes=new WeakMap();
  const stats={normalizedSum:0,normalizedIntegral:0,rendered:0,unsupported:0};
  const tag=node=>(node.localName||node.tagName||'').toLowerCase();
  const children=node=>Array.from(node.children||[]);
  const text=node=>String(node.textContent||'').trim();
  const attr=(node,name)=>node.getAttribute?.(name);
  const escape=value=>String(value).replace(/[\\{}#$%&_~^]/g,c=>({'\\':'\\textbackslash{}','{':'\\{','}':'\\}','#':'\\#','$':'\\$','%':'\\%','&':'\\&','_':'\\_','~':'\\textasciitilde{}','^':'\\textasciicircum{}'}[c]));
  const symbols={
    '−':'-','–':'-','×':'\\times ','·':'\\cdot ','⋅':'\\cdot ','÷':'\\div ',
    '≤':'\\le ','≥':'\\ge ','≠':'\\ne ','≈':'\\approx ','≡':'\\equiv ',
    '∞':'\\infty ','∈':'\\in ','∉':'\\notin ','∩':'\\cap ','∪':'\\cup ',
    '∑':'\\sum ','Σ':'\\sum ','∏':'\\prod ','∫':'\\int ','∬':'\\iint ','∭':'\\iiint ',
    '→':'\\to ','⇒':'\\Rightarrow ','↔':'\\leftrightarrow ','±':'\\pm ','∓':'\\mp ',
    '∂':'\\partial ','∇':'\\nabla ','∴':'\\therefore ','∵':'\\because ',
    '…':'\\ldots ','⋯':'\\cdots ','⋮':'\\vdots ','∣':'\\mid ','∥':'\\parallel ','′':"'",'″':"''",
    '⊂':'\\subset ','⊃':'\\supset ','⊆':'\\subseteq ','⊇':'\\supseteq ','⊄':'\\not\\subset ','∅':'\\varnothing ','⊥':'\\perp ','∠':'\\angle ','△':'\\triangle ','∘':'\\circ ',
    '\u2282\u0338':'\\not\\subset ','⟶':'\\longrightarrow ','ℓ':'\\ell ','⋄':'\\diamond ','▹':'\\triangleright ','∗':'\\ast ','≪':'\\ll ','≫':'\\gg ','°':'{}^{\\circ}','/':'/',
    '{':'\\{','}':'\\}','⌊':'\\lfloor ','⌋':'\\rfloor ','⌈':'\\lceil ','⌉':'\\rceil ',
    'α':'\\alpha ','β':'\\beta ','γ':'\\gamma ','δ':'\\delta ','ε':'\\epsilon ',
    'θ':'\\theta ','λ':'\\lambda ','μ':'\\mu ','π':'\\pi ','ρ':'\\rho ',
    'σ':'\\sigma ','τ':'\\tau ','φ':'\\phi ','ω':'\\omega ',
    'Γ':'\\Gamma ','Δ':'\\Delta ','Θ':'\\Theta ','Λ':'\\Lambda ','Ω':'\\Omega '
  };
  const functions=new Set(['sin','cos','tan','cot','sec','csc','ln','log','lim','max','min']);
  class UnsupportedMathML extends Error {
    constructor(message,node){super(message);this.name='UnsupportedMathML';this.tag=tag(node);}
  }
  function operatorBase(node) {
    let n=node;
    while(['mrow','mstyle'].includes(tag(n))&&children(n).length===1)n=children(n)[0];
    return tag(n)==='mo'?text(n):'';
  }
  function toTeX(node) {
    const name=tag(node),parts=children(node);
    const join=()=>parts.map(toTeX).join('');
    const arity=count=>{if(parts.length!==count)throw new UnsupportedMathML(`${name}: expected ${count} children`,node);};
    const script=(base,lower,upper)=>{
      const op=operatorBase(base),body=toTeX(base);
      if(['∑','Σ','∏'].includes(op))return `${body}\\limits_{${toTeX(lower)}}^{${toTeX(upper)}}`;
      if(['∫','∬','∭'].includes(op))return `${body}\\nolimits_{${toTeX(lower)}}^{${toTeX(upper)}}`;
      return `{${body}}_{${toTeX(lower)}}^{${toTeX(upper)}}`;
    };
    // Piecewise definitions: a table of rows, with or without the opening brace in front.
    const rows=table=>children(table).map(row=>{if(tag(row)!=='mtr'||children(row).some(cell=>tag(cell)!=='mtd'))throw new UnsupportedMathML('Unsupported table shape',table);return children(row).map(cell=>children(cell).map(toTeX).join('')).join('&');});
    const width=table=>Math.max(1,...children(table).map(row=>children(row).length));
    if(name==='mrow'&&parts.length===2&&tag(parts[0])==='mo'&&text(parts[0])==='{'&&tag(parts[1])==='mtable'){
      const lines=rows(parts[1]),cols=width(parts[1]);
      return cols<=2?`\\begin{cases}${lines.join('\\\\')}\\end{cases}`:`\\left\\{\\begin{array}{${'l'.repeat(cols)}}${lines.join('\\\\')}\\end{array}\\right.`;
    }
    if(name==='mtable')return `\\begin{array}{${'l'.repeat(width(node))}}${rows(node).join('\\\\')}\\end{array}`;
    if(['math','mrow'].includes(name))return join();
    if(name==='semantics')return parts.length?toTeX(parts[0]):'';
    if(name==='mstyle'){
      if(attr(node,'mathsize')||attr(node,'scriptlevel'))throw new UnsupportedMathML('Explicit MathML sizing requires source review',node);
      const style=attr(node,'displaystyle');
      return style==='true'?`{\\displaystyle ${join()}}`:style==='false'?`{\\textstyle ${join()}}`:join();
    }
    if(name==='mi'){
      const value=text(node);
      if(functions.has(value))return `\\${value} `;
      let result=Array.from(value).map(c=>c==='Σ'?'\\Sigma ':c==='Π'?'\\Pi ':symbols[c]||(/^[a-zA-Z0-9]$/.test(c)?c:null));
      if(result.some(c=>c===null))throw new UnsupportedMathML(`Unsupported identifier: ${value}`,node);
      result=result.join('');
      const variant=attr(node,'mathvariant');
      if(variant==='normal')return `\\mathrm{${result}}`;
      if(variant==='bold')return `\\mathbf{${result}}`;
      if(variant&&variant!=='italic')throw new UnsupportedMathML(`Unsupported mathvariant: ${variant}`,node);
      return result;
    }
    if(name==='mn'){
      const value=text(node).replace(/−/g,'-');
      if(!/^[0-9.,+\-]+$/.test(value))throw new UnsupportedMathML('Unsupported number token',node);
      return value;
    }
    if(name==='mo'){
      const value=text(node);
      if(symbols[value])return symbols[value];
      if(functions.has(value))return `\\${value} `;
      if(/^[+\-=<>()[\]|,:;.\/!]$/.test(value))return value;
      if(value==='')return '';
      throw new UnsupportedMathML(`Unsupported operator: ${value}`,node);
    }
    if(name==='mtext'){
      const gaps={'\u00a0':'~','\u2009':'\\,','\u200a':'\\,','\u2005':'\\:','\u205f':'\\:','\u2004':'\\;','\u2002':'\\enspace ','\u2003':'\\quad ','\u2000':'\\enspace ','\u2001':'\\quad ','\u2006':'\\,','\u2008':'\\,','\u202f':'\\,','\u2007':'~'};
      return (node.textContent||'').split(/([\u00a0\u2000-\u200a\u202f\u205f])/).map(piece=>Object.hasOwn(gaps,piece)?gaps[piece]:(piece?`\\text{${escape(piece)}}`:'')).join('');
    }
    if(name==='mfrac'){arity(2);if(attr(node,'linethickness')||attr(node,'bevelled')==='true')throw new UnsupportedMathML('Nonstandard fraction needs source review',node);return `\\frac{${toTeX(parts[0])}}{${toTeX(parts[1])}}`;}
    if(name==='menclose'&&attr(node,'notation')==='box')return `\\boxed{${join()}}`;
    if(name==='msqrt')return `\\sqrt{${join()}}`;
    if(name==='mroot'){arity(2);return `\\sqrt[${toTeX(parts[1])}]{${toTeX(parts[0])}}`;}
    if(name==='msup'){arity(2);return `{${toTeX(parts[0])}}^{${toTeX(parts[1])}}`;}
    if(name==='msub'){arity(2);return `{${toTeX(parts[0])}}_{${toTeX(parts[1])}}`;}
    if(name==='msubsup'||name==='munderover'){
      arity(3);
      if(name==='munderover'&&!['∑','Σ','∏','∫','∬','∭'].includes(operatorBase(parts[0])))return `\\mathop{${toTeX(parts[0])}}\\limits_{${toTeX(parts[1])}}^{${toTeX(parts[2])}}`;
      return script(parts[0],parts[1],parts[2]);
    }
    if(name==='mover'||name==='munder'){
      arity(2);const mark=text(parts[1]);
      if(name==='mover'&&['¯','‾','―'].includes(mark))return `\\overline{${toTeX(parts[0])}}`;
      if(name==='mover'&&['→','⃗'].includes(mark))return `\\vec{${toTeX(parts[0])}}`;
      return `\\${name==='mover'?'overset':'underset'}{${toTeX(parts[1])}}{${toTeX(parts[0])}}`;
    }
    if(name==='mspace'){
      const width=attr(node,'width')||'0em';
      if(!/^-?(?:\d+(?:\.\d*)?|\.\d+)(em|ex|pt|px|mu)$/.test(width)||attr(node,'height')||attr(node,'depth'))throw new UnsupportedMathML('Unsupported explicit spacing',node);
      return `\\hspace{${width}}`;
    }
    throw new UnsupportedMathML(`Unsupported MathML element: ${name}`,node);
  }
  function record(error,math) {
    const key=`${error.message}|${math?.outerHTML||''}`;
    if(failureKeys.has(key))return;
    failureKeys.add(key);failures.push({reason:error.message,tag:error.tag||'',sample:math?text(math).slice(0,90):''});
    if(error.name==='UnsupportedMathML')stats.unsupported++;
  }
  function normalizeOperators(math) {
    for(const script of Array.from(math.querySelectorAll('msubsup,munderover'))){
      const parts=children(script);if(parts.length!==3)continue;
      const op=operatorBase(parts[0]);
      const sum=['∑','Σ','∏'].includes(op),integral=['∫','∬','∭'].includes(op);
      if(!sum&&!integral)continue;
      const wanted=sum?'munderover':'msubsup';
      let changed=false;
      if(tag(script)!==wanted){
        const replacement=document.createElementNS(namespace,wanted);
        for(const a of Array.from(script.attributes||[]))replacement.setAttribute(a.name,a.value);
        while(script.firstChild)replacement.append(script.firstChild);
        script.replaceWith(replacement);
        changed=true;
      }
      let base=parts[0];while(['mrow','mstyle'].includes(tag(base))&&children(base).length===1)base=children(base)[0];
      if(attr(base,'movablelimits')!=='false'){base.setAttribute('movablelimits','false');changed=true;}
      if(changed){if(sum)stats.normalizedSum++;else stats.normalizedIntegral++;}
    }
  }
  function engineStatus() {
    if(!global.katex)return 'missing-engine';
    if(global.katex.version!==expectedVersion)return `version-mismatch:${global.katex.version||'unknown'}`;
    if(typeof document!=='undefined'&&document.fonts){
      const faces=Array.from(document.fonts).map(f=>f.family.replace(/["']/g,'').trim());
      if(!faces.includes('KaTeX_Main')||!faces.includes('KaTeX_Math'))return 'missing-font-css';
    }
    return 'ready';
  }
  function renderMath(math) {
    if(math.isConnected===false)return;
    if(math.closest('.katex,.wm23-equation'))return;
    const original=math.cloneNode(true);
    normalizeOperators(math);
    if(engineStatus()!=='ready')return;
    if(failedNodes.get(math)===math.outerHTML)return;
    try{
      const tex=toTeX(math),display=attr(math,'display')==='block';
      const html=global.katex.renderToString(tex,{displayMode:display,throwOnError:true,trust:false,strict:'error',output:'htmlAndMathml'});
      const wrapper=document.createElement('span');wrapper.className='wm23-equation';
      wrapper.dataset.display=display?'block':'inline';
      if(math.querySelector('mfrac,msubsup,munderover,mroot'))wrapper.classList.add('wm23-tall');
      wrapper.innerHTML=html;originals.set(wrapper,original);math.replaceWith(wrapper);stats.rendered++;
    }catch(error){failedNodes.set(math,math.outerHTML);record(error,math);}
  }
  // Short, reviewed concept formulas use the same pinned engine, fonts and strict options.
  // Existing problem/solution documents are not passed through this entry point.
  function renderTeX(tex){
    if(engineStatus()!=='ready')return '<span class="rv56-inline-math math-unavailable">수식 준비 중</span>';
    try{const source=String(tex).replace(/\\sum(?!\\limits)/g,'\\sum\\limits');return '<span class="wm23-equation rv56-inline-math">'+global.katex.renderToString(source,{displayMode:false,throwOnError:true,trust:false,strict:'error',output:'htmlAndMathml'})+'</span>';}
    catch(error){record(error);return '<span class="rv56-inline-math math-unavailable">수식 확인 필요</span>';}
  }
  const api={expectedVersion,toTeX,engineStatus,renderTeX,failures:()=>failures.slice(),stats:()=>({...stats}),originalMathML:wrapper=>originals.get(wrapper)?.outerHTML||null};
  global.WebMathRendererV23=api;
  if(typeof document==='undefined')return;
  function scan(root){
    if(!root)return;
    if(tag(root)==='math')renderMath(root);
    else root.querySelectorAll?.('math').forEach(renderMath);
  }
  const roots=['content','paper-expanded','print-area'];
  const observed=new WeakSet();
  function diagnostics(){
    const html=document.documentElement;if(!html)return;
    const fonts=Array.from(document.fonts||[]).map(face=>face.family.replace(/["']/g,'').trim()).filter(name=>/^KaTeX_[A-Za-z0-9_-]+$/.test(name));
    const families=Array.from(new Set(fonts)).sort();
    const last=failures.at(-1);
    html.dataset.mathModule='v23.2-diagnostics';
    html.dataset.mathEngine=engineStatus();
    html.dataset.mathExpected=expectedVersion;
    html.dataset.mathActual=String(global.katex?.version||'none').slice(0,30);
    html.dataset.mathRendered=String(stats.rendered);
    html.dataset.mathErrors=String(failures.length);
    html.dataset.mathFontFaces=String(fonts.length);
    html.dataset.mathFontFamilies=families.join(',');
    html.dataset.mathNormalizedSum=String(stats.normalizedSum);
    html.dataset.mathNormalizedIntegral=String(stats.normalizedIntegral);
    // Category/tag only: no formula, question, account or other user text.
    html.dataset.mathLastError=last?(last.tag?`unsupported:${last.tag}`:'render-or-font-error'):'';
    return {status:html.dataset.mathEngine,actual:html.dataset.mathActual,rendered:stats.rendered,errors:failures.length,fontFaces:fonts.length};
  }
  function refresh(){
    for(const id of roots){
      const root=document.getElementById(id);if(!root)continue;
      scan(root);if(observed.has(root))continue;observed.add(root);
      new MutationObserver(records=>{
        const pending=new Set();
        for(const r of records){
          const enclosing=r.target.nodeType===1?r.target.closest?.('math'):r.target.parentElement?.closest('math');
          if(enclosing)pending.add(enclosing);
          for(const n of r.addedNodes)if(n.nodeType===1)pending.add(n);
        }
        pending.forEach(scan);if(pending.size)diagnostics();
      }).observe(root,{childList:true,subtree:true});
    }
    diagnostics();
  }
  api.refresh=refresh;
  api.typeset=scan;
  api.diagnostics=diagnostics;
  // Warm only the pinned engine's font faces BEFORE entering the existing A4
  // print path. Its page renderer, overflow check and native print call remain.
  // Otherwise an already-resolved document.fonts.ready could race DOM rendering.
  let fontsPrepared=null;
  function prepareFonts(){
    if(engineStatus()!=='ready')return Promise.resolve();
    if(!fontsPrepared)fontsPrepared=Promise.all(Array.from(document.fonts||[]).filter(face=>/^KaTeX_/.test(face.family.replace(/["']/g,''))).map(face=>face.status==='loaded'?Promise.resolve(face):face.load())).catch(error=>{fontsPrepared=null;record(error);throw error;});
    return fontsPrepared;
  }
  const wrapPrint=original=>async function(){
    try{await prepareFonts();}catch{if(typeof global.toast==='function')global.toast('수식 글꼴을 준비하지 못했습니다. 다시 확인해 주세요.');return;}
    return original.apply(this,arguments);
  };
  if(typeof global.printSheet==='function')global.printSheet=wrapPrint(global.printSheet);
  if(typeof global.PrintComposerV14?.printConfig==='function')global.PrintComposerV14.printConfig=wrapPrint(global.PrintComposerV14.printConfig);
  api.prepareFonts=prepareFonts;
  document.addEventListener('DOMContentLoaded',refresh);
  global.addEventListener?.('load',refresh);
  document.fonts?.ready?.then(refresh);
  document.fonts?.addEventListener?.('loadingdone',refresh);
  refresh();
})(typeof window!=='undefined'?window:globalThis);
