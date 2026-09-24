import Link from "next/link";
import clsx from "clsx";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { formatNumber } from "@/core/format";
import type { Delta } from "../../domain/metrics";
import styles from "./ui.module.css";

/** Flyer band: the yellow page header every screen opens with. */
export function Band({
  title,
  lead,
  actions,
  back,
  children,
}: {
  title: React.ReactNode;
  lead?: React.ReactNode;
  actions?: React.ReactNode;
  back?: { href: string; label: string };
  children?: React.ReactNode;
}) {
  return (
    <div className={styles.band}>
      <div className={styles.bandInner}>
        {back ? (
          <Link href={back.href} className={styles.back}>
            <ChevronLeft aria-hidden />
            {back.label}
          </Link>
        ) : null}
        <div className={styles.bandTop}>
          <h1 className={styles.bandTitle}>{title}</h1>
          {actions ? <div className={styles.bandActions}>{actions}</div> : null}
        </div>
        {lead ? <p className={styles.bandLead}>{lead}</p> : null}
        {children}
      </div>
    </div>
  );
}

export function Page({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={clsx(styles.page, className)}>{children}</div>;
}

const WON_SIZE = { sm: styles.wonSm, md: styles.wonMd, lg: styles.wonLg, xl: styles.wonXl } as const;

/** A price in the shelf label's condensed numerals with a small "원". */
export function Won({
  value,
  size = "md",
  tone = "red",
  className,
}: {
  value: number;
  size?: keyof typeof WON_SIZE;
  tone?: "red" | "ink";
  className?: string;
}) {
  return (
    <span className={clsx(styles.won, WON_SIZE[size], tone === "red" ? styles.wonRed : styles.wonInk, className)}>
      {formatNumber(Math.round(value))}
      <span className={styles.wonUnit}>원</span>
    </span>
  );
}

/** ▲ / ▼ change with Korean market colours (red up, blue down). */
export function DeltaTag({ delta, unit = "percent", label }: { delta: Delta; unit?: "percent" | "points" | "count"; label: string }) {
  const text =
    unit === "points"
      ? `${Math.abs(delta.difference * 100).toFixed(1)}%p`
      : unit === "count" || delta.ratio == null
        ? formatNumber(Math.abs(Math.round(delta.difference)))
        : `${Math.abs(delta.ratio * 100).toFixed(1)}%`;
  // A change that rounds to zero is shown as no change, never as a coloured "0.0%".
  const direction = /[1-9]/.test(text) ? delta.direction : "flat";
  const tone = direction === "up" ? styles.deltaUp : direction === "down" ? styles.deltaDown : styles.deltaFlat;
  const word = direction === "up" ? "증가" : direction === "down" ? "감소" : "변화 없음";
  return (
    <span className={clsx(styles.delta, tone)}>
      {direction === "flat" ? null : (
        <svg viewBox="0 0 10 10" aria-hidden>
          <path d={direction === "up" ? "M5 1 9.5 9h-9Z" : "M5 9 .5 1h9Z"} fill="currentColor" />
        </svg>
      )}
      <span className={styles.srOnly}>
        {label} {word}
      </span>
      {direction === "flat" ? "변화 없음" : text}
    </span>
  );
}

const CHIP_TONE = {
  ink: styles.chipInk,
  muted: styles.chipMuted,
  red: styles.chipRed,
  blue: styles.chipBlue,
  ok: styles.chipOk,
  solid: styles.chipSolid,
} as const;

export function Chip({ children, tone = "ink", title }: { children: React.ReactNode; tone?: keyof typeof CHIP_TONE; title?: string }) {
  return (
    <span className={clsx(styles.chip, CHIP_TONE[tone])} title={title}>
      {children}
    </span>
  );
}

export function Sticker({ children, tone = "red", label }: { children: React.ReactNode; tone?: "red" | "yellow"; label?: string }) {
  return (
    <span className={clsx(styles.sticker, tone === "yellow" && styles.stickerYellow)} aria-label={label}>
      {children}
    </span>
  );
}

export function Section({
  title,
  note,
  link,
  actions,
  children,
  id,
  className,
}: {
  title: React.ReactNode;
  note?: React.ReactNode;
  link?: { href: string; label: string };
  actions?: React.ReactNode;
  children: React.ReactNode;
  id?: string;
  className?: string;
}) {
  const headingId = id ? `${id}-title` : undefined;
  return (
    <section className={clsx(styles.section, className)} aria-labelledby={headingId} id={id}>
      <div className={styles.sectionHead}>
        <h2 className={styles.sectionTitle} id={headingId}>
          {title}
        </h2>
        {note ? <p className={styles.sectionNote}>{note}</p> : null}
        {link ? (
          <Link href={link.href} className={styles.sectionLink}>
            {link.label}
            <ChevronRight aria-hidden />
          </Link>
        ) : null}
        {actions}
      </div>
      {children}
    </section>
  );
}

export function Empty({ title, children, action }: { title: string; children?: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div className={styles.empty}>
      <p className={styles.emptyTitle}>{title}</p>
      {children ? <p className={styles.emptyBody}>{children}</p> : null}
      {action}
    </div>
  );
}

/** Shared class names for buttons, panels and notices (usable on <Link>, <button>, <div>). */
export const ui = {
  base: styles.button,
  primary: clsx(styles.button, styles.primary),
  danger: clsx(styles.button, styles.danger),
  quiet: clsx(styles.button, styles.quiet),
  small: styles.small,
  panel: styles.panel,
  panelPad: clsx(styles.panel, styles.panelPad),
  srOnly: styles.srOnly,
  spin: styles.spin,
  stamp: styles.stamp,
  notice: styles.notice,
  noticeOk: clsx(styles.notice, styles.noticeOk),
  noticeError: clsx(styles.notice, styles.noticeError),
  noticeInfo: clsx(styles.notice, styles.noticeInfo),
};
