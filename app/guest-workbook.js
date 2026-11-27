// Read-only guest previews share the same registered question IDs as member study.
(() => {
  'use strict';
  const endpoint = 'https://cvlrphtupjmaefahodgz.supabase.co/functions/v1/guest-workbook';
  const catalogs = new Map();
  // Subject indexes contain only the public catalogue projection. The server
  // validates scope, current permissions and versions again on every actual draw.
  const menuFiles = {
    '공통수학2':'guest-menu-cm2-c3c568d79acb.json',
    '미적분Ⅰ':'guest-menu-cal1-097bd319b150.json'
  };
  const subjectMenus = new Map();
  let checkedRevision, indexCurrent = true;
  function verifyIndex() {
    if (checkedRevision) return;
    checkedRevision = request('revision', {}).then(({revision}) => {
      indexCurrent = revision === 'd9ff13ca561074be';
      if (!indexCurrent) { catalogs.clear(); subjectMenus.clear(); }
    }).catch(() => { checkedRevision = null; });
  }
  function loadSubject(subject, options) {
    if (subjectMenus.has(subject)) return subjectMenus.get(subject);
    const result = fetch('/app/public-data/'+menuFiles[subject], {priority:options?.priority}).then(async response => {
      if (!response.ok) throw Error('menu_unavailable');
      const {templates,items} = await response.json();
      return items.map(([id,version,index]) => ({...templates[index], id, version}));
    });
    subjectMenus.set(subject,result);
    result.catch(() => subjectMenus.delete(subject));
    return result;
  }
  function fromIndex(args, options) {
    // Paired unit and type scopes need the server's exact pair binding.
    if (!indexCurrent || !menuFiles[args.subject] || args.unitIds?.length && args.typeIds?.length) return request('catalog',args,false,options);
    verifyIndex();
    return loadSubject(args.subject,options).then(rows => ({questions:rows.filter(row =>
      (!args.bookId || row.bookId === args.bookId) &&
      (!args.stage || row.stage === String(args.stage)) &&
      (!args.difficulty || row.difficulty === args.difficulty) &&
      (!args.unitIds?.length || args.unitIds.some(id => row.unitIds.includes(id))) &&
      (!args.typeIds?.length || args.typeIds.some(id => row.typeIds.includes(id))))
    })).catch(() => request('catalog',args,false,options));
  }
  async function request(action, args, member = false, options) {
    const headers = {'Content-Type':'application/json'};
    if (member) {
      const token = window.DSAuth?.get?.();
      if (!token) throw Object.assign(Error('login_required'), {status:401, code:'login_required'});
      headers.Authorization = 'Bearer ' + token;
    }
    const response = await fetch(endpoint, {method:'POST', headers, credentials:'omit', priority:options?.priority,
      body:JSON.stringify({...args, action}), signal:AbortSignal.timeout(30000)});
    const result = await response.json();
    if (!response.ok) throw Object.assign(Error(result.error || 'service_unavailable'), {status:response.status, code:result.error});
    return result;
  }
  function catalog(args, options) {
    const key = JSON.stringify(args);
    const hit = catalogs.get(key);
    if (hit && Date.now() < hit.expires) return hit.result;
    const result = fromIndex(args,options);
    catalogs.set(key, {result, expires:Date.now()+180000});
    result.catch(() => { if (catalogs.get(key)?.result === result) catalogs.delete(key); });
    if (catalogs.size > 48) catalogs.delete(catalogs.keys().next().value);
    return result;
  }
  window.DSGuestWorkbook = {
    catalog, draw:(args,options) => request('draw',args,false,options), grade:args => request('grade',args,true),
    previewSolutions:args => request('previewSolutions',args),
    printQuote:args => request('printQuote',args,true), printConfirm:args => request('printConfirm',args,true)
  };
})();
