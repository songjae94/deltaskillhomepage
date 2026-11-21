'use strict';

(() => {
  const htmlEntities = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
  const escape = value => String(value ?? '').replace(/[&<>"']/g, character => htmlEntities[character]);
  const validId = value => Number.isFinite(value) || (typeof value === 'string' && value.trim());

  function safeLink(url) {
    if (typeof url !== 'string') return '';
    const value = url.trim();
    if (/[\s\\\u0000-\u001f\u007f]/.test(value)) return '';
    return /^(https?:\/\/[^/]|\/(?!\/)|#[a-z])/i.test(value) ? escape(value) : '';
  }

  function serviceLink(url, label) {
    if (url === '#account-password') return `<a href="#account-password">${label}</a>`;
    const href = safeLink(url);
    return href && !href.startsWith('#') ? `<a href="${href}" target="_blank" rel="noopener">${label}</a>` : '';
  }

  function login(state = {}) {
    const { busy, error, phone, signupUrl, recoverUrl, nextRole } = state;
    const accessLinks = [serviceLink(signupUrl, '회원가입'), serviceLink(recoverUrl, '비밀번호 찾기')].filter(Boolean);

    return `<section class="account-v7 account-surface account-login" aria-labelledby="account-login-title">
      <div class="account-login-panel">
        <p class="account-wordmark" aria-hidden="true">DELTA<span>SKILL</span></p>
        <h1 id="account-login-title">로그인</h1>
        <p class="account-subtitle" id="account-login-hint">가입할 때 사용한 휴대폰 번호를 입력하세요.</p>
        <form id="login-form" class="account-form" method="post" data-next-role="${escape(nextRole)}" aria-busy="${Boolean(busy)}" aria-describedby="account-login-hint${error ? ' account-login-error' : ''}">
          <div class="account-field">
            <label for="account-phone">휴대폰 번호</label>
            <input id="account-phone" type="tel" name="phone" inputmode="tel" autocomplete="username" value="${escape(phone)}" required>
          </div>
          <div class="account-field">
            <label for="account-password">비밀번호</label>
            <div class="account-password-field">
              <input id="account-password" type="password" name="pin" autocomplete="current-password" required>
              <button type="button" class="account-password-toggle" data-account-action="toggle-password" aria-controls="account-password" aria-pressed="false">보기</button>
            </div>
          </div>
          <div class="account-submit">
            ${error ? `<p class="account-error" id="account-login-error" role="alert">${escape(error)}</p>` : ''}
            <button class="account-primary" type="submit"${busy ? ' disabled' : ''}>${busy ? '로그인 중…' : '로그인'}</button>
          </div>
        </form>
        ${accessLinks.length ? `<nav class="account-login-links" aria-label="계정 도움말">${accessLinks.join('')}</nav>` : ''}
      </div>
    </section>`;
  }

  function passMaterialRows(items) {
    const rows = (Array.isArray(items) ? items : []).map(item => {
      const title = typeof item === 'string' ? item : item?.title ?? item?.name;
      if (!title) return '';
      const id = item?.fileId ?? item?.file_id;
      const downloadable = validId(id);
      return `<li class="account-item"${downloadable ? ` data-owned-file="${escape(id)}"` : ''}>
        <span class="account-row-title">${escape(title)}</span>
        ${downloadable ? `<button type="button" class="account-row-action" data-account-action="download" data-file-id="${escape(id)}" aria-label="${escape(title)} 다운로드">다운로드 <span aria-hidden="true">↓</span></button>` : ''}
      </li>`;
    }).filter(Boolean);

    return rows.length ? `<ul class="account-list">${rows.join('')}</ul>` : '';
  }

  function ownedMaterialGroups(items) {
    const groups = new Map();
    for (const item of Array.isArray(items) ? items : []) {
      const title = typeof item === 'string' ? item : item?.title ?? item?.name;
      if (!title) continue;
      const groupTitle = item?.groupTitle || title;
      if (!groups.has(groupTitle)) groups.set(groupTitle, []);
      groups.get(groupTitle).push({
        title,
        layout: item?.layout,
        format: item?.format,
        id: item?.fileId ?? item?.file_id ?? item?.id,
        received: item?.received
      });
    }

    return [...groups].map(([groupTitle, files]) => {
      const format = files.every(file => file.format === files[0].format) ? files[0].format : '';
      const variants = files.map(file => {
        const variant = file.layout || (file.title === groupTitle ? '' : file.title);
        const label = [variant, format ? '' : file.format].filter(Boolean).join(' · ');
        if (!validId(file.id)) {
          return `<li><span class="account-material-chip account-material-unavailable">${label ? `${escape(label)} <small>다운로드 불가</small>` : '다운로드 불가'}</span></li>`;
        }

        const accessibleLabel = [groupTitle, variant, file.format, file.received ? '다시 다운로드' : '다운로드'].filter(Boolean).join(' ');
        return `<li data-owned-file="${escape(file.id)}"><button type="button" class="account-material-chip" data-account-action="download" data-file-id="${escape(file.id)}" aria-label="${escape(accessibleLabel)}">${escape(label || '다운로드')} <span aria-hidden="true">↓</span></button></li>`;
      }).join('');

      return `<section class="account-material-bundle">
        <div class="account-material-title"><h3>${escape(groupTitle)}</h3>${format ? `<span>${escape(format)}</span>` : ''}</div>
        <ul class="account-material-options" aria-label="${escape(groupTitle)} 파일">${variants}</ul>
      </section>`;
    }).join('');
  }

  function savedSets(items) {
    const rows = (Array.isArray(items) ? items : []).map((item, index) => {
      const title = typeof item === 'string' ? item : item?.title ?? item?.name ?? item?.unit;
      const details = item?.kind ? `<small>${escape(item.kind)}</small>` : '';
      return title ? `<li class="account-item"><span class="account-row-title">${escape(title)}${details}</span><button type="button" class="account-row-action" data-reuse="${index}" aria-label="${escape(title)} 열기">열기 <span aria-hidden="true">→</span></button></li>` : '';
    }).filter(Boolean);

    return rows.length ? `<ul class="account-list">${rows.join('')}</ul>` : '';
  }

  const isCount = value => Number.isSafeInteger(value) && value >= 0;
  const formatNumber = value => value.toLocaleString('ko-KR');

  function emptyState(message, href, label) {
    const safeHref = safeLink(href);
    return `<div class="account-state account-empty"><p class="account-muted">${message}</p>${safeHref ? `<a class="account-text-button" href="${safeHref}"${href === '#login' ? ' data-account-action="login"' : ''}>${label} <span aria-hidden="true">→</span></a>` : ''}</div>`;
  }

  function connectionState(message, target) {
    return `<div class="account-state"><p class="account-error" role="alert">${escape(message)}</p><button type="button" class="account-row-action" data-account-action="retry" data-account-target="${target}">다시 시도</button></div>`;
  }

  function materials({ signedIn, loading, error, library, passSets }) {
    if (!signedIn) return emptyState('로그인하면 내 자료를 볼 수 있어요.', '#login', '로그인');
    if (loading) return '<p class="account-muted" role="status">자료 불러오는 중…</p>';
    const owned = ownedMaterialGroups(library);
    const pass = passMaterialRows(passSets);
    const issue = error ? connectionState(error, 'materials') : '';
    if (!issue && !owned && !pass) return emptyState('내 자료가 아직 없어요.', '#library', '자료실 보기');
    return `${issue}${owned ? `<div class="account-material-bundles">${owned}</div>` : ''}${pass ? `<h3 class="account-material-group">이용권 자료</h3>${pass}` : ''}`;
  }

  function learningStats({ sessions, total, correct, latestScore, averageScore } = {}) {
    const entries = [
      ['공부 횟수', sessions, isCount], ['푼 문항', total, isCount], ['맞힌 문항', correct, isCount],
      ['최근 자기채점', latestScore, Number.isFinite], ['평균 자기채점', averageScore, Number.isFinite]
    ].filter(([, value, valid]) => valid(value));
    if (!entries.length) return '';
    return `<dl class="account-stats">${entries.map(([label, value]) => `<div><dt>${label}</dt><dd>${formatNumber(value)}</dd></div>`).join('')}</dl>`;
  }

  function recordDate(when) {
    if (typeof when === 'number' || (typeof when === 'string' && /^\d{4}-\d{2}-\d{2}(?:T|$)/.test(when))) {
      const date = new Date(when);
      if (!Number.isNaN(date.getTime())) return date.toLocaleDateString('ko-KR', { timeZone: 'Asia/Seoul' });
      return '';
    }
    return typeof when === 'string' ? when : '';
  }

  function learningRows(records) {
    const rows = (Array.isArray(records) ? records : []).map(record => {
      const { id, title, when, score, attempt, total, correct, url } = record ?? {};
      if (!title) return '';
      const date = recordDate(when);
      const href = safeLink(url);
      const attemptText = isCount(attempt) && attempt > 0 ? `${formatNumber(attempt)}회차` : '';
      let result = '';
      if (Number.isFinite(score)) result = `자기채점 ${formatNumber(score)}`;
      else if (isCount(total) && isCount(correct)) result = `${formatNumber(correct)} / ${formatNumber(total)} 정답`;
      const metadata = [date, attemptText, result].filter(Boolean).join(' · ');
      const label = `${escape(title)} 상세 보기`;
      let action = '';
      if (validId(id)) action = `<button type="button" class="account-row-action" data-account-action="record" data-record-id="${escape(id)}" aria-label="${label}">보기 <span aria-hidden="true">→</span></button>`;
      else if (href) action = `<a class="account-row-action" href="${href}" aria-label="${label}">보기 <span aria-hidden="true">→</span></a>`;
      return `<li class="account-item">
        <span class="account-row-title">${escape(title)}${metadata ? `<small>${escape(metadata)}</small>` : ''}</span>
        ${action}
      </li>`;
    }).filter(Boolean);
    return rows.length ? `<ul class="account-list account-learning-list">${rows.join('')}</ul>` : '';
  }

  function serverLearning(signedIn, learning, studyUrl) {
    if (!signedIn) return emptyState('로그인하면 공부 기록을 볼 수 있어요.', '#login', '로그인');
    if (learning?.loading) return '<p class="account-muted" role="status">학습 기록을 불러오는 중…</p>';
    if (learning?.error || !learning?.available) {
      const message = typeof learning?.error === 'string' ? learning.error : '공부 기록을 불러오지 못했습니다.';
      return connectionState(message, 'learning');
    }

    const summary = learning.summary ?? {};
    const rows = learningRows(learning.records);
    const values = [summary.sessions, summary.total, summary.correct];
    if (!rows && !values.some(value => isCount(value) && value > 0)) return emptyState('공부 기록이 아직 없어요.', studyUrl, '공부 시작');
    return `${learningStats(summary)}${rows}`;
  }

  const diagnosticAxes = [
    { action: 'timed', label: '제한시간', gradeKey: 'timedGrade' },
    { action: 'difficulty', label: '난이도별', gradeKey: 'difficultyGrade' }
  ];

  function unitRows(items, gradeLimit, assessmentReady) {
    const rows = (Array.isArray(items) ? items : []).map(item => {
      const { unit, answered, correct, wrong } = item ?? {};
      if (typeof unit !== 'string' || !unit.trim()) return '';
      const counts = [['응답', answered], ['정답', correct], ['오답', wrong]].filter(([, value]) => isCount(value));
      const sparse = answered === 0 || !counts.some(([, value]) => value > 0);
      const grades = diagnosticAxes.map(({ label, gradeKey }) => {
        const grade = item[gradeKey];
        const ready = assessmentReady && isCount(grade) && grade >= 1 && grade <= gradeLimit;
        return `<div><dt>${label}</dt><dd class="account-unit-grade${ready ? ' account-unit-grade-ready' : ''}">${ready ? `${grade}등급` : '진단 전'}</dd></div>`;
      }).join('');
      return `<li class="account-unit-row">
        <div class="account-unit-name"><h3>${escape(unit)}</h3>${sparse ? '<span>기록 부족</span>' : ''}</div>
        ${counts.length ? `<dl class="account-unit-counts">${counts.map(([label, value]) => `<div><dt>${label}</dt><dd>${formatNumber(value)}</dd></div>`).join('')}</dl>` : ''}
        <dl class="account-unit-grades">${grades}</dl>
      </li>`;
    }).filter(Boolean);
    return rows.length ? `<ul class="account-unit-list">${rows.join('')}</ul>` : '';
  }

  function latestLocalAttempt(attempts, unit, type) {
    let latest;
    let latestTime = -Infinity;
    for (const attempt of Array.isArray(attempts) ? attempts : []) {
      if (attempt?.unit !== unit || attempt.type !== type) continue;
      const when = typeof attempt.when === 'number' ? attempt.when : Date.parse(attempt.when);
      if (!latest || when > latestTime) {
        latest = attempt;
        latestTime = Number.isFinite(when) ? when : -Infinity;
      }
    }
    return latest;
  }

  function diagnosticDuration(seconds) {
    if (!isCount(seconds)) return '';
    return `${Math.floor(seconds / 60)}분 ${seconds % 60}초`;
  }

  function localDiagnostics(state) {
    const units = [...new Set((Array.isArray(state?.units) ? state.units : []).map(item => typeof item === 'string' ? item : item?.unit).filter(unit => typeof unit === 'string' && unit.trim()))];
    const selected = units.includes(state?.selectedUnit) ? state.selectedUnit : units[0];
    if (!selected) return '';
    const attempts = diagnosticAxes.map(axis => {
      const attempt = latestLocalAttempt(state.localAttempts, selected, axis.action);
      const date = recordDate(attempt?.when);
      const result = [];
      if (isCount(attempt?.correct) && isCount(attempt?.total)) result.push(`${formatNumber(attempt.correct)} / ${formatNumber(attempt.total)} 정답`);
      if (isCount(attempt?.answered)) result.push(`응답 ${formatNumber(attempt.answered)}`);
      if (axis.action === 'timed') {
        const elapsed = diagnosticDuration(attempt?.elapsedSeconds);
        const limit = diagnosticDuration(attempt?.limitSeconds);
        if (elapsed) result.push(`${elapsed} 소요`);
        if (limit) result.push(`제한 ${limit}`);
      }
      return `<li class="account-local-attempt account-local-attempt-${axis.action}">
        <div class="account-attempt-heading"><h4>${axis.label}</h4>${date ? `<small>${escape(date)}</small>` : ''}</div>
        <p>${attempt ? escape(result.join(' · ') || '완료') : '완료한 평가 없음'}</p>
        ${attempt?.id ? `<button class="account-attempt-detail" type="button" data-diagnostic-result="${escape(attempt.id)}">결과 보기 →</button>` : ''}
        <button class="account-row-action" type="button" data-diagnostic="${axis.action}" data-diagnostic-unit="${escape(selected)}">${axis.label} 평가 <span aria-hidden="true">→</span></button>
      </li>`;
    }).join('');

    return `<section class="account-unit-practice" aria-labelledby="account-unit-practice-title">
      <div class="account-unit-practice-title"><h3 id="account-unit-practice-title">진단 체험</h3><span class="account-source">이 기기</span></div>
      <div class="account-unit-evaluations">
        <label for="account-diagnostic-unit">단원</label>
        <select id="account-diagnostic-unit" data-diagnostic-unit>${units.map(unit => `<option value="${escape(unit)}"${unit === selected ? ' selected' : ''}>${escape(unit)}</option>`).join('')}</select>
      </div>
      <ul class="account-local-attempts" aria-label="이 기기의 최근 진단 체험">${attempts}</ul>
    </section>`;
  }

  function unitDiagnostics(signedIn, state) {
    const exam = state?.scale === 'exam';
    const ready = state?.assessmentReady === true;
    const controls = `<div class="account-unit-tools">
      <div class="account-unit-scales" role="group" aria-label="등급 기준">
        <button type="button" data-grade-scale="school" aria-pressed="${!exam}">내신 5등급제</button>
        <button type="button" data-grade-scale="exam" aria-pressed="${exam}">수능 9등급제</button>
      </div>
      ${ready ? '' : '<p class="account-muted">등급은 진단 기준이 연결되면 표시합니다.</p>'}
    </div>`;
    let content = '';
    if (!signedIn) content = emptyState('로그인하면 단원별 기록을 볼 수 있어요.', '#login', '로그인');
    else if (state?.loading) content = '<p class="account-muted" role="status">단원별 기록을 불러오는 중…</p>';
    else if (state?.error) content = connectionState(typeof state.error === 'string' ? state.error : '연결 확인 필요', 'units');
    else content = unitRows(state?.items, exam ? 9 : 5, ready) || emptyState('단원별 기록이 아직 없어요.', '#student', '공부 시작');
    return `${localDiagnostics(state)}<div class="account-unit-history"><div class="account-unit-practice-title"><h3>단원별 자기채점 기록</h3><span class="account-source">계정</span></div>${controls}${content}</div>`;
  }

  function account(state = {}) {
    const { signedIn, displayName, phoneMasked, learning, localSaved, localStats, role } = state;
    const saved = localStats?.saved;
    const teacher = role === 'teacher';
    const sections = {
      designs: {title:'내 디자인',source:'계정',content:'<div data-account-designs>'+ (window.PrintDesignAccountV17?.render()||'')+'</div>'},
      materials: { title: '내 자료', source: '계정', content: materials(state) },
      study: {
        title: '공부 기록', source: '계정',
        content: `${serverLearning(signedIn, learning, '#student')}${localStats ? `<details class="account-local-records"><summary>이 기기의 기록</summary>${learningStats(localStats)}<a class="account-text-button" href="#progress">자세히 보기 →</a></details>` : ''}`
      },
      units: { title: '단원별 실력', source: '두 가지 평가', content: unitDiagnostics(signedIn, state.unitDiagnostics) },
      saved: { title: '저장한 구성', source: '이 기기', content: savedSets(localSaved) || emptyState(isCount(saved) && saved > 0 ? `저장한 구성 ${formatNumber(saved)}개` : '저장한 구성이 아직 없어요.', '#teacher', '자료 만들기') }
    };
    const order = teacher ? ['designs', 'saved', 'materials', 'units', 'study'] : ['units', 'study', 'materials', 'designs', 'saved'];
    return `<section class="account-v7 account-surface account-dashboard" aria-labelledby="account-page-title">
      <header class="account-heading">
        <div>
          <h1 id="account-page-title">마이페이지</h1>
          ${signedIn && (displayName || phoneMasked) ? `<p class="account-subtitle">${escape(displayName || phoneMasked)}</p>` : ''}
        </div>
        <div class="account-heading-actions">
          ${teacher ? '<a class="account-class-link" href="#classroom">반 관리 <span aria-hidden="true">→</span></a>' : ''}
          ${signedIn ? '<button type="button" class="account-text-button" data-account-action="logout">로그아웃</button>' : '<a class="account-primary" href="#login" data-account-action="login">로그인</a>'}
        </div>
      </header>
      <nav class="account-nav" aria-label="마이페이지 메뉴">
        ${order.map(key => `<button type="button" data-account-section="${key}" aria-controls="account-${key}">${sections[key].title}</button>`).join('')}
        <a href="#account-settings">계정 관리</a>
        <a href="#help">이용 안내</a>
      </nav>
      ${order.map(key => {
        const { title, source, content } = sections[key];
        return `<section class="account-section" id="account-${key}" tabindex="-1" aria-labelledby="account-${key}-title"><div class="account-section-heading"><h2 id="account-${key}-title">${title}</h2><span class="account-source">${source}</span></div>${content}</section>`;
      }).join('')}
    </section>`;
  }

  function settings(state = {}) {
    const { signedIn, displayName, phoneMasked, memberSince, passwordUrl, recoverUrl } = state;
    const details = [['이름', displayName], ['휴대폰 번호', phoneMasked], ['가입일', memberSince]]
      .filter(([, value]) => value)
      .map(([label, value]) => `<div><dt>${label}</dt><dd>${escape(value)}</dd></div>`)
      .join('');
    const recovery = serviceLink(passwordUrl === '#account-password' ? passwordUrl : recoverUrl, '비밀번호 변경');

    return `<section class="account-v7 account-surface account-settings" aria-labelledby="account-settings-title">
      <a class="account-back" href="#account">← 마이페이지</a>
      <header class="account-heading">
        <h1 id="account-settings-title">계정 관리</h1>
        ${signedIn ? '<button type="button" class="account-text-button" data-account-action="logout">로그아웃</button>' : '<a class="account-primary" href="#login" data-account-action="login">로그인</a>'}
      </header>
      <section class="account-section" aria-labelledby="account-profile-title">
        <div class="account-section-heading"><h2 id="account-profile-title">계정 정보</h2></div>
        ${profileDetails(state, details)}
      </section>
      ${recovery ? `<section class="account-section" aria-labelledby="account-security-title"><div class="account-section-heading"><h2 id="account-security-title">보안</h2></div><div class="account-settings-links">${recovery}</div></section>` : ''}
    </section>`;
  }

  function profileDetails({ signedIn, loading, error }, details) {
    if (!signedIn) return '<p class="account-muted">로그인하면 계정 정보를 볼 수 있어요.</p>';
    if (loading) return '<p class="account-muted" role="status">계정 정보 불러오는 중…</p>';
    if (details) return `<dl class="account-profile">${details}</dl>`;
    if (error) return connectionState(error, 'materials');
    return '<p class="account-muted">표시할 계정 정보가 없습니다.</p>';
  }

  window.DSAccountViews = { login, account, settings };
})();
