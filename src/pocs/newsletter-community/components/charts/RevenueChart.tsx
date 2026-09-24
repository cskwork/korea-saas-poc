"use client";

import type { MonthRevenue } from "../../domain/revenue";
import { monthLabel } from "../../domain/dates";
import { won, wonTick } from "../format";
import { StackedColumns } from "./StackedColumns";

/** Six months of income by source, stacked from the baseline: 구독료, 광고, 멤버십. */
export function RevenueChart({ series }: { series: MonthRevenue[] }) {
  const last = series[series.length - 1];
  return (
    <StackedColumns
      keys={[
        { key: "subscription", label: "구독료", color: "var(--series-paid)" },
        { key: "sponsorship", label: "광고", color: "var(--series-ads)" },
        { key: "membership", label: "멤버십", color: "var(--series-membership)" },
      ]}
      columns={series.map((month) => ({
        label: monthLabel(month.month),
        values: { subscription: month.subscription, sponsorship: month.sponsorship, membership: month.membership },
      }))}
      current={series.length - 1}
      formatValue={won}
      formatTick={wonTick}
      summary={`최근 ${series.length}개월 수입. 이번 달 합계 ${won(last?.total ?? 0)}.`}
      tableCaption="월별 수입 (구독료는 각 달에 유료였던 구독자 × 현재 플랜 가격으로 추정)"
      height={260}
    />
  );
}
