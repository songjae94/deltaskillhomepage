(() => {
  'use strict';
  const courses = ['concept', 'types', 'supplement', 'advanced'];
  const keyFor = owner => 'ds.student-study-plan.v1.' + owner;
  let sessionEpoch = 0;
  window.addEventListener('ds-session-change', () => { sessionEpoch++; });

  function normalize(value) {
    const grade = v => typeof v === 'string' && /^[1-9]$/.test(v);
    if (!value || !grade(value.goal) || !courses.includes(value.need) ||
        !Number.isSafeInteger(value.updatedAt) || value.updatedAt < 1) return null;
    if (Object.hasOwn(value, 'subject') || Object.hasOwn(value, 'unit')) {
      const {goal, need, subject, updatedAt} = value;
      const unit = typeof value.unit === 'string' ? value.unit.trim() : '';
      if (!['공통수학2','미적분Ⅰ','기하','확률과 통계'].includes(subject) || !unit || unit.length > 110) return null;
      return {goal, need, subject, unit, updatedAt};
    }
    if (!(grade(value.previous) || value.previous === 'unknown') ||
        !['recommended', 'custom'].includes(value.mode) || !Array.isArray(value.order) ||
        value.order.length !== courses.length || new Set(value.order).size !== courses.length ||
        !value.order.every(c => courses.includes(c))) return null;
    const {goal, previous, need, order, mode, updatedAt} = value;
    return {goal, previous, need, order: order.slice(), mode, updatedAt};
  }

  function checkOwner(owner, epoch, responseOwner = owner) {
    if (epoch !== sessionEpoch || !/^[a-f0-9]{64}$/.test(owner) ||
        responseOwner !== owner || window.DSService?.session?.() === false) {
      throw Object.assign(new Error('owner_changed'), {code: 'owner_changed'});
    }
  }

  function readCache(owner) {
    try {
      const cached = JSON.parse(window.localStorage.getItem(keyFor(owner)));
      const profile = normalize(cached?.profile);
      return profile ? {profile, pending: cached.pending === true} : null;
    } catch { return null; }
  }

  function cache(owner, profile, pending) {
    try {
      window.localStorage.setItem(keyFor(owner), JSON.stringify({profile, pending}));
      return true;
    } catch { return false; }
  }

  function checkFailure(error, owner, epoch) {
    checkOwner(owner, epoch);
    if (error?.status === 401 || ['owner_changed', 'session_changed', 'unauthorized', 'no_member'].includes(error?.code)) {
      throw error;
    }
  }

  async function remote(owner, epoch) {
    const progress = await window.DSStudentServices.getProgress();
    checkOwner(owner, epoch, progress.ownerKey);
    return progress;
  }

  async function persist(owner, profile, epoch, latest) {
    for (let attempt = 0; attempt < 3; attempt++) {
      checkOwner(owner, epoch, latest.ownerKey);
      const saved = normalize(latest.state.studyPlan);
      if (saved && JSON.stringify(saved) === JSON.stringify(profile)) return true;
      try {
        const progress = await window.DSStudentServices.saveProgress(
          {...latest.state, studyPlan: profile}, {expectedVersion: latest.version});
        checkOwner(owner, epoch, progress.ownerKey);
        const verified = await remote(owner, epoch);
        return JSON.stringify(normalize(verified.state.studyPlan)) === JSON.stringify(profile);
      } catch (error) {
        checkFailure(error, owner, epoch);
        if (error?.code !== 'version_conflict') throw error;
        latest = error.state && Number.isSafeInteger(error.version) && error.ownerKey
          ? error : await remote(owner, epoch);
      }
    }
    return false;
  }

  async function save(owner, value) {
    const epoch = sessionEpoch;
    checkOwner(owner, epoch);
    const profile = normalize(value);
    if (!profile) throw new Error('bad_study_plan');
    let synced = false;
    try {
      synced = await persist(owner, profile, epoch, await remote(owner, epoch));
    } catch (error) { checkFailure(error, owner, epoch); }
    checkOwner(owner, epoch);
    const onDevice = cache(owner, profile, !synced);
    if (!synced && !onDevice) throw new Error('study_plan_not_saved');
    return {storage: synced ? 'account' : 'device'};
  }

  async function load(owner) {
    const epoch = sessionEpoch;
    checkOwner(owner, epoch);
    const local = readCache(owner);
    try {
      const latest = await remote(owner, epoch);
      const profile = normalize(latest.state.studyPlan);
      if (profile && !(local?.pending && local.profile.updatedAt > profile.updatedAt)) {
        cache(owner, profile, false);
        return profile;
      }
      if (local?.pending && await persist(owner, local.profile, epoch, latest)) {
        checkOwner(owner, epoch);
        cache(owner, local.profile, false);
      }
    } catch (error) {
      checkFailure(error, owner, epoch);
      if (!local) throw error;
    }
    checkOwner(owner, epoch);
    return local?.profile || null;
  }

  // Unreleased ranges stay in this tab and never replace the member's active study plan.
  function waitingRange(owner, update) {
    if (!/^[a-f0-9]{64}$/.test(owner)) return null;
    const key = keyFor(owner) + '.waiting';
    try {
      if (update === null) sessionStorage.removeItem(key);
      else if (update) {
        const profile = normalize(update);
        if (profile) sessionStorage.setItem(key, JSON.stringify(profile));
      }
      return normalize(JSON.parse(sessionStorage.getItem(key)));
    } catch { return null; }
  }

  window.DSStudyPlanStore = Object.freeze({load, save, waitingRange});
})();
