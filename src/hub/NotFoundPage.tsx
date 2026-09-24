import { signFace } from "./fonts";
import styles from "./hub.module.css";

/** Site-wide 404, drawn as a vacant unit in the arcade. */
export function NotFoundPage() {
  return (
    <div className={`${styles.root} ${signFace.variable}`}>
      <main className={styles.lost}>
        <p className={styles.lostPlate}>404</p>
        <h1 className={styles.lostTitle}>이 자리에는 가게가 없어요</h1>
        <p className={styles.lostBody}>주소가 바뀌었거나 없는 페이지입니다. 안내도에서 가게를 다시 골라 주세요.</p>
        <a className={styles.lostLink} href="/">
          안내도로 돌아가기
        </a>
      </main>
    </div>
  );
}
