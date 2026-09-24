import Link from "next/link";
import { Plus } from "lucide-react";
import { formatNumber, formatPercent, formatWon } from "@/core/format";
import { COMMISSION_MODEL_LABEL } from "../../domain/catalog";
import { formatRate } from "../../domain/commission";
import { payoutState } from "../../domain/metrics";
import type { ProgramReport } from "../../server/reports";
import { Band, Empty, Page, Section, ui } from "../ui/primitives";
import styles from "./programs.module.css";

type Entry = ProgramReport["programs"][number];

function baseRate(entry: Entry): string {
  const { program } = entry;
  if (program.model === "cps") return `판매가의 ${formatRate(program.defaultRateBp)}`;
  if (program.model === "cpa") return `건당 ${formatWon(program.defaultFixedWon)}`;
  return "광고 클릭 수익";
}

/** Index of the single best value (ties or all-zero → none), for the red "최고" sticker. */
function bestIndex(values: number[]): number {
  const max = Math.max(...values);
  if (max <= 0 || values.filter((v) => v === max).length > 1) return -1;
  return values.indexOf(max);
}

function MeasuredRow({ label, entries, value, format }: { label: string; entries: Entry[]; value: (e: Entry) => number; format: (v: number) => string }) {
  const values = entries.map(value);
  const best = entries.length > 1 ? bestIndex(values) : -1;
  return (
    <tr>
      <th scope="row">{label}</th>
      {entries.map((entry, index) => (
        <td key={entry.program.id}>
          <span className={values[index] > 0 ? styles.value : `${styles.value} ${styles.muted}`}>
            {format(values[index])}
            {index === best ? (
              <span className={styles.best} aria-label="가장 높음">
                최고
              </span>
            ) : null}
          </span>
        </td>
      ))}
    </tr>
  );
}

