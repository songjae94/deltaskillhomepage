/* 관리자 페이지 /work/ (2026-11-28 · r5 등급). 첫 화면 · 문항 생산관리 · 작업자별 상황판 · 회사 전체 할 일 · 접속 기록.
   r5: who = the homepage member login (localStorage ds_tk, sent as is to work-board). The server checks the member and the
   grade table on every request and answers only what that grade may see; the menu and tiles are drawn from the page list the
   server returns (`me`), so names of pages a grade cannot open never reach that screen. Holds no password, item text, answer,
   code, grade table or person name. The judge-board token (localStorage dsj.token) is handed out by work-board `me`.
   Everything from the server is drawn as text (escaped), never as HTML. */
(() => {
'use strict';
const LOCAL = ['localhost', '127.0.0.1', '[::1]'].includes(location.hostname);
const FN = LOCAL ? '/functions/v1/' : 'https://cvlrphtupjmaefahodgz.supabase.co/functions/v1/';
const K = {token: 'dsj.token'};
const memberToken = () => { try { return (window.DSAuth ? window.DSAuth.get() : localStorage.getItem('ds_tk')) || ''; } catch { return ''; } };
const PAGE_KEY = {home: 'home', board: 'board', prod: 'prod', all: 'company', log: 'log'};
let ME = null; // 서버가 준 나: 표시 이름 · 등급 · 허락된 쪽
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

// ---- session: member token → work-board (등급 가름은 서버) · judge token → item-judge ----
function session() { const s = store.get(K.token); if (s && s.exp > Date.now() && s.token) return s; store.del(K.token); return null; }
class ApiError extends Error { constructor(status, body, handled = false) { super(body?.error || 'unavailable'); this.status = status; this.body = body; this.handled = handled; } }
async function call(fn, action, body = {}) {
  const t = fn === 'work-board' ? memberToken() : session()?.token;
  const r = await fetch(FN + fn, {method: 'POST', credentials: 'omit', cache: 'no-store',
    headers: {'Content-Type': 'application/json', ...(t ? {Authorization: 'Bearer ' + t} : {})}, body: JSON.stringify({action, ...body})});
  let data = null; try { data = await r.json(); } catch {}
  if (r.status === 401) { if (fn === 'item-judge') store.del(K.token); else { ME = null; store.del(K.token); showLogin(); } throw new ApiError(401, data, fn === 'work-board'); }
  if (r.status === 403 && fn === 'work-board') { if (action === 'me') { ME = null; store.del(K.token); } showDenied(action === 'me'); throw new ApiError(403, data, true); }
  if (r.status === 429 && fn === 'work-board') { showDenied(false, true); throw new ApiError(429, data, true); }
  if (!r.ok) throw new ApiError(r.status, data);
  return data;
}
const NAV_SHORT = {home: '첫 화면', judge: '눈판정', prod: '생산관리', board: '상황판', company: '총괄', log: '기록'};
const allowed = page => !!ME && ME.pages.some(p => p.page === page);

function showNav() {
  const nav = document.querySelector('.jb-nav'), who = document.getElementById('wk-who');
  nav.querySelectorAll('a').forEach(a => a.remove());
  nav.hidden = !ME;
  if (!ME) { who.textContent = ''; return; }
  for (const p of ME.pages) if (p.href) { const a = document.createElement('a'); a.href = p.href; a.textContent = NAV_SHORT[p.page] || p.title; nav.insertBefore(a, who); }
  who.textContent = ME.label + ' · ' + ME.grade;
}
document.getElementById('wk-out').addEventListener('click', () => {
  ME = null; store.del(K.token);
  if (!LOCAL && window.DSAuth?.logout) window.DSAuth.logout(); else { try { localStorage.removeItem('ds_tk'); } catch {} showLogin(); }
});
const loginHref = () => '/auth/?next=' + encodeURIComponent(location.pathname + location.search + location.hash);
function showDenied(account, locked = false) {
  showNav();
  main.innerHTML = '<section class="jb-card jb-login" data-denied="' + (locked ? 'locked' : account ? 'account' : 'page') + '"><p class="jb-kicker">델타스킬 관리자</p><h1>관리자 페이지</h1><p class="jb-help">' +
    (locked ? '요청이 여러 번 거부되어 잠시 막혔습니다. 15분 뒤 다시 여세요.' : account ? '이 계정은 관리자 등급 표에 없습니다. 등급이 필요하면 관리자에게 알려 주세요.' : '이 쪽을 볼 등급이 아닙니다.') +
    '</p>' + (account || locked ? '' : '<p><a class="jb-primary" href="/work/">관리자 첫 화면</a></p>') + '</section>';
}

function showLogin() {
  ME = null; showNav();
  main.innerHTML = '<section class="jb-card jb-login"><p class="jb-kicker">델타스킬 관리자</p><h1>관리자 페이지</h1>' +
    '<p class="jb-help">홈페이지 회원으로 로그인하면 등급에 맞는 쪽이 열립니다.</p>' +
    '<p><a class="jb-primary" id="wk-member-login" href="' + esc(loginHref()) + '">홈페이지 회원 로그인</a></p></section>';
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
  const pg = k => ME.pages.find(p => p.page === k), t = k => pg(k) ? tile(k, pg(k).href, pg(k).title, pg(k).help) : '';
  const prodTiles = t('prod') + t('judge'), otherTiles = t('board') + t('log');
  main.innerHTML = '<div class="jb-head"><div><p class="jb-kicker">관리자 · ' + esc(ME.grade) + '</p><h1>무엇을 볼까요</h1></div></div>' + (allowed('company') ? coZone() : '') + '<div class="wk-zones">' +
    (prodTiles ? zone('prod', allowed('prod') ? '변형문항 생산' : '내 일', '맥GPT 창', prodTiles) : '') +
    (otherTiles ? zone('other', '그 밖의 일', '본부', otherTiles) : '') + '</div>' +
    (allowed('mine') ? '<section class="jb-card wk-mine" data-mine><h2 class="wk-h2">내 몫</h2><p class="jb-help">들어온 이름 <b>' + esc(ME.label) + '</b> · 등급 <b>' + esc(ME.grade) +
      '</b> · 눈판정에 남기는 판정은 이 이름으로 적힙니다.</p></section>' : '');
  const set = (k, line, at) => { const el = document.querySelector('[data-tile="' + k + '"]'); el.querySelector('.wk-num').innerHTML = line; el.querySelector('.wk-at').textContent = at; };
  const zoneAt = (k, html) => { document.querySelector('[data-zone="' + k + '"] .wk-zone-at').innerHTML = html; };
  const fail = k => e => { if (!e.handled && e.status !== 401) set(k, '<span class="wk-bad">못 읽음</span>', '잠시 뒤 다시 엽니다'); };
  if (!allowed('prod')) document.querySelector('[data-zone="prod"] .jb-help')?.remove(); // 검토자: 임자 · 생산 기준 줄 없이 눈판정 칸만
  if (allowed('log')) set('log', '<span class="wk-muted">기록 보기</span>', '경영진만 · 열면 최근 200줄');
  if (allowed('company')) coHome();
  if (allowed('judge')) call('item-judge', 'menu').then(d => {
    let judged = 0, total = 0;
    for (const s of d.subjects || []) for (const b of s.books || []) { judged += b.judged || 0; total += b.total || 0; }
    set('judge', '판정 <b>' + num(judged) + '</b> / ' + num(total), '기준 ' + stamp(Date.now()) + ' 지금');
  }).catch(fail('judge'));
  if (allowed('prod')) call('work-board', 'prod').then(d => {
    const p = d.prod;
    zoneAt('prod', '생산 판 기준 ' + (p?.body?.['기준시각'] ? stamp(p.body['기준시각']) : UNK) + ' · 배치표 ' +
      (d.assign ? num((d.assign.body.rows || []).length) + '줄 · 올림 ' + stamp(d.assign.at) : UNK));
    if (!p) return set('prod', '<span class="wk-muted">아직 올라온 판 없음</span>', '센터1128 이 올리면 나옵니다');
    if (p.body['계약'] !== PROD_R2) return set('prod', '<span class="wk-muted">지난 꼴 판 — r2 로 다시</span>', '올림 ' + stamp(p.at));
    const k = prodCalc(p.body, d.assign);
    set('prod', '나온 <b>' + N(k.z['나온']) + '</b> / 넣은 ' + N(k.z['넣은']) + ' · 단계에 ' + N(k.z['단계에']),
      (k.necks.length ? '병목 ' + k.necks.join(' · ') : k.mostAt.length ? '가장 많이 쌓임 ' + k.mostAt.join(' · ') : '병목 미확인') + ' · 기준 ' + stamp(p.body['기준시각']));
  }).catch(e => { fail('prod')(e); if (!e.handled) zoneAt('prod', '<span class="wk-bad">못 읽음</span>'); });
  if (allowed('board')) call('work-board', 'board').then(d => {
    zoneAt('other', '상황판 ' + (d.board ? '올림 ' + stamp(d.board.at) : UNK) + ' · ' + chHead(d.channel));
    if (!d.board) return set('board', '<span class="wk-muted">아직 올라온 판 없음</span>', '본부가 올리면 나옵니다');
    const day = pickDay(d.board.body.rows), list = workerRows(d.board, d.channel, day);
    set('board', '막힌 작업자 <b>' + list.filter(w => w.state === '막힘').length + '</b>명', esc(day || '') + ' 기준 · 올림 ' + stamp(d.board.at));
  }).catch(e => { fail('board')(e); if (!e.handled) zoneAt('other', '<span class="wk-bad">못 읽음</span>'); });
}
const tile = (k, href, title, help) => '<a class="wk-tile" data-tile="' + k + '" href="' + href + '"><h2>' + title + '</h2><p class="jb-help">' + help + '</p>' +
  '<p class="wk-num"><span class="wk-muted">읽는 중…</span></p><p class="wk-at"></p><span class="wk-go">열기 →</span></a>';

// ---- 작업자별 상황판 ----
const BADGE = {'진행': 'run', '끝': 'done', '막힘': 'stop', '미확인': 'unk'};
async function board() {
  const q = new URLSearchParams(location.hash.slice(1));
  let d;
  try { d = await call('work-board', 'board', q.get('week') ? {week: q.get('week')} : {}); }
  catch (e) { if (!e.handled) main.innerHTML = '<p class="wk-bad">상황판을 읽지 못했습니다(' + esc(e.status || '연결') + ').</p>'; return; }
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
  catch (e) { if (!e.handled) main.innerHTML = '<p class="wk-bad">생산관리 판을 읽지 못했습니다(' + esc(e.status || '연결') + ').</p>'; return; }
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

// ---- r4 · 회사 전체 할 일 (계약 회사할일-1128@r1 · 첫 화면 맨 위 구역 · /work/all/) ----
// 자료 = 본부의 회사할일_총괄.csv 를 --총괄 로 올린 판(kind board · name company). 화면은 세고 거를 뿐 · 글은 글로만.
const CO_R1 = '회사할일-1128@r1';
const CO_ALL = ['지금 제공하는 서비스', '다음에 추가할 서비스', '강사용 서비스', '교재 만들기', '홍보 · 마케팅', '내부 관리', '회계 관리'];
const DIR_R1 = '회사방향-1128@r1', RULE_R1 = '회사원칙-1128@r1';
const LAYERS = ['방향', '중점', '지금 집중', '다음'], RULE_STATES = ['있음', '고침 필요', '없음'], RULE_BADGE = {'있음': 'done', '고침 필요': 'run', '없음': 'stop'};
const CO_OUT = '갈래 밖';
let CO_GROUPS = CO_ALL; // r5: 「회계 관리」 갈래는 accounting 쪽이 허락된 등급만(자료는 서버가 이미 걸러 냄)
const CO_STATES = ['운영', '진행', '준비', '멈춤', '미정', '끝'];
const CO_CLS = {'운영': 'op', '진행': 'run', '준비': 'prep', '멈춤': 'stop', '미정': 'und', '끝': 'done'};
const CO_BADGE = {'운영': 'done', '진행': 'run', '준비': 'run', '멈춤': 'stop', '미정': 'unk', '끝': 'done'};
const coKey = g => String(g || '').replace(/\s+/g, '');
const kstToday = () => { const t = new Date().toLocaleString('sv-SE', {timeZone: 'Asia/Seoul'}).slice(0, 10).split('-').map(Number); return Date.UTC(t[0], t[1] - 1, t[2]); };
// MM-DD 에는 해가 없음: 오늘에서 반년 안쪽 해로 읽음(12-30 ↔ 01-02 넘어가는 때도 맞음)
function coDate(mmdd, today = kstToday()) {
  const m = /^(\d{2})-(\d{2})$/.exec(mmdd || ''); if (!m) return null;
  const y = new Date(today).getUTCFullYear(), half = 183 * 864e5;
  let d = Date.UTC(y, m[1] - 1, m[2]); if (d - today > half) d = Date.UTC(y - 1, m[1] - 1, m[2]); else if (today - d > half) d = Date.UTC(y + 1, m[1] - 1, m[2]);
  return d;
}
function coRows(body) {
  const today = kstToday(), gi = Object.fromEntries(CO_GROUPS.map(g => [coKey(g), g]));
  return (body?.rows || []).map(r => { const due = coDate(r['기한'], today);
    return {...r, g: gi[coKey(r['갈래'])] || CO_OUT, late: due !== null && due < today && r['상태'] !== '끝' && r['상태'] !== '운영', unk: r['임자'] === '미상', und: r['상태'] === '미정'}; });
}
const coGroups = rows => [...CO_GROUPS, ...(rows.some(r => r.g === CO_OUT) ? [CO_OUT] : [])];
const coCount = (rows, st) => rows.filter(r => r['상태'] === st).length;
const coSvc = rows => [...new Set(rows.map(r => r['서비스']))];
const coLatest = rows => { let best = null, at = null; for (const r of rows) { const d = coDate(r['고친날']); if (d !== null && (at === null || d > at)) { at = d; best = r['고친날']; } } return best; };
const coBand = rows => '<span class="wk-band" role="img" aria-label="' + CO_STATES.map(s => s + ' ' + coCount(rows, s)).join(' · ') + '">' +
  CO_STATES.map(s => { const n = coCount(rows, s); return n ? '<i class="s-' + CO_CLS[s] + '" style="flex:' + n + '"></i>' : ''; }).join('') + '</span>';
const coHeadAt = c => '목록 ' + esc(c.body['파일'] || '') + ' · 줄 ' + num((c.body.rows || []).length) + ' · 최근 고친날 ' + (coLatest(c.body.rows || []) ? esc(coLatest(c.body.rows || [])) : UNK) + ' · 올림 ' + stamp(c.at);
const coFail = e => e.status === 400 ? '총괄 자료 길 아직 없음 — work-board 판 4 배포 뒤 나옵니다' : '못 읽음 — 잠시 뒤 다시 엽니다';

function coZone() {
  return '<section class="wk-co" aria-label="회사 전체 할 일"><div class="wk-co-head"><div><h2>회사 전체 할 일</h2><p class="jb-help">임자 <b>본부</b> · <span class="wk-co-at">읽는 중…</span></p></div>' +
    '<a class="wk-toprod" href="/work/all/">모두 보기 →</a></div><p class="wk-co-focus"><b>지금 집중</b> <span class="wk-muted">읽는 중…</span></p><div class="wk-co-cells">' +
    CO_GROUPS.map((g, i) => '<a class="wk-co-cell" data-co="' + i + '" href="/work/all/#g=' + i + '"><h3>' + esc(g) + '</h3><p class="wk-co-num"><span class="wk-muted">읽는 중…</span></p><p class="wk-co-line"></p></a>').join('') +
    '</div><p class="wk-co-flags"></p></section>';
}
function coHome() {
  const at = html => { const el = document.querySelector('.wk-co-at'); if (el) el.innerHTML = html; };
  const cells = (num1, line) => document.querySelectorAll('.wk-co-cell').forEach(el => { el.querySelector('.wk-co-num').innerHTML = num1; el.querySelector('.wk-co-line').innerHTML = line; });
  call('work-board', 'company').then(d => {
    const c = d.company;
    if (!c) { at(UNK); document.querySelector('.wk-co-focus').innerHTML = '<b>지금 집중</b> ' + coFocus(d.dir); return cells('<span class="wk-muted">아직 올라온 목록 없음</span>', '본부가 올리면 나옵니다'); }
    if (c.body['계약'] !== CO_R1) { at('올림 ' + stamp(c.at)); return cells('<span class="wk-muted">지난 꼴 목록</span>', esc(CO_R1) + ' 로 다시'); }
    const rows = coRows(c.body);
    at(coHeadAt(c));
    document.querySelector('.wk-co-focus').innerHTML = '<b>지금 집중</b> ' + coFocus(d.dir);
    document.querySelectorAll('.wk-co-cell').forEach(el => {
      const rs = rows.filter(r => r.g === CO_GROUPS[Number(el.dataset.co)]), stop = coCount(rs, '멈춤');
      el.querySelector('.wk-co-num').innerHTML = '서비스 <b>' + num(coSvc(rs).length) + '</b>';
      el.querySelector('.wk-co-line').innerHTML = '진행 <b>' + num(coCount(rs, '진행')) + '</b> · 멈춤 <b' + (stop ? ' class="stop"' : '') + '>' + num(stop) + '</b> · 미정 <b>' + num(coCount(rs, '미정')) + '</b>';
    });
    const out = rows.filter(r => r.g === CO_OUT).length;
    document.querySelector('.wk-co-flags').innerHTML = '<a class="wk-badge stop" href="/work/all/#v=late">기한 지난 줄 ' + num(rows.filter(r => r.late).length) + '</a>' +
      '<a class="wk-badge unk" href="/work/all/#v=unk">임자 미상 ' + num(rows.filter(r => r.unk).length) + '</a><a class="wk-badge unk" href="/work/all/#v=und">미정 ' + num(rows.filter(r => r.und).length) + '</a>' +
      (out ? '<a class="wk-badge stop" href="/work/all/#g=' + CO_GROUPS.length + '">갈래 밖 ' + num(out) + '</a>' : '');
  }).catch(e => { if (!e.handled) { at('<span class="wk-bad">' + coFail(e) + '</span>'); cells('<span class="wk-bad">못 읽음</span>', ''); document.querySelector('.wk-co-focus').innerHTML = '<b>지금 집중</b> ' + UNK; } });
}

const okDoc = (doc, ver) => doc && doc.body?.['계약'] === ver;
const dirRows = dir => okDoc(dir, DIR_R1) ? (dir.body.rows || []) : [];
function coFocus(dir) {
  if (!dir) return UNK + ' <span class="wk-muted">— 방향 목록이 올라오면 나옵니다</span>';
  if (!okDoc(dir, DIR_R1)) return '<span class="wk-muted">지난 꼴 방향 목록 — ' + esc(DIR_R1) + ' 로 다시</span>';
  const f = dirRows(dir).filter(r => r['층'] === '지금 집중');
  return f.length ? f.map(r => '<span class="wk-hand">' + esc(r['제목']) + '</span>').join(' ') : UNK + ' <span class="wk-muted">— 지금 집중 줄 없음</span>';
}
const ruleRows = rule => okDoc(rule, RULE_R1) ? (rule.body.rows || []) : [];

async function all() {
  const q = new URLSearchParams(location.hash.slice(1));
  let d;
  try { d = await call('work-board', 'company'); }
  catch (e) { if (!e.handled) main.innerHTML = '<p class="wk-bad">회사 할 일 목록을 읽지 못했습니다 — ' + (e.status === 400 ? coFail(e) : esc(e.status || '연결')) + '</p>'; return; }
  const c = d.company;
  if (!c) { main.innerHTML = '<p class="jb-wait">아직 올라온 회사 할 일 목록이 없습니다. 본부가 올리면 나옵니다.</p>'; return; }
  if (c.body['계약'] !== CO_R1) { main.innerHTML = '<p class="wk-bad">지난 꼴 목록(올림 ' + stamp(c.at) + ') — ' + esc(CO_R1) + ' 로 다시 올려야 보입니다.</p>'; return; }
  const rows = coRows(c.body), groups = coGroups(rows), dirs = dirRows(d.dir), rules = ruleRows(d.rule);
  const gOf = g => { const k = coKey(g); return CO_GROUPS.find(x => coKey(x) === k) || (k === '전체' ? '전체' : CO_OUT); };
  const owners = [...new Set(rows.map(r => r['임자']))].sort(byWorker);
  const f = {p: q.get('p') || '', dp: q.get('dp') || '', g: q.get('g') || '', o: q.get('o') || '', s: q.get('s') || '', v: q.get('v') || '', rs: q.get('rs') || ''};
  if (f.p !== 'rule') f.p = ''; if (!['big', 'plan'].includes(f.dp)) f.dp = '';
  if (!/^\d+$/.test(f.g) || Number(f.g) >= groups.length) f.g = ''; if (!owners.includes(f.o)) f.o = ''; if (!CO_STATES.includes(f.s)) f.s = ''; if (!['late', 'unk', 'und'].includes(f.v)) f.v = ''; if (!RULE_STATES.includes(f.rs)) f.rs = '';
  const href = patch => '#' + new URLSearchParams(Object.entries({...f, ...patch}).filter(([, x]) => x !== '')).toString();
  const sel = (id, label, cur, opts) => '<label class="wk-pick">' + label + ' <select id="' + id + '"><option value="">전체</option>' +
    opts.map(([v, t]) => '<option value="' + esc(v) + '"' + (String(v) === String(cur) ? ' selected' : '') + '>' + esc(t) + '</option>').join('') + '</select></label>';
  const chipRow = (label, list, cur, key) => '<div class="jb-chips" role="group" aria-label="' + label + '">' + list.map(([v, t]) => '<a class="jb-chip" data-' + key + '="' + (v || 'all') + '" href="' + href({[key]: v}) + '"' +
    (cur === v ? ' aria-current="true"' : '') + '>' + t + '</a>').join('') + '</div>';
  // 큰 그림 띠(방향 → 중점 → 지금 집중 → 다음) · 옆에 없는 매뉴얼 수
  const noRule = rules.filter(r => r['상태'] === '없음').length, fixRule = rules.filter(r => r['상태'] === '고침 필요').length;
  const dirItem = r => '<li><b>' + esc(r['제목']) + '</b>' + (r['갈래'] && r['갈래'] !== '전체' ? ' <small class="wk-muted">' + esc(r['갈래']) + '</small>' : '') +
    (r['기간'] ? ' <small class="wk-muted">' + esc(r['기간']) + '</small>' : '') + ' <span class="wk-badge ' + (CO_BADGE[r['상태']] || 'unk') + '">' + esc(r['상태']) + '</span>' +
    (r['내용'] ? '<br><small>' + esc(r['내용']) + '</small>' : '') + '</li>';
  const big = '<section class="wk-big-band" aria-label="큰 그림"><div class="wk-layers">' + LAYERS.map((L, i) => { const rs = dirs.filter(r => r['층'] === L);
      return '<div class="wk-layer" data-layer="' + esc(L) + '"><p class="jb-kicker">' + (i ? '→ ' : '') + esc(L) + '</p>' + (rs.length ? '<ul>' + rs.map(dirItem).join('') + '</ul>' : '<p class="wk-muted">' + UNK + ' — 형 말이 적힌 줄 없음</p>') + '</div>'; }).join('') + '</div>' +
    '<aside class="wk-rule-sum"><p class="jb-kicker">원칙 · 매뉴얼</p>' + (d.rule && okDoc(d.rule, RULE_R1) ? '<a class="wk-big-n" href="' + href({p: 'rule', rs: '없음'}) + '">없는 매뉴얼 <b>' + num(noRule) + '</b></a><p class="wk-muted">고침 필요 ' + num(fixRule) + ' · 전체 ' + num(rules.length) + '</p>' : '<p>' + UNK + '</p>') +
    '</aside><p class="wk-note">' + (d.dir ? '방향 ' + esc(d.dir.body?.['파일'] || '') + ' · 올림 ' + stamp(d.dir.at) + (okDoc(d.dir, DIR_R1) ? '' : ' · <span class="wk-bad">지난 꼴</span>') : '방향 목록 아직 올라오지 않음') +
    (d.rule ? ' · 원칙 ' + esc(d.rule.body?.['파일'] || '') + ' · 올림 ' + stamp(d.rule.at) + (okDoc(d.rule, RULE_R1) ? '' : ' · <span class="wk-bad">지난 꼴</span>') : ' · 원칙 목록 아직 올라오지 않음') + '</p></section>';
  const modes = chipRow('보기', [['', '할 일'], ['rule', '원칙 · 매뉴얼']], f.p, 'p');
  const headTxt = '<div class="jb-head"><div><p class="jb-kicker">관리자 · 임자 본부</p><h1>회사 전체 할 일</h1><p class="jb-help">' + coHeadAt(c) +
    '<br>원문 · 정답 · 학생 정보 · 금액 숫자 · 문서 본문은 싣지 않습니다 · 고침은 본부가 목록 CSV 로(화면은 읽기만)</p></div>';
  if (f.p === 'rule') return allRules();
  // 할 일 보기 — 깊이: 큰 그림만 / 갈래별 세부계획 / 할 일 줄까지
  const depth = chipRow('보는 깊이', [['big', '큰 그림만'], ['plan', '갈래별 세부계획'], ['', '할 일 줄까지']], f.dp, 'dp');
  const keep = r => (!f.o || r['임자'] === f.o) && (!f.s || r['상태'] === f.s) && (!f.v || r[f.v]);
  const narrowed = !!(f.o || f.s || f.v);
  const tools = '<div class="jb-tools wk-co-tools">' + sel('co-g', '갈래', f.g, groups.map((g, i) => [i, g])) + (f.dp ? '' : sel('co-o', '임자', f.o, owners.map(o => [o, o])) + sel('co-s', '상태', f.s, CO_STATES.map(s => [s, s]))) + '</div>';
  const pool = rows.filter(r => f.g === '' || r.g === groups[f.g]);
  const views = [['', '모두 ' + num(pool.length)], ['late', '기한 지난 줄 ' + num(pool.filter(r => r.late).length)], ['unk', '임자 미상 ' + num(pool.filter(r => r.unk).length)], ['und', '미정 ' + num(pool.filter(r => r.und).length)]];
  const shownAll = pool.filter(keep);
  const counts = '<div class="wk-counts">' + CO_STATES.map(s => '<a class="wk-badge ' + CO_BADGE[s] + '" href="' + href({s: f.s === s ? '' : s}) + '"' + (f.s === s ? ' aria-current="true"' : '') + '>' + s + ' ' + num(coCount(shownAll, s)) + '</a>').join('') +
    '<span class="wk-co-shown">맞는 줄 <b>' + num(shownAll.length) + '</b> / ' + num(rows.length) + '</span></div>';
  const row = r => '<tr data-id="' + esc(r.id) + '"' + (r.late ? ' class="late"' : '') + '><td>' + esc(r['할일']) + '</td><td>' + (r.unk ? '<span class="wk-unk">미상</span>' : esc(r['임자'])) + '</td>' +
    '<td><span class="wk-badge ' + (CO_BADGE[r['상태']] || 'unk') + '">' + esc(r['상태']) + '</span></td><td>' + (r['다음걸음'] ? esc(r['다음걸음']) : '<span class="wk-muted">—</span>') + '</td>' +
    '<td>' + (r['기한'] ? esc(r['기한']) : '<span class="wk-muted">—</span>') + (r.late ? ' <span class="wk-badge stop">기한 지남</span>' : '') + '</td><td class="wk-src">' + esc(r['근거']) + '</td></tr>';
  const svcBlock = (svc, shown, allOf) => '<details class="wk-svc" data-svc="' + esc(svc) + '" open><summary><b>' + esc(svc) + '</b>' + coBand(allOf) +
    '<small class="wk-muted">' + CO_STATES.filter(s => coCount(allOf, s)).map(s => s + ' ' + coCount(allOf, s)).join(' · ') + (narrowed ? ' · 맞는 줄 ' + shown.length + ' / ' + allOf.length : '') + '</small></summary>' +
    '<table class="wk-table"><thead><tr><th>할일</th><th>임자</th><th>상태</th><th>다음걸음</th><th>기한</th><th>근거</th></tr></thead><tbody>' + shown.map(row).join('') + '</tbody></table></details>';
  const plans = g => { const ps = dirs.filter(r => r['층'] === '세부계획' && gOf(r['갈래']) === g);
    return '<div class="wk-plans"><p class="jb-kicker">세부계획</p>' + (ps.length ? '<ul>' + ps.map(dirItem).join('') + '</ul>' : '<p class="wk-muted">세부계획 줄 없음</p>') + '</div>'; };
  const cats = f.dp === 'big' ? '' : groups.map((g, gi) => {
    if (f.g !== '' && Number(f.g) !== gi) return '';
    const rs = rows.filter(r => r.g === g), shown = rs.filter(keep);
    if (narrowed && !shown.length) return '';
    return '<details class="jb-card wk-cat" data-cat="' + gi + '" open><summary><span class="wk-cat-name">' + esc(g) + '</span>' + coBand(rs) + '<small class="wk-muted">서비스 ' + coSvc(rs).length + ' · 줄 ' + rs.length +
      ' · 진행 ' + coCount(rs, '진행') + ' · 멈춤 ' + coCount(rs, '멈춤') + ' · 미정 ' + coCount(rs, '미정') + '</small></summary>' + plans(g) +
      (f.dp === 'plan' ? '' : shown.length ? coSvc(shown).map(svc => svcBlock(svc, shown.filter(r => r['서비스'] === svc), rs.filter(r => r['서비스'] === svc))).join('') : '<p class="wk-muted">이 갈래에 줄 없음</p>') + '</details>';
  }).join('');
  main.innerHTML = headTxt + tools + '</div>' + modes + big + depth + (f.dp ? '' : chipRow('모아 보기', views, f.v, 'v') + counts) +
    (f.dp === 'big' ? '' : '<p class="wk-co-fold"><button type="button" class="jb-link" data-fold="close">모두 접기</button> · <button type="button" class="jb-link" data-fold="open">모두 펴기</button></p>' + (cats || '<p class="wk-muted">맞는 줄 없음</p>'));
  for (const [id, k] of [['co-g', 'g'], ['co-o', 'o'], ['co-s', 's']]) document.getElementById(id)?.addEventListener('change', e => { location.hash = href({[k]: e.target.value}).slice(1); });
  main.querySelectorAll('[data-fold]').forEach(b => b.addEventListener('click', () => main.querySelectorAll('details.wk-cat, details.wk-svc').forEach(x => { x.open = b.dataset.fold === 'open'; })));

  function allRules() { // 원칙 · 매뉴얼 보기: 이름 · 한 줄 · 자리 글자만(본문 0)
    const rg = [...CO_GROUPS, ...(rules.some(r => gOf(r['갈래']) === CO_OUT) ? [CO_OUT] : [])];
    if (Number(f.g) >= rg.length) f.g = '';
    const pick = rules.filter(r => (f.g === '' || gOf(r['갈래']) === rg[f.g]));
    const shown = pick.filter(r => !f.rs || r['상태'] === f.rs);
    const tools2 = '<div class="jb-tools wk-co-tools">' + sel('co-g', '갈래', f.g, rg.map((g, i) => [i, g])) + sel('co-rs', '상태', f.rs, RULE_STATES.map(s => [s, s])) + '</div>';
    const rchips = chipRow('모아 보기', [['', '모두 ' + num(pick.length)], ...RULE_STATES.map(s => [s, s + ' ' + num(pick.filter(r => r['상태'] === s).length)])], f.rs, 'rs');
    const body = !d.rule ? '<p class="jb-wait">아직 올라온 원칙 · 매뉴얼 목록이 없습니다. 본부가 올리면 나옵니다.</p>' : !okDoc(d.rule, RULE_R1) ? '<p class="wk-bad">지난 꼴 원칙 목록 — ' + esc(RULE_R1) + ' 로 다시 올려야 보입니다.</p>' :
      rg.map((g, gi) => { if (f.g !== '' && Number(f.g) !== gi) return ''; const all = rules.filter(r => gOf(r['갈래']) === g), rs = all.filter(r => !f.rs || r['상태'] === f.rs);
        if (f.rs && !rs.length) return '';
        return '<details class="jb-card wk-cat" data-cat="' + gi + '" open><summary><span class="wk-cat-name">' + esc(g) + '</span><small class="wk-muted">' + RULE_STATES.map(s => s + ' ' + all.filter(r => r['상태'] === s).length).join(' · ') + '</small></summary>' +
          (rs.length ? '<table class="wk-table wk-rules"><thead><tr><th>이름</th><th>한 줄</th><th>상태</th><th>자리</th><th>임자</th><th>고친날</th></tr></thead><tbody>' + rs.map(r => '<tr data-id="' + esc(r.id) + '"' + (r['상태'] === '없음' ? ' class="late"' : '') + '><td>' + esc(r['이름']) + '</td><td>' + esc(r['한줄']) + '</td><td><span class="wk-badge ' + (RULE_BADGE[r['상태']] || 'unk') + '">' + esc(r['상태']) + '</span>' + (r['상태'] === '없음' ? ' <small class="wk-muted">지어야 함</small>' : '') + '</td><td class="wk-src">' + (r['자리'] ? esc(r['자리']) : '<span class="wk-muted">—</span>') + '</td><td>' + (r['임자'] ? esc(r['임자']) : '<span class="wk-muted">—</span>') + '</td><td>' + esc(r['고친날']) + '</td></tr>').join('') + '</tbody></table>'
            : '<p class="wk-muted">이 갈래 원칙 · 매뉴얼 줄 없음</p>') + '</details>'; }).join('') || '<p class="wk-muted">맞는 줄 없음</p>';
    main.innerHTML = headTxt + tools2 + '</div>' + modes + big + rchips + '<p class="wk-co-shown">맞는 줄 <b>' + num(shown.length) + '</b> / ' + num(rules.length) + '</p>' + body;
    for (const [id, k] of [['co-g', 'g'], ['co-rs', 'rs']]) document.getElementById(id)?.addEventListener('change', e => { location.hash = href({[k]: e.target.value}).slice(1); });
  }
}

// ---- r5 접속 기록 · 등급 표 (경영진 · 서버가 log 쪽을 허락할 때만 자료가 옴) ----
const OUTCOME = {ok: ['열림', 'done'], token: ['로그인 틀림', 'stop'], grade: ['등급 거부', 'stop']};
async function log() {
  let d;
  try { d = await call('work-board', 'log'); }
  catch (e) { if (!e.handled) main.innerHTML = '<p class="wk-bad">접속 기록을 읽지 못했습니다(' + esc(e.status || '연결') + ').</p>'; return; }
  const rows = d.log || [], denied = rows.filter(r => r.outcome !== 'ok').length;
  main.innerHTML = '<div class="jb-head"><div><p class="jb-kicker">접속 기록</p><h1>누가 언제 열었나</h1><p class="jb-help">최근 ' + num(rows.length) + '줄 · 거부 ' + num(denied) +
    ' · 기준 ' + stamp(Date.now()) + ' 지금 · IP 는 남기지 않고 가린 값만</p></div></div>' +
    '<section class="jb-card"><h2 class="wk-h2">등급 표 <small class="wk-muted">' + num((d.grants || []).length) + '명</small></h2>' +
    ((d.grants || []).length ? '<table class="wk-table wk-grants"><thead><tr><th>이름</th><th>등급</th><th>켬</th><th>고친 때</th></tr></thead><tbody>' +
      d.grants.map(g => '<tr><td>' + esc(g.label) + '</td><td>' + esc(g.grade) + '</td><td>' + (g.active ? '켬' : '<span class="wk-muted">꺼짐</span>') + '</td><td>' + stamp(g.at) + '</td></tr>').join('') + '</tbody></table>'
      : '<p class="wk-muted">등급 표에 아직 사람이 없습니다.</p>') + '</section>' +
    '<section class="jb-card"><h2 class="wk-h2">요청</h2>' + (rows.length ? '<table class="wk-table wk-log"><thead><tr><th>때</th><th>이름</th><th>등급</th><th>쪽</th><th>요청</th><th>결과</th></tr></thead><tbody>' +
      rows.map(r => '<tr data-outcome="' + esc(r.outcome) + '"><td>' + stamp(r.at) + '</td><td>' + (r.label ? esc(r.label) : '<span class="wk-muted">로그인 없음</span>') + '</td><td>' + esc(r.grade || '—') + '</td><td>' + esc(r.page) +
        '</td><td>' + esc(r.action) + '</td><td><span class="wk-badge ' + (OUTCOME[r.outcome]?.[1] || 'unk') + '">' + esc(OUTCOME[r.outcome]?.[0] || r.outcome) + '</span></td></tr>').join('') + '</tbody></table>'
      : '<p class="wk-muted">기록 없음</p>') + '</section>';
}

const VIEWS = {home, board, prod, all, log};
async function start() {
  if (!memberToken()) return showLogin();
  if (!ME) {
    main.innerHTML = '<p class="jb-wait">등급 확인 중…</p>';
    try { ME = await call('work-board', 'me'); } catch (e) { if (!e.handled) main.innerHTML = '<p class="wk-bad">지금 들어갈 수 없습니다(' + esc(e.status || '연결') + '). 잠시 뒤 다시 여세요.</p>'; return; }
    if (ME.judge?.token) store.set(K.token, {token: ME.judge.token, reviewer: ME.label, exp: Date.now() + ME.judge.hours * 3600e3 - 60e3}); else store.del(K.token);
    CO_GROUPS = allowed('accounting') ? CO_ALL : CO_ALL.filter(g => coKey(g) !== '회계관리');
  }
  showNav();
  if (!allowed(PAGE_KEY[PAGE] || 'home')) return showDenied(false);
  const pg = ME.pages.find(p => p.page === PAGE_KEY[PAGE]);
  if (pg && PAGE !== 'home') { document.title = pg.title + ' · 델타스킬'; document.querySelector('.jb-brand em').textContent = pg.title; }
  (VIEWS[PAGE] || home)();
}
window.addEventListener('hashchange', () => { if (ME && PAGE !== 'home') start(); });
start();
})();
