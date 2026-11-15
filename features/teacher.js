(() => {
  const source=new URLSearchParams(location.search);
  const exam=source.get('exam')==='csat'?'csat':'school';
  const audience=['student','teacher','academy'].includes(source.get('audience'))?source.get('audience'):'teacher';
  const context=new URLSearchParams({exam,audience});
  if(source.has('palette'))context.set('palette',source.get('palette'));
  document.querySelector('#home-return').href='../home.html?'+context+'#instructor';
  const headerLinks=document.querySelectorAll('header a');
  headerLinks[0].href='../index.html?'+context;
  headerLinks[1].href='../guide/index.html?'+context;
  headerLinks[1].textContent=audience==='student'?'학생 이용 안내 →':'수업 자료 이용 안내 →';
  context.set('from','teacher');document.querySelector('#variation').href='variation.html?'+context;
})();
