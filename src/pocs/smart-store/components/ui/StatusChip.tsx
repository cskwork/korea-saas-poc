import clsx from "clsx";
import { ORDER_STATUS_LABEL, type OrderStatus } from "../../domain/orders";
import styles from "./ui.module.css";

type ChipKind = OrderStatus | "selling" | "paused" | "quiet";

const LISTING_LABEL = { selling: "판매중", paused: "판매중지" } as const;

export function StatusChip({ kind, children }: { kind: ChipKind; children?: React.ReactNode }) {
  const label =
    children ??
    (kind === "selling" || kind === "paused"
      ? LISTING_LABEL[kind]
      : kind === "quiet"
        ? null
        : ORDER_STATUS_LABEL[kind]);
  return <span className={clsx(styles.chip, styles[`chip_${kind}`])}>{label}</span>;
}
