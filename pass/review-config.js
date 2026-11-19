(function () {
  const TEST_CK = /^test_ck_[A-Za-z0-9_-]+$/;
  function verifiedBase(config) {
    try {
      const api = new URL(config.api);
      const expected = new URL("..", window.DSAuth.api + "/");
      if (api.protocol === "https:" && api.origin === expected.origin &&
          api.pathname.replace(/\/+$/, "") === expected.pathname.replace(/\/+$/, "") &&
          !api.username && !api.password && !api.search && !api.hash) return expected;
    } catch { /* No verified configuration. */ }
    return null;
  }
  /* 낱개 시험 상품(REVIEW-S2) 길 — 1118 재점검 N1 로 판매(주문서 · /pass/ 단추)는 test 에서도 닫음. 이미 시작된 시험 주문의 승인 확인(/checkout/success/)에만 남는다. */
  window.DSReviewApi = function (config) {
    if (config?.PAY_MODE !== "test" || !TEST_CK.test(config.clientKey ?? "")) return null;
    return verifiedBase(config);
  };
  /* 이용권 카드 등록(빌링) 길 — 낱개 스위치에서 뗌(11-18 걸음 7). 라이브 전환 1119 43: 빌링 모드 = BILLING_PAY_MODE(없으면 PAY_MODE) ·
     키 종류가 그 모드와 같을 때만 연다(test ↔ test_ck · live ↔ live_ck · 어긋나면 닫음). 서버는 BILLING_PAY_MODE 로 따로 판단한다. */
  const BILLING_CK = { test: TEST_CK, live: /^live_ck_[A-Za-z0-9_-]+$/ };
  window.DSBillingMode = function (config) {
    const mode = config?.BILLING_PAY_MODE ?? config?.PAY_MODE;
    return mode === "test" || mode === "live" ? mode : null;
  };
  window.DSBillingKey = function (config) {
    const mode = window.DSBillingMode(config);
    if (!mode) return null;
    const key = config.billingClientKey ?? (config.PAY_MODE === mode ? config.clientKey : null);
    return BILLING_CK[mode].test(key ?? "") ? key : null;
  };
  window.DSBillingApi = function (config) {
    return window.DSBillingKey(config) ? verifiedBase(config) : null;
  };
})();