export function ProgramsScreen({ report, saved, deleted }: { report: ProgramReport; saved: boolean; deleted: boolean }) {
  const entries = report.programs;
  const text = (label: string, pick: (e: Entry) => string) => (
    <tr>
      <th scope="row">{label}</th>
      {entries.map((entry) => (
        <td key={entry.program.id}>{pick(entry) || <span className={styles.muted}>-</span>}</td>
      ))}
    </tr>
  );

  return (
    <>
      <Band
        title="제휴 프로그램 비교"
        lead="프로그램 조건과, 이 워크스페이스에서 실제로 측정된 성과를 나란히 봐요."
        actions={
          <Link href="/affiliate-marketing/programs/new" className={ui.primary}>
            <Plus aria-hidden />
            프로그램 추가
          </Link>
        }
      >
        <p className={styles.caveat}>조건은 참고용 메모예요. 수수료율과 정산 기준은 자주 바뀌니 가입 전 각 프로그램의 최신 약관을 확인하세요.</p>
      </Band>
      <Page>
        {saved || deleted ? (
          <p role="status" className={`${ui.noticeOk} ${ui.stamp}`}>
            {deleted ? "프로그램을 삭제했어요." : "프로그램을 추가했어요."}
          </p>
        ) : null}
        <Section id="compare" title="조건과 성과 비교" note="성과는 최근 30일, 확정 수수료는 누적 기준">
          {entries.length > 0 ? (
            <div className={styles.scroll}>
              <table className={styles.compare}>
                <caption className={ui.srOnly}>제휴 프로그램 비교표</caption>
                <thead>
                  <tr>
                    <td />
                    {entries.map((entry) => (
                      <th key={entry.program.id} scope="col">
                        <span className={styles.programHead}>
                          <span className={styles.programName}>{entry.program.name}</span>
                          <Link href={`/affiliate-marketing/programs/${entry.program.id}`} className={styles.editLink}>
                            조건 수정
                          </Link>
                        </span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr className={styles.group}>
                    <th scope="rowgroup" colSpan={entries.length + 1}>
                      조건 (참고)
                    </th>
                  </tr>
                  {text("수수료 구조", (e) => COMMISSION_MODEL_LABEL[e.program.model])}
                  {text("기본 수수료", baseRate)}
                  {text("정산 주기", (e) => e.program.settlementCycle)}
                  {text("최소 지급액", (e) => (e.program.minPayoutWon > 0 ? formatWon(e.program.minPayoutWon) : ""))}
                  {text("쿠키 기간", (e) => e.program.cookieWindow)}
                  {text("잘 맞는 채널", (e) => e.program.bestChannels)}
                  {text("잘 맞는 카테고리", (e) => e.program.bestCategories)}
                  {text("메모", (e) => e.program.notes)}
                  <tr className={styles.group}>
                    <th scope="rowgroup" colSpan={entries.length + 1}>
                      내 성과
                    </th>
                  </tr>
                  <MeasuredRow label="연결된 링크" entries={entries} value={(e) => e.linkCount} format={(v) => `${formatNumber(v)}개`} />
                  <MeasuredRow label="클릭 (30일)" entries={entries} value={(e) => e.clicks} format={formatNumber} />
                  <MeasuredRow label="전환율" entries={entries} value={(e) => e.cvr} format={(v) => formatPercent(v)} />
                  <MeasuredRow label="클릭당 수익" entries={entries} value={(e) => Math.round(e.epc)} format={formatWon} />
                  <MeasuredRow label="수익 (30일)" entries={entries} value={(e) => e.revenue} format={formatWon} />
                  <MeasuredRow label="확정 수수료 (누적)" entries={entries} value={(e) => e.confirmed} format={formatWon} />
                  <tr>
                    <th scope="row">최소 지급액까지</th>
                    {entries.map((entry) => {
                      const state = payoutState(entry.confirmed, entry.program.minPayoutWon);
                      return (
                        <td key={entry.program.id}>
                          {entry.program.minPayoutWon === 0 ? (
                            <span className={styles.muted}>기준 없음</span>
                          ) : state.reached ? (
                            <span className={styles.reached}>지급 기준 도달</span>
                          ) : (
                            <span className={styles.value}>{formatWon(state.remaining)} 남음</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                </tbody>
              </table>
            </div>
          ) : (
            <Empty
              title="등록된 프로그램이 없어요"
              action={
                <Link href="/affiliate-marketing/programs/new" className={ui.primary}>
                  <Plus aria-hidden />
                  프로그램 추가
                </Link>
              }
            >
              쿠팡 파트너스, 텐핑처럼 가입한 제휴 프로그램을 추가하면 링크를 프로그램별로 묶어 비교할 수 있어요.
            </Empty>
          )}
        </Section>

        <Section id="recommend" title="카테고리별로 잘 버는 프로그램" note="최근 90일, 클릭 30회 이상 모인 조합만 비교해요">
          <div className={ui.panel}>
            <table className={styles.recs}>
              <caption className={ui.srOnly}>카테고리별 추천 프로그램</caption>
              <thead>
                <tr>
                  <th scope="col">카테고리</th>
                  <th scope="col">가장 잘 번 프로그램</th>
                  <th scope="col" className={styles.num}>
                    클릭당 수익
                  </th>
                  <th scope="col" className={`${styles.num} ${styles.hideSm}`}>
                    전환율
                  </th>
                </tr>
              </thead>
              <tbody>
                {report.recommendations.map((rec) => (
                  <tr key={rec.category}>
                    <th scope="row">{rec.category}</th>
                    {rec.best ? (
                      <>
                        <td>
                          {rec.best.programName}
                          {rec.compared > 1 ? <span className={styles.muted}> · {rec.compared}곳 비교</span> : null}
                        </td>
                        <td className={styles.num}>{formatWon(Math.round(rec.best.epc))}</td>
                        <td className={`${styles.num} ${styles.hideSm}`}>{formatPercent(rec.best.cvr)}</td>
                      </>
                    ) : (
                      <td colSpan={3} className={styles.muted}>
                        아직 데이터가 부족해요
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>
      </Page>
    </>
  );
}
