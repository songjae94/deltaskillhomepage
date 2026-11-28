/* 관리자 페이지 /work/ (2026-11-28). 첫 화면 · 문항 생산관리 · 작업자별 상황판.
   Holds no password, item text, answer or code: one login through item-judge (same token as the judge board,
   localStorage dsj.token), then the work-board server function hands out the board and production data.
   Everything from the server is drawn as text (escaped), never as HTML. */
(() => {
'use strict';
const LOCAL = ['localhost', '127.0.0.1', '[::1]'].includes(location.hostname);
const FN = LOCAL ? '/functions/v1/' : 'https://cvlrphtupjmaefahodgz.supabase.co/functions/v1/';
const K = {token: 'dsj.token', last: 'dsj.last'};
const PAGE = document.body.dataset.page;
const WORKERS = ['본부', '센터', '맥GPT', 'dot1', 'dot2', 'dot3', 'dot4', 's1', 's1c', 's2', 's2gpt', '승열', '상요', '등재'];
const main = document.getElementById('wk-main'), sync = document.getElementById('wk-sync');
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]));
const store = {
  get(k, d = null) { try { const v = localStorage.getItem(k); return v === null ? d : JSON.parse(v); } catch { return d; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} },
  del(k) { try { localStorage.removeItem(k); } catch {} }
};
const KSTF = new Intl.DateTimeFormat('ko-KR', {timeZone: 'Asia/Seoul', month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false});
const stamp = t => { if (!t) return '—'; const d = new Date(t); if (isNaN(d)) return esc(t);
  const p = Object.fromEntries(KSTF.formatToParts(d).map(x => [x.type, x.value])); return p.month + '/' + p.day + ' ' + p.hour + ':' + p.minute; };
const todayKey = () => { const p = new Intl.DateTimeFormat('en-US', {timeZone: 'Asia/Seoul', month: 'numeric', day: 'numeric'}).formatToParts(new Date());
  return p.find(x => x.type === 'month').value + '/' + p.find(x => x.type === 'day').value; };
const num = n => Number(n || 0).toLocaleString('ko-KR');

// ---- session (same token as /review-d7q4m2/) ----
function session() { const s = store.get(K.token); if (s && s.exp > Date.now() && s.token) return s; store.del(K.token); return null; }
class ApiError extends Error { constructor(status, body) { super(body?.error || 'unavailable'); this.status = status; this.body = body; } }
async function call(fn, action, body = {}) {
  const s = session();
  const r = await fetch(FN + fn, {method: 'POST', credentials: 'omit', cache: 'no-store',
    headers: {'Content-Type': 'application/json', ...(s ? {Authorization: 'Bearer ' + s.token} : {})}, body: JSON.stringify({action, ...body})});
  let data = null; try { data = await r.json(); } catch {}
  if (r.status === 401 && action !== 'login') { store.del(K.token); showLogin(); throw new ApiError(401, data); }
  if (!r.ok) throw new ApiError(r.status, data);
  return data;
}

function showNav() {
  const s = session(), nav = document.querySelector('.jb-nav');
  nav.hidden = !s;
  document.getElementById('wk-who').textContent = s ? s.reviewer : '';
}
document.getElementById('wk-out').addEventListener('click', () => { store.del(K.token); showLogin(); });

function showLogin() {
  showNav();
  main.innerHTML = '<section class="jb-card jb-login"><p class="jb-kicker">델타스킬 작업자 전용</p><h1>관리자 페이지</h1>' +
    '<p class="jb-help">들어가면 문항 눈판정 · 문항 생산관리 · 작업자별 상황판을 다시 묻지 않고 오갑니다.</p>' +
    '<form id="wk-login"><label>비밀번호<input id="wk-pw" type="password" autocomplete="current-password" required></label>' +
    '<label>이름<input id="wk-name" required maxlength="20" value="' + esc(store.get(K.last, {}).reviewer || '') + '"></label>' +
    '<button class="jb-primary" type="submit">들어가기</button><p class="jb-msg" id="wk-msg" role="alert"></p></form></section>';
  const f = document.getElementById('wk-login'), msg = document.getElementById('wk-msg');
  f.addEventListener('submit', async e => {
    e.preventDefault(); msg.textContent = '';
    const btn = f.querySelector('button'); btn.disabled = true;
    try {
      const d = await call('item-judge', 'login', {password: document.getElementById('wk-pw').value, reviewer: document.getElementById('wk-name').value});
      store.set(K.token, {token: d.token, reviewer: d.reviewer, exp: Date.now() + d.hours * 3600e3 - 60e3});
      store.set(K.last, {reviewer: d.reviewer});
      start();
    } catch (err) {
      msg.textContent = err.status === 401 ? '비밀번호가 맞지 않습니다.' : err.status === 429 ? '여러 번 틀려 잠시 막혔습니다. 15분 뒤 다시 하세요.' :
        err.status === 400 ? '이름을 1~20자로 적어 주세요.' : '지금 들어갈 수 없습니다. 잠시 뒤 다시 하세요.';
    } finally { btn.disabled = false; }
  });
  document.getElementById(store.get(K.last) ? 'wk-pw' : 'wk-name').focus();
}

