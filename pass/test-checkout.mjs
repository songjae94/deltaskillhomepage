const billingButton = document.querySelector('[data-toss-review="pass"]');
const billingStatus = document.querySelector("#checkout-pass [data-checkout-status]");
const singleStatus = document.querySelector("#checkout-single [data-checkout-status]");
const pendingKey = "delta-pass-test-attempt";
const ttl = 10 * 60 * 1000;
const auth = window.DSAuth;
let sdk;

function loadSdk() {
  if (typeof window.TossPayments === "function") return Promise.resolve(window.TossPayments);
  sdk ??= new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://js.tosspayments.com/v2/standard";
    script.onload = () => typeof window.TossPayments === "function" ? resolve(window.TossPayments) : reject(new Error("sdk"));
    script.onerror = reject;
    document.head.append(script);
  }).catch(error => { sdk = undefined; throw error; });
  return sdk;
}

async function tokenDigest(token) {
  const bytes = new TextEncoder().encode(token);
  return Array.from(new Uint8Array(await crypto.subtle.digest("SHA-256", bytes))).join(".");
}

function clearCallback() {
  history.replaceState(null, "", location.pathname + "#checkout-pass");
  window.dispatchEvent(new Event("hashchange"));
}

async function finishRegistration(url, api) {
  const saved = sessionStorage.getItem(pendingKey);
  const pending = saved ? JSON.parse(saved) : null;
  const token = auth.get();
  if (!token || !pending || pending.state !== url.searchParams.get("state") ||
      pending.owner !== await tokenDigest(token) || Date.now() - pending.started > ttl) {
    billingStatus.textContent = "카드 등록 요청을 확인할 수 없습니다. 상품 화면에서 확인해 주세요.";
    return;
  }
  if (sessionStorage.getItem(pendingKey) !== saved) return;
  sessionStorage.removeItem(pendingKey);
  if (url.searchParams.get("billing") === "fail") {
    billingStatus.textContent = "테스트 카드 등록이 완료되지 않았습니다.";
    return;
  }
  const authKey = url.searchParams.get("authKey");
  const customerKey = url.searchParams.get("customerKey");
  if (url.searchParams.get("billing") !== "success" || !authKey || authKey.length > 300 ||
      customerKey !== pending.customerKey) {
    billingStatus.textContent = "카드 등록 응답을 대조할 수 없습니다.";
    return;
  }
  billingStatus.textContent = "토스 테스트 승인 결과를 확인하고 있습니다.";
  try {
    const result = await billingCall(api, token, {action:"approve",authKey,customerKey,state:pending.state});
    if (result.status !== "DONE" || result.amount !== 10000 || result.orderId !== pending.orderId) {
      throw new Error("unverified");
    }
    billingStatus.textContent = "토스 테스트 결제 10,000원 승인을 확인했습니다.";
  } catch {
    billingStatus.textContent = "테스트 승인 결과를 확인하지 못했습니다. 다시 결제하기 전에 주문 상태를 확인해 주세요.";
  }
}

async function billingCall(api, token, body) {
  const response = await fetch(api, {method:"POST", redirect:"error", credentials:"omit",
    headers:{"Content-Type":"application/json", Authorization:"Bearer " + token},
    body:JSON.stringify(body)});
  if (!response.ok) throw new Error("billing");
  return response.json();
}

async function openRegistration(config, api) {
  const token = auth.get();
  if (!token) {
    location.assign(auth.loginUrl(location.pathname + "#checkout-pass"));
    return;
  }
  billingButton.disabled = true;
  try {
    const {status,customerKey,state,orderId,amount} = await billingCall(api, token, {action:"session"});
    if (status !== "READY" || amount !== 10000 ||
        ![customerKey,state,orderId].every(value => typeof value === "string" && value.trim())) {
      throw new Error("unverified");
    }
    const owner = await tokenDigest(token);
    const callback = new URL(location.pathname, location.origin);
    callback.searchParams.set("state", state);
    const success = new URL(callback);
    const failure = new URL(callback);
    success.searchParams.set("billing", "success");
    failure.searchParams.set("billing", "fail");
    const TossPayments = await loadSdk();
    sessionStorage.setItem(pendingKey, JSON.stringify({state,customerKey,orderId,owner,started:Date.now()}));
    await TossPayments(config.clientKey).payment({customerKey}).requestBillingAuth({
      method:"CARD", successUrl:success.href, failUrl:failure.href, windowTarget:"self"
    });
  } catch {
    sessionStorage.removeItem(pendingKey);
    billingStatus.textContent = "토스 테스트 카드 등록창을 열지 못했습니다.";
  } finally {
    billingButton.disabled = false;
  }
}

const callback = new URL(location.href);
const returning = callback.searchParams.has("billing");
if (returning) clearCallback();
try {
  const response = await fetch("/pay-config.json", {cache:"no-store", credentials:"same-origin", redirect:"error"});
  const config = response.ok ? await response.json() : null;
  const api = window.DSReviewApi(config);
  if (!api) {
    billingStatus.textContent = "심사용 테스트 결제를 사용할 수 없습니다.";
    singleStatus.textContent = billingStatus.textContent;
  } else {
    for (const link of document.querySelectorAll("[data-review-sku]")) {
      const path = "/checkout/?sku=" + encodeURIComponent(link.dataset.reviewSku);
      link.href = auth.has() ? path : auth.loginUrl(path);
      link.hidden = false;
    }
    const billingApi = new URL("billing-test", api);
    if (returning) await finishRegistration(callback, billingApi);
    else {
      billingButton.disabled = false;
      billingButton.textContent = auth.has() ? "토스 테스트 카드 등록 열기" : "로그인하고 카드 등록하기";
      billingButton.addEventListener("click", () => openRegistration(config, billingApi));
    }
  }
} catch {
  billingStatus.textContent = "심사용 테스트 결제 설정을 확인해 주세요.";
  singleStatus.textContent = billingStatus.textContent;
}
