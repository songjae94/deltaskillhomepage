/* Account transport only; authentication remains in DSService. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.DSStudySyncV55=api;})(typeof window!=='undefined'?window:this,()=>{
  'use strict';
  const clone=x=>JSON.parse(JSON.stringify(x));
  function merge(remote,local){
    const attempts=new Map((remote.attempts||[]).map(a=>[a.id,clone(a)]));
    for(const a of local.attempts||[]){const old=attempts.get(a.id);
      if(!old){attempts.set(a.id,clone(a));continue;}
      if(JSON.stringify(old.refs)!==JSON.stringify(a.refs)||old.unit!==a.unit||old.completedAt)continue;
      attempts.set(a.id,{...clone(a),responses:{...a.responses,...old.responses},cursor:Math.max(old.cursor,a.cursor),startedAt:old.startedAt,updatedAt:Math.max(old.updatedAt,a.updatedAt),completedAt:a.completedAt||null});
    }
    const values=[...attempts.values()].sort((a,b)=>a.updatedAt-b.updatedAt),remoteIds=new Set((remote.attempts||[]).map(a=>a.id)),mustKeep=values.filter(a=>!a.completedAt||!remoteIds.has(a.id)),archived=values.filter(a=>a.completedAt&&remoteIds.has(a.id));
    if(mustKeep.length>60)throw Error('sync_capacity');
    const room=60-mustKeep.length;
    return {version:1,selectedUnit:local.selectedUnit||remote.selectedUnit||'',attempts:[...(room?archived.slice(-room):[]),...mustKeep].sort((a,b)=>a.updatedAt-b.updatedAt)};
  }
  function create({request,empty,clean,onChange=()=>{}}){
    let state=empty(),version=0,phase='loading',error='',updatedAt=null,epoch=0,dirty=false,pumping=false,loading=null;
    const emit=()=>onChange(snapshot());
    const snapshot=()=>({state:clone(state),phase,error,updatedAt,version,dirty});
    function reset(){epoch++;state=empty();version=0;phase='loading';error='';updatedAt=null;dirty=false;pumping=false;loading=null;emit();}
    async function load(force=false){
      if(loading)return loading;if(dirty)return flush();if(!force&&phase==='ready')return snapshot();
      const generation=epoch;phase='loading';error='';emit();
      loading=(async()=>{try{const r=await request('/student-learning');if(generation!==epoch)return;state=clean(r.state);version=r.version;updatedAt=r.updatedAt||null;phase='ready';emit();return snapshot();}catch(e){if(generation!==epoch)return;phase='error';error=e?.message||'connection_failed';emit();return snapshot();}finally{if(generation===epoch)loading=null;}})();return loading;
    }
    function set(next){if(phase==='loading')throw Error('loading');state=clean(next);dirty=true;error='';emit();void flush();return snapshot();}
    async function flush(){
      if(pumping||!dirty)return snapshot();const generation=epoch;pumping=true;let conflicts=0;
      try{while(dirty&&generation===epoch){phase='saving';error='';emit();const sent=clone(state),expectedVersion=version;
        try{const r=await request('/student-learning',{state:sent,expectedVersion});if(generation!==epoch)return;version=r.version;updatedAt=r.updatedAt||new Date().toISOString();
          const changed=JSON.stringify(state)!==JSON.stringify(sent);state=changed?clean(merge(r.state,state)):clean(r.state);dirty=changed;conflicts=0;
        }catch(e){if(generation!==epoch)return;if(e.status===409&&conflicts++<3){const latest=await request('/student-learning');if(generation!==epoch)return;version=latest.version;state=clean(merge(latest.state,state));dirty=true;continue;}throw e;}
      }if(generation===epoch){phase='ready';error='';emit();}
      }catch(e){if(generation===epoch){phase='error';error=e?.message||'connection_failed';emit();}}
      finally{if(generation===epoch)pumping=false;}return snapshot();
    }
    async function history(before){const generation=epoch;const result=await request('/student-learning?history=1&limit=50'+(before?'&before='+encodeURIComponent(before):''));if(generation!==epoch)throw Error('session_changed');return result;}
    return {snapshot,load,set,flush,reset,history};
  }
  return {merge,create};
});
