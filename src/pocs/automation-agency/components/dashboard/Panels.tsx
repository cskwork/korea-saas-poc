import Link from "next/link";
import clsx from "clsx";
import { formatDate, formatKrw } from "@/core/format";
import type { Arrival } from "../../domain/dashboard";
import { dDay } from "../../domain/dashboard";
import type { QuoteStatus } from "../../db/schema";
import { BASE_PATH } from "../shell/stations";
import { EmptyLine } from "../ui/EmptyLine";
import { QuoteStatusTag, StageTag } from "../ui/Tags";
import ui from "../ui/ui.module.css";
import styles from "./dashboard.module.css";

/** Upcoming delivery deadlines, as a departure board. */
export function ArrivalsBoard({ arrivals }: { arrivals: Arrival[] }) {
  if (arrivals.length === 0) {
    return <EmptyLine title="3주 안에 도착할 프로젝트가 없어요">마감일을 정하면 여기에 순서대로 나타나요.</EmptyLine>;
  }
  return (
    <table className={clsx(ui.table, ui.stack)}>
      <thead>
        <tr>
          <th scope="col">도착</th>
          <th scope="col">고객</th>
          <th scope="col">현재 역</th>
          <th scope="col" className={ui.num}>
            마감일
          </th>
        </tr>
      </thead>
      <tbody>
        {arrivals.map((a) => (
          <tr key={a.id}>
            <td data-label="도착">
              <span
                className={clsx(
                  styles.dday,
                  a.days < 0 && styles.ddayLate,
                  a.days >= 0 && a.days <= 3 && styles.ddaySoon,
                )}
              >
                {dDay(a.days)}
              </span>
            </td>
            <td data-label="고객">
              <Link href={`${BASE_PATH}/projects/${a.id}`} className={ui.rowLink}>
                {a.clientName}
              </Link>
            </td>
            <td data-label="현재 역">
              <StageTag stage={a.stage} />
            </td>
            <td data-label="마감일" className={ui.num}>
              {formatDate(`${a.dueDate}T00:00:00+09:00`, { month: "short", day: "numeric", weekday: "short" })}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export interface OpenQuote {
  id: string;
  number: string;
  clientName: string;
  status: QuoteStatus;
  validUntil: string;
  setup: number;
  monthly: number;
}

export function OpenQuotes({ quotes }: { quotes: OpenQuote[] }) {
  if (quotes.length === 0) {
    return (
      <EmptyLine
        title="답을 기다리는 견적이 없어요"
        action={
          <Link href={`${BASE_PATH}/quotes/new`} className={ui.textLink}>
            견적서 작성하기
          </Link>
        }
      />
    );
  }
  return (
    <table className={clsx(ui.table, ui.stack)}>
      <thead>
        <tr>
          <th scope="col">견적</th>
          <th scope="col">상태</th>
          <th scope="col" className={ui.num}>
            구축비
          </th>
          <th scope="col" className={ui.num}>
            월 유지보수
          </th>
        </tr>
      </thead>
      <tbody>
        {quotes.map((q) => (
          <tr key={q.id}>
            <td data-label="견적" className={ui.wide}>
              <Link href={`${BASE_PATH}/quotes/${q.id}`} className={ui.rowLink}>
                {q.clientName}
              </Link>
              <span className={ui.sub}>{q.number}</span>
            </td>
            <td data-label="상태">
              <QuoteStatusTag status={q.status} />
            </td>
            <td data-label="구축비" className={ui.num}>
              {formatKrw(q.setup)}
            </td>
            <td data-label="월 유지보수" className={ui.num}>
              {formatKrw(q.monthly)}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export function TopPackages({
  packages,
}: {
  packages: { packageId: string; name: string; projects: number; quotes: number; monthlyHoursSaved: number }[];
}) {
  if (packages.length === 0) {
    return <EmptyLine title="아직 팔린 패키지가 없어요">프로젝트나 견적에 패키지를 담으면 순위가 생겨요.</EmptyLine>;
  }
  return (
    <ol className={styles.ranking}>
      {packages.map((p, index) => (
        <li key={p.packageId} className={styles.rank}>
          <span className={styles.rankNo} aria-hidden="true">
            {index + 1}
          </span>
          <span className={styles.rankBody}>
            <Link href={`${BASE_PATH}/catalog/${p.packageId}`} className={ui.rowLink}>
              {p.name}
            </Link>
            <span className={ui.sub}>
              프로젝트 {p.projects}건 · 견적 {p.quotes}건 · 월 {p.monthlyHoursSaved}시간 절감
            </span>
          </span>
        </li>
      ))}
    </ol>
  );
}
