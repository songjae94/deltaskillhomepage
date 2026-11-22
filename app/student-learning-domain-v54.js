/* Learning state only. No inferred grades, dictionary codes, or synthetic questions. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.DSStudyDomainV54=api;})(typeof window!=='undefined'?window:this,()=>{
  'use strict';
  const empty=()=>({version:1,selectedUnit:'',attempts:[]});
  const trim=a=>{const active=a.filter(x=>!x.completedAt),finished=a.filter(x=>x.completedAt),keep=new Set([...active,...(active.length>=60?[]:finished.slice(-(60-active.length)))]);return a.filter(x=>keep.has(x));};
  const latest=a=>[...a].sort((x,y)=>y.updatedAt-x.updatedAt);
  function clean(raw,bank){
    const out=empty(),known=new Map(bank.map(q=>[q.id,q]));
    if(!raw||raw.version!==1)return out;
    out.selectedUnit=typeof raw.selectedUnit==='string'?raw.selectedUnit:'';
    out.attempts=trim((Array.isArray(raw.attempts)?raw.attempts:[]).filter(a=>a&&typeof a.id==='string'&&typeof a.unit==='string'&&Array.isArray(a.refs)&&a.refs.length>0&&a.refs.length<=10&&a.refs.every(r=>r&&typeof r.id==='string')&&new Set(a.refs.map(r=>r.id)).size===a.refs.length&&a.refs.every(r=>known.get(r.id)?.version===r.version&&known.get(r.id)?.unit===a.unit)&&Number.isInteger(a.cursor)&&a.cursor>=0&&a.cursor<a.refs.length&&Number.isFinite(a.startedAt)&&Number.isFinite(a.updatedAt)).map(a=>{
      const responses={};
      for(const r of a.refs){const v=a.responses?.[r.id],q=known.get(r.id);if(!v||!(v.choice===null||Number.isInteger(v.choice)&&v.choice>=0&&v.choice<5))continue;
        responses[r.id]={choice:v.choice,correct:v.choice!==null&&v.choice===q.answer,confidence:v.choice===null?'skipped':v.confidence==='unsure'?'unsure':'sure',seconds:Math.min(86400,Math.max(0,Number(v.seconds)||0)),help:Boolean(v.help)};
      }
      return {id:a.id,unit:a.unit,kind:a.kind==='review'?'review':'check',refs:a.refs.map(r=>({id:r.id,version:r.version})),cursor:a.cursor,responses,startedAt:a.startedAt,updatedAt:a.updatedAt,completedAt:Object.keys(responses).length===a.refs.length&&Number.isFinite(a.completedAt)?a.completedAt:null};
    }));return out;
  }
  function outcomes(state,unit){const map=new Map();for(const a of [...state.attempts].sort((x,y)=>x.updatedAt-y.updatedAt)){if(unit&&a.unit!==unit)continue;for(const [id,r]of Object.entries(a.responses))map.set(id,r);}return map;}
  function pending(state,unit){return latest(state.attempts.filter(a=>!a.completedAt&&(!unit||a.unit===unit)))[0]||null;}
  function plan(state,bank,unit){
    const active=pending(state,unit);if(active)return {kind:'resume',attempt:active,ids:active.refs.map(r=>r.id)};
    const pool=bank.filter(q=>q.unit===unit),seen=outcomes(state,unit);
    const weak=pool.filter(q=>{const r=seen.get(q.id);return r&&(!r.correct||r.confidence!=='sure'||r.help);});
    if(weak.length)return {kind:'review',ids:weak.slice(0,3).map(q=>q.id)};
    const unseen=pool.filter(q=>!seen.has(q.id));
    return {kind:seen.size?'next':'check',ids:(unseen.length?unseen:pool).slice(0,3).map(q=>q.id),repeated:!unseen.length&&seen.size>0};
  }
  function begin(state,bank,unit,now=Date.now()){
    const p=plan(state,bank,unit);if(p.attempt)return p.attempt;if(!p.ids.length||state.attempts.filter(a=>!a.completedAt).length>=60)return null;
    const known=new Map(bank.map(q=>[q.id,q]));const a={id:typeof crypto!=='undefined'&&crypto.randomUUID?crypto.randomUUID():'study-'+now+'-'+state.attempts.length,unit,kind:p.kind==='review'?'review':'check',refs:p.ids.map(id=>({id,version:known.get(id).version})),cursor:0,responses:{},startedAt:now,updatedAt:now,completedAt:null};state.attempts.push(a);state.attempts=trim(state.attempts);state.selectedUnit=unit;return a;
  }
  function answer(a,bank,choice,confidence,seconds,help,now=Date.now()){
    if(a.completedAt)throw Error('completed');const q=bank.find(q=>q.id===a.refs[a.cursor]?.id&&q.version===a.refs[a.cursor]?.version);if(!q)throw Error('missing_question');
    if(!(choice===null||Number.isInteger(choice)&&choice>=0&&choice<5))throw Error('invalid_answer');
    if(a.responses[q.id])return a.responses[q.id];
    const r={choice,correct:choice!==null&&choice===q.answer,confidence:choice===null?'skipped':confidence==='unsure'?'unsure':'sure',seconds:Math.max(0,Math.min(86400,Math.round(seconds)||0)),help:Boolean(help)};a.responses[q.id]=r;a.updatedAt=now;return r;
  }
  function next(a,now=Date.now()){if(a.completedAt)return false;if(!a.responses[a.refs[a.cursor].id])return false;a.updatedAt=now;if(a.cursor<a.refs.length-1)a.cursor++;else a.completedAt=now;return true;}
  function summary(a){const r=Object.values(a.responses);return {total:a.refs.length,answered:r.length,correct:r.filter(x=>x.correct).length,review:r.filter(x=>!x.correct||x.confidence!=='sure'||x.help).length,seconds:r.reduce((s,x)=>s+x.seconds,0)};}
  return {empty,clean,outcomes,pending,plan,begin,answer,next,summary};
});
