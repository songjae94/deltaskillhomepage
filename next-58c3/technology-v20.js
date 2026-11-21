/* Load after the main app. SN27 comparisons are for this local preview. */
(() => {
  'use strict';

  if (typeof route !== 'function' || typeof header !== 'function') return;
  const originalRoute = route;
  const sourceNames = { home: '대문', student: '공부', practice: '문제 풀이', timed: '타임어택', csat: '수능 공부', library: '자료실', material: '자료 상세', teacher: '자료 만들기', studio: '자료 만들기', 'print-design': '인쇄 디자인', classroom: '반 관리', progress: '학습 기록', record: '기록 상세', improve: '의견', login: '로그인', account: '마이페이지', 'account-settings': '계정 관리', 'account-password': '비밀번호 변경', benefits: '체험 안내', diagnostic: '단원 진단', 'diagnostic-run': '진단 풀이', 'diagnostic-result': '진단 결과', help: '이용 안내', 'not-found': '이전 화면', upload: '제작 요청', academy: '수업자료', 'exam-week': '모의고사 오답노트', 'technology-about': '델타스킬 기술' };
  const math = contents => `<math display="inline"><mrow>${contents}</mrow></math>`;
  const logFraction = number => math(`<mi mathvariant="normal">log</mi><mfrac><mi>n</mi><mn>${number}</mn></mfrac>`);
  const sum = last => `<munderover><mo>∑</mo><mrow><mi>n</mi><mo>=</mo><mn>2</mn></mrow>${last}</munderover><mi>f</mi><mo>(</mo><mi>n</mi><mo>)</mo>`;
  const stages = [
    {
      id: 'numbers', name: '숫자', title: '수를 바꾼 변형',
      question: `<p>${logFraction(7)}의 실수인 <i>n</i>제곱근 개수 <i>f(n)</i>을 더합니다.</p>${math(sum('<mn>14</mn>'))}`,
      changed: '로그의 분모와 합을 구하는 범위', shared: '제곱근 차수의 홀짝과 로그 값의 부호를 보고 개수를 셉니다.'
    },
    {
      id: 'expression', name: '표현', title: '조건을 다시 쓴 변형',
      question: `<p><i>m</i>을 2부터 12까지 바꾸며, 방정식의 서로 다른 실근 개수를 더합니다.</p>${math('<msup><mi>x</mi><mi>m</mi></msup><mo>=</mo><msub><mi mathvariant="normal">log</mi><mn>2</mn></msub><mfrac><mi>m</mi><mn>9</mn></mfrac>')}`,
      changed: '제곱근의 개수를 거듭제곱 방정식의 실근 개수로 표현', shared: '차수의 홀짝과 우변의 부호로 실근 개수를 판단합니다.'
    },
    {
      id: 'question', name: '질문', title: '구하는 것을 바꾼 변형',
      question: `<p>${logFraction(6)}의 실수인 <i>n</i>제곱근 개수 <i>f(n)</i>을 더해, 합이 21이 되는 <i>m</i>을 찾습니다.</p>${math(sum('<mi>m</mi>') + '<mo>=</mo><mn>21</mn>')}`,
      changed: '합을 구하는 대신 합을 제시하고 마지막 번호를 질문', shared: '각 항에서 실수인 제곱근의 개수를 판단해 누적합니다.'
    }
  ];
  const exponentProduct = (radicand, base) => math(`<mroot><mn>${radicand}</mn><mn>3</mn></mroot><mo>×</mo><msup><mn>${base}</mn><mrow><mo>−</mo><mfrac><mn>1</mn><mn>3</mn></mfrac></mrow></msup>`);
  const triangle = (denominator, area) => `<p>다음 조건을 만족하는 삼각형 ABC에서 BC의 길이를 구합니다.</p>${math(`<mi mathvariant="normal">sin</mi><mi>A</mi><mo>:</mo><mi mathvariant="normal">sin</mi><mi>B</mi><mo>=</mo><mn>3</mn><mo>:</mo><mn>4</mn><mo>,</mo><mi mathvariant="normal">cos</mi><mi>C</mi><mo>=</mo><mfrac><mn>1</mn><mn>${denominator}</mn></mfrac>`)}<p>외접원의 넓이 ${math(`<mn>${area}</mn><mi>π</mi>`)}</p>`;
  const cases = [
    { id: 'exam-1', tab: '수능 공통 1번 · 2점', meta: '2027학년도 수능 공통 1번 · 2점 · 변형 예시', title: '거듭제곱식의 값', original: exponentProduct(32, 4), rule: '밑을 통일하고 지수를 더합니다.', stages: [{ id: 'numbers', name: '숫자', title: '밑과 근호 안의 수를 바꾼 변형', question: exponentProduct(243, 9), changed: '근호 안의 수 32 → 243, 음의 지수의 밑 4 → 9', shared: '두 인수를 같은 밑의 거듭제곱으로 고쳐 지수를 모읍니다.' }] },
    { id: 'exam-10', tab: '수능 공통 10번 · 4점', meta: '2027학년도 수능 공통 10번 · 4점 · 변형 예시', title: '삼각형에서 변의 길이', original: triangle(3, 17), rule: '사인의 비를 변의 비로 읽고 외접원의 반지름을 이용합니다.', stages: [{ id: 'numbers', name: '숫자', title: '코사인 값과 외접원 넓이를 바꾼 변형', question: triangle(2, 13), changed: '코사인 값 1/3 → 1/2, 외접원의 넓이 17π → 13π', shared: '사인의 비를 대변의 비로 바꾸고 외접원을 이용해 변의 길이를 정합니다.' }] },
    { id: 'school-14', tab: '고2 9월 학평 14번', meta: '2026년 9월 고2 전국연합학력평가 14번 · 공개 변형 사례', title: '실수인 제곱근의 개수', original: `<p>${logFraction(5)}의 실수인 <i>n</i>제곱근 개수 <i>f(n)</i>을 더합니다.</p>${math(sum('<mn>10</mn>'))}`, rule: '각 항에서 제곱근 차수의 홀짝과 로그 값의 부호를 확인합니다.', stages }
  ];
  let chosenCase = cases[0];
  let stageIndex = 0;
  const examSubjects = window.DSTechSN27V25?.subjects ?? window.DSTechSN27V23?.subjects ?? [];
  const examStages = { '1': '1단계 · 숫자', '2': '2단계 · 표현', '3a': '3단계 · 질문 ①', '3b': '3단계 · 질문 ②', '4a': '4단계 · 연결 ①', '4b': '4단계 · 연결 ②' };
  const examSelection = { subject: 'common', number: String(window.DSHeroCompareContentV43.questionNumber), stage: '3a' };
  const entities = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
  const escape = value => String(value ?? '').replace(/[&<>"']/g, char => entities[char]);
  let returnPoint = null;
  let showingTechnology = false;

  function sourcePage(hash) {
    const [path, ...parts] = (hash.slice(1) || 'home').split('/');
    if (!Object.hasOwn(sourceNames, path)) return null;
    if (!parts.length) return { hash: '#' + path, label: sourceNames[path] };
    if (parts.length !== 1 || !['material', 'record'].includes(path)) return null;
    let id;
    try { id = decodeURIComponent(parts[0]); } catch { return null; }
    const allowed = path === 'material' ? /^NS-[A-Z0-9]+-\d+$/.test(id) : /^[A-Za-z0-9][A-Za-z0-9_-]{0,159}$/.test(id);
    return allowed ? { hash: `#${path}/${encodeURIComponent(id)}`, label: sourceNames[path] } : null;
  }

  const requestLink = () => '<div class="techv20-request"><a href="#upload">사진·PDF로 제작 요청 <span aria-hidden="true">→</span></a><small>요청서 미리보기</small></div>';

  function variant(stage) {
    return `<span class="techv20-item-type">변형 문항</span><h3>${stage.title}</h3><div class="techv20-equation">${stage.question}</div>
      <dl class="techv20-compare-terms"><div><dt>바뀐 것</dt><dd>${stage.changed}</dd></div><div><dt>이어 쓰는 판단</dt><dd>${stage.shared}</dd></div></dl>`;
  }

  const currentExamSubject = () => examSubjects.find(subject => subject.id === examSelection.subject);
  const currentExamItem = () => currentExamSubject()?.items.find(item => String(item.no) === examSelection.number);

  function examNumberOptions() {
    const options = currentExamSubject()?.items ?? [];
    return `<option value="">번호 선택</option>${options.map(item => `<option value="${item.no}"${String(item.no) === examSelection.number ? ' selected' : ''}>${item.no}번 · ${item.points}점</option>`).join('')}`;
  }

  function examPicker() {
    if (!examSubjects.length) return '';
    return `<nav class="techv25-numbers" aria-label="수능 번호별 변형 보기">${examSubjects.map(subject => `<div class="techv25-number-group"><span>${escape(subject.label)}</span><div>${subject.items.map(item => `<button type="button" data-tech-number="${item.no}" data-tech-subject="${escape(subject.id)}" aria-label="${escape(subject.label)} ${item.no}번 · ${item.points}점" aria-controls="techv20-comparison" aria-pressed="${subject.id === examSelection.subject && String(item.no) === examSelection.number}">${item.no}</button>`).join('')}</div></div>`).join('')}</nav>`;
  }

  function examPlate(data, label) {
    if (!data) return '<p class="techv20-rule">이 지면은 준비 중입니다.</p>';
    const file = escape(data.src);
    return `<figure class="techv20-plate"><img src="${file}" width="${data.width}" height="${data.height}" alt="${escape(label)}" decoding="async"><figcaption><a href="${file}" target="_blank" rel="noopener">지면 크게 보기 <span aria-hidden="true">↗</span><span class="sr-only"> 새 탭</span></a></figcaption></figure>`;
  }

  function examComparison(item) {
    if(examSelection.subject==='common' && Number(item.no)===window.DSHeroCompareContentV43.questionNumber && window.DSHQComparisonV48) return window.DSHQComparisonV48.render();
    const label = `${currentExamSubject().label} ${item.no}번`;
    const notes = window.DSTechComparisonsV25?.[`${examSelection.subject}-${item.no}`];
    const titles = ['숫자', '표현', '질문', '연결'];
    const section = level => {
      const variants = item.variants.filter(stage => stage.id.startsWith(String(level)));
      return `<section class="techv25-stage" id="techv25-stage-${level}" aria-labelledby="techv25-stage-title-${level}"><header><span>0${level}</span><div><p>${level}단계 변형</p><h3 id="techv25-stage-title-${level}">${titles[level-1]}</h3></div></header><div class="techv25-stage-cases">${variants.map((stage,index) => {
        const detail = notes?.stages?.[stage.id];
        return `<article class="techv25-stage-case" data-variation="${stage.id}">${variants.length>1 ? `<p class="techv25-case-label">변형 ${index+1}</p>` : ''}${detail ? `<dl class="techv25-difference"><div><dt>유지되는 것</dt><dd>${escape(detail.kept)}</dd></div><div><dt>바뀌는 것</dt><dd>${escape(detail.changed)}</dd></div></dl>` : ''}<div class="techv25-question-sheet">${examPlate(stage,`${label} ${examStages[stage.id]} 변형`)}</div>${stage.comparison ? `<details class="techv25-source-notes"><summary>변형 설명 자세히 보기 <span>+</span></summary>${examPlate(stage.comparison,`${label} ${examStages[stage.id]} 바뀐 것과 그대로인 것`)}${stage.connection ? examPlate(stage.connection,`${label} ${examStages[stage.id]} 연결의 변화`) : ''}</details>` : ''}</article>`;
      }).join('')}</div></section>`;
    };
    return `<div class="techv20-heading techv20-exam-heading"><p><strong>${escape(label)} · ${item.points}점</strong> <span>${escape(item.unit)}</span></p><div class="techv25-stage-nav" role="group" aria-label="변형 단계로 이동">${[1,2,3,4].map(level=>`<button type="button" data-tech-jump="${level}">${level}단계 · ${titles[level-1]} <span aria-hidden="true">↓</span></button>`).join('')}</div></div><div class="techv25-all-stages"><aside class="techv25-original-column" aria-label="수능 원문항"><div class="techv25-original-sheet"><span class="techv20-item-type">원문항 · ${escape(label)}</span>${examPlate(item.original,`${label} 원문항`)}</div>${notes?.originalIdea ? `<div class="techv25-original-idea"><span>이 문제의 핵심</span><p>${escape(notes.originalIdea)}</p></div>` : ''}<p class="techv25-flow-caption">원문항에서<br><strong>4단계 변형까지.</strong></p></aside><div class="techv25-stage-list">${[1,2,3,4].map(section).join('')}</div></div>`;
  }

  function comparison() {
    const item = currentExamItem();
    if (item) return examComparison(item);
    const sample = chosenCase;
    const buttons = sample.stages.length > 1 ? `<div class="techv20-levels" role="group" aria-label="변형 방식">${sample.stages.map((stage, index) => `<button type="button" data-tech-step="${stage.id}" aria-controls="techv20-variant" aria-pressed="${stageIndex === index}">${stage.name}</button>`).join('')}</div>` : '';
    return `<div class="techv20-heading"><p>${sample.meta}</p>${buttons}</div>
      <div class="techv20-spread">
        <section class="techv20-original" aria-labelledby="techv20-original-title"><span class="techv20-item-type">원문항</span><h3 id="techv20-original-title">${sample.title}</h3><div class="techv20-equation">${sample.original}</div><p class="techv20-rule">${sample.rule}</p></section>
        <section class="techv20-variant" id="techv20-variant" aria-live="polite" aria-label="선택한 변형 문항">${variant(sample.stages[stageIndex])}</section>
      </div>`;
  }

  function printPhoto() {
    const first = examSubjects.find(subject => subject.id === 'common')?.items.find(item => item.no === window.DSHeroCompareContentV43.questionNumber);
    const hq = window.DSHQComparisonV48;
    const renderProof = (plate, alt, fallback) => plate ? `<img class="techv24-proof" src="${escape(plate.src)}" width="${plate.width}" height="${plate.height}" alt="${alt}">` : fallback;
    return `<figure class="techv24-photo"><div class="techv24-photo-stage"><img class="techv24-photo-ground" src="assets/editorial/paper-flatlay-v15.png" width="1024" height="1536" alt="" fetchpriority="high">
      <div class="techv24-print"><div><p>${escape(window.DSHeroCompareContentV43.sourceLabel)}</p>${hq ? hq.plate(0,false,false) : renderProof(first?.original, '수능 대표 문항 원문 지면', '')}</div>
      <div><p>4단계 · 판단 하나 더</p>${hq ? hq.plate(4) : renderProof(first?.variants.find(stage => stage.id === '4a'), '수능 대표 문항 4단계 변형 지면', '')}</div></div></div></figure>`;
  }

  function page() {
    const back = returnPoint ?? { hash: '#csat', label: '수능 공부' };
    return `<article class="techv20 techv24 techv25" aria-labelledby="techv20-title">
      <header class="techv20-hero"><div class="techv24-intro"><a class="techv20-back" href="${back.hash}"><span aria-hidden="true">←</span> ${back.label}</a><p class="techv25-signature">DELTASKILL TECHNOLOGY</p><h1 id="techv20-title">변형문항 만들기</h1><p class="techv20-lead">풀이를 분석하고,<br>다음 문제를 만듭니다.</p><a class="techv25-patent-link" href="#technology-about">특허출원 · AI 학습 기술 <span aria-hidden="true">↗</span></a>${requestLink()}</div>${printPhoto()}</header>
      <section class="techv20-sample" aria-labelledby="techv20-example">
        <div class="techv25-section-title"><h2 id="techv20-example">이 문제, 이렇게 바뀝니다.</h2><p>수능 문항별 · 원문과 단계별 변형</p></div>
        ${examPicker()}
        <details class="techv25-extra"><summary>고2 학평 변형 사례도 보기</summary><div class="techv20-cases" role="group" aria-label="비교할 학평 문항">${cases.filter(sample => sample.id === 'school-14').map(sample => `<button type="button" data-tech-case="${sample.id}" aria-controls="techv20-comparison" aria-pressed="${!currentExamItem() && sample === chosenCase}">${sample.tab}</button>`).join('')}</div></details>
        <div id="techv20-comparison">${comparison()}</div>
        <div class="techv20-sample-footer">${requestLink()}<p class="techv20-source"><a href="https://www.deltaskill.co.kr/features/variation.html" target="_blank" rel="noopener">고2 학평 공개 사례 보기 <span aria-hidden="true">↗</span><span class="sr-only"> 새 탭</span></a></p></div>
      </section>
      <section class="techv20-method" aria-labelledby="techv20-method-title"><p class="techv25-signature">THE TECHNOLOGY</p><h2 id="techv20-method-title">문제의 겉모양보다,<br>풀이의 구조를 봅니다.</h2><ol>
        <li><strong>풀이 분석</strong><span>문제를 풀 때 필요한 핵심 판단을 찾습니다.</span></li><li><strong>변형 후보 자동 생성</strong><span>유지할 판단과 바꿀 수·표현·질문을 정합니다.</span></li><li><strong>조건과 답 확인</strong><span>변형한 문항의 조건과 답, 풀이의 관계를 다시 확인합니다.</span></li>
      </ol></section>
      <section class="techv25-technology-link"><div><p class="techv25-signature">DELTASKILL AI · 특허출원 5건</p><h2>델타스킬 기술</h2><p>문항 분석부터 변형, 다음 공부를 위한 진단까지.</p></div><a href="#technology-about">기술과 출원번호 보기 <span aria-hidden="true">→</span></a></section>
      <section class="techv20-evidence" aria-label="공개 수능 사례와 분석 범위">
        <div class="techv20-csat"><h2>수능 원문 출처</h2><p><a href="https://wdown.ebsi.co.kr/W61001/01exam/20261119/go3/live_main_paper_1_math_K63RYJL3.pdf" target="_blank" rel="noopener">한국교육과정평가원 문제지 · EBSi <span aria-hidden="true">↗</span><span class="sr-only"> 새 탭</span></a></p></div>
        <div class="techv20-count"><p class="techv20-kicker">2016. 3. – 2026. 7. · 공개 분석</p><h2>문항별 정답률을 모았습니다.</h2><dl><div><dt>분석한 시험</dt><dd>73<span>개</span></dd></div><div><dt>실측 정답률을 확보한 문항</dt><dd>3,360<span>개</span></dd></div></dl><p><a href="https://www.deltaskill.co.kr/" target="_blank" rel="noopener">공개 분석 출처 <span aria-hidden="true">↗</span><span class="sr-only"> 새 탭</span></a></p></div>
      </section>
    </article>`;
  }

  function captureEntry(event) {
    const entry = event.target.closest?.('a[href="#technology"]');
    if (!entry || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    const current = sourcePage(location.hash);
    if (!current) { returnPoint = null; return; }
    const marker = entry.dataset.techReturn;
    returnPoint = { ...current, x: window.scrollX, y: window.scrollY, marker, index: entryLinks(marker).indexOf(entry) };
  }

  const entryLinks = marker => Array.from(document.querySelectorAll('a[href="#technology"]')).filter(item => item.dataset.techReturn === marker);

  function navigate(event) {
    if (location.hash !== '#technology') {
      const point = showingTechnology && returnPoint?.hash === sourcePage(location.hash)?.hash ? returnPoint : null;
      showingTechnology = false;
      originalRoute(event);
      if (point) window.requestAnimationFrame(() => {
        if (sourcePage(location.hash)?.hash !== point.hash) return;
        const entries = entryLinks(point.marker);
        (entries[point.index] || entries[0])?.focus({ preventScroll: true });
        window.scrollTo({ left: point.x, top: point.y, behavior: 'instant' });
      });
      return;
    }

    const content = document.getElementById('content');
    if (!content) return;
    showingTechnology = true;
    if (typeof cinemaTimer !== 'undefined') clearTimeout(cinemaTimer);
    if (typeof clock !== 'undefined') clearInterval(clock);
    if (typeof timed !== 'undefined') timed = false;
    if (typeof diagnosticClock !== 'undefined') clearInterval(diagnosticClock);
    header('technology');
    content.innerHTML = page();
    window.DSHQComparisonV48?.connect(content);
    window.scrollTo(0, 0);
    content.focus({ preventScroll: true });
  }

  document.addEventListener('click', captureEntry, true);
  function syncComparison(root) {
    const item = currentExamItem();
    for (const link of root.querySelectorAll('button[data-tech-case]')) link.setAttribute('aria-pressed', String(!item && link.dataset.techCase === chosenCase.id));
    root.querySelector('#techv20-comparison').innerHTML = comparison();
    window.DSHQComparisonV48?.connect(root);
    for (const button of root.querySelectorAll('[data-tech-number]')) button.setAttribute('aria-pressed', String(button.dataset.techSubject === examSelection.subject && button.dataset.techNumber === examSelection.number));
  }


  document.addEventListener('click', event => {
    const button = event.target.closest?.('button[data-tech-step], button[data-tech-case], button[data-tech-number], button[data-tech-scroll], button[data-tech-jump]');
    const root = button?.closest('.techv20');
    if (!root) return;
    if (button.dataset.techJump) { window.DSHQComparisonV48?.focus(root,Number(button.dataset.techJump)); root.querySelector('#techv25-stage-' + button.dataset.techJump)?.scrollIntoView({behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth', block: 'start'}); return; }
    if (button.dataset.techScroll) { root.querySelector('#' + button.dataset.techScroll)?.scrollIntoView({behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth', block: 'start'}); return; }
    if (button.dataset.techNumber) {
      const subject = examSubjects.find(entry => entry.id === button.dataset.techSubject);
      if (!subject?.items.some(item => String(item.no) === button.dataset.techNumber)) return;
      examSelection.subject = subject.id; examSelection.number = button.dataset.techNumber;
      syncComparison(root); return;
    }
    if (button.dataset.techCase) {
      const sample = cases.find(item => item.id === button.dataset.techCase);
      if (!sample || (sample === chosenCase && !currentExamItem())) return;
      chosenCase = sample;
      stageIndex = 0;
      examSelection.number = '';
      const numberField = root.querySelector('[data-tech-exam="number"]');
      if (numberField) numberField.value = '';
      syncComparison(root);
      return;
    }
    const index = chosenCase.stages.findIndex(stage => stage.id === button.dataset.techStep);
    if (index < 0 || index === stageIndex) return;
    stageIndex = index;
    for (const item of root.querySelectorAll('button[data-tech-step]')) item.setAttribute('aria-pressed', String(item === button));
    root.querySelector('#techv20-variant').innerHTML = variant(chosenCase.stages[stageIndex]);
  });

  window.removeEventListener('hashchange', originalRoute);
  route = navigate;
  window.addEventListener('hashchange', navigate);
  if (location.hash === '#technology') navigate();
})();
