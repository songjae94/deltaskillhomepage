/* Revision-pinned screen-study relationships. Opening and grading still require student-services permission. */
(() => {
  'use strict';
  const lookup = new Map();
  function addGroup(rows, kind) {
    const questions = rows.map(([questionId, version, stage]) => ({questionId, id: questionId, version, stage, kind}));
    for (const question of questions) lookup.set(question.questionId, {question, questions});
  }

  // Existing authored pairs share the indicated calculation and change its inputs.
  const authoredFamilies = [
    ['c1', 's1'],       // Rational function value at a specified argument.
    ['t1', 's2'],       // Recover the argument from a rational function value.
    ['c3', 's6'],       // Domain endpoint from the sign of an affine radicand.
    ['c5', 's3'],       // Intersection of the two translated asymptotes.
    ['c6', 's4'],       // Equate a square root to a positive constant.
    ['t3', 's5', 'h2']  // Equate a square root to an affine expression and reject extraneous roots.
  ];
  const originals = new Set(authoredFamilies.flat().map(id => 'dssp1-' + id));
  const children = new Map();
  const originalByVariant = new Map();
  for (const q of window.DSStudentDeskPracticeBank || []) {
    const parent = q.originalQuestionId;
    if (q.originalVersion !== 'original-20261124-v1') continue;
    if (!children.has(parent)) children.set(parent, []);
    children.get(parent).push([q.id, q.version]);
    originalByVariant.set(q.id, parent);
    if (!originals.has(parent)) {
      authoredFamilies.push([parent.slice('dssp1-'.length)]);
      originals.add(parent);
    }
  }
  for (const ids of authoredFamilies) {
    const parents = ids.map(id => 'dssp1-' + id);
    const editions = [
      ...parents.map(id => [id, 'original-20261124-v1']),
      ...parents.flatMap(id => children.get(id) || [])
    ];
    addGroup(editions.map(([id, version], index) => [id, version, index]), 'original');
  }

  // Each entry shares the workbook, subject, origin track/unit/issue and original question number.
  // Include only study_free, render-stamped revisions. The third column is the actual variant stage.
  const idPattern = /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/;
  let registeredReady = false, registeredRequest = null;
  function needsRegistered(record) {
    return !registeredReady && Boolean(record && (record.correct === false || record.confidence === 'unsure' || record.help)
      && idPattern.test(record.questionId || record.id) && /^[a-f0-9]{64}$/.test(record.version));
  }
  function loadRegistered() {
    if (!registeredRequest) registeredRequest = fetch(new URL('public-data/review-groups-992d647b3946.json',document.baseURI))
      .then(async response => {
        if (!response.ok) throw Error('review_groups');
        const rows = await response.json();
        if (!Array.isArray(rows) || rows.length !== 297 || !rows.every(group => Array.isArray(group) && group.length > 1 &&
          group.every(row => Array.isArray(row) && row.length === 3 && idPattern.test(row[0]) && /^[a-f0-9]{64}$/.test(row[1]) && Number.isInteger(row[2])))) throw Error('review_groups');
        for (const group of rows) addGroup(group, 'registered');
        registeredReady = true;
      }).catch(error => { registeredRequest = null; throw error; });
    return registeredRequest;
  }

  function next(record, history = [], activeIds = []) {
    const source = lookup.get(record?.questionId || record?.id);
    if (!source || source.question.version !== record.version) return null;
    const lastAttempt = new Map();
    for (const attempt of history || []) {
      const target = lookup.get(attempt.questionId)?.question;
      if (!target || target.version !== attempt.version) continue;
      const time = typeof attempt.at === 'number' ? attempt.at : Date.parse(attempt.at);
      if (Number.isFinite(time)) lastAttempt.set(target.id, Math.max(lastAttempt.get(target.id) ?? 0, time));
    }
    const candidates = source.questions.filter(q => q.id !== source.question.id && q.stage !== source.question.stage);
    const active = new Set(activeIds);
    const origin = id => originalByVariant.get(id) || id;
    const rank = q => (active.size && !active.has(q.id) ? 2 : 0)
      + (q.kind === 'original' && origin(q.id) !== origin(source.question.id) ? 1 : 0);
    candidates.sort((a,b) => rank(a) - rank(b)
      || (lastAttempt.get(a.id) ?? -1) - (lastAttempt.get(b.id) ?? -1));
    return candidates.length ? {...candidates[0]} : null;
  }
  function button(record, history, activeIds) {
    if (!record || !(record.correct === false || record.confidence === 'unsure' || record.help)) return '';
    const q = next(record, history, activeIds);
    // Only trusted constant/catalogue identifiers are interpolated.
    return q ? `<button type="button" data-ssp-variant="${q.id}" data-ssp-version="${q.version}" data-ssp-kind="${q.kind}">비슷한 문제 풀기</button>` : '';
  }
  window.DSStudentReviewVariants = Object.freeze({next, button, needsRegistered, loadRegistered});
})();
