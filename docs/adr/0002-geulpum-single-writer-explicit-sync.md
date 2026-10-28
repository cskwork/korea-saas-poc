# ADR 0002: 글품 브라우저 DB는 탭 하나만 쓰고, 성공을 알리기 전에 디스크(IndexedDB)에 동기화한다

- 상태: 채택 (커밋 `83c9a64`, 2026-10-10)
- 관련 코드: `src/pocs/ai-content-agency/demo/database.ts`, `src/pocs/ai-content-agency/demo/actions.ts`

## 배경

PGlite의 `idb://` 저장소(IDBFS)는 메모리의 파일 시스템을 IndexedDB로 내려 쓰는 방식이라 쓰는 쪽이 하나여야 합니다.
`database.ts`의 주석에 따르면 PGlite 0.5.8의 트랜잭션은 IDBFS 동기화를 기다리지 않고 커밋됩니다. 그래서 저장 직후 페이지를
옮기거나 탭을 닫으면, 화면에는 성공으로 보였지만 IndexedDB에는 없는 변경이 생길 수 있습니다.

## 결정

1. **쓰는 탭 하나**: `navigator.locks.request("geulpum-demo-database-v1", { signal: AbortSignal.timeout(2000) }, …)`로
   잠금을 잡고, 문서가 떠날 때(`pagehide`)까지 놓지 않습니다. 2초 안에 못 잡으면 "다른 탭에서 열려 있어요" 오류를 보여 줍니다.
2. **휘발 저장소로 내려가지 않음**: IndexedDB나 Web Locks가 없으면 데모를 열지 않고 오류를 보여 줍니다.
3. **성공 전에 동기화**: `relaxedDurability: false`로 열고, 시드 직후와 모든 브라우저 액션 뒤에 `client.syncToFs()`를 기다립니다
   (`persistDemoChanges()`). 동기화가 끝난 뒤에야 화면 갱신 이벤트(`geulpum-demo-change`)를 보내고 `window.location.assign`으로
   이동합니다.
4. `pagehide`에서 DB를 닫고, bfcache로 돌아오면(`pageshow`의 `persisted`) 다시 읽습니다.

## 결과

- "저장했어요"가 보이면 IndexedDB에 이미 있습니다. `demo/actions.test.ts`가 순서를 고정합니다: 동기화 약속이 끝나기 전에는
  갱신 이벤트도 페이지 이동도 일어나지 않습니다.
- 같은 브라우저에서 글품 탭을 두 개 열면 두 번째 탭은 2초 뒤 오류를 보여 줍니다. 탭 간 공유는 지원하지 않습니다.
- 액션마다 전체 동기화를 기다리므로 쓰기마다 지연이 붙습니다. 이 저장소에는 그 지연을 잰 수치가 없습니다.

## 검토한 대안

- **`relaxedDurability: true`(비동기 동기화)**: 빠르지만 성공 표시 뒤 데이터가 사라질 수 있습니다.
- **잠금 없이 여러 탭 허용**: IDBFS는 탭 간 병합을 하지 않으므로, 나중에 닫힌 탭이 다른 탭의 변경을 덮어쓸 수 있습니다.
- **PGlite multi-tab worker**: 탭 하나가 DB를 갖고 나머지가 그 탭에 질의하는 방식입니다. 이 저장소에서는 쓰지 않았습니다.
