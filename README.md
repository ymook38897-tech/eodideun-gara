# 어디든 가라 — 유배지 발령센터

담당자 감자가 대한민국 어딘가로 발령해 드립니다. 국가기관과 무관한 무료 정적 웹 앱입니다.

서비스: https://ymook38897-tech.github.io/eodideun-gara/

저장소: https://github.com/ymook38897-tech/eodideun-gara

## 실행

Node.js 24 권장. `npm ci`, `npm run dev`. 프로덕션: `npm run build`, `npm run preview`.

React 19 + TypeScript + Vite 7 + Tailwind CSS 4 + Lucide SVG. 서버·유료 API·외부 추적 도구 없이 실행합니다. 마스코트는 직접 제작한 SVG, 효과음은 Web Audio입니다.

## 기능

- 기존 17개 지역 분류, 공식 최하위 행정구역 후보 256곳
- 상권·역세권·관광명소 146곳(서울 73곳), 행정구역과 분리된 추첨 목록
- 전국/시도/시군구/상권 선택, 부분 선택 체크박스, 중복 없는 후보 칩
- 부분 일치·별칭·초성 검색, 직접 입력 100곳까지, 개별 삭제와 전체 비우기
- 검증된 localStorage 저장·복원, 최근 30회 기록, 최근 5회 화면 표시
- 후보별 동등 확률, 지역 분류별 균형 모드, 최근 결과 제외
- 보안 난수, 결과 확정 후 감속 애니메이션, 재추첨 중복 실행 방지
- 결과 URL 직접 접근·복원, Web Share API 및 복사, 카카오맵 검색 링크
- 모바일 별도 배치, 키보드 조작, 라이브 결과 안내, 동작 감소 설정 존중
- 기본 꺼짐 효과음, 마우스를 보는 감자와 숨겨진 민원 응답

## 데이터 출처와 기준

