# 어디든 가라 — 지도 찍고 발령받아

서비스: https://ymook38897-tech.github.io/eodideun-gara/

저장소: https://github.com/ymook38897-tech/eodideun-gara

실제 대한민국 지도를 눌러 놀러 갈 곳을 담고, 감자 공무원에게 마지막 결정을 맡기는 정적 웹 앱입니다.

## 실행과 기술

Node.js 24 권장. `npm ci`, `npm run dev`. 검사: `npm run lint`, `npm test`, `npm run build`. 프로덕션 미리보기: `npm run preview`.

React 19 + TypeScript strict + Vite 7 + Tailwind CSS 4 + Leaflet/React Leaflet + Lucide SVG. 직접 만든 SVG 감자, Web Audio 효과음, localStorage. 서버·유료 API·키 없이 동작합니다. 행정 경계와 장소 데이터는 앱과 함께 배포합니다. 확대 11 이상에서 OSM 표준 거리 타일을 표시합니다.

## 지도와 추첨

- 대한민국 실제 GeoJSON 경계: 17개 익숙한 탐색 분류, 최하위 시·군·구 256개.
- 한 번 클릭은 해당 범위의 후보 선택/해제, 이름 옆 ↗는 확대. 경로와 전국 복귀, 휠·드래그·터치 확대를 지원합니다.
- 도시권은 먼저 큰 육지 영역으로 확대합니다. `섬까지 전체 보기`는 원래 좌표의 전체 범위를 보여줍니다. 섬을 임의로 옮기지 않습니다.
- 지역 확대 시 장소를 화면 좌표로 묶어 클러스터 표시하고, 더 확대하면 개별 마커가 나타납니다. 라벨은 겹치면 연결선과 함께 이동합니다.
- 기본 `놀러 갈 곳 뽑기`: 전국 실제 장소 **215곳**, 서울 91곳. 캠퍼스 38곳과 대학가 32곳을 분리하고 상권·역세권·쇼핑·공원·명소 및 요청으로 추가한 함평 아파트 2곳을 제공합니다.
- 인하대학교, 인하대 후문 상권, 인하대 정문 일대, 인하대역은 별도 ID·좌표·유형입니다. 필수 인천 장소와 요청한 전국 대학가를 포함합니다.
- 보조 `행정구역 뽑기`: 공식 최하위 행정구역 **256곳**. 일반구가 있는 부모 시 13개는 선택 범위로 유지하고 별도 당첨 후보로 세지 않습니다.
- 지도·검색·계층 선택·후보 칩이 같은 ID 집합을 사용합니다. 상위 범위와 장소가 겹쳐도 중복 후보가 생기지 않습니다. 추첨 모드 간 후보도 섞이지 않습니다.
- 즉시 검색, 부분 일치·별칭·초성, 검색한 장소로 지도 이동, 현재 선택 장소만 지도에 표시, 장소 유형 표시 필터, 전국 전체 선택/해제.
- 사용자 지정 장소 100개까지. 좌표를 생성하지 않고 목록에만 표시합니다. 선택과 최근 30회 결과를 안전하게 저장·복원합니다.
- 결과 URL 복원, Web Share/복사, 카카오맵 검색 링크, 재추첨, 최근 결과 제외, 기록 초기화.
- 과장된 지도 연출 뒤 당첨 위치로 이동하고 감자가 발표합니다. 카드가 마커를 가리지 않게 지도 중심을 조정합니다. 연출 전에 실제 결과를 확정합니다.
- 효과음 기본 OFF, 감자 눈동자·노동조합 이스터 에그. `prefers-reduced-motion`에서는 긴 연출을 생략합니다.
- PC 중앙 지도와 검색 측면 패널. 모바일 지도 우선, 검색·후보는 접이식 하단 패널. 검색/추첨 후 지도가 화면으로 돌아옵니다.

## 데이터와 라이선스

