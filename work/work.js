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
function workerRows(board, channel, day) {
  const rows = board?.body?.rows || [], names = new Map();
  const add = n => { if (!names.has(n)) names.set(n, {name: n, today: [], week: [], channel: null}); return names.get(n); };
  for (const r of rows) { const w = add(workerOf(r['작업자'])); w.week.push(r); if (dayOf(r['날짜']) === day) w.today.push(r); }
  for (const c of channel?.body?.workers || []) add(workerOf(c['명의'])).channel = c;
  const order = n => { const i = WORKERS.indexOf(n); return i < 0 ? 100 : i; };
  const list = [...names.values()].sort((a, b) => order(a.name) - order(b.name) || a.name.localeCompare(b.name, 'ko'));
  const dayList = days(rows), di = dayList.indexOf(day);
  for (const w of list) {
    const st = w.today.map(r => stateOf(r['상태']));
    w.state = !st.length ? '미확인' : st.includes('막힘') ? '막힘' : st.includes('진행') ? '진행' : st.every(s => s === '끝') ? '끝' : '미확인';
    w.blocked = w.today.filter(r => stateOf(r['상태']) === '막힘');
    w.next = w.week.find(r => dayList.indexOf(dayOf(r['날짜'])) > di && stateOf(r['상태']) !== '끝') || w.today.find(r => stateOf(r['상태']) !== '끝') || null;
  }
  return list;
}

// ---- 첫 화면 ----
async function home() {
  main.innerHTML = '<div class="jb-head"><div><p class="jb-kicker">관리자</p><h1>무엇을 볼까요</h1></div></div><div class="wk-tiles">' +
    tile('judge', '/work/judge/', '문항 눈판정', '문항을 보고 넷 중 하나로 판정합니다.') +
    tile('prod', '/work/prod/', '문항 생산관리', '작업자 · 묶음별 문항 생산 진도입니다.') +
    tile('board', '/work/board/', '작업자별 상황판', '작업자마다 오늘 일 · 상태 · 마지막 통로 글입니다.') + '</div>';
  const set = (k, line, at) => { const el = document.querySelector('[data-tile="' + k + '"]'); el.querySelector('.wk-num').innerHTML = line; el.querySelector('.wk-at').textContent = at; };
  const fail = k => e => { if (e.status !== 401) set(k, '<span class="wk-bad">못 읽음</span>', '잠시 뒤 다시 엽니다'); };
  call('item-judge', 'menu').then(d => {
    let judged = 0, total = 0;
    for (const s of d.subjects || []) for (const b of s.books || []) { judged += b.judged || 0; total += b.total || 0; }
    set('judge', '판정 <b>' + num(judged) + '</b> / ' + num(total), '기준 ' + stamp(Date.now()) + ' 지금');
  }).catch(fail('judge'));
  call('work-board', 'prod').then(d => {
    const p = d.prod;
    if (!p) return set('prod', '<span class="wk-muted">아직 올라온 판 없음</span>', '센터1128 이 올리면 나옵니다');
    set('prod', '오늘 생산 <b>' + num(p.body['요약']['오늘_생산']) + '</b>', '기준 ' + stamp(p.body['기준시각']) + ' · 올림 ' + stamp(p.at));
  }).catch(fail('prod'));
  call('work-board', 'board').then(d => {
    if (!d.board) return set('board', '<span class="wk-muted">아직 올라온 판 없음</span>', '본부가 올리면 나옵니다');
    const day = pickDay(d.board.body.rows), list = workerRows(d.board, d.channel, day);
    set('board', '막힌 작업자 <b>' + list.filter(w => w.state === '막힘').length + '</b>명', esc(day || '') + ' 기준 · 올림 ' + stamp(d.board.at));
  }).catch(fail('board'));
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
  const ch = d.channel ? '통로 #' + esc(d.channel.body['이슈']) + ' 마지막 글 기준 ' + stamp(d.channel.body['올린시각']) : '통로 글 시각 없음';
  main.innerHTML = '<div class="jb-head"><div><p class="jb-kicker">작업자별 상황판</p><h1>' + esc(d.board.body['이름표']) + '</h1>' +
    '<p class="jb-help">' + esc(day) + ' 기준 · 상황판 ' + esc(d.board.body.csv) + ' 올림 ' + stamp(d.board.at) + ' · ' + ch + '</p></div><div class="jb-tools">' + weekSel + '</div></div>' + daySel +
    '<div class="wk-counts">' + ['진행', '끝', '막힘', '미확인'].map(s => '<span class="wk-badge ' + BADGE[s] + '">' + s + ' ' + list.filter(w => w.state === s).length + '</span>').join('') + '</div>' +
    '<div class="wk-workers">' + list.map(w => workerCard(w, d.week)).join('') + '</div>';
  document.getElementById('wk-week').addEventListener('change', e => { location.hash = 'week=' + encodeURIComponent(e.target.value); });
}
function workerCard(w, week) {
  const c = w.channel, line = r => '<li><span class="wk-badge ' + BADGE[stateOf(r['상태'])] + '">' + esc(r['상태'] || '미확인') + '</span> ' + esc(r['할일']) + '</li>';
  return '<article class="wk-worker ' + BADGE[w.state] + '"><header><h2>' + esc(w.name) + '</h2><span class="wk-badge ' + BADGE[w.state] + '">' + w.state + '</span></header>' +
    '<p class="wk-meta">통로 마지막 글 ' + (c ? stamp(c.at) + (c['갈래'] ? ' · ' + esc(c['갈래']) : '') : '<span class="wk-muted">7일 안 없음</span>') + '</p>' +
    (w.today.length ? '<ul class="wk-list">' + w.today.map(line).join('') + '</ul>' : '<p class="wk-muted">이 날 적힌 일 없음</p>') +
    (w.blocked.length ? '<p class="wk-why"><b>막힘 까닭</b> ' + w.blocked.map(r => esc(r['근거'] || '적힌 까닭 없음')).join(' / ') + '</p>' : '') +
    '<p class="wk-next"><b>다음 일</b> ' + (w.next ? esc(w.next['날짜']) + ' · ' + esc(w.next['할일']) : '<span class="wk-muted">적힌 것 없음</span>') + '</p>' +
    (w.week.length ? '<details><summary>이 주 전체 ' + w.week.length + '줄</summary><table class="wk-table"><thead><tr><th>날</th><th>할 일</th><th>상태</th><th>표시</th><th>근거</th></tr></thead><tbody>' +
      w.week.map(r => '<tr><td>' + esc(r['날짜']) + '</td><td>' + esc(r['할일']) + '</td><td>' + esc(r['상태']) + '</td><td>' + esc(r['표시시각']) + '</td><td class="wk-src">' + esc(r['근거']) + '</td></tr>').join('') +
      '</tbody></table></details>' : '') + '</article>';
}

