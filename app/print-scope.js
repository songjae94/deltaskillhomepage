/* Public scope names describe choices. Only the member gate proves extraction availability. */
(() => {
  'use strict';
  const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const state = { mode:'random', book:'', units:[], typeMode:'mixed', types:[], subject:'',accessMode:'point' };
  let availability = null, checking = false, checkKey = '', guard = null;
  let deferAccess = false;
  const data = () => window.DSPrintScopeData || {books:[]};
  const name = x => x.label || x.name || x.title || x.id;
  const id = x => String(x.id || x.key || '');
  const books = () => (window.DSWorkbookScope?.books || data().books || []).filter(b => !b.subject || b.subject === state.subject);
  const book = () => books().find(b => id(b) === state.book);
  const awaitingSupply = subject => data().subjects?.some(s => s.subject === subject && s.printSupply === 'pending');

  function units() {
    if (state.mode === 'book') {
      const picked=book();
      if(!deferAccess&&state.accessMode==='point'&&picked?.series==='쎈'){
        const approved=data().books?.find(b=>id(b)===id(picked));const all=new Map(picked.units.flatMap(u=>u.types.map(t=>[id(t),t])));
        return (approved?.units||[]).map(u=>({...u,types:u.types.map(t=>({...t,familyId:all.get(id(t))?.familyId||''}))}));
      }
      return picked?.units||[];
    }
    // 11/25 61(밤 점검 흠 14): 교재 없이 구성의 단원은 교재마다의 목차를 교과 단원 이름으로 묶는다(쎈 「04 도함수의 활용 (1)」 · 올림포스 「04 도함수의 활용」 → 「도함수의 활용」).
    //   묶은 단원은 서버에 교재마다의 원래 단원 id 를 다 보낸다(서버 거름 · 셈 그대로). 한 과목 안에서 한 id 가 두 이름에 걸리면 그 id 는 어느 묶음에도 넣지 않는다(엉뚱한 문항이 섞이지 않게 · 전체 범위로는 그대로 뽑힘).
    const grouped = commonUnits();
    if (grouped.length) return grouped;
    const common = data().subjects?.find(s => (s.subject || s.id) === state.subject);
    return common?.units || [];
  }
  const ALIAS = {'함수의 극한':'함수의 극한과 연속','함수의 연속':'함수의 극한과 연속','도함수의 활용 (1)':'도함수의 활용','도함수의 활용 (2)':'도함수의 활용','도함수의 활용 (3)':'도함수의 활용',
    '부정적분':'부정적분과 정적분','정적분':'부정적분과 정적분','집합의 뜻과 표현':'집합','집합의 연산':'집합','유리식과 유리함수':'유리함수와 무리함수','무리식과 무리함수':'유리함수와 무리함수'};
  const plainLabel = u => { const l = String(name(u)).replace(/^\d+\s+/,'').trim(); return ALIAS[l] || l; };
  let groupedKey = '', groupedUnits = [];
  function commonUnits() {
    const list = books();
    const key = state.subject + '|' + list.map(id).join(',');
    if (key === groupedKey) return groupedUnits;
    const groups = new Map(), owner = new Map(), clash = new Set();
    for (const b of list) for (const u of b.units || []) {
      const label = plainLabel(u), raw = id(u);
      if (!label || !raw) continue;
      if (owner.has(raw) && owner.get(raw) !== label) clash.add(raw); else owner.set(raw, label);
      if (!groups.has(label)) groups.set(label, {id:'u:'+label, label, ids:[], types:new Map()});
      const g = groups.get(label);
      if (!g.ids.includes(raw)) g.ids.push(raw);
      (u.types || []).forEach(t => g.types.set(id(t), t));
    }
    groupedUnits = [...groups.values()].map(g => ({id:g.id, label:g.label, ids:g.ids.filter(x => !clash.has(x)), types:[...g.types.values()]})).filter(g => g.ids.length);
    groupedKey = key;
    return groupedUnits;
  }
  // 고른 단원(묶음 id) → 서버에 보낼 원래 단원 id
  const rawUnits = keys => { const all = units(); return [...new Set(keys.flatMap(k => all.find(u => id(u) === k)?.ids || [k]))]; };
  const selectedUnits = () => units().filter(u => state.units.includes(id(u)));
  const types = () => [...new Map((state.units.length ? selectedUnits() : units()).flatMap(u => u.types || []).map(t => [id(t),t])).values()];
  const active = () => state.mode !== 'basic';
  const request = () => ({access_mode:state.accessMode,mode:state.mode, book_id:state.mode === 'book' ? state.book : null, subunit_ids:state.mode === 'random' ? rawUnits(state.units) : [...state.units], type_mode:state.typeMode, type_ids:state.typeMode === 'specific' ? [...state.types] : []});
  function invalidate() { availability = null; checkKey = ''; guard?.abort(); guard = null; checking = false; }
  async function check(host, context) {
    if (!active() || (state.mode === 'book' && !book()) || (state.typeMode === 'specific' && !state.types.length)) return;
    const criteria = {...request(),...context}, key = JSON.stringify(criteria);
    if (key === checkKey || !host?.scope?.menu || !host.signedIn()) return;
    guard?.abort(); guard = new AbortController(); const own = guard, timer = setTimeout(() => own.abort(),12000); checkKey = key; checking = true; availability = null;
    const abort = new Promise((_, reject) => own.signal.addEventListener('abort', () => reject(Error('scope_timeout')), {once:true}));
    try { const d = await Promise.race([host.scope.menu(criteria,own.signal), abort]); if (guard === own) availability = d; }
    catch { if (guard === own) availability = {extraction_ready:false,available_count:0,failed:true}; }
    finally { clearTimeout(timer); if (guard === own) { checking = false; window.dispatchEvent(new Event('ds-print-scope-ready')); } }
  }
  function status(host) {
    if (!active()) return {ready:true,count:null,reason:''};
    if (state.mode === 'book' && !book()) return {ready:false,count:0,reason:'연계할 교재를 골라 주세요.'};
    if (state.typeMode === 'specific' && !state.types.length) return {ready:false,count:0,reason:'구성할 유형을 골라 주세요.'};
    if (awaitingSupply(state.subject)) return {ready:false,count:0,reason:'이 과목의 프린트 문항을 준비하고 있습니다.'};
    const count = Number.isInteger(availability?.available_count) ? availability.available_count : 0;
    const ready = availability?.extraction_ready === true && host?.scope?.version === 1 && count > 0;
    return {ready,count,verified:Boolean(availability && !availability.failed),reason:ready ? '' : checking ? '구성 가능한 문항을 확인하고 있습니다.' : !host?.signedIn() ? '로그인하면 선택한 범위의 문항을 확인할 수 있습니다.' : availability?.failed ? '선택한 범위의 문항 수를 확인하지 못했습니다.' : count > 0 ? '범위를 더 좁혀 구성해 주세요.' : '이 범위에서 지금 구성할 수 있는 문항이 없습니다. 다른 범위를 선택해 주세요.'};
  }
  function render({subject,stage,difficulty,count,host,pending,guest,deferAccess:defer=Boolean(window.DSStudentDownloads?.isPrintActive()),hasLegacySets=false}) {
    deferAccess = defer;
    if (state.subject !== subject) {
      state.subject = subject;
      state.book = '';
      if (state.mode === 'book' || awaitingSupply(subject)) state.mode = 'random';
      state.units = [];
      state.types = [];
      state.typeMode = 'mixed';
      invalidate();
    }
    if (awaitingSupply(subject)) return '';
    if (!deferAccess) check(host,{subject,stage,difficulty,count});
    const disabled = pending ? ' disabled' : '';
    const basic = guest || hasLegacySets || state.mode === 'basic'
      ? `<option value="basic"${state.mode === 'basic' ? ' selected' : ''}>${guest ? '기본 맛보기 세트' : '기본 단원 세트'}</option>` : '';
    const choices = books().map(b =>
      `<option value="${esc(id(b))}"${state.mode === 'book' && id(b) === state.book ? ' selected' : ''}>${esc(name(b))}</option>`
    ).join('');
    let html = `<section class="ps-scope" aria-label="프린트 범위"><label>연계 교재 (선택)<select data-ps-source${disabled}><option value=""${state.mode === 'random' ? ' selected' : ''}>교재 없이 구성</option>${choices}${basic}</select></label>`;
    if (state.mode !== 'basic') {
      html+=`<fieldset><legend>세부단원 <small>여러 개 선택 가능</small></legend><label class="ps-all"><input type="checkbox" data-ps-all${!state.units.length?' checked':''}${disabled}>전체 범위</label><div class="ps-picks">${units().map(u=>`<label><input type="checkbox" data-ps-unit="${esc(id(u))}"${state.units.includes(id(u))?' checked':''}${disabled}><span>${esc(name(u))}</span></label>`).join('')}</div></fieldset>`;
      html+=`<fieldset><legend>유형 구성</legend><div class="ps-mode">${['mixed','specific'].map(m=>`<button type="button" data-ps-types="${m}" aria-pressed="${state.typeMode===m}"${disabled}>${m==='mixed'?'유형 섞기':'특정 유형'}</button>`).join('')}</div>${state.typeMode==='specific'?`<div class="ps-picks">${types().map(t=>`<label><input type="checkbox" data-ps-type="${esc(id(t))}"${state.types.includes(id(t))?' checked':''}${disabled}><span>${esc(name(t))}</span></label>`).join('')}</div>`:''}</fieldset>`;
    }
    if (!deferAccess && availability?.failed && active()) {
      html += '<p role="status">문항 수를 확인하지 못했습니다. <button type="button" data-ps-retry>다시 확인</button></p>';
    }
    return html+'</section>';
  }
  document.addEventListener('click', event => {
    if (!event.target.closest?.('.ps-scope [data-ps-retry]')) return;
    invalidate();
    window.dispatchEvent(new Event('ds-print-scope-ready'));
  });
  function change(target) {
    if (target.hasAttribute('data-ps-source')) {
      const value = target.value;
      if (value && value !== 'basic' && !books().some(b => id(b) === value)) return false;
      state.mode = value === 'basic' ? 'basic' : value ? 'book' : 'random';
      state.book = state.mode === 'book' ? value : '';
      state.units = [];
      state.types = [];
      state.typeMode = 'mixed';
    } else if (target.hasAttribute('data-ps-mode')) {
      // Programmatic reset on account change, or explicit access to the guest trial.
      state.mode = target.dataset.psMode;
      state.book = '';
      state.units = [];
      state.types = [];
      state.typeMode = 'mixed';
    }
    else if(target.hasAttribute('data-ps-all')) {state.units=[];state.types=[];}
    else if(target.hasAttribute('data-ps-unit')) {const key=target.dataset.psUnit;state.units=target.checked?[...new Set([...state.units,key])]:state.units.filter(x=>x!==key);state.types=state.types.filter(x=>types().some(t=>id(t)===x));}
    else if(target.hasAttribute('data-ps-types')) state.typeMode=target.dataset.psTypes;
    else if(target.hasAttribute('data-ps-type')) {const key=target.dataset.psType;state.types=target.checked?[...new Set([...state.types,key])]:state.types.filter(x=>x!==key);}
    else return false;
    invalidate();return true;
  }
  function restore(saved) {
    if (!saved || !['random','basic','book'].includes(saved.mode) || typeof saved.subject !== 'string') return;
    deferAccess = true;
    state.subject = saved.subject;
    state.mode = saved.mode;
    state.book = state.mode === 'book' && books().some(b=>id(b)===saved.book) ? saved.book : '';
    if (state.mode === 'book' && !state.book) state.mode = 'random';
    state.units = units().map(id).filter(key=>Array.isArray(saved.units) && saved.units.includes(key));
    state.typeMode = saved.typeMode === 'specific' ? 'specific' : 'mixed';
    state.types = types().map(id).filter(key=>Array.isArray(saved.types) && saved.types.includes(key));
    invalidate();
  }
  // 묶은 단원은 그 안의 원래 id 가 다 들어 있을 때만 이름을 낸다(고른 단원 · 빠진 단원 둘 다 같은 셈).
  const unitLabels = ids => units().filter(u => Array.isArray(u.ids) ? u.ids.every(x => ids.includes(x)) : ids.includes(id(u))).map(name);
  window.DSPrintScope={awaitingSupply,unitLabels,render,change,status,request,check,active,invalidate,restore,snapshot:()=>structuredClone(state)};
})();
