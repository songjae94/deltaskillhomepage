"use strict";

const API = "https://cvlrphtupjmaefahodgz.supabase.co/functions/v1/hq-board/";
const byId = id => document.getElementById(id);
const states = new Map([["", "⬜ 할 일"], ["끝", "✅ 끝"], ["막힘", "⛔ 막힘"], ["검증", "🔎 점검 대기"]]);
const colors = new Map([["끝", "s-done"], ["막힘", "s-blk"], ["검증", "s-chk"]]);
let session = null;
let expiryTimer = 0;
let revision = "";
let busy = false;

function element(tag, value, className) {
  const el = document.createElement(tag);
  if (value !== undefined) el.textContent = value;
  if (className) el.className = className;
  return el;
}

async function api(route, data, active = session) {
  const headers = {};
  if (route !== "login" && active) headers.Authorization = "Bearer " + active.token;
  if (data) headers["Content-Type"] = "application/json";
  const response = await fetch(API + route, {
    method: data ? "POST" : "GET",
    headers,
    credentials: "omit",
    cache: "no-store",
    redirect: "error",
    body: data ? JSON.stringify(data) : undefined,
  });
  if (route !== "login" && active !== session) throw new Error("session_changed");
  if (route !== "login" && response.status === 401) {
    logout("다시 로그인해 주세요.");
    throw new Error("session_changed");
  }
  const result = await response.json();
  if (route !== "login" && active !== session) throw new Error("session_changed");
  if (!response.ok || result.ok !== true) throw new Error(result.error || "board_unavailable");
  return result;
}

async function verifyConnection() {
  try {
    const response = await fetch(API + "version", {
      credentials: "omit", cache: "no-store", redirect: "error",
    });
    return response.ok && (await response.json()).version === 3;
  } catch {
    return false;
  }
}

function logout(message = "") {
  clearTimeout(expiryTimer);
  session = null;
  revision = "";
  byId("login-form").reset();
  byId("login-error").textContent = message;
  for (const id of ["period", "updated", "feedback", "grid", "days", "remaining", "totals"]) byId(id).replaceChildren();
  byId("period").hidden = true;
  byId("board").hidden = true;
  byId("login").hidden = false;
  byId("password").focus();
}

function editForm(row, anchor) {
  const [id, , , , state, , evidence] = row;
  const edit = element("details", undefined, "edit");
  const form = element("form");
  const fieldset = element("fieldset");
  const statusLabel = element("label", "상태");
  const statusInput = element("select");
  statusInput.id = anchor + "-status";
  statusLabel.htmlFor = statusInput.id;
  statusInput.required = true;
  for (const choice of ["", "끝", "막힘"]) {
    const option = element("option", choice || "상태 선택");
    option.value = choice;
    option.disabled = !choice;
    statusInput.append(option);
  }
  statusInput.value = state === "끝" || state === "막힘" ? state : "";
  const evidenceLabel = element("label", "근거");
  const evidenceInput = element("input");
  evidenceInput.id = anchor + "-evidence";
  evidenceLabel.htmlFor = evidenceInput.id;
  evidenceInput.maxLength = 500;
  evidenceInput.value = evidence;
  const button = element("button", "저장");
  button.type = "submit";
  fieldset.append(statusLabel, statusInput, evidenceLabel, evidenceInput, button);
  form.append(fieldset);
  edit.append(element("summary", "상태·근거 수정"), form);
  form.addEventListener("submit", async event => {
    event.preventDefault();
    if (busy || !session) return;
    const active = session;
    busy = true;
    fieldset.disabled = true;
    byId("feedback").textContent = "저장 중…";
    try {
      await api("mark", { id, state: statusInput.value, evidence: evidenceInput.value, revision }, active);
      try {
        await load(active);
        byId("feedback").textContent = "저장했습니다.";
        byId("refresh").focus();
      } catch (error) {
        if (active === session) byId("feedback").textContent = "저장했습니다. 상황판을 새로고침해 주세요.";
      }
    } catch (error) {
      if (active === session) {
        byId("feedback").textContent = error.message === "board_changed"
          ? "상황판이 바뀌었습니다. 입력한 근거를 복사한 뒤 새로고침해 주세요."
          : "저장 결과를 확인하지 못했습니다. 다시 저장하기 전에 새로고침해 주세요.";
      }
    } finally {
      busy = false;
      fieldset.disabled = false;
    }
  });
  return edit;
}

function dayLink(day, label, name) {
  const link = element("a", label);
  link.href = "#" + day.id;
  if (name) link.setAttribute("aria-label", name);
  link.addEventListener("click", () => { day.open = true; });
  return link;
}

function dayGroup(label, rows, editable) {
  const section = element("section");
  const list = element("ul", undefined, "tasks");
  section.append(element("h3", label + " " + rows.length), list);
  for (const [index, row] of rows) {
    const [id, worker, , task, status, timestamp, evidence] = row;
    const line = element("li", undefined, "task " + (colors.get(status) || ""));
    line.id = "job-" + index;
    line.append(element("strong", worker), element("p", task, "task-name"),
      element("p", [states.get(status), timestamp].filter(Boolean).join(" · "), "state"),
      element("p", evidence, "evidence"));
    if (editable.has(id)) line.append(editForm(row, line.id));
    list.append(line);
  }
  if (!rows.length) list.append(element("li", "없음"));
  return section;
}

