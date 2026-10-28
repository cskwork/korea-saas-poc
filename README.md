# 한국형 1인 SaaS 10선

혼자 운영할 수 있는 한국형 SaaS 열 가지를, 하나의 Next.js 앱·하나의 Postgres·하나의 Vercel 프로젝트 위에 독립 모듈로 만든 저장소입니다.

- 라이브: https://korea-saas-poc.vercel.app (허브), 글품: https://korea-saas-poc.vercel.app/ai-content-agency
- 이 문서는 저장소 전체를 짧게 소개하고, **글품(`ai-content-agency`)** 모듈의 브라우저 안 Postgres 구조를 자세히 다룹니다.

![글품 현황 화면: 게시 기간 타임라인, 단계별 의뢰, 이번 달 장부](src/pocs/ai-content-agency/.impeccable/review/desktop.png)

## 해결하려는 문제

열 개의 비즈니스 모델을 각각 따로 배포하면 DB·배포·테넌시를 열 번 만들어야 합니다. 이 저장소는 플랫폼(`src/core/`)을 한 번 만들고,
제품은 자기 Postgres 스키마와 UI만 가진 모듈(`src/pocs/<slug>/`)로 붙입니다.

글품은 블로그·상품 설명·광고 카피 의뢰를 접수 → 작성중 → 검수 → 납품완료로 관리하는 콘텐츠 대행 데모입니다. 공개 데모라서
방문자 데이터가 서로 섞이면 안 되고, 서버 DB가 없어도 새로고침 뒤에 남아야 합니다. 그래서 글품의 데이터는 방문자 브라우저 안의
PGlite(WASM Postgres)에 IndexedDB로 저장하고, 서버와 같은 마이그레이션과 저장소 코드를 그대로 씁니다.

## 아키텍처

```mermaid
flowchart LR
    V[방문자 브라우저] --> PX[src/proxy.ts<br/>모든 페이지 · ksp_ws 쿠키]
    PX -->|/ai-content-agency/*| RW[next.config.ts<br/>beforeFiles rewrite]
    RW --> GP[app/geulpum-demo<br/>URL 매칭만]
    GP --> RD[demo/renderer.tsx<br/>클라이언트 렌더]
    RD --> QA[demo/queries.ts<br/>demo/actions.ts]
    QA --> ST[server/store/*<br/>workspaceId로 거르는 저장소 함수]
    ST --> BDB[(PGlite in IndexedDB<br/>geulpum-demo-v1-id)]
    SC[scripts/prepare-geulpum-demo.mjs] -->|0000 + 0003 SQL, wasm| AS[public/geulpum-demo-assets]
    AS --> BDB

    PX -->|다른 9개 모듈| SA[app/slug 페이지<br/>server actions]
    SA --> ST2[pocs/slug/server/store]
    ST2 --> DB[(Postgres 또는 PGlite<br/>core/db/connection.ts)]
    MG[drizzle/*.sql] --> DB
```

