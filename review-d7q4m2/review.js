/* 문항 눈판정판 (2026-11-28). Holds no item text, answer, password or code: everything comes from the
   item-judge server function after the password gate. Items are cleaned by the draw card's own cleaner
   (render-copy.js) and typeset by the site's math renderer. */
(() => {
'use strict';
const LOCAL = ['localhost', '127.0.0.1', '[::1]'].includes(location.hostname);
const API = LOCAL ? '/functions/v1/item-judge' : 'https://cvlrphtupjmaefahodgz.supabase.co/functions/v1/item-judge';
const K = {token: 'dsj.token', queue: 'dsj.queue', draft: 'dsj.draft.', last: 'dsj.last'};
const VERDICT = {1: '바로 사용', 2: '조금 수정', 3: '많이 수정', 4: '폐기'};
const SIDES = ['문제', '해설', '둘 다'];
const CHIPS = ['발문', '조건', '수치', '정답', '해설', '그림', '렌더', '금1', '금2', '금3', '금4', '금5', '금6'];
const FILTERS = [['all', '전체'], ['todo', '미판정'], ['sample', '표본'], ['machine', '기계 걸림'], ['pending', '수정대기'], ['recheck', '다시 볼 것'], ['discard', '폐기']];
const main = document.getElementById('jb-main'), syncLine = document.getElementById('jb-sync');
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]));
const store = {
  get(k, d = null) { try { const v = localStorage.getItem(k); return v === null ? d : JSON.parse(v); } catch { return d; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} },
  del(k) { try { localStorage.removeItem(k); } catch {} }
};
const uuid = () => crypto.randomUUID ? crypto.randomUUID() : '10000000-1000-4000-8000-100000000000'.replace(/[018]/g, c => (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16));
const fixLabel = (s, r) => s === '수정됨' ? r + '차 수정됨' : s === '통과' ? r + '차 통과' : s === '수정대기' && r > 1 ? '수정대기(' + r + '차)' : s;
const time = ms => { const d = new Date(ms); return d.toLocaleDateString('ko-KR', {month: 'numeric', day: 'numeric'}) + ' ' + d.toLocaleTimeString('ko-KR', {hour: '2-digit', minute: '2-digit'}); };

// ---- session ----
function session() { const s = store.get(K.token); if (s && s.exp > Date.now() && s.token) return s; store.del(K.token); return null; }
class ApiError extends Error { constructor(status, body) { super(body?.error || 'unavailable'); this.status = status; this.body = body; } }
async function call(action, body = {}) {
  const s = session();
  const r = await fetch(API, {method: 'POST', credentials: 'omit', cache: 'no-store', headers: {'Content-Type': 'application/json', ...(s ? {Authorization: 'Bearer ' + s.token} : {})},
    body: JSON.stringify({action, ...body})});
  let data = null; try { data = await r.json(); } catch {}
  if (r.status === 401 && action !== 'login') { store.del(K.token); route('#login'); throw new ApiError(401, data); }
  if (!r.ok) throw new ApiError(r.status, data);
  return data;
}

// ---- send queue (입력 유실 방지) ----
let flushing = false, lastSaved = null;
const recent = new Map(); // item_id → last server answer this tab got (laid over a list fetched before it landed)
function queue() { return store.get(K.queue, []); }
function showSync(extra) {
  const q = queue();
  syncLine.className = 'jb-sync' + (q.length ? ' warn' : '');
  syncLine.innerHTML = q.length ? '보내지 못함 ' + q.length + '건 · <button type="button" class="jb-link" id="jb-resend">다시 보냄</button>' : lastSaved ? '저장됨 ' + esc(lastSaved) : '';
  if (extra) syncLine.innerHTML += ' ' + esc(extra);
  document.getElementById('jb-resend')?.addEventListener('click', () => flush());
}
async function flush() {
  if (flushing || !session()) return;
  flushing = true;
  try {
    for (let q = queue(); q.length; q = queue()) {
      const job = q[0];
      let out;
      try { out = await call('verdict', job); }
      catch (e) {
        if (e.status === 400 || e.status === 404) { store.set(K.queue, queue().filter(j => j.client_id !== job.client_id)); showSync('보내지 못한 판정 하나가 거절됨(' + (e.body?.fields || e.message) + ')'); continue; }
        break; // network / 5xx / 401: keep it for later
      }
      store.set(K.queue, queue().filter(j => j.client_id !== job.client_id));
      lastSaved = time(Date.now());
      recent.set(job.item_id, out);
      applySaved(job.item_id, out);
    }
  } finally { flushing = false; showSync(); }
}
setInterval(flush, 30000);
addEventListener('online', flush);
addEventListener('focus', flush);

