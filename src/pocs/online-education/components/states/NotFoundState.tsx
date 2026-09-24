import Link from "next/link";
import clsx from "clsx";
import ui from "../ui/ui.module.css";
import styles from "./states.module.css";

export function NotFoundState({ title, text, href, action }: { title: string; text: string; href: string; action: string }) {
  return (
    <section className={styles.state}>
      <svg className={styles.stateMark} width="96" height="64" viewBox="0 0 96 64" aria-hidden>
        <rect x="1" y="1" width="94" height="62" rx="8" className={styles.markGround} />
        <rect x="10" y="10" width="22" height="18" rx="3" className={styles.markBlock} />
        <rect x="37" y="10" width="22" height="34" rx="3" className={styles.markHole} />
        <rect x="64" y="10" width="22" height="24" rx="3" className={styles.markBlock} />
      </svg>
      <h1 className={styles.stateTitle}>{title}</h1>
      <p className={styles.stateText}>{text}</p>
      <Link href={href} className={clsx(ui.button, ui.primary)}>
        {action}
      </Link>
    </section>
  );
}
