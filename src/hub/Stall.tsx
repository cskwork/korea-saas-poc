import type { CSSProperties } from "react";
import { ArrowRight, Plus } from "lucide-react";
import type { ModuleMeta } from "@/core/modules/meta";
import { signLettering } from "./contrast";
import styles from "./hub.module.css";

type PaintedStyle = CSSProperties & { "--paint": string; "--paint-ink": string; "--i": number };

/**
 * One shop front: painted sign, number plate, and the shop window. `index` staggers
 * the shutter as the arcade opens on load.
 */
export function Stall({ meta, plate, index }: { meta: ModuleMeta; plate: string; index: number }) {
  const paint: PaintedStyle = { "--paint": meta.accent, "--paint-ink": signLettering(meta.accent), "--i": index };

  return (
    <li className={styles.stall} style={paint}>
      {/* A full page load keeps each product's styles isolated from the hub. */}
      <a href={`/${meta.slug}`} className={styles.stallLink}>
        <span className={styles.sign}>{meta.name}</span>
        <span className={styles.front}>
          <span className={styles.stallMeta}>
            <span className={styles.plate}>{plate}</span>
            <span className={styles.category}>{meta.category}</span>
          </span>
          <span className={styles.tagline}>{meta.tagline}</span>
          <span className={styles.interior}>
            <span className={styles.description}>{meta.description}</span>
            <span className={styles.audience}>{meta.audience}</span>
            <span className={styles.enter}>
              들어가기
              <ArrowRight aria-hidden size={16} strokeWidth={2.25} />
            </span>
            <span className={styles.shutter} aria-hidden />
          </span>
        </span>
      </a>
    </li>
  );
}

/** The empty unit at the end of the arcade: room for the next module. */
export function VacantStall({ plate, href }: { plate: string; href: string }) {
  return (
    <li className={`${styles.stall} ${styles.vacant}`}>
      <a href={href} className={styles.stallLink} target="_blank" rel="noreferrer">
        <span className={styles.sign}>빈 점포</span>
        <span className={styles.front}>
          <span className={styles.stallMeta}>
            <span className={styles.plate}>{plate}</span>
            <span className={styles.category}>입점 준비 중</span>
          </span>
          <span className={styles.tagline}>모듈 하나를 더하면 이 자리에 새 가게가 걸립니다.</span>
          <span className={styles.vacantNote}>
            <Plus aria-hidden size={16} strokeWidth={2.25} />
            새 가게를 여는 방법
          </span>
        </span>
      </a>
    </li>
  );
}