// ---- routing ----
let unit = null; // {book, unit, items, filter, pos, current}
function route(h) { if (location.hash !== h) location.hash = h; else render(); }
addEventListener('hashchange', render);
function parseHash() {
  const [path, query] = location.hash.slice(1).split('?');
  const parts = path.split('/').map(decodeURIComponent);
  const qs = new URLSearchParams(query || '');
  return {view: parts[0] || 'menu', book: parts[1], unit: parts[2], f: qs.get('f') || 'all', i: qs.get('i')};
}
function unitHash(book, u, f, i) { return '#unit/' + encodeURIComponent(book) + '/' + encodeURIComponent(u) + '?f=' + f + (i ? '&i=' + i : ''); }

async function render() {
  const s = session(), h = parseHash();
  document.querySelector('.jb-nav').hidden = !s;
  document.getElementById('jb-who').textContent = s ? s.reviewer + ' 님' : '';
  document.body.dataset.view = s ? h.view : 'login';
  if (!s) return renderLogin();
  if (h.view === 'unit' && h.book && h.unit) return renderUnit(h);
  if (h.view === 'summary') return renderSummary();
  return renderMenu();
}

// ---- login ----
function renderLogin() {
  main.innerHTML = '<section class="jb-card jb-login"><p class="jb-kicker">내부 검토 · 문항 눈확인</p><h1>문항 눈판정</h1><p class="jb-help">전달받은 비밀번호와 검토자 이름을 넣어 주세요. 판정은 서버에 바로 남습니다.</p>' +
    '<form id="jb-login" autocomplete="off"><label>비밀번호<input id="jb-pw" type="password" required autocomplete="current-password"></label>' +
    '<label>검토자 이름<input id="jb-name" required maxlength="20" value="' + esc(store.get(K.last, {}).reviewer || '') + '"></label>' +
    '<button class="jb-primary" type="submit">들어가기</button><p class="jb-msg" id="jb-msg" role="alert"></p></form></section>';
  const form = document.getElementById('jb-login'), msg = document.getElementById('jb-msg');
  form.onsubmit = async e => {
    e.preventDefault();
    msg.textContent = '확인 중…';
    try {
      const d = await call('login', {password: document.getElementById('jb-pw').value, reviewer: document.getElementById('jb-name').value});
      store.set(K.token, {token: d.token, reviewer: d.reviewer, exp: Date.now() + d.hours * 3600e3 - 60e3});
      store.set(K.last, {reviewer: d.reviewer});
      route(/^#(unit|summary)/.test(location.hash) ? location.hash : '#menu'); flush();
    } catch (err) {
      msg.textContent = err.status === 401 ? '비밀번호가 맞지 않습니다.' : err.status === 429 ? '여러 번 틀려 잠시 막혔습니다. 15분 뒤 다시 해 주세요.' : err.status === 400 ? '검토자 이름을 1~20자로 적어 주세요.' : '서버에 닿지 못했습니다. 잠시 뒤 다시 해 주세요.';
      document.getElementById('jb-pw').select();
    }
  };
  document.getElementById('jb-pw').focus();
}
document.getElementById('jb-out').onclick = () => { store.del(K.token); route('#login'); };

// ---- menu ----
async function renderMenu() {
  unit = null;
  main.innerHTML = '<p class="jb-wait">목록 불러오는 중…</p>';
  let d; try { d = await call('menu'); } catch (e) { return fail(e); }
  const prog = u => '<span class="jb-prog"><b>판정 ' + u.judged.toLocaleString() + '</b> / ' + u.total.toLocaleString() + (u.pending ? ' · <i class="p">수정대기 ' + u.pending + '</i>' : '') +
    (u.machine ? ' · <i class="m">기계 ' + u.machine + '</i>' : '') + (u.sample ? ' · <i class="s">표본 ' + u.sample + '</i>' : '') + '</span>' +
    '<span class="jb-bar-mini" aria-hidden="true"><span style="width:' + (u.total ? Math.round(u.judged / u.total * 100) : 0) + '%"></span></span>';
  main.innerHTML = '<section class="jb-card"><div class="jb-head"><div><p class="jb-kicker">고르기</p><h1>과목 · 교재 · 단원</h1></div>' +
    '<div class="jb-tools"><button type="button" data-csv="verdicts">판정 CSV</button><button type="button" data-csv="rules">같은 꼴 규칙 후보 CSV</button><button type="button" id="jb-flags-open">기계 걸림 올리기</button></div></div>' +
    '<div class="jb-subjects" role="tablist">' + d.subjects.map((s, i) => '<button type="button" role="tab" data-subj="' + i + '" aria-selected="' + (i === 0) + '">' + esc(s.subject) + '</button>').join('') + '</div>' +
    d.subjects.map((s, i) => '<div class="jb-books" data-books="' + i + '"' + (i ? ' hidden' : '') + '>' + s.books.map(b =>
      '<details class="jb-book"><summary><strong>' + esc(b.book.replace(/_/g, ' ')) + '</strong>' + prog(b) + '</summary><ul class="jb-units">' + b.units.map(u =>
        '<li><a href="' + unitHash(b.book, u.unit, 'all') + '"><span class="jb-uname">' + esc(u.unit) + '</span>' + prog(u) + '</a>' +
        '<span class="jb-sample"><input type="number" min="1" max="200" value="10" aria-label="' + esc(u.unit) + ' 표본 수"><button type="button" data-book="' + esc(b.book) + '" data-unit="' + esc(u.unit) + '">표본 뽑기</button></span></li>').join('') +
      '</ul></details>').join('') + '</div>').join('') +
    '<dialog id="jb-flags"><form method="dialog" class="jb-flags-form"><h2>기계 걸림 올리기</h2><p class="jb-help">작업자가 잰 걸린 키 목록을 붙여 넣습니다. 줄마다 <code>키,규칙,까닭</code>(첫 줄 제목은 건너뜀). 걸린 문항은 「기계 걸림」 표시와 함께 수정대기가 됩니다.</p>' +
    '<label>묶음 이름<input id="jb-batch" maxlength="60" placeholder="예: 금4_큰분수_1128"></label><textarea id="jb-flag-rows" rows="8"></textarea><p class="jb-msg" id="jb-flag-msg"></p>' +
    '<div class="jb-row"><button value="cancel">닫기</button><button type="button" class="jb-primary" id="jb-flag-send">올리기</button></div></form></dialog></section>';
  main.querySelectorAll('[data-subj]').forEach(b => b.onclick = () => {
    main.querySelectorAll('[data-subj]').forEach(x => x.setAttribute('aria-selected', String(x === b)));
    main.querySelectorAll('[data-books]').forEach(x => x.hidden = x.dataset.books !== b.dataset.subj);
  });
  main.querySelectorAll('.jb-sample button').forEach(b => b.onclick = async () => {
    const n = Number(b.previousElementSibling.value) || 10;
    b.disabled = true; b.textContent = '뽑는 중…';
    try { const r = await call('sample', {book: b.dataset.book, unit: b.dataset.unit, n}); route(unitHash(b.dataset.book, b.dataset.unit, 'sample')); showSync('표본 ' + r.n + '문항 · 씨앗 ' + r.seed); }
    catch (e) { b.disabled = false; b.textContent = '표본 뽑기'; fail(e, true); }
  });
  main.querySelectorAll('[data-csv]').forEach(b => b.onclick = () => downloadCsv(b.dataset.csv));
  const dlg = document.getElementById('jb-flags');
  document.getElementById('jb-flags-open').onclick = () => dlg.showModal();
  document.getElementById('jb-flag-send').onclick = async () => {
    const msg = document.getElementById('jb-flag-msg');
    const rows = document.getElementById('jb-flag-rows').value.split(/\r?\n/).map(l => l.trim()).filter(Boolean).map(parseCsvLine)
      .filter(c => /^[0-9a-f-]{36}$/.test(c[0])).map(c => ({item_id: c[0], rule: c[1] || '', reason: c.slice(2).join(',')}));
    if (!rows.length) { msg.textContent = '키가 든 줄이 없습니다.'; return; }
    try { const r = await call('flags', {batch: document.getElementById('jb-batch').value.trim(), rows}); msg.textContent = '넣음 ' + r.added + ' · 모르는 키 ' + r.unknown; }
    catch (e) { msg.textContent = e.status === 400 ? '묶음 이름(글자 · 숫자 · _ . -)과 규칙 칸을 확인해 주세요.' : '서버에 닿지 못했습니다.'; }
  };
}
function parseCsvLine(line) {
  const out = []; let cur = '', q = false;
  for (let i = 0; i < line.length; i++) { const c = line[i];
    if (q) { if (c === '"' && line[i + 1] === '"') { cur += '"'; i++; } else if (c === '"') q = false; else cur += c; }
    else if (c === '"') q = true; else if (c === ',') { out.push(cur); cur = ''; } else cur += c; }
  out.push(cur); return out.map(s => s.trim());
}
async function downloadCsv(kind) {
  try {
    const d = await call('export', {kind});
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([d.csv], {type: 'text/csv;charset=utf-8'}));
    a.download = (kind === 'rules' ? '눈판정_같은꼴_규칙후보_' : '눈판정_') + new Date().toISOString().slice(0, 16).replace(/[-:T]/g, '') + '.csv';
    document.body.append(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 5000);
  } catch (e) { fail(e, true); }
}

