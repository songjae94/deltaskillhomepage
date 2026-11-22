/* v59: teacher print flow drawn from a server set. v58.3 files stay as they are.
   The page knows display names and opaque set/item ids only. Question bodies are
   copied through an allow-list; answers and solutions are never requested here. */
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
  const SAVED = 'dq59-saved';
  const ALERTS = {
    empty: '과목 · 단원 · 단계 · 난도를 바꿔 다시 뽑아 보세요.',
    unauthorized: '<a href="#login">로그인하기 ↗</a>',
    forbidden: '<a href="#account">내 이용권 확인 ↗</a>',
    expired: '<a href="#account">내 이용권 확인 ↗</a>',
    notreceived: '<a href="#account">내 자료에서 세트 받기 ↗</a>',
    busy: '잠시 뒤 「문항 뽑기」를 다시 눌러 주세요.',
    origin: '델타스킬 홈페이지 주소에서 다시 열어 주세요.',
    nosets: '<a href="#account">내 이용권 확인 ↗</a>',
    unavailable: '「문항 뽑기」를 다시 눌러 주세요. 계속되면 조건을 바꿔 보세요.',
    changed: '왼쪽에서 조건을 고르고 「문항 뽑기」를 눌러 주세요.',
    notready: '준비된 조건을 골라 주세요.',
    menufail: '<button type="button" data-dq-menu>조건 목록 다시 불러오기</button>',
    unconfigured: '잠시 뒤 다시 열어 주세요.'
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
    unconfigured: '문항 서버 연결을 준비하고 있습니다.',
    notready: '이 조건은 준비 중입니다.',
    menufail: '조건 목록을 불러오지 못했습니다.',
    lastpage: '이 조건에서 더 넘길 문항이 없습니다.',
    solloading: '정답 · 해설을 불러오는 중입니다.',
    solok: '정답 · 해설 면을 붙였습니다.',
    solforbidden: '이 세트는 정답 · 해설을 제공하지 않습니다.',
    solfail: '정답 · 해설을 불러오지 못했습니다. 다시 눌러 주세요.',
    savefail: '이 기기에 보관하지 못했습니다. 브라우저 저장 공간을 확인해 주세요.',
    changed: '보관한 구성의 문항이 바뀌었습니다. 조건을 골라 다시 뽑아 주세요.',
    saved: '이 기기에 임시 보관했습니다.'
  };

  // ── host: the local member preview, or a test double supplied before this file ──
  const memberHost = null;
  const host = () => window.DSDrawHostV59 ?? memberHost;

  // ── state ──
  let phase = 'setup', menu = [], sel = {}, drawn = null, note = { kind: '', text: '' }, pending = null;
  let layout = '2', title = '', page = 0, embedded = 0, printing = false, owner = '', count = 5, withSol = false, solBusy = false, solOp = null;
  const frames = new Set();
  const here = () => ['#teacher', '#studio'].includes(location.hash);
  const rows = prefix => menu.filter(r => FIELDS.every(([k]) => !(k in prefix) || r[k] === prefix[k]));
  const current = () => menu.find(r => FIELDS.every(([k]) => r[k] === sel[k]));
  const label = r => `${r.subject} · ${r.unit} · ${r.stage}단계 · ${r.difficulty}`;
  function settle() {
    // Keep the choice valid from left to right; prefer a prepared set.
    const prefix = {};
    for (const [k] of FIELDS) {
      const options = rows(prefix);
      if (!options.some(r => r[k] === sel[k])) sel[k] = (options.find(r => r.ready) || options[0])?.[k] ?? '';
      prefix[k] = sel[k];
    }
  }
  function say(kind, count) {
    note = { kind, text: kind === 'ok' ? `${count}문항을 뽑았습니다.` : kind === 'insufficient' ? `이 조건에 맞는 문항은 ${count}문항입니다. 그대로 프린트를 만들 수 있습니다.` : TEXT[kind] || '' };
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
    body.querySelectorAll('table').forEach(t => { const wrap = document.createElement('div'); wrap.className = 'dq59-scroll'; t.replaceWith(wrap); wrap.append(t); });
  }

  // ── print document (problem pages; the answer pages wait for the server) ──
  function printSettings() {
    try { return window.PrintComposerV14.normalizeSettings(studio.printSettings); }
    catch { return { academyName: '', teacherName: '', headerText: '', footerText: '', identityPlacement: 'header', font: 'default', titleAlign: 'left', showStudentName: true, showPageNumber: true }; }
  }
  function sheets() { const n = Number(layout), out = []; for (let i = 0; i < drawn.items.length; i += n) out.push({ offset: i, items: drawn.items.slice(i, i + n) }); return out; }
  // Answers and solutions live only while the answer pages are switched on in the print screen.
  function dropFrames() { for (const f of frames) f.remove(); frames.clear(); }
  function dropSolutions() {
    const old = solOp; solOp = null;
    if (old) { clearTimeout(old.timer); old.guard.abort(); }
    if (drawn) { delete drawn.solutions; delete drawn.solPages; }
    withSol = false; solBusy = false; dropFrames();
  }
  const paging = d => d.count === 5 && d.page === 0 ? {} : { page: d.page, count: d.count };
  const solOn = () => Boolean(withSol && drawn?.solutions);
  const totalPages = () => sheets().length + (solOn() ? drawn.solPages || 1 : 0);
  const pageArg = () => { const q = sheets().length; return page < q ? page : 's' + (page - q); };
  // Runs inside the print document: site math renderer first, then fit each cell.
  const fitScript = `(async()=>{try{const R=window.WebMathRendererV23;if(R){R.typeset(document.body);await R.prepareFonts();}await Promise.all(Array.from(document.images,i=>i.decode().catch(()=>{})));await document.fonts.ready;await new Promise(r=>{let done=false;const go=()=>{if(!done){done=true;r();}};requestAnimationFrame(()=>requestAnimationFrame(go));setTimeout(go,300);});for(const l of document.querySelectorAll('.dq59-choices[data-auto]')){if(!l.offsetWidth)continue;const o=['5','3','2','1'];let i=Math.max(0,o.indexOf(l.dataset.auto));for(;i<o.length;i++){l.dataset.fit=o[i];if(Array.from(l.children).every(li=>{const w=li.style.whiteSpace;li.style.whiteSpace='nowrap';const ok=li.scrollWidth<=li.clientWidth+1;li.style.whiteSpace=w;return ok;}))break;}}const wide=el=>el.scrollWidth>el.clientWidth+1;for(const box of document.querySelectorAll('.qbody')){const inner=box.firstElementChild;const blocks=Array.from(inner.querySelectorAll('p,li,td,th,div')).filter(el=>!el.querySelector('p,li,td,th,div,table'));for(const el of blocks){if(wide(el)){el.style.zoom=Math.max(.5,Math.floor(el.clientWidth/el.scrollWidth*100-1)/100);}}let z=1;while(z>.6&&inner.getBoundingClientRect().height>box.clientHeight+1){z=Math.round((z-.04)*100)/100;inner.style.zoom=z;}const edge=box.getBoundingClientRect();if(inner.getBoundingClientRect().height>box.clientHeight+1||Array.from(inner.querySelectorAll('*')).some(el=>{if(el.closest('.katex'))return false;const r=el.getBoundingClientRect();return r.width>0&&(r.right>edge.right+1.5||r.bottom>edge.bottom+1.5||r.left<edge.left-1.5||r.top<edge.top-1.5);}))document.body.dataset.overflow='true';}const flow=document.querySelector('.solflow');if(flow){for(const a of flow.querySelectorAll('.ans[data-tex]')){try{a.innerHTML=window.katex.renderToString(a.dataset.tex,{throwOnError:true,displayMode:false,trust:false,strict:'ignore'});}catch{}}for(const el of Array.from(flow.querySelectorAll('p,li,td,th,div')).filter(el=>!el.querySelector('p,li,td,th,div,table'))){if(wide(el))el.style.zoom=Math.max(.5,Math.floor(el.clientWidth/el.scrollWidth*100-1)/100);}const gap=parseFloat(getComputedStyle(flow).columnGap)||0,fb=flow.getBoundingClientRect(),colW=(fb.width-gap)/2,pitch=colW+gap;const clipped=(f=flow)=>{const fb=f.getBoundingClientRect();return Array.from(f.querySelectorAll('p,li,td,th,div')).filter(el=>!el.querySelector('p,li,td,th,div,table')).some(wide)||Array.from(f.querySelectorAll('*')).some(el=>{const inK=el.closest('.katex');if(inK&&(el.closest('.katex-mathml')||el.ownerSVGElement||el.localName==='svg'||/(^|\\s)(strut|pstrut|vlist-s)(\\s|$)/.test(String(el.className.baseVal??el.className))))return false;const blk=el.closest('p,li,td,th,div,article')||f;return Array.from(el.getClientRects()).some(r=>{if(!(r.width>0))return false;const cy=(r.top+r.bottom)/2,cx=(r.left+r.right)/2;let fr=null,best=Infinity;for(const q of blk.getClientRects()){if(cy<q.top-1||cy>q.bottom+1)continue;const gapx=cx<q.left?q.left-cx:cx>q.right?cx-q.right:0;if(gapx<best){best=gapx;fr=q;}}if(!fr)fr=r;const L=fb.left+Math.floor((fr.left-fb.left+1.5)/pitch)*pitch,side=r.width>colW+1.5||r.left<L-1.5||r.right>L+colW+1.5;return inK?side:(side||r.bottom>fb.bottom+1.5||r.top<fb.top-1.5);});});};window.dqSolClipped=clipped;if(clipped())document.body.dataset.overflow='true';const cols=Math.max(1,Math.round((flow.scrollWidth+gap)/pitch)),n=Math.ceil(cols/2);document.body.dataset.solPages=n;const src=flow.closest('.paper'),only=document.body.dataset.solOnly;const list=only===undefined||only===''?Array.from({length:n},(_,i)=>i):[Math.min(n-1,Number(only))];for(const j of list){const pg=src.cloneNode(true);pg.classList.remove('solmeasure');pg.querySelector('.solflow').style.transform='translateX(-'+(j*2*pitch)+'px)';const no=pg.querySelector('.pgno');if(no&&no.dataset.base!=='')no.textContent=(Number(no.dataset.base)+j+1)+' / '+(Number(no.dataset.base)+n);document.body.insertBefore(pg,src);}src.remove();document.querySelectorAll('.pgq').forEach(e=>{e.textContent=e.dataset.i+' / '+(Number(e.dataset.q)+n);});}}catch{document.body.dataset.renderError='fit';}document.body.dataset.ready='true';})();`;
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

  // ── views ──
  function steps() {
    const index = phase === 'setup' ? (pending ? 1 : 0) : phase === 'cards' ? 2 : 3;
    return `<ol class="tb36-steps" aria-label="제작 순서">${['조건 설정', '문항 뽑기', '문항 확인', '보관·출력'].map((text, i) => `<li class="${i < index ? 'is-done' : i === index ? 'is-current' : ''}" ${i === index ? 'aria-current="step"' : ''}><b>${i < index ? '✓' : i + 1}</b><span>${text}</span></li>`).join('')}</ol>`;
  }
  function noteHTML() {
    const link = note.kind === 'unauthorized' ? ' <a href="#login">로그인 ↗</a>' : note.kind === 'forbidden' ? ' <a href="#account">내 이용권 확인 ↗</a>' : '';
    return `<p class="tb36-message dq59-note" data-kind="${safe(note.kind)}" role="status" aria-live="polite">${safe(note.text)}${link}</p>`;
  }
  function selects() {
    const prefix = {};
    return FIELDS.map(([k, name]) => {
      const options = [...new Set(rows(prefix).map(r => r[k]))];
      const html = `<label>${name}<select data-dq-field="${k}" aria-label="${name}" ${pending ? 'disabled' : ''}>${options.map(v => { const ready = rows({ ...prefix, [k]: v }).some(r => r.ready); return `<option value="${safe(v)}" ${sel[k] === v ? 'selected' : ''} ${ready ? '' : 'disabled'}>${safe(k === 'stage' ? v + '단계' : v)}${ready ? '' : ' · 준비 중'}</option>`; }).join('')}</select></label>`;
      prefix[k] = sel[k];
      return html;
    }).join('');
  }
  function idle() {
    const list = savedList();
    return `<aside class="dq59-stage dq59-idle" aria-busy="${Boolean(pending)}">${pending ? '<div class="dq59-wait" aria-hidden="true"><i></i><i></i><i></i></div><p class="dq59-lead">문항을 불러오는 중입니다.</p>' : ALERTS[note.kind] ? `<p class="dq59-lead dq59-alert" data-kind="${safe(note.kind)}"><strong>${safe(note.text)}</strong><span>${ALERTS[note.kind]}</span></p>` : '<p class="dq59-lead"><strong>조건을 고르고 「문항 뽑기」를 누르세요.</strong><span>뽑은 문항이 이 자리에 카드로 놓이고, 그대로 프린트로 이어집니다.</span></p>'}${list.length && !pending ? `<div class="dq59-saved"><h3>이 기기에 임시 보관한 구성</h3><ul>${list.map((x, i) => `<li><button type="button" data-dq-reopen="${i}"><strong>${safe(x.title)}</strong><small>${safe(label(x.labels))} · ${x.ids.length}문항 · ${safe(x.day)}</small></button><button type="button" data-dq-forget="${i}" aria-label="${safe(x.title)} 지우기">×</button></li>`).join('')}</ul></div>` : ''}</aside>`;
  }
  function setup() {
    const row = current();
    return `<div class="tb36-setup dq59-setup"><form id="dq59-form" class="tb36-conditions"><div class="tb36-section-title"><b>01</b><h2>어떤 수업을 준비하나요?</h2></div>${menu.length ? selects() : ['menufail', 'unauthorized', 'nosets'].includes(note.kind) ? '' : '<p class="dq59-lead">조건 목록을 불러오는 중입니다.</p>'}${menu.length ? `<label>문항 수<select data-dq-count aria-label="문항 수" ${pending ? 'disabled' : ''}>${[5, 10, 15, 20].map(n => `<option value="${n}" ${count === n ? 'selected' : ''}>${n}문항</option>`).join('')}</select></label>` : ''}<button type="submit" class="tb36-primary" ${pending || !row?.ready ? 'disabled' : ''}>${pending ? '불러오는 중' : '문항 뽑기'} <span>→</span></button>${noteHTML()}</form>${idle()}</div>`;
  }
  function cards() {
    const l = drawn.labels;
    return `<div class="tb36-workspace dq59-work"><aside class="tb36-review-panel dq59-panel"><div class="tb36-composed"><span>${drawn.reopened ? '보관한 구성' : '서버에서 뽑음'}</span><h2>${safe(l.unit)}</h2><p>${safe(l.subject)} · ${safe(l.stage)}단계 · ${safe(l.difficulty)} · ${drawn.items.length}문항</p><button type="button" data-dq-back>조건 변경</button></div><div class="tb36-review-heading"><h3>문항 확인</h3><p>문항을 확인하고 프린트로 넘어가세요.</p></div>${noteHTML()}<button type="button" class="tb36-primary" data-dq-finish ${pending ? 'disabled' : ''}>이 ${drawn.items.length}문항으로 프린트 <span>→</span></button><button type="button" class="tb36-quiet" data-dq-next ${pending ? 'disabled' : ''}>${(drawn.page + 2) * drawn.count <= 50 ? '다른 문항으로 바꾸기 ↻' : '처음 문항으로 돌아가기 ↺'}</button></aside><section class="dq59-stage" aria-label="뽑은 문항"><div class="dq59-cards" data-dq-cards></div></section></div>`;
  }
  function finish() {
    const all = sheets();
    const pages = totalPages();
    page = Math.max(0, Math.min(page, pages - 1));
    return `<div class="tb36-workspace dq59-work"><aside class="tb36-finish-panel dq59-panel"><div class="tb36-section-title"><b>04</b><h2>보관·출력</h2></div><label>제목<input data-dq-title maxlength="60" value="${safe(title)}"></label><label>한 쪽 문항 수<select data-dq-layout>${[1, 2, 4].map(n => `<option value="${n}" ${Number(layout) === n ? 'selected' : ''}>${n}문항</option>`).join('')}</select></label><a class="tb36-design-link" href="#print-design">학원명·머리말·표지 디자인 <span>↗</span></a>${owner ? `<div class="tb36-save dq59-save"><strong>이 기기에 임시 보관</strong><p>문항 글은 저장하지 않습니다. 다시 열 때 서버가 권한을 확인합니다. 계정 보관은 서버 연결 뒤 바뀝니다.</p><button type="button" data-dq-save >임시 보관</button></div>` : ''}<label class="dq59-check"><input type="checkbox" data-dq-sol ${withSol ? 'checked' : ''} ${solBusy ? 'disabled' : ''}><span>정답 · 해설 면 붙이기</span></label><button type="button" class="tb36-primary" data-dq-print>인쇄 / PDF <span>↗</span></button><button type="button" class="tb36-quiet" data-dq-review>문항 다시 확인</button>${noteHTML()}</aside><div class="creator-canvas td34-canvas tb36-canvas ds48-canvas dq59-canvas"><div class="creator-canvas-toolbar"><div><strong>인쇄 미리보기</strong><span>${drawn.items.length}문항 · ${pages}쪽</span></div></div><div class="creator-paper-stage">${window.DSPrintSurfaceV48.scene(`<iframe class="dq59-paper" title="${page + 1}쪽 인쇄 지면" scrolling="no" style="width:793.7008px;height:1122.5197px" srcdoc="${safe(documentHTML(pageArg()))}"></iframe>`)}</div><nav class="tb36-pages" aria-label="미리보기 쪽">${Array.from({ length: pages }, (_, i) => `<button type="button" data-dq-page="${i}" aria-pressed="${page === i}">${i + 1} ${i < all.length ? '문제' : '정답·해설'}</button>`).join('')}</nav><div class="creator-canvas-footer"><span>A4 · 210 × 297 mm</span><span>${solOn() ? '문제 · 정답·해설' : '문제 면'}</span></div></div></div>`;
  }
  const base = teacher;
  function mine() {
    const t = document.createElement('template');
    t.innerHTML = base();
    const root = t.content.firstElementChild, oldSteps = root?.querySelector('.tb36-steps'), oldSetup = root?.querySelector('.tb36-setup');
    if (!oldSteps || !oldSetup) return base();
    if (!menuTried) queueMicrotask(loadMenu);          // first time this screen is drawn (or after a sign-in change)
    settle();
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
      return card;
    }));
  }
  const content = document.getElementById('content');
  if (content) new MutationObserver(mount).observe(content, { childList: true });

  // ── actions ──
  function stop() { const old = pending; pending = null; if (old) { clearTimeout(old.timer); old.controller.abort(); } }
  let menuBusy = false, menuTried = false;
  async function loadMenu() {
    const h = host();
    if (!h || menuBusy || !here() || B.snapshot().mode !== 'print') return;   // only for the teacher print screen
    menuBusy = true; menuTried = true;
    const guard = new AbortController(), timer = setTimeout(() => guard.abort(), 12000);
    try {
      await h.ready;
      if (!here() || B.snapshot().mode !== 'print') { menuTried = false; return; }   // the screen changed while waiting
      const d = await h.menu(guard.signal);
      if (!Array.isArray(d?.sets)) throw Error('menu');
      menu = d.sets.filter(r => r && FIELDS.every(([k]) => typeof r[k] === 'string'));
      // An opaque tag from the local proxy; no account request is made from the page for it.
      owner = h.signedIn() && typeof d.owner === 'string' && /^[0-9a-f]{16}$/.test(d.owner) ? d.owner : '';
      if (note.kind === 'menufail') note = { kind: '', text: '' };
      if (!menu.length && h.signedIn()) say('nosets');
    } catch (error) { if (error?.status === 401) say('unauthorized'); else if (!menu.length) say('menufail'); }
    finally { clearTimeout(timer); menuBusy = false; }
    if (here() && !pending) rerender();
  }
  async function run(job) {
    if (pending) return;                       // a second click while loading does nothing
    const h = host();
    if (!h) { say('unconfigured'); rerender(); return; }
    const op = { controller: new AbortController() };
    pending = op;
    const alive = () => pending === op && here();
    say('loading'); rerender();
    op.timer = setTimeout(() => { if (pending === op) { stop(); say('unavailable'); rerender(); } }, 25000);
    try {
      await h.ready;
      if (!alive()) return;
      if (!h.signedIn()) { say('unauthorized'); return; }
      const result = await job(h, op.controller.signal, alive);
      if (!alive() || !result) return;
      dropSolutions(); drawn = result; phase = 'cards'; page = 0;
      title = result.title || `${result.labels.unit} 수업 프린트`;
      say(result.status, result.items.length);
      if (result.reopened) note = { kind: 'ok', text: `보관한 ${result.items.length}문항을 다시 열었습니다.` };
    } catch (error) {
      if (error?.lost) h.resync?.();
      if (pending === op) say(error?.status === 401 ? 'unauthorized' : error?.code === 'origin_rejected' ? 'origin' : error?.status === 403 ? (error.reason === 'expired' ? 'expired' : error.reason === 'not_received' ? 'notreceived' : 'forbidden') : error?.status === 429 ? 'busy' : error?.status === 404 && job.reopen ? 'changed' : 'unavailable');
    } finally {
      clearTimeout(op.timer);
      if (pending === op) { pending = null; rerender(); }
    }
  }
  async function openAll(h, key, ids, pg, signal, alive) {
    return Promise.all(ids.map(async id => {
      const payload = await h.open(key, id, pg, signal);
      if (!alive()) throw Error('stale');
      return { id, body: questionBody(id, payload) };
    }));
  }
  // next = { page } keeps the set and count of what is on screen and turns to another slice of it.
  function draw(next) {
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
  async function loadSolutions() {
    const h = host(), target = drawn;
    if (!h?.solution || !target || solBusy) return;
    dropSolutions();
    const op = { guard: new AbortController() };
    solOp = op; solBusy = true; say('solloading'); rerender('[data-dq-sol]');
    const live = () => solOp === op && drawn === target && phase === 'finish' && here();
    op.timer = setTimeout(() => op.guard.abort(), 40000);
    try {
      const list = await Promise.all(target.items.map(async q => {
        try {
          const d = await h.solution(target.key, q.id, paging(target), op.guard.signal);
          if (!d || d.item_id !== q.id || typeof d.answer !== 'string' || d.answer.length > 4000 || typeof d.solution_html !== 'string') throw Error('render');
          return { id: q.id, answer: d.answer, body: cleanBody(d.solution_html, true) };
        } catch (error) { if (error?.status === 404) return { id: q.id, missing: true }; throw error; }
      }));
      if (!live()) return;
      target.solutions = list; withSol = true;
      const pages = await measureSolutions();
      if (!live()) return;
      target.solPages = pages;
      say('solok');
    } catch (error) {
      if (error?.lost) h.resync?.();
      if (live()) { withSol = false; delete target.solutions; say(error?.status === 401 ? 'unauthorized' : error?.code === 'origin_rejected' ? 'origin' : error?.status === 429 ? 'busy' : error?.status === 403 ? 'solforbidden' : 'solfail'); }
    } finally {
      clearTimeout(op.timer);
      if (solOp === op) { solOp = null; solBusy = false; if (drawn === target && phase === 'finish' && here()) rerender('[data-dq-sol]'); }
    }
  }
  // The answer pages flow into two columns; how many pages that takes is only known once laid out.
  function measureSolutions() {
    return new Promise(resolve => {
      const f = document.createElement('iframe');
      f.style.cssText = 'position:fixed;left:-10000px;top:0;width:794px;height:1123px;border:0';
      f.title = '정답과 해설 쪽 수 재기'; f.srcdoc = documentHTML('s0'); document.body.append(f); frames.add(f);
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
    if (!drawn) return;
    const d = new Date(), day = `${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    const entry = { title: (title || '수업 프린트').slice(0, 60), layout, key: drawn.key, labels: drawn.labels, ids: drawn.items.map(q => q.id), page: drawn.page, count: drawn.count, day };
    say(putSaved([entry, ...savedList().filter(x => x.key !== entry.key || x.ids.join() !== entry.ids.join())]) ? 'saved' : 'savefail'); rerender('[data-dq-save]');
  }
  document.addEventListener('submit', e => { if (e.target.id === 'dq59-form') { e.preventDefault(); draw(); } });
  document.addEventListener('click', e => {
    const b = e.target.closest?.('[data-dq-back],[data-dq-finish],[data-dq-review],[data-dq-print],[data-dq-save],[data-dq-page],[data-dq-reopen],[data-dq-forget],[data-dq-menu],[data-dq-next]');
    if (!b || !here()) return;
    if (b.hasAttribute('data-dq-back')) { stop(); dropSolutions(); phase = 'setup'; note = { kind: '', text: '' }; rerender(); }
    else if (b.hasAttribute('data-dq-finish')) { if (pending) return; phase = 'finish'; page = 0; note = { kind: '', text: '' }; rerender(); }
    else if (b.hasAttribute('data-dq-review')) { dropSolutions(); phase = 'cards'; note = { kind: '', text: '' }; rerender(); }
    else if (b.hasAttribute('data-dq-menu')) { note = { kind: '', text: '' }; menuTried = false; rerender(); }
    else if (b.hasAttribute('data-dq-next')) { if (drawn && !pending) draw({ page: (drawn.page + 2) * drawn.count <= 50 ? drawn.page + 1 : 0 }); }
    else if (b.hasAttribute('data-dq-print')) printNow();
    else if (b.hasAttribute('data-dq-save')) save();
    else if (b.dataset.dqPage) { page = Number(b.dataset.dqPage); rerender(); }
    else if (b.dataset.dqReopen) reopen(Number(b.dataset.dqReopen));
    else if (b.dataset.dqForget) { const list = savedList(); list.splice(Number(b.dataset.dqForget), 1); putSaved(list); rerender(); }
  });
  document.addEventListener('change', e => {
    const key = e.target.dataset?.dqField;
    if (key && !pending) { sel[key] = e.target.value; settle(); note = { kind: '', text: '' }; rerender(`[data-dq-field="${key}"]`); }
    if (e.target.hasAttribute?.('data-dq-layout')) { layout = e.target.value; page = 0; rerender('[data-dq-layout]'); }
    if (e.target.hasAttribute?.('data-dq-count') && !pending) count = [5, 10, 15, 20].includes(Number(e.target.value)) ? Number(e.target.value) : 5;
    if (e.target.hasAttribute?.('data-dq-sol') && drawn && phase === 'finish') {
      page = 0;
      if (!e.target.checked) { dropSolutions(); note = { kind: '', text: '' }; rerender('[data-dq-sol]'); }
      else loadSolutions();                       // asked again every time it is switched on
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
  window.addEventListener('ds-session-change', () => { stop(); dropSolutions(); drawn = null; owner = ''; phase = 'setup'; note = { kind: '', text: '' }; menu = []; menuTried = false; if (here()) rerender(); });
  window.addEventListener('hashchange', () => { if (pending) { stop(); say(''); } if (!here()) { dropSolutions(); if (phase === 'finish') phase = 'cards'; } });
  window.addEventListener('pagehide', () => { stop(); dropSolutions(); });
  window.DSDrawTeacherV59 = { snapshot: () => ({ phase, pending: Boolean(pending), note: { ...note }, count: drawn?.items.length ?? 0, layout }) };
  if (here() && host()) rerender();                 // the page was first drawn before this file loaded
})();
