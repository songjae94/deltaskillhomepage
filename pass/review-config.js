(function () {
  window.DSReviewApi = function (config) {
    if (config?.PAY_MODE !== "test" || !/^test_ck_[A-Za-z0-9_-]+$/.test(config.clientKey ?? "")) return null;
    try {
      const api = new URL(config.api);
      const expected = new URL("..", window.DSAuth.api + "/");
      if (api.protocol === "https:" && api.origin === expected.origin &&
          api.pathname.replace(/\/+$/, "") === expected.pathname.replace(/\/+$/, "") &&
          !api.username && !api.password && !api.search && !api.hash) return expected;
    } catch { /* No verified configuration. */ }
    return null;
  };
})();
