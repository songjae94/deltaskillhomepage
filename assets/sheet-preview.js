/* 판매 판 지면 그림 — catalog.json 의 preview.url(저장 자리 미리보기 PDF)을 pdf.js 로 화면에만 그린다(39 창 1119 · 교재 고르기).
   새 그림 파일을 리포에 두지 않는다. 한 PDF 는 한 번만 받고, 한 쪽은 한 번만 그려 같은 그림을 여러 칸이 같이 쓴다.
   쓰는 법: DSSheet.page(url, n) → Promise<그림 주소(blob:)> · DSSheet.pages(url) → Promise<쪽 수> · DSSheet.img(url, n, alt) → <img>(그려지면 채움) */
(function () {
  "use strict";
  var LIB = null, DOCS = {}, PAGES = {}, DONE = {}, WIDTH = 900;
  function lib() {
    if (!LIB) LIB = import("/assets/pdfjs/pdf.min.mjs").then(function (m) { m.GlobalWorkerOptions.workerSrc = "/assets/pdfjs/pdf.worker.min.mjs"; return m; });
    return LIB;
  }
  function doc(url) {
    if (!DOCS[url]) DOCS[url] = lib().then(function (m) { return m.getDocument({ url: url }).promise; });
    return DOCS[url];
  }
  function pages(url) { return doc(url).then(function (d) { return d.numPages; }); }
  function page(url, n) {
    var k = url + "#" + n;
    if (!PAGES[k]) PAGES[k] = doc(url).then(function (d) { return d.getPage(n); }).then(function (pg) {
      var v0 = pg.getViewport({ scale: 1 }), vp = pg.getViewport({ scale: WIDTH / v0.width });
      var c = document.createElement("canvas"); c.width = Math.round(vp.width); c.height = Math.round(vp.height);
      var x = c.getContext("2d"); x.fillStyle = "#fff"; x.fillRect(0, 0, c.width, c.height);
      return pg.render({ canvasContext: x, viewport: vp }).promise.then(function () {
        return new Promise(function (ok) { c.toBlob(function (b) { var u = b ? URL.createObjectURL(b) : c.toDataURL("image/png"); DONE[k] = u; ok(u); }, "image/png"); });
      });
    });
    return PAGES[k];
  }
  function img(url, n, alt) {
    var i = document.createElement("img");
    i.alt = alt || ""; i.decoding = "async"; i.draggable = false; i.className = "ds-sheet";
    i.addEventListener("contextmenu", function (e) { e.preventDefault(); });
    var k = url + "#" + (n || 1);
    if (url && DONE[k]) { i.src = DONE[k]; i.classList.add("on"); return i; } /* 이미 그린 쪽은 바로 — 고를 때 빈 칸이 번쩍이지 않게 */
    if (url) page(url, n || 1).then(function (src) { i.src = src; i.classList.add("on"); }, function () { i.classList.add("fail"); });
    return i;
  }
  window.DSSheet = { page: page, pages: pages, img: img };
})();
