/* 지침 확인: 렌더규격-0903@r1.11 · 수식조판-원칙-1005@r0.3 (스킬: 렌더전수조사)
   One TeX preprocessor for every place on the site that sets TeX itself (front cards, study text items,
   timed sheets, draw samples). It is a line-by-line port of ops scripts/수식조판/수식교정.py
   (fix_tex · bracket_strut · script_frac) plus R4 「본문 분수는 \dfrac」. Same answers as the Python
   self-test (run scripts/tests/math-typeset.cjs). Mathematical content is never changed — only the
   TeX style commands and spacing the printed exam uses. Twice-applied gives the same result. */
((global) => {
  'use strict';
  if (global.DSMathTypeset) return;

  // ---- fix_tex (R1 큰 연산자 · R2 프라임 · R3 \,dx) ----
  const BIG = /(?<!\\displaystyle)(?<!\\displaystyle )\\(int|lim|sum)(?![a-zA-Z])/g;
  const PRIME = /(?<![\^{])\\prime(?![a-zA-Z])/g;
  const DIFF = /(?<=[)\]}|0-9a-zA-Z])\s*d([xtsuy])(?![a-zA-Z_^{(])/g;
  function fixTeX(s) {
    s = s.replace(PRIME, "'");
    s = s.replace(BIG, (m, op) => '\\displaystyle\\' + op);
    if (s.includes('\\int')) s = s.replace(DIFF, (m, v) => '\\,d' + v);
    return s;
  }

  function groupEnd(s, i) {
    if (i >= s.length) return s.length;
    if (s[i] === '{') {
      let depth = 0;
      for (let j = i; j < s.length; j++) {
        if (s[j] === '{') depth++;
        else if (s[j] === '}') { depth--; if (depth === 0) return j + 1; }
      }
      return s.length;
    }
    if (s[i] === '\\') { const m = /^\\[a-zA-Z]+|^\\./.exec(s.slice(i)); return i + (m ? m[0].length : 1); }
    return i + 1;
  }
  function wrapFracs(s) {
    let out = '', i = 0;
    while (i < s.length) {
      const m = /^\\(?:d|t)?frac(?![a-zA-Z])/.exec(s.slice(i));
      if (m) {
        let k = i + m[0].length;
        while (k < s.length && s[k] === ' ') k++;
        const a = groupEnd(s, k), b = groupEnd(s, a);
        out += '{\\tfrac' + s.slice(k, b) + '}';
        i = b; continue;
      }
      out += s[i]; i++;
    }
    return out;
  }
  const INT_LIMIT = /(?:\\(?:int|sum|lim)(?:\\limits)?|\\right[\]).|])\s*(?:_(?:\{(?:[^{}]|\{[^{}]*\})*\}|\\?\w))?\s*$/;
  const DELIM = /\\(?:left|right)\s*(\\\{|\\\}|\\langle|\\rangle|\\lvert|\\rvert|\\vert|\\\||[()\[\]|.])/g;
  const plainDelims = s => s.replace(DELIM, (m, d) => d === '.' ? '' : d);
  const TALL = /\\(?:[dc]?frac|i?int|oint|sum|prod|begin|d?binom|vphantom|lim|over(?:set|brace)|under(?:set|brace)|stackrel|[bB]igg?|left|displaystyle|substack|matrix)(?![a-zA-Z])/;
  const INNER = /\\left\s*(\(|\[|\\\{)((?:(?!\\left|\\right)[\s\S])*?)\\right\s*(\)|\]|\\\})/g;
  const PAIR = { '(': ')', '[': ']', '\\{': '\\}' };
  function baseDelims(tex) {
    if (!tex.includes('\\tfrac') || !tex.includes('\\left')) return tex;
    const keep = [];
    const one = (whole, o, body, c) => {
      const tall = PAIR[o] !== c || body.includes('\x00') || TALL.test(body.split('\\tfrac').join(''));
      if (!tall && body.includes('\\tfrac')) return o + body + c;
      keep.push(whole);
      const mark = tall || body.includes('\\tfrac') ? '\x00' : '\x01';
      return mark + (keep.length - 1) + mark;
    };
    let prev = null;
    while (prev !== tex) { prev = tex; tex = tex.replace(INNER, one); }
    while (/[\x00\x01]/.test(tex)) tex = tex.replace(/[\x00\x01](\d+)[\x00\x01]/g, (m, n) => keep[Number(n)]);
    return tex;
  }
  const FRAC = /\\d?frac(?![a-zA-Z])/;
  function scriptFrac(tex) {
    if (tex.includes('\\tfrac') && !FRAC.test(tex)) return tex;
    let out = '', i = 0;
    const n = tex.length;
    while (i < n) {
      const c = tex[i];
      if ((c === '^' || c === '_') && i + 1 < n && tex[i + 1] === '{') {
        const j = groupEnd(tex, i + 1);
        let inner = tex.slice(i + 2, j - 1);
        if (FRAC.test(inner)) {
          inner = wrapFracs(plainDelims(inner));
          if (c === '^' && inner.startsWith('{\\tfrac') && !INT_LIMIT.test(out)) inner = '\\mkern2mu' + inner;
        }
        out += c + '{' + inner + '}';
        i = j; continue;
      }
      if ((c === '^' || c === '_') && /^\\d?frac(?![a-zA-Z])/.test(tex.slice(i + 1))) {
        let k = i + 1 + /^\\d?frac/.exec(tex.slice(i + 1))[0].length;
        while (k < n && tex[k] === ' ') k++;
        const b = groupEnd(tex, groupEnd(tex, k));
        out += c + '{' + (c === '^' && !INT_LIMIT.test(out) ? '\\mkern2mu' : '') + wrapFracs(tex.slice(i + 1, b)) + '}';
        i = b; continue;
      }
      out += c; i++;
    }
    return baseDelims(out);
  }
  const BRACKET_END = /(?<!\\vphantom\{\\dfrac\{1\}\{2\}\})\\right\](?=(?:[_^](?:\{(?:[^{}]|\{[^{}]*\})*\}|\\[a-zA-Z]+|\w)){1,2})/g;
  const SCRIPTS = /(?:[_^](?:\{(?:[^{}]|\{[^{}]*\})*\}|\\[a-zA-Z]+|\w)){1,2}/y;
  function sqrtBeforeRight(tex) {
    tex = tex.replace(/\\left\[(?!\\,)\s*(?=\\sqrt)/g, '\\left[\\,');
    let out = '', last = 0;
    for (const m of tex.matchAll(/\\right\]/g)) {
      const k = m.index;
      if (k > 0 && tex[k - 1] === '}') {
        let depth = 0, j = k - 1;
        while (j >= 0) {
          if (tex[j] === '}') depth++;
          else if (tex[j] === '{') { depth--; if (depth === 0) break; }
          j--;
        }
        if (j > 0 && /\\sqrt(?:\[[^\]]*\])?$/.test(tex.slice(0, j))) { out += tex.slice(last, k) + '\\,'; last = k; }
      }
    }
    return out + tex.slice(last);
  }
  function bracketStrut(tex) {
    tex = sqrtBeforeRight(tex);
    let out = '', i = 0;
    for (const m of tex.matchAll(BRACKET_END)) {
      SCRIPTS.lastIndex = m.index + m[0].length;
      const tail = (SCRIPTS.exec(tex) || [''])[0];
      out += tex.slice(i, m.index) + (tail.includes('frac') ? '\\vphantom{\\dfrac{1}{2}}' : '') + m[0];
      i = m.index + m[0].length;
    }
    return out + tex.slice(i);
  }

  // ---- R4: a fraction in the running text is set at text size (\dfrac), as on the printed exam.
  // Fractions inside another fraction, a script, a limit or an explicit smaller style stay compact. ----
  function bodyFrac(tex) {
    let out = '', i = 0;
    const stack = [];   // each open brace: 'script' | 'frac' | 'compact' | 'text' | 'group'
    const pending = []; // arguments still owed to a \frac-like command: {depth, n, kind}
    let pendingText = false;
    const compact = () => stack.some(t => t !== 'group');
    const owe = () => { const p = pending[pending.length - 1]; return p && p.depth === stack.length ? p : null; };
    const take = () => { const p = owe(); if (!p) return null; p.n--; if (!p.n) pending.pop(); return p.kind; };
    while (i < tex.length) {
      const cmd = /^\\[a-zA-Z]+/.exec(tex.slice(i));
      if (cmd) {
        const name = cmd[0];
        if (!/^\\(?:left|right|displaystyle|textstyle|scriptstyle|scriptscriptstyle)$/.test(name)) take();
        if (name === '\\frac' && !compact()) { out += '\\dfrac'; pending.push({ depth: stack.length, n: 2, kind: 'frac' }); i += name.length; continue; }
        if (/^\\(?:[dtc]?frac|d?binom)$/.test(name)) pending.push({ depth: stack.length, n: 2, kind: 'frac' });
        if (/^\\(?:text|textrm|mathrm|operatorname|mbox|hbox)$/.test(name)) pendingText = true;
        if (/^\\(?:scriptstyle|scriptscriptstyle|textstyle)$/.test(name) && stack.length) stack[stack.length - 1] = 'compact';
        out += name; i += name.length; continue;
      }
      const c = tex[i];
      if (c === '\\') { take(); out += tex.slice(i, i + 2); i += 2; continue; }
      if (c === '{') {
        const before = out.replace(/\s+$/, '');
        let kind = take() || 'group';
        if (pendingText) { kind = 'text'; pendingText = false; }
        else if (kind === 'group' && /[\^_]$/.test(before)) kind = 'script';
        stack.push(kind); out += c; i++; continue;
      }
      if (c === '}') { stack.pop(); out += c; i++; continue; }
      if ((c === '^' || c === '_') && tex[i + 1] !== '{') {
        // a one-token script (^\frac12 · ^2): that token belongs to the script and is never promoted
        out += c; i++;
        const tok = /^\s*\\[dt]?frac(?![a-zA-Z])/.exec(tex.slice(i));
        if (tok) { out += tok[0]; i += tok[0].length; pending.push({ depth: stack.length, n: 2, kind: 'script' }); }
        else { const one = /^\s*(\\[a-zA-Z]+|\\.|.)/.exec(tex.slice(i)); if (one) { out += one[0]; i += one[0].length; } }
        continue;
      }
      if (!/\s/.test(c)) take(); // single-character argument (\frac12)
      out += c; i++;
    }
    return out;
  }

  function prepare(tex, options = {}) {
    let s = String(tex);
    if (options.bodyFrac !== false) s = bodyFrac(s);
    s = fixTeX(s);
    return scriptFrac(bracketStrut(s));
  }

  const failures = [];
  const escapeHTML = value => String(value).replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
  // The two canonical marks for tall formulas inside a text line (R5): the line opens around them, the
  // paragraph line-height stays one value.
  function mark(html, display) {
    if (display) return html;
    if (/class="mfrac"/.test(html)) return html.replace('class="katex"', 'class="katex 인라인분수"');
    if (/op-limits|op-symbol/.test(html)) return html.replace('class="katex"', 'class="katex 인라인큰연산"');
    return html;
  }
  function html(tex, options = {}) {
    const display = Boolean(options.display);
    if (!global.katex?.renderToString) throw Object.assign(Error('math_renderer_unavailable'), { code: 'math_renderer_unavailable' });
    try {
      const out = global.katex.renderToString(prepare(tex, options), {
        displayMode: display, throwOnError: true, trust: false, output: 'htmlAndMathml',
        strict: options.strict === undefined ? 'ignore' : options.strict, maxExpand: 1000
      });
      const marked = mark(out, display);
      return options.gap && !display ? marked.replace(/class="katex( |")/, (m, end) => 'class="katex wm23-gap' + end) : marked;
    } catch (error) {
      failures.push({ reason: String(error?.message || error).slice(0, 120) });
      if (typeof document !== 'undefined') document.documentElement.dataset.mathTexErrors = String(failures.length);
      if (options.throw) throw error;
      // Never a silent red source: a marked, readable fallback the page checks can count.
      return '<span class="tex-fail" data-tex-fail="">' + escapeHTML(tex) + '</span>';
    }
  }
  // 선지 폭(render_items.mjs 선지폭 · 렌더규격 §2-3): fraction = wider part · \ln-like = 2 · \sqrt = inside + 1.5.
  function choiceWidth(tex) {
    let s = String(tex).replace(/^\s*[①②③④⑤]\s*/, '');
    let guard = 0;
    while (/\\[dt]?frac\s*\{/.test(s) && guard++ < 20) {
      s = s.replace(/\\[dt]?frac\s*\{([^{}]*)\}\s*\{([^{}]*)\}/, (m, a, b) => {
        const w = x => choiceWidth(x); return 'W'.repeat(Math.ceil(Math.max(w(a), w(b))));
      });
      if (/\\[dt]?frac\s*\{[^{}]*\{/.test(s)) break;
    }
    s = s.replace(/\\sqrt\s*\{([^{}]*)\}/g, (m, a) => 'W'.repeat(Math.ceil(choiceWidth(a) + 1.5)));
    s = s.replace(/\\(?:ln|log|sin|cos|tan|lim|max|min|exp)(?![a-zA-Z])/g, 'WW');
    s = s.replace(/\\[a-zA-Z]+/g, 'W').replace(/[{}\s^_$]/g, '').replace(/\\./g, 'W');
    return s.length;
  }
  const choiceRow = list => { const w = Math.max(0, ...list.map(choiceWidth)); return w <= 3.2 ? 'ch5' : w <= 12 ? 'ch3' : 'ch2'; };

  function dollars(text, escape, options = {}) {
    const parts = String(text).split('$');
    return parts.map((part, i) => i % 2 ? html(part, { ...options, gap: /[^\s(\[{]$/.test(parts[i - 1] || '') && !/(?:^|[\s(])제$/.test(parts[i - 1] || '') && !/^\s*[,.;:)\]]/.test(part) }) : escape(part)).join('');
  }
  global.DSMathTypeset = Object.freeze({ dollars, prepare, fixTeX, scriptFrac, bracketStrut, bodyFrac, html, choiceWidth, choiceRow, failures: () => failures.slice() });
})(typeof window !== 'undefined' ? window : globalThis);
