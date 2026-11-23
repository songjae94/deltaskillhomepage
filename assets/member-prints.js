/* Server-owned monthly print receipts. This module never writes a balance or claims device-save completion. */
(() => {
  'use strict';
  const isCount = v => Number.isSafeInteger(v) && v >= 0;
  const validCounts = p => p && isCount(p.setsTotal) && p.setsTotal > 0 && isCount(p.setsReceived) && p.setsReceived <= p.setsTotal;
  const id = v => typeof v === 'string' && v.length > 0 && v.length <= 160 && !/[\x00-\x1f]/.test(v);
  const isReady = x => x.fileReady !== false && x.deliveryReady !== false;
  function snapshot(data) {
    if (!data || !data.pass || !['live','none','renewing','mode'].includes(data.pass.state) ||
        (data.pass.state === 'live' && !validCounts(data.pass)) ||
        !Array.isArray(data.sets) || !Array.isArray(data.received) || data.sets.length > 5000 || data.received.length > 10000)
      throw new Error('invalid_print_state');
    const clean = rows => rows.filter(x => x && id(x.setId)).map(x => ({...x, fileReady:isReady(x),fileStored:x.fileStored===true?true:x.fileStored===false||x.fileState==='pending'?false:undefined}));
    return {...data,sets:clean(data.sets),received:clean(data.received)};
  }
  function safeUrl(value) {
    try { const u = new URL(value);return u.protocol === 'https:' && !u.username && !u.password && !u.port &&
      ['cvlrphtupjmaefahodgz.supabase.co','www.deltaskill.co.kr','deltaskill.co.kr'].includes(u.hostname) ? u.href : null; }
    catch { return null; }
  }
  function receipt(data, again = false) {
    const url = safeUrl(data?.url);
    if (!url || typeof data.charged !== 'boolean' || !validCounts(data) || data.fileReady === false || data.deliveryReady === false || data.fileStored === false || data.fileState === 'pending' || (again && data.charged !== false))
      throw new Error('unverified_receipt');
    return {...data,url};
  }
  function message(error) {
    return ({no_active_pass:'이용 중인 이용권이 없어 새 프린트를 받을 수 없습니다. 받은 프린트의 다시 받기는 별도 수령내역에서 확인해 주세요.',
      sets_full:'이번 결제 기간의 30벌을 모두 받았습니다. 받은 프린트는 차감 없이 다시 받을 수 있습니다.',
      renew_in_progress:'자동 결제를 처리하고 있습니다. 잠시 뒤 다시 확인해 주세요.',
      test_mode:'이 이용권으로는 지금 프린트를 받을 수 없습니다.',not_yet:'아직 제공 전인 프린트입니다.',
      bad_set:'이 프린트를 찾을 수 없습니다.',file_not_ready:'실제 프린트 파일을 준비하고 있습니다. 준비된 파일만 받을 수 있습니다.',
      expired:'다시 받을 수 있는 기간이 지났습니다.',invalid_print_state:'프린트 수령 상태를 확인하지 못했습니다. 다시 불러와 주세요.',
      unauthorized:'로그인이 만료되었습니다. 다시 로그인해 주세요.'})[error?.message] ||
      '수령 결과를 확인하지 못했습니다. 수령내역과 남은 벌을 다시 불러온 뒤 다시 받기를 이용해 주세요.';
  }
  function notice(r) {
    return (r.charged ? `서버 수령 기록: ${r.setsReceived} / ${r.setsTotal}벌 · 남은 ${r.setsTotal-r.setsReceived}벌. ` : '다시 받기 · 추가 차감 없음. ')+
      (r.fileStored === true ? '내 자료 보관이 확인되었습니다. ' : '')+'파일 주소가 준비되었습니다. 파일을 열어 기기에 저장해 주세요. 기기 저장 완료 여부는 이 화면에서 확인하지 않습니다.';
  }
  function fileLink(url) {
    const a=document.createElement('a');a.href=url;a.target='_blank';a.rel='noopener noreferrer';a.textContent='프린트 파일 열기 · 저장';a.className='member-print-file-link';return a;
  }
  window.DSMemberPrints={snapshot,receipt,safeUrl,message,notice,fileLink,validCounts};
})();
