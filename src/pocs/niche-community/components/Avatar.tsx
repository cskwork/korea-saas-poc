import styles from "./avatar.module.css";

const TONES = [styles.tone0, styles.tone1, styles.tone2, styles.tone3, styles.tone4, styles.tone5];

function toneFor(id: string): string {
  let hash = 0;
  for (const char of id) hash = (hash * 31 + char.charCodeAt(0)) | 0;
  return TONES[Math.abs(hash) % TONES.length];
}

interface AvatarProps {
  id: string;
  nickname: string;
  size?: "sm" | "md" | "lg" | "xl";
  /** Operators wear a ring (the stage-manager's pass). */
  operator?: boolean;
}

/** A member's initial on a tone derived from their id (team-slide portrait). */
export function Avatar({ id, nickname, size = "md", operator = false }: AvatarProps) {
  return (
    <span className={`${styles.avatar} ${styles[size]} ${toneFor(id)} ${operator ? styles.operator : ""}`} aria-hidden="true">
      {nickname.slice(0, 1)}
    </span>
  );
}
