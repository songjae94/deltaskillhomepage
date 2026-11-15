/* Independently authored finals practice. No official-exam attribution. */
(() => {
  'use strict';
  const n = value => value < 0 ? '<mrow><mo>−</mo><mn>'+(-value)+'</mn></mrow>' : '<mn>'+value+'</mn>';
  const v = name => '<mi>'+name+'</mi>';
  const o = text => '<mo stretchy="false">'+text.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')+'</mo>';
  const r = text => '<mrow>'+text+'</mrow>';
  const p = text => r(o('(')+text+o(')'));
  const pow = (base,k) => '<msup>'+r(base)+n(k)+'</msup>';
  const frac = (a,b) => '<mfrac>'+r(a)+r(b)+'</mfrac>';
  const gcd = (a,b) => b ? gcd(b,a%b) : Math.abs(a);
  const q = (a,b=1) => { const d=gcd(a,b); a/=d;b/=d; return b===1?n(a):frac(n(a),n(b)); };
  const m = body => '<math xmlns="http://www.w3.org/1998/Math/MathML"><mstyle displaystyle="true">'+r(body)+'</mstyle></math>';
  const x=v('x'),t=v('t'), y=v('y'), eq=o('='),plus=o('+'),minus=o('−');
  const fn = (name,arg=x) => v(name)+p(arg);
  const integral = (a,b,body,variable=x) => '<msubsup><mo>∫</mo>'+r(a)+r(b)+'</msubsup>'+r(body)+'<mspace width="0.18em"/><mi mathvariant="normal">d</mi>'+variable;
  const abs = body => r(o('|')+body+o('|'));
  const line = body => '<p>'+body+'</p>';
  const source='기말고사 대비 · 자체 제작';
  const make = (title,short,question,options,answer,solution) => ({title,source,short,question,options,answer,solution});
  const easy=make('정적분과 넓이','기초 · 부호와 넓이',
    '곡선 '+m(y+eq+pow(x,2)+minus+n(4)+x+plus+n(3))+'과 '+m(x)+'축으로 둘러싸인 부분의 넓이는?',
    [q(2,3),n(1),q(4,3),q(5,3),n(2)],2,[
      line(m(pow(x,2)+minus+n(4)+x+plus+n(3)+eq+p(x+minus+n(1))+p(x+minus+n(3)))+'이므로 두 교점의 '+m(x)+'좌표는 '+m(n(1))+', '+m(n(3))+'이다.'),
      line(m(n(1)+o('≤')+x+o('≤')+n(3))+'에서 함수값이 0 이하이므로 구하는 넓이는 '+m(minus+integral(n(1),n(3),p(pow(x,2)+minus+n(4)+x+plus+n(3)))+eq+q(4,3))+'이다.')
    ]);
  const middle=make('절댓값이 포함된 정적분','기본 · 영점에서 구간 나누기',
    '상수 '+m(v('a'))+'에 대하여 함수 '+m(fn('f')+eq+pow(x,3)+minus+n(6)+pow(x,2)+plus+v('a')+x)+'가 '+m(fn('f',n(2))+eq+n(0))+'을 만족시킨다. '+m(integral(n(0),n(4),abs(fn('f'))))+'의 값은?',
    [4,6,8,10,12].map(n),2,[
      line(m(fn('f',n(2))+eq+n(8)+minus+n(24)+plus+n(2)+v('a')+eq+n(0))+'에서 '+m(v('a')+eq+n(8))+'이다. 따라서 '+m(fn('f')+eq+x+p(x+minus+n(2))+p(x+minus+n(4)))+'이다.'),
      line(m(n(0)+o('≤')+x+o('≤')+n(2))+'에서 '+m(fn('f')+o('≥')+n(0))+', '+m(n(2)+o('≤')+x+o('≤')+n(4))+'에서 '+m(fn('f')+o('≤')+n(0))+'이다.'),
      line('구하는 값은 '+m(integral(n(0),n(2),fn('f'))+minus+integral(n(2),n(4),fn('f'))+eq+n(4)+minus+p(n(-4))+eq+n(8))+'이다.')
    ]);
  const hard=make('정적분으로 정의된 함수와 실근','도전 · 증감과 교점의 개수',
    '함수 '+m(fn('G')+eq+integral(n(0),x,t+p(t+minus+n(2))+p(t+minus+n(4)),t))+'에 대하여 방정식 '+m(fn('G')+eq+v('k'))+'가 닫힌구간 '+m(o('[')+n(-1)+o(',')+n(5)+o(']'))+'에서 서로 다른 세 실근을 갖도록 하는 실수 '+m(v('k'))+'의 값은?',
    [2,3,4,5,6].map(n),2,[
      line('정적분을 계산하면 '+m(fn('G')+eq+frac(pow(x,2)+pow(p(x+minus+n(4)),2),n(4)))+'이다. '+m(fn('G',n(-1))+eq+fn('G',n(5))+eq+q(25,4))+', '+m(fn('G',n(0))+eq+fn('G',n(4))+eq+n(0))+', '+m(fn('G',n(2))+eq+n(4))+'이다.'),
      line(m(v('G')+o('′')+p(x)+eq+x+p(x+minus+n(2))+p(x+minus+n(4)))+'의 부호에서 '+m(fn('G'))+'는 '+m(o('[')+n(-1)+o(',')+n(0)+o(']'))+', '+m(o('[')+n(2)+o(',')+n(4)+o(']'))+'에서 감소하고 나머지 두 구간에서 증가한다.'),
      line(m(n(0)+o('<')+v('k')+o('<')+n(4))+'이면 실근은 4개이고, '+m(v('k')+eq+n(0))+' 또는 '+m(n(4)+o('<')+v('k')+o('≤')+q(25,4))+'이면 2개이다. '+m(v('k')+o('<')+n(0))+' 또는 '+m(v('k')+o('>')+q(25,4))+'이면 실근이 없다.'),
      line(m(v('k')+eq+n(4))+'일 때 실근은 '+m(n(2)+minus+n(2)+'<msqrt><mn>2</mn></msqrt>')+', '+m(n(2))+', '+m(n(2)+plus+n(2)+'<msqrt><mn>2</mn></msqrt>')+'로 모두 주어진 구간에 속한다. 따라서 구하는 값은 '+m(n(4))+'이다.')
    ]);
  const timed=[];
  // Eight distinct items in each of three families. Exact rational arithmetic only.
  for(let c=1;c<=8;c++){
    const polynomial=n(c)+pow(x,2)+plus+n(c+1)+x;
    const answerNumerator=8*c+6*(c+1), answerDenominator=3;
    const options=[-6,-3,0,3,6].map(d=>q(answerNumerator+d,answerDenominator));
    timed.push(make('다항함수의 정적분','시간 연습 '+(timed.length+1),m(integral(n(0),n(2),p(polynomial)))+'의 값은?',options,2,[
      line('구하는 값은 '+m(frac(n(8*c),n(3))+plus+n(2*(c+1))+eq+q(answerNumerator,answerDenominator))+'이다.')
    ]));
  }
  for(let a=2;a<=9;a++){
    const polynomial=n(a)+x+minus+pow(x,2), numer=a*a*a;
    const options=[-4,-2,0,2,4].map(d=>q(numer+d,6));
    timed.push(make('곡선과 좌표축 사이의 넓이','시간 연습 '+(timed.length+1),
      '곡선 '+m(y+eq+polynomial)+'과 '+m(x)+'축으로 둘러싸인 부분의 넓이는?',options,2,[
      line(m(n(0)+o('≤')+x+o('≤')+n(a))+'에서 '+m(n(a)+x+minus+pow(x,2)+o('≥')+n(0))+'이다.'),
      line('구하는 넓이는 '+m(integral(n(0),n(a),p(polynomial))+eq+q(numer,6))+'이다.')
    ]));
  }
  for(let c=1;c<=8;c++){
    const answer=2*c+2;
    timed.push(make('적분으로 정의된 함수의 미분','시간 연습 '+(timed.length+1),
      '함수 '+m(fn('F')+eq+integral(n(0),x,p(x+minus+t)+p(n(c)+t+plus+n(1)),t))+'에 대하여 '+m(v('F')+o('′')+p(n(2)))+'의 값은?',
      [-2,-1,0,1,2].map(d=>n(answer+d)),2,[
        line('적분식을 전개하여 미분하면 '+m(v('F')+o('′')+p(x)+eq+integral(n(0),x,p(n(c)+t+plus+n(1)),t)+eq+frac(n(c)+pow(x,2),n(2))+plus+x)+'이다.'),
        line('따라서 구하는 값은 '+m(v('F')+o('′')+p(n(2))+eq+n(answer))+'이다.')
      ]));
  }
  window.FinalsIntegralBank={easy,middle,hard,timed};
})();
