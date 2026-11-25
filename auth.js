/* 델타스킬 공용 로그인 조각 (1008) — 토큰은 늘 짝(ds_tk + ds_tk_ph)으로 다룬다. 빠뜨리면 파일럿 저장이 need_pin 으로 막힌다.
   쓰는 곳: / · /partners/ · /report/… 헤더(#authnav · #mauth) · /my/ · /auth/ · /pilot/ · /sol/
   DSAuth.get()/has()/phone() · set(token, phone) · clear() · logout() · requireLogin(next) · loginUrl(next, mode) · header() */
(function () {
  var API = "https://cvlrphtupjmaefahodgz.supabase.co/functions/v1/api";
  function safeNext(n) { n = String(n || ""); return /^\/[A-Za-z0-9_\-./?#=&%]*$/.test(n) && n.indexOf("//") !== 0 ? n : "/my/"; }
  var signingOut = false;
  var lostAsk = {}, aliveAt = {};
  var logoutEpochKey = "ds_logout_epoch";
  var tabPrivateKeys = ["ds_order", "delta-pass-test-attempt", "ds_oauth", "ds_l2"];
  var memberKeys = ["ds_phone", "ds_students", "ds_subs", "ds_subid", "ds_pw_old", "ds_pin_short"];
  function clearTabData() {
    try { tabPrivateKeys.forEach(function (key) { sessionStorage.removeItem(key); }); } catch (e) {}
  }
  // Only an account-free marker is shared. Each tab owns its own order and OAuth state.
  function syncTabLogout() {
    try {
      var epoch = localStorage.getItem(logoutEpochKey);
      if (sessionStorage.getItem(logoutEpochKey) === epoch) return;
      clearTabData();
      if (epoch) sessionStorage.setItem(logoutEpochKey, epoch);
      else sessionStorage.removeItem(logoutEpochKey);
    } catch (e) {}
  }
  function recordLogout() {
    clearTabData();
    try { localStorage.setItem(logoutEpochKey, String(Date.now()) + "-" + Math.random()); } catch (e) {}
    syncTabLogout();
  }

  var A = {
    api: API,
    get: function () { try { return localStorage.getItem("ds_tk") || ""; } catch (e) { return ""; } },
    has: function () { return !!A.get(); },
    phone: function () { try { return localStorage.getItem("ds_tk_ph") || localStorage.getItem("ds_phone") || ""; } catch (e) { return ""; } },
    onChange: function (callback) {
      var previous = A.get();
      function check() {
        var current = A.get();
        if (current === previous) return;
        previous = current;
        callback(current);
      }
      window.addEventListener("ds-auth-change", check);
      window.addEventListener("storage", function (event) { if (event.key === "ds_tk" || event.key === null) check(); });
      window.addEventListener("pageshow", check);
    },
    set: function (t, ph) { try { localStorage.setItem("ds_tk", t); if (ph) { localStorage.setItem("ds_tk_ph", ph); localStorage.setItem("ds_phone", ph); } } catch (e) {} window.dispatchEvent(new Event("ds-auth-change")); },
    clear: function () { try { localStorage.removeItem("ds_tk"); localStorage.removeItem("ds_tk_ph"); sessionStorage.removeItem("ds_l2"); } catch (e) {} window.dispatchEvent(new Event("ds-auth-change")); },   /* ds_l2: 강사 페이지 값 — 로그아웃하면 이 탭에도 남기지 않는다 */
    /* 로그아웃 때만: 이 기기에 남긴 번호 · 이름 · 학원 · 기록표를 지운다(형 1105 — 공용 컴퓨터에서 다음 사람에게 보였다). 토큰이 풀렸을 뿐일 때(clear)는 남겨 다시 로그인을 쉽게 한다. */
    forget: function () { try { memberKeys.forEach(function (k) { localStorage.removeItem(k); }); } catch (e) {} },
    /* H32(관문 86): 회원 api 401 하나로 토큰을 지우지 않는다. auth_verify 는 IP 시간 한도 · DB 오류에도 null → 401 을 내서
       한도에 걸린 실회원도 로그아웃되던 흠. 지우기 전에 /welcome-points(토큰 줄 SELECT 만 · 한도 밖)로 한 번 더 묻는다:
       401 unauthorized(없음 · 만료 · 철회)일 때만 잃은 토큰. 200 · 503 · 429 · 연결 실패 = 살아 있음(지우지 않음).
       같은 토큰 물음은 하나로 모으고, 살아 있으면 30초 기억한다(되풀이 부름 0). */
    lost: function (t) {
      t = t || A.get();
      if (!t) return Promise.resolve(true);
      if (aliveAt[t] && Date.now() - aliveAt[t] < 30000) return Promise.resolve(false);
      if (lostAsk[t]) return lostAsk[t];
      var ctrl = typeof AbortController === "function" ? new AbortController() : null;
      var timer = ctrl ? setTimeout(function () { try { ctrl.abort(); } catch (e) {} }, 10000) : 0;
      var ask = fetch(API + "/welcome-points", { method: "GET", headers: { "Authorization": "Bearer " + t }, credentials: "omit", cache: "no-store", signal: ctrl ? ctrl.signal : undefined })
        .then(function (r) {
          if (r.status !== 401) return false;
          return r.json().then(function (d) { return !!(d && d.ok === false && d.error === "unauthorized"); }, function () { return false; });
        }, function () { return false; })
        .then(function (gone) { clearTimeout(timer); delete lostAsk[t]; if (!gone) aliveAt[t] = Date.now(); return gone; });
      lostAsk[t] = ask;
      return ask;
    },
    /* 잃은 토큰일 때만 지운다(그새 다른 토큰으로 바뀌었으면 손대지 않음). 돌려주는 값 = 잃었는지. */
    clearIfLost: function (t) {
      t = t || A.get();
      return A.lost(t).then(function (gone) { if (gone && A.get() === t) A.clear(); return gone; });
    },
    loginUrl: function (next, mode) { return "/auth/?" + (mode ? "mode=" + mode + "&" : "") + "next=" + encodeURIComponent(safeNext(next || (location.pathname + location.search + location.hash))); },
    requireLogin: function (next) { if (A.has()) return true; location.replace(A.loginUrl(next)); return false; },
    /* 서버 토큰도 지운다(이 기기만). 서버가 안 받아도 로컬은 지운다. */
    logout: function () {
      var t = A.get();
      signingOut = true;
      A.forget();
      recordLogout();
      A.clear();
      signingOut = false;
      A.header();
      if (t) {
        try {
          fetch(API + "/logout", { method: "POST", headers: { "Authorization": "Bearer " + t, "Content-Type": "application/json" }, body: "{}", keepalive: true }).catch(function () {});
        } catch (e) {}
      }
      location.replace("/");
    },
    /* 헤더: #authnav(데스크톱 링크 묶음) · #mauth(모바일 단추) — 옛 인라인 조각과 같은 꼴 */
    header: function () {
      var n = document.getElementById("authnav"), on = A.has(), q = location.pathname.indexOf("/auth/") === 0 ? new URLSearchParams(location.search).get("next") : "", back = q || (n && n.dataset.next) || (location.pathname + location.search + location.hash);
      document.documentElement.classList.toggle("authed", on);
      function link(target, name, href, signOut) {
        target.textContent = name;
        target.href = href;
        target.classList.toggle("dsout", signOut);
        target.onclick = signOut ? function (event) {
          event.preventDefault();
          A.logout();
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
  syncTabLogout();
  window.addEventListener("pageshow", syncTabLogout);
  window.addEventListener("storage", function (event) {
    if (event.storageArea !== localStorage) return;
    if (event.key === logoutEpochKey || event.key === null) syncTabLogout();
    if (event.key === "ds_tk" && event.oldValue && !event.newValue) clearTabData();
  });
  window.DSAuth = A;
  var leaveOnLogout = document.querySelector("[data-logout-next]");
  if (leaveOnLogout) {
    A.onChange(function (token) {
      if (!token && !signingOut) location.replace(safeNext(leaveOnLogout.dataset.logoutNext));
    });
  }
  if (document.getElementById("authnav") || document.getElementById("mauth")) {
    A.header();
    window.addEventListener("pageshow", function (event) { if (event.persisted) A.header(); });
    window.addEventListener("storage", function (event) { if (event.key === "ds_tk" || event.key === null) A.header(); });
  }
})();
