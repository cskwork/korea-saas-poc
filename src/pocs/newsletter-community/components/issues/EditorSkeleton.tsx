import ui from "../ui/ui.module.css";
import styles from "./editor.module.css";

/** The editor's shape while it loads: a writing sheet and the send panel. */
export function EditorSkeleton() {
  return (
    <div className={styles.editor} aria-busy="true" aria-label="원고를 불러오는 중">
      <span className={ui.skeleton} style={{ height: 40 }} />
      <div className={styles.columns}>
        <div className={styles.manuscript}>
          <span className={ui.skeleton} style={{ width: "70%", height: 40 }} />
          <span className={ui.skeleton} style={{ width: "90%", height: 22 }} />
          <span className={ui.skeleton} style={{ height: 380 }} />
        </div>
        <div className={styles.panel}>
          {Array.from({ length: 5 }, (_, i) => (
            <span key={i} className={ui.skeleton} style={{ height: 44 }} />
          ))}
        </div>
      </div>
    </div>
  );
}
