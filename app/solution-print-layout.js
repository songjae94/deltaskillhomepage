/* Run in the A4 document after typesetting and font loading. Measurements are in CSS pixels. */
(() => {
  'use strict';
  const styles = `
    .solbody img,.solbody svg:not(.katex svg) {max-width:100%;max-height:218mm;object-fit:contain}
    .solbody table {max-width:100%;break-inside:auto}
    .solbody tr {break-inside:avoid}
    .solbody table.sol-fit-table {width:100%!important;table-layout:fixed}
    .solbody .sol-fit-table :is(td,th) {width:auto!important;min-width:0;white-space:normal;overflow-wrap:anywhere}
    .solbody .sol-fit-table col {width:auto!important}
    .solbody .sol-wrap-parent {white-space:normal!important;max-width:100%}
    .solbody .katex.sol-wrap-math {display:block!important;white-space:normal!important;text-align:left!important;max-width:100%}
    .solbody .sol-wrap-math>.katex-html {display:block;white-space:normal;text-align:left}
    .solbody .sol-math-line {display:block;white-space:nowrap;line-height:1.65;break-inside:avoid;text-align:left}
    .solbody .sol-math-line + .sol-math-line {margin-top:.22em}
    .solbody .sol-math-line>.sol-math-phrase {display:inline-block;white-space:nowrap}
    .solbody .sol-aligned-line {text-align:left!important}
    .solbody .sol-aligned-line.katex-display {padding-inline-start:0!important}
    .solbody .sol-aligned-line>.katex {text-align:left!important}
  `;
  function prepare(flow) {
    const doc=flow.ownerDocument, win=doc.defaultView;
    if(!doc.getElementById('ds-solution-fit-style')){
      const style=doc.createElement('style');style.id='ds-solution-fit-style';style.textContent=styles;doc.head.append(style);
    }
    const layout=win.getComputedStyle(flow),gap=parseFloat(layout.columnGap)||0;
    const count=parseInt(layout.columnCount,10)||1;
    const width=(flow.clientWidth-gap*(count-1))/count,pitch=width+gap;
    if(width<1)return;
    const columnX=el=>{const x=el.getBoundingClientRect().left-flow.getBoundingClientRect().left;return x-Math.floor((x+1)/pitch)*pitch;};
    for(const table of flow.querySelectorAll('.solbody table')){
      if(table.getBoundingClientRect().width>width+1)table.classList.add('sol-fit-table');
    }
    const blockFor=math=>math.closest('td,th,p,li,.katex-display,div,.solbody');
    function available(math) {
      const block=blockFor(math),style=win.getComputedStyle(block);
      return Math.min(block.clientWidth||width,width)-(parseFloat(style.paddingLeft)||0)-(parseFloat(style.paddingRight)||0);
    }
    const formulas=[...flow.querySelectorAll('.solbody .katex')].filter(math=>!math.parentElement.closest('.katex'));
    function atoms(math) {
      return [...math.querySelectorAll(':scope > .katex-html > :is(.base,.katex-base)')].flatMap(base=>[...base.children].filter(node=>!node.matches('.strut,.katex-strut')));
    }
    function equation(math){
      const nodes=atoms(math);
      const index=nodes.findIndex(n=>n.classList.contains('mrel')&&n.textContent.trim()==='=');
      if(index<0)return null;
      const isLeading=nodes.slice(0,index).every(n=>!n.textContent.trim());
      return {math,sign:nodes[index],leading:isLeading};
    }
    // A continuation must be the next line, with no intervening prose or other formula.
    function follows(first,next){
      if(first.math.closest('.solbody')!==next.math.closest('.solbody'))return false;
      const range=doc.createRange();range.setStartAfter(first.math);range.setEndBefore(next.math);
      const contents=range.cloneContents();
      if(contents.textContent.trim()||contents.querySelector('math,.katex,img,svg,table'))return false;
      return blockFor(first.math)!==blockFor(next.math)||Boolean(contents.querySelector('br'));
    }
    const continuations=new Map();let previous=null,anchor=null;
    for(const math of formulas){
      const row=equation(math);
      if(row?.leading&&previous&&anchor&&follows(previous,row)){
        for(const el of [anchor.math.closest('.katex-display'),row.math.closest('.katex-display')])el?.classList.add('sol-aligned-line');
        continuations.set(math,anchor);
      }else anchor=row&&!row.leading?row:null;
      previous=row;
    }
    // Preserve each top-level KaTeX atom (fractions, radicals, scripts, matrices and limits
    // stay internally intact). A relation or binary operator starts the next phrase.
    function wrap(math,room,offset) {
      const html=math.querySelector(':scope > .katex-html'),nodes=atoms(math);
      if(!html||!nodes.length||math.classList.contains('sol-wrap-math'))return;
      const bases=html.querySelectorAll(':scope > :is(.base,.katex-base)');
      // Preserve explicit line breaks, tags and other KaTeX top-level structures.
      if([...html.children].some(child=>!child.matches('.base,.katex-base')))return;
      const natural=[...bases].reduce((sum,b)=>sum+b.getBoundingClientRect().width,0);
      if(natural+offset<=room+0.5)return;
      const groups=[];let group;
      for(const node of nodes){
        if(!group||node.matches('.mrel,.mbin')||(group.lastElementChild?.classList.contains('mpunct'))){
          group=doc.createElement('span');group.className='sol-math-phrase';groups.push(group);
        }
        group.append(node);
      }
      math.classList.add('sol-wrap-math');
      for(let p=math.parentElement;p&&p!==blockFor(math);p=p.parentElement)p.classList.add('sol-wrap-parent');
      math.closest('.어절')?.classList.add('sol-wrap-parent');
      html.replaceChildren();
      let line;
      function start(pad){
        line=doc.createElement('span');line.className='sol-math-line';line.style.paddingInlineStart=pad+'px';html.append(line);
      }
      start(offset);
      let indent=offset;
      for(const phrase of groups){
        const node=phrase.firstElementChild;
        line.append(phrase);
        if(line.children.length>1 && phrase.getBoundingClientRect().right>line.getBoundingClientRect().right+0.5){
          const pad=phrase.getBoundingClientRect().width+indent<=room?indent:0;
          start(pad);line.append(phrase);
        }
        if(node?.classList.contains('mrel')&&node.textContent.trim()==='='&&!indent){
          indent=Math.max(0,node.getBoundingClientRect().left-line.getBoundingClientRect().left);
        }
      }
    }
    for(const math of formulas){
      const anchor=continuations.get(math);
      const sign=anchor&&equation(math)?.sign;
      const offset=sign?Math.max(0,columnX(anchor.sign)-columnX(sign)):0;
      wrap(math,available(math),offset);
      if(offset&&!math.classList.contains('sol-wrap-math')){
        const first=math.querySelector(':scope > .katex-html > :is(.base,.katex-base)');
        if(first)first.style.marginInlineStart=offset+'px';
      }
    }
  }
  window.DSSolutionPrint=Object.freeze({prepare});
})();
