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
    empty: '과목 · 단원 · 단계 · 난도를 바꿔 다시 뽑아 보세요.',
    unauthorized: '<a href="#login" data-dq61-login>로그인하기 ↗</a>',
    forbidden: '<a href="#account">내 이용권 확인 ↗</a>',
    expired: '<a href="#account">내 이용권 확인 ↗</a>',
    notreceived: '<a href="#account">내 자료에서 세트 받기 ↗</a>',
    busy: '잠시 뒤 「문항 뽑기」를 다시 눌러 주세요.',
    origin: '델타스킬 홈페이지 주소에서 다시 열어 주세요.',
    nosets: '<a href="#account">내 이용권 확인 ↗</a>',
    unavailable: '「문항 뽑기」를 다시 눌러 주세요. 계속되면 조건을 바꿔 보세요.',
    changed: '왼쪽에서 조건을 고르고 「문항 뽑기」를 눌러 주세요.',
    notready: '다른 조건을 골라 주세요.',
    menufail: '<button type="button" data-dq-menu>조건 목록 다시 불러오기</button>',
    unconfigured: '잠시 뒤 다시 열어 주세요.',
    trialexpired: '<button type="button" data-dq-redraw>같은 조건으로 다시 뽑기</button>',
    trialbusy: '<a href="#login" data-dq61-login>로그인하기 ↗</a>',
    trialrate: '잠시 뒤 「문항 뽑기」를 다시 눌러 주세요.'
  };
  const TEXT = {
    loading: '문항을 불러오는 중입니다.',
    empty: '이 조건으로 제공할 문항이 아직 없습니다. 다른 조건을 골라 주세요.',
    unauthorized: '로그인한 뒤 문항을 뽑을 수 있습니다.',
    forbidden: '이 조건의 문항을 열 수 있는 이용권이 없습니다.',
    expired: '이용권 기간이 끝났습니다.',
    notreceived: '이 세트를 아직 받지 않았습니다.',
    busy: '요청이 많습니다. 잠시 뒤 다시 눌러 주세요.',
    origin: '이 주소에서는 문항을 불러올 수 없습니다.',
    nosets: '이 계정으로 뽑을 수 있는 조건이 없습니다.',
    unavailable: '문항을 불러오지 못했습니다. 잠시 뒤 다시 시도해 주세요.',
    unconfigured: '문항 서버 연결을 기다리고 있습니다.',
    notready: '이 조건으로는 지금 뽑을 수 없습니다.',
    menufail: '조건 목록을 불러오지 못했습니다.',
    lastpage: '이 조건에서 더 넘길 문항이 없습니다.',
    solloading: '정답 · 해설을 불러오는 중입니다.',
    solok: '정답 · 해설 면을 붙였습니다.',
    solforbidden: '이 세트는 정답 · 해설을 제공하지 않습니다.',
    solfail: '정답 · 해설을 불러오지 못했습니다.',
    solwait: '해설을 붙이는 중입니다. 다 붙으면 인쇄 창이 열립니다.',
    savefail: '이 기기에 보관하지 못했습니다. 브라우저 저장 공간을 확인해 주세요.',
    changed: '보관한 구성의 문항이 바뀌었습니다. 조건을 골라 다시 뽑아 주세요.',
    saved: '이 기기에 임시 보관했습니다.',
    trialexpired: '맛보기 시간이 지났습니다. 다시 뽑아 주세요.',
    trialbusy: '지금 맛보기 이용이 많아 잠시 멈췄습니다. 로그인하면 바로 뽑을 수 있습니다.',
    trialrate: '잠시 뒤 다시 눌러 주세요.',
    renewed: '같은 조건으로 새로 뽑았습니다.',
    claimshort: '포인트가 모자라 방금 본 구성을 받지 못했습니다. 문항 수를 줄여 다시 뽑아 주세요.'
  };

  // ── host: the local member preview, or a test double supplied before this file ──
  const memberHost = null;
  const host = () => window.DSDrawHostV59 ?? memberHost;

  // ── state ──
  let phase = 'setup', menu = [], sel = {}, drawn = null, note = { kind: '', text: '' }, pending = null;
  let layout = '2', title = '', page = 0, embedded = 0, printing = false, owner = '', count = 5, withSol = true, waitPrint = false;
  let trialOn = false, limits = null, seenToday = 0, opened = '';
  const frames = new Set();
  const here = () => ['#teacher', '#studio'].includes(location.hash);
  const listed = () => menu.filter(r => r.ready);
  const rows = prefix => listed().filter(r => FIELDS.every(([k]) => !(k in prefix) || r[k] === prefix[k]));
  const current = () => listed().find(r => FIELDS.every(([k]) => r[k] === sel[k]));
  const label = r => `${r.subject} · ${r.unit} · ${r.stage}단계 · ${r.difficulty}`;
  const guest = () => { const h = host(); return Boolean(trialOn && h?.trial && !h.signedIn()); };
  const daily = () => limits?.daily_items ?? TRIAL_DAILY;
  const leftToday = () => Math.max(0, daily() - seenToday);
  // What one guest draw may hold: the set's size, the server's per-draw cap and what is left today.
  const guestCap = row => Math.min(row?.size ?? 0, limits?.max_items ?? 0, leftToday());
  function settle() {
    // Keep the choice valid from left to right.
    const prefix = {};
    for (const [k] of FIELDS) {
      const options = rows(prefix);
      if (!options.some(r => r[k] === sel[k])) sel[k] = options[0]?.[k] ?? '';
      prefix[k] = sel[k];
    }
  }
  function say(kind, n) {
    note = { kind, text: kind === 'ok' ? `${n}문항을 뽑았습니다.` : kind === 'insufficient' ? `이 조건에 맞는 문항은 ${n}문항입니다. 그대로 프린트를 만들 수 있습니다.` : TEXT[kind] || '' };
  }
  const validSaved = x => x && typeof x.title === 'string' && UUID.test(x.key) && Array.isArray(x.ids) && x.ids.length >= 1 && x.ids.length <= 20 && (x.page === undefined || Number.isInteger(x.page)) && (x.count === undefined || Number.isInteger(x.count)) && new Set(x.ids).size === x.ids.length && x.ids.every(i => typeof i === 'string' && UUID.test(i)) && x.labels && FIELDS.every(([k]) => typeof x.labels[k] === 'string' && x.labels[k].length <= 60);
  function savedList() { if (!owner) return []; try { const v = JSON.parse(localStorage.getItem(SAVED + ':' + owner) || '[]'); return Array.isArray(v) ? v.filter(validSaved).slice(0, 12) : []; } catch { return []; } }
  function putSaved(list) { if (!owner) return false; try { localStorage.setItem(SAVED + ':' + owner, JSON.stringify(list.slice(0, 12))); return true; } catch { return false; } }

  // v61: choice rows by measured width — a list without the canonical row name drops a row (5 → 3 → 2 → 1)
  // while any choice does not fit its cell on one line; measured after fonts, for new cards and on resize.
  const fitChoices = () => { for(const l of document.querySelectorAll('.dq59-choices[data-auto]')){if(!l.offsetWidth)continue;const o=['5','3','2','1'];let i=Math.max(0,o.indexOf(l.dataset.auto));for(;i<o.length;i++){l.dataset.fit=o[i];if(Array.from(l.children).every(li=>{const w=li.style.whiteSpace;li.style.whiteSpace='nowrap';const ok=li.scrollWidth<=li.clientWidth+1;li.style.whiteSpace=w;return ok;}))break;}}for(const el of document.querySelectorAll('.dq59-card .katex-display,.dq59-card p,.dq59-card li,.dq59-card td,.dq59-card div,.solbody .katex-display,.solbody p,.solbody li,.solbody td,.solbody div')){if(el.querySelector('p,li,td,div,.katex-display'))continue;el.style.zoom='';el.style.overflowX='';const box=el.parentElement;if(!box||!box.clientWidth)continue;const room=Math.min(el.clientWidth||box.clientWidth,box.clientWidth);if(el.scrollWidth>room+1){const z=Math.max(.6,Math.floor(room/el.scrollWidth*100)/100);el.style.zoom=z;if(el.scrollWidth>el.clientWidth+1){el.style.overflowX='auto';}}} };
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
    const path = location.pathname + location.search + '#teacher';
    return '/auth/?mode=signup&next=' + encodeURIComponent(/^\/[A-Za-z0-9_\-./?#=&%]*$/.test(path) && !path.startsWith('//') ? path : location.pathname + '#teacher');
  }
  function goLogin() { window.DSLoginReturn = '#teacher'; location.hash = '#login'; }

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
      let longest = 0;
      [...list.children].forEach((li, i) => {
        const text = li.textContent.replace(/[⁠⁡]/g, '').trim();
        if (!/^[①②③④⑤]/.test(text)) li.dataset.mark = '①②③④⑤'[i];
        longest = Math.max(longest, li.querySelector('img,table,mfrac,msqrt,mtable') ? Math.max(text.length, 14) : text.length);
        if (li.querySelector('img,table')) longest = 99;
      });
      // v61: the rows are the canonical render's (5 · 3+2 · 2+2+1, never 4+1); a fragment
      // without that name falls back by length, and a long choice keeps one per row (no choice folds in two).
      const row = (list.className.match(/\bch([1235])\b/) || [])[1];
      list.classList.add('dq59-choices');
      list.dataset.fit = row ? (row === '1' ? '1' : row) : longest <= 8 ? '5' : longest <= 14 ? '3' : longest <= 24 ? '2' : '1';
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
  function sheets() { const n = Number(layout), out = []; for (let i = 0; i < drawn.items.length; i += n) out.push({ offset: i, items: drawn.items.slice(i, i + n) }); return out; }
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
  // Runs inside the print document: site math renderer first, then fit each cell.
  const fitScript = `(async()=>{try{const R=window.WebMathRendererV23;if(R){R.typeset(document.body);await R.prepareFonts();}await Promise.all(Array.from(document.images,i=>i.decode().catch(()=>{})));await document.fonts.ready;await new Promise(r=>{let done=false;const go=()=>{if(!done){done=true;r();}};requestAnimationFrame(()=>requestAnimationFrame(go));setTimeout(go,300);});for(const l of document.querySelectorAll('.dq59-choices[data-auto],.dq59-choices[data-fit="3"]')){if(!l.offsetWidth)continue;const o=['5','3','2','1'];let i=Math.max(0,o.indexOf(l.dataset.auto||l.dataset.fit));for(;i<o.length;i++){l.dataset.fit=o[i];if(Array.from(l.children).every(li=>{const w=li.style.whiteSpace;li.style.whiteSpace='nowrap';const ok=li.scrollWidth<=li.clientWidth+1;li.style.whiteSpace=w;return ok;}))break;}}const wide=el=>el.scrollWidth>el.clientWidth+1;for(const box of document.querySelectorAll('.qbody')){const inner=box.firstElementChild;const blocks=Array.from(inner.querySelectorAll('p,li,td,th,div')).filter(el=>!el.querySelector('p,li,td,th,div,table'));for(const el of blocks){if(wide(el)){el.style.zoom=Math.max(.5,Math.floor(el.clientWidth/el.scrollWidth*100-1)/100);}}let z=1;while(z>.6&&inner.getBoundingClientRect().height>box.clientHeight+1){z=Math.round((z-.04)*100)/100;inner.style.zoom=z;}const edge=box.getBoundingClientRect();if(inner.getBoundingClientRect().height>box.clientHeight+1||Array.from(inner.querySelectorAll('*')).some(el=>{if(el.closest('.katex'))return false;const r=el.getBoundingClientRect();return r.width>0&&(r.right>edge.right+1.5||r.bottom>edge.bottom+1.5||r.left<edge.left-1.5||r.top<edge.top-1.5);}))document.body.dataset.overflow='true';}const flow=document.querySelector('.solflow');if(flow){for(const a of flow.querySelectorAll('.ans[data-tex]')){try{a.innerHTML=window.katex.renderToString(a.dataset.tex,{throwOnError:true,displayMode:false,trust:false,strict:'ignore'});}catch{}}for(const el of Array.from(flow.querySelectorAll('p,li,td,th,div')).filter(el=>!el.querySelector('p,li,td,th,div,table'))){if(wide(el))el.style.zoom=Math.max(.5,Math.floor(el.clientWidth/el.scrollWidth*100-1)/100);}const gap=parseFloat(getComputedStyle(flow).columnGap)||0,fb=flow.getBoundingClientRect(),colW=(fb.width-gap)/2,pitch=colW+gap;const clipped=(f=flow)=>{const fb=f.getBoundingClientRect();return Array.from(f.querySelectorAll('p,li,td,th,div')).filter(el=>!el.querySelector('p,li,td,th,div,table')).some(wide)||Array.from(f.querySelectorAll('*')).some(el=>{const inK=el.closest('.katex');if(inK&&(el.closest('.katex-mathml')||el.ownerSVGElement||el.localName==='svg'||/(^|\\s)(strut|pstrut|vlist-s)(\\s|$)/.test(String(el.className.baseVal??el.className))))return false;const blk=el.closest('p,li,td,th,div,article')||f;return Array.from(el.getClientRects()).some(r=>{if(!(r.width>0))return false;const cy=(r.top+r.bottom)/2,cx=(r.left+r.right)/2;let fr=null,best=Infinity;for(const q of blk.getClientRects()){if(cy<q.top-1||cy>q.bottom+1)continue;const gapx=cx<q.left?q.left-cx:cx>q.right?cx-q.right:0;if(gapx<best){best=gapx;fr=q;}}if(!fr)fr=r;const L=fb.left+Math.floor((fr.left-fb.left+1.5)/pitch)*pitch,side=r.width>colW+1.5||r.left<L-1.5||r.right>L+colW+1.5;return inK?side:(side||r.bottom>fb.bottom+1.5||r.top<fb.top-1.5);});});};window.dqSolClipped=clipped;if(clipped())document.body.dataset.overflow='true';const cols=Math.max(1,Math.round((flow.scrollWidth+gap)/pitch)),n=Math.ceil(cols/2);document.body.dataset.solPages=n;const src=flow.closest('.paper'),only=document.body.dataset.solOnly;const list=only===undefined||only===''?Array.from({length:n},(_,i)=>i):[Math.min(n-1,Number(only))];for(const j of list){const pg=src.cloneNode(true);pg.classList.remove('solmeasure');pg.querySelector('.solflow').style.transform='translateX(-'+(j*2*pitch)+'px)';const no=pg.querySelector('.pgno');if(no&&no.dataset.base!=='')no.textContent=(Number(no.dataset.base)+j+1)+' / '+(Number(no.dataset.base)+n);document.body.insertBefore(pg,src);}src.remove();document.querySelectorAll('.pgq').forEach(e=>{e.textContent=e.dataset.i+' / '+(Number(e.dataset.q)+n);});}}catch{document.body.dataset.renderError='fit';}document.body.dataset.ready='true';})();`;
  const asset = path => safe(new URL(path, location.href).href);
  function documentHTML(only) {
    const all = sheets(), s = printSettings(), heading = safe(title || '수업 프린트'), who = [s.academyName, s.teacherName].filter(Boolean).map(safe).join(' · ');
    const top = ['header', 'both'].includes(s.identityPlacement) ? who : '', bottom = ['footer', 'both'].includes(s.identityPlacement) ? who : '';
    const face = s.font === 'serif' ? '"Batang","AppleMyungjo","Noto Serif KR",serif' : '"Malgun Gothic","Apple SD Gothic Neo",Arial,sans-serif';
    const solOnly = typeof only === 'string' ? Number(only.slice(1)) : null, withSolutions = solOn() && (only === undefined || solOnly !== null);
    const chosen = only === undefined ? all : solOnly !== null ? [] : all.slice(only, only + 1), n = Number(layout), tag = safe(drawn.labels.unit);
    const total = all.length + (solOn() ? drawn.solPages || 1 : 0);
    const brand = `<div class="brand"><strong>${top || (s.identityPlacement === 'none' || bottom ? '' : 'DELTA<em>SKILL</em>')}</strong><span>${safe(s.headerText || drawn.labels.subject + ' · ' + drawn.labels.unit)}</span></div>`;
    const footText = [bottom, safe(s.footerText || 'DELTASKILL · ' + drawn.labels.unit)].filter(Boolean).join(' · ');
    const answer = a => { const t = String(a ?? '').trim(); return /^[1-5]$/.test(t) ? '①②③④⑤'[t - 1] : /[\\^_{}]/.test(t) ? `<span class="ans" data-tex="${safe(t)}">${safe(t)}</span>` : safe(t); };
    const solutions = !withSolutions ? '' : `<section class="paper solmeasure"><header class="head">${brand}<h1>정답과 해설</h1><small>${heading}</small></header><main class="body"><div class="solwin"><div class="solflow">${drawn.items.map((q, i) => { const x = drawn.solutions.find(v => v.id === q.id); return `<article class="sol"><div class="solhead"><b>${String(i + 1).padStart(2, '0')}</b><span>${x && !x.missing ? '정답 ' + answer(x.answer) : ''}</span></div><div class="solbody dq61-s">${x && !x.missing ? x.body.innerHTML : '<p class="solnone">이 문항은 해설이 준비되지 않았습니다.</p>'}</div></article>`; }).join('')}</div></div></main><footer class="foot"><span>${footText}</span><span class="pgno" data-base="${s.showPageNumber ? all.length : ''}"></span></footer></section>`;
    const css = `*{box-sizing:border-box}html,body{margin:0;padding:0;background:#fff;color:#191919;font-family:${face}}body{font-size:12px}.paper{width:210mm;height:297mm;padding:14mm 13mm;position:relative;break-after:page;overflow:hidden}.head{height:25mm;border-bottom:1px solid #353535;margin-bottom:7mm}.brand{display:flex;justify-content:space-between;font-size:9px;letter-spacing:.03em}.head h1{font-size:23px;letter-spacing:-.03em;margin:12px 0 5px;text-align:${s.titleAlign === 'center' ? 'center' : 'left'}}.student{float:right;font-size:10px}.body{height:225mm}.questions{display:grid;grid-template-columns:${n === 1 ? '1fr' : '1fr 1fr'};grid-template-rows:${n === 4 ? '1fr 1fr' : '1fr'};gap:7mm;height:100%}.question{min-width:0;min-height:0;display:flex;flex-direction:column;overflow:hidden}.qhead{display:flex;justify-content:space-between;align-items:baseline;border-bottom:1px solid #cfcfcf;padding-bottom:4px;margin-bottom:9px}.qhead b{font-size:17px}.qhead small{font-size:8px;color:#777}.qbody{flex:1;min-height:0;overflow:hidden}.qbody>div{font-size:${n === 4 ? 12 : 13.5}px;line-height:1.75;word-break:keep-all;overflow-wrap:anywhere}.qbody p{margin:0 0 .7em}.qbody img{max-width:100%;height:auto}.qbody math{font-size:1.06em}.qbody .dq59-bogi{position:relative;margin:1.3em 0 .9em;padding:1.1em .9em .6em;border:1px solid #333}.qbody .dq59-cond,.solbody .dq59-cond{margin:.9em 0;padding:.6em .9em;border:1px solid #333}.dq59-cond-line{display:block}.dq59-cond-line+.dq59-cond-line{margin-top:.35em}.qbody .dq59-bogi-title{position:absolute;top:-.8em;left:50%;transform:translateX(-50%);padding:0 .7em;background:#fff;white-space:nowrap}.qbody .dq59-bogi-title:before{content:'〈 '}.qbody .dq59-bogi-title:after{content:' 〉'}.qbody table{border-collapse:collapse;margin:.5em 0}.qbody td,.qbody th{border:1px solid #555;padding:3px 8px;text-align:center}.qbody ol,.qbody ul{margin:.6em 0;padding-left:1.4em}.qbody .dq59-choices{list-style:none;padding:0;margin:1em 0 0;display:grid;gap:.55em 1em;grid-template-columns:repeat(var(--cols),minmax(0,1fr))}.qbody .dq59-choices[data-fit="5"]{--cols:${n === 1 ? 5 : 3}}.qbody .dq59-choices[data-fit="3"]{--cols:3}.qbody .dq59-choices[data-fit="2"]{--cols:2}.qbody .dq59-choices[data-fit="1"]{--cols:1}.qbody .dq59-choices li{position:relative;min-width:0;padding-left:1.6em}.qbody .dq59-choices li:not([data-mark]){padding-left:0}.qbody .dq59-choices li[data-mark]:before{content:attr(data-mark);position:absolute;left:0}.head small{font-size:10px}.solwin{height:225mm;overflow:hidden}.solflow{height:225mm;column-count:2;column-gap:7mm;column-fill:auto;font-size:12px;line-height:1.7;word-break:keep-all;overflow-wrap:anywhere}.sol{margin:0 0 5mm}.solhead{display:flex;gap:10px;align-items:baseline;border-bottom:1px solid #ddd;padding-bottom:3px;margin-bottom:6px;break-after:avoid}.solhead b{font-size:14px}.solhead span{font-size:12px;font-weight:700}.solbody p{margin:0 0 .6em}.solbody img{max-width:100%;height:auto}.solbody table{border-collapse:collapse;margin:.4em 0}.solbody td,.solbody th{border:1px solid #555;padding:2px 6px;text-align:center}.solnone{color:#777}.solmeasure{position:absolute;left:-9999px;top:0}.foot{position:absolute;bottom:10mm;left:13mm;right:13mm;display:flex;justify-content:space-between;font-size:9px;color:#666}@page{size:A4;margin:0}@media print{.paper:last-child{break-after:auto}}`;
    return `<!doctype html><html lang="ko"><meta charset="utf-8"><title>${heading}</title><link rel="stylesheet" href="${asset('assets/vendor/katex-0.18.4/katex-embed.css?v=24.3')}"><link rel="stylesheet" href="${asset('math-render-v23.css?v=24.1')}"><style>${css}</style><link rel="stylesheet" href="${asset('draw-math-v61.css?v=61.0')}"><body${solOnly !== null ? ` data-sol-only="${solOnly}"` : ''}>${chosen.map((p, local) => {
      const index = only === undefined ? local : only;
      return `<section class="paper"><header class="head">${brand}<h1>${heading}</h1>${s.showStudentName ? '<span class="student">이름 ______________</span>' : ''}</header><main class="body"><div class="questions">${p.items.map((q, i) => `<article class="question"><div class="qhead"><b>${String(p.offset + i + 1).padStart(2, '0')}</b><small>${tag}</small></div><div class="qbody"><div class="dq61-q">${q.body.innerHTML}</div></div></article>`).join('')}</div></main><footer class="foot"><span>${footText}</span><span${s.showPageNumber ? ` class="pgq" data-i="${index + 1}" data-q="${all.length}"` : ''}>${s.showPageNumber ? index + 1 + ' / ' + total : ''}</span></footer></section>`;
    }).join('')}${solutions}<script src="${asset('assets/vendor/katex-0.18.4/katex.min.js')}"><\/script><script src="${asset('math-render-v23.js?v=61.0')}"><\/script><script>${fitScript}<\/script></body></html>`;
  }
  async function printNow() {
    if (printing || !drawn) return;
    printing = true;
    const f = document.createElement('iframe');
    f.style.cssText = 'position:fixed;left:-10000px;top:0;width:794px;height:1123px;border:0';
    f.title = '인쇄용 지면'; f.srcdoc = documentHTML(); document.body.append(f); frames.add(f);
    try {
      await new Promise((resolve, reject) => { const started = Date.now(), timer = setInterval(() => { const d = f.contentDocument; if (d?.body?.dataset.ready === 'true') { clearInterval(timer); d.body.dataset.renderError ? reject(Error('render')) : resolve(); } else if (Date.now() - started > 12000) { clearInterval(timer); reject(Error('load')); } }, 80); });
      if (f.contentDocument.body.dataset.overflow) { toast('한 쪽에 다 담기지 않는 문항이 있습니다. 한 쪽 문항 수를 줄여 주세요.'); return; }
      f.contentWindow.focus(); f.contentWindow.print();
    } catch { toast('지면을 완전히 불러오지 못했습니다. 인쇄하지 않고 구성을 유지합니다.'); }
    finally { printing = false; setTimeout(() => { f.remove(); frames.delete(f); }, 60000); }
  }
  // v61: answer pages on and still arriving — say so, wait for the rest, then the same printNow().
  async function printWhenReady() {
    if (!drawn || drawn.guest) return;
    const op = drawn.solOp;
    if (withSol && !drawn.solutions && op && !op.failed) {
      if (waitPrint) return;
      waitPrint = true; note = { kind: 'solwait', text: TEXT.solwait }; paintProgress();
      const target = drawn;
      await op.promise.catch(() => {});
      if (!waitPrint || drawn !== target || phase !== 'finish' || !here()) return;
      waitPrint = false;
      if (!target.solutions) { say('solfail'); rerender('[data-dq-print]'); return; }
      note = { kind: 'solok', text: TEXT.solok }; rerender('[data-dq-print]');
    }
    printNow();
  }

  // ── views ──
  function steps() {
    const index = phase === 'setup' ? (pending ? 1 : 0) : phase === 'cards' ? 2 : 3;
    return `<ol class="tb36-steps" aria-label="제작 순서">${['조건 설정', '문항 뽑기', '문항 확인', '보관·출력'].map((text, i) => `<li class="${i < index ? 'is-done' : i === index ? 'is-current' : ''}" ${i === index ? 'aria-current="step"' : ''}><b>${i < index ? '✓' : i + 1}</b><span>${text}</span></li>`).join('')}</ol>`;
  }
  function noteHTML() {
    const link = note.kind === 'unauthorized' ? ' <a href="#login" data-dq61-login>로그인 ↗</a>' : note.kind === 'forbidden' ? ' <a href="#account">내 이용권 확인 ↗</a>' : note.kind === 'solfail' ? ' <button type="button" class="dq61-inline" data-dq61-solretry>다시 불러오기</button>' : '';
    return `<p class="tb36-message dq59-note" data-kind="${safe(note.kind)}" role="status" aria-live="polite">${safe(note.text)}${link}</p>`;
  }
  // The one guest gauge: how much of today's free questions this browser has seen.
  function meter() {
    if (!guest()) return '';
    const total = daily(), used = Math.min(total, seenToday);
    return `<div class="dq61-meter" role="group" aria-label="로그인 없이 볼 수 있는 문항"><p><span>로그인 없이 ${total}문항 중</span><b>${used}문항</b></p><i aria-hidden="true"><em style="width:${Math.round(used / total * 100)}%"></em></i></div>`;
  }
  function selects() {
    const prefix = {};
    return FIELDS.map(([k, name]) => {
      const options = [...new Set(rows(prefix).map(r => r[k]))];
      const html = `<label>${name}<select data-dq-field="${k}" aria-label="${name}" ${pending ? 'disabled' : ''}>${options.map(v => `<option value="${safe(v)}" ${sel[k] === v ? 'selected' : ''}>${safe(k === 'stage' ? v + '단계' : v)}</option>`).join('')}</select></label>`;
      prefix[k] = sel[k];
      return html;
    }).join('');
  }
  function countField() {
    const row = current(), cap = guest() ? guestCap(row) : 20;
    const over = guest() && count > cap && cap > 0;          // at 0 the faint card on the right is the one notice
    return `<label>문항 수<select data-dq-count aria-label="문항 수" ${pending ? 'disabled' : ''}${over ? ' aria-describedby="dq61-more"' : ''}>${COUNTS.map(n => `<option value="${n}" ${count === n ? 'selected' : ''}>${n}문항${guest() && n > cap && cap > 0 ? ' · 로그인하면' : ''}</option>`).join('')}</select>${over ? `<small id="dq61-more" class="dq61-more">${cap > 0 ? `로그인 없이 지금은 ${cap}문항까지 뽑을 수 있어요.` : '오늘 로그인 없이 볼 수 있는 문항을 다 봤어요.'} <a href="#login" data-dq61-login>로그인하면 더 ↗</a></small>` : ''}</label>`;
  }
  function idle() {
    const list = guest() ? [] : savedList();
    const lead = pending ? '<div class="dq59-wait" aria-hidden="true"><i></i><i></i><i></i></div><p class="dq59-lead">문항을 불러오는 중입니다.</p>'
      : ALERTS[note.kind] ? `<p class="dq59-lead dq59-alert" data-kind="${safe(note.kind)}"><strong>${safe(note.text)}</strong><span>${ALERTS[note.kind]}</span></p>`
      : guest() && leftToday() === 0 ? lockCard(true)
      : `<p class="dq59-lead"><strong>조건을 고르고 「문항 뽑기」를 누르세요.</strong><span>${guest() ? '로그인 없이 문제를 바로 볼 수 있어요. 정답 · 해설과 출력은 로그인하면 이어집니다.' : '뽑은 문항이 이 자리에 카드로 놓이고, 그대로 프린트로 이어집니다.'}</span></p>`;
    // The same desk as the print preview: an empty sheet waits where the drawn questions will land.
    const sheet = `<div class="dq61-blank"><header><span>DELTA<em>SKILL</em></span><span>${safe(current() ? current().unit : '수업 프린트')}</span></header><div class="dq61-blank-body">${lead}${pending || ALERTS[note.kind] || (guest() && leftToday() === 0) ? '' : '<div class="dq61-ghostlines" aria-hidden="true"><i style="width:86%"></i><i style="width:64%"></i><i style="width:78%"></i></div>'}</div></div>`;
    const surface = window.DSPrintSurfaceV48?.scene ? window.DSPrintSurfaceV48.scene(sheet) : sheet;
    return `<aside class="dq59-stage dq59-idle tb36-order-preview ds48-canvas dq61-desk" aria-busy="${Boolean(pending)}"><div class="ds48-preview-toolbar"><strong>뽑은 문항이 놓일 자리</strong><small>${current() ? `${safe(current().stage)}단계 · ${safe(current().difficulty)} · ${count}문항` : ''}</small></div>${surface}${list.length && !pending ? `<div class="dq59-saved"><h3>이 기기에 임시 보관한 구성</h3><ul>${list.map((x, i) => `<li><button type="button" data-dq-reopen="${i}"><strong>${safe(x.title)}</strong><small>${safe(label(x.labels))} · ${x.ids.length}문항 · ${safe(x.day)}</small></button><button type="button" data-dq-forget="${i}" aria-label="${safe(x.title)} 지우기">×</button></li>`).join('')}</ul></div>` : ''}</aside>`;
  }
  // The faint card in the next place once today's free questions are used: no question in it.
  function lockCard(alone) {
    return `<div class="dq61-lockcard${alone ? ' is-alone' : ''}"><span class="dq61-lockmark" aria-hidden="true">${LOCK_SVG}</span><strong>오늘 로그인 없이 볼 수 있는 ${daily()}문항을 다 봤어요.</strong><span>로그인하면 같은 조건으로 더 뽑고, 정답 · 해설까지 이어서 볼 수 있어요.</span>${alone ? '' : '<button type="button" class="dq61-ghost" data-dq61-gate-open="limit">로그인하고 더 뽑기</button>'}</div>`;
  }
  function setup() {
    const row = current();
    const wantsMore = guest() && row && count > guestCap(row);
    const ready = row?.ready && !pending;
    const button = wantsMore ? `<button type="button" class="tb36-primary" data-dq61-gate-open="limit">${guestCap(row) > 0 ? `로그인하고 ${count}문항 뽑기` : '로그인하고 더 뽑기'} <span>→</span></button>`
      : `<button type="submit" class="tb36-primary" ${ready ? '' : 'disabled'}>${pending ? '불러오는 중' : '문항 뽑기'} <span>→</span></button>`;
    return `<div class="tb36-setup dq59-setup${guest() ? ' dq61-guest' : ''}"><form id="dq59-form" class="tb36-conditions"><div class="tb36-section-title"><b>01</b><h2>어떤 수업을 준비하나요?</h2></div>${meter()}${menu.length ? selects() : ['menufail', 'unauthorized', 'nosets'].includes(note.kind) ? '' : '<p class="dq59-lead dq61-skeleton" aria-busy="true"><i></i><i></i><i></i><span>조건 목록을 불러오는 중입니다.</span></p>'}${menu.length ? countField() : ''}${menu.length || pending ? button : ''}${noteHTML()}</form>${idle()}</div>`;
  }
  function solProgress() {
    const op = drawn?.solOp;
    if (!drawn || drawn.guest || !op || drawn.solutions || op.failed) return '';
    return `<div class="dq61-progress" data-dq61-progress role="status" aria-live="polite"><p><span>정답 · 해설 불러오는 중</span><b data-dq61-done>${op.done} / ${op.total}</b></p><i aria-hidden="true"><em style="width:${Math.round(op.done / op.total * 100)}%"></em></i></div>`;
  }
  function cards() {
    const l = drawn.labels, g = drawn.guest;
    const head = `<div class="tb36-composed dq61-summary"><span>${drawn.reopened ? '보관한 구성' : g ? '로그인 없이 뽑음 · 문제만' : '서버에서 뽑음'}</span><h2>${safe(l.unit)}</h2><p>${safe(l.subject)} · ${safe(l.stage)}단계 · ${safe(l.difficulty)} · <b>${drawn.items.length}문항</b></p><button type="button" data-dq-back>조건 변경</button></div>`;
    const next = (drawn.page + 2) * drawn.count <= 50 ? '다른 문항으로 바꾸기 ↻' : '처음 문항으로 돌아가기 ↺';
    return `<div class="tb36-workspace dq59-work${g ? ' dq61-guest' : ''}"><aside class="tb36-review-panel dq59-panel">${head}${meter()}<div class="tb36-review-heading"><h3>문항 확인</h3><p>${g ? '문제를 살펴보고 프린트 꼴로 넘어가세요.' : '문항과 정답 · 해설을 확인하고 프린트로 넘어가세요.'}</p></div>${solProgress()}${noteHTML()}<button type="button" class="tb36-primary" data-dq-finish ${pending ? 'disabled' : ''}>이 ${drawn.items.length}문항으로 프린트 <span>→</span></button><button type="button" class="tb36-quiet" ${g ? 'data-dq61-gate-open="more"' : 'data-dq-next'} ${pending ? 'disabled' : ''}>${next}${g ? ` <span class="dq61-lockmark" aria-hidden="true">${LOCK_SVG}</span>` : ''}</button></aside><section class="dq59-stage dq61-cardstage" aria-label="뽑은 문항"><div class="ds48-preview-toolbar"><strong>뽑은 문항 · ${drawn.items.length}문항</strong><small>${safe(l.unit)} · ${safe(l.stage)}단계 · ${safe(l.difficulty)}</small></div><div class="dq59-cards" data-dq-cards></div>${g && drawn.capped ? lockCard(false) : ''}</section></div>`;
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
      : owner ? `<div class="tb36-save dq59-save"><strong>이 기기에 임시 보관</strong><p>문항 글은 저장하지 않습니다. 다시 열 때 서버가 권한을 확인합니다.</p><button type="button" data-dq-save>임시 보관</button></div>` : '';
    const print = g ? `<button type="button" class="tb36-primary" data-dq61-gate-open="print">인쇄 / PDF <span>↗</span></button>` : `<button type="button" class="tb36-primary" data-dq-print ${waitPrint ? 'aria-busy="true"' : ''}>인쇄 / PDF <span>↗</span></button>`;
    const paper = onLocked ? window.DSPrintSurfaceV48.scene(lockedPaper()) : window.DSPrintSurfaceV48.scene(`<iframe class="dq59-paper" title="${page + 1}쪽 인쇄 지면" scrolling="no" style="width:793.7008px;height:1122.5197px" srcdoc="${safe(documentHTML(pageArg()))}"></iframe>`);
    const nav = Array.from({ length: pages }, (_, i) => { const locked = g && i === pages - 1; return `<button type="button" data-dq-page="${i}" aria-pressed="${page === i}"${locked ? ' class="is-locked"' : ''}>${i + 1} ${i < all.length ? '문제' : '정답·해설'}${locked ? ` <span class="dq61-lockmark" aria-hidden="true">${LOCK_SVG}</span>` : ''}</button>`; }).join('');
    const pending2 = !g && withSol && !drawn.solutions && drawn.solOp && !drawn.solOp.failed ? `<button type="button" disabled class="is-waiting">정답·해설 <small data-dq61-done>${drawn.solOp.done} / ${drawn.solOp.total}</small></button>` : '';
    return `<div class="tb36-workspace dq59-work${g ? ' dq61-guest' : ''}"><aside class="tb36-finish-panel dq59-panel"><div class="tb36-section-title"><b>04</b><h2>보관·출력</h2></div><label>제목<input data-dq-title maxlength="60" value="${safe(title)}"></label><label>한 쪽 문항 수<select data-dq-layout>${[1, 2, 4].map(n => `<option value="${n}" ${Number(layout) === n ? 'selected' : ''}>${n}문항</option>`).join('')}</select></label><a class="tb36-design-link" href="#print-design">학원명·머리말·표지 디자인 <span>↗</span></a>${solBox}${save}${print}<button type="button" class="tb36-quiet" data-dq-review>문항 다시 확인</button>${noteHTML()}</aside><div class="creator-canvas td34-canvas tb36-canvas ds48-canvas dq59-canvas"><div class="creator-canvas-toolbar"><div><strong>인쇄 미리보기</strong><span>${drawn.items.length}문항 · ${pages}쪽</span></div></div><div class="creator-paper-stage">${paper}</div><nav class="tb36-pages" aria-label="미리보기 쪽">${nav}${pending2}</nav><div class="creator-canvas-footer"><span>A4 · 210 × 297 mm</span><span>${g ? '문제 면 · 정답·해설은 로그인 뒤' : solOn() ? '문제 · 정답·해설' : '문제 면'}</span></div></div></div>`;
  }
  const base = teacher;
  function mine() {
    const t = document.createElement('template');
    t.innerHTML = base();
    const root = t.content.firstElementChild, oldSteps = root?.querySelector('.tb36-steps'), oldSetup = root?.querySelector('.tb36-setup');
    if (!oldSteps || !oldSetup) return base();
    if (!menuTried) queueMicrotask(loadMenu);          // first time this screen is drawn (or after a sign-in change)
    settle();
    root.classList.add('dq61-surface');
    oldSteps.outerHTML = steps();
    oldSetup.outerHTML = phase === 'setup' || !drawn ? setup() : phase === 'cards' ? cards() : finish();
    return root.outerHTML;
  }
  teacher = function () {
    const s = B.snapshot();
    // Without a draw host (for example a plain static copy) the v58.3 flow stays as it is.
    return embedded || !host() || !here() || s.mode !== 'print' || s.phase !== 'setup' ? base.apply(this, arguments) : mine();
  };
  for (const name of ['renderEmbedded', 'embeddedAction', 'embeddedConfig']) {
    const original = B[name];
    B[name] = function () { embedded++; try { return original.apply(this, arguments); } finally { embedded--; } };
  }
  function rerender(focus) {
    if (!here()) return;
    document.getElementById('content').innerHTML = teacher();
    mount();
    if (focus) document.querySelector(focus)?.focus({ preventScroll: true });
  }
  function solPanel(q) {
    if (drawn.guest) return `<button type="button" class="dq61-sol is-locked" data-dq61-gate-open="solution"><span>정답 · 해설</span><span class="dq61-lockmark" aria-hidden="true">${LOCK_SVG}</span></button>`;
    const x = drawn.solMap?.get(q.id);
    return `<details class="dq61-sol" data-dq61-sol="${safe(q.id)}"${drawn.openSol && x ? ' open' : ''}><summary><span>정답 · 해설</span><small>${x ? safe(solLine(x)) : drawn.solOp?.failed ? '불러오지 못함' : '불러오는 중'}</small></summary><div class="dq61-sol-body"></div></details>`;
  }
  const shortAnswer = a => { const t = String(a ?? '').trim(); return /^[1-5]$/.test(t) ? '①②③④⑤'[t - 1] : t.length > 18 || /[\\^_{}]/.test(t) ? '' : t; };
  const solLine = x => x.missing ? '해설 없음' : shortAnswer(x.answer) ? '정답 ' + shortAnswer(x.answer) : '펼쳐서 보기';
  function fillSol(id) {
    const box = document.querySelector(`#content [data-dq61-sol="${CSS.escape(id)}"]`), x = drawn?.solMap?.get(id);
    if (!box || !x) return;
    box.querySelector('summary small').textContent = solLine(x);
    const body = box.querySelector('.dq61-sol-body');
    if (body.childElementCount) return;
    if (x.missing) { body.innerHTML = '<p class="dq61-solnone">이 문항은 해설이 준비되지 않았습니다.</p>'; return; }
    const head = document.createElement('p'); head.className = 'dq61-answer'; head.innerHTML = `<b>정답</b> <span></span>`; const a = x.answer.trim(), slot = head.lastElementChild;
    slot.textContent = /^[1-5]$/.test(a) ? '①②③④⑤'[a - 1] : a;
    // A TeX answer is set by the site's KaTeX (as on the answer pages); plain text if it cannot be read.
    if (/[\\^_{}]/.test(a) && window.katex?.renderToString) { try { slot.innerHTML = window.katex.renderToString(a, { throwOnError: true, displayMode: false, trust: false, strict: 'ignore' }); } catch {} }
    body.append(head, x.body.cloneNode(true));
    if (drawn.openSol) box.open = true;
  }
  function mount() {
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
    solution: ['로그인하면 이 문항들의 정답과 해설을 바로 볼 수 있어요', '방금 뽑은 구성 그대로 정답 · 해설이 펼쳐집니다.'],
    print: ['로그인하면 이 구성 그대로 출력할 수 있어요', '방금 뽑은 문항으로 인쇄 / PDF 화면이 이어서 열립니다.'],
    more: ['로그인하면 다른 문항으로 바꿀 수 있어요', '같은 조건의 다음 문항을 이어서 뽑습니다.'],
    limit: ['로그인하면 더 뽑을 수 있어요', '고른 조건 그대로 이어서 뽑고, 정답 · 해설까지 볼 수 있어요.']
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
  let menuBusy = false, menuTried = false;
  async function loadMenu() {
    const h = host();
    if (!h || menuBusy || !here() || B.snapshot().mode !== 'print') return;   // only for the teacher print screen
    menuBusy = true; menuTried = true;
    const guard = new AbortController(), timer = setTimeout(() => guard.abort(), 12000);
    let back = null;
    try {
      await h.ready;
      if (!here() || B.snapshot().mode !== 'print') { menuTried = false; return; }   // the screen changed while waiting
      if (h.trial && !h.signedIn()) {
        // Guest: the trial list. Switched off or unknown on the server = the sign-in line as before.
        try {
          const d = await h.trial.menu(guard.signal);
          menu = d.cells; limits = d.limits; trialOn = true; owner = '';
          seenToday = readTally();
          if (note.kind === 'menufail' || note.kind === 'unauthorized') note = { kind: '', text: '' };
        } catch (error) {
          trialOn = false; menu = [];
          if ([401, 403, 404, 502, 503].includes(error?.status)) say('unauthorized'); else say('menufail');   // trial not on the server yet (401) or its pool not ready (502 · 503) = sign-in line
        }
      } else {
        trialOn = false;
        const d = await h.menu(guard.signal);
        if (!Array.isArray(d?.sets)) throw Error('menu');
        menu = d.sets.filter(r => r && FIELDS.every(([k]) => typeof r[k] === 'string'));
        // An opaque tag from the local proxy; no account request is made from the page for it.
        owner = h.signedIn() && typeof d.owner === 'string' && /^[0-9a-f]{16}$/.test(d.owner) ? d.owner : '';
        if (note.kind === 'menufail') note = { kind: '', text: '' };
        if (!menu.length && h.signedIn()) say('nosets');
        if (h.signedIn()) back = takeBack();
      }
    } catch (error) {
      // A sign-in the gate no longer knows: the host has dropped the token; start again as a guest (one 401, no loop).
      if (error?.lost && h.trial && !h.signedIn()) { clearTimeout(timer); menuBusy = false; h.resync?.(); return; }
      if (error?.status === 401) say('unauthorized'); else if (!menu.length) say('menufail');
    }
    finally { clearTimeout(timer); menuBusy = false; }
    if (back) { comeBack(back); return; }
    if (here() && !pending) rerender();
  }
  async function run(job) {
    if (pending) return;                       // a second click while loading does nothing
    const h = host();
    if (!h) { say('unconfigured'); rerender(); return; }
    const op = { controller: new AbortController() };
    pending = op;
    const alive = () => pending === op && here();
    if (!job.quiet) say('loading');
    rerender();
    op.timer = setTimeout(() => { if (pending === op) { stop(); say('unavailable'); rerender(); } }, 25000);
    try {
      await h.ready;
      if (!alive()) return;
      if (!job.guest && !h.signedIn()) { say('unauthorized'); return; }
      const result = await job(h, op.controller.signal, alive);
      if (!alive() || !result) return;
      dropSolutions(); drawn = result; phase = result.phase || 'cards'; page = 0;
      title = result.title || `${result.labels.unit} 수업 프린트`;
      say(result.status, result.items.length);
      if (result.reopened) note = { kind: 'ok', text: `보관한 ${result.items.length}문항을 다시 열었습니다.` };
      if (result.said) note = result.said;
      if (!result.guest) prefetch(result);      // starts before the cards are drawn, so the progress line is drawn with them
    } catch (error) {
      if (error?.lost) h.resync?.();
      if (pending === op) {
        if (job.guest) guestRefusal(error);
        else say(error?.status === 401 ? 'unauthorized' : error?.code === 'origin_rejected' ? 'origin' : error?.status === 403 ? (error.reason === 'expired' ? 'expired' : error.reason === 'not_received' ? 'notreceived' : 'forbidden') : error?.status === 429 ? 'busy' : error?.status === 404 && job.reopen ? 'changed' : 'unavailable');
      }
    } finally {
      clearTimeout(op.timer);
      if (pending === op) { pending = null; rerender(); }
    }
  }
  function guestRefusal(error) {
    // r2: a refusal over today's total carries what is left; 0 = the faint locked card, more = say how many.
    if (error?.code === 'trial_limit' && error.data?.scope !== 'all') {
      const left = Number.isInteger(error.data?.left) ? error.data.left : 0;
      writeTally(daily() - left);
      note = left > 0 ? { kind: 'trialleft', text: `오늘 로그인 없이 ${left}문항 더 볼 수 있습니다.` } : { kind: '', text: '' };
      return;
    }
    if (error?.code === 'trial_limit') { say('trialbusy'); return; }
    if (error?.code === 'rate_limited') { say('trialrate'); return; }
    if (error?.status === 404 && error.trialOpen) { say('trialexpired'); return; }
    if ([403, 404].includes(error?.status)) { trialOn = false; menu = []; drawn = null; say('unauthorized'); return; }
    say(error?.code === 'origin_rejected' ? 'origin' : 'unavailable');
  }
  async function openAll(h, key, ids, pg, signal, alive) {
    return Promise.all(ids.map(async id => {
      const payload = await h.open(key, id, pg, signal);
      if (!alive()) throw Error('stale');
      return { id, body: questionBody(id, payload) };
    }));
  }
  function guestDraw() {
    const row = current(), want = count;
    if (!row) { say('notready'); rerender(); return; }
    if (want > guestCap(row)) { openGate('limit'); return; }
    const job = async (h, signal, alive) => {
      const d = await h.trial.draw(row.cell_key, want, signal);
      if (!alive()) return null;
      const ids = d.items.map(x => x.item_id);
      writeTally(daily() - d.left);                // the server's own count of what is left today
      const items = await Promise.all(ids.map(async id => {
        try {
          const payload = await h.trial.open(row.cell_key, id, d.ticket, signal);
          if (!alive()) throw Error('stale');
          return { id, body: questionBody(id, payload) };
        } catch (error) { throw Object.assign(error, { trialOpen: true }); }
      }));
      const labels = Object.fromEntries(FIELDS.map(([k]) => [k, row[k]]));
      return { guest: true, key: row.cell_key, labels, status: d.status, page: 0, count: want, items, capped: ids.length < want || leftToday() === 0 };
    };
    job.guest = true;
    run(job);
  }
  // next = { page } keeps the set and count of what is on screen and turns to another slice of it.
  function draw(next) {
    if (!next && guest()) { guestDraw(); return; }
    const row = current(), from = next && drawn ? drawn : null;
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
      const ids = Array.isArray(d?.items) ? d.items.map(x => x?.item_id) : null;
      const state = !ids ? null : ids.length === 0 ? 'empty' : ids.length === want ? 'ok' : ids.length < want ? 'insufficient' : null;
      if (!state || d.status !== state || new Set(ids).size !== ids.length || !ids.every(i => typeof i === 'string' && UUID.test(i))) throw Error('render');
      if (state === 'empty') { say(from ? 'lastpage' : 'empty'); return null; }
      const labels = from ? from.labels : Object.fromEntries(FIELDS.map(([k]) => [k, row[k]]));
      return { key, labels, status: state, page: pageNo, count: want, items: await openAll(h, key, ids, pg, signal, alive) };
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
        const items = await Promise.all(claimed.items.map(async it => {
          const payload = await h.open(it.set_key, it.item_id, {}, signal);
          if (!alive()) throw Error('stale');
          return { id: it.item_id, set: it.set_key, body: questionBody(it.item_id, payload) };
        }));
        return { key: claimed.items[0].set_key, claimed: true, labels: x.labels, status: claimed.status, page: 0, count: x.count, items,
          said: { kind: 'ok', text: `방금 뽑은 ${items.length}문항을 이어서 열었습니다.` }, openSol: x.want === 'solution', phase: want };
      }
      // Not a point-board cell (403) or «다른 문항으로 바꾸기»: the member draw of the same conditions.
      const next = claimed?.draws?.[0];
      const key = next?.set_key || match?.set_key;
      if (!key || !UUID.test(key)) throw Object.assign(Error('forbidden'), { status: 403 });
      const pageNo = x.want === 'more' ? (next ? next.next_page : 1) : 0;
      const pg = paging({ page: pageNo, count: x.count });
      const d = await h.draw(key, pg, signal);
      if (!alive()) return null;
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
          const d = await h.solution(q.set || target.key, q.id, target.claimed ? {} : paging(target), op.guard.signal);
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
    const where = { page: x.page || 0, count: x.count || 5 };
    const job = async (h, signal, alive) => ({ key: x.key, labels: x.labels, status: x.ids.length === where.count ? 'ok' : 'insufficient', reopened: true, title: x.title, ...where, items: await openAll(h, x.key, x.ids, paging(where), signal, alive) });
    job.reopen = true;
    layout = ['1', '2', '4'].includes(x.layout) ? x.layout : '2';
    run(job);
  }
  function save() {
    if (!drawn || drawn.guest) return;
    const d = new Date(), day = `${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    const entry = { title: (title || '수업 프린트').slice(0, 60), layout, key: drawn.key, labels: drawn.labels, ids: drawn.items.map(q => q.id), page: drawn.page, count: drawn.count, day };
    say(putSaved([entry, ...savedList().filter(x => x.key !== entry.key || x.ids.join() !== entry.ids.join())]) ? 'saved' : 'savefail'); rerender('[data-dq-save]');
  }
  document.addEventListener('submit', e => { if (e.target.id === 'dq59-form') { e.preventDefault(); draw(); } });
  document.addEventListener('click', e => {
    const g = e.target.closest?.('[data-dq61-gate-open],[data-dq61-login],[data-dq61-signup]');
    if (g && (here() || g.closest('#dq61-gate'))) {
      if (g.hasAttribute('data-dq61-gate-open')) { e.preventDefault(); openGate(g.dataset.dq61GateOpen); return; }
      const want = opened || 'more';
      if (drawn?.guest) keepBack(want === 'limit' ? 'more' : want);
      if (g.hasAttribute('data-dq61-login')) { e.preventDefault(); document.getElementById('dq61-gate')?.close(); goLogin(); }
      return;                                    // the sign-up link goes on as a normal link
    }
    const b = e.target.closest?.('[data-dq-back],[data-dq-finish],[data-dq-review],[data-dq-print],[data-dq-save],[data-dq-page],[data-dq-reopen],[data-dq-forget],[data-dq-menu],[data-dq-next],[data-dq-redraw],[data-dq61-solretry]');
    if (!b || !here()) return;
    if (b.hasAttribute('data-dq-back')) { stop(); if (!drawn?.guest) dropSolutions(); phase = 'setup'; note = { kind: '', text: '' }; rerender(); }
    else if (b.hasAttribute('data-dq-finish')) { if (pending) return; phase = 'finish'; page = 0; note = { kind: '', text: '' }; rerender(); }
    else if (b.hasAttribute('data-dq-review')) { waitPrint = false; phase = 'cards'; note = { kind: '', text: '' }; rerender(); }
    else if (b.hasAttribute('data-dq-menu')) { note = { kind: '', text: '' }; menuTried = false; rerender(); }
    else if (b.hasAttribute('data-dq-redraw')) { note = { kind: '', text: '' }; draw(); }
    else if (b.hasAttribute('data-dq61-solretry')) { if (drawn && !drawn.guest) { dropSolutions(); note = { kind: '', text: '' }; prefetch(drawn); rerender(); } }
    else if (b.hasAttribute('data-dq-next')) { if (drawn && !pending && !drawn.guest) draw({ page: (drawn.page + 2) * drawn.count <= 50 ? drawn.page + 1 : 0 }); }
    else if (b.hasAttribute('data-dq-print')) printWhenReady();
    else if (b.hasAttribute('data-dq-save')) save();
    else if (b.dataset.dqPage) { page = Number(b.dataset.dqPage); rerender(); }
    else if (b.dataset.dqReopen) reopen(Number(b.dataset.dqReopen));
    else if (b.dataset.dqForget) { const list = savedList(); list.splice(Number(b.dataset.dqForget), 1); putSaved(list); rerender(); }
  });
  document.addEventListener('change', e => {
    const key = e.target.dataset?.dqField;
    if (key && !pending) { sel[key] = e.target.value; settle(); note = { kind: '', text: '' }; rerender(`[data-dq-field="${key}"]`); }
    if (e.target.hasAttribute?.('data-dq-layout')) { layout = e.target.value; page = 0; rerender('[data-dq-layout]'); }
    if (e.target.hasAttribute?.('data-dq-count') && !pending) { count = COUNTS.includes(Number(e.target.value)) ? Number(e.target.value) : 5; if (guest()) rerender('[data-dq-count]'); }
    if (e.target.hasAttribute?.('data-dq-sol') && drawn && phase === 'finish') {
      // Switching the answer pages only shows or hides them; what was fetched stays with the set.
      withSol = e.target.checked; page = 0; waitPrint = false;
      if (withSol && drawn.solOp?.failed) { dropSolutions(); prefetch(drawn); }
      note = { kind: '', text: '' }; rerender('[data-dq-sol]');
    }
  });
  document.addEventListener('input', e => { if (e.target.hasAttribute?.('data-dq-title')) title = e.target.value; });
  document.addEventListener('change', e => {
    if (!e.target.hasAttribute?.('data-dq-title') || phase !== 'finish' || !drawn) return;
    const paper = document.querySelector('#content iframe.dq59-paper');
    if (paper) paper.srcdoc = documentHTML(pageArg());
  });
  // While a teacher tab stays open the local preview session is kept from idling out.
  setInterval(() => { const h = host(); if (h?.keepAlive && here() && B.snapshot().mode === 'print' && h.signedIn()) h.keepAlive(); }, 10 * 60 * 1000);
  window.addEventListener('ds-session-change', () => { stop(); dropSolutions(); drawn = null; owner = ''; phase = 'setup'; note = { kind: '', text: '' }; menu = []; menuTried = false; trialOn = false; limits = null; document.getElementById('dq61-gate')?.close(); if (here()) rerender(); });
  window.addEventListener('hashchange', () => { if (pending) { stop(); say(''); } if (!here()) { waitPrint = false; document.getElementById('dq61-gate')?.close(); if (phase === 'finish') phase = 'cards'; } });
  window.addEventListener('pagehide', () => { stop(); dropSolutions(); });
  window.DSDrawTeacherV59 = { snapshot: () => ({ phase, pending: Boolean(pending), note: { ...note }, count: drawn?.items.length ?? 0, layout, guest: Boolean(drawn?.guest), trial: trialOn, seen: seenToday, sol: drawn?.solOp ? { done: drawn.solOp.done, total: drawn.solOp.total, ready: Boolean(drawn.solutions), failed: drawn.solOp.failed } : null }) };
  if (here() && host()) rerender();                 // the page was first drawn before this file loaded
})();
