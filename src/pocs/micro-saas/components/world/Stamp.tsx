import type { CSSProperties } from "react";
import type { BookingStatus } from "../../db/schema";
import { STATUS_LABEL, stampTilt } from "../../domain/status";
import styles from "./stamp.module.css";

/** Filter id of the shared ink-grain impression (rendered once by <InkDefs />). */
export const INK_FILTER = "url(#ms-ink)";

/** The shared SVG ink-grain filter: every seal gets a slightly uneven impression. */
export function InkDefs() {
  return (
    <svg className={styles.defs} width="0" height="0" aria-hidden="true" focusable="false">
      <defs>
        <filter id="ms-ink" x="-10%" y="-10%" width="120%" height="120%">
          <feTurbulence type="fractalNoise" baseFrequency="1.4" numOctaves={1} seed={7} result="noise" />
          <feColorMatrix in="noise" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  -0.9 0 0 0 1.3" result="grain" />
          <feComposite in="SourceGraphic" in2="grain" operator="in" result="grained" />
          <feTurbulence type="fractalNoise" baseFrequency="0.05" numOctaves={1} seed={2} result="warp" />
          <feDisplacementMap in="grained" in2="warp" scale={1.2} xChannelSelector="R" yChannelSelector="G" />
        </filter>
      </defs>
    </svg>
  );
}

const tiltStyle = (deg: number) => ({ "--tilt": `${deg}deg` }) as CSSProperties;

/**
 * The 결재 mark for a booking: round seal (확정), dashed box (대기), void stamp (취소).
 * `fresh` plays the stamp press once, on mount.
 */
export function Stamp({ status, id, fresh = false }: { status: BookingStatus; id: string; fresh?: boolean }) {
  const label = STATUS_LABEL[status];
  const freshClass = fresh ? ` ${styles.fresh}` : "";
  if (status === "confirmed") {
    return (
      <span className={`${styles.stamp} ${styles.confirmed}${freshClass}`} style={tiltStyle(stampTilt(id))} role="img" aria-label={label}>
        <svg viewBox="0 0 60 60" aria-hidden="true">
          <g filter={INK_FILTER}>
            <circle cx="30" cy="30" r="26" className={styles.ring} />
            <circle cx="30" cy="30" r="21.5" className={`${styles.ring} ${styles.thin}`} />
            <text x="30" y="36.5" textAnchor="middle" className={styles.text}>
              {label}
            </text>
          </g>
        </svg>
      </span>
    );
  }
  if (status === "cancelled") {
    return (
      <span className={`${styles.stamp} ${styles.cancelled}${freshClass}`} style={tiltStyle(stampTilt(id) - 4)} role="img" aria-label={label}>
        <svg viewBox="0 0 72 40" aria-hidden="true">
          <g filter={INK_FILTER}>
            <rect x="3" y="3" width="66" height="34" className={styles.ring} />
            <rect x="7" y="7" width="58" height="26" className={`${styles.ring} ${styles.thin}`} />
            <text x="36" y="27.5" textAnchor="middle" className={styles.text}>
              {label}
            </text>
          </g>
        </svg>
      </span>
    );
  }
  return (
    <span className={`${styles.stamp} ${styles.pending}${freshClass}`} role="img" aria-label={label}>
      <span aria-hidden="true">{label}</span>
    </span>
  );
}

/** A round cinnabar seal with a word in it: 접수 on the receipt, 인기 / 사용 중 on plans. */
export function RoundSeal({
  text,
  className,
  tilt = -8,
  fresh = false,
}: {
  text: string;
  className?: string;
  tilt?: number;
  fresh?: boolean;
}) {
  const long = text.length > 2;
  return (
    <span
      className={`${styles.roundSeal}${fresh ? ` ${styles.fresh}` : ""}${className ? ` ${className}` : ""}`}
      style={tiltStyle(tilt)}
      aria-hidden="true"
    >
      <svg viewBox="0 0 120 120">
        <g filter={INK_FILTER}>
          <circle cx="60" cy="60" r="52" className={styles.ring} />
          <circle cx="60" cy="60" r="44" className={`${styles.ring} ${styles.thin}`} />
          <text x="60" y={long ? 69 : 72} textAnchor="middle" className={`${styles.text} ${long ? styles.mid : styles.big}`}>
            {text}
          </text>
        </g>
      </svg>
    </span>
  );
}

/** The brand seal: 예약 / 잇다 carved in a cinnabar square. */
export function SealLogo({ className, grain = true, label }: { className?: string; grain?: boolean; label?: string }) {
  return (
    <svg
      className={`${styles.sealLogo}${className ? ` ${className}` : ""}`}
      viewBox="0 0 64 64"
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      focusable="false"
    >
      <rect x="3" y="3" width="58" height="58" rx="3" className={styles.sealBg} filter={grain ? INK_FILTER : undefined} />
      <text x="32" y="29" textAnchor="middle" className={styles.sealText}>
        예약
      </text>
      <text x="32" y="53" textAnchor="middle" className={styles.sealText}>
        잇다
      </text>
    </svg>
  );
}

/** Small legend marks (tally, legends): round, dashed, rectangle. */
export function Mark({ status }: { status: BookingStatus }) {
  return <span className={`${styles.mark} ${styles[`mark-${status}`]}`} aria-hidden="true" />;
}
