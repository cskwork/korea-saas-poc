import { formatNumber, formatTime } from "@/core/format";
import { TIER_LABEL } from "../../domain/tiers";
import type { IssueReport } from "../../server/store/issues";
import { OpenCurveChart } from "../charts/OpenCurveChart";
import { percent, shortDate } from "../format";
import { SampleNote, SectionHead } from "../ui/SectionHead";
import styles from "./report.module.css";

const RECIPIENT_ROWS = 60;

/** What happened after sending: one send row per recipient, opens and clicks simulated. */
export function SendReport({ report, number, publishedAt }: { report: IssueReport; number: number; publishedAt: Date }) {
  const { summary } = report;
  const shown = report.recipients.slice(0, RECIPIENT_ROWS);
  return (
    <section className={styles.report} aria-labelledby="send-report">
      <SectionHead
        id="send-report"
        title={`제${number}호 발송 기록`}
        aside={<SampleNote>발송 행은 실제 기록, 오픈·클릭은 시뮬레이션</SampleNote>}
      />
      <p className={styles.statement}>
        {shortDate(publishedAt)} {formatTime(publishedAt)}에 <strong>{formatNumber(summary.recipients)}명</strong>에게 보냈고,
        지금까지 <strong>{formatNumber(summary.opens)}명</strong>({percent(summary.openRate)})이 열고{" "}
        <strong>{formatNumber(summary.clicks)}명</strong>({percent(summary.clickRate)})이 링크를 눌렀어요.
      </p>

      <div className={styles.grid}>
        <div className={styles.curve}>
          <h3 className={styles.subhead}>발송 후 48시간 누적 오픈</h3>
          {report.curve.length > 1 ? (
            <OpenCurveChart curve={report.curve} recipients={summary.recipients} />
          ) : (
            <p className={styles.quiet}>방금 보냈어요. 한 시간쯤 지나면 오픈 곡선이 그려져요.</p>
          )}
        </div>
        <div>
          <h3 className={styles.subhead}>등급별</h3>
          <table className={styles.table}>
            <caption className={styles.caption}>등급별 수신·오픈·클릭</caption>
            <thead>
              <tr>
                <th scope="col">등급</th>
                <th scope="col">수신</th>
                <th scope="col">오픈</th>
                <th scope="col">클릭</th>
              </tr>
            </thead>
            <tbody>
              {report.byTier.map((row) => (
                <tr key={row.tier}>
                  <th scope="row">{TIER_LABEL[row.tier]}</th>
                  <td>{formatNumber(row.recipients)}</td>
                  <td>{percent(row.openRate)}</td>
                  <td>{percent(row.clickRate)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <h3 className={styles.subhead}>받은 사람</h3>
      <div className={styles.recipientsWrap}>
        <table className={styles.table}>
          <caption className={styles.caption}>
            먼저 연 순서 · {formatNumber(shown.length)}명 표시
            {report.recipients.length > shown.length && ` (전체 ${formatNumber(report.recipients.length)}명)`}
          </caption>
          <thead>
            <tr>
              <th scope="col">이름</th>
              <th scope="col">이메일</th>
              <th scope="col">등급</th>
              <th scope="col">연 시각</th>
              <th scope="col">클릭</th>
            </tr>
          </thead>
          <tbody>
            {shown.map((row) => (
              <tr key={row.id}>
                <th scope="row">{row.name ?? "명부에서 지운 구독자"}</th>
                <td className={styles.email}>{row.email}</td>
                <td>{TIER_LABEL[row.tier]}</td>
                <td>{row.openedAt ? `${shortDate(row.openedAt)} ${formatTime(row.openedAt)}` : "—"}</td>
                <td>{row.clickedAt ? "눌렀음" : "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