// ---- 상황판 셈 (첫 화면 · 상황판 쪽 같은 규칙) ----
const workerOf = n => { n = String(n || '').trim(); if (n.startsWith('본부')) return '본부'; if (n.startsWith('센터')) return '센터'; return n.replace(/\(외주\)$/, ''); };
const stateOf = s => s === '끝' ? '끝' : s === '막힘' ? '막힘' : ['진행', '검증', '다음 날 진행'].includes(s) ? '진행' : '미확인';
const dayOf = d => String(d || '').split(' ')[0];
function days(rows) { const out = []; for (const r of rows) { const k = dayOf(r['날짜']); if (k && !out.includes(k)) out.push(k); } return out; }
function pickDay(rows) { const list = days(rows), t = todayKey(); return list.includes(t) ? t : list.at(-1) || null; }
// r3: 고른 주에 줄이 있는 작업자만 칸 · 통로 글만 있는 명의는 loose(「줄 없는 명의」 한 줄)
function workerRows(board, channel, day) {
  const rows = board?.body?.rows || [], names = new Map(), loose = [];
  const add = n => { if (!names.has(n)) names.set(n, {name: n, today: [], week: [], channel: null}); return names.get(n); };
  for (const r of rows) { const w = add(workerOf(r['작업자'])); w.week.push(r); if (dayOf(r['날짜']) === day) w.today.push(r); }
  for (const c of channel?.body?.workers || []) { const n = workerOf(c['명의']); if (names.has(n)) names.get(n).channel = c; else loose.push({name: n, channel: c}); }
  const order = n => { const i = WORKERS.indexOf(n); return i < 0 ? 100 : i; };
  const list = [...names.values()].sort((a, b) => order(a.name) - order(b.name) || a.name.localeCompare(b.name, 'ko'));
  list.loose = loose.sort((a, b) => order(a.name) - order(b.name) || a.name.localeCompare(b.name, 'ko'));
  const dayList = days(rows), di = dayList.indexOf(day);
  for (const w of list) {
    const st = w.today.map(r => stateOf(r['상태']));
    w.state = !st.length ? '미확인' : st.includes('막힘') ? '막힘' : st.includes('진행') ? '진행' : st.every(s => s === '끝') ? '끝' : '미확인';
    w.blocked = w.today.filter(r => stateOf(r['상태']) === '막힘');
    w.next = w.week.find(r => dayList.indexOf(dayOf(r['날짜'])) > di && stateOf(r['상태']) !== '끝') || w.today.find(r => stateOf(r['상태']) !== '끝') || null;
  }
  return list;
}

// r3: 통로 자료 기준 시각 · 30분 넘게 묵으면 「통로 시각 묵음」 · 「없음」 단정 금지
const STALE_MS = 30 * 60e3;
const chInfo = ch => { const at = ch?.body?.['올린시각'] || ch?.at || null, t = Date.parse(at);
  return {has: !!ch, at, stale: !!ch && (isNaN(t) || Date.now() - t > STALE_MS)}; };
const chHead = ch => { const i = chInfo(ch);
  return !i.has ? '<span class="wk-unk">통로 자료 아직 없음</span>' : '통로 #' + esc(ch.body['이슈']) + ' 기준 ' + stamp(i.at) +
    (i.stale ? ' <span class="wk-badge stop">통로 시각 묵음</span>' : ''); };
// 생산 줄 이름(자료로 받음 · 화면은 셈만): 작업자 + 앞으로 가운데 부터 ≤ 지금
function lineNames(line) { const g = line?.['생산줄']; if (!g || !Array.isArray(g['작업자'])) return null;
  return new Set([...g['작업자'], ...(g['앞으로'] || []).filter(a => Date.parse(a['부터']) <= Date.now()).map(a => a['작업자'])].map(workerOf)); }

