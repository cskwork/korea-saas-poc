# 한국형 1인 SaaS 10선

AI 시대에 혼자 운영할 수 있는 열 가지 한국형 SaaS 비즈니스 모델을, **실제로 동작하는 제품**으로 만든 저장소입니다.
열 개의 제품이 하나의 Next.js 앱·하나의 데이터베이스·하나의 Vercel 프로젝트를 함께 쓰고, 각 제품은 자기만의
디자인 시스템([impeccable](https://impeccable.style)로 설계)과 데이터 스키마를 가진 독립 모듈입니다.

<!-- MODULE_TABLE:START -->
| # | 제품 | 비즈니스 모델 | 핵심 기능 | 경로 |
|---|---|---|---|---|
| 1 | 글품 | AI 콘텐츠 에이전시 | AI가 시안을 쓰고 에디터가 검수해 마감일에 납품 | `/ai-content-agency` |
| 2 | 스마트셀러 | 스마트스토어 위탁판매 | 도매 소싱부터 발주·마진까지 남는 돈이 보이는 가판대 | `/smart-store` |
| 3 | 예약잇다 | 마이크로 SaaS | 종이 예약장을 옮긴 소상공인 예약 관리 + 고객 예약 페이지 | `/micro-saas` |
| 4 | 에듀마켓 | 온라인 교육 | 시간표형 커리큘럼 빌더와 공개 강의 판매 페이지 | `/online-education` |
| 5 | 링크잇 | 제휴 마케팅 | 클릭 추적 리다이렉트, 전환·수수료 분석, AI 콘텐츠 | `/affiliate-marketing` |
| 6 | AutoMate Pro | 업무 자동화 대행 | ROI 진단, 워크플로 빌더, 견적서, 유지보수 구독 | `/automation-agency` |
| 7 | 펴냄 | 유료 뉴스레터 & 커뮤니티 | 발행·유료 구독·구독자 관리·독자 게시판 | `/newsletter-community` |
| 8 | 크리에이트잇 | AI 디자인 & 영상 제작 | 주문·수정 라운드·납품, AI 콘티 초안 | `/ai-design-video` |
| 9 | DevFlow | 개발 프리랜싱 | 견적→청구→입금(3.3%/부가세), 타이머, 칸반 | `/dev-freelancing` |
| 10 | 스타트업 빌더스 | 니치 커뮤니티 | 유료 멤버십 창업가 커뮤니티, 모임 RSVP, 운영 대시보드 | `/niche-community` |
<!-- MODULE_TABLE:END -->

방문자마다 쿠키로 **개인 데모 워크스페이스**가 만들어지고, 각 제품에 처음 들어가는 순간 샘플 데이터가 채워집니다.
무엇을 바꿔도 다른 방문자에게 영향이 없고, 제품마다 ‘데모 데이터 초기화’로 되돌릴 수 있습니다.

## 빠른 시작

```bash
npm install
npm run dev          # http://localhost:3000
```

설치할 것은 Node.js 20.9+ 하나입니다. `DATABASE_URL`이 없으면 내장 Postgres(PGlite)가 `.data/pglite`에
데이터를 저장하고, 첫 실행 때 마이그레이션까지 스스로 적용합니다.

## 로컬 개발 DB 연결

| 방법 | 설정 | 비고 |
|---|---|---|
| **내장 (기본)** | 아무것도 안 함 | PGlite, `.data/pglite`. 초기화는 폴더 삭제 |
| **Docker Postgres** | `npm run db:up` 후 `.env.local`에 `DATABASE_URL=postgres://postgres:postgres@localhost:5432/korea_saas` | `npm run db:migrate`로 스키마 적용 (dev 서버도 자동 적용) |
| **원격 Postgres** (Neon 개발 브랜치 등) | `.env.local`에 해당 `DATABASE_URL` | pooled 연결 문자열 권장 |

```bash
cp .env.example .env.local   # 필요한 값만 채우세요
npm run db:studio            # Drizzle Studio로 데이터 보기 (내장 DB는 dev 서버를 끄고 실행)
```

## 스크립트

| 명령 | 설명 |
|---|---|
| `npm run dev` / `build` / `start` | Next.js 개발 서버 / 프로덕션 빌드 / 실행 |
| `npm run check` | lint + typecheck + 테스트 |
| `npm test` | Vitest (도메인 단위 테스트 + 인메모리 PGlite 통합 테스트) |
| `npm run test:e2e` | Playwright 스모크 테스트 (`npm run build` 후) |
| `npm run db:generate` | 스키마 변경 → `/drizzle`에 SQL 마이그레이션 생성 |
| `npm run db:migrate` | 마이그레이션 적용 (`DATABASE_URL` 또는 내장 DB) |
| `npm run db:up` / `db:down` | Docker Postgres 시작 / 중지 |

## 환경 변수

전체 목록과 설명은 [`.env.example`](.env.example)에 있습니다. 모두 선택 사항입니다.

| 변수 | 용도 |
|---|---|
| `DATABASE_URL` | Postgres 연결. 비우면 PGlite |
| `ANTHROPIC_API_KEY`, `ANTHROPIC_MODEL` | AI 기능에 Claude 사용 (없으면 한국어 템플릿으로 동작) |
| `AI_DAILY_LIMIT` | 워크스페이스당 하루 Claude 호출 수 (기본 30) |
| `CRON_SECRET` | 워크스페이스 정리 크론 보호 |
| `WORKSPACE_TTL_DAYS` | 미사용 데모 워크스페이스 보관 기간 (기본 30일) |
| `NEXT_PUBLIC_SITE_URL` | 메타데이터·사이트맵용 공개 주소 |

## Vercel 배포 (프로젝트 하나)

1. Vercel에서 이 저장소를 Import 합니다. `vercel.json`이 프레임워크(Next.js), 빌드 명령, 서울 리전(`icn1`),
   크론을 지정하므로 추가 설정이 필요 없습니다. (이전의 정적 사이트 설정에서 Output Directory를 바꿔 두었다면
   프로젝트 설정에서 비워 주세요.)
2. **Storage → Marketplace → Neon**(Postgres)을 연결하면 `DATABASE_URL`이 자동으로 들어갑니다.
   빌드가 마이그레이션을 먼저 적용한 뒤 앱을 빌드합니다.
3. Environment Variables에 `CRON_SECRET`(임의의 긴 문자열)과, 원하면 `ANTHROPIC_API_KEY`를 추가합니다.
4. 배포 후 `https://<도메인>/api/health`에서 `"driver": "postgres"`를 확인합니다.

DB를 연결하지 않아도 배포는 동작합니다. 이 경우 인스턴스 메모리의 PGlite를 쓰므로 데이터가 일시적이며,
헬스 체크의 `persistent`가 `false`로 표시됩니다.

## 구조

```
src/app/        라우트 (얇게)          src/core/   플랫폼: DB, 테넌시, 모듈, AI, 액션, 포맷
src/pocs/<slug> 제품 모듈 (독립)        src/hub/    허브(카탈로그) 페이지
drizzle/        SQL 마이그레이션        e2e/        Playwright 스모크 테스트
```

자세한 설계와 새 모듈 추가 방법은 [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md), 코드 규칙은 [AGENTS.md](AGENTS.md)에 있습니다.

## 디자인

각 제품은 impeccable 방법론으로 자기 세계관을 따로 설계했습니다. 제품 폴더마다 `PRODUCT.md`(제품 맥락),
`DESIGN.md`(토큰·컴포넌트·규칙), `.impeccable/`(방향 계약, 리뷰 캡처, 디자인 사이드카)가 있습니다.

## 데이터에 대해

모든 고객·주문·매출 수치는 샘플 데이터입니다. 요금제 금액은 비즈니스 모델 예시이며 실제 판매 가격이 아닙니다.
