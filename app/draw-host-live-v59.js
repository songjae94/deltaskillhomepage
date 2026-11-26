/* v59 draw host for the member gate. Two switches: ENABLED (the gate) and POINTS (the v60 point board).
   The browser sends the member token only, as the site already does for its other
   member calls; the signature is made on the server. */
(() => {
  'use strict';
  const POINT_PRINT_SETS=new Set(["d209f5b5-3cc1-40eb-b246-52392410e326", "24d02d3a-7883-43b8-af3f-59c536cd9f28", "ca5bd920-3816-4ff7-849e-a8bdad7cb81f", "e65f29f6-85f4-4925-a8fa-8844c64b9a4d", "8a75a9b5-53fa-46de-b346-009fbb81869c", "93603a30-1cdc-46d9-a955-4c09e8aad1bf", "c3d53bc3-498a-4e7c-8ba6-7b14ba7d6601", "8dc2f11b-496d-40c8-a61b-eaa4431a6504"]);   // point plan r3 (f815ac69): 쎈 선별 2 + 올림포스 정답 대조 통과 6
  const ENABLED = true;                          // the gate
  const POINTS = true;                          // v60 point board: off until the point functions are on the server
  const TRIAL = true;                            // v61 guest trial (contract r4 · 판 A): on — the gate answers trial_menu · trial_draw · trial_open; switched off on the server = sign-in line
  const service = window.DSService;
  if (!service?.isLiveOrigin && ['localhost','127.0.0.1','[::1]'].includes(location.hostname) && !window.DSDrawHostV59) {
    // Public metadata preview only. Every extract request still requires the live origin and member gate.
    window.DSDrawHostV59 = { preview:true, ready:Promise.resolve(), signedIn:()=>false,
      menu:async()=>{ throw Object.assign(Error('preview'),{status:401}); } };
  }
  if (!ENABLED || !service?.isLiveOrigin || window.DSDrawHostV59) return;
  const GATE = '/item-draw-gate';                // one address, action in the body
  const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;
  const CODES = new Set(['unauthorized', 'forbidden', 'origin_rejected', 'not_found', 'invalid_request', 'rate_limited', 'unavailable', 'no_points', 'origin_limit']);
  const exact = (value, keys) => value && typeof value === 'object' && !Array.isArray(value) && Object.keys(value).sort().join() === [...keys].sort().join();
  const label = v => typeof v === 'string' && v.length >= 1 && v.length <= 60;
  const fail = (status, code) => Object.assign(Error('gate'), { status, code, lost: status === 401 });
  // The gate allows four calls at a time for one member; this tab stays at three.
  let inFlight = 0, retryAt = 0; const waiting = [];
  const slot = () => inFlight < 3 ? (inFlight++, Promise.resolve()) : new Promise(resolve => waiting.push(resolve));
  const done = () => { const next = waiting.shift(); if (next) next(); else inFlight--; };
  // One address on the member functions host; the member token only, no cookie, nothing stored.
  const EDGE = 'https://cvlrphtupjmaefahodgz.supabase.co/functions/v1';
  const REFUSALS = new Set(['no_points', 'origin_limit']);
  async function send(body, signal) {
    const token = window.DSAuth?.get?.();
    if (!token) throw fail(401, 'unauthorized');
    let r, d = null;
    try {
      r = await fetch(EDGE + GATE, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token }, credentials: 'omit', cache: 'no-store', body: JSON.stringify(body), signal });
      d = await r.json().catch(() => null);
    } catch { throw fail(signal?.aborted ? 0 : 502, signal?.aborted ? 'aborted' : 'unavailable'); }
    // A reply that belongs to an earlier sign-in is dropped before it is used or clears anything.
    if ((window.DSAuth?.get?.() || '') !== token) throw fail(502, 'unavailable');
    if (r.ok && d && typeof d === 'object' && d.ok !== false) return d;
    // H32(관문 86): one 401 no longer signs the member out — the token is asked once more on a path outside the
    // auth_verify rate bucket (DSAuth.clearIfLost) and cleared only when it is really gone (missing · expired · revoked).
    if (r.status === 401) {
      const gone = typeof window.DSAuth?.clearIfLost === 'function' ? await window.DSAuth.clearIfLost(token) : (window.DSAuth?.clear?.(), true);
      if (!gone) { retryAt = Date.now() + 60000; throw Object.assign(fail(429, 'rate_limited'), { data: null }); }
    }
    const name = d && typeof d.error === 'string' ? d.error : '';
    const error = fail(r.status || 502, CODES.has(name) || REFUSALS.has(name) ? name : 'unavailable');
    if (r.status === 429) retryAt = Date.now() + 60000;      // the gate's stated wait
    throw Object.assign(error, { data: d && typeof d === 'object' && !Array.isArray(d) ? d : null });
  }
  async function call(body, signal) {
    if (!service.session()) throw fail(401, 'unauthorized');
    if (Date.now() < retryAt) throw fail(429, 'rate_limited');      // asked to wait: no new call until then
    await slot();
    try {
      if (signal?.aborted) throw fail(0, 'aborted');
      if (Date.now() < retryAt) throw fail(429, 'rate_limited');
      return await send(body, signal);
    } catch (error) {
      if (error?.code) throw error;
      // The contract's fixed names are kept; the screen decides the wording.
      const status = error?.status || 502, code = CODES.has(error?.message) ? error.message : 'unavailable';
      if (status === 429) retryAt = Date.now() + 60000;             // the gate's stated wait
      // v60: the body of a refusal goes along when the site's request helper hands it over (the point
      // board reads what is left from it; without it the board reads the balance again).
      throw Object.assign(fail(status, code), { data: error?.data ?? error?.body ?? null });
    } finally { done(); }
  }
  // v61 guest trial (contract r2 · 맛보기_r2_s1/읽어라.md 2절). The three guest calls carry no Authorization header
  // (with one the gate takes the member path); the reply is checked to the contract and only the named fields go
  // on to the screen. A guest never reaches open / solution: without a token the gate answers 401 there.
  const TRIAL_CODES = new Set(['forbidden', 'not_found', 'invalid_request', 'rate_limited', 'unavailable', 'trial_limit', 'origin_rejected']);
  const count = (v, lo, hi) => Number.isInteger(v) && v >= lo && v <= hi;
  const when = v => typeof v === 'string' && v.length <= 40 && !Number.isNaN(Date.parse(v));
  const CELL = /^[A-Za-z0-9_-]{8,80}$/;            // a set key, or an opaque key for sets drawn together
  const refusal = d => {
    if (!d || typeof d !== 'object' || Array.isArray(d)) return null;
    const out = {};
    if (['address', 'all'].includes(d.scope)) out.scope = d.scope;
    if (count(d.left, 0, 1000)) out.left = d.left;
    if (when(d.resets_at)) out.resets_at = d.resets_at;
    if (count(d.retry_after, 0, 86400)) out.retry_after = d.retry_after;
    return out;
  };
  let guestRetryAt = 0;
  async function guest(body, signal) {
    await slot();
    try {
      if (signal?.aborted) throw fail(0, 'aborted');
      const remaining = Math.ceil((guestRetryAt - Date.now()) / 1000);
      if (remaining > 0) throw Object.assign(fail(429,'rate_limited'), {data:{retry_after:remaining}});
      let r, d = null;
      try {
        r = await fetch(EDGE + GATE, { method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'omit', cache: 'no-store', body: JSON.stringify(body), signal });
        d = await r.json().catch(() => null);
      } catch { throw fail(signal?.aborted ? 0 : 502, signal?.aborted ? 'aborted' : 'unavailable'); }
      if (r.ok && d && typeof d === 'object' && !Array.isArray(d) && d.ok !== false) return d;
      const name = d && typeof d.error === 'string' ? d.error : '';
      const data = refusal(d) || {};
      if (r.status === 429) {
        const raw = r.headers.get('Retry-After');
        const seconds = raw && (/^\d+$/.test(raw) ? Number(raw) : Math.ceil((Date.parse(raw) - Date.now()) / 1000));
        if (Number.isFinite(seconds)) data.retry_after = Math.max(data.retry_after || 0, seconds);
        if (name === 'rate_limited') guestRetryAt = Math.max(guestRetryAt, Date.now() + (data.retry_after || 60) * 1000);
      }
      throw Object.assign(fail(r.status || 502, TRIAL_CODES.has(name) ? name : 'unavailable'), { lost: false, data });
    } finally { done(); }
  }
  const trial = {
    study: async (cell_key, page) => {
      const d = await guest({action: 'trial_study', cell_key, page});
      if (exact(d, ['done']) && d.done === true) return d;
      if (!exact(d, ['item_id', 'question_html', 'left', 'next']) || !UUID.test(d.item_id) ||
          typeof d.question_html !== 'string' || !count(d.left, 0, 10000) ||
          !(d.next === null || count(d.next, page + 1, 20))) throw fail(502, 'unavailable');
      return d;
    },
    menu: async signal => {
      const d = await guest({ action: 'trial_menu' }, signal);
      const lim = d.limits;
      if (!exact(d, ['cells', 'limits']) || !Array.isArray(d.cells) || d.cells.length > 500 || !exact(lim, ['daily_items', 'max_items']) ||
          !count(lim.daily_items, 1, 1000) || !count(lim.max_items, 1, 50) ||
          !d.cells.every(r => exact(r, ['subject', 'unit', 'stage', 'difficulty', 'cell_key', 'size']) && label(r.subject) && label(r.unit) && label(r.stage) && label(r.difficulty) && typeof r.cell_key === 'string' && CELL.test(r.cell_key) && count(r.size, 1, 50)) ||
          new Set(d.cells.map(r => r.cell_key)).size !== d.cells.length) throw fail(502, 'unavailable');
      return { cells: d.cells.map(r => ({ subject: r.subject, unit: r.unit, stage: r.stage, difficulty: r.difficulty, cell_key: r.cell_key, size: r.size, ready: true })),
        limits: { daily_items: lim.daily_items, max_items: lim.max_items } };
    },
    // left = questions this address may still take today without signing in.
    draw: async (cell_key, want, signal) => {
      const d = await guest({ action: 'trial_draw', cell_key, count: want }, signal);
      const items = Array.isArray(d.items) ? d.items : null;
      if (!exact(d, ['status', 'items', 'ticket', 'left', 'resets_at']) || !items || items.length === 0 || items.length > want ||
          !items.every(x => exact(x, ['item_id']) && typeof x.item_id === 'string' && UUID.test(x.item_id)) ||
          new Set(items.map(x => x.item_id)).size !== items.length || d.status !== (items.length === want ? 'ok' : 'insufficient') ||
          typeof d.ticket !== 'string' || !/^[A-Za-z0-9._~-]{8,400}$/.test(d.ticket) || !count(d.left, 0, 1000) || !when(d.resets_at)) throw fail(502, 'unavailable');
      return { status: d.status, items: items.map(x => ({ item_id: x.item_id })), ticket: d.ticket, left: d.left, resets_at: d.resets_at };
    },
    open: async (cell_key, item_id, ticket, signal) => {
      const d = await guest({ action: 'trial_open', cell_key, item_id, ticket }, signal);
      if (!exact(d, ['item_id', 'question_html']) || d.item_id !== item_id || typeof d.question_html !== 'string') throw fail(502, 'unavailable');
      return { item_id: d.item_id, question_html: d.question_html };
    },
    // Signed in: take the questions the guest saw into the member's record (the point board's sets only).
    // Each question comes back with the set it belongs to; open and solution use that set.
    claim: async (cell_key, want, signal) => {
      const d = await call({ action: 'trial_claim', cell_key, count: want }, signal);
      if (!exact(d, ['status', 'items', 'draws', 'points']) || !Array.isArray(d.items) || d.items.length === 0 || d.items.length > want ||
          !d.items.every(x => exact(x, ['item_id', 'set_key']) && typeof x.item_id === 'string' && UUID.test(x.item_id) && typeof x.set_key === 'string' && UUID.test(x.set_key)) ||
          new Set(d.items.map(x => x.item_id)).size !== d.items.length || d.status !== (d.items.length === want ? 'ok' : 'insufficient') ||
          !Array.isArray(d.draws) || d.draws.length > 20 || !d.draws.every(x => x && typeof x === 'object' && typeof x.set_key === 'string' && UUID.test(x.set_key) && (x.draw_id === null || (typeof x.draw_id === 'string' && UUID.test(x.draw_id))) && count(x.next_page, 0, 9999))) throw fail(502, 'unavailable');
      return { status: d.status, items: d.items.map(x => ({ item_id: x.item_id, set_key: x.set_key })), draws: d.draws.map(x => ({ set_key: x.set_key, next_page: x.next_page })) };
    }
  };
  async function pointWallet(signal) {
    const w = await call({action:'points'},signal);
    if (!Number.isSafeInteger(w?.free?.remaining) || w.free.remaining < 0 ||
        !Number.isSafeInteger(w?.price?.pdf_per_item) || w.price.pdf_per_item < 0) throw fail(502,'unavailable');
    return {pointRemaining:w.free.remaining,pointPrice:w.price.pdf_per_item};
  }
  window.DSDrawHostV59 = {
    pointWallet,
    ready: service.ready,
    signedIn: () => Boolean(service.session()),
    resync: () => window.dispatchEvent(new Event('ds-session-change')),
    menu: async signal => {
      const d = await call({ action: 'menu' }, signal);
      if (!exact(d, ['sets']) || !Array.isArray(d.sets) || d.sets.length > 500 ||
          !d.sets.every(r => exact(r, ['subject', 'unit', 'stage', 'difficulty', 'set_key']) && label(r.subject) && label(r.unit) && label(r.stage) && label(r.difficulty) && typeof r.set_key === 'string' && UUID.test(r.set_key)) ||
          new Set(d.sets.map(r => r.set_key)).size !== d.sets.length) throw fail(502, 'unavailable');
      let wallet=null;
      if(d.sets.some(r=>POINT_PRINT_SETS.has(r.set_key)))try{
        wallet=await pointWallet(signal);
      }catch{}
      return { sets: d.sets.filter(r=>!POINT_PRINT_SETS.has(r.set_key)||wallet).map(r => ({ ...r, ready: true, ...(POINT_PRINT_SETS.has(r.set_key)?{pointPrint:true,...wallet}: {}) })) };   // no account tag: the device list stays off here
    },
    // Scope requests use only names and opaque public IDs; the gate owns candidate selection.
    scope: {
      version: 1,
      menu: async (criteria, signal) => {
        const scope = { subject: criteria.subject, stage: criteria.stage, difficulty: criteria.difficulty, textbook: criteria.book_id || undefined, subunits: criteria.subunit_ids || [], types: criteria.type_ids || [], typeMode: criteria.type_mode, sourceMode: criteria.mode === 'book' ? 'textbook' : 'random' };
        const d = await call({ action:criteria.access_mode==='received'?'received_scope_menu':'scope_menu',scope,count:criteria.count },signal);
        if (!d || d.version !== 1 || d.count_basis !== 'catalog' || typeof d.extraction_ready !== 'boolean' || !count(d.available_count,0,100000) || d.requested !== criteria.count || !count(d.shortage,0,20) || d.shortage !== Math.max(0,criteria.count-d.available_count)) throw fail(502,'unavailable');
        return d;
      },
      draw: async (criteria, signal) => {
        const scope = { subject: criteria.subject, stage: criteria.stage, difficulty: criteria.difficulty,
          textbook: criteria.book_id || undefined, subunits: criteria.subunit_ids || [], types: criteria.type_ids || [],
          typeMode: criteria.type_mode, sourceMode: criteria.mode === 'book' ? 'textbook' : 'random' };
        const d = await call({ action: criteria.access_mode==='received'?'received_scope_draw':'scope_draw', scope, count: criteria.count, request_id: criteria.request_id }, signal);
        if (!d || (d.coverage_limited !== undefined && typeof d.coverage_limited !== 'boolean') || (d.unrepresented_subunits !== undefined && (!Array.isArray(d.unrepresented_subunits) || d.unrepresented_subunits.length > 50 || !d.unrepresented_subunits.every(x => typeof x === 'string' && x.length > 0 && x.length <= 100))) || d.requested !== criteria.count || !count(d.available_count,0,100000) || !count(d.shortage,0,20) || !Array.isArray(d.items) || d.shortage !== criteria.count - d.items.length || d.items.length > criteria.count ||
            !d.items.every(x => x && UUID.test(x.item_id) && UUID.test(x.set_key) && x.pg && count(x.pg.page,0,9999) && count(x.pg.count,1,20)) ||
            new Set(d.items.map(x => x.item_id)).size !== d.items.length ||
            d.status !== (d.items.length === 0 ? 'empty' : d.items.length === criteria.count ? 'ok' : 'insufficient')) throw fail(502,'unavailable');
        return { ...d, items: d.items.map(x => ({ item_id:x.item_id, set_key:x.set_key, paging:{page:x.pg.page,count:x.pg.count} })) };
      }
    },
    // pg is {} for the plain five, or { page, count } — the same values go with open and solution.
    draw: async (set_key, pg, signal) => {
      const d = await call({ action: 'draw', set_key, ...pg }, signal);
      const want = pg?.count ?? 5;
      // v60: a member set answers with the id of the set and what the draw took; draw-link-v60.js reads them.
      if (!(exact(d, ['status', 'items']) || exact(d, ['status', 'items', 'draw_id', 'points']) || exact(d, ['status', 'items', 'draw_id', 'next_page', 'points'])) || !Array.isArray(d.items) || d.items.length > want ||
          !d.items.every(x => exact(x, ['item_id']) && typeof x.item_id === 'string' && UUID.test(x.item_id)) ||
          new Set(d.items.map(x => x.item_id)).size !== d.items.length ||
          d.status !== (d.items.length === 0 ? 'empty' : d.items.length === want ? 'ok' : 'insufficient')) throw fail(502, 'unavailable');
      return d;
    },
    open: async (set_key, item_id, pg, signal) => {
      const d = await call({ action: 'open', set_key, item_id, ...pg }, signal);
      if (!exact(d, ['item_id', 'question_html']) || d.item_id !== item_id || typeof d.question_html !== 'string') throw fail(502, 'unavailable');
      return d;
    },
    // Asked only when the answer pages of a print are switched on.
    solution: async (set_key, item_id, pg, signal) => {
      const d = await call({ action: 'solution', set_key, item_id, ...pg }, signal);
      if (!exact(d, ['item_id', 'answer', 'solution_html']) || d.item_id !== item_id || typeof d.answer !== 'string' || typeof d.solution_html !== 'string') throw fail(502, 'unavailable');
      return d;
    },
    // v60 point board. These three only carry; draw-link-v60.js checks and reads what comes back.
    ...(POINTS ? {
      points: signal => call({ action: 'points' }, signal),
      library: (query, signal) => call({ action: 'history', ...query }, signal),
      reopen: (id, signal) => call({ action: 'reopen', draw_id: id }, signal)
    } : {}),
    ...(TRIAL ? { trial } : {})
  };
})();
