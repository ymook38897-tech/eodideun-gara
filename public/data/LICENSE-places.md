# 장소 좌표·주소 데이터

© OpenStreetMap contributors. 장소 좌표·주소에서 추출한 데이터베이스는 [Open Database License 1.0 (ODbL)](https://opendatacommons.org/licenses/odbl/1-0/)로 제공합니다.

출처: https://www.openstreetmap.org/copyright

배포본: `public/data/places.json` (사이트의 `data/places.json`에서도 다운로드 가능).
레코드마다 원본 OSM node/way/relation URL을 포함합니다. 상권 위치는 역·거리·문·정류장 등 대표 지점이며 상권의 법적 경계를 의미하지 않습니다. 웹 앱 코드는 이 데이터베이스와 분리되어 있습니다.

Nominatim 공개 API는 개발 과정의 단발성 자료 확인에만 사용했습니다. 단일 프로세스로 요청 사이 최소 1.25초를 두고 모든 응답을 캐시했습니다. 서비스 사용 시 지오코딩 API를 호출하지 않습니다.

API 정책: https://operations.osmfoundation.org/policies/nominatim/
타일 정책: https://operations.osmfoundation.org/policies/tiles/

표준 타일은 브라우저에서 현재 보이는 화면만 요청하고, 타일 확대는 11 이상에서 시작합니다. 대량 다운로드·사전 캐시·오프라인 타일 저장을 하지 않습니다. Leaflet의 기본 attribution을 표시하며 브라우저의 HTTP 캐시와 Referer를 유지합니다. OSM 표준 타일 제공은 SLA가 없으므로 이용량이 커지면 별도 제공자로 바꿔야 합니다.
