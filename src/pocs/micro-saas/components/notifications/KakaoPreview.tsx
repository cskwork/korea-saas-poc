import type { KakaoMessage } from "../../domain/notifications";
import { SealLogo } from "../world/Stamp";
import styles from "./notifications.module.css";

/**
 * The 알림톡 as it lands in KakaoTalk. This one surface keeps Kakao's own chat ground,
 * bubble and yellow button: it previews a real third-party screen, not the ledger.
 */
export function KakaoPreview({ shopName, message, sentAt }: { shopName: string; message: KakaoMessage | null; sentAt: string }) {
  return (
    <div className={styles.kakao} aria-label="카카오톡 알림톡 미리보기" role="region" aria-live="polite">
      <div className={styles.kakaoHead}>
        <span className={styles.avatar} aria-hidden="true">
          <SealLogo grain={false} />
        </span>
        <div>
          <p className={styles.kakaoTitle}>예약잇다 알림</p>
          <p className={styles.kakaoSub}>{shopName}</p>
        </div>
      </div>
      {message ? (
        <div className={styles.kakaoRow}>
          <span className={`${styles.avatar} ${styles.small}`} aria-hidden="true">
            <SealLogo grain={false} />
          </span>
          <div>
            <div className={styles.bubble}>
              <p className={styles.kTitle}>{message.title}</p>
              <div className={styles.kBody}>
                {message.lines.map((line) => (
                  <p key={line}>{line}</p>
                ))}
                <dl className={`${styles.kBox}${message.voided ? ` ${styles.kVoid}` : ""}`}>
                  {message.details.map((d) => (
                    <div key={d.label}>
                      <dt>{d.label}</dt>
                      <dd>{message.voided ? <s>{d.value}</s> : d.value}</dd>
                    </div>
                  ))}
                </dl>
                <p className={styles.kNote}>{message.note}</p>
              </div>
              <div className={styles.kActions}>
                {message.buttons.map((label, i) => (
                  <span key={label} className={`${styles.kBtn}${i === 0 ? ` ${styles.kMain}` : ""}`}>
                    {label}
                  </span>
                ))}
              </div>
            </div>
            <p className={styles.time}>{sentAt}</p>
          </div>
        </div>
      ) : (
        <p className={styles.kEmpty}>보낼 예약이 생기면 여기에 메시지가 나타나요.</p>
      )}
    </div>
  );
}
