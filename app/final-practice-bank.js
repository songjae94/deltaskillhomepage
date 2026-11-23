window.DSFinalPracticeBank = [
  {
    "id": "g1-01",
    "grade": 1,
    "level": 1,
    "version": "final-v1",
    "unit": "집합의 연산",
    "prompt": "두 집합 $A,B$에 대하여 $n(A)=9$, $n(B)=7$, $n(A\\cup B)=12$이다. $n(A\\cap B)$를 구하시오.",
    "answer": 4,
    "solution": "합집합에서 두 번 센 원소를 한 번 빼므로 $9+7-12=4$이다."
  },
  {
    "id": "g1-02",
    "grade": 1,
    "level": 1,
    "version": "final-v1",
    "unit": "명제와 조건",
    "prompt": "실수 $x$에 대한 명제 ‘$x\\ge a$이면 $x>2$이다’가 참이 되게 하는 가장 작은 정수 $a$를 구하시오.",
    "answer": 3,
    "solution": "$a=2$이면 $x=2$가 반례이다. $a>2$이면 모든 $x\\ge a$가 조건을 만족하므로 가장 작은 정수는 $3$이다."
  },
  {
    "id": "g1-03",
    "grade": 1,
    "level": 2,
    "version": "final-v1",
    "unit": "합성함수",
    "prompt": "$f(x)=2x-3$, $g(x)=x^2+1$일 때 $(f\\circ g)(-2)$의 값을 구하시오.",
    "answer": 7,
    "solution": "안쪽 함수부터 계산하면 $g(-2)=5$이고 $f(5)=7$이다."
  },
  {
    "id": "g1-04",
    "grade": 1,
    "level": 2,
    "version": "final-v1",
    "unit": "역함수",
    "prompt": "일차함수 $f(x)=ax+2$의 역함수가 $f^{-1}(14)=4$를 만족시킨다. $f(3)$의 값을 구하시오.",
    "answer": 11,
    "solution": "$f(4)=14$이므로 $4a+2=14$, 즉 $a=3$이다. 따라서 $f(3)=11$이다."
  },
  {
    "id": "g1-05",
    "grade": 1,
    "level": 2,
    "version": "final-v1",
    "unit": "유리함수의 점근선",
    "prompt": "함수 $y=\\dfrac{ax+5}{x-2}$의 두 점근선이 만나는 점이 $(2,3)$이다. 이 함수의 그래프에서 $x=3$일 때의 $y$좌표를 구하시오.",
    "answer": 14,
    "solution": "식을 $a+\\dfrac{2a+5}{x-2}$로 고치면 수평 점근선은 $y=a$이다. $a=3$을 대입하면 $x=3$에서 $y=14$이다."
  },
  {
    "id": "g1-06",
    "grade": 1,
    "level": 3,
    "version": "final-v1",
    "unit": "무리함수의 치역",
    "prompt": "구간 $1\\le x\\le5$에서 $f(x)=\\sqrt{2x-1}+2$의 최댓값과 최솟값의 곱을 구하시오.",
    "answer": 15,
    "solution": "근호 안이 증가하므로 양 끝점에서 최솟값 $3$과 최댓값 $5$를 얻는다. 곱은 $15$이다."
  },
  {
    "id": "g1-07",
    "grade": 1,
    "level": 3,
    "version": "final-v1",
    "unit": "무리방정식",
    "prompt": "방정식 $\\sqrt{3x+4}=x$의 모든 실근의 합을 구하시오.",
    "answer": 4,
    "solution": "우변이 음수가 될 수 없으므로 $x\\ge0$이다. 제곱하면 $(x-4)(x+1)=0$이며 원래 식을 만족하는 값은 $4$뿐이다."
  },
  {
    "id": "g1-08",
    "grade": 1,
    "level": 4,
    "version": "final-v1",
    "unit": "유리함수와 교점",
    "prompt": "실수 $k$에 대하여 직선 $y=x+k$와 곡선 $y=\\dfrac{-9}{x-1}+2$가 한 점에서 만난다. 가능한 모든 $k$의 곱을 구하시오.",
    "answer": -35,
    "solution": "$t=x-1$로 두면 $t^2+(k-1)t+9=0$이다. 상수항이 9여서 $t=0$은 해가 아니다. 판별식이 0이므로 $k=7,-5$이고 곱은 $-35$이다."
  },
  {
    "id": "g2-01",
    "grade": 2,
    "level": 1,
    "version": "final-v1",
    "unit": "함수의 극한",
    "prompt": "$\\displaystyle\\lim_{x\\to3}\\dfrac{x^2-9}{x-3}$의 값을 구하시오.",
    "answer": 6,
    "solution": "$x\\ne3$에서 분자를 인수분해하여 약분하면 $x+3$이다. 극한값은 $6$이다."
  },
  {
    "id": "g2-02",
    "grade": 2,
    "level": 1,
    "version": "final-v1",
    "unit": "미분계수",
    "prompt": "함수 $f(x)=x^3-2x$에 대하여 $f'(2)$의 값을 구하시오.",
    "answer": 10,
    "solution": "$f'(x)=3x^2-2$이므로 $f'(2)=12-2=10$이다."
  },
  {
    "id": "g2-03",
    "grade": 2,
    "level": 2,
    "version": "final-v1",
    "unit": "접선의 방정식",
    "prompt": "곡선 $y=x^2-3x+2$ 위의 점 $(3,2)$에서의 접선이 $y$축과 만나는 점의 $y$좌표를 구하시오.",
    "answer": -7,
    "solution": "접선의 기울기는 $2\\cdot3-3=3$이다. $y-2=3(x-3)$에 $x=0$을 대입하면 $y=-7$이다."
  },
  {
    "id": "g2-04",
    "grade": 2,
    "level": 2,
    "version": "final-v1",
    "unit": "극대와 극소",
    "prompt": "함수 $f(x)=x^3-3x^2+5$의 극댓값에서 극솟값을 뺀 값을 구하시오.",
    "answer": 4,
    "solution": "$f'(x)=3x(x-2)$의 부호는 양, 음, 양 순이다. 극댓값은 $f(0)=5$, 극솟값은 $f(2)=1$이다."
  },
  {
    "id": "g2-05",
    "grade": 2,
    "level": 2,
    "version": "final-v1",
    "unit": "부정적분",
    "prompt": "다항함수 $F$가 $F'(x)=6x-2$, $F(1)=5$를 만족시킨다. $F(3)$의 값을 구하시오.",
    "answer": 25,
    "solution": "적분하면 $F(x)=3x^2-2x+C$이다. $F(1)=5$에서 $C=4$이므로 $F(3)=25$이다."
  },
  {
    "id": "g2-06",
    "grade": 2,
    "level": 3,
    "version": "final-v1",
    "unit": "정적분과 넓이",
    "prompt": "곡선 $y=x(3-x)$와 $x$축으로 둘러싸인 부분의 넓이를 $S$라 할 때 $2S$의 값을 구하시오.",
    "answer": 9,
    "solution": "교점의 $x$좌표는 $0,3$이고 그 사이에서 곡선은 $x$축 위에 있다. $S=\\displaystyle\\int_0^3(3x-x^2)\\,dx=\\dfrac92$이다."
  },
  {
    "id": "g2-07",
    "grade": 2,
    "level": 3,
    "version": "final-v1",
    "unit": "속도와 이동 거리",
    "prompt": "수직선 위의 점의 시각 $t$에서의 속도가 $v(t)=2t-4$이다. $t=0$부터 $t=5$까지 이동한 거리를 구하시오.",
    "answer": 13,
    "solution": "$t=2$에서 진행 방향이 바뀐다. 속도의 절댓값 그래프에서 두 삼각형의 넓이는 $\\dfrac{2\\cdot4}{2}=4$, $\\dfrac{3\\cdot6}{2}=9$이다. 이동 거리는 $13$이다."
  },
  {
    "id": "g2-08",
    "grade": 2,
    "level": 4,
    "version": "final-v1",
    "unit": "정적분으로 정의된 함수",
    "prompt": "$F(x)=\\displaystyle\\int_0^x(t^2-4t+a)\\,dt$가 $x=1$에서 극값을 갖는다. 구간 $0\\le x\\le4$에서 $F(x)$의 최댓값을 $M$이라 할 때 $3M$을 구하시오.",
    "answer": 4,
    "solution": "$F'(1)=0$에서 $a=3$이고 $F'(x)=(x-1)(x-3)$이다. 양 끝점과 두 극점에서 $F(0)=0$, $F(1)=\\dfrac43$, $F(3)=0$, $F(4)=\\dfrac43$이므로 $3M=4$이다."
  }
];
