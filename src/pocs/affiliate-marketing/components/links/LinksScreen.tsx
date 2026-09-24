import Link from "next/link";
import { ChevronRight, Plus } from "lucide-react";
import { formatNumber, formatPercent, formatWon } from "@/core/format";
import { LINK_STATUS_LABEL, type LinkStatus } from "../../domain/catalog";
import { describeTerms } from "../../domain/commission";
import type { LinkListRow } from "../../server/links";
import { shortUrl } from "../display";
import { ScanCopy } from "../label/ScanCopy";
import { Band, Chip, Empty, Page, Won, ui } from "../ui/primitives";
import { LinkFilters, type LinkFilterValues } from "./LinkFilters";
import styles from "./links.module.css";

export const STATUS_TONE: Record<LinkStatus, "ok" | "muted" | "red"> = { active: "ok", paused: "muted", expired: "red" };

export function LinksScreen({
  rows,
  programs,
  total,
  active,
  filters,
  origin,
  deleted,
}: {
  rows: LinkListRow[];
  programs: { id: string; name: string }[];
  total: number;
  active: number;
  filters: LinkFilterValues;
  origin: string;
  deleted: boolean;
}) {
  const filtered = Boolean(filters.q || filters.programId || filters.status || filters.category);
  return (
    <>
      <Band
        title="링크 진열대"
        lead={`링크 ${formatNumber(total)}개 · 판매 중 ${formatNumber(active)}개. 금액은 링크가 지금까지 번 수수료(취소 제외)예요.`}
        actions={
          <Link href="/affiliate-marketing/links/new" className={ui.primary}>
            <Plus aria-hidden />
            링크 등록
          </Link>
        }
      />
      <Page>
        {deleted ? (
          <p role="status" className={`${ui.noticeOk} ${ui.stamp}`}>
            링크와 그 클릭·판매 기록을 삭제했어요.
          </p>
        ) : null}
        <LinkFilters values={filters} programs={programs} />
        {filtered ? (
          <p className={styles.resultNote} aria-live="polite">
            조건에 맞는 링크 {formatNumber(rows.length)}개
          </p>
        ) : null}
        {rows.length === 0 ? (
          filtered ? (
            <Empty
              title="조건에 맞는 링크가 없어요"
              action={
                <Link href="/affiliate-marketing/links" className={ui.base}>
                  필터 지우기
                </Link>
              }
            >
              검색어를 줄이거나 프로그램·상태 필터를 풀어 보세요.
            </Empty>
          ) : (
            <Empty
              title="진열대가 비어 있어요"
              action={
                <Link href="/affiliate-marketing/links/new" className={ui.primary}>
                  <Plus aria-hidden />첫 링크 등록하기
                </Link>
              }
            >
              쿠팡 파트너스나 텐핑에서 받은 제휴 링크를 등록하면, 링크잇이 클릭을 기록하는 짧은 링크를 만들어 줘요.
            </Empty>
          )
        ) : (
          <div className={styles.shelf}>
            <table className={styles.table}>
              <caption className={ui.srOnly}>제휴 링크 목록</caption>
              <thead>
                <tr>
                  <th scope="col">상품</th>
                  <th scope="col">상태</th>
                  <th scope="col">클릭</th>
                  <th scope="col">판매</th>
                  <th scope="col">전환율</th>
                  <th scope="col">클릭당</th>
                  <th scope="col">수익</th>
                  <th scope="col">짧은 링크</th>
                  <th scope="col">
                    <span className={ui.srOnly}>상세</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.id} data-status={row.status}>
                    <th scope="row">
                      <div className={styles.product}>
                        <Link href={`/affiliate-marketing/links/${row.id}`} className={styles.productName}>
                          {row.productName}
                        </Link>
                        <span className={styles.productMeta}>
                          <span>{row.programName ?? "프로그램 미지정"}</span>
                          <span>{row.category}</span>
                          <span>{describeTerms(row)}</span>
                        </span>
                      </div>
                    </th>
                    <td>
                      <Chip tone={STATUS_TONE[row.status]}>{LINK_STATUS_LABEL[row.status]}</Chip>
                    </td>
                    <td>
                      <span className={styles.numLabel}>클릭</span>
                      {formatNumber(row.clicks)}
                    </td>
                    <td>
                      <span className={styles.numLabel}>판매</span>
                      {formatNumber(row.conversions)}
                    </td>
                    <td>
                      <span className={styles.numLabel}>전환율</span>
                      {formatPercent(row.cvr)}
                    </td>
                    <td>
                      <span className={styles.numLabel}>클릭당</span>
                      {formatWon(Math.round(row.epc))}
                    </td>
                    <td className={styles.revenueCell}>
                      <span className={styles.numLabel}>수익</span>
                      <Won value={row.revenue} size="sm" />
                    </td>
                    <td className={styles.scanCell}>
                      <ScanCopy code={row.code} url={shortUrl(origin, row.code)} />
                    </td>
                    <td className={styles.wide}>
                      <Link href={`/affiliate-marketing/links/${row.id}`} className={styles.detailLink}>
                        상세
                        <ChevronRight aria-hidden />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Page>
    </>
  );
}
