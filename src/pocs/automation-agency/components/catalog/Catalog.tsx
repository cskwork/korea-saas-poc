import Link from "next/link";
import clsx from "clsx";
import { FilePlus2, Search } from "lucide-react";
import { formatKrw } from "@/core/format";
import type { Industry, PackageKind } from "../../db/schema";
import { INDUSTRIES, INDUSTRY_LABEL, PACKAGE_KINDS, PACKAGE_KIND_LABEL, platformOfTool } from "../../domain/labels";
import type { CatalogFilter, PackageWithUsage } from "../../server/data/catalog";
import { BASE_PATH } from "../shell/stations";
import { buttonClass } from "../ui/classes";
import { EmptyLine } from "../ui/EmptyLine";
import { LineBadge } from "../ui/Tags";
import ui from "../ui/ui.module.css";
import styles from "./catalog.module.css";

const CATALOG = `${BASE_PATH}/catalog`;

function hrefWith(filter: CatalogFilter, patch: Partial<CatalogFilter>) {
  const next = { ...filter, ...patch };
  const params = new URLSearchParams();
  if (next.industry) params.set("industry", next.industry);
  if (next.kind) params.set("kind", next.kind);
  if (next.q) params.set("q", next.q);
  if (next.sort && next.sort !== "popular") params.set("sort", next.sort);
  if (next.includeArchived) params.set("archived", "1");
  const query = params.toString();
  return query ? `${CATALOG}?${query}` : CATALOG;
}

/** Industry / type chips and a search box. Plain links and a GET form: shareable, no script needed. */
export function CatalogFilters({ filter }: { filter: CatalogFilter }) {
  return (
    <div className={styles.filters}>
      <div className={styles.filterRow}>
        <span className={styles.filterLabel} id="industry-label">
          업종
        </span>
        <div className={ui.chips} role="group" aria-labelledby="industry-label">
          <Link
            href={hrefWith(filter, { industry: undefined })}
            className={ui.chip}
            aria-current={!filter.industry ? "true" : undefined}
          >
            전체
          </Link>
          {INDUSTRIES.map((industry: Industry) => (
            <Link
              key={industry}
              href={hrefWith(filter, { industry })}
              className={ui.chip}
              aria-current={filter.industry === industry ? "true" : undefined}
            >
              {INDUSTRY_LABEL[industry]}
            </Link>
          ))}
        </div>
      </div>
      <div className={styles.filterRow}>
        <span className={styles.filterLabel} id="kind-label">
          유형
        </span>
        <div className={ui.chips} role="group" aria-labelledby="kind-label">
          <Link
            href={hrefWith(filter, { kind: undefined })}
            className={ui.chip}
            aria-current={!filter.kind ? "true" : undefined}
          >
            전체
          </Link>
          {PACKAGE_KINDS.map((kind: PackageKind) => (
            <Link
              key={kind}
              href={hrefWith(filter, { kind })}
              className={ui.chip}
              aria-current={filter.kind === kind ? "true" : undefined}
            >
              {PACKAGE_KIND_LABEL[kind]}
            </Link>
          ))}
        </div>
      </div>
      <form className={styles.search} action={CATALOG} role="search">
        {filter.industry ? <input type="hidden" name="industry" value={filter.industry} /> : null}
        {filter.kind ? <input type="hidden" name="kind" value={filter.kind} /> : null}
        <label className={ui.srOnly} htmlFor="catalog-q">
          패키지 검색
        </label>
        <input
          id="catalog-q"
          name="q"
          type="search"
          className={ui.input}
          defaultValue={filter.q}
          placeholder="패키지 이름이나 설명으로 검색"
        />
        <label className={ui.srOnly} htmlFor="catalog-sort">
          정렬
        </label>
        <select id="catalog-sort" name="sort" className={ui.select} defaultValue={filter.sort ?? "popular"}>
          <option value="popular">판매 실적순</option>
          <option value="savings">월 절감 시간순</option>
          <option value="price">구축비 낮은순</option>
        </select>
        <label className={styles.archivedToggle}>
          <input type="checkbox" name="archived" value="1" defaultChecked={filter.includeArchived} />
          판매 중지 포함
        </label>
        <button type="submit" className={buttonClass("primary")}>
          <Search size={16} aria-hidden="true" />
          찾기
        </button>
      </form>
    </div>
  );
}