// ---- 첫 화면 (r3: 두 구역 — 변형문항 생산 · 그 밖의 일) ----
async function home() {
  const zone = (k, title, owner, tiles) => '<section class="wk-zone" data-zone="' + k + '" aria-label="' + title + '"><div class="wk-zone-head"><h2>' + title + '</h2>' +
    '<p class="jb-help">임자 <b>' + owner + '</b> · <span class="wk-zone-at">읽는 중…</span></p></div><div class="wk-tiles">' + tiles + '</div></section>';
  main.innerHTML = '<div class="jb-head"><div><p class="jb-kicker">관리자</p><h1>무엇을 볼까요</h1></div></div><div class="wk-zones">' +
    zone('prod', '변형문항 생산', '맥GPT 창', tile('prod', '/work/prod/', '문항 생산관리', '공정 단계마다 쌓인 꾸러미 · 남은 것 · 병목 · 배치표입니다.') +
      tile('judge', '/work/judge/', '문항 눈판정', '문항을 보고 넷 중 하나로 판정합니다.')) +
    zone('other', '그 밖의 일', '본부', tile('board', '/work/board/', '작업자별 상황판', '작업자마다 오늘 일 · 상태 · 마지막 통로 글입니다.')) + '</div>';
  const set = (k, line, at) => { const el = document.querySelector('[data-tile="' + k + '"]'); el.querySelector('.wk-num').innerHTML = line; el.querySelector('.wk-at').textContent = at; };
  const zoneAt = (k, html) => { document.querySelector('[data-zone="' + k + '"] .wk-zone-at').innerHTML = html; };
  const fail = k => e => { if (e.status !== 401) set(k, '<span class="wk-bad">못 읽음</span>', '잠시 뒤 다시 엽니다'); };
  call('item-judge', 'menu').then(d => {
    let judged = 0, total = 0;
    for (const s of d.subjects || []) for (const b of s.books || []) { judged += b.judged || 0; total += b.total || 0; }
    set('judge', '판정 <b>' + num(judged) + '</b> / ' + num(total), '기준 ' + stamp(Date.now()) + ' 지금');
  }).catch(fail('judge'));
  call('work-board', 'prod').then(d => {
    const p = d.prod;
    zoneAt('prod', '생산 판 기준 ' + (p?.body?.['기준시각'] ? stamp(p.body['기준시각']) : UNK) + ' · 배치표 ' +
      (d.assign ? num((d.assign.body.rows || []).length) + '줄 · 올림 ' + stamp(d.assign.at) : UNK));
    if (!p) return set('prod', '<span class="wk-muted">아직 올라온 판 없음</span>', '센터1128 이 올리면 나옵니다');
    if (p.body['계약'] !== PROD_R2) return set('prod', '<span class="wk-muted">지난 꼴 판 — r2 로 다시</span>', '올림 ' + stamp(p.at));
    const k = prodCalc(p.body, d.assign);
    set('prod', '나온 <b>' + N(k.z['나온']) + '</b> / 넣은 ' + N(k.z['넣은']) + ' · 단계에 ' + N(k.z['단계에']),
      (k.necks.length ? '병목 ' + k.necks.join(' · ') : k.mostAt.length ? '가장 많이 쌓임 ' + k.mostAt.join(' · ') : '병목 미확인') + ' · 기준 ' + stamp(p.body['기준시각']));
  }).catch(e => { fail('prod')(e); if (e.status !== 401) zoneAt('prod', '<span class="wk-bad">못 읽음</span>'); });
  call('work-board', 'board').then(d => {
    zoneAt('other', '상황판 ' + (d.board ? '올림 ' + stamp(d.board.at) : UNK) + ' · ' + chHead(d.channel));
    if (!d.board) return set('board', '<span class="wk-muted">아직 올라온 판 없음</span>', '본부가 올리면 나옵니다');
    const day = pickDay(d.board.body.rows), list = workerRows(d.board, d.channel, day);
    set('board', '막힌 작업자 <b>' + list.filter(w => w.state === '막힘').length + '</b>명', esc(day || '') + ' 기준 · 올림 ' + stamp(d.board.at));
  }).catch(e => { fail('board')(e); if (e.status !== 401) zoneAt('other', '<span class="wk-bad">못 읽음</span>'); });
}
const tile = (k, href, title, help) => '<a class="wk-tile" data-tile="' + k + '" href="' + href + '"><h2>' + title + '</h2><p class="jb-help">' + help + '</p>' +
  '<p class="wk-num"><span class="wk-muted">읽는 중…</span></p><p class="wk-at"></p><span class="wk-go">열기 →</span></a>';

