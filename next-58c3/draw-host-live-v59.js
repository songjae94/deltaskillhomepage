/* v59 draw host for the member gate. Two switches: ENABLED (the gate) and POINTS (the v60 point board).
   The browser sends the member token only, as the site already does for its other
   member calls; the signature is made on the server. */
(() => {
  'use strict';
  const ENABLED = true;                          // the gate
  const POINTS = false;                          // v60 point board: off until the point functions are on the server
  const service = window.DSService;
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
    if (r.status === 401) window.DSAuth?.clear?.();          // the same as the site's own member calls
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
  window.DSDrawHostV59 = {
    ready: service.ready,
    signedIn: () => Boolean(service.session()),
    resync: () => window.dispatchEvent(new Event('ds-session-change')),
    menu: async signal => {
      const d = await call({ action: 'menu' }, signal);
      if (!exact(d, ['sets']) || !Array.isArray(d.sets) || d.sets.length > 500 ||
          !d.sets.every(r => exact(r, ['subject', 'unit', 'stage', 'difficulty', 'set_key']) && label(r.subject) && label(r.unit) && label(r.stage) && label(r.difficulty) && typeof r.set_key === 'string' && UUID.test(r.set_key)) ||
          new Set(d.sets.map(r => r.set_key)).size !== d.sets.length) throw fail(502, 'unavailable');
      return { sets: d.sets.map(r => ({ ...r, ready: true })) };   // no account tag: the device list stays off here
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
    } : {})
  };
})();
