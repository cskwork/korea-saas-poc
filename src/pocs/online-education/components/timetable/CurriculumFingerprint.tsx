import type { CourseColor } from "../../db/schema";
import styles from "./timetable.module.css";

/**
 * A course's timetable silhouette: one column per section, one block per lesson,
 * block height proportional to running time. Replaces the stock thumbnail.
 */
export function CurriculumFingerprint({
  shape,
  color,
  width = 72,
  height = 54,
}: {
  shape: number[][];
  color: CourseColor;
  width?: number;
  height?: number;
}) {
  const columns = shape.filter((section) => section.length > 0);
  const gap = 2;
  const longest = Math.max(1, ...columns.map((section) => section.reduce((sum, s) => sum + s, 0)));
  const inner = width - 8;
  const columnWidth = columns.length > 0 ? (inner - gap * (columns.length - 1)) / columns.length : inner;

  return (
    <svg className={styles.fingerprint} data-color={color} width={width} height={height} viewBox={`0 0 ${width} ${height}`} aria-hidden>
      <rect className={styles.fingerprintGround} x="0.5" y="0.5" width={width - 1} height={height - 1} rx="5" />
      {columns.length === 0 ? (
        <rect className={styles.fingerprintEmpty} x="6" y="6" width={width - 12} height={height - 12} rx="3" />
      ) : (
        columns.map((section, column) => {
          const usable = height - 8 - gap * (section.length - 1);
          let y = 4;
          return section.map((seconds, row) => {
            const h = Math.max(2, (seconds / longest) * usable);
            const rect = (
              <rect
                key={`${column}-${row}`}
                className={styles.fingerprintBlock}
                x={4 + column * (columnWidth + gap)}
                y={y}
                width={Math.max(2, columnWidth)}
                height={h}
                rx="1.5"
              />
            );
            y += h + gap;
            return rect;
          });
        })
      )}
    </svg>
  );
}
