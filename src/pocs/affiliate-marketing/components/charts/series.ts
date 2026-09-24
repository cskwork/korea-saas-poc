import { formatCompact, formatMonthDay, formatNumber, formatPercent, formatWon } from "@/core/format";
import { shortDayLabel } from "../../domain/dates";
import { conversionRate, niceCeiling, type DayPoint } from "../../domain/metrics";
import type { ColumnChartProps } from "./ColumnChart";

/** Server-side shaping of chart props: nice axes and pre-formatted readouts (no functions cross to the client). */

function ticks(max: number, money: boolean) {
  const top = niceCeiling(max);
  return {
    max: top,
    yTicks: [0, top / 2, top].map((value) => ({
      value,
      label: value === 0 ? "0" : money ? `${formatCompact(value)}원` : formatCompact(value),
    })),
  };
}

function dayTicks(days: string[]) {
  const every = days.length > 60 ? 15 : days.length > 20 ? 7 : days.length > 10 ? 3 : 1;
  const last = days.length - 1;
  return days.flatMap((day, index) =>
    (last - index) % every === 0 ? [{ index, label: index === last ? "오늘" : shortDayLabel(day) }] : [],
  );
}

const dayLines = (p: DayPoint) => [
  `수익 ${formatWon(p.revenue)}`,
  `클릭 ${formatNumber(p.clicks)} · 판매 ${formatNumber(p.conversions)}`,
  `전환율 ${formatPercent(conversionRate(p.conversions, p.clicks))}`,
];

export function revenueColumns(points: DayPoint[], options: { today: string }): Omit<ColumnChartProps, "title"> {
  const axis = ticks(Math.max(...points.map((p) => p.revenue), 0), true);
  return {
    ...axis,
    points: points.map((p) => ({ label: formatMonthDay(`${p.day}T12:00:00+09:00`), value: p.revenue, lines: dayLines(p) })),
    xTicks: dayTicks(points.map((p) => p.day)),
    highlight: points.findIndex((p) => p.day === options.today),
  };
}

export function clickColumns(points: DayPoint[], options: { today: string; markOrders?: boolean }): Omit<ColumnChartProps, "title"> {
  const axis = ticks(Math.max(...points.map((p) => p.clicks), 0), false);
  return {
    ...axis,
    tone: "ink",
    points: points.map((p) => ({
      label: formatMonthDay(`${p.day}T12:00:00+09:00`),
      value: p.clicks,
      lines: dayLines(p),
      marked: options.markOrders ? p.conversions > 0 : undefined,
    })),
    xTicks: dayTicks(points.map((p) => p.day)),
    highlight: points.findIndex((p) => p.day === options.today),
  };
}

export function hourColumns(buckets: number[], peak: { start: number }): Omit<ColumnChartProps, "title"> {
  const axis = ticks(Math.max(...buckets, 0), false);
  const total = buckets.reduce((a, b) => a + b, 0);
  const end = (peak.start + 2) % 24;
  return {
    ...axis,
    tone: "ink",
    points: buckets.map((clicks, hour) => ({
      label: `${hour}시`,
      value: clicks,
      lines: [`클릭 ${formatNumber(clicks)}`, `전체의 ${formatPercent(total ? clicks / total : 0)}`],
    })),
    xTicks: [0, 6, 12, 18, 23].map((hour) => ({ index: hour, label: `${hour}시` })),
    band: end >= peak.start ? { from: peak.start, to: end } : undefined,
  };
}
