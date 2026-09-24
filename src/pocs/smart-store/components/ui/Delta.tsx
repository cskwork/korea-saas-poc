import clsx from "clsx";
import { Minus, TrendingDown, TrendingUp } from "lucide-react";
import styles from "./delta.module.css";

/**
 * Change vs the previous period. Direction is shown with an icon and a sign,
 * never color alone; a drop is not treated as an alarm.
 */
export function Delta({
  value,
  kind = "ratio",
  label,
}: {
  value: number | null;
  kind?: "ratio" | "points";
  label: string;
}) {
  if (value === null) {
    return <span className={clsx(styles.delta, styles.flat)}>비교할 기간 없음</span>;
  }
  const flat = Math.abs(value) < (kind === "ratio" ? 0.005 : 0.0005);
  const Icon = flat ? Minus : value > 0 ? TrendingUp : TrendingDown;
  const text =
    kind === "ratio"
      ? `${value > 0 ? "+" : "−"}${Math.abs(value * 100).toFixed(0)}%`
      : `${value > 0 ? "+" : "−"}${Math.abs(value * 100).toFixed(1)}%p`;
  return (
    <span className={clsx(styles.delta, flat && styles.flat)} aria-label={`${label} ${flat ? "변화 없음" : text}`}>
      <Icon size={14} strokeWidth={2.25} aria-hidden />
      {flat ? "0%" : text}
    </span>
  );
}