// ---- 작업자별 상황판 ----
const BADGE = {'진행': 'run', '끝': 'done', '막힘': 'stop', '미확인': 'unk'};
async function board() {
  const q = new URLSearchParams(location.hash.slice(1));
  let d;
  try { d = await call('work-board', 'board', q.get('week') ? {week: q.get('week')} : {}); }
  catch (e) { if (e.status !== 401) main.innerHTML = '<p class="wk-bad">상황판을 읽지 못했습니다(' + esc(e.status || '연결') + ').</p>'; return; }
  if (!d.board) { main.innerHTML = '<p class="jb-wait">아직 올라온 상황판이 없습니다.</p>'; return; }
  const rows = d.board.body.rows, dayList = days(rows), day = dayList.includes(q.get('day')) ? q.get('day') : pickDay(rows);
  const list = workerRows(d.board, d.channel, day);
  const weekSel = '<label class="wk-pick">주 <select id="wk-week">' + d.weeks.map(w => '<option value="' + esc(w.name) + '"' + (w.name === d.week ? ' selected' : '') + '>' +
    esc(w.label) + (w.current ? ' (지금)' : '') + '</option>').join('') + '</select></label>';
  const daySel = '<div class="jb-chips" role="group" aria-label="날">' + dayList.map(k => '<a class="jb-chip" href="#week=' + encodeURIComponent(d.week) + '&day=' + encodeURIComponent(k) + '"' +
    (k === day ? ' aria-current="true"' : '') + '>' + esc(k) + '</a>').join('') + '</div>';
  const ch = chInfo(d.channel), names = lineNames(d.line);
  const prodSet = names || new Set(), other = list.filter(w => !prodSet.has(w.name)), inLine = list.filter(w => prodSet.has(w.name));
  const group = (k, title, help, ws) => '<section class="wk-group" data-group="' + k + '"><h2 class="wk-h2">' + title + ' <small class="wk-muted">' + ws.length + '명</small></h2>' +
    (help ? '<p class="wk-note">' + help + '</p>' : '') + (ws.length ? '<div class="wk-workers">' + ws.map(w => workerCard(w, ch, k === 'line')).join('') + '</div>' : '<p class="wk-muted">이 주에 줄이 있는 작업자 없음</p>') + '</section>';
  const lineAt = d.line ? '배치표 ' + esc(d.line['파일'] || '') + ' 올림 ' + stamp(d.line.at) : '';
  const groups = names
    ? group('other', '그 밖', '임자 본부 · 상황판 CSV', other) + group('line', '생산 줄', '배치표에 이름이 있는 작업자 · ' + lineAt + ' · 생산 일은 생산관리 쪽에서', inLine)
    : group('all', '작업자', '생산 줄 나눔 ' + UNK + ' — ' + (d.line ? lineAt + ' 판에 생산줄 칸이 없음 · 배치표를 다시 올리면 나뉨' : '배치표 아직 올라오지 않음'), list);
  const loose = list.loose.length ? '<p class="wk-loose"><b>줄 없는 명의</b> <small class="wk-muted">이 주 상황판에 줄 없음 · 통로 글만</small> ' +
    list.loose.map(x => '<span class="wk-hand">' + esc(x.name) + ' ' + stamp(x.channel.at) + '</span>').join('') + '</p>' : '';
  main.innerHTML = '<div class="jb-head"><div><p class="jb-kicker">작업자별 상황판</p><h1>' + esc(d.board.body['이름표']) + '</h1>' +
    '<p class="jb-help">' + esc(day) + ' 기준 · 상황판 ' + esc(d.board.body.csv) + ' 올림 ' + stamp(d.board.at) + '</p></div><div class="jb-tools">' + weekSel + '</div></div>' + daySel +
    '<div class="wk-counts">' + ['진행', '끝', '막힘', '미확인'].map(s => '<span class="wk-badge ' + BADGE[s] + '">' + s + ' ' + list.filter(w => w.state === s).length + '</span>').join('') + '</div>' +
    '<p class="wk-chline">' + chHead(d.channel) + (ch.has ? ' · 7일 안 글만 셈' : '') + '</p>' + groups + loose;
  document.getElementById('wk-week').addEventListener('change', e => { location.hash = 'week=' + encodeURIComponent(e.target.value); });
}
function workerCard(w, ch, inLine) {
  const c = w.channel, line = r => '<li><span class="wk-badge ' + BADGE[stateOf(r['상태'])] + '">' + esc(r['상태'] || '미확인') + '</span> ' + esc(r['할일']) + '</li>';
  const none = !ch.has ? '<span class="wk-unk">통로 자료 없음</span>' : '<span class="wk-muted">7일 안 글 없음(기준 ' + stamp(ch.at) + ')</span>' + (ch.stale ? ' <span class="wk-badge stop">묵음</span>' : '');
  return '<article class="wk-worker ' + BADGE[w.state] + '" data-worker="' + esc(w.name) + '"><header><h2>' + esc(w.name) + '</h2><span class="wk-badge ' + BADGE[w.state] + '">' + w.state + '</span></header>' +
    '<p class="wk-meta">통로 마지막 글 ' + (c ? stamp(c.at) + (c['갈래'] ? ' · ' + esc(c['갈래']) : '') : none) + '</p>' +
    (w.today.length ? '<ul class="wk-list">' + w.today.map(line).join('') + '</ul>' : '<p class="wk-muted">이 날 적힌 일 없음</p>') +
    (w.blocked.length ? '<p class="wk-why"><b>막힘 까닭</b> ' + w.blocked.map(r => esc(r['근거'] || '적힌 까닭 없음')).join(' / ') + '</p>' : '') +
    '<p class="wk-next"><b>다음 일</b> ' + (w.next ? esc(w.next['날짜']) + ' · ' + esc(w.next['할일']) : '<span class="wk-muted">적힌 것 없음</span>') + '</p>' +
    (w.week.length ? '<details><summary>이 주 전체 ' + w.week.length + '줄</summary><table class="wk-table"><thead><tr><th>날</th><th>할 일</th><th>상태</th><th>표시</th><th>근거</th></tr></thead><tbody>' +
      w.week.map(r => '<tr><td>' + esc(r['날짜']) + '</td><td>' + esc(r['할일']) + '</td><td>' + esc(r['상태']) + '</td><td>' + esc(r['표시시각']) + '</td><td class="wk-src">' + esc(r['근거']) + '</td></tr>').join('') +
      '</tbody></table></details>' : '') +
    (inLine ? '<a class="jb-link wk-toprod" href="/work/prod/#w=' + encodeURIComponent(w.name) + '">생산관리에서 보기 →</a>' : '') + '</article>';
}

