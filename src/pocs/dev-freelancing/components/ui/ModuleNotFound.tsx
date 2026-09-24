import Link from "next/link";
import { buttonClass } from "./button";
import { Cell } from "./Cells";
import styles from "./StatusView.module.css";

/** 404 for any unknown path under /dev-freelancing (outside the workspace frame). */
export function ModuleNotFound() {
  return (
    <main className={styles.standalone}>
      <div className={styles.view}>
        <div className={styles.cells} aria-hidden="true">
          {Array.from({ length: 7 }, (_, i) => (
            <Cell key={i} state={i === 3 ? "warn" : "hollow"} size={14} />
          ))}
        </div>
        <h1 className={styles.title}>없는 페이지예요</h1>
        <p className={styles.text}>주소가 바뀌었거나 잘못 입력했어요. DevFlow 개요에서 다시 시작하세요.</p>
        <Link href="/dev-freelancing" className={buttonClass("primary")}>
          DevFlow 개요로
        </Link>
      </div>
    </main>
  );
}
