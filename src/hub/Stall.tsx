import type { CSSProperties } from "react";
import { ArrowRight, Plus } from "lucide-react";
import type { ModuleMeta } from "@/core/modules/meta";
import { isModuleOpen, legacyDemoPath } from "@/pocs/slugs";
import { signPaint } from "./contrast";
import styles from "./hub.module.css";

type PaintedStyle = CSSProperties & { "--paint": string; "--paint-ink": string; "--i": number };

export type Side = "upper" | "lower";

/**
 * One shop: a painted sign (name, trade, unit plate) against the aisle, and the
 * shop window behind it. `index` staggers the shutter as the arcade opens.
 * A shop still being rebuilt keeps its shutter down and points to its old static demo.
 */
export function Stall({ meta, plate, side, index }: { meta: ModuleMeta; plate: string; side: Side; index: number }) {
  const sign = signPaint(meta.accent);
  const paint: PaintedStyle = { "--paint": sign.paint, "--paint-ink": sign.ink, "--i": index };
  const open = isModuleOpen(meta.slug);

  return (
    <li className={`${styles.stall} ${styles[side]} ${open ? "" : styles.preparing}`} style={paint}>
      {/* A full page load keeps each product's styles isolated from the hub. */}
      <a href={open ? `/${meta.slug}` : legacyDemoPath(meta.slug)} className={styles.stallLink}>
        <span className={styles.sign}>
          <span className={styles.signName}>{meta.name}</span>
          <span className={styles.signTrade}>
            {meta.category}
            <ArrowRight className={styles.signArrow} aria-hidden size={16} strokeWidth={2.5} />
          </span>
          <span className={styles.plate}>{plate}</span>
        </span>
        <span className={styles.front}>
          <span className={styles.tagline}>{meta.tagline}</span>
          <span className={styles.window}>
            <span className={styles.description}>{meta.description}</span>
            <span className={styles.shutter} aria-hidden />
            {!open && <span className={styles.shutterNotice}>리뉴얼 공사 중 · 이전 데모 열기</span>}
          </span>
        </span>
      </a>
    </li>
  );
}

/** An empty unit: room for the next shop. */
export function VacantStall({
  plate,
  href,
  side,
  endCap = false,
}: {
  plate: string;
  href: string;
  side: Side;
  endCap?: boolean;
}) {
  return (
    <li className={`${styles.stall} ${styles[side]} ${styles.vacant} ${endCap ? styles.endCap : ""}`}>
      <a href={href} className={styles.stallLink} target="_blank" rel="noreferrer">
        <span className={styles.sign}>
          <span className={styles.signName}>빈 점포</span>
          <span className={styles.signTrade}>입점 준비 중</span>
          <span className={styles.plate}>{plate}</span>
        </span>
        <span className={styles.front}>
          <span className={styles.tagline}>새 가게가 들어올 자리</span>
          <span className={styles.vacantNote}>
            <Plus aria-hidden size={16} strokeWidth={2.25} />
            입점 안내
          </span>
        </span>
      </a>
    </li>
  );
}
