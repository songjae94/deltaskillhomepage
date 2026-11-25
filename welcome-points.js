/* Membership copy is shared by signup, both account views and the local preview.
   Balance and personal dates come from the authenticated server response. */
(() => {
  'use strict';
  const priceEnd = Date.parse('2027-01-01T00:00:00+09:00');
  const price = (now = Date.now()) => now < priceEnd ? 15000 : 30000;
  const priceNote = (now = Date.now()) => now < priceEnd ? '2026년 12월 31일(한국시간)까지 신규 가입 월 30,000원 → 50% 할인 15,000원' : '신규 가입 월 30,000원';
  const priceMarkup = (now = Date.now()) => now < priceEnd
    ? '<div class="wp-price-offer"><div class="wp-list-price"><span>정가</span> <del>30,000원</del></div><div class="wp-sale-price"><span>할인가</span> <strong>15,000원</strong><span> / 월</span></div><div class="wp-sale-term"><b>50% 할인</b> · 2026년 12월 31일까지 (한국시간)</div></div>'
    : '<div class="wp-price-offer"><div class="wp-sale-price"><span>신규 가입 요금</span> <strong>30,000원</strong><span> / 월</span></div></div>';
  window.DSMonthlyPrice = {amount:price, note:priceNote, markup:priceMarkup};
  const clock = new Intl.DateTimeFormat('ko-KR', {
    timeZone: 'Asia/Seoul', month:'long', day:'numeric', hour:'2-digit', minute:'2-digit', hourCycle:'h23'
  });
  const date = value => typeof value === 'string' && Number.isFinite(Date.parse(value))
    ? clock.format(new Date(value)) : '';
  const number = points => points.toLocaleString('ko-KR');
  const unavailable = '<p>포인트 잔액을 확인할 수 없습니다. 잠시 후 다시 확인해 주세요.</p>';
  // 무료 기간 판(2026-12-31 까지 · 50,000P 한 번) + 보상 10,000P(만료 없음) — 서버 mode:'free_period' · 무료 기간 뒤 남은 보상은 mode:'reward'.
  // 쓰는 차례는 서버가 정함: 먼저 만료되는 무료 기간 포인트부터.
  const freeEnd = Date.parse('2027-01-01T00:00:00+09:00');
  const grantMode = s => s?.mode === 'free_period' || s?.mode === 'reward';
  const freeOk = s => s && grantMode(s) && s.ready === true && s.status === 'active' && s.eligible === true &&
    Number.isInteger(s.weekly) && s.weekly > 0 && s.weekly <= 1000000 && s.total_cap === s.weekly &&
    [s.remaining, s.free_remaining, s.reward_remaining].every(v => Number.isInteger(v) && v >= 0) &&
    s.remaining === s.free_remaining + s.reward_remaining && s.remaining <= s.weekly &&
    (s.mode === 'reward' ? s.free_remaining === 0 : !!date(s.expires_at));
  const welcomeOk = s => s && s.ready === true && s.status === 'active' && s.eligible === true && Number.isInteger(s.period_index) &&
    s.period_index >= 1 && s.period_index <= 3 && s.weekly === 3000 &&
    Number.isInteger(s.remaining) && s.remaining >= 0 && s.remaining <= s.period_index * 3000;
  function balance(s) {
    if (!s) return unavailable;
    if (grantMode(s)) {
      if (s.status === 'pending') return '<p>회원 기록을 확인하고 있습니다. 마이페이지에서 포인트 상태를 다시 확인해 주세요.</p>';
      if (!freeOk(s)) return unavailable;
      const facts = (s.mode === 'free_period' ? '<div><dt>무료 기간 포인트 · 2026년 12월 31일 23:59 만료</dt><dd>'+number(s.free_remaining)+' P</dd></div>' : '')+
        (s.reward_remaining > 0 || s.mode === 'reward' ? '<div><dt>보상 포인트 · 만료 없음</dt><dd>'+number(s.reward_remaining)+' P</dd></div>' : '');
      return '<p class="wp-period">'+(s.mode === 'free_period' ? '무료 기간 · 2026년 12월 31일까지' : '보상 포인트')+'</p><p class="wp-balance"><strong>'+
        number(s.remaining)+' P</strong> 사용 가능</p><dl class="wp-facts">'+facts+'</dl>';
    }
    if (Date.now() >= freeEnd && (s.status === 'ineligible' || s.status === 'expired'))
      return '<p>2026년 12월 31일로 무료 기간 포인트가 만료되었습니다. 이미 받은 파일은 <a href="/my/#library">내 파일에서 다시 받기</a>로 이용할 수 있습니다.</p>';
    if (s.status === 'ineligible') return '<p>신규 가입 3주 혜택 대상이 아닙니다.</p>';
    if (s.status === 'expired') return '<p>가입 후 3주가 지나 남은 혜택 포인트가 만료되었습니다. 이미 받은 파일은 <a href="/my/#library">내 파일에서 다시 받기</a>로 이용할 수 있습니다.</p>';
    if (s.status === 'pending') return '<p>가입 기록을 확인하고 있습니다. 마이페이지에서 지급 상태를 다시 확인해 주세요.</p>';
    if (!welcomeOk(s) || !date(s.period_end) || !date(s.expires_at)) return unavailable;
    return '<p class="wp-period">가입 '+s.period_index+'주차 · 총 3주</p><p class="wp-balance"><strong>'+
      number(s.remaining)+' P</strong> 사용 가능</p><dl class="wp-facts"><div><dt>지금까지 누적 지급</dt><dd>'+number(s.period_index * 3000)+' P</dd></div><div><dt>'+
      (s.period_index === 3 ? '혜택 종료 · 잔액 만료' : '다음 3,000 P 지급')+'</dt><dd>'+date(s.period_end)+' (한국시간)</dd></div></dl>';
  }
  const freePolicy = '2026년 12월 31일까지 모든 회원에게 50,000P를 한 번 드립니다. PDF와 한글 자료를 포인트로 받을 수 있고, 남은 무료 기간 포인트는 12월 31일 23:59(한국시간)에 만료됩니다. 문항 오류 첫 제보 · 학교 시험지 첫 파일로 받은 보상 포인트는 만료되지 않으며, 포인트는 먼저 만료되는 무료 기간 포인트부터 씁니다. 2027년 1월 1일부터 유료로 바뀌며, 이미 받은 파일은 계속 다시 받을 수 있습니다.';
  const welcomePolicy = '가입 직후와 7일·14일 뒤에 3,000P씩 지급됩니다. 쓰지 않으면 1·2·3주차에 3,000·6,000·9,000P로 모아 쓸 수 있습니다. 가입 후 3주가 끝나면 남은 혜택 포인트는 만료되며, 이미 받은 파일은 다시 받을 수 있습니다.';
  const policy = s => grantMode(s) || (!s?.mode && Date.now() < freeEnd && s?.status !== 'active') ? freePolicy : welcomePolicy;
  function membership(pass) {
    const next = date(pass?.nextChargeAt), end = date(pass?.endsAt);
    if (pass?.status === 'ACTIVE') return '<p class="wp-period">이용 중'+(next ? ' · 다음 결제 '+next : '')+'</p>';
    if (pass?.status === 'CANCEL_SCHEDULED') return '<p class="wp-period">해지 예약'+(end ? ' · '+end+'까지 이용' : '')+'</p>';
    if (pass?.status === 'NONE') return '<p class="wp-period">미가입</p>';
    const labels = {RENEW_RETRY:'결제 재시도 중', RENEWING:'자동 결제 처리 중', RENEW_FAILED:'이용 종료', REFUNDING:'환불 처리 중', REFUNDED:'환불 완료'};
    return Object.hasOwn(labels,pass?.status) ? '<p class="wp-period">'+labels[pass.status]+'</p>' : '';
  }
  function panel(s, options = {}) {
    const newPrice = price();
    const free = grantMode(s);
    const points = '<section class="wp-section"><h2>'+(s?.mode === 'reward' ? '보상 포인트' : free || (!s && Date.now() < freeEnd) ? '무료 기간 포인트' : '신규 회원 포인트')+'</h2>'+balance(s)+
      '<p class="wp-help">'+policy(s)+'</p>'+
      (free ? (freeOk(s) ? '<a class="wp-link" href="/app/#library">포인트로 자료 고르기 →</a>' : '')
        : welcomeOk(s) ? '<a class="wp-link" href="/app/#library">포인트로 PDF 고르기 →</a>' : '')+'</section>';
    if (options.signup) return points+'<section class="wp-section wp-signup-offer"><h2>월 이용권 신규 가입 요금</h2>'+priceMarkup()+'</section><div class="wp-actions"><a class="wp-link" href="/my/#welcome">내 포인트 확인 →</a><a href="/pass/#product">월 '+number(newPrice)+'원 이용권 안내</a></div>';
    const subscribed = ['ACTIVE','CANCEL_SCHEDULED','RENEWING','RENEW_RETRY'].includes(options.pass?.status);
    const canJoin = ['NONE', 'RENEW_FAILED', 'REFUNDED'].includes(options.pass?.status);
    const joinLink = canJoin ? '<a class="wp-join" href="/pass/#checkout-pass">월 유료회원 가입하기</a>' : '';
    const paymentHelp = subscribed ? '결제 내역, 이용 기간과 자동 갱신 설정을 확인할 수 있습니다.' : '직접 신청하면 매월 자동 결제됩니다. 다음 결제일과 해지는 마이페이지에서 확인할 수 있습니다.';
    const monthlyPrice = subscribed && Number.isSafeInteger(options.pass.amount) && options.pass.amount > 0 ? options.pass.amount : subscribed ? null : newPrice;
    return '<div class="wp-panel">'+points+'<section class="wp-section"><h2>월 유료회원</h2>'+
      membership(options.pass)+(subscribed ? '<p class="wp-own-price-label">내 결제금액</p><p class="wp-balance wp-own-price"><strong>'+(monthlyPrice === null ? '결제금액 확인 중' : number(monthlyPrice)+'원')+'</strong>'+(monthlyPrice === null ? '' : ' / 월')+'</p><div class="wp-new-offer"><p>신규 가입 요금</p>'+priceMarkup()+'</div>' : priceMarkup())+'<p>변형문항 프린트 월 30벌 · 한 벌 20문항</p>'+
      '<p class="wp-help">'+(subscribed ? '기존 이용권의 실제 결제금액을 유지합니다. ' : '')+paymentHelp+'</p>'+
      '<div class="wp-actions">'+joinLink+'<a class="wp-link" href="/pass/#product">이용권 자세히 보기</a><a href="'+
      (options.legacy ? '#pass' : '/my/#pass')+'">내 이용권 관리</a></div></section></div>';
  }
  window.DSWelcomePoints = {panel};
})();
