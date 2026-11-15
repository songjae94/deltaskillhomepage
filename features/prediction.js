const predictions = [
  {"key": "C9", "subject": "공통", "number": 9, "page": 9, "topics": ["접선의 방정식", "속도와 가속도", "속도와 거리(위치·움직인 거리)"]},
  {"key": "C10", "subject": "공통", "number": 10, "page": 11, "topics": ["지수함수·로그함수의 그래프(점의 좌표·도형)", "삼각함수의 그래프와 삼각방정식", "로그의 성질과 계산"]},
  {"key": "C11", "subject": "공통", "number": 11, "page": 13, "topics": ["속도와 거리(위치·움직인 거리)", "정적분으로 정의된 함수", "극한값이 존재할 조건으로 다항함수 구하기"]},
  {"key": "C12", "subject": "공통", "number": 12, "page": 15, "topics": ["사인법칙·코사인법칙", "등비수열의 일반항과 합", "등차수열의 일반항과 합"]},
  {"key": "C13", "subject": "공통", "number": 13, "page": 17, "topics": ["정적분과 넓이", "접선의 방정식", "극한값이 존재할 조건으로 다항함수 구하기"]},
  {"key": "C14", "subject": "공통", "number": 14, "page": 19, "topics": ["사인법칙·코사인법칙", "거듭제곱근이 자연수가 될 조건", "삼각함수의 그래프와 삼각방정식"]},
  {"key": "C15", "subject": "공통", "number": 15, "page": 21, "topics": ["극한값이 존재할 조건으로 다항함수 구하기", "정적분으로 정의된 함수", "정적분과 넓이"]},
  {"key": "C20", "subject": "공통", "number": 20, "page": 23, "topics": ["삼각함수의 그래프와 삼각방정식", "지수함수·로그함수의 그래프(점의 좌표·도형)", "수열의 조건과 합으로 추론"]},
  {"key": "C21", "subject": "공통", "number": 21, "page": 25, "topics": ["극한값이 존재할 조건으로 다항함수 구하기", "미분가능성(절댓값·구간별 함수)", "도함수의 조건으로 다항함수 구하기"]},
  {"key": "C22", "subject": "공통", "number": 22, "page": 27, "topics": ["지수함수·로그함수의 그래프(점의 좌표·도형)", "수열의 귀납적 정의(경우 나누기·거꾸로 추적)", "지수함수와 로그함수의 관계(역함수·대칭·평행이동)"]},
  {"key": "H27", "subject": "확률과 통계", "number": 27, "page": 29, "topics": ["조건이 있는 경우의 수(배열·함수의 개수)", "이산확률변수의 평균과 분산", "정규분포와 표준정규분포"]},
  {"key": "H28", "subject": "확률과 통계", "number": 28, "page": 31, "topics": ["조건부확률", "조건이 있는 경우의 수(배열·함수의 개수)", "독립시행의 확률(반복 시행)"]},
  {"key": "H29", "subject": "확률과 통계", "number": 29, "page": 33, "topics": ["조건이 있는 경우의 수(배열·함수의 개수)", "정규분포와 표준정규분포", "이항분포와 정규분포의 관계"]},
  {"key": "H30", "subject": "확률과 통계", "number": 30, "page": 35, "topics": ["조건이 있는 경우의 수(배열·함수의 개수)", "이산확률변수의 평균과 분산", "독립시행의 확률(반복 시행)"]},
  {"key": "M27", "subject": "미적분", "number": 27, "page": 37, "topics": ["합성함수·역함수의 미분법", "음함수·매개변수로 나타낸 함수의 미분법", "평면 운동에서 속도와 가속도"]},
  {"key": "M28", "subject": "미적분", "number": 28, "page": 39, "topics": ["음함수·매개변수로 나타낸 함수의 미분법", "역함수의 정적분", "함수의 관계식(합성함수) 조건으로 추론"]},
  {"key": "M29", "subject": "미적분", "number": 29, "page": 41, "topics": ["등비급수", "음함수·매개변수로 나타낸 함수의 미분법", "등비수열의 수렴 조건"]},
  {"key": "M30", "subject": "미적분", "number": 30, "page": 43, "topics": ["함수의 그래프와 극값·방정식의 실근", "역함수의 정적분", "함수의 관계식(합성함수) 조건으로 추론"]}
];
(() => {
  const subject=document.querySelector('#subject'), number=document.querySelector('#number'), topic=document.querySelector('#topic');
  const params=new URLSearchParams(location.search);
  const item=predictions.find(x=>x.key===params.get('item')) || predictions.find(x=>x.key==='C14');
  const exact=[
    [/사인법칙·코사인법칙/,'공통 12번 유형서'],
    [/거듭제곱근이 자연수가 될 조건/,'공통 14번 유형서'],
    [/삼각함수의 그래프와 삼각방정식/,'공통 20번 유형서'],
    [/지수함수·로그함수의 그래프/,'공통 22번 유형서'],
    [/극한값이 존재할 조건/,'공통 21번 유형서'],
    [/정적분과 넓이/,'공통 13번 유형서'],
    [/정적분으로 정의된 함수/,'공통 11번 유형서'],
    [/조건이 있는 경우의 수/,'확률과 통계 29번 유형서'],
    [/정규분포와 표준정규분포/,'확률과 통계 27번 유형서'],
    [/음함수·매개변수/,'미적분 27번 유형서'],
    [/함수의 관계식\(합성함수\)/,'미적분 28번 유형서'],
    [/등비수열의 수렴 조건/,'미적분 29번 유형서']
  ];
  const pdf='../materials/files/2027수능_예상분석.pdf#page=';
  function render() {
    const row=predictions.find(x=>x.key===number.value), rank=Number(topic.value), title=row.topics[rank];
    document.querySelector('#where').textContent=row.subject+' '+row.number+'번 · '+(rank+1)+'순위';
    document.querySelector('#chosen').textContent=title;
    document.querySelector('#task').textContent=rank===0?'분석서의 6월·9월 문항에서 이 주제에 해당하는 조건을 찾아보세요. 다음 쪽에서 지난 수능의 같은 번호와 비교할 수 있습니다.':'두 모의평가 문항을 읽고 선택한 주제가 어느 조건에 해당하는지 비교하세요. 다음 쪽에는 이 번호의 기출 이력과 연습 방향이 있습니다.';
    const report=document.querySelector('#report'),practice=document.querySelector('#practice'),related=document.querySelector('#related');
    report.href=pdf+row.page;report.textContent=row.page+'쪽 · 번호별 분석 ↗';
    practice.href=pdf+(row.page+1);practice.textContent=(row.page+1)+'쪽 · 기출 이력과 연습 방향 ↗';
    const match=exact.find(([pattern])=>pattern.test(title));
    if(match){related.href='../materials/index.html?'+new URLSearchParams({exam:'csat',audience:'student',item:match[1]});related.textContent=match[1]+' · 이 주제의 교재 구성 보기 →';}
    else {related.href=pdf+'8';related.textContent='8쪽 · 6월·9월 문항 찾아보기 ↗';}
    const u=new URL(location.href);u.searchParams.set('item',row.key);u.searchParams.set('rank',String(rank+1));try{history.replaceState(null,'',u);}catch{}
  }
  function topics(rank=0){
    const row=predictions.find(x=>x.key===number.value);
    topic.replaceChildren(...row.topics.map((name,i)=>new Option((i+1)+'순위 · '+name,i)));
    topic.value=String(rank);render();
  }
  function numbers(key,rank=0){
    const list=predictions.filter(x=>x.subject===subject.value);
    number.replaceChildren(...list.map(x=>new Option(x.number+'번',x.key)));number.value=key||list[0].key;topics(rank);
  }
  subject.value=item.subject;numbers(item.key,[1,2,3].includes(Number(params.get('rank')))?Number(params.get('rank'))-1:0);
  subject.onchange=()=>numbers();number.onchange=()=>topics();topic.onchange=render;
})();
