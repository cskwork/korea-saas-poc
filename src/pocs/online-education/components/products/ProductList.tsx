import Link from "next/link";
import clsx from "clsx";
import { Check, Eye, Pencil, Plus } from "lucide-react";
import { formatRelative, formatWon } from "@/core/format";
import type { ProductRow, ProductSort, readPlan } from "../../server/reads";
import { PRODUCT_TYPES, productTypeLabel } from "../../domain/catalog";
import { formatLimit } from "../../domain/plans";
import { AutoSubmitSelect, CopyLinkButton } from "../ui/form";
import { hrefWith } from "../ui/query";
import ui from "../ui/ui.module.css";
import { ProductRowActions } from "./ProductRowActions";
import { ProductTypeIcon } from "./ProductTypeIcon";
import styles from "./products.module.css";

const BASE = "/online-education/products";

export function ProductList({
  all,
  rows,
  totals,
  filters,
  plan,
  notice,
  now,
}: {
  all: ProductRow[];
  rows: ProductRow[];
  totals: { count: number; sales: number; revenue: number };
  filters: { type?: "notion" | "pdf" | "sheet"; sort?: ProductSort };
  plan: Awaited<ReturnType<typeof readPlan>>;
  notice?: string;
  now: Date;
}) {
  const limit = plan.plan.limits.products;
  const full = all.length >= limit;
  const current = { type: filters.type, sort: filters.sort };

  return (
    <>
      <header className={ui.pageHeader}>
        <div>
          <h1 className={ui.pageTitle}>디지털 상품</h1>
          <p className={ui.pageLede}>
            노션 템플릿, PDF, 스프레드시트 {totals.count}개 · 판매 <span className={ui.num}>{totals.sales.toLocaleString("ko-KR")}</span>건 ·
            매출 <span className={ui.num}>{formatWon(totals.revenue)}</span>
          </p>
        </div>
        <div className={ui.headerActions}>
          {full ? (
            <Link href="/online-education/pricing" className={ui.button}>
              요금제 올리기
            </Link>
          ) : null}
          <Link href={`${BASE}/new`} className={clsx(ui.button, ui.primary)}>
            <Plus size={16} aria-hidden />
            상품 등록
          </Link>
        </div>
      </header>

      <p className={styles.usage}>
        {plan.plan.name} 요금제 · 상품 <strong className={ui.num}>{all.length}</strong> / {formatLimit(limit, "개")}
        {full ? " · 새 상품을 올리려면 요금제를 올리거나 기존 상품을 정리해 주세요." : ""}
      </p>

      {notice ? (
        <p className={clsx(ui.notice, ui.success, styles.flash)} role="status">
          <Check size={16} aria-hidden />
          {notice}
        </p>
      ) : null}

      {all.length === 0 ? (
        <div className={ui.empty}>
          <p className={ui.emptyTitle}>강의 옆에 둘 자료를 팔아 보세요</p>
          <p className={ui.emptyText}>
            강의에서 쓰던 노션 템플릿, 치트시트 PDF, 계산 시트를 상품으로 올리면 스쿨에 함께 진열되고 판매량과 매출이 따로 집계돼요.
          </p>
          {limit > 0 ? (
            <Link href={`${BASE}/new`} className={clsx(ui.button, ui.primary)}>
              <Plus size={16} aria-hidden />첫 상품 등록
            </Link>
          ) : (
            <Link href="/online-education/pricing" className={ui.button}>
              디지털 상품을 팔 수 있는 요금제 보기
            </Link>
          )}
        </div>
      ) : (
        <>
          <div className={ui.toolbar}>
            <nav className={ui.tabs} aria-label="상품 유형">
              {[{ value: undefined, label: "전체" }, ...PRODUCT_TYPES].map((type) => (
                <Link
                  key={type.label}
                  href={hrefWith(BASE, current, { type: type.value })}
                  className={ui.tab}
                  aria-current={filters.type === type.value ? "page" : undefined}
                >
                  {type.label}
                </Link>
              ))}
            </nav>
            <form action={BASE} className={styles.sortForm}>
              {filters.type ? <input type="hidden" name="type" value={filters.type} /> : null}
              <label>
                <span className={ui.srOnly}>정렬</span>
                <AutoSubmitSelect name="sort" defaultValue={filters.sort ?? "recent"}>
                  <option value="recent">최근 등록 순</option>
                  <option value="sales">많이 팔린 순</option>
                  <option value="revenue">매출 높은 순</option>
                  <option value="price">가격 높은 순</option>
                </AutoSubmitSelect>
              </label>
              <noscript>
                <button type="submit" className={clsx(ui.button, ui.small)}>
                  정렬
                </button>
              </noscript>
            </form>
          </div>

          {rows.length === 0 ? (
            <div className={ui.empty}>
              <p className={ui.emptyTitle}>이 유형의 상품은 아직 없어요</p>
              <Link href={BASE} className={ui.button}>
                전체 보기
              </Link>
            </div>
          ) : (
            <ul role="list" className={styles.list}>
              {rows.map((product) => (
                <li key={product.id} className={styles.row} data-status={product.status}>
                  <span className={styles.art} aria-hidden>
                    <ProductTypeIcon type={product.type} size={22} />
                  </span>
                  <div className={styles.main}>
                    <h2 className={styles.title}>
                      <Link href={`${BASE}/${product.id}`}>{product.title}</Link>
                    </h2>
                    <p className={styles.meta}>
                      <span className={ui.badge} data-tone={product.status === "on_sale" ? "live" : undefined}>
                        {product.status === "on_sale" ? "판매 중" : "판매 중지"}
                      </span>
                      <span>{productTypeLabel(product.type)}</span>
                      <span>{product.lastSoldAt ? `마지막 판매 ${formatRelative(product.lastSoldAt, now)}` : "아직 판매 전"}</span>
                    </p>
                    <p className={styles.description}>{product.description}</p>
                  </div>
                  <dl className={styles.figures}>
                    <div>
                      <dt>가격</dt>
                      <dd className={ui.num}>{formatWon(product.price)}</dd>
                    </div>
                    <div>
                      <dt>판매</dt>
                      <dd className={ui.num}>{product.sales.toLocaleString("ko-KR")}건</dd>
                    </div>
                    <div>
                      <dt>매출</dt>
                      <dd className={ui.num}>{formatWon(product.revenue)}</dd>
                    </div>
                  </dl>
                  <div className={styles.actions}>
                    <Link href={`${BASE}/${product.id}`} className={clsx(ui.button, ui.small)}>
                      <Pencil size={14} aria-hidden />
                      편집
                    </Link>
                    <Link
                      href={`/online-education/school/products/${product.id}${product.status === "paused" ? "?preview=1" : ""}`}
                      className={clsx(ui.button, ui.small, ui.ghost)}
                    >
                      <Eye size={14} aria-hidden />
                      판매 페이지
                    </Link>
                    {product.status === "on_sale" ? (
                      <CopyLinkButton path={`/online-education/school/products/${product.id}`} className={clsx(ui.button, ui.small, ui.ghost)} />
                    ) : null}
                    <ProductRowActions id={product.id} status={product.status} />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </>
  );
}
