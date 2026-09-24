"use client";

import { formatNumber } from "@/core/format";
import { LineChart } from "./LineChart";

/** Cumulative (simulated) opens hour by hour after sending. */
export function OpenCurveChart({ curve, recipients }: { curve: number[]; recipients: number }) {
  const last = curve[curve.length - 1] ?? 0;
  return (
    <LineChart
      labels={curve.map((_, i) => `발송 후 ${i + 1}시간`)}
      axisLabels={curve.map((_, i) => `${i + 1}h`)}
      axisLabelEvery={6}
      series={[{ key: "opens", label: "누적 오픈", color: "var(--series-total)", values: curve }]}
      formatValue={(v) => `${formatNumber(v)}명`}
      formatTick={(v) => formatNumber(v)}
      summary={`발송 후 ${curve.length}시간 동안 누적 오픈 ${formatNumber(last)}명 (수신 ${formatNumber(recipients)}명)`}
      tableCaption="발송 후 시간별 누적 오픈 (시뮬레이션)"
      height={180}
    />
  );
}