// ---- 문항 생산관리 (계약 생산관리-1128@r2 · 지시서 §0 · §2-2 · §2-3) ----
// 공장 계기판: 넣은 = 나온 + 단계에 + 반송 + 버림. 셈은 센터1128 몫 · 화면은 맞대기만. 없는 값은 「미확인」(0 으로 꾸미지 않음).
const PROD_R2 = '생산관리-1128@r2';
const STAGES = [['C1', '입력'], ['C2', '변형'], ['C3', '검증 · 해설 · 코드'], ['C4', '재확인 · 렌더'], ['등재', '대기'], ['C5', '최종'], ['C9', '반송']];
const STAGE_NAME = Object.fromEntries(STAGES);
const FLOW = ['C1', 'C2', 'C3', 'C4', '등재'];
const has = v => typeof v === 'number' && Number.isFinite(v);
const UNK = '<span class="wk-unk">미확인</span>';
const N = v => has(v) ? num(v) : UNK;
const minus = (a, b) => has(a) && has(b) ? a - b : undefined;
const total = list => list.length && list.every(has) ? list.reduce((x, y) => x + y, 0) : undefined;
const pct = (a, b) => has(a) && has(b) && b > 0 ? Math.max(0, Math.min(100, Math.round(a / b * 100))) : null;
const meter = p => '<span class="wk-meter' + (p === null ? ' unk' : '') + '" role="img" aria-label="' + (p === null ? '진행 미확인' : '진행 ' + p + '%') + '"><i style="width:' + (p || 0) + '%"></i></span>';
const wkOrder = n => { const i = WORKERS.indexOf(n); return i < 0 ? 100 : i; };
const byWorker = (a, b) => wkOrder(a) - wkOrder(b) || String(a).localeCompare(String(b), 'ko');
const B_STATE = {'대기': 'unk', '진행': 'run', '끝': 'done', '막힘': 'stop', '반송': 'stop', '쉼': 'unk', '미확인': 'unk'};

function assignNow(assign, at) { // 배치표: 언제부터 ≤ 지금 가운데 가장 늦은 줄이 지금 배치
  const cur = new Map();
  for (const r of assign?.body?.rows || []) {
    const t = Date.parse(r['언제부터']); if (isNaN(t) || t > at) continue;
    const o = cur.get(r['작업자']); if (!o || Date.parse(o['언제부터']) <= t) cur.set(r['작업자'], r);
  }
  return cur;
}
function prodCalc(b, assign) {
  const st = Object.fromEntries((b['공정'] || []).map(r => [r['단계'], r]));
  const z = b['잣대'] || {}, days = has(b['병목_날']) ? b['병목_날'] : 1;
  const gauges = [['문항', z], ...(b['잣대_꾸러미'] ? [['꾸러미', b['잣대_꾸러미']]] : [])].map(([unit, g]) => ({unit, g,
    gone: ['넣은', '나온', '단계에', '반송', '버림'].every(x => has(g[x])) ? g['넣은'] - g['나온'] - g['단계에'] - g['반송'] - g['버림'] : undefined,
    cross: [['단계에', total(FLOW.map(c => st[c]?.[unit]))], ['나온', st.C5?.[unit]], ['반송', st.C9?.[unit]]].filter(([x, v]) => has(g[x]) && has(v) && g[x] !== v)}));
  const gone = gauges[0].gone, cross = gauges[0].cross;
  const cur = assignNow(assign, Date.now()), wk = new Map((b['작업자'] || []).map(w => [w['작업자'], w]));
  const stages = STAGES.map(([c, name]) => {
    const r = st[c] || {}, leftB = minus(r['꾸러미'], r['끝_꾸러미']), leftQ = minus(r['문항'], r['끝_문항']), rate = r['하루_처리_꾸러미'];
    const flow = FLOW.includes(c), eta = flow && has(leftB) && has(rate) && rate > 0 ? Math.ceil(leftB / rate) : undefined;
    const crew = [...cur.values()].filter(a => a['단계'] === c).map(a => a['작업자']).sort(byWorker);
    return {c, name, r, leftB, leftQ, rate, flow, eta, neck: flow && has(leftB) && has(rate) && leftB > rate * days, crew};
  });
  const most = Math.max(0, ...stages.filter(s => s.flow && has(s.leftB)).map(s => s.leftB));
  for (const s of stages) s.most = s.flow && most > 0 && s.leftB === most;
  const necks = stages.filter(s => s.neck).map(s => s.c);
  return {st, z, gauges, gone, cross, cur, wk, stages, necks, mostAt: stages.filter(s => s.most).map(s => s.c), days};
}
const bundleTitle = r => r['제목'] ? esc(r['제목']) : (r['교재'] || r['단원']) ? [r['과목'], r['교재'], r['단원'], r['변형단계']].filter(Boolean).map(esc).join(' · ')
  : '<span class="wk-unk">제목 미확인</span>' + (r['과목'] ? ' · ' + esc(r['과목']) : '');
function independenceBroken(r) { // 지은 이(C2) ≠ 검증(C3) · 확인(C4) — 엔진 규칙을 화면이 다시 봄
  const who = {}; for (const h of r['넘김'] || []) if (h['받은이']) (who[h['단계']] ||= new Set()).add(h['받은이']);
  if (r['담당']) (who[r['공정']] ||= new Set()).add(r['담당']);
  return [...(who.C2 || [])].some(n => who.C3?.has(n) || who.C4?.has(n));
}

