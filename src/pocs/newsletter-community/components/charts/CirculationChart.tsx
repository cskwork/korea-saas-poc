"use client";

import { formatNumber } from "@/core/format";
import type { CirculationPoint } from "../../domain/revenue";
import { dotDate, monthDayKey } from "../format";
import { LineChart } from "./LineChart";

/** Weekly subscribers on the list and paying, over half a year. */
export function CirculationChart({ points }: { points: CirculationPoint[] }) {
  const last = points[points.length - 1];
  return (
    <LineChart
      labels={points.map((p) => `${monthDayKey(p.day)} 기준`)}
      axisLabels={points.map((p) => dotDate(p.day))}
      axisLabelEvery={4}
      series={[
        { key: "total", label: "전체 구독자", color: "var(--series-total)", values: points.map((p) => p.total) },
        { key: "paid", label: "유료 구독자", color: "var(--series-paid)", values: points.map((p) => p.paid) },
      ]}
      formatValue={(v) => `${formatNumber(v)}명`}
      formatTick={(v) => formatNumber(v)}
      summary={`최근 ${points.length}주 구독자 추이. 이번 주 전체 ${formatNumber(last?.total ?? 0)}명, 유료 ${formatNumber(last?.paid ?? 0)}명.`}
      tableCaption="주별 구독자 수 (주 마지막 날 기준)"
    />
  );
}
