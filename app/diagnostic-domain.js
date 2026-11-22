'use strict';
(() => {
 function summarize(a,bank,finishedAt=Date.now(),reason='submitted'){
  const known=new Map(bank.map(q=>[q.id,q]));
  const questions=a.questionIds.map(id=>{const q=known.get(id);if(!q)throw Error('unknown_question');const value=a.answers[id],answered=Number.isInteger(value)&&value>=0&&value<q.options.length;return {id,answer:answered?value:null,correct:answered&&value===q.answer,skipped:!answered,level:q.diagnosticLevel||null}});
  const elapsed=Math.max(0,Math.floor((finishedAt-a.startedAt)/1000)),limit=a.type==='timed'?a.limitSeconds:null;
  return {id:a.id,unit:a.unit,type:a.type,when:new Date(finishedAt).toISOString(),total:questions.length,answered:questions.filter(q=>!q.skipped).length,correct:questions.filter(q=>q.correct).length,elapsedSeconds:limit?Math.min(limit,elapsed):elapsed,limitSeconds:limit,reason,questions,calibrated:false,timedGrade:null,difficultyGrade:null,storage:'this-device',version:1};
 }
 function validAttempt(a,bank){
  if(!a||typeof a.id!=='string'||!['timed','difficulty'].includes(a.type))return false;
  const ids=new Set(bank.map(q=>q.id));
  return Array.isArray(a.questionIds)&&a.questionIds.length>0&&a.questionIds.length<=24&&a.questionIds.every(id=>ids.has(id))&&new Set(a.questionIds).size===a.questionIds.length&&Number.isFinite(a.startedAt)&&a.startedAt>0&&Number.isInteger(a.index)&&a.index>=0&&a.index<a.questionIds.length&&a.answers&&typeof a.answers==='object'&&(a.type!=='timed'||(a.limitSeconds===360&&a.deadline===a.startedAt+360000));
 }
 window.DSDiagnosticDomain={summarize,validAttempt};
})();
