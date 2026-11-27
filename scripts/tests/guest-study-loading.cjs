const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

const source = fs.readFileSync('app/student-study-paths.js', 'utf8');
const section = (first, after) => source.slice(source.indexOf(first), source.indexOf(after));
const styles = section('let guestStylePromise=null;', 'function bind(container,');
const opening = section(' async function openGuestQuestion(', ' let printedGuestQuestion=');
const deferred = () => {
  let resolve, reject;
  const promise = new Promise((yes,no) => {resolve=yes; reject=no;});
  return {promise,resolve,reject};
};
const css = '@font-face{font-family:KaTeX_Main;src:url(data:font/woff2;base64,AA)}';
const question = {question_html:'<p>문제</p>', next:2, left:13};

function fixture() {
  const reads = [], opens = [];
  const state = {
    window:{DSStudentFragment:{mathEmbed(){const task=deferred();reads.push(task);return task.promise;},compact:style=>style},DSDrawHostV59:{trial:{study(key,page){
      const task = deferred(); opens.push({key,page,task}); return task.promise;
    }}}},
    guestRange:{cell_key:'range'}, guestTrial:true, guestBusy:false, guestRequest:0,
    epoch:0, closed:false, signed:()=>false, draw(){}, guestFailure:()=>'연결 오류',
    fragmentContent:markup => markup, unshownGuest:null, guestQuestion:''
  };
  vm.runInNewContext(styles+opening, state);
  return {state, reads, opens};
}

(async () => {
  const {state, reads, opens} = fixture();
  const prewarm = state.guestMathStyle();
  const rejectedWarmup = prewarm.catch(() => {});
  assert.equal(opens.length, 0);
  const first = state.openGuestQuestion();
  await state.openGuestQuestion();
  assert.equal(reads.length, 1);
  assert.equal(opens.length, 1);
  opens[0].task.resolve(question);
  reads[0].reject(Error('style fetch failed'));
  await Promise.all([first, rejectedWarmup]);
  assert.equal(state.guestQuestion, '');
  assert.equal(state.guestBusy, false);
  const retry = state.openGuestQuestion();
  assert.equal(opens.length, 1);
  reads[1].resolve(css);
  await retry;
  assert.equal(state.guestNext, 2);
  assert.ok(state.guestQuestion.includes(css) && state.guestQuestion.endsWith(question.question_html));
  const next = state.openGuestQuestion(2);
  assert.equal(opens[1].page, 2);
  state.epoch++;
  opens[1].task.resolve({...question, question_html:'<p>다른 세션</p>'});
  await next;
  assert.ok(!state.guestQuestion.includes('다른 세션'));

  const screen = fixture();
  const wrongStyle = screen.state.guestMathStyle();
  screen.reads[0].resolve('@font-face{font-family:KaTeX_Main;src:url(external.woff2)}');
  await assert.rejects(wrongStyle, /math_style/);
  assert.equal(screen.opens.length, 0);
  console.log('PASS: explicit open overlaps font preparation, no speculative or duplicate consumption, stale result ignored, embedded fonts retained');
})().catch(error => {console.error(error);process.exitCode=1;});
