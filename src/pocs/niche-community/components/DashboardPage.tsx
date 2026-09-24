import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";
import { formatDate, formatMonthDay, formatNumber, formatPercent, formatRelative, formatTime, formatWon } from "@/core/format";
import { lastDayKeys, monthLabel, seoulDateKey } from "../domain/time";
import type { DashboardData, RecentKind } from "../server/data/dashboard";
import { AdminNav } from "./AdminNav";
import { ColumnChart } from "./ColumnChart";
import styles from "./admin.module.css";
import ui from "./ui.module.css";

const RECENT_VERB: Record<RecentKind, string> = {
  join: "합류했어요",
  post: "글을 올렸어요",
  comment: "댓글을 남겼어요",
  upgrade: "프리미엄을 시작했어요",
  downgrade: "무료로 바꿨어요",
  rsvp: "모임에 신청했어요",
};

function TractionSlide({
  title,
  source,
  wide = false,
  children,
}: {
  title: string;
  source: string;
  wide?: boolean;
  children: ReactNode;
}) {
  return (
    <section className={`${ui.slide} ${styles.traction} ${wide ? styles.wide : ""}`} aria-label={title}>
      <h2 className={styles.actionTitle}>{title}</h2>
      <div className={styles.tractionBody}>{children}</div>
      <p className={styles.source}>{source}</p>
    </section>
  );
}

