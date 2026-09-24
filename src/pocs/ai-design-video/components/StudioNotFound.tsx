import Link from "next/link";
import { josa } from "../domain/josa";
import { Frame } from "./frame/Frame";
import { paths } from "./paths";
import ui from "./ui.module.css";
import styles from "./states.module.css";

export function StudioNotFound({ what = "페이지" }: { what?: string }) {
  return (
    <div className={styles.state}>
      <Frame type="thumbnail" medium="sketch" height={90} />
      <h1 className={styles.title}>찾는 {josa(what, "이/가")} 이 콘티에 없어요</h1>
      <p className={styles.text}>
        삭제되었거나 주소가 잘못되었을 수 있어요. 데모 데이터를 초기화했다면 이전 링크는 더 이상 열리지 않아요.
      </p>
      <div className={styles.actions}>
        <Link href={paths.orders} className={ui.button}>
          주문 목록으로
        </Link>
        <Link href={paths.today} className={[ui.button, ui.secondary].join(" ")}>
          오늘의 콘티
        </Link>
      </div>
    </div>
  );
}
