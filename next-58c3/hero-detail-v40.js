/* Photographic hardware; the document and math remain in live, unchanged renderers. */
(() => {
  'use strict';
  if(window.DSHeroDetailV40 || !window.cinemaScreen)return;
  const previousScreen=window.cinemaScreen, previousShow=window.showCinema;
  const points=[[232,97],[1306,64],[1300,846],[223,818]], w=1024,h=768;
  // Planar projective map: real display corners, not an approximate CSS rotation.
  function planeMatrix(){
    const from=[[0,0],[w,0],[w,h],[0,h]], rows=[];
    from.forEach(([x,y],i)=>{const[u,v]=points[i];rows.push([x,y,1,0,0,0,-u*x,-u*y,u],[0,0,0,x,y,1,-v*x,-v*y,v]);});
    for(let c=0;c<8;c++){
      let pivot=c;for(let r=c+1;r<8;r++)if(Math.abs(rows[r][c])>Math.abs(rows[pivot][c]))pivot=r;
      [rows[c],rows[pivot]]=[rows[pivot],rows[c]];
      const div=rows[c][c];for(let j=c;j<=8;j++)rows[c][j]/=div;
      for(let r=0;r<8;r++)if(r!==c){const f=rows[r][c];for(let j=c;j<=8;j++)rows[r][j]-=f*rows[c][j];}
    }
    const[a,b,c,d,e,f,g,k]=rows.map(row=>row[8]);
    return [a,d,0,g,b,e,0,k,0,0,1,0,c,f,0,1];
  }
  const matrix=planeMatrix();
  const screenTransform=scale=>'matrix3d('+matrix.map((n,i)=>[0,1,4,5,12,13].includes(i)?n*scale:n).join(',')+')';
  function photographicScreen(html,index){
    if(document.documentElement.dataset.design!=='b'||![1,2].includes(Number(index)))return html;
    const temp=document.createElement('template');temp.innerHTML=html;
    const old=temp.content.querySelector('.ip19-device'),glass=old?.querySelector('.ip19-glass');if(!glass)return html;
    glass.querySelector('.ip19-reflection')?.remove();
    const photo=document.createElement('div');photo.className='hd40-product hd39-device';photo.setAttribute('role','group');
    photo.setAttribute('aria-label',Number(index)===1?'선명한 패드의 실제 델타스킬 프린트':'선명한 패드의 타임어택 풀이 화면');
    photo.innerHTML='<div class="hd40-stage"><div class="hd48-chassis"><i class="hd48-camera" aria-hidden="true"></i><div class="hd40-screen"><div class="hd48-display">'+glass.innerHTML+'</div><span class="hd40-glass-light" aria-hidden="true"></span></div></div></div>';
    old.replaceWith(photo);return temp.innerHTML;
  }
  window.cinemaScreen=function(index){return photographicScreen(previousScreen.apply(this,arguments),index);};
  let observer;
  function fit(){
    document.querySelectorAll('.hd40-product').forEach(el=>{const stage=el.querySelector('.hd40-stage'),screen=el.querySelector('.hd40-screen');if(stage)stage.style.transform='none';if(screen){screen.style.transform='none';const display=screen.querySelector('.hd48-display');if(display)display.style.zoom=screen.clientWidth/1024;}});
    window.DSHeroDetailV39?.fitAll();
  }
  function mount(){
    document.querySelectorAll('.role-dock>a[href="#student"],.role-dock>a[href="#teacher"]').forEach(a=>{
      if(a.querySelector('.hd40-keycap'))return;
      const text=a.textContent.trim();a.innerHTML='';const cap=document.createElement('span');cap.className='hd40-keycap';
      const label=document.createElement('span');label.textContent=text;cap.append(label);a.append(cap);
    });
    observer?.disconnect();observer=new ResizeObserver(fit);document.querySelectorAll('.hd40-product').forEach(el=>observer.observe(el));fit();
  }
  window.showCinema=function(index){previousShow.apply(this,arguments);mount();};
  const content=document.getElementById('content');if(content)new MutationObserver(mount).observe(content,{childList:true});
  window.DSHeroDetailV40=Object.freeze({fit,screenCorners:points});
  const stage=document.querySelector('.home-body .cinema');if(stage)window.showCinema(Number(stage.dataset.scene)||0);
})();
