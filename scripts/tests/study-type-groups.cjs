const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const source=fs.readFileSync('app/student-study-paths.js','utf8');
const code=source.slice(source.indexOf(' function remoteTypeGroups(){'),source.indexOf(' async function querySource(){'));
const rows=Array.from({length:24},(_,i)=>({id:'q'+i,typeIds:['T'+(1+Math.floor(i/2))]}));
rows.push({id:'shared',typeIds:['T1','T2']});
const context=vm.createContext({desk:true,state:{course:'types'},sourceResult:{questions:rows},deskType:'',workbookScope:()=>({unit:{label:'함수'}}),workbookChoices:()=>[{units:[{types:[{id:'T1',label:'첫 유형'},{id:'T2',label:'둘째 유형'}]}]}],esc:x=>String(x),mathContent:x=>String(x)});
vm.runInContext(code,context);
assert.equal(vm.runInContext('remoteTypeGroups().length',context),12);
assert.deepEqual(Array.from(vm.runInContext('sourceRows().map(q=>q.id)',context)),['q0','q1','shared']);
assert.match(vm.runInContext('remoteTypeNavigation()',context),/첫 유형/);
context.deskType='T2';assert.deepEqual(Array.from(vm.runInContext('sourceRows().map(q=>q.id)',context)),['q2','q3','shared']);
context.deskType='T12';assert.deepEqual(Array.from(vm.runInContext('sourceRows().map(q=>q.id)',context)),['q22','q23']);
assert.match(vm.runInContext('remoteTypeNavigation()',context),/data-ssp-remote-type-step="1" disabled/);
context.state.course='concept';assert.equal(vm.runInContext('sourceRows().length',context),25);
context.state.course='supplement';assert.equal(vm.runInContext('sourceRows().length',context),0);
context.sourceResult={questions:[{id:'a',originalGroupId:'g1',originalQuestionNo:10},{id:'b',originalGroupId:'g1',originalQuestionNo:10},{id:'c',originalGroupId:'g2',originalQuestionNo:11}]};assert.equal(vm.runInContext('remoteTypeGroups().length',context),2);assert.equal(vm.runInContext('sourceRows().length',context),2);assert.match(vm.runInContext('remoteTypeNavigation()',context),/함수 · 변형 연습/);
console.log('PASS: all 12 types retained, same-type questions, multi-tag membership, final navigation, supplement unchanged');
const resumeCode=source.slice(source.indexOf(' function continuePlan(){'),source.indexOf(' async function finishPlan('));
const resumeRows=Array.from({length:30},(_,i)=>({id:'r'+i,version:'v',typeId:'T'+i}));
const resumed=vm.createContext({guestTrial:false,planPhase:'return',supplyPhase:'ready',planProfile:{subject:'수학',need:'types',unit:'u'},planUnits:()=>[{id:'u',book:'b',bookUnit:'u',rows:resumeRows}],workbookChoices:()=>[{id:'b'}],workbookRanges:()=>[{id:'u'}],state:{sourcePending:{types:{questionId:'r20',version:'v'}}},openRemote:()=>{},view:'home',current:null});
vm.runInContext(resumeCode+';continuePlan();',resumed);
assert.equal(vm.runInContext('sourceResult.questions.length',resumed),30);
assert.equal(vm.runInContext('deskType',resumed),'T20');console.log('PASS: resume preserves all 30 questions and saved type');

assert.doesNotMatch(vm.runInContext('remoteTypeNavigation()',context),/10번|11번|교재 \d+/);

assert.equal(vm.runInContext('sourceResult.questions.findIndex(q=>q.id==="r20")',resumed),20);
assert.equal(vm.runInContext('sourceResult.questions[21].id',resumed),'r21');
console.log('PASS: resume keeps saved question position and forward order');
