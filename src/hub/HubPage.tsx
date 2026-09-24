import type { CSSProperties } from "react";
import { MODULES } from "@/pocs/registry";
import { signFace } from "./fonts";
import { Stall, VacantStall } from "./Stall";
import styles from "./hub.module.css";

const ARCHITECTURE_DOC = "https://github.com/cskwork/korea-saas-poc/blob/main/docs/ARCHITECTURE.md";
const REPOSITORY = "https://github.com/cskwork/korea-saas-poc";

/** "가-01", "나-07": row letter + unit number, like the plates in a market arcade. */
const plateFor = (row: 0 | 1, unit: number) => `${row === 0 ? "가" : "나"}-${String(unit).padStart(2, "0")}`;

/**
 * The hub: a market arcade's guide map. Shops line both sides of a central aisle
 * with their signs facing it; the unit at the aisle's end stays vacant, and any
 * unit left over in the lower row is drawn vacant too, so the plan never has a hole.
 */
export function HubPage() {
  const perRow = Math.ceil(MODULES.length / 2);
  const upper = MODULES.slice(0, perRow);
  const lower = MODULES.slice(perRow);
  const lowerGaps = perRow - lower.length;
  const endCapUnit = MODULES.length + lowerGaps + 1;
  const plan = { "--units": perRow } as CSSProperties;

  return (
    <div className={`${styles.root} ${signFace.variable}`}>
      <header className={styles.entrance}>
        <div className={styles.board}>
          <div className={styles.boardLead}>
            <h1 className={styles.title}>한국형 1인 SaaS 10선</h1>
            <p className={styles.promise}>
              AI 시대에 혼자 운영할 수 있는 열 가지 사업을, 실제로 돌아가는 가게로 차렸습니다. 간판을 눌러 들어가 직접
              써 보세요.
            </p>
          </div>
          <div className={styles.directory}>
            <p className={styles.directoryTitle}>
              <span className={styles.lamp} aria-hidden />
              점포 안내 · {MODULES.length}개 가게 영업 중
            </p>
            {/* Mirrors the plan below for sighted visitors; the stalls carry the same names for assistive tech. */}
            <ol className={styles.directoryList} role="list" aria-hidden>
              {MODULES.map((meta, index) => (
                <li key={meta.slug}>
                  <span>{plateFor(index < perRow ? 0 : 1, meta.order)}</span>
                  {meta.name}
                </li>
              ))}
            </ol>
          </div>
        </div>
      </header>

      <main className={styles.plan} style={plan}>
        <h2 className={styles.visuallyHidden}>상가 안내도: 가게를 골라 들어가세요</h2>

        <div className={styles.arcade}>
          <ol className={styles.row} role="list">
            {upper.map((meta, index) => (
              <Stall key={meta.slug} meta={meta} plate={plateFor(0, meta.order)} side="upper" index={index} />
            ))}
          </ol>

          <div className={styles.aisle} aria-hidden>
            <span className={styles.youAreHere}>
              <span className={styles.youAreHereDot} />
              현재 위치 · 입구
            </span>
            <span className={styles.aisleLabel}>중앙 통로</span>
          </div>

          <ol className={styles.row} role="list" start={perRow + 1}>
            {lower.map((meta, index) => (
              <Stall key={meta.slug} meta={meta} plate={plateFor(1, meta.order)} side="lower" index={perRow + index} />
            ))}
            {Array.from({ length: lowerGaps }, (_, gap) => (
              <VacantStall
                key={`gap-${gap}`}
                plate={plateFor(1, MODULES.length + gap + 1)}
                href={ARCHITECTURE_DOC}
                side="lower"
              />
            ))}
            <VacantStall plate={plateFor(1, endCapUnit)} href={ARCHITECTURE_DOC} side="lower" endCap />
          </ol>
        </div>

        <p className={styles.titleBlock}>
          <span>1층 안내도</span>
          <span>
            가게 {MODULES.length} · 빈 점포 {lowerGaps + 1}
          </span>
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
              주문을 받고, 예약을 확정하고, 글을 발행해도 됩니다. 가게마다 있는 ‘데모 데이터 초기화’로 언제든 처음
              상태로 돌아갑니다.
            </dd>
          </div>
          <div>
            <dt>AI 기능은 늘 답합니다</dt>
            <dd>
              AI로 글이나 시안을 만드는 가게에서는, API 키가 연결되어 있으면 Claude가 쓰고 없으면 준비된 한국어 템플릿이
              대신 씁니다. 결과에 어느 쪽이 썼는지 표시됩니다.
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
