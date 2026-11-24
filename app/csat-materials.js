/* Public reading links. The publisher serves each original paper. */
window.DSCSATMaterials = (() => {
  'use strict';
  const samplePDF = 'https://www.moe.go.kr/boardCnts/fileDown.do?m=020402&s=moe&fileSeq=76dc225437d298122bc7000aab130487';
  const ebsPaper = 'https://wdown.ebsi.co.kr/W61001/01exam/';
  const materials = [
    {
      id:'november', year:'2027학년도', title:'대학수학능력시험',
      description:'6월·9월과 비교해 달라진 문항과 다시 풀어 볼 번호를 살펴보세요.',
      details:'델타스킬 분석 읽기',
      body:'<p>9월과 본수능의 공통 13번을 나란히 놓고, 적분 구간을 나누는 기준부터 찾아보세요. 두 시험에서 공통으로 쓰인 판단입니다.</p><p>공통 21번은 따로 시간을 재서 다시 풀어 보세요. 델타스킬은 시행 당일 문항 구성을 비교했을 때, 9월보다 공통 12~15번의 풀이 부담이 줄고 본수능 21번에 판단이 집중됐다고 보았습니다.</p>',
      links:[['수학 원본 시험지','https://cdn2.kice.re.kr/27dae-suneung/27DaeSuneung_2.pdf'],['평가원 문제·정답','https://cdn2.kice.re.kr/27dae-suneung/index.html'],['EBS 출제 경향','https://about.ebs.co.kr/board/bbs?boardId=31&boardTypeId=1&cmd=view&postId=30005657535']]
    },
    {
      id:'september', year:'2027학년도', title:'9월 모의평가',
      description:'공통 12~15번에서 풀이 시간이 길어진 이유를 확인하세요.',
      analysis:['델타스킬 분석 읽기','/report/2027-09/'],
      paperGroup:'선택과목별 원본 시험지',
      links:[['확률과 통계',ebsPaper+'20260902/go3/mathA_1_mun_R9VI9L47.pdf'],['미적분',ebsPaper+'20260902/go3/mathB_1_mun_ZM4M1F58.pdf'],['기하',ebsPaper+'20260902/go3/mathC_1_mun_Q749PEB8.pdf']]
    },
    {
      id:'june', year:'2027학년도', title:'6월 모의평가',
      description:'등급을 가른 다섯 문항에서 내 풀이가 막힌 지점을 찾아보세요.',
      analysis:['델타스킬 분석 읽기','/report/2027-06/'],
      links:[['수학 원본 시험지',ebsPaper+'20260604/go3/math_main_mun_KKD67VZI.pdf']]
    },
    {
      id:'sample', year:'2028학년도', title:'공식 예시문항',
      description:'평가원 안내서의 수학 분석은 책 40쪽, 수학 문제지와 정답표는 108쪽에서 시작합니다.',
      analysis:['평가원 예시문항 안내서',samplePDF],
      links:[['교육부 배포 안내','https://www.moe.go.kr/boardCnts/viewRenew.do?boardID=294&boardSeq=103113&lev=0&m=020402&opType=N&page=1']]
    }
  ];
  function link([name,url],primary=false){
    return `<a class="csm-link${primary?' csm-primary':''}" href="${url.replaceAll('&','&amp;')}">${name}</a>`;
  }
  function card(item){
    const primary=item.analysis?link(item.analysis,true):`<details class="csm-analysis"><summary>${item.details}</summary>${item.body}</details>`;
    const papers=item.links.map(pair=>link(pair)).join('');
    const group=item.paperGroup?`<details class="csm-papers"><summary>${item.paperGroup}</summary><div>${papers}</div></details>`:papers;
    return `<article class="csm-book" data-csat-material="${item.id}"><header><small>${item.year}</small><h3>${item.title}</h3></header><p>${item.description}</p><div class="csm-controls">${primary}${group}</div></article>`;
  }
  function render(){
    return `<section class="csat-materials" aria-label="수능 자료받기"><header class="csm-heading"><h2>무료 분석·기출 자료</h2><p>시험을 골라 분석을 읽거나 원본 문제지를 받아 보세요.</p></header><div class="csm-shelf">${materials.map(card).join('')}</div>
      <aside class="csm-related"><p>6월·9월 모의평가를 함께 분석한 자료</p>${link(['델타스킬 수능 예상 분석서 PDF','/materials/files/2027수능_예상분석.pdf'])}</aside>
      <section class="csm-paid"><h2>유료 변형 시험지·교재</h2><p>현재 판매 중인 수능 변형 자료가 없습니다.</p>${link(['수능 유형서 판매 안내','/store/'])}</section></section>`;
  }
  return Object.freeze({render});
})();