/** The operator's dashboard, laid out as the traction section of the community's own IR deck. */
export function DashboardPage({ data, now }: { data: DashboardData; now: Date }) {
  const { summary, mrr, membership, activity, cohorts, channels, recent, ledger } = data;
  const year = Number(seoulDateKey(now).slice(0, 4));
  const monthCategories = mrr.series.map((point) => ({
    key: point.month,
    label: monthLabel(point.month, year),
    detail: `${point.month.slice(0, 4)}년 ${Number(point.month.slice(5))}월`,
  }));
  const days = lastDayKeys(now, activity.series.length);
  const maxChannel = Math.max(1, ...channels.rows.map((row) => row.posts));

  return (
    <div className={`${ui.page} ${styles.page}`}>
      <header className={styles.header}>
        <div>
          <h1 className={ui.pageTitle}>운영 대시보드</h1>
          <p className={styles.asOf}>
            샘플 데이터 · {formatMonthDay(now)} {formatTime(now)} 기준, 모든 숫자는 이 커뮤니티의 기록에서 계산해요
          </p>
        </div>
        <AdminNav />
      </header>

      <section className={`${ui.slide} ${styles.summary}`} aria-labelledby="nc-summary">
        <h2 id="nc-summary" className={styles.actionTitle}>
          프리미엄 멤버 {summary.premium}명이 매달 {formatWon(summary.mrr)}을 내고 있습니다
        </h2>
        <dl className={styles.kpis}>
          <div>
            <dt>멤버</dt>
            <dd>
              {formatNumber(summary.members)}명
              <span>
                프리미엄 {formatPercent(summary.members ? summary.premium / summary.members : 0, 0)} · 이번 달 +{summary.newThisMonth}
              </span>
            </dd>
          </div>
          <div>
            <dt>MRR</dt>
            <dd>
              {formatWon(summary.mrr)}
              <span>프리미엄 {summary.premium}명 × 9,900원</span>
            </dd>
          </div>
          <div>
            <dt>이번 달 결제</dt>
            <dd>
              {formatWon(summary.collectedThisMonth)}
              <span>{summary.paymentsThisMonth}건 · 데모 결제</span>
            </dd>
          </div>
          <div>
            <dt>30일 활성</dt>
            <dd>
              {formatPercent(summary.activeRate, 0)}
              <span>
                {summary.active30}명 · 7일 {summary.active7}명
              </span>
            </dd>
          </div>
          <div>
            <dt>이번 달 이탈</dt>
            <dd>
              {summary.churn.lost}명
              <span>
                월초 프리미엄 {summary.churn.premiumAtStart}명 중 {formatPercent(summary.churn.rate)}
              </span>
            </dd>
          </div>
          <div>
            <dt>다음 달 재결제율</dt>
            <dd>
              {summary.retention === null ? "–" : formatPercent(summary.retention, 0)}
              <span>첫 결제 후 1개월</span>
            </dd>
          </div>
        </dl>
      </section>

      <div className={styles.deck}>
        <TractionSlide title={mrr.headline} source="출처: 월말 프리미엄 멤버 수 × 월 9,900원 (이번 달은 오늘 기준)">
          <ColumnChart
            label={`월말 MRR. ${mrr.headline}`}
            categories={monthCategories}
            series={[{ key: "mrr", label: "MRR", tone: "lead", values: mrr.series.map((point) => point.amount) }]}
            unit="won"
            highlightLast
          />
        </TractionSlide>

        <TractionSlide title={membership.headline} source="출처: 멤버 가입일과 등급 변경 기록 (운영자 제외, 월말 기준)">
          <ColumnChart
            label={`월말 멤버 구성. ${membership.headline}`}
            categories={monthCategories}
            series={[
              { key: "free", label: "무료", tone: "base", values: membership.series.map((point) => point.free) },
              { key: "premium", label: "프리미엄", tone: "lead", values: membership.series.map((point) => point.premium) },
            ]}
            unit="count"
          />
        </TractionSlide>

        <TractionSlide title={activity.headline} source="출처: 게시글과 댓글 작성 시각 (서울 기준 하루)">
          <ColumnChart
            label={`최근 14일 활동. ${activity.headline}`}
            categories={days.map((day) => ({
              key: day,
              label: String(Number(day.slice(8))),
              detail: formatMonthDay(`${day}T12:00:00+09:00`),
            }))}
            series={[
              { key: "comments", label: "댓글", tone: "base", values: activity.series.map((point) => point.comments) },
              { key: "posts", label: "글", tone: "ink", values: activity.series.map((point) => point.posts) },
            ]}
            unit="count"
            labelEvery={2}
          />
        </TractionSlide>

        <TractionSlide title={cohorts.headline} source="출처: 결제 기록. 첫 결제 달로 묶고, 이후 달마다 다시 결제한 비율">
          {cohorts.rows.length ? (
            <div className={styles.cohortWrap}>
              <table className={styles.cohort}>
                <caption className={ui.srOnly}>첫 결제 달별 재결제 비율</caption>
                <thead>
                  <tr>
                    <th scope="col">첫 결제</th>
                    <th scope="col">인원</th>
                    {cohorts.months.map((_, k) => (
                      <th key={k} scope="col">
                        {k === 0 ? "첫 달" : `+${k}`}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {cohorts.rows.map((row) => (
                    <tr key={row.month}>
                      <th scope="row">{monthLabel(row.month, year)}</th>
                      <td className={ui.num}>{row.size}</td>
                      {cohorts.months.map((_, k) => {
                        const value = row.retained[k];
                        return value === undefined ? (
                          <td key={k} className={styles.cohortEmpty} />
                        ) : (
                          <td
                            key={k}
                            className={styles.cohortCell}
                            style={{ "--share": value } as CSSProperties}
                            data-strong={value >= 0.6}
                          >
                            {formatPercent(value, 0)}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className={ui.status}>아직 결제 기록이 없어요.</p>
          )}
        </TractionSlide>

        <TractionSlide title={channels.headline} source="출처: 최근 30일 게시글">
          <ul className={styles.channelBars} role="list">
            {channels.rows.map((row) => (
              <li key={row.id}>
                <span className={styles.channelName}>
                  {row.name}
                  {row.access === "premium" ? <span className={styles.channelSecret}> · 대외비</span> : null}
                </span>
                <span className={styles.channelTrack} aria-hidden="true">
                  <span style={{ width: `${(row.posts / maxChannel) * 100}%` }} />
                </span>
                <span className={`${styles.channelValue} ${ui.num}`}>{row.posts}개</span>
              </li>
            ))}
          </ul>
        </TractionSlide>

        <TractionSlide title="방금 커뮤니티에서 일어난 일" source="출처: 가입, 글, 댓글, 등급 변경, 모임 신청 기록">
          <ol className={styles.recent}>
            {recent.map((item, index) => (
              <li key={`${item.kind}-${item.at.getTime()}-${index}`}>
                <span className={styles.recentWho}>
                  <Link href={`/niche-community/members/${item.memberId}`}>{item.nickname}</Link> 님이 {RECENT_VERB[item.kind]}
                </span>
                {item.subject && item.targetId ? (
                  <Link
                    href={
                      item.kind === "rsvp" ? `/niche-community/meetups/${item.targetId}` : `/niche-community/posts/${item.targetId}`
                    }
                    className={styles.recentSubject}
                  >
                    {item.subject}
                  </Link>
                ) : null}
                <time className={styles.recentTime} dateTime={item.at.toISOString()}>
                  {formatRelative(item.at, now)}
                </time>
              </li>
            ))}
          </ol>
        </TractionSlide>
      </div>

      <section className={styles.ledger} aria-labelledby="nc-ledger">
        <h2 id="nc-ledger" className={ui.sectionTitle}>
          멤버십 장부
        </h2>
        <div className={styles.ledgerGrid}>
          <table className={styles.ledgerTable}>
            <caption>최근 결제 (데모)</caption>
            <thead>
              <tr>
                <th scope="col">날짜</th>
                <th scope="col">멤버</th>
                <th scope="col" className={styles.right}>
                  금액
                </th>
              </tr>
            </thead>
            <tbody>
              {ledger.charges.map((charge) => (
                <tr key={charge.id}>
                  <td>{formatDate(charge.at)}</td>
                  <td>
                    <Link href={`/niche-community/members/${charge.memberId}`} className={ui.link}>
                      {charge.nickname}
                    </Link>
                  </td>
                  <td className={styles.right}>{formatWon(charge.amountWon)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <table className={styles.ledgerTable}>
            <caption>최근 등급 변경</caption>
            <thead>
              <tr>
                <th scope="col">날짜</th>
                <th scope="col">멤버</th>
                <th scope="col" className={styles.right}>
                  변경
                </th>
              </tr>
            </thead>
            <tbody>
              {ledger.changes.map((change) => (
                <tr key={change.id}>
                  <td>{formatDate(change.at)}</td>
                  <td>
                    <Link href={`/niche-community/members/${change.memberId}`} className={ui.link}>
                      {change.nickname}
                    </Link>
                  </td>
                  <td className={styles.right} data-kind={change.kind}>
                    {change.kind === "upgrade" ? "무료 → 프리미엄" : "프리미엄 → 무료"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
