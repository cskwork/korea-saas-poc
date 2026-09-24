import ui from "../ui/ui.module.css";
import styles from "./letter.module.css";

/** The letter's front page while it loads: the nameplate column and the reply card. */
export function LetterSkeleton() {
  return (
    <div className={styles.front} aria-busy="true" aria-label="레터를 불러오는 중">
      <div className={styles.frontText}>
        <span className={ui.skeleton} style={{ width: "70%", height: 88 }} />
        <span className={ui.skeleton} style={{ width: "90%", height: 22 }} />
        <span className={ui.skeleton} style={{ width: "60%", height: 22 }} />
      </div>
      <span className={ui.skeleton} style={{ height: 320 }} />
    </div>
  );
}
