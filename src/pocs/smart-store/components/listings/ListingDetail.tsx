import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { formatDate, formatKrw, formatNumber } from "@/core/format";
import { SUPPLIER_LABEL, categoryLabel } from "../../domain/categories";
import type { ListingEntry } from "../../server/data/listings";
import detail from "../sourcing/detail.module.css";
import { Notice } from "../ui/Notice";
import { PageHead } from "../ui/PageHead";
import { Slip } from "../ui/Slip";
import { StatusChip } from "../ui/StatusChip";
import { CopySourceLabel } from "./CopySourceLabel";
import { ListingActions } from "./ListingActions";
import { ListingEditor } from "./ListingEditor";
import styles from "./listings.module.css";

interface Props {
  listing: ListingEntry;
  created: "claude" | "template" | null;
  fellBack: boolean;
  writer: "claude" | "template";
}

export function ListingDetail({ listing, created, fellBack, writer }: Props) {
  return (
    <>
      <Link href="/smart-store/listings" className={detail.back}>
        <ArrowLeft size={14} strokeWidth={2} aria-hidden /> 등록 상품
      </Link>
      <PageHead
        title={listing.originalName}
        lede={
          <>
            {listing.supplier ? `${SUPPLIER_LABEL[listing.supplier]} 위탁 · ` : "직접 등록 · "}
            {categoryLabel(listing.category)} · {formatDate(listing.createdAt)} 등록
          </>
        }
      />
      <div className={styles.bannerRow}>
        {created ? (
          <Notice tone="ok">
            {created === "claude"
              ? "Claude가 상품명·상세설명·키워드를 써서 판매를 시작했어요. 내용을 확인하고 필요하면 고쳐 주세요."
              : "기본 템플릿으로 상품명·상세설명·키워드를 채워 판매를 시작했어요. [도매처 상세페이지에서 확인해 입력] 부분을 채워 주세요."}
          </Notice>
        ) : null}
        {fellBack ? (
          <Notice tone="info">
            AI 응답을 받지 못해 기본 템플릿으로 썼어요. 잠시 후 &lsquo;AI로 다시 쓰기&rsquo;를 눌러 보세요.
          </Notice>
        ) : null}
        <p className={styles.tallyInline}>
          <StatusChip kind={listing.status} />
          <CopySourceLabel source={listing.copySource} />
          <span>
            주문 <strong>{formatNumber(listing.stats.orders)}건</strong>
          </span>
          <span>
            판매 <strong>{formatNumber(listing.stats.units)}개</strong>
          </span>
          <span>
            누적 매출 <strong>{formatKrw(listing.stats.revenue)}</strong>
          </span>
        </p>
      </div>
      <ListingEditor
        key={listing.updatedAt.getTime()}
        listing={{
          id: listing.id,
          title: listing.title,
          description: listing.description,
          keywords: listing.keywords,
          hashtags: listing.hashtags,
          category: listing.category,
          price: listing.price,
          cost: listing.cost,
          shippingCost: listing.shippingCost,
        }}
      />
      <Slip title="판매 관리" titleId="manage-title" className={styles.manage}>
        <ListingActions id={listing.id} status={listing.status} writer={writer} />
      </Slip>
    </>
  );
}
