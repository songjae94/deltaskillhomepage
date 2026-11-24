# 수능 자료만들기 인쇄 문항 등록

이 폴더에는 공개 PDF로 내려받고 인쇄할 수 있도록 승인된 기출만 배포한다. 수능 공부의 화면 이용 권한과 모의고사 출제 권한은 별도로 관리한다.

`files/`에 문항별로 검토한 원본 PDF를 놓고 `catalog.json`의 `questions`에 아래 필드를 채운다. 배포 폴더의 파일은 주소로 직접 열 수 있으므로 공개 승인이 먼저다. 여러 쪽짜리 문항은 해설이나 다른 문항이 섞이지 않은 단일 PDF로 준비한다.

| 필드 | 기입할 값 |
|---|---|
| `id`, `version` | 문항 키와 실제 검토한 판. 한 키에는 현재 공개 판 한 개만 둔다. |
| `examKind`, `examTitle`, `questionNumber` | 수능은 `csat`, 모의평가는 `mock_assessment`. 실제 시험명과 문항 번호를 넣는다. |
| `unit`, `points` | 확인된 단원명과 숫자 2, 3, 4 중 실제 배점. |
| `difficulty` | 4점은 `tag`에 `standard` 또는 `advanced`, `reviewedVersion`에 난도 검토 판을 넣는다. 2점과 3점은 생략할 수 있다. |
| `release` | `scope`는 `public-print`, `status`는 `approved`, `reviewedVersion`은 위 판과 같아야 한다. `evidenceId`에는 공개해도 되는 승인 참조 키를 넣는다. |
| `pdf` | `path`는 `/app/public-data/csat-print/files/파일이름.pdf`. 파일이름은 영문·숫자·하이픈·밑줄. `sha256`은 원본의 소문자 64자리 해시, `pages`는 실제 쪽수. |

A4 지면은 그대로 합치고 다른 크기는 비율을 유지해 A4에 맞춘다. 원본 PDF와 합본에서 수식, 그림, 선지 줄바꿈을 확인한다. 공개를 철회할 때는 대장 행과 배포된 PDF를 함께 회수한다.
