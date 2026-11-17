/* 델타스킬 공용 로그인 조각 (1008) — 토큰은 늘 짝(ds_tk + ds_tk_ph)으로 다룬다. 빠뜨리면 파일럿 저장이 need_pin 으로 막힌다.
   쓰는 곳: / · /partners/ · /report/… 헤더(#authnav · #mauth) · /my/ · /auth/ · /pilot/ · /sol/
   DSAuth.get()/has()/phone() · set(token, phone) · clear() · logout() · requireLogin(next) · loginUrl(next, mode) · header() */
(function () {
  var API = "https://cvlrphtupjmaefahodgz.supabase.co/functions/v1/api";
  function safeNext(n) { n = String(n || ""); return /^\/[A-Za-z0-9_\-./?#=&%]*$/.test(n) && n.indexOf("//") !== 0 ? n : "/my/"; }
  var A = {
    api: API,
    get: function () { try { return localStorage.getItem("ds_tk") || ""; } catch (e) { return ""; } },
    has: function () { return !!A.get(); },
    phone: function () { try { return localStorage.getItem("ds_tk_ph") || localStorage.getItem("ds_phone") || ""; } catch (e) { return ""; } },
    set: function (t, ph) { try { localStorage.setItem("ds_tk", t); if (ph) { localStorage.setItem("ds_tk_ph", ph); localStorage.setItem("ds_phone", ph); } } catch (e) {} },
    clear: function () { try { localStorage.removeItem("ds_tk"); localStorage.removeItem("ds_tk_ph"); sessionStorage.removeItem("ds_l2"); } catch (e) {} },   /* ds_l2: 강사 페이지 값 — 로그아웃하면 이 탭에도 남기지 않는다 */
    /* 로그아웃 때만: 이 기기에 남긴 번호 · 이름 · 학원 · 기록표를 지운다(형 1105 — 공용 컴퓨터에서 다음 사람에게 보였다). 토큰이 풀렸을 뿐일 때(clear)는 남겨 다시 로그인을 쉽게 한다. */
    forget: function () { try { ["ds_phone", "ds_students", "ds_subs", "ds_subid", "ds_pw_old", "ds_pin_short"].forEach(function (k) { localStorage.removeItem(k); }); } catch (e) {} },
    loginUrl: function (next, mode) { return "/auth/?" + (mode ? "mode=" + mode + "&" : "") + "next=" + encodeURIComponent(safeNext(next || (location.pathname + location.search + location.hash))); },
    requireLogin: function (next) { if (A.has()) return true; location.replace(A.loginUrl(next)); return false; },
    /* 서버 토큰도 지운다(이 기기만). 서버가 안 받아도 로컬은 지운다. */
    logout: function (to) {
      var t = A.get(); A.clear(); A.forget(); A.header();
      var done = function () { location.href = safeNext(to || "/"); };
      if (!t) return done();
      try {
        fetch(API + "/logout", { method: "POST", headers: { "Authorization": "Bearer " + t, "Content-Type": "application/json" }, body: "{}", keepalive: true }).catch(function () {}).then(done, done);
      } catch (e) { done(); }
    },
    /* 헤더: #authnav(데스크톱 링크 묶음) · #mauth(모바일 단추) — 옛 인라인 조각과 같은 꼴 */
    header: function () {
      var n = document.getElementById("authnav"), on = A.has(), back = (n && n.dataset.next) || (location.pathname + location.search + location.hash);
      document.documentElement.classList.toggle("authed", on);
      function link(target, name, href, signOut) {
        target.textContent = name;
        target.href = href;
        target.classList.toggle("dsout", signOut);
        target.onclick = signOut ? function (event) {
          event.preventDefault();
          A.logout(location.pathname + location.search + location.hash);
        } : null;
      }
      function slot(attribute) {
        var anchor = n.querySelector("[" + attribute + "]");
        if (!anchor) {
          anchor = document.createElement("a");
          anchor.setAttribute(attribute, "");
          n.appendChild(anchor);
        }
        return anchor;
      }
      if (n) {
        n.classList.add("ds-account-links");
        link(slot("data-account-primary"), on ? "로그아웃" : "로그인", on ? "#" : A.loginUrl(back), on);
        link(slot("data-account-secondary"), on ? "마이페이지" : "회원가입", on ? "/my/" : A.loginUrl(back, "signup"), false);
      }
      var mb = document.getElementById("mauth");
      if (mb) link(mb, on ? "로그아웃" : "로그인", on ? "#" : A.loginUrl(back), on);
    }
  };
  window.DSAuth = A;
  if (document.getElementById("authnav") || document.getElementById("mauth")) {
    A.header();
    window.addEventListener("pageshow", function (event) { if (event.persisted) A.header(); });
    window.addEventListener("storage", function (event) { if (event.key === "ds_tk" || event.key === null) A.header(); });
  }
})();