- 글품 경로: 서버는 셸 HTML만 보내고, 데이터 읽기·쓰기는 모두 브라우저에서 일어납니다. 자세한 순서도와 실패 처리는
  [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md#글품-브라우저-안의-postgres)에 있습니다.
- 나머지 모듈 경로: 쿠키 워크스페이스, 서버 액션, `DATABASE_URL`이 있으면 Postgres, 없으면 PGlite.

## 핵심 기술 결정

- **글품 데이터는 방문자 브라우저의 PGlite(IndexedDB)에 둡니다.** `next.config.ts`의 rewrite가 글품 주소를 클라이언트 렌더러로
  보내고, `src/pocs/ai-content-agency/demo/database.ts`가 `idb://geulpum-demo-v1-<uuid>`를 엽니다. 워크스페이스 UUID는
  `localStorage`에 있습니다. [ADR 0001](docs/adr/0001-geulpum-browser-pglite.md)
- **서버와 같은 마이그레이션·저장소 코드를 브라우저에서 실행합니다.** `scripts/prepare-geulpum-demo.mjs`가
  `drizzle/0000_platform.sql`과 `drizzle/0003_ai-content-agency.sql`을 정적 에셋으로 복사하고, 브라우저 액션
  (`demo/actions.ts`)은 `server/store/*`를 그대로 부릅니다. `demo/context.tsx`의 `GeulpumActions` 타입이 서버 액션과 브라우저
  액션의 모양을 typecheck로 맞춥니다.
- **탭 하나만 쓰고, 성공 표시 전에 IndexedDB에 동기화합니다.** `demo/database.ts`가 Web Lock을 잡고(2초 제한),
  `relaxedDurability: false`로 연 뒤 액션마다 `syncToFs()`를 기다립니다. 저장 실패를 숨기는 메모리 DB 대체는 없습니다.
  [ADR 0002](docs/adr/0002-geulpum-single-writer-explicit-sync.md)
- **모듈마다 Postgres 스키마, 모든 행은 워크스페이스 소유입니다.** 글품은 `ai_content_agency` 스키마에 테이블 7개를 두고, 모두
  `workspace_id`(`ON DELETE CASCADE`)를 가집니다. 시드는 `src/core/modules/lifecycle.ts`의 `seedModuleIfNeeded`가 워크스페이스·모듈당
  한 번만 실행합니다. [ADR 0003](docs/adr/0003-module-schemas-and-workspace-tenancy.md)
- **의뢰는 한 단계씩만 움직이고, 납품한 원고는 잠깁니다.** `domain/pipeline.ts`의 `canMove`, `server/store/orders.ts`의
  `moveOrder`(상태 변경과 이력 기록을 한 트랜잭션으로), `server/store/drafts.ts`의 `DELIVERED_LOCK`.

## 모듈

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

글품을 뺀 모듈은 방문자마다 쿠키(`ksp_ws`)로 **개인 데모 워크스페이스**를 서버 DB에 만들고, 처음 들어가는 순간 샘플 데이터를 채웁니다.
글품은 같은 일을 방문자 브라우저 안에서 합니다. 어느 쪽이든 다른 방문자에게 영향이 없고, 제품마다 ‘데모 데이터 초기화’로 되돌릴 수 있습니다.

글품 브라우저 데모의 시안은 한국어 기본 템플릿(`domain/templates.ts`)이 씁니다. Claude 호출은 서버 페이지(`GEULPUM_BROWSER_DEMO=off`)에서만
쓰입니다.

## 실행

```bash
npm ci
npm run dev          # http://localhost:3000 (predev가 글품 브라우저 에셋을 준비)
```

필요한 것은 Node.js 20.9+ 하나입니다(`package.json`의 `engines`). `DATABASE_URL`이 없으면 서버 모듈은 내장 Postgres(PGlite)를
`.data/pglite`에 쓰고, 첫 실행 때 마이그레이션까지 스스로 적용합니다.

## 테스트

```bash
npm run lint && npm run typecheck   # ESLint, tsc --noEmit
npm test                            # Vitest: 도메인 단위 + 인메모리/파일 PGlite 통합 테스트 (Docker 불필요)
npm run build && npm run test:e2e   # Playwright 스모크 (desktop + mobile)
```

2026-10-28 실행 결과 (`docs/portfolio-depth` 브랜치, Node 22):

| 명령 | 결과 |
|---|---|
| `npm run lint`, `npm run typecheck` | 통과 (로컬) |
| `npm test` | 테스트 파일 74개, 테스트 540개: **540 통과 / 0 실패 / 0 건너뜀** (GitHub Actions, ubuntu-latest) |
| `npm run build` 후 `npx playwright test` | **46 통과 / 0 실패** (로컬 PGlite, CI Postgres 16 모두) |

참고: 같은 날 부하가 높은 로컬 macOS에서는 `demo/database.test.ts`(파일 PGlite를 닫고 다시 여는 테스트)가 30초 제한을 넘겨
539 통과 / 1 실패로 끝난 실행이 있었습니다. 같은 기기의 앞선 실행과 CI에서는 통과했습니다.

글품만 돌리려면 `npx vitest run src/pocs/ai-content-agency` (파일 7개, 테스트 58개)입니다. 브라우저 DB의 핵심 동작은
`demo/database.test.ts`(마이그레이션 1회 적용, 다시 연 뒤 데이터·버전·납품 잠금 유지, 다른 워크스페이스에서 안 보임)와
`demo/actions.test.ts`(동기화가 끝나기 전에는 성공 표시·이동 없음)가 고정합니다.

CI(`.github/workflows/ci.yml`)는 push(`main`)와 pull request마다 lint, typecheck, `npm test`를 돌리고, 별도 잡에서 Postgres 16
서비스로 마이그레이션 드리프트 검사, `db:migrate`, `build`, Playwright 스모크를 돌립니다.

### 이 브랜치에서 고친 결함

`main`의 CI가 `src/pocs/micro-saas/server/store.test.ts`의 "seeds a sample shop with a live book around today"에서 날짜에 따라
실패했습니다. 시드(`src/pocs/micro-saas/db/seed.ts`)가 취소된 예약에도 빈 좌석을 요구해서, 날짜별 난수 흐름에 따라 오늘 예약장에
취소 건이 빠지는 날이 있었습니다(`occupancy`는 취소 건을 좌석으로 세지 않습니다). 취소 건은 좌석 검사를 건너뛰게 고쳤고,
`src/pocs/micro-saas/db/seed.test.ts`가 2026년 366일 전체를 확인합니다(수정 전 `2026-01-03`에서 실패).

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
| `npm run dev` / `build` / `start` | Next.js 개발 서버 / 프로덕션 빌드(webpack) / 실행 |
| `npm run check` | lint + typecheck + 테스트 |
| `npm test` | Vitest (도메인 단위 테스트 + PGlite 통합 테스트) |
| `npm run test:e2e` | Playwright 스모크 테스트 (`npm run build` 후) |
| `npm run db:generate` | 스키마 변경 → `/drizzle`에 SQL 마이그레이션 생성 |
| `npm run db:migrate` | 마이그레이션 적용 (`DATABASE_URL` 또는 내장 DB) |
| `npm run db:up` / `db:down` | Docker Postgres 시작 / 중지 |

## 환경 변수

전체 목록과 설명은 [`.env.example`](.env.example)에 있습니다. 모두 선택 사항입니다.

| 변수 | 용도 |
|---|---|
| `DATABASE_URL` | Postgres 연결. 비우면 PGlite |
| `ANTHROPIC_API_KEY`, `ANTHROPIC_MODEL` | 서버 모듈의 AI 기능에 Claude 사용 (없으면 한국어 템플릿으로 동작) |
| `AI_DAILY_LIMIT` | 워크스페이스당 하루 Claude 호출 수 (기본 30) |
| `CRON_SECRET` | 워크스페이스 정리 크론 보호 |
| `WORKSPACE_TTL_DAYS` | 미사용 데모 워크스페이스 보관 기간 (기본 30일) |
| `NEXT_PUBLIC_SITE_URL` | 메타데이터·사이트맵용 공개 주소 |
| `GEULPUM_BROWSER_DEMO` | `off`면 글품을 브라우저 데모 대신 원래 서버 페이지로 서비스 (`next.config.ts`) |

## Vercel 배포 (프로젝트 하나)

1. Vercel에서 이 저장소를 Import 합니다. `vercel.json`이 프레임워크(Next.js), 빌드 명령(`npm run build:vercel`), 서울 리전(`icn1`),
   크론을 지정하므로 추가 설정이 필요 없습니다.
2. **Storage → Marketplace → Neon**(Postgres)을 연결하면 `DATABASE_URL`이 자동으로 들어갑니다.
   빌드가 마이그레이션을 먼저 적용한 뒤 앱을 빌드합니다.
3. Environment Variables에 `CRON_SECRET`(임의의 긴 문자열)과, 원하면 `ANTHROPIC_API_KEY`를 추가합니다.
4. 배포 후 `https://<도메인>/api/health`에서 `"driver": "postgres"`를 확인합니다.

DB를 연결하지 않아도 배포는 동작합니다. 이 경우 서버 모듈은 인스턴스 메모리의 PGlite를 쓰므로 데이터가 일시적이며,
헬스 체크의 `persistent`가 `false`로 표시됩니다. 글품 데이터는 이와 상관없이 방문자 브라우저에 남습니다.

## 구조

```
src/app/        라우트 (얇게)          src/core/   플랫폼: DB, 테넌시, 모듈, AI, 액션, 포맷
src/pocs/<slug> 제품 모듈 (독립)        src/hub/    허브(카탈로그) 페이지
drizzle/        SQL 마이그레이션        e2e/        Playwright 스모크 테스트
src/pocs/ai-content-agency/demo/       글품 브라우저 데모 (DB 수명, 읽기, 액션, 렌더러)
```

자세한 설계와 새 모듈 추가 방법은 [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md), 결정 기록은 [docs/adr/](docs/adr/),
코드 규칙은 [AGENTS.md](AGENTS.md)에 있습니다.

## 한계와 다음 단계

- 글품 브라우저 DB는 스키마 버전 `1`만 압니다. 이미 만들어진 방문자 DB에는 이후 바뀐 마이그레이션이 적용되지 않으므로,
  글품 스키마를 바꾸려면 `demo/database.ts`의 버전 처리를 먼저 넓혀야 합니다.
- 같은 브라우저에서 글품 탭은 하나만 쓸 수 있습니다(두 번째 탭은 오류). 기기 간 동기화나 서버 백업은 없습니다.
- 첫 방문 때 PGlite wasm·data 파일을 내려받습니다. 이 저장소에는 그 크기나 로딩 시간을 잰 수치가 없습니다.
- 브라우저 데모는 Claude를 부르지 않고 템플릿 시안만 씁니다.
- 서버 모듈의 테넌시는 애플리케이션의 `workspaceId` 필터에 기대고, Postgres RLS는 쓰지 않습니다.

## 디자인

각 제품은 impeccable 방법론으로 자기 세계관을 따로 설계했습니다. 제품 폴더마다 `PRODUCT.md`(제품 맥락),
`DESIGN.md`(토큰·컴포넌트·규칙), `.impeccable/`(방향 계약, 리뷰 캡처, 디자인 사이드카)가 있습니다.

## 데이터에 대해

모든 고객·주문·매출 수치는 샘플 데이터입니다. 요금제 금액은 비즈니스 모델 예시이며 실제 판매 가격이 아닙니다.
