/* 지금 판매 중인 내신 상품 — naesin/index.html 의 sellable · canBuy 와 같은 잣대(값 · 면세값 · 파일 · 판매일 · PAY_MODE)로 catalog.json 에서 읽는다.
   /materials/ · /store/ 가 같이 쓴다. 새 책은 catalog.json 에 saleFrom 이 지나고 files 가 들면 저절로 선다(손으로 적은 판매 칸 없음). */
(function(){
  "use strict";
  function get(u){return fetch(u,{cache:"no-store"}).then(function(r){return r.ok?r.json():null;}).catch(function(){return null;});}
  function files(u,f){return ((u&&u.files)||[]).filter(function(x){return x.fmt===f;});}
  function open(u,f,now){
    var pr=u&&u.price&&u.price[f];
    if(!pr||!u.taxFreeAmount||u.taxFreeAmount[f]==null||!u.saleFrom||(!u.sample&&u.releaseVerified!==true)||!files(u,f).length)return false; /* checkout · 자료실과 같은 잣대(11-25 44) */
    if(now<Date.parse(u.saleFrom))return false;
    return !(u.saleTo&&now>=Date.parse(u.saleTo));
  }
  function list(cat,cfg){
    var o=[],now=Date.now();
    if(!cat||!cat.subjects||!cfg||(cfg.PAY_MODE!=="test"&&cfg.PAY_MODE!=="live"))return o;
    cat.subjects.slice().sort(function(a,b){return a.grade<b.grade?-1:a.grade>b.grade?1:0;}).forEach(function(s){
      (s.units||[]).forEach(function(u){
        var f=open(u,"pdf",now)?"pdf":open(u,"hwpx",now)?"hwpx":"";if(!f)return;
        var b=(s.textbooks||[])[0],q=new URLSearchParams({s:s.code});
        if(b){q.set("b",b.id);q.set("p","detail");q.set("c",u.composition||"C1");q.set("u",u.no);q.set("x",u.sku);q.set("f",f);q.set("v","confirm");}
        o.push({sku:u.sku,name:u.name||(s.subject+" · "+u.no+" "+u.unit),grade:s.grade,subject:s.subject,count:u.count||0,
          price:u.price[f],fmt:f,preview:u.preview&&u.preview.url||"",unit:u.no+" "+u.unit,nfiles:files(u,f).length,layouts:files(u,f).map(function(x){return x.layout;}).filter(Boolean),href:"/naesin/?"+q});
      });
    });
    return o;
  }
  function won(n){return Number(n).toLocaleString("ko-KR")+"원";}
  function meta(p){return (p.count?p.count+"문항 · ":"")+(p.fmt==="hwpx"?"한글(HWPX)":"PDF")+" "+p.nfiles+"파일 · "+(p.fmt==="pdf"?"포인트 자료실에서 가격 확인":won(p.price));}
  window.DSOnSale={load:function(){return Promise.all([get("/naesin/catalog.json"),get("/pay-config.json")]).then(function(v){return list(v[0],v[1]);});},meta:meta};
})();
