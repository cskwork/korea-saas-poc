import Link from "next/link";
import { buttonClass } from "./button";
import { Cell } from "./Cells";
import styles from "./StatusView.module.css";

/** 404 inside the workspace: the id is missing, deleted, or belongs to another workspace. */
export function NotFoundView({ title, href, back }: { title: string; href: string; back: string }) {
  return (
    <div className={styles.view}>
      <div className={styles.cells} aria-hidden="true">
        {Array.from({ length: 7 }, (_, i) => (
          <Cell key={i} state={i === 3 ? "warn" : "hollow"} size={14} />
        ))}
      </div>
      <h1 className={styles.title}>{title}</h1>
      <p className={styles.text}>삭제되었거나 주소가 잘못되었어요. 다른 작업공간의 항목도 열 수 없어요.</p>
      <Link href={href} className={buttonClass("primary")}>
        {back}
      </Link>
    </div>
  );
}
