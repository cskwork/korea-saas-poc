import Link from "next/link";
import styles from "./Segments.module.css";

export interface Segment {
  href: string;
  label: string;
  count?: number;
  current: boolean;
}

/** Filter tabs as links (the URL holds the filter, so it survives reloads and sharing). */
export function Segments({ items, label }: { items: Segment[]; label: string }) {
  return (
    <nav aria-label={label} className={styles.segments}>
      {items.map((item) => (
        <Link key={item.href} href={item.href} className={styles.segment} aria-current={item.current ? "page" : undefined} scroll={false}>
          {item.label}
          {item.count !== undefined ? <span className={styles.count}>{item.count}</span> : null}
        </Link>
      ))}
    </nav>
  );
}
