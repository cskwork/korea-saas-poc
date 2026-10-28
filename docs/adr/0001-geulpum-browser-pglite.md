# ADR 0001: 글품 데모 데이터를 방문자 브라우저의 PGlite(IndexedDB)에 둔다

- 상태: 채택 (커밋 `83c9a64`, `f20680a`, 2026-10-10)
- 관련 코드: `next.config.ts`, `src/app/geulpum-demo/`, `src/pocs/ai-content-agency/demo/`, `scripts/prepare-geulpum-demo.mjs`

## 배경

나머지 아홉 모듈은 서버 데이터베이스를 씁니다. 방문자마다 `ksp_ws` 쿠키로 워크스페이스를 만들고(`src/proxy.ts`),
첫 방문 때 서버가 그 워크스페이스에 샘플 데이터를 시드합니다. 글품(`ai-content-agency`)도 원래 이 방식이었습니다.
이 방식에서 방문자 데이터는 서버 DB에 쌓이고, `DATABASE_URL`이 없는 배포에서는 인스턴스 메모리의 PGlite에 있어서
인스턴스가 바뀌면 사라집니다.

## 결정

글품의 모든 페이지를 브라우저 전용 데모로 돌립니다.

1. `next.config.ts`의 `beforeFiles` rewrite가 `/ai-content-agency/:path*`를 `/geulpum-demo/:path*`로 보냅니다.
   서버는 URL만 맞추고(`src/app/geulpum-demo/[[...path]]/page.tsx`의 `matchRoute`), 데이터는 읽지 않습니다.
2. 클라이언트 렌더러(`demo/renderer.tsx`)가 처음 쓸 때 `demo/queries.ts`와 `demo/actions.ts`를 동적 import합니다.
   SSR 중에는 데이터베이스 코드가 돌지 않습니다.
3. `demo/database.ts`가 브라우저 안에서 PGlite를 `idb://geulpum-demo-v1-<workspaceId>`로 엽니다.
   워크스페이스 id는 `localStorage`의 `geulpum-demo-workspace-v1`에 저장한 무작위 UUID입니다.
4. 스키마는 서버와 같은 Drizzle 마이그레이션 SQL을 씁니다. `scripts/prepare-geulpum-demo.mjs`가
   `drizzle/0000_platform.sql`과 `drizzle/0003_ai-content-agency.sql`을 이어 붙여 `public/geulpum-demo-assets/0.5.8/schema.sql`로
   복사하고(`predev`/`prebuild`), PGlite 0.5.8의 wasm/data 파일도 함께 복사합니다. 버전이 다르면 스크립트가 실패합니다.
5. 브라우저 쪽 읽기·쓰기는 서버와 같은 저장소 함수(`server/store/*`)를 그대로 호출합니다. 컴포넌트는 `demo/context.tsx`의
   `DemoProvider`로 서버 액션 대신 같은 이름·시그니처의 브라우저 액션을 받습니다. `loadActions`가 `GeulpumActions`
   타입으로 선언되어 있어서 두 액션 집합의 모양이 어긋나면 typecheck가 실패합니다.

## 결과

- 방문자 데이터가 서버로 가지 않습니다. 다른 방문자와 섞일 수 없고, 서버 DB 없이도 새로고침·재방문 후 남습니다.
- 마이그레이션·제약 조건·저장소 로직이 서버와 하나라서, 같은 코드를 Node의 파일 PGlite로 검증할 수 있습니다
  (`demo/database.test.ts`: 부팅 → 의뢰·원고·버전·납품 → 닫고 다시 열기 → 데이터와 납품 잠금 유지).
- 첫 방문 때 PGlite wasm과 data 파일을 내려받아야 합니다.
- 브라우저 데모는 Claude를 부르지 않습니다. `demo/queries.ts`의 `getAiMode()`는 항상 `"template"`이고, 시안은 한국어 기본 템플릿
  (`domain/templates.ts`)이 씁니다.
- 브라우저 스키마 버전은 `geulpum_demo_schema` 테이블의 `1` 하나뿐입니다. 이미 만들어진 브라우저 DB에는 이후 바뀐 마이그레이션이
  적용되지 않으므로, 글품 스키마를 바꾸면 버전 처리(또는 `-v1` 이름 교체)를 함께 해야 합니다.
- 데이터는 그 브라우저 프로필에만 있습니다. 기기 간 동기화나 서버 백업은 없습니다.

## 검토한 대안

- **서버 워크스페이스 유지(기존 방식)**: 코드는 그대로 남아 있고 `GEULPUM_BROWSER_DEMO=off`로 다시 켤 수 있습니다.
  방문자 데이터가 서버에 남고, DB가 없는 배포에서는 휘발됩니다.
- **브라우저에서 메모리 PGlite**: 저장 실패를 숨기고 새로고침하면 사라집니다. `database.ts`는 IndexedDB나 Web Locks가 없으면
  메모리로 내려가지 않고 오류를 보여 줍니다.
- **브라우저 전용 데이터 계층을 따로 작성(localStorage 등)**: 서버 저장소 함수와 마이그레이션을 두 벌 관리해야 합니다.
