# 09-dev-freelancing POC

## 웹/앱 개발 프리랜싱 플랫폼

한국 프리랜서 개발자를 위한 올인원 비즈니스 관리 도구 POC.

### 주요 기능
1. **포트폴리오 빌더** — 프로젝트 포트폴리오 생성/관리
2. **프로젝트 관리** — 칸반 보드 기반 프로젝트 진행 관리
3. **견적/인보이스** — 견적서/인보이스 자동 생성
4. **고객 관리 (CRM)** — 고객 정보 및 이력 관리
5. **수익/시간 추적** — 매출 대시보드 및 시간 기록
6. **서비스 요금표** — 공개 요금표 페이지

### 실행 방법
```bash
# 로컬 서버 실행
cd pocs/09-dev-freelancing
python3 -m http.server 8009
# 브라우저에서 http://localhost:8009 접속
```

또는 `index.html`을 브라우저에서 직접 열기.

### 기술 스택
- HTML5 / CSS3 / Vanilla JavaScript
- TailwindCSS (CDN)
- localStorage (데이터 저장)
- Canvas API (차트)

### 데이터
- 모든 데이터는 브라우저 localStorage에 저장
- 데모 데이터가 초기 로드 시 자동 생성됨
- 초기화: 브라우저 콘솔에서 `localStorage.clear()` 실행 후 새로고침
