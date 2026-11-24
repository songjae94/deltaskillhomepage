(function (scope) {
  "use strict";

  const UNIT_SKU = /^(NS-[A-Z0-9]+-\d{2})\.(pdf|hwpx)$/;
  const MAX_UNITS = 3;
  const MAX_CHARGE = 59000;
  const FULL_REFUND = "여러 권을 한 번에 결제한 주문도 받은 파일만 뺍니다. 환불액은 결제금액에서 받은 파일 값의 합(파일 하나 = 그 책 값을 제공 파일 수로 나눈 값 · 원 아래 버림)을 뺀 금액입니다.";
  const MULTI_DOWNLOAD = "내려받거나 열람한 파일은 청약철회가 제한되고, 받지 않은 파일 몫은 결제일부터 7일 안에 환불받을 수 있습니다.";
  const won = new Intl.NumberFormat("ko-KR");
  const money = amount => won.format(amount) + "원";

  function summarize(items) {
    if (!Array.isArray(items)) return { error: "invalid" };
    if (items.length > MAX_UNITS) return { error: "unit-limit" };
    const units = new Set();
    let subtotal = 0;
    for (const item of items) {
      if (!item || item.kind !== "unit" || item.eligible !== true || typeof item.unitId !== "string" ||
          !item.unitId.trim() || units.has(item.unitId) ||
          !Number.isSafeInteger(item.price) || item.price < 1) {
        return { error: "invalid" };
      }
      units.add(item.unitId);
      subtotal += item.price;
      if (!Number.isSafeInteger(subtotal)) return { error: "invalid" };
    }
    if (subtotal > MAX_CHARGE && units.size !== MAX_UNITS) return { error: "amount-limit" };
    const total = Math.min(subtotal, MAX_CHARGE);
    return { unitCount: units.size, subtotal, total, adjustment: subtotal - total };
  }

  function unitSku(value) {
    return typeof value === "string" && value.length <= 20 ? UNIT_SKU.exec(value) : null;
  }

  function checkoutUrl(skus) {
    const params = new URLSearchParams();
    for (const sku of skus) params.append(skus.length === 1 ? "sku" : "skus", sku);
    return "/checkout/?" + params.toString();
  }

  function unitPrice(unit, format, now) {
    const price = unit.price?.[format];
    const tax = unit.taxFreeAmount?.[format];
    const from = Date.parse(unit.saleFrom);
    const until = unit.saleTo ? Date.parse(unit.saleTo) : Infinity;
    return Number.isSafeInteger(price) && price > 0 && Number.isSafeInteger(tax) && tax >= 0 && tax <= price &&
      now >= from && now < until && (unit.sample || unit.releaseVerified === true) && unit.files?.some(file => file.fmt === format) ? price : null;
  }

  function render(panel, items) {
    const result = summarize(items);
    panel.hidden = Array.isArray(items) && items.length === 0;
    const get = name => panel.querySelector('[data-finals-' + name + ']');
    get("status").textContent = result.error === "unit-limit"
      ? "한 번에 최대 3단원까지 담을 수 있습니다. 넷째 단원부터 따로 결제해 주세요."
      : result.error === "amount-limit" ? "두 단원 합계가 59,000원을 넘으면 따로 결제해 주세요."
      : result.error ? "단원 선택을 다시 확인해 주세요." : result.unitCount + " / 3단원";
    get("subtotal").textContent = result.error ? "—" : money(result.subtotal);
    get("adjustment").textContent = result.error ? "—" : money(result.adjustment);
    get("total").textContent = result.error ? "—" : money(result.total);
    return result;
  }

  const api = Object.freeze({ MAX_UNITS, FULL_REFUND, MULTI_DOWNLOAD, summarize, unitSku, unitPrice, checkoutUrl, render });
  if (typeof module === "object" && module.exports) module.exports = api;
  else scope.DeltaFinalsOrder = api;
})(globalThis);