// ---- 문항 생산관리 ----
async function prod() {
  let d;
  try { d = await call('work-board', 'prod'); }
  catch (e) { if (e.status !== 401) main.innerHTML = '<p class="wk-bad">생산관리 판을 읽지 못했습니다(' + esc(e.status || '연결') + ').</p>'; return; }
  const p = d.prod;
  if (!p) { main.innerHTML = '<div class="jb-head"><div><p class="jb-kicker">문항 생산관리</p><h1>아직 올라온 판이 없습니다</h1><p class="jb-help">센터1128 이 계약 r1 꼴로 올리면 여기에 나옵니다.</p></div></div>'; return; }
  const b = p.body, s = b['요약'], stages = b['단계'] || [];
  const q = new URLSearchParams(location.hash.slice(1)), fw = q.get('w') || '', fs = q.get('s') || '';
  const bundles = (b['묶음'] || []).filter(r => (!fw || r['작업자'] === fw) && (!fs || r['단계'] === fs));
  const who = [...new Set((b['묶음'] || []).map(r => r['작업자']).filter(Boolean))];
  const max = Math.max(1, ...(b['날별'] || []).flatMap(r => Object.values(r['값'] || {})));
  const opt = (k, list, cur, all) => '<select data-q="' + k + '"><option value="">' + all + '</option>' + list.map(v => '<option' + (v === cur ? ' selected' : '') + '>' + esc(v) + '</option>').join('') + '</select>';
  main.innerHTML = '<div class="jb-head"><div><p class="jb-kicker">문항 생산관리</p><h1>기준 ' + stamp(b['기준시각']) + '</h1>' +
    '<p class="jb-help">지은이 ' + esc(b['지은이']) + ' · 올림 ' + stamp(p.at) + ' · 원문 · 정답 · 분류 코드는 싣지 않습니다</p></div></div>' +
    '<div class="wk-sum">' + [['오늘_생산', '오늘 생산'], ['이번주_생산', '이번 주 생산'], ['검수_대기', '검수 대기'], ['등재', '등재'], ['막힘', '막힘']].map(([k, n]) =>
      '<div class="jb-card"><p class="jb-kicker">' + n + '</p><p class="wk-big">' + num(s[k]) + '</p></div>').join('') + '</div>' +
    ((b['날별'] || []).length ? '<section class="jb-card"><h2>날별</h2><table class="wk-table"><thead><tr><th>날짜</th>' + stages.map(x => '<th>' + esc(x) + '</th>').join('') + '</tr></thead><tbody>' +
      b['날별'].map(r => '<tr><td>' + esc(r['날짜']) + '</td>' + stages.map(x => { const v = r['값']?.[x] || 0; return '<td><span class="wk-bar" style="width:' + Math.round(v / max * 100) + '%"></span>' + num(v) + '</td>'; }).join('') + '</tr>').join('') +
      '</tbody></table></section>' : '') +
    ((b['작업자'] || []).length ? '<section class="jb-card"><h2>작업자</h2><table class="wk-table"><thead><tr><th>작업자</th><th>상태</th><th>오늘</th><th>이번 주</th><th>진행</th><th>마지막</th><th>메모</th></tr></thead><tbody>' +
      b['작업자'].map(r => '<tr><td>' + esc(r['작업자']) + '</td><td><span class="wk-badge ' + (BADGE[r['상태']] || 'unk') + '">' + esc(r['상태']) + '</span></td><td>' + num(r['오늘']) + '</td><td>' + num(r['이번주']) +
        '</td><td>' + esc(r['진행']) + '</td><td>' + stamp(r['마지막']) + '</td><td>' + esc(r['메모']) + '</td></tr>').join('') + '</tbody></table></section>' : '') +
    ((b['묶음'] || []).length ? '<section class="jb-card"><div class="jb-head"><h2>묶음 ' + num(bundles.length) + ' / ' + num(b['묶음'].length) + '</h2><div class="jb-tools">' +
      opt('w', who, fw, '작업자 전체') + opt('s', stages, fs, '단계 전체') + '</div></div><table class="wk-table"><thead><tr><th>묶음</th><th>작업자</th><th>교재</th><th>단원</th><th>단계</th><th>수</th><th>끝</th><th>막힘</th><th>갱신</th><th>근거</th></tr></thead><tbody>' +
      bundles.map(r => '<tr><td>' + esc(r['묶음']) + '</td><td>' + esc(r['작업자']) + '</td><td>' + esc(r['교재']) + '</td><td>' + esc(r['단원']) + '</td><td>' + esc(r['단계']) + '</td><td>' + num(r['수']) +
        '</td><td>' + num(r['끝']) + '</td><td>' + num(r['막힘']) + '</td><td>' + stamp(r['갱신']) + '</td><td class="wk-src">' + esc(r['근거']) + '</td></tr>').join('') + '</tbody></table></section>' : '') +
    (b['표'] || []).map(t => '<section class="jb-card"><h2>' + esc(t['제목']) + '</h2><table class="wk-table"><thead><tr>' + t['머리'].map(h => '<th>' + esc(h) + '</th>').join('') + '</tr></thead><tbody>' +
      t['줄'].map(r => '<tr>' + r.map(v => '<td>' + esc(v) + '</td>').join('') + '</tr>').join('') + '</tbody></table></section>').join('');
  main.querySelectorAll('select[data-q]').forEach(el => el.addEventListener('change', () => {
    const n = new URLSearchParams(location.hash.slice(1)); if (el.value) n.set(el.dataset.q, el.value); else n.delete(el.dataset.q); location.hash = n.toString();
  }));
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