// ---- unit / judging ----
const PRI = r => r.machine ? 0 : r.sample ? 1 : 2;
function filtered(items, f) {
  const pick = {all: () => true, todo: r => !r.verdict, sample: r => r.sample, machine: r => r.machine, pending: r => r.fix_state === '수정대기', recheck: r => r.fix_state === '수정됨', discard: r => r.verdict === 4}[f] || (() => true);
  return items.filter(pick).sort((a, b) => PRI(a) - PRI(b) || a.n - b.n);
}
async function renderUnit(h) {
  if (!unit || unit.book !== h.book || unit.unit !== h.unit) {
    main.innerHTML = '<p class="jb-wait">문항 목록 불러오는 중…</p>';
    let d; try { d = await call('list', {book: h.book, unit: h.unit}); } catch (e) { return fail(e); }
    unit = {book: d.book, unit: d.unit, items: d.items};
    for (const [id, out] of recent) applySaved(id, out);
    for (const job of queue()) applySaved(job.item_id, {verdict: job.verdict});
  }
  unit.filter = FILTERS.some(f => f[0] === h.f) ? h.f : 'all';
  const list = filtered(unit.items, unit.filter);
  let cur = list.find(r => r.item_id === h.i) || unit.items.find(r => r.item_id === h.i);
  if (!cur && list.length) { history.replaceState(null, '', unitHash(unit.book, unit.unit, unit.filter, list[0].item_id)); cur = list[0]; }
  const counts = Object.fromEntries(FILTERS.map(([k]) => [k, filtered(unit.items, k).length]));
  main.innerHTML = '<div class="jb-judge"><aside class="jb-side"><a class="jb-back" href="#menu">← 고르기</a><h2>' + esc(unit.book.replace(/_/g, ' ')) + '</h2><p class="jb-uname">' + esc(unit.unit) + '</p>' +
    '<div class="jb-chips" role="group" aria-label="거르기">' + FILTERS.map(([k, n]) => '<a href="' + unitHash(unit.book, unit.unit, k) + '" class="jb-chip"' + (k === unit.filter ? ' aria-current="true"' : '') + '>' + n + ' <b>' + counts[k] + '</b></a>').join('') + '</div>' +
    '<nav class="jb-grid" aria-label="문항 번호">' + list.map(r => '<a href="' + unitHash(unit.book, unit.unit, unit.filter, r.item_id) + '" class="' + cellClass(r) + '"' + (cur && r.item_id === cur.item_id ? ' aria-current="step"' : '') +
      ' title="' + esc(r.n + '번 · ' + (r.verdict ? VERDICT[r.verdict] : '미판정') + ' · ' + fixLabel(r.fix_state, r.round)) + '">' + r.n + '</a>').join('') + '</nav>' +
    '<p class="jb-legend">' + [['v0', '미판정'], ['v1', '바로 사용'], ['v2', '조금 수정'], ['v3', '많이 수정'], ['v4', '폐기'], ['mk', '기계 걸림'], ['sp', '표본'], ['re', '다시 볼 것']].map(([c, n]) => '<span><i class="' + c + '"></i> ' + n + '</span>').join('') + '</p></aside>' +
    '<section class="jb-stage" id="jb-stage">' + (cur ? '<p class="jb-wait">문항 불러오는 중…</p>' : '<div class="jb-card"><p>이 거르기에 맞는 문항이 없습니다.</p></div>') + '</section></div>';
  if (cur) loadItem(cur, list);
}
function cellClass(r) { return 'v' + (r.verdict || 0) + (r.machine ? ' mk' : '') + (r.sample ? ' sp' : '') + (r.fix_state === '수정됨' ? ' re' : ''); }

