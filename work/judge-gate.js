/* /work/judge/ 문 (r5 · 2026-11-28): 눈판정 토큰은 /work/ 가 홈페이지 회원 로그인 + 등급 확인 뒤에만 내준다.
   토큰이 없거나 지났으면 이 쪽에서 비밀번호를 묻지 않고 /work/ 로 보낸다. 자료 · 이름 0. */
(() => { let s = null; try { s = JSON.parse(localStorage.getItem('dsj.token')); } catch {}
  if (!(s && s.token && s.exp > Date.now())) location.replace('/work/'); })();