/** Tools as line badges (for the four platforms) followed by the other tools as plain names. */
export function ToolLines({ tools }: { tools: string[] }) {
  const platforms = tools.flatMap((tool) => {
    const platform = platformOfTool(tool);
    return platform ? [platform] : [];
  });
  const others = tools.filter((tool) => !platformOfTool(tool));
  return (
    <span className={ui.toolList}>
      {platforms.map((platform) => (
        <LineBadge key={platform} platform={platform} />
      ))}
      {others.map((tool) => (
        <span key={tool} className={styles.tool}>
          {tool}
        </span>
      ))}
    </span>
  );
}

/** The catalogue as a timetable: one ruled row per package. */
export function PackageTable({ packages, filter }: { packages: PackageWithUsage[]; filter: CatalogFilter }) {
  if (packages.length === 0) {
    return (
      <EmptyLine
        title="조건에 맞는 패키지가 없어요"
        action={
          <Link href={CATALOG} className={ui.textLink}>
            필터 모두 지우기
          </Link>
        }
      >
        {filter.q ? `‘${filter.q}’로 찾은 결과가 없어요. ` : ""}업종이나 유형을 바꿔 보세요.
      </EmptyLine>
    );
  }
  return (
    <table className={clsx(ui.table, ui.stack, styles.table)}>
      <thead>
        <tr>
          <th scope="col">패키지</th>
          <th scope="col">사용 도구</th>
          <th scope="col" className={ui.num}>
            월 절감
          </th>
          <th scope="col" className={ui.num}>
            구축비
          </th>
          <th scope="col" className={ui.num}>
            월 유지보수
          </th>
          <th scope="col" className={ui.num}>
            판매 실적
          </th>
          <th scope="col">
            <span className={ui.srOnly}>작업</span>
          </th>
        </tr>
      </thead>
      <tbody>
        {packages.map((pkg) => (
          <tr key={pkg.id} className={pkg.archived ? styles.archived : undefined}>
            <td className={clsx(ui.wide, styles.nameCell)}>
              <Link href={`${CATALOG}/${pkg.id}`} className={ui.rowLink}>
                {pkg.name}
              </Link>
              {pkg.archived ? <span className={clsx(ui.tag, styles.archivedTag)}>판매 중지</span> : null}
              <span className={styles.summary}>{pkg.summary}</span>
              <span className={styles.meta}>
                {INDUSTRY_LABEL[pkg.industry]} · {PACKAGE_KIND_LABEL[pkg.kind]}
              </span>
            </td>
            <td data-label="사용 도구" className={ui.wide}>
              <ToolLines tools={pkg.tools} />
            </td>
            <td data-label="월 절감" className={ui.num}>
              <strong>{pkg.monthlyHoursSaved}시간</strong>
            </td>
            <td data-label="구축비" className={ui.num}>
              {formatKrw(pkg.setupFee)}
            </td>
            <td data-label="월 유지보수" className={ui.num}>
              {formatKrw(pkg.monthlyFee)}
            </td>
            <td data-label="판매 실적" className={ui.num}>
              {pkg.projectCount}건<span className={ui.sub}>견적 {pkg.quoteCount}건</span>
            </td>
            <td className={ui.wide}>
              {pkg.archived ? null : (
                <Link
                  href={`${BASE_PATH}/quotes/new?package=${pkg.id}`}
                  className={buttonClass("secondary", { small: true })}
                >
                  <FilePlus2 size={15} aria-hidden="true" />
                  견적에 담기
                </Link>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
