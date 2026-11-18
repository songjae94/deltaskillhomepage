/* 원 교재 이름 한 줄 — 로그인한 회원에게만(형 1119 답 · 38 창).
   이름은 공개 파일에 두지 않고 로그인 뒤 서버 응답(member-library { action:"textbooks" })으로만 받는다.
   로그인 전 · 이름 없는 상품 · 서버 오류면 아무것도 보이지 않는다(지금 화면 그대로).
   쓰는 법: DSTextbook.line(sku) 가 숨긴 <p class="tbname"> 를 돌려주고, 이름이 오면 채워 보인다. */
(function () {
  var API = (window.DSAuth && DSAuth.api) || "https://cvlrphtupjmaefahodgz.supabase.co/functions/v1/api";
  var FN = new URL("..", API + "/").href;
  var got = null;
  function tok() { try { return window.DSAuth ? DSAuth.get() : ""; } catch (_) { return ""; } }
  function names() {
    if (got) return got;
    var t = tok();
    if (!t) return Promise.resolve({});
    got = fetch(FN + "member-library", { method: "POST", credentials: "omit",
      headers: { "Content-Type": "application/json", "Authorization": "Bearer " + t },
      body: JSON.stringify({ action: "textbooks" }) })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (j) { return (j && j.ok && j.names) || {}; })
      .catch(function () { return {}; });
    return got;
  }
  function base(s) { return String(s || "").replace(/\.(pdf|hwpx)$/i, ""); }
  function line(sku, tag) {
    var p = document.createElement(tag || "p");
    p.className = "tbname"; p.hidden = true;
    if (tok()) names().then(function (n) { var v = n[base(sku)]; if (v) { p.textContent = v; p.hidden = false; } });
    return p;
  }
  if (!document.getElementById("tbname-css")) {
    var st = document.createElement("style"); st.id = "tbname-css";
    st.textContent = ".tbname{margin:4px 0 0;font-size:13px;line-height:1.5;color:#5B6678;font-weight:500}";
    document.head.appendChild(st);
  }
  window.DSTextbook = { line: line };
})();
