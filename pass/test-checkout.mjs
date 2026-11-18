const billingButton = document.querySelector('[data-toss-review="pass"]');
const billingStatus = document.querySelector("#checkout-pass [data-checkout-status]");
const pendingKey = "delta-pass-test-attempt";
const ttl = 10 * 60 * 1000;
const auth = window.DSAuth;
let sdk;
let generation = 0;
let billingPhase = "idle";
let reviewReady = false; /* 이용권 카드 등록 길(DSBillingApi) */
/* 1118 재점검 N1: 낱개 시험 상품(REVIEW-S2 · 600원) 길은 test 에서도 닫음 — 이 쪽은 이용권 카드 등록 길만 쓴다 */
const loginLinks = document.querySelectorAll("[data-review-login]");
const agreeAll = document.querySelector("[data-agree-all]");
const agrees = [...document.querySelectorAll("[data-agree]")];
const nextCharge = document.querySelector("[data-next-charge]");
const agreed = () => agrees.length > 0 && agrees.every(box => box.checked);

function addOneMonth(date) {
  const day = date.getDate();
  const next = new Date(date.getFullYear(), date.getMonth() + 1, 1);
  const last = new Date(next.getFullYear(), next.getMonth() + 1, 0).getDate();
  next.setDate(Math.min(day, last));
  return next;
}
if (nextCharge) {
  const d = addOneMonth(new Date());
  nextCharge.textContent = "결제 승인일로부터 1개월 뒤 같은 날짜 (오늘 결제하면 " +
    d.getFullYear() + "년 " + (d.getMonth() + 1) + "월 " + d.getDate() + "일)";
}
agreeAll?.addEventListener("change", () => { for (const box of agrees) box.checked = agreeAll.checked; renderControls(); });
for (const box of agrees) box.addEventListener("change", () => { if (agreeAll) agreeAll.checked = agreed(); renderControls(); });

async function memberName(token) {
  try {
    const response = await fetch(auth.api + "/me", {headers:{Authorization:"Bearer " + token}, credentials:"omit", redirect:"error"});
    const me = response.ok ? await response.json() : null;
    const name = typeof me?.name === "string" ? me.name.trim().slice(0, 40) : "";
    return name || undefined;
  } catch { return undefined; }
}

function renderControls() {
  billingButton.disabled = !reviewReady || billingPhase !== "idle" || !agreed();
  billingButton.textContent = {
    opening: "카드 등록창 여는 중",
    approving: "결제 승인 확인 중",
    approved: "결제 승인 완료",
    checking: "이용권 상태 확인 중",
    unclear: "승인 결과 확인 필요"
  }[billingPhase] ?? (!agreed() ? "필수 항목에 동의해 주세요" : auth.has() ? "카드 등록하고 10,000원 결제" : "로그인하고 카드 등록하기");
  for (const link of loginLinks) link.hidden = auth.has();
}

/* 1118 25 창(형 지적): 승인 뒤 · 이미 이용 중이면 동의 칸 · 결제 단추 대신 완료 칸만 — 두 번 결제 막음 */
const checkoutSection = document.querySelector("#checkout-pass");
const doneBox = document.querySelector("[data-pass-done]");
const HAS_PASS = ["ACTIVE", "CANCEL_SCHEDULED", "RENEWING", "RENEW_RETRY", "REFUNDING"];
const kDay = v => { const d = new Date(v); return isNaN(d) ? "" : new Intl.DateTimeFormat("ko-KR", {timeZone:"Asia/Seoul", year:"numeric", month:"long", day:"numeric"}).format(d); };
function showDone(view) {
  if (!checkoutSection || !doneBox) return;
  for (const el of checkoutSection.children) {
    if (el.tagName !== "H1" && el !== doneBox && el !== billingStatus) el.hidden = true;
  }
  const set = (sel, text) => { const el = doneBox.querySelector(sel); el.textContent = text; el.closest("div").hidden = !text; };
  const full = view.status === "ACTIVE" || view.status === "CANCEL_SCHEDULED";
  set("[data-done-amount]", full && view.amount ? Number(view.amount).toLocaleString("ko-KR") + "원" : "");
  set("[data-done-term]", full && view.endsAt ? "1개월 · " + kDay(view.endsAt) + "까지" : "");
  set("[data-done-next]", full ? (view.nextChargeAt ? kDay(view.nextChargeAt) + " (매월 자동 갱신)" : "없음 (자동 갱신 해지 예약)") : "");
  doneBox.querySelector("[data-done-title]").textContent = view.status === "CANCEL_SCHEDULED" ? "이용 중인 변형문항 이용권 · 해지 예약"
    : full ? "이용 중인 변형문항 이용권" : "변형문항 이용권 상태 확인 필요";
  doneBox.hidden = false;
}
let statusApi = null;
/** 로그인 회원이 이미 이용권을 가졌으면 완료 칸으로 — 불러오는 동안 결제 단추는 잠금. 로그인이 바뀌면 다시 본다. */
async function checkPass() {
  if (!statusApi || !auth.has()) return;
  const token = auth.get(), g = generation;
  setPhase("checking");
  const view = await passStatus(statusApi, token);
  if (g !== generation || auth.get() !== token) return;
  if (view) showDone(view);
  setPhase("idle");
}
async function passStatus(api, token) {
  try { const v = await billingCall(api, token, {action:"status"}); return v && HAS_PASS.includes(v.status) ? v : null; }
  catch { return null; }
}

