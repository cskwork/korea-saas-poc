import type { CSSProperties } from "react";
import { MODULES } from "@/pocs/registry";
import { signFace } from "./fonts";
import { Stall, VacantStall } from "./Stall";
import styles from "./hub.module.css";

const ARCHITECTURE_DOC = "https://github.com/cskwork/korea-saas-poc/blob/main/docs/ARCHITECTURE.md";
const REPOSITORY = "https://github.com/cskwork/korea-saas-poc";

/** "가-01", "나-07": row letter + catalogue number, like the plates in a market arcade. */
const plateFor = (row: number, position: number) => `${"가나다라"[row] ?? "가"}-${String(position).padStart(2, "0")}`;

/**
 * The hub: a market arcade's guide map. Every module is a shop along the central
 * aisle; the last unit stays vacant to show the building has room for more.
 */
export function HubPage() {
  const unitCount = MODULES.length + 1;
  const perRow = Math.ceil(unitCount / 2);
  const rows = [MODULES.slice(0, perRow), MODULES.slice(perRow)];
  const columns = { "--units": perRow } as CSSProperties;

  return (
    <div className={`${styles.root} ${signFace.variable}`}>
      <header className={styles.entrance}>
        <div className={styles.board}>
          <h1 className={styles.title}>한국형 1인 SaaS 10선</h1>
          <p className={styles.promise}>
            AI 시대에 혼자 운영할 수 있는 열 가지 사업을, 실제로 돌아가는 가게로 차렸습니다. 간판을 눌러 들어가
            직접 써 보세요.
          </p>
          <p className={styles.openPlate}>
            <span className={styles.lamp} aria-hidden />
            {MODULES.length}개 가게 영업 중 · 방문자마다 따로 차려진 데모 가게
          </p>
        </div>
      </header>

      <main className={styles.plan} style={columns}>
        <h2 className={styles.visuallyHidden}>상가 안내도</h2>

        <ol className={styles.row} role="list">
          {rows[0].map((meta, index) => (
            <Stall key={meta.slug} meta={meta} plate={plateFor(0, meta.order)} index={index} />
          ))}
        </ol>

        <div className={styles.aisle} aria-hidden>
          <span className={styles.youAreHere}>
            <span className={styles.youAreHereDot} />
            현재 위치
          </span>
          <span className={styles.aisleLabel}>중앙 통로</span>
        </div>

        <ol className={styles.row} role="list" start={perRow + 1}>
          {rows[1].map((meta, index) => (
            <Stall key={meta.slug} meta={meta} plate={plateFor(1, meta.order)} index={perRow + index} />
          ))}
          <VacantStall plate={plateFor(1, unitCount)} href={ARCHITECTURE_DOC} />
        </ol>

        <p className={styles.titleBlock}>
          <span>1층 안내도</span>
          <span>가게 {MODULES.length} · 빈 점포 1</span>
          <span>매출·고객·주문 수치는 모두 샘플</span>
        </p>
      </main>

      <section className={styles.notice} aria-labelledby="notice-title">
        <h2 id="notice-title" className={styles.noticeTitle}>
          이용 안내
        </h2>
        <dl className={styles.noticeList}>
          <div>
            <dt>가게마다 열쇠가 따로 있습니다</dt>
            <dd>
              처음 들어가는 순간 방문자 전용 데모 데이터가 차려집니다. 내가 바꾼 내용은 다른 방문자의 가게와 섞이지
              않습니다.
            </dd>
          </div>
          <div>
            <dt>마음껏 바꿔 보세요</dt>
            <dd>
              주문을 받고, 예약을 확정하고, 글을 발행해도 됩니다. 각 가게의 ‘데모 데이터 초기화’로 언제든 처음
              상태로 돌아갑니다.
            </dd>
          </div>
          <div>
            <dt>AI 기능은 늘 답합니다</dt>
            <dd>
              API 키가 연결되어 있으면 Claude가 쓰고, 없으면 준비된 한국어 템플릿이 대신 씁니다. 어느 쪽이 썼는지
              결과마다 표시됩니다.
            </dd>
          </div>
        </dl>
      </section>

      <footer className={styles.footer}>
        <p>한 건물, 한 번의 배포: 열 개의 가게가 하나의 Next.js 앱과 하나의 데이터베이스를 나눠 씁니다.</p>
        <p>
          <a href={ARCHITECTURE_DOC} target="_blank" rel="noreferrer">
            구조 문서
          </a>
          <span aria-hidden> · </span>
          <a href={REPOSITORY} target="_blank" rel="noreferrer">
            소스 코드
          </a>
        </p>
      </footer>
    </div>
  );
}
