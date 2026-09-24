import Link from "next/link";
import clsx from "clsx";
import { formatNumber, formatRelative, seoulDateKey } from "@/core/format";
import { BOARD_CATEGORY_LABEL } from "../../domain/board";
import { CATEGORY_LABEL } from "../../domain/issues";
import { SPONSORSHIP_STATUS_LABEL } from "../../domain/revenue";
import { AUDIENCE_LABEL, AUDIENCE_SHORT } from "../../domain/tiers";
import type { DeskOverview } from "../../server/store/desk";
import type { IssueListRow } from "../../server/store/issues";
import { CirculationChart } from "../charts/CirculationChart";
import { coverInk } from "../cover";
import { dayAndTime, people, percent, shortDate, won } from "../format";
import theme from "../theme.module.css";
import { buttonClass } from "../ui/button";
import { SampleNote, SectionHead } from "../ui/SectionHead";
import ui from "../ui/ui.module.css";
import styles from "./desk.module.css";

export function Desk({ desk }: { desk: DeskOverview }) {
  return (
    <div className={styles.desk}>
      <h1 className={ui.srOnly}>편집실</h1>
      <div className={styles.primary}>
        <NextIssueCover desk={desk} />
        <section className={styles.circulation} aria-labelledby="desk-circulation">
          <SectionHead
            id="desk-circulation"
            title="발행 부수"
            aside={<SampleNote>샘플 명부 기준, 주 마지막 날 집계</SampleNote>}
          />
          <CirculationChart points={desk.circulation} />
        </section>
      </div>
      <div className={styles.secondary}>
        <Lineup desk={desk} />
        <Colophon desk={desk} />
      </div>
      <BoardDigest desk={desk} />
      <AdSlots desk={desk} />
    </div>
  );
}

function IssueNumeral({ number, className }: { number: number; className?: string }) {
  return (
    <p className={clsx(styles.numeral, className)}>
      <span className={styles.numeralAffix}>제</span>
      {number}
      <span className={styles.numeralAffix}>호</span>
    </p>
  );
}

function NextIssueCover({ desk }: { desk: DeskOverview }) {
  const issue = desk.nextIssue;
  const number = issue?.number ?? desk.nextNumber;
  const ink = theme[`ink-${coverInk(number)}`];

  if (!issue) {
    return (
      <section className={clsx(styles.cover, ink)} aria-labelledby="desk-next">
        <IssueNumeral number={number} />
        <h2 id="desk-next" className={styles.coverTitle}>
          다음 호가 아직 비어 있어요
        </h2>
        <p className={styles.coverLede}>
          예약된 호도, 쓰다 만 초안도 없어요. 제{number}호의 첫 문장을 적어 보세요.
        </p>
        <div className={styles.coverActions}>
          <Link href="/newsletter-community/issues/new" className={styles.coverPrimary}>
            새 호 쓰기
          </Link>
        </div>
      </section>
    );
  }

  const sponsor = desk.revenue.deals.find((deal) => deal.issueId === issue.id);
  const when =
    issue.status === "scheduled" && issue.scheduledAt
      ? `${dayAndTime(issue.scheduledAt)} 발행 예약`
      : `초안 · ${formatRelative(issue.updatedAt)} 저장`;

  return (
    <section className={clsx(styles.cover, ink)} aria-labelledby="desk-next">
      <div className={styles.coverTop}>
        <IssueNumeral number={number} />
        <span className={clsx(styles.coverTag, issue.status === "draft" && styles.coverTagDraft)}>
          {issue.status === "scheduled" ? "발행 예약" : "초안"}
        </span>
      </div>
      <h2 id="desk-next" className={styles.coverTitle}>
        {issue.title}
      </h2>
      {issue.lede && <p className={styles.coverLede}>{issue.lede}</p>}
      <ul className={styles.coverMeta} role="list">
        <li>{when}</li>
        <li>
          {AUDIENCE_LABEL[issue.audience]} {people(desk.recipients[issue.audience])}에게
        </li>
        <li>{CATEGORY_LABEL[issue.category]}</li>
        {sponsor && <li>광고 · {sponsor.sponsorName}</li>}
      </ul>
      <div className={styles.coverActions}>
        <Link href={`/newsletter-community/issues/${issue.id}`} className={styles.coverPrimary}>
          이어 쓰기
        </Link>
        <Link href={`/newsletter-community/issues/${issue.id}?view=proof`} className={styles.coverSecondary}>
          교정쇄 보기
        </Link>
      </div>
    </section>
  );
}

function LineupRow({ issue, number }: { issue: IssueListRow; number: number }) {
  const meta =
    issue.status === "published"
      ? `${issue.publishedAt ? shortDate(issue.publishedAt) : ""} · 오픈 ${percent(issue.recipients ? issue.opens / issue.recipients : 0)}`
      : issue.status === "scheduled" && issue.scheduledAt
        ? `${shortDate(issue.scheduledAt)} 예약`
        : "초안";
  return (
    <li className={styles.row}>
      <span className={clsx(styles.swatch, theme[`ink-${coverInk(number)}`], !issue.number && styles.swatchPending)} aria-hidden />
      <span className={clsx(styles.rowNumber, !issue.number && styles.rowNumberPending)}>{number}</span>
      <span className={styles.rowMain}>
        <span className={styles.rowLine}>
          <Link href={`/newsletter-community/issues/${issue.id}`} className={styles.rowTitle}>
            {issue.title}
          </Link>
          <span className={styles.leader} aria-hidden />
          <span className={styles.rowMeta}>{meta}</span>
        </span>
        <span className={styles.rowSub}>
          {CATEGORY_LABEL[issue.category]} · {AUDIENCE_SHORT[issue.audience]}
        </span>
      </span>
    </li>
  );
}

