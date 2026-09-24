import type { ChannelSummary } from "../server/types";
import { AdminNav } from "./AdminNav";
import { ChannelManager } from "./ChannelManager";
import styles from "./admin.module.css";
import ui from "./ui.module.css";

export function ChannelAdminPage({ channels, now }: { channels: ChannelSummary[]; now: Date }) {
  return (
    <div className={`${ui.page} ${ui.pageNarrow} ${styles.page}`}>
      <header className={styles.header}>
        <div>
          <h1 className={ui.pageTitle}>채널 관리</h1>
          <p className={ui.pageLead}>피드 왼쪽 목차에 이 순서대로 보여요. 대외비 채널은 프리미엄 멤버만 읽고 쓸 수 있어요.</p>
        </div>
        <AdminNav />
      </header>
      <ChannelManager channels={channels} now={now.toISOString()} />
    </div>
  );
}
