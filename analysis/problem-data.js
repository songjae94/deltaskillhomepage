(() => {
  'use strict';
  // Encode each expression as presentation MathML so the same notation scales in print and on phones.
  function row(expr) {
    const tokens=String(expr).match(/lim|[a-zA-Zα]|\d+|[^\s]/gu) || [];
    return '<mrow>'+tokens.map(t => {
      const tag=/^\d/.test(t)?'mn':/^[a-zA-Zα]/.test(t)?'mi':'mo';
      const content=t==='<'?'&lt;':t==='>'?'&gt;':t;
      return '<'+tag+'>'+content+'</'+tag+'>';
    }).join('')+'</mrow>';
  }
  const frac=(a,b)=>'<mfrac>'+row(a)+row(b)+'</mfrac>';
  const lim=v=>'<munder><mi mathvariant="normal">lim</mi><mrow>'+row('x→')+'<msup>'+row(v)+'<mo>+</mo></msup></mrow></munder>';
  const m=(...xs)=>'<math xmlns="http://www.w3.org/1998/Math/MathML">'+xs.map(x=>x.startsWith('<m')?x:row(x)).join('')+'</math>';
  const H=v=>m(lim(v),frac('g(x)','x(x−2)'));
  const phrase=(math,particle)=>'<span class="math-phrase">'+math+particle+'</span>';
  const b=m('−',frac('7','2'),'g(1)');
  const A=m('g(−1)');
  const graphAlt='조건에서 구한 함수의 해설 그래프. 원문에는 그림이 없다. 실선은 g, 왼쪽의 점선은 부호를 바꾸기 전의 f이다.';
  const source='2026학년도 대학수학능력시험 · 수학 공통 21번 · 홀수형 8쪽 · 4점';
  const ref='<p><a href="https://www.ebsi.co.kr/ebs/xip/xipa/retrieveSCVMainInfo.ebs?irecord=202511133&amp;targetCd=D300&amp;cookieGradeVal=high3" target="_blank" rel="noopener">평가원 문제·정답 보기 (EBSi)</a> · <a href="https://wdown.ebsi.co.kr/W61001/01exam/20251113/go3/math_main_hsj_1M9MTYWF_5.pdf#page=9" target="_blank" rel="noopener">EBS 공식 해설 9~11쪽</a></p>';
  const pieces=m('g(x)=','<mrow><mo>{</mo><mtable columnalign="left left" rowspacing=".25em"><mtr><mtd>'+row('−f(x)')+'</mtd><mtd>'+row('(x<t)')+'</mtd></mtr><mtr><mtd>'+row('f(x)')+'</mtd><mtd>'+row('(x≥t)')+'</mtd></mtr></mtable></mrow>');
  const conditions=[
    {html:pieces+'는 실수 전체의 집합에서 연속이고 다음 조건을 만족시킨다.'},
    {html:'(가) 모든 실수 '+m('a')+'에 대하여 '+phrase(H('a'),'의')+' 값이 존재한다.'},
    {html:'(나) '+phrase(H('m'),'의')+' 값이 음수가 되도록 하는 자연수 '+phrase(m('m'),'의')+' 집합은 '+phrase(m('{g(−1),−',frac('7','2'),'g(1)}'),'이다.')}
  ];
  const steps=[
    {title:'분모에서 찾은 두 근',condition:1,anchor:[45.9,47.2],html:'<p>분모가 0이 되는 '+m('x=0,2')+'에서도 유한한 우극한이 존재한다. 연속인 분자도 이 두 점에서 0이므로 '+m('f(0)=f(2)=0')+'이다.</p><p>'+m('f(x)=kx(x−2)(x−r)')+'로 놓는다. 최고차항의 계수 '+m('k')+'는 양수이다.</p>'},
    {title:'부호가 바뀌는 경계',condition:0,anchor:[45.9,47.2],html:'<p>'+m('x=t')+'에서 연속이므로 '+m('−f(t)=f(t)')+'이고, '+m('t')+'는 '+m('0,2,r')+' 중 하나이다. '+m('H(a)=',lim('a'),frac('g(x)','x(x−2)'))+'로 놓으면 '+m('a<t')+'에서 '+m('H(a)=−k(a−r)')+', '+m('a≥t')+'에서 '+m('H(a)=k(a−r)')+'이다.</p><p>'+b+'가 자연수이므로 '+m('g(1)<0')+'이다. 따라서 '+m('H(1)=−g(1)>0')+'이다.</p>'},
    {title:'경계 후보를 좁히기',condition:2,anchor:[45.9,69.5],graph:'right-limit',html:'<p>'+m('t=r')+'이면 '+m('H(a)=k|a−r|≥0')+'이다. '+m('t=0')+'이면 '+m('H(1)=k(1−r)>0')+'이므로 '+m('r<1')+'이고 모든 자연수에서 '+m('H(m)>0')+'이다. 두 경우 모두 (나)에 어긋난다.</p><p>따라서 '+m('t=2')+'이다. 경계에서는 오른쪽 식의 값이 우극한이므로 아래쪽 점을 포함한다.</p>'},
    {title:'음수인 두 자연수',condition:2,anchor:[59.5,60.0],graph:'right-limit',html:'<p>'+m('m=1')+'에서는 양수이고 '+m('m≥2')+'에서는 '+m('H(m)=k(m−r)')+'이다. 음수가 되는 자연수는 '+m('2≤m<r')+'에 있다.</p><p>집합의 두 원소가 서로 다르므로 이 자연수는 정확히 2와 3이다. 따라서 '+m('3<r≤4')+'이다. '+m('r=4')+'에서도 '+m('H(4)=0')+'은 음수가 아니다.</p>'},
    {title:'계수와 함숫값',condition:2,anchor:[68.6,53.6],graph:'right-limit',html:'<p>'+m('g(−1)=3k(r+1)')+', '+m('−',frac('7','2'),'g(1)=',frac('7','2'),'k(r−1)')+'이다. 전자에서 후자를 빼면 '+m(frac('k(13−r)','2'),'>0')+'이다. 따라서 전자는 3, 후자는 2이다.</p><p>'+m('k=',frac('1','r+1'))+'을 대입하면 '+m('7(r−1)=4(r+1)')+'이므로 '+m('r=',frac('11','3'))+', '+m('k=',frac('3','14'))+'이다. '+m('−5<2')+'에서 '+m('g(−5)=−f(−5)=65')+'이다.</p>'}
  ];
  // The compact page keeps one calculation in view; the full derivation stays in the detailed page.
  const tabletNotes = [
    '<p>두 점에서 우극한이 존재하고 '+m('g')+'가 연속이므로 '+m('g(0)=g(2)=0')+'이다. '+phrase(m('g(x)'),'는')+' '+m('f(x)')+' 또는 '+m('−f(x)')+'이므로</p><p class="calculation">'+m('f(0)=f(2)=0')+'</p>',
    '<p>두 식의 경계에서 함숫값이 같으므로 '+m('−f(t)=f(t)')+'이다. 따라서 '+m('f(t)=0')+'이고 '+m('t')+'는 다음 세 값 중 하나이다.</p><p class="calculation">'+m('t=0,2,r')+'</p>',
    '<p>'+m('t=r')+'이면 우극한은 모두 0 이상이다. '+m('t=0')+'이면 '+m('H(1)>0')+'에서 '+m('r<1')+'이므로 모든 자연수에서 우극한이 양수이다. 따라서 '+m('t=2')+'이다.</p>',
    '<p>'+m('m≥2')+'에서 '+m('H(m)=k(m−r)')+'이다. 가로축 아래의 자연수가 2와 3뿐이므로</p><p class="calculation">'+m('3<r≤4')+'</p>',
    '<p>'+m('g(−1)=3')+', '+m('−',frac('7','2'),'g(1)=2')+'에서 '+m('r=',frac('11','3'))+', '+m('k=',frac('3','14'))+'이다. '+m('−5<2')+'이므로</p><p class="calculation">'+m('g(−5)=−f(−5)=65')+'</p>'
  ];
  const rootsReason = '<ol class="reason-list"><li>분모가 0인 점은 '+m('x=0,2')+'이다.</li><li>유한한 우극한과 '+m('g')+'의 연속성에서 '+m('g(0)=g(2)=0')+'이다.</li><li>'+m('g(x)')+'는 '+m('f(x)')+' 또는 '+m('−f(x)')+'이므로 '+m('f(0)=f(2)=0')+'이다.</li></ol>';
  steps[0].html=rootsReason.replace('유한한 우극한과','두 점에서 분모는 0에 가까워지고 몫의 우극한은 유한하므로 분자의 우극한은 0이다. 이 사실과')+'<p>따라서 '+m('f(x)=kx(x−2)(x−r)')+'로 놓을 수 있다. 여기서 '+m('k>0')+'이다.</p>';
  tabletNotes[0]=rootsReason;
  steps.forEach((step,i)=>step.tabletHtml=tabletNotes[i]);
  window.DeltaAnalysis={
    title:'우극한이 음수인 자연수는 어디에 있을까?',source,
    promptHtml:'<p><strong>21.</strong> 최고차항의 계수가 양수인 삼차함수 '+m('f(x)')+'와 실수 '+m('t')+'에 대하여 함수</p>',
    conditions,afterHtml:'<p>'+phrase(m('g(−5)'),'의')+' 값을 구하시오. <span class="given">(단, '+m('g(−1)≠−',frac('7','2'),'g(1)')+')</span> <span class="points">[4점]</span></p>',
    graphAlt,steps,
    theoryHtml:'<h3>분모가 0인 점에서 유한한 극한</h3><p>분모가 0에 가까워지는 동안 몫이 유한한 값에 가까워지면 분자도 0에 가까워진다. 분자가 연속인 경우 그 점에서의 함숫값도 0이다.</p><h3>우극한과 함수의 경계</h3><p>'+m('x')+'가 '+m('a')+'보다 큰 쪽에서 '+m('a')+'에 가까워질 때에는 그 구간의 식을 따른다. 약분하기 전의 몫이 경계에서 정의되지 않아도 우극한은 존재할 수 있다. 우극한 함수의 경계값은 오른쪽 식으로 정한다.</p><h3>음수인 정수 세기</h3><p>그래프에서 가로축 아래에 있는 정수 좌표만 센다. '+m('H(r)=0')+'이므로 '+m('m=r')+'는 포함되지 않는다. 예를 들어 '+m('2≤m<r')+'을 만족하는 자연수가 2와 3뿐이면 '+m('3<r≤4')+'이다.</p>'+ref,
    original:{id:'kice-2026-common-21',title:'2026학년도 수능 공통 21번',answer:'65',explanationHtml:steps[4].html},
    similar:[{id:'right-limit-transfer-01',title:'경계를 3으로 옮기면',promptHtml:'<p>'+m('f(x)=x(x−3)(x−r)')+'에 대하여 '+m('x<3')+'일 때 '+m('g(x)=−f(x)')+', '+m('x≥3')+'일 때 '+m('g(x)=f(x)')+'이다. '+m('r')+'는 자연수이다.</p><p>'+m(lim('m'),frac('g(x)','x(x−3)'))+'가 음수가 되는 자연수 '+m('m')+'의 집합이 '+m('{3,4}')+'일 때, '+m('g(−2)')+'의 값을 구하시오.</p>',answer:'70',explanationHtml:'<p>'+m('m≥3')+'에서는 우극한이 '+m('m−r')+'이다. 4에서는 음수이고 5에서는 음수가 아니므로 '+m('4<r≤5')+'이다. '+m('r')+'가 자연수이므로 '+m('r=5')+'이다. 1과 2에서는 '+m('5−m>0')+'이므로 주어진 집합과 일치한다.</p><p>'+m('−2<3')+'이므로 '+m('g(−2)=−(−2)(−5)(−7)=70')+'이다.</p>'}]
  };
})();
