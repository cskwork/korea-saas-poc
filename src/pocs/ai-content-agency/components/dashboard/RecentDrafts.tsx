import Link from "next/link";
import { formatNumber, formatRelative } from "@/core/format";
import type { DraftSource } from "../../db/schema";
import { KIND_LABEL, countCharacters, type ContentKind } from "../../domain/content";
import { Empty } from "../ui/PageHeader";
import { SourceTag } from "../ui/Tags";
import ui from "../ui/ui.module.css";
import styles from "./dashboard.module.css";

interface RecentDraft {
  id: string;
  kind: ContentKind;
  title: string;
  body: string;
  source: DraftSource;
  currentVersion: number;
  updatedAt: Date;
}

export function RecentDrafts({ drafts }: { drafts: RecentDraft[] }) {
  return (
    <section className={`${styles.section} ${styles.recent}`} aria-labelledby="recent-title">
      <div className={styles.sectionHead}>
        <h2 id="recent-title" className={styles.sectionLabel}>
          최근 손본 원고
        </h2>
        <Link href="/ai-content-agency/drafts">원고함</Link>
      </div>
      {drafts.length === 0 ? (
        <Empty title="아직 쓴 원고가 없어요.">
          <Link href="/ai-content-agency/write">첫 시안 쓰기</Link>
        </Empty>
      ) : (
        <ul className={styles.recentList} role="list">
          {drafts.map((draft) => (
            <li key={draft.id} className={styles.recentItem}>
              <span className={ui.swatch} data-kind={draft.kind} aria-hidden="true" />
              <Link href={`/ai-content-agency/drafts/${draft.id}`} className={styles.recentTitle}>
                {draft.title}
              </Link>
              <span className={styles.recentTime}>{formatRelative(draft.updatedAt)}</span>
              <span className={styles.recentMeta}>
                <span>{KIND_LABEL[draft.kind]}</span>
                <SourceTag source={draft.source} />
                <span>v{draft.currentVersion}</span>
                <span>{formatNumber(countCharacters(draft.body).withSpaces)}자</span>
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