function setPhase(phase) {
  billingPhase = phase;
  renderControls();
}

auth.onChange(() => {
  if (doneBox && !doneBox.hidden) { location.reload(); return; }
  generation += 1;
  sessionStorage.removeItem(pendingKey);
  billingStatus.textContent = "";
  setPhase("idle");
  checkPass();
});

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

async function finishRegistration(url, api, accountGeneration) {
  const token = auth.get();
  if (!token) return;
  const current = () => accountGeneration === generation && auth.get() === token;
  const saved = sessionStorage.getItem(pendingKey);
  let pending;
  try { pending = JSON.parse(saved); } catch { sessionStorage.removeItem(pendingKey); }
  if (!pending || pending.state !== url.searchParams.get("state") ||
      pending.owner !== await tokenDigest(token) || Date.now() - pending.started > ttl) {
    if (!current()) return;
    setPhase("idle");
    billingStatus.textContent = "카드 등록 요청을 확인할 수 없습니다. 상품 화면에서 확인해 주세요.";
    return;
  }
  if (!current() || sessionStorage.getItem(pendingKey) !== saved) return;
  sessionStorage.removeItem(pendingKey);
  if (url.searchParams.get("billing") === "fail") {
    setPhase("idle");
    billingStatus.textContent = "카드 등록이 완료되지 않았습니다. 결제되지 않았습니다.";
    return;
  }
  const authKey = url.searchParams.get("authKey");
  const customerKey = url.searchParams.get("customerKey");
  if (url.searchParams.get("billing") !== "success" || !authKey || authKey.length > 300 ||
      customerKey !== pending.customerKey) {
    setPhase("idle");
    billingStatus.textContent = "카드 등록 응답을 대조할 수 없습니다.";
    return;
  }
  billingStatus.textContent = "결제 승인 결과를 확인하고 있습니다.";
  try {
    const result = await billingCall(api, token, {action:"approve",authKey,customerKey,state:pending.state});
    if (!current()) return;
    if (result.status !== "DONE" || result.amount !== 10000 || result.orderId !== pending.orderId) {
      throw new Error("unverified");
    }
    setPhase("approved");
    billingStatus.textContent = "변형문항 이용권 10,000원 결제 승인을 확인했습니다. 마이페이지 > 이용권에서 이용 기간과 다음 결제일을 확인할 수 있습니다.";
    const view = await passStatus(api, token);
    if (current()) showDone(view ?? {status:"ACTIVE", amount:result.amount});
  } catch {
    if (!current()) return;
    setPhase("unclear");
    billingStatus.textContent = "결제 승인 결과를 확인하지 못했습니다. 다시 결제하기 전에 마이페이지 > 이용권에서 상태를 확인해 주세요.";
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
  if (billingPhase !== "idle" || !agreed()) return;
  const accountGeneration = generation;
  const current = () => accountGeneration === generation && auth.get() === token;
  setPhase("opening");
  billingStatus.textContent = "";
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
    const [TossPayments, customerName] = await Promise.all([loadSdk(), memberName(token)]);
    if (!current()) return;
    sessionStorage.setItem(pendingKey, JSON.stringify({state,customerKey,orderId,owner,started:Date.now()}));
    await TossPayments(window.DSBillingKey(config)).payment({customerKey}).requestBillingAuth({
      method:"CARD", successUrl:success.href, failUrl:failure.href, windowTarget:"self",
      ...(customerName ? {customerName} : {})
    });
  } catch {
    if (!current()) return;
    sessionStorage.removeItem(pendingKey);
    billingStatus.textContent = "토스페이먼츠 카드 등록창을 열지 못했습니다. 잠시 뒤 다시 시도해 주세요.";
  } finally {
    if (current()) setPhase("idle");
  }
}

const callback = new URL(location.href);
const returning = callback.searchParams.has("billing");
const returnGeneration = generation;
if (returning) {
  clearCallback();
  if (auth.has()) setPhase("approving");
}
try {
  const response = await fetch("/pay-config.json", {cache:"no-store", credentials:"same-origin", redirect:"error"});
  const config = response.ok ? await response.json() : null;
  const api = window.DSBillingApi(config);
  if (!api) {
    billingStatus.textContent = "지금은 결제를 사용할 수 없습니다. 잠시 뒤 다시 시도해 주세요.";
  } else {
    const billingApi = new URL("billing-test", api);
    reviewReady = true;
    renderControls();
    billingButton.addEventListener("click", () => openRegistration(config, billingApi));
    if (returning && returnGeneration === generation) await finishRegistration(callback, billingApi, returnGeneration);
    else { statusApi = billingApi; await checkPass(); }
  }
} catch {
  billingStatus.textContent = "결제 설정을 불러오지 못했습니다. 잠시 뒤 다시 시도해 주세요.";
}
if (!reviewReady) {
  billingPhase = "idle";
  renderControls();
}