행정구역은 [행정표준코드관리시스템](https://www.code.go.kr/stdcode/regCodeL.do)의 **법정동코드 전체자료** 공식 ZIP에서 `존재` 코드만 추출했습니다. 다운로드: 2026-10-10 (한국 시간). ZIP 내부 파일 배포 시각: **2026-10-01 09:06**. 과거 폐지 코드는 포함하지 않습니다. 시·군·구 및 일반구 269개를 `data/official-admin.json`에 보관하고 테스트에서 전수 대조합니다. 코드 전체 ZIP SHA-256은 `data/sources.json`에 기록합니다.

일반구가 있는 시 13개는 선택 계층에 남고 최종 추첨 후보에서는 빠집니다. 따라서 최하위 후보는 **256개**입니다. 세종은 하위 시군구 없이 단일 후보이며 제주의 제주시·서귀포시는 행정시입니다.

사용자의 선택에 따라 기존 17개 분류를 유지했습니다. 광주광역시·전라남도는 탐색 분류로만 사용하며 현재 공식 명칭인 **전남광주통합특별시**를 결과·상세에 병기합니다. 이 두 분류를 서로 다른 현재 광역자치단체라고 주장하지 않습니다. 인천은 제물포·영종·서해·검단 등을 포함한 11개 시군구, 화성은 만세·효행·병점·동탄구를 반영합니다.

상권은 법정 행정구역이 아닙니다. 이름과 연관 구를 `src/data.ts`에 별도로 관리하며 여러 구에 걸친 역세권(강남역, 사당, 신촌 등)은 `districtIds` 배열로 표현합니다. 경계를 임의 좌표로 만들지 않습니다. 부모별 숫자를 합하면 겹친 상권 때문에 총 후보 수와 다를 수 있으나 후보 자체는 유일한 ID로 한 번만 추첨됩니다.

상권 이름·관광지의 존재와 대표 위치 확인에 사용한 공식 안내:

- [서울관광재단 Visit Seoul](https://korean.visitseoul.net/attractions?curPage=1), [서울 도보관광](https://dobo.visitseoul.net/reserve/step1/list?cos_cd=99&lang=kr&type=1), [서대문구 신촌 관광 안내](https://www.sdm.go.kr/culture/attraction/sub2050.do)
- [부산관광공사 Visit Busan](https://www.visitbusan.net/kr/index.do), [부산 공식 시티투어 노선](https://citytourbusan.com/ko/file/citytourbusan.pdf)
- [제주관광공사 공식 관광 가이드북](https://www.visitjeju.net/pdf/Official%20Jeju%20Tourism%20Guidebook_kr.pdf), [협재 안내](https://www.visitjeju.net/kr/detail/view?contentsid=CONT_000000000500697), [애월 한담 안내](https://www.visitjeju.net/kr/detail/view?contentsid=CONT_000000000500682)
- [한국관광공사 대한민국 구석구석](https://korean.visitkorea.or.kr) 및 각 지자체 관광 안내. 상권의 세밀한 법정 경계·영업 정보는 제공하지 않습니다.

## 확률과 저장

`crypto.getRandomValues()`로 32비트 정수를 얻고 rejection sampling으로 나머지 연산 편향을 제거합니다. 기본 모드는 현재 선택 후보 N개 각각 1/N. 균형 모드는 후보가 있는 17개 탐색 분류(+직접 입력 그룹) 중 먼저 동등하게 하나를 뽑고, 그 안에서 동등하게 추첨합니다. 광주권/전남권을 각각 한 그룹으로 처리하는 정책은 UI에 설명됩니다.

당첨을 확정한 다음 표시용 후보 순환을 실행합니다. 마지막 표시값은 확정된 당첨입니다. 0개는 안내 후 중지, 1개도 같은 절차로 진행하며 최근 결과 제외로 모두 소진되면 안내합니다. 효과음은 기본 꺼짐. 동작 감소 설정에서는 긴 연출을 생략합니다.

후보와 기록은 해당 브라우저에만 저장됩니다. 사용자 지정 후보는 URL 공유 시 이름이 링크에 포함됩니다. 사용자 입력은 React 텍스트로 출력하며 HTML로 해석하지 않습니다. 공유 URL은 공식 ID 또는 길이 제한된 사용자 지정 이름만 복원합니다. 지도는 위치를 단정하지 않고 텍스트 검색을 엽니다.

## 검증

`npm test`: 공식 데이터 전수 대조, 부모 후보 제외, 예외 구조, ID 유일성, 별칭·초성, 그룹 선택, 입력 정규화, 난수 편향 제거, 모드 확률 구조, 손상된 저장값, 결과 URL 등 **18개 테스트**.

`npm run lint`: TypeScript ESLint + React Hooks. `npm run build`: strict TypeScript 검사 + 프로덕션 번들.

검증 과정과 실제 브라우저 결과는 `VALIDATION.md`에 기록합니다. CI는 push 때 lint→test→build를 통과한 산출물만 배포합니다.

## 배포

GitHub Pages를 선택했습니다. 정적 무료 호스팅과 GitHub 버전 관리가 한 계정에 묶이고 별도 Vercel 인증이 필요 없기 때문입니다. Vercel Hobby도 이 개인 정적 앱을 지원하지만 추가 서비스 연결이 필요합니다.

저장소 Settings → Pages → Source는 **GitHub Actions**입니다. `.github/workflows/deploy.yml`이 자동 배포합니다. Vite `base: './'`로 저장소 하위 경로의 assets를 처리하고, 라우터 대신 쿼리스트링을 사용해 공유 결과와 새로고침이 별도 rewrite 없이 동작합니다.

## 향후 개선

상권별 공식 출처 URL을 개별 레코드에 연결하고 데이터 갱신 절차를 자동화할 수 있습니다. 후보의 여행 테마/거리 필터, OG 결과 이미지 생성도 개선 후보입니다. 현재 공유 링크의 플랫폼 미리보기는 사이트 공통 정보이며 결과 이름은 페이지를 열면 표시됩니다.