function render({ rows, editable_ids }) {
  const editable = new Set(editable_ids);
  const openDays = new Set(Array.from(byId("days").querySelectorAll("details[open]"), day => day.id));
  const workers = new Map();
  const dates = new Map();
  let latest = "";
  rows.forEach((row, index) => {
    const [, worker, date, , state, time] = row;
    if (!dates.has(date)) dates.set(date, { panel: element("details", undefined, "box day"), todo: [], done: [] });
    dates.get(date)[state === "끝" ? "done" : "todo"].push([index, row]);
    if (!workers.has(worker)) workers.set(worker, new Map());
    const summary = workers.get(worker);
    if (!summary.has(date)) summary.set(date, { all: 0, done: 0 });
    summary.get(date).all++;
    if (state === "끝") summary.get(date).done++;
    if (time > latest) latest = time;
  });

  const days = document.createDocumentFragment();
  let totalDone = 0;
  for (const [date, { panel, todo, done }] of dates) {
    panel.id = "day-" + days.childNodes.length;
    panel.open = openDays.size ? openDays.has(panel.id) : !days.childNodes.length;
    panel.append(element("summary", date + " · " + done.length + "/" + (todo.length + done.length)),
      dayGroup("해야 할 것", todo, editable), dayGroup("끝난 것", done, editable));
    days.append(panel);
    totalDone += done.length;
  }
  const period = byId("period");
  const dateLabels = [...dates.keys()];
  period.textContent = dates.size ? dateLabels[0] + " ~ " + dateLabels.at(-1) : "";
  period.hidden = !dates.size;
  byId("updated").textContent = latest ? "마지막 표시 " + latest : "표시 없음";
  byId("totals").textContent = "끝 " + totalDone + " / 전체 " + rows.length;

  const heading = element("thead");
  const columnHead = element("tr");
  for (const title of ["작업자", ...dates.keys()]) {
    const th = element("th", title);
    th.scope = "col";
    columnHead.append(th);
  }
  heading.append(columnHead);
  const body = element("tbody");
  const remaining = document.createDocumentFragment();
  for (const [worker, work] of workers) {
    const line = element("tr");
    const name = element("th", worker);
    name.scope = "row";
    line.append(name);
    const outstanding = element("li");
    outstanding.append(element("strong", worker));
    for (const [date, { panel }] of dates) {
      const cell = element("td", "—", "c");
      const count = work.get(date);
      if (count) {
        const pending = count.all - count.done;
        cell.replaceChildren(dayLink(panel, count.done + "/" + count.all, worker + " " + date + " 끝 " + count.done + " / 전체 " + count.all));
        if (pending) outstanding.append(dayLink(panel, date + " " + pending + "건"));
      }
      line.append(cell);
    }
    if (outstanding.children.length > 1) remaining.append(outstanding);
    body.append(line);
  }
  byId("grid").replaceChildren(heading, body);
  byId("days").replaceChildren(days);
  byId("remaining").replaceChildren(remaining.childNodes.length ? remaining : element("li", "없음"));
}

async function load(active) {
  const snapshot = await api("board", undefined, active);
  if (active !== session) return;
  render(snapshot);
  revision = snapshot.revision;
  byId("login").hidden = true;
  byId("board").hidden = false;
}

byId("login-form").addEventListener("submit", async event => {
  event.preventDefault();
  if (busy) return;
  const submit = event.currentTarget.querySelector("button");
  const workerLogin = byId("worker-login").open;
  const data = { pw: byId("password").value };
  if (workerLogin) {
    data.workerId = byId("worker-id").value.trim();
    data.workerPassword = byId("worker-password").value;
    if (!data.workerId || !data.workerPassword) {
      byId("login-error").textContent = "작업자 아이디와 비밀번호를 모두 입력해 주세요.";
      return;
    }
  }
  busy = true;
  submit.disabled = true;
  byId("login-error").textContent = "확인 중…";
  try {
    if (!await verifyConnection()) {
      logout("상황판 연결을 준비 중입니다.");
      return;
    }
    const { token, expires_at } = await api("login", data);
    session = { token, expiresAt: Date.parse(expires_at) };
    expiryTimer = setTimeout(() => logout("로그인 시간이 끝났습니다."), Math.max(0, session.expiresAt - Date.now()));
    await load(session);
    byId("login-form").reset();
    byId("login-error").textContent = "";
    byId("refresh").focus();
  } catch (error) {
    if (error.message !== "session_changed") {
      const message = new Map([
        ["login_failed", "입력한 로그인 정보를 확인해 주세요."],
        ["write_unavailable", "수정 로그인을 사용할 수 없습니다. 상황판 비밀번호로 열어 주세요."],
        ["too_many", "로그인 시도가 많습니다. 잠시 뒤 다시 시도해 주세요."],
      ]);
      logout(message.get(error.message) || "상황판을 열지 못했습니다.");
    }
  } finally {
    submit.disabled = false;
    busy = false;
  }
});

byId("refresh").addEventListener("click", async () => {
  if (busy || !session) return;
  const active = session;
  busy = true;
  try {
    await load(active);
    if (active === session) byId("feedback").textContent = "새로고침했습니다.";
  } catch {
    if (active === session) byId("feedback").textContent = "상황판을 갱신하지 못했습니다.";
  } finally {
    busy = false;
  }
});
byId("logout").addEventListener("click", () => logout());
document.addEventListener("visibilitychange", () => {
  if (!document.hidden && session && Date.now() >= session.expiresAt) logout("로그인 시간이 끝났습니다.");
});
