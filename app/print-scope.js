/* Public scope names describe choices. Only the member gate proves extraction availability. */
(() => {
  'use strict';
  const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const state = { mode:'random', book:'', units:[], typeMode:'mixed', types:[], subject:'', search:'',accessMode:'point' };
  let availability = null, checking = false, checkKey = '', guard = null,modeChosen=false;
  const data = () => window.DSPrintScopeData || {books:[]};
  const name = x => x.label || x.name || x.title || x.id;
  const id = x => String(x.id || x.key || '');
  const books = () => (window.DSWorkbookScope?.books || data().books || []).filter(b => !b.subject || b.subject === state.subject);
  const book = () => books().find(b => id(b) === state.book);
  function units() {
    if (state.mode === 'book') {
      const picked=book();
      if(state.accessMode==='point'&&picked?.series==='쎈'){
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
  function invalidate() { availability = null; checkKey = ''; guard?.abort(); checking = false; }
  async function check(host, context) {
    if (!active() || (state.mode === 'book' && !book()) || (state.typeMode === 'specific' && !state.types.length)) return;
    const criteria = {...request(),...context}, key = JSON.stringify(criteria);
    if (key === checkKey || !host?.scope?.menu || !host.signedIn()) return;
    guard?.abort(); guard = new AbortController(); const own = guard, timer = setTimeout(() => own.abort(),12000); checkKey = key; checking = true; availability = null;
    try { const d = await host.scope.menu(criteria,own.signal); if (guard === own) availability = d; }
    catch { if (guard === own) availability = {extraction_ready:false,available_count:0,failed:true}; }
    finally { clearTimeout(timer); if (guard === own) { checking = false; window.dispatchEvent(new Event('ds-print-scope-ready')); } }
  }
  function status(host) {
    if (!active()) return {ready:true,count:null,reason:''};
    if (state.mode === 'book' && !book()) return {ready:false,count:0,reason:'연계할 교재를 골라 주세요.'};
    if (state.typeMode === 'specific' && !state.types.length) return {ready:false,count:0,reason:'구성할 유형을 골라 주세요.'};
    const count = Number.isInteger(availability?.available_count) ? availability.available_count : 0;
    const ready = availability?.extraction_ready === true && host?.scope?.version === 1 && count > 0;
    return {ready,count,verified:Boolean(availability && !availability.failed),reason:ready ? '' : checking ? '구성 가능한 문항을 확인하고 있습니다.' : !host?.signedIn() ? '로그인하면 선택한 범위의 문항을 확인할 수 있습니다.' : availability?.failed ? '선택한 범위를 확인하지 못했습니다. 기본 구성에서 단원을 선택해 이용할 수 있습니다.' : count > 0 ? '범위를 더 좁혀 구성해 주세요.' : '이 범위에서 지금 구성할 수 있는 문항이 없습니다. 다른 범위를 선택해 주세요.'};
  }
  function render({subject,stage,difficulty,count,host,pending,guest}) {
    if(guest&&!modeChosen)state.mode='basic';
    if (state.subject !== subject) { state.subject=subject; state.book='';state.units=[];state.types=[];invalidate(); }
    check(host,{subject,stage,difficulty,count});
    const st=status(host), disabled=pending?' disabled':'';
    const modeButton=(value,text)=>`<button type="button" data-ps-mode="${value}" aria-pressed="${state.mode===value}"${disabled}>${text}</button>`;
    let html=`<section class="ps-scope" aria-label="프린트 범위"><div class="ps-mode">${modeButton('random','교재 없이 구성')}${modeButton('book','교재와 연계')}</div><button type="button" class="ps-basic" data-ps-mode="basic" aria-pressed="${state.mode==='basic'}"${disabled}>${guest ? '로그인 없이 맛보기 · 단원 선택' : '기본 구성 · 단원 선택'}</button>`;
    if (state.mode==='basic') return html+'<p class="ps-help">위에서 선택한 과목 · 단원 · 단계 · 난도에서 구성합니다.</p></section>';
    html+='<fieldset><legend>사용할 자료</legend><div class="ps-mode">'+[['point','포인트로 받을 문항'],['received','이미 받은 문항 · 추가 차감 없음']].map(([value,label])=>'<button type="button" data-ps-access="'+value+'" aria-pressed="'+(state.accessMode===value)+'"'+disabled+'>'+label+'</button>').join('')+'</div></fieldset>';
    if (state.mode==='book') {
      const options=books().filter(b=>id(b)===state.book||!state.search||name(b).toLowerCase().includes(state.search.toLowerCase()));
      html+=`<label>교재 찾기<input type="search" data-ps-search placeholder="교재명 검색" value="${esc(state.search)}"${disabled}></label>`;
      html+=`<label>연계 교재<select data-ps-book${disabled}><option value="">교재 선택</option>${options.map(b=>`<option value="${esc(id(b))}"${id(b)===state.book?' selected':''}>${esc(name(b))}</option>`).join('')}</select></label>`;
    } else html+='<p class="ps-help">현재 제공되는 선별범위 안에서 무작위로 구성합니다. 세부단원과 유형을 골라도 됩니다.</p>';
    if(state.mode==='book'&&book())html+=`<p class="ps-help">${esc(book().supply||'실제 연계가 확인된 선별범위만 제공합니다.')}</p>`;
    if (state.mode==='random'||book()) {
      html+=`<fieldset><legend>세부단원 <small>여러 개 선택 가능</small></legend><label class="ps-all"><input type="checkbox" data-ps-all${!state.units.length?' checked':''}${disabled}>전체 범위</label><div class="ps-picks">${units().map(u=>`<label><input type="checkbox" data-ps-unit="${esc(id(u))}"${state.units.includes(id(u))?' checked':''}${disabled}><span>${esc(name(u))}</span></label>`).join('')}</div></fieldset>`;
      html+=`<fieldset><legend>유형 구성</legend><div class="ps-mode">${['mixed','specific'].map(m=>`<button type="button" data-ps-types="${m}" aria-pressed="${state.typeMode===m}"${disabled}>${m==='mixed'?'유형 섞기':'특정 유형'}</button>`).join('')}</div>${state.typeMode==='specific'?`<div class="ps-picks">${types().map(t=>`<label><input type="checkbox" data-ps-type="${esc(id(t))}"${state.types.includes(id(t))?' checked':''}${disabled}><span>${esc(name(t))}</span></label>`).join('')}</div>`:'<p class="ps-help">선택한 범위 안에서 여러 유형을 함께 구성합니다.</p>'}</fieldset>`;
    }
    const selectedTypes=types().filter(t=>state.types.includes(id(t)));
    const families=new Set(selectedTypes.map(t=>t.familyId).filter(Boolean));
    const familyTypes=types().filter(t=>families.has(t.familyId));
    if(st.verified&&st.count<count&&state.typeMode==='specific'&&selectedTypes.length){
      html+='<fieldset class="ps-shortage"><legend>현재 범위 '+st.count+'문항 · 요청 '+count+'문항</legend><p>추가할 범위를 선택해 주세요.</p>';
      if(familyTypes.some(t=>!state.types.includes(id(t))))html+='<button type="button" data-ps-expand="family">관련 유형군으로 넓히기 · '+esc([...families].join(', '))+'</button> ';
      html+='<button type="button" data-ps-expand="unit">선택한 소단원의 모든 유형 보기</button></fieldset>';
    }
    if(!st.verified&&(book()?.series==='올림포스'||state.accessMode==='received'))html+='<p class="ps-help">교재 목차를 기준으로 표시합니다. 이용 가능한 문항 수는 계정에서 확인합니다.</p>';
    else if(!st.verified){const selected=state.units.length?selectedUnits():units();const localUpper=Math.min(book()?.local_verified_count||books().reduce((n,b)=>n+(b.local_verified_count||0),0),selected.reduce((n,u)=>n+(state.typeMode==='specific'?(u.types||[]).filter(t=>state.types.includes(id(t))).reduce((a,t)=>a+(t.local_verified_count||0),0):u.local_verified_count||0),0));html+=`<p class="ps-help">공개 선별범위 기준 최대 ${localUpper}문항 · 실제 이용 가능 수와 포인트는 로그인 후 서버에서 확인합니다.</p>`;if(localUpper<count)html+=`<details class="ps-shortage"><summary>선별범위 기준 최소 ${count-localUpper}문항 부족 · 범위 추가</summary><p>다른 세부단원을 추가하거나 유형을 섞어 주세요. 실제 가능 수는 로그인 후 확인합니다.</p></details>`;}
    if(active()) html+=`<p class="ps-availability" role="status">${st.ready?`현재 목록에 ${st.count}문항`:esc(st.reason)}</p>`;
    if(st.verified&&st.count!==null&&st.count<count) html+=`<details class="ps-shortage"><summary>문항이 ${count-st.count}개 부족해요 · 범위 추가</summary><p>세부단원을 더 선택하거나 유형을 섞으면 범위를 넓힐 수 있습니다. ${st.count > 0 ? `${st.count}문항으로도 구성할 수 있습니다.` : '다른 세부단원을 더 선택해 주세요.'}</p></details>`;
    return html+'</section>';
  }
  function filterBooks(target) {
    state.search=target.value; const select=target.closest('.ps-scope')?.querySelector('[data-ps-book]');
    if (!select) return;
    const options=books().filter(b=>id(b)===state.book || !state.search || name(b).toLowerCase().includes(state.search.toLowerCase()));
    select.innerHTML='<option value="">교재 선택</option>'+options.map(b=>`<option value="${esc(id(b))}"${id(b)===state.book?' selected':''}>${esc(name(b))}</option>`).join('');
  }
  function change(target) {
    if(target.hasAttribute('data-ps-access')){state.accessMode=target.dataset.psAccess==='received'?'received':'point';state.units=state.units.filter(key=>units().some(u=>id(u)===key));state.types=state.types.filter(key=>types().some(t=>id(t)===key));}
    else if(target.hasAttribute('data-ps-expand')){
      if(target.dataset.psExpand==='family'){
        const keys=new Set(types().filter(t=>state.types.includes(id(t))).map(t=>t.familyId).filter(Boolean));
        state.types=[...new Set([...state.types,...types().filter(t=>keys.has(t.familyId)).map(id)])];
      }else{
        if(!state.units.length)state.units=units().filter(u=>u.types?.some(t=>state.types.includes(id(t)))).map(id);
        state.typeMode='mixed';state.types=[];
      }
    }
    else if(target.hasAttribute('data-ps-mode')) {modeChosen=true;state.mode=target.dataset.psMode;state.units=[];state.types=[];state.typeMode='mixed';}
    else if(target.hasAttribute('data-ps-book')) {state.book=target.value;state.units=[];state.types=[];}
    else if(target.hasAttribute('data-ps-all')) {state.units=[];state.types=[];}
    else if(target.hasAttribute('data-ps-unit')) {const key=target.dataset.psUnit;state.units=target.checked?[...new Set([...state.units,key])]:state.units.filter(x=>x!==key);state.types=state.types.filter(x=>types().some(t=>id(t)===x));}
    else if(target.hasAttribute('data-ps-types')) state.typeMode=target.dataset.psTypes;
    else if(target.hasAttribute('data-ps-type')) {const key=target.dataset.psType;state.types=target.checked?[...new Set([...state.types,key])]:state.types.filter(x=>x!==key);}
    else if(target.hasAttribute('data-ps-search')) state.search=target.value;
    else return false;
    invalidate();return true;
  }
  const unitLabels = ids => units().filter(u => ids.includes(id(u))).map(name);
  window.DSPrintScope={unitLabels,render,change,filterBooks,status,request,check,active,invalidate,snapshot:()=>structuredClone(state)};
})();
