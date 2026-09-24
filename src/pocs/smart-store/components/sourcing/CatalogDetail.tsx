import Link from "next/link";
import clsx from "clsx";
import { ArrowLeft, Calculator } from "lucide-react";
import { formatNumber, formatPercent } from "@/core/format";
import { SUPPLIER_LABEL, categoryLabel } from "../../domain/categories";
import { breakEvenPrice, computeMargin, priceForTargetMargin } from "../../domain/margin";
import type { CatalogEntry } from "../../server/data/catalog";
import { ListItemButton } from "../listings/ListItemButton";
import { HangTag } from "../ui/HangTag";
import { MarginReceipt } from "../ui/MarginReceipt";
import { PageHead } from "../ui/PageHead";
import { Slip } from "../ui/Slip";
import { StatusChip } from "../ui/StatusChip";
import ui from "../ui/ui.module.css";
import styles from "./detail.module.css";

const TARGETS = [0.2, 0.3, 0.4];

export function CatalogDetail({ entry }: { entry: CatalogEntry }) {
  const { margin } = entry;
  const breakEven = breakEvenPrice(entry.wholesalePrice, entry.shippingCost, margin.feeRateBp);
  const calculatorHref = `/smart-store/calculator?${new URLSearchParams({
    category: entry.category,
    cost: String(entry.wholesalePrice),
    price: String(entry.suggestedPrice),
    shipping: String(entry.shippingCost),
    label: entry.name.slice(0, 40),
  })}`;

  return (
    <>
      <Link href="/smart-store/sourcing" className={styles.back}>
        <ArrowLeft size={14} strokeWidth={2} aria-hidden /> 소싱 목록
      </Link>
      <PageHead
        title={entry.name}
        lede={`${SUPPLIER_LABEL[entry.supplier]} ${entry.code} · ${categoryLabel(entry.category)} · 샘플 도매 상품`}
      />
      <div className={styles.layout}>
        <div className={styles.tagColumn}>
          <HangTag margin={margin} caption="권장 판매가" size="lg" />
          <div className={styles.cta}>
            {entry.listing ? (
              <Link href={`/smart-store/listings/${entry.listing.id}`} className={clsx(ui.btn, ui.btnBlock)}>
                <StatusChip kind={entry.listing.status} /> 등록한 상품 보기
              </Link>
            ) : (
              <ListItemButton catalogItemId={entry.id} block />
            )}
            <Link href={calculatorHref} className={clsx(ui.btn, ui.btnGhost, ui.btnBlock)}>
              <Calculator size={16} strokeWidth={2} aria-hidden /> 마진 계산기에서 조정
            </Link>
            {entry.listing ? null : (
              <p className={styles.ctaNote}>
                AI가 네이버 검색용 상품명·상세설명·키워드를 쓰고 권장 판매가로 판매를 시작해요. 등록 후 바로 고칠 수
                있어요.
              </p>
            )}
          </div>
        </div>

        <Slip title="남는 돈 계산" titleId="receipt-title">
          <MarginReceipt margin={margin} priceLabel="권장 판매가" />
          <dl className={styles.facts}>
            <div>
              <dt>손익분기 판매가</dt>
              <dd>{formatNumber(breakEven)}원</dd>
            </div>
            {TARGETS.map((target) => {
              const price = priceForTargetMargin(entry.wholesalePrice, entry.shippingCost, margin.feeRateBp, target);
              const reached = price
                ? computeMargin({
                    price,
                    cost: entry.wholesalePrice,
                    shipping: entry.shippingCost,
                    feeRateBp: margin.feeRateBp,
                  })
                : null;
              return (
                <div key={target}>
                  <dt>마진 {formatPercent(target, 0)} 판매가</dt>
                  <dd>
                    {price && reached ? `${formatNumber(price)}원 (남는 돈 ${formatNumber(reached.profit)}원)` : "불가"}
                  </dd>
                </div>
              );
            })}
          </dl>
        </Slip>

        <Slip title="도매처 정보" titleId="facts-title">
          <dl className={styles.facts}>
            <div>
              <dt>도매처</dt>
              <dd>
                {SUPPLIER_LABEL[entry.supplier]} · {entry.code}
              </dd>
            </div>
            <div>
              <dt>옵션</dt>
              <dd>{entry.options ?? "없음"}</dd>
            </div>
            <div>
              <dt>출고</dt>
              <dd>결제 후 {entry.leadDays}영업일 이내</dd>
            </div>
            <div>
              <dt>도매처 재고</dt>
              <dd>{formatNumber(entry.stock)}개</dd>
            </div>
            <div>
              <dt>배송비(셀러 부담)</dt>
              <dd>{entry.shippingCost ? `${formatNumber(entry.shippingCost)}원` : "무료"}</dd>
            </div>
          </dl>
        </Slip>
      </div>
    </>
  );
}
