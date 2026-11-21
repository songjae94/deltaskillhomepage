(() => {
  const main = document.getElementById('content');
  if (!main || typeof route !== 'function') return;

  const config = Object.freeze({
    enabled: false,
    confirmed: false,
    startDate: null,
    plannedMonth: '2027-03',
    candidateDate: '2027-03-24',
    daysAfterExam: 7,
    ...window.DSExamWeekV25Config,
  });
  const dayFormat = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Seoul', year: 'numeric', month: '2-digit', day: '2-digit' });
  const kinds = { wrong: '틀린 문항', guessed: '찍어서 맞힌 문항' };
  const glyphs = { wrong: '×', guessed: '△' };
  const reasons = ['개념', '풀이', '계산', '시간', '모르겠음'];
  const numbers = Array.from({ length: 30 }, (_, i) => i + 1);
  const marks = new Map();
  let mode = 'wrong';
  let reason = '';
  let showingNote = false;
  let bannerExpiry;

  function dayNumber(iso) {
    if (typeof iso !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(iso)) return NaN;
    const timestamp = Date.parse(`${iso}T00:00:00Z`);
    return Number.isFinite(timestamp) && new Date(timestamp).toISOString().startsWith(`${iso}T`) ? timestamp / 86400000 : NaN;
  }

  function eventStatus(now = new Date(), settings = config) {
    const { enabled, confirmed, startDate, daysAfterExam } = settings;
    const start = dayNumber(startDate);
    if (enabled !== true || confirmed !== true || !Number.isFinite(start) || !Number.isInteger(daysAfterExam) || daysAfterExam < 0 || !Number.isFinite(now?.getTime?.())) {
      return { active: false, day: null };
    }
    const parts = Object.fromEntries(dayFormat.formatToParts(now).map(({ type, value }) => [type, value]));
    const day = dayNumber(`${parts.year}-${parts.month}-${parts.day}`) - start;
    return { active: day >= 0 && day <= daysAfterExam, day };
  }

  window.DSExamWeekV25 = Object.freeze({ config, eventStatus });

  function fieldGuide() {
    return `<aside class="ew25-guide" aria-labelledby="ew25-guide-title">
      <h2 id="ew25-guide-title">시험 후 복습 순서</h2>
      <ol>
        <li><span>시험 당일</span><strong>채점하고 문항 표시</strong></li>
        <li><span>1–3일 뒤</span><strong>막힌 문항 다시 풀기</strong><p>문제와 해설은 시험 문항 연결 후 제공됩니다.</p></li>
        <li><span>7일 뒤</span><strong>헷갈린 문항 다시 확인</strong></li>
      </ol>
    </aside>`;
  }

  function form() {
    return `<form class="ew25-sheet" id="ew25-form">
      <fieldset class="ew25-modes"><legend>표시할 문항 종류</legend><div>
        ${Object.entries(kinds).map(([key, label]) => `<label data-ew25-mode="${key}"><input type="radio" name="mark" value="${key}" ${mode === key ? 'checked' : ''}><span>${label}</span><b aria-hidden="true">${glyphs[key]}</b></label>`).join('')}
      </div></fieldset>
      <div class="ew25-grid-caption"><h2 id="ew25-grid-label">문항 번호 <small>구성 예시</small></h2><p>한 번 더 누르면 표시가 해제됩니다.</p></div>
      <div class="ew25-grid" role="group" aria-labelledby="ew25-grid-label">
        ${numbers.map(number => `<button type="button" data-ew25-number="${number}" aria-label="${number}번" aria-describedby="ew25-mark-${number}">${number}<span class="sr-only" id="ew25-mark-${number}"></span></button>`).join('')}
      </div>
      <div class="ew25-sheet-bottom">
        <label class="ew25-reason">가장 많이 막힌 이유 <span>선택</span><select name="reason"><option value="">이유 고르기</option>${reasons.map(value => `<option${value === reason ? ' selected' : ''}>${value}</option>`).join('')}</select></label>
        <p class="ew25-count" role="status"></p>
        <button class="ew25-main-button" type="submit">내 오답노트 보기 <span aria-hidden="true">→</span></button>
      </div>
    </form>`;
  }

  function updateMarks() {
    for (const button of main.querySelectorAll('[data-ew25-number]')) {
      const kind = marks.get(Number(button.dataset.ew25Number));
      button.dataset.ew25State = kind ?? '';
      button.setAttribute('aria-pressed', String(Boolean(kind)));
      button.firstElementChild.textContent = kinds[kind] ?? '표시 없음';
    }
    const wrong = Array.from(marks.values()).filter(kind => kind === 'wrong').length;
    main.querySelector('.ew25-count').textContent = `틀린 문항 ${wrong}개 · 찍어서 맞힌 문항 ${marks.size - wrong}개`;
  }

  function note() {
    return `<section class="ew25-sheet ew25-note" aria-labelledby="ew25-note-title">
      <h2 id="ew25-note-title" tabindex="-1">내 오답노트</h2>
      ${marks.size ? Object.entries(kinds).map(([key, label]) => {
        const chosen = numbers.filter(number => marks.get(number) === key);
        return `<section class="ew25-note-group"><h3>${label} <span>${chosen.length}개</span></h3>
          ${chosen.length ? `<ul>${chosen.map(number => `<li data-ew25-state="${key}">${number}번</li>`).join('')}</ul>` : '<p>선택한 문항이 없습니다.</p>'}</section>`;
      }).join('') : '<p class="ew25-empty">아직 선택한 문항이 없습니다. 채점한 뒤 복습할 문항을 골라 보세요.</p>'}
      ${reason ? `<p class="ew25-note-reason">가장 많이 막힌 이유 <strong>${reason}</strong></p>` : ''}
      <button class="ew25-main-button" type="button" data-ew25-edit>${marks.size ? '문항 다시 고르기' : '문항 고르기'} <span aria-hidden="true">→</span></button>
    </section>`;
  }

  function draw() {
    main.innerHTML = `<article class="ew25-page">
      <div class="ew25-layout">
        <header class="ew25-header">
          <a class="ew25-back" href="#csat"><span aria-hidden="true">←</span> 수능·모의고사</a>
          <p class="ew25-edition">2027년 3월 모의고사</p>
          <h1>모의고사 오답노트</h1>
          <p class="ew25-intro">공식 정답으로 채점한 뒤, 틀린 문항과 찍어서 맞힌 문항을 표시하세요.</p>
        </header>
        <div id="ew25-work">${showingNote ? note() : form()}</div>
        ${fieldGuide()}
        <p class="ew25-preview">지금은 시안입니다. 입력은 전송하지 않습니다.</p>
      </div>
      ${compactFooter()}
    </article>`;
    if (!showingNote) updateMarks();
  }

  function switchView(next) {
    showingNote = next;
    main.querySelector('#ew25-work').innerHTML = next ? note() : form();
    if (!next) updateMarks();
    main.querySelector(next ? '#ew25-note-title' : '[name="mark"]:checked')?.focus();
  }

  main.addEventListener('change', event => {
    if (event.target.form?.id !== 'ew25-form') return;
    if (event.target.name === 'mark' && Object.hasOwn(kinds, event.target.value)) {
      mode = event.target.value;
      updateMarks();
    }
    if (event.target.name === 'reason') reason = reasons.includes(event.target.value) ? event.target.value : '';
  });

  main.addEventListener('click', event => {
    if (!event.target.closest('#ew25-work')) return;
    const button = event.target.closest('[data-ew25-number]');
    if (button) {
      const number = Number(button.dataset.ew25Number);
      if (!numbers.includes(number)) return;
      if (marks.get(number) === mode) marks.delete(number);
      else marks.set(number, mode);
      updateMarks();
    }
    if (event.target.closest('[data-ew25-edit]')) switchView(false);
  });

  main.addEventListener('submit', event => {
    if (event.target.id !== 'ew25-form') return;
    event.preventDefault();
    switchView(true);
  });

  function syncHomeBanner() {
    const hero = main.querySelector('.cinema');
    if (!hero || !['', '#home', '#content'].includes(location.hash)) {
      if (bannerExpiry !== undefined) clearTimeout(bannerExpiry);
      bannerExpiry = undefined;
      return;
    }
    const banner = main.querySelector('.ew25-home-banner');
    if (!eventStatus().active) { banner?.remove(); return; }
    if (!banner) hero.insertAdjacentHTML('beforebegin', '<a class="ew25-home-banner" href="#exam-week"><strong>모의고사 오답노트</strong><span>복습할 문항 고르기 <b aria-hidden="true">→</b></span></a>');
    if (bannerExpiry === undefined) {
      const end = (dayNumber(config.startDate) + config.daysAfterExam + 1) * 86400000 - 9 * 3600000;
      const delay = Math.min(2147483647, Math.max(0, end - Date.now()));
      bannerExpiry = setTimeout(() => { bannerExpiry = undefined; syncHomeBanner(); }, delay);
    }
  }

  function decorate() {
    if (location.hash === '#csat' && !main.querySelector('.ew25-csat-link')) {
      main.querySelector('.cl20-review')?.insertAdjacentHTML('beforeend', '<div class="ew25-csat-entry"><a class="ew25-csat-link" href="#exam-week">모의고사 오답노트 · 3월 사전 시안 <span aria-hidden="true">→</span></a></div>');
    }
    syncHomeBanner();
  }

  const previousRoute = route;
  function navigate() {
    const result = previousRoute.apply(this, arguments);
    if (location.hash === '#exam-week') {
      header('csat');
      document.title = '모의고사 오답노트 · DELTASKILL';
      draw();
      window.scrollTo(0, 0);
      main.focus({ preventScroll: true });
      syncHomeBanner();
    } else decorate();
    return result;
  }

  window.removeEventListener('hashchange', previousRoute);
  route = navigate;
  window.addEventListener('hashchange', navigate);
  window.addEventListener('pageshow', syncHomeBanner);
  document.addEventListener('visibilitychange', () => { if (!document.hidden) syncHomeBanner(); });
  if (location.hash === '#exam-week') navigate();
  else decorate();
})();
