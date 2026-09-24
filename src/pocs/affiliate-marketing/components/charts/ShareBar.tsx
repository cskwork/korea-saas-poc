import clsx from "clsx";
import { formatPercent } from "@/core/format";
import styles from "./charts.module.css";

const SERIES = [styles.c0, styles.c1, styles.c2, styles.c3, styles.c4];

export interface ShareItem {
  key: string;
  label: string;
  value: number;
  valueLabel: string;
  /** Fixed palette slot (entity order, never rank); null = the neutral "other" slot. */
  slot: number | null;
}

/** One stacked row of shares with a legend that carries labels, values and percentages. */
export function ShareBar({ items, title }: { items: ShareItem[]; title: string }) {
  const total = items.reduce((sum, item) => sum + item.value, 0);
  const visible = items.filter((item) => item.value > 0);
  return (
    <figure className={styles.share} aria-label={title}>
      <div className={styles.shareTrack} aria-hidden>
        {visible.map((item) => (
          <span
            key={item.key}
            className={clsx(styles.shareSeg, item.slot == null ? styles.cOther : SERIES[item.slot % SERIES.length])}
            style={{ flexGrow: item.value, flexBasis: 0 }}
            title={`${item.label} ${item.valueLabel}`}
          />
        ))}
      </div>
      <ul className={styles.legend} role="list">
        {items.map((item) => (
          <li key={item.key}>
            <span className={clsx(styles.swatch, item.slot == null ? styles.cOther : SERIES[item.slot % SERIES.length])} aria-hidden />
            {item.label} <b>{item.valueLabel}</b> {total > 0 ? `(${formatPercent(item.value / total, 0)})` : null}
          </li>
        ))}
      </ul>
    </figure>
  );
}

export interface BarListItem {
  key: string;
  label: string;
  value: number;
  valueLabel: string;
  note?: string;
}

/** Labelled horizontal bars in one hue: identity comes from the row label, never colour. */
export function BarList({ items, label }: { items: BarListItem[]; label: string }) {
  const max = Math.max(...items.map((item) => item.value), 0);
  return (
    <ul className={styles.barList} role="list" aria-label={label}>
      {items.map((item) => (
        <li key={item.key} className={styles.barRow}>
          <span className={styles.barLabel} title={item.label}>
            {item.label}
          </span>
          <span className={styles.barTrack} aria-hidden>
            <span className={styles.barFill} style={{ width: `${max > 0 ? (item.value / max) * 100 : 0}%` }} />
          </span>
          <span className={styles.barValue}>
            {item.valueLabel}
            {item.note ? <small>{item.note}</small> : null}
          </span>
        </li>
      ))}
    </ul>
  );
}
