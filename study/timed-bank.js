// Locally authored items. All notation and prose below are fixed source literals.
(() => {
  const number = n => n < 0 ? '<mrow><mo>−</mo><mn>'+Math.abs(n)+'</mn></mrow>' : '<mn>'+n+'</mn>';
  const symbol = name => '<mi>'+name+'</mi>';
  const op = value => '<mo>'+value+'</mo>';
  const row = value => '<mrow>'+value+'</mrow>';
  const power = (base, n) => '<msup>'+row(base)+number(n)+'</msup>';
  const sub = (base, n) => '<msub>'+symbol(base)+number(n)+'</msub>';
  const fraction = (top, bottom) => '<mfrac>'+row(top)+row(bottom)+'</mfrac>';
  const root = value => '<msqrt>'+value+'</msqrt>';
  const brackets = value => op('(')+value+op(')');
  const math = value => '<math xmlns="http://www.w3.org/1998/Math/MathML"><mstyle displaystyle="true">'+value+'</mstyle></math>';
  const M = (strings,...values) => math(strings.reduce((s,part,i)=>s+part+(i<values.length?values[i]:''),''));
  const x=symbol('x'),y=symbol('y'),a=symbol('a'),b=symbol('b'),n=symbol('n');
  const add=op('+'),minus=op('−'),eq=op('=');
  const f = arg => symbol('f')+brackets(arg);
  const term = (c,v) => number(c)+v;
  const log = (base,arg) => '<msub><mi mathvariant="normal">log</mi>'+number(base)+'</msub>'+number(arg);
  const ratio = (a,b) => fraction(number(a),number(b));
  function item(topic,body,options,answer){
    return {topic,body,choices:options.map(v=>math(typeof v==='number'?number(v):v)),answer};
  }
  window.timedBank=[
    item('다항식의 나머지','다항식 '+M`${power(x,3)}${minus}${term(2,x)}${add}${number(5)}`+'를 '+M`${x}${minus}${number(2)}`+'로 나누었을 때의 나머지는?', [9,11,13,15,17],0),
    item('근과 계수의 관계','이차방정식 '+M`${power(x,2)}${minus}${term(5,x)}${add}${number(3)}${eq}${number(0)}`+'의 두 근을 '+math(a)+', '+math(b)+'라 할 때, '+M`${power(a,2)}${add}${power(b,2)}`+'의 값은?', [16,17,18,19,20],3),
    item('이차함수','함수 '+M`${f(x)}${eq}${power(x,2)}${minus}${term(6,x)}${add}${number(13)}`+'의 최솟값은?', [2,3,4,5,6],2),
    item('이차부등식','부등식 '+M`${power(x,2)}${minus}${term(2,x)}${minus}${number(8)}${op('≤')}${number(0)}`+'을 만족시키는 정수 '+math(x)+'의 개수는?', [4,5,6,7,8],3),
    item('원의 방정식','원 '+M`${power(brackets(x+minus+number(2)),2)}${add}${power(brackets(y+add+number(1)),2)}${eq}${number(25)}`+'가 '+math(x)+'축과 만나는 두 점의 '+math(x)+'좌표의 합은?', [2,4,6,8,10],1),
    item('좌표평면','두 점 '+math(brackets(number(-2)+op(',')+number(3)))+', '+math(brackets(number(4)+op(',')+number(-5)))+' 사이의 거리는?', [6,7,8,9,10],4),
    item('집합','두 유한집합 '+math(symbol('A'))+', '+math(symbol('B'))+'의 원소의 개수는 각각 8, 7이고, 두 집합의 공통 원소는 3개이다. 합집합의 원소의 개수는?', [12,13,14,15,16],0),
    item('합성함수','두 함수 '+M`${f(x)}${eq}${term(2,x)}${add}${number(1)}`+', '+M`${symbol('g')}${brackets(x)}${eq}${power(x,2)}${minus}${number(1)}`+'에 대하여 '+math(f(symbol('g')+brackets(number(3))))+'의 값은?', [13,14,15,16,17],4),
    item('역함수','함수 '+M`${f(x)}${eq}${term(3,x)}${minus}${number(4)}`+'의 역함수를 '+math(power(symbol('f'),-1))+'이라 할 때, '+math(power(symbol('f'),-1)+brackets(number(8)))+'의 값은?', [3,4,5,6,7],1),
    item('무리함수','함수 '+M`${y}${eq}${root(number(7)+minus+term(2,x))}`+'의 정의역에 속하는 정수 중 가장 큰 수는?', [1,2,3,4,5],2),
    item('유리함수','함수 '+M`${y}${eq}${fraction(term(3,x)+add+number(1),x+minus+number(2))}`+'의 두 점근선의 교점에서 '+math(x)+'좌표와 '+math(y)+'좌표의 합은?', [2,3,4,5,6],3),
    item('경우의 수','숫자 1, 2, 3, 4, 5 중에서 서로 다른 세 개를 한 번씩 사용하여 만든 세 자리 자연수 중 짝수의 개수는?', [18,24,30,36,42],1),
    item('조합','학생 6명 중에서 대표 2명을 뽑는 경우의 수는?', [15,16,18,20,21],0),
    item('확률','한 개의 주사위를 두 번 던질 때, 나온 두 눈의 수의 합이 7일 확률은? (단, 주사위의 각 눈이 나올 가능성은 서로 같다.)', [ratio(1,12),ratio(1,9),ratio(1,6),ratio(1,4),ratio(1,3)],2),
    item('지수방정식','방정식 '+math('<msup>'+number(2)+row(x+add+number(1))+'</msup>'+eq+number(32))+'를 만족시키는 '+math(x)+'의 값은?', [2,3,4,5,6],2),
    item('로그',M`${log(2,24)}${minus}${log(2,3)}`+'의 값은?', [1,2,3,4,5],2),
    item('삼각함수','예각 '+math(symbol('θ'))+'에 대하여 '+M`<mi mathvariant="normal">sin</mi>${symbol('θ')}${eq}${ratio(3,5)}`+'일 때, '+M`<mi mathvariant="normal">cos</mi>${symbol('θ')}`+'의 값은?', [ratio(1,5),ratio(2,5),ratio(3,5),ratio(4,5),1],3),
    item('삼각형의 넓이','두 변의 길이가 4, 6이고 그 끼인각의 크기가 '+math(fraction(symbol('π'),number(6)))+'인 삼각형의 넓이는?', [4,5,6,7,8],2),
    item('등차수열','첫째항이 4이고 공차가 3인 등차수열의 제7항은?', [22,23,24,25,26],0),
    item('등비수열','첫째항이 3이고 공비가 2인 등비수열의 첫째항부터 제4항까지의 합은?', [42,45,48,51,54],1),
    item('수열의 합','수열의 첫째항부터 제'+math(n)+'항까지의 합이 '+M`${'<msub>'+symbol('S')+n+'</msub>'}${eq}${power(n,2)}${add}${term(2,n)}`+'일 때, 제5항은?', [7,8,9,10,11],4),
    item('함수의 극한',M`<munder><mi mathvariant="normal">lim</mi>${row(x+op('→')+number(3))}</munder>${fraction(power(x,2)+minus+number(9),x+minus+number(3))}`+'의 값은?', [3,4,5,6,7],3),
    item('미분계수','함수 '+M`${f(x)}${eq}${power(x,3)}${minus}${term(2,x)}`+'에 대하여 '+math('<msup>'+symbol('f')+op('′')+'</msup>'+brackets(number(2)))+'의 값은?', [6,7,8,9,10],4),
    item('접선','곡선 '+M`${y}${eq}${power(x,2)}${add}${term(3,x)}`+' 위의 점 '+math(brackets(number(1)+op(',')+number(4)))+'에서의 접선의 '+math(y)+'절편은?', [-2,-1,0,1,2],1),
    item('정적분',M`<msubsup><mo>∫</mo>${number(0)}${number(2)}</msubsup>${brackets(term(3,x)+add+number(1))}<mspace width="0.15em"/><mi mathvariant="normal">d</mi>${x}`+'의 값은?', [4,5,6,7,8],4),
    item('함수의 연속','함수 '+math(f(x))+'가 '+M`${x}${op('≠')}${number(1)}`+'일 때 '+M`${f(x)}${eq}${fraction(power(x,2)+minus+number(1),x+minus+number(1))}`+'이고 '+M`${x}${eq}${number(1)}`+'에서 연속이다. '+math(f(number(1)))+'의 값은?', [1,2,3,4,5],1),
    item('절댓값','방정식 '+M`${op('|')}${x}${minus}${number(3)}${op('|')}${eq}${number(5)}`+'의 모든 실근의 곱은?', [-16,-12,-8,-4,0],0),
    item('수열의 귀납적 정의','수열 '+math(op('{')+'<msub>'+a+n+'</msub>'+op('}'))+'이 '+M`${sub('a',1)}${eq}${number(2)}`+'이고 모든 자연수 '+math(n)+'에 대하여 '+M`${'<msub>'+a+row(n+add+number(1))+'</msub>'}${eq}${number(2)}${'<msub>'+a+n+'</msub>'}${add}${number(1)}`+'을 만족시킬 때, '+math(sub('a',4))+'의 값은?', [15,19,21,23,25],3),
    item('로그방정식','방정식 '+M`<msub><mi mathvariant="normal">log</mi>${number(3)}</msub>${brackets(x+minus+number(1))}${eq}${number(2)}`+'를 만족시키는 '+math(x)+'의 값은?', [6,7,8,9,10],4),
    item('다항함수의 적분','함수 '+math(f(x))+'가 모든 실수 '+math(x)+'에 대하여 '+M`<msup><mi>f</mi><mo>′</mo></msup>${brackets(x)}${eq}${term(4,x)}${minus}${number(1)}`+'을 만족시킨다. '+M`${f(number(0))}${eq}${number(3)}`+'일 때, '+math(f(number(2)))+'의 값은?', [7,8,9,10,11],2),
    item('수열의 합','첫째항이 2이고 공차가 3인 등차수열의 첫째항부터 제6항까지의 합은?', [51,54,57,60,63],2),
    item('삼각함수의 주기','함수 '+M`${y}${eq}<mi mathvariant="normal">sin</mi>${term(4,x)}`+'의 주기 중 가장 작은 양수는?', [fraction(symbol('π'),number(4)),fraction(symbol('π'),number(2)),symbol('π'),term(2,symbol('π')),term(4,symbol('π'))],1)
  ];
})();

// Finals school practice uses its own bank, separate from the difficulty ladder.
if(new URLSearchParams(location.search).get('exam')!=='csat'){
 window.timedBank=window.FinalsIntegralBank.timed.map(q=>({topic:q.title+' · 자체 제작',body:q.question,choices:q.options.map(o=>'<math xmlns="http://www.w3.org/1998/Math/MathML">'+o+'</math>'),answer:q.answer}));
}
