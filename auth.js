/* 델타스킬 공용 로그인 조각 (1008) — 토큰은 늘 짝(ds_tk + ds_tk_ph)으로 다룬다. 빠뜨리면 파일럿 저장이 need_pin 으로 막힌다.
   쓰는 곳: / · /partners/ · /report/… 헤더(#authnav · #mauth) · /my/ · /auth/ · /pilot/ · /sol/
   DSAuth.get()/has()/phone() · set(token, phone) · clear() · logout() · requireLogin(next) · loginUrl(next, mode) · header() */
(function () {
  var API = "https://cvlrphtupjmaefahodgz.supabase.co/functions/v1/api";
  try { if (/^(localhost|127\.0\.0\.1)$/.test(location.hostname) && localStorage.getItem("ds_api_dev")) API = localStorage.getItem("ds_api_dev"); } catch (e) {}
  function safeNext(n) { n = String(n || ""); return /^\/[A-Za-z0-9_\-./?#=&%]*$/.test(n) && n.indexOf("//") !== 0 ? n : "/my/"; }
  var A = {
    api: API,
    get: function () { try { return localStorage.getItem("ds_tk") || ""; } catch (e) { return ""; } },
    has: function () { return !!A.get(); },
    phone: function () { try { return localStorage.getItem("ds_tk_ph") || localStorage.getItem("ds_phone") || ""; } catch (e) { return ""; } },
    set: function (t, ph) { try { localStorage.setItem("ds_tk", t); if (ph) { localStorage.setItem("ds_tk_ph", ph); localStorage.setItem("ds_phone", ph); } } catch (e) {} },
    clear: function () { try { localStorage.removeItem("ds_tk"); localStorage.removeItem("ds_tk_ph"); } catch (e) {} },
    loginUrl: function (next, mode) { return "/auth/?" + (mode ? "mode=" + mode + "&" : "") + "next=" + encodeURIComponent(safeNext(next || (location.pathname + location.search + location.hash))); },
    requireLogin: function (next) { if (A.has()) return true; location.replace(A.loginUrl(next)); return false; },
    /* 서버 토큰도 지운다(이 기기만). 서버가 안 받아도 로컬은 지운다. */
    logout: function (to) {
      var t = A.get(); A.clear();
      var done = function () { location.href = to || "/"; };
      if (!t) return done();
      try {
        fetch(API + "/logout", { method: "POST", headers: { "Authorization": "Bearer " + t, "Content-Type": "application/json" }, body: "{}", keepalive: true }).catch(function () {}).then(done, done);
      } catch (e) { done(); }
    },
    /* 헤더: #authnav(데스크톱 링크 묶음) · #mauth(모바일 단추) — 옛 인라인 조각과 같은 꼴 */
    header: function () {
      var n = document.getElementById("authnav"), on = A.has();
      document.documentElement.classList.toggle("authed", on);
      var links = on ? [["/my/", "내 오답노트", ""], ["#", "로그아웃", "dsout"]] : [[A.loginUrl(location.pathname), "로그인", ""], [A.loginUrl(location.pathname, "signup"), "회원가입", ""]];
      if (n) n.innerHTML = links.map(function (l) { return '<a href="' + l[0] + '"' + (l[2] ? ' class="' + l[2] + '"' : '') + '>' + l[1] + '</a>'; }).join("");
      var mb = document.getElementById("mauth");
      if (mb) { if (on) { mb.textContent = "로그아웃"; mb.href = "#"; mb.className = "mauthbtn dsout"; } else { mb.textContent = "로그인"; mb.href = A.loginUrl(location.pathname); mb.className = "mauthbtn"; } }
      [].forEach.call(document.querySelectorAll(".dsout"), function (o) { o.addEventListener("click", function (e) { e.preventDefault(); A.logout(location.pathname); }); });
    }
  };
  window.DSAuth = A;
  if (document.getElementById("authnav") || document.getElementById("mauth")) A.header();
})();