let itemSeq = 0;
async function loadItem(row, list) {
  const seq = ++itemSeq, stage = document.getElementById('jb-stage');
  let d; try { d = await call('item', {item_id: row.item_id}); } catch (e) { if (seq === itemSeq) stage.innerHTML = '<div class="jb-card jb-error">' + errorText(e) + '</div>'; return; }
  if (seq !== itemSeq) return;
  const idx = list.findIndex(r => r.item_id === row.item_id);
  const body = (q, s, a, title) => '<div class="jb-paper">' + (title ? '<p class="jb-ver">' + title + '</p>' : '') + '<div class="jb-q" data-q></div>' +
    '<p class="jb-answer">정답 <b>' + esc(a ?? '없음') + '</b></p><div class="jb-s" data-s></div></div>';
  stage.innerHTML = '<article class="jb-card jb-item"><header class="jb-item-head"><div><p class="jb-kicker">' + esc(d.book.replace(/_/g, ' ')) + ' · ' + esc(d.unit) + ' · ' + d.stage + '단계</p>' +
    '<h1>' + d.n + '번 <span class="jb-state">' + esc(fixLabel(d.fix_state, d.round)) + '</span>' + (d.verdict ? ' <span class="jb-tag v' + d.verdict + '">' + VERDICT[d.verdict] + '</span>' : '') + '</h1></div>' +
    '<p class="jb-pos">' + (idx + 1) + ' / ' + list.length + '</p></header>' +
    (d.machine.length ? '<p class="jb-flag">기계 걸림 · ' + d.machine.map(m => esc(m.rule) + (m.reason ? ' — ' + esc(m.reason) : '')).join(' · ') + '</p>' : '') +
    (d.worker.length ? '<p class="jb-worker">작업자 판정 <b>' + esc(d.worker[0].verdict) + '</b>' + (d.worker[0].note ? ' — ' + esc(d.worker[0].note) : '') + ' <small>(' + esc(d.worker[0].source) + ')</small></p>' : '') +
    (d.pics ? '<p class="jb-note">그림 ' + d.pics + '개 든 문항</p>' : '') +
    '<div class="jb-papers' + (d.revision ? ' two' : '') + '">' + body(d.question_html, d.solution_html, d.answer, d.revision ? '원판' : '') +
    (d.revision ? body(d.revision.question_html, d.revision.solution_html, d.revision.answer, d.revision.round + '차 고친 판') : '') + '</div>' +
    (d.history.length ? '<details class="jb-history"><summary>판정 이력 ' + d.history.length + '</summary><ol>' + d.history.map(v => '<li><b>' + VERDICT[v.verdict] + '</b> · ' + esc(v.reviewer) + ' · ' + time(v.at) + ' · ' + v.round + '차' +
      (v.side ? ' · ' + esc(v.side) : '') + (v.reasons?.length ? ' · ' + esc(v.reasons.join(' ')) : '') + (v.note ? '<br>' + esc(v.note) : '') + '</li>').join('') + '</ol></details>' : '') +
    '</article>' + verdictBar(d);
  const papers = stage.querySelectorAll('.jb-paper');
  const fill = (paper, q, s) => {
    for (const [sel, html, fn] of [['[data-q]', q, 'question'], ['[data-s]', s, 'solution']]) {
      const box = paper.querySelector(sel);
      if (!html) { box.innerHTML = '<p class="jb-missing">' + (fn === 'solution' ? '해설 없음' : '문항 없음') + '</p>'; continue; }
      try { box.replaceChildren(window.DSJudgeRender[fn](html)); }
      catch { box.innerHTML = '<p class="jb-missing">렌더 거절 — 손님 화면에서도 열리지 않는 꼴입니다(렌더 흠).</p>'; box.dataset.rejected = '1'; }
    }
    window.WebMathRendererV23?.typeset?.(paper);
  };
  fill(papers[0], d.question_html, d.solution_html);
  if (d.revision) fill(papers[1], d.revision.question_html, d.revision.solution_html);
  wireBar(d, list, idx);
}

