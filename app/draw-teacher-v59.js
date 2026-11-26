/* v61: guest trial on the v59 draw flow, answer pages on by default for members, design refinement hooks (dq61-*).
   v59: teacher print flow drawn from a server set. v58.3 files stay as they are.
   The page knows display names and opaque set/item ids only. Question bodies are copied through an
   allow-list. A guest (trial) gets question bodies only: no answer, solution, print or keep path exists for a
   guest; those four ask for a sign-in and come back to the same set afterwards. */
(() => {
  'use strict';
  const B = window.DSTeacherBuilderV36;
  if (!B || window.DSDrawTeacherV59) return;
  const safe = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;
  const HTML_NS = 'http://www.w3.org/1999/xhtml', MATH_NS = 'http://www.w3.org/1998/Math/MathML';
  const htmlTags = new Set('article section div p span br b strong em i u sup sub ol ul li table thead tbody tr td th img figure figcaption'.split(' '));
  const mathTags = new Set('math mrow mi mn mo mtext mspace ms mfrac msqrt mroot msub msup msubsup munder mover munderover mtable mtr mtd mfenced mstyle menclose mpadded mmultiscripts mprescripts none semantics annotation'.split(' '));
  const mathAttrs = new Set('display mathvariant stretchy fence separator separators open close accent accentunder linethickness columnalign rowalign columnspacing rowspacing notation displaystyle scriptlevel encoding'.split(' '));
  // v61: the canonical render's structure names that a fragment may carry (box, <보기>, blank, choice rows, table, notes).
  // Presentation only: no name here marks an answer or a solution, and every other class is still dropped.
  const keepClass = new Set('cond-box cond-line 라벨줄 문단틈 문단자국 상자딱지 과정 bogi bt brow 빈칸 본표 넓은표 대각칸 선지표 선지번호 선지그림 선지글 ch5 ch3 ch2 ch1 단서 eqno 식이어줄 수식줄 식꼬리 식번호줄 별행 항목줄 글머리줄 자모줄 라벨 vdots 표딱지 표딱지묶음 표제목 tbl-right 그림줄안 fig 어절'.split(' '));
  const FIELDS = [['subject', '과목'], ['unit', '단원'], ['stage', '단계'], ['difficulty', '난도']];
  const COUNTS = [5, 10, 15, 20];
  const SAVED = 'dq59-saved', BACK = 'dq61-trial-back', TALLY = 'dq62-trial-seen';
  const TRIAL_DAILY = 20;                      // guest questions a day when the server does not state its own number
  const LOCK_SVG = '<svg viewBox="0 0 20 20" aria-hidden="true" focusable="false"><path d="M6.5 9V6.6a3.5 3.5 0 0 1 7 0V9"/><rect x="4.5" y="9" width="11" height="8" rx="2"/></svg>';
  const ALERTS = {
    empty: '과목 · 단원 · 단계 · 난도를 바꿔 다시 구성해 보세요.',
    unauthorized: '<a href="#login" data-dq61-login>로그인하기 ↗</a>',
    forbidden: '<a href="#account">내 포인트·이용권 확인 ↗</a>',
    expired: '<a href="#account">내 포인트·이용권 확인 ↗</a>',
    notreceived: '<a href="#account">내 자료에서 세트 받기 ↗</a>',
    busy: '잠시 뒤 「문항 구성하기」를 다시 눌러 주세요.',
    origin: '델타스킬 홈페이지 주소에서 다시 열어 주세요.',
    nosets: '<a href="#account">내 포인트·이용권 확인 ↗</a>',
    unavailable: '「문항 구성하기」를 다시 눌러 주세요. 계속되면 조건을 바꿔 보세요.',
    changed: '왼쪽에서 조건을 고르고 「문항 구성하기」를 눌러 주세요.',
    notready: '다른 조건을 골라 주세요.',
    menufail: '<button type="button" data-dq-menu>조건 목록 다시 불러오기</button>',
    unconfigured: '잠시 뒤 다시 열어 주세요.',
    trialexpired: '<button type="button" data-dq-redraw>같은 조건으로 다시 구성</button>',
    trialbusy: '<a href="#login" data-dq61-login>로그인하기 ↗</a>',
    trialrate: '잠시 뒤 「문항 구성하기」를 다시 눌러 주세요.'
  };
  const TEXT = {
    loading: '문항을 불러오는 중입니다.',
    empty: '이 조건으로 제공할 문항이 아직 없습니다. 다른 조건을 골라 주세요.',
    unauthorized: '로그인한 뒤 문항을 구성할 수 있습니다.',
    forbidden: '이 조건의 문항을 열 수 있는 이용권이 없습니다.',
    expired: '이용권 기간이 끝났습니다.',
    notreceived: '이 세트를 아직 받지 않았습니다.',
    busy: '요청이 많습니다. 잠시 뒤 다시 눌러 주세요.',
    origin: '이 주소에서는 문항을 불러올 수 없습니다.',
    nosets: '현재 계정에서 사용할 수 있는 프린트 자료가 없습니다.',
    unavailable: '문항을 불러오지 못했습니다. 잠시 뒤 다시 시도해 주세요.',
    unconfigured: '문항 서버 연결을 기다리고 있습니다.',
    notready: '이 범위에서 구성할 문항을 확인하지 못했습니다.',
    menufail: '조건 목록을 불러오지 못했습니다.',
    lastpage: '이 조건에서 더 넘길 문항이 없습니다.',
    solloading: '정답 · 해설을 불러오는 중입니다.',
    solok: '정답 · 해설 면을 붙였습니다.',
    solforbidden: '이 세트는 정답 · 해설을 제공하지 않습니다.',
    solfail: '정답 · 해설을 불러오지 못했습니다.',
    solwait: '해설을 붙이는 중입니다. 다 붙으면 인쇄 창이 열립니다.',
    savefail: '이 기기에 보관하지 못했습니다. 브라우저 저장 공간을 확인해 주세요.',
    changed: '보관한 구성의 문항이 바뀌었습니다. 조건을 골라 다시 구성해 주세요.',
    saved: '이 기기에 임시 보관했습니다.',
    trialexpired: '맛보기 시간이 지났습니다. 다시 구성해 주세요.',
    trialbusy: '지금 맛보기 이용이 많아 잠시 멈췄습니다. 로그인하면 바로 구성할 수 있습니다.',
    trialrate: '잠시 뒤 다시 눌러 주세요.',
    renewed: '같은 조건으로 새로 구성했습니다.',
    claimshort: '포인트가 모자라 방금 본 구성을 받지 못했습니다. 문항 수를 줄여 다시 구성해 주세요.'
  };

  // ── host: the local member preview, or a test double supplied before this file ──
  const memberHost = null;
  const host = () => window.DSDrawHostV59 ?? memberHost;

  // ── state ──
  let phase = 'setup', menu = [], sel = {}, drawn = null, note = { kind: '', text: '' }, pending = null;
  let columnRule = false;
  let layout = '2', title = '', page = 0, embedded = 0, printing = false, owner = '', count = 5, withSol = true, waitPrint = false;
  let trialOn = false, limits = null, seenToday = 0, opened = '';
  let approvedTrial = null, trialWake = 0;
  const frames = new Set();
  const studentSurface = () => Boolean(window.DSStudentDownloads?.isPrintActive());
  const here = () => ['#teacher', '#studio'].includes(location.hash) || studentSurface();
  const printSurface = () => studentSurface() || B.snapshot().mode === 'print';
  const sharedPrint = () => !embedded && here() && printSurface();
  const listed = () => menu.filter(r => r.ready);
  const rows = prefix => listed().filter(r => FIELDS.every(([k]) => !(k in prefix) || r[k] === prefix[k]));
  const current = () => listed().find(r => FIELDS.every(([k]) => r[k] === sel[k]));
  const label = r => `${r.subject} · ${r.unit} · ${r.stage}단계 · ${r.difficulty}`;
  const guestSettings = () => Boolean(host()?.trial && !host().signedIn());
  const guest = () => { const h = host(); return Boolean(trialOn && h?.trial && !h.signedIn()); };
  const daily = () => limits?.daily_items ?? TRIAL_DAILY;
  const leftToday = () => Math.max(0, daily() - seenToday);
  // What one guest draw may hold: the set's size, the server's per-draw cap and what is left today.
  const guestCap = row => Math.min(row?.size ?? 0, limits?.max_items ?? 0, leftToday());
  function settle() {
    if (!listed().length) return;
    // Keep the choice valid from left to right.
    const prefix = {};
    for (const [k] of FIELDS) {
      const options = rows(prefix);
      const scopedSubject = !guestSettings() && k === 'subject' &&
        window.DSPrintScopeData?.subjects?.some(s => s.subject === sel.subject);
      if (!scopedSubject && !options.some(r => r[k] === sel[k])) sel[k] = options[0]?.[k] ?? '';
      prefix[k] = sel[k];
    }
  }
  function say(kind, n) {
    note = { kind, text: kind === 'ok' ? `${n}문항을 구성했습니다.` : kind === 'insufficient' ? `이 조건에 맞는 문항은 ${n}문항입니다. 그대로 프린트를 만들 수 있습니다.` : TEXT[kind] || '' };
  }
  const validSaved = x => x && typeof x.title === 'string' && UUID.test(x.key) && Array.isArray(x.ids) && x.ids.length >= 1 && x.ids.length <= 20 && (x.page === undefined || Number.isInteger(x.page)) && (x.count === undefined || Number.isInteger(x.count)) && new Set(x.ids).size === x.ids.length && x.ids.every(i => typeof i === 'string' && UUID.test(i)) && x.labels && FIELDS.every(([k]) => typeof x.labels[k] === 'string' && x.labels[k].length <= 60);
  function savedList() { if (!owner) return []; try { const v = JSON.parse(localStorage.getItem(SAVED + ':' + owner) || '[]'); return Array.isArray(v) ? v.filter(validSaved).slice(0, 12) : []; } catch { return []; } }
  function putSaved(list) { if (!owner) return false; try { localStorage.setItem(SAVED + ':' + owner, JSON.stringify(list.slice(0, 12))); return true; } catch { return false; } }

  // v61: choice rows by measured width — a list without the canonical row name drops a row (5 → 3 → 2 → 1)
  // while any choice does not fit its cell on one line; measured after fonts, for new cards and on resize.
  const fitChoices = () => { for(const l of document.querySelectorAll('.dq59-choices[data-auto],.dq59-choices[data-fit="3"],.dq59-choices[data-fit="2"]')){if(!l.offsetWidth)continue;const o=['5','3','2','1'];let i=Math.max(0,o.indexOf(l.dataset.auto||l.dataset.fit));for(;i<o.length;i++){l.dataset.fit=o[i];if(Array.from(l.children).every(li=>{const w=li.style.whiteSpace;li.style.whiteSpace='nowrap';const ok=li.scrollWidth<=li.clientWidth+1;li.style.whiteSpace=w;return ok;}))break;}}for(const el of document.querySelectorAll('.dq59-card .katex-display,.solbody .katex-display')){el.style.zoom='';el.style.overflowX='';const box=el.parentElement;if(!box||!box.clientWidth)continue;const room=Math.min(el.clientWidth||box.clientWidth,box.clientWidth);if(el.scrollWidth>room+1){const z=Math.max(.6,Math.floor(room/el.scrollWidth*100)/100);el.style.zoom=z;if(el.scrollWidth>el.clientWidth+1){el.style.overflowX='auto';}}} };
  let fitWait = 0;
  const fitSoon = () => { cancelAnimationFrame(fitWait); fitWait = requestAnimationFrame(() => (document.fonts ? document.fonts.ready : Promise.resolve()).then(() => requestAnimationFrame(fitChoices))); };
  if (typeof MutationObserver === 'function' && document.body) new MutationObserver(ms => { if (ms.some(m => Array.from(m.addedNodes).some(n => n.nodeType === 1 && (n.matches?.('.dq59-choices[data-auto]') || n.querySelector?.('.dq59-choices[data-auto]'))))) fitSoon(); }).observe(document.body, { childList: true, subtree: true });
  addEventListener('resize', fitSoon, { passive: true });
  // ── guest tally: the server's own count when it states one, else this browser's count for the day (KST) ──
  const kstDay = () => new Date(Date.now() + 9 * 3600000).toISOString().slice(0, 10);
  function readTally() { try { const v = JSON.parse(localStorage.getItem(TALLY) || 'null'); return v && v.day === kstDay() && Number.isInteger(v.n) ? Math.max(0, v.n) : 0; } catch { return 0; } }
  function writeTally(n) { seenToday = Math.max(0, n); try { localStorage.setItem(TALLY, JSON.stringify({ day: kstDay(), n: seenToday })); } catch {} }

  // ── back after sign-in: one sessionStorage slot, set names and opaque ids only, 30 minutes ──
  function keepBack(want) {
    if (!drawn?.guest) return;
    const value = { v: 1, key: drawn.key, count: drawn.count, labels: drawn.labels, ids: drawn.items.map(q => q.id), want, at: Date.now() };
    try { sessionStorage.setItem(BACK, JSON.stringify(value)); } catch {}
  }
  function takeBack() {
    let x = null;
    try { x = JSON.parse(sessionStorage.getItem(BACK) || 'null'); sessionStorage.removeItem(BACK); } catch { return null; }
    const ok = x && x.v === 1 && /^[A-Za-z0-9_-]{8,80}$/.test(x.key) && COUNTS.includes(x.count) && ['print', 'save', 'solution', 'more'].includes(x.want) &&
      Number.isFinite(x.at) && Date.now() - x.at < 30 * 60000 && Date.now() >= x.at && Array.isArray(x.ids) && x.ids.length <= 20 && x.ids.every(i => typeof i === 'string' && UUID.test(i)) &&
      x.labels && FIELDS.every(([k]) => typeof x.labels[k] === 'string' && x.labels[k].length <= 60);
    return ok ? x : null;
  }
  // Only same-site places: the in-page sign-in comes back through the page's own short list (#teacher);
  // the sign-up page gets a path of this page and checks it again itself.
  function signupHref() {
    const target=studentSurface()?'#student':'#teacher';
    const path = location.pathname + location.search + target;
    return '/auth/?mode=signup&next=' + encodeURIComponent(/^\/[A-Za-z0-9_\-./?#=&%]*$/.test(path) && !path.startsWith('//') ? path : location.pathname + target);
  }
  function keepPrintSettings() {
    window.DSPrintLoginReturn?.save(studentSurface() ? '#student' : '#teacher', {
      sel:{...sel}, scopeLevels:{...scopedLevels()}, count, layout, columnRule, draftTitle, pageNote:{...pageNote}, withSol,
      design:window.DSDocumentDesign?.selected().id, scope:window.DSPrintScope?.snapshot(),
      openSections:[...document.querySelectorAll('#dq59-form details[data-print-option][open]')].map(box=>box.dataset.printOption)
    });
  }
  function goLogin() { window.DSLoginReturn = studentSurface() ? '#student' : '#teacher'; location.hash = '#login'; }

  // ── question markup: copy supported static nodes into a new tree ──
  function questionBody(id, payload) {
    if (!payload || payload.item_id !== id || typeof payload.question_html !== 'string' || payload.question_html.length > 1048576) throw Error('render');
    return cleanBody(payload.question_html, false);
  }
  // solution = true only for the answer pages of a print: the names that mark a solution are expected there.
  function cleanBody(html, solution) {
    if (typeof html !== 'string' || html.length > 1048576) throw Error('render');
    const source = document.createElement('template');
    source.innerHTML = html;
    let count = 0;
    function copy(node, depth) {
      if (++count > 16000 || depth > 80) throw Error('render');
      if (node.nodeType === Node.TEXT_NODE) return document.createTextNode(node.data);
      if (node.nodeType === Node.COMMENT_NODE) return document.createTextNode('');
      if (node.nodeType !== Node.ELEMENT_NODE) throw Error('render');
      const tag = node.localName, math = node.namespaceURI === MATH_NS;
      if (!(math ? mathTags.has(tag) : node.namespaceURI === HTML_NS && htmlTags.has(tag))) throw Error('render');
      if (!solution && /(?:^|[\s_-])(?:answer|answers|solution|solutions|sol|explanation|정답|해설|풀이)(?:$|[\s_-])/i.test(node.getAttribute('class') || '')) throw Error('render');
      const dest = document.createElementNS(node.namespaceURI, tag);
      for (const a of node.attributes) {
        if (math && a.name === 'encoding' && !(tag === 'annotation' && a.value === 'application/x-tex')) throw Error('render');
        else if (math && ['displaystyle', 'scriptlevel'].includes(a.name) && !/^(?:true|false|[0-2])$/.test(a.value)) throw Error('render');
        else if (math && mathAttrs.has(a.name)) dest.setAttribute(a.name, a.value);
        else if (!math && a.name === 'class') { const kept = a.value.split(/\s+/).filter(c => keepClass.has(c)); if (kept.length) dest.setAttribute('class', kept.join(' ')); }
        else if (math && a.name === 'xmlns' && a.value === MATH_NS) continue;
        else if (tag === 'img' && a.name === 'src' && /^data:image\/(?:png|jpeg|webp|gif);base64,[A-Za-z0-9+/]+=*$/i.test(a.value)) dest.setAttribute('src', a.value);
        else if (tag === 'img' && a.name === 'alt') dest.setAttribute('alt', a.value);
        else if (tag === 'img' && a.name === 'width' && /^[1-9]\d{0,3}$/.test(a.value)) dest.setAttribute('width', a.value);   // canonical figure width (with max-width:100%)
        else if (['td', 'th'].includes(tag) && ['rowspan', 'colspan'].includes(a.name) && /^[1-9]\d?$/.test(a.value)) dest.setAttribute(a.name, a.value);
        else if (a.name === 'class') continue;
        else throw Error('render');
      }
      if (tag === 'img' && !dest.hasAttribute('src')) throw Error('render');
      for (const child of node.childNodes) dest.append(copy(child, depth + 1));
      return dest;
    }
    const body = document.createElement('div');
    body.className = 'dq59-body ' + (solution ? 'dq61-s' : 'dq61-q');   // v61: canonical render rules (draw-math-v61.css) scope
    for (const node of source.content.childNodes) body.append(copy(node, 0));
    if (!body.textContent.trim() && !body.querySelector('img')) throw Error('render');
    dress(body, solution);
    return body;
  }
  // Our own presentation hooks only: the card carries the number, choices get ①~⑤.
  function dress(body, solution) {
    const walker = document.createTreeWalker(body, NodeFilter.SHOW_TEXT);
    for (let t = walker.nextNode(); t && !solution; t = walker.nextNode()) {
      if (!t.data.trim()) continue;
      if (!t.parentElement.closest('math,table,li')) t.data = t.data.replace(/^\s*\d{1,2}\s*[.)]\s+/, '');
      break;
    }
    const lists = [...body.querySelectorAll('ol,ul')].filter(l => !l.closest('table') && l.children.length >= 2 && l.children.length <= 5);
    const list = solution ? null : lists.at(-1);
    if (list) {
      [...list.children].forEach((li, i) => {
        const text = li.textContent.replace(/[⁠⁡]/g, '').trim();
        if (!/^[①②③④⑤]/.test(text)) li.dataset.mark = '①②③④⑤'[i];
      });
      // Respect explicit source layouts. Otherwise measure typeset choices at full size.
      const row = (list.className.match(/\bch([1235])\b/) || [])[1];
      list.classList.add('dq59-choices');
      list.dataset.fit = row || '5';
      if (!row) list.dataset.auto = list.dataset.fit;
    }
    // A blank text token after a comma (as in a coordinate pair) stops the site math renderer and leaves
    // that formula in the browser's own math font; the comma already carries its spacing, so drop it.
    body.querySelectorAll('math mtext').forEach(t => {
      const before = t.previousElementSibling;
      if (!t.textContent.trim() && !t.children.length && before?.localName === 'mo' && /^[,;]$/.test(before.textContent.trim())) t.remove();
    });
    // The package drops the display-style mark the original typesetting carried; put it back so integral, sum,
    // limit and fraction sizes agree from item to item. Cells of a piecewise table stay in text style.
    body.querySelectorAll('math mstyle').forEach(s => {
      const p = s.parentElement, base = p.firstElementChild === s && /^(msubsup|munderover|munder|mover|msub|msup)$/.test(p.localName);
      if (!s.attributes.length && !s.closest('mtd') && !base) s.setAttribute('displaystyle', 'true');
    });
    // Fractions inside a sentence are set at full size (display style), as on the printed exam.
    body.querySelectorAll('math').forEach(m => {
      if (m.getAttribute('display') === 'block' || !m.querySelector('mfrac')) return;
      const style = document.createElementNS(MATH_NS, 'mstyle');
      style.setAttribute('displaystyle', 'true');
      style.append(...m.childNodes);
      m.append(style);
    });
    // The <보기> block arrives as plain nested blocks; give it its frame back.
    body.querySelectorAll('div').forEach(box => {
      if (box.closest('.bogi,.cond-box')) return;          // v61: the canonical frame already came with the fragment
      const head = box.firstElementChild;
      if (!head || box.children.length < 2 || head.children.length || !/^[<〈＜\[]?\s*보\s*기\s*[>〉＞\]]?$/.test(head.textContent.trim())) return;
      box.classList.add('dq59-bogi');
      head.classList.add('dq59-bogi-title');
      head.textContent = '보 기';
    });
    // The (가)(나) condition block arrives as a plain nested block too.
    if (!solution) body.querySelectorAll('div div').forEach(box => {
      if (box.closest('.bogi,.cond-box')) return;
      const lines = [...box.children].filter(c => c.localName === 'span' && /^\((가|나|다|라|마)\)/.test(c.textContent.trim()));
      if (box.querySelector('div') || lines.length < 2 || lines.length !== box.children.length) return;
      box.classList.add('dq59-cond'); lines.forEach(line => line.classList.add('dq59-cond-line'));
    });
    // The trial's own closing line («델타스킬 맛보기 · …») is set as a quiet footnote of the card.
    if (!solution) { const last = [...body.querySelectorAll('p')].at(-1); if (last && /^델타스킬 맛보기/.test(last.textContent.trim())) last.classList.add('dq61-mark'); }
    body.querySelectorAll('table').forEach(t => { const wrap = document.createElement('div'); wrap.className = 'dq59-scroll'; t.replaceWith(wrap); wrap.append(t); });
  }

  // ── print document (problem pages; the answer pages wait for the server) ──
  function printSettings() {
    try { return window.PrintComposerV14.normalizeSettings(studio.printSettings); }
    catch { return { academyName: '', teacherName: '', headerText: '', footerText: '', identityPlacement: 'header', font: 'default', titleAlign: 'left', showStudentName: true, showPageNumber: true }; }
  }
  const expandedSheets = new WeakMap();
  function sheets(items = drawn.items) {
    const limit = Number(layout), saved = expandedSheets.get(items), out = [];
    const expanded = saved?.layout === layout ? saved.indexes : null;
    for (let i = 0; i < items.length;) {
      const start = i, roomy = expanded?.has(i) === true;
      i++;
      while (!roomy && i < items.length && i - start < limit && !expanded?.has(i)) i++;
      out.push({offset:start, items:items.slice(start,i), roomy});
    }
    return out.concat(window.DSDocumentDesign?.records(items)||[]);
  }
  // v61: answers and solutions belong to the set on screen (fetched right after the draw); they go when the set goes.
  function dropFrames() { for (const f of frames) f.remove(); frames.clear(); }
  function dropSolutions(target = drawn) {
    const op = target?.solOp;
    if (op) { clearTimeout(op.timer); op.guard.abort(); }
    if (target) { delete target.solOp; delete target.solutions; delete target.solPages; delete target.solMap; }
    waitPrint = false; dropFrames();
  }
  const paging = d => d.count === 5 && d.page === 0 ? {} : { page: d.page, count: d.count };
  const solOn = () => Boolean(withSol && drawn?.solutions);
  const lockedSol = () => Boolean(drawn?.guest);
  const totalPages = () => sheets().length + (solOn() ? drawn.solPages || 1 : 0) + (lockedSol() ? 1 : 0);
  const pageArg = () => { const q = sheets().length; return page < q ? page : 's' + (page - q); };
  function expandCrowded(body,target) {
    if (!target || Number(layout)<=1) return false;
    const boxes=body.querySelectorAll('.questions:not([data-roomy="1"]) .question[data-needs-space]');
    if (!boxes.length) return false;
    const saved=expandedSheets.get(target.items);
    const indexes=saved?.layout===layout?saved.indexes:new Set();
    const before=indexes.size;
    for(const box of boxes) indexes.add(Number(box.dataset.sourceIndex));
    expandedSheets.set(target.items,{layout,indexes});
    return indexes.size!==before;
  }
  document.addEventListener('dq-paper-fit',event=>{
    const frame=event.target;
    if(frame!==document.querySelector('#content iframe.dq59-paper') || !drawn || phase!=='finish') return;
    if(expandCrowded(frame.contentDocument.body,drawn)) rerender();
  });
  // Runs inside the print document: site math renderer first, then fit each cell.
  const fitScript = `(async()=>{try{const R=window.WebMathRendererV23;if(R){R.typeset(document.body);await R.prepareFonts();}await Promise.all(Array.from(document.images,i=>i.decode().catch(()=>{})));await document.fonts.ready;if(!window.frameElement?.hasAttribute('data-dq-print-frame'))await new Promise(r=>{let done=false;const go=()=>{if(!done){done=true;r();}};requestAnimationFrame(()=>requestAnimationFrame(go));setTimeout(go,300);});for(const l of document.querySelectorAll('.dq59-choices[data-auto],.dq59-choices[data-fit="3"],.dq59-choices[data-fit="2"]')){if(!l.offsetWidth)continue;const o=['5','3','2','1'];let i=Math.max(0,o.indexOf(l.dataset.auto||l.dataset.fit));for(;i<o.length;i++){l.dataset.fit=o[i];if(Array.from(l.children).every(li=>{const w=li.style.whiteSpace;li.style.whiteSpace='nowrap';const ok=li.scrollWidth<=li.clientWidth+1;li.style.whiteSpace=w;return ok;}))break;}}for(const k of document.querySelectorAll('.qbody .katex,.solflow .katex')){if(k.parentElement.closest('.katex'))continue;const el=k.closest('.어절')||k;el.style.zoom='';const blk=(k.closest('.katex-display')||el).parentElement.closest('p,li,td,div');const room=blk?blk.clientWidth:0,w=el.getBoundingClientRect().width;if(room&&w>room+1)el.style.zoom=Math.max(.6,Math.floor(room/w*100)/100);}const wide=el=>el.scrollWidth>el.clientWidth+1;for(const box of document.querySelectorAll('.qbody')){const inner=box.firstElementChild;const edge=box.getBoundingClientRect();if([...inner.querySelectorAll('.katex-display')].some(wide)||inner.getBoundingClientRect().height>box.clientHeight+1||Array.from(inner.querySelectorAll('*')).some(el=>{if(el.closest('.katex')&&!el.classList.contains('katex-html'))return false;const r=el.getBoundingClientRect();return r.width>0&&(r.right>edge.right+1.5||r.bottom>edge.bottom+1.5||r.left<edge.left-1.5||r.top<edge.top-1.5);})){document.body.dataset.overflow='true';box.closest('.question').dataset.needsSpace='true';}}const flow=document.querySelector('.solflow');if(flow){for(const a of flow.querySelectorAll('.ans[data-tex]')){try{a.innerHTML=window.katex.renderToString(a.dataset.tex,{throwOnError:true,displayMode:false,trust:false,strict:'ignore'});}catch{}}const gap=parseFloat(getComputedStyle(flow).columnGap)||0,fb=flow.getBoundingClientRect(),colW=(fb.width-gap)/2,pitch=colW+gap;const clipped=(f=flow)=>{const fb=f.getBoundingClientRect();return Array.from(f.querySelectorAll('p,li,td,th,div')).filter(el=>!el.querySelector('p,li,td,th,div,table')).some(wide)||Array.from(f.querySelectorAll('*')).some(el=>{const inK=el.closest('.katex');if(inK&&(el.closest('.katex-mathml')||el.ownerSVGElement||el.localName==='svg'||/(^|\\s)(strut|pstrut|vlist-s)(\\s|$)/.test(String(el.className.baseVal??el.className))))return false;const blk=el.closest('p,li,td,th,div,article')||f;return Array.from(el.getClientRects()).some(r=>{if(!(r.width>0))return false;const cy=(r.top+r.bottom)/2,cx=(r.left+r.right)/2;let fr=null,best=Infinity;for(const q of blk.getClientRects()){if(cy<q.top-1||cy>q.bottom+1)continue;const gapx=cx<q.left?q.left-cx:cx>q.right?cx-q.right:0;if(gapx<best){best=gapx;fr=q;}}if(!fr)fr=r;const L=fb.left+Math.floor((fr.left-fb.left+1.5)/pitch)*pitch,side=r.width>colW+1.5||r.left<L-1.5||r.right>L+colW+1.5;return inK?side:(side||r.bottom>fb.bottom+1.5||r.top<fb.top-1.5);});});};window.dqSolClipped=clipped;if(clipped())document.body.dataset.overflow='true';const cols=Math.max(1,Math.round((flow.scrollWidth+gap)/pitch)),n=Math.ceil(cols/2);document.body.dataset.solPages=n;const src=flow.closest('.paper'),only=document.body.dataset.solOnly;const list=only===undefined||only===''?Array.from({length:n},(_,i)=>i):[Math.min(n-1,Number(only))];for(const j of list){const pg=src.cloneNode(true);pg.classList.remove('solmeasure');pg.querySelector('.solflow').style.transform='translateX(-'+(j*2*pitch)+'px)';const no=pg.querySelector('.pgno');if(no&&no.dataset.base!=='')no.textContent=(Number(no.dataset.base)+j+1)+' / '+(Number(no.dataset.base)+n);document.body.insertBefore(pg,src);}src.remove();document.querySelectorAll('.pgq').forEach(e=>{e.textContent=e.dataset.i+' / '+(Number(e.dataset.q)+n);});}}catch{document.body.dataset.renderError='fit';}document.body.dataset.ready='true';if(window.frameElement?.hasAttribute('data-dq-print-frame'))window.frameElement.dispatchEvent(new Event('dq-print-ready'));if(window.frameElement?.matches('iframe.dq59-paper')&&document.body.dataset.overflow)window.frameElement.dispatchEvent(new Event('dq-paper-fit',{bubbles:true}));})();`;
  const asset = path => safe(new URL(path, location.href).href);
  function documentHTML(only, sample) {
    const source = sample || drawn;
    const defaultTitle = studentSurface()?'모의시험지':'수업 프린트';
    const settingsTitle = sample ? draftTitle || source.labels.unit+' '+defaultTitle : title;
    const all = sheets(source.items), s = printSettings(), heading = safe(settingsTitle || defaultTitle), who = [s.academyName, s.teacherName].filter(Boolean).map(safe).join(' · ');
    const top = ['header', 'both'].includes(s.identityPlacement) ? who : '', bottom = ['footer', 'both'].includes(s.identityPlacement) ? who : '';
    const face = s.font === 'serif' ? '"Batang","AppleMyungjo","Noto Serif KR",serif' : '"Malgun Gothic","Apple SD Gothic Neo",Arial,sans-serif';
    const solOnly = typeof only === 'string' ? Number(only.slice(1)) : null, withSolutions = !sample && solOn() && (only === undefined || solOnly !== null);
    const chosen = only === undefined ? all : solOnly !== null ? [] : all.slice(only, only + 1), n = Number(layout), tag = safe(source.labels.unit);
    const total = all.length + (!sample && solOn() ? source.solPages || 1 : 0);
    if (pageNote.text && pageNote.placement === 'header') s.headerText = pageNote.text;
    if (pageNote.text && pageNote.placement === 'footer') s.footerText = pageNote.text;
    const brand = `<div class="brand"><strong>${top || (s.identityPlacement === 'none' || bottom ? '' : 'DELTA<em>SKILL</em>')}</strong><span>${safe(s.headerText || source.labels.subject + ' · ' + source.labels.unit)}</span></div>`;
    const footText = [bottom, safe(s.footerText || 'DELTASKILL · ' + source.labels.unit)].filter(Boolean).join(' · ');
    const answer = (a, id) => answerHTML(a, id);   // 1125: 화면 · 지면 같은 정답 표시(F1 · F2)
    const solutions = !withSolutions ? '' : `<section class="paper solmeasure"><header class="head">${brand}<h1>정답과 해설</h1><small>${heading}</small></header><main class="body"><div class="solwin"><div class="solflow">${source.items.map((q, i) => { const x = source.solutions.find(v => v.id === q.id); return `<article class="sol"><div class="solhead"><b>${String(i + 1).padStart(2, '0')}</b><span>${x && !x.missing ? '정답 ' + answer(x.answer, q.id) : ''}</span></div><div class="solbody dq61-s">${x && !x.missing ? x.body.innerHTML : '<p class="solnone">이 문항은 해설이 준비되지 않았습니다.</p>'}</div></article>`; }).join('')}</div></div></main><footer class="foot"><span>${footText}</span><span class="pgno" data-base="${s.showPageNumber ? all.length : ''}"></span></footer></section>`;
    const css = `:root{--question-type-size:13.5px}*{box-sizing:border-box}html,body{margin:0;padding:0;background:#fff;color:#191919;font-family:${face}}body{font-size:12px}.paper{width:210mm;height:297mm;padding:14mm 13mm;position:relative;break-after:page;overflow:hidden}.head{height:25mm;border-bottom:1px solid #353535;margin-bottom:7mm}.brand{display:flex;justify-content:space-between;font-size:9px;letter-spacing:.03em}.head h1{font-size:23px;letter-spacing:-.03em;margin:12px 0 5px;text-align:${s.titleAlign === 'center' ? 'center' : 'left'}}.student{float:right;font-size:10px}.body{height:225mm}.questions{display:grid;grid-template-columns:${n === 1 ? '1fr' : '1fr 1fr'};grid-template-rows:${n === 4 ? '1fr 1fr' : '1fr'};gap:7mm;height:100%}.question{min-width:0;min-height:0;display:flex;flex-direction:column;overflow:hidden}.qhead{display:flex;justify-content:space-between;align-items:baseline;border-bottom:1px solid #cfcfcf;padding-bottom:4px;margin-bottom:9px}.qhead b{font-size:17px}.qhead small{font-size:8px;color:#777}.qbody{flex:1;min-height:0;overflow:hidden}.qbody>div{font-size:var(--question-type-size);line-height:1.75;word-break:keep-all;overflow-wrap:anywhere}.qbody p{margin:0 0 .7em}.qbody img{max-width:100%;height:auto}.qbody math{font-size:1em}.qbody .dq59-bogi{position:relative;margin:1.3em 0 .9em;padding:1.1em .9em .6em;border:1px solid #333}.qbody .dq59-cond,.solbody .dq59-cond{margin:.9em 0;padding:.6em .9em;border:1px solid #333}.dq59-cond-line{display:block}.dq59-cond-line+.dq59-cond-line{margin-top:.35em}.qbody .dq59-bogi-title{position:absolute;top:-.8em;left:50%;transform:translateX(-50%);padding:0 .7em;background:#fff;white-space:nowrap}.qbody .dq59-bogi-title:before{content:'〈 '}.qbody .dq59-bogi-title:after{content:' 〉'}.qbody table{border-collapse:collapse;margin:.5em 0}.qbody td,.qbody th{border:1px solid #555;padding:3px 8px;text-align:center}.qbody ol,.qbody ul{margin:.6em 0;padding-left:1.4em}.qbody .dq59-choices{list-style:none;padding:0;margin:1em 0 0;display:grid;gap:.55em 1em;grid-template-columns:repeat(var(--cols),minmax(0,1fr))}.qbody .dq59-choices[data-fit="5"]{--cols:5}.qbody .dq59-choices[data-fit="3"]{--cols:3}.qbody .dq59-choices[data-fit="2"]{--cols:2}.qbody .dq59-choices[data-fit="1"]{--cols:1}.qbody .dq59-choices li{position:relative;min-width:0;padding-left:1.6em}.qbody .dq59-choices li:not([data-mark]){padding-left:0}.qbody .dq59-choices li[data-mark]:before{content:attr(data-mark);position:absolute;left:0}.head small{font-size:10px}.solwin{height:225mm;overflow:hidden}.solflow{height:225mm;column-count:2;column-gap:7mm;column-fill:auto;font-size:var(--question-type-size);line-height:1.7;word-break:keep-all;overflow-wrap:anywhere}.sol{margin:0 0 5mm}.solhead{display:flex;gap:10px;align-items:baseline;border-bottom:1px solid #ddd;padding-bottom:3px;margin-bottom:6px;break-after:avoid}.solhead b{font-size:14px}.solhead>span{font-size:inherit;font-weight:700}.solbody p{margin:0 0 .6em}.solbody img{max-width:100%;height:auto}.solbody table{border-collapse:collapse;margin:.4em 0}.solbody td,.solbody th{border:1px solid #555;padding:2px 6px;text-align:center}.solnone{color:#777}.solmeasure{position:absolute;left:-9999px;top:0}.foot{position:absolute;bottom:10mm;left:13mm;right:13mm;display:flex;justify-content:space-between;font-size:9px;color:#666}@page{size:A4;margin:0}@media print{.paper:last-child{break-after:auto}}`;
    const renderScripts = sample ? '' : `<script src="${asset('assets/vendor/katex-0.18.4/katex.min.js')}"><\/script><script src="${asset('math-typeset-v66.js?v=66.1')}"><\/script><script src="${asset('math-render-v23.js?v=66.1')}"><\/script><script>${fitScript}<\/script>`;
    const html = `<!doctype html><html lang="ko"><meta charset="utf-8"><title>${heading}</title><link rel="stylesheet" href="${asset('assets/vendor/katex-0.18.4/katex-embed.css?v=24.3')}"><link rel="stylesheet" href="${asset('math-render-v23.css?v=66.1')}"><style>${css}
      .sample-question {display:block;width:322px;max-width:100%;height:auto}
      .sample-set p {margin:0}
      .paper .head h1,.brand span,.foot span:first-child {overflow:hidden;white-space:nowrap;text-overflow:ellipsis}
      body[data-document-design="DS-MARGIN-V2"] .question {padding-left:2.5mm;border-left:.45mm solid #a1a7bd}
      body[data-document-design="DS-SEQUENCE-V2"] .qhead {padding-bottom:2mm;border-bottom:.3mm solid #849897}
      body[data-document-design="DS-SEQUENCE-V2"] .qhead b {border-radius:2px;background:#344c4b;color:#fff;padding:1mm 2mm;font-size:14px!important}
      body[data-document-design="DS-MARGIN-V2"] .qhead b {color:#515d80}
      .paper .questions[data-roomy="1"]{grid-template-columns:1fr;grid-template-rows:1fr}
    </style><link rel="stylesheet" href="${asset('draw-math-v61.css?v=66.1')}"><body${solOnly !== null ? ` data-sol-only="${solOnly}"` : ''}>${chosen.map((p, local) => {
      const index = only === undefined ? local : only;
      if(p.designRecord) {
        const record = document.createElement('template');
        record.innerHTML = window.DSDocumentDesign.recordSheet(p,{title:settingsTitle,unit:source.labels.unit,index,total});
        if (pageNote.text) record.content.querySelector(pageNote.placement === 'header' ? '.brand span' : '.foot span').textContent = pageNote.text;
        return record.innerHTML;
      }
      return `<section class="paper"><header class="head">${brand}<h1>${heading}</h1>${s.showStudentName ? '<span class="student">이름 ______________</span>' : ''}</header><main class="body"><div class="questions" data-roomy="${p.roomy?1:0}" data-columns="${p.roomy||n===1?1:2}" data-divider="${columnRule?'on':'off'}">${p.items.map((q, i) => `<article class="question" data-source-index="${p.offset+i}"><div class="qhead"><b>${String(p.offset + i + 1).padStart(2, '0')}</b><small>${tag}</small></div><div class="qbody"><div class="dq61-q">${q.body.innerHTML}</div></div></article>`).join('')}</div></main><footer class="foot"><span>${footText}</span><span${s.showPageNumber ? ` class="pgq" data-i="${index + 1}" data-q="${all.length}"` : ''}>${s.showPageNumber ? index + 1 + ' / ' + total : ''}</span></footer></section>`;
    }).join('')}${solutions}${renderScripts}</body></html>`;
    return window.DSDocumentDesign?.decorateDocument(html)||html;
  }
  async function printNow() {
    if (printing || pending || !drawn) return;
    printing = true;
    const target = drawn, origin = location.hash;
    const f = document.createElement('iframe');
    f.style.cssText = 'position:fixed;left:-10000px;top:0;width:794px;height:1123px;border:0';
    f.title = '인쇄용 지면';
    f.setAttribute('data-dq-print-frame', '');
    document.body.append(f); frames.add(f);
    const loadPaper = () => {
      const previous = f.contentDocument;
      const html = documentHTML();
      return new Promise((resolve, reject) => {
        const cleanup = () => {
          clearTimeout(timeout);
          f.removeEventListener('dq-print-ready', onReady);
        };
        const onReady = () => {
          const doc = f.contentDocument;
          if (doc === previous || doc?.URL !== 'about:srcdoc' || doc.body?.dataset.ready !== 'true') return;
          cleanup();
          if (doc.body.dataset.renderError) reject(Error('render'));
          else resolve();
        };
        const timeout = setTimeout(() => {
          cleanup();
          reject(Error('load'));
        }, 15000);
        f.addEventListener('dq-print-ready', onReady);
        f.srcdoc = html;
      });
    };
    try {
      await loadPaper();
      const body = f.contentDocument.body;
      if (expandCrowded(body,target)) await loadPaper();
      if (target !== drawn || origin !== location.hash || !sharedPrint() || !(host()?.signedIn() || target.guest)) return;
      if (f.contentDocument.body.dataset.overflow) { toast('한 쪽의 너비나 높이를 넘는 수식이 있어 인쇄 전에 배치를 확인해야 합니다.'); return; }
      f.contentWindow.focus(); f.contentWindow.print();
    } catch { toast('지면을 완전히 불러오지 못했습니다. 인쇄하지 않고 구성을 유지합니다.'); }
    finally { printing = false; setTimeout(() => { f.remove(); frames.delete(f); }, 60000); }
  }
  // v61: answer pages on and still arriving — say so, wait for the rest, then the same printNow().
  async function printWhenReady() {
    if (!drawn) return;
    // 11/25 61 (형 H07): a guest prints the question pages once (no answer pages · no points); from the second press the sign-in card (guest-first-use-v61)
    if (drawn.guest) { printNow(); return; }
    const op = drawn.solOp;
    if (sharedPrint() && withSol && !drawn.solutions && (!op || op.failed)) {
      say('solfail'); rerender('[data-dq-print]'); return;
    }
    if (withSol && !drawn.solutions && op && !op.failed) {
      if (waitPrint) return;
      waitPrint = true; note = { kind: 'solwait', text: TEXT.solwait }; paintProgress();
      const target = drawn;
      await op.promise.catch(() => {});
      if (!waitPrint || drawn !== target || phase !== 'finish' || !sharedPrint()) return;
      waitPrint = false;
      if (!target.solutions) { say('solfail'); rerender('[data-dq-print]'); return; }
      note = { kind: 'solok', text: TEXT.solok }; rerender('[data-dq-print]');
    }
    printNow();
  }

  // ── views ──
  function steps() {
    const index = phase === 'setup' ? (pending ? 1 : 0) : phase === 'cards' ? 2 : 3;
    return `<ol class="tb36-steps" aria-label="제작 순서">${['조건 설정', '문항 구성', '문항 확인', '보관·출력'].map((text, i) => `<li class="${i < index ? 'is-done' : i === index ? 'is-current' : ''}" ${i === index ? 'aria-current="step"' : ''}><b>${i < index ? '✓' : i + 1}</b><span>${text}</span></li>`).join('')}</ol>`;
  }
  function noteHTML() {
    const link = note.kind === 'unauthorized' ? ' <a href="#login" data-dq61-login>로그인 ↗</a>' : note.kind === 'forbidden' ? ' <a href="#account">내 포인트·이용권 확인 ↗</a>' : note.kind === 'solfail' ? ' <button type="button" class="dq61-inline" data-dq61-solretry>다시 불러오기</button>' : '';
    return `<p class="tb36-message dq59-note" data-kind="${safe(note.kind)}" role="status" aria-live="polite">${safe(note.text)}${link}</p>`;
  }
  // The one guest gauge: how much of today's free questions this browser has seen.
  function meter() {
    if (!guest()) return '';
    const total = daily(), used = Math.min(total, seenToday);
    return `<div class="dq61-meter" role="group" aria-label="로그인 없이 볼 수 있는 문항"><p><span>오늘 공개 체험 ${total}문항 중</span><b>${used}문항 사용</b></p><i aria-hidden="true"><em style="width:${Math.round(used / total * 100)}%"></em></i><small>같은 네트워크의 공개 체험 사용량이 합산될 수 있어요.</small></div>`;
  }
  // Legacy set labels can combine several stages. A scoped request accepts one
  // exact value per filter. Keep user choices separate from the legacy set cursor.
  let scopeLevels = {subject:'', stage:'', difficulty:''};
  function scopedLevels() {
    if (scopeLevels.subject !== sel.subject) scopeLevels = {subject:sel.subject, stage:'', difficulty:''};
    return scopeLevels;
  }
  function scopeLevelSelect(k,name) {
    const levels = scopedLevels();
    const values = [...new Set(rows({subject:sel.subject}).flatMap(row => row[k].split(/\s*·\s*/)).filter(Boolean))];
    if (!values.length && !levels[k]) return '';
    if (levels[k] && !values.includes(levels[k])) values.push(levels[k]);
    const options = values.map(v => `<option value="${safe(v)}" ${v === levels[k] ? 'selected' : ''}>${safe(k === 'stage' ? v + '단계' : v)}</option>`).join('');
    return `<label>${name}<select data-dq-scope-level="${k}" aria-label="${name}" ${pending ? 'disabled' : ''}><option value="">전체</option>${options}</select></label>`;
  }
  function selects() {
    const prefix = {};
    return FIELDS.filter(([k]) => k !== 'unit' || guestSettings() || !window.DSPrintScope?.active()).map(([k, name]) => {
      if (!guestSettings() && window.DSPrintScope?.active() && (k === 'stage' || k === 'difficulty')) return scopeLevelSelect(k,name);
      const values = rows(prefix).map(r => r[k]);
      if (k === 'subject' && !guestSettings())
        values.push(...(window.DSPrintScopeData?.subjects || []).map(s => s.subject));
      const options = [...new Set(values)];
      if (!options.length) return '';
      const html = `<label>${name}<select data-dq-field="${k}" aria-label="${name}" ${pending ? 'disabled' : ''}>${options.map(v => `<option value="${safe(v)}" ${sel[k] === v ? 'selected' : ''}>${safe(k === 'stage' ? v + '단계' : v)}</option>`).join('')}</select></label>`;
      prefix[k] = sel[k];
      return html;
    }).join('');
  }
  function menuFields() {
    if (menu.length) return selects();
    if (guestSettings()) return '<p class="dq59-lead" role="status">'+(menuBusy || !menuTried ? '공개 문항의 과목·대단원·난도를 불러오는 중입니다.' : safe(note.kind === menuIssue && note.text ? note.text : TEXT[menuIssue] || '공개 문항 목록을 확인하지 못했습니다.'))+'</p>';
    const subjects = window.DSPrintScopeData?.subjects || [];
    const subject = subjects.length ? `<label>과목<select data-ps-subject>${subjects.map(s => `<option value="${safe(s.subject)}" ${sel.subject === s.subject ? 'selected' : ''}>${safe(s.subject)}</option>`).join('')}</select></label>` : '';
    if (subjects.length && window.DSPrintScope?.active()) return subject;
    if (host() && (!menuTried || menuBusy)) return subject + '<p class="dq59-lead" role="status">조건 목록을 불러오는 중입니다.</p>';
    if (menuIssue && menuIssue !== note.kind) return subject + `<p class="dq59-lead" role="status">${safe(TEXT[menuIssue])} ${ALERTS[menuIssue] || ''}</p>`;
    return subject;
  }
  function countField() {
    const row = current(), cap = guest() ? guestCap(row) : 20;
    const trialLimit = guest();
    const sizes = trialLimit && cap > 0 && !COUNTS.includes(cap) ? [...COUNTS,cap].sort((a,b)=>a-b) : COUNTS;
    const over = trialLimit && count > cap && cap > 0;          // at 0 the faint card on the right is the one notice
    return `<label>문항 수<select data-dq-count aria-label="문항 수" ${pending ? 'disabled' : ''}${over ? ' aria-describedby="dq61-more"' : ''}>${sizes.map(n => `<option value="${n}" ${count === n ? 'selected' : ''}>${n}문항${trialLimit && n > cap && cap > 0 ? ' · 로그인하면' : ''}</option>`).join('')}</select>${over ? `<small id="dq61-more" class="dq61-more">${cap > 0 ? `로그인 없이 지금은 ${cap}문항까지 구성할 수 있어요.` : '오늘 로그인 없이 볼 수 있는 문항을 다 봤어요.'} <a href="#login" data-dq61-login>로그인하면 더 ↗</a></small>` : ''}</label>`;
  }
  function sampleData() {
    const subject = sel.subject || window.DSPrintScopeData?.subjects?.[0]?.subject;
    const sample = {'미적분Ⅰ':['부정적분과 정적분','integral'], '공통수학2':['함수','function']}[subject];
    if (!sample) return null;
    const [unit,prefix] = sample;
    const labels = {subject,unit};
    // v66: the integral sample is set by the same renderer and rules as a drawn card (no picture of a formula).
    // The function sample keeps its pictures: each item is an arrow diagram.
    const SET = {integral:['\\int 5 dx','\\int(-6x) dx','\\int 9x^{2} dx','\\int(-8x^{3}) dx']}[prefix];
    const typeset = window.DSMathTypeset && window.katex;
    const items = Array.from({length:4},(_,i)=>({
      body:{innerHTML: SET && typeset
        ? `<div class="dq61-q sample-set"><p>다음 부정적분을 구하시오.</p>${window.DSMathTypeset.html(SET[i],{display:true})}</div>`
        : `<img class="sample-question" src="${asset('public-data/interior-samples/'+prefix+'-q'+(i+1)+'.webp')}" alt="${labels.unit} 공개 프린트 ${i+1}번 문제">`}
    }));
    return {labels,items};
  }
  function paperControls() {
    const design = window.DSDocumentDesign;
    const styles = design.designs.map(d => {
      const selected = design.selected().id === d.id;
      return `<button type="button" data-document-design="${d.id}" aria-pressed="${selected}"><i class="dq-paper-mark" data-style="${d.name}" aria-hidden="true"></i>${safe(d.name)}</button>`;
    }).join('');
    function radio(name,value,checked,attribute,text) {
      return `<label><input type="radio" name="${name}" ${attribute} value="${value}" ${checked?'checked':''}><span>${text}</span></label>`;
    }
    const counts = [1,2,4].map(n => radio('paper-count',n,n===Number(layout),'data-dq-layout',n+'문항')).join('');
    const divider = Number(layout) > 1 ? `<fieldset><legend>두 단 사이</legend><div>${radio('paper-divider','off',!columnRule,'data-dq-divider','선 없음')}${radio('paper-divider','on',columnRule,'data-dq-divider','선 있음')}</div></fieldset>` : '';
    return `<div class="dq61-page-options"><fieldset class="dq-paper-styles"><legend>내지 디자인</legend><div>${styles}</div></fieldset><div class="dq-paper-layout"><fieldset><legend>한 쪽 문항 수</legend><div>${counts}</div></fieldset>${divider}</div></div>`;
  }
  function chosenPrintUnits() {
    const scope=window.DSPrintScope;
    if (guestSettings() || !scope?.active()) return sel.unit ? [sel.unit] : [];
    return scope.unitLabels(scope.request().subunit_ids);
  }
  function idle() {
    const list = guest() ? [] : savedList();
    const data = sampleData();
    if (!data) {
      return `<aside class="dq59-stage dq59-idle tb36-order-preview ds48-canvas dq61-desk" aria-label="프린트 자료"><div class="ds48-preview-toolbar"><strong>${safe(sel.subject)} 프린트</strong></div><p class="dq59-saved" role="status">${window.DSPrintScope?.awaitingSupply(sel.subject) ? '검토를 마친 문항부터 프린트로 제공할 예정입니다.' : '이 과목의 프린트 자료를 준비하고 있습니다.'}</p></aside>`;
    }
    const selectedUnits = chosenPrintUnits();
    const showSample = !selectedUnits.length || (selectedUnits.length===1 && selectedUnits[0]===data.labels.unit);
    const sheet = `<iframe class="dq61-sample-page" title="${data.labels.subject} ${data.labels.unit} 프린트 자료" tabindex="-1" scrolling="no" srcdoc="${safe(documentHTML(0,data))}"></iframe>`;
    const surface = showSample ? window.DSPrintSurfaceV48.scene(sheet) : '';
    const enlarge = showSample ? '<button type="button" class="dq61-sample-link" aria-haspopup="dialog" data-dq-large-sample>지면 예시 보기 ↗</button>' : '';
    const toolbar = '<strong>'+safe(showSample?'지면 예시 · '+data.labels.unit:selectedUnits.join(' · '))+'</strong><span class="dq-paper-actions"><button type="button" data-dq-open-settings>구성 설정 ↓</button>'+enlarge+'</span>';
    const appearance = paperControls();
    return `<aside class="dq59-stage dq59-idle tb36-order-preview ds48-canvas dq61-desk dq61-sample-desk" aria-busy="${Boolean(pending)}"><div class="ds48-preview-toolbar">${toolbar}</div><p class="dq59-saved">현재 설정 · ${safe(sel.subject||data.labels.subject)} ${safe(selectedUnits.join(' · ')||'전체 범위')} · 문항을 구성하면 이 자리에 표시됩니다.</p><div class="dq61-sample-window">${surface}</div>${appearance}${list.length && !pending ? `<div class="dq59-saved"><h3>이 기기에 임시 보관한 구성</h3><ul>${list.map((x, i) => `<li><button type="button" data-dq-reopen="${i}"><strong>${safe(x.title)}</strong><small>${safe(label(x.labels))} · ${x.ids.length}문항 · ${safe(x.day)}</small></button><button type="button" data-dq-forget="${i}" aria-label="${safe(x.title)} 지우기">×</button></li>`).join('')}</ul></div>` : ''}</aside>`;
  }
  // The faint card in the next place once today's free questions are used: no question in it.
  function lockCard(alone) {
    return `<div class="dq61-lockcard${alone ? ' is-alone' : ''}"><span class="dq61-lockmark" aria-hidden="true">${LOCK_SVG}</span><strong>오늘 로그인 없이 볼 수 있는 ${daily()}문항을 다 봤어요.</strong><span>로그인하면 같은 조건으로 더 구성하고, 정답 · 해설까지 이어서 볼 수 있어요.</span>${alone ? '' : '<button type="button" class="dq61-ghost" data-dq61-gate-open="limit">로그인하고 더 구성</button>'}</div>`;
  }
  let draftTitle = '';
  let pageNote = {placement:'header',text:''};
  function studentOutputSettings() {
    return `<div class="student-print-settings"><label>프린트 제목<input data-student-print-title maxlength="60" value="${safe(draftTitle)}" placeholder="단원명으로 자동 지정"></label><label>문구 위치<select data-dq-note-placement><option value="header" ${pageNote.placement==='header'?'selected':''}>머리말</option><option value="footer" ${pageNote.placement==='footer'?'selected':''}>꼬리말</option></select></label><label>문구<input data-dq-note maxlength="60" value="${safe(pageNote.text)}" placeholder="프린트에 넣을 문구"></label><label><input type="checkbox" data-student-print-sol ${withSol?'checked':''}> 정답·해설 포함</label></div>`;
  }
  function setup() {
    const scope = window.DSPrintScope;
    const fields = menuFields();
    const scopeHtml = guestSettings() ? '' : scope?.render({subject:sel.subject || window.DSPrintScopeData?.books?.[0]?.subject,
      stage:sel.stage, difficulty:sel.difficulty, count, host:host(), pending:Boolean(pending),
      guest:guest(), deferAccess:true, hasLegacySets:listed().length>0}) || '';
    const choice = scope?.request();
    const basic = guestSettings() || choice?.mode === 'basic';
    const awaitingSupply = !guestSettings() && scope?.awaitingSupply(sel.subject);
    const canQuote = guestSettings() ? Boolean(guest() && current()?.ready) : awaitingSupply ? false : basic ? Boolean(current()?.ready) : choice &&
      (choice.mode !== 'book' || choice.book_id) && (choice.type_mode !== 'specific' || choice.type_ids.length);
    const retry = approvedTrial && trialMatches(approvedTrial);
    const row = current();
    const previewCount = retry ? approvedTrial.count : Math.min(count, 5, guestCap(row));
    const trialLabel = retry ? '남은 문항 이어 열기' : previewCount
      ? safe(row.unit)+' 기본 '+previewCount+'문항 체험' : '로그인하고 더 구성';
    const trial = guest() && row && !awaitingSupply ? `<button type="button" class="tb36-quiet" data-dq-guest-preview ${pending || (retry && Date.now() < approvedTrial.retryAt) ? 'disabled' : ''}>${trialLabel}</button>` : '';
    const waiting = retry && Date.now() < approvedTrial.retryAt;
    const button = `<button type="submit" class="tb36-primary" ${canQuote && !pending && !waiting ? '' : 'disabled'}>${pending?'문항 준비 중':retry?'남은 문항 이어 열기':guestSettings()?'문항 만들기':'출력 / PDF 저장'} <span>→</span></button>`;
    return `<div class="tb36-setup dq59-setup${guest() ? ' dq61-guest' : ''}"><form id="dq59-form" class="tb36-conditions"><div class="tb36-section-title"><b>01</b><h2>프린트 구성</h2></div>${basic ? meter() : ''}${fields}${scopeHtml}${awaitingSupply ? '' : countField()+studentOutputSettings()}${guestSettings()?'':trial}${button}${noteHTML()}</form>${idle()}</div>`;
  }
  function solProgress() {
    const op = drawn?.solOp;
    if (!drawn || drawn.guest || !op || drawn.solutions || op.failed) return '';
    return `<div class="dq61-progress" data-dq61-progress role="status" aria-live="polite"><p><span>정답 · 해설 불러오는 중</span><b data-dq61-done>${op.done} / ${op.total}</b></p><i aria-hidden="true"><em style="width:${Math.round(op.done / op.total * 100)}%"></em></i></div>`;
  }
  function cards() {
    const l = drawn.labels, g = drawn.guest;
    const head = `<div class="tb36-composed dq61-summary"><span>${drawn.reopened ? '보관한 구성' : g ? '로그인 없이 구성 · 문제만' : '문항 구성 완료'}</span><h2>${safe(l.unit)}</h2><p>${safe(l.subject)} · ${safe(l.stage)}단계 · ${safe(l.difficulty)} · <b>${drawn.items.length}문항</b></p><button type="button" data-dq-back>조건 변경</button></div>`;
    const next = drawn.scoped || drawn.printOnReady ? '범위 다시 선택' : (drawn.page + 2) * drawn.count <= 50 ? '다른 문항으로 바꾸기 ↻' : '처음 문항으로 돌아가기 ↺';
    return `<div class="tb36-workspace dq59-work${g ? ' dq61-guest' : ''}"><aside class="tb36-review-panel dq59-panel">${head}${meter()}<div class="tb36-review-heading"><h3>문항 확인</h3><p>${g ? '문제를 살펴보고 프린트 꼴로 넘어가세요.' : '문항과 정답 · 해설을 확인하고 프린트로 넘어가세요.'}</p></div>${solProgress()}${noteHTML()}<button type="button" class="tb36-primary" data-dq-finish ${pending ? 'disabled' : ''}>이 ${drawn.items.length}문항으로 프린트 <span>→</span></button><button type="button" class="tb36-quiet" ${g ? 'data-dq61-gate-open="more"' : drawn.scoped || drawn.printOnReady ? 'data-dq-back' : 'data-dq-next'} ${pending ? 'disabled' : ''}>${next}${g ? ` <span class="dq61-lockmark" aria-hidden="true">${LOCK_SVG}</span>` : ''}</button></aside><section class="dq59-stage dq61-cardstage" aria-label="구성한 문항"><div class="ds48-preview-toolbar"><strong>문항 미리보기 · ${drawn.items.length}문항</strong><small>${safe(l.unit)} · ${safe(l.stage)}단계 · ${safe(l.difficulty)}</small></div><div class="dq59-cards" data-dq-cards></div>${g && drawn.capped ? lockCard(false) : ''}</section></div>`;
  }
  function lockedPaper() {
    // A picture of an answer page with nothing written on it: grey bars stand for lines.
    const bars = Array.from({ length: 14 }, (_, i) => `<i style="width:${[92, 78, 86, 64, 90, 72, 84, 58, 88, 76, 66, 82, 70, 54][i]}%"></i>`).join('');
    return `<div class="dq61-lockpaper" role="img" aria-label="잠긴 정답과 해설 면"><div class="dq61-lockpaper-sheet"><header><span>DELTA<em>SKILL</em></span><strong>정답과 해설</strong></header><div class="dq61-lockpaper-cols"><div>${bars}</div><div>${bars}</div></div></div><div class="dq61-lockpaper-veil"><span class="dq61-lockmark" aria-hidden="true">${LOCK_SVG}</span><strong>로그인하면 이 문항들의 정답과 해설을 바로 볼 수 있어요</strong><button type="button" class="dq61-ghost" data-dq61-gate-open="solution">정답 · 해설 열기</button></div></div>`;
  }
  function finish() {
    const all = sheets(), g = drawn.guest;
    const pages = totalPages();
    page = Math.max(0, Math.min(page, pages - 1));
    const onLocked = g && page === pages - 1;
    const solBox = g ? `<button type="button" class="dq59-check dq61-check-locked" data-dq61-gate-open="solution"><span class="dq61-box" aria-hidden="true">${LOCK_SVG}</span><span>정답 · 해설 면 붙이기</span></button>`
      : `<label class="dq59-check"><input type="checkbox" data-dq-sol ${withSol ? 'checked' : ''}><span>정답 · 해설 면 붙이기</span></label>${solProgress()}`;
    // v61.4: a guest gets no keep box — the member screen has none either on the live connection (no owner tag).
    const save = g ? ''
      : owner && !drawn.scoped ? `<div class="tb36-save dq59-save"><strong>이 기기에 임시 보관</strong><p>문항 글은 저장하지 않습니다. 다시 열 때 서버가 권한을 확인합니다.</p><button type="button" data-dq-save>임시 보관</button></div>` : '';
    const print = g ? `<button type="button" class="tb36-primary" data-dq-print>문제지 인쇄 / PDF <span>↗</span></button>` : `<button type="button" class="tb36-primary" data-dq-print ${waitPrint ? 'aria-busy="true"' : ''}>인쇄 / PDF <span>↗</span></button>`;
    const paper = onLocked ? window.DSPrintSurfaceV48.scene(lockedPaper()) : window.DSPrintSurfaceV48.scene(`<iframe class="dq59-paper" title="${page + 1}쪽 인쇄 지면" scrolling="no" style="width:793.7008px;height:1122.5197px" srcdoc="${safe(documentHTML(pageArg()))}"></iframe>`);
    const nav = Array.from({ length: pages }, (_, i) => { const locked = g && i === pages - 1; return `<button type="button" data-dq-page="${i}" aria-pressed="${page === i}"${locked ? ' class="is-locked"' : ''}>${i + 1} ${i < all.length ? (all[i].designRecord ? '기록면' : '문제') : '정답·해설'}${locked ? ` <span class="dq61-lockmark" aria-hidden="true">${LOCK_SVG}</span>` : ''}</button>`; }).join('');
    const pending2 = !g && withSol && !drawn.solutions && drawn.solOp && !drawn.solOp.failed ? `<button type="button" disabled class="is-waiting">정답·해설 <small data-dq61-done>${drawn.solOp.done} / ${drawn.solOp.total}</small></button>` : '';
    return `<div class="tb36-workspace dq59-work${g ? ' dq61-guest' : ''}"><aside class="tb36-finish-panel dq59-panel"><div class="tb36-section-title"><b>04</b><h2>보관·출력</h2></div><label>제목<input data-dq-title maxlength="60" value="${safe(title)}"></label><a class="tb36-design-link" href="#print-design">학원명·머리말·표지 디자인 <span>↗</span></a>${solBox}${save}${print}<button type="button" class="tb36-quiet" data-dq-review>문항 다시 확인</button>${noteHTML()}</aside><div class="creator-canvas td34-canvas tb36-canvas ds48-canvas dq59-canvas"><div class="creator-canvas-toolbar"><div><strong>인쇄 미리보기</strong><span>${drawn.items.length}문항 · ${pages}쪽</span></div>${onLocked ? '' : '<button type="button" class="dq61-sample-link" aria-haspopup="dialog" data-dq-large-sample>원본 크기 ↗</button>'}</div><div class="creator-paper-stage">${paper}</div>${paperControls()}<nav class="tb36-pages" aria-label="미리보기 쪽">${nav}${pending2}</nav><div class="creator-canvas-footer"><span>A4 · 210 × 297 mm</span><span>${g ? '문제 면 · 정답·해설은 로그인 뒤' : solOn() ? '문제 · 정답·해설' : '문제 면'}</span></div></div></div>`;
  }
  // Keep the original print workbench: a short conditions form next to the paper.
  function compactPrintForm(form) {
    if (!form) return;
    const fold = (key, label, controls) => {
      if (!controls.length) return;
      const box = document.createElement('details');
      box.className = 'dq-optional';
      box.dataset.printOption = key;
      box.open = Boolean(document.querySelector(`#dq59-form [data-print-option="${key}"][open]`));
      const summary = document.createElement('summary');
      summary.textContent = label;
      box.append(summary);
      controls[0].before(box);
      box.append(...controls);
    };
    const heading = form.querySelector('.tb36-section-title h2');
    if (heading) heading.textContent = '프린트 설정';
    form.querySelector('.tb36-section-title b')?.remove();
    const byUnits = form.querySelector('[data-ps-all]')?.closest('fieldset');
    if (byUnits) {
      const checked = [...byUnits.querySelectorAll('[data-ps-unit]:checked')];
      const label = checked.length === 1 ? checked[0].parentElement.textContent.trim() : checked.length ? checked.length + '개 선택' : '전체 범위';
      fold('units', '단원 · ' + label, [byUnits]);
    }
    const action = form.querySelector('.tb36-primary');
    if (!action) return;
    const optional = [
      form.querySelector('[data-ps-types]')?.closest('fieldset'),
      form.querySelector('[data-dq-field="stage"],[data-dq-scope-level="stage"]')?.closest('label'),
      form.querySelector('[data-dq-scope-level="difficulty"]')?.closest('label'),
      form.querySelector('.student-print-settings')
    ].filter(Boolean);
    for (const control of optional) action.before(control);
    fold('options', '상세 설정', optional);
  }
  const base = teacher;
  function mine() {
    const t = document.createElement('template');
    t.innerHTML = base();
    const root = t.content.firstElementChild, oldSteps = root?.querySelector('.tb36-steps'), oldSetup = root?.querySelector('.tb36-setup');
    if (!oldSteps || !oldSetup) return base();
    if (!menuTried) queueMicrotask(loadMenu);          // first time this screen is drawn (or after a sign-in change)
    const restored = host()?.signedIn() && window.DSPrintLoginReturn?.take(location.hash);
    if (restored) {
      window.DSPrintScope?.restore(restored.scope);
      sel = Object.fromEntries(FIELDS.filter(([k]) => typeof restored.sel?.[k] === 'string')
        .map(([k]) => [k, restored.sel[k]]));
      if (!sel.subject && typeof restored.scope?.subject === 'string') sel.subject = restored.scope.subject;
      const savedLevels = restored.scopeLevels;
      if (savedLevels?.subject === sel.subject && ['stage','difficulty'].every(k => typeof savedLevels[k] === 'string' && savedLevels[k].length <= 60)) {
        scopeLevels = {subject:sel.subject, stage:savedLevels.stage, difficulty:savedLevels.difficulty};
      }
      count = COUNTS.includes(restored.count) ? restored.count : 5;
      columnRule = restored.columnRule === true;
      layout = ['1','2','4'].includes(restored.layout) ? restored.layout : '2';
      draftTitle = typeof restored.draftTitle === 'string' ? restored.draftTitle.slice(0,60) : '';
      pageNote = {placement:restored.pageNote?.placement === 'footer' ? 'footer' : 'header',
        text:typeof restored.pageNote?.text === 'string' ? restored.pageNote.text.slice(0,60) : ''};
      withSol = restored.withSol !== false;
      const designs = window.DSDocumentDesign;
      if (designs && restored.design !== designs.selected().id) designs.select(restored.design);
    }
    settle();
    root.classList.add('dq61-surface');
    if (phase === 'setup') oldSteps.remove(); else oldSteps.outerHTML = steps();
    oldSetup.outerHTML = pending?.preview ? loadingCards() : phase === 'setup' || !drawn ? setup() : phase === 'cards' ? cards() : finish();
    compactPrintForm(root.querySelector('#dq59-form'));
    if (Array.isArray(restored?.openSections)) {
      root.querySelectorAll('details[data-print-option]').forEach(box=>{
        box.open = restored.openSections.includes(box.dataset.printOption);
      });
    }
    return root.outerHTML;
  }
  teacher = function () {
    const s = B.snapshot();
    if (!embedded && !studentSurface() && s.mode !== 'print' && (approvedTrial || pending?.guest)) {
      if (pending?.guest) stop();
      clearTrial();
    }
    // Without a draw host (for example a plain static copy) the v58.3 flow stays as it is.
    return embedded || !host() || !here() || s.mode !== 'print' || s.phase !== 'setup' ? base.apply(this, arguments) : mine();
  };
  for (const name of ['renderEmbedded', 'embeddedAction', 'embeddedConfig']) {
    const original = B[name];
    B[name] = function () { embedded++; try { return original.apply(this, arguments); } finally { embedded--; } };
  }
  function rerender(focus) {
    if (!here()) return;
    if(studentSurface()){window.DSStudentDownloads.refresh(focus);mount();return;}
    document.getElementById('content').innerHTML = teacher();
    mount();
    if (focus) document.querySelector(focus)?.focus({ preventScroll: true });
  }
  function solPanel(q) {
    if (drawn.guest) return `<button type="button" class="dq61-sol is-locked" data-dq61-gate-open="solution"><span>정답 · 해설</span><span class="dq61-lockmark" aria-hidden="true">${LOCK_SVG}</span></button>`;
    const x = drawn.solMap?.get(q.id);
    return `<details class="dq61-sol" data-dq61-sol="${safe(q.id)}"${drawn.openSol && x ? ' open' : ''}><summary><span>정답 · 해설</span><small>${x ? safe(solLine(x, q.id)) : drawn.solOp?.failed ? '불러오지 못함' : '불러오는 중'}</small></summary><div class="dq61-sol-body"></div></details>`;
  }
  // 1125 렌더고침: 정답 표시 한 길 — 선지 없는 문항의 1~5 는 원문자로 바꾸지 않고(F2), $…$ 은 사이트 KaTeX 로 짓는다(F1).
  const hasChoices = id => { const b = drawn?.items?.find(v => v.id === id)?.body; return Boolean(b && (b.querySelector('li[data-mark]') || /[①②③④⑤]/.test(b.textContent))); };
  function answerHTML(a, id) {
    const t = String(a ?? '').trim();
    if (/^[1-5]$/.test(t) && hasChoices(id)) return '①②③④⑤'[t - 1];
    const T = window.DSMathTypeset, K = window.katex;
    try {
      if (t.includes('$') && T?.dollars && K?.renderToString) return T.dollars(t, safe);
      if (/[\\^_{}]/.test(t) && K?.renderToString) return K.renderToString(t, { throwOnError: true, displayMode: false, trust: false, strict: 'ignore' });
      if (/^[A-Za-z0-9\s=,+\-().\/<>]+$/.test(t) && /[=+\-<>]/.test(t) && /[A-Za-z]/.test(t) && K?.renderToString) return K.renderToString(t, { throwOnError: true, displayMode: false, trust: false, strict: 'ignore' });   // 평문 식 답(a=3, b=-6)의 「-」 를 수식 빼기로
    } catch {}
    return safe(t.replace(/\$/g, ''));
  }
  const shortAnswer = (a, id) => { const t = String(a ?? '').trim(); if (/^[1-5]$/.test(t) && hasChoices(id)) return '①②③④⑤'[t - 1]; const u = t.replace(/\$/g, ''); return u.length > 18 || /[\\^_{}]/.test(u) ? '' : u; };
  const solLine = (x, id) => x.missing ? '해설 없음' : shortAnswer(x.answer, id) ? '정답 ' + shortAnswer(x.answer, id) : '펼쳐서 보기';
  function fillSol(id) {
    const box = document.querySelector(`#content [data-dq61-sol="${CSS.escape(id)}"]`), x = drawn?.solMap?.get(id);
    if (!box || !x) return;
    box.querySelector('summary small').textContent = solLine(x, id);
    const body = box.querySelector('.dq61-sol-body');
    if (body.childElementCount) return;
    if (x.missing) { body.innerHTML = '<p class="dq61-solnone">이 문항은 해설이 준비되지 않았습니다.</p>'; return; }
    const head = document.createElement('p'); head.className = 'dq61-answer'; head.innerHTML = `<b>정답</b> <span></span>`; const a = x.answer.trim(), slot = head.lastElementChild;
    slot.innerHTML = answerHTML(a, id);   // 1125: 선지 없는 1~5 · $…$ 답(F1 · F2)
    body.append(head, x.body.cloneNode(true));
    if (drawn.openSol) box.open = true;
  }
  function mount() {
    window.DSPrintSurfaceV48?.fit(document);
    paintLoadingCards();
    const box = document.querySelector('#content [data-dq-cards]');
    if (!box || box.childElementCount || !drawn) return;
    const tag = `${drawn.labels.unit} · ${drawn.labels.stage}단계 · ${drawn.labels.difficulty}`;
    box.append(...drawn.items.map((q, i) => {
      const card = document.createElement('article');
      card.className = 'dq59-card';
      card.setAttribute('aria-label', '문항 ' + (i + 1));
      card.innerHTML = `<header><b>${String(i + 1).padStart(2, '0')}</b><span>${safe(tag)}</span></header>`;
      card.append(q.body.cloneNode(true));
      card.insertAdjacentHTML('beforeend', solPanel(q));
      return card;
    }));
    if (!drawn.guest) drawn.items.forEach(q => fillSol(q.id));
  }
  const content = document.getElementById('content');
  if (content) new MutationObserver(mount).observe(content, { childList: true });

  // ── gate: one dialog for the four signed-in things ──
  const GATE = {
    solution: ['로그인하고 정답과 해설을 받아 보세요', '출력 설정에서 정답·해설을 포함할 수 있어요.'],
    print: ['로그인하고 프린트를 받아 보세요', '출력할 때 이용할 문항과 포인트를 확인할 수 있어요.'],
    more: ['로그인하면 다른 문항으로 바꿀 수 있어요', '같은 조건의 다음 문항을 이어서 구성합니다.'],
    limit: ['로그인하면 더 구성할 수 있어요', '단원과 문항 수를 골라 정답 · 해설까지 받아 보세요.']
  };
  function gateDialog() {
    let d = document.getElementById('dq61-gate');
    if (d) return d;
    d = document.createElement('dialog');
    d.id = 'dq61-gate'; d.className = 'dq61-gate'; d.setAttribute('aria-labelledby', 'dq61-gate-title');
    d.addEventListener('click', e => { if (e.target === d) d.close(); });
    d.addEventListener('close', () => { opened = ''; });
    document.body.append(d);
    return d;
  }
  function openGate(want) {
    const [head, line] = GATE[want] || GATE.solution, d = gateDialog(), n = drawn?.guest ? drawn.items.length : 0;
    opened = want;
    d.innerHTML = `<form method="dialog" class="dq61-gate-card"><button type="submit" class="dq61-close" data-dq61-close aria-label="닫기">×</button><span class="dq61-lockmark is-big" aria-hidden="true">${LOCK_SVG}</span><h2 id="dq61-gate-title">${safe(head)}</h2><p>${safe(line)}${n ? ` <b>${n}문항</b>` : ''}</p><ul><li>정답 · 해설 면</li><li>인쇄 / PDF</li></ul><div class="dq61-gate-actions"><button type="button" class="tb36-primary" data-dq61-login>로그인</button><a class="dq61-ghost" href="${safe(signupHref())}" data-dq61-signup>회원가입</a></div><small>회원가입은 휴대폰 번호로 합니다. 가입하면 이 화면으로 돌아옵니다.</small></form>`;
    if (!d.open) { try { d.showModal(); } catch { d.setAttribute('open', ''); } }
    d.querySelector('[data-dq61-login]')?.focus();
  }

  // ── actions ──
  function stop() { const old = pending; pending = null; if (old) { clearTimeout(old.timer); old.controller.abort(); } }
  let menuBusy = false, menuTried = false, menuIssue = '', menuGuard = null;
  async function loadMenu() {
    const h = host();
    if (!h || menuBusy || !here() || !printSurface()) return;   // only for the teacher print screen
    menuBusy = true; menuTried = true;
    const guard = menuGuard = new AbortController();
    const timer = setTimeout(() => guard.abort(), 12000);
    const abort = new Promise((_, reject) => guard.signal.addEventListener('abort', () => reject(Error('menu_timeout')), {once:true}));
    menuIssue = '';
    let back = null;
    try {
      await Promise.race([h.ready, abort]);
      if (menuGuard !== guard) return;
      if (!here() || !printSurface()) { menuTried = false; return; }   // the screen changed while waiting
      if (h.trial && !h.signedIn()) {
        // Guest: the trial list. Switched off or unknown on the server = the sign-in line as before.
        try {
          const d = await Promise.race([h.trial.menu(guard.signal), abort]);
          if (menuGuard !== guard) return;
          menu = d.cells; limits = d.limits; trialOn = true; owner = '';
          seenToday = readTally();
          if (note.kind === 'menufail' || note.kind === 'unauthorized') note = { kind: '', text: '' };
        } catch (error) {
          if (menuGuard !== guard) return;
          trialOn = false; menu = [];
          menuIssue = [401, 403, 404, 502, 503].includes(error?.status) ? 'unauthorized' : 'menufail';
          if (error?.status === 429 || ['trial_limit','rate_limited'].includes(error?.code)) { guestRefusal(error); menuIssue = note.kind; }
          else if (!window.DSPrintScope?.active()) say(menuIssue);   // trial not on the server yet (401) or its pool not ready (502 · 503) = sign-in line
        }
      } else {
        trialOn = false;
        const d = await Promise.race([h.menu(guard.signal), abort]);
        if (menuGuard !== guard) return;
        if (!Array.isArray(d?.sets)) throw Error('menu');
        menu = d.sets.filter(r => r && FIELDS.every(([k]) => typeof r[k] === 'string'));
        // An opaque tag from the local proxy; no account request is made from the page for it.
        owner = h.signedIn() && typeof d.owner === 'string' && /^[0-9a-f]{16}$/.test(d.owner) ? d.owner : '';
        if (note.kind === 'menufail') note = { kind: '', text: '' };
        if (!menu.length && h.signedIn()) {
          menuIssue = 'nosets';
          if (!window.DSPrintScope?.active()) say(menuIssue);
        }
        if (h.signedIn()) { const saved = takeBack(); if (!sharedPrint()) back = saved; }
      }
    } catch (error) {
      // A sign-in the gate no longer knows: the host has dropped the token; start again as a guest (one 401, no loop).
      if (menuGuard !== guard) return;
      if (error?.lost && h.trial && !h.signedIn()) { clearTimeout(timer); menuBusy = false; h.resync?.(); return; }
      menuIssue = error?.status === 401 ? 'unauthorized' : 'menufail';
      if (!menu.length && !window.DSPrintScope?.active()) say(menuIssue);
    }
    finally { clearTimeout(timer); if (menuGuard === guard) menuBusy = false; }
    if (back) { comeBack(back); return; }
    if (here() && !pending) rerender();
  }
  async function run(job) {
    if (pending) return;                       // a second click while loading does nothing
    const h = host();
    if (!h) { say('unconfigured'); rerender(); return; }
    let toPrint = null;
    const op = { controller: new AbortController(), guest:Boolean(job.guest) };
    pending = op;
    const origin = location.hash;
    const alive = () => pending === op && location.hash === origin && sharedPrint();
    if (!job.quiet) say('loading');
    rerender();
    op.markProgress = () => {
      clearTimeout(op.timer);
      op.timer=setTimeout(()=>{if(pending===op){stop();if(op.guest&&approvedTrial)trialInterrupted();else say('unavailable');rerender();}},25000);
    };
    op.markProgress();
    try {
      await h.ready;
      if (!alive()) return;
      if (!job.guest && !h.signedIn()) { say('unauthorized'); return; }
      const result = await job(h, op.controller.signal, alive);
      if (!alive() || !result) return;
      dropSolutions(); drawn = result; phase = result.phase || 'finish'; page = 0;
      title = result.title || `${result.labels.unit} ${studentSurface()?'모의시험지':'수업 프린트'}`;
      say(result.status, result.items.length);
      if (result.reopened) note = { kind: 'ok', text: `보관한 ${result.items.length}문항을 다시 열었습니다.` };
      if (result.said) note = result.said;
      if (result.printOnReady) toPrint = result;
      if (!result.guest) prefetch(result);      // starts before the cards are drawn, so the progress line is drawn with them
    } catch (error) {
      if (error?.lost) h.resync?.();
      if (pending === op) {
        if (job.guest) guestRefusal(error);
        else if(error?.code==='no_points')note={kind:'unavailable',text:`포인트가 부족합니다.${Number.isSafeInteger(error.data?.free_remaining)?' 현재 '+error.data.free_remaining.toLocaleString()+'P를 사용할 수 있습니다.':''} 문항 수를 줄이거나 다음 지급 시각을 확인해 주세요.`};
        else say(error?.status === 401 ? 'unauthorized' : error?.code === 'origin_rejected' ? 'origin' : error?.status === 403 ? (error.reason === 'expired' ? 'expired' : error.reason === 'not_received' ? 'notreceived' : 'forbidden') : error?.status === 429 ? 'busy' : error?.status === 404 && job.reopen ? 'changed' : 'unavailable');
      }
    } finally {
      clearTimeout(op.timer);
      if (pending === op) { pending = null; rerender(); if (toPrint && drawn === toPrint && sharedPrint()) printWhenReady(); }
    }
  }
  function guestRefusal(error) {
    // r2: a refusal over today's total carries what is left; 0 = the faint locked card, more = say how many.
    if (error?.code === 'trial_limit' && error.data?.scope !== 'all') {
      const left = Number.isInteger(error.data?.left) ? error.data.left : 0;
      writeTally(daily() - left);
      note = {kind:'trialleft', text:left > 0 ? `오늘 로그인 없이 ${left}문항 더 볼 수 있습니다.` : '오늘 로그인 없이 이용할 수 있는 문항 수를 모두 사용했습니다.'};
      return;
    }
    if (error?.code === 'trial_limit') { say('trialbusy'); return; }
    if (error?.code === 'rate_limited') { say('trialrate'); return; }
    if (error?.status === 404 && error.trialOpen) { say('trialexpired'); return; }
    if ([403, 404].includes(error?.status)) { trialOn = false; menu = []; drawn = null; say('unauthorized'); return; }
    say(error?.code === 'origin_rejected' ? 'origin' : 'unavailable');
  }
  function loadingCards() {
    return '<section class="dq59-stage dq61-cardstage" aria-label="문항 준비 중" data-dq-live-first><div class="ds48-preview-toolbar"><strong>문항 미리보기</strong><span data-dq-body-progress role="status"></span></div><div class="dq59-cards" data-dq-live-cards></div></section>';
  }
  function paintLoadingCards() {
    const preview = pending?.preview;
    const panel = document.querySelector('#content [data-dq-live-first]');
    if (!preview || !panel) return;
    const cards = panel.querySelector('[data-dq-live-cards]');
    panel.querySelector('[data-dq-body-progress]').textContent = preview.done + ' / ' + preview.rows.length + '문항 준비됨';
    for (let i = cards.childElementCount; preview.rows[i]; i++) {
      const card = document.createElement('article');
      card.className = 'dq59-card';
      card.setAttribute('aria-label', '문항 ' + (i + 1));
      const head = document.createElement('header');
      const number = document.createElement('b');
      number.textContent = String(i + 1).padStart(2, '0');
      head.append(number);card.append(head, preview.rows[i].body.cloneNode(true));cards.append(card);
      window.WebMathRendererV23?.typeset(card);
    }
  }
  async function openInOrder(rows, open, alive) {
    const op = pending;
    const preview = {rows: new Array(rows.length), done: 0};
    let next = 0, stopped = false;
    async function worker() {
      while (!stopped && next < rows.length && alive()) {
        const index = next++;
        try {
          const item = await open(rows[index]);
          if (stopped || !alive()) return;
          preview.rows[index] = item;
          preview.done++;
          op.markProgress();
          if (!op.preview && preview.rows[0]) {
            op.preview = preview;
            rerender();
            document.querySelector('#content [data-dq-live-first]')?.scrollIntoView({block:'nearest'});
          } else if (op.preview) paintLoadingCards();
        } catch (error) {
          if (!stopped) {
            stopped = true;
            op.controller.abort();
          }
          throw error;
        }
      }
    }
    await Promise.all(Array.from({length: Math.min(3, rows.length)}, worker));
    if (!alive()) throw Error('stale');
    return preview.rows;
  }
  function openAll(h, key, ids, pg, signal, alive) {
    return openInOrder(ids, async id => {
      const payload = await h.open(key, id, pg, signal);
      return {id, body: questionBody(id, payload)};
    }, alive);
  }
  function clearTrial() {
    clearTimeout(trialWake);
    approvedTrial = null;
    if (note.kind === 'trialresume') note = {kind:'', text:''};
  }
  function trialMatches(set) {
    return guest() && here() && printSurface() && set.surface === location.hash &&
      set.key === current()?.cell_key && set.requested === count &&
      set.scope === JSON.stringify(window.DSPrintScope?.request());
  }
  function wakeTrial(set) {
    clearTimeout(trialWake);
    const next = Math.min(set.expiresAt, set.retryAt > Date.now() ? set.retryAt : set.expiresAt);
    trialWake = setTimeout(() => {
      if (approvedTrial !== set) return;
      if (!trialMatches(set)) { clearTrial(); return; }
      if (Date.now() >= set.expiresAt) {
        if (pending) stop();
        clearTrial(); say('trialexpired');
      } else { trialInterrupted(); wakeTrial(set); }
      rerender();
    }, Math.max(1, next - Date.now()));
  }
  function trialInterrupted() {
    const set = approvedTrial;
    if (!set) return;
    const wait = Math.max(0, Math.ceil((set.retryAt - Date.now()) / 1000));
    note = {kind:'trialresume', text:`${set.items.length}문항 중 ${set.bodies.size}문항을 열었습니다. ${wait ? wait + '초 뒤에 ' : ''}남은 문항을 이어 열 수 있습니다.`};
  }
  function guestDraw(previewOnly=false) {
    if (pending) return;
    const row = current();
    if (!row) { say('notready'); rerender(); return; }
    if (approvedTrial && !trialMatches(approvedTrial)) clearTrial();
    if (approvedTrial && Date.now() >= approvedTrial.expiresAt) {
      clearTrial(); say('trialexpired'); rerender(); return;
    }
    if (approvedTrial && Date.now() < approvedTrial.retryAt) return;
    const cap = guestCap(row);
    if (!approvedTrial && !previewOnly && count > cap) { openGate('limit'); return; }
    const want = approvedTrial?.count ?? (previewOnly ? Math.min(5,count,cap) : count);
    if (!want) { openGate('limit'); return; }
    const job = async (h, signal, alive) => {
      let set = approvedTrial;
      if (!set) {
        const issued = Date.now();
        const d = await h.trial.draw(row.cell_key, want, signal);
        if (!alive() || !guest()) return null;
        writeTally(daily() - d.left);
        // Ticket verification remains on the server. Drop local copies at its one-hour or KST day boundary.
        const reset = Date.parse(d.resets_at);
        set = {surface:location.hash, key:row.cell_key, requested:count, scope:JSON.stringify(window.DSPrintScope?.request()), count:want, ticket:d.ticket, status:d.status,
          items:d.items, bodies:new Map(), expiresAt:Math.min(issued + 3600000, Number.isFinite(reset) ? reset : Infinity), retryAt:0};
        approvedTrial = set;
        wakeTrial(set);
      }
      const same = () => alive() && approvedTrial === set && trialMatches(set);
      let items;
      try {
        items = await openInOrder(set.items, async ({item_id:id}) => {
          if (!same()) throw Error('stale');
          if (!set.bodies.has(id)) {
            const payload = await h.trial.open(set.key, id, set.ticket, signal);
            if (!same()) throw Error('stale');
            set.bodies.set(id, questionBody(id, payload));
          }
          return {id,body:set.bodies.get(id)};
        }, same);
      } catch (error) {
        if (!alive() || approvedTrial !== set) return null;
        if (error?.code === 'rate_limited' || error?.status >= 500 || error?.status === 0) {
          if (error.status === 429) set.retryAt = Date.now() + (error.data?.retry_after || 60) * 1000;
          trialInterrupted(); wakeTrial(set); return null;
        }
        clearTrial(); throw Object.assign(error, {trialOpen:true});
      }
      const labels = Object.fromEntries(FIELDS.map(([k]) => [k, row[k]]));
      clearTrial();
      return { guest:true, key:set.key, labels, status:set.status, page:0, count:want, items, capped:items.length < want || leftToday() === 0 };
    };
    job.guest = true;
    run(job);
  }
  // next = { page } keeps the set and count of what is on screen and turns to another slice of it.
  function draw(next, confirmedSet) {
    if (!next && guest()) { guestDraw(); return; }
    if (!confirmedSet && !next && window.DSPrintScope?.active()) { scopedDraw(); return; }
    const row = confirmedSet || current(), from = next && drawn ? drawn : null;
    if (!from && !row?.ready) { say('notready'); rerender(); return; }
    const want = from ? from.count : count, pageNo = from ? next.page : 0;
    run(async (h, signal, alive) => {
      let key = from ? from.key : row.set_key;
      if (!key) { const d = await h.menu(signal); if (d?.sets) menu = d.sets; key = current()?.set_key; }
      if (!alive()) return null;
      if (!key || !UUID.test(key)) throw Object.assign(Error('forbidden'), { status: 403 });
      const pg = paging({ page: pageNo, count: want });
      const d = await h.draw(key, pg, signal);
      if (!alive()) return null;
      if(d.points&&Number.isSafeInteger(d.points.free_remaining))for(const r of menu)if(r.pointPrint)r.pointRemaining=d.points.free_remaining;
      const ids = Array.isArray(d?.items) ? d.items.map(x => x?.item_id) : null;
      const state = !ids ? null : ids.length === 0 ? 'empty' : ids.length === want ? 'ok' : ids.length < want ? 'insufficient' : null;
      if (!state || d.status !== state || new Set(ids).size !== ids.length || !ids.every(i => typeof i === 'string' && UUID.test(i))) throw Error('render');
      if (state === 'empty') { say(from ? 'lastpage' : 'empty'); return null; }
      const labels = from ? from.labels : Object.fromEntries(FIELDS.map(([k]) => [k, row[k]]));
      return { key, labels, status: state, page: pageNo, count: want, printOnReady:Boolean(confirmedSet), title:confirmedSet?draftTitle:'', ...(d.points?{said:{kind:'ok',text:`${ids.length}문항을 구성했습니다. ${d.points.charged.toLocaleString()}P 사용 · 현재 ${d.points.free_remaining.toLocaleString()}P`}}:{}), items: await openAll(h, key, ids, pg, signal, alive) };
    });
  }
  const scopeCriteria = () => ({
    ...window.DSPrintScope.request(), subject:sel.subject || window.DSPrintScopeData?.books?.[0]?.subject,
    stage:scopedLevels().stage || undefined, difficulty:scopedLevels().difficulty || undefined, count
  });
  let outputDialog = null;
  function closeOutput() { outputDialog?.close(); }
  async function openOutput() {
    const h = host();
    if (guest() && sharedPrint()) { guestDraw(); return; }
    if (outputDialog || pending || !sharedPrint() || window.DSPrintScope?.awaitingSupply(sel.subject)) return;
    const criteria = scopeCriteria();
    const origin = location.hash;
    const basic = criteria.mode === 'basic';
    const unit = sel.unit;
    const basicRows = basic ? rows(sel).filter(row=>UUID.test(row.set_key)) : [];
    const sets = {received:basicRows.find(row=>!row.pointPrint), point:basicRows.find(row=>row.pointPrint)};
    if (basic ? !current()?.ready : criteria.mode === 'book' && !criteria.book_id ||
        criteria.type_mode === 'specific' && !criteria.type_ids.length) return;
    const dialog = document.createElement('dialog');
    const abort = new AbortController();
    const timer = setTimeout(()=>abort.abort(),12000);
    outputDialog = dialog;
    dialog.className = 'student-print-confirm';
    dialog.setAttribute('aria-labelledby','student-print-confirm-title');
    dialog.innerHTML = '<h2 id="student-print-confirm-title">출력할 문항 선택</h2><p class="student-print-selection"></p><div data-print-offers role="status">선택한 범위의 문항을 확인하고 있어요.</div><form method="dialog"><button value="cancel" autofocus>취소</button><button type="submit" value="confirm" disabled>확인하고 출력 / PDF 저장</button></form>';
    dialog.querySelector('.student-print-selection').textContent = [criteria.subject,...chosenPrintUnits(),criteria.count+'문항'].join(' · ');
    const offers = dialog.querySelector('[data-print-offers]');
    const submit = dialog.querySelector('[value="confirm"]');
    const quantities = {};
    let reprint = null;
    dialog.addEventListener('change',()=>{submit.disabled=!offers.querySelector('input:checked:enabled');});
    dialog.addEventListener('close',()=>{
      clearTimeout(timer); abort.abort(); dialog.remove(); outputDialog=null;
      if (dialog.returnValue === 'login' && sharedPrint() && location.hash === origin) {
        keepPrintSettings();
        goLogin(); return;
      }
      const chosen = offers.querySelector('input:checked:enabled')?.value;
      if (dialog.returnValue !== 'confirm' || !chosen || !quantities[chosen] || !sharedPrint() || location.hash !== origin ||
          !h.signedIn() || (basic && (unit !== sel.unit || !rows(sel).includes(sets[chosen]))) || JSON.stringify(scopeCriteria()) !== JSON.stringify(criteria)) return;
      if (basic) draw(undefined,sets[chosen]);
      else scopedDraw({...criteria,access_mode:chosen,count:quantities[chosen]},chosen==='reprint'?reprint:null);
    }, {once:true});
    document.body.append(dialog); dialog.showModal();
    if (!h?.signedIn()) {
      clearTimeout(timer);
      offers.innerHTML = '<p>로그인하면 이미 받은 문항은 추가 차감 없이 출력하고, 새 문항은 포인트를 확인한 뒤 받을 수 있어요.</p>';
      submit.value='login'; submit.disabled=false; submit.textContent='로그인'; return;
    }
    const modes = ['received','point'];
    const timedOut = new Promise(resolve=>abort.signal.addEventListener('abort',()=>resolve(null),{once:true}));
    const read = lookup => Promise.race([Promise.resolve().then(lookup).catch(error => ({
      denied: error?.status === 403 && error?.code === 'forbidden'
    })), timedOut]);
    const walletRow = menu.find(row=>row.pointPrint);
    const walletCheck = read(()=>basic && !sets.point ? null : h.pointWallet ? h.pointWallet(abort.signal) : walletRow);
    // 11/25 60(형 흠): 결과를 다 모은 뒤 한 번에 그림 · 첫 글(h2)을 고른 길의 물음으로 — 받은 문항이 없으면 「n문항 · nP 를 차감하고 출력할까요?」 · 포인트 길을 미리 골라 둠.
    //   받은 문항이 있을 때만 「다시 출력(0P)」 고름을 보임 · 남은 포인트 · 출력 뒤 포인트를 함께 · 포인트가 모자라거나 범위를 다 받았으면 단추를 잠그고 까닭을 맨 위에.
    const res = {};
    await Promise.all(modes.map(async mode=>{
      const owned = mode === 'received';
      const availability = read(()=>basic ?
        {extraction_ready:Boolean(sets[mode]),available_count:sets[mode] ? criteria.count : 0} :
        h.scope.menu({...criteria,access_mode:mode},abort.signal));
      const [r,wallet] = await Promise.all([availability,owned ? null : walletCheck]);
      if (!basic && !owned && r?.reprint?.items?.length) {
        reprint=r.reprint; quantities.reprint=reprint.items.length;
      }
      const quantity = Number.isSafeInteger(r?.available_count) && r.extraction_ready ? Math.min(criteria.count,r.available_count) : 0;
      const priceKnown = Number.isSafeInteger(wallet?.pointPrice) && wallet.pointPrice >= 0;
      const remaining = Number.isSafeInteger(wallet?.pointRemaining) ? wallet.pointRemaining : null;
      const need = priceKnown ? wallet.pointPrice*quantity : null;
      let allowed = quantity > 0 && (owned || priceKnown);
      let detail, short = false;
      if (owned && r?.denied) detail = '';
      else if (!r || 'denied' in r) detail = '확인하지 못했어요. 잠시 후 다시 시도해 주세요.';
      else if (!owned && wallet?.denied) {
        const stock = r.available_count > 0 ? '선택 범위 ' + r.available_count + '문항 · ' : '';
        detail = stock + '현재 계정에서 프린트 포인트를 사용할 수 없어요.';
      } else if (!owned && r.available_count > 0 && (!r.extraction_ready || !priceKnown)) {
        detail = '선택 범위 ' + r.available_count + '문항 · 포인트 사용 가능 여부를 확인하지 못했어요.';
      } else if (!owned && quantity && remaining !== null && remaining < (basic ? wallet.pointPrice : need)) {
        allowed = false; short = true;
        detail = '포인트가 모자라요 · 필요 '+need.toLocaleString()+'P · 남은 포인트 '+remaining.toLocaleString()+'P';
      } else if (quantity) detail = owned ? (basic?'내 계정으로 이용 가능한 기본 세트 · ':'이미 받은 문항 ')+quantity+'문항 · 추가 차감 없음' : quantity+'문항 · 새 문항당 '+wallet.pointPrice.toLocaleString()+'P · '+(basic?'최대 ':'')+need.toLocaleString()+'P 차감';
      // 11/25 37: 포인트 범위가 비었을 때 까닭을 나눔(서버 scope_menu 의 pool_count · owned_count). 수가 없으면 지금 글 그대로.
      else if (!basic && !owned && r.pool_count === 0 && criteria.mode === 'book') detail = '이 교재는 아직 포인트로 받을 수 없어요.';
      else if (!basic && !owned && Number.isSafeInteger(r.pool_count) && r.pool_count > 0 && r.available_count === 0) detail = '이 범위의 포인트 문항을 모두 받았어요.';
      else detail = basic ? '이 조건에서 이용할 수 있는 세트가 없어요.' : '선택한 범위에 문항이 없습니다.';
      if (allowed) quantities[mode] = quantity;
      res[mode] = {quantity,allowed,detail,need,remaining,short,wallet};
    }));
    if (outputDialog !== dialog || !dialog.open) return;
    const R = res.received, P = res.point;
    const title = dialog.querySelector('#student-print-confirm-title');
    const ask = {
      received: (basic?'기본 세트 ':'이미 받은 ')+R.quantity+'문항을 다시 출력할까요? (0P)',
      reprint: '이미 받은 '+(quantities.reprint||0)+'문항을 다시 출력할까요? (0P)',
      point: P.quantity+'문항 · '+(basic?'최대 ':'')+(P.need ?? 0).toLocaleString()+'P 를 차감하고 출력할까요?'
    };
    const label = (mode,head,x) => `<label data-print-offer="${mode}"><input type="radio" name="print-access" value="${mode}" ${x.allowed?'':'disabled'}><span><strong>${head}</strong><small>${safe(x.detail)}</small></span></label>`;
    const parts = [];
    if (R.allowed) parts.push(label('received','다시 출력(0P)',R));
    // 받은 문항이 없을 때 「다시 출력」 줄은 내지 않음 · 확인을 못 한 때만 그 까닭을 남김
    else if (R.detail && R.detail.startsWith('확인하지 못했어요')) parts.push(label('received','다시 출력(0P)',R));
    if (reprint) parts.push(label('reprint','포인트로 받은 문항 다시 출력(0P)',{allowed:true,detail:quantities.reprint+'문항 · 추가 차감 없음'}));
    parts.push(label('point',R.allowed?'새 문항 받기(포인트)':'포인트로 받을 문항',P));
    offers.innerHTML = parts.join('') + '<p data-print-balance hidden></p>' + (!R.allowed && !reprint && P.allowed ? '<small>이미 받은 문항이 없어 새 문항을 포인트로 받아요.</small>' : '');
    if (P.wallet?.denied || P.short) {
      const account = document.createElement('a');
      account.href = '/my/#welcome';
      account.textContent = '마이페이지에서 포인트 확인';
      offers.append(account);
    }
    const balance = offers.querySelector('[data-print-balance]');
    const pick = R.allowed ? 'received' : reprint ? 'reprint' : P.allowed ? 'point' : '';
    if (!pick) dialog.querySelector('[value="cancel"]').textContent='범위 다시 선택';
    if (pick) offers.querySelector(`input[value="${pick}"]`).checked = true;
    const refresh = () => {
      const chosen = offers.querySelector('input:checked:enabled')?.value;
      submit.disabled = !chosen;
      title.textContent = chosen ? ask[chosen] : (P.detail || R.detail || '출력할 수 있는 문항이 없어요.');
      if (P.remaining !== null) {
        balance.hidden = false;
        balance.textContent = '남은 포인트 '+P.remaining.toLocaleString()+'P' + (chosen ? ' → 출력 뒤 '+(P.remaining-(chosen==='point'?P.need:0)).toLocaleString()+'P' : '');
      }
    };
    dialog.addEventListener('change',refresh);
    refresh();
    clearTimeout(timer);
  }

  let scopePendingJob=null;
  try{scopePendingJob=JSON.parse(sessionStorage.getItem('ds-print-pending-job')||'null');}catch{}
  function scopedDraw(confirmed,reprint=null) {
    const scope = window.DSPrintScope, row = current();
    if (!host()?.signedIn()) { goLogin(); return; }
    if (!confirmed && !scope?.status(host()).ready) { note = { kind: 'notready', text: scope?.status(host()).reason || TEXT.notready }; rerender(); return; }
    if (guest()) { goLogin(); return; }
    const criteria = confirmed ? {...confirmed} : scopeCriteria();
    if (!reprint) {
      const key=JSON.stringify(criteria);if(scopePendingJob?.key!==key)scopePendingJob={key,id:crypto.randomUUID()};criteria.request_id=scopePendingJob.id;
      try{sessionStorage.setItem('ds-print-pending-job',JSON.stringify(scopePendingJob));}catch{}
    }
    return run(async (h, signal, alive) => {
      const d = reprint || await h.scope.draw(criteria, signal);
      if(d.points&&Number.isSafeInteger(d.points.free_remaining))for(const r of menu)if(r.pointPrint)r.pointRemaining=d.points.free_remaining;
      if (!alive()) return null;
      if (Array.isArray(d?.items) && !d.items.length) { say('empty'); return null; }
      if (!Array.isArray(d?.items) || !d.items.length || d.items.length > criteria.count || new Set(d.items.map(x => x.item_id)).size !== d.items.length || !d.items.every(x => UUID.test(x.item_id) && UUID.test(x.set_key))) throw Error('scope');
      const items = await openInOrder(d.items, async x => {
        const pg = x.paging || {};
        const payload = await h.open(x.set_key, x.item_id, pg, signal);
        return {id: x.item_id, set: x.set_key, paging: pg, body: questionBody(x.item_id, payload)};
      }, alive);
      if (!reprint) {scopePendingJob=null;try{sessionStorage.removeItem('ds-print-pending-job');}catch{}}
      const chosen = scope.unitLabels(criteria.subunit_ids);
      const missing = scope.unitLabels(d.unrepresented_subunits || []);
      const unit = chosen.length ? chosen.join(' · ') : criteria.mode === 'book' ? '교재 연계 범위' : (reprint||criteria.access_mode==='received') ? '기수령 자료 범위' : '선별본 전체 범위';
      return {
        said: {kind:missing.length?'insufficient':'ok',text:`${items.length}문항을 구성했습니다.${d.points?' '+d.points.charged.toLocaleString()+'P 사용 · 현재 '+d.points.free_remaining.toLocaleString()+'P':(reprint||criteria.access_mode==='received')?' 기수령 권리 확인 · 추가 차감 없음':''}${missing.length?' · '+missing.join(' · ')+' 문항은 포함되지 않았습니다.':''}`},
        printOnReady: Boolean(confirmed), title: confirmed ? draftTitle : '', key: d.items[0].set_key, scoped: true, claimed: true, labels: { ...sel, unit, stage:criteria.stage || '전체', difficulty:criteria.difficulty || '전체' },
        status: items.length === count ? 'ok' : 'insufficient', count, page: 0, items
      };
    });
  }
  // Signed in after a guest set: take that set into the member's record (the point board's sets), or draw
  // the same conditions again, then go on with what the guest asked for.
  function comeBack(x) {
    // A guest cell may hold stages drawn together («1 · 2»): the member list is matched by subject, unit,
    // difficulty and one of those stages.
    const stages = String(x.labels.stage).split(/\s*·\s*/);
    const match = listed().find(r => ['subject', 'unit', 'difficulty'].every(k => r[k] === x.labels[k]) && stages.includes(r.stage));
    if (match) FIELDS.forEach(([k]) => { sel[k] = match[k]; });
    count = x.count;
    const want = ['print', 'save'].includes(x.want) ? 'finish' : 'cards';
    const job = async (h, signal, alive) => {
      let claimed = null;
      if (h.trial?.claim) {
        try { claimed = await h.trial.claim(x.key, x.count, signal); }
        catch (error) {
          if (error?.status === 402) { say('claimshort'); return null; }
          if (![400, 403, 404].includes(error?.status)) throw error;   // 판 A gate does not know trial_claim (400) = same conditions, member draw
        }
      }
      if (!alive()) return null;
      if (claimed && x.want !== 'more') {
        // Each question opens with the set it belongs to (contract r2).
        const items = await openInOrder(claimed.items, async it => {
          const payload = await h.open(it.set_key, it.item_id, {}, signal);
          if (!alive()) throw Error('stale');
          return { id: it.item_id, set: it.set_key, body: questionBody(it.item_id, payload) };
        }, alive);
        return { key: claimed.items[0].set_key, claimed: true, labels: x.labels, status: claimed.status, page: 0, count: x.count, items,
          said: { kind: 'ok', text: `방금 구성한 ${items.length}문항을 이어서 열었습니다.` }, openSol: x.want === 'solution', phase: want };
      }
      // Not a point-board cell (403) or «다른 문항으로 바꾸기»: the member draw of the same conditions.
      const next = claimed?.draws?.[0];
      const key = next?.set_key || match?.set_key;
      if (!key || !UUID.test(key)) throw Object.assign(Error('forbidden'), { status: 403 });
      const pageNo = x.want === 'more' ? (next ? next.next_page : 1) : 0;
      const pg = paging({ page: pageNo, count: x.count });
      const d = await h.draw(key, pg, signal);
      if (!alive()) return null;
      if(d.points&&Number.isSafeInteger(d.points.free_remaining))for(const r of menu)if(r.pointPrint)r.pointRemaining=d.points.free_remaining;
      const ids = Array.isArray(d?.items) ? d.items.map(i => i?.item_id) : [];
      if (!ids.length || !ids.every(i => typeof i === 'string' && UUID.test(i))) { say('empty'); return null; }
      const labels = match ? Object.fromEntries(FIELDS.map(([k]) => [k, match[k]])) : x.labels;
      const items = await openAll(h, key, ids, pg, signal, alive);
      return { key, labels, status: ids.length === x.count ? 'ok' : 'insufficient', page: pageNo, count: x.count, items,
        said: x.want === 'more' ? null : { kind: 'renewed', text: TEXT.renewed }, openSol: x.want === 'solution', phase: want };
    };
    run(job);
  }
  // Members: the answers follow the questions at once, three at a time (the gate allows four a member).
  function prefetch(target) {
    const h = host();
    if (!h?.solution || !target || target.guest || target.solOp || drawn !== target) return;
    const op = { guard: new AbortController(), done: 0, total: target.items.length, failed: '' };
    target.solOp = op; target.solMap = new Map();
    op.timer = setTimeout(() => op.guard.abort(), 60000);
    let next = 0;
    const live = () => drawn === target && target.solOp === op && !op.guard.signal.aborted;
    const worker = async () => {
      while (next < target.items.length && live()) {
        const q = target.items[next++];
        try {
          const d = await h.solution(q.set || target.key, q.id, q.paging || (target.claimed ? {} : paging(target)), op.guard.signal);
          if (!d || d.item_id !== q.id || typeof d.answer !== 'string' || d.answer.length > 4000 || typeof d.solution_html !== 'string') throw Error('render');
          target.solMap.set(q.id, { answer: d.answer, body: cleanBody(d.solution_html, true) });
        } catch (error) {
          if (error?.status === 404) target.solMap.set(q.id, { missing: true });
          else { if (!op.failed) op.failed = error?.status === 403 ? 'solforbidden' : error?.status === 401 ? 'unauthorized' : error?.status === 429 ? 'busy' : 'solfail'; if (error?.lost) h.resync?.(); op.guard.abort(); return; }
        }
        op.done++;
        if (live()) { fillSol(q.id); paintProgress(); }
      }
    };
    op.promise = Promise.all([worker(), worker(), worker()]).then(async () => {
      clearTimeout(op.timer);
      if (drawn !== target || target.solOp !== op) return;
      if (op.failed || op.done < op.total) {
        if (!op.failed) op.failed = 'solfail';
        if (here() && !waitPrint) { say(op.failed); rerender(); }
        return;
      }
      target.solutions = target.items.map(q => ({ id: q.id, ...target.solMap.get(q.id) }));
      target.solPages = await measureSolutions(target);
      if (drawn !== target || !here()) return;
      if (phase === 'finish' && !waitPrint) rerender(document.activeElement?.matches?.('[data-dq-title]') ? '[data-dq-title]' : null);
      else paintProgress();
    });
  }
  // Progress without redrawing the screen (the title box keeps its caret).
  function paintProgress() {
    const op = drawn?.solOp;
    if (!op) return;
    document.querySelectorAll('#content [data-dq61-done]').forEach(e => { e.textContent = `${op.done} / ${op.total}`; });
    document.querySelectorAll('#content [data-dq61-progress] em').forEach(e => { e.style.width = Math.round(op.done / op.total * 100) + '%'; });
    if (drawn.solutions) document.querySelectorAll('#content [data-dq61-progress]').forEach(e => e.remove());
    const n = document.querySelector('#content .dq59-note');
    if (n && waitPrint) { n.dataset.kind = 'solwait'; n.textContent = `${TEXT.solwait} (${op.done} / ${op.total})`; }
  }
  // The answer pages flow into two columns; how many pages that takes is only known once laid out.
  function measureSolutions(target) {
    return new Promise(resolve => {
      if (drawn !== target) { resolve(1); return; }
      const f = document.createElement('iframe');
      f.style.cssText = 'position:fixed;left:-10000px;top:0;width:794px;height:1123px;border:0';
      f.title = '정답과 해설 쪽 수 재기';
      const shown = withSol; withSol = true; f.srcdoc = documentHTML('s0'); withSol = shown;   // counted even while switched off
      document.body.append(f); frames.add(f);
      const started = Date.now(), timer = setInterval(() => {
        const b = f.contentDocument?.body;
        if (b?.dataset.ready === 'true' || Date.now() - started > 10000) { clearInterval(timer); const n = Number(b?.dataset.solPages) || 1; f.remove(); frames.delete(f); resolve(n); }
      }, 100);
    });
  }
  function reopen(index) {
    const x = savedList()[index];
    if (!x) return;
    const design = window.DSDocumentDesign?.designs.some(d=>d.id===x.documentDesign) ? x.documentDesign : 'DS-FOCUS-V2';
    draftTitle = x.title;
    pageNote = {placement:x.pageNote?.placement==='footer'?'footer':'header',text:typeof x.pageNote?.text==='string'?x.pageNote.text.slice(0,60):''};
    window.DSDocumentDesign?.select(design);
    const where = { page: x.page || 0, count: x.count || 5 };
    const job = async (h, signal, alive) => ({ key: x.key, labels: x.labels, status: x.ids.length === where.count ? 'ok' : 'insufficient', reopened: true, title: x.title, ...where, items: await openAll(h, x.key, x.ids, paging(where), signal, alive) });
    job.reopen = true;
    columnRule = x.columnRule === true;
    layout = ['1', '2', '4'].includes(x.layout) ? x.layout : '2';
    run(job);
  }
  function save() {
    if (drawn?.scoped) { note = {kind: 'savefail', text: '이 구성은 인쇄 / PDF에서 저장할 수 있습니다.'}; rerender(); return; }
    if (!drawn || drawn.guest) return;
    const d = new Date(), day = `${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    const entry = { columnRule, pageNote:{...pageNote}, documentDesign: window.DSDocumentDesign?.selected().id || 'DS-FOCUS-V2', title: (title || (studentSurface()?'모의시험지':'수업 프린트')).slice(0, 60), layout, key: drawn.key, labels: drawn.labels, ids: drawn.items.map(q => q.id), page: drawn.page, count: drawn.count, day };
    say(putSaved([entry, ...savedList().filter(x => x.key !== entry.key || x.ids.join() !== entry.ids.join())]) ? 'saved' : 'savefail'); rerender('[data-dq-save]');
  }
  document.addEventListener('submit', e => { if (e.target.id === 'dq59-form' && here()) { e.preventDefault(); if (sharedPrint()) openOutput(); } });
  document.addEventListener('click', e => {
    if (e.target.closest?.('[data-dq-open-settings]')) {
      const form = document.getElementById('dq59-form');
      if (form) {
        form.querySelector('select,button')?.focus({preventScroll:true});
        form.scrollIntoView({block:'start'});
      }
      return;
    }
    const enlarge = e.target.closest?.('[data-dq-large-sample]');
    if (enlarge) {
      const source = enlarge.closest('.ds48-canvas')?.querySelector('.ds48-paper-position > iframe');
      if (source) window.DSPrintSurfaceV48.openPaper(source);
      return;
    }
    const g = e.target.closest?.('[data-dq61-gate-open],[data-dq61-login],[data-dq61-signup]');
    if (g && (here() || g.closest('#dq61-gate'))) {
      if (g.hasAttribute('data-dq61-gate-open')) { e.preventDefault(); openGate(g.dataset.dq61GateOpen); return; }
      const want = opened || 'more';
      if (sharedPrint()) keepPrintSettings();
      else if (drawn?.guest) keepBack(want === 'limit' ? 'more' : want);
      if (g.hasAttribute('data-dq61-login')) { e.preventDefault(); document.getElementById('dq61-gate')?.close(); goLogin(); }
      return;                                    // the sign-up link goes on as a normal link
    }
    const b = e.target.closest?.('[data-dq-back],[data-dq-finish],[data-dq-review],[data-dq-print],[data-dq-save],[data-dq-page],[data-dq-reopen],[data-dq-forget],[data-dq-menu],[data-dq-next],[data-dq-redraw],[data-dq-guest-preview],[data-dq61-solretry]');
    if (!b || !here()) return;
    if (b.hasAttribute('data-dq-back')) { stop(); if (!drawn?.guest) dropSolutions(); phase = 'setup'; note = { kind: '', text: '' }; rerender(); }
    else if (b.hasAttribute('data-dq-finish')) { if (pending) return; phase = 'finish'; page = 0; note = { kind: '', text: '' }; rerender(); }
    else if (b.hasAttribute('data-dq-review')) { waitPrint = false; phase = 'cards'; note = { kind: '', text: '' }; rerender(); }
    else if (b.hasAttribute('data-dq-menu')) { note = { kind: '', text: '' }; menuTried = false; rerender(); }
    else if (b.hasAttribute('data-dq-guest-preview') && guest()) guestDraw(true);
    else if (b.hasAttribute('data-dq-redraw')) { clearTrial(); note = { kind: '', text: '' }; if (guest()) guestDraw(); else openOutput(); }
    else if (b.hasAttribute('data-dq61-solretry')) { if (drawn && !drawn.guest) { dropSolutions(); note = { kind: '', text: '' }; prefetch(drawn); rerender(); } }
    else if (b.hasAttribute('data-dq-next')) { if (sharedPrint()) { phase='setup'; rerender(); openOutput(); return; } if (drawn && !pending && !drawn.guest) draw({ page: (drawn.page + 2) * drawn.count <= 50 ? drawn.page + 1 : 0 }); }
    else if (b.hasAttribute('data-dq-print')) printWhenReady();
    else if (b.hasAttribute('data-dq-save')) save();
    else if (b.dataset.dqPage) { page = Number(b.dataset.dqPage); rerender(); }
    else if (b.dataset.dqReopen) reopen(Number(b.dataset.dqReopen));
    else if (b.dataset.dqForget) { const list = savedList(); list.splice(Number(b.dataset.dqForget), 1); putSaved(list); rerender(); }
  });
  document.addEventListener('change', e => {
    const level = e.target.dataset?.dqScopeLevel;
    if (!pending && ['stage','difficulty'].includes(level)) {
      scopedLevels()[level] = e.target.value; clearTrial(); window.DSPrintScope?.invalidate();
      note = {kind:'', text:''}; rerender(`[data-dq-scope-level="${level}"]`); return;
    }
    const key = e.target.dataset?.dqField;
    if (key && !pending) { clearTrial(); window.DSPrintScope?.invalidate(); sel[key] = e.target.value; settle(); note = { kind: '', text: '' }; rerender(`[data-dq-field="${key}"]`); }
    if (e.target.hasAttribute?.('data-student-print-sol')) withSol = e.target.checked;
    if (e.target.hasAttribute?.('data-dq-note-placement')) { pageNote.placement=e.target.value; updateSampleText(); }
    if (e.target.hasAttribute?.('data-dq-divider')) {
      columnRule = e.target.value === 'on';
      rerender('[data-dq-divider]:checked');
      return;
    }
    if (e.target.hasAttribute?.('data-dq-layout') && sharedPrint() && phase === 'setup') { layout=e.target.value; rerender('[data-dq-layout]:checked'); return; }
    if (e.target.hasAttribute?.('data-dq-layout')) { layout = e.target.value; page = 0; rerender('[data-dq-layout]'); }
    if (e.target.hasAttribute?.('data-dq-count') && !pending) { clearTrial(); window.DSPrintScope?.invalidate(); const value = Number(e.target.value); count = COUNTS.includes(value) || (guest() && value > 0 && value === guestCap(current())) ? value : 5; rerender('[data-dq-count]'); }
    if (e.target.hasAttribute?.('data-dq-sol') && drawn && phase === 'finish') {
      // Switching the answer pages only shows or hides them; what was fetched stays with the set.
      withSol = e.target.checked; page = 0; waitPrint = false;
      if (withSol && drawn.solOp?.failed) { dropSolutions(); prefetch(drawn); }
      note = { kind: '', text: '' }; rerender('[data-dq-sol]');
    }
  });
  for (const eventName of ['click', 'change']) document.addEventListener(eventName, e => {
    const el = e.target.closest?.('[data-ps-source],[data-ps-types],[data-ps-unit],[data-ps-type],[data-ps-all]');
    if (!el || pending || (eventName === 'click') !== (el.tagName === 'BUTTON')) return;
    if (window.DSPrintScope?.change(el)) { clearTrial(); note = {kind:'',text:''}; rerender(); }
  });
  document.addEventListener('change', e => { if (e.target.hasAttribute?.('data-ps-subject') && !pending) { clearTrial(); sel.subject = e.target.value; rerender(); } });
  function updateSampleText() {
    const frame = document.querySelector('#content .dq61-sample-page');
    const paper = frame?.contentDocument?.querySelector('.paper');
    if (!paper) return;
    const data=sampleData(), settings=printSettings();
    paper.querySelector('h1').textContent = draftTitle || data.labels.unit+' '+(studentSurface()?'모의시험지':'수업 프린트');
    paper.querySelector('.brand span').textContent = (pageNote.placement==='header' && pageNote.text) || settings.headerText || data.labels.subject+' · '+data.labels.unit;
    const identity = ['footer','both'].includes(settings.identityPlacement) ? [settings.academyName,settings.teacherName].filter(Boolean).join(' · ') : '';
    paper.querySelector('.foot span').textContent = [identity,(pageNote.placement==='footer' && pageNote.text) || settings.footerText || 'DELTASKILL · '+data.labels.unit].filter(Boolean).join(' · ');
  }
  document.addEventListener('load',e=>{if(e.target.matches?.('.dq61-sample-page'))updateSampleText();},true);
  document.addEventListener('input', e => {
    if (e.target.hasAttribute?.('data-dq-title')) title = e.target.value;
    if (e.target.hasAttribute?.('data-student-print-title')) {draftTitle=e.target.value;updateSampleText();}
    if (e.target.hasAttribute?.('data-dq-note')) {pageNote.text=e.target.value;updateSampleText();}
  });
  document.addEventListener('change', e => {
    if (!e.target.hasAttribute?.('data-dq-title') || phase !== 'finish' || !drawn) return;
    const paper = document.querySelector('#content iframe.dq59-paper');
    if (paper) paper.srcdoc = documentHTML(pageArg());
  });
  // While a teacher tab stays open the local preview session is kept from idling out.
  setInterval(() => { const h = host(); if (h?.keepAlive && here() && printSurface() && h.signedIn()) h.keepAlive(); }, 10 * 60 * 1000);
  window.addEventListener('ds-session-change', () => { scopeLevels = {subject:'',stage:'',difficulty:''}; clearTrial(); closeOutput(); window.DSPrintScope?.change({hasAttribute:k=>k==='data-ps-mode',dataset:{psMode:'random'}}); stop(); dropSolutions(); drawn = null; owner = ''; phase = 'setup'; note = { kind: '', text: '' }; menu = []; menuGuard?.abort(); menuGuard = null; menuBusy = false; menuTried = false; menuIssue = ''; trialOn = false; limits = null; document.getElementById('dq61-gate')?.close(); if (here()) rerender(); });
  window.addEventListener('hashchange', () => { clearTrial(); closeOutput(); if (pending) { stop(); say(''); } if (!here()) { waitPrint = false; document.getElementById('dq61-gate')?.close(); if (phase === 'finish') phase = 'cards'; } });
  window.addEventListener('ds-print-scope-ready', () => { if (phase === 'setup' && here()) rerender(); });
  window.addEventListener('ds-document-design-change', () => { if (here() && printSurface()) { page=0; rerender(`[data-document-design="${window.DSDocumentDesign.selected().id}"]`); } });
  window.addEventListener('pagehide', () => { clearTrial(); stop(); dropSolutions(); });
  window.DSDrawTeacherV59 = { suspendStudent(){clearTrial();closeOutput();stop();waitPrint=false;document.getElementById('dq61-gate')?.close();},renderStudent:()=>B.withPrintSurface?B.withPrintSurface(mine):mine(),mount, snapshot: () => ({ phase, pending: Boolean(pending), note: { ...note }, count: drawn?.items.length ?? 0, layout, guest: Boolean(drawn?.guest), trial: trialOn, seen: seenToday, sol: drawn?.solOp ? { done: drawn.solOp.done, total: drawn.solOp.total, ready: Boolean(drawn.solutions), failed: drawn.solOp.failed } : null }) };
  if (here() && host()) rerender();                 // the page was first drawn before this file loaded
})();