행정코드: [행정표준코드관리시스템](https://www.code.go.kr/stdcode/regCodeL.do) 법정동코드 전체자료의 `존재` 코드, **2026-10-01 09:06 배포본**, 2026-10-10 확인. 원본 이름·코드 269개를 `data/official-admin.json`에 보관하고 전수 대조합니다. 세종 단일 후보, 제주의 행정시 2개, 인천 11개, 화성 일반구 4개를 반영했습니다. 사용자의 확정에 따라 기존 17개 분류를 유지하되 광주권·전남권의 결과에는 현재 공식 명칭 **전남광주통합특별시**를 표시합니다.

경계: 통계청 [SGIS](https://sgis.kostat.go.kr)의 공공누리 제1유형 행정동 경계, 변경 이력을 반영한 [vuski/admdongkor 2026-07-01](https://github.com/vuski/admdongkor/tree/master/ver20260701), 이를 단순화한 [mapcn-kr 시군구 GeoJSON](https://github.com/DevMinGeonPark/mapcn-kr/blob/main/data/sgg.json). 가공물 **CC BY 4.0**. 원본 Git blob, SHA-256, 병합 방식은 `data/sources.json`, 원문 라이선스는 `data/LICENSE-boundaries.txt`에 기록했습니다. 이 앱은 256개 시군구 코드를 공식 코드와 연결하고 17개 선택 분류로 병합했습니다. 전국/시군구 지도와 섬의 원래 위·경도를 유지합니다. 행정코드와 경계의 기준일은 각각 표시하며 법적 측량용 지도가 아닙니다.

필수 출처 표기: 본 데이터는 통계청 통계지리정보서비스(SGIS)에서 공공누리 제1유형으로 개방한 행정동 경계를 가공한 것이며(가공: vuski/admdongkor, 단순화: mapcn-kr, 17개 분류 병합: 본 서비스), CC BY 4.0으로 배포됩니다.

장소 좌표·주소: **© OpenStreetMap contributors, ODbL 1.0**. 213개 모두 대표 좌표, 주소, 개별 OSM 원본 URL을 가집니다. 각 좌표가 해당 시군구 경계 안에 있는지 테스트합니다. 동명 건물·다른 캠퍼스로 잘못 검색된 결과는 제외하거나 본캠퍼스·역 이름으로 다시 확인했습니다. 미확인 캠퍼스 한 곳은 후보에서 제외했습니다. 개발 과정의 Nominatim 요청은 단일 프로세스, 최소 1.25초 간격, 응답 캐시로 처리했고 런타임 지오코딩은 하지 않습니다.

장소명 및 지역 소속은 `src/places.json`, 검색 일치·원본 분류·대표 지점 대조 내역은 `data/places-audit.json`에서 확인할 수 있습니다. 재배포 가능한 동일 데이터는 사이트의 [data/places.json](https://ymook38897-tech.github.io/eodideun-gara/data/places.json)에 제공합니다. 자세한 이용 조건은 `data/LICENSE-places.md`. 상권은 행정구역이 아니며 표시된 역·거리·문·정류장 등의 대표 지점은 상권 경계 또는 가게 영업 상태를 뜻하지 않습니다. 여러 구에 걸친 생활권은 `districtIds` 배열로 관리합니다.

추가 확인에 사용한 공식 안내: [인하대학교](https://www.inha.ac.kr)의 공식 캠퍼스 안내, [순천대 찾아오시는 길](https://w1.scnu.ac.kr/SCNU/cm/cntnts/cntntsView.do?cntntsId=1121&mi=1185), [전북대학교](https://www.jbnu.ac.kr), [강원대학교 입학안내](https://admission.kangwon.ac.kr/admission/main.do), [인천투어](https://itour.incheon.go.kr/main/main.do), [Visit Seoul](https://korean.visitseoul.net), [Visit Busan](https://www.visitbusan.net), [Visit Jeju](https://www.visitjeju.net).

OSM 표준 타일은 현재 화면만 요청하며 원래 attribution, Referer, HTTP 캐시를 유지합니다. 대량 다운로드·오프라인 저장을 하지 않습니다. [타일 정책](https://operations.osmfoundation.org/policies/tiles/), [Nominatim 정책](https://operations.osmfoundation.org/policies/nominatim/). 표준 타일에는 SLA가 없으며 사용량이 커지면 제공자를 교체해야 합니다. 타일이 없어도 행정 경계와 장소 후보는 배포된 정적 데이터로 동작합니다.

## 확률과 안전한 상태

`crypto.getRandomValues` + rejection sampling. 기본: 현재 모드의 선택 후보 N개 각각 1/N. 균형: 후보가 있는 시도 탐색 분류를 먼저 동일 확률로 선택하고 그 안의 장소를 동일 확률로 선택합니다. 광주권·전남권을 각 그룹으로 세며 사용자 지정 후보는 별도 그룹입니다. 선택 범위의 숫자를 합산해 후보 수를 계산하지 않습니다.

0개·1개·수백 개를 처리하고 이전 결과 제외로 모두 소진되면 안내합니다. 추첨 중 중복 실행과 후보 변경을 막습니다. 저장 데이터와 URL에서 알 수 없는 ID·손상된 JSON을 걸러내고 사용자 지정 장소에 주입된 좌표·HTML을 신뢰하지 않습니다. React 텍스트 출력으로 사용자 입력을 HTML로 실행하지 않습니다. 사용자 지정 공유 URL에는 입력한 이름이 포함됩니다.

## 검증과 배포

기능·데이터, PC/모바일 UI, 프로덕션 배포를 3차로 나눠 검증합니다. `npm test`: **27개 통과**. 공식 행정구역 전수 대조, 17개/256개 경계 일치, 모든 장소 좌표의 소속, 필수 대학가·인하대 분리, 중복 범위와 확률, 클러스터, 좌표 없는 사용자 지정, 검색·저장·공유 URL을 검사합니다. 린트와 strict TypeScript/프로덕션 빌드를 통과합니다. 실제 브라우저 증거와 검증 범위는 `VALIDATION.md`에 기록합니다.

기존 무료 GitHub Pages 배포를 유지합니다. `.github/workflows/deploy.yml`이 main push 때 lint → test → build 후 산출물을 배포합니다. Vite `base: './'`와 `import.meta.env.BASE_URL`로 저장소 하위 경로의 JS/CSS/지도/데이터 주소를 처리합니다. 공유는 쿼리스트링이므로 직접 접속과 새로고침에 rewrite가 필요 없습니다.

향후 확장은 지역별 상권 후보를 더 촘촘히 추가하고, 공식 시설 안내와 OSM 대표 지점의 교차 검증을 정기 갱신하는 것입니다. 현재 POI 목록은 전국의 모든 상권을 망라한 목록이 아닙니다. 모든 시군구 지원은 행정구역 모드에서 제공합니다. Web Share의 실제 메신저 전송과 실기기 두 손가락 핀치는 별도 환경 검증이 필요합니다.

## 2026-10-11 함평 장소 추가

사용자 요청으로 함평읍 백년가아파트(백년가뷰, 영수길 28)와 라포엠아파트(들샘길 50)를 추가했습니다. 전국 후보는 215개이며 아파트를 별도 유형으로 표시합니다. 두 장소의 주소와 대표 좌표는 개별 집품 공개 상세 페이지에 포함된 JSON-LD GeoCoordinates에서 확인했고, OSM 출처로 표시하지 않습니다. 기존 213곳의 출처는 그대로 유지합니다. 각 장소는 고유 ID 하나와 검색 별칭을 가지며 함평군 범위 선택 및 지도·검색·추첨에 함께 반영됩니다.