function verdictBar(d) {
  const draft = store.get(K.draft + d.item_id) || {};
  return '<form class="jb-vbar" id="jb-vbar" data-open="' + (draft.verdict > 1 ? 1 : 0) + '" autocomplete="off">' +
    '<div class="jb-reason"' + (draft.verdict > 1 ? '' : ' hidden') + '><div class="jb-row"><fieldset class="jb-sides"><legend>어느 쪽 흠</legend>' + SIDES.map(s => '<label><input type="radio" name="side" value="' + s + '"' + (draft.side === s ? ' checked' : '') + '>' + s + '</label>').join('') + '</fieldset>' +
    '<fieldset class="jb-reason-chips"><legend>까닭 칩</legend>' + CHIPS.map(c => '<label><input type="checkbox" name="chip" value="' + c + '"' + ((draft.reasons || []).includes(c) ? ' checked' : '') + '>' + c + '</label>').join('') + '</fieldset></div>' +
    '<label class="jb-note-label">고칠 내용 · 까닭 <small>(빈 채로는 저장되지 않습니다 · ⌘/Ctrl+Enter 저장)</small><textarea name="note" rows="2" maxlength="4000">' + esc(draft.note || '') + '</textarea></label>' +
    '<div class="jb-row"><label class="jb-sweep"><input type="checkbox" name="sweep"' + (draft.sweep ? ' checked' : '') + '> 같은 꼴 전수 점검 — 다른 문항에도 있을 꼴</label><span class="jb-msg" id="jb-vmsg" role="alert"></span><button type="submit" class="jb-primary">판정 저장 →</button></div></div>' +
    '<div class="jb-row jb-keys"><button type="button" class="jb-nav-btn" data-move="-1" aria-label="이전 문항">←</button>' +
    [1, 2, 3, 4].map(v => '<button type="button" class="jb-v v' + v + '" data-v="' + v + '" aria-pressed="' + (draft.verdict === v) + '"><kbd>' + v + '</kbd> ' + VERDICT[v] + '</button>').join('') +
    '<button type="button" class="jb-nav-btn" data-move="1" aria-label="다음 문항">→</button></div></form>';
}

