import Link from "next/link";
import clsx from "clsx";
import { ReceiptText } from "lucide-react";
import { formatMonthDay } from "@/core/format";
import type { Analytics } from "../../domain/analytics";
import type { CatalogEntry } from "../../server/data/catalog";
import type { OrderEntry, StatusCounts } from "../../server/data/orders";
import { PageHead } from "../ui/PageHead";
import ui from "../ui/ui.module.css";
import styles from "./overview.module.css";
import { Picks } from "./Picks";
import { WaitingOrders } from "./WaitingOrders";
import { WeekTally } from "./WeekTally";

interface OverviewProps {
  waiting: OrderEntry[];
  counts: StatusCounts;
  week: Analytics;
  picks: CatalogEntry[];
  now: Date;
}

export function OverviewPage({ waiting, counts, week, picks, now }: OverviewProps) {
  const headline =
    counts.new > 0 ? (
      <>
        발주 확인할 주문이 <span className={ui.mark}>{counts.new}건</span> 있어요
      </>
    ) : (
      "밀린 발주가 없어요"
    );
  const shipping = counts.confirmed > 0 ? `송장을 기다리는 주문 ${counts.confirmed}건, ` : "";
  return (
    <>
      <PageHead
        title={headline}
        lede={`${formatMonthDay(now)} · ${shipping}배송 중인 주문 ${counts.shipping}건이 있어요.`}
        actions={
          <Link href="/smart-store/orders?status=new" className={clsx(ui.btn, ui.btnPop)}>
            <ReceiptText size={16} strokeWidth={2} aria-hidden />
            주문 처리하기
          </Link>
        }
      />
      <div className={styles.grid}>
        <WaitingOrders orders={waiting} total={counts.new} now={now} />
        <WeekTally week={week} />
      </div>
      <Picks picks={picks} />
    </>
  );
}