function Lineup({ desk }: { desk: DeskOverview }) {
  return (
    <section className={styles.lineup} aria-labelledby="desk-lineup">
      <SectionHead
        id="desk-lineup"
        title="목차"
        aside={<Link href="/newsletter-community/issues">발행 목록 전체</Link>}
      />
      {desk.upcoming.length > 0 && (
        <>
          <h3 className={styles.groupTitle}>발행 전</h3>
          <ol className={styles.rows} role="list">
            {desk.upcoming.map((issue, i) => (
              <LineupRow key={issue.id} issue={issue} number={desk.nextNumber + i} />
            ))}
          </ol>
        </>
      )}
      <h3 className={styles.groupTitle}>최근 발행</h3>
      {desk.recent.length > 0 ? (
        <ol className={styles.rows} role="list">
          {desk.recent.map((issue) => (
            <LineupRow key={issue.id} issue={issue} number={issue.number ?? 1} />
          ))}
        </ol>
      ) : (
        <p className={styles.quiet}>아직 발행한 호가 없어요. 첫 호를 보내면 이곳에 차례로 쌓여요.</p>
      )}
      <p className={styles.footnote}>
        <SampleNote>오픈율은 실제 발송 없이 만든 시뮬레이션 수치예요</SampleNote>
      </p>
    </section>
  );
}

function Colophon({ desk }: { desk: DeskOverview }) {
  const { revenue, counts } = desk;
  const paid = counts.byTier.basic + counts.byTier.pro;
  return (
    <section className={styles.colophon} aria-labelledby="desk-colophon">
      <SectionHead id="desk-colophon" title="판권" />
      <dl className={styles.colophonList}>
        <div>
          <dt>펴낸이</dt>
          <dd>{revenue.publication.editorName}</dd>
        </div>
        <div>
          <dt>발행</dt>
          <dd>
            통권 {formatNumber(desk.publishedCount)}호 · 기본 발송 {revenue.publication.sendHour}시
          </dd>
        </div>
        <div>
          <dt>구독자</dt>
          <dd>
            {people(counts.active)} <span className={styles.aside}>유료 {people(paid)} · {percent(revenue.conversion)}</span>
          </dd>
        </div>
        <div>
          <dt>월 반복 수입</dt>
          <dd>{won(revenue.mrr)}</dd>
        </div>
        <div>
          <dt>이번 달 수입</dt>
          <dd>
            {won(revenue.thisMonth.total)}{" "}
            <span className={styles.aside}>
              목표 {won(revenue.goals.revenue.goal)}의 {percent(revenue.goals.revenue.ratio)}
            </span>
          </dd>
        </div>
        <div>
          <dt>30일 유료 이탈</dt>
          <dd>{percent(revenue.churn)}</dd>
        </div>
      </dl>
      <Link href="/newsletter-community/revenue" className={buttonClass("secondary", "sm", styles.colophonLink)}>
        수입 장부 펼치기
      </Link>
    </section>
  );
}

function BoardDigest({ desk }: { desk: DeskOverview }) {
  return (
    <section className={styles.board} aria-labelledby="desk-board">
      <SectionHead id="desk-board" title="독자 마당" aside={<Link href="/newsletter-community/board">모두 보기</Link>} />
      {desk.board.length === 0 ? (
        <p className={styles.quiet}>아직 글이 없어요. 공지로 첫 이야기를 열어 보세요.</p>
      ) : (
        <ul className={styles.posts} role="list">
          {desk.board.map((post) => (
            <li key={post.id} className={styles.post}>
              <span className={clsx(ui.tag, post.category === "notice" && ui.tagSolid)}>{BOARD_CATEGORY_LABEL[post.category]}</span>
              <Link href={`/newsletter-community/board/${post.id}`} className={styles.postTitle}>
                {post.title}
              </Link>
              <span className={styles.postMeta}>
                {post.authorName}
                {post.authorRole === "editor" && " (에디터)"} · {formatRelative(post.createdAt)} · 댓글 {post.commentCount}
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function AdSlots({ desk }: { desk: DeskOverview }) {
  const today = seoulDateKey();
  const slots = desk.revenue.deals
    .filter((deal) => deal.status === "proposed" || deal.runOn >= today)
    .sort((a, b) => a.runOn.localeCompare(b.runOn))
    .slice(0, 4);
  return (
    <section className={styles.ads} aria-labelledby="desk-ads">
      <SectionHead id="desk-ads" title="광고 지면" aside={<Link href="/newsletter-community/revenue#sponsorships">관리</Link>} />
      {slots.length === 0 ? (
        <p className={styles.quiet}>잡힌 광고가 없어요. 수입 장부에서 광고 계약을 적어 두면 이곳에 보여요.</p>
      ) : (
        <ul className={styles.adList} role="list">
          {slots.map((deal) => (
            <li key={deal.id} className={styles.ad}>
              <span className={styles.adDate}>{shortDate(deal.runOn)}</span>
              <span className={styles.adName}>
                {deal.sponsorName}
                <span className={styles.adIssue}>{deal.issueNumber ? `제${deal.issueNumber}호` : deal.issueId ? "다음 호" : "지면 미정"}</span>
              </span>
              <span className={styles.adAmount}>{won(deal.amount)}</span>
              <span className={clsx(ui.tag, deal.status === "proposed" && ui.tagDashed)}>{SPONSORSHIP_STATUS_LABEL[deal.status]}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