function wireBar(d, list, idx) {
  const form = document.getElementById('jb-vbar'), reason = form.querySelector('.jb-reason'), msg = document.getElementById('jb-vmsg');
  const key = K.draft + d.item_id;
  const read = () => ({verdict: Number(form.querySelector('[data-v][aria-pressed=true]')?.dataset.v) || 0, side: form.querySelector('[name=side]:checked')?.value || null,
    reasons: [...form.querySelectorAll('[name=chip]:checked')].map(x => x.value), note: form.querySelector('[name=note]').value, sweep: form.querySelector('[name=sweep]').checked});
  const keepDraft = () => { const v = read(); if (v.verdict > 1 || v.note) store.set(key, v); else store.del(key); };
  form.addEventListener('input', keepDraft);
  const move = step => { const next = list[idx + step]; if (next) location.hash = unitHash(unit.book, unit.unit, unit.filter, next.item_id); };
  form.querySelectorAll('[data-move]').forEach(b => b.onclick = () => move(Number(b.dataset.move)));
  const choose = v => {
    form.querySelectorAll('[data-v]').forEach(b => b.setAttribute('aria-pressed', String(Number(b.dataset.v) === v)));
    if (v === 1) { save(); return; }
    reason.hidden = false; form.dataset.open = '1'; keepDraft();
    form.querySelector('[name=note]').focus();
  };
  form.querySelectorAll('[data-v]').forEach(b => b.onclick = () => choose(Number(b.dataset.v)));
  function save() {
    const v = read();
    if (v.verdict > 1) {
      if (!v.side) { msg.textContent = '문제 · 해설 · 둘 다 가운데 하나를 골라 주세요.'; return; }
      if (!v.note.trim()) { msg.textContent = '고칠 내용이나 까닭을 적어야 저장됩니다.'; form.querySelector('[name=note]').focus(); return; }
    }
    const job = {item_id: d.item_id, client_id: uuid(), verdict: v.verdict, side: v.verdict > 1 ? v.side : null, reasons: v.verdict > 1 ? v.reasons : [], note: v.verdict > 1 ? v.note.trim() : '', sweep: v.verdict > 1 && v.sweep};
    store.set(K.queue, [...queue(), job]);
    store.del(key);
    applySaved(d.item_id, {verdict: job.verdict, fix_state: null, round: null, pending: true});
    showSync('보내는 중…');
    flush();
    const next = list[idx + 1];
    if (next) location.hash = unitHash(unit.book, unit.unit, unit.filter, next.item_id);
    else { render(); showSync('이 거르기의 마지막 문항입니다.'); }
  }
  form.onsubmit = e => { e.preventDefault(); save(); };
  form.querySelector('[name=note]').addEventListener('keydown', e => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) { e.preventDefault(); save(); } });
  onKey = e => {
    if (e.target.closest?.('textarea,input,select,dialog') || e.metaKey || e.ctrlKey || e.altKey) return;
    if (/^[1-4]$/.test(e.key)) { e.preventDefault(); choose(Number(e.key)); }
    else if (e.key === 'ArrowLeft') { e.preventDefault(); move(-1); }
    else if (e.key === 'ArrowRight') { e.preventDefault(); move(1); }
  };
}
let onKey = null;
addEventListener('keydown', e => { if (document.body.dataset.view === 'unit' && onKey) onKey(e); });

