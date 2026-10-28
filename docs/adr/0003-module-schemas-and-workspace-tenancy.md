# ADR 0003: 모듈마다 Postgres 스키마를 따로 두고, 모든 행을 워크스페이스에 묶는다

- 상태: 채택 (저장소 전체, `docs/ARCHITECTURE.md`에 서술)
- 관련 코드: `src/core/db/connection.ts`, `src/core/modules/lifecycle.ts`, `src/pocs/*/db/schema.ts`, `drizzle/`, `src/proxy.ts`

## 배경

열 개의 제품이 Next.js 앱 하나, 데이터베이스 하나, Vercel 프로젝트 하나를 함께 씁니다. 제품끼리 테이블 이름이 겹치면 안 되고,
공개 데모라서 방문자끼리 데이터가 섞이면 안 됩니다. 로컬과 테스트는 Docker 없이 돌아야 합니다.

## 결정

1. **모듈별 Postgres 스키마**: 각 모듈은 `pgSchema("<slug_underscored>")`에 테이블을 둡니다. 글품은
   `ai_content_agency` 스키마에 7개 테이블(`orders`, `order_events`, `drafts`, `draft_versions`, `portfolio_items`,
   `plan_changes`, `inquiries`)과 6개 enum을 둡니다(`drizzle/0003_ai-content-agency.sql`).
2. **워크스페이스 테넌시**: 모듈 테이블은 모두 `workspace_id`로 `public.workspaces`를 참조하고 `ON DELETE CASCADE`입니다.
   저장소 함수는 `(db, workspaceId, …)`를 받고, 수정·삭제는 `id`와 `workspaceId`를 함께 맞춥니다.
3. **시드는 워크스페이스·모듈당 한 번**: `seedModuleIfNeeded`가 `workspace_modules`의 기본키를 먼저 차지한 트랜잭션 안에서만
   시드합니다. 동시에 들어온 첫 요청이 둘이어도 한 번만 시드합니다. `resetModule`은 그 워크스페이스의 모듈 행만 지우고 다시 시드합니다.
4. **드라이버 두 개, 타입 하나**: `openConnection`은 `DATABASE_URL`이 있으면 postgres.js, 없으면 PGlite를 엽니다.
   Drizzle `Database` 타입 하나로 둘을 다룹니다.

## 결과

- 모듈 하나를 빼려면 그 스키마만 지우면 됩니다. 모듈끼리는 서로 import하지 않습니다.
- 같은 저장소 함수가 서버 Postgres, 테스트의 메모리 PGlite(`src/core/testing/database.ts`), 글품 브라우저 PGlite에서 그대로 돕니다.
  그래서 ADR 0001의 브라우저 데모가 저장소 코드를 새로 쓰지 않아도 됐습니다.
- 테넌시는 애플리케이션 코드의 `workspaceId` 필터에 기대고, Postgres 행 단위 보안(RLS)은 쓰지 않습니다. 필터를 빠뜨린 쿼리는
  저장소별 통합 테스트로 잡아야 합니다(예: `demo/database.test.ts`는 다른 워크스페이스 id로 의뢰를 찾으면 `null`인지 확인합니다).

## 검토한 대안

- **테이블 이름 접두사(`ai_content_agency_orders`)**: 모듈 제거가 테이블 단위 작업이 됩니다.
- **모듈마다 별도 데이터베이스**: Vercel 프로젝트 하나에 연결을 여러 개 둬야 합니다.
- **Docker Postgres로만 테스트**: `docker-compose.yml`은 로컬 선택지로 남아 있지만, 테스트는 PGlite로 Docker 없이 돕니다.
