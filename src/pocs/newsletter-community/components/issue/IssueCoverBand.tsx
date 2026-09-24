import clsx from "clsx";
import type { ReactNode } from "react";
import { coverInk } from "../cover";
import theme from "../theme.module.css";
import styles from "./issue.module.css";

/** The issue's cover band: its ink, its number, its title and standfirst. */
export function IssueCoverBand({
  number,
  pending = false,
  title,
  lede,
  meta,
  headingLevel = "h1",
  titleId,
}: {
  number: number;
  /** The number is only expected (unpublished). */
  pending?: boolean;
  title: string;
  lede?: string;
  meta: ReactNode;
  headingLevel?: "h1" | "h2";
  titleId?: string;
}) {
  const Heading = headingLevel;
  return (
    <header className={clsx(styles.band, theme[`ink-${coverInk(number)}`])}>
      <div className={styles.bandInner}>
        <p className={styles.bandNumber}>
          <span className={styles.affix}>제</span>
          {number}
          <span className={styles.affix}>호{pending && " (예정)"}</span>
        </p>
        <Heading className={styles.bandTitle} id={titleId}>{title || "제목 없음"}</Heading>
        {lede && <p className={styles.bandLede}>{lede}</p>}
        <div className={styles.bandMeta}>{meta}</div>
      </div>
    </header>
  );
}