function applySaved(itemId, out) {
  const r = unit?.items.find(x => x.item_id === itemId);
  if (!r) return;
  if (out.verdict) r.verdict = out.verdict;
  if (out.fix_state) { r.fix_state = out.fix_state; r.round = out.round; }
  const cell = document.querySelector('.jb-grid a[href*="i=' + itemId + '"]');
  if (cell) cell.className = cellClass(r);
  document.querySelectorAll('.jb-chip').forEach(c => { const k = new URLSearchParams(c.getAttribute('href').split('?')[1]).get('f'); c.querySelector('b').textContent = filtered(unit.items, k).length; });
}

// ---- summary ----
async function renderSummary() {
  unit = null;
  main.innerHTML = '<p class="jb-wait">모아 보는 중…</p>';
  let d; try { d = await call('summary'); } catch (e) { return fail(e); }
  const tot = d.units.reduce((a, u) => { a.total += u.total; for (const k in u.verdict) a.verdict[k] = (a.verdict[k] || 0) + u.verdict[k]; for (const k in u.state) a.state[k] = (a.state[k] || 0) + u.state[k]; return a; }, {total: 0, verdict: {}, state: {}});
  const cols = ['미판정', ...Object.values(VERDICT)], states = ['미수정', '수정대기', '수정됨', '통과'];
  const row = (name, u) => '<tr><th scope="row">' + name + '</th><td>' + u.total.toLocaleString() + '</td>' + [0, 1, 2, 3, 4].map(k => '<td>' + (u.verdict[k] || 0).toLocaleString() + '</td>').join('') + states.map(s => '<td>' + (u.state[s] || 0).toLocaleString() + '</td>').join('') + '</tr>';
  main.innerHTML = '<section class="jb-card"><div class="jb-head"><div><p class="jb-kicker">모아 보기 · ' + time(Date.now()) + ' 기준</p><h1>판정 모아 보기</h1></div><div class="jb-tools"><button type="button" data-csv="verdicts">판정 CSV</button><button type="button" data-csv="rules">같은 꼴 규칙 후보 CSV</button></div></div>' +
    '<div class="jb-table-wrap"><table class="jb-table"><thead><tr><th>교재 · 단원</th><th>전체</th>' + cols.map(c => '<th>' + c + '</th>').join('') + states.map(s => '<th>' + s + '</th>').join('') + '</tr></thead><tbody>' +
    row('<b>모두</b>', tot) + d.units.map(u => row(esc(u.book.replace(/_/g, ' ')) + ' · ' + esc(u.unit), u)).join('') + '</tbody></table></div>' +
    '<h2>까닭별 수 <small>(문항마다 마지막 판정 기준)</small></h2><ul class="jb-reasons">' + (Object.keys(d.reasons).length ? Object.entries(d.reasons).sort((a, b) => b[1] - a[1]).map(([k, n]) => '<li>' + esc(k) + ' <b>' + n + '</b></li>').join('') : '<li>아직 없음</li>') + '</ul></section>';
  main.querySelectorAll('[data-csv]').forEach(b => b.onclick = () => downloadCsv(b.dataset.csv));
}

function errorText(e) { return e.status === 404 ? '찾는 자리가 없습니다.' : e.status === 401 ? '다시 들어가 주세요.' : '서버에 닿지 못했습니다. 잠시 뒤 다시 해 주세요.'; }
function fail(e, soft) { if (e.status === 401) return; if (soft) { showSync(errorText(e)); return; } main.innerHTML = '<section class="jb-card jb-error"><p>' + errorText(e) + '</p><button type="button" onclick="location.reload()">다시 불러오기</button></section>'; }

showSync();
render();
flush();
})();