async function prod() {
  let d;
  try { d = await call('work-board', 'prod'); }
  catch (e) { if (e.status !== 401) main.innerHTML = '<p class="wk-bad">생산관리 판을 읽지 못했습니다(' + esc(e.status || '연결') + ').</p>'; return; }
  const p = d.prod, head = (h, help) => '<div class="jb-head"><div><p class="jb-kicker">문항 생산관리 · 변형문항 생성공장</p><h1>' + h + '</h1><p class="jb-help">' + help + '</p></div></div>';
  if (!p) { main.innerHTML = head('아직 올라온 판이 없습니다', '센터1128 이 계약 r2 꼴로 올리면 여기에 나옵니다.'); return; }
  const b = p.body;
  if (b['계약'] !== PROD_R2) { main.innerHTML = head('지난 꼴(' + esc(b['계약']) + ') 판입니다', '센터1128 이 계약 r2 꼴로 다시 올리면 공정 칸이 나옵니다 · 올림 ' + stamp(p.at)); return; }
  const k = prodCalc(b, d.assign), z = k.z, q = new URLSearchParams(location.hash.slice(1)), fs = q.get('s'), fw = q.get('w');
  const bundles = b['묶음'] || [], workers = [...(b['작업자'] || [])].sort((x, y) => byWorker(x['작업자'], y['작업자']));

  // 1 맨 위 잣대 (문항 · 있으면 꾸러미 한 줄 더)
  const gaugeOf = ({unit, g, gone, cross}) => { const gs = !has(gone) ? 'unk' : gone === 0 && !cross.length ? 'ok' : 'bad';
    return {gs, html: '<div class="wk-gline ' + gs + '"><p class="wk-eq"><em>' + unit + '</em><span>넣은 <b>' + N(g['넣은']) + '</b></span><i>=</i><span>나온 <b>' + N(g['나온']) + '</b></span><i>+</i>' +
      '<span>단계에 <b>' + N(g['단계에']) + '</b></span><i>+</i><span>반송 <b>' + N(g['반송']) + '</b></span><i>+</i><span>버림 <b>' + N(g['버림']) + '</b></span></p>' +
      '<p class="wk-gone">' + (gs === 'unk' ? '빠진 것 ' + UNK + ' — 잣대 칸이 모자라 셀 수 없음' : gone === 0 ? '빠진 것 <b>0</b> · 맞음' : '빠진 것 <b>' + num(gone) + '</b> · 맞지 않음') +
      (cross.length ? ' · <span class="wk-bad">공정 칸과 어긋남: ' + cross.map(([n, v]) => esc(n) + ' ' + num(g[n]) + ' ↔ 공정 ' + num(v)).join(' / ') + '</span>' : '') + '</p></div>'}; };
  const gl = k.gauges.map(gaugeOf), gState = gl.some(x => x.gs === 'bad') ? 'bad' : gl.every(x => x.gs === 'ok') ? 'ok' : gl[0].gs === 'ok' ? 'ok' : 'unk';
  const gauge = '<section class="wk-gauge ' + gState + '" aria-label="잣대">' + gl.map(x => x.html).join('') + '</section>';
  // 2 합계 한 줄
  const sums = [['꾸러미 전체', total(STAGES.map(([c]) => k.st[c]?.['꾸러미']))], ['문항 전체', z['넣은']], ['진행한 것', z['나온']], ['남은 것', total([z['단계에'], z['반송']])]];
  const sumLine = '<div class="wk-sum4">' + sums.map(([n, v]) => '<div><p class="jb-kicker">' + n + '</p><p class="wk-big">' + N(v) + '</p></div>').join('') + '</div>';
  // 3 공정 칸 (1순위)
  const crewLine = s => !s.crew.length ? '<span class="wk-unk">배치 미확인</span>' : s.crew.map(n => { const w = k.wk.get(n);
    return '<span class="wk-hand">' + esc(n) + (w?.['지금_꾸러미'] ? ' · ' + esc(w['지금_꾸러미']) : w?.['상태'] === '쉼' ? ' · 쉬는 중' : '') + '</span>'; }).join('');
  const stageCard = s => { const r = s.r, cls = ['wk-stage', s.c === 'C9' ? 'side' : '', s.neck ? 'neck' : s.most ? 'most' : '', fs === s.c ? 'on' : ''].filter(Boolean).join(' ');
    return '<a class="' + cls + '" href="#s=' + encodeURIComponent(s.c) + '" data-stage="' + esc(s.c) + '"' + (fs === s.c ? ' aria-current="true"' : '') + '>' +
      '<p class="wk-st-name"><b>' + esc(s.c) + '</b> ' + esc(s.name) + '</p>' +
      '<p class="wk-st-big"><b>' + N(r['꾸러미']) + '</b><small>꾸러미</small></p><p class="wk-st-q">문항 ' + N(r['문항']) + '</p>' +
      '<p class="wk-st-line">끝 ' + N(r['끝_꾸러미']) + ' · 남음 <b>' + N(s.leftB) + '</b> <small>꾸러미</small></p>' +
      '<p class="wk-st-line small">끝 ' + N(r['끝_문항']) + ' · 남음 ' + N(s.leftQ) + ' <small>문항</small></p>' + meter(pct(r['끝_문항'], r['문항'])) +
      (s.flow ? '<p class="wk-st-flag">' + (s.neck ? '<b>병목</b> · ' : s.most ? '<b>가장 많이 쌓임</b> · ' : '') +
        (has(s.eta) ? '이 속도면 ' + num(s.eta) + '일' : s.rate === 0 ? '하루 처리 0 · 끝나는 날 없음' : '하루 처리 ' + UNK) + '</p>' : s.c === 'C5' ? '<p class="wk-st-flag">나온 곳</p>' : '<p class="wk-st-flag">지은 이에게 되돌림</p>') +
      '<p class="wk-st-crew">' + crewLine(s) + '</p></a>'; };
  const flowRow = '<section class="wk-flow" aria-label="공정 단계">' + k.stages.filter(s => s.c !== 'C9').map(stageCard).join('<span class="wk-arrow" aria-hidden="true">→</span>') +
    '<span class="wk-arrow side" aria-hidden="true">↩</span>' + stageCard(k.stages.find(s => s.c === 'C9')) + '</section>' +
    '<p class="wk-note">병목 = 남은 꾸러미가 하루 처리 × ' + num(k.days) + '일보다 많음 · 등재 · C5 는 자동 넘김 밖(등재 게이트 창 집행) · 단계를 누르면 꾸러미 목록</p>';
  // 4 꾸러미 목록 (단계 또는 작업자를 눌렀을 때)
  let list = '';
  if (fs || fw) {
    const rows = bundles.filter(r => fs ? r['공정'] === fs : r['담당'] === fw), sumQ = total(rows.map(r => r['문항'])) || 0, stQ = fs ? k.st[fs]?.['문항'] : undefined;
    const wDone = fw ? k.wk.get(fw) : null;
    const title = fs ? esc(fs) + ' ' + esc(STAGE_NAME[fs] || '') : esc(fw) + ' 의 꾸러미';
    const check = fs && has(stQ) ? (stQ === sumQ ? '목록 문항 합 ' + num(sumQ) + ' · 공정 칸과 맞음' : '<span class="wk-bad">목록 합 어긋남: 목록 ' + num(sumQ) + ' ↔ 공정 칸 ' + num(stQ) + '</span>')
      : fw && has(wDone?.['문항']) ? (wDone['문항'] === sumQ ? '목록 문항 합 ' + num(sumQ) + ' · 작업자 칸과 맞음' : '<span class="wk-bad">목록 합 어긋남: 목록 ' + num(sumQ) + ' ↔ 작업자 칸 ' + num(wDone['문항']) + '</span>') : '목록 문항 합 ' + num(sumQ);
    const last = r => { const h = (r['넘김'] || []).at(-1); return h ? stamp(h['시각']) + ' · ' + esc(h['단계']) + (h['받은이'] ? ' → ' + esc(h['받은이']) : '') : UNK; };
    list = '<section class="jb-card wk-bundles" id="wk-bundles"><div class="jb-head"><div><h2>' + title + ' — 꾸러미 ' + num(rows.length) + '</h2><p class="jb-help">' + check + '</p></div>' +
      '<a class="jb-link" href="#">닫기</a></div>' + (rows.length ? '<table class="wk-table"><thead><tr><th>꾸러미</th><th>변형 단계</th><th>공정</th><th>문항</th><th>끝</th><th>담당</th><th>상태</th><th>들어온 날</th><th>넘어간 시각</th></tr></thead><tbody>' +
      rows.map(r => '<tr><td>' + bundleTitle(r) + ' <small class="wk-key">' + esc(r['묶음']) + '</small>' + (independenceBroken(r) ? ' <span class="wk-badge stop">독립 어긋남</span>' : '') + '</td>' +
        '<td>' + (r['변형단계'] ? esc(r['변형단계']) : UNK) + '</td><td>' + esc(r['공정']) + '</td><td>' + N(r['문항']) + '</td><td>' + N(r['끝']) + (r['막힘'] ? ' <span class="wk-badge stop">막힘 ' + num(r['막힘']) + '</span>' : '') + '</td>' +
        '<td>' + (r['담당'] ? esc(r['담당']) : UNK) + '</td><td><span class="wk-badge ' + (B_STATE[r['상태']] || 'unk') + '">' + esc(r['상태'] || '미확인') + '</span></td>' +
        '<td>' + (r['들어온날'] ? esc(r['들어온날']) : UNK) + '</td><td>' + last(r) +
        ((r['넘김'] || []).length > 1 ? '<details><summary>넘김 ' + r['넘김'].length + '</summary>' + r['넘김'].map(h => stamp(h['시각']) + ' · ' + esc(h['단계']) + (h['받은이'] ? ' → ' + esc(h['받은이']) : '')).join('<br>') + '</details>' : '') + '</td></tr>').join('') +
      '</tbody></table>' : '<p class="wk-muted">이 자리에 올라온 꾸러미 줄이 없습니다.</p>') + '</section>';
  }
  // 5 작업자 카드 (둘째) · 쉬는 손
  const wCard = w => { const n = w['작업자'], a = k.cur.get(n), leftB = minus(w['꾸러미'], w['끝_꾸러미']), leftQ = minus(w['문항'], w['끝_문항']);
    return '<a class="wk-wcard ' + (BADGE[w['상태']] || 'unk') + (fw === n ? ' on' : '') + '" href="#w=' + encodeURIComponent(n) + '">' +
      '<header><h3>' + esc(n) + '</h3><span class="wk-badge ' + (BADGE[w['상태']] || 'unk') + '">' + esc(w['상태']) + '</span></header>' +
      '<p class="wk-w-big"><b>' + N(w['꾸러미']) + '</b><small>꾸러미</small> <b>' + N(w['문항']) + '</b><small>문항</small></p>' +
      '<p class="wk-w-line">진행한 것 ' + N(w['끝_꾸러미']) + ' / ' + N(w['끝_문항']) + ' · 남은 것 <b>' + N(leftB) + '</b> / ' + N(leftQ) + '</p>' + meter(pct(w['끝_문항'], w['문항'])) +
      '<p class="wk-w-line small">지금 ' + (w['지금_꾸러미'] ? esc(w['지금_꾸러미']) : '<span class="wk-muted">없음</span>') + ' · 배치 ' + (a ? esc(a['단계']) : UNK) + ' · 마지막 ' + stamp(w['마지막']) + '</p>' +
      ((w['막힘'] || w['반송']) ? '<p class="wk-w-line">' + (w['막힘'] ? '<span class="wk-badge stop">막힘 ' + num(w['막힘']) + '</span> ' : '') + (w['반송'] ? '<span class="wk-badge stop">반송 ' + num(w['반송']) + '</span>' : '') + '</p>' : '') + '</a>'; };
  const resting = [...new Set([...[...k.cur.values()].filter(a => a['단계'] === '쉼').map(a => a['작업자']), ...workers.filter(w => w['상태'] === '쉼').map(w => w['작업자'])])].sort(byWorker);
  const unplaced = workers.map(w => w['작업자']).filter(n => !k.cur.has(n));
  const at = d.assign ? '배치표 ' + esc(d.assign.body['파일'] || '') + ' · ' + num((d.assign.body.rows || []).length) + '줄 · 올림 ' + stamp(d.assign.at) : '배치표 아직 올라오지 않음 — 배치 미확인';
  const hands = '<section class="wk-rest"><p><b>쉬는 손</b> ' + (resting.length ? resting.map(n => '<span class="wk-hand">' + esc(n) + '</span>').join('') : d.assign ? '<span class="wk-muted">없음</span>' : UNK) + '</p>' +
    (unplaced.length && d.assign ? '<p class="small"><b>배치표에 없는 작업자</b> ' + unplaced.map(n => '<span class="wk-hand unk">' + esc(n) + '</span>').join('') + '</p>' : '') + '<p class="wk-note">' + at + ' · 배치 고침은 본부 · 센터 · 형 말로(화면은 읽기만)</p></section>';
  const crew = '<section><h2 class="wk-h2">작업자</h2>' + (workers.length ? '<div class="wk-wcards">' + workers.map(wCard).join('') + '</div>' : '<p class="wk-muted">작업자 줄 ' + UNK + '</p>') + hands + '</section>';
  // 6 날별 · 표 (접어 둠)
  const daily = b['날별'] || [], dmax = Math.max(1, ...daily.flatMap(r => Object.values(r['값'] || {})));
  const folded = (daily.length ? '<details class="jb-card wk-fold"><summary>날별 끝낸 문항 ' + daily.length + '일</summary><table class="wk-table"><thead><tr><th>날짜</th>' + STAGES.map(([c]) => '<th>' + esc(c) + '</th>').join('') + '</tr></thead><tbody>' +
      daily.map(r => '<tr><td>' + esc(r['날짜']) + '</td>' + STAGES.map(([c]) => { const v = r['값']?.[c]; return '<td>' + (has(v) ? '<span class="wk-bar" style="width:' + Math.round(v / dmax * 100) + '%"></span>' + num(v) : UNK) + '</td>'; }).join('') + '</tr>').join('') +
      '</tbody></table></details>' : '') +
    (b['표'] || []).map(t => '<details class="jb-card wk-fold"><summary>' + esc(t['제목']) + '</summary><table class="wk-table"><thead><tr>' + t['머리'].map(h => '<th>' + esc(h) + '</th>').join('') + '</tr></thead><tbody>' +
      t['줄'].map(r => '<tr>' + r.map(v => '<td>' + esc(v) + '</td>').join('') + '</tr>').join('') + '</tbody></table></details>').join('');

  const rg = b['범위'] || {};
  main.innerHTML = head('기준 ' + stamp(b['기준시각']), '자료 시각 ' + (rg['자료시각'] ? stamp(rg['자료시각']) : UNK) + ' · 범위 ' + (rg['자리'] ? esc(rg['자리']) : UNK) + ' · ' +
      (rg['부터'] ? esc(rg['부터']) : '처음') + ' ~ ' + stamp(rg['까지']) + '<br>지은이 ' + esc(b['지은이']) + ' · 올림 ' + stamp(p.at) + ' · 원문 · 정답 · 분류 코드는 싣지 않습니다') +
    gauge + sumLine + flowRow + list + crew + folded;
  if (fs || fw) document.getElementById('wk-bundles')?.scrollIntoView({block: 'nearest'});
}

const VIEWS = {home, board, prod};
function start() {
  if (!session()) return showLogin();
  showNav();
  (VIEWS[PAGE] || home)();
}
window.addEventListener('hashchange', () => { if (session() && PAGE !== 'home') start(); });
start();
})();
