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
  function units() {
    if (state.mode === 'book') {
      const picked=book();
      if(!deferAccess&&state.accessMode==='point'&&picked?.series==='쎈'){
        const approved=data().books?.find(b=>id(b)===id(picked));const all=new Map(picked.units.flatMap(u=>u.types.map(t=>[id(t),t])));
        return (approved?.units||[]).map(u=>({...u,types:u.types.map(t=>({...t,familyId:all.get(id(t))?.familyId||''}))}));
      }
      return picked?.units||[];
    }
    const common = data().subjects?.find(s => (s.subject || s.id) === state.subject);
    return common?.units || [...new Map(books().flatMap(b => b.units || []).map(u => [id(u),u])).values()];
  }
  const selectedUnits = () => units().filter(u => state.units.includes(id(u)));
  const types = () => [...new Map((state.units.length ? selectedUnits() : units()).flatMap(u => u.types || []).map(t => [id(t),t])).values()];
  const active = () => state.mode !== 'basic';
  const request = () => ({access_mode:state.accessMode,mode:state.mode, book_id:state.mode === 'book' ? state.book : null, subunit_ids:[...state.units], type_mode:state.typeMode, type_ids:state.typeMode === 'specific' ? [...state.types] : []});
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
    const count = Number.isInteger(availability?.available_count) ? availability.available_count : 0;
    const ready = availability?.extraction_ready === true && host?.scope?.version === 1 && count > 0;
    return {ready,count,verified:Boolean(availability && !availability.failed),reason:ready ? '' : checking ? '구성 가능한 문항을 확인하고 있습니다.' : !host?.signedIn() ? '로그인하면 선택한 범위의 문항을 확인할 수 있습니다.' : availability?.failed ? '선택한 범위의 문항 수를 확인하지 못했습니다.' : count > 0 ? '범위를 더 좁혀 구성해 주세요.' : '이 범위에서 지금 구성할 수 있는 문항이 없습니다. 다른 범위를 선택해 주세요.'};
  }
  function render({subject,stage,difficulty,count,host,pending,guest,deferAccess:defer=Boolean(window.DSStudentDownloads?.isPrintActive()),hasLegacySets=false}) {
    deferAccess = defer;
    if (state.subject !== subject) {
      state.subject = subject;
      state.book = '';
      if (state.mode === 'book') state.mode = 'random';
      state.units = [];
      state.types = [];
      state.typeMode = 'mixed';
      invalidate();
    }
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
  const unitLabels = ids => units().filter(u => ids.includes(id(u))).map(name);
  window.DSPrintScope={unitLabels,render,change,status,request,check,active,invalidate,restore,snapshot:()=>structuredClone(state)};
})();
