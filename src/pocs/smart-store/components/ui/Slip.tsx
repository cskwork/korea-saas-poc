import clsx from "clsx";
import type { ReactNode } from "react";
import styles from "./ui.module.css";

interface SlipProps {
  title?: ReactNode;
  meta?: ReactNode;
  /** id for aria-labelledby on the section */
  titleId?: string;
  className?: string;
  bodyClassName?: string;
  /** Render children without the padded body (tables, lists that bleed to the edges). */
  flush?: boolean;
  children: ReactNode;
}

/** A white slip of paper on the market floor: the container every list and form sits on. */
export function Slip({ title, meta, titleId, className, bodyClassName, flush, children }: SlipProps) {
  return (
    <section className={clsx(styles.slip, className)} aria-labelledby={title && titleId ? titleId : undefined}>
      {title ? (
        <div className={styles.slipHead}>
          <h2 className={styles.slipTitle} id={titleId}>
            {title}
          </h2>
          {meta ? <div className={styles.slipMeta}>{meta}</div> : null}
        </div>
      ) : null}
      {flush ? children : <div className={clsx(styles.slipBody, bodyClassName)}>{children}</div>}
    </section>
  );
}
