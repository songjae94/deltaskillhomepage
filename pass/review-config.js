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
  /* 낱개 시험 상품(REVIEW-S2) 길 — 낱개가 test 일 때만 산다. 낱개 live 면 사라진다. */
  window.DSReviewApi = function (config) {
    if (config?.PAY_MODE !== "test" || !TEST_CK.test(config.clientKey ?? "")) return null;
    return verifiedBase(config);
  };
  /* 이용권 카드 등록(빌링) 길 — 낱개 스위치에서 뗌(11-18 걸음 7). billingClientKey 가 있으면 그것, 없으면 낱개 test 일 때 clientKey. 테스트 키만 받는다(서버는 BILLING_PAY_MODE 로 따로 판단). */
  window.DSBillingKey = function (config) {
    if (!config) return null;
    const key = config.billingClientKey ?? (config.PAY_MODE === "test" ? config.clientKey : null);
    return TEST_CK.test(key ?? "") ? key : null;
  };
  window.DSBillingApi = function (config) {
    return window.DSBillingKey(config) ? verifiedBase(config) : null;
  };
})();
