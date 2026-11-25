'use strict';
(() => {
 const ORIGIN='https://www.deltaskill.co.kr';
 const EDGE='https://cvlrphtupjmaefahodgz.supabase.co/functions/v1';
 const isLiveOrigin=location.origin===ORIGIN;
 const memberPreview=window.DSRuntime?.mode==='member-preview'&&location.hostname==='127.0.0.1';
 const auth=window.DSAuth;
 let signedIn=false,csrf='',legacyPassword=false,authEpoch=0;
 const accountLinks=mode=>ORIGIN+'/auth/?'+(mode?'mode='+encodeURIComponent(mode)+'&':'')+'next=%2Fmy%2F';
 function session(){return memberPreview?signedIn:isLiveOrigin&&Boolean(auth?.get())}
 async function local(path,body){
  const generation=authEpoch;
  const r=await fetch('/__ds'+path,{method:body?'POST':'GET',headers:body?{'Content-Type':'application/json','X-DS-CSRF':csrf}:{},credentials:'same-origin',cache:'no-store',body:body?JSON.stringify(body):undefined});
  const d=await r.json().catch(()=>null);
  if(generation!==authEpoch)throw new Error('session_changed');
  if(r.status===401){signedIn=false;window.dispatchEvent(new Event('ds-session-change'))}
  if(!r.ok||!d||d.ok===false)throw Object.assign(new Error(d?.error||'server'),{status:r.status});
  if(d.csrf)csrf=d.csrf;
  return d;
 }
 async function refresh(){
  const generation=authEpoch;
  if(memberPreview){try{const d=await local('/session');signedIn=d.signedIn;legacyPassword=d.legacyPassword}catch{if(generation===authEpoch)signedIn=false}}
  if(generation!==authEpoch)return;
  window.dispatchEvent(new Event('ds-session-ready'));
 }
 const ready=memberPreview?refresh():Promise.resolve();
 async function request(path,body,needsAuth=true){
  const generation=authEpoch;
  if(memberPreview){await ready;if(path.startsWith('/student-learning'))return local('/study',body===undefined?{action:'load',query:path.split('?')[1]||''}:body);return local('/request',{path,...(body===undefined?{}:{body})})}
  if(!isLiveOrigin)throw new Error('preview_origin');
  const headers={'Content-Type':'application/json'};
  const token=needsAuth?auth?.get():null;
  if(needsAuth){if(!token)throw new Error('unauthorized');headers.Authorization='Bearer '+token}
  const r=await fetch(EDGE+path,{method:body?'POST':'GET',headers,credentials:'omit',body:body?JSON.stringify(body):undefined});
  const d=await r.json().catch(()=>null);
  if(generation!==authEpoch)throw new Error('session_changed');
  if(r.status===401&&needsAuth){
   // H32(관문 86): 401 하나로 지우지 않음 — 한도 밖 길로 한 번 더 묻고 잃었을 때만 지움.
   const gone=typeof auth?.clearIfLost==='function'?await auth.clearIfLost(token):(auth?.clear(),true);
   if(!gone&&d?.error==='unauthorized')throw Object.assign(new Error('too_many'),{status:429});
  }
  if(!r.ok||!d||d.ok===false)throw Object.assign(new Error(d?.error||'server'),{status:r.status});
  return d;
 }
 async function login(phone,pin){
  await ready;
  const generation=++authEpoch;
  if(memberPreview){const d=await local('/login',{phone,pin});signedIn=true;legacyPassword=Boolean(d.legacyPassword);window.dispatchEvent(new Event('ds-session-change'));return {legacyPassword}}
  const data=await request('/api/login',{phone,pin,device:navigator.platform||''},false);
  if(generation!==authEpoch)throw new Error('session_changed');
  if(typeof data.token!=='string'||!data.token)throw new Error('server');
  auth.set(data.token,phone);
  legacyPassword=!(/^[\x21-\x7e]{8,64}$/.test(pin)&&/[A-Za-z]/.test(pin)&&/\d/.test(pin));
  try{localStorage.removeItem('ds_pin_short');if(legacyPassword)localStorage.setItem('ds_pw_old','1');else localStorage.removeItem('ds_pw_old')}catch{}
  window.dispatchEvent(new Event('ds-session-change'));return {legacyPassword};
 }
 async function logout(){
  const generation=++authEpoch;
  signedIn=false;window.dispatchEvent(new Event('ds-session-change'));
  if(memberPreview){await ready;try{await local('/logout',{})}finally{if(generation===authEpoch){signedIn=false;csrf='';legacyPassword=false;await refresh()}}return}
  const token=auth?.get();auth?.forget();auth?.clear();window.dispatchEvent(new Event('ds-session-change'));
  try{localStorage.setItem('ds_logout_epoch',String(Date.now()))}catch{}
  if(token&&isLiveOrigin)await fetch(EDGE+'/api/logout',{method:'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer '+token},body:'{}',credentials:'omit'}).catch(()=>{});
 }
 function masked(phone){return String(phone||'').replace(/^(\d{3})\d{3,4}(\d{4})$/,'$1-****-$2')}
 function errorText(error){return ({preview_origin:'로그인 연결을 확인해 주세요.',unauthorized:'로그인이 만료되었습니다. 다시 로그인해 주세요.',session_expired:'화면을 새로고침한 뒤 다시 로그인해 주세요.',invalid:'번호 또는 비밀번호를 확인해 주세요.',not_enrolled:'가입되지 않은 번호입니다.',locked:'시도가 많아 잠시 잠겼습니다. 15분 뒤 다시 시도해 주세요.',too_many:'요청이 많습니다. 잠시 후 다시 시도해 주세요.',connection_failed:'연결하지 못했습니다. 잠시 후 다시 시도해 주세요.'})[error?.message]||'불러오지 못했습니다. 다시 시도해 주세요.'}
 function safeDownloadUrl(value){try{const u=new URL(value);return u.protocol==='https:'&&['cvlrphtupjmaefahodgz.supabase.co','www.deltaskill.co.kr','deltaskill.co.kr'].includes(u.hostname)?u.href:null}catch{return null}}
 function passwordChanged(){legacyPassword=false;try{localStorage.removeItem('ds_pw_old')}catch{}}
 window.addEventListener('storage',e=>{if(e.key==='ds_tk'||e.key==='ds_logout_epoch'){authEpoch++;window.dispatchEvent(new Event('ds-session-change'));}});
 window.DSService={isLiveOrigin,memberPreview,canLogin:isLiveOrigin||memberPreview,session,login,logout,request,masked,errorText,safeDownloadUrl,accountLinks,ready,refresh,passwordChanged,needsPasswordUpdate:()=>legacyPassword};
})();
